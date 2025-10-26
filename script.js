const stage = document.querySelector('.stage');
const dino = document.getElementById('dino');
const obstacle = document.getElementById('obstacle');
const startButton = document.getElementById('start-button');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');

let isJumping = false;
let isPlaying = false;
let score = 0;
let speedMs = 1500;
let frameId = null;
let lastTime = null;
const SPEED_MIN = 700;
const SPEED_STEP = 40;

function loadHighScore() {
  try {
    const stored = localStorage.getItem('dino-high-score');
    const parsed = Number.parseInt(stored || '0', 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (error) {
    console.warn('Unable to load high score:', error);
    return 0;
  }
}

function persistHighScore(value) {
  try {
    localStorage.setItem('dino-high-score', value.toString());
  } catch (error) {
    console.warn('Unable to save high score:', error);
  }
}

let highScore = loadHighScore();
updateScore(0);
updateHighScore(highScore);

function updateScore(value) {
  score = value;
  scoreEl.textContent = Math.floor(score).toString();
}

function updateHighScore(value) {
  highScore = value;
  highScoreEl.textContent = highScore.toString();
  persistHighScore(highScore);
}

function startGame() {
  if (isPlaying) return;
  resetObstacle();
  stage.classList.remove('paused');
  startButton.classList.add('hidden');
  updateScore(0);
  speedMs = 1500;
  stage.style.setProperty('--speed', `${speedMs}ms`);
  isPlaying = true;
  lastTime = null;
  frameId = requestAnimationFrame(loop);
}

function endGame() {
  if (!isPlaying) return;
  isPlaying = false;
  stage.classList.add('paused');
  startButton.textContent = 'Play Again';
  startButton.classList.remove('hidden');
  cancelAnimationFrame(frameId);
  if (Math.floor(score) > highScore) {
    updateHighScore(Math.floor(score));
  }
  lastTime = null;
}

function loop(timestamp) {
  if (!isPlaying) return;
  frameId = requestAnimationFrame(loop);
  if (document.hidden) {
    lastTime = timestamp;
    return;
  }
  if (lastTime === null) {
    lastTime = timestamp;
    return;
  }
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  increaseDifficulty(delta);
  checkCollision();
  updateScore(score + delta / 100);
}

function increaseDifficulty(deltaMs) {
  if (speedMs <= SPEED_MIN) return;
  const decrement = (deltaMs / 1000) * SPEED_STEP;
  speedMs = Math.max(SPEED_MIN, speedMs - decrement);
  stage.style.setProperty('--speed', `${speedMs}ms`);
}

function checkCollision() {
  const dinoRect = dino.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  const isHorizontalOverlap =
    dinoRect.right - 10 > obstacleRect.left && obstacleRect.right > dinoRect.left + 10;
  const isVerticalOverlap = dinoRect.bottom > obstacleRect.top + 10;

  if (isHorizontalOverlap && isVerticalOverlap) {
    endGame();
  }
}

function resetObstacle() {
  obstacle.style.animation = 'none';
  // force reflow to restart animation
  void obstacle.offsetWidth; // eslint-disable-line no-unused-expressions
  obstacle.style.animation = '';
}

function jump() {
  if (isJumping || !isPlaying) return;
  isJumping = true;
  dino.classList.add('jump');
  setTimeout(() => {
    dino.classList.remove('jump');
    isJumping = false;
  }, 600);
}

function handleInput(event) {
  if (event.type === 'keydown') {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      if (!isPlaying) {
        startGame();
      }
      jump();
    }
  } else {
    if (!isPlaying) {
      startGame();
    }
    jump();
  }
}

startButton.addEventListener('click', startGame);
window.addEventListener('keydown', handleInput);
stage.addEventListener('pointerdown', handleInput);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stage.classList.add('paused');
  } else if (isPlaying) {
    stage.classList.remove('paused');
  }
});

stage.classList.add('paused');
startButton.classList.remove('hidden');
