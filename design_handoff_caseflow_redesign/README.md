# Handoff: Caseflow Redesign

## Overview

This handoff covers a visual redesign of **Caseflow**, an internal tool for running AI-agent workflows on legal matters (currently focused on Chapter 7 bankruptcy intake). The redesign refreshes the visual language to feel like a modern, vibrant SaaS product — vibrant gradient brand mark, bold geometric typography, soft tinted status pills, icon-only sidebar, rounded surfaces with subtle shadows, and an optional dark mode.

The redesign covers three core screens:

1. **Cases list** — table of all open matters with a KPI strip and filters
2. **Case detail** — a single matter showing the agent execution trace (planner decisions, tool calls, approvals) alongside extracted data and approvals
3. **Initiate case** — a modal sheet for opening a new matter

The existing app is React; the handoff assumes you'll port the design into that codebase.

---

## About the Design Files

The files in `prototype/` are **design references created as a static HTML/React prototype**. They are not production code to copy directly. Your task is to **recreate these designs in the existing Caseflow React app**, using its established component library, routing, state management, and data layer.

Read the prototype as a **visual spec + interaction spec**, not as a starting codebase:

- The prototype uses inline `<style>` blocks with CSS custom properties — in the real app, these should map to whatever styling solution the codebase uses (CSS modules, Tailwind, styled-components, vanilla-extract, etc.).
- All data in the prototype is **mocked** in `shared-data.jsx`. The real app already has the data model — wire the components to the real API/store instead.
- The prototype uses React 18 via UMD + Babel-in-browser for ease of iteration. Production code should obviously use the real build pipeline.

If a detail is ambiguous, prefer the codebase's existing conventions over the prototype's specifics.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii, shadows, and interactions are intentional and final. Pixel-match where reasonable; deviate only where required to integrate with existing primitives in the codebase.

---

## How to View the Prototype

Open `prototype/Caseflow.html` in a browser. You'll see all three screens laid out on a pan/zoom design canvas. Each artboard is itself a fully clickable prototype — clicking a row in the cases list navigates to the detail screen, the breadcrumb returns to the list, and "+ Initiate case" opens the modal.

The **Tweaks** panel in the bottom-right lets you swap the gradient palette, toggle dark mode, and change the extracted-data confidence style. The selected combination is the intended default unless noted.

---

## Design Tokens

All values are exact — use these in the implementation.

### Brand Gradient

The primary brand mark, gradient CTAs, and decorative accents use a 3-stop linear gradient at 95deg:

```css
--g1: #8B5CF6;   /* violet-500 */
--g2: #EC4899;   /* pink-500 */
--g3: #F97316;   /* orange-500 */
background: linear-gradient(95deg, var(--g1) 0%, var(--g2) 55%, var(--g3) 100%);
```

Solid accent (for borders, focus rings, secondary highlights):
```css
--accent:      #7C3AED;   /* violet-600 — solid */
--accent-soft: #F1ECFE;   /* hairline tint */
--accent-ink:  #4C1D95;   /* violet-900 — readable text on accent-soft */
```

Three alternate palettes are defined as Tweaks (Ocean / Citrus / Forest) — not needed for v1 ship.

### Surfaces & Ink (light mode)

```
--bg:        #F1F2F4   page background
--bg2:       #E9EAEE
--surface:   #FFFFFF   cards, tables, modal
--surface-2: #F7F8FA   secondary surfaces (input fills, table headers)
--ink:       #0E0F14   primary text
--ink-2:     #1F2330   secondary text
--muted:     #6E7280   muted labels
--faint:     #A6ABB5   placeholders, chevrons
--line:      #E6E8EE   1px borders
--linex:     #D8DBE3   stronger borders (inputs, dividers)
--hover:     #F3F4F8   hover background
```

### Surfaces & Ink (dark mode)

```
--bg:        #0B0C10
--bg2:       #15171D
--surface:   #15171D
--surface-2: #1B1E26
--ink:       #F4F5F7
--ink-2:     #E6E8EE
--muted:     #8C92A0
--faint:     #5C6373
--line:      #23262F
--linex:     #2C3140
--hover:     #1E2129
```

### Semantic Colors (light → dark)

