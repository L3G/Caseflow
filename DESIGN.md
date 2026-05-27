# Caseflow — Architecture & Design Specification

This document is the build specification. Read top-to-bottom before writing any
code. Every section is a contract.

---

## 0. Purpose

Build a containerized full-stack application that demonstrates an **agentic AI
workflow for bankruptcy case intake**. Submitted as a take-home project for
Glade.AI.

**The product narrative the README sells:**

> Upload one document. The system runs the case forward through a Chapter 7
> intake workflow as far as it safely can — and stops to ask the human when
> it can't. Every AI decision is logged in an audit trail.

The system must:
- Accept a PDF upload (bank statement)
- Run an LLM-driven agent loop that picks tools from a constrained catalog
- Persist case state, extracted data, and a full audit log
- Surface every planner decision and tool execution in a React UI
- Pause for human approval at mandatory checkpoints
- Run in a single Docker container

---

## 1. Tech stack (locked — do not deviate)

### Backend
- **.NET 10 (LTS, GA November 2025)** — current LTS, supported through November 2028
- **ASP.NET Core 10** with Minimal API style (no MVC controllers)
- **Entity Framework Core 10** with **SQLite** provider
- **OpenAI .NET SDK 2.10+** for LLM calls
- **C# 14** with nullable reference types and implicit usings enabled

### Frontend
- **React 18** with **TypeScript 5.5+**
- **Vite 5** for dev server and production build
- **React Router 6** for client-side routing
- **No state library** — `useState` + `useEffect` only
- **No UI framework** — plain CSS with CSS variables
- **No data-fetching library** — native `fetch`

### Infrastructure
- **Docker** with **multi-stage Dockerfile**
- **Docker Compose** for orchestration
- **SQLite** + **local filesystem** for persistence, both on a named Docker volume

### LLM
- **Models (tiered routing — task-fit, not one-size-fits-all):**
  - `gpt-5.4-nano` — planner and `ClassifyDocument`. Both are JSON ranking / labeling tasks, which is nano's positioning. ~$0.0001 per call.
  - `gpt-5.4-mini` — `ExtractBankStatement` and `DraftClientEmail`. Vision-heavy field extraction with per-field confidence needs the higher tier; client-facing generation warrants it too.
- **Total cost target:** under 1¢ per case end-to-end (~$0.0005 for ~5 planner calls + ~$0.0001 classification + ~$0.0005 extraction).
- **Mode:** Strict structured outputs (JSON schema enforced server-side)
- **Strategy Pattern:** `OpenAiLlmProvider` and `MockLlmProvider` behind `ILlmProvider`. The provider takes an `LlmTier` enum (`Nano` | `Mini`) on every call — one client, one auth path, the tier picks the model ID at call time.
- **Planner:** dual-implementation (`OpenAiPlanner` + `MockPlanner`) behind `IPlanner`. Planner always calls the Nano tier.
- **Audit:** every LLM call logs its tier into the audit log so the routing decision is inspectable per case.

### Forbidden choices
- ❌ MVC controllers (use Minimal API)
- ❌ Razor Pages
- ❌ State management libraries (Redux, Zustand, Jotai, etc.)
- ❌ UI frameworks (Tailwind, Material UI, Chakra, shadcn, etc.)
- ❌ Data fetching libraries (TanStack Query, SWR)
- ❌ ORMs other than EF Core (no Dapper, no raw ADO)
- ❌ Next.js, Remix, or any meta-framework
- ❌ Vector databases (use in-memory if RAG ever needed)
- ❌ Authentication libraries (single hardcoded user is fine)

---

## 2. Repository layout

