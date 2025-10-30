// goldstar.js
import * as state from './state.js';
import { createExplosion as utilsCreateExplosion, spawnPowerUp, respawnGoldStar } from './utils.js';
import { levelUpGoldStar as auraLevelUp } from './aura.js';

function safeCall(fn, ...args) {
  if (typeof fn === 'function') return fn(...args);
  return undefined;
}

export function performRedPunch() {
  // Ensure goldStar object exists
  state.goldStar = state.goldStar || {};
  const gs = state.goldStar;

  const baseRadius = 80;
  const level = Math.max(0, (gs.redPunchLevel || 0));
  const radius = baseRadius + Math.max(0, (level - 1)) * 40;
  let punches = Math.max(1, Math.min(level || 1, 8));
  const damage = 40 * (level || 0);
  const knockbackForce = (level >= 3) ? 15 + (level - 3) * 5 : 0;

  const nearby = (state.enemies || [])
    .map(e => ({ e, d: Math.hypot((e.x || 0) - (gs.x || 0), (e.y || 0) - (gs.y || 0)) }))
    .filter(o => o.d <= radius)
    .sort((a, b) => a.d - b.d)
    .slice(0, punches);

  nearby.forEach(o => {
    if (!o.e) return;
    o.e.health = (o.e.health || 0) - damage;
    safeCall(utilsCreateExplosion, o.e.x, o.e.y, (level >= 3 ? "magenta" : "orange"));

    if (knockbackForce > 0 && o.d > 0) {
      const dx = o.e.x - (gs.x || 0);
      const dy = o.e.y - (gs.y || 0);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      o.e.x += (dx / dist) * knockbackForce;
      o.e.y += (dy / dist) * knockbackForce;
    }

    if (o.e.health <= 0) {
      const idx = (state.enemies || []).indexOf(o.e);
      if (idx !== -1) {
        const e = state.enemies[idx];
        if (!e.fromBoss) {
          if (e.type === "triangle") { safeCall(state.addScore, 10); safeCall(spawnPowerUp, e.x, e.y, "blue-cannon"); }
          else if (e.type === "red-square") { safeCall(state.addScore, 10); safeCall(spawnPowerUp, e.x, e.y, "red-punch"); }
          else if (e.type === "boss") safeCall(state.addScore, 100);
          else if (e.type === "mini-boss") safeCall(state.addScore, 50);
        }
        if (e.type === "reflector" && !e.fromBoss) {
          safeCall(spawnPowerUp, e.x, e.y, "health");
          safeCall(spawnPowerUp, e.x, e.y, "reflect");
          safeCall(state.addScore, 20);
        }
        state.enemies.splice(idx, 1);
      }
    }
  });

  // Visual / particle effects — guard calls so missing functions don't crash
  if ((gs.redPunchLevel || 0) <= 1) {
    safeCall(state.pushRedPunchEffect, { x: gs.x, y: gs.y, maxR: radius, r: 0, life: 18, maxLife: 18, color: "rgba(255,220,120,0.9)", fill: true });
    for (let i = 0; i < 8; i++) {
      safeCall(state.pushExplosion, { x: gs.x, y: gs.y, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8, radius: Math.random() * 6 + 2, color: "rgba(255,200,100,0.9)" });
    }
  } else if (gs.redPunchLevel === 2) {
    safeCall(state.pushRedPunchEffect, { x: gs.x, y: gs.y, maxR: radius + 30, r: 0, life: 24, maxLife: 24, color: "rgba(255,160,60,0.95)", fill: true });
    for (let i = 0; i < 14; i++) {
      safeCall(state.pushExplosion, { x: gs.x, y: gs.y, dx: (Math.random() - 0.5) * 10, dy: (Math.random() - 0.5) * 10, radius: Math.random() * 8 + 3, color: "rgba(255,140,50,0.95)", life: 16 });
    }
  } else {
    safeCall(state.pushRedPunchEffect, { x: gs.x, y: gs.y, maxR: radius + 60, r: 0, life: 36, maxLife: 36, color: "rgba(255,60,255,0.95)", fill: false, ring: true });
    safeCall(state.pushExplosion, { x: gs.x, y: gs.y, dx: 0, dy: 0, radius: 40, color: "rgba(255,255,255,0.95)", life: 8 });
    for (let i = 0; i < 20; i++) {
      safeCall(state.pushExplosion, { x: gs.x, y: gs.y, dx: (Math.random() - 0.5) * 12, dy: (Math.random() - 0.5) * 12, radius: Math.random() * 6 + 2, color: "rgba(255,50,20,0.95)", life: 18 });
    }
  }

  if ((gs.redPunchLevel || 0) >= 3) {
    safeCall(utilsCreateExplosion, gs.x, gs.y, "magenta");
  }
}

