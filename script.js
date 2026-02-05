/**
 * GYMSTART V1.7.3
 * - Dynamic Exercise Bank Manager (Add/Edit/Delete exercises)
 * - Enhanced Weight Selector logic (based on Step, Min, Max)
 * - UI Polish: No "Edit" button, Improved Summary text, Video Links.
 */

const CONFIG = {
    KEYS: {
        ROUTINES: 'gymstart_v1_7_routines',
        HISTORY: 'gymstart_beta_02_history',
        EXERCISES: 'gymstart_v1_7_exercises_bank'
    },
    VERSION: '1.7.3'
};

const FEEL_MAP_TEXT = { 'easy': 'קל', 'good': 'בינוני', 'hard': 'קשה' };

// BASE EXERCISES FOR MIGRATION ONLY (Not used directly anymore)
const BASE_BANK_INIT = [
    { id: 'goblet', name: 'גובלט סקוואט', cat: 'legs', settings: {unit:'kg', step:2.5, min:2.5, max:60} },
    { id: 'leg_press', name: 'לחיצת רגליים', cat: 'legs', settings: {unit:'kg', step:5, min:20, max:200} },
    { id: 'rdl', name: 'דדליפט רומני', cat: 'legs', settings: {unit:'kg', step:2.5, min:10, max:100} },
    { id: 'lunge', name: 'מכרעים (Lunges)', cat: 'legs', settings: {unit:'kg', step:1, min:1, max:30} },
    { id: 'hip_thrust', name: 'גשר עכוז', cat: 'legs', settings: {unit:'kg', step:2.5, min:10, max:120} },
    { id: 'leg_ext', name: 'פשיטת ברכיים', cat: 'legs', settings: {unit:'plates', step:1, min:1, max:20} },
    { id: 'leg_curl', name: 'כפיפת ברכיים', cat: 'legs', settings: {unit:'plates', step:1, min:1, max:20} },
    { id: 'calf_raise', name: 'הרמת עקבים', cat: 'legs', settings: {unit:'kg', step:2.5, min:10, max:80} },
    { id: 'chest_press', name: 'לחיצת חזה משקולות', cat: 'chest', settings: {unit:'kg', step:1, min:2, max:40} },
    { id: 'fly', name: 'פרפר (Fly)', cat: 'chest', settings: {unit:'kg', step:1, min:2, max:20} },
    { id: 'pushup', name: 'שכיבות סמיכה', cat: 'chest', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'incline_bench', name: 'לחיצת חזה שיפוע עליון', cat: 'chest', settings: {unit:'kg', step:1, min:2, max:40} },
    { id: 'lat_pull', name: 'פולי עליון', cat: 'back', settings: {unit:'plates', step:1, min:1, max:20} },
    { id: 'cable_row', name: 'חתירה בכבל', cat: 'back', settings: {unit:'plates', step:1, min:1, max:20} },
    { id: 'db_row', name: 'חתירה במשקולת', cat: 'back', settings: {unit:'kg', step:1, min:4, max:40} },
    { id: 'hyperext', name: 'פשיטת גו (Hyper)', cat: 'back', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'shoulder_press', name: 'לחיצת כתפיים', cat: 'shoulders', settings: {unit:'kg', step:1, min:2, max:30} },
    { id: 'lat_raise', name: 'הרחקה לצדדים', cat: 'shoulders', settings: {unit:'kg', step:1, min:1, max:15} },
    { id: 'face_pull', name: 'פייס-פולס', cat: 'shoulders', settings: {unit:'plates', step:1, min:1, max:20} },
    { id: 'bicep_curl', name: 'כפיפת מרפקים', cat: 'arms', settings: {unit:'kg', step:1, min:2, max:25} },
    { id: 'tricep_pull', name: 'פשיטת מרפקים', cat: 'arms', settings: {unit:'plates', step:1, min:1, max:20} },
    { id: 'tricep_rope', name: 'פשיטת מרפקים חבל', cat: 'arms', settings: {unit:'plates', step:1, min:1, max:20} },
    { id: 'hammer_curl', name: 'כפיפת פטישים', cat: 'arms', settings: {unit:'kg', step:1, min:2, max:25} },
    { id: 'plank', name: 'פלאנק (סטטי)', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'side_plank', name: 'פלאנק צידי', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'bicycle', name: 'בטן אופניים', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'knee_raise', name: 'הרמת ברכיים', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'crunches', name: 'כפיפות בטן', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} }
];

const DEFAULT_ROUTINES_V17 = {
    'A': { title: 'רגליים וגב (A)', exercises: [ {id:'goblet', sets:3, rest:90}, {id:'leg_press', sets:3}, {id:'lat_pull', sets:3} ] },
    'B': { title: 'חזה וכתפיים (B)', exercises: [ {id:'chest_press', sets:3}, {id:'shoulder_press', sets:3}, {id:'plank', sets:3} ] }
};

