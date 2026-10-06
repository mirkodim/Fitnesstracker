/* Trainings-Strichliste: screens, events, timers and the installable-app parts (service worker, update bar).
   Rules and data handling live in store.js, the exercises in lib.js, the ready-made trainings in trainings.js, the stick figures in fig.js and anims.js.
   The training screens (Meine Trainings, the part "Training" of Erstellen with its assistant) are in ui-flow.js, the exercise library in ui-lib.js.
   Both get the shared pieces of this file through the object A and add their screens and button handlers (A.acts). */
(function () {
  'use strict';

  var VERSION = (typeof APP_VERSION === 'string' && APP_VERSION) ? APP_VERSION : 'dev';
  var READY = 5;
  var CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV_L = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV_R = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEV_D = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5.5 9.5L12 16l6.5-6.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var EYE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var TRASH = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7M10.5 11v5.5M13.5 11v5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICONS = {
    mine: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    make: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    food: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8.5c0-1.5 1.5-1.5 1.5-3.5M14 8.5c0-1.5 1.5-1.5 1.5-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  /* Meine Trainings opens first. Erstellen holds the new training and the exercise library. */
  var TABS = [['mine', 'Meine Trainings'], ['make', 'Erstellen'], ['cal', 'Kalender'], ['food', 'Essen']];

  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  /* ---------- small helpers ---------- */
  var pad = Store.pad, todayKey = Store.todayKey, parseKey = Store.parseKey, addDays = Store.addDays;
  var num = Store.num, fmt = Store.fmt, numStr = Store.numStr;
  function noop() { /* ignore */ }
  function longDate(k) { var d = parseKey(k); return WDL[d.getDay()] + ', ' + d.getDate() + '. ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- state ---------- */
  var storageOK = true;
  try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); } catch (e) { storageOK = false; }
  var loaded = storageOK ? Store.load(localStorage) : { state: Store.newState(), status: 'unavailable' };
  var S = loaded.state;

  var now0 = new Date();
  /* runtime state, never stored */
  var R = {
    tab: 'mine', flow: 'home', mineRun: false, pv: null, detail: null, sel: [], lib: { g: null, all: false, q: '', mine: false, eq: false },
    rest: null, plank: null, fresh: null, confirm: false, last: null, pick: {}, demoOpen: false, calForm: false,
    cal: { y: now0.getFullYear(), m: now0.getMonth() }, calSel: todayKey(), calOpen: null, calUndo: null, calAdd: false,
    foodDate: todayKey(), draft: Store.newDraft('100'), foodMsg: '', foodGoto: null, undo: null, edit: null, copyOpen: false, editY: 0,
    bookOpen: false, bookQ: '', goalOpen: false, bkOpen: false, bkMsg: '', restore: null,
    upd: null, offlineReady: false, saveFailed: false, loadStatus: loaded.status
  };

  function save() {
    if (!storageOK) return;
    R.saveFailed = !Store.save(localStorage, S);
  }

  function refreshDays() {
    var reset = Store.refreshDays(S, todayKey());
    reset.forEach(function (k) { R.pick[k] = null; });
  }

  /* ---------- training helpers ---------- */
  function curTraining() {
    var t = Store.training(S, S.cur);
    if (!t) { S.cur = 'A'; t = Store.training(S, 'A'); }
    return t;
  }
  function doneSets(id, exId) { var m = S.sets[id]; return (m && Store.own(m, exId)) ? m[exId] : 0; }
  function isDone(t, ex) { return doneSets(t.id, ex.id) >= ex.sets; }
  function totals(t) {
    var done = 0, total = 0, exDone = 0;
    t.items.forEach(function (ex) {
      var n = Math.min(doneSets(t.id, ex.id), ex.sets);
      done += n; total += ex.sets;
      if (n >= ex.sets) exDone++;
    });
    return { done: done, total: total, exDone: exDone, exTotal: t.items.length };
  }
  function currentEx(t) {
    var list = t.items, p = R.pick[t.id], i;
    if (p) { for (i = 0; i < list.length; i++) { if (list[i].id === p && !isDone(t, list[i])) return list[i]; } }
    for (i = 0; i < list.length; i++) { if (!isDone(t, list[i])) return list[i]; }
    return null;
  }
  function findEx(t, id) { for (var i = 0; i < t.items.length; i++) { if (t.items[i].id === id) return t.items[i]; } return null; }
  function holdOf(ex) { var v = Store.own(S.holdSecs, ex.id) ? S.holdSecs[ex.id] : 0; return ex.holds.indexOf(v) >= 0 ? v : ex.hold; }
  function rxText(ex) { return ex.sets + ' × ' + (ex.timer ? holdOf(ex) + ' s' : ex.big); }
  function unitText(ex) { return ex.timer ? (ex.sides > 1 ? 'pro Seite halten' : 'halten') : ex.unit; }
  function clock(sec) { return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  function toTop() { try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } }
  function scrollToId(id) {
    var el = document.getElementById(id), hd = document.querySelector('.top');
    if (!el) return;
    try { window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - (hd ? hd.offsetHeight : 0) - 12)); } catch (e) { /* ignore */ }
  }
  /* A session is "running" when something is ticked off today but not everything. The app opens straight into it. */
  function resumeCandidate() {
    var t = Store.training(S, S.cur);
    if (!t) return null;
    var tt = totals(t);
    return (S.stamp[t.id] === todayKey() && tt.done > 0 && tt.done < tt.total) ? t : null;
  }

  /* ---------- nutrition helpers ---------- */
  function activeDraft() { return R.edit ? R.edit.draft : R.draft; }
  function previewText() {
    var e = Store.entryFromDraft(activeDraft()), u = Store.unitOf(e.mode);
    if (!Object.keys(e.v).length) return (e.name || e.g != null) ? '' : 'Alle Felder sind freiwillig. Es wird eingetragen, was du ausfüllst.';
    if (e.mode === 'por') return 'Gesamt: ' + Store.partsOf(Store.entryTotals(e)).join(' · ');
    if (e.g == null) return 'Ohne Menge werden die Werte nur pro 100 ' + u + ' gespeichert und nicht in die Tagesbilanz gerechnet.';
    return 'Bei ' + fmt(e.g, 'g') + ' ' + u + ': ' + Store.partsOf(Store.entryTotals(e)).join(' · ');
  }

  /* ---------- feedback ---------- */
  var AC = null;
  function unlockAudio() {
    try {
      if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); }
      if (AC && AC.state === 'suspended') AC.resume();
    } catch (e) { /* ignore */ }
  }
  function beep(n) {
    try {
      if (!AC) return;
      for (var i = 0; i < n; i++) {
        var o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + i * 0.28;
        o.type = 'sine'; o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
        o.connect(g); g.connect(AC.destination);
        o.start(t0); o.stop(t0 + 0.22);
      }
    } catch (e) { /* ignore */ }
  }
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignore */ } }
  var WL = null;
  function wake() {
    try {
      if ('wakeLock' in navigator && !WL) {
        navigator.wakeLock.request('screen').then(function (l) {
          WL = l; l.addEventListener('release', function () { WL = null; });
        }).catch(noop);
      }
    } catch (e) { /* ignore */ }
  }

  /* ---------- exercise animation player ---------- */
  var reduceMotion = false;
  try { reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { /* ignore */ }
  var Anim = { raf: 0, playing: false, idx: 0, label: '' };
  Anim.els = function () {
    return { g: document.getElementById('fig-g'), cap: document.getElementById('fig-cap'), badge: document.getElementById('fig-badge') };
  };
  Anim.paint = function (id, q, bad, label, badge) {
    var e = Anim.els();
    if (!e.g) return;
    e.g.innerHTML = FIG.frame(id, q, bad);
    if (label !== Anim.label && e.cap) { e.cap.textContent = label; Anim.label = label; }
    if (e.cap) e.cap.classList.toggle('bad', !!bad);
    if (badge != null && e.badge) e.badge.textContent = badge;
  };
  Anim.stop = function () { if (Anim.raf) cancelAnimationFrame(Anim.raf); Anim.raf = 0; Anim.playing = false; };
  Anim.mount = function () {
    var e = Anim.els();
    if (!e.g) return;
    var id = e.g.getAttribute('data-ex');
    if (!FIG.ANIM[id]) return;
    Anim.idx = 0; Anim.label = '';
    Anim.paint(id, FIG.ANIM[id].steps[0].pose, false, 'Tippe auf das Bild, um die Bewegung abzuspielen.', 'Abspielen');
  };
  Anim.play = function (id) {
    Anim.stop();
    var A0 = FIG.ANIM[id], steps = A0.steps, n = steps.length, segs = [], total = 0, r, i;
    if (reduceMotion) {
      Anim.idx = (Anim.idx + 1) % n;
      var s0 = steps[Anim.idx];
      Anim.paint(id, s0.pose, !!s0.bad, s0.label, 'Weiter');
      return;
    }
    for (r = 0; r < (A0.reps || 3); r++) {
      for (i = 1; i <= n; i++) {
        var from = steps[(i - 1) % n], to = steps[i % n];
        segs.push({ from: from.pose, to: to.pose, ms: to.ms, hold: to.hold, label: to.label, bad: !!to.bad, t0: total });
        total += to.ms + to.hold;
      }
    }
    var start = performance.now();
    Anim.playing = true;
    var e0 = Anim.els(); if (e0.badge) e0.badge.textContent = 'Stopp';
    function frame(t) {
      var el = t - start;
      if (el >= total) {
        Anim.stop();
        Anim.paint(id, steps[0].pose, false, 'Fertig. Tippe auf das Bild, um es nochmal zu sehen.', 'Nochmal');
        return;
      }
      var k = segs.length - 1;
      while (k > 0 && el < segs[k].t0) k--;
      var s = segs[k], p = Math.min(1, (el - s.t0) / s.ms), ease = 0.5 - Math.cos(Math.PI * p) / 2;
      Anim.paint(id, FIG.mix(s.from, s.to, ease), s.bad, s.label, null);
      Anim.raf = requestAnimationFrame(frame);
    }
    Anim.raf = requestAnimationFrame(frame);
  };

  /* ---------- navigation: every step forward is one entry in the browser history, so the phone's back button steps back ---------- */
  var navStack = [], pendingPops = 0;
  function snap() { return { tab: R.tab, flow: R.flow, seg: R.seg, pv: R.pv, detail: R.detail ? { id: R.detail.id } : null, lib: JSON.parse(JSON.stringify(R.lib)), sel: R.sel.slice() }; }
  function applySnap(s) { R.tab = s.tab; R.flow = s.flow; R.seg = s.seg; R.pv = s.pv; R.detail = s.detail; R.lib = s.lib; R.sel = s.sel; }
  function resetTransient() {
    R.plank = null; R.confirm = false; R.undo = null; R.calUndo = null; R.edit = null; R.copyOpen = false; R.foodGoto = null; R.restore = null;
    R.calForm = false; R.calAdd = false; R.demoOpen = false; R.bookOpen = false;
  }
  function go(patch) {
    navStack.push(snap());
    if (navStack.length > 60) navStack.shift();
    try { history.pushState({ d: navStack.length }, ''); } catch (e) { /* ignore */ }
    if (patch.flow !== 'existing') R.trUndo = null;
    var k;
    for (k in patch) R[k] = patch[k];
    resetTransient(); render(); toTop();
  }
  /* A new start: nothing to go back to except the home screen (after saving a training, after starting one). */
  function resetTo(patch) {
    navStack = [];
    try { history.replaceState({ d: 0 }, ''); } catch (e) { /* ignore */ }
    var k;
    for (k in patch) R[k] = patch[k];
    R.trUndo = null;
    resetTransient(); render(); toTop();
  }
  /* n steps back at once (e.g. from the detail page over the picker to the editor) */
  function back(n) {
    n = Math.min(n || 1, navStack.length);
    if (n > 0) {
      pendingPops = n;
      try { history.go(-n); return; } catch (e) { /* fall through */ }
      pendingPops = 0;
      var s = null;
      while (n-- > 0) s = navStack.pop();
      applySnap(s); resetTransient(); render(); toTop();
      return;
    }
    R.tab = 'mine'; R.flow = 'home'; R.detail = null; resetTransient(); render(); toTop();
  }
  window.addEventListener('popstate', function () {
    if (navStack.length) {
      var n = pendingPops || 1, s = null;
      pendingPops = 0;
      while (n-- > 0 && navStack.length) s = navStack.pop();
      applySnap(s); resetTransient(); render(); toTop();
    } else if (R.tab !== 'mine' || R.flow !== 'home' || R.detail) { pendingPops = 0; R.tab = 'mine'; R.flow = 'home'; R.detail = null; resetTransient(); render(); toTop(); }
  });
  try { history.replaceState({ d: 0 }, ''); } catch (e) { /* ignore */ }

  /* A tab always opens at its start, except that a training in progress stays open: whoever looks something up in Erstellen
     or writes down a meal comes back to the same exercise. Tapping the tab one is on leads back to its start. */
  function goTab(tab, key) {
    var patch = { tab: tab, detail: null };
    if (R.tab === 'mine') R.mineRun = R.flow === 'run' && !R.detail;
    if (tab === 'mine') patch.flow = R.mineRun ? 'run' : 'home';
    if (tab === 'make') {
      patch.flow = 'home';
      if (R.tab === 'make') patch.lib = { g: null, all: false, q: '', mine: R.lib.mine, eq: false };
    }
    if (tab === 'food' && key && parseKey(key)) patch.foodDate = key;
    if (tab === 'cal' && key && parseKey(key)) { var d = parseKey(key); patch.calSel = key; patch.cal = { y: d.getFullYear(), m: d.getMonth() }; patch.calOpen = null; }
    go(patch);
  }
  /* Opens a training: it becomes the current one and the run view shows it. */
  function startTraining(id, fresh) {
    if (!Store.training(S, id)) return;
    Store.touch(S, id);
    R.rest = null; R.last = null;
    save();
    if (fresh) resetTo({ tab: 'mine', flow: 'run', detail: null }); else go({ tab: 'mine', flow: 'run', detail: null });
  }

  /* ---------- actions: training run ---------- */
  function startRest(ex, afterExercise) {
    R.rest = { endAt: Date.now() + ex.rest * 1000, total: ex.rest, finished: false, afterExercise: afterExercise };
  }

  function setCount(ex, n) {
    var t = curTraining(), d = t.id, before = doneSets(d, ex.id);
    n = Math.max(0, Math.min(ex.sets, n));
    Store.setsOf(S, d)[ex.id] = n;
    S.stamp[d] = todayKey();
    Store.touch(S, d);
    if (n > before) {
      R.fresh = ex.id + ':' + (n - 1);
      R.last = ex.id;
      buzz(25);
      var exDone = n >= ex.sets;
      if (exDone) R.pick[d] = null;
      var tt = totals(t);
      if (tt.done >= tt.total) { R.rest = null; buzz([120, 80, 120, 80, 220]); toTop(); }
      else { startRest(ex, exDone); if (exDone) toTop(); }
    } else {
      R.rest = null;
    }
    save();
    render();
  }

  /* The hold timer (plank and other holds): a short run-up to get into position, then the hold. An exercise "on each side" runs both sides after each other. */
  function startPlank(ex) {
    var now = Date.now(), secs = holdOf(ex), sides = ex.sides || 1, phases = [], t = now, s;
    for (s = 0; s < sides; s++) {
      phases.push({ k: 'ready', label: s === 0 ? 'Position einnehmen' : 'Seite wechseln', end: (t += READY * 1000) });
      phases.push({ k: 'hold', label: sides > 1 ? (s === 0 ? 'Halten, erste Seite' : 'Halten, zweite Seite') : 'Halten', end: (t += secs * 1000) });
    }
    R.plank = { ex: ex, secs: secs, phases: phases, idx: 0, start: now, endAt: t };
    render();
  }

  function plankState() {
    var p = R.plank, now = Date.now(), i = 0;
    while (i < p.phases.length - 1 && now >= p.phases[i].end) i++;
    var ph = p.phases[i], begin = i ? p.phases[i - 1].end : p.start;
    return { idx: i, phase: ph.k, label: ph.label, left: Math.max(0, Math.ceil((ph.end - now) / 1000)),
      frac: ph.k === 'ready' ? 1 : Math.max(0, (ph.end - now) / (ph.end - begin)) };
  }

  function resetDay(id) {
    S.sets[id] = {}; S.stamp[id] = ''; S.logged[id] = ''; R.pick[id] = null; R.rest = null; R.plank = null; R.confirm = false; R.last = null; R.calForm = false;
    save(); render(); toTop();
  }

  /* Write today's session into the calendar: a snapshot of the sets and weights, not just the name. */
  function calSave() {
    var inp = document.getElementById('cal-date'), v = inp ? inp.value : '', d = parseKey(v), t = curTraining();
    var res = d ? Store.logSession(S, v, t.id, todayKey()) : { ok: false, reason: 'invalid' };
    if (!res.ok) {
      setMsg('cal-msg', res.reason === 'exists'
        ? 'Am ' + longDate(v) + ' ist ' + t.name + ' schon mit Sätzen eingetragen. Wähle einen anderen Tag oder ändere den Eintrag im Kalender.'
        : 'Bitte ein Datum bis heute wählen.');
      return;
    }
    S.logged[t.id] = v;
    R.calForm = false; R.calSel = v; R.cal = { y: d.getFullYear(), m: d.getMonth() }; R.calOpen = null; R.calUndo = null;
    save(); render();
  }

  function openEntry() { return R.calOpen ? Store.logEntry(S, R.calSel, R.calOpen) : null; }

  function moveEntry() {
    var e = openEntry(), inp = document.getElementById('e-date');
    if (!e || !inp) return;
    var to = inp.value, res = Store.moveLog(S, R.calSel, e.day, to, todayKey());
    if (!res.ok) {
      setMsg('e-msg', res.reason === 'exists'
        ? 'Am ' + longDate(to) + ' ist ' + Store.entryTitle(S, e) + ' schon eingetragen. Wähle einen anderen Tag.'
        : 'Bitte ein Datum bis heute wählen.');
      return;
    }
    if (res.same) { setMsg('e-msg', 'Der Eintrag liegt schon an diesem Tag.'); return; }
    var d = parseKey(to);
    R.calSel = to; R.cal = { y: d.getFullYear(), m: d.getMonth() }; R.calUndo = null;
    save(); render();
  }

  function addFood() {
    var e = Store.entryFromDraft(R.draft);
    if (Store.isBlankEntry(e)) { R.foodMsg = 'Trage mindestens etwas ein. Alle Felder sind freiwillig.'; setMsg('food-msg', R.foodMsg); return; }
    e.id = Store.uid();
    Store.addFood(S, R.foodDate, e);
    R.undo = null; R.foodGoto = null; R.bookOpen = false;
    R.draft = Store.newDraft(R.draft.mode);
    R.foodMsg = 'Eingetragen.';
    save(); render();
  }

  function startFoodEdit(id) {
    var f = Store.findFood(S, R.foodDate, id);
    if (!f) return;
    R.edit = { key: R.foodDate, id: id, draft: Store.draftFromEntry(f.entry) };
    R.copyOpen = false; R.foodMsg = ''; R.foodGoto = null; R.undo = null;
    R.editY = window.pageYOffset;
    render(); scrollToId('food-form');
  }
  function endFoodEdit(msg) {
    R.edit = null; R.copyOpen = false; R.foodMsg = msg || '';
    var y = R.editY;
    render();
    try { window.scrollTo(0, y); } catch (e) { /* ignore */ }
  }
  function saveFoodEdit() {
    var f = Store.findFood(S, R.edit.key, R.edit.id), e = Store.entryFromDraft(R.edit.draft);
    if (!f) { endFoodEdit(''); return; }
    if (Store.isBlankEntry(e)) { R.foodMsg = 'Trage mindestens etwas ein. Alle Felder sind freiwillig.'; setMsg('food-msg', R.foodMsg); return; }
    f.entry.name = e.name; f.entry.g = e.g; f.entry.mode = e.mode; f.entry.v = e.v;
    Store.rememberRecent(S, f.entry);
    save();
    endFoodEdit('Gespeichert.');
  }
  /* Copies what the form shows (so a changed amount can be copied without touching the original). */
  function copyFoodTo(key) {
    var e = Store.entryFromDraft(R.edit.draft);
    if (!parseKey(key) || key > todayKey()) { setMsg('food-msg', 'Bitte ein Datum bis heute wählen.'); return; }
    if (Store.isBlankEntry(e)) { setMsg('food-msg', 'Trage mindestens etwas ein. Alle Felder sind freiwillig.'); return; }
    var c = Store.copyEntry(e);
    Store.addFood(S, key, c);
    R.foodGoto = key !== R.foodDate ? key : null;
    save();
    endFoodEdit(key === todayKey() ? 'Auf heute kopiert.' : 'Kopiert auf ' + longDate(key) + '.');
  }

  /* ---------- backup ---------- */
  function exportText() { return Store.toText(S); }

  function downloadBackup() {
    try {
      var blob = new Blob([Store.toText(S, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'strichliste-' + todayKey() + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      R.bkMsg = 'Datei gespeichert, meist im Ordner „Downloads“. Bewahre sie gut auf.';
    } catch (e) {
      R.bkMsg = 'Das Speichern als Datei hat nicht geklappt. Nutze „Daten kopieren“.';
    }
    setMsg('bk-msg', R.bkMsg);
  }

  function countsText(c) {
    var s = (c.trainings === 1 ? '1 Training' : c.trainings + ' Trainings') + ' und ' + (c.foods === 1 ? '1 Essenseintrag' : c.foods + ' Essenseinträge');
    if (c.plans) s += ' und ' + (c.plans === 1 ? '1 eigenes Training' : c.plans + ' eigene Trainings');
    return s;
  }
  /* A backup replaces everything. If there is something to lose, it is shown first and has to be confirmed. */
  function tryRestore(text) {
    var r = Store.parseBackup(text);
    if (!r.ok) {
      R.bkMsg = r.error === 'empty' ? 'Füge zuerst den kopierten Text ein.' : 'Das hat nicht geklappt. Füge den kompletten kopierten Text ein.';
      setMsg('bk-msg', R.bkMsg);
      return;
    }
    if (Store.isEmpty(S)) { applyRestore(r.state); return; }
    R.restore = { state: r.state }; R.bkMsg = '';
    render();
  }
  function applyRestore(state) {
    if (storageOK) Store.backupBefore(localStorage, S, 'before-restore');
    S = state;
    refreshDays();
    R.pick = {}; R.rest = null; R.plank = null; R.last = null; R.restore = null; R.edit = null; R.calOpen = null; R.calUndo = null; R.undo = null;
    R.mineRun = !!resumeCandidate();
    R.flow = (R.tab === 'mine' && R.mineRun) ? 'run' : 'home';
    save();
    R.bkMsg = 'Wiederhergestellt: ' + countsText(Store.counts(S)) + '.';
    render();
  }
  function readFile(file) {
    if (!file) return;
    var fr = new FileReader();
    fr.onload = function () { tryRestore(String(fr.result || '')); };
    fr.onerror = function () { R.bkMsg = 'Die Datei konnte nicht gelesen werden.'; setMsg('bk-msg', R.bkMsg); };
    try { fr.readAsText(file); } catch (e) { fr.onerror(); }
  }

  function setMsg(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

  /* ---------- shared pieces for the screens ---------- */
  function thumbHTML(exId) { return '<span class="thumb">' + (FIG.ANIM[exId] ? FIG.thumb(exId) : '') + '</span>'; }

  /* The animation and the hints of an exercise (used on the exercise card and on the detail page). */
  function demoBodyHTML(e, extra) {
    var h = '<button type="button" class="stage" data-act="anim-play" data-ex="' + e.id + '" aria-label="Bewegung abspielen"><svg viewBox="0 0 320 190" role="img" aria-label="Strichfigur zeigt die Bewegung"><g id="fig-g" data-ex="' + e.id + '"></g></svg><span class="badge" id="fig-badge">Abspielen</span></button>' +
      '<p class="cap" id="fig-cap"></p>' +
      '<p class="legend"><i></i><span>Farbig: hier arbeitet der Muskel. Orange: so nicht.</span></p>' + (extra || '') +
      '<h4>Darauf achten</h4><ul>' + e.watch.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
      '<h4>Häufige Fehler</h4><ul class="bad">' + e.mistakes.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
      '<h4>Hier spürst du es</h4><p class="feel">' + e.feel + '</p>';
    if (e.easier) h += '<h4>Zu schwer? So wird es leichter</h4><p class="feel">' + e.easier + '</p>';
    if (e.harder) h += '<h4>Zu leicht? So wird es schwerer</h4><p class="feel">' + e.harder + '</p>';
    return h;
  }

  /* ---------- views: training run ---------- */
  function navHTML() {
    return '<nav class="nav" aria-label="Bereiche"><div class="nav-in">' + TABS.map(function (it) {
      return '<button type="button" data-act="tab" data-tab="' + it[0] + '"' + (R.tab === it[0] && !R.detail ? ' aria-current="page"' : '') + '>' + ICONS[it[0]] + '<span>' + it[1] + '</span></button>';
    }).join('') + '</div></nav>';
  }

  function headerHTML(t, tt) {
    var pct = tt.total ? Math.round(tt.done / tt.total * 100) : 0, done = tt.done >= tt.total;
    return '<header class="top"><div class="mnav">' +
      '<button class="icon" type="button" data-act="flow-home" aria-label="Zurück zur Auswahl">' + CHEV_L + '</button>' +
      '<div class="mt-wrap"><h2 class="mt">' + esc(t.name) + '</h2><div class="sub">' + esc(t.sub || (t.items.length + ' Übungen')) + (done ? ' · erledigt' : '') + '</div></div><span></span></div>' +
      '<div class="prog"><span>' + tt.done + ' von ' + tt.total + ' Sätzen</span><span>' + tt.exDone + ' von ' + tt.exTotal + ' Übungen</span></div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div></header>';
  }

  function tallyHTML(ex, done) {
    var out = '';
    for (var i = 0; i < ex.sets; i++) {
      var on = i < done, fresh = R.fresh === ex.id + ':' + i;
      out += '<button type="button" class="set' + (fresh ? ' fresh' : '') + '" data-act="set" data-i="' + i + '" aria-pressed="' + on + '" aria-label="Satz ' + (i + 1) + (on ? ' zurücknehmen' : ' abhaken') + '">' +
        '<svg viewBox="0 0 28 52" aria-hidden="true"><path class="stroke" d="M14 5V47"/></svg><span>Satz ' + (i + 1) + '</span></button>';
    }
    return '<div class="tally" style="--n:' + ex.sets + '">' + out + '</div>';
  }

  function plankRunHTML() {
    var ps = plankState(), off = Math.round(553 * (1 - ps.frac));
    return '<div class="ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="trk" cx="100" cy="100" r="88"/><circle class="prg" id="plank-ring" cx="100" cy="100" r="88" style="stroke-dashoffset:' + off + '"/></svg>' +
      '<div class="ring-in"><div class="clock" id="plank-time">' + ps.left + '</div><div class="eyebrow" id="plank-label">' + esc(ps.label) + '</div></div></div>' +
      '<button class="btn ghost" type="button" data-act="plank-cancel">Abbrechen</button>';
  }

  function demoHTML(ex) {
    var e = Store.own(window.EX, ex.id) ? window.EX[ex.id] : null;
    var html = '<div class="demo"><button class="btn ghost sm" type="button" data-act="demo-toggle" aria-expanded="' + R.demoOpen + '">' + (R.demoOpen ? 'Hinweise schliessen' : 'So geht die Übung') + '</button>';
    if (R.demoOpen && e) html += '<div class="demo-body">' + demoBodyHTML(e) + '</div>';
    return html + '</div>';
  }

  function focusHTML(t, ex, tt) {
    var done = doneSets(t.id, ex.id), idx = tt.exDone + 1;
    var html = '<section class="card"><div><p class="eyebrow">Jetzt dran · Übung ' + Math.min(idx, tt.exTotal) + ' von ' + tt.exTotal + '</p>' +
      '<h2 class="name">' + esc(ex.name) + '</h2>' + (ex.gear ? '<div class="gear">' + esc(ex.gear) + '</div>' : '') + '</div>' +
      '<p class="rx"><b>' + rxText(ex) + '</b><span>' + unitText(ex) + '</span></p>';

    if (R.plank && R.plank.ex.id === ex.id) {
      html += plankRunHTML();
    } else {
      html += tallyHTML(ex, done);
      if (ex.timer) {
        html += '<div class="chips" role="group" aria-label="Haltezeit" style="--n:' + ex.holds.length + '">' +
          ex.holds.map(function (s) { return '<button class="chip" type="button" data-act="plank-secs" data-secs="' + s + '" aria-pressed="' + (holdOf(ex) === s) + '">' + s + ' s</button>'; }).join('') + '</div>';
        html += '<button class="btn" type="button" data-act="plank-start">' + esc(ex.name) + ' starten</button>';
      } else {
        html += '<button class="btn" type="button" data-act="done">Satz ' + (done + 1) + ' geschafft</button>';
      }
      html += demoHTML(ex);
      html += '<ul class="cues">' + ex.cues.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>';
      if (ex.weight) {
        html += '<div class="field"><label for="w-' + ex.id + '">Gewicht (kg)</label>' +
          '<input id="w-' + ex.id + '" data-weight="' + ex.id + '" type="text" inputmode="decimal" autocomplete="off" placeholder="–" value="' + esc(Store.own(S.weights, ex.id) ? S.weights[ex.id] : '') + '"></div>';
      }
      if (ex.knee) html += '<div class="note">' + KNEE_NOTE + '</div>';
      if (ex.note) html += '<div class="note">' + ex.note + '</div>';
    }
    return html + '</section>';
  }

  function restHTML(t) {
    var r = R.rest, cur = currentEx(t), now = Date.now();
    var left = Math.max(0, Math.ceil((r.endAt - now) / 1000));
    var title = left === 0 ? 'Pause vorbei' : (r.afterExercise ? 'Übung geschafft · Pause' : 'Pause');
    var top, sub;
    if (r.afterExercise) { top = cur.name; sub = rxText(cur) + ' ' + unitText(cur); }
    else { top = 'Satz ' + (doneSets(t.id, cur.id) + 1) + ' von ' + cur.sets; sub = cur.name; }
    var pct = Math.max(0, Math.min(100, left / r.total * 100));
    return '<section class="card rest"><p class="eyebrow" id="rest-title">' + title + '</p>' +
      '<p class="clock" id="rest-clock">' + clock(left) + '</p>' +
      '<div class="bar warm"><i id="rest-bar" style="width:' + pct + '%"></i></div>' +
      '<div class="next"><p class="eyebrow">Als Nächstes</p><b>' + esc(top) + '</b><span>' + esc(sub) + '</span></div>' +
      '<button class="btn" type="button" data-act="skip">Weiter</button>' +
      '<div class="two"><button class="btn ghost sm" type="button" data-act="plus">+ 30 s</button>' +
      (R.last ? '<button class="btn ghost sm" type="button" data-act="undo">Rückgängig</button>' : '<span></span>') + '</div>' +
      demoHTML(cur) + '</section>';
  }

  function logBlockHTML(t) {
    var d = todayKey(), at = Store.loggedDate(S, t.id);
    if (R.calForm) {
      return '<div class="calform"><label for="cal-date">An welchem Tag hast du trainiert?</label>' +
        '<input id="cal-date" type="date" value="' + d + '" max="' + d + '">' +
        '<div class="two"><button class="btn sm" type="button" data-act="cal-save">Eintragen</button><button class="btn ghost sm" type="button" data-act="cal-cancel">Abbrechen</button></div>' +
        '<p class="msg" id="cal-msg"></p></div>';
    }
    if (at) {
      return '<div class="note"><b>Eingetragen:</b> ' + esc(t.name) + ' am ' + longDate(at) + '.</div>' +
        '<button class="btn" type="button" data-act="tab" data-tab="cal" data-key="' + at + '">Kalender ansehen</button>';
    }
    return '<button class="btn" type="button" data-act="cal-open">Training in Kalender eintragen</button>';
  }

  function finishHTML(t, tt) {
    return '<section class="card"><div><p class="eyebrow">' + esc(t.name) + (t.sub ? ' · ' + esc(t.sub) : '') + '</p><h2 class="name">Fertig für heute</h2></div>' +
      '<p class="rx"><b>' + tt.done + ' von ' + tt.total + '</b><span>Sätzen erledigt</span></p>' +
      logBlockHTML(t) +
      (t.kneeCheck
        ? '<div class="note"><b>Knie-Check:</b> Ist das Knie morgen geschwollen oder steif, beim nächsten Mal bei den Beinübungen weniger Sätze oder Gewicht.</div>'
        : '<div class="note"><b>Gut gemacht.</b> Trinke etwas, iss eine Kleinigkeit und gönne dir Erholung.</div>') +
      '<button class="btn ghost" type="button" data-act="flow-home">Anderes Training wählen</button>' +
      '<button class="btn ghost" type="button" data-act="restart">Neu starten</button></section>';
  }

  function listHTML(t, cur) {
    var rows = t.items.map(function (ex) {
      var n = doneSets(t.id, ex.id), done = n >= ex.sets, isCur = cur && cur.id === ex.id, pips = '';
      for (var i = 0; i < ex.sets; i++) pips += '<i class="pip' + (i < n ? ' on' : '') + '"></i>';
      var inner = '<span class="check">' + (done ? CHECK : '') + '</span>' +
        '<span class="rn"><b>' + esc(ex.name) + '</b><small>' + rxText(ex) + ' ' + unitText(ex) + '</small></span>' +
        '<span class="pips" aria-hidden="true">' + pips + '</span>';
      if (done) return '<div class="row done">' + inner + '</div>';
      return '<button type="button" class="row' + (isCur ? ' current' : '') + '" data-act="pick" data-id="' + ex.id + '"' + (isCur ? ' aria-current="true"' : '') + '>' + inner + '</button>';
    }).join('');
    return '<section aria-labelledby="plan-h"><h3 class="eyebrow" id="plan-h">Heute im Plan</h3><div class="list">' + rows + '</div></section>';
  }

  function runView() {
    var t = curTraining(), tt = totals(t), cur = currentEx(t), body;
    if (tt.done >= tt.total) body = finishHTML(t, tt);
    else if (R.rest) body = restHTML(t);
    else body = focusHTML(t, cur, tt);
    return { head: headerHTML(t, tt), main: body + listHTML(t, cur) };
  }

  /* ---------- views: calendar ---------- */
  function monthCounts() {
    var pre = R.cal.y + '-' + pad(R.cal.m + 1) + '-', n = 0, days = 0;
    Object.keys(S.log).forEach(function (k) {
      if (k.indexOf(pre) !== 0) return;
      n += S.log[k].length; days++;
    });
    return { n: n, days: days };
  }

  function calHeaderHTML() {
    var c = monthCounts();
    return '<header class="top"><div class="mnav">' +
      '<button class="icon" type="button" data-act="cal-prev" aria-label="Vorheriger Monat">' + CHEV_L + '</button>' +
      '<h2 class="mt">' + MON[R.cal.m] + ' ' + R.cal.y + '</h2>' +
      '<button class="icon" type="button" data-act="cal-next" aria-label="Nächster Monat">' + CHEV_R + '</button></div>' +
      '<p class="prog"><span>' + (c.n === 1 ? '1 Training' : c.n + ' Trainings') + ' in diesem Monat</span><span>' + (c.days === 1 ? 'an 1 Tag' : 'an ' + c.days + ' Tagen') + '</span></p></header>';
  }

  function calGridHTML() {
    var y = R.cal.y, m = R.cal.m, lead = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), t = todayKey(), i;
    var out = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(function (w) { return '<span class="wd">' + w + '</span>'; }).join('');
    for (i = 0; i < lead; i++) out += '<span class="cd empty"></span>';
    for (i = 1; i <= days; i++) {
      var key = y + '-' + pad(m + 1) + '-' + pad(i), list = S.log[key] || [];
      var tags = list.slice(0, 3).map(function (e) { return '<i class="tg">' + esc(Store.tagOf(S, e)) + '</i>'; }).join('') + (list.length > 3 ? '<i class="tg">+</i>' : '');
      var names = list.map(function (e) { return Store.entryTitle(S, e); });
      out += '<button type="button" class="cd' + (key === t ? ' today' : '') + (key === R.calSel ? ' sel' : '') + '" data-act="cal-day" data-key="' + key + '" aria-pressed="' + (key === R.calSel) + '" aria-label="' + esc(longDate(key) + (names.length ? ', Training: ' + names.join(' und ') : '')) + '">' +
        '<b>' + i + '</b><span class="tags">' + tags + '</span></button>';
    }
    return '<section class="card" aria-label="Monatsübersicht"><div class="cal">' + out + '</div></section>';
  }

  function entryBodyHTML(k, e) {
    var sum = Store.entrySummary(S, e), t = todayKey();
    var h = '<div class="entry-body">';
    if (!sum.hasDetails) h += '<p class="hint">Zu diesem Eintrag sind keine Sätze gespeichert. Du kannst sie hier nachtragen.</p>';
    Store.entryItems(S, e).forEach(function (ex) {
      var n = Math.min(e.sets[ex.id] || 0, ex.sets);
      h += '<div class="xrow"><p class="xname">' + esc(ex.name) + (ex.gear ? '<small>' + esc(ex.gear) + '</small>' : '') + '</p>' +
        '<div class="step"><button type="button" data-act="entry-sets" data-ex="' + ex.id + '" data-d="-1" aria-label="' + esc(ex.name) + ': einen Satz weniger"' + (n <= 0 ? ' disabled' : '') + '>−</button>' +
        '<span class="cnt" role="status">' + n + ' <small>von ' + ex.sets + ' Sätzen</small></span>' +
        '<button type="button" data-act="entry-sets" data-ex="' + ex.id + '" data-d="1" aria-label="' + esc(ex.name) + ': einen Satz mehr"' + (n >= ex.sets ? ' disabled' : '') + '>+</button></div>';
      if (ex.weight) {
        h += '<div class="field"><label for="ew-' + ex.id + '">Gewicht (kg)</label>' +
          '<input id="ew-' + ex.id + '" data-eweight="' + ex.id + '" type="text" inputmode="decimal" autocomplete="off" placeholder="–" value="' + esc(Store.own(e.weights, ex.id) ? e.weights[ex.id] : '') + '"></div>';
      }
      h += '</div>';
    });
    h += '<div class="fcol"><label for="e-note">Notiz</label>' +
      '<textarea id="e-note" data-enote="1" rows="2" maxlength="' + Store.NOTE_MAX + '" placeholder="z. B. Knie fühlte sich gut an">' + esc(e.note) + '</textarea></div>';
    h += '<div class="calform"><label for="e-date">Datum verschieben</label>' +
      '<input id="e-date" type="date" value="' + k + '" max="' + t + '">' +
      '<button class="btn ghost sm" type="button" data-act="entry-move">Auf dieses Datum verschieben</button>' +
      '<p class="msg" id="e-msg"></p></div>';
    h += '<button class="btn danger sm" type="button" data-act="entry-del">Eintrag löschen</button>';
    return h + '</div>';
  }

  function entryHTML(k, e) {
    var open = R.calOpen === e.day, sum = Store.entrySummary(S, e), sub = Store.entrySub(S, e);
    var line = (sub ? sub + ' · ' : '') + (sum.hasDetails ? sum.done + ' von ' + sum.total + ' Sätzen' : 'ohne Details');
    return '<div class="entry"><button class="entry-head" type="button" data-act="entry-toggle" data-day="' + esc(e.day) + '" aria-expanded="' + open + '">' +
      '<span class="tg big">' + esc(Store.tagOf(S, e)) + '</span><span class="grow"><b>' + esc(Store.entryTitle(S, e)) + '</b><small>' + esc(line) + '</small></span><span class="chev">' + CHEV_D + '</span></button>' +
      (open ? entryBodyHTML(k, e) : '') + '</div>';
  }

  /* Trainings that can be added by hand to a day: the last ones used as quick buttons, all others in a list. */
  function calAddHTML(k, tr) {
    var have = tr.map(function (e) { return e.day; }), quick = [], all = Store.allTrainings(S);
    S.last.forEach(function (id) { if (have.indexOf(id) < 0 && quick.length < 2 && Store.training(S, id)) quick.push(Store.training(S, id)); });
    var h = '<div class="two">' + quick.map(function (t) { return '<button class="btn ghost sm" type="button" data-act="cal-add" data-day="' + esc(t.id) + '">' + esc(t.name) + ' eintragen</button>'; }).join('') +
      '<button class="btn ghost sm" type="button" data-act="cal-add-open" aria-expanded="' + R.calAdd + '">' + (quick.length ? 'Anderes Training …' : 'Training eintragen') + '</button></div>';
    if (R.calAdd) {
      var opt = function (t) { return have.indexOf(t.id) < 0 ? '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>' : ''; };
      h += '<div class="calform"><label for="cal-pick">Welches Training?</label><select id="cal-pick">' +
        (all.own.length ? '<optgroup label="Meine Trainings">' + all.own.map(opt).join('') + '</optgroup>' : '') +
        '<optgroup label="Vorschläge der App">' + all.ready.map(opt).join('') + '</optgroup></select>' +
        '<div class="two"><button class="btn sm" type="button" data-act="cal-add-go">Eintragen</button><button class="btn ghost sm" type="button" data-act="cal-add-open">Abbrechen</button></div></div>';
    }
    return h;
  }

  function calDetailHTML() {
    var k = R.calSel, tr = S.log[k] || [], future = k > todayKey(), h = '<section class="card"><div><p class="eyebrow">Ausgewählter Tag</p><h3 class="name" style="font-size:28px">' + longDate(k) + '</h3></div>';
    if (R.calUndo && R.calUndo.key === k) h += '<div class="note undo"><span>Eintrag gelöscht.</span><button class="link" type="button" data-act="cal-undo">Rückgängig</button></div>';
    if (tr.length) {
      h += tr.map(function (e) { return entryHTML(k, e); }).join('');
    } else if (!(R.calUndo && R.calUndo.key === k)) {
      h += '<p class="empty">' + (future ? 'Dieser Tag liegt in der Zukunft.' : 'An diesem Tag ist kein Training eingetragen.') + '</p>';
    }
    if (!future) h += calAddHTML(k, tr);
    var T = Store.dayTotals(S, k);
    if (T.n) {
      var parts = [];
      if (T.has.kcal) parts.push(fmt(T.sum.kcal, 'kcal') + ' kcal');
      if (T.has.p) parts.push(fmt(T.sum.p, 'g') + ' g Protein');
      h += '<div class="note"><b>Essen:</b> ' + (parts.length ? parts.join(' · ') + ' · ' : '') + T.n + (T.n === 1 ? ' Eintrag' : ' Einträge') + '</div>' +
        '<button class="btn ghost sm" type="button" data-act="tab" data-tab="food" data-key="' + k + '">Essen ansehen</button>';
    }
    return h + '</section>';
  }

  /* ---------- views: food ---------- */
  function kcalBar(T) {
    if (!S.goalK) return '';
    var got = T.sum.kcal || 0, pct = Math.min(100, Math.round(got / S.goalK * 100));
    return '<p class="prog"><span>Kalorien</span><span>' + fmt(got, 'kcal') + ' von ' + fmt(S.goalK, 'kcal') + ' kcal</span></p><div class="bar"><i style="width:' + pct + '%"></i></div>';
  }
  function proteinBar(T) {
    if (S.goalP) {
      var got = T.sum.p || 0, pct = Math.min(100, Math.round(got / S.goalP * 100));
      return '<p class="prog"><span>Protein</span><span>' + fmt(got, 'g') + ' von ' + fmt(S.goalP, 'g') + ' g</span></p><div class="bar"><i style="width:' + pct + '%"></i></div>';
    }
    if (T.has.p) return '<p class="prog"><span>Protein</span><span>' + fmt(T.sum.p, 'g') + ' g</span></p>';
    return '';
  }

  function foodHeaderHTML() {
    var k = R.foodDate, isToday = k === todayKey(), T = Store.dayTotals(S, k);
    return '<header class="top"><div class="mnav">' +
      '<button class="icon" type="button" data-act="food-prev" aria-label="Vorheriger Tag">' + CHEV_L + '</button>' +
      '<div class="mt-wrap"><h2 class="mt">' + (isToday ? 'Heute' : WDL[parseKey(k).getDay()]) + '</h2><div class="sub">' + longDate(k) + '</div></div>' +
      '<button class="icon" type="button" data-act="food-next" aria-label="Nächster Tag"' + (isToday ? ' disabled' : '') + '>' + CHEV_R + '</button></div>' +
      proteinBar(T) + kcalBar(T) + '</header>';
  }

  function goalHintText() {
    var w = S.weightKg;
    if (w) return 'Richtwert beim Krafttraining: etwa 1,4 bis 2,0 g pro kg Körpergewicht. Bei ' + fmt(w, 'g') + ' kg sind das ' + Math.round(1.4 * w) + ' bis ' + Math.round(2 * w) + ' g am Tag. Das ist eine Orientierung, keine persönliche Empfehlung.';
    return 'Richtwert beim Krafttraining: etwa 1,4 bis 2,0 g pro kg Körpergewicht. Trage dein Gewicht ein, dann rechne ich es aus. Das ist eine Orientierung, keine persönliche Empfehlung.';
  }
  function goalBtnHTML() {
    var w = S.weightKg;
    return w ? '<button class="btn ghost sm" type="button" data-act="goal-w16">1,6 g pro kg übernehmen (' + Math.round(1.6 * w) + ' g)</button>' : '';
  }
  function goalHTML() {
    var w = S.weightKg, hint = goalHintText();
    return '<div class="goal">' +
      '<div class="fcol"><label for="goal-p">Protein-Ziel pro Tag (g)</label><input id="goal-p" data-goal="p" type="text" inputmode="decimal" autocomplete="off" placeholder="z. B. 100" value="' + (S.goalP ? esc(numStr(S.goalP)) : '') + '"></div>' +
      '<div class="fcol"><label for="goal-k">Kalorien-Ziel pro Tag (kcal)</label><input id="goal-k" data-goal="k" type="text" inputmode="decimal" autocomplete="off" placeholder="z. B. 2000" value="' + (S.goalK ? esc(numStr(S.goalK)) : '') + '"></div>' +
      '<p class="hint">Wie viele kcal dir guttun, hängt von Alter, Grösse, Alltag und Ziel ab. Die App nennt dafür keinen Richtwert. Eine Ernährungsberatung oder dein Arzt kann dir helfen. Wenn Zählen Stress macht, lass das Feld einfach leer.</p>' +
      '<div class="fcol"><label for="goal-w">Körpergewicht (kg), nur für den Richtwert</label><input id="goal-w" data-goal="w" type="text" inputmode="decimal" autocomplete="off" placeholder="z. B. 60" value="' + (w ? esc(numStr(w)) : '') + '"></div>' +
      '<p class="hint" id="goal-hint">' + hint + '</p>' +
      '<div id="goal-btn">' + goalBtnHTML() + '</div>' +
      '</div>';
  }

  function summaryHTML(T) {
    var h = '<section class="card"><h3 class="eyebrow">Tagesbilanz</h3>';
    if (!T.n) h += '<p class="empty">Noch nichts eingetragen. Trage unten ein, was du gegessen hast.</p>';
    if (S.goalP || T.has.p) {
      var got = T.sum.p || 0;
      h += '<div class="prot"><div class="prot-top"><span class="eyebrow">Protein</span>' + (S.goalP ? '<span class="hint">Ziel ' + fmt(S.goalP, 'g') + ' g</span>' : '') + '</div>';
      if (S.goalP) {
        var pct = Math.min(100, Math.round(got / S.goalP * 100)), left = S.goalP - got;
        h += '<p class="prot-num"><b>' + fmt(got, 'g') + '</b><span>von ' + fmt(S.goalP, 'g') + ' g</span></p><div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<p class="prot-sub">' + (left > 0 ? 'Noch ' + fmt(left, 'g') + ' g bis zum Ziel' : 'Ziel erreicht') + '</p>';
      } else {
        h += '<p class="prot-num"><b>' + fmt(got, 'g') + '</b><span>g Protein</span></p>';
      }
      h += '</div>';
    }
    if (S.goalK) {
      var kg = Math.round(T.sum.kcal || 0), kleft = S.goalK - kg, kp = Math.min(100, Math.round(kg / S.goalK * 100));
      h += '<div class="prot kcal"><div class="prot-top"><span class="eyebrow">Kalorien</span><span class="hint">Ziel ' + fmt(S.goalK, 'kcal') + ' kcal</span></div>' +
        '<p class="prot-num kc-num"><b>' + fmt(kg, 'kcal') + '</b><span>von ' + fmt(S.goalK, 'kcal') + ' kcal</span></p><div class="bar"><i style="width:' + kp + '%"></i></div>' +
        '<p class="prot-sub kc-sub">' + (kleft > 0 ? 'Noch ' + fmt(kleft, 'kcal') + ' kcal bis zum Ziel' : (kleft === 0 ? 'Genau am Ziel' : 'Über dem Ziel: ' + fmt(-kleft, 'kcal') + ' kcal')) + '</p></div>';
    }
    var tiles = '';
    window.NUTR.forEach(function (n) {
      if (n.k === 'p' || (n.k === 'kcal' && S.goalK) || !T.has[n.k]) return;
      tiles += '<div class="tile"><b>' + fmt(T.sum[n.k], n.u) + '<i>' + n.u + '</i></b><span>' + n.l + '</span></div>';
    });
    if (tiles) h += '<div class="tiles">' + tiles + '</div>';
    if (T.skipped) h += '<p class="hint">' + (T.skipped === 1 ? '1 Eintrag hat keine Menge und ist nicht eingerechnet.' : T.skipped + ' Einträge haben keine Menge und sind nicht eingerechnet.') + '</p>';
    h += '<button class="link" type="button" data-act="goal-toggle">' + (R.goalOpen ? 'Ziele schliessen' : ((S.goalP || S.goalK) ? 'Ziele ändern' : 'Ziele festlegen')) + '</button>';
    if (R.goalOpen) h += goalHTML();
    return h + '</section>';
  }

  /* "Bisherige Lebensmittel": everything that was ever entered, A to Z, with a search. A tap fills the form. */
  function bookMeta(e) {
    var parts = Store.partsOf(e.v);
    return parts.length ? parts.join(' · ') + (e.mode === 'por' ? ' für die ganze Menge' : ' pro 100 ' + Store.unitOf(e.mode)) : 'ohne Nährwerte';
  }
  function bookListHTML() {
    var all = Store.foodBook(S), q = R.bookQ.trim().toLowerCase(), last = '';
    var list = q ? all.filter(function (e) { return e.name.toLowerCase().indexOf(q) >= 0; }) : all;
    if (!all.length) return '<p class="empty">Hier erscheinen alle Lebensmittel, die du einträgst.</p>';
    if (!list.length) return '<p class="empty">Kein Lebensmittel gefunden.</p>';
    var h = '<p class="hint" role="status">' + (list.length === 1 ? '1 Lebensmittel' : list.length + ' Lebensmittel') + '</p>';
    list.forEach(function (e) {
      var L = e.name.charAt(0).toUpperCase().normalize('NFD').charAt(0);
      if (!/[A-Z]/.test(L)) L = '#';
      if (L !== last) { h += (last ? '</div>' : '') + '<h4 class="eyebrow sec">' + L + '</h4><div class="list">'; last = L; }
      h += '<button type="button" class="row" data-act="book-pick" data-name="' + esc(e.name) + '"><span class="rn"><b>' + esc(e.name) + '</b><small>' + esc(bookMeta(e)) + '</small></span>' + CHEV_R + '</button>';
    });
    return h + '</div>';
  }
  function bookHTML() {
    return '<div class="book" id="book"><div class="fcol"><label class="sr" for="book-q">Lebensmittel suchen</label>' +
      '<input id="book-q" data-bookq="1" type="search" enterkeyhint="search" autocomplete="off" placeholder="Lebensmittel suchen" value="' + esc(R.bookQ) + '"></div>' +
      '<div id="book-list">' + bookListHTML() + '</div></div>';
  }

  function fieldHTML(n, d) {
    return '<div class="fcol"><label for="f-' + n.k + '">' + n.l + ' (' + n.u + ')</label><input id="f-' + n.k + '" data-draft-v="' + n.k + '" type="text" inputmode="decimal" autocomplete="off" value="' + esc(d.v[n.k]) + '"></div>';
  }

  function formHTML() {
    var ed = R.edit, d = activeDraft(), unit = Store.unitOf(d.mode);
    var h = '<section class="card" id="food-form" aria-labelledby="fh"><h3 class="eyebrow" id="fh">' + (ed ? 'Eintrag bearbeiten' : 'Essen eintragen') + '</h3>';
    if (!ed && S.recent.length) {
      h += '<div class="chiprow" role="group" aria-label="Zuletzt gegessen">' + S.recent.map(function (e, i) {
        return '<button class="rc" type="button" data-act="food-recent" data-i="' + i + '">' + esc(e.name) + '</button>';
      }).join('') + '</div>';
    }
    h += '<div class="fcol"><label for="f-name">Was hast du gegessen?</label><input id="f-name" data-draft="name" type="text" autocomplete="off" placeholder="z. B. Magerquark" value="' + esc(d.name) + '"></div>' +
      '<div class="fcol"><label for="f-g">' + (unit === 'ml' ? 'Menge in Millilitern' : 'Menge in Gramm') + '</label><input id="f-g" data-draft="g" type="text" inputmode="decimal" autocomplete="off" placeholder="z. B. 250" value="' + esc(d.g) + '"></div>' +
      '<div class="fcol"><span class="eyebrow">Die Nährwerte gelten für</span><div class="seg three" role="group" aria-label="Bezugsgrösse der Nährwerte">' +
      '<button class="chip" type="button" data-act="food-mode" data-mode="100" aria-pressed="' + (d.mode === '100') + '">pro 100 g</button>' +
      '<button class="chip" type="button" data-act="food-mode" data-mode="ml" aria-pressed="' + (d.mode === 'ml') + '">pro 100 ml</button>' +
      '<button class="chip" type="button" data-act="food-mode" data-mode="por" aria-pressed="' + (d.mode === 'por') + '">ganze Menge</button></div></div>' +
      '<div class="grid2">' + window.NUTR.slice(0, 4).map(function (n) { return fieldHTML(n, d); }).join('') + '</div>' +
      '<button class="link" type="button" data-act="food-more">' + (d.more ? 'Weniger Werte' : 'Mehr Werte (Zucker, Ballaststoffe)') + '</button>';
    if (d.more) h += '<div class="grid2">' + window.NUTR.slice(4).map(function (n) { return fieldHTML(n, d); }).join('') + '</div>';
    h += '<p class="preview" id="food-preview">' + esc(previewText()) + '</p>';
    if (ed) {
      var t = todayKey();
      h += '<div class="two"><button class="btn" type="button" data-act="food-save">Speichern</button><button class="btn ghost" type="button" data-act="food-cancel">Abbrechen</button></div>' +
        '<div class="edit-actions"><p class="eyebrow">Kopieren</p>' +
        '<button class="btn ghost sm" type="button" data-act="food-copy-today">Auf heute kopieren</button>' +
        '<button class="btn ghost sm" type="button" data-act="food-copy-open" aria-expanded="' + R.copyOpen + '">Auf anderen Tag kopieren</button>';
      if (R.copyOpen) {
        h += '<div class="calform"><label for="copy-date">Kopieren auf den Tag</label><input id="copy-date" type="date" value="' + t + '" max="' + t + '">' +
          '<div class="two"><button class="btn sm" type="button" data-act="food-copy-go">Kopieren</button><button class="btn ghost sm" type="button" data-act="food-copy-close">Abbrechen</button></div></div>';
      }
      h += '</div>';
    } else {
      h += '<button class="btn" type="button" data-act="food-add">Hinzufügen</button>' +
        '<button class="btn ghost sm" type="button" data-act="book-toggle" aria-expanded="' + R.bookOpen + '">Bisherige Lebensmittel</button>';
      if (R.bookOpen) h += bookHTML();
    }
    h += '<p class="msg" id="food-msg">' + esc(R.foodMsg) + '</p>';
    if (R.foodGoto) h += '<div class="note undo"><span>Zum Tag wechseln?</span><button class="link" type="button" data-act="food-goto" data-key="' + R.foodGoto + '">Ansehen</button></div>';
    return h + '</section>';
  }

  function foodEntryHTML(e) {
    var tot = Store.entryTotals(e), chips = '', src, u = Store.unitOf(e.mode);
    window.NUTR.forEach(function (n) {
      if (tot[n.k] != null) chips += '<span class="nchip"><b>' + fmt(tot[n.k], n.u) + '</b> ' + (n.u === 'kcal' ? 'kcal' : 'g ' + n.l) + '</span>';
    });
    var entered = Store.partsOf(e.v);
    if (!entered.length) src = 'Ohne Nährwerte eingetragen.';
    else if (e.mode === 'por') src = 'Eingegeben für die ganze Menge.';
    else src = 'Eingegeben pro 100 ' + u + ': ' + entered.join(' · ') + (e.g == null ? '. Menge fehlt, deshalb nicht eingerechnet.' : '.');
    var editing = R.edit && R.edit.id === e.id;
    return '<div class="fe' + (editing ? ' editing' : '') + '"><button class="fe-main" type="button" data-act="food-edit" data-id="' + esc(e.id) + '" aria-label="' + esc((e.name || 'Eintrag') + ' bearbeiten') + '">' +
      '<span class="fe-top"><span class="fe-name"><b>' + (e.name ? esc(e.name) : 'Ohne Namen') + '</b>' + (e.g != null ? '<small>' + fmt(e.g, 'g') + ' ' + u + '</small>' : '') + '</span></span>' +
      (chips ? '<span class="nchips">' + chips + '</span>' : '') + '<span class="fe-src">' + src + '</span></button>' +
      '<button class="fe-del" type="button" data-act="food-del" data-id="' + esc(e.id) + '" aria-label="Eintrag löschen">' + TRASH + '</button></div>';
  }

  function foodListHTML(k) {
    var list = S.food[k] || [], h = '';
    if (R.undo) h += '<div class="note undo"><span>Eintrag gelöscht.</span><button class="link" type="button" data-act="food-undo">Rückgängig</button></div>';
    if (!list.length) return h ? '<section>' + h + '</section>' : '';
    return '<section aria-labelledby="fl-h"><h3 class="eyebrow" id="fl-h">' + (k === todayKey() ? 'Heute gegessen' : 'Gegessen') + ' · ' + list.length + (list.length === 1 ? ' Eintrag' : ' Einträge') + '</h3>' +
      '<p class="fe-hint">Tippe auf einen Eintrag, um ihn zu bearbeiten oder zu kopieren.</p>' + h + '<div class="list">' + list.map(foodEntryHTML).join('') + '</div></section>';
  }

  /* ---------- footer ---------- */
  function footHTML() {
    var ok = storageOK && !R.saveFailed;
    var h = '<footer class="foot"><p>' + (ok
      ? 'Deine Daten bleiben nur auf diesem Handy gespeichert. Das Training beginnt jeden Tag neu.'
      : '<span class="warn">Gerade kann nichts gespeichert werden.</span> Die Daten bleiben nur, solange die App offen ist. Sichere sie mit „Daten kopieren“ oder „Als Datei sichern“.') + '</p>';
    if (R.loadStatus === 'corrupt') h += '<p>Die gespeicherten Daten waren nicht lesbar und wurden beiseitegelegt. Die App hat neu begonnen.</p>';
    if (R.tab === 'mine' && R.flow === 'run') {
      var name = curTraining().name;
      h += R.confirm
        ? '<div class="confirm"><span>Alle Haken von ' + esc(name) + ' löschen?</span><div class="two">' +
          '<button class="btn sm" type="button" data-act="reset-yes">Löschen</button>' +
          '<button class="btn ghost sm" type="button" data-act="reset-no">Abbrechen</button></div></div>'
        : '<button class="link" type="button" data-act="reset-ask">' + esc(name) + ' zurücksetzen</button>';
    }
    h += '<button class="link" type="button" data-act="bk-toggle" aria-expanded="' + R.bkOpen + '">' + (R.bkOpen ? 'Sicherung schliessen' : 'Daten sichern oder wiederherstellen') + '</button>';
    if (R.bkOpen) {
      h += '<div class="bk"><p>Sichere deine Daten zum Beispiel in einer Notiz oder als Datei. Mit „Wiederherstellen“ holst du sie zurück. Das ersetzt die aktuellen Daten.</p>' +
        '<p>Daten aus der alten Version funktionieren auch: dort „Daten kopieren“, hier einfügen und „Wiederherstellen“.</p>' +
        '<button class="btn ghost sm" type="button" data-act="bk-copy">Daten kopieren</button>' +
        '<button class="btn ghost sm" type="button" data-act="bk-file">Als Datei sichern</button>' +
        '<textarea id="bk-text" rows="4" placeholder="Gesicherte Daten hier einfügen" aria-label="Gesicherte Daten"></textarea>' +
        '<button class="btn ghost sm" type="button" data-act="bk-restore">Wiederherstellen</button>' +
        '<input class="sr" type="file" id="bk-upload" accept=".json,application/json,text/plain">' +
        '<label class="btn ghost sm filebtn" for="bk-upload">Aus Datei wiederherstellen</label>';
      if (R.restore) {
        h += '<div class="confirm"><span>Das ersetzt deine aktuellen Daten (' + countsText(Store.counts(S)) + ') durch die gesicherten (' + countsText(Store.counts(R.restore.state)) + '). Fortfahren?</span><div class="two">' +
          '<button class="btn sm" type="button" data-act="restore-yes">Ersetzen</button>' +
          '<button class="btn ghost sm" type="button" data-act="restore-no">Abbrechen</button></div></div>';
      }
      h += '<p class="msg" id="bk-msg">' + esc(R.bkMsg) + '</p></div>';
    }
    h += '<p class="ver">Version ' + esc(VERSION) + '<span id="ver-note">' + (R.offlineReady ? ' · läuft auch ohne Internet' : '') + '</span></p>';
    return h + '</footer>';
  }

  /* ---------- the shared object for ui-flow.js and ui-lib.js ---------- */
  var A = {
    S: function () { return S; }, R: R, save: save, render: render, esc: esc, go: go, resetTo: resetTo, back: back, goTab: goTab, startTraining: startTraining,
    toTop: toTop, scrollToId: scrollToId, setMsg: setMsg, longDate: longDate, todayKey: todayKey, thumbHTML: thumbHTML, demoBodyHTML: demoBodyHTML,
    curTraining: curTraining, totals: totals, rxText: rxText, unitText: unitText, resumeCandidate: resumeCandidate,
    icons: { CHECK: CHECK, CHEV_L: CHEV_L, CHEV_R: CHEV_R, CHEV_D: CHEV_D, TRASH: TRASH, EYE: EYE },
    acts: {}, inputs: {}, views: {}
  };
  FlowUI(A);
  LibUI(A);
  /* the search field of "Bisherige Lebensmittel" filters the list while typing and leaves the field alone (the keyboard stays open) */
  A.inputs.bookq = function (t) {
    R.bookQ = t.value;
    var el = document.getElementById('book-list');
    if (el) el.innerHTML = bookListHTML();
  };

  R.flow = resumeCandidate() ? 'run' : 'home';

  var app = document.getElementById('app');

  function render() {
    Anim.stop();
    var head, main, v, foot = true;
    if (R.detail) { v = A.views.detail(); head = v.head; main = v.main; foot = false; }
    else if (R.tab === 'cal') { head = calHeaderHTML(); main = calGridHTML() + calDetailHTML(); }
    else if (R.tab === 'food') {
      var k = R.foodDate, T = Store.dayTotals(S, k);
      head = foodHeaderHTML(); main = summaryHTML(T) + formHTML() + foodListHTML(k);
    } else if (R.tab === 'mine' && R.flow === 'run') { v = runView(); head = v.head; main = v.main; }
    else { v = A.views.flow(); head = v.head; main = v.main; foot = v.foot !== false; }
    app.innerHTML = '<h1 class="sr">Trainings-Strichliste</h1>' + head + '<main>' + main + '</main>' + (foot ? footHTML() : '') + navHTML();
    R.fresh = null;
    Anim.mount();
    syncUpdateBar();
  }

  /* ---------- events ---------- */
  app.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b || !app.contains(b)) return;
    unlockAudio(); wake();
    var a = b.getAttribute('data-act');
    if (A.acts[a]) { A.acts[a](b, e); return; }
    var t = curTraining(), d = t.id, cur = currentEx(t), n, k;

    if (a === 'tab') { goTab(b.getAttribute('data-tab'), b.getAttribute('data-key')); }
    else if (a === 'flow-home') { R.rest = null; R.plank = null; go({ tab: 'mine', flow: 'home', detail: null }); }
    else if (a === 'set' && cur) {
      var i = parseInt(b.getAttribute('data-i'), 10); n = doneSets(d, cur.id);
      setCount(cur, i < n ? i : n + 1);
    } else if (a === 'done' && cur) {
      setCount(cur, doneSets(d, cur.id) + 1);
    } else if (a === 'plank-start' && cur) {
      startPlank(cur);
    } else if (a === 'plank-cancel') {
      R.plank = null; render();
    } else if (a === 'plank-secs') {
      var secs = parseInt(b.getAttribute('data-secs'), 10);
      if (cur && cur.holds.indexOf(secs) >= 0) { S.holdSecs[cur.id] = secs; save(); render(); }
    } else if (a === 'skip') {
      R.rest = null; render(); toTop();
    } else if (a === 'plus' && R.rest) {
      var now = Date.now();
      R.rest.endAt = Math.max(R.rest.endAt, now) + 30000;
      R.rest.total = Math.max(R.rest.total, Math.ceil((R.rest.endAt - now) / 1000));
      R.rest.finished = false; render();
    } else if (a === 'undo' && R.last) {
      var ex = findEx(t, R.last);
      if (ex) { R.pick[d] = ex.id; setCount(ex, doneSets(d, ex.id) - 1); }
      R.last = null; toTop();
    } else if (a === 'pick') {
      R.pick[d] = b.getAttribute('data-id'); R.rest = null; R.plank = null; render(); toTop();
    } else if (a === 'demo-toggle') {
      R.demoOpen = !R.demoOpen; render();
    } else if (a === 'anim-play') {
      var id = b.getAttribute('data-ex');
      if (Anim.playing) { Anim.stop(); Anim.mount(); } else Anim.play(id);
    } else if (a === 'reset-ask') {
      R.confirm = true; render();
    } else if (a === 'reset-no') {
      R.confirm = false; render();
    } else if (a === 'reset-yes' || a === 'restart') {
      resetDay(d);
    } else if (a === 'cal-open') {
      R.calForm = true; render();
    } else if (a === 'cal-cancel') {
      R.calForm = false; render();
    } else if (a === 'cal-save') {
      calSave();
    } else if (a === 'cal-prev' || a === 'cal-next') {
      var dm = new Date(R.cal.y, R.cal.m + (a === 'cal-next' ? 1 : -1), 1);
      R.cal = { y: dm.getFullYear(), m: dm.getMonth() }; R.calUndo = null; render();
    } else if (a === 'cal-day') {
      R.calSel = b.getAttribute('data-key'); R.calOpen = null; R.calUndo = null; R.calAdd = false; render();
    } else if (a === 'cal-add') {
      var l = b.getAttribute('data-day');
      if (Store.addLog(S, R.calSel, Store.blankEntry(S, l), todayKey()).ok) { R.calOpen = l; R.calUndo = null; save(); }
      R.calAdd = false; render();
    } else if (a === 'cal-add-open') {
      R.calAdd = !R.calAdd; render();
    } else if (a === 'cal-add-go') {
      var sel = document.getElementById('cal-pick'), pid = sel ? sel.value : '';
      if (pid && Store.training(S, pid) && Store.addLog(S, R.calSel, Store.blankEntry(S, pid), todayKey()).ok) { R.calOpen = pid; R.calUndo = null; save(); }
      R.calAdd = false; render();
    } else if (a === 'entry-toggle') {
      var dl = b.getAttribute('data-day');
      R.calOpen = R.calOpen === dl ? null : dl; render();
    } else if (a === 'entry-sets') {
      var en = openEntry(), items = en ? Store.entryItems(S, en) : [], xe = null, ii;
      for (ii = 0; ii < items.length; ii++) if (items[ii].id === b.getAttribute('data-ex')) xe = items[ii];
      if (en && xe) {
        Store.setEntrySets(en, xe, (en.sets[xe.id] || 0) + parseInt(b.getAttribute('data-d'), 10));
        save(); render();
        var again = app.querySelector('[data-act="entry-sets"][data-ex="' + xe.id + '"][data-d="' + b.getAttribute('data-d') + '"]');
        if (again && !again.disabled && again.focus) again.focus();
      }
    } else if (a === 'entry-move') {
      moveEntry();
    } else if (a === 'entry-del') {
      var rm = R.calOpen ? Store.removeLog(S, R.calSel, R.calOpen) : null;
      if (rm) { R.calUndo = rm; R.calOpen = null; save(); render(); }
    } else if (a === 'cal-undo') {
      if (R.calUndo && Store.restoreLog(S, R.calUndo)) { R.calOpen = R.calUndo.entry.day; save(); }
      R.calUndo = null; render();
    } else if (a === 'food-prev') {
      R.foodDate = addDays(R.foodDate, -1); R.undo = null; R.foodMsg = ''; R.foodGoto = null; R.edit = null; R.copyOpen = false; render();
    } else if (a === 'food-next') {
      if (R.foodDate < todayKey()) { R.foodDate = addDays(R.foodDate, 1); R.undo = null; R.foodMsg = ''; R.foodGoto = null; R.edit = null; R.copyOpen = false; render(); }
    } else if (a === 'food-mode') {
      activeDraft().mode = Store.modeOf(b.getAttribute('data-mode')); render();
    } else if (a === 'food-more') {
      activeDraft().more = !activeDraft().more; render();
    } else if (a === 'food-add') {
      addFood();
    } else if (a === 'food-recent') {
      var rc = S.recent[parseInt(b.getAttribute('data-i'), 10)];
      if (rc) { R.draft = Store.draftFromEntry(rc); R.foodMsg = ''; R.foodGoto = null; render(); }
    } else if (a === 'book-toggle') {
      R.bookOpen = !R.bookOpen; R.bookQ = ''; render();
      if (R.bookOpen) scrollToId('book');
    } else if (a === 'book-pick') {
      var bn = b.getAttribute('data-name'), be = null;
      Store.foodBook(S).forEach(function (x) { if (x.name === bn) be = x; });
      if (be) {
        R.draft = Store.draftFromEntry(be); R.bookOpen = false; R.foodMsg = 'Übernommen. Prüfe die Menge und tippe auf „Hinzufügen“.'; R.foodGoto = null;
        render(); scrollToId('food-form');
      }
    } else if (a === 'food-edit') {
      startFoodEdit(b.getAttribute('data-id'));
    } else if (a === 'food-save') {
      saveFoodEdit();
    } else if (a === 'food-cancel') {
      endFoodEdit('');
    } else if (a === 'food-copy-today') {
      copyFoodTo(todayKey());
    } else if (a === 'food-copy-open') {
      R.copyOpen = !R.copyOpen; render();
      if (R.copyOpen) scrollToId('copy-date');
    } else if (a === 'food-copy-close') {
      R.copyOpen = false; render();
    } else if (a === 'food-copy-go') {
      var ci = document.getElementById('copy-date');
      copyFoodTo(ci ? ci.value : '');
    } else if (a === 'food-goto') {
      goTab('food', b.getAttribute('data-key'));
    } else if (a === 'food-del') {
      k = R.foodDate;
      var removed = Store.removeFood(S, k, b.getAttribute('data-id'));
      if (removed) {
        R.undo = removed;
        if (R.edit && R.edit.id === removed.entry.id) { R.edit = null; R.copyOpen = false; }
      }
      R.foodMsg = ''; R.foodGoto = null; save(); render();
    } else if (a === 'food-undo' && R.undo) {
      Store.restoreFood(S, R.undo);
      R.undo = null; save(); render();
    } else if (a === 'goal-toggle') {
      R.goalOpen = !R.goalOpen; render();
    } else if (a === 'goal-w16') {
      if (S.weightKg) { S.goalP = Math.round(1.6 * S.weightKg); save(); render(); }
    } else if (a === 'bk-toggle') {
      R.bkOpen = !R.bkOpen; R.bkMsg = ''; R.restore = null; render();
    } else if (a === 'bk-copy') {
      var text = exportText(), ta = document.getElementById('bk-text');
      var fallback = function () {
        if (ta) { ta.value = text; ta.focus(); ta.select(); }
        R.bkMsg = 'Markiere den Text im Feld und kopiere ihn.'; setMsg('bk-msg', R.bkMsg);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { R.bkMsg = 'Kopiert. Füge den Text jetzt in eine Notiz ein.'; setMsg('bk-msg', R.bkMsg); }, fallback);
        } else fallback();
      } catch (err) { fallback(); }
    } else if (a === 'bk-file') {
      downloadBackup();
    } else if (a === 'bk-restore') {
      var ta2 = document.getElementById('bk-text');
      tryRestore(ta2 ? ta2.value : '');
    } else if (a === 'restore-yes') {
      if (R.restore) applyRestore(R.restore.state);
    } else if (a === 'restore-no') {
      R.restore = null; R.bkMsg = 'Nichts geändert.'; render();
    }
  });

  app.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var key;
    for (key in A.inputs) {
      if (t.hasAttribute('data-' + key)) { A.inputs[key](t, e); return; }
    }
    var w = t.getAttribute('data-weight'), dn = t.getAttribute('data-draft'), dv = t.getAttribute('data-draft-v'), gl = t.getAttribute('data-goal');
    var ew = t.getAttribute('data-eweight'), enote = t.getAttribute('data-enote');
    if (w) { S.weights[w] = t.value; save(); }
    else if (dn) { activeDraft()[dn] = t.value; setMsg('food-preview', previewText()); }
    else if (dv) { activeDraft().v[dv] = t.value; setMsg('food-preview', previewText()); }
    else if (ew) { var en1 = openEntry(); if (en1) { Store.setEntryWeight(en1, ew, t.value); save(); } }
    else if (enote) { var en2 = openEntry(); if (en2) { Store.setEntryNote(en2, t.value); save(); } }
    else if (gl === 'p') { S.goalP = Store.num(t.value) > 0 ? Store.num(t.value) : null; save(); }
    else if (gl === 'k') { S.goalK = Store.num(t.value) > 0 ? Store.num(t.value) : null; save(); }
    else if (gl === 'w') {
      S.weightKg = Store.num(t.value) > 0 ? Store.num(t.value) : null; save();
      var hEl = document.getElementById('goal-hint'), bEl = document.getElementById('goal-btn');
      if (hEl) hEl.textContent = goalHintText();
      if (bEl) bEl.innerHTML = goalBtnHTML();
    }
  });

  app.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.id === 'bk-upload' && t.files && t.files[0]) readFile(t.files[0]);
  });

  /* The totals and the header bar pick up a new goal when the field is left for nothing in particular.
     Moving to another field or a button must not re-render, or the keyboard closes and the tap is lost. */
  app.addEventListener('focusout', function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-goal') && !e.relatedTarget) render();
  });

  app.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key === 'Enter' && t && t.getAttribute && (t.getAttribute('data-draft') || t.getAttribute('data-draft-v'))) {
      e.preventDefault();
      if (R.edit) saveFoodEdit(); else addFood();
    }
    if (e.key === 'Enter' && t && t.hasAttribute && t.hasAttribute('data-tname') && A.acts['name-save']) { e.preventDefault(); A.acts['name-save'](t, e); }
  });

  /* ---------- timers ---------- */
  var inRun = function () { return R.tab === 'mine' && R.flow === 'run' && !R.detail; };
  setInterval(function () {
    var now = Date.now(), el;
    if (R.plank) {
      var p = R.plank;
      if (now >= p.endAt) {
        var ex = p.ex; R.plank = null; beep(2); buzz([200, 100, 200]);
        setCount(ex, doneSets(S.cur, ex.id) + 1);
        return;
      }
      var ps = plankState();
      if (ps.idx !== p.idx) { p.idx = ps.idx; beep(1); buzz(120); render(); }
      else {
        el = document.getElementById('plank-time'); if (el) el.textContent = ps.left;
        el = document.getElementById('plank-ring'); if (el) el.style.strokeDashoffset = Math.round(553 * (1 - ps.frac));
      }
    }
    if (R.rest) {
      var r = R.rest, left = Math.max(0, Math.ceil((r.endAt - now) / 1000));
      el = document.getElementById('rest-clock'); if (el) el.textContent = clock(left);
      el = document.getElementById('rest-bar'); if (el) el.style.width = Math.max(0, Math.min(100, left / r.total * 100)) + '%';
      if (left === 0 && !r.finished) {
        r.finished = true; beep(1); buzz([150, 80, 150]);
        if (inRun() && !Anim.playing) render();
      }
    }
  }, 250);

  /* ---------- installable app: storage persistence, service worker, update bar ---------- */
  var updBar = document.getElementById('upd'), swReg = null, wantReload = false, lastCheck = 0;

  /* The bar stays out of the way while a plank or a pause runs, and nothing ever reloads by itself: only a tap on "Neu laden" does. */
  function syncUpdateBar() {
    if (!updBar) return;
    var show = !!R.upd && !R.plank && !R.rest;
    updBar.hidden = !show;
    document.body.classList.toggle('has-upd', show);
    if (show) { var nav = document.querySelector('.nav'); if (nav) updBar.style.bottom = nav.offsetHeight + 'px'; }
  }
  function offerUpdate(worker) { R.upd = worker; syncUpdateBar(); }
  function applyUpdate() {
    wantReload = true;
    var w = R.upd || (swReg && swReg.waiting);
    try { if (w) w.postMessage({ type: 'SKIP_WAITING' }); else location.reload(); } catch (e) { location.reload(); }
    setTimeout(function () { if (wantReload) { wantReload = false; location.reload(); } }, 4000);
  }
  function watchRegistration(reg) {
    swReg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
    reg.addEventListener('updatefound', function () {
      var w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', function () {
        if (w.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(w);
      });
    });
  }
  /* A phone keeps an opened app alive for days, so look for a new version when it comes back to the front (at most every 10 minutes). */
  function checkUpdate() {
    var t = Date.now();
    if (!swReg || t - lastCheck < 10 * 60 * 1000) return;
    lastCheck = t;
    try { swReg.update().catch(noop); } catch (e) { /* ignore */ }
  }
  function initPWA() {
    try {
      if (navigator.storage && navigator.storage.persist && navigator.storage.persisted) {
        navigator.storage.persisted().then(function (p) { return p || navigator.storage.persist(); }).catch(noop);
      }
    } catch (e) { /* ignore */ }
    if (!('serviceWorker' in navigator)) return;
    if (updBar) {
      var go2 = document.getElementById('upd-go');
      if (go2) go2.addEventListener('click', applyUpdate);
    }
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (wantReload) { wantReload = false; location.reload(); }
    });
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(watchRegistration).catch(noop);
    navigator.serviceWorker.ready.then(function () {
      R.offlineReady = true;
      var el = document.getElementById('ver-note');
      if (el) el.textContent = ' · läuft auch ohne Internet';
    }).catch(noop);
    window.addEventListener('online', checkUpdate);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { wake(); refreshDays(); save(); checkUpdate(); if (!Anim.playing) render(); }
  });

  refreshDays();
  render();
  initPWA();
})();
