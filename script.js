/**
 * GYMPRO START - גרסה למתחילות
 * לוגיקה: פשוטה, FBW, הזרקת נתונים, אדמין נסתר
 */

// --- Constants & Database ---

// בנק תרגילים (לשימוש האדמין)
const EXERCISE_BANK = [
    { id: 'goblet_squat', name: 'סקוואט עם משקולת (גובלט)', unit: 'kg' },
    { id: 'chest_press', name: 'לחיצת חזה עם משקולות', unit: 'kg' },
    { id: 'rdl', name: 'דדליפט רומני (משקולות)', unit: 'kg' },
    { id: 'lat_pulldown', name: 'משיכה בפולי עליון', unit: 'plates' },
    { id: 'shoulder_press', name: 'לחיצת כתפיים בישיבה', unit: 'kg' },
    { id: 'cable_row', name: 'חתירה בפולי תחתון', unit: 'plates' },
    { id: 'side_plank', name: 'פלאנק צידי (בטן)', unit: 'bodyweight' },
    { id: 'bicep_curl', name: 'כפיפת מרפקים (יד קדמית)', unit: 'kg' },
    { id: 'tricep_pushdown', name: 'פשיטת מרפקים (פולי עליון)', unit: 'plates' },
    { id: 'leg_press', name: 'לחיצת רגליים (מכונה)', unit: 'kg' },
    { id: 'crunches', name: 'כפיפות בטן', unit: 'bodyweight' },
    { id: 'bicycle', name: 'בטן אופניים', unit: 'bodyweight' }
];

// התוכנית ברירת מחדל (FBW)
const DEFAULT_ROUTINE = [
    { id: 'goblet_squat', name: 'סקוואט עם משקולת (גובלט)', unit: 'kg', note: 'לשמור גב זקוף, עקבים יציבים בקרקע' },
    { id: 'chest_press', name: 'לחיצת חזה עם משקולות', unit: 'kg', note: 'לשמור על טכניקה יציבה' },
    { id: 'rdl', name: 'דדליפט רומני (משקולות)', unit: 'kg', note: 'לרדת עד מתחת לברך, גב ישר' },
    { id: 'lat_pulldown', name: 'משיכה בפולי עליון', unit: 'plates', note: 'למשוך למרכז החזה' },
    { id: 'shoulder_press', name: 'לחיצת כתפיים בישיבה', unit: 'kg', note: 'להשלים טווח תנועה מלא' },
    { id: 'cable_row', name: 'חתירה בפולי תחתון', unit: 'plates', note: 'מרפקים צמודים לגוף' },
    { id: 'side_plank', name: 'פלאנק צידי (בטן)', unit: 'bodyweight', note: 'להקפיד על אגן גבוה' }
];

// נתונים היסטוריים להזרקה (Seeding)
const SEED_HISTORY = [
    {
        date: "אימון קודם",
        timestamp: Date.now() - 86400000,
        summary: "אימון מיובא מהעבר",
        data: {
            'goblet_squat': { w: 10, r: 12 },
            'chest_press': { w: 7, r: 12 },
            'rdl': { w: 10, r: 12 },
            'lat_pulldown': { w: 6, r: 12 },
            'shoulder_press': { w: 4, r: 12 },
            'cable_row': { w: 6, r: 12 },
            'side_plank': { w: 0, r: 45 } // 0 weight means time based in logic
        }
    }
];

// --- State Management ---
let state = {
    routine: [],
    history: [],
    currentWorkout: {
        startTime: null,
        log: {}, // { exId: [ {w, r, feel} ] }
    },
    activeExIndex: 0,
    editingExId: null // For admin
};

