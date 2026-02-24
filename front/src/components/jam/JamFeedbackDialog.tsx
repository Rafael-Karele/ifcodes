import { useState } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JamFeedbackDialogProps {
  studentName: string;
  studentId: number;
  currentFeedback: string | null;
  onClose: () => void;
  onSubmit: (studentId: number, feedback: string) => void;
}

export default function JamFeedbackDialog({
  studentName,
  studentId,
  currentFeedback,
  onClose,
  onSubmit,
}: JamFeedbackDialogProps) {
  const [feedback, setFeedback] = useState(currentFeedback || "");

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(studentId, feedback);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            Feedback para {studentName}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Escreva seu feedback..."
          className="h-32 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!feedback.trim()} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
