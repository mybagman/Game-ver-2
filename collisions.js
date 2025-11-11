import * as state from './state.js';
import { createExplosion, spawnPowerUp, spawnRandomPowerUp } from './utils.js';

// Helper function to apply damage to player with shield absorption
function applyPlayerDamage(damage) {
  if (state.player.invulnerable) return;
  
  if (state.player.shieldActive && state.player.shieldHealth > 0) {
    state.player.shieldHealth -= damage;
    if (state.player.shieldHealth <= 0) {
      state.player.shieldActive = false;
      state.player.shieldHealth = 0;
      createExplosion(state.player.x, state.player.y, "cyan");
    }
  } else {
    state.player.health -= damage;
  }
}

// Export for use in other modules
export { applyPlayerDamage };

export function updateLightning() {
  state.filterLightning(l => {
    l.x += l.dx; l.y += l.dy;

    if (Math.hypot(l.x-state.player.x, l.y-state.player.y) < state.player.size/2) {
      if (state.player.reflectAvailable) {
        state.pushLightning({x: l.x, y: l.y, dx: -l.dx, dy: -l.dy, size: l.size || 6, damage: l.damage || 15});
        state.pushReflectionEffect({x: l.x, y: l.y, dx: -l.dx, dy: -l.dy, life: 18, maxLife: 18});
        state.player.reflectAvailable = false;
        createExplosion(state.player.x, state.player.y, "cyan");
        return false;
      } else {
        applyPlayerDamage(l.damage);
        return false;
      }
    }

    if (state.goldStar.alive && Math.hypot(l.x-state.goldStar.x, l.y-state.goldStar.y) < state.goldStar.size/2) {
      if (state.goldStar.reflectAvailable) {
        state.pushLightning({x: l.x, y: l.y, dx: -l.dx, dy: -l.dy, size: l.size || 6, damage: l.damage || 15});
        state.pushReflectionEffect({x: l.x, y: l.y, dx: -l.dx, dy: -l.dy, life: 18, maxLife: 18});
        state.goldStar.reflectAvailable = false;
        createExplosion(state.goldStar.x, state.goldStar.y, "cyan");
        return false;
      } else {
        state.goldStar.health -= l.damage;
        if (state.goldStar.health <= 0) { state.goldStar.alive = false; state.goldStar.respawnTimer = 0; state.player.reflectorLevel = 0; createExplosion(state.goldStar.x, state.goldStar.y, "gold"); }
        return false;
      }
    }
    return l.x >= -20 && l.x <= state.canvas.width+20 && l.y >= -20 && l.y <= state.canvas.height+20;
  });
}

