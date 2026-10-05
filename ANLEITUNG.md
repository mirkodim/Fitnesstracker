# Anleitung für Mirko

## Was ist im Paket
- `PROMPT.md`: der komplette Auftrag für Claude Code (Plan inkl. Hip Thrust, korrigierter TRX-Trizeps, PWA/Offline, GitHub Pages, Tests).
- `reference/page.html` und `reference/fig.js`: die aktuelle, getestete Version als Vorlage.

## So startest du es
1. Auf GitHub ein neues, **öffentliches** Repo anlegen (z. B. `strichliste`). Öffentlich ist nötig, weil GitHub Pages auf kostenlosen Konten sonst nicht geht. Im Repo steht nur Code, keine persönlichen Daten.
2. Den Inhalt dieses Pakets ins Repo hochladen (GitHub: *Add file → Upload files*, oder lokal `git init`, committen, pushen). Die Datei `PROMPT.md` muss im Hauptordner liegen, `reference/` daneben.
3. Claude Code auf diesem Repo starten und schreiben:
   „Lies PROMPT.md vollständig und setze den Auftrag um. Arbeite bis zum Live-Deploy auf GitHub Pages und führe alle Tests aus."
4. Falls Claude Code meldet, dass Pages nicht aktiviert werden konnte: *Settings → Pages → Source: GitHub Actions* einstellen und Claude Code sagen, es soll den Deploy neu starten.

## Danach bei deiner Freundin
Neue Adresse im Chrome öffnen, Menü ⋮, „Installieren und Verknüpfung erstellen". Dann öffnet sich die App ohne Browser-Tab. Die alte Verknüpfung kann sie löschen. Ihre bisherigen Daten gehen nicht automatisch mit, weil der Speicher pro Adresse getrennt ist: In der alten App „Daten sichern oder wiederherstellen → Daten kopieren", in der neuen App „Wiederherstellen" und einfügen.

## Warum die jetzige Verknüpfung einen neuen Tab öffnet
Chrome macht aus einer normalen Webseite nur ein Lesezeichen auf dem Startbildschirm. Erst mit Manifest und Service Worker (siehe Auftrag) wird daraus eine installierte Web-App, die im eigenen Fenster startet und offline läuft. Das geht nicht von einer claude.ai-Artifact-Adresse aus, deshalb der Umzug auf GitHub Pages.

## Ausrüstung und Hip Thrust
Alles Nötige ist laut deinen Fotos da: Rack, Langhantel mit Polster, Scheiben, Bank, Kurzhanteln. Bank vor dem Satz an Wand oder Rack schieben. Beinvolumen: Tag A hat jetzt Kniebeuge plus Hip Thrust (6 Beinsätze), Tag B Kreuzheben plus Ausfallschritte (6 Sätze). Mit Physio/MTT besprechen, ob das für das Knie passt.
