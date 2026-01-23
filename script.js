/**
 * GYMSTART BETA V0.2
 * Features: Multi-Split, Scroll Pickers, Up-Timer, Robust Admin
 */

// --- DATA & CONFIG ---
const CONFIG = {
    KEYS: {
        ROUTINES: 'gymstart_beta_02_routines',
        HISTORY: 'gymstart_beta_02_history',
        VER: 'gymstart_beta_02_ver'
    }
};

// --- EXERCISE BANK (CATEGORIZED) ---
const BANK = [
    // Legs
    { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', cat: 'legs', step: 1 },
    { id: 'leg_press', name: 'לחיצת רגליים (Leg Press)', unit: 'kg', cat: 'legs', step: 5 },
    { id: 'rdl', name: 'דדליפט רומני (RDL)', unit: 'kg', cat: 'legs', step: 1 },
    { id: 'lunge', name: 'מכרעים (Lunges)', unit: 'kg', cat: 'legs', step: 1 },
    // Chest
    { id: 'chest_press', name: 'לחיצת חזה משקולות', unit: 'kg', cat: 'chest', step: 1 },
    { id: 'fly', name: 'פרפר (Fly)', unit: 'kg', cat: 'chest', step: 1 },
    { id: 'pushup', name: 'שכיבות סמיכה', unit: 'bodyweight', cat: 'chest', step: 0 },
    // Back
    { id: 'lat_pull', name: 'פולי עליון', unit: 'plates', cat: 'back', step: 1 },
    { id: 'cable_row', name: 'חתירה בכבל', unit: 'plates', cat: 'back', step: 1 },
    { id: 'db_row', name: 'חתירה במשקולת', unit: 'kg', cat: 'back', step: 1 },
    // Shoulders
    { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', cat: 'shoulders', step: 1 },
    { id: 'lat_raise', name: 'הרחקה לצדדים', unit: 'kg', cat: 'shoulders', step: 1 },
    // Arms
    { id: 'bicep_curl', name: 'כפיפת מרפקים (יד קדמית)', unit: 'kg', cat: 'arms', step: 1 },
    { id: 'tricep_pull', name: 'פשיטת מרפקים (פולי)', unit: 'plates', cat: 'arms', step: 1 },
    // Core
    { id: 'plank', name: 'פלאנק (בטן סטטי)', unit: 'bodyweight', cat: 'core', step: 0 },
    { id: 'side_plank', name: 'פלאנק צידי', unit: 'bodyweight', cat: 'core', step: 0 },
    { id: 'bicycle', name: 'כפיפות בטן אופניים', unit: 'bodyweight', cat: 'core', step: 0 },
    { id: 'knee_raise', name: 'הרמת ברכיים', unit: 'bodyweight', cat: 'core', step: 0 }
];

// --- DEFAULT ROUTINES (SEED) ---
const DEFAULT_ROUTINES = {
    'A': [ // Legs & Back
        { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', note: 'גב זקוף, עקבים בקרקע', target: {w:10, r:12} },
        { id: 'leg_press', name: 'לחיצת רגליים', unit: 'kg', note: 'לא לנעול ברכיים', target: {w:30, r:12} },
        { id: 'rdl', name: 'דדליפט רומני', unit: 'kg', note: 'לרדת לאט עד הברך', target: {w:10, r:12} },
        { id: 'lat_pull', name: 'פולי עליון', unit: 'plates', note: 'למשוך לחזה', target: {w:6, r:12} },
        { id: 'cable_row', name: 'חתירה בכבל', unit: 'plates', note: 'מרפקים צמודים לגוף', target: {w:6, r:12} },
        { id: 'bicycle', name: 'בטן אופניים', unit: 'bodyweight', note: 'קצב איטי ומבוקר', target: {w:0, r:30} },
        { id: 'knee_raise', name: 'הרמת ברכיים', unit: 'bodyweight', note: 'בלי תנופה', target: {w:0, r:12} }
    ],
    'B': [ // Chest, Shoulders, Arms
        { id: 'chest_press', name: 'לחיצת חזה משקולות', unit: 'kg', note: 'לשמור על יציבות', target: {w:7, r:12} },
        { id: 'fly', name: 'פרפר (Fly)', unit: 'kg', note: 'תנועה רחבה', target: {w:3, r:12} },
        { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', note: 'גב צמוד למשענת', target: {w:4, r:12} },
        { id: 'lat_raise', name: 'הרחקה לצדדים', unit: 'kg', note: 'מרפק מוביל תנועה', target: {w:3, r:12} },
        { id: 'bicep_curl', name: 'יד קדמית', unit: 'kg', note: 'בלי להזיז אגן', target: {w:5, r:12} },
        { id: 'tricep_pull', name: 'יד אחורית פולי', unit: 'plates', note: 'מרפקים מקובעים', target: {w:4.5, r:12} },
        { id: 'side_plank', name: 'פלאנק צידי', unit: 'bodyweight', note: 'אגן גבוה', target: {w:0, r:45} }
    ],
    'FBW': [ // Full Body
        { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', note: 'רגליים (דחיפה)', target: {w:10, r:12} },
        { id: 'rdl', name: 'דדליפט רומני', unit: 'kg', note: 'רגליים (משיכה)', target: {w:10, r:12} },
        { id: 'chest_press', name: 'לחיצת חזה', unit: 'kg', note: 'חזה', target: {w:7, r:12} },
        { id: 'cable_row', name: 'חתירה בכבל', unit: 'plates', note: 'גב', target: {w:6, r:12} },
        { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', note: 'כתפיים', target: {w:4, r:12} },
        { id: 'plank', name: 'פלאנק סטטי', unit: 'bodyweight', note: 'בטן', target: {w:0, r:45} }
    ]
};

// --- MAIN APP OBJECT ---
const app = {
    state: {
        routines: {},
        history: [],
        currentProgId: null, // 'A', 'B', or 'FBW'
        active: {
            on: false,
            exIdx: 0,
            setIdx: 1,
            log: [], 
            startTime: 0,
            timerInterval: null,
            elapsed: 0,
            feel: 'good',
            isStopwatch: false,
            stopwatchVal: 0
        },
        admin: {
            viewProg: 'A',
            bankFilter: ''
        }
    },

    // 1. INIT
    init: function() {
        console.log("App V0.2 Init");
        try {
            this.loadData();
            this.renderHome();
        } catch (e) {
            console.error(e);
            alert("שגיאה בטעינת נתונים. מבצע איפוס...");
            localStorage.clear();
            location.reload();
        }
    },

    loadData: function() {
        // Load History
        const h = localStorage.getItem(CONFIG.KEYS.HISTORY);
        this.state.history = h ? JSON.parse(h) : [];

        // Load Routines (or Seed new ones if version mismatch/empty)
        const r = localStorage.getItem(CONFIG.KEYS.ROUTINES);
        const v = localStorage.getItem(CONFIG.KEYS.VER);
        
        if (r && v === '0.2') {
            this.state.routines = JSON.parse(r);
        } else {
            // Hard Reset for V0.2 to ensure new structure
            this.state.routines = JSON.parse(JSON.stringify(DEFAULT_ROUTINES));
            localStorage.setItem(CONFIG.KEYS.VER, '0.2');
            this.saveData();
        }
    },

    saveData: function() {
        localStorage.setItem(CONFIG.KEYS.ROUTINES, JSON.stringify(this.state.routines));
        localStorage.setItem(CONFIG.KEYS.HISTORY, JSON.stringify(this.state.history));
    },

    // 2. NAVIGATION
    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        const backBtn = document.getElementById('nav-back');
        if (screenId === 'screen-home') {
            backBtn.style.visibility = 'hidden';
            // Hide timer on home
            document.getElementById('global-timer').style.display = 'none';
        } else {
            backBtn.style.visibility = 'visible';
            // Show timer if active
            if(this.state.active.on) document.getElementById('global-timer').style.display = 'flex';
        }
        window.scrollTo(0,0);
    },

    goBack: function() {
        const activeScreen = document.querySelector('.screen.active').id;
        if (activeScreen === 'screen-active') {
            if (confirm("לצאת באמצע אימון?")) {
                this.stopTimer();
                this.state.active.on = false;
                this.nav('screen-overview');
            }
        } else if (activeScreen === 'screen-overview') {
             this.nav('screen-program-select');
        } else {
            this.nav('screen-home');
        }
    },

    // 3. PROGRAM SELECTION
    selectProgram: function(progId) {
        this.state.currentProgId = progId;
        this.renderOverview();
        this.nav('screen-overview');
    },

    renderOverview: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const list = document.getElementById('overview-list');
        const title = document.getElementById('overview-title');
        
        let nameMap = { 'A': 'אימון A', 'B': 'אימון B', 'FBW': 'אימון FBW' };
        title.innerText = `סקירה: ${nameMap[this.state.currentProgId]}`;

        list.innerHTML = '';
        prog.forEach((ex, i) => {
            list.innerHTML += `
                <div class="list-item">
                    <span>${i+1}. ${ex.name}</span>
                    <span style="font-size:0.8rem; color:#888">${ex.target?.w || '-'} ${ex.unit}</span>
                </div>
            `;
        });
    },

    renderHome: function() {
        const lastEl = document.getElementById('last-workout-display');
        if (this.state.history.length > 0) {
            const last = this.state.history[this.state.history.length - 1];
            lastEl.innerText = `${last.date} (${last.program})`;
        } else {
            lastEl.innerText = "טרם בוצע";
        }
    },

    // 4. ACTIVE WORKOUT ENGINE
    startWorkout: function() {
        this.state.active = {
            on: true,
            exIdx: 0,
            setIdx: 1,
            log: [],
            startTime: Date.now(),
            timerInterval: null,
            elapsed: 0, // Rest timer
            feel: 'good',
            isStopwatch: false,
            stopwatchVal: 0
        };
        this.loadActiveExercise();
        this.nav('screen-active');
    },

    loadActiveExercise: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const ex = prog[this.state.active.exIdx];
        
        // Setup UI
        document.getElementById('ex-name').innerText = ex.name;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
        
        // Coach Note
        const noteEl = document.getElementById('coach-note');
        if (ex.note) {
            noteEl.innerText = "💡 " + ex.note;
            noteEl.style.display = 'inline-block';
        } else noteEl.style.display = 'none';

        // Check Unit (Time vs Weight)
        const isTime = (ex.unit === 'bodyweight' && (ex.id.includes('plank') || ex.id === 'wall_sit')); // Simple heuristic or explicit flag
        this.state.active.isStopwatch = isTime;

        if (isTime) {
            document.getElementById('scroller-container').style.display = 'none';
            document.getElementById('stopwatch-container').style.display = 'flex';
            document.getElementById('sw-display').innerText = "00:00";
            this.state.active.stopwatchVal = 0;
            document.getElementById('btn-sw-toggle').classList.remove('running');
            document.getElementById('btn-sw-toggle').innerText = "▶";
        } else {
            document.getElementById('scroller-container').style.display = 'flex';
            document.getElementById('stopwatch-container').style.display = 'none';
            document.getElementById('unit-label').innerText = ex.unit === 'plates' ? 'פלטות' : 'ק״ג';
            
            // Build Scrollers based on Target or History
            this.buildScrollers(ex);
        }

        // Reset Set State
        this.state.active.feel = 'good';
        this.updateFeelUI();
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        
        // History Pill
        this.updateHistoryPill(ex.id);
    },

    updateHistoryPill: function(exId) {
        // Find last log of this exercise
        let lastLog = null;
        for(let i=this.state.history.length-1; i>=0; i--) {
            const sess = this.state.history[i];
            const found = sess.data.find(e => e.id === exId);
            if(found) { lastLog = found.sets[found.sets.length-1]; break; }
        }

        const pill = document.getElementById('history-badge');
        if(lastLog) {
            pill.innerText = `הישג קודם: ${lastLog.w} × ${lastLog.r}`;
        } else {
            // Show Target
            const ex = this.state.routines[this.state.currentProgId][this.state.active.exIdx];
            if(ex.target) pill.innerText = `יעד: ${ex.target.w} × ${ex.target.r}`;
            else pill.innerText = "תרגיל חדש";
        }
    },

    // --- SCROLL PICKER LOGIC ---
    buildScrollers: function(ex) {
        // Weight
        const wContainer = document.getElementById('wheel-weight');
        const rContainer = document.getElementById('wheel-reps');
        wContainer.innerHTML = '<div style="height:75px"></div>'; // Spacer
        rContainer.innerHTML = '<div style="height:75px"></div>'; // Spacer

        // Determine Range & Default
        let startW = ex.target?.w || 10;
        let startR = ex.target?.r || 12;
        
        // Weight Range (0 - 100)
        for(let i=0; i<=100; i+= (ex.step || 1)) {
            const div = document.createElement('div');
            div.className = 'wheel-item';
            div.innerText = i;
            if(i === startW) div.classList.add('active');
            wContainer.appendChild(div);
        }
        
        // Reps Range (1 - 50)
        for(let i=1; i<=50; i++) {
            const div = document.createElement('div');
            div.className = 'wheel-item';
            div.innerText = i;
            if(i === startR) div.classList.add('active');
            rContainer.appendChild(div);
        }

        wContainer.innerHTML += '<div style="height:75px"></div>';
        rContainer.innerHTML += '<div style="height:75px"></div>';

        // Scroll to default (Hack with setTimeout for rendering)
        setTimeout(() => {
            this.scrollToValue(wContainer, startW, ex.step||1);
            this.scrollToValue(rContainer, startR, 1, true);
        }, 100);

        // Add Listeners for visual snap
        [wContainer, rContainer].forEach(el => {
            el.onscroll = () => this.highlightCenter(el);
        });
    },

    scrollToValue: function(el, val, step, isReps=false) {
        const itemH = 50;
        let idx = isReps ? (val - 1) : (val / step);
        el.scrollTop = idx * itemH;
    },

    highlightCenter: function(el) {
        const center = el.scrollTop + 100; // Middle of visible area
        const items = el.querySelectorAll('.wheel-item');
        items.forEach(item => {
            const top = item.offsetTop;
            if(top > center - 30 && top < center + 30) item.classList.add('active');
            else item.classList.remove('active');
        });
    },

    getScrollerValue: function(el) {
        const active = el.querySelector('.wheel-item.active');
        return active ? parseFloat(active.innerText) : 0;
    },

    // --- STOPWATCH LOGIC (PLANK) ---
    toggleStopwatch: function() {
        const btn = document.getElementById('btn-sw-toggle');
        
        if (this.state.active.timerInterval) {
            // STOP
            clearInterval(this.state.active.timerInterval);
            this.state.active.timerInterval = null;
            btn.classList.remove('running');
            btn.innerText = "▶";
        } else {
            // START
            // Clear Global Timer if running (Rest timer)
            this.stopTimer(); 
            document.getElementById('global-timer').style.display = 'none';

            const start = Date.now() - (this.state.active.stopwatchVal * 1000);
            btn.classList.add('running');
            btn.innerText = "⏹";
            
            this.state.active.timerInterval = setInterval(() => {
                const diff = Math.floor((Date.now() - start) / 1000);
                this.state.active.stopwatchVal = diff;
                
                let m = Math.floor(diff / 60);
                let s = diff % 60;
                document.getElementById('sw-display').innerText = 
                    `${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
            }, 100);
        }
    },

    // --- FEELING ---
    selectFeel: function(f) {
        this.state.active.feel = f;
        this.updateFeelUI();
    },

    updateFeelUI: function() {
        const map = { 'easy': 'קליל', 'good': 'בוינג (טוב)', 'hard': 'קשה רצח' };
        document.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`.feel-btn.${this.state.active.feel}`).classList.add('selected');
        document.getElementById('feel-text').innerText = map[this.state.active.feel];
    },

    // --- ACTIONS ---
    finishSet: function() {
        // Collect Data
        let w, r;
        if (this.state.active.isStopwatch) {
            // If stopwatch running, stop it first
            if(this.state.active.timerInterval) this.toggleStopwatch();
            w = 0; 
            r = this.state.active.stopwatchVal;
            if (r === 0) { alert("לא נמדד זמן!"); return; }
        } else {
            w = this.getScrollerValue(document.getElementById('wheel-weight'));
            r = this.getScrollerValue(document.getElementById('wheel-reps'));
        }

        // Log It
        const prog = this.state.routines[this.state.currentProgId];
        const ex = prog[this.state.active.exIdx];
        
        let exLog = this.state.active.log.find(l => l.id === ex.id);
        if(!exLog) {
            exLog = { id: ex.id, name: ex.name, sets: [] };
            this.state.active.log.push(exLog);
        }
        exLog.sets.push({ w, r, feel: this.state.active.feel });

        // Start Rest Timer (Global)
        this.startGlobalTimer();

        // Advance Logic
        if (this.state.active.setIdx < 3) {
            // Immediate Next Set
            this.state.active.setIdx++;
            document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
            
            // Reset UI slightly
            this.state.active.feel = 'good';
            this.updateFeelUI();
            
            // If stopwatch, reset it
            if(this.state.active.isStopwatch) {
                this.state.active.stopwatchVal = 0;
                document.getElementById('sw-display').innerText = "00:00";
            }
        } else {
            // Decision Junction
            document.getElementById('btn-finish').style.display = 'none';
            document.getElementById('decision-buttons').style.display = 'flex';
        }
    },

    addSet: function() {
        this.state.active.setIdx++;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        
        // Reset Stopwatch if needed
        if(this.state.active.isStopwatch) {
            this.state.active.stopwatchVal = 0;
            document.getElementById('sw-display').innerText = "00:00";
        }
    },

    deleteLastSet: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const ex = prog[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === ex.id);

        if(exLog && exLog.sets.length > 0) {
            exLog.sets.pop();
            if (this.state.active.setIdx > 1) {
                this.state.active.setIdx--;
                document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
                // Restore finish button if we went back from decision
                document.getElementById('decision-buttons').style.display = 'none';
                document.getElementById('btn-finish').style.display = 'flex';
            }
        }
    },

    skipExercise: function() {
        this.nextExercise();
    },

    nextExercise: function() {
        this.stopTimer(); // Stop rest timer
        const prog = this.state.routines[this.state.currentProgId];
        
        if (this.state.active.exIdx < prog.length - 1) {
            this.state.active.exIdx++;
            this.state.active.setIdx = 1;
            this.loadActiveExercise();
        } else {
            this.finishWorkout();
        }
    },

    // --- GLOBAL TIMER (COUNT UP) ---
    startGlobalTimer: function() {
        this.stopTimer();
        const pill = document.getElementById('global-timer');
        const text = document.getElementById('timer-val');
        const path = document.getElementById('timer-path');
        
        pill.style.display = 'flex';
        pill.style.background = 'rgba(0,0,255,0.3)'; // Blueish for rest
        
        let sec = 0;
        text.innerText = "00:00";
        path.style.transition = 'none';
        path.style.strokeDasharray = "0, 100"; // Empty
        
        // Force reflow
        void path.offsetWidth;
        path.style.transition = 'stroke-dasharray 1s linear';

        this.state.active.timerInterval = setInterval(() => {
            sec++;
            let m = Math.floor(sec / 60);
            let s = sec % 60;
            text.innerText = `${m}:${s<10?'0'+s:s}`;

            // Circle fills up to 60s
            let pct = Math.min(sec * (100/60), 100);
            path.style.strokeDasharray = `${pct}, 100`;
            
            if (sec === 60) {
                if(navigator.vibrate) navigator.vibrate([200,100,200]);
                pill.style.background = 'rgba(0,255,0,0.2)';
            }
        }, 1000);
    },

    stopTimer: function() {
        if(this.state.active.timerInterval) clearInterval(this.state.active.timerInterval);
        document.getElementById('global-timer').style.display = 'none';
    },

    // 5. FINISH
    finishWorkout: function() {
        const textBox = document.getElementById('summary-text');
        let txt = "";
        this.state.active.log.forEach(ex => {
            if(ex.sets.length > 0) {
                txt += `✅ ${ex.name}\n`;
                ex.sets.forEach((s, i) => {
                    const u = s.r > 20 ? 'שנ׳' : '';
                    txt += `   סט ${i+1}: ${s.w > 0 ? s.w+'ק״ג' : ''} ${s.r}${u} (${s.feel})\n`;
                });
                txt += "\n";
            }
        });
        if(!txt) txt = "לא בוצעו תרגילים.";
        textBox.innerText = txt;
        this.nav('screen-summary');
    },

    saveAndHome: function() {
        if (this.state.active.log.length > 0) {
            this.state.history.push({
                date: new Date().toLocaleDateString('he-IL'),
                timestamp: Date.now(),
                program: this.state.currentProgId,
                data: this.state.active.log
            });
            this.saveData();
        }
        this.nav('screen-home');
    },

    // 6. HISTORY & EXPORT
    showHistory: function() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        [...this.state.history].reverse().forEach((h, i) => {
            const realIdx = this.state.history.length - 1 - i;
            list.innerHTML += `
                <div class="glass-card" onclick="app.showHistoryDetail(${realIdx})" style="padding:15px; margin-bottom:10px; cursor:pointer">
                    <div style="display:flex; justify-content:space-between">
                        <span style="font-weight:700; color:var(--primary)">${h.date}</span>
                        <span class="badge" style="background:#333; color:white">${h.program || '?'}</span>
                    </div>
                    <div style="font-size:0.85rem; color:#aaa; margin-top:5px">
                        ${h.data.length} תרגילים • לחצי לפירוט
                    </div>
                </div>
            `;
        });
        this.nav('screen-history');
    },

    showHistoryDetail: function(idx) {
        const item = this.state.history[idx];
        this.state.viewHistoryIdx = idx; // Save for delete
        
        document.getElementById('hist-modal-title').innerText = `${item.date} - אימון ${item.program}`;
        const content = document.getElementById('hist-detail-content');
        let html = '';
        item.data.forEach(ex => {
            html += `<div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:8px;">
                <div style="font-weight:bold; color:var(--primary)">${ex.name}</div>`;
            ex.sets.forEach((s, si) => {
                html += `<div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-top:4px; border-bottom:1px dashed #333">
                    <span>סט ${si+1}</span>
                    <span>${s.w > 0 ? s.w+'ק״ג' : ''} ${s.r} (${s.feel})</span>
                </div>`;
            });
            html += `</div>`;
        });
        content.innerHTML = html;
        document.getElementById('history-modal').style.display = 'flex';
    },

    closeHistoryModal: function() {
        document.getElementById('history-modal').style.display = 'none';
    },

    deleteCurrentLog: function() {
        if(confirm("למחוק את התיעוד הזה לצמיתות?")) {
            this.state.history.splice(this.state.viewHistoryIdx, 1);
            this.saveData();
            this.closeHistoryModal();
            this.showHistory();
        }
    },

    exportData: function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.history));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "gymstart_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    importData: function(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    if(confirm(`נמצאו ${data.length} אימונים. למזג עם הקיים?`)) {
                        app.state.history = [...app.state.history, ...data];
                        app.saveData();
                        app.showHistory();
                    }
                } else alert("קובץ לא תקין");
            } catch(err) { alert("שגיאה בקריאת הקובץ"); }
        };
        reader.readAsText(file);
    },

    // 7. ADMIN
    openAdmin: function() {
        document.getElementById('admin-modal').style.display = 'flex';
        this.renderAdminList();
    },
    
    closeAdmin: function() {
        document.getElementById('admin-modal').style.display = 'none';
    },

    renderAdminList: function() {
        const progId = document.getElementById('admin-prog-select').value;
        this.state.admin.viewProg = progId;
        const list = document.getElementById('admin-list');
        const prog = this.state.routines[progId];
        
        list.innerHTML = '';
        prog.forEach((ex, i) => {
            list.innerHTML += `
                <div class="admin-item">
                    <div>
                        <div style="font-weight:bold">${i+1}. ${ex.name}</div>
                        <div style="font-size:0.8rem; color:#888">${ex.target?.w||0} ${ex.unit}</div>
                    </div>
                    <div>
                        <button onclick="app.moveEx('${progId}', ${i}, -1)">⬆️</button>
                        <button onclick="app.moveEx('${progId}', ${i}, 1)">⬇️</button>
                        <button onclick="app.removeEx('${progId}', ${i})" style="color:red">🗑</button>
                    </div>
                </div>
            `;
        });
    },

    moveEx: function(progId, idx, dir) {
        const arr = this.state.routines[progId];
        if (idx + dir >= 0 && idx + dir < arr.length) {
            [arr[idx], arr[idx+dir]] = [arr[idx+dir], arr[idx]];
            this.renderAdminList();
        }
    },

    removeEx: function(progId, idx) {
        if(confirm("להסיר?")) {
            this.state.routines[progId].splice(idx, 1);
            this.renderAdminList();
        }
    },

    openBank: function() {
        document.getElementById('bank-modal').style.display = 'flex';
        // Render Categories
        const cats = [...new Set(BANK.map(b => b.cat))];
        const catContainer = document.getElementById('bank-cats');
        catContainer.innerHTML = `<button class="cat-tag active" onclick="app.filterBank('')">הכל</button>`;
        cats.forEach(c => {
            catContainer.innerHTML += `<button class="cat-tag" onclick="app.filterBank('${c}')">${c}</button>`;
        });
        this.filterBank('');
    },

    closeBank: function() {
        document.getElementById('bank-modal').style.display = 'none';
    },

    filterBank: function(cat) {
        // Toggle Active Class
        if (cat !== undefined) {
            this.state.admin.bankFilter = cat;
            document.querySelectorAll('.cat-tag').forEach(b => {
                b.classList.toggle('active', b.innerText === cat || (cat==='' && b.innerText==='הכל'));
            });
        }
        
        const txt = document.getElementById('bank-search').value.toLowerCase();
        const list = document.getElementById('bank-list');
        list.innerHTML = '';

        const filtered = BANK.filter(ex => {
            const matchCat = this.state.admin.bankFilter ? ex.cat === this.state.admin.bankFilter : true;
            const matchTxt = ex.name.toLowerCase().includes(txt);
            return matchCat && matchTxt;
        });

        filtered.forEach(ex => {
            list.innerHTML += `
                <div class="admin-item" onclick="app.addFromBank('${ex.id}')" style="cursor:pointer">
                    <span>${ex.name}</span>
                    <span style="color:#aaa">+</span>
                </div>
            `;
        });
    },

    addFromBank: function(exId) {
        const bankEx = BANK.find(e => e.id === exId);
        const newEx = JSON.parse(JSON.stringify(bankEx));
        // Add defaults
        newEx.note = prompt("הערת מאמן (אופציונלי):", "");
        newEx.target = { w: 10, r: 12 }; // Default

        this.state.routines[this.state.admin.viewProg].push(newEx);
        this.closeBank();
        this.renderAdminList();
    },

    saveAdmin: function() {
        this.saveData();
        alert("השינויים נשמרו בהצלחה");
        this.closeAdmin();
    }
};

// Start
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
