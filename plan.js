/* Plan data: the two training days, the hints shown under "So geht die Übung", and the nutrition fields.
   Data only, no logic. Exercise ids are stored in the user's log, so never reuse an id for a different exercise. */
var KNEE_NOTE = '<b>Knie:</b> Tiefe und Gewicht so, wie du es mit Physio oder MTT besprochen hast. Bei Schmerz stoppen.';

var PLAN = {
  A: {
    label: 'Tag A', focus: 'Kniebeuge + Hüftstrecker + Push',
    exercises: [
      { id: 'a-box', name: 'Box-Kniebeugen', gear: 'Langhantel', sets: 3, big: '8–10', unit: 'Wdh.', rest: 90, weight: true, knee: true,
        cues: ['Kontrolliert auf die Box setzen, kurz absetzen, wieder hoch.', 'Brust offen, Knie zeigen in Richtung der Zehen.'] },
      { id: 'a-hip', name: 'Hip Thrust', gear: 'Langhantel mit Polster oder Kurzhantel', sets: 3, big: '8–12', unit: 'Wdh.', rest: 90, weight: true, knee: true,
        cues: ['Oberer Rücken liegt an der Bankkante, Füße hüftbreit, Schienbeine oben senkrecht.', 'Kinn leicht zur Brust, Rippen unten, oben das Gesäß fest anspannen.'],
        note: '<b>Hip Thrust:</b> Start mit leichter Last (oder nur Körpergewicht bzw. Kurzhantel), Steigerung mit Physio oder MTT abstimmen. Beinvolumen pro Tag ist jetzt 6 Sätze, bei Schwellung oder Steifheit am Folgetag reduzieren.' },
      { id: 'a-push', name: 'Liegestütze', sets: 3, big: 'max.', unit: 'saubere Wdh.', rest: 60,
        cues: ['Körper bleibt eine gerade Linie von Kopf bis Ferse.', 'Aufhören, bevor die Haltung kippt.'] },
      { id: 'a-tri', name: 'TRX-Trizepsstrecken', gear: 'TRX', sets: 3, big: '10–15', unit: 'Wdh.', rest: 60,
        cues: ['Körper bleibt eine gerade Linie, Hüfte nicht durchhängen lassen.', 'Nur die Ellbogen bewegen, Oberarme bleiben ruhig.'] },
      { id: 'a-plank', name: 'Plank', sets: 3, timer: true, rest: 45,
        cues: ['Ellbogen unter den Schultern.', 'Bauch fest, Becken nicht durchhängen lassen.'] }
    ]
  },
  B: {
    label: 'Tag B', focus: 'Hüftbeuge + Pull',
    exercises: [
      { id: 'b-rdl', name: 'Rumänisches Kreuzheben', gear: 'Lang- oder Kurzhantel', sets: 3, big: '8–12', unit: 'Wdh.', rest: 90, weight: true, knee: true,
        cues: ['Hüfte nach hinten schieben, Knie nur leicht gebeugt.', 'Rücken gerade, Hantel nah am Körper führen.'] },
      { id: 'b-row', name: 'TRX-Rudern', gear: 'TRX', sets: 3, big: '10–15', unit: 'Wdh.', rest: 60,
        cues: ['Körper gerade, Brust zu den Griffen ziehen.', 'Schulterblätter am Ende zusammenziehen.'] },
      { id: 'b-lunge', name: 'TRX-Ausfallschritte rückwärts', gear: 'TRX, mit Festhalten', sets: 3, big: '8–12', unit: 'Wdh. pro Bein', rest: 90, knee: true,
        cues: ['An den Griffen festhalten, Schritt nach hinten.', 'Pro Satz beide Beine, dann Pause.'] },
      { id: 'b-curl', name: 'Bizeps-Curls', gear: 'Kurzhanteln', sets: 3, big: '10–15', unit: 'Wdh.', rest: 60, weight: true,
        cues: ['Oberarme bleiben ruhig am Körper.', 'Kein Schwung aus dem Rücken.'] },
      { id: 'b-crunch', name: 'TRX-Crunches', gear: 'TRX', sets: 3, big: '10–15', unit: 'Wdh.', rest: 45,
        cues: ['Bauch fest anspannen, Bewegung langsam.', 'Nicht ins Hohlkreuz fallen.'] }
    ]
  }
};

var TIPS = {
  'a-box': {
    watch: ['Füße etwa schulterbreit, Zehen leicht nach außen.', 'Zuerst die Hüfte nach hinten schieben, dann die Knie beugen.', 'Knie zeigen in dieselbe Richtung wie die Zehen.', 'Brust offen, Blick nach vorn, Druck über den ganzen Fuß.'],
    mistakes: ['Knie kippen nach innen.', 'Fersen heben ab oder der Oberkörper klappt nach vorn.', 'Auf der Box fallen lassen oder zurücklehnen.'],
    feel: 'Vorderseite der Oberschenkel (Quadrizeps) und Gesäß. Dort sollte es am Ende des Satzes müde werden, nicht im Knie und nicht im unteren Rücken.'
  },
  'a-hip': {
    watch: ['Bank an Wand oder Rack stellen, damit sie nicht wegrutscht.', 'Hantelpolster in die Hüftbeuge.', 'Schulterblätter an der Bankkante.', 'Fersen so setzen, dass die Schienbeine oben senkrecht stehen.', 'Hüfte hochdrücken, bis Oberschenkel und Rumpf eine Linie bilden.', 'Oben 1 Sekunde halten, kontrolliert ablassen.'],
    mistakes: ['Hohlkreuz, die Rippen heben ab (Hüfte zu hoch gedrückt).', 'Füße zu nah (die Oberschenkelvorderseite arbeitet) oder zu weit weg (der Beinbeuger krampft).', 'Knie fallen nach innen.', 'Kopf in den Nacken.'],
    feel: 'Gesäß (Gluteus), dazu Rückseite der Oberschenkel. Spürst du es vor allem im unteren Rücken oder vorn im Oberschenkel, Fußposition anpassen und Gewicht senken.'
  },
  'a-push': {
    watch: ['Hände etwas breiter als die Schultern, Finger zeigen nach vorn.', 'Ellbogen schräg nach hinten, etwa 45° vom Körper, kein T.', 'Bauch und Po anspannen, der Körper bleibt eine Linie.', 'Brust zum Boden, kontrolliert runter, kräftig hoch.', 'Zu schwer: Hände erhöht auf eine Bank oder das Rack stellen.'],
    mistakes: ['Becken hängt durch oder der Po ragt nach oben.', 'Ellbogen stehen seitlich ab.', 'Kopf hängt nach unten, Schultern wandern zu den Ohren.', 'Nur eine halbe Bewegung.'],
    feel: 'Brust, vordere Schulter und Trizeps. Der Rumpf hält die Spannung, ohne dass der Rücken durchhängt.'
  },
  'a-tri': {
    watch: ['TRX hoch am Rack einhängen. Mit dem Rücken zum Anker stehen, Griffe in die Hände, nach vorn lehnen, Füße hüftbreit.', 'Der Körper ist ein gerades Brett. Die Arme starten gestreckt vor dem Kopf, die Hände etwa auf Kopf- bis Schulterhöhe.', 'Nur die Ellbogen beugen: Der Kopf sinkt zwischen und leicht hinter die Hände, die Ellbogen bleiben schulterbreit und zeigen nach vorn. Dann mit dem Trizeps den ganzen Körper wieder nach oben drücken, bis die Arme gestreckt sind.', 'Schwerer: Füße weiter nach hinten (flacherer Körper). Leichter: einen Schritt zurück zum Anker (steilerer Körper).'],
    mistakes: ['Die Hüfte hängt durch oder der Po steigt.', 'Die Ellbogen kippen nach außen.', 'Die Schultern wandern zu den Ohren, die Bewegung kommt aus der Schulter statt aus dem Ellbogen.', 'Zu tief und unkontrolliert absinken (belastet Ellbogen und Schulter).'],
    feel: 'Rückseite des Oberarms (Trizeps). Wird es in der Schulter oder im Handgelenk unangenehm, einen steileren Winkel wählen.'
  },
  'a-plank': {
    watch: ['Ellbogen direkt unter den Schultern.', 'Körper bildet eine Linie von Kopf bis Ferse.', 'Bauch fest anspannen, Po leicht anspannen.', 'Blick zum Boden, ruhig weiteratmen.'],
    mistakes: ['Becken hängt durch (Hohlkreuz).', 'Po ragt nach oben.', 'Luft anhalten.', 'Schultern sacken zwischen die Schulterblätter ein.'],
    feel: 'Gerade und tiefe Bauchmuskeln, dazu Gesäß und Schultern. Wird es im unteren Rücken unangenehm, ist das Becken durchgesackt: kurz absetzen und neu aufbauen.'
  },
  'b-rdl': {
    watch: ['Knie nur leicht gebeugt, ihre Stellung bleibt fast gleich.', 'Hüfte nach hinten schieben, als wolltest du mit dem Po eine Wand hinter dir berühren.', 'Rücken gerade, Stange oder Hanteln eng am Bein entlang.', 'Nur so tief, wie der Rücken gerade bleibt. Oben die Hüfte nach vorn schieben.'],
    mistakes: ['Runder Rücken.', 'Die Knie beugen zu stark, es wird eine Kniebeuge.', 'Die Stange wandert weg vom Körper.', 'Oben ins Hohlkreuz überstrecken.'],
    feel: 'Rückseite der Oberschenkel (Beinbeuger) und Gesäß. Spürst du es vor allem im unteren Rücken, Gewicht senken und die Hüfte weiter nach hinten schieben.'
  },
  'b-row': {
    watch: ['Körper bleibt steif wie ein Brett, von den Fersen bis zum Kopf.', 'Start mit gestreckten Armen, zuerst die Schulterblätter nach hinten-unten ziehen.', 'Brust zu den Griffen ziehen, Ellbogen eng am Körper.', 'Oben kurz halten, langsam ablassen. Je flacher der Körper, desto schwerer.'],
    mistakes: ['Hüfte hängt durch oder knickt ein.', 'Mit Schwung aus dem Rücken ziehen.', 'Schultern wandern zu den Ohren.', 'Ellbogen stehen weit seitlich ab.'],
    feel: 'Mittlerer und oberer Rücken zwischen den Schulterblättern, hintere Schulter und Bizeps. Spürst du nur die Arme, zuerst die Schulterblätter bewegen.'
  },
  'b-lunge': {
    watch: ['An den Griffen nur leicht festhalten, die Beine machen die Arbeit.', 'Aufrecht bleiben, Blick nach vorn.', 'Großer Schritt nach hinten, auf dem Fußballen aufsetzen.', 'Vorderes Knie bleibt über dem Fuß und zeigt in Richtung der Zehen. Mit der vorderen Ferse hochdrücken.'],
    mistakes: ['Zu kleiner Schritt, das vordere Knie schiebt weit über die Zehen.', 'Vorderes Knie fällt nach innen.', 'Der Oberkörper kippt nach vorn oder du ziehst dich an den Griffen hoch.', 'Das Gewicht liegt auf dem hinteren Bein.'],
    feel: 'Vorderer Oberschenkel und Gesäß des vorderen Beins. Das hintere Bein hilft nur bei der Balance.'
  },
  'b-curl': {
    watch: ['Oberarme bleiben am Rumpf, die Ellbogen wandern nicht nach vorn.', 'Hantel hochrollen, unten die Arme fast ganz strecken.', 'Langsam senken, etwa 2 bis 3 Sekunden.', 'Schultern locker, Bauch leicht angespannt, Knie weich.'],
    mistakes: ['Schwung aus dem Rücken, der Oberkörper lehnt zurück.', 'Ellbogen wandern nach vorn.', 'Schultern hochgezogen.', 'Zu schwere Hanteln, die Bewegung wird abgekürzt.'],
    feel: 'Vorderseite des Oberarms (Bizeps), dazu der Unterarm. Dort sollte es müde werden, nicht im Nacken oder im Rücken.'
  },
  'b-crunch': {
    watch: ['Hände unter den Schultern, Arme gestreckt, Füße in den Schlaufen.', 'Der Körper startet in einer geraden Linie.', 'Bauch fest anspannen, Knie langsam zur Brust ziehen und den Rücken rund machen.', 'Kontrolliert zurück, ohne durchzuhängen.'],
    mistakes: ['Hüfte hängt beim Zurückgehen durch (Hohlkreuz).', 'Mit Schwung pendeln.', 'Schultern sacken ein.', 'Luft anhalten.'],
    feel: 'Gerade und untere Bauchmuskeln. Die Hüftbeuger arbeiten mit, Schultern und Trizeps halten dich oben. Spürst du es nur an den Oberschenkeln, den Rücken bewusster rund machen.'
  }
};

var NUTR = [
  { k: 'kcal', l: 'Kalorien', u: 'kcal' },
  { k: 'p', l: 'Protein', u: 'g' },
  { k: 'f', l: 'Fett', u: 'g' },
  { k: 'c', l: 'Kohlenhydrate', u: 'g' },
  { k: 's', l: 'Zucker', u: 'g' },
  { k: 'b', l: 'Ballaststoffe', u: 'g' }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { PLAN: PLAN, TIPS: TIPS, NUTR: NUTR, KNEE_NOTE: KNEE_NOTE };
