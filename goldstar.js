import * as state from './state.js';
import { createExplosion, spawnPowerUp, respawnGoldStar } from './utils.js';
import { levelUpGoldStar } from './aura.js';

export function performRedPunch() {
  const baseRadius = 80;
  const radius = baseRadius + Math.max(0, (state.goldStar.redPunchLevel - 1)) * 40;
  let punches = Math.max(1, Math.min(state.goldStar.redPunchLevel, 8));
  const damage = 40 * state.goldStar.redPunchLevel;
  const knockbackForce = state.goldStar.redPunchLevel >= 3 ? 15 + (state.goldStar.redPunchLevel - 3) * 5 : 0;

  const nearby = state.enemies
    .map(e => ({ e, d: Math.hypot((e.x || 0) - state.goldStar.x, (e.y || 0) - state.goldStar.y) }))
    .filter(o => o.d <= radius)
    .sort((a, b) => a.d - b.d)
    .slice(0, punches);

  nearby.forEach(o => {
    if (!o.e) return;
    o.e.health -= damage;
    createExplosion(o.e.x, o.e.y, state.goldStar.redPunchLevel >= 3 ? "magenta" : "orange");

    if (knockbackForce > 0 && o.d > 0) {
      const dx = o.e.x - state.goldStar.x;
      const dy = o.e.y - state.goldStar.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      o.e.x += (dx / dist) * knockbackForce;
      o.e.y += (dy / dist) * knockbackForce;
    }

    if (o.e.health <= 0) {
      const idx = state.enemies.indexOf(o.e);
      if (idx !== -1) {
        const e = state.enemies[idx];
        if (!e.fromBoss) {
          if (e.type === "triangle") { state.addScore(10); spawnPowerUp(e.x, e.y, "blue-cannon"); }
          else if (e.type === "red-square") { state.addScore(10); spawnPowerUp(e.x, e.y, "red-punch"); }
          else if (e.type === "boss") state.addScore(100);
          else if (e.type === "mini-boss") state.addScore(50);
        }
        if (e.type === "reflector" && !e.fromBoss) {
          spawnPowerUp(e.x, e.y, "health");
          spawnPowerUp(e.x, e.y, "reflect");
          state.addScore(20);
        }
        state.enemies.splice(idx, 1);
      }
    }
  });

  if (state.goldStar.redPunchLevel <= 1) {
    state.pushRedPunchEffect({x: state.goldStar.x, y: state.goldStar.y, maxR: radius, r: 0, life: 18, maxLife: 18, color: "rgba(255,220,120,0.9)", fill: true});
    for (let i = 0; i < 8; i++) state.pushExplosion({x: state.goldStar.x, y: state.goldStar.y, dx:(Math.random()-0.5)*8, dy:(Math.random()-0.5)*8, radius:Math.random()*6+2, color:"rgba(255,200,100,0.9)", life:12});
  } else if (state.goldStar.redPunchLevel === 2) {
    state.pushRedPunchEffect({x: state.goldStar.x, y: state.goldStar.y, maxR: radius + 30, r: 0, life: 24, maxLife: 24, color: "rgba(255,160,60,0.95)", fill: true});
    for (let i = 0; i < 14; i++) {
      state.pushExplosion({x: state.goldStar.x, y: state.goldStar.y, dx: (Math.random() - 0.5) * 10, dy: (Math.random() - 0.5) * 10, radius: Math.random() * 8 + 3, color: "rgba(255,140,50,0.95)", life: 16});
    }
  } else {
    state.pushRedPunchEffect({x: state.goldStar.x, y: state.goldStar.y, maxR: radius + 60, r: 0, life: 36, maxLife: 36, color: "rgba(255,60,255,0.95)", fill: false, ring: true});
    state.pushExplosion({x: state.goldStar.x, y: state.goldStar.y, dx:0, dy:0, radius: 40, color:"rgba(255,255,255,0.95)", life:8});
    for (let i = 0; i < 20; i++) state.pushExplosion({x: state.goldStar.x, y: state.goldStar.y, dx:(Math.random()-0.5)*12, dy:(Math.random()-0.5)*12, radius:Math.random()*6+2, color:"rgba(255,50,200,0.9)", life:22});
  }

  if (state.goldStar.redPunchLevel >= 3) {
    createExplosion(state.goldStar.x, state.goldStar.y, "magenta");
  }
}

export function updateGoldStar() {
  if (!state.goldStar.alive) {
    state.goldStar.respawnTimer++;
    if (state.goldStar.respawnTimer >= 300) respawnGoldStar();
    return;
  }

  if (state.goldStar.collecting) {
    state.goldStar.collectTimer++;
    if (state.goldStar.collectTimer >= state.GOLD_STAR_PICKUP_FRAMES) {
      if (state.goldStar.targetPowerUp) {
        const centerPU = state.goldStar.targetPowerUp;
        const picked = state.powerUps.filter(p => Math.hypot(p.x - centerPU.x, p.y - centerPU.y) <= state.PICKUP_RADIUS);

        for (const pu of picked) {
          if (pu.type === "red-punch") {
            state.goldStar.redKills++;
            if (state.goldStar.redKills % 5 === 0 && state.goldStar.redPunchLevel < 5) {
              state.goldStar.redPunchLevel++;
              levelUpGoldStar();
            }
            createExplosion(pu.x, pu.y, "orange");
            state.addScore(8);
          }
          else if (pu.type === "blue-cannon") {
            state.goldStar.blueKills++;
            if (state.goldStar.blueKills % 5 === 0 && state.goldStar.blueCannonnLevel < 5) {
              state.goldStar.blueCannonnLevel++;
              levelUpGoldStar();
            }
            createExplosion(pu.x, pu.y, "cyan");
            state.addScore(8);
          }
          else if (pu.type === "health") {
            state.goldStar.health = Math.min(state.goldStar.maxHealth, state.goldStar.health+30);
            state.player.health = Math.min(state.player.maxHealth, state.player.health+30);
            createExplosion(pu.x, pu.y, "magenta");
            state.addScore(5);
          }
          else if (pu.type === "reflect") {
            state.goldStar.reflectAvailable = true;
            state.player.reflectAvailable = true;
            createExplosion(pu.x, pu.y, "magenta");
            state.addScore(12);
          }
        }
        state.powerUps = state.powerUps.filter(p => !picked.includes(p));
      }
      state.goldStar.collecting = false; 
      state.goldStar.collectTimer = 0; 
      state.goldStar.targetPowerUp = null;
    }
    return;
  }

  let dangerX = 0, dangerY = 0, dangerCount = 0;
  const DANGER_RADIUS = 120;

  state.enemies.forEach(e => {
    const dist = Math.hypot(e.x - state.goldStar.x, e.y - state.goldStar.y);
    if (dist < DANGER_RADIUS && dist > 0) {
      const weight = (DANGER_RADIUS - dist) / DANGER_RADIUS;
      dangerX += (state.goldStar.x - e.x) / dist * weight;
      dangerY += (state.goldStar.y - e.y) / dist * weight;
      dangerCount++;
    }
  });

  state.lightning.forEach(l => {
    const dist = Math.hypot(l.x - state.goldStar.x, l.y - state.goldStar.y);
    if (dist < DANGER_RADIUS && dist > 0) {
      const weight = (DANGER_RADIUS - dist) / DANGER_RADIUS * 1.5;
      dangerX += (state.goldStar.x - l.x) / dist * weight;
      dangerY += (state.goldStar.y - l.y) / dist * weight;
      dangerCount++;
    }
  });

  let nearest = null, minDist = Infinity;
  for (const pu of state.powerUps) {
    const dist = Math.hypot(pu.x-state.goldStar.x, pu.y-state.goldStar.y);
    if (dist < minDist) { minDist = dist; nearest = pu; }
  }

  let moveX = 0, moveY = 0;

  if (dangerCount > 0) {
    moveX = dangerX;
    moveY = dangerY;
  } else if (nearest && minDist < 300) {
    const dx = nearest.x-state.goldStar.x, dy = nearest.y-state.goldStar.y, mag = Math.hypot(dx,dy)||1;
    moveX = dx/mag;
    moveY = dy/mag;
    if (minDist < 25) {
      state.goldStar.collecting = true;
      state.goldStar.targetPowerUp = nearest;
      state.goldStar.collectTimer = 0;
      return;
    }
  } else {
    const dx = state.player.x-state.goldStar.x, dy = state.player.y-state.goldStar.y, dist = Math.hypot(dx,dy);
    if (dist > 100) {
      const mag = dist||1;
      moveX = dx/mag * 0.7;
      moveY = dy/mag * 0.7;
    }
  }

  const moveMag = Math.hypot(moveX, moveY);
  if (moveMag > 0) {
    state.goldStar.x += (moveX / moveMag) * state.goldStar.speed;
    state.goldStar.y += (moveY / moveMag) * state.goldStar.speed;
  }

  state.goldStar.x = Math.max(50, Math.min(state.canvas.width-50, state.goldStar.x));
  state.goldStar.y = Math.max(50, Math.min(state.canvas.height-50, state.goldStar.y));

  if (state.goldStar.redPunchLevel > 0) {
    state.goldStar.punchCooldown++;
    if (state.goldStar.punchCooldown >= 300) {
      state.goldStar.punchCooldown = 0;
      performRedPunch();
    }
  }

  if (state.goldStar.blueCannonnLevel > 0) {
    state.goldStar.cannonCooldown++;
    if (state.goldStar.cannonCooldown > 50) {
      state.goldStar.cannonCooldown = 0;
      if (state.enemies.length > 0) {
        const target = state.enemies[0], dx = target.x-state.goldStar.x, dy = target.y-state.goldStar.y, mag = Math.hypot(dx,dy)||1;
        if (state.goldStar.blueCannonnLevel === 1) state.pushBullet({x: state.goldStar.x, y: state.goldStar.y, dx: (dx/mag)*8, dy: (dy/mag)*8, size: 8, owner: "gold"});
        else if (state.goldStar.blueCannonnLevel === 2) {
          state.pushBullet({x: state.goldStar.x, y: state.goldStar.y-5, dx: (dx/mag)*8, dy: (dy/mag)*8, size: 8, owner: "gold"});
          state.pushBullet({x: state.goldStar.x, y: state.goldStar.y+5, dx: (dx/mag)*8, dy: (dy/mag)*8, size: 8, owner: "gold"});
        }
        else if (state.goldStar.blueCannonnLevel === 3) {
          for (let i = -1; i <= 1; i++) { 
            const angle = Math.atan2(dy,dx)+i*0.3; 
            state.pushBullet({x: state.goldStar.x, y: state.goldStar.y, dx: Math.cos(angle)*8, dy: Math.sin(angle)*8, size: 8, owner: "gold"}); 
          }
        }
        else if (state.goldStar.blueCannonnLevel === 4) {
          for (let i = -2; i <= 2; i++) { 
            const angle = Math.atan2(dy,dx)+i*0.25; 
            state.pushBullet({x: state.goldStar.x, y: state.goldStar.y, dx: Math.cos(angle)*8, dy: Math.sin(angle)*8, size: 8, owner: "gold"}); 
          }
        }
        else if (state.goldStar.blueCannonnLevel === 5) {
          for (let i = 0; i < 5; i++) state.pushBullet({x: state.goldStar.x+(dx/mag)*i*20, y: state.goldStar.y+(dy/mag)*i*20, dx: (dx/mag)*12, dy: (dy/mag)*12, size: 10, owner: "gold"});
        }
      }
    }
  }
}
