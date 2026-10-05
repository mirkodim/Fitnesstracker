/* Store: state shape, validation, migration, backup parsing and the pure edit helpers.
   No DOM access, so it runs in the browser (global Store) and in Node (module.exports), where the tests use it directly.
   Everything that comes from outside (localStorage, a pasted backup, a file) goes through migrate(), which never trusts its input. */
var Store = (function (data) {
  'use strict';

  var PLAN = data.PLAN, NUTR = data.NUTR;
  var KEY = 'strichliste.v1';
  var SCHEMA = 2;
  var NOTE_MAX = 300;
  var ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

  /* ---------- small helpers ---------- */
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
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
  function fmt(v, u) {
    var r = u === 'kcal' ? Math.round(v) : (v >= 100 ? Math.round(v) : Math.round(v * 10) / 10);
    return String(r).replace('.', ',');
  }
  function numStr(v) { return String(v).replace('.', ','); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function cleanKey(v) { return parseKey(v) ? v : ''; }
  function byDay(a, b) { return a.day < b.day ? -1 : (a.day > b.day ? 1 : 0); }

  /* ---------- state ---------- */
  function newState() {
    return {
      schema: SCHEMA, day: 'A', sets: { A: {}, B: {} }, stamp: { A: '', B: '' }, logged: { A: '', B: '' }, weights: {}, plankSecs: 45,
      log: {}, food: {}, recent: [], goalP: null, weightKg: null
    };
  }

  /* ---------- cleaning of single parts ---------- */
  function cleanSets(o) {
    var out = {};
    if (!isObj(o)) return out;
    Object.keys(o).forEach(function (id) {
      if (!ID_RE.test(id)) return;
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
      if (ID_RE.test(id) && t) out[id] = t;
    });
    return out;
  }
  function cleanNote(v) { return typeof v === 'string' ? v.slice(0, NOTE_MAX) : ''; }

  /* A log entry is { day, sets: {exerciseId: n}, weights: {exerciseId: "60"}, note }.
     Schema 1 stored only the letter: "A". It becomes an entry without details. */
  function cleanLogEntry(e) {
    if (e === 'A' || e === 'B') return { day: e, sets: {}, weights: {}, note: '' };
    if (!isObj(e) || (e.day !== 'A' && e.day !== 'B')) return null;
    return { day: e.day, sets: cleanSets(e.sets), weights: cleanWeights(e.weights), note: cleanNote(e.note) };
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

  function cleanEntry(e, used) {
    if (!isObj(e)) return null;
    var v = {};
    if (isObj(e.v)) NUTR.forEach(function (n) { var x = e.v[n.k]; if (typeof x === 'number' && isFinite(x) && x >= 0) v[n.k] = x; });
    var g = (typeof e.g === 'number' && isFinite(e.g) && e.g >= 0) ? e.g : null;
    var id = (typeof e.id === 'string' || typeof e.id === 'number') ? String(e.id).slice(0, 40) : '';
    if (!id || (used && used[id])) id = uid();
    return { id: id, name: typeof e.name === 'string' ? e.name.slice(0, 80) : '', g: g, mode: e.mode === 'por' ? 'por' : '100', v: v };
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

  /* Any object in, a complete and valid state of the current schema out. Unknown or broken parts are dropped, never thrown on. */
  function migrate(raw) {
    var s = newState();
    if (!isObj(raw)) return s;
    if (raw.day === 'A' || raw.day === 'B') s.day = raw.day;
    if (isObj(raw.sets)) { s.sets.A = cleanSets(raw.sets.A); s.sets.B = cleanSets(raw.sets.B); }
    ['stamp', 'logged'].forEach(function (f) {
      if (isObj(raw[f])) { s[f].A = cleanKey(raw[f].A); s[f].B = cleanKey(raw[f].B); }
    });
    s.weights = cleanWeights(raw.weights);
    if (raw.plankSecs === 45 || raw.plankSecs === 60) s.plankSecs = raw.plankSecs;
    s.log = cleanLog(raw.log);
    s.food = cleanFood(raw.food);
    s.recent = cleanRecent(raw.recent);
    s.goalP = posNum(raw.goalP);
    s.weightKg = posNum(raw.weightKg);
    return s;
  }

  /* ---------- backup text / file ---------- */
  var KNOWN = ['log', 'food', 'recent', 'sets', 'weights', 'goalP', 'weightKg', 'plankSecs', 'day', 'stamp', 'logged'];
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
    return { trainings: t, foods: f };
  }
  function isEmpty(state) { var c = counts(state); return c.trainings === 0 && c.foods === 0; }

  /* A new day starts the checklists from scratch. Returns the days that were reset. */
  function refreshDays(state, today) {
    var out = [];
    ['A', 'B'].forEach(function (k) {
      if (state.stamp[k] && state.stamp[k] !== today) {
        state.sets[k] = {}; state.stamp[k] = ''; state.logged[k] = '';
        out.push(k);
      }
    });
    return out;
  }

  /* ---------- training log ---------- */
  function logEntry(state, key, day) {
    var a = state.log[key] || [];
    for (var i = 0; i < a.length; i++) if (a[i].day === day) return a[i];
    return null;
  }
  /* Snapshot of today's checklist: only exercises with at least one set, weights only where the exercise has a weight field. */
  function snapshot(state, day) {
    var sets = {}, weights = {};
    PLAN[day].exercises.forEach(function (ex) {
      var n = Math.min(state.sets[day][ex.id] || 0, ex.sets);
      if (n > 0) sets[ex.id] = n;
      var w = cleanWeightText(state.weights[ex.id]);
      if (ex.weight && w) weights[ex.id] = w;
    });
    return { day: day, sets: sets, weights: weights, note: '' };
  }
  function blankEntry(day) { return { day: day, sets: {}, weights: {}, note: '' }; }
  /* A day type exists once per date. Adding to a taken slot is refused so nothing already stored gets overwritten. */
  function addLog(state, key, entry, today) {
    if (!parseKey(key)) return { ok: false, reason: 'invalid' };
    if (key > today) return { ok: false, reason: 'future' };
    if (logEntry(state, key, entry.day)) return { ok: false, reason: 'exists' };
    var a = state.log[key] || (state.log[key] = []);
    a.push(entry); a.sort(byDay);
    return { ok: true };
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
  function entrySummary(entry) {
    var done = 0, total = 0;
    PLAN[entry.day].exercises.forEach(function (ex) { done += Math.min(entry.sets[ex.id] || 0, ex.sets); total += ex.sets; });
    return { done: done, total: total, hasDetails: done > 0 || Object.keys(entry.weights).length > 0 };
  }
  /* The session marker only counts while the entry it points to still exists. */
  function loggedDate(state, day) {
    var k = state.logged[day];
    return (k && logEntry(state, k, day)) ? k : '';
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
  function newDraft(mode) { return { name: '', g: '', mode: mode || '100', v: { kcal: '', p: '', f: '', c: '', s: '', b: '' }, more: false }; }
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
    return { name: d.name.trim(), g: num(d.g), mode: d.mode === 'por' ? 'por' : '100', v: v };
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
    KEY: KEY, SCHEMA: SCHEMA, NOTE_MAX: NOTE_MAX,
    isObj: isObj, pad: pad, keyOf: keyOf, todayKey: todayKey, parseKey: parseKey, addDays: addDays, num: num, fmt: fmt, numStr: numStr, uid: uid,
    newState: newState, migrate: migrate, schemaOf: schemaOf, parseBackup: parseBackup, toText: toText,
    load: load, save: save, backupBefore: backupBefore, counts: counts, isEmpty: isEmpty, refreshDays: refreshDays,
    logEntry: logEntry, snapshot: snapshot, blankEntry: blankEntry, addLog: addLog, removeLog: removeLog, restoreLog: restoreLog, moveLog: moveLog,
    setEntrySets: setEntrySets, setEntryWeight: setEntryWeight, setEntryNote: setEntryNote, entrySummary: entrySummary, loggedDate: loggedDate,
    entryTotals: entryTotals, dayTotals: dayTotals, partsOf: partsOf,
    newDraft: newDraft, draftFromEntry: draftFromEntry, entryFromDraft: entryFromDraft, isBlankEntry: isBlankEntry, copyEntry: copyEntry,
    rememberRecent: rememberRecent, findFood: findFood, addFood: addFood, removeFood: removeFood, restoreFood: restoreFood
  };
})(typeof module !== 'undefined' && module.exports ? require('./plan.js') : { PLAN: PLAN, NUTR: NUTR });

if (typeof module !== 'undefined' && module.exports) module.exports = Store;
