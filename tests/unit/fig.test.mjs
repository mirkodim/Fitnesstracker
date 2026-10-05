import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const FIG = require('../../fig.js');
const REF = require('../../reference/fig.js');
const { PLAN } = require('../../plan.js');

const LB = 46, LT = 36, LS = 36, LU = 26, LF = 24, HR = 9, G = 174;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function segDist(p, a, b) {
  const abx = b[0] - a[0], aby = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / (abx * abx + aby * aby)));
  return Math.hypot(p[0] - (a[0] + t * abx), p[1] - (a[1] + t * aby));
}
/* every frame of a whole animation: for each step the transition from the previous one, n samples each */
function frames(id, n = 40) {
  const A = FIG.ANIM[id], out = [];
  A.steps.forEach((to, i) => {
    const from = A.steps[(i + A.steps.length - 1) % A.steps.length];
    for (let k = 0; k <= n; k++) out.push({ step: i, from, to, t: k / n, q: FIG.mix(from.pose, to.pose, k / n), j: null });
  });
  out.forEach((f) => { f.j = FIG.solve(f.q); });
  return out;
}

test('Jede Übung des Plans hat eine Animation mit Falsch-Schritt oder Grundbewegung', () => {
  for (const d of ['A', 'B']) for (const ex of PLAN[d].exercises) {
    const A = FIG.ANIM[ex.id];
    assert.ok(A, 'Animation für ' + ex.id);
    assert.ok(A.steps.length >= 2 && A.reps >= 1, ex.id);
    assert.ok(A.hl.length >= 1, ex.id + ' hebt einen Muskel hervor');
    A.steps.forEach((s) => assert.ok(s.label && s.ms > 0 && s.hold >= 0, ex.id));
  }
  assert.deepEqual(Object.keys(FIG.ANIM).sort(), [...PLAN.A.exercises, ...PLAN.B.exercises].map((e) => e.id).sort(), 'keine übrige Animation');
});

/* a-push and b-row cut across with a bent knee halfway, although the text says "Körper bleibt eine Linie": the good moves now follow the arc. */
const STRAIGHTENED = new Set(['a-push', 'b-row']);

test('Alle anderen Animationen sind unverändert (Bild für Bild identisch zur Referenz)', () => {
  const same = Object.keys(REF.ANIM).filter((id) => id !== 'a-tri');
  assert.equal(same.length, 8);
  for (const id of same) {
    const r = REF.ANIM[id], n = FIG.ANIM[id];
    assert.deepEqual({ reps: n.reps, hl: n.hl, props: n.props, ox: n.ox }, { reps: r.reps, hl: r.hl, props: r.props, ox: r.ox }, id);
    assert.equal(n.steps.length, r.steps.length, id);
    r.steps.forEach((rs, i) => {
      const ns = n.steps[i];
      assert.deepEqual({ ms: ns.ms, hold: ns.hold, label: ns.label, bad: ns.bad }, { ms: rs.ms, hold: rs.hold, label: rs.label, bad: rs.bad }, id + ' Schritt ' + (i + 1));
      const prev = r.steps[(i + r.steps.length - 1) % r.steps.length], nprev = n.steps[(i + n.steps.length - 1) % n.steps.length];
      // corrected animations: the key poses and the deliberately wrong moves stay identical, only the good in-between frames change
      const onlyKeys = STRAIGHTENED.has(id) && !rs.bad && !prev.bad;
      for (let k = 0; k <= 12; k++) {
        if (onlyKeys && k !== 0 && k !== 12) continue;
        const t = k / 12;
        assert.equal(FIG.frame(id, FIG.mix(nprev.pose, ns.pose, t), !!ns.bad), REF.frame(id, REF.mix(prev.pose, rs.pose, t), !!rs.bad), id + ' Schritt ' + (i + 1) + ' t=' + t);
      }
    });
  }
});

