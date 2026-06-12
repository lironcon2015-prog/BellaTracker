/**
 * GymStart — Insights & Gamification layer
 * שכבת תובנות: אנליטיקס, גרפי SVG (offline, ללא ספריות), badges, XP/levels.
 * כל הנתונים נגזרים מ-state.history הקיים — אפס שינוי storage.
 * מתחבר לאובייקט app הגלובלי דרך Object.assign (ללא modules).
 */
(function () {
    'use strict';
    if (typeof app === 'undefined') return;

    // מפתח storage חדש בלבד — לסימון badges שכבר נראו (חגיגת unlock פעם אחת)
    const SEEN_KEY_BASE = 'gymstart_v2_seen_badges';

    // קטגוריות שריר — תווית + צבע (לגרף התפלגות)
    const CATS = {
        legs:      { l: 'רגליים',  c: '#ff4d8d' },
        chest:     { l: 'חזה',      c: '#b832f0' },
        back:      { l: 'גב',       c: '#ff6a4d' },
        shoulders: { l: 'כתפיים',   c: '#3b9dff' },
        arms:      { l: 'ידיים',    c: '#ffcf6b' },
        core:      { l: 'core',     c: '#34e07a' },
        other:     { l: 'אחר',      c: '#8892a0' }
    };

    // הגדרת התגים (badges) — נגזרים מ-stats אגרגטיביים
    const BADGES = [
        { id: 'first',    icon: '🌱', t: 'הצעד הראשון',  d: 'השלמת אימון ראשון',     test: s => s.count >= 1 },
        { id: 'w10',      icon: '🔥', t: '10 אימונים',    d: 'עשר נקודות על הלוח',     test: s => s.count >= 10 },
        { id: 'w25',      icon: '⚡', t: '25 אימונים',    d: 'התמדה אמיתית',           test: s => s.count >= 25 },
        { id: 'w50',      icon: '💪', t: '50 אימונים',    d: 'חצי מאה!',               test: s => s.count >= 50 },
        { id: 'w100',     icon: '👑', t: '100 אימונים',   d: 'מאה אימונים — אגדה',     test: s => s.count >= 100 },
        { id: 'streak4',  icon: '📅', t: 'חודש ברצף',     d: '4 שבועות רצופים',        test: s => s.streak >= 4 },
        { id: 'streak8',  icon: '🗓️', t: 'רצף כפול',      d: '8 שבועות רצופים',        test: s => s.streak >= 8 },
        { id: 'vol5',     icon: '🏋️', t: '5 טון',         d: '5,000 ק״ג מצטבר',        test: s => s.totalVolume >= 5000 },
        { id: 'vol25',    icon: '🚀', t: '25 טון',        d: '25,000 ק״ג מצטבר',       test: s => s.totalVolume >= 25000 },
        { id: 'vol100',   icon: '🦾', t: '100 טון',       d: '100,000 ק״ג — מפלצת',    test: s => s.totalVolume >= 100000 },
        { id: 'targets5', icon: '🎯', t: 'צלפית',          d: '5 יעדי מאמן הושגו',      test: s => s.targetsHit >= 5 },
        { id: 'variety',  icon: '🌈', t: 'גיוון',          d: '10 תרגילים שונים',       test: s => s.distinctExercises >= 10 },
        { id: 'early',    icon: '🌅', t: 'ציפור בוקר',     d: 'אימון לפני 8 בבוקר',     test: s => s.earlyWorkouts >= 1 }
    ];

    Object.assign(app, {

        // ───────────────────────────── חישובי ליבה ─────────────────────────────

        _esc: function (str) {
            return String(str == null ? '' : str)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        },

        _seenKey: function () {
            // suffix לפי פרופיל ('' לבלה — מפתח legacy); fallback אם PROFILES לא נטען
            const prof = (typeof PROFILES !== 'undefined' && PROFILES[this.state.activeProfile]) || null;
            return SEEN_KEY_BASE + (prof ? prof.suffix : '');
        },

        // נפח של אימון בודד = Σ(משקל × חזרות). תרגילי זמן/משקל-גוף לא תורמים לנפח.
        _workoutVolume: function (h) {
            let v = 0;
            (h.data || []).forEach(ex => {
                (ex.sets || []).forEach(set => {
                    const w = Number(set.w) || 0;
                    const r = Number(set.r) || 0;
                    if (w > 0 && r > 0) v += w * r;
                });
            });
            return v;
        },

        // אגרגציה מלאה מההיסטוריה — מקור היחיד לכל התובנות
        computeInsights: function () {
            const hist = this.state.history || [];
            const s = {
                count: hist.length,
                totalVolume: 0, totalSets: 0, totalReps: 0,
                targetsHit: 0, earlyWorkouts: 0,
                distinctExercises: 0, streak: 0,
                perCat: {}, feel: { easy: 0, good: 0, hard: 0 },
                volumeSeries: [], weeklySeries: [], weeklyLabels: [],
                prList: [], heat: {}
            };
            const exSeen = new Set();
            const exBest = {}; // id → {name, best, unit}

            hist.forEach(h => {
                const vol = this._workoutVolume(h);
                s.totalVolume += vol;
                s.volumeSeries.push(vol);
                if (Array.isArray(h.achievedTargets)) s.targetsHit += h.achievedTargets.length;
                if (typeof h.timestamp === 'number') {
                    const hr = new Date(h.timestamp).getHours();
                    if (hr < 8) s.earlyWorkouts++;
                }
                // heatmap: ספירת אימונים ליום
                try {
                    const d = this._parseDateStr(h.date);
                    const key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
                    s.heat[key] = (s.heat[key] || 0) + 1;
                } catch (e) {}

                (h.data || []).forEach(ex => {
                    exSeen.add(ex.id);
                    const def = this.getExerciseDef(ex.id);
                    const cat = (def && def.cat) || 'other';
                    const unit = (def && def.settings && def.settings.unit) || 'kg';
                    const isRepBased = unit === 'time' || unit === 'bodyweight';
                    (ex.sets || []).forEach(set => {
                        s.totalSets++;
                        s.totalReps += Number(set.r) || 0;
                        s.perCat[cat] = (s.perCat[cat] || 0) + 1;
                        if (set.feel && s.feel[set.feel] != null) s.feel[set.feel]++;
                        // שיא אישי לכל תרגיל
                        const metric = isRepBased ? (Number(set.r) || 0) : (Number(set.w) || 0);
                        if (!exBest[ex.id] || metric > exBest[ex.id].best) {
                            exBest[ex.id] = { name: ex.name || (def && def.name) || ex.id, best: metric, unit: unit };
                        }
                    });
                });
            });

            s.distinctExercises = exSeen.size;
            s.streak = this.calcStreak();

            // 8 שבועות אחרונים — תדירות
            const weekCount = {};
            hist.forEach(h => {
                try { const k = this._getWeekKey(this._parseDateStr(h.date)); weekCount[k] = (weekCount[k] || 0) + 1; } catch (e) {}
            });
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const sun = new Date(today); sun.setDate(today.getDate() - today.getDay());
            for (let i = 7; i >= 0; i--) {
                const wd = new Date(sun); wd.setDate(sun.getDate() - i * 7);
                const k = this._getWeekKey(wd);
                s.weeklySeries.push(weekCount[k] || 0);
                s.weeklyLabels.push(String(wd.getDate()) + '/' + (wd.getMonth() + 1));
            }

            // רשימת שיאים — ממוינת לפי best, עד 6
            s.prList = Object.keys(exBest)
                .map(id => exBest[id])
                .filter(x => x.best > 0)
                .sort((a, b) => b.best - a.best)
                .slice(0, 6);

            // XP & Level
            const badgeCount = BADGES.filter(b => b.test(s)).length;
            s.xp = s.count * 12 + s.targetsHit * 20 + Math.floor(s.totalVolume / 500) + badgeCount * 15;
            const PER_LEVEL = 300;
            s.level = Math.floor(s.xp / PER_LEVEL) + 1;
            s.xpInLevel = s.xp % PER_LEVEL;
            s.xpForLevel = PER_LEVEL;
            s.badgeCount = badgeCount;
            return s;
        },

        // ───────────────────────────── מנוע גרפי SVG ─────────────────────────────

        _themeColors: function () {
            const cs = getComputedStyle(document.body);
            return {
                p: (cs.getPropertyValue('--primary').trim() || '#ff4d8d'),
                p2: (cs.getPropertyValue('--primary-2').trim() || '#b832f0')
            };
        },

        _gradId: function () {
            this._chartSeq = (this._chartSeq || 0) + 1;
            return 'gs-grad-' + this._chartSeq;
        },

        // גרף קו עם מילוי שטח — מגמת נפח
        chartLine: function (vals, opts) {
            opts = opts || {};
            const W = 320, H = 120, pad = 12, padB = 18;
            if (!vals || vals.length < 2) return '<div class="chart-empty">צריך עוד אימונים כדי להציג מגמה</div>';
            const tc = this._themeColors();
            const gid = this._gradId(), gidF = gid + 'f';
            const min = Math.min(...vals), max = Math.max(...vals), range = (max - min) || 1;
            const n = vals.length;
            const X = i => pad + (i / (n - 1)) * (W - pad * 2);
            const Y = v => (H - padB) - ((v - min) / range) * (H - padB - pad);
            const pts = vals.map((v, i) => X(i).toFixed(1) + ',' + Y(v).toFixed(1));
            const line = 'M' + pts.join(' L');
            const area = 'M' + X(0).toFixed(1) + ',' + (H - padB) + ' L' + pts.join(' L') + ' L' + X(n - 1).toFixed(1) + ',' + (H - padB) + ' Z';
            const last = vals[n - 1], lastX = X(n - 1), lastY = Y(last);
            return '<svg class="gs-chart" viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;">' +
                '<defs>' +
                '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + tc.p2 + '"/><stop offset="1" stop-color="' + tc.p + '"/></linearGradient>' +
                '<linearGradient id="' + gidF + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + tc.p + '" stop-opacity="0.28"/><stop offset="1" stop-color="' + tc.p + '" stop-opacity="0"/></linearGradient>' +
                '</defs>' +
                '<path d="' + area + '" fill="url(#' + gidF + ')"/>' +
                '<path d="' + line + '" fill="none" stroke="url(#' + gid + ')" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="3.5" fill="' + tc.p + '"/>' +
                '</svg>';
        },

        // גרף עמודות — תדירות שבועית
        chartBars: function (vals, labels, opts) {
            opts = opts || {};
            const W = 320, H = 130, pad = 10, padB = 22, gap = 6;
            if (!vals || !vals.length) return '<div class="chart-empty">אין נתונים</div>';
            const tc = this._themeColors();
            const gid = this._gradId();
            const max = Math.max(...vals, 1);
            const n = vals.length;
            const bw = (W - pad * 2 - gap * (n - 1)) / n;
            let bars = '';
            vals.forEach((v, i) => {
                const x = pad + i * (bw + gap);
                const h = (v / max) * (H - padB - pad);
                const y = (H - padB) - h;
                const fill = v > 0 ? 'url(#' + gid + ')' : 'rgba(255,255,255,0.07)';
                bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(h, 2).toFixed(1) + '" rx="3" fill="' + fill + '"/>';
                if (v > 0) bars += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" text-anchor="middle" class="gs-bar-val">' + v + '</text>';
                bars += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="gs-bar-lbl">' + this._esc(labels[i]) + '</text>';
            });
            return '<svg class="gs-chart" viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;">' +
                '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + tc.p + '"/><stop offset="1" stop-color="' + tc.p2 + '"/></linearGradient></defs>' +
                bars + '</svg>';
        },

        // דונאט — התפלגות קבוצות שריר
        chartDonut: function (segments, opts) {
            opts = opts || {};
            const total = segments.reduce((a, b) => a + b.value, 0);
            if (!total) return '<div class="chart-empty">אין נתונים</div>';
            const R = 52, C = 60, sw = 16, circ = 2 * Math.PI * R;
            let offset = 0, arcs = '';
            segments.forEach(seg => {
                const frac = seg.value / total;
                const len = frac * circ;
                arcs += '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="none" stroke="' + seg.color +
                    '" stroke-width="' + sw + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (circ - len).toFixed(2) +
                    '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 ' + C + ' ' + C + ')" stroke-linecap="butt"/>';
                offset += len;
            });
            return '<svg viewBox="0 0 120 120" style="width:120px;height:120px;flex-shrink:0;">' + arcs +
                '<text x="60" y="56" text-anchor="middle" class="gs-donut-num">' + total + '</text>' +
                '<text x="60" y="72" text-anchor="middle" class="gs-donut-lbl">סטים</text>' +
                '</svg>';
        },

        // ───────────────────────────── מסך סטטיסטיקה ─────────────────────────────

        openStats: function () {
            this.haptic(5);
            this.renderStats();
            this.nav('screen-stats');
            this._celebrateNewBadges();
        },

        renderStats: function () {
            const host = document.getElementById('stats-content');
            if (!host) return;
            const s = this.computeInsights();

            if (s.count === 0) {
                host.innerHTML = '<div class="stats-empty">' +
                    '<div class="stats-empty-icon">📊</div>' +
                    '<h3>ההתקדמות שלך תופיע כאן</h3>' +
                    '<p>השלימי את האימון הראשון כדי להתחיל לראות גרפים, שיאים ותגים.</p>' +
                    '</div>';
                return;
            }

            const fmtVol = v => v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, '') + ' טון' : v + ' ק״ג';

            // קטעי דונאט
            const segs = Object.keys(s.perCat)
                .map(c => ({ label: (CATS[c] || CATS.other).l, value: s.perCat[c], color: (CATS[c] || CATS.other).c }))
                .sort((a, b) => b.value - a.value);
            const legend = segs.map(seg =>
                '<div class="donut-leg"><span class="leg-dot" style="background:' + seg.color + '"></span>' +
                '<span class="leg-lbl">' + this._esc(seg.label) + '</span><span class="leg-val">' + seg.value + '</span></div>'
            ).join('');

            // badges
            const badgeCells = BADGES.map(b => {
                const earned = b.test(s);
                return '<div class="badge-cell' + (earned ? ' earned' : ' locked') + '">' +
                    '<div class="badge-ic">' + b.icon + '</div>' +
                    '<div class="badge-tt">' + this._esc(b.t) + '</div>' +
                    '<div class="badge-dd">' + this._esc(b.d) + '</div>' +
                    '</div>';
            }).join('');

            // שיאים
            const prRows = s.prList.length ? s.prList.map(pr => {
                const unitLbl = pr.unit === 'time' ? 'שנ׳' : (pr.unit === 'bodyweight' ? 'חזר׳' : (pr.unit === 'plates' ? 'פלטות' : 'ק״ג'));
                return '<div class="pr-row"><span class="pr-name">' + this._esc(pr.name) + '</span>' +
                    '<span class="pr-val">' + pr.best + ' <small>' + unitLbl + '</small></span></div>';
            }).join('') : '<div class="chart-empty">אין עדיין שיאים</div>';

            const volSeries = s.volumeSeries.slice(-12);

            host.innerHTML =
                // Hero: level + XP
                '<div class="oled-card stats-hero">' +
                    '<div class="level-ring"><span class="level-num">' + s.level + '</span><span class="level-lbl">רמה</span></div>' +
                    '<div class="level-side">' +
                        '<div class="level-title">' + s.badgeCount + ' תגים · ' + s.xp + ' XP</div>' +
                        '<div class="xp-track"><div class="xp-fill" style="width:' + Math.round(s.xpInLevel / s.xpForLevel * 100) + '%"></div></div>' +
                        '<div class="xp-sub">' + (s.xpForLevel - s.xpInLevel) + ' XP לרמה ' + (s.level + 1) + '</div>' +
                    '</div>' +
                '</div>' +

                // Quick quad
                '<div class="stat-quad">' +
                    '<div class="oled-card quad-cell"><div class="quad-val">' + s.count + '</div><div class="quad-lbl">אימונים</div></div>' +
                    '<div class="oled-card quad-cell"><div class="quad-val">' + fmtVol(s.totalVolume) + '</div><div class="quad-lbl">נפח מצטבר</div></div>' +
                    '<div class="oled-card quad-cell"><div class="quad-val">' + s.totalSets + '</div><div class="quad-lbl">סטים</div></div>' +
                    '<div class="oled-card quad-cell"><div class="quad-val">' + s.distinctExercises + '</div><div class="quad-lbl">תרגילים</div></div>' +
                '</div>' +

                // Volume trend
                '<div class="oled-card chart-card"><div class="chart-title">מגמת נפח אימון</div>' + this.chartLine(volSeries) + '</div>' +

                // Weekly frequency
                '<div class="oled-card chart-card"><div class="chart-title">תדירות שבועית (8 שבועות)</div>' + this.chartBars(s.weeklySeries, s.weeklyLabels) + '</div>' +

                // Muscle distribution
                '<div class="oled-card chart-card"><div class="chart-title">איזון קבוצות שריר</div>' +
                    '<div class="donut-wrap">' + this.chartDonut(segs) + '<div class="donut-legend">' + legend + '</div></div>' +
                '</div>' +

                // PRs
                '<div class="oled-card chart-card"><div class="chart-title">שיאים אישיים 🏆</div><div class="pr-list">' + prRows + '</div></div>' +

                // Badges
                '<div class="chart-title badges-head">תגי הישג</div><div class="badge-grid">' + badgeCells + '</div>';
        },

        // חגיגת badges חדשים — toast + confetti פעם אחת, וסימון כ"נראה"
        _celebrateNewBadges: function () {
            const s = this.computeInsights();
            const earned = BADGES.filter(b => b.test(s)).map(b => b.id);
            let seen = [];
            try { seen = JSON.parse(localStorage.getItem(this._seenKey()) || '[]'); } catch (e) {}
            const fresh = earned.filter(id => !seen.includes(id));
            if (fresh.length && seen.length >= 0) {
                // לא לחגוג בפעם הראשונה בכלל (כשאין כלום שמור) רק אם יש היסטוריה אמיתית
                const justUnlocked = BADGES.filter(b => fresh.includes(b.id));
                if (justUnlocked.length) {
                    const b = justUnlocked[justUnlocked.length - 1];
                    if (typeof this.toast === 'function') this.toast(b.icon + ' תג חדש: ' + b.t, 'success');
                    if (typeof this.fireConfetti === 'function') this.fireConfetti();
                    if (typeof this.haptic === 'function') this.haptic([18, 60, 30]);
                }
            }
            const prevStr = localStorage.getItem(this._seenKey()) || '[]';
            const newStr = JSON.stringify(earned);
            try { localStorage.setItem(this._seenKey(), newStr); } catch (e) {}
            // הדגלים השתנו — דחיפה שקטה לענן כדי שישוחזרו במכשיר אחר
            if (newStr !== prevStr && typeof this._schedulePrefsSync === 'function') this._schedulePrefsSync();
        },

        // ───────────────────────────── כרטיס תובנות בבית ─────────────────────────────

        renderHomeInsights: function () {
            const card = document.getElementById('home-insights-card');
            if (!card) return;
            const s = this.computeInsights();
            const lv = document.getElementById('hi-level');
            const xp = document.getElementById('hi-xp-fill');
            const badges = document.getElementById('hi-badges');
            const sub = document.getElementById('hi-sub');
            if (lv) lv.textContent = s.level;
            if (xp) xp.style.width = Math.round(s.xpInLevel / s.xpForLevel * 100) + '%';
            if (badges) badges.textContent = s.badgeCount;
            if (sub) sub.textContent = s.count > 0 ? (s.xpForLevel - s.xpInLevel) + ' XP לרמה הבאה' : 'התחילי כדי לצבור XP';
        }
    });

    // ── עטיפת updateChrome: הדגשת טאב הסטטיסטיקה ──
    if (typeof app.updateChrome === 'function') {
        const _origUpdateChrome = app.updateChrome.bind(app);
        app.updateChrome = function (screenId) {
            _origUpdateChrome(screenId);
            const tab = document.getElementById('tab-stats');
            if (tab) tab.classList.toggle('active', screenId === 'screen-stats');
        };
    }

    // ── עטיפת renderHome: עדכון כרטיס התובנות בכל רינדור של הבית ──
    if (typeof app.renderHome === 'function') {
        const _origRenderHome = app.renderHome.bind(app);
        app.renderHome = function () {
            _origRenderHome();
            try { app.renderHomeInsights(); } catch (e) {}
        };
    }

    // ───────────────────────────── חוויית אימון חי — אפקטים ─────────────────────────────
    // תוספות ויזואליות בלבד; קוראות state וכותבות לאלמנטים חדשים. אינן נוגעות ב-state-machine.
    Object.assign(app, {

        // נקרא רק כשסט נרשם בפועל — בודק אם הסט האחרון הוא שיא אישי חדש
        _afterSetLogged: function () {
            try {
                const a = this.state.active;
                const exInst = a.sessionExercises[a.exIdx];
                if (!exInst) return;
                const exLog = a.log.find(l => l.id === exInst.id);
                if (!exLog || !exLog.sets.length) return;
                const def = this.getExerciseDef(exInst.id);
                const unit = (def.settings && def.settings.unit) || 'kg';
                const repBased = unit === 'time' || unit === 'bodyweight';
                const metricOf = set => repBased ? (Number(set.r) || 0) : (Number(set.w) || 0);

                const lastSet = exLog.sets[exLog.sets.length - 1];
                const metric = metricOf(lastSet);
                if (metric <= 0) return;

                // שיא היסטורי (אימונים קודמים)
                let histBest = 0;
                this.state.history.forEach(h => {
                    const f = (h.data || []).find(e => e.id === exInst.id);
                    if (f) (f.sets || []).forEach(s => { const m = metricOf(s); if (m > histBest) histBest = m; });
                });
                // שיא בתוך הסשן הנוכחי (סטים קודמים בלבד)
                let sessBest = 0;
                for (let i = 0; i < exLog.sets.length - 1; i++) { const m = metricOf(exLog.sets[i]); if (m > sessBest) sessBest = m; }

                // חוגגים רק שיא אמיתי שעובר את כל מה שהיה — ולא בפעם הראשונה אי-פעם בתרגיל
                if (histBest > 0 && metric > Math.max(histBest, sessBest)) {
                    const unitLbl = repBased ? 'חזרות' : (unit === 'plates' ? 'פלטות' : 'ק״ג');
                    this._flashPR(metric + ' ' + unitLbl);
                }
            } catch (e) {}
        },

        _flashPR: function (text) {
            let pill = document.getElementById('pr-flash');
            if (!pill) {
                const top = document.querySelector('#screen-active .active-top');
                if (!top) return;
                pill = document.createElement('div');
                pill.id = 'pr-flash';
                pill.className = 'pr-flash';
                top.appendChild(pill);
            }
            pill.innerHTML = '⭐ שיא חדש! ' + this._esc(text);
            pill.classList.remove('show'); void pill.offsetWidth; pill.classList.add('show');
            if (typeof this.haptic === 'function') this.haptic([20, 40, 20]);
            if (typeof this.fireConfetti === 'function') this.fireConfetti();
            clearTimeout(this._prTimer);
            this._prTimer = setTimeout(() => { if (pill) pill.classList.remove('show'); }, 2600);
        }
    });

    // ── עטיפת finishSet: חגיגת שיא אישי כשסט נרשם (אחרי הריצה המקורית) ──
    if (typeof app.finishSet === 'function') {
        const _origFinishSet = app.finishSet.bind(app);
        const countSets = () => (app.state.active.log || []).reduce((n, l) => n + l.sets.length, 0);
        app.finishSet = function () {
            const before = countSets();
            _origFinishSet();
            if (countSets() > before) app._afterSetLogged();
        };
    }

    // ── עטיפת loadActiveExercise: אנימציית כניסה לשם התרגיל ──
    if (typeof app.loadActiveExercise === 'function') {
        const _origLoad = app.loadActiveExercise.bind(app);
        app.loadActiveExercise = function () {
            _origLoad();
            const n = document.getElementById('ex-name');
            if (n) { n.classList.remove('ex-enter'); void n.offsetWidth; n.classList.add('ex-enter'); }
            const pr = document.getElementById('pr-flash');
            if (pr) pr.classList.remove('show');
        };
    }
})();
