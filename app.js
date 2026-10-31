'use strict';
/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : NaN; };
const fmt = (n, d = 0) => (isFinite(n) ? n : 0).toLocaleString('en-US', {maximumFractionDigits: d, minimumFractionDigits: 0});
const sum = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);
const avg = arr => arr.length ? sum(arr, x => x) / arr.length : NaN;
const iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => iso(new Date());
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const weekStart = s => addDays(s, -((parseD(s).getDay() + 6) % 7));
const fmtD = (s, o = {month: 'short', day: 'numeric'}) => parseD(s).toLocaleDateString('en-US', o);
const fmtLong = s => fmtD(s, {month: 'short', day: 'numeric', year: 'numeric'});
const e1rm = (kg, reps) => reps <= 1 ? kg : kg * (1 + reps / 30); // Epley
const fmtKg = v => v >= 10000 ? fmt(v / 1000, 1) + ' t' : fmt(v) + ' kg';
const fmtSleep = h => { const m = Math.round(h * 60); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`; };
const signed = (v, d = 1) => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v), d);
const fmtPace = minPerKm => `${Math.floor(minPerKm)}:${String(Math.round((minPerKm % 1) * 60)).padStart(2, '0')} /km`;

const ICON = {
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M8 15h3"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  lib: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  rank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21V10h8v11M2 21v-7h6M16 21v-5h6M2 21h20M12 3l1 2 2 .3-1.5 1.4.4 2.1L12 7.8l-1.9 1 .4-2.1L9 5.3l2-.3z"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
};

/* ---------- built-in library ---------- */
// "Name|flags": bw = bodyweight (kg field means added weight), sec = reps are seconds
const S_GROUPS = {
  Chest: ['Barbell Bench Press','Incline Barbell Bench Press','Decline Barbell Bench Press','Dumbbell Bench Press','Incline Dumbbell Press','Dumbbell Fly','Cable Crossover','Pec Deck (Machine Fly)','Chest Press Machine','Smith Machine Bench Press','Push-up|bw','Chest Dip|bw'],
  Back: ['Deadlift','Pull-up|bw','Chin-up|bw','Assisted Pull-up Machine','Lat Pulldown','Close-Grip Lat Pulldown','Seated Cable Row','Barbell Row','Dumbbell Row','T-Bar Row','Machine Row','Straight-Arm Pulldown','Rack Pull','Back Extension|bw'],
  Shoulders: ['Overhead Press (Barbell)','Seated Dumbbell Press','Arnold Press','Shoulder Press Machine','Lateral Raise','Cable Lateral Raise','Front Raise','Rear Delt Fly','Reverse Pec Deck','Face Pull','Upright Row','Barbell Shrug','Dumbbell Shrug'],
  Biceps: ['Barbell Curl','EZ-Bar Curl','Dumbbell Curl','Hammer Curl','Incline Dumbbell Curl','Preacher Curl','Cable Curl','Concentration Curl','Biceps Curl Machine'],
  Triceps: ['Triceps Pushdown (Rope)','Triceps Pushdown (Bar)','Overhead Triceps Extension','Skull Crusher','Close-Grip Bench Press','Triceps Dip|bw','Bench Dip|bw','Triceps Kickback','Triceps Extension Machine'],
  Legs: ['Back Squat','Front Squat','Goblet Squat','Smith Machine Squat','Leg Press','Hack Squat','Bulgarian Split Squat','Walking Lunge','Reverse Lunge','Step-up','Leg Extension','Lying Leg Curl','Seated Leg Curl','Romanian Deadlift','Stiff-Leg Deadlift','Hip Thrust','Glute Bridge','Cable Glute Kickback','Hip Abduction Machine','Hip Adduction Machine','Standing Calf Raise','Seated Calf Raise'],
  Core: ['Plank|bw,sec','Side Plank|bw,sec','Crunch|bw','Cable Crunch','Ab Crunch Machine','Hanging Leg Raise|bw','Lying Leg Raise|bw','Russian Twist','Ab Wheel Rollout|bw','Decline Sit-up|bw','Mountain Climber|bw','Dead Bug|bw'],
  'Full body': ['Kettlebell Swing','Clean and Press','Power Clean','Thruster','Farmer\'s Walk','Burpee|bw','Sled Push','Battle Ropes|bw,sec'],
};
// [name, MET] — values from the Compendium of Physical Activities (approximate)
const C_GROUPS = {
  Treadmill: [['Treadmill – walk (5 km/h)',3.5],['Treadmill – brisk walk (6.4 km/h)',5.0],['Treadmill – incline walk (1–5%)',5.3],['Treadmill – steep incline walk (6–15%)',8.0],['Treadmill – jog (8 km/h)',8.3],['Treadmill – run (10 km/h)',9.8],['Treadmill – run (12 km/h)',11.8]],
  Elliptical: [['Elliptical – light',4.0],['Elliptical – moderate',5.0],['Elliptical – vigorous',7.0]],
  'Gym machines': [['Stationary bike – light',3.5],['Stationary bike – moderate',6.8],['Stationary bike – vigorous',8.8],['Spinning class',8.5],['Rowing machine – moderate',7.0],['Rowing machine – vigorous',8.5],['Stair climber',9.0]],
  Dance: [['Latin salsa dancing – social',4.5],['Latin salsa dancing – fast / class',6.5],['Bachata / merengue dancing',4.5],['Zumba',6.5],['Ballroom dancing – slow',3.0]],
  Outdoor: [['Walking',3.5],['Hiking',6.0],['Running (10 km/h)',9.8],['Cycling – moderate',8.0],['Swimming – moderate',5.8],['Swimming – vigorous',9.8]],
  'Classes & sports': [['HIIT / circuit training',8.0],['Aerobics class',7.3],['Jump rope',11.8],['Boxing – heavy bag',5.5],['Yoga',2.5],['Pilates',3.0],['Tennis',7.3],['Padel',6.0],['Soccer',7.0],['Basketball',6.5]],
};
const LIB = [];
for (const [g, arr] of Object.entries(S_GROUPS)) for (const it of arr) {
  const [name, flags = ''] = it.split('|');
  LIB.push({id: 's-' + slug(name), name, kind: 's', group: g, bw: flags.includes('bw'), sec: flags.includes('sec')});
}
for (const [g, arr] of Object.entries(C_GROUPS)) for (const [name, met] of arr) LIB.push({id: 'c-' + slug(name), name, kind: 'c', group: g, met});
const LIB_MAP = Object.fromEntries(LIB.map(e => [e.id, e]));

/* ---------- storage ---------- */
// days[date] = {kg, bf, sleep, eat}: body weight, body fat %, hours slept the night before, kcal eaten
const STORE = 'fittrack.v1';
const blank = () => ({v: 2, settings: {defaultKg: 75, lastBackup: null, sex: '', birthYear: null, heightCm: null, activity: 1.2}, goals: {}, days: {}, cardio: [], lifts: [], custom: [], templates: []});
// Everything read from storage or a backup file passes through normalize(): unknown fields are dropped,
// ids and dates must match strict patterns and numbers must be in range, so a crafted file can't inject markup.
const RE_DATE = /^\d{4}-\d\d-\d\d$/, RE_ID = /^[a-z0-9-]{1,64}$/i, RE_EX = /^[sc]-[a-z0-9-]{1,80}$/;
const isDate = s => typeof s === 'string' && RE_DATE.test(s) && !isNaN(parseD(s));
const isId = s => typeof s === 'string' && RE_ID.test(s);
const isEx = s => typeof s === 'string' && RE_EX.test(s);
const inRange = (v, lo, hi) => typeof v === 'number' && isFinite(v) && v >= lo && v <= hi;
const optNum = (v, lo, hi) => inRange(v, lo, hi) ? v : undefined;
const str = (v, max = 80) => typeof v === 'string' ? v.slice(0, max) : '';
const list = (a, f, max = 100000) => Array.isArray(a) ? a.slice(0, max).map(x => x && typeof x === 'object' || typeof x === 'string' ? f(x) : null).filter(Boolean) : [];
const SHARE_KEYS = ['lift', 'kg', 'bf', 'out', 'in'];   // what may be shared with the team; all off by default
const DAY_LIMITS = {kg: [20, 400], bf: [2, 70], sleep: [0, 24], eat: [0, 15000]};
const GOAL_LIMITS = {kg: [20, 400], kgStart: [20, 400], bf: [2, 70], bfStart: [2, 70], sleep: [3, 14], eat: [500, 10000], volume: [1, 1e7], cardio: [1, 1e5]};
function normalize(d) {
  const b = blank(), days = {}, goals = {};
  const src = d.days && typeof d.days === 'object' ? d.days : {};
  for (const k of Object.keys(src)) {
    if (!isDate(k) || !src[k] || typeof src[k] !== 'object') continue;
    const o = {};
    for (const [f, [lo, hi]] of Object.entries(DAY_LIMITS)) if (inRange(src[k][f], lo, hi)) o[f] = src[k][f];
    if (Object.keys(o).length) days[k] = o;
  }
  if (d.weights && typeof d.weights === 'object') for (const k of Object.keys(d.weights)) if (isDate(k) && inRange(d.weights[k], 20, 400)) {
    days[k] = days[k] || {}; if (days[k].kg == null) days[k].kg = d.weights[k];
  }
  const s = d.settings && typeof d.settings === 'object' ? d.settings : {};
  const g = d.goals && typeof d.goals === 'object' ? d.goals : {};
  for (const [k, [lo, hi]] of Object.entries(GOAL_LIMITS)) if (inRange(g[k], lo, hi)) goals[k] = g[k];
  if (g.cardioUnit === 'min' || g.cardioUnit === 'kcal') goals.cardioUnit = g.cardioUnit;
  return {
    v: 2,
    settings: {
      defaultKg: optNum(s.defaultKg, 20, 400) ?? b.settings.defaultKg,
      lastBackup: typeof s.lastBackup === 'string' && isDate(s.lastBackup.slice(0, 10)) ? s.lastBackup.slice(0, 30) : null,
      sex: s.sex === 'm' || s.sex === 'f' ? s.sex : '',
      birthYear: optNum(s.birthYear, 1900, 2100) ?? null,
      heightCm: optNum(s.heightCm, 100, 250) ?? null,
      activity: [1.2, 1.375, 1.55, 1.725].includes(s.activity) ? s.activity : 1.2,
      share: Object.fromEntries(SHARE_KEYS.map(k => [k, !!(s.share && s.share[k] === true)])),
    },
    goals,
    days,
    cardio: list(d.cardio, c => isId(c.id) && isDate(c.date) && isEx(c.act) && inRange(c.min, 0.1, 1440) && inRange(c.kcal, 0, 20000) && {
      id: c.id, date: c.date, act: c.act, min: c.min, kcal: c.kcal, met: optNum(c.met, 0.5, 25) ?? 5, auto: c.auto !== false,
      ...(inRange(c.dist, 0.01, 1000) ? {dist: c.dist} : {}), ...(inRange(c.hr, 30, 250) ? {hr: c.hr} : {})}),
    lifts: list(d.lifts, l => isId(l.id) && isDate(l.date) && isEx(l.ex) && {
      id: l.id, date: l.date, ex: l.ex, sets: list(l.sets, x => inRange(x.kg, 0, 2000) && inRange(x.reps, 0, 100000) && {kg: x.kg, reps: x.reps}, 200)}),
    custom: list(d.custom, e => isEx(e.id) && (e.kind === 's' || e.kind === 'c') && e.id[0] === e.kind && str(e.name) && {
      id: e.id, kind: e.kind, name: str(e.name), group: str(e.group, 40) || 'Other', custom: true,
      ...(e.kind === 's' ? {bw: e.bw === true} : {met: optNum(e.met, 0.5, 25) ?? 5}), ...(e.hidden === true ? {hidden: true} : {})}, 1000),
    templates: list(d.templates, t => isId(t.id) && str(t.name) && {id: t.id, name: str(t.name), ex: list(t.ex, x => isEx(x) && x, 100)}, 500),
  };
}

/* ---------- encryption (optional app lock and backup passwords) ---------- */
// AES-256-GCM with a key derived from the PIN/password by PBKDF2-SHA256.
const KDF_ITER = 310000;
const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const cryptoOk = () => !!(window.crypto && crypto.subtle);
async function deriveKey(pass, salt, iter = KDF_ITER) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name: 'PBKDF2', salt, iterations: inRange(iter, 1e5, 5e6) ? iter : KDF_ITER, hash: 'SHA-256'},
    base, {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']);
}
async function seal(key, salt, text, extra = {}) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, new TextEncoder().encode(text));
  return {...extra, enc: 1, alg: 'AES-256-GCM/PBKDF2-SHA256', iter: KDF_ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct)};
}
async function unseal(key, box) {
  return new TextDecoder().decode(await crypto.subtle.decrypt({name: 'AES-GCM', iv: unb64(box.iv)}, key, unb64(box.ct)));
}
const isSealed = d => !!d && d.enc === 1 && typeof d.salt === 'string' && typeof d.iv === 'string' && typeof d.ct === 'string';

let lockBox = null;   // encrypted store waiting for the PIN
let appLock = null;   // {key, salt, pin} while unlocked with app lock on
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE));
    if (isSealed(d)) { lockBox = d; return blank(); }
    if (d && typeof d === 'object') return normalize(d);
  } catch (e) {}
  return blank();
}
let db = load();
let askedPersist = false, writeChain = Promise.resolve();
function write(text) {
  try { localStorage.setItem(STORE, text); } catch (e) { toast('Could not save — storage may be full'); }
}
// Writes are queued so an encrypted write can never land after a newer one.
function save() {
  if (lockBox) return; // never overwrite the encrypted store while locked
  const text = JSON.stringify(db), lk = appLock;
  writeChain = writeChain.then(async () => write(lk ? JSON.stringify(await seal(lk.key, lk.salt, text, {pin: lk.pin})) : text))
    .catch(() => toast('Could not save'));
  if (!askedPersist && navigator.storage && navigator.storage.persist) { askedPersist = true; navigator.storage.persist().catch(() => {}); }
  if (typeof scheduleSync === 'function') scheduleSync();
}

function showLock() {
  const el = $('#lock'), numeric = lockBox.pin === 'num';
  el.innerHTML = `<div class="lock-box"><div style="font-size:20px;font-weight:700">FitTrack is locked</div>
    <div class="small muted" style="margin-top:6px">Enter your ${numeric ? 'PIN' : 'passphrase'} to open your data.</div>
    <input id="pin" type="password" inputmode="${numeric ? 'numeric' : 'text'}" autocomplete="current-password" aria-label="PIN">
    <div class="err" id="pinErr"></div>
    <button class="btn primary block" id="unlockBtn">Unlock</button>
    <button class="btn block" style="margin-top:28px;background:none;color:var(--muted)" id="forgotBtn">Forgot it?</button></div>`;
  el.classList.add('open');
  const pin = $('#pin'), err = $('#pinErr');
  const go = async () => {
    if (!pin.value) return;
    err.textContent = 'Unlocking…';
    try {
      const salt = unb64(lockBox.salt), key = await deriveKey(pin.value, salt, lockBox.iter);
      const data = JSON.parse(await unseal(key, lockBox));
      appLock = {key, salt, pin: lockBox.pin}; lockBox = null; db = normalize(data);
      el.classList.remove('open'); el.innerHTML = ''; render();
      scheduleSync(1500);
    } catch (e) { err.textContent = 'Wrong PIN — try again'; pin.value = ''; pin.focus(); }
  };
  $('#unlockBtn').onclick = go;
  pin.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  $('#forgotBtn').onclick = () => {
    if (!confirm('Without the PIN your data cannot be decrypted. Erase everything on this phone and start over? You can then restore a backup.')) return;
    if (!confirm('Really erase all FitTrack data on this phone?')) return;
    localStorage.removeItem(STORE); location.reload();
  };
  setTimeout(() => pin.focus(), 50);
}

/* ---------- domain ---------- */
const exById = id => db.custom.find(e => e.id === id) || LIB_MAP[id] || {id, name: '(removed exercise)', kind: id.startsWith('c') ? 'c' : 's', group: 'Other', met: 5};
const pickable = kind => LIB.filter(e => e.kind === kind).concat(db.custom.filter(e => e.kind === kind && !e.hidden));
const keysOf = f => Object.keys(db.days).filter(k => db.days[k][f] != null).sort();
const valOf = (f, k) => db.days[k] ? db.days[k][f] : undefined;
function lastKey(f, date, inclusive) {
  let r = null;
  for (const k of keysOf(f)) { if (inclusive ? k <= date : k < date) r = k; else break; }
  return r;
}
function bodyKgOn(date) {
  const k = lastKey('kg', date, true) || keysOf('kg')[0];
  return k ? db.days[k].kg : (num(db.settings.defaultKg) || 75);
}
function ageOn(date) { const y = +db.settings.birthYear; return y > 1900 ? parseD(date).getFullYear() - y : null; }
const profileOk = () => !!(db.settings.sex && ageOn(today()) && +db.settings.heightCm);
// Mifflin-St Jeor resting metabolic rate
function bmr(date) {
  const s = db.settings, a = ageOn(date), h = +s.heightCm;
  if (!(s.sex && a && h)) return null;
  return 10 * bodyKgOn(date) + 6.25 * h - 5 * a + (s.sex === 'm' ? 5 : -161);
}
const kcalFor = (met, kg, min) => met * kg * min / 60;
// Keytel et al. 2005: energy expenditure from average heart rate
function hrKcal(hr, kg, age, sex, min) {
  const perMin = sex === 'm' ? (-55.0969 + 0.6309 * hr + 0.1988 * kg + 0.2017 * age) / 4.184
    : (-20.4022 + 0.4472 * hr - 0.1263 * kg + 0.074 * age) / 4.184;
  return Math.max(0, perMin * min);
}
function cardioEstimate(act, date, min, hr) {
  const kg = bodyKgOn(date), a = ageOn(date), sex = db.settings.sex;
  if (hr > 0 && a && sex) return {kcal: hrKcal(hr, kg, a, sex, min), how: `Heart-rate formula: ${fmt(hr)} bpm, ${fmt(kg, 1)} kg, age ${a}, ${fmt(min)} min`};
  return {kcal: kcalFor(act.met, kg, min), how: `MET ${fmt(act.met, 1)} × ${fmt(kg, 1)} kg × ${fmt(min)} min ÷ 60` + (hr > 0 ? '. Add sex and birth year in Settings to use your heart rate instead.' : '')};
}
// Lifting burn: ~3 min of moderate resistance work (MET 3.5) per set, rest included
const LIFT_MET = 3.5, LIFT_MIN_PER_SET = 3;
const liftKcal = (sets, kg) => sets * kcalFor(LIFT_MET, kg, LIFT_MIN_PER_SET);
const volumeOf = sets => sum(sets, s => s.kg * s.reps);
function lastSession(exId, before) {
  let best = null;
  for (const l of db.lifts) if (l.ex === exId && l.date < before && l.sets.length && (!best || l.date > best.date)) best = l;
  return best;
}
function recentIds(list, kind, n = 8) {
  const seen = new Map();
  for (const x of list) { const id = x.ex || x.act; if (exById(id).kind === kind && (!seen.has(id) || seen.get(id) < x.date)) seen.set(id, x.date); }
  return [...seen.entries()].sort((a, b) => b[1] < a[1] ? -1 : 1).map(e => e[0]).filter(id => !exById(id).hidden).slice(0, n);
}
function setLabel(ex, s) {
  const reps = ex.sec ? `${fmt(s.reps)} s` : `${fmt(s.reps)}`;
  if (ex.bw && !s.kg) return ex.sec ? reps : `BW × ${reps}`;
  return ex.sec ? `${fmt(s.kg, 2)} kg · ${reps}` : `${fmt(s.kg, 2)} kg × ${reps}`;
}
// least-squares slope (units per day) over [{x: date, y}]
function slopePerDay(pts) {
  if (pts.length < 3 || diffDays(pts[0].x, pts[pts.length - 1].x) < 10) return null;
  const xs = pts.map(p => diffDays(pts[0].x, p.x)), mx = avg(xs), my = avg(pts.map(p => p.y));
  const den = sum(xs, x => (x - mx) ** 2);
  return den ? pts.reduce((a, p, i) => a + (xs[i] - mx) * (p.y - my), 0) / den : null;
}

/* ---------- goals ---------- */
function goalRow(label, value, frac, color, note = '') {
  const pct = Math.max(0, Math.min(1, frac || 0));
  return `<div class="goal"><div class="row"><span class="gl grow">${label}${frac >= 1 ? ' <span style="color:var(--good)">✓</span>' : ''}</span><span class="gv">${value}</span></div>
    <div class="pbar"><i style="width:${(pct * 100).toFixed(1)}%;background:${color}"></i></div>${note ? `<div class="gn">${note}</div>` : ''}</div>`;
}
function bodyGoal(f, detail) {
  const g = db.goals, target = g[f];
  const unit = f === 'kg' ? 'kg' : '%', label = f === 'kg' ? 'Body weight' : 'Body fat', color = f === 'kg' ? 'var(--weight)' : 'var(--bf)';
  const ks = keysOf(f);
  if (!ks.length) return goalRow(label, `goal ${fmt(target, 1)} ${unit}`, 0, color, 'No entries yet.');
  const cur = db.days[ks[ks.length - 1]][f];
  const start = g[f + 'Start'] != null ? g[f + 'Start'] : db.days[ks[0]][f];
  const left = target - cur;
  const frac = start === target ? 1 : (start - cur) / (start - target);
  let note = Math.abs(left) < (f === 'kg' ? 0.05 : 0.05) ? 'Goal reached!' : `${signed(left, 1)} ${unit} to go · started at ${fmt(start, 1)} ${unit}`;
  if (detail && Math.abs(left) >= 0.05) {
    const pts = ks.filter(k => k >= addDays(today(), -42)).map(k => ({x: k, y: db.days[k][f]}));
    const s = slopePerDay(pts);
    if (s == null) note += ' · log a few more weeks for a projection';
    else if (Math.abs(s) < 0.002 || Math.sign(s) !== Math.sign(left)) note += ` · current trend (${signed(s * 7, 2)} ${unit}/week) isn't moving toward the goal`;
    else note += ` · on track for ~${fmtLong(addDays(today(), Math.round(left / s)))} at ${signed(s * 7, 2)} ${unit}/week`;
  }
  return goalRow(label, `<b>${fmt(cur, 1)}</b> → ${fmt(target, 1)} ${unit}`, frac, color, note);
}
function goalsHtml(date, detail) {
  const g = db.goals, ws = weekStart(date), we = addDays(ws, 6), inW = d => d >= ws && d <= we;
  const thisWeek = ws === weekStart(today());
  const wk = thisWeek ? 'this week' : `week of ${fmtD(ws)}`;
  let h = '';
  if (g.cardio > 0) {
    const cs = db.cardio.filter(c => inW(c.date)), kc = g.cardioUnit === 'kcal';
    const v = kc ? sum(cs, c => c.kcal) : sum(cs, c => c.min);
    h += goalRow(`Cardio ${wk}`, `<b>${fmt(v)}</b> / ${fmt(g.cardio)} ${kc ? 'kcal' : 'min'}`, v / g.cardio, 'var(--cardio)');
  }
  if (g.volume > 0) {
    const v = sum(db.lifts.filter(l => inW(l.date)), l => volumeOf(l.sets));
    h += goalRow(`Lifting volume ${wk}`, `<b>${fmtKg(v)}</b> / ${fmtKg(g.volume)}`, v / g.volume, 'var(--lift)');
  }
  if (g.sleep > 0) {
    const vals = keysOf('sleep').filter(inW).map(k => db.days[k].sleep), a = avg(vals);
    h += goalRow(`Sleep, average ${wk}`, vals.length ? `<b>${fmtSleep(a)}</b> / ${fmtSleep(g.sleep)}` : 'no nights logged', vals.length ? a / g.sleep : 0, 'var(--sleep)',
      vals.length ? `${vals.filter(v => v >= g.sleep).length} of ${vals.length} nights reached the goal` : '');
  }
  if (g.eat > 0) {
    const v = valOf('eat', date), over = v > g.eat * 1.05;
    h += goalRow(`Calories eaten ${date === today() ? 'today' : fmtD(date)}`, v != null ? `<b>${fmt(v)}</b> / ${fmt(g.eat)} kcal` : 'not logged', (v || 0) / g.eat,
      over ? 'var(--bad)' : 'var(--food)', v != null ? (over ? `${fmt(v - g.eat)} kcal over target` : `${fmt(g.eat - v)} kcal left`) : '');
  }
  if (g.kg > 0) h += bodyGoal('kg', detail);
  if (g.bf > 0) h += bodyGoal('bf', detail);
  return h;
}

