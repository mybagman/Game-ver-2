import * as state from './state.js';
import { createExplosion } from './utils.js';

export function getAuraSparkColor() {
  switch (state.goldStarAura.level) {
    case 0: return "rgba(255,255,100,0.3)";
    case 1: return "rgba(255,200,80,0.35)";
    case 2: return "rgba(255,150,60,0.4)";
    case 3: return "rgba(255,100,40,0.45)";
    case 4: return "rgba(255,80,20,0.5)";
    default: return "rgba(255,50,0,0.5)";
  }
}

export function updateAuraStats() {
  state.goldStarAura.radius = state.goldStarAura.baseRadius * (1 + 0.05 * state.goldStarAura.level);

  if (state.goldStar.alive) {
    const dx = state.player.x - state.goldStar.x;
    const dy = state.player.y - state.goldStar.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    state.goldStarAura.active = dist < state.goldStarAura.radius;
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
    state.lightning.forEach(l => {
      const dx = l.x - s.x;
      const dy = l.y - s.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < s.r && dist > 0) {
        const push = (1 - dist / s.r) * 2;
        l.dx += (dx / dist) * push * 0.1;
        l.dy += (dy / dist) * push * 0.1;
      }
    });
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
  if (state.auraPulseTimer % 6 === 0) {
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
  state.auraSparks.forEach(s => {
    const alpha = s.life / 30;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    const color = s.color.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    ctx.fillStyle = color;
    ctx.fill();
  });
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
    const healPerSecondStar = 1 + state.goldStarAura.level * 0.5;
    state.goldStar.healAccumulator = state.goldStar.healAccumulator || 0;
    state.goldStar.healAccumulator += healPerSecondStar / 60;
    if (state.goldStar.health < state.goldStar.maxHealth) {
      const toHeal = Math.floor(state.goldStar.healAccumulator);
      if (toHeal > 0) {
        state.goldStar.health = Math.min(state.goldStar.maxHealth, state.goldStar.health + toHeal);
        state.goldStar.healAccumulator -= toHeal;
        createExplosion(state.goldStar.x + (Math.random()-0.5)*8, state.goldStar.y + (Math.random()-0.5)*8, "magenta");
      }
      state.player.fireRateBoost = 1 + state.goldStarAura.level * 0.15;
    } else {
      const healPerSecondPlayer = 1 + state.goldStarAura.level * 0.5;
      state.player.healAccumulator = state.player.healAccumulator || 0;
      state.player.healAccumulator += healPerSecondPlayer / 60;
      const toHealP = Math.floor(state.player.healAccumulator);
      if (toHealP > 0) {
        state.player.health = Math.min(state.player.maxHealth, state.player.health + toHealP);
        state.player.healAccumulator -= toHealP;
      }
      state.player.fireRateBoost = 1 + state.goldStarAura.level * 0.15;
    }
  } else {
    state.player.fireRateBoost = 1;
  }

  for (const l of state.lightning) {
    if (l._origDx === undefined || l._origDy === undefined) {
      l._origDx = l.dx;
      l._origDy = l.dy;
      l._inAura = false;
    }

    const bx = l.x - state.goldStar.x;
    const by = l.y - state.goldStar.y;
    const bd = Math.sqrt(bx*bx + by*by);
    const bulletSlowRadius = state.goldStarAura.radius * 1.5;
    if (bd < bulletSlowRadius) {
      const slowFactor = Math.max(0.5, 1 - 0.08 * state.goldStarAura.level);
      l.dx = l._origDx * slowFactor;
      l.dy = l._origDy * slowFactor;
      l._inAura = true;
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
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const t = Date.now() * 0.002 + i * 7;
        const jitter = 12 + i * 2;
        ctx.strokeStyle = `rgba(${200 - i*40},${220 - i*40},255,${0.15 + 0.25 * Math.abs(Math.sin(t))})`;
        ctx.lineWidth = 2 + i * 0.6;
        ctx.beginPath();
        const steps = 6;
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