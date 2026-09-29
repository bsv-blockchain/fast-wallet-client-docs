
import { useEffect, useRef, useState } from "react";
import { Play, Copy, Check, Link, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "@/components/ThemeProvider";
import snippets from '../snippets'

import { executeSnippet, runSnippetOnce, type SnippetResult } from '@/lib/snippet-runner'

interface Snippet {
  id: string;
  title: string;
  explanation: string;
  code: string;
}

interface CodeSnippetProps {
  snippet: Snippet;
  index: number;
  showCode: boolean;
  autoRun: boolean;
  runToken: number;
  runAllActive: boolean;
  onRunComplete: (id: string, result: SnippetResult, token: number) => void;
  anySnippetRunning: boolean;
  onRunningChange: (id: string | null) => void;
  shouldStop?: () => boolean;
}

export function CodeSnippet({
  snippet,
  index,
  showCode,
  autoRun,
  runToken,
  runAllActive,
  onRunComplete,
  anySnippetRunning,
  onRunningChange,
  shouldStop,
}: CodeSnippetProps) {
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SnippetResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [codeOpen, setCodeOpen] = useState(showCode);
  const { theme } = useTheme();
  const location = useLocation();
  const runCodeRef = useRef<() => Promise<SnippetResult>>();
  const onRunCompleteRef = useRef(onRunComplete);
  onRunCompleteRef.current = onRunComplete;

  useEffect(() => {
    setCodeOpen(showCode);
  }, [showCode]);

  const getSyntaxTheme = () => {
    if (theme === "dark") return oneDark;
    if (theme === "light") return oneLight;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? oneDark : oneLight;
  };

  const runCode = async (): Promise<SnippetResult> => {
    setIsRunning(true);
    onRunningChange(snippet.id);
    setResult(null);
    setOutput("");
    const logs: string[] = [];
    const cases: (SnippetResult & { id: string })[] = [];
    const completed = await executeSnippet(async () => {
      const customConsole = {
        shouldStop,
        case: (id: string, result: SnippetResult) => cases.push({ id, ...result }),
        log: (...args: unknown[]) => {
          const cleanObject = (obj: unknown): unknown => {
            if (obj === null || typeof obj !== 'object') {
              return obj;
            }

            if (Array.isArray(obj)) {
              return obj.map(cleanObject);
            }

            const cleaned: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(obj)) {
              if (key === 'tx' || key === 'beef' || key === 'BEEF') {
                cleaned[key] = ['large number array hidden for clarity, see network tab for actual data'];
              } else if (typeof value === 'object' && value !== null) {
                cleaned[key] = cleanObject(value);
              } else {
                cleaned[key] = value;
              }
            }
            return cleaned;
          };

          logs.push(args.map(arg => {
            const cleanedArg = cleanObject(arg);
            return typeof cleanedArg === 'object' ? JSON.stringify(cleanedArg, null, 2) : String(cleanedArg);
          }).join(' '));
        }
      };

      await snippets[snippet.id](customConsole);

    });
    if (cases.length > 0) completed.cases = cases;
    setOutput([
      ...logs,
      ...(completed.message ? [`${completed.status === 'skipped' ? 'Skipped' : 'Error'}: ${completed.message}`] : []),
    ].join('\n') || "Code executed successfully (no output)");
    setResult(completed);
    setIsRunning(false);
    onRunningChange(null);
    return completed;
  };
  runCodeRef.current = runCode;

  useEffect(() => {
    if (!autoRun) return;
    let active = true;
    document.getElementById(snippet.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    void runSnippetOnce(`${runToken}:${snippet.id}`, () => runCodeRef.current()).then(completed => {
      if (active) onRunCompleteRef.current(snippet.id, completed, runToken);
    });
    return () => {
      active = false;
    };
  }, [autoRun, runToken, snippet.id]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const shareableUrl = `${window.location.origin}${location.pathname}?snippet=${snippet.id}`;

    try {
      await navigator.clipboard.writeText(shareableUrl);
      setShared(true);
      toast({
        title: "Link copied!",
        description: "Shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setShared(false), 2000);
    } catch {
      toast({
        title: "Failed to copy link",
        description: "There was an error copying the link to your clipboard.",
        variant: "destructive",
      });
    }
  };

  const failed = result?.status === 'failed';

  return (
    <Card id={snippet.id} className="w-full scroll-mt-32 border border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-foreground sm:text-xl">
            {index + 1}. {snippet.title}
          </CardTitle>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareLink}
              className="transition-all duration-200"
              title="Copy link to this snippet"
            >
              {shared ? (
                <Check className="h-4 w-4" />
              ) : (
                <Link className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              className="transition-all duration-200"
              title="Copy code"
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
        <p className="leading-relaxed text-muted-foreground">
          {snippet.explanation}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              void runSnippetOnce(`${runToken}:${snippet.id}`, runCode).then(completed => {
                onRunCompleteRef.current(snippet.id, completed, runToken);
              });
            }}
            disabled={isRunning || anySnippetRunning || runAllActive}
            className="bg-green-600 text-white transition-all duration-200 hover:bg-green-700"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCodeOpen(open => !open)}
            aria-expanded={codeOpen}
          >
            {codeOpen ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
            {codeOpen ? "Hide code" : "Show code"}
          </Button>
        </div>

        {codeOpen && (
          <div className="overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between border-b bg-muted/80 px-4 py-2 text-sm font-medium text-muted-foreground">
              <span>typescript</span>
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
        )}

        {output && (
          <div className="overflow-hidden rounded-lg border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <h4 className="text-sm font-medium text-foreground">Output</h4>
              <Badge variant={failed ? "destructive" : "secondary"}>
                {failed ? 'Failed' : result?.status === 'skipped' ? 'Skipped' : 'Passed'}
              </Badge>
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
              {output}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