// --- Storage Manager ---
const Storage = {
    ROUTINE_KEY: 'gymstart_routine',
    HISTORY_KEY: 'gymstart_history',
    SEEDED_KEY: 'gymstart_seeded',

    load() {
        // 1. Load Routine
        const savedRoutine = localStorage.getItem(this.ROUTINE_KEY);
        if (savedRoutine) {
            state.routine = JSON.parse(savedRoutine);
        } else {
            state.routine = JSON.parse(JSON.stringify(DEFAULT_ROUTINE));
            this.saveRoutine();
        }

        // 2. Load History & Seed if needed
        const isSeeded = localStorage.getItem(this.SEEDED_KEY);
        const savedHistory = localStorage.getItem(this.HISTORY_KEY);
        
        if (savedHistory) {
            state.history = JSON.parse(savedHistory);
        } else {
            state.history = [];
        }

        if (!isSeeded) {
            // Inject seed data
            state.history.push(...SEED_HISTORY);
            localStorage.setItem(this.SEEDED_KEY, 'true');
            this.saveHistory();
        }
    },

    saveRoutine() {
        localStorage.setItem(this.ROUTINE_KEY, JSON.stringify(state.routine));
    },

    saveHistory() {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(state.history));
    },
    
    getLastLog(exId) {
        // Search history backwards
        for (let i = state.history.length - 1; i >= 0; i--) {
            const workout = state.history[i];
            if (workout.data && workout.data[exId]) {
                return workout.data[exId];
            }
        }
        return null;
    }
};

// --- App Flow ---

function initApp() {
    Storage.load();
    updateHomeStatus();
    navigate('ui-home');
}

function updateHomeStatus() {
    const last = state.history[state.history.length - 1];
    if (last) {
        const d = new Date(last.timestamp);
        // If it's the seed data (fake timestamp), show generic text
        if (last.summary === "אימון מיובא מהעבר") {
            document.getElementById('last-workout-date').innerText = "לפני מספר ימים";
        } else {
            document.getElementById('last-workout-date').innerText = d.toLocaleDateString('he-IL');
        }
    }
}

function navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    const backBtn = document.getElementById('nav-back');
    if (screenId === 'ui-home') backBtn.style.visibility = 'hidden';
    else backBtn.style.visibility = 'visible';
    
    // Smooth scroll top
    window.scrollTo(0,0);
}

function goBack() {
    const active = document.querySelector('.screen.active').id;
    if (active === 'ui-active') {
        if(confirm("לצאת מהאימון? הנתונים לא יישמרו.")) navigate('ui-overview');
    } else if (active === 'ui-overview') {
        navigate('ui-home');
    } else if (active === 'ui-history' || active === 'ui-summary') {
        navigate('ui-home');
    }
}

// --- Workout Logic ---

function startFlow() {
    renderOverview();
    navigate('ui-overview');
}

function renderOverview() {
    const list = document.getElementById('overview-list');
    list.innerHTML = '';
    
    state.routine.forEach((ex, idx) => {
        const div = document.createElement('div');
        div.className = 'action-card';
        div.style.background = 'var(--card-bg)';
        div.style.border = '1px solid var(--border)';
        div.innerHTML = `
            <div style="font-weight:700; font-size:1.1em; color:white;">${idx + 1}. ${ex.name}</div>
        `;
        list.appendChild(div);
    });

    // Check for general note (Optional - currently using first ex note as placeholder if needed, or separate logic)
    // For this version, we hide general note unless added later via Admin
}

function startActualWorkout() {
    state.currentWorkout = {
        startTime: Date.now(),
        log: {}
    };
    state.activeExIndex = 0;
    loadExerciseUI();
    navigate('ui-active');
}

function loadExerciseUI() {
    const ex = state.routine[state.activeExIndex];
    document.getElementById('active-ex-name').innerText = ex.name;
    
    // Coach Note
    const noteEl = document.getElementById('active-coach-note');
    if (ex.note) {
        noteEl.style.display = 'inline-block';
        noteEl.innerText = "💡 טיפ מהמאמן: " + ex.note;
    } else {
        noteEl.style.display = 'none';
    }

    // History
    const lastLog = Storage.getLastLog(ex.id);
    const badge = document.getElementById('history-badge');
    if (lastLog) {
        const unitLabel = ex.unit === 'plates' ? 'פלטות' : (ex.unit === 'bodyweight' ? '' : 'ק״ג');
        const weightText = ex.unit === 'bodyweight' ? '' : `${lastLog.w} ${unitLabel} | `;
        const repsLabel = ex.unit === 'bodyweight' ? 'שניות/חזרות' : 'חזרות';
        badge.innerText = `אימון שעבר: ${weightText}${lastLog.r} ${repsLabel}`;
    } else {
        badge.innerText = "תרגיל חדש! בהצלחה";
    }

    // Sets
    const container = document.getElementById('sets-container');
    container.innerHTML = '';
    // Pre-create 3 sets
    for(let i=0; i<3; i++) {
        addSetDOM(ex, lastLog);
    }
}

