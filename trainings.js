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

  /* ==== ready-made trainings below ==== */
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { TEMPLATES: TEMPLATES, TEMPLATE_MAP: TEMPLATE_MAP };
