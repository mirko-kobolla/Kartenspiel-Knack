# Zauberwürfel 3D

Eine eigenständige, lokal ausführbare Webseite zum Drehen und Lösen eines 3×3-Zauberwürfels.

## Start

`index.html` im Browser öffnen. Es werden keine Build-Schritte oder JavaScript-Abhängigkeiten benötigt.

## Bedienung

- Auf einem farbigen Stein starten und wischen: nach rechts/unten dreht die Ebene im Uhrzeigersinn, nach links/oben dagegen. Neben dem Würfel ziehen bewegt die 3D-Ansicht. Die **Notation-Demo** erklärt die Buchstaben und zeigt Beispielzüge am Würfel.
- Mit den Zugschaltflächen einzelne Seiten drehen oder eine Folge wie `R U R' U'` eingeben.
- **Mischen** führt 20 zufällige Züge aus. **Hinweis** schlägt jeweils den umgekehrten letzten Zug vor, sodass der dokumentierte Zugweg zurück zum gelösten Würfel führt.
- **Zurück** nimmt den letzten Zug zurück; **Zurücksetzen** stellt den gelösten Würfel wieder her.

## Zugnotation

Jeder Buchstabe bezeichnet eine Würfelseite:

- `U` (*Up*) = oben, `D` (*Down*) = unten
- `L` (*Left*) = links, `R` (*Right*) = rechts
- `F` (*Front*) = vorne, `B` (*Back*) = hinten

Die Drehrichtung wird so bestimmt, als würdest du direkt auf die bezeichnete Seite schauen:

- `R` dreht die rechte Seite einmal im Uhrzeigersinn.
- `U'` dreht die obere Seite einmal gegen den Uhrzeigersinn. Das Apostroph (`'`) kennzeichnet die Gegendrehung.
- `F2` dreht die Vorderseite um 180 Grad. Die `2` steht für eine halbe Drehung.

Züge werden durch Leerzeichen getrennt, zum Beispiel: `R U R' U'`.
