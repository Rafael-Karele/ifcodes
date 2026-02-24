import { useRef, useEffect, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as monacoEditor } from "monaco-editor";
import { GripHorizontal } from "lucide-react";
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
  editorHeight?: string;
  customSize?: { width: number; height: number };
  onResize?: (size: { width: number; height: number }) => void;
}

const statusColors: Record<string, string> = {
  joined: "bg-stone-100 text-stone-700",
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

export default function JamStudentCard({
  participant,
  onClick,
  editorHeight = "h-32",
  customSize,
  onResize,
}: JamStudentCardProps) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<monacoEditor.IEditorDecorationsCollection | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragEndTimeRef = useRef(0);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Re-layout Monaco when card size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      editorRef.current?.layout();
    }, 50);
    return () => clearTimeout(timer);
  }, [editorHeight, customSize?.height, customSize?.width]);

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

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!cardRef.current || !onResize) return;

      isDraggingRef.current = true;
      const rect = cardRef.current.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = rect.width;
      const startHeight = rect.height;

      const card = cardRef.current;
      card.style.zIndex = "20";

      const onMouseMove = (ev: MouseEvent) => {
        const newWidth = Math.max(150, startWidth + (ev.clientX - startX));
        const newHeight = Math.max(120, startHeight + (ev.clientY - startY));
        card.style.width = `${newWidth}px`;
        card.style.height = `${newHeight}px`;
      };

      const onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        isDraggingRef.current = false;
        dragEndTimeRef.current = Date.now();

        const finalWidth = Math.max(150, startWidth + (ev.clientX - startX));
        const finalHeight = Math.max(120, startHeight + (ev.clientY - startY));

        // Clear inline styles — React will re-apply via props
        card.style.width = "";
        card.style.height = "";
        card.style.zIndex = "";

        onResize({ width: Math.round(finalWidth), height: Math.round(finalHeight) });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [onResize]
  );

  const handleCardClick = () => {
    if (!isDraggingRef.current && Date.now() - dragEndTimeRef.current > 200) {
      onClick();
    }
  };

  const hasCustomSize = customSize && (customSize.width > 0 || customSize.height > 0);
  const cardStyle: React.CSSProperties = {};
  if (hasCustomSize) {
    if (customSize.width > 0) {
      cardStyle.width = customSize.width;
    }
    if (customSize.height > 0) {
      cardStyle.height = customSize.height;
    }
    cardStyle.zIndex = 10;
  }

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      style={cardStyle}
      className={`relative cursor-pointer rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md ${
        hasCustomSize ? "flex flex-col" : ""
      } ${
        participant.online
          ? "border-stone-200 bg-white"
          : "border-stone-200 bg-stone-50 opacity-60"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              participant.online ? "bg-green-500" : "bg-stone-400"
            }`}
          />
          <span className="text-sm font-semibold text-stone-800 truncate">
            {participant.userName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              !participant.online
                ? "bg-stone-100 text-stone-500"
                : statusColors[participant.status] || "bg-stone-100 text-stone-700"
            }`}
          >
            {!participant.online
              ? "Offline"
              : statusLabels[participant.status] || participant.status}
          </span>
        </div>
      </div>
      <div className={`${hasCustomSize ? "flex-1" : editorHeight} overflow-hidden rounded border border-stone-100`}>
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
        <div className="mt-2 rounded bg-teal-50 p-2 text-xs text-teal-700">
          <span className="font-medium">Feedbacks:</span> {participant.feedback.length}
        </div>
      )}
      {onResize && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-1 right-1 cursor-nwse-resize rounded p-0.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100"
          title="Arrastar para redimensionar"
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
