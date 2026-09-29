import type { SnippetResult } from '@/lib/snippet-runner';

import { CodeSnippet } from "./CodeSnippet";

interface Snippet {
  id: string;
  title: string;
  explanation: string;
  code: string;
}

interface CodeSnippetContainerProps {
  snippets: Snippet[];
  ordinals: Record<string, number>;
  showCode: boolean;
  autoRunId: string | null;
  runToken: number;
  runAllActive: boolean;
  onRunComplete: (id: string, result: SnippetResult, token: number) => void;
  anySnippetRunning: boolean;
  onRunningChange: (id: string | null) => void;
  shouldStop?: () => boolean;
}

export function CodeSnippetContainer({
  snippets,
  ordinals,
  showCode,
  autoRunId,
  runToken,
  runAllActive,
  onRunComplete,
  anySnippetRunning,
  onRunningChange,
  shouldStop,
}: CodeSnippetContainerProps) {
  return (
    <div className="space-y-8">
      {snippets.map((snippet, index) => (
        <div key={snippet.id}>
          <CodeSnippet
            snippet={snippet}
            index={ordinals[snippet.id] ?? index}
            showCode={showCode}
            autoRun={autoRunId === snippet.id}
            runToken={runToken}
            runAllActive={runAllActive}
            onRunComplete={onRunComplete}
            anySnippetRunning={anySnippetRunning}
            onRunningChange={onRunningChange}
            shouldStop={shouldStop}
          />
        </div>
      ))}
    </div>
  );
}
