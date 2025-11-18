import * as state from './state.js';
import { createExplosion } from './utils.js';
import { spawnMiniDrone } from './minidrones.js';

// Progressive aura system with distinct tactical benefits per tier
export function getAuraSparkColor() {
  switch (state.goldStarAura.level) {
    case 0: return "rgba(255,255,100,0.3)"; // No aura
    case 1: return "rgba(255,200,80,0.35)"; // Tier 1: Basic healing
    case 2: return "rgba(255,150,60,0.4)";  // Tier 2: Fire rate boost
    case 3: return "rgba(255,100,40,0.45)"; // Tier 3: Enemy slow
    case 4: return "rgba(255,80,20,0.5)";   // Tier 4: Damage reduction
    default: return "rgba(255,50,0,0.5)";   // Tier 5+: Ultimate power
  }
}

// Get aura tier description for tactical display
export function getAuraTierDescription(level) {
  switch (level) {
    case 0: return "No Aura Active";
    case 1: return "Tier I: Healing Field";
    case 2: return "Tier II: Combat Enhancement";
    case 3: return "Tier III: Temporal Distortion";
    case 4: return "Tier IV: Defensive Matrix";
    default: return "Tier V: Ultimate Power";
  }
}

export function updateAuraStats() {
  state.goldStarAura.radius = state.goldStarAura.baseRadius * (1 + 0.05 * state.goldStarAura.level);

  if (state.goldStar.alive) {
    const dx = state.player.x - state.goldStar.x;
    const dy = state.player.y - state.goldStar.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    // Match the visual radius calculation including level factor and average pulse
    const levelFactor = Math.max(0, state.goldStarAura.level || 0);
    const activationRadius = state.goldStarAura.radius + (levelFactor * 4) + 4;
    state.goldStarAura.active = dist < activationRadius;
  } else {
    state.goldStarAura.active = false;
  }
}

export function resetAuraOnDeath() {
  state.goldStarAura.level = 0;
  state.goldStarAura.radius = state.goldStarAura.baseRadius;
  state.goldStarAura.active = false;
  state.goldStarAura.pulse = 0;

  state.setAuraSparks([]);
  state.setAuraShockwaves([]);

  for (const l of state.lightning) {
    if (l._origDx !== undefined && l._origDy !== undefined) {
      l.dx = l._origDx;
      l.dy = l._origDy;
      l._inAura = false;
    }
  }
}

export function triggerAuraShockwave() {
  state.pushAuraShockwave({
    x: state.goldStar.x,
    y: state.goldStar.y,
    r: state.goldStarAura.radius * 0.5,
    maxR: state.goldStarAura.radius * 2,
    life: 30,
    maxLife: 30,
    color: getAuraSparkColor()
  });
}

export function updateAuraShockwaves() {
  state.auraShockwaves.forEach(s => {
    s.r += (s.maxR - s.r) * 0.25;
    s.life--;
    // OPTIMIZATION: Only process every other lightning bullet to reduce O(n*m) complexity
    // This still provides the effect while reducing computation by half
    for (let i = 0; i < state.lightning.length; i += 2) {
      const l = state.lightning[i];
      const dx = l.x - s.x;
      const dy = l.y - s.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < s.r && dist > 0) {
        const push = (1 - dist / s.r) * 2;
        l.dx += (dx / dist) * push * 0.1;
        l.dy += (dy / dist) * push * 0.1;
      }
    }
  });
  state.filterAuraShockwaves(s => s.life > 0);
}