export function updateGoldStar() {
  // ensure goldStar object exists to avoid exceptions
  state.goldStar = state.goldStar || {};
  state.player = state.player || {};
  const gs = state.goldStar;

  // respawn handling
  if (!gs.alive) {
    gs.respawnTimer = (gs.respawnTimer || 0) + 1;
    if ((gs.respawnTimer || 0) >= 300) safeCall(respawnGoldStar);
    return;
  }

  // collecting power-up handling
  if (gs.collecting) {
    gs.collectTimer = (gs.collectTimer || 0) + 1;
    if (gs.collectTimer >= (state.GOLD_STAR_PICKUP_FRAMES || 30)) {
      if (gs.targetPowerUp) {
        const centerPU = gs.targetPowerUp;
        const picked = (state.powerUps || []).filter(p => Math.hypot((p.x || 0) - centerPU.x, (p.y || 0) - centerPU.y) <= (state.PICKUP_RADIUS || 50));

        for (const pu of picked) {
          if (!pu || !pu.type) continue;

          if (pu.type === "red-punch") {
            gs.redKills = (gs.redKills || 0) + 1;
            if (gs.redKills % 5 === 0 && (gs.redPunchLevel || 0) < 5) {
              gs.redPunchLevel = (gs.redPunchLevel || 0) + 1;
              safeCall(auraLevelUp, state);
            }
            safeCall(utilsCreateExplosion, pu.x, pu.y, "orange");
            safeCall(state.addScore, 8);
          }
          else if (pu.type === "blue-cannon") {
            gs.blueKills = (gs.blueKills || 0) + 1;
            if (gs.blueKills % 5 === 0 && (gs.blueCannonLevel || 0) < 5) {
              gs.blueCannonLevel = (gs.blueCannonLevel || 0) + 1;
              safeCall(auraLevelUp, state);
            }
            safeCall(utilsCreateExplosion, pu.x, pu.y, "cyan");
            safeCall(state.addScore, 8);
          }
          else if (pu.type === "health") {
            gs.health = Math.min(gs.maxHealth || 100, (gs.health || 0) + 30);
            state.player.health = Math.min(state.player.maxHealth || 100, (state.player.health || 0) + 30);
            safeCall(utilsCreateExplosion, pu.x, pu.y, "magenta");
            safeCall(state.addScore, 5);
          }
          else if (pu.type === "reflect") {
            gs.reflectAvailable = true;
            state.player.reflectAvailable = true;
            safeCall(utilsCreateExplosion, pu.x, pu.y, "magenta");
            safeCall(state.addScore, 12);
          } else {
            safeCall(utilsCreateExplosion, pu.x, pu.y, "white");
            safeCall(state.addScore, 1);
          }
        }

        // remove picked power-ups from global list, preserving any provided mutator
        if (typeof state.filterPowerUps === "function") {
          state.filterPowerUps(p => !picked.includes(p));
        } else {
          state.powerUps = (state.powerUps || []).filter(p => !picked.includes(p));
        }
      }
      gs.collecting = false;
      gs.collectTimer = 0;
      gs.targetPowerUp = null;
    }
    return;
  }

  // danger / attraction logic
  let dangerX = 0, dangerY = 0, dangerCount = 0;
  const DANGER_RADIUS = 120;

  (state.enemies || []).forEach(e => {
    const dist = Math.hypot((e.x || 0) - (gs.x || 0), (e.y || 0) - (gs.y || 0));
    if (dist < DANGER_RADIUS && dist > 0) {
      const weight = (DANGER_RADIUS - dist) / DANGER_RADIUS;
      dangerX += ((gs.x || 0) - e.x) / dist * weight;
      dangerY += ((gs.y || 0) - e.y) / dist * weight;
      dangerCount++;
    }
  });

  (state.lightning || []).forEach(l => {
    const dist = Math.hypot((l.x || 0) - (gs.x || 0), (l.y || 0) - (gs.y || 0));
    if (dist < DANGER_RADIUS && dist > 0) {
      const weight = (DANGER_RADIUS - dist) / DANGER_RADIUS * 1.5;
      dangerX += ((gs.x || 0) - l.x) / dist * weight;
      dangerY += ((gs.y || 0) - l.y) / dist * weight;
      dangerCount++;
    }
  });

  let nearest = null, minDist = Infinity;
  for (const pu of (state.powerUps || [])) {
    const dist = Math.hypot((pu.x || 0) - (gs.x || 0), (pu.y || 0) - (gs.y || 0));
    if (dist < minDist) { minDist = dist; nearest = pu; }
  }

  let moveX = 0, moveY = 0;

  if (dangerCount > 0) {
    moveX = dangerX;
    moveY = dangerY;
  } else if (nearest && minDist < 300) {
    const dx = nearest.x - (gs.x || 0), dy = nearest.y - (gs.y || 0), mag = Math.hypot(dx, dy) || 1;
    moveX = dx / mag;
    moveY = dy / mag;
    if (minDist < 25) {
      gs.collecting = true;
      gs.targetPowerUp = nearest;
      gs.collectTimer = 0;
      return;
    }
  } else {
    const dx = (state.player.x || 0) - (gs.x || 0), dy = (state.player.y || 0) - (gs.y || 0), dist = Math.hypot(dx, dy);
    if (dist > 100) {
      const mag = dist || 1;
      moveX = dx / mag * 0.7;
      moveY = dy / mag * 0.7;
    }
  }

  const moveMag = Math.hypot(moveX, moveY);
  if (moveMag > 0) {
    gs.x = (gs.x || 0) + (moveX / moveMag) * (gs.speed || 2);
    gs.y = (gs.y || 0) + (moveY / moveMag) * (gs.speed || 2);
  }

  gs.x = Math.max(50, Math.min((state.canvas && state.canvas.width) ? state.canvas.width - 50 : (gs.x || 50), gs.x));
  gs.y = Math.max(50, Math.min((state.canvas && state.canvas.height) ? state.canvas.height - 50 : (gs.y || 50), gs.y));

  // red punch auto-fire
  if ((gs.redPunchLevel || 0) > 0) {
    gs.punchCooldown = (gs.punchCooldown || 0) + 1;
    if (gs.punchCooldown >= 300) {
      gs.punchCooldown = 0;
      performRedPunch();
    }
  }

  // blue cannon firing logic
  if ((gs.blueCannonLevel || 0) > 0) {
    gs.cannonCooldown = (gs.cannonCooldown || 0) + 1;
    if (gs.cannonCooldown > 50) {
      gs.cannonCooldown = 0;
      if ((state.enemies || []).length > 0) {
        const target = state.enemies[0];
        const dx = (target.x || 0) - (gs.x || 0), dy = (target.y || 0) - (gs.y || 0), mag = Math.hypot(dx, dy) || 1;
        if (gs.blueCannonLevel === 1) safeCall(state.pushBullet, { x: gs.x, y: gs.y, dx: (dx / mag) * 8, dy: (dy / mag) * 8, size: 8, owner: "gold" });
        else if (gs.blueCannonLevel === 2) {
          safeCall(state.pushBullet, { x: gs.x, y: gs.y - 5, dx: (dx / mag) * 8, dy: (dy / mag) * 8, size: 8, owner: "gold" });
          safeCall(state.pushBullet, { x: gs.x, y: gs.y + 5, dx: (dx / mag) * 8, dy: (dy / mag) * 8, size: 8, owner: "gold" });
        }
        else if (gs.blueCannonLevel === 3) {
          for (let i = -1; i <= 1; i++) {
            const angle = Math.atan2(dy, dx) + i * 0.3;
            safeCall(state.pushBullet, { x: gs.x, y: gs.y, dx: Math.cos(angle) * 8, dy: Math.sin(angle) * 8, size: 8, owner: "gold" });
          }
        }
        else if (gs.blueCannonLevel === 4) {
          for (let i = -2; i <= 2; i++) {
            const angle = Math.atan2(dy, dx) + i * 0.25;
            safeCall(state.pushBullet, { x: gs.x, y: gs.y, dx: Math.cos(angle) * 8, dy: Math.sin(angle) * 8, size: 8, owner: "gold" });
          }
        }
        else if (gs.blueCannonLevel === 5) {
          for (let i = 0; i < 5; i++) {
            safeCall(state.pushBullet, { x: gs.x + (dx / mag) * i * 20, y: gs.y + (dy / mag) * i * 20, dx: (dx / mag) * 12, dy: (dy / mag) * 12, size: 10, owner: "gold" });
          }
        }
      }
    }
  }
}
