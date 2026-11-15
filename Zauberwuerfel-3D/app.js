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

const faceBasis = {
  U: { right: [1, 0, 0], up: [0, 0, -1] },
  D: { right: [1, 0, 0], up: [0, 0, 1] },
  F: { right: [1, 0, 0], up: [0, 1, 0] },
  B: { right: [-1, 0, 0], up: [0, 1, 0] },
  R: { right: [0, 0, -1], up: [0, 1, 0] },
  L: { right: [0, 0, 1], up: [0, 1, 0] }
};

const faceElements = Object.fromEntries(
  [...document.querySelectorAll(".face")].map((face) => [face.dataset.face, face])
);
const cube = document.getElementById("cube");
const stage = document.getElementById("cube-stage");
const moveCount = document.getElementById("move-count");
const undoButton = document.getElementById("undo-button");
const hintButton = document.getElementById("hint-button");
const hintMessage = document.getElementById("hint-message");
const algorithmInput = document.getElementById("algorithm-input");
const demoDialog = document.getElementById("notation-demo");
const gestureFeedback = document.getElementById("gesture-feedback");
const gestureMessage = document.getElementById("gesture-message");
const gestureArrow = document.getElementById("gesture-arrow");

let stickers = [];
let moveHistory = [];
let movesMade = 0;
let viewX = -25;
let viewY = -36;
let drag = null;
let centerClickTimer = null;
let centerClickFace = "";
let demoSnapshot = null;
let demoIndex = 0;
let operationQueue = Promise.resolve();

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
  },
  {
    notation: "M",
    move: "M",
    explanation: "M dreht die mittlere Ebene zwischen links und rechts. Die Richtung entspricht L."
  },
  {
    notation: "x",
    move: "x",
    explanation: "Das kleine x dreht den ganzen Würfel um die x-Achse, in Richtung eines R-Zugs."
  }
];

function createSolvedCube() {
  stickers = [];
  for (const [face, normal] of Object.entries(faceNormals)) {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        let position;
        if (face === "U") position = [col - 1, 1, row - 1];
        if (face === "D") position = [col - 1, -1, 1 - row];
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
  if (face === "U") return [z + 1, x + 1];
  if (face === "D") return [1 - z, x + 1];
  if (face === "R") return [1 - y, 1 - z];
  return [1 - y, z + 1];
}

function getGestureCandidates(index, face) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const horizontal = row === 0 ? "U" : row === 1 ? "E" : "D";
  const vertical = col === 0 ? "L" : col === 1 ? "M" : "R";
  return index === 4 ? [horizontal, vertical, face] : [horizontal, vertical];
}

function getCenterMove(face) {
  return face === "L" ? "F" : face;
}

function getGestureGuide(index, face) {
  const [horizontal, vertical] = getGestureCandidates(index, face);
  const centerMove = getCenterMove(face);
  const centerAction = index === 4 ? ` · Klick ${centerMove}, Doppelklick ${centerMove}'` : "";
  return `Waagrecht: ${horizontal} · senkrecht: ${vertical}${centerAction}.`;
}

function activateCenter(face) {
  if (centerClickTimer && centerClickFace === face) {
    clearTimeout(centerClickTimer);
    centerClickTimer = null;
    centerClickFace = "";
    applyMove(`${face}'`);
    return;
  }
  if (centerClickTimer) {
    clearTimeout(centerClickTimer);
    applyMove(centerClickFace);
  }
  centerClickFace = face;
  centerClickTimer = setTimeout(() => {
    centerClickTimer = null;
    centerClickFace = "";
    applyMove(face);
  }, 350);
}