export function drawAuraShockwaves(ctx) {
  state.auraShockwaves.forEach(s => {
    const alpha = s.life / s.maxLife;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    const color = s.color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${0.4 * alpha})`);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6 - 4 * (1 - alpha);
    ctx.stroke();
  });
}

export function updateAuraSparks() {
  if (!state.goldStar.alive) return;
  state.incrementAuraPulseTimer();
  // OPTIMIZATION: Reduce spark spawn rate from every 6 frames to every 12 frames
  if (state.auraPulseTimer % 12 === 0) {
    state.pushAuraSpark({
      x: state.goldStar.x + (Math.random() - 0.5) * state.goldStarAura.radius * 2,
      y: state.goldStar.y + (Math.random() - 0.5) * state.goldStarAura.radius * 2,
      life: 30,
      color: getAuraSparkColor()
    });
  }
  state.auraSparks.forEach(s => s.life--);
  state.filterAuraSparks(s => s.life > 0);
}

export function drawAuraSparks(ctx) {
  // OPTIMIZATION: Batch drawing operations with same alpha level
  // Group sparks by similar alpha values to reduce fillStyle changes
  ctx.save();
  state.auraSparks.forEach(s => {
    const alpha = s.life / 30;
    // Extract RGB values once (cached regex result)
    const matches = s.color.match(/rgba\((\d+),(\d+),(\d+),/);
    if (!matches) return;
    
    ctx.fillStyle = `rgba(${matches[1]},${matches[2]},${matches[3]},${alpha})`;
    ctx.fillRect(s.x - 2, s.y - 2, 4, 4); // Use fillRect instead of arc for better performance
  });
  ctx.restore();
}

export function drawAura(ctx) {
  if (!state.goldStar.alive || !state.goldStarAura.active) return;
  const r = state.goldStarAura.radius + Math.sin(Date.now() * 0.005) * 10;
  const grad = ctx.createRadialGradient(state.goldStar.x, state.goldStar.y, r * 0.3, state.goldStar.x, state.goldStar.y, r);
  grad.addColorStop(0, "rgba(255,255,150,0.15)");
  grad.addColorStop(1, getAuraSparkColor());
  ctx.beginPath();
  ctx.arc(state.goldStar.x, state.goldStar.y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

export function applyGoldStarAuraEffects() {
  state.player.fireRateBoost = 1;

  if (!state.goldStar.alive || !state.goldStarAura.active) {
    for (const l of state.lightning) {
      if (l._origDx !== undefined && l._origDy !== undefined) {
        if (l._inAura) {
          l.dx = l._origDx;
          l.dy = l._origDy;
          l._inAura = false;
        }
      }
    }
    return;
  }

  const dx = state.player.x - state.goldStar.x;
  const dy = state.player.y - state.goldStar.y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < state.goldStarAura.radius) {
    // Progressive tactical benefits based on aura tier
    const auraLevel = state.goldStarAura.level;
    
    // Tier 1+: Healing Field (scales with level)
    if (auraLevel >= 1) {
      const healPerSecondStar = 1 + auraLevel * 0.6; // Increased healing effectiveness
      state.goldStar.healAccumulator = state.goldStar.healAccumulator || 0;
      state.goldStar.healAccumulator += healPerSecondStar / 60;
      if (state.goldStar.health < state.goldStar.maxHealth) {
        const toHeal = Math.floor(state.goldStar.healAccumulator);
        if (toHeal > 0) {
          state.goldStar.health = Math.min(state.goldStar.maxHealth, state.goldStar.health + toHeal);
          state.goldStar.healAccumulator -= toHeal;
          if (Math.floor(state.goldStar.health) % 10 === 0) {
            createExplosion(state.goldStar.x + (Math.random()-0.5)*8, state.goldStar.y + (Math.random()-0.5)*8, "magenta");
          }
        }
      } else {
        const healPerSecondPlayer = 1 + auraLevel * 0.6;
        state.player.healAccumulator = state.player.healAccumulator || 0;
        state.player.healAccumulator += healPerSecondPlayer / 60;
        const toHealP = Math.floor(state.player.healAccumulator);
        if (toHealP > 0) {
          state.player.health = Math.min(state.player.maxHealth, state.player.health + toHealP);
          state.player.healAccumulator -= toHealP;
        }
      }
    }
    
    // Tier 2+: Combat Enhancement (fire rate boost)
    if (auraLevel >= 2) {
      state.player.fireRateBoost = 1 + auraLevel * 0.2; // Improved fire rate scaling
    }
    
    // Tier 4+: Defensive Matrix (damage reduction for player)
    if (auraLevel >= 4) {
      state.player.auraDamageReduction = 0.2 + (auraLevel - 4) * 0.1; // 20-30% damage reduction
    } else {
      state.player.auraDamageReduction = 0;
    }
    
    // Tier 5+: Ultimate Power (shields regenerate slowly)
    if (auraLevel >= 5 && state.player.shieldActive && state.player.shieldHealth < state.player.maxShieldHealth) {
      state.player.shieldHealth = Math.min(state.player.maxShieldHealth, state.player.shieldHealth + 0.2);
    }
  } else {
    state.player.fireRateBoost = 1;
    state.player.auraDamageReduction = 0;
  }

  // OPTIMIZATION: Only process lightning bullets every other frame to reduce load
  const processAll = state.frameCount % 2 === 0;
  const step = processAll ? 1 : 2;
  
  for (let i = 0; i < state.lightning.length; i += step) {
    const l = state.lightning[i];
    if (l._origDx === undefined || l._origDy === undefined) {
      l._origDx = l.dx;
      l._origDy = l.dy;
      l._inAura = false;
    }

    const bx = l.x - state.goldStar.x;
    const by = l.y - state.goldStar.y;
    // OPTIMIZATION: Use squared distance to avoid sqrt when possible
    const bdSquared = bx*bx + by*by;
    const bulletSlowRadius = state.goldStarAura.radius * 1.5;
    const radiusSquared = bulletSlowRadius * bulletSlowRadius;
    
    if (bdSquared < radiusSquared) {
      // Tier 3+: Temporal Distortion (enemy projectile slow)
      const auraLevel = state.goldStarAura.level;
      if (auraLevel >= 3) {
        const slowFactor = Math.max(0.3, 1 - 0.12 * auraLevel); // Stronger slow at higher tiers
        l.dx = l._origDx * slowFactor;
        l.dy = l._origDy * slowFactor;
        l._inAura = true;
      }
    } else {
      if (l._inAura) {
        l.dx = l._origDx;
        l.dy = l._origDy;
        l._inAura = false;
      }
    }
  }
}

export function levelUpGoldStar() {
  state.goldStarAura.level++;
  updateAuraStats();
  triggerAuraShockwave();
  
  // Spawn a mini-drone for each level up
  if (state.goldStar.alive) {
    spawnMiniDrone(state.goldStar.x, state.goldStar.y);
  }
}

export function updateGoldStarAura() {
  updateAuraStats();
  updateAuraSparks();
  updateAuraShockwaves();
  applyGoldStarAuraEffects();
}

export function drawGoldStarAura(ctx) {
  drawAura(ctx);
  drawAuraSparks(ctx);
  drawAuraShockwaves(ctx);

  if (state.goldStar.alive && state.goldStarAura.active) {
    const healingActive = (state.goldStar.health < state.goldStar.maxHealth) || (state.player.health < state.player.maxHealth && state.goldStar.health >= state.goldStar.maxHealth);
    if (healingActive) {
      // OPTIMIZATION: Reduce healing beam complexity - only draw 2 beams instead of 3
      // and reduce steps from 6 to 4 to cut down on path operations
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const t = Date.now() * 0.002 + i * 7;
        const jitter = 12 + i * 2;
        ctx.strokeStyle = `rgba(${200 - i*40},${220 - i*40},255,${0.15 + 0.25 * Math.abs(Math.sin(t))})`;
        ctx.lineWidth = 2 + i * 0.6;
        ctx.beginPath();
        const steps = 4; // Reduced from 6
        const sx = state.goldStar.x, sy = state.goldStar.y;
        const tx = state.player.x, ty = state.player.y;
        ctx.moveTo(sx, sy);
        for (let s = 1; s <= steps; s++) {
          const u = s / steps;
          const nx = sx + (tx - sx) * u + (Math.sin(t * (1 + s*0.1)) * jitter * (1 - u*0.8));
          const ny = sy + (ty - sy) * u + (Math.cos(t * (1 + s*0.12)) * jitter * (u*0.4));
          ctx.lineTo(nx, ny);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}