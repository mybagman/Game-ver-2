import * as state from './state.js';
import { resetGame } from './game.js';
import { skipOpeningCinematic } from './openingCinematic.js';

const DOUBLE_TAP_WINDOW = 300; // milliseconds
const DASH_DURATION = 15; // frames (~250ms at 60fps)
const DASH_COOLDOWN = 30; // frames (~500ms at 60fps)
const DASH_SPEED_MULTIPLIER = 2.5; // 2.5x normal speed

export function setupInputHandlers() {
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    
    // Ignore key repeat events to prevent held keys from triggering dash
    if (e.repeat) {
      return;
    }
    
    // ESC key to skip cinematic
    if (e.key === "Escape" && state.cinematic && state.cinematic.playing) {
      skipOpeningCinematic();
      return;
    }
    
    if (key === "r") {
      if (state.gameOver) {
        resetGame();
      }
    }
    if (e.key === "ArrowUp") state.keys["arrowup"] = true;
    if (e.key === "ArrowDown") state.keys["arrowdown"] = true;
    if (e.key === "ArrowLeft") state.keys["arrowleft"] = true;
    if (e.key === "ArrowRight") state.keys["arrowright"] = true;

    // Detect double-tap for dash on WASD keys
    const now = Date.now();
    const movementKeys = ['w', 'a', 's', 'd'];
    if (movementKeys.includes(key)) {
      if (state.player.lastKeyPress.key === key && 
          (now - state.player.lastKeyPress.time) < DOUBLE_TAP_WINDOW &&
          state.player.dashCooldown === 0 &&
          !state.player.dashing) {
        // Trigger dash
        state.player.dashing = true;
        state.player.dashTimer = DASH_DURATION;
        state.player.dashCooldown = DASH_COOLDOWN;
      }
      state.player.lastKeyPress = { key, time: now };
    }

    state.keys[key] = true;
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (e.key === "ArrowUp") state.keys["arrowup"] = false;
    if (e.key === "ArrowDown") state.keys["arrowdown"] = false;
    if (e.key === "ArrowLeft") state.keys["arrowleft"] = false;
    if (e.key === "ArrowRight") state.keys["arrowright"] = false;

    state.keys[key] = false;
  });

  window.addEventListener("resize", () => {
    if (!state.canvas) return;
    state.canvas.width = window.innerWidth;
    state.canvas.height = window.innerHeight;
  });
}

export { DASH_SPEED_MULTIPLIER };
