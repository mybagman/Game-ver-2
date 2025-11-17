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

// Helper function to get bullet damage
function getBulletDamage(bullet) {
  return bullet.damage || 10;
}

// Helper function to create spark effects when bullets hit
function createSparkEffect(x, y, count = 6) {
  const sparkColors = ["rgba(255, 200, 100, 0.9)", "rgba(255, 150, 50, 0.8)", "rgba(255, 255, 200, 0.9)"];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    state.pushExplosion({
      x: x,
      y: y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color: sparkColors[i % sparkColors.length],
      life: 10 + Math.random() * 10
    });
  }
}

// Helper function to apply knockback from repulsor bullets
function applyKnockback(entity, bullet, force = 8) {
  if (!bullet.repulsor) return;
  
  const dx = entity.x - bullet.x;
  const dy = entity.y - bullet.y;
  const dist = Math.hypot(dx, dy) || 1;
  
  entity.x += (dx / dist) * force;
  entity.y += (dy / dist) * force;
}

// Helper function to apply plasma AOE damage and mega cannon effects
function applyPlasmaAOE(bullet) {
  if ((!bullet.plasma && !bullet.megaCannon) || !bullet.aoeRadius) return;
  
  const aoeRadius = bullet.aoeRadius;
  const aoeDamage = bullet.megaCannon ? (bullet.damage || 50) * 0.5 : (bullet.damage || 25) * 0.6;
  
  // Create explosion visual
  const explosionColor = bullet.megaCannon ? "megashot" : "plasma";
  createExplosion(bullet.x, bullet.y, explosionColor);
  
  // Mega cannon specific EMP effect
  const hasEMP = bullet.megaCannon && bullet.empDuration > 0;
  
  // Create shockwave particles
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    state.pushExplosion({
      x: bullet.x,
      y: bullet.y,
      dx: Math.cos(angle) * 3,
      dy: Math.sin(angle) * 3,
      radius: 8,
      color: "rgba(255, 100, 255, 0.8)",
      life: 20
    });
  }
  
  // Damage all enemies in AOE radius (and apply EMP for mega cannon)
  state.enemies.forEach(e => {
    if (!e) return;
    const dist = Math.hypot(e.x - bullet.x, e.y - bullet.y);
    if (dist <= aoeRadius) {
      e.health -= aoeDamage;
      // Apply EMP slow effect from mega cannon
      if (hasEMP) {
        e.slowTimer = bullet.empDuration;
        e.slowedBy = bullet.empStrength;
      }
      createExplosion(e.x, e.y, "purple");
    }
  });
  
  state.tanks.forEach(tank => {
    const dist = Math.hypot(tank.x - bullet.x, tank.y - bullet.y);
    if (dist <= aoeRadius) {
      tank.health -= aoeDamage;
      if (hasEMP) {
        tank.slowTimer = bullet.empDuration;
        tank.slowedBy = bullet.empStrength;
      }
      createExplosion(tank.x, tank.y, "purple");
    }
  });
  
  state.walkers.forEach(walker => {
    const dist = Math.hypot(walker.x - bullet.x, walker.y - bullet.y);
    if (dist <= aoeRadius) {
      walker.health -= aoeDamage;
      if (hasEMP) {
        walker.slowTimer = bullet.empDuration;
        walker.slowedBy = bullet.empStrength;
      }
      createExplosion(walker.x, walker.y, "purple");
    }
  });
  
  state.mechs.forEach(mech => {
    const dist = Math.hypot(mech.x - bullet.x, mech.y - bullet.y);
    if (dist <= aoeRadius) {
      if (mech.shieldActive && mech.shieldHealth > 0) {
        mech.shieldHealth -= aoeDamage;
        if (mech.shieldHealth <= 0) {
          mech.shieldActive = false;
        }
      } else {
        mech.health -= aoeDamage;
      }
      if (hasEMP) {
        mech.slowTimer = bullet.empDuration;
        mech.slowedBy = bullet.empStrength;
      }
      createExplosion(mech.x, mech.y, "purple");
    }
  });
  
  state.dropships.forEach(dropship => {
    const dist = Math.hypot(dropship.x - bullet.x, dropship.y - bullet.y);
    if (dist <= aoeRadius) {
      dropship.health -= aoeDamage;
      if (hasEMP) {
        dropship.slowTimer = bullet.empDuration;
        dropship.slowedBy = bullet.empStrength;
      }
      createExplosion(dropship.x, dropship.y, "purple");
    }
  });
}

