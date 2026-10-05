/* FIG: side-view stick figure with two-bone IK limbs, plus one pose sequence per exercise. */
var FIG = (function () {
  var G = 174;                                   // ankle height when the foot is flat on the floor
  var LB = 46, LT = 36, LS = 36, LU = 26, LF = 24, HR = 9, NECK = 4, FOOT = 14;
  var D2R = Math.PI / 180;
  var W = 320, H = 190, FLOOR = 178;

  function ik(p0, p1, l1, l2, s) {
    var dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.5) { dx = 0; dy = 0.5; d = 0.5; }
    if (d >= l1 + l2 - 0.01) { var f = l1 / (l1 + l2); return [p0[0] + dx * f, p0[1] + dy * f]; }
    var a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    var h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    var ux = dx / d, uy = dy / d;
    return [p0[0] + ux * a - s * uy * h, p0[1] + uy * a + s * ux * h];
  }

  /* pose spec -> normalised pose: hip, th (torso angle from vertical, + = leaning forward), ankle, fa (foot angle, + = toes down),
     wr (wrist relative to shoulder), wrist (absolute) or wt (wrist relative to the hip, in the torso's frame: [along the torso towards
     the knees, out of the front], for a bar resting on the hips), ankle2/fa2 (second leg), ha (head angle), round (spine bulge), es (elbow side).
     Two more ways to describe the body make a move follow its true circle instead of the straight line between two keyframes,
     so segment lengths and a straight body stay intact while it moves:
       { ankle, lean, torso }  legs straight from the ankle at angle lean (from vertical), torso at angle torso (default: same, a straight body)
       { sh, th }              shoulder pinned (on a bench), torso angle th, the hip follows */
  function rigApply(q) {
    var r = q.rig, sh, hip, t;
    if (r.k === 'ank') {
      t = r.a * D2R;
      hip = [q.ankle[0] + (LT + LS) * Math.sin(t), q.ankle[1] - (LT + LS) * Math.cos(t)];
      t = r.t * D2R;
      sh = [hip[0] + LB * Math.sin(t), hip[1] - LB * Math.cos(t)];
    } else {
      sh = r.sh; t = r.th * D2R;
      hip = [sh[0] - LB * Math.sin(t), sh[1] + LB * Math.cos(t)];
    }
    q.hip = hip;
    q.th = Math.atan2(sh[0] - hip[0], -(sh[1] - hip[1])) / D2R;
  }
  function norm(p) {
    var q = {};
    if (p.lean != null) { q.ankle = p.ankle.slice(); q.rig = { k: 'ank', a: p.lean, t: p.torso != null ? p.torso : p.lean }; rigApply(q); }
    else if (p.sh && p.th != null && !p.hip) { q.ankle = p.ankle.slice(); q.rig = { k: 'sh', th: p.th, sh: p.sh.slice() }; rigApply(q); }
    else {
      q.hip = p.hip.slice();
      if (p.sh) q.th = Math.atan2(p.sh[0] - p.hip[0], -(p.sh[1] - p.hip[1])) / D2R; else q.th = p.th;
    }
    q.ankle = p.ankle.slice(); q.fa = p.fa || 0;
    if (p.wt) q.wt = p.wt.slice(); else if (p.wr) q.wr = p.wr.slice(); else q.wrist = p.wrist.slice();
    if (p.ankle2) { q.ankle2 = p.ankle2.slice(); q.fa2 = p.fa2 || 0; }
    q.ha = p.ha != null ? p.ha : (Math.abs(q.th) < 45 ? q.th * 0.5 : q.th - (q.th > 0 ? 10 : -10));
    q.round = p.round || 0;
    q.es = p.es == null ? 1 : p.es;
    return q;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpP(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function mix(a, b, t) {
    var q = { hip: lerpP(a.hip, b.hip, t), th: lerp(a.th, b.th, t), ankle: lerpP(a.ankle, b.ankle, t), fa: lerp(a.fa, b.fa, t),
      ha: lerp(a.ha, b.ha, t), round: lerp(a.round, b.round, t), es: b.es };
    if (a.wt) q.wt = lerpP(a.wt, b.wt, t); else if (a.wr) q.wr = lerpP(a.wr, b.wr, t); else q.wrist = lerpP(a.wrist, b.wrist, t);
    if (a.ankle2) { q.ankle2 = lerpP(a.ankle2, b.ankle2, t); q.fa2 = lerp(a.fa2, b.fa2, t); }
    if (a.rig && b.rig && a.rig.k === b.rig.k) {
      q.rig = a.rig.k === 'ank' ? { k: 'ank', a: lerp(a.rig.a, b.rig.a, t), t: lerp(a.rig.t, b.rig.t, t) }
        : { k: 'sh', th: lerp(a.rig.th, b.rig.th, t), sh: lerpP(a.rig.sh, b.rig.sh, t) };
      rigApply(q);
    }
    return q;
  }

  function solve(q) {
    var r = q.th * D2R, hip = q.hip;
    var sh = [hip[0] + LB * Math.sin(r), hip[1] - LB * Math.cos(r)];
    var wrist = q.wt ? [hip[0] - Math.sin(r) * q.wt[0] + Math.cos(r) * q.wt[1], hip[1] + Math.cos(r) * q.wt[0] + Math.sin(r) * q.wt[1]]
      : (q.wr ? [sh[0] + q.wr[0], sh[1] + q.wr[1]] : q.wrist);
    var hr = q.ha * D2R, hd = NECK + HR;
    var fr = q.fa * D2R;
    var j = { hip: hip, sh: sh, th: q.th, round: q.round, ankle: q.ankle, wrist: wrist,
      head: [sh[0] + hd * Math.sin(hr), sh[1] - hd * Math.cos(hr)] };
    j.knee = ik(hip, q.ankle, LT, LS, -1);
    j.toe = [q.ankle[0] + FOOT * Math.cos(fr), q.ankle[1] + FOOT * Math.sin(fr)];
    j.elbow = ik(sh, wrist, LU, LF, q.es);
    if (q.ankle2) {
      var f2 = q.fa2 * D2R;
      j.ankle2 = q.ankle2;
      j.knee2 = ik(hip, q.ankle2, LT, LS, -1);
      j.toe2 = [q.ankle2[0] + FOOT * Math.cos(f2), q.ankle2[1] + FOOT * Math.sin(f2)];
    }
    return j;
  }

  /* ---------- drawing ---------- */
  function n1(v) { return Math.round(v * 10) / 10; }
  function ln(a, b, cls) {
    return '<line class="' + cls + '" x1="' + n1(a[0]) + '" y1="' + n1(a[1]) + '" x2="' + n1(b[0]) + '" y2="' + n1(b[1]) + '"/>';
  }
  function propPt(j, p) { var b = j[p.at]; return [b[0] + (p.dx || 0), b[1] + (p.dy || 0)]; }
  function propSVG(p, j) {
    var c;
    if (p.t === 'box') return '<rect class="pp" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" rx="3"/>';
    if (p.t === 'anchor') return '<line class="an" x1="' + (p.x - 12) + '" y1="' + p.y + '" x2="' + (p.x + 12) + '" y2="' + p.y + '"/>';
    if (p.t === 'strap') {
      c = propPt(j, p);
      return ln(p.anchor, c, 'st' + (p.band ? ' bd' : '')) + '<circle class="pp pl" cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="4"/>';
    }
    if (p.t === 'plate') {
      c = propPt(j, p);
      return '<circle class="pp pl" cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="' + p.r + '"/><circle class="pd" cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="2.4"/>';
    }
    return '';
  }
  function layerOf(p) { return p.t === 'plate' ? 'front' : 'back'; }

  function drawJoints(j, o) {
    var hl = o.hl || [], bad = !!o.bad, props = o.props || [], s = '', i;
    function c(name) { return 'sg' + (bad ? ' bad' : (hl.indexOf(name) >= 0 ? ' hl' : '')); }
    for (i = 0; i < props.length; i++) if (layerOf(props[i]) === 'back') s += propSVG(props[i], j);
    if (j.ankle2) s += ln(j.hip, j.knee2, 'sg far') + ln(j.knee2, j.ankle2, 'sg far') + ln(j.ankle2, j.toe2, 'sg far');
    s += ln(j.hip, j.knee, c('thigh')) + ln(j.knee, j.ankle, c('shin')) + ln(j.ankle, j.toe, 'sg' + (bad ? ' bad' : ''));
    if (j.round) {
      var t = j.th * D2R, mx = (j.hip[0] + j.sh[0]) / 2, my = (j.hip[1] + j.sh[1]) / 2;
      var cx = mx - Math.cos(t) * 2 * j.round, cy = my - Math.sin(t) * 2 * j.round;
      s += '<path class="' + c('torso') + '" fill="none" d="M' + n1(j.hip[0]) + ' ' + n1(j.hip[1]) + ' Q' + n1(cx) + ' ' + n1(cy) + ' ' + n1(j.sh[0]) + ' ' + n1(j.sh[1]) + '"/>';
    } else {
      s += ln(j.hip, j.sh, c('torso'));
    }
    s += ln(j.sh, j.elbow, c('upper')) + ln(j.elbow, j.wrist, c('fore'));
    for (i = 0; i < props.length; i++) if (layerOf(props[i]) === 'front') s += propSVG(props[i], j);
    s += '<circle class="hd' + (bad ? ' bad' : '') + '" cx="' + n1(j.head[0]) + '" cy="' + n1(j.head[1]) + '" r="' + HR + '"/>';
    return s;
  }

  /* ---------- authoring helpers ---------- */
  function lineHip(sh, ank) {
    var dx = ank[0] - sh[0], dy = ank[1] - sh[1], k = LB / Math.sqrt(dx * dx + dy * dy);
    return [sh[0] + dx * k, sh[1] + dy * k];
  }
  function tiltHip(sh, ank, delta) {
    var phi = Math.atan2(ank[1] - sh[1], -(ank[0] - sh[0])) + delta * D2R;
    return [sh[0] - LB * Math.cos(phi), sh[1] + LB * Math.sin(phi)];
  }
  function leanOf(sh, ank) { return Math.atan2(sh[0] - ank[0], -(sh[1] - ank[1])) / D2R; }   // lean angle of a straight body (shoulder exactly 118 from the ankle)
  function bendBody(ank, sh, side) {           // legs straight, hip off the ankle-shoulder line (side +1 = below / in front); lengths stay exact
    var h = ik(ank, sh, LT + LS, LB, side);
    return { lean: Math.atan2(h[0] - ank[0], -(h[1] - ank[1])) / D2R, torso: Math.atan2(sh[0] - h[0], -(sh[1] - h[1])) / D2R };
  }
  function floorBody(ankle, shY) { return [ankle[0] + Math.sqrt(118 * 118 - (ankle[1] - shY) * (ankle[1] - shY)), shY]; }
  function body(shoulder, ankle, o) {            // straight body line from ankle to shoulder (hands/forearms pinned)
    o = o || {};
    var p = { sh: shoulder, hip: o.delta ? tiltHip(shoulder, ankle, o.delta) : lineHip(shoulder, ankle), ankle: ankle, fa: o.fa || 0 };
    if (o.wrist) p.wrist = o.wrist;
    if (o.wr) p.wr = o.wr;
    if (o.ha != null) p.ha = o.ha;
    if (o.es != null) p.es = o.es;
    return p;
  }

  var ANIM = {};

  /* Box-Kniebeugen */
  (function () {
    var A = [150, G];
    var top = norm({ hip: [150, G - 70], th: 4, ankle: A, wr: [-8, 0], es: -1 });
    var bot = norm({ hip: [117, G - 38], th: 38, ankle: A, wr: [-8, 0], es: -1 });
    ANIM['a-box'] = { reps: 3, hl: ['thigh'],
      props: [{ t: 'box', x: 90, y: 143, w: 42, h: 35 }, { t: 'plate', at: 'wrist', dx: -1, dy: 4, r: 8 }],
      steps: [
        { pose: top, ms: 1200, hold: 600, label: 'Kräftig aufstehen, Hüfte und Knie strecken' },
        { pose: bot, ms: 1800, hold: 700, label: 'Hüfte nach hinten, kontrolliert auf die Box setzen' }
      ] };
  })();

  /* Liegestütze */
  (function () {
    var hand = [190, G - 2], A = [190 - Math.sqrt(118 * 118 - 40 * 40), G - 12];
    var shUp = [190, 122], shDn = floorBody(A, 150);
    var up = norm({ ankle: A, lean: leanOf(shUp, A), fa: 70, wrist: hand });     // same poses as before, but the body pivots about the feet,
    var dn = norm({ ankle: A, lean: leanOf(shDn, A), fa: 70, wrist: hand });     // so it stays one straight line on the way down and up
    var sag = norm(body(shUp, A, { fa: 70, wrist: hand, delta: 20 }));
    ANIM['a-push'] = { reps: 2, hl: ['torso', 'upper', 'fore'], props: [],
      steps: [
        { pose: up, ms: 900, hold: 500, label: 'Kräftig hochdrücken, Körper bleibt eine Linie' },
        { pose: dn, ms: 1500, hold: 400, label: 'Brust Richtung Boden, Ellbogen schräg nach hinten' },
        { pose: up, ms: 900, hold: 300, label: 'Kräftig hochdrücken, Körper bleibt eine Linie' },
        { pose: sag, ms: 800, hold: 1100, bad: true, label: 'Falsch: Becken hängt durch (Hohlkreuz)' }
      ] };
  })();

  /* TRX-Trizepsstrecken: the body pivots about the feet, the hands stay where the straps hold them.
     Start: straight arms in front of the head. Down: only the elbows bend, the head sinks between the hands. Then press back up. */
  (function () {
    var A = [100, G], AN = [120, 12], a0 = 44, a1 = 62;
    var S0 = [A[0] + 118 * Math.sin(a0 * D2R), A[1] - 118 * Math.cos(a0 * D2R)];
    var W = [S0[0] + 50 * Math.cos(-5 * D2R), S0[1] - 50 * Math.sin(-5 * D2R)];
    var up = norm({ ankle: A, lean: a0, wrist: W, ha: 18 });
    var dn = norm({ ankle: A, lean: a1, wrist: W, ha: 18 });
    var d = [4, 7], b = bendBody(A, [S0[0] + d[0], S0[1] + d[1]], 1);      // hips drop, shoulders and hands go a little with them
    var sag = norm({ ankle: A, lean: b.lean, torso: b.torso, wrist: [W[0] + d[0], W[1] + d[1]], ha: 18 });
    ANIM['a-tri'] = { reps: 2, hl: ['upper'], sweep: true,
      props: [{ t: 'anchor', x: AN[0], y: AN[1] - 3 }, { t: 'strap', anchor: AN, at: 'wrist' }],
      steps: [
        { pose: up, ms: 1000, hold: 500, label: 'Kräftig hochdrücken, bis die Arme gestreckt sind' },
        { pose: dn, ms: 1700, hold: 400, label: 'Nur die Ellbogen beugen, der Kopf sinkt zwischen die Hände' },
        { pose: up, ms: 1000, hold: 300, label: 'Kräftig hochdrücken, bis die Arme gestreckt sind' },
        { pose: sag, ms: 800, hold: 1100, bad: true, label: 'Falsch: Hüfte hängt durch' }
      ] };
  })();

  /* Hip Thrust: upper back on the bench (shoulder stays put), the hips go up and down, the feet stay put, the bar rests on the hips.
     The figure is flat and low, so it is drawn larger (zoom). */
  (function () {
    var S = [105, 138], A = [187, G], WT = [3.74, 5];   // bar just above the hip crease, arms straight
    var top = norm({ sh: S, th: -90, ankle: A, wt: WT, ha: -62, es: -1 });
    var bot = norm({ sh: S, th: -55, ankle: A, wt: WT, ha: -62, es: -1 });
    var bad = norm({ sh: S, th: -102, ankle: A, wt: WT, ha: -62, round: -7, es: -1 });
    ANIM['a-hip'] = { reps: 2, hl: ['thigh'], sweep: true, zoom: 1.5,
      props: [{ t: 'box', x: 78, y: 141, w: 36, h: 7 }, { t: 'box', x: 91, y: 148, w: 10, h: 29 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 11 }],
      steps: [
        { pose: top, ms: 1200, hold: 900, label: 'Hüfte hochdrücken, oben das Gesäß fest anspannen' },
        { pose: bot, ms: 1800, hold: 500, label: 'Kontrolliert ablassen, die Hüfte bleibt knapp über dem Boden' },
        { pose: top, ms: 1200, hold: 300, label: 'Hüfte hochdrücken, oben das Gesäß fest anspannen' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, Hüfte zu hoch, Rippen offen' }
      ] };
  })();

  /* Plank */
  (function () {
    var wrist = [200, G], sh = [176, 148], A = [sh[0] - Math.sqrt(118 * 118 - 14 * 14), G - 12];
    var good = norm(body(sh, A, { fa: 70, wrist: wrist }));
    var sag = norm(body(sh, A, { fa: 70, wrist: wrist, delta: 17 }));
    var pike = norm(body(sh, A, { fa: 70, wrist: wrist, delta: -17 }));
    ANIM['a-plank'] = { reps: 2, hl: ['torso'], props: [],
      steps: [
        { pose: good, ms: 800, hold: 1800, label: 'Richtig: gerade Linie von Kopf bis Ferse' },
        { pose: sag, ms: 800, hold: 1200, bad: true, label: 'Falsch: Becken hängt durch' },
        { pose: pike, ms: 800, hold: 1200, bad: true, label: 'Falsch: Po zu hoch' }
      ] };
  })();

  /* Rumänisches Kreuzheben */
  (function () {
    var A = [150, G];
    var top = norm({ hip: [149, G - 70], th: 2, ankle: A, wr: [10, 47] });
    var bot = norm({ hip: [116, G - 61], th: 65, ankle: A, wr: [-6, 49] });
    var bad = norm({ hip: [116, G - 61], th: 65, ankle: A, wr: [14, 47], round: 15, ha: 92 });
    ANIM['b-rdl'] = { reps: 2, hl: ['thigh'],
      props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 11 }],
      steps: [
        { pose: top, ms: 1300, hold: 500, label: 'Hüfte nach vorn schieben, Po anspannen, aufrichten' },
        { pose: bot, ms: 1700, hold: 600, label: 'Hüfte nach hinten schieben, Rücken gerade, Stange am Bein' },
        { pose: top, ms: 1300, hold: 300, label: 'Hüfte nach vorn schieben, Po anspannen, aufrichten' },
        { pose: bad, ms: 1200, hold: 1200, bad: true, label: 'Falsch: runder Rücken, Stange zu weit weg' }
      ] };
  })();

  /* TRX-Rudern */
  (function () {
    var A = [200, G], AN = [262, 22];
    function lean(a) { return [A[0] - 118 * Math.sin(a * D2R), A[1] - 118 * Math.cos(a * D2R)]; }
    var shS = lean(36), shE = lean(14);
    var start = norm({ ankle: A, lean: -36, wrist: [shS[0] + 45, shS[1] - 19], ha: -6 });   // same poses as before, body pivots about the feet
    var end = norm({ ankle: A, lean: -14, wrist: [shE[0] + 11, shE[1] + 10], ha: -4 });
    ANIM['b-row'] = { reps: 3, hl: ['torso', 'upper'],
      props: [{ t: 'anchor', x: AN[0], y: AN[1] - 3 }, { t: 'strap', anchor: AN, at: 'wrist' }],
      steps: [
        { pose: start, ms: 1500, hold: 500, label: 'Langsam ablassen, Arme strecken, Körper bleibt gerade' },
        { pose: end, ms: 1200, hold: 600, label: 'Brust zu den Händen ziehen, Schulterblätter zusammen' }
      ] };
  })();

  /* TRX-Ausfallschritte rückwärts */
  (function () {
    var top = norm({ hip: [150, G - 71], th: 3, ankle: [150, G], ankle2: [146, G], wrist: [182, 79] });
    var bot = norm({ hip: [122, G - 38], th: 8, ankle: [152, G], ankle2: [80, 164], fa2: 65, wrist: [170, 67] });
    ANIM['b-lunge'] = { reps: 3, hl: ['thigh'],
      props: [{ t: 'anchor', x: 250, y: 9 }, { t: 'strap', anchor: [250, 12], at: 'wrist' }],
      steps: [
        { pose: top, ms: 1100, hold: 500, label: 'Mit der vorderen Ferse hochdrücken, Füße zusammen' },
        { pose: bot, ms: 1500, hold: 600, label: 'Großer Schritt nach hinten, Knie sinkt Richtung Boden' }
      ] };
  })();

  /* Bizeps-Curls */
  (function () {
    var A = [150, G];
    var dn = norm({ hip: [150, G - 71], th: 3, ankle: A, wr: [10, 47] });
    var upP = norm({ hip: [150, G - 71], th: 3, ankle: A, wr: [14, 5] });
    var cheat = norm({ hip: [153, G - 71], th: -16, ankle: A, wr: [24, -4], ha: -4 });
    ANIM['b-curl'] = { reps: 3, hl: ['upper'],
      props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 }],
      steps: [
        { pose: dn, ms: 1700, hold: 400, label: 'Langsam ablassen, Arme fast ganz strecken' },
        { pose: upP, ms: 1100, hold: 500, label: 'Hantel hochrollen, Ellbogen bleiben am Körper' },
        { pose: dn, ms: 1700, hold: 300, label: 'Langsam ablassen, Arme fast ganz strecken' },
        { pose: cheat, ms: 700, hold: 1200, bad: true, label: 'Falsch: Schwung aus dem Rücken, Oberkörper lehnt zurück' }
      ] };
  })();

  /* TRX-Crunches */
  (function () {
    var wrist = [198, G - 2], sh = [198, 122];
    var A0 = [sh[0] - Math.sqrt(118 * 118 - 20 * 20), 142];
    var start = norm({ sh: sh, hip: lineHip(sh, A0), ankle: A0, fa: 78, wrist: wrist });
    var hipT = [sh[0] - 46 * Math.cos(25 * D2R), sh[1] - 46 * Math.sin(25 * D2R)];
    var tuck = norm({ sh: sh, hip: hipT, ankle: [132, 138], fa: 62, wrist: wrist });
    ANIM['b-crunch'] = { reps: 3, hl: ['torso', 'thigh'],
      props: [{ t: 'anchor', x: 100, y: 12 }, { t: 'strap', anchor: [100, 15], at: 'ankle', dx: 0, dy: 0 }],
      steps: [
        { pose: start, ms: 1500, hold: 500, label: 'Langsam zurück, Körper bleibt in der Linie' },
        { pose: tuck, ms: 1200, hold: 600, label: 'Knie zur Brust ziehen, Rücken rund machen' }
      ] };
  })();

  /* ---------- bounds (to centre each exercise) ---------- */
  function ox(id) {
    var A = ANIM[id], lo = 1e9, hi = -1e9;
    function take(x) { if (x < lo) lo = x; if (x > hi) hi = x; }
    function pose(q) {
      var j = solve(q), k;
      for (k in j) if (j[k] && j[k].length === 2) take(j[k][0]);
      take(j.head[0] - 9); take(j.head[0] + 9);
      if (A.sweep) A.props.forEach(function (p) { if (p.t === 'plate') { var c = propPt(j, p); take(c[0] - p.r); take(c[0] + p.r); } });
    }
    A.steps.forEach(function (s) { pose(s.pose); });
    if (A.sweep) {                       // moves along arcs: the in-between frames count for the bounds too
      A.steps.forEach(function (s, i) {
        var from = A.steps[(i + A.steps.length - 1) % A.steps.length].pose;
        for (var u = 1; u < 10; u++) pose(mix(from, s.pose, u / 10));
      });
    }
    A.props.forEach(function (p) {
      if (p.t === 'box') { take(p.x); take(p.x + p.w); }
      if (p.t === 'anchor') { take(p.x - 12); take(p.x + 12); }
    });
    var z = A.zoom || 1;
    return z === 1 ? Math.round((W - (lo + hi)) / 2) : Math.round(W / 2 - z * (lo + hi) / 2);
  }
  Object.keys(ANIM).forEach(function (id) { ANIM[id].ox = ox(id); });

  function frame(id, q, bad) {
    var A = ANIM[id], z = A.zoom || 1;
    var tf = z === 1 ? 'translate(' + A.ox + ' 0)' : 'translate(' + A.ox + ' ' + FLOOR + ') scale(' + z + ') translate(0 -' + FLOOR + ')';
    return '<line class="fl" x1="6" y1="' + FLOOR + '" x2="' + (W - 6) + '" y2="' + FLOOR + '"/>' +
      '<g transform="' + tf + '">' + drawJoints(solve(q), { hl: A.hl, bad: bad, props: A.props }) + '</g>';
  }

  return { ANIM: ANIM, solve: solve, mix: mix, frame: frame, W: W, H: H };
})();
if (typeof module !== 'undefined') module.exports = FIG;
