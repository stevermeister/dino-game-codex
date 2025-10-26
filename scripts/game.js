import { SPEED_INITIAL, SPEED_MIN, SPEED_STEP } from './constants.js';

export class Game {
  constructor({ stage, dino, obstacleManager, startButton, scoreboard, audio }) {
    this.stage = stage;
    this.dino = dino;
    this.obstacleManager = obstacleManager;
    this.startButton = startButton;
    this.scoreboard = scoreboard;
    this.audio = audio;

    this.isPlaying = false;
    this.isJumping = false;
    this.isCrouching = false;
    this.speedMs = SPEED_INITIAL;
    this.frameId = null;
    this.lastTime = null;
    this.hitTimeoutId = null;

    this.loop = this.loop.bind(this);
  }

  initialize() {
    this.scoreboard.initialize();
    this.stage.classList.add('paused');
    this.startButton.classList.remove('hidden');
    this.stage.style.setProperty('--speed', `${this.speedMs}ms`);
    this.obstacleManager.randomize(this.scoreboard.score);
  }

  isRunning() {
    return this.isPlaying;
  }

  start() {
    if (this.isPlaying) {
      return;
    }

    if (this.hitTimeoutId) {
      clearTimeout(this.hitTimeoutId);
      this.hitTimeoutId = null;
    }

    this.stopCrouch();
    this.scoreboard.resetScore();
    this.obstacleManager.resetAnimation(this.scoreboard.score);
    this.audio.ensureAudio();

    this.stage.classList.remove('paused', 'hit');
    this.startButton.classList.add('hidden');

    this.speedMs = SPEED_INITIAL;
    this.stage.style.setProperty('--speed', `${this.speedMs}ms`);

    this.isPlaying = true;
    this.lastTime = null;
    this.frameId = requestAnimationFrame(this.loop);
    this.audio.playStartSound();
  }

  end() {
    if (!this.isPlaying) {
      return;
    }

    this.isPlaying = false;
    this.stage.classList.add('paused');
    this.startButton.textContent = 'Play Again';
    this.startButton.classList.remove('hidden');
    cancelAnimationFrame(this.frameId);
    this.stopCrouch();

    this.stage.classList.remove('hit');
    // force reflow to restart hit animation
    void this.stage.offsetWidth; // eslint-disable-line no-unused-expressions
    this.stage.classList.add('hit');

    this.hitTimeoutId = setTimeout(() => {
      this.stage.classList.remove('hit');
      this.hitTimeoutId = null;
    }, 400);

    this.scoreboard.updateHighScoreIfNeeded();
    this.lastTime = null;
    this.audio.playHitSound();
  }

  loop(timestamp) {
    if (!this.isPlaying) {
      return;
    }

    this.frameId = requestAnimationFrame(this.loop);

    if (document.hidden) {
      this.lastTime = timestamp;
      return;
    }

    if (this.lastTime === null) {
      this.lastTime = timestamp;
      return;
    }

    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.increaseDifficulty(delta);
    this.checkCollision();
    this.scoreboard.addScore(delta / 100);
  }

  increaseDifficulty(deltaMs) {
    if (this.speedMs <= SPEED_MIN) {
      return;
    }
    const decrement = (deltaMs / 1000) * SPEED_STEP;
    this.speedMs = Math.max(SPEED_MIN, this.speedMs - decrement);
    this.stage.style.setProperty('--speed', `${this.speedMs}ms`);
  }

  checkCollision() {
    const dinoRect = this.dino.getBoundingClientRect();
    const obstacleRect = this.obstacleManager.getBoundingClientRect();

    const isHorizontalOverlap =
      dinoRect.right - 10 > obstacleRect.left && obstacleRect.right > dinoRect.left + 10;
    const isVerticalOverlap =
      dinoRect.bottom - 8 > obstacleRect.top && dinoRect.top + 8 < obstacleRect.bottom;

    if (!(isHorizontalOverlap && isVerticalOverlap)) {
      return;
    }

    const type = this.obstacleManager.getType();
    if (type === 'bird' && this.isCrouching) {
      const hasClearance = dinoRect.top + 12 >= obstacleRect.bottom;
      if (hasClearance) {
        return;
      }
    }

    this.end();
  }

  jump() {
    if (this.isJumping || !this.isPlaying) {
      return;
    }

    if (this.isCrouching) {
      this.stopCrouch();
    }

    this.isJumping = true;
    this.dino.classList.add('jump');
    this.audio.playJumpSound();

    setTimeout(() => {
      this.dino.classList.remove('jump');
      this.isJumping = false;
    }, 600);
  }

  startCrouch() {
    if (this.isCrouching || !this.isPlaying || this.isJumping) {
      return;
    }
    this.isCrouching = true;
    this.dino.classList.add('crouch');
  }

  stopCrouch() {
    if (!this.isCrouching) {
      return;
    }
    this.isCrouching = false;
    this.dino.classList.remove('crouch');
  }

  handleVisibilityChange(isHidden) {
    if (isHidden) {
      this.stage.classList.add('paused');
      this.stopCrouch();
    } else if (this.isPlaying) {
      this.stage.classList.remove('paused');
    }
  }

  handleBlur() {
    this.stopCrouch();
  }
}
