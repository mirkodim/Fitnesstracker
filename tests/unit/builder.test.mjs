import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Builder = require('../../builder.js');
const { LIB, EX } = require('../../lib.js');
const { GROUPS, EQUIP, PRESETS, REPS } = require('../../plan.js');
const { TEMPLATES, TEMPLATE_MAP } = require('../../trainings.js');

const ALL = EQUIP.map((e) => e.id);
const GYM = PRESETS.find((p) => p.id === 'gym').equip;
const ids = (items) => items.map((i) => i.ex);

test('Ausrüstung: "kh|lh" heisst eines von beiden, mehrere Angaben heissen alles', () => {
  const have = (...l) => Builder.haveSet(l);
  assert.equal(Builder.eqOK(EX['x-squat'], have()), true, 'Körpergewicht geht immer');
  assert.equal(Builder.eqOK(EX['a-hip'], have('bank', 'kh')), true);
  assert.equal(Builder.eqOK(EX['a-hip'], have('bank', 'lh')), true);
  assert.equal(Builder.eqOK(EX['a-hip'], have('bank')), false);
  assert.equal(Builder.eqOK(EX['a-hip'], have('kh')), false);
  assert.equal(Builder.missing(EX['a-hip'], have('bank')).length, 1);
  assert.match(Builder.missing(EX['a-hip'], have('bank'))[0], /^(Langhantel oder Kurzhanteln|Kurzhanteln oder Langhantel)$/);
  assert.deepEqual(Builder.missing(EX['x-bench'], have('lh')), ['Bank']);
  assert.deepEqual(Builder.missing(EX['x-squat'], have()), []);
});

test('Wiederholungen: drei Bereiche, Plus und Minus verschieben den Bereich um eins', () => {
  assert.deepEqual(REPS, ['6–8', '8–10', '8–12']);
  assert.deepEqual(Builder.REPS, REPS);
  assert.equal(Builder.repsShift('8–12', 1), '9–13');
  assert.equal(Builder.repsShift('8–12', -1), '7–11');
  assert.equal(Builder.repsShift('6–8', -1), '5–7');
  assert.equal(Builder.repsShift('10', 1), '11', 'eine einzelne Zahl bleibt eine einzelne Zahl');
  assert.equal(Builder.repsShift('max.', 1), '9–13', 'ohne Zahl geht es von 8–12 aus');
  assert.equal(Builder.repsShift(undefined, -1), '7–11');
  assert.equal(Builder.repsShift('1–3', -1), null, 'unter 1 geht es nicht');
  assert.equal(Builder.repsShift('1', -1), null);
  assert.equal(Builder.repsShift('90–99', 1), null, 'über 99 geht es nicht');
  // mehrfach drücken kommt zurück
  let v = '8–12';
  for (let i = 0; i < 7; i++) v = Builder.repsShift(v, 1);
  for (let i = 0; i < 7; i++) v = Builder.repsShift(v, -1);
  assert.equal(v, '8–12');
  // jede Übung beginnt mit einem der drei Bereiche; Haltezeit-Übungen haben keine Wiederholungen
  for (const e of LIB) if (!e.timer) assert.ok(REPS.includes(e.reps), e.id + ' hat ' + e.reps);
  const r = Builder.resolveItem({ ex: 'x-squat', reps: '9–13' });
  assert.equal(r.reps, '9–13');
  assert.equal(Builder.resolveItem({ ex: 'x-squat' }).reps, EX['x-squat'].reps);
});

test('Keine Zeit und keine Stufe: die Schnittstelle kennt weder Minuten noch Einsteiger', () => {
  for (const name of ['estimate', 'minutesOf', 'minutesText', 'itemSeconds', 'avgReps']) assert.equal(Builder[name], undefined, name);
  const r = Builder.suggest({ groups: ['ganz'], equip: ALL, seed: 1, minutes: 10, level: 1 });
  assert.equal(r.minutes, undefined);
  assert.equal(r.items.length, Builder.countFor(['ganz'], false), 'Minuten und Stufe werden ignoriert');
});

