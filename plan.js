/* Constants of the app: body regions, equipment, levels, nutrition fields. Data only, no logic.
   The exercises are in lib.js, the ready-made trainings in trainings.js. Exercise ids are stored in the user's log and in saved trainings,
   so an id is never reused for a different exercise and never removed. */
var KNEE_NOTE = '<b>Knie:</b> Nur so tief und so schwer, wie es dir gut tut. Bei Knieproblemen Tiefe und Gewicht mit Physio oder MTT besprechen. Bei Schmerz stoppen.';

/* What the user can pick ("Was möchtest du heute trainieren?"). A group stands for one or more regions an exercise is filed under. */
var GROUPS = [
  { id: 'beine', label: 'Beine', leaves: ['oberschenkel', 'unterschenkel'] },
  { id: 'gesaess', label: 'Gesäss', leaves: ['gesaess'] },
  { id: 'arme', label: 'Arme', leaves: ['oberarme', 'unterarme'] },
  { id: 'ruecken', label: 'Rücken', leaves: ['ruecken'] },
  { id: 'bauch', label: 'Bauch', leaves: ['bauch'] },
  { id: 'brust', label: 'Brust', leaves: ['brust'] },
  { id: 'schultern', label: 'Schultern', leaves: ['schultern'] },
  { id: 'nacken', label: 'Nacken', leaves: ['nacken'] },
  { id: 'ganz', label: 'Ganzkörper', leaves: ['ganz'] }
];
var LEAVES = {
  oberschenkel: 'Oberschenkel', unterschenkel: 'Unterschenkel', gesaess: 'Gesäss', oberarme: 'Oberarme', unterarme: 'Unterarme',
  ruecken: 'Rücken', bauch: 'Bauch', brust: 'Brust', schultern: 'Schultern', nacken: 'Nacken', ganz: 'Ganzkörper'
};

/* Body weight is always there. In the lists of an exercise "kh|kb" means: one of the two is enough. */
var EQUIP = [
  { id: 'kh', label: 'Kurzhanteln', grp: 'Gewichte' },
  { id: 'lh', label: 'Langhantel', grp: 'Gewichte' },
  { id: 'kb', label: 'Kettlebell', grp: 'Gewichte' },
  { id: 'mb', label: 'Medizinball', grp: 'Gewichte' },
  { id: 'ma', label: 'Maschinen', grp: 'Geräte' },
  { id: 'kz', label: 'Kabelzug', grp: 'Geräte' },
  { id: 'bank', label: 'Bank', grp: 'Geräte' },
  { id: 'box', label: 'Kiste, Step oder stabiler Stuhl', short: 'Kiste', grp: 'Geräte' },
  { id: 'stange', label: 'Klimmzugstange', grp: 'Geräte' },
  { id: 'trx', label: 'TRX (Schlingentrainer)', short: 'TRX', grp: 'Zubehör' },
  { id: 'band', label: 'Widerstandsband', grp: 'Zubehör' }
];
/* Where the user trains. Three places are enough; single pieces of equipment can still be picked one by one. */
var PRESETS = [
  { id: 'gym', label: 'Fitnessstudio', sub: 'Alles ist da', equip: ['kh', 'lh', 'kb', 'mb', 'ma', 'kz', 'bank', 'box', 'stange', 'trx', 'band'] },
  { id: 'homegym', label: 'Homegym', sub: 'Hanteln, Bank, Stange', equip: ['kh', 'lh', 'kb', 'bank', 'box', 'stange', 'trx', 'band'] },
  { id: 'none', label: 'Ohne Ausrüstung', sub: 'Nur dein Körpergewicht', equip: [] }
];
/* The three repetition ranges the app offers. They do not overlap much and are enough for strength (6–8), a bit lighter (8–10) and the usual middle (8–12);
   everything in between is set with the minus and plus buttons. Every exercise in lib.js starts with one of them. */
var REPS = ['6–8', '8–10', '8–12'];

var NUTR = [
  { k: 'kcal', l: 'Kalorien', u: 'kcal' },
  { k: 'p', l: 'Protein', u: 'g' },
  { k: 'f', l: 'Fett', u: 'g' },
  { k: 'c', l: 'Kohlenhydrate', u: 'g' },
  { k: 's', l: 'Zucker', u: 'g' },
  { k: 'b', l: 'Ballaststoffe', u: 'g' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KNEE_NOTE: KNEE_NOTE, GROUPS: GROUPS, LEAVES: LEAVES, EQUIP: EQUIP, PRESETS: PRESETS, REPS: REPS, NUTR: NUTR };
}
