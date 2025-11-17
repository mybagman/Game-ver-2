import * as state from './state.js';
import { resetGame } from './game.js';
import { skipOpeningCinematic } from './openingCinematic.js';

const DOUBLE_TAP_WINDOW = 300; // milliseconds
const DASH_DURATION = 15; // frames (~250ms at 60fps)
const DASH_COOLDOWN = 30; // frames (~500ms at 60fps)
const DASH_SPEED_MULTIPLIER = 2.5; // 2.5x normal speed
export const BOOST_SPEED_MULTIPLIER = 2.0; // 2x normal speed for boost
export const BOOST_DEPLETION_RATE = 1.5; // Boost meter depletion per frame
export const BOOST_REGENERATION_RATE = 0.3; // Boost meter regeneration per frame
const RAM_MODE_DURATION = 90; // frames (~1.5 seconds at 60fps)
const RAM_MODE_BOOST_COST = 2.0; // Boost depletion per frame while in ram mode
const RAM_MODE_SPEED_MULTIPLIER = 3.0; // 3x normal speed for ram mode

export function setupInputHandlers() {
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    const now = Date.now(); // Get timestamp early for double-tap detection
    
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
    // Arrow keys - also check for double-tap to fire EMP
    const fireKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    const normalizedFireKey = e.key === 'ArrowUp' ? 'arrowup' : 
                              e.key === 'ArrowDown' ? 'arrowdown' :
                              e.key === 'ArrowLeft' ? 'arrowleft' :
                              e.key === 'ArrowRight' ? 'arrowright' : null;
    
    if (normalizedFireKey && fireKeys.includes(normalizedFireKey)) {
      // Check for double-tap to fire EMP
      if (state.player.lastFireKeyPress.key === normalizedFireKey && 
          (now - state.player.lastFireKeyPress.time) < DOUBLE_TAP_WINDOW &&
          state.player.empCooldown === 0 &&
          state.player.boostMeter >= 30) { // Require at least 30% boost
        // Trigger EMP firing (will be handled in handleShooting)
        state.player.firePlayerEMP = true;
      }
      state.player.lastFireKeyPress = { key: normalizedFireKey, time: now };
    }
    
    // Check for Ram Mode: Shift key
    if (e.key === "Shift" &&
        state.player.ramModeCooldown === 0 &&
        state.player.boostMeter >= 20) {
      // Trigger Ram Mode
      state.player.ramMode = true;
      state.player.ramModeTimer = 90; // 1.5 seconds at 60fps
      state.player.invulnerable = true;
      state.player.boostMeter = Math.max(0, state.player.boostMeter - 20);
    }
    
    if (e.key === "ArrowUp") state.keys["arrowup"] = true;
    if (e.key === "ArrowDown") state.keys["arrowdown"] = true;
    if (e.key === "ArrowLeft") state.keys["arrowleft"] = true;
    if (e.key === "ArrowRight") state.keys["arrowright"] = true;
    
    // Check for Mega Shot: x key
    if (e.key === "x" &&
        state.player.megaShotCooldown === 0 &&
        state.player.boostMeter >= 25) {
      // Find closest enemy to target
      const allTargets = [
        ...state.enemies,
        ...state.diamonds,
        ...state.tanks,
        ...state.walkers,
        ...state.mechs,
        ...state.dropships
      ];
      
      let dirX = 1; // Default forward (right)
      let dirY = 0;
      
      if (allTargets.length > 0) {
        // Find closest enemy
        let closestTarget = null;
        let closestDist = Infinity;
        
        for (const target of allTargets) {
          if (!target || target.health <= 0) continue;
          const dist = Math.hypot(target.x - state.player.x, target.y - state.player.y);
          if (dist < closestDist) {
            closestDist = dist;
            closestTarget = target;
          }
        }
        
        if (closestTarget) {
          // Aim at closest enemy
          dirX = closestTarget.x - state.player.x;
          dirY = closestTarget.y - state.player.y;
        } else {
          // No valid target, use player's current direction
          if (state.keys["w"]) dirY = -1;
          if (state.keys["s"]) dirY = 1;
          if (state.keys["a"]) dirX = -1;
          if (state.keys["d"]) dirX = 1;
        }
      } else {
        // No enemies, use player's current direction
        if (state.keys["w"]) dirY = -1;
        if (state.keys["s"]) dirY = 1;
        if (state.keys["a"]) dirX = -1;
        if (state.keys["d"]) dirX = 1;
      }
      
      const mag = Math.hypot(dirX, dirY) || 1;
      
      // Create Mega Shot bullet
      state.pushBullet({
        x: state.player.x,
        y: state.player.y,
        dx: (dirX / mag) * 8,
        dy: (dirY / mag) * 8,
        size: 20,
        owner: "player",
        damage: 50,
        color: "megashot",
        piercing: true // Can hit multiple enemies
      });
      
      // Drain boost and set cooldown
      state.player.boostMeter = Math.max(0, state.player.boostMeter - 25);
      state.player.megaShotCooldown = 120; // 2 seconds at 60fps
    }

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
    const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    const normalizedKey = e.key === 'ArrowUp' ? 'arrowup' : 
                          e.key === 'ArrowDown' ? 'arrowdown' :
                          e.key === 'ArrowLeft' ? 'arrowleft' :
                          e.key === 'ArrowRight' ? 'arrowright' : key;
    
    if (movementKeys.includes(normalizedKey)) {
      // Check for double-tap to activate boost
      // Skip boost activation if EMP was just fired using the same key
      if (state.player.lastKeyPress.key === normalizedKey && 
          (now - state.player.lastKeyPress.time) < DOUBLE_TAP_WINDOW &&
          state.player.boostMeter > 0 &&
          !state.player.boosting &&
          !state.player.firePlayerEMP) {
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

export { DASH_SPEED_MULTIPLIER };
