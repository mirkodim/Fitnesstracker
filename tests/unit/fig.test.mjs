import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const FIG = require('../../fig.js');
require('../../anims.js');
const REF = require('../../reference/fig.js');
const { LIB } = require('../../lib.js');
const IDS = Object.keys(FIG.ANIM);
const NEW_IDS = IDS.filter((id) => id.startsWith('x-'));      // the ten of the first version are kept exactly as they were (see the comparison with the reference)

const LB = 46, LT = 36, LS = 36, LU = 26, LF = 24, HR = 9, G = 174, D2R = FIG.D2R;
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

test('Jede Übung der Bibliothek hat genau eine Animation, mit Schritten, Beschriftung und hervorgehobenem Muskel', () => {
  for (const ex of LIB) {
    const A = FIG.ANIM[ex.id];
    assert.ok(A, 'Animation für ' + ex.id);
    assert.ok(A.steps.length >= 2 && A.reps >= 1, ex.id);
    assert.ok(A.hl.length >= 1, ex.id + ' hebt einen Muskel hervor');
    assert.ok(Number.isInteger(A.thumb || 0) && (A.thumb || 0) < A.steps.length, ex.id + ' Vorschaubild');
    A.steps.forEach((s) => assert.ok(s.label && s.ms > 0 && s.hold >= 0, ex.id));
    A.steps.filter((s) => s.bad).forEach((s) => assert.match(s.label, /^Falsch:/, ex.id));
  }
  assert.deepEqual(IDS.sort(), LIB.map((e) => e.id).sort(), 'keine übrige Animation');
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
      assert.deepEqual({ ms: ns.ms, hold: ns.hold, label: ns.label, bad: ns.bad }, { ms: rs.ms, hold: rs.hold, label: rs.label.replace(/ß/g, 'ss'), bad: rs.bad }, id + ' Schritt ' + (i + 1));
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

  test(id + ': Figur steht bzw. liegt auf dem Boden, Füsse rutschen nicht', () => {
    const fr = frames(id);
    const ank = fr[0].j.ankle;
    for (const f of fr) {
      assert.deepEqual(f.j.ankle, ank, id + ' Knöchel bleibt stehen');
      assert.ok(Math.abs(f.j.ankle[1] - G) < 1e-9 && Math.abs(f.j.toe[1] - G) < 1e-9, id + ' Fuss flach auf dem Boden');
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


/* ---------- every animation, every frame ---------- */
const HELD = { plate: 1, bell: 1, ball: 1, pad: 1 };
const heldR = (p) => p.r || (p.t === 'bell' ? 8 : (p.t === 'pad' ? (p.len || 30) / 2 : 10));

function allFrames(id, n = 24) {
  const A = FIG.ANIM[id], out = [];
  A.steps.forEach((to, i) => {
    const from = A.steps[(i + A.steps.length - 1) % A.steps.length];
    for (let k = 0; k <= n; k++) {
      const q = FIG.mix(from.pose, to.pose, k / n);
      out.push({ step: i, bad: !!(to.bad || from.bad), q, j: A.view === 'f' ? FIG.solveF(q) : FIG.solve(q) });
    }
  });
  return out;
}

test('Alle Animationen: nichts ist NaN, die Segmentlängen bleiben in jedem Bild gleich', () => {
  for (const id of NEW_IDS) {
    const A = FIG.ANIM[id];
    for (const f of allFrames(id)) {
      const j = f.j;
      for (const k of Object.keys(j)) if (Array.isArray(j[k])) assert.ok(j[k].every(Number.isFinite), id + ' ' + k);
      if (A.view === 'f') {
        assert.ok(Math.abs(dist(j.P, j.C) - LB) < 1e-6, id + ' Rumpf');
        // a limb that points at the viewer (seated thighs, a forearm held forward) is drawn shorter by the factors ts, cs, us, fs of the pose
        const q = f.q;
        for (const [a, b, l] of [['hipL', 'knL', LT * q.ts], ['knL', 'anL', LS * q.cs], ['hipR', 'knR', LT * q.ts], ['knR', 'anR', LS * q.cs], ['shL', 'elL', LU * q.us], ['elL', 'wrL', LF * q.fs], ['shR', 'elR', LU * q.us], ['elR', 'wrR', LF * q.fs]]) {
          assert.ok(Math.abs(dist(j[a], j[b]) - l) < 1e-6, id + ' ' + a + '-' + b);
        }
        for (const k of ['us', 'fs', 'ts', 'cs']) assert.ok(q[k] >= 0.05 && q[k] <= 1, id + ' ' + k + ' ist ' + q[k]);
      } else {
        const where = id + ' Schritt ' + (f.step + 1);
        assert.ok(Math.abs(dist(j.hip, j.knee) - LT) < 1e-6 && Math.abs(dist(j.knee, j.ankle) - LS) < 1e-6, where + ' Bein');
        assert.ok(Math.abs(dist(j.hip, j.sh) - LB) < 1e-6, where + ' Rumpf');
        assert.ok(Math.abs(dist(j.sh, j.elbow) - LU) < 0.02 && Math.abs(dist(j.elbow, j.wrist) - LF) < 0.02, where + ' Arm: Hand liegt ausser Reichweite (' + dist(j.sh, j.wrist).toFixed(1) + ')');
        if (j.ankle2) assert.ok(Math.abs(dist(j.hip, j.knee2) - LT) < 1e-6 && Math.abs(dist(j.knee2, j.ankle2) - LS) < 1e-6, where + ' zweites Bein: Fuss ausser Reichweite (' + dist(j.hip, j.ankle2).toFixed(1) + ')');
        if (j.wrist2) assert.ok(Math.abs(dist(j.sh, j.elbow2) - LU) < 0.02 && Math.abs(dist(j.elbow2, j.wrist2) - LF) < 0.02, where + ' zweiter Arm');
      }
    }
  }
});

test('Alle Animationen: nichts liegt unter dem Boden, die Standfüsse bleiben stehen', () => {
  for (const id of NEW_IDS) {
    const A = FIG.ANIM[id];
    for (const f of allFrames(id)) {
      const j = f.j, where = id + ' Schritt ' + (f.step + 1);
      for (const k of Object.keys(j)) {
        if (!Array.isArray(j[k]) || j[k].length !== 2 || k === 'head') continue;
        assert.ok(j[k][1] <= G + (/^toe/.test(k) ? 3 : 1.01), where + ': ' + k + ' unter dem Boden (' + j[k][1].toFixed(1) + ')');
      }
      assert.ok(j.head[1] + HR <= 178 + 1.5, where + ': Kopf unter dem Boden');
      for (const p of A.props) if (HELD[p.t] && p.at && p.t !== 'pad') {
        const c = FIG.propPt(j, p);
        assert.ok(c[1] + heldR(p) <= 178 - 1 + 1e-6, where + ': ' + p.t + ' berührt den Boden');
      }
    }
  }
});

test('Alle Animationen: alles liegt im Bild (320 x 190) und ist zentriert', () => {
  for (const id of NEW_IDS) {
    const A = FIG.ANIM[id], z = A.zoom || 1;
    let lo = 1e9, hi = -1e9, top = 1e9;
    const take = (x, y, r) => { lo = Math.min(lo, A.ox + z * (x - r)); hi = Math.max(hi, A.ox + z * (x + r)); top = Math.min(top, 178 + z * (y - r - 178)); };
    for (const f of allFrames(id, 14)) {
      for (const k of Object.keys(f.j)) if (Array.isArray(f.j[k]) && f.j[k].length === 2 && k !== 'head') take(f.j[k][0], f.j[k][1], 3.5);
      take(f.j.head[0], f.j.head[1], HR + 1.75);
      for (const p of A.props) if (HELD[p.t] && p.at) { const c = FIG.propPt(f.j, p); take(c[0], c[1], heldR(p) + 1.5); if (p.t === 'bell') take(c[0], c[1] - 2 * heldR(p), 2); }
    }
    for (const p of A.props) {
      if (p.t === 'box') { take(p.x, p.y, 0); take(p.x + p.w, p.y + p.h, 0); }
      if (p.t === 'anchor') { take(p.x - 12, p.y, 3); take(p.x + 12, p.y, 3); }
      if (p.t === 'bar') { take(p.x, p.y, 3); take(p.x + p.w, p.y, 3); }
      if (p.t === 'rail') { take(p.x1, p.y1, 2); take(p.x2, p.y2, 2); }
      if (p.t === 'poly') p.pts.forEach((a) => take(a[0], a[1], 0));
      if (p.t === 'pulley') take(p.x, p.y, 6);
      if (p.t === 'arrow') { take(p.x1, p.y1, 3); take(p.x2, p.y2, 3); }
    }
    assert.ok(lo >= 3 && hi <= 317, id + ' horizontal im Bild: ' + lo.toFixed(1) + '..' + hi.toFixed(1));
    assert.ok(top >= 1.5, id + ' oben im Bild: ' + top.toFixed(1));
    assert.ok(Math.abs((lo + hi) / 2 - 160) <= 8, id + ' zentriert: ' + ((lo + hi) / 2).toFixed(1));
  }
});

test('Vorschaubilder: gültiges SVG mit Zahlen, für jede Übung', () => {
  for (const id of NEW_IDS) {
    const svg = FIG.thumb(id);
    assert.match(svg, /^<svg class="th" viewBox="[-\d. ]+"/, id);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/, id);
  }
  for (const g of ['beine', 'gesaess', 'arme', 'ruecken', 'bauch', 'brust', 'schultern', 'nacken', 'ganz']) {
    assert.doesNotMatch(FIG.icon(g), /NaN|undefined/, g);
  }
});


/* ---------- the three corrected animations ---------- */
const armLen = (j) => dist(j.sh, j.elbow) + dist(j.elbow, j.wrist);
const bend = (j) => armLen(j) - dist(j.sh, j.wrist);              // 0 = a straight arm

test('x-swing: die Arme sind in jedem einzelnen Bild gestreckt, auch zwischen den Posen', () => {
  const A = FIG.ANIM['x-swing'];
  let n = 0;
  for (const f of allFrames('x-swing', 12)) {
    if (f.bad) continue;
    assert.ok(bend(f.j) < 0.02, 'Arm gebeugt (' + bend(f.j).toFixed(3) + ') in Schritt ' + (f.step + 1));
    n++;
  }
  assert.ok(n > 800, 'viele geprüfte Bilder: ' + n);
  // der Ellbogen zeigt dabei in Armrichtung: Schulter, Ellbogen, Handgelenk liegen auf einer Linie
  for (const s of A.steps.filter((x) => !x.bad)) {
    const j = FIG.solve(s.pose);
    const cross = Math.abs((j.elbow[0] - j.sh[0]) * (j.wrist[1] - j.sh[1]) - (j.elbow[1] - j.sh[1]) * (j.wrist[0] - j.sh[0])) / dist(j.sh, j.wrist);
    assert.ok(cross < 0.01, 'Arm liegt auf einer Linie');
  }
});

test('x-swing: eine fliessende Bewegung (viele kurze Schritte ohne Abbremsen), die Kugel hängt an den Händen', () => {
  const A = FIG.ANIM['x-swing'];
  const good = A.steps.filter((s) => !s.bad), bad = A.steps.filter((s) => s.bad);
  assert.ok(good.length >= 48 && bad.length === 1, 'drei Schwünge am Stück und ein falscher');
  assert.ok(good.every((s) => s.flow === true && s.hold === 0 && s.ms <= 100), 'ohne Halten und ohne Abbremsen, jeder Schritt kurz');
  assert.equal(A.reps, 1);
  // die Hand beschreibt eine glatte Bahn: die Geschwindigkeit ändert sich von Schritt zu Schritt nie um mehr als 30 Prozent der Spitze
  const w = good.map((s) => FIG.solve(s.pose).wrist);
  const sp = w.map((p, i) => dist(p, w[(i + 1) % w.length]));
  const peak = Math.max(...sp);
  for (let i = 0; i < sp.length; i++) {
    const a = sp[i], b = sp[(i + 1) % sp.length];
    assert.ok(Math.abs(a - b) <= 0.3 * peak, 'Geschwindigkeitssprung bei Schritt ' + i + ': ' + a.toFixed(1) + ' -> ' + b.toFixed(1) + ' (Spitze ' + peak.toFixed(1) + ')');
  }
  assert.ok(Math.min(...sp) < 0.35 * peak, 'an den Umkehrpunkten wird die Kugel langsam, in der Mitte schnell');
  // Unten zwischen den Beinen, oben auf Brusthöhe waagerecht nach vorn
  const bottom = FIG.solve(good[0].pose), top = FIG.solve(good[12].pose);
  assert.ok(bottom.wrist[1] > bottom.hip[1] && bottom.wrist[0] < bottom.sh[0], 'unten hängen die Arme nach hinten unten zwischen die Beine');
  assert.ok(top.wrist[0] > top.sh[0] + 45 && Math.abs(top.wrist[1] - top.sh[1]) < 14, 'oben zeigen die Arme waagerecht nach vorn');
  assert.ok(top.hip[1] < bottom.hip[1] - 4 && Math.abs(top.th) < 5 && bottom.th > 55, 'die Hüfte streckt sich oben, der Oberkörper richtet sich auf');
  const bell = A.props.find((p) => p.t === 'bell');
  assert.ok(bell.at === 'wrist' && bell.along > 8, 'die Kugel hängt an den Händen');
  for (const s of A.steps) {
    const j = FIG.solve(s.pose), c = FIG.propPt(j, bell);
    assert.ok(Math.abs(dist(c, j.wrist) - bell.along) < 1e-9, 'Kugel liegt in Verlängerung des Arms');
  }
  // die Kugel liegt in Armrichtung hinter der Hand: Griff zur Hand hin
  assert.match(FIG.frame('x-swing', good[12].pose, false), /<path class="bh" d="M[-\d. ]+ C/);
});

test('x-dbpress: flach auf der Bank wie das Bankdrücken mit der Langhantel, keine Schrägbank, keine Kiste', () => {
  const D = FIG.ANIM['x-dbpress'], B = FIG.ANIM['x-bench'];
  assert.deepEqual(D.props.filter((p) => p.t !== 'plate'), B.props.filter((p) => p.t !== 'plate'), 'dieselbe Bank');
  assert.ok(D.props.every((p) => p.t === 'box' || p.t === 'plate'), 'nur Bank und Hanteln, kein schräges Polster');
  D.steps.forEach((s, i) => assert.deepEqual(s.pose, B.steps[i].pose, 'Schritt ' + (i + 1) + ' wie bei der Langhantel'));
  for (const s of D.steps) {
    const j = FIG.solve(s.pose);
    assert.ok(Math.abs(j.sh[1] + 3.5 - 144.5) < 1.2 || s.bad, 'die Schulter liegt auf der Bank');
    if (!s.bad) assert.ok(j.hip[1] < 146 && Math.abs(j.th + 90) < 0.5, 'der Körper liegt waagerecht');
  }
  const up = FIG.solve(D.steps[0].pose), dn = FIG.solve(D.steps[1].pose);
  assert.ok(up.wrist[1] < up.sh[1] - 40 && Math.abs(up.wrist[0] - up.sh[0]) < 12, 'oben stehen die Hanteln über der Schulter');
  assert.ok(dn.wrist[1] > up.wrist[1] + 25, 'unten sind sie an der Brust');
});

test('x-chestpress: man sitzt in der Maschine und drückt die Griffe waagerecht von der Brust weg (kein Stock, kein Seil)', () => {
  const A = FIG.ANIM['x-chestpress'];
  assert.ok(!A.props.some((p) => p.t === 'strap' || p.t === 'pulley'), 'kein Seilzug');
  // Rahmen um die Person: ein Pfosten hinten, ein Balken oben, ein Pfosten vorn
  const rails = A.props.filter((p) => p.t === 'rail');
  const vertical = rails.filter((p) => p.x1 === p.x2), top = rails.filter((p) => p.y1 === p.y2 && p.y1 < 80);
  assert.ok(vertical.length >= 2 && top.length >= 1, 'Rahmen');
  assert.ok(A.props.filter((p) => p.t === 'box').length >= 2, 'Sitz und Gewichtsblock');
  const grip = A.props.find((p) => p.t === 'pad' && p.at === 'wrist');
  assert.ok(grip && grip.ang === 90, 'senkrechter Griff an der Hand');
  const good = A.steps.filter((s) => !s.bad), js = good.map((s) => FIG.solve(s.pose));
  const rest = js.map((j) => j.wrist[1]);
  assert.ok(Math.max(...rest) - Math.min(...rest) < 0.01, 'die Griffe bleiben auf einer Höhe: sie bewegen sich waagerecht');
  const start = js[0], press = js[1];
  assert.ok(press.wrist[0] > start.wrist[0] + 25, 'die Griffe gehen weit nach vorn');
  assert.ok(dist(press.sh, press.wrist) > 45 && dist(press.sh, press.wrist) < 49.99, 'fast, aber nicht ganz gestreckt');
  assert.ok(start.elbow[0] < start.sh[0] + 1 && start.elbow[1] > start.sh[1] + 15, 'am Anfang liegen die Ellbogen hinter dem Körper unter der Schulter');
  // sitzen: Hüfte auf dem Sitz, Rücken am Polster, Füsse am Boden
  const seat = A.props.find((p) => p.t === 'box' && p.y > 140), back = rails.find((p) => p.x1 > 80 && p.x1 < 100 && p.y1 > 140);
  assert.ok(start.hip[0] > seat.x && start.hip[0] < seat.x + seat.w && Math.abs(start.hip[1] + 5 - seat.y) < 1.5, 'Hüfte sitzt auf dem Sitz');
  assert.ok(start.sh[0] > back.x2 && start.sh[0] - back.x2 < 12, 'Schulter liegt am Rückenpolster');
  assert.ok(Math.abs(start.ankle[1] - G) < 1e-9, 'Füsse am Boden');
  // falsch: der Rücken löst sich vom Polster
  const bad = FIG.solve(A.steps.find((s) => s.bad).pose);
  assert.ok(bad.sh[0] > start.sh[0] + 8, 'der Oberkörper kippt nach vorn');
  // der Rahmen ist breiter als die Bewegung: die Griffe stossen nirgends an
  assert.ok(Math.max(press.wrist[0], bad.wrist[0]) < Math.max(...vertical.map((p) => p.x1)) - 20);
});


/* ---------- the machines of fitness and rehab centres ---------- */
const MACHINE_IDS = ['x-adduct', 'x-abduct', 'x-pecdeck', 'x-revfly', 'x-latmach', 'x-extrot', 'x-shpress', 'x-curlmach', 'x-trimach', 'x-crunchmach', 'x-machinerow', 'x-assistpull',
  'x-facepull', 'x-straightarm', 'x-hyper', 'x-hack', 'x-smith', 'x-calfpress', 'x-calfmach', 'x-glutekick', 'x-lumbar', 'x-inclinedb', 'x-captain', 'x-woodchop',
  'x-legcurlseat', 'x-cablehip', 'x-tke', 'x-balance'];
const solveOf = (id, pose) => (FIG.ANIM[id].view === 'f' ? FIG.solveF(pose) : FIG.solve(pose));
const stepsOf = (id, bad) => FIG.ANIM[id].steps.filter((s) => !!s.bad === !!bad);
const keyJ = (id) => stepsOf(id, false).map((s) => solveOf(id, s.pose));
const badJ = (id) => solveOf(id, stepsOf(id, true)[0].pose);
const goodFrames = (id, n = 16) => allFrames(id, n).filter((f) => !f.bad).map((f) => f.j);
const sweepOf = (list, key) => Math.max(...list.flatMap((a) => list.map((b) => dist(a[key], b[key]))));
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

test('Maschinen: jede der 28 neuen Übungen bewegt sich sichtbar, hat einen Falsch-Schritt und eine Beschriftung für jede Phase', () => {
  assert.equal(new Set(MACHINE_IDS).size, MACHINE_IDS.length);
  for (const id of MACHINE_IDS) {
    const A = FIG.ANIM[id];
    assert.ok(A, id);
    assert.equal(A.steps.filter((s) => s.bad).length, 1, id + ': genau ein Falsch-Schritt');
    assert.ok(A.steps[A.steps.length - 1].bad, id + ': der Falsch-Schritt steht am Ende der Schleife');
    const good = goodFrames(id);
    const keys = A.view === 'f' ? ['wrL', 'wrR', 'knL', 'knR', 'anL', 'anR', 'elL', 'elR', 'C'] : ['wrist', 'ankle', 'ankle2', 'knee', 'sh', 'hip', 'elbow', 'toe'];
    const moved = Math.max(...keys.filter((k) => good[0][k]).map((k) => sweepOf(good, k)));
    assert.ok(moved >= 10, id + ' bewegt sich zu wenig: ' + moved.toFixed(1) + ' px');
    const labels = A.steps.map((s) => s.label);
    assert.ok(labels.every((l) => l.length >= 12 && l.length <= 90), id + ': Beschriftungen kurz genug fürs Handy');
  }
  const libIds = new Set(LIB.map((e) => e.id));
  for (const id of MACHINE_IDS) assert.ok(libIds.has(id), id + ' steht in der Bibliothek');
});

test('Maschinen: Beinanzieher und Beinspreizer von vorn: das Becken bleibt auf dem Sitz, die Füsse am Boden, nur die Knie öffnen und schliessen sich', () => {
  const kneeGap = (j) => Math.abs(j.knR[0] - j.knL[0]);
  for (const id of ['x-adduct', 'x-abduct']) {
    const fr = goodFrames(id);
    for (const j of fr) {
      assert.ok(near(j.P[1], 138, 1e-9) && near(j.P[0], 160, 1e-9), id + ': das Becken bleibt auf dem Sitz');
      assert.ok(near(j.anL[1], G, 1e-9) && near(j.anR[1], G, 1e-9), id + ': beide Füsse am Boden');
      assert.ok(near(j.anL[0], j.knL[0], 1e-9) && near(j.anR[0], j.knR[0], 1e-9), id + ': die Unterschenkel hängen senkrecht');
      assert.ok(near(j.knL[1], j.P[1], 1e-9), id + ': die Oberschenkel liegen waagrecht auf dem Sitz');
    }
    const gaps = fr.map(kneeGap);
    assert.ok(Math.max(...gaps) > 68 && Math.min(...gaps) < 30, id + ': Knieabstand von ' + Math.min(...gaps).toFixed(0) + ' bis ' + Math.max(...gaps).toFixed(0));
    const bad = badJ(id);
    assert.ok(bad.P[1] < 135, id + ': im Falsch-Schritt hebt das Becken ab');
  }
  const ad = FIG.ANIM['x-adduct'], ab = FIG.ANIM['x-abduct'];
  const gap = (id, i) => kneeGap(solveOf(id, FIG.ANIM[id].steps[i].pose));
  assert.ok(gap('x-adduct', 0) > gap('x-adduct', 1) + 40, 'Beinanzieher: es beginnt offen und endet zusammen');
  assert.ok(gap('x-abduct', 1) > gap('x-abduct', 0) + 40, 'Beinspreizer: es beginnt zusammen und endet offen');
  // die Polster liegen beim Anzieher innen an den Knien, beim Spreizer aussen
  const side = (A, name) => A.props.find((p) => p.t === 'pad' && p.at === name).dx;
  assert.ok(side(ad, 'knL') > 0 && side(ad, 'knR') < 0, 'Beinanzieher: Polster innen');
  assert.ok(side(ab, 'knL') < 0 && side(ab, 'knR') > 0, 'Beinspreizer: Polster aussen');
  for (const A of [ad, ab]) assert.ok(A.props.some((p) => p.t === 'box' && p.y > 140) && A.props.some((p) => p.t === 'box' && p.y < 100), 'Sitz und Rückenlehne');
});

test('Maschinen: Butterfly und Reverse Butterfly: die Arme schwingen zwischen weit offen und vor dem Körper', () => {
  const pec = keyJ('x-pecdeck'), elbowGap = (j) => Math.abs(j.elR[0] - j.elL[0]);
  assert.ok(elbowGap(pec[0]) > 80 && elbowGap(pec[2]) < 46, 'Butterfly: Ellbogen weit offen -> vor der Brust zusammen');
  for (const j of goodFrames('x-pecdeck')) {
    assert.ok(near(j.elL[1], j.shL[1], 1e-9) && near(j.elR[1], j.shR[1], 1e-9), 'Ellbogen auf Schulterhöhe');
    assert.ok(near(j.wrL[0], j.elL[0], 1e-9) && j.wrL[1] < j.elL[1] - 23, 'Unterarme senkrecht nach oben');
  }
  const rev = keyJ('x-revfly'), handGap = (j) => Math.abs(j.wrR[0] - j.wrL[0]);
  assert.ok(handGap(rev[0]) < 70 && handGap(rev[2]) > 120, 'Reverse Butterfly: Hände vorn nah beieinander -> seitlich weit offen');
  for (const j of goodFrames('x-revfly')) {
    assert.ok(near(j.wrL[1], j.shL[1], 1e-9) && near(j.wrR[1], j.shR[1], 1e-9), 'die Arme bleiben auf Schulterhöhe');
    assert.ok(j.P[1] === 138, 'sitzend');
  }
  assert.ok(badJ('x-pecdeck').shL[1] < pec[0].shL[1] - 8 && badJ('x-revfly').shL[1] < rev[0].shL[1] - 8, 'Falsch: die Schultern ziehen hoch');
});

test('Maschinen: Seitheben an der Maschine (von vorn) und Aussenrotation: die richtigen Gelenke bewegen sich', () => {
  const lat = keyJ('x-latmach'), low = lat[0], high = lat[2];
  const deg = (j, s, e) => Math.atan2(Math.abs(j[e][0] - j[s][0]), j[e][1] - j[s][1]) * 180 / Math.PI;
  assert.ok(deg(low, 'shL', 'elL') < 20 && deg(high, 'shL', 'elL') > 80 && deg(high, 'shL', 'elL') < 95, 'Oberarm: fast senkrecht -> waagrecht, nicht höher');
  assert.ok(deg(badJ('x-latmach'), 'shL', 'elL') > 105, 'Falsch: zu hoch');
  for (const j of goodFrames('x-latmach')) assert.ok(dist(j.elL, j.wrL) <= 0.16 * LF + 1e-9 + 24 * 0 || dist(j.elL, j.wrL) < 4, 'der Unterarm zeigt zum Betrachter (kurz)');
  // Aussenrotation: der Oberarm bleibt am Körper, der Unterarm zeigt erst quer über den Bauch, dann nach vorn, dann nach aussen
  const er = keyJ('x-extrot');
  for (const j of goodFrames('x-extrot')) {
    assert.ok(Math.abs(j.elR[0] - j.shR[0]) < 4 && j.elR[1] - j.shR[1] > 24, 'der Ellbogen bleibt unter der Schulter am Körper');
    assert.ok(Math.abs(j.wrR[1] - j.elR[1]) <= 3, 'der Unterarm bleibt waagrecht (beim Umschlagen für einen Augenblick höchstens 3 px)');
  }
  assert.ok(er[0].wrR[0] < er[0].elR[0] - 20, 'Start: der Unterarm zeigt nach innen, quer vor den Bauch');
  assert.ok(er[3].wrR[0] > er[3].elR[0] + 12, 'Ende: der Unterarm zeigt nach aussen');
  const lens = goodFrames('x-extrot', 24).map((j) => dist(j.elR, j.wrR));
  assert.ok(Math.min(...lens) < 4, 'beim Drehen zeigt der Unterarm kurz zum Betrachter');
  assert.ok(badJ('x-extrot').elR[0] - badJ('x-extrot').shR[0] > 15, 'Falsch: der Ellbogen löst sich vom Körper');
  // das Band läuft von links an die Hand
  const A = FIG.ANIM['x-extrot'];
  assert.ok(A.props.some((p) => p.t === 'strap' && p.band && p.at === 'wrR' && p.anchor[0] < 120), 'Band links');
});

test('Maschinen: Schulterpresse, Bizepscurl und Trizepsmaschine: Rumpf und Sitz bleiben, nur die Arme arbeiten', () => {
  // Schulterpresse
  const sp = goodFrames('x-shpress'), spKeys = keyJ('x-shpress');
  for (const j of sp) assert.ok(near(j.hip[0], 100) && near(j.hip[1], 145), 'Schulterpresse: sitzend, die Hüfte bleibt');
  assert.ok(spKeys[0].wrist[1] > spKeys[2].wrist[1] + 28, 'die Griffe steigen um mindestens 28 px');
  assert.ok(spKeys[0].elbow[1] > spKeys[0].wrist[1], 'unten: der Ellbogen unter der Hand');
  assert.ok(dist(spKeys[2].sh, spKeys[2].wrist) > 45 && dist(spKeys[2].sh, spKeys[2].wrist) < 49.99, 'oben: Arme fast gestreckt');
  assert.ok(Math.abs(spKeys[2].wrist[0] - spKeys[2].sh[0]) < 12, 'die Griffe gehen senkrecht über die Schulter');
  assert.ok(badJ('x-shpress').sh[0] > spKeys[0].sh[0] + 8, 'Falsch: der Rücken löst sich vom Polster');
  // Bizepscurl: der Ellbogen liegt fest auf dem Polster, die Hand dreht sich um ihn
  const cm = goodFrames('x-curlmach', 24);
  for (const j of cm) assert.ok(dist(j.elbow, cm[0].elbow) < 0.02, 'Curlmaschine: der Ellbogen bleibt fest auf dem Polster');
  const ang = (j) => { let a = Math.atan2(j.wrist[0] - j.elbow[0], j.wrist[1] - j.elbow[1]) * 180 / Math.PI; return a < -90 ? a + 360 : a; };
  assert.ok(Math.max(...cm.map((j) => dist(j.wrist, j.sh))) > 49.9, 'unten sind die Arme gestreckt');
  assert.ok(Math.max(...cm.map(ang)) - Math.min(...cm.map(ang)) > 150, 'der Unterarm dreht sich um mehr als 150 Grad um den Ellbogen');
  const keys = keyJ('x-curlmach');
  assert.ok(dist(keys[2].wrist, keys[2].sh) < 22, 'oben: die Hand ist nah an der Schulter');
  // Trizepsmaschine: Ellbogen am Körper, die Arme strecken sich nach unten
  const tm = goodFrames('x-trimach'), tk = keyJ('x-trimach');
  for (const j of tm) assert.ok(Math.abs(j.elbow[0] - j.sh[0]) < 15 && j.elbow[1] > j.sh[1] + 10, 'Trizepsmaschine: die Ellbogen bleiben am Körper');
  assert.ok(tk[2].wrist[1] > tk[0].wrist[1] + 18 && dist(tk[2].sh, tk[2].wrist) > 47, 'die Arme strecken sich nach unten');
});

test('Maschinen: Bauchmaschine, Rudern, Klimmzugmaschine: Hüfte, Griffe und Polster bleiben, wo die Maschine sie hält', () => {
  // Bauchmaschine: die Hüfte bleibt auf dem Sitz, der Oberkörper rollt nach vorn
  const cr = keyJ('x-crunchmach'), crf = goodFrames('x-crunchmach');
  for (const j of crf) assert.ok(near(j.hip[0], 100) && near(j.hip[1], 145), 'Bauchmaschine: die Hüfte bleibt');
  assert.ok(cr[0].th < 0 && cr[2].th > 28, 'Oberkörper von aufrecht nach vorn gerollt');
  assert.ok(FIG.ANIM['x-crunchmach'].steps[2].pose.round >= 5, 'der Rücken rundet sich');
  const bad = FIG.ANIM['x-crunchmach'].steps[5].pose;
  assert.ok(bad.ha - bad.th > 25, 'Falsch: der Kopf wird vorgezogen, nicht der Bauch benutzt');
  // Rudermaschine: der Oberkörper bleibt am Polster, die Hände gleiten waagrecht, die Ellbogen gehen hinter den Körper
  const rw = keyJ('x-machinerow'), rwf = goodFrames('x-machinerow');
  for (const j of rwf) { assert.ok(near(j.hip[0], 94) && near(j.sh[0], rwf[0].sh[0]), 'Rudermaschine: der Oberkörper bleibt am Polster'); assert.ok(near(j.wrist[1], rwf[0].wrist[1], 1e-6), 'die Hände gleiten waagrecht'); }
  assert.ok(rw[0].wrist[0] - rw[2].wrist[0] > 40, 'die Hände gehen mehr als 40 px zurück');
  assert.ok(rw[2].elbow[0] < rw[2].sh[0] - 3, 'am Ende liegen die Ellbogen hinter dem Körper');
  assert.ok(badJ('x-machinerow').sh[0] < rw[0].sh[0] - 10, 'Falsch: der Oberkörper schaukelt nach hinten');
  // Klimmzugmaschine: die Griffe stehen fest, der Körper steigt auf dem Polster, das Kinn kommt auf Griffhöhe
  const ap = goodFrames('x-assistpull'), apk = keyJ('x-assistpull');
  for (const j of ap) assert.ok(dist(j.wrist, ap[0].wrist) < 1e-9, 'Klimmzugmaschine: die Griffe bleiben stehen');
  assert.ok(apk[0].hip[1] - apk[2].hip[1] > 38, 'der Körper steigt um mehr als 38 px');
  assert.ok(Math.abs((apk[2].head[1] + HR) - apk[2].wrist[1]) < 8, 'oben: das Kinn ist auf Höhe der Griffe');
  assert.ok(near(apk[0].knee[0], apk[0].hip[0], 1e-9) && apk[0].knee[1] > apk[0].hip[1] + 30 && near(apk[0].ankle[1], apk[0].knee[1], 1e-9), 'kniend: Oberschenkel senkrecht, Schienbein waagrecht hinter dem Knie');
  const pad = FIG.ANIM['x-assistpull'].props.find((p) => p.t === 'pad' && p.at === 'knee');
  assert.ok(pad && FIG.ANIM['x-assistpull'].props.some((p) => p.t === 'strap' && p.at === 'knee'), 'Polster mit Säule am Knie, es steigt mit');
  const half = badJ('x-assistpull');
  assert.ok(half.hip[1] > apk[2].hip[1] + 10, 'Falsch: nur halb hochgezogen');
});

test('Maschinen: Face Pull und gestreckter Armzug am Kabel', () => {
  const fp = keyJ('x-facepull');
  assert.ok(dist(fp[0].sh, fp[0].wrist) > 45, 'Face Pull: Start mit fast gestreckten Armen');
  assert.ok(dist(fp[2].wrist, fp[2].head) < 22, 'Face Pull: am Ende sind die Hände neben dem Kopf');
  const P = FIG.ANIM['x-facepull'].props.find((p) => p.t === 'pulley');
  assert.ok(Math.abs(P.y - fp[0].head[1]) < 14, 'der Seilzug hängt auf Kopfhöhe');
  assert.ok(badJ('x-facepull').sh[0] < fp[0].sh[0] - 8, 'Falsch: der Oberkörper lehnt zurück');
  // gestreckter Armzug: in jedem Bild gestreckte Arme, von über der Schulter bis zu den Oberschenkeln
  for (const f of allFrames('x-straightarm', 12)) if (!f.bad) assert.ok(bend(f.j) < 0.02, 'gestreckter Armzug: der Arm bleibt gestreckt');
  const sa = keyJ('x-straightarm');
  assert.ok(sa[0].wrist[1] < sa[0].sh[1] - 25, 'oben: die Hände über der Schulter');
  assert.ok(sa[2].wrist[1] > sa[2].hip[1] - 8 && sa[2].wrist[1] < sa[2].hip[1] + 14, 'unten: die Hände am Oberschenkel');
  assert.ok(bend(badJ('x-straightarm')) > 5, 'Falsch: die Ellbogen beugen sich');
});

test('Maschinen: Rückenstrecker auf der 45°-Bank und an der Maschine', () => {
  const hy = keyJ('x-hyper'), hf = goodFrames('x-hyper');
  for (const j of hf) {
    assert.ok(dist(j.hip, hf[0].hip) < 1e-9 && dist(j.ankle, hf[0].ankle) < 1e-9, 'Bank: Hüfte und Fersen bleiben fest');
    assert.ok(Math.abs(dist(j.hip, j.ankle) - 71.985) < 0.01, 'die Beine sind gestreckt');
  }
  const top = hy[2], cross = ((top.sh[0] - top.hip[0]) * (top.ankle[1] - top.hip[1]) - (top.sh[1] - top.hip[1]) * (top.ankle[0] - top.hip[0])) / LB;
  assert.ok(Math.abs(cross) < 0.01, 'oben: Beine und Oberkörper bilden eine Linie');
  assert.ok(hy[0].sh[1] - hy[0].hip[1] > 40 && hy[0].sh[0] - hy[0].hip[0] < 12, 'unten: der Oberkörper hängt fast senkrecht nach unten');
  const over = badJ('x-hyper');
  assert.ok(over.sh[0] - over.hip[0] > 40 && over.sh[1] - over.hip[1] < 15, 'Falsch: überstreckt, der Oberkörper steht fast waagrecht (über der Linie)');
  assert.ok(FIG.ANIM['x-hyper'].steps[5].pose.round < 0, 'Falsch: Hohlkreuz');
  // Rückenmaschine: das Becken ist fixiert, der Oberkörper geht von vorgebeugt bis aufrecht
  const lu = keyJ('x-lumbar'), lf = goodFrames('x-lumbar');
  for (const j of lf) assert.ok(near(j.hip[0], 100) && near(j.hip[1], 145), 'Rückenmaschine: das Becken bleibt fixiert');
  assert.ok(lu[0].th > 25 && lu[2].th < -2 && lu[2].th > -8, 'von vorgebeugt bis aufrecht');
  assert.ok(badJ('x-lumbar').th < -20, 'Falsch: zu weit nach hinten');
});

test('Maschinen: Hackenschmidt und Multipresse: die Last bewegt sich auf der Schiene', () => {
  // Hackenschmidt: Hüfte auf einer Geraden mit 25 Grad Neigung, der Oberkörper bleibt flach am Polster (parallel zur Schiene)
  const hk = goodFrames('x-hack', 20), dir = [Math.sin(25 * D2R), Math.cos(25 * D2R)];
  const top = hk[0].hip;
  for (const j of hk) {
    const v = [j.hip[0] - top[0], j.hip[1] - top[1]], cross = v[0] * dir[1] - v[1] * dir[0];
    assert.ok(Math.abs(cross) < 1e-6, 'Hackenschmidt: die Hüfte gleitet auf der Schiene');
    assert.ok(near(j.th, -25, 1e-6) && dist(j.ankle, hk[0].ankle) < 1e-9, 'der Rücken liegt flach am Polster, die Füsse bleiben stehen');
  }
  const hkk = keyJ('x-hack'), bot = hkk[2], hip = bot.hip, kneeAng = (j) => Math.acos((LT * LT + LS * LS - dist(j.hip, j.ankle) ** 2) / (2 * LT * LS)) * 180 / Math.PI;
  assert.ok(kneeAng(bot) > 70 && kneeAng(bot) < 100 && (180 - kneeAng(hkk[0])) < 12 + 60 && kneeAng(hkk[0]) > 140, 'Knie: oben fast gestreckt, unten etwa im rechten Winkel');
  assert.ok(hip[1] - hkk[0].hip[1] > 18, 'die Hüfte sinkt');
  const hb = FIG.ANIM['x-hack'].steps[5].pose;
  assert.ok(hb.round > 5 && hb.th > -25, 'Falsch: das Becken rollt ein, der Rücken wird rund');
  // Multipresse: die Stange gleitet senkrecht, also bleibt die Schulter in jedem Bild auf derselben Senkrechten; die Füsse stehen vor der Stange
  const sm = allFrames('x-smith', 16);
  for (const f of sm) assert.ok(near(f.j.sh[0], sm[0].j.sh[0], 1e-6), 'Multipresse: die Schulter (die Stange) bleibt auf einer Senkrechten, auch im Falsch-Schritt');
  const smk = keyJ('x-smith');
  assert.ok(smk[0].ankle[0] > smk[0].sh[0] + 15, 'die Füsse stehen vor der Stange');
  assert.ok(smk[2].sh[1] - smk[0].sh[1] > 40, 'die Stange sinkt mindestens 40 px');
  assert.ok(near(smk[2].ankle[1], G, 1e-9) && kneeAng(smk[2]) < 110, 'unten tief gebeugt, die Füsse bleiben am Boden');
  assert.ok(badJ('x-smith').th > 45, 'Falsch: der Oberkörper klappt nach vorn');
  const rails = FIG.ANIM['x-smith'].props.filter((p) => p.t === 'rail' && p.x1 === p.x2);
  assert.equal(rails.length, 2, 'zwei senkrechte Führungsschienen');
});

test('Maschinen: Wadenheben an der Beinpresse und an der Maschine', () => {
  const cp = keyJ('x-calfpress');
  for (const f of goodFrames('x-calfpress')) assert.ok(dist(f.ankle, cp[0].ankle) < 1e-9 && dist(f.hip, cp[0].hip) < 1e-9, 'Beinpresse: Hüfte und Fussgelenk bleiben, nur der Fuss dreht sich');
  const fa = (s) => FIG.ANIM['x-calfpress'].steps[s].pose.fa;
  assert.ok(fa(1) - fa(0) >= 40, 'der Fuss dreht sich um mindestens 40 Grad auf die Zehen');
  assert.ok(dist(cp[0].toe, cp[1].toe) > 9, 'die Platte wandert mindestens 9 px');
  assert.ok(dist(cp[0].hip, cp[0].ankle) > 69 && dist(cp[0].hip, cp[0].ankle) < 71.5, 'die Beine bleiben fast gestreckt, aber nicht durchgedrückt');
  assert.ok(dist(badJ('x-calfpress').hip, badJ('x-calfpress').ankle) < 66, 'Falsch: die Knie beugen sich mit');
  const cm = keyJ('x-calfmach');
  assert.ok(cm[0].ankle[1] - cm[1].ankle[1] > 9, 'Wadenmaschine: die Fersen heben sich um mindestens 9 px');
  const A = FIG.ANIM['x-calfmach'];
  assert.ok(A.props.some((p) => p.t === 'pad' && p.at === 'sh') && A.props.some((p) => p.t === 'strap' && p.at === 'sh'), 'Polster auf den Schultern mit Hebel');
  assert.ok(near(cm[1].ankle[1] + 10, G, 1e-9) && cm[1].toe[1] > cm[1].ankle[1], 'oben auf den Zehenspitzen');
});

test('Maschinen: Gesäss-Rückstoss, Beinbeuger sitzend, Hüftabduktion am Kabel, Kniestrecken, Einbeinstand', () => {
  // Rückstoss: Standbein und Hüfte bleiben, das Arbeitsbein geht von unter der Hüfte nach hinten
  const gk = keyJ('x-glutekick'), gf = goodFrames('x-glutekick');
  for (const j of gf) assert.ok(dist(j.hip, gf[0].hip) < 1e-9 && dist(j.ankle, gf[0].ankle) < 1e-9, 'Rückstoss: Hüfte und Standbein bleiben');
  assert.ok(gk[0].ankle2[0] >= gk[0].hip[0] && gk[2].ankle2[0] < gk[2].hip[0] - 40, 'das Bein geht nach hinten');
  const gb = badJ('x-glutekick');
  assert.ok(gb.ankle2[1] < gk[2].ankle2[1] - 10 && FIG.ANIM['x-glutekick'].steps[5].pose.round < 0, 'Falsch: Hohlkreuz, Bein hochgeschleudert');
  assert.ok(FIG.ANIM['x-glutekick'].props.some((p) => p.t === 'pad' && p.at === 'ankle2'), 'Fussplatte am Arbeitsbein');
  // Beinbeuger sitzend: Hüfte fix, die Ferse geht von vorn nach hinten unter den Sitz
  const lc = keyJ('x-legcurlseat'), lf = goodFrames('x-legcurlseat');
  for (const j of lf) assert.ok(dist(j.hip, lf[0].hip) < 1e-9, 'Beinbeuger: die Hüfte bleibt fest');
  assert.ok(lc[0].ankle[0] > lc[0].hip[0] + 60 && lc[2].ankle[0] < lc[2].hip[0] + 20 && lc[2].ankle[1] > lc[2].hip[1] + 28, 'Ferse: nach vorn gestreckt -> unter den Sitz gezogen');
  assert.ok(FIG.ANIM['x-legcurlseat'].props.some((p) => p.t === 'pad' && p.at === 'knee'), 'Polster über den Oberschenkeln');
  // Hüftabduktion: das Standbein bleibt, das Arbeitsbein geht seitlich weg, Kabel am Knöchel von unten
  const ch = keyJ('x-cablehip'), cf = goodFrames('x-cablehip');
  for (const j of cf) assert.ok(near(j.anL[0], cf[0].anL[0], 1e-9) && near(j.anL[1], G, 1e-9), 'Hüftabduktion: das Standbein bleibt stehen');
  assert.ok(ch[1].anR[0] - ch[1].hipR[0] > ch[0].anR[0] - ch[0].hipR[0] + 25, 'das Arbeitsbein geht mindestens 25 px nach aussen');
  const cs = FIG.ANIM['x-cablehip'].props.find((p) => p.t === 'strap');
  assert.ok(cs.at === 'anR' && cs.anchor[1] > 150 && cs.anchor[0] < ch[0].anL[0], 'das Kabel kommt von unten und von der Seite des Standbeins');
  // Kniestrecken mit Band: das Fussgelenk bleibt, das Knie streckt sich gegen den Zug nach vorn
  const tk = keyJ('x-tke'), tf = goodFrames('x-tke');
  for (const j of tf) assert.ok(dist(j.ankle, tf[0].ankle) < 1e-9, 'Kniestrecken: der Fuss bleibt stehen');
  assert.ok(dist(tk[0].hip, tk[0].ankle) < 66 && dist(tk[1].hip, tk[1].ankle) > 71.4, 'das Knie geht von gebeugt bis fast gestreckt');
  const band = FIG.ANIM['x-tke'].props.find((p) => p.t === 'strap');
  assert.ok(band.band && band.at === 'knee' && band.anchor[0] > tk[0].knee[0] + 50 && Math.abs(band.anchor[1] - tk[0].knee[1]) < 12, 'das Band zieht von vorn auf Kniehöhe an die Kniekehle');
  // Einbeinstand: ein Bein steht fest, das andere Knie auf Hüfthöhe
  const bl = keyJ('x-balance');
  assert.ok(near(bl[0].ankle[1], G, 1e-9) && dist(bl[0].ankle, bl[1].ankle) < 1e-9, 'Einbeinstand: das Standbein bleibt');
  assert.ok(Math.abs(bl[1].knee2[1] - bl[1].hip[1]) < 3 && bl[1].knee2[0] > bl[1].hip[0] + 30, 'das andere Knie auf Hüfthöhe');
  assert.ok(FIG.ANIM['x-balance'].reps >= 2, 'ein Haltebild');
});

test('Maschinen: Schrägbankdrücken, Beinheben im Stütz, Holzhacker am Kabelzug', () => {
  // Schrägbank: 30 Grad Neigung, die Schulter bleibt auf der Lehne, die Hanteln gehen senkrecht hoch
  const ib = allFrames('x-inclinedb', 12), ik = keyJ('x-inclinedb');
  for (const f of ib) assert.ok(dist(f.j.sh, ib[0].j.sh) < 1e-9, 'Schrägbank: die Schulter bleibt auf der Lehne');
  for (const j of ik) assert.ok(near(Math.atan2(j.sh[0] - j.hip[0], -(j.sh[1] - j.hip[1])) * 180 / Math.PI, -60, 1e-6), 'die Rückenlehne steht auf 30 Grad (Oberkörper 60 Grad aus der Senkrechten)');
  assert.ok(ik[0].wrist[1] < ik[0].sh[1] - 40 && Math.abs(ik[0].wrist[0] - ik[0].sh[0]) < 14 && ik[1].wrist[1] > ik[0].wrist[1] + 30, 'Hanteln: oben über der Schulter, unten an der oberen Brust');
  assert.ok(badJ('x-inclinedb').hip[1] < ik[0].hip[1] - 8, 'Falsch: das Gesäss hebt ab');
  const bench = FIG.ANIM['x-inclinedb'].props.find((p) => p.t === 'poly');
  assert.ok(bench && bench.pts.length === 4 && FIG.ANIM['x-inclinedb'].props.some((p) => p.t === 'box'), 'Lehne und Sitz');
  // Beinheben im Stütz: Schulter und Hüfte hängen fest, die Beine gehen von hängend nach oben
  const cp = keyJ('x-captain'), cf = goodFrames('x-captain');
  for (const j of cf) assert.ok(dist(j.sh, cf[0].sh) < 1e-9 && dist(j.hip, cf[0].hip) < 1e-9, 'Captain\'s Chair: Schulter und Hüfte bleiben');
  assert.ok(near(cp[0].ankle[0], cp[0].hip[0], 1) && cp[0].ankle[1] > cp[0].hip[1] + 70, 'unten hängen die Beine gestreckt');
  assert.ok(cp[0].ankle[1] - cp[2].ankle[1] > 40, 'oben sind die Knie am Bauch');
  assert.ok(cp[0].elbow[1] > cp[0].sh[1] + 20 && Math.abs(cp[0].wrist[1] - cp[0].elbow[1]) < 3, 'die Unterarme liegen waagrecht auf den Auflagen');
  assert.ok(badJ('x-captain').hip[0] > cp[0].hip[0] + 4 && badJ('x-captain').th < -8, 'Falsch: der Körper schaukelt');
  // Holzhacker (von vorn): die Hände wandern von oben seitlich nach unten zur anderen Seite, der Rumpf neigt sich mit
  const wc = keyJ('x-woodchop'), wf = goodFrames('x-woodchop');
  for (const j of wf) assert.ok(Math.abs(dist(j.wrL, j.wrR) - dist(wc[0].wrL, wc[0].wrR)) < 3, 'beide Hände halten dasselbe Seil');
  assert.ok(wc[0].wrL[0] < wc[0].P[0] - 40 && wc[0].wrL[1] < wc[0].shL[1] - 25, 'oben: die Hände hoch auf der Kabelseite');
  assert.ok(wc[2].wrR[0] > wc[2].P[0] + 40 && wc[2].wrR[1] > wc[2].shR[1] + 25, 'unten: die Hände tief auf der anderen Seite');
  assert.ok(FIG.ANIM['x-woodchop'].steps[0].pose.lean < 0 && FIG.ANIM['x-woodchop'].steps[2].pose.lean > 0, 'der Rumpf neigt sich mit');
  const wb = FIG.ANIM['x-woodchop'].steps[5].pose;
  assert.ok(Math.abs(wb.lean) > 20, 'Falsch: der Oberkörper knickt seitlich ein');
});


/* ---------- smooth movement ---------- */
test('ease: nur in Ruhehaltungen wird abgebremst, durch Durchgangshaltungen läuft die Bewegung weiter', () => {
  for (const [a, b] of [[true, true], [true, false], [false, true], [false, false]]) {
    assert.ok(near(FIG.ease(0, a, b), 0, 1e-12) && near(FIG.ease(1, a, b), 1, 1e-12), 'Anfang und Ende');
    let last = 0;
    for (let i = 1; i <= 100; i++) { const v = FIG.ease(i / 100, a, b); assert.ok(v >= last - 1e-12, 'nie rückwärts'); last = v; }
  }
  const speed = (a, b, p) => (FIG.ease(p + 1e-6, a, b) - FIG.ease(p, a, b)) / 1e-6;
  assert.ok(speed(true, true, 0) < 1e-3 && speed(true, true, 1 - 1e-6) < 1e-3, 'Ruhe -> Ruhe: langsam an beiden Enden');
  assert.ok(speed(true, false, 0) < 1e-3 && speed(true, false, 1 - 1e-6) > 1, 'Ruhe -> Durchgang: hinten schnell');
  assert.ok(speed(false, true, 0) > 1 && speed(false, true, 1 - 1e-6) < 1e-3, 'Durchgang -> Ruhe: vorn schnell');
  assert.ok(near(speed(false, false, 0.5), 1, 1e-6), 'Durchgang -> Durchgang: gleichmässig');
});

test('Jede Bewegung läuft rund: wo eine Durchgangshaltung (hold 0) zwischen zwei Moves liegt, steht die Figur dort nie still', () => {
  let n = 0;
  for (const id of Object.keys(FIG.ANIM)) {
    const A = FIG.ANIM[id], st = A.steps;
    st.forEach((s, i) => {
      if (s.hold !== 0 || s.flow) return;
      n++;
      const from = st[(i + st.length - 1) % st.length], to = st[(i + 1) % st.length];
      const inSp = (FIG.ease(1, from.hold > 0, false) - FIG.ease(1 - 1e-4, from.hold > 0, false)) / 1e-4;
      const outSp = (FIG.ease(1e-4, false, to.hold > 0) - FIG.ease(0, false, to.hold > 0)) / 1e-4;
      assert.ok(inSp > 0.5 && outSp > 0.5, id + ' Schritt ' + (i + 1) + ' bremst in der Mitte ab');
    });
  }
  assert.ok(n > 30, 'viele Durchgangshaltungen geprüft: ' + n);
});

test('x-trxcurl: die Hände bleiben am Gurt, der Körper zieht sich zum Befestigungspunkt hoch', () => {
  const A = FIG.ANIM['x-trxcurl'], fr = goodFrames('x-trxcurl', 24), keys = keyJ('x-trxcurl');
  for (const j of fr) assert.ok(dist(j.wrist, fr[0].wrist) < 1e-9, 'die Hände bewegen sich nicht, das Gurtband bleibt gespannt');
  for (const j of fr) {
    assert.ok(Math.abs(dist(j.hip, j.ankle) - 72) < 1e-6, 'Beine gestreckt');
    const cross = Math.abs((j.hip[0] - j.ankle[0]) * (j.sh[1] - j.ankle[1]) - (j.hip[1] - j.ankle[1]) * (j.sh[0] - j.ankle[0])) / dist(j.sh, j.ankle);
    assert.ok(cross < 0.01, 'Körper eine gerade Linie');
    assert.ok(dist(j.ankle, fr[0].ankle) < 1e-9, 'die Füsse bleiben stehen');
  }
  const out = keys[0], curl = keys[1], an = A.props.find((p) => p.t === 'anchor');
  assert.ok(dist(out.sh, out.wrist) > 49.5, 'Start: Arme gestreckt, der Körper lehnt zurück');
  assert.ok(out.sh[0] < out.ankle[0] - 40, 'zurückgelehnt, weg vom Befestigungspunkt');
  assert.ok(curl.sh[0] > out.sh[0] + 15, 'der Körper kommt zum Befestigungspunkt hin');
  assert.ok(dist(curl.sh, curl.wrist) < 30 && dist(curl.head, curl.wrist) < 28, 'oben: Ellbogen gebeugt, die Hände bei der Stirn');
  assert.ok(curl.elbow[1] <= Math.min(curl.sh[1], curl.wrist[1]) + 2, 'die Ellbogen bleiben hoch');
  assert.ok(an.x > out.wrist[0] + 40 && an.y < out.wrist[1], 'der Befestigungspunkt liegt vorn oben');
  const bad = badJ('x-trxcurl');
  const off = (j) => ((j.hip[0] - j.ankle[0]) * (j.sh[1] - j.ankle[1]) - (j.hip[1] - j.ankle[1]) * (j.sh[0] - j.ankle[0])) / dist(j.sh, j.ankle);
  assert.ok(Math.abs(off(bad)) > 7 && bad.hip[0] > curl.hip[0] + 7, 'Falsch: die Hüfte weicht sichtbar von der Linie ab (nach vorn unten)');
});
