
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
  onAutoRunComplete: (id: string, ok: boolean, token: number) => void;
}

export function CodeSnippetContainer({
  snippets,
  ordinals,
  showCode,
  autoRunId,
  runToken,
  runAllActive,
  onAutoRunComplete,
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
            onAutoRunComplete={onAutoRunComplete}
          />
        </div>
      ))}
    </div>
  );
}
