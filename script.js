/**
 * GYMSTART V1.8.1 — Firebase Sync + Login + Coach + History Groups + WhatsApp Import
 */

// ===================== FIREBASE CONFIG =====================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCu86gLObJqPryplKAQzbA-RFWc5suoiMg",
    authDomain: "gymstart-f2a87.firebaseapp.com",
    databaseURL: "https://gymstart-f2a87-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "gymstart-f2a87",
    storageBucket: "gymstart-f2a87.firebasestorage.app",
    messagingSenderId: "149772426230",
    appId: "1:149772426230:web:7969704595f3290d1b05d7"
};
const COACH_PASSWORD = '3942';
const COACH_ID = 'coach_admin';

const CONFIG = {
    KEYS: {
        ROUTINES: 'gymstart_v1_7_routines',
        HISTORY: 'gymstart_beta_02_history',
        EXERCISES: 'gymstart_v1_7_exercises_bank',
        ACTIVE_WORKOUT: 'gymstart_active_workout_state'
    },
    VERSION: '1.8.1'
};

const FEEL_MAP_TEXT = { 'easy': 'קל', 'good': 'בינוני', 'hard': 'קשה' };

// ===================== BASE EXERCISES =====================
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
    'A': { title: 'רגליים וגב (A)', exercises:[ {id:'goblet', sets:3, rest:90}, {id:'leg_press', sets:3}, {id:'lat_pull', sets:3} ] },
    'B': { title: 'חזה וכתפיים (B)', exercises:[ {id:'chest_press', sets:3}, {id:'shoulder_press', sets:3}, {id:'plank', sets:3} ] }
};

// ===================== COACH PRESS TIMER =====================
let coachPressTimer = null;

// ===================== FIREBASE SYNC MODULE =====================
const sync = {
    db: null,
    athleteId: null,

    init(athleteId) {
        this.athleteId = athleteId;
        if (!this.db) {
            try {
                const fbApp = (typeof firebase !== 'undefined')
                    ? (firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG))
                    : null;
                if (fbApp) this.db = firebase.database(fbApp);
            } catch(e) {
                console.warn('Firebase init error:', e);
            }
        }
    },

    async pushHistory(item) {
        if (!this.db || !item) return;
        try {
            await this.db.ref(`gymstart-app/athletes/${this.athleteId}/history/${item.timestamp}`).set(item);
        } catch(e) { console.warn('pushHistory error:', e); }
    },

    async deleteHistoryItem(timestamp) {
        if (!this.db) return;
        try {
            await this.db.ref(`gymstart-app/athletes/${this.athleteId}/history/${timestamp}`).remove();
        } catch(e) { console.warn('deleteHistoryItem error:', e); }
    },

    async pushConfig(routines, exercises) {
        if (!this.db) return;
        const cfg = { routines, exercises, lastUpdated: Date.now() };
        await this.db.ref('gymstart-app/config/data').set(cfg);
    },

    async pullConfig() {
        if (!this.db) return null;
        try {
            const snap = await this.db.ref('gymstart-app/config/data').get();
            return snap.exists() ? snap.val() : null;
        } catch(e) { return null; }
    },

    async migrateHistory(historyArr) {
        if (!this.db || !historyArr.length) return;
        const updates = {};
        historyArr.forEach(item => {
            if (item.timestamp)
                updates[`gymstart-app/athletes/${this.athleteId}/history/${item.timestamp}`] = item;
        });
        try { await this.db.ref().update(updates); } catch(e) { console.warn('migrateHistory error:', e); }
    },

    async fetchAthletes() {
        if (!this.db) return [];
        try {
            const snap = await this.db.ref('gymstart-app/athletes').get();
            if (!snap.exists()) return [];
            const athletes = [];
            snap.forEach(child => {
                const profile = child.val()?.profile;
                if (profile) athletes.push({ id: child.key, name: profile.name });
            });
            return athletes;
        } catch(e) { return []; }
    },

    async fetchAthleteHistory(athleteId) {
        if (!this.db) return [];
        try {
            const snap = await this.db.ref(`gymstart-app/athletes/${athleteId}/history`).get();
            if (!snap.exists()) return [];
            const items = [];
            snap.forEach(child => items.push(child.val()));
            return items.sort((a, b) => b.timestamp - a.timestamp);
        } catch(e) { return []; }
    },

    async deleteAthleteHistoryItem(athleteId, timestamp) {
        if (!this.db) return;
        await this.db.ref(`gymstart-app/athletes/${athleteId}/history/${timestamp}`).remove();
    },

    async registerAthlete(athleteId, name) {
        if (!this.db) return;
        try {
            await this.db.ref(`gymstart-app/athletes/${athleteId}/profile`).set({ name });
        } catch(e) { console.warn('registerAthlete error:', e); }
    }
};