function addSetDOM(ex, lastLog) {
    const container = document.getElementById('sets-container');
    const template = document.getElementById('set-row-template');
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.set-row');
    const setNum = container.children.length + 1;
    
    row.querySelector('.set-num').innerText = setNum;
    
    // Weight Setup
    const wSelect = row.querySelector('.weight-select');
    const wLabel = row.querySelector('.unit-label');
    
    if (ex.unit === 'bodyweight') {
        row.querySelector('.weight-wrap').style.visibility = 'hidden';
    } else {
        wLabel.innerText = ex.unit === 'plates' ? 'פלטות' : 'ק״ג';
        populateWeightSelect(wSelect, ex.unit, lastLog ? lastLog.w : null);
    }

    // Reps Setup
    const rSelect = row.querySelector('.reps-select');
    populateRepsSelect(rSelect, lastLog ? lastLog.r : 12); // Default to 12

    container.appendChild(clone);
}

function populateWeightSelect(select, unit, defaultVal) {
    const isPlates = unit === 'plates';
    const step = isPlates ? 1 : 0.5;
    const start = isPlates ? 1 : 1;
    const end = isPlates ? 20 : 40;
    
    if (!defaultVal) defaultVal = isPlates ? 3 : 5;

    for (let i = start; i <= end; i += step) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.text = i;
        if (i === parseFloat(defaultVal)) opt.selected = true;
        select.appendChild(opt);
    }
}

function populateRepsSelect(select, defaultVal) {
    // 1 to 60 (covering seconds for planks)
    for (let i = 1; i <= 60; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.text = i;
        if (i === parseInt(defaultVal)) opt.selected = true;
        select.appendChild(opt);
    }
}

function addSet() {
    const ex = state.routine[state.activeExIndex];
    const lastLog = Storage.getLastLog(ex.id);
    addSetDOM(ex, lastLog);
}

function removeSet(btn) {
    btn.closest('.set-row').remove();
    // Renumber sets
    const rows = document.querySelectorAll('.set-row');
    rows.forEach((row, idx) => {
        row.querySelector('.set-num').innerText = idx + 1;
    });
}

function rateSet(btn, rating) {
    const row = btn.closest('.set-row');
    // Visual selection
    row.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    row.classList.add('done');
    row.dataset.rating = rating;
    
    // Haptic feedback
    if(navigator.vibrate) navigator.vibrate(50);
}

function nextExercise() {
    // Save current exercise data to log
    const ex = state.routine[state.activeExIndex];
    const rows = document.querySelectorAll('.set-row');
    const setLogs = [];
    
    rows.forEach(row => {
        if (row.classList.contains('done')) {
            const w = parseFloat(row.querySelector('.weight-select').value) || 0;
            const r = parseInt(row.querySelector('.reps-select').value);
            const feel = row.dataset.rating;
            setLogs.push({ w, r, feel });
        }
    });

    if (setLogs.length > 0) {
        state.currentWorkout.log[ex.id] = setLogs[setLogs.length - 1]; // Store best/last set for history seeding
    }

    if (state.activeExIndex < state.routine.length - 1) {
        state.activeExIndex++;
        loadExerciseUI();
    } else {
        finishAndSave();
    }
}

