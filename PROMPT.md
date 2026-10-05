# Auftrag für Claude Code: „Strichliste" als installierbare Offline-App (PWA) auf GitHub Pages

Du arbeitest in einem GitHub-Repo. Baue daraus eine kleine, statische Web-App, die auf GitHub Pages läuft, sich auf einem Android-Handy (Huawei P30, Chrome) als **echte App ohne Browser-Tab** installieren lässt, **komplett offline** funktioniert und alle Daten **nur lokal auf dem Gerät** speichert.

Im Ordner `reference/` liegt die bestehende, getestete Version als Einzeldatei (`page.html`, enthält CSS + JS) plus die Strichfiguren-Engine (`fig.js`). Lies beides zuerst vollständig. Das Verhalten und das Design aus der Referenz bleiben erhalten, ausser wo dieser Auftrag etwas ändert. Der Referenzcode ist als Artifact auf claude.ai gelaufen, deshalb gelten dort Einschränkungen (kein Service Worker, Google Fonts per CDN), die du jetzt nicht mehr hast.

## 1. Hintergrund (wichtig für Entscheidungen)

- Nutzerin: Freundin von Mirko, Rehab nach Kreuzbandriss und Arthrofibrose (3 Operationen in 15 Monaten, letzte OP 28.04.2026 mit Arthrolyse). Zusätzlich 2–3 MTT-Einheiten pro Woche (nur Beine). Diese App ist für **2 zusätzliche Trainingstage (Tag A / Tag B)** mit wenig Beinbelastung, Oberkörper und Rumpf nicht vernachlässigen.
- Sie hat Schwierigkeiten, ohne Anleitung zu trainieren (Tendenz ADHS/ADS). Darum: **immer nur eine Sache auf dem Bildschirm im Fokus**, grosse Buttons, klare nächste Aktion, kurze Texte, Strichliste zum Abhaken, automatische Pausen mit Timer. Das ist kein Nice-to-have, sondern der Kern der App. Nichts davon verschlechtern.
- Sie stört sich daran, dass die jetzige Chrome-Verknüpfung bei jedem Start einen neuen Tab öffnet. Ziel ist eine installierte PWA (WebAPK), die im Standalone-Modus ohne Adressleiste startet.
- Sprache der Oberfläche: **Deutsch (Schweiz/Deutschland neutral, kein „ß" nötig, aber „ß" ist ok)**. Medizinische Aussagen bleiben vorsichtig: keine Diagnosen, keine Therapieversprechen, Kniehinweise verweisen auf Physio/MTT.
- Das Repo enthält **keine persönlichen Daten** und keine Fotos. Alles Persönliche liegt nur im `localStorage`/IndexedDB auf ihrem Handy.

## 2. Ihr Homegym (Basis für Übungsauswahl und Hinweistexte)

Power-Rack mit Klimmzugstange und J-Haken, Olympia-Langhantel mit Hantelpolster, Hantelscheiben (u. a. 10-kg-Bumper), flache/verstellbare Hantelbank, Kurzhantelständer mit Hex-Kurzhanteln, TRX (am Rack einhängbar), Plyo-Box (20/24/30 Zoll, also ca. 51/61/76 cm), Rudergerät, Spinning-Bike, Gummiboden, Matten, Bänder, Faszienrolle. Keine Kabelzüge.

## 3. Plan (neu: Hip Thrust, TRX-Trizeps korrigiert)

**Tag A – Kniebeuge + Hüftstrecker + Push**

| # | Übung | Sätze | Wdh./Zeit | Pause | Gewicht-Feld | Knie-Hinweis |
|---|---|---|---|---|---|---|
| 1 | Box-Kniebeugen (Langhantel) | 3 | 8–10 | 90 s | ja | ja |
| 2 | **Hip Thrust (Langhantel oder Kurzhantel, Rücken auf der Bank)** *neu* | 3 | 8–12 | 90 s | ja | ja |
| 3 | Liegestütze | 3 | max. saubere Wdh. | 60 s | nein | nein |
| 4 | **TRX-Trizepsstrecken (Körper nach oben drücken)** *geändert* | 3 | 10–15 | 60 s | nein | nein |
| 5 | Plank | 3 | 45 s oder 60 s (umschaltbar) | 45 s | nein | nein |

