import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const plan = require('../../plan.js');
const { LIB, EX } = require('../../lib.js');
const { TEMPLATES, TEMPLATE_MAP } = require('../../trainings.js');
const Builder = require('../../builder.js');
const { GROUPS, LEAVES, EQUIP, PRESETS } = plan;

/* The reference page keeps PLAN, TIPS and NUTR inside its script. What the first version said about its ten exercises must stay word for word
   (only the sharp s became "ss", and the knee note became general). */
const refLines = readFileSync(new URL('../../reference/page.html', import.meta.url), 'utf8').split('\n');
const start = refLines.findIndex((l) => l.startsWith('  var KNEE_NOTE'));
const end = refLines.findIndex((l, i) => i > start && l.startsWith('  ];') && refLines[i - 5]?.includes("k: 'p'"));
const ref = new Function(refLines.slice(start, end + 1).join('\n') + '; return { KNEE_NOTE: KNEE_NOTE, PLAN: PLAN, TIPS: TIPS, NUTR: NUTR };')();
const swiss = (v) => JSON.parse(JSON.stringify(v).replace(/ß/g, 'ss'));

const CHANGED = new Set(['a-tri']);
const NEW = new Set(['a-hip']);

test('Referenz wurde gefunden', () => {
  assert.equal(ref.PLAN.A.exercises.length, 4, 'Referenz Tag A hat 4 Übungen');
  assert.equal(Object.keys(ref.TIPS).length, 9);
});

test('Die zehn Übungen der ersten Version: Angaben und Hinweise sind wortgleich zur Referenz', () => {
  assert.deepEqual(plan.NUTR, ref.NUTR);
  const refEx = new Map([...ref.PLAN.A.exercises, ...ref.PLAN.B.exercises].map((e) => [e.id, e]));
  let n = 0;
  for (const [id, r] of refEx) {
    if (CHANGED.has(id)) continue;
    const e = EX[id], s = swiss(r);
    assert.equal(e.name, s.name, id);
    assert.equal(e.gear || '', s.gear || '', id + ' Gerät');
    assert.deepEqual(e.cues, s.cues, id + ' Kurzhinweise');
    assert.equal(e.sets, s.sets, id);
    assert.equal(!!e.weight, !!s.weight, id + ' Gewichtsfeld');
    assert.equal(!!e.knee, !!s.knee, id + ' Knie');
    assert.equal(!!e.timer, !!s.timer, id);
    if (!s.timer) { assert.equal(e.reps, s.big, id); assert.equal(e.unit, s.unit, id); }
    assert.equal(e.rest, s.rest, id);
    const t = swiss(ref.TIPS[id]);
    assert.deepEqual({ watch: e.watch, mistakes: e.mistakes, feel: e.feel }, t, id + ' Hinweise');
    n++;
  }
  assert.equal(n, 8, 'acht Übungen unverändert');
});

test('Die Knie-Notiz ist jetzt allgemein gehalten', () => {
  assert.match(plan.KNEE_NOTE, /^<b>Knie:<\/b>/);
  assert.match(plan.KNEE_NOTE, /Physio oder MTT/);
  assert.match(plan.KNEE_NOTE, /Schmerz/);
});

test('Tag A und Tag B: Übungen in der richtigen Reihenfolge, wie bisher', () => {
  assert.deepEqual(TEMPLATE_MAP.A.items.map((i) => i.ex), ['a-box', 'a-hip', 'a-push', 'a-tri', 'a-plank']);
  assert.deepEqual(TEMPLATE_MAP.B.items.map((i) => i.ex), ['b-rdl', 'b-row', 'b-lunge', 'b-curl', 'b-crunch']);
  assert.equal(TEMPLATE_MAP.A.sub, 'Kniebeuge + Hüfte + Push');
  assert.equal(TEMPLATE_MAP.B.sub, ref.PLAN.B.focus);
  const spec = {
    'a-box': [3, '8–10', 90], 'a-hip': [3, '8–12', 90], 'a-push': [3, 'max.', 60], 'a-tri': [3, '10–15', 60],
    'b-rdl': [3, '8–12', 90], 'b-row': [3, '10–15', 60], 'b-lunge': [3, '8–12', 90], 'b-curl': [3, '10–15', 60], 'b-crunch': [3, '10–15', 45]
  };
  for (const it of [...TEMPLATE_MAP.A.items, ...TEMPLATE_MAP.B.items]) {
    if (it.ex === 'a-plank') { assert.equal(it.sets, 3); assert.equal(it.rest, 45); assert.equal(it.hold, 45); continue; }
    assert.deepEqual([it.sets, it.reps, it.rest], spec[it.ex], it.ex);
  }
  const legSets = (d, ids) => TEMPLATE_MAP[d].items.filter((i) => ids.includes(i.ex)).reduce((n, i) => n + i.sets, 0);
  assert.equal(legSets('A', ['a-box', 'a-hip']), 6);
  assert.equal(legSets('B', ['b-rdl', 'b-lunge']), 6);
});

