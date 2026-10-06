# Trainings-Strichliste

Eine ruhige Trainings-App für alle, die sich schwer tun, anzufangen: Sie fragt **„Was möchtest du heute trainieren?“**, hilft Schritt für Schritt, ein Training zusammenzustellen, oder schlägt ein fertiges vor. Immer nur eine Übung im Fokus, grosse Knöpfe, Strichliste für die Sätze, automatische Pausen mit Timer, Halte-Timer, Kalender und Essens-Tracker. Die App läuft **ohne Internet** und speichert alle Daten **nur auf dem Handy**. Im Repo liegen nur Code und Übungstexte, keine persönlichen Daten.

## Was die App kann

* **Startfrage und Assistent:** Bereich antippen (Beine, Gesäss, Arme, Rücken, Bauch, Brust, Schultern, Nacken, Ganzkörper, auch mehrere), dann **Neues Training erstellen** (Ausrüstung → Zeit → Erfahrung → Vorschlag, den man anpassen, tauschen und erweitern kann) oder **Bestehendes Training wählen**. Dazu **„Wenig Lust? Nur 10 Minuten“** und **„Überrasch mich“**.
* **Übungsbibliothek mit 92 Übungen:** sortiert nach Bereichen und Gliedmassen (Oberschenkel, Unterschenkel, Gesäss, Oberarme, Unterarme, Rücken, Bauch, Brust, Schultern, Nacken, Ganzkörper). Eine Übung steht in jedem Bereich, den sie trainiert. Jede hat eine **Animation** (Strichfigur, auch „so nicht“ in Orange), „Darauf achten“, häufige Fehler, wo man es spürt und leichtere und schwerere Varianten.
* **Ausrüstung als Filter:** Fitnessstudio, Homegym, Zuhause, Unterwegs, Physiotherapie oder einzeln (Kurz- und Langhanteln, Kettlebell, Medizinball, Maschinen, Kabelzug, Bank, Kiste, Klimmzugstange, TRX, Band). „Passt zu meiner Ausrüstung“ blendet aus, was nicht geht; ein bestehendes Training lässt sich an die Ausrüstung anpassen.
* **Meine Trainings:** Eigene Trainings unter eigenem Namen speichern, bearbeiten, löschen (mit Rückgängig). **19 fertige Trainings** der App dauern 30 bis 90 Minuten; Tag A und Tag B der ersten Version sind unverändert dabei.
* **Essen:** Nährwerte **pro 100 g, pro 100 ml** oder für die ganze Menge, Tagesbilanz, Protein-Ziel.
* Schweizer Rechtschreibung (ss statt ß).

**Live:** https://mirkodim.github.io/Fitnesstracker/

## Auf dem Handy installieren (Android, Chrome)

1. Chrome öffnen und die Adresse oben eingeben.
2. Menü **⋮** antippen und **„Installieren“** wählen (je nach Chrome-Version steht dort **„Zum Startbildschirm hinzufügen“** und dann **„Installieren“**). Die App erscheint auf dem Startbildschirm und öffnet sich ab jetzt **ohne Browser-Tab und ohne Adressleiste**.
3. Alte Daten übernehmen: In der alten Version **„Daten sichern oder wiederherstellen“ → „Daten kopieren“**, dann in der neuen App im selben Menü den Text einfügen und **„Wiederherstellen“** tippen. Das ist nötig, weil der Speicher pro Adresse getrennt ist.
4. Im Kalender prüfen, ob die alten Einträge da sind.
5. Erst dann die alte Verknüpfung (die einen neuen Tab öffnet) löschen.

Den Text zur Sicherung kann man auch in eine Notiz legen. Zusätzlich gibt es **„Als Datei sichern“** und **„Aus Datei wiederherstellen“**. Eine Sicherung ersetzt die aktuellen Daten, deshalb fragt die App vorher nach, wenn schon etwas eingetragen ist.

## Änderungen veröffentlichen

Es gibt nichts zu installieren: Änderungen laufen über Git.

