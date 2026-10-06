/* The trainings that come with the app. "A" and "B" are the two days of the first version (their ids are in old calendar entries, so they stay).
   The others are ready-made suggestions of 30 to 90 minutes. A training is a list of items { ex, sets, reps, rest, hold, note };
   what an item leaves out comes from the exercise in lib.js. Ids of ready-made trainings start with "p-". */
var TEMPLATES = [];
var TEMPLATE_MAP = {};

(function () {
  function tr(t) {
    if (TEMPLATE_MAP[t.id]) throw new Error('Doppelte Trainings-ID ' + t.id);
    TEMPLATES.push(t); TEMPLATE_MAP[t.id] = t;
  }

  tr({ id: 'A', name: 'Tag A', sub: 'Kniebeuge + Hüfte + Push', origin: true, kneeCheck: true, items: [
    { ex: 'a-box', sets: 3, reps: '8–10', rest: 90 },
    { ex: 'a-hip', sets: 3, reps: '8–12', rest: 90,
      note: '<b>Hip Thrust:</b> Start mit leichter Last (oder nur Körpergewicht bzw. Kurzhantel), Steigerung mit Physio oder MTT abstimmen. Beinvolumen pro Tag ist jetzt 6 Sätze, bei Schwellung oder Steifheit am Folgetag reduzieren.' },
    { ex: 'a-push', sets: 3, reps: 'max.', rest: 60 },
    { ex: 'a-tri', sets: 3, reps: '10–15', rest: 60 },
    { ex: 'a-plank', sets: 3, rest: 45, hold: 45 }
  ] });

  tr({ id: 'B', name: 'Tag B', sub: 'Hüftbeuge + Pull', origin: true, kneeCheck: true, items: [
    { ex: 'b-rdl', sets: 3, reps: '8–12', rest: 90 },
    { ex: 'b-row', sets: 3, reps: '10–15', rest: 60 },
    { ex: 'b-lunge', sets: 3, reps: '8–12', rest: 90 },
    { ex: 'b-curl', sets: 3, reps: '10–15', rest: 60 },
    { ex: 'b-crunch', sets: 3, reps: '10–15', rest: 45 }
  ] });

  /* ----- ohne Geräte und für den Einstieg ----- */

  tr({ id: 'p-einstieg', name: 'Ganzkörper für den Einstieg', sub: 'Ohne Geräte, ruhig und sanft', items: [
    { ex: 'x-catcow', sets: 2 }, { ex: 'x-squat', sets: 2 }, { ex: 'x-bridge', sets: 2 }, { ex: 'x-pushup-knee', sets: 2 }, { ex: 'x-birddog', sets: 2 },
    { ex: 'x-deadbug', sets: 2 }, { ex: 'x-superman', sets: 2 }, { ex: 'x-lunge', sets: 2 }, { ex: 'x-calf', sets: 2 }
  ] });

  tr({ id: 'p-urlaub', name: 'Urlaub: ohne alles', sub: 'Kein Gerät, wenig Platz', items: [
    { ex: 'x-squat', sets: 3 }, { ex: 'x-pushup-knee', sets: 3 }, { ex: 'x-lunge', sets: 3 }, { ex: 'x-bridge', sets: 3 },
    { ex: 'x-mountain', sets: 3 }, { ex: 'x-superman', sets: 3 }, { ex: 'x-crunch', sets: 3 }
  ] });

  tr({ id: 'p-beine-zuhause', name: 'Beine und Po zuhause', sub: 'Ohne Geräte, kräftigend', items: [
    { ex: 'x-squat', sets: 3 }, { ex: 'x-lunge', sets: 3 }, { ex: 'x-latlunge', sets: 3 }, { ex: 'x-bridge1', sets: 3 },
    { ex: 'x-donkey', sets: 3 }, { ex: 'x-sidelegraise', sets: 3 }, { ex: 'x-calf1', sets: 3 }, { ex: 'x-wallsit', sets: 2 }
  ] });

  tr({ id: 'p-core', name: 'Core und Bauch', sub: 'Rumpf ohne Geräte', items: [
    { ex: 'x-deadbug', sets: 3 }, { ex: 'x-crunch', sets: 3 }, { ex: 'x-bicycle', sets: 3 }, { ex: 'a-plank', sets: 3, hold: 45 },
    { ex: 'x-sideplank', sets: 2, hold: 20 }, { ex: 'x-hollow', sets: 3, hold: 20 }, { ex: 'x-legraise', sets: 3 }
  ] });

  tr({ id: 'p-hiit', name: 'Schwitzen in 30 Minuten', sub: 'Kurze Pausen, hoher Puls', items: [
    { ex: 'x-jack', sets: 3, rest: 30 }, { ex: 'x-squat', sets: 3, rest: 30 }, { ex: 'x-mountain', sets: 3, rest: 30 },
    { ex: 'x-pushup-knee', sets: 3, rest: 30 }, { ex: 'x-lunge', sets: 3, rest: 30 }, { ex: 'x-burpee', sets: 3, rest: 45 },
    { ex: 'x-crunch', sets: 3, rest: 30 }
  ] });

  /* ----- sanft, mit Bank und Band ----- */

  tr({ id: 'p-physio', name: 'Sanft und physionah', sub: 'Ruhiges Tempo, mit Bank und Band', items: [
    { ex: 'x-catcow', sets: 2 }, { ex: 'x-bridge', sets: 3 }, { ex: 'x-birddog', sets: 3 }, { ex: 'x-deadbug', sets: 3 },
    { ex: 'x-sidelegraise', sets: 3 }, { ex: 'x-monster', sets: 3 }, { ex: 'x-calf', sets: 2 }, { ex: 'x-toeraise', sets: 2 }
  ] });

  tr({ id: 'p-ruecken-haltung', name: 'Rücken und Haltung', sub: 'Sanft, mit Band', items: [
    { ex: 'x-catcow', sets: 2 }, { ex: 'x-birddog', sets: 3 }, { ex: 'x-superman', sets: 3 }, { ex: 'x-bandrow', sets: 4 },
    { ex: 'x-pullapart', sets: 4 }, { ex: 'x-chintuck', sets: 2 }, { ex: 'x-neckstretch', sets: 2 }, { ex: 'x-sideplank', sets: 2, hold: 20 }
  ] });

  tr({ id: 'p-nacken', name: 'Nacken und Schultern lockern', sub: 'Kurz und sanft gegen Verspannung', items: [
    { ex: 'x-chintuck', sets: 3 }, { ex: 'x-neckiso', sets: 3, hold: 15 }, { ex: 'x-neckstretch', sets: 3 }, { ex: 'x-shrug', sets: 3 },
    { ex: 'x-pullapart', sets: 3 }, { ex: 'x-lateral', sets: 3 }, { ex: 'x-catcow', sets: 2 }, { ex: 'x-sidebend', sets: 2 }
  ] });

  /* ----- Hanteln, Bank, Kettlebell, TRX ----- */

  tr({ id: 'p-arme', name: 'Arme mit Kurzhanteln', sub: 'Bizeps, Trizeps und Unterarme', items: [
    { ex: 'b-curl', sets: 3 }, { ex: 'x-ohtri', sets: 3 }, { ex: 'x-kickbacktri', sets: 3 }, { ex: 'x-wristcurl', sets: 3 },
    { ex: 'x-dips', sets: 3 }, { ex: 'x-farmer', sets: 3, hold: 30 }
  ] });

  tr({ id: 'p-brust-schultern', name: 'Brust und Schultern', sub: 'Mit Bank und Kurzhanteln', items: [
    { ex: 'x-dbpress', sets: 3 }, { ex: 'x-ohp', sets: 3 }, { ex: 'x-pushup-incl', sets: 3 }, { ex: 'x-lateral', sets: 3 },
    { ex: 'x-front', sets: 2 }, { ex: 'x-dips', sets: 3 }, { ex: 'x-shrug', sets: 3 }
  ] });

  tr({ id: 'p-heimgym', name: 'Ganzkörper mit Hanteln und Bank', sub: 'Das Heim-Gym', items: [
    { ex: 'x-goblet', sets: 3 }, { ex: 'x-dbrow', sets: 3 }, { ex: 'x-dbpress', sets: 3 }, { ex: 'a-hip', sets: 3 },
    { ex: 'x-ohp', sets: 3 }, { ex: 'b-curl', sets: 3 }, { ex: 'x-ohtri', sets: 3 }, { ex: 'a-plank', sets: 3, hold: 45 }
  ] });

  tr({ id: 'p-kettlebell', name: 'Kettlebell Kraft', sub: 'Eine Kugel, viel Wirkung', items: [
    { ex: 'x-swing', sets: 4 }, { ex: 'x-goblet', sets: 3 }, { ex: 'x-sumo', sets: 3 }, { ex: 'x-bridge', sets: 3 },
    { ex: 'x-farmer', sets: 3, hold: 45 }, { ex: 'x-deadbug', sets: 3 }
  ] });

  tr({ id: 'p-trx', name: 'TRX Ganzkörper', sub: 'Ein Band, überall aufhängen', items: [
    { ex: 'x-trxsquat', sets: 3 }, { ex: 'b-row', sets: 3 }, { ex: 'b-lunge', sets: 3 }, { ex: 'a-tri', sets: 3 },
    { ex: 'x-trxcurl', sets: 3 }, { ex: 'b-crunch', sets: 3 }
  ] });

  /* ----- Fitnessstudio ----- */

  tr({ id: 'p-beine-gym', name: 'Beine und Po im Fitnessstudio', sub: 'Beinpresse, Maschinen und Hantel', items: [
    { ex: 'x-legpress', sets: 3 }, { ex: 'x-goblet', sets: 3 }, { ex: 'x-bulgarian', sets: 3 }, { ex: 'x-legcurl', sets: 3 },
    { ex: 'x-legext', sets: 3 }, { ex: 'x-kickback', sets: 3 }, { ex: 'x-calf', sets: 3 }
  ] });

  tr({ id: 'p-maschinen', name: 'Ganzkörper an Maschinen', sub: 'Einfach zu bedienen', items: [
    { ex: 'x-legpress', sets: 3 }, { ex: 'x-chestpress', sets: 3 }, { ex: 'x-pulldown', sets: 3 }, { ex: 'x-legcurl', sets: 3 },
    { ex: 'x-cablerow', sets: 3 }, { ex: 'x-pushdown', sets: 3 }, { ex: 'x-cablecrunch', sets: 3 }
  ] });

  tr({ id: 'p-oberkoerper-kabel', name: 'Oberkörper an Kabel und Maschinen', sub: 'Brust, Rücken, Schultern und Arme', items: [
    { ex: 'x-chestpress', sets: 3 }, { ex: 'x-pulldown', sets: 3 }, { ex: 'x-cablefly', sets: 3 }, { ex: 'x-cablerow', sets: 3 },
    { ex: 'x-lateral', sets: 3 }, { ex: 'x-pushdown', sets: 3 }, { ex: 'x-cablecurl', sets: 3 }
  ] });

  tr({ id: 'p-kraft', name: 'Grundübungen mit der Langhantel', sub: 'Für Geübte, klassisch und schwer', items: [
    { ex: 'x-backsquat', sets: 4 }, { ex: 'x-bench', sets: 4 }, { ex: 'x-deadlift', sets: 3 }, { ex: 'x-pullup', sets: 3 },
    { ex: 'x-bbrow', sets: 3 }, { ex: 'x-ohp', sets: 3 }, { ex: 'x-bbcurl', sets: 3 }, { ex: 'x-skull', sets: 3 },
    { ex: 'x-hangknee', sets: 3 }, { ex: 'x-calf', sets: 3 }, { ex: 'x-hollow', sets: 3, hold: 30 }
  ] });

  tr({ id: 'p-gross', name: 'Der grosse Trainingstag', sub: 'Ganzkörper im Fitnessstudio, 90 Minuten', items: [
    { ex: 'x-legpress', sets: 4 }, { ex: 'x-slrdl', sets: 3 }, { ex: 'x-pulldown', sets: 4 }, { ex: 'x-dbpress', sets: 4 },
    { ex: 'x-cablerow', sets: 3 }, { ex: 'x-ohp', sets: 3 }, { ex: 'x-legcurl', sets: 3 }, { ex: 'x-pushdown', sets: 3 },
    { ex: 'x-cablecurl', sets: 3 }, { ex: 'x-cablecrunch', sets: 3 }, { ex: 'x-calf', sets: 3 }, { ex: 'x-lateral', sets: 3 },
    { ex: 'x-kickback', sets: 3 }
  ] });

  /* ==== ready-made trainings below ==== */
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { TEMPLATES: TEMPLATES, TEMPLATE_MAP: TEMPLATE_MAP };