| Token         | Light                                                  | Dark                                                   |
|---------------|--------------------------------------------------------|--------------------------------------------------------|
| good          | `#10B981` / soft `#D7F5E6` / ink `#065F46` / border `#A8EBC8` | `#34D399` / soft `#0C2A20` / ink `#86EFAC` / border `#10522E` |
| warn          | `#F59E0B` / soft `#FEF3C7` / ink `#92400E` / border `#FCD78A` | `#FBBF24` / soft `#2B2110` / ink `#FCD34D` / border `#5C4413` |
| info          | `#3B82F6` / soft `#DBEAFE` / ink `#1E40AF` / border `#A5C7FB` | `#60A5FA` / soft `#101F36` / ink `#93C5FD` / border `#1E3A6B` |
| danger        | `#EF4444` / soft `#FEE2E2` / ink `#991B1B` / border `#FCA5A5` | `#F87171` / soft `#2E1313` / ink `#FCA5A5` / border `#5F1F1F` |
| gray (draft)  | `#EEF0F4` soft / `#4B5260` ink                         | `#22252D` soft / `#9CA3AF` ink                         |

### Status Pill Mapping

| State                | Token   | Icon       | Label             |
|----------------------|---------|------------|-------------------|
| `Approved`           | good    | check      | "Completed"       |
| `Processing`         | info    | zap        | "Processing"      |
| `Awaiting attorney`  | warn    | clock      | "Awaiting attorney" |
| `Draft`              | gray    | dot        | "Draft"           |
| `Needs documents`    | danger  | dot        | "Needs documents" |

### Typography

**Family**: `Plus Jakarta Sans` (Google Fonts) — weights 400, 500, 600, 700, 800. Fallback `Inter Tight`, `Inter`, system sans.

**Mono**: `JetBrains Mono` (Google Fonts) — used for IDs, timestamps, tool names, file names.

```
font-feature-settings: 'ss01', 'cv11';      /* on body */
font-feature-settings: 'ss02';              /* on mono */
letter-spacing: -0.005em;                   /* body default */
```

Scale:

| Class    | Size    | Weight | Letter-spacing | Use                         |
|----------|---------|--------|----------------|-----------------------------|
| h1       | 48px    | 700    | -0.032em       | Page title (Cases / client) |
| h2       | 24px    | 700    | -0.020em       | Modal headline              |
| h3       | 15px    | 700    | -0.005em       | Card headers                |
| body     | 14px    | 400    | -0.005em       | Default                     |
| small    | 13px    | 400    | -0.005em       | Table rows, descriptions    |
| meta     | 11–12px | 500–700| 0–0.10em       | Eyebrows, labels, badges    |
| eyebrow  | 11px    | 700    | 0.10em UPPER   | Section labels              |
| mono     | 11–12px | 500–600| 0              | IDs, timestamps             |

KPI numerals: 30px / 700 / -0.02em.

### Spacing

Default spacing scale used in the prototype:
- 4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 24 / 28 / 36 / 48 / 60 px.
- Page horizontal padding: 36px desktop, 28px topbar.
- Card body padding: 14px 22px (top/bottom × sides) for content; 16px 22px for headers.
- Table row vertical padding: 14px.

### Radii

- Pills, avatars, search box, brand mark: 99px (fully rounded)
- Buttons: 99px (pill)
- Cards: 18px
- Modal sheet: 22px
- Table wrapper: 16px
- Inputs / drop zone: 12px
- Workflow option tile: 14px
- KPI: 16px
- Icon button (square): 10px
- Sidebar icon button: 10px
- Brand mark inner gloss: 9px (inset 2px)

### Shadows

```css
--shadow:    0 1px 2px rgba(15,17,23,0.04), 0 6px 22px -8px rgba(15,17,23,0.08);
--shadow-lg: 0 30px 60px -20px rgba(15,17,23,0.16);
```

Dark mode shadows use higher alpha:
```css
--shadow:    0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -10px rgba(0,0,0,0.5);
--shadow-lg: 0 30px 60px -20px rgba(0,0,0,0.6);
```

Brand mark glow:
```css
box-shadow: 0 4px 14px -2px color-mix(in srgb, var(--g2) 50%, transparent);
```

