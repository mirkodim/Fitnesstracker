import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Store = require('../../store.js');
const { PLAN } = require('../../plan.js');
const OLD = readFileSync(new URL('../fixtures/altformat.json', import.meta.url), 'utf8');

function memStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {
    map: m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); }
  };
}

test('Altformat: Import migriert in das neue Schema', () => {
  const r = Store.parseBackup(OLD);
  assert.equal(r.ok, true);
  assert.equal(r.from, 1);
  const s = r.state;
  assert.equal(s.schema, Store.SCHEMA);
  assert.equal(s.day, 'B');
  assert.deepEqual(s.sets.B, { 'b-rdl': 3, 'b-row': 1 });
  assert.deepEqual(s.sets.A, {});
  assert.equal(s.stamp.B, '2026-05-12');
  assert.equal(s.plankSecs, 60);
  assert.equal(s.goalP, 100);
  assert.equal(s.weightKg, 65);
  assert.deepEqual(s.weights, { 'a-box': '40', 'b-rdl': '50', 'b-curl': '8' });
  // log: ["A"] wird zu { day, sets, weights, note }
  assert.deepEqual(s.log['2026-05-05'], [{ day: 'A', sets: {}, weights: {}, note: '' }]);
  assert.deepEqual(s.log['2026-05-09'].map((e) => e.day), ['A', 'B']);
  assert.deepEqual(Store.counts(s), { trainings: 5, foods: 4 });
  // food und recent bleiben erhalten
  assert.equal(s.food['2026-05-12'].length, 3);
  assert.equal(s.recent.length, 2);
  assert.equal(s.recent[0].name, 'Magerquark');
  // Nach der Migration ist alles gültig: noch einmal migrieren ändert nichts
  assert.deepEqual(Store.migrate(JSON.parse(JSON.stringify(s))), s);
});

test('Altformat: Tagesbilanz stimmt nach dem Import', () => {
  const s = Store.parseBackup(OLD).state;
  const T = Store.dayTotals(s, '2026-05-12');
  assert.equal(T.n, 3);
  assert.equal(Store.fmt(T.sum.kcal, 'kcal'), String(Math.round(67 * 2.5 + 372 * 0.6 + 210)));
  assert.equal(T.has.p, true);
});

test('Essensrechnung: 250 g Magerquark mit 67 kcal / 12 g Protein pro 100 g = 168 kcal und 30 g Protein', () => {
  const e = { id: 'x', name: 'Magerquark', g: 250, mode: '100', v: { kcal: 67, p: 12 } };
  const t = Store.entryTotals(e);
  assert.equal(Store.fmt(t.kcal, 'kcal'), '168');
  assert.equal(Store.fmt(t.p, 'g'), '30');
  assert.deepEqual(Store.partsOf(t), ['168 kcal', '30 g Protein']);
});

test('Essensrechnung: ganze Menge, fehlende Menge und Rundung', () => {
  const por = { id: 'y', name: 'Riegel', g: null, mode: 'por', v: { kcal: 210, p: 20 } };
  assert.deepEqual(Store.entryTotals(por), { kcal: 210, p: 20 });
  const ohneMenge = { id: 'z', name: 'Quark', g: null, mode: '100', v: { kcal: 67 } };
  assert.deepEqual(Store.entryTotals(ohneMenge), {});
  const s = Store.newState();
  s.food['2026-06-01'] = [ohneMenge, por];
  const T = Store.dayTotals(s, '2026-06-01');
  assert.equal(T.skipped, 1);
  assert.equal(T.sum.kcal, 210);
  assert.equal(Store.fmt(12.34, 'g'), '12,3');
  assert.equal(Store.fmt(123.4, 'g'), '123');
  assert.equal(Store.num('12,5'), 12.5);
  assert.equal(Store.num('-3'), null);
  assert.equal(Store.num('abc'), null);
  assert.equal(Store.num(''), null);
});

