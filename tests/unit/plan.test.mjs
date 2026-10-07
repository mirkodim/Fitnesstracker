import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const plan = require('../../plan.js');
const { LIB, EX } = require('../../lib.js');
const { SEEDS, TEMPLATES, TEMPLATE_MAP } = require('../../trainings.js');
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
    // die Wiederholungen von Tag A und B stehen unverändert in den Trainings (siehe unten); die Bibliothek beginnt mit einem der drei Bereiche
    if (!s.timer) { assert.equal(e.unit, s.unit, id); assert.ok(plan.REPS.includes(e.reps), id + ' ' + e.reps); }
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
  const T = { A: SEEDS.find((t) => t.id === 'A'), B: SEEDS.find((t) => t.id === 'B') };
  assert.deepEqual(SEEDS.map((t) => t.id), ['A', 'B']);
  assert.deepEqual(T.A.items.map((i) => i.ex), ['a-box', 'a-hip', 'a-push', 'a-tri', 'a-plank']);
  assert.deepEqual(T.B.items.map((i) => i.ex), ['b-rdl', 'b-row', 'b-lunge', 'b-curl', 'b-crunch']);
  assert.equal(T.A.name, 'Tag A');
  assert.equal(T.B.name, 'Tag B');
  assert.equal(T.A.sub, 'Kniebeuge + Hüfte + Push');
  assert.equal(T.B.sub, ref.PLAN.B.focus);
  const spec = {
    'a-box': [3, '8–10', 90], 'a-hip': [3, '8–12', 90], 'a-push': [3, 'max.', 60], 'a-tri': [3, '10–15', 60],
    'b-rdl': [3, '8–12', 90], 'b-row': [3, '10–15', 60], 'b-lunge': [3, '8–12', 90], 'b-curl': [3, '10–15', 60], 'b-crunch': [3, '10–15', 45]
  };
  for (const it of [...T.A.items, ...T.B.items]) {
    if (it.ex === 'a-plank') { assert.equal(it.sets, 3); assert.equal(it.rest, 45); assert.equal(it.hold, 45); continue; }
    assert.deepEqual([it.sets, it.reps, it.rest], spec[it.ex], it.ex);
  }
  const legSets = (d, ids) => T[d].items.filter((i) => ids.includes(i.ex)).reduce((n, i) => n + i.sets, 0);
  assert.equal(legSets('A', ['a-box', 'a-hip']), 6);
  assert.equal(legSets('B', ['b-rdl', 'b-lunge']), 6);
});

test('Tag A und Tag B sind keine Sonderfälle mehr: sie stehen nicht unter den fertigen Vorschlägen', () => {
  assert.equal(TEMPLATE_MAP.A, undefined);
  assert.equal(TEMPLATE_MAP.B, undefined);
  assert.ok(!TEMPLATES.some((t) => t.id === 'A' || t.id === 'B'));
  for (const t of SEEDS) {
    assert.equal(t.kneeCheck, true, t.id + ' behält den Knie-Hinweis');
    for (const it of t.items) assert.ok(EX[it.ex], t.id + ' ' + it.ex);
  }
});

