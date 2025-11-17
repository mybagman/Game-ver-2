import * as state from './state.js';
import { resetGame } from './game.js';
import { skipOpeningCinematic } from './openingCinematic.js';

const DOUBLE_TAP_WINDOW = 300; // milliseconds
const DASH_DURATION = 15; // frames (~250ms at 60fps)
const DASH_COOLDOWN = 30; // frames (~500ms at 60fps)
const DASH_SPEED_BASE = 2.5; // Base dash speed multiplier
export const BOOST_SPEED_MULTIPLIER = 2.0; // 2x normal speed for boost
export const BOOST_DEPLETION_RATE = 1.5; // Boost meter depletion per frame
export const BOOST_REGENERATION_RATE = 0.3; // Boost meter regeneration per frame
const RAM_MODE_DURATION = 90; // frames (~1.5 seconds at 60fps)
const RAM_MODE_BOOST_COST = 2.0; // Boost depletion per frame while in ram mode
const RAM_MODE_BASE_SPEED = 3.0; // Base ram mode speed multiplier

// Helper function to get dash speed multiplier based on level
export function getDashSpeedMultiplier(level) {
  return DASH_SPEED_BASE + (level - 1) * 0.5; // 2.5x, 3.0x, 3.5x for levels 1-3
}

// Helper function to get ram speed multiplier based on level
export function getRamSpeedMultiplier(level) {
  return RAM_MODE_BASE_SPEED + (level - 1) * 0.5; // 3.0x, 3.5x, 4.0x for levels 1-3
}

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
    
    // Check for Mega Cannon: x key - now with charging mechanic
    if (e.key === "x" &&
        state.player.megaShotCooldown === 0 &&
        state.player.boostMeter >= 25) {
      // Start charging
      state.player.megaCannonCharging = true;
      state.player.megaCannonChargeTime = 0;
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
    
    // X key release - fire mega cannon
    if (e.key === "x" && state.player.megaCannonCharging) {
      // Fire mega cannon based on charge time
      const chargeRatio = Math.min(1, state.player.megaCannonChargeTime / state.player.megaCannonMaxCharge);
      const megaCannonLevel = state.player.megaCannonLevel || 1;
      
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
          dirX = closestTarget.x - state.player.x;
          dirY = closestTarget.y - state.player.y;
        } else {
          if (state.keys["w"]) dirY = -1;
          if (state.keys["s"]) dirY = 1;
          if (state.keys["a"]) dirX = -1;
          if (state.keys["d"]) dirX = 1;
        }
      } else {
        if (state.keys["w"]) dirY = -1;
        if (state.keys["s"]) dirY = 1;
        if (state.keys["a"]) dirX = -1;
        if (state.keys["d"]) dirX = 1;
      }
      
      const mag = Math.hypot(dirX, dirY) || 1;
      
      // Base damage scales with level, charge multiplies it
      const baseDamage = 40 + (megaCannonLevel - 1) * 20; // 40, 60, 80
      const chargeDamageMultiplier = 1 + chargeRatio; // 1x to 2x
      const damage = baseDamage * chargeDamageMultiplier;
      
      // Size scales with charge
      const size = 20 + chargeRatio * 10; // 20 to 30
      
      // AOE radius scales with level and charge
      const baseAOE = 60 + (megaCannonLevel - 1) * 20; // 60, 80, 100
      const aoeRadius = baseAOE * (1 + chargeRatio * 0.5); // Up to 1.5x
      
      // EMP effect scales with level and charge
      const empDuration = 60 + (megaCannonLevel - 1) * 30 + chargeRatio * 60; // 60-180 frames
      const empStrength = 0.3 + (megaCannonLevel - 1) * 0.1 + chargeRatio * 0.2; // 0.3-0.8
      
      // Create Mega Cannon bullet
      state.pushBullet({
        x: state.player.x,
        y: state.player.y,
        dx: (dirX / mag) * 8,
        dy: (dirY / mag) * 8,
        size: size,
        owner: "player",
        damage: damage,
        color: "megashot",
        piercing: true,
        megaCannon: true,
        aoeRadius: aoeRadius,
        empDuration: empDuration,
        empStrength: empStrength,
        chargeLevel: chargeRatio
      });
      
      // Drain boost and set cooldown (reduced cooldown at higher levels)
      const boostCost = 25 * (1 + chargeRatio * 0.5);
      state.player.boostMeter = Math.max(0, state.player.boostMeter - boostCost);
      const baseCooldown = 120 - (megaCannonLevel - 1) * 20; // 120, 100, 80 frames
      state.player.megaShotCooldown = baseCooldown;
      
      // Reset charging state
      state.player.megaCannonCharging = false;
      state.player.megaCannonChargeTime = 0;
    }
    
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
