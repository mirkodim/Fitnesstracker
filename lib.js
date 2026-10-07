/* The exercise library. One entry per exercise, with everything the app shows: where it is filed (regions), what it needs (eq),
   how hard it is (lvl 1 beginner, 2 practised, 3 advanced), the default sets and repetitions, and the texts under "So geht die Übung".
   An exercise can be filed under several regions. eq lists what is needed (all of it); "kh|kb" means one of the two is enough.
   The animation of an exercise has the same id (anims.js). Never reuse or remove an id: saved trainings and the calendar refer to it.
   Fields: id, name, gear (shown under the name), reg (regions), eq, lvl, pat (movement pattern, so a generated training does not repeat itself),
   sets, reps (one of the three ranges REPS in plan.js), unit, rest (seconds), weight (shows a weight field), knee (shows the knee note), timer + hold + holds (+ sides: 2 for "each side") for holds,
   cues (two short lines for the exercise card), watch / mistakes / feel (the long hints), easier / harder (optional). */
var LIB = [];
var EX = {};

(function () {
function x(e) {
  e.regions = e.reg.split(' ');
  delete e.reg;
  e.eq = e.eq ? e.eq.split(' ') : [];
  if (e.lvl == null) e.lvl = 1;
  if (e.sets == null) e.sets = 3;
  if (e.rest == null) e.rest = 60;
  if (!e.timer) { if (e.reps == null) e.reps = '8–12'; if (!e.unit) e.unit = 'Wdh.'; }
  else { e.holds = e.holds || [30, 45, 60]; if (e.hold == null) e.hold = e.holds[Math.floor(e.holds.length / 2)]; }
  if (EX[e.id]) throw new Error('Doppelte Übungs-ID ' + e.id);
  LIB.push(e); EX[e.id] = e;
  return e;
}

/* ===== the ten exercises of the first version (texts as before) ===== */

x({ id: 'a-box', name: 'Box-Kniebeugen', gear: 'Langhantel', reg: 'oberschenkel gesaess', eq: 'lh box', lvl: 2, pat: 'squat',
  sets: 3, reps: '8–10', rest: 90, weight: true, knee: true,
  cues: ['Kontrolliert auf die Box setzen, kurz absetzen, wieder hoch.', 'Brust offen, Knie zeigen in Richtung der Zehen.'],
  watch: ['Füsse etwa schulterbreit, Zehen leicht nach aussen.', 'Zuerst die Hüfte nach hinten schieben, dann die Knie beugen.', 'Knie zeigen in dieselbe Richtung wie die Zehen.', 'Brust offen, Blick nach vorn, Druck über den ganzen Fuss.'],
  mistakes: ['Knie kippen nach innen.', 'Fersen heben ab oder der Oberkörper klappt nach vorn.', 'Auf der Box fallen lassen oder zurücklehnen.'],
  feel: 'Vorderseite der Oberschenkel (Quadrizeps) und Gesäss. Dort sollte es am Ende des Satzes müde werden, nicht im Knie und nicht im unteren Rücken.' });

x({ id: 'a-hip', name: 'Hip Thrust', gear: 'Langhantel mit Polster oder Kurzhantel', reg: 'gesaess oberschenkel', eq: 'bank lh|kh', lvl: 2, pat: 'bridge',
  sets: 3, reps: '8–12', rest: 90, weight: true, knee: true,
  cues: ['Oberer Rücken liegt an der Bankkante, Füsse hüftbreit, Schienbeine oben senkrecht.', 'Kinn leicht zur Brust, Rippen unten, oben das Gesäss fest anspannen.'],
  watch: ['Bank an Wand oder Rack stellen, damit sie nicht wegrutscht.', 'Hantelpolster in die Hüftbeuge.', 'Schulterblätter an der Bankkante.', 'Fersen so setzen, dass die Schienbeine oben senkrecht stehen.', 'Hüfte hochdrücken, bis Oberschenkel und Rumpf eine Linie bilden.', 'Oben 1 Sekunde halten, kontrolliert ablassen.'],
  mistakes: ['Hohlkreuz, die Rippen heben ab (Hüfte zu hoch gedrückt).', 'Füsse zu nah (die Oberschenkelvorderseite arbeitet) oder zu weit weg (der Beinbeuger krampft).', 'Knie fallen nach innen.', 'Kopf in den Nacken.'],
  feel: 'Gesäss (Gluteus), dazu Rückseite der Oberschenkel. Spürst du es vor allem im unteren Rücken oder vorn im Oberschenkel, Fussposition anpassen und Gewicht senken.' });

x({ id: 'a-push', name: 'Liegestütze', reg: 'brust schultern oberarme', eq: '', lvl: 2, pat: 'push',
  sets: 3, reps: '8–12', unit: 'saubere Wdh.', rest: 60,
  cues: ['Körper bleibt eine gerade Linie von Kopf bis Ferse.', 'Aufhören, bevor die Haltung kippt.'],
  watch: ['Hände etwas breiter als die Schultern, Finger zeigen nach vorn.', 'Ellbogen schräg nach hinten, etwa 45° vom Körper, kein T.', 'Bauch und Po anspannen, der Körper bleibt eine Linie.', 'Brust zum Boden, kontrolliert runter, kräftig hoch.', 'Zu schwer: Hände erhöht auf eine Bank oder das Rack stellen.'],
  mistakes: ['Becken hängt durch oder der Po ragt nach oben.', 'Ellbogen stehen seitlich ab.', 'Kopf hängt nach unten, Schultern wandern zu den Ohren.', 'Nur eine halbe Bewegung.'],
  feel: 'Brust, vordere Schulter und Trizeps. Der Rumpf hält die Spannung, ohne dass der Rücken durchhängt.' });

x({ id: 'a-tri', name: 'TRX-Trizepsstrecken', gear: 'TRX', reg: 'oberarme', eq: 'trx', lvl: 2, pat: 'tri',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Körper bleibt eine gerade Linie, Hüfte nicht durchhängen lassen.', 'Nur die Ellbogen bewegen, Oberarme bleiben ruhig.'],
  watch: ['TRX hoch am Rack einhängen. Mit dem Rücken zum Anker stehen, Griffe in die Hände, nach vorn lehnen, Füsse hüftbreit.', 'Der Körper ist ein gerades Brett. Die Arme starten gestreckt vor dem Kopf, die Hände etwa auf Kopf- bis Schulterhöhe.', 'Nur die Ellbogen beugen: Der Kopf sinkt zwischen und leicht hinter die Hände, die Ellbogen bleiben schulterbreit und zeigen nach vorn. Dann mit dem Trizeps den ganzen Körper wieder nach oben drücken, bis die Arme gestreckt sind.', 'Schwerer: Füsse weiter nach hinten (flacherer Körper). Leichter: einen Schritt zurück zum Anker (steilerer Körper).'],
  mistakes: ['Die Hüfte hängt durch oder der Po steigt.', 'Die Ellbogen kippen nach aussen.', 'Die Schultern wandern zu den Ohren, die Bewegung kommt aus der Schulter statt aus dem Ellbogen.', 'Zu tief und unkontrolliert absinken (belastet Ellbogen und Schulter).'],
  feel: 'Rückseite des Oberarms (Trizeps). Wird es in der Schulter oder im Handgelenk unangenehm, einen steileren Winkel wählen.' });

x({ id: 'a-plank', name: 'Plank', reg: 'bauch', eq: '', lvl: 1, pat: 'core', sets: 3, rest: 45, timer: true, hold: 45, holds: [30, 45, 60],
  cues: ['Ellbogen unter den Schultern.', 'Bauch fest, Becken nicht durchhängen lassen.'],
  watch: ['Ellbogen direkt unter den Schultern.', 'Körper bildet eine Linie von Kopf bis Ferse.', 'Bauch fest anspannen, Po leicht anspannen.', 'Blick zum Boden, ruhig weiteratmen.'],
  mistakes: ['Becken hängt durch (Hohlkreuz).', 'Po ragt nach oben.', 'Luft anhalten.', 'Schultern sacken zwischen die Schulterblätter ein.'],
  feel: 'Gerade und tiefe Bauchmuskeln, dazu Gesäss und Schultern. Wird es im unteren Rücken unangenehm, ist das Becken durchgesackt: kurz absetzen und neu aufbauen.' });

x({ id: 'b-rdl', name: 'Rumänisches Kreuzheben', gear: 'Lang- oder Kurzhantel', reg: 'oberschenkel gesaess ruecken', eq: 'lh|kh', lvl: 2, pat: 'hinge',
  sets: 3, reps: '8–12', rest: 90, weight: true, knee: true,
  cues: ['Hüfte nach hinten schieben, Knie nur leicht gebeugt.', 'Rücken gerade, Hantel nah am Körper führen.'],
  watch: ['Knie nur leicht gebeugt, ihre Stellung bleibt fast gleich.', 'Hüfte nach hinten schieben, als wolltest du mit dem Po eine Wand hinter dir berühren.', 'Rücken gerade, Stange oder Hanteln eng am Bein entlang.', 'Nur so tief, wie der Rücken gerade bleibt. Oben die Hüfte nach vorn schieben.'],
  mistakes: ['Runder Rücken.', 'Die Knie beugen zu stark, es wird eine Kniebeuge.', 'Die Stange wandert weg vom Körper.', 'Oben ins Hohlkreuz überstrecken.'],
  feel: 'Rückseite der Oberschenkel (Beinbeuger) und Gesäss. Spürst du es vor allem im unteren Rücken, Gewicht senken und die Hüfte weiter nach hinten schieben.' });

x({ id: 'b-row', name: 'TRX-Rudern', gear: 'TRX', reg: 'ruecken oberarme', eq: 'trx', lvl: 1, pat: 'row',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Körper gerade, Brust zu den Griffen ziehen.', 'Schulterblätter am Ende zusammenziehen.'],
  watch: ['Körper bleibt steif wie ein Brett, von den Fersen bis zum Kopf.', 'Start mit gestreckten Armen, zuerst die Schulterblätter nach hinten-unten ziehen.', 'Brust zu den Griffen ziehen, Ellbogen eng am Körper.', 'Oben kurz halten, langsam ablassen. Je flacher der Körper, desto schwerer.'],
  mistakes: ['Hüfte hängt durch oder knickt ein.', 'Mit Schwung aus dem Rücken ziehen.', 'Schultern wandern zu den Ohren.', 'Ellbogen stehen weit seitlich ab.'],
  feel: 'Mittlerer und oberer Rücken zwischen den Schulterblättern, hintere Schulter und Bizeps. Spürst du nur die Arme, zuerst die Schulterblätter bewegen.' });

x({ id: 'b-lunge', name: 'TRX-Ausfallschritte rückwärts', gear: 'TRX, mit Festhalten', reg: 'oberschenkel gesaess', eq: 'trx', lvl: 1, pat: 'lunge',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 90, knee: true,
  cues: ['An den Griffen festhalten, Schritt nach hinten.', 'Pro Satz beide Beine, dann Pause.'],
  watch: ['An den Griffen nur leicht festhalten, die Beine machen die Arbeit.', 'Aufrecht bleiben, Blick nach vorn.', 'Grosser Schritt nach hinten, auf dem Fussballen aufsetzen.', 'Vorderes Knie bleibt über dem Fuss und zeigt in Richtung der Zehen. Mit der vorderen Ferse hochdrücken.'],
  mistakes: ['Zu kleiner Schritt, das vordere Knie schiebt weit über die Zehen.', 'Vorderes Knie fällt nach innen.', 'Der Oberkörper kippt nach vorn oder du ziehst dich an den Griffen hoch.', 'Das Gewicht liegt auf dem hinteren Bein.'],
  feel: 'Vorderer Oberschenkel und Gesäss des vorderen Beins. Das hintere Bein hilft nur bei der Balance.' });

x({ id: 'b-curl', name: 'Bizeps-Curls', gear: 'Kurzhanteln', reg: 'oberarme unterarme', eq: 'kh', lvl: 1, pat: 'curl',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Oberarme bleiben ruhig am Körper.', 'Kein Schwung aus dem Rücken.'],
  watch: ['Oberarme bleiben am Rumpf, die Ellbogen wandern nicht nach vorn.', 'Hantel hochrollen, unten die Arme fast ganz strecken.', 'Langsam senken, etwa 2 bis 3 Sekunden.', 'Schultern locker, Bauch leicht angespannt, Knie weich.'],
  mistakes: ['Schwung aus dem Rücken, der Oberkörper lehnt zurück.', 'Ellbogen wandern nach vorn.', 'Schultern hochgezogen.', 'Zu schwere Hanteln, die Bewegung wird abgekürzt.'],
  feel: 'Vorderseite des Oberarms (Bizeps), dazu der Unterarm. Dort sollte es müde werden, nicht im Nacken oder im Rücken.' });

x({ id: 'b-crunch', name: 'TRX-Crunches', gear: 'TRX', reg: 'bauch', eq: 'trx', lvl: 2, pat: 'core',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Bauch fest anspannen, Bewegung langsam.', 'Nicht ins Hohlkreuz fallen.'],
  watch: ['Hände unter den Schultern, Arme gestreckt, Füsse in den Schlaufen.', 'Der Körper startet in einer geraden Linie.', 'Bauch fest anspannen, Knie langsam zur Brust ziehen und den Rücken rund machen.', 'Kontrolliert zurück, ohne durchzuhängen.'],
  mistakes: ['Hüfte hängt beim Zurückgehen durch (Hohlkreuz).', 'Mit Schwung pendeln.', 'Schultern sacken ein.', 'Luft anhalten.'],
  feel: 'Gerade und untere Bauchmuskeln. Die Hüftbeuger arbeiten mit, Schultern und Trizeps halten dich oben. Spürst du es nur an den Oberschenkeln, den Rücken bewusster rund machen.' });

/* ===== Beine: Oberschenkel und Unterschenkel ===== */

x({ id: 'x-squat', name: 'Kniebeuge', gear: 'Körpergewicht', reg: 'oberschenkel gesaess', eq: '', lvl: 1, pat: 'squat',
  sets: 3, reps: '8–12', rest: 60, knee: true,
  cues: ['Füsse schulterbreit, Knie zeigen in Richtung der Zehen.', 'Hüfte nach hinten und unten, die Brust bleibt offen.'],
  watch: ['Füsse etwa schulterbreit, Zehen leicht nach aussen.', 'Die Arme nach vorn strecken, das hilft beim Gleichgewicht.', 'Hüfte nach hinten schieben und die Knie beugen, als würdest du dich auf einen Stuhl setzen.', 'Das Gewicht bleibt auf dem ganzen Fuss, die Fersen bleiben am Boden.', 'So tief, wie du den Rücken gerade und die Fersen unten halten kannst. Dann kräftig aufstehen.'],
  mistakes: ['Die Knie kippen nach innen.', 'Die Fersen heben ab.', 'Der Oberkörper klappt nach vorn, der Rücken wird rund.', 'Nur ein kurzes Nicken statt einer richtigen Kniebeuge.'],
  feel: 'Vorderseite der Oberschenkel (Quadrizeps) und Gesäss. Es soll nicht im Knie oder im unteren Rücken ziehen.',
  easier: 'Setze dich auf einen Stuhl und stehe wieder auf, ohne Schwung. Oder geh nur halb so tief.',
  harder: 'Langsamer absenken (3 Sekunden), unten kurz halten oder ein Gewicht vor der Brust halten.' });

x({ id: 'x-goblet', name: 'Goblet-Kniebeuge', gear: 'Kurzhantel oder Kettlebell', reg: 'oberschenkel gesaess', eq: 'kh|kb', lvl: 1, pat: 'squat',
  sets: 3, reps: '8–12', rest: 75, weight: true, knee: true,
  cues: ['Das Gewicht eng vor der Brust halten, Ellbogen nach unten.', 'Aufrecht bleiben und tief in die Hocke gehen.'],
  watch: ['Das Gewicht mit beiden Händen eng vor der Brust halten, die Ellbogen zeigen nach unten.', 'Füsse etwas mehr als schulterbreit, Zehen leicht nach aussen.', 'Hüfte nach hinten und unten schieben, der Oberkörper bleibt aufrecht.', 'Die Ellbogen dürfen innen zwischen die Knie sinken, so kommst du tiefer.', 'Mit dem ganzen Fuss hochdrücken, oben das Gesäss anspannen.'],
  mistakes: ['Das Gewicht rutscht von der Brust nach vorn weg.', 'Die Knie fallen nach innen.', 'Die Fersen heben ab.', 'Der Rücken wird unten rund.'],
  feel: 'Oberschenkel und Gesäss, dazu Rumpf und oberer Rücken, die das Gewicht vorn halten.',
  easier: 'Ohne Gewicht üben oder nur bis zum Stuhl absenken.',
  harder: 'Schwerere Hantel, langsamer absenken oder unten 2 Sekunden halten.' });

x({ id: 'x-backsquat', name: 'Langhantel-Kniebeuge', gear: 'Langhantel im Rack', reg: 'oberschenkel gesaess', eq: 'lh', lvl: 3, pat: 'squat',
  sets: 4, reps: '6–8', rest: 120, weight: true, knee: true,
  cues: ['Stange fest auf dem oberen Rücken, Brust offen.', 'Hüfte zuerst nach hinten, Knie in Richtung der Zehen.'],
  watch: ['Stange im Rack auf Schulterhöhe einlegen, mit beiden Händen fest greifen und darunter treten.', 'Die Stange liegt auf dem Muskel des oberen Rückens, nicht auf dem Nacken.', 'Aus dem Rack heben, zwei kleine Schritte zurück, Füsse etwa schulterbreit.', 'Tief einatmen, Bauch fest anspannen, dann Hüfte nach hinten und die Knie beugen.', 'So tief, wie du kontrolliert und mit geradem Rücken kommst, dann kräftig aufstehen.', 'Bei schweren Sätzen die Sicherungsarme im Rack richtig einstellen oder jemanden zur Hilfe bitten.'],
  mistakes: ['Die Knie kippen nach innen.', 'Die Fersen heben ab oder der Oberkörper klappt nach vorn.', 'Der untere Rücken rundet sich am tiefsten Punkt.', 'Zu viel Gewicht, die Tiefe wird immer kürzer.'],
  feel: 'Oberschenkel und Gesäss, dazu der ganze Rumpf. Der untere Rücken arbeitet haltend mit.',
  easier: 'Zuerst ohne Gewicht oder als Goblet-Kniebeuge üben.' });

x({ id: 'x-lunge', name: 'Ausfallschritt rückwärts', gear: 'Körpergewicht oder Kurzhanteln', reg: 'oberschenkel gesaess', eq: '', lvl: 1, pat: 'lunge',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 75, weight: true, knee: true,
  cues: ['Grosser Schritt nach hinten, der Oberkörper bleibt aufrecht.', 'Vorderes Knie über dem Fuss, mit der Ferse hochdrücken.'],
  watch: ['Aufrecht stehen, Blick nach vorn. Mit Kurzhanteln hängen die Arme locker am Körper.', 'Grosser Schritt nach hinten, auf dem Fussballen aufsetzen.', 'Beide Knie beugen, bis das hintere Knie knapp über dem Boden schwebt.', 'Das vordere Knie bleibt über dem Fuss und zeigt in Richtung der Zehen.', 'Mit der vorderen Ferse hochdrücken und das Bein wieder heranholen.'],
  mistakes: ['Zu kleiner Schritt, das vordere Knie schiebt weit über die Zehen.', 'Das vordere Knie fällt nach innen.', 'Der Oberkörper kippt nach vorn.', 'Das Gewicht liegt auf dem hinteren Bein.'],
  feel: 'Vorderer Oberschenkel und Gesäss des vorderen Beins. Das hintere Bein hilft vor allem beim Gleichgewicht.',
  easier: 'Halte dich an einer Wand oder einem Türrahmen fest oder mach nur halbe Schritte.',
  harder: 'Kurzhanteln in die Hände nehmen oder unten kurz halten.' });

x({ id: 'x-stepup', name: 'Step-ups', gear: 'Kiste oder Bank', reg: 'oberschenkel gesaess', eq: 'box|bank', lvl: 1, pat: 'lunge',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 60, weight: true, knee: true,
  cues: ['Ganzer Fuss auf der Kiste, mit dem Standbein hochsteigen.', 'Oben aufrecht stehen, kontrolliert wieder ab.'],
  watch: ['Eine stabile Kiste oder Bank in Kniehöhe oder etwas darunter, sie darf nicht wegrutschen.', 'Den ganzen Fuss auf die Kiste stellen, das Knie bleibt über dem Fuss.', 'Mit dem Bein auf der Kiste hochdrücken, nicht mit dem hinteren Bein abstossen.', 'Oben aufrecht stehen und das Gesäss anspannen.', 'Langsam wieder absteigen, erst das hintere Bein, dann das Standbein.'],
  mistakes: ['Die Kiste ist zu hoch, das Knie kippt nach innen.', 'Mit dem hinteren Bein abstossen statt mit dem Standbein hochdrücken.', 'Der Oberkörper fällt nach vorn.', 'Zu schnell absteigen.'],
  feel: 'Oberschenkel und Gesäss des Beins auf der Kiste.',
  easier: 'Niedrigere Kiste oder Stufe, eine Hand an der Wand.',
  harder: 'Höhere Kiste, Kurzhanteln in den Händen oder oben das Knie hochziehen.' });

x({ id: 'x-wallsit', name: 'Wandsitzen', gear: 'Körpergewicht, Wand', reg: 'oberschenkel', eq: '', lvl: 1, pat: 'hold',
  sets: 3, rest: 45, knee: true, timer: true, hold: 30, holds: [20, 30, 45],
  cues: ['Rücken an der Wand, Knie über den Knöcheln.', 'Oberschenkel waagerecht, ruhig weiteratmen.'],
  watch: ['Mit dem Rücken an die Wand lehnen, die Füsse eine grosse Schrittlänge nach vorn setzen.', 'An der Wand nach unten rutschen, bis die Knie etwa im rechten Winkel gebeugt sind.', 'Die Knie stehen über den Knöcheln, nicht davor.', 'Die Hände liegen locker auf den Oberschenkeln oder hängen herab.', 'Ruhig weiteratmen und die Zeit durchhalten.'],
  mistakes: ['Die Knie schieben sich weit nach vorn über die Zehen.', 'Die Hände stützen sich auf den Oberschenkeln ab.', 'Der Rücken löst sich von der Wand.', 'Luft anhalten.'],
  feel: 'Vorderseite der Oberschenkel, später auch das Gesäss. Es brennt, aber nicht im Knie.',
  easier: 'Weniger tief rutschen und kürzer halten.',
  harder: 'Länger halten oder ein Gewicht im Schoss halten.' });

x({ id: 'x-calf', name: 'Wadenheben stehend', gear: 'Körpergewicht oder Kurzhanteln', reg: 'unterschenkel', eq: '', lvl: 1, pat: 'calf',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Langsam hoch auf die Zehen, oben kurz halten.', 'Ganz tief ablassen, damit sich die Waden dehnen.'],
  watch: ['Füsse hüftbreit, die Zehen zeigen nach vorn. Eine Hand an der Wand hilft beim Gleichgewicht.', 'Die Fersen langsam so hoch wie möglich anheben, oben 1 Sekunde halten.', 'Die Knie bleiben gestreckt, aber nicht durchgedrückt.', 'Langsam absenken, am besten 2 bis 3 Sekunden.', 'Das Gewicht bleibt über dem Grosszehenballen, die Füsse kippen nicht nach aussen.'],
  mistakes: ['Mit Schwung wippen.', 'Die Knie beugen sich bei jeder Wiederholung.', 'Die Füsse knicken nach aussen.', 'Nur ein kleines Stück hochgehen.'],
  feel: 'Die Waden (Rückseite des Unterschenkels). Dort brennt es am Ende des Satzes.',
  easier: 'Mit beiden Händen an der Wand festhalten.',
  harder: 'Kurzhanteln halten oder auf einem Bein ausführen.' });

x({ id: 'x-calfseat', name: 'Wadenheben sitzend', gear: 'Kurzhanteln auf den Knien', reg: 'unterschenkel', eq: 'kh box|bank', lvl: 1, pat: 'calf',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Gewicht auf die Knie legen, Fersen anheben.', 'Oben kurz halten, langsam ablassen.'],
  watch: ['Auf Bank oder Stuhl sitzen, die Füsse flach auf dem Boden, die Knie im rechten Winkel.', 'Eine Kurzhantel auf jedes Knie legen (oder eine quer über beide) und mit den Händen festhalten.', 'Die Fersen langsam so hoch wie möglich heben, oben 1 Sekunde halten.', 'Langsam senken, die Fersen berühren fast den Boden.', 'Die Knie bleiben dabei an ihrem Platz.'],
  mistakes: ['Mit Schwung hochwippen.', 'Die Fersen nur wenig anheben.', 'Die Knie wandern nach vorn oder zur Seite.', 'Zu schnell ablassen.'],
  feel: 'Die tiefe Wadenmuskulatur (Soleus) unter der grossen Wade. Es ist ein anderer Teil der Wade als beim Stehen.' });

x({ id: 'x-calf1', name: 'Einbeiniges Wadenheben', gear: 'Körpergewicht, Hand an der Wand', reg: 'unterschenkel', eq: '', lvl: 2, pat: 'calf',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 45,
  cues: ['Auf einem Bein, eine Hand an der Wand zum Gleichgewicht.', 'Langsam hoch, oben halten, langsam runter.'],
  watch: ['Mit einer Hand an der Wand abstützen, das andere Bein hinten anheben.', 'Die Ferse des Standbeins so hoch wie möglich heben und oben 1 Sekunde halten.', 'In etwa 2 bis 3 Sekunden wieder absenken.', 'Das Knie bleibt gestreckt und zeigt nach vorn.', 'Erst alle Wiederholungen mit einem Bein, dann Seitenwechsel.'],
  mistakes: ['Mit der Hand an der Wand hochziehen.', 'Das Knie knickt ein oder dreht nach innen.', 'Wippen statt kontrolliert heben.', 'Der Fuss kippt nach aussen.'],
  feel: 'Wade des Standbeins. Auch die Fussmuskeln und das Gleichgewicht werden gefordert.',
  easier: 'Beidbeiniges Wadenheben.' });

x({ id: 'x-toeraise', name: 'Zehenheber', gear: 'Körpergewicht, Rücken an der Wand', reg: 'unterschenkel', eq: '', lvl: 1, pat: 'shin',
  sets: 3, reps: '8–12', rest: 30,
  cues: ['Fersen am Boden, die Zehen zur Decke ziehen.', 'Oben kurz halten, langsam senken.'],
  watch: ['Mit dem Rücken an die Wand lehnen, die Füsse eine Schrittlänge vor der Wand, hüftbreit.', 'Die Fersen bleiben am Boden, die Zehen und der Vorfuss ziehen zur Decke.', 'Oben 1 Sekunde halten, die Schienbeinmuskeln spannen sich an.', 'Langsam wieder absenken, ohne die Zehen fallen zu lassen.'],
  mistakes: ['Die Fersen heben vom Boden ab.', 'Zu schnell, mit Schwung.', 'Die Knie beugen sich dabei.'],
  feel: 'Vorderseite des Unterschenkels (Schienbeinmuskel). Er stabilisiert den Fuss beim Gehen und Laufen.' });

x({ id: 'x-sumo', name: 'Sumo-Kniebeuge', gear: 'Kettlebell oder Kurzhantel', reg: 'oberschenkel gesaess', eq: 'kh|kb', lvl: 1, pat: 'squat',
  sets: 3, reps: '8–12', rest: 75, weight: true, knee: true,
  cues: ['Breiter Stand, Zehen nach aussen, das Gewicht hängt zwischen den Beinen.', 'Die Knie folgen den Zehen nach aussen, die Brust bleibt offen.'],
  watch: ['Füsse deutlich mehr als schulterbreit, die Zehen zeigen etwa 30 bis 45 Grad nach aussen.', 'Das Gewicht mit beiden Händen vor dem Körper halten, die Arme bleiben gestreckt.', 'Die Knie schieben beim Absenken nach aussen in Richtung der Zehen.', 'Der Oberkörper bleibt aufrecht, der Rücken gerade.', 'Mit der ganzen Fusssohle hochdrücken, oben das Gesäss anspannen.'],
  mistakes: ['Die Knie fallen nach innen.', 'Der Oberkörper kippt nach vorn.', 'Die Fersen heben ab.', 'Das Becken rollt unten ein, der Rücken wird rund.'],
  feel: 'Innenseite der Oberschenkel, Gesäss und vordere Oberschenkel.',
  easier: 'Weniger tief gehen oder ohne Gewicht.',
  harder: 'Schwereres Gewicht oder unten 2 Sekunden halten.' });

x({ id: 'x-bulgarian', name: 'Bulgarische Kniebeuge', gear: 'Hinterer Fuss auf Bank oder Stuhl', reg: 'oberschenkel gesaess', eq: 'bank|box', lvl: 2, pat: 'lunge',
  sets: 3, reps: '8–10', unit: 'Wdh. pro Bein', rest: 75, weight: true, knee: true,
  cues: ['Hinterer Fuss auf der Bank, der vordere weit genug vorn.', 'Gerade nach unten sinken, das vordere Knie bleibt über dem Fuss.'],
  watch: ['Stelle dich eine grosse Schrittlänge vor eine Bank und lege den hinteren Fuss mit dem Spann auf die Bank.', 'Der vordere Fuss steht so weit vorn, dass das Knie unten über dem Fuss bleibt.', 'Der Oberkörper bleibt aufrecht, eine leichte Vorneigung ist in Ordnung.', 'Senke dich gerade nach unten, bis der vordere Oberschenkel fast waagerecht ist.', 'Mit dem vorderen Fuss hochdrücken, nicht mit dem hinteren abstossen.'],
  mistakes: ['Der vordere Fuss steht zu nah, das Knie schiebt weit über die Zehen.', 'Das vordere Knie fällt nach innen.', 'Der hintere Fuss drückt mit.', 'Das Gleichgewicht fehlt: Halte dich am Anfang an einer Wand fest.'],
  feel: 'Vorderer Oberschenkel und Gesäss des vorderen Beins, dazu die Hüftbeuger des hinteren Beins.',
  easier: 'Normaler Ausfallschritt oder mit einer Hand an der Wand.',
  harder: 'Kurzhanteln in die Hände nehmen oder langsamer absenken.' });

x({ id: 'x-legpress', name: 'Beinpresse', gear: 'Maschine', reg: 'oberschenkel gesaess', eq: 'ma', lvl: 1, pat: 'squat',
  sets: 3, reps: '8–10', rest: 90, weight: true, knee: true,
  cues: ['Rücken und Gesäss bleiben fest am Polster.', 'Die Knie zeigen in Richtung der Zehen, oben nicht durchstrecken.'],
  watch: ['Den Sitz so einstellen, dass die Knie unten etwa im rechten Winkel gebeugt sind.', 'Die Füsse stehen etwa hüftbreit auf der Platte, die ganze Sohle liegt flach.', 'Rücken und Gesäss bleiben die ganze Zeit am Polster, das Becken rollt nicht ein.', 'Die Platte kontrolliert nach unten lassen, dann mit dem ganzen Fuss wegdrücken.', 'Oben die Knie nicht ganz durchdrücken.'],
  mistakes: ['Das Gesäss hebt unten ab, der untere Rücken rundet sich.', 'Die Knie fallen nach innen.', 'Die Knie werden oben ganz durchgedrückt.', 'Zu viel Gewicht und eine zu kurze Bewegung.'],
  feel: 'Vordere Oberschenkel und Gesäss.' });

x({ id: 'x-legext', name: 'Beinstrecker', gear: 'Maschine', reg: 'oberschenkel', eq: 'ma', lvl: 1, pat: 'ext',
  sets: 3, reps: '8–12', rest: 60, weight: true, knee: true,
  cues: ['Rücken an der Lehne, das Polster sitzt oberhalb der Knöchel.', 'Oben kurz halten, langsam wieder ablassen.'],
  watch: ['Lehne und Polster so einstellen, dass die Knie am Rand des Sitzes liegen und das Polster oberhalb der Knöchel sitzt.', 'Mit den Händen an den Griffen festhalten, der Rücken bleibt an der Lehne.', 'Das Bein langsam strecken, bis es fast gerade ist, oben 1 Sekunde halten.', 'Langsam, in etwa 3 Sekunden, wieder ablassen.', 'Wähle ein Gewicht, das du ohne Schwung bewegen kannst.'],
  mistakes: ['Mit Schwung hochschnellen.', 'Das Gesäss hebt vom Sitz ab.', 'Das Knie wird oben hart durchgedrückt.', 'Das Gewicht fällt unten einfach herunter.'],
  feel: 'Vorderseite des Oberschenkels (Quadrizeps). Bei Knieproblemen die Übung zuerst mit Physio oder MTT besprechen, denn sie belastet das Knie über einen langen Hebel.' });

x({ id: 'x-legcurl', name: 'Beinbeuger liegend', gear: 'Maschine', reg: 'oberschenkel', eq: 'ma', lvl: 1, pat: 'legcurl',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Hüfte bleibt fest auf der Bank, die Fersen gehen zum Gesäss.', 'Langsam wieder strecken.'],
  watch: ['Lege dich mit dem Bauch auf die Bank, die Knie am Rand, das Polster liegt über den Fersen.', 'Halte dich an den Griffen fest, die Hüfte bleibt flach auf der Bank.', 'Ziehe die Fersen zum Gesäss und halte oben 1 Sekunde.', 'Strecke die Beine langsam wieder, in etwa 3 Sekunden.'],
  mistakes: ['Die Hüfte hebt ab, der untere Rücken fällt ins Hohlkreuz.', 'Mit Schwung hochreissen.', 'Das Gewicht fällt unten herunter.'],
  feel: 'Rückseite des Oberschenkels (Beinbeuger).' });

x({ id: 'x-slrdl', name: 'Einbeiniges Kreuzheben', gear: 'Körpergewicht oder Kurzhantel', reg: 'gesaess oberschenkel ruecken', eq: '', lvl: 2, pat: 'hinge',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 75, weight: true,
  cues: ['Hüfte nach hinten, das freie Bein geht gestreckt nach hinten.', 'Rücken und freies Bein bilden eine lange Linie.'],
  watch: ['Stehe auf einem Bein mit leicht gebeugtem Knie, die Hantel hängt vor dem Oberschenkel.', 'Schiebe die Hüfte nach hinten: Der Oberkörper kippt nach vorn und das freie Bein hebt sich nach hinten.', 'Rücken und freies Bein bleiben in einer Linie, das Becken bleibt gerade.', 'Gehe nur so tief, wie der Rücken gerade bleibt.', 'Mit dem Gesäss die Hüfte wieder nach vorn schieben und aufrichten.'],
  mistakes: ['Der Rücken wird rund.', 'Das Becken dreht sich auf.', 'Das Standbein beugt sich zu stark, es wird eine Kniebeuge.', 'Der Blick geht nach vorn in den Nacken.'],
  feel: 'Rückseite von Oberschenkel und Gesäss des Standbeins, dazu Rumpf und Gleichgewicht.',
  easier: 'Eine Hand an die Wand legen oder die Zehen des freien Beins am Boden lassen.' });

x({ id: 'x-latlunge', name: 'Seitliche Ausfallschritte', gear: 'Körpergewicht oder Gewicht vor der Brust', reg: 'oberschenkel gesaess', eq: '', lvl: 2, pat: 'lunge',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Seite', rest: 75, weight: true, knee: true,
  cues: ['Grosser Schritt zur Seite, das andere Bein bleibt gestreckt.', 'Hüfte nach hinten, das Knie zeigt in Richtung der Zehen.'],
  watch: ['Aufrecht stehen, Füsse zusammen, die Hände vor der Brust.', 'Grosser Schritt zur Seite, den Fuss ganz aufsetzen, die Zehen zeigen nach vorn.', 'Die Hüfte nach hinten schieben und das Knie des Schrittbeins beugen, das andere Bein bleibt gestreckt.', 'Der Oberkörper bleibt aufrecht, die Ferse bleibt am Boden.', 'Vom Schrittbein wieder abdrücken und die Füsse zusammenstellen.'],
  mistakes: ['Das Knie fällt nach innen.', 'Die Ferse des Schrittbeins hebt ab.', 'Der Oberkörper kippt zur Seite.', 'Der Schritt ist zu klein.'],
  feel: 'Gesäss, Innen- und Vorderseite des Oberschenkels auf der Seite des Schrittbeins.' });

x({ id: 'x-swing', name: 'Kettlebell-Swing', gear: 'Kettlebell', reg: 'gesaess oberschenkel ruecken ganz', eq: 'kb', lvl: 2, pat: 'swing',
  sets: 4, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Kraft kommt aus der Hüfte, nicht aus den Armen.', 'Oben aufrecht stehen, das Gesäss ist fest.'],
  watch: ['Füsse schulterbreit, die Kettlebell steht etwa einen Schritt vor dir.', 'Hüfte nach hinten schieben, der Rücken bleibt gerade, die Kugel schwingt zwischen den Beinen nach hinten.', 'Die Hüfte kräftig nach vorn schieben, die Arme bleiben gestreckt und führen die Kugel nur bis Brusthöhe.', 'Oben stehst du aufrecht, das Gesäss ist fest, die Arme sind gestreckt.', 'Lass die Kugel zurückfallen und schiebe die Hüfte wieder nach hinten, ohne die Arme zu beugen.'],
  mistakes: ['Die Arme ziehen die Kugel hoch.', 'Der Rücken wird rund, wenn die Kugel zurückschwingt.', 'Es wird eine Kniebeuge statt eines Hüftstosses.', 'Oben ins Hohlkreuz lehnen.'],
  feel: 'Gesäss und Rückseite der Oberschenkel, dazu Rücken, Rumpf und Griffkraft. Der Puls steigt.',
  easier: 'Zuerst die Hüftbewegung ohne Schwung üben: die Kettlebell mit geradem Rücken vom Boden aufheben und wieder abstellen.' });

x({ id: 'x-trxsquat', name: 'TRX-Kniebeuge', gear: 'TRX', reg: 'oberschenkel gesaess', eq: 'trx', lvl: 1, pat: 'squat',
  sets: 3, reps: '8–12', rest: 60, knee: true,
  cues: ['Mit den Händen an den Griffen das Gleichgewicht halten.', 'Tief hinsetzen, Fersen am Boden, die Arme helfen nur.'],
  watch: ['TRX hoch einhängen, die Griffe mit gestreckten Armen halten und den Körper leicht zurücklehnen.', 'Füsse etwa schulterbreit, die Gurte bleiben gespannt.', 'Hüfte nach hinten und unten schieben, die Arme helfen nur beim Gleichgewicht.', 'Die Knie zeigen in Richtung der Zehen, die Fersen bleiben am Boden.', 'Mit den Beinen hochdrücken, nicht an den Griffen ziehen.'],
  mistakes: ['Mit den Armen hochziehen statt mit den Beinen drücken.', 'Die Knie fallen nach innen.', 'Die Fersen heben ab.', 'Die Gurte hängen durch.'],
  feel: 'Vorderseite der Oberschenkel und Gesäss.',
  easier: 'Weniger tief gehen und mehr Gewicht an die Griffe abgeben.',
  harder: 'Weniger zurücklehnen und langsamer absenken.' });

/* ===== Gesäss ===== */

x({ id: 'x-bridge', name: 'Gesässbrücke', gear: 'Körpergewicht, auf der Matte', reg: 'gesaess oberschenkel', eq: '', lvl: 1, pat: 'bridge',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Fersen nah am Gesäss, die Hüfte hochdrücken.', 'Oben das Gesäss fest anspannen, nicht ins Hohlkreuz.'],
  watch: ['Auf den Rücken legen, Knie gebeugt, Füsse hüftbreit mit den Fersen nah am Gesäss.', 'Die Arme liegen neben dem Körper.', 'Die Hüfte anheben, bis Schultern, Hüfte und Knie eine Linie bilden.', 'Oben 1 bis 2 Sekunden das Gesäss fest anspannen.', 'Langsam wieder absenken.'],
  mistakes: ['Hohlkreuz: die Rippen heben ab, die Hüfte ist zu hoch.', 'Die Füsse stehen zu weit weg, der Beinbeuger krampft.', 'Die Knie fallen nach innen.', 'Der Druck kommt nur aus dem unteren Rücken.'],
  feel: 'Gesäss, dazu Rückseite der Oberschenkel. Spürst du es im unteren Rücken, hebe die Hüfte weniger hoch und spanne das Gesäss bewusster an.',
  easier: 'Nur halb so hoch gehen.',
  harder: 'Ein Gewicht auf die Hüfte legen oder mit einem Bein (einbeinige Brücke).' });

x({ id: 'x-bridge1', name: 'Einbeinige Gesässbrücke', gear: 'Körpergewicht, auf der Matte', reg: 'gesaess oberschenkel', eq: '', lvl: 2, pat: 'bridge',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 45,
  cues: ['Ein Bein gestreckt in der Luft, die Hüfte bleibt waagerecht.', 'Mit der Ferse des Standbeins hochdrücken.'],
  watch: ['Wie die Gesässbrücke, aber ein Bein wird gestreckt nach oben genommen.', 'Das Standbein steht mit der ganzen Sohle, die Ferse nah am Gesäss.', 'Hüfte hochdrücken, bis Schulter, Hüfte und das gestreckte Bein eine Linie bilden.', 'Das Becken bleibt gerade und kippt nicht zur Seite.', 'Oben 1 Sekunde halten, kontrolliert ablassen, dann Seitenwechsel.'],
  mistakes: ['Das Becken sackt zur Seite ab.', 'Hohlkreuz.', 'Mit dem freien Bein Schwung holen.', 'Die Ferse hebt ab.'],
  feel: 'Gesäss und Rückseite des Standbeins, dazu die seitliche Hüfte, die das Becken stabilisiert.',
  easier: 'Die zweibeinige Gesässbrücke.' });

x({ id: 'x-donkey', name: 'Donkey Kicks', gear: 'Körpergewicht, auf der Matte', reg: 'gesaess', eq: '', lvl: 1, pat: 'kick',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 30,
  cues: ['Der Rumpf bleibt ruhig, das Bein drückt nach hinten oben.', 'Das Knie bleibt gebeugt, die Fusssohle zeigt zur Decke.'],
  watch: ['Auf Hände und Knie: Hände unter den Schultern, Knie unter der Hüfte.', 'Den Bauch leicht anspannen, der Rücken bleibt flach.', 'Ein Bein mit gebeugtem Knie nach hinten oben drücken, die Fusssohle zeigt zur Decke.', 'Oben das Gesäss anspannen, nicht höher als die Hüfte.', 'Kontrolliert zurück, dann nach allen Wiederholungen die Seite wechseln.'],
  mistakes: ['Hohlkreuz, das Bein schwingt zu hoch.', 'Das Becken dreht sich auf.', 'Mit Schwung statt mit Spannung.', 'Der Kopf fällt in den Nacken.'],
  feel: 'Gesäss des Beins, das nach hinten geht.',
  harder: 'Ein Band um die Oberschenkel oder eine leichte Hantel in der Kniekehle.' });

x({ id: 'x-kickback', name: 'Kabel-Kickback', gear: 'Kabelzug mit Knöchelmanschette', reg: 'gesaess', eq: 'kz', lvl: 2, pat: 'kick',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 60, weight: true,
  cues: ['Mit den Händen am Gerät festhalten, das Bein nach hinten strecken.', 'Rumpf ruhig, das Gesäss arbeitet.'],
  watch: ['Die Manschette am Knöchel befestigen, den Seilzug unten einstellen.', 'Mit leichter Vorbeuge am Gerät festhalten, der Rücken bleibt gerade.', 'Das Bein gestreckt (oder leicht gebeugt) nach hinten und oben drücken.', 'Oben das Gesäss anspannen, die Hüfte bleibt gerade.', 'Langsam zurückführen, das Gewicht nicht absetzen.'],
  mistakes: ['Hohlkreuz beim Anheben.', 'Das Becken dreht sich auf.', 'Mit Schwung arbeiten.', 'Zu viel Gewicht und eine kleine Bewegung.'],
  feel: 'Gesäss des Arbeitsbeins.' });

x({ id: 'x-sidelegraise', name: 'Seitliches Beinheben', gear: 'Körpergewicht, auf der Matte', reg: 'gesaess', eq: '', lvl: 1, pat: 'abd',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 30,
  cues: ['Auf der Seite liegen, der Körper bleibt in einer Linie.', 'Das obere Bein gestreckt anheben, die Zehen zeigen nach vorn.'],
  watch: ['Lege dich auf die Seite, der Körper bildet eine Linie, der untere Arm stützt den Kopf.', 'Das untere Bein darf leicht gebeugt sein, das obere Bein ist gestreckt.', 'Das obere Bein langsam anheben, die Zehen zeigen nach vorn, nicht zur Decke.', 'Das Becken bleibt gerade und kippt nicht nach hinten.', 'Oben kurz halten, langsam ablassen.'],
  mistakes: ['Das Becken kippt nach hinten.', 'Das Bein wird zu hoch gehoben, der Rumpf kippt mit.', 'Mit Schwung arbeiten.', 'Die Zehen zeigen zur Decke.'],
  feel: 'Der seitliche Gesässmuskel (Gluteus medius) und die seitliche Hüfte.',
  harder: 'Ein Band um die Oberschenkel oder die Fussgelenke.' });

x({ id: 'x-monster', name: 'Monster Walk', gear: 'Widerstandsband', reg: 'gesaess oberschenkel', eq: 'band', lvl: 1, pat: 'abd',
  sets: 3, reps: '8–12', unit: 'Schritte pro Seite', rest: 45,
  cues: ['Das Band bleibt auf Spannung, leicht in die Knie gehen.', 'Kleine Schritte zur Seite, die Füsse bleiben hüftbreit.'],
  watch: ['Das Band um die Oberschenkel oder die Knöchel legen (je tiefer, desto schwerer).', 'Gehe leicht in die Knie, das Gesäss nach hinten, die Brust bleibt offen.', 'Mache kleine Schritte zur Seite und halte dabei die Spannung im Band.', 'Die Knie zeigen immer in Richtung der Zehen und fallen nicht nach innen.', 'Gehe in der Gegenrichtung zurück oder wechsle nach der Hälfte der Schritte.'],
  mistakes: ['Die Knie fallen nach innen.', 'Das Band hängt durch, die Füsse stehen zu nah.', 'Der Oberkörper schaukelt von Seite zu Seite.', 'Die Füsse schlurfen zusammen.'],
  feel: 'Seitliche Gesässmuskeln und Hüfte.' });

/* ===== Rücken ===== */

x({ id: 'x-pullup', name: 'Klimmzug', gear: 'Klimmzugstange', reg: 'ruecken oberarme', eq: 'stange', lvl: 3, pat: 'vpull',
  sets: 3, reps: '6–8', rest: 120,
  cues: ['Zuerst die Schulterblätter nach unten ziehen, dann mit den Ellbogen ziehen.', 'Kinn über die Stange, kontrolliert wieder ablassen.'],
  watch: ['Die Stange etwa schulterbreit greifen, die Handflächen zeigen von dir weg.', 'Zuerst die Schulterblätter nach hinten unten ziehen, die Arme bleiben noch gestreckt.', 'Dann die Ellbogen nach unten zu den Hüften ziehen, bis das Kinn über der Stange ist.', 'Oben kurz halten und in etwa 3 Sekunden bis zu gestreckten Armen ablassen.', 'Der Körper bleibt ruhig, die Beine schwingen nicht.'],
  mistakes: ['Mit Schwung und den Beinen hochkippen.', 'Die Schultern wandern zu den Ohren.', 'Nur halbe Wiederholungen, unten nicht ganz hängen.', 'Der Kopf wird nach vorn gestreckt, um die Stange zu erreichen.'],
  feel: 'Breiter Rückenmuskel (Latissimus), dazu Bizeps und Unterarme.',
  easier: 'Ein Gummiband unter den Knien, die Füsse auf einer Kiste abstützen oder nur langsam ablassen (Negative).',
  harder: 'Zusatzgewicht an einem Gürtel oder 5 Sekunden zum Ablassen nehmen.' });

x({ id: 'x-pulldown', name: 'Latziehen', gear: 'Kabelzug oder Maschine', reg: 'ruecken oberarme', eq: 'kz|ma', lvl: 1, pat: 'vpull',
  sets: 3, reps: '8–10', rest: 75, weight: true,
  cues: ['Brust raus, die Stange zur oberen Brust ziehen.', 'Die Ellbogen gehen nach unten, die Schultern nicht hochziehen.'],
  watch: ['Setze dich so, dass die Oberschenkel unter dem Polster klemmen und die Füsse flach stehen.', 'Greife die Stange etwas breiter als die Schultern, mit gestreckten Armen.', 'Lehne den Oberkörper leicht zurück, die Brust bleibt offen.', 'Ziehe die Stange zur oberen Brust, die Ellbogen gehen nach unten und leicht nach hinten.', 'Lass die Stange langsam wieder nach oben gleiten, bis die Arme gestreckt sind.'],
  mistakes: ['Mit dem ganzen Oberkörper nach hinten schwingen.', 'Die Stange hinter den Kopf ziehen.', 'Die Schultern wandern zu den Ohren.', 'Zu viel Gewicht, die Arme ziehen allein.'],
  feel: 'Breiter Rückenmuskel an der Seite des Rückens, dazu der Bizeps.',
  easier: 'Weniger Gewicht oder ein engerer Griff.' });

x({ id: 'x-cablerow', name: 'Rudern sitzend am Kabel', gear: 'Kabelzug oder Maschine', reg: 'ruecken oberarme', eq: 'kz|ma', lvl: 1, pat: 'row',
  sets: 3, reps: '8–10', rest: 75, weight: true,
  cues: ['Aufrecht sitzen, die Ellbogen eng am Körper nach hinten ziehen.', 'Am Ende die Schulterblätter zusammendrücken.'],
  watch: ['Setze dich aufrecht, die Füsse stehen auf der Platte, die Knie sind leicht gebeugt.', 'Greife den Griff mit gestreckten Armen, der Rücken bleibt gerade.', 'Ziehe zuerst die Schulterblätter zusammen, dann die Ellbogen eng am Körper nach hinten, bis der Griff am Bauch ist.', 'Halte oben 1 Sekunde.', 'Lass den Griff langsam nach vorn gleiten, ohne dass der Rücken rund wird.'],
  mistakes: ['Mit dem Oberkörper vor- und zurückschaukeln.', 'Die Schultern sind hochgezogen.', 'Der Rücken wird beim Strecken der Arme rund.', 'Der Griff wird zu hoch zur Brust gezogen.'],
  feel: 'Mittlerer Rücken zwischen den Schulterblättern, hintere Schulter und Bizeps.' });

x({ id: 'x-bbrow', name: 'Vorgebeugtes Rudern', gear: 'Langhantel', reg: 'ruecken oberarme', eq: 'lh', lvl: 3, pat: 'row',
  sets: 3, reps: '8–10', rest: 90, weight: true,
  cues: ['Der Rücken bleibt gerade, der Oberkörper etwa 45 Grad vorgebeugt.', 'Die Stange zum Bauchnabel ziehen, die Ellbogen eng.'],
  watch: ['Füsse hüftbreit, die Knie leicht gebeugt, die Hüfte nach hinten schieben, der Oberkörper beugt sich auf etwa 45 Grad vor.', 'Die Stange hängt mit gestreckten Armen unter den Schultern, der Rücken bleibt gerade.', 'Ziehe die Stange zum Bauchnabel, die Ellbogen gehen eng am Körper nach hinten.', 'Oben die Schulterblätter zusammendrücken.', 'Senke die Stange langsam, ohne den Oberkörper aufzurichten.'],
  mistakes: ['Der Rücken wird rund.', 'Der Oberkörper richtet sich beim Ziehen auf (Schwung).', 'Die Stange wird zu hoch zur Brust gezogen.', 'Der Kopf wird in den Nacken gelegt.'],
  feel: 'Mittlerer und oberer Rücken, dazu hintere Schulter und Bizeps. Der untere Rücken arbeitet haltend mit.',
  easier: 'Mit Kurzhanteln, am Kabel oder als TRX-Rudern üben.' });

x({ id: 'x-dbrow', name: 'Einarmiges Kurzhantelrudern', gear: 'Kurzhantel, Hand und Knie auf der Bank', reg: 'ruecken oberarme', eq: 'kh bank|box', lvl: 1, pat: 'row',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Arm', rest: 60, weight: true,
  cues: ['Eine Hand und ein Knie auf der Bank, der Rücken bleibt gerade.', 'Die Hantel zur Hüfte ziehen, nicht zur Schulter.'],
  watch: ['Stütze eine Hand und das gleiche Knie auf die Bank, der andere Fuss steht am Boden.', 'Der Rücken ist gerade und etwa waagerecht, der Blick geht zum Boden.', 'Die Hantel hängt mit gestrecktem Arm unter der Schulter.', 'Ziehe die Hantel in einem leichten Bogen zur Hüfte, der Ellbogen geht nah am Körper nach hinten.', 'Oben kurz halten, langsam ablassen, dann den Arm wechseln.'],
  mistakes: ['Der Oberkörper dreht auf.', 'Mit Schwung aus dem Rücken ziehen.', 'Die Hantel wird zur Schulter hochgezogen.', 'Der Rücken wird rund.'],
  feel: 'Breiter Rücken auf der Seite des Arms, dazu die Schulterblattmuskeln und der Bizeps.' });

x({ id: 'x-deadlift', name: 'Kreuzheben', gear: 'Langhantel', reg: 'ruecken gesaess oberschenkel', eq: 'lh', lvl: 3, pat: 'hinge',
  sets: 3, reps: '6–8', rest: 150, weight: true,
  cues: ['Stange nah am Körper, Rücken gerade, mit den Beinen wegdrücken.', 'Oben die Hüfte nach vorn schieben, nicht ins Hohlkreuz.'],
  watch: ['Die Stange liegt über der Fussmitte, die Füsse stehen hüftbreit.', 'Beuge Hüfte und Knie und greife die Stange knapp ausserhalb der Beine, die Arme sind gestreckt.', 'Brust raus, Rücken gerade, baue Spannung auf („die Stange anziehen“).', 'Drücke dich mit den Beinen vom Boden weg, die Stange bleibt nah an Schienbeinen und Oberschenkeln.', 'Oben aufrecht stehen und das Gesäss anspannen. Dann kontrolliert absenken.'],
  mistakes: ['Der Rücken wird rund.', 'Die Stange schwingt vom Körper weg.', 'Die Hüfte schiesst zuerst hoch, und der Rücken muss alles heben.', 'Oben ins Hohlkreuz überstrecken.'],
  feel: 'Rückseite der Oberschenkel, Gesäss und der ganze Rücken. Wähle ein Gewicht, bei dem die Technik sauber bleibt.',
  easier: 'Mit Kurzhanteln oder einer erhöhten Stange beginnen, oder zuerst das Rumänische Kreuzheben üben.' });

x({ id: 'x-superman', name: 'Superman', gear: 'Körpergewicht, auf der Matte', reg: 'ruecken gesaess', eq: '', lvl: 1, pat: 'extend',
  sets: 3, reps: '8–12', rest: 30,
  cues: ['Arme und Beine gleichzeitig leicht anheben.', 'Der Kopf bleibt in Verlängerung der Wirbelsäule, der Blick geht zum Boden.'],
  watch: ['Lege dich auf den Bauch, die Arme nach vorn gestreckt, die Beine gestreckt.', 'Der Blick geht zum Boden, der Nacken bleibt lang.', 'Hebe Arme, Brust und Beine gleichzeitig ein Stück an, nur so weit, wie es angenehm ist.', 'Spanne Gesäss und unteren Rücken an und halte 1 bis 2 Sekunden.', 'Senke dich langsam wieder ab.'],
  mistakes: ['Der Kopf wird in den Nacken gelegt.', 'Zu hoch, der untere Rücken wird gestaucht.', 'Mit Schwung hochschnellen.', 'Luft anhalten.'],
  feel: 'Rückenstrecker entlang der Wirbelsäule, dazu Gesäss und hintere Schulter.',
  easier: 'Abwechselnd nur Arme oder nur Beine anheben.' });

x({ id: 'x-birddog', name: 'Vogel-Hund (Bird Dog)', gear: 'Körpergewicht, auf der Matte', reg: 'ruecken bauch', eq: '', lvl: 1, pat: 'core',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Seite', rest: 30,
  cues: ['Gegenüberliegender Arm und gestrecktes Bein, der Rücken bleibt ruhig.', 'Das Becken bleibt waagerecht, kein Wackeln.'],
  watch: ['Auf Hände und Knie: Hände unter den Schultern, Knie unter der Hüfte, der Rücken ist gerade.', 'Strecke einen Arm nach vorn und das gegenüberliegende Bein nach hinten, bis beide waagerecht sind.', 'Der Bauch ist leicht angespannt, das Becken bleibt gerade.', 'Halte 1 bis 2 Sekunden, ohne dich zu verdrehen.', 'Komm kontrolliert zurück und wechsle die Seite.'],
  mistakes: ['Hohlkreuz, das Bein geht zu hoch.', 'Das Becken kippt zur Seite.', 'Der Rumpf dreht sich.', 'Mit Schwung statt kontrolliert.'],
  feel: 'Rückenstrecker, Gesäss und die tiefen Bauchmuskeln, die den Rumpf stabil halten.',
  easier: 'Nur den Arm oder nur das Bein bewegen.',
  harder: 'Vor dem Strecken Ellbogen und Knie unter dem Bauch zusammenführen.' });

x({ id: 'x-catcow', name: 'Katze und Kuh', gear: 'Körpergewicht, auf der Matte', reg: 'ruecken', eq: '', lvl: 1, pat: 'mob',
  sets: 2, reps: '8–12', rest: 20,
  cues: ['Beim Ausatmen den Rücken rund machen, beim Einatmen den Bauch senken.', 'Langsam und ohne Schmerz bewegen.'],
  watch: ['Auf Hände und Knie: Hände unter den Schultern, Knie unter der Hüfte.', 'Katze: Ausatmen, den Rücken rund machen, das Kinn Richtung Brust, den Bauch einziehen.', 'Kuh: Einatmen, den Bauch sinken lassen, die Brust nach vorn heben, der Blick geht nach vorn oben.', 'Bewege die Wirbelsäule Wirbel für Wirbel, nicht ruckartig.', 'Gehe nur so weit, wie es sich angenehm anfühlt.'],
  mistakes: ['Zu schnell und ruckartig.', 'Die Arme beugen sich.', 'Der Nacken wird überstreckt.', 'Schmerzen werden ignoriert.'],
  feel: 'Eine sanfte Mobilisation entlang der ganzen Wirbelsäule. Gut zum Aufwärmen oder bei einem steifen Rücken.' });

x({ id: 'x-bandrow', name: 'Rudern mit Band', gear: 'Widerstandsband', reg: 'ruecken oberarme', eq: 'band', lvl: 1, pat: 'row',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Aufrecht sitzen, die Ellbogen eng zum Körper ziehen.', 'Am Ende die Schulterblätter zusammendrücken.'],
  watch: ['Setze dich mit gestreckten (oder leicht gebeugten) Beinen auf den Boden und lege das Band um die Füsse.', 'Halte die Enden mit gestreckten Armen, der Rücken ist gerade und aufrecht.', 'Ziehe die Ellbogen eng am Körper nach hinten, bis die Hände am Bauch sind.', 'Drücke am Ende die Schulterblätter zusammen und halte 1 Sekunde.', 'Lass das Band langsam wieder nach vorn gleiten.'],
  mistakes: ['Der Oberkörper lehnt weit nach hinten.', 'Die Schultern werden hochgezogen.', 'Der Rücken wird rund.', 'Das Band schnellt zurück.'],
  feel: 'Mittlerer Rücken, hintere Schulter und Bizeps.',
  harder: 'Ein stärkeres Band oder am Ende 2 Sekunden halten.' });

x({ id: 'x-pullapart', name: 'Band auseinanderziehen', gear: 'Widerstandsband', reg: 'ruecken schultern', eq: 'band', lvl: 1, pat: 'pullapart',
  sets: 3, reps: '8–12', rest: 30,
  cues: ['Die Arme bleiben gestreckt, das Band wird auseinandergezogen.', 'Schulterblätter zusammen, die Schultern bleiben unten.'],
  watch: ['Halte das Band mit beiden Händen etwa schulterbreit vor der Brust, die Arme sind gestreckt.', 'Ziehe das Band auseinander, bis die Arme seitlich waagerecht sind.', 'Drücke dabei die Schulterblätter zusammen.', 'Die Schultern bleiben unten, der Rücken gerade.', 'Lass das Band kontrolliert wieder zusammenkommen.'],
  mistakes: ['Die Schultern wandern zu den Ohren.', 'Hohlkreuz.', 'Das Band schnappt zurück.', 'Die Arme beugen sich stark.'],
  feel: 'Hintere Schulter und oberer Rücken.',
  harder: 'Ein stärkeres Band oder die Arme diagonal nach oben (Y-Form) ziehen.' });

/* ===== Brust ===== */

x({ id: 'x-pushup-knee', name: 'Liegestütze auf den Knien', gear: 'Körpergewicht, auf der Matte', reg: 'brust schultern oberarme', eq: '', lvl: 1, pat: 'push',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Von den Knien bis zum Kopf eine gerade Linie.', 'Die Brust fast bis zum Boden, die Ellbogen schräg nach hinten.'],
  watch: ['Knie auf der Matte, die Hände etwas breiter als die Schultern unter den Schultern aufstützen.', 'Spanne Bauch und Gesäss an, vom Kopf bis zu den Knien ist der Körper eine Linie.', 'Beuge die Ellbogen schräg nach hinten (etwa 45 Grad zum Körper) und senke die Brust fast bis zum Boden.', 'Drücke dich kräftig nach oben, ohne die Ellbogen ganz durchzudrücken.', 'Atme beim Hinuntergehen ein und beim Hochdrücken aus.'],
  mistakes: ['Das Gesäss ragt nach oben.', 'Der Bauch hängt durch (Hohlkreuz).', 'Die Ellbogen zeigen weit zur Seite.', 'Nur ein kleines Stück nach unten gehen.'],
  feel: 'Brust, vordere Schulter und Trizeps, dazu der Bauch, der den Körper stabil hält.',
  harder: 'Zu normalen Liegestützen auf den Zehen wechseln.' });

x({ id: 'x-pushup-incl', name: 'Liegestütze mit erhöhten Händen', gear: 'Bank, Tisch oder Kiste', reg: 'brust schultern oberarme', eq: 'bank|box', lvl: 1, pat: 'push',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Je höher die Hände, desto leichter.', 'Der Körper bleibt eine gerade Linie von den Fersen bis zum Kopf.'],
  watch: ['Stütze die Hände auf eine stabile Erhöhung (Bank, Tisch, Kiste), etwas breiter als die Schultern.', 'Gehe mit den Füssen so weit zurück, dass der Körper eine schräge, gerade Linie bildet.', 'Spanne Bauch und Gesäss an und beuge die Ellbogen schräg nach hinten.', 'Senke die Brust kontrolliert zur Kante, dann drücke dich kräftig weg.', 'Mit der Zeit eine tiefere Erhöhung wählen, bis du am Boden angekommen bist.'],
  mistakes: ['Der Körper hängt in der Mitte durch.', 'Das Gesäss ragt nach oben.', 'Der Kopf geht nach vorn statt die Brust.', 'Die Unterlage ist wacklig oder rutscht weg.'],
  feel: 'Brust, vordere Schulter und Trizeps.' });

x({ id: 'x-bench', name: 'Bankdrücken mit der Langhantel', gear: 'Langhantel und Bank', reg: 'brust schultern oberarme', eq: 'lh bank', lvl: 3, pat: 'bench',
  sets: 3, reps: '6–8', rest: 120, weight: true,
  cues: ['Schulterblätter zusammen und fest auf die Bank, Füsse am Boden.', 'Die Stange zur Brustmitte senken und wieder wegdrücken.'],
  watch: ['Lege dich so hin, dass die Augen unter der Stange sind, die Füsse stehen fest am Boden.', 'Ziehe die Schulterblätter zusammen und nach unten, die Brust ist leicht gehoben.', 'Greife die Stange etwas breiter als die Schultern, das Handgelenk liegt gerade über dem Unterarm.', 'Senke die Stange kontrolliert zur Brustmitte, die Unterarme bleiben senkrecht.', 'Drücke die Stange kräftig nach oben, bis die Arme fast gestreckt sind.'],
  mistakes: ['Das Gesäss hebt von der Bank ab.', 'Die Stange prallt von der Brust ab.', 'Die Ellbogen zeigen im rechten Winkel zur Seite.', 'Ohne Partner an die Grenze gehen. Besser ein Gewicht wählen, das du sicher schaffst, oder in einem Rack mit Sicherungen üben.'],
  feel: 'Brust, vordere Schulter und Trizeps.',
  easier: 'Mit Kurzhanteln oder erhöhten Liegestützen beginnen.' });

x({ id: 'x-dbpress', name: 'Bankdrücken mit Kurzhanteln', gear: 'Kurzhanteln und Bank', reg: 'brust schultern oberarme', eq: 'kh bank', lvl: 2, pat: 'bench',
  sets: 3, reps: '8–10', rest: 90, weight: true,
  cues: ['Schulterblätter zusammen, Hanteln über der Brust.', 'Die Ellbogen schräg zum Körper, nicht ganz zur Seite.'],
  watch: ['Setze dich mit den Hanteln auf die Oberschenkel und lege dich zurück, die Hanteln kommen auf Brusthöhe.', 'Die Füsse stehen fest am Boden, die Schulterblätter sind zusammengezogen.', 'Drücke beide Hanteln gleichzeitig nach oben, bis die Arme fast gestreckt sind.', 'Senke sie langsam wieder ab, bis die Ellbogen knapp unter Brusthöhe sind.', 'Die Handgelenke bleiben gerade, die Hanteln bewegen sich ruhig.'],
  mistakes: ['Die Hanteln schwanken, weil sie zu schwer sind.', 'Die Ellbogen sinken zu tief und belasten die Schulter.', 'Das Gesäss hebt ab.', 'Die Hanteln werden oben zusammengeschlagen.'],
  feel: 'Brust, vordere Schulter und Trizeps. Jede Seite arbeitet für sich.',
  easier: 'Mit leichteren Hanteln oder als Liegestütze mit erhöhten Händen.' });

x({ id: 'x-chestpress', name: 'Brustpresse an der Maschine', gear: 'Brustpresse', reg: 'brust oberarme', eq: 'ma', lvl: 1, pat: 'bench',
  sets: 3, reps: '8–10', rest: 75, weight: true,
  cues: ['Aufrecht sitzen, der Rücken liegt am Polster.', 'Gleichmässig nach vorn drücken, nicht ganz durchstrecken.'],
  watch: ['Stelle den Sitz so ein, dass die Griffe auf Brusthöhe sind.', 'Setze dich aufrecht, Rücken und Kopf liegen am Polster, die Füsse stehen am Boden.', 'Drücke die Griffe gleichmässig nach vorn, bis die Arme fast gestreckt sind.', 'Lasse sie kontrolliert wieder zurückkommen, ohne dass das Gewicht aufsetzt.', 'Atme beim Drücken aus.'],
  mistakes: ['Der Sitz ist zu hoch oder zu tief, die Schultern werden hochgezogen.', 'Die Ellbogen werden hart durchgedrückt.', 'Die Schultern rollen nach vorn.', 'Das Gewicht schlägt am Anschlag auf.'],
  feel: 'Brust, vordere Schulter und Trizeps.' });

x({ id: 'x-cablefly', name: 'Kabel-Fly von oben', gear: 'Kabelzug', reg: 'brust schultern', eq: 'kz', lvl: 2, pat: 'fly',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Arme leicht gebeugt, die Hände kommen vor dem Körper zusammen.', 'Die Bewegung kommt aus der Brust, nicht aus den Armen.'],
  watch: ['Stelle beide Kabel oben ein und stelle dich mittig, einen Fuss etwas vor den anderen.', 'Greife die Griffe, beuge die Arme leicht und lehne dich ein wenig nach vorn.', 'Führe die Hände in einem weiten Bogen nach unten und vorn zusammen, als würdest du jemanden umarmen.', 'Drücke die Brust kurz zusammen und lasse die Arme langsam wieder auseinander.', 'Die Ellbogen bleiben immer leicht gebeugt und auf gleicher Höhe.'],
  mistakes: ['Die Arme strecken und beugen sich, es wird zu einem Drücken.', 'Mit dem Oberkörper schwingen.', 'Zu schwer, die Schultern ziehen nach vorn.', 'Die Arme gehen hinter die Schulter-Linie zurück.'],
  feel: 'Die Brust, besonders an der Innenseite. Die vordere Schulter hilft mit.' });

x({ id: 'x-dips', name: 'Dips an der Bank', gear: 'Bank, Kiste oder stabiler Stuhl', reg: 'oberarme brust', eq: 'bank|box', lvl: 2, pat: 'dip',
  sets: 3, reps: '8–10', rest: 60,
  cues: ['Die Hände stützen hinter dir auf der Kante, der Rücken bleibt nah an der Bank.', 'Nur so tief, bis die Ellbogen etwa 90 Grad haben.'],
  watch: ['Setze dich an die Kante, die Hände neben der Hüfte, die Finger zeigen nach vorn.', 'Rutsche mit dem Gesäss nach vorn, die Beine sind gebeugt und die Füsse stehen am Boden.', 'Beuge die Ellbogen nach hinten und senke den Körper, bis die Ellbogen etwa 90 Grad haben.', 'Der Rücken bleibt nah an der Bank, die Schultern bleiben unten.', 'Drücke dich wieder hoch, ohne die Ellbogen hart durchzudrücken.'],
  mistakes: ['Zu tief, die Schultern rutschen unter die Ellbogen.', 'Die Schultern wandern zu den Ohren.', 'Der Körper driftet weit von der Bank weg.', 'Die Ellbogen zeigen zur Seite statt nach hinten.'],
  feel: 'Hinterseite der Oberarme (Trizeps), dazu Brust und vordere Schulter.',
  easier: 'Die Füsse näher an die Bank stellen und die Knie stärker beugen.',
  harder: 'Die Beine strecken oder ein Bein anheben.' });

x({ id: 'x-medpass', name: 'Medizinball-Brustpass an die Wand', gear: 'Medizinball und Wand', reg: 'brust schultern oberarme', eq: 'mb', lvl: 2, pat: 'push',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Aus den Beinen mit Schwung, Arme strecken, Ball an die Wand.', 'Den Ball fangen und weich zur Brust zurücknehmen.'],
  watch: ['Stelle dich etwa zwei Meter vor eine stabile Wand, die Füsse hüftbreit, die Knie leicht gebeugt.', 'Halte den Ball mit beiden Händen vor der Brust, die Ellbogen zeigen nach unten.', 'Strecke Beine und Arme gleichzeitig und wirf den Ball kräftig auf Brusthöhe gegen die Wand.', 'Fange den Ball weich mit gebeugten Armen und nimm ihn wieder zur Brust.', 'Wiederhole ohne Pause, aber kontrolliert.'],
  mistakes: ['Der Ball wird zu hoch oder zu tief geworfen.', 'Der Rücken wird rund.', 'Die Arme fangen den Ball steif, die Handgelenke werden belastet.', 'Die Wand ist nicht fest oder zu nah.'],
  feel: 'Brust, Schultern und Trizeps, dazu Beine und Rumpf. Eine Übung für schnelle, kräftige Bewegungen.',
  easier: 'Einen leichteren Ball nehmen oder den Ball nur drücken statt werfen.' });

/* ===== Schultern ===== */

x({ id: 'x-ohp', name: 'Schulterdrücken mit Kurzhanteln', gear: 'Kurzhanteln', reg: 'schultern oberarme', eq: 'kh', lvl: 2, pat: 'ohp',
  sets: 3, reps: '8–10', rest: 75, weight: true,
  cues: ['Stehen, Bauch und Gesäss fest, die Rippen bleiben unten.', 'Über den Kopf drücken, ohne ins Hohlkreuz zu fallen.'],
  watch: ['Stehe hüftbreit, die Hanteln auf Schulterhöhe, die Handflächen zeigen nach vorn oder zueinander.', 'Spanne Bauch und Gesäss an, der Blick geht geradeaus.', 'Drücke die Hanteln gerade nach oben, bis die Arme gestreckt sind.', 'Der Kopf geht kurz nach vorn durch die Arme, wenn die Hanteln oben sind.', 'Senke die Hanteln kontrolliert wieder zu den Schultern.'],
  mistakes: ['Ins Hohlkreuz lehnen.', 'Mit den Beinen schwingen, sie sollen nur stabil stehen.', 'Die Hanteln weit vor dem Körper führen.', 'Die Schultern zu den Ohren ziehen.'],
  feel: 'Die Schultern, dazu der Trizeps und der Rumpf, der dich stabil hält.',
  easier: 'Im Sitzen mit Rückenlehne.',
  harder: 'Abwechselnd mit einem Arm oder im Halbkniestand.' });

x({ id: 'x-lateral', name: 'Seitheben', gear: 'Kurzhanteln', reg: 'schultern', eq: 'kh', lvl: 1, pat: 'raise',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Leichte Gewichte, die Arme leicht gebeugt seitlich bis Schulterhöhe heben.', 'Die Schultern bleiben unten, der Rücken ruhig.'],
  watch: ['Stehe aufrecht, in jeder Hand eine leichte Hantel neben dem Körper.', 'Beuge die Ellbogen leicht und halte sie in dieser Haltung.', 'Hebe die Arme seitlich an, bis sie etwa auf Schulterhöhe sind. Die Ellbogen führen die Bewegung an.', 'Halte oben kurz an und senke die Arme langsam in etwa 3 Sekunden.', 'Atme beim Heben aus.'],
  mistakes: ['Zu schwere Gewichte, der Oberkörper schwingt mit.', 'Die Schultern werden hochgezogen.', 'Die Arme gehen höher als die Schultern.', 'Die Hände führen, die Ellbogen hängen nach.'],
  feel: 'Die Seite der Schultern. Wähle ein Gewicht, bei dem die Haltung sauber bleibt.' });

x({ id: 'x-front', name: 'Frontheben', gear: 'Kurzhantel oder Scheibe', reg: 'schultern brust', eq: 'kh', lvl: 1, pat: 'raise',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Die Arme mit leicht gebeugten Ellbogen nach vorn bis Schulterhöhe heben.', 'Der Oberkörper bleibt ruhig, kein Schwung.'],
  watch: ['Stehe aufrecht, die Hanteln hängen vor den Oberschenkeln.', 'Spanne Bauch und Gesäss an.', 'Hebe einen Arm (oder beide) gestreckt nach vorn, bis die Hand auf Schulterhöhe ist.', 'Halte kurz und senke die Hantel langsam wieder ab.', 'Der Rücken bleibt gerade, die Schultern bleiben unten.'],
  mistakes: ['Mit dem Oberkörper nach hinten schwingen.', 'Die Hantel über Schulterhöhe heben.', 'Ein Hohlkreuz machen.', 'Zu schwere Gewichte.'],
  feel: 'Die Vorderseite der Schultern, ein wenig auch die Brust.' });

x({ id: 'x-pike', name: 'Pike-Liegestütze', gear: 'Körpergewicht, auf der Matte', reg: 'schultern oberarme', eq: '', lvl: 3, pat: 'ohp',
  sets: 3, reps: '6–8', rest: 75,
  cues: ['Die Hüfte hoch, der Körper bildet ein umgekehrtes V.', 'Der Kopf sinkt zwischen die Hände, die Ellbogen zeigen nach hinten.'],
  watch: ['Stütze die Hände etwa schulterbreit auf, gehe mit den Füssen näher heran und schiebe die Hüfte nach oben.', 'Die Beine sind fast gestreckt, der Rücken ist gerade, der Kopf ist zwischen den Armen.', 'Beuge die Ellbogen und senke den Kopf kontrolliert Richtung Boden.', 'Drücke dich kräftig hoch, bis die Arme gestreckt sind.', 'Die Hüfte bleibt hoch während der ganzen Bewegung.'],
  mistakes: ['Die Hüfte sinkt ab, es wird ein normaler Liegestütz.', 'Die Ellbogen zeigen weit zur Seite.', 'Der Kopf kippt nach vorn und der Nacken wird belastet.', 'Die Hände sind zu weit vorn oder zu eng.'],
  feel: 'Die Schultern und der Trizeps, dazu der obere Rücken. Ein Einstieg in den Handstand-Liegestütz.',
  easier: 'Die Hände auf eine Erhöhung stellen oder erst nur in der Pike-Position halten.' });

/* ===== Nacken ===== */

x({ id: 'x-chintuck', name: 'Kinn einziehen', gear: 'Körpergewicht, im Stehen oder Sitzen', reg: 'nacken', eq: '', lvl: 1, pat: 'neck',
  sets: 2, reps: '8–12', rest: 20,
  cues: ['Das Kinn gerade nach hinten schieben, als wolltest du ein Doppelkinn machen.', 'Der Blick bleibt geradeaus, der Kopf nickt nicht.'],
  watch: ['Stehe oder sitze aufrecht, die Schultern sind entspannt.', 'Schiebe das Kinn waagerecht nach hinten, der Blick geht weiter nach vorn.', 'Halte 3 bis 5 Sekunden, du spürst die tiefen Nackenmuskeln.', 'Lasse den Kopf wieder locker nach vorn kommen.', 'Wiederhole mehrmals in Ruhe, gerne während des Tages.'],
  mistakes: ['Der Kopf wird in den Nacken gelegt.', 'Das Kinn senkt sich zur Brust (Nicken).', 'Die Schultern werden hochgezogen.', 'Mit Gewalt statt locker.'],
  feel: 'Eine sanfte Aktivierung der tiefen Nackenmuskeln. Gut gegen Verspannungen nach langem Sitzen.' });

x({ id: 'x-neckiso', name: 'Nacken mit der Hand (isometrisch)', gear: 'Eine Hand', reg: 'nacken', eq: '', lvl: 1, pat: 'neck', timer: true, holds: [10, 15, 20],
  sets: 3, rest: 30,
  cues: ['Die Hand an die Stirn legen und den Kopf dagegen drücken, ohne dass er sich bewegt.', 'Langsam steigern und gleichmässig weiteratmen.'],
  watch: ['Stehe oder sitze aufrecht, lege die Hand an die Stirn.', 'Drücke den Kopf langsam gegen die Hand, die Hand hält dagegen. Der Kopf bewegt sich nicht.', 'Steigere den Druck in etwa 2 Sekunden und halte ihn bis zum Ende der Zeit.', 'Lasse langsam los. Atme weiter, die Schultern bleiben entspannt.', 'Wechsle die Richtung: seitlich links, seitlich rechts, Hinterkopf.'],
  mistakes: ['Zu viel Druck, es entsteht Schmerz.', 'Die Luft wird angehalten.', 'Die Schultern werden hochgezogen.', 'Der Kopf kippt weg.'],
  feel: 'Die Nackenmuskeln arbeiten, ohne dass sich der Kopf bewegt. Bei Nackenschmerzen oder Schwindel nicht ausführen und mit der Ärztin, dem Arzt oder der Physiotherapie klären.' });

x({ id: 'x-shrug', name: 'Schulterheben', gear: 'Kurzhanteln', reg: 'nacken schultern', eq: 'kh', lvl: 1, pat: 'shrug',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Die Schultern gerade nach oben zu den Ohren ziehen und kurz halten.', 'Nicht kreisen, nicht nach vorn rollen.'],
  watch: ['Stehe aufrecht, in jeder Hand eine Hantel neben dem Körper, die Arme hängen gestreckt.', 'Ziehe die Schultern gerade nach oben, als wolltest du sie zu den Ohren bringen.', 'Halte oben 1 bis 2 Sekunden.', 'Senke die Schultern langsam wieder ab, die Arme bleiben gestreckt.', 'Der Kopf bleibt gerade, der Blick geht geradeaus.'],
  mistakes: ['Die Schultern kreisen.', 'Der Kopf wird nach vorn gestreckt.', 'Die Ellbogen beugen sich.', 'Zu schwer, dann entsteht Schwung.'],
  feel: 'Der obere Teil des Rückens zwischen Nacken und Schulter (Trapezmuskel).' });

x({ id: 'x-neckstretch', name: 'Nacken dehnen', gear: 'Körpergewicht, im Sitzen oder Stehen', reg: 'nacken', eq: '', lvl: 1, pat: 'stretch', timer: true, holds: [20, 30, 45], sides: 2,
  sets: 2, rest: 15,
  cues: ['Das Ohr sanft Richtung Schulter neigen, die andere Schulter bleibt unten.', 'Nur so weit, dass es angenehm zieht, nicht schmerzt.'],
  watch: ['Sitze oder stehe aufrecht, die Schultern sind locker.', 'Neige den Kopf langsam zur Seite, als wolltest du das Ohr auf die Schulter legen.', 'Die andere Schulter bleibt unten, du spürst ein Ziehen an der Seite des Halses.', 'Atme ruhig und lasse den Kopf nur durch sein eigenes Gewicht sinken.', 'Danach die Seite wechseln.'],
  mistakes: ['Mit der Hand am Kopf ziehen.', 'Die Schulter geht nach oben.', 'Der Kopf dreht nach vorn oder hinten.', 'Wippen oder federn.'],
  feel: 'Ein sanftes Ziehen an der Seite des Halses. Bei Schmerz, Kribbeln oder Schwindel sofort stoppen.' });

/* ===== Bauch ===== */

x({ id: 'x-crunch', name: 'Crunch', gear: 'Körpergewicht, auf der Matte', reg: 'bauch', eq: '', lvl: 1, pat: 'crunch',
  sets: 3, reps: '8–12', rest: 30,
  cues: ['Rücken am Boden, nur den Oberkörper ein Stück aufrollen.', 'Der Nacken bleibt lang, die Hände stützen nur den Kopf.'],
  watch: ['Lege dich auf den Rücken, die Füsse stehen am Boden, die Knie sind gebeugt.', 'Die Hände liegen locker hinter dem Kopf oder auf der Brust, die Ellbogen zeigen zur Seite.', 'Atme aus und rolle Kopf und Schultern nur etwa eine Handbreit vom Boden auf, der untere Rücken bleibt am Boden.', 'Spanne den Bauch am höchsten Punkt kurz an.', 'Senke dich langsam wieder ab, ohne den Kopf ganz abzulegen.'],
  mistakes: ['Mit den Händen am Kopf ziehen.', 'Der Kopf wird nach vorn gedrückt (Kinn auf der Brust).', 'Mit Schwung hochschnellen.', 'Zu hoch aufsetzen, der untere Rücken hebt ab.'],
  feel: 'Die geraden Bauchmuskeln. Es geht um eine kleine, saubere Bewegung, nicht um das hohe Aufsetzen.',
  easier: 'Die Arme über der Brust verschränken und nur wenig anheben.',
  harder: 'Die Beine anheben oder eine Hantel auf die Brust legen.' });

x({ id: 'x-legraise', name: 'Beinheben liegend', gear: 'Körpergewicht, auf der Matte', reg: 'bauch', eq: '', lvl: 2, pat: 'legraise',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Der untere Rücken bleibt am Boden, kein Hohlkreuz.', 'Die Beine langsam heben und noch langsamer ablassen.'],
  watch: ['Lege dich auf den Rücken, die Arme liegen neben dem Körper, die Handflächen am Boden.', 'Strecke die Beine und halte sie zusammen.', 'Hebe die Beine bis senkrecht in die Höhe, der untere Rücken bleibt am Boden.', 'Senke sie langsam, bis sie knapp über dem Boden sind. Nur so tief, wie der Rücken am Boden bleibt.', 'Atme beim Heben aus.'],
  mistakes: ['Der untere Rücken wölbt sich ab (Hohlkreuz).', 'Die Beine schwingen mit Schwung.', 'Die Knie werden stark gebeugt.', 'Der Kopf wird angehoben und der Nacken verspannt.'],
  feel: 'Der untere Teil der Bauchmuskeln und die Hüftbeuger.',
  easier: 'Die Knie beugen oder nur ein Bein nach dem anderen heben.',
  harder: 'Die Beine knapp über dem Boden halten, bevor du sie wieder hebst.' });

x({ id: 'x-sideplank', name: 'Seitstütz', gear: 'Körpergewicht, auf der Matte', reg: 'bauch ruecken', eq: '', lvl: 2, pat: 'core', timer: true, holds: [15, 20, 30], sides: 2,
  sets: 2, rest: 30,
  cues: ['Der Ellbogen unter der Schulter, der Körper bildet eine gerade Linie.', 'Das Becken bleibt oben, nichts sackt durch.'],
  watch: ['Lege dich auf die Seite, der Ellbogen liegt unter der Schulter, der Unterarm zeigt nach vorn.', 'Die Beine sind gestreckt und übereinander, die Füsse aufeinander.', 'Hebe das Becken, bis der Körper von Kopf bis Fuss eine gerade Linie bildet.', 'Die obere Hand liegt an der Hüfte oder zeigt zur Decke.', 'Atme ruhig weiter, halte die Zeit und wechsle dann die Seite.'],
  mistakes: ['Das Becken sackt durch.', 'Die Schulter wandert zum Ohr.', 'Der Körper kippt nach vorn oder hinten.', 'Die Luft wird angehalten.'],
  feel: 'Die seitlichen Bauchmuskeln und der Rumpf, dazu die Schulter der Stützseite.',
  easier: 'Die Knie bleiben am Boden, nur die Hüfte wird angehoben.',
  harder: 'Den oberen Arm zur Decke strecken oder das obere Bein anheben.' });

x({ id: 'x-deadbug', name: 'Dead Bug', gear: 'Körpergewicht, auf der Matte', reg: 'bauch', eq: '', lvl: 1, pat: 'core',
  sets: 3, reps: '8–10', unit: 'Wdh. pro Seite', rest: 30,
  cues: ['Der untere Rücken bleibt am Boden, ganz ruhig atmen.', 'Gegenüberliegender Arm und gegenüberliegendes Bein strecken.'],
  watch: ['Lege dich auf den Rücken, die Arme zeigen zur Decke, die Knie sind über den Hüften im rechten Winkel gebeugt.', 'Drücke den unteren Rücken leicht in den Boden und halte ihn dort.', 'Strecke langsam einen Arm nach hinten über den Kopf und das gegenüberliegende Bein nach vorn.', 'Atme aus, wenn du streckst, und komme langsam zurück.', 'Dann die andere Seite. Nur so weit, wie der Rücken am Boden bleibt.'],
  mistakes: ['Der untere Rücken hebt sich ab.', 'Arm und Bein derselben Seite bewegen sich.', 'Zu schnell und mit Schwung.', 'Die Luft wird angehalten.'],
  feel: 'Die tiefen Bauchmuskeln, die den Rumpf stabil halten.',
  easier: 'Nur die Beine oder nur die Arme bewegen.' });

x({ id: 'x-bicycle', name: 'Fahrrad-Crunch', gear: 'Körpergewicht, auf der Matte', reg: 'bauch', eq: '', lvl: 2, pat: 'crunch',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Seite', rest: 30,
  cues: ['Ellbogen zum gegenüberliegenden Knie, der Oberkörper dreht mit.', 'Langsam, nicht strampeln.'],
  watch: ['Lege dich auf den Rücken, die Hände leicht hinter dem Kopf.', 'Hebe die Schultern leicht an und bringe die Knie in die Luft.', 'Strecke ein Bein aus, bringe das andere Knie zur Brust und drehe den Oberkörper, sodass der gegenüberliegende Ellbogen zum Knie geht.', 'Wechsle die Seite in einer ruhigen Bewegung.', 'Der Kopf wird nicht mit den Händen gezogen.'],
  mistakes: ['Mit den Händen am Nacken ziehen.', 'Zu schnell strampeln.', 'Das gestreckte Bein sinkt so tief, dass der Rücken ein Hohlkreuz macht.', 'Nur die Ellbogen bewegen, der Oberkörper dreht nicht mit.'],
  feel: 'Gerade und schräge Bauchmuskeln.' });

x({ id: 'x-mountain', name: 'Bergsteiger (Mountain Climbers)', gear: 'Körpergewicht, auf der Matte', reg: 'bauch oberschenkel', eq: '', lvl: 2, pat: 'cardio',
  sets: 3, reps: '8–12', unit: 'Wdh. gesamt', rest: 45,
  cues: ['Stütz auf den Händen, der Körper bleibt eine Linie.', 'Die Knie abwechselnd Richtung Brust ziehen.'],
  watch: ['Gehe in den Stütz auf den Händen, die Hände unter den Schultern, der Körper eine gerade Linie.', 'Spanne Bauch und Gesäss an.', 'Ziehe ein Knie zur Brust, dann wechsle schnell die Beine.', 'Die Hüfte bleibt unten und ruhig, sie hüpft nicht.', 'Beginne langsam und steigere das Tempo, wenn die Technik sitzt.'],
  mistakes: ['Die Hüfte ragt nach oben.', 'Der Bauch hängt durch.', 'Die Hände wandern nach vorn.', 'Zu schnell und unsauber.'],
  feel: 'Der Bauch und die Beuger der Hüfte, dazu Schultern und Arme, die stützen. Der Puls geht rasch hoch.',
  easier: 'Die Hände auf eine Erhöhung stellen oder langsam im Schritttempo.' });

x({ id: 'x-hangknee', name: 'Knieheben im Hang', gear: 'Klimmzugstange', reg: 'bauch unterarme', eq: 'stange', lvl: 3, pat: 'legraise',
  sets: 3, reps: '8–10', rest: 60,
  cues: ['Ruhig hängen, die Schultern aktiv, dann die Knie bis zur Hüfte heben.', 'Nicht schwingen.'],
  watch: ['Greife die Stange etwa schulterbreit und hänge mit gestreckten Armen, die Schulterblätter sind leicht nach unten gezogen.', 'Spanne den Bauch an und rolle das Becken leicht ein.', 'Hebe beide Knie kontrolliert bis auf Hüfthöhe oder höher.', 'Senke sie langsam wieder ab, ohne dass der Körper schwingt.', 'Atme beim Heben aus.'],
  mistakes: ['Mit Schwung aus dem Körper hochkippen.', 'Die Schultern hängen schlaff und werden belastet.', 'Die Beine werden nur mit den Hüftbeugern gezogen, der Bauch bleibt ausser Acht.', 'Zu viele Wiederholungen mit schwacher Technik.'],
  feel: 'Der untere Bauch und die Hüftbeuger, dazu die Unterarme, die dich halten.',
  easier: 'Im Stütz am Barren oder die Füsse auf dem Boden lassen und nur ein Knie nach dem anderen heben.' });

x({ id: 'x-hollow', name: 'Hollow Hold', gear: 'Körpergewicht, auf der Matte', reg: 'bauch', eq: '', lvl: 2, pat: 'core', timer: true, holds: [15, 20, 30],
  sets: 3, rest: 30,
  cues: ['Der untere Rücken bleibt am Boden, der Körper bildet eine flache Schale.', 'Arme und Beine lang, Schultern leicht vom Boden.'],
  watch: ['Lege dich auf den Rücken und strecke die Arme über den Kopf.', 'Drücke den unteren Rücken fest in den Boden.', 'Hebe Schultern, Arme und die gestreckten Beine leicht an, sodass der Körper eine flache Schale bildet.', 'Je tiefer die Beine, desto schwerer. Wähle eine Höhe, bei der der Rücken am Boden bleibt.', 'Atme ruhig weiter und halte die Zeit.'],
  mistakes: ['Der untere Rücken wölbt sich vom Boden ab.', 'Der Kopf wird nach vorn gedrückt.', 'Die Luft wird angehalten.', 'Die Knie sind gebeugt, obwohl das Ziel gestreckte Beine sind.'],
  feel: 'Der ganze Bauch arbeitet gegen den Boden. Eine anspruchsvolle Haltung.',
  easier: 'Die Knie anwinkeln oder die Arme am Körper lassen.',
  harder: 'Die Arme über den Kopf und die Beine tiefer halten.' });

x({ id: 'x-cablecrunch', name: 'Kabel-Crunch kniend', gear: 'Kabelzug mit Seil', reg: 'bauch', eq: 'kz', lvl: 2, pat: 'crunch',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Das Seil am Kopf halten, die Wirbelsäule einrollen.', 'Die Hüfte bleibt ruhig, der Bauch zieht.'],
  watch: ['Knie dich vor das Kabel, das Seil ist oben befestigt, die Hände halten es neben dem Kopf.', 'Der Rücken ist gerade, das Gesäss über den Fersen.', 'Rolle den Oberkörper ein, bringe die Ellbogen Richtung Knie.', 'Spanne am tiefsten Punkt den Bauch an.', 'Rolle langsam wieder auf, ohne die Hüfte zu bewegen.'],
  mistakes: ['Mit den Armen ziehen.', 'Das Gesäss geht auf und ab.', 'Zu schwer, der Rücken wird nur gebeugt statt eingerollt.', 'Zu schnell.'],
  feel: 'Die geraden Bauchmuskeln, mit gutem Widerstand.' });

x({ id: 'x-sidebend', name: 'Seitbeugen mit Kurzhantel', gear: 'Kurzhantel', reg: 'bauch', eq: 'kh', lvl: 1, pat: 'sidebend',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Seite', rest: 45, weight: true,
  cues: ['Gerade nach unten zur Seite, nicht nach vorn.', 'Die andere Hand locker am Kopf oder an der Hüfte.'],
  watch: ['Stehe aufrecht, in einer Hand eine Hantel, die andere Hand hinter dem Kopf oder an der Hüfte.', 'Beuge den Oberkörper seitlich nach unten in Richtung der Hantel, ohne dich zu drehen.', 'Spüre die Dehnung an der Gegenseite.', 'Richte dich mit der Kraft der seitlichen Bauchmuskeln wieder auf.', 'Mach alle Wiederholungen auf einer Seite, dann wechsle.'],
  mistakes: ['Nach vorn oder hinten beugen statt zur Seite.', 'Zu schwere Hantel.', 'Mit Schwung auf- und abwippen.', 'Beide Hanteln gleichzeitig, das hebt sich auf.'],
  feel: 'Die seitlichen Bauchmuskeln.' });

/* ===== Oberarme ===== */

x({ id: 'x-bbcurl', name: 'Langhantel-Curl', gear: 'Langhantel oder SZ-Stange', reg: 'oberarme unterarme', eq: 'lh', lvl: 2, pat: 'curl',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Ellbogen bleiben neben dem Körper, nur die Unterarme bewegen sich.', 'Oben kurz anspannen, langsam ablassen.'],
  watch: ['Stehe hüftbreit, greife die Stange untergriffig, etwa schulterbreit.', 'Die Ellbogen liegen am Körper, der Oberkörper ist aufrecht.', 'Rolle die Stange nach oben, bis die Unterarme senkrecht sind.', 'Halte oben kurz an und senke die Stange in etwa 3 Sekunden.', 'Atme beim Hochrollen aus.'],
  mistakes: ['Mit dem Oberkörper schwingen.', 'Die Ellbogen wandern nach vorn.', 'Die Handgelenke knicken ein.', 'Unten nicht ganz strecken.'],
  feel: 'Der Bizeps an der Vorderseite des Oberarms.' });

x({ id: 'x-cablecurl', name: 'Kabel-Curl', gear: 'Kabelzug', reg: 'oberarme unterarme', eq: 'kz', lvl: 1, pat: 'curl',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Der Zug ist immer da, auch unten nicht ablegen.', 'Ellbogen am Körper, nur die Unterarme bewegen sich.'],
  watch: ['Stelle das Kabel unten ein und greife die Stange oder das Seil, einen Schritt vor dem Gerät.', 'Stehe aufrecht, die Ellbogen am Körper.', 'Rolle den Griff nach oben, bis die Unterarme senkrecht sind.', 'Halte oben kurz an und lasse langsam wieder ab, das Gewicht bleibt in der Spannung.', 'Atme beim Hochrollen aus.'],
  mistakes: ['Die Ellbogen wandern nach vorn.', 'Mit dem Rücken zurücklehnen.', 'Das Gewicht wird unten abgelegt.', 'Zu schnell.'],
  feel: 'Der Bizeps, mit gleichmässigem Widerstand über die ganze Bewegung.' });

x({ id: 'x-trxcurl', name: 'TRX-Curl', gear: 'TRX-Bänder', reg: 'oberarme unterarme', eq: 'trx', lvl: 2, pat: 'curl',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Der Körper bleibt gerade, die Ellbogen auf Schulterhöhe.', 'Die Hände kommen zur Stirn.'],
  watch: ['Greife die Griffe mit den Handflächen zu dir, gehe zurück, bis die Bänder gespannt sind.', 'Lehne dich mit geradem Körper nach hinten, die Arme sind gestreckt.', 'Beuge die Ellbogen und ziehe die Hände zur Stirn, die Ellbogen bleiben auf gleicher Höhe.', 'Der Körper bleibt eine gerade Linie von den Füssen zum Kopf.', 'Strecke die Arme langsam wieder aus.'],
  mistakes: ['Die Hüfte hängt durch.', 'Die Ellbogen sinken nach unten.', 'Mit dem Körper ziehen statt mit den Armen.', 'Zu flach, die Spannung geht verloren.'],
  feel: 'Der Bizeps. Je weiter du dich zurücklehnst, desto schwerer wird es.',
  easier: 'Aufrechter stehen.',
  harder: 'Die Füsse weiter nach vorn stellen.' });

x({ id: 'x-pushdown', name: 'Trizeps-Pushdown am Kabel', gear: 'Kabelzug mit Stange oder Seil', reg: 'oberarme', eq: 'kz', lvl: 1, pat: 'extension',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Die Ellbogen bleiben fest am Körper.', 'Nach unten strecken und oben unter Spannung zurückkommen.'],
  watch: ['Stelle das Kabel oben ein und greife die Stange oder das Seil.', 'Stehe aufrecht, die Ellbogen am Körper, die Unterarme zeigen waagerecht nach vorn.', 'Strecke die Arme nach unten, bis sie gerade sind.', 'Halte unten kurz an und spanne den Trizeps an.', 'Lasse den Griff langsam wieder nach oben kommen, die Ellbogen bleiben dabei an Ort und Stelle.'],
  mistakes: ['Die Ellbogen wandern nach vorn.', 'Der Oberkörper beugt sich mit.', 'Die Schultern werden hochgezogen.', 'Zu schwer, dann wird mit dem Körper gedrückt.'],
  feel: 'Die Hinterseite der Oberarme (Trizeps).' });

x({ id: 'x-skull', name: 'Trizepsstrecken liegend', gear: 'SZ-Stange oder Kurzhanteln und Bank', reg: 'oberarme', eq: 'bank kh|lh', lvl: 2, pat: 'extension',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Oberarme bleiben senkrecht, nur die Unterarme bewegen sich.', 'Zur Stirn senken und wieder strecken.'],
  watch: ['Lege dich auf die Bank, die Hantel oder Stange halten die Arme gestreckt über der Brust.', 'Die Oberarme bleiben senkrecht und still.', 'Beuge die Ellbogen und senke die Gewichte kontrolliert Richtung Stirn oder hinter den Kopf.', 'Strecke die Arme wieder, ohne die Ellbogen nach aussen zu drehen.', 'Wähle ein Gewicht, das du sicher kontrollierst.'],
  mistakes: ['Die Ellbogen sinken nach hinten, es wird ein Zug aus der Schulter.', 'Die Ellbogen zeigen weit zur Seite.', 'Zu schwer, die Hantel gefährdet den Kopf.', 'Das Gesäss hebt ab.'],
  feel: 'Die Hinterseite der Oberarme (Trizeps). Achte beim Senken auf den Kopf.' });

x({ id: 'x-kickbacktri', name: 'Trizeps-Kickback', gear: 'Kurzhantel', reg: 'oberarme', eq: 'kh', lvl: 1, pat: 'extension',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Arm', rest: 45, weight: true,
  cues: ['Der Oberarm liegt parallel zum Rücken und bleibt still.', 'Den Unterarm nach hinten ausstrecken und kurz halten.'],
  watch: ['Beuge den Oberkörper nach vorn, stütze die freie Hand auf dem Oberschenkel, der Rücken bleibt gerade.', 'Ziehe den Oberarm mit der Hantel an den Körper, parallel zum Rücken.', 'Der Unterarm hängt senkrecht nach unten.', 'Strecke den Arm nach hinten, bis er gerade ist, und halte kurz.', 'Beuge ihn kontrolliert wieder, der Oberarm bleibt dabei still.'],
  mistakes: ['Der Oberarm sinkt nach unten, der Schwung macht die Arbeit.', 'Der Rücken wird rund.', 'Zu schwer, der Körper schwingt mit.', 'Der Arm wird nicht ganz gestreckt.'],
  feel: 'Die Hinterseite des Oberarms (Trizeps). Hier genügt ein leichtes Gewicht.' });

x({ id: 'x-ohtri', name: 'Trizepsstrecken über Kopf', gear: 'Kurzhantel', reg: 'oberarme', eq: 'kh', lvl: 1, pat: 'extension',
  sets: 3, reps: '8–12', rest: 45, weight: true,
  cues: ['Die Ellbogen zeigen nach oben und bleiben nah am Kopf.', 'Nur die Unterarme bewegen sich.'],
  watch: ['Stehe oder sitze aufrecht und halte eine Hantel mit beiden Händen über dem Kopf, die Arme sind gestreckt.', 'Beuge die Ellbogen und senke die Hantel langsam hinter den Kopf.', 'Die Ellbogen zeigen zur Decke und bleiben eng.', 'Strecke die Arme wieder nach oben, bis sie gerade sind.', 'Der Rumpf bleibt fest, kein Hohlkreuz.'],
  mistakes: ['Die Ellbogen fallen nach aussen.', 'Der Rücken geht ins Hohlkreuz.', 'Die Hantel wird zu schwer gewählt.', 'Der Kopf wird nach vorn gestreckt.'],
  feel: 'Die Hinterseite der Oberarme, vor allem der lange Kopf des Trizeps. Bei Schulterbeschwerden im Sitzen und mit leichtem Gewicht üben.' });

/* ===== Unterarme ===== */

x({ id: 'x-wristcurl', name: 'Handgelenkcurl', gear: 'Kurzhantel oder Langhantel', reg: 'unterarme', eq: 'kh|lh', lvl: 1, pat: 'wrist',
  sets: 3, reps: '8–12', rest: 30, weight: true,
  cues: ['Die Unterarme liegen auf den Oberschenkeln, nur die Handgelenke bewegen sich.', 'Leichtes Gewicht, kleine, saubere Bewegung.'],
  watch: ['Setze dich hin und stütze die Unterarme auf die Oberschenkel, die Hände ragen über die Knie, die Handflächen zeigen nach oben.', 'Lasse die Hantel langsam in die Finger rollen, dann schliesse die Finger.', 'Beuge das Handgelenk und hebe die Hantel nach oben.', 'Halte oben kurz an und senke wieder ab.', 'Die Unterarme bleiben liegen.'],
  mistakes: ['Die Arme heben mit ab.', 'Zu schwer, die Bewegung wird ruckartig.', 'Zu schnell.', 'Schmerz im Handgelenk ignorieren.'],
  feel: 'Die Unterseite der Unterarme. Bei Schmerzen im Handgelenk oder in der Sehne bitte aufhören und mit der Physiotherapie abklären.' });

x({ id: 'x-farmer', name: 'Koffertragen', gear: 'Zwei Kurzhanteln oder Kettlebells', reg: 'unterarme schultern', eq: 'kh|kb', lvl: 1, pat: 'carry', timer: true, holds: [30, 45, 60],
  sets: 3, rest: 60, weight: true,
  cues: ['Aufrecht gehen, die Schultern unten, fest zugreifen.', 'Kleine, ruhige Schritte.'],
  watch: ['Nimm in jede Hand ein schweres Gewicht und stehe aufrecht.', 'Die Schultern sind zurück und unten, der Bauch ist leicht angespannt.', 'Gehe mit kleinen, ruhigen Schritten und schwinge die Gewichte nicht.', 'Atme ruhig weiter.', 'Halte die Zeit durch, dann stelle die Gewichte kontrolliert ab.'],
  mistakes: ['Der Oberkörper kippt zur Seite.', 'Die Schultern gehen nach vorn und oben.', 'Zu grosse Schritte, die Gewichte schwingen.', 'Zu schwer, der Griff geht verloren.'],
  feel: 'Unterarme und Griffkraft, dazu Schultern, Rücken und Rumpf, die dich aufrecht halten.' });

x({ id: 'x-deadhang', name: 'Hängen an der Stange', gear: 'Klimmzugstange', reg: 'unterarme ruecken', eq: 'stange', lvl: 2, pat: 'hold', timer: true, holds: [15, 20, 30],
  sets: 3, rest: 60,
  cues: ['Fest zugreifen, die Schulterblätter aktiv, die Beine ruhig.', 'Locker atmen.'],
  watch: ['Greife die Stange etwa schulterbreit und hänge mit gestreckten Armen.', 'Ziehe die Schulterblätter leicht nach unten, ohne die Arme zu beugen.', 'Die Beine hängen ruhig oder sind leicht angewinkelt.', 'Atme weiter und halte die Zeit.', 'Springe zum Beenden nicht ab, sondern stelle die Füsse kontrolliert ab.'],
  mistakes: ['Die Schultern hängen schlaff bis zu den Ohren.', 'Die Luft wird angehalten.', 'Der Körper schaukelt.', 'Zu lange, bis der Griff plötzlich nachgibt.'],
  feel: 'Griffkraft und Unterarme, dazu eine sanfte Dehnung für die Schultern. Bei Schulterschmerzen die Zeit kürzen oder weglassen.' });

/* ===== Ganzkörper ===== */

x({ id: 'x-burpee', name: 'Burpee', gear: 'Körpergewicht', reg: 'ganz', eq: '', lvl: 3, pat: 'cardio',
  sets: 3, reps: '8–10', rest: 60,
  cues: ['Hocke, Stütz, zurück in die Hocke, hochspringen.', 'Ruhig anfangen, die Technik zählt mehr als das Tempo.'],
  watch: ['Stehe aufrecht, gehe in die Hocke und setze die Hände auf den Boden.', 'Springe oder gehe mit den Füssen zurück in den Stütz.', 'Optional: ein Liegestütz.', 'Springe oder gehe mit den Füssen wieder zu den Händen.', 'Springe nach oben, die Arme gehen über den Kopf. Dann gleich in die nächste Wiederholung.'],
  mistakes: ['Der Rücken hängt im Stütz durch.', 'Mit sehr hohem Tempo, bis die Technik zerfällt.', 'Der Landeplatz ist rutschig.', 'Die Knie fallen nach innen.'],
  feel: 'Der ganze Körper arbeitet, der Puls steigt schnell. Gehen statt Springen ist eine gute, sanftere Form.',
  easier: 'Die Füsse nacheinander zurücksetzen und ohne Sprung aufstehen.' });

x({ id: 'x-jack', name: 'Hampelmann', gear: 'Körpergewicht', reg: 'ganz', eq: '', lvl: 1, pat: 'cardio',
  sets: 3, reps: '8–12', rest: 30,
  cues: ['Locker auf den Fussballen, die Arme schwingen mit.', 'Weich landen, die Knie leicht gebeugt.'],
  watch: ['Stehe mit geschlossenen Füssen, die Arme am Körper.', 'Springe mit den Füssen auseinander und hebe gleichzeitig die Arme seitlich über den Kopf.', 'Springe zurück in die Ausgangsposition.', 'Lande weich auf den Fussballen mit leicht gebeugten Knien.', 'Atme gleichmässig.'],
  mistakes: ['Hart auf den Fersen landen.', 'Die Knie sind durchgedrückt.', 'Die Arme werden schlaff geschwungen.', 'Zu schnell, bis der Atem fehlt.'],
  feel: 'Der Puls geht hoch, die Beine und Schultern arbeiten. Bei Knie- oder Gelenkproblemen als Schritt-Variante ohne Sprung (Step Jack).',
  easier: 'Ohne Sprung: abwechselnd einen Fuss zur Seite setzen.' });

x({ id: 'x-thruster', name: 'Thruster', gear: 'Zwei Kurzhanteln', reg: 'ganz', eq: 'kh', lvl: 2, pat: 'squat',
  sets: 3, reps: '8–10', rest: 75, weight: true, knee: true,
  cues: ['Tief in die Kniebeuge, dann mit Schwung hochstehen und über den Kopf drücken.', 'Eine fliessende Bewegung.'],
  watch: ['Stehe hüftbreit, die Hanteln auf den Schultern, die Ellbogen zeigen nach vorn.', 'Gehe in die Kniebeuge, die Knie über den Füssen, der Rücken bleibt gerade.', 'Drücke dich kräftig nach oben und nutze den Schwung, um die Hanteln über den Kopf zu drücken.', 'Oben stehen die Arme gestreckt und der Körper aufrecht.', 'Senke die Hanteln wieder zu den Schultern und gehe sofort in die nächste Kniebeuge.'],
  mistakes: ['Die Knie fallen nach innen.', 'Die Hanteln werden nur mit den Armen gedrückt, ohne die Beine.', 'Der Rücken wird rund.', 'Zu schwer, die Technik zerfällt.'],
  feel: 'Beine, Gesäss, Schultern und Rumpf in einer Bewegung. Bei Knieproblemen nur so tief, wie es dir gut tut.',
  easier: 'Zuerst Kniebeuge und Schulterdrücken getrennt üben.' });

/* ===== zwei leichte Übungen für Arme und Brust ohne Geräte ===== */

x({ id: 'x-wallpush', name: 'Liegestütze an der Wand', gear: 'Körpergewicht, feste Wand', reg: 'brust schultern oberarme', eq: '', lvl: 1, pat: 'push',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Je weiter die Füsse von der Wand, desto schwerer.', 'Der Körper bleibt eine gerade Linie von den Fersen bis zum Kopf.'],
  watch: ['Stehe etwa eine Armlänge vor einer festen Wand und stütze die Hände auf Schulterhöhe an der Wand ab.', 'Die Füsse stehen hüftbreit, der Körper ist eine gerade Linie vom Kopf bis zu den Fersen.', 'Beuge die Ellbogen schräg nach hinten und bringe die Brust zur Wand.', 'Drücke dich kräftig wieder weg, bis die Arme fast gestreckt sind.', 'Atme beim Hinbewegen ein und beim Wegdrücken aus.'],
  mistakes: ['Das Gesäss ragt nach hinten.', 'Der Bauch hängt durch.', 'Die Ellbogen zeigen weit zur Seite.', 'Die Füsse rutschen weg, die Wand ist glatt.'],
  feel: 'Brust, vordere Schulter und Trizeps, in einer sehr leichten Form. Ein guter Einstieg zu den Liegestützen.',
  harder: 'Die Füsse weiter von der Wand entfernt aufstellen oder die Hände auf eine Bank legen.' });

x({ id: 'x-floordip', name: 'Dips am Boden', gear: 'Körpergewicht, auf der Matte', reg: 'oberarme schultern', eq: '', lvl: 1, pat: 'dip',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Die Hände hinter dir, die Hüfte hoch bis zur Tischposition.', 'Die Ellbogen nach hinten beugen, die Schultern bleiben unten.'],
  watch: ['Setze dich auf den Boden, die Knie sind gebeugt, die Füsse stehen flach.', 'Stütze die Hände hinter dir auf, die Finger zeigen nach vorn.', 'Hebe die Hüfte in die Tischposition, der Rumpf ist fast waagerecht.', 'Beuge die Ellbogen nach hinten und senke die Hüfte Richtung Boden, nur ein kleines Stück.', 'Drücke dich wieder hoch, ohne die Ellbogen hart durchzudrücken.'],
  mistakes: ['Zu tief, die Schultern rutschen nach vorn.', 'Die Schultern wandern zu den Ohren.', 'Die Ellbogen zeigen zur Seite.', 'Die Hände sind weit weg von der Hüfte.'],
  feel: 'Hinterseite der Oberarme (Trizeps), dazu Brust und vordere Schulter. Wenn die Schulter zwickt, nur kleine Bewegungen machen.',
  easier: 'Die Füsse näher an die Hüfte stellen und nur wenig absenken.',
  harder: 'Die Beine strecken.' });

/* ===== zwei weitere Übungen für den Rücken ohne Geräte ===== */

x({ id: 'x-swimmer', name: 'Schwimmer am Boden', gear: 'Körpergewicht, auf der Matte', reg: 'ruecken gesaess', eq: '', lvl: 1, pat: 'extend',
  sets: 3, reps: '8–12', unit: 'Wdh. gesamt', rest: 30,
  cues: ['Gegenüberliegender Arm und gegenüberliegendes Bein heben, im Wechsel.', 'Der Blick bleibt zum Boden, der Nacken lang.'],
  watch: ['Lege dich auf den Bauch, die Arme nach vorn gestreckt, die Beine gestreckt.', 'Der Blick geht zum Boden, der Nacken bleibt lang.', 'Hebe einen Arm und das gegenüberliegende Bein leicht an.', 'Wechsle langsam im Takt, so als würdest du kraulen.', 'Atme gleichmässig weiter, der Bauchnabel bleibt leicht eingezogen.'],
  mistakes: ['Zu hoch, der untere Rücken wird gestaucht.', 'Der Kopf wird in den Nacken gelegt.', 'Zu schnell, mit Schwung.', 'Die Luft wird angehalten.'],
  feel: 'Rückenstrecker, Gesäss und hintere Schulter im Wechsel.',
  easier: 'Langsamer und nur wenige Zentimeter anheben.' });

x({ id: 'x-wallangel', name: 'Wand-Engel', gear: 'Körpergewicht, Wand', reg: 'ruecken schultern', eq: '', lvl: 1, pat: 'mob',
  sets: 2, reps: '8–12', rest: 30,
  cues: ['Rücken, Kopf und Arme an die Wand, die Arme gleiten nach oben.', 'Nur so weit, wie die Arme die Wand berühren.'],
  watch: ['Stelle dich mit dem Rücken an eine Wand, die Füsse etwa eine Fusslänge von der Wand entfernt.', 'Kopf, Schulterblätter und Gesäss berühren die Wand, der untere Rücken bleibt natürlich.', 'Bringe die Arme in die W-Position: Ellbogen im rechten Winkel, Ellbogen und Handrücken an der Wand.', 'Gleite langsam mit den Armen nach oben, bis sie fast gestreckt sind (Y-Position).', 'Gleite wieder zurück in die W-Position. Bewege dich nur so weit, wie die Arme an der Wand bleiben.'],
  mistakes: ['Der untere Rücken wölbt sich von der Wand weg.', 'Die Schultern werden zu den Ohren gezogen.', 'Die Arme lösen sich von der Wand.', 'Zu schnell und mit Gewalt.'],
  feel: 'Oberer Rücken und Schultern. Eine sanfte Mobilisation, auch gut zum Aufwärmen. Ein Ziehen ist in Ordnung, Schmerz nicht.' });

/* ===== Medizinball ===== */

x({ id: 'x-slam', name: 'Medizinball-Slam', gear: 'Medizinball (ein Ball, der nicht springt)', reg: 'ganz schultern bauch', eq: 'mb', lvl: 2, pat: 'cardio',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Ball über den Kopf, dann mit ganzer Kraft auf den Boden schmettern.', 'Aus den Hüften in die Hocke, der Rücken bleibt gerade.'],
  watch: ['Stehe hüftbreit und nimm den Ball mit beiden Händen vor die Brust.', 'Hebe ihn gestreckt über den Kopf und strecke dich dabei lang.', 'Schmettere den Ball mit Schwung auf den Boden vor deine Füsse und gehe dabei in die Hocke.', 'Nimm den Ball auf (Rücken gerade, Knie gebeugt) und stehe wieder auf.', 'Nimm einen Ball ohne Rückprall und einen Boden, der das aushält.'],
  mistakes: ['Der Rücken wird beim Aufheben des Balls rund.', 'Nur mit den Armen werfen, ohne Beine und Rumpf.', 'Zu nah an den Füssen, der Ball prellt auf die Zehen.', 'Ein Ball, der zurückspringt.'],
  feel: 'Ganzer Körper: Schultern, Bauch, Rücken und Beine. Der Puls steigt schnell. Bei Rückenproblemen mit leichtem Ball und kleiner Bewegung.',
  easier: 'Einen leichteren Ball nehmen und den Ball nur absetzen statt zu werfen.' });

x({ id: 'x-wallball', name: 'Wall Ball', gear: 'Medizinball und Wand', reg: 'oberschenkel gesaess schultern', eq: 'mb', lvl: 2, pat: 'squat',
  sets: 3, reps: '8–12', rest: 60, knee: true,
  cues: ['Tief in die Kniebeuge, dann aus den Beinen hoch und den Ball hoch an die Wand.', 'Den Ball fangen und gleich wieder in die Hocke.'],
  watch: ['Stehe etwa eine Armlänge vor einer festen Wand, den Ball vor der Brust.', 'Gehe in die Kniebeuge, die Knie zeigen über die Zehen, der Rücken bleibt gerade.', 'Drücke dich kräftig hoch und wirf den Ball im Schwung hoch an die Wand.', 'Fange den Ball und gehe sofort weich in die nächste Kniebeuge.', 'Wähle ein Ziel an der Wand, etwa Kopfhöhe oder etwas höher.'],
  mistakes: ['Die Knie fallen nach innen.', 'Der Ball wird nur mit den Armen geworfen.', 'Der Rücken wird rund.', 'Zu weit von der Wand, der Ball fällt schon vorher.'],
  feel: 'Oberschenkel und Gesäss, dazu Schultern und Rumpf. Eine fliessende Übung, die den Puls hebt.',
  easier: 'Ohne Wurf: nur Kniebeuge mit dem Ball vor der Brust.' });

x({ id: 'x-mbcrunch', name: 'Crunch mit Medizinball', gear: 'Medizinball, auf der Matte', reg: 'bauch', eq: 'mb', lvl: 2, pat: 'crunch',
  sets: 3, reps: '8–12', rest: 45,
  cues: ['Ball mit gestreckten Armen Richtung Knie schieben.', 'Der untere Rücken bleibt am Boden.'],
  watch: ['Lege dich auf den Rücken, die Füsse stehen am Boden, die Knie sind gebeugt.', 'Halte den Ball mit gestreckten Armen über der Brust.', 'Hebe die Schultern an und schiebe den Ball Richtung Knie.', 'Spanne den Bauch oben kurz an.', 'Rolle langsam wieder ab, ohne den Kopf ganz abzulegen.'],
  mistakes: ['Mit Schwung aus den Armen statt aus dem Bauch.', 'Der Kopf wird nach vorn gezogen.', 'Zu hoch aufsetzen, der Rücken hebt ab.', 'Ein zu schwerer Ball.'],
  feel: 'Die geraden Bauchmuskeln. Der Ball macht es etwas schwerer als der normale Crunch.',
  easier: 'Ohne Ball oder mit einem leichten Ball.' });

/* ==== new exercises below ==== */

/* ===== Maschinen und weitere Übungen aus Fitness- und Reha-Zentren ===== */

x({ id: 'x-adduct', name: 'Beinanzieher an der Maschine', gear: 'Adduktorenmaschine', reg: 'oberschenkel', eq: 'ma', lvl: 1, pat: 'adduct',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Aufrecht sitzen, der Rücken liegt am Polster.', 'Die Beine kontrolliert zusammendrücken, nicht zusammenschlagen lassen.'],
  watch: ['Stelle die Sitzlehne so ein, dass die Polster innen an den Knien oder knapp darüber liegen.', 'Öffne die Beine mit der Startverstellung nur so weit, wie es angenehm ist, es soll nicht in der Leiste ziehen.', 'Rücken und Gesäss bleiben am Polster, die Hände halten sich an den Griffen.', 'Drücke die Knie gegen die Polster zusammen und halte oben 1 Sekunde.', 'Lasse das Gewicht langsam wieder öffnen, ohne dass es aufsetzt.'],
  mistakes: ['Die Beine werden mit Schwung zusammengeschlagen.', 'Zu weit geöffnet, das zieht schmerzhaft in der Leiste.', 'Der Oberkörper wippt vor und zurück.', 'Zu viel Gewicht und eine winzige Bewegung.'],
  feel: 'Innenseite der Oberschenkel (Adduktoren). Zieht es in der Leiste oder im Knie, das Gewicht senken oder den Weg verkürzen.' });

x({ id: 'x-abduct', name: 'Beinspreizer an der Maschine', gear: 'Abduktorenmaschine', reg: 'gesaess oberschenkel', eq: 'ma', lvl: 1, pat: 'abd',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Aufrecht sitzen, das Becken bleibt fest auf dem Sitz.', 'Die Knie gleichmässig nach aussen drücken.'],
  watch: ['Lege die Polster aussen an die Knie, die Füsse stehen auf den Rasten.', 'Rücken und Gesäss bleiben am Polster, die Hände halten sich an den Griffen.', 'Drücke die Knie gegen die Polster nach aussen, so weit es geht, ohne dass das Becken ausweicht.', 'Halte oben kurz und lasse die Beine dann langsam wieder zusammenkommen.', 'Das Gewicht setzt unten nicht auf.'],
  mistakes: ['Das Becken kippt oder hebt sich vom Sitz ab.', 'Die Beine werden mit Schwung gespreizt und fallen zurück.', 'Der Oberkörper lehnt nach vorn und zieht mit.', 'Zu viel Gewicht, die Bewegung wird winzig.'],
  feel: 'Seitlich am Gesäss und an der Hüfte (Gesässmuskeln). Zwickt es in der Hüfte, das Gewicht senken.' });

x({ id: 'x-pecdeck', name: 'Butterfly an der Maschine', gear: 'Brustmaschine (Pec Deck)', reg: 'brust schultern', eq: 'ma', lvl: 1, pat: 'fly',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Der Rücken liegt am Polster, die Ellbogen etwa auf Schulterhöhe.', 'Vor der Brust zusammenführen, nicht zusammenschlagen.'],
  watch: ['Stelle den Sitz so ein, dass die Ellbogen oder Unterarme etwa auf Schulterhöhe liegen.', 'Lege die Unterarme an die Polster oder fasse die Griffe, der Rücken liegt am Polster.', 'Führe die Arme in einem Bogen vor der Brust zusammen, die Schultern bleiben unten.', 'Halte kurz und spanne die Brust an.', 'Öffne langsam, nur so weit, wie es in den Schultern angenehm ist, und setze das Gewicht nicht ab.'],
  mistakes: ['Die Schultern ziehen zu den Ohren.', 'Zu weit nach hinten geöffnet, das belastet die vordere Schulter.', 'Das Gewicht wird mit Schwung zusammengeschlagen.', 'Der Rücken löst sich vom Polster.'],
  feel: 'Brust und vordere Schulter. Zieht es vorn in der Schulter, den Sitz etwas höher stellen oder weniger weit öffnen.' });

x({ id: 'x-revfly', name: 'Reverse Butterfly an der Maschine', gear: 'Butterfly-Maschine (hintere Schulter)', reg: 'schultern ruecken', eq: 'ma', lvl: 1, pat: 'pullapart',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Brust liegt am Polster, die Arme sind fast gestreckt.', 'Die Schulterblätter zusammenziehen, nicht die Schultern hochziehen.'],
  watch: ['Stelle den Sitz so ein, dass die Griffe auf Schulterhöhe sind, die Brust liegt am Polster.', 'Fasse die Griffe, die Arme sind fast gestreckt.', 'Öffne die Arme seitlich nach hinten, bis sie etwa auf einer Linie mit den Schultern sind.', 'Ziehe die Schulterblätter zusammen und halte kurz.', 'Lasse die Arme langsam wieder nach vorn kommen, ohne das Gewicht abzusetzen.'],
  mistakes: ['Die Schultern wandern zu den Ohren.', 'Der Oberkörper schaukelt, die Bewegung kommt aus dem Rücken.', 'Die Arme gehen weit hinter die Schultern.', 'Zu viel Gewicht, die Arme beugen sich stark.'],
  feel: 'Hintere Schulter und der obere Rücken zwischen den Schulterblättern. Wichtig für eine aufrechte Haltung.' });

x({ id: 'x-latmach', name: 'Seitheben an der Maschine', gear: 'Schultermaschine (Seitheber)', reg: 'schultern', eq: 'ma', lvl: 1, pat: 'raise',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Ellbogen schieben die Polster nach aussen und oben.', 'Nur bis auf Schulterhöhe heben.'],
  watch: ['Stelle den Sitz so ein, dass die Drehachse des Geräts auf Höhe der Schultern liegt.', 'Lege die Unterarme oder Ellbogen an die Polster, die Ellbogen sind etwa im rechten Winkel gebeugt.', 'Schiebe die Polster seitlich nach oben, bis die Oberarme etwa waagrecht sind.', 'Halte oben kurz und lasse dann langsam wieder ab, die Polster setzen nicht auf.', 'Die Schultern bleiben unten, der Nacken locker.'],
  mistakes: ['Die Schultern ziehen zu den Ohren.', 'Zu hoch gehoben, über die Schulterhöhe hinaus.', 'Mit Schwung aus dem Oberkörper.', 'Zu viel Gewicht, die Bewegung wird kurz und ruckartig.'],
  feel: 'Seitliche Schulter (Delta). Wird der Nacken hart, das Gewicht senken und die Schultern bewusst entspannen.' });

x({ id: 'x-extrot', name: 'Aussenrotation mit Band', gear: 'Widerstandsband oder Kabelzug', reg: 'schultern', eq: 'band|kz', lvl: 1, pat: 'rot',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Arm', rest: 45,
  cues: ['Der Ellbogen bleibt am Körper, ein gefaltetes Handtuch hilft.', 'Nur den Unterarm langsam nach aussen drehen.'],
  watch: ['Befestige das Band auf Ellbogenhöhe, zum Beispiel an einer Tür. Stelle dich seitlich dazu, sodass das Band quer vor dem Bauch zur Hand läuft.', 'Der Ellbogen ist im rechten Winkel gebeugt und liegt am Körper, am besten mit einem gefalteten Handtuch dazwischen.', 'Drehe den Unterarm langsam nach aussen, bis die Hand etwa 45° vom Bauch weg zeigt, der Ellbogen bleibt am Körper.', 'Halte kurz und drehe langsam zurück.', 'Die Schulter bleibt unten, der Oberkörper dreht nicht mit. Danach der andere Arm.'],
  mistakes: ['Der Ellbogen löst sich vom Körper.', 'Der Oberkörper dreht mit statt des Arms.', 'Zu viel Widerstand, die Schulter zieht nach oben.', 'Zu schnell zurückgezogen.'],
  feel: 'Hinterseite der Schulter (Rotatorenmanschette). Eine ruhige Übung mit wenig Widerstand. Bei Schmerz in der Schulter mit der Physiotherapie abklären.',
  easier: 'Ein weicheres Band oder nur gegen den Widerstand der eigenen Hand drehen.' });

x({ id: 'x-shpress', name: 'Schulterpresse an der Maschine', gear: 'Schulterpresse', reg: 'schultern oberarme', eq: 'ma', lvl: 1, pat: 'ohp',
  sets: 3, reps: '8–10', rest: 75, weight: true,
  cues: ['Der Rücken liegt am Polster, die Griffe sind auf Schulterhöhe.', 'Gerade nach oben drücken, die Schultern bleiben unten.'],
  watch: ['Stelle den Sitz so ein, dass die Griffe in der unteren Stellung etwa auf Schulterhöhe sind.', 'Der Rücken liegt am Polster, die Füsse stehen fest am Boden.', 'Drücke die Griffe gerade nach oben, bis die Arme fast gestreckt sind.', 'Drücke die Ellbogen oben nicht ganz durch, die Schultern bleiben tief.', 'Lasse die Griffe kontrolliert wieder auf Schulterhöhe sinken.'],
  mistakes: ['Hohlkreuz, der Rücken löst sich vom Polster.', 'Die Schultern ziehen zum Nacken.', 'Die Ellbogen werden oben hart durchgedrückt.', 'Das Gewicht wird mit Schwung nach oben gestossen.'],
  feel: 'Schultern (Delta) und Trizeps. Wird es im Nacken eng, das Gewicht senken.' });

x({ id: 'x-curlmach', name: 'Bizepscurl an der Maschine', gear: 'Scott-Maschine (Preacher Curl)', reg: 'oberarme', eq: 'ma', lvl: 1, pat: 'curl',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Oberarme liegen ganz auf dem Polster.', 'Nur die Unterarme bewegen, langsam ablassen.'],
  watch: ['Stelle den Sitz so ein, dass die Achseln am Polster anliegen und die Oberarme flach auf dem Polster liegen.', 'Fasse die Griffe, die Arme sind fast gestreckt.', 'Curle die Griffe zu den Schultern, die Oberarme bleiben auf dem Polster.', 'Spanne oben kurz an und lasse in etwa 3 Sekunden wieder ab.', 'Strecke die Arme unten nicht hart durch.'],
  mistakes: ['Die Ellbogen heben vom Polster ab.', 'Mit Schwung aus dem Rücken.', 'Unten ruckartig fallen gelassen.', 'Die Arme werden unten ganz durchgedrückt, das belastet die Ellbogen.'],
  feel: 'Vorderseite des Oberarms (Bizeps). Zieht es in der Ellbogenbeuge, das Gewicht senken.' });

x({ id: 'x-trimach', name: 'Trizepsstrecken an der Maschine', gear: 'Trizepsmaschine (sitzend)', reg: 'oberarme', eq: 'ma', lvl: 1, pat: 'extension',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Ellbogen bleiben am Körper.', 'Die Arme nach unten ganz strecken, langsam zurückkommen lassen.'],
  watch: ['Stelle den Sitz so ein, dass die Ellbogen am Körper liegen und die Griffe etwa auf Brusthöhe starten.', 'Der Rücken liegt am Polster, die Füsse stehen am Boden.', 'Drücke die Griffe nach unten, bis die Arme gestreckt sind, die Ellbogen bleiben am Körper.', 'Spanne unten kurz an und lasse die Griffe langsam wieder hochkommen, bis die Ellbogen etwa im rechten Winkel sind.', 'Die Schultern bleiben unten.'],
  mistakes: ['Die Ellbogen wandern nach vorn oder zur Seite.', 'Der Oberkörper beugt sich vor und drückt mit.', 'Die Schultern ziehen hoch.', 'Zu viel Gewicht, die Arme werden nicht ganz gestreckt.'],
  feel: 'Rückseite des Oberarms (Trizeps). Zieht es im Ellbogen, das Gewicht senken.' });

x({ id: 'x-crunchmach', name: 'Bauchmaschine (Crunch)', gear: 'Bauchmaschine', reg: 'bauch', eq: 'ma', lvl: 1, pat: 'crunch',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Den Oberkörper aus dem Bauch heraus nach vorn rollen.', 'Die Arme und der Nacken ziehen nicht mit.'],
  watch: ['Stelle den Sitz so ein, dass die Drehachse etwa auf Höhe des Bauchnabels liegt.', 'Die Füsse stehen fest, die Hände liegen locker an den Griffen oder das Brustpolster liegt an der Brust.', 'Rolle den Oberkörper aus dem Bauch heraus nach vorn, als würdest du die Rippen zum Becken ziehen.', 'Spanne unten kurz an und lasse langsam zurückkommen, ohne das Gewicht abzusetzen.', 'Atme beim Zusammenrollen aus.'],
  mistakes: ['Mit den Armen oder dem Nacken gezogen.', 'Nur die Hüfte gebeugt statt den Bauch angespannt.', 'Mit Schwung gearbeitet.', 'Zu viel Gewicht, die Bewegung wird winzig.'],
  feel: 'Gerade Bauchmuskeln. Spürst du es vor allem im Nacken oder in den Hüftbeugern, das Gewicht senken.' });

x({ id: 'x-machinerow', name: 'Rudern an der Maschine (brustgestützt)', gear: 'Rudermaschine', reg: 'ruecken oberarme', eq: 'ma', lvl: 1, pat: 'row',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Brust bleibt am Polster, der Rücken gerade.', 'Die Ellbogen eng nach hinten, die Schulterblätter zusammen.'],
  watch: ['Stelle den Sitz so ein, dass die Griffe auf Brusthöhe sind und die Brust am Polster anliegt.', 'Fasse die Griffe mit fast gestreckten Armen, die Schultern bleiben unten.', 'Ziehe die Ellbogen eng nach hinten, bis die Hände etwa auf Höhe der Rippen sind.', 'Presse die Schulterblätter kurz zusammen.', 'Lasse langsam nach vorn gleiten, die Brust bleibt am Polster.'],
  mistakes: ['Der Oberkörper löst sich vom Polster und schaukelt.', 'Die Schultern ziehen zu den Ohren.', 'Die Arme ziehen allein, die Schulterblätter bewegen sich nicht.', 'Zu viel Gewicht, die Bewegung ist kurz und ruckartig.'],
  feel: 'Mittlerer Rücken und Schulterblätter, dazu der Bizeps. Wichtig für eine aufrechte Haltung.' });

x({ id: 'x-assistpull', name: 'Klimmzug an der Maschine', gear: 'Klimmzugmaschine mit Gegengewicht', reg: 'ruecken oberarme', eq: 'ma', lvl: 1, pat: 'vpull',
  sets: 3, reps: '8–10', rest: 75, weight: true,
  cues: ['Das Gegengewicht trägt einen Teil deines Körpergewichts.', 'Die Ellbogen nach unten ziehen, die Brust zu den Griffen.'],
  watch: ['Stelle das Gegengewicht so ein, dass du saubere Wiederholungen schaffst. Mehr Gegengewicht macht es leichter.', 'Knie dich auf das Polster oder stelle dich auf die Plattform und fasse die Griffe etwas breiter als die Schultern.', 'Ziehe die Ellbogen nach unten, bis das Kinn etwa auf Höhe der Griffe ist.', 'Lasse dich langsam wieder ab, bis die Arme gestreckt sind.', 'Der Körper bleibt ruhig, ohne Schwung.'],
  mistakes: ['Die Schultern ziehen zu den Ohren.', 'Mit Schwung aus dem Körper hochgezogen.', 'Nur halb hoch gezogen oder nicht ganz abgelassen.', 'Zu viel Hilfe, dann ist es kaum Arbeit.'],
  feel: 'Breiter Rückenmuskel und Bizeps. Mit der Zeit das Gegengewicht verringern, bis der Klimmzug an der Stange klappt.',
  harder: 'Das Gegengewicht schrittweise verringern.' });

x({ id: 'x-facepull', name: 'Face Pull am Kabelzug', gear: 'Kabelzug mit Seil', reg: 'schultern ruecken', eq: 'kz', lvl: 1, pat: 'pullapart',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Das Seil zum Gesicht ziehen, die Ellbogen hoch und weit.', 'Die Schulterblätter zusammen, der Oberkörper bleibt aufrecht.'],
  watch: ['Stelle den Seilzug etwa auf Kopfhöhe ein und befestige das Seil.', 'Fasse die Enden des Seils, gehe so weit zurück, dass die Arme fast gestreckt sind, die Knie sind leicht gebeugt.', 'Ziehe das Seil zum Gesicht, die Ellbogen sind hoch und zeigen nach aussen.', 'Ziehe die Hände neben die Ohren und die Schulterblätter zusammen, halte kurz.', 'Lasse langsam zurück, das Gewicht setzt nicht auf.'],
  mistakes: ['Zu viel Gewicht, der Oberkörper lehnt zurück.', 'Die Ellbogen sinken unter die Hände.', 'Die Schultern ziehen zu den Ohren.', 'Das Seil wird zum Hals gezogen statt zum Gesicht.'],
  feel: 'Hintere Schulter und oberer Rücken. Eine leichte Übung, gut für die Haltung und gesunde Schultern.' });

x({ id: 'x-straightarm', name: 'Gestreckter Armzug am Kabel', gear: 'Kabelzug mit Stange oder Seil', reg: 'ruecken', eq: 'kz', lvl: 2, pat: 'vpull',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Arme bleiben fast gestreckt, die Bewegung kommt aus der Schulter.', 'Die Stange in einem Bogen zu den Oberschenkeln ziehen.'],
  watch: ['Stelle den Seilzug hoch ein und befestige die Stange oder das Seil.', 'Stehe etwa einen Schritt zurück, beuge den Oberkörper leicht vor und die Knie leicht, der Rücken bleibt gerade.', 'Fasse mit fast gestreckten Armen und ziehe die Stange in einem Bogen nach unten bis zu den Oberschenkeln.', 'Spanne kurz an, die Schulterblätter bleiben unten.', 'Lasse die Arme langsam wieder nach oben führen, ohne die Rumpfhaltung zu verändern.'],
  mistakes: ['Die Ellbogen beugen sich, es wird ein Trizeps-Pushdown.', 'Mit Schwung aus dem Rücken.', 'Der Oberkörper richtet sich beim Ziehen auf und wieder ab.', 'Zu viel Gewicht, die Arme werden steif.'],
  feel: 'Breiter Rückenmuskel, dazu der Bauch, der den Oberkörper hält. Spürst du nur die Arme, das Gewicht senken.' });

x({ id: 'x-hyper', name: 'Rückenstrecker auf der Bank', gear: 'Hyperextension-Bank', reg: 'ruecken gesaess', eq: 'ma', lvl: 1, pat: 'extend',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Die Hüfte liegt auf dem Polster, die Fersen sind fest.', 'Nur bis in eine gerade Linie hochkommen, nicht darüber hinaus.'],
  watch: ['Stelle das Polster so ein, dass es unter dem Beckenkamm liegt und du dich in der Hüfte beugen kannst.', 'Die Fersen stehen fest unter den Rollen, die Arme sind vor der Brust gekreuzt.', 'Lasse den Oberkörper mit geradem Rücken nach unten sinken, die Hüfte beugt sich.', 'Richte dich auf, bis Oberkörper und Beine eine gerade Linie bilden, spanne das Gesäss kurz an.', 'Überstrecke nicht ins Hohlkreuz, der Blick geht zum Boden.'],
  mistakes: ['Zu weit nach oben überstreckt, Hohlkreuz.', 'Mit Schwung aus dem Rücken hochgeschleudert.', 'Der Rücken wird unten rund.', 'Das Polster ist zu hoch und drückt auf den Bauch.'],
  feel: 'Gesäss, Rückseite der Oberschenkel und unterer Rücken (Rückenstrecker). Bei Rückenschmerzen vorher abklären.',
  harder: 'Eine leichte Scheibe oder Hantel vor der Brust halten.' });

x({ id: 'x-hack', name: 'Hackenschmidt-Kniebeuge', gear: 'Hackenschmidt-Maschine', reg: 'oberschenkel gesaess', eq: 'ma', lvl: 2, pat: 'squat',
  sets: 3, reps: '8–10', rest: 90, weight: true, knee: true,
  cues: ['Rücken und Gesäss bleiben am Polster.', 'Die Knie zeigen in Richtung der Zehen, oben nicht durchstrecken.'],
  watch: ['Stelle dich mit den Schultern unter die Polster, der Rücken liegt flach am Rückenpolster, die Füsse stehen etwa schulterbreit auf der Plattform.', 'Löse die Sicherung und lasse den Schlitten kontrolliert nach unten.', 'Gehe etwa bis die Knie im rechten Winkel gebeugt sind, nur so tief, wie es dir gut tut.', 'Drücke dich mit dem ganzen Fuss wieder nach oben, die Knie oben nicht ganz durchdrücken.', 'Das Becken bleibt am Polster.'],
  mistakes: ['Die Knie fallen nach innen.', 'Das Becken rollt unten ein und löst sich vom Polster.', 'Die Fersen heben ab, die Füsse stehen zu weit hinten.', 'Zu viel Gewicht und eine kurze Bewegung.'],
  feel: 'Vordere Oberschenkel und Gesäss. Stehen die Füsse weiter vorn, arbeitet mehr das Gesäss.' });

x({ id: 'x-smith', name: 'Kniebeuge an der Multipresse', gear: 'Multipresse (Smith-Maschine)', reg: 'oberschenkel gesaess', eq: 'ma', lvl: 2, pat: 'squat',
  sets: 3, reps: '8–10', rest: 90, weight: true, knee: true,
  cues: ['Die Füsse stehen etwas vor der Stange, der Rücken bleibt gerade.', 'Die Stange gleitet senkrecht, die Fersen bleiben am Boden.'],
  watch: ['Stelle die Sicherungshaken so ein, dass du unten nicht eingeklemmt wirst.', 'Gehe mit der Stange im Nacken (auf dem oberen Rücken) unter die Stange, die Füsse stehen etwa schulterbreit und einen halben bis ganzen Fuss vor der Stange.', 'Drehe die Stange aus der Halterung, beuge Hüfte und Knie und gehe kontrolliert nach unten.', 'Gehe etwa bis die Oberschenkel waagrecht sind, die Fersen bleiben am Boden.', 'Stehe kräftig auf, die Knie oben nicht ganz durchdrücken. Hänge die Stange am Ende sicher wieder ein.'],
  mistakes: ['Die Füsse stehen zu weit hinten, der Oberkörper klappt nach vorn.', 'Die Fersen heben ab.', 'Die Knie fallen nach innen.', 'Die Stange wird nicht sicher eingehängt, die Sicherungshaken sind vergessen.'],
  feel: 'Vordere Oberschenkel und Gesäss. Mit den Füssen weiter vorn arbeitet mehr das Gesäss, näher an der Stange mehr der Oberschenkel.' });

x({ id: 'x-calfpress', name: 'Wadenheben an der Beinpresse', gear: 'Beinpresse', reg: 'unterschenkel', eq: 'ma', lvl: 1, pat: 'calf',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Beine bleiben fast gestreckt, die Knie nicht durchdrücken.', 'Nur die Fussgelenke bewegen, oben kurz halten.'],
  watch: ['Setze dich in die Beinpresse und stelle nur die Fussballen auf die untere Kante der Platte, die Fersen hängen frei.', 'Drücke die Platte in die Ausgangsstellung und löse die Sicherung. Die Knie bleiben leicht gebeugt, nicht durchgedrückt.', 'Drücke mit den Zehenballen die Platte weg, auf die Zehenspitzen, und halte oben 1 Sekunde.', 'Lasse die Fersen langsam zurücksinken, bis die Waden gedehnt sind.', 'Sichere die Platte zum Schluss wieder.'],
  mistakes: ['Die Knie beugen und strecken sich mit.', 'Die Knie werden ganz durchgedrückt.', 'Zu schnell, mit Federn unten.', 'Die Bewegung ist winzig.'],
  feel: 'Waden (Unterschenkel). Bei einem Wadenkrampf das Gewicht senken und die Wade lockern.' });

x({ id: 'x-calfmach', name: 'Wadenheben an der Maschine', gear: 'Wadenmaschine (stehend)', reg: 'unterschenkel', eq: 'ma', lvl: 1, pat: 'calf',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Die Schulterpolster tragen das Gewicht, der Körper bleibt gerade.', 'Ganz hoch auf die Zehen, unten die Waden dehnen.'],
  watch: ['Stelle die Polster so ein, dass sie bequem auf den Schultern liegen und die Knie fast gestreckt sind.', 'Die Fussballen stehen auf der Kante, die Fersen hängen frei.', 'Drücke dich ganz hoch auf die Zehenspitzen und halte oben 1 Sekunde.', 'Lasse die Fersen langsam bis zur Dehnung sinken.', 'Die Knie bleiben leicht gebeugt, der Oberkörper aufrecht.'],
  mistakes: ['Die Knie beugen sich mit, die Wade arbeitet kaum.', 'Die Bewegung ist winzig, die Fersen sinken nicht.', 'Mit Schwung federnd.', 'Der Oberkörper kippt nach vorn.'],
  feel: 'Waden. Spürst du es in den Knien oder im Rücken, das Gewicht senken.' });

x({ id: 'x-glutekick', name: 'Gesäss-Rückstoss an der Maschine', gear: 'Kickback-Maschine', reg: 'gesaess', eq: 'ma', lvl: 1, pat: 'kick',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 60, weight: true,
  cues: ['Die Brust liegt am Polster, die Hände halten sich fest.', 'Das Bein nach hinten drücken, bis die Hüfte gestreckt ist.'],
  watch: ['Stelle dich mit der Brust ans Polster, halte dich an den Griffen fest und stelle den Fuss des Arbeitsbeins auf die Fussplatte.', 'Das Standbein steht fest, der Rücken bleibt gerade und ist leicht nach vorn geneigt.', 'Drücke die Platte mit dem Fuss nach hinten, bis die Hüfte gestreckt ist.', 'Spanne oben das Gesäss kurz fest an.', 'Lasse die Platte langsam zurückkommen, ohne dass das Gewicht aufsetzt. Danach das andere Bein.'],
  mistakes: ['Hohlkreuz beim Drücken.', 'Das Becken dreht sich auf.', 'Mit Schwung nach hinten geschleudert.', 'Zu viel Gewicht und eine kleine Bewegung.'],
  feel: 'Gesäss des Arbeitsbeins. Spürst du es im unteren Rücken, die Bewegung verkürzen und das Gewicht senken.' });

x({ id: 'x-lumbar', name: 'Rückenstrecker an der Maschine', gear: 'Rückenmaschine (sitzend)', reg: 'ruecken', eq: 'ma', lvl: 1, pat: 'extend',
  sets: 3, reps: '8–12', rest: 60, weight: true,
  cues: ['Das Becken ist fixiert, nur der Rücken arbeitet.', 'Nur bis zur aufrechten Haltung, nicht ins Hohlkreuz.'],
  watch: ['Setze dich so, dass Becken und Oberschenkel fest fixiert sind und die Drehachse auf Höhe der Hüfte liegt.', 'Lehne den Oberkörper locker an das Rückenpolster, die Arme sind vor der Brust gekreuzt.', 'Drücke den Rücken gegen das Polster, bis der Oberkörper aufrecht ist.', 'Halte oben kurz, ohne zu überstrecken.', 'Lasse langsam nach vorn zurück, die Spannung bleibt.'],
  mistakes: ['Zu weit nach hinten gedrückt, Hohlkreuz.', 'Mit Schwung aus den Beinen oder den Armen.', 'Das Becken ist nicht richtig fixiert.', 'Zu viel Gewicht, der Rücken wird in die Bewegung gerissen.'],
  feel: 'Unterer und mittlerer Rücken (Rückenstrecker). Eine übliche Übung in der Reha, Gewicht und Weg mit Physio oder MTT abstimmen.' });

x({ id: 'x-inclinedb', name: 'Schrägbankdrücken mit Kurzhanteln', gear: 'Kurzhanteln und Schrägbank', reg: 'brust schultern oberarme', eq: 'kh bank', lvl: 2, pat: 'bench',
  sets: 3, reps: '8–10', rest: 75, weight: true,
  cues: ['Die Bank steht auf etwa 30°, die Schulterblätter liegen fest an.', 'Die Hanteln senkrecht über der oberen Brust hochdrücken.'],
  watch: ['Stelle die Rückenlehne auf etwa 30°, nicht steiler, sonst arbeitet vor allem die Schulter.', 'Setze dich mit den Hanteln auf den Oberschenkeln hin und lege dich zurück, die Füsse stehen fest am Boden.', 'Die Schulterblätter sind zusammen und unten, die Hanteln beginnen auf Höhe der oberen Brust.', 'Drücke die Hanteln hoch, bis die Arme fast gestreckt sind.', 'Senke sie kontrolliert zur oberen Brust, die Ellbogen zeigen schräg nach unten, etwa 45° vom Körper. Lege die Hanteln am Ende zuerst auf die Oberschenkel.'],
  mistakes: ['Das Gesäss hebt ab, Hohlkreuz.', 'Die Ellbogen stehen weit zur Seite (T-Position).', 'Die Hanteln gehen zu weit auseinander oder zu tief.', 'Die Bank ist zu steil, die Schultern übernehmen.'],
  feel: 'Obere Brust, vordere Schulter und Trizeps.',
  easier: 'Mit leichteren Hanteln oder an der Brustpresse beginnen.' });

x({ id: 'x-captain', name: 'Beinheben im Stütz', gear: 'Beinhebe-Station (Captain\'s Chair)', reg: 'bauch', eq: 'ma', lvl: 2, pat: 'legraise',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Der Rücken liegt am Polster, die Unterarme fest auf den Auflagen.', 'Die Knie langsam zum Bauch ziehen, nicht schwingen.'],
  watch: ['Stütze die Unterarme auf die Auflagen, der Rücken liegt am Polster, die Schultern sind unten.', 'Lasse die Beine ruhig hängen, die Füsse berühren den Boden nicht.', 'Ziehe die Knie langsam zum Bauch und rolle dabei das Becken leicht auf.', 'Halte oben kurz und lasse langsam ab, ohne zu schwingen.', 'Schwerer: die Beine gestreckt heben.'],
  mistakes: ['Mit Schwung gehoben, der Körper schaukelt.', 'Das Becken rollt nicht auf, nur die Hüfte beugt sich.', 'Der Rücken löst sich vom Polster.', 'Die Schultern sinken zwischen die Ohren.'],
  feel: 'Unterer Bauch und Hüftbeuger. Zieht es im unteren Rücken, die Knie nur halb heben.',
  easier: 'Weniger hoch heben oder die Füsse zwischendurch auf dem Boden abstellen.',
  harder: 'Die Beine gestreckt heben.' });

x({ id: 'x-woodchop', name: 'Holzhacker am Kabelzug', gear: 'Kabelzug mit Seil oder Griff', reg: 'bauch schultern', eq: 'kz', lvl: 2, pat: 'rot',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Seite', rest: 60, weight: true,
  cues: ['Die Arme bleiben fast gestreckt, der Rumpf dreht mit.', 'Aus den Beinen und dem Bauch, nicht aus den Armen.'],
  watch: ['Stelle den Seilzug hoch ein und stehe seitlich dazu, die Füsse etwa schulterbreit.', 'Fasse den Griff mit beiden Händen, die Arme sind fast gestreckt, die Hände sind oben nahe am Seilzug.', 'Ziehe den Griff schräg nach unten zur anderen Seite, der Rumpf dreht mit, Hüfte und Füsse folgen leicht.', 'Spanne unten kurz den Bauch an und führe langsam zurück.', 'Danach die Seite wechseln.'],
  mistakes: ['Nur die Arme ziehen, der Rumpf bleibt steif.', 'Der Rücken wird rund oder der Oberkörper kippt zur Seite.', 'Mit Schwung gearbeitet.', 'Zu viel Gewicht, die Drehung wird ruckartig.'],
  feel: 'Schräge Bauchmuskeln und Rumpf, dazu Schultern und Gesäss. Bei Rückenschmerzen ruhig und mit wenig Gewicht beginnen.' });

x({ id: 'x-legcurlseat', name: 'Beinbeuger sitzend', gear: 'Maschine', reg: 'oberschenkel', eq: 'ma', lvl: 1, pat: 'legcurl',
  sets: 3, reps: '8–12', rest: 60, weight: true, knee: true,
  cues: ['Die Oberschenkel liegen fest unter dem Polster.', 'Die Fersen langsam unter den Sitz ziehen.'],
  watch: ['Stelle die Lehne und das Oberschenkelpolster so ein, dass die Knie auf Höhe der Drehachse sind und das Polster fest über den Oberschenkeln liegt.', 'Die Fersen liegen auf der Rolle, der Rücken am Polster.', 'Ziehe die Fersen nach unten und hinten unter den Sitz und halte oben 1 Sekunde.', 'Lasse langsam in die Streckung zurück, das Gewicht setzt nicht auf.', 'Das Gesäss bleibt am Sitz.'],
  mistakes: ['Das Gesäss hebt ab, der Oberkörper beugt sich vor.', 'Mit Schwung gezogen und fallen gelassen.', 'Die Knie liegen nicht auf Höhe der Drehachse.', 'Zu viel Gewicht und eine kurze Bewegung.'],
  feel: 'Rückseite der Oberschenkel (Beinbeuger). Bei einem Krampf das Gewicht senken.' });

x({ id: 'x-cablehip', name: 'Hüftabduktion am Kabelzug', gear: 'Kabelzug mit Knöchelmanschette', reg: 'gesaess oberschenkel', eq: 'kz', lvl: 1, pat: 'abd',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 60, weight: true,
  cues: ['Das Standbein bleibt gerade, der Oberkörper aufrecht.', 'Das Bein gestreckt zur Seite führen.'],
  watch: ['Befestige die Manschette am Knöchel des Arbeitsbeins und stelle den Seilzug ganz unten ein.', 'Stehe seitlich zum Gerät, das Arbeitsbein ist das äussere, halte dich an der Stütze fest.', 'Führe das gestreckte Bein langsam seitlich nach aussen, die Zehen zeigen nach vorn.', 'Halte oben kurz und führe das Bein langsam zurück, das Gewicht setzt nicht auf.', 'Der Oberkörper bleibt aufrecht, das Becken kippt nicht zur Seite. Danach das andere Bein.'],
  mistakes: ['Der Oberkörper kippt zur Seite.', 'Das Bein wird mit Schwung geschleudert.', 'Das Bein dreht sich nach aussen, die Zehen zeigen zur Decke.', 'Zu viel Gewicht, das Becken weicht aus.'],
  feel: 'Seitlich am Gesäss und an der Hüfte des Arbeitsbeins. Das Standbein arbeitet beim Stabilisieren mit.' });

x({ id: 'x-tke', name: 'Kniestrecken mit Band', gear: 'Widerstandsband', reg: 'oberschenkel', eq: 'band', lvl: 1, pat: 'ext',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 45, knee: true,
  cues: ['Das Band zieht von vorn an die Kniekehle, das Knie drückt dagegen.', 'Oben das Knie ganz strecken und den Oberschenkel anspannen.'],
  watch: ['Befestige das Band auf Kniehöhe an einem stabilen Pfosten oder Rack und lege es hinter das Knie des Standbeins.', 'Stehe aufrecht, der Fuss etwa einen Schritt vor dem Befestigungspunkt, das Knie leicht gebeugt, das Band zieht das Knie nach vorn.', 'Strecke das Knie gegen den Zug des Bandes ganz durch, bis es gerade ist, ohne es zu überstrecken.', 'Spanne oben 1 bis 2 Sekunden den Oberschenkel an.', 'Beuge das Knie langsam wieder. Danach das andere Bein.'],
  mistakes: ['Der Oberkörper kippt nach vorn.', 'Das Knie wird nicht ganz gestreckt.', 'Das Knie wird überstreckt oder hart durchgedrückt.', 'Ein zu starkes Band, das Knie knickt ein.'],
  feel: 'Vorderer Oberschenkel direkt über dem Knie (innerer Quadrizeps). Eine klassische Reha-Übung für das Knie.' });

x({ id: 'x-balance', name: 'Einbeinstand', gear: 'Körpergewicht, Wand oder Stuhl zum Festhalten', reg: 'unterschenkel gesaess', eq: '', lvl: 1, pat: 'balance', timer: true, holds: [20, 30, 45], sides: 2,
  sets: 3, rest: 30,
  cues: ['Den Blick auf einen festen Punkt richten.', 'Das Standknie leicht gebeugt, das Becken bleibt waagrecht.'],
  watch: ['Stehe aufrecht, die Füsse hüftbreit, in Reichweite einer Wand oder eines Stuhls zum Festhalten.', 'Verlagere das Gewicht auf ein Bein und hebe das andere Knie etwa auf Hüfthöhe.', 'Das Standknie ist leicht gebeugt, das Becken bleibt waagrecht, die Arme helfen beim Ausbalancieren.', 'Halte die Zeit ruhig atmend, dann wechsle das Bein.', 'Schwerer: die Augen schliessen oder auf ein zusammengelegtes Handtuch stellen.'],
  mistakes: ['Das Becken sackt zur Seite ab.', 'Das Standknie fällt nach innen.', 'Der Oberkörper kippt zur Seite.', 'Der Blick wandert herum, die Luft wird angehalten.'],
  feel: 'Fuss, Unterschenkel und Gesäss, die dich stabilisieren. Eine einfache Übung für das Gleichgewicht, auch in der Reha.',
  harder: 'Die Augen schliessen oder auf ein zusammengelegtes Handtuch oder Kissen stellen.' });


})();

if (typeof module !== 'undefined' && module.exports) module.exports = { LIB: LIB, EX: EX };
