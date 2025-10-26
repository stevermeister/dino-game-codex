const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);
const CROUCH_KEYS = new Set(['ArrowDown', 'KeyS']);

export function registerControls({ game, stage, startButton }) {
  function handleStartClick() {
    game.start();
  }

  function handleKeyDown(event) {
    if (JUMP_KEYS.has(event.code)) {
      event.preventDefault();
      if (!game.isRunning()) {
        game.start();
      }
      game.jump();
    } else if (CROUCH_KEYS.has(event.code)) {
      event.preventDefault();
      if (!game.isRunning()) {
        game.start();
      }
      game.startCrouch();
    }
  }

  function handleKeyUp(event) {
    if (CROUCH_KEYS.has(event.code)) {
      event.preventDefault();
      game.stopCrouch();
    }
  }

  function handlePointerDown(event) {
    if (!event.isPrimary || event.target.closest('#start-button')) {
      return;
    }

    event.preventDefault();

    if (!game.isRunning()) {
      game.start();
    }

    if (!game.isRunning()) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    const isLowerHalf = event.clientY > rect.top + rect.height / 2;
    if (isLowerHalf) {
      game.startCrouch();
    } else {
      game.jump();
    }
  }

  function handlePointerUp(event) {
    if (!event.isPrimary) {
      return;
    }
    event.preventDefault();
    game.stopCrouch();
  }

  startButton.addEventListener('click', handleStartClick);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  stage.addEventListener('pointerdown', handlePointerDown);
  stage.addEventListener('pointerup', handlePointerUp);
  stage.addEventListener('pointerleave', handlePointerUp);
  stage.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('blur', () => game.handleBlur());
}
