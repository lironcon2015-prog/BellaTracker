/**
 * GYMSTART V1.8.2
 * - unit:'time' replaces plank/static name detection
 * - Monthly history grouping
 * - Copy by range (month/weeks)
 * - checkForUpdate()
 */

const CONFIG = {
    KEYS: {
        ROUTINES: 'gymstart_v1_7_routines',
        HISTORY: 'gymstart_beta_02_history',
        EXERCISES: 'gymstart_v1_7_exercises_bank',
        ACTIVE_WORKOUT: 'gymstart_active_workout_state'
    },
    VERSION: '1.8.2'
};

const CURRENT_VERSION = '1.8.2-24'; // חייב להיות זהה ל-version.json

const FEEL_MAP_TEXT = { 'easy': 'קל', 'good': 'בינוני', 'hard': 'קשה' };

// BASE EXERCISES — plank/side_plank משודרגים ל-unit:'time'
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
    // core — plank/side_plank = time, שאר = bodyweight
    { id: 'plank', name: 'פלאנק (סטטי)', cat: 'core', settings: {unit:'time', step:0, min:0, max:0} },
    { id: 'side_plank', name: 'פלאנק צידי', cat: 'core', settings: {unit:'time', step:0, min:0, max:0} },
    { id: 'bicycle', name: 'בטן אופניים', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'knee_raise', name: 'הרמת ברכיים', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} },
    { id: 'crunches', name: 'כפיפות בטן', cat: 'core', settings: {unit:'bodyweight', step:0, min:0, max:0} }
];

const DEFAULT_ROUTINES_V17 = {
    'A': { title: 'רגליים וגב (A)', exercises:[ {id:'goblet', sets:3, rest:90}, {id:'leg_press', sets:3}, {id:'lat_pull', sets:3} ] },
    'B': { title: 'חזה וכתפיים (B)', exercises:[ {id:'chest_press', sets:3}, {id:'shoulder_press', sets:3}, {id:'plank', sets:3} ] }
};

// ── Range Copy State ──────────────────────────────────────────────────────────
let _rangeTab = 'month';
let _rangeSelectedMonth = null;
let _rangeSelectedWeeks = null;

const app = {
    state: {
        routines: {},
        history:[],
        exercises:[],
        currentProgId: null,
        active: {
            on: false,
            sessionExercises:[],
            exIdx: 0, setIdx: 1, totalSets: 3,
            log:[],
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
            tempExercises:[], editingExId: null
        },
        userSelector: { mode: null },
        historySelection:[],
        viewHistoryIdx: null,
        activeProfile: 'female',
        authLevel: 0
    },

    init: function() {
        try {
            this.initProfile();
            this.loadData();
            this.checkActiveWorkout();
            // badge למאמן — רק אחרי "שחזר מהענן", לא אחרי שמירה רגילה של אימון
            if (localStorage.getItem('gymstart_check_ach_on_load')) {
                localStorage.removeItem('gymstart_check_ach_on_load');
                this.checkUnacknowledgedAchievements();
            }
            this.renderHome();
            this.renderProgramSelect();
            if(!this.state.tempActive) this.nav('screen-home');
            this.applyProfileTheme();
        } catch (e) {
            console.error(e);
            alert("שגיאה בטעינת נתונים.");
        }
    },

    loadData: function() {
        const keys = this.getActiveKeys();
        const h = localStorage.getItem(keys.HISTORY);
        this.state.history = h ? JSON.parse(h) :[];

        const r = localStorage.getItem(keys.ROUTINES);
        let loadedRoutines = r ? JSON.parse(r) : null;
        if (!loadedRoutines) {
            if (this.state.activeProfile === 'male') {
                // פרופיל זכר מתחיל ריק — אין תוכניות ברירת מחדל
                this.state.routines = {};
            } else {
                this.state.routines = JSON.parse(JSON.stringify(DEFAULT_ROUTINES_V17));
                for(const pid in this.state.routines) {
                    this.state.routines[pid].exercises.forEach(ex => {
                        const bankEx = BASE_BANK_INIT.find(b => b.id === ex.id);
                        if(bankEx) { ex.name = bankEx.name; ex.unit = bankEx.settings.unit; ex.cat = bankEx.cat; }
                    });
                }
            }
        } else {
            this.state.routines = loadedRoutines;
        }

        const e = localStorage.getItem(CONFIG.KEYS.EXERCISES);
        if(e) {
            this.state.exercises = JSON.parse(e);
        } else {
            this.state.exercises = JSON.parse(JSON.stringify(BASE_BANK_INIT));
            this.saveData();
        }
    },

    saveData: function() {
        const keys = this.getActiveKeys();
        localStorage.setItem(keys.ROUTINES, JSON.stringify(this.state.routines));
        localStorage.setItem(keys.HISTORY, JSON.stringify(this.state.history));
        localStorage.setItem(CONFIG.KEYS.EXERCISES, JSON.stringify(this.state.exercises));
    },

    /* --- PROFILE & AUTH --- */

    getActiveKeys: function() {
        const p = this.state.activeProfile;
        return {
            ROUTINES: p === 'male' ? 'gymstart_routines_male' : CONFIG.KEYS.ROUTINES,
            HISTORY:  p === 'male' ? 'gymstart_history_male'  : CONFIG.KEYS.HISTORY
        };
    },

    initProfile: function() {
        const level = parseInt(localStorage.getItem('gymstart_auth_level') || '0');
        this.state.authLevel = level;
        if (level === 0) {
            this.state.activeProfile = 'female';
        } else if (level === 1) {
            this.state.activeProfile = 'male';
        } else if (level === 2) {
            this.state.activeProfile = localStorage.getItem('gymstart_active_profile') || 'female';
        }
    },

    applyProfileTheme: function() {
        const isMale = this.state.activeProfile === 'male';
        document.body.classList.toggle('theme-male', isMale);

        // החלפת אייקון דינמית (favicon + apple-touch-icon)
        const iconHref = isMale ? './icon-male.png' : './icon.png';
        document.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"]').forEach(el => {
            el.href = iconHref;
        });

        // ברכה ראשית
        const greeting = document.getElementById('greeting');
        if (greeting) {
            greeting.textContent = isMale ? 'ברוך הבא' : 'ברוכה הבאה';
            const sub = greeting.nextElementSibling;
            if (sub) sub.textContent = isMale ? 'מוכן לאימון?' : 'מוכנה לאימון?';
        }
        // placeholder הערת מאמן
        const tipInput = document.getElementById('tip-input');
        if (tipInput) tipInput.placeholder = isMale ? 'כתוב הערה למתאמן...' : 'כתוב הערה למתאמנת...';

        // מודל הישגים
        const achP = document.querySelector('#achievements-modal > .oled-modal > p, #achievements-modal .oled-modal p');
        if (achP) achP.textContent = isMale ? 'המתאמן השיג את היעדים הבאים:' : 'המתאמנת השיגה את היעדים הבאים:';

        // coach update sheet
        const coachP = document.querySelector('#coach-update-sheet p');
        if (coachP) coachP.textContent = isMale ? 'טעֵן קונפיגורציה שנשלחה מהמאמן' : 'טעני קונפיגורציה שנשלחה מהמאמן';
        const coachBtns = document.querySelectorAll('#coach-update-sheet .btn-primary, #coach-update-sheet .btn-outline');
        if (coachBtns.length >= 2) {
            coachBtns[0].textContent = isMale ? '☁️ טעֵן מהענן' : '☁️ טעני מהענן';
            coachBtns[1].textContent = isMale ? '📂 טעֵן מקובץ' : '📂 טעני מקובץ';
        }

        // כפתורי התחל/התחילי אימון
        const btnStartHome = document.getElementById('btn-start-home');
        if (btnStartHome) btnStartHome.textContent = isMale ? 'התחל אימון' : 'התחילי אימון';
        const btnStartOverview = document.getElementById('btn-start-overview');
        if (btnStartOverview) btnStartOverview.textContent = isMale ? 'התחל אימון ⚡' : 'התחילי אימון ⚡';

        // כותרת בחירת תוכנית
        const progSelectTitle = document.getElementById('prog-select-title');
        if (progSelectTitle) progSelectTitle.textContent = isMale ? 'בחר תוכנית' : 'בחרי תוכנית';

        // כפתור הוסף תרגיל בטן
        const btnAddCore = document.getElementById('btn-add-core');
        if (btnAddCore) btnAddCore.textContent = isMale ? '+ הוסף תרגיל בטן' : '+ הוסיפי תרגיל בטן';

        // גיבוי ושחזור היסטוריה
        const backupP = document.querySelector('#history-backup-sheet > p');
        if (backupP) backupP.textContent = isMale ? 'בחר יעד הגיבוי' : 'בחרי יעד הגיבוי';
        const restoreP = document.querySelector('#history-restore-sheet > p');
        if (restoreP) restoreP.textContent = isMale ? 'בחר מקור השחזור' : 'בחרי מקור השחזור';
    },

    renderAuthPanel: function() {
        const panel = document.getElementById('auth-panel');
        if (!panel) return;
        const level = this.state.authLevel;
        const p = this.state.activeProfile;
        if (level === 0) {
            panel.innerHTML = `
                <div class="oled-card compact">
                    <p style="font-size:0.82rem;color:var(--text-sec);margin:0 0 12px;">הזן קוד כדי לשנות פרופיל</p>
                    <div style="display:flex;gap:8px;">
                        <input type="password" id="auth-pin-input" class="minimal-input" placeholder="קוד גישה" maxlength="8" inputmode="numeric" style="flex:1;direction:ltr;">
                        <button class="btn-primary-small" onclick="app.submitAuthCode()">אשר</button>
                    </div>
                </div>`;
        } else if (level === 1) {
            panel.innerHTML = `
                <div class="oled-card compact" style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.2em;">👤</span>
                    <span style="color:var(--primary);">מחובר כמתאמן</span>
                </div>`;
        } else if (level === 2) {
            panel.innerHTML = `
                <div class="oled-card compact">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <span style="font-weight:600;">פרופיל פעיל</span>
                        <span style="font-size:0.8rem;color:var(--text-sec);">מצב מאמן 🔑</span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="app.switchProfile('female')" style="flex:1;padding:10px 4px;border-radius:10px;border:1.5px solid ${p==='female'?'var(--primary)':'rgba(255,255,255,0.15)'};background:${p==='female'?'var(--primary-dim)':'transparent'};color:${p==='female'?'var(--primary)':'#aaa'};font-family:var(--font);font-size:0.88rem;cursor:pointer;">👩 נקבה</button>
                        <button onclick="app.switchProfile('male')" style="flex:1;padding:10px 4px;border-radius:10px;border:1.5px solid ${p==='male'?'var(--primary)':'rgba(255,255,255,0.15)'};background:${p==='male'?'var(--primary-dim)':'transparent'};color:${p==='male'?'var(--primary)':'#aaa'};font-family:var(--font);font-size:0.88rem;cursor:pointer;">👨 זכר</button>
                    </div>
                </div>`;
        }
    },

    submitAuthCode: function() {
        const PIN_MALE  = '1111';
        const PIN_ADMIN = '9999';
        const input = document.getElementById('auth-pin-input');
        if (!input) return;
        const code = input.value.trim();
        if (code === PIN_ADMIN) {
            localStorage.setItem('gymstart_auth_level', '2');
            this.state.authLevel = 2;
            this.state.activeProfile = localStorage.getItem('gymstart_active_profile') || 'female';
            this.renderAuthPanel();
            this.applyProfileTheme();
            alert('מצב מאמן פעיל. ניתן לעבור בין פרופילים.');
        } else if (code === PIN_MALE) {
            if (confirm('מעבר לפרופיל מתאמן. הפעולה קבועה במכשיר זה. להמשיך?')) {
                localStorage.setItem('gymstart_auth_level', '1');
                localStorage.setItem('gymstart_active_profile', 'male');
                location.reload();
            }
        } else {
            alert('קוד שגוי.');
            input.value = '';
        }
    },

    switchProfile: function(profile) {
        if (this.state.authLevel < 2) return;
        this.saveData();
        localStorage.setItem('gymstart_active_profile', profile);
        location.reload();
    },

    // ── Helper: האם תרגיל הוא מדידת זמן ──────────────────────────────────────
    _isTimeUnit: function(exId) {
        const def = this.getExerciseDef(exId);
        return def.settings.unit === 'time';
    },

    // ── Helper: פורמט תצוגת סט ────────────────────────────────────────────────
    _formatSetDisplay: function(exId, set) {
        const def = this.getExerciseDef(exId);
        const unit = def.settings.unit;
        const isSingleSide = def.settings.isUnilateral;

        if (unit === 'time') {
            return `${set.r} שנ׳`;
        }
        if (unit === 'bodyweight') {
            return `משקל גוף | ${set.r} חזרות`;
        }
        if (unit === 'plates') {
            return `${set.w} פלטות | ${set.r} חזרות`;
        }
        // kg
        let str = `${set.w} ק״ג`;
        if (isSingleSide) str += ' (לצד)';
        str += ` | ${set.r} חזרות`;
        return str;
    },

    /* --- PERSISTENCE & RESUME --- */
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
            this._startWorkoutTimer();
            this.nav('screen-active');
        }
    },

    discardWorkout: function() {
        localStorage.removeItem(CONFIG.KEYS.ACTIVE_WORKOUT);
        this.state.tempActive = null;
        document.getElementById('resume-modal').style.display = 'none';
        this.nav('screen-home');
    },

    /* --- NAVIGATION --- */
    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        const backBtn = document.getElementById('nav-back');
        const adminBtn = document.getElementById('btn-admin-home');
        if (screenId === 'screen-home') {
            backBtn.style.visibility = 'hidden';
            if(adminBtn) adminBtn.style.display = 'flex';
            this.stopAllTimers();
            this._stopWorkoutTimer();
            this.state.active.on = false;
        } else {
            backBtn.style.visibility = 'visible';
            if(adminBtn) adminBtn.style.display = 'none';
        }
    },

    goBack: function() {
        const activeScreen = document.querySelector('.screen.active').id;
        if (activeScreen !== 'screen-active') {
            if (activeScreen === 'screen-overview') this.nav('screen-program-select');
            else this.nav('screen-home');
            return;
        }

        // ── חזרה בתוך פלואו האימון ──
        this.stopRestTimer();
        const decisionVisible = document.getElementById('decision-buttons').style.display !== 'none';
        const exIdx = this.state.active.exIdx;
        const setIdx = this.state.active.setIdx;

        if (decisionVisible) {
            // אחרי סיום כל הסטים → חזרה לסט האחרון, ביטול הסט האחרון
            this._undoLastSet();
            this.state.active.setIdx = this.state.active.totalSets;
            this._restoreLoggingUI();
        } else if (setIdx > 1) {
            // סט > 1 → חזרה לסט הקודם, ביטול הסט האחרון
            this._undoLastSet();
            this.state.active.setIdx--;
            this._restoreLoggingUI();
        } else if (exIdx === 0) {
            // תרגיל ראשון, סט ראשון — המקרה היחיד שיוצאים
            if (confirm("לצאת מהאימון?")) {
                this._stopWorkoutTimer();
                this.stopAllTimers();
                this.state.active.on = false;
                localStorage.removeItem(CONFIG.KEYS.ACTIVE_WORKOUT);
                this.nav('screen-overview');
            }
            return;
        } else {
            // סט ראשון של תרגיל מאוחר → חזרה לתרגיל הקודם במצב החלטה
            this.state.active.exIdx--;
            const prevInst = this.state.active.sessionExercises[this.state.active.exIdx];
            this.state.active.setIdx = prevInst.sets || 3;
            this.loadActiveExercise();
            this._showDecisionUI();
        }
        this.saveActiveState();
    },

    // מחיקת הסט האחרון שנרשם לתרגיל הנוכחי
    _undoLastSet: function() {
        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        const logIdx = this.state.active.log.findIndex(l => l.id === exInst.id);
        if (logIdx !== -1) {
            this.state.active.log[logIdx].sets.pop();
            if (this.state.active.log[logIdx].sets.length === 0) {
                this.state.active.log.splice(logIdx, 1);
            }
        }
    },

    // שחזור ממשק תיעוד סט (מסתיר decision-buttons, מציג btn-finish)
    _restoreLoggingUI: function() {
        document.getElementById('decision-buttons').style.display = 'none';
        document.getElementById('next-ex-preview').style.display = 'none';
        document.getElementById('btn-add-core').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'flex';
        document.getElementById('rest-timer-area').style.display = 'none';
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
        const reorderBtn = document.getElementById('btn-reorder');
        reorderBtn.style.display = this.state.active.setIdx === 1 ? 'block' : 'none';
        this.state.active.feel = 'good';
        this.updateFeelUI();
    },

    // הצגת מסך החלטה (אחרי כל סטים) לתרגיל הנוכחי
    _showDecisionUI: function() {
        document.getElementById('btn-reorder').style.display = 'none';
        document.getElementById('btn-finish').style.display = 'none';
        document.getElementById('rest-timer-area').style.display = 'none';
        document.getElementById('decision-buttons').style.display = 'flex';
        const nextEx = this.state.active.sessionExercises[this.state.active.exIdx + 1];
        const nextEl = document.getElementById('next-ex-preview');
        nextEl.innerText = nextEx ? `הבא בתור: ${nextEx.name}` : "הבא בתור: סיום אימון";
        nextEl.style.display = 'block';
        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        const exDef = this.getExerciseDef(exInst.id);
        const addBtn = document.getElementById('btn-add-core');
        if (addBtn) addBtn.style.display = exDef.cat === 'core' ? 'block' : 'none';
        document.getElementById('set-badge').innerText = `סט ${this.state.active.totalSets} / ${this.state.active.totalSets}`;
    },

    /* --- RENDERING --- */
    renderProgramSelect: function() {
        const container = document.getElementById('prog-list-container');
        container.innerHTML = '';
        const ids = Object.keys(this.state.routines);
        if(ids.length === 0) {
            container.innerHTML = '<div class="gs-empty-msg">אין תוכניות זמינות.</div>';
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
            const exDef = this.getExerciseDef(ex.id);
            const unit = exDef.settings.unit;
            const unitLabel = unit === 'time' ? 'זמן' :
                              unit === 'bodyweight' ? 'משקל גוף' :
                              unit === 'plates' ? 'פלטות' : 'ק״ג';
            // חיווי יעד מאמן
            const hasTarget = (ex.target?.w || ex.target?.r) && unit !== 'time';
            let targetLine = '';
            if (hasTarget) {
                const parts = [];
                if (ex.target?.w && unit !== 'bodyweight') {
                    const uLabel = unit === 'plates' ? 'פלטות' : 'ק״ג';
                    parts.push(`${ex.target.w} ${uLabel}`);
                }
                if (ex.target?.r) parts.push(`${ex.target.r} חז'`);
                if (parts.length) targetLine = `<div class="overview-target-line"><span class="tl-dot"></span>יעד מאמן: ${parts.join(' × ')}</div>`;
            }
            const targetClass = hasTarget ? 'has-target' : '';
            const numClass = hasTarget ? 'has-target' : '';
            list.innerHTML += `<div class="list-item ${targetClass}">
                <div style="display:flex;align-items:center;gap:12px;flex:1;">
                    <span class="overview-num ${numClass}">${i+1}</span>
                    <div>
                        <div class="overview-ex-name">${ex.name}</div>
                        <div class="overview-ex-sub">${ex.sets} סטים • ${unitLabel}</div>
                        ${targetLine}
                    </div>
                </div>
                <span class="overview-sets-tag">${ex.sets}×</span>
            </div>`;
        });
    },

    renderHome: function() {
        // אימון אחרון
        const lastEl = document.getElementById('last-workout-display');
        if (this.state.history.length > 0) {
            const last = this.state.history[this.state.history.length - 1];
            const displayName = last.programTitle || last.program;
            lastEl.innerText = `${last.date} (${displayName})`;
        } else {
            lastEl.innerText = "טרם בוצע";
        }

        // ── Dashboard ──
        const weekly  = this.calcWeeklyWorkouts();
        const target  = this._getWeeklyTarget();
        const streak  = this.calcStreak();
        const total   = this.state.history.length;
        const days    = this._calcDaysSince();
        const avg     = this._calcAvgTime();

        // כרטיס 1: אימונים + עקביות
        const pct    = Math.min(100, Math.round(weekly / target * 100));
        const isFull = weekly >= target;
        const wv = document.getElementById('home-weekly-val');
        wv.textContent = weekly;
        wv.className = 'dash-stat-val' + (isFull ? ' dash-val-full' : '');
        document.getElementById('home-weekly-sub').textContent = 'מתוך ' + target;
        const bar = document.getElementById('home-weekly-bar');
        bar.style.width = pct + '%';
        bar.className = 'dash-progress-fill' + (isFull ? ' full' : '');
        document.getElementById('home-streak-val').textContent = streak;

        // streak badge
        const badge = document.getElementById('home-streak-badge');
        badge.style.display = streak > 0 ? 'inline-flex' : 'none';
        document.getElementById('home-streak-num').textContent = streak;

        // כרטיס 2: ימים מאז + סה"כ + ממוצע
        document.getElementById('home-days-since').textContent   = days !== null ? days : '—';
        document.getElementById('home-total-workouts').textContent = total;
        const avgEl = document.getElementById('home-avg-time');
        avgEl.innerHTML = avg !== null ? `${avg}<span class="dash-stat-unit">דק׳</span>` : '—';
    },

    calcStreak: function() {
        if (!this.state.history.length) return 0;
        // בונה מפה: weekKey → מספר אימונים
        const weekMap = {};
        this.state.history.forEach(h => {
            const wk = this._getWeekKey(this._parseDateStr(h.date));
            weekMap[wk] = (weekMap[wk] || 0) + 1;
        });
        const today = new Date(); today.setHours(0,0,0,0);
        // אם שבוע נוכחי עם <2 אימונים — מתחיל מהשבוע הקודם
        let check = new Date(today);
        if ((weekMap[this._getWeekKey(check)] || 0) < 2) {
            check.setDate(check.getDate() - 7);
        }
        let streak = 0;
        while ((weekMap[this._getWeekKey(check)] || 0) >= 2) {
            streak++;
            check.setDate(check.getDate() - 7);
        }
        return streak;
    },

    _getWeekKey: function(d) {
        // מחזיר מזהה שבוע ישראלי (ראשון-שבת): YYYY-MM-DD של ה-ראשון
        const day = new Date(d); day.setHours(0,0,0,0);
        const sun = new Date(day); sun.setDate(day.getDate() - day.getDay());
        return sun.getFullYear() + '-' + String(sun.getMonth()+1).padStart(2,'0') + '-' + String(sun.getDate()).padStart(2,'0');
    },

    _parseDateStr: function(dateStr) {
        // תומך בפורמט DD/MM/YYYY וגם DD.MM.YYYY
        const p = dateStr.split(/[\/\.]/);
        return new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
    },

    calcWeeklyWorkouts: function() {
        const today = new Date(); today.setHours(23,59,59,999);
        const sun   = new Date(today); sun.setDate(today.getDate() - today.getDay()); sun.setHours(0,0,0,0);
        return this.state.history.filter(h => {
            const d = this._parseDateStr(h.date);
            return d >= sun && d <= today;
        }).length;
    },

    _calcDaysSince: function() {
        if (!this.state.history.length) return null;
        const last = this._parseDateStr(this.state.history[this.state.history.length - 1].date);
        const today = new Date(); today.setHours(0,0,0,0); last.setHours(0,0,0,0);
        return Math.round((today - last) / 86400000);
    },

    _calcAvgTime: function() {
        // duration נשמר בדקות
        const withTime = this.state.history.filter(h => h.duration > 0);
        if (!withTime.length) return null;
        return Math.round(withTime.reduce((s,h) => s + h.duration, 0) / withTime.length);
    },

    _getWeeklyTarget: function() {
        const key = this.state.activeProfile === 'male' ? 'gymstart_v1_settings_male' : 'gymstart_v1_settings';
        try { return JSON.parse(localStorage.getItem(key) || '{}').weeklyTarget || 3; }
        catch(e) { return 3; }
    },

    _setWeeklyTarget: function(n) {
        const key = this.state.activeProfile === 'male' ? 'gymstart_v1_settings_male' : 'gymstart_v1_settings';
        try {
            const s = JSON.parse(localStorage.getItem(key) || '{}');
            s.weeklyTarget = n;
            localStorage.setItem(key, JSON.stringify(s));
        } catch(e) {}
    },

    adjustWeeklyTarget: function(delta) {
        const next = Math.max(1, Math.min(7, this._getWeeklyTarget() + delta));
        this._setWeeklyTarget(next);
        document.getElementById('admin-weekly-target').textContent = next;
        this.renderHome();
    },

    getExerciseDef: function(exId) {
        const found = this.state.exercises.find(e => e.id === exId);
        if (found) return found;
        return {
            name: 'תרגיל לא ידוע',
            cat: 'other',
            settings: {unit:'kg', step:2.5, min:0, max:50}
        };
    },

    /* --- WORKOUT LOGIC --- */
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
            log:[],
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
        this._startWorkoutTimer();
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

        // ── isStopwatch מבוסס unit:'time' בלבד ───────────────────────────────
        const isTime = exDef.settings.unit === 'time';
        this.state.active.isStopwatch = isTime;

        if (isTime) {
            document.getElementById('cards-container').style.display = 'none';
            document.getElementById('stopwatch-container').style.display = 'flex';
            const bn = document.getElementById('target-banner');
            if (bn) bn.style.display = 'none';
            this.state.active.stopwatchVal = 0;
            this.stopStopwatch();
            document.getElementById('sw-display').innerText = "00:00";
            document.getElementById('btn-sw-toggle').classList.remove('running');
            document.getElementById('btn-sw-toggle').innerText = "▶";
            document.getElementById('rest-timer-area').style.display = 'none';
        } else {
            document.getElementById('cards-container').style.display = 'flex';
            document.getElementById('stopwatch-container').style.display = 'none';
            document.getElementById('unit-label-card').innerText =
                exDef.settings.unit === 'plates' ? 'פלטות' :
                exDef.settings.unit === 'bodyweight' ? 'גוף' : 'ק״ג';

            let defaultWeight = 10;
            for(let i=this.state.history.length-1; i>=0; i--) {
                const sess = this.state.history[i];
                const found = sess.data.find(e => e.id === exInst.id);
                if(found && found.sets.length > 0) {
                    defaultWeight = found.sets[found.sets.length-1].w;
                    break;
                }
            }
            // יעד מאמן גובר על ברירת מחדל מהיסטוריה
            if (exInst.target?.w) defaultWeight = exInst.target.w;
            this.state.active.inputW = defaultWeight;
            this.state.active.inputR = exInst.target?.r || 12;

            // הצג/הסתר banner יעד מאמן
            const bannerEl = document.getElementById('target-banner');
            const tagW = document.getElementById('target-tag-w');
            const tagR = document.getElementById('target-tag-r');
            const isBodyweightUnit = exDef.settings.unit === 'bodyweight';
            const hasTargetW = exInst.target?.w && !isBodyweightUnit;
            const hasTargetR = exInst.target?.r;
            if (bannerEl && (hasTargetW || hasTargetR)) {
                const unitStr = exDef.settings.unit === 'plates' ? 'פלטות' : 'ק״ג';
                const parts = [];
                if (hasTargetW) parts.push(`${exInst.target.w} ${unitStr}`);
                if (hasTargetR) parts.push(`${exInst.target.r} חז'`);
                bannerEl.querySelector('.tb-value').textContent = parts.join(' × ');
                bannerEl.style.display = 'flex';
                if (tagW) tagW.style.display = hasTargetW ? 'block' : 'none';
                if (tagR) tagR.style.display = hasTargetR ? 'block' : 'none';
            } else {
                if (bannerEl) bannerEl.style.display = 'none';
                if (tagW) tagW.style.display = 'none';
                if (tagR) tagR.style.display = 'none';
            }
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
        const isTime = exDef.settings.unit === 'time';
        const isBodyweight = exDef.settings.unit === 'bodyweight';

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
                <polyline points="${points.join(' ')}" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
                <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="2.5" fill="var(--primary)"/>
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
        const s = exDef.settings || {unit:'kg', step:2.5, min:0, max:50};
        const isBodyweight = s.unit === 'bodyweight';

        // הסתר כרטיס משקל עבור תרגילי משקל גוף
        const cardWeight = document.getElementById('card-weight');
        if (cardWeight) cardWeight.style.display = isBodyweight ? 'none' : 'flex';

        // שמור הגדרות ל-steppers
        this._stepSettings = {
            wMin: parseFloat(s.min),
            wMax: parseFloat(s.max),
            wStep: parseFloat(s.step) || 2.5,
            rMax: exDef.cat === 'core' ? 50 : 30
        };

        // כוון inputW לתחום תקין ועדכן תצוגה
        if (!isBodyweight) {
            let w = this.state.active.inputW;
            if (w < this._stepSettings.wMin) w = this._stepSettings.wMin;
            if (w > this._stepSettings.wMax) w = this._stepSettings.wMax;
            const step = this._stepSettings.wStep;
            w = Math.round(Math.round(w / step) * step * 100) / 100;
            this.state.active.inputW = w;
            const wEl = document.getElementById('stepper-weight');
            if (wEl) wEl.innerText = w % 1 === 0 ? w : w.toFixed(1);
        }

        const rEl = document.getElementById('stepper-reps');
        if (rEl) rEl.innerText = this.state.active.inputR;
    },

    stepWeight: function(dir) {
        const s = this._stepSettings;
        if (!s) return;
        let newW = Math.round((this.state.active.inputW + dir * s.wStep) * 100) / 100;
        if (newW < s.wMin) newW = s.wMin;
        if (newW > s.wMax) newW = s.wMax;
        this.state.active.inputW = newW;
        const el = document.getElementById('stepper-weight');
        if (el) el.innerText = newW % 1 === 0 ? newW : newW.toFixed(1);
        if (navigator.vibrate) navigator.vibrate(8);
    },

    stepReps: function(dir) {
        const s = this._stepSettings;
        if (!s) return;
        let newR = this.state.active.inputR + dir;
        if (newR < 1) newR = 1;
        if (newR > (s.rMax || 30)) newR = s.rMax || 30;
        this.state.active.inputR = newR;
        const el = document.getElementById('stepper-reps');
        if (el) el.innerText = newR;
        if (navigator.vibrate) navigator.vibrate(8);
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
        this.triggerPressEffect('btn-finish');
        let w, r;
        if (this.state.active.isStopwatch) {
            if(this.state.active.timerInterval) this.toggleStopwatch();
            w = 0; r = this.state.active.stopwatchVal;
            if (r === 0) { alert("לא נמדד זמן"); return; }
        } else {
            w = this.state.active.inputW; r = this.state.active.inputR;
        }

        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === exInst.id);
        if(!exLog) {
            exLog = { id: exInst.id, name: exInst.name, sets:[] };
            this.state.active.log.push(exLog);
        }
        exLog.sets.push({ w, r, feel: this.state.active.feel });

        const restTime = exInst.rest || 60;
        this.startRestTimer(restTime);

        if (this.state.active.setIdx < this.state.active.totalSets) {
            this.state.active.setIdx++;
            document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
            document.getElementById('btn-reorder').style.display = 'none';
            this.state.active.feel = 'good';
            this.updateFeelUI();
            if(this.state.active.isStopwatch) {
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
        // הסתר target-banner בזמן מנוחה — חוסך גובה ומונע גלילה
        const bn = document.getElementById('target-banner');
        if (bn) bn.style.display = 'none';
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
            disp.innerText = `${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
            const ratio = Math.min(elapsed / durationSec, 1);
            const offset = MAX_OFFSET - (MAX_OFFSET * ratio);
            ring.style.strokeDashoffset = offset;
        }, 100);
        this.saveActiveState();
    },

    stopRestTimer: function() {
        if(this.state.active.restInterval) clearInterval(this.state.active.restInterval);
        this.state.active.restInterval = null;
        document.getElementById('rest-timer-area').style.display = 'none';
        this.state.active.restStartTime = 0;
    },

    stopAllTimers: function() {
        this.stopStopwatch();
        this.stopRestTimer();
    },

    _startWorkoutTimer: function() {
        this._stopWorkoutTimer();
        const el = document.getElementById('workout-timer-nav');
        const val = document.getElementById('workout-timer-val');
        if (!el || !val) return;
        el.style.display = 'flex';
        // שדה נפרד — לא state.active.timerInterval שמשמש גם את ה-stopwatch
        this._navTimerInterval = setInterval(() => {
            const elapsed = this.state.active.accumulatedTime + (Date.now() - this.state.active.startTime);
            const tot = Math.floor(elapsed / 1000);
            const m = Math.floor(tot / 60);
            const s = tot % 60;
            val.textContent = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
        }, 1000);
    },

    _stopWorkoutTimer: function() {
        if (this._navTimerInterval) {
            clearInterval(this._navTimerInterval);
            this._navTimerInterval = null;
        }
        const el = document.getElementById('workout-timer-nav');
        if (el) el.style.display = 'none';
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
        if(this.state.active.isStopwatch) {
            this.state.active.stopwatchVal = 0;
            document.getElementById('sw-display').innerText = "00:00";
        }
        this.saveActiveState();
    },

    deleteLastSet: function() {
        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === exInst.id);
        if(exLog && exLog.sets.length > 0) {
            exLog.sets.pop();
            this.stopRestTimer();
            if (this.state.active.setIdx > 1) {
                this.state.active.setIdx--;
                document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
                if(this.state.active.setIdx === 1) {
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
        this._stopWorkoutTimer();
        const currentSessionDur = Date.now() - this.state.active.startTime;
        const totalDurMs = this.state.active.accumulatedTime + currentSessionDur;
        const durationMin = Math.round(totalDurMs / 60000);
        const dateStr = new Date().toLocaleDateString('he-IL');
        const progTitle = this.state.routines[this.state.currentProgId]?.title || "אימון מזדמן";

        // זיהוי יעדי מאמן שהושגו באימון זה
        const achievedTargets = [];
        this.state.active.sessionExercises.forEach(exInst => {
            if (!exInst.target) return;
            const exLog = this.state.active.log.find(l => l.id === exInst.id);
            if (!exLog || exLog.sets.length === 0) return;
            const targetW = exInst.target.w;
            const targetR = exInst.target.r;
            const achieved = exLog.sets.some(s => {
                const wOk = !targetW || s.w >= targetW;
                const rOk = !targetR || s.r >= targetR;
                return wOk && rOk;
            });
            if (achieved) achievedTargets.push({ id: exInst.id, name: exInst.name, target: exInst.target });
        });

        this.state.active.summary = {
            program: this.state.currentProgId,
            programTitle: progTitle,
            date: dateStr,
            duration: durationMin,
            data: this.state.active.log,
            achievedTargets: achievedTargets
        };
        const meta = document.getElementById('summary-meta');
        meta.innerText = `${dateStr} | ${durationMin} דקות`;
        const textBox = document.getElementById('summary-text');
        textBox.innerText = this.generateLogText(this.state.active.summary);
        this.renderSummaryStats(this.state.active.summary);
        this.renderWinCard(this.state.active.summary);
        this.renderAchievedTargets(achievedTargets);
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
                <div class="summary-stat-item"><div class="summary-stat-val">${exCount}</div><div class="summary-stat-lbl">תרגילים</div></div>
                <div class="summary-stat-item"><div class="summary-stat-val">${totalSets}</div><div class="summary-stat-lbl">סטים</div></div>
                <div class="summary-stat-item"><div class="summary-stat-val">${summary.duration}</div><div class="summary-stat-lbl">דקות</div></div>
            </div>`;
        document.getElementById('summary-meta').innerHTML = `<div class="gs-summary-date">${summary.date}</div>${statsHtml}`;
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
            const isTime = exDef.settings.unit === 'time';
            const isBodyweight = exDef.settings.unit === 'bodyweight';

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

    // ── Badge למאמן — זיהוי יעדים שהושגו ולא אושרו ─────────────────────────
    checkUnacknowledgedAchievements: function() {
        const ackedKey = 'gymstart_v1_ack_achievements';
        const acked = JSON.parse(localStorage.getItem(ackedKey) || '[]');
        const unacked = [];
        this.state.history.forEach(h => {
            if (!h.achievedTargets || !h.timestamp) return;
            h.achievedTargets.forEach(at => {
                const uid = `${h.timestamp}_${at.id}`;
                if (!acked.includes(uid)) unacked.push({ ...at, date: h.date, uid });
            });
        });
        if (unacked.length === 0) return;
        this._pendingAchievements = unacked;
        this._showAchievementsModal(unacked);
    },

    _showAchievementsModal: function(unacked) {
        const list = document.getElementById('achievements-modal-list');
        if (!list) return;
        list.innerHTML = '';
        unacked.forEach(at => {
            const exDef = this.getExerciseDef(at.id);
            const unit = exDef?.settings?.unit;
            const unitStr = unit === 'plates' ? 'פלטות' : 'ק״ג';
            const parts = [];
            if (at.target.w) parts.push(`${at.target.w} ${unitStr}`);
            if (at.target.r) parts.push(`${at.target.r} חז'`);
            list.innerHTML += `<div class="win-row">
                <span class="win-row-name">${at.name}</span>
                <div class="win-delta">
                    <span style="color:var(--text-sec);font-size:0.8rem;">${at.date}</span>
                    <span class="win-new">✓ ${parts.join(' × ')}</span>
                </div>
            </div>`;
        });
        document.getElementById('achievements-modal').style.display = 'flex';
    },

    ackAllAchievements: function() {
        const ackedKey = 'gymstart_v1_ack_achievements';
        const acked = JSON.parse(localStorage.getItem(ackedKey) || '[]');
        (this._pendingAchievements || []).forEach(at => {
            if (!acked.includes(at.uid)) acked.push(at.uid);
        });
        localStorage.setItem(ackedKey, JSON.stringify(acked));
        this._pendingAchievements = [];
        document.getElementById('achievements-modal').style.display = 'none';
    },

    renderAchievedTargets: function(achievedTargets) {
        const card = document.getElementById('achieved-targets-card');
        const list = document.getElementById('achieved-targets-list');
        if (!card) return;
        card.style.display = 'none';
        list.innerHTML = '';
        if (!achievedTargets || achievedTargets.length === 0) return;
        achievedTargets.forEach(at => {
            const exDef = this.getExerciseDef(at.id);
            const unit = exDef?.settings?.unit;
            const unitStr = unit === 'plates' ? 'פלטות' : 'ק״ג';
            const parts = [];
            if (at.target.w) parts.push(`${at.target.w} ${unitStr}`);
            if (at.target.r) parts.push(`${at.target.r} חז'`);
            list.innerHTML += `<div class="win-row">
                <span class="win-row-name">${at.name}</span>
                <span class="win-new">✓ ${parts.join(' × ')}</span>
            </div>`;
        });
        const suffix = achievedTargets.length === 1 ? 'יעד' : 'יעדים';
        document.getElementById('achieved-targets-subtitle').innerText = `הגעת ל-${achievedTargets.length} ${suffix} של המאמן!`;
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = '';
        card.style.display = 'block';
    },

    // ── generateLogText — משתמש ב-_formatSetDisplay ───────────────────────────
    generateLogText: function(historyItem) {
        const pName = historyItem.programTitle || historyItem.program;
        let txt = `סיכום אימון: ${pName}\n`;
        txt += `תאריך: ${historyItem.date} | משך: ${historyItem.duration} דק'\n\n`;
        historyItem.data.forEach(ex => {
            if(ex.sets.length > 0) {
                txt += `✅ ${ex.name}\n`;
                ex.sets.forEach((s, i) => {
                    const feelStr = FEEL_MAP_TEXT[s.feel] || 'טוב';
                    txt += `   סט ${i+1}: ${this._formatSetDisplay(ex.id, s)} (${feelStr})\n`;
                });
                txt += "\n";
            }
        });
        // יעדי מאמן שהושגו — תיעוד בטקסט לשיתוף
        const achieved = historyItem.achievedTargets;
        if (achieved && achieved.length > 0) {
            txt += `⭐ יעדי מאמן שהושגו:\n`;
            achieved.forEach(at => {
                const exDef = this.getExerciseDef(at.id);
                const unit = exDef?.settings?.unit;
                const unitStr = unit === 'plates' ? 'פלטות' : 'ק״ג';
                const parts = [];
                if (at.target.w) parts.push(`${at.target.w} ${unitStr}`);
                if (at.target.r) parts.push(`${at.target.r} חז'`);
                txt += `   ⭐ ${at.name}: ${parts.join(' × ')}\n`;
            });
        }
        return txt;
    },

    finishAndCopy: function() {
        const summary = this.state.active.summary;
        if (!summary) return;

        // העתקה ל-clipboard — fire and forget, לא תלוי בשמירה
        const txt = document.getElementById('summary-text').innerText;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).catch(() => {});
        } else {
            try {
                const ta = document.createElement('textarea');
                ta.value = txt;
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            } catch(e) {}
        }

        // שמירה + sync לענן — תמיד מתבצע, לא תלוי ב-clipboard
        const achieved = summary.achievedTargets || [];
        // מחיקת targets שהושגו מהרוטינה — המאמן יראה שהיעד נמחק ויידע להגדיר חדש
        if (achieved.length > 0 && this.state.currentProgId) {
            const routine = this.state.routines[this.state.currentProgId];
            if (routine) {
                achieved.forEach(at => {
                    const ex = routine.exercises.find(e => e.id === at.id);
                    if (ex) delete ex.target;
                });
            }
        }
        const histEntry = {
            date: summary.date,
            timestamp: Date.now(),
            program: summary.program,
            programTitle: summary.programTitle,
            data: summary.data,
            duration: summary.duration,
        };
        // אין להוסיף achievedTargets כשהוא ריק — Firestore דוחה undefined
        if (achieved.length > 0) histEntry.achievedTargets = achieved;
        this.state.history.push(histEntry);
        this.saveData();
        localStorage.removeItem(CONFIG.KEYS.ACTIVE_WORKOUT);
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
            FirebaseManager.saveArchiveToCloud().then(ok => {
                if (!ok) alert('לא ניתן לשמור לענן. הנתונים נשמרו מקומית.');
                window.location.reload();
            });
        } else {
            window.location.reload();
        }
    },

    /* --- REORDER / SWAP --- */
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
            list.innerHTML += `<div class="list-item" onclick="app.selectReorderExercise(${realIndex})">
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
        document.getElementById('user-sel-title').innerText = this.state.activeProfile === 'male' ? "הוסף תרגיל" : "הוסיפי תרגיל";
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
            list.innerHTML += `<div class="list-item" onclick="app.userSelectExercise('${e.id}')">
                <span style="font-weight:700">${e.name}</span>
                <span style="color:var(--primary)">+</span>
            </div>`;
        });
    },

    userSelectExercise: function(exId) {
        const newExDef = this.getExerciseDef(exId);
        if (this.state.userSelector.mode === 'swap') {
            this.state.active.sessionExercises[this.state.active.exIdx] = { id: exId, name: newExDef.name, sets: 3, rest: 60 };
            this.loadActiveExercise();
        } else if (this.state.userSelector.mode === 'add') {
            const newExInst = { id: exId, name: newExDef.name, sets: 3, rest: 60 };
            this.state.active.sessionExercises.splice(this.state.active.exIdx + 1, 0, newExInst);
            this.nextExercise();
        }
        this.saveActiveState();
        this.closeUserSelector();
    },

    /* --- ADMIN --- */
    openAdminHome: function() {
        if (this.state.active.on) { alert("לא ניתן להיכנס לניהול בזמן אימון פעיל."); return; }
        document.getElementById('admin-modal').style.display = 'flex';
        document.getElementById('admin-view-home').style.display = 'flex';
        document.getElementById('admin-view-edit').style.display = 'none';
        document.getElementById('admin-view-selector').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'none';
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        this.renderAdminList();
        document.getElementById('admin-weekly-target').textContent = this._getWeeklyTarget();
        this.renderAuthPanel();
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
        if(ids.length === 0) list.innerHTML = '<div class="gs-empty-msg">אין תוכניות</div>';
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
        this.state.routines[id] = { title: 'תוכנית חדשה', exercises:[] };
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
        this._autoSyncConfig();
    },

    updateProgramTitle: function() {},

    renderEditorList: function() {
        const list = document.getElementById('admin-ex-list');
        list.innerHTML = '';
        this.state.admin.tempExercises.forEach((ex, i) => {
            const hasTip = ex.note ? 'has-tip' : '';
            const exDef = this.getExerciseDef(ex.id);
            const unit = exDef.settings.unit;
            const isTime = unit === 'time';
            const isWeighted = unit === 'kg' || unit === 'plates';
            const uLabel = unit === 'plates' ? 'פלטות' : 'ק״ג';
            const hasTarget = ex.target !== undefined && ex.target !== null;

            // בניית אפשרויות select למשקל
            let wOptionsHtml = '';
            if (isWeighted) {
                const step = exDef.settings.step || 2.5;
                const min = exDef.settings.min || step;
                const max = exDef.settings.max || 100;
                const selW = ex.target?.w;
                for (let v = min; v <= max + 0.001; v = Math.round((v + step) * 100) / 100) {
                    const sel = selW !== undefined && Math.abs(selW - v) < 0.01 ? 'selected' : '';
                    const lbl = v % 1 === 0 ? v : v.toFixed(1);
                    wOptionsHtml += `<option value="${v}" ${sel}>${lbl}</option>`;
                }
            }
            // בניית אפשרויות select לחזרות (1-30)
            const selR = ex.target?.r || 12;
            let rOptionsHtml = '';
            for (let v = 1; v <= 30; v++) {
                rOptionsHtml += `<option value="${v}" ${selR === v ? 'selected' : ''}>${v}</option>`;
            }

            const pickerRowHtml = (hasTarget && !isTime) ? `
                <div class="target-pickers-row">
                    ${isWeighted ? `<select class="ios-picker" onchange="app.setTargetW(${i},this.value)">
                        ${wOptionsHtml}
                    </select>
                    <span class="picker-sep">×</span>` : ''}
                    <select class="ios-picker ios-picker-sm" onchange="app.setTargetR(${i},this.value)">
                        ${rOptionsHtml}
                    </select>
                    <span class="picker-unit">חז'</span>
                </div>` : '';

            const targetSectionHtml = isTime ? '' : `
                <div class="row-target">
                    <label class="target-chk-label">
                        <input type="checkbox" class="target-chk" onchange="app.toggleTarget(${i},this.checked)" ${hasTarget ? 'checked' : ''}>
                        <span class="target-toggle-track"></span>
                        <span class="target-toggle-text">קביעת יעד מאמן</span>
                    </label>
                    ${pickerRowHtml}
                </div>`;

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
                ${targetSectionHtml}
            </div>`;
        });
    },

    toggleTarget: function(i, enabled) {
        const ex = this.state.admin.tempExercises[i];
        if (enabled) {
            const exDef = this.getExerciseDef(ex.id);
            const unit = exDef.settings.unit;
            ex.target = {};
            if (unit === 'kg' || unit === 'plates') {
                ex.target.w = exDef.settings.min || exDef.settings.step || 10;
            }
            ex.target.r = 12;
        } else {
            delete ex.target;
        }
        this.renderEditorList();
    },

    setTargetW: function(i, val) {
        const ex = this.state.admin.tempExercises[i];
        if (!ex.target) ex.target = {};
        ex.target.w = parseFloat(val);
    },

    setTargetR: function(i, val) {
        const ex = this.state.admin.tempExercises[i];
        if (!ex.target) ex.target = {};
        ex.target.r = parseInt(val);
    },

    updateTargetField: function(i, field, delta) {
        const ex = this.state.admin.tempExercises[i];
        if (!ex.target) ex.target = {};
        const exDef = this.getExerciseDef(ex.id);
        if (field === 'w') {
            const step = exDef.settings.step || 2.5;
            const min = exDef.settings.min || step;
            const max = exDef.settings.max || 100;
            const cur = ex.target.w !== undefined ? ex.target.w : min;
            let newW = Math.round((cur + delta) * 100) / 100;
            newW = Math.max(min, Math.min(max, newW));
            ex.target.w = newW;
        } else if (field === 'r') {
            const cur = ex.target.r !== undefined ? ex.target.r : 12;
            let newR = cur + delta;
            if (newR < 1) newR = 1;
            if (newR > 30) newR = 30;
            ex.target.r = newR;
        }
        this.renderEditorList();
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
        const temp = arr[i]; arr[i] = arr[i + dir]; arr[i + dir] = temp;
        this.renderEditorList();
    },

    removeEx: function(i) {
        this.state.admin.tempExercises.splice(i, 1);
        this.renderEditorList();
    },

    /* --- EXERCISE MANAGER --- */
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
        const map = { 'all':0, 'legs':1, 'chest':2, 'back':3, 'shoulders':4, 'arms':5, 'core':6 };
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
            return e.name.toLowerCase().includes(term) && (cat === 'all' || e.cat === cat);
        }).forEach(e => {
            list.innerHTML += `<div class="list-item" onclick="app.editExerciseInBank('${e.id}')">
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
        if (existingIdx > -1) this.state.exercises[existingIdx] = newEx;
        else this.state.exercises.push(newEx);
        this.saveData();
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
        this.renderExerciseManagerList();
        this._autoSyncConfig();
    },

    cancelExerciseEdit: function() {
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'flex';
    },

    /* --- SELECTOR --- */
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
            return e.name.toLowerCase().includes(search) && (cat === 'all' || e.cat === cat);
        }).forEach(e => {
            list.innerHTML += `<div class="list-item" onclick="app.addExerciseFromSelector('${e.id}')">
                <span style="font-weight:700">${e.name}</span>
                <span style="color:var(--primary)">+</span>
            </div>`;
        });
    },

    addExerciseFromSelector: function(exId) {
        const bankEx = this.getExerciseDef(exId);
        this.state.admin.tempExercises.push({ id: bankEx.id, name: bankEx.name, sets: 3, rest: 60, note: '', target: {w:10, r:12} });
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
        document.getElementById('tip-input').value = this.state.admin.tempExercises[idx].note || '';
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

    openHistoryBackupSheet: function() {
        const isConn = typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured();
        const cloudBtn = document.getElementById('btn-backup-cloud');
        if (cloudBtn) { cloudBtn.disabled = !isConn; cloudBtn.style.opacity = isConn ? '1' : '0.4'; }
        document.getElementById('history-backup-overlay').style.display = 'block';
        document.getElementById('history-backup-sheet').style.display = 'flex';
    },

    closeHistoryBackupSheet: function() {
        document.getElementById('history-backup-overlay').style.display = 'none';
        document.getElementById('history-backup-sheet').style.display = 'none';
    },

    openHistoryRestoreSheet: function() {
        const isConn = typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured();
        const cloudBtn = document.getElementById('btn-restore-cloud');
        if (cloudBtn) { cloudBtn.disabled = !isConn; cloudBtn.style.opacity = isConn ? '1' : '0.4'; }
        document.getElementById('history-restore-overlay').style.display = 'block';
        document.getElementById('history-restore-sheet').style.display = 'flex';
    },

    closeHistoryRestoreSheet: function() {
        document.getElementById('history-restore-overlay').style.display = 'none';
        document.getElementById('history-restore-sheet').style.display = 'none';
    },

    exportConfig: function() {
        const data = { type: 'config', ver: CONFIG.VERSION, profile: this.state.activeProfile, date: new Date().toLocaleDateString(), routines: this.state.routines, exercises: this.state.exercises };
        this.downloadJSON(data, `gymstart_config_${this.state.activeProfile}_v${CONFIG.VERSION}_${Date.now()}.json`);
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
                    if(json.exercises) app.state.exercises = json.exercises;
                    app.saveData();
                    if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
                        FirebaseManager.saveConfigToCloud();
                    }
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
                    if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
                        FirebaseManager.saveArchiveToCloud();
                    }
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

    // עדכון קונפיג אוטומטי בענן לאחר כל שמירה
    _autoSyncConfig: function() {
        const traineeWord = this.state.activeProfile === 'male' ? 'המתאמן' : 'המתאמנת';
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
            FirebaseManager.saveConfigToCloud().then(ok => {
                alert(ok
                    ? `✓ הקונפיג עודכן ונשלח לענן!\n${traineeWord} יכול/ה ללחוץ "קבל עדכון מהמאמן".`
                    : 'הקונפיג נשמר מקומית, אך הייתה שגיאה בשליחה לענן.');
            });
        } else {
            alert(`הקונפיג נשמר.\nלא מוגדר חיבור ענן — ייצא ידנית כדי לשלוח ל${traineeWord}.`);
        }
    },

    /* --- HISTORY VIEW — חלוקה לחודשים ─────────────────────────────────── */
    showHistory: function() {
        this.state.historySelection = [];
        this.updateHistoryActions();
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (this.state.history.length === 0) {
            list.innerHTML = '<div class="gs-empty-msg">אין היסטוריה</div>';
            this.nav('screen-history');
            return;
        }

        // קיבוץ לפי חודש
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;

        const groups = {};
        [...this.state.history].reverse().forEach((h, i) => {
            const realIdx = this.state.history.length - 1 - i;
            // חישוב מפתח חודש מה-timestamp או מה-date
            let monthKey;
            if (h.timestamp) {
                const d = new Date(h.timestamp);
                monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
            } else {
                // fallback: מה-date string בפורמט he-IL (dd/mm/yyyy)
                const parts = h.date.split('/');
                if (parts.length === 3) {
                    monthKey = `${parts[2]}-${parts[1].padStart(2,'0')}`;
                } else {
                    monthKey = currentMonthKey;
                }
            }
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push({ h, realIdx });
        });

        const heMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

        Object.keys(groups).sort((a,b) => b.localeCompare(a)).forEach(monthKey => {
            const items = groups[monthKey];
            const [year, month] = monthKey.split('-');
            const monthLabel = `${heMonths[parseInt(month) - 1]} ${year}`;
            const isCurrentMonth = monthKey === currentMonthKey;
            const count = items.length;

            const groupEl = document.createElement('div');
            groupEl.className = 'month-group';

            groupEl.innerHTML = `
                <div class="month-header" onclick="app._toggleMonthGroup(this)">
                    <span class="month-header-title">${monthLabel}</span>
                    <div class="month-meta">
                        <span class="month-count">${count} אימונים</span>
                        <span class="month-chevron">${isCurrentMonth ? '▲' : '▼'}</span>
                    </div>
                </div>
                <div class="month-content" style="display:${isCurrentMonth ? 'flex' : 'none'}">
                    ${items.map(({h, realIdx}) => `
                        <div class="hist-item-row">
                            <div style="display:flex; align-items:center">
                                <input type="checkbox" class="custom-chk" onchange="app.toggleHistorySelection(${realIdx}, this)">
                            </div>
                            <div class="gs-hist-row-inner" onclick="app.showHistoryDetail(${realIdx})">
                                <div class="gs-hist-row-top">
                                    <span class="gs-hist-date-text">${h.date}</span>
                                    <span class="gs-prog-badge">${h.programTitle || h.program}</span>
                                </div>
                                <div class="gs-hist-sub-text">${h.data.length} תרגילים • ${h.duration||'?'} דק'</div>
                            </div>
                        </div>`).join('')}
                </div>`;

            list.appendChild(groupEl);
        });

        this.nav('screen-history');
    },

    _toggleMonthGroup: function(headerEl) {
        const content = headerEl.nextElementSibling;
        const chevron = headerEl.querySelector('.month-chevron');
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'flex';
        if (content.style.display === 'flex') content.style.flexDirection = 'column';
        chevron.innerText = isOpen ? '▼' : '▲';
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
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
            FirebaseManager.saveArchiveToCloud().then(() => window.location.reload());
        } else {
            window.location.reload();
        }
    },

    copySelectedHistory: function() {
        if(this.state.historySelection.length === 0) { alert("לא נבחר אימון"); return; }
        let fullTxt = "";
        const sortedSel = [...this.state.historySelection].sort((a,b) => a-b);
        sortedSel.forEach((idx, i) => {
            fullTxt += this.generateLogText(this.state.history[idx]);
            if(i < sortedSel.length - 1) fullTxt += "----------------\n\n";
        });
        this.copyText(fullTxt);
    },

    showHistoryDetail: function(idx) {
        const item = this.state.history[idx];
        this.state.viewHistoryIdx = idx;
        const pName = item.programTitle || item.program;
        document.getElementById('hist-meta-header').innerHTML = `<h3>${pName}</h3><p>${item.date} | ${item.duration} דק'</p>`;
        const content = document.getElementById('hist-detail-content');
        let html = '';
        item.data.forEach(ex => {
            html += `<div class="gs-detail-ex">
                <div class="gs-detail-ex-name">${ex.name}</div>`;
            ex.sets.forEach((s, si) => {
                const feelStr = FEEL_MAP_TEXT[s.feel] || 'טוב';
                html += `<div class="gs-detail-set">
                    <span>סט ${si+1} <small class="gs-detail-set-feel">(${feelStr})</small></span>
                    <span>${this._formatSetDisplay(ex.id, s)}</span>
                </div>`;
            });
            html += `</div>`;
        });
        content.innerHTML = html;
        document.getElementById('history-modal').style.display = 'flex';
    },

    copySingleHistory: function() {
        this.copyText(this.generateLogText(this.state.history[this.state.viewHistoryIdx]));
    },

    closeHistoryModal: function() { document.getElementById('history-modal').style.display = 'none'; },

    deleteCurrentLog: function() {
        if(confirm("למחוק את האימון?")) {
            this.state.history.splice(this.state.viewHistoryIdx, 1);
            this.saveData();
            this.closeHistoryModal();
            if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
                FirebaseManager.saveArchiveToCloud().then(() => window.location.reload());
            } else {
                window.location.reload();
            }
        }
    },

    /* --- COPY BY RANGE ─────────────────────────────────────────────────── */
    openRangeSheet: function() {
        _rangeTab = 'month';
        _rangeSelectedMonth = null;
        _rangeSelectedWeeks = null;
        this._renderRangeMonthChips();
        document.getElementById('range-seg-month').classList.add('active');
        document.getElementById('range-seg-weeks').classList.remove('active');
        document.getElementById('range-panel-month').style.display = 'block';
        document.getElementById('range-panel-weeks').style.display = 'none';
        const btn = document.getElementById('btn-range-copy');
        btn.disabled = true; btn.style.opacity = '0.5'; btn.innerText = 'בחר טווח';
        document.getElementById('range-copy-overlay').style.display = 'block';
        document.getElementById('range-copy-sheet').style.display = 'flex';
    },

    closeRangeSheet: function() {
        document.getElementById('range-copy-overlay').style.display = 'none';
        document.getElementById('range-copy-sheet').style.display = 'none';
    },

    switchRangeTab: function(tab) {
        _rangeTab = tab;
        _rangeSelectedMonth = null;
        _rangeSelectedWeeks = null;
        const btn = document.getElementById('btn-range-copy');
        btn.disabled = true; btn.style.opacity = '0.5'; btn.innerText = 'בחר טווח';

        document.getElementById('range-seg-month').classList.toggle('active', tab === 'month');
        document.getElementById('range-seg-weeks').classList.toggle('active', tab === 'weeks');
        document.getElementById('range-panel-month').style.display = tab === 'month' ? 'block' : 'none';
        document.getElementById('range-panel-weeks').style.display = tab === 'weeks' ? 'block' : 'none';
    },

    _renderRangeMonthChips: function() {
        const container = document.getElementById('range-month-chips');
        container.innerHTML = '';
        const heMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
        const months = new Set();
        this.state.history.forEach(h => {
            if (h.timestamp) {
                const d = new Date(h.timestamp);
                months.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
            }
        });
        [...months].sort((a,b) => b.localeCompare(a)).forEach(mk => {
            const [y, m] = mk.split('-');
            const label = `${heMonths[parseInt(m)-1]} ${y}`;
            const btn = document.createElement('button');
            btn.className = 'range-chip-gs';
            btn.innerText = label;
            btn.onclick = () => this._selectRangeMonth(mk, btn);
            container.appendChild(btn);
        });
    },

    _selectRangeMonth: function(monthKey, el) {
        _rangeSelectedMonth = monthKey;
        document.querySelectorAll('#range-month-chips .range-chip-gs').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        const btn = document.getElementById('btn-range-copy');
        btn.disabled = false; btn.style.opacity = '1'; btn.innerText = 'העתק חודש';
    },

    selectRangeWeeks: function(n, el) {
        _rangeSelectedWeeks = n;
        document.querySelectorAll('#range-panel-weeks .range-chip-gs').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        const btn = document.getElementById('btn-range-copy');
        btn.disabled = false; btn.style.opacity = '1'; btn.innerText = `העתק ${n} שבועות`;
    },

    _getWeeksStartDate: function(n) {
        const now = new Date();
        const day = now.getDay(); // 0=ראשון
        const startOfCurrentWeek = new Date(now);
        startOfCurrentWeek.setDate(now.getDate() - day);
        startOfCurrentWeek.setHours(0,0,0,0);
        const startDate = new Date(startOfCurrentWeek);
        startDate.setDate(startOfCurrentWeek.getDate() - (n - 1) * 7);
        return startDate;
    },

    executeCopyByRange: function() {
        let filtered = [];
        if (_rangeTab === 'month' && _rangeSelectedMonth) {
            const [y, m] = _rangeSelectedMonth.split('-');
            filtered = this.state.history.filter(h => {
                if (!h.timestamp) return false;
                const d = new Date(h.timestamp);
                return d.getFullYear() === parseInt(y) && (d.getMonth() + 1) === parseInt(m);
            });
        } else if (_rangeTab === 'weeks' && _rangeSelectedWeeks) {
            const startDate = this._getWeeksStartDate(_rangeSelectedWeeks);
            filtered = this.state.history.filter(h => {
                if (!h.timestamp) return false;
                return new Date(h.timestamp) >= startDate;
            });
        }

        if (filtered.length === 0) { alert("לא נמצאו אימונים בטווח זה."); return; }

        let fullTxt = '';
        filtered.sort((a,b) => (a.timestamp||0) - (b.timestamp||0)).forEach((h, i) => {
            fullTxt += this.generateLogText(h);
            if (i < filtered.length - 1) fullTxt += "----------------\n\n";
        });
        this.copyText(fullTxt);
        this.closeRangeSheet();
    },

    /* --- CHECK FOR UPDATE ───────────────────────────────────────────────── */
    checkForUpdate: async function() {
        try {
            const res = await fetch('./version.json?t=' + Date.now());
            if (!res.ok) throw new Error('network error');
            const data = await res.json();
            if (data.version && data.version !== CURRENT_VERSION) {
                if (confirm(`עדכון זמין (${data.version}). לנקות cache ולרענן?`)) {
                    if ('caches' in window) {
                        const keys = await caches.keys();
                        await Promise.all(keys.map(k => caches.delete(k)));
                    }
                    window.location.reload(true);
                }
            } else {
                alert('האפליקציה מעודכנת (v' + CURRENT_VERSION + ')');
            }
        } catch(e) {
            alert('לא ניתן לבדוק עדכונים. בדקי חיבור לאינטרנט.');
        }
    },

    /* --- UTILITIES --- */
    copyText: function(txt) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).then(() => alert("הועתק!"));
        } else {
            const ta = document.createElement('textarea');
            ta.value = txt;
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            alert("הועתק!");
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// FirebaseManager — ניהול Firestore (v1.8.2)
// ─────────────────────────────────────────────────────────────────────────────

const FirebaseManager = {
    KEY_FIREBASE_CONFIG: 'gymstart_firebase_config',
    _db: null,
    _initialized: false,

    isConfigured() {
        const cfg = this.getConfig();
        return !!(cfg && cfg.apiKey && cfg.projectId);
    },

    getConfig() {
        try { return JSON.parse(localStorage.getItem(this.KEY_FIREBASE_CONFIG)); }
        catch { return null; }
    },

    saveConfig(cfg) {
        localStorage.setItem(this.KEY_FIREBASE_CONFIG, JSON.stringify(cfg));
    },

    clearConfig() {
        localStorage.removeItem(this.KEY_FIREBASE_CONFIG);
        this._db = null;
        this._initialized = false;
    },

    init() {
        if (this._initialized && this._db) return true;
        if (typeof firebase === 'undefined') return false;
        const cfg = this.getConfig();
        if (!cfg || !cfg.apiKey || !cfg.projectId) return false;
        try {
            if (!firebase.apps.length) firebase.initializeApp(cfg);
            this._db = firebase.firestore();
            this._initialized = true;
            return true;
        } catch(e) {
            console.error('GymStart Firebase init:', e);
            return false;
        }
    },

    // ── Archive ───────────────────────────────────────────────────────────────

    async saveArchiveToCloud() {
        if (!this.init()) return false;
        try {
            const archiveDoc = app.state.activeProfile === 'male' ? 'archive_male' : 'archive';
            // JSON round-trip מסנן undefined שגורם ל-Firestore לזרוק שגיאה
            const cleanHistory = JSON.parse(JSON.stringify(app.state.history));
            await this._db.collection('gymstart_data').doc(archiveDoc).set({
                items: cleanHistory,
                updatedAt: Date.now()
            });
            return true;
        } catch(e) {
            console.error('GymStart saveArchive:', e);
            return false;
        }
    },

    async loadArchiveFromCloud() {
        if (!this.init()) { alert('Firebase לא מוגדר.'); return; }
        try {
            const archiveDoc = app.state.activeProfile === 'male' ? 'archive_male' : 'archive';
            const historyKey = app.state.activeProfile === 'male' ? 'gymstart_history_male' : CONFIG.KEYS.HISTORY;
            const doc = await this._db.collection('gymstart_data').doc(archiveDoc).get();
            if (!doc.exists || !doc.data().items) { alert('לא נמצאה היסטוריה בענן.'); return; }
            localStorage.setItem(historyKey, JSON.stringify(doc.data().items));
            // דגל — בטעינה הבאה app.init יציג badge אם יש יעדים שלא אושרו
            localStorage.setItem('gymstart_check_ach_on_load', '1');
            alert('ההיסטוריה שוחזרה מהענן!');
            location.reload();
        } catch(e) { alert('שגיאה בטעינה: ' + e.message); }
    },

    // ── Config ────────────────────────────────────────────────────────────────

    async saveConfigToCloud() {
        if (!this.init()) return false;
        try {
            const profileDoc = app.state.activeProfile === 'male' ? 'config_male' : 'config';
            // תוכניות אימון — נפרד לפי פרופיל
            await this._db.collection('gymstart_data').doc(profileDoc).set({
                routines: app.state.routines,
                updatedAt: Date.now()
            });
            // מאגר תרגילים — משותף לשני הפרופילים
            await this._db.collection('gymstart_data').doc('exercises_bank').set({
                exercises: app.state.exercises,
                updatedAt: Date.now()
            });
            return true;
        } catch(e) {
            console.error('GymStart saveConfig:', e);
            return false;
        }
    },

    async loadConfigFromCloud() {
        if (!this.init()) { alert('Firebase לא מוגדר.'); return; }
        try {
            const profileDoc = app.state.activeProfile === 'male' ? 'config_male' : 'config';
            const routinesKey = app.state.activeProfile === 'male' ? 'gymstart_routines_male' : CONFIG.KEYS.ROUTINES;
            const [configDoc, exDoc] = await Promise.all([
                this._db.collection('gymstart_data').doc(profileDoc).get(),
                this._db.collection('gymstart_data').doc('exercises_bank').get()
            ]);
            if (!configDoc.exists) {
                alert('לא נמצא קונפיג בענן לפרופיל זה.\nגבה קודם מהמכשיר הנוכחי.');
                return;
            }
            const data = configDoc.data();
            if (data.routines) localStorage.setItem(routinesKey, JSON.stringify(data.routines));
            // תרגילים: מ-exercises_bank, fallback ל-config.exercises (תאימות לאחור)
            if (exDoc.exists && exDoc.data().exercises) {
                localStorage.setItem(CONFIG.KEYS.EXERCISES, JSON.stringify(exDoc.data().exercises));
            } else if (data.exercises) {
                localStorage.setItem(CONFIG.KEYS.EXERCISES, JSON.stringify(data.exercises));
            }
            alert('הקונפיג שוחזר מהענן!');
            location.reload();
        } catch(e) { alert('שגיאה בטעינה: ' + e.message); }
    },

    // ── Upload All ────────────────────────────────────────────────────────────

    async uploadAllToCloud() {
        if (!this.init()) { alert('Firebase לא מוגדר. הגדר חיבור תחילה.'); return; }
        try {
            const archiveOk = await this.saveArchiveToCloud();
            const configOk  = await this.saveConfigToCloud();
            alert(archiveOk && configOk ? 'כל הנתונים הועלו לענן!' : 'חלק מהנתונים לא הועלו. בדוק חיבור.');
        } catch(e) { alert('שגיאה: ' + e.message); }
    }
};

// ─── Firebase Config UI ───────────────────────────────────────────────────────

function openFirebaseModal() {
    const cfg = FirebaseManager.getConfig() || {};
    const ta = document.getElementById('fb-config-paste');
    if (ta) {
        if (cfg.apiKey) {
            ta.value = `const firebaseConfig = {\n  apiKey: "${cfg.apiKey}",\n  authDomain: "${cfg.authDomain||''}",\n  projectId: "${cfg.projectId||''}",\n  storageBucket: "${cfg.storageBucket||''}",\n  messagingSenderId: "${cfg.messagingSenderId||''}",\n  appId: "${cfg.appId||''}"\n};`;
        } else {
            ta.value = '';
        }
    }
    const btnClear = document.getElementById('btn-clear-firebase');
    if (btnClear) btnClear.style.display = FirebaseManager.isConfigured() ? '' : 'none';
    updateFirebaseStatus();
    document.getElementById('firebase-modal').style.display = 'flex';
}

function closeFirebaseModal() {
    document.getElementById('firebase-modal').style.display = 'none';
}

function saveFirebaseConfig() {
    const raw = (document.getElementById('fb-config-paste').value || '').trim();
    if (!raw) { alert('יש להדביק את בלוק ה-firebaseConfig.'); return; }

    let jsonStr = raw;
    // נרמול גרשיים מתולתלים (iOS/WhatsApp) לגרשיים ישרים
    jsonStr = jsonStr.replace(/[\u201C\u201D\u201E]/g, '"').replace(/[\u2018\u2019\u201A]/g, "'");
    jsonStr = jsonStr.replace(/^[\s\S]*?=\s*/, '').replace(/;?\s*$/, '').trim();
    jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    jsonStr = jsonStr.replace(/:\s*'([^']*)'/g, ': "$1"');
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    let cfg;
    try { cfg = JSON.parse(jsonStr); }
    catch(e) { alert('פורמט לא תקין. ודא שהדבקת את הבלוק המלא מ-Firebase Console.'); return; }

    if (!cfg.apiKey || !cfg.projectId) { alert('חסרים apiKey או projectId.'); return; }

    FirebaseManager.saveConfig(cfg);
    FirebaseManager._initialized = false;
    FirebaseManager._db = null;
    closeFirebaseModal();
    updateFirebaseStatus();
    alert('חיבור Firebase נשמר!');
}

function confirmClearFirebase() {
    if (confirm('לנתק את Firebase ולמחוק פרטי החיבור?')) {
        FirebaseManager.clearConfig();
        closeFirebaseModal();
        updateFirebaseStatus();
    }
}

function updateFirebaseStatus() {
    const ids = ['firebase-status', 'firebase-status-admin'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (FirebaseManager.isConfigured()) {
            const cfg = FirebaseManager.getConfig();
            el.innerHTML = `<span style="color:#00ff66;font-weight:700;">&#9679; מחובר</span> <span style="color:#666;font-size:0.85em;">${cfg.projectId}</span>`;
        } else {
            el.innerHTML = '<span style="color:#444;">&#9679; לא מוגדר</span>';
        }
    });
}

// קבלת עדכון מאמן — ענן
function openCoachUpdateSheet() {
    document.getElementById('coach-update-overlay').style.display = 'block';
    document.getElementById('coach-update-sheet').style.display = 'flex';
}
function closeCoachUpdateSheet() {
    document.getElementById('coach-update-overlay').style.display = 'none';
    document.getElementById('coach-update-sheet').style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
    app.init();
    updateFirebaseStatus();
});
