# Google-AI-Studio-Version – technische Dokumentation

**Artefakt:** [`ai-studio/index.html`](../../ai-studio/index.html)
**Dokumentationsstand:** 2026-11-16
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
- Der Offline-Demo-Modus beginnt mit einer kompakten Regelerklärung und startet anschließend ein Spiel ausschließlich mit Bots. Die Bot-Züge laufen absichtlich langsamer und erklären jeweils die Entscheidung sowie die verfügbaren Aktionen; Aufdeckungen erläutern die Wertung und den Lebensverlust. Nach jeder Runde startet die Demo automatisch die nächste, bis eine Siegerehrung möglich ist.
- Die Oberfläche kann über die ständig verfügbare Sprachauswahl auf Deutsch, Englisch, Französisch, Spanisch oder Italienisch umgestellt werden. Deutsch ist die Standardsprache; die Auswahl wird im lokalen Browser gespeichert. Spielernamen und Karten bleiben unverändert.
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

Die Nachrichten werden über PeerJS-Verbindungen übertragen. Zu den dokumentierten Nachrichtentypen zählen `JOIN`, `STATE_REQUEST`, `STATE_SYNC`, `ACTION`, `ANIM_CONTROL`, `CLAIM_HOST`, `ASSIGN_HOST`, `HOST_MIGRATION_READY` und `MIGRATE_TO_NEW_HOST`.

### Wiederverbindung nach Netzwerkunterbrechungen

- Host und Clients versuchen nach einem PeerJS-Signaling-Abbruch mit exponentiellem Backoff und derselben Peer-ID erneut zu verbinden. `online`- und `visibilitychange`-Ereignisse lösen beim Zurückkehren in den Browser einen sofortigen erneuten Versuch aus.
- Bestehende WebRTC-Datenverbindungen werden bei einem reinen Signaling-Abbruch nicht absichtlich geschlossen.
- Clients senden beim Beitritt ein zufälliges sitzungsgebundenes Wiederbeitritts-Token. Es wird in `sessionStorage` gespeichert, nur an den Host übermittelt und nicht im Spielzustand an andere Spieler verteilt. Der Host ordnet einen erneuten Beitritt dem bestehenden Spieler zu und synchronisiert den aktuellen Zustand.
- Ein neuer Client wiederholt einen zunächst nicht erreichbaren Raum dreimal, bevor er „Raum nicht gefunden“ meldet. Bei bereits beigetretenen Clients laufen Wiederbeitrittsversuche mit begrenztem Backoff weiter.
- Ein getrenntes Lobby-Mitglied bleibt bis zu zwei Minuten reserviert. Während eines Spiels erhält ein getrennter Spieler 30 Sekunden zum Wiederbeitritt; danach übernimmt die bestehende Bot-/Autozug-Logik, bis die Verbindung wiederhergestellt ist.
- Bei Rückkehr in den Vordergrund fordert ein Client den aktuellen Zustand erneut an, wenn seine direkte Datenverbindung noch offen ist.
- Wenn der PeerJS-Server die Raum-ID nach einem Abbruch noch als belegt führt, behält der Host den Spielzustand und versucht dieselbe ID erneut zu registrieren. Die App startet dafür kein neues Spiel.
- Diese Wiederherstellung setzt voraus, dass die Host-Seite und ihr Spielzustand im Arbeitsspeicher erhalten bleiben. Wird der Browserprozess beendet oder die Host-Seite neu geladen, gibt es weiterhin keine persistente Spielstand-Wiederherstellung oder automatische Host-Übernahme.

Nach `GAME_OVER` kann die Host-Rolle an einen anderen menschlichen Spieler übergeben werden. Der neue Host eröffnet einen neuen Peer-Raum; die verbundenen Clients wechseln in diesen Raum. Der Host-Wechsel erfolgt erst nach dem Spielende.

Wichtige Verhaltensanforderungen:

- Fremde Handkarten dürfen während `PLAYING` nicht im an Clients gesendeten Zustand offengelegt werden.
- Popup-Koordination muss mit der Zustandsübertragung synchron bleiben.
- Bots dürfen nicht handeln, solange eine Zug-Popup-Sequenz aktiv ist.
- Änderungen an der Tauschpflicht müssen Host-Logik, Bot-Logik und UI konsistent berücksichtigen.
- Touch-Auswahl darf durch innere SVG-Elemente der Karten nicht blockiert werden.

## Testen

1. Über **DEMO ansehen** ein Bot-Spiel ohne Netzwerkverbindung starten; Geber-Entscheidung, Zug-Erklärungen, Aufdeckung und automatischen Rundenwechsel prüfen.
2. Die Seite über einen lokalen HTTP-Server öffnen.
3. Ein Spiel hosten, einen Namen eingeben, einen KI-Spieler hinzufügen und ein Spiel starten.
4. In getrennten Browsern oder Geräten beitreten und Kartentausch, Schieben und Klopfen prüfen.
5. Einen Durchlauf mit `mustSwapFirstRound` und den anderen Hausregel-Kombinationen prüfen.
6. Nach `GAME_OVER` die Host-Übergabe testen.
7. Auf Android Chrome und iPad Safari zusätzlich folgende Wiederverbindungen prüfen: Host kurz in den Hintergrund wechseln und zurückkehren, WLAN kurz trennen/wiederherstellen sowie einen Client im Hintergrund lassen und erneut aktivieren. Raum-ID, Spielerzahl, Bot-Zustand, aktuelle Runde und Handkarten müssen erhalten bleiben; ein wiederbeitretender Client darf nicht doppelt erscheinen.
8. Insbesondere auf iPad Safari Karten-Touch und Popup-Bestätigung prüfen.
9. Die Sprachauswahl auf Start-, Setup-, Lobby-, Spiel-, Demo-, Popup- und Ergebnisansicht wechseln; zusätzlich prüfen, ob die Auswahl nach einem Neuladen erhalten bleibt.

Für die responsive Sichtprüfung mindestens schmale Ansichten ab 320 CSS-Pixel sowie Desktop-Breiten und Hoch- und Querformat testen. Zusätzlich Browser-Zoom und bei iOS die Safe Areas prüfen. Viewport-Emulation in Chromium ersetzt keine Tests auf physischen Android- und Apple-Geräten; iOS Safari, reale Tastaturen, Hintergrundwechsel und herstellerspezifische Energiesparregeln müssen dort separat geprüft werden.

Es gibt derzeit keine automatisierte Test- oder Build-Konfiguration für diese HTML-Datei. Manuelle Prüfungen daher nicht als automatisierte Abdeckung oder als Nachweis physischer Gerätetests ausgeben.
