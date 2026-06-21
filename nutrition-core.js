/**
 * GymStart — Nutrition Core
 * כל לוגיקת התזונה: יומן, מודלים, אחסון, חיפוש, Meal Builder, סנכרון.
 * Offline-first; per-100g קנוני; פר-פרופיל (FOOD_DB משותף).
 * נטען אחרי script.js — משתמש ב-app/PROFILES הגלובליים.
 */
const Nutrition = {

    // ── קבועים ───────────────────────────────────────────────
    MEAL_EMOJI: { 'בוקר':'🌅', 'צהריים':'☀️', 'ערב':'🌙', 'נשנוש':'🍎' },
    DEFAULT_MEALS: ['בוקר','צהריים','ערב','נשנוש'],
    DEFAULT_TARGETS: { kcalTarget:1800, proteinTarget:120, carbsTarget:180, fatTarget:60, mealLabels:['בוקר','צהריים','ערב','נשנוש'] },

    // ~50 מזונות עבריים נפוצים (per-100g) — שכבת חיפוש מיידית offline
    BASIC_FOODS: [
        {id:'b_egg',name:'ביצה',per100:{kcal:143,p:13,c:1,f:10}},
        {id:'b_eggwhite',name:'חלבון ביצה',per100:{kcal:52,p:11,c:0.7,f:0.2}},
        {id:'b_milk3',name:'חלב 3%',per100:{kcal:60,p:3.3,c:4.7,f:3.4}},
        {id:'b_milk1',name:'חלב 1%',per100:{kcal:42,p:3.4,c:5,f:1}},
        {id:'b_cottage5',name:'קוטג׳ 5%',per100:{kcal:103,p:11,c:3,f:5}},
        {id:'b_yogurt',name:'יוגורט יווני',per100:{kcal:97,p:9,c:4,f:5}},
        {id:'b_whitecheese5',name:'גבינה לבנה 5%',per100:{kcal:97,p:11,c:4,f:5}},
        {id:'b_yellowcheese',name:'גבינה צהובה',per100:{kcal:353,p:25,c:1,f:28}},
        {id:'b_chicken',name:'חזה עוף',per100:{kcal:165,p:31,c:0,f:3.6}},
        {id:'b_chickenthigh',name:'שוקיים עוף',per100:{kcal:209,p:26,c:0,f:11}},
        {id:'b_beef',name:'בשר בקר טחון',per100:{kcal:250,p:26,c:0,f:15}},
        {id:'b_turkey',name:'הודו',per100:{kcal:135,p:29,c:0,f:1.7}},
        {id:'b_salmon',name:'סלמון',per100:{kcal:208,p:20,c:0,f:13}},
        {id:'b_tuna',name:'טונה במים',per100:{kcal:116,p:26,c:0,f:1}},
        {id:'b_tilapia',name:'אמנון (טילפיה)',per100:{kcal:96,p:20,c:0,f:1.7}},
        {id:'b_rice',name:'אורז לבן מבושל',per100:{kcal:130,p:2.7,c:28,f:0.3}},
        {id:'b_ricebrown',name:'אורז מלא מבושל',per100:{kcal:111,p:2.6,c:23,f:0.9}},
        {id:'b_pasta',name:'פסטה מבושלת',per100:{kcal:158,p:6,c:31,f:0.9}},
        {id:'b_quinoa',name:'קינואה מבושלת',per100:{kcal:120,p:4.4,c:21,f:1.9}},
        {id:'b_couscous',name:'קוסקוס מבושל',per100:{kcal:112,p:3.8,c:23,f:0.2}},
        {id:'b_potato',name:'תפוח אדמה',per100:{kcal:87,p:1.9,c:20,f:0.1}},
        {id:'b_sweetpotato',name:'בטטה',per100:{kcal:86,p:1.6,c:20,f:0.1}},
        {id:'b_bread',name:'לחם לבן',per100:{kcal:265,p:9,c:49,f:3.2}},
        {id:'b_breadwhole',name:'לחם מלא',per100:{kcal:247,p:13,c:41,f:3.4}},
        {id:'b_pita',name:'פיתה',per100:{kcal:275,p:9,c:55,f:1.2}},
        {id:'b_oats',name:'שיבולת שועל',per100:{kcal:389,p:17,c:66,f:7}},
        {id:'b_lentils',name:'עדשים מבושלות',per100:{kcal:116,p:9,c:20,f:0.4}},
        {id:'b_chickpeas',name:'חומוס גרגרים',per100:{kcal:164,p:9,c:27,f:2.6}},
        {id:'b_hummus',name:'חומוס ממרח',per100:{kcal:177,p:8,c:20,f:8}},
        {id:'b_beans',name:'שעועית מבושלת',per100:{kcal:127,p:9,c:23,f:0.5}},
        {id:'b_tofu',name:'טופו',per100:{kcal:76,p:8,c:1.9,f:4.8}},
        {id:'b_falafel',name:'פלאפל',per100:{kcal:333,p:13,c:32,f:18}},
        {id:'b_avocado',name:'אבוקדו',per100:{kcal:160,p:2,c:9,f:15}},
        {id:'b_banana',name:'בננה',per100:{kcal:89,p:1.1,c:23,f:0.3}},
        {id:'b_apple',name:'תפוח',per100:{kcal:52,p:0.3,c:14,f:0.2}},
        {id:'b_orange',name:'תפוז',per100:{kcal:47,p:0.9,c:12,f:0.1}},
        {id:'b_strawberry',name:'תות',per100:{kcal:32,p:0.7,c:7.7,f:0.3}},
        {id:'b_tomato',name:'עגבנייה',per100:{kcal:18,p:0.9,c:3.9,f:0.2}},
        {id:'b_cucumber',name:'מלפפון',per100:{kcal:15,p:0.7,c:3.6,f:0.1}},
        {id:'b_lettuce',name:'חסה',per100:{kcal:15,p:1.4,c:2.9,f:0.2}},
        {id:'b_broccoli',name:'ברוקולי',per100:{kcal:34,p:2.8,c:7,f:0.4}},
        {id:'b_almonds',name:'שקדים',per100:{kcal:579,p:21,c:22,f:50}},
        {id:'b_peanutbutter',name:'חמאת בוטנים',per100:{kcal:588,p:25,c:20,f:50}},
        {id:'b_tahini',name:'טחינה גולמית',per100:{kcal:595,p:17,c:21,f:54}},
        {id:'b_oliveoil',name:'שמן זית',per100:{kcal:884,p:0,c:0,f:100}},
        {id:'b_honey',name:'דבש',per100:{kcal:304,p:0.3,c:82,f:0}},
        {id:'b_choc',name:'שוקולד מריר',per100:{kcal:546,p:5,c:61,f:31}},
        {id:'b_proteinbar',name:'חטיף חלבון',per100:{kcal:350,p:33,c:38,f:9}},
        {id:'b_proteinscoop',name:'אבקת חלבון',per100:{kcal:375,p:80,c:8,f:5}},
        {id:'b_cornflakes',name:'קורנפלקס',per100:{kcal:357,p:7,c:84,f:0.9}}
    ],

    // ── State ────────────────────────────────────────────────
    state: {
        date: null,            // 'YYYY-MM-DD' מוצג כעת
        sheetFood: null,       // מזון נבחר בעורך-כמות
        sheetUnit: 'g',
        sheetQty: 100,
        sheetMeal: 'בוקר',
        builder: null,         // {name, components:[...]}
        editRef: null,         // {date, idx} בעריכת רשומה קיימת
        searchTimer: null,
        swipeX: 0
    },

    // ════════════════════════════════════════════════════════
    //  אחסון — פר-פרופיל (FOOD_DB משותף)
    // ════════════════════════════════════════════════════════
    _suffix() {
        try {
            const p = app.state.activeProfile;
            if (p === 'female') return '';
            return (PROFILES[p] || PROFILES.female).suffix || '';
        } catch (e) { return ''; }
    },
    _keys() {
        const s = this._suffix();
        return {
            LOG:     'gymstart_nutrition_log' + s,
            DAILY:   'gymstart_nutrition_daily' + s,
            TARGETS: 'gymstart_nutrition_targets' + s,
            FOODDB:  'gymstart_food_db'   // משותף לכל הפרופילים
        };
    },
    _read(key, fallback) {
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
        catch (e) { return fallback; }
    },
    _write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} },

    loadLog()      { return this._read(this._keys().LOG, {}); },
    saveLog(o)     { this._write(this._keys().LOG, o); },
    loadDaily()    { return this._read(this._keys().DAILY, []); },
    saveDaily(a)   { this._write(this._keys().DAILY, a); },
    loadFoodDb()   { return this._read(this._keys().FOODDB, []); },
    saveFoodDb(a)  { this._write(this._keys().FOODDB, a); },
    getTargets()   {
        const t = this._read(this._keys().TARGETS, null);
        return Object.assign({}, this.DEFAULT_TARGETS, t || {});
    },
    saveTargets(t) { this._write(this._keys().TARGETS, t); },

    // ════════════════════════════════════════════════════════
    //  עזרי חישוב ותאריך
    // ════════════════════════════════════════════════════════
    todayKey() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    },
    _round(n) { return Math.round((n + Number.EPSILON) * 10) / 10; },
    _r0(n) { return Math.round(n || 0); },

    // קלוריות/מאקרו לכמות בפועל מתוך per100
    _calcFromPer100(per100, grams) {
        const f = (grams || 0) / 100;
        return {
            kcal: this._round((per100.kcal||0) * f),
            p:    this._round((per100.p||0) * f),
            c:    this._round((per100.c||0) * f),
            f:    this._round((per100.f||0) * f)
        };
    },
    _entryGrams(e) {
        if (e.components && e.components.length) return e.components.reduce((s,x)=>s+(x.grams||0),0);
        if (e.unit === 'serving') return (e.qty||0) * (e.gramsPerUnit||0);
        return e.qty || 0; // grams / ml
    },

    // ════════════════════════════════════════════════════════
    //  מודל — רשומות יומן
    // ════════════════════════════════════════════════════════
    recomputeDay(date) {
        const log = this.loadLog();
        const entries = log[date] || [];
        const sum = entries.reduce((a,e)=>({
            kcal:a.kcal+(e.kcal||0), p:a.p+(e.p||0), c:a.c+(e.c||0), f:a.f+(e.f||0)
        }), {kcal:0,p:0,c:0,f:0});
        const daily = this.loadDaily();
        const rec = {
            date,
            calories: this._r0(sum.kcal), protein: this._round(sum.p),
            carbs: this._round(sum.c), fat: this._round(sum.f),
            meals: entries.length, src: 'app'
        };
        const i = daily.findIndex(d => d.date === date);
        if (entries.length === 0) { if (i >= 0) daily.splice(i,1); }
        else if (i >= 0) daily[i] = rec; else daily.push(rec);
        this.saveDaily(daily);
        this._cloudSyncSoon();
        return rec;
    },

    addFoodEntry(date, entry) {
        const log = this.loadLog();
        if (!log[date]) log[date] = [];
        log[date].push(entry);
        this.saveLog(log);
        this.recomputeDay(date);
        if (entry.source !== 'gemini' && !entry.components) this._upsertFoodDb(entry, entry.meal);
    },
    updateEntryAt(date, idx, entry) {
        const log = this.loadLog();
        if (!log[date] || !log[date][idx]) return;
        log[date][idx] = entry;
        this.saveLog(log);
        this.recomputeDay(date);
    },
    deleteEntryAt(date, idx) {
        const log = this.loadLog();
        if (!log[date]) return;
        log[date].splice(idx,1);
        if (log[date].length === 0) delete log[date];
        this.saveLog(log);
        this.recomputeDay(date);
    },

    // מאגר אישי שגדל מהשימוש
    _upsertFoodDb(food, meal) {
        if (!food || !food.per100) return;
        const db = this.loadFoodDb();
        const norm = this._normalize(food.name);
        let rec = db.find(x => (food.barcode && x.barcode===food.barcode) || this._normalize(x.name)===norm);
        const now = Date.now();
        if (!rec) {
            rec = { id: food.id || ('db_'+now), name: food.name, brand: food.brand||'', barcode: food.barcode||null,
                    source: food.source||'custom', per100: food.per100, useCount:0, lastUsed:now, favorite:false, mealUse:{} };
            db.push(rec);
        }
        rec.useCount++; rec.lastUsed = now; rec.per100 = food.per100;
        if (meal) { rec.mealUse[meal] = rec.mealUse[meal] || {count:0,lastUsed:0}; rec.mealUse[meal].count++; rec.mealUse[meal].lastUsed = now; }
        this.saveFoodDb(db);
        this._cloudSyncSoon();
    },

    // ════════════════════════════════════════════════════════
    //  אתחול + נקודות כניסה
    // ════════════════════════════════════════════════════════
    init() {
        this.state.date = this.todayKey();
        this._injectSheets();
    },
    open() {
        this.state.date = this.state.date || this.todayKey();
        if (typeof app !== 'undefined') app.nav('screen-nutrition');
        this.render();
    },

    // ── מסך התזונה ───────────────────────────────────────────
    render() {
        const body = document.getElementById('nut-body');
        if (!body) return;
        const date = this.state.date;
        const t = this.getTargets();
        const log = this.loadLog();
        const entries = log[date] || [];
        const tot = entries.reduce((a,e)=>({kcal:a.kcal+(e.kcal||0),p:a.p+(e.p||0),c:a.c+(e.c||0),f:a.f+(e.f||0)}),{kcal:0,p:0,c:0,f:0});

        const C = 327, kpct = Math.min(1, tot.kcal/(t.kcalTarget||1));
        const ringOff = Math.round(C*(1-kpct));
        const macroBar = (name,val,target,cls)=>{
            const pct = Math.min(100, Math.round((val/(target||1))*100));
            return `<div class="macro-bar"><div class="mb-top"><span class="mb-name">${name}</span>
              <span class="mb-val">${this._round(val)} / ${target}ג</span></div>
              <div class="mb-track"><div class="mb-fill ${cls}" style="width:${pct}%"></div></div></div>`;
        };

        // קיבוץ לפי ארוחה
        const labels = t.mealLabels && t.mealLabels.length ? t.mealLabels : this.DEFAULT_MEALS;
        const seen = labels.slice();
        entries.forEach(e=>{ if (e.meal && seen.indexOf(e.meal)<0) seen.push(e.meal); });
        let mealsHtml = '';
        seen.forEach(meal=>{
            const items = entries.map((e,i)=>({e,i})).filter(x=>x.e.meal===meal);
            const ms = items.reduce((a,x)=>({kcal:a.kcal+(x.e.kcal||0),p:a.p+(x.e.p||0),c:a.c+(x.e.c||0),f:a.f+(x.e.f||0)}),{kcal:0,p:0,c:0,f:0});
            mealsHtml += `<div class="meal-section">
                <div class="meal-head"><span class="meal-emoji">${this.MEAL_EMOJI[meal]||'🍽️'}</span>
                  <span class="meal-name">${meal}</span>
                  <span class="meal-kcal">${this._r0(ms.kcal)} קק"ל</span>
                  <button class="meal-add" onclick="Nutrition.openSearch('${meal}')">+</button></div>
                ${items.map(x=>this._foodRowHtml(x.e,x.i)).join('')}
            </div>`;
        });

        const dateLabel = this._dateLabel(date);
        const isToday = date === this.todayKey();
        body.innerHTML = `
          <div class="nut-daynav">
            <button class="nut-arrow" onclick="Nutrition.shiftDay(-1)">‹</button>
            <button class="nut-date" onclick="Nutrition.pickDate()">${dateLabel} <span class="caret">▾</span></button>
            <button class="nut-arrow" onclick="Nutrition.shiftDay(1)" ${isToday?'style="opacity:.3;pointer-events:none;"':''}>›</button>
          </div>
          <div class="oled-card nut-summary">
            <div class="ring-wrap" style="width:104px;height:104px;">
              <svg viewBox="0 0 120 120" class="progress-ring-svg">
                <circle class="ring-bg" cx="60" cy="60" r="52"></circle>
                <circle class="ring-prog ${kpct>=1?'full':''}" cx="60" cy="60" r="52" style="stroke-dashoffset:${ringOff}"></circle>
              </svg>
              <div class="ring-center"><div class="ring-num">${this._r0(tot.kcal)}</div><div class="ring-lbl">מתוך ${t.kcalTarget}</div></div>
            </div>
            <div class="macro-bars">
              ${macroBar('חלבון',tot.p,t.proteinTarget,'p')}
              ${macroBar('פחמימה',tot.c,t.carbsTarget,'c')}
              ${macroBar('שומן',tot.f,t.fatTarget,'f')}
            </div>
          </div>
          ${mealsHtml}
          <button class="add-meal-btn" onclick="Nutrition.openSearch('${seen[0]||'בוקר'}')">+ הוסף מזון</button>
          <div style="height:14px;"></div>`;
        this.renderHomeCard();
    },

    _foodRowHtml(e, idx) {
        const sub = e.components && e.components.length
            ? `🍱 ${e.components.length} מרכיבים${e.time?' · '+e.time:''}`
            : `${e.brand?e.brand+' · ':''}${this._r0(this._entryGrams(e))}${e.unit==='serving'?(' '+(e.qty)+' מנות'):'ג'}${e.time?' · '+e.time:''}`;
        return `<div class="food-row" onclick="Nutrition.editEntry('${e.meal}',${idx})">
            <div class="fr-main"><div class="fr-name">${e.name}</div>
              <div class="fr-sub ${e.components?'fr-components':''}">${sub}</div>
              <div class="fr-macros"><span class="fr-tag p">ח ${this._round(e.p)}</span><span class="fr-tag c">פ ${this._round(e.c)}</span><span class="fr-tag f">ש ${this._round(e.f)}</span></div>
            </div>
            <div class="fr-kcal"><b>${this._r0(e.kcal)}</b><small>קק"ל</small></div>
          </div>`;
    },

    // ── ניווט ימים ──────────────────────────────────────────
    shiftDay(dir) {
        if (dir>0 && this.state.date===this.todayKey()) return; // ללא עתיד
        const d = new Date(this.state.date+'T00:00:00');
        d.setDate(d.getDate()+dir);
        const nk = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        if (nk > this.todayKey()) return;
        this.state.date = nk;
        if (app && app.haptic) app.haptic(5);
        this.render();
    },
    pickDate() {
        const inp = document.getElementById('nut-date-input');
        if (!inp) return;
        inp.max = this.todayKey();
        inp.value = this.state.date;
        if (inp.showPicker) { try { inp.showPicker(); return; } catch(e){} }
        inp.click();
    },
    _onDatePicked(v) { if (v && v<=this.todayKey()) { this.state.date=v; this.render(); } },
    _dateLabel(key) {
        const days=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
        const d=new Date(key+'T00:00:00');
        const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0');
        const prefix = key===this.todayKey() ? 'היום · ' : '';
        return `${prefix}יום ${days[d.getDay()]} ${dd}/${mm}`;
    },

    // ════════════════════════════════════════════════════════
    //  כרטיס בית
    // ════════════════════════════════════════════════════════
    renderHomeCard() {
        const ring = document.getElementById('nut-home-ring');
        if (!ring) return;
        const t = this.getTargets();
        const daily = this.loadDaily();
        const today = (daily.find(d=>d.date===this.todayKey())) || {calories:0,protein:0,carbs:0,fat:0};
        const C=327, pct=Math.min(1,(today.calories||0)/(t.kcalTarget||1));
        ring.style.strokeDashoffset = Math.round(C*(1-pct));
        ring.classList.toggle('full', pct>=1);
        const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
        set('nut-home-kcal', this._r0(today.calories));
        set('nut-home-target', '/' + t.kcalTarget + ' קק"ל');
        const setBar=(id,val,target)=>{ const el=document.getElementById(id); if(el) el.style.width=Math.min(100,Math.round((val/(target||1))*100))+'%'; };
        setBar('nut-home-mp', today.protein, t.proteinTarget);
        setBar('nut-home-mc', today.carbs, t.carbsTarget);
        setBar('nut-home-mf', today.fat, t.fatTarget);
        set('nut-home-vp', this._r0(today.protein)+'ג');
        set('nut-home-vc', this._r0(today.carbs)+'ג');
        set('nut-home-vf', this._r0(today.fat)+'ג');
    },

    // ════════════════════════════════════════════════════════
    //  Sheets — הזרקה חד-פעמית
    // ════════════════════════════════════════════════════════
    _injectSheets() {
        if (document.getElementById('nut-sheet-host')) return;
        const host = document.createElement('div');
        host.id = 'nut-sheet-host';
        host.innerHTML = `
          <input type="date" id="nut-date-input" style="position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;" onchange="Nutrition._onDatePicked(this.value)">
          <!-- שיט חיפוש -->
          <div id="nut-search-overlay" class="bottom-sheet-overlay" style="display:none;" onclick="Nutrition.closeSheets()"></div>
          <div id="nut-search-sheet" class="bottom-sheet-gs" style="display:none;">
            <div class="sheet-handle-gs"></div>
            <div class="segmented-control-gs">
              <button class="seg-btn-gs active" data-tab="search" onclick="Nutrition._searchTab('search',this)">חיפוש</button>
              <button class="seg-btn-gs" data-tab="recent" onclick="Nutrition._searchTab('recent',this)">אחרונים</button>
              <button class="seg-btn-gs" data-tab="fav" onclick="Nutrition._searchTab('fav',this)">מועדפים</button>
            </div>
            <input id="nut-search-input" class="search-input" placeholder="🔍 חפשי מזון..." oninput="Nutrition._onSearchInput(this.value)">
            <div class="search-cams">
              <div class="cam-btn"><span class="ci">📷</span>ברקוד<span class="cam-soon">בקרוב</span></div>
              <div class="cam-btn"><span class="ci">🏷️</span>תווית<span class="cam-soon">בקרוב</span></div>
              <div class="cam-btn" onclick="Nutrition.openBuilder()" style="opacity:1;cursor:pointer;"><span class="ci">🍱</span>בניית מנה<span class="cam-soon">מרכיבים</span></div>
            </div>
            <div id="nut-results"></div>
          </div>
          <!-- עורך כמות -->
          <div id="nut-portion-overlay" class="bottom-sheet-overlay" style="display:none;z-index:310;" onclick="Nutrition.closePortion()"></div>
          <div id="nut-portion-sheet" class="bottom-sheet-gs" style="display:none;z-index:311;"></div>
          <!-- Meal Builder -->
          <div id="nut-builder-overlay" class="bottom-sheet-overlay" style="display:none;z-index:310;" onclick="Nutrition.closeSheets()"></div>
          <div id="nut-builder-sheet" class="bottom-sheet-gs" style="display:none;z-index:311;"></div>
          <!-- יעדים -->
          <div id="nut-targets-overlay" class="bottom-sheet-overlay" style="display:none;" onclick="Nutrition.closeSheets()"></div>
          <div id="nut-targets-sheet" class="bottom-sheet-gs" style="display:none;"></div>`;
        document.body.appendChild(host);
    },
    closeSheets() {
        ['nut-search','nut-builder','nut-targets'].forEach(p=>{
            const o=document.getElementById(p+'-overlay'), s=document.getElementById(p+'-sheet');
            if(o)o.style.display='none'; if(s)s.style.display='none';
        });
    },

    // ════════════════════════════════════════════════════════
    //  שיט חיפוש
    // ════════════════════════════════════════════════════════
    openSearch(meal) {
        this.state.sheetMeal = meal || 'בוקר';
        this._injectSheets();
        document.getElementById('nut-search-overlay').style.display='block';
        const sheet=document.getElementById('nut-search-sheet'); sheet.style.display='flex';
        const inp=document.getElementById('nut-search-input'); inp.value='';
        this._searchTab('recent', sheet.querySelector('[data-tab="recent"]'));
    },
    _searchTab(tab, btn) {
        const sheet=document.getElementById('nut-search-sheet');
        sheet.querySelectorAll('.seg-btn-gs').forEach(b=>b.classList.remove('active'));
        if(btn) btn.classList.add('active');
        if (tab==='recent') this._renderResults(this._recentFoods());
        else if (tab==='fav') this._renderResults(this.loadFoodDb().filter(f=>f.favorite));
        else { const v=document.getElementById('nut-search-input').value; this._onSearchInput(v); }
    },
    _recentFoods() {
        return this.loadFoodDb().slice().sort((a,b)=>(b.lastUsed||0)-(a.lastUsed||0)).slice(0,20);
    },
    _onSearchInput(q) {
        clearTimeout(this.state.searchTimer);
        const query=(q||'').trim();
        if (query.length<2) { this._renderResults(this._recentFoods()); return; }
        // שכבה מיידית: BASIC + FOOD_DB
        const local = this._localMatches(query);
        this._renderResults(local, true);
        // רשת — צמ"ת + OFF
        this.state.searchTimer = setTimeout(()=> this._netSearch(query, local), 350);
    },
    _localMatches(q) {
        const tokens=this._tokens(q);
        const score=(name)=>this._fdTokenMatch(tokens, name);
        const out=[];
        this.loadFoodDb().forEach(f=>{ const s=score(f.name); if(s>0) out.push({src:f.source||'custom',rec:f,score:s+1}); });
        this.BASIC_FOODS.forEach(f=>{ if(out.some(o=>this._normalize(o.rec.name)===this._normalize(f.name)))return; const s=score(f.name); if(s>0) out.push({src:'basic',rec:f,score:s}); });
        return out.sort((a,b)=>b.score-a.score).slice(0,12).map(o=>this._toResult(o.rec,o.src));
    },
    async _netSearch(q, localResults) {
        let net=[];
        try {
            const settled = await Promise.allSettled([ this.searchTzameret(q), this.searchOFF(q) ]);
            settled.forEach(s=>{ if(s.status==='fulfilled' && Array.isArray(s.value)) net=net.concat(s.value); });
        } catch(e){}
        // מיזוג + dedup (מקומי קודם, ואז רשת)
        const merged=[...localResults]; const seen=new Set(localResults.map(r=>this._normalize(r.name)));
        net.forEach(r=>{ const n=this._normalize(r.name); if(!seen.has(n)){ seen.add(n); merged.push(r); } });
        this._renderResults(merged);
    },
    _renderResults(list, loading) {
        const box=document.getElementById('nut-results'); if(!box) return;
        if (!list || !list.length) { box.innerHTML=`<div style="text-align:center;color:var(--text-ter);padding:24px 0;font-size:0.85rem;">לא נמצאו תוצאות</div>`; return; }
        box.innerHTML = (loading?`<div style="text-align:center;color:var(--text-ter);font-size:0.72rem;padding:2px 0 8px;">מחפש ברשת…</div>`:'')
          + list.map((r,i)=>{
            const chip=this._srcChip(r.source);
            return `<div class="result-row" onclick='Nutrition._pickResult(${i})'>
              <div class="rr-main"><div class="rr-name-line"><span class="rr-name">${r.name}</span>${chip}</div>
                <div class="rr-kcal-line"><b>${this._r0(r.per100.kcal)} קק"ל</b> · ח ${this._round(r.per100.p)} · פ ${this._round(r.per100.c)} · ש ${this._round(r.per100.f)} <span style="color:var(--text-ter);">(ל-100ג')</span></div></div>
              <div class="rr-add">+</div></div>`;
          }).join('');
        this._lastResults = list;
    },
    _pickResult(i) {
        const r=(this._lastResults||[])[i]; if(!r) return;
        this.openPortion(r);
    },
    _toResult(rec, src) {
        return { id:rec.id, name:rec.name, brand:rec.brand||'', barcode:rec.barcode||null, source:src||rec.source||'custom', per100:rec.per100 };
    },
    _srcChip(src) {
        const map={ tzameret:['tzameret','צמ"ת'], off:['off','OFF'], usda:['off','USDA'], gemini:['ai','AI'], basic:['custom','בסיסי'], custom:['custom','שלי'] };
        const m=map[src]||['custom', src||'']; return `<span class="src-chip ${m[0]}">${m[1]}</span>`;
    },

    // ── נרמול וטוקנים ────────────────────────────────────────
    _normalize(s){ return (s||'').toString().replace(/[֑-ׇ]/g,'').replace(/["'`.,()\-]/g,'').replace(/\s+/g,' ').trim().toLowerCase(); },
    _tokens(s){ return this._normalize(s).split(' ').filter(Boolean); },
    _fdTokenMatch(tokens, name){
        const n=this._normalize(name); let score=0;
        tokens.forEach(t=>{ if(!t)return; if(n===t)score+=3; else if(n.startsWith(t))score+=2; else if(n.indexOf(t)>=0)score+=1; });
        return score;
    },

    // ── מקורות רשת ───────────────────────────────────────────
    async _fdFetch(url, ms){
        const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(), ms||6000);
        try { const res=await fetch(url,{signal:ctrl.signal}); clearTimeout(t); if(!res.ok) return null; return await res.json(); }
        catch(e){ clearTimeout(t); return null; }
    },
    async searchTzameret(q){
        const url='https://data.gov.il/api/3/action/datastore_search?resource_id=c3cb0630-0650-46c1-a068-82d575c094b2&q='+encodeURIComponent(q)+'&limit=15';
        const j=await this._fdFetch(url); const recs=j&&j.result&&j.result.records; if(!recs) return [];
        return recs.map(r=>{
            const kcal=parseFloat(r.food_energy), p=parseFloat(r.protein), c=parseFloat(r.carbohydrates), f=parseFloat(r.total_fat);
            if(!r.shmmitzrach || isNaN(kcal)) return null;
            return { name:String(r.shmmitzrach).trim(), source:'tzameret', barcode:null, per100:{kcal:this._round(kcal),p:this._round(p||0),c:this._round(c||0),f:this._round(f||0)} };
        }).filter(Boolean);
    },
    async searchOFF(q){
        const url='https://world.openfoodfacts.org/cgi/search.pl?search_terms='+encodeURIComponent(q)+'&search_simple=1&action=process&json=1&page_size=12&fields=product_name,product_name_he,brands,code,nutriments';
        const j=await this._fdFetch(url); const prods=j&&j.products; if(!prods) return [];
        return prods.map(pr=>{
            const nm=pr.product_name_he||pr.product_name; const nu=pr.nutriments||{};
            const kcal=nu['energy-kcal_100g']; if(!nm||kcal==null) return null;
            return { name:String(nm).trim(), brand:pr.brands||'', barcode:pr.code||null, source:'off',
                     per100:{kcal:this._round(kcal),p:this._round(nu.proteins_100g||0),c:this._round(nu.carbohydrates_100g||0),f:this._round(nu.fat_100g||0)} };
        }).filter(Boolean);
    },

    // ════════════════════════════════════════════════════════
    //  עורך כמות
    // ════════════════════════════════════════════════════════
    openPortion(food, editRef){
        this.state.sheetFood=food;
        this.state.editRef=editRef||null;
        this.state.sheetUnit = food.gramsPerUnit ? 'serving' : 'g';
        this.state.sheetQty = (editRef && food.qty) ? food.qty : (this.state.sheetUnit==='serving'?1:100);
        this.state.sheetMeal = (editRef && food.meal) ? food.meal : (this.state.sheetMeal||'בוקר');
        document.getElementById('nut-portion-overlay').style.display='block';
        document.getElementById('nut-portion-sheet').style.display='flex';
        this._renderPortion();
    },
    closePortion(){ ['nut-portion-overlay','nut-portion-sheet'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';}); },
    _portionGrams(){ const f=this.state.sheetFood; return this.state.sheetUnit==='serving' ? this.state.sheetQty*(f.gramsPerUnit||100) : this.state.sheetQty; },
    _renderPortion(){
        const f=this.state.sheetFood, sheet=document.getElementById('nut-portion-sheet');
        const grams=this._portionGrams(); const m=this._calcFromPer100(f.per100,grams);
        const labels=this.getTargets().mealLabels||this.DEFAULT_MEALS;
        const editing=!!this.state.editRef;
        sheet.innerHTML=`<div class="sheet-handle-gs"></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <h3 class="sheet-title" style="margin:0;">${f.name}</h3>${this._srcChip(f.source)}</div>
          <p class="sheet-desc">${this._r0(f.per100.kcal)} קק"ל ל-100 גרם</p>
          <div class="portion-qty">
            <button class="stepper-btn" onclick="Nutrition._qtyStep(-1)">−</button>
            <div><span class="stepper-val" id="nut-pq-val">${this.state.sheetQty}</span> <span class="pq-unit">${this.state.sheetUnit==='serving'?'מנות':'גרם'}</span></div>
            <button class="stepper-btn" onclick="Nutrition._qtyStep(1)">+</button>
          </div>
          ${f.gramsPerUnit?`<div class="field-label">יחידה</div><div class="unit-toggle">
            <div class="ut ${this.state.sheetUnit==='serving'?'active':''}" onclick="Nutrition._setUnit('serving')">מנה (${f.gramsPerUnit}ג)</div>
            <div class="ut ${this.state.sheetUnit==='g'?'active':''}" onclick="Nutrition._setUnit('g')">גרם</div></div>`:''}
          <div class="field-label">ארוחה</div>
          <div class="meal-chip-row">${labels.map(l=>`<span class="chip ${l===this.state.sheetMeal?'active':''}" onclick="Nutrition._setMeal('${l}')">${l}</span>`).join('')}</div>
          <div class="field-label">שעה</div>
          <input id="nut-pq-time" class="oled-input" style="text-align:center;" value="${editing&&f.time?f.time:this._nowTime()}">
          <div class="preview-box">
            <div class="preview-kcal" id="nut-pq-kcal">${this._r0(m.kcal)} <small>קק"ל</small></div>
            <div class="preview-macros" id="nut-pq-macros">
              <span class="pm"><span class="pm-dot" style="background:var(--macro-protein)"></span>ח ${m.p}ג</span>
              <span class="pm"><span class="pm-dot" style="background:var(--macro-carbs)"></span>פ ${m.c}ג</span>
              <span class="pm"><span class="pm-dot" style="background:var(--macro-fat)"></span>ש ${m.f}ג</span></div>
          </div>
          <button class="btn-primary" onclick="Nutrition.savePortion()">${editing?'עדכן':'הוסף ליומן'}</button>
          ${editing?`<button class="btn-quiet" onclick="Nutrition.deleteCurrent()">מחק רשומה</button>`:''}`;
    },
    _qtyStep(dir){ const step=this.state.sheetUnit==='serving'?0.5:(this.state.sheetQty<50?5:10); this.state.sheetQty=Math.max(this.state.sheetUnit==='serving'?0.5:5, this._round(this.state.sheetQty+dir*step)); this._updatePortionPreview(true); },
    _setUnit(u){ this.state.sheetUnit=u; this.state.sheetQty=u==='serving'?1:100; this._renderPortion(); },
    _setMeal(m){ this.state.sheetMeal=m; const sheet=document.getElementById('nut-portion-sheet'); sheet.querySelectorAll('.meal-chip-row .chip').forEach(c=>c.classList.toggle('active',c.textContent===m)); },
    _updatePortionPreview(updVal){
        const f=this.state.sheetFood, grams=this._portionGrams(), m=this._calcFromPer100(f.per100,grams);
        if(updVal){ const v=document.getElementById('nut-pq-val'); if(v) v.textContent=this.state.sheetQty; }
        const k=document.getElementById('nut-pq-kcal'); if(k) k.innerHTML=`${this._r0(m.kcal)} <small>קק"ל</small>`;
        const mc=document.getElementById('nut-pq-macros'); if(mc) mc.innerHTML=`<span class="pm"><span class="pm-dot" style="background:var(--macro-protein)"></span>ח ${m.p}ג</span><span class="pm"><span class="pm-dot" style="background:var(--macro-carbs)"></span>פ ${m.c}ג</span><span class="pm"><span class="pm-dot" style="background:var(--macro-fat)"></span>ש ${m.f}ג</span>`;
    },
    _nowTime(){ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); },
    savePortion(){
        const f=this.state.sheetFood, grams=this._portionGrams(), m=this._calcFromPer100(f.per100,grams);
        const time=(document.getElementById('nut-pq-time')||{}).value||this._nowTime();
        const entry={ id:f.id||('e_'+Date.now()), name:f.name, brand:f.brand||'', source:f.source||'custom', barcode:f.barcode||null,
            meal:this.state.sheetMeal, time, qty:this.state.sheetQty, unit:this.state.sheetUnit, gramsPerUnit:f.gramsPerUnit||null,
            per100:f.per100, kcal:m.kcal, p:m.p, c:m.c, f:m.f };
        if (this.state.editRef){ this.updateEntryAt(this.state.editRef.date, this.state.editRef.idx, entry); }
        else { this.addFoodEntry(this.state.date, entry); }
        this.closePortion(); this.closeSheets();
        if(app&&app.haptic)app.haptic(8); if(app&&app.toast)app.toast('נוסף ליומן ✓','success');
        this.render();
    },
    editEntry(meal, idx){
        const e=(this.loadLog()[this.state.date]||[])[idx]; if(!e) return;
        if (e.components && e.components.length){ this.openBuilder(e, {date:this.state.date, idx}); return; }
        this.openPortion(Object.assign({}, e), {date:this.state.date, idx});
    },
    deleteCurrent(){
        if(!this.state.editRef) return;
        this.deleteEntryAt(this.state.editRef.date, this.state.editRef.idx);
        this.closePortion(); this.closeSheets();
        if(app&&app.toast)app.toast('נמחק'); this.render();
    },

    // ════════════════════════════════════════════════════════
    //  Meal Builder
    // ════════════════════════════════════════════════════════
    openBuilder(existing, editRef){
        this._injectSheets();
        this.state.editRef = editRef || null;
        if (existing && existing.components){
            this.state.builder = { name:existing.name, time:existing.time, meal:existing.meal,
                components: existing.components.map(c=>Object.assign({},c)) };
        } else {
            this.state.builder = { name:'', meal:this.state.sheetMeal||'בוקר',
                components:[ {name:'', grams:100, per100:{kcal:0,p:0,c:0,f:0}} ] };
        }
        document.getElementById('nut-search-overlay').style.display='none';
        document.getElementById('nut-search-sheet').style.display='none';
        document.getElementById('nut-builder-overlay').style.display='block';
        document.getElementById('nut-builder-sheet').style.display='flex';
        this._renderBuilder();
    },
    _builderTotals(){
        return this.state.builder.components.reduce((a,c)=>{
            const m=this._calcFromPer100(c.per100||{}, c.grams||0);
            return {grams:a.grams+(c.grams||0), kcal:a.kcal+m.kcal, p:a.p+m.p, c:a.c+m.c, f:a.f+m.f};
        }, {grams:0,kcal:0,p:0,c:0,f:0});
    },
    _renderBuilder(){
        const b=this.state.builder, sheet=document.getElementById('nut-builder-sheet'), tot=this._builderTotals();
        const rows=b.components.map((c,i)=>`
          <div class="ingredient-row">
            <div class="ing-top">
              <input class="ing-name" value="${(c.name||'').replace(/"/g,'&quot;')}" placeholder="שם מרכיב" oninput="Nutrition._ingSet(${i},'name',this.value)">
              <input class="ing-grams" type="number" inputmode="decimal" value="${c.grams||0}" oninput="Nutrition._ingSet(${i},'grams',this.value)"><span class="ing-grams-unit">ג</span>
              <button class="ing-del" onclick="Nutrition._ingDel(${i})">✕</button>
            </div>
            <div class="ing-per100"><span>ל-100ג':</span>
              <input class="ing-mini" type="number" inputmode="decimal" value="${c.per100.kcal||0}" oninput="Nutrition._ingSet(${i},'kcal',this.value)" title="קלוריות">קק"ל
              <input class="ing-mini" type="number" inputmode="decimal" value="${c.per100.p||0}" oninput="Nutrition._ingSet(${i},'p',this.value)" title="חלבון">ח
              <input class="ing-mini" type="number" inputmode="decimal" value="${c.per100.c||0}" oninput="Nutrition._ingSet(${i},'c',this.value)" title="פחמימה">פ
              <input class="ing-mini" type="number" inputmode="decimal" value="${c.per100.f||0}" oninput="Nutrition._ingSet(${i},'f',this.value)" title="שומן">ש
            </div>
          </div>`).join('');
        const labels=this.getTargets().mealLabels||this.DEFAULT_MEALS;
        sheet.innerHTML=`<div class="sheet-handle-gs"></div>
          <h3 class="sheet-title">בניית מנה</h3>
          <p class="sheet-desc">כל מרכיב ניתן לעריכה מלאה (שם · ערכים ל-100ג' · גרמים)</p>
          <div class="field-label">שם המנה</div>
          <input class="oled-input" style="margin-bottom:12px;" value="${(b.name||'').replace(/"/g,'&quot;')}" placeholder="לדוגמה: סלט קינואה" oninput="Nutrition.state.builder.name=this.value">
          <div class="field-label">ארוחה</div>
          <div class="meal-chip-row" style="margin-bottom:12px;">${labels.map(l=>`<span class="chip ${l===b.meal?'active':''}" onclick="Nutrition._builderMeal('${l}')">${l}</span>`).join('')}</div>
          ${rows}
          <button class="add-ing-btn" onclick="Nutrition._ingAdd()">+ הוסף מרכיב</button>
          <div class="builder-total">
            <div><div class="bt-kcal">${this._r0(tot.kcal)} קק"ל</div><div class="bt-macros">${this._r0(tot.grams)} גרם סה"כ</div></div>
            <div class="bt-macros" style="text-align:left;"><span class="fr-tag p">ח ${this._round(tot.p)}</span> <span class="fr-tag c">פ ${this._round(tot.c)}</span> <span class="fr-tag f">ש ${this._round(tot.f)}</span></div>
          </div>
          <button class="btn-primary" onclick="Nutrition.saveBuilder()">${this.state.editRef?'עדכן מנה':'שמור מנה'}</button>`;
    },
    _ingSet(i,field,val){
        const c=this.state.builder.components[i]; if(!c)return;
        if(field==='name') c.name=val;
        else if(field==='grams') c.grams=parseFloat(val)||0;
        else c.per100[field]=parseFloat(val)||0;
        this._updateBuilderTotal();
    },
    _updateBuilderTotal(){
        const tot=this._builderTotals(), sheet=document.getElementById('nut-builder-sheet');
        const bt=sheet.querySelector('.builder-total');
        if(bt) bt.innerHTML=`<div><div class="bt-kcal">${this._r0(tot.kcal)} קק"ל</div><div class="bt-macros">${this._r0(tot.grams)} גרם סה"כ</div></div>
            <div class="bt-macros" style="text-align:left;"><span class="fr-tag p">ח ${this._round(tot.p)}</span> <span class="fr-tag c">פ ${this._round(tot.c)}</span> <span class="fr-tag f">ש ${this._round(tot.f)}</span></div>`;
    },
    _ingAdd(){ this.state.builder.components.push({name:'',grams:50,per100:{kcal:0,p:0,c:0,f:0}}); this._renderBuilder(); },
    _ingDel(i){ this.state.builder.components.splice(i,1); if(!this.state.builder.components.length)this._ingAdd(); else this._renderBuilder(); },
    _builderMeal(m){ this.state.builder.meal=m; const sheet=document.getElementById('nut-builder-sheet'); sheet.querySelectorAll('.meal-chip-row .chip').forEach(c=>c.classList.toggle('active',c.textContent===m)); },
    saveBuilder(){
        const b=this.state.builder;
        const comps=b.components.filter(c=>(c.grams||0)>0 && c.name.trim());
        if(!comps.length){ if(app&&app.toast)app.toast('הוסיפי מרכיב אחד לפחות','error'); return; }
        // שדה מצרפי = סכום הרכיבים (כולל grams!)
        const comp2=comps.map(c=>{ const m=this._calcFromPer100(c.per100,c.grams); return {name:c.name.trim(),grams:c.grams,per100:c.per100,kcal:m.kcal,p:m.p,c:m.c,f:m.f}; });
        const tot=comp2.reduce((a,c)=>({grams:a.grams+c.grams,kcal:a.kcal+c.kcal,p:a.p+c.p,c:a.c+c.c,f:a.f+c.f}),{grams:0,kcal:0,p:0,c:0,f:0});
        const entry={ id:'meal_'+Date.now(), name:b.name.trim()||'מנה מורכבת', source:'custom', meal:b.meal||'בוקר',
            time:b.time||this._nowTime(), qty:1, unit:'serving', gramsPerUnit:this._round(tot.grams),
            grams:this._round(tot.grams), components:comp2,
            per100:{ kcal:tot.grams?this._round(tot.kcal/tot.grams*100):0, p:tot.grams?this._round(tot.p/tot.grams*100):0, c:tot.grams?this._round(tot.c/tot.grams*100):0, f:tot.grams?this._round(tot.f/tot.grams*100):0 },
            kcal:this._round(tot.kcal), p:this._round(tot.p), c:this._round(tot.c), f:this._round(tot.f) };
        if(this.state.editRef){ this.updateEntryAt(this.state.editRef.date,this.state.editRef.idx,entry); }
        else { this.addFoodEntry(this.state.date, entry); }
        this.closeSheets();
        if(app&&app.haptic)app.haptic(8); if(app&&app.toast)app.toast('המנה נשמרה ✓','success');
        this.render();
    },

    // ════════════════════════════════════════════════════════
    //  יעדים
    // ════════════════════════════════════════════════════════
    openTargets(){
        this._injectSheets();
        const t=this.getTargets(), sheet=document.getElementById('nut-targets-sheet');
        document.getElementById('nut-targets-overlay').style.display='block';
        sheet.style.display='flex';
        const f=(lbl,id,val,unit)=>`<div class="field-label">${lbl}</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><input id="${id}" class="oled-input" type="number" inputmode="numeric" value="${val}" style="text-align:center;"><span style="color:var(--text-sec);font-size:0.85rem;">${unit}</span></div>`;
        sheet.innerHTML=`<div class="sheet-handle-gs"></div>
          <h3 class="sheet-title">יעדים יומיים</h3>
          <p class="sheet-desc">הסיכום היומי משווה את הנצרך מול היעד</p>
          ${f('קלוריות','nt-kcal',t.kcalTarget,'קק"ל')}
          ${f('חלבון','nt-p',t.proteinTarget,'גרם')}
          ${f('פחמימה','nt-c',t.carbsTarget,'גרם')}
          ${f('שומן','nt-f',t.fatTarget,'גרם')}
          <button class="btn-primary" style="margin-top:10px;" onclick="Nutrition.saveTargetsFromSheet()">שמירה</button>`;
    },
    saveTargetsFromSheet(){
        const g=id=>parseFloat((document.getElementById(id)||{}).value)||0;
        const t=this.getTargets();
        t.kcalTarget=g('nt-kcal')||t.kcalTarget; t.proteinTarget=g('nt-p'); t.carbsTarget=g('nt-c'); t.fatTarget=g('nt-f');
        this.saveTargets(t); this.closeSheets();
        if(app&&app.toast)app.toast('היעדים עודכנו ✓','success');
        this._cloudSyncSoon(); this.render();
    },

    // ════════════════════════════════════════════════════════
    //  סנכרון ענן (debounced) — נשען על FirebaseManager
    // ════════════════════════════════════════════════════════
    _cloudSyncSoon(){
        try {
            if (typeof FirebaseManager==='undefined' || !FirebaseManager.isConfigured || !FirebaseManager.isConfigured()) return;
            clearTimeout(this._cloudTimer);
            this._cloudTimer=setTimeout(()=>{ if(FirebaseManager.saveNutritionToCloud) FirebaseManager.saveNutritionToCloud(); }, 4000);
        } catch(e){}
    },

    // ── החלקה לניווט ימים ────────────────────────────────────
    _touchStart(ev){ this.state.swipeX = ev.changedTouches ? ev.changedTouches[0].clientX : 0; this._swipeY = ev.changedTouches ? ev.changedTouches[0].clientY : 0; },
    _touchEnd(ev){
        if (!ev.changedTouches) return;
        const dx = ev.changedTouches[0].clientX - this.state.swipeX;
        const dy = ev.changedTouches[0].clientY - (this._swipeY||0);
        if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;
        // RTL: החלקה שמאלה = יום קודם, ימינה = יום הבא
        this.shiftDay(dx < 0 ? -1 : 1);
    }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>Nutrition.init());
else Nutrition.init();
