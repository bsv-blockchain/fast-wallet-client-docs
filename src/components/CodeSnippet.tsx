
import { useState } from "react";
import { Play, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@/components/ThemeProvider";
import { createToken } from '../data/snippets/create-token'

const functionsAsExecutable = {
  createToken
}

interface Snippet {
  id: string;
  title: string;
  explanation: string;
  code: string;
  compiledCode: string;
  language: string;
}

interface CodeSnippetProps {
  snippet: Snippet;
  index: number;
}

export function CodeSnippet({ snippet, index }: CodeSnippetProps) {
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const getSyntaxTheme = () => {
    if (theme === "dark") return oneDark;
    if (theme === "light") return oneLight;
    // For system theme, check if dark mode is preferred
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? oneDark : oneLight;
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      // Create a custom console that captures output
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => {
            if (arg?.tx) {
              arg.tx = ['large number array hidden for clarity, see network tab for actual data']
            }
            return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          }).join(' '));
        }
      };

      // Create a function that runs the code with custom console
      const runUserCode = functionsAsExecutable[snippet.id]
      await runUserCode(customConsole);

      setOutput(logs.length > 0 ? logs.join('\n') : "Code executed successfully (no output)");
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full shadow-lg border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">
            {index + 1}. {snippet.title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              className="transition-all duration-200"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {snippet.explanation}
        </p>
        
        <div className="rounded-lg overflow-hidden border">
          <div className="bg-muted/80 px-4 py-2 text-sm text-muted-foreground font-medium border-b flex items-center justify-between">
            <span>{snippet.language}</span>
          </div>
          <SyntaxHighlighter
            language="typescript"
            style={getSyntaxTheme()}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
            showLineNumbers={false}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
        <div className="space-y-3">
          <Button
            onClick={runCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>

          {output && (
            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="text-sm font-medium text-foreground mb-2">Output:</h4>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
