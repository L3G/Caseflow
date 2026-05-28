// Caseflow · Aurora — vibrant rounded SaaS direction.
// Soft cool-gray surface, bold geometric sans, gradient brand mark,
// icon-only sidebar, tinted status pills, optional dark mode.

const { useState: uS, useMemo: uM, useEffect: uE } = React;

// ── Accent palettes ────────────────────────────────────────────────────────
const AURORA_ACCENTS = {
  // gradient stops + solid accent + soft tint
  aurora: { g1:'#8B5CF6', g2:'#EC4899', g3:'#F97316', accent:'#7C3AED', soft:'#F1ECFE', ink:'#4C1D95' },
  ocean:  { g1:'#0EA5E9', g2:'#6366F1', g3:'#A855F7', accent:'#4F46E5', soft:'#EEF0FF', ink:'#3730A3' },
  citrus: { g1:'#F59E0B', g2:'#F97316', g3:'#EF4444', accent:'#EA580C', soft:'#FFF1E5', ink:'#7C2D12' },
  forest: { g1:'#10B981', g2:'#0EA5E9', g3:'#8B5CF6', accent:'#059669', soft:'#E6F8F1', ink:'#064E3B' },
};

function aurora(accent, dark, cf) {
  const a = AURORA_ACCENTS[accent] || AURORA_ACCENTS.aurora;
  const light = `
    --bg:#F1F2F4; --bg2:#E9EAEE; --surface:#FFFFFF; --surface-2:#F7F8FA;
    --ink:#0E0F14; --ink-2:#1F2330; --muted:#6E7280; --faint:#A6ABB5;
    --line:#E6E8EE; --linex:#D8DBE3; --hover:#F3F4F8;
    --good:#10B981; --good-soft:#D7F5E6; --good-ink:#065F46; --good-border:#A8EBC8;
    --warn:#F59E0B; --warn-soft:#FEF3C7; --warn-ink:#92400E; --warn-border:#FCD78A;
    --info:#3B82F6; --info-soft:#DBEAFE; --info-ink:#1E40AF; --info-border:#A5C7FB;
    --danger:#EF4444; --danger-soft:#FEE2E2; --danger-ink:#991B1B; --danger-border:#FCA5A5;
    --gray-soft:#EEF0F4; --gray-ink:#4B5260;
    --shadow:0 1px 2px rgba(15,17,23,0.04), 0 6px 22px -8px rgba(15,17,23,0.08);
    --shadow-lg:0 30px 60px -20px rgba(15,17,23,0.16);
  `;
  const darkTokens = `
    --bg:#0B0C10; --bg2:#15171D; --surface:#15171D; --surface-2:#1B1E26;
    --ink:#F4F5F7; --ink-2:#E6E8EE; --muted:#8C92A0; --faint:#5C6373;
    --line:#23262F; --linex:#2C3140; --hover:#1E2129;
    --good:#34D399; --good-soft:#0C2A20; --good-ink:#86EFAC; --good-border:#10522E;
    --warn:#FBBF24; --warn-soft:#2B2110; --warn-ink:#FCD34D; --warn-border:#5C4413;
    --info:#60A5FA; --info-soft:#101F36; --info-ink:#93C5FD; --info-border:#1E3A6B;
    --danger:#F87171; --danger-soft:#2E1313; --danger-ink:#FCA5A5; --danger-border:#5F1F1F;
    --gray-soft:#22252D; --gray-ink:#9CA3AF;
    --shadow:0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -10px rgba(0,0,0,0.5);
    --shadow-lg:0 30px 60px -20px rgba(0,0,0,0.6);
  `;
  return `
    .aur { ${dark ? darkTokens : light}
      --g1:${a.g1}; --g2:${a.g2}; --g3:${a.g3};
      --accent:${a.accent}; --accent-soft:${a.soft}; --accent-ink:${a.ink};
      --grad:linear-gradient(95deg, var(--g1) 0%, var(--g2) 55%, var(--g3) 100%);
      --grad-text:linear-gradient(95deg, var(--g1) 0%, var(--g2) 60%, var(--g3) 100%);
      background:var(--bg); color:var(--ink);
      font-family:'Plus Jakarta Sans','Inter Tight','Inter',ui-sans-serif,system-ui,sans-serif;
      font-size:14px; line-height:1.5; letter-spacing:-0.005em;
      width:100%; height:100%; overflow:hidden;
      font-feature-settings:'ss01','cv11';
      display:grid; grid-template-columns:68px 1fr;
    }
    .aur, .aur * { box-sizing:border-box; }
    .aur-mono { font-family:'JetBrains Mono',ui-monospace,Menlo,monospace; font-feature-settings:'ss02'; }
    .aur-grad-text { background:var(--grad-text); -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-fill-color:transparent;}

    /* ── Sidebar ── */
    .au-side { background:var(--bg); border-right:1px solid var(--line); padding:18px 0; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%;}
    .au-mark { width:36px; height:36px; border-radius:11px; background:var(--grad); display:grid; place-items:center; margin-bottom:10px; box-shadow:0 4px 14px -2px color-mix(in srgb, var(--g2) 50%, transparent); position:relative;}
    .au-mark::after { content:''; position:absolute; inset:2px; border-radius:9px; background:radial-gradient(120% 100% at 30% 20%, rgba(255,255,255,0.45), transparent 50%); pointer-events:none;}
    .au-mark span { color:#fff; font-weight:800; font-size:15px; letter-spacing:-0.04em; z-index:1; text-shadow:0 1px 1px rgba(0,0,0,0.15);}
    .au-side-divider { width:24px; height:1px; background:var(--line); margin:4px 0 8px;}
    .au-side-btn { width:40px; height:40px; border-radius:10px; display:grid; place-items:center; color:var(--muted); cursor:pointer; border:none; background:transparent; position:relative; transition:all .15s;}
    .au-side-btn:hover { background:var(--hover); color:var(--ink);}
    .au-side-btn.on { background:var(--surface); color:var(--ink); box-shadow:var(--shadow);}
    .au-side-btn .badge { position:absolute; top:5px; right:5px; min-width:14px; height:14px; padding:0 4px; border-radius:99px; background:var(--accent); color:#fff; font-size:9px; font-weight:700; display:grid; place-items:center; box-shadow:0 0 0 2px var(--bg);}
    .au-side-spacer { flex:1; }
    .au-side-foot { display:flex; flex-direction:column; align-items:center; gap:6px;}
    .au-avatar { width:34px; height:34px; border-radius:99px; background:var(--grad); display:grid; place-items:center; color:#fff; font-size:12px; font-weight:700; cursor:pointer; box-shadow:0 0 0 2px var(--bg), 0 0 0 3px var(--linex);}

    /* ── Main column ── */
    .au-main { height:100%; overflow:hidden; display:flex; flex-direction:column; background:var(--bg);}
    .au-topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 28px; background:var(--bg); border-bottom:1px solid var(--line); flex-shrink:0; z-index:3;}
    .au-crumb { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--muted); font-weight:500;}
    .au-crumb a { color:var(--muted); cursor:pointer; text-decoration:none;}
    .au-crumb a:hover { color:var(--ink);}
    .au-crumb .sep { color:var(--linex);}
    .au-crumb .cur { color:var(--ink);}
    .au-topbar-r { display:flex; align-items:center; gap:10px;}
    .au-scroll { flex:1; overflow-y:auto; padding-bottom:80px;}
    .au-scroll::-webkit-scrollbar { width:10px;}
    .au-scroll::-webkit-scrollbar-thumb { background:var(--linex); border-radius:10px; border:2px solid var(--bg);}
    .au-page { padding:28px 36px 60px; max-width:1320px; margin:0 auto;}

    /* ── Headers ── */
    .au-eyebrow { font-size:11px; letter-spacing:0.10em; text-transform:uppercase; color:var(--muted); font-weight:700;}
    .au-h1 { font-size:48px; font-weight:700; letter-spacing:-0.032em; line-height:1.02; margin:0;}
    .au-h2 { font-size:24px; font-weight:700; letter-spacing:-0.02em; line-height:1.15; margin:0;}
    .au-h3 { font-size:15px; font-weight:700; letter-spacing:-0.005em; margin:0;}
    .au-sub { color:var(--muted); font-size:15px; max-width:60ch;}

    /* ── Buttons ── */
    .au-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:99px; border:1px solid var(--linex); background:var(--surface); color:var(--ink); font:inherit; font-size:13px; font-weight:600; cursor:pointer; line-height:1; transition:all .14s ease;}
    .au-btn:hover { background:var(--hover); transform:translateY(-1px);}
    .au-btn-ink { background:var(--ink); color:var(--bg); border-color:var(--ink);}
    .au-btn-ink:hover { background:var(--ink-2); border-color:var(--ink-2);}
    .au-btn-grad { background:var(--grad); color:#fff; border-color:transparent; box-shadow:0 6px 18px -4px color-mix(in srgb, var(--g2) 55%, transparent);}
    .au-btn-grad:hover { transform:translateY(-1px); box-shadow:0 10px 22px -4px color-mix(in srgb, var(--g2) 60%, transparent);}
    .au-btn-sm { padding:6px 11px; font-size:12px;}
    .au-btn-icon { padding:8px; }
    .au-iconbtn { width:36px; height:36px; border-radius:99px; display:grid; place-items:center; background:var(--surface); border:1px solid var(--linex); color:var(--muted); cursor:pointer; transition:all .14s;}
    .au-iconbtn:hover { color:var(--ink); background:var(--hover);}

    /* ── Pills ── */
    .au-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px 4px 8px; border-radius:99px; font-size:12px; font-weight:600; line-height:1.3; border:1px solid transparent;}
    .au-pill .ic { width:14px; height:14px; display:grid; place-items:center; }
    .au-pill-approved   { background:var(--good-soft); color:var(--good-ink); border-color:var(--good-border);}
    .au-pill-processing { background:var(--info-soft); color:var(--info-ink); border-color:var(--info-border);}
    .au-pill-await      { background:var(--warn-soft); color:var(--warn-ink); border-color:var(--warn-border);}
    .au-pill-draft      { background:var(--gray-soft); color:var(--gray-ink); border-color:var(--linex);}
    .au-pill-needs      { background:var(--danger-soft); color:var(--danger-ink); border-color:var(--danger-border);}

    /* ── Hero header ── */
    .au-hero { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; padding-top:8px;}
    .au-hero-l h1 { margin:8px 0 0;}
    .au-hero-r { display:flex; align-items:center; gap:10px; flex-wrap:wrap;}

    /* ── KPI strip ── */
    .au-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:22px;}
    .au-kpi { background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:16px 18px; position:relative; overflow:hidden;}
    .au-kpi .au-eyebrow { font-size:11px;}
    .au-kpi-v { font-size:30px; font-weight:700; letter-spacing:-0.02em; margin-top:8px; line-height:1;}
    .au-kpi-d { font-size:12px; color:var(--muted); margin-top:6px; display:flex; align-items:center; gap:5px;}
    .au-kpi-d .up { color:var(--good); font-weight:600;}
    .au-kpi-d .dn { color:var(--good); font-weight:600;}
    .au-kpi.attn .au-kpi-v { color:var(--warn-ink);}
    .au-kpi-spark { position:absolute; right:14px; bottom:14px; opacity:.7;}

    /* ── Filter bar ── */
    .au-toolbar { display:flex; align-items:center; gap:8px; margin-top:24px;}
    .au-tab { display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:99px; font-size:13px; color:var(--muted); cursor:pointer; border:1px solid transparent; font-weight:500; background:transparent;}
    .au-tab:hover { color:var(--ink); background:var(--hover);}
    .au-tab.on { color:var(--ink); background:var(--surface); border-color:var(--linex); box-shadow:var(--shadow);}
    .au-tab .n { font-size:10px; padding:1px 5px; border-radius:99px; background:var(--gray-soft); color:var(--gray-ink); font-weight:600;}
    .au-tab.on .n { background:var(--accent-soft); color:var(--accent-ink);}
    .au-search { margin-left:auto; display:flex; align-items:center; gap:7px; padding:7px 13px; background:var(--surface); border:1px solid var(--linex); border-radius:99px; min-width:280px; box-shadow:var(--shadow);}
    .au-search:focus-within { border-color:var(--accent);}
    .au-search input { flex:1; border:none; outline:none; background:none; font:inherit; color:var(--ink); font-size:13px;}
    .au-search input::placeholder { color:var(--muted);}
    .au-kbd { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--muted); padding:1px 6px; border:1px solid var(--linex); border-radius:5px;}

    /* ── Table ── */
    .au-table-wrap { background:var(--surface); border:1px solid var(--line); border-radius:16px; overflow:hidden; margin-top:16px; box-shadow:var(--shadow);}
    .au-table { width:100%; border-collapse:separate; border-spacing:0;}
    .au-table thead th { text-align:left; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:var(--muted); font-weight:700; padding:12px 18px; background:var(--surface-2); border-bottom:1px solid var(--line);}
    .au-table tbody tr { cursor:pointer; transition:background .12s;}
    .au-table tbody tr:hover { background:var(--hover);}
    .au-table tbody td { padding:14px 18px; border-bottom:1px solid var(--line); vertical-align:middle; font-size:14px;}
    .au-table tbody tr:last-child td { border-bottom:none;}
    .au-client { display:flex; align-items:center; gap:11px;}
    .au-client-av { width:34px; height:34px; border-radius:99px; display:grid; place-items:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; box-shadow:inset 0 0 0 1.5px rgba(255,255,255,0.25);}
    .au-client-name { font-weight:600; color:var(--ink); font-size:14px;}
    .au-client-id { font-size:11px; color:var(--muted); margin-top:1px;}
    .au-wf-cell { color:var(--muted); font-size:13px;}
    .au-updated { font-size:13px;}
    .au-updated .abs { font-size:11px; color:var(--muted); display:block; margin-top:2px;}
    .au-row-actions { display:flex; gap:4px; justify-content:flex-end;}
    .au-chev { color:var(--faint); font-size:16px;}

    /* ── Detail layout ── */
    .au-detail-hero { display:flex; gap:18px; align-items:flex-start;}
    .au-detail-av { width:64px; height:64px; border-radius:20px; display:grid; place-items:center; font-size:22px; font-weight:700; color:#fff; flex-shrink:0; box-shadow:inset 0 0 0 2px rgba(255,255,255,0.25), var(--shadow);}
    .au-detail-meta { display:flex; gap:10px; align-items:center; margin-top:10px; flex-wrap:wrap;}
    .au-id-chip { font-family:'JetBrains Mono',monospace; font-size:11px; padding:3px 9px; background:var(--surface); border:1px solid var(--linex); border-radius:99px; color:var(--muted);}
    .au-bullet { color:var(--linex);}
    .au-detail-grid { display:grid; grid-template-columns:1fr 380px; gap:24px; margin-top:28px; align-items:start;}

    .au-card { background:var(--surface); border:1px solid var(--line); border-radius:18px; box-shadow:var(--shadow); overflow:hidden;}
    .au-card-h { padding:16px 22px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; gap:10px;}
    .au-card-h h3 { margin:0;}
    .au-card-h .meta { font-size:12px; color:var(--muted); font-family:'JetBrains Mono',monospace;}
    .au-card-b { padding:14px 22px 18px;}
    .au-card + .au-card { margin-top:16px;}

    /* ── Activity trace ── */
    .au-trace { display:flex; flex-direction:column;}
    .au-tr { display:grid; grid-template-columns:24px 1fr; gap:14px; padding:14px 0; position:relative; border-bottom:1px solid var(--line);}
    .au-tr:last-child { border-bottom:none; padding-bottom:0;}
    .au-tr:first-child { padding-top:4px;}
    .au-tr-gut { position:relative;}
    .au-tr-gut::before { content:''; position:absolute; left:11px; top:0; bottom:-14px; width:1.5px; background:var(--line); border-radius:2px;}
    .au-tr:last-child .au-tr-gut::before { bottom:auto; height:14px;}
    .au-tr:first-child .au-tr-gut::before { top:24px;}
    .au-tr-node { position:absolute; left:3px; top:14px; width:18px; height:18px; border-radius:99px; background:var(--surface); border:2px solid var(--linex); display:grid; place-items:center; color:var(--muted); z-index:1;}
    .au-tr-node svg { width:9px; height:9px;}
    .au-tr.is-agent .au-tr-node  { border-color:var(--accent); color:var(--accent); background:var(--accent-soft);}
    .au-tr.is-good  .au-tr-node  { border-color:var(--good); color:var(--good); background:var(--good-soft);}
    .au-tr.is-human .au-tr-node  { border-color:var(--ink); color:var(--bg); background:var(--ink);}
    .au-tr.is-attn  .au-tr-node  { border-color:var(--warn); color:var(--warn); background:var(--warn-soft);}
    .au-tr-head { display:flex; align-items:center; gap:9px; flex-wrap:wrap;}
    .au-kind { font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:var(--ink);}
    .au-tr.is-agent .au-kind { color:var(--accent-ink);}
    .au-tr.is-good  .au-kind { color:var(--good-ink);}
    .au-tr.is-attn  .au-kind { color:var(--warn-ink);}
    .au-actor { font-size:10px; font-weight:600; padding:2px 7px; border-radius:99px; background:var(--gray-soft); color:var(--gray-ink); letter-spacing:0;}
    .au-actor.agent { background:var(--accent-soft); color:var(--accent-ink);}
    .au-actor.human { background:var(--ink); color:var(--bg);}
    .au-actor.system { background:var(--gray-soft); color:var(--gray-ink);}
    .au-time { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); margin-left:auto;}
    .au-tr-title { font-size:14px; font-weight:600; margin-top:6px; color:var(--ink); line-height:1.4;}
    .au-tr-body { font-size:13px; color:var(--muted); margin-top:3px;}
    .au-tool { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; padding:2px 8px; background:var(--surface-2); border:1px solid var(--line); border-radius:6px; color:var(--ink);}
    .au-reason { background:var(--surface-2); border:1px solid var(--line); border-left:3px solid var(--accent); padding:11px 14px; border-radius:10px; margin-top:10px; color:var(--ink-2); font-size:13px; line-height:1.55;}
    .au-disclose { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); cursor:pointer; background:none; border:none; padding:8px 0 0; font:inherit; font-weight:500;}
    .au-disclose:hover { color:var(--ink);}
    .au-alts { margin-top:8px; padding:10px 12px; background:var(--surface-2); border:1px dashed var(--linex); border-radius:10px; display:flex; flex-direction:column; gap:6px;}
    .au-alt { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--muted);}
    .au-alt .name { font-family:'JetBrains Mono',monospace; color:var(--ink-2); text-decoration:line-through; opacity:.7; font-size:11px;}
    .au-conf-chip { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; padding:2px 7px; border-radius:99px; background:var(--good-soft); color:var(--good-ink); border:1px solid var(--good-border); letter-spacing:0;}

    /* ── Approvals panel ── */
    .au-appr { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--line); gap:12px;}
    .au-appr:last-child { border-bottom:none;}
    .au-appr-name { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600;}
    .au-appr-meta { color:var(--muted); font-size:11px; margin-top:2px;}
    .au-appr-by { color:var(--muted); font-size:11px; margin-top:3px;}

    /* ── Extracted data ── */
    .au-extr { display:flex; flex-direction:column;}
    .au-extr-row { padding:13px 0; border-bottom:1px solid var(--line);}
    .au-extr-row:last-child { border-bottom:none; padding-bottom:4px;}
    .au-extr-row:first-child { padding-top:4px;}
    .au-extr-r1 { display:flex; align-items:baseline; justify-content:space-between; gap:14px;}
    .au-extr-k { font-size:12px; color:var(--muted); font-weight:500;}
    .au-extr-v { font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:600; color:var(--ink); text-align:right; max-width:180px;}
    .au-extr-cf { margin-top:8px; display:flex; align-items:center; gap:10px;}
    .au-meter { flex:1; height:5px; background:var(--gray-soft); border-radius:99px; overflow:hidden;}
    .au-meter > span { display:block; height:100%; background:var(--good); border-radius:99px;}
    .au-meter.med > span { background:var(--warn);}
    .au-cf-num { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); min-width:34px; text-align:right; font-weight:600;}
    .au-cf-chip { font-family:'JetBrains Mono',monospace; font-size:10px; padding:2px 7px; border-radius:99px; font-weight:700;}
    .au-cf-chip.h { background:var(--good-soft); color:var(--good-ink); border:1px solid var(--good-border);}
    .au-cf-chip.m { background:var(--warn-soft); color:var(--warn-ink); border:1px solid var(--warn-border);}
    .au-cf-dots { display:inline-flex; gap:3px;}
    .au-cf-dots .d { width:6px; height:6px; border-radius:99px; background:var(--gray-soft); border:1px solid var(--linex);}
    .au-cf-dots .d.on { background:var(--good); border-color:transparent;}
    .au-cf-dots.med .d.on { background:var(--warn);}

    /* ── Initiate modal ── */
    .au-overlay { position:absolute; inset:0; background:color-mix(in srgb, var(--ink) 35%, transparent); backdrop-filter:blur(8px); z-index:30; display:flex; align-items:center; justify-content:center; padding:24px; animation:auFade .2s ease;}
    @keyframes auFade { from {opacity:0;} to {opacity:1;} }
    .au-sheet { width:600px; max-width:100%; background:var(--surface); border:1px solid var(--line); border-radius:22px; box-shadow:var(--shadow-lg); overflow:hidden; max-height:92%; display:flex; flex-direction:column; animation:auPop .25s cubic-bezier(.34,1.4,.5,1);}
    @keyframes auPop { from {transform:translateY(12px) scale(.97); opacity:0;} to {transform:translateY(0) scale(1); opacity:1;} }
    .au-sheet-h { padding:22px 26px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; gap:12px; position:relative;}
    .au-sheet-h::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--grad);}
    .au-sheet-h h2 { margin:0; font-size:20px; font-weight:700; letter-spacing:-0.015em;}
    .au-sheet-h-sub { color:var(--muted); font-size:13px; margin-top:2px;}
    .au-sheet-x { width:32px; height:32px; border-radius:99px; display:grid; place-items:center; background:var(--surface-2); border:1px solid var(--linex); color:var(--muted); cursor:pointer;}
    .au-sheet-x:hover { background:var(--hover); color:var(--ink);}
    .au-sheet-b { padding:22px 26px; overflow-y:auto;}
    .au-sheet-foot { padding:16px 26px; border-top:1px solid var(--line); background:var(--surface-2); display:flex; gap:10px; justify-content:space-between; align-items:center;}
    .au-fg { margin-bottom:18px;}
    .au-fg:last-child { margin-bottom:0;}
    .au-fg label { display:block; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; font-weight:700;}
    .au-input { width:100%; padding:11px 14px; border:1px solid var(--linex); border-radius:12px; background:var(--surface-2); font:inherit; font-size:14px; color:var(--ink); outline:none; transition:all .14s;}
    .au-input:focus { border-color:var(--accent); background:var(--surface); box-shadow:0 0 0 4px var(--accent-soft);}
    .au-wf-grid { display:grid; gap:8px;}
    .au-wf-opt { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border:1px solid var(--line); border-radius:14px; background:var(--surface-2); cursor:pointer; transition:all .14s;}
    .au-wf-opt:hover { border-color:var(--linex); background:var(--hover);}
    .au-wf-opt.on { border-color:var(--accent); background:var(--accent-soft);}
    .au-wf-radio { width:18px; height:18px; border-radius:99px; border:2px solid var(--linex); background:var(--surface); margin-top:1px; flex-shrink:0; position:relative;}
    .au-wf-opt.on .au-wf-radio { border-color:var(--accent);}
    .au-wf-opt.on .au-wf-radio::after { content:''; position:absolute; inset:3px; border-radius:99px; background:var(--accent);}
    .au-wf-opt h4 { margin:0 0 2px 0; font-size:14px; font-weight:700;}
    .au-wf-opt p { margin:0; color:var(--muted); font-size:12px;}
    .au-drop { border:1.5px dashed var(--linex); border-radius:14px; padding:28px; text-align:center; color:var(--muted); font-size:13px; cursor:pointer; background:var(--surface-2); transition:all .14s;}
    .au-drop:hover { border-color:var(--accent); color:var(--accent-ink); background:var(--accent-soft);}
    .au-drop .ic { width:36px; height:36px; border-radius:11px; background:var(--surface); border:1px solid var(--line); display:grid; place-items:center; margin:0 auto 10px; color:var(--accent);}

    /* ── Empty state hero (used when no cases / first run feel) ── */
    .au-empty-hero { background:var(--surface); border:1px solid var(--line); border-radius:22px; padding:48px; position:relative; overflow:hidden; margin-top:22px; box-shadow:var(--shadow);}
    .au-empty-hero::before { content:''; position:absolute; right:-100px; top:-80px; width:380px; height:380px; border-radius:50%; background:var(--grad); filter:blur(80px); opacity:.35; pointer-events:none;}
    .au-empty-hero > * { position:relative; z-index:1;}

    /* ── Footer credit ── */
    .au-foot { padding:14px 36px; color:var(--faint); font-size:11px; display:flex; justify-content:space-between; align-items:center;}
  `;
}