test('Nötige Ausrüstung: lesbare Liste ohne Doppelte, leer bei reinem Körpergewicht', () => {
  assert.deepEqual(Builder.needs([{ ex: 'x-squat' }, { ex: 'x-bridge' }]), []);
  const n = Builder.needs([{ ex: 'a-hip' }, { ex: 'x-bench' }, { ex: 'x-dbpress' }]);
  assert.ok(n.includes('Bank') && n.includes('Langhantel') && n.includes('Kurzhanteln'), n.join());
  assert.equal(new Set(n).size, n.length);
  // wenn die Langhantel sowieso gebraucht wird, steht "Langhantel oder Kurzhanteln" nicht zusätzlich da
  assert.ok(!n.some((x) => / oder /.test(x)), n.join());
  assert.ok(Builder.needs([{ ex: 'a-hip' }]).some((x) => / oder /.test(x)));
});

test('Gruppen: Hauptbereich zählt voll, Nebenbereich halb; Ganzkörper-Trainings passen zu jeder Frage', () => {
  const row = EX['x-cablerow'];                       // Rücken zuerst, Oberarme nebenbei
  assert.equal(Builder.weightIn(row, 'ruecken'), 1);
  assert.equal(Builder.weightIn(row, 'arme'), 0.5);
  assert.equal(Builder.weightIn(row, 'beine'), 0);
  assert.equal(Builder.groupShare([{ ex: 'x-cablerow' }, { ex: 'b-curl' }], 'arme'), 0.75);
  assert.equal(Builder.groupShare([], 'beine'), 0);
  assert.equal(Builder.isFullBody(TEMPLATE_MAP['p-einstieg'].items), true);
  assert.equal(Builder.isFullBody(TEMPLATE_MAP['p-core'].items), false);
  assert.equal(Builder.isFullBody(TEMPLATE_MAP['p-oberkoerper-kabel'].items), false, 'ohne Beine ist es kein Ganzkörper-Training');
  assert.deepEqual(Builder.groupsOf(EX['x-bridge']).sort(), ['beine', 'gesaess']);
  for (const e of LIB) assert.ok(Builder.groupsOf(e).length >= 1, e.id + ' liegt in keiner Gruppe');
});

test('Vorschlag: nur Übungen, die zur Ausrüstung passen, nie doppelt, nie über "Geübt" (ausser bei Mangel)', () => {
  for (const equip of [[], ['band'], ['kh', 'bank'], GYM, ALL]) {
    const have = Builder.haveSet(equip);
    for (const g of GROUPS) {
      const r = Builder.suggest({ groups: [g.id], equip, seed: 7 });
      const list = ids(r.items);
      assert.equal(new Set(list).size, list.length, g.id + ' doppelte Übung');
      for (const id of list) {
        assert.ok(Builder.eqOK(EX[id], have), g.id + ' ' + id + ' passt nicht zur Ausrüstung ' + equip.join('+'));
        if (!r.relaxed) assert.ok(EX[id].lvl <= Builder.LEVEL, id + ' ist schwerer als Stufe ' + Builder.LEVEL);
      }
    }
  }
  assert.equal(Builder.LEVEL, 2);
});

test('Vorschlag: der Bereich stimmt, zuerst Übungen mit diesem Hauptbereich', () => {
  const r = Builder.suggest({ groups: ['arme'], equip: ['kh', 'bank', 'kz', 'ma', 'lh', 'stange'], seed: 3 });
  assert.equal(r.items.length, 5);
  for (const it of r.items) assert.ok(Builder.inGroup(EX[it.ex], 'arme'), it.ex);
  const main = r.items.filter((it) => Builder.weightIn(EX[it.ex], 'arme') === 1).length;
  assert.ok(main / r.items.length >= 0.6, 'mindestens 60 % mit Hauptbereich Arme: ' + main + '/' + r.items.length);
  const legs = Builder.suggest({ groups: ['beine'], equip: GYM, seed: 4 });
  assert.ok(legs.items.every((it) => Builder.inGroup(EX[it.ex], 'beine')));
  const two = Builder.suggest({ groups: ['bauch', 'gesaess'], equip: [], seed: 5 });
  assert.ok(two.items.some((it) => Builder.inGroup(EX[it.ex], 'bauch')) && two.items.some((it) => Builder.inGroup(EX[it.ex], 'gesaess')), 'beide Bereiche kommen vor');
});

