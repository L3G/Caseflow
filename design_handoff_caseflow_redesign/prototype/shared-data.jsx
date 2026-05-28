// Shared mock data for both Caseflow variations.
// Exports to window so all Babel scripts can use it.

const CASEFLOW_CASES = [
  {
    id: 'ab9cd84acf85',
    fullId: 'ab9cd84acf85e2c1d3a',
    client: 'Jordan A. Park',
    workflow: 'Chapter 7 Intake',
    state: 'Approved',
    updated: '5/27/2026, 11:42 PM',
    updatedRel: '2 min ago',
    documents: 3,
    activity: [
      { kind: 'document_uploaded', actor: 'system', time: '11:39:18 PM', title: 'first_national_bank_statement_april_2026.pdf', meta: '247 KB · PDF' },
      { kind: 'case_created',      actor: 'system', time: '11:39:18 PM', title: 'Jordan A. Park · Chapter 7 Intake' },
      { kind: 'planner_decided',   actor: 'agent',  time: '11:39:23 PM', tool: 'ClassifyDocument', confidence: 'high',
        reasoning: 'A new document has been uploaded: first_national_bank_statement_april_2026.pdf. No document type has been identified yet (type shown as Unknown) and there are no existing extractions. The most productive next step is to classify the document so the workflow can determine whether it\u2019s a bank statement suitable for extracting balances and transactions for Chapter 7 intake. No anomalies are apparent from the metadata alone (filename and date look consistent with a bank statement), so attorney review is premature.',
        alternatives: [
          { tool: 'RequestAttorneyApproval', reason: 'Skipped — premature without classification.' },
          { tool: 'ExtractBankStatement',    reason: 'Skipped — document type not yet confirmed.' },
        ] },
      { kind: 'tool_started',      actor: 'agent',  time: '11:39:23 PM', tool: 'ClassifyDocument' },
      { kind: 'tool_succeeded',    actor: 'agent',  time: '11:39:24 PM', tool: 'ClassifyDocument', result: 'Classified as BankStatement (confidence 0.98).' },
      { kind: 'state_changed',     actor: 'agent',  time: '11:39:24 PM', from: 'Pending', to: 'Classified' },
      { kind: 'planner_decided',   actor: 'agent',  time: '11:39:25 PM', tool: 'ExtractBankStatement', confidence: 'high',
        reasoning: 'Document classified as BankStatement with very high confidence. Next, extract structured fields (account, period, balances, totals) so an attorney can verify the figures against schedules.',
        alternatives: [
          { tool: 'RequestAttorneyApproval', reason: 'Skipped — extraction first reduces attorney review time.' },
        ] },
      { kind: 'tool_started',      actor: 'agent',  time: '11:39:25 PM', tool: 'ExtractBankStatement' },
      { kind: 'tool_succeeded',    actor: 'agent',  time: '11:39:32 PM', tool: 'ExtractBankStatement', result: 'Extracted 9 fields. Min field confidence 0.93.' },
      { kind: 'approval_requested',actor: 'agent',  time: '11:39:32 PM', approval: 'RequestAttorneyApproval', assignee: 'M. Chen' },
      { kind: 'approval_granted',  actor: 'human',  actorName: 'M. Chen', time: '11:42:05 PM', approval: 'RequestAttorneyApproval', note: 'Figures match client schedules. Approving.' },
      { kind: 'state_changed',     actor: 'system', time: '11:42:05 PM', from: 'Awaiting attorney', to: 'Approved' },
    ],
    extracted: [
      { field: 'Bank',              value: 'First National Bank', confidence: 0.99 },
      { field: 'Account holder',    value: 'Jordan A. Park',      confidence: 0.99 },
      { field: 'Account ····',      value: '4729',                confidence: 0.99 },
      { field: 'Period start',      value: '2026-04-01',          confidence: 0.99 },
      { field: 'Period end',        value: '2026-04-30',          confidence: 0.99 },
      { field: 'Beginning balance', value: '$1,200.00',           confidence: 0.99 },
      { field: 'Ending balance',    value: '$3,800.00',           confidence: 0.99 },
      { field: 'Total deposits',    value: '$5,000.00',           confidence: 0.96 },
      { field: 'Total withdrawals', value: '$2,400.00',           confidence: 0.93 },
    ],
    approvals: [
      { name: 'RequestAttorneyApproval', kind: 'approve · human', status: 'granted', by: 'M. Chen', at: '11:42:05 PM', note: 'Figures match client schedules.' },
    ],
  },
  {
    id: 'c2e3f4a18b9d',
    fullId: 'c2e3f4a18b9d4710f88',
    client: 'Maria Velasquez',
    workflow: 'Chapter 7 Intake',
    state: 'Awaiting attorney',
    updated: '5/27/2026, 10:11 PM',
    updatedRel: '1 hr ago',
    documents: 5,
  },
  {
    id: '7f4a92db1c0e',
    fullId: '7f4a92db1c0e8a3bc04',
    client: 'Anthony R. Brooks',
    workflow: 'Chapter 7 Intake',
    state: 'Processing',
    updated: '5/27/2026, 9:50 PM',
    updatedRel: '2 hr ago',
    documents: 2,
  },
  {
    id: '5d18ae3f902c',
    fullId: '5d18ae3f902c114bd6a',
    client: 'Lin Zhao',
    workflow: 'Chapter 7 Intake',
    state: 'Draft',
    updated: '5/26/2026, 6:30 PM',
    updatedRel: 'yesterday',
    documents: 1,
  },
  {
    id: '93b1f72eac84',
    fullId: '93b1f72eac8429ddf02',
    client: "David O'Connor",
    workflow: 'Chapter 7 Intake',
    state: 'Approved',
    updated: '5/26/2026, 3:12 PM',
    updatedRel: 'yesterday',
    documents: 4,
  },
  {
    id: '4e8a6c93517f',
    fullId: '4e8a6c93517f02e1b9a',
    client: 'Priya Raman',
    workflow: 'Chapter 7 Intake',
    state: 'Needs documents',
    updated: '5/25/2026, 11:04 AM',
    updatedRel: '2 days ago',
    documents: 0,
  },
];

// Activity kind metadata
const ACTIVITY_LABELS = {
  document_uploaded:  { label: 'Document uploaded',  actor: 'system' },
  case_created:       { label: 'Case created',        actor: 'system' },
  planner_decided:    { label: 'Planner decided',     actor: 'agent'  },
  tool_started:       { label: 'Tool started',        actor: 'agent'  },
  tool_succeeded:     { label: 'Tool succeeded',      actor: 'agent'  },
  state_changed:      { label: 'State changed',       actor: 'agent'  },
  approval_requested: { label: 'Approval requested',  actor: 'agent'  },
  approval_granted:   { label: 'Approval granted',    actor: 'human'  },
};

const WORKFLOWS = [
  { id: 'ch7',  name: 'Chapter 7 Intake',     desc: 'Liquidation \u2014 bank statements, schedules, means test' },
  { id: 'ch13', name: 'Chapter 13 Intake',    desc: 'Reorganization plan with 3\u20135 year repayment' },
  { id: 'imm',  name: 'Immigration \u2014 I-130', desc: 'Petition for relative; supporting evidence pack' },
  { id: 'gen',  name: 'General matter intake', desc: 'Open-ended ingestion for review' },
];

Object.assign(window, { CASEFLOW_CASES, ACTIVITY_LABELS, WORKFLOWS });
