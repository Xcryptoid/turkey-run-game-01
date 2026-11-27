// Keyboard and mouse, one place. The game reads these flags every step; the
// loop never touches the DOM events itself.
export class Input {
  constructor(canvas, onAction) {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this.slideHeld = false;
    this.onAction = onAction;
    this.jumpQueued = false;

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.left = true;
          event.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.right = true;
          event.preventDefault();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.jumpHeld = true;
          this.jumpQueued = true;
          this.onAction('jump');
          event.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.slideHeld = true;
          event.preventDefault();
          break;
        case 'KeyP':
          this.onAction('pause');
          break;
        case 'KeyR':
          this.onAction('restart');
          break;
        case 'KeyM':
          this.onAction('mute');
          break;
        case 'Enter':
          this.onAction('start');
          break;
        default:
          break;
      }
    });
    window.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.jumpHeld = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.slideHeld = false;
          break;
        default:
          break;
      }
    });
    canvas.addEventListener('pointerdown', () => {
      this.jumpQueued = true;
      this.onAction('jump');
    });
  }

  /** -1, 0 or 1: which way the turkey steers this step. */
  steer() {
    if (this.left && !this.right) return -1;
    if (this.right && !this.left) return 1;
    return 0;
  }

  /** True once for each jump press, then cleared. */
  takeJump() {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }
}
