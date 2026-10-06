import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Store = require('../../store.js');
const { EX } = require('../../lib.js');
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
  assert.equal(s.cur, 'B');
  assert.deepEqual(s.sets, { B: { 'b-rdl': 3, 'b-row': 1 } });
  assert.equal(s.stamp.B, '2026-05-12');
  assert.equal(s.stamp.A, undefined, 'leere Daten bleiben weg');
  assert.deepEqual(s.holdSecs, { 'a-plank': 60 });
  assert.equal(s.goalP, 100);
  assert.equal(s.weightKg, 65);
  assert.deepEqual(s.trainings, []);
  assert.deepEqual(s.weights, { 'a-box': '40', 'b-rdl': '50', 'b-curl': '8' });
  // log: ["A"] wird zu { day, sets, weights, note }
  assert.deepEqual(s.log['2026-05-05'], [{ day: 'A', sets: {}, weights: {}, note: '' }]);
  assert.deepEqual(s.log['2026-05-09'].map((e) => e.day), ['A', 'B']);
  assert.deepEqual(Store.counts(s), { trainings: 5, foods: 4, plans: 0 });
  assert.equal(s.food['2026-05-12'].length, 3);
  assert.equal(s.recent.length, 2);
  assert.equal(s.recent[0].name, 'Magerquark');
  // Nach der Migration ist alles gültig: noch einmal migrieren ändert nichts
  assert.deepEqual(Store.migrate(JSON.parse(JSON.stringify(s))), s);
});