1. Claude Code sagen, was geändert werden soll. Es ändert die Dateien, führt die Tests aus und committet.
2. Der Stand kommt auf den Zweig **`main`**.
3. **GitHub Actions** baut die Seite, setzt eine neue Versionsnummer (Datum und Commit), prüft sie, veröffentlicht sie auf GitHub Pages und ruft die Live-Adresse zur Kontrolle ab (siehe `.github/workflows/pages.yml`).
4. Beim nächsten Öffnen der App erscheint unten die ruhige Leiste **„Neue Version bereit. Neu laden“**. Erst ein Tipp darauf lädt neu, nie mitten in einem Satz, einer Pause oder einem Plank. Die Daten bleiben dabei erhalten. Die Versionsnummer steht ganz unten in der App.

Einmalig nötig: In den Repo-Einstellungen unter *Settings → Pages → Build and deployment → Source* **„GitHub Actions“** wählen. Das Repo muss öffentlich sein, weil GitHub Pages auf kostenlosen Konten sonst nicht läuft.

Wenn ein Lauf nicht startet: GitHub lässt Jobs manchmal minutenlang auf *Queued* stehen, ohne dass es am Repo liegt (beim ersten Veröffentlichen kam das mehrfach vor). Dann im Tab *Actions* den Lauf öffnen, abbrechen und oben rechts **„Re-run failed jobs“** wählen. Dabei wird ein bereits fertiger Bau wiederverwendet; **„Re-run all jobs“** baut alles neu. Die veröffentlichte Seite bleibt in der Zwischenzeit unverändert.

## Daten und Datenschutz

* Alles liegt im `localStorage` des Geräts, Schlüssel `strichliste.v1`, mit Feld `schema`. Beim Laden wird jede Version über `migrate()` in das aktuelle Format gebracht und geprüft.
* Ein Training wird als **Momentaufnahme** gespeichert (Sätze und Gewicht pro Übung, Notiz). Im Kalender lässt es sich öffnen, ändern, auf ein anderes Datum verschieben und löschen (mit Rückgängig). Essen lässt sich antippen, ändern und auf heute oder einen anderen Tag kopieren.
* Beim Update und beim Wiederherstellen werden die alten Daten vorher unter einem zweiten Schlüssel beiseitegelegt (`strichliste.v1.schema1`, `strichliste.v1.before-restore`).
* Es gibt keine Anfragen an fremde Server: Schriften (Barlow, SIL Open Font License) liegen unter `fonts/`, nichts wird von CDNs geladen.
* Die App fragt beim Start still um dauerhaften Speicher (`navigator.storage.persist()`), damit Chrome die Daten nicht räumt.

Die medizinischen Hinweise sind bewusst vorsichtig: keine Diagnosen, keine Therapieversprechen, Kniefragen gehen an Physio und MTT.


## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Schale, Metadaten, Manifest-Link, Skripte |
| `styles.css` | Gestaltung (hell und dunkel automatisch, eigene Schriften) |
| `plan.js` | Daten: Bereiche, Ausrüstung, Voreinstellungen, Zeiten, Erfahrungsstufen, Nährwertfelder |
| `lib.js` | Die Übungsbibliothek: eine Zeile pro Übung mit Bereichen, Ausrüstung, Stufe, Sätzen und allen Texten |
| `trainings.js` | Die mitgelieferten Trainings (Tag A, Tag B und 19 Vorschläge) |
| `builder.js` | Reine Logik für „Neues Training“: Zeitschätzung, Vorschlag, Alternativen, Anpassen an die Ausrüstung |
| `store.js` | Reine Logik ohne Oberfläche: Zustand (Schema 3), Migration, eigene Trainings, Prüfung, Import, Essensrechnung |
| `app.js` | Oberfläche des Trainings, Kalender und Essen, Ereignisse, Timer, Service-Worker-Anbindung, Update-Leiste |
| `ui-flow.js` | Startfrage, Assistent, Editor, „Meine Trainings“ |
| `ui-lib.js` | Reiter „Übungen“ mit Suche, Bereichen und Detailseite |
| `fig.js` | Strichfiguren-Engine (Seiten- und Frontansicht, Requisiten, Vorschaubilder) |
| `anims.js` | Die Animation jeder Übung, Schlüsselposen wie bei den Texten in `lib.js` |
| `sw.js` | Service Worker: alles vorab speichern, dann zuerst aus dem Speicher; neue Version wartet auf den Tipp |
| `manifest.webmanifest`, `icons/` | Installierbarkeit (Symbole per Skript erzeugt) |
| `version.js` | Versionsnummer, wird beim Deploy gesetzt |
| `tools/` | Bauen (`build.mjs`), Prüfen (`check-site.mjs`), lokaler Server (`serve.mjs`), Icons, Kontaktbögen, Scan |
| `tests/` | Unit-Tests und Playwright-Tests |
| `reference/` | Vorlage der ersten Version (für den Vergleich in den Tests), nicht Teil der veröffentlichten Seite |

Alle Pfade sind relativ (`./…`), weil GitHub Pages unter `/<repo>/` läuft.

## Lokal arbeiten und testen

```bash
npm install                  # einmalig (Playwright und sharp als Entwicklungswerkzeuge)
npm run build                # baut _site/ (Version "dev")
npm run serve                # http://localhost:4173/Fitnesstracker/  (wie GitHub Pages unter einem Unterpfad)
npm run test:unit            # Logik, Migration, Vorschlags-Generator, Animationsgeometrie, Vergleich mit der Referenz
npm test                     # alles: Unit, Bauen, Prüfen, Browser-Tests
npm run sheets -- x-squat x-pullup   # Kontaktbögen der Animationen nach tests/out/ (zum Ansehen)
npm run icons                # Symbole neu erzeugen
```

Die Browser-Tests (Playwright) laufen mit dem vorhandenen Chromium (`CHROMIUM_PATH` oder `/opt/pw-browsers/chromium`), bei 360×740 und 320×640, hell und dunkel, Sprache `de-DE`. Sie prüfen unter anderem: keine Konsolenfehler und keine fremden Hosts, Offline-Start, Installierbarkeit (Chromes eigene Prüfung), den Update-Ablauf mit zwei echten Versionen, Tag A und B komplett inklusive Plank, den ganzen Weg von der Startfrage über den Assistenten bis zum gespeicherten und gestarteten Training, bestehende Trainings (Filter, Anpassen, Löschen mit Rückgängig), die Zurück-Taste des Handys, die Bibliothek, **die Animation jeder einzelnen Übung** (alle 92 werden abgespielt), Kalender und Essen bearbeiten (auch pro 100 ml), Import des Altformats, kein scharfes S in der Oberfläche, kein seitliches Überlaufen bei 320 px und Tippziele ab 48 px.

### Eine Übung oder ein Training ergänzen

1. In `lib.js` einen Eintrag hinzufügen (eindeutige Id, nie wiederverwenden oder entfernen: gespeicherte Trainings und der Kalender verweisen darauf).
2. In `anims.js` die Animation unter derselben Id zeichnen. `npm run sheets -- <id>` zeigt sie als Bild an, `npm run test:unit` prüft die Geometrie (Gliedlängen, Reichweite, Boden, Bildrand).
3. Ein fertiges Training kommt in `trainings.js`; seine Dauer (30 bis 90 Minuten) und die Übungen prüft `tests/unit/plan.test.mjs`.
4. Neue Dateien in `sw.js` (`PRECACHE`) und `tools/build.mjs` (`FILES`) eintragen.

Hinweise:

* `manifest.webmanifest` hat `id: "./"`. Chrome leitet daraus die Adresse des Besitzers (`…github.io/`) als App-Kennung ab. Wer unter derselben GitHub-Adresse eine zweite App veröffentlicht, sollte dort eine eigene `id` vergeben.
* Ein Service Worker aktualisiert sich nur, wenn sich `sw.js` ändert. Darum setzt der Deploy die Version in `sw.js` und `version.js`, und die Liste `PRECACHE` in `sw.js` muss jede neue Datei der Seite enthalten (das prüft `tools/check-site.mjs`).
