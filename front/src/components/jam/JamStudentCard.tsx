import Editor from "@monaco-editor/react";
import type { JamStreamParticipant } from "@/types/jam";

interface JamStudentCardProps {
  participant: JamStreamParticipant;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  joined: "bg-gray-100 text-gray-700",
  coding: "bg-blue-100 text-blue-700",
  submitted: "bg-yellow-100 text-yellow-700",
  passed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  error: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  joined: "Conectado",
  coding: "Codificando",
  submitted: "Submetido",
  passed: "Aprovado",
  failed: "Reprovado",
  error: "Erro",
};

export default function JamStudentCard({ participant, onClick }: JamStudentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md ${
        participant.online
          ? "border-gray-200 bg-white"
          : "border-gray-200 bg-gray-50 opacity-60"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              participant.online ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm font-semibold text-gray-800 truncate">
            {participant.userName}
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            !participant.online
              ? "bg-gray-100 text-gray-500"
              : statusColors[participant.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {!participant.online
            ? "Offline"
            : statusLabels[participant.status] || participant.status}
        </span>
      </div>
      <div className="h-32 overflow-hidden rounded border border-gray-100">
        <Editor
          height="100%"
          language="c"
          value={participant.code || "// Sem código ainda"}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: "off",
            scrollBeyondLastLine: false,
            fontSize: 10,
            folding: false,
            glyphMargin: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            renderLineHighlight: "none",
            scrollbar: { vertical: "hidden", horizontal: "hidden" },
          }}
        />
      </div>
      {participant.feedback?.length > 0 && (
        <div className="mt-2 rounded bg-blue-50 p-2 text-xs text-blue-700">
          <span className="font-medium">Feedbacks:</span> {participant.feedback.length}
        </div>
      )}
    </div>
  );
}