test('Vorschlag: die Anzahl hängt nur von den Bereichen ab, nicht von einer Zeit', () => {
  assert.equal(Builder.countFor(['beine'], false), 5);
  assert.equal(Builder.countFor(['beine', 'arme'], false), 6);
  assert.equal(Builder.countFor(['beine', 'arme', 'bauch'], false), 7);
  assert.equal(Builder.countFor(['ganz'], false), 7);
  assert.equal(Builder.countFor(['beine'], true), 4, 'ein kleiner Start hat vier Übungen');
  for (const [groups, n] of [[['beine'], 5], [['beine', 'ruecken'], 6], [['ganz'], 7], [['brust', 'ruecken', 'arme'], 7]]) {
    const r = Builder.suggest({ groups, equip: ALL, seed: 2 });
    assert.equal(r.items.length, n, groups.join('+'));
    assert.ok(r.items.every((it) => it.sets === 3 && it.reps === undefined && it.rest === undefined), 'drei Sätze, Rest aus der Bibliothek');
  }
  const small = Builder.suggest({ groups: ['ganz'], equip: ALL, seed: 2, quick: true });
  assert.equal(small.items.length, 4);
  assert.ok(small.items.every((it) => it.sets === 2), 'kleiner Start: zwei Sätze');
  assert.ok(small.items.every((it) => it.rest == null || it.rest <= 45), 'und kurze Pausen');
});

test('Vorschlag: gleiche Eingabe gibt das gleiche Training, anderer Wert ein anderes', () => {
  const o = { groups: ['ganz'], equip: ALL, seed: 5 };
  assert.deepEqual(Builder.suggest(o), Builder.suggest({ ...o }));
  const variants = new Set();
  for (let seed = 1; seed <= 12; seed++) variants.add(ids(Builder.suggest({ ...o, seed }).items).join());
  assert.ok(variants.size >= 6, 'nur ' + variants.size + ' verschiedene Vorschläge bei 12 Versuchen');
  const without = Builder.suggest({ ...o, exclude: ids(Builder.suggest(o).items) });
  assert.ok(without.items.every((it) => !ids(Builder.suggest(o).items).includes(it.ex)), 'ausgeschlossene Übungen fehlen');
});

test('Vorschlag: grosse Bewegungen zuerst, kleine am Schluss', () => {
  const r = Builder.suggest({ groups: ['ganz'], equip: GYM, seed: 9 });
  const pr = r.items.map((it) => Builder.PRIORITY[EX[it.ex].pat] || 5);
  for (let i = 1; i < pr.length; i++) assert.ok(pr[i] <= pr[i - 1], 'Reihenfolge: ' + ids(r.items).join(' '));
});

test('Vorschlag: auch ohne Ausrüstung bekommt jeder Bereich ein brauchbares Training', () => {
  for (const g of GROUPS) {
    for (const quick of [false, true]) {
      const r = Builder.suggest({ groups: [g.id], equip: [], seed: 1, quick });
      assert.ok(r.items.length >= 2, g.label + (quick ? ' (klein)' : '') + ': nur ' + r.items.length + ' Übungen');
      assert.ok(r.items.length <= Builder.countFor([g.id], quick));
    }
  }
  assert.deepEqual(Builder.suggest({ groups: ['arme'], equip: [], seed: 1, exclude: LIB.map((e) => e.id) }).items, [], 'ohne passende Übung bleibt die Liste leer');
});

test('Alternativen: gleiche Ausrüstung, nie schon im Training, ähnliche Übungen zuerst', () => {
  const alt = Builder.alternatives('x-squat', { equip: [], level: 2, taken: ['x-squat', 'x-lunge'] });
  assert.ok(alt.length >= 3);
  assert.ok(!alt.some((e) => e.id === 'x-squat' || e.id === 'x-lunge'));
  assert.ok(alt.every((e) => e.eq.length === 0 && e.lvl <= 2));
  assert.equal(alt[0].pat === 'squat' || alt[0].regions.includes('oberschenkel'), true, alt[0].id);
  assert.deepEqual(Builder.alternatives('gibt-es-nicht', { equip: [] }), []);
});

