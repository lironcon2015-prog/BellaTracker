/**
 * GYMSTART BETA V0.1
 * Stable Architecture: Global 'app' object, try-catch safety, namespaced storage.
 */

// --- CONFIG & DATA ---
const CONFIG = {
    STORAGE_KEY_ROUTINE: 'gymstart_beta_01_routine',
    STORAGE_KEY_HISTORY: 'gymstart_beta_01_history',
    STORAGE_KEY_SEED:    'gymstart_beta_01_seeded'
};

const BANK = [
    { id: 'goblet', name: 'סקוואט עם משקולת (גובלט)', unit: 'kg', step: 0.5 },
    { id: 'chest_press', name: 'לחיצת חזה עם משקולות', unit: 'kg', step: 0.5 },
    { id: 'rdl', name: 'דדליפט רומני (משקולות)', unit: 'kg', step: 0.5 },
    { id: 'lat_pull', name: 'משיכה בפולי עליון', unit: 'plates', step: 1 },
    { id: 'shoulder', name: 'לחיצת כתפיים בישיבה', unit: 'kg', step: 0.5 },
    { id: 'row', name: 'חתירה בפולי תחתון', unit: 'plates', step: 1 },
    { id: 'side_plank', name: 'פלאנק צידי (בטן)', unit: 'bodyweight', step: 5 },
    { id: 'bicep', name: 'כפיפת מרפקים (יד)', unit: 'kg', step: 0.5 },
    { id: 'tricep', name: 'פשיטת מרפקים (פולי)', unit: 'plates', step: 1 }
];

const DEFAULT_ROUTINE = [
    { id: 'goblet', name: 'סקוואט עם משקולת (גובלט)', unit: 'kg', note: 'גב זקוף, עקבים בקרקע' },
    { id: 'chest_press', name: 'לחיצת חזה עם משקולות', unit: 'kg', note: 'לשמור על יציבות' },
    { id: 'rdl', name: 'דדליפט רומני', unit: 'kg', note: 'ירידה איטית עד הברך' },
    { id: 'lat_pull', name: 'משיכה בפולי עליון', unit: 'plates', note: 'למשוך לחזה' },
    { id: 'shoulder', name: 'לחיצת כתפיים', unit: 'kg', note: 'בלי להקשית גב' },
    { id: 'row', name: 'חתירה בפולי תחתון', unit: 'plates', note: 'מרפקים צמודים' },
    { id: 'side_plank', name: 'פלאנק צידי', unit: 'bodyweight', note: 'אגן גבוה' }
];

const SEED_DATA = {
    'goblet': { w: 10, r: 12 },
    'chest_press': { w: 7, r: 12 },
    'rdl': { w: 10, r: 12 },
    'lat_pull': { w: 6, r: 12 },
    'shoulder': { w: 4, r: 12 },
    'row': { w: 6, r: 12 },
    'side_plank': { w: 0, r: 45 }
};