test('migrate: Müll rein, gültiger Zustand raus, nie eine Exception', () => {
  for (const bad of [null, undefined, 5, 'x', [], [1, 2], true, () => 1]) {
    const s = Store.migrate(bad);
    assert.deepEqual(s, Store.newState());
  }
  const s = Store.migrate({
    day: 'C', sets: { A: { 'a-box': -4, 'a-push': 'x', 'a-tri': 2.9, '../x': 3, 'a-hip': Infinity }, B: 'no' },
    stamp: { A: '2026-02-31', B: '2026-05-01' }, logged: 7, weights: { 'a-box': 40, 'b-rdl': '  55,5  ', x: '', '!': '1' }, plankSecs: 50,
    log: { '2026-02-31': ['A'], 'nope': ['A'], '2026-05-01': ['A', 'A', 'B', 'C', 5, null, { day: 'A', sets: { 'a-box': 2 } }], '2026-05-02': 'A' },
    food: { '2026-05-01': [{ name: 5, g: -1, mode: 'x', v: { kcal: -3, p: 'x', f: 4 } }, 'x', null], 'bad': [{}] },
    recent: [{ name: '' }, { name: 'ok', id: 3 }], goalP: -1, weightKg: 'abc'
  });
  assert.equal(s.day, 'A');
  assert.deepEqual(s.sets.A, { 'a-tri': 2 });
  assert.deepEqual(s.sets.B, {});
  assert.equal(s.stamp.A, '');
  assert.equal(s.stamp.B, '2026-05-01');
  assert.deepEqual(s.logged, { A: '', B: '' });
  assert.deepEqual(s.weights, { 'a-box': '40', 'b-rdl': '55,5' });
  assert.equal(s.plankSecs, 45);
  assert.deepEqual(Object.keys(s.log), ['2026-05-01']);
  assert.deepEqual(s.log['2026-05-01'].map((e) => e.day), ['A', 'B']);
  assert.deepEqual(Object.keys(s.food), ['2026-05-01']);
  assert.equal(s.food['2026-05-01'].length, 1);
  assert.deepEqual(s.food['2026-05-01'][0], { id: s.food['2026-05-01'][0].id, name: '', g: null, mode: '100', v: { f: 4 } });
  assert.deepEqual(s.recent.map((e) => e.name), ['ok']);
  assert.equal(s.goalP, null);
  assert.equal(s.weightKg, null);
});

test('migrate: gleiche oder fehlende Eintrags-IDs werden eindeutig', () => {
  const s = Store.migrate({ food: { '2026-05-01': [{ id: 'a', name: 'x' }, { id: 'a', name: 'y' }, { name: 'z' }, { id: 7, name: 'w' }] } });
  const ids = s.food['2026-05-01'].map((e) => e.id);
  assert.equal(new Set(ids).size, 4);
  assert.equal(ids[0], 'a');
  assert.equal(ids[3], '7');
});