test('Anpassen: ersetzt oder streicht, was ohne Ausrüstung nicht geht, und meldet es', () => {
  const items = TEMPLATE_MAP['p-kraft'].items;
  const none = Builder.adapt(items, { equip: [], level: 3 });
  const have = Builder.haveSet([]);
  assert.ok(none.items.every((it) => Builder.eqOK(EX[it.ex], have)), 'alles passt jetzt');
  assert.equal(none.items.length + none.dropped.length, items.length);
  assert.ok(none.replaced.length > 0);
  assert.ok(none.replaced.every((r) => Builder.eqOK(EX[r.to], have) && r.from !== r.to));
  assert.equal(new Set(ids(none.items)).size, none.items.length, 'keine Doppelten');
  const same = Builder.adapt(items, { equip: ALL, level: 3 });
  assert.deepEqual(same.items, items, 'mit voller Ausrüstung bleibt alles');
  assert.equal(same.replaced.length + same.dropped.length, 0);
  const sets = Builder.adapt([{ ex: 'x-backsquat', sets: 5, rest: 100 }], { equip: [], level: 3 }).items[0];
  assert.equal(sets.sets, 5, 'Sätze bleiben');
  assert.equal(sets.rest, 100, 'Pause bleibt');
});

test('Fertige Trainings: jeder Bereich hat mindestens ein passendes, mehrere Stufen und Geräte sind vertreten', () => {
  const ready = TEMPLATES.filter((t) => !t.origin);
  for (const g of GROUPS.filter((x) => x.id !== 'ganz')) {
    const fits = ready.filter((t) => Builder.isFullBody(t.items) || Builder.groupShare(t.items, g.id) >= Builder.SHARE);
    assert.ok(fits.length >= 2, g.label + ': nur ' + fits.length + ' fertige Trainings');
  }
  assert.ok(ready.every((t) => t.items.length >= 5 && t.items.length <= 14), 'jedes fertige Training hat 5 bis 14 Übungen');
  assert.ok(ready.some((t) => Builder.needs(t.items).length === 0), 'es gibt Trainings ohne Geräte');
  assert.ok(ready.some((t) => Builder.needs(t.items).includes('TRX')) && ready.some((t) => Builder.needs(t.items).includes('Kettlebell')));
  for (const e of EQUIP) if (e.id !== 'mb') assert.ok(ready.some((t) => t.items.some((i) => EX[i.ex].eq.some((tok) => tok.split('|').includes(e.id)))), e.label);
});

test('Bibliothek pro Bereich sortiert: leichteste zuerst, dann nach Name', () => {
  for (const g of GROUPS) {
    const l = Builder.listGroup(g.id);
    for (let i = 1; i < l.length; i++) assert.ok(l[i - 1].lvl < l[i].lvl || (l[i - 1].lvl === l[i].lvl && l[i - 1].name.localeCompare(l[i].name, 'de') <= 0), g.id + ' ' + l[i - 1].name);
  }
  const have = Builder.haveSet([]);
  assert.ok(Builder.listGroup('beine', have).every((e) => Builder.eqOK(e, have)));
});

test('Alle Übungen: jede Übung genau einmal, unter ihrem Hauptbereich, Bereiche in fester Reihenfolge', () => {
  const all = Builder.allByGroup(null);
  assert.deepEqual(all.map((g) => g.id), GROUPS.map((g) => g.id));
  const seen = {};
  for (const g of all) {
    for (const e of g.list) {
      assert.equal(seen[e.id], undefined, e.id + ' kommt doppelt vor');
      seen[e.id] = g.id;
      assert.equal(Builder.mainGroup(e), g.id);
      assert.ok(GROUPS.find((x) => x.id === g.id).leaves.includes(e.regions[0]), e.id + ' steht unter ' + g.id);
    }
    for (let i = 1; i < g.list.length; i++) assert.ok(g.list[i - 1].lvl <= g.list[i].lvl, g.id + ': leichtere zuerst');
  }
  assert.equal(Object.keys(seen).length, LIB.length, 'alle ' + LIB.length + ' Übungen sind dabei');
  // mit Ausrüstungsfilter bleibt jede Übung genau einmal, nur passende
  const have = Builder.haveSet(['kh', 'bank']);
  const some = Builder.allByGroup(have);
  const flat = some.flatMap((g) => g.list);
  assert.equal(new Set(flat.map((e) => e.id)).size, flat.length);
  assert.ok(flat.every((e) => Builder.eqOK(e, have)));
  assert.equal(flat.length, LIB.filter((e) => Builder.eqOK(e, have)).length);
});

