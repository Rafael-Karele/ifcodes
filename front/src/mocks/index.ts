import type {
  Activity,
  Problem,
  Submission,
  Evaluation,
  TestCase,
  TestCaseResult,
  SubmissionReport,
  Page,
} from "../types";

// Fake Activities
export const fakeActivities: Activity[] = [
  {
    id: 1,
    problemId: 1,
    dueDate: "2025-08-20T23:59:59Z",
    status: "pending",
  },
  {
    id: 2,
    problemId: 2,
    dueDate: "2025-08-15T23:59:59Z",
    status: "completed",
  },
  {
    id: 3,
    problemId: 3,
    dueDate: "2025-08-10T23:59:59Z",
    status: "overdue",
  },
];

// Fake Problems
export const fakeProblems: Problem[] = [
  {
    id: 1,
    title: "Soma Simples",
    statement: "Some dois números inteiros.",
    timeLimitMs: 1000,
    memoryLimitKb: 65536,
  },
  {
    id: 2,
    title: "Fatorial",
    statement: "Calcule o fatorial de um número inteiro.",
    timeLimitMs: 2000,
    memoryLimitKb: 65536,
  },
  {
    id: 3,
    title: "Números Primos",
    statement: "Verifique se um número é primo.",
    timeLimitMs: 1500,
    memoryLimitKb: 65536,
  },
];

// Fake Submissions
export const fakeSubmissions: Submission[] = [
  {
    id: 1,
    activityId: 1,
    dateSubmitted: "2025-08-13T10:00:00Z",
    language: "python",
    status: "passed",
  },
  {
    id: 2,
    activityId: 2,
    dateSubmitted: "2025-08-12T15:30:00Z",
    language: "java",
    status: "failed",
  },
  {
    id: 3,
    activityId: 3,
    dateSubmitted: "2025-08-11T09:45:00Z",
    language: "cpp",
    status: "failed",
  },
];

// Fake Evaluations
export const fakeEvaluations: Evaluation[] = [
  {
    id: 1,
    submissionId: 1,
    token: "token123",
    status: "passed",
  },
  {
    id: 2,
    submissionId: 2,
    token: "token456",
    status: "failed",
  },
];

// Fake Test Cases
export const fakeTestCases: TestCase[] = [
  {
    id: 1,
    input: "2 3",
    expectedOutput: "5",
    private: false,
  },
  {
    id: 2,
    input: "10 20",
    expectedOutput: "30",
    private: true,
  },
];

// Fake Test Case Results
export const fakeTestCaseResults: TestCaseResult[] = [
  {
    id: 1,
    testCaseId: 1,
    submissionId: 1,
    status: "passed",
  },
  {
    id: 2,
    testCaseId: 2,
    submissionId: 1,
    status: "failed",
  },
];

// Fake Submission Reports
export const fakeSubmissionReports: SubmissionReport[] = [
  {
    submissionId: 1,
    activityTitle: "Soma Simples",
    language: "c",
    dateSubmitted: "2025-08-13T10:00:00Z",
    overallStatus: "passed",
    testCases: fakeTestCaseResults,
    compileLog: undefined,
  },
  {
    submissionId: 2,
    activityTitle: "Fatorial",
    language: "c",
    dateSubmitted: "2025-08-12T15:30:00Z",
    overallStatus: "failed",
    testCases: fakeTestCaseResults,
    compileLog: "Warning: variável não utilizada.",
  },
  {
    submissionId: 3,
    activityTitle: "Números Primos",
    language: "c",
    dateSubmitted: "2025-08-12T15:30:00Z",
    overallStatus: "failed",
    testCases: fakeTestCaseResults,
    compileLog: "Warning: variável não utilizada.",
  },
];

// Fake Page
export const fakePageActivities: Page<Activity> = {
  items: fakeActivities,
  page: 1,
  pageSize: 10,
  total: 3,
};
