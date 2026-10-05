import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const neu = require('../../plan.js');

/* The reference page keeps PLAN, TIPS and NUTR inside its script. Everything that this order does not change must stay word for word. */
const refLines = readFileSync(new URL('../../reference/page.html', import.meta.url), 'utf8').split('\n');
const start = refLines.findIndex((l) => l.startsWith('  var KNEE_NOTE'));
const end = refLines.findIndex((l, i) => i > start && l.startsWith('  ];') && refLines[i - 5]?.includes("k: 'p'"));
const ref = new Function(refLines.slice(start, end + 1).join('\n') + '; return { KNEE_NOTE: KNEE_NOTE, PLAN: PLAN, TIPS: TIPS, NUTR: NUTR };')();

const CHANGED = new Set(['a-tri']);
const NEW = new Set(['a-hip']);

test('Referenz wurde gefunden', () => {
  assert.ok(Object.keys(ref.PLAN.A.exercises).length === 4, 'Referenz Tag A hat 4 Übungen');
  assert.ok(Object.keys(ref.TIPS).length === 9);
});

test('Unveränderte Übungen, Hinweise, Knie-Text und Nährwertfelder sind wortgleich zur Referenz', () => {
  assert.equal(neu.KNEE_NOTE, ref.KNEE_NOTE);
  assert.deepEqual(neu.NUTR, ref.NUTR);
  const refEx = new Map([...ref.PLAN.A.exercises, ...ref.PLAN.B.exercises].map((e) => [e.id, e]));
  for (const d of ['A', 'B']) {
    for (const ex of neu.PLAN[d].exercises) {
      if (NEW.has(ex.id) || CHANGED.has(ex.id)) continue;
      assert.deepEqual(ex, refEx.get(ex.id), 'Übung ' + ex.id);
      assert.deepEqual(neu.TIPS[ex.id], ref.TIPS[ex.id], 'Hinweise ' + ex.id);
    }
  }
  assert.equal(neu.PLAN.B.focus, ref.PLAN.B.focus);
});

test('Plan: Tag A in der geforderten Reihenfolge, Tag B unverändert', () => {
  assert.deepEqual(neu.PLAN.A.exercises.map((e) => e.id), ['a-box', 'a-hip', 'a-push', 'a-tri', 'a-plank']);
  assert.deepEqual(neu.PLAN.B.exercises.map((e) => e.id), ['b-rdl', 'b-row', 'b-lunge', 'b-curl', 'b-crunch']);
  const spec = {
    'a-box': [3, '8–10', 90, true, true], 'a-hip': [3, '8–12', 90, true, true], 'a-push': [3, 'max.', 60, false, false],
    'a-tri': [3, '10–15', 60, false, false], 'b-rdl': [3, '8–12', 90, true, true], 'b-row': [3, '10–15', 60, false, false],
    'b-lunge': [3, '8–12', 90, false, true], 'b-curl': [3, '10–15', 60, true, false], 'b-crunch': [3, '10–15', 45, false, false]
  };
  for (const ex of [...neu.PLAN.A.exercises, ...neu.PLAN.B.exercises]) {
    if (ex.id === 'a-plank') { assert.equal(ex.timer, true); assert.equal(ex.sets, 3); assert.equal(ex.rest, 45); continue; }
    const [sets, big, rest, weight, knee] = spec[ex.id];
    assert.equal(ex.sets, sets, ex.id); assert.equal(ex.big, big, ex.id); assert.equal(ex.rest, rest, ex.id);
    assert.equal(!!ex.weight, weight, ex.id + ' weight'); assert.equal(!!ex.knee, knee, ex.id + ' knee');
  }
  const legSets = (d, ids) => neu.PLAN[d].exercises.filter((e) => ids.includes(e.id)).reduce((n, e) => n + e.sets, 0);
  assert.equal(legSets('A', ['a-box', 'a-hip']), 6);
  assert.equal(legSets('B', ['b-rdl', 'b-lunge']), 6);
});

test('Hip Thrust und TRX-Trizepsstrecken: Inhalte laut Auftrag', () => {
  const hip = neu.PLAN.A.exercises.find((e) => e.id === 'a-hip');
  assert.equal(hip.name, 'Hip Thrust');
  assert.equal(hip.gear, 'Langhantel mit Polster oder Kurzhantel');
  assert.match(hip.cues[0], /Bankkante/);
  assert.match(hip.cues[1], /Kinn leicht zur Brust/);
  assert.match(hip.note, /6 Sätze/);
  assert.match(hip.note, /Physio/);
  const tri = neu.PLAN.A.exercises.find((e) => e.id === 'a-tri');
  assert.equal(tri.name, 'TRX-Trizepsstrecken');
  assert.equal(tri.gear, 'TRX');
  assert.deepEqual(tri.cues, ['Körper bleibt eine gerade Linie, Hüfte nicht durchhängen lassen.', 'Nur die Ellbogen bewegen, Oberarme bleiben ruhig.']);
  assert.equal(neu.TIPS['a-tri'].watch.length, 4);
  assert.match(neu.TIPS['a-tri'].watch.join(' '), /hoch am Rack/);
  assert.match(neu.TIPS['a-tri'].watch.join(' '), /Schwerer.*Füße weiter nach hinten/);
  assert.match(neu.TIPS['a-tri'].watch.join(' '), /Leichter.*zurück zum Anker/);
  assert.match(neu.TIPS['a-tri'].feel, /Trizeps/);
  const all = JSON.stringify(neu.TIPS['a-tri']) + JSON.stringify(tri);
  assert.doesNotMatch(all, /Band|Pushdown|Trizeps-Drücken/i, 'nichts vom alten Standing-Pushdown');
  assert.equal(neu.TIPS['a-hip'].watch.length, 6);
  assert.equal(neu.TIPS['a-hip'].mistakes.length, 4);
});

test('Jede Übung hat Hinweise; Ids sind eindeutig', () => {
  const ids = [...neu.PLAN.A.exercises, ...neu.PLAN.B.exercises].map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(Object.keys(neu.TIPS).sort(), [...ids].sort());
  for (const id of ids) {
    const t = neu.TIPS[id];
    assert.ok(t.watch.length >= 4 && t.mistakes.length >= 3 && t.feel, id);
  }
});