test('Name eines neuen Trainings: kurz, aus dem Inhalt, ohne dass jemand nachdenken muss', () => {
  const it = (...l) => l.map((ex) => ({ ex }));
  const name = (l, taken) => Builder.nameFor(it(...l), taken);
  assert.equal(Builder.nameFor([], []), 'Training');
  assert.equal(name(['x-squat', 'x-lunge']), 'Beine');
  assert.equal(name(['x-squat', 'x-bridge']), 'Beine & Gesäss');
  assert.equal(name(['x-bench', 'x-bbrow']), 'Brust & Rücken', 'bei gleich vielen kommt die Brust zuerst');
  assert.equal(name(['x-bench', 'x-bbrow', 'x-ohp']), 'Oberkörper', 'drei Bereiche des Oberkörpers: Oberkörper');
  assert.equal(name(['b-curl', 'x-pushdown']), 'Arme');
  assert.equal(name(['x-crunch', 'a-plank']), 'Bauch');
  assert.equal(name(['x-chintuck', 'x-superman']), 'Rücken & Nacken');
  assert.equal(name(['x-squat', 'a-push', 'x-superman']), 'Ganzkörper', 'oben und unten, mindestens drei Bereiche');
  assert.equal(name(['x-burpee', 'x-jack', 'x-squat']), 'Ganzkörper', 'meist Ganzkörper-Übungen');
  // Wer nur Nebenwirkungen trainiert, bekommt dafür keinen Namen: es zählt der Hauptbereich einer Übung
  assert.equal(name(['x-legpress', 'x-legext', 'x-legcurl']), 'Beine');
  // ein Name, den es schon gibt, bekommt die Ausrüstung, dann eine Nummer; Gross und Klein ist egal
  assert.equal(name(['x-legpress', 'x-legext', 'x-legcurl'], ['beine']), 'Beine · Maschinen');
  assert.equal(name(['x-squat', 'x-lunge'], ['Beine']), 'Beine · Körpergewicht');
  assert.equal(name(['x-squat', 'x-lunge'], ['Beine', 'beine · körpergewicht']), 'Beine · Körpergewicht 2');
  assert.equal(name(['x-squat', 'x-lunge'], ['Beine', 'Beine · Körpergewicht', 'Beine · Körpergewicht 2']), 'Beine · Körpergewicht 3');
  assert.equal(name(['x-bench', 'x-ohp', 'x-cablefly', 'x-bbrow', 'x-pullup'], ['Oberkörper']), 'Oberkörper 2', 'bei gemischter Ausrüstung nur die Nummer');
  assert.equal(Builder.equipName(it('x-bench', 'x-ohp', 'x-cablefly', 'x-bbrow', 'x-pullup')), '');
  assert.equal(Builder.equipName(it('x-legpress', 'x-legext', 'x-legcurl')), 'Maschinen');
  assert.equal(Builder.equipName(it('x-squat', 'x-lunge')), 'Körpergewicht');
  assert.equal(Builder.equipName([]), '');
});

test('Namen: jeder fertige Vorschlag der App und jedes Training aus dem Assistenten bekommt einen sauberen, kurzen Namen', () => {
  const every = (list) => { for (const t of list) { const nm = Builder.nameFor(t.items, []); assert.ok(nm && nm.length <= 30 && !/undefined|null|NaN/.test(nm), t.id + ': ' + nm); } };
  every(TEMPLATES);
  for (const g of GROUPS) {
    const s = Builder.suggest({ groups: [g.id], equip: ALL, seed: 3 });
    const nm = Builder.nameFor(s.items, []);
    assert.ok(nm.length > 0 && nm.length <= 30, g.id + ': ' + nm);
  }
});
