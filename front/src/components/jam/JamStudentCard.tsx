import { useRef, useEffect, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as monacoEditor } from "monaco-editor";
import { GripHorizontal, Move } from "lucide-react";
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

export interface CardLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface JamStudentCardProps {
  participant: JamStreamParticipant;
  layout: CardLayout;
  onClick: () => void;
  onLayoutChange: (layout: CardLayout) => void;
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
  layout,
  onClick,
  onLayoutChange,
}: JamStudentCardProps) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<monacoEditor.IEditorDecorationsCollection | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const interactEndRef = useRef(0);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Re-layout Monaco when card size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      editorRef.current?.layout();
    }, 50);
    return () => clearTimeout(timer);
  }, [layout.w, layout.h]);

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

  // --- Drag to move ---
  const handleMoveStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!cardRef.current) return;

      interactingRef.current = true;
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = layout.x;
      const startTop = layout.y;
      const card = cardRef.current;
      card.style.zIndex = "30";
      card.style.opacity = "0.9";

      const onMouseMove = (ev: MouseEvent) => {
        card.style.left = `${startLeft + (ev.clientX - startX)}px`;
        card.style.top = `${startTop + (ev.clientY - startY)}px`;
      };

      const onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        interactingRef.current = false;
        interactEndRef.current = Date.now();
        card.style.zIndex = "";
        card.style.opacity = "";

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          card.style.left = "";
          card.style.top = "";
          onLayoutChange({
            ...layout,
            x: Math.max(0, startLeft + dx),
            y: Math.max(0, startTop + dy),
          });
        } else {
          // Restaura posição original (React não re-renderiza sem onLayoutChange)
          card.style.left = `${startLeft}px`;
          card.style.top = `${startTop}px`;
        }
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [layout, onLayoutChange]
  );

  // --- Drag to resize ---
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!cardRef.current) return;

      interactingRef.current = true;
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = layout.w;
      const startH = layout.h;
      const card = cardRef.current;
      card.style.zIndex = "30";

      const onMouseMove = (ev: MouseEvent) => {
        card.style.width = `${Math.max(180, startW + (ev.clientX - startX))}px`;
        card.style.height = `${Math.max(140, startH + (ev.clientY - startY))}px`;
      };

      const onMouseUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        interactingRef.current = false;
        interactEndRef.current = Date.now();
        card.style.zIndex = "";
        card.style.width = "";
        card.style.height = "";

        onLayoutChange({
          ...layout,
          w: Math.max(180, Math.round(startW + (ev.clientX - startX))),
          h: Math.max(140, Math.round(startH + (ev.clientY - startY))),
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [layout, onLayoutChange]
  );

  const handleCardClick = () => {
    if (!interactingRef.current && Date.now() - interactEndRef.current > 200) {
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      style={{
        position: "absolute",
        left: layout.x,
        top: layout.y,
        width: layout.w,
        height: layout.h,
      }}
      className={`flex flex-col cursor-pointer rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md ${
        participant.online
          ? "border-stone-200 bg-white"
          : "border-stone-200 bg-stone-50 opacity-60"
      }`}
    >
      {/* Header - drag handle */}
      <div
        onMouseDown={handleMoveStart}
        className="mb-2 flex items-center justify-between cursor-move"
      >
        <div className="flex items-center gap-2 truncate">
          <Move className="h-3 w-3 shrink-0 text-stone-300" />
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

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-hidden rounded border border-stone-100">
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

      {/* Feedback badge */}
      {participant.feedback?.length > 0 && (
        <div className="mt-2 rounded bg-teal-50 p-2 text-xs text-teal-700">
          <span className="font-medium">Feedbacks:</span> {participant.feedback.length}
        </div>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-1 right-1 cursor-nwse-resize rounded p-0.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100"
        title="Redimensionar"
      >
        <GripHorizontal className="h-4 w-4" />
      </div>
    </div>
  );
}