const app = {
    state: {
        routines: {},
        history: [],
        exercises: [], // Dynamic Bank
        currentProgId: null,
        active: {
            on: false,
            exIdx: 0, setIdx: 1, totalSets: 3,
            log: [], startTime: 0,
            timerInterval: null, restInterval: null, 
            feel: 'good', isStopwatch: false, stopwatchVal: 0,
            inputW: 10, inputR: 12
        },
        admin: { 
            viewProgId: null, 
            editTipEx: null, 
            selectorFilter: 'all',
            tempExercises: [],
            editingExId: null // For Bank Manager
        },
        historySelection: [],
        viewHistoryIdx: null
    },

    init: function() {
        try {
            this.loadData();
            this.renderHome();
            this.renderProgramSelect(); 
            this.nav('screen-home'); 
        } catch (e) {
            console.error(e);
            alert("שגיאה בטעינת נתונים.");
        }
    },

    loadData: function() {
        // Load History
        const h = localStorage.getItem(CONFIG.KEYS.HISTORY);
        this.state.history = h ? JSON.parse(h) : [];
        
        // Load Routines
        const r = localStorage.getItem(CONFIG.KEYS.ROUTINES);
        let loadedRoutines = r ? JSON.parse(r) : null;
        if (!loadedRoutines) {
            this.state.routines = JSON.parse(JSON.stringify(DEFAULT_ROUTINES_V17));
            // Fill details from Init Bank for first load
            for(const pid in this.state.routines) {
                this.state.routines[pid].exercises.forEach(ex => {
                    const bankEx = BASE_BANK_INIT.find(b => b.id === ex.id);
                    if(bankEx) {
                        ex.name = bankEx.name;
                        ex.unit = bankEx.settings.unit;
                        ex.cat = bankEx.cat;
                    }
                });
            }
        } else {
            this.state.routines = loadedRoutines;
        }

        // Load Exercises (Migration Logic)
        const e = localStorage.getItem(CONFIG.KEYS.EXERCISES);
        if(e) {
            this.state.exercises = JSON.parse(e);
        } else {
            // First time migration: Use Base Bank
            this.state.exercises = JSON.parse(JSON.stringify(BASE_BANK_INIT));
            this.saveData();
        }
    },

    saveData: function() {
        localStorage.setItem(CONFIG.KEYS.ROUTINES, JSON.stringify(this.state.routines));
        localStorage.setItem(CONFIG.KEYS.HISTORY, JSON.stringify(this.state.history));
        localStorage.setItem(CONFIG.KEYS.EXERCISES, JSON.stringify(this.state.exercises));
    },

    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        const backBtn = document.getElementById('nav-back');
        const adminBtn = document.getElementById('btn-admin-home');

        if (screenId === 'screen-home') {
            backBtn.style.visibility = 'hidden';
            if(adminBtn) adminBtn.style.display = 'flex';
            this.stopAllTimers();
            this.state.active.on = false;
        } else {
            backBtn.style.visibility = 'visible';
            if(adminBtn) adminBtn.style.display = 'none';
        }
    },

    goBack: function() {
        const activeScreen = document.querySelector('.screen.active').id;
        if (activeScreen === 'screen-active') {
            if (confirm("לצאת מהאימון?")) {
                this.stopAllTimers();
                this.state.active.on = false;
                this.nav('screen-overview');
            }
        } else if (activeScreen === 'screen-overview') {
             this.nav('screen-program-select');
        } else {
            this.nav('screen-home');
        }
    },

    getExerciseDef: function(exId) {
        return this.state.exercises.find(e => e.id === exId) || 
               { name: 'תרגיל לא ידוע', settings: {unit:'kg', step:2.5, min:0, max:50} };
    },

    /* --- RENDERING --- */

    renderProgramSelect: function() {
        const container = document.getElementById('prog-list-container');
        container.innerHTML = '';
        const ids = Object.keys(this.state.routines);
        
        if(ids.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#666;">אין תוכניות זמינות.</div>';
            return;
        }

        ids.forEach(pid => {
            const prog = this.state.routines[pid];
            const badge = pid.charAt(0).toUpperCase();
            const count = prog.exercises.length;
            
            let desc = `${count} תרגילים`;
            if (count > 0) {
                const firstEx = prog.exercises[0].name;
                desc += ` • מתחיל ב: ${firstEx}`;
            }

            container.innerHTML += `
                <div class="oled-card prog-card" onclick="app.selectProgram('${pid}')">
                    <div class="prog-icon">${badge}</div>
                    <div class="prog-content">
                        <div class="prog-title">${prog.title}</div>
                        <div class="prog-desc">${desc}</div>
                    </div>
                </div>
            `;
        });
    },

    selectProgram: function(progId) {
        this.state.currentProgId = progId;
        this.renderOverview();
        this.nav('screen-overview');
    },

    renderOverview: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const list = document.getElementById('overview-list');
        document.getElementById('overview-title').innerText = `סקירה: ${prog.title}`;
        list.innerHTML = '';
        prog.exercises.forEach((ex, i) => {
            list.innerHTML += `<div class="list-item">
                <span>${i+1}. ${ex.name}</span>
                <span style="color:var(--primary); font-size:0.9rem">${ex.sets} סטים</span>
            </div>`;
        });
    },

    renderHome: function() {
        const lastEl = document.getElementById('last-workout-display');
        if (this.state.history.length > 0) {
            const last = this.state.history[this.state.history.length - 1];
            const displayName = last.programTitle || last.program; 
            lastEl.innerText = `${last.date} (${displayName})`;
        } else {
            lastEl.innerText = "טרם בוצע";
        }
    },

    /* --- WORKOUT LOGIC --- */
    startWorkout: function() {
        if (!this.state.routines[this.state.currentProgId] || 
            this.state.routines[this.state.currentProgId].exercises.length === 0) {
            alert("התוכנית ריקה"); return;
        }

        this.state.active = {
            on: true,
            exIdx: 0, setIdx: 1, totalSets: 3,
            log: [], startTime: Date.now(),
            timerInterval: null, restInterval: null, 
            feel: 'good', isStopwatch: false, stopwatchVal: 0,
            inputW: 10, inputR: 12
        };
        this.loadActiveExercise();
        this.nav('screen-active');
    },

    loadActiveExercise: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const exInst = prog.exercises[this.state.active.exIdx];
        const exDef = this.getExerciseDef(exInst.id);
        
        this.state.active.totalSets = exInst.sets || 3;

        document.getElementById('ex-name').innerText = exInst.name;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
        
        // Video Link
        const vidBtn = document.getElementById('ex-video-link');
        if (exDef.videoUrl && exDef.videoUrl.length > 5) {
            vidBtn.style.display = 'flex';
            vidBtn.href = exDef.videoUrl;
        } else {
            vidBtn.style.display = 'none';
        }

        const noteEl = document.getElementById('coach-note');
        if (exInst.note) {
            noteEl.innerText = "💡 " + exInst.note;
            noteEl.style.display = 'block';
        } else noteEl.style.display = 'none';

        this.renderStatsStrip(exInst.id, exDef.settings.unit);

        // Check type
        const isTime = (exDef.settings.unit === 'bodyweight' && (exInst.id.includes('plank') || exInst.id.includes('static')));
        this.state.active.isStopwatch = isTime;

        if (isTime) {
            document.getElementById('cards-container').style.display = 'none';
            document.getElementById('stopwatch-container').style.display = 'flex';
            this.state.active.stopwatchVal = 0;
            this.stopStopwatch();
            document.getElementById('sw-display').innerText = "00:00";
            document.getElementById('btn-sw-toggle').classList.remove('running');
            document.getElementById('btn-sw-toggle').innerText = "▶";
            document.getElementById('rest-timer-area').style.display = 'none';
        } else {
            document.getElementById('cards-container').style.display = 'flex';
            document.getElementById('stopwatch-container').style.display = 'none';
            document.getElementById('unit-label-card').innerText = exDef.settings.unit === 'plates' ? 'פלטות' : 'ק״ג';
            
            // SMART WEIGHT PREDICTION
            let smartWeight = exInst.target?.w || 10;
            // Overwrite with history if exists
            for(let i=this.state.history.length-1; i>=0; i--) {
                const sess = this.state.history[i];
                const found = sess.data.find(e => e.id === exInst.id);
                if(found && found.sets.length > 0) {
                    smartWeight = found.sets[found.sets.length-1].w;
                    break;
                }
            }
            this.state.active.inputW = smartWeight;
            this.state.active.inputR = exInst.target?.r || 12;
            this.populateSelects(exDef);
        }

        this.state.active.feel = 'good';
        this.updateFeelUI();
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('next-ex-preview').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        document.getElementById('rest-timer-area').style.display = 'none';
    },

    renderStatsStrip: function(exId, unit) {
        const strip = document.getElementById('last-stat-strip');
        
        let lastLog = null;
        for(let i=this.state.history.length-1; i>=0; i--) {
            const sess = this.state.history[i];
            const found = sess.data.find(e => e.id === exId);
            if(found && found.sets.length > 0) { 
                lastLog = found.sets[found.sets.length-1]; 
                break; 
            }
        }

        if (!lastLog) {
            strip.innerText = "אין הישג קודם";
            return;
        }

        const isTime = this.state.active.isStopwatch;
        const isBody = (unit === 'bodyweight' && !isTime);
        
        let wStr = isBody ? 'משקל גוף' : `${lastLog.w} ק״ג`;
        if (unit === 'plates') wStr = `${lastLog.w} פלטות`;
        
        let rStr = isTime ? `${lastLog.r} שניות` : `${lastLog.r} חזרות`;
        
        if (isTime && unit === 'bodyweight') {
            strip.innerText = `${rStr} (אימון קודם)`;
        } else {
            strip.innerText = `${wStr} | ${rStr}`;
        }
    },

    populateSelects: function(exDef) {
        const selW = document.getElementById('select-weight');
        const selR = document.getElementById('select-reps');
        const s = exDef.settings || {unit:'kg', step:2.5, min:0, max:50};

        let wOpts = [];
        if (s.unit === 'bodyweight') {
            wOpts = [0];
        } else {
            const min = parseFloat(s.min);
            const max = parseFloat(s.max);
            const step = parseFloat(s.step) || 2.5;
            
            // Build options based on dynamic settings
            for(let v = min; v <= max; v += step) {
                // Fix floating point issues (e.g. 12.500000001)
                let cleanV = parseFloat(v.toFixed(1));
                if(cleanV % 1 === 0) cleanV = parseInt(cleanV); // 10 instead of 10.0
                wOpts.push(cleanV);
            }
        }

        selW.innerHTML = '';
        wOpts.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.text = val;
            selW.appendChild(opt);
        });

        // SAFETY: Select nearest value if history weight is invalid
        if(wOpts.includes(this.state.active.inputW)) {
            selW.value = this.state.active.inputW;
        } else {
            // Find closest
            const closest = wOpts.reduce((prev, curr) => {
                return (Math.abs(curr - this.state.active.inputW) < Math.abs(prev - this.state.active.inputW) ? curr : prev);
            });
            selW.value = closest;
            this.state.active.inputW = closest;
        }
        
        selW.onchange = (e) => this.state.active.inputW = Number(e.target.value);

        // Reps
        let rOpts = [];
        const maxReps = exDef.cat === 'core' ? 50 : 30;
        for(let i=1; i<=maxReps; i++) rOpts.push(i);

        selR.innerHTML = '';
        rOpts.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.text = val;
            selR.appendChild(opt);
        });
        selR.value = this.state.active.inputR;
        selR.onchange = (e) => this.state.active.inputR = Number(e.target.value);
    },

    toggleStopwatch: function() {
        const btn = document.getElementById('btn-sw-toggle');
        if (this.state.active.timerInterval) {
            clearInterval(this.state.active.timerInterval);
            this.state.active.timerInterval = null;
            btn.classList.remove('running');
            btn.innerText = "▶";
        } else {
            this.stopRestTimer();
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

    stopStopwatch: function() {
        if(this.state.active.timerInterval) clearInterval(this.state.active.timerInterval);
        this.state.active.timerInterval = null;
    },

    selectFeel: function(f) {
        this.state.active.feel = f;
        this.updateFeelUI();
    },

    updateFeelUI: function() {
        const map = { 'easy': 'קל', 'good': 'בינוני (טוב)', 'hard': 'קשה' };
        document.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`.feel-btn.${this.state.active.feel}`).classList.add('selected');
        document.getElementById('feel-text').innerText = map[this.state.active.feel];
    },

    finishSet: function() {
        let w, r;
        if (this.state.active.isStopwatch) {
            if(this.state.active.timerInterval) this.toggleStopwatch(); 
            w = 0; 
            r = this.state.active.stopwatchVal; 
            if (r === 0) { alert("לא נמדד זמן"); return; }
        } else {
            w = this.state.active.inputW;
            r = this.state.active.inputR;
        }

        const prog = this.state.routines[this.state.currentProgId];
        const exInst = prog.exercises[this.state.active.exIdx];
        
        let exLog = this.state.active.log.find(l => l.id === exInst.id);
        if(!exLog) {
            exLog = { id: exInst.id, name: exInst.name, sets: [] };
            this.state.active.log.push(exLog);
        }
        exLog.sets.push({ w, r, feel: this.state.active.feel });

        const restTime = exInst.rest || 60;
        this.startRestTimer(restTime);

        if (this.state.active.setIdx < this.state.active.totalSets) {
            this.state.active.setIdx++;
            document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
            this.state.active.feel = 'good';
            this.updateFeelUI();
            if(this.state.active.isStopwatch) {
                this.state.active.stopwatchVal = 0;
                document.getElementById('sw-display').innerText = "00:00";
            }
        } else {
            document.getElementById('btn-finish').style.display = 'none';
            document.getElementById('decision-buttons').style.display = 'flex';
            document.getElementById('rest-timer-area').style.display = 'none';

            const nextEx = prog.exercises[this.state.active.exIdx + 1];
            const nextEl = document.getElementById('next-ex-preview');
            nextEl.innerText = nextEx ? `הבא בתור: ${nextEx.name}` : "הבא בתור: סיום אימון";
            nextEl.style.display = 'block';
        }
    },

    startRestTimer: function(durationSec) {
        this.stopRestTimer();
        const area = document.getElementById('rest-timer-area');
        const disp = document.getElementById('rest-timer-val');
        const ring = document.getElementById('rest-ring-prog');
        
        area.style.display = 'flex';
        area.scrollIntoView({ behavior: 'smooth', block: 'center' });

        let sec = 0;
        disp.innerText = "00:00";
        const MAX_OFFSET = 408; 
        ring.style.strokeDashoffset = MAX_OFFSET; 
        
        this.state.active.restInterval = setInterval(() => {
            sec++;
            let m = Math.floor(sec / 60);
            let s = sec % 60;
            disp.innerText = `${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
            
            if (sec <= durationSec) {
                const ratio = sec / durationSec;
                const offset = MAX_OFFSET - (MAX_OFFSET * ratio);
                ring.style.strokeDashoffset = offset;
            } else {
                ring.style.strokeDashoffset = 0; 
            }

            if (sec === durationSec && navigator.vibrate) navigator.vibrate([200,100,200]);
        }, 1000);
    },

    stopRestTimer: function() {
        if(this.state.active.restInterval) clearInterval(this.state.active.restInterval);
        this.state.active.restInterval = null;
        document.getElementById('rest-timer-area').style.display = 'none';
    },

    stopAllTimers: function() {
        this.stopStopwatch();
        this.stopRestTimer();
    },

    addSet: function() {
        this.state.active.totalSets++;
        this.state.active.setIdx++;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
        
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('next-ex-preview').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        document.getElementById('rest-timer-area').style.display = 'flex';
        document.getElementById('rest-timer-area').scrollIntoView({ behavior: 'smooth', block: 'center' });

        if(this.state.active.isStopwatch) {
            this.state.active.stopwatchVal = 0;
            document.getElementById('sw-display').innerText = "00:00";
        }
    },

    deleteLastSet: function() {
        const prog = this.state.routines[this.state.currentProgId];
        const ex = prog.exercises[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === ex.id);
        
        if(exLog && exLog.sets.length > 0) {
            exLog.sets.pop();
            this.stopRestTimer();

            if (this.state.active.setIdx > 1) {
                this.state.active.setIdx--;
                document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
                document.getElementById('decision-buttons').style.display = 'none';
                document.getElementById('next-ex-preview').style.display = 'none';
                document.getElementById('btn-finish').style.display = 'flex';
            }
        }
    },

    skipExercise: function() {
        this.nextExercise();
    },

    nextExercise: function() {
        this.stopAllTimers();
        const prog = this.state.routines[this.state.currentProgId];
        if (this.state.active.exIdx < prog.exercises.length - 1) {
            this.state.active.exIdx++;
            this.state.active.setIdx = 1;
            this.loadActiveExercise();
        } else {
            this.finishWorkout();
        }
    },

    finishWorkout: function() {
        const endTime = Date.now();
        const durationMin = Math.round((endTime - this.state.active.startTime) / 60000);
        const dateStr = new Date().toLocaleDateString('he-IL');
        const progTitle = this.state.routines[this.state.currentProgId].title;

        const tempItem = {
            program: this.state.currentProgId,
            programTitle: progTitle, 
            date: dateStr,
            duration: durationMin,
            data: this.state.active.log
        };

        const meta = document.getElementById('summary-meta');
        meta.innerText = `${dateStr} | ${durationMin} דקות`;
        const textBox = document.getElementById('summary-text');
        textBox.innerText = this.generateLogText(tempItem);
        this.nav('screen-summary');
    },

    generateLogText: function(historyItem) {
        const pName = historyItem.programTitle || historyItem.program;
        let txt = `סיכום אימון: ${pName}\n`;
        txt += `תאריך: ${historyItem.date} | משך: ${historyItem.duration} דק'\n\n`;

        historyItem.data.forEach(ex => {
            if(ex.sets.length > 0) {
                txt += `✅ ${ex.name}\n`;
                const exDef = this.getExerciseDef(ex.id);
                const isTime = (ex.id.includes('plank') || exDef.settings.unit === 'bodyweight' && ex.sets[0].w === 0);
                
                ex.sets.forEach((s, i) => {
                    let valStr;
                    if(isTime && s.w === 0) {
                         valStr = `${s.r} שנ׳`;
                    } else {
                         valStr = `${s.w} ק״ג | ${s.r} חזרות`;
                         if(exDef.settings.unit === 'plates') valStr = `${s.w} פלטות | ${s.r} חזרות`;
                         if(s.w === 0) valStr = `משקל גוף | ${s.r} חזרות`;
                    }
                    
                    let feelStr = FEEL_MAP_TEXT[s.feel] || 'טוב';
                    txt += `   סט ${i+1}: ${valStr} (${feelStr})\n`;
                });
                txt += "\n";
            }
        });
        return txt;
    },

    copySummaryToClipboard: function() {
        const txt = document.getElementById('summary-text').innerText;
        this.copyText(txt);
    },

    saveAndHome: function() {
        if (this.state.active.log.length > 0) {
            const progTitle = this.state.routines[this.state.currentProgId].title;
            this.state.history.push({
                date: new Date().toLocaleDateString('he-IL'),
                timestamp: Date.now(),
                program: this.state.currentProgId,
                programTitle: progTitle, 
                data: this.state.active.log,
                duration: Math.round((Date.now() - this.state.active.startTime) / 60000)
            });
            this.saveData();
        }
        window.location.reload();
    },

    /* --- ADMIN: VIEWS & NAVIGATION --- */

    openAdminHome: function() { 
        if (this.state.active.on) { alert("לא ניתן להיכנס לניהול בזמן אימון פעיל."); return; }
        
        document.getElementById('admin-modal').style.display = 'flex';
        // Reset Views
        document.getElementById('admin-view-home').style.display = 'flex';
        document.getElementById('admin-view-edit').style.display = 'none';
        document.getElementById('admin-view-selector').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'none';
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        
        this.renderAdminList();
    },

    closeAdmin: function() { 
        this.saveData();
        this.renderProgramSelect(); 
        document.getElementById('admin-modal').style.display = 'none'; 
    },

    renderAdminList: function() {
        const list = document.getElementById('admin-prog-list');
        list.innerHTML = '';
        const ids = Object.keys(this.state.routines);

        if(ids.length === 0) list.innerHTML = '<div style="text-align:center; color:#666; padding:20px;">אין תוכניות</div>';

        ids.forEach(pid => {
            const prog = this.state.routines[pid];
            // No "Edit" button, click card to edit.
            list.innerHTML += `
            <div class="manager-item" onclick="app.openAdminEdit('${pid}')">
                <div class="manager-info">
                    <h3>${prog.title}</h3>
                    <p>${prog.exercises.length} תרגילים</p>
                </div>
                <div class="manager-actions">
                    <button class="btn-text-action" onclick="event.stopPropagation(); app.duplicateProgram('${pid}')">שכפל</button>
                    <button class="btn-text-action delete" onclick="event.stopPropagation(); app.deleteProgram('${pid}')">מחק</button>
                </div>
            </div>`;
        });
    },

    createNewProgram: function() {
        const id = 'prog_' + Date.now();
        this.state.routines[id] = { title: 'תוכנית חדשה', exercises: [] };
        this.openAdminEdit(id);
    },

    duplicateProgram: function(pid) {
        const newId = 'prog_' + Date.now();
        const original = this.state.routines[pid];
        const copy = JSON.parse(JSON.stringify(original));
        copy.title += " (עותק)";
        this.state.routines[newId] = copy;
        this.renderAdminList();
    },

    deleteProgram: function(pid) {
        if(confirm("למחוק את התוכנית?")) {
            delete this.state.routines[pid];
            this.renderAdminList();
        }
    },

    openAdminEdit: function(pid) {
        this.state.admin.viewProgId = pid;
        this.state.admin.tempExercises = JSON.parse(JSON.stringify(this.state.routines[pid].exercises));
        
        document.getElementById('admin-view-home').style.display = 'none';
        document.getElementById('admin-view-edit').style.display = 'flex';
        document.getElementById('edit-prog-title').value = this.state.routines[pid].title;
        
        this.renderEditorList();
    },

    saveAndCloseEditor: function() {
        const pid = this.state.admin.viewProgId;
        this.state.routines[pid].exercises = this.state.admin.tempExercises;
        this.state.routines[pid].title = document.getElementById('edit-prog-title').value;
        this.saveData();
        this.openAdminHome();
    },

    updateProgramTitle: function() { },

    renderEditorList: function() {
        const list = document.getElementById('admin-ex-list');
        list.innerHTML = '';
        const exList = this.state.admin.tempExercises;

        exList.forEach((ex, i) => {
            const hasTip = ex.note ? 'has-tip' : '';
            list.innerHTML += `
            <div class="editor-row">
                <div class="row-top">
                    <div class="row-title">${i+1}. ${ex.name}</div>
                    <div class="row-ctrls">
                        <button class="ctrl-btn" onclick="app.moveEx(${i}, -1)">▲</button>
                        <button class="ctrl-btn" onclick="app.moveEx(${i}, 1)">▼</button>
                        <button class="ctrl-btn del" onclick="app.removeEx(${i})">×</button>
                    </div>
                </div>
                <div class="row-btm">
                    <button class="tip-btn ${hasTip}" onclick="app.openTipModal(${i})">💡 טיפ</button>
                    
                    <div class="stepper">
                        <div class="step-label" style="padding-right:5px;">סטים</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'sets', -1)">-</button>
                        <div class="step-val">${ex.sets}</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'sets', 1)">+</button>
                    </div>
                    <div class="stepper">
                        <div class="step-label" style="padding-right:5px;">מנוחה</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'rest', -15)">-</button>
                        <div class="step-val">${ex.rest||60}</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'rest', 15)">+</button>
                    </div>
                </div>
            </div>`;
        });
    },

    updateTempEx: function(i, field, delta) {
        let val = (this.state.admin.tempExercises[i][field] || 0) + delta;
        if(field === 'sets' && val < 1) val = 1;
        if(field === 'rest' && val < 0) val = 0;
        this.state.admin.tempExercises[i][field] = val;
        this.renderEditorList();
    },

    moveEx: function(i, dir) {
        const arr = this.state.admin.tempExercises;
        if ((i === 0 && dir === -1) || (i === arr.length - 1 && dir === 1)) return;
        const temp = arr[i];
        arr[i] = arr[i + dir];
        arr[i + dir] = temp;
        this.renderEditorList();
    },

    removeEx: function(i) {
        this.state.admin.tempExercises.splice(i, 1);
        this.renderEditorList();
    },

    /* --- ADMIN: EXERCISE MANAGER (NEW) --- */
    
    openExerciseManager: function() {
        document.getElementById('admin-view-home').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
        document.getElementById('ex-mgr-search').value = '';
        this.renderExerciseManagerList();
    },

    renderExerciseManagerList: function() {
        const list = document.getElementById('ex-mgr-list');
        list.innerHTML = '';
        const term = document.getElementById('ex-mgr-search').value.toLowerCase();
        
        this.state.exercises.filter(e => e.name.toLowerCase().includes(term)).forEach(e => {
             list.innerHTML += `
             <div class="list-item" onclick="app.editExerciseInBank('${e.id}')">
                <div style="font-weight:700">${e.name}</div>
                <div style="font-size:0.8rem; color:#888;">${this.getCatLabel(e.cat)}</div>
             </div>`;
        });
    },

    createNewExerciseInBank: function() {
        const newId = 'custom_' + Date.now();
        this.state.admin.editingExId = newId;
        // Default Template
        this.fillExerciseEditor({
            id: newId,
            name: 'תרגיל חדש',
            cat: 'other',
            videoUrl: '',
            settings: { unit: 'kg', step: 2.5, min: 0, max: 100, isUnilateral: false }
        });
    },

    editExerciseInBank: function(exId) {
        this.state.admin.editingExId = exId;
        const ex = this.state.exercises.find(e => e.id === exId);
        this.fillExerciseEditor(ex);
    },

    fillExerciseEditor: function(ex) {
        document.getElementById('admin-view-ex-manager').style.display = 'none';
        document.getElementById('admin-view-ex-edit').style.display = 'flex';

        document.getElementById('edit-ex-name').value = ex.name;
        document.getElementById('edit-ex-cat').value = ex.cat;
        document.getElementById('edit-ex-video').value = ex.videoUrl || '';
        document.getElementById('edit-ex-unit').value = ex.settings.unit;
        document.getElementById('edit-ex-step').value = ex.settings.step;
        document.getElementById('edit-ex-min').value = ex.settings.min;
        document.getElementById('edit-ex-max').value = ex.settings.max;
        document.getElementById('edit-ex-unilateral').checked = ex.settings.isUnilateral || false;
    },

    saveExerciseToBank: function() {
        const exId = this.state.admin.editingExId;
        const newEx = {
            id: exId,
            name: document.getElementById('edit-ex-name').value,
            cat: document.getElementById('edit-ex-cat').value,
            videoUrl: document.getElementById('edit-ex-video').value,
            settings: {
                unit: document.getElementById('edit-ex-unit').value,
                step: Number(document.getElementById('edit-ex-step').value),
                min: Number(document.getElementById('edit-ex-min').value),
                max: Number(document.getElementById('edit-ex-max').value),
                isUnilateral: document.getElementById('edit-ex-unilateral').checked
            }
        };

        const existingIdx = this.state.exercises.findIndex(e => e.id === exId);
        if (existingIdx > -1) {
            this.state.exercises[existingIdx] = newEx;
        } else {
            this.state.exercises.push(newEx);
        }
        
        this.saveData();
        // Go back to list
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
        this.renderExerciseManagerList();
    },

    cancelExerciseEdit: function() {
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
    },

    /* --- SELECTOR (Uses Dynamic Bank) --- */
    openAdminSelector: function() {
        document.getElementById('admin-view-edit').style.display = 'none';
        document.getElementById('admin-view-selector').style.display = 'flex';
        document.getElementById('selector-search').value = '';
        this.state.admin.selectorFilter = 'all';
        this.updateFilterChips();
        this.renderSelectorList();
    },

    closeSelector: function() {
        document.getElementById('admin-view-selector').style.display = 'none';
        document.getElementById('admin-view-edit').style.display = 'flex';
    },

    setSelectorFilter: function(cat, btn) {
        this.state.admin.selectorFilter = cat;
        this.updateFilterChips();
        this.renderSelectorList();
    },

    updateFilterChips: function() {
        const map = { 'all':0, 'legs':1, 'chest':2, 'back':3, 'shoulders':4, 'arms':5, 'core':6 };
        const idx = map[this.state.admin.selectorFilter];
        const chips = document.querySelectorAll('.chip');
        chips.forEach((c, i) => i === idx ? c.classList.add('active') : c.classList.remove('active'));
    },

    filterSelector: function() { this.renderSelectorList(); },

    renderSelectorList: function() {
        const list = document.getElementById('selector-list');
        list.innerHTML = '';
        const search = document.getElementById('selector-search').value.toLowerCase();
        const cat = this.state.admin.selectorFilter;

        // Use Dynamic Bank
        this.state.exercises.filter(e => {
            const matchName = e.name.toLowerCase().includes(search);
            const matchCat = cat === 'all' || e.cat === cat;
            return matchName && matchCat;
        }).forEach(e => {
            list.innerHTML += `
            <div class="list-item" onclick="app.addExerciseFromSelector('${e.id}')">
                <span style="font-weight:700">${e.name}</span>
                <span style="color:var(--primary)">+</span>
            </div>`;
        });
    },

    addExerciseFromSelector: function(exId) {
        const bankEx = this.getExerciseDef(exId);
        const newEx = {
            id: bankEx.id,
            name: bankEx.name,
            sets: 3,
            rest: 60,
            note: '',
            target: {w:10, r:12}
        };

        this.state.admin.tempExercises.push(newEx);
        this.closeSelector();
        this.renderEditorList();
    },

    getCatLabel: function(c) {
        const map = {legs:'רגליים', chest:'חזה', back:'גב', shoulders:'כתפיים', arms:'ידיים', core:'בטן', other:'אחר'};
        return map[c] || c;
    },

    /* --- TIPS --- */
    openTipModal: function(idx) {
        this.state.admin.editTipEx = idx;
        const ex = this.state.admin.tempExercises[idx];
        document.getElementById('tip-input').value = ex.note || '';
        document.getElementById('tip-modal').style.display = 'flex';
    },

    closeTipModal: function() { document.getElementById('tip-modal').style.display = 'none'; },
    
    saveTip: function() {
        const idx = this.state.admin.editTipEx;
        if(idx !== null) {
            this.state.admin.tempExercises[idx].note = document.getElementById('tip-input').value;
            this.renderEditorList();
        }
        this.closeTipModal();
    },

    /* --- BACKUP & RESTORE --- */
    exportConfig: function() {
        // Now includes Custom Exercises!
        const data = { 
            type: 'config', 
            ver: CONFIG.VERSION, 
            date: new Date().toLocaleDateString(), 
            routines: this.state.routines,
            exercises: this.state.exercises 
        };
        this.downloadJSON(data, `gymstart_config_v${CONFIG.VERSION}_${Date.now()}.json`);
    },

    importConfig: function(input) {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                if (json.type !== 'config') { alert("קובץ שגוי."); return; }
                if(confirm("עדכון תוכניות יחליף את ההגדרות ואת מאגר התרגילים. להמשיך?")) {
                    app.state.routines = json.routines;
                    // Import Exercises if exist, otherwise keep current
                    if(json.exercises) app.state.exercises = json.exercises;
                    
                    app.saveData();
                    alert("ההגדרות עודכנו בהצלחה!");
                    location.reload();
                }
            } catch(err) { alert("קובץ לא תקין"); }
        };
        reader.readAsText(file);
        input.value = '';
    },

    exportHistory: function() {
        const data = { type: 'history', ver: CONFIG.VERSION, history: this.state.history };
        this.downloadJSON(data, `gymstart_history_${Date.now()}.json`);
    },

    importHistory: function(input) {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                let newHist = Array.isArray(json) ? json : json.history;
                if (!newHist) throw new Error();

                if(confirm(`נמצאו ${newHist.length} רשומות. למזג?`)) {
                    app.state.history = [...app.state.history, ...newHist];
                    app.state.history.sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0));
                    app.saveData();
                    app.showHistory();
                    alert("ההיסטוריה עודכנה.");
                }
            } catch(err) { alert("שגיאה בקובץ"); }
        };
        reader.readAsText(file);
        input.value = '';
    },

    downloadJSON: function(data, filename) {
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const a = document.createElement('a');
        a.href = str; a.download = filename; a.click();
    },

    factoryReset: function() {
        if(confirm("איפוס מלא ימחק הכל. להמשיך?")) {
            localStorage.clear();
            location.reload();
        }
    },

    /* --- HISTORY VIEW --- */
    showHistory: function() {
        this.state.historySelection = [];
        this.updateHistoryActions(); 
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        [...this.state.history].reverse().forEach((h, i) => {
            const realIdx = this.state.history.length - 1 - i;
            const pName = h.programTitle || h.program;
            
            list.innerHTML += `
                <div class="hist-item-row">
                    <div style="display:flex; align-items:center">
                        <input type="checkbox" class="custom-chk" onchange="app.toggleHistorySelection(${realIdx}, this)">
                    </div>
                    <div style="flex:1" onclick="app.showHistoryDetail(${realIdx})">
                        <div style="display:flex; justify-content:space-between">
                            <span style="font-weight:700; color:var(--text)">${h.date}</span>
                            <span class="badge" style="background:#333; color:white; font-weight:400; font-size:0.75rem">${pName}</span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--text-sec); margin-top:5px">
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
        this.updateHistoryActions();
    },

    updateHistoryActions: function() {
        const btn = document.getElementById('btn-del-selected');
        btn.disabled = this.state.historySelection.length === 0;
        btn.innerText = this.state.historySelection.length > 0 ? `מחק (${this.state.historySelection.length})` : "מחק";
    },

    selectAllHistory: function() {
        const inputs = document.querySelectorAll('.custom-chk');
        const allSelected = this.state.historySelection.length === this.state.history.length && this.state.history.length > 0;
        if (allSelected) {
            this.state.historySelection = [];
            inputs.forEach(i => i.checked = false);
        } else {
            this.state.historySelection = this.state.history.map((_, i) => i);
            inputs.forEach(i => i.checked = true);
        }
        this.updateHistoryActions();
    },

    deleteSelectedHistory: function() {
        if (this.state.historySelection.length === 0) return;
        if (!confirm(`למחוק ${this.state.historySelection.length} אימונים?`)) return;
        this.state.history = this.state.history.filter((_, index) => !this.state.historySelection.includes(index));
        this.saveData();
        this.showHistory();
    },

    copySelectedHistory: function() {
        if(this.state.historySelection.length === 0) { alert("לא נבחר אימון"); return; }
        let fullTxt = "";
        const sortedSel = [...this.state.historySelection].sort((a,b) => a-b);
        sortedSel.forEach((idx, i) => {
            const h = this.state.history[idx];
            fullTxt += this.generateLogText(h);
            if(i < sortedSel.length - 1) fullTxt += "----------------\n\n";
        });
        this.copyText(fullTxt);
    },

    showHistoryDetail: function(idx) {
        const item = this.state.history[idx];
        this.state.viewHistoryIdx = idx;
        const pName = item.programTitle || item.program;
        
        const header = document.getElementById('hist-meta-header');
        header.innerHTML = `<h3>${pName}</h3><p>${item.date} | ${item.duration} דק'</p>`;

        const content = document.getElementById('hist-detail-content');
        let html = '';
        item.data.forEach(ex => {
            html += `<div style="background:var(--bg-card); padding:15px; border-radius:12px; margin-bottom:10px; border:1px solid #222;">
                <div style="font-weight:700; color:var(--primary)">${ex.name}</div>`;
            const exDef = this.getExerciseDef(ex.id);
            const isTime = (ex.id.includes('plank') || (exDef.settings.unit === 'bodyweight' && ex.sets[0].w === 0));
            
            ex.sets.forEach((s, si) => {
                let valStr;
                if(isTime && s.w === 0) {
                     valStr = `${s.r} שנ׳`;
                } else {
                     valStr = `${s.w} ק״ג | ${s.r} חזרות`;
                     if(exDef.settings.unit === 'plates') valStr = `${s.w} פלטות | ${s.r} חזרות`;
                     if(s.w === 0) valStr = `משקל גוף | ${s.r} חזרות`;
                }
                
                let feelStr = FEEL_MAP_TEXT[s.feel] || 'טוב';
                html += `<div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-top:5px; border-bottom:1px dashed #333; padding-bottom:5px">
                    <span>סט ${si+1} <small style="color:#777">(${feelStr})</small></span>
                    <span>${valStr}</span>
                </div>`;
            });
            html += `</div>`;
        });
        content.innerHTML = html;
        document.getElementById('history-modal').style.display = 'flex';
    },

    copySingleHistory: function() {
        const item = this.state.history[this.state.viewHistoryIdx];
        this.copyText(this.generateLogText(item));
    },

    closeHistoryModal: function() { document.getElementById('history-modal').style.display = 'none'; },

    deleteCurrentLog: function() {
        if(confirm("למחוק את האימון?")) {
            this.state.history.splice(this.state.viewHistoryIdx, 1);
            this.saveData();
            this.closeHistoryModal();
            this.showHistory();
        }
    },

    copyText: function(txt) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).then(() => alert("הועתק!"));
        } else {
            const ta = document.createElement('textarea');
            ta.value = txt;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            alert("הועתק!");
        }
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