test('Hip Thrust und TRX-Trizepsstrecken: Inhalte laut Auftrag', () => {
  const hip = EX['a-hip'];
  assert.equal(hip.name, 'Hip Thrust');
  assert.equal(hip.gear, 'Langhantel mit Polster oder Kurzhantel');
  assert.match(hip.cues[0], /Bankkante/);
  assert.match(hip.cues[1], /Kinn leicht zur Brust/);
  const note = SEEDS.find((t) => t.id === 'A').items.find((i) => i.ex === 'a-hip').note;
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

test('Jedes Gerät kommt in mindestens einer Übung vor, es gibt genau drei Orte zum Trainieren', () => {
  for (const e of EQUIP) assert.ok(LIB.some((ex) => ex.eq.some((t) => t.split('|').includes(e.id))), e.label + ' wird nicht gebraucht');
  for (const p of PRESETS) assert.ok(p.equip.every((id) => EQUIP.some((e) => e.id === id)), p.id);
  assert.deepEqual(PRESETS.map((p) => p.label), ['Fitnessstudio', 'Homegym', 'Ohne Ausrüstung']);
  assert.deepEqual(PRESETS.map((p) => p.id), ['gym', 'homegym', 'none']);
  assert.equal(PRESETS[0].equip.length, EQUIP.length, 'im Fitnessstudio ist alles da');
  assert.deepEqual(PRESETS[2].equip, []);
  assert.ok(PRESETS[1].equip.length > 0 && PRESETS[1].equip.length < EQUIP.length);
  assert.equal(plan.LEVELS, undefined, 'keine Stufenfrage mehr');
  assert.equal(plan.TIMES, undefined, 'keine Zeitfrage mehr');
});

test('Wiederholungen: genau drei Bereiche, jede Übung beginnt mit einem davon', () => {
  assert.deepEqual(plan.REPS, ['6–8', '8–10', '8–12']);
  for (const ex of LIB) if (!ex.timer) assert.ok(plan.REPS.includes(ex.reps), ex.id + ' hat ' + ex.reps);
  const used = new Set(LIB.filter((e) => !e.timer).map((e) => e.reps));
  assert.equal(used.size, 3, 'alle drei Bereiche werden gebraucht');
  // die fertigen Vorschläge nehmen die Werte der Bibliothek, nur Tag A und B (SEEDS) behalten ihre eigenen aus dem ersten Plan
  for (const t of TEMPLATES) for (const it of t.items) assert.equal(it.reps, undefined, t.id + ' ' + it.ex);
});

test('Vorlagen: gültige Übungen, passende Angaben, nirgends eine Zeitangabe', () => {
  const ready = TEMPLATES;
  assert.ok(ready.length >= 14, 'mindestens 14 Vorschläge, es sind ' + ready.length);
  const ids = TEMPLATES.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of TEMPLATES) {
    assert.ok(t.name && t.items.length >= 3, t.id);
    assert.equal(new Set(t.items.map((i) => i.ex)).size, t.items.length, t.id + ' doppelte Übung');
    for (const it of t.items) assert.ok(EX[it.ex], t.id + ' ' + it.ex);
    assert.match(t.id, /^p-/);
    assert.doesNotMatch(t.name + ' ' + (t.sub || ''), /\d+\s*(Min|Minute|Stunde)|\bMin\.|Dauer/i, t.id + ' nennt eine Zeit');
  }
});

test('Maschinen aus Fitness- und Reha-Zentren: die üblichen Geräte sind alle da, jedes in seinem Bereich', () => {
  const expect = {
    'x-legpress': 'oberschenkel', 'x-legext': 'oberschenkel', 'x-legcurl': 'oberschenkel', 'x-legcurlseat': 'oberschenkel', 'x-adduct': 'oberschenkel', 'x-abduct': 'gesaess',
    'x-hack': 'oberschenkel', 'x-smith': 'oberschenkel', 'x-calfpress': 'unterschenkel', 'x-calfmach': 'unterschenkel', 'x-glutekick': 'gesaess',
    'x-pulldown': 'ruecken', 'x-machinerow': 'ruecken', 'x-assistpull': 'ruecken', 'x-lumbar': 'ruecken', 'x-hyper': 'ruecken', 'x-revfly': 'schultern',
    'x-chestpress': 'brust', 'x-pecdeck': 'brust', 'x-inclinedb': 'brust',
    'x-shpress': 'schultern', 'x-latmach': 'schultern', 'x-curlmach': 'oberarme', 'x-trimach': 'oberarme',
    'x-crunchmach': 'bauch', 'x-captain': 'bauch', 'x-woodchop': 'bauch', 'x-facepull': 'schultern', 'x-straightarm': 'ruecken',
    'x-cablehip': 'gesaess', 'x-extrot': 'schultern', 'x-tke': 'oberschenkel', 'x-balance': 'unterschenkel'
  };
  for (const [id, leaf] of Object.entries(expect)) {
    assert.ok(EX[id], id + ' fehlt');
    assert.equal(EX[id].regions[0], leaf, id + ' steht unter ' + leaf);
  }
  const machines = LIB.filter((e) => e.eq.includes('ma'));
  assert.ok(machines.length >= 24, 'mindestens 24 Übungen an Maschinen, es sind ' + machines.length);
  assert.ok(LIB.length >= 118, 'die Bibliothek ist deutlich grösser geworden: ' + LIB.length);
  // jede Maschine hat ein Gewichtsfeld (ausser dem Rückenstrecker auf der Bank und der Beinhebestation, die mit dem Körpergewicht arbeiten)
  for (const e of machines) if (!['x-hyper', 'x-captain'].includes(e.id)) assert.equal(e.weight, true, e.id + ' mit Gewichtsfeld');
  // die Rehabilitation: Knie- und Schulterübungen ohne Gerät oder mit Band
  for (const id of ['x-extrot', 'x-tke', 'x-balance']) assert.ok(!EX[id].eq.includes('ma'), id + ' geht auch ohne Maschine');
  assert.equal(EX['x-tke'].knee, true);
  assert.equal(EX['x-balance'].timer, true);
  assert.equal(EX['x-balance'].sides, 2);
  // im Fitnessstudio kommen die neuen Maschinen auch in den Vorschlägen vor, ohne Ausrüstung nie
  const seen = new Set();
  for (let seed = 1; seed <= 60; seed++) for (const g of ['beine', 'ruecken', 'brust', 'schultern', 'arme', 'bauch', 'ganz']) {
    for (const it of Builder.suggest({ groups: [g], equip: PRESETS[0].equip, seed }).items) if (EX[it.ex].eq.includes('ma')) seen.add(it.ex);
    for (const it of Builder.suggest({ groups: [g], equip: [], seed }).items) assert.ok(!EX[it.ex].eq.includes('ma'), 'ohne Ausrüstung keine Maschine: ' + it.ex);
  }
  assert.ok(seen.size >= 12, 'in den Vorschlägen kommen viele verschiedene Maschinen vor: ' + seen.size);
});