function getGestureMove(index, face, swipeX, swipeY) {
  const swipe = [swipeX, swipeY];
  const right = screenVector(faceBasis[face].right);
  const up = screenVector(faceBasis[face].up);
  const determinant = right[0] * up[1] - up[0] * right[1];
  let horizontalSwipe;
  let verticalSwipe;
  if (Math.abs(determinant) > 0.0001) {
    horizontalSwipe = (swipe[0] * up[1] - up[0] * swipe[1]) / determinant;
    verticalSwipe = (right[0] * swipe[1] - swipe[0] * right[1]) / determinant;
  } else {
    horizontalSwipe = swipe[0] * right[0] + swipe[1] * right[1];
    verticalSwipe = swipe[0] * up[0] + swipe[1] * up[1];
  }

  const row = Math.floor(index / 3);
  const col = index % 3;
  if (Math.abs(horizontalSwipe) >= Math.abs(verticalSwipe)) {
    const move = row === 0 ? "U" : row === 1 ? "E" : "D";
    const inverse = row === 2 ? horizontalSwipe < 0 : horizontalSwipe > 0;
    return move + (inverse ? "'" : "");
  }

  const move = col === 0 ? "L" : col === 1 ? "M" : "R";
  const inverse = col === 2 ? verticalSwipe < 0 : verticalSwipe > 0;
  return move + (inverse ? "'" : "");
}

function isInMoveLayer(position, move) {
  const { axis, type } = getMoveSpec(move);
  const layer = position[0] * axis[0] + position[1] * axis[1] + position[2] * axis[2];
  return type === "slice" ? layer === 0 : type === "face" && layer === 1;
}

function clearGestureHighlight() {
  for (const face of Object.values(faceElements)) {
    for (const tile of face.children) {
      tile.classList.remove("sticker-gesture-candidate", "sticker-gesture-selected");
    }
  }
}

function highlightMoveLayers(moves, selectedMove = null) {
  clearGestureHighlight();
  for (const face of Object.values(faceElements)) {
    for (const tile of face.children) {
      const position = tile.dataset.position.split(",").map(Number);
      const containingMoves = moves.filter((move) => isInMoveLayer(position, move));
      if (selectedMove && isInMoveLayer(position, selectedMove)) {
        tile.classList.add("sticker-gesture-selected");
      } else if (containingMoves.length) {
        tile.classList.add("sticker-gesture-candidate");
      }
    }
  }
}

function clearGesturePreview() {
  clearGestureHighlight();
  gestureFeedback.dataset.active = "false";
  gestureArrow.textContent = "";
  gestureMessage.textContent = "Mittelpunkt: Klick für den Zug, Doppelklick für den Gegenzug.";
}