```
caseflow/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── .env.example
├── README.md
├── DESIGN.md                    (this file)
├── CLAUDE.md                    (build behavior for Claude Code)
│
├── backend/
│   ├── Caseflow.csproj
│   ├── Program.cs               (composition root only)
│   ├── appsettings.json
│   ├── Properties/launchSettings.json
│   ├── Models/                  (domain types, EF entities, DTOs)
│   ├── Agent/                   (orchestrator, planner, state machine, policy)
│   ├── Tools/                   (one file per tool)
│   ├── Compute/                 (pure-code: means test, deadlines, holidays)
│   ├── Services/                (DocumentStore, CaseStore, AuditLog)
│   ├── Services/Llm/            (ILlmProvider impls + schemas + prompts)
│   ├── Endpoints/               (Minimal API route handlers)
│   └── Data/                    (AppDbContext)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types.ts             (mirrors backend Models/Dtos)
│       ├── api.ts               (typed fetch wrappers)
│       ├── styles.css
│       ├── components/
│       │   ├── StatusBadge.tsx
│       │   ├── ConfidenceBar.tsx
│       │   ├── ActivityFeed.tsx
│       │   ├── ApprovalQueue.tsx
│       │   └── ExtractedDataPanel.tsx
│       └── pages/
│           ├── CasesList.tsx
│           ├── NewCase.tsx
│           └── CaseWorkspace.tsx
│
└── samples/
    └── sample_bank_statement.pdf
```

---

## 3. The State Machine

A case is in exactly one `CaseState` at all times. The state machine defines
which tools are valid from each state. **The orchestrator MUST validate every
planner choice against this table.** Hallucinated tool selections must result
in the case being flagged, not silently allowed.

### States

| State | Meaning | Terminal? | Blocks agent? |
|---|---|---|---|
| `New` | Case row exists, no document | No | No |
| `DocumentReceived` | PDF uploaded, not yet classified | No | No |
| `Classified` | Document type identified | No | No |
| `Extracted` | Structured fields extracted | No | No |
| `AnalysesPending` | Some analyses done, others outstanding | No | No |
| `Analyzed` | All analyses complete | No | No |
| `AttorneyReviewPending` | Human must approve | No | **Yes** |
| `Approved` | Case finalized | **Yes** | Yes |
| `Flagged` | Anomaly detected, needs human | No | **Yes** |

### Valid tools per state

| State | Valid tools (plus `FlagForAttorneyReview` always) |
|---|---|
| `New` | (none) |
| `DocumentReceived` | `ClassifyDocument` |
| `Classified` | `ExtractBankStatement`, `ExtractPayStub` |
| `Extracted` | `ComputeMeansTest`, `CalculateDeadlines`, `CheckArithmeticIntegrity`, `ExtractBankStatement`, `ExtractPayStub` |
| `AnalysesPending` | `ComputeMeansTest`, `CalculateDeadlines`, `CheckArithmeticIntegrity` |
| `Analyzed` | `DraftClientEmail`, `RequestAttorneyApproval` |
| `AttorneyReviewPending` | (none — blocked on human) |
| `Approved` | (none — terminal) |
| `Flagged` | (none — blocked on human) |

### Transition rules

State transitions are driven by tool execution outcomes. The transition is
encoded in the `ToolResult.NewState` field — tools declare what state the
case moves to on success.

```
New ──upload──> DocumentReceived
DocumentReceived ──ClassifyDocument(high conf)──> Classified
DocumentReceived ──ClassifyDocument(low conf)──> Flagged
Classified ──ExtractBankStatement(high conf)──> Extracted
Classified ──ExtractBankStatement(low conf)──> Flagged
Extracted ──ComputeMeansTest──> AnalysesPending
AnalysesPending ──CalculateDeadlines──> Analyzed
Analyzed ──RequestAttorneyApproval──> AttorneyReviewPending
AttorneyReviewPending ──human approve──> Approved
AttorneyReviewPending ──human reject──> Flagged
* ──FlagForAttorneyReview──> Flagged
```

---

## 4. The Tool Catalog

Each tool implements `ITool` and declares its own `ToolPolicy`. The catalog
is exactly nine tools — no more, no less.

| Tool | Type | LLM? | Tier | Policy | Description |
|---|---|---|---|---|---|
| `ClassifyDocument` | Perception | Yes | Nano | AutoExecute | Identify document type |
| `ExtractBankStatement` | Perception | Yes | Mini | AutoExecute | Structured field extraction |
| `ExtractPayStub` | Perception | Yes | — | AutoExecute | **Stub: returns failure** |
| `ComputeMeansTest` | Computation | No | — | AutoExecute | Pure code |
| `CalculateDeadlines` | Computation | No | — | AutoExecute | Pure code (FRBP 9006) |
| `CheckArithmeticIntegrity` | Hybrid | Code primary | — | AutoExecute | Arithmetic checks |
| `DraftClientEmail` | Generation | Yes | Mini | **AskHuman** | **Stub: never sends** |
| `FlagForAttorneyReview` | State | No | — | AutoExecute | Abort lever |
| `RequestAttorneyApproval` | State | No | — | AutoExecute | Mandatory checkpoint |