function finishAndSave() {
    const d = new Date();
    const summaryText = `סיכום אימון - ${d.toLocaleDateString('he-IL')}\n\n`;
    let details = "";
    
    state.routine.forEach(ex => {
        const log = state.currentWorkout.log[ex.id];
        if (log) {
            const unit = ex.unit === 'plates' ? 'פלטות' : (ex.unit === 'bodyweight' ? '' : 'ק״ג');
            details += `✅ ${ex.name}: ${log.w}${unit} x ${log.r}\n`;
        }
    });

    if (!details) details = "לא תועדו תרגילים.";

    // Save to history
    state.history.push({
        date: d.toLocaleDateString('he-IL'),
        timestamp: Date.now(),
        summary: details,
        data: state.currentWorkout.log
    });
    Storage.saveHistory();

    // Show summary
    document.getElementById('summary-content').innerText = summaryText + details;
    navigate('ui-summary');
    updateHomeStatus();
}

// --- History & Admin ---

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    const reversed = [...state.history].reverse();
    
    reversed.forEach(item => {
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.style.marginBottom = '10px';
        card.innerText = `${item.date}\n${item.summary}`;
        list.appendChild(card);
    });
}

// Ensure history renders when entering screen
document.querySelector('.action-card.secondary').addEventListener('click', renderHistory);

// Admin Logic
function openAdmin() {
    renderAdminList();
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdmin() {
    document.getElementById('admin-modal').style.display = 'none';
}

function renderAdminList() {
    const list = document.getElementById('admin-routine-list');
    list.innerHTML = '';
    
    state.routine.forEach((ex, idx) => {
        const div = document.createElement('div');
        div.className = 'admin-card';
        div.innerHTML = `
            <div style="flex-grow:1;">
                <strong>${idx+1}. ${ex.name}</strong><br>
                <span style="font-size:0.8em; color:var(--text-dim)">${ex.unit}, ${ex.note || 'אין הערה'}</span>
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="editExercise('${ex.id}')">✏️</button>
                <button onclick="moveExercise(${idx}, -1)">⬆️</button>
                <button onclick="moveExercise(${idx}, 1)">⬇️</button>
                <button onclick="deleteExercise(${idx})" style="color:#ff3b30">🗑️</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function moveExercise(idx, dir) {
    if (idx + dir < 0 || idx + dir >= state.routine.length) return;
    const temp = state.routine[idx];
    state.routine[idx] = state.routine[idx + dir];
    state.routine[idx + dir] = temp;
    renderAdminList();
}

function deleteExercise(idx) {
    if(confirm('למחוק תרגיל זה?')) {
        state.routine.splice(idx, 1);
        renderAdminList();
    }
}

function addNewExerciseToRoutine() {
    // Simple prompt implementation for MVP
    let listStr = "בחר מספר להוספה:\n";
    EXERCISE_BANK.forEach((ex, i) => listStr += `${i+1}. ${ex.name}\n`);
    const selection = prompt(listStr);
    const index = parseInt(selection) - 1;
    
    if (EXERCISE_BANK[index]) {
        // Deep copy to allow independent editing
        const newEx = JSON.parse(JSON.stringify(EXERCISE_BANK[index]));
        newEx.id = newEx.id + '_' + Date.now(); // Unique ID just in case
        state.routine.push(newEx);
        renderAdminList();
    }
}

// Edit Modal Logic
function editExercise(exId) {
    state.editingExId = exId;
    const ex = state.routine.find(e => e.id === exId);
    if (!ex) return;
    
    document.getElementById('admin-edit-name').value = ex.name;
    document.getElementById('admin-edit-unit').value = ex.unit;
    document.getElementById('admin-edit-note').value = ex.note || '';
    
    document.getElementById('edit-ex-modal').style.display = 'flex';
}

function applyExerciseEdit() {
    const ex = state.routine.find(e => e.id === state.editingExId);
    if (ex) {
        ex.name = document.getElementById('admin-edit-name').value;
        ex.unit = document.getElementById('admin-edit-unit').value;
        ex.note = document.getElementById('admin-edit-note').value;
    }
    closeEditExModal();
    renderAdminList();
}

function closeEditExModal() {
    document.getElementById('edit-ex-modal').style.display = 'none';
}

function saveAdminChanges() {
    Storage.saveRoutine();
    alert('השינויים נשמרו בהצלחה!');
    closeAdmin();
    // Refresh if in overview
    if(document.getElementById('ui-overview').classList.contains('active')) {
        renderOverview();
    }
}

// Init
window.addEventListener('DOMContentLoaded', initApp);