// ── icons (stroke=1.6) ──────────────────────────────────────────────────────
const Ic = {
  inbox: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>),
  briefcase: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>),
  doc: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>),
  sparkle: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>),
  flow: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8M12 12v4"/></svg>),
  bell: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>),
  cog: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
  search: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>),
  plus: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>),
  check: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>),
  clock: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>),
  zap: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>),
  upload: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>),
  sun: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>),
  moon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>),
  arrow: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M5 12h14M13 5l7 7-7 7"/></svg>),
  arrow_l: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>),
  more: (<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>),
  dot: (<svg viewBox="0 0 8 8" width="8" height="8"><circle cx="4" cy="4" r="3" fill="currentColor"/></svg>),
};

// ── helpers ────────────────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ['#8B5CF6','#EC4899'],
  ['#0EA5E9','#6366F1'],
  ['#F59E0B','#EF4444'],
  ['#10B981','#0EA5E9'],
  ['#EC4899','#F97316'],
  ['#6366F1','#A855F7'],
];
function auAvatar(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const [c1, c2] = AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
  const initials = name.split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase();
  return { bg: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`, initials };
}

function AurPill({ state }) {
  const map = {
    'Approved':          ['approved',   Ic.check, 'Completed'],
    'Processing':        ['processing', Ic.zap,    'Processing'],
    'Awaiting attorney': ['await',      Ic.clock,  'Awaiting attorney'],
    'Draft':             ['draft',      Ic.dot,    'Draft'],
    'Needs documents':   ['needs',      Ic.dot,    'Needs documents'],
  };
  const [cls, ic, lab] = map[state] || ['draft', Ic.dot, state];
  return <span className={`au-pill au-pill-${cls}`}><span className="ic">{ic}</span>{lab}</span>;
}

function AurConfidence({ value, style }) {
  const pct = Math.round(value * 100);
  const med = value < 0.95;
  if (style === 'chip') return <span className={`au-cf-chip ${med ? 'm' : 'h'}`}>{pct}%</span>;
  if (style === 'dots') {
    const filled = Math.round(value * 5);
    return (
      <span style={{display:'inline-flex', gap:6, alignItems:'center'}}>
        <span className={`au-cf-dots ${med ? 'med' : ''}`}>
          {[0,1,2,3,4].map(i => <span key={i} className={`d ${i < filled ? 'on' : ''}`}></span>)}
        </span>
        <span className="au-cf-num">{pct}%</span>
      </span>
    );
  }
  return (
    <>
      <div className={`au-meter ${med ? 'med' : ''}`}><span style={{width: `${pct}%`}}></span></div>
      <span className="au-cf-num">{pct}%</span>
    </>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function AurSidebar({ onLogo }) {
  const items = [
    { id:'cases',  icon: Ic.briefcase, badge: 2 },
    { id:'docs',   icon: Ic.doc },
    { id:'agent',  icon: Ic.sparkle },
    { id:'flows',  icon: Ic.flow },
    { id:'inbox',  icon: Ic.inbox, badge: 4 },
  ];
  const [act, setAct] = uS('cases');
  return (
    <div className="au-side">
      <button onClick={onLogo} className="au-mark" style={{border:'none', cursor:'pointer'}}><span>C</span></button>
      <div className="au-side-divider"></div>
      {items.map(it => (
        <button key={it.id} className={`au-side-btn ${act===it.id?'on':''}`} onClick={() => setAct(it.id)}>
          {it.icon}
          {it.badge && <span className="badge">{it.badge}</span>}
        </button>
      ))}
      <div className="au-side-spacer"></div>
      <div className="au-side-foot">
        <button className="au-side-btn">{Ic.bell}<span className="badge" style={{background:'var(--warn)'}}>3</span></button>
        <button className="au-side-btn">{Ic.cog}</button>
        <div className="au-avatar" title="M. Chen">MC</div>
      </div>
    </div>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────
function AurTopbar({ crumb, onDark, dark, right }) {
  return (
    <div className="au-topbar">
      <div className="au-crumb">{crumb}</div>
      <div className="au-topbar-r">
        <button className="au-iconbtn" onClick={onDark} title="Toggle theme">
          {dark ? Ic.sun : Ic.moon}
        </button>
        <button className="au-iconbtn">{Ic.search}</button>
        {right}
      </div>
    </div>
  );
}

// ── List screen ────────────────────────────────────────────────────────────
function AurList({ cases, onOpen, onNew, dark, onDark }) {
  const [tab, setTab] = uS('all');
  const [q, setQ] = uS('');
  const counts = uM(() => ({
    all: cases.length,
    open: cases.filter(c => c.state !== 'Approved').length,
    attn: cases.filter(c => ['Awaiting attorney','Needs documents'].includes(c.state)).length,
    done: cases.filter(c => c.state === 'Approved').length,
  }), [cases]);
  const filtered = uM(() => cases.filter(c => {
    if (tab === 'open' && c.state === 'Approved') return false;
    if (tab === 'attn' && !['Awaiting attorney','Needs documents'].includes(c.state)) return false;
    if (tab === 'done' && c.state !== 'Approved') return false;
    if (q && !c.client.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [cases, tab, q]);

  return (
    <>
      <AurTopbar
        crumb={<><a>Caseflow</a><span className="sep">/</span><span className="cur">Cases</span></>}
        dark={dark} onDark={onDark}
        right={<button className="au-btn au-btn-grad" onClick={onNew}>{Ic.plus} Initiate case</button>}
      />
      <div className="au-scroll">
        <div className="au-page">
          <div className="au-hero">
            <div className="au-hero-l">
              <div className="au-eyebrow">Chapter 7 Intake · Matthews & Associates</div>
              <h1 className="au-h1">Cases</h1>
            </div>
            <div className="au-hero-r">
              <button className="au-btn">{Ic.upload} Import</button>
              <button className="au-btn au-btn-ink">{Ic.sparkle} Run all</button>
            </div>
          </div>

          <div className="au-kpi-row">
            <div className="au-kpi">
              <div className="au-eyebrow">Active</div>
              <div className="au-kpi-v">6</div>
              <div className="au-kpi-d"><span className="up">↑ 2</span> this week</div>
            </div>
            <div className="au-kpi attn">
              <div className="au-eyebrow">Awaiting review</div>
              <div className="au-kpi-v">2</div>
              <div className="au-kpi-d">avg wait <span className="aur-mono">1.2h</span></div>
            </div>
            <div className="au-kpi">
              <div className="au-eyebrow">Approved · 30d</div>
              <div className="au-kpi-v">28</div>
              <div className="au-kpi-d"><span className="up">↑ 12%</span> vs prior</div>
            </div>
            <div className="au-kpi">
              <div className="au-eyebrow">Time to file</div>
              <div className="au-kpi-v">4.1<span style={{fontSize:18, color:'var(--muted)', fontWeight:600, marginLeft:2}}>d</span></div>
              <div className="au-kpi-d"><span className="dn">↓ 1.8d</span> with agent</div>
            </div>
          </div>

          <div className="au-toolbar">
            <button className={`au-tab ${tab==='all'?'on':''}`}  onClick={() => setTab('all')}>All  <span className="n">{counts.all}</span></button>
            <button className={`au-tab ${tab==='open'?'on':''}`} onClick={() => setTab('open')}>Open <span className="n">{counts.open}</span></button>
            <button className={`au-tab ${tab==='attn'?'on':''}`} onClick={() => setTab('attn')}>Needs attention <span className="n">{counts.attn}</span></button>
            <button className={`au-tab ${tab==='done'?'on':''}`} onClick={() => setTab('done')}>Completed <span className="n">{counts.done}</span></button>
            <div className="au-search">
              {Ic.search}
              <input placeholder="Search clients, documents, or matter ID" value={q} onChange={e => setQ(e.target.value)} />
              <span className="au-kbd">⌘K</span>
            </div>
          </div>

          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Workflow</th>
                  <th>Status</th>
                  <th>Docs</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const av = auAvatar(c.client);
                  return (
                    <tr key={c.id} onClick={() => onOpen(c.id)}>
                      <td>
                        <div className="au-client">
                          <div className="au-client-av" style={{background: av.bg}}>{av.initials}</div>
                          <div>
                            <div className="au-client-name">{c.client}</div>
                            <div className="au-client-id aur-mono">{c.fullId.slice(0,14)}…</div>
                          </div>
                        </div>
                      </td>
                      <td className="au-wf-cell">{c.workflow}</td>
                      <td><AurPill state={c.state} /></td>
                      <td className="aur-mono" style={{color:'var(--muted)', fontSize:13}}>{c.documents}</td>
                      <td className="au-updated">
                        {c.updatedRel}
                        <span className="abs aur-mono">{c.updated}</span>
                      </td>
                      <td>
                        <div className="au-row-actions">
                          <span className="au-chev">›</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" style={{padding:'48px', textAlign:'center', color:'var(--muted)'}}>No matters match your filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="au-foot">
          <span>Caseflow · Chapter 7 intake</span>
          <span className="aur-mono">v0.4.2 · agent build 218</span>
        </div>
      </div>
    </>
  );
}

// ── Detail screen ──────────────────────────────────────────────────────────
const KIND_NODE = {
  document_uploaded:  Ic.upload,
  case_created:       Ic.dot,
  planner_decided:    Ic.sparkle,
  tool_started:       Ic.zap,
  tool_succeeded:     Ic.check,
  state_changed:      Ic.arrow,
  approval_requested: Ic.bell,
  approval_granted:   Ic.check,
};

function AurDetail({ data, onBack, dark, onDark, confidenceStyle }) {
  const [open, setOpen] = uS({});
  const av = auAvatar(data.client);
  return (
    <>
      <AurTopbar
        crumb={
          <>
            <a onClick={onBack}>Caseflow</a><span className="sep">/</span>
            <a onClick={onBack}>Cases</a><span className="sep">/</span>
            <span className="cur">{data.client}</span>
          </>
        }
        dark={dark} onDark={onDark}
        right={
          <>
            <button className="au-btn" onClick={onBack}>{Ic.arrow_l} Back</button>
            <button className="au-btn au-btn-grad">{Ic.sparkle} Run agent</button>
          </>
        }
      />
      <div className="au-scroll">
        <div className="au-page">
          <div className="au-detail-hero">
            <div className="au-detail-av" style={{background: av.bg}}>{av.initials}</div>
            <div style={{flex:1}}>
              <div className="au-eyebrow">Matter</div>
              <h1 className="au-h1" style={{marginTop:6}}>{data.client}</h1>
              <div className="au-detail-meta">
                <span className="au-id-chip">{data.fullId}</span>
                <span style={{color:'var(--muted)', fontSize:13}}>{data.workflow}</span>
                <span className="au-bullet">·</span>
                <AurPill state={data.state} />
              </div>
            </div>
          </div>

          <div className="au-detail-grid">
            <div>
              <div className="au-card">
                <div className="au-card-h">
                  <h3 className="au-h3">Agent trace</h3>
                  <span className="meta">{data.activity.length} events · run 1 of 1</span>
                </div>
                <div className="au-card-b">
                  <div className="au-trace">
                    {data.activity.map((a, i) => {
                      const meta = window.ACTIVITY_LABELS[a.kind] || { label: a.kind };
                      const isAgent = a.actor === 'agent';
                      const isHuman = a.actor === 'human';
                      const isGood = a.kind === 'tool_succeeded' || a.kind === 'approval_granted';
                      const isAttn = a.kind === 'approval_requested';
                      return (
                        <div key={i} className={`au-tr ${isAgent?'is-agent':''} ${isHuman?'is-human':''} ${isGood?'is-good':''} ${isAttn?'is-attn':''}`}>
                          <div className="au-tr-gut"><span className="au-tr-node">{KIND_NODE[a.kind] || Ic.dot}</span></div>
                          <div>
                            <div className="au-tr-head">
                              <span className="au-kind">{meta.label}</span>
                              <span className={`au-actor ${a.actor}`}>{a.actorName || a.actor}</span>
                              <span className="au-time">{a.time}</span>
                            </div>
                            {a.kind === 'document_uploaded' && (
                              <>
                                <div className="au-tr-title" style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                                  <span className="au-tool">{a.title}</span>
                                </div>
                                <div className="au-tr-body">{a.meta}</div>
                              </>
                            )}
                            {a.kind === 'case_created' && (
                              <div className="au-tr-title">{a.title}</div>
                            )}
                            {a.kind === 'planner_decided' && (
                              <>
                                <div className="au-tr-title" style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                                  <span>Next →</span>
                                  <span className="au-tool">{a.tool}</span>
                                  <span className="au-conf-chip">{a.confidence} confidence</span>
                                </div>
                                <div className="au-reason">{a.reasoning}</div>
                                <button className="au-disclose" onClick={() => setOpen(o => ({...o, [i]: !o[i]}))}>
                                  {open[i] ? '▼' : '▶'} {a.alternatives.length} alternative{a.alternatives.length===1?'':'s'} considered
                                </button>
                                {open[i] && (
                                  <div className="au-alts">
                                    {a.alternatives.map((alt, j) => (
                                      <div key={j} className="au-alt">
                                        <span className="name">{alt.tool}</span>
                                        <span>{alt.reason}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            {a.kind === 'tool_started' && (
                              <div className="au-tr-title">
                                <span className="au-tool">{a.tool}</span> running…
                              </div>
                            )}
                            {a.kind === 'tool_succeeded' && (
                              <>
                                <div className="au-tr-title">
                                  <span className="au-tool">{a.tool}</span> succeeded
                                </div>
                                <div className="au-tr-body">{a.result}</div>
                              </>
                            )}
                            {a.kind === 'state_changed' && (
                              <div className="au-tr-title" style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                                <AurPill state={a.from} />
                                <span style={{color:'var(--muted)'}}>→</span>
                                <AurPill state={a.to} />
                              </div>
                            )}
                            {a.kind === 'approval_requested' && (
                              <>
                                <div className="au-tr-title" style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                                  <span className="au-tool">{a.approval}</span>
                                  <span style={{color:'var(--muted)', fontWeight:500, fontSize:13}}>→ {a.assignee}</span>
                                </div>
                              </>
                            )}
                            {a.kind === 'approval_granted' && (
                              <>
                                <div className="au-tr-title">{a.actorName} approved</div>
                                <div className="au-reason" style={{borderLeftColor:'var(--good)', background:'var(--good-soft)', color:'var(--good-ink)'}}>“{a.note}”</div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="au-card">
                <div className="au-card-h">
                  <h3 className="au-h3">Approvals</h3>
                </div>
                <div className="au-card-b">
                  {data.approvals.map((ap, i) => (
                    <div key={i} className="au-appr">
                      <div style={{minWidth:0}}>
                        <div className="au-appr-name">{ap.name}</div>
                        <div className="au-appr-meta">{ap.kind}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <AurPill state="Approved" />
                        <div className="au-appr-by">by {ap.by} · {ap.at}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="au-card">
                <div className="au-card-h">
                  <h3 className="au-h3">Extracted data</h3>
                  <span className="meta">min {Math.round(Math.min(...data.extracted.map(e=>e.confidence))*100)}%</span>
                </div>
                <div className="au-card-b au-extr">
                  {data.extracted.map((f, i) => (
                    <div key={i} className="au-extr-row">
                      <div className="au-extr-r1">
                        <span className="au-extr-k">{f.field}</span>
                        <span className="au-extr-v">{f.value}</span>
                      </div>
                      <div className="au-extr-cf">
                        <AurConfidence value={f.confidence} style={confidenceStyle} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Initiate modal ─────────────────────────────────────────────────────────
function AurInitiate({ onClose, onCreate }) {
  const [client, setClient] = uS('');
  const [wf, setWf] = uS('ch7');
  const [docs, setDocs] = uS(0);
  return (
    <div className="au-overlay" onClick={onClose}>
      <div className="au-sheet" onClick={e => e.stopPropagation()}>
        <div className="au-sheet-h">
          <div>
            <h2>Initiate case</h2>
            <div className="au-sheet-h-sub">Open a new matter. The intake agent starts once a document arrives.</div>
          </div>
          <button className="au-sheet-x" onClick={onClose}>✕</button>
        </div>
        <div className="au-sheet-b">
          <div className="au-fg">
            <label>Client name</label>
            <input className="au-input" placeholder="e.g. Sarah J. Mendez" value={client} onChange={e => setClient(e.target.value)} autoFocus />
          </div>
          <div className="au-fg">
            <label>Workflow</label>
            <div className="au-wf-grid">
              {window.WORKFLOWS.map(w => (
                <div key={w.id} className={`au-wf-opt ${wf === w.id ? 'on' : ''}`} onClick={() => setWf(w.id)}>
                  <span className="au-wf-radio"></span>
                  <div>
                    <h4>{w.name}</h4>
                    <p>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="au-fg">
            <label>Initial documents (optional)</label>
            <div className="au-drop" onClick={() => setDocs(d => d + 1)}>
              <div className="ic">{Ic.upload}</div>
              {docs === 0
                ? <>Drag PDFs here, or click to browse</>
                : <><strong style={{color:'var(--ink)'}}>{docs}</strong> file{docs===1?'':'s'} ready · click to add more</>}
            </div>
          </div>
        </div>
        <div className="au-sheet-foot">
          <span className="au-eyebrow" style={{color:'var(--muted)'}}>Step 1 of 1</span>
          <div style={{display:'flex', gap:8}}>
            <button className="au-btn" onClick={onClose}>Cancel</button>
            <button className="au-btn au-btn-grad"
                    onClick={() => client && onCreate({ client, wf, docs })}
                    style={{opacity: client ? 1 : .5, pointerEvents: client ? 'auto' : 'none'}}>
              Open matter {Ic.arrow}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App shell ──────────────────────────────────────────────────────────────
function AuroraApp({ accent = 'aurora', dark = false, confidenceStyle = 'bar', initialScreen = 'list' }) {
  const [screen, setScreen] = uS(initialScreen);
  const [openId, setOpenId] = uS('ab9cd84acf85');
  const [sheet, setSheet] = uS(initialScreen === 'initiate');
  const [d, setD] = uS(dark);
  const [cases, setCases] = uS(window.CASEFLOW_CASES);

  uE(() => { setD(dark); }, [dark]);

  const css = uM(() => aurora(accent, d, confidenceStyle), [accent, d, confidenceStyle]);
  const active = cases.find(c => c.id === openId) || cases[0];

  return (
    <div className="aur">
      <style>{css}</style>
      <AurSidebar onLogo={() => setScreen('list')} />
      <div className="au-main">
        {screen === 'list' && (
          <AurList
            cases={cases}
            onOpen={(id) => { setOpenId(id); setScreen('detail'); }}
            onNew={() => setSheet(true)}
            dark={d}
            onDark={() => setD(x => !x)}
          />
        )}
        {screen === 'detail' && active && active.activity && (
          <AurDetail
            data={active}
            onBack={() => setScreen('list')}
            dark={d}
            onDark={() => setD(x => !x)}
            confidenceStyle={confidenceStyle}
          />
        )}
      </div>
      {sheet && (
        <AurInitiate
          onClose={() => setSheet(false)}
          onCreate={({ client, wf }) => {
            const wfMeta = window.WORKFLOWS.find(x => x.id === wf);
            const id = Math.random().toString(16).slice(2, 14);
            const next = { id, fullId: id + '0000000', client, workflow: wfMeta.name, state: 'Draft', updated: 'just now', updatedRel: 'just now', documents: 0 };
            setCases([next, ...cases]);
            setSheet(false);
          }}
        />
      )}
    </div>
  );
}

window.AuroraApp = AuroraApp;