// ===================== APP OBJECT =====================
const app = {
    state: {
        routines: {},
        history: [],
        exercises: [],
        lastUpdated: 0,
        currentProgId: null,
        historyWeeksVal: 1,
        isCoach: false,
        coachViewingAthlete: null,
        _parsedImport: null,
        active: {
            on: false,
            sessionExercises: [],
            exIdx: 0, setIdx: 1, totalSets: 3,
            log: [],
            startTime: 0,
            accumulatedTime: 0,
            timerInterval: null, restInterval: null,
            restStartTime: 0,
            restDuration: 60,
            feel: 'good', isStopwatch: false, stopwatchVal: 0,
            inputW: 10, inputR: 12
        },
        tempActive: null,
        admin: {
            viewProgId: null, editTipEx: null, selectorFilter: 'all', exManagerFilter: 'all',
            tempExercises: [], editingExId: null
        },
        userSelector: { mode: null },
        historySelection: [],
        viewHistoryIdx: null
    },

    // ===================== INIT =====================
    init: function() {
        try {
            this.loadData();
            this.checkActiveWorkout();
            this.renderHome();
            this.renderProgramSelect();
            if (!this.state.tempActive) this.nav('screen-home');
            this.checkLogin();
        } catch(e) {
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
            this.state.routines = JSON.parse(JSON.stringify(DEFAULT_ROUTINES_V17));
            for (const pid in this.state.routines) {
                this.state.routines[pid].exercises.forEach(ex => {
                    const bankEx = BASE_BANK_INIT.find(b => b.id === ex.id);
                    if (bankEx) { ex.name = bankEx.name; ex.unit = bankEx.settings.unit; ex.cat = bankEx.cat; }
                });
            }
        } else {
            this.state.routines = loadedRoutines;
        }

        const e = localStorage.getItem(CONFIG.KEYS.EXERCISES);
        if (e) {
            this.state.exercises = JSON.parse(e);
        } else {
            this.state.exercises = JSON.parse(JSON.stringify(BASE_BANK_INIT));
            this.saveData();
        }

        const lu = localStorage.getItem('gymstart_last_updated');
        this.state.lastUpdated = lu ? parseInt(lu) : 0;
    },

    saveData: function() {
        localStorage.setItem(CONFIG.KEYS.ROUTINES, JSON.stringify(this.state.routines));
        localStorage.setItem(CONFIG.KEYS.HISTORY, JSON.stringify(this.state.history));
        localStorage.setItem(CONFIG.KEYS.EXERCISES, JSON.stringify(this.state.exercises));
        if (this.state.lastUpdated) localStorage.setItem('gymstart_last_updated', this.state.lastUpdated);
    },

    // ===================== LOGIN / INIT-WITH-ATHLETE =====================
    checkLogin: function() {
        const id = localStorage.getItem('gymstart_athlete_id');
        if (!id) {
            document.getElementById('login-modal').style.display = 'flex';
            setTimeout(() => {
                const el = document.getElementById('login-name-input');
                if (el) el.focus();
            }, 300);
        } else {
            this.initWithAthlete(id).catch(console.warn);
        }
    },

    submitLogin: async function() {
        const name = document.getElementById('login-name-input').value.trim();
        if (!name) return;
        const id = name.toLowerCase().replace(/[\s]+/g, '_') + '_' + Date.now();
        localStorage.setItem('gymstart_athlete_id', id);
        localStorage.setItem('gymstart_athlete_name', name);
        document.getElementById('login-modal').style.display = 'none';
        await this.initWithAthlete(id, name);
    },

    initWithAthlete: async function(id, name) {
        sync.init(id);
        if (name) await sync.registerAthlete(id, name);

        const migrated = localStorage.getItem('gymstart_migrated');
        if (!migrated && this.state.history.length > 0) {
            await sync.migrateHistory(this.state.history);
            localStorage.setItem('gymstart_migrated', '1');
        }

        try {
            const remote = await sync.pullConfig();
            if (remote && remote.lastUpdated > (this.state.lastUpdated || 0)) {
                this.state.routines = remote.routines;
                this.state.exercises = remote.exercises;
                this.state.lastUpdated = remote.lastUpdated;
                this.saveData();
                this.renderProgramSelect();
                this.renderHome();
            }
        } catch(e) {
            console.warn('Could not pull config:', e);
        }
    },

    manualPullConfig: async function() {
        try {
            const remote = await sync.pullConfig();
            if (remote && remote.lastUpdated > (this.state.lastUpdated || 0)) {
                this.state.routines = remote.routines;
                this.state.exercises = remote.exercises;
                this.state.lastUpdated = remote.lastUpdated;
                this.saveData();
                alert("הקונפיג עודכן בהצלחה!");
                location.reload();
            } else {
                alert("אין עדכון חדש מהמאמן");
            }
        } catch(e) {
            alert("שגיאה בקבלת עדכון");
        }
    },

    // ===================== COACH FUNCTIONS =====================
    startCoachPress: function(e) {
        coachPressTimer = setTimeout(() => {
            if (coachPressTimer) this.openCoachLogin();
        }, 800);
    },
    cancelCoachPress: function() {
        if (coachPressTimer) { clearTimeout(coachPressTimer); coachPressTimer = null; }
    },

    openCoachLogin: function() {
        coachPressTimer = null;
        document.getElementById('coach-password-input').value = '';
        document.getElementById('coach-login-modal').style.display = 'flex';
        setTimeout(() => document.getElementById('coach-password-input').focus(), 200);
    },

    verifyCoachPassword: async function(pw) {
        if (pw === COACH_PASSWORD) {
            document.getElementById('coach-login-modal').style.display = 'none';
            this.state.isCoach = true;
            await this.openCoachAthleteList();
        } else {
            alert("סיסמה שגויה");
        }
    },

    openCoachAthleteList: async function() {
        document.getElementById('coach-athletes-modal').style.display = 'flex';
        const list = document.getElementById('coach-athletes-list');
        list.innerHTML = '<div style="text-align:center;color:#555;padding:20px;">טוען...</div>';
        const athletes = await sync.fetchAthletes();
        if (athletes.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:#555;padding:20px;">אין מתאמנות רשומות</div>';
            return;
        }
        list.innerHTML = '';
        athletes.forEach(a => {
            const el = document.createElement('div');
            el.className = 'list-item';
            el.style.cursor = 'pointer';
            el.innerHTML = `<span style="font-weight:700">${a.name}</span><span style="color:var(--primary)">צפה →</span>`;
            el.onclick = () => this.viewAthleteHistory(a.id, a.name);
            list.appendChild(el);
        });
    },

    viewAthleteHistory: async function(athleteId, athleteName) {
        document.getElementById('coach-athletes-modal').style.display = 'none';
        document.getElementById('coach-athlete-name-title').textContent = `👁 ${athleteName}`;
        document.getElementById('coach-athlete-history-modal').style.display = 'flex';
        const list = document.getElementById('coach-athlete-history-list');
        list.innerHTML = '<div style="text-align:center;color:#555;padding:20px;">טוען...</div>';

        const history = await sync.fetchAthleteHistory(athleteId);
        list.innerHTML = '';
        if (history.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:#555;padding:20px;">אין היסטוריה</div>';
            return;
        }
        history.forEach(h => {
            const pName = h.programTitle || h.program || '';
            const el = document.createElement('div');
            el.className = 'hist-item-row';
            el.style.justifyContent = 'space-between';
            el.innerHTML = `
                <div style="flex:1">
                    <div style="display:flex;justify-content:space-between;">
                        <span style="font-weight:700">${h.date}</span>
                        <span class="badge" style="background:#333;color:white;font-size:0.75rem;">${pName}</span>
                    </div>
                    <div style="font-size:0.85rem;color:#888;margin-top:4px;">${(h.data||[]).length} תרגילים • ${h.duration||'?'} דק'</div>
                </div>
                <button class="btn-text-action delete" style="margin-right:10px;flex-shrink:0;" 
                    onclick="app.deleteCoachHistoryItem('${athleteId}','${athleteName}',${h.timestamp})">מחק</button>`;
            list.appendChild(el);
        });
    },

    deleteCoachHistoryItem: async function(athleteId, athleteName, timestamp) {
        if (!confirm('למחוק את האימון?')) return;
        await sync.deleteAthleteHistoryItem(athleteId, timestamp);
        await this.viewAthleteHistory(athleteId, athleteName);
    },

    pushConfigAsCoach: async function() {
        try {
            await sync.pushConfig(this.state.routines, this.state.exercises);
            alert("הקונפיג נשמר ב-Firebase!");
        } catch(e) {
            alert("שגיאה בשמירת קונפיג");
        }
    },

    // ===================== PERSISTENCE & RESUME =====================
    saveActiveState: function() {
        if (!this.state.active.on) {
            localStorage.removeItem(CONFIG.KEYS.ACTIVE_WORKOUT);
            return;
        }
        const currentSession = Date.now() - this.state.active.startTime;
        const stateToSave = { ...this.state.active };
        stateToSave.accumulatedTime = this.state.active.accumulatedTime + currentSession;
        stateToSave.timerInterval = null;
        stateToSave.restInterval = null;
        localStorage.setItem(CONFIG.KEYS.ACTIVE_WORKOUT, JSON.stringify(stateToSave));
        this.state.active.accumulatedTime = stateToSave.accumulatedTime;
        this.state.active.startTime = Date.now();
    },

    checkActiveWorkout: function() {
        const saved = localStorage.getItem(CONFIG.KEYS.ACTIVE_WORKOUT);
        if (saved) {
            this.state.tempActive = JSON.parse(saved);
            document.getElementById('resume-modal').style.display = 'flex';
        }
    },

    resumeWorkout: function() {
        if (this.state.tempActive) {
            this.state.active = this.state.tempActive;
            this.state.active.startTime = Date.now();
            this.state.active.timerInterval = null;
            this.state.active.restInterval = null;
            this.state.currentProgId = this.state.active.progId || Object.keys(this.state.routines)[0];
            if (this.state.active.restStartTime > 0) {
                this.startRestTimer(this.state.active.restDuration || 60);
            }
            document.getElementById('resume-modal').style.display = 'none';
            this.loadActiveExercise();
            this.nav('screen-active');
        }
    },

    discardWorkout: function() {
        localStorage.removeItem(CONFIG.KEYS.ACTIVE_WORKOUT);
        this.state.tempActive = null;
        document.getElementById('resume-modal').style.display = 'none';
        this.nav('screen-home');
    },

    // ===================== NAVIGATION =====================
    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        const backBtn = document.getElementById('nav-back');
        const adminBtn = document.getElementById('btn-admin-home');
        const pasteBtn = document.getElementById('btn-paste-import');

        if (screenId === 'screen-home') {
            backBtn.style.visibility = 'hidden';
            if (adminBtn) adminBtn.style.display = 'flex';
            if (pasteBtn) pasteBtn.style.display = 'flex';
            this.stopAllTimers();
            this.state.active.on = false;
        } else {
            backBtn.style.visibility = 'visible';
            if (adminBtn) adminBtn.style.display = 'none';
            if (pasteBtn) pasteBtn.style.display = 'none';
        }
    },

    goBack: function() {
        const activeScreen = document.querySelector('.screen.active').id;
        if (activeScreen === 'screen-active') {
            if (confirm("לצאת מהאימון?")) {
                this.stopAllTimers();
                this.state.active.on = false;
                localStorage.removeItem(CONFIG.KEYS.ACTIVE_WORKOUT);
                this.nav('screen-overview');
            }
        } else if (activeScreen === 'screen-overview') {
            this.nav('screen-program-select');
        } else {
            this.nav('screen-home');
        }
    },

    // ===================== RENDERING =====================
    renderProgramSelect: function() {
        const container = document.getElementById('prog-list-container');
        container.innerHTML = '';
        const ids = Object.keys(this.state.routines);
        if (ids.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#666;">אין תוכניות זמינות.</div>';
            return;
        }
        ids.forEach(pid => {
            const prog = this.state.routines[pid];
            const badge = pid.charAt(0).toUpperCase();
            const count = prog.exercises.length;
            let desc = `${count} תרגילים`;
            if (count > 0) desc += ` • מתחיל ב: ${prog.exercises[0].name}`;
            container.innerHTML += `
                <div class="oled-card prog-card" onclick="app.selectProgram('${pid}')">
                    <div class="prog-icon">${badge}</div>
                    <div class="prog-content">
                        <div class="prog-title">${prog.title}</div>
                        <div class="prog-desc">${desc}</div>
                    </div>
                </div>`;
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
                <span>${i + 1}. ${ex.name}</span>
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
        const name = localStorage.getItem('gymstart_athlete_name');
        if (name) {
            const greet = document.getElementById('greeting');
            if (greet) greet.innerText = `שלום, ${name} 👋`;
        }
    },

    getExerciseDef: function(exId) {
        const found = this.state.exercises.find(e => e.id === exId);
        if (found) return found;
        let isCore = exId.includes('plank') || exId.includes('core') || exId.includes('situp') || exId.includes('crunch');
        return {
            name: 'תרגיל לא ידוע',
            cat: isCore ? 'core' : 'other',
            settings: {unit: 'kg', step: 2.5, min: 0, max: 50}
        };
    },

    // ===================== WORKOUT LOGIC =====================
    startWorkout: function() {
        if (!this.state.routines[this.state.currentProgId] ||
            this.state.routines[this.state.currentProgId].exercises.length === 0) {
            alert("התוכנית ריקה"); return;
        }
        const prog = this.state.routines[this.state.currentProgId];
        this.state.active = {
            on: true,
            progId: this.state.currentProgId,
            sessionExercises: JSON.parse(JSON.stringify(prog.exercises)),
            exIdx: 0, setIdx: 1, totalSets: 3,
            log: [],
            startTime: Date.now(),
            accumulatedTime: 0,
            timerInterval: null, restInterval: null,
            restStartTime: 0,
            restDuration: 60,
            feel: 'good', isStopwatch: false, stopwatchVal: 0,
            inputW: 10, inputR: 12
        };
        this.saveActiveState();
        this.loadActiveExercise();
        this.nav('screen-active');
    },

    loadActiveExercise: function() {
        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        const exDef = this.getExerciseDef(exInst.id);

        this.state.active.totalSets = exInst.sets || 3;
        document.getElementById('ex-name').innerText = exInst.name;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;

        const vidBtn = document.getElementById('ex-video-link');
        if (exDef.videoUrl && exDef.videoUrl.length > 5) {
            vidBtn.style.display = 'flex';
            vidBtn.href = exDef.videoUrl;
        } else { vidBtn.style.display = 'none'; }

        const reorderBtn = document.getElementById('btn-reorder');
        if (this.state.active.setIdx === 1) {
            reorderBtn.style.display = 'block';
            if (exDef.cat === 'core') reorderBtn.innerText = "החליפי תרגיל";
            else reorderBtn.innerText = "שינוי סדר";
            if (exDef.cat !== 'core' && this.state.active.exIdx >= this.state.active.sessionExercises.length - 1) {
                reorderBtn.style.display = 'none';
            }
        } else {
            reorderBtn.style.display = 'none';
        }

        const noteEl = document.getElementById('coach-note');
        if (exInst.note) {
            noteEl.innerText = "💡 " + exInst.note;
            noteEl.style.display = 'block';
        } else noteEl.style.display = 'none';

        this.renderStatsStrip(exInst.id, exDef.settings.unit);

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

            let smartWeight = exInst.target?.w || 10;
            for (let i = this.state.history.length - 1; i >= 0; i--) {
                const sess = this.state.history[i];
                const found = sess.data.find(e => e.id === exInst.id);
                if (found && found.sets.length > 0) {
                    smartWeight = found.sets[found.sets.length - 1].w;
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
        strip.innerHTML = '';
        const exHistory = [];
        for (let i = 0; i < this.state.history.length; i++) {
            const sess = this.state.history[i];
            const found = sess.data.find(e => e.id === exId);
            if (found && found.sets.length > 0) exHistory.push(found);
        }
        if (exHistory.length === 0) {
            strip.innerHTML = '<div class="strip-no-data">אין הישג קודם</div>';
            return;
        }
        const exDef = this.getExerciseDef(exId);
        const isBodyweight = exDef.settings.unit === 'bodyweight';
        const isTime = this.state.active.isStopwatch;

        const getBest = (exRecord) => {
            if (isTime || isBodyweight) return Math.max(...exRecord.sets.map(s => s.r));
            return Math.max(...exRecord.sets.map(s => s.w));
        };
        const getUnitLabel = () => {
            if (isTime) return 'שנ\'';
            if (isBodyweight) return 'חזר\'';
            if (unit === 'plates') return 'פלטות';
            return 'ק״ג';
        };
        const unitLabel = getUnitLabel();
        const lastSession = exHistory[exHistory.length - 1];
        const lastBest = getBest(lastSession);

        let trendHtml = '';
        if (exHistory.length >= 2) {
            const prevBest = getBest(exHistory[exHistory.length - 2]);
            const diff = lastBest - prevBest;
            if (diff > 0) trendHtml = `<div class="strip-trend up">▲ +${diff} ${unitLabel}</div>`;
            else if (diff < 0) trendHtml = `<div class="strip-trend down">▼ ${diff} ${unitLabel}</div>`;
            else trendHtml = `<div class="strip-trend neutral">ללא שינוי</div>`;
        }

        const sparkData = exHistory.slice(-5).map(e => getBest(e));
        let sparkHtml = '';
        if (sparkData.length >= 2) {
            const minV = Math.min(...sparkData);
            const maxV = Math.max(...sparkData);
            const range = maxV - minV || 1;
            const W = 64, H = 28, pad = 3;
            const points = sparkData.map((v, i) => {
                const x = pad + (i / (sparkData.length - 1)) * (W - pad * 2);
                const y = H - pad - ((v - minV) / range) * (H - pad * 2);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            });
            const lastPt = points[points.length - 1].split(',');
            sparkHtml = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible;">
                <polyline points="${points.join(' ')}" fill="none" stroke="#00ffee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
                <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="2.5" fill="#00ffee"/>
            </svg>`;
        }

        const allBests = exHistory.map(e => getBest(e));
        const pr = Math.max(...allBests);
        const prSessionIndex = allBests.lastIndexOf(pr);
        const isCurrentPR = (prSessionIndex === exHistory.length - 1);
        const prLabel = isCurrentPR ? '⭐ שיא!' : `${pr} ${unitLabel}`;
        const prColor = isCurrentPR ? 'var(--primary)' : '#777';

        strip.innerHTML = `
            <div class="strip-section">
                <div class="strip-lbl">אימון קודם</div>
                <div class="strip-val">${lastBest} ${unitLabel}</div>
                ${trendHtml}
            </div>
            <div class="strip-section">
                <div class="strip-lbl">מגמה</div>
                ${sparkHtml || '<div class="strip-no-data" style="font-size:0.75rem;">מעט נתונים</div>'}
            </div>
            <div class="strip-section">
                <div class="strip-lbl">שיא אישי</div>
                <div class="strip-val" style="color:${prColor}; font-size:${isCurrentPR ? '0.85rem' : '1rem'};">${prLabel}</div>
            </div>`;
    },

    populateSelects: function(exDef) {
        const selW = document.getElementById('select-weight');
        const selR = document.getElementById('select-reps');
        const s = exDef.settings || {unit: 'kg', step: 2.5, min: 0, max: 50};

        let wOpts = [];
        if (s.unit === 'bodyweight') wOpts = [0];
        else {
            const min = parseFloat(s.min);
            const max = parseFloat(s.max);
            const step = parseFloat(s.step) || 2.5;
            for (let v = min; v <= max; v += step) {
                let cleanV = parseFloat(v.toFixed(1));
                if (cleanV % 1 === 0) cleanV = parseInt(cleanV);
                wOpts.push(cleanV);
            }
        }
        selW.innerHTML = '';
        wOpts.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val; opt.text = val;
            selW.appendChild(opt);
        });
        if (wOpts.includes(this.state.active.inputW)) selW.value = this.state.active.inputW;
        else {
            const closest = wOpts.reduce((prev, curr) =>
                (Math.abs(curr - this.state.active.inputW) < Math.abs(prev - this.state.active.inputW) ? curr : prev));
            selW.value = closest;
            this.state.active.inputW = closest;
        }
        selW.onchange = (e) => this.state.active.inputW = Number(e.target.value);

        let rOpts = [];
        const maxReps = exDef.cat === 'core' ? 50 : 30;
        for (let i = 1; i <= maxReps; i++) rOpts.push(i);
        selR.innerHTML = '';
        rOpts.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val; opt.text = val;
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
                document.getElementById('sw-display').innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
            }, 100);
        }
    },

    stopStopwatch: function() {
        if (this.state.active.timerInterval) clearInterval(this.state.active.timerInterval);
        this.state.active.timerInterval = null;
    },

    selectFeel: function(f) {
        this.state.active.feel = f;
        this.updateFeelUI();
    },

    updateFeelUI: function() {
        const map = {'easy': 'קל', 'good': 'בינוני (טוב)', 'hard': 'קשה'};
        document.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`.feel-btn.${this.state.active.feel}`).classList.add('selected');
        document.getElementById('feel-text').innerText = map[this.state.active.feel];
    },

    finishSet: function() {
        this.triggerPressEffect('btn-finish');
        let w, r;
        if (this.state.active.isStopwatch) {
            if (this.state.active.timerInterval) this.toggleStopwatch();
            w = 0; r = this.state.active.stopwatchVal;
            if (r === 0) { alert("לא נמדד זמן"); return; }
        } else {
            w = this.state.active.inputW; r = this.state.active.inputR;
        }

        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === exInst.id);
        if (!exLog) {
            exLog = {id: exInst.id, name: exInst.name, sets: []};
            this.state.active.log.push(exLog);
        }
        exLog.sets.push({w, r, feel: this.state.active.feel});

        const restTime = exInst.rest || 60;
        this.startRestTimer(restTime);

        if (this.state.active.setIdx < this.state.active.totalSets) {
            this.state.active.setIdx++;
            document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
            document.getElementById('btn-reorder').style.display = 'none';
            this.state.active.feel = 'good';
            this.updateFeelUI();
            if (this.state.active.isStopwatch) {
                this.state.active.stopwatchVal = 0;
                document.getElementById('sw-display').innerText = "00:00";
            }
        } else {
            document.getElementById('btn-reorder').style.display = 'none';
            document.getElementById('btn-finish').style.display = 'none';
            document.getElementById('decision-buttons').style.display = 'flex';
            document.getElementById('rest-timer-area').style.display = 'none';

            const nextEx = this.state.active.sessionExercises[this.state.active.exIdx + 1];
            const nextEl = document.getElementById('next-ex-preview');
            nextEl.innerText = nextEx ? `הבא בתור: ${nextEx.name}` : "הבא בתור: סיום אימון";
            nextEl.style.display = 'block';

            const exDef = this.getExerciseDef(exInst.id);
            const addBtn = document.getElementById('btn-add-core');
            if (exDef.cat === 'core') addBtn.style.display = 'block';
            else addBtn.style.display = 'none';
        }
        this.saveActiveState();
    },

    startRestTimer: function(durationSec) {
        this.stopRestTimer();
        const area = document.getElementById('rest-timer-area');
        const disp = document.getElementById('rest-timer-val');
        const ring = document.getElementById('rest-ring-prog');
        area.style.display = 'flex';
        this.state.active.restDuration = durationSec;
        if (!this.state.active.restStartTime || this.state.active.restStartTime === 0) {
            this.state.active.restStartTime = Date.now();
        }
        const MAX_OFFSET = 408;
        this.state.active.restInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.state.active.restStartTime) / 1000);
            let m = Math.floor(elapsed / 60);
            let s = elapsed % 60;
            disp.innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
            const ratio = Math.min(elapsed / durationSec, 1);
            const offset = MAX_OFFSET - (MAX_OFFSET * ratio);
            ring.style.strokeDashoffset = offset;
        }, 100);
        this.saveActiveState();
    },

    stopRestTimer: function() {
        if (this.state.active.restInterval) clearInterval(this.state.active.restInterval);
        this.state.active.restInterval = null;
        document.getElementById('rest-timer-area').style.display = 'none';
        this.state.active.restStartTime = 0;
    },

    stopAllTimers: function() {
        this.stopStopwatch();
        this.stopRestTimer();
    },

    addSet: function() {
        this.triggerPressEffect('btn-add-set');
        this.state.active.totalSets++;
        this.state.active.setIdx++;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
        document.getElementById('btn-reorder').style.display = 'none';
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('next-ex-preview').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        document.getElementById('rest-timer-area').style.display = 'flex';
        if (this.state.active.isStopwatch) {
            this.state.active.stopwatchVal = 0;
            document.getElementById('sw-display').innerText = "00:00";
        }
        this.saveActiveState();
    },

    deleteLastSet: function() {
        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === exInst.id);
        if (exLog && exLog.sets.length > 0) {
            exLog.sets.pop();
            this.stopRestTimer();
            if (this.state.active.setIdx > 1) {
                this.state.active.setIdx--;
                document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
                if (this.state.active.setIdx === 1) {
                    document.getElementById('btn-reorder').style.display = 'block';
                }
                document.getElementById('decision-buttons').style.display = 'none';
                document.getElementById('next-ex-preview').style.display = 'none';
                document.getElementById('btn-finish').style.display = 'flex';
            }
        }
        this.saveActiveState();
    },

    skipExercise: function() { this.nextExercise(); },

    nextExercise: function() {
        this.triggerPressEffect('btn-next-ex');
        this.stopAllTimers();
        if (this.state.active.exIdx < this.state.active.sessionExercises.length - 1) {
            this.state.active.exIdx++;
            this.state.active.setIdx = 1;
            this.saveActiveState();
            this.loadActiveExercise();
        } else {
            this.finishWorkout();
        }
    },

    finishWorkout: function() {
        this.stopAllTimers();
        const currentSessionDur = Date.now() - this.state.active.startTime;
        const totalDurMs = this.state.active.accumulatedTime + currentSessionDur;
        const durationMin = Math.round(totalDurMs / 60000);
        const dateStr = new Date().toLocaleDateString('he-IL');
        const progTitle = this.state.routines[this.state.currentProgId]?.title || "אימון מזדמן";

        this.state.active.summary = {
            program: this.state.currentProgId,
            programTitle: progTitle,
            date: dateStr,
            duration: durationMin,
            data: this.state.active.log
        };

        const meta = document.getElementById('summary-meta');
        meta.innerText = `${dateStr} | ${durationMin} דקות`;
        const textBox = document.getElementById('summary-text');
        textBox.innerText = this.generateLogText(this.state.active.summary);
        this.renderSummaryStats(this.state.active.summary);
        this.renderWinCard(this.state.active.summary);
        this.nav('screen-summary');
    },

    triggerPressEffect: function(btnId) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 180);
    },

    renderSummaryStats: function(summary) {
        const totalSets = summary.data.reduce((acc, ex) => acc + ex.sets.length, 0);
        const exCount = summary.data.filter(ex => ex.sets.length > 0).length;
        const statsHtml = `
            <div class="summary-stats-row">
                <div class="summary-stat-item">
                    <div class="summary-stat-val">${exCount}</div>
                    <div class="summary-stat-lbl">תרגילים</div>
                </div>
                <div class="summary-stat-item">
                    <div class="summary-stat-val">${totalSets}</div>
                    <div class="summary-stat-lbl">סטים</div>
                </div>
                <div class="summary-stat-item">
                    <div class="summary-stat-val">${summary.duration}</div>
                    <div class="summary-stat-lbl">דקות</div>
                </div>
            </div>`;
        document.getElementById('summary-meta').innerHTML =
            `<div style="margin-bottom:4px;">${summary.date}</div>${statsHtml}`;
    },

    renderWinCard: function(summary) {
        const winCard = document.getElementById('win-card');
        const winList = document.getElementById('win-list');
        winCard.style.display = 'none';
        winList.innerHTML = '';

        const prevSession = [...this.state.history].reverse().find(h => h.program === summary.program);
        if (!prevSession) return;

        let winCount = 0;
        let html = '';
        summary.data.forEach(ex => {
            if (ex.sets.length === 0) return;
            const prevEx = prevSession.data.find(p => p.id === ex.id);
            if (!prevEx || prevEx.sets.length === 0) return;
            const exDef = this.getExerciseDef(ex.id);
            const isBodyweight = exDef.settings.unit === 'bodyweight';
            const isTime = isBodyweight && (ex.id.includes('plank') || ex.id.includes('static'));
            const getBest = (sets) => {
                if (isTime || isBodyweight) return Math.max(...sets.map(s => s.r));
                return Math.max(...sets.map(s => s.w));
            };
            const currentBest = getBest(ex.sets);
            const prevBest = getBest(prevEx.sets);
            const unit = isTime ? 'שנ\'' : isBodyweight ? 'חזר\'' : (exDef.settings.unit === 'plates' ? 'פלטות' : 'ק״ג');
            if (currentBest > prevBest) {
                winCount++;
                html += `<div class="win-row">
                    <span class="win-row-name">${ex.name}</span>
                    <div class="win-delta">
                        <span class="win-prev">${prevBest} ${unit}</span>
                        <span class="win-arrow">→</span>
                        <span class="win-new">${currentBest} ${unit}</span>
                    </div>
                </div>`;
            }
        });
        if (winCount > 0) {
            const suffix = winCount === 1 ? 'תרגיל' : 'תרגילים';
            document.getElementById('win-card-subtitle').innerText = `שיפרת ב-${winCount} ${suffix} לעומת האימון הקודם`;
            winList.innerHTML = html;
            winCard.style.animation = 'none';
            winCard.offsetHeight;
            winCard.style.animation = '';
            winCard.style.display = 'block';
        }
    },

    // ===================== LOG TEXT (Bug #1 Fixed) =====================
    generateLogText: function(historyItem) {
        const pName = historyItem.programTitle || historyItem.program;
        let txt = `סיכום אימון: ${pName}\n`;
        txt += `תאריך: ${historyItem.date} | משך: ${historyItem.duration} דק'\n\n`;
        historyItem.data.forEach(ex => {
            if (ex.sets.length > 0) {
                txt += `✅ ${ex.name}\n`;
                const exDef = this.getExerciseDef(ex.id);
                // Fixed: isTime only for plank/static bodyweight, not all bodyweight
                const isTime = (exDef.settings.unit === 'bodyweight' &&
                    (ex.id.includes('plank') || ex.id.includes('static')));
                const isSingleSide = exDef.settings.isUnilateral;
                ex.sets.forEach((s, i) => {
                    let valStr;
                    if (isTime && s.w === 0) {
                        valStr = `${s.r} שנ׳`;
                    } else {
                        valStr = `${s.w} ק״ג`;
                        if (isSingleSide) valStr += ` (לצד)`;
                        valStr += ` | ${s.r} חזרות`;
                        if (exDef.settings.unit === 'plates') valStr = `${s.w} פלטות | ${s.r} חזרות`;
                        if (s.w === 0) valStr = `משקל גוף | ${s.r} חזרות`;
                    }
                    let feelStr = FEEL_MAP_TEXT[s.feel] || 'טוב';
                    txt += `   סט ${i + 1}: ${valStr} (${feelStr})\n`;
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

    finishAndCopy: function() {
        const summary = this.state.active.summary;
        if (!summary) return;

        const histItem = {
            date: summary.date,
            timestamp: Date.now(),
            program: summary.program,
            programTitle: summary.programTitle,
            data: summary.data,
            duration: summary.duration
        };

        const doSaveAndReload = () => {
            this.state.history.push(histItem);
            this.saveData();
            sync.pushHistory(histItem);
            localStorage.removeItem(CONFIG.KEYS.ACTIVE_WORKOUT);
            window.location.reload();
        };

        const txt = document.getElementById('summary-text').innerText;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).then(doSaveAndReload).catch(doSaveAndReload);
        } else {
            const ta = document.createElement('textarea');
            ta.value = txt;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            doSaveAndReload();
        }
    },

    // ===================== REORDER / SWAP =====================
    openReorder: function() {
        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        const exDef = this.getExerciseDef(exInst.id);
        if (exDef.cat === 'core') {
            this.state.userSelector.mode = 'swap';
            this.renderUserSelector('core');
            document.getElementById('user-sel-title').innerText = "החליפי תרגיל";
            document.getElementById('user-selector-modal').style.display = 'flex';
        } else {
            this.renderReorderList();
            document.getElementById('reorder-modal').style.display = 'flex';
        }
    },

    renderReorderList: function() {
        const list = document.getElementById('reorder-list');
        list.innerHTML = '';
        const futureExercises = this.state.active.sessionExercises.slice(this.state.active.exIdx + 1);
        if (futureExercises.length === 0) {
            list.innerHTML = '<div style="text-align:center; padding:20px;">אין תרגילים נוספים להחלפה</div>';
            return;
        }
        futureExercises.forEach((ex, idx) => {
            const realIndex = this.state.active.exIdx + 1 + idx;
            list.innerHTML += `
            <div class="list-item" onclick="app.selectReorderExercise(${realIndex})">
                <span style="font-weight:700">${ex.name}</span>
                <span style="color:var(--primary)">בחר</span>
            </div>`;
        });
    },

    selectReorderExercise: function(targetIndex) {
        const chosenEx = this.state.active.sessionExercises.splice(targetIndex, 1)[0];
        this.state.active.sessionExercises.splice(this.state.active.exIdx, 0, chosenEx);
        this.closeReorder();
        this.saveActiveState();
        this.loadActiveExercise();
    },

    closeReorder: function() { document.getElementById('reorder-modal').style.display = 'none'; },

    openAddCoreExercise: function() {
        this.state.userSelector.mode = 'add';
        this.renderUserSelector('core');
        document.getElementById('user-sel-title').innerText = "הוסיפי תרגיל";
        document.getElementById('user-selector-modal').style.display = 'flex';
    },

    closeUserSelector: function() { document.getElementById('user-selector-modal').style.display = 'none'; },

    renderUserSelector: function(cat) {
        const list = document.getElementById('user-sel-list');
        list.innerHTML = '';
        let candidates = this.state.exercises.filter(e => e.cat === cat);
        if (this.state.userSelector.mode === 'add') {
            const currentIds = this.state.active.sessionExercises.map(e => e.id);
            candidates = candidates.filter(e => !currentIds.includes(e.id));
        }
        candidates.forEach(e => {
            list.innerHTML += `
            <div class="list-item" onclick="app.userSelectExercise('${e.id}')">
                <span style="font-weight:700">${e.name}</span>
                <span style="color:var(--primary)">+</span>
            </div>`;
        });
    },

    userSelectExercise: function(exId) {
        const newExDef = this.getExerciseDef(exId);
        if (this.state.userSelector.mode === 'swap') {
            this.state.active.sessionExercises[this.state.active.exIdx] = {
                id: exId, name: newExDef.name, sets: 3, rest: 60
            };
            this.loadActiveExercise();
        } else if (this.state.userSelector.mode === 'add') {
            const newExInst = {id: exId, name: newExDef.name, sets: 3, rest: 60};
            this.state.active.sessionExercises.splice(this.state.active.exIdx + 1, 0, newExInst);
            this.nextExercise();
        }
        this.saveActiveState();
        this.closeUserSelector();
    },

    // ===================== ADMIN =====================
    openAdminHome: function() {
        if (this.state.active.on) { alert("לא ניתן להיכנס לניהול בזמן אימון פעיל."); return; }
        document.getElementById('admin-modal').style.display = 'flex';
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
        if (ids.length === 0) list.innerHTML = '<div style="text-align:center; color:#666; padding:20px;">אין תוכניות</div>';
        ids.forEach(pid => {
            const prog = this.state.routines[pid];
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
        this.state.routines[id] = {title: 'תוכנית חדשה', exercises: []};
        this.openAdminEdit(id);
    },

    duplicateProgram: function(pid) {
        const newId = 'prog_' + Date.now();
        const copy = JSON.parse(JSON.stringify(this.state.routines[pid]));
        copy.title += " (עותק)";
        this.state.routines[newId] = copy;
        this.renderAdminList();
    },

    deleteProgram: function(pid) {
        if (confirm("למחוק את התוכנית?")) {
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

    updateProgramTitle: function() {},

    renderEditorList: function() {
        const list = document.getElementById('admin-ex-list');
        list.innerHTML = '';
        const exList = this.state.admin.tempExercises;
        exList.forEach((ex, i) => {
            const hasTip = ex.note ? 'has-tip' : '';
            list.innerHTML += `
            <div class="editor-row">
                <div class="row-top">
                    <div class="row-title">${i + 1}. ${ex.name}</div>
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
                        <div class="step-val">${ex.rest || 60}</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'rest', 15)">+</button>
                    </div>
                </div>
            </div>`;
        });
    },

    updateTempEx: function(i, field, delta) {
        let val = (this.state.admin.tempExercises[i][field] || 0) + delta;
        if (field === 'sets' && val < 1) val = 1;
        if (field === 'rest' && val < 0) val = 0;
        this.state.admin.tempExercises[i][field] = val;
        this.renderEditorList();
    },

    moveEx: function(i, dir) {
        const arr = this.state.admin.tempExercises;
        if ((i === 0 && dir === -1) || (i === arr.length - 1 && dir === 1)) return;
        const temp = arr[i]; arr[i] = arr[i + dir]; arr[i + dir] = temp;
        this.renderEditorList();
    },

    removeEx: function(i) {
        this.state.admin.tempExercises.splice(i, 1);
        this.renderEditorList();
    },

    // ===================== EXERCISE MANAGER =====================
    openExerciseManager: function() {
        document.getElementById('admin-view-home').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
        document.getElementById('ex-mgr-search').value = '';
        this.state.admin.exManagerFilter = 'all';
        this.updateExManagerChips();
        this.renderExerciseManagerList();
    },

    setExManagerFilter: function(cat, btn) {
        this.state.admin.exManagerFilter = cat;
        this.updateExManagerChips();
        this.renderExerciseManagerList();
    },

    updateExManagerChips: function() {
        const map = {'all': 0, 'legs': 1, 'chest': 2, 'back': 3, 'shoulders': 4, 'arms': 5, 'core': 6};
        const idx = map[this.state.admin.exManagerFilter];
        const chips = document.querySelector('#admin-view-ex-manager .chip-container').querySelectorAll('.chip');
        chips.forEach((c, i) => i === idx ? c.classList.add('active') : c.classList.remove('active'));
    },

    renderExerciseManagerList: function() {
        const list = document.getElementById('ex-mgr-list');
        list.innerHTML = '';
        const term = document.getElementById('ex-mgr-search').value.toLowerCase();
        const cat = this.state.admin.exManagerFilter;
        this.state.exercises.filter(e => {
            const matchName = e.name.toLowerCase().includes(term);
            const matchCat = cat === 'all' || e.cat === cat;
            return matchName && matchCat;
        }).forEach(e => {
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
        this.fillExerciseEditor({
            id: newId, name: 'תרגיל חדש', cat: 'other', videoUrl: '',
            settings: {unit: 'kg', step: 2.5, min: 0, max: 100, isUnilateral: false}
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
        if (existingIdx > -1) this.state.exercises[existingIdx] = newEx;
        else this.state.exercises.push(newEx);
        this.saveData();
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
        this.renderExerciseManagerList();
    },

    cancelExerciseEdit: function() {
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
    },

    // ===================== SELECTOR =====================
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
        const map = {'all': 0, 'legs': 1, 'chest': 2, 'back': 3, 'shoulders': 4, 'arms': 5, 'core': 6};
        const idx = map[this.state.admin.selectorFilter];
        const chips = document.querySelector('#admin-view-selector .chip-container').querySelectorAll('.chip');
        chips.forEach((c, i) => i === idx ? c.classList.add('active') : c.classList.remove('active'));
    },

    filterSelector: function() { this.renderSelectorList(); },

    renderSelectorList: function() {
        const list = document.getElementById('selector-list');
        list.innerHTML = '';
        const search = document.getElementById('selector-search').value.toLowerCase();
        const cat = this.state.admin.selectorFilter;
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
        const newEx = {id: bankEx.id, name: bankEx.name, sets: 3, rest: 60, note: '', target: {w: 10, r: 12}};
        this.state.admin.tempExercises.push(newEx);
        this.closeSelector();
        this.renderEditorList();
    },

    getCatLabel: function(c) {
        const map = {legs: 'רגליים', chest: 'חזה', back: 'גב', shoulders: 'כתפיים', arms: 'ידיים', core: 'בטן', other: 'אחר'};
        return map[c] || c;
    },

    // ===================== TIPS =====================
    openTipModal: function(idx) {
        this.state.admin.editTipEx = idx;
        const ex = this.state.admin.tempExercises[idx];
        document.getElementById('tip-input').value = ex.note || '';
        document.getElementById('tip-modal').style.display = 'flex';
    },
    closeTipModal: function() { document.getElementById('tip-modal').style.display = 'none'; },
    saveTip: function() {
        const idx = this.state.admin.editTipEx;
        if (idx !== null) {
            this.state.admin.tempExercises[idx].note = document.getElementById('tip-input').value;
            this.renderEditorList();
        }
        this.closeTipModal();
    },

    // ===================== BACKUP & RESTORE =====================
    exportConfig: function() {
        const data = {type: 'config', ver: CONFIG.VERSION, date: new Date().toLocaleDateString(), routines: this.state.routines, exercises: this.state.exercises};
        this.downloadJSON(data, `gymstart_config_v${CONFIG.VERSION}_${Date.now()}.json`);
    },

    importConfig: function(input) {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                if (json.type !== 'config') { alert("קובץ שגוי."); return; }
                if (confirm("עדכון תוכניות יחליף את ההגדרות ואת מאגר התרגילים. להמשיך?")) {
                    app.state.routines = json.routines;
                    if (json.exercises) app.state.exercises = json.exercises;
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
        const data = {type: 'history', ver: CONFIG.VERSION, history: this.state.history};
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
                if (confirm(`נמצאו ${newHist.length} רשומות. למזג?`)) {
                    app.state.history = [...app.state.history, ...newHist];
                    app.state.history.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
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
        if (confirm("איפוס מלא ימחק הכל. להמשיך?")) {
            localStorage.clear();
            location.reload();
        }
    },

    // ===================== HISTORY DATE HELPERS =====================
    parseDateStr: function(dateStr) {
        if (!dateStr) return new Date();
        const parts = dateStr.split(/[./]/);
        if (parts.length === 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[2]);
            if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
        }
        const dt = new Date(dateStr);
        return isNaN(dt.getTime()) ? new Date() : dt;
    },

    getMonthKey: function(dateStr) {
        const d = this.parseDateStr(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    },

    getCurrentMonthKey: function() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    },

    getWeekStart: function(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay()); // go to Sunday (0)
        return d;
    },

    formatWeekLabel: function(startDate) {
        const start = new Date(startDate);
        const end = new Date(startDate);
        end.setDate(end.getDate() + 6);
        const days = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
        const fmt = (dt) => `${dt.getDate()}.${dt.getMonth() + 1}`;
        return `${days[start.getDay()]} ${fmt(start)} – ${days[end.getDay()]} ${fmt(end)}`;
    },

    getHebrewDayName: function(dateStr) {
        const d = this.parseDateStr(dateStr);
        const days = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
        return days[d.getDay()];
    },

    // ===================== HISTORY — MONTHLY GROUPED =====================
    showHistory: function() {
        this.state.historySelection = [];
        this.updateHistoryActions();
        this.updateWeeksDisplay();
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (this.state.history.length === 0) {
            list.innerHTML = '<div style="text-align:center;color:#555;padding:30px;">אין היסטוריה עדיין</div>';
            this.nav('screen-history');
            return;
        }

        // Group by month (reversed = newest first)
        const byMonth = {};
        [...this.state.history].reverse().forEach((h, rIdx) => {
            const realIdx = this.state.history.length - 1 - rIdx;
            const mk = this.getMonthKey(h.date);
            if (!byMonth[mk]) byMonth[mk] = [];
            byMonth[mk].push({h, realIdx});
        });

        const currentMonth = this.getCurrentMonthKey();
        const sortedMonths = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

        sortedMonths.forEach(monthKey => {
            const isCurrentMonth = monthKey === currentMonth;
            const [year, mon] = monthKey.split('-');
            const monthDate = new Date(parseInt(year), parseInt(mon) - 1, 1);
            const monthLabel = monthDate.toLocaleDateString('he-IL', {month: 'long', year: 'numeric'});

            // Month header
            const headerEl = document.createElement('div');
            headerEl.className = 'month-group-header';
            headerEl.id = `month-group-${monthKey}`;
            headerEl.innerHTML = `<span>${monthLabel}</span><span class="month-arrow">${isCurrentMonth ? '▼' : '▶'}</span>`;
            headerEl.onclick = () => this.toggleMonthGroup(monthKey);
            list.appendChild(headerEl);

            // Month content
            const contentEl = document.createElement('div');
            contentEl.id = `month-content-${monthKey}`;
            contentEl.style.display = isCurrentMonth ? 'block' : 'none';

            // Group by week within month
            const byWeek = {};
            byMonth[monthKey].forEach(({h, realIdx}) => {
                const d = this.parseDateStr(h.date);
                const ws = this.getWeekStart(d);
                const wk = ws.toISOString().substring(0, 10);
                if (!byWeek[wk]) byWeek[wk] = {start: ws, items: []};
                byWeek[wk].items.push({h, realIdx});
            });

            const sortedWeeks = Object.keys(byWeek).sort((a, b) => b.localeCompare(a));
            sortedWeeks.forEach(weekKey => {
                // Week separator
                const weekLabel = this.formatWeekLabel(byWeek[weekKey].start);
                const sepEl = document.createElement('div');
                sepEl.className = 'week-separator';
                sepEl.innerHTML = `<span>${weekLabel}</span>`;
                contentEl.appendChild(sepEl);

                // Items in this week
                byWeek[weekKey].items.forEach(({h, realIdx}) => {
                    const pName = h.programTitle || h.program;
                    const dayName = this.getHebrewDayName(h.date);
                    const whatsappBadge = h.source === 'whatsapp'
                        ? '<span style="margin-right:6px;font-size:0.78rem;color:#888;">📋 מוואטסאפ</span>' : '';
                    const itemEl = document.createElement('div');
                    itemEl.className = 'hist-item-row';
                    itemEl.innerHTML = `
                        <div style="display:flex; align-items:center">
                            <input type="checkbox" class="custom-chk" data-idx="${realIdx}" onchange="app.toggleHistorySelection(${realIdx}, this)">
                        </div>
                        <div style="flex:1" onclick="app.showHistoryDetail(${realIdx})">
                            <div style="display:flex; justify-content:space-between">
                                <span style="font-weight:700; color:var(--text)">${h.date} <span style="color:#666;font-size:0.85rem;">${dayName}</span></span>
                                <span class="badge" style="background:#333; color:white; font-weight:400; font-size:0.75rem">${pName}</span>
                            </div>
                            <div style="font-size:0.85rem; color:var(--text-sec); margin-top:5px;">
                                ${(h.data || []).length} תרגילים • ${h.duration || '?'} דק'${whatsappBadge}
                            </div>
                        </div>`;
                    contentEl.appendChild(itemEl);
                });
            });
            list.appendChild(contentEl);
        });

        this.nav('screen-history');
    },

    toggleMonthGroup: function(monthKey) {
        const contentEl = document.getElementById(`month-content-${monthKey}`);
        const headerEl = document.getElementById(`month-group-${monthKey}`);
        const arrow = headerEl.querySelector('.month-arrow');
        const isOpen = contentEl.style.display !== 'none';
        contentEl.style.display = isOpen ? 'none' : 'block';
        arrow.textContent = isOpen ? '▶' : '▼';
    },

    toggleHistorySelection: function(idx, el) {
        if (el.checked) this.state.historySelection.push(idx);
        else this.state.historySelection = this.state.historySelection.filter(i => i !== idx);
        this.updateHistoryActions();
    },

    updateHistoryActions: function() {
        const btn = document.getElementById('btn-del-selected');
        btn.disabled = this.state.historySelection.length === 0;
        btn.innerText = this.state.historySelection.length > 0 ? `מחק (${this.state.historySelection.length})` : "מחק";
    },

    selectAllHistory: function() {
        const inputs = document.querySelectorAll('#history-list .custom-chk');
        const totalItems = this.state.history.length;
        const allSelected = this.state.historySelection.length === totalItems && totalItems > 0;
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
        if (this.state.historySelection.length === 0) { alert("לא נבחר אימון"); return; }
        let fullTxt = "";
        const sortedSel = [...this.state.historySelection].sort((a, b) => a - b);
        sortedSel.forEach((idx, i) => {
            const h = this.state.history[idx];
            fullTxt += this.generateLogText(h);
            if (i < sortedSel.length - 1) fullTxt += "----------------\n\n";
        });
        this.copyText(fullTxt);
    },

    // ===================== COPY RANGE =====================
    copyRange: function(type) {
        let items = [];
        if (type === 'weeks') {
            const weeks = this.state.historyWeeksVal || 1;
            const cutoff = Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000);
            items = this.state.history.filter(h => (h.timestamp || 0) >= cutoff);
        } else if (type === 'month') {
            const monthKey = this.getCurrentMonthKey();
            items = this.state.history.filter(h => this.getMonthKey(h.date) === monthKey);
        } else {
            items = this.state.history;
        }
        if (items.length === 0) { alert("אין אימונים בטווח הנבחר"); return; }
        let fullTxt = '';
        items.forEach((h, i) => {
            fullTxt += this.generateLogText(h);
            if (i < items.length - 1) fullTxt += '----------------\n\n';
        });
        this.copyText(fullTxt);
    },

    changeWeeks: function(delta) {
        const newVal = (this.state.historyWeeksVal || 1) + delta;
        if (newVal < 1 || newVal > 8) return;
        this.state.historyWeeksVal = newVal;
        this.updateWeeksDisplay();
    },

    updateWeeksDisplay: function() {
        const el = document.getElementById('weeks-display');
        if (el) el.textContent = this.state.historyWeeksVal || 1;
    },

    // ===================== HISTORY DETAIL (Bug #1 Fixed) =====================
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
            // Fixed isTime: only plank/static are stopwatch
            const isTime = (exDef.settings.unit === 'bodyweight' &&
                (ex.id.includes('plank') || ex.id.includes('static')));
            const isSingleSide = exDef.settings.isUnilateral;

            ex.sets.forEach((s, si) => {
                let valStr;
                if (isTime && s.w === 0) {
                    valStr = `${s.r} שנ׳`;
                } else {
                    valStr = `${s.w} ק״ג`;
                    if (isSingleSide) valStr += ' (לצד)';
                    valStr += ` | ${s.r} חזרות`;
                    if (exDef.settings.unit === 'plates') valStr = `${s.w} פלטות | ${s.r} חזרות`;
                    if (s.w === 0) valStr = `משקל גוף | ${s.r} חזרות`;
                }
                let feelStr = FEEL_MAP_TEXT[s.feel] || 'טוב';
                html += `<div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-top:5px; border-bottom:1px dashed #333; padding-bottom:5px">
                    <span>סט ${si + 1} <small style="color:#777">(${feelStr})</small></span>
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
        if (confirm("למחוק את האימון?")) {
            const item = this.state.history[this.state.viewHistoryIdx];
            const ts = item ? item.timestamp : null;
            this.state.history.splice(this.state.viewHistoryIdx, 1);
            this.saveData();
            if (ts) sync.deleteHistoryItem(ts);
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
    },

    // ===================== PASTE (WhatsApp) IMPORT =====================
    openPasteImport: function() {
        document.getElementById('paste-import-textarea').value = '';
        document.getElementById('paste-import-modal').style.display = 'flex';
    },

    closePasteImport: function() {
        document.getElementById('paste-import-modal').style.display = 'none';
    },

    parsePasteInput: function() {
        const text = document.getElementById('paste-import-textarea').value.trim();
        if (!text) { alert("הדבקי טקסט קודם"); return; }
        const parsed = this.parseLogText(text);
        if (!parsed.date || !parsed.data || parsed.data.length === 0) {
            alert("לא ניתן לפרסר את הטקסט. ודאי שהפורמט תקין.");
            return;
        }
        this.state._parsedImport = parsed;
        this.renderPasteConfirm(parsed);
        document.getElementById('paste-import-modal').style.display = 'none';
        document.getElementById('paste-confirm-modal').style.display = 'flex';
    },

    renderPasteConfirm: function(parsed) {
        const content = document.getElementById('paste-confirm-content');
        let html = `<div style="padding:12px; background:#111; border-radius:10px; margin-bottom:12px; border:1px solid #333;">
            <div style="font-weight:700;">${parsed.programTitle || 'אימון'}</div>
            <div style="color:#888; font-size:0.9rem; margin-top:3px;">${parsed.date} | ${parsed.duration || '?'} דק'</div>
        </div>`;

        parsed.data.forEach(ex => {
            const icon = ex.isImported ? '⚠' : '✓';
            const color = ex.isImported ? '#ffaa00' : '#00ff66';
            html += `<div style="background:var(--bg-card); padding:12px; border-radius:10px; margin-bottom:8px; border:1px solid #222;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span style="font-weight:700;">${ex.name}</span>
                    <span style="color:${color}; font-size:1rem;">${icon}</span>
                </div>`;
            (ex.sets || []).forEach((s, i) => {
                html += `<div style="font-size:0.82rem; color:#888; margin-top:3px;">סט ${i + 1}: ${this.formatSetForDisplay(s, ex.id)}</div>`;
            });
            html += `</div>`;
        });

        const hasUnknown = parsed.data.some(ex => ex.isImported);
        if (hasUnknown) {
            html += `<div style="font-size:0.82rem; color:#ffaa00; margin-top:8px;">⚠ תרגילים עם אייקון זה אינם במאגר ויישמרו עם ID מיובא</div>`;
        }
        content.innerHTML = html;
    },

    savePasteImport: function() {
        const parsed = this.state._parsedImport;
        if (!parsed) return;

        const d = this.parseDateStr(parsed.date);
        const ts = isNaN(d.getTime()) ? Date.now() : d.getTime();

        const item = {
            date: parsed.date,
            timestamp: ts,
            program: 'whatsapp_import',
            programTitle: parsed.programTitle || 'ייבוא מוואטסאפ',
            data: parsed.data,
            duration: parsed.duration || 0,
            source: 'whatsapp'
        };

        this.state.history.push(item);
        this.state.history.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        this.saveData();
        sync.pushHistory(item);

        document.getElementById('paste-confirm-modal').style.display = 'none';
        this.state._parsedImport = null;
        alert("האימון נשמר בהצלחה!");
        this.showHistory();
    },

    // ===================== LOG TEXT PARSER (Reverse of generateLogText) =====================
    parseLogText: function(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const result = {programTitle: '', date: '', duration: 0, data: []};
        let currentEx = null;

        for (const line of lines) {
            if (line.startsWith('סיכום אימון:')) {
                result.programTitle = line.replace('סיכום אימון:', '').trim();
            } else if (line.startsWith('תאריך:')) {
                const parts = line.split('|');
                result.date = parts[0].replace('תאריך:', '').trim();
                if (parts[1]) {
                    const durMatch = parts[1].match(/(\d+)/);
                    if (durMatch) result.duration = parseInt(durMatch[1]);
                }
            } else if (line.startsWith('✅')) {
                const exName = line.replace('✅', '').trim();
                const found = this.state.exercises.find(e => e.name === exName);
                currentEx = {
                    name: exName,
                    id: found ? found.id : ('imported_' + exName.replace(/[\s]/g, '_')),
                    isImported: !found,
                    sets: []
                };
                result.data.push(currentEx);
            } else if (/^סט\s*\d+:/.test(line) && currentEx) {
                const setData = this.parseSetLine(line, currentEx.id);
                if (setData) currentEx.sets.push(setData);
            }
        }
        return result;
    },

    parseSetLine: function(line, exId) {
        // Extract feel
        const feelMatch = line.match(/\(([^)]+)\)\s*$/);
        const feelStr = feelMatch ? feelMatch[1] : 'בינוני';
        const feelMap = {'קל': 'easy', 'בינוני': 'good', 'קשה': 'hard', 'טוב': 'good'};
        const feel = feelMap[feelStr] || 'good';

        // Remove "סט N: " prefix
        const content = line.replace(/^סט\s*\d+:\s*/, '').replace(/\([^)]*\)\s*$/, '').trim();

        let w = 0, r = 0;

        // Time: "182 שנ׳" or "182 שנ'"
        if (content.includes('שנ׳') || content.includes("שנ'")) {
            const m = content.match(/(\d+)/);
            if (m) r = parseInt(m[1]);
            return {w: 0, r, feel};
        }

        const pipeIdx = content.indexOf('|');
        if (pipeIdx === -1) return null;

        const weightPart = content.substring(0, pipeIdx).trim();
        const repPart = content.substring(pipeIdx + 1).trim();

        const repMatch = repPart.match(/(\d+)/);
        r = repMatch ? parseInt(repMatch[1]) : 0;

        if (weightPart === 'משקל גוף') {
            w = 0;
        } else if (weightPart.includes('פלטות')) {
            const m = weightPart.match(/(\d+(?:\.\d+)?)/);
            w = m ? parseFloat(m[1]) : 0;
        } else {
            const m = weightPart.match(/(\d+(?:\.\d+)?)/);
            w = m ? parseFloat(m[1]) : 0;
        }

        return {w, r, feel};
    },

    formatSetForDisplay: function(s, exId) {
        if (s.w === 0 && s.r > 30) return `${s.r} שנ׳`;
        if (s.w === 0) return `משקל גוף | ${s.r} חזרות`;
        const exDef = this.getExerciseDef(exId);
        if (exDef && exDef.settings && exDef.settings.unit === 'plates') return `${s.w} פלטות | ${s.r} חזרות`;
        return `${s.w} ק״ג | ${s.r} חזרות`;
    }

};

window.addEventListener('DOMContentLoaded', () => app.init());
