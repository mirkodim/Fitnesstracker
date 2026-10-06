/* The exercise library. One entry per exercise, with everything the app shows: where it is filed (regions), what it needs (eq),
   how hard it is (lvl 1 beginner, 2 practised, 3 advanced), the default sets and repetitions, and the texts under "So geht die Übung".
   An exercise can be filed under several regions. eq lists what is needed (all of it); "kh|kb" means one of the two is enough.
   The animation of an exercise has the same id (anims.js). Never reuse or remove an id: saved trainings and the calendar refer to it.
   Fields: id, name, gear (shown under the name), reg (regions), eq, lvl, pat (movement pattern, so a generated training does not repeat itself),
   sets, reps, unit, rest (seconds), weight (shows a weight field), knee (shows the knee note), timer + hold + holds (+ sides: 2 for "each side") for holds,
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
  sets: 3, reps: 'max.', unit: 'saubere Wdh.', rest: 60,
  cues: ['Körper bleibt eine gerade Linie von Kopf bis Ferse.', 'Aufhören, bevor die Haltung kippt.'],
  watch: ['Hände etwas breiter als die Schultern, Finger zeigen nach vorn.', 'Ellbogen schräg nach hinten, etwa 45° vom Körper, kein T.', 'Bauch und Po anspannen, der Körper bleibt eine Linie.', 'Brust zum Boden, kontrolliert runter, kräftig hoch.', 'Zu schwer: Hände erhöht auf eine Bank oder das Rack stellen.'],
  mistakes: ['Becken hängt durch oder der Po ragt nach oben.', 'Ellbogen stehen seitlich ab.', 'Kopf hängt nach unten, Schultern wandern zu den Ohren.', 'Nur eine halbe Bewegung.'],
  feel: 'Brust, vordere Schulter und Trizeps. Der Rumpf hält die Spannung, ohne dass der Rücken durchhängt.' });

x({ id: 'a-tri', name: 'TRX-Trizepsstrecken', gear: 'TRX', reg: 'oberarme', eq: 'trx', lvl: 2, pat: 'tri',
  sets: 3, reps: '10–15', rest: 60,
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
  sets: 3, reps: '10–15', rest: 60,
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
  sets: 3, reps: '10–15', rest: 60, weight: true,
  cues: ['Oberarme bleiben ruhig am Körper.', 'Kein Schwung aus dem Rücken.'],
  watch: ['Oberarme bleiben am Rumpf, die Ellbogen wandern nicht nach vorn.', 'Hantel hochrollen, unten die Arme fast ganz strecken.', 'Langsam senken, etwa 2 bis 3 Sekunden.', 'Schultern locker, Bauch leicht angespannt, Knie weich.'],
  mistakes: ['Schwung aus dem Rücken, der Oberkörper lehnt zurück.', 'Ellbogen wandern nach vorn.', 'Schultern hochgezogen.', 'Zu schwere Hanteln, die Bewegung wird abgekürzt.'],
  feel: 'Vorderseite des Oberarms (Bizeps), dazu der Unterarm. Dort sollte es müde werden, nicht im Nacken oder im Rücken.' });

x({ id: 'b-crunch', name: 'TRX-Crunches', gear: 'TRX', reg: 'bauch', eq: 'trx', lvl: 2, pat: 'core',
  sets: 3, reps: '10–15', rest: 45,
  cues: ['Bauch fest anspannen, Bewegung langsam.', 'Nicht ins Hohlkreuz fallen.'],
  watch: ['Hände unter den Schultern, Arme gestreckt, Füsse in den Schlaufen.', 'Der Körper startet in einer geraden Linie.', 'Bauch fest anspannen, Knie langsam zur Brust ziehen und den Rücken rund machen.', 'Kontrolliert zurück, ohne durchzuhängen.'],
  mistakes: ['Hüfte hängt beim Zurückgehen durch (Hohlkreuz).', 'Mit Schwung pendeln.', 'Schultern sacken ein.', 'Luft anhalten.'],
  feel: 'Gerade und untere Bauchmuskeln. Die Hüftbeuger arbeiten mit, Schultern und Trizeps halten dich oben. Spürst du es nur an den Oberschenkeln, den Rücken bewusster rund machen.' });

/* ===== Beine: Oberschenkel und Unterschenkel ===== */

x({ id: 'x-squat', name: 'Kniebeuge', gear: 'Körpergewicht', reg: 'oberschenkel gesaess', eq: '', lvl: 1, pat: 'squat',
  sets: 3, reps: '10–15', rest: 60, knee: true,
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
  sets: 4, reps: '5–8', rest: 120, weight: true, knee: true,
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
  sets: 3, reps: '12–20', rest: 45, weight: true,
  cues: ['Langsam hoch auf die Zehen, oben kurz halten.', 'Ganz tief ablassen, damit sich die Waden dehnen.'],
  watch: ['Füsse hüftbreit, die Zehen zeigen nach vorn. Eine Hand an der Wand hilft beim Gleichgewicht.', 'Die Fersen langsam so hoch wie möglich anheben, oben 1 Sekunde halten.', 'Die Knie bleiben gestreckt, aber nicht durchgedrückt.', 'Langsam absenken, am besten 2 bis 3 Sekunden.', 'Das Gewicht bleibt über dem Grosszehenballen, die Füsse kippen nicht nach aussen.'],
  mistakes: ['Mit Schwung wippen.', 'Die Knie beugen sich bei jeder Wiederholung.', 'Die Füsse knicken nach aussen.', 'Nur ein kleines Stück hochgehen.'],
  feel: 'Die Waden (Rückseite des Unterschenkels). Dort brennt es am Ende des Satzes.',
  easier: 'Mit beiden Händen an der Wand festhalten.',
  harder: 'Kurzhanteln halten oder auf einem Bein ausführen.' });

x({ id: 'x-calfseat', name: 'Wadenheben sitzend', gear: 'Kurzhanteln auf den Knien', reg: 'unterschenkel', eq: 'kh box|bank', lvl: 1, pat: 'calf',
  sets: 3, reps: '12–20', rest: 45, weight: true,
  cues: ['Gewicht auf die Knie legen, Fersen anheben.', 'Oben kurz halten, langsam ablassen.'],
  watch: ['Auf Bank oder Stuhl sitzen, die Füsse flach auf dem Boden, die Knie im rechten Winkel.', 'Eine Kurzhantel auf jedes Knie legen (oder eine quer über beide) und mit den Händen festhalten.', 'Die Fersen langsam so hoch wie möglich heben, oben 1 Sekunde halten.', 'Langsam senken, die Fersen berühren fast den Boden.', 'Die Knie bleiben dabei an ihrem Platz.'],
  mistakes: ['Mit Schwung hochwippen.', 'Die Fersen nur wenig anheben.', 'Die Knie wandern nach vorn oder zur Seite.', 'Zu schnell ablassen.'],
  feel: 'Die tiefe Wadenmuskulatur (Soleus) unter der grossen Wade. Es ist ein anderer Teil der Wade als beim Stehen.' });

x({ id: 'x-calf1', name: 'Einbeiniges Wadenheben', gear: 'Körpergewicht, Hand an der Wand', reg: 'unterschenkel', eq: '', lvl: 2, pat: 'calf',
  sets: 3, reps: '10–15', unit: 'Wdh. pro Bein', rest: 45,
  cues: ['Auf einem Bein, eine Hand an der Wand zum Gleichgewicht.', 'Langsam hoch, oben halten, langsam runter.'],
  watch: ['Mit einer Hand an der Wand abstützen, das andere Bein hinten anheben.', 'Die Ferse des Standbeins so hoch wie möglich heben und oben 1 Sekunde halten.', 'In etwa 2 bis 3 Sekunden wieder absenken.', 'Das Knie bleibt gestreckt und zeigt nach vorn.', 'Erst alle Wiederholungen mit einem Bein, dann Seitenwechsel.'],
  mistakes: ['Mit der Hand an der Wand hochziehen.', 'Das Knie knickt ein oder dreht nach innen.', 'Wippen statt kontrolliert heben.', 'Der Fuss kippt nach aussen.'],
  feel: 'Wade des Standbeins. Auch die Fussmuskeln und das Gleichgewicht werden gefordert.',
  easier: 'Beidbeiniges Wadenheben.' });

x({ id: 'x-toeraise', name: 'Zehenheber', gear: 'Körpergewicht, Rücken an der Wand', reg: 'unterschenkel', eq: '', lvl: 1, pat: 'shin',
  sets: 3, reps: '15–25', rest: 30,
  cues: ['Fersen am Boden, die Zehen zur Decke ziehen.', 'Oben kurz halten, langsam senken.'],
  watch: ['Mit dem Rücken an die Wand lehnen, die Füsse eine Schrittlänge vor der Wand, hüftbreit.', 'Die Fersen bleiben am Boden, die Zehen und der Vorfuss ziehen zur Decke.', 'Oben 1 Sekunde halten, die Schienbeinmuskeln spannen sich an.', 'Langsam wieder absenken, ohne die Zehen fallen zu lassen.'],
  mistakes: ['Die Fersen heben vom Boden ab.', 'Zu schnell, mit Schwung.', 'Die Knie beugen sich dabei.'],
  feel: 'Vorderseite des Unterschenkels (Schienbeinmuskel). Er stabilisiert den Fuss beim Gehen und Laufen.' });

x({ id: 'x-sumo', name: 'Sumo-Kniebeuge', gear: 'Kettlebell oder Kurzhantel', reg: 'oberschenkel gesaess', eq: 'kh|kb', lvl: 1, pat: 'squat',
  sets: 3, reps: '10–15', rest: 75, weight: true, knee: true,
  cues: ['Breiter Stand, Zehen nach aussen, das Gewicht hängt zwischen den Beinen.', 'Die Knie folgen den Zehen nach aussen, die Brust bleibt offen.'],
  watch: ['Füsse deutlich mehr als schulterbreit, die Zehen zeigen etwa 30 bis 45 Grad nach aussen.', 'Das Gewicht mit beiden Händen vor dem Körper halten, die Arme bleiben gestreckt.', 'Die Knie schieben beim Absenken nach aussen in Richtung der Zehen.', 'Der Oberkörper bleibt aufrecht, der Rücken gerade.', 'Mit der ganzen Fusssohle hochdrücken, oben das Gesäss anspannen.'],
  mistakes: ['Die Knie fallen nach innen.', 'Der Oberkörper kippt nach vorn.', 'Die Fersen heben ab.', 'Das Becken rollt unten ein, der Rücken wird rund.'],
  feel: 'Innenseite der Oberschenkel, Gesäss und vordere Oberschenkel.',
  easier: 'Weniger tief gehen oder ohne Gewicht.',
  harder: 'Schwereres Gewicht oder unten 2 Sekunden halten.' });

x({ id: 'x-bulgarian', name: 'Bulgarische Kniebeuge', gear: 'Hinterer Fuss auf Bank oder Stuhl', reg: 'oberschenkel gesaess', eq: 'bank|box', lvl: 2, pat: 'lunge',
  sets: 3, reps: '8–12', unit: 'Wdh. pro Bein', rest: 75, weight: true, knee: true,
  cues: ['Hinterer Fuss auf der Bank, der vordere weit genug vorn.', 'Gerade nach unten sinken, das vordere Knie bleibt über dem Fuss.'],
  watch: ['Stelle dich eine grosse Schrittlänge vor eine Bank und lege den hinteren Fuss mit dem Spann auf die Bank.', 'Der vordere Fuss steht so weit vorn, dass das Knie unten über dem Fuss bleibt.', 'Der Oberkörper bleibt aufrecht, eine leichte Vorneigung ist in Ordnung.', 'Senke dich gerade nach unten, bis der vordere Oberschenkel fast waagerecht ist.', 'Mit dem vorderen Fuss hochdrücken, nicht mit dem hinteren abstossen.'],
  mistakes: ['Der vordere Fuss steht zu nah, das Knie schiebt weit über die Zehen.', 'Das vordere Knie fällt nach innen.', 'Der hintere Fuss drückt mit.', 'Das Gleichgewicht fehlt: Halte dich am Anfang an einer Wand fest.'],
  feel: 'Vorderer Oberschenkel und Gesäss des vorderen Beins, dazu die Hüftbeuger des hinteren Beins.',
  easier: 'Normaler Ausfallschritt oder mit einer Hand an der Wand.',
  harder: 'Kurzhanteln in die Hände nehmen oder langsamer absenken.' });

x({ id: 'x-legpress', name: 'Beinpresse', gear: 'Maschine', reg: 'oberschenkel gesaess', eq: 'ma', lvl: 1, pat: 'squat',
  sets: 3, reps: '10–15', rest: 90, weight: true, knee: true,
  cues: ['Rücken und Gesäss bleiben fest am Polster.', 'Die Knie zeigen in Richtung der Zehen, oben nicht durchstrecken.'],
  watch: ['Den Sitz so einstellen, dass die Knie unten etwa im rechten Winkel gebeugt sind.', 'Die Füsse stehen etwa hüftbreit auf der Platte, die ganze Sohle liegt flach.', 'Rücken und Gesäss bleiben die ganze Zeit am Polster, das Becken rollt nicht ein.', 'Die Platte kontrolliert nach unten lassen, dann mit dem ganzen Fuss wegdrücken.', 'Oben die Knie nicht ganz durchdrücken.'],
  mistakes: ['Das Gesäss hebt unten ab, der untere Rücken rundet sich.', 'Die Knie fallen nach innen.', 'Die Knie werden oben ganz durchgedrückt.', 'Zu viel Gewicht und eine zu kurze Bewegung.'],
  feel: 'Vordere Oberschenkel und Gesäss.' });

x({ id: 'x-legext', name: 'Beinstrecker', gear: 'Maschine', reg: 'oberschenkel', eq: 'ma', lvl: 1, pat: 'ext',
  sets: 3, reps: '10–15', rest: 60, weight: true, knee: true,
  cues: ['Rücken an der Lehne, das Polster sitzt oberhalb der Knöchel.', 'Oben kurz halten, langsam wieder ablassen.'],
  watch: ['Lehne und Polster so einstellen, dass die Knie am Rand des Sitzes liegen und das Polster oberhalb der Knöchel sitzt.', 'Mit den Händen an den Griffen festhalten, der Rücken bleibt an der Lehne.', 'Das Bein langsam strecken, bis es fast gerade ist, oben 1 Sekunde halten.', 'Langsam, in etwa 3 Sekunden, wieder ablassen.', 'Wähle ein Gewicht, das du ohne Schwung bewegen kannst.'],
  mistakes: ['Mit Schwung hochschnellen.', 'Das Gesäss hebt vom Sitz ab.', 'Das Knie wird oben hart durchgedrückt.', 'Das Gewicht fällt unten einfach herunter.'],
  feel: 'Vorderseite des Oberschenkels (Quadrizeps). Bei Knieproblemen die Übung zuerst mit Physio oder MTT besprechen, denn sie belastet das Knie über einen langen Hebel.' });

x({ id: 'x-legcurl', name: 'Beinbeuger liegend', gear: 'Maschine', reg: 'oberschenkel', eq: 'ma', lvl: 1, pat: 'legcurl',
  sets: 3, reps: '10–15', rest: 60, weight: true,
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
  sets: 4, reps: '12–20', rest: 60, weight: true,
  cues: ['Die Kraft kommt aus der Hüfte, nicht aus den Armen.', 'Oben aufrecht stehen, das Gesäss ist fest.'],
  watch: ['Füsse schulterbreit, die Kettlebell steht etwa einen Schritt vor dir.', 'Hüfte nach hinten schieben, der Rücken bleibt gerade, die Kugel schwingt zwischen den Beinen nach hinten.', 'Die Hüfte kräftig nach vorn schieben, die Arme führen die Kugel nur bis Brusthöhe.', 'Oben stehst du aufrecht, das Gesäss ist fest, die Arme sind nur locker gestreckt.', 'Lass die Kugel zurückfallen und schiebe die Hüfte wieder nach hinten, ohne die Arme zu beugen.'],
  mistakes: ['Die Arme ziehen die Kugel hoch.', 'Der Rücken wird rund, wenn die Kugel zurückschwingt.', 'Es wird eine Kniebeuge statt eines Hüftstosses.', 'Oben ins Hohlkreuz lehnen.'],
  feel: 'Gesäss und Rückseite der Oberschenkel, dazu Rücken, Rumpf und Griffkraft. Der Puls steigt.',
  easier: 'Zuerst die Hüftbewegung ohne Schwung üben: die Kettlebell mit geradem Rücken vom Boden aufheben und wieder abstellen.' });

x({ id: 'x-trxsquat', name: 'TRX-Kniebeuge', gear: 'TRX', reg: 'oberschenkel gesaess', eq: 'trx', lvl: 1, pat: 'squat',
  sets: 3, reps: '10–15', rest: 60, knee: true,
  cues: ['Mit den Händen an den Griffen das Gleichgewicht halten.', 'Tief hinsetzen, Fersen am Boden, die Arme helfen nur.'],
  watch: ['TRX hoch einhängen, die Griffe mit gestreckten Armen halten und den Körper leicht zurücklehnen.', 'Füsse etwa schulterbreit, die Gurte bleiben gespannt.', 'Hüfte nach hinten und unten schieben, die Arme helfen nur beim Gleichgewicht.', 'Die Knie zeigen in Richtung der Zehen, die Fersen bleiben am Boden.', 'Mit den Beinen hochdrücken, nicht an den Griffen ziehen.'],
  mistakes: ['Mit den Armen hochziehen statt mit den Beinen drücken.', 'Die Knie fallen nach innen.', 'Die Fersen heben ab.', 'Die Gurte hängen durch.'],
  feel: 'Vorderseite der Oberschenkel und Gesäss.',
  easier: 'Weniger tief gehen und mehr Gewicht an die Griffe abgeben.',
  harder: 'Weniger zurücklehnen und langsamer absenken.' });

/* ===== Gesäss ===== */

x({ id: 'x-bridge', name: 'Gesässbrücke', gear: 'Körpergewicht, auf der Matte', reg: 'gesaess oberschenkel', eq: '', lvl: 1, pat: 'bridge',
  sets: 3, reps: '12–15', rest: 45,
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
  sets: 3, reps: '12–15', unit: 'Wdh. pro Bein', rest: 30,
  cues: ['Der Rumpf bleibt ruhig, das Bein drückt nach hinten oben.', 'Das Knie bleibt gebeugt, die Fusssohle zeigt zur Decke.'],
  watch: ['Auf Hände und Knie: Hände unter den Schultern, Knie unter der Hüfte.', 'Den Bauch leicht anspannen, der Rücken bleibt flach.', 'Ein Bein mit gebeugtem Knie nach hinten oben drücken, die Fusssohle zeigt zur Decke.', 'Oben das Gesäss anspannen, nicht höher als die Hüfte.', 'Kontrolliert zurück, dann nach allen Wiederholungen die Seite wechseln.'],
  mistakes: ['Hohlkreuz, das Bein schwingt zu hoch.', 'Das Becken dreht sich auf.', 'Mit Schwung statt mit Spannung.', 'Der Kopf fällt in den Nacken.'],
  feel: 'Gesäss des Beins, das nach hinten geht.',
  harder: 'Ein Band um die Oberschenkel oder eine leichte Hantel in der Kniekehle.' });

x({ id: 'x-kickback', name: 'Kabel-Kickback', gear: 'Kabelzug mit Knöchelmanschette', reg: 'gesaess', eq: 'kz', lvl: 2, pat: 'kick',
  sets: 3, reps: '10–15', unit: 'Wdh. pro Bein', rest: 60, weight: true,
  cues: ['Mit den Händen am Gerät festhalten, das Bein nach hinten strecken.', 'Rumpf ruhig, das Gesäss arbeitet.'],
  watch: ['Die Manschette am Knöchel befestigen, den Seilzug unten einstellen.', 'Mit leichter Vorbeuge am Gerät festhalten, der Rücken bleibt gerade.', 'Das Bein gestreckt (oder leicht gebeugt) nach hinten und oben drücken.', 'Oben das Gesäss anspannen, die Hüfte bleibt gerade.', 'Langsam zurückführen, das Gewicht nicht absetzen.'],
  mistakes: ['Hohlkreuz beim Anheben.', 'Das Becken dreht sich auf.', 'Mit Schwung arbeiten.', 'Zu viel Gewicht und eine kleine Bewegung.'],
  feel: 'Gesäss des Arbeitsbeins.' });

x({ id: 'x-sidelegraise', name: 'Seitliches Beinheben', gear: 'Körpergewicht, auf der Matte', reg: 'gesaess', eq: '', lvl: 1, pat: 'abd',
  sets: 3, reps: '12–20', unit: 'Wdh. pro Bein', rest: 30,
  cues: ['Auf der Seite liegen, der Körper bleibt in einer Linie.', 'Das obere Bein gestreckt anheben, die Zehen zeigen nach vorn.'],
  watch: ['Lege dich auf die Seite, der Körper bildet eine Linie, der untere Arm stützt den Kopf.', 'Das untere Bein darf leicht gebeugt sein, das obere Bein ist gestreckt.', 'Das obere Bein langsam anheben, die Zehen zeigen nach vorn, nicht zur Decke.', 'Das Becken bleibt gerade und kippt nicht nach hinten.', 'Oben kurz halten, langsam ablassen.'],
  mistakes: ['Das Becken kippt nach hinten.', 'Das Bein wird zu hoch gehoben, der Rumpf kippt mit.', 'Mit Schwung arbeiten.', 'Die Zehen zeigen zur Decke.'],
  feel: 'Der seitliche Gesässmuskel (Gluteus medius) und die seitliche Hüfte.',
  harder: 'Ein Band um die Oberschenkel oder die Fussgelenke.' });

x({ id: 'x-monster', name: 'Monster Walk', gear: 'Widerstandsband', reg: 'gesaess oberschenkel', eq: 'band', lvl: 1, pat: 'abd',
  sets: 3, reps: '10–15', unit: 'Schritte pro Seite', rest: 45,
  cues: ['Das Band bleibt auf Spannung, leicht in die Knie gehen.', 'Kleine Schritte zur Seite, die Füsse bleiben hüftbreit.'],
  watch: ['Das Band um die Oberschenkel oder die Knöchel legen (je tiefer, desto schwerer).', 'Gehe leicht in die Knie, das Gesäss nach hinten, die Brust bleibt offen.', 'Mache kleine Schritte zur Seite und halte dabei die Spannung im Band.', 'Die Knie zeigen immer in Richtung der Zehen und fallen nicht nach innen.', 'Gehe in der Gegenrichtung zurück oder wechsle nach der Hälfte der Schritte.'],
  mistakes: ['Die Knie fallen nach innen.', 'Das Band hängt durch, die Füsse stehen zu nah.', 'Der Oberkörper schaukelt von Seite zu Seite.', 'Die Füsse schlurfen zusammen.'],
  feel: 'Seitliche Gesässmuskeln und Hüfte.' });

/* ===== Rücken ===== */

x({ id: 'x-pullup', name: 'Klimmzug', gear: 'Klimmzugstange', reg: 'ruecken oberarme', eq: 'stange', lvl: 3, pat: 'vpull',
  sets: 3, reps: '4–8', rest: 120,
  cues: ['Zuerst die Schulterblätter nach unten ziehen, dann mit den Ellbogen ziehen.', 'Kinn über die Stange, kontrolliert wieder ablassen.'],
  watch: ['Die Stange etwa schulterbreit greifen, die Handflächen zeigen von dir weg.', 'Zuerst die Schulterblätter nach hinten unten ziehen, die Arme bleiben noch gestreckt.', 'Dann die Ellbogen nach unten zu den Hüften ziehen, bis das Kinn über der Stange ist.', 'Oben kurz halten und in etwa 3 Sekunden bis zu gestreckten Armen ablassen.', 'Der Körper bleibt ruhig, die Beine schwingen nicht.'],
  mistakes: ['Mit Schwung und den Beinen hochkippen.', 'Die Schultern wandern zu den Ohren.', 'Nur halbe Wiederholungen, unten nicht ganz hängen.', 'Der Kopf wird nach vorn gestreckt, um die Stange zu erreichen.'],
  feel: 'Breiter Rückenmuskel (Latissimus), dazu Bizeps und Unterarme.',
  easier: 'Ein Gummiband unter den Knien, die Füsse auf einer Kiste abstützen oder nur langsam ablassen (Negative).',
  harder: 'Zusatzgewicht an einem Gürtel oder 5 Sekunden zum Ablassen nehmen.' });

x({ id: 'x-pulldown', name: 'Latziehen', gear: 'Kabelzug oder Maschine', reg: 'ruecken oberarme', eq: 'kz|ma', lvl: 1, pat: 'vpull',
  sets: 3, reps: '10–12', rest: 75, weight: true,
  cues: ['Brust raus, die Stange zur oberen Brust ziehen.', 'Die Ellbogen gehen nach unten, die Schultern nicht hochziehen.'],
  watch: ['Setze dich so, dass die Oberschenkel unter dem Polster klemmen und die Füsse flach stehen.', 'Greife die Stange etwas breiter als die Schultern, mit gestreckten Armen.', 'Lehne den Oberkörper leicht zurück, die Brust bleibt offen.', 'Ziehe die Stange zur oberen Brust, die Ellbogen gehen nach unten und leicht nach hinten.', 'Lass die Stange langsam wieder nach oben gleiten, bis die Arme gestreckt sind.'],
  mistakes: ['Mit dem ganzen Oberkörper nach hinten schwingen.', 'Die Stange hinter den Kopf ziehen.', 'Die Schultern wandern zu den Ohren.', 'Zu viel Gewicht, die Arme ziehen allein.'],
  feel: 'Breiter Rückenmuskel an der Seite des Rückens, dazu der Bizeps.',
  easier: 'Weniger Gewicht oder ein engerer Griff.' });

x({ id: 'x-cablerow', name: 'Rudern sitzend am Kabel', gear: 'Kabelzug oder Maschine', reg: 'ruecken oberarme', eq: 'kz|ma', lvl: 1, pat: 'row',
  sets: 3, reps: '10–12', rest: 75, weight: true,
  cues: ['Aufrecht sitzen, die Ellbogen eng am Körper nach hinten ziehen.', 'Am Ende die Schulterblätter zusammendrücken.'],
  watch: ['Setze dich aufrecht, die Füsse stehen auf der Platte, die Knie sind leicht gebeugt.', 'Greife den Griff mit gestreckten Armen, der Rücken bleibt gerade.', 'Ziehe zuerst die Schulterblätter zusammen, dann die Ellbogen eng am Körper nach hinten, bis der Griff am Bauch ist.', 'Halte oben 1 Sekunde.', 'Lass den Griff langsam nach vorn gleiten, ohne dass der Rücken rund wird.'],
  mistakes: ['Mit dem Oberkörper vor- und zurückschaukeln.', 'Die Schultern sind hochgezogen.', 'Der Rücken wird beim Strecken der Arme rund.', 'Der Griff wird zu hoch zur Brust gezogen.'],
  feel: 'Mittlerer Rücken zwischen den Schulterblättern, hintere Schulter und Bizeps.' });

x({ id: 'x-bbrow', name: 'Vorgebeugtes Rudern', gear: 'Langhantel', reg: 'ruecken oberarme', eq: 'lh', lvl: 3, pat: 'row',
  sets: 3, reps: '6–10', rest: 90, weight: true,
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
  sets: 3, reps: '5–8', rest: 150, weight: true,
  cues: ['Stange nah am Körper, Rücken gerade, mit den Beinen wegdrücken.', 'Oben die Hüfte nach vorn schieben, nicht ins Hohlkreuz.'],
  watch: ['Die Stange liegt über der Fussmitte, die Füsse stehen hüftbreit.', 'Beuge Hüfte und Knie und greife die Stange knapp ausserhalb der Beine, die Arme sind gestreckt.', 'Brust raus, Rücken gerade, baue Spannung auf („die Stange anziehen“).', 'Drücke dich mit den Beinen vom Boden weg, die Stange bleibt nah an Schienbeinen und Oberschenkeln.', 'Oben aufrecht stehen und das Gesäss anspannen. Dann kontrolliert absenken.'],
  mistakes: ['Der Rücken wird rund.', 'Die Stange schwingt vom Körper weg.', 'Die Hüfte schiesst zuerst hoch, und der Rücken muss alles heben.', 'Oben ins Hohlkreuz überstrecken.'],
  feel: 'Rückseite der Oberschenkel, Gesäss und der ganze Rücken. Wähle ein Gewicht, bei dem die Technik sauber bleibt.',
  easier: 'Mit Kurzhanteln oder einer erhöhten Stange beginnen, oder zuerst das Rumänische Kreuzheben üben.' });

x({ id: 'x-superman', name: 'Superman', gear: 'Körpergewicht, auf der Matte', reg: 'ruecken gesaess', eq: '', lvl: 1, pat: 'extend',
  sets: 3, reps: '10–12', rest: 30,
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
  sets: 3, reps: '12–15', rest: 45,
  cues: ['Aufrecht sitzen, die Ellbogen eng zum Körper ziehen.', 'Am Ende die Schulterblätter zusammendrücken.'],
  watch: ['Setze dich mit gestreckten (oder leicht gebeugten) Beinen auf den Boden und lege das Band um die Füsse.', 'Halte die Enden mit gestreckten Armen, der Rücken ist gerade und aufrecht.', 'Ziehe die Ellbogen eng am Körper nach hinten, bis die Hände am Bauch sind.', 'Drücke am Ende die Schulterblätter zusammen und halte 1 Sekunde.', 'Lass das Band langsam wieder nach vorn gleiten.'],
  mistakes: ['Der Oberkörper lehnt weit nach hinten.', 'Die Schultern werden hochgezogen.', 'Der Rücken wird rund.', 'Das Band schnellt zurück.'],
  feel: 'Mittlerer Rücken, hintere Schulter und Bizeps.',
  harder: 'Ein stärkeres Band oder am Ende 2 Sekunden halten.' });

x({ id: 'x-pullapart', name: 'Band auseinanderziehen', gear: 'Widerstandsband', reg: 'ruecken schultern', eq: 'band', lvl: 1, pat: 'pullapart',
  sets: 3, reps: '12–20', rest: 30,
  cues: ['Die Arme bleiben gestreckt, das Band wird auseinandergezogen.', 'Schulterblätter zusammen, die Schultern bleiben unten.'],
  watch: ['Halte das Band mit beiden Händen etwa schulterbreit vor der Brust, die Arme sind gestreckt.', 'Ziehe das Band auseinander, bis die Arme seitlich waagerecht sind.', 'Drücke dabei die Schulterblätter zusammen.', 'Die Schultern bleiben unten, der Rücken gerade.', 'Lass das Band kontrolliert wieder zusammenkommen.'],
  mistakes: ['Die Schultern wandern zu den Ohren.', 'Hohlkreuz.', 'Das Band schnappt zurück.', 'Die Arme beugen sich stark.'],
  feel: 'Hintere Schulter und oberer Rücken.',
  harder: 'Ein stärkeres Band oder die Arme diagonal nach oben (Y-Form) ziehen.' });

/* ===== Brust ===== */

x({ id: 'x-pushup-knee', name: 'Liegestütze auf den Knien', gear: 'Körpergewicht, auf der Matte', reg: 'brust schultern oberarme', eq: '', lvl: 1, pat: 'push',
  sets: 3, reps: '6–12', rest: 60,
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
  sets: 3, reps: '5–8', rest: 120, weight: true,
  cues: ['Schulterblätter zusammen und fest auf die Bank, Füsse am Boden.', 'Die Stange zur Brustmitte senken und wieder wegdrücken.'],
  watch: ['Lege dich so hin, dass die Augen unter der Stange sind, die Füsse stehen fest am Boden.', 'Ziehe die Schulterblätter zusammen und nach unten, die Brust ist leicht gehoben.', 'Greife die Stange etwas breiter als die Schultern, das Handgelenk liegt gerade über dem Unterarm.', 'Senke die Stange kontrolliert zur Brustmitte, die Unterarme bleiben senkrecht.', 'Drücke die Stange kräftig nach oben, bis die Arme fast gestreckt sind.'],
  mistakes: ['Das Gesäss hebt von der Bank ab.', 'Die Stange prallt von der Brust ab.', 'Die Ellbogen zeigen im rechten Winkel zur Seite.', 'Ohne Partner an die Grenze gehen. Besser ein Gewicht wählen, das du sicher schaffst, oder in einem Rack mit Sicherungen üben.'],
  feel: 'Brust, vordere Schulter und Trizeps.',
  easier: 'Mit Kurzhanteln oder erhöhten Liegestützen beginnen.' });

x({ id: 'x-dbpress', name: 'Bankdrücken mit Kurzhanteln', gear: 'Kurzhanteln und Bank', reg: 'brust schultern oberarme', eq: 'kh bank', lvl: 2, pat: 'bench',
  sets: 3, reps: '8–12', rest: 90, weight: true,
  cues: ['Schulterblätter zusammen, Hanteln über der Brust.', 'Die Ellbogen schräg zum Körper, nicht ganz zur Seite.'],
  watch: ['Setze dich mit den Hanteln auf die Oberschenkel und lege dich zurück, die Hanteln kommen auf Brusthöhe.', 'Die Füsse stehen fest am Boden, die Schulterblätter sind zusammengezogen.', 'Drücke beide Hanteln gleichzeitig nach oben, bis die Arme fast gestreckt sind.', 'Senke sie langsam wieder ab, bis die Ellbogen knapp unter Brusthöhe sind.', 'Die Handgelenke bleiben gerade, die Hanteln bewegen sich ruhig.'],
  mistakes: ['Die Hanteln schwanken, weil sie zu schwer sind.', 'Die Ellbogen sinken zu tief und belasten die Schulter.', 'Das Gesäss hebt ab.', 'Die Hanteln werden oben zusammengeschlagen.'],
  feel: 'Brust, vordere Schulter und Trizeps. Jede Seite arbeitet für sich.',
  easier: 'Mit leichteren Hanteln oder als Liegestütze mit erhöhten Händen.' });

x({ id: 'x-chestpress', name: 'Brustpresse an der Maschine', gear: 'Brustpresse', reg: 'brust oberarme', eq: 'ma', lvl: 1, pat: 'bench',
  sets: 3, reps: '10–12', rest: 75, weight: true,
  cues: ['Aufrecht sitzen, der Rücken liegt am Polster.', 'Gleichmässig nach vorn drücken, nicht ganz durchstrecken.'],
  watch: ['Stelle den Sitz so ein, dass die Griffe auf Brusthöhe sind.', 'Setze dich aufrecht, Rücken und Kopf liegen am Polster, die Füsse stehen am Boden.', 'Drücke die Griffe gleichmässig nach vorn, bis die Arme fast gestreckt sind.', 'Lasse sie kontrolliert wieder zurückkommen, ohne dass das Gewicht aufsetzt.', 'Atme beim Drücken aus.'],
  mistakes: ['Der Sitz ist zu hoch oder zu tief, die Schultern werden hochgezogen.', 'Die Ellbogen werden hart durchgedrückt.', 'Die Schultern rollen nach vorn.', 'Das Gewicht schlägt am Anschlag auf.'],
  feel: 'Brust, vordere Schulter und Trizeps.' });

x({ id: 'x-cablefly', name: 'Kabel-Fly von oben', gear: 'Kabelzug', reg: 'brust schultern', eq: 'kz', lvl: 2, pat: 'fly',
  sets: 3, reps: '10–15', rest: 60, weight: true,
  cues: ['Die Arme leicht gebeugt, die Hände kommen vor dem Körper zusammen.', 'Die Bewegung kommt aus der Brust, nicht aus den Armen.'],
  watch: ['Stelle beide Kabel oben ein und stelle dich mittig, einen Fuss etwas vor den anderen.', 'Greife die Griffe, beuge die Arme leicht und lehne dich ein wenig nach vorn.', 'Führe die Hände in einem weiten Bogen nach unten und vorn zusammen, als würdest du jemanden umarmen.', 'Drücke die Brust kurz zusammen und lasse die Arme langsam wieder auseinander.', 'Die Ellbogen bleiben immer leicht gebeugt und auf gleicher Höhe.'],
  mistakes: ['Die Arme strecken und beugen sich, es wird zu einem Drücken.', 'Mit dem Oberkörper schwingen.', 'Zu schwer, die Schultern ziehen nach vorn.', 'Die Arme gehen hinter die Schulter-Linie zurück.'],
  feel: 'Die Brust, besonders an der Innenseite. Die vordere Schulter hilft mit.' });

x({ id: 'x-dips', name: 'Dips an der Bank', gear: 'Bank, Kiste oder stabiler Stuhl', reg: 'oberarme brust', eq: 'bank|box', lvl: 2, pat: 'dip',
  sets: 3, reps: '8–12', rest: 60,
  cues: ['Die Hände stützen hinter dir auf der Kante, der Rücken bleibt nah an der Bank.', 'Nur so tief, bis die Ellbogen etwa 90 Grad haben.'],
  watch: ['Setze dich an die Kante, die Hände neben der Hüfte, die Finger zeigen nach vorn.', 'Rutsche mit dem Gesäss nach vorn, die Beine sind gebeugt und die Füsse stehen am Boden.', 'Beuge die Ellbogen nach hinten und senke den Körper, bis die Ellbogen etwa 90 Grad haben.', 'Der Rücken bleibt nah an der Bank, die Schultern bleiben unten.', 'Drücke dich wieder hoch, ohne die Ellbogen hart durchzudrücken.'],
  mistakes: ['Zu tief, die Schultern rutschen unter die Ellbogen.', 'Die Schultern wandern zu den Ohren.', 'Der Körper driftet weit von der Bank weg.', 'Die Ellbogen zeigen zur Seite statt nach hinten.'],
  feel: 'Hinterseite der Oberarme (Trizeps), dazu Brust und vordere Schulter.',
  easier: 'Die Füsse näher an die Bank stellen und die Knie stärker beugen.',
  harder: 'Die Beine strecken oder ein Bein anheben.' });

x({ id: 'x-medpass', name: 'Medizinball-Brustpass an die Wand', gear: 'Medizinball und Wand', reg: 'brust schultern oberarme', eq: 'mb', lvl: 2, pat: 'push',
  sets: 3, reps: '10–12', rest: 60,
  cues: ['Aus den Beinen mit Schwung, Arme strecken, Ball an die Wand.', 'Den Ball fangen und weich zur Brust zurücknehmen.'],
  watch: ['Stelle dich etwa zwei Meter vor eine stabile Wand, die Füsse hüftbreit, die Knie leicht gebeugt.', 'Halte den Ball mit beiden Händen vor der Brust, die Ellbogen zeigen nach unten.', 'Strecke Beine und Arme gleichzeitig und wirf den Ball kräftig auf Brusthöhe gegen die Wand.', 'Fange den Ball weich mit gebeugten Armen und nimm ihn wieder zur Brust.', 'Wiederhole ohne Pause, aber kontrolliert.'],
  mistakes: ['Der Ball wird zu hoch oder zu tief geworfen.', 'Der Rücken wird rund.', 'Die Arme fangen den Ball steif, die Handgelenke werden belastet.', 'Die Wand ist nicht fest oder zu nah.'],
  feel: 'Brust, Schultern und Trizeps, dazu Beine und Rumpf. Eine Übung für schnelle, kräftige Bewegungen.',
  easier: 'Einen leichteren Ball nehmen oder den Ball nur drücken statt werfen.' });

/* ===== Schultern ===== */

x({ id: 'x-ohp', name: 'Schulterdrücken mit Kurzhanteln', gear: 'Kurzhanteln', reg: 'schultern oberarme', eq: 'kh', lvl: 2, pat: 'ohp',
  sets: 3, reps: '8–12', rest: 75, weight: true,
  cues: ['Stehen, Bauch und Gesäss fest, die Rippen bleiben unten.', 'Über den Kopf drücken, ohne ins Hohlkreuz zu fallen.'],
  watch: ['Stehe hüftbreit, die Hanteln auf Schulterhöhe, die Handflächen zeigen nach vorn oder zueinander.', 'Spanne Bauch und Gesäss an, der Blick geht geradeaus.', 'Drücke die Hanteln gerade nach oben, bis die Arme gestreckt sind.', 'Der Kopf geht kurz nach vorn durch die Arme, wenn die Hanteln oben sind.', 'Senke die Hanteln kontrolliert wieder zu den Schultern.'],
  mistakes: ['Ins Hohlkreuz lehnen.', 'Mit den Beinen schwingen, sie sollen nur stabil stehen.', 'Die Hanteln weit vor dem Körper führen.', 'Die Schultern zu den Ohren ziehen.'],
  feel: 'Die Schultern, dazu der Trizeps und der Rumpf, der dich stabil hält.',
  easier: 'Im Sitzen mit Rückenlehne.',
  harder: 'Abwechselnd mit einem Arm oder im Halbkniestand.' });

x({ id: 'x-lateral', name: 'Seitheben', gear: 'Kurzhanteln', reg: 'schultern', eq: 'kh', lvl: 1, pat: 'raise',
  sets: 3, reps: '10–15', rest: 45, weight: true,
  cues: ['Leichte Gewichte, die Arme leicht gebeugt seitlich bis Schulterhöhe heben.', 'Die Schultern bleiben unten, der Rücken ruhig.'],
  watch: ['Stehe aufrecht, in jeder Hand eine leichte Hantel neben dem Körper.', 'Beuge die Ellbogen leicht und halte sie in dieser Haltung.', 'Hebe die Arme seitlich an, bis sie etwa auf Schulterhöhe sind. Die Ellbogen führen die Bewegung an.', 'Halte oben kurz an und senke die Arme langsam in etwa 3 Sekunden.', 'Atme beim Heben aus.'],
  mistakes: ['Zu schwere Gewichte, der Oberkörper schwingt mit.', 'Die Schultern werden hochgezogen.', 'Die Arme gehen höher als die Schultern.', 'Die Hände führen, die Ellbogen hängen nach.'],
  feel: 'Die Seite der Schultern. Wähle ein Gewicht, bei dem die Haltung sauber bleibt.' });

x({ id: 'x-front', name: 'Frontheben', gear: 'Kurzhantel oder Scheibe', reg: 'schultern brust', eq: 'kh', lvl: 1, pat: 'raise',
  sets: 3, reps: '10–12', rest: 45, weight: true,
  cues: ['Die Arme mit leicht gebeugten Ellbogen nach vorn bis Schulterhöhe heben.', 'Der Oberkörper bleibt ruhig, kein Schwung.'],
  watch: ['Stehe aufrecht, die Hanteln hängen vor den Oberschenkeln.', 'Spanne Bauch und Gesäss an.', 'Hebe einen Arm (oder beide) gestreckt nach vorn, bis die Hand auf Schulterhöhe ist.', 'Halte kurz und senke die Hantel langsam wieder ab.', 'Der Rücken bleibt gerade, die Schultern bleiben unten.'],
  mistakes: ['Mit dem Oberkörper nach hinten schwingen.', 'Die Hantel über Schulterhöhe heben.', 'Ein Hohlkreuz machen.', 'Zu schwere Gewichte.'],
  feel: 'Die Vorderseite der Schultern, ein wenig auch die Brust.' });

x({ id: 'x-pike', name: 'Pike-Liegestütze', gear: 'Körpergewicht, auf der Matte', reg: 'schultern oberarme', eq: '', lvl: 3, pat: 'ohp',
  sets: 3, reps: '5–10', rest: 75,
  cues: ['Die Hüfte hoch, der Körper bildet ein umgekehrtes V.', 'Der Kopf sinkt zwischen die Hände, die Ellbogen zeigen nach hinten.'],
  watch: ['Stütze die Hände etwa schulterbreit auf, gehe mit den Füssen näher heran und schiebe die Hüfte nach oben.', 'Die Beine sind fast gestreckt, der Rücken ist gerade, der Kopf ist zwischen den Armen.', 'Beuge die Ellbogen und senke den Kopf kontrolliert Richtung Boden.', 'Drücke dich kräftig hoch, bis die Arme gestreckt sind.', 'Die Hüfte bleibt hoch während der ganzen Bewegung.'],
  mistakes: ['Die Hüfte sinkt ab, es wird ein normaler Liegestütz.', 'Die Ellbogen zeigen weit zur Seite.', 'Der Kopf kippt nach vorn und der Nacken wird belastet.', 'Die Hände sind zu weit vorn oder zu eng.'],
  feel: 'Die Schultern und der Trizeps, dazu der obere Rücken. Ein Einstieg in den Handstand-Liegestütz.',
  easier: 'Die Hände auf eine Erhöhung stellen oder erst nur in der Pike-Position halten.' });

/* ===== Nacken ===== */

x({ id: 'x-chintuck', name: 'Kinn einziehen', gear: 'Körpergewicht, im Stehen oder Sitzen', reg: 'nacken', eq: '', lvl: 1, pat: 'neck',
  sets: 2, reps: '10', rest: 20,
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
  sets: 3, reps: '10–15', rest: 45, weight: true,
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

/* ==== new exercises below ==== */

})();

if (typeof module !== 'undefined' && module.exports) module.exports = { LIB: LIB, EX: EX };
