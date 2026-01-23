:root {
    /* OLED Palette */
    --bg-main: #000000; /* True Black */
    --bg-card: #111111; /* Dark Gray for contrast */
    --bg-input: #1a1a1a;
    --border-dim: #333333;
    
    --primary: #00ffee; /* Electric Cyan */
    --primary-dim: rgba(0, 255, 238, 0.15);
    
    --text: #ffffff;
    --text-sec: #bbbbbb;
    
    --danger: #ff3333;
    --success: #00ff66;

    --font: 'Rubik', sans-serif;
    --radius: 16px;
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; user-select: none; }

body {
    margin: 0; padding: 0;
    font-family: var(--font);
    background: var(--bg-main); color: var(--text);
    height: 100vh; overflow: hidden;
    direction: rtl;
    font-size: 16px;
}

/* Layout */
.app-container {
    height: 100%; display: flex; flex-direction: column;
    padding: calc(env(safe-area-inset-top) + 15px) 20px calc(env(safe-area-inset-bottom) + 15px);
}
.spacer { flex: 1; }

/* OLED Components */
.oled-card {
    background: var(--bg-card);
    border: 1px solid var(--border-dim);
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5); /* Subtle shadow */
}

/* Primary Button - Neon Glow */
.btn-primary {
    background: var(--primary); color: #000;
    border: none; border-radius: 12px;
    padding: 16px; font-weight: 700; font-size: 1.1rem;
    width: 100%; cursor: pointer; transition: 0.15s;
    box-shadow: 0 0 15px rgba(0, 255, 238, 0.3); /* Neon glow */
}
.btn-primary:active { transform: scale(0.98); opacity: 0.9; }

/* Secondary/Outline Button */
.btn-outline {
    background: transparent;
    border: 1px solid var(--border-dim);
    color: var(--text);
    border-radius: 12px; padding: 15px; font-weight: 600; font-size: 1rem;
    width: 100%; cursor: pointer;
}
.btn-outline:active { background: #222; border-color: #555; }

.icon-btn { background: none; border: none; color: white; padding: 8px; cursor: pointer; }

/* Navbar */
.navbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; min-height: 44px; }
.logo { font-weight: 700; font-size: 1.5rem; letter-spacing: -1px; }
.logo .highlight { color: var(--primary); }

