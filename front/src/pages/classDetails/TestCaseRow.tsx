import { useState } from "react";
import type { SubmissionStatus, TestCase, TestCaseResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Hash, Eye, EyeOff, Copy } from "lucide-react";
import { TableRow, TableCell } from "@/components/table";
import SubmissionStatusBadge from "./SubmissionStatusBadge";

interface TestCaseRowProps {
  testCase: TestCase;
  result: TestCaseResult | undefined;
  index: number;
}

export default function TestCaseRow({ testCase, result, index }: TestCaseRowProps) {
  const [showOutput, setShowOutput] = useState(false);

  const actualOutput = result?.stdout || result?.stderr || "Sem saída";
  const expectedOutput = testCase.expectedOutput || "Sem saída esperada";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <TableRow className="hover:bg-stone-50 transition-colors duration-200">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-stone-400" />
          <span>Teste {index + 1}</span>
        </div>
      </TableCell>
      <TableCell>
        <SubmissionStatusBadge status={(result?.status || 'pending') as SubmissionStatus} />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOutput(!showOutput)}
              className="h-6 px-2 text-xs"
            >
              {showOutput ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
              {showOutput ? "Ocultar" : "Mostrar"}
            </Button>
            {actualOutput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(actualOutput)}
                className="h-6 px-2 text-xs"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </div>
          {showOutput && (
            <div className="bg-stone-900 rounded p-2 max-w-xs">
              <pre className="text-xs text-stone-300 whitespace-pre-wrap overflow-auto max-h-20">
                {actualOutput}
              </pre>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(expectedOutput)}
              className="h-6 px-2 text-xs"
            >
              <Copy className="w-3 h-3" />
              Copiar
            </Button>
          </div>
          <div className="bg-stone-900 rounded p-2 max-w-xs">
            <pre className="text-xs text-stone-300 whitespace-pre-wrap overflow-auto max-h-20">
              {expectedOutput}
            </pre>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
