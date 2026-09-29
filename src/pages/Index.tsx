
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CodeSnippetContainer } from "@/components/CodeSnippetContainer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { topicsData } from "@/snippets/_data";

const SHOW_CODE_KEY = "fast-wallet-show-code";

function readShowCode() {
  try {
    return localStorage.getItem(SHOW_CODE_KEY) === "1";
  } catch {
    return false;
  }
}

type RunResult = { id: string; title: string; ok: boolean };

function orderWithFailuresFirst<T extends { id: string }>(snippets: T[], failedIds: Set<string>): T[] {
  const order = new Map(snippets.map((snippet, index) => [snippet.id, index]));
  return [...snippets].sort((left, right) => {
    const leftGroup = failedIds.has(left.id) ? 0 : 1;
    const rightGroup = failedIds.has(right.id) ? 0 : 1;
    if (leftGroup !== rightGroup) return leftGroup - rightGroup;
    return (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0);
  });
}

const Index = () => {
  const [showCode, setShowCode] = useState(readShowCode);
  const [runQueue, setRunQueue] = useState<string[]>([]);
  const [report, setReport] = useState<RunResult[]>([]);
  const runId = useRef(0);
  const runTitles = useRef<Record<string, string>>({});
  const scoreRef = useRef<HTMLElement>(null);
  const sawRunning = useRef(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const snippetId = searchParams.get("snippet");
  const topicFromSnippet = snippetId
    ? topicsData.find(topic => topic.snippets.some(snippet => snippet.id === snippetId))
    : undefined;
  const topicFromQuery = topicsData.find(topic => topic.id === searchParams.get("topic"));
  const currentTopic = topicFromSnippet ?? topicFromQuery ?? topicsData[0];

  useEffect(() => {
    try {
      localStorage.setItem(SHOW_CODE_KEY, showCode ? "1" : "0");
    } catch {
      // Preference is optional when storage is blocked.
    }
  }, [showCode]);

  useEffect(() => {
    if (!snippetId) return;
    const handle = window.setTimeout(() => {
      document.getElementById(snippetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(handle);
  }, [snippetId, currentTopic.id]);

  const changeTopic = (topicId: string) => {
    runId.current += 1;
    setRunQueue([]);
    setReport([]);
    navigate({ search: `?topic=${topicId}` }, { replace: true });
  };

  const runAll = () => {
    if (!currentTopic || runQueue.length > 0) return;
    runId.current += 1;
    runTitles.current = Object.fromEntries(
      currentTopic.snippets.map(snippet => [snippet.id, snippet.title])
    );
    setReport([]);
    setRunQueue(currentTopic.snippets.map(snippet => snippet.id));
  };

  const handleAutoRunComplete = (id: string, ok: boolean, token: number) => {
    if (token !== runId.current) return;
    setRunQueue(queue => (queue[0] === id ? queue.slice(1) : queue));
    setReport(results => {
      if (results.some(result => result.id === id)) return results;
      return [...results, { id, title: runTitles.current[id] ?? id, ok }];
    });
  };

  const runningAll = runQueue.length > 0;
  const runProgress = currentTopic
    ? currentTopic.snippets.length - runQueue.length + (runningAll ? 1 : 0)
    : 0;
  const passedCount = report.filter(result => result.ok).length;
  const failedCount = report.length - passedCount;
  const showScore = report.length > 0 && !runningAll;
  const failedIds = new Set(report.filter(result => !result.ok).map(result => result.id));
  const visibleSnippets = currentTopic && showScore
    ? orderWithFailuresFirst(currentTopic.snippets, failedIds)
    : currentTopic?.snippets ?? [];
  const ordinals = Object.fromEntries(
    (currentTopic?.snippets ?? []).map((snippet, index) => [snippet.id, index])
  );

  useEffect(() => {
    if (runningAll) {
      sawRunning.current = true;
      return;
    }
    if (!sawRunning.current || report.length === 0) return;
    sawRunning.current = false;
    scoreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [runningAll, report.length]);

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">
        <AppSidebar
          topics={topicsData}
          selectedTopic={currentTopic.id}
          onTopicChange={changeTopic}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-center gap-2 px-3 py-2">
              <SidebarTrigger className="h-10 w-10 shrink-0" aria-label="Open examples menu" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {currentTopic?.title ?? "WalletClient Quickstart"}
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
              <label className="sr-only" htmlFor="snippet-jump">Jump to example</label>
              <select
                id="snippet-jump"
                className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                defaultValue=""
                onChange={(event) => {
                  const id = event.target.value;
                  event.target.value = "";
                  if (!id) return;
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <option value="">Jump to example</option>
                {currentTopic?.snippets.map(snippet => (
                  <option key={snippet.id} value={snippet.id}>{snippet.title}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                onClick={() => setShowCode(value => !value)}
              >
                {showCode ? "Hide code" : "Show code"}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 bg-green-600 text-white hover:bg-green-700"
                onClick={runAll}
                disabled={!currentTopic || runningAll}
              >
                {runningAll
                  ? `Running ${currentTopic?.snippets.find(snippet => snippet.id === runQueue[0])?.title ?? ""} (${runProgress} of ${currentTopic?.snippets.length})`
                  : currentTopic?.id === "conformance"
                    ? "Run conformance"
                    : "Run all"}
              </Button>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto max-w-4xl space-y-8 p-4 pb-16 sm:p-6">
              <div className="mb-8 text-center">
                <h1 className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                  WalletClient Quickstart
                </h1>
                <p className="text-base text-muted-foreground sm:text-xl">
                  Current BRC-100 snippets for BSV apps using @bsv/sdk v2
                </p>
              </div>

              {currentTopic && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                      {currentTopic.title}
                    </h2>
                    {currentTopic.description && (
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {currentTopic.description}
                      </p>
                    )}
                    {showScore && (
                      <section
                        id="run-score"
                        ref={scoreRef}
                        aria-label="Results"
                        className="scroll-mt-40 rounded-lg border border-border bg-card p-4 text-left shadow-lg"
                      >
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Score</p>
                            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                              {passedCount}
                              <span className="text-xl font-medium text-muted-foreground"> / {report.length}</span>
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="rounded-md bg-green-600 px-2 py-1 font-medium text-white">
                              {passedCount} passed
                            </span>
                            {failedCount > 0 && (
                              <span className="rounded-md bg-destructive px-2 py-1 font-medium text-destructive-foreground">
                                {failedCount} failed
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted"
                          role="img"
                          aria-label={`${passedCount} of ${report.length} passed`}
                        >
                          <div className="bg-green-600" style={{ width: `${(passedCount / report.length) * 100}%` }} />
                          <div className="bg-destructive" style={{ width: `${(failedCount / report.length) * 100}%` }} />
                        </div>
                        {failedCount === 0 ? (
                          <p className="mt-3 text-sm text-muted-foreground">Every method returned a valid response.</p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-muted-foreground">Failed methods are listed first.</p>
                            <div className="flex flex-wrap gap-2">
                              {currentTopic.snippets.filter(snippet => failedIds.has(snippet.id)).map(snippet => (
                                <Button
                                  key={snippet.id}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => {
                                    document.getElementById(snippet.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }}
                                >
                                  {ordinals[snippet.id] + 1}. {snippet.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                  <CodeSnippetContainer
                    snippets={visibleSnippets}
                    ordinals={ordinals}
                    showCode={showCode}
                    autoRunId={runQueue[0] ?? null}
                    runToken={runId.current}
                    runAllActive={runningAll}
                    onAutoRunComplete={handleAutoRunComplete}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