Gradient button glow:
```css
box-shadow: 0 6px 18px -4px color-mix(in srgb, var(--g2) 55%, transparent);
/* on hover */
box-shadow: 0 10px 22px -4px color-mix(in srgb, var(--g2) 60%, transparent);
```

### Icons

Custom inline SVGs (Feather-style: `stroke-width=1.6`, `stroke-linecap=round`, `stroke-linejoin=round`) defined in `aurora.jsx` in the `Ic` object. Glyphs used:

- `inbox`, `briefcase` (cases), `doc`, `sparkle` (agent / planner), `flow` (workflows), `bell`, `cog`, `search`, `plus`, `check`, `clock`, `zap` (tool started), `upload`, `sun`, `moon`, `arrow`, `arrow_l`, `more`, `dot`

If the codebase already has an icon set (e.g., Lucide, Phosphor, custom), substitute equivalents at matching weights. **Lucide** is the closest match to the Feather-derived style used here and is recommended.

### Avatars

Initials avatars use a hashed pick from 6 two-stop linear gradients:

```js
['#8B5CF6','#EC4899'],
['#0EA5E9','#6366F1'],
['#F59E0B','#EF4444'],
['#10B981','#0EA5E9'],
['#EC4899','#F97316'],
['#6366F1','#A855F7'],
```

Sizes:
- Sidebar self-avatar: 34px round, 12px / 700 white text, gradient ring `box-shadow: 0 0 0 2px var(--bg), 0 0 0 3px var(--linex)`
- Table row avatar: 34px round, 12px / 700, `inset 0 0 0 1.5px rgba(255,255,255,0.25)` highlight ring
- Detail hero avatar: 64px / radius 20px (squircle), 22px / 700, with `var(--shadow)`

---

## Screens

### Screen 1 — Cases List

**Purpose**: Triage view. Skim active matters, see what needs attention, drill into one.

**Layout** (1440 × 900 reference):
- Grid: `68px sidebar | 1fr main`
- Main is `flex column`: `topbar (auto) | scroll body (1fr)`
- Page body: `padding: 28px 36px 60px; max-width: 1320px; margin: 0 auto`

**Sidebar** (68px wide, full height):
- 18px top padding, items vertically stacked, gap 6px, centered.
- Brand mark (36×36, radius 11px) with gradient + radial gloss overlay + box-shadow.
- 1px horizontal divider (24px wide) under brand.
- Nav buttons (40×40, radius 10px): icons only. Active item has `background: var(--surface)` + `box-shadow: var(--shadow)`. Hover: `background: var(--hover)`.
- Badge dot: top-right of nav button, min-width 14, height 14, radius 99, gradient accent or warn color, 2px outline ring matching bg.
- Sidebar items: Cases (active, badge 2), Documents, Agent, Flows, Inbox (badge 4).
- Bottom group (auto margin): bell (badge 3, warn), cog, self-avatar.

**Topbar** (auto height, sticky-ish — actually scrolls within the artboard since each artboard is a self-contained desktop frame):
- `padding: 14px 28px; border-bottom: 1px solid var(--line)`.
- Left: breadcrumb (`Caseflow / Cases`). Sep is `/` in `--linex`, current is `--ink`.
- Right: icon buttons (theme toggle, search), then gradient CTA `+ Initiate case`.

**Hero row**:
- Eyebrow text: "Chapter 7 Intake · Matthews & Associates".
- h1 "Cases" (48 / 700 / -0.032em).
- Right side: pill buttons `↑ Import` and dark-ink `★ Run all`.

**KPI strip** — 4-column grid, gap 14, margin-top 22:
- Each KPI card: `padding: 16px 18px`, radius 16, surface bg, 1px border, `var(--shadow)`.
- Eyebrow label / 30px bold number / 12px muted delta (with up/down arrows colored `var(--good)`).
- KPI #2 ("Awaiting review") uses `color: var(--warn-ink)` on the number.

KPI content (exact copy):
1. ACTIVE — `6` — ↑ 2 this week
2. AWAITING REVIEW — `2` — avg wait `1.2h`
3. APPROVED · 30D — `28` — ↑ 12% vs prior
4. TIME TO FILE — `4.1d` — ↓ 1.8d with agent