test('a-push und b-row: der Körper bleibt in den richtigen Bewegungen eine gerade Linie', () => {
  for (const id of STRAIGHTENED) {
    let checked = 0;
    for (const f of frames(id)) {
      if (f.to.bad || f.from.bad) continue;
      const j = f.j;
      assert.ok(Math.abs(dist(j.hip, j.ankle) - (LT + LS)) < 1e-6, id + ' Beine gestreckt, nicht ' + dist(j.hip, j.ankle).toFixed(2));
      const off = Math.abs((j.hip[0] - j.ankle[0]) * (j.sh[1] - j.ankle[1]) - (j.hip[1] - j.ankle[1]) * (j.sh[0] - j.ankle[0])) / dist(j.sh, j.ankle);
      assert.ok(off < 0.01, id + ' Körperlinie gerade, Abweichung ' + off.toFixed(3));
      checked++;
    }
    assert.ok(checked > 40, id);
  }
  // Gegenprobe: die Referenz knickt tatsächlich (sonst wäre die Korrektur unnötig)
  const worst = (F) => { let m = 0; const A = F.ANIM['b-row']; A.steps.forEach((to, i) => { const from = A.steps[(i + A.steps.length - 1) % A.steps.length]; for (let k = 0; k <= 20; k++) { const j = F.solve(F.mix(from.pose, to.pose, k / 20)); m = Math.max(m, Math.abs(dist(j.hip, j.ankle) - 72)); } }); return m; };
  assert.ok(worst(REF) > 1, 'Referenz: Beine kürzer als gestreckt, ' + worst(REF).toFixed(2));
  assert.ok(worst(FIG) < 1e-6);
});

for (const id of ['a-tri', 'a-hip']) {
  test(id + ': Segmentlängen bleiben in allen Bildern konstant, nichts ist NaN', () => {
    for (const f of frames(id)) {
      const j = f.j;
      for (const k of Object.keys(j)) if (Array.isArray(j[k])) assert.ok(j[k].every(Number.isFinite), id + ' ' + k);
      assert.ok(Math.abs(dist(j.hip, j.knee) - LT) < 1e-6, id + ' Oberschenkel');
      assert.ok(Math.abs(dist(j.knee, j.ankle) - LS) < 1e-6, id + ' Schienbein');
      assert.ok(Math.abs(dist(j.hip, j.sh) - LB) < 1e-6, id + ' Rumpf');
      assert.ok(Math.abs(dist(j.sh, j.elbow) - LU) < 0.02, id + ' Oberarm ' + dist(j.sh, j.elbow));
      assert.ok(Math.abs(dist(j.elbow, j.wrist) - LF) < 0.02, id + ' Unterarm ' + dist(j.elbow, j.wrist));
    }
  });

  test(id + ': Figur steht bzw. liegt auf dem Boden, Füße rutschen nicht', () => {
    const fr = frames(id);
    const ank = fr[0].j.ankle;
    for (const f of fr) {
      assert.deepEqual(f.j.ankle, ank, id + ' Knöchel bleibt stehen');
      assert.ok(Math.abs(f.j.ankle[1] - G) < 1e-9 && Math.abs(f.j.toe[1] - G) < 1e-9, id + ' Fuß flach auf dem Boden');
      for (const k of ['hip', 'knee', 'sh', 'elbow', 'wrist', 'ankle', 'toe']) assert.ok(f.j[k][1] <= G + 1e-9, id + ' ' + k + ' nicht im Boden');
    }
  });

  test(id + ': alles liegt im Bild (320 x 190) und ist um 160 zentriert', () => {
    const A = FIG.ANIM[id], z = A.zoom || 1;
    let lo = 1e9, hi = -1e9, top = 1e9;
    const take = (x, y, r) => { lo = Math.min(lo, A.ox + z * (x - r)); hi = Math.max(hi, A.ox + z * (x + r)); top = Math.min(top, 178 + z * (y - r - 178)); };
    for (const f of frames(id, 20)) {
      for (const k of ['hip', 'knee', 'sh', 'elbow', 'wrist', 'ankle', 'toe']) take(f.j[k][0], f.j[k][1], 3.5);
      take(f.j.head[0], f.j.head[1], HR + 1.75);
      for (const p of A.props) if (p.t === 'plate') { const c = [f.j[p.at][0] + (p.dx || 0), f.j[p.at][1] + (p.dy || 0)]; take(c[0], c[1], p.r + 1.5); }
    }
    for (const p of A.props) {
      if (p.t === 'box') { take(p.x, p.y, 0); take(p.x + p.w, p.y + p.h, 0); }
      if (p.t === 'anchor') { take(p.x - 12, p.y, 3); take(p.x + 12, p.y, 3); }
    }
    assert.ok(lo >= 4 && hi <= 316, id + ' horizontal im Bild: ' + lo.toFixed(1) + '..' + hi.toFixed(1));
    assert.ok(top >= 2, id + ' oben im Bild: ' + top.toFixed(1));
    assert.ok(Math.abs((lo + hi) / 2 - 160) <= 4, id + ' zentriert: ' + ((lo + hi) / 2).toFixed(1));
  });

  test(id + ': hat einen orangen Falsch-Schritt und hebt den richtigen Muskel hervor', () => {
    const A = FIG.ANIM[id];
    assert.ok(A.steps.some((s) => s.bad), id);
    assert.ok(A.steps.filter((s) => s.bad).every((s) => /^Falsch:/.test(s.label)));
    assert.deepEqual(A.hl, id === 'a-tri' ? ['upper'] : ['thigh']);
  });
}

