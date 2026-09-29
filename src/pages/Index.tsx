
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

const Index = () => {
  const [showCode, setShowCode] = useState(readShowCode);
  const [runQueue, setRunQueue] = useState<string[]>([]);
  const [report, setReport] = useState<RunResult[]>([]);
  const runId = useRef(0);
  const runTitles = useRef<Record<string, string>>({});
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
                    {report.length > 0 && !runningAll && (
                      <div className="rounded-md border px-3 py-2 text-sm">
                        <p className="font-medium text-foreground">
                          {report.filter(result => !result.ok).length === 0
                            ? `${report.length} passed.`
                            : `${report.filter(result => result.ok).length} passed, ${report.filter(result => !result.ok).length} failed.`}
                        </p>
                        {report.some(result => !result.ok) && (
                          <p className="mt-1 text-muted-foreground">
                            Failed: {report.filter(result => !result.ok).map(result => result.title).join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <CodeSnippetContainer
                    snippets={currentTopic.snippets}
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