**Filter toolbar** (margin-top 24, gap 8):
- Pill tabs: All / Open / Needs attention / Completed
  - Inactive: transparent, muted text, no border.
  - Active: surface bg, 1px border `var(--linex)`, ink text, soft shadow.
  - Each shows a count chip: small pill with `--gray-soft` / `--accent-soft` when active.
- Right (margin-left auto): search input
  - Pill (radius 99), 7px 13px padding, surface bg, 1px `--linex` border, 280px min-width.
  - Magnifier icon (`Ic.search`), input, then `⌘K` kbd chip.
  - Focus-within: border becomes `--accent`.

**Cases table**:
- Wrapper: surface bg, 1px border, radius 16, `var(--shadow)`, margin-top 16, `overflow: hidden`.
- Header row: surface-2 bg, 11px / 700 / 0.06em uppercase muted text, padding 12px 18px.
- Body rows: hover background `--hover`, cursor pointer.
- Cell padding: 14px 18px.

Columns:
1. **Client** — avatar (34px round) + name (14 / 600) + truncated mono ID (`fullId.slice(0,14) + '…'`)
2. **Workflow** — muted 13px text
3. **Status** — `<AurPill state={…} />`
4. **Docs** — mono 13px muted
5. **Updated** — 13px text + 11px muted absolute date below
6. **Chevron** — `›` in `--faint`, right-aligned

Empty filter result: full-width row with 48px padding, centered muted text "No matters match your filter."

**Footer**: padding `14px 36px`, 11px faint, "Caseflow · Chapter 7 intake" on left and "v0.4.2 · agent build 218" mono on right.

### Screen 2 — Case Detail

**Purpose**: Show everything Caseflow knows and did about one matter — agent reasoning, approvals, extracted fields.

**Topbar**: Breadcrumb is `Caseflow / Cases / <client name>`. Right side: `← Back` ghost pill + gradient `★ Run agent` pill.

**Hero row**:
- 64px squircle avatar (radius 20, gradient bg from hash, 22 / 700 white initials).
- Right side stacked: eyebrow "Matter", h1 (48 / 700), meta row.
- Meta row: mono ID chip (rounded pill with surface bg + `--linex` border) · workflow name in muted 13 · `·` separator · status pill.

**Layout**:
- `display: grid; grid-template-columns: 1fr 380px; gap: 24px; margin-top: 28px; align-items: start;`
- Left: **Agent trace** card.
- Right: **Approvals** card + **Extracted data** card stacked.

#### Card shell

```css
background: var(--surface);
border: 1px solid var(--line);
border-radius: 18px;
box-shadow: var(--shadow);
overflow: hidden;
```

Header: `padding: 16px 22px; border-bottom: 1px solid var(--line); flex with title + meta`.
Body: `padding: 14px 22px 18px`.

#### Agent trace

Each event is a 2-column grid (`24px gutter | 1fr content`), 14px vertical padding, 1px bottom divider (none on last).

**Gutter**:
- Vertical line `1.5px` `--line`, centered at `left: 11px`, runs top to bottom; first event's line starts at `top: 24px`, last event's line stops at `height: 14px` (so the dot is always anchored cleanly).
- Node: 18×18 round, 2px border, centered icon inside (9×9), background depending on type:
  - Agent → `border: var(--accent)`, `color: var(--accent)`, `background: var(--accent-soft)`
  - Good (tool success, approval granted) → `border: var(--good)`, `color: var(--good)`, `background: var(--good-soft)`
  - Human → `border: var(--ink)`, `background: var(--ink)`, `color: var(--bg)`
  - Attention (approval requested) → `border: var(--warn)`, `color: var(--warn)`, `background: var(--warn-soft)`

**Content head row** (flex, gap 9, wrap):
- Kind label: 11 / 700 / 0.04em uppercase, color depends on type (accent-ink for agent, good-ink for good, warn-ink for attn, ink default).
- Actor chip: 10 / 600, padding 2 7, radius 99
  - `agent` → accent-soft + accent-ink
  - `human` → ink bg + bg color text
  - `system` → gray-soft + gray-ink
- Timestamp: mono 11, muted, `margin-left: auto`.

**Content body** — varies by `kind`:
- **document_uploaded**: title row holds the filename as an `au-tool` chip (mono 12 / 600, surface-2 bg, line border, radius 6, padding 2 8). Body line: file meta ("247 KB · PDF").
- **case_created**: title only.
- **planner_decided**:
  - Title: "Next → `<tool-name as chip>` `<confidence chip>`"
  - **Reasoning block**: `padding: 11px 14px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); border-left: 3px solid var(--accent); color: var(--ink-2); font-size: 13px;` — appears below title, margin-top 10.
  - **Disclosure** button below reason: `▶ N alternatives considered`, muted 12. Toggling reveals a dashed-border tile with `<alternatives>` — each row shows a struck-through tool name (mono 11, `text-decoration: line-through`, opacity 0.7) and a muted reason.
- **tool_started**: "`<tool>` running…"
- **tool_succeeded**: "`<tool>` succeeded" + body line with result text.
- **state_changed**: title is two pills with a `→` between (e.g. `Pending` → `Classified`).
- **approval_requested**: title is tool chip + arrow + assignee name.
- **approval_granted**: title "M. Chen approved" + a reason block styled as `good`: `border-left: var(--good); background: var(--good-soft); color: var(--good-ink); content: "<note>" in smart quotes`.

#### Approvals card

Stacked rows separated by 1px bottom border.

Each row: justify-between flex, gap 12, padding 12 0:
- Left: mono name (e.g. `RequestAttorneyApproval`) + 11px muted meta (e.g. `approve · human`).
- Right (text-align right): approved pill + 11px muted "by M. Chen · 11:42:05 PM".

#### Extracted data card

Header right: `min 93%` (computed min confidence) in mono 12 muted.

Each row: padding 13 0, 1px bottom border (none on last).
- Top line (flex baseline justify-between): key (12 muted) · value (14 / 600 ink, right-aligned, max 180px).
- Confidence row (margin-top 8, flex gap 10):
  - **Bar** (default): 5px tall meter, `--gray-soft` track, `--good` (or `--warn` if <95%) fill. Right side: mono 11 percent label.
  - **Chip** alt: small mono 10 / 700 pill, good or warn coloring.
  - **Dots** alt: 5 dots, filled = round(value × 5), good or warn fill.

### Screen 3 — Initiate Case (modal)

**Trigger**: gradient `+ Initiate case` CTA on the topbar.

**Overlay**: full-bleed absolute, `background: color-mix(in srgb, var(--ink) 35%, transparent); backdrop-filter: blur(8px); z-index: 30;` Flex center, 24px padding.
- Fade-in animation (200ms ease).
- Click overlay → close.

**Sheet**:
- 600px wide max, surface bg, 1px line, radius 22, shadow-lg.
- `max-height: 92%`, flex column.
- Pop-in animation: `cubic-bezier(.34, 1.4, .5, 1)` 250ms; from `translateY(12px) scale(0.97), opacity 0` to `translateY(0) scale(1), opacity 1`.

**Header**:
- `padding: 22px 26px; border-bottom: 1px solid var(--line);`
- Top edge accent: `::before` 3px gradient strip across full width.
- Title h2 (20 / 700) "Initiate case" + 13 muted subtitle "Open a new matter. The intake agent starts once a document arrives."
- Close button: 32×32 round, surface-2 bg, 1px linex border, muted color, hover → ink + hover bg.

**Body** (`padding: 22px 26px`, scrollable):

Field group spacing: margin-bottom 18, label is 11 / 700 / 0.08em uppercase muted with 8px bottom margin.

1. **Client name** — text input.
   - `padding: 11px 14px; border: 1px solid var(--linex); border-radius: 12px; background: var(--surface-2); font-size: 14px;`
   - Focus: `border: var(--accent); background: var(--surface); box-shadow: 0 0 0 4px var(--accent-soft);`
2. **Workflow** — radio tiles, gap 8.
   - Each tile: `padding: 14px 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface-2);`
   - Hover: linex border + hover bg.
   - Selected: accent border + accent-soft bg.
   - Radio dot: 18×18 round, 2px border `--linex`, surface bg. When selected: accent border + filled inner circle (inset 3px) in accent color.
   - Title `h4` (14 / 700) + 12 muted description.
3. **Initial documents (optional)** — drop zone.
   - Dashed 1.5px linex border, radius 14, padding 28, centered, surface-2 bg.
   - Icon (36px square, radius 11, surface bg + line border) with upload glyph in accent color.
   - Hover: accent border + accent-ink text + accent-soft bg.
   - Click cycles file count up (in prototype) — in real app, open file picker.

