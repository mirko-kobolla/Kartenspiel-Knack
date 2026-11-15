# Entwicklung und Dokumentationspflege

## Grundsätze

- Jede Webseite hat ihre eigene technische Dokumentation. Gemeinsame Spielregeln werden ausschließlich in [spielregeln.md](./spielregeln.md) gepflegt.
- Der Programmcode beschreibt das aktuell ausgelieferte Verhalten. Ist die Dokumentation dazu im Widerspruch, wird die Abweichung im selben Änderungssatz geklärt und dokumentiert.
- Regeländerungen, Hausregeln, Spielphasen, Netzwerkprotokolle, Datenschutz/Sichtbarkeit von Karten sowie lokale Test- oder Startanweisungen erfordern eine Prüfung der betroffenen Dokumentation.
- Reine Textkorrekturen ohne Auswirkung auf Verhalten benötigen keine Änderung der Spielregeln.
- Noch nicht abgestimmte Regeln sind als Vorschlag oder offener Punkt zu kennzeichnen, nicht als verbindliche Regel.

## Prüfliste für Änderungen

Vor Abschluss einer Änderung prüfen:

1. Ist die richtige Webseite geändert worden?
2. Bleibt die andere Implementierung unberührt, oder muss eine gemeinsame Regeländerung dort ebenfalls umgesetzt werden?
3. Sind gemeinsame Regeln, Versionsdokumentation und Einstiegstexte noch korrekt?
4. Stimmen relative Markdown-Links und referenzierte Dateien?
5. Wurden die betroffenen manuellen Tests ausgeführt und bekannte, nicht getestete Bereiche genannt?

## Manuelle Tests

Da die aktuellen Webseiten eigenständige HTML-Dateien ohne gemeinsames Test- oder Build-System sind, dokumentiert jede Version ihre passenden manuellen Prüfungen:

- [Google AI Studio: lokale und Mehrspieler-Tests](./versionen/ai-studio.md#testen)
- [Mirko: lokale und Mehrspieler-Tests](./versionen/mirko.md#testen)

Neue automatische Prüfungen sollen mit dem jeweiligen Code eingeführt und hier dokumentiert werden, statt erfolgreiche Tests nur anzunehmen.
