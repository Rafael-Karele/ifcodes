import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import {
  Hash,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Terminal,
  Target,
  Activity as ActivityIcon,
} from "lucide-react";
import type { TestCase, TestCaseResult } from "@/types";
import { testStatusConfig, type TestStatusKey } from "./statusConfig";

/* ── Inline test status badge ─────────────────────── */

interface TestBadgeProps {
  status: TestStatusKey;
}

function TestBadge({ status }: TestBadgeProps) {
  const config = testStatusConfig[status] || testStatusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <div className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/* ── Single test-case row ─────────────────────────── */

interface TestCaseRowProps {
  testCase: TestCase;
  result: TestCaseResult | undefined;
  index: number;
}

function TestCaseRow({ testCase, index, result }: TestCaseRowProps) {
  const [showOutput, setShowOutput] = useState(false);

  const actualOutput = result?.stdout || result?.stderr || "Sem saida";
  const expectedOutput = testCase.expectedOutput || "Sem saida esperada";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <TableRow className="hover:bg-stone-50 transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-stone-400" />
          <span className="text-sm">Teste {index + 1}</span>
        </div>
      </TableCell>
      <TableCell>
        <TestBadge
          status={(result?.status as TestStatusKey) || "pending"}
        />
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
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
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
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
          {showOutput && (
            <div className="overflow-x-auto rounded bg-stone-900 p-2 max-w-xs">
              <pre className="text-xs text-stone-300 whitespace-pre-wrap max-h-20 overflow-auto">
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
              <Copy className="h-3 w-3" />
              Copiar
            </Button>
          </div>
          <div className="overflow-x-auto rounded bg-stone-900 p-2 max-w-xs">
            <pre className="text-xs text-stone-300 whitespace-pre-wrap max-h-20 overflow-auto">
              {expectedOutput}
            </pre>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ── Full test-results section ────────────────────── */

interface TestResultsSectionProps {
  testCases: TestCase[] | undefined;
  mapResultByTestId: Map<number, TestCaseResult>;
}

export function TestResultsSection({
  testCases,
  mapResultByTestId,
}: TestResultsSectionProps) {
  return (
    <SectionCard title="Casos de Teste" icon={TestTube}>
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {!testCases || testCases.length === 0 ? (
          <div className="text-center py-8">
            <TestTube className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-base font-medium text-stone-900 mb-2">
              Nenhum caso de teste
            </h3>
            <p className="text-sm text-stone-500">
              Esta submissao nao possui casos de teste para exibir
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 hover:bg-stone-50">
                  <TableHead className="font-semibold text-stone-800">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Teste
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-stone-800">
                    <div className="flex items-center gap-2">
                      <ActivityIcon className="h-4 w-4" />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-stone-800">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      Saida Atual
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-stone-800">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Saida Esperada
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((testCase, index) => (
                  <TestCaseRow
                    key={testCase.id}
                    testCase={testCase}
                    result={mapResultByTestId.get(testCase.id)}
                    index={index}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
