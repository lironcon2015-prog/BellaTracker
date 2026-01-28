/**
 * GYMSTART V1.6.1
 * Features: Professional Admin UI, Manual Badges, Ghost Update Button, Active Safety Check
 * Fixes: Admin Icon Visibility, CSS styling consistency
 */

const CONFIG = {
    KEYS: {
        ROUTINES: 'gymstart_beta_02_routines',
        HISTORY: 'gymstart_beta_02_history'
    },
    VERSION: '1.6.1'
};

const FEEL_MAP_TEXT = {
    'easy': 'קל',
    'good': 'בינוני',
    'hard': 'קשה'
};

const BANK = [
    { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', cat: 'legs' },
    { id: 'leg_press', name: 'לחיצת רגליים', unit: 'kg', cat: 'legs' },
    { id: 'rdl', name: 'דדליפט רומני', unit: 'kg', cat: 'legs' },
    { id: 'lunge', name: 'מכרעים (Lunges)', unit: 'kg', cat: 'legs' },
    { id: 'hip_thrust', name: 'גשר עכוז', unit: 'kg', cat: 'legs' },
    { id: 'leg_ext', name: 'פשיטת ברכיים', unit: 'plates', cat: 'legs' },
    { id: 'leg_curl', name: 'כפיפת ברכיים', unit: 'plates', cat: 'legs' },
    { id: 'calf_raise', name: 'הרמת עקבים', unit: 'kg', cat: 'legs' },
    { id: 'chest_press', name: 'לחיצת חזה משקולות', unit: 'kg', cat: 'chest' },
    { id: 'fly', name: 'פרפר (Fly)', unit: 'kg', cat: 'chest' },
    { id: 'pushup', name: 'שכיבות סמיכה', unit: 'bodyweight', cat: 'chest' },
    { id: 'incline_bench', name: 'לחיצת חזה שיפוע עליון', unit: 'kg', cat: 'chest' },
    { id: 'lat_pull', name: 'פולי עליון', unit: 'plates', cat: 'back' },
    { id: 'cable_row', name: 'חתירה בכבל', unit: 'plates', cat: 'back' },
    { id: 'db_row', name: 'חתירה במשקולת', unit: 'kg', cat: 'back' },
    { id: 'hyperext', name: 'פשיטת גו (Hyper)', unit: 'bodyweight', cat: 'back' },
    { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', cat: 'shoulders' },
    { id: 'lat_raise', name: 'הרחקה לצדדים', unit: 'kg', cat: 'shoulders' },
    { id: 'face_pull', name: 'פייס-פולס', unit: 'plates', cat: 'shoulders' },
    { id: 'bicep_curl', name: 'כפיפת מרפקים', unit: 'kg', cat: 'arms' },
    { id: 'tricep_pull', name: 'פשיטת מרפקים', unit: 'plates', cat: 'arms' },
    { id: 'tricep_rope', name: 'פשיטת מרפקים חבל', unit: 'plates', cat: 'arms' },
    { id: 'hammer_curl', name: 'כפיפת פטישים', unit: 'kg', cat: 'arms' },
    { id: 'plank', name: 'פלאנק (סטטי)', unit: 'bodyweight', cat: 'core' },
    { id: 'side_plank', name: 'פלאנק צידי', unit: 'bodyweight', cat: 'core' },
    { id: 'bicycle', name: 'בטן אופניים', unit: 'bodyweight', cat: 'core' },
    { id: 'knee_raise', name: 'הרמת ברכיים', unit: 'bodyweight', cat: 'core' },
    { id: 'crunches', name: 'כפיפות בטן', unit: 'bodyweight', cat: 'core' }
];

const DEFAULT_ROUTINES_V16 = {
    'A': {
        title: 'רגליים וגב',
        badge: 'A',
        exercises: [
            { id: 'goblet', name: 'גובלט סקוואט', unit: 'kg', note: 'גב זקוף', target: {w:10, r:12}, cat: 'legs', sets: 3 },
            { id: 'lat_pull', name: 'פולי עליון', unit: 'plates', note: 'משיכה לחזה', target: {w:6, r:12}, cat: 'back', sets: 3 },
            { id: 'bicycle', name: 'בטן אופניים', unit: 'bodyweight', note: 'שליטה בקצב', target: {w:0, r:30}, cat: 'core', sets: 3 }
        ]
    },
    'B': {
        title: 'חזה, כתפיים, ידיים',
        badge: 'B',
        exercises: [
            { id: 'chest_press', name: 'לחיצת חזה', unit: 'kg', note: 'יציבות', target: {w:7, r:12}, cat: 'chest', sets: 3 },
            { id: 'shoulder_press', name: 'לחיצת כתפיים', unit: 'kg', note: 'גב צמוד', target: {w:4, r:12}, cat: 'shoulders', sets: 3 },
            { id: 'plank', name: 'פלאנק סטטי', unit: 'bodyweight', note: 'אגן גבוה', target: {w:0, r:45}, cat: 'core', sets: 3 }
        ]
    }
};

const app = {
    state: {
        routines: {},
        history: [],
        currentProgId: null,
        active: {
            on: false,
            exIdx: 0, setIdx: 1, totalSets: 3,
            log: [], startTime: 0,
            timerInterval: null, restInterval: null, 
            feel: 'good', isStopwatch: false, stopwatchVal: 0,
            inputW: 10, inputR: 12
        },
        admin: { viewProgId: 'A' },
        editEx: { progId: null, index: null, data: null },
        historySelection: [],
        viewHistoryIdx: null
    },

    init: function() {
        try {
            this.loadData();
            this.renderHome();
            this.renderProgramSelect(); 
            
            // --- FIX: Force Navigation to Home on Init to set UI state ---
            this.nav('screen-home'); 
            // -------------------------------------------------------------
            
        } catch (e) {
            console.error(e);
            alert("שגיאה בטעינת נתונים.");
        }
    },

    loadData: function() {
        const h = localStorage.getItem(CONFIG.KEYS.HISTORY);
        this.state.history = h ? JSON.parse(h) : [];
        
        const r = localStorage.getItem(CONFIG.KEYS.ROUTINES);
        let loadedRoutines = r ? JSON.parse(r) : null;

        if (!loadedRoutines) {
            this.state.routines = JSON.parse(JSON.stringify(DEFAULT_ROUTINES_V16));
        } else {
            let needsSave = false;
            // Legacy Migration Check
            const firstKey = Object.keys(loadedRoutines)[0];
            if (firstKey && Array.isArray(loadedRoutines[firstKey])) {
               // Skipping complex V1.4 migration code for brevity - assuming V1.5+
            } 
            
            // Ensure Badges Exist
            for(const pid in loadedRoutines) {
                if(!loadedRoutines[pid].badge) {
                    loadedRoutines[pid].badge = pid.substring(0,2).toUpperCase();
                    needsSave = true;
                }
            }
            this.state.routines = loadedRoutines;
            if(needsSave) this.saveData();
        }
    },

    saveData: function() {
        localStorage.setItem(CONFIG.KEYS.ROUTINES, JSON.stringify(this.state.routines));
        localStorage.setItem(CONFIG.KEYS.HISTORY, JSON.stringify(this.state.history));
    },

    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        // Handle Icons Visibility
        const backBtn = document.getElementById('nav-back');
        const adminBtn = document.getElementById('btn-admin-home');

        if (screenId === 'screen-home') {
            backBtn.style.visibility = 'hidden';
            if(adminBtn) adminBtn.style.display = 'flex'; // Show Gear
            this.stopAllTimers();
            
            // Active State Safety Reset
            this.state.active.on = false;
        } else {
            backBtn.style.visibility = 'visible';
            if(adminBtn) adminBtn.style.display = 'none'; // Hide Gear
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
            const badge = prog.badge || pid.charAt(0);
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
        const ex = prog.exercises[this.state.active.exIdx];
        
        this.state.active.totalSets = ex.sets || 3;

        document.getElementById('ex-name').innerText = ex.name;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
        
        const noteEl = document.getElementById('coach-note');
        if (ex.note) {
            noteEl.innerText = "💡 " + ex.note;
            noteEl.style.display = 'block';
        } else noteEl.style.display = 'none';

        this.renderStatsStrip(ex.id, ex.unit);

        const isTime = (ex.unit === 'bodyweight' && (ex.id.includes('plank') || ex.id === 'wall_sit'));
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
            document.getElementById('unit-label-card').innerText = ex.unit === 'plates' ? 'פלטות' : 'ק״ג';
            
            this.state.active.inputW = ex.target?.w || 10;
            this.state.active.inputR = ex.target?.r || 12;
            this.populateSelects(ex);
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

        const isBody = (unit === 'bodyweight');
        const wStr = isBody ? 'גוף' : `${lastLog.w}`;
        const rStr = (this.state.active.isStopwatch) ? `${lastLog.r}שנ׳` : `${lastLog.r}חז׳`;
        const feelTxt = FEEL_MAP_TEXT[lastLog.feel] || '-';

        strip.innerHTML = `
            <span>${wStr}</span> <span style="color:#444">|</span>
            <span>${rStr}</span> <span style="color:#444">|</span>
            <span>${feelTxt}</span>
        `;
    },

    populateSelects: function(ex) {
        const selW = document.getElementById('select-weight');
        const selR = document.getElementById('select-reps');
        const isLegs = ex.cat === 'legs';

        let wOpts = [];
        if (ex.unit === 'bodyweight') wOpts = [0];
        else if (ex.unit === 'plates') for(let i=1; i<=20; i++) wOpts.push(i);
        else {
            for(let i=1; i<=10; i++) wOpts.push(i);
            const max = isLegs ? 60 : 35;
            for(let i=12.5; i<=max; i+=2.5) wOpts.push(i);
        }

        selW.innerHTML = '';
        wOpts.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.text = val;
            selW.appendChild(opt);
        });
        selW.value = this.state.active.inputW;
        if(!selW.value && wOpts.length > 0) selW.value = wOpts[0]; 
        selW.onchange = (e) => this.state.active.inputW = Number(e.target.value);

        let rOpts = [];
        const maxReps = ex.cat === 'core' ? 50 : 25;
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
        const ex = prog.exercises[this.state.active.exIdx];
        
        let exLog = this.state.active.log.find(l => l.id === ex.id);
        if(!exLog) {
            exLog = { id: ex.id, name: ex.name, sets: [] };
            this.state.active.log.push(exLog);
        }
        exLog.sets.push({ w, r, feel: this.state.active.feel });

        this.startRestTimer();

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

    startRestTimer: function() {
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
            if (sec <= 60) {
                const offset = MAX_OFFSET - (MAX_OFFSET * sec / 60);
                ring.style.strokeDashoffset = offset;
            } else {
                ring.style.strokeDashoffset = 0; 
            }
            if (sec === 60 && navigator.vibrate) navigator.vibrate([200,100,200]);
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
        this.state.active.setIdx++;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}+`;
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
                const isTime = (ex.id.includes('plank') || ex.id === 'wall_sit');
                ex.sets.forEach((s, i) => {
                    let valStr = isTime ? `${s.r}שנ׳` : `${s.w>0?s.w+'ק״ג ':''}${s.r}`;
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

    /* --- V1.6 ADMIN UI --- */

    openAdmin: function() { 
        if (this.state.active.on) {
            alert("לא ניתן להיכנס לניהול בזמן אימון פעיל."); return;
        }
        // Check Validity of current ID
        if(!this.state.admin.viewProgId || !this.state.routines[this.state.admin.viewProgId]) {
            const keys = Object.keys(this.state.routines);
            if(keys.length > 0) this.state.admin.viewProgId = keys[0];
            else return; // Empty state handle
        }
        
        document.getElementById('admin-modal').style.display = 'flex'; 
        this.renderAdminTabs();
        this.renderAdminList(); 
    },
    
    closeAdmin: function() { 
        this.saveData();
        this.renderProgramSelect(); 
        document.getElementById('admin-modal').style.display = 'none'; 
    },

    renderAdminTabs: function() {
        const container = document.getElementById('admin-tabs');
        container.innerHTML = '';
        Object.keys(this.state.routines).forEach(pid => {
            const prog = this.state.routines[pid];
            const isActive = (pid === this.state.admin.viewProgId);
            const badge = prog.badge || pid;
            
            const btn = document.createElement('button');
            btn.className = `admin-tab ${isActive ? 'active' : ''}`;
            btn.innerText = badge;
            btn.onclick = () => {
                this.state.admin.viewProgId = pid;
                this.renderAdminTabs();
                this.renderAdminList();
            };
            container.appendChild(btn);
        });
    },

    renderAdminList: function() {
        const progId = this.state.admin.viewProgId;
        if(!progId || !this.state.routines[progId]) return;

        const prog = this.state.routines[progId];
        
        document.getElementById('admin-prog-title').value = prog.title;
        document.getElementById('admin-prog-badge').value = prog.badge || '';

        const list = document.getElementById('admin-list');
        list.innerHTML = '';
        
        prog.exercises.forEach((ex, i) => {
            const metaStr = `${ex.sets} סטים • ${ex.target?.w || 0} ${ex.unit === 'kg' ? 'ק״ג' : ''}`;
            
            // Clean SVG Arrows
            const upArrow = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z"/></svg>`;
            const downArrow = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z"/></svg>`;

            list.innerHTML += `
            <div class="admin-row">
                <div class="row-info">
                    <div class="row-title">${i+1}. ${ex.name}</div>
                    <div class="row-meta">${metaStr}</div>
                </div>
                <div class="row-actions">
                    <button class="btn-text-action" onclick="app.openExEdit('${progId}', ${i})">עריכה</button>
                    <div class="arrow-controls">
                         <button class="arrow-btn" onclick="app.moveEx('${progId}',${i},-1)">${upArrow}</button>
                         <button class="arrow-btn" onclick="app.moveEx('${progId}',${i},1)">${downArrow}</button>
                    </div>
                </div>
            </div>`;
        });
    },

    updateProgramTitle: function() {
        const newVal = document.getElementById('admin-prog-title').value;
        if(newVal) this.state.routines[this.state.admin.viewProgId].title = newVal;
    },

    updateProgramBadge: function() {
        const newVal = document.getElementById('admin-prog-badge').value;
        if(newVal) {
            this.state.routines[this.state.admin.viewProgId].badge = newVal;
            this.renderAdminTabs(); 
        }
    },

    createNewProgram: function() {
        const id = 'prog_' + Date.now();
        this.state.routines[id] = {
            title: 'תוכנית חדשה',
            badge: 'New',
            exercises: []
        };
        this.state.admin.viewProgId = id;
        this.renderAdminTabs();
        this.renderAdminList();
    },

    deleteProgram: function() {
        const pid = this.state.admin.viewProgId;
        if(confirm("למחוק את התוכנית כולה?")) {
            delete this.state.routines[pid];
            const keys = Object.keys(this.state.routines);
            if(keys.length === 0) {
                this.createNewProgram();
            } else {
                this.state.admin.viewProgId = keys[0];
                this.renderAdminTabs();
                this.renderAdminList();
            }
        }
    },

    moveEx: function(pid, i, dir) {
        const arr = this.state.routines[pid].exercises;
        if ((i === 0 && dir === -1) || (i === arr.length - 1 && dir === 1)) return;
        const temp = arr[i];
        arr[i] = arr[i + dir];
        arr[i + dir] = temp;
        this.renderAdminList();
    },

    /* --- DRILL DOWN EDIT --- */
    openExEdit: function(progId, idx) {
        const ex = this.state.routines[progId].exercises[idx];
        this.state.editEx = { progId, index: idx, data: JSON.parse(JSON.stringify(ex)) };
        
        document.getElementById('edit-ex-title').innerText = ex.name;
        document.getElementById('edit-sets-val').innerText = ex.sets || 3;
        document.getElementById('edit-target-w').value = ex.target?.w || 0;
        document.getElementById('edit-target-r').value = ex.target?.r || 0;
        document.getElementById('edit-note').value = ex.note || '';

        document.getElementById('ex-edit-modal').style.display = 'flex';
    },

    closeExEdit: function() {
        document.getElementById('ex-edit-modal').style.display = 'none';
        this.state.editEx = { progId: null, index: null, data: null };
    },

    updateEditSets: function(delta) {
        let val = this.state.editEx.data.sets || 3;
        val += delta;
        if(val < 1) val = 1;
        this.state.editEx.data.sets = val;
        document.getElementById('edit-sets-val').innerText = val;
    },

    saveExEdit: function() {
        const d = this.state.editEx.data;
        d.target = {
            w: Number(document.getElementById('edit-target-w').value),
            r: Number(document.getElementById('edit-target-r').value)
        };
        d.note = document.getElementById('edit-note').value;
        this.state.routines[this.state.editEx.progId].exercises[this.state.editEx.index] = d;
        this.closeExEdit();
        this.renderAdminList();
    },

    removeCurrentEx: function() {
        if(confirm("למחוק את התרגיל?")) {
            this.state.routines[this.state.editEx.progId].exercises.splice(this.state.editEx.index, 1);
            this.closeExEdit();
            this.renderAdminList();
        }
    },

    /* --- BANK --- */
    openBank: function() { 
        document.getElementById('bank-modal').style.display = 'flex';
        this.filterBank();
    },
    closeBank: function() { document.getElementById('bank-modal').style.display = 'none'; },
    filterBank: function() {
        const txtEl = document.getElementById('bank-search');
        const catEl = document.getElementById('bank-cat-select');
        if(!txtEl || !catEl) return;

        const txt = txtEl.value.toLowerCase();
        const cat = catEl.value; 
        const list = document.getElementById('bank-list');
        list.innerHTML = '';
        
        BANK.filter(e => {
            const matchesName = e.name.toLowerCase().includes(txt);
            const matchesCat = cat === 'all' || e.cat === cat;
            return matchesName && matchesCat;
        })
        .forEach(e => {
            list.innerHTML += `<div class="admin-row" onclick="app.addFromBank('${e.id}')">
                <div class="row-info"><div class="row-title">${e.name}</div></div>
                <div class="row-actions"><span style="color:var(--primary); font-size:1.5rem">+</span></div>
            </div>`;
        });
    },
    addFromBank: function(id) {
        const n = JSON.parse(JSON.stringify(BANK.find(e=>e.id===id)));
        n.target = {w:10, r:12};
        n.sets = 3;
        this.state.routines[this.state.admin.viewProgId].exercises.push(n);
        this.closeBank();
        this.renderAdminList();
    },

    /* --- BACKUP & RESTORE --- */
    exportConfig: function() {
        const data = { type: 'config', ver: CONFIG.VERSION, date: new Date().toLocaleDateString(), routines: this.state.routines };
        this.downloadJSON(data, `gymstart_config_${Date.now()}.json`);
    },

    importConfig: function(input) {
        if(this.state.active.on) {
            alert("לא ניתן לעדכן באמצע אימון."); input.value = ''; return;
        }
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                if (json.type !== 'config') { alert("קובץ שגוי."); return; }
                if(confirm("עדכון תוכניות יחליף את ההגדרות הקיימות. להמשיך?")) {
                    app.state.routines = json.routines;
                    app.saveData();
                    app.renderProgramSelect(); 
                    alert("התוכניות עודכנו בהצלחה!");
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
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                let newHist = [];
                if (Array.isArray(json)) newHist = json;
                else if (json.type === 'history') newHist = json.history;
                else { alert("שגיאה בקובץ היסטוריה."); return; }

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
        a.href = str;
        a.download = filename;
        a.click();
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
            const isTime = (ex.id.includes('plank') || ex.id === 'wall_sit');
            ex.sets.forEach((s, si) => {
                let valStr = isTime ? `${s.r} שנ׳` : `${s.w > 0 ? s.w+'ק״ג ' : ''}${s.r}`;
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