test('a-tri: Das Standing-Pushdown-Bild mit Band ist komplett verschwunden', () => {
  const A = FIG.ANIM['a-tri'];
  assert.ok(A.props.every((p) => !p.band && p.t !== 'box'), 'kein Band, kein Pfosten');
  assert.deepEqual(A.props.map((p) => p.t).sort(), ['anchor', 'strap']);
  assert.ok(A.props.find((p) => p.t === 'strap').at === 'wrist');
});

test('a-tri: Körper bleibt eine gerade Linie, Arme starten gestreckt, die Hände bleiben stehen', () => {
  const A = FIG.ANIM['a-tri'];
  const fr = frames('a-tri');
  const strapAnchor = A.props.find((p) => p.t === 'strap').anchor;
  const W = FIG.solve(A.steps[0].pose).wrist;
  for (const f of fr) {
    const j = f.j;
    assert.ok(Math.abs(dist(j.hip, j.ankle) - (LT + LS)) < 1e-6, 'Beine bleiben gestreckt');
    const toSag = f.to.bad || f.from.bad;
    if (!toSag) {
      // gerade Linie: Schulter, Hüfte und Knöchel fluchten
      const cross = Math.abs((j.hip[0] - j.ankle[0]) * (j.sh[1] - j.ankle[1]) - (j.hip[1] - j.ankle[1]) * (j.sh[0] - j.ankle[0])) / dist(j.sh, j.ankle);
      assert.ok(cross < 0.01, 'Körperlinie gerade, Abweichung ' + cross);
      assert.ok(dist(j.wrist, W) < 1e-9, 'Hände bleiben, wo der Gurt sie hält');
    }
    assert.ok(j.head[1] < j.hip[1], 'Kopf oberhalb der Hüfte');
    // der Gurt läuft mit Abstand am Kopf vorbei und endet an der Hand
    assert.ok(segDist(j.head, strapAnchor, j.wrist) >= HR + 2, 'Gurt verdeckt den Kopf nicht: ' + segDist(j.head, strapAnchor, j.wrist).toFixed(1));
    assert.ok(strapAnchor[1] < Math.min(j.head[1], j.sh[1]) - 20, 'Anker hängt hoch über der Figur');
    assert.ok(strapAnchor[0] < j.sh[0], 'Anker liegt hinter der Figur (links von den Schultern)');
    // der türkis markierte Oberarm bleibt zu mindestens 60 % sichtbar (nicht vom Kopf verdeckt)
    let visible = 0;
    for (let i = 0; i <= 20; i++) {
      const p = [j.sh[0] + (j.elbow[0] - j.sh[0]) * i / 20, j.sh[1] + (j.elbow[1] - j.sh[1]) * i / 20];
      if (dist(p, j.head) > HR + 1.5) visible++;
    }
    if (!f.to.bad) assert.ok(visible / 21 >= 0.6, 'Oberarm sichtbar: ' + (visible / 21).toFixed(2));
  }
  const up = FIG.solve(A.steps[0].pose), dn = FIG.solve(A.steps[1].pose), sag = FIG.solve(A.steps[3].pose);
  assert.ok(dist(up.sh, up.wrist) > 49.98, 'Start: Arme gestreckt');
  const elbowDeg = (j) => Math.acos((LU * LU + LF * LF - dist(j.sh, j.wrist) ** 2) / (2 * LU * LF)) * 180 / Math.PI;
  assert.ok(elbowDeg(dn) > 70 && elbowDeg(dn) < 110, 'Unten: Ellbogen deutlich gebeugt, ' + elbowDeg(dn).toFixed(0) + ' Grad');
  assert.ok(dn.head[1] > up.head[1] + 15, 'Der Kopf sinkt');
  assert.ok(dn.head[0] > up.head[0], 'Der Kopf kommt nach vorn');
  assert.ok(dn.head[1] > dn.wrist[1] + 10, 'Unten liegt der Kopf unter den Händen');
  assert.ok(dn.head[0] < dn.wrist[0], 'und hinter den Händen');
  assert.ok(Math.abs(up.elbow[1] - up.sh[1]) < 6 && up.wrist[0] > up.sh[0] + 45, 'Start: Arme zeigen nach vorn');
  assert.ok(dn.elbow[0] > dn.sh[0], 'Unten zeigen die Ellbogen nach vorn');
  // Hüfte hängt durch: sie liegt deutlich unterhalb der Linie Schulter-Knöchel
  const off = (j) => ((j.hip[0] - j.ankle[0]) * (j.sh[1] - j.ankle[1]) - (j.hip[1] - j.ankle[1]) * (j.sh[0] - j.ankle[0])) / dist(j.sh, j.ankle);
  assert.ok(Math.abs(off(sag)) > 7, 'Falsch-Schritt: Hüfte weicht sichtbar von der Linie ab: ' + off(sag).toFixed(1));
  assert.ok(sag.hip[1] > up.hip[1] && sag.hip[0] > up.hip[0], 'und liegt tiefer und weiter vorn');
});

