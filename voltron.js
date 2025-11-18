// voltron.js - Voltron Ultimate Mode system
import * as state from './state.js';
import { createExplosion } from './utils.js';

// Voltron activation requires:
// 1. Gold Star must be alive
// 2. Aura level must be > 0
// 3. Player and Gold Star must be close together
// 4. Boost meter must be full (100)
export function canActivateVoltron() {
  if (!state.goldStar.alive) return false;
  if (state.goldStarAura.level <= 0) return false;
  if (state.player.boostMeter < 100) return false;
  
  // Check if player and Gold Star are close enough to merge
  const dx = state.player.x - state.goldStar.x;
  const dy = state.player.y - state.goldStar.y;
  const dist = Math.hypot(dx, dy);
  const mergeRadius = 80;
  
  return dist < mergeRadius;
}

// Activate Voltron mode
export function activateVoltron() {
  if (!canActivateVoltron()) return false;
  
  // Store pre-Voltron state
  state.player.preVoltronX = state.player.x;
  state.player.preVoltronY = state.player.y;
  state.goldStar.preVoltronX = state.goldStar.x;
  state.goldStar.preVoltronY = state.goldStar.y;
  
  // Activate Voltron mode
  state.player.voltronMode = true;
  state.player.voltronTimer = 0;
  
  // Power multiplier scales with aura level (1.0 to 3.0)
  state.player.voltronPowerMultiplier = 1.0 + (state.goldStarAura.level * 0.4);
  
  // Position Voltron at midpoint between player and Gold Star
  state.player.x = (state.player.x + state.goldStar.x) / 2;
  state.player.y = (state.player.y + state.goldStar.y) / 2;
  
  // Hide Gold Star (it's merged with player)
  state.goldStar.voltronMerged = true;
  
  // Visual effect
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    state.pushExplosion({
      x: state.player.x,
      y: state.player.y,
      dx: Math.cos(angle) * 8,
      dy: Math.sin(angle) * 8,
      radius: 6 + Math.random() * 4,
      color: "rgba(255, 200, 50, 0.95)",
      life: 40
    });
  }
  
  return true;
}

// Deactivate Voltron mode
export function deactivateVoltron() {
  if (!state.player.voltronMode) return;
  
  state.player.voltronMode = false;
  state.player.voltronTimer = 0;
  state.player.voltronPowerMultiplier = 1.0;
  
  // Restore Gold Star position (near player)
  state.goldStar.x = state.player.x + 50;
  state.goldStar.y = state.player.y;
  state.goldStar.voltronMerged = false;
  
  // Reset aura level to 0 after Voltron mode ends
  state.goldStarAura.level = 0;
  state.goldStarAura.radius = state.goldStarAura.baseRadius;
  state.goldStarAura.active = false;
  
  // Visual effect
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    state.pushExplosion({
      x: state.player.x,
      y: state.player.y,
      dx: Math.cos(angle) * 6,
      dy: Math.sin(angle) * 6,
      radius: 5 + Math.random() * 3,
      color: "rgba(100, 150, 255, 0.9)",
      life: 35
    });
  }
}

// Update Voltron mode state
export function updateVoltron() {
  if (!state.player.voltronMode) return;
  
  state.player.voltronTimer++;
  
  // Drain boost meter
  state.player.boostMeter -= state.player.voltronBoostDrainRate;
  if (state.player.boostMeter < 0) {
    state.player.boostMeter = 0;
  }
  
  // Drain aura level over time (fractional)
  if (!state.goldStarAura.auraDrainAccumulator) {
    state.goldStarAura.auraDrainAccumulator = 0;
  }
  
  state.goldStarAura.auraDrainAccumulator += state.player.voltronAuraDrainRate;
  
  // When accumulator reaches 1.0, decrease aura level by 1
  if (state.goldStarAura.auraDrainAccumulator >= 1.0) {
    if (state.goldStarAura.level > 0) {
      state.goldStarAura.level--;
      state.goldStarAura.auraDrainAccumulator = 0;
      
      // Update power multiplier
      state.player.voltronPowerMultiplier = 1.0 + (state.goldStarAura.level * 0.4);
    }
  }
  
  // Force deactivation if boost meter is empty
  if (state.player.boostMeter <= 0) {
    deactivateVoltron();
    return;
  }
  
  // Force deactivation if aura level reaches 0
  if (state.goldStarAura.level <= 0) {
    deactivateVoltron();
    return;
  }
  
  // Keep Gold Star position synced with player while in Voltron mode
  state.goldStar.x = state.player.x;
  state.goldStar.y = state.player.y;
}

// Enhanced stats while in Voltron mode
export function getVoltronFireRateBoost() {
  if (!state.player.voltronMode) return 1.0;
  return 1.0 + (state.player.voltronPowerMultiplier * 0.5); // Up to 2.5x fire rate
}

export function getVoltronDamageMultiplier() {
  if (!state.player.voltronMode) return 1.0;
  return state.player.voltronPowerMultiplier; // Up to 3x damage
}

export function getVoltronSpeedBoost() {
  if (!state.player.voltronMode) return 1.0;
  return 1.0 + (state.player.voltronPowerMultiplier * 0.2); // Up to 1.6x speed
}

export function isVoltronActive() {
  return state.player.voltronMode === true;
}

// Draw Voltron mode UI indicators
export function drawVoltronUI(ctx) {
  if (!state.player.voltronMode) {
    // Show activation hint if conditions are met
    if (canActivateVoltron()) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 200, 50, 0.9)";
      ctx.font = "bold 16px Orbitron, monospace";
      ctx.textAlign = "center";
      ctx.fillText("PRESS V TO ACTIVATE VOLTRON MODE", state.canvas.width / 2, 100);
      ctx.restore();
    }
    return;
  }
  
  // Draw Voltron mode active indicator
  ctx.save();
  
  // Power level bar
  const barWidth = 200;
  const barHeight = 20;
  const barX = state.canvas.width / 2 - barWidth / 2;
  const barY = 50;
  
  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 30);
  
  // Title
  ctx.fillStyle = "rgba(255, 200, 50, 1)";
  ctx.font = "bold 14px Orbitron, monospace";
  ctx.textAlign = "center";
  ctx.fillText("VOLTRON MODE", state.canvas.width / 2, barY + 12);
  
  // Power multiplier bar
  const powerPercent = state.player.voltronPowerMultiplier / 3.0; // Max is 3.0
  ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
  ctx.fillRect(barX, barY + 18, barWidth, 8);
  
  const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
  gradient.addColorStop(0, "rgba(255, 200, 50, 0.9)");
  gradient.addColorStop(1, "rgba(255, 100, 0, 0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(barX, barY + 18, barWidth * powerPercent, 8);
  
  // Aura level indicator
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "12px Orbitron, monospace";
  ctx.textAlign = "center";
  ctx.fillText(`POWER: ${state.goldStarAura.level}`, state.canvas.width / 2, barY + 40);
  
  ctx.restore();
}