test('Schema 2 (die Version davor) wird übernommen: Tage A/B, Plank-Zeit, Kalender', () => {
  const v2 = { schema: 2, day: 'A', sets: { A: { 'a-box': 2 }, B: {} }, stamp: { A: '2026-10-05', B: '' }, logged: { A: '2026-10-05', B: '' }, weights: { 'a-hip': '60' }, plankSecs: 45,
    log: { '2026-10-05': [{ day: 'A', sets: { 'a-box': 3 }, weights: { 'a-hip': '60' }, note: 'gut' }] }, food: {}, recent: [], goalP: null, weightKg: null };
  const s = Store.migrate(v2);
  assert.equal(s.cur, 'A');
  assert.deepEqual(s.sets.A, { 'a-box': 2 });
  assert.equal(s.stamp.A, '2026-10-05');
  assert.equal(s.logged.A, '2026-10-05');
  assert.deepEqual(s.holdSecs, { 'a-plank': 45 });
  assert.deepEqual(s.log['2026-10-05'][0], { day: 'A', sets: { 'a-box': 3 }, weights: { 'a-hip': '60' }, note: 'gut' });
  assert.equal(Store.entryTitle(s, s.log['2026-10-05'][0]), 'Tag A');
  assert.deepEqual(Store.entrySummary(s, s.log['2026-10-05'][0]), { done: 3, total: 15, hasDetails: true });
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

test('Essensrechnung pro 100 ml: 250 ml Milch mit 64 kcal / 3,4 g Protein pro 100 ml = 160 kcal und 8,5 g Protein', () => {
  const e = { id: 'm', name: 'Milch', g: 250, mode: 'ml', v: { kcal: 64, p: 3.4 } };
  const t = Store.entryTotals(e);
  assert.equal(Store.fmt(t.kcal, 'kcal'), '160');
  assert.equal(Store.fmt(t.p, 'g'), '8,5');
  assert.equal(Store.unitOf('ml'), 'ml');
  assert.equal(Store.unitOf('100'), 'g');
  assert.equal(Store.unitOf('por'), 'g');
  // ohne Menge wird nichts eingerechnet, wie bei Gramm
  assert.deepEqual(Store.entryTotals({ ...e, g: null }), {});
  // das Formular merkt sich den Modus, das Speichern ebenso
  const d = Store.draftFromEntry(e);
  assert.equal(d.mode, 'ml');
  assert.deepEqual(Store.entryFromDraft(d), { name: 'Milch', g: 250, mode: 'ml', v: { kcal: 64, p: 3.4 } });
  assert.equal(Store.newDraft('ml').mode, 'ml');
  assert.equal(Store.newDraft('quatsch').mode, '100');
  // übersteht Sicherung und Wiederherstellen
  const s = Store.newState();
  Store.addFood(s, '2026-10-05', e);
  const back = Store.parseBackup(Store.toText(s)).state;
  assert.equal(back.food['2026-10-05'][0].mode, 'ml');
  assert.equal(back.recent[0].mode, 'ml');
  assert.equal(Store.migrate({ food: { '2026-10-05': [{ name: 'x', mode: 'zz', v: {} }] } }).food['2026-10-05'][0].mode, '100');
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
    assert.deepEqual(Store.migrate(bad), Store.newState());
  }
  const s = Store.migrate({
    day: 'C', sets: { A: { 'a-box': -4, 'a-push': 'x', 'a-tri': 2.9, '../x': 3, 'a-hip': Infinity }, B: 'no', '__proto__': { x: 1 }, '!': {} },
    stamp: { A: '2026-02-31', B: '2026-05-01' }, logged: 7, weights: { 'a-box': 40, 'b-rdl': '  55,5  ', x: '', '!': '1' }, plankSecs: 50,
    log: { '2026-02-31': ['A'], 'nope': ['A'], '2026-05-01': ['A', 'A', 'B', 'C', 5, null, { day: 'A', sets: { 'a-box': 2 } }], '2026-05-02': 'A' },
    food: { '2026-05-01': [{ name: 5, g: -1, mode: 'x', v: { kcal: -3, p: 'x', f: 4 } }, 'x', null], 'bad': [{}] },
    recent: [{ name: '' }, { name: 'ok', id: 3 }], goalP: -1, weightKg: 'abc',
    prefs: { equip: ['kh', 'kh', 'gibtsnicht', 5], preset: 'zz', level: 9, minutes: -4 }, last: ['A', 'u-gibts-nicht', 7, 'A']
  });
  assert.equal(s.cur, 'A');
  assert.deepEqual(s.sets, { A: { 'a-tri': 2 } });
  assert.equal(s.stamp.A, undefined);
  assert.equal(s.stamp.B, '2026-05-01');
  assert.deepEqual(s.logged, {});
  assert.deepEqual(s.weights, { 'a-box': '40', 'b-rdl': '55,5' });
  assert.deepEqual(s.holdSecs, {});
  assert.deepEqual(Object.keys(s.log), ['2026-05-01']);
  assert.deepEqual(s.log['2026-05-01'].map((e) => e.day), ['A', 'B']);
  assert.deepEqual(Object.keys(s.food), ['2026-05-01']);
  assert.equal(s.food['2026-05-01'].length, 1);
  assert.deepEqual(s.food['2026-05-01'][0], { id: s.food['2026-05-01'][0].id, name: '', g: null, mode: '100', v: { f: 4 } });
  assert.deepEqual(s.recent.map((e) => e.name), ['ok']);
  assert.equal(s.goalP, null);
  assert.equal(s.weightKg, null);
  assert.deepEqual(s.prefs, { equip: ['kh'] }, 'Stufe, Zeit und Ort aus älteren Versionen werden ignoriert');
  assert.deepEqual(s.last, ['A']);
});

test('migrate: gleiche oder fehlende Eintrags-IDs werden eindeutig', () => {
  const s = Store.migrate({ food: { '2026-05-01': [{ id: 'a', name: 'x' }, { id: 'a', name: 'y' }, { name: 'z' }, { id: 7, name: 'w' }] } });
  const ids = s.food['2026-05-01'].map((e) => e.id);
  assert.equal(new Set(ids).size, 4);
  assert.equal(ids[0], 'a');
  assert.equal(ids[3], '7');
});

test('migrate: __proto__ und andere gefährliche Schlüssel richten nichts an', () => {
  const evil = JSON.parse('{"__proto__":{"polluted":1},"sets":{"A":{"__proto__":3,"a-box":1},"__proto__":{"a-box":2},"constructor":{"a-box":3}},"weights":{"__proto__":"5"},"log":{"__proto__":["A"]},"food":{"__proto__":[{}]},"holdSecs":{"__proto__":30},"trainings":[{"id":"__proto__","name":"x","items":[{"ex":"__proto__"},{"ex":"constructor"},{"ex":"a-box"}]}]}');
  const s = Store.migrate(evil);
  assert.equal({}.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  assert.deepEqual(s.sets.A, { 'a-box': 1 });
  assert.equal(Object.getPrototypeOf(s.sets), Object.prototype);
  assert.deepEqual(Object.keys(s.sets).sort(), ['A', 'constructor']);
  assert.equal(Store.training(s, 'constructor'), null);
  assert.deepEqual(s.weights, {});
  assert.deepEqual(s.log, {});
  assert.deepEqual(s.food, {});
  assert.deepEqual(s.holdSecs, {});
  assert.equal(s.trainings.length, 1);
  assert.deepEqual(s.trainings[0].items, [{ ex: 'a-box' }]);
  assert.notEqual(s.trainings[0].id, '__proto__');
});

test('Roundtrip: toText -> parseBackup liefert denselben Zustand', () => {
  const s = Store.parseBackup(OLD).state;
  const t = Store.addTraining(s, 'Beine zuhause', [{ ex: 'x-squat', sets: 2, reps: '12–15' }, { ex: 'a-plank', hold: 30 }], ['beine']);
  s.log['2026-06-02'] = [{ day: 'A', sets: { 'a-box': 3, 'a-hip': 2 }, weights: { 'a-box': '60' }, note: 'läuft gut „fast“' }, Store.blankEntry(s, t.id)];
  s.prefs.equip = ['kh', 'band'];
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
  assert.equal(Store.parseBackup('{"trainings":[]}').ok, true, 'eine Sicherung nur mit eigenen Trainings');
});

test('Eigene Trainings: anlegen, bereinigen, auflösen, kopieren, löschen und zurückholen', () => {
  const s = Store.newState();
  const t = Store.addTraining(s, '  Beine   zuhause  ', [{ ex: 'x-squat', sets: 2, reps: '12–15', rest: 45 }, { ex: 'x-squat' }, { ex: 'gibts-nicht' }, { ex: 'a-plank', hold: 30, sets: 3 }], ['beine', 'quatsch', 'beine']);
  assert.match(t.id, /^u/);
  assert.equal(t.name, 'Beine zuhause');
  assert.deepEqual(t.items, [{ ex: 'x-squat', sets: 2, reps: '12–15', rest: 45 }, { ex: 'a-plank', sets: 3, hold: 30 }]);
  assert.deepEqual(t.groups, ['beine']);
  const r = Store.training(s, t.id);
  assert.equal(r.builtin, false);
  assert.equal(r.items[0].name, 'Kniebeuge');
  assert.equal(r.items[0].sets, 2);
  assert.equal(r.items[0].big, '12–15');
  assert.equal(r.items[0].rest, 45);
  assert.equal(r.items[1].timer, true);
  assert.equal(r.items[1].hold, 30);
  // Namen: leer wird ersetzt, zu lang wird gekürzt
  assert.equal(Store.addTraining(s, '   ', [{ ex: 'x-squat' }]).name, 'Mein Training');
  assert.equal(Store.addTraining(s, 'x'.repeat(200), [{ ex: 'x-squat' }]).name.length, Store.NAME_MAX);
  // Kopie eines Vorschlags
  const c = Store.copyTraining(s, 'A');
  assert.equal(c.name, 'Tag A (Kopie)');
  assert.deepEqual(c.items.map((i) => i.ex), ['a-box', 'a-hip', 'a-push', 'a-tri', 'a-plank']);
  assert.equal(c.items[1].note, undefined, 'Hinweistexte der App werden nicht kopiert');
  const listed = Store.allTrainings(s);
  assert.deepEqual(listed.own.slice(0, 2).map((x) => x.id), ['A', 'B'], 'Tag A und Tag B stehen zuerst');
  assert.equal(listed.own[2].id, c.id, 'dann die eigenen, neueste zuerst');
  assert.ok(listed.ready.length >= 14 && listed.ready.every((x) => /^p-/.test(x.id)), 'Vorschläge der App ohne Tag A und B');
  // Löschen mit Haken, Rückgängig stellt alles wieder her
  Store.setsOf(s, t.id)['x-squat'] = 2; s.stamp[t.id] = '2026-10-05'; Store.touch(s, t.id);
  const rm = Store.removeTraining(s, t.id);
  assert.equal(Store.training(s, t.id), null);
  assert.equal(s.sets[t.id], undefined);
  assert.equal(s.cur, 'A');
  assert.ok(!s.last.includes(t.id));
  assert.equal(Store.restoreTraining(s, rm), true);
  assert.deepEqual(s.sets[t.id], { 'x-squat': 2 });
  assert.equal(Store.restoreTraining(s, rm), false, 'nicht doppelt');
  assert.equal(Store.removeTraining(s, 'gibts-nicht'), null);
});

test('Zuletzt benutzt: die Liste bleibt kurz und ohne Doppelte', () => {
  const s = Store.newState();
  for (const id of ['A', 'B', 'A', 'p-x', 'B', 'A', 'B', 'A']) Store.touch(s, id);
  assert.equal(s.cur, 'A');
  assert.deepEqual(s.last, ['A', 'B', 'p-x']);
});

test('snapshot: nur erledigte Sätze, Gewicht nur bei Übungen mit Gewichtsfeld, mit Titel und Zielsätzen', () => {
  const s = Store.newState();
  s.sets.A = { 'a-box': 3, 'a-hip': 5, 'a-push': 2, 'a-plank': 0 };
  s.weights = { 'a-box': ' 60 ', 'a-push': '9', 'a-hip': '', 'b-curl': '8' };
  const e = Store.snapshot(s, 'A');
  assert.deepEqual(e, { day: 'A', title: 'Tag A', targets: { 'a-box': 3, 'a-hip': 3, 'a-push': 3, 'a-tri': 3, 'a-plank': 3 }, sets: { 'a-box': 3, 'a-hip': 3, 'a-push': 2 }, weights: { 'a-box': '60' }, note: '' });
  assert.deepEqual(Store.entrySummary(s, e), { done: 8, total: 15, hasDetails: true });
  assert.deepEqual(Store.entrySummary(s, Store.blankEntry(s, 'B')), { done: 0, total: 15, hasDetails: false });
});

test('Der Kalender ändert sich nicht, wenn das Training später umbenannt oder gelöscht wird', () => {
  const s = Store.newState();
  const t = Store.addTraining(s, 'Rücken kurz', [{ ex: 'b-row', sets: 2 }, { ex: 'b-curl', sets: 3 }]);
  Store.setsOf(s, t.id)['b-row'] = 2; Store.setsOf(s, t.id)['b-curl'] = 1;
  assert.deepEqual(Store.logSession(s, '2026-10-05', t.id, '2026-10-05'), { ok: true });
  const e = s.log['2026-10-05'][0];
  assert.equal(e.title, 'Rücken kurz');
  t.name = 'Anders'; t.items = [{ ex: 'b-rdl' }];
  Store.removeTraining(s, t.id);
  assert.equal(Store.entryTitle(s, e), 'Rücken kurz');
  assert.deepEqual(Store.entryItems(s, e).map((x) => [x.id, x.sets]), [['b-row', 2], ['b-curl', 3]]);
  assert.deepEqual(Store.entrySummary(s, e), { done: 3, total: 5, hasDetails: true });
  assert.equal(Store.tagOf(s, e), 'R');
  assert.equal(Store.tagOf(s, { day: 'A', sets: {}, weights: {}, note: '' }), 'A');
  assert.equal(Store.tagOf(s, { day: 'u1', title: '!!!', sets: {}, weights: {}, note: '' }), '•');
  // Eintrag eines gelöschten Trainings ohne Momentaufnahme: nimmt die Übungen aus den Sätzen
  const legacy = { day: 'ugone', sets: { 'b-row': 4 }, weights: {}, note: '' };
  assert.equal(Store.entryTitle(s, legacy), 'Training');
  assert.deepEqual(Store.entryItems(s, legacy).map((x) => x.id), ['b-row']);
});

test('Kalender: Eintragen, Duplikate, Zukunft, Verschieben, Löschen und Rückgängig ohne Datenverlust', () => {
  const s = Store.newState();
  const today = '2026-10-05';
  s.sets.A = { 'a-box': 3 };
  const a = Store.snapshot(s, 'A');
  assert.deepEqual(Store.addLog(s, '2026-10-01', a, today), { ok: true });
  assert.deepEqual(Store.addLog(s, '2026-10-01', Store.blankEntry(s, 'A'), today), { ok: false, reason: 'exists' });
  assert.deepEqual(s.log['2026-10-01'][0].sets, { 'a-box': 3 }, 'vorhandener Eintrag bleibt unverändert');
  assert.deepEqual(Store.addLog(s, '2026-10-06', Store.blankEntry(s, 'B'), today), { ok: false, reason: 'future' });
  assert.deepEqual(Store.addLog(s, '2026-13-01', Store.blankEntry(s, 'B'), today), { ok: false, reason: 'invalid' });
  assert.deepEqual(Store.addLog(s, '2026-10-01', Store.blankEntry(s, 'B'), today), { ok: true });
  assert.deepEqual(s.log['2026-10-01'].map((e) => e.day), ['A', 'B']);

  // Verschieben: Ziel mit gleichem Training wird abgelehnt, nichts geht verloren
  Store.addLog(s, '2026-10-03', Store.blankEntry(s, 'A'), today);
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
  const s = Store.newState();
  const ex = Store.training(s, 'A').items.find((x) => x.id === 'a-box');
  const e = Store.blankEntry(s, 'A');
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

test('refreshDays: neuer Tag startet die Haken von vorn, auch bei eigenen Trainings', () => {
  const s = Store.newState();
  s.sets.A = { 'a-box': 2 }; s.stamp.A = '2026-10-04'; s.logged.A = '2026-10-04';
  s.sets.B = { 'b-row': 1 }; s.stamp.B = '2026-10-05';
  s.sets.u1 = { 'x-squat': 1 }; s.stamp.u1 = '2026-10-03';
  assert.deepEqual(Store.refreshDays(s, '2026-10-05').sort(), ['A', 'u1']);
  assert.deepEqual(s.sets, { A: {}, B: { 'b-row': 1 }, u1: {} });
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

  // Schema 2 ebenso
  const v2 = JSON.stringify({ schema: 2, day: 'A', sets: { A: {}, B: {} }, stamp: { A: '', B: '' }, logged: { A: '', B: '' }, weights: {}, plankSecs: 45, log: {}, food: {}, recent: [], goalP: null, weightKg: null });
  st = memStorage({ [Store.KEY]: v2 });
  assert.equal(Store.load(st).status, 'migrated');
  assert.equal(st.getItem(Store.KEY + '.schema2'), v2);

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
  assert.equal(s.log['2026-10-05'][0].title, 'Tag A');
  assert.deepEqual({ ...s.log['2026-10-05'][0], targets: 0 }, { day: 'A', title: 'Tag A', targets: 0, sets: { 'a-box': 3, 'a-hip': 2 }, weights: { 'a-box': '60' }, note: '' });
  // Eintrag mit Details wird nicht überschrieben
  s.sets.A = { 'a-box': 1 };
  assert.deepEqual(Store.logSession(s, '2026-10-05', 'A', today), { ok: false, reason: 'exists' });
  assert.deepEqual(s.log['2026-10-05'][0].sets, { 'a-box': 3, 'a-hip': 2 });
  // nackter Eintrag (alt oder von Hand) bekommt die Details, die Notiz bleibt
  s.log['2026-10-04'] = [{ day: 'A', sets: {}, weights: {}, note: 'von Hand' }];
  assert.deepEqual(Store.logSession(s, '2026-10-04', 'A', today), { ok: true, filled: true });
  assert.deepEqual({ ...s.log['2026-10-04'][0], targets: 0 }, { day: 'A', title: 'Tag A', targets: 0, sets: { 'a-box': 1 }, weights: { 'a-box': '60' }, note: 'von Hand' });
  // ungültig / Zukunft
  assert.equal(Store.logSession(s, '2026-10-06', 'A', today).reason, 'future');
  assert.equal(Store.logSession(s, 'x', 'A', today).reason, 'invalid');
});

test('Kalorien-Ziel: wird gespeichert, alte Daten ohne Ziel bleiben gültig, Unsinn wird verworfen', () => {
  assert.equal(Store.migrate({ schema: 3, goalK: 1800 }).goalK, 1800);
  assert.equal(Store.migrate({ schema: 3 }).goalK, null);
  assert.equal(Store.migrate({ schema: 2, goalP: 100 }).goalK, null);
  assert.equal(Store.migrate({ schema: 3, goalK: -5 }).goalK, null);
  assert.equal(Store.migrate({ schema: 3, goalK: 'viel' }).goalK, null);
  assert.equal(Store.newState().goalK, null);
});

test('Wiederholungen: gültige Angaben bleiben, der Bindestrich wird zum Gedankenstrich, alles andere fällt weg', () => {
  for (const [inp, out] of [['8–12', '8–12'], ['8-12', '8–12'], [' 10 ', '10'], [12, '12'], ['max.', 'max.'], ['6 – 8', '6–8'], ['8–8', '8'], ['1–99', '1–99']]) {
    assert.equal(Store.cleanReps(inp), out, String(inp));
  }
  for (const bad of ['', '  ', 'viel', '<b>8</b>', '12–8', '0', '0–3', '100', '1–100', '8–12–15', null, undefined, {}, [], NaN, true]) {
    assert.equal(Store.cleanReps(bad), null, JSON.stringify(bad) + ' ' + String(bad));
  }
  const s = Store.newState();
  const t = Store.addTraining(s, 'x', [{ ex: 'x-squat', reps: '9–13' }, { ex: 'x-lunge', reps: '<img src=x>' }, { ex: 'x-bridge', reps: 'max.' }, { ex: 'x-pike', reps: 7 }]);
  assert.deepEqual(t.items, [{ ex: 'x-squat', reps: '9–13' }, { ex: 'x-lunge' }, { ex: 'x-bridge', reps: 'max.' }, { ex: 'x-pike', reps: '7' }]);
  assert.equal(Store.training(s, t.id).items[0].big, '9–13');
  assert.equal(Store.training(s, t.id).items[1].big, EX['x-lunge'].reps, 'ohne gültige Angabe gilt die der Bibliothek');
  // aus einer Sicherung kommen keine Tags in die Anzeige
  const back = Store.migrate({ trainings: [{ id: 'u1', name: 'T', items: [{ ex: 'x-squat', reps: '<script>' }] }] });
  assert.deepEqual(back.trainings[0].items, [{ ex: 'x-squat' }]);
});

test('Ort zum Trainieren: nur die Ausrüstung wird gemerkt', () => {
  assert.deepEqual(Store.newState().prefs, { equip: null });
  assert.deepEqual(Store.migrate({ prefs: { equip: ['band', 'band', 'zz'], level: 3, minutes: 60, preset: 'travel' } }).prefs, { equip: ['band'] });
  assert.deepEqual(Store.migrate({ prefs: { equip: [] } }).prefs, { equip: [] }, 'leer heisst: ohne Ausrüstung');
  assert.deepEqual(Store.migrate({ prefs: 'x' }).prefs, { equip: null });
});

test('Bisherige Lebensmittel: jedes einmal, A bis Z, der jüngste Eintrag gewinnt, mehr als die letzten acht', () => {
  const s = Store.newState();
  assert.deepEqual(Store.foodBook(s), []);
  Store.addFood(s, '2026-10-01', { id: 'a', name: 'Magerquark', g: 250, mode: '100', v: { kcal: 67, p: 12 } });
  Store.addFood(s, '2026-10-03', { id: 'b', name: ' magerquark ', g: 200, mode: '100', v: { kcal: 70, p: 12 } });
  Store.addFood(s, '2026-10-02', { id: 'c', name: 'Äpfel', g: 150, mode: '100', v: { kcal: 52 } });
  Store.addFood(s, '2026-10-02', { id: 'd', name: 'Zimt', g: 2, mode: 'por', v: {} });
  Store.addFood(s, '2026-10-02', { id: 'e', name: '', g: 5, mode: '100', v: {} });
  Store.addFood(s, '2026-10-02', { id: 'f', name: 'Orangensaft', g: 200, mode: 'ml', v: { kcal: 45 } });
  const book = Store.foodBook(s);
  assert.deepEqual(book.map((e) => e.name), ['Äpfel', 'magerquark', 'Orangensaft', 'Zimt'], 'A bis Z (Ä bei A), ohne Namenlose, ohne Doppelte');
  assert.equal(book[1].g, 200, 'das Neuere vom 3. Oktober gewinnt');
  assert.equal(book[1].v.kcal, 70);
  assert.equal(book[2].mode, 'ml');
  // es sind mehr als die acht "zuletzt gegessen"
  for (let i = 0; i < 30; i++) Store.addFood(s, '2026-09-' + String(1 + (i % 28)).padStart(2, '0'), { id: 'n' + i, name: 'Essen ' + String(i).padStart(2, '0'), g: 1, mode: '100', v: {} });
  assert.equal(s.recent.length, 8, 'zuletzt gegessen bleibt bei acht');
  assert.equal(Store.foodBook(s).length, 34);
  // gelöscht und nicht mehr unter "zuletzt": weg; noch unter "zuletzt": bleibt
  Store.removeFood(s, '2026-10-02', 'c');
  assert.ok(!Store.foodBook(s).some((e) => e.name === 'Äpfel'), 'Äpfel sind gelöscht und nicht unter den letzten acht');
  const last = s.recent[0].name;
  for (const k of Object.keys(s.food)) s.food[k] = s.food[k].filter((e) => e.name !== last);
  assert.ok(Store.foodBook(s).some((e) => e.name === last), 'was unter "zuletzt gegessen" steht, ist auch in der Liste');
  // Kopien: wer die Liste ändert, ändert den Zustand nicht
  const b = Store.foodBook(s);
  b[0].v.kcal = 9999; b[0].name = 'x';
  assert.ok(!JSON.stringify(s).includes('9999'));
  // das Formular lässt sich daraus füllen
  const d = Store.draftFromEntry(Store.foodBook(s).find((e) => e.name === 'Orangensaft'));
  assert.equal(d.name, 'Orangensaft'); assert.equal(d.g, '200'); assert.equal(d.mode, 'ml'); assert.equal(d.v.kcal, '45');
});