test('migrate: __proto__ und andere gefährliche Schlüssel richten nichts an', () => {
  const evil = JSON.parse('{"__proto__":{"polluted":1},"sets":{"A":{"__proto__":3,"a-box":1}},"weights":{"__proto__":"5"},"log":{"__proto__":["A"]},"food":{"__proto__":[{}]}}');
  const s = Store.migrate(evil);
  assert.equal({}.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  assert.deepEqual(s.sets.A, { 'a-box': 1 });
  assert.deepEqual(s.weights, {});
  assert.deepEqual(s.log, {});
  assert.deepEqual(s.food, {});
});

test('Roundtrip: toText -> parseBackup liefert denselben Zustand', () => {
  const s = Store.parseBackup(OLD).state;
  s.log['2026-06-02'] = [{ day: 'A', sets: { 'a-box': 3, 'a-hip': 2 }, weights: { 'a-box': '60' }, note: 'läuft gut „fast“' }];
  for (const indent of [0, 2]) {
    const r = Store.parseBackup(Store.toText(s, indent));
    assert.equal(r.ok, true);
    assert.equal(r.from, Store.SCHEMA);
    assert.deepEqual(r.state, s);
  }
});

test('parseBackup: verzeiht BOM, Code-Zaun und Titelzeile, lehnt Unbrauchbares ab', () => {
  const json = JSON.stringify({ log: { '2026-05-01': ['A'] } });
  for (const t of ['﻿' + json, '```json\n' + json + '\n```', 'Strichliste Sicherung\n' + json + '\n', '  ' + json + '  ']) {
    const r = Store.parseBackup(t);
    assert.equal(r.ok, true, t);
    assert.equal(Store.counts(r.state).trainings, 1);
  }
  for (const t of ['', '   ', 'hallo', '{', '{"a":1}', '[1,2]', '{"foo":"bar"}', '{}', null, undefined, 42]) {
    assert.equal(Store.parseBackup(t).ok, false, String(t));
  }
});

test('snapshot: nur erledigte Sätze, Gewicht nur bei Übungen mit Gewichtsfeld', () => {
  const s = Store.newState();
  s.sets.A = { 'a-box': 3, 'a-hip': 5, 'a-push': 2, 'a-plank': 0 };
  s.weights = { 'a-box': ' 60 ', 'a-push': '9', 'a-hip': '', 'b-curl': '8' };
  const e = Store.snapshot(s, 'A');
  assert.deepEqual(e, { day: 'A', sets: { 'a-box': 3, 'a-hip': 3, 'a-push': 2 }, weights: { 'a-box': '60' }, note: '' });
  assert.deepEqual(Store.entrySummary(e), { done: 8, total: 15, hasDetails: true });
  assert.deepEqual(Store.entrySummary(Store.blankEntry('B')), { done: 0, total: 15, hasDetails: false });
});

test('Kalender: Eintragen, Duplikate, Zukunft, Verschieben, Löschen und Rückgängig ohne Datenverlust', () => {
  const s = Store.newState();
  const today = '2026-10-05';
  const a = Store.snapshot({ ...s, sets: { A: { 'a-box': 3 }, B: {} }, weights: {} }, 'A');
  assert.deepEqual(Store.addLog(s, '2026-10-01', a, today), { ok: true });
  assert.deepEqual(Store.addLog(s, '2026-10-01', Store.blankEntry('A'), today), { ok: false, reason: 'exists' });
  assert.deepEqual(s.log['2026-10-01'][0].sets, { 'a-box': 3 }, 'vorhandener Eintrag bleibt unverändert');
  assert.deepEqual(Store.addLog(s, '2026-10-06', Store.blankEntry('B'), today), { ok: false, reason: 'future' });
  assert.deepEqual(Store.addLog(s, '2026-13-01', Store.blankEntry('B'), today), { ok: false, reason: 'invalid' });
  assert.deepEqual(Store.addLog(s, '2026-10-01', Store.blankEntry('B'), today), { ok: true });
  assert.deepEqual(s.log['2026-10-01'].map((e) => e.day), ['A', 'B']);

  // Verschieben: Ziel mit gleichem Typ wird abgelehnt, nichts geht verloren
  Store.addLog(s, '2026-10-03', Store.blankEntry('A'), today);
  assert.deepEqual(Store.moveLog(s, '2026-10-01', 'A', '2026-10-03', today), { ok: false, reason: 'exists' });
  assert.deepEqual(s.log['2026-10-01'][0].sets, { 'a-box': 3 });
  assert.deepEqual(Store.moveLog(s, '2026-10-01', 'A', '2026-10-09', today), { ok: false, reason: 'future' });
  assert.deepEqual(Store.moveLog(s, '2026-10-01', 'A', 'kaputt', today), { ok: false, reason: 'invalid' });
  assert.deepEqual(Store.moveLog(s, '2026-10-01', 'A', '2026-10-01', today), { ok: true, same: true });
  assert.deepEqual(Store.moveLog(s, '2026-10-02', 'A', '2026-10-04', today), { ok: false, reason: 'missing' });
  // Gültiges Verschieben (B wandert auf einen leeren Tag), der Marker der laufenden Einheit zieht mit
  s.logged.B = '2026-10-01';
  assert.deepEqual(Store.moveLog(s, '2026-10-01', 'B', '2026-10-04', today), { ok: true });
  assert.equal(s.logged.B, '2026-10-04');
  assert.deepEqual(s.log['2026-10-01'].map((e) => e.day), ['A']);
  assert.deepEqual(s.log['2026-10-04'].map((e) => e.day), ['B']);
  assert.equal(Store.loggedDate(s, 'B'), '2026-10-04');

  // Löschen + Rückgängig
  const removed = Store.removeLog(s, '2026-10-01', 'A');
  assert.equal(s.log['2026-10-01'], undefined);
  assert.equal(Store.loggedDate(s, 'A'), '');
  assert.equal(Store.restoreLog(s, removed), true);
  assert.deepEqual(s.log['2026-10-01'][0].sets, { 'a-box': 3 });
  assert.equal(Store.removeLog(s, '2026-10-01', 'B'), null);
});

test('Eintrag bearbeiten: Sätze begrenzt, Gewicht und Notiz bereinigt', () => {
  const ex = PLAN.A.exercises.find((x) => x.id === 'a-box');
  const e = Store.blankEntry('A');
  assert.equal(Store.setEntrySets(e, ex, 2), 2);
  assert.equal(Store.setEntrySets(e, ex, 99), ex.sets);
  assert.equal(Store.setEntrySets(e, ex, -4), 0);
  assert.deepEqual(e.sets, {});
  Store.setEntrySets(e, ex, 3);
  Store.setEntryWeight(e, 'a-box', ' 62,5 ');
  assert.deepEqual(e.weights, { 'a-box': '62,5' });
  Store.setEntryWeight(e, 'a-box', '   ');
  assert.deepEqual(e.weights, {});
  Store.setEntryNote(e, 'x'.repeat(1000));
  assert.equal(e.note.length, Store.NOTE_MAX);
});

test('Essen: Formularfelder <-> Eintrag, Kopie, Merkliste, Löschen/Rückgängig', () => {
  const e = { id: 'e1', name: 'Magerquark', g: 250, mode: '100', v: { kcal: 67, p: 12.5, s: 3.1 } };
  const d = Store.draftFromEntry(e);
  assert.equal(d.g, '250');
  assert.equal(d.v.p, '12,5');
  assert.equal(d.more, true);
  const back = Store.entryFromDraft(d);
  assert.deepEqual(back, { name: 'Magerquark', g: 250, mode: '100', v: { kcal: 67, p: 12.5, s: 3.1 } });
  assert.equal(Store.isBlankEntry(Store.entryFromDraft(Store.newDraft('100'))), true);

  const c = Store.copyEntry(e);
  assert.notEqual(c.id, e.id);
  assert.deepEqual({ ...c, id: 0 }, { ...e, id: 0 });
  c.v.kcal = 1;
  assert.equal(e.v.kcal, 67, 'Kopie teilt keine Objekte mit dem Original');

  const s = Store.newState();
  for (let i = 0; i < 10; i++) Store.addFood(s, '2026-05-01', { id: 'i' + i, name: 'Essen ' + i, g: 1, mode: '100', v: {} });
  assert.equal(s.recent.length, 8);
  assert.equal(s.recent[0].name, 'Essen 9');
  Store.addFood(s, '2026-05-01', { id: 'neu', name: 'ESSEN 3', g: 5, mode: '100', v: {} });
  assert.equal(s.recent.filter((x) => x.name.toLowerCase() === 'essen 3').length, 1);
  assert.equal(s.recent[0].g, 5);

  const removed = Store.removeFood(s, '2026-05-01', 'i4');
  assert.equal(Store.findFood(s, '2026-05-01', 'i4'), null);
  Store.restoreFood(s, removed);
  assert.equal(Store.findFood(s, '2026-05-01', 'i4').idx, removed.idx);
  assert.equal(Store.removeFood(s, '2026-05-01', 'gibtsnicht'), null);
});

test('refreshDays: neuer Tag startet die Haken von vorn', () => {
  const s = Store.newState();
  s.sets.A = { 'a-box': 2 }; s.stamp.A = '2026-10-04'; s.logged.A = '2026-10-04';
  s.sets.B = { 'b-row': 1 }; s.stamp.B = '2026-10-05';
  assert.deepEqual(Store.refreshDays(s, '2026-10-05'), ['A']);
  assert.deepEqual(s.sets, { A: {}, B: { 'b-row': 1 } });
  assert.equal(s.logged.A, '');
  assert.deepEqual(Store.refreshDays(s, '2026-10-05'), []);
});

test('Speicher: neu, ok, migriert (mit Sicherung), beschädigt, nicht verfügbar', () => {
  // neu
  let st = memStorage();
  let r = Store.load(st);
  assert.equal(r.status, 'new');
  assert.equal(Store.save(st, r.state), true);
  assert.equal(Store.load(st).status, 'ok');

  // Altformat im Speicher wird migriert, das Original bleibt unter einem zweiten Schlüssel erhalten
  st = memStorage({ [Store.KEY]: OLD });
  r = Store.load(st);
  assert.equal(r.status, 'migrated');
  assert.equal(st.getItem(Store.KEY + '.schema1'), OLD);
  assert.equal(JSON.parse(st.getItem(Store.KEY)).schema, Store.SCHEMA);
  assert.equal(Store.counts(r.state).trainings, 5);
  assert.equal(Store.load(st).status, 'ok');

  // beschädigter Inhalt wird gesichert statt stillschweigend überschrieben
  for (const bad of ['{kaputt', '5', '[]', 'null']) {
    st = memStorage({ [Store.KEY]: bad });
    r = Store.load(st);
    assert.equal(r.status, 'corrupt', bad);
    assert.equal(st.getItem(Store.KEY + '.corrupt'), bad);
    assert.deepEqual(r.state, Store.newState());
  }

  // Speicher nicht verfügbar / voll
  const locked = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceededError'); } };
  assert.equal(Store.load(locked).status, 'unavailable');
  assert.equal(Store.save(locked, Store.newState()), false);
  assert.equal(Store.backupBefore(locked, Store.newState(), 'prev'), false);
});

test('Datumshilfen', () => {
  assert.equal(Store.addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(Store.addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(Store.addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(Store.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(Store.parseKey('2026-02-30'), null);
  assert.equal(Store.parseKey('2026-2-3'), null);
  assert.equal(Store.parseKey('2026-05-05').getDate(), 5);
  assert.match(Store.todayKey(), /^\d{4}-\d{2}-\d{2}$/);
});

test('Training eintragen: freier Platz, nackter Eintrag bekommt Details, Eintrag mit Details bleibt unberührt', () => {
  const today = '2026-10-05';
  const s = Store.newState();
  s.sets.A = { 'a-box': 3, 'a-hip': 2 };
  s.weights = { 'a-box': '60' };
  // freier Platz
  assert.deepEqual(Store.logSession(s, '2026-10-05', 'A', today), { ok: true });
  assert.deepEqual(s.log['2026-10-05'][0], { day: 'A', sets: { 'a-box': 3, 'a-hip': 2 }, weights: { 'a-box': '60' }, note: '' });
  // Eintrag mit Details wird nicht überschrieben
  s.sets.A = { 'a-box': 1 };
  assert.deepEqual(Store.logSession(s, '2026-10-05', 'A', today), { ok: false, reason: 'exists' });
  assert.deepEqual(s.log['2026-10-05'][0].sets, { 'a-box': 3, 'a-hip': 2 });
  // nackter Eintrag (alt oder von Hand) bekommt die Details, die Notiz bleibt
  s.log['2026-10-04'] = [{ day: 'A', sets: {}, weights: {}, note: 'von Hand' }];
  assert.deepEqual(Store.logSession(s, '2026-10-04', 'A', today), { ok: true, filled: true });
  assert.deepEqual(s.log['2026-10-04'][0], { day: 'A', sets: { 'a-box': 1 }, weights: { 'a-box': '60' }, note: 'von Hand' });
  // ungültig / Zukunft
  assert.equal(Store.logSession(s, '2026-10-06', 'A', today).reason, 'future');
  assert.equal(Store.logSession(s, 'x', 'A', today).reason, 'invalid');
});