// --- APP LOGIC CONTAINER ---
const app = {
    state: {
        routine: [],
        history: [],
        active: {
            on: false,
            exIdx: 0,
            setIdx: 1,
            log: [], // { id, name, sets: [{w, r, feel}] }
            timer: null,
            timeLeft: 0,
            currentFeel: null
        }
    },

    // 1. INITIALIZATION
    init: function() {
        try {
            console.log("App initializing...");
            this.loadData();
            this.renderHome();
            this.nav('screen-home');
        } catch (e) {
            alert("שגיאת אתחול: " + e.message);
            localStorage.clear(); // Emergency reset
            location.reload();
        }
    },

    loadData: function() {
        const r = localStorage.getItem(CONFIG.STORAGE_KEY_ROUTINE);
        const h = localStorage.getItem(CONFIG.STORAGE_KEY_HISTORY);
        const s = localStorage.getItem(CONFIG.STORAGE_KEY_SEED);

        if (r) this.state.routine = JSON.parse(r);
        else this.state.routine = JSON.parse(JSON.stringify(DEFAULT_ROUTINE));

        if (h) this.state.history = JSON.parse(h);
        else this.state.history = [];

        // Check Seed
        if (!s) {
            // Apply Seed
            localStorage.setItem(CONFIG.STORAGE_KEY_SEED, 'true');
            // We don't push seed to history array to keep chart clean, 
            // but we use SEED_DATA object as fallback lookup.
        }
    },

    saveData: function() {
        localStorage.setItem(CONFIG.STORAGE_KEY_ROUTINE, JSON.stringify(this.state.routine));
        localStorage.setItem(CONFIG.STORAGE_KEY_HISTORY, JSON.stringify(this.state.history));
    },

    // 2. NAVIGATION
    nav: function(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        // Navbar Logic
        const backBtn = document.getElementById('nav-back');
        if (screenId === 'screen-home') backBtn.style.visibility = 'hidden';
        else backBtn.style.visibility = 'visible';

        // Scroll top
        window.scrollTo(0, 0);
    },

    goBack: function() {
        const active = document.querySelector('.screen.active').id;
        if (active === 'screen-active') {
            if (confirm("לצאת מהאימון?")) {
                this.stopTimer();
                this.nav('screen-overview');
            }
        } else {
            this.nav('screen-home');
        }
    },

    // 3. HOME & OVERVIEW
    renderHome: function() {
        const lastEl = document.getElementById('last-workout-display');
        if (this.state.history.length > 0) {
            const last = this.state.history[this.state.history.length - 1];
            lastEl.innerText = last.date;
        } else {
            lastEl.innerText = "טרם בוצע";
        }
    },

    startFlow: function() {
        this.renderOverview();
        this.nav('screen-overview');
    },

    renderOverview: function() {
        const list = document.getElementById('overview-list');
        list.innerHTML = '';
        this.state.routine.forEach((ex, i) => {
            const unit = ex.unit === 'plates' ? 'פלטות' : (ex.unit === 'bodyweight' ? 'משקל גוף' : 'ק״ג');
            list.innerHTML += `
                <div class="list-item">
                    <span style="font-weight:600">${i+1}. ${ex.name}</span>
                    <span style="color:#888; font-size:0.85rem">${unit}</span>
                </div>
            `;
        });
    },

    // 4. ACTIVE WORKOUT
    startWorkout: function() {
        this.state.active = {
            on: true,
            exIdx: 0,
            setIdx: 1,
            log: [],
            timer: null,
            timeLeft: 0,
            currentFeel: null
        };
        this.loadActiveExercise();
        this.nav('screen-active');
    },

    loadActiveExercise: function() {
        const ex = this.state.routine[this.state.active.exIdx];
        
        // UI Text
        document.getElementById('ex-name').innerText = ex.name;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
        
        const noteEl = document.getElementById('coach-note');
        if (ex.note) {
            noteEl.style.display = 'inline-block';
            noteEl.innerText = "💡 " + ex.note;
        } else {
            noteEl.style.display = 'none';
        }

        // Unit Label
        const uLabel = ex.unit === 'plates' ? 'פלטות' : (ex.unit === 'bodyweight' ? '' : 'ק״ג');
        document.getElementById('unit-label').innerText = uLabel || 'יחידות';

        // Lookup History (Last logged OR Seed)
        const lastLog = this.getLastLog(ex.id);
        const histBadge = document.getElementById('history-badge');
        
        if (lastLog) {
            const rTxt = ex.unit === 'bodyweight' ? 'שניות' : 'חזרות';
            histBadge.innerText = `הישג קודם: ${lastLog.w}${uLabel} | ${lastLog.r} ${rTxt}`;
            // Set defaults
            document.getElementById('val-weight').innerText = lastLog.w;
            document.getElementById('val-reps').innerText = lastLog.r;
        } else {
            histBadge.innerText = "תרגיל חדש! בהצלחה";
            // Default logic
            const defW = ex.unit === 'plates' ? 3 : 5;
            document.getElementById('val-weight').innerText = ex.unit === 'bodyweight' ? 0 : defW;
            document.getElementById('val-reps').innerText = ex.unit === 'bodyweight' ? 30 : 12;
        }

        this.resetSetUI();
    },

    getLastLog: function(exId) {
        // 1. Check History (Reverse)
        for (let i = this.state.history.length - 1; i >= 0; i--) {
            const session = this.state.history[i];
            const exData = session.data.find(e => e.id === exId);
            if (exData && exData.sets.length > 0) {
                return exData.sets[exData.sets.length - 1];
            }
        }
        // 2. Fallback to Seed
        return SEED_DATA[exId] || null;
    },

    resetSetUI: function() {
        this.state.active.currentFeel = null;
        document.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('action-area').style.display = 'block';
        document.getElementById('btn-finish').style.display = 'flex';
        document.getElementById('timer-ui').style.display = 'none';
    },

    // INPUTS
    adjustWeight: function(dir) {
        const ex = this.state.routine[this.state.active.exIdx];
        if (ex.unit === 'bodyweight') return;
        
        const el = document.getElementById('val-weight');
        let v = parseFloat(el.innerText);
        let step = ex.unit === 'plates' ? 1 : 0.5;
        
        v += (dir * step);
        if (v < 0) v = 0;
        el.innerText = v;
    },

    adjustReps: function(dir) {
        const el = document.getElementById('val-reps');
        let v = parseInt(el.innerText);
        let step = 1;
        // Larger steps for duration (plank)
        const ex = this.state.routine[this.state.active.exIdx];
        if (ex.unit === 'bodyweight') step = 5;

        v += (dir * step);
        if (v < 1) v = 0;
        el.innerText = v;
    },

    selectFeel: function(feel) {
        this.state.active.currentFeel = feel;
        document.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('selected'));
        document.querySelector(`.feel-btn.${feel}`).classList.add('selected');
    },

    // SET LOGIC
    finishSet: function() {
        if (!this.state.active.currentFeel) {
            alert("איך הרגיש הסט?");
            return;
        }

        const ex = this.state.routine[this.state.active.exIdx];
        const w = parseFloat(document.getElementById('val-weight').innerText);
        const r = parseInt(document.getElementById('val-reps').innerText);

        // Find or Create Ex Log
        let exLog = this.state.active.log.find(l => l.id === ex.id);
        if (!exLog) {
            exLog = { id: ex.id, name: ex.name, sets: [] };
            this.state.active.log.push(exLog);
        }

        exLog.sets.push({ w: w, r: r, feel: this.state.active.currentFeel });

        // Trigger Timer
        this.startTimer(90); // 90s rest
    },

    deleteLastSet: function() {
        const ex = this.state.routine[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === ex.id);
        
        if (exLog && exLog.sets.length > 0) {
            if (confirm("למחוק את הסט האחרון?")) {
                exLog.sets.pop();
                this.state.active.setIdx--;
                if (this.state.active.setIdx < 1) this.state.active.setIdx = 1;
                document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
                this.stopTimer();
                this.resetSetUI();
            }
        } else {
            alert("אין סטים למחיקה");
        }
    },

    nextExercise: function() {
        const ex = this.state.routine[this.state.active.exIdx];
        let exLog = this.state.active.log.find(l => l.id === ex.id);
        
        if (!exLog || exLog.sets.length === 0) {
            if (!confirm("לא בוצעו סטים. לדלג?")) return;
        }

        this.stopTimer();

        if (this.state.active.exIdx < this.state.routine.length - 1) {
            this.state.active.exIdx++;
            this.state.active.setIdx = 1;
            this.loadActiveExercise();
        } else {
            this.finishWorkout();
        }
    },

    // TIMER
    startTimer: function(sec) {
        document.getElementById('btn-finish').style.display = 'none';
        document.getElementById('timer-ui').style.display = 'flex';
        
        this.state.active.timeLeft = sec;
        const total = 90; // for circle calc
        const circle = document.getElementById('timer-bar');
        const text = document.getElementById('timer-text');
        
        this.stopTimer(); // safety
        
        this.state.active.timer = setInterval(() => {
            this.state.active.timeLeft--;
            
            // Text
            let m = Math.floor(this.state.active.timeLeft / 60);
            let s = this.state.active.timeLeft % 60;
            text.innerText = `${m}:${s < 10 ? '0'+s : s}`;
            
            // Circle
            let pct = this.state.active.timeLeft / total;
            circle.style.strokeDashoffset = 283 - (pct * 283);

            if (this.state.active.timeLeft <= 0) {
                this.skipRest();
                if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
        }, 1000);
    },

    stopTimer: function() {
        if (this.state.active.timer) clearInterval(this.state.active.timer);
    },

    skipRest: function() {
        this.stopTimer();
        this.state.active.setIdx++;
        document.getElementById('set-badge').innerText = `סט ${this.state.active.setIdx}`;
        this.resetSetUI();
    },

    addTime: function() {
        this.state.active.timeLeft += 30;
    },

    // 5. SUMMARY
    finishWorkout: function() {
        const textBox = document.getElementById('summary-text');
        let txt = "";
        
        this.state.active.log.forEach(ex => {
            if(ex.sets.length > 0) {
                txt += `✅ ${ex.name}\n`;
                ex.sets.forEach((s, i) => {
                    txt += `   סט ${i+1}: ${s.w} × ${s.r} (${s.feel})\n`;
                });
                txt += "\n";
            }
        });

        if(!txt) txt = "לא תועדו תרגילים.";
        textBox.innerText = txt;
        this.nav('screen-summary');
    },

    saveAndHome: function() {
        if (this.state.active.log.length > 0) {
            const entry = {
                date: new Date().toLocaleDateString('he-IL'),
                timestamp: Date.now(),
                data: this.state.active.log
            };
            this.state.history.push(entry);
            this.saveData();
        }
        this.renderHome();
        this.nav('screen-home');
    },

    // 6. HISTORY & ADMIN
    showHistory: function() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        [...this.state.history].reverse().forEach(h => {
            const count = h.data.length;
            list.innerHTML += `
                <div class="glass-card" style="padding:15px; margin-bottom:10px;">
                    <div style="font-weight:700; color:var(--primary)">${h.date}</div>
                    <div style="font-size:0.85rem; color:#aaa">${count} תרגילים בוצעו</div>
                </div>
            `;
        });
        this.nav('screen-history');
    },

    openAdmin: function() {
        const list = document.getElementById('admin-list');
        list.innerHTML = '';
        this.state.routine.forEach((ex, i) => {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.05); border-radius:10px;">
                    <span>${i+1}. ${ex.name}</span>
                    <button onclick="app.removeEx(${i})" style="color:red;background:none;border:none;">🗑</button>
                </div>
            `;
        });
        document.getElementById('admin-modal').style.display = 'flex';
    },

    closeAdmin: function() {
        document.getElementById('admin-modal').style.display = 'none';
    },

    addExerciseFromBank: function() {
        let promptTxt = "בחר מספר תרגיל:\n";
        BANK.forEach((ex, i) => promptTxt += `${i+1}. ${ex.name}\n`);
        
        const res = prompt(promptTxt);
        const idx = parseInt(res) - 1;
        
        if (BANK[idx]) {
            const newEx = JSON.parse(JSON.stringify(BANK[idx]));
            newEx.note = prompt("הערת מאמן (אופציונלי):");
            this.state.routine.push(newEx);
            this.openAdmin(); // refresh
        }
    },

    removeEx: function(i) {
        if(confirm("למחוק?")) {
            this.state.routine.splice(i, 1);
            this.openAdmin();
        }
    },

    saveAdmin: function() {
        this.saveData();
        this.closeAdmin();
        alert("התוכנית עודכנה!");
    }
};

// Start the engine safely
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
