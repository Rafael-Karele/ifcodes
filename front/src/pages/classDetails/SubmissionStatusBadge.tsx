import type { SubmissionStatus } from "@/types";
import { submissionStatusConfig } from "./types";

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
}

export default function SubmissionStatusBadge({ status }: SubmissionStatusBadgeProps) {
  const config = submissionStatusConfig[status] || submissionStatusConfig.unknown;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
