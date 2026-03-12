const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");
const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnPause = document.getElementById("btn-pause");

const gridSize = 20; // размер одной клетки
let tileCount;

let snake;
let food;
let velocity;
let nextVelocity;
let score;
let gameLoopId;
let gameOver = false;
let paused = false;

function setupCanvasSize() {
  const viewportSize = Math.min(window.innerWidth, window.innerHeight);
  const maxSize = 420;
  const minSize = 260;
  const targetSize = Math.min(maxSize, Math.max(minSize, viewportSize - 40));

  const tiles = Math.floor(targetSize / gridSize);
  canvas.width = tiles * gridSize;
  canvas.height = tiles * gridSize;
  tileCount = tiles;
}

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  velocity = { x: 1, y: 0 };
  nextVelocity = { ...velocity };
  score = 0;
  gameOver = false;
  paused = false;
  spawnFood();
  scoreEl.textContent = score;

  if (gameLoopId) {
    clearInterval(gameLoopId);
  }
  gameLoopId = setInterval(gameStep, 110);
}

function spawnFood() {
  while (true) {
    const x = Math.floor(Math.random() * tileCount);
    const y = Math.floor(Math.random() * tileCount);
    const onSnake = snake.some((segment) => segment.x === x && segment.y === y);
    if (!onSnake) {
      food = { x, y };
      return;
    }
  }
}

function gameStep() {
  if (gameOver) return;
  if (paused) {
    draw();
    drawPauseOverlay();
    return;
  }

  // применяем новое направление (после проверки на противоположное)
  velocity = { ...nextVelocity };

  const head = { ...snake[0] };
  head.x += velocity.x;
  head.y += velocity.y;

  // проход сквозь стены (тор)
  if (head.x < 0) head.x = tileCount - 1;
  if (head.x >= tileCount) head.x = 0;
  if (head.y < 0) head.y = tileCount - 1;
  if (head.y >= tileCount) head.y = 0;

  // столкновение с собой
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // еда
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // фон
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // сетка (лёгкая)
  ctx.strokeStyle = "rgba(15,23,42,0.6)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize + 0.5, 0);
    ctx.lineTo(i * gridSize + 0.5, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * gridSize + 0.5);
    ctx.lineTo(canvas.width, i * gridSize + 0.5);
    ctx.stroke();
  }

  // еда
  const gradient = ctx.createRadialGradient(
    (food.x + 0.5) * gridSize,
    (food.y + 0.5) * gridSize,
    2,
    (food.x + 0.5) * gridSize,
    (food.y + 0.5) * gridSize,
    gridSize / 1.2
  );
  gradient.addColorStop(0, "#f97316");
  gradient.addColorStop(1, "#b45309");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(
    food.x * gridSize + 3,
    food.y * gridSize + 3,
    gridSize - 6,
    gridSize - 6,
    5
  );
  ctx.fill();

  // змейка
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    const baseX = segment.x * gridSize;
    const baseY = segment.y * gridSize;

    const segGradient = ctx.createLinearGradient(
      baseX,
      baseY,
      baseX + gridSize,
      baseY + gridSize
    );
    if (isHead) {
      segGradient.addColorStop(0, "#22c55e");
      segGradient.addColorStop(1, "#16a34a");
    } else {
      segGradient.addColorStop(0, "#15803d");
      segGradient.addColorStop(1, "#166534");
    }

    ctx.fillStyle = segGradient;
    ctx.beginPath();
    ctx.roundRect(
      baseX + 2,
      baseY + 2,
      gridSize - 4,
      gridSize - 4,
      isHead ? 6 : 4
    );
    ctx.fill();

    if (isHead) {
      // глаза
      ctx.fillStyle = "#020617";
      const eyeSize = 3;
      const offsetX = velocity.x !== 0 ? (velocity.x > 0 ? 4 : -4) : 0;
      const eyeYTop = baseY + gridSize / 2 - 4;
      const eyeYBottom = baseY + gridSize / 2 + 1;
      const eyeX = baseX + gridSize / 2 + offsetX;

      ctx.beginPath();
      ctx.arc(eyeX, eyeYTop, eyeSize, 0, Math.PI * 2);
      ctx.arc(eyeX, eyeYBottom, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawPauseOverlay() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, canvas.height / 2 - 32, canvas.width, 64);

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "bold 24px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Пауза", canvas.width / 2, canvas.height / 2 + 6);
}

function setDirection(dx, dy) {
  if (dx !== 0 && velocity.x === -dx) return;
  if (dy !== 0 && velocity.y === -dy) return;
  nextVelocity = { x: dx, y: dy };
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoopId);

  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "bold 26px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Игра окончена", canvas.width / 2, canvas.height / 2 - 4);

  ctx.font = "14px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(
    "Нажмите «Заново», чтобы начать снова",
    canvas.width / 2,
    canvas.height / 2 + 20
  );
}

function handleKeyDown(e) {
  const key = e.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    setDirection(0, -1);
  } else if (key === "arrowdown" || key === "s") {
    setDirection(0, 1);
  } else if (key === "arrowleft" || key === "a") {
    setDirection(-1, 0);
  } else if (key === "arrowright" || key === "d") {
    setDirection(1, 0);
  } else if (key === " ") {
    if (gameOver) return;
    paused = !paused;
    if (paused) {
      draw();
      drawPauseOverlay();
    }
  }
}

document.addEventListener("keydown", handleKeyDown);
restartBtn.addEventListener("click", resetGame);

if (btnUp && btnDown && btnLeft && btnRight && btnPause) {
  const onDirButton = (dx, dy) => {
    if (gameOver || paused) return;
    setDirection(dx, dy);
  };

  btnUp.addEventListener("click", () => onDirButton(0, -1));
  btnDown.addEventListener("click", () => onDirButton(0, 1));
  btnLeft.addEventListener("click", () => onDirButton(-1, 0));
  btnRight.addEventListener("click", () => onDirButton(1, 0));

  btnPause.addEventListener("click", () => {
    if (gameOver) return;
    paused = !paused;
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    if (paused) {
      draw();
      drawPauseOverlay();
    }
  });
}

// Старт
setupCanvasSize();
resetGame();

window.addEventListener("resize", () => {
  setupCanvasSize();
  resetGame();
});
