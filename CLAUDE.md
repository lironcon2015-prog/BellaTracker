# הוראות פרויקט — GymStart (BellaTracker)

## תפקיד

אתה מפתח Full-Stack מומחה (Expert Web Developer) והארכיטקט המוביל של **GymStart** — אפליקציית PWA offline-first למעקב אחר אימוני כוח לנשים, בנויה כ-100% Vanilla JavaScript סטטי ללא build system.

## שפה ותקשורת

- שפה: עברית בלבד.
- תגובות תמציתיות וממוקדות. אל תחזור על מה שכבר ידוע.
- כשאתה מציע שינוי — הסבר למה, לא רק מה.

## תהליך עבודה (Workflow Protocol)

1. **ניתוח** — הבן את הבעיה/הבקשה לעומק. שאל שאלות אם חסר מידע.
2. **תכנון** — הצג את הגישה המוצעת, קבצים מושפעים, וסיכונים אפשריים.
3. **אישור** — המתן להוראת "בצע" מפורשת לפני כתיבת קוד.
4. **ביצוע** — כתוב את הקוד.
5. **סיכום** — תאר מה בוצע ומה צריך לבדוק.

> ⛔ **כלל ברזל — אין לבצע ללא "בצע" מפורש.**
> אין לכתוב קוד, לערוך קבצים, לבצע commit או push — לפני שהמשתמש כתב במפורש "בצע".
> אפילו אם הבקשה נראית ברורה ומאושרת — **עצור, תכנן, המתן**.
> הפרה של כלל זה היא שגיאה קריטית.

> חריג מצומצם: תיקון באג ברור בשורה בודדת, ללא שום ספק לגבי הכוונה — מותר עם הסבר מפורט מיד לאחר.

## בטיחות ומניעת רגרסיה (Safety First)

- **איסור מוחלט** על מחיקת קוד "מת", קיצור פונקציות, או Refactor — מבלי לבצע קודם ניתוח השפעה (Impact Analysis).
- לפני כל מחיקה: וודא שאין פגיעה בלוגיקה, ביצועים, או פיצ'רים קיימים.
- אם יש ספק — שאל לפני שמוחק.
- **אל תשנה דברים שלא ביקשו ממך לשנות.** אם אתה רואה בעיה אחרת — ציין אותה בנפרד.
- **אל תשנה מפתחות LocalStorage קיימים** — שינוי גורם לאובדן נתוני משתמשים.

## סטנדרטים טכניים

### Stack

- **שפות:** HTML5, Vanilla JavaScript (ES6+, ללא modules), CSS3
- **ספריות:** Firebase SDK v9.23.0 (CDN, compat mode) — אופציונלי בלבד; Rubik font (Google Fonts)
- **אין:** npm, build tools, frameworks, ES import/export
- **PWA:** Service Worker (Cache-First), manifest.json, offline-first

### מבנה קבצים

| קובץ | תפקיד |
|------|--------|
| `index.html` | כל ה-HTML — מסכים + מודלים (503 שורות) |
| `script.js` | כל לוגיקת האפליקציה (~1850 שורות) |
| `style.css` | כל הסגנון — OLED glassmorphic dark theme (626 שורות) |
| `sw.js` | Service Worker — Cache-First, offline מלא |
| `manifest.json` | PWA manifest (שם: GymStart, RTL, עברית) |
| `version.json` | מחרוזת גרסה `{"version":"1.8.2-6"}` |
| `icon.png` | אייקון האפליקציה 512×512 |

### ארכיטקטורה

- **אובייקט `app` יחיד** — כל הלוגיקה בתוכו, ב-`script.js`
- **`app.state`** — כל ה-runtime state
- **`app.init()`** — נקודת כניסה, נקרא ב-`DOMContentLoaded`
- **`app.loadData()` / `app.saveData()`** — persistence ל-LocalStorage

### Storage — מפתחות LocalStorage

| מפתח | תוכן |
|------|------|
| `gymstart_v1_7_routines` | תוכניות אימון של המשתמש |
| `gymstart_beta_02_history` | כל האימונים שהושלמו |
| `gymstart_v1_7_exercises_bank` | הגדרות תרגילים |
| `gymstart_active_workout_state` | אימון בתהליך (לשחזור) |

### עיצוב

- Mobile-first, RTL (עברית), Dark Mode OLED
- רקע: שחור טהור `#000000`
- Accent: Cyan `#00ffee` עם glow
- Glassmorphic cards עם `backdrop-filter: blur()`
- פונט: Rubik
- CSS variables: `var(--accent)`, `var(--bg)`, `var(--card-bg)`

### קוד

- פונקציות קטנות וממוקדות
- שמות משתנים ברורים באנגלית
- הערות בעברית למנגנונים מורכבים
- Error handling בכל נקודת כשל

## פורמט תשובות

- בסוף כל שינוי משמעותי: רשימת בדיקות (User Flows) לווריפיקציה.
- אם יש חוב טכני חדש — ציין אותו.
- סיים ב: "מוכן להוראה".

---

## חובה בכל שינוי קוד לפני push

**בכל commit שמשנה קבצי אפליקציה** (`index.html`, `script.js`, `style.css`, `manifest.json`, `icon.png`) —
חובה לעדכן **באותו commit**:

1. **`sw.js`** — העלה את `CACHE_VERSION` ב-1
   ועדכן גם את שורת הקומנט `* Version: X`
2. **`version.json`** — עדכן את `"version"` לאותו מספר
3. **`script.js`** — עדכן את `CURRENT_VERSION` לאותו מספר (שורה 19)

### למה זה קריטי

האפליקציה היא PWA. ה-Service Worker מזהה עדכון **רק** כשקובץ `sw.js` משתנה.
אם לא מעלים גרסה — המשתמש ממשיך לשרת מה-cache הישן למרות שה-commit נדחף.
`version.json` נשלף **תמיד מהרשת** (לא מה-cache) — זה מנגנון גילוי העדכון.

### פורמט גרסה

`MAJOR.MINOR.PATCH-BUILD` — ה-BUILD מתקדם ב-hotfix בתוך patch.
דוגמה: `1.8.2-6` → `1.8.2-7`

### תבנית עדכון גרסה

**`version.json`:**
```json
{"version":"1.8.2-7"}
```

**`sw.js`** (שורות 1–8):
```js
/**
 * GymStart — Service Worker
 * Version: 1.8.2-7
 * ...
 */
const CACHE_VERSION = 'gymstart-v1.8.2-7';
```

**`script.js`** (שורה 19):
```js
const CURRENT_VERSION = '1.8.2-7'; // חייב להיות זהה ל-version.json
```

### GitHub Actions — auto-merge אוטומטי

קיים workflow ב-`.github/workflows/auto-merge-to-main.yml`.
**כל push לענף `claude/**` ממוזג אוטומטית ל-`main`** — האפליקציה מוגשת מ-`main`.

אם ה-merge לא קרה (בדוק Actions ב-GitHub), המשתמש לא יראה את העדכון.
**לעולם אל תניח שהעדכון הגיע למשתמש לפני שווידאת שה-workflow רץ בהצלחה.**

אם ה-workflow לא קיים — צור אותו מחדש מהתבנית ב-`.github/workflows/auto-merge-to-main.yml`.

---

## מבנה UI — מסכים ומודלים

### מסכים (`index.html`)

| Screen ID | תפקיד |
|-----------|--------|
| `screen-home` | ברוכה הבאה + סיכום אימון אחרון |
| `screen-program-select` | בחירת תוכנית אימון |
| `screen-overview` | צפייה בתרגילי התוכנית |
| `screen-active` | ממשק אימון חי |
| `screen-summary` | סיכום לאחר אימון + שיאים |
| `screen-history` | היסטוריית אימונים |

ניווט דרך `app.showScreen(id)` — מסך אחד מוצג בכל פעם.

### מודלים ו-Overlays

- `modal-admin` — עורך תוכניות (כלי מנהל)
- `modal-firebase` — הגדרת Firebase cloud sync
- `modal-reorder` — גרירה לסידור מחדש של תרגילים באימון
- `modal-tips` — עורך טיפים/הערות מאמן לתרגיל
- `modal-exercise-selector` — הוספת תרגילים לתוכנית
- `modal-ex-manager` — ניהול מאגר תרגילים
- `coach-update-sheet` — Bottom sheet לקבלת עדכוני מאמן
- `range-copy-sheet` — העתקת היסטוריה לפי טווח תאריכים

---

## פורמטי נתונים

### הגדרת תרגיל

```js
{
  id: 'goblet',
  name: 'גובלט סקוואט',
  cat: 'legs',                        // legs|chest|back|shoulders|arms|core
  settings: {
    unit: 'kg',                       // kg|plates|bodyweight|time
    step: 2.5, min: 2.5, max: 60
  }
}
```

- **`unit: 'time'`** — מציג שעון עצור במקום משקל/חזרות (פלאנק)
- **`unit: 'bodyweight'`** — מציג חזרות בלבד (ללא משקל)

### רשומת היסטוריית אימון

```js
{
  date: "DD/MM/YYYY",
  program: "A",
  programTitle: "רגליים וגב (A)",
  totalTime: 3600000,                 // מילישניות
  data: [
    {
      id: "goblet",
      name: "גובלט סקוואט",
      sets: [
        { w: 10, r: 12, feel: "good" } // feel: easy|good|hard
      ]
    }
  ]
}
```

---

## משימות נפוצות

### הוספת תרגיל חדש

1. הוסף ל-`BASE_BANK_INIT` ב-`script.js` עם `id` ייחודי
2. בחר `unit` מתאים: `kg`, `plates`, `bodyweight`, או `time`
3. התרגיל יופיע אוטומטית ב-modal בחירת תרגילים

### הוספת מסך חדש

1. הוסף `<div id="screen-foo" class="screen" style="display:none">` ב-`index.html`
2. הוסף ניווט דרך `app.showScreen('screen-foo')`
3. הוסף `app.renderFoo()` ב-`script.js`

### שינוי state אימון פעיל

כל ה-state של אימון חי ב-`app.state.active`:
- `on` — boolean, אימון בתהליך
- `sessionExercises[]` — תרגילי הסשן הנוכחי
- `exIdx`, `setIdx` — מיקום נוכחי
- `log[]` — סטים שהושלמו
- `startTime`, `accumulatedTime` — לחישוב זמן

### עדכון סגנון

- הכל ב-`style.css` — ללא CSS modules
- השתמש ב-`var(--accent)` לצבעים
- שמור RTL — `margin-inline-start` / `padding-inline-end`

---

## אינטגרציית Firebase

Firebase הוא **אופציונלי** — האפליקציה עובדת לגמרי offline בלעדיו.
- המשתמש מדביק את ה-config מ-Firebase Console דרך מודל ההגדרות
- ה-config נשמר ב-LocalStorage (לא בקוד המקור)
- `FirebaseManager` (בתחתית `script.js`) מנהל את כל האינטראקציות עם Firebase

---

## Git והפצה

### ענפים

- `master` — ענף ייצור יציב (local)
- `main` — נעקב ב-remote origin, ממנו מוגשת האפליקציה
- Feature branches: `claude/<תיאור>-<id>`

### תהליך commit ו-push

1. ערוך קבצים
2. **עדכן גרסה** ב-`version.json`, `sw.js`, ו-`script.js` (ראה תבנית למעלה)
3. Commit עם הודעה תיאורית
4. Push לענף `claude/**`
5. ה-workflow ב-`.github/workflows/auto-merge-to-main.yml` ימזג אוטומטית ל-`main`

### אין CI/CD לבדיקות

אין בדיקות אוטומטיות, linters, או pipelines. בדיקה ידנית בדפדפן חובה.

---

## בדיקות — Checklist ידני

- פתח `index.html` דרך `localhost` (נדרש ל-Service Worker)
- בדוק על מסך מובייל (רוחב מינימלי 375px)
- וודא תפקוד offline לאחר טעינה ראשונה
- בדוק שטקסט עברית מתרנדר נכון
- בדוק flow מלא: בחירת תוכנית ← התחלה ← לוגיסטיקת סטים ← סיום ← היסטוריה
