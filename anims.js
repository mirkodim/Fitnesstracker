/* The exercise animations. Every exercise of the library (lib.js) has one under the same id.
   An animation is a short loop of key poses (steps) that the app blends; a step with bad: true is shown in orange as "how not to".
   The poses are described with the helpers of fig.js (see the comment there). The first ten were drawn with the first version of the app and are kept as they were. */
(function (FIG) {
  var G = FIG.G, D2R = FIG.D2R, norm = FIG.norm, normF = FIG.normF, lineHip = FIG.lineHip, tiltHip = FIG.tiltHip, leanOf = FIG.leanOf,
    bendBody = FIG.bendBody, floorBody = FIG.floorBody, body = FIG.body, add = FIG.add, ik = FIG.ik;
  function shOf(hip, th) { return [hip[0] + 46 * Math.sin(th * D2R), hip[1] - 46 * Math.cos(th * D2R)]; }       // shoulder of a body with this hip and torso angle
  function reach(sh, deg, l) { return [sh[0] + l * Math.sin(deg * D2R), sh[1] + l * Math.cos(deg * D2R)]; }    // hand at this arm angle (0 = straight down, 90 = forward)

  /* Box-Kniebeugen */
  (function () {
    var A = [150, G];
    var top = norm({ hip: [150, G - 70], th: 4, ankle: A, wr: [-8, 0], es: -1 });
    var bot = norm({ hip: [117, G - 38], th: 38, ankle: A, wr: [-8, 0], es: -1 });
    add('a-box', { reps: 3, hl: ['thigh'],
      props: [{ t: 'box', x: 90, y: 143, w: 42, h: 35 }, { t: 'plate', at: 'wrist', dx: -1, dy: 4, r: 8 }],
      steps: [
        { pose: top, ms: 1200, hold: 600, label: 'Kräftig aufstehen, Hüfte und Knie strecken' },
        { pose: bot, ms: 1800, hold: 700, label: 'Hüfte nach hinten, kontrolliert auf die Box setzen' }
      ] });
  })();

  /* Liegestütze */
  (function () {
    var hand = [190, G - 2], A = [190 - Math.sqrt(118 * 118 - 40 * 40), G - 12];
    var shUp = [190, 122], shDn = floorBody(A, 150);
    var up = norm({ ankle: A, lean: leanOf(shUp, A), fa: 70, wrist: hand });     // same poses as before, but the body pivots about the feet,
    var dn = norm({ ankle: A, lean: leanOf(shDn, A), fa: 70, wrist: hand });     // so it stays one straight line on the way down and up
    var sag = norm(body(shUp, A, { fa: 70, wrist: hand, delta: 20 }));
    add('a-push', { reps: 2, hl: ['torso', 'upper', 'fore'], props: [],
      steps: [
        { pose: up, ms: 900, hold: 500, label: 'Kräftig hochdrücken, Körper bleibt eine Linie' },
        { pose: dn, ms: 1500, hold: 400, label: 'Brust Richtung Boden, Ellbogen schräg nach hinten' },
        { pose: up, ms: 900, hold: 300, label: 'Kräftig hochdrücken, Körper bleibt eine Linie' },
        { pose: sag, ms: 800, hold: 1100, bad: true, label: 'Falsch: Becken hängt durch (Hohlkreuz)' }
      ] });
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
    add('a-tri', { reps: 2, hl: ['upper'], sweep: true,
      props: [{ t: 'anchor', x: AN[0], y: AN[1] - 3 }, { t: 'strap', anchor: AN, at: 'wrist' }],
      steps: [
        { pose: up, ms: 1000, hold: 500, label: 'Kräftig hochdrücken, bis die Arme gestreckt sind' },
        { pose: dn, ms: 1700, hold: 400, label: 'Nur die Ellbogen beugen, der Kopf sinkt zwischen die Hände' },
        { pose: up, ms: 1000, hold: 300, label: 'Kräftig hochdrücken, bis die Arme gestreckt sind' },
        { pose: sag, ms: 800, hold: 1100, bad: true, label: 'Falsch: Hüfte hängt durch' }
      ] });
  })();

  /* Hip Thrust: upper back on the bench (shoulder stays put), the hips go up and down, the feet stay put, the bar rests on the hips.
     The figure is flat and low, so it is drawn larger (zoom). */
  (function () {
    var S = [105, 138], A = [187, G], WT = [3.74, 5];   // bar just above the hip crease, arms straight
    var top = norm({ sh: S, th: -90, ankle: A, wt: WT, ha: -62, es: -1 });
    var bot = norm({ sh: S, th: -55, ankle: A, wt: WT, ha: -62, es: -1 });
    var bad = norm({ sh: S, th: -102, ankle: A, wt: WT, ha: -62, round: -7, es: -1 });
    add('a-hip', { reps: 2, hl: ['thigh'], sweep: true, zoom: 1.8,
      props: [{ t: 'box', x: 78, y: 141, w: 36, h: 7 }, { t: 'box', x: 91, y: 148, w: 10, h: 29 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 11 }],
      steps: [
        { pose: top, ms: 1200, hold: 900, label: 'Hüfte hochdrücken, oben das Gesäss fest anspannen' },
        { pose: bot, ms: 1800, hold: 500, label: 'Kontrolliert ablassen, die Hüfte bleibt knapp über dem Boden' },
        { pose: top, ms: 1200, hold: 300, label: 'Hüfte hochdrücken, oben das Gesäss fest anspannen' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, Hüfte zu hoch, Rippen offen' }
      ] });
  })();

  /* Plank */
  (function () {
    var wrist = [200, G], sh = [176, 148], A = [sh[0] - Math.sqrt(118 * 118 - 14 * 14), G - 12];
    var good = norm(body(sh, A, { fa: 70, wrist: wrist }));
    var sag = norm(body(sh, A, { fa: 70, wrist: wrist, delta: 17 }));
    var pike = norm(body(sh, A, { fa: 70, wrist: wrist, delta: -17 }));
    add('a-plank', { reps: 2, hl: ['torso'], props: [],
      steps: [
        { pose: good, ms: 800, hold: 1800, label: 'Richtig: gerade Linie von Kopf bis Ferse' },
        { pose: sag, ms: 800, hold: 1200, bad: true, label: 'Falsch: Becken hängt durch' },
        { pose: pike, ms: 800, hold: 1200, bad: true, label: 'Falsch: Po zu hoch' }
      ] });
  })();

  /* Rumänisches Kreuzheben */
  (function () {
    var A = [150, G];
    var top = norm({ hip: [149, G - 70], th: 2, ankle: A, wr: [10, 47] });
    var bot = norm({ hip: [116, G - 61], th: 65, ankle: A, wr: [-6, 49] });
    var bad = norm({ hip: [116, G - 61], th: 65, ankle: A, wr: [14, 47], round: 15, ha: 92 });
    add('b-rdl', { reps: 2, hl: ['thigh'],
      props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 11 }],
      steps: [
        { pose: top, ms: 1300, hold: 500, label: 'Hüfte nach vorn schieben, Po anspannen, aufrichten' },
        { pose: bot, ms: 1700, hold: 600, label: 'Hüfte nach hinten schieben, Rücken gerade, Stange am Bein' },
        { pose: top, ms: 1300, hold: 300, label: 'Hüfte nach vorn schieben, Po anspannen, aufrichten' },
        { pose: bad, ms: 1200, hold: 1200, bad: true, label: 'Falsch: runder Rücken, Stange zu weit weg' }
      ] });
  })();

  /* TRX-Rudern */
  (function () {
    var A = [200, G], AN = [262, 22];
    function lean(a) { return [A[0] - 118 * Math.sin(a * D2R), A[1] - 118 * Math.cos(a * D2R)]; }
    var shS = lean(36), shE = lean(14);
    var start = norm({ ankle: A, lean: -36, wrist: [shS[0] + 45, shS[1] - 19], ha: -6 });   // same poses as before, body pivots about the feet
    var end = norm({ ankle: A, lean: -14, wrist: [shE[0] + 11, shE[1] + 10], ha: -4 });
    add('b-row', { reps: 3, hl: ['torso', 'upper'],
      props: [{ t: 'anchor', x: AN[0], y: AN[1] - 3 }, { t: 'strap', anchor: AN, at: 'wrist' }],
      steps: [
        { pose: start, ms: 1500, hold: 500, label: 'Langsam ablassen, Arme strecken, Körper bleibt gerade' },
        { pose: end, ms: 1200, hold: 600, label: 'Brust zu den Händen ziehen, Schulterblätter zusammen' }
      ] });
  })();

  /* TRX-Ausfallschritte rückwärts */
  (function () {
    var top = norm({ hip: [150, G - 71], th: 3, ankle: [150, G], ankle2: [146, G], wrist: [182, 79] });
    var bot = norm({ hip: [122, G - 38], th: 8, ankle: [152, G], ankle2: [80, 164], fa2: 65, wrist: [170, 67] });
    add('b-lunge', { reps: 3, hl: ['thigh'],
      props: [{ t: 'anchor', x: 250, y: 9 }, { t: 'strap', anchor: [250, 12], at: 'wrist' }],
      steps: [
        { pose: top, ms: 1100, hold: 500, label: 'Mit der vorderen Ferse hochdrücken, Füsse zusammen' },
        { pose: bot, ms: 1500, hold: 600, label: 'Grosser Schritt nach hinten, Knie sinkt Richtung Boden' }
      ] });
  })();

  /* Bizeps-Curls */
  (function () {
    var A = [150, G];
    var dn = norm({ hip: [150, G - 71], th: 3, ankle: A, wr: [10, 47] });
    var upP = norm({ hip: [150, G - 71], th: 3, ankle: A, wr: [14, 5] });
    var cheat = norm({ hip: [153, G - 71], th: -16, ankle: A, wr: [24, -4], ha: -4 });
    add('b-curl', { reps: 3, hl: ['upper'],
      props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 }],
      steps: [
        { pose: dn, ms: 1700, hold: 400, label: 'Langsam ablassen, Arme fast ganz strecken' },
        { pose: upP, ms: 1100, hold: 500, label: 'Hantel hochrollen, Ellbogen bleiben am Körper' },
        { pose: dn, ms: 1700, hold: 300, label: 'Langsam ablassen, Arme fast ganz strecken' },
        { pose: cheat, ms: 700, hold: 1200, bad: true, label: 'Falsch: Schwung aus dem Rücken, Oberkörper lehnt zurück' }
      ] });
  })();

  /* TRX-Crunches */
  (function () {
    var wrist = [198, G - 2], sh = [198, 122];
    var A0 = [sh[0] - Math.sqrt(118 * 118 - 20 * 20), 142];
    var start = norm({ sh: sh, hip: lineHip(sh, A0), ankle: A0, fa: 78, wrist: wrist });
    var hipT = [sh[0] - 46 * Math.cos(25 * D2R), sh[1] - 46 * Math.sin(25 * D2R)];
    var tuck = norm({ sh: sh, hip: hipT, ankle: [132, 138], fa: 62, wrist: wrist });
    add('b-crunch', { reps: 3, hl: ['torso', 'thigh'],
      props: [{ t: 'anchor', x: 100, y: 12 }, { t: 'strap', anchor: [100, 15], at: 'ankle', dx: 0, dy: 0 }],
      steps: [
        { pose: start, ms: 1500, hold: 500, label: 'Langsam zurück, Körper bleibt in der Linie' },
        { pose: tuck, ms: 1200, hold: 600, label: 'Knie zur Brust ziehen, Rücken rund machen' }
      ] });
  })();

  /* ===== Beine: Oberschenkel und Unterschenkel ===== */

  /* Kniebeuge, Körpergewicht: the arms reach forward for balance */
  (function () {
    var A = [150, G], arms = [48, -2];
    var top = norm({ hip: [150, G - 70], th: 3, ankle: A, wr: arms });
    var bot = norm({ hip: [128, G - 38], th: 32, ankle: A, wr: arms });
    var bad = norm({ hip: [118, G - 42], th: 62, ankle: [153.5, G - 7], fa: 30, wr: arms });
    add('x-squat', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [],
      steps: [
        { pose: top, ms: 1100, hold: 500, label: 'Kräftig aufstehen, oben das Gesäss anspannen' },
        { pose: bot, ms: 1700, hold: 600, label: 'Hüfte nach hinten und unten, Brust offen, Fersen am Boden' },
        { pose: top, ms: 1100, hold: 300, label: 'Kräftig aufstehen, oben das Gesäss anspannen' },
        { pose: bad, ms: 900, hold: 1100, bad: true, label: 'Falsch: Fersen heben ab, Oberkörper klappt nach vorn' }
      ] });
  })();

  /* Goblet-Kniebeuge: the weight is held at the chest, so the torso stays more upright */
  (function () {
    var A = [150, G], hands = [13, 14];
    var top = norm({ hip: [150, G - 70], th: 3, ankle: A, wr: hands });
    var bot = norm({ hip: [132, G - 36], th: 22, ankle: A, wr: hands });
    var bad = norm({ hip: [118, G - 42], th: 58, ankle: [153.5, G - 7], fa: 30, wr: hands });
    add('x-goblet', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [{ t: 'plate', at: 'wrist', dx: 3, dy: 1, r: 6 }],
      steps: [
        { pose: top, ms: 1100, hold: 500, label: 'Kräftig aufstehen, das Gewicht bleibt an der Brust' },
        { pose: bot, ms: 1700, hold: 700, label: 'Tief in die Hocke, der Oberkörper bleibt aufrecht' },
        { pose: top, ms: 1100, hold: 300, label: 'Kräftig aufstehen, das Gewicht bleibt an der Brust' },
        { pose: bad, ms: 900, hold: 1100, bad: true, label: 'Falsch: Oberkörper kippt nach vorn, Fersen heben ab' }
      ] });
  })();

  /* Langhantel-Kniebeuge: the bar rests on the upper back (seen from the side only its end plate shows) */
  (function () {
    var A = [150, G], bar = [-8, 0];
    var top = norm({ hip: [150, G - 70], th: 4, ankle: A, wr: bar, es: -1 });
    var bot = norm({ hip: [118, G - 36], th: 38, ankle: A, wr: bar, es: -1 });
    var bad = norm({ hip: [112, G - 40], th: 64, ankle: [153.5, G - 7], fa: 30, wr: bar, es: -1 });
    add('x-backsquat', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [{ t: 'plate', at: 'wrist', dx: -1, dy: 4, r: 8 }],
      steps: [
        { pose: top, ms: 1300, hold: 500, label: 'Kräftig aufstehen, Hüfte und Knie strecken' },
        { pose: bot, ms: 1900, hold: 700, label: 'Hüfte nach hinten, Knie beugen, Rücken bleibt gerade' },
        { pose: top, ms: 1300, hold: 300, label: 'Kräftig aufstehen, Hüfte und Knie strecken' },
        { pose: bad, ms: 1000, hold: 1100, bad: true, label: 'Falsch: Oberkörper klappt nach vorn, Fersen heben ab' }
      ] });
  })();

  /* Ausfallschritt rückwärts (same moves as the TRX version, without the straps) */
  (function () {
    var arms = [6, 48];
    var top = norm({ hip: [150, G - 71], th: 3, ankle: [150, G], ankle2: [146, G], wr: arms });
    var bot = norm({ hip: [122, G - 38], th: 8, ankle: [152, G], ankle2: [80, 161.5], fa2: 65, wr: arms });
    var bad = norm({ hip: [126, G - 38], th: 42, ankle: [152, G], ankle2: [80, 161.5], fa2: 65, wr: arms });
    add('x-lunge', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 5 }],
      steps: [
        { pose: top, ms: 1100, hold: 500, label: 'Mit der vorderen Ferse hochdrücken, Füsse zusammen' },
        { pose: bot, ms: 1500, hold: 600, label: 'Grosser Schritt nach hinten, das Knie sinkt Richtung Boden' },
        { pose: top, ms: 1100, hold: 300, label: 'Mit der vorderen Ferse hochdrücken, Füsse zusammen' },
        { pose: bad, ms: 900, hold: 1100, bad: true, label: 'Falsch: Oberkörper kippt nach vorn' }
      ] });
  })();

  /* Step-ups: the leg on the box does the work */
  (function () {
    var arms = [4, 48], box = { t: 'box', x: 178, y: 143, w: 44, h: 35 };
    var low = norm({ hip: [172, 108], th: 4, ankle: [190, 143], ankle2: [160, G], wr: arms });
    var top = norm({ hip: [196, 73], th: 3, ankle: [192, 143], ankle2: [202, 143], wr: arms });
    var bad = norm({ hip: [170, 112], th: 40, ankle: [190, 143], ankle2: [160, G], wr: arms });
    add('x-stepup', { reps: 3, hl: ['thigh', 'glute'], thumb: 0, props: [box, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 5 }],
      steps: [
        { pose: low, ms: 1200, hold: 500, label: 'Start: ganzer Fuss auf der Kiste, Oberkörper aufrecht' },
        { pose: top, ms: 1400, hold: 600, label: 'Mit dem Bein auf der Kiste hochsteigen, oben aufrecht stehen' },
        { pose: low, ms: 1400, hold: 300, label: 'Kontrolliert wieder absteigen' },
        { pose: bad, ms: 900, hold: 1100, bad: true, label: 'Falsch: Oberkörper fällt nach vorn' }
      ] });
  })();

  /* Wandsitzen: back on the wall, thighs level, knees over the ankles */
  (function () {
    var A = [148, G], wall = { t: 'box', x: 90, y: 30, w: 16, h: 148 };
    var up = norm({ hip: [110, G - 58], th: 0, ankle: A, wr: [4, 46] });
    var sit = norm({ hip: [110, G - 36], th: 0, ankle: A, wr: [24, 42] });
    var bad = norm({ hip: [110, G - 36], th: 0, ankle: [126, G], wr: [24, 42] });
    add('x-wallsit', { reps: 2, hl: ['thigh'], thumb: 1, props: [wall],
      steps: [
        { pose: up, ms: 1200, hold: 400, label: 'Mit dem Rücken an der Wand, die Füsse weit vorn' },
        { pose: sit, ms: 1600, hold: 2200, label: 'Nach unten rutschen, bis die Oberschenkel waagerecht sind, und halten' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Füsse zu nah an der Wand, die Knie schieben nach vorn' }
      ] });
  })();

  /* Wadenheben stehend: up on the toes, the toe stays where it is while the heel rises */
  (function () {
    var arms = [4, 48];
    var lo = norm({ hip: [150, G - 70], th: 2, ankle: [150, G], wr: arms });
    var hi = norm({ hip: [153, G - 80], th: 2, ankle: [154.1, G - 10], fa: 45.6, wr: arms });
    var bad = norm({ hip: [160, G - 68], th: 6, ankle: [154.1, G - 10], fa: 45.6, wr: arms });
    add('x-calf', { reps: 3, hl: ['shin'], thumb: 1, props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 5 }],
      steps: [
        { pose: lo, ms: 1500, hold: 400, label: 'Langsam ablassen, die Fersen sinken bis zum Boden' },
        { pose: hi, ms: 1100, hold: 700, label: 'Fersen hoch auf die Zehen, oben 1 Sekunde halten' },
        { pose: lo, ms: 1500, hold: 300, label: 'Langsam ablassen, die Fersen sinken bis zum Boden' },
        { pose: bad, ms: 800, hold: 1100, bad: true, label: 'Falsch: die Knie beugen sich, die Wade arbeitet kaum' }
      ] });
  })();

  /* Wadenheben sitzend: weight on the knees */
  (function () {
    var seat = { t: 'box', x: 112, y: 138, w: 52, h: 40 }, hands = [26, 40];
    var lo = norm({ hip: [140, 134], th: 0, ankle: [178, G], wr: hands });
    var hi = norm({ hip: [140, 134], th: 0, ankle: [182.2, G - 10], fa: 45.6, wr: hands });
    add('x-calfseat', { reps: 3, hl: ['shin'], thumb: 1, props: [seat, { t: 'plate', at: 'wrist', dx: 0, dy: -3, r: 7 }],
      steps: [
        { pose: lo, ms: 1500, hold: 400, label: 'Langsam ablassen, die Fersen sinken fast bis zum Boden' },
        { pose: hi, ms: 1100, hold: 700, label: 'Fersen so hoch wie möglich, oben 1 Sekunde halten' }
      ] });
  })();

  /* Einbeiniges Wadenheben: one hand on the wall, the other leg lifted behind */
  (function () {
    var wall = { t: 'box', x: 208, y: 20, w: 12, h: 158 }, hand = [46, -8];
    var lo = norm({ hip: [150, G - 70], th: 3, ankle: [150, G], ankle2: [128, G - 46], fa2: 30, wr: hand });
    var hi = norm({ hip: [153, G - 80], th: 3, ankle: [154.1, G - 10], fa: 45.6, ankle2: [131, G - 56], fa2: 30, wr: hand });
    add('x-calf1', { reps: 3, hl: ['shin'], thumb: 1, props: [wall],
      steps: [
        { pose: lo, ms: 1600, hold: 400, label: 'Langsam ablassen, die Hand an der Wand hilft nur beim Gleichgewicht' },
        { pose: hi, ms: 1200, hold: 700, label: 'Auf einem Bein hoch auf die Zehen, oben halten' }
      ] });
  })();

  /* Zehenheber: heels stay down, the toes pull up */
  (function () {
    var wall = { t: 'box', x: 92, y: 30, w: 16, h: 148 }, arms = [2, 48];
    var dn = norm({ hip: [122, G - 66], th: -12, ankle: [146, G], fa: 0, wr: arms });
    var up = norm({ hip: [122, G - 66], th: -12, ankle: [146, G], fa: -38, wr: arms });
    add('x-toeraise', { reps: 3, hl: ['shin'], thumb: 1, props: [wall],
      steps: [
        { pose: dn, ms: 1200, hold: 400, label: 'Langsam ablassen, die Fersen bleiben am Boden' },
        { pose: up, ms: 900, hold: 700, label: 'Die Zehen zur Decke ziehen, oben 1 Sekunde halten' }
      ] });
  })();

  /* Sumo-Kniebeuge (front view): wide stance, the knees follow the toes outwards, the weight hangs between the legs */
  (function () {
    var arms = [-12, -12], bell = { t: 'bell', at: 'wrL', dx: 6.6, dy: 15, r: 8 };
    var top = normF({ arms: arms, legs: [18, 18] });
    var bot = normF({ arms: arms, legs: [78, -19.5] });
    var bad = normF({ arms: arms, legs: [-12, 55] });
    add('x-sumo', { view: 'f', reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [bell],
      steps: [
        { pose: top, ms: 1100, hold: 500, label: 'Kräftig aufstehen, oben das Gesäss anspannen' },
        { pose: bot, ms: 1700, hold: 600, label: 'Tief absenken, die Knie schieben nach aussen in Richtung der Zehen' },
        { pose: top, ms: 1100, hold: 300, label: 'Kräftig aufstehen, oben das Gesäss anspannen' },
        { pose: bad, ms: 900, hold: 1100, bad: true, label: 'Falsch: Die Knie fallen nach innen' }
      ] });
  })();

  /* Bulgarische Kniebeuge: the back foot rests on a bench behind */
  (function () {
    var arms = [4, 48], bench = { t: 'box', x: 68, y: 146, w: 34, h: 32 };
    var F0 = [160, G], R0 = [92, 142];
    var top = norm({ hip: [152, 104], th: 4, ankle: F0, ankle2: R0, fa2: 170, wr: arms });
    var bot = norm({ hip: [136, 128], th: 12, ankle: F0, ankle2: R0, fa2: 170, wr: arms });
    var bad = norm({ hip: [136, 128], th: 12, ankle: [138, G], ankle2: R0, fa2: 170, wr: arms });
    add('x-bulgarian', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [bench, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 5 }],
      steps: [
        { pose: top, ms: 1200, hold: 500, label: 'Mit dem vorderen Fuss hochdrücken, aufrecht stehen' },
        { pose: bot, ms: 1700, hold: 600, label: 'Gerade nach unten sinken, das vordere Knie bleibt über dem Fuss' },
        { pose: top, ms: 1200, hold: 300, label: 'Mit dem vorderen Fuss hochdrücken, aufrecht stehen' },
        { pose: bad, ms: 900, hold: 1100, bad: true, label: 'Falsch: Der vordere Fuss steht zu nah, das Knie schiebt nach vorn' }
      ] });
  })();

  /* Beinpresse: reclined on the seat, the foot plate slides away along the rails */
  (function () {
    var H = [118, 144], dir = [Math.cos(38 * D2R), -Math.sin(38 * D2R)];
    function foot(d) { return [H[0] + d * dir[0], H[1] + d * dir[1]]; }
    var hands = [42, 16];
    var pad = { t: 'pad', at: 'ankle', dx: 5, dy: -4, ang: 128, len: 44 };
    var low = norm({ hip: H, th: -55, ankle: foot(50), fa: -128, wrist: [122, 134], ha: -55 });
    var high = norm({ hip: H, th: -55, ankle: foot(69), fa: -128, wrist: [122, 134], ha: -55 });
    var bad = norm({ hip: [118, 138], th: -35, ankle: foot(46), fa: -128, wrist: [122, 134], ha: -40, round: 9 });
    add('x-legpress', { reps: 3, hl: ['thigh', 'glute'], thumb: 0, sweep: true,
      props: [{ t: 'box', x: 96, y: 149, w: 46, h: 29 }, { t: 'rail', x1: 121, y1: 151, x2: 66, y2: 111 }, { t: 'rail', x1: 136, y1: 150, x2: 206, y2: 90 }, pad],
      steps: [
        { pose: low, ms: 1300, hold: 400, label: 'Kontrolliert ablassen, die Knie beugen sich etwa im rechten Winkel' },
        { pose: high, ms: 1100, hold: 500, label: 'Mit dem ganzen Fuss wegdrücken, die Knie nicht ganz durchdrücken' },
        { pose: low, ms: 1300, hold: 300, label: 'Kontrolliert ablassen, die Knie beugen sich etwa im rechten Winkel' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Das Gesäss hebt ab, der untere Rücken rundet sich' }
      ] });
  })();

  /* Beinstrecker: the thigh rests on the seat, the lower leg swings up */
  (function () {
    var hip = [110, 138], hands = [124, 134];
    var seat = [{ t: 'box', x: 88, y: 142, w: 50, h: 36 }, { t: 'rail', x1: 98, y1: 140, x2: 96, y2: 66 }];
    var pad = { t: 'plate', at: 'ankle', dx: 1, dy: -7, r: 5 };
    var dn = norm({ hip: hip, th: -6, ankle: [146, 172], wrist: hands, ha: -6 });
    var up = norm({ hip: hip, th: -6, ankle: [180, 134], wrist: hands, ha: -6 });
    add('x-legext', { reps: 3, hl: ['thigh'], thumb: 1, sweep: true, props: seat.concat([pad]),
      steps: [
        { pose: dn, ms: 1700, hold: 400, label: 'Langsam ablassen, etwa 3 Sekunden' },
        { pose: up, ms: 1100, hold: 700, label: 'Das Bein strecken, oben 1 Sekunde halten' }
      ] });
  })();

  /* Beinbeuger liegend: face down on the bench, the heels go to the buttocks */
  (function () {
    var hip = [92, 140.5], sh = [138, 140.5];
    var props = [{ t: 'box', x: 52, y: 144, w: 100, h: 34 }, { t: 'plate', at: 'ankle', dx: 3, dy: -4, r: 6 }];
    var out = norm({ hip: hip, th: 90, ankle: [22, 141], wrist: [180, 146], ha: 75 });
    var curl = norm({ hip: hip, th: 90, ankle: [60, 106], wrist: [180, 146], ha: 75 });
    var bad = norm({ hip: [92, 130], th: 86, ankle: [60, 98], wrist: [180, 146], ha: 75, round: -9 });
    add('x-legcurl', { reps: 3, hl: ['thigh'], thumb: 1, sweep: true, props: props,
      steps: [
        { pose: out, ms: 1700, hold: 400, label: 'Langsam strecken, die Hüfte bleibt flach auf der Bank' },
        { pose: curl, ms: 1100, hold: 700, label: 'Die Fersen zum Gesäss ziehen, oben 1 Sekunde halten' },
        { pose: out, ms: 1700, hold: 300, label: 'Langsam strecken, die Hüfte bleibt flach auf der Bank' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Hüfte hebt ab, Hohlkreuz' }
      ] });
  })();

  /* Einbeiniges Kreuzheben: back and free leg form one line, the weight hangs down */
  (function () {
    var A = [150, G], arm = [2, 48];
    var top = norm({ hip: [150, G - 71], th: 3, ankle: A, ankle2: [146, G], wr: [8, 46] });
    var bot = norm({ hip: [136, G - 68], th: 80, ankle: A, ankle2: [67, 94], fa2: 85, wr: arm });
    var bad = norm({ hip: [136, G - 68], th: 80, ankle: A, ankle2: [67, 94], fa2: 85, wr: arm, round: 14, ha: 92 });
    add('x-slrdl', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, sweep: true, props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 5 }],
      steps: [
        { pose: top, ms: 1200, hold: 500, label: 'Aufrichten, die Hüfte nach vorn schieben, das Bein zurückholen' },
        { pose: bot, ms: 1700, hold: 700, label: 'Hüfte nach hinten, Rücken und freies Bein bilden eine Linie' },
        { pose: top, ms: 1200, hold: 300, label: 'Aufrichten, die Hüfte nach vorn schieben, das Bein zurückholen' },
        { pose: bad, ms: 1100, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund' }
      ] });
  })();

  /* Seitliche Ausfallschritte (front view): one leg steps out, the other stays straight, hands together at the chest */
  (function () {
    var hands = [10, -65], plate = { t: 'plate', at: 'wrL', dx: 0, dy: 0, r: 6 };
    var together = normF({ px: 140, arms: hands, legs: [0, 0] });
    var lunge = normF({ px: 189, lean: 4, arms: hands, legL: [42.9, 42.9], legR: [62, -4] });
    add('x-latlunge', { view: 'f', reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [plate],
      steps: [
        { pose: together, ms: 1100, hold: 500, label: 'Vom Schrittbein abdrücken, die Füsse zusammenstellen' },
        { pose: lunge, ms: 1500, hold: 700, label: 'Grosser Schritt zur Seite, die Hüfte nach hinten, ein Bein bleibt gestreckt' }
      ] });
  })();

  /* Kettlebell-Swing: one smooth pendulum. The arms stay straight all the way (aa: the arm angle, so the elbow never bends between two poses),
     the hips lead and the arms and the bell follow a little later; the bell hangs off the hands. Many short steps without slowing down (flow)
     make it one movement; three swings in a row, then the wrong one. */
  (function () {
    var A = [150, G], N = 24, bell = { t: 'bell', at: 'wrist', along: 13, r: 8 };
    function at(u) {                                   // u = 0: back, the bell between the legs; 0.5: the top; 1: back again
      var s = 0.5 - 0.5 * Math.cos(2 * Math.PI * u), h = 0.5 - 0.5 * Math.cos(2 * Math.PI * (u + 0.05));
      return norm({ hip: [128 + 24 * h, G - 64 - 6 * h], th: 62 - 60 * h, ankle: A, aa: -39 + 119 * s, ha: 40 - 38 * h });
    }
    function label(u) {
      if (u < 0.06 || u >= 0.94) return 'Hüfte nach hinten, die Kugel schwingt zwischen den Beinen durch';
      if (u < 0.36) return 'Die Hüfte kräftig nach vorn schieben, die Arme bleiben gestreckt';
      if (u < 0.6) return 'Oben aufrecht, die Kugel schwebt bis auf Brusthöhe';
      return 'Die Kugel fällt zurück, die Hüfte geht wieder nach hinten';
    }
    var steps = [], c, k;
    for (c = 0; c < 3; c++) for (k = 0; k < N; k++) steps.push({ pose: at(k / N), ms: 75, hold: 0, flow: true, label: label(k / N) });
    steps.push({ pose: norm({ hip: [158, G - 68], th: -14, ankle: A, aa: 85, ha: -10 }), ms: 700, hold: 1200, bad: true, label: 'Falsch: Oben ins Hohlkreuz gelehnt' });
    add('x-swing', { reps: 1, hl: ['glute', 'thigh'], thumb: 12, sweep: true, props: [bell], steps: steps });
  })();

  /* TRX-Kniebeuge: straps hold the hands, the legs do the work */
  (function () {
    var A = [150, G], AN = [250, 10];
    var top = norm({ hip: [148, G - 70], th: -4, ankle: A, wrist: [186, 84] });
    var bot = norm({ hip: [122, G - 38], th: 10, ankle: A, wrist: [176, 86] });
    add('x-trxsquat', { reps: 3, hl: ['thigh', 'glute'], thumb: 1,
      props: [{ t: 'anchor', x: AN[0], y: AN[1] - 3 }, { t: 'strap', anchor: [AN[0], AN[1] + 2], at: 'wrist' }],
      steps: [
        { pose: top, ms: 1100, hold: 500, label: 'Mit den Beinen hochdrücken, die Gurte bleiben gespannt' },
        { pose: bot, ms: 1600, hold: 600, label: 'Hüfte nach hinten und unten, die Arme helfen nur beim Gleichgewicht' }
      ] });
  })();

  /* ===== Gesäss ===== */

  /* Gesässbrücke: shoulders stay on the floor, the hips rise until shoulder, hip and knee form one line */
  (function () {
    var S0 = [100, 173], A = [174, G], hand = [150, 173];
    var down = norm({ sh: S0, th: -90, ankle: A, wrist: hand, ha: -62 });
    var up = norm({ sh: S0, th: -115.2, ankle: A, wrist: hand, ha: -62 });
    var bad = norm({ sh: S0, th: -128, ankle: A, wrist: hand, ha: -62, round: -8 });
    add('x-bridge', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, sweep: true, props: [],
      steps: [
        { pose: down, ms: 1500, hold: 400, label: 'Langsam ablassen, die Schultern bleiben am Boden' },
        { pose: up, ms: 1100, hold: 900, label: 'Hüfte hochdrücken, oben das Gesäss fest anspannen' },
        { pose: down, ms: 1500, hold: 300, label: 'Langsam ablassen, die Schultern bleiben am Boden' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, die Hüfte ist zu hoch' }
      ] });
  })();

  /* Einbeinige Gesässbrücke: the free leg stays up, the supporting foot pushes */
  (function () {
    var S0 = [100, 173], A = [174, G], hand = [150, 173], free = [199, 128];
    var down = norm({ sh: S0, th: -90, ankle: A, ankle2: free, fa2: -60, wrist: hand, ha: -62 });
    var up = norm({ sh: S0, th: -115.2, ankle: A, ankle2: free, fa2: -60, wrist: hand, ha: -62 });
    add('x-bridge1', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, sweep: true, props: [],
      steps: [
        { pose: down, ms: 1500, hold: 400, label: 'Langsam ablassen, das freie Bein bleibt oben' },
        { pose: up, ms: 1200, hold: 900, label: 'Mit dem Standbein hochdrücken, oben das Gesäss anspannen' }
      ] });
  })();

  /* Donkey Kicks: on all fours, the bent leg presses back and up */
  (function () {
    var H = [110, 137], sh = [154.6, 125.9], hand = [154.6, 173];
    var tab = norm({ hip: H, sh: sh, ankle: [74, 173.5], ankle2: [74, 173.5], fa: 0, fa2: 0, wrist: hand, ha: 62 });
    var kick = norm({ hip: H, sh: sh, ankle: [74, 104], fa: 180, ankle2: [74, 173.5], fa2: 0, wrist: hand, ha: 62 });
    var bad = norm({ hip: [110, 133], sh: [154.6, 122], ankle: [70, 92], fa: 180, ankle2: [74, 173.5], fa2: 0, wrist: [154.6, 171], ha: 62, round: -9 });
    add('x-donkey', { reps: 3, hl: ['glute', 'thigh'], thumb: 1, sweep: true, props: [],
      steps: [
        { pose: tab, ms: 1300, hold: 300, label: 'Zurück in den Vierfüsslerstand, der Rücken bleibt flach' },
        { pose: kick, ms: 1000, hold: 700, label: 'Das Bein nach hinten oben drücken, die Fusssohle zeigt zur Decke' },
        { pose: tab, ms: 1300, hold: 300, label: 'Zurück in den Vierfüsslerstand, der Rücken bleibt flach' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, das Bein schwingt zu hoch' }
      ] });
  })();

  /* Kabel-Kickback: bent forward at the machine, the leg with the cuff goes back */
  (function () {
    var PU = [218, 166], hold = [206, 90];
    var rest = norm({ hip: [142, G - 70], th: 35, ankle: [138, G - 4], ankle2: [150, G], wrist: hold });
    var kick = norm({ hip: [142, G - 70], th: 35, ankle: [78, G - 70], ankle2: [150, G], wrist: hold });
    var bad = norm({ hip: [146, G - 70], th: 12, ankle: [76, G - 84], ankle2: [150, G], wrist: [200, 66], round: -8 });
    add('x-kickback', { reps: 3, hl: ['glute'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 212, y: 30, w: 12, h: 148 }, { t: 'pulley', x: PU[0], y: PU[1] }, { t: 'strap', anchor: PU, at: 'ankle' }],
      steps: [
        { pose: rest, ms: 1300, hold: 300, label: 'Langsam zurückführen, das Gewicht nicht absetzen' },
        { pose: kick, ms: 1000, hold: 700, label: 'Das Bein nach hinten drücken, oben das Gesäss anspannen' },
        { pose: rest, ms: 1300, hold: 300, label: 'Langsam zurückführen, das Gewicht nicht absetzen' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, das Bein wird mit Schwung hochgerissen' }
      ] });
  })();

  /* Seitliches Beinheben (front view, lying on the side): the top leg lifts */
  (function () {
    var arms = [10, 10];
    var low = normF({ rot: 90, arms: arms, legs: [0, 0] });
    var up = normF({ rot: 90, arms: arms, legL: [38, 38], legR: [0, 0] });
    var bad = normF({ rot: 106, arms: arms, legL: [62, 62], legR: [0, 0] });
    add('x-sidelegraise', { view: 'f', reps: 3, hl: ['glute', 'thigh'], thumb: 1, props: [],
      steps: [
        { pose: low, ms: 1400, hold: 300, label: 'Langsam ablassen, der Körper bleibt in einer Linie' },
        { pose: up, ms: 1100, hold: 700, label: 'Das obere Bein gestreckt anheben, die Zehen zeigen nach vorn' },
        { pose: low, ms: 1400, hold: 300, label: 'Langsam ablassen, der Körper bleibt in einer Linie' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Das Bein ist zu hoch, der Rumpf kippt nach hinten' }
      ] });
  })();

  /* Monster Walk (front view): a band around the ankles stays tight while one foot steps out */
  (function () {
    var stance = normF({ legs: [22, 6] });
    var step = normF({ legL: [22, 6], legR: [38, 20] });
    add('x-monster', { view: 'f', reps: 3, hl: ['thigh', 'glute'], thumb: 1, props: [{ t: 'link', a: 'anL', b: 'anR', band: true }],
      steps: [
        { pose: stance, ms: 800, hold: 300, label: 'Leicht in die Knie, das Band ist gespannt' },
        { pose: step, ms: 900, hold: 500, label: 'Kleiner Schritt zur Seite, das Band bleibt gespannt' },
        { pose: stance, ms: 800, hold: 300, label: 'Den anderen Fuss nachsetzen, die Knie fallen nicht nach innen' }
      ] });
  })();

  /* ===== Rücken ===== */

  /* Klimmzug: hands on a bar that sticks out of the wall, the shoulders pivot, the knees are bent behind */
  (function () {
    var W = [152, 30];
    var hang = norm({ sh: [148, 79], th: 0, ankle: [126, 160], fa: 100, wrist: W, ha: 0 });
    var top = norm({ sh: [144, 33], th: -10, ankle: [128, 114], fa: 100, wrist: W, ha: -2 });
    var bad = norm({ sh: [144, 50], th: -35, ankle: [196, 120], fa: 40, wrist: W, ha: -20 });
    add('x-pullup', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'rail', x1: 226, y1: 8, x2: 226, y2: 178 }, { t: 'rail', x1: 226, y1: 30, x2: 152, y2: 30 }],
      steps: [
        { pose: hang, ms: 1700, hold: 400, label: 'Langsam ablassen, bis die Arme gestreckt sind' },
        { pose: top, ms: 1300, hold: 600, label: 'Ellbogen nach unten ziehen, bis das Kinn über der Stange ist' },
        { pose: hang, ms: 1700, hold: 300, label: 'Langsam ablassen, bis die Arme gestreckt sind' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Mit Schwung und den Beinen hochkippen' }
      ] });
  })();

  /* Latziehen: seated under a thigh pad, the bar comes down to the upper chest */
  (function () {
    var H = [100, 145], A = [150, G];
    var up = norm({ hip: H, th: -10, ankle: A, wrist: [102, 53], ha: -6 });
    var dn = norm({ hip: H, th: -15, ankle: A, wrist: [112, 98], ha: -8 });
    var bad = norm({ hip: H, th: -36, ankle: A, wrist: [114, 100], ha: -20 });
    var P = [118, 12];
    add('x-pulldown', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 82, y: 147, w: 44, h: 31 }, { t: 'rail', x1: 190, y1: 12, x2: 190, y2: 178 }, { t: 'rail', x1: 190, y1: 12, x2: P[0], y2: P[1] },
        { t: 'pulley', x: P[0], y: P[1] }, { t: 'pad', at: 'knee', dx: 0, dy: -6, ang: 0, len: 26 }, { t: 'strap', anchor: P, at: 'wrist' }],
      steps: [
        { pose: up, ms: 1500, hold: 400, label: 'Langsam nach oben gleiten lassen, bis die Arme gestreckt sind' },
        { pose: dn, ms: 1200, hold: 600, label: 'Die Stange zur oberen Brust ziehen, Ellbogen nach unten' },
        { pose: up, ms: 1500, hold: 300, label: 'Langsam nach oben gleiten lassen, bis die Arme gestreckt sind' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Mit dem Oberkörper weit nach hinten geschwungen' }
      ] });
  })();

  /* Rudern sitzend am Kabel: feet on the plate, upright back, the handle comes to the belly */
  (function () {
    var H = [100, 140], A = [158, 172], PU = [204, 152];
    var out = norm({ hip: H, th: 0, ankle: A, fa: -60, wrist: [146, 104], ha: 0 });
    var row = norm({ hip: H, th: -6, ankle: A, fa: -60, wrist: [109, 122], ha: -3 });
    var bad = norm({ hip: H, th: -30, ankle: A, fa: -60, wrist: [111, 124], ha: -15 });
    add('x-cablerow', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 76, y: 144, w: 50, h: 34 }, { t: 'box', x: 164, y: 150, w: 8, h: 28 }, { t: 'rail', x1: PU[0], y1: PU[1], x2: PU[0], y2: 178 },
        { t: 'pulley', x: PU[0], y: PU[1] }, { t: 'strap', anchor: PU, at: 'wrist' }],
      steps: [
        { pose: out, ms: 1400, hold: 400, label: 'Langsam nach vorn gleiten lassen, der Rücken bleibt gerade' },
        { pose: row, ms: 1100, hold: 600, label: 'Ellbogen eng nach hinten, die Schulterblätter zusammen' },
        { pose: out, ms: 1400, hold: 300, label: 'Langsam nach vorn gleiten lassen, der Rücken bleibt gerade' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Mit dem Oberkörper nach hinten geschaukelt' }
      ] });
  })();

  /* Vorgebeugtes Rudern mit der Langhantel: hinge forward, the bar goes to the belly */
  (function () {
    var A = [150, G];
    var hang = norm({ hip: [122, G - 64], th: 50, ankle: A, wrist: [157.2, 128.4], ha: 38 });
    var pull = norm({ hip: [122, G - 64], th: 50, ankle: A, wrist: [138, 108], ha: 38 });
    var bad = norm({ hip: [122, G - 64], th: 50, ankle: A, wrist: [165.2, 127.4], round: 14, ha: 75 });
    add('x-bbrow', { reps: 3, hl: ['torso', 'upper'], thumb: 1,
      props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 10 }],
      steps: [
        { pose: hang, ms: 1600, hold: 400, label: 'Langsam ablassen, die Arme hängen gestreckt' },
        { pose: pull, ms: 1100, hold: 600, label: 'Die Stange zum Bauchnabel ziehen, die Ellbogen eng' },
        { pose: hang, ms: 1600, hold: 300, label: 'Langsam ablassen, die Arme hängen gestreckt' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund' }
      ] });
  })();

  /* Einarmiges Kurzhantelrudern: hand and knee on the bench, the free arm rows to the hip */
  (function () {
    var H = [112, 108], A = [96, G], A2 = [82, 138], hand = [162, 144];
    var pose = function (wr, extra) { return norm(Object.assign({ hip: H, th: 75, ankle: A, ankle2: A2, fa: 0, fa2: 170, wr: wr, wrist2: hand, ha: 70, es2: 1 }, extra || {})); };
    var down = pose([-8, 46]), row = pose([-30, 16]), bad = pose([-8, 46], { round: 12, ha: 90 });
    add('x-dbrow', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 60, y: 146, w: 122, h: 32 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 }],
      steps: [
        { pose: down, ms: 1500, hold: 400, label: 'Langsam ablassen, der Arm hängt gestreckt' },
        { pose: row, ms: 1100, hold: 600, label: 'Die Hantel zur Hüfte ziehen, der Ellbogen geht nach hinten' },
        { pose: down, ms: 1500, hold: 300, label: 'Langsam ablassen, der Arm hängt gestreckt' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund' }
      ] });
  })();

  /* Kreuzheben: bar over the middle of the foot, the legs push the floor away, lock out standing */
  (function () {
    var A = [150, G];
    var set = norm({ hip: [124, 129], th: 72, ankle: A, wrist: [160, 162], ha: 55 });
    var mid = norm({ hip: [138, 114], th: 45, ankle: A, wrist: [156, 124], ha: 30 });
    var top = norm({ hip: [150, G - 70], th: 3, ankle: A, wrist: [153.4, 106], ha: 2 });
    var bad = norm({ hip: [124, 129], th: 72, ankle: A, wrist: [160, 162], round: 14, ha: 85 });
    add('x-deadlift', { reps: 3, hl: ['torso', 'thigh', 'glute'], thumb: 0, sweep: true,
      props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 4, r: 9 }],
      steps: [
        { pose: set, ms: 1400, hold: 500, label: 'Stange nah am Körper absenken, der Rücken bleibt gerade' },
        { pose: mid, ms: 900, hold: 0, label: 'Mit den Beinen wegdrücken, die Stange gleitet an den Beinen hoch' },
        { pose: top, ms: 800, hold: 700, label: 'Oben aufrecht stehen und das Gesäss anspannen' },
        { pose: mid, ms: 900, hold: 0, label: 'Zuerst die Hüfte nach hinten, die Stange gleitet an den Oberschenkeln hinunter' },
        { pose: set, ms: 700, hold: 300, label: 'Stange nah am Körper absenken, der Rücken bleibt gerade' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund' }
      ] });
  })();

  /* Superman: lying on the belly, arms, chest and legs come up together */
  (function () {
    var H = [110, 170];
    var down = norm({ hip: H, th: 90, ankle: [38.2, 172], fa: 170, wrist: [204, 172], ha: 80, es: -1 });
    var up = norm({ hip: H, th: 72, ankle: [41, 151], fa: 170, wrist: [200, 142], ha: 68, es: -1 });
    var bad = norm({ hip: H, th: 50, ankle: [45, 139.5], fa: 170, wrist: [188, 120], ha: 22, round: -10, es: -1 });
    add('x-superman', { reps: 3, hl: ['torso', 'glute'], thumb: 1, sweep: true,
      steps: [
        { pose: down, ms: 1400, hold: 400, label: 'Langsam ablegen, der Kopf bleibt in Verlängerung der Wirbelsäule' },
        { pose: up, ms: 1100, hold: 900, label: 'Arme, Brust und Beine nur ein Stück anheben, Blick zum Boden' },
        { pose: down, ms: 1400, hold: 300, label: 'Langsam ablegen, der Kopf bleibt in Verlängerung der Wirbelsäule' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu hoch, der Kopf im Nacken' }
      ] });
  })();

  /* Vogel-Hund: on all fours, one arm and the opposite leg reach out */
  (function () {
    var H = [110, 137], SH = [154.6, 125.9], hand = [154.6, 173], knee = [74, 173.5];
    var tab = norm({ hip: H, sh: SH, ankle: knee, ankle2: knee, fa: 0, fa2: 0, wrist: hand, wrist2: hand, ha: 62 });
    var reach = norm({ hip: H, sh: SH, ankle: knee, ankle2: [40, 131], fa: 0, fa2: 170, wrist: [203, 126], wrist2: hand, ha: 62 });
    var bad = norm({ hip: [110, 134], sh: [154.6, 124.2], ankle: knee, ankle2: [42, 118], fa: 0, fa2: 170, wrist: [200, 110], wrist2: [154.6, 172.5], ha: 40, round: -9 });
    add('x-birddog', { reps: 3, hl: ['torso', 'glute'], thumb: 1, sweep: true,
      steps: [
        { pose: tab, ms: 1300, hold: 300, label: 'Zurück in den Vierfüsslerstand, der Rücken bleibt flach' },
        { pose: reach, ms: 1300, hold: 900, label: 'Arm und gegenüberliegendes Bein strecken, das Becken bleibt ruhig' },
        { pose: tab, ms: 1300, hold: 300, label: 'Zurück in den Vierfüsslerstand, der Rücken bleibt flach' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, das Bein geht zu hoch' }
      ] });
  })();

  /* Katze und Kuh: on all fours the back rounds and then sags */
  (function () {
    var H = [110, 137], SH = [154.6, 125.9], hand = [154.6, 173], knee = [74, 173.5];
    var pose = function (round, ha) { return norm({ hip: H, sh: SH, ankle: knee, fa: 0, wrist: hand, ha: ha, round: round }); };
    var neutral = pose(0, 62), cat = pose(14, 100), cow = pose(-10, 36);
    add('x-catcow', { reps: 3, hl: ['torso'], thumb: 1, sweep: true,
      steps: [
        { pose: neutral, ms: 900, hold: 200, label: 'Vierfüsslerstand, der Rücken ist gerade' },
        { pose: cat, ms: 1700, hold: 500, label: 'Katze: ausatmen, den Rücken rund machen, das Kinn Richtung Brust' },
        { pose: cow, ms: 1700, hold: 500, label: 'Kuh: einatmen, den Bauch sinken lassen, die Brust nach vorn heben' }
      ] });
  })();

  /* Rudern mit Band: seated on the floor, the band runs around the feet */
  (function () {
    var H = [100, 170], A = [170, 172], F = [172, 167];
    var out = norm({ hip: H, th: 0, ankle: A, fa: -80, wrist: [146, 140], ha: 0 });
    var row = norm({ hip: H, th: 0, ankle: A, fa: -80, wrist: [110, 152], ha: 0 });
    var bad = norm({ hip: H, th: -30, ankle: A, fa: -80, wrist: [108, 150], ha: -15 });
    add('x-bandrow', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'strap', anchor: F, at: 'wrist', band: true }],
      steps: [
        { pose: out, ms: 1400, hold: 400, label: 'Langsam nach vorn gleiten lassen, aufrecht bleiben' },
        { pose: row, ms: 1000, hold: 600, label: 'Ellbogen eng nach hinten, die Schulterblätter zusammen' },
        { pose: out, ms: 1400, hold: 300, label: 'Langsam nach vorn gleiten lassen, aufrecht bleiben' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Mit dem Oberkörper weit zurückgelehnt' }
      ] });
  })();

  /* Band auseinanderziehen (front view): the arms stay straight at shoulder height and the band is pulled wide */
  (function () {
    var start = normF({ arms: [20, -140] });
    var wide = normF({ arms: [90, 90] });
    var shrug = normF({ arms: [90, 90], sh: 9 });
    add('x-pullapart', { view: 'f', reps: 3, hl: ['trap', 'upper'], thumb: 1, props: [{ t: 'link', a: 'wrL', b: 'wrR', band: true }],
      steps: [
        { pose: start, ms: 1200, hold: 300, label: 'Das Band mit beiden Händen vor der Brust halten' },
        { pose: wide, ms: 1300, hold: 800, label: 'Die Arme auseinander ziehen, die Schulterblätter zusammen' },
        { pose: start, ms: 1200, hold: 300, label: 'Das Band mit beiden Händen vor der Brust halten' },
        { pose: shrug, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Schultern wandern zu den Ohren' }
      ] });
  })();

  /* ===== Brust ===== */

  /* Liegestütze auf den Knien: the body pivots about the knees, the hands stay put */
  (function () {
    var K = [100, 172], hand = [171.5, 171], ank = [K[0] - 23.1, K[1] - 27.6];
    function kb(a, extra) {
      var u = [Math.cos(a * D2R), -Math.sin(a * D2R)];
      return norm(Object.assign({ hip: [K[0] + 36 * u[0], K[1] + 36 * u[1]], sh: [K[0] + 82 * u[0], K[1] + 82 * u[1]], ankle: ank, fa: 200, wrist: hand }, extra || {}));
    }
    var up = kb(37), dn = kb(11);
    var bad = norm({ hip: [K[0] + 36 * Math.cos(55 * D2R), K[1] - 36 * Math.sin(55 * D2R)], sh: [K[0] + 36 * Math.cos(55 * D2R) + 46 * Math.cos(20 * D2R), K[1] - 36 * Math.sin(55 * D2R) - 46 * Math.sin(20 * D2R)], ankle: ank, fa: 200, wrist: hand });
    add('x-pushup-knee', { reps: 2, hl: ['torso', 'upper', 'fore'], thumb: 0, props: [],
      steps: [
        { pose: up, ms: 900, hold: 500, label: 'Kräftig hochdrücken, vom Kopf bis zu den Knien eine Linie' },
        { pose: dn, ms: 1500, hold: 400, label: 'Brust Richtung Boden, Ellbogen schräg nach hinten' },
        { pose: up, ms: 900, hold: 300, label: 'Kräftig hochdrücken, vom Kopf bis zu den Knien eine Linie' },
        { pose: bad, ms: 800, hold: 1100, bad: true, label: 'Falsch: Das Gesäss ragt nach oben' }
      ] });
  })();

  /* Liegestütze mit erhöhten Händen: hands on a bench, straight body from the feet */
  (function () {
    var A = [56, G - 12], W = [153, 128];
    var up = norm({ ankle: A, lean: 48, fa: 70, wrist: W });
    var dn = norm({ ankle: A, lean: 66, fa: 70, wrist: W });
    var b = bendBody(A, [A[0] + 116 * Math.sin(48 * D2R), A[1] - 116 * Math.cos(48 * D2R)], 1);      // the hip drops below the line, the lengths stay exact
    var sag = norm({ ankle: A, lean: b.lean, torso: b.torso, fa: 70, wrist: W });
    add('x-pushup-incl', { reps: 2, hl: ['torso', 'upper', 'fore'], thumb: 0, props: [{ t: 'box', x: 135, y: 130, w: 42, h: 48 }],
      steps: [
        { pose: up, ms: 900, hold: 500, label: 'Kräftig hochdrücken, der Körper bleibt eine Linie' },
        { pose: dn, ms: 1500, hold: 400, label: 'Brust zur Kante senken, Ellbogen schräg nach hinten' },
        { pose: up, ms: 900, hold: 300, label: 'Kräftig hochdrücken, der Körper bleibt eine Linie' },
        { pose: sag, ms: 800, hold: 1100, bad: true, label: 'Falsch: Der Bauch hängt durch' }
      ] });
  })();

  /* Bankdrücken mit der Langhantel: flat bench, the bar goes from the chest straight up */
  (function () {
    var S = [80, 141], A = [168, G];
    var pose = function (wrist, extra) { return norm(Object.assign({ sh: S, th: -90, ankle: A, wrist: wrist, ha: -70 }, extra || {})); };
    var up = pose([88, 94]), dn = pose([95, 132]), bad = pose([95, 128], { th: -110, round: -8 });
    add('x-bench', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 60, y: 144.5, w: 100, h: 33.5 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 9 }],
      steps: [
        { pose: up, ms: 1100, hold: 500, label: 'Kräftig hochdrücken, bis die Arme fast gestreckt sind' },
        { pose: dn, ms: 1700, hold: 400, label: 'Die Stange kontrolliert zur Brustmitte senken' },
        { pose: up, ms: 1100, hold: 300, label: 'Kräftig hochdrücken, bis die Arme fast gestreckt sind' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Das Gesäss hebt ab, Hohlkreuz' }
      ] });
  })();

  /* Bankdrücken mit Kurzhanteln: flat on the bench, the same movement as with the barbell, the dumbbells go straight up from the chest */
  (function () {
    var S = [80, 141], A = [168, G];
    var pose = function (wrist, extra) { return norm(Object.assign({ sh: S, th: -90, ankle: A, wrist: wrist, ha: -70 }, extra || {})); };
    var up = pose([88, 94]), dn = pose([95, 132]), bad = pose([95, 128], { th: -110, round: -8 });
    add('x-dbpress', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 60, y: 144.5, w: 100, h: 33.5 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 7 }],
      steps: [
        { pose: up, ms: 1100, hold: 500, label: 'Die Hanteln hochdrücken, bis die Arme fast gestreckt sind' },
        { pose: dn, ms: 1700, hold: 400, label: 'Die Hanteln kontrolliert zur Brust senken' },
        { pose: up, ms: 1100, hold: 300, label: 'Die Hanteln hochdrücken, bis die Arme fast gestreckt sind' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Das Gesäss hebt ab, Hohlkreuz' }
      ] });
  })();

  /* Brustpresse an der Maschine: seated in the machine, the back against the pad. The frame stands around the seat, the grips slide along a
     horizontal guide at chest height and are pushed straight away from the chest. */
  (function () {
    var H = [100, 145], A = [150, G];
    var sh = [H[0] + 46 * Math.sin(-4 * D2R), H[1] - 46 * Math.cos(-4 * D2R)], gy = sh[1] + 16;      // the grips stay at this height
    var pose = function (dx, extra) { return norm(Object.assign({ hip: H, th: -4, ankle: A, wrist: [sh[0] + dx, gy], ha: -2 }, extra || {})); };
    var start = pose(17), press = pose(46);
    var shB = [H[0] + 46 * Math.sin(15 * D2R), H[1] - 46 * Math.cos(15 * D2R)];
    var bad = norm({ hip: H, th: 15, ankle: A, wrist: [shB[0] + 34, gy], ha: 28 });
    add('x-chestpress', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 40, y: 98, w: 24, h: 80 }, { t: 'rail', x1: 70, y1: 178, x2: 70, y2: 58 }, { t: 'rail', x1: 70, y1: 58, x2: 196, y2: 58 }, { t: 'rail', x1: 196, y1: 58, x2: 196, y2: 178 },
        { t: 'box', x: 78, y: 150, w: 44, h: 28 }, { t: 'rail', x1: 91, y1: 152, x2: 88, y2: 80 }, { t: 'rail', x1: 104, y1: gy, x2: 196, y2: gy },
        { t: 'pad', at: 'wrist', dx: 0, dy: 0, ang: 90, len: 20 }],
      steps: [
        { pose: start, ms: 1500, hold: 400, label: 'Die Griffe kontrolliert zur Brust zurückkommen lassen, der Rücken bleibt am Polster' },
        { pose: press, ms: 1100, hold: 500, label: 'Die Griffe gleichmässig von der Brust wegdrücken, nicht ganz durchstrecken' },
        { pose: start, ms: 1500, hold: 300, label: 'Die Griffe kontrolliert zur Brust zurückkommen lassen, der Rücken bleibt am Polster' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Der Rücken löst sich vom Polster, die Schultern rollen nach vorn' }
      ] });
  })();

  /* Kabel-Fly von oben (front view): the hands come together in front of the body */
  (function () {
    var wide = normF({ arms: [100, 115] });
    var mid = normF({ arms: [50, 50] });
    var closed = normF({ arms: [-20, -20] });
    var shrug = normF({ arms: [-20, -20], sh: 9 });
    add('x-cablefly', { view: 'f', reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'pulley', x: 62, y: 14 }, { t: 'pulley', x: 258, y: 14 }, { t: 'strap', anchor: [62, 14], at: 'wrL' }, { t: 'strap', anchor: [258, 14], at: 'wrR' }],
      steps: [
        { pose: wide, ms: 1500, hold: 400, label: 'Langsam öffnen, die Arme bleiben leicht gebeugt' },
        { pose: mid, ms: 600, hold: 0, label: 'Die Hände in einem weiten Bogen nach unten führen' },
        { pose: closed, ms: 600, hold: 700, label: 'Vor dem Körper zusammenführen, die Brust anspannen' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam wieder öffnen' },
        { pose: wide, ms: 700, hold: 300, label: 'Langsam öffnen, die Arme bleiben leicht gebeugt' },
        { pose: shrug, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Schultern wandern zu den Ohren' }
      ] });
  })();

  /* Dips an der Bank: hands on the edge behind, the body goes down in front of the bench */
  (function () {
    var A = [150, G], W = [96, 128];
    var up = norm({ sh: [98, 80], th: -6, ankle: A, wrist: W, ha: -4 });
    var dn = norm({ sh: [98, 105], th: -6, ankle: A, wrist: W, ha: -4 });
    var bad = norm({ sh: [100, 118], th: -6, ankle: A, wrist: W, ha: -2 });
    add('x-dips', { reps: 3, hl: ['upper', 'torso'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 40, y: 130, w: 60, h: 48 }],
      steps: [
        { pose: up, ms: 1000, hold: 400, label: 'Hochdrücken, die Ellbogen nicht hart durchstrecken' },
        { pose: dn, ms: 1500, hold: 400, label: 'Die Ellbogen nach hinten beugen, bis sie etwa 90 Grad haben' },
        { pose: up, ms: 1000, hold: 300, label: 'Hochdrücken, die Ellbogen nicht hart durchstrecken' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu tief, die Schultern rutschen unter die Ellbogen' }
      ] });
  })();

  /* Medizinball-Brustpass: the ball goes from the chest to the wall */
  (function () {
    var A = [150, G], ball = { t: 'ball', at: 'wrist', dx: 9, dy: 0, r: 10 };
    var chest = norm({ hip: [146, G - 66], th: 8, ankle: A, wrist: [168, 76], ha: 4 });
    var pass = norm({ hip: [146, G - 66], th: 8, ankle: A, wrist: [200, 64], ha: 4 });
    var bad = norm({ hip: [140, G - 64], th: 35, ankle: A, wrist: [184, 100], round: 10, ha: 40 });
    add('x-medpass', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'rail', x1: 236, y1: 10, x2: 236, y2: 178 }, ball],
      steps: [
        { pose: chest, ms: 1200, hold: 400, label: 'Den Ball weich fangen und vor die Brust nehmen' },
        { pose: pass, ms: 450, hold: 400, label: 'Beine und Arme gleichzeitig strecken, den Ball kräftig an die Wand werfen' },
        { pose: chest, ms: 1200, hold: 300, label: 'Den Ball weich fangen und vor die Brust nehmen' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund, der Ball geht nach unten' }
      ] });
  })();

  /* ===== Schultern ===== */

  /* Schulterdrücken stehend mit Kurzhanteln */
  (function () {
    var A = [150, G], plate = { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 };
    var low = norm({ hip: [150, G - 68], th: 2, ankle: A, wrist: [167, 48], ha: 2 });
    var high = norm({ hip: [150, G - 68], th: 2, ankle: A, wrist: [156, 14], ha: 2 });
    var bad = norm({ hip: [152, G - 68], th: -16, ankle: A, wrist: [155, 16], ha: -10 });
    add('x-ohp', { reps: 3, hl: ['delt', 'upper'], thumb: 1, sweep: true, props: [plate],
      steps: [
        { pose: low, ms: 1500, hold: 400, label: 'Langsam zu den Schultern senken' },
        { pose: high, ms: 1100, hold: 600, label: 'Gerade nach oben drücken, bis die Arme gestreckt sind' },
        { pose: low, ms: 1500, hold: 300, label: 'Langsam zu den Schultern senken' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Ins Hohlkreuz gelehnt' }
      ] });
  })();

  /* Seitheben (front view) */
  (function () {
    var plates = [{ t: 'plate', at: 'wrL', dx: 0, dy: 0, r: 5 }, { t: 'plate', at: 'wrR', dx: 0, dy: 0, r: 5 }];
    var low = normF({ arms: [10, 10] });
    var high = normF({ arms: [86, 86] });
    var bad = normF({ arms: [125, 125], sh: 9 });
    add('x-lateral', { view: 'f', reps: 3, hl: ['delt', 'upper'], thumb: 1, props: plates,
      steps: [
        { pose: low, ms: 1700, hold: 400, label: 'Langsam ablassen, etwa 3 Sekunden' },
        { pose: high, ms: 1200, hold: 500, label: 'Die Arme seitlich bis auf Schulterhöhe heben, die Ellbogen führen' },
        { pose: low, ms: 1700, hold: 300, label: 'Langsam ablassen, etwa 3 Sekunden' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu hoch, die Schultern wandern zu den Ohren' }
      ] });
  })();

  /* Frontheben: the straight arm goes from the thigh to shoulder height */
  (function () {
    var A = [150, G], hip = [150, G - 70], sh = shOf(hip, 2);
    var plate = { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 };
    var down = norm({ hip: hip, th: 2, ankle: A, wrist: reach(sh, 3, 48.5), ha: 2 });
    var mid = norm({ hip: hip, th: 2, ankle: A, wrist: reach(sh, 48, 48.5), ha: 2 });
    var up = norm({ hip: hip, th: 2, ankle: A, wrist: reach(sh, 90, 48.5), ha: 2 });
    var hipB = [156, G - 68], shB = shOf(hipB, -16);
    var bad = norm({ hip: hipB, th: -16, ankle: A, wrist: reach(shB, 110, 48.5), ha: -10 });
    add('x-front', { reps: 3, hl: ['delt', 'upper'], thumb: 2, sweep: true, props: [plate],
      steps: [
        { pose: down, ms: 1300, hold: 400, label: 'Langsam ablassen, der Arm bleibt gestreckt' },
        { pose: mid, ms: 500, hold: 0, label: 'Den Arm gestreckt nach vorn anheben' },
        { pose: up, ms: 500, hold: 600, label: 'Bis auf Schulterhöhe heben und kurz halten' },
        { pose: mid, ms: 800, hold: 0, label: 'Langsam ablassen, der Arm bleibt gestreckt' },
        { pose: down, ms: 600, hold: 300, label: 'Langsam ablassen, der Arm bleibt gestreckt' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Mit Schwung aus dem Rücken, der Arm zu hoch' }
      ] });
  })();

  /* Pike-Liegestütze: hands and feet on the floor, the hips high, the head sinks between the hands */
  (function () {
    var A = [90, G - 12], hand = [165, 172];
    function pike(sh, hd) {
      var hip = ik(A, sh, 71.8, 46, -1);
      return norm({ hip: hip, sh: sh, ankle: A, fa: 70, wrist: hand, ha: hd });
    }
    var up = pike([150, 126], 135), dn = pike([150, 150], 150), bad = pike([170, 150], 150);
    add('x-pike', { reps: 2, hl: ['delt', 'upper'], thumb: 0, sweep: true, props: [],
      steps: [
        { pose: up, ms: 1000, hold: 500, label: 'Kräftig hochdrücken, die Hüfte bleibt hoch' },
        { pose: dn, ms: 1600, hold: 400, label: 'Den Kopf zwischen den Händen Richtung Boden senken' },
        { pose: up, ms: 1000, hold: 300, label: 'Kräftig hochdrücken, die Hüfte bleibt hoch' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Hüfte sinkt, es wird ein gewöhnlicher Liegestütz' }
      ] });
  })();

  /* ===== Nacken ===== */

  /* Kinn einziehen: the head slides straight back */
  (function () {
    var A = [150, G], hip = [150, G - 70];
    var fwd = norm({ hip: hip, th: 2, ankle: A, wr: [2, 47], ha: 8, hdx: 8 });
    var tuck = norm({ hip: hip, th: 2, ankle: A, wr: [2, 47], ha: 8, hdx: -4 });
    var bad = norm({ hip: hip, th: 2, ankle: A, wr: [2, 47], ha: -32, hdx: 0 });
    add('x-chintuck', { reps: 4, hl: ['head'], thumb: 1, props: [],
      steps: [
        { pose: fwd, ms: 1200, hold: 300, label: 'Den Kopf locker wieder nach vorn kommen lassen' },
        { pose: tuck, ms: 1400, hold: 1200, label: 'Das Kinn waagerecht nach hinten schieben, der Blick bleibt vorn' },
        { pose: fwd, ms: 1200, hold: 300, label: 'Den Kopf locker wieder nach vorn kommen lassen' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Kopf wird in den Nacken gelegt' }
      ] });
  })();

  /* Nacken mit der Hand: the head pushes against the hand and stays where it is */
  (function () {
    var A = [150, G], hip = [150, G - 70];
    var rest = norm({ hip: hip, th: 2, ankle: A, wrist: [153.6, 105], ha: 3, es: 1 });
    var push = norm({ hip: hip, th: 2, ankle: A, wrist: [162, 47], ha: 3, es: 1 });
    var bad = norm({ hip: hip, th: 2, ankle: A, wrist: [160, 48], ha: -28, hdx: -4, es: 1 });
    add('x-neckiso', { reps: 2, hl: ['head'], thumb: 1, props: [],
      steps: [
        { pose: rest, ms: 1000, hold: 300, label: 'Aufrecht stehen, die Schultern locker' },
        { pose: push, ms: 1000, hold: 1800, label: 'Die Hand an die Stirn legen, den Kopf dagegen drücken, ohne dass er sich bewegt' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Der Kopf kippt weg' }
      ] });
  })();

  /* Schulterheben (front view) */
  (function () {
    var plates = [{ t: 'plate', at: 'wrL', dx: 0, dy: 0, r: 5 }, { t: 'plate', at: 'wrR', dx: 0, dy: 0, r: 5 }];
    var low = normF({ arms: [3, 3] });
    var high = normF({ arms: [3, 3], sh: 11 });
    var bad = normF({ arms: [3, 3], sh: 11, lean: 7, hd: 12 });
    add('x-shrug', { view: 'f', reps: 3, hl: ['trap'], thumb: 1, props: plates,
      steps: [
        { pose: low, ms: 1500, hold: 300, label: 'Die Schultern langsam wieder absenken' },
        { pose: high, ms: 900, hold: 900, label: 'Die Schultern gerade nach oben ziehen und kurz halten' },
        { pose: low, ms: 1500, hold: 300, label: 'Die Schultern langsam wieder absenken' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Der Körper kippt zur Seite, der Kopf geht mit' }
      ] });
  })();

  /* Nacken dehnen (front view): the ear goes towards the shoulder, the hand rests on the side of the head, first to one side, then to the other */
  (function () {
    var rest = normF({ arms: [5, 5] });
    var one = normF({ armL: [5, 5], armR: [120, -100], hd: 40 });
    var other = normF({ armR: [5, 5], armL: [120, -100], hd: -40 });
    var bad = normF({ armL: [5, 5], armR: [120, -100], hd: 40, sh: 10 });
    add('x-neckstretch', { view: 'f', reps: 2, hl: ['head'], thumb: 1, props: [],
      steps: [
        { pose: one, ms: 1600, hold: 1500, label: 'Das Ohr sanft zur Schulter neigen, die Hand liegt nur locker am Kopf' },
        { pose: rest, ms: 1200, hold: 300, label: 'Zurück in die Mitte' },
        { pose: other, ms: 1600, hold: 1500, label: 'Zur anderen Seite wechseln, die Schulter bleibt unten' },
        { pose: rest, ms: 1200, hold: 300, label: 'Zurück in die Mitte' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Schulter geht mit nach oben' }
      ] });
  })();

  /* ===== Bauch ===== */

  /* Crunch: on the back, only the shoulders roll up, the lower back stays down */
  (function () {
    var H = [130, 172], A = [172, G];
    var pose = function (th, ha, extra) { return norm(Object.assign({ hip: H, th: th, ankle: A, wr: [-14, -6], ha: ha }, extra || {})); };
    var down = pose(-90, -78), up = pose(-62, -48), bad = pose(-70, -8, { hdx: 5 });
    add('x-crunch', { reps: 3, hl: ['torso'], thumb: 1, sweep: true,
      steps: [
        { pose: down, ms: 1500, hold: 300, label: 'Langsam ablassen, den Kopf nicht ganz ablegen' },
        { pose: up, ms: 1000, hold: 700, label: 'Kopf und Schultern nur ein Stück aufrollen, der untere Rücken bleibt am Boden' },
        { pose: down, ms: 1500, hold: 300, label: 'Langsam ablassen, den Kopf nicht ganz ablegen' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Der Kopf wird nach vorn gezogen' }
      ] });
  })();

  /* Beinheben liegend: the straight legs go up and come down slowly, the lower back stays on the floor */
  (function () {
    var SH = [74, 172], W = [118, 172], hip = [120, 172];
    var leg = function (deg) { return [hip[0] + 71.5 * Math.cos(deg * D2R), hip[1] - 71.5 * Math.sin(deg * D2R)]; };
    var pose = function (deg, extra) { return norm(Object.assign({ sh: SH, th: -90, ankle: leg(deg), fa: -deg, wrist: W, ha: -78, es: -1 }, extra || {})); };
    var down = pose(8), mid = pose(45), up = pose(90), bad = norm({ sh: SH, th: -90, ankle: [190, 166], fa: -5, wrist: W, ha: -78, round: -11, es: -1 });
    add('x-legraise', { reps: 3, hl: ['torso', 'thigh'], thumb: 2, sweep: true,
      steps: [
        { pose: down, ms: 1500, hold: 300, label: 'Die Beine langsam ablassen, der untere Rücken bleibt am Boden' },
        { pose: mid, ms: 600, hold: 0, label: 'Die gestreckten Beine anheben' },
        { pose: up, ms: 600, hold: 500, label: 'Bis senkrecht anheben und kurz halten' },
        { pose: mid, ms: 900, hold: 0, label: 'Die Beine langsam ablassen' },
        { pose: down, ms: 700, hold: 300, label: 'Die Beine langsam ablassen, der untere Rücken bleibt am Boden' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, der untere Rücken hebt ab' }
      ] });
  })();

  /* Seitstütz (front view): the body is one line from the feet to the head, the elbow under the shoulder */
  (function () {
    function pose(r, extra) {
      return normF(Object.assign({ rot: r, armR: [r, r + 180], armL: [180 - r, 180 - r], legs: [0, 0] }, extra || {}));
    }
    var low = pose(88), high = pose(77);
    var sag = pose(77, { legL: [14, 14], legR: [-14, -14] });
    add('x-sideplank', { view: 'f', reps: 2, hl: ['torso', 'thigh'], thumb: 1,
      steps: [
        { pose: low, ms: 1200, hold: 300, label: 'Auf die Seite legen, der Ellbogen liegt unter der Schulter' },
        { pose: high, ms: 1200, hold: 1500, label: 'Das Becken anheben, vom Kopf bis zu den Füssen eine Linie' },
        { pose: low, ms: 1200, hold: 300, label: 'Auf die Seite legen, der Ellbogen liegt unter der Schulter' },
        { pose: sag, ms: 900, hold: 1200, bad: true, label: 'Falsch: Das Becken sackt durch' }
      ] });
  })();

  /* Dead Bug: arms up, knees above the hips, the opposite arm and leg reach out */
  (function () {
    var H = [130, 172], SH = [84, 172], up = [86, 124], knee = [166, 136];
    var pose = function (extra) { return norm(Object.assign({ hip: H, th: -90, ankle: knee, fa: -30, ankle2: knee, fa2: -30, wrist: up, wrist2: up, ha: -78, es: 1 }, extra || {})); };
    var start = pose(), reach = pose({ wrist: [36, 170], ankle2: [200, 160], fa2: -3 }), bad = pose({ wrist: [36, 166], ankle2: [200, 164], fa2: -3, round: -10 });
    add('x-deadbug', { reps: 3, hl: ['torso'], thumb: 1, sweep: true,
      steps: [
        { pose: start, ms: 1200, hold: 400, label: 'Zurück zur Ausgangsposition, der untere Rücken bleibt am Boden' },
        { pose: reach, ms: 1600, hold: 600, label: 'Einen Arm und das gegenüberliegende Bein langsam strecken' },
        { pose: start, ms: 1200, hold: 300, label: 'Zurück zur Ausgangsposition, der untere Rücken bleibt am Boden' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der untere Rücken wölbt sich ab' }
      ] });
  })();

  /* Fahrrad-Crunch: shoulders up, one knee in and the other leg out, then swap */
  (function () {
    var H = [130, 172];
    var pose = function (a, a2, extra) { return norm(Object.assign({ hip: H, th: -64, ankle: a, fa: -20, ankle2: a2, fa2: -20, wr: [-14, -6], ha: -50 }, extra || {})); };
    var one = pose([156, 150], [200, 158]), two = pose([200, 158], [156, 150]);
    var bad = norm({ hip: H, th: -72, ankle: [156, 150], fa: -20, ankle2: [200, 158], fa2: -20, wr: [-6, -12], ha: 12, hdx: 8 });
    add('x-bicycle', { reps: 4, hl: ['torso', 'thigh'], thumb: 0, sweep: true,
      steps: [
        { pose: one, ms: 1100, hold: 200, label: 'Ellbogen zum gegenüberliegenden Knie, das andere Bein streckt sich' },
        { pose: two, ms: 1100, hold: 200, label: 'Die Seite wechseln, ruhig und gleichmässig' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Am Nacken ziehen, der Kopf geht nach vorn' }
      ] });
  })();

  /* Bergsteiger: in the push-up position the knees come in alternately */
  (function () {
    var hand = [190, 172], shUp = [190, 123.5], A = [190 - Math.sqrt(118 * 118 - 38.5 * 38.5), 162];
    var tuck = [163, 160];
    var base = body(shUp, A, { fa: 70, wrist: hand });
    var one = norm(Object.assign({}, base, { ankle2: tuck, fa2: 60 }));
    var two = norm(Object.assign({}, base, { ankle: tuck, fa: 60, ankle2: A, fa2: 70 }));
    var b = bendBody(A, [A[0] + 116 * Math.sin(71 * D2R), A[1] - 116 * Math.cos(71 * D2R)], -1);
    var bad = norm({ ankle: A, lean: b.lean, torso: b.torso, fa: 70, ankle2: A, fa2: 70, wrist: hand });
    add('x-mountain', { reps: 4, hl: ['torso', 'thigh'], thumb: 0, sweep: true,
      steps: [
        { pose: one, ms: 450, hold: 100, label: 'Ein Knie zur Brust, der Körper bleibt eine Linie' },
        { pose: two, ms: 450, hold: 100, label: 'Schnell wechseln, die Hüfte bleibt unten' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Das Gesäss ragt nach oben' }
      ] });
  })();

  /* Knieheben im Hang: hanging from the bar, the knees come up to the hips */
  (function () {
    var W = [152, 30];
    var hang = norm({ sh: [148, 79], th: 0, ankle: [126, 160], fa: 100, wrist: W, ha: 0 });
    var up = norm({ sh: [148, 79], th: 0, ankle: [170, 150], fa: 100, wrist: W, ha: 0 });
    var bad = norm({ sh: [144, 50], th: -35, ankle: [196, 120], fa: 40, wrist: W, ha: -20 });
    add('x-hangknee', { reps: 3, hl: ['torso', 'thigh'], thumb: 1, sweep: true,
      props: [{ t: 'rail', x1: 226, y1: 8, x2: 226, y2: 178 }, { t: 'rail', x1: 226, y1: 30, x2: 152, y2: 30 }],
      steps: [
        { pose: hang, ms: 1500, hold: 400, label: 'Langsam ablassen, der Körper schwingt nicht' },
        { pose: up, ms: 1100, hold: 600, label: 'Die Knie bis auf Hüfthöhe heben, das Becken einrollen' },
        { pose: hang, ms: 1500, hold: 300, label: 'Langsam ablassen, der Körper schwingt nicht' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Mit Schwung hochgekippt' }
      ] });
  })();

  /* Hollow Hold: on the back, the arms overhead, the legs straight, shoulders and legs a little off the floor */
  (function () {
    var H = [130, 172];
    var leg = function (deg) { return [H[0] + 71.5 * Math.cos(deg * D2R), H[1] - 71.5 * Math.sin(deg * D2R)]; };
    var rest = norm({ hip: H, th: -90, ankle: [201, 172], fa: -3, wr: [-48, -2], ha: -78 });
    var hollow = norm({ hip: H, th: -76, ankle: leg(18), fa: -18, wr: [-47, -8], ha: -62, round: 6 });
    var bad = norm({ hip: H, th: -90, ankle: leg(42), fa: -42, wr: [-48, -2], ha: -78, round: -12 });
    add('x-hollow', { reps: 2, hl: ['torso'], thumb: 1, sweep: true,
      steps: [
        { pose: rest, ms: 1200, hold: 400, label: 'Flach auf den Rücken legen, die Arme über dem Kopf' },
        { pose: hollow, ms: 1200, hold: 2000, label: 'Schultern und Beine anheben, der untere Rücken bleibt fest am Boden' },
        { pose: rest, ms: 1200, hold: 300, label: 'Flach auf den Rücken legen, die Arme über dem Kopf' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, der untere Rücken hebt ab' }
      ] });
  })();

  /* Kabel-Crunch kniend: the rope stays at the head, the spine rolls in, the hips stay put */
  (function () {
    var A = [86, 172], PU = [205, 20];
    var up = norm({ hip: [122, 128], th: 0, ankle: A, fa: 170, wrist: [128, 56], ha: 0 });
    var dn = norm({ hip: [122, 128], th: 50, ankle: A, fa: 170, wrist: [172, 88], ha: 70, round: 8 });
    var bad = norm({ hip: [104, 136], th: 30, ankle: A, fa: 170, wrist: [136, 72], ha: 40 });
    add('x-cablecrunch', { reps: 3, hl: ['torso'], thumb: 1, sweep: true,
      props: [{ t: 'rail', x1: PU[0], y1: PU[1], x2: PU[0], y2: 178 }, { t: 'pulley', x: PU[0], y: PU[1] }, { t: 'strap', anchor: PU, at: 'wrist' }],
      steps: [
        { pose: up, ms: 1400, hold: 300, label: 'Langsam wieder aufrollen, die Hüfte bleibt ruhig' },
        { pose: dn, ms: 1100, hold: 600, label: 'Die Wirbelsäule einrollen, die Ellbogen Richtung Knie' },
        { pose: up, ms: 1400, hold: 300, label: 'Langsam wieder aufrollen, die Hüfte bleibt ruhig' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Hüfte schwingt nach hinten, die Arme ziehen' }
      ] });
  })();

  /* Seitbeugen (front view): the body bends sideways towards the weight */
  (function () {
    var plate = { t: 'plate', at: 'wrR', dx: 0, dy: 0, r: 6 };
    var pose = function (lean) { return normF({ lean: lean, armR: [3, 3], armL: [120, -100] }); };
    var upright = pose(0), bend = pose(24), far = pose(38);
    add('x-sidebend', { view: 'f', reps: 3, hl: ['torso'], thumb: 1, props: [plate],
      steps: [
        { pose: upright, ms: 1200, hold: 300, label: 'Mit der Kraft der Seite wieder aufrichten' },
        { pose: bend, ms: 1500, hold: 500, label: 'Gerade zur Seite nach unten beugen, nicht drehen' },
        { pose: upright, ms: 1200, hold: 300, label: 'Mit der Kraft der Seite wieder aufrichten' },
        { pose: far, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu weit und mit Schwung gekippt' }
      ] });
  })();

  /* ===== Oberarme ===== */

  /* A curl: the elbow stays at the body, the hand follows the circle round the elbow. Keyframes on the circle keep the elbow from drifting. */
  function curlPoses(plateR) {
    var A = [150, G], hip = [150, G - 70], sh = shOf(hip, 2), E = [sh[0] + 0.4, sh[1] + 26];
    var on = function (deg) { return norm({ hip: hip, th: 2, ankle: A, wrist: [E[0] + 24 * Math.sin(deg * D2R), E[1] + 24 * Math.cos(deg * D2R)], ha: 2 }); };
    return { A: A, hang: on(12), mid: on(80), top: on(150), plate: { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: plateR } };
  }

  /* Langhantel-Curl */
  (function () {
    var c = curlPoses(9);
    var bad = norm({ hip: [150, G - 70], th: 2, ankle: c.A, wrist: [180, 50], ha: 2 });
    add('x-bbcurl', { reps: 3, hl: ['upper'], thumb: 2, sweep: true, props: [c.plate],
      steps: [
        { pose: c.hang, ms: 1500, hold: 400, label: 'Langsam ablassen, die Arme fast ganz strecken' },
        { pose: c.mid, ms: 500, hold: 0, label: 'Die Stange hochrollen, die Ellbogen bleiben am Körper' },
        { pose: c.top, ms: 500, hold: 500, label: 'Oben kurz anspannen' },
        { pose: c.mid, ms: 900, hold: 0, label: 'Langsam ablassen, die Arme fast ganz strecken' },
        { pose: c.hang, ms: 600, hold: 300, label: 'Langsam ablassen, die Arme fast ganz strecken' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Ellbogen wandern nach vorn' }
      ] });
  })();

  /* Kabel-Curl: the cable comes from a low pulley in front */
  (function () {
    var c = curlPoses(5), PU = [208, 168];
    var bad = norm({ hip: [152, G - 70], th: -14, ankle: c.A, wrist: [186, 60], ha: -6 });
    add('x-cablecurl', { reps: 3, hl: ['upper'], thumb: 2, sweep: true,
      props: [{ t: 'rail', x1: PU[0], y1: PU[1], x2: PU[0], y2: 178 }, { t: 'pulley', x: PU[0], y: PU[1] }, { t: 'strap', anchor: PU, at: 'wrist' }],
      steps: [
        { pose: c.hang, ms: 1500, hold: 400, label: 'Langsam zurückführen, das Gewicht nicht ablegen' },
        { pose: c.mid, ms: 500, hold: 0, label: 'Den Griff hochrollen, die Ellbogen bleiben am Körper' },
        { pose: c.top, ms: 500, hold: 500, label: 'Oben kurz anspannen' },
        { pose: c.mid, ms: 900, hold: 0, label: 'Langsam zurückführen, das Gewicht nicht ablegen' },
        { pose: c.hang, ms: 600, hold: 300, label: 'Langsam zurückführen, das Gewicht nicht ablegen' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Der Oberkörper lehnt zurück' }
      ] });
  })();

  /* TRX-Curl: the hands hold the handles and stay where the straps hold them, taut towards the anchor. The body leans back with straight arms and
     pulls itself up towards the anchor, pivoting about the feet; the elbows bend and stay high, the head comes to the hands. */
  (function () {
    var A = [200, G], AN = [262, 22], L0 = 25, L1 = 12;
    function lean(l) { return [A[0] - 118 * Math.sin(l * D2R), A[1] - 118 * Math.cos(l * D2R)]; }
    var s0 = lean(L0), W = [s0[0] + 49.9 * Math.cos(22 * D2R), s0[1] - 49.9 * Math.sin(22 * D2R)];      // straight arms towards the anchor
    var out = norm({ ankle: A, lean: -L0, wrist: W, ha: -22, es: -1 });
    var curl = norm({ ankle: A, lean: -L1, wrist: W, ha: -6, es: -1 });
    var b = bendBody(A, [A[0] - 112 * Math.sin(L1 * D2R), A[1] - 112 * Math.cos(L1 * D2R)], 1);        // the hips drop below the line from heels to shoulders
    var sag = norm({ ankle: A, lean: b.lean, torso: b.torso, wrist: W, ha: -6, es: -1 });
    add('x-trxcurl', { reps: 3, hl: ['upper'], thumb: 1, sweep: true,
      props: [{ t: 'anchor', x: AN[0], y: AN[1] - 3 }, { t: 'strap', anchor: AN, at: 'wrist' }],
      steps: [
        { pose: out, ms: 1500, hold: 400, label: 'Langsam strecken, der Körper bleibt eine Linie' },
        { pose: curl, ms: 1100, hold: 500, label: 'Dich selbst zu den Händen hochziehen, die Ellbogen bleiben hoch' },
        { pose: out, ms: 1500, hold: 300, label: 'Langsam strecken, der Körper bleibt eine Linie' },
        { pose: sag, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Hüfte hängt durch' }
      ] });
  })();

  /* Trizeps-Pushdown: the elbows stay at the body, only the forearms move */
  (function () {
    var A = [150, G], hip = [150, G - 70], sh = shOf(hip, 2), E = [sh[0], sh[1] + 26], PU = [194, 12];
    var on = function (deg) { return norm({ hip: hip, th: 2, ankle: A, wrist: [E[0] + 24 * Math.sin(deg * D2R), E[1] + 24 * Math.cos(deg * D2R)], ha: 2 }); };
    var top = on(85), mid = on(45), low = on(12);
    var bad = norm({ hip: hip, th: 2, ankle: A, wrist: [186, 70], ha: 2 });
    add('x-pushdown', { reps: 3, hl: ['upper'], thumb: 2, sweep: true,
      props: [{ t: 'rail', x1: PU[0], y1: PU[1], x2: PU[0], y2: 178 }, { t: 'pulley', x: PU[0], y: PU[1] }, { t: 'strap', anchor: PU, at: 'wrist' }],
      steps: [
        { pose: top, ms: 1400, hold: 300, label: 'Langsam zurückkommen lassen, die Ellbogen bleiben am Körper' },
        { pose: mid, ms: 400, hold: 0, label: 'Nach unten strecken' },
        { pose: low, ms: 400, hold: 600, label: 'Unten kurz anspannen, die Arme sind gerade' },
        { pose: mid, ms: 800, hold: 0, label: 'Langsam zurückkommen lassen, die Ellbogen bleiben am Körper' },
        { pose: top, ms: 600, hold: 300, label: 'Langsam zurückkommen lassen, die Ellbogen bleiben am Körper' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Ellbogen wandern nach vorn' }
      ] });
  })();

  /* Trizepsstrecken liegend: the upper arms stay vertical, the bar goes towards the forehead */
  (function () {
    var S = [80, 141], A = [168, G], E = [80.5, 115];
    var on = function (deg, extra) { return norm(Object.assign({ sh: S, th: -90, ankle: A, wrist: [E[0] - 24 * Math.sin(deg * D2R), E[1] - 24 * Math.cos(deg * D2R)], ha: -70 }, extra || {})); };
    var up = on(12), mid = on(75), dn = on(130);
    var bad = norm({ sh: S, th: -110, ankle: A, wrist: [E[0] - 5, E[1] - 23.5], ha: -70, round: -8 });
    add('x-skull', { reps: 3, hl: ['upper'], thumb: 0, sweep: true,
      props: [{ t: 'box', x: 60, y: 144.5, w: 100, h: 33.5 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 }],
      steps: [
        { pose: up, ms: 1200, hold: 400, label: 'Die Arme strecken, die Oberarme bleiben senkrecht' },
        { pose: mid, ms: 500, hold: 0, label: 'Die Ellbogen beugen, die Hantel Richtung Stirn senken' },
        { pose: dn, ms: 800, hold: 400, label: 'Kontrolliert bis knapp vor die Stirn senken' },
        { pose: mid, ms: 600, hold: 0, label: 'Die Arme wieder strecken' },
        { pose: up, ms: 600, hold: 300, label: 'Die Arme strecken, die Oberarme bleiben senkrecht' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Das Gesäss hebt ab, Hohlkreuz' }
      ] });
  })();

  /* Trizeps-Kickback: bent over, the upper arm stays parallel to the back, the forearm swings back */
  (function () {
    var A = [150, G], hip = [118, G - 64], sh = shOf(hip, 75), far = [128, 124];
    var E = [sh[0] - 26, sh[1]];
    var on = function (deg) { return norm({ hip: hip, th: 75, ankle: A, wrist: [E[0] - 24 * Math.sin(deg * D2R), E[1] + 24 * Math.cos(deg * D2R)], wrist2: far, ha: 55 }); };
    var down = on(0), mid = on(45), back = norm({ hip: hip, th: 75, ankle: A, wrist: [sh[0] - 49, sh[1]], wrist2: far, ha: 55 });
    var bad = norm({ hip: hip, th: 75, ankle: A, wrist: [130, 134], wrist2: far, ha: 55 });
    add('x-kickbacktri', { reps: 3, hl: ['upper'], thumb: 2, sweep: true, props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 5 }],
      steps: [
        { pose: down, ms: 1300, hold: 300, label: 'Der Unterarm hängt senkrecht, der Oberarm bleibt am Rücken' },
        { pose: mid, ms: 400, hold: 0, label: 'Den Arm nach hinten strecken' },
        { pose: back, ms: 400, hold: 700, label: 'Ganz strecken und kurz halten' },
        { pose: mid, ms: 800, hold: 0, label: 'Kontrolliert zurückkommen, der Oberarm bleibt still' },
        { pose: down, ms: 600, hold: 300, label: 'Der Unterarm hängt senkrecht, der Oberarm bleibt am Rücken' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Oberarm sinkt, der Arm schwingt' }
      ] });
  })();

  /* Trizepsstrecken über Kopf: the elbows point up, the weight swings behind the head */
  (function () {
    var A = [150, G], hip = [150, G - 68], E = [150, 35];
    var on = function (deg) { return norm({ hip: hip, th: 2, ankle: A, wrist: [E[0] - 24 * Math.sin(deg * D2R), E[1] - 24 * Math.cos(deg * D2R)], ha: 2 }); };
    var up = on(4), mid = on(80), dn = on(140);
    var bad = norm({ hip: [152, G - 68], th: -16, ankle: A, wrist: [136, 52], ha: -10 });
    add('x-ohtri', { reps: 3, hl: ['upper'], thumb: 0, sweep: true, props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 7 }],
      steps: [
        { pose: up, ms: 1100, hold: 400, label: 'Nach oben strecken, die Ellbogen bleiben nah am Kopf' },
        { pose: mid, ms: 600, hold: 0, label: 'Die Ellbogen beugen, die Hantel hinter den Kopf senken' },
        { pose: dn, ms: 900, hold: 400, label: 'Langsam bis hinter den Kopf senken, die Ellbogen zeigen nach oben' },
        { pose: mid, ms: 700, hold: 0, label: 'Wieder nach oben strecken' },
        { pose: up, ms: 600, hold: 300, label: 'Nach oben strecken, die Ellbogen bleiben nah am Kopf' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Ins Hohlkreuz gelehnt' }
      ] });
  })();

  /* ===== Unterarme ===== */

  /* Handgelenkcurl: forearms on the thighs, the hands go up and down at the wrist */
  (function () {
    var H = [100, 145], A = [150, G];
    var pose = function (w) { return norm({ hip: H, th: 45, ankle: A, wrist: w, ha: 35 }); };
    var low = pose([150, 150]), high = pose([150, 128]), bad = pose([162, 118]);
    add('x-wristcurl', { reps: 4, hl: ['fore'], thumb: 1, props: [{ t: 'plate', at: 'wrist', dx: 5, dy: 0, r: 6 }],
      steps: [
        { pose: low, ms: 1500, hold: 300, label: 'Die Hantel langsam in die Finger rollen lassen' },
        { pose: high, ms: 1000, hold: 500, label: 'Nur im Handgelenk nach oben beugen, die Unterarme bleiben liegen' },
        { pose: low, ms: 1500, hold: 300, label: 'Die Hantel langsam in die Finger rollen lassen' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Unterarme heben mit ab' }
      ] });
  })();

  /* Koffertragen: tall, with a heavy weight in each hand, small calm steps */
  (function () {
    var hip = [150, G - 70];
    var pose = function (a, a2, extra) { return norm(Object.assign({ hip: hip, th: 2, ankle: a, ankle2: a2, wr: [2, 47], wr2: [2, 47], ha: 2 }, extra || {})); };
    var one = pose([160, G], [140, G]), two = pose([140, G], [160, G]);
    var bad = norm({ hip: [146, G - 69], th: 14, ankle: [150, G], ankle2: [150, G], wr: [6, 46], wr2: [6, 46], round: 8, ha: 22 });
    add('x-farmer', { reps: 3, hl: ['fore', 'upper'], thumb: 0, sweep: true, props: [{ t: 'plate', at: 'wrist', dx: 0, dy: 3, r: 7 }],
      steps: [
        { pose: one, ms: 800, hold: 150, label: 'Aufrecht gehen, kleine ruhige Schritte' },
        { pose: two, ms: 800, hold: 150, label: 'Die Gewichte schwingen nicht, die Schultern bleiben unten' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund, die Schultern gehen nach vorn' }
      ] });
  })();

  /* Hängen an der Stange */
  (function () {
    var W = [152, 30];
    var active = norm({ sh: [148, 79], th: 0, ankle: [126, 160], fa: 100, wrist: W, ha: 0 });
    var slack = norm({ sh: [148, 70], th: 0, ankle: [126, 151], fa: 100, wrist: W, ha: 0 });
    add('x-deadhang', { reps: 2, hl: ['fore', 'upper'], thumb: 0, sweep: true,
      props: [{ t: 'rail', x1: 226, y1: 8, x2: 226, y2: 178 }, { t: 'rail', x1: 226, y1: 30, x2: 152, y2: 30 }],
      steps: [
        { pose: active, ms: 1500, hold: 2500, label: 'Fest zugreifen, die Schulterblätter aktiv nach unten' },
        { pose: slack, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Schultern hängen schlaff bis zu den Ohren' }
      ] });
  })();

  /* ===== Ganzkörper ===== */

  /* Burpee */
  (function () {
    var A0 = [150, G];
    var stand = norm({ hip: [150, G - 70], th: 2, ankle: A0, wrist: [153.6, 105], ha: 2 });
    var fold = norm({ hip: [140, 120], th: 50, ankle: A0, wrist: [176, 134], ha: 40 });
    var squat = norm({ hip: [126, 140], th: 72, ankle: A0, wrist: [180, 172], ha: 60 });
    var hand = [190, 172], shUp = [190, 123.5], A = [190 - Math.sqrt(118 * 118 - 38.5 * 38.5), 162];
    var plank = norm(body(shUp, A, { fa: 70, wrist: hand }));
    var b = bendBody(A, [A[0] + 116 * Math.sin(71 * D2R), A[1] - 116 * Math.cos(71 * D2R)], 1);
    var sag = norm({ ankle: A, lean: b.lean, torso: b.torso, fa: 70, wrist: hand });
    var kick = norm({ hip: [136, 136], th: 72, ankle: [112, 152], fa: 60, wrist: [182, 170], ha: 60 });
    var jump = norm({ hip: [150, G - 76], th: 0, ankle: [150, G - 12], fa: 40, wrist: [154, 12], ha: 0 });
    add('x-burpee', { reps: 2, hl: ['thigh', 'torso', 'upper'], thumb: 3, sweep: true,
      steps: [
        { pose: stand, ms: 700, hold: 200, label: 'Aufrecht stehen' },
        { pose: fold, ms: 350, hold: 0, label: 'Nach unten beugen' },
        { pose: squat, ms: 350, hold: 100, label: 'In die Hocke gehen, die Hände auf den Boden' },
        { pose: kick, ms: 250, hold: 0, label: 'Die Füsse nach hinten springen oder setzen' },
        { pose: plank, ms: 250, hold: 500, label: 'Im Stütz landen, der Körper bleibt eine Linie' },
        { pose: sag, ms: 800, hold: 1200, bad: true, label: 'Falsch: Der Bauch hängt im Stütz durch' },
        { pose: plank, ms: 600, hold: 300, label: 'Zurück in die gerade Linie, Bauch und Gesäss anspannen' },
        { pose: kick, ms: 300, hold: 0, label: 'Die Füsse wieder zu den Händen' },
        { pose: squat, ms: 250, hold: 100, label: 'In die Hocke, die Hände am Boden' },
        { pose: jump, ms: 450, hold: 250, label: 'Hochspringen, die Arme gehen über den Kopf' }
      ] });
  })();

  /* Hampelmann (front view) */
  (function () {
    var closed = normF({ arms: [8, 8], legs: [2, 2] });
    var open = normF({ arms: [150, 150], legs: [24, 6] });
    var shrug = normF({ arms: [150, 150], legs: [24, 6], sh: 9 });
    add('x-jack', { view: 'f', reps: 4, hl: ['thigh', 'upper', 'torso'], thumb: 1, props: [],
      steps: [
        { pose: closed, ms: 500, hold: 150, label: 'Zurück in die Ausgangsposition, weich landen' },
        { pose: open, ms: 500, hold: 150, label: 'Die Füsse auseinander, die Arme über den Kopf' },
        { pose: closed, ms: 500, hold: 150, label: 'Zurück in die Ausgangsposition, weich landen' },
        { pose: shrug, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Schultern wandern zu den Ohren' }
      ] });
  })();

  /* Thruster: squat down with the weights on the shoulders, then stand up and press */
  (function () {
    var A = [150, G], plate = { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 };
    var hipB = [126, G - 38], shB = shOf(hipB, 25), hipT = [150, G - 68], shT = shOf(hipT, 2);
    var bottom = norm({ hip: hipB, th: 25, ankle: A, wrist: [shB[0] + 16, shB[1] - 12], ha: 12 });
    var stand = norm({ hip: hipT, th: 2, ankle: A, wrist: [shT[0] + 16, shT[1] - 12], ha: 2 });
    var top = norm({ hip: hipT, th: 2, ankle: A, wrist: [shT[0] + 4, shT[1] - 47], ha: 2 });
    var bad = norm({ hip: [120, G - 40], th: 55, ankle: A, wrist: [shOf([120, G - 40], 55)[0] + 16, shOf([120, G - 40], 55)[1] - 10], round: 12, ha: 40 });
    add('x-thruster', { reps: 3, hl: ['thigh', 'glute', 'delt'], thumb: 0, sweep: true, props: [plate],
      steps: [
        { pose: bottom, ms: 1100, hold: 300, label: 'Tief in die Kniebeuge, die Hanteln bleiben auf den Schultern' },
        { pose: stand, ms: 600, hold: 0, label: 'Kräftig aufstehen' },
        { pose: top, ms: 500, hold: 400, label: 'Mit dem Schwung die Hanteln über den Kopf drücken' },
        { pose: stand, ms: 800, hold: 0, label: 'Die Hanteln zu den Schultern senken' },
        { pose: bottom, ms: 800, hold: 300, label: 'Tief in die Kniebeuge, die Hanteln bleiben auf den Schultern' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund' }
      ] });
  })();

  /* ===== zwei leichte Übungen für Arme und Brust ohne Geräte ===== */

  /* Liegestütze an der Wand: flat feet, the body leans into the wall and pushes away */
  (function () {
    var A = [143.6, G], W = [233, 66];
    var up = norm({ ankle: A, lean: 20, wrist: W });
    var dn = norm({ ankle: A, lean: 36, wrist: W });
    var b = bendBody(A, [A[0] + 116 * Math.sin(20 * D2R), A[1] - 116 * Math.cos(20 * D2R)], -1);
    var bad = norm({ ankle: A, lean: b.lean, torso: b.torso, wrist: W });
    add('x-wallpush', { reps: 3, hl: ['torso', 'upper', 'fore'], thumb: 0, props: [{ t: 'rail', x1: 236, y1: 10, x2: 236, y2: 178 }],
      steps: [
        { pose: up, ms: 1000, hold: 400, label: 'Kräftig wegdrücken, der Körper bleibt eine Linie' },
        { pose: dn, ms: 1400, hold: 400, label: 'Die Brust zur Wand bringen, Ellbogen schräg nach hinten' },
        { pose: up, ms: 1000, hold: 300, label: 'Kräftig wegdrücken, der Körper bleibt eine Linie' },
        { pose: bad, ms: 800, hold: 1100, bad: true, label: 'Falsch: Das Gesäss ragt nach hinten' }
      ] });
  })();

  /* Dips am Boden: hands behind, hips up to the table, then down a little */
  (function () {
    var A = [166, G], W = [96, 172];
    var up = norm({ sh: [100, 124], th: -80, ankle: A, wrist: W, ha: -15 });
    var dn = norm({ sh: [100, 146], th: -62, ankle: A, wrist: W, ha: -15 });
    var bad = norm({ sh: [100, 156], th: -78, ankle: A, wrist: W, ha: -5 });
    add('x-floordip', { reps: 3, hl: ['upper', 'torso'], thumb: 0, sweep: true,
      steps: [
        { pose: up, ms: 1000, hold: 400, label: 'Hochdrücken bis zur Tischposition, die Ellbogen nicht hart durchstrecken' },
        { pose: dn, ms: 1400, hold: 400, label: 'Die Ellbogen nach hinten beugen, die Hüfte nur ein Stück senken' },
        { pose: up, ms: 1000, hold: 300, label: 'Hochdrücken bis zur Tischposition, die Ellbogen nicht hart durchstrecken' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu tief, die Schultern rutschen nach vorn' }
      ] });
  })();

  /* ===== zwei weitere Übungen für den Rücken ===== */

  /* Schwimmer am Boden: lying on the belly, one arm and the opposite leg lift, then swap */
  (function () {
    var H = [110, 170], down = [204, 172], lifted = [198, 143], legDown = [38.2, 172], legUp = [41, 151];
    var pose = function (w, w2, a, a2, extra) {
      return norm(Object.assign({ hip: H, th: 84, ankle: a, fa: 170, ankle2: a2, fa2: 170, wrist: w, wrist2: w2, ha: 72, es: -1 }, extra || {}));
    };
    var one = pose(lifted, down, legDown, legUp), two = pose(down, lifted, legUp, legDown);
    var bad = pose([190, 125], [194, 142], [45, 139.5], [45, 139.5], { th: 55, ha: 22, round: -10 });
    add('x-swimmer', { reps: 4, hl: ['torso', 'glute'], thumb: 0, sweep: true,
      steps: [
        { pose: one, ms: 900, hold: 150, label: 'Einen Arm und das gegenüberliegende Bein leicht anheben' },
        { pose: two, ms: 900, hold: 150, label: 'Langsam wechseln, der Blick bleibt zum Boden' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu hoch, der Kopf im Nacken' }
      ] });
  })();

  /* Wand-Engel (front view): the arms slide up the wall from the W to the Y */
  (function () {
    var w = normF({ arms: [55, 175] });
    var mid = normF({ arms: [110, 160] });
    var y = normF({ arms: [140, 140] });
    var shrug = normF({ arms: [140, 140], sh: 8 });
    add('x-wallangel', { view: 'f', reps: 3, hl: ['trap', 'upper'], thumb: 1, props: [],
      steps: [
        { pose: w, ms: 1300, hold: 300, label: 'Ellbogen im rechten Winkel, Ellbogen und Handrücken an der Wand' },
        { pose: mid, ms: 600, hold: 0, label: 'Die Arme an der Wand nach oben gleiten lassen' },
        { pose: y, ms: 700, hold: 500, label: 'Bis fast gestreckt, die Schultern bleiben unten' },
        { pose: mid, ms: 800, hold: 0, label: 'Langsam zurück gleiten' },
        { pose: w, ms: 700, hold: 300, label: 'Ellbogen im rechten Winkel, Ellbogen und Handrücken an der Wand' },
        { pose: shrug, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Schultern wandern zu den Ohren' }
      ] });
  })();

  /* ===== Medizinball ===== */

  /* Medizinball-Slam: the ball goes overhead and is slammed onto the floor in front of the feet */
  (function () {
    var A = [150, G], ball = { t: 'ball', at: 'wrist', dx: 0, dy: -6, r: 10 };
    var floorBall = { t: 'ball', at: 'wrist', dx: 0, dy: 0, r: 10 };
    var up = norm({ hip: [150, G - 68], th: 2, ankle: A, wrist: [170, 28], ha: -4 });
    var mid = norm({ hip: [134, 108], th: 36, ankle: A, wrist: [175, 94], ha: 20 });
    var slam = norm({ hip: [116, 138], th: 70, ankle: A, wrist: [180, 163], ha: 50 });
    var bad = norm({ hip: [128, 112], th: 70, ankle: A, wrist: [186, 142], round: 12, ha: 85 });
    add('x-slam', { reps: 3, hl: ['torso', 'upper', 'delt'], thumb: 0, sweep: true, props: [floorBall],
      steps: [
        { pose: up, ms: 900, hold: 300, label: 'Den Ball gestreckt über den Kopf heben, lang machen' },
        { pose: mid, ms: 250, hold: 0, label: 'Den Ball mit Schwung nach unten ziehen' },
        { pose: slam, ms: 250, hold: 400, label: 'Auf den Boden vor die Füsse schmettern, dabei in die Hocke' },
        { pose: mid, ms: 700, hold: 0, label: 'Den Ball aufnehmen, der Rücken bleibt gerade' },
        { pose: up, ms: 500, hold: 300, label: 'Aufstehen und den Ball wieder über den Kopf heben' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund' }
      ] });
  })();

  /* Wall Ball: squat with the ball at the chest, then drive up and throw it high at the wall */
  (function () {
    var A = [150, G], ball = { t: 'ball', at: 'wrist', dx: 8, dy: 0, r: 9 };
    var hipB = [126, G - 38], shB = shOf(hipB, 25), hipT = [150, G - 68], shT = shOf(hipT, 2);
    var bottom = norm({ hip: hipB, th: 25, ankle: A, wrist: [shB[0] + 18, shB[1] - 8], ha: 12 });
    var stand = norm({ hip: hipT, th: 2, ankle: A, wrist: [shT[0] + 18, shT[1] - 8], ha: 2 });
    var throwP = norm({ hip: hipT, th: 2, ankle: A, wrist: [shT[0] + 24, shT[1] - 41], ha: -6 });
    var bad = norm({ hip: [120, G - 40], th: 55, ankle: A, wrist: [shOf([120, G - 40], 55)[0] + 14, shOf([120, G - 40], 55)[1] - 6], round: 12, ha: 40 });
    add('x-wallball', { reps: 3, hl: ['thigh', 'glute', 'delt'], thumb: 0, sweep: true, props: [{ t: 'rail', x1: 244, y1: 8, x2: 244, y2: 178 }, ball],
      steps: [
        { pose: bottom, ms: 1100, hold: 300, label: 'Tief in die Kniebeuge, der Ball bleibt vor der Brust' },
        { pose: stand, ms: 450, hold: 0, label: 'Kräftig aufstehen' },
        { pose: throwP, ms: 350, hold: 400, label: 'Aus den Beinen den Ball hoch an die Wand werfen' },
        { pose: stand, ms: 700, hold: 0, label: 'Den Ball fangen und weich in die Knie gehen' },
        { pose: bottom, ms: 600, hold: 300, label: 'Tief in die Kniebeuge, der Ball bleibt vor der Brust' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken wird rund' }
      ] });
  })();

  /* Crunch mit Medizinball: the ball goes towards the knees */
  (function () {
    var H = [130, 172], A = [172, G], ball = { t: 'ball', at: 'wrist', dx: 2, dy: -8, r: 9 };
    var down = norm({ hip: H, th: -90, ankle: A, wr: [2, -46], ha: -78, es: 1 });
    var up = norm({ hip: H, th: -62, ankle: A, wr: [22, -43], ha: -48, es: 1 });
    var bad = norm({ hip: H, th: -70, ankle: A, wr: [30, -36], ha: -8, hdx: 5, es: 1 });
    add('x-mbcrunch', { reps: 3, hl: ['torso'], thumb: 1, sweep: true, props: [ball],
      steps: [
        { pose: down, ms: 1500, hold: 300, label: 'Langsam ablassen, der Ball bleibt über der Brust' },
        { pose: up, ms: 1000, hold: 700, label: 'Die Schultern anheben und den Ball Richtung Knie schieben' },
        { pose: down, ms: 1500, hold: 300, label: 'Langsam ablassen, der Ball bleibt über der Brust' },
        { pose: bad, ms: 800, hold: 1200, bad: true, label: 'Falsch: Der Kopf wird nach vorn gezogen' }
      ] });
  })();

  /* ==== new animations below ==== */

  /* ===== Maschinen im Sitzen, von vorn gesehen =====
     The thighs of a seated person point at us, so they are drawn short (ts) and level (angle 90); the lower legs hang straight down.
     The pelvis stays on the seat in every picture (auto: 0, py 138), only the legs, arms or shoulders move. */
  var SEAT = [{ t: 'box', x: 140, y: 142, w: 40, h: 36 }, { t: 'box', x: 147, y: 84, w: 26, h: 52 }];
  function seated(o) { return normF(Object.assign({ legs: [90, 0], ts: 0.3, auto: 0, py: 138, arms: [10, 6] }, o || {})); }

  /* Beinanzieher (Adduktorenmaschine): the knees start wide apart and are pressed together against the pads */
  (function () {
    var open = seated({ ts: 0.78 }), shut = seated({ ts: 0.1 }), jerk = seated({ ts: 1, py: 132, sh: 5 });
    var pads = [{ t: 'strap', anchor: [153, 170], at: 'knL', dx: 5 }, { t: 'strap', anchor: [167, 170], at: 'knR', dx: -5 },
      { t: 'pad', at: 'knL', dx: 5, dy: 0, ang: 90, len: 24 }, { t: 'pad', at: 'knR', dx: -5, dy: 0, ang: 90, len: 24 }];
    add('x-adduct', { view: 'f', reps: 3, hl: ['thigh'], thumb: 0, sweep: true, props: SEAT.concat(pads),
      steps: [
        { pose: open, ms: 1700, hold: 500, label: 'Langsam öffnen lassen, die Beine nur so weit, wie es angenehm ist' },
        { pose: shut, ms: 1100, hold: 700, label: 'Die Knie gegen die Polster zusammendrücken, kurz halten' },
        { pose: open, ms: 1700, hold: 300, label: 'Langsam öffnen lassen, die Beine nur so weit, wie es angenehm ist' },
        { pose: jerk, ms: 800, hold: 1200, bad: true, label: 'Falsch: Zu weit geöffnet und mit Schwung, das Becken hebt ab' }
      ] });
  })();

  /* Beinspreizer (Abduktorenmaschine): the knees start together and are pressed outwards against the pads */
  (function () {
    var shut = seated({ ts: 0.1 }), open = seated({ ts: 0.8 }), jerk = seated({ ts: 0.8, py: 131, sh: 5 });
    var pads = [{ t: 'strap', anchor: [153, 170], at: 'knL', dx: -5 }, { t: 'strap', anchor: [167, 170], at: 'knR', dx: 5 },
      { t: 'pad', at: 'knL', dx: -5, dy: 0, ang: 90, len: 24 }, { t: 'pad', at: 'knR', dx: 5, dy: 0, ang: 90, len: 24 }];
    add('x-abduct', { view: 'f', reps: 3, hl: ['thigh', 'glute'], thumb: 1, sweep: true, props: SEAT.concat(pads),
      steps: [
        { pose: shut, ms: 1700, hold: 400, label: 'Langsam zurückkommen lassen, die Knie bleiben unter Spannung' },
        { pose: open, ms: 1100, hold: 700, label: 'Die Knie gegen die Polster nach aussen drücken, kurz halten' },
        { pose: shut, ms: 1700, hold: 300, label: 'Langsam zurückkommen lassen, die Knie bleiben unter Spannung' },
        { pose: jerk, ms: 800, hold: 1200, bad: true, label: 'Falsch: Mit Schwung gespreizt, das Becken hebt ab' }
      ] });
  })();

  /* Butterfly (Brustmaschine): the forearms rest on the pads, the elbows swing from wide apart to together in front of the chest */
  (function () {
    function pose(us, extra) { return seated(Object.assign({ armL: [90, 180], armR: [90, 180], us: us }, extra || {})); }
    var wide = pose(1), mid = pose(0.5), shut = pose(0.12), shrug = pose(0.12, { sh: 9 });
    var pads = [{ t: 'pad', at: 'wrL', dx: -3, dy: 12, ang: 90, len: 28 }, { t: 'pad', at: 'wrR', dx: 3, dy: 12, ang: 90, len: 28 }];
    add('x-pecdeck', { view: 'f', reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true, props: SEAT.concat(pads),
      steps: [
        { pose: wide, ms: 1500, hold: 400, label: 'Langsam öffnen, bis die Ellbogen etwa auf Schulterhöhe sind' },
        { pose: mid, ms: 550, hold: 0, label: 'Die Unterarme in einem Bogen nach vorn führen' },
        { pose: shut, ms: 600, hold: 700, label: 'Vor der Brust zusammenführen und die Brust anspannen' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam wieder öffnen' },
        { pose: wide, ms: 700, hold: 300, label: 'Langsam öffnen, bis die Ellbogen etwa auf Schulterhöhe sind' },
        { pose: shrug, ms: 800, hold: 1200, bad: true, label: 'Falsch: Die Schultern ziehen zu den Ohren' }
      ] });
  })();

  /* Reverse Butterfly: the chest rests on the pad, the arms open backwards to the sides */
  (function () {
    function pose(k, extra) { return seated(Object.assign({ arms: [90, 90], us: k, fs: k }, extra || {})); }
    var front = pose(0.2), mid = pose(0.6), back = pose(1), shrug = pose(1, { sh: 9, lean: 4 });
    var grips = [{ t: 'plate', at: 'wrL', r: 3.5 }, { t: 'plate', at: 'wrR', r: 3.5 }];
    add('x-revfly', { view: 'f', reps: 3, hl: ['trap', 'upper'], thumb: 2, sweep: true, props: SEAT.concat(grips),
      steps: [
        { pose: front, ms: 1500, hold: 400, label: 'Langsam nach vorn führen, die Brust bleibt am Polster' },
        { pose: mid, ms: 500, hold: 0, label: 'Die Arme in einem Bogen seitlich nach hinten öffnen' },
        { pose: back, ms: 600, hold: 700, label: 'Auf Schulterhöhe öffnen und die Schulterblätter zusammenziehen' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam nach vorn führen' },
        { pose: front, ms: 700, hold: 300, label: 'Langsam nach vorn führen, die Brust bleibt am Polster' },
        { pose: shrug, ms: 800, hold: 1200, bad: true, label: 'Falsch: Mit Schwung und hochgezogenen Schultern' }
      ] });
  })();

  /* Seitheben an der Maschine: the elbows are bent forwards (so the forearms point at us) and rest on the pads; the upper arms swing up to the sides */
  (function () {
    function pose(a, extra) { return seated(Object.assign({ arms: [a, a], us: 1, fs: 0.15 }, extra || {})); }
    var low = pose(12), mid = pose(50), high = pose(86), over = pose(120, { sh: 9 });
    var pads = [{ t: 'plate', at: 'elL', dx: -2, r: 4 }, { t: 'plate', at: 'elR', dx: 2, r: 4 }];
    add('x-latmach', { view: 'f', reps: 3, hl: ['delt', 'upper'], thumb: 2, sweep: true, props: SEAT.concat(pads),
      steps: [
        { pose: low, ms: 1700, hold: 400, label: 'Langsam ablassen, etwa 3 Sekunden' },
        { pose: mid, ms: 500, hold: 0, label: 'Die Ellbogen seitlich nach oben schieben' },
        { pose: high, ms: 700, hold: 500, label: 'Bis auf Schulterhöhe heben, nicht höher' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam ablassen' },
        { pose: low, ms: 800, hold: 300, label: 'Langsam ablassen, etwa 3 Sekunden' },
        { pose: over, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu hoch, die Schultern wandern zu den Ohren' }
      ] });
  })();

  /* Aussenrotation mit Band: the elbow stays at the side, the forearm swings from across the belly (pointing in) forwards (pointing at us) and out to the side */
  (function () {
    function pose(a2, fs, extra) { return normF(Object.assign({ legs: [4, 0], armL: [6, 4], armR: [4, a2], fs: 1 }, extra || {}, { fs: fs })); }
    var inn = pose(-90, 1), fwd1 = pose(-90, 0.12), fwd2 = pose(90, 0.12), out = pose(90, 0.78);
    var bad = pose(90, 0.78, { armR: [38, 90] });
    var band = [{ t: 'strap', band: true, anchor: [96, 82], at: 'wrR' }, { t: 'anchor', x: 96, y: 76 }];
    add('x-extrot', { view: 'f', reps: 3, hl: ['delt', 'fore'], thumb: 3, sweep: true, props: band,
      steps: [
        { pose: inn, ms: 1300, hold: 400, label: 'Den Ellbogen am Körper lassen, der Unterarm liegt quer vor dem Bauch' },
        { pose: fwd1, ms: 600, hold: 0, label: 'Den Unterarm nach vorn und aussen drehen, der Ellbogen bleibt am Körper' },
        { pose: fwd2, ms: 40, hold: 0, label: 'Den Unterarm nach vorn und aussen drehen, der Ellbogen bleibt am Körper' },
        { pose: out, ms: 600, hold: 700, label: 'Bis etwa 45° nach aussen drehen, kurz halten' },
        { pose: fwd2, ms: 600, hold: 0, label: 'Langsam zurückdrehen' },
        { pose: fwd1, ms: 40, hold: 0, label: 'Langsam zurückdrehen' },
        { pose: inn, ms: 800, hold: 300, label: 'Den Ellbogen am Körper lassen, der Unterarm liegt quer vor dem Bauch' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Ellbogen löst sich vom Körper' }
      ] });
  })();


  /* ===== Maschinen im Sitzen, von der Seite gesehen ===== */
  var SEAT_H = [100, 145];                                 // hip on the seat; the seat box top is at 150
  function seatBox() { return { t: 'box', x: 78, y: 150, w: 44, h: 28 }; }
  function backPad(top) { return { t: 'rail', x1: 91, y1: 152, x2: 88, y2: top || 80 }; }

  /* Schulterpresse an der Maschine: back against the pad, the grips go from shoulder height straight up */
  (function () {
    var H = SEAT_H, A = [150, G];
    var sh = shOf(H, -4);
    var low = norm({ hip: H, th: -4, ankle: A, wrist: [sh[0] + 13, sh[1] - 17], ha: -2, es: 1 });
    var mid = norm({ hip: H, th: -4, ankle: A, wrist: [sh[0] + 10, sh[1] - 34], ha: -2, es: 1 });
    var high = norm({ hip: H, th: -4, ankle: A, wrist: [sh[0] + 7, sh[1] - 46], ha: -2, es: 1 });
    var shB = shOf(H, 16);
    var bad = norm({ hip: H, th: 16, ankle: A, wrist: [shB[0] + 16, shB[1] - 40], ha: 24, es: 1 });
    add('x-shpress', { reps: 3, hl: ['delt', 'upper'], thumb: 2, sweep: true,
      props: [{ t: 'box', x: 40, y: 98, w: 24, h: 80 }, seatBox(), backPad(76), { t: 'rail', x1: 70, y1: 178, x2: 70, y2: 22 }, { t: 'rail', x1: 70, y1: 22, x2: 150, y2: 22 },
        { t: 'plate', at: 'wrist', r: 3.5 }],
      steps: [
        { pose: low, ms: 1600, hold: 400, label: 'Die Griffe kontrolliert bis auf Schulterhöhe ablassen, der Rücken bleibt am Polster' },
        { pose: mid, ms: 500, hold: 0, label: 'Die Griffe nach oben drücken' },
        { pose: high, ms: 600, hold: 500, label: 'Bis die Arme fast gestreckt sind, die Schultern bleiben unten' },
        { pose: mid, ms: 900, hold: 0, label: 'Kontrolliert ablassen' },
        { pose: low, ms: 700, hold: 300, label: 'Die Griffe kontrolliert bis auf Schulterhöhe ablassen, der Rücken bleibt am Polster' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Rücken löst sich vom Polster, Hohlkreuz' }
      ] });
  })();

  /* Bizepscurl an der Maschine (Scott-Pult): the upper arms lie on the sloped pad, only the forearms move */
  (function () {
    var H = [96, 145], th = 8, sh = shOf(H, th), A = [146, G];
    var ang = 38;                                          // the upper arm lies on the sloped pad, the elbow stays where the pad holds it
    var pose = function (la, extra) { return norm(Object.assign({ hip: H, th: th, ankle: A, ua: ang, la: la, ha: 14 }, extra || {})); };
    var down = pose(ang), mid = pose(110), up = pose(200);
    var bad = norm({ hip: H, th: -14, ankle: A, ua: 20, la: 140, ha: -10 });
    add('x-curlmach', { reps: 3, hl: ['upper'], thumb: 2, sweep: true,
      props: [seatBox(), backPad(76),
        { t: 'poly', pts: [[sh[0] + 3, sh[1] + 8], [sh[0] + 33, sh[1] + 45], [sh[0] + 25, sh[1] + 52], [sh[0] - 4, sh[1] + 16]] },
        { t: 'rail', x1: sh[0] + 28, y1: sh[1] + 50, x2: sh[0] + 28, y2: 178 }, { t: 'plate', at: 'wrist', r: 3.5 }],
      steps: [
        { pose: down, ms: 1700, hold: 400, label: 'Langsam ablassen, bis die Arme fast gestreckt sind' },
        { pose: mid, ms: 600, hold: 0, label: 'Die Griffe zu den Schultern curlen, die Oberarme bleiben auf dem Polster' },
        { pose: up, ms: 600, hold: 700, label: 'Oben kurz anspannen' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam ablassen' },
        { pose: down, ms: 900, hold: 300, label: 'Langsam ablassen, bis die Arme fast gestreckt sind' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Mit Schwung aus dem Rücken, die Ellbogen heben ab' }
      ] });
  })();

  /* Trizepsstrecken an der Maschine (sitzend): the elbows stay at the sides, the grips are pressed down */
  (function () {
    var H = SEAT_H, A = [150, G], sh = shOf(H, -4);
    var pose = function (la, extra) { return norm(Object.assign({ hip: H, th: -4, ankle: A, ua: 6, la: la, ha: -2 }, extra || {})); };    // the elbows stay at the sides
    var bent = pose(84), mid = pose(40), straight = pose(6);
    var bad = norm({ hip: H, th: 14, ankle: A, ua: 28, la: 60, ha: 24 });
    add('x-trimach', { reps: 3, hl: ['upper'], thumb: 2, sweep: true,
      props: [{ t: 'box', x: 40, y: 98, w: 24, h: 80 }, seatBox(), backPad(76), { t: 'rail', x1: 70, y1: 178, x2: 70, y2: 60 }, { t: 'rail', x1: sh[0] + 30, y1: sh[1] + 20, x2: sh[0] + 8, y2: sh[1] + 49 },
        { t: 'plate', at: 'wrist', r: 3.5 }],
      steps: [
        { pose: bent, ms: 1500, hold: 400, label: 'Die Griffe langsam hochkommen lassen, die Ellbogen bleiben am Körper' },
        { pose: mid, ms: 450, hold: 0, label: 'Nach unten drücken' },
        { pose: straight, ms: 500, hold: 600, label: 'Die Arme ganz strecken und den Trizeps anspannen' },
        { pose: mid, ms: 800, hold: 0, label: 'Langsam zurückkommen lassen' },
        { pose: bent, ms: 700, hold: 300, label: 'Die Griffe langsam hochkommen lassen, die Ellbogen bleiben am Körper' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Mit dem Oberkörper nach vorn gedrückt, die Ellbogen wandern' }
      ] });
  })();

  /* Bauchmaschine (Crunch): the hips stay on the seat, the upper body rolls forward against the chest pad */
  (function () {
    var H = SEAT_H, A = [150, G];
    var up = norm({ hip: H, th: -4, ankle: A, wrist: [118, 104], ha: -2, es: 1 });
    var mid = norm({ hip: H, th: 14, ankle: A, wrist: [126, 108], ha: 14, round: 3, es: 1 });
    var crunch = norm({ hip: H, th: 32, ankle: A, wrist: [132, 118], ha: 36, round: 7, es: 1 });
    var bad = norm({ hip: H, th: 20, ankle: A, wrist: [140, 98], ha: 62, hdx: 8, round: 2, es: 1 });
    add('x-crunchmach', { reps: 3, hl: ['torso'], thumb: 2, sweep: true,
      props: [{ t: 'box', x: 40, y: 98, w: 24, h: 80 }, seatBox(), backPad(76), { t: 'strap', anchor: [66, 120], at: 'sh', dx: 11, dy: 7 }, { t: 'pad', at: 'sh', dx: 11, dy: 7, ang: 70, len: 22 }],
      steps: [
        { pose: up, ms: 1600, hold: 400, label: 'Langsam zurückkommen lassen, der Rücken berührt das Polster' },
        { pose: mid, ms: 500, hold: 0, label: 'Den Oberkörper aus dem Bauch heraus nach vorn rollen' },
        { pose: crunch, ms: 600, hold: 600, label: 'Den Bauch fest anspannen, kurz halten' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam zurückkommen lassen' },
        { pose: up, ms: 700, hold: 300, label: 'Langsam zurückkommen lassen, der Rücken berührt das Polster' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Mit Armen und Nacken gezogen statt mit dem Bauch' }
      ] });
  })();

  /* Rudern an der Maschine (brustgestützt): the chest rests on the pad, the elbows are pulled back past the body */
  (function () {
    var H = [94, 146], th = 14, sh = shOf(H, th), A = [146, G];
    var gy = sh[1] + 8;
    var pose = function (dx, extra) { return norm(Object.assign({ hip: H, th: th, ankle: A, wrist: [sh[0] + dx, gy], ha: 6, es: 1 }, extra || {})); };
    var out = pose(47), mid = pose(26), pull = pose(2);
    var shB = shOf(H, -12);
    var bad = norm({ hip: H, th: -12, ankle: A, wrist: [shB[0] + 4, gy], ha: -8, es: 1 });
    add('x-machinerow', { reps: 3, hl: ['torso', 'upper'], thumb: 2, sweep: true,
      props: [{ t: 'box', x: 72, y: 151, w: 44, h: 27 }, { t: 'poly', pts: [[sh[0] + 5, sh[1] - 12], [sh[0] + 14, sh[1] - 12], [sh[0] + 18, sh[1] + 34], [sh[0] + 9, sh[1] + 34]] },
        { t: 'rail', x1: sh[0] + 14, y1: sh[1] + 36, x2: sh[0] + 14, y2: 178 }, { t: 'rail', x1: sh[0] + 18, y1: gy, x2: 200, y2: gy },
        { t: 'box', x: 204, y: 100, w: 22, h: 78 }, { t: 'plate', at: 'wrist', r: 3.5 }],
      steps: [
        { pose: out, ms: 1500, hold: 400, label: 'Langsam nach vorn gleiten lassen, die Brust bleibt am Polster' },
        { pose: mid, ms: 500, hold: 0, label: 'Die Ellbogen nach hinten ziehen' },
        { pose: pull, ms: 600, hold: 600, label: 'Die Schulterblätter zusammenziehen, kurz halten' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam zurückgleiten lassen' },
        { pose: out, ms: 700, hold: 300, label: 'Langsam nach vorn gleiten lassen, die Brust bleibt am Polster' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Mit dem Oberkörper nach hinten geschaukelt' }
      ] });
  })();

  /* Klimmzug-Maschine mit Gegengewicht: kneeling on the pad that carries part of the body weight, the pad rises with every repetition */
  (function () {
    var kx = 148, W = [kx + 3, 24];
    function kneel(ky, th, extra) {
      var hip = [kx, ky - 36], sh = shOf(hip, th);
      return norm(Object.assign({ hip: hip, th: th, ankle: [kx - 36, ky], fa: 90, wrist: W, ha: th * 0.4, es: 1, ks: -1 }, extra || {}));
    }
    var hang = kneel(155.7, 0);                              // the handles are just in reach of the straight arms
    var top = kneel(110, -6);
    var mid = kneel(133, -3);
    var half = kneel(128, -4);
    add('x-assistpull', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'rail', x1: 214, y1: 8, x2: 214, y2: 178 }, { t: 'rail', x1: 214, y1: W[1], x2: W[0], y2: W[1] }, { t: 'strap', anchor: [kx - 12, 176], at: 'knee', dx: -12, dy: 5 },
        { t: 'pad', at: 'knee', dx: -4, dy: 5, ang: 0, len: 44 }, { t: 'box', x: kx - 40, y: 168, w: 56, h: 10 }],
      steps: [
        { pose: hang, ms: 1700, hold: 400, label: 'Langsam ablassen, bis die Arme gestreckt sind' },
        { pose: mid, ms: 600, hold: 0, label: 'Ellbogen nach unten ziehen' },
        { pose: top, ms: 700, hold: 600, label: 'Hochziehen, bis das Kinn auf Höhe der Griffe ist' },
        { pose: mid, ms: 1000, hold: 0, label: 'Langsam ablassen' },
        { pose: hang, ms: 800, hold: 300, label: 'Langsam ablassen, bis die Arme gestreckt sind' },
        { pose: half, ms: 800, hold: 1200, bad: true, label: 'Falsch: Nur halb hochgezogen, die Schultern wandern zu den Ohren' }
      ] });
  })();

  /* Face Pull am Kabelzug: the rope goes to the face, the elbows high and wide */
  (function () {
    var A = [120, G], hip = [118, G - 71.4], th = -6, sh = shOf(hip, th);
    var P = [214, 54];
    var pose = function (w, es, extra) { return norm(Object.assign({ hip: hip, th: th, ankle: A, wrist: [sh[0] + w[0], sh[1] + w[1]], ha: -2, es: es }, extra || {})); };
    var out = pose([47, 2], -1), mid = pose([28, -2], -1), pull = pose([12, -8], 1);
    var hipB = [112, G - 68], shB = shOf(hipB, -26);
    var bad = norm({ hip: hipB, th: -26, ankle: A, wrist: [shB[0] + 24, shB[1] + 18], ha: -14, es: 1 });
    add('x-facepull', { reps: 3, hl: ['trap', 'upper', 'delt'], thumb: 2, sweep: true,
      props: [{ t: 'rail', x1: 232, y1: 8, x2: 232, y2: 178 }, { t: 'rail', x1: 232, y1: P[1], x2: P[0], y2: P[1] }, { t: 'pulley', x: P[0], y: P[1] }, { t: 'strap', anchor: P, at: 'wrist' }],
      steps: [
        { pose: out, ms: 1500, hold: 400, label: 'Langsam nach vorn führen lassen, die Arme sind fast gestreckt' },
        { pose: mid, ms: 500, hold: 0, label: 'Das Seil zum Gesicht ziehen, die Ellbogen hoch' },
        { pose: pull, ms: 600, hold: 700, label: 'Die Hände neben die Ohren, die Schulterblätter zusammen' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam zurückführen' },
        { pose: out, ms: 700, hold: 300, label: 'Langsam nach vorn führen lassen, die Arme sind fast gestreckt' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu schwer, der Oberkörper lehnt weit zurück' }
      ] });
  })();

  /* Gestreckter Armzug am Kabel: the straight arms swing from in front of the head down to the thighs */
  (function () {
    var A = [140, G], hip = [118, G - 66], th = 18;
    var P = [196, 18];
    var pose = function (aa, extra) { return norm(Object.assign({ hip: hip, th: th, ankle: A, aa: aa, ha: 12 }, extra || {})); };
    var top = pose(142), mid = pose(80), low = pose(14);
    var hipB = [112, G - 64], bad = norm({ hip: hipB, th: 40, ankle: A, aa: 62, al: 30, ha: 40 });
    add('x-straightarm', { reps: 3, hl: ['torso', 'upper'], thumb: 2, sweep: true,
      props: [{ t: 'rail', x1: 232, y1: 8, x2: 232, y2: 178 }, { t: 'rail', x1: 232, y1: P[1], x2: P[0], y2: P[1] }, { t: 'pulley', x: P[0], y: P[1] }, { t: 'strap', anchor: P, at: 'wrist' }],
      steps: [
        { pose: top, ms: 1500, hold: 400, label: 'Die Arme langsam nach oben führen lassen, sie bleiben gestreckt' },
        { pose: mid, ms: 500, hold: 0, label: 'Die gestreckten Arme in einem Bogen nach unten ziehen' },
        { pose: low, ms: 600, hold: 600, label: 'Bis zu den Oberschenkeln, die Schulterblätter nach unten' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam zurückführen' },
        { pose: top, ms: 700, hold: 300, label: 'Die Arme langsam nach oben führen lassen, sie bleiben gestreckt' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Ellbogen beugen sich, Schwung aus dem Rücken' }
      ] });
  })();

  /* Rückenstrecker auf der 45°-Bank: the hips rest on the pad, the heels are held, the upper body goes from hanging down to a straight line */
  (function () {
    var hip = [150, 98], A = [hip[0] - 50.9, hip[1] - 50.9];
    function torso(theta) { return [hip[0] + 46 * Math.sin(theta * D2R), hip[1] + 46 * Math.cos(theta * D2R)]; }       // theta: 0 = hanging straight down, 45 = in line with the legs
    function pose(theta, extra) { var sh = torso(theta); return norm(Object.assign({ hip: hip, sh: sh, ankle: A, fa: 30, wrist: [sh[0] - 6, sh[1] - 4], ha: 170 - theta, es: 1 }, extra || {})); }
    var down = pose(8, { round: -8 }), mid = pose(28), top = pose(45), over = pose(78, { round: -7 });
    add('x-hyper', { reps: 3, hl: ['torso', 'glute'], thumb: 2, sweep: true,
      props: [{ t: 'rail', x1: 64, y1: 178, x2: 64, y2: 52 }, { t: 'rail', x1: 64, y1: 52, x2: 140, y2: 128 }, { t: 'rail', x1: 148, y1: 178, x2: 148, y2: 118 }, { t: 'rail', x1: 40, y1: 178, x2: 170, y2: 178 },
        { t: 'pad', at: 'hip', dx: -4, dy: 6, ang: 45, len: 40 }, { t: 'plate', at: 'ankle', dx: 4, dy: -4, r: 4 }],
      steps: [
        { pose: down, ms: 1600, hold: 400, label: 'Langsam nach unten rollen lassen, der Rücken bleibt lang' },
        { pose: mid, ms: 500, hold: 0, label: 'Den Oberkörper aufrichten' },
        { pose: top, ms: 600, hold: 700, label: 'Bis Oberkörper und Beine eine Linie bilden, das Gesäss anspannen' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam ablassen' },
        { pose: down, ms: 800, hold: 300, label: 'Langsam nach unten rollen lassen, der Rücken bleibt lang' },
        { pose: over, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu weit überstreckt, Hohlkreuz' }
      ] });
  })();

  /* ===== Beine und Gesäss an Maschinen ===== */

  /* Hackenschmidt-Kniebeuge: the back lies on a pad that slides along rails tilted back by 25 degrees, the feet stand on the platform in front */
  (function () {
    var beta = 25, dir = [Math.sin(beta * D2R), Math.cos(beta * D2R)], A = [158, 168];
    var P0 = [A[0] - 71.5 * Math.sin(20 * D2R), A[1] - 71.5 * Math.cos(20 * D2R)];
    function hipAt(t) { return [P0[0] + dir[0] * t, P0[1] + dir[1] * t]; }
    function pose(t, extra) {
      var hip = hipAt(t), sh = shOf(hip, -beta);
      return norm(Object.assign({ hip: hip, th: -beta, ankle: A, wrist: [sh[0] + 14, sh[1] + 21], ha: -beta + 8, es: 1 }, extra || {}));
    }
    var top = pose(0), mid = pose(12), bot = pose(24), bad = pose(24, { th: -12, round: 9, ha: 14, wrist: [hipAt(24)[0] + 4, hipAt(24)[1] - 24] });
    var B = [P0[0] - 24, P0[1] - 14];
    add('x-hack', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, sweep: true,
      props: [{ t: 'rail', x1: B[0] - 40 * dir[0], y1: B[1] - 40 * dir[1], x2: B[0] + 62 * dir[0], y2: B[1] + 62 * dir[1] }, { t: 'rail', x1: B[0] + 62 * dir[0], y1: B[1] + 62 * dir[1], x2: B[0] + 62 * dir[0], y2: 178 },
        { t: 'box', x: 128, y: 171, w: 66, h: 7 }, { t: 'pad', at: 'hip', dx: -14, dy: -19, ang: 65, len: 62 }],
      steps: [
        { pose: top, ms: 1300, hold: 500, label: 'Kräftig aufstehen, die Knie nicht ganz durchdrücken' },
        { pose: mid, ms: 600, hold: 0, label: 'Kontrolliert absenken, der Rücken bleibt am Polster' },
        { pose: bot, ms: 1000, hold: 600, label: 'Bis die Knie etwa im rechten Winkel gebeugt sind' },
        { pose: mid, ms: 500, hold: 0, label: 'Kräftig aufstehen' },
        { pose: top, ms: 900, hold: 300, label: 'Kräftig aufstehen, die Knie nicht ganz durchdrücken' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Unten rollt das Becken ein, der untere Rücken rundet sich' }
      ] });
  })();

  /* Kniebeuge an der Multipresse (Smith-Maschine): the bar only moves straight up and down, so the feet stand a little in front of it */
  (function () {
    var X = 120, A = [X + 24, G];
    function pose(shy, th, extra) { return norm(Object.assign({ sh: [X, shy], th: th, ankle: A, wr: [-8, 0], ha: th * 0.4 - 4, es: -1 }, extra || {})); }
    var top = pose(62, 4), mid = pose(88, 18), bot = pose(112, 32), bad = pose(108, 52, { ha: 26 });
    add('x-smith', { reps: 3, hl: ['thigh', 'glute'], thumb: 1, sweep: true,
      props: [{ t: 'rail', x1: X - 22, y1: 6, x2: X - 22, y2: 178 }, { t: 'rail', x1: X + 20, y1: 6, x2: X + 20, y2: 178 }, { t: 'plate', at: 'wrist', dx: -3, dy: -1, r: 7 }],
      steps: [
        { pose: top, ms: 1300, hold: 500, label: 'Kräftig aufstehen, Hüfte und Knie strecken' },
        { pose: mid, ms: 700, hold: 0, label: 'Kontrolliert absenken, die Stange gleitet senkrecht' },
        { pose: bot, ms: 1000, hold: 600, label: 'Hüfte nach hinten, bis die Oberschenkel fast waagrecht sind' },
        { pose: mid, ms: 500, hold: 0, label: 'Kräftig aufstehen' },
        { pose: top, ms: 900, hold: 300, label: 'Kräftig aufstehen, Hüfte und Knie strecken' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Oberkörper klappt nach vorn, die Füsse stehen zu weit hinten' }
      ] });
  })();

  /* Wadenheben an der Beinpresse: the legs stay almost straight, only the ankles move the plate */
  (function () {
    var H = [118, 144], dir = [Math.cos(38 * D2R), -Math.sin(38 * D2R)], hands = [122, 134];
    function foot(d) { return [H[0] + d * dir[0], H[1] + d * dir[1]]; }
    function pose(d, fa, extra) { return norm(Object.assign({ hip: H, th: -55, ankle: foot(d), fa: fa, wrist: hands, ha: -55 }, extra || {})); }
    var low = pose(70.5, -146), high = pose(70.5, -98), bad = pose(60, -98, { round: 3 });
    add('x-calfpress', { reps: 3, hl: ['shin'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 96, y: 149, w: 46, h: 29 }, { t: 'rail', x1: 121, y1: 151, x2: 66, y2: 111 }, { t: 'rail', x1: 136, y1: 150, x2: 206, y2: 90 }, { t: 'pad', at: 'toe', dx: 2, dy: -3, ang: 128, len: 46 }],
      steps: [
        { pose: low, ms: 1500, hold: 500, label: 'Die Fersen langsam zurücksinken lassen, die Beine bleiben fast gestreckt' },
        { pose: high, ms: 1000, hold: 700, label: 'Mit den Zehenballen wegdrücken, oben 1 Sekunde halten' },
        { pose: low, ms: 1500, hold: 300, label: 'Die Fersen langsam zurücksinken lassen, die Beine bleiben fast gestreckt' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Knie beugen und strecken sich mit' }
      ] });
  })();

  /* Wadenheben stehend an der Maschine: the shoulders are under the pads, the heels sink and rise */
  (function () {
    var wr = [10, 6];
    var lo = norm({ hip: [150, G - 70], th: 2, ankle: [150, G], wr: wr, es: 1 });
    var hi = norm({ hip: [153, G - 80], th: 2, ankle: [154.1, G - 10], fa: 45.6, wr: wr, es: 1 });
    var bad = norm({ hip: [160, G - 68], th: 6, ankle: [154.1, G - 10], fa: 45.6, wr: wr, es: 1 });
    add('x-calfmach', { reps: 3, hl: ['shin'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 40, y: 70, w: 24, h: 108 }, { t: 'rail', x1: 70, y1: 178, x2: 70, y2: 28 }, { t: 'strap', anchor: [70, 28], at: 'sh', dx: -2, dy: -8 }, { t: 'pad', at: 'sh', dx: -2, dy: -8, ang: 0, len: 18 }],
      steps: [
        { pose: lo, ms: 1500, hold: 400, label: 'Langsam ablassen, die Fersen sinken bis zum Boden' },
        { pose: hi, ms: 1100, hold: 700, label: 'Fersen hoch auf die Zehen, oben 1 Sekunde halten' },
        { pose: lo, ms: 1500, hold: 300, label: 'Langsam ablassen, die Fersen sinken bis zum Boden' },
        { pose: bad, ms: 800, hold: 1100, bad: true, label: 'Falsch: Die Knie beugen sich, die Wade arbeitet kaum' }
      ] });
  })();

  /* Gesäss-Kickback an der Maschine: the chest rests on the pad, one foot on the lever plate pushes back and up */
  (function () {
    var hip = [128, 103], th = 24, sh = shOf(hip, th), A = [136, G];
    var t = [Math.sin(th * D2R), -Math.cos(th * D2R)], n = [Math.cos(th * D2R), Math.sin(th * D2R)];
    var c = [hip[0] + 33 * t[0] + 9 * n[0], hip[1] + 33 * t[1] + 9 * n[1]];
    var pt = function (a, b) { return [c[0] + a * t[0] + b * n[0], c[1] + a * t[1] + b * n[1]]; };
    function pose(a2, extra) { return norm(Object.assign({ hip: hip, th: th, ankle: A, ankle2: a2, fa2: 25, wrist: [sh[0] + 18, sh[1] + 14], ha: 22, es: 1 }, extra || {})); }
    var start = pose([hip[0] + 6, hip[1] + 62]), mid = pose([hip[0] - 22, hip[1] + 54]), end = pose([hip[0] - 48, hip[1] + 38]);
    var bad = pose([hip[0] - 60, hip[1] + 20], { th: 6, round: -9, ha: 8, wrist: [hip[0] + 20, hip[1] - 22] });
    add('x-glutekick', { reps: 3, hl: ['glute'], thumb: 2, sweep: true,
      props: [{ t: 'poly', pts: [pt(-20, -3), pt(20, -3), pt(20, 5), pt(-20, 5)] }, { t: 'rail', x1: pt(20, 1)[0], y1: pt(20, 1)[1], x2: pt(20, 1)[0] + 6, y2: 178 },
        { t: 'strap', anchor: [166, 172], at: 'ankle2', dy: 5 }, { t: 'pad', at: 'ankle2', dx: -2, dy: 5, ang: 0, len: 18 }],
      steps: [
        { pose: start, ms: 1500, hold: 400, label: 'Langsam zurückkommen lassen, der Oberkörper bleibt am Polster' },
        { pose: mid, ms: 500, hold: 0, label: 'Das Bein nach hinten drücken' },
        { pose: end, ms: 600, hold: 700, label: 'Hüfte strecken, das Gesäss fest anspannen, kurz halten' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam zurückkommen lassen' },
        { pose: start, ms: 700, hold: 300, label: 'Langsam zurückkommen lassen, der Oberkörper bleibt am Polster' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Hohlkreuz, das Bein wird mit Schwung hochgeschleudert' }
      ] });
  })();

  /* ===== Rücken und Brust an Maschinen und Bank ===== */

  /* Rückenstrecker an der Maschine (sitzend): the pelvis is fixed, the back pushes the pad backwards until the body is upright */
  (function () {
    var H = SEAT_H, A = [150, G];
    function pose(th, extra) { return norm(Object.assign({ hip: H, th: th, ankle: A, wr: [10, 10], ha: th * 0.4, es: 1 }, extra || {})); }
    var flexed = pose(30), mid = pose(14), upright = pose(-4), bad = pose(-24, { round: -9, ha: -22 });
    add('x-lumbar', { reps: 3, hl: ['torso'], thumb: 2, sweep: true,
      props: [seatBox(), { t: 'box', x: 40, y: 98, w: 24, h: 80 }, { t: 'strap', anchor: [78, 140], at: 'sh', dx: -8, dy: 8 }, { t: 'pad', at: 'hip', dx: 22, dy: -9, ang: 90, len: 14 }],
      steps: [
        { pose: flexed, ms: 1700, hold: 400, label: 'Langsam nach vorn kommen lassen, die Spannung bleibt' },
        { pose: mid, ms: 500, hold: 0, label: 'Den Rücken gegen das Polster drücken' },
        { pose: upright, ms: 600, hold: 700, label: 'Bis der Oberkörper aufrecht ist, kurz halten' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam nach vorn kommen lassen' },
        { pose: flexed, ms: 800, hold: 300, label: 'Langsam nach vorn kommen lassen, die Spannung bleibt' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Zu weit nach hinten gedrückt, Hohlkreuz' }
      ] });
  })();

  /* Schrägbankdrücken mit Kurzhanteln: the bench is tilted by 30 degrees, the dumbbells go from the upper chest straight up */
  (function () {
    var S = [80, 119], A = [164, G], th = -60;
    var pose = function (wrist, extra) { return norm(Object.assign({ sh: S, th: th, ankle: A, wrist: wrist, ha: -52 }, extra || {})); };
    var up = pose([S[0] + 9, S[1] - 47]), dn = pose([S[0] + 14, S[1] - 7]);
    var bad = pose([S[0] + 14, S[1] - 9], { th: -82, round: -8 });
    var tdir = [Math.sin(th * D2R), -Math.cos(th * D2R)], head = [S[0] + 34 * tdir[0], S[1] + 34 * tdir[1]], seat = [S[0] - 40 * tdir[0] + 4, S[1] - 40 * tdir[1] + 3];
    add('x-inclinedb', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'poly', pts: [[head[0] - 3, head[1] + 3], [seat[0] - 3, seat[1] + 3], [seat[0] - 8, seat[1] + 11], [head[0] - 8, head[1] + 11]] }, { t: 'box', x: 112, y: 148, w: 44, h: 30 },
        { t: 'rail', x1: head[0] - 5, y1: head[1] + 8, x2: head[0] - 5, y2: 178 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 7 }],
      steps: [
        { pose: up, ms: 1100, hold: 500, label: 'Die Hanteln hochdrücken, bis die Arme fast gestreckt sind' },
        { pose: dn, ms: 1700, hold: 400, label: 'Die Hanteln kontrolliert zur oberen Brust senken' },
        { pose: up, ms: 1100, hold: 300, label: 'Die Hanteln hochdrücken, bis die Arme fast gestreckt sind' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Das Gesäss hebt ab, Hohlkreuz' }
      ] });
  })();

  /* ===== Bauch ===== */

  /* Beinheben im Stütz (Captain's Chair): the back against the pad, the forearms on the rests, the knees come up towards the chest */
  (function () {
    var sh = [100, 44];
    function pose(hip, th, ankle, extra) { return norm(Object.assign({ hip: hip, th: th, ankle: ankle, fa: 60, wrist: [sh[0] + 26, sh[1] + 26], ha: 0, es: 1 }, extra || {})); }
    var hip = [100, 90];
    var down = pose(hip, 0, [100.5, 161.5]), mid = pose(hip, 0, [128, 126]), up = pose(hip, 0, [112, 106], { round: 2 });
    var bad = pose([108, 92], -14, [166, 110], { ha: -12 });
    add('x-captain', { reps: 3, hl: ['torso', 'thigh'], thumb: 2, sweep: true,
      props: [{ t: 'rail', x1: 90, y1: 32, x2: 90, y2: 142 }, { t: 'pad', at: 'wrist', dx: -12, dy: 5, ang: 0, len: 34 }, { t: 'rail', x1: 120, y1: 76, x2: 120, y2: 178 }, { t: 'rail', x1: 70, y1: 178, x2: 150, y2: 178 }, { t: 'plate', at: 'wrist', r: 3 }],
      steps: [
        { pose: down, ms: 1500, hold: 400, label: 'Langsam ablassen, die Beine hängen ruhig' },
        { pose: mid, ms: 500, hold: 0, label: 'Die Knie zum Bauch ziehen' },
        { pose: up, ms: 600, hold: 600, label: 'Das Becken leicht aufrollen und kurz halten' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam ablassen' },
        { pose: down, ms: 700, hold: 300, label: 'Langsam ablassen, die Beine hängen ruhig' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Mit Schwung gehoben, der Körper schaukelt' }
      ] });
  })();

  /* Holzhacker am Kabelzug (von vorn gesehen): both hands guide the rope diagonally from high on one side to low on the other, the trunk turns with it */
  (function () {
    function pose(a, extra) { return normF(Object.assign({ legs: [10, 4], armL: [a, a], armR: [-a, -a] }, extra || {})); }
    var hi = pose(142, { lean: -9 }), mid = pose(90, { lean: 0 }), lo = pose(-40, { lean: 11 }), bad = pose(-40, { lean: 26, sh: 6 });
    add('x-woodchop', { view: 'f', reps: 3, hl: ['torso', 'trap'], thumb: 2, sweep: true,
      props: [{ t: 'pulley', x: 62, y: 16 }, { t: 'link', a: 'wrL', b: 'wrR' }, { t: 'strap', anchor: [62, 16], at: 'wrL' }],
      steps: [
        { pose: hi, ms: 1400, hold: 400, label: 'Die gestreckten Arme schräg nach oben zur Kabelseite führen lassen' },
        { pose: mid, ms: 500, hold: 0, label: 'Das Seil diagonal nach unten ziehen, der Rumpf dreht mit' },
        { pose: lo, ms: 600, hold: 600, label: 'Bis neben das Knie der anderen Seite, den Bauch anspannen' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam zurückführen' },
        { pose: hi, ms: 700, hold: 300, label: 'Die gestreckten Arme schräg nach oben zur Kabelseite führen lassen' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Oberkörper knickt seitlich ein statt zu drehen' }
      ] });
  })();

  /* ===== weitere Maschinen und Übungen aus Fitness- und Reha-Zentren ===== */

  /* Beinbeuger sitzend: the thighs are held down by a pad, the heels curl down and back under the seat */
  (function () {
    var H = [100, 134], th = -12, sh = shOf(H, th);
    function pose(a, extra) { return norm(Object.assign({ hip: H, th: th, ankle: a, fa: 30, wrist: [sh[0] + 12, sh[1] + 23], ha: -6, es: 1 }, extra || {})); }
    var out = pose([170, 139]), mid = pose([150, 152]), curl = pose([112, 166]);
    var bad = pose([114, 164], { hip: [100, 127], th: 12, ha: 16, wrist: [sh[0] + 28, sh[1] + 26] });
    add('x-legcurlseat', { reps: 3, hl: ['thigh'], thumb: 2, sweep: true,
      props: [{ t: 'box', x: 76, y: 138, w: 52, h: 40 }, { t: 'rail', x1: 90, y1: 136, x2: 86, y2: 66 }, { t: 'pad', at: 'knee', dx: -14, dy: -8, ang: 0, len: 26 }, { t: 'plate', at: 'ankle', dx: -1, dy: 6, r: 5 }],
      steps: [
        { pose: out, ms: 1700, hold: 400, label: 'Langsam strecken lassen, die Oberschenkel bleiben unter dem Polster' },
        { pose: mid, ms: 500, hold: 0, label: 'Die Fersen nach unten und hinten ziehen' },
        { pose: curl, ms: 600, hold: 700, label: 'Die Fersen unter den Sitz ziehen, oben 1 Sekunde halten' },
        { pose: mid, ms: 900, hold: 0, label: 'Langsam strecken lassen' },
        { pose: out, ms: 800, hold: 300, label: 'Langsam strecken lassen, die Oberschenkel bleiben unter dem Polster' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Oberkörper beugt sich vor, das Gesäss hebt ab' }
      ] });
  })();

  /* Hüftabduktion am Kabelzug (von vorn gesehen): the cuff on the ankle is pulled by the low pulley, the leg goes out to the side */
  (function () {
    function pose(a, extra) { return normF(Object.assign({ armL: [30, 24], armR: [30, 24], legL: [0, 0], legR: [a, a] }, extra || {})); }
    var near = pose(3), out = pose(32), bad = pose(40, { lean: -12, sh: 6 });
    add('x-cablehip', { view: 'f', reps: 3, hl: ['glute', 'thigh'], thumb: 1, sweep: true,
      props: [{ t: 'pulley', x: 62, y: 170 }, { t: 'rail', x1: 40, y1: 178, x2: 62, y2: 170 }, { t: 'strap', anchor: [62, 170], at: 'anR' }],
      steps: [
        { pose: near, ms: 1600, hold: 400, label: 'Langsam zurückführen, das Standbein bleibt gerade und stabil' },
        { pose: out, ms: 1100, hold: 600, label: 'Das Bein gestreckt zur Seite führen, der Oberkörper bleibt aufrecht' },
        { pose: near, ms: 1600, hold: 300, label: 'Langsam zurückführen, das Standbein bleibt gerade und stabil' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Oberkörper kippt zur Seite, das Bein wird geschwungen' }
      ] });
  })();

  /* Kniestrecken mit Band (terminale Knieextension): the band pulls the knee forwards, the knee presses back until the leg is straight */
  (function () {
    var A = [150, G], AN = [226, 134];
    var bent = norm({ hip: [149, G - 63], th: 0, ankle: A, wr: [4, 46], ha: 0 });
    var straight = norm({ hip: [150, G - 71.5], th: 0, ankle: A, wr: [4, 46], ha: 0 });
    var bad = norm({ hip: [140, G - 62], th: 16, ankle: A, wr: [8, 44], ha: 12 });
    add('x-tke', { reps: 3, hl: ['thigh'], thumb: 1, sweep: true,
      props: [{ t: 'anchor', x: AN[0], y: AN[1] - 3 }, { t: 'strap', band: true, anchor: AN, at: 'knee', dx: -4 }],
      steps: [
        { pose: bent, ms: 1300, hold: 300, label: 'Das Knie leicht gebeugt, das Band zieht das Knie nach vorn' },
        { pose: straight, ms: 1000, hold: 800, label: 'Das Knie gegen das Band ganz strecken und den Oberschenkel anspannen' },
        { pose: bent, ms: 1300, hold: 300, label: 'Das Knie leicht gebeugt, das Band zieht das Knie nach vorn' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Oberkörper kippt vor, das Knie wird nicht gestreckt' }
      ] });
  })();

  /* Einbeinstand: the other knee is lifted to hip height, the arms help to balance; seconds are counted */
  (function () {
    var A = [150, G], hip = [150, G - 71.5];
    var rest = norm({ hip: hip, th: 0, ankle: A, ankle2: [153, G], wr: [14, 24], ha: 0 });
    var hold = norm({ hip: hip, th: 0, ankle: A, ankle2: [hip[0] + 36, hip[1] + 36], fa2: 20, wr: [16, 22], ha: 0 });
    var bad = norm({ hip: [146, G - 66], th: 14, ankle: A, ankle2: [hip[0] + 30, hip[1] + 44], fa2: 20, wr: [26, 14], ha: 14 });
    add('x-balance', { reps: 2, hl: ['thigh', 'glute'], thumb: 1, sweep: true, props: [],
      steps: [
        { pose: rest, ms: 1000, hold: 400, label: 'Aufrecht stehen, den Blick auf einen festen Punkt richten' },
        { pose: hold, ms: 1100, hold: 1400, label: 'Ein Knie auf Hüfthöhe heben und ruhig stehen bleiben' },
        { pose: rest, ms: 1000, hold: 300, label: 'Wieder abstellen' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Der Oberkörper kippt, das Standbein knickt ein' }
      ] });
  })();

})(typeof module !== 'undefined' && module.exports ? require('./fig.js') : FIG);