export function checkBulletCollisions() {
  for (let bi = state.bullets.length-1; bi >= 0; bi--) {
    const b = state.bullets[bi];

    for (let ti = state.tanks.length - 1; ti >= 0; ti--) {
      const tank = state.tanks[ti];
      if (Math.hypot(b.x - tank.x, b.y - tank.y) < 30) {
        tank.health -= 10;
        state.bullets.splice(bi, 1);
        createExplosion(tank.x, tank.y, "orange");
        break;
      }
    }

    for (let wi = state.walkers.length - 1; wi >= 0; wi--) {
      const walker = state.walkers[wi];
      if (Math.hypot(b.x - walker.x, b.y - walker.y) < 25) {
        walker.health -= 10;
        state.bullets.splice(bi, 1);
        createExplosion(walker.x, walker.y, "cyan");
        break;
      }
    }

    for (let mi = state.mechs.length - 1; mi >= 0; mi--) {
      const mech = state.mechs[mi];
      if (Math.hypot(b.x - mech.x, b.y - mech.y) < 45) {
        if (mech.shieldActive && mech.shieldHealth > 0) {
          mech.shieldHealth -= 10;
          if (mech.shieldHealth <= 0) {
            mech.shieldActive = false;
          }
        } else {
          mech.health -= 10;
        }
        state.bullets.splice(bi, 1);
        createExplosion(mech.x, mech.y, "yellow");
        break;
      }
    }

    for (let di = state.dropships.length - 1; di >= 0; di--) {
      const dropship = state.dropships[di];
      if (Math.hypot(b.x - dropship.x, b.y - dropship.y) < 35) {
        dropship.health -= 10;
        state.bullets.splice(bi, 1);
        createExplosion(dropship.x, dropship.y, "orange");
        break;
      }
    }

    for (let ei = state.enemies.length-1; ei >= 0; ei--) {
      const e = state.enemies[ei]; if (!e) continue;

      if (e.type === "mother-core") {
        for (let ci = e.cores.length - 1; ci >= 0; ci--) {
          const core = e.cores[ci];
          if (Math.hypot(b.x - core.x, b.y - core.y) < 25) {
            core.health -= 10;
            state.bullets.splice(bi, 1);
            createExplosion(core.x, core.y, "cyan");
            if (core.health <= 0) {
              e.cores.splice(ci, 1);
              state.addScore(50);
            }
            break;
          }
        }

        if (e.cores.length === 0 && Math.hypot(b.x - e.x, b.y - e.y) < e.size / 2) {
          e.health -= 15;
          state.bullets.splice(bi, 1);
          createExplosion(e.x, e.y, "red");
          if (e.health <= 0) {
            createExplosion(e.x, e.y, "white");
            state.enemies.splice(ei, 1);
            state.addScore(500);
          }
          break;
        }
        continue;
      }

      if (e.type === "reflector") {
        const dx = b.x-e.x, dy = b.y-e.y, dist = Math.hypot(dx,dy);
        if (dist < Math.max(e.width,e.height)) {
          state.pushLightning({x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, size: 6, damage: 15});
          state.pushReflectionEffect({x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, life: 22, maxLife: 22});
          state.bullets.splice(bi,1); e.health -= 5;
          if (e.health <= 0) { 
            createExplosion(e.x, e.y, "purple"); 
            state.enemies.splice(ei,1); 
            if (!e.fromBoss) { 
              state.addScore(20); 
              spawnPowerUp(e.x, e.y, "health"); 
              spawnPowerUp(e.x, e.y, "reflect"); 
              spawnPowerUp(e.x, e.y, "reflector-level"); 
            } 
          }
          break;
        }
      } else {
        if (Math.hypot(b.x-e.x, b.y-e.y) < (e.size||20)/2) {
          e.health -= (b.owner === "player" ? 10 : 6);
          
          // Track damage for blue triangle enemies to reduce speed
          if (e.type === "triangle") {
            e.damageTaken = (e.damageTaken || 0) + (b.owner === "player" ? 10 : 6);
          }
          
          state.bullets.splice(bi,1);
          if (e.health <= 0) {
            createExplosion(e.x, e.y, e.type === "triangle" ? "cyan" : e.type === "boss" ? "yellow" : e.type === "mini-boss" ? "orange" : "red");
            state.enemies.splice(ei,1);
            if (!e.fromBoss) {
              if (e.type === "boss") state.addScore(100);
              else if (e.type === "mini-boss") state.addScore(50);
              else if (e.type === "triangle") { state.addScore(10); spawnRandomPowerUp(e.x, e.y); }
              else if (e.type === "red-square") { state.addScore(10); spawnRandomPowerUp(e.x, e.y); }
            }
          }
          break;
        }
      }
    }

    for (let di = state.diamonds.length-1; di >= 0; di--) {
      const d = state.diamonds[di];
      for (let ai = d.attachments.length-1; ai >= 0; ai--) {
        const a = d.attachments[ai], radius = (a.size||20)/2 || 10;
        if (Math.hypot(b.x-a.x, b.y-a.y) < radius) {
          a.health = (a.health||30) - (b.owner === "player" ? 10 : 6); 
          state.bullets.splice(bi,1);
          if (a.health <= 0) {
            createExplosion(a.x, a.y, "white");
            if (a.type === "reflector" && !a.fromBoss) {
              spawnPowerUp(a.x, a.y, "health");
              spawnPowerUp(a.x, a.y, "reflect");
              spawnPowerUp(a.x, a.y, "reflector-level");
              state.addScore(20);
            }
            d.attachments.splice(ai,1);
            state.addScore(5);
            if (!d.attachments.some(at => at.type === "reflector")) d.canReflect = false;
          }
          ai = -1;
        }
      }
      if (bi >= 0 && bi < state.bullets.length && Math.hypot(state.bullets[bi].x-d.x, state.bullets[bi].y-d.y) < d.size/2) {
        const damageMultiplier = d.vulnerable ? 1 : 0.3;
        d.health -= (state.bullets[bi].owner === "player" ? 12 : 6) * damageMultiplier;
        state.bullets.splice(bi,1);
        if (d.health <= 0) { 
          createExplosion(d.x, d.y, "white"); 
          d.attachments.forEach(a => state.pushEnemy(a)); 
          state.diamonds.splice(di,1); 
          state.addScore(100); 
        }
        break;
      }
    }
  }
}
