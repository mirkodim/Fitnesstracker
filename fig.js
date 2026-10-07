/* FIG: the stick-figure engine. Two ways to describe a body:
   - side view (default): two-bone IK limbs, the figure faces right. Poses are {hip, th, ankle, fa, wrist|wr|wt, ankle2, fa2, ha, round, es, ...}.
   - front view (view: 'f'): forward kinematics with absolute limb angles, for moves in the frontal plane (lateral raise, jumping jack, side leg raise).
   The exercise animations themselves live in anims.js: FIG.add(id, { reps, hl, props, steps:[{ pose, ms, hold, label, bad? }] }). */
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

  /* ---------- side view: pose spec -> normalised pose ----------
     hip, th (torso angle from vertical, + = leaning forward), ankle, fa (foot angle, + = toes down),
     wr (wrist relative to shoulder), wrist (absolute) or wt (wrist relative to the hip, in the torso's frame: [along the torso towards
     the knees, out of the front], for a bar resting on the hips), ankle2/fa2 (second leg), ha (head angle), hdx (head pushed sideways, px),
     round (spine bulge), es (elbow side), ks/ks2 (knee side, default -1 = knee forward), wrist2|wr2 + es2 (the far arm, drawn lighter),
     aa (a straight arm at this angle from straight down, + = forward, 90 = horizontal; it stays exactly straight while the angle changes, which two
     wrist keyframes cannot do: they cut across the circle and bend the elbow), al (arm length, default 49.995 = straight),
     ua + la (both arm bones by their angles, from straight down: the upper arm from the shoulder, the forearm from the elbow; the elbow stays exactly where
     the upper arm angle puts it, for a pad that holds the elbow: preacher curl, triceps machine).
     Two more ways to describe the body make a move follow its true circle instead of the straight line between two keyframes,
     so segment lengths and a straight body stay intact while it moves:
       { ankle, lean, torso }  legs straight from the ankle at angle lean (from vertical), torso at angle torso (default: same, a straight body)
       { sh, th }              shoulder pinned (on a bench, on a bar), torso angle th, the hip follows */
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
    if (p.ua != null) { q.ua = p.ua; q.la = p.la; }
    else if (p.aa != null) { q.aa = p.aa; q.al = p.al != null ? p.al : 49.995; }
    else if (p.wt) q.wt = p.wt.slice(); else if (p.wr) q.wr = p.wr.slice(); else q.wrist = p.wrist.slice();
    if (p.ankle2) { q.ankle2 = p.ankle2.slice(); q.fa2 = p.fa2 || 0; }
    q.ha = p.ha != null ? p.ha : (Math.abs(q.th) < 45 ? q.th * 0.5 : q.th - (q.th > 0 ? 10 : -10));
    q.round = p.round || 0;
    q.es = p.es == null ? 1 : p.es;
    q.ks = p.ks == null ? -1 : p.ks;
    q.ks2 = p.ks2 == null ? -1 : p.ks2;
    q.hdx = p.hdx || 0;
    if (p.wrist2) q.wrist2 = p.wrist2.slice(); else if (p.wr2) q.wr2 = p.wr2.slice();
    if (q.wrist2 || q.wr2) q.es2 = p.es2 == null ? q.es : p.es2;
    return q;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpP(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function mix(a, b, t) {
    if (a.v === 'f') return mixF(a, b, t);
    var q = { hip: lerpP(a.hip, b.hip, t), th: lerp(a.th, b.th, t), ankle: lerpP(a.ankle, b.ankle, t), fa: lerp(a.fa, b.fa, t),
      ha: lerp(a.ha, b.ha, t), round: lerp(a.round, b.round, t), es: b.es, ks: b.ks, ks2: b.ks2, hdx: lerp(a.hdx || 0, b.hdx || 0, t) };
    if (a.ua != null) { q.ua = lerp(a.ua, b.ua, t); q.la = lerp(a.la, b.la, t); }
    else if (a.aa != null) { q.aa = lerp(a.aa, b.aa, t); q.al = lerp(a.al, b.al, t); }
    else if (a.wt) q.wt = lerpP(a.wt, b.wt, t); else if (a.wr) q.wr = lerpP(a.wr, b.wr, t); else q.wrist = lerpP(a.wrist, b.wrist, t);
    if (a.ankle2) { q.ankle2 = lerpP(a.ankle2, b.ankle2, t); q.fa2 = lerp(a.fa2, b.fa2, t); }
    if (a.wrist2 && b.wrist2) { q.wrist2 = lerpP(a.wrist2, b.wrist2, t); q.es2 = b.es2; }
    else if (a.wr2 && b.wr2) { q.wr2 = lerpP(a.wr2, b.wr2, t); q.es2 = b.es2; }
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
    var elbowFK = null;
    if (q.ua != null) elbowFK = [sh[0] + LU * Math.sin(q.ua * D2R), sh[1] + LU * Math.cos(q.ua * D2R)];
    var wrist = q.ua != null ? [elbowFK[0] + LF * Math.sin(q.la * D2R), elbowFK[1] + LF * Math.cos(q.la * D2R)]
      : (q.aa != null ? [sh[0] + q.al * Math.sin(q.aa * D2R), sh[1] + q.al * Math.cos(q.aa * D2R)]
        : (q.wt ? [hip[0] - Math.sin(r) * q.wt[0] + Math.cos(r) * q.wt[1], hip[1] + Math.cos(r) * q.wt[0] + Math.sin(r) * q.wt[1]]
          : (q.wr ? [sh[0] + q.wr[0], sh[1] + q.wr[1]] : q.wrist)));
    var hr = q.ha * D2R, hd = NECK + HR;
    var fr = q.fa * D2R;
    var j = { hip: hip, sh: sh, th: q.th, round: q.round, ankle: q.ankle, wrist: wrist,
      head: [sh[0] + hd * Math.sin(hr) + (q.hdx || 0), sh[1] - hd * Math.cos(hr)] };
    j.knee = ik(hip, q.ankle, LT, LS, q.ks == null ? -1 : q.ks);
    j.toe = [q.ankle[0] + FOOT * Math.cos(fr), q.ankle[1] + FOOT * Math.sin(fr)];
    j.elbow = elbowFK || ik(sh, wrist, LU, LF, q.es);
    if (q.ankle2) {
      var f2 = q.fa2 * D2R;
      j.ankle2 = q.ankle2;
      j.knee2 = ik(hip, q.ankle2, LT, LS, q.ks2 == null ? -1 : q.ks2);
      j.toe2 = [q.ankle2[0] + FOOT * Math.cos(f2), q.ankle2[1] + FOOT * Math.sin(f2)];
    }
    if (q.wrist2 || q.wr2) {
      j.wrist2 = q.wr2 ? [sh[0] + q.wr2[0], sh[1] + q.wr2[1]] : q.wrist2;
      j.elbow2 = ik(sh, j.wrist2, LU, LF, q.es2 == null ? q.es : q.es2);
    }
    return j;
  }

  /* ---------- front view: forward kinematics ----------
     Angles are measured from "straight down"; for the left limbs (left on the screen) positive swings out to the left, for the right limbs to the
     right, so a symmetrical move uses the same numbers on both sides. 180 = straight up.
       arms / legs: [upper, lower] for both sides, armL/armR/legL/legR override one side.
       us, fs, ts, cs: how much of the upper arm, forearm, thigh and shin is seen (default 1 = full length, 0 = pointing straight at the viewer). A seated figure
       seen from the front has thighs that point at us (ts about 0.3, angle 90), and an elbow bent forward has a forearm that points at us (fs about 0.15):
       a limb that turns towards or away from the viewer is drawn shorter instead of being cut off.
       lean: torso side bend (deg, + = to the right of the screen), hd: head tilt on top of that, sh: shoulders lifted (px),
       rot: the whole body turned about the pelvis (positive = clockwise on the screen, 90 = lying with the head to the left),
       px/py: pelvis position, auto (default 1): py is solved so the lowest point of the body just touches the floor. */
  var FW = { pelvis: 18, shoulders: 34, foot: 10 };
  var FDEF = { rot: 0, px: 160, py: 0, auto: 1, lean: 0, hd: 0, sh: 0, al1: 0, al2: 0, ar1: 0, ar2: 0, ll1: 0, ll2: 0, lr1: 0, lr2: 0, us: 1, fs: 1, ts: 1, cs: 1 };
  function normF(p) {
    var q = { v: 'f' }, k;
    for (k in FDEF) q[k] = p[k] != null ? p[k] : FDEF[k];
    function side(arr, a, b) { if (arr) { q[a] = arr[0]; q[b] = arr[1]; } }
    side(p.arms, 'al1', 'al2'); side(p.arms, 'ar1', 'ar2'); side(p.legs, 'll1', 'll2'); side(p.legs, 'lr1', 'lr2');
    side(p.armL, 'al1', 'al2'); side(p.armR, 'ar1', 'ar2'); side(p.legL, 'll1', 'll2'); side(p.legR, 'lr1', 'lr2');
    return q;
  }
  function mixF(a, b, t) {
    var q = { v: 'f', auto: b.auto }, k;
    for (k in FDEF) if (k !== 'auto') q[k] = lerp(a[k], b[k], t);
    return q;
  }
  function solveF(q) {
    var r = q.rot * D2R, cr = Math.cos(r), sr = Math.sin(r);
    var le = q.lean * D2R, he = (q.lean + q.hd) * D2R;
    var hipL = [-FW.pelvis / 2, 0], hipR = [FW.pelvis / 2, 0];
    var C = [LB * Math.sin(le), -LB * Math.cos(le)], n = [Math.cos(le), Math.sin(le)];
    var shL = [C[0] - n[0] * FW.shoulders / 2, C[1] - n[1] * FW.shoulders / 2 - q.sh];
    var shR = [C[0] + n[0] * FW.shoulders / 2, C[1] + n[1] * FW.shoulders / 2 - q.sh];
    function limb(root, a1, a2, l1, l2, dir) {
      var m = [root[0] + dir * l1 * Math.sin(a1 * D2R), root[1] + l1 * Math.cos(a1 * D2R)];
      return [m, [m[0] + dir * l2 * Math.sin(a2 * D2R), m[1] + l2 * Math.cos(a2 * D2R)]];
    }
    var aL = limb(shL, q.al1, q.al2, LU * q.us, LF * q.fs, -1), aR = limb(shR, q.ar1, q.ar2, LU * q.us, LF * q.fs, 1);
    var lL = limb(hipL, q.ll1, q.ll2, LT * q.ts, LS * q.cs, -1), lR = limb(hipR, q.lr1, q.lr2, LT * q.ts, LS * q.cs, 1);
    var hd = NECK + HR;
    var j = { P: [0, 0], hipL: hipL, hipR: hipR, C: C, shL: shL, shR: shR, head: [C[0] + hd * Math.sin(he), C[1] - hd * Math.cos(he)],
      elL: aL[0], wrL: aL[1], elR: aR[0], wrR: aR[1], knL: lL[0], anL: lL[1], knR: lR[0], anR: lR[1],
      toeL: [lL[1][0] - FW.foot, lL[1][1]], toeR: [lR[1][0] + FW.foot, lR[1][1]] };
    var k, p, maxY = -1e9, out = {};
    for (k in j) { p = j[k]; j[k] = [p[0] * cr - p[1] * sr, p[0] * sr + p[1] * cr]; if (j[k][1] > maxY) maxY = j[k][1]; }
    var py = q.auto ? G - maxY : q.py;
    for (k in j) out[k] = [j[k][0] + q.px, j[k][1] + py];
    return out;
  }

  /* ---------- drawing ---------- */
  function n1(v) { return Math.round(v * 10) / 10; }
  function ln(a, b, cls) {
    return '<line class="' + cls + '" x1="' + n1(a[0]) + '" y1="' + n1(a[1]) + '" x2="' + n1(b[0]) + '" y2="' + n1(b[1]) + '"/>';
  }
  /* where a held prop sits: at a joint plus a fixed offset (dx, dy), and/or `along` pixels further in the direction of the forearm (a weight that hangs off the hands of a straight arm) */
  function propPt(j, p) {
    var b = j[p.at], x = b[0] + (p.dx || 0), y = b[1] + (p.dy || 0);
    if (p.along && j.elbow) {
      var dx = b[0] - j.elbow[0], dy = b[1] - j.elbow[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
      x += dx / d * p.along; y += dy / d * p.along;
    }
    return [x, y];
  }
  function circ(c, r, cls) { return '<circle class="' + cls + '" cx="' + n1(c[0]) + '" cy="' + n1(c[1]) + '" r="' + r + '"/>'; }
  var HELD = { plate: 1, bell: 1, ball: 1, pad: 1 };
  function heldR(p) { return p.r || (p.t === 'bell' ? 8 : (p.t === 'pad' ? (p.len || 30) / 2 : 10)); }
  function propSVG(p, j) {
    var c, r;
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
    if (p.t === 'bell') {                                         // kettlebell: round body, handle on top (or, when it hangs off the hands, towards the hands)
      c = p.at ? propPt(j, p) : [p.x, p.y]; r = p.r || 8;
      var ux = 0, uy = -1;
      if (p.along && p.at) { var hx = j[p.at][0] - c[0], hy = j[p.at][1] - c[1], hd = Math.sqrt(hx * hx + hy * hy) || 1; ux = hx / hd; uy = hy / hd; }
      var vx = -uy, vy = ux;
      var P = function (a, b) { return n1(c[0] + ux * a + vx * b) + ' ' + n1(c[1] + uy * a + vy * b); };
      return '<path class="bh" d="M' + P(r * 0.75, -r * 0.55) + ' C' + P(r * 2, -r * 0.55) + ' ' + P(r * 2, r * 0.55) + ' ' + P(r * 0.75, r * 0.55) + '"/>' + circ(c, r, 'pp pl');
    }
    if (p.t === 'ball') {                                         // medicine ball: circle with a seam
      c = p.at ? propPt(j, p) : [p.x, p.y]; r = p.r || 10;
      return circ(c, r, 'pp pl') + '<path class="bh" d="M' + n1(c[0] - r * 0.92) + ' ' + n1(c[1] - r * 0.3) + ' Q' + n1(c[0]) + ' ' + n1(c[1] - r * 0.95) + ' ' + n1(c[0] + r * 0.92) + ' ' + n1(c[1] - r * 0.3) + '"/>';
    }
    if (p.t === 'bar') return '<line class="an" x1="' + p.x + '" y1="' + p.y + '" x2="' + (p.x + p.w) + '" y2="' + p.y + '"/><line class="an" x1="' + p.x + '" y1="' + p.y + '" x2="' + p.x + '" y2="' + (p.y + 7) + '"/><line class="an" x1="' + (p.x + p.w) + '" y1="' + p.y + '" x2="' + (p.x + p.w) + '" y2="' + (p.y + 7) + '"/>';
    if (p.t === 'poly') return '<polygon class="pp" stroke-linejoin="round" points="' + p.pts.map(function (a) { return a[0] + ',' + a[1]; }).join(' ') + '"/>';
    if (p.t === 'rail') return '<line class="rl" x1="' + p.x1 + '" y1="' + p.y1 + '" x2="' + p.x2 + '" y2="' + p.y2 + '"/>';
    if (p.t === 'pulley') return circ([p.x, p.y], 5, 'pp pl');
    if (p.t === 'pad') {                                          // a pad or plate that sits on a joint at a fixed angle (leg press plate, roller pad)
      c = propPt(j, p); var pa = p.ang * D2R, hx = Math.cos(pa) * p.len / 2, hy = Math.sin(pa) * p.len / 2;
      return ln([c[0] - hx, c[1] - hy], [c[0] + hx, c[1] + hy], 'pdl');
    }
    if (p.t === 'link') return ln(j[p.a], j[p.b], 'st' + (p.band ? ' bd' : ''));
    if (p.t === 'arrow') {
      var dx = p.x2 - p.x1, dy = p.y2 - p.y1, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      return '<line class="ar" x1="' + p.x1 + '" y1="' + p.y1 + '" x2="' + n1(p.x2 - ux * 5) + '" y2="' + n1(p.y2 - uy * 5) + '"/><polygon class="arh" points="' +
        n1(p.x2) + ',' + n1(p.y2) + ' ' + n1(p.x2 - ux * 9 - uy * 5) + ',' + n1(p.y2 - uy * 9 + ux * 5) + ' ' + n1(p.x2 - ux * 9 + uy * 5) + ',' + n1(p.y2 - uy * 9 - ux * 5) + '"/>';
    }
    return '';
  }
  function layerOf(p) { return (p.t === 'plate' || ((p.t === 'bell' || p.t === 'ball') && p.at)) ? 'front' : 'back'; }

  function drawJoints(j, o) {
    var hl = o.hl || [], bad = !!o.bad, props = o.props || [], s = '', i;
    function c(name) { return 'sg' + (bad ? ' bad' : (hl.indexOf(name) >= 0 ? ' hl' : '')); }
    for (i = 0; i < props.length; i++) if (layerOf(props[i]) === 'back') s += propSVG(props[i], j);
    if (j.ankle2) s += ln(j.hip, j.knee2, 'sg far') + ln(j.knee2, j.ankle2, 'sg far') + ln(j.ankle2, j.toe2, 'sg far');
    if (j.wrist2) s += ln(j.sh, j.elbow2, 'sg far') + ln(j.elbow2, j.wrist2, 'sg far');
    s += ln(j.hip, j.knee, c('thigh')) + ln(j.knee, j.ankle, c('shin')) + ln(j.ankle, j.toe, 'sg' + (bad ? ' bad' : ''));
    if (j.round) {
      var t = j.th * D2R, mx = (j.hip[0] + j.sh[0]) / 2, my = (j.hip[1] + j.sh[1]) / 2;
      var cx = mx - Math.cos(t) * 2 * j.round, cy = my - Math.sin(t) * 2 * j.round;
      s += '<path class="' + c('torso') + '" fill="none" d="M' + n1(j.hip[0]) + ' ' + n1(j.hip[1]) + ' Q' + n1(cx) + ' ' + n1(cy) + ' ' + n1(j.sh[0]) + ' ' + n1(j.sh[1]) + '"/>';
    } else {
      s += ln(j.hip, j.sh, c('torso'));
    }
    s += ln(j.sh, j.elbow, c('upper')) + ln(j.elbow, j.wrist, c('fore'));
    if (!bad && hl.indexOf('glute') >= 0) s += circ(j.hip, 7, 'hlp');
    if (!bad && hl.indexOf('delt') >= 0) s += circ(j.sh, 7, 'hlp');
    for (i = 0; i < props.length; i++) if (layerOf(props[i]) === 'front') s += propSVG(props[i], j);
    s += '<circle class="hd' + (bad ? ' bad' : (hl.indexOf('head') >= 0 ? ' hl' : '')) + '" cx="' + n1(j.head[0]) + '" cy="' + n1(j.head[1]) + '" r="' + HR + '"/>';
    return s;
  }

  function drawF(j, o) {
    var hl = o.hl || [], bad = !!o.bad, props = o.props || [], s = '', i;
    function c(name) { return 'sg' + (bad ? ' bad' : (hl.indexOf(name) >= 0 ? ' hl' : '')); }
    var plain = 'sg' + (bad ? ' bad' : '');
    for (i = 0; i < props.length; i++) if (layerOf(props[i]) === 'back') s += propSVG(props[i], j);
    s += ln(j.hipL, j.knL, c('thigh')) + ln(j.knL, j.anL, c('shin')) + ln(j.anL, j.toeL, plain);
    s += ln(j.hipR, j.knR, c('thigh')) + ln(j.knR, j.anR, c('shin')) + ln(j.anR, j.toeR, plain);
    s += ln(j.hipL, j.hipR, plain) + ln(j.P, j.C, c('torso')) + ln(j.shL, j.shR, c('trap'));
    s += ln(j.shL, j.elL, c('upper')) + ln(j.elL, j.wrL, c('fore')) + ln(j.shR, j.elR, c('upper')) + ln(j.elR, j.wrR, c('fore'));
    if (!bad && hl.indexOf('glute') >= 0) s += circ(j.hipL, 6, 'hlp') + circ(j.hipR, 6, 'hlp');
    if (!bad && hl.indexOf('delt') >= 0) s += circ(j.shL, 7, 'hlp') + circ(j.shR, 7, 'hlp');
    for (i = 0; i < props.length; i++) if (layerOf(props[i]) === 'front') s += propSVG(props[i], j);
    s += '<circle class="hd' + (bad ? ' bad' : (hl.indexOf('head') >= 0 ? ' hl' : '')) + '" cx="' + n1(j.head[0]) + '" cy="' + n1(j.head[1]) + '" r="' + HR + '"/>';
    return s;
  }

  /* ---------- authoring helpers (side view) ---------- */
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

  /* ---------- registry, bounds (to centre each exercise) ---------- */
  var ANIM = {};
  function jointsOf(A, q) { return A.view === 'f' ? solveF(q) : solve(q); }

  function ox(id) {
    var A = ANIM[id], lo = 1e9, hi = -1e9, front = A.view === 'f';
    function take(x) { if (x < lo) lo = x; if (x > hi) hi = x; }
    function pose(q) {
      var j = jointsOf(A, q), k;
      for (k in j) if (j[k] && j[k].length === 2) take(j[k][0]);
      take(j.head[0] - 9); take(j.head[0] + 9);
      if (A.sweep || front) A.props.forEach(function (p) { if (HELD[p.t] && p.at) { var c = propPt(j, p), r = heldR(p); take(c[0] - r); take(c[0] + r); } });
    }
    A.steps.forEach(function (s) { pose(s.pose); });
    if (A.sweep || front) {              // moves along arcs: the in-between frames count for the bounds too
      A.steps.forEach(function (s, i) {
        var from = A.steps[(i + A.steps.length - 1) % A.steps.length].pose;
        for (var u = 1; u < 10; u++) pose(mix(from, s.pose, u / 10));
      });
    }
    A.props.forEach(function (p) {
      if (p.t === 'box') { take(p.x); take(p.x + p.w); }
      if (p.t === 'anchor') { take(p.x - 12); take(p.x + 12); }
      if (p.t === 'bar') { take(p.x); take(p.x + p.w); }
      if (p.t === 'poly') p.pts.forEach(function (a) { take(a[0]); });
      if (p.t === 'rail') { take(p.x1); take(p.x2); }
      if (p.t === 'pulley') { take(p.x - 5); take(p.x + 5); }
      if (p.t === 'arrow') { take(p.x1); take(p.x2); }
      if ((p.t === 'ball' || p.t === 'bell') && !p.at) { take(p.x - (p.r || 10)); take(p.x + (p.r || 10)); }
    });
    var z = A.zoom || 1;
    return z === 1 ? Math.round((W - (lo + hi)) / 2) : Math.round(W / 2 - z * (lo + hi) / 2);
  }
  function add(id, spec) {
    if (ANIM[id]) throw new Error('Animation ' + id + ' ist doppelt definiert');
    if (!spec.view) spec.view = 's';
    if (!spec.props) spec.props = [];
    ANIM[id] = spec;
    spec.ox = ox(id);
    return spec;
  }

  function frame(id, q, bad) {
    var A = ANIM[id], z = A.zoom || 1;
    var tf = z === 1 ? 'translate(' + A.ox + ' 0)' : 'translate(' + A.ox + ' ' + FLOOR + ') scale(' + z + ') translate(0 -' + FLOOR + ')';
    var draw = A.view === 'f' ? drawF : drawJoints;
    return '<line class="fl" x1="6" y1="' + FLOOR + '" x2="' + (W - 6) + '" y2="' + FLOOR + '"/>' +
      '<g transform="' + tf + '">' + draw(jointsOf(A, q), { hl: A.hl, bad: bad, props: A.props }) + '</g>';
  }

  /* A small picture of one key pose, cropped to the figure, for lists. The step that shows the exercise best is A.thumb (default: the first). */
  var thumbs = {};
  function thumb(id) {
    if (thumbs[id]) return thumbs[id];
    var A = ANIM[id], st = A.steps[A.thumb || 0], j = jointsOf(A, st.pose);
    var lo = 1e9, hi = -1e9, top = 1e9, bot = -1e9, k;
    function tk(x, y, r) { lo = Math.min(lo, x - r); hi = Math.max(hi, x + r); top = Math.min(top, y - r); bot = Math.max(bot, y + r); }
    for (k in j) if (j[k] && j[k].length === 2) tk(j[k][0], j[k][1], 3.5);
    tk(j.head[0], j.head[1], HR + 1.75);
    A.props.forEach(function (p) {
      if (HELD[p.t] && p.at) { var c = propPt(j, p), r = heldR(p); tk(c[0], c[1], r + 1.5); if (p.t === 'bell') tk(c[0], c[1] - 2 * r, 2); }
      if (p.t === 'box') { tk(p.x, p.y, 0); tk(p.x + p.w, p.y + p.h, 0); }
      if (p.t === 'anchor') { tk(p.x - 12, p.y, 2); tk(p.x + 12, p.y, 2); }
      if (p.t === 'bar') { tk(p.x, p.y, 2); tk(p.x + p.w, p.y + 7, 2); }
      if (p.t === 'poly') p.pts.forEach(function (a) { tk(a[0], a[1], 0); });
      if (p.t === 'rail') { tk(p.x1, p.y1, 2); tk(p.x2, p.y2, 2); }
      if (p.t === 'pulley') tk(p.x, p.y, 6);
      if ((p.t === 'ball' || p.t === 'bell') && !p.at) tk(p.x, p.y, (p.r || 10) + 1);
      if (p.t === 'strap') tk(p.anchor[0], p.anchor[1], 2);
    });
    var size = Math.max(hi - lo, bot - top) + 14, cx = (lo + hi) / 2, cy = (top + bot) / 2;
    var x0 = cx - size / 2, y0 = cy - size / 2;
    if (FLOOR > y0 && FLOOR < y0 + size - 2) y0 = Math.min(y0, FLOOR - size + 8);        // keep the floor line in sight when the figure stands on it
    var svg = '<svg class="th" viewBox="' + n1(x0) + ' ' + n1(y0) + ' ' + n1(size) + ' ' + n1(size) + '" aria-hidden="true" focusable="false">' +
      (FLOOR > y0 && FLOOR < y0 + size ? '<line class="fl" x1="' + n1(x0) + '" y1="' + FLOOR + '" x2="' + n1(x0 + size) + '" y2="' + FLOOR + '"/>' : '') +
      (A.view === 'f' ? drawF : drawJoints)(j, { hl: A.hl, bad: false, props: A.props }) + '</svg>';
    thumbs[id] = svg;
    return svg;
  }

  /* The little body pictures on the tiles of the areas: a standing figure seen from the front with the area marked. */
  var ICON = {
    beine: { hl: ['thigh', 'shin'] }, gesaess: { blob: 'glute' }, arme: { hl: ['upper', 'fore'] }, ruecken: { blob: 'back' }, bauch: { blob: 'abs' },
    brust: { blob: 'chest' }, schultern: { hl: ['delt'] }, nacken: { blob: 'neck' }, ganz: { hl: ['thigh', 'shin', 'upper', 'fore', 'torso', 'trap'] }
  };
  var icons = {};
  function icon(gid) {
    if (icons[gid]) return icons[gid];
    var d = ICON[gid] || ICON.ganz, j = solveF(normF({ arms: [8, 8], legs: [4, 2] })), P = j.P, C = j.C, s = '';
    function ell(cx, cy, rx, ry) { return '<ellipse class="ib" cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + rx + '" ry="' + ry + '"/>'; }
    if (d.blob === 'glute') s += ell(P[0], P[1] + 5, 18, 10);
    if (d.blob === 'abs') s += ell(P[0], P[1] - 13, 12, 11);
    if (d.blob === 'chest') s += ell(C[0], C[1] + 12, 19, 10);
    if (d.blob === 'back') s += ell(C[0], (C[1] + P[1]) / 2 - 2, 15, 24);
    if (d.blob === 'neck') s += ell(C[0], C[1] - 6, 10, 9);
    var lower = gid === 'beine' || gid === 'gesaess', whole = gid === 'ganz';
    var vb = whole ? '80 26 160 160' : (lower ? '112 90 96 96' : '112 30 96 96');
    icons[gid] = '<svg class="ic" viewBox="' + vb + '" aria-hidden="true" focusable="false">' + s + drawF(j, { hl: d.hl || [], bad: false, props: [] }) + '</svg>';
    return icons[gid];
  }

  return {
    ANIM: ANIM, add: add, solve: solve, solveF: solveF, mix: mix, frame: frame, thumb: thumb, icon: icon, W: W, H: H, G: G, FLOOR: FLOOR, D2R: D2R,
    LB: LB, LT: LT, LS: LS, LU: LU, LF: LF, HR: HR, FOOT: FOOT, FW: FW,
    propPt: propPt, ik: ik, norm: norm, normF: normF, lineHip: lineHip, tiltHip: tiltHip, leanOf: leanOf, bendBody: bendBody, floorBody: floorBody, body: body
  };
})();
if (typeof module !== 'undefined') module.exports = FIG;
