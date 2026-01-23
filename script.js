/**
 * GYMSTART BETA V0.3
 * Changes: New UI, Robust Timer, Archive Copy, Steppers
 */

// --- DATA & CONFIG ---
// Keep 02 keys to preserve user data
const CONFIG = {
    KEYS: {
        ROUTINES: 'gymstart_beta_02_routines',
        HISTORY: 'gymstart_beta_02_history',
        VER: 'gymstart_beta_02_ver'
    }
};

// --- EXERCISE BANK ---
const BANK = [
    { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', cat: 'legs', step: 1 },
    { id: 'leg_press', name: 'לחיצת רגליים (Leg Press)', unit: 'kg', cat: 'legs', step: 5 },
    { id: 'rdl', name: 'דדליפט רומני (RDL)', unit: 'kg', cat: 'legs', step: 1 },
    { id: 'lunge', name: 'מכרעים (Lunges)', unit: 'kg', cat: 'legs', step: 1 },
    { id: 'chest_press', name: 'לחיצת חזה משקולות', unit: 'kg', cat: 'chest', step: 1 },
    { id: 'fly', name: 'פרפר (Fly)', unit: 'kg', cat: 'chest', step: 1 },
    { id: 'pushup', name: 'שכיבות סמיכה', unit: 'bodyweight', cat: 'chest', step: 0 },
    { id: 'lat_pull', name: 'פולי עליון', unit: 'plates', cat: 'back', step: 1 },
    { id: 'cable_row', name: 'חתירה בכבל', unit: 'plates', cat: 'back', step: 1 },
    { id: 'db_row', name: 'חתירה במשקולת', unit: 'kg', cat: 'back', step: 1 },
    { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', cat: 'shoulders', step: 1 },
    { id: 'lat_raise', name: 'הרחקה לצדדים', unit: 'kg', cat: 'shoulders', step: 1 },
    { id: 'bicep_curl', name: 'כפיפת מרפקים (יד קדמית)', unit: 'kg', cat: 'arms', step: 1 },
    { id: 'tricep_pull', name: 'פשיטת מרפקים (פולי)', unit: 'plates', cat: 'arms', step: 1 },
    { id: 'plank', name: 'פלאנק (בטן סטטי)', unit: 'bodyweight', cat: 'core', step: 0 },
    { id: 'side_plank', name: 'פלאנק צידי', unit: 'bodyweight', cat: 'core', step: 0 },
    { id: 'bicycle', name: 'כפיפות בטן אופניים', unit: 'bodyweight', cat: 'core', step: 0 },
    { id: 'knee_raise', name: 'הרמת ברכיים', unit: 'bodyweight', cat: 'core', step: 0 }
];

// --- DEFAULT ROUTINES ---
const DEFAULT_ROUTINES = {
    'A': [
        { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', note: 'גב זקוף', target: {w:10, r:12} },
        { id: 'leg_press', name: 'לחיצת רגליים', unit: 'kg', note: 'לא לנעול ברכיים', target: {w:30, r:12} },
        { id: 'rdl', name: 'דדליפט רומני', unit: 'kg', note: 'לרדת לאט', target: {w:10, r:12} },
        { id: 'lat_pull', name: 'פולי עליון', unit: 'plates', note: 'למשוך לחזה', target: {w:6, r:12} },
        { id: 'cable_row', name: 'חתירה בכבל', unit: 'plates', note: 'מרפקים צמודים', target: {w:6, r:12} },
        { id: 'bicycle', name: 'בטן אופניים', unit: 'bodyweight', note: 'קצב איטי', target: {w:0, r:30} }
    ],
    'B': [
        { id: 'chest_press', name: 'לחיצת חזה', unit: 'kg', note: 'יציבות', target: {w:7, r:12} },
        { id: 'fly', name: 'פרפר', unit: 'kg', note: 'תנועה רחבה', target: {w:3, r:12} },
        { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', note: 'גב צמוד', target: {w:4, r:12} },
        { id: 'lat_raise', name: 'הרחקה לצדדים', unit: 'kg', note: 'מרפק מוביל', target: {w:3, r:12} },
        { id: 'bicep_curl', name: 'יד קדמית', unit: 'kg', note: 'בלי תנופה', target: {w:5, r:12} },
        { id: 'tricep_pull', name: 'יד אחורית', unit: 'plates', note: 'מרפקים מקובעים', target: {w:4.5, r:12} },
        { id: 'side_plank', name: 'פלאנק צידי', unit: 'bodyweight', note: 'אגן גבוה', target: {w:0, r:45} }
    ],
    'FBW': [
        { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', note: 'רגליים', target: {w:10, r:12} },
        { id: 'rdl', name: 'דדליפט רומני', unit: 'kg', note: 'רגליים', target: {w:10, r:12} },
        { id: 'chest_press', name: 'לחיצת חזה', unit: 'kg', note: 'חזה', target: {w:7, r:12} },
        { id: 'cable_row', name: 'חתירה בכבל', unit: 'plates', note: 'גב', target: {w:6, r:12} },
        { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', note: 'כתפיים', target: {w:4, r:12} },
        { id: 'plank', name: 'פלאנק סטטי', unit: 'bodyweight', note: 'בטן', target: {w:0, r:45} }
    ]
};

const app = {
    state: {
        routines: {},
        history: [],
        currentProgId: null,
        active: {
            on: false,
            exIdx: 0,
            setIdx: 1,
            log: [], 
            startTime: 0,
            timerInterval: null,
            feel: 'good',
            isStopwatch: false,
            stopwatchVal: 0,
            inputW: 10,
            inputR: 12
        },
        admin: { viewProg: 'A', bankFilter: '' },
        historySelection: [] // For bulk copy
    },

    init: function() {
        console.log("App V0.3 Init");
        try {
            this.loadData();
            this.renderHome();
        } catch (e) {
            console.error(e);
            alert("שגיאה בטעינת נתונים.");
        }
    },

    loadData: function() {
        const h = localStorage.getItem(CONFIG.KEYS.HISTORY);
        this.state.history = h ? JSON.parse(h) : [];
        const r = localStorage.getItem(CONFIG.KEYS.ROUTINES);
        const v = localStorage.getItem(CONFIG.KEYS.VER);
        if (r && v === '0.2') {
            this.state.routines = JSON.parse(r);
        } else {
            this.state.routines = JSON.parse(JSON.stringify(DEFAULT_ROUTINES));
            localStorage.setItem(CONFIG.KEYS.VER, '0.2'); 
        }
    },

    saveData: function() {
        localStorage.setItem(CONFIG.KEYS.ROUTINES, JSON.stringify(this.state.routines));
        localStorage.setItem(CONFIG.KEYS.HISTORY, JSON.stringify(this.state.history));
    },

    // --- NAVIGATION ---
    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        const backBtn = document.getElementById('nav-back');
        if (screenId === 'screen-home') {
            backBtn.style.visibility = 'hidden';
            // Stop timer just in case, though it shouldn't be here
            this.stopTimer();
        } else {
            backBtn.style.visibility = 'visible';
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

    selectProgram: function(progId) {
        this.state.currentProgId = progId;
        this.renderOverview();
        this.nav('screen-overview');
    },

    renderOverview: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const list = document.getElementById('overview-list');
        const title = document.getElementById('overview-title');
        title.innerText = `סקירה: תוכנית ${this.state.currentProgId}`;
        list.innerHTML = '';
        prog.forEach((ex, i) => {
            list.innerHTML += `<div class="list-item"><span>${i+1}. ${ex.name}</span><span style="color:#888">${ex.target?.w || '-'} ${ex.unit}</span></div>`;
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

    // --- ACTIVE WORKOUT ---
    startWorkout: function() {
        this.state.active = {
            on: true,
            exIdx: 0,
            setIdx: 1,
            log: [],
            startTime: Date.now(),
            timerInterval: null,
            elapsed: 0,
            feel: 'good',
            isStopwatch: false,
            stopwatchVal: 0,
            inputW: 10,
            inputR: 12
        };
        this.loadActiveExercise();
        this.nav('screen-active');
    },

    loadActiveExercise: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const ex = prog[this.state.active.exIdx];
        
        document.getElementById('ex-name').innerText = ex.name;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
        
        const noteEl = document.getElementById('coach-note');
        if (ex.note) {
            noteEl.innerText = "💡 " + ex.note;
            noteEl.style.display = 'inline-block';
        } else noteEl.style.display = 'none';

        // Check Unit
        const isTime = (ex.unit === 'bodyweight' && (ex.id.includes('plank') || ex.id === 'wall_sit'));
        this.state.active.isStopwatch = isTime;

        if (isTime) {
            document.getElementById('stepper-container').style.display = 'none';
            document.getElementById('stopwatch-container').style.display = 'flex';
            
            // Reset Stopwatch Logic explicitly
            this.state.active.stopwatchVal = 0;
            if(this.state.active.timerInterval) clearInterval(this.state.active.timerInterval);
            this.state.active.timerInterval = null;
            
            document.getElementById('sw-display').innerText = "00:00";
            document.getElementById('btn-sw-toggle').classList.remove('running');
            document.getElementById('btn-sw-toggle').innerText = "▶";
            document.getElementById('rest-timer-area').style.display = 'none';

        } else {
            document.getElementById('stepper-container').style.display = 'flex';
            document.getElementById('stopwatch-container').style.display = 'none';
            document.getElementById('unit-label-step').innerText = ex.unit === 'plates' ? 'פלטות' : 'ק״ג';
            
            // Init Values (Target or Default)
            this.state.active.inputW = ex.target?.w || 10;
            this.state.active.inputR = ex.target?.r || 12;
            this.updateStepperDisplay();
        }

        // Reset UI
        this.state.active.feel = 'good';
        this.updateFeelUI();
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        document.getElementById('rest-timer-area').style.display = 'none';
        
        this.updateHistoryPill(ex.id);
    },

    updateHistoryPill: function(exId) {
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
            pill.innerText = "תרגיל חדש";
        }
    },

    // --- STEPPERS LOGIC ---
    adjustWeight: function(delta) {
        // Step size: 1.25 if below 20, else 2.5
        let step = (this.state.active.inputW < 20) ? 1.25 : 2.5;
        let val = this.state.active.inputW + (delta * step);
        if (val < 0) val = 0;
        this.state.active.inputW = val;
        this.updateStepperDisplay();
    },

    adjustReps: function(delta) {
        let val = this.state.active.inputR + delta;
        if (val < 1) val = 1;
        this.state.active.inputR = val;
        this.updateStepperDisplay();
    },

    updateStepperDisplay: function() {
        document.getElementById('val-weight').innerText = this.state.active.inputW;
        document.getElementById('val-reps').innerText = this.state.active.inputR;
    },

    // --- STOPWATCH LOGIC ---
    toggleStopwatch: function() {
        const btn = document.getElementById('btn-sw-toggle');
        
        // Check actual interval to decide action
        if (this.state.active.timerInterval) {
            // STOP
            clearInterval(this.state.active.timerInterval);
            this.state.active.timerInterval = null;
            btn.classList.remove('running');
            btn.innerText = "▶";
        } else {
            // START
            // Ensure Rest Timer is OFF
            document.getElementById('rest-timer-area').style.display = 'none';

            const start = Date.now() - (this.state.active.stopwatchVal * 1000);
            btn.classList.add('running');
            btn.innerText = "⏹";
            
            this.state.active.timerInterval = setInterval(() => {
                const diff = Math.floor((Date.now() - start) / 1000);
                this.state.active.stopwatchVal = diff;
                let m = Math.floor(diff / 60);
                let s = diff % 60;
                document.getElementById('sw-display').innerText = `${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
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

    // --- FINISH SET & REST TIMER ---
    finishSet: function() {
        let w, r;
        if (this.state.active.isStopwatch) {
            if(this.state.active.timerInterval) this.toggleStopwatch(); // Auto stop
            w = 0; 
            r = this.state.active.stopwatchVal;
            if (r === 0) { alert("לא נמדד זמן!"); return; }
        } else {
            w = this.state.active.inputW;
            r = this.state.active.inputR;
        }

        const prog = this.state.routines[this.state.currentProgId];
        const ex = prog[this.state.active.exIdx];
        
        let exLog = this.state.active.log.find(l => l.id === ex.id);
        if(!exLog) {
            exLog = { id: ex.id, name: ex.name, sets: [] };
            this.state.active.log.push(exLog);
        }
        exLog.sets.push({ w, r, feel: this.state.active.feel });

        // Start Rest Timer (Center Screen)
        this.startRestTimer();

        if (this.state.active.setIdx < 3) {
            this.state.active.setIdx++;
            document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
            
            this.state.active.feel = 'good';
            this.updateFeelUI();
            
            if(this.state.active.isStopwatch) {
                this.state.active.stopwatchVal = 0;
                document.getElementById('sw-display').innerText = "00:00";
            }
        } else {
            document.getElementById('btn-finish').style.display = 'none';
            document.getElementById('decision-buttons').style.display = 'flex';
        }
    },

    startRestTimer: function() {
        // Clear any existing timer first
        if(this.state.active.timerInterval) clearInterval(this.state.active.timerInterval);
        
        const area = document.getElementById('rest-timer-area');
        const disp = document.getElementById('rest-timer-val');
        
        area.style.display = 'block';
        let sec = 0;
        disp.innerText = "00:00";
        
        this.state.active.timerInterval = setInterval(() => {
            sec++;
            let m = Math.floor(sec / 60);
            let s = sec % 60;
            disp.innerText = `${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
            
            if (sec === 60 && navigator.vibrate) navigator.vibrate([200,100,200]);
        }, 1000);
    },

    stopTimer: function() {
        if(this.state.active.timerInterval) clearInterval(this.state.active.timerInterval);
        this.state.active.timerInterval = null;
        document.getElementById('rest-timer-area').style.display = 'none';
    },

    addSet: function() {
        this.state.active.setIdx++;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        this.stopTimer(); // Stop rest if adding set
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
                document.getElementById('decision-buttons').style.display = 'none';
                document.getElementById('btn-finish').style.display = 'flex';
            }
        }
    },

    skipExercise: function() {
        this.nextExercise();
    },

    nextExercise: function() {
        this.stopTimer();
        const prog = this.state.routines[this.state.currentProgId];
        if (this.state.active.exIdx < prog.length - 1) {
            this.state.active.exIdx++;
            this.state.active.setIdx = 1;
            this.loadActiveExercise();
        } else {
            this.finishWorkout();
        }
    },

    // --- FINISH ---
    finishWorkout: function() {
        const endTime = Date.now();
        const durationMin = Math.round((endTime - this.state.active.startTime) / 60000); // Minutes
        const dateStr = new Date().toLocaleDateString('he-IL');
        
        // Save logic later, but here prepare text
        const meta = document.getElementById('summary-meta');
        meta.innerText = `📅 ${dateStr} | ⏱ ${durationMin} דקות`;

        const textBox = document.getElementById('summary-text');
        let txt = `סיכום אימון ${this.state.currentProgId}\n`;
        txt += `תאריך: ${dateStr} | זמן: ${durationMin} דק'\n\n`;

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
        
        textBox.innerText = txt;
        this.nav('screen-summary');
    },

    copySummaryToClipboard: function() {
        const txt = document.getElementById('summary-text').innerText;
        this.copyText(txt);
    },

    saveAndHome: function() {
        if (this.state.active.log.length > 0) {
            this.state.history.push({
                date: new Date().toLocaleDateString('he-IL'),
                timestamp: Date.now(),
                program: this.state.currentProgId,
                data: this.state.active.log,
                duration: Math.round((Date.now() - this.state.active.startTime) / 60000)
            });
            this.saveData();
        }
        this.nav('screen-home');
    },

    // --- HISTORY & COPY ---
    showHistory: function() {
        this.state.historySelection = [];
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        [...this.state.history].reverse().forEach((h, i) => {
            const realIdx = this.state.history.length - 1 - i;
            list.innerHTML += `
                <div class="hist-item-row">
                    <div class="chk-container">
                        <input type="checkbox" class="custom-chk" onchange="app.toggleHistorySelection(${realIdx}, this)">
                    </div>
                    <div style="flex:1" onclick="app.showHistoryDetail(${realIdx})">
                        <div style="display:flex; justify-content:space-between">
                            <span style="font-weight:700; color:var(--primary)">${h.date}</span>
                            <span class="badge" style="background:#333; color:white">${h.program || '?'}</span>
                        </div>
                        <div style="font-size:0.85rem; color:#aaa; margin-top:5px">
                            ${h.data.length} תרגילים • ${h.duration||'?'} דק'
                        </div>
                    </div>
                </div>
            `;
        });
        this.nav('screen-history');
    },

    toggleHistorySelection: function(idx, el) {
        if(el.checked) this.state.historySelection.push(idx);
        else this.state.historySelection = this.state.historySelection.filter(i => i !== idx);
    },

    copySelectedHistory: function() {
        if(this.state.historySelection.length === 0) { alert("לא נבחרו אימונים"); return; }
        
        let fullTxt = "📜 ריכוז אימונים\n\n";
        // Sort indices logic (handled by order in loop if needed, but we used reverse display)
        // Let's just grab by index
        this.state.historySelection.forEach(idx => {
            const h = this.state.history[idx];
            fullTxt += `--- אימון ${h.program} (${h.date}) ---\n`;
            h.data.forEach(ex => {
                fullTxt += `🔸 ${ex.name}: `;
                let setTxts = ex.sets.map(s => `${s.w>0?s.w:''}${s.w>0?'/':''}${s.r}`).join(', ');
                fullTxt += setTxts + "\n";
            });
            fullTxt += "\n";
        });
        this.copyText(fullTxt);
    },

    showHistoryDetail: function(idx) {
        const item = this.state.history[idx];
        this.state.viewHistoryIdx = idx;
        
        document.getElementById('hist-modal-title').innerText = `${item.date} - ${item.program}`;
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

    copySingleHistory: function() {
        const item = this.state.history[this.state.viewHistoryIdx];
        let txt = `אימון ${item.program} (${item.date})\n\n`;
        item.data.forEach(ex => {
            txt += `✅ ${ex.name}\n`;
            ex.sets.forEach((s, i) => txt += `   סט ${i+1}: ${s.w}x${s.r}\n`);
            txt += "\n";
        });
        this.copyText(txt);
    },

    closeHistoryModal: function() {
        document.getElementById('history-modal').style.display = 'none';
    },

    deleteCurrentLog: function() {
        if(confirm("למחוק?")) {
            this.state.history.splice(this.state.viewHistoryIdx, 1);
            this.saveData();
            this.closeHistoryModal();
            this.showHistory();
        }
    },

    // --- HELPERS ---
    copyText: function(txt) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).then(() => alert("הועתק ללוח! 📋"));
        } else {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = txt;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            alert("הועתק ללוח! 📋");
        }
    },

    exportData: function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.history));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = "gymstart_backup.json";
        a.click();
    },

    importData: function(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    if(confirm(`נמצאו ${data.length} אימונים. למזג?`)) {
                        app.state.history = [...app.state.history, ...data];
                        app.saveData();
                        app.showHistory();
                    }
                }
            } catch(err) { alert("שגיאה בקובץ"); }
        };
        reader.readAsText(file);
    },

    // --- ADMIN (Unchanged Logic, UI only) ---
    openAdmin: function() { document.getElementById('admin-modal').style.display = 'flex'; this.renderAdminList(); },
    closeAdmin: function() { document.getElementById('admin-modal').style.display = 'none'; },
    renderAdminList: function() {
        const progId = document.getElementById('admin-prog-select').value;
        this.state.admin.viewProg = progId;
        const list = document.getElementById('admin-list');
        const prog = this.state.routines[progId];
        list.innerHTML = '';
        prog.forEach((ex, i) => {
            list.innerHTML += `<div class="admin-item"><div><b>${i+1}. ${ex.name}</b><br><small>${ex.target?.w||0} ${ex.unit}</small></div>
            <div><button onclick="app.remEx('${progId}',${i})">🗑</button></div></div>`;
        });
    },
    remEx: function(pid, i) { if(confirm('למחוק?')) { this.state.routines[pid].splice(i,1); this.renderAdminList(); } },
    saveAdmin: function() { this.saveData(); alert('נשמר'); this.closeAdmin(); },
    openBank: function() { 
        document.getElementById('bank-modal').style.display = 'flex';
        const cats = [...new Set(BANK.map(b => b.cat))];
        const c = document.getElementById('bank-cats');
        c.innerHTML = `<button class="cat-tag active" onclick="app.filterBank('')">הכל</button>`;
        cats.forEach(x => c.innerHTML += `<button class="cat-tag" onclick="app.filterBank('${x}')">${x}</button>`);
        this.filterBank('');
    },
    closeBank: function() { document.getElementById('bank-modal').style.display = 'none'; },
    filterBank: function(cat) {
        if(cat!==undefined) this.state.admin.bankFilter = cat;
        const txt = document.getElementById('bank-search').value.toLowerCase();
        const list = document.getElementById('bank-list');
        list.innerHTML = '';
        BANK.filter(e => (this.state.admin.bankFilter?e.cat===this.state.admin.bankFilter:true) && e.name.toLowerCase().includes(txt))
        .forEach(e => {
            list.innerHTML += `<div class="admin-item" onclick="app.addFromBank('${e.id}')"><span>${e.name}</span><span>+</span></div>`;
        });
    },
    addFromBank: function(id) {
        const n = JSON.parse(JSON.stringify(BANK.find(e=>e.id===id)));
        n.target={w:10,r:12};
        this.state.routines[this.state.admin.viewProg].push(n);
        this.closeBank();
        this.renderAdminList();
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