/* Screens */
.screen { display: none; flex-direction: column; flex: 1; overflow-y: auto; padding-bottom: 20px; animation: fadeIn 0.2s ease; }
.screen.active { display: flex; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Home */
.hero { text-align: center; margin-bottom: 25px; }
.hero h1 { font-size: 2.2rem; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
.hero p { color: var(--text-sec); margin-top: 5px; font-size: 1.1rem; }
.info-card { display: flex; align-items: center; gap: 15px; border-color: var(--primary-dim); }
.icon-box { color: var(--primary); font-size: 1.5rem; }
.label { font-size: 0.9rem; color: var(--text-sec); }
.value { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-top: 2px; }
.home-actions { display: flex; flex-direction: column; gap: 15px; }
.version-tag { text-align: center; color: #444; font-size: 0.8rem; margin-top: 20px; }

/* Program Select */
.page-title { font-size: 1.8rem; margin-bottom: 20px; font-weight: 700; }
.card-grid { display: grid; gap: 15px; }
.prog-card { display: flex; align-items: center; gap: 15px; cursor: pointer; transition: 0.2s; border: 1px solid #222; }
.prog-card:active { background: #1a1a1a; border-color: var(--primary); }
.prog-icon { font-size: 1.6rem; font-weight: 800; color: var(--primary); background: #000; border: 1px solid var(--border-dim); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.prog-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; }
.prog-desc { font-size: 0.9rem; color: var(--text-sec); }

/* Active Workout */
.active-header { text-align: center; margin-bottom: 20px; }
.badge { background: var(--primary); color: black; font-weight: 800; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem; display: inline-block; margin-bottom: 10px; }
#ex-name { font-size: 2rem; font-weight: 700; margin: 0; line-height: 1.1; }
.note-pill { color: #ffe600; font-size: 0.95rem; margin-top: 10px; display: block; font-weight: 500; }
.history-pill { text-align: center; color: var(--text-sec); font-size: 0.9rem; margin-bottom: 30px; }

/* Inputs - High Contrast */
.inputs-row { display: flex; gap: 15px; margin-bottom: 30px; }
.input-card { flex: 1; background: var(--bg-card); border: 1px solid var(--border-dim); border-radius: 16px; padding: 20px; text-align: center; display: flex; flex-direction: column; }
.input-label { font-size: 0.9rem; color: var(--text-sec); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
.native-select {
    background: transparent; border: none; color: white;
    font-size: 2.5rem; font-weight: 700; font-family: var(--font);
    text-align: center; width: 100%; appearance: none;
    padding: 0; margin: 0;
}
.native-select option { background: #000; color: white; }

/* Stopwatch - Neon */
.stopwatch-box { background: #000; border: 1px solid var(--border-dim); border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 25px; display: flex; flex-direction: column; align-items: center; }
.sw-time { font-size: 4rem; font-family: monospace; font-weight: 700; margin-bottom: 15px; color: white; letter-spacing: -2px; }
.btn-neon-play { width: 80px; height: 80px; border-radius: 50%; background: transparent; border: 2px solid var(--success); color: var(--success); font-size: 2.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.btn-neon-play:active { background: rgba(0, 255, 102, 0.2); }
.btn-neon-play.running { border-color: var(--danger); color: var(--danger); }
.sw-hint { margin-top: 15px; color: var(--text-sec); font-size: 0.9rem; }

/* Feeling */
.feeling-row { display: flex; justify-content: center; gap: 20px; margin-bottom: 10px; }
.feel-btn { width: 60px; height: 60px; border-radius: 50%; background: #111; border: 1px solid #333; font-size: 1.8rem; cursor: pointer; transition: 0.2s; color: #555; }
.feel-btn.selected { transform: scale(1.1); border-color: var(--primary); color: white; background: rgba(0, 255, 238, 0.1); box-shadow: 0 0 15px rgba(0, 255, 238, 0.2); }
.feel-label { text-align: center; color: var(--primary); font-size: 1rem; margin-bottom: 20px; height: 1.2em; font-weight: 500; }

/* Rest Timer */
.rest-box { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.circular-timer { width: 140px; height: 140px; position: relative; }
.circular-timer svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.bg-ring { stroke: #222; stroke-width: 6; fill: none; }
.prog-ring { stroke: var(--primary); stroke-width: 6; fill: none; stroke-dasharray: 283; stroke-linecap: round; transition: stroke-dashoffset 1s linear; filter: drop-shadow(0 0 4px var(--primary)); }
.timer-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-family: monospace; font-weight: 700; }
.rest-caption { margin-top: 10px; color: var(--text-sec); font-size: 0.9rem; }

/* Actions */
.sub-actions { display: flex; justify-content: space-between; margin-top: 20px; padding: 0 10px; }
.text-link { background: none; border: none; color: var(--text-sec); text-decoration: underline; cursor: pointer; font-size: 0.9rem; }

/* Lists & History */
.simple-list, .scroll-list, .history-list-container { display: flex; flex-direction: column; gap: 10px; }
.scroll-list { max-height: 60vh; overflow-y: auto; }
.list-item { background: var(--bg-card); padding: 18px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #222; }
.hist-item-row { background: var(--bg-card); border: 1px solid #222; padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }

/* Modals */
.modal-wrapper { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100; display: none; justify-content: center; align-items: center; padding: 20px; }
.oled-modal { background: #0a0a0a; width: 100%; max-width: 500px; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; max-height: 85vh; border: 1px solid #333; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #222; }
.modal-footer { display: flex; gap: 10px; margin-top: 20px; }
.oled-input { background: #1a1a1a; border: 1px solid #333; padding: 14px; border-radius: 10px; color: white; width: 100%; font-size: 1rem; }
.admin-item { display: flex; justify-content: space-between; align-items: center; background: #151515; padding: 14px; border-radius: 10px; border: 1px solid #222; margin-bottom: 5px; }
.input-group label { display: block; margin-bottom: 8px; color: #888; font-size: 0.9rem; }

/* Buttons Small */
.btn-danger-outline { background: transparent; border: 1px solid var(--danger); color: var(--danger); padding: 14px; border-radius: 12px; width: 100%; cursor: pointer; font-weight: 600; }
.btn-tool, .btn-tool-outline, .btn-tool-danger { padding: 8px 14px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; }
.btn-tool { background: #222; border: none; color: white; }
.btn-tool-outline { background: transparent; border: 1px solid var(--primary); color: var(--primary); }
.btn-tool-danger { background: transparent; border: 1px solid var(--danger); color: var(--danger); opacity: 0.5; }
.btn-tool-danger:enabled { opacity: 1; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-tools { display: flex; gap: 10px; }
.bulk-tools { display: flex; justify-content: space-between; margin-bottom: 15px; }

/* Checkbox */
.custom-chk { appearance: none; width: 24px; height: 24px; border: 2px solid #555; border-radius: 6px; background: transparent; cursor: pointer; }
.custom-chk:checked { background: var(--primary); border-color: var(--primary); }

/* Summary */
.summary-box { font-family: monospace; white-space: pre-wrap; background: #111; padding: 20px; border-radius: 12px; margin-bottom: 20px; line-height: 1.6; font-size: 0.95rem; border: 1px solid #333; }
.meta-tag { color: var(--text-sec); margin-top: 5px; }
.actions-column { display: flex; flex-direction: column; gap: 12px; }