function render() {
  for (const [face, element] of Object.entries(faceElements)) {
    const tiles = Array.from({ length: 9 }, () => null);
    for (const sticker of stickers) {
      if (sticker.normal.join(",") !== faceNormals[face].join(",")) continue;
      const [row, col] = getFacelet(face, sticker.position);
      const tile = document.createElement("span");
      tile.className = `sticker sticker-${sticker.color}`;
      tile.dataset.position = sticker.position.join(",");
      if (sticker.position.every((coordinate, index) => coordinate === faceNormals[face][index])) {
        tile.classList.add("sticker-center");
        tile.dataset.notation = face;
      }
      tiles[row * 3 + col] = tile;
    }
    element.replaceChildren(...tiles);
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
    const faceStickers = stickers.filter((sticker) => sticker.normal.join(",") === normal.join(","));
    const center = faceStickers.find((sticker) => (
      sticker.position.every((coordinate, index) => coordinate === normal[index])
    ));
    return center && faceStickers.every((sticker) => sticker.color === center.color);
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

function moveBase(move) {
  return move.endsWith("2") || move.endsWith("'") ? move.slice(0, -1) : move;
}

function getMoveSpec(move) {
  const base = moveBase(move);
  if (base === "x") return { axis: faceNormals.R, type: "rotation", animationAxis: "X" };
  if (base === "y") return { axis: faceNormals.U, type: "rotation", animationAxis: "Y" };
  if (base === "z") return { axis: faceNormals.F, type: "rotation", animationAxis: "Z" };
  if (base === "M") return { axis: faceNormals.L, type: "slice", animationFace: "L" };
  if (base === "E") return { axis: faceNormals.D, type: "slice", animationFace: "D" };
  if (base === "S") return { axis: faceNormals.F, type: "slice", animationFace: "F" };
  return { axis: faceNormals[base], type: "face", animationFace: base };
}

function turnMove(move) {
  const { axis, type } = getMoveSpec(move);
  const clockwiseTurns = move.endsWith("2") ? 2 : move.endsWith("'") ? 3 : 1;
  for (let turn = 0; turn < clockwiseTurns; turn += 1) {
    for (const sticker of stickers) {
      const layer = sticker.position[0] * axis[0]
        + sticker.position[1] * axis[1]
        + sticker.position[2] * axis[2];
      const shouldTurn = type === "rotation"
        || (type === "slice" && layer === 0)
        || (type === "face" && layer === 1);
      if (!shouldTurn) continue;
      sticker.position = rotateClockwise(sticker.position, axis);
      sticker.normal = rotateClockwise(sticker.normal, axis);
    }
  }
}

function inverseMove(move) {
  if (move.endsWith("2")) return move;
  const base = moveBase(move);
  return move.endsWith("'") ? base : `${base}'`;
}

function enqueueOperation(operation) {
  const nextOperation = operationQueue.then(operation);
  operationQueue = nextOperation.catch((error) => {
    hintMessage.textContent = `Drehung fehlgeschlagen: ${error.message}`;
  });
  return operationQueue;
}

async function animateMove(move) {
  const moveSpec = getMoveSpec(move);
  const angle = move.endsWith("2") ? 180 : move.endsWith("'") ? -90 : 90;
  if (moveSpec.type === "rotation") {
    const baseTransform = getComputedStyle(cube).transform;
    const animation = cube.animate(
      [
        { transform: baseTransform },
        { transform: `${baseTransform} rotate${moveSpec.animationAxis}(${angle}deg)` }
      ],
      { duration: 360, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
    );
    await animation.finished;
    animation.cancel();
    return;
  }

  const face = faceElements[moveSpec.animationFace];
  const overlay = face.cloneNode(true);
  overlay.classList.add("turn-overlay");
  overlay.dataset.turn = move.endsWith("'") ? "counterclockwise" : "clockwise";

  const baseTransform = getComputedStyle(face).transform;
  const offsetTransform = `${baseTransform} translateZ(1px)`;
  cube.append(overlay);

  const animation = overlay.animate(
    [
      { transform: `${offsetTransform} rotateZ(0deg)` },
      { transform: `${offsetTransform} rotateZ(${angle}deg)` }
    ],
    { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
  );
  await animation.finished;
  overlay.remove();
}

async function applyMoveNow(move, countAsMove = true) {
  await animateMove(move);
  turnMove(move);
  if (countAsMove) {
    movesMade += 1;
    const previous = moveHistory[moveHistory.length - 1];
    if (previous && inverseMove(previous) === move) moveHistory.pop();
    else moveHistory.push(move);
  }
  render();
}

function applyMove(move, countAsMove = true) {
  return enqueueOperation(() => applyMoveNow(move, countAsMove));
}

function parseAlgorithm(value) {
  const normalized = value.replace(/[’‘]/g, "'");
  const tokens = normalized.trim().split(/[\s,]+/).filter(Boolean);
  if (!tokens.length) return [];
  const valid = tokens.every((token) => /^(?:[UDFBRL]|[MESxyz])(?:2|')?$/.test(token));
  if (!valid) throw new Error("Erlaubt sind U D F B L R, M E S und x y z mit optionalem ' oder 2.");
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
  enqueueOperation(async () => {
    if (!moveHistory.length) return;
    await applyMoveNow(inverseMove(moveHistory[moveHistory.length - 1]), false);
    moveHistory.pop();
    render();
  });
});

hintButton.addEventListener("click", () => {
  enqueueOperation(() => {
    const lastMove = moveHistory[moveHistory.length - 1];
    if (!lastMove) return;
    const nextMove = inverseMove(lastMove);
    hintMessage.textContent = `Führe ${nextMove} aus – damit kommst du der Lösung näher.`;
    algorithmInput.value = nextMove;
  });
});

document.getElementById("reset-button").addEventListener("click", () => {
  enqueueOperation(createSolvedCube);
});

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
  enqueueOperation(() => {
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
});

document.getElementById("demo-next").addEventListener("click", () => {
  enqueueOperation(async () => {
    if (demoIndex >= demoSteps.length) {
      demoDialog.close();
      return;
    }
    await applyMoveNow(demoSteps[demoIndex].move, false);
    demoIndex += 1;
    updateDemoStep();
  });
});

document.getElementById("demo-restart").addEventListener("click", () => {
  enqueueOperation(() => {
    createSolvedCube();
    demoIndex = 0;
    updateDemoStep();
  });
});

document.getElementById("demo-close").addEventListener("click", () => demoDialog.close());
demoDialog.addEventListener("close", () => {
  if (!demoSnapshot) return;
  enqueueOperation(() => {
    stickers = demoSnapshot.stickers;
    moveHistory = demoSnapshot.moveHistory;
    movesMade = demoSnapshot.movesMade;
    demoSnapshot = null;
    render();
  });
});

function screenVector(vector) {
  const radiansX = viewX * Math.PI / 180;
  const radiansY = viewY * Math.PI / 180;
  const rotatedY = [
    Math.cos(radiansY) * vector[0] + Math.sin(radiansY) * vector[2],
    vector[1],
    -Math.sin(radiansY) * vector[0] + Math.cos(radiansY) * vector[2]
  ];
  const rotatedX = [
    rotatedY[0],
    Math.cos(radiansX) * rotatedY[1] - Math.sin(radiansX) * rotatedY[2],
    Math.sin(radiansX) * rotatedY[1] + Math.cos(radiansX) * rotatedY[2]
  ];
  return [rotatedX[0], -rotatedX[1]];
}

stage.addEventListener("pointerdown", (event) => {
  const sticker = event.target.closest(".sticker");
  const faceElement = sticker && sticker.closest(".face");
  const face = faceElement && faceElement.dataset.face;
  const gridIndex = sticker && faceElement ? [...faceElement.children].indexOf(sticker) : -1;
  drag = {
    x: event.clientX,
    y: event.clientY,
    startX: event.clientX,
    startY: event.clientY,
    pointerId: event.pointerId,
    face,
    gridIndex,
    candidates: face ? getGestureCandidates(gridIndex, face) : [],
    previewMove: null
  };
  if (face) {
    highlightMoveLayers(drag.candidates);
    gestureFeedback.dataset.active = "true";
    gestureMessage.textContent = getGestureGuide(gridIndex, face);
  }
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", (event) => {
  if (!drag || drag.pointerId !== event.pointerId) return;
  if (drag.face) {
    const swipeX = event.clientX - drag.startX;
    const swipeY = event.clientY - drag.startY;
    if (Math.hypot(swipeX, swipeY) < 8) {
      drag.previewMove = null;
      highlightMoveLayers(drag.candidates);
      gestureArrow.textContent = "";
      gestureMessage.textContent = getGestureGuide(drag.gridIndex, drag.face);
      return;
    }
    const move = getGestureMove(drag.gridIndex, drag.face, swipeX, swipeY);
    if (!move) return;
    drag.previewMove = move;
    highlightMoveLayers(drag.candidates, move);
    gestureArrow.textContent = move.endsWith("'") ? "↺" : "↻";
    gestureMessage.textContent = `Zug ${move} – loslassen zum Drehen.`;
    return;
  }
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
    const distance = Math.hypot(swipeX, swipeY);
    if (distance >= 18) {
      const move = drag.previewMove
        || getGestureMove(drag.gridIndex, drag.face, swipeX, swipeY);
      if (move) applyMove(move);
    } else if (distance < 8 && drag.gridIndex === 4) {
      activateCenter(getCenterMove(drag.face));
    }
  }
  clearGesturePreview();
  drag = null;
});

stage.addEventListener("pointercancel", () => {
  clearGesturePreview();
  drag = null;
});

createSolvedCube();