**Footer**:
- `padding: 16px 26px; border-top: 1px solid var(--line); background: var(--surface-2);`
- Flex justify-between.
- Left: muted "Step 1 of 1" eyebrow.
- Right: ghost `Cancel` pill + gradient `Open matter →` pill (disabled if client name empty — `opacity: 0.5; pointer-events: none`).

**Workflow options** (from `shared-data.jsx`):
- `Chapter 7 Intake` — Liquidation — bank statements, schedules, means test
- `Chapter 13 Intake` — Reorganization plan with 3–5 year repayment
- `Immigration — I-130` — Petition for relative; supporting evidence pack
- `General matter intake` — Open-ended ingestion for review

---

## Interactions & Behavior

### Navigation
- **Click case row** → navigate to `/cases/:id` (case detail).
- **Click breadcrumb segment / Back button** → navigate to `/cases` (list).
- **Click brand mark in sidebar** → also returns to list.
- **+ Initiate case** → opens modal.
- **Click overlay or ✕** → close modal.

### Hover states
- Buttons: `transform: translateY(-1px)` on hover, background-shift.
- Table rows: `background: var(--hover)`.
- Sidebar nav: background-shift.
- Drop zone: border + text + bg shift to accent.

### Animations
- Modal fade-in: 200ms ease (overlay).
- Modal pop-in: 250ms `cubic-bezier(.34, 1.4, .5, 1)`.
- Processing pill `dot`: 1.2s pulse opacity 0.4 ↔ 1.

### Form validation
- "Open matter" button is disabled (visually + functionally) until client name is non-empty.

### Dark mode
- Toggle via topbar sun/moon button.
- All semantic tokens swap; gradient and accent stay vibrant.
- Persist to local storage / user preference in real app.

### Confidence display
- 3 styles (bar / chip / dots) — choose **bar** as default. The other two are available as a Tweak in the prototype; in production, this could be a user setting or hard-pinned to "bar".

---

## State Management

The prototype keeps minimal state:

```js
const [screen, setScreen]       // 'list' | 'detail' | 'initiate'
const [openId, setOpenId]       // case id under inspection
const [sheet, setSheet]         // boolean — modal open
const [dark, setDark]           // boolean — dark mode
const [cases, setCases]         // array of cases
```

In the real app:
- Use the existing router for `screen` / `openId` (e.g. `/cases`, `/cases/:id`).
- Modal open state lives in route state or a UI store.
- Dark mode is per-user preference, persisted server-side.
- Cases come from the existing API/store; do not duplicate the mock array.

---

## Data Model (as used in the prototype)

See `prototype/shared-data.jsx` for the exact shape. Key fields per case:

```ts
{
  id: string,                    // short id (12 chars)
  fullId: string,                // full id (~19 chars), displayed mono
  client: string,
  workflow: string,              // e.g. "Chapter 7 Intake"
  state: 'Approved' | 'Processing' | 'Awaiting attorney' | 'Draft' | 'Needs documents',
  updated: string,               // absolute, formatted
  updatedRel: string,            // relative ("2 min ago")
  documents: number,
  activity?: ActivityEvent[],    // only on detailed cases
  extracted?: ExtractedField[],
  approvals?: Approval[],
}

type ActivityEvent =
  | { kind: 'document_uploaded', actor: 'system', time, title, meta }
  | { kind: 'case_created',      actor: 'system', time, title }
  | { kind: 'planner_decided',   actor: 'agent',  time, tool, confidence: 'high' | …,
       reasoning: string, alternatives: { tool, reason }[] }
  | { kind: 'tool_started',      actor: 'agent',  time, tool }
  | { kind: 'tool_succeeded',    actor: 'agent',  time, tool, result }
  | { kind: 'state_changed',     actor: 'agent' | 'system', time, from, to }
  | { kind: 'approval_requested',actor: 'agent',  time, approval, assignee }
  | { kind: 'approval_granted',  actor: 'human',  actorName, time, approval, note };

type ExtractedField = { field: string, value: string, confidence: number /* 0..1 */ };

type Approval = { name: string, kind: string, status, by, at, note? };
```

