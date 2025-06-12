
import { CodeSnippet } from "./CodeSnippet";

interface Snippet {
  id: string;
  title: string;
  explanation: string;
  code: string;
  language: string;
}

interface CodeSnippetContainerProps {
  snippets: Snippet[];
}

export function CodeSnippetContainer({ snippets }: CodeSnippetContainerProps) {
  return (
    <div className="space-y-12">
      {snippets.map((snippet, index) => (
        <div key={snippet.id} className="animate-fade-in">
          <CodeSnippet 
            snippet={snippet} 
            index={index}
          />
        </div>
      ))}
    </div>
  );
}
