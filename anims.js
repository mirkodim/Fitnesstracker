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

  /* Kettlebell-Swing: the hips drive the bell, the arms only guide it */
  (function () {
    var A = [150, G], bell = { t: 'bell', at: 'wrist', dx: 0, dy: 15, r: 8 };
    var back = norm({ hip: [128, G - 64], th: 62, ankle: A, wrist: [142, G - 48], ha: 40 });
    var mid = norm({ hip: [140, G - 66], th: 34, ankle: A, wrist: [205.7, 97] });
    var top = norm({ hip: [152, G - 70], th: 2, ankle: A, wrist: [201.6, 56] });
    var bad = norm({ hip: [158, G - 68], th: -14, ankle: A, wrist: [192, 60] });
    add('x-swing', { reps: 4, hl: ['glute', 'thigh'], thumb: 0, sweep: true, props: [bell],
      steps: [
        { pose: back, ms: 800, hold: 150, label: 'Hüfte nach hinten, die Kugel schwingt zwischen den Beinen durch' },
        { pose: mid, ms: 400, hold: 0, label: 'Die Hüfte kräftig nach vorn schieben' },
        { pose: top, ms: 400, hold: 250, label: 'Oben aufrecht, die Arme führen die Kugel nur bis Brusthöhe' },
        { pose: bad, ms: 500, hold: 1100, bad: true, label: 'Falsch: Oben ins Hohlkreuz gelehnt' },
        { pose: mid, ms: 600, hold: 0, label: 'Die Kugel fällt, die Hüfte geht wieder nach hinten' }
      ] });
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

  /* Kurzhantel-Bankdrücken (incline): the back rests on a tilted pad, the dumbbells go straight up */
  (function () {
    var S = [86, 108], A = [172, G];
    var pose = function (wrist) { return norm({ sh: S, th: -60, ankle: A, wrist: wrist, ha: -50 }); };
    var up = pose([88, 62]), dn = pose([98, 106]), bad = pose([116, 72]);
    add('x-dbpress', { reps: 3, hl: ['torso', 'upper'], thumb: 0, sweep: true,
      props: [{ t: 'rail', x1: 73.8, y1: 109, x2: 122.3, y2: 137.1 }, { t: 'box', x: 108, y: 135.5, w: 44, h: 42.5 }, { t: 'plate', at: 'wrist', dx: 0, dy: 0, r: 6 }],
      steps: [
        { pose: up, ms: 1100, hold: 500, label: 'Die Hanteln hochdrücken, über der Schulter treffen sie sich fast' },
        { pose: dn, ms: 1700, hold: 400, label: 'Langsam senken, bis die Ellbogen knapp unter Brusthöhe sind' },
        { pose: up, ms: 1100, hold: 300, label: 'Die Hanteln hochdrücken, über der Schulter treffen sie sich fast' },
        { pose: bad, ms: 900, hold: 1200, bad: true, label: 'Falsch: Die Hanteln wandern nach vorn, die Schultern werden belastet' }
      ] });
  })();

  /* Brustpresse: seated against the pad, the handles go straight forward from the chest */
  (function () {
    var H = [100, 145], A = [150, G], PV = [190, 100];
    var start = norm({ hip: H, th: -5, ankle: A, wrist: [108, 108], ha: -4 });
    var press = norm({ hip: H, th: -5, ankle: A, wrist: [144, 100], ha: -4 });
    var bad = norm({ hip: H, th: 15, ankle: A, wrist: [150, 100], ha: 25 });
    add('x-chestpress', { reps: 3, hl: ['torso', 'upper'], thumb: 1, sweep: true,
      props: [{ t: 'box', x: 78, y: 147, w: 40, h: 31 }, { t: 'rail', x1: 90, y1: 150, x2: 87, y2: 80 }, { t: 'rail', x1: PV[0], y1: 60, x2: PV[0], y2: 178 },
        { t: 'pulley', x: PV[0], y: PV[1] }, { t: 'strap', anchor: PV, at: 'wrist' }],
      steps: [
        { pose: start, ms: 1500, hold: 400, label: 'Kontrolliert zurückkommen lassen, die Ellbogen etwas hinter dem Körper' },
        { pose: press, ms: 1100, hold: 500, label: 'Gleichmässig nach vorn drücken, nicht ganz durchstrecken' },
        { pose: start, ms: 1500, hold: 300, label: 'Kontrolliert zurückkommen lassen, die Ellbogen etwas hinter dem Körper' },
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

  /* ==== new animations below ==== */

})(typeof module !== 'undefined' && module.exports ? require('./fig.js') : FIG);
