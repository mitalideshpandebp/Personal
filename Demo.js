const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const statusText = document.getElementById("status");
const levelDisplay = document.getElementById("levelDisplay");

// Define colors and positions
const colors = ["red", "blue", "green", "yellow", "pink", "purple", "orange", "brown"];
const triangles = []; // Store the vertices of each triangle

// Canvas center coordinates
const centerX = 200;
const centerY = 200;
const radiusOuter = 200;

// Angle between each vertex (45 degrees for an octagon)
const angleStep = Math.PI / 4;

// Calculate vertices for each triangular tile
for (let i = 0; i < 8; i++) {
  const angle = angleStep * i;

  // Outer vertices for the base of the triangle
  const outer1 = {
    x: centerX + radiusOuter * Math.cos(angle),
    y: centerY + radiusOuter * Math.sin(angle),
  };
  const outer2 = {
    x: centerX + radiusOuter * Math.cos(angle + angleStep),
    y: centerY + radiusOuter * Math.sin(angle + angleStep),
  };

  // Inner vertex for the apex of the triangle (pointing to the center)
  const inner = { x: centerX, y: centerY };

  // Push the triangle's vertices to the triangles array
  triangles.push([outer1, outer2, inner]);
}

function drawTriangle(vertices, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  ctx.lineTo(vertices[1].x, vertices[1].y);
  ctx.lineTo(vertices[2].x, vertices[2].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Game variables
let sequence = [];
let playerSequence = [];
let isPlayerTurn = false; // Toggle player turn
let flashDelay = 1000; // Flash delay between steps

// Start the game
startButton.addEventListener("click", startGame);

function startGame() {
  sequence = [];
  playerSequence = [];
  isPlayerTurn = false;
  statusText.textContent = "Watch the sequence!";
  levelDisplay.textContent = `Level: ${sequence.length + 1}`;
  addNewStep();
  playSequence();
  startButton.disabled = true;
}

function addNewStep() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  sequence.push(randomIndex);
  levelDisplay.textContent = `Level: ${sequence.length}`;
}

// Flash a triangle
function flashColor(index) {
  const vertices = triangles[index];
  const color = colors[index];

  ctx.fillStyle = color;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  ctx.lineTo(vertices[1].x, vertices[1].y);
  ctx.lineTo(vertices[2].x, vertices[2].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setTimeout(() => {
    drawBoard();
  }, flashDelay / 2);
}

// Play the sequence
function playSequence() {
  isPlayerTurn = false;
  statusText.textContent = "Watch the sequence!";

  sequence.forEach((index, i) => {
    setTimeout(() => {
      flashColor(index);
    }, i * flashDelay);
  });

  setTimeout(() => {
    isPlayerTurn = true;
    playerSequence = [];
    statusText.textContent = "Your turn!";
  }, sequence.length * flashDelay);
}

// Draw the game board
function drawBoard() {
  triangles.forEach((vertices, index) => {
    drawTriangle(vertices, colors[index]);
  });
}

// Draw the initial board
drawBoard();

// Check if a point is inside a triangle
function isPointInTriangle(px, py, triangle) {
  const [v1, v2, v3] = triangle;

  const v0 = { x: v3.x - v1.x, y: v3.y - v1.y };
  const v1v = { x: v2.x - v1.x, y: v2.y - v1.y };
  const v2p = { x: px - v1.x, y: py - v1.y };

  const dot00 = v0.x * v0.x + v0.y * v0.y;
  const dot01 = v0.x * v1v.x + v0.y * v1v.y;
  const dot02 = v0.x * v2p.x + v0.y * v2p.y;
  const dot11 = v1v.x * v1v.x + v1v.y * v1v.y;
  const dot12 = v1v.x * v2p.x + v1v.y * v2p.y;

  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  return u >= 0 && v >= 0 && u + v <= 1;
}

// Handle player clicks
function handleClick(event) {
  if (!isPlayerTurn) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = 0; i < triangles.length; i++) {
    const triangle = triangles[i];
    if (isPointInTriangle(x, y, triangle)) {
      flashColor(i);
      playerSequence.push(i);

      if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
        gameOver();
        return;
      }

      if (playerSequence.length === sequence.length) {
        statusText.textContent = "Good job! Watch the next sequence!";
        setTimeout(() => {
          addNewStep();
          playSequence();
        }, 1000);
      }
      break;
    }
  }
}

canvas.addEventListener("click", handleClick);

// Handle game over
function gameOver() {
  statusText.textContent = `Game Over! You cleared level: ${sequence.length - 1}`;
  startButton.disabled = false;
  isPlayerTurn = false;
}
