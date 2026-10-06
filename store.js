/* Store: state shape, validation, migration, backup parsing and the pure edit helpers.
   No DOM access, so it runs in the browser (global Store) and in Node (module.exports), where the tests use it directly.
   Everything that comes from outside (localStorage, a pasted backup, a file) goes through migrate(), which never trusts its input.
   A training is identified by an id: "A" and "B" (the days of the first version), "p-..." (ready-made, trainings.js) or "u..." (made by the user). */
var Store = (function (data) {
  'use strict';

  var EX = data.EX, TEMPLATES = data.TEMPLATES, TEMPLATE_MAP = data.TEMPLATE_MAP, NUTR = data.NUTR;
  var GROUPS = data.GROUPS, EQUIP = data.EQUIP, PRESETS = data.PRESETS;
  var KEY = 'strichliste.v1';
  var SCHEMA = 3;
  var NOTE_MAX = 300, NAME_MAX = 60, MAX_TRAININGS = 80, MAX_ITEMS = 24;
  var ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/;

  /* ---------- small helpers ---------- */
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function keyOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return keyOf(new Date()); }
  function parseKey(k) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof k === 'string' ? k : '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function num(v) {
    if (v == null) return null;
    var s = String(v).trim().replace(',', '.');
    if (s === '') return null;
    var n = parseFloat(s);
    return (isFinite(n) && n >= 0) ? n : null;
  }
  function posNum(v) { return (typeof v === 'number' && isFinite(v) && v > 0) ? v : null; }
  function intIn(v, lo, hi) { var n = typeof v === 'number' ? v : parseFloat(v); return isFinite(n) ? Math.min(hi, Math.max(lo, Math.floor(n))) : null; }
  function fmt(v, u) {
    var r = u === 'kcal' ? Math.round(v) : (v >= 100 ? Math.round(v) : Math.round(v * 10) / 10);
    return String(r).replace('.', ',');
  }
  function numStr(v) { return String(v).replace('.', ','); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function cleanKey(v) { return parseKey(v) ? v : ''; }
  function validId(k) { return typeof k === 'string' && ID_RE.test(k); }
  function byDay(a, b) { return a.day < b.day ? -1 : (a.day > b.day ? 1 : 0); }
  function getMap(map, id) { return own(map, id) ? map[id] : undefined; }

  /* ---------- state ---------- */
  function newState() {
    return {
      schema: SCHEMA, cur: 'A', last: [], trainings: [], sets: {}, stamp: {}, logged: {}, weights: {}, holdSecs: {},
      prefs: { equip: null, preset: '', level: 1, minutes: 45 },
      log: {}, food: {}, recent: [], goalP: null, weightKg: null
    };
  }

  /* ---------- cleaning of single parts ---------- */
  function cleanSets(o) {
    var out = {};
    if (!isObj(o)) return out;
    Object.keys(o).forEach(function (id) {
      if (!validId(id)) return;
      var n = typeof o[id] === 'number' ? o[id] : parseFloat(o[id]);
      if (isFinite(n) && n >= 1) out[id] = Math.min(99, Math.floor(n));
    });
    return out;
  }
  function cleanWeightText(v) {
    if (typeof v === 'number' && isFinite(v) && v >= 0) v = String(v).replace('.', ',');
    return typeof v === 'string' ? v.trim().slice(0, 12) : '';
  }
  function cleanWeights(o) {
    var out = {};
    if (!isObj(o)) return out;
    Object.keys(o).forEach(function (id) {
      var t = cleanWeightText(o[id]);
      if (validId(id) && t) out[id] = t;
    });
    return out;
  }
  function cleanNote(v) { return typeof v === 'string' ? v.slice(0, NOTE_MAX) : ''; }
  function cleanName(v, fallback) { var t = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : ''; return t || fallback || ''; }
  function mapOfKeys(src, clean) {
    var out = {};
    if (!isObj(src)) return out;
    Object.keys(src).forEach(function (id) { if (validId(id)) { var v = clean(src[id]); if (v != null) out[id] = v; } });
    return out;
  }

  /* ---------- trainings (the ones the user made) ---------- */
  function cleanItem(it) {
    if (!isObj(it) || typeof it.ex !== 'string' || !own(EX, it.ex)) return null;
    var o = { ex: it.ex }, n;
    if ((n = intIn(it.sets, 1, 10)) != null) o.sets = n;
    if (typeof it.reps === 'string' && it.reps.trim()) o.reps = it.reps.trim().slice(0, 12);
    if (it.rest != null && (n = intIn(it.rest, 0, 300)) != null) o.rest = n;
    if (it.hold != null && (n = intIn(it.hold, 5, 600)) != null) o.hold = n;
    return o;
  }
  function cleanItems(arr) {
    var out = [], seen = {};
    if (!Array.isArray(arr)) return out;
    arr.forEach(function (it) {
      var c = cleanItem(it);
      if (c && !seen[c.ex] && out.length < MAX_ITEMS) { seen[c.ex] = true; out.push(c); }
    });
    return out;
  }
  function cleanGroups(a) {
    var out = [];
    if (!Array.isArray(a)) return out;
    a.forEach(function (g) { if (GROUPS.some(function (x) { return x.id === g; }) && out.indexOf(g) < 0 && out.length < 4) out.push(g); });
    return out;
  }
  function cleanTraining(t, used) {
    if (!isObj(t)) return null;
    var id = (validId(t.id) && !own(TEMPLATE_MAP, t.id) && !used[t.id]) ? t.id : 'u' + uid();
    var out = { id: id, name: cleanName(t.name, 'Mein Training'), items: cleanItems(t.items), created: cleanKey(t.created) };
    var g = cleanGroups(t.groups);
    if (g.length) out.groups = g;
    return out;
  }
  function cleanTrainings(src) {
    var used = {}, out = [];
    if (!Array.isArray(src)) return out;
    src.forEach(function (t) {
      var c = out.length < MAX_TRAININGS ? cleanTraining(t, used) : null;
      if (c) { used[c.id] = true; out.push(c); }
    });
    return out;
  }
  function cleanPrefs(p) {
    var out = newState().prefs;
    if (!isObj(p)) return out;
    if (Array.isArray(p.equip)) {
      var seen = {};
      out.equip = p.equip.filter(function (id) { var ok = EQUIP.some(function (e) { return e.id === id; }) && !seen[id]; seen[id] = true; return ok; });
    }
    if (PRESETS.some(function (x) { return x.id === p.preset; })) out.preset = p.preset;
    var lv = intIn(p.level, 1, 3); if (lv != null) out.level = lv;
    var mi = intIn(p.minutes, 5, 180); if (mi != null) out.minutes = mi;
    return out;
  }

  /* A resolved exercise as the run view and the calendar use it: library entry plus what the training item changes. */
  function exItem(it) {
    var e = EX[it.ex];
    var o = { id: e.id, name: e.name, gear: e.gear || '', sets: it.sets || e.sets, big: it.reps || e.reps, unit: e.unit, rest: it.rest != null ? it.rest : e.rest,
      weight: !!e.weight, knee: !!e.knee, cues: e.cues, note: it.note || '', regions: e.regions };
    if (e.timer) { o.timer = true; o.holds = e.holds; o.hold = it.hold || e.hold; o.sides = e.sides || 1; }
    return o;
  }
  function findDef(state, id) {
    if (own(TEMPLATE_MAP, id)) return TEMPLATE_MAP[id];
    var a = state.trainings;
    for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
    return null;
  }
  function training(state, id) {
    var d = findDef(state, id);
    if (!d) return null;
    return { id: d.id, name: d.name, sub: d.sub || '', builtin: own(TEMPLATE_MAP, d.id), origin: !!d.origin, kneeCheck: !!d.kneeCheck, groups: d.groups || [],
      defItems: d.items, items: d.items.map(exItem) };
  }
  /* every training the user can pick: their own first (newest first), then the ready-made ones */
  function allTrainings(state) {
    var own1 = state.trainings.slice().reverse().map(function (t) { return training(state, t.id); });
    return { own: own1, ready: TEMPLATES.map(function (t) { return training(state, t.id); }) };
  }
  function itemsOfDef(d) { return d.items.map(function (it) { var o = { ex: it.ex }; ['sets', 'reps', 'rest', 'hold'].forEach(function (k) { if (it[k] != null) o[k] = it[k]; }); return o; }); }
  function addTraining(state, name, items, groups) {
    var t = { id: 'u' + uid(), name: cleanName(name, 'Mein Training'), items: cleanItems(items), created: todayKey() };
    var g = cleanGroups(groups); if (g.length) t.groups = g;
    state.trainings.push(t);
    return t;
  }
  function removeTraining(state, id) {
    for (var i = 0; i < state.trainings.length; i++) {
      if (state.trainings[i].id !== id) continue;
      var t = state.trainings.splice(i, 1)[0];
      var saved = { def: t, idx: i, sets: state.sets[id], stamp: state.stamp[id], logged: state.logged[id], cur: state.cur === id };
      delete state.sets[id]; delete state.stamp[id]; delete state.logged[id];
      state.last = state.last.filter(function (x) { return x !== id; });
      if (state.cur === id) state.cur = 'A';
      return saved;
    }
    return null;
  }
  function restoreTraining(state, saved) {
    if (findDef(state, saved.def.id)) return false;
    state.trainings.splice(Math.min(saved.idx, state.trainings.length), 0, saved.def);
    if (saved.sets) state.sets[saved.def.id] = saved.sets;
    if (saved.stamp) state.stamp[saved.def.id] = saved.stamp;
    if (saved.logged) state.logged[saved.def.id] = saved.logged;
    return true;
  }
  /* The user's own copy of any training (ready-made or their own) to change. */
  function copyTraining(state, id, name) {
    var d = findDef(state, id);
    if (!d) return null;
    return addTraining(state, name || (d.name + ' (Kopie)'), itemsOfDef(d), d.groups);
  }
  function touch(state, id) {
    state.cur = id;
    state.last = [id].concat(state.last.filter(function (x) { return x !== id; })).slice(0, 5);
  }

  /* ---------- the checklist of a training ---------- */
  function setsOf(state, id) { return own(state.sets, id) ? state.sets[id] : (state.sets[id] = {}); }
  /* A new day starts the checklists from scratch. Returns the ids of the trainings that were reset. */
  function refreshDays(state, today) {
    var out = [];
    Object.keys(state.stamp).forEach(function (id) {
      if (state.stamp[id] && state.stamp[id] !== today) {
        state.sets[id] = {}; state.stamp[id] = ''; state.logged[id] = '';
        out.push(id);
      }
    });
    return out;
  }

  /* ---------- the calendar log ---------- */
  /* An entry is { day: training id, title?, targets?: {exerciseId: planned sets}, sets: {exerciseId: n}, weights: {exerciseId: "60"}, note }.
     title and targets are the snapshot of the training at that time, so a renamed or deleted training does not change what the calendar shows.
     Schema 1 stored only the letter: "A". It becomes an entry without details. */
  function cleanTargets(o) {
    var out = {};
    if (!isObj(o)) return out;
    Object.keys(o).forEach(function (id) {
      if (!own(EX, id)) return;
      var n = intIn(o[id], 1, 10);
      if (n != null) out[id] = n;
    });
    return out;
  }
  function cleanLogEntry(e) {
    if (e === 'A' || e === 'B') return { day: e, sets: {}, weights: {}, note: '' };
    if (!isObj(e) || !validId(e.day)) return null;
    var out = { day: e.day, sets: cleanSets(e.sets), weights: cleanWeights(e.weights), note: cleanNote(e.note) };
    var title = cleanName(e.title, '');
    if (title) out.title = title;
    var tg = cleanTargets(e.targets);
    if (Object.keys(tg).length) out.targets = tg;
    return out;
  }
  function cleanLog(src) {
    var L = {};
    if (!isObj(src)) return L;
    Object.keys(src).forEach(function (k) {
      if (!parseKey(k) || !Array.isArray(src[k])) return;
      var seen = {}, a = [];
      src[k].forEach(function (x) {
        var c = cleanLogEntry(x);
        if (c && !seen[c.day]) { seen[c.day] = true; a.push(c); }
      });
      if (a.length) L[k] = a.sort(byDay);
    });
    return L;
  }

  /* ---------- food ---------- */
  function modeOf(m) { return m === 'por' ? 'por' : (m === 'ml' ? 'ml' : '100'); }
  function unitOf(mode) { return mode === 'ml' ? 'ml' : 'g'; }
  function cleanEntry(e, used) {
    if (!isObj(e)) return null;
    var v = {};
    if (isObj(e.v)) NUTR.forEach(function (n) { var x = e.v[n.k]; if (typeof x === 'number' && isFinite(x) && x >= 0) v[n.k] = x; });
    var g = (typeof e.g === 'number' && isFinite(e.g) && e.g >= 0) ? e.g : null;
    var id = (typeof e.id === 'string' || typeof e.id === 'number') ? String(e.id).slice(0, 40) : '';
    if (!id || (used && used[id])) id = uid();
    return { id: id, name: typeof e.name === 'string' ? e.name.slice(0, 80) : '', g: g, mode: modeOf(e.mode), v: v };
  }
  function cleanFood(src) {
    var F = {};
    if (!isObj(src)) return F;
    Object.keys(src).forEach(function (k) {
      if (!parseKey(k) || !Array.isArray(src[k])) return;
      var used = {}, a = [];
      src[k].forEach(function (x) {
        var c = cleanEntry(x, used);
        if (c) { used[c.id] = true; a.push(c); }
      });
      if (a.length) F[k] = a;
    });
    return F;
  }
  function cleanRecent(src) {
    if (!Array.isArray(src)) return [];
    var used = {}, out = [];
    src.forEach(function (x) {
      var c = cleanEntry(x, used);
      if (c && c.name) { used[c.id] = true; out.push(c); }
    });
    return out.slice(0, 8);
  }

  /* ---------- migration ---------- */
  function schemaOf(raw) { return (isObj(raw) && typeof raw.schema === 'number' && raw.schema >= 1) ? Math.floor(raw.schema) : 1; }

  /* Any object in, a complete and valid state of the current schema out. Unknown or broken parts are dropped, never thrown on.
     Schema 1 and 2 knew only the days "A" and "B" ("day", "plankSecs"); they become the trainings "A" and "B" ("cur", "holdSecs"). */
  function migrate(raw) {
    var s = newState();
    if (!isObj(raw)) return s;
    s.trainings = cleanTrainings(raw.trainings);
    var cur = raw.cur != null ? raw.cur : raw.day;
    if (validId(cur) && (own(TEMPLATE_MAP, cur) || s.trainings.some(function (t) { return t.id === cur; }))) s.cur = cur;
    s.sets = isObj(raw.sets) ? mapOfKeys(raw.sets, function (v) { var c = cleanSets(v); return Object.keys(c).length ? c : null; }) : {};
    s.stamp = mapOfKeys(isObj(raw.stamp) ? raw.stamp : {}, function (v) { var c = cleanKey(v); return c || null; });
    s.logged = mapOfKeys(isObj(raw.logged) ? raw.logged : {}, function (v) { var c = cleanKey(v); return c || null; });
    s.weights = cleanWeights(raw.weights);
    s.holdSecs = mapOfKeys(raw.holdSecs, function (v) { return intIn(v, 5, 600); });
    if (raw.plankSecs === 45 || raw.plankSecs === 60) { if (!own(s.holdSecs, 'a-plank')) s.holdSecs['a-plank'] = raw.plankSecs; }
    if (Array.isArray(raw.last)) {
      raw.last.forEach(function (id) {
        if (validId(id) && s.last.indexOf(id) < 0 && s.last.length < 5 && (own(TEMPLATE_MAP, id) || s.trainings.some(function (t) { return t.id === id; }))) s.last.push(id);
      });
    }
    s.prefs = cleanPrefs(raw.prefs);
    s.log = cleanLog(raw.log);
    s.food = cleanFood(raw.food);
    s.recent = cleanRecent(raw.recent);
    s.goalP = posNum(raw.goalP);
    s.weightKg = posNum(raw.weightKg);
    return s;
  }

  /* ---------- backup text / file ---------- */
  var KNOWN = ['log', 'food', 'recent', 'sets', 'weights', 'goalP', 'weightKg', 'plankSecs', 'day', 'stamp', 'logged', 'trainings', 'cur', 'holdSecs', 'prefs'];
  function looksLikeBackup(o) { return isObj(o) && KNOWN.some(function (k) { return k in o; }); }

  /* Accepts what "Daten kopieren" or "Als Datei sichern" produced, also from the old claude.ai version.
     Forgiving about a BOM, code fences or a title line that a notes app may have added around the JSON. */
  function parseBackup(text) {
    var t = typeof text === 'string' ? text.replace(/^﻿/, '').trim() : '';
    if (!t) return { ok: false, error: 'empty' };
    var a = t.indexOf('{'), b = t.lastIndexOf('}'), raw;
    if (a < 0 || b <= a) return { ok: false, error: 'json' };
    try { raw = JSON.parse(t.slice(a, b + 1)); } catch (e) { return { ok: false, error: 'json' }; }
    if (!looksLikeBackup(raw)) return { ok: false, error: 'shape' };
    return { ok: true, state: migrate(raw), from: schemaOf(raw) };
  }
  function toText(state, indent) { return JSON.stringify(state, null, indent || 0); }

  /* ---------- storage ---------- */
  function save(storage, state) {
    try { storage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
  }
  /* status: 'new' | 'ok' | 'migrated' | 'corrupt' | 'unavailable'. What was stored is kept under a second key before it is replaced. */
  function load(storage) {
    var raw, parsed;
    try { raw = storage.getItem(KEY); } catch (e) { return { state: newState(), status: 'unavailable' }; }
    if (!raw) return { state: newState(), status: 'new' };
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    if (!isObj(parsed)) {
      try { storage.setItem(KEY + '.corrupt', raw); } catch (e2) { /* ignore */ }
      return { state: newState(), status: 'corrupt' };
    }
    var from = schemaOf(parsed), state = migrate(parsed);
    if (from < SCHEMA) {
      try { storage.setItem(KEY + '.schema' + from, raw); } catch (e) { /* ignore */ }
      save(storage, state);
      return { state: state, status: 'migrated' };
    }
    return { state: state, status: 'ok' };
  }
  function backupBefore(storage, state, tag) {
    try { storage.setItem(KEY + '.' + tag, JSON.stringify(state)); return true; } catch (e) { return false; }
  }

  function counts(state) {
    var t = 0, f = 0;
    Object.keys(state.log).forEach(function (k) { t += state.log[k].length; });
    Object.keys(state.food).forEach(function (k) { f += state.food[k].length; });
    return { trainings: t, foods: f, plans: state.trainings.length };
  }
  function isEmpty(state) { var c = counts(state); return c.trainings === 0 && c.foods === 0 && c.plans === 0; }

  /* ---------- training log ---------- */
  function logEntry(state, key, day) {
    var a = state.log[key] || [];
    for (var i = 0; i < a.length; i++) if (a[i].day === day) return a[i];
    return null;
  }
  function targetsOf(items) { var t = {}; items.forEach(function (ex) { t[ex.id] = ex.sets; }); return t; }
  /* The exercises an entry is about: its own snapshot if it has one, else the training it names (entries of the first version). */
  function entryItems(state, entry) {
    if (entry.targets) return Object.keys(entry.targets).map(function (id) { return exItem({ ex: id, sets: entry.targets[id] }); });
    var t = training(state, entry.day);
    if (t) return t.items;
    return Object.keys(entry.sets).filter(function (id) { return own(EX, id); }).map(function (id) { return exItem({ ex: id, sets: Math.max(3, entry.sets[id]) }); });
  }
  function entryTitle(state, entry) {
    if (entry.title) return entry.title;
    var t = training(state, entry.day);
    return t ? t.name : 'Training';
  }
  function entrySub(state, entry) {
    var t = training(state, entry.day);
    return t && t.sub ? t.sub : '';
  }
  /* Snapshot of today's checklist: only exercises with at least one set, weights only where the exercise has a weight field. */
  function snapshot(state, id) {
    var t = training(state, id), sets = {}, weights = {}, done = getMap(state.sets, id) || {};
    t.items.forEach(function (ex) {
      var n = Math.min(done[ex.id] || 0, ex.sets);
      if (n > 0) sets[ex.id] = n;
      var w = cleanWeightText(state.weights[ex.id]);
      if (ex.weight && w) weights[ex.id] = w;
    });
    return { day: id, title: t.name, targets: targetsOf(t.items), sets: sets, weights: weights, note: '' };
  }
  function blankEntry(state, id) {
    var t = training(state, id);
    var e = { day: id, sets: {}, weights: {}, note: '' };
    if (t) { e.title = t.name; e.targets = targetsOf(t.items); }
    return e;
  }
  /* A training exists once per date. Adding to a taken slot is refused so nothing already stored gets overwritten. */
  function addLog(state, key, entry, today) {
    if (!parseKey(key)) return { ok: false, reason: 'invalid' };
    if (key > today) return { ok: false, reason: 'future' };
    if (logEntry(state, key, entry.day)) return { ok: false, reason: 'exists' };
    var a = state.log[key] || (state.log[key] = []);
    a.push(entry); a.sort(byDay);
    return { ok: true };
  }
  /* "Training in Kalender eintragen": a free slot gets the snapshot of today's checklist, a slot that only holds the bare letter
     (an entry from the old version or one added by hand) gets the details, a slot that already has details is left untouched. */
  function logSession(state, key, id, today) {
    if (!parseKey(key)) return { ok: false, reason: 'invalid' };
    if (key > today) return { ok: false, reason: 'future' };
    var snap = snapshot(state, id), cur = logEntry(state, key, id);
    if (!cur) return addLog(state, key, snap, today);
    if (entrySummary(state, cur).hasDetails) return { ok: false, reason: 'exists' };
    cur.sets = snap.sets; cur.weights = snap.weights; cur.title = snap.title; cur.targets = snap.targets;
    return { ok: true, filled: true };
  }
  function removeLog(state, key, day) {
    var a = state.log[key];
    if (!a) return null;
    for (var i = 0; i < a.length; i++) {
      if (a[i].day === day) {
        var e = a.splice(i, 1)[0];
        if (!a.length) delete state.log[key];
        return { key: key, entry: e, idx: i };
      }
    }
    return null;
  }
  function restoreLog(state, removed) {
    if (logEntry(state, removed.key, removed.entry.day)) return false;
    var a = state.log[removed.key] || (state.log[removed.key] = []);
    a.splice(Math.min(removed.idx, a.length), 0, removed.entry);
    a.sort(byDay);
    return true;
  }
  function moveLog(state, from, day, to, today) {
    var e = logEntry(state, from, day);
    if (!e) return { ok: false, reason: 'missing' };
    if (!parseKey(to)) return { ok: false, reason: 'invalid' };
    if (to > today) return { ok: false, reason: 'future' };
    if (to === from) return { ok: true, same: true };
    if (logEntry(state, to, day)) return { ok: false, reason: 'exists' };
    removeLog(state, from, day);
    var a = state.log[to] || (state.log[to] = []);
    a.push(e); a.sort(byDay);
    if (state.logged[day] === from) state.logged[day] = to;
    return { ok: true };
  }
  function setEntrySets(entry, ex, n) {
    n = Math.max(0, Math.min(ex.sets, Math.floor(n) || 0));
    if (n > 0) entry.sets[ex.id] = n; else delete entry.sets[ex.id];
    return n;
  }
  function setEntryWeight(entry, exId, text) {
    var t = cleanWeightText(text);
    if (t) entry.weights[exId] = t; else delete entry.weights[exId];
  }
  function setEntryNote(entry, text) { entry.note = cleanNote(text); }
  function entrySummary(state, entry) {
    var done = 0, total = 0;
    entryItems(state, entry).forEach(function (ex) { done += Math.min(entry.sets[ex.id] || 0, ex.sets); total += ex.sets; });
    return { done: done, total: total, hasDetails: done > 0 || Object.keys(entry.weights).length > 0 };
  }
  /* The session marker only counts while the entry it points to still exists. */
  function loggedDate(state, id) {
    var k = getMap(state.logged, id);
    return (k && logEntry(state, k, id)) ? k : '';
  }
  /* The letter or first letter shown on a calendar day for an entry. */
  function tagOf(state, entry) {
    if (entry.day === 'A' || entry.day === 'B') return entry.day;
    var t = entryTitle(state, entry).replace(/[^A-Za-zÄÖÜäöü0-9]/g, '');
    return t ? t.charAt(0).toUpperCase() : '•';
  }

  /* ---------- food ---------- */
  function entryTotals(e) {
    var out = {};
    NUTR.forEach(function (n) {
      var v = e.v[n.k];
      if (v == null) return;
      if (e.mode === 'por') out[n.k] = v;
      else if (e.g != null) out[n.k] = v * e.g / 100;
    });
    return out;
  }
  function dayTotals(state, key) {
    var sum = {}, has = {}, skipped = 0, list = state.food[key] || [];
    list.forEach(function (e) {
      var t = entryTotals(e), any = false;
      NUTR.forEach(function (n) { if (t[n.k] != null) { sum[n.k] = (sum[n.k] || 0) + t[n.k]; has[n.k] = true; any = true; } });
      if (!any && Object.keys(e.v).length) skipped++;
    });
    return { sum: sum, has: has, skipped: skipped, n: list.length };
  }
  function partsOf(tot) {
    var out = [];
    NUTR.forEach(function (n) { if (tot[n.k] != null) out.push(fmt(tot[n.k], n.u) + (n.u === 'kcal' ? ' kcal' : ' g ' + n.l)); });
    return out;
  }

  /* The form works on text; an entry on numbers. These two convert between them. */
  function newDraft(mode) { return { name: '', g: '', mode: modeOf(mode), v: { kcal: '', p: '', f: '', c: '', s: '', b: '' }, more: false }; }
  function draftFromEntry(e) {
    var d = newDraft(e.mode);
    d.name = e.name; d.g = e.g != null ? numStr(e.g) : '';
    NUTR.forEach(function (n) { if (e.v[n.k] != null) d.v[n.k] = numStr(e.v[n.k]); });
    d.more = !!(e.v.s != null || e.v.b != null);
    return d;
  }
  function entryFromDraft(d) {
    var v = {};
    NUTR.forEach(function (n) { var x = num(d.v[n.k]); if (x != null) v[n.k] = x; });
    return { name: d.name.trim(), g: num(d.g), mode: modeOf(d.mode), v: v };
  }
  function isBlankEntry(e) { return !e.name && e.g == null && !Object.keys(e.v).length; }
  function copyEntry(e) {
    var v = {};
    Object.keys(e.v).forEach(function (k) { v[k] = e.v[k]; });
    return { id: uid(), name: e.name, g: e.g, mode: e.mode, v: v };
  }
  function rememberRecent(state, e) {
    if (!e.name) return;
    var lower = e.name.toLowerCase();
    state.recent = state.recent.filter(function (x) { return x.name.toLowerCase() !== lower; });
    var c = copyEntry(e); c.id = e.id;
    state.recent.unshift(c);
    state.recent = state.recent.slice(0, 8);
  }
  function findFood(state, key, id) {
    var list = state.food[key] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return { entry: list[i], idx: i };
    return null;
  }
  function addFood(state, key, e) {
    (state.food[key] = state.food[key] || []).push(e);
    rememberRecent(state, e);
  }
  function removeFood(state, key, id) {
    var f = findFood(state, key, id);
    if (!f) return null;
    state.food[key].splice(f.idx, 1);
    if (!state.food[key].length) delete state.food[key];
    return { key: key, entry: f.entry, idx: f.idx };
  }
  function restoreFood(state, removed) {
    var list = state.food[removed.key] || (state.food[removed.key] = []);
    list.splice(Math.min(removed.idx, list.length), 0, removed.entry);
  }

  return {
    KEY: KEY, SCHEMA: SCHEMA, NOTE_MAX: NOTE_MAX, NAME_MAX: NAME_MAX,
    isObj: isObj, own: own, pad: pad, keyOf: keyOf, todayKey: todayKey, parseKey: parseKey, addDays: addDays, num: num, fmt: fmt, numStr: numStr, uid: uid,
    newState: newState, migrate: migrate, schemaOf: schemaOf, parseBackup: parseBackup, toText: toText,
    load: load, save: save, backupBefore: backupBefore, counts: counts, isEmpty: isEmpty, refreshDays: refreshDays,
    training: training, allTrainings: allTrainings, addTraining: addTraining, removeTraining: removeTraining, restoreTraining: restoreTraining,
    copyTraining: copyTraining, itemsOfDef: itemsOfDef, touch: touch, setsOf: setsOf, exItem: exItem, cleanItems: cleanItems, cleanName: cleanName, cleanGroups: cleanGroups,
    logEntry: logEntry, entryItems: entryItems, entryTitle: entryTitle, entrySub: entrySub, tagOf: tagOf, snapshot: snapshot, blankEntry: blankEntry,
    addLog: addLog, logSession: logSession, removeLog: removeLog, restoreLog: restoreLog, moveLog: moveLog,
    setEntrySets: setEntrySets, setEntryWeight: setEntryWeight, setEntryNote: setEntryNote, entrySummary: entrySummary, loggedDate: loggedDate,
    entryTotals: entryTotals, dayTotals: dayTotals, partsOf: partsOf, unitOf: unitOf, modeOf: modeOf,
    newDraft: newDraft, draftFromEntry: draftFromEntry, entryFromDraft: entryFromDraft, isBlankEntry: isBlankEntry, copyEntry: copyEntry,
    rememberRecent: rememberRecent, findFood: findFood, addFood: addFood, removeFood: removeFood, restoreFood: restoreFood
  };
})(typeof module !== 'undefined' && module.exports
  ? Object.assign({}, require('./plan.js'), require('./lib.js'), require('./trainings.js'))
  : { EX: EX, TEMPLATES: TEMPLATES, TEMPLATE_MAP: TEMPLATE_MAP, NUTR: NUTR, GROUPS: GROUPS, EQUIP: EQUIP, PRESETS: PRESETS });

if (typeof module !== 'undefined' && module.exports) module.exports = Store;
