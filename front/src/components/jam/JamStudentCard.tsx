import { useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as monacoEditor } from "monaco-editor";
import type { JamStreamParticipant } from "@/types/jam";

function injectJamCursorStyles() {
  const styleId = "jam-cursor-styles";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .jam-cursor-line {
      background: rgba(250, 204, 21, 0.12);
    }
    .jam-cursor-caret {
      border-left: 2px solid #facc15;
      margin-left: -1px;
      animation: jam-caret-blink 1s step-end infinite;
    }
    .jam-cursor-char {
      outline: 1.5px solid rgba(250, 204, 21, 0.7);
      border-radius: 1px;
      background: rgba(250, 204, 21, 0.18);
    }
    @keyframes jam-caret-blink {
      0%, 100% { border-left-color: #facc15; }
      50% { border-left-color: transparent; }
    }
  `;
  document.head.appendChild(style);
}

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
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<monacoEditor.IEditorDecorationsCollection | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !participant.cursor) return;

    const { line, column } = participant.cursor;
    editor.revealLineInCenter(line);

    const newDecorations: monacoEditor.IModelDeltaDecoration[] = [
      {
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "jam-cursor-line",
        },
      },
      {
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column,
        },
        options: {
          beforeContentClassName: "jam-cursor-caret",
        },
      },
      {
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column + 1,
        },
        options: {
          inlineClassName: "jam-cursor-char",
        },
      },
    ];

    if (decorationsRef.current) {
      decorationsRef.current.set(newDecorations);
    } else {
      decorationsRef.current = editor.createDecorationsCollection(newDecorations);
    }
  }, [participant.cursor?.line, participant.cursor?.column, participant.code]);

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
          onMount={handleEditorMount}
          beforeMount={() => injectJamCursorStyles()}
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
