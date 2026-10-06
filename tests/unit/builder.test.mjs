import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Builder = require('../../builder.js');
const { LIB, EX } = require('../../lib.js');
const { GROUPS, EQUIP, PRESETS, TIMES } = require('../../plan.js');
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

test('Zeitschätzung: mehr Sätze und mehr Übungen dauern länger, die Anzeige rundet auf fünf Minuten', () => {
  const one = [{ ex: 'x-squat', sets: 3 }], more = [{ ex: 'x-squat', sets: 4 }], two = [{ ex: 'x-squat', sets: 3 }, { ex: 'x-lunge', sets: 3 }];
  assert.ok(Builder.estimate(more) > Builder.estimate(one));
  assert.ok(Builder.estimate(two) > Builder.estimate(one) * 1.5);
  assert.equal(Builder.estimate([]), 0);
  assert.equal(Builder.minutesText(40 * 60), 'ca. 40 Min.');
  assert.equal(Builder.minutesText(43 * 60), 'ca. 45 Min.');
  assert.equal(Builder.minutesText(60), 'ca. 5 Min.');
  // Haltezeit zählt: Plank 60 s dauert länger als 30 s
  assert.ok(Builder.estimate([{ ex: 'a-plank', sets: 3, hold: 60 }]) > Builder.estimate([{ ex: 'a-plank', sets: 3, hold: 30 }]));
  // pro Seite braucht doppelt so lange
  const perSide = LIB.find((e) => /pro (Seite|Bein|Arm)/.test(e.unit || '') && !e.timer);
  assert.ok(perSide, 'es gibt Übungen pro Seite');
  assert.ok(Builder.itemSeconds({ ex: perSide.id }) > 30 + perSide.sets * perSide.rest);
  // Standardwerte: ohne Angaben rechnet die Schätzung mit der Bibliothek
  assert.equal(Builder.estimate([{ ex: 'x-squat' }]), Builder.estimate([{ ex: 'x-squat', sets: EX['x-squat'].sets, rest: EX['x-squat'].rest, reps: EX['x-squat'].reps }]));
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

test('Vorschlag: nur Übungen, die zur Ausrüstung passen, nie doppelt, nie über der Stufe (ausser bei Mangel)', () => {
  for (const equip of [[], ['band'], ['kh', 'bank'], GYM, ALL]) {
    const have = Builder.haveSet(equip);
    for (const g of GROUPS) {
      for (const level of [1, 2, 3]) {
        const r = Builder.suggest({ groups: [g.id], equip, minutes: 45, level, seed: 7 });
        const list = ids(r.items);
        assert.equal(new Set(list).size, list.length, g.id + ' doppelte Übung');
        for (const id of list) {
          assert.ok(Builder.eqOK(EX[id], have), g.id + ' ' + id + ' passt nicht zur Ausrüstung ' + equip.join('+'));
          if (!r.relaxed) assert.ok(EX[id].lvl <= level, id + ' ist schwerer als Stufe ' + level);
        }
      }
    }
  }
});

test('Vorschlag: der Bereich stimmt, zuerst Übungen mit diesem Hauptbereich', () => {
  const r = Builder.suggest({ groups: ['arme'], equip: ['kh', 'bank', 'kz', 'ma', 'lh', 'stange'], minutes: 45, level: 3, seed: 3 });
  assert.ok(r.items.length >= 5);
  for (const it of r.items) assert.ok(Builder.inGroup(EX[it.ex], 'arme'), it.ex);
  const main = r.items.filter((it) => Builder.weightIn(EX[it.ex], 'arme') === 1).length;
  assert.ok(main / r.items.length >= 0.7, 'mindestens 70 % mit Hauptbereich Arme: ' + main + '/' + r.items.length);
  const legs = Builder.suggest({ groups: ['beine'], equip: GYM, minutes: 60, level: 2, seed: 4 });
  assert.ok(legs.items.every((it) => Builder.inGroup(EX[it.ex], 'beine')));
  const two = Builder.suggest({ groups: ['bauch', 'gesaess'], equip: [], minutes: 30, level: 2, seed: 5 });
  assert.ok(two.items.some((it) => Builder.inGroup(EX[it.ex], 'bauch')) && two.items.some((it) => Builder.inGroup(EX[it.ex], 'gesaess')), 'beide Bereiche kommen vor');
});

test('Vorschlag: die Zeit passt, wenn genug Übungen da sind', () => {
  for (const minutes of TIMES) {
    for (const level of [1, 2, 3]) {
      const r = Builder.suggest({ groups: ['ganz'], equip: ALL, minutes, level, seed: 11 });
      assert.ok(r.minutes <= minutes * 1.2 + 2, minutes + ' Min. Stufe ' + level + ' ergibt ' + r.minutes);
      assert.ok(r.minutes >= minutes * 0.6, minutes + ' Min. Stufe ' + level + ' ergibt nur ' + r.minutes);
      assert.equal(r.minutes, Builder.minutesOf(r.items));
    }
  }
  const small = Builder.suggest({ groups: ['ganz'], equip: ALL, minutes: 10, level: 1, seed: 2 });
  assert.ok(small.items.length >= 2 && small.items.length <= 6);
  assert.ok(small.items.every((it) => it.sets <= 2), 'kurzes Training: höchstens zwei Sätze');
});

test('Vorschlag: gleiche Eingabe gibt das gleiche Training, anderer Wert ein anderes', () => {
  const o = { groups: ['ganz'], equip: ALL, minutes: 60, level: 2, seed: 5 };
  assert.deepEqual(Builder.suggest(o), Builder.suggest({ ...o }));
  const variants = new Set();
  for (let seed = 1; seed <= 12; seed++) variants.add(ids(Builder.suggest({ ...o, seed }).items).join());
  assert.ok(variants.size >= 6, 'nur ' + variants.size + ' verschiedene Vorschläge bei 12 Versuchen');
  const without = Builder.suggest({ ...o, exclude: ids(Builder.suggest(o).items) });
  assert.ok(without.items.every((it) => !ids(Builder.suggest(o).items).includes(it.ex)), 'ausgeschlossene Übungen fehlen');
});

test('Vorschlag: grosse Bewegungen zuerst, kleine am Schluss', () => {
  const r = Builder.suggest({ groups: ['ganz'], equip: GYM, minutes: 60, level: 2, seed: 9 });
  const pr = r.items.map((it) => Builder.PRIORITY[EX[it.ex].pat] || 5);
  for (let i = 1; i < pr.length; i++) assert.ok(pr[i] <= pr[i - 1], 'Reihenfolge: ' + ids(r.items).join(' '));
});

test('Vorschlag: auch ohne Ausrüstung bekommt jeder Bereich, jede Zeit und jede Stufe ein brauchbares Training', () => {
  for (const g of GROUPS) {
    for (const minutes of TIMES) {
      for (const level of [1, 2, 3]) {
        const r = Builder.suggest({ groups: [g.id], equip: [], minutes, level, seed: 1 });
        assert.ok(r.items.length >= 2, g.label + ' ' + minutes + ' Min. Stufe ' + level + ': nur ' + r.items.length + ' Übungen');
        assert.ok(r.minutes >= 5, g.label + ' ' + minutes + ' Min.');
      }
    }
  }
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
  const minutes = ready.map((t) => Builder.minutesOf(t.items));
  assert.ok(Math.min(...minutes) <= 36 && Math.max(...minutes) >= 80, 'kurz und lang: ' + Math.min(...minutes) + '–' + Math.max(...minutes));
  assert.ok(ready.some((t) => Builder.needs(t.items).length === 0), 'es gibt Trainings ohne Geräte');
  assert.ok(ready.some((t) => Builder.needs(t.items).includes('TRX')) && ready.some((t) => Builder.needs(t.items).includes('Kettlebell')));
  for (const e of EQUIP) if (e.id !== 'mb') assert.ok(ready.some((t) => t.items.some((i) => EX[i.ex].eq.some((tok) => tok.split('|').includes(e.id)))), e.label);
});

test('Bibliothek pro Bereich sortiert: leichteste zuerst, dann nach Name', () => {
  for (const g of GROUPS) {
    const l = Builder.listGroup(g.id);
    for (let i = 1; i < l.length; i++) assert.ok(l[i - 1].lvl < l[i].lvl || (l[i - 1].lvl === l[i].lvl && l[i - 1].name <= l[i].name), g.id + ' ' + l[i - 1].name);
  }
  const have = Builder.haveSet([]);
  assert.ok(Builder.listGroup('beine', have).every((e) => Builder.eqOK(e, have)));
});
