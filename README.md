# Trainings-Strichliste

Kleine App zum Abhaken von zwei Trainingstagen (**Tag A** und **Tag B**): immer nur eine Übung im Fokus, grosse Knöpfe, Strichliste für die Sätze, automatische Pausen mit Timer, Plank-Timer, Kalender und Essens-Tracker. Die App läuft **ohne Internet** und speichert alle Daten **nur auf dem Handy**. Im Repo liegen nur Code und Übungstexte, keine persönlichen Daten.

**Live:** https://mirkodim.github.io/Fitnesstracker/

## Auf dem Handy installieren (Android, Chrome)

1. Chrome öffnen und die Adresse oben eingeben.
2. Menü **⋮** antippen und **„Installieren“** wählen (je nach Chrome-Version steht dort **„Zum Startbildschirm hinzufügen“** und dann **„Installieren“**).
3. Die App erscheint auf dem Startbildschirm und öffnet sich ab jetzt **ohne Browser-Tab und ohne Adressleiste**.
4. Die alte Verknüpfung (die einen neuen Tab öffnet) löschen.
5. Alte Daten übernehmen: In der alten Version **„Daten sichern oder wiederherstellen“ → „Daten kopieren“**, dann in der neuen App im selben Menü den Text einfügen und **„Wiederherstellen“** tippen. Das ist nötig, weil der Speicher pro Adresse getrennt ist.

Den Text zur Sicherung kann man auch in eine Notiz legen. Zusätzlich gibt es **„Als Datei sichern“** und **„Aus Datei wiederherstellen“**. Eine Sicherung ersetzt die aktuellen Daten, deshalb fragt die App vorher nach, wenn schon etwas eingetragen ist.

## Änderungen veröffentlichen

Es gibt nichts zu installieren: Änderungen laufen über Git.

1. Claude Code sagen, was geändert werden soll. Es ändert die Dateien, führt die Tests aus und committet.
2. Der Stand kommt auf den Zweig **`main`**.
3. **GitHub Actions** baut die Seite, setzt eine neue Versionsnummer (Datum und Commit), prüft sie, veröffentlicht sie auf GitHub Pages und ruft die Live-Adresse zur Kontrolle ab (siehe `.github/workflows/pages.yml`).
4. Beim nächsten Öffnen der App erscheint unten die ruhige Leiste **„Neue Version bereit. Neu laden“**. Erst ein Tipp darauf lädt neu, nie mitten in einem Satz, einer Pause oder einem Plank. Die Daten bleiben dabei erhalten. Die Versionsnummer steht ganz unten in der App.

Einmalig nötig: In den Repo-Einstellungen unter *Settings → Pages → Build and deployment → Source* **„GitHub Actions“** wählen. Das Repo muss öffentlich sein, weil GitHub Pages auf kostenlosen Konten sonst nicht läuft.

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
| `plan.js` | Daten: Trainingsplan, Hinweistexte, Nährwertfelder |
| `store.js` | Reine Logik ohne Oberfläche: Zustand, Migration, Prüfung, Import, Essensrechnung |
| `app.js` | Oberfläche, Ereignisse, Timer, Service-Worker-Anbindung, Update-Leiste |
| `fig.js` | Strichfiguren-Engine und Übungsanimationen |
| `sw.js` | Service Worker: alles vorab speichern, dann zuerst aus dem Speicher; neue Version wartet auf den Tipp |
| `manifest.webmanifest`, `icons/` | Installierbarkeit (Symbole per Skript erzeugt) |
| `version.js` | Versionsnummer, wird beim Deploy gesetzt |
| `tools/` | Bauen (`build.mjs`), Prüfen (`check-site.mjs`), lokaler Server (`serve.mjs`), Icons, Kontaktbögen, Scan |
| `tests/` | Unit-Tests und Playwright-Tests |
| `reference/`, `PROMPT.md`, `ANLEITUNG.md` | Vorlage und Auftrag, nicht Teil der veröffentlichten Seite |

Alle Pfade sind relativ (`./…`), weil GitHub Pages unter `/<repo>/` läuft.

## Lokal arbeiten und testen

```bash
npm install                  # einmalig (Playwright und sharp als Entwicklungswerkzeuge)
npm run build                # baut _site/ (Version "dev")
npm run serve                # http://localhost:4173/Fitnesstracker/  (wie GitHub Pages unter einem Unterpfad)
npm run test:unit            # Logik, Migration, Animationsgeometrie, Vergleich mit der Referenz
npm test                     # alles: Unit, Bauen, Prüfen, Browser-Tests
npm run sheets -- a-hip a-tri   # Kontaktbögen der Animationen nach tests/out/ (zum Ansehen)
npm run icons                # Symbole neu erzeugen
```

Die Browser-Tests (Playwright) laufen mit dem vorhandenen Chromium (`CHROMIUM_PATH` oder `/opt/pw-browsers/chromium`), bei 360×740 und 320×640, hell und dunkel, Sprache `de-DE`. Sie prüfen unter anderem: keine Konsolenfehler und keine fremden Hosts, Offline-Start, Installierbarkeit (Chromes eigene Prüfung), den Update-Ablauf mit zwei echten Versionen, Tag A und B komplett inklusive Plank, Kalender und Essen bearbeiten, Import des Altformats, kein seitliches Überlaufen bei 320 px und Tippziele ab 48 px.

Hinweise:

* `manifest.webmanifest` hat `id: "./"`. Chrome leitet daraus die Adresse des Besitzers (`…github.io/`) als App-Kennung ab. Wer unter derselben GitHub-Adresse eine zweite App veröffentlicht, sollte dort eine eigene `id` vergeben.
* Ein Service Worker aktualisiert sich nur, wenn sich `sw.js` ändert. Darum setzt der Deploy die Version in `sw.js` und `version.js`, und die Liste `PRECACHE` in `sw.js` muss jede neue Datei der Seite enthalten (das prüft `tools/check-site.mjs`).