export function checkBulletCollisions() {
  for (let bi = state.bullets.length-1; bi >= 0; bi--) {
    const b = state.bullets[bi];
    const damage = getBulletDamage(b);

    for (let ti = state.tanks.length - 1; ti >= 0; ti--) {
      const tank = state.tanks[ti];
      if (Math.hypot(b.x - tank.x, b.y - tank.y) < 30) {
        tank.health -= damage;
        createSparkEffect(b.x, b.y, 8); // Add spark effects on impact
        // Add smoke particles on damage
        for (let i = 0; i < 3; i++) {
          state.pushExplosion({
            x: tank.x + (Math.random() - 0.5) * 20,
            y: tank.y + (Math.random() - 0.5) * 20,
            dx: (Math.random() - 0.5) * 2,
            dy: -Math.random() * 3 - 1,
            radius: 6 + Math.random() * 4,
            color: "rgba(80, 80, 80, 0.6)",
            life: 30 + Math.random() * 20
          });
        }
        applyKnockback(tank, b, 5);
        applyPlasmaAOE(b); // Apply AOE before removing bullet
        state.bullets.splice(bi, 1);
        createExplosion(tank.x, tank.y, "orange");
        break;
      }
    }

    for (let wi = state.walkers.length - 1; wi >= 0; wi--) {
      const walker = state.walkers[wi];
      if (Math.hypot(b.x - walker.x, b.y - walker.y) < 25) {
        walker.health -= damage;
        createSparkEffect(b.x, b.y, 8); // Add spark effects on impact
        // Add smoke particles on damage
        for (let i = 0; i < 3; i++) {
          state.pushExplosion({
            x: walker.x + (Math.random() - 0.5) * 20,
            y: walker.y + (Math.random() - 0.5) * 20,
            dx: (Math.random() - 0.5) * 2,
            dy: -Math.random() * 3 - 1,
            radius: 6 + Math.random() * 4,
            color: "rgba(80, 80, 80, 0.6)",
            life: 30 + Math.random() * 20
          });
        }
        applyKnockback(walker, b, 6);
        applyPlasmaAOE(b); // Apply AOE before removing bullet
        state.bullets.splice(bi, 1);
        createExplosion(walker.x, walker.y, "cyan");
        break;
      }
    }

    for (let mi = state.mechs.length - 1; mi >= 0; mi--) {
      const mech = state.mechs[mi];
      if (Math.hypot(b.x - mech.x, b.y - mech.y) < 45) {
        if (mech.shieldActive && mech.shieldHealth > 0) {
          mech.shieldHealth -= damage;
          if (mech.shieldHealth <= 0) {
            mech.shieldActive = false;
          }
        } else {
          mech.health -= damage;
        }
        createSparkEffect(b.x, b.y, 10); // Add spark effects on impact
        // Add smoke particles on damage
        for (let i = 0; i < 4; i++) {
          state.pushExplosion({
            x: mech.x + (Math.random() - 0.5) * 40,
            y: mech.y + (Math.random() - 0.5) * 40,
            dx: (Math.random() - 0.5) * 2,
            dy: -Math.random() * 3 - 1,
            radius: 7 + Math.random() * 5,
            color: "rgba(80, 80, 80, 0.6)",
            life: 30 + Math.random() * 20
          });
        }
        applyKnockback(mech, b, 4);
        applyPlasmaAOE(b); // Apply AOE before removing bullet
        state.bullets.splice(bi, 1);
        createExplosion(mech.x, mech.y, "yellow");
        break;
      }
    }

    for (let di = state.dropships.length - 1; di >= 0; di--) {
      const dropship = state.dropships[di];
      if (Math.hypot(b.x - dropship.x, b.y - dropship.y) < 35) {
        dropship.health -= damage;
        createSparkEffect(b.x, b.y, 8); // Add spark effects on impact
        // Add smoke particles on damage
        for (let i = 0; i < 3; i++) {
          state.pushExplosion({
            x: dropship.x + (Math.random() - 0.5) * 30,
            y: dropship.y + (Math.random() - 0.5) * 30,
            dx: (Math.random() - 0.5) * 2,
            dy: -Math.random() * 3 - 1,
            radius: 6 + Math.random() * 4,
            color: "rgba(80, 80, 80, 0.6)",
            life: 30 + Math.random() * 20
          });
        }
        applyKnockback(dropship, b, 3);
        applyPlasmaAOE(b); // Apply AOE before removing bullet
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
            core.health -= getBulletDamage(b);
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
          e.health -= getBulletDamage(b) * 1.5; // Mother core takes 1.5x damage
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
          state.bullets.splice(bi,1); e.health -= getBulletDamage(b) * 0.5; // Reflectors take half damage
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
          const bulletDamage = getBulletDamage(b);
          e.health -= (b.owner === "player" ? bulletDamage : 6);
          
          createSparkEffect(b.x, b.y, 6); // Add spark effects on impact
          
          // Add smoke particles on damage
          for (let i = 0; i < 2; i++) {
            state.pushExplosion({
              x: e.x + (Math.random() - 0.5) * 15,
              y: e.y + (Math.random() - 0.5) * 15,
              dx: (Math.random() - 0.5) * 2,
              dy: -Math.random() * 2 - 1,
              radius: 5 + Math.random() * 3,
              color: "rgba(80, 80, 80, 0.6)",
              life: 25 + Math.random() * 15
            });
          }
          
          // Track damage for blue triangle enemies to reduce speed
          if (e.type === "triangle") {
            e.damageTaken = (e.damageTaken || 0) + (b.owner === "player" ? bulletDamage : 6);
          }
          
          // Apply knockback from repulsor bullets
          applyKnockback(e, b, 8);
          
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
          const bulletDamage = getBulletDamage(b);
          a.health = (a.health||30) - (b.owner === "player" ? bulletDamage : 6);
          applyKnockback(a, b, 6);
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
        const bulletDamage = getBulletDamage(state.bullets[bi]);
        d.health -= (state.bullets[bi].owner === "player" ? bulletDamage * 1.2 : 6) * damageMultiplier;
        applyKnockback(d, state.bullets[bi], 3);
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

// Lightning Strike Weapon System
export function updateLightningStrikes() {
  // Create new lightning strikes if triggered
  if (state.fireLightningStrike) {
    state.fireLightningStrike = false;
    createLightningStrike(state.lightningStrikeLevel);
  }
  
  // Update existing lightning strikes
  state.filterLightningStrikes(strike => {
    strike.life--;
    
    // Apply damage to chained enemies
    if (strike.life > 0) {
      strike.targets.forEach(target => {
        // Check if target still exists
        let targetStillExists = false;
        const allTargets = [
          ...state.enemies,
          ...state.tanks,
          ...state.walkers,
          ...state.mechs,
          ...state.dropships
        ];
        
        if (allTargets.includes(target)) {
          targetStillExists = true;
          // Apply continuous damage
          const damagePerFrame = 2; // 2 damage per frame
          target.health -= damagePerFrame;
          
          // Visual feedback
          if (state.frameCount % 5 === 0) {
            createExplosion(target.x, target.y, "cyan");
          }
        }
      });
    }
    
    return strike.life > 0;
  });
}

function createLightningStrike(level) {
  // Find nearest enemy to target (single bolt, long range)
  const allTargets = [
    ...state.enemies.filter(e => e.type !== "reflector"),
    ...state.tanks,
    ...state.walkers,
    ...state.mechs,
    ...state.dropships
  ];
  
  if (allTargets.length === 0) return;
  
  // Find closest target to player
  const sorted = allTargets
    .map(t => ({
      target: t,
      dist: Math.hypot(t.x - state.player.x, t.y - state.player.y)
    }))
    .sort((a, b) => a.dist - b.dist);
  
  if (sorted.length === 0) return;
  
  // Start with the nearest enemy
  const firstTarget = sorted[0].target;
  const targets = [firstTarget];
  
  // Chain to another nearby enemy if one exists
  if (sorted.length > 1) {
    // Find nearest enemy to the first target (for chaining)
    const chainTargets = allTargets
      .filter(t => t !== firstTarget)
      .map(t => ({
        target: t,
        dist: Math.hypot(t.x - firstTarget.x, t.y - firstTarget.y)
      }))
      .sort((a, b) => a.dist - b.dist);
    
    if (chainTargets.length > 0 && chainTargets[0].dist < 200) {
      targets.push(chainTargets[0].target);
    }
  }
  
  if (targets.length > 0) {
    // Create single lightning strike bolt (short duration for performance)
    state.pushLightningStrike({
      targets: targets,
      life: 12, // Shorter duration for better performance
      maxLife: 12,
      color: "rgba(100, 180, 255, 0.8)"
    });
    
    // Minimal visual feedback (reduced for performance)
    targets.forEach(target => {
      createExplosion(target.x, target.y, "cyan");
    });
  }
}

// Ram mode collision system - player rams through enemies with shockwave
export function checkRamModeCollisions() {
  if (!state.player.ramMode) return;
  
  const ramLevel = state.player.ramLevel || 1;
  const baseDamage = 40;
  const damagePerLevel = 20; // 40, 60, 80 damage for levels 1-3
  const ramDamage = baseDamage + (ramLevel - 1) * damagePerLevel;
  
  // Base shockwave radius scales with level
  const baseShockwaveRadius = 40;
  const shockwavePerLevel = 20; // 40, 60, 80 radius for levels 1-3
  const shockwaveRadius = baseShockwaveRadius + (ramLevel - 1) * shockwavePerLevel;
  
  const hitEnemies = [];
  
  // Check collision with regular enemies
  for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
    const enemy = state.enemies[ei];
    const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    
    if (dist < state.player.size + (enemy.size || 30) / 2) {
      enemy.health -= ramDamage;
      hitEnemies.push(enemy);
      
      // Knockback
      const dx = enemy.x - state.player.x;
      const dy = enemy.y - state.player.y;
      const mag = dist || 1;
      enemy.x += (dx / mag) * 30;
      enemy.y += (dy / mag) * 30;
      
      if (enemy.health <= 0) {
        if (!enemy.fromBoss) {
          if (enemy.type === "triangle") { state.addScore(10); spawnRandomPowerUp(enemy.x, enemy.y); }
          else if (enemy.type === "red-square") { state.addScore(10); spawnRandomPowerUp(enemy.x, enemy.y); }
        }
        state.enemies.splice(ei, 1);
      }
    }
  }
  
  // Check collision with tanks
  for (let ti = state.tanks.length - 1; ti >= 0; ti--) {
    const tank = state.tanks[ti];
    const dist = Math.hypot(tank.x - state.player.x, tank.y - state.player.y);
    
    if (dist < state.player.size + 30) {
      tank.health -= ramDamage;
      hitEnemies.push(tank);
      
      // Knockback
      const dx = tank.x - state.player.x;
      const dy = tank.y - state.player.y;
      const mag = dist || 1;
      tank.x += (dx / mag) * 25;
      tank.y += (dy / mag) * 25;
    }
  }
  
  // Check collision with walkers
  for (let wi = state.walkers.length - 1; wi >= 0; wi--) {
    const walker = state.walkers[wi];
    const dist = Math.hypot(walker.x - state.player.x, walker.y - state.player.y);
    
    if (dist < state.player.size + 25) {
      walker.health -= ramDamage;
      hitEnemies.push(walker);
      
      // Knockback
      const dx = walker.x - state.player.x;
      const dy = walker.y - state.player.y;
      const mag = dist || 1;
      walker.x += (dx / mag) * 28;
      walker.y += (dy / mag) * 28;
    }
  }
  
  // Check collision with mechs
  for (let mi = state.mechs.length - 1; mi >= 0; mi--) {
    const mech = state.mechs[mi];
    const dist = Math.hypot(mech.x - state.player.x, mech.y - state.player.y);
    
    if (dist < state.player.size + 40) {
      if (mech.shieldActive && mech.shieldHealth > 0) {
        mech.shieldHealth -= ramDamage;
        if (mech.shieldHealth <= 0) {
          mech.shieldActive = false;
        }
      } else {
        mech.health -= ramDamage;
      }
      hitEnemies.push(mech);
      
      // Knockback
      const dx = mech.x - state.player.x;
      const dy = mech.y - state.player.y;
      const mag = dist || 1;
      mech.x += (dx / mag) * 20;
      mech.y += (dy / mag) * 20;
    }
  }
  
  // If we hit anything, create shockwave effect with level-based radius
  if (hitEnemies.length > 0 && state.frameCount % 3 === 0) {
    // Visual shockwave ring
    state.pushRedPunchEffect({
      x: state.player.x,
      y: state.player.y,
      maxR: shockwaveRadius,
      r: 0,
      life: 12,
      maxLife: 12,
      color: ramLevel === 3 ? "rgba(255, 100, 255, 0.9)" : ramLevel === 2 ? "rgba(255, 150, 100, 0.8)" : "rgba(255, 200, 100, 0.7)",
      fill: false,
      ring: true
    });
    
    // Shockwave particles
    const particleCount = 6 + ramLevel * 4; // More particles at higher levels
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      state.pushExplosion({
        x: state.player.x,
        y: state.player.y,
        dx: Math.cos(angle) * 5,
        dy: Math.sin(angle) * 5,
        radius: 4 + ramLevel,
        color: ramLevel === 3 ? "rgba(255, 100, 255, 0.9)" : ramLevel === 2 ? "rgba(255, 150, 100, 0.8)" : "rgba(255, 200, 100, 0.7)",
        life: 15
      });
    }
    
    // Apply shockwave AOE damage to nearby enemies
    const shockwaveAOEDamage = ramDamage * 0.4; // 40% of direct hit damage
    
    // AOE damage to enemies
    for (const enemy of state.enemies) {
      const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
      if (dist < shockwaveRadius && dist > state.player.size + (enemy.size || 30) / 2) {
        enemy.health -= shockwaveAOEDamage;
        createExplosion(enemy.x, enemy.y, "orange");
      }
    }
    
    // AOE damage to tanks
    for (const tank of state.tanks) {
      const dist = Math.hypot(tank.x - state.player.x, tank.y - state.player.y);
      if (dist < shockwaveRadius && dist > state.player.size + 30) {
        tank.health -= shockwaveAOEDamage;
        createExplosion(tank.x, tank.y, "orange");
      }
    }
    
    // AOE damage to walkers
    for (const walker of state.walkers) {
      const dist = Math.hypot(walker.x - state.player.x, walker.y - state.player.y);
      if (dist < shockwaveRadius && dist > state.player.size + 25) {
        walker.health -= shockwaveAOEDamage;
        createExplosion(walker.x, walker.y, "orange");
      }
    }
    
    // AOE damage to mechs
    for (const mech of state.mechs) {
      const dist = Math.hypot(mech.x - state.player.x, mech.y - state.player.y);
      if (dist < shockwaveRadius && dist > state.player.size + 40) {
        if (mech.shieldActive && mech.shieldHealth > 0) {
          mech.shieldHealth -= shockwaveAOEDamage;
        } else {
          mech.health -= shockwaveAOEDamage;
        }
        createExplosion(mech.x, mech.y, "orange");
      }
    }
  }
}
