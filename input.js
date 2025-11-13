import * as state from './state.js';
import { resetGame } from './game.js';
import { skipOpeningCinematic } from './openingCinematic.js';

const DOUBLE_TAP_WINDOW = 300; // milliseconds
const DASH_DURATION = 15; // frames (~250ms at 60fps)
const DASH_COOLDOWN = 30; // frames (~500ms at 60fps)
const DASH_SPEED_MULTIPLIER = 2.5; // 2.5x normal speed
const BOOST_SPEED_MULTIPLIER = 2.0; // 2x normal speed for boost
const BOOST_DEPLETION_RATE = 1.5; // Boost meter depletion per frame
const BOOST_REGENERATION_RATE = 0.3; // Boost meter regeneration per frame

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
    // Arrow keys
    if (e.key === "ArrowUp") state.keys["arrowup"] = true;
    if (e.key === "ArrowDown") state.keys["arrowdown"] = true;
    if (e.key === "ArrowLeft") state.keys["arrowleft"] = true;
    if (e.key === "ArrowRight") state.keys["arrowright"] = true;

    // Space bar for Megatonne Bomb
    if (e.key === " " || key === "space") {
      state.keys["space"] = true;
      // Fire Megatonne Bomb if requirements met
      if (state.player.boostMeter > 0 &&
          state.player.shieldHealth > 0 &&
          !state.player.megatonneBombCooldown) {
        state.player.fireMegatonneBomb = true;
      }
    }

    // Detect double-tap for boost on WASD and arrow keys
    const now = Date.now();
    const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    const normalizedKey = e.key === 'ArrowUp' ? 'arrowup' : 
                          e.key === 'ArrowDown' ? 'arrowdown' :
                          e.key === 'ArrowLeft' ? 'arrowleft' :
                          e.key === 'ArrowRight' ? 'arrowright' : key;
    
    if (movementKeys.includes(normalizedKey)) {
      // Check for double-tap to activate boost
      if (state.player.lastKeyPress.key === normalizedKey && 
          (now - state.player.lastKeyPress.time) < DOUBLE_TAP_WINDOW &&
          state.player.boostMeter > 0 &&
          !state.player.boosting) {
        // Trigger boost
        state.player.boosting = true;
        state.player.boostKey = normalizedKey;
      }
      state.player.lastKeyPress = { key: normalizedKey, time: now };
    }

    state.keys[normalizedKey] = true;
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    const normalizedKey = e.key === 'ArrowUp' ? 'arrowup' : 
                          e.key === 'ArrowDown' ? 'arrowdown' :
                          e.key === 'ArrowLeft' ? 'arrowleft' :
                          e.key === 'ArrowRight' ? 'arrowright' : key;
    
    if (e.key === "ArrowUp") state.keys["arrowup"] = false;
    if (e.key === "ArrowDown") state.keys["arrowdown"] = false;
    if (e.key === "ArrowLeft") state.keys["arrowleft"] = false;
    if (e.key === "ArrowRight") state.keys["arrowright"] = false;
    
    // Space bar release
    if (e.key === " " || key === "space") {
      state.keys["space"] = false;
    }

    // End boost if the boost key is released
    if (state.player.boosting && state.player.boostKey === normalizedKey) {
      state.player.boosting = false;
      state.player.boostKey = null;
    }

    state.keys[normalizedKey] = false;
  });

  window.addEventListener("resize", () => {
    if (!state.canvas) return;
    state.canvas.width = window.innerWidth;
    state.canvas.height = window.innerHeight;
  });
}

export { DASH_SPEED_MULTIPLIER, BOOST_SPEED_MULTIPLIER, BOOST_DEPLETION_RATE, BOOST_REGENERATION_RATE };
