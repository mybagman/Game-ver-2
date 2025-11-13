// goldstar.js
import * as state from './state.js';
import { createExplosion, spawnPowerUp, spawnRandomPowerUp, respawnGoldStar } from './utils.js';
import { levelUpGoldStar } from './aura.js';

function safeCall(fn, ...args) {
  if (typeof fn === 'function') return fn(...args);
  return undefined;
}

export function performRedPunch() {
  // Read the goldStar object from state. Do NOT reassign state.goldStar (exports are read-only).
  const gs = state.goldStar;
  if (!gs) {
    console.warn('performRedPunch: state.goldStar is undefined');
    return;
  }

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
    safeCall(createExplosion, o.e.x, o.e.y, (level >= 3 ? "magenta" : "orange"));

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
          if (e.type === "triangle") { safeCall(state.addScore, 10); safeCall(spawnRandomPowerUp, e.x, e.y); }
          else if (e.type === "red-square") { safeCall(state.addScore, 10); safeCall(spawnRandomPowerUp, e.x, e.y); }
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
    safeCall(createExplosion, gs.x, gs.y, "magenta");
  }
}

export function updateGoldStar() {
  // Read the goldStar and player objects from state; do NOT reassign exported bindings.
  const gs = state.goldStar;
  if (!gs) {
    console.warn('updateGoldStar: state.goldStar is undefined');
    return;
  }
  const player = state.player || {};

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
            if (gs.redKills % 3 === 0 && (gs.redPunchLevel || 0) < 5) {
              gs.redPunchLevel = (gs.redPunchLevel || 0) + 1;
              safeCall(levelUpGoldStar, state);
            }
            safeCall(createExplosion, pu.x, pu.y, "orange");
            safeCall(state.addScore, 8);
          }
          else if (pu.type === "blue-cannon") {
            gs.blueKills = (gs.blueKills || 0) + 1;
            if (gs.blueKills % 3 === 0 && (gs.blueCannonLevel || 0) < 5) {
              gs.blueCannonLevel = (gs.blueCannonLevel || 0) + 1;
              safeCall(levelUpGoldStar, state);
            }
            safeCall(createExplosion, pu.x, pu.y, "cyan");
            safeCall(state.addScore, 8);
          }
          else if (pu.type === "health") {
            gs.health = Math.min(gs.maxHealth || 100, (gs.health || 0) + 30);
            state.player.health = Math.min(state.player.maxHealth || 100, (state.player.health || 0) + 30);
            safeCall(createExplosion, pu.x, pu.y, "magenta");
            safeCall(state.addScore, 5);
          }
          else if (pu.type === "reflect") {
            gs.reflectAvailable = true;
            state.player.reflectAvailable = true;
            // Initialize shield if not already active
            if (!state.player.shieldActive) {
              state.player.shieldActive = true;
              state.player.maxShieldHealth = 50;
              state.player.shieldHealth = 50;
            } else {
              // Add to existing shield (max 200)
              state.player.maxShieldHealth = Math.min(200, state.player.maxShieldHealth + 25);
              state.player.shieldHealth = Math.min(state.player.maxShieldHealth, state.player.shieldHealth + 25);
            }
            safeCall(createExplosion, pu.x, pu.y, "magenta");
            safeCall(state.addScore, 12);
          }
          else if (pu.type === "reflector-level") {
            // Increase reflector level (now adds shield strength instead of missiles)
            // Requires 3 power-ups to level up
            if (state.player.reflectorLevel < 10) {
              state.player.reflectorPowerUpCount = (state.player.reflectorPowerUpCount || 0) + 1;
              
              if (state.player.reflectorPowerUpCount >= 3) {
                // Level up after collecting 3 power-ups
                state.player.reflectorLevel++;
                state.player.reflectorPowerUpCount = 0;
                
                // Initialize or grow shield
                if (!state.player.shieldActive) {
                  state.player.shieldActive = true;
                  state.player.maxShieldHealth = 30;
                  state.player.shieldHealth = 30;
                } else {
                  state.player.maxShieldHealth = Math.min(200, state.player.maxShieldHealth + 20);
                  state.player.shieldHealth = Math.min(state.player.maxShieldHealth, state.player.shieldHealth + 20);
                }
                safeCall(createExplosion, pu.x, pu.y, "cyan");
                safeCall(state.addScore, 15);
              } else {
                // Collected but not enough to level up yet
                safeCall(createExplosion, pu.x, pu.y, "lightblue");
                safeCall(state.addScore, 5);
              }
            } else {
              // Already at max, give score
              safeCall(createExplosion, pu.x, pu.y, "white");
              safeCall(state.addScore, 5);
            }
          }
          else if (pu.type === "homing-missile") {
            // New power-up type for homing missiles (goes to gold star)
            // Requires 3 power-ups to level up
            if (gs.homingMissileLevel < 10) {
              gs.homingMissilePowerUpCount = (gs.homingMissilePowerUpCount || 0) + 1;
              
              if (gs.homingMissilePowerUpCount >= 3) {
                // Level up after collecting 3 power-ups
                gs.homingMissileLevel = Math.min(10, (gs.homingMissileLevel || 0) + 1);
                gs.homingMissilePowerUpCount = 0;
                safeCall(levelUpGoldStar, state);
                safeCall(createExplosion, pu.x, pu.y, "orange");
                safeCall(state.addScore, 15);
              } else {
                // Collected but not enough to level up yet
                safeCall(createExplosion, pu.x, pu.y, "yellow");
                safeCall(state.addScore, 5);
              }
            } else {
              // Already at max
              safeCall(createExplosion, pu.x, pu.y, "white");
              safeCall(state.addScore, 5);
            }
          } else {
            safeCall(createExplosion, pu.x, pu.y, "white");
            safeCall(state.addScore, 1);
          }
        }

        // remove picked power-ups from global list without reassigning the exported binding
        if (typeof state.filterPowerUps === "function") {
          state.filterPowerUps(p => !picked.includes(p));
        } else if (Array.isArray(state.powerUps)) {
          const remaining = state.powerUps.filter(p => !picked.includes(p));
          state.powerUps.length = 0;
          state.powerUps.push(...remaining);
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

  // red punch auto-fire with charging animation
  if ((gs.redPunchLevel || 0) > 0) {
    gs.punchCooldown = (gs.punchCooldown || 0) + 1;
    
    // Start charging animation 30 frames before firing
    if (gs.punchCooldown >= 270 && gs.punchCooldown < 300) {
      gs.redPunchCharging = true;
      gs.redPunchChargeTimer = (gs.redPunchChargeTimer || 0) + 1;
    }
    
    if (gs.punchCooldown >= 300) {
      gs.punchCooldown = 0;
      gs.redPunchCharging = false;
      gs.redPunchChargeTimer = 0;
      performRedPunch();
    }
  } else {
    gs.redPunchCharging = false;
    gs.redPunchChargeTimer = 0;
  }

  // blue cannon firing logic with turret deploy animation
  if ((gs.blueCannonLevel || 0) > 0) {
    gs.cannonCooldown = (gs.cannonCooldown || 0) + 1;
    
    // Deploy turret animation (quick deploy/retract)
    if (gs.cannonCooldown > 45 && gs.cannonCooldown <= 50) {
      gs.blueCannonTurretDeployed = true;
      gs.blueCannonTurretDeployTimer = (gs.blueCannonTurretDeployTimer || 0) + 1;
    }
    
    if (gs.cannonCooldown > 50) {
      gs.cannonCooldown = 0;
      gs.blueCannonTurretDeployed = false;
      gs.blueCannonTurretDeployTimer = 0;
      
      // Target all valid enemies (excluding reflectors, and including mechs, tanks, dropships, walkers)
      const validTargets = [
        ...(state.enemies || []).filter(e => e.type !== "reflector"),
        ...(state.mechs || []),
        ...(state.tanks || []),
        ...(state.dropships || []),
        ...(state.walkers || [])
      ];
      
      if (validTargets.length > 0) {
        // Pick closest target
        let closestTarget = null;
        let minDist = Infinity;
        for (const t of validTargets) {
          const dist = Math.hypot((t.x || 0) - (gs.x || 0), (t.y || 0) - (gs.y || 0));
          if (dist < minDist) {
            minDist = dist;
            closestTarget = t;
          }
        }
        const target = closestTarget;
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
          // Kamehameha-style energy wave (concentrated beam)
          for (let i = 0; i < 8; i++) {
            safeCall(state.pushBullet, { 
              x: gs.x + (dx / mag) * i * 15, 
              y: gs.y + (dy / mag) * i * 15, 
              dx: (dx / mag) * 14, 
              dy: (dy / mag) * 14, 
              size: 12, 
              owner: "gold",
              kamehameha: true // Special flag for Kamehameha beam rendering
            });
          }
        }
      }
    }
  } else {
    gs.blueCannonTurretDeployed = false;
    gs.blueCannonTurretDeployTimer = 0;
  }

  // EMP firing logic based on reflector level
  if ((state.player.reflectorLevel || 0) > 0) {
    gs.empCooldown = (gs.empCooldown || 0) + 1;
    
    // EMP charges animation before firing
    if (gs.empCooldown > 170 && gs.empCooldown <= 200) {
      gs.empCharging = true;
      gs.empChargeTimer = (gs.empChargeTimer || 0) + 1;
    }
    
    if (gs.empCooldown > 200) {
      gs.empCooldown = 0;
      gs.empCharging = false;
      gs.empChargeTimer = 0;
      
      // Find valid targets (mechs, tanks, dropships, walkers, and other enemies)
      const validTargets = [
        ...state.enemies.filter(e => e.type !== "reflector"),
        ...state.mechs,
        ...state.tanks,
        ...state.dropships,
        ...state.walkers
      ];
      
      if (validTargets.length > 0) {
        // Pick closest target
        let closestTarget = null;
        let minDist = Infinity;
        for (const target of validTargets) {
          const dist = Math.hypot((target.x || 0) - (gs.x || 0), (target.y || 0) - (gs.y || 0));
          if (dist < minDist) {
            minDist = dist;
            closestTarget = target;
          }
        }
        
        if (closestTarget) {
          const dx = (closestTarget.x || 0) - (gs.x || 0);
          const dy = (closestTarget.y || 0) - (gs.y || 0);
          const mag = Math.hypot(dx, dy) || 1;
          
          // Create EMP projectile with level-based properties
          const empLevel = state.player.reflectorLevel;
          const empAOE = 60 + empLevel * 20; // 80-260 radius
          const slowDuration = 120 + empLevel * 30; // 2-5 seconds at 60fps
          const slowStrength = 0.3 + empLevel * 0.05; // 0.35-0.8 slow
          
          safeCall(state.pushEmpProjectile, {
            x: gs.x,
            y: gs.y,
            dx: (dx / mag) * 6,
            dy: (dy / mag) * 6,
            targetX: closestTarget.x,
            targetY: closestTarget.y,
            size: 12,
            owner: "gold",
            aoe: empAOE,
            slowDuration: slowDuration,
            slowStrength: Math.min(0.8, slowStrength),
            level: empLevel
          });
        }
      }
    }
  } else {
    gs.empCharging = false;
    gs.empChargeTimer = 0;
  }
}