test('a-hip: Schultern bleiben auf der Bank, oben Tischposition, unten Hüfte knapp über dem Boden', () => {
  const A = FIG.ANIM['a-hip'];
  const bench = A.props.filter((p) => p.t === 'box');
  const pad = bench.reduce((a, b) => (a.y < b.y ? a : b));
  const fr = frames('a-hip');
  const S = fr[0].j.sh;
  for (const f of fr) {
    assert.ok(dist(f.j.sh, S) < 1e-9, 'Schulter bleibt an der Bankkante');
    assert.ok(f.j.sh[0] > pad.x && f.j.sh[0] < pad.x + pad.w, 'Schulter liegt über der Bank');
    assert.ok(Math.abs(f.j.sh[1] + 3.5 - pad.y) < 0.6, 'Rücken liegt auf der Bank');
    assert.ok(f.j.head[1] + HR <= pad.y + 0.5 && f.j.head[0] > pad.x - 12 && f.j.head[0] < S[0], 'Kopf ruht auf der Bank, hinter den Schultern');
    assert.ok(f.j.head[1] < f.j.hip[1] || f.q.th < -60, 'Kopf liegt nicht unter der Hüfte');
  }
  const top = FIG.solve(A.steps[0].pose), bot = FIG.solve(A.steps[1].pose), bad = FIG.solve(A.steps[3].pose);
  // oben: Oberschenkel und Rumpf in einer Linie, Schienbein senkrecht, Kniewinkel etwa 90 Grad
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  assert.ok(Math.abs(ang(top.sh, top.hip) - ang(top.hip, top.knee)) < 1.5, 'oben: Rumpf und Oberschenkel in einer Linie');
  assert.ok(Math.abs(top.knee[0] - top.ankle[0]) < 0.6, 'oben: Schienbein senkrecht');
  assert.ok(Math.abs(top.knee[1] - top.hip[1]) < 1.5, 'oben: Oberschenkel waagerecht');
  // unten: Hüfte knapp über dem Boden, aber nicht im Boden
  const gap = (G + 3.5 + 1.5) - (bot.hip[1] + 3.5);
  assert.ok(bot.hip[1] > G - 22 && bot.hip[1] < G - 8, 'unten: Hüfte knapp über dem Boden, Gelenk ' + (G - bot.hip[1]).toFixed(1) + ' darüber');
  assert.ok(bot.hip[1] > top.hip[1] + 20, 'unten ist die Hüfte deutlich tiefer als oben');
  assert.ok(bot.knee[0] < bot.ankle[0], 'unten: Knie hinter dem Knöchel, Schienbein geneigt');
  // Hantel liegt auf der Hüfte, die Scheibe berührt den Boden nicht
  const plate = A.props.find((p) => p.t === 'plate');
  for (const f of fr) {
    assert.ok(dist(f.j.wrist, f.j.hip) < 10, 'Hantel bleibt an der Hüfte');
    assert.ok(f.j.wrist[1] + plate.r + 1.5 < 178 - 1.5, 'Scheibe berührt den Boden nicht');
  }
  // falsch: Hüfte zu hoch, Hohlkreuz (Rücken wölbt sich nach oben)
  assert.ok(bad.hip[1] < top.hip[1] - 6, 'Falsch: Hüfte höher als in der richtigen Position');
  assert.ok(FIG.ANIM['a-hip'].steps[3].pose.round < 0, 'Falsch: Hohlkreuz');
});