test('Hip Thrust und TRX-Trizepsstrecken: Inhalte laut Auftrag', () => {
  const hip = EX['a-hip'];
  assert.equal(hip.name, 'Hip Thrust');
  assert.equal(hip.gear, 'Langhantel mit Polster oder Kurzhantel');
  assert.match(hip.cues[0], /Bankkante/);
  assert.match(hip.cues[1], /Kinn leicht zur Brust/);
  const note = TEMPLATE_MAP.A.items.find((i) => i.ex === 'a-hip').note;
  assert.match(note, /6 Sätze/);
  assert.match(note, /Physio/);
  const tri = EX['a-tri'];
  assert.equal(tri.name, 'TRX-Trizepsstrecken');
  assert.equal(tri.gear, 'TRX');
  assert.deepEqual(tri.cues, ['Körper bleibt eine gerade Linie, Hüfte nicht durchhängen lassen.', 'Nur die Ellbogen bewegen, Oberarme bleiben ruhig.']);
  assert.equal(tri.watch.length, 4);
  assert.match(tri.watch.join(' '), /hoch am Rack/);
  assert.match(tri.watch.join(' '), /Schwerer.*Füsse weiter nach hinten/);
  assert.match(tri.watch.join(' '), /Leichter.*zurück zum Anker/);
  assert.match(tri.feel, /Trizeps/);
  assert.doesNotMatch(JSON.stringify(tri), /Band|Pushdown|Trizeps-Drücken/i, 'nichts vom alten Standing-Pushdown');
  assert.equal(hip.watch.length, 6);
  assert.equal(hip.mistakes.length, 4);
});

test('Bibliothek: eindeutige Ids und Namen, gültige Bereiche, Ausrüstung, Stufen', () => {
  const ids = LIB.map((e) => e.id), names = LIB.map((e) => e.name);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(names).size, names.length, 'zwei Übungen heissen gleich');
  const equipIds = EQUIP.map((e) => e.id);
  for (const ex of LIB) {
    assert.match(ex.id, /^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/, ex.id);
    assert.ok(ex.regions.length >= 1 && ex.regions.every((r) => LEAVES[r]), ex.id + ' Bereich');
    for (const tok of ex.eq) for (const e of tok.split('|')) assert.ok(equipIds.includes(e), ex.id + ' Ausrüstung ' + e);
    assert.ok([1, 2, 3].includes(ex.lvl), ex.id);
    assert.ok(ex.sets >= 1 && ex.sets <= 6 && ex.rest >= 0 && ex.rest <= 180, ex.id);
    assert.ok(ex.pat, ex.id + ' Bewegungsmuster');
    assert.equal(ex.cues.length, 2, ex.id + ' zwei Kurzhinweise');
    assert.ok(ex.watch.length >= 4 && ex.mistakes.length >= 3 && ex.feel, ex.id + ' Hinweise');
    for (const s of [...ex.cues, ...ex.watch, ...ex.mistakes, ex.feel, ex.name, ex.gear || '', ex.easier || '', ex.harder || '']) assert.ok(typeof s === 'string', ex.id);
    if (ex.timer) assert.ok(ex.holds.includes(ex.hold) && ex.holds.length >= 2, ex.id + ' Haltezeiten');
    else assert.ok(ex.reps && ex.unit, ex.id + ' Wiederholungen');
  }
});

test('Schweizer Rechtschreibung: kein scharfes S in der App', () => {
  for (const [name, v] of Object.entries({ plan, LIB, TEMPLATES })) assert.doesNotMatch(JSON.stringify(v), /ß/, name);
  for (const f of ['app.js', 'ui-flow.js', 'ui-lib.js', 'builder.js', 'store.js', 'index.html', 'styles.css', 'anims.js', 'fig.js']) {
    assert.doesNotMatch(readFileSync(new URL('../../' + f, import.meta.url), 'utf8'), /ß/, f);
  }
});

test('Jeder Bereich hat genug Übungen, auch ohne jede Ausrüstung', () => {
  const none = Builder.haveSet([]);
  for (const g of GROUPS) {
    const all = LIB.filter((ex) => Builder.inGroup(ex, g.id)), bw = all.filter((ex) => Builder.eqOK(ex, none));
    assert.ok(all.length >= 4, g.label + ': nur ' + all.length + ' Übungen');
    assert.ok(bw.length >= 2, g.label + ': nur ' + bw.length + ' Übungen ohne Ausrüstung');
  }
  for (const leaf of Object.keys(LEAVES)) assert.ok(LIB.some((ex) => ex.regions.includes(leaf)), leaf);
});

test('Jedes Gerät kommt in mindestens einer Übung vor, jede Voreinstellung ist gültig', () => {
  for (const e of EQUIP) assert.ok(LIB.some((ex) => ex.eq.some((t) => t.split('|').includes(e.id))), e.label + ' wird nicht gebraucht');
  for (const p of PRESETS) assert.ok(p.equip.every((id) => EQUIP.some((e) => e.id === id)), p.id);
});

test('Vorlagen: 30 bis 90 Minuten, gültige Übungen, passende Angaben', () => {
  const ready = TEMPLATES.filter((t) => !t.origin);
  assert.ok(ready.length >= 14, 'mindestens 14 Vorschläge, es sind ' + ready.length);
  const ids = TEMPLATES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of TEMPLATES) {
    assert.ok(t.name && t.items.length >= 3, t.id);
    assert.equal(new Set(t.items.map((i) => i.ex)).size, t.items.length, t.id + ' doppelte Übung');
    for (const it of t.items) assert.ok(EX[it.ex], t.id + ' ' + it.ex);
    const min = Builder.minutesOf(t.items);
    if (!t.origin) {
      assert.match(t.id, /^p-/);
      assert.ok(min >= 30 && min <= 90, t.name + ': ' + min + ' Minuten');
    }
  }
});
