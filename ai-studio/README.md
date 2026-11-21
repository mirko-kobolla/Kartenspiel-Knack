# Google-AI-Studio-Version

Die spielbare Webseite liegt in [`index.html`](./index.html). Sie ist eine eigenständige Single-File-Web-App mit inline eingebettetem HTML, CSS und JavaScript.

## Lokal testen

1. `ai-studio/index.html` in VS Code öffnen.
2. Die Datei über einen lokalen HTTP-Server im Browser bereitstellen. Für Mehrspieler-Tests müssen die Geräte außerdem den PeerJS-Signaling-Dienst erreichen können.
3. Zum Testen auf einem iPad Safari verwenden; die iOS-Dateivorschau kann JavaScript blockieren.

## Dokumentation

- [Gemeinsame Spielregeln](../docs/spielregeln.md)
- [Technische Dokumentation und Testhinweise](../docs/versionen/ai-studio.md)
- [Dokumentations- und Entwicklungsprozess](../docs/entwicklung.md)

Bei Änderungen an Regeln, Spielablauf oder Netzwerkverhalten die passende Dokumentation im selben Änderungssatz aktualisieren.

Dokumentation: Wenn du die Änderungen noch festhalten möchtest, ergänze den Eintrag in docs/versionen/ai-studio.md kurz um die beiden Punkte:
- Interaktives Feedback via aria-disabled und Toasts für „Schieben“ / „Klopfen“.
- Sticky Mobile Action-Dock mit Safe-Area-Padding und kompaktem Spielfeld.
Auf dem Android-Handy sollte sich das Spiel jetzt so direkt, reaktionsschnell und frustfrei bedienen lassen wie eine native App!