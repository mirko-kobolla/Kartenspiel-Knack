# ADR-0001: Zwei eigenständige Spielimplementierungen

- **Status:** Angenommen
- **Entscheidungsdatum:** 2026-11-15

## Kontext

Im Repository liegen zwei Webseiten zum Knack-Spiel: Mirkos bestehende Implementierung und eine parallel mit Google AI Studio erstellte Implementierung. Beide sind eigenständige HTML-Anwendungen und entwickeln sich nicht zwingend synchron.

## Entscheidung

Beide Webseiten bleiben vorerst als getrennte Implementierungen im Repository. Mirkos Datei bleibt im Repository-Stamm (`Knack.html`); die Google-AI-Studio-Version liegt unter `ai-studio/index.html`.

Gemeinsame fachliche Regeln werden in `docs/spielregeln.md` beschrieben. Technische Eigenschaften und abweichendes Verhalten werden je Version separat dokumentiert. Eine Regeländerung gilt nicht automatisch als in beiden Webseiten umgesetzt.

## Konsequenzen

- Änderungen an einer Version dürfen die andere nicht unbeabsichtigt überschreiben.
- Fachliche Regeländerungen müssen gegen beide Implementierungen geprüft werden.
- Die gemeinsame Regeldokumentation kennzeichnet noch nicht abgestimmte Punkte als Arbeitsstand.
- Eine spätere Zusammenführung oder Änderung der Ablage erfordert eine neue dokumentierte Entscheidung.