/* ---------- UI state ---------- */
const S = {tab: 'log', date: today(), range: '3m', statsEx: null, metric: 'max', cardioAct: null, cardioMetric: 'min', libTab: 's', libQ: '',
  rkCat: 'ex', rkEx: null, rkMode: '1rm', rkEat: 'adh', rkPeriod: 'tw', joinCode: ''};

/* ---------- toast & sheet ---------- */
let toastT;
function toast(msg, gold) {
  const t = $('#toast'); t.textContent = msg; t.className = 'show' + (gold ? ' gold' : '');
  clearTimeout(toastT); toastT = setTimeout(() => t.className = '', gold ? 2600 : 1800);
}
// Each open sheet owns one history entry so the Android back button closes it.
let sheetOpen = false, backPending = false;
function sheet(title, body, foot, mount) {
  const root = $('#sheet');
  root.innerHTML = `<div class="backdrop" data-act="close-sheet"></div>
    <div class="panel" role="dialog" aria-label="${esc(title)}"><div class="grab"></div>
      <div class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" data-act="close-sheet" aria-label="Close">${ICON.close}</button></div>
      <div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}</div>`;
  root.classList.add('open');
  if (!sheetOpen) { sheetOpen = true; if (!backPending) history.pushState({sheet: 1}, ''); }
  if (mount) mount($('.panel', root));
}
function hideSheet() { sheetOpen = false; const r = $('#sheet'); r.classList.remove('open'); r.innerHTML = ''; }
function closeSheet() {
  if (!sheetOpen) return;
  hideSheet();
  if (history.state && history.state.sheet) { backPending = true; history.back(); }
}
window.addEventListener('popstate', () => {
  if (backPending) { backPending = false; if (sheetOpen) history.pushState({sheet: 1}, ''); return; }
  if (sheetOpen) hideSheet();
});

// base: value the +/- buttons start from when the field is empty
function stepper(id, value, step, label, placeholder = '', base = '') {
  return `<div>${label ? `<label class="field-label" for="${esc(id)}">${label}</label>` : ''}<div class="stepper">
    <button type="button" data-act="step" data-target="${esc(id)}" data-d="-${step}" aria-label="Decrease">−</button>
    <input id="${esc(id)}" type="text" inputmode="decimal" autocomplete="off" value="${esc(value)}" placeholder="${esc(placeholder)}" data-base="${esc(base)}">
    <button type="button" data-act="step" data-target="${esc(id)}" data-d="${step}" aria-label="Increase">+</button></div></div>`;
}
const field = (id, label, value, placeholder = '', mode = 'decimal') =>
  `<div><label class="field-label" for="${esc(id)}">${label}</label><input id="${esc(id)}" type="text" inputmode="${mode}" autocomplete="off" value="${esc(value ?? '')}" placeholder="${esc(placeholder)}"></div>`;

/* ---------- render shell ---------- */
const TABS = [['log', 'Log'], ['stats', 'Progress'], ['rank', 'Ranking'], ['lib', 'Exercises'], ['settings', 'Settings']];
function renderNav() {
  $('#nav').innerHTML = TABS.map(([k, l]) => `<button data-act="tab" data-tab="${k}" class="${S.tab === k ? 'on' : ''}">${ICON[k]}${l}</button>`).join('');
}
function renderTop() {
  const top = $('#top');
  if (S.tab === 'log') {
    const t = today(), d = S.date;
    const label = d === t ? 'Today' : d === addDays(t, -1) ? 'Yesterday' : d === addDays(t, 1) ? 'Tomorrow' : fmtD(d, {weekday: 'long'});
    top.innerHTML = `<button class="icon-btn" data-act="day" data-d="-1" aria-label="Previous day">${ICON.left}</button>
      <div class="date-btn"><span class="dl">${label}</span><span class="ds">${fmtD(d, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</span>
      <input type="date" id="datePick" value="${d}" aria-label="Pick a date"></div>
      <button class="icon-btn" data-act="day" data-d="1" aria-label="Next day">${ICON.right}</button>`;
    $('#datePick').addEventListener('change', e => { if (e.target.value) { S.date = e.target.value; render(); } });
  } else {
    top.innerHTML = `<h1>${TABS.find(t => t[0] === S.tab)[1]}</h1>`;
  }
}
function render() {
  renderTop(); renderNav();
  const v = $('#view');
  v.innerHTML = S.tab === 'log' ? viewLog() : S.tab === 'stats' ? viewStats() : S.tab === 'rank' ? viewRanking() : S.tab === 'lib' ? viewLib() : viewSettings();
  if (S.tab === 'rank') bindRanking();
  if (S.tab === 'lib') bindLibSearch();
  if (S.tab === 'stats') {
    $('#statsEx')?.addEventListener('change', e => { S.statsEx = e.target.value; render(); });
    $('#statsAct')?.addEventListener('change', e => { S.cardioAct = e.target.value; render(); });
  }
}

/* ---------- LOG ---------- */
const DAILY = {
  kg: {label: 'Weight (kg)', step: 0.1, base: () => num(db.settings.defaultKg) || 75, min: 20, max: 400, show: v => fmt(v, 1) + ' kg'},
  bf: {label: 'Body fat (%)', step: 0.1, base: () => 20, min: 2, max: 70, show: v => fmt(v, 1) + ' %'},
  sleep: {label: 'Sleep last night (h)', step: 0.25, base: () => 7.5, min: 0, max: 24, show: fmtSleep},
  eat: {label: 'Calories eaten', step: 50, base: () => db.goals.eat || 2000, min: 0, max: 15000, show: v => fmt(v) + ' kcal'},
};
function dailyField(f) {
  const c = DAILY[f], v = valOf(f, S.date), pk = lastKey(f, S.date, false), pv = pk ? db.days[pk][f] : null;
  let hint = v != null && f === 'sleep' ? fmtSleep(v) : pv != null ? `last ${c.show(pv)} · ${fmtD(pk)}` : '';
  if (f === 'kg' && v != null && pv != null) hint = `${Math.abs(v - pv) < 0.05 ? 'no change' : signed(v - pv) + ' kg'} since ${fmtD(pk)}`;
  return `<div>${stepper('d-' + f, v ?? '', c.step, c.label, pv ?? '', pv ?? c.base())}<div class="field-hint">${hint}</div></div>`;
}
function viewLog() {
  const d = S.date;
  const cardio = db.cardio.filter(c => c.date === d);
  const lifts = db.lifts.filter(l => l.date === d);
  const nSets = sum(lifts, l => l.sets.length), vol = sum(lifts, l => volumeOf(l.sets));
  const exK = sum(cardio, c => c.kcal) + liftKcal(nSets, bodyKgOn(d));
  const eaten = valOf('eat', d);

  let h = '';
  const hasData = db.lifts.length + db.cardio.length + Object.keys(db.days).length > 0;
  const lb = db.settings.lastBackup;
  h += installHint();
  if (hasData && (!lb || diffDays(lb.slice(0, 10), today()) > 14)) {
    h += `<div class="banner"><span class="grow">Your data lives only on this phone. ${lb ? `Last backup ${fmtD(lb.slice(0, 10))}.` : 'No backup yet.'}</span><button class="btn sm" data-act="tab" data-tab="settings">Back up</button></div>`;
  }
  h += `<div class="summary">
    <div><b>${eaten != null ? fmt(eaten) : '–'}</b><span>kcal eaten</span></div>
    <div><b>${fmt(exK)}</b><span>kcal exercise</span></div>
    <div><b>${nSets}</b><span>sets</span></div>
    <div><b>${vol >= 10000 ? fmt(vol / 1000, 1) + 't' : fmt(vol)}</b><span>${vol >= 10000 ? 'volume' : 'kg volume'}</span></div></div>`;

  const goals = goalsHtml(d, false);
  if (goals) h += `<div class="sec-title"><h2>Goals</h2><span class="tiny muted">week of ${fmtD(weekStart(d))}</span></div><div class="card" style="padding:6px 14px">${goals}</div>`;

  // body & recovery
  const any = ['kg', 'bf', 'sleep', 'eat'].some(f => valOf(f, d) != null);
  h += `<div class="sec-title"><h2><span class="dot" style="background:var(--weight)"></span>Body, sleep & food</h2>${any ? '<span class="tiny muted">saved ✓</span>' : ''}</div>
    <div class="card"><div class="grid2">${dailyField('kg')}${dailyField('bf')}${dailyField('sleep')}${dailyField('eat')}</div>
    <button class="btn ${any ? '' : 'primary'} block" style="margin-top:12px" data-act="save-daily">${any ? 'Update' : 'Save'}</button>
    <div class="tiny muted" style="margin-top:8px;text-align:center">Fill in only what you measured. Empty fields are not saved.</div></div>`;

  // cardio
  const cMin = sum(cardio, c => c.min);
  h += `<div class="sec-title"><h2><span class="dot" style="background:var(--cardio)"></span>Cardio${cMin ? ` · ${fmt(cMin)} min` : ''}</h2><div class="acts"><button class="btn sm" data-act="add-cardio">+ Add</button></div></div>`;
  if (cardio.length) {
    h += `<div class="card" style="padding:4px 14px">` + cardio.map(c => {
      const a = exById(c.act);
      const bits = [`${fmt(c.min)} min`];
      if (c.dist > 0) bits.push(`${fmt(c.dist, 2)} km`, `${fmt(c.dist / c.min * 60, 1)} km/h`);
      if (c.hr > 0) bits.push(`${fmt(c.hr)} bpm`);
      return `<button class="list-row" data-act="edit-cardio" data-id="${esc(c.id)}"><div class="grow"><div class="t">${esc(a.name)}</div><div class="s">${bits.join(' · ')}</div></div><div class="r"><b>${fmt(c.kcal)}</b> <span class="muted small">kcal</span></div></button>`;
    }).join('') + `</div>`;
  } else h += `<button class="btn ghost" data-act="add-cardio">+ Add cardio activity</button>`;

  // strength
  h += `<div class="sec-title"><h2><span class="dot" style="background:var(--lift)"></span>Weight lifting</h2><div class="acts"><button class="btn sm" data-act="add-ex">+ Exercise</button></div></div>`;
  for (const l of lifts) h += exCard(l);
  h += `<div class="btn-row">${lifts.length ? '' : '<button class="btn ghost" data-act="add-ex">+ Add exercise</button>'}</div>
    <div class="btn-row" style="margin-top:8px"><button class="btn sm" data-act="load-tpl">Load template</button><button class="btn sm" data-act="repeat">Repeat a past workout</button></div>
    ${lifts.length ? `<button class="btn ghost" style="margin-top:8px" data-act="save-tpl">Save these exercises as a template</button>` : ''}`;
  return h;
}

