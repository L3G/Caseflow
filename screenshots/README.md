# Screenshots

Three screenshots are referenced from the repo root [`README.md`](../README.md):

| File | What it shows |
|---|---|
| `01-cases-list.png` | The workflow table (one or more cases visible with state badges) |
| `02-workspace-running.png` | A case workspace mid-animation (events sliding in) or right after a Run Agent — full activity feed, extracted data panel, analyses |
| `03-approved.png` | A case in the `Approved` state with the approval queue showing the resolved approval |

## How to capture

1. `docker compose up --build`
2. Open http://localhost:8080
3. Capture screenshot 01 (after creating a couple of cases)
4. Click into a case workspace and click "Run agent"; capture screenshot 02 during or just after the staggered slide-in
5. Click "Approve" on the pending approval; capture screenshot 03 once the case shows `approved`

Save the PNGs in this directory with the filenames above.
