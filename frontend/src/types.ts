// Mirror of backend models per DESIGN §9.
// JsonStringEnumConverter on the C# side emits camelCase enum names,
// so each TS enum union reflects that wire format.

export type CaseState =
  | 'new'
  | 'documentReceived'
  | 'classified'
  | 'extracted'
  | 'analysesPending'
  | 'analyzed'
  | 'attorneyReviewPending'
  | 'approved'
  | 'flagged';

export type LlmTier = 'nano' | 'mini';

export type DocumentType =
  | 'unknown'
  | 'bankStatement'
  | 'payStub'
  | 'taxReturn'
  | 'identification'
  | 'courtNotice';

export type CaseEventType =
  | 'caseCreated'
  | 'documentUploaded'
  | 'plannerDecision'
  | 'toolStarted'
  | 'toolSucceeded'
  | 'toolFailed'
  | 'stateTransitioned'
  | 'approvalRequested'
  | 'approvalResolved'
  | 'agentStopped'
  | 'policyViolation';

export type CaseEventActor = 'agent' | 'system' | 'user';

export type ApprovalDecision = 'approve' | 'reject';

export type PlannerConfidence = 'high' | 'medium' | 'low';

export type AgentStopReason =
  | 'plannerDone'
  | 'terminalState'
  | 'blockedAwaitingHuman'
  | 'maxStepsReached'
  | 'maxDurationReached'
  | 'toolFailed'
  | 'policyViolation'
  | 'policyForbade'
  | 'cancelled';

// === Entities ===

export interface Case {
  id: string;
  clientName: string;
  workflowTitle: string;
  assignee: string;
  state: CaseState;
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  fileName: string;
  storedPath: string;
  documentType: DocumentType | null;
  uploadedAt: string;
}

export interface CaseEvent {
  id: number;
  caseId: string;
  eventType: CaseEventType;
  actor: CaseEventActor;
  payloadJson: string;
  at: string;
}

export interface PendingApproval {
  id: number;
  caseId: string;
  toolName: string;
  plannerReasoning: string;
  toolInputJson: string;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  decision: ApprovalDecision | null;
  notes: string | null;
}

// === Payload records (stored as JSON, deserialized from /api/cases/:id/extraction|analyses) ===

export interface ExtractedField<T> {
  value: T;
  confidence: number;
}

export interface BankStatementTransaction {
  date: string;
  description: string;
  amount: number;
  direction: 'deposit' | 'withdrawal';
}

export interface BankStatementExtraction {
  bankName: ExtractedField<string>;
  accountHolderName: ExtractedField<string>;
  accountNumberLast4: ExtractedField<string>;
  statementPeriodStart: ExtractedField<string>;
  statementPeriodEnd: ExtractedField<string>;
  beginningBalance: ExtractedField<number>;
  endingBalance: ExtractedField<number>;
  totalDeposits: ExtractedField<number>;
  totalWithdrawals: ExtractedField<number>;
  transactions: BankStatementTransaction[];
  reviewerNotes: string | null;
}

export interface MeansTestResult {
  monthlyGrossIncomeProxy: number;
  annualizedIncomeProxy: number;
  medianIncomeThreshold: number;
  passes: boolean;
  methodology: string;
  caveats: string[];
}

export interface Deadline {
  name: string;
  legalCitation: string;
  daysFromPetition: number;
  dueDate: string;
  adjustedForBusinessDay: boolean;
}

export interface DeadlineSchedule {
  petitionDate: string;
  deadlines: Deadline[];
}

export interface ArithmeticCheckResult {
  balanceReconciles: boolean;
  expectedEndingBalance: number;
  actualEndingBalance: number;
  discrepancy: number;
  notes: string[];
}

export interface AnalysesBag {
  meansTest: MeansTestResult | null;
  deadlines: DeadlineSchedule | null;
  arithCheck: ArithmeticCheckResult | null;
}

export interface PlannerAlternative {
  action: string;
  reasonRejected: string;
}

export interface PlannerDecision {
  nextAction: string;
  reasoning: string;
  expectedOutcome: string;
  alternativesConsidered: PlannerAlternative[];
  estimatedConfidence: PlannerConfidence;
}

// === Orchestrator response ===

export interface AgentRunResult {
  caseId: string;
  finalState: CaseState;
  stopReason: AgentStopReason;
  stopMessage: string;
  stepsTaken: number;
  newEvents: CaseEvent[];
}