function maxKgBefore(exId, entryId, upToIdx) {
  let m = 0;
  for (const l of db.lifts) if (l.ex === exId) l.sets.forEach((s, i) => {
    if (l.id === entryId && i >= upToIdx) return;
    if (l.id !== entryId && l.date > S.date) return;
    m = Math.max(m, s.kg);
  });
  return m;
}
function exCard(l) {
  const ex = exById(l.ex);
  const last = lastSession(l.ex, l.date);
  const sub = last ? `Last ${fmtD(last.date)}: ${last.sets.map(s => setLabel(ex, s).replace(' kg', '')).join(', ')}` : ex.group;
  const ref = l.sets[l.sets.length - 1] || (last && last.sets[0]) || {kg: ex.bw ? 0 : '', reps: ''};
  const chips = l.sets.map((s, i) => {
    const pr = s.kg > 0 && s.kg > maxKgBefore(l.ex, l.id, i) && (last || i > 0) ? ' pr' : '';
    return `<button class="set-chip${pr}" data-act="edit-set" data-id="${esc(l.id)}" data-i="${i}"><b>${i + 1}</b>${setLabel(ex, s)}</button>`;
  }).join('');
  return `<div class="card ex-card" data-entry="${esc(l.id)}">
    <div class="row" style="align-items:flex-start"><div class="grow"><div class="ex-name">${esc(ex.name)}</div><div class="ex-sub">${esc(sub)}</div></div>
      <button class="icon-btn" style="margin:-8px -8px 0 0" data-act="del-entry" data-id="${esc(l.id)}" aria-label="Remove exercise">${ICON.trash}</button></div>
    ${chips ? `<div class="sets">${chips}</div>` : '<div style="height:10px"></div>'}
    <div class="set-input">
      ${stepper('kg-' + l.id, ref.kg, 2.5, ex.bw ? 'Added kg' : 'Weight (kg)')}
      ${stepper('reps-' + l.id, ref.reps, ex.sec ? 5 : 1, ex.sec ? 'Seconds' : 'Reps')}
      <button class="btn primary" data-act="add-set" data-id="${esc(l.id)}">Add set</button>
    </div></div>`;
}

/* ---------- pickers ---------- */
function pickerSheet(kind, title, onPick) {
  const groups = kind === 's' ? Object.keys(S_GROUPS) : Object.keys(C_GROUPS);
  const customGroups = [...new Set(db.custom.filter(e => e.kind === kind && !e.hidden).map(e => e.group))].filter(g => !groups.includes(g));
  const recent = recentIds(kind === 's' ? db.lifts : db.cardio, kind);
  let group = recent.length ? 'Recent' : 'All', q = '';
  const chipsHtml = () => ['Recent', 'All', ...groups, ...customGroups, 'Custom'].filter(g => g !== 'Recent' || recent.length)
    .map(g => `<button class="chip ${g === group ? 'on' : ''}" data-g="${esc(g)}">${esc(g)}</button>`).join('');
  const listHtml = () => {
    let items = pickable(kind);
    if (q) items = items.filter(e => e.name.toLowerCase().includes(q));
    else if (group === 'Recent') items = recent.map(exById);
    else if (group === 'Custom') items = items.filter(e => e.custom);
    else if (group !== 'All') items = items.filter(e => e.group === group);
    if (!items.length) return `<div class="empty">No matches. You can add your own in the Exercises tab.</div>`;
    return items.map(e => `<button class="list-row" data-pick="${esc(e.id)}"><div class="grow"><div class="t">${esc(e.name)}${e.custom ? '<span class="badge">custom</span>' : ''}</div><div class="s">${esc(e.group)}${kind === 'c' ? ` · MET ${fmt(e.met, 1)}` : e.bw ? ' · bodyweight' : ''}</div></div></button>`).join('');
  };
  sheet(title, `<input id="pq" type="search" placeholder="Search…" autocomplete="off" style="margin-bottom:8px"><div class="chips" id="pchips">${chipsHtml()}</div><div id="plist">${listHtml()}</div>`, '', p => {
    p.classList.add('tall');
    $('#pq', p).addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); $('#plist', p).innerHTML = listHtml(); });
    $('#pchips', p).addEventListener('click', e => { const c = e.target.closest('[data-g]'); if (!c) return; group = c.dataset.g; q = ''; $('#pq', p).value = ''; $('#pchips', p).innerHTML = chipsHtml(); $('#plist', p).innerHTML = listHtml(); });
    $('#plist', p).addEventListener('click', e => { const r = e.target.closest('[data-pick]'); if (r) onPick(r.dataset.pick); });
  });
}

function cardioForm(entry, presetAct) {
  const isNew = !entry;
  const e = entry ? {...entry} : {id: uid(), date: S.date, act: presetAct || null, min: 30, kcal: 0, auto: true};
  const pickThen = () => pickerSheet('c', 'Choose cardio activity', id => { e.act = id; showForm(); });
  const showForm = () => {
    const a = exById(e.act);
    sheet(isNew ? 'Add cardio' : 'Edit cardio', `
      <button class="list-row" id="chg" style="border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:14px"><div class="grow"><div class="t">${esc(a.name)}</div><div class="s">MET ${fmt(a.met, 1)} · tap to change</div></div></button>
      <div class="stack">
        ${stepper('cmin', e.min, 5, 'Duration (minutes)')}
        <div class="grid2">${field('cdist', 'Distance (km)', e.dist || '', 'optional')}${field('chr', 'Avg heart rate (bpm)', e.hr || '', 'optional', 'numeric')}</div>
        <div class="small muted" id="cspeed" style="min-height:18px"></div>
        <div><label class="field-label" for="ckcal">Calories burned</label><input id="ckcal" type="text" inputmode="numeric" value="${e.auto === false ? esc(e.kcal) : ''}" placeholder="auto"></div>
        <div class="small muted" id="chint"></div>
      </div>`,
      `${isNew ? '' : '<button class="btn danger" id="cdel">Delete</button>'}<button class="btn primary" id="csave">${isNew ? 'Add' : 'Save'}</button>`, p => {
      const read = () => ({m: num($('#cmin', p).value) || 0, dist: num($('#cdist', p).value), hr: num($('#chr', p).value)});
      const upd = () => {
        const {m, dist, hr} = read(), est = cardioEstimate(a, e.date, m, hr);
        const manual = $('#ckcal', p).value.trim() !== '';
        $('#ckcal', p).placeholder = `auto: ${fmt(est.kcal)}`;
        $('#cspeed', p).textContent = dist > 0 && m > 0 ? `Speed ${fmt(dist / m * 60, 1)} km/h · pace ${fmtPace(m / dist)}` : '';
        $('#chint', p).textContent = manual ? `Manual value. Clear the field to use the estimate (${fmt(est.kcal)} kcal).` : `Estimate: ${est.how} = ${fmt(est.kcal)} kcal`;
      };
      upd();
      p.addEventListener('input', upd);
      $('#chg', p).onclick = pickThen;
      $('#csave', p).onclick = () => {
        const {m, dist, hr} = read();
        if (!(m > 0)) return toast('Enter the duration');
        if ($('#chr', p).value.trim() && !(hr >= 40 && hr <= 230)) return toast('Heart rate should be 40–230 bpm');
        const manual = num($('#ckcal', p).value);
        e.min = m; e.met = a.met;
        if (dist > 0) e.dist = Math.round(dist * 100) / 100; else delete e.dist;
        if (hr > 0) e.hr = Math.round(hr); else delete e.hr;
        if (isFinite(manual) && $('#ckcal', p).value.trim() !== '') { e.kcal = Math.round(manual); e.auto = false; }
        else { e.kcal = Math.round(cardioEstimate(a, e.date, m, hr).kcal); e.auto = true; }
        if (isNew) db.cardio.push(e); else db.cardio[db.cardio.findIndex(c => c.id === e.id)] = e;
        save(); closeSheet(); render(); toast(isNew ? 'Cardio added' : 'Saved');
      };
      if (!isNew) $('#cdel', p).onclick = () => { db.cardio = db.cardio.filter(c => c.id !== e.id); save(); closeSheet(); render(); toast('Deleted'); };
    });
  };
  e.act ? showForm() : pickThen();
}

function addExercise(id, date = S.date) {
  let l = db.lifts.find(x => x.date === date && x.ex === id);
  if (!l) { l = {id: uid(), date, ex: id, sets: []}; db.lifts.push(l); }
  return l;
}

/* ---------- templates ---------- */
function templateEditor(tpl) {
  const isNew = !tpl;
  const t = tpl ? {...tpl, ex: [...tpl.ex]} : {id: uid(), name: '', ex: []};
  let q = '';
  const selHtml = () => t.ex.length ? t.ex.map((id, i) => `<div class="list-row"><span class="muted num" style="width:18px">${i + 1}</span><div class="grow t">${esc(exById(id).name)}</div><button class="icon-btn" data-rm="${i}" aria-label="Remove">${ICON.close}</button></div>`).join('')
    : '<div class="small muted" style="padding:8px 2px">No exercises yet — add from the list below.</div>';
  const listHtml = () => {
    let items = pickable('s');
    if (q) items = items.filter(e => e.name.toLowerCase().includes(q) || e.group.toLowerCase().includes(q));
    return items.map(e => { const on = t.ex.includes(e.id);
      return `<button class="list-row" data-tog="${esc(e.id)}"><span class="check ${on ? 'on' : ''}">${on ? '✓' : ''}</span><div class="grow"><div class="t">${esc(e.name)}</div><div class="s">${esc(e.group)}</div></div></button>`; }).join('');
  };
  sheet(isNew ? 'New template' : 'Edit template', `
    <label class="field-label" for="tname">Name</label><input id="tname" value="${esc(t.name)}" placeholder="e.g. Push day" autocomplete="off">
    <div class="sec-title" style="margin-top:14px"><h2>Exercises in order</h2></div><div id="tsel">${selHtml()}</div>
    <div class="sec-title"><h2>Add exercises</h2></div><input id="tq" type="search" placeholder="Search exercises or muscle…" style="margin-bottom:6px"><div id="tlist">${listHtml()}</div>`,
    `${isNew ? '' : '<button class="btn danger" id="tdel">Delete</button>'}<button class="btn primary" id="tsave">Save template</button>`, p => {
    p.classList.add('tall');
    const refresh = () => { $('#tsel', p).innerHTML = selHtml(); $('#tlist', p).innerHTML = listHtml(); };
    $('#tq', p).addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); $('#tlist', p).innerHTML = listHtml(); });
    $('#tsel', p).addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { t.ex.splice(+b.dataset.rm, 1); refresh(); } });
    $('#tlist', p).addEventListener('click', e => { const b = e.target.closest('[data-tog]'); if (!b) return; const id = b.dataset.tog, i = t.ex.indexOf(id); i >= 0 ? t.ex.splice(i, 1) : t.ex.push(id); refresh(); });
    $('#tsave', p).onclick = () => {
      t.name = $('#tname', p).value.trim();
      if (!t.name) return toast('Give the template a name');
      if (!t.ex.length) return toast('Add at least one exercise');
      if (isNew) db.templates.push(t); else db.templates[db.templates.findIndex(x => x.id === t.id)] = t;
      save(); closeSheet(); render(); toast('Template saved');
    };
    if (!isNew) $('#tdel', p).onclick = () => { if (!confirm(`Delete template "${t.name}"?`)) return; db.templates = db.templates.filter(x => x.id !== t.id); save(); closeSheet(); render(); };
  });
}

