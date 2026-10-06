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

/* ==== new exercises below ==== */

})();

if (typeof module !== 'undefined' && module.exports) module.exports = { LIB: LIB, EX: EX };
