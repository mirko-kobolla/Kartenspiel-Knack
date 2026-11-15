const faceColors = {
  U: "white",
  D: "yellow",
  F: "green",
  B: "blue",
  R: "red",
  L: "orange"
};

const faceNormals = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
  R: [1, 0, 0],
  L: [-1, 0, 0]
};

const faceElements = Object.fromEntries(
  [...document.querySelectorAll(".face")].map((face) => [face.dataset.face, face])
);
const stage = document.getElementById("cube-stage");
const moveCount = document.getElementById("move-count");
const undoButton = document.getElementById("undo-button");
const hintButton = document.getElementById("hint-button");
const hintMessage = document.getElementById("hint-message");
const algorithmInput = document.getElementById("algorithm-input");
const demoDialog = document.getElementById("notation-demo");

let stickers = [];
let moveHistory = [];
let movesMade = 0;
let viewX = -25;
let viewY = -36;
let drag = null;
let demoSnapshot = null;
let demoIndex = 0;

const demoSteps = [
  {
    notation: "R",
    move: "R",
    explanation: "R dreht die rechte Seite einmal im Uhrzeigersinn – von außen auf die rechte Seite geschaut."
  },
  {
    notation: "R'",
    move: "R'",
    explanation: "Das Apostroph bedeutet Gegendrehung. R' dreht rechts zurück; der Würfel ist wieder gelöst."
  },
  {
    notation: "F2",
    move: "F2",
    explanation: "Die 2 bedeutet eine halbe Drehung: Die Vorderseite dreht sich um 180 Grad."
  }
];

function createSolvedCube() {
  stickers = [];
  for (const [face, normal] of Object.entries(faceNormals)) {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        let position;
        if (face === "U") position = [col - 1, 1, 1 - row];
        if (face === "D") position = [col - 1, -1, row - 1];
        if (face === "F") position = [col - 1, 1 - row, 1];
        if (face === "B") position = [1 - col, 1 - row, -1];
        if (face === "R") position = [1, 1 - row, 1 - col];
        if (face === "L") position = [-1, 1 - row, col - 1];
        stickers.push({ position, normal: [...normal], color: faceColors[face] });
      }
    }
  }
  moveHistory = [];
  movesMade = 0;
  render();
}

function getFacelet(face, position) {
  const [x, y, z] = position;
  if (face === "F") return [(1 - y), x + 1];
  if (face === "B") return [(1 - y), 1 - x];
  if (face === "U") return [1 - z, x + 1];
  if (face === "D") return [z + 1, x + 1];
  if (face === "R") return [1 - y, 1 - z];
  return [1 - y, z + 1];
}

function render() {
  for (const [face, element] of Object.entries(faceElements)) {
    const tiles = Array.from({ length: 9 }, () => null);
    for (const sticker of stickers) {
      if (sticker.normal.join(",") !== faceNormals[face].join(",")) continue;
      const [row, col] = getFacelet(face, sticker.position);
      tiles[row * 3 + col] = sticker.color;
    }
    element.replaceChildren(...tiles.map((color) => {
      const tile = document.createElement("span");
      tile.className = `sticker sticker-${color}`;
      return tile;
    }));
  }

  moveCount.textContent = `${movesMade} ${movesMade === 1 ? "Zug" : "Züge"}`;
  undoButton.disabled = moveHistory.length === 0;
  hintButton.disabled = moveHistory.length === 0;

  if (isSolved()) {
    moveHistory = [];
    undoButton.disabled = true;
    hintButton.disabled = true;
    hintMessage.textContent = "Geschafft! Der Würfel ist wieder gelöst.";
  } else if (moveHistory.length) {
    hintMessage.textContent = "Bereit? Ich zeige dir den nächsten Schritt zurück zur Lösung.";
  } else {
    hintMessage.textContent = "Mische den Würfel, dann zeige ich dir den Weg zurück.";
  }
}

function isSolved() {
  return Object.entries(faceNormals).every(([face, normal]) => {
    const color = faceColors[face];
    return stickers.filter((sticker) => sticker.normal.join(",") === normal.join(","))
      .every((sticker) => sticker.color === color);
  });
}

function rotateClockwise(vector, axis) {
  const cross = [
    axis[1] * vector[2] - axis[2] * vector[1],
    axis[2] * vector[0] - axis[0] * vector[2],
    axis[0] * vector[1] - axis[1] * vector[0]
  ];
  const dot = axis[0] * vector[0] + axis[1] * vector[1] + axis[2] * vector[2];
  return axis.map((component, index) => component * dot - cross[index]);
}

function turnFace(face, clockwiseTurns) {
  const axis = faceNormals[face];
  for (let turn = 0; turn < clockwiseTurns; turn += 1) {
    for (const sticker of stickers) {
      const layer = sticker.position[0] * axis[0]
        + sticker.position[1] * axis[1]
        + sticker.position[2] * axis[2];
      if (layer !== 1) continue;
      sticker.position = rotateClockwise(sticker.position, axis);
      sticker.normal = rotateClockwise(sticker.normal, axis);
    }
  }
}

function inverseMove(move) {
  if (move.endsWith("2")) return move;
  return move.endsWith("'") ? move[0] : `${move}'`;
}

function applyMove(move, countAsMove = true) {
  const face = move[0];
  const turns = move.endsWith("2") ? 2 : move.endsWith("'") ? 3 : 1;
  turnFace(face, turns);
  if (countAsMove) {
    movesMade += 1;
    const previous = moveHistory[moveHistory.length - 1];
    if (previous && inverseMove(previous) === move) moveHistory.pop();
    else moveHistory.push(move);
  }
  render();
}

function parseAlgorithm(value) {
  const normalized = value.replace(/[’‘]/g, "'");
  const tokens = normalized.trim().split(/[\s,]+/).filter(Boolean);
  if (!tokens.length) return [];
  const valid = tokens.every((token) => /^[UDFBRL](?:2|')?$/.test(token));
  if (!valid) throw new Error("Bitte nur Züge wie R, U', F2 eingeben.");
  return tokens;
}

document.getElementById("move-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-move]");
  if (button) applyMove(button.dataset.move);
});

document.getElementById("algorithm-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const moves = parseAlgorithm(algorithmInput.value);
    for (const move of moves) applyMove(move);
    if (moves.length) algorithmInput.value = "";
  } catch (error) {
    hintMessage.textContent = error.message;
  }
});

document.getElementById("scramble-button").addEventListener("click", () => {
  const faces = Object.keys(faceNormals);
  let previousFace = "";
  for (let index = 0; index < 20; index += 1) {
    let face = faces[Math.floor(Math.random() * faces.length)];
    while (face === previousFace) face = faces[Math.floor(Math.random() * faces.length)];
    previousFace = face;
    const suffixes = ["", "'", "2"];
    applyMove(face + suffixes[Math.floor(Math.random() * suffixes.length)]);
  }
});

undoButton.addEventListener("click", () => {
  if (!moveHistory.length) return;
  applyMove(inverseMove(moveHistory[moveHistory.length - 1]), false);
  moveHistory.pop();
  render();
});

hintButton.addEventListener("click", () => {
  const nextMove = inverseMove(moveHistory[moveHistory.length - 1]);
  if (!nextMove) return;
  hintMessage.textContent = `Führe ${nextMove} aus – damit kommst du der Lösung näher.`;
  algorithmInput.value = nextMove;
});

document.getElementById("reset-button").addEventListener("click", createSolvedCube);

function updateDemoStep() {
  const progress = document.getElementById("demo-progress");
  const notation = document.getElementById("demo-notation");
  const explanation = document.getElementById("demo-explanation");
  const nextButton = document.getElementById("demo-next");

  if (demoIndex === 0) {
    progress.textContent = "BEREIT";
    notation.textContent = "R";
    explanation.textContent = "Starte die Demo: Der Würfel zeigt jeden Zug direkt an. Dein aktueller Spielstand bleibt erhalten.";
    nextButton.textContent = "Demo starten →";
    return;
  }

  const previousStep = demoSteps[demoIndex - 1];
  progress.textContent = `SCHRITT ${demoIndex} VON ${demoSteps.length}`;
  notation.textContent = previousStep.notation;
  explanation.textContent = previousStep.explanation;
  nextButton.textContent = demoIndex === demoSteps.length ? "Demo beenden ✓" : "Nächster Zug →";
}

document.getElementById("demo-open").addEventListener("click", () => {
  demoSnapshot = {
    stickers: stickers.map((sticker) => ({
      position: [...sticker.position],
      normal: [...sticker.normal],
      color: sticker.color
    })),
    moveHistory: [...moveHistory],
    movesMade
  };
  demoIndex = 0;
  createSolvedCube();
  updateDemoStep();
  demoDialog.showModal();
});

document.getElementById("demo-next").addEventListener("click", () => {
  if (demoIndex >= demoSteps.length) {
    demoDialog.close();
    return;
  }
  applyMove(demoSteps[demoIndex].move, false);
  demoIndex += 1;
  updateDemoStep();
});

document.getElementById("demo-restart").addEventListener("click", () => {
  createSolvedCube();
  demoIndex = 0;
  updateDemoStep();
});

document.getElementById("demo-close").addEventListener("click", () => demoDialog.close());
demoDialog.addEventListener("close", () => {
  if (!demoSnapshot) return;
  stickers = demoSnapshot.stickers;
  moveHistory = demoSnapshot.moveHistory;
  movesMade = demoSnapshot.movesMade;
  demoSnapshot = null;
  render();
});

stage.addEventListener("pointerdown", (event) => {
  const sticker = event.target.closest(".sticker");
  const faceElement = sticker && sticker.closest(".face");
  const face = faceElement && faceElement.dataset.face;
  drag = {
    x: event.clientX,
    y: event.clientY,
    startX: event.clientX,
    startY: event.clientY,
    pointerId: event.pointerId,
    face
  };
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", (event) => {
  if (!drag || drag.pointerId !== event.pointerId) return;
  if (drag.face) return;
  viewY += (event.clientX - drag.x) * 0.65;
  viewX -= (event.clientY - drag.y) * 0.65;
  viewX = Math.max(-85, Math.min(85, viewX));
  drag.x = event.clientX;
  drag.y = event.clientY;
  document.getElementById("cube").style.transform = `rotateX(${viewX}deg) rotateY(${viewY}deg)`;
});

stage.addEventListener("pointerup", (event) => {
  if (drag && drag.pointerId === event.pointerId && drag.face) {
    const swipeX = event.clientX - drag.startX;
    const swipeY = event.clientY - drag.startY;
    if (Math.hypot(swipeX, swipeY) >= 18) {
      const clockwise = Math.abs(swipeX) >= Math.abs(swipeY) ? swipeX > 0 : swipeY > 0;
      applyMove(drag.face + (clockwise ? "" : "'"));
    }
  }
  drag = null;
});

stage.addEventListener("pointercancel", () => { drag = null; });

createSolvedCube();