### Tool contract

```csharp
public interface ITool
{
    string Name { get; }
    string Description { get; }
    ToolPolicy Policy { get; }
    Task<ToolResult> ExecuteAsync(
        CaseSnapshot snapshot,
        JsonElement input,
        CancellationToken ct);
}
```

`ToolResult` MUST include:
- `Success: bool`
- `Confidence: double` (1.0 for pure-code tools)
- `OutputSummary: string?` (one-line human-readable summary; goes into audit log)
- `Error: string?`
- `NewState: CaseState?` (state to transition to on success)
- `Persist: ToolPersistenceHint?` (extraction or analysis to save)

### Critical structural rule

**The more important the tool is for legal correctness, the less LLM is involved.**
- Means test: pure arithmetic, no LLM
- Deadlines: pure rule engine, no LLM
- Classification + extraction: LLM (it's perception, not judgment)
- Client communications: LLM, but always human-approved before sending

---

## 5. The Planner

The planner is invoked on **every step** of the agent loop. It receives a
snapshot of the case and the set of valid tools, and returns a JSON object
conforming to a strict schema. **All planner calls go to the Nano tier
(`gpt-5.4-nano`)** — see §1.

### Planner JSON schema (strict)

```json
{
  "type": "object",
  "properties": {
    "nextAction": { "type": "string", "enum": [...all tool names + "Done"] },
    "reasoning": { "type": "string" },
    "expectedOutcome": { "type": "string" },
    "alternativesConsidered": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action": { "type": "string" },
          "reasonRejected": { "type": "string" }
        },
        "required": ["action", "reasonRejected"],
        "additionalProperties": false
      }
    },
    "estimatedConfidence": { "type": "string", "enum": ["high", "medium", "low"] }
  },
  "required": ["nextAction", "reasoning", "expectedOutcome",
               "alternativesConsidered", "estimatedConfidence"],
  "additionalProperties": false
}
```

### System prompt requirements

The planner system prompt MUST:
1. State it is an orchestrator, not a legal advisor
2. List the available tools and their preconditions
3. Require alternativesConsidered with at least one rejected option
4. Tell the model to choose `FlagForAttorneyReview` if anything looks anomalous
5. Tell the model to choose `Done` only if no productive action is available

### User message requirements

Per-call user message MUST include:
- Current state
- Document count and types
- Existing extractions and analyses
- Last 10 audit events
- List of valid tools from the current state

---

## 6. The Policy Layer

`IPolicy.Evaluate(tool, snapshot, plan)` returns one of:
- `AutoExecute` — proceed without asking
- `AskHuman` — enqueue an approval and stop
- `Forbid` — log violation and stop

The default `ConfigPolicy` reads each tool's declared `ToolPolicy.DefaultDecision`.
This is the simplest viable implementation. A production system would override
per-firm via configuration.

---

## 7. The Orchestrator (control loop)

`AgentOrchestrator.RunUntilCheckpointAsync(caseId)` is the load-bearing class.

### Per iteration

1. Load case snapshot from `ICaseStore`
2. If state is terminal or blocked → stop with reason
3. Compute valid tools via `StateMachine.ValidToolsFor(state)`
4. If no valid tools → stop with reason
5. Call planner → returns `PlannerDecision`
6. Log `PlannerDecision` to audit
7. If planner returned `Done` → stop
8. **Validate** that `plan.NextAction` is in the valid tool set
   - If not → flag case, log violation, stop
9. Get tool from registry
10. Consult policy
    - `Forbid` → stop with reason
    - `AskHuman` → enqueue approval, log `ApprovalRequested`, stop
    - `AutoExecute` → continue
11. Log `ToolStarted`
12. Execute tool
13. If failed → log `ToolFailed`, stop
14. Apply result via `ICaseStore.ApplyToolResultAsync`
    - Persists extraction/analysis if hinted
    - Transitions state if `NewState` is set
15. Log `ToolSucceeded` + `StateTransitioned`
16. Loop

### Stop conditions

The loop stops when ANY of these is true:
- Cancellation requested
- Stopwatch exceeds `Agent:MaxRunDurationSeconds` (default 25)
- Step count reaches `Agent:MaxStepsPerRun` (default 8)
- Terminal state reached
- Blocked state reached (`AttorneyReviewPending` or `Flagged`)
- Planner returns `Done`
- Tool fails
- Policy forbids or asks for human

---

## 8. Persistence model

### Tables

```
Cases              (Id pk, ClientName, WorkflowTitle, Assignee, State, CreatedAt, UpdatedAt)
CaseDocuments      (Id pk, CaseId fk, FileName, StoredPath, DocumentType, UploadedAt)
Extractions        (Id pk, CaseId fk, DocumentId, ExtractionType, PayloadJson, CreatedAt)
Analyses           (Id pk, CaseId fk, AnalysisType, PayloadJson, CreatedAt)
CaseEvents         (Id pk, CaseId fk, EventType, Actor, PayloadJson, At)  ← audit log
PendingApprovals   (Id pk, CaseId fk, ToolName, PlannerReasoning, ToolInputJson,
                    RequestedAt, ResolvedAt, ResolvedBy, Decision, Notes)
```

### Critical persistence rules

- **`Case.Id` is the SHA-256 of the first uploaded document's content.**
  Same content → same case ID → idempotent uploads.
- **`CaseDocument.Id` is the SHA-256 of that document's content.**
  Same file → same document ID across cases. For the MVP first-document scenario,
  `CaseDocument.Id == Case.Id`.
- **`CaseEvents` is append-only.** Never UPDATE, never DELETE.
- **State transitions are recorded twice** — once as the new `Case.State` value,
  once as a `StateTransitioned` event in the audit log. Both views must agree.
- **Extraction/Analysis payloads are stored as JSON strings**, not normalized
  relational columns. Reason: rapid schema iteration during prototype phase.

---

## 9. API surface

All endpoints are under `/api`. Frontend calls these.

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/cases` | — | `Case[]` |
| GET | `/api/cases/{id}` | — | `Case` or 404 |
| POST | `/api/cases` | multipart: `clientName`, `document` | `Case` (201) |
| POST | `/api/cases/{id}/run` | — | `AgentRunResult` |
| GET | `/api/cases/{id}/events` | — | `CaseEvent[]` |
| GET | `/api/cases/{id}/extraction` | — | `BankStatementExtraction` or 204 |
| GET | `/api/cases/{id}/analyses` | — | `{ meansTest?, deadlines?, arithCheck? }` |
| GET | `/api/cases/{id}/approvals` | — | `PendingApproval[]` |
| POST | `/api/approvals/{id}` | `{ decision: "approve"\|"reject", notes? }` | 200 |

### API conventions

- All JSON property names are **camelCase** (configured globally in `Program.cs`)
- Errors return `{ error: string }` with appropriate HTTP status
- File uploads use `multipart/form-data`
- All other request bodies use `application/json`
- The frontend types in `types.ts` are the canonical contract — backend DTOs must match

---

## 10. Frontend structure

### Routes

```
/                       → redirect to /cases
/cases                  → CasesList page (workflow table)
/cases/new              → NewCase page (upload form)
/cases/:id              → CaseWorkspace page (the main demo)
```

### State management

- **No Redux, no Zustand, no Jotai, no Context API for app state.**
- Each page manages its own state with `useState`
- Cross-page data is re-fetched from the API on mount
- The reason: the app is small enough that a state library would be ceremonial overhead

### The activity feed animation

When `runAgent` returns, the `CaseWorkspace` page must:
1. Capture the number of new events from `result.newEvents.length`
2. Pass that as `highlightLast` to `ActivityFeed`
3. The component renders new events with a staggered slide-in animation
4. Clear the highlight after the animation finishes (~2s)

This is the **demo's perceived value moment**. The agent's reasoning unfolds
visually after the synchronous response completes.

### Component responsibilities

- `StatusBadge` — color-coded pill for each `CaseState`
- `ConfidenceBar` — visual bar + percentage, warns below threshold
- `ActivityFeed` — renders `CaseEvent[]` with type-specific formatting per event type
- `ApprovalQueue` — pending approvals with one-click approve/reject
- `ExtractedDataPanel` — extracted fields table + notable transactions + reviewer notes

---

## 11. Docker requirements

### Single container, multi-stage build

```
Stage 1 (frontend-build): node:20-alpine
  → npm install
  → npm run build
  → output: /src/dist

Stage 2 (backend-build): mcr.microsoft.com/dotnet/sdk:10.0
  → dotnet restore
  → dotnet publish -c Release -o /app/out

Stage 3 (runtime): mcr.microsoft.com/dotnet/aspnet:10.0
  → COPY backend-build /app/out → /app
  → COPY frontend-build /src/dist → /app/wwwroot
  → VOLUME ["/data"]
  → EXPOSE 8080
  → ENTRYPOINT ["dotnet", "Caseflow.dll"]
```

### docker-compose.yml requirements

- One service: `app`
- Port mapping: `8080:8080`
- Named volume mounted at `/data`
- Environment variables passed through from `.env`:
  - `LLM_PROVIDER` (Mock | OpenAI) — default Mock
  - `OPENAI_API_KEY` — only required if OpenAI
  - `LLM_MODEL_NANO` — default `gpt-5.4-nano` (planner + classification)
  - `LLM_MODEL_MINI` — default `gpt-5.4-mini` (extraction + generation)
  - `LLM_CONFIDENCE_THRESHOLD` — default 0.70
  - `AGENT_MAX_STEPS` — default 8
  - `AGENT_MAX_DURATION_SECONDS` — default 25
- Connection string and storage paths point at `/data` inside the container

### SPA fallback requirement

The .NET pipeline MUST include `app.MapFallbackToFile("index.html")` AFTER all
`/api` route mappings. Without this, `/cases/abc123` refreshes will return 404.

---

## 12. Failure modes and required handling

### Planner returns invalid tool
- Don't execute it
- Log the violation as an event
- Move case to `Flagged`
- Stop the loop

### Tool throws an exception
- Catch at orchestrator level
- Log `ToolFailed` with the exception message
- Stop the loop; do NOT advance state

### LLM call fails (network, rate limit, parse error)
- Treat as tool failure
- Log and stop; user can retry

### Same document uploaded twice
- SHA-256 collision check returns existing case
- Return 201 Created with the existing case ID
- Do NOT re-run the agent automatically

### Agent runs longer than 25 seconds
- Stop gracefully with `"Max duration exceeded — click Run Agent to continue"`
- State is persisted as of the last completed step
- User can click "Run Agent" again to resume

---

## 13. What is out of scope

The README must contain an explicit "Out of scope for this prototype" section
listing at minimum:

- Authentication / multi-tenancy
- Real PACER integration
- Multiple workflow types
- Multiple document types beyond bank statements (PayStub is a stub)
- Cloud storage
- Production observability (OTEL, metrics)
- Retries / circuit breakers on LLM calls
- Streaming agent responses (SSE)
- Real means-test inputs (uses bank deposits as proxy)
- Real federal holiday calendar (hardcoded 2026)
- Tests beyond a single calculator unit test
- Per-firm policy configuration UI
- Production database (uses SQLite)

---

## 14. Build order (for Claude Code)

Build in this order. Do not skip ahead. Verify each step before continuing.

### Phase 1 — Boot the skeleton (target: 60 minutes)
1. Repo structure + `.gitignore` + `.dockerignore` + `.env.example`
2. `backend/Caseflow.csproj` with all NuGet packages
3. `backend/appsettings.json`
4. `backend/Properties/launchSettings.json` (port 5050 for dev — port 5000 is reserved by macOS AirPlay Receiver)
5. `backend/Models/` — all model classes
6. `backend/Data/AppDbContext.cs`
7. `backend/Program.cs` — composition root with DB init
8. **Verify:** `dotnet run` boots, `GET /api/cases` returns `[]`

### Phase 2 — Backend agent skeleton (target: 90 minutes)
9. `backend/Agent/StateMachine.cs`
10. `backend/Agent/CaseSnapshot.cs`
11. `backend/Agent/IPlanner.cs`, `PlannerSchema.cs`, `PlannerPrompt.cs`
12. `backend/Agent/MockPlanner.cs` (build this BEFORE OpenAiPlanner)
13. `backend/Agent/IPolicy.cs`, `ConfigPolicy.cs`
14. `backend/Tools/ITool.cs`, `ToolRegistry.cs`
15. `backend/Services/IDocumentStore.cs`, `DocumentStore.cs`
16. `backend/Services/IAuditLog.cs`, `AuditLog.cs`
17. `backend/Services/ICaseStore.cs`, `CaseStore.cs`
18. `backend/Agent/AgentOrchestrator.cs`
19. **Verify:** unit test or `dotnet run` + manual log inspection

### Phase 3 — Tools (target: 60 minutes)
20. `FlagForAttorneyReviewTool` (simplest; build first)
21. `RequestAttorneyApprovalTool`
22. `Compute/MeansTestCalculator.cs`, `DeadlineEngine.cs`, `FederalHolidayCalendar.cs`
23. `ComputeMeansTestTool`, `CalculateDeadlinesTool`, `CheckArithmeticIntegrityTool`
24. `Services/Llm/ILlmProvider.cs`, `ClassificationSchema.cs`, `BankStatementSchema.cs`, `LlmPrompts.cs`
25. `Services/Llm/MockLlmProvider.cs` (build BEFORE OpenAiLlmProvider)
26. `ClassifyDocumentTool`, `ExtractBankStatementTool`
27. `ExtractPayStubTool` (stub), `DraftClientEmailTool` (stub)
28. **Verify:** wire all tools into `Program.cs`, manually invoke orchestrator

### Phase 4 — API endpoints (target: 45 minutes)
29. `backend/Endpoints/CasesEndpoints.cs`
30. `backend/Endpoints/ApprovalsEndpoints.cs`
31. **Verify:** every endpoint from §9 returns the expected shape

### Phase 5 — Frontend (target: 90 minutes)
32. `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
33. `frontend/src/main.tsx`, `App.tsx`, `types.ts`, `api.ts`, `styles.css`
34. Components in order: `StatusBadge`, `ConfidenceBar`, `ActivityFeed`, `ApprovalQueue`, `ExtractedDataPanel`
35. Pages in order: `CasesList`, `NewCase`, `CaseWorkspace`
36. **Verify:** `npm run dev`, create a case, run the agent, see the activity feed populate

### Phase 6 — Real OpenAI (target: 45 minutes)
37. `Services/Llm/OpenAiLlmProvider.cs`
38. `Agent/OpenAiPlanner.cs`
39. **Verify:** set `Llm:Provider=OpenAI`, upload real PDF, run agent

### Phase 7 — Docker (target: 30 minutes)
40. `Dockerfile` (multi-stage)
41. `docker-compose.yml`
42. **Verify:** `docker compose up --build` works, all features work in container

### Phase 8 — Polish (target: 30 minutes)
43. README screenshots (3)
44. README final pass
45. `git push`

---

## 15. Acceptance criteria

The build is "done" when ALL of these are true:

- [ ] `docker compose up --build` boots without errors
- [ ] http://localhost:8080 shows the workflow table
- [ ] Clicking "Initiate Case" with a PDF creates a case in `DocumentReceived`
- [ ] Clicking "Run Agent" advances the case through `Classified` → `Extracted` → `AnalysesPending` → `Analyzed` → `AttorneyReviewPending`
- [ ] Activity feed shows planner reasoning for each step
- [ ] Extracted data panel populates with extracted fields and confidence scores
- [ ] Approval queue shows the pending sign-off
- [ ] Clicking "Approve" moves the case to `Approved`
- [ ] Refreshing `/cases/{id}` preserves all state (data persists)
- [ ] Stopping and restarting the container preserves data (volume works)
- [ ] Same PDF uploaded twice returns the same case (idempotency)
- [ ] Submitting a case with `LLM_PROVIDER=Mock` requires no API key
- [ ] Submitting with `LLM_PROVIDER=OpenAI` and a valid key works end-to-end
- [ ] README explains every architectural decision
- [ ] No commented-out code, no TODO comments left behind

---

*End of design specification. If anything in this document conflicts with
CLAUDE.md, this document wins. If anything in either conflicts with how
the code should actually work, ask before deviating.*
