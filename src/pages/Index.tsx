
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CodeSnippetContainer } from "@/components/CodeSnippetContainer";
import { PermissionGuide } from "@/components/PermissionGuide";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { topicsData } from "@/snippets/_data";

import type { SnippetResult } from '@/lib/snippet-runner';

const SHOW_CODE_KEY = "fast-wallet-show-code";

function readShowCode() {
  try {
    return localStorage.getItem(SHOW_CODE_KEY) === "1";
  } catch {
    return false;
  }
}

type RunResult = SnippetResult & { id: string; title: string };

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
  const stopAfterCurrent = useRef(false);
  const [runningSnippet, setRunningSnippet] = useState<string | null>(null);
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
  const previousTopic = useRef(currentTopic.id);

  useEffect(() => {
    // Also invalidate reports after browser history / direct query changes.
    if (previousTopic.current === currentTopic.id) return;
    previousTopic.current = currentTopic.id;
    runId.current += 1;
    stopAfterCurrent.current = true;
    setRunQueue([]);
    setReport([]);
  }, [currentTopic.id]);

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

  const runIndividually = currentTopic.id === "permissions" || currentTopic.runIndividually;
  const isMatrix = ["branch-matrices", "funded-workflows", "certificate-workflows"].includes(currentTopic.id);
  const handleRunningChange = (id: string | null) => {
    if (id && !runQueue.length) stopAfterCurrent.current = false;
    setRunningSnippet(id);
  };

  const changeTopic = (topicId: string) => {
    if (runningSnippet || runQueue.length > 0) return;
    runId.current += 1;
    setRunQueue([]);
    setReport([]);
    navigate({ search: `?topic=${topicId}` }, { replace: true });
  };

  const runAll = () => {
    if (!currentTopic || runQueue.length > 0 || runningSnippet || runIndividually) return;
    stopAfterCurrent.current = false;
    runId.current += 1;
    setReport([]);
    setRunQueue(currentTopic.snippets.map(snippet => snippet.id));
  };

  const handleRunComplete = (id: string, result: SnippetResult, token: number) => {
    if (token !== runId.current) return;
    setRunQueue(queue => queue[0] === id ? (stopAfterCurrent.current ? [] : queue.slice(1)) : queue);
    setReport(results => [
      ...results.filter(previous => previous.id !== id),
      { id, title: currentTopic.snippets.find(snippet => snippet.id === id)?.title ?? id, ...result },
    ]);
  };

  const downloadReport = () => {
    // Summaries only: omit wallet payloads, output logs, keys and transaction data.
    const summary = {
      schemaVersion: 1,
      topic: currentTopic.id,
      exportedAt: new Date().toISOString(),
      results: report.map(({ id, title, status, durationMs, errorCode, cases }) => ({
        id, title, status, durationMs, errorCode,
        ...(cases ? { cases: cases.map(({ id, status, durationMs, errorCode }) => ({ id, status, durationMs, errorCode })) } : {}),
      })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fast-wallet-${currentTopic.id}-results.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const runningAll = runQueue.length > 0;
  const runProgress = report.length + (runningAll ? 1 : 0);
  const passedCount = report.filter(result => result.status === 'passed').length;
  const failedCount = report.filter(result => result.status === 'failed').length;
  const skippedCount = report.filter(result => result.status === 'skipped').length;
  const showScore = report.length > 0 && !runningAll && !runningSnippet;
  const failedIds = new Set(report.filter(result => result.status === 'failed').map(result => result.id));
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
              {currentTopic.snippets.length > 0 && <>
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
              </>}
              {!runIndividually && <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 bg-green-600 text-white hover:bg-green-700"
                onClick={runAll}
                disabled={!currentTopic || runningAll || !!runningSnippet}
              >
                {runningAll
                  ? `Running ${currentTopic?.snippets.find(snippet => snippet.id === runQueue[0])?.title ?? ""} (${runProgress} of ${currentTopic?.snippets.length})`
                  : currentTopic?.id === "conformance"
                    ? "Run conformance"
                    : "Run all"}
              </Button>}
              {(runningAll || (runningSnippet && isMatrix)) && <Button type="button" variant="outline" size="sm" onClick={() => { stopAfterCurrent.current = true; setRunQueue(queue => queue.slice(0, 1)); }}>{runningAll ? "Stop after current" : "Stop after current case"}</Button>}
              {report.length > 0 && !runningAll && !runningSnippet && <Button type="button" variant="outline" size="sm" onClick={downloadReport}>Download results</Button>}
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
                    {(runningSnippet || runningAll) && <p role="status" className="text-sm text-muted-foreground">A wallet request is running. Finish or dismiss its wallet prompt before starting another test or changing categories.</p>}
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
                            {skippedCount > 0 && <span className="rounded-md bg-muted px-2 py-1 font-medium">{skippedCount} skipped</span>}
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
                          <p className="mt-3 text-sm text-muted-foreground">{skippedCount > 0 ? "Completed checks passed; skipped checks need another run." : "All completed checks passed."}</p>
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
                  {currentTopic.id === "brc116" && <PermissionGuide onRunningChange={setRunningSnippet} />}
                  <CodeSnippetContainer
                    snippets={visibleSnippets}
                    ordinals={ordinals}
                    showCode={showCode}
                    autoRunId={runQueue[0] ?? null}
                    runToken={runId.current}
                    runAllActive={runningAll}
                    onRunComplete={handleRunComplete}
                    anySnippetRunning={!!runningSnippet}
                    onRunningChange={handleRunningChange}
                    shouldStop={() => stopAfterCurrent.current}
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