/* ---------- LIBRARY ---------- */
function viewLib() {
  let h = `<div class="seg">${[['s', 'Strength'], ['c', 'Cardio'], ['t', 'Templates']].map(([k, l]) => `<button class="${S.libTab === k ? 'on' : ''}" data-act="lib-tab" data-k="${k}">${l}</button>`).join('')}</div>`;
  if (S.libTab === 't') {
    h += `<button class="btn primary block" data-act="tpl-new" style="margin-bottom:12px">+ New template</button>`;
    if (!db.templates.length) h += `<div class="empty">Templates are saved routines (e.g. “Push day”). Load one on the Log screen to add all its exercises at once.</div>`;
    for (const t of db.templates) h += `<button class="card list-row" style="display:block;padding:14px" data-act="tpl-edit" data-id="${esc(t.id)}"><div class="t">${esc(t.name)}</div><div class="s">${t.ex.map(id => esc(exById(id).name)).join(' · ')}</div></button>`;
    return h;
  }
  h += `<div class="row" style="margin-bottom:12px"><input id="libq" type="search" placeholder="Search…" value="${esc(S.libQ)}" autocomplete="off"><button class="btn" data-act="add-custom">+ Custom</button></div><div id="liblist">${libList()}</div>`;
  return h;
}
function libList() {
  const kind = S.libTab, q = S.libQ.trim().toLowerCase();
  let items = pickable(kind);
  if (q) items = items.filter(e => e.name.toLowerCase().includes(q) || e.group.toLowerCase().includes(q));
  if (!items.length) return `<div class="empty">Nothing found. Tap “+ Custom” to add it.</div>`;
  const by = {};
  for (const e of items) (by[e.group] = by[e.group] || []).push(e);
  const kg = bodyKgOn(today());
  return Object.entries(by).map(([g, arr]) => `<div class="sec-title"><h2>${esc(g)}</h2><span class="tiny muted">${arr.length}</span></div><div class="card" style="padding:2px 14px">` +
    arr.map(e => `<button class="list-row" data-act="ex-info" data-id="${esc(e.id)}"><div class="grow"><div class="t">${esc(e.name)}${e.custom ? '<span class="badge">custom</span>' : ''}</div><div class="s">${kind === 'c' ? `MET ${fmt(e.met, 1)} · ≈ ${fmt(kcalFor(e.met, kg, 30))} kcal / 30 min` : e.bw ? 'Bodyweight' : ''}</div></div></button>`).join('') + `</div>`).join('');
}
function bindLibSearch() {
  const i = $('#libq'); if (!i) return;
  i.addEventListener('input', e => { S.libQ = e.target.value; $('#liblist').innerHTML = libList(); });
}
function exInfo(id) {
  const e = exById(id);
  let body = `<div class="small muted" style="margin-bottom:12px">${esc(e.group)}${e.custom ? ' · custom' : ''}</div>`;
  if (e.kind === 'c') {
    const kg = bodyKgOn(today());
    body += `<div class="card"><div class="small muted" style="margin-bottom:6px">At ${fmt(kg, 1)} kg (MET ${fmt(e.met, 1)})</div>` +
      [15, 30, 45, 60].map(m => `<div class="list-row"><span class="grow">${m} min</span><b class="num">${fmt(kcalFor(e.met, kg, m))} kcal</b></div>`).join('') + `</div>`;
  } else {
    const ent = db.lifts.filter(l => l.ex === id && l.sets.length);
    body += ent.length ? `<div class="small">${ent.length} session${ent.length > 1 ? 's' : ''} logged · best ${fmt(Math.max(...ent.flatMap(l => l.sets.map(s => s.kg))), 2)} kg</div>` : `<div class="small muted">Not logged yet.</div>`;
  }
  const hasData = e.kind === 's' ? db.lifts.some(l => l.ex === id) : db.cardio.some(c => c.act === id);
  const foot = [
    e.custom ? `<button class="btn danger" id="xdel">Delete</button>` : '',
    hasData ? `<button class="btn" id="xstats">Progress</button>` : '',
    `<button class="btn primary" id="xadd">Log for ${S.date === today() ? 'today' : fmtD(S.date)}</button>`,
  ].join('');
  sheet(e.name, body, foot, p => {
    $('#xadd', p).onclick = () => {
      closeSheet(); S.tab = 'log';
      if (e.kind === 's') { addExercise(id); save(); render(); }
      else { render(); cardioForm(null, id); }
    };
    if ($('#xstats', p)) $('#xstats', p).onclick = () => {
      closeSheet(); S.tab = 'stats';
      if (e.kind === 's') S.statsEx = id; else S.cardioAct = id;
      render(); $(e.kind === 's' ? '#strength' : '#cardio-act')?.scrollIntoView({block: 'start'});
    };
    if ($('#xdel', p)) $('#xdel', p).onclick = () => {
      if (!confirm(`Delete "${e.name}"? Entries already logged keep their history.`)) return;
      e.hidden = true; save(); closeSheet(); render();
    };
  });
}
function customForm() {
  let kind = S.libTab === 'c' ? 'c' : 's';
  const draw = () => {
    const groups = kind === 's' ? Object.keys(S_GROUPS) : Object.keys(C_GROUPS);
    sheet('Custom exercise', `
      <div class="seg"><button class="${kind === 's' ? 'on' : ''}" data-k="s">Strength</button><button class="${kind === 'c' ? 'on' : ''}" data-k="c">Cardio</button></div>
      <div class="stack">
        <div><label class="field-label" for="cname">Name</label><input id="cname" autocomplete="off" placeholder="${kind === 's' ? 'e.g. Cable Y-Raise' : 'e.g. Salsa – advanced class'}"></div>
        <div><label class="field-label" for="cgroup">Category</label><select id="cgroup">${groups.map(g => `<option>${esc(g)}</option>`).join('')}</select></div>
        ${kind === 's'
          ? `<label class="row" style="gap:10px"><input type="checkbox" id="cbw" style="width:22px;min-height:22px"> <span>Bodyweight exercise (weight = added kg)</span></label>`
          : `<div>${stepper('cmet', 5, 0.5, 'Intensity (MET)')}<div class="tiny muted" style="margin-top:6px">MET guide: easy walk 3 · light dance 4.5 · elliptical 5 · fast dance 6.5 · jogging 8 · running 10+</div></div>`}
      </div>`, `<button class="btn primary" id="csave2">Add</button>`, p => {
      $$('.seg [data-k]', p).forEach(b => b.onclick = () => { kind = b.dataset.k; draw(); });
      $('#csave2', p).onclick = () => {
        const name = $('#cname', p).value.trim();
        if (!name) return toast('Enter a name');
        const item = {id: (kind === 'c' ? 'c' : 's') + '-x-' + uid(), name, kind, group: $('#cgroup', p).value, custom: true};
        if (kind === 's') item.bw = $('#cbw', p).checked;
        else { item.met = num($('#cmet', p).value); if (!(item.met > 0)) return toast('Enter a MET value'); }
        db.custom.push(item); save(); S.libTab = kind; closeSheet(); render(); toast('Added');
      };
    });
  };
  draw();
}

/* ---------- charts ---------- */
const W = 340;
function niceStep(range, n = 3) {
  const raw = range / n, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
const axisNum = v => Math.abs(v) >= 1000 ? fmt(v / 1000, 1) + 'k' : fmt(v, 2);
function lineChart(pts, color, dec = 1, target = null) {
  if (pts.length < 2) return `<div class="empty">${pts.length ? 'Log at least two days to see a trend.' : 'No data in this period.'}</div>`;
  const H = 170, pl = 38, pr = 8, pt = 10, pb = 22;
  const xs = pts.map(p => parseD(p.x).getTime()), ys = pts.map(p => p.y).concat(target != null ? [target] : []);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const span = (y1 - y0) || Math.max(1, Math.abs(y1) * 0.05); y0 -= span * 0.1; y1 += span * 0.1;
  const step = niceStep(y1 - y0);
  y0 = Math.floor(y0 / step) * step; y1 = Math.ceil(y1 / step) * step;
  if (y0 < 0 && Math.min(...ys) >= 0) y0 = 0;
  const X = t => pl + (x1 === x0 ? .5 : (t - x0) / (x1 - x0)) * (W - pl - pr);
  const Y = v => pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb);
  let g = '';
  for (let v = y0; v <= y1 + step / 2; v += step) { const y = Y(v);
    g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" style="stroke:var(--line)" stroke-width="1"/><text x="${pl - 6}" y="${y + 3}" text-anchor="end">${axisNum(v)}</text>`; }
  const xl = [0, Math.floor((pts.length - 1) / 2), pts.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  for (const i of xl) g += `<text x="${X(xs[i])}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}">${fmtD(pts[i].x)}</text>`;
  if (target != null) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(target)}" y2="${Y(target)}" style="stroke:${color}" stroke-width="1.4" stroke-dasharray="5 4" opacity=".8"/><text x="${W - pr}" y="${Y(target) - 4}" text-anchor="end" style="fill:${color}">goal</text>`;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
  const area = `${line}L${X(xs[xs.length - 1]).toFixed(1)},${H - pb}L${X(xs[0]).toFixed(1)},${H - pb}Z`;
  const gid = 'g' + uid();
  const dots = pts.length <= 40 ? pts.map((p, i) => `<circle cx="${X(xs[i])}" cy="${Y(p.y)}" r="3" style="fill:${color}"><title>${fmtD(p.x)}: ${fmt(p.y, dec)}</title></circle>`).join('') : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:${color};stop-opacity:.28"/><stop offset="1" style="stop-color:${color};stop-opacity:0"/></linearGradient></defs>${g}<path d="${area}" fill="url(#${gid})"/><path d="${line}" fill="none" style="stroke:${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${dots}</svg>`;
}
// items: [{label, y, y2?}] — y2 draws a second bar beside the first
function barChart(items, color, dec = 0, color2 = null, target = null) {
  if (!items.some(i => i.y > 0 || i.y2 > 0)) return `<div class="empty">No data in this period.</div>`;
  const H = 160, pl = 38, pr = 4, pt = 10, pb = 22;
  const top = Math.max(...items.map(i => Math.max(i.y, i.y2 || 0)), target || 0);
  const step = niceStep(top), max = Math.ceil(top / step) * step;
  const bw = (W - pl - pr) / items.length, Y = v => pt + (1 - v / max) * (H - pt - pb);
  let g = '';
  for (let v = 0; v <= max + step / 2; v += step) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)" stroke-width="1"/><text x="${pl - 6}" y="${Y(v) + 3}" text-anchor="end">${axisNum(v)}</text>`;
  const every = Math.ceil(items.length / 6);
  items.forEach((it, i) => {
    const pairs = color2 ? [[it.y, color, 0], [it.y2 || 0, color2, 1]] : [[it.y, color, 0]];
    const w = bw * 0.7 / pairs.length;
    for (const [v, c, j] of pairs) {
      const x = pl + i * bw + bw * 0.15 + j * w;
      g += `<rect x="${x.toFixed(1)}" y="${Y(v).toFixed(1)}" width="${Math.max(1, w - (color2 ? 1 : 0)).toFixed(1)}" height="${Math.max(0, H - pb - Y(v)).toFixed(1)}" rx="2" style="fill:${c}"><title>${it.label}: ${fmt(v, dec)}</title></rect>`;
    }
    if (i % every === 0) g += `<text x="${(pl + i * bw + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${it.label}</text>`;
  });
  if (target) g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(target)}" y2="${Y(target)}" style="stroke:var(--text)" stroke-width="1.2" stroke-dasharray="5 4" opacity=".6"/><text x="${W - pr}" y="${Y(target) - 4}" text-anchor="end">goal</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}
function heatmap(weeks = 17) {
  const end = weekStart(today()), start = addDays(end, -7 * (weeks - 1));
  const lift = new Set(db.lifts.filter(l => l.sets.length).map(l => l.date)), car = new Set(db.cardio.map(c => c.date));
  const cs = 17, gap = 3, pl = 22, pt = 14;
  let g = '';
  ['M', '', 'W', '', 'F', '', 'S'].forEach((l, i) => { if (l) g += `<text x="0" y="${pt + i * (cs + gap) + 12}">${l}</text>`; });
  for (let w = 0; w < weeks; w++) {
    const ws = addDays(start, w * 7);
    const prevMonth = w ? addDays(ws, -7).slice(5, 7) : null;
    if (ws.slice(5, 7) !== prevMonth && w < weeks - 1) g += `<text x="${pl + w * (cs + gap)}" y="10">${fmtD(ws, {month: 'short'})}</text>`;
    for (let d = 0; d < 7; d++) {
      const ds = addDays(ws, d); if (ds > today()) continue;
      const a = lift.has(ds), b = car.has(ds);
      const fill = a && b ? 'var(--gold)' : a ? 'var(--lift)' : b ? 'var(--cardio)' : 'var(--surface2)';
      g += `<rect x="${pl + w * (cs + gap)}" y="${pt + d * (cs + gap)}" width="${cs}" height="${cs}" rx="4" style="fill:${fill}"><title>${fmtD(ds)}${a ? ' · lifting' : ''}${b ? ' · cardio' : ''}</title></rect>`;
    }
  }
  const Wd = pl + weeks * (cs + gap), Hd = pt + 7 * (cs + gap);
  return `<svg class="chart" viewBox="0 0 ${Wd} ${Hd}" role="img">${g}</svg>
    <div class="legend"><span><span class="dot" style="background:var(--lift)"></span>Lifting</span><span><span class="dot" style="background:var(--cardio)"></span>Cardio</span><span><span class="dot" style="background:var(--gold)"></span>Both</span></div>`;
}

/* ---------- STATS ---------- */
const RANGES = [['1m', '1M', 30], ['3m', '3M', 91], ['6m', '6M', 182], ['1y', '1Y', 365], ['all', 'All', null]];
function rangeStart() {
  const r = RANGES.find(r => r[0] === S.range);
  if (r[2]) return addDays(today(), -r[2] + 1);
  const all = [...Object.keys(db.days), ...db.cardio.map(c => c.date), ...db.lifts.map(l => l.date)].sort();
  return all[0] && all[0] < today() ? all[0] : addDays(today(), -29);
}
function bucketer(start, end) {
  const monthly = diffDays(start, end) > 200;
  const keyOf = d => monthly ? d.slice(0, 7) + '-01' : weekStart(d);
  const keys = []; let k = keyOf(start);
  while (k <= end) { keys.push(k); k = monthly ? iso(new Date(parseD(k).getFullYear(), parseD(k).getMonth() + 1, 1)) : addDays(k, 7); }
  const label = k => monthly ? fmtD(k, {month: 'short'}) : fmtD(k);
  return {keys, keyOf, label, monthly};
}
function tile(v, l, unit = '', style = '') { return `<div class="tile"><div class="v" style="${style}">${v}${unit ? `<small>${unit}</small>` : ''}</div><div class="l">${l}</div></div>`; }
const secTitle = (label, color, right = '', id = '') => `<div class="sec-title"${id ? ` id="${esc(id)}"` : ''}><h2>${color ? `<span class="dot" style="background:${color}"></span>` : ''}${label}</h2>${right}</div>`;

function viewStats() {
  const start = rangeStart(), end = today();
  const inR = d => d >= start && d <= end;
  const ctx = {start, end, inR, B: bucketer(start, end)};
  ctx.per = ctx.B.monthly ? 'month' : 'week';
  ctx.lifts = db.lifts.filter(l => inR(l.date) && l.sets.length);
  ctx.cardio = db.cardio.filter(c => inR(c.date));

  const sleepV = keysOf('sleep').filter(inR).map(k => db.days[k].sleep), eatV = keysOf('eat').filter(inR).map(k => db.days[k].eat);
  let h = `<div class="chips" style="margin-bottom:12px">${RANGES.map(r => `<button class="chip ${S.range === r[0] ? 'on' : ''}" data-act="range" data-r="${r[0]}">${r[1]}</button>`).join('')}</div>`;
  h += `<div class="tiles">${tile(new Set([...ctx.lifts.map(l => l.date), ...ctx.cardio.map(c => c.date)]).size, 'Active days')}${tile(new Set(ctx.lifts.map(l => l.date)).size, 'Lifting sessions')}`
    + `${tile(fmt(sum(ctx.cardio, c => c.min)), 'Cardio minutes', 'min')}${tile(fmt(sum(ctx.cardio, c => c.kcal)), 'Cardio calories', 'kcal')}`
    + `${tile(sleepV.length ? fmtSleep(avg(sleepV)) : '–', 'Average sleep')}${tile(eatV.length ? fmt(avg(eatV)) : '–', 'Average eaten / day', eatV.length ? 'kcal' : '')}</div>`;

  const goals = goalsHtml(today(), true);
  h += secTitle('Goals', '', `<button class="btn sm" data-act="edit-goals">Edit</button>`);
  h += goals ? `<div class="card" style="padding:6px 14px">${goals}</div>` : `<div class="card"><div class="empty">No goals yet. Set targets for weight, body fat, sleep, calories, cardio and lifting volume.</div><button class="btn primary block" data-act="edit-goals">Set goals</button></div>`;

  h += statsBody('kg', ctx) + statsBody('bf', ctx) + statsSleep(ctx) + statsEnergy(ctx) + statsCardio(ctx) + statsLifting(ctx);
  h += secTitle('Exercise progress', '', '', 'strength') + exerciseProgress(inR);
  h += secTitle('Consistency') + `<div class="card">${heatmap()}</div>`;
  return h;
}

function statsBody(f, {inR}) {
  const isKg = f === 'kg', unit = isKg ? 'kg' : '%', color = isKg ? 'var(--weight)' : 'var(--bf)';
  const pts = keysOf(f).filter(inR).map(k => ({x: k, y: db.days[k][f]}));
  if (!isKg && !keysOf('bf').length) return '';
  let h = secTitle(isKg ? 'Body weight' : 'Body fat', color) + `<div class="card">`;
  if (!pts.length) return h + `<div class="empty">No entries in this period.</div></div>`;
  const first = pts[0], last = pts[pts.length - 1], ch = last.y - first.y;
  const s = slopePerDay(pts);
  h += `<div class="row" style="justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:4px 12px">
    <div><div style="font-size:24px;font-weight:700" class="num">${fmt(last.y, 1)} <span class="small muted">${unit}</span></div><div class="tiny muted">latest · ${fmtD(last.x)}</div></div>
    <div style="text-align:right"><div class="num" style="font-weight:700">${signed(ch, 1)} ${unit}</div><div class="tiny muted">${s != null ? `${signed(s * 7, 2)} ${unit}/week trend` : 'change in period'}</div></div></div>`;
  h += lineChart(pts, color, 1, db.goals[f] > 0 ? db.goals[f] : null);
  h += `<div class="row tiny muted" style="justify-content:space-between;margin-top:6px"><span>Low ${fmt(Math.min(...pts.map(p => p.y)), 1)} ${unit}</span><span>High ${fmt(Math.max(...pts.map(p => p.y)), 1)} ${unit}</span><span>${pts.length} entries</span></div>`;
  if (isKg && keysOf('bf').length) {
    // lean vs fat mass on days with both measurements
    const both = pts.filter(p => valOf('bf', p.x) != null);
    if (both.length >= 2) {
      const a = both[0], b = both[both.length - 1], fa = a.y * valOf('bf', a.x) / 100, fb = b.y * valOf('bf', b.x) / 100;
      h += `<div class="small" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">Since ${fmtD(a.x)}: fat mass <b>${signed(fb - fa, 1)} kg</b>, lean mass <b>${signed((b.y - fb) - (a.y - fa), 1)} kg</b></div>`;
    }
  }
  return h + `</div>`;
}

function statsSleep({inR}) {
  const pts = keysOf('sleep').filter(inR).map(k => ({x: k, y: db.days[k].sleep}));
  let h = secTitle('Sleep', 'var(--sleep)') + `<div class="card">`;
  if (!pts.length) return h + `<div class="empty">Log hours slept on the Log screen to see your sleep pattern.</div></div>`;
  const g = db.goals.sleep > 0 ? db.goals.sleep : null, vals = pts.map(p => p.y);
  h += lineChart(pts, 'var(--sleep)', 2, g);
  h += `<div class="row tiny muted" style="justify-content:space-between;margin-top:6px;flex-wrap:wrap;gap:4px"><span>Avg <b>${fmtSleep(avg(vals))}</b></span><span>Shortest ${fmtSleep(Math.min(...vals))}</span><span>Longest ${fmtSleep(Math.max(...vals))}</span>${g ? `<span>${Math.round(vals.filter(v => v >= g).length / vals.length * 100)}% nights ≥ goal</span>` : ''}</div>`;
  return h + `</div>`;
}

function statsEnergy({inR, B, per}) {
  const ks = keysOf('eat').filter(inR);
  let h = secTitle('Calories in vs out', 'var(--food)') + `<div class="card">`;
  if (!ks.length) return h + `<div class="empty">Log calories eaten on the Log screen to see your energy balance.</div></div>`;
  const ok = profileOk();
  const setsBy = {}, cardBy = {};
  for (const l of db.lifts) setsBy[l.date] = (setsBy[l.date] || 0) + l.sets.length;
  for (const c of db.cardio) cardBy[c.date] = (cardBy[c.date] || 0) + c.kcal;
  const act = +db.settings.activity || 1.2;
  const day = k => {
    const kg = bodyKgOn(k), b = bmr(k);
    return {eat: db.days[k].eat, out: b == null ? null : b * act + (cardBy[k] || 0) + liftKcal(setsBy[k] || 0, kg)};
  };
  const rows = ks.map(day);
  const bucket = {};
  ks.forEach((k, i) => { const b = bucket[B.keyOf(k)] = bucket[B.keyOf(k)] || {e: [], o: []}; b.e.push(rows[i].eat); if (rows[i].out != null) b.o.push(rows[i].out); });
  h += barChart(B.keys.map(k => ({label: B.label(k), y: bucket[k] ? avg(bucket[k].e) : 0, y2: bucket[k] && bucket[k].o.length ? avg(bucket[k].o) : 0})), 'var(--food)', 0, ok ? 'var(--cardio)' : null, db.goals.eat > 0 ? db.goals.eat : null);
  h += `<div class="legend"><span><span class="dot" style="background:var(--food)"></span>Eaten (avg per day, by ${per})</span>${ok ? '<span><span class="dot" style="background:var(--cardio)"></span>Burned (estimated)</span>' : ''}</div>`;
  const aEat = avg(rows.map(r => r.eat));
  if (!ok) return h + `<div class="tiles" style="margin:12px 0 0">${tile(fmt(aEat), 'Avg eaten / day', 'kcal')}${tile(ks.length, 'Days logged')}</div>
    <div class="small muted" style="margin-top:10px">Add sex, birth year and height in Settings to estimate calories burned and your daily balance.</div><button class="btn sm" style="margin-top:8px" data-act="tab" data-tab="settings">Open Settings</button></div>`;
  const aOut = avg(rows.map(r => r.out)), bal = aEat - aOut;
  const wpts = keysOf('kg').filter(inR).map(k => ({x: k, y: db.days[k].kg})), s = slopePerDay(wpts);
  h += `<div class="tiles" style="margin:12px 0 0">${tile(fmt(aEat), 'Avg eaten / day', 'kcal')}${tile(fmt(aOut), 'Avg burned / day (est.)', 'kcal')}`
    + tile(signed(bal, 0), bal < 0 ? 'Avg daily deficit' : 'Avg daily surplus', 'kcal', `color:${bal < 0 ? 'var(--good)' : 'var(--gold)'}`)
    + tile(signed(bal * 7 / 7700, 2), `Expected kg/week${s != null ? ` · actual ${signed(s * 7, 2)}` : ''}`, 'kg') + `</div>`;
  h += `<div class="tiny muted" style="margin-top:10px">Based on ${ks.length} day${ks.length > 1 ? 's' : ''} with food logged. Burned = resting metabolism (Mifflin-St Jeor) × activity level ${act} + logged cardio + lifting (~${fmt(liftKcal(1, bodyKgOn(today())))} kcal per set). If actual weight change differs a lot from expected, your intake logging or activity level may be off.</div>`;
  return h + `</div>`;
}

function statsCardio({cardio, B, per, inR}) {
  const ck = Object.fromEntries(B.keys.map(k => [k, 0]));
  for (const c of cardio) { const k = B.keyOf(c.date); if (k in ck) ck[k] += c.kcal; }
  const g = db.goals;
  const target = g.cardio > 0 && g.cardioUnit === 'kcal' && !B.monthly ? g.cardio : null;
  let h = secTitle(`Cardio calories per ${per}`, 'var(--cardio)') + `<div class="card">${barChart(B.keys.map(k => ({label: B.label(k), y: ck[k]})), 'var(--cardio)', 0, null, target)}`;
  if (cardio.length) {
    const by = {};
    for (const c of cardio) { const o = by[c.act] = by[c.act] || {min: 0, kcal: 0}; o.min += c.min; o.kcal += c.kcal; }
    const rows = Object.entries(by).sort((a, b) => b[1].kcal - a[1].kcal), mx = rows[0][1].kcal || 1;
    h += `<div style="margin-top:12px">` + rows.map(([id, o]) => `<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="row"><span class="grow small" style="font-weight:600">${esc(exById(id).name)}</span><span class="small num">${fmt(o.min)} min · <b>${fmt(o.kcal)}</b> kcal</span></div><div class="hbar"><i style="width:${o.kcal / mx * 100}%;background:var(--cardio)"></i></div></div>`).join('') + `</div>`;
    h += `<div class="tiny muted" style="margin-top:8px">Average ${fmt(sum(cardio, c => c.min) / B.keys.length)} min and ${fmt(sum(cardio, c => c.kcal) / B.keys.length)} kcal per ${per}.</div>`;
  }
  h += `</div>`;

  // per-activity progress (all-time list, range-limited chart)
  const last = {};
  for (const c of db.cardio) if (!last[c.act] || last[c.act] < c.date) last[c.act] = c.date;
  const ids = Object.keys(last).sort((a, b) => last[b] < last[a] ? -1 : 1);
  if (!ids.length) return h;
  if (!ids.includes(S.cardioAct)) S.cardioAct = ids[0];
  const ses = {};
  for (const c of db.cardio) if (c.act === S.cardioAct) {
    const o = ses[c.date] = ses[c.date] || {min: 0, kcal: 0, dist: 0, distMin: 0, hrMin: 0, hrSum: 0};
    o.min += c.min; o.kcal += c.kcal;
    if (c.dist > 0) { o.dist += c.dist; o.distMin += c.min; }
    if (c.hr > 0) { o.hrMin += c.min; o.hrSum += c.hr * c.min; }
  }
  const dates = Object.keys(ses).sort();
  const hasDist = dates.some(d => ses[d].dist > 0), hasHr = dates.some(d => ses[d].hrMin > 0);
  const metrics = [['min', 'Duration'], ['kcal', 'Calories']].concat(hasDist ? [['dist', 'Distance'], ['speed', 'Speed']] : [], hasHr ? [['hr', 'Avg heart rate']] : []);
  if (!metrics.some(m => m[0] === S.cardioMetric)) S.cardioMetric = 'min';
  const val = (o, m) => m === 'speed' ? (o.distMin ? o.dist / o.distMin * 60 : null) : m === 'hr' ? (o.hrMin ? o.hrSum / o.hrMin : null) : m === 'dist' ? (o.dist || null) : o[m];
  const pts = dates.filter(inR).map(d => ({x: d, y: val(ses[d], S.cardioMetric)})).filter(p => p.y != null);
  h += secTitle('Cardio activity progress', 'var(--cardio)', '', 'cardio-act') + `<div class="card"><select id="statsAct" aria-label="Activity" style="margin-bottom:10px">${ids.map(id => `<option value="${esc(id)}" ${id === S.cardioAct ? 'selected' : ''}>${esc(exById(id).name)}</option>`).join('')}</select>
    <div class="chips" style="margin-bottom:8px">${metrics.map(([k, l]) => `<button class="chip ${S.cardioMetric === k ? 'on' : ''}" data-act="cmetric" data-m="${k}">${l}</button>`).join('')}</div>
    ${lineChart(pts, 'var(--cardio)', 1)}
    <table class="hist" style="margin-top:8px">${dates.slice(-6).reverse().map(d => { const o = ses[d];
      return `<tr><td class="muted" style="white-space:nowrap;padding-right:10px">${fmtD(d)}</td><td>${fmt(o.min)} min${o.dist ? ` · ${fmt(o.dist, 2)} km · ${fmt(o.dist / o.distMin * 60, 1)} km/h` : ''}${o.hrMin ? ` · ${fmt(o.hrSum / o.hrMin)} bpm` : ''}</td><td>${fmt(o.kcal)} <span class="tiny muted">kcal</span></td></tr>`; }).join('')}</table></div>`;
  return h;
}

function statsLifting({lifts, B, per, start, end}) {
  const vb = Object.fromEntries(B.keys.map(k => [k, 0]));
  for (const l of lifts) { const k = B.keyOf(l.date); if (k in vb) vb[k] += volumeOf(l.sets); }
  const vol = sum(lifts, l => volumeOf(l.sets));
  let h = secTitle(`Lifting volume per ${per}`, 'var(--lift)', `<span class="tiny muted">${fmtKg(vol)} total</span>`)
    + `<div class="card">${barChart(B.keys.map(k => ({label: B.label(k), y: vb[k]})), 'var(--lift)', 0, null, db.goals.volume > 0 && !B.monthly ? db.goals.volume : null)}<div class="tiny muted" style="margin-top:6px">Volume = weight × reps, summed over all sets.</div></div>`;

  // muscle group balance
  const order = Object.keys(S_GROUPS), sets = {};
  for (const l of lifts) { const g = exById(l.ex).group; sets[g] = (sets[g] || 0) + l.sets.length; }
  const groups = [...order, ...Object.keys(sets).filter(g => !order.includes(g))];
  const weeks = Math.max(1, (diffDays(start, end) + 1) / 7), mx = Math.max(1, ...Object.values(sets).map(v => v / weeks));
  h += secTitle('Muscle group balance', 'var(--lift)', '<span class="tiny muted">sets per week</span>') + `<div class="card">`;
  if (!lifts.length) return h + `<div class="empty">No lifting in this period.</div></div>`;
  h += groups.map(g => { const v = (sets[g] || 0) / weeks;
    return `<div style="padding:6px 0"><div class="row"><span class="grow small" style="font-weight:600">${esc(g)}</span><span class="small num">${fmt(v, 1)} <span class="muted">(${sets[g] || 0} total)</span></span></div><div class="hbar"><i style="width:${v / mx * 100}%;background:${v ? 'var(--lift)' : 'transparent'}"></i></div></div>`; }).join('');
  const missing = order.filter(g => !sets[g] && g !== 'Full body');
  h += `<div class="tiny muted" style="margin-top:8px">${missing.length ? `Not trained in this period: ${missing.join(', ')}. ` : ''}A common guideline is about 10–20 sets per muscle group per week.</div>`;
  return h + `</div>`;
}

function exerciseProgress(inR) {
  const used = {};
  for (const l of db.lifts) if (l.sets.length && (!used[l.ex] || used[l.ex] < l.date)) used[l.ex] = l.date;
  const ids = Object.keys(used).sort((a, b) => used[b] < used[a] ? -1 : 1);
  if (!ids.length) return `<div class="card"><div class="empty">Log some lifting sets to see progress per exercise.</div></div>`;
  if (!ids.includes(S.statsEx)) S.statsEx = ids[0];
  const ex = exById(S.statsEx);
  const sessions = {};
  for (const l of db.lifts) if (l.ex === S.statsEx && l.sets.length) (sessions[l.date] = sessions[l.date] || []).push(...l.sets);
  const dates = Object.keys(sessions).sort();
  const noWeight = dates.every(d => sessions[d].every(s => !s.kg));
  const metrics = noWeight ? [['reps', ex.sec ? 'Longest set (s)' : 'Max reps'], ['treps', ex.sec ? 'Total seconds' : 'Total reps']]
    : [['max', 'Heaviest set'], ['1rm', 'Est. 1-rep max'], ['volume', 'Volume']];
  if (!metrics.some(m => m[0] === S.metric)) S.metric = metrics[0][0];
  const val = (sets, m) => m === 'max' ? Math.max(...sets.map(s => s.kg)) : m === '1rm' ? Math.max(...sets.map(s => e1rm(s.kg, s.reps)))
    : m === 'volume' ? volumeOf(sets) : m === 'reps' ? Math.max(...sets.map(s => s.reps)) : sum(sets, s => s.reps);
  const pts = dates.filter(inR).map(d => ({x: d, y: val(sessions[d], S.metric)}));

  const all = dates.flatMap(d => sessions[d].map(s => ({...s, d})));
  const heavy = all.reduce((a, s) => s.kg > a.kg || (s.kg === a.kg && s.reps > a.reps) ? s : a, all[0]);
  const best1 = all.reduce((a, s) => e1rm(s.kg, s.reps) > e1rm(a.kg, a.reps) ? s : a, all[0]);
  const mostReps = all.reduce((a, s) => s.reps > a.reps ? s : a, all[0]);
  const bestVolD = dates.reduce((a, d) => volumeOf(sessions[d]) > volumeOf(sessions[a]) ? d : a, dates[0]);

  let h = `<div class="card"><select id="statsEx" aria-label="Exercise" style="margin-bottom:10px">${ids.map(id => `<option value="${esc(id)}" ${id === S.statsEx ? 'selected' : ''}>${esc(exById(id).name)}</option>`).join('')}</select>
    <div class="chips" style="margin-bottom:8px">${metrics.map(([k, l]) => `<button class="chip ${S.metric === k ? 'on' : ''}" data-act="metric" data-m="${k}">${l}</button>`).join('')}</div>
    ${lineChart(pts, 'var(--lift)', 1)}</div>`;
  h += `<div class="tiles">` + (noWeight
    ? tile(fmt(mostReps.reps), ex.sec ? 'Longest set' : 'Most reps in a set', ex.sec ? 's' : '') + tile(dates.length, 'Sessions logged')
    : tile(fmt(heavy.kg, 2), `Heaviest · ${heavy.reps} reps · ${fmtD(heavy.d)}`, 'kg') +
      tile(fmt(e1rm(best1.kg, best1.reps), 1), `Best est. 1RM · ${fmt(best1.kg, 2)}×${best1.reps}`, 'kg') +
      tile(fmt(volumeOf(sessions[bestVolD])), `Best session volume · ${fmtD(bestVolD)}`, 'kg') +
      tile(dates.length, 'Sessions logged')) + `</div>`;
  h += `<div class="card"><h3 style="margin-bottom:6px">Recent sessions</h3><table class="hist">` + dates.slice(-8).reverse().map(d =>
    `<tr><td class="muted" style="white-space:nowrap;padding-right:10px">${fmtD(d)}</td><td>${sessions[d].map(s => setLabel(ex, s).replace(' kg', '')).join(', ')}</td><td>${noWeight ? '' : fmt(val(sessions[d], '1rm'), 1) + ' <span class="tiny muted">1RM</span>'}</td></tr>`).join('') + `</table></div>`;
  return h;
}

/* ---------- SETTINGS ---------- */
function viewSettings() {
  const s = db.settings, g = db.goals, lb = s.lastBackup;
  const canShare = !!(navigator.canShare && window.File && navigator.canShare({files: [new File(['x'], 'x.json', {type: 'application/json'})]}));
  const opt = (v, l, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${l}</option>`;
  return `
  <div class="sec-title" id="goals-form"><h2>Goals</h2></div>
  <div class="card stack">
    <div class="tiny muted">Leave a field empty for no goal. Progress shows on the Log and Progress screens.</div>
    <div class="grid2">
      ${field('g-kg', 'Target weight (kg)', g.kg, 'e.g. 78')}
      ${field('g-bf', 'Target body fat (%)', g.bf, 'e.g. 15')}
      ${field('g-sleep', 'Sleep per night (h)', g.sleep, 'e.g. 7.5')}
      ${field('g-eat', 'Calories eaten / day', g.eat, 'e.g. 2200', 'numeric')}
      ${field('g-volume', 'Lifting volume / week (kg)', g.volume, 'e.g. 15000', 'numeric')}
      <div><label class="field-label" for="g-cardio">Cardio / week</label><div class="row" style="gap:6px"><input id="g-cardio" type="text" inputmode="numeric" value="${esc(g.cardio ?? '')}" placeholder="e.g. 150"><select id="g-cardioUnit" style="width:84px;flex:none;padding:10px 6px">${opt('min', 'min', g.cardioUnit || 'min')}${opt('kcal', 'kcal', g.cardioUnit)}</select></div></div>
    </div>
    <button class="btn primary block" data-act="save-goals">Save goals</button>
  </div>

  <div class="sec-title"><h2>Profile</h2></div>
  <div class="card stack">
    <div class="tiny muted">Used to estimate calories burned (resting metabolism and the heart-rate formula). Stored only on this phone.</div>
    <div class="grid2">
      <div><label class="field-label" for="p-sex">Sex</label><select id="p-sex">${opt('', '—', s.sex)}${opt('m', 'Male', s.sex)}${opt('f', 'Female', s.sex)}</select></div>
      ${field('p-year', 'Birth year', s.birthYear, 'e.g. 1988', 'numeric')}
      ${field('p-height', 'Height (cm)', s.heightCm, 'e.g. 178', 'numeric')}
      ${field('p-defkg', 'Weight if none logged (kg)', s.defaultKg, '75')}
    </div>
    <div><label class="field-label" for="p-act">Daily activity (not counting logged workouts)</label><select id="p-act">
      ${opt(1.2, 'Mostly sitting (desk job)', s.activity)}${opt(1.375, 'Lightly active (on your feet part of the day)', s.activity)}${opt(1.55, 'Active (on your feet most of the day)', s.activity)}${opt(1.725, 'Very active (physical job)', s.activity)}</select></div>
    <button class="btn primary block" data-act="save-profile">Save profile</button>
    <div class="tiny muted">Cardio calories use MET × weight × time, or your average heart rate when you enter it (and sex and birth year are set). You can always type your own number instead.</div>
  </div>

  <div class="sec-title"><h2>App lock</h2>${appLock ? '<span class="tiny" style="color:var(--good)">on</span>' : ''}</div>
  <div class="card stack">
    ${appLock ? `<div class="small muted">Your data on this phone is encrypted (AES-256). FitTrack asks for your ${appLock.pin === 'num' ? 'PIN' : 'passphrase'} when opened and after 5 minutes in the background.</div>
      <div class="btn-row"><button class="btn" data-act="lock-now">Lock now</button><button class="btn danger" data-act="lock-off">Turn off</button></div>`
    : `<div class="small muted">Encrypt your data on this phone with a PIN or passphrase. Use at least 6 digits; a longer passphrase is stronger. <b>If you forget it, the data can't be recovered</b>, so keep a backup.</div>
      <div class="grid2">${pwField('lk-1', 'New PIN / passphrase')}${pwField('lk-2', 'Repeat it')}</div>
      <button class="btn primary block" data-act="lock-on">Turn on app lock</button>`}
  </div>

  <div class="sec-title"><h2>Backup</h2></div>
  <div class="card stack">
    <div class="small muted">Your data is stored only on this phone. Export a backup regularly (and before changing phones or clearing browser data). Last backup: <b>${lb ? fmtLong(lb.slice(0, 10)) : 'never'}</b>.</div>
    <div>${pwField('bk-pass', 'Backup password (recommended)', 'new-password')}<div class="field-hint">With a password the backup file is encrypted. You'll need it to restore. The CSV export is never encrypted.</div></div>
    ${canShare ? `<button class="btn primary block" data-act="share-json">Share backup (Drive, email…)</button>` : ''}
    <button class="btn ${canShare ? '' : 'primary'} block" data-act="export-json">Download backup (.json)</button>
    <button class="btn block" data-act="export-csv">Export spreadsheet (.csv)</button>
    <button class="btn block" data-act="import">Restore from backup…</button>
  </div>
  <div class="sec-title"><h2>Data</h2></div>
  <div class="card">
    <div class="list-row"><span class="grow">Weigh-ins · body fat entries</span><b class="num">${keysOf('kg').length} · ${keysOf('bf').length}</b></div>
    <div class="list-row"><span class="grow">Nights of sleep · food days</span><b class="num">${keysOf('sleep').length} · ${keysOf('eat').length}</b></div>
    <div class="list-row"><span class="grow">Cardio sessions</span><b class="num">${db.cardio.length}</b></div>
    <div class="list-row"><span class="grow">Exercise entries</span><b class="num">${db.lifts.length}</b></div>
    <div class="list-row"><span class="grow">Custom exercises · templates</span><b class="num">${db.custom.filter(e => !e.hidden).length} · ${db.templates.length}</b></div>
  </div>
  <button class="btn danger block" data-act="wipe">Delete all data</button>
  <p class="tiny muted" style="text-align:center;margin-top:16px">FitTrack · works offline · MET values from the Compendium of Physical Activities</p>`;
}
const pwField = (id, label, ac = 'new-password') =>
  `<div><label class="field-label" for="${id}">${label}</label><input id="${id}" type="password" autocomplete="${ac}"></div>`;
// Backup file text, encrypted when a backup password is entered
async function backupText() {
  const pass = $('#bk-pass') ? $('#bk-pass').value : '';
  const exported = new Date().toISOString();
  const plain = JSON.stringify({app: 'fittrack', exported, ...db}, null, 1);
  if (!pass) return plain;
  if (pass.length < 8) throw new Error('Backup password must be at least 8 characters');
  if (!cryptoOk()) throw new Error('Encryption needs the app to be opened over HTTPS');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return JSON.stringify({app: 'fittrack', exported, ...(await seal(await deriveKey(pass, salt), salt, plain))});
}
function restoreBackup(d) {
  if (isSealed(d)) {
    return sheet('Encrypted backup', `<div class="small muted" style="margin-bottom:10px">This backup is password-protected.</div>${pwField('ip', 'Backup password', 'current-password')}<div class="err" id="ipErr" style="margin-top:6px"></div>`,
      `<button class="btn primary" id="ipOk">Decrypt</button>`, p => {
      const go = async () => {
        $('#ipErr', p).textContent = 'Decrypting…';
        try {
          const inner = JSON.parse(await unseal(await deriveKey($('#ip', p).value, unb64(d.salt), d.iter), d));
          closeSheet(); restoreBackup(inner);
        } catch (e) { $('#ipErr', p).textContent = 'Wrong password'; }
      };
      $('#ipOk', p).onclick = go;
      $('#ip', p).addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      setTimeout(() => $('#ip', p).focus(), 50);
    });
  }
  if (!d || !Array.isArray(d.lifts) || !Array.isArray(d.cardio) || (typeof d.days !== 'object' && typeof d.weights !== 'object')) return toast('That file is not a FitTrack backup');
  const n = normalize(d);
  const when = typeof d.exported === 'string' && isDate(d.exported.slice(0, 10)) ? fmtLong(d.exported.slice(0, 10)) : 'file';
  if (!confirm(`Restore backup from ${when}?\n${Object.keys(n.days).length} days of body/sleep/food data, ${n.cardio.length} cardio, ${n.lifts.length} exercise entries.\nThis REPLACES the data currently on this phone.`)) return;
  db = n; save(); render(); toast('Backup restored');
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function markBackup() { db.settings.lastBackup = new Date().toISOString(); save(); render(); }
function csvExport() {
  // A leading ' stops spreadsheets from running text such as "=HYPERLINK(...)" as a formula
  const q = v => {
    let s = String(v ?? '');
    if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ['date', 'type', 'item', 'category', 'set', 'weight_kg', 'reps', 'minutes', 'distance_km', 'avg_hr', 'kcal', 'body_weight_kg', 'body_fat_pct', 'sleep_h', 'kcal_eaten'];
  const rows = [];
  const row = o => rows.push(head.map(h => o[h] ?? ''));
  for (const [k, d] of Object.entries(db.days)) row({date: k, type: 'daily', body_weight_kg: d.kg, body_fat_pct: d.bf, sleep_h: d.sleep, kcal_eaten: d.eat});
  for (const c of db.cardio) { const a = exById(c.act); row({date: c.date, type: 'cardio', item: a.name, category: a.group, minutes: c.min, distance_km: c.dist, avg_hr: c.hr, kcal: c.kcal}); }
  for (const l of db.lifts) { const e = exById(l.ex); l.sets.forEach((s, i) => row({date: l.date, type: 'strength', item: e.name, category: e.group, set: i + 1, weight_kg: s.kg, reps: s.reps})); }
  rows.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  download(new Blob(['﻿' + [head, ...rows].map(r => r.map(q).join(',')).join('\n')], {type: 'text/csv'}), `fittrack-${today()}.csv`);
}

/* ---------- install hints ---------- */
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (S.tab === 'log') render(); });
function installHint() {
  if (isStandalone()) return '';
  try { if (localStorage.getItem('fittrack.hideInstall')) return ''; } catch (e) {}
  const close = `<button class="icon-btn" data-act="hide-install" aria-label="Dismiss">${ICON.close}</button>`;
  if (installEvt) return `<div class="banner"><span class="grow">Install FitTrack on your home screen for quick, offline access.</span><button class="btn sm" data-act="install">Install</button>${close}</div>`;
  if (isIOS) return `<div class="banner"><span class="grow">To install on iPhone: tap <b>Share</b> → <b>Add to Home Screen</b>. Installed, it works offline and your data is kept more safely.</span>${close}</div>`;
  return '';
}

/* ---------- team (Supabase backend) ---------- */
// Only the nickname, team membership and the numbers switched on under "What you share" leave the phone.
const CFG = window.FITTRACK_CONFIG || {};
const teamOn = () => !!(CFG.supabaseUrl && CFG.supabaseKey);
const TEAM_STORE = 'fittrack.team';
let team = (() => { try { const t = JSON.parse(localStorage.getItem(TEAM_STORE)); return t && typeof t === 'object' ? t : {}; } catch (e) { return {}; } })();
const saveTeam = () => { try { localStorage.setItem(TEAM_STORE, JSON.stringify(team)); } catch (e) {} };
const RK = {info: null, metrics: [], rows: [], rowsKey: '', err: '', busy: false, at: 0};

class ApiError extends Error { constructor(msg, status) { super(msg); this.status = status; } }
async function sbFetch(path, {method = 'GET', body, auth = true} = {}) {
  const headers = {apikey: CFG.supabaseKey, 'Content-Type': 'application/json'};
  if (auth) headers.Authorization = 'Bearer ' + await accessToken();
  let res;
  try {
    res = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + path, {method, headers, body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer'});
  } catch (e) { throw new ApiError("Can't reach the team server. Are you offline?", 0); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) {}
  if (!res.ok) throw new ApiError((data && (data.message || data.msg || data.error_description || data.error)) || `Team server error (${res.status})`, res.status);
  return data;
}
function setSession(d) {
  team.session = {access_token: d.access_token, refresh_token: d.refresh_token, user: d.user && d.user.id,
    expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600)};
  saveTeam();
}
// The account is anonymous (no email or password) and lives on this phone.
let tokenPromise = null;
function accessToken() {
  const s = team.session;
  if (s && s.access_token && s.expires_at * 1000 > Date.now() + 60000) return Promise.resolve(s.access_token);
  return tokenPromise = tokenPromise || (async () => {
    try {
      if (s && s.refresh_token) {
        try { setSession(await sbFetch('/auth/v1/token?grant_type=refresh_token', {method: 'POST', body: {refresh_token: s.refresh_token}, auth: false})); }
        catch (e) {
          if (e.status >= 400 && e.status < 500) { team = {}; saveTeam(); throw new ApiError('Your team sign-in on this phone has expired. Please join the team again.', 401); }
          throw e;
        }
      } else {
        setSession(await sbFetch('/auth/v1/signup', {method: 'POST', body: {data: {}}, auth: false}));
      }
      return team.session.access_token;
    } finally { tokenPromise = null; }
  })();
}
const rpc = (fn, args = {}) => sbFetch('/rest/v1/rpc/' + fn, {method: 'POST', body: args});

const RK_PERIODS = [['tw', 'This week'], ['lw', 'Last week'], ['tm', 'This month'], ['lm', 'Last month'], ['all', 'All time']];
function periods() {
  const t = today(), w = weekStart(t), m0 = parseD(t.slice(0, 7) + '-01');
  const month = off => {
    const a = iso(new Date(m0.getFullYear(), m0.getMonth() + off, 1)), b = iso(new Date(m0.getFullYear(), m0.getMonth() + off + 1, 0));
    return {k: 'm' + a.slice(0, 7), from: a, to: b};
  };
  return {tw: {k: 'w' + w, from: w, to: addDays(w, 6)}, lw: {k: 'w' + addDays(w, -7), from: addDays(w, -7), to: addDays(w, -1)},
    tm: month(0), lm: month(-1), all: {k: 'all', from: '0000-01-01', to: '9999-12-31'}};
}
const r1 = v => Math.round(v * 10) / 10;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// % of the way to the goal: overall for "all", progress made within the period otherwise
function goalShare(f, p) {
  const target = db.goals[f], ks = keysOf(f);
  if (!(target > 0) || !ks.length) return null;
  const start = db.goals[f + 'Start'] != null ? db.goals[f + 'Start'] : db.days[ks[0]][f], dist = start - target;
  if (Math.abs(dist) < 0.1) return null;
  const inP = ks.filter(k => k >= p.from && k <= p.to);
  if (!inP.length) return null;
  const end = db.days[inP[inP.length - 1]][f];
  if (p.k === 'all') return (start - end) / dist * 100;
  const before = ks.filter(k => k < p.from).pop();
  if (!before && inP.length < 2) return null;
  return ((before ? db.days[before][f] : db.days[inP[0]][f]) - end) / dist * 100;
}
// The summary numbers this phone shares, for every ranking period
function computeScores() {
  const sh = db.settings.share, rows = [], setsBy = new Map(), cardBy = new Map();
  for (const l of db.lifts) setsBy.set(l.date, (setsBy.get(l.date) || 0) + l.sets.length);
  for (const c of db.cardio) cardBy.set(c.date, (cardBy.get(c.date) || 0) + c.kcal);
  const actDates = [...new Set([...setsBy.keys(), ...cardBy.keys()])].sort();
  for (const p of Object.values(periods())) {
    const inP = d => d >= p.from && d <= p.to;
    if (sh.lift) {
      const by = new Map();
      for (const l of db.lifts) if (LIB_MAP[l.ex] && l.ex[0] === 's' && inP(l.date)) for (const s of l.sets) if (s.kg > 0 && s.reps > 0) {
        const o = by.get(l.ex) || {rm: 0, vol: 0};
        o.rm = Math.max(o.rm, e1rm(s.kg, Math.min(s.reps, 20))); o.vol += s.kg * s.reps; by.set(l.ex, o);
      }
      for (const [ex, o] of by) rows.push({m: `ex:${ex}:1rm`, p: p.k, v: r1(clamp(o.rm, 0, 600))}, {m: `ex:${ex}:vol`, p: p.k, v: Math.round(clamp(o.vol, 0, 5e6))});
    }
    for (const f of ['kg', 'bf']) if (sh[f]) {
      const v = goalShare(f, p);
      if (v != null && isFinite(v)) rows.push({m: 'goal:' + f, p: p.k, v: r1(clamp(v, -1000, 1000))});
    }
    if (sh.out && actDates.length) {
      const from = p.k === 'all' ? actDates[0] : p.from, to = p.to < today() ? p.to : today();
      if (from <= to) {
        let k = 0;
        for (const d of actDates) if (d >= from && d <= to) k += (cardBy.get(d) || 0) + liftKcal(setsBy.get(d) || 0, bodyKgOn(d));
        rows.push({m: 'kcal:out', p: p.k, v: Math.round(clamp(k / (diffDays(from, to) + 1), 0, 10000))});
      }
    }
    if (sh.in) {
      const eats = keysOf('eat').filter(inP).map(k => db.days[k].eat);
      if (eats.length) {
        rows.push({m: 'kcal:in', p: p.k, v: Math.round(clamp(avg(eats), 0, 15000))});
        if (db.goals.eat > 0) rows.push({m: 'kcal:adh', p: p.k, v: r1(clamp(avg(eats.map(e => Math.abs(e - db.goals.eat) / db.goals.eat * 100)), 0, 1000))});
      }
    }
  }
  return rows;
}
let syncTimer = null;
function scheduleSync(delay = 4000) {
  if (!teamOn() || !team.team || lockBox) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncScores().catch(() => {}), delay);
}
async function syncScores(force) {
  if (!teamOn() || !team.team || lockBox) return;
  const rows = computeScores(), sig = JSON.stringify(rows);
  if (!force && sig === team.lastSig && Date.now() - (team.lastSync || 0) < 6 * 3600e3) return;
  try {
    await rpc('replace_my_scores', {p_rows: rows});
    team.lastSig = sig; team.lastSync = Date.now(); team.syncErr = ''; saveTeam();
  } catch (e) {
    team.syncErr = e.message;
    if (/not in a team/i.test(e.message)) team.team = null;
    saveTeam(); throw e;
  }
}

const RK_CATS = [['ex', 'Exercise'], ['kg', 'Weight goal'], ['bf', 'Body fat goal'], ['out', 'Calories burned'], ['in', 'Calories eaten']];
const SHARE_FOR = {ex: 'lift', kg: 'kg', bf: 'bf', out: 'out', in: 'in'};
const SHARE_INFO = {
  lift: ['Lifting', 'Best estimated 1-rep max and volume for built-in exercises'],
  kg: ['Weight goal progress', '% of the way to your weight goal — never your weight itself'],
  bf: ['Body fat goal progress', '% of the way to your body fat goal'],
  out: ['Calories burned', 'Average exercise calories per day (cardio + lifting)'],
  in: ['Calories eaten', 'Average per logged day, and how close you stay to your target'],
};
const rkExIds = () => RK.metrics.filter(m => /^ex:s-[a-z0-9-]+:1rm$/.test(m)).map(m => m.slice(3, -4))
  .sort((a, b) => exById(a).name.localeCompare(exById(b).name));
function rkMetric() {
  if (S.rkCat === 'ex') return S.rkEx ? `ex:${S.rkEx}:${S.rkMode}` : null;
  if (S.rkCat === 'kg' || S.rkCat === 'bf') return 'goal:' + S.rkCat;
  if (S.rkCat === 'out') return 'kcal:out';
  return S.rkEat === 'adh' ? 'kcal:adh' : 'kcal:in';
}
function rkMeta(m) {
  if (m.endsWith(':1rm')) return {unit: 'kg', dec: 1, dir: 1, what: 'best estimated 1-rep max'};
  if (m.endsWith(':vol')) return {unit: 'kg', dec: 0, dir: 1, what: 'total volume (weight × reps)'};
  if (m.startsWith('goal:')) return {unit: '%', dec: 0, dir: 1, signed: true, what: S.rkPeriod === 'all' ? '% of their own goal reached so far' : '% of their goal distance covered in this period'};
  if (m === 'kcal:out') return {unit: 'kcal/day', dec: 0, dir: 1, what: 'exercise calories burned per day'};
  if (m === 'kcal:adh') return {unit: '% off', dec: 0, dir: -1, what: 'average distance from their own daily calorie target (lower is better)'};
  return {unit: 'kcal/day', dec: 0, dir: 0, what: 'average calories eaten per logged day'};
}
const rerank = () => { if (S.tab === 'rank') render(); };
async function loadTeam() {
  if (!teamOn() || !team.session) return;
  RK.busy = true; rerank();
  try {
    const info = await rpc('my_team');
    RK.info = info;
    team.team = info ? {id: info.id, name: info.name} : null; saveTeam();
    if (info) {
      await syncScores().catch(() => {});
      RK.metrics = (await rpc('team_metrics')) || [];
      const ids = rkExIds();
      if (!ids.includes(S.rkEx)) S.rkEx = ids[0] || null;
      await loadScores(false);
    }
    RK.err = '';
  } catch (e) { RK.err = e.message; }
  RK.busy = false; RK.at = Date.now(); rerank();
}
async function loadScores(redraw = true) {
  const m = rkMetric(), key = m + '|' + periods()[S.rkPeriod].k;
  try {
    RK.rows = m ? (await rpc('team_scores', {p_metric: m, p_period: periods()[S.rkPeriod].k})) || [] : [];
    RK.rowsKey = key; RK.err = '';
  } catch (e) { RK.err = e.message; }
  if (redraw) rerank();
}
let teamBusy = false;
async function teamAction(fn) {
  if (teamBusy) return;
  teamBusy = true;
  try { await fn(); } catch (e) { toast(e.message); } finally { teamBusy = false; }
}
function afterJoin(info, msg) {
  RK.info = info; team.team = {id: info.id, name: info.name}; S.joinCode = ''; saveTeam();
  toast(msg); render(); loadTeam();
}
const fmtCode = c => String(c).replace(/(.{5})(?=.)/g, '$1-');
const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };

function viewRanking() {
  if (!teamOn()) return `<div class="card"><div class="empty">Team features aren't set up in this copy of FitTrack.</div></div>`;
  if (!team.team) return viewJoin();
  const info = RK.info;
  let h = RK.err ? `<div class="banner"><span class="grow">${esc(RK.err)}</span><button class="btn sm" data-act="rk-refresh">Retry</button></div>` : '';
  if (!info) return h + `<div class="card"><div class="empty">${RK.busy ? 'Loading your team…' : 'Your team hasn\'t loaded yet.'}</div><button class="btn block" data-act="rk-refresh">Refresh</button></div>`;
  h += `<div class="chips" style="margin-bottom:8px">${RK_CATS.map(([k, l]) => `<button class="chip ${S.rkCat === k ? 'on' : ''}" data-act="rk-cat" data-k="${k}">${l}</button>`).join('')}</div>`;
  if (S.rkCat === 'ex') {
    const ids = rkExIds();
    if (ids.length) h += `<select id="rkEx" aria-label="Exercise" style="margin-bottom:8px">${ids.map(id => `<option value="${esc(id)}" ${id === S.rkEx ? 'selected' : ''}>${esc(exById(id).name)}</option>`).join('')}</select>
      <div class="chips" style="margin-bottom:8px">${[['1rm', 'Est. 1-rep max'], ['vol', 'Volume']].map(([k, l]) => `<button class="chip ${S.rkMode === k ? 'on' : ''}" data-act="rk-mode" data-k="${k}">${l}</button>`).join('')}</div>`;
  }
  if (S.rkCat === 'in') h += `<div class="chips" style="margin-bottom:8px">${[['adh', 'Closest to own target'], ['in', 'Daily average']].map(([k, l]) => `<button class="chip ${S.rkEat === k ? 'on' : ''}" data-act="rk-eat" data-k="${k}">${l}</button>`).join('')}</div>`;
  h += `<div class="chips" style="margin-bottom:12px">${RK_PERIODS.map(([k, l]) => `<button class="chip ${S.rkPeriod === k ? 'on' : ''}" data-act="rk-period" data-k="${k}">${l}</button>`).join('')}</div>`;
  h += rankBoard(info) + sharingCard() + teamCard(info);
  return h;
}
function rankBoard(info) {
  const m = rkMetric();
  const sharing = db.settings.share[SHARE_FOR[S.rkCat]];
  const notMe = sharing ? 'You have nothing to share for this period yet.' : `You're not sharing ${SHARE_INFO[SHARE_FOR[S.rkCat]][0].toLowerCase()} — switch it on under “What you share”.`;
  if (!m) return `<div class="card"><div class="empty">Nobody in the team is sharing lifting results yet.<br>${sharing ? '' : notMe}</div></div>`;
  if (RK.rowsKey !== m + '|' + periods()[S.rkPeriod].k) return `<div class="card"><div class="empty">Loading…</div></div>`;
  const meta = rkMeta(m), rows = [...RK.rows].sort((a, b) => meta.dir < 0 ? a.value - b.value : b.value - a.value);
  if (!rows.length) return `<div class="card"><div class="empty">Nobody has shared this for this period yet.<br>${notMe}</div></div>`;
  const fv = v => `${meta.signed && v > 0 ? '+' : ''}${fmt(v, meta.dec)} ${meta.unit}`;
  const av = avg(rows.map(r => r.value)), top = Math.max(...rows.map(r => r.value), av, 0) || 1;
  const pct = v => clamp(Math.max(0, v) / top * 100, 0, 100).toFixed(1);
  const mine = rows.findIndex(r => r.user_id === info.me), lead = rows[0];
  const you = r => r.user_id === info.me ? ' <span class="muted">(you)</span>' : '';
  let h = `<div class="card"><div class="row" style="align-items:flex-start;gap:12px">
      <div class="grow"><div class="tiny muted">${meta.dir === 0 ? 'Highest' : 'In the lead'}</div><div style="font-size:22px;font-weight:700;overflow-wrap:anywhere">${esc(lead.nickname)}${you(lead)}</div><div class="small num">${fv(lead.value)}</div></div>
      <div style="text-align:right"><div class="tiny muted">Team average</div><div style="font-size:18px;font-weight:700" class="num">${fv(av)}</div><div class="tiny muted">${rows.length} ${rows.length === 1 ? 'person' : 'people'}</div></div></div>
    <div class="small" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">${mine >= 0 ? `You: <b>#${mine + 1}</b> of ${rows.length} · ${signed(rows[mine].value - av, meta.dec)} ${meta.unit} vs average` : notMe}</div>
    <div class="tiny muted" style="margin-top:4px">Ranked by ${meta.what}.</div></div>`;
  h += `<div class="card" style="padding:4px 14px">` + rows.map((r, i) => `<div class="rk-row${r.user_id === info.me ? ' me' : ''}"><span class="rk-pos">${i + 1}</span><span class="rk-name">${esc(r.nickname)}${you(r)}</span><span class="rk-val">${fv(r.value)}</span><div class="rk-bar"><i style="width:${pct(r.value)}%"></i><b style="left:${pct(av)}%"></b></div></div>`).join('')
    + `</div><div class="tiny muted" style="margin:-4px 2px 12px">The line on each bar marks the team average.</div>`;
  return h;
}
function sharingCard() {
  const sh = db.settings.share, any = SHARE_KEYS.some(k => sh[k]);
  const status = team.syncErr ? `not shared: ${esc(team.syncErr)}` : team.lastSync ? `updated ${ago(team.lastSync)}` : 'nothing shared yet';
  const need = {kg: !(db.goals.kg > 0) && 'set a weight goal in Settings', bf: !(db.goals.bf > 0) && 'set a body fat goal in Settings', in: !(db.goals.eat > 0) && 'the target comparison needs a calorie goal'};
  return `<div class="sec-title"><h2>What you share</h2><span class="tiny muted">${status}</span></div>
    <div class="card" style="padding:2px 14px">${SHARE_KEYS.map(k => `<button class="toggle${sh[k] ? ' on' : ''}" data-act="share" data-k="${k}" role="switch" aria-checked="${sh[k]}">
      <span class="switch"></span><span class="grow"><span style="font-weight:600;display:block">${SHARE_INFO[k][0]}</span><span class="small muted">${SHARE_INFO[k][1]}${need[k] ? ` (${need[k]})` : ''}</span></span></button>`).join('')}</div>
    <div class="tiny muted" style="margin:-4px 2px 4px">Off by default. Only these summary numbers are sent; your logs stay on this phone. Turning one off deletes it from the server.</div>
    ${any ? `<button class="btn sm" style="margin:6px 0 4px" data-act="rk-sync">Share now</button>` : ''}`;
}
function teamCard(info) {
  const owner = info.role === 'owner';
  return `<div class="sec-title"><h2>Team</h2><button class="btn sm" data-act="rk-refresh">${RK.busy ? 'Refreshing…' : 'Refresh'}</button></div>
    <div class="card stack">
      <div><div style="font-weight:700;font-size:17px">${esc(info.name)}</div><div class="tiny muted">You are ${esc(info.nickname)}${owner ? ' · owner' : ''}${RK.at ? ` · loaded ${ago(RK.at)}` : ''}</div></div>
      <div><div class="tiny muted">Invite code</div><div class="row"><span class="code grow">${esc(fmtCode(info.invite_code))}</span><button class="btn sm primary" data-act="rk-invite">Invite</button></div></div>
      <div>${(info.members || []).map(x => `<div class="list-row"><span class="grow">${esc(x.nickname)}${x.user_id === info.me ? ' <span class="muted">(you)</span>' : ''}${x.role === 'owner' ? ' <span class="badge">owner</span>' : ''}</span>${owner && x.user_id !== info.me ? `<button class="btn sm danger" data-act="rk-remove" data-id="${esc(x.user_id)}" data-n="${esc(x.nickname)}">Remove</button>` : ''}</div>`).join('')}</div>
      <div class="btn-row"><button class="btn sm" data-act="rk-nick">Change nickname</button>${owner ? '<button class="btn sm" data-act="rk-code">New invite code</button>' : ''}<button class="btn sm" data-act="rk-leave">Leave team</button></div>
      <div class="tiny muted">Your team account has no email or password and lives only on this phone. If you clear the browser's data or change phones, join again with a new nickname; ${owner ? 'you' : 'the owner'} can remove the old one.</div>
      <button class="btn sm danger" data-act="rk-delete">Delete my team account</button>
    </div>`;
}
function viewJoin() {
  return `<div class="card"><div style="font-weight:700;font-size:17px">Compare with your team</div>
      <div class="small muted" style="margin-top:6px">See who's in the lead on lifts, weight goals and calories, and how you compare with the team average. No email or password: you just pick a nickname, and only the numbers you switch on leave this phone.</div></div>
    <div class="sec-title"><h2>Join a team</h2></div>
    <div class="card stack">${field('j-code', 'Invite code', S.joinCode, 'e.g. A1B2C-D3E4F', 'text')}${field('j-nick', 'Your nickname', '', '2–20 characters', 'text')}
      <button class="btn primary block" data-act="rk-join">Join team</button></div>
    <div class="sec-title"><h2>Or start a new team</h2></div>
    <div class="card stack">${field('c-name', 'Team name', '', 'e.g. Morning crew', 'text')}${field('c-nick', 'Your nickname', '', '2–20 characters', 'text')}
      <button class="btn block" data-act="rk-create">Create team</button></div>
    <div class="tiny muted">Your team account lives only on this phone. If you clear the browser's data or change phones, you'll join again with a new nickname.</div>`;
}
function bindRanking() {
  $('#rkEx')?.addEventListener('change', e => { S.rkEx = e.target.value; render(); loadScores(); });
}

/* ---------- actions ---------- */
const ACT = {
  'close-sheet': () => closeSheet(),
  tab: t => {
    S.tab = t.dataset.tab; render(); window.scrollTo(0, 0);
    if (S.tab === 'rank' && team.team && !RK.busy && Date.now() - RK.at > 30000) loadTeam();
  },
  install: () => { if (!installEvt) return; installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; render(); }); },
  'hide-install': () => { try { localStorage.setItem('fittrack.hideInstall', '1'); } catch (e) {} render(); },
  'rk-join': () => teamAction(async () => afterJoin(await rpc('join_team', {p_code: $('#j-code').value, p_nickname: $('#j-nick').value}), 'Welcome to the team!')),
  'rk-create': () => teamAction(async () => afterJoin(await rpc('create_team', {p_name: $('#c-name').value, p_nickname: $('#c-nick').value}), 'Team created — now invite your friends')),
  'rk-refresh': () => loadTeam(),
  'rk-cat': t => { S.rkCat = t.dataset.k; render(); loadScores(); },
  'rk-mode': t => { S.rkMode = t.dataset.k; render(); loadScores(); },
  'rk-eat': t => { S.rkEat = t.dataset.k; render(); loadScores(); },
  'rk-period': t => { S.rkPeriod = t.dataset.k; render(); loadScores(); },
  share: t => {
    const k = t.dataset.k;
    db.settings.share[k] = !db.settings.share[k]; save(); render();
    teamAction(async () => { await syncScores(true); await loadTeam(); });
  },
  'rk-sync': () => teamAction(async () => { await syncScores(true); await loadTeam(); toast('Shared'); }),
  'rk-invite': () => {
    const info = RK.info, link = location.origin + location.pathname + '#join=' + info.invite_code;
    const text = `Join my FitTrack team "${info.name}": ${link}\nInvite code: ${fmtCode(info.invite_code)}`;
    if (navigator.share) navigator.share({title: 'FitTrack team invite', text}).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => toast('Invite copied'), () => toast('Code: ' + fmtCode(info.invite_code)));
  },
  'rk-code': () => {
    if (!confirm('Make a new invite code? The old code and links stop working.')) return;
    teamAction(async () => { RK.info = await rpc('new_invite_code'); render(); toast('New invite code ready'); });
  },
  'rk-remove': t => {
    if (!confirm(`Remove ${t.dataset.n} from the team? Their shared results are deleted.`)) return;
    teamAction(async () => { RK.info = await rpc('remove_member', {p_user: t.dataset.id}); await loadTeam(); toast('Removed'); });
  },
  'rk-nick': () => sheet('Change nickname', field('n-nick', 'New nickname', RK.info ? RK.info.nickname : '', '2–20 characters', 'text'), `<button class="btn primary" id="nOk">Save</button>`, p => {
    $('#nOk', p).onclick = () => teamAction(async () => { RK.info = await rpc('set_nickname', {p_nickname: $('#n-nick', p).value}); closeSheet(); render(); toast('Nickname changed'); });
  }),
  'rk-leave': () => {
    if (!confirm('Leave the team? Your shared results are deleted from the server.')) return;
    teamAction(async () => { await rpc('leave_team'); team.team = null; team.lastSig = ''; saveTeam(); RK.info = null; render(); toast('You left the team'); });
  },
  'rk-delete': () => {
    if (!confirm('Delete your team account? You leave the team and everything the server stores about you is deleted. Your own logs on this phone are not affected.')) return;
    teamAction(async () => { await rpc('delete_me'); team = {}; saveTeam(); RK.info = null; render(); toast('Team account deleted'); });
  },
  day: t => { S.date = addDays(S.date, +t.dataset.d); render(); },
  step: t => {
    const inp = document.getElementById(t.dataset.target);
    const d = +t.dataset.d, cur = num(inp.value);
    const v = isFinite(cur) ? cur + d : (num(inp.dataset.base) || 0);
    inp.value = Math.max(0, Math.round(v * 100) / 100);
    inp.dispatchEvent(new Event('input', {bubbles: true}));
  },
  'save-daily': () => {
    const out = {};
    for (const [f, c] of Object.entries(DAILY)) {
      const raw = $('#d-' + f).value.trim();
      if (!raw) continue;
      const v = num(raw);
      if (!(v >= c.min && v <= c.max)) return toast(`${c.label}: enter a value between ${c.min} and ${c.max}`);
      out[f] = f === 'eat' ? Math.round(v) : Math.round(v * 100) / 100;
    }
    if (Object.keys(out).length) db.days[S.date] = out; else delete db.days[S.date];
    save(); render(); toast(Object.keys(out).length ? 'Saved' : 'Cleared');
  },
  'add-cardio': () => cardioForm(null),
  'edit-cardio': t => cardioForm(db.cardio.find(c => c.id === t.dataset.id)),
  'add-ex': () => pickerSheet('s', 'Add exercise', id => {
    const l = addExercise(id); save(); closeSheet(); render();
    setTimeout(() => $(`[data-entry="${esc(l.id)}"]`)?.scrollIntoView({behavior: 'smooth', block: 'center'}), 60);
  }),
  'add-set': t => {
    const id = t.dataset.id, l = db.lifts.find(x => x.id === id), ex = exById(l.ex);
    const kg = num($('#kg-' + id).value), reps = num($('#reps-' + id).value);
    if (!(reps > 0)) return toast(ex.sec ? 'Enter seconds' : 'Enter reps');
    const k = kg > 0 ? Math.round(kg * 100) / 100 : 0;
    const prev = maxKgBefore(l.ex, l.id, l.sets.length), hadHistory = db.lifts.some(x => x.ex === l.ex && x.id !== l.id && x.sets.length) || l.sets.length;
    l.sets.push({kg: k, reps: Math.round(reps)}); save(); render();
    if (k > 0 && k > prev && hadHistory) toast(`New personal record: ${fmt(k, 2)} kg!`, true); else toast(`Set ${l.sets.length} added`);
  },
  'edit-set': t => {
    const l = db.lifts.find(x => x.id === t.dataset.id), i = +t.dataset.i, s = l.sets[i], ex = exById(l.ex);
    sheet(`${ex.name} · set ${i + 1}`, `<div class="stack">${stepper('ekg', s.kg, 2.5, ex.bw ? 'Added kg' : 'Weight (kg)')}${stepper('ereps', s.reps, ex.sec ? 5 : 1, ex.sec ? 'Seconds' : 'Reps')}</div>`,
      `<button class="btn danger" id="sdel">Delete set</button><button class="btn primary" id="ssave">Save</button>`, p => {
      $('#ssave', p).onclick = () => {
        const kg = num($('#ekg', p).value), reps = num($('#ereps', p).value);
        if (!(reps > 0)) return toast('Enter reps');
        l.sets[i] = {kg: kg > 0 ? Math.round(kg * 100) / 100 : 0, reps: Math.round(reps)}; save(); closeSheet(); render();
      };
      $('#sdel', p).onclick = () => { l.sets.splice(i, 1); save(); closeSheet(); render(); };
    });
  },
  'del-entry': t => {
    const l = db.lifts.find(x => x.id === t.dataset.id);
    if (l.sets.length && !confirm(`Remove ${exById(l.ex).name} and its ${l.sets.length} set(s) from this day?`)) return;
    db.lifts = db.lifts.filter(x => x.id !== l.id); save(); render();
  },
  'load-tpl': () => {
    if (!db.templates.length) return sheet('Templates', `<div class="empty">No templates yet. Create one in Exercises → Templates, or log some exercises and tap “Save these exercises as a template”.</div>`, `<button class="btn primary" id="gotpl">Create a template</button>`, p => {
      $('#gotpl', p).onclick = () => { closeSheet(); S.tab = 'lib'; S.libTab = 't'; render(); };
    });
    sheet('Load template', db.templates.map(t => `<button class="list-row" data-t="${esc(t.id)}"><div class="grow"><div class="t">${esc(t.name)}</div><div class="s">${t.ex.map(id => esc(exById(id).name)).join(' · ')}</div></div></button>`).join(''), '', p => {
      p.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (!b) return;
        const t = db.templates.find(x => x.id === b.dataset.t); t.ex.forEach(id => addExercise(id)); save(); closeSheet(); render(); toast(`${t.name} loaded`); });
    });
  },
  repeat: () => {
    const by = {};
    for (const l of db.lifts) if (l.date !== S.date && l.sets.length) (by[l.date] = by[l.date] || []).push(l);
    const dates = Object.keys(by).sort().reverse().slice(0, 30);
    if (!dates.length) return sheet('Repeat a past workout', `<div class="empty">No past workouts yet.</div>`);
    sheet('Repeat a past workout', `<div class="small muted" style="margin-bottom:6px">Adds the same exercises to ${S.date === today() ? 'today' : fmtD(S.date)}. Each one starts from that day's weights.</div>` +
      dates.map(d => `<button class="list-row" data-d="${esc(d)}"><div class="grow"><div class="t">${fmtD(d, {weekday: 'short', month: 'short', day: 'numeric'})}</div><div class="s">${by[d].map(l => esc(exById(l.ex).name)).join(' · ')}</div></div><div class="r small muted">${sum(by[d], l => l.sets.length)} sets</div></button>`).join(''), '', p => {
      p.classList.add('tall');
      p.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return;
        by[b.dataset.d].forEach(l => addExercise(l.ex)); save(); closeSheet(); render(); toast(`Workout from ${fmtD(b.dataset.d)} added`); });
    });
  },
  'save-tpl': () => {
    const ids = db.lifts.filter(l => l.date === S.date).map(l => l.ex);
    sheet('Save as template', `<label class="field-label" for="tn">Template name</label><input id="tn" placeholder="e.g. Leg day" autocomplete="off"><div class="small muted" style="margin-top:10px">${ids.map(id => esc(exById(id).name)).join(' · ')}</div>`,
      `<button class="btn primary" id="tok">Save</button>`, p => {
      $('#tok', p).onclick = () => { const n = $('#tn', p).value.trim(); if (!n) return toast('Enter a name');
        db.templates.push({id: uid(), name: n, ex: ids}); save(); closeSheet(); toast('Template saved'); };
    });
  },
  range: t => { S.range = t.dataset.r; render(); },
  metric: t => { S.metric = t.dataset.m; render(); },
  cmetric: t => { S.cardioMetric = t.dataset.m; render(); },
  'edit-goals': () => { S.tab = 'settings'; render(); $('#goals-form')?.scrollIntoView({block: 'start'}); },
  'lib-tab': t => { S.libTab = t.dataset.k; S.libQ = ''; render(); },
  'ex-info': t => exInfo(t.dataset.id),
  'add-custom': () => customForm(),
  'tpl-new': () => templateEditor(null),
  'tpl-edit': t => templateEditor(db.templates.find(x => x.id === t.dataset.id)),
  'save-goals': () => {
    const lim = {kg: [20, 400], bf: [2, 70], sleep: [3, 14], eat: [500, 10000], volume: [1, 1e7], cardio: [1, 1e5]};
    const g = {...db.goals};
    for (const [k, [lo, hi]] of Object.entries(lim)) {
      const raw = $('#g-' + k).value.trim();
      if (!raw) { delete g[k]; delete g[k + 'Start']; continue; }
      const v = num(raw);
      if (!(v >= lo && v <= hi)) return toast(`Check the ${k === 'kg' ? 'weight' : k === 'bf' ? 'body fat' : k} goal (${lo}–${hi})`);
      if ((k === 'kg' || k === 'bf') && v !== db.goals[k]) {
        const lk = keysOf(k);
        if (lk.length) g[k + 'Start'] = db.days[lk[lk.length - 1]][k]; else delete g[k + 'Start'];
      }
      g[k] = v;
    }
    g.cardioUnit = $('#g-cardioUnit').value;
    db.goals = g; save(); render(); toast('Goals saved');
  },
  'save-profile': () => {
    const s = db.settings, year = num($('#p-year').value), h = num($('#p-height').value), dk = num($('#p-defkg').value);
    const thisYear = new Date().getFullYear();
    if ($('#p-year').value.trim() && !(year > thisYear - 100 && year < thisYear - 10)) return toast('Check the birth year');
    if ($('#p-height').value.trim() && !(h >= 100 && h <= 250)) return toast('Height should be in cm (100–250)');
    if (!(dk > 20 && dk < 400)) return toast('Enter a weight in kg');
    s.sex = $('#p-sex').value; s.birthYear = year || null; s.heightCm = h || null; s.defaultKg = dk; s.activity = +$('#p-act').value;
    save(); render(); toast('Profile saved');
  },
  'export-json': async () => {
    let text;
    try { text = await backupText(); } catch (e) { return toast(e.message); }
    download(new Blob([text], {type: 'application/json'}), `fittrack-backup-${today()}.json`); markBackup(); toast('Backup downloaded');
  },
  'share-json': async () => {
    let text;
    try { text = await backupText(); } catch (e) { return toast(e.message); }
    const f = new File([text], `fittrack-backup-${today()}.json`, {type: 'application/json'});
    try { await navigator.share({files: [f], title: 'FitTrack backup'}); markBackup(); toast('Backup shared'); }
    catch (e) { if (e.name !== 'AbortError') toast('Sharing failed — use Download instead'); }
  },
  'lock-on': async () => {
    const a = $('#lk-1').value, b = $('#lk-2').value;
    if (!cryptoOk()) return toast('App lock needs the app to be opened over HTTPS');
    if (a.length < 6) return toast('Use at least 6 characters');
    if (a !== b) return toast("The two entries don't match");
    toast('Encrypting…');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    appLock = {key: await deriveKey(a, salt), salt, pin: /^\d+$/.test(a) ? 'num' : 'text'};
    save(); render(); toast('App lock is on');
  },
  'lock-now': () => { writeChain.then(() => location.reload()); },
  'lock-off': () => sheet('Turn off app lock', `<div class="small muted" style="margin-bottom:10px">Your data will be stored unencrypted on this phone again.</div>${pwField('lo', 'Current PIN / passphrase', 'current-password')}<div class="err" id="loErr" style="margin-top:6px"></div>`,
    `<button class="btn danger" id="loOk">Turn off</button>`, p => {
    $('#loOk', p).onclick = async () => {
      $('#loErr', p).textContent = 'Checking…';
      try {
        await writeChain;
        const box = JSON.parse(localStorage.getItem(STORE));
        await unseal(await deriveKey($('#lo', p).value, unb64(box.salt), box.iter), box);
        appLock = null; save(); closeSheet(); render(); toast('App lock is off');
      } catch (e) { $('#loErr', p).textContent = 'Wrong PIN'; }
    };
  }),
  'export-csv': () => { csvExport(); toast('CSV exported'); },
  import: () => $('#importFile').click(),
  wipe: () => {
    if (!confirm('Delete ALL your FitTrack data from this phone? This cannot be undone.')) return;
    if (!confirm('Are you sure? Consider downloading a backup first.')) return;
    db = blank(); save(); render(); toast('All data deleted');
  },
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (t && ACT[t.dataset.act]) ACT[t.dataset.act](t, e);
});
// Enter in the weight/reps boxes adds the set
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const m = e.target.id && e.target.id.match(/^(kg|reps)-(.+)$/);
  if (m) { e.preventDefault(); $(`[data-act="add-set"][data-id="${m[2]}"]`)?.click(); }
});
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  if (f.size > 20e6) return toast('That file is too large to be a FitTrack backup');
  let d;
  try { d = JSON.parse(await f.text()); } catch (err) { return toast('That file is not a FitTrack backup'); }
  restoreBackup(d);
});

/* ---------- boot ---------- */
const AUTO_LOCK_MS = 5 * 60 * 1000;
let lastToday = today(), hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') { hiddenAt = Date.now(); return; }
  if (appLock && hiddenAt && Date.now() - hiddenAt > AUTO_LOCK_MS) { writeChain.then(() => location.reload()); return; }
  scheduleSync(1500);
  const t = today();
  if (t !== lastToday) { if (S.date === lastToday) S.date = t; lastToday = t; render(); }
});
// Invite links look like …/fittrack/#join=CODE
const hashJoin = /^#join=([A-Za-z0-9-]{4,24})$/.exec(location.hash);
if (hashJoin) { S.joinCode = hashJoin[1]; S.tab = 'rank'; history.replaceState(null, '', location.pathname + location.search); }
render();
if (lockBox) showLock();
else if (team.team) { scheduleSync(2000); if (S.tab === 'rank') loadTeam(); }
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