The real app already has these types — wire to that. The `kind` strings above are the prototype's labels; map to whatever the backend emits.

---

## Files in this Handoff

```
prototype/
├── Caseflow.html         Entry point — open in a browser
├── aurora.jsx            All app components: Sidebar, Topbar, List, Detail, Initiate, helpers
├── shared-data.jsx       Mock data (cases, activity, extracted, approvals, workflows)
├── tweaks-panel.jsx      Tweaks UI (dev-only — can be ignored when porting)
└── design-canvas.jsx     Side-by-side artboard canvas (dev-only — can be ignored when porting)
```

`tweaks-panel.jsx` and `design-canvas.jsx` are scaffolding for the design preview itself — they exist to help compare and tweak the design. They are not part of the product UI and do not need to be ported.

The actual product code to study is **`aurora.jsx`**. Component breakdown:

| Component             | What it is                                       |
|-----------------------|--------------------------------------------------|
| `AuroraApp`           | Top-level shell, manages screen + modal state    |
| `AurSidebar`          | Icon-only left rail                              |
| `AurTopbar`           | Breadcrumb + actions (search, theme, CTA)        |
| `AurList`             | Cases page (hero, KPI strip, filters, table)     |
| `AurDetail`           | Case detail (hero, trace card, side rail)        |
| `AurInitiate`         | Modal sheet for new matter                       |
| `AurPill`             | Status pill (state-aware)                        |
| `AurConfidence`       | Bar / chip / dots renderer                       |
| `auAvatar(name)`      | Hash → gradient + initials                       |
| `Ic`                  | Inline SVG icon set                              |
| `aurora(accent, dark, conf)` | CSS string generator returning all tokens |

---

## Assets

No external image assets — everything is SVG icons drawn inline or CSS gradients. Avatars are gradient + initials. Logo is a gradient-filled rounded square with a stylized "C" glyph (Plus Jakarta Sans 800, white, slight text-shadow).

If the real app has a finalized logo SVG, use that in place of the prototype's gradient square — keep the same 36×36 / radius-11 frame and the gradient glow shadow.

---

## Implementation Notes

- **Plus Jakarta Sans** is available on Google Fonts. If the codebase already uses a different geometric sans (Inter, Geist, General Sans), audit a couple of headings side-by-side first — Plus Jakarta is intentionally a bit rounder and friendlier than Inter. The closest paid alternative is General Sans (Fontshare).
- **`color-mix()`** is used for gradient glows. It's CSS Color Module Level 5 — universal in evergreen browsers (Chrome 111+, Safari 16.2+, Firefox 113+). Polyfill or hand-resolve if you need to support older browsers.
- **Dark mode**: prototype handles light/dark by swapping all token values. If the codebase already has a theme provider, wire these tokens into it rather than duplicating the swap logic.
- **No icons library is required**, but adopting Lucide will save you from porting the inline SVGs and keep visual consistency with the rest of the app.
- The table is intentionally not paginated in the v1 — add pagination / virtualization patterns that match the codebase.
- The KPI numbers are mocked. Wire to real metrics (active count, awaiting-review count, 30-day approvals, time-to-file SLA).
- Search (`⌘K`) is non-functional in the prototype — should open the existing app's command palette or be a simple debounced client-side filter.

---

## Acceptance / QA

When implemented, the design is "done" when:
- All three screens render with the colors, type, radii, and spacing above (light mode default).
- A user can: open the list → click a row → land on the detail → use Back/breadcrumb to return → click `+ Initiate case` → see the modal → fill the form → submit → see the new draft case prepended to the list.
- Status pills use the correct semantic color + icon.
- Agent trace renders all event `kind` variants with their distinct treatments (especially the `planner_decided` reasoning block + alternatives disclosure).
- Confidence bar in the right rail correctly shows green ≥95% and amber <95%.
- Dark mode swaps cleanly and the gradient brand mark remains vivid.
- The modal animates in/out and traps focus while open.

Out of scope for v1 (mentioned but optional):
- Document viewer (PDF + extracted fields side-by-side).
- Live "agent running" event-stream view.
- Settings / workflow builder.
- The 3 alternate accent palettes — ship Aurora (purple/pink/orange) as the only default.
