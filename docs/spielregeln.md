# Gemeinsame Spielregeln

**Status:** Arbeitsstand aus den beiden aktuellen Implementierungen abgeleitet; noch keine formale Freigabe als verbindliches Regelwerk.

Dieses Dokument hält den gemeinsamen fachlichen Kern fest. Es ist keine automatische Aussage darüber, dass jede Regel in beiden Webseiten identisch umgesetzt ist. Wo Optionen oder Abläufe abweichen, gelten für das jeweilige Produkt zunächst die [Mirko-Version](./versionen/mirko.md) beziehungsweise die [Google-AI-Studio-Version](./versionen/ai-studio.md). Bei Unklarheiten ist der aktuelle Programmcode maßgeblich, bis die Regel fachlich abgestimmt wurde.

## Karten und Wertung

- Gespielt wird mit einem 32er Skatblatt: 7, 8, 9, 10, Bube, Dame, König und Ass in Herz, Karo, Pik und Kreuz.
- Jeder Spieler wertet drei Handkarten.
- Es zählt die Summe der Karten einer einzelnen Farbe; maßgeblich ist die Farbe mit der höchsten Summe.
- Kartenwerte: Ass = 11; König, Dame, Bube und 10 = 10; 9, 8 und 7 zählen ihren Zahlenwert.
- Drei Karten desselben Rangs bilden einen Drilling und zählen 30,5 Punkte.
- Eine Hand mit 31 Punkten in einer Farbe heißt Knack. In den aktuellen Versionen beendet Knack die Runde sofort.
- Drei Asse heißen Feuer und zählen 33 Punkte. Feuer ist eine optionale Hausregel; ist sie aktiviert, endet die Runde sofort.

## Rundenprinzip

1. Zu Beginn werden die Hände und die offene Tischmitte für die Runde vorbereitet. Die konkrete Geber-Entscheidung ist versionsspezifisch dokumentiert.
2. Im eigenen Zug kann ein Spieler eine Karte oder alle drei Handkarten mit der offenen Tischmitte tauschen, schieben oder klopfen. Welche Aktionen wann erlaubt sind, kann von Hausregeln abhängen.
3. Nach dem Aufdecken verliert grundsätzlich der Spieler beziehungsweise verlieren die Spieler mit der niedrigsten Wertung ein Leben.
4. Bei einem Gleichstand aller aktiven Spieler verliert in beiden aktuellen Versionen niemand ein Leben.
5. Bei aktiviertem Feuer verlieren die übrigen aktiven Spieler ein Leben; der Spieler mit Feuer ist davon ausgenommen.

## Versionsspezifische Regeln

Die folgenden Hausregeln sind nicht als überall identische Vorgabe zu verstehen:

| Regel | Mirko | Google AI Studio |
| --- | --- | --- |
| Startleben | 3 | 3 |
| Schwimmen nach Verlust des letzten Lebens | Umschaltbar, standardmäßig an | Umschaltbar, standardmäßig an |
| Feuer (drei Asse) | Umschaltbar, standardmäßig an | Umschaltbar, standardmäßig an |
| Klopfstrafe bei niedrigster Wertung | Umschaltbar, standardmäßig aus | Umschaltbar, standardmäßig aus |
| Tauschen im ersten Zug verpflichtend | Nicht als Option in der aktuellen Implementierung dokumentiert | Umschaltbar, standardmäßig an |
| Zug-Popup-Modus | Nicht als Option in der aktuellen Implementierung dokumentiert | `auto`, `confirm` oder `off` |

Details zu Ablauf, Wertung und Bedienung stehen in den jeweiligen [Versionsdokumentationen](./versionen/).
