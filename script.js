/**
 * GYMPRO START - גרסה 2.0 (Polished Flow)
 * לוגיקה: מסך אחד, טיימר מובנה, Seed Data
 */

// --- DATA & CONFIG ---

const EXERCISE_BANK = [
    { id: 'goblet', name: 'סקוואט עם משקולת (גובלט)', unit: 'kg', step: 0.5 },
    { id: 'chest_press', name: 'לחיצת חזה עם משקולות', unit: 'kg', step: 0.5 },
    { id: 'rdl', name: 'דדליפט רומני (משקולות)', unit: 'kg', step: 0.5 },
    { id: 'lat_pull', name: 'משיכה בפולי עליון', unit: 'plates', step: 1 },
    { id: 'shoulder', name: 'לחיצת כתפיים בישיבה', unit: 'kg', step: 0.5 },
    { id: 'row', name: 'חתירה בפולי תחתון', unit: 'plates', step: 1 },
    { id: 'plank', name: 'פלאנק צידי (בטן)', unit: 'bodyweight', step: 5 },
    { id: 'bicep', name: 'כפיפת מרפקים (יד קדמית)', unit: 'kg', step: 0.5 },
    { id: 'tricep', name: 'פשיטת מרפקים (פולי)', unit: 'plates', step: 1 }
];

const DEFAULT_ROUTINE = [
    { id: 'goblet', name: 'סקוואט עם משקולת (גובלט)', unit: 'kg', note: 'גב זקוף, עקבים ברצפה' },
    { id: 'chest_press', name: 'לחיצת חזה עם משקולות', unit: 'kg', note: 'להוריד לאט, לעלות מהר' },
    { id: 'rdl', name: 'דדליפט רומני', unit: 'kg', note: 'ברכיים כפופות מעט, גב ישר' },
    { id: 'lat_pull', name: 'משיכה בפולי עליון', unit: 'plates', note: 'למשוך לחזה העליון' },
    { id: 'shoulder', name: 'לחיצת כתפיים', unit: 'kg', note: 'בלי להקשית את הגב' },
    { id: 'row', name: 'חתירה בפולי תחתון', unit: 'plates', note: 'לכווץ שכמות בסוף' },
    { id: 'plank', name: 'פלאנק צידי', unit: 'bodyweight', note: 'להחזיק חזק' }
];

const SEED_DATA = {
    'goblet': { w: 10, r: 12 },
    'chest_press': { w: 7, r: 12 },
    'rdl': { w: 10, r: 12 },
    'lat_pull': { w: 6, r: 12 },
    'shoulder': { w: 4, r: 12 },
    'row': { w: 6, r: 12 },
    'plank': { w: 0, r: 45 }
};

// --- STATE ---
let state = {
    routine: [],
    history: [],
    active: {
        startTime: 0,
        exIdx: 0,
        setIdx: 1, // 1-based for display
        log: [], // Array of sets for current workout
        currentSetRating: null,
        timerInterval: null,
        timeLeft: 0
    }
};

// --- STORAGE MANAGER ---
const DB = {
    save() {
        localStorage.setItem('gymstart_routine', JSON.stringify(state.routine));
        localStorage.setItem('gymstart_history', JSON.stringify(state.history));
    },
    load() {
        const r = localStorage.getItem('gymstart_routine');
        state.routine = r ? JSON.parse(r) : JSON.parse(JSON.stringify(DEFAULT_ROUTINE));
        
        const h = localStorage.getItem('gymstart_history');
        state.history = h ? JSON.parse(h) : [];
    },
    getLastLog(exId) {
        // First check real history
        for (let i = state.history.length - 1; i >= 0; i--) {
            const session = state.history[i];
            const exData = session.data.find(e => e.id === exId);
            if (exData && exData.sets.length > 0) {
                return exData.sets[exData.sets.length - 1]; // Return last set
            }
        }
        // Fallback to seed
        return SEED_DATA[exId] || null;
    }
};

// --- INIT ---
window.addEventListener('DOMContentLoaded', () => {
    DB.load();
    updateHomeUI();
});

// --- NAVIGATION ---
function navigate(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Header logic
    const backBtn = document.getElementById('nav-back');
    backBtn.style.visibility = id === 'ui-home' ? 'hidden' : 'visible';
    
    // Reset timer if leaving active
    if (id !== 'ui-active') stopTimer();
}