**Tag B – Hüftbeuge + Pull** (unverändert): Rumänisches Kreuzheben 3×8–12 (90 s, Gewicht, Knie), TRX-Rudern 3×10–15 (60 s), TRX-Ausfallschritte rückwärts 3×8–12 pro Bein (90 s, Knie, mit Festhalten), Bizeps-Curls 3×10–15 (60 s, Gewicht), TRX-Crunches 3×10–15 (45 s).

Bisherige Hinweistexte (`cues`, `TIPS`) stehen in `reference/page.html` und bleiben, ausser bei den zwei geänderten bzw. neuen Übungen. Dort **ersetzen/ergänzen** wie folgt (Wortlaut darfst du leicht glätten, aber nicht inhaltlich ändern):

**Hip Thrust** (`id: a-hip`, Gerät: „Langhantel mit Polster oder Kurzhantel")
- cues: „Oberer Rücken liegt an der Bankkante, Füsse hüftbreit, Schienbeine oben senkrecht.", „Kinn leicht zur Brust, Rippen unten, oben das Gesäss fest anspannen."
- watch: Bank an Wand oder Rack stellen, damit sie nicht wegrutscht. Hantelpolster in die Hüftbeuge. Schulterblätter an der Bankkante. Fersen so setzen, dass die Schienbeine oben senkrecht stehen. Hüfte hochdrücken, bis Oberschenkel und Rumpf eine Linie bilden. Oben 1 Sekunde halten, kontrolliert ablassen.
- mistakes: Hohlkreuz, Rippen heben ab (Hüfte zu hoch gedrückt). Füsse zu nah (Oberschenkelvorderseite arbeitet) oder zu weit weg (Beinbeuger krampft). Knie fallen nach innen. Kopf in den Nacken.
- feel: Gesäss (Gluteus), dazu Rückseite der Oberschenkel. Spürst du es vor allem im unteren Rücken oder vorn im Oberschenkel, Fussposition anpassen und Gewicht senken.
- Knie-Hinweis wie üblich; zusätzlich Hinweis: Start mit leichter Last (oder nur Körpergewicht/Kurzhantel), Steigerung mit Physio/MTT abstimmen. Beinvolumen pro Tag ist jetzt 6 Sätze, bei Schwellung/Steifheit am Folgetag reduzieren.

**TRX-Trizepsstrecken** (`id: a-tri`, Gerät: „TRX", bisher fälschlich als Standing-Pushdown am Band animiert)
- Ausführung: TRX **hoch am Rack** einhängen. Rücken zum Anker stehen, Griffe in die Hände, nach vorn lehnen, Füsse hüftbreit. Körper ist ein gerades Brett, Arme starten **gestreckt vor dem Kopf**, Hände etwa auf Kopf-/Schulterhöhe. Nur die Ellbogen beugen: Kopf sinkt zwischen/hinter die Hände, Ellbogen bleiben schulterbreit und zeigen nach vorn. Dann mit dem Trizeps den **ganzen Körper wieder nach oben drücken**, bis die Arme gestreckt sind. Schwerer: Füsse weiter nach hinten (flacherer Körper). Leichter: Schritt zurück zum Anker (steilerer Körper).
- cues: „Körper bleibt eine gerade Linie, Hüfte nicht durchhängen lassen.", „Nur die Ellbogen bewegen, Oberarme bleiben ruhig."
- watch: siehe Ausführung, als 4 kurze Punkte.
- mistakes: Hüfte hängt durch oder Po steigt. Ellbogen kippen nach aussen. Schultern wandern zu den Ohren, Bewegung kommt aus der Schulter statt aus dem Ellbogen. Zu tief und unkontrolliert absinken (Ellbogen/Schulter).
- feel: Rückseite des Oberarms (Trizeps). Wird es in der Schulter oder im Handgelenk unangenehm, steileren Winkel wählen.

## 4. Technische Vorgaben

### 4.1 Struktur
Statische Seite ohne Build-Zwang (kein Bundler nötig; wenn du einen Schritt brauchst, dann nur einen kleinen, den GitHub Actions ausführt). Vorschlag:

```
index.html            Schale, Meta, Manifest-Link, Skripte
styles.css            aus reference/page.html extrahiert
app.js                App-Logik (aus reference/page.html extrahiert, in Module/Funktionsblöcke gegliedert)
fig.js                Strichfiguren-Engine + Übungsanimationen
plan.js               PLAN, TIPS, NUTR (Daten getrennt von Logik)
sw.js                 Service Worker
manifest.webmanifest
icons/                192, 512, maskable-512 PNG, apple-touch-icon 180, favicon.svg
fonts/                Barlow + Barlow Condensed als woff2 (latin), selbst gehostet
.nojekyll
.github/workflows/pages.yml
README.md             Deutsch: Was ist das, wie aktualisiere ich, wie installiere ich
```
Alle Pfade **relativ** (`./…`), weil GitHub Pages unter `/<repo>/` läuft. Manifest: `start_url: "./"`, `scope: "./"`, `id: "./"`.

### 4.2 PWA und Installierbarkeit (Hauptziel)
- `display: "standalone"`, `orientation: "portrait"`, `lang: "de"`, `name: "Trainings-Strichliste"`, `short_name: "Training"`, `theme_color`/`background_color` passend zum Design (Hell: #ECF0F1, Akzent #0B7A85).
- Icons: eigenes einfaches Icon (Hantel- oder Strich-Symbol in Akzentfarbe), als PNG 192 und 512, plus **maskable** 512. Erzeuge sie per Skript (z. B. mit Python/Pillow oder `sharp`), nicht von Hand.
- Service Worker mit `fetch`-Handler (Voraussetzung für Chromes Installieren-Dialog). Strategie: App-Shell **precache** (alle Dateien oben inkl. Fonts), danach cache-first mit Netzwerk-Fallback; Cache-Name enthält eine Versionsnummer, alte Caches werden beim `activate` gelöscht.
- **Update-Ablauf**: Neue Version wird im Hintergrund geladen. Erscheint ein wartender Service Worker, zeige unten eine kleine, ruhige Leiste „Neue Version bereit. Neu laden", die erst bei Tipp aktualisiert. Nie mitten in einem Satz, Pause oder Plank automatisch neu laden. Versionsnummer (aus `package.json`/Konstante, beim Deploy gesetzt) im Footer anzeigen.
- Keine externen Requests zur Laufzeit (keine CDNs, keine Google Fonts). Prüfe im Test, dass im Offline-Modus alles lädt.
- `navigator.storage.persist()` beim ersten Start anfragen (still, ohne UI), damit Chrome die Daten nicht unter Speicherdruck räumt.
- Safe-Area, Wake-Lock, Vibration, WebAudio-Pieptöne wie in der Referenz beibehalten (alles mit try/catch).

### 4.3 Daten und Speicherung
- Weiterhin `localStorage`, Schlüssel `strichliste.v1`, aber mit Feld `schema` (Zahl). Schreibe eine `migrate(state)`-Funktion. Ersetze bei Bedarf durch IndexedDB, wenn du das für robuster hältst, dann mit Fallback und Test.
- **Import der Altdaten**: Die bisherige Version (läuft auf claude.ai, anderer Origin, ihre Daten sind dort nicht lesbar) hat „Daten sichern" (JSON-Text kopieren). „Wiederherstellen" in der neuen App muss dieses Altformat akzeptieren (`log` als `{ "YYYY-MM-DD": ["A","B"] }`, `food`, `recent`, `goalP`, `weightKg`, `weights`, `plankSecs`) und in das neue Format migrieren. Teste das mit einem Beispiel.
- Zusätzlich: „Daten als Datei sichern" (Download einer `.json`) und „Aus Datei wiederherstellen" (File-Input). Beides auf dem Handy testen können (Blob + `<a download>`).
- Beim Wiederherstellen alles validieren/bereinigen (die Referenz hat `applyData` und `cleanEntry`), nie ungeprüft übernehmen.
- Bei nicht verfügbarem Speicher: ruhiger Hinweis, App läuft trotzdem im Speicher.

### 4.4 Vergangene Einheiten und Essen **bearbeitbar** machen (neu)
Heute speichert der Kalender nur „Tag A/B an Datum X". Neu:
- Beim Eintragen eines Trainings wird eine **Momentaufnahme** gespeichert: `log[datum] = [{ day:'A', sets:{übungId:Sätze}, weights:{übungId:"60"}, note:"" }]`. Altformat (`["A"]`) wird zu `{day:'A', sets:{}, weights:{}}` migriert.
- Im Kalender-Tag-Detail: pro Eintrag aufklappbar. Dort pro Übung Sätze mit +/− ändern, Gewicht ändern, kurze Notiz, Datum **verschieben**, Eintrag löschen. Aufbau wie die restliche App: grosse Ziele, kein Mini-UI.
- Essen: Tipp auf einen Eintrag öffnet ihn zum **Bearbeiten** (Formular füllt sich, Button „Speichern" statt „Hinzufügen", „Abbrechen"). Zusätzlich „Auf heute kopieren" und „Auf anderen Tag kopieren". Vorhandenes Löschen mit Rückgängig bleibt.
- Beim Eintragen eines Trainings darf ein Tag nur einmal pro Datum und Typ vorkommen (wie bisher), aber Bearbeiten darf nicht dazu führen, dass Daten verloren gehen.

### 4.5 Animationen (`fig.js`)
Die Engine (2-Knochen-IK, Seitenansicht nach rechts, Posen als `{hip, th, ankle, fa, wrist|wr, ankle2, fa2, ha, round, es}`, `ANIM[id] = {reps, hl, props, steps:[{pose, ms, hold, label, bad?}]}`) ist in `reference/fig.js` dokumentiert und funktioniert. Aufgaben:
1. **a-tri neu animieren** nach der Beschreibung in Abschnitt 3: Rack-Anker oben links (hinter der Figur), TRX-Bänder laufen vom Anker zu den Händen, Figur lehnt nach vorn (Körper gerade Linie von den Füssen bis zum Kopf), Start mit gestreckten Armen, Ellbogen beugen, Kopf sinkt, wieder hochdrücken. Orange „Falsch"-Schritt: Hüfte hängt durch. Hervorgehobener Muskel (`hl`): Oberarm-Rückseite (Trizeps). Das Standing-Pushdown-Bild muss komplett verschwinden.
2. **a-hip neu** (Hip Thrust): Seitenansicht, oberer Rücken auf der Bank (Bank als Prop), Füsse flach, Langhantel quer über der Hüfte (Scheibe als Kreis, wie bei der Kniebeuge). Unten: Hüfte knapp über dem Boden. Oben: Oberschenkel und Rumpf in einer Linie, Schienbeine senkrecht, Kinn zur Brust. Orange „Falsch"-Schritt: Hohlkreuz, Hüfte zu hoch, Rippen offen. `hl`: Gesäss/Oberschenkel.
3. Alle anderen Animationen unverändert lassen, ausser du findest bei der Prüfung einen echten Fehler.
4. **Prüfen ohne zu raten**: Rendere für jede neue/geänderte Animation 4–6 Zwischenbilder (Playwright-Screenshot oder cairosvg) als Kontaktbogen und **schau sie dir an**. Segmentlängen müssen über alle Frames konstant bleiben, Gelenke dürfen nicht „brechen", die Figur muss auf dem Boden stehen/liegen, Props dürfen den Kopf nicht verdecken. Korrigiere, bis es für einen Laien eindeutig die richtige Übung zeigt. Hinweis: Das Abspiel-Badge sitzt unter dem Bild, nicht darüber.

### 4.6 Design/UX (aus der Referenz übernehmen)
Tabs Training / Kalender / Essen unten, Sticky-Header mit Tag-Umschalter und Fortschritt, Fokus-Karte mit Strichliste (Satz 1/2/3), ein grosser Haupt-Button, automatische Pause mit Countdown und „+ 30 s"/„Rückgängig", Plank-Ring mit 5 s Vorlauf und 45/60 s, Fertig-Karte mit „Training in Kalender eintragen" (Datumsauswahl, heute vorbelegt, nicht in der Zukunft), „So geht die Übung" mit anklickbarer Strichfigur plus „Darauf achten / Häufige Fehler / Hier spürst du es", Essens-Tracker (alle Felder freiwillig; Nährwerte pro 100 g oder ganze Menge; Tagesbilanz; Protein-Ziel mit Balken; Richtwert 1,4–2,0 g/kg nur als Orientierung), Hell/Dunkel automatisch, Barlow/Barlow Condensed, Mindest-Tippziel 48 px, Seitenränder 16 px, Zielbreite 360 px, kein horizontales Scrollen bis 320 px.

## 5. Deployment

- Lege (falls noch nicht vorhanden) das Repo an und committe in kleinen, sinnvollen Schritten.
- **GitHub Actions Workflow** `.github/workflows/pages.yml` (Trigger: Push auf `main` und manuell), der die statischen Dateien als Pages-Artifact hochlädt und mit `actions/deploy-pages` veröffentlicht. Der Workflow setzt vor dem Upload die Versionsnummer (z. B. Commit-SHA oder Datum) in `sw.js`/Footer, damit der Cache bei jedem Deploy erneuert wird.
- Pages muss auf **Quelle „GitHub Actions"** stehen. Versuche es per `gh api` zu aktivieren. Wenn dir die Rechte fehlen, sage Mirko in einem klaren Satz, dass er unter *Settings → Pages → Build and deployment → Source* „GitHub Actions" wählen muss, und mache bis dahin alles andere fertig.
- Hinweis: GitHub Pages auf kostenlosen Konten verlangt ein **öffentliches Repo**. Das ist ok, weil das Repo nur Code und Übungstexte enthält. Prüfe vor jedem Commit, dass keine persönlichen Daten, Fotos oder Tokens drin sind.
- Gib am Ende die Live-URL aus und warte, bis der Deploy-Lauf grün ist (`gh run watch`). Rufe die URL einmal ab (Status 200, Manifest erreichbar, `sw.js` erreichbar).

## 6. Tests (alles ausführen, nichts behaupten)

Playwright mit dem vorinstallierten Chromium (`executablePath` verwenden, nicht `playwright install`). Viewport 360×740 und 320×640, Hell und Dunkel, Locale `de-DE`.
1. Keine Konsolenfehler, keine Requests an fremde Hosts.
2. **Offline**: Seite einmal laden, SW aktiv abwarten, dann `context.setOffline(true)`, neu laden: App startet, Training abhaken, Essen eintragen, Kalender nutzen. Danach wieder online, Daten noch da.
3. Installierbarkeit: Manifest valide, Icons erreichbar, SW kontrolliert die Seite, `beforeinstallprompt`/Lighthouse-PWA-Check oder gleichwertige Prüfung.
4. Update-Ablauf: zweite Version deployen (oder simulieren), Leiste „Neue Version bereit" erscheint, nach Tipp neue Version aktiv, **Daten bleiben erhalten**.
5. Trainingsablauf Tag A und B komplett (inkl. Plank mit `page.clock`), Kalender eintragen, Eintrag bearbeiten, Datum verschieben, Essen hinzufügen, bearbeiten, kopieren, löschen und Rückgängig. Essensrechnung prüfen: Beispiel 250 g Magerquark mit 67 kcal/12 g Protein pro 100 g ergibt 168 kcal und 30 g Protein.
6. Import des Altformats (Beispiel-JSON im Testordner ablegen) und Roundtrip Export/Import.
7. Kontaktbögen der Animationen (siehe 4.5) angesehen und für gut befunden. Zeige Mirko die Bögen oder beschreibe konkret, was du gesehen hast.
8. Kein horizontales Überlaufen bei 320 px.

## 7. Abschlussbericht an Mirko (kurz, deutsch)

- Live-URL.
- Anleitung für seine Freundin in 5 Schritten (Chrome öffnen, Link, Menü ⋮, „Installieren und Verknüpfung erstellen", alte Verknüpfung löschen), plus Hinweis, dass ihre alten Daten aus der claude.ai-Version per „Daten sichern" kopiert und in der neuen App unter „Wiederherstellen" eingefügt werden müssen, weil der Speicher pro Adresse getrennt ist.
- Was du geprüft hast und was nicht (z. B. kein echtes Huawei P30 verfügbar).
- Offene Punkte, die er manuell tun muss (z. B. Pages-Quelle).
- Wie man künftig Änderungen macht: „Sag Claude Code, was geändert werden soll, es committet, Actions deployed, die App zeigt beim nächsten Öffnen die Update-Leiste."
