const STORAGE_KEY = 'dino-high-score';

export class Scoreboard {
  constructor(scoreElement, highScoreElement, storage = window.localStorage) {
    this.scoreElement = scoreElement;
    this.highScoreElement = highScoreElement;
    this.storage = storage;
    this.currentScore = 0;
    this.highScore = 0;
  }

  initialize() {
    this.highScore = this.loadHighScore();
    this.setScore(0);
    this.updateHighScoreDisplay();
  }

  get score() {
    return this.currentScore;
  }

  setScore(value) {
    this.currentScore = value;
    this.scoreElement.textContent = Math.floor(this.currentScore).toString();
  }

  addScore(delta) {
    this.setScore(this.currentScore + delta);
  }

  resetScore() {
    this.setScore(0);
  }

  updateHighScoreIfNeeded() {
    const flooredScore = Math.floor(this.currentScore);
    if (flooredScore > this.highScore) {
      this.setHighScore(flooredScore);
    }
  }

  setHighScore(value) {
    this.highScore = value;
    this.updateHighScoreDisplay();
    this.persistHighScore(value);
  }

  updateHighScoreDisplay() {
    this.highScoreElement.textContent = this.highScore.toString();
  }

  loadHighScore() {
    try {
      const stored = this.storage?.getItem?.(STORAGE_KEY);
      const parsed = Number.parseInt(stored ?? '0', 10);
      return Number.isFinite(parsed) ? parsed : 0;
    } catch (error) {
      console.warn('Unable to load high score:', error);
      return 0;
    }
  }

  persistHighScore(value) {
    try {
      this.storage?.setItem?.(STORAGE_KEY, value.toString());
    } catch (error) {
      console.warn('Unable to save high score:', error);
    }
  }
}