function handleBack() {
    const active = document.querySelector('.screen.active').id;
    if (active === 'ui-active') {
        if(confirm('לצאת מהאימון?')) navigate('ui-overview');
    } else {
        navigate('ui-home');
    }
}

// --- WORKOUT FLOW ---

function startSession() {
    renderOverview();
    navigate('ui-overview');
}

function renderOverview() {
    const list = document.getElementById('overview-list');
    list.innerHTML = '';
    state.routine.forEach((ex, i) => {
        list.innerHTML += `
            <div class="workout-item">
                <span style="font-weight:600">${i+1}. ${ex.name}</span>
                <span style="color:var(--text-dim); font-size:0.8rem">${ex.unit === 'plates' ? 'פלטות' : (ex.unit==='bodyweight'?'גוף':'ק״ג')}</span>
            </div>
        `;
    });
}

function launchWorkout() {
    state.active = {
        startTime: Date.now(),
        exIdx: 0,
        setIdx: 1,
        log: [],
        currentSetRating: null,
        timerInterval: null
    };
    loadActiveExercise();
    navigate('ui-active');
}

function loadActiveExercise() {
    const ex = state.routine[state.active.exIdx];
    
    // UI Updates
    document.getElementById('active-ex-name').innerText = ex.name;
    document.getElementById('set-badge').innerText = `סט ${state.active.setIdx}`;
    
    // Note
    const noteEl = document.getElementById('active-note');
    if (ex.note) {
        noteEl.style.display = 'inline-block';
        noteEl.innerText = "💡 " + ex.note;
    } else {
        noteEl.style.display = 'none';
    }

    // History
    const last = DB.getLastLog(ex.id);
    const histEl = document.getElementById('history-pill');
    if (last) {
        const unit = ex.unit === 'plates' ? 'פלטות' : (ex.unit === 'bodyweight' ? '' : 'ק״ג');
        histEl.innerText = `הישג קודם: ${last.w}${unit} × ${last.r}`;
        
        // Auto-fill inputs
        updatePicker('weight', last.w);
        updatePicker('reps', last.r);
    } else {
        histEl.innerText = "תרגיל חדש! בהצלחה";
        updatePicker('weight', ex.unit === 'plates' ? 3 : 5);
        updatePicker('reps', 12);
    }

    // Unit Label
    document.getElementById('unit-label').innerText = ex.unit === 'plates' ? 'פלטות' : (ex.unit === 'bodyweight' ? 'גוף' : 'ק״ג');

    // Reset State for Set
    resetSetUI();
}

function resetSetUI() {
    state.active.currentSetRating = null;
    document.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('timer-area').style.display = 'none';
    document.getElementById('btn-finish-set').style.display = 'flex';
}

// --- INPUT LOGIC ---
function updatePicker(type, val) {
    document.getElementById(`val-${type}`).innerText = val;
}

function adjustWeight(delta) {
    const ex = state.routine[state.active.exIdx];
    const el = document.getElementById('val-weight');
    let val = parseFloat(el.innerText);
    let step = ex.unit === 'plates' ? 1 : 0.5;
    if (ex.unit === 'bodyweight') return; // Locked

    val += (delta * step);
    if (val < 0) val = 0;
    el.innerText = val;
}

function adjustReps(delta) {
    const el = document.getElementById('val-reps');
    let val = parseInt(el.innerText);
    val += delta;
    if (val < 1) val = 1;
    el.innerText = val;
}

function selectFeeling(rating) {
    state.active.currentSetRating = rating;
    document.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById(`btn-${rating}`).classList.add('selected');
}

// --- SET COMPLETION & TIMER ---

function finishSet() {
    // Validation
    if (!state.active.currentSetRating) {
        alert("איך הרגיש הסט? (בחר רגשון)");
        return;
    }

    // Log Logic
    const ex = state.routine[state.active.exIdx];
    const w = parseFloat(document.getElementById('val-weight').innerText);
    const r = parseInt(document.getElementById('val-reps').innerText);
    
    // Find or create log entry for this exercise
    let exLog = state.active.log.find(l => l.id === ex.id);
    if (!exLog) {
        exLog = { id: ex.id, name: ex.name, sets: [] };
        state.active.log.push(exLog);
    }
    
    exLog.sets.push({ w, r, rating: state.active.currentSetRating });

    // UI Feedback
    if (navigator.vibrate) navigator.vibrate(50);
    
    // Switch to Timer
    document.getElementById('btn-finish-set').style.display = 'none';
    startTimer(90); // 90s default rest
}

