const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');

  :root {
    --gold: #f5c842;
    --gold-dark: #c9a020;
    --red: #e63946;
    --sky: #0a1628;
    --sky-mid: #0d1f3c;
    --panel: #0f2035;
    --panel-light: #162840;
    --border: rgba(245,200,66,0.25);
    --text: #e8f4e8;
    --text-dim: #7a9b7a;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Rajdhani', sans-serif;
    background: var(--sky);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app-bg {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(13,100,30,0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 100% 100%, rgba(245,200,66,0.05) 0%, transparent 50%),
      linear-gradient(180deg, #050e1a 0%, #0a1628 40%, #071220 100%);
  }

  /* ── HEADER ── */
  .app-header {
    text-align: center;
    padding: 16px 16px 10px;
    border-bottom: 1px solid var(--border);
    background: rgba(15,32,53,0.9);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .app-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(1.8rem, 7vw, 3.2rem);
    letter-spacing: 4px;
    background: linear-gradient(135deg, #f5c842, #fff8d0, #c9a020);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }
  .app-sub {
    font-family: 'Orbitron', monospace;
    font-size: 0.52rem;
    letter-spacing: 6px;
    color: var(--text-dim);
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* ── SCREEN ── */
  .screen { padding: 14px; max-width: 480px; margin: 0 auto; }

  /* ── CARDS ── */
  .card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 10px;
  }
  .card-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.62rem;
    letter-spacing: 3px;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 11px 18px;
    border: none; border-radius: 8px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem; font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    text-transform: uppercase;
    letter-spacing: 1px;
    width: 100%;
  }
  .btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: #1a1000; }
  .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(245,200,66,0.4); }
  .btn-green { background: linear-gradient(135deg, #2d7a1a, #1e5010); color: #a8f080; border: 1px solid rgba(168,240,128,0.3); }
  .btn-ghost { background: transparent; color: var(--gold); border: 1px solid var(--border); }
  .btn-ghost:hover { background: rgba(245,200,66,0.08); }
  .btn-red { background: linear-gradient(135deg, #7a1a1a, #500e0e); color: #f08080; border: 1px solid rgba(240,128,128,0.3); }
  .btn-sm  { padding: 8px 14px; font-size: 0.82rem; }
  .btn-xs  { padding: 5px 10px; font-size: 0.72rem; width: auto; }

  /* ── INPUTS ── */
  .input-group { margin-bottom: 10px; }
  .input-label {
    display: block;
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 1px; color: var(--text-dim);
    text-transform: uppercase; margin-bottom: 4px;
  }
  .input-field {
    width: 100%;
    background: var(--sky-mid);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 9px 12px;
    color: var(--text);
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;
  }
  .input-field:focus { border-color: var(--gold); }

  /* ── SCOREBOARD ── */
  .scoreboard {
    background: linear-gradient(135deg, #0a2a10, #051508);
    border: 2px solid var(--gold);
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 10px;
    position: relative;
    overflow: hidden;
  }
  .scoreboard::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }
  .score-main { text-align: center; margin-bottom: 10px; }
  .score-runs {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 15vw, 5.5rem);
    color: #fff; line-height: 1;
    text-shadow: 0 0 30px rgba(245,200,66,0.3);
  }
  .score-sep   { color: var(--gold); }
  .score-wkts  { color: var(--red); }
  .score-overs {
    font-family: 'Orbitron', monospace;
    font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;
  }
  .score-target {
    font-family: 'Orbitron', monospace;
    font-size: 0.68rem; color: var(--gold); letter-spacing: 1px; margin-top: 4px;
  }
  .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; margin-top: 7px; }
  .stat-box  { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 7px; text-align: center; }
  .stat-val  { font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; color: var(--gold); display: block; }
  .stat-lbl  { font-size: 0.58rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }

  /* ── PLAYER BOXES ── */
  .players-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-bottom: 7px; }
  .player-box {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 9px;
  }
  .player-box.on-strike { border-color: var(--gold); background: rgba(245,200,66,0.08); }
  .player-role { font-size: 0.58rem; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 2px; }
  .player-name { font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .player-score { font-family: 'Orbitron', monospace; font-size: 0.75rem; color: var(--gold); margin-top: 2px; }
  .strike-dot {
    display: inline-block; width: 7px; height: 7px;
    background: var(--gold); border-radius: 50%; margin-left: 4px;
    vertical-align: middle; animation: blink 1s infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  /* ── RUN BUTTONS ── */
  .run-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 5px; margin-bottom: 6px; }
  .run-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 5px; margin-bottom: 6px; }
  .run-btn {
    aspect-ratio: 1; border: none; border-radius: 10px;
    font-family: 'Bebas Neue', sans-serif; font-size: 1.35rem;
    cursor: pointer; transition: all 0.1s;
    display: flex; align-items: center; justify-content: center;
  }
  .run-btn-wide { aspect-ratio: auto; padding: 12px; font-size: 1rem; }
  .run-btn:active { transform: scale(0.9); }
  .rb-0  { background:#1a2535; color:#4a6080; border:1px solid #2a3545; }
  .rb-1  { background:linear-gradient(135deg,#1e4d1e,#0d2d0d); color:#7adf7a; border:1px solid rgba(122,223,122,0.3); }
  .rb-2  { background:linear-gradient(135deg,#1e3d6e,#0d1f3c); color:#7ab4df; border:1px solid rgba(122,180,223,0.3); }
  .rb-3  { background:linear-gradient(135deg,#4d3d1e,#2d2010); color:#dfca7a; border:1px solid rgba(223,202,122,0.3); }
  .rb-4  { background:linear-gradient(135deg,#1e6e3d,#0d3d20); color:#7adfc0; border:1px solid rgba(122,223,192,0.3); font-size:1.55rem; }
  .rb-6  { background:linear-gradient(135deg,#6e1e6e,#3d0d3d); color:#df7adf; border:1px solid rgba(223,122,223,0.3); font-size:1.55rem; }
  .rb-W  { background:linear-gradient(135deg,#6e1e1e,#3d0d0d); color:#df7a7a; border:1px solid rgba(223,122,122,0.3); }
  .rb-Wd { background:linear-gradient(135deg,#3d3d1e,#20200d); color:#dfdf7a; border:1px solid rgba(223,223,122,0.3); font-size:0.95rem; }
  .rb-Nb { background:linear-gradient(135deg,#3d1e3d,#200d20); color:#df7adf; border:1px solid rgba(223,122,223,0.3); font-size:0.95rem; }
  .rb-Lb { background:linear-gradient(135deg,#1e3d3d,#0d2020); color:#7adfdf; border:1px solid rgba(122,223,223,0.3); font-size:0.95rem; }

  /* ── OVER BALLS ── */
  .over-balls { display:flex; gap:5px; flex-wrap:wrap; align-items:center; }
  .ball-chip {
    width:30px; height:30px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Orbitron',monospace; font-size:0.65rem; font-weight:700;
  }
  .bc-0  { background:#1a2535; color:#4a6080; border:1px solid #2a3545; }
  .bc-1,.bc-2,.bc-3 { background:#1a3d1a; color:#7adf7a; }
  .bc-4  { background:#1a5a30; color:#4dffa0; }
  .bc-6  { background:#4a1a6e; color:#df7aff; }
  .bc-W  { background:#5a1a1a; color:#ff6060; }
  .bc-Wd,.bc-Nb,.bc-Lb { background:#3a3a1a; color:#ffe060; font-size:0.5rem; border:1px dashed rgba(255,224,96,0.4); }

  /* ── TABS ── */
  .tabs { display:flex; gap:4px; background:var(--sky-mid); border-radius:10px; padding:4px; margin-bottom:10px; }
  .tab  {
    flex:1; padding:7px; border:none; border-radius:7px;
    background:transparent; color:var(--text-dim);
    font-family:'Rajdhani',sans-serif; font-weight:700;
    font-size:0.78rem; text-transform:uppercase; letter-spacing:1px;
    cursor:pointer; transition:all 0.15s;
  }
  .tab.active { background:var(--panel-light); color:var(--gold); border:1px solid var(--border); }

  /* ── MATCH TYPE CARDS ── */
  .match-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .match-card {
    background:var(--panel); border:2px solid var(--border);
    border-radius:16px; padding:22px 14px;
    text-align:center; cursor:pointer; transition:all 0.2s;
  }
  .match-card:hover { border-color:var(--gold); background:rgba(245,200,66,0.07); transform:translateY(-2px); }
  .match-icon { font-size:2.4rem; display:block; margin-bottom:7px; }
  .match-name { font-family:'Orbitron',monospace; font-size:0.72rem; letter-spacing:2px; color:var(--gold); }

  /* ── PLAYER CHIP (setup) ── */
  .player-chip {
    display:flex; align-items:center;
    background:var(--sky-mid); border:1px solid var(--border);
    border-radius:8px; padding:7px 10px; margin-bottom:5px;
  }
  .chip-num { font-family:'Orbitron',monospace; font-size:0.6rem; color:var(--text-dim); width:20px; }

  /* ── SCORECARD TABLE ── */
  .sc-table { width:100%; border-collapse:collapse; font-size:0.82rem; }
  .sc-table th {
    font-family:'Orbitron',monospace; font-size:0.52rem;
    letter-spacing:2px; color:var(--text-dim);
    text-transform:uppercase; padding:5px 4px;
    border-bottom:1px solid var(--border); text-align:left;
  }
  .sc-table th.rc,.sc-table td.rc { text-align:right; font-family:'Orbitron',monospace; font-size:0.75rem; }
  .sc-table td { padding:6px 4px; border-bottom:1px solid rgba(255,255,255,0.04); }
  .sc-table tr.dismissed td { color:var(--text-dim); }
  .sc-table tr.batting td { color:#fff; }

  /* ── BOWLING TABLE ── */
  .bowl-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:4px; align-items:center; font-size:0.82rem; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .bowl-head { font-family:'Orbitron',monospace; font-size:0.52rem; letter-spacing:2px; color:var(--text-dim); }
  .mono { font-family:'Orbitron',monospace; font-size:0.75rem; }

  /* ── EXTRAS ── */
  .extras-row { display:flex; gap:7px; flex-wrap:wrap; font-size:0.78rem; color:var(--text-dim); }
  .extra-chip { background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:6px; }

  /* ── BADGES ── */
  .innings-badge {
    display:inline-block; padding:3px 10px; border-radius:20px;
    font-family:'Orbitron',monospace; font-size:0.62rem; letter-spacing:1px;
    background:rgba(245,200,66,0.12); border:1px solid var(--gold); color:var(--gold);
    margin-bottom:7px;
  }

  /* ── MODAL ── */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.82);
    backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; padding:16px;
  }
  .modal {
    background:var(--panel); border:1px solid var(--gold);
    border-radius:16px; padding:18px;
    width:100%; max-width:380px; max-height:80vh; overflow-y:auto;
  }
  .modal-title {
    font-family:'Orbitron',monospace; font-size:0.75rem;
    letter-spacing:3px; color:var(--gold);
    text-transform:uppercase; margin-bottom:14px;
  }

  /* ── RESULT ── */
  .result-screen { text-align:center; padding:28px 14px; }
  .result-trophy { font-size:3.8rem; margin-bottom:10px; display:block; }
  .result-title {
    font-family:'Bebas Neue',sans-serif; font-size:2.4rem;
    letter-spacing:3px; color:var(--gold); line-height:1;
  }
  .result-sub { color:var(--text-dim); margin-top:7px; font-size:0.9rem; }

  /* ── WINNER OVERLAY ── */
  .winner-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.88);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000; padding: 20px;
    animation: fadeIn 0.3s ease;
  }
  .winner-box {
    background: linear-gradient(135deg, #0a2a10, #051508);
    border: 2px solid var(--gold);
    border-radius: 20px;
    padding: 30px 24px;
    text-align: center;
    width: 100%; max-width: 360px;
    position: relative;
    overflow: hidden;
  }
  .winner-box::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }
  .winner-trophy { font-size: 4rem; display: block; margin-bottom: 10px; }
  .winner-label {
    font-family: 'Orbitron', monospace; font-size: 0.65rem;
    letter-spacing: 4px; color: var(--text-dim);
    text-transform: uppercase; margin-bottom: 6px;
  }
  .winner-team {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2rem, 8vw, 3rem);
    letter-spacing: 2px;
    background: linear-gradient(135deg, #f5c842, #fff8d0);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; line-height: 1; margin-bottom: 8px;
  }
  .winner-margin {
    font-size: 1rem; color: var(--text); font-weight: 600; margin-bottom: 18px;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  /* ── SNACKBAR ── */
  .snackbar {
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    background:var(--gold); color:#1a1000;
    padding:9px 20px; border-radius:30px;
    font-weight:700; font-size:0.88rem; z-index:9999;
    white-space:nowrap;
    animation: snkIn 0.2s ease, snkOut 0.3s ease 1.7s forwards;
  }
  @keyframes snkIn { from{opacity:0;transform:translateX(-50%) translateY(16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes snkOut { to{opacity:0;transform:translateX(-50%) translateY(16px)} }

  /* ── UTILS ── */
  .flex { display:flex; }
  .items-center { align-items:center; }
  .justify-between { justify-content:space-between; }
  .gap-2 { gap:8px; }
  .mt-2 { margin-top:8px; }
  .mb-2 { margin-bottom:8px; }
  .text-center { text-align:center; }
  .text-dim { color:var(--text-dim); }
  .text-gold { color:var(--gold); }
  .text-red { color:var(--red); }
  .font-bold { font-weight:700; }
  .w-full { width:100%; }
  .section-head {
    font-family:'Orbitron',monospace; font-size:0.62rem;
    letter-spacing:2px; color:var(--text-dim);
    text-transform:uppercase; margin-bottom:7px; margin-top:10px;
  }
  .divider { height:1px; background:var(--border); margin:10px 0; }
  /* ── SERIES STANDINGS ── */
  .series-strip {
    display: grid; grid-template-columns: 1fr auto 1fr;
    align-items: center; gap: 8px;
    background: rgba(245,200,66,0.07);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 14px;
    margin-bottom: 10px;
  }
  .series-wins {
    font-family: 'Orbitron', monospace;
    font-size: 2rem; font-weight: 900; line-height: 1;
  }
  .series-wins.leading { color: var(--gold); }
  .series-wins.trailing { color: var(--text-dim); }

  /* ── HOME SCREEN ROWS ── */
  .home-row {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px 16px;
    cursor: pointer; transition: all 0.2s; margin-bottom: 8px;
    display: flex; align-items: center; gap: 14px;
  }
  .home-row:hover { border-color: rgba(245,200,66,0.5); background: rgba(245,200,66,0.04); }
  .home-row.featured {
    background: linear-gradient(135deg, rgba(245,200,66,0.12), rgba(245,200,66,0.04));
    border: 2px solid var(--gold); margin-bottom: 10px;
  }
  .home-row-icon { font-size: 2rem; flex-shrink: 0; }
  .home-row-arrow { margin-left: auto; color: var(--text-dim); font-size: 1.2rem; }
  .home-row.featured .home-row-arrow { color: var(--gold); }

`;

export default styles;
