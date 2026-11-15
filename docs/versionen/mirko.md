# Mirko-Version – technische Dokumentation

**Artefakt:** [`Knack.html`](../../Knack.html)
**Dokumentationsstand:** 2026-11-15
**Status:** Beschreibung der vorliegenden Implementierung; bei Abweichungen gilt der Code.

Die gemeinsame Wertung und die versionsübergreifenden Regeln stehen in [Spielregeln](../spielregeln.md). Dieses Dokument beschreibt ausschließlich Besonderheiten der Mirko-Version.

## Aufbau und Laufzeit

- Die Anwendung ist eine einzelne HTML-Datei mit inline eingebettetem CSS und JavaScript.
- PeerJS 1.5.4 wird über ein externes CDN geladen. Die Seite beschreibt den Mehrspielerbetrieb über PeerJS ohne eigenen Anwendungsserver im Repository.
- Die Startansicht nennt iPads und Beamer als Zielgeräte.

## Spielablauf und Regeln

- Der Spielzustand wird auf der Host-Seite geführt; Host und Client haben getrennte Render- und Bedienpfade.
- Die Zustandsmaschine enthält mindestens `LOBBY`, `DEALER_CHOICE`, `PLAYING`, `SHOWDOWN` und `GAME_OVER`.
- Der Geber kann seine Hand behalten oder gegen die Reserve tauschen. Der Code prüft nach dem Austeilen auf Knack und – falls aktiviert – Feuer.
- In der Zugphase sind Einzeltausch, Gesamttausch, Schieben und Klopfen implementiert. Nach einem Umlauf mit Schieben werden neue Tischkarten ausgelegt; nach dem Klopfen erhalten die übrigen aktiven Spieler noch einen Zug.
- KI-Spieler, Ergebnisrangliste, Spielprotokoll und eine Schwimmen-Regel sind Bestandteil der Implementierung.

## Hausregel-Optionen

| Option | Standard | Wirkung |
| --- | --- | --- |
| `swimmingEnabled` | An | Beim Verlust des letzten Lebens schwimmt der Spieler zunächst; ein weiterer Verlust scheidet ihn aus. |
| `fireEnabled` | An | Aktiviert die optionale Feuer-Regel. |
| `knockPenalty` | Aus | Ein Klopfer mit der niedrigsten Wertung verliert zwei Leben. |

Im Unterschied zur Google-AI-Studio-Version sind in der aktuellen Mirko-Version keine Umschalter für die Tauschpflicht im ersten Zug oder die Zug-Popup-Modi dokumentiert.

## Netzwerk

PeerJS wird für den Beitritt von Clients, die Übermittlung von Aktionen und die Synchronisierung des Host-Zustands verwendet. Die Host-Seite verarbeitet Spieleraktionen und sendet aktualisierte Zustände an die Clients. Die detaillierte Nachrichtenstruktur ist direkt in [`Knack.html`](../../Knack.html) implementiert und sollte bei Protokolländerungen in dieser Dokumentation ergänzt werden.

## Testen

1. `Knack.html` in einem Browser öffnen und das Laden der externen PeerJS-Bibliothek prüfen.
2. Ein Spiel mit Host und mindestens einem weiteren Spieler starten.
3. Einzeltausch, Gesamttausch, Schieben, Klopfen, Aufdecken und Lebensverlust prüfen.
4. Schwimmen, Feuer und Klopfstrafe jeweils an- und ausgeschaltet durchspielen.
5. Prüfen, dass Clients während einer laufenden Runde keine fremden Handkarten sehen.

Für Mehrspieler- und geräteübergreifende Tests die Seite über HTTP bereitstellen und die Erreichbarkeit des PeerJS-Signaling-Dienstes sicherstellen.

Es gibt derzeit keine automatisierte Test- oder Build-Konfiguration für diese HTML-Datei.
