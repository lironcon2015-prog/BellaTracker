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

const CURRENT_VERSION = '2.5.0-2'; // חייב להיות זהה ל-version.json

const FEEL_MAP_TEXT = { 'easy': 'קל', 'good': 'בינוני', 'hard': 'קשה' };

// ── פרופילים ──────────────────────────────────────────────────────────────────
// suffix מצורף למפתחות LocalStorage ולמסמכי Firestore (config/archive).
// female הוא הפרופיל ההיסטורי — מפתחות legacy ללא סיומת, אסור לשנות.
const PROFILES = {
    female: { name: 'בלה',   icon: '👩', isMale: false, suffix: '' },
    male:   { name: 'איתמר', icon: '👨', isMale: true,  suffix: '_male' },
    yamit:  { name: 'ימית',  icon: '👩', isMale: false, suffix: '_yamit' }
};

// ── ערכות צבעים ────────────────────────────────────────────────────────────────
// מקור אמת יחיד לתמות. cls ריק = ברירת המחדל ב-:root (ללא מחלקת body).
// מנותק מהמגדר/פרופיל — כל משתמש בוחר תמה בנפרד (נשמר ב-settings פר-פרופיל).
const THEMES = {
    rose:   { name: 'ורוד',  cls: '',             swatch: '#ff4d8d' }, // ברירת מחדל (בת)
    coral:  { name: 'אפרסק', cls: 'theme-coral',  swatch: '#ff7a7a' }, // בת
    purple: { name: 'סגול',  cls: 'theme-purple', swatch: '#a855f7' }, // בת
    blue:   { name: 'כחול',  cls: 'theme-male',   swatch: '#3b9dff' }, // בן
    green:  { name: 'ירוק',  cls: 'theme-green',  swatch: '#22c55e' }  // בן
};

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
        gender: 'female',   // העדפת שפה מגדרית — עצמאית מהפרופיל
        theme: 'rose',      // העדפת ערכת צבעים — עצמאית מהמגדר
        authLevel: 0
    },

    init: function() {
        try {
            this.applyVersionLabel();
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
            this.maybeShowOnboarding();
            // בדיקת עדכון גרסה אוטומטית בכל כניסה — לא חוסם את טעינת הממשק
            this.autoCheckForUpdate();
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
            if (this.state.activeProfile !== 'female') {
                // פרופילים נוספים (איתמר, ימית) מתחילים ריקים — אין תוכניות ברירת מחדל
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
        // female = מפתחות legacy ללא סיומת (אסור לשנות — אובדן נתונים)
        if (p === 'female') {
            return { ROUTINES: CONFIG.KEYS.ROUTINES, HISTORY: CONFIG.KEYS.HISTORY };
        }
        const suffix = (PROFILES[p] || PROFILES.female).suffix;
        return {
            ROUTINES: 'gymstart_routines' + suffix,
            HISTORY:  'gymstart_history' + suffix
        };
    },

    // מפתח ה-HISTORY של פרופיל מסוים (לא בהכרח הפעיל) — תואם getActiveKeys.
    // female משתמש במפתח legacy ללא סיומת.
    _historyKeyFor: function(profileId) {
        if (profileId === 'female') return CONFIG.KEYS.HISTORY;
        const suffix = (PROFILES[profileId] || PROFILES.female).suffix;
        return 'gymstart_history' + suffix;
    },

    initProfile: function() {
        const level = parseInt(localStorage.getItem('gymstart_auth_level') || '0');
        this.state.authLevel = level;
        const saved = localStorage.getItem('gymstart_active_profile');
        if (level === 0) {
            this.state.activeProfile = 'female';
        } else if (level === 1) {
            // מכשיר נעול לפרופיל מתאמן/ת — fallback ל-male לתאימות לאחור
            this.state.activeProfile = (saved && PROFILES[saved]) ? saved : 'male';
        } else if (level === 2) {
            this.state.activeProfile = (saved && PROFILES[saved]) ? saved : 'female';
        }
        // טעינת העדפות מגדר+תמה פר-פרופיל (עם ברירות מחדל לאחור)
        this.state.gender = this._getGenderPref();
        this.state.theme  = this._getThemePref();
    },

    // ── Helper: האם השפה מגדר זכר ──────────────────────────────────────────────
    isMale: function() {
        return this.state.gender === 'male';
    },

    applyProfileTheme: function() {
        const isMale = this.isMale();

        // החלת ערכת צבעים — הסרת כל מחלקות התמה ואז הוספת הנבחרת
        Object.values(THEMES).forEach(t => { if (t.cls) document.body.classList.remove(t.cls); });
        const themeCls = (THEMES[this.state.theme] || THEMES.rose).cls;
        if (themeCls) document.body.classList.add(themeCls);

        // החלפת אייקון דינמית (favicon + apple-touch-icon) — לפי המגדר
        const iconHref = isMale ? './icon-male.png' : './icon.png';
        document.querySelectorAll('link[rel="apple-touch-icon"], link[rel="icon"]').forEach(el => {
            el.href = iconHref;
        });

        // הברכה והתת-כותרת מנוהלות ב-renderHome (לפי שעה ומצב שבועי)
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

    // ── מראה ושפה — בורר מגדר (שפה) + בורר ערכת צבעים ───────────────────────────
    renderAppearancePanel: function() {
        const panel = document.getElementById('appearance-panel');
        if (!panel) return;

        // בורר מגדר — מתאים את שפת האפליקציה
        const genders = [ { id: 'female', label: 'נקבה' }, { id: 'male', label: 'זכר' } ];
        const genderBtns = genders.map(g => {
            const on = this.state.gender === g.id;
            return `<button onclick="app.setGender('${g.id}')" style="flex:1;padding:10px 4px;border-radius:10px;border:1.5px solid ${on?'var(--primary)':'rgba(255,255,255,0.15)'};background:${on?'var(--primary-dim)':'transparent'};color:${on?'var(--primary)':'#aaa'};font-family:var(--font);font-size:0.88rem;cursor:pointer;">${g.label}</button>`;
        }).join('');

        // בורר ערכת צבעים — swatch עגול לכל תמה
        const themeBtns = Object.keys(THEMES).map(id => {
            const t = THEMES[id];
            const on = this.state.theme === id;
            return `<button onclick="app.setTheme('${id}')" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px;border-radius:12px;border:1.5px solid ${on?'var(--primary)':'rgba(255,255,255,0.12)'};background:${on?'var(--primary-dim)':'transparent'};font-family:var(--font);cursor:pointer;flex:1;">
                <span style="width:26px;height:26px;border-radius:50%;background:${t.swatch};box-shadow:0 0 8px ${t.swatch};border:2px solid ${on?'#fff':'rgba(255,255,255,0.2)'};"></span>
                <span style="font-size:0.78rem;color:${on?'var(--primary)':'#aaa'};">${t.name}</span>
            </button>`;
        }).join('');

        panel.innerHTML = `
            <div class="oled-card compact">
                <div style="font-weight:600;margin-bottom:8px;">שפת האפליקציה</div>
                <div style="display:flex;gap:8px;margin-bottom:16px;">${genderBtns}</div>
                <div style="font-weight:600;margin-bottom:8px;">ערכת צבעים</div>
                <div style="display:flex;gap:8px;">${themeBtns}</div>
            </div>`;
    },

    setGender: function(g) {
        if (g !== 'male' && g !== 'female') return;
        this.haptic(5);
        this._setGenderPref(g);
        this.state.gender = g;
        this.applyProfileTheme();
        this.renderHome();
        this.renderAppearancePanel();
        this._schedulePrefsSync();
    },

    setTheme: function(id) {
        if (!THEMES[id]) return;
        this.haptic(5);
        this._setThemePref(id);
        this.state.theme = id;
        this.applyProfileTheme();
        this.renderAppearancePanel();
        this._schedulePrefsSync();
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
            const prof = PROFILES[p] || PROFILES.male;
            panel.innerHTML = `
                <div class="oled-card compact" style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.2em;">${prof.icon}</span>
                    <span style="color:var(--primary);">${prof.isMale ? 'מחובר כמתאמן' : 'מחוברת כמתאמנת'} — ${prof.name}</span>
                </div>`;
        } else if (level === 2) {
            const profileBtns = Object.keys(PROFILES).map(id => {
                const prof = PROFILES[id];
                const on = p === id;
                return `<button onclick="app.switchProfile('${id}')" style="flex:1;padding:10px 4px;border-radius:10px;border:1.5px solid ${on?'var(--primary)':'rgba(255,255,255,0.15)'};background:${on?'var(--primary-dim)':'transparent'};color:${on?'var(--primary)':'#aaa'};font-family:var(--font);font-size:0.88rem;cursor:pointer;">${prof.icon} ${prof.name}</button>`;
            }).join('');
            panel.innerHTML = `
                <div class="oled-card compact">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <span style="font-weight:600;">פרופיל פעיל</span>
                        <span style="font-size:0.8rem;color:var(--text-sec);">מצב מאמן 🔑</span>
                    </div>
                    <div style="display:flex;gap:8px;">
                        ${profileBtns}
                    </div>
                    <button class="admin-data-btn admin-data-accent" style="width:100%;margin-top:12px;" onclick="app.syncAllTraineesHistory()">
                        <span class="admin-data-icon">⬇</span>
                        <span class="admin-data-label">שחזר היסטוריה מכל המתאמנים</span>
                    </button>
                </div>`;
        }
    },

    submitAuthCode: function() {
        // קוד מתאמן/ת — נועל את המכשיר לפרופיל הספציפי
        const TRAINEE_PINS = { '1111': 'male', '2222': 'yamit' };
        const PIN_ADMIN = '9999';
        const input = document.getElementById('auth-pin-input');
        if (!input) return;
        const code = input.value.trim();
        if (code === PIN_ADMIN) {
            localStorage.setItem('gymstart_auth_level', '2');
            this.state.authLevel = 2;
            const saved = localStorage.getItem('gymstart_active_profile');
            this.state.activeProfile = (saved && PROFILES[saved]) ? saved : 'female';
            this.renderAuthPanel();
            this.applyProfileTheme();
            app.toast('מצב מאמן פעיל. ניתן לעבור בין פרופילים.');
        } else if (TRAINEE_PINS[code]) {
            const profId = TRAINEE_PINS[code];
            const prof = PROFILES[profId];
            const word = prof.isMale ? 'מתאמן' : 'מתאמנת';
            if (confirm(`מעבר לפרופיל ${word} (${prof.name}). הפעולה קבועה במכשיר זה. להמשיך?`)) {
                localStorage.setItem('gymstart_auth_level', '1');
                localStorage.setItem('gymstart_active_profile', profId);
                location.reload();
            }
        } else {
            app.toast('קוד שגוי.');
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
    // ── הזרקת מספר גרסה לתצוגה — תמיד מסונכרן עם CURRENT_VERSION ─────────────
    applyVersionLabel: function() {
        const tag = document.getElementById('version-tag');
        if (tag) tag.textContent = 'GymStart V' + CURRENT_VERSION;
        document.title = 'GymStart V' + CURRENT_VERSION;
    },

    // ── Toast — הודעות לא-חוסמות (מחליף alert) ──────────────────────────────
    toast: function(msg, type) {
        const host = document.getElementById('toast-host');
        if (!host) { console.log(msg); return; }
        const el = document.createElement('div');
        el.className = 'toast' + (type ? ' ' + type : '');
        el.setAttribute('role', 'status');
        el.textContent = msg;
        host.appendChild(el);
        // הסרה אוטומטית
        const dur = Math.min(5000, Math.max(2200, String(msg).length * 70));
        setTimeout(() => {
            el.classList.add('hide');
            setTimeout(() => el.remove(), 260);
        }, dur);
    },

    // ── Haptics עקביים ──────────────────────────────────────────────────────
    haptic: function(pattern) {
        if (navigator.vibrate) { try { navigator.vibrate(pattern || 8); } catch(e){} }
    },

    // ── פעמון סיום מנוחה (WebAudio — ללא קובץ חיצוני) ───────────────────────
    _restBell: function() {
        try {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // עדיין מרטטים, בלי צליל אם אין תנועה? צליל מותר — אך נשמור עדין
            }
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            this._audioCtx = this._audioCtx || new Ctx();
            const ctx = this._audioCtx;
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;
            [880, 1320].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const t = now + i * 0.16;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(t); osc.stop(t + 0.34);
            });
        } catch(e) {}
    },

    // ── Confetti — חגיגת שיא (ללא ספרייה) ───────────────────────────────────
    fireConfetti: function() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let host = document.getElementById('confetti-host');
        if (!host) {
            host = document.createElement('div');
            host.id = 'confetti-host';
            document.body.appendChild(host);
        }
        host.innerHTML = '';
        const colors = ['#ff4d8d', '#b832f0', '#ff6a4d', '#ffcf6b', '#ffffff', '#3b9dff'];
        const N = 70;
        for (let i = 0; i < N; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.background = colors[i % colors.length];
            const dur = 1.6 + Math.random() * 1.4;
            p.style.animationDuration = dur + 's';
            p.style.animationDelay = Math.random() * 0.4 + 's';
            p.style.opacity = (0.7 + Math.random() * 0.3).toFixed(2);
            p.style.transform = `scale(${(0.7 + Math.random() * 0.7).toFixed(2)})`;
            host.appendChild(p);
        }
        setTimeout(() => { if (host) host.innerHTML = ''; }, 3600);
    },

    // ── Onboarding לפעם ראשונה ──────────────────────────────────────────────
    _onboardSteps: [
        { icon: '💪', title: 'ברוכה הבאה ל-GymStart', body: 'האפליקציה שתלווה אותך בכל אימון — פשוט, ברור, ובלי בלבול. בואי נכיר אותה בקצרה.' },
        { icon: '📋', title: 'בחרי תוכנית והתחילי', body: 'במסך הבית לחצי "התחילי אימון", בחרי תוכנית, וקדימה. כל תרגיל מופיע אחד-אחד עם המשקל והחזרות.' },
        { icon: '⚡', title: 'רשמי כל סט', body: 'עדכני משקל וחזרות עם הכפתורים, סמני איך הרגשת, ולחצי "סיום סט". נעקוב אחרי ההתקדמות שלך אוטומטית.' },
        { icon: '🏆', title: 'תראי את ההתקדמות', body: 'בסוף כל אימון תקבלי סיכום ושיאים אישיים. ככל שתתאמני, נראה לך כמה השתפרת!' }
    ],
    _onboardIdx: 0,
    maybeShowOnboarding: function() {
        try {
            if (localStorage.getItem('gymstart_onboarded')) return;
            if (this.state.history && this.state.history.length > 0) {
                localStorage.setItem('gymstart_onboarded', '1');
                return;
            }
            if (this.state.tempActive || this.state.active.on) return;
            setTimeout(() => this.openOnboarding(), 450);
        } catch(e) {}
    },
    openOnboarding: function() {
        this._onboardIdx = 0;
        const ov = document.getElementById('onboarding-overlay');
        const sh = document.getElementById('onboarding-sheet');
        if (!ov || !sh) return;
        ov.style.display = 'block';
        sh.style.display = 'flex';
        this._renderOnboardingStep();
    },
    _renderOnboardingStep: function() {
        const step = this._onboardSteps[this._onboardIdx];
        if (!step) return;
        document.querySelector('#onboarding-sheet .onboarding-icon').textContent = step.icon;
        document.getElementById('onboarding-title').textContent = step.title;
        document.getElementById('onboarding-body').textContent = step.body;
        const dots = document.getElementById('onboarding-dots');
        dots.innerHTML = this._onboardSteps.map((s, i) =>
            `<span class="dot${i === this._onboardIdx ? ' active' : ''}"></span>`).join('');
        const isLast = this._onboardIdx === this._onboardSteps.length - 1;
        document.getElementById('onboarding-next').textContent = isLast ? 'בואי נתחיל!' : 'הבא';
    },
    onboardingNext: function() {
        this.haptic(6);
        if (this._onboardIdx < this._onboardSteps.length - 1) {
            this._onboardIdx++;
            this._renderOnboardingStep();
        } else {
            this.closeOnboarding();
        }
    },
    closeOnboarding: function() {
        try { localStorage.setItem('gymstart_onboarded', '1'); } catch(e) {}
        const ov = document.getElementById('onboarding-overlay');
        const sh = document.getElementById('onboarding-sheet');
        if (ov) ov.style.display = 'none';
        if (sh) sh.style.display = 'none';
    },

    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        const backBtn = document.getElementById('nav-back');
        const adminBtn = document.getElementById('btn-admin-home');
        if (screenId === 'screen-home') {
            backBtn.style.visibility = 'hidden';
            this.stopAllTimers();
            this._stopWorkoutTimer();
            this.state.active.on = false;
        } else {
            backBtn.style.visibility = 'visible';
        }
        // סרגל ניהול בנאבבר מיותר — הניווט עובר דרך ה-tab bar
        if (adminBtn) adminBtn.style.display = 'none';
        this.updateChrome(screenId);
    },

    // ── Bottom tab bar — ניווט ראשי ─────────────────────────────────────────
    tabNav: function(key) {
        this.haptic(5);
        if (key === 'home') this.nav('screen-home');
        else if (key === 'nutrition') { if (typeof Nutrition !== 'undefined') Nutrition.open(); }
        else if (key === 'history') this.showHistory();
        else if (key === 'settings') this.openAdminHome();
    },

    // עדכון מצב ה-chrome (tab bar + tab פעיל) לפי המסך הנוכחי
    updateChrome: function(screenId) {
        const bar = document.getElementById('tab-bar');
        if (!bar) return;
        // מסכים ממוקדים — מסתירים את סרגל הניווט
        const hideOn = ['screen-active', 'screen-summary', 'screen-overview'];
        bar.classList.toggle('hidden', hideOn.includes(screenId));
        const map = { 'screen-home': 'tab-home', 'screen-history': 'tab-history', 'screen-nutrition': 'tab-nutrition' };
        const activeTab = map[screenId];
        bar.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.id === activeTab));
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
            this.toast('הסט האחרון בוטל — אפשר לתקן');
        } else if (setIdx > 1) {
            // סט > 1 → חזרה לסט הקודם, ביטול הסט האחרון
            this._undoLastSet();
            this.state.active.setIdx--;
            this._restoreLoggingUI();
            this.toast('הסט האחרון בוטל — אפשר לתקן');
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
            this.toast('חזרה לתרגיל הקודם');
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
        const _ac = document.querySelector('.active-container');
        if (_ac) _ac.classList.remove('resting');
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
            // התרגיל הראשון — לחיץ ומתחיל את האימון (אינטואיטיבי)
            const isFirst = i === 0;
            const clickAttr = isFirst ? ' onclick="app.startWorkout()"' : '';
            const startClass = isFirst ? ' start-item' : '';
            const subLine = isFirst
                ? `<div class="overview-start-hint">לחצי כדי להתחיל מכאן</div>`
                : `<div class="overview-ex-sub">${ex.sets} סטים • ${unitLabel}</div>`;
            const rightSide = isFirst
                ? `<span class="overview-start-cue"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z"></path></svg></span>`
                : `<span class="overview-sets-tag">${ex.sets}×</span>`;
            list.innerHTML += `<div class="list-item ${targetClass}${startClass}"${clickAttr}>
                <div style="display:flex;align-items:center;gap:12px;flex:1;">
                    <span class="overview-num ${numClass}">${i+1}</span>
                    <div>
                        <div class="overview-ex-name">${ex.name}</div>
                        ${subLine}
                        ${targetLine}
                    </div>
                </div>
                ${rightSide}
            </div>`;
        });
    },

    renderHome: function() {
        const isMale = this.isMale();

        // ── ברכה לפי שעה ──
        const greetEl = document.getElementById('greeting');
        const subEl = document.getElementById('home-subtitle');
        const hr = new Date().getHours();
        let timeWord;
        if (hr < 12) timeWord = 'בוקר טוב';
        else if (hr < 17) timeWord = 'צהריים טובים';
        else if (hr < 21) timeWord = 'ערב טוב';
        else timeWord = 'לילה טוב';
        if (greetEl) greetEl.textContent = timeWord;

        // אימון אחרון
        const lastEl = document.getElementById('last-workout-display');
        if (this.state.history.length > 0) {
            const last = this.state.history[this.state.history.length - 1];
            const displayName = last.programTitle || last.program;
            lastEl.innerText = `${last.date} (${displayName})`;
        } else {
            lastEl.innerText = "טרם בוצע";
        }

        // ── נתונים ──
        const weekly  = this.calcWeeklyWorkouts();
        const target  = this._getWeeklyTarget();
        const streak  = this.calcStreak();
        const total   = this.state.history.length;
        const days    = this._calcDaysSince();
        const avg     = this._calcAvgTime();
        const isFull  = weekly >= target;

        // תת-כותרת מעודדת
        if (subEl) {
            if (isFull) subEl.textContent = isMale ? 'כל הכבוד! השלמת את היעד השבועי 🎉' : 'כל הכבוד! השלמת את היעד השבועי 🎉';
            else if (weekly > 0) subEl.textContent = `עוד ${target - weekly} אימונים ליעד השבועי`;
            else subEl.textContent = isMale ? 'מוכן לאימון של היום?' : 'מוכנה לאימון של היום?';
        }

        // ── טבעת התקדמות שבועית ──
        const CIRC = 327; // 2πr, r=52
        const pct = Math.min(1, target > 0 ? weekly / target : 0);
        const ring = document.getElementById('home-ring-prog');
        if (ring) {
            ring.style.strokeDashoffset = CIRC - (CIRC * pct);
            ring.classList.toggle('full', isFull);
        }
        document.getElementById('home-weekly-val').textContent = weekly;
        document.getElementById('home-weekly-target').textContent = target;
        const msgEl = document.getElementById('home-weekly-msg');
        if (msgEl) {
            if (isFull) msgEl.textContent = 'היעד הושלם — מעולה!';
            else if (weekly === 0) msgEl.textContent = 'בואי נתחיל את השבוע!';
            else msgEl.textContent = `${weekly} מתוך ${target} — ממשיכות!`;
        }

        // רצף שבועות + chip
        document.getElementById('home-streak-val').textContent = streak;
        const chip = document.getElementById('home-streak-chip');
        if (chip) {
            chip.style.display = streak > 0 ? 'inline-flex' : 'none';
            document.getElementById('home-streak-num').textContent = streak;
        }

        // מיני-סטטים
        document.getElementById('home-days-since').textContent = days !== null ? days : '—';
        document.getElementById('home-total-workouts').textContent = total;
        document.getElementById('home-avg-time').textContent = avg !== null ? avg : '—';

        // כרטיס תזונה בבית
        if (typeof Nutrition !== 'undefined' && Nutrition.renderHomeCard) Nutrition.renderHomeCard();
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

    _getSettingsKey: function() {
        // female = מפתח legacy ללא סיומת
        return 'gymstart_v1_settings' + (PROFILES[this.state.activeProfile] || PROFILES.female).suffix;
    },

    _getWeeklyTarget: function() {
        const key = this._getSettingsKey();
        try { return JSON.parse(localStorage.getItem(key) || '{}').weeklyTarget || 3; }
        catch(e) { return 3; }
    },

    _setWeeklyTarget: function(n) {
        const key = this._getSettingsKey();
        try {
            const s = JSON.parse(localStorage.getItem(key) || '{}');
            s.weeklyTarget = n;
            localStorage.setItem(key, JSON.stringify(s));
        } catch(e) {}
    },

    // ── העדפת מגדר (שפה) פר-פרופיל ──────────────────────────────────────────────
    _getGenderPref: function() {
        const fallback = (PROFILES[this.state.activeProfile] || PROFILES.female).isMale ? 'male' : 'female';
        try {
            const g = JSON.parse(localStorage.getItem(this._getSettingsKey()) || '{}').gender;
            return (g === 'male' || g === 'female') ? g : fallback;
        } catch(e) { return fallback; }
    },

    _setGenderPref: function(g) {
        const key = this._getSettingsKey();
        try {
            const s = JSON.parse(localStorage.getItem(key) || '{}');
            s.gender = g;
            localStorage.setItem(key, JSON.stringify(s));
        } catch(e) {}
    },

    // ── העדפת ערכת צבעים פר-פרופיל ──────────────────────────────────────────────
    _getThemePref: function() {
        const fallback = (PROFILES[this.state.activeProfile] || PROFILES.female).isMale ? 'blue' : 'rose';
        try {
            const t = JSON.parse(localStorage.getItem(this._getSettingsKey()) || '{}').theme;
            return THEMES[t] ? t : fallback;
        } catch(e) { return fallback; }
    },

    _setThemePref: function(t) {
        const key = this._getSettingsKey();
        try {
            const s = JSON.parse(localStorage.getItem(key) || '{}');
            s.theme = t;
            localStorage.setItem(key, JSON.stringify(s));
        } catch(e) {}
    },

    adjustWeeklyTarget: function(delta) {
        const next = Math.max(1, Math.min(7, this._getWeeklyTarget() + delta));
        this._setWeeklyTarget(next);
        document.getElementById('admin-weekly-target').textContent = next;
        this.renderHome();
        this._schedulePrefsSync();
    },

    // סנכרון העדפות דחוי ושקט — מאחד לחיצות מרובות לכתיבת ענן אחת
    _schedulePrefsSync: function() {
        if (this._prefsSyncTimer) clearTimeout(this._prefsSyncTimer);
        this._prefsSyncTimer = setTimeout(() => {
            if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
                FirebaseManager.savePrefsToCloud();
            }
        }, 1500);
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
            app.toast("התוכנית ריקה — הוסיפי תרגילים דרך עריכת התוכנית", "error"); return;
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

    // עדכון סרגל התקדמות הסשן — "תרגיל X מתוך Y"
    _updateSessionProgress: function() {
        const total = this.state.active.sessionExercises.length;
        const cur = this.state.active.exIdx;
        const segWrap = document.getElementById('sp-segments');
        const txt = document.getElementById('sp-text');
        if (segWrap) {
            let segs = '';
            for (let i = 0; i < total; i++) {
                const cls = i < cur ? 'sp-seg done' : (i === cur ? 'sp-seg current' : 'sp-seg');
                segs += `<div class="${cls}"></div>`;
            }
            segWrap.innerHTML = segs;
        }
        if (txt) txt.textContent = `תרגיל ${cur + 1} מתוך ${total}`;
    },

    loadActiveExercise: function() {
        const exInst = this.state.active.sessionExercises[this.state.active.exIdx];
        const exDef = this.getExerciseDef(exInst.id);

        this.state.active.totalSets = exInst.sets || 3;
        document.getElementById('ex-name').innerText = exInst.name;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
        this._updateSessionProgress();

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
                // איפוס מצב "הושג" לתרגיל חדש
                bannerEl.classList.remove('achieved');
                bannerEl.querySelector('.tb-label').textContent = 'יעד מאמן';
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
        const ac = document.querySelector('.active-container');
        if (ac) ac.classList.remove('resting');
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
            strip.innerHTML = '<div class="strip-first-set">✨ הסט הראשון שלך בתרגיל הזה — מכאן נתחיל לעקוב אחרי ההתקדמות שלך</div>';
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
        if (el) { el.innerText = newW % 1 === 0 ? newW : newW.toFixed(1); this._bump(el); }
        this.haptic(8);
    },

    _bump: function(el) {
        if (!el) return;
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    },

    stepReps: function(dir) {
        const s = this._stepSettings;
        if (!s) return;
        let newR = this.state.active.inputR + dir;
        if (newR < 1) newR = 1;
        if (newR > (s.rMax || 30)) newR = s.rMax || 30;
        this.state.active.inputR = newR;
        const el = document.getElementById('stepper-reps');
        if (el) { el.innerText = newR; this._bump(el); }
        this.haptic(8);
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
        this.haptic(6);
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
            if (r === 0) { app.toast("לא נמדד זמן — הפעילי את השעון", "error"); return; }
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
        this.haptic(10);

        // ── סימון מיידי של יעד מאמן שהושג (לא רק בסיכום) ──
        if (exInst.target) {
            const tW = exInst.target.w, tR = exInst.target.r;
            const wOk = !tW || w >= tW;
            const rOk = !tR || r >= tR;
            const banner = document.getElementById('target-banner');
            if (wOk && rOk && banner && banner.style.display !== 'none' && !banner.classList.contains('achieved')) {
                banner.classList.add('achieved');
                const lbl = banner.querySelector('.tb-label');
                if (lbl) lbl.textContent = '✓ הושג';
                this.toast('כל הכבוד! השגת את יעד המאמן 🎯', 'success');
                this.haptic([14, 50, 14]);
            }
        }

        const restTime = exInst.rest || 60;
        this.startRestTimer(restTime);

        if (this.state.active.setIdx < this.state.active.totalSets) {
            this.state.active.setIdx++;
            document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx} / ${this.state.active.totalSets}`;
            const upnext = document.getElementById('rest-upnext');
            if (upnext) upnext.textContent = `הבא: סט ${this.state.active.setIdx} מתוך ${this.state.active.totalSets}`;
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
            this.stopRestTimer();

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
        const ringWrap = area ? area.querySelector('.rest-ring-lg') : null;
        const eyebrow = document.getElementById('rest-eyebrow');
        if (disp) disp.classList.remove('rest-done');
        if (ringWrap) ringWrap.classList.remove('done');
        if (eyebrow) eyebrow.textContent = 'מנוחה';
        area.style.display = 'flex';
        // מצב מנוחה — מסתיר סטטיסטיקה ונותן זרקור לטיימר
        const container = document.querySelector('.active-container');
        if (container) container.classList.add('resting');
        this.state.active.restDuration = durationSec;
        if (!this.state.active.restStartTime || this.state.active.restStartTime === 0) {
            this.state.active.restStartTime = Date.now();
        }
        const MAX_OFFSET = 408;
        this._restRang = false;
        this.state.active.restInterval = setInterval(() => {
            const dur = this.state.active.restDuration || durationSec;
            const elapsed = Math.floor((Date.now() - this.state.active.restStartTime) / 1000);
            // ── ספירה למעלה (מאפס ומעלה) ──
            const m = Math.floor(elapsed / 60);
            const s = elapsed % 60;
            disp.innerText = `${m}:${s<10?'0'+s:s}`;
            // הטבעת מתמלאת עד תום זמן המנוחה המומלץ ואז נשארת מלאה
            const ratio = Math.min(elapsed / dur, 1);
            ring.style.strokeDashoffset = MAX_OFFSET - (MAX_OFFSET * ratio);
            // בסיום זמן המנוחה — מחליפים צבע לירוק + פעמון/רטט; הטיימר ממשיך לרוץ
            if (elapsed >= dur && !this._restRang) {
                this._restRang = true;
                this._restBell();
                this.haptic([60, 40, 60]);
                if (disp) disp.classList.add('rest-done');
                if (ringWrap) ringWrap.classList.add('done');
                if (eyebrow) eyebrow.textContent = 'מוכנה!';
                this.toast('זמן מנוחה הסתיים — קדימה לסט הבא! 💪', 'success');
            }
        }, 250);
        this.saveActiveState();
    },

    stopRestTimer: function() {
        if(this.state.active.restInterval) clearInterval(this.state.active.restInterval);
        this.state.active.restInterval = null;
        document.getElementById('rest-timer-area').style.display = 'none';
        const container = document.querySelector('.active-container');
        if (container) container.classList.remove('resting');
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
        this.renderSummaryCards(this.state.active.summary);
        this.renderSummaryStats(this.state.active.summary);
        this.renderWinCard(this.state.active.summary);
        this.renderAchievedTargets(achievedTargets);
        this.nav('screen-summary');
        // חגיגת שיא — confetti אם שיפרה תרגיל או השיגה יעד מאמן
        const winShown = document.getElementById('win-card')?.style.display === 'block';
        const achShown = document.getElementById('achieved-targets-card')?.style.display === 'block';
        if (winShown || achShown) {
            setTimeout(() => { this.fireConfetti(); this.haptic([18, 60, 18, 60, 30]); }, 220);
        }
        // שמירה אוטומטית להיסטוריה — האימון נשמר גם בלי לחיצה על "סיים, העתק ושמור".
        // חייב לרוץ אחרי renderWinCard (שמשווה מול ההיסטוריה ללא האימון הנוכחי).
        // הבדיקה על active.on מונעת שמירה כפולה בקריאה חוזרת ל-finishWorkout.
        if (this.state.active.on) {
            this.state.active.on = false;
            this._saveSummaryToHistory(this.state.active.summary);
        }
    },

    // שמירת סיכום אימון להיסטוריה + ניקוי state פעיל + sync לענן (ללא reload)
    _saveSummaryToHistory: function(summary) {
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
                if (!ok) app.toast('לא ניתן לשמור לענן. הנתונים נשמרו מקומית.');
            });
        }
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

    // ── כרטיסי סיכום מובנים — מחליפים את דאמפ הטקסט במסך הסיכום ──────────────
    renderSummaryCards: function(summary) {
        const host = document.getElementById('summary-cards');
        if (!host) return;
        let html = '';
        summary.data.forEach(ex => {
            if (ex.sets.length === 0) return;
            const setsHtml = ex.sets.map((s, i) => {
                const feelStr = FEEL_MAP_TEXT[s.feel] || 'טוב';
                return `<div class="sum-set-row">
                    <span class="sum-set-num">סט ${i+1}</span>
                    <span class="sum-set-val">${this._formatSetDisplay(ex.id, s)}</span>
                    <span class="sum-set-feel ${s.feel || 'good'}">${feelStr}</span>
                </div>`;
            }).join('');
            html += `<div class="sum-ex-card">
                <div class="sum-ex-head">
                    <span class="sum-ex-name">${ex.name}</span>
                    <span class="sum-ex-count">${ex.sets.length} סטים</span>
                </div>
                ${setsHtml}
            </div>`;
        });
        host.innerHTML = html || '<div class="gs-empty-msg">לא תועדו סטים באימון זה</div>';
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
        // השמירה להיסטוריה כבר בוצעה אוטומטית ב-finishWorkout — כאן רק העתקה + reload
        const summary = this.state.active.summary;
        if (!summary) return;
        this.state.active.summary = null; // מניעת הפעלה כפולה בלחיצה כפולה

        // פידבק ויזואלי מיידי — נראה לחוץ עד ה-reload
        const saveBtn = document.querySelector('#screen-summary .btn-primary.big-btn');
        if (saveBtn) saveBtn.classList.add('btn-committed');

        // העתקה ל-clipboard — fire and forget
        const txt = this.generateLogText(summary);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).catch(() => {});
        } else {
            try {
                const ta = document.createElement('textarea');
                ta.value = txt;
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            } catch(e) {}
        }

        // sync חוזר לענן לפני ה-reload — מבטיח שהאימון הגיע לענן גם אם
        // ה-sync האוטומטי מ-finishWorkout עדיין באוויר (הפעולה אידמפוטנטית)
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
            FirebaseManager.saveArchiveToCloud().then(ok => {
                if (!ok) app.toast('לא ניתן לשמור לענן. הנתונים נשמרו מקומית.');
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
        document.getElementById('user-sel-title').innerText = this.isMale() ? "הוסף תרגיל" : "הוסיפי תרגיל";
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
        if (this.state.active.on) { app.toast("לא ניתן להיכנס לניהול בזמן אימון פעיל.", "error"); return; }
        document.getElementById('admin-modal').style.display = 'flex';
        document.getElementById('admin-view-home').style.display = 'flex';
        document.getElementById('admin-view-edit').style.display = 'none';
        document.getElementById('admin-view-selector').style.display = 'none';
        document.getElementById('admin-view-ex-manager').style.display = 'none';
        document.getElementById('admin-view-ex-edit').style.display = 'none';
        this.renderAdminList();
        document.getElementById('admin-weekly-target').textContent = this._getWeeklyTarget();
        this.renderAppearancePanel();
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
                    <button class="icon-action-btn" aria-label="שכפל" onclick="event.stopPropagation(); app.duplicateProgram('${pid}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
                    <button class="icon-action-btn danger" aria-label="מחק" onclick="event.stopPropagation(); app.deleteProgram('${pid}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg></button>
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
                    <span class="er-num">${i+1}</span>
                    <div class="row-title">${ex.name}</div>
                    <div class="row-ctrls">
                        <button class="icon-action-btn" aria-label="העלה" onclick="app.moveEx(${i}, -1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg></button>
                        <button class="icon-action-btn" aria-label="הורד" onclick="app.moveEx(${i}, 1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>
                        <button class="icon-action-btn danger" aria-label="הסר" onclick="app.removeEx(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                </div>
                <div class="row-btm">
                    <div class="stepper">
                        <div class="step-label">סטים</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'sets', -1)">−</button>
                        <div class="step-val">${ex.sets}</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'sets', 1)">+</button>
                    </div>
                    <div class="stepper">
                        <div class="step-label">מנוחה</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'rest', -15)">−</button>
                        <div class="step-val">${ex.rest||60}</div>
                        <button class="step-btn" onclick="app.updateTempEx(${i}, 'rest', 15)">+</button>
                    </div>
                    <button class="tip-btn ${hasTip}" onclick="app.openTipModal(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.7.6.8 1.4.8 2.4h6c0-1 .1-1.8.8-2.4A6 6 0 0 0 12 3z"/></svg> טיפ</button>
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
                if (json.type !== 'config') { app.toast("קובץ שגוי.", "error"); return; }
                if(confirm("עדכון תוכניות יחליף את ההגדרות ואת מאגר התרגילים. להמשיך?")) {
                    app.state.routines = json.routines;
                    if(json.exercises) app.state.exercises = json.exercises;
                    app.saveData();
                    if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
                        FirebaseManager.saveConfigToCloud();
                    }
                    app.toast("ההגדרות עודכנו בהצלחה!", "success");
                    location.reload();
                }
            } catch(err) { app.toast("קובץ לא תקין", "error"); }
        };
        reader.readAsText(file);
        input.value = '';
    },

    /* --- FULL BACKUP — קובץ אחד עם כל הנתונים כולל חיבור ה-Firebase --- */

    // כלי מאמן: שחזור היסטוריית כל המתאמנים מהענן בלחיצה אחת.
    // מושך עבור כל פרופיל את ההיסטוריה מהענן וכותב למפתח המקומי שלו, כך
    // שבמעבר בין פרופילים המאמן רואה נתונים מעודכנים. זמין רק במצב מאמן.
    syncAllTraineesHistory: async function() {
        if (this.state.authLevel < 2) { app.toast('פעולה זמינה במצב מאמן בלבד.'); return; }
        if (typeof FirebaseManager === 'undefined' || !FirebaseManager.isConfigured()) {
            app.toast('Firebase לא מוגדר. הגדר חיבור תחילה.', 'error'); return;
        }
        app.toast('מושך היסטוריה מכל המתאמנים...');
        const res = await FirebaseManager.restoreAllArchivesToLocal();
        if (!res) return;
        const updated = res.profiles.filter(p => p.ok).length;
        if (!updated) { app.toast('לא נמצאה היסטוריה בענן לאף פרופיל.', 'error'); return; }
        app.toast(`עודכנו ${updated} פרופילים — ${res.totalWorkouts} אימונים. מרענן...`, 'success');
        // reload כדי שמסך ההיסטוריה של הפרופיל הפעיל יתרנדר מחדש מהנתונים החדשים
        setTimeout(() => location.reload(), 1300);
    },

    exportFullBackup: function() {
        // צילום מלא של כל מפתחות האפליקציה ב-LocalStorage —
        // כולל gymstart_firebase_config (מפתחות החיבור לענן)
        const keys = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf('gymstart_') === 0) keys[k] = localStorage.getItem(k);
        }
        const data = {
            type: 'full_backup',
            ver: CURRENT_VERSION,
            date: new Date().toLocaleDateString(),
            keys: keys
        };
        this.downloadJSON(data, `gymstart_full_backup_${Date.now()}.json`);
        app.toast('קובץ שחזור מלא נוצר — שמרי אותו במקום בטוח (כולל את חיבור ה-Firebase).');
    },

    importFullBackup: function(input) {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                if (json.type !== 'full_backup' || !json.keys) {
                    app.toast('קובץ שגוי — נדרש קובץ שחזור מלא.', 'error'); return;
                }
                if (!confirm('שחזור מלא יחליף את כל נתוני האפליקציה במכשיר זה, כולל חיבור ה-Firebase. להמשיך?')) return;
                Object.keys(json.keys).forEach(k => localStorage.setItem(k, json.keys[k]));
                app.toast('השחזור הושלם!', 'success');
                location.reload();
            } catch(err) { app.toast('קובץ לא תקין', 'error'); }
        };
        reader.readAsText(file);
        input.value = '';
    },

    // ייצוא מפתחות ה-Firebase בלבד — קובץ קטן לחיבור מכשיר חדש לענן
    exportFirebaseKeys: function() {
        const cfgStr = localStorage.getItem(FirebaseManager.KEY_FIREBASE_CONFIG);
        if (!cfgStr) { app.toast('אין חיבור Firebase מוגדר במכשיר זה.', 'error'); return; }
        const data = {
            type: 'firebase_keys',
            ver: CURRENT_VERSION,
            date: new Date().toLocaleDateString(),
            keys: { [FirebaseManager.KEY_FIREBASE_CONFIG]: cfgStr }
        };
        this.downloadJSON(data, `gymstart_firebase_keys_${Date.now()}.json`);
        app.toast('קובץ מפתחות Firebase נוצר — שמור במקום בטוח.');
    },

    // שחזור מפתחות ה-Firebase בלבד מתוך קובץ שחזור מלא — לא נוגע בשאר הנתונים
    importFirebaseKeysOnly: function(input) {
        const file = input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                // תומך גם בקובץ מפתחות ייעודי וגם בקובץ גיבוי מלא
                const isKeysFile = (json.type === 'firebase_keys' || json.type === 'full_backup') && json.keys;
                const cfgStr = isKeysFile ? json.keys[FirebaseManager.KEY_FIREBASE_CONFIG] : null;
                if (!cfgStr) { app.toast('לא נמצאו מפתחות Firebase בקובץ.', 'error'); return; }
                let cfg;
                try { cfg = JSON.parse(cfgStr); } catch(e2) { cfg = null; }
                if (!cfg || !cfg.apiKey || !cfg.projectId) {
                    app.toast('מפתחות ה-Firebase בקובץ אינם תקינים.', 'error'); return;
                }
                localStorage.setItem(FirebaseManager.KEY_FIREBASE_CONFIG, cfgStr);
                app.toast('חיבור ה-Firebase שוחזר! שאר הנתונים לא שונו.', 'success');
                location.reload();
            } catch(err) { app.toast('קובץ לא תקין', 'error'); }
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
                    app.toast("ההיסטוריה עודכנה.", "success");
                }
            } catch(err) { app.toast("שגיאה בקובץ", "error"); }
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
        const traineeWord = this.isMale() ? 'המתאמן' : 'המתאמנת';
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isConfigured()) {
            FirebaseManager.saveConfigToCloud().then(ok => {
                app.toast(ok
                    ? `✓ הקונפיג עודכן ונשלח לענן!\n${traineeWord} יכול/ה ללחוץ "קבל עדכון מהמאמן".`
                    : 'הקונפיג נשמר מקומית, אך הייתה שגיאה בשליחה לענן.');
            });
        } else {
            app.toast(`הקונפיג נשמר.\nלא מוגדר חיבור ענן — ייצא ידנית כדי לשלוח ל${traineeWord}.`);
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
                        <span class="month-chevron ${isCurrentMonth ? 'open' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
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
        if (chevron) chevron.classList.toggle('open', !isOpen);
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
        if(this.state.historySelection.length === 0) { app.toast("לא נבחר אימון", "error"); return; }
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

        if (filtered.length === 0) { app.toast("לא נמצאו אימונים בטווח זה.", "error"); return; }

        let fullTxt = '';
        filtered.sort((a,b) => (a.timestamp||0) - (b.timestamp||0)).forEach((h, i) => {
            fullTxt += this.generateLogText(h);
            if (i < filtered.length - 1) fullTxt += "----------------\n\n";
        });
        this.copyText(fullTxt);
        this.closeRangeSheet();
    },

    /* --- CHECK FOR UPDATE ───────────────────────────────────────────────── */

    // בדיקה אוטומטית ושקטה בכל כניסה — אם יש גרסה חדשה, מנקה cache, מעדכן
    // Service Worker ומרענן. לא מציגה כלום אם האפליקציה מעודכנת.
    autoCheckForUpdate: async function() {
        // לא מפריעים באמצע אימון פעיל — נבדוק בכניסה הבאה
        if (this.state.active && this.state.active.on) return;
        try {
            const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.version || data.version === CURRENT_VERSION) return;
            // מניעת לולאת רענון: אם כבר ניסינו לעדכן לגרסה הזו בסשן הזה — עצור
            const GUARD = 'gymstart_update_attempt';
            if (sessionStorage.getItem(GUARD) === data.version) return;
            sessionStorage.setItem(GUARD, data.version);
            app.toast('מתקין עדכון לגרסה ' + data.version + '...');
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(k => caches.delete(k)));
            }
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map(r => r.update().catch(() => {})));
            }
            setTimeout(() => window.location.reload(true), 700);
        } catch(e) {
            // כשל שקט — לא מפריעים למשתמש בכניסה (למשל offline)
        }
    },

    checkForUpdate: async function() {
        try {
            const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
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
                app.toast('האפליקציה מעודכנת (v' + CURRENT_VERSION + ')');
            }
        } catch(e) {
            app.toast('לא ניתן לבדוק עדכונים. בדקי חיבור לאינטרנט.');
        }
    },

    /* --- UTILITIES --- */
    copyText: function(txt) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).then(() => app.toast("הועתק!", "success"));
        } else {
            const ta = document.createElement('textarea');
            ta.value = txt;
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            app.toast("הועתק!", "success");
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

    // סיומת מסמכי Firestore לפי הפרופיל הפעיל ('' לבלה, '_male', '_yamit')
    _docSuffix() {
        return (PROFILES[app.state.activeProfile] || PROFILES.female).suffix;
    },

    // ── Archive ───────────────────────────────────────────────────────────────

    async saveArchiveToCloud() {
        if (!this.init()) return false;
        try {
            const archiveDoc = 'archive' + this._docSuffix();
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
        if (!this.init()) { app.toast('Firebase לא מוגדר.'); return; }
        try {
            const archiveDoc = 'archive' + this._docSuffix();
            const historyKey = app.getActiveKeys().HISTORY;
            const doc = await this._db.collection('gymstart_data').doc(archiveDoc).get();
            if (!doc.exists || !doc.data().items) { app.toast('לא נמצאה היסטוריה בענן.'); return; }
            localStorage.setItem(historyKey, JSON.stringify(doc.data().items));
            // דגל — בטעינה הבאה app.init יציג badge אם יש יעדים שלא אושרו
            localStorage.setItem('gymstart_check_ach_on_load', '1');
            app.toast('ההיסטוריה שוחזרה מהענן!');
            location.reload();
        } catch(e) { app.toast("שגיאה בטעינה: " + e.message, "error"); }
    },

    // ── כלי מאמן: שחזור היסטוריה מהענן לכל הפרופילים בלחיצה אחת ───────────────
    // עובר על כל הפרופילים, קורא את מסמך archive<suffix> מ-Firestore וכותב
    // אותו למפתח ה-HISTORY המקומי של אותו פרופיל. כך מעבר בין פרופילים מציג
    // היסטוריה מעודכנת. לשימוש המאמן בלבד (authLevel === 2).
    async restoreAllArchivesToLocal() {
        if (!this.init()) { app.toast('Firebase לא מוגדר.'); return null; }
        const profiles = [];
        let totalWorkouts = 0;
        for (const id of Object.keys(PROFILES)) {
            const prof = PROFILES[id];
            const archiveDoc = 'archive' + prof.suffix;
            const historyKey = app._historyKeyFor(id);
            let count = 0, ok = false;
            try {
                const doc = await this._db.collection('gymstart_data').doc(archiveDoc).get();
                if (doc.exists && Array.isArray(doc.data().items)) {
                    localStorage.setItem(historyKey, JSON.stringify(doc.data().items));
                    count = doc.data().items.length;
                    totalWorkouts += count;
                    ok = true;
                }
            } catch(e) {
                console.error('GymStart restoreAllArchives ' + id, e);
            }
            profiles.push({ id, name: prof.name, count, ok });
        }
        return { profiles, totalWorkouts };
    },

    // ── Config ────────────────────────────────────────────────────────────────

    async saveConfigToCloud() {
        if (!this.init()) return false;
        try {
            const profileDoc = 'config' + this._docSuffix();
            // תוכניות אימון + העדפות פרופיל — נפרד לפי פרופיל
            // (מחרוזות JSON גולמיות; null במקום undefined — Firestore דוחה undefined)
            await this._db.collection('gymstart_data').doc(profileDoc).set({
                routines: app.state.routines,
                settings: localStorage.getItem(app._getSettingsKey()) || null,
                seenBadges: (typeof app._seenKey === 'function' && localStorage.getItem(app._seenKey())) || null,
                // תזונה — פר פרופיל (מחרוזות JSON גולמיות)
                nutritionLog: (typeof Nutrition !== 'undefined' && localStorage.getItem(Nutrition._keys().LOG)) || null,
                nutritionDaily: (typeof Nutrition !== 'undefined' && localStorage.getItem(Nutrition._keys().DAILY)) || null,
                nutritionTargets: (typeof Nutrition !== 'undefined' && localStorage.getItem(Nutrition._keys().TARGETS)) || null,
                updatedAt: Date.now()
            });
            // מאגר תרגילים — משותף לכל הפרופילים
            await this._db.collection('gymstart_data').doc('exercises_bank').set({
                exercises: app.state.exercises,
                updatedAt: Date.now()
            });
            // מאגר מזון (FOOD_DB) — משותף לכל הפרופילים
            if (typeof Nutrition !== 'undefined') {
                await this._db.collection('gymstart_data').doc('food_db').set({
                    foodDb: Nutrition.loadFoodDb(),
                    updatedAt: Date.now()
                });
            }
            return true;
        } catch(e) {
            console.error('GymStart saveConfig:', e);
            return false;
        }
    },

    // סנכרון תזונה אינקרמנטלי (debounced ע"י Nutrition._cloudSyncSoon) — merge כדי לא לדרוס
    async saveNutritionToCloud() {
        if (typeof Nutrition === 'undefined' || !this.init()) return false;
        try {
            const profileDoc = 'config' + this._docSuffix();
            const k = Nutrition._keys();
            await this._db.collection('gymstart_data').doc(profileDoc).set({
                nutritionLog: localStorage.getItem(k.LOG) || null,
                nutritionDaily: localStorage.getItem(k.DAILY) || null,
                nutritionTargets: localStorage.getItem(k.TARGETS) || null,
                updatedAt: Date.now()
            }, { merge: true });
            await this._db.collection('gymstart_data').doc('food_db').set({
                foodDb: Nutrition.loadFoodDb(), updatedAt: Date.now()
            }, { merge: true });
            return true;
        } catch(e) { console.error('GymStart saveNutrition:', e); return false; }
    },

    async loadConfigFromCloud() {
        if (!this.init()) { app.toast('Firebase לא מוגדר.'); return; }
        try {
            const profileDoc = 'config' + this._docSuffix();
            const routinesKey = app.getActiveKeys().ROUTINES;
            const [configDoc, exDoc, foodDoc] = await Promise.all([
                this._db.collection('gymstart_data').doc(profileDoc).get(),
                this._db.collection('gymstart_data').doc('exercises_bank').get(),
                this._db.collection('gymstart_data').doc('food_db').get()
            ]);
            if (!configDoc.exists) {
                app.toast('לא נמצא קונפיג בענן לפרופיל זה.\nגבה קודם מהמכשיר הנוכחי.');
                return;
            }
            const data = configDoc.data();
            if (data.routines) localStorage.setItem(routinesKey, JSON.stringify(data.routines));
            // העדפות פרופיל — יעד שבועי ודגלי הישגים שכבר נחגגו
            if (data.settings) localStorage.setItem(app._getSettingsKey(), data.settings);
            if (data.seenBadges && typeof app._seenKey === 'function') localStorage.setItem(app._seenKey(), data.seenBadges);
            // תזונה — פר פרופיל + מאגר מזון משותף
            if (typeof Nutrition !== 'undefined') {
                const k = Nutrition._keys();
                if (data.nutritionLog)     localStorage.setItem(k.LOG, data.nutritionLog);
                if (data.nutritionDaily)   localStorage.setItem(k.DAILY, data.nutritionDaily);
                if (data.nutritionTargets) localStorage.setItem(k.TARGETS, data.nutritionTargets);
                if (foodDoc.exists && foodDoc.data().foodDb) localStorage.setItem(k.FOODDB, JSON.stringify(foodDoc.data().foodDb));
            }
            // תרגילים: מ-exercises_bank, fallback ל-config.exercises (תאימות לאחור)
            if (exDoc.exists && exDoc.data().exercises) {
                localStorage.setItem(CONFIG.KEYS.EXERCISES, JSON.stringify(exDoc.data().exercises));
            } else if (data.exercises) {
                localStorage.setItem(CONFIG.KEYS.EXERCISES, JSON.stringify(data.exercises));
            }
            app.toast('הקונפיג שוחזר מהענן!');
            location.reload();
        } catch(e) { app.toast("שגיאה בטעינה: " + e.message, "error"); }
    },

    // ── Prefs ─────────────────────────────────────────────────────────────────

    // העדפות פרופיל בלבד (יעד שבועי + דגלי הישגים) — merge:true כדי לא לדרוס
    // תוכניות בענן כשנשלח ממכשיר מתאמנת עם קונפיג ישן
    async savePrefsToCloud() {
        if (!this.init()) return false;
        try {
            const profileDoc = 'config' + this._docSuffix();
            await this._db.collection('gymstart_data').doc(profileDoc).set({
                settings: localStorage.getItem(app._getSettingsKey()) || null,
                seenBadges: (typeof app._seenKey === 'function' && localStorage.getItem(app._seenKey())) || null,
                updatedAt: Date.now()
            }, { merge: true });
            return true;
        } catch(e) {
            console.error('GymStart savePrefs:', e);
            return false;
        }
    },

    // ── Upload All ────────────────────────────────────────────────────────────

    async uploadAllToCloud() {
        if (!this.init()) { app.toast('Firebase לא מוגדר. הגדר חיבור תחילה.'); return; }
        try {
            const archiveOk = await this.saveArchiveToCloud();
            const configOk  = await this.saveConfigToCloud();
            app.toast(archiveOk && configOk ? 'כל הנתונים הועלו לענן!' : 'חלק מהנתונים לא הועלו. בדוק חיבור.');
        } catch(e) { app.toast("שגיאה: " + e.message, "error"); }
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
    if (!raw) { app.toast('יש להדביק את בלוק ה-firebaseConfig.'); return; }

    let jsonStr = raw;
    // נרמול גרשיים מתולתלים (iOS/WhatsApp) לגרשיים ישרים
    jsonStr = jsonStr.replace(/[\u201C\u201D\u201E]/g, '"').replace(/[\u2018\u2019\u201A]/g, "'");
    jsonStr = jsonStr.replace(/^[\s\S]*?=\s*/, '').replace(/;?\s*$/, '').trim();
    jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    jsonStr = jsonStr.replace(/:\s*'([^']*)'/g, ': "$1"');
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    let cfg;
    try { cfg = JSON.parse(jsonStr); }
    catch(e) { app.toast('פורמט לא תקין. ודא שהדבקת את הבלוק המלא מ-Firebase Console.'); return; }

    if (!cfg.apiKey || !cfg.projectId) { app.toast('חסרים apiKey או projectId.'); return; }

    FirebaseManager.saveConfig(cfg);
    FirebaseManager._initialized = false;
    FirebaseManager._db = null;
    closeFirebaseModal();
    updateFirebaseStatus();
    app.toast('חיבור Firebase נשמר!');
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
