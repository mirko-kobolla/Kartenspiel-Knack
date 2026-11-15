# Google-AI-Studio-Version – technische Dokumentation

**Artefakt:** [`ai-studio/index.html`](../../ai-studio/index.html)
**Dokumentationsstand:** 2026-11-15
**Status:** Beschreibung der vorliegenden Implementierung; bei Abweichungen gilt der Code.

Die gemeinsame Wertung und die versionsübergreifenden Regeln stehen in [Spielregeln](../spielregeln.md). Dieses Dokument beschreibt ausschließlich Besonderheiten der Google-AI-Studio-Version.

## Aufbau und Laufzeit

- Die Anwendung ist eine einzelne HTML-Datei mit inline eingebettetem CSS und JavaScript.
- PeerJS 1.5.4 wird zur Laufzeit über ein externes CDN geladen. Die Mehrspieler-Verbindung verwendet WebRTC mit PeerJS-Signaling; es gibt keinen eigenen Anwendungsserver im Repository.
- Die Oberfläche ist responsiv für Desktop- und Mobilbrowser ausgelegt. Für Mehrspieler muss die Seite über HTTPS oder einen lokalen HTTP-Server geöffnet werden, damit die Browser WebRTC verwenden können. Auf iOS Safari die Seite nicht in der JavaScript-blockierenden Dateivorschau öffnen.

Die Viewport-Einstellungen erlauben Browser-Zoom. Die Mindestabstände des App-Rahmens berücksichtigen Display-Sicherheitsbereiche (z. B. Notch und Home-Indikator); `100vh` dient als Fallback für Browser ohne `100dvh`.

## Spielablauf und Zustand

Die Anwendung verwendet die Phasen `LOBBY`, `DEALER_CHOICE`, `PLAYING`, `SHOWDOWN` und `GAME_OVER`.

- Der Host ist selbst ein regulärer Spieler und verwaltet den autoritativen Spielzustand.
- Host und Clients verwenden dieselbe Spieloberfläche. Während einer laufenden Runde erhält jeder Spieler nur die eigene Hand; fremde Hände werden erst beim Aufdecken sichtbar.
- Der Spieler am Zug wird in der Spielerliste auf allen Geräten durch einen deutlich pulsierenden grünen Hintergrund und Leuchteffekt markiert. Bei aktivierter Systemeinstellung „Bewegung reduzieren“ bleibt die Markierung statisch.
- Die Geber-Entscheidung, Tauschaktionen, Schieben und Klopfen werden vom Host verarbeitet.
- Nach einem Umlauf, in dem alle aktiven Spieler geschoben haben, werden neue Karten in die Mitte gelegt.
- Nach dem Klopfen erhalten die übrigen aktiven Spieler jeweils noch einen Zug.
- KI-Spieler können vom Host hinzugefügt werden.

## Konfigurierbare Regeln und Bedienung

In der Host-Lobby sind folgende Regeln konfigurierbar:

| Option | Standard | Wirkung |
| --- | --- | --- |
| `mustSwapFirstRound` | An | Im ersten Zug eines Spielers pro Runde muss getauscht werden; Schieben und Klopfen sind gesperrt. |
| `swimmingEnabled` | An | Beim Verlust des letzten Lebens schwimmt der Spieler zunächst; ein weiterer Verlust scheidet ihn aus. |
| `fireEnabled` | An | Aktiviert die optionale Feuer-Regel. |
| `knockPenalty` | Aus | Ein Klopfer mit der niedrigsten Wertung verliert zwei Leben. |
| `popupMode` | `auto` | `auto`, `confirm` und `off` steuern die Zug-Popups. |

Die Oberfläche enthält außerdem ein Spielprotokoll, Auswahlfeedback für Karten sowie eine Aufdeck- und Ergebnisansicht.

## Netzwerk und Host-Wechsel

Die Nachrichten werden über PeerJS-Verbindungen übertragen. Zu den dokumentierten Nachrichtentypen zählen `JOIN`, `ACTION`, `STATE_SYNC`, `ANIM_CONTROL`, `CLAIM_HOST`, `ASSIGN_HOST`, `HOST_MIGRATION_READY` und `MIGRATE_TO_NEW_HOST`.

Nach `GAME_OVER` kann die Host-Rolle an einen anderen menschlichen Spieler übergeben werden. Der neue Host eröffnet einen neuen Peer-Raum; die verbundenen Clients wechseln in diesen Raum. Der Host-Wechsel erfolgt erst nach dem Spielende.

Wichtige Verhaltensanforderungen:

- Fremde Handkarten dürfen während `PLAYING` nicht im an Clients gesendeten Zustand offengelegt werden.
- Popup-Koordination muss mit der Zustandsübertragung synchron bleiben.
- Bots dürfen nicht handeln, solange eine Zug-Popup-Sequenz aktiv ist.
- Änderungen an der Tauschpflicht müssen Host-Logik, Bot-Logik und UI konsistent berücksichtigen.
- Touch-Auswahl darf durch innere SVG-Elemente der Karten nicht blockiert werden.

## Testen

1. Die Seite über einen lokalen HTTP-Server öffnen.
2. Ein Spiel hosten, einen Namen eingeben, einen KI-Spieler hinzufügen und ein Spiel starten.
3. In getrennten Browsern oder Geräten beitreten und Kartentausch, Schieben und Klopfen prüfen.
4. Einen Durchlauf mit `mustSwapFirstRound` und den anderen Hausregel-Kombinationen prüfen.
5. Nach `GAME_OVER` die Host-Übergabe testen.
6. Insbesondere auf iPad Safari Karten-Touch, Popup-Bestätigung und Wiederverbindung nach Host-Wechsel prüfen.

Für die responsive Sichtprüfung mindestens schmale Ansichten ab 320 CSS-Pixel sowie Desktop-Breiten und Hoch- und Querformat testen. Zusätzlich Browser-Zoom und bei iOS die Safe Areas prüfen. Viewport-Emulation in Chromium ersetzt keine Tests auf physischen Android- und Apple-Geräten; iOS Safari, reale Tastaturen, Hintergrundwechsel und herstellerspezifische Energiesparregeln müssen dort separat geprüft werden.

Es gibt derzeit keine automatisierte Test- oder Build-Konfiguration für diese HTML-Datei. Manuelle Prüfungen daher nicht als automatisierte Abdeckung oder als Nachweis physischer Gerätetests ausgeben.
