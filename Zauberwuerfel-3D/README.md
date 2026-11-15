# Zauberwürfel 3D

Eine eigenständige, lokal ausführbare Webseite zum Drehen und Lösen eines 3×3-Zauberwürfels.

## Start

`index.html` im Browser öffnen. Es werden keine Build-Schritte oder JavaScript-Abhängigkeiten benötigt.

## Bedienung

- Auf einem farbigen Stein starten und in die gewünschte Richtung ziehen. Die pulsierenden Farbfelder markieren mögliche Ebenen; während des Wischens werden Ebene und Zugrichtung angezeigt. Die Ziffernposition auf der Fläche und die Wischrichtung bestimmen den Zug. Auf der Orange/L-Seite gilt das Nummernfeld `7 8 9 / 4 5 6 / 1 2 3`: `9→7` = `U`, `7→9` = `U'`, `9→3` = `R'`, `3→9` = `R`, `7→1` = `L`, `1→7` = `L'`, `1→3` = `D`, `3→1` = `D'`. Von der Mitte aus führen `5→6` zu `E'`, `5→4` zu `E`, `5→8` zu `M'` und `5→2` zu `M`; die Mitte anklicken führt `F` aus, doppelklicken `F'`. Neben dem Würfel ziehen bewegt die 3D-Ansicht. Die **Notation-Demo** erklärt die Buchstaben und zeigt Beispielzüge am Würfel.
- Mit den Zugschaltflächen einzelne Seiten, mittlere Ebenen oder den ganzen Würfel drehen. Eine Folge wie `R U M' x F2` kann eingegeben werden. Die Züge werden nacheinander animiert; ein Richtungspfeil markiert die Drehung.
- **Mischen** führt 20 zufällige Züge aus. **Hinweis** schlägt jeweils den umgekehrten letzten Zug vor, sodass der dokumentierte Zugweg zurück zum gelösten Würfel führt.
- **Zurück** nimmt den letzten Zug zurück; **Zurücksetzen** stellt den gelösten Würfel wieder her.

## Zugnotation

Die Großbuchstaben `U`, `D`, `L`, `R`, `F` und `B` bezeichnen eine Würfelseite:

- `U` (*Up*) = oben, `D` (*Down*) = unten
- `L` (*Left*) = links, `R` (*Right*) = rechts
- `F` (*Front*) = vorne, `B` (*Back*) = hinten

Mittlere Ebenen und Würfelrotationen:

- `M` (*Middle*) = mittlere Ebene zwischen links und rechts, in Richtung `L`
- `E` (*Equator*) = mittlere Ebene zwischen oben und unten, in Richtung `D`
- `S` (*Standing*) = mittlere Ebene zwischen vorne und hinten, in Richtung `F`
- `x`, `y`, `z` drehen den ganzen Würfel um die jeweilige Achse, wie `R`, `U` bzw. `F`

Die Drehrichtung wird so bestimmt, als würdest du direkt auf die bezeichnete Seite schauen:

- `R` dreht die rechte Seite einmal im Uhrzeigersinn.
- `U'` dreht die obere Seite einmal gegen den Uhrzeigersinn. Das Apostroph (`'`) kennzeichnet die Gegendrehung.
- `M'`, `x'` usw. drehen den jeweiligen Zug gegenläufig.
- `F2` dreht die Vorderseite um 180 Grad. Die `2` steht für eine halbe Drehung und funktioniert bei allen Zügen.

Züge werden durch Leerzeichen oder Kommas getrennt, zum Beispiel: `R U R' U'` oder `M, x, F2`.
