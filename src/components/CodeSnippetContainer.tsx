
import { CodeSnippet } from "./CodeSnippet";

interface Snippet {
  id: string;
  title: string;
  explanation: string;
  code: string;
}

interface CodeSnippetContainerProps {
  snippets: Snippet[];
  showCode: boolean;
  autoRunId: string | null;
  runToken: number;
  runAllActive: boolean;
  onAutoRunComplete: (id: string, ok: boolean, token: number) => void;
}

export function CodeSnippetContainer({
  snippets,
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
            index={index}
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