function startTimer(seconds) {
    state.active.timeLeft = seconds;
    const timerArea = document.getElementById('timer-area');
    timerArea.style.display = 'flex';
    
    const circle = document.getElementById('timer-progress');
    const text = document.getElementById('timer-text');
    const fullDash = 283;
    
    clearInterval(state.active.timerInterval);
    
    state.active.timerInterval = setInterval(() => {
        state.active.timeLeft--;
        
        // Update Text
        const m = Math.floor(state.active.timeLeft / 60);
        const s = state.active.timeLeft % 60;
        text.innerText = `${m}:${s < 10 ? '0'+s : s}`;
        
        // Update Circle
        const fraction = state.active.timeLeft / 90; // Relative to 90s base
        circle.style.strokeDashoffset = fullDash - (fraction * fullDash);
        
        if (state.active.timeLeft <= 0) {
            skipRest(); // Auto finish
            if(navigator.vibrate) navigator.vibrate([100,50,100]);
        }
    }, 1000);
}

function addTime(secs) {
    state.active.timeLeft += secs;
}

function skipRest() {
    stopTimer();
    // Move to next set logic
    state.active.setIdx++;
    document.getElementById('set-badge').innerText = `סט ${state.active.setIdx}`;
    resetSetUI();
    // Scroll top
    document.getElementById('ui-active').scrollTo(0,0);
}

function stopTimer() {
    clearInterval(state.active.timerInterval);
}

// --- NAVIGATION BETWEEN EXERCISES ---

function deleteCurrentSet() {
    const exId = state.routine[state.active.exIdx].id;
    const exLog = state.active.log.find(l => l.id === exId);
    if (exLog && exLog.sets.length > 0) {
        if(confirm('למחוק את הסט האחרון שביצעת?')) {
            exLog.sets.pop();
            state.active.setIdx--;
            if (state.active.setIdx < 1) state.active.setIdx = 1;
            document.getElementById('set-badge').innerText = `סט ${state.active.setIdx}`;
            stopTimer();
            resetSetUI();
        }
    } else {
        alert("אין סטים למחיקה בתרגיל זה");
    }
}

function nextExerciseManual() {
    const ex = state.routine[state.active.exIdx];
    const log = state.active.log.find(l => l.id === ex.id);
    
    // Warning if no sets done
    if (!log || log.sets.length === 0) {
        if(!confirm("לא ביצעת אף סט. לדלג על התרגיל?")) return;
    }

    stopTimer();

    // Check if next exists
    if (state.active.exIdx < state.routine.length - 1) {
        state.active.exIdx++;
        state.active.setIdx = 1;
        loadActiveExercise();
    } else {
        finishWorkout();
    }
}

function finishWorkout() {
    // Render Summary
    const sumEl = document.getElementById('summary-content');
    let text = "";
    
    state.active.log.forEach(ex => {
        if (ex.sets.length > 0) {
            text += `✅ ${ex.name}\n`;
            ex.sets.forEach((s, i) => {
                text += `   סט ${i+1}: ${s.w} × ${s.r}\n`;
            });
            text += "\n";
        }
    });
    
    if (!text) text = "לא בוצעו תרגילים.";
    sumEl.innerText = text;
    navigate('ui-summary');
}

function saveAndExit() {
    if (state.active.log.length > 0) {
        state.history.push({
            date: new Date().toLocaleDateString('he-IL'),
            timestamp: Date.now(),
            data: state.active.log
        });
        DB.save();
    }
    updateHomeUI();
    navigate('ui-home');
}

// --- HOME & ADMIN UTILS ---

function updateHomeUI() {
    if (state.history.length > 0) {
        const last = state.history[state.history.length-1];
        document.getElementById('last-workout-date').innerText = last.date;
    }
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    [...state.history].reverse().forEach(h => {
        list.innerHTML += `
            <div class="glass-card" style="padding:15px">
                <div style="font-weight:700; color:var(--primary)">${h.date}</div>
                <div style="font-size:0.85rem; color:#bbb">${h.data.length} תרגילים בוצעו</div>
            </div>
        `;
    });
}

// ADMIN Logic
function openAdmin() {
    renderAdminList();
    document.getEle
