import * as state from './state.js';
import { createExplosion, spawnPowerUp, spawnRandomPowerUp, spawnDebris, handleTunnelCollisionForEntity, diamondReleaseAttachedEnemies } from './utils.js';
import { applyPlayerDamage } from './collisions.js';

export function updateBoss(boss) {
  boss.angle = boss.angle||0; boss.angle += 0.01;
  boss.x = state.canvas.width/2 + Math.cos(boss.angle)*150;
  boss.y = 80 + Math.sin(boss.angle)*50;
  boss.spawnTimer = boss.spawnTimer||0; boss.spawnTimer++;
  if (boss.spawnTimer > 200) {
    boss.spawnTimer = 0;
    state.pushMinion({x: boss.x+(Math.random()-0.5)*100, y: boss.y+(Math.random()-0.5)*100, size: 25, speed: 2, health: 30, type: "red-square", fromBoss: true});
  }
  boss.shootTimer = boss.shootTimer||0; boss.shootTimer++;
  if (boss.shootTimer > 150) {
    boss.shootTimer = 0;
    [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}].forEach(d => state.pushLightning({x: boss.x, y: boss.y, dx: d.x*6, dy: d.y*6, size: 8, damage: 20}));
  }
}

export function updateMiniBoss(boss) {
  boss.angle = boss.angle||Math.random()*Math.PI*2; boss.angle += 0.02;
  boss.x = state.canvas.width/2 + Math.cos(boss.angle)*100;
  boss.y = 80 + Math.sin(boss.angle)*30;
  boss.spawnTimer = boss.spawnTimer||0; boss.spawnTimer++;
  if (boss.spawnTimer > 300) {
    boss.spawnTimer = 0;
    state.pushMinion({x: boss.x+(Math.random()-0.5)*80, y: boss.y+(Math.random()-0.5)*80, size: 25, speed: 2.2, health: 30, type: "triangle", fromBoss: true});
  }
  boss.shootTimer = boss.shootTimer||0; boss.shootTimer++;
  if (boss.shootTimer > 180) {
    boss.shootTimer = 0;
    [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0},{x:1,y:1},{x:1,y:-1},{x:-1,y:1},{x:-1,y:-1}].forEach(d => state.pushLightning({x: boss.x, y: boss.y, dx: d.x*5, dy: d.y*5, size: 6, damage: 12}));
  }
}

export function updateMotherCore(e) {
  e.angle = (e.angle || 0) + 0.005;
  e.phaseTimer = (e.phaseTimer || 0) + 1;
  for (let i = 0; i < e.cores.length; i++) {
    const core = e.cores[i];
    core.angle = (core.angle || 0) + 0.01 + i * 0.002;
    const dist = core.distance || 120;
    core.x = e.x + Math.cos(core.angle) * dist;
    core.y = e.y + Math.sin(core.angle) * dist;
    core.shootTimer = (core.shootTimer||0)+1;
    if (core.shootTimer > 200) {
      core.shootTimer = 0;
      for (let a = 0; a < 6; a++) {
        const angle = a / 6 * Math.PI * 2;
        state.pushLightning({x: core.x, y: core.y, dx: Math.cos(angle) * 5, dy: Math.sin(angle) * 5, size: 6, damage: 18});
      }
    }
  }
}

export function updateDiamond(d) {
  d.gravitonTimer = (d.gravitonTimer || 0) + 1;

  if (state.wave === 10) {
    d.releaseTimer = (d.releaseTimer || 0) + 1;
    if (d.releaseTimer >= d.releaseChargeNeeded && d.attachments && d.attachments.length > 0 && d.releaseCooldown <= 0) {
      diamondReleaseAttachedEnemies(d);
      d.releaseTimer = 0;
      d.releaseCooldown = d.releaseCooldownMax;
    }
    
    // Laser shooting mechanics for Wave 11 (Death Star Core Boss)
    d.laserShootTimer = (d.laserShootTimer || 0) + 1;
    if (d.laserShootTimer > 180) {
      d.laserShootTimer = 0;
      // Shoot 4 lasers in cardinal directions toward player
      const angleToPlayer = Math.atan2(state.player.y - d.y, state.player.x - d.x);
      for (let i = 0; i < 4; i++) {
        const angle = angleToPlayer + (i / 4) * Math.PI * 2;
        state.pushLightning({
          x: d.x,
          y: d.y,
          dx: Math.cos(angle) * 6,
          dy: Math.sin(angle) * 6,
          size: 10,
          damage: 25
        });
      }
    }
  } else {
    d.releaseTimer = 0;
    d.releaseCooldown = d.releaseCooldown || 0;
    d.laserShootTimer = 0;
  }
  if (d.releaseCooldown > 0) d.releaseCooldown--;

  // Diamond spawn timer - spawn new enemies periodically
  d.spawnTimer = (d.spawnTimer || 0) + 1;
  if (d.spawnTimer > 350 && d.attachments.length < 5) {
    d.spawnTimer = 0;
    // Spawn 1-2 enemies near the diamond
    const spawnCount = Math.random() < 0.5 ? 1 : 2;
    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 40;
      const spawnX = d.x + Math.cos(angle) * dist;
      const spawnY = d.y + Math.sin(angle) * dist;
      const enemyType = Math.random() < 0.5 ? "red-square" : "triangle";
      
      if (enemyType === "red-square") {
        state.pushEnemy({
          x: spawnX,
          y: spawnY,
          size: 30, speed: 1.8, health: 30, type: "red-square", shootTimer: 0, fromBoss: true,
          attachImmunityTimer: 60  // Shorter immunity for spawned enemies
        });
      } else {
        state.pushEnemy({
          x: spawnX,
          y: spawnY,
          size: 30, speed: 1.5, health: 40, type: "triangle", shootTimer: 0, fromBoss: true,
          attachImmunityTimer: 60  // Shorter immunity for spawned enemies
        });
      }
    }
  }

  if (d.gravitonActive) {
    d.gravitonCharge++;
    if (d.gravitonCharge < 600) {
      const pullRadius = 400;
      state.enemies.forEach(e => {
        if (e === d || e.type === "boss" || e.type === "mini-boss" || e.type === "mother-core") return;
        const dx = d.x - e.x;
        const dy = d.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist < pullRadius) {
          const pullStrength = 0.08 + (1 - dist / pullRadius) * 0.12;
          e.x += (dx / dist) * pullStrength * 10;
          e.y += (dy / dist) * pullStrength * 10;

          if (!d.pulledEnemies.find(pe => pe === e)) {
            d.pulledEnemies.push(e);
          }
        }
      });
      if (d.gravitonCharge % 10 === 0) {
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 200 + Math.random() * 200;
          state.pushExplosion({
            x: d.x + Math.cos(angle) * dist,
            y: d.y + Math.sin(angle) * dist,
            dx: -Math.cos(angle) * 2,
            dy: -Math.sin(angle) * 2,
            radius: 4,
            color: "rgba(100,200,255,0.8)",
            life: 20
          });
        }
      }
    } else if (d.gravitonCharge === 600) {
      d.pulledEnemies.forEach(e => {
        const dx = e.x - d.x;
        const dy = e.y - d.y;
        const dist = Math.hypot(dx, dy) || 1;
        state.pushLightning({
          x: e.x,
          y: e.y,
          dx: (dx / dist) * 12,
          dy: (dy / dist) * 12,
          size: e.size || 8,
          damage: 30
        });
        const idx = state.enemies.indexOf(e);
        if (idx !== -1) state.enemies.splice(idx, 1);
      });
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2;
        state.pushExplosion({
          x: d.x,
          y: d.y,
          dx: Math.cos(angle) * 8,
          dy: Math.sin(angle) * 8,
          radius: 8,
          color: "rgba(255,200,100,0.9)",
          life: 30
        });
      }
      d.vulnerable = true;
      d.vulnerableTimer = 360;
      d.gravitonActive = false;
      d.pulledEnemies = [];
    }
  }

  if (d.vulnerable) {
    d.vulnerableTimer--;
    if (d.vulnerableTimer <= 0) {
      d.vulnerable = false;
    }
  }

  const roamSpeed = 1.6;
  let nearest = null, nd = Infinity;
  for (const e of state.enemies) {
    if (!e || e.type === "diamond" || ["boss","mini-boss"].includes(e.type)) continue;
    const dist = Math.hypot(e.x-d.x, e.y-d.y);
    if (dist < nd) { nd = dist; nearest = e; }
  }
  if (nearest && nd < 800) {
    const dx = nearest.x-d.x, dy = nearest.y-d.y, mag = Math.hypot(dx,dy)||1;
    d.x += (dx/mag)*Math.min(roamSpeed, mag); d.y += (dy/mag)*Math.min(roamSpeed, mag);
  } else {
    d.angle += 0.01;
    const radius = Math.min(300, Math.max(120, (state.canvas.width+state.canvas.height)/8));
    d.x = state.canvas.width/2 + Math.cos(d.angle) * radius;
    d.y = state.canvas.height/2 + Math.sin(d.angle) * radius;
  }

  for (let i = state.enemies.length-1; i >= 0; i--) {
    const e = state.enemies[i];
    if (!e || e === d || e.attachedTo || e.type === "boss" || e.type === "mini-boss") continue;
    if (e.canReattach === false) continue;
    
    // Check immunity timer before allowing attachment
    if (e.attachImmunityTimer && e.attachImmunityTimer > 0) {
      e.attachImmunityTimer--;
      continue;
    }

    const dx = d.x - e.x, dy = d.y - e.y, dist = Math.hypot(dx,dy);
    if (dist < 260 && d.attachments.length < 15) {
      const pull = 0.04 + (1 - Math.min(dist/260,1)) * 0.06;
      e.x += dx * pull; e.y += dy * pull;
      if (dist < 28) {
        // Mark as attached but DON'T remove from enemies array
        e.attachedTo = d;
        e.orbitAngle = Math.random()*Math.PI*2;
        // Store in attachments for visual tracking only
        d.attachments.push(e);
        if (e.type === "reflector") d.canReflect = true;
      }
    }
  }

  // Update visual orbit positions for attached enemies (they still function as normal enemies)
  for (let i = d.attachments.length - 1; i >= 0; i--) {
    const a = d.attachments[i];
    
    // Check if attached enemy still exists in enemies array
    if (!state.enemies.includes(a)) {
      d.attachments.splice(i, 1);
      continue;
    }
    
    // Update orbit angle for visual formation
    a.orbitAngle = (a.orbitAngle||0) + 0.06 + (a.type === "reflector" ? 0.02 : 0);
    const orbitRadius = d.size/2 + 28 + (a.type === "reflector" ? 14 : 0);
    
    // Calculate visual orbit position (stored separately for drawing)
    a.visualOrbitX = d.x + Math.cos(a.orbitAngle) * orbitRadius;
    a.visualOrbitY = d.y + Math.sin(a.orbitAngle) * orbitRadius;
    
    // Recalculate canReflect based on remaining attachments
    d.canReflect = d.attachments.some(att => att.type === "reflector" && state.enemies.includes(att));
  }

  d.shootTimer = (d.shootTimer||0)+1;
  d.pulse = Math.sin(d.shootTimer*0.1)*4;
  if (d.canReflect) {
    for (let bi = state.bullets.length-1; bi >= 0; bi--) {
      const b = state.bullets[bi], dist = Math.hypot(b.x-d.x, b.y-d.y);
      if (dist < 90) {
        state.pushLightning({x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, size: 6, damage: 15});
        state.bullets.splice(bi,1);
      }
    }
  }

  if (d.attachments.some(a=>a.spawnMini) && d.shootTimer % 200 === 0) {
    state.pushMinion({x: d.x+(Math.random()-0.5)*80, y: d.y+(Math.random()-0.5)*80, size: 25, speed: 2, health: 30, type: "red-square", fromBoss: true});
  }
  if (d.attachments.length >= 3 && d.shootTimer % 100 === 0) {
    [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}].forEach(dv => state.pushLightning({x: d.x, y: d.y, dx: dv.x*6, dy: dv.y*6, size: 8, damage: 20}));
  } else if (d.shootTimer % 120 === 0) {
    // Standard 4-direction shot when less than 3 attachments
    [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}].forEach(dv => state.pushLightning({x: d.x, y: d.y, dx: dv.x*6, dy: dv.y*6, size: 8, damage: 20}));
  }

  // Initialize turrets on first update
  if (!d.turrets) {
    d.turrets = [];
    const turretCount = 8;
    for (let i = 0; i < turretCount; i++) {
      const angle = (i / turretCount) * Math.PI * 2;
      d.turrets.push({
        angle: angle,
        shootTimer: Math.random() * 60, // Stagger firing
        fireRate: 80
      });
    }
  }

  // Update and fire turrets
  for (let i = 0; i < d.turrets.length; i++) {
    const turret = d.turrets[i];
    turret.shootTimer = (turret.shootTimer || 0) + 1;
    
    if (turret.shootTimer > turret.fireRate) {
      turret.shootTimer = 0;
      
      // Calculate turret position on diamond
      const turretDist = d.size/2 + 15;
      const turretX = d.x + Math.cos(turret.angle) * turretDist;
      const turretY = d.y + Math.sin(turret.angle) * turretDist;
      
      // Aim at player
      const dx = state.player.x - turretX;
      const dy = state.player.y - turretY;
      const mag = Math.hypot(dx, dy) || 1;
      
      state.pushLightning({
        x: turretX,
        y: turretY,
        dx: (dx / mag) * 5,
        dy: (dy / mag) * 5,
        size: 6,
        damage: 15
      });
    }
  }

  // Mega Power Up Laser Cannon - fires every 5 seconds
  d.laserCooldown = (d.laserCooldown || 0) + 1;
  if (d.laserCooldown > 300) { // 5 seconds at 60fps
    d.laserCooldown = 0;
    d.laserCharging = true;
    d.laserChargeTimer = 0;
  }
  
  // Laser charging and firing
  if (d.laserCharging) {
    d.laserChargeTimer = (d.laserChargeTimer || 0) + 1;
    
    if (d.laserChargeTimer > 60) { // 1 second charge time
      d.laserCharging = false;
      
      // Fire powerful laser at player
      const dx = state.player.x - d.x;
      const dy = state.player.y - d.y;
      const mag = Math.hypot(dx, dy) || 1;
      
      // Create multiple laser projectiles in a tight beam
      for (let i = 0; i < 5; i++) {
        state.pushLightning({
          x: d.x + (dx / mag) * (i * 20),
          y: d.y + (dy / mag) * (i * 20),
          dx: (dx / mag) * 12,
          dy: (dy / mag) * 12,
          size: 15,
          damage: 35,
          color: "rgba(255, 100, 255, 0.9)"
        });
      }
      
      // Visual effects for laser
      for (let j = 0; j < 20; j++) {
        const angle = (j / 20) * Math.PI * 2;
        state.pushExplosion({
          x: d.x,
          y: d.y,
          dx: Math.cos(angle) * 4,
          dy: Math.sin(angle) * 4,
          radius: 6,
          color: "rgba(255, 100, 255, 0.8)",
          life: 20
        });
      }
    }
  }

  // EMP attack - fires at player every 8 seconds
  d.empCooldown = (d.empCooldown || 0) + 1;
  if (d.empCooldown > 480) { // 8 seconds at 60fps
    d.empCooldown = 0;
    
    // Fire EMP at player
    const dx = state.player.x - d.x;
    const dy = state.player.y - d.y;
    const mag = Math.hypot(dx, dy) || 1;
    
    state.pushEmpProjectile({
      x: d.x,
      y: d.y,
      dx: (dx / mag) * 5,
      dy: (dy / mag) * 5,
      targetX: state.player.x,
      targetY: state.player.y,
      size: 15,
      owner: "diamond",
      aoe: 100,
      slowDuration: 180, // 3 seconds
      slowStrength: 0.6,
      level: 5
    });
  }

  const distToPlayer = Math.hypot(d.x-state.player.x, d.y-state.player.y);
  if (distToPlayer < (d.size/2 + state.player.size/2)) {
    applyPlayerDamage(30);
    createExplosion(d.x, d.y, "white");
    // Diamond itself doesn't take damage from player collision
  }

  const distToGoldStar = Math.hypot(d.x-state.goldStar.x, d.y-state.goldStar.y);
  if (state.goldStar.alive && distToGoldStar < (d.size/2 + state.goldStar.size/2)) {
    state.goldStar.health -= 25;
    createExplosion(d.x, d.y, "white");
    if (state.goldStar.health <= 0) { state.goldStar.alive = false; state.goldStar.respawnTimer = 0; state.player.reflectorLevel = 0; createExplosion(state.goldStar.x, state.goldStar.y, "gold"); }
  }
}

export function updateTanks() {
  const groundY = state.canvas.height - 30;
  for (let i = state.tanks.length - 1; i >= 0; i--) {
    const tank = state.tanks[i];

    // Handle slow effect from EMP
    let slowMultiplier = 1.0;
    if (tank.slowTimer && tank.slowTimer > 0) {
      tank.slowTimer--;
      slowMultiplier = 1.0 - (tank.slowedBy || 0);
    }

    const targetX = state.player.x;
    const dx = targetX - tank.x;
    const distX = Math.abs(dx) || 1;
    const moveX = Math.sign(dx) * Math.min(tank.speed * 1.2 * slowMultiplier, distX);
    tank.x += moveX;

    // Boundary constraints - keep tank on screen
    const margin = tank.width / 2 || 30;
    tank.x = Math.max(margin, Math.min(state.canvas.width - margin, tank.x));

    const desiredY = groundY - tank.height/2;
    tank.y += (desiredY - tank.y) * 0.2;

    tank.turretAngle = Math.atan2(state.player.y - tank.y, state.player.x - tank.x);

    tank.shootTimer = (tank.shootTimer || 0) + 1;
    if (tank.shootTimer > 120) {
      tank.shootTimer = 0;
      state.pushLightning({
        x: tank.x,
        y: tank.y,
        dx: Math.cos(tank.turretAngle) * 4,
        dy: Math.sin(tank.turretAngle) * 4,
        size: 8,
        damage: 20
      });
    }

    // Collision with player
    const distToPlayer = Math.hypot(tank.x - state.player.x, tank.y - state.player.y);
    const collisionDist = (tank.width / 2 || 25) + (state.player.size / 2);
    if (distToPlayer < collisionDist) {
      if (state.player.ramMode) {
        // Ram Mode: Player damages tank heavily
        tank.health -= 80;
        createExplosion(tank.x, tank.y, "yellow");
      } else {
        applyPlayerDamage(20);
        createExplosion(tank.x, tank.y, "orange");
        tank.health -= 50; // Tank takes damage from collision too
      }
    }

    // Collision with gold star
    if (state.goldStar.alive) {
      const distToGoldStar = Math.hypot(tank.x - state.goldStar.x, tank.y - state.goldStar.y);
      const gsCollisionDist = (tank.width / 2 || 25) + (state.goldStar.size / 2);
      if (distToGoldStar < gsCollisionDist) {
        state.goldStar.health -= 20;
        if (state.goldStar.health <= 0) {
          state.goldStar.alive = false;
          state.goldStar.respawnTimer = 0;
          createExplosion(state.goldStar.x, state.goldStar.y, "gold");
        }
        createExplosion(tank.x, tank.y, "orange");
        tank.health -= 50;
      }
    }

    if (tank.health <= 0) {
      createExplosion(tank.x, tank.y, "orange");
      spawnDebris(tank.x, tank.y, 8);
      state.tanks.splice(i, 1);
      state.addScore(30);
      spawnRandomPowerUp(tank.x, tank.y);
    }
  }
}

export function updateWalkers() {
  const groundY = state.canvas.height - 40;
  for (let i = state.walkers.length - 1; i >= 0; i--) {
    const walker = state.walkers[i];

    // Handle slow effect from EMP
    let slowMultiplier = 1.0;
    if (walker.slowTimer && walker.slowTimer > 0) {
      walker.slowTimer--;
      slowMultiplier = 1.0 - (walker.slowedBy || 0);
    }

    const dx = state.player.x - walker.x;
    const distX = Math.abs(dx) || 1;

    walker.x += Math.sign(dx) * Math.min(walker.speed * 1.0 * slowMultiplier, distX);

    // Boundary constraints - keep walker on screen
    const margin = walker.width / 2 || 30;
    walker.x = Math.max(margin, Math.min(state.canvas.width - margin, walker.x));

    walker.legPhase = (walker.legPhase || 0) + 0.15;
    const bob = Math.sin(walker.legPhase) * 4;
    const desiredY = groundY + bob;
    walker.y += (desiredY - walker.y) * 0.2;

    walker.shootTimer = (walker.shootTimer || 0) + 1;
    if (walker.shootTimer > 90) {
      walker.shootTimer = 0;
      for (let j = -1; j <= 1; j++) {
        const angle = Math.atan2(state.player.y - walker.y, state.player.x - walker.x) + j * 0.2;
        state.pushLightning({
          x: walker.x,
          y: walker.y,
          dx: Math.cos(angle) * 5,
          dy: Math.sin(angle) * 5,
          size: 6,
          damage: 15
        });
      }
    }

    // Collision with player
    const distToPlayer = Math.hypot(walker.x - state.player.x, walker.y - state.player.y);
    const collisionDist = (walker.width / 2 || 20) + (state.player.size / 2);
    if (distToPlayer < collisionDist) {
      if (state.player.ramMode) {
        // Ram Mode: Player damages walker heavily
        walker.health -= 90;
        createExplosion(walker.x, walker.y, "yellow");
      } else {
        applyPlayerDamage(25);
        createExplosion(walker.x, walker.y, "cyan");
        walker.health -= 60; // Walker takes damage from collision too
      }
    }

    // Collision with gold star
    if (state.goldStar.alive) {
      const distToGoldStar = Math.hypot(walker.x - state.goldStar.x, walker.y - state.goldStar.y);
      const gsCollisionDist = (walker.width / 2 || 20) + (state.goldStar.size / 2);
      if (distToGoldStar < gsCollisionDist) {
        state.goldStar.health -= 25;
        if (state.goldStar.health <= 0) {
          state.goldStar.alive = false;
          state.goldStar.respawnTimer = 0;
          createExplosion(state.goldStar.x, state.goldStar.y, "gold");
        }
        createExplosion(walker.x, walker.y, "cyan");
        walker.health -= 60;
      }
    }

    if (walker.health <= 0) {
      createExplosion(walker.x, walker.y, "cyan");
      spawnDebris(walker.x, walker.y, 10);
      state.walkers.splice(i, 1);
      state.addScore(40);
      spawnPowerUp(walker.x, walker.y, "health");
    }
  }
}

export function updateMechs() {
  const groundY = state.canvas.height - 60;

  for (let i = state.mechs.length - 1; i >= 0; i--) {
    const mech = state.mechs[i];

    // Handle slow effect from EMP
    let slowMultiplier = 1.0;
    if (mech.slowTimer && mech.slowTimer > 0) {
      mech.slowTimer--;
      slowMultiplier = 1.0 - (mech.slowedBy || 0);
    }

    // Dropship deployment animation
    if (mech.deploying) {
      mech.deployProgress = (mech.deployProgress || 0) + 1;
      const deployDuration = 120; // 2 seconds at 60fps
      
      if (mech.deployProgress < deployDuration) {
        // Descend from top
        const targetY = groundY - 100; // Deploy height above ground
        mech.y += (targetY - mech.y) * 0.05;
        
        // Add deployment particles
        if (mech.deployProgress % 5 === 0) {
          for (let p = 0; p < 2; p++) {
            state.pushExplosion({
              x: mech.x + (Math.random() - 0.5) * 40,
              y: mech.y + mech.size/2,
              dx: (Math.random() - 0.5) * 2,
              dy: Math.random() * 2 + 1,
              radius: 3,
              color: "rgba(100, 150, 255, 0.8)",
              life: 20
            });
          }
        }
      } else {
        // Deployment complete - convert dropship into active enemy
        mech.deploying = false;
        mech.dropshipVisible = false;
        mech.flying = false; // Land on ground after deployment
        
        // Create dropship as active enemy
        state.pushDropship({
          x: mech.x,
          y: mech.y - mech.size/2,
          size: mech.size,
          health: 300,
          shootTimer: 0,
          burstCount: 0,
          patrolX: Math.random() * state.canvas.width
        });
      }
    }

    // Backwards compatible: if mech.flying is undefined treat as false (ground mech)
    mech.flying = mech.flying || false;
    mech.dropTimer = (mech.dropTimer || 0);
    mech.dropTimer++;

    // Flying/drop-ship behavior
    if (mech.flying) {
      // Determine a fly height (above ground)
      const flyHeight = Math.max(80, groundY - 180); // don't go too low
      // Move horizontally to patrol or follow player, with some randomness
      const targetX = (mech.patrolX !== undefined) ? mech.patrolX : state.player.x + (mech.patrolOffset || 0);
      // periodically pick new patrolX to make mechs move across the screen
      if (!mech.patrolX || Math.random() < 0.005) {
        mech.patrolX = Math.random() * state.canvas.width;
      }

      const dx = mech.patrolX - mech.x;
      const distX = Math.abs(dx) || 1;
      // flying mechs move a bit faster horizontally (affected by slow)
      mech.x += Math.sign(dx) * Math.min(mech.speed * 1.4 * slowMultiplier, distX);

      // Boundary constraints - keep mech on screen
      const margin = mech.size / 2 || 40;
      mech.x = Math.max(margin, Math.min(state.canvas.width - margin, mech.x));

      // smoothly move to flyHeight
      mech.y += (flyHeight - mech.y) * 0.06;

      // Slight bob for visual feel
      mech.y += Math.sin((mech.bobPhase || 0) + (mech.x * 0.01)) * 0.4;
      mech.bobPhase = (mech.bobPhase || 0) + 0.02;

      // Drop logic: every ~180-260 frames, drop a tank near current x
      const dropInterval = mech.dropInterval || 220;
      if (mech.dropTimer > dropInterval) {
        mech.dropTimer = 0;
        // create a tank that will appear on the ground below the mech's x
        const tankX = mech.x + (Math.random() - 0.5) * 40;
        const tank = {
          x: tankX,
          y: mech.y + 8, // start slightly below the mech visually (they 'fall' to ground in tanks update)
          speed: 1.6,
          height: 20,
          health: 50,
          turretAngle: 0,
          shootTimer: 0
        };
        // Give the tank an initial fall effect: store a small vy which updateTanks will naturally damp if needed.
        tank.vy = 4;
        // Insert tank onto the ground tanks list immediately so it will be managed by updateTanks().
        state.tanks.push(tank);
        // some visual feedback: small explosion/poof at drop location
        for (let p = 0; p < 6; p++) {
          state.pushExplosion({
            x: tankX + (Math.random()-0.5)*12,
            y: mech.y + 10 + (Math.random()-0.5)*8,
            dx: (Math.random()-0.5)*1.5,
            dy: (Math.random()*1.5),
            radius: 3,
            color: "rgba(200,200,255,0.9)",
            life: 20
          });
        }
      }

      // Flying mechs still shoot but maybe less frequently
      mech.shootTimer = (mech.shootTimer || 0) + 1;
      if (mech.shootTimer > 90) {
        mech.shootTimer = 0;
        const angles = [ -0.2, 0, 0.2 ];
        angles.forEach(angleOffset => {
          const angle = Math.atan2(state.player.y - mech.y, state.player.x - mech.x) + angleOffset;
          state.pushLightning({
            x: mech.x,
            y: mech.y,
            dx: Math.cos(angle) * 6,
            dy: Math.sin(angle) * 6,
            size: 7,
            damage: 18
          });
        });
      }

      // Prevent flying mechs from lingering off-screen for too long
      const offscreenMargin = 200;
      if (mech.x < -offscreenMargin || mech.x > state.canvas.width + offscreenMargin) {
        // wrap around horizontally for continuous drops
        if (mech.x < -offscreenMargin) mech.x = state.canvas.width + offscreenMargin;
        else mech.x = -offscreenMargin;
      }

      // collisions while flying: still vulnerable to bullets
      for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
        const b = state.bullets[bi];
        const dist = Math.hypot(b.x - mech.x, b.y - mech.y);
        if (dist < (mech.size || 28)) {
          state.bullets.splice(bi,1);
          mech.health -= b.damage || 10;
          state.pushExplosion({ x: b.x, y: b.y, dx: 0, dy: 0, radius: 3, color: "yellow", life: 12 });
        }
      }

      // If mech crashed to ground or was forced to land (optional flag), fall back to ground behavior:
      if (mech.crashToGround) {
        mech.flying = false;
        // ensure it has sensible y for ground behavior
        mech.y = groundY;
      }
    } else {
      // Grounded mech (spider bot behavior)
      const dx = state.player.x - mech.x;
      const distX = Math.abs(dx) || 1;
      mech.x += Math.sign(dx) * Math.min(mech.speed * slowMultiplier, distX);

      mech.y += (groundY - mech.y) * 0.15;
      
      // Animate spider legs
      mech.legPhase = (mech.legPhase || 0) + 0.15;

      mech.shootTimer = (mech.shootTimer || 0) + 1;
      if (mech.shootTimer > 60) {
        mech.shootTimer = 0;
        const angles = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, -3*Math.PI/4, -Math.PI/2, -Math.PI/4];
        angles.forEach(angle => {
          state.pushLightning({
            x: mech.x,
            y: mech.y,
            dx: Math.cos(angle) * 6,
            dy: Math.sin(angle) * 6,
            size: 8,
            damage: 25
          });
        });
      }
    }

    // Collision with player (works for both flying and grounded mechs)
    const distToPlayer = Math.hypot(mech.x - state.player.x, mech.y - state.player.y);
    const collisionDist = (mech.size / 2) + (state.player.size / 2);
    if (distToPlayer < collisionDist) {
      if (state.player.ramMode) {
        // Ram Mode: Player damages mech heavily
        if (mech.shieldActive && mech.shieldHealth > 0) {
          mech.shieldHealth -= 100;
          if (mech.shieldHealth <= 0) {
            mech.shieldActive = false;
          }
        } else {
          mech.health -= 100;
        }
        createExplosion(mech.x, mech.y, "yellow");
      } else {
        applyPlayerDamage(35);
        createExplosion(mech.x, mech.y, "yellow");
        mech.health -= 80; // Mech takes damage from collision too
      }
    }

    // Collision with gold star
    if (state.goldStar.alive) {
      const distToGoldStar = Math.hypot(mech.x - state.goldStar.x, mech.y - state.goldStar.y);
      const gsCollisionDist = (mech.size / 2) + (state.goldStar.size / 2);
      if (distToGoldStar < gsCollisionDist) {
        state.goldStar.health -= 35;
        if (state.goldStar.health <= 0) {
          state.goldStar.alive = false;
          state.goldStar.respawnTimer = 0;
          createExplosion(state.goldStar.x, state.goldStar.y, "gold");
        }
        createExplosion(mech.x, mech.y, "yellow");
        mech.health -= 80;
      }
    }

    // Death handling works for both flying and ground mechs
    if (mech.health <= 0) {
      createExplosion(mech.x, mech.y, "yellow");
      spawnDebris(mech.x, mech.y, 15);
      // If flying, optionally drop a few tanks as wreckage
      if (mech.flying) {
        for (let d = 0; d < 2; d++) {
          const tankX = mech.x + (Math.random()-0.5) * 60;
          const tank = {
            x: tankX,
            y: mech.y + 8,
            speed: 1.4,
            height: 20,
            health: 40,
            turretAngle: 0,
            shootTimer: 0,
            vy: 4
          };
          state.tanks.push(tank);
        }
      }
      state.mechs.splice(i, 1);
      state.addScore(60);
      spawnPowerUp(mech.x, mech.y, "reflect");
      spawnPowerUp(mech.x, mech.y, "health");
    }
  }
}

// NEW: Molten Diamond Boss - Centre of the Earth final boss
export function updateMoltenDiamond(d) {
  // Multi-part boss system
  if (d.partType === "satellite") {
    // Update satellite parts
    if (!d.separated && d.coreRef && d.coreRef.health > 0) {
      // Orbit around core
      d.orbitAngle += 0.01;
      d.x = d.coreRef.x + Math.cos(d.orbitAngle) * d.orbitRadius;
      d.y = d.coreRef.y + Math.sin(d.orbitAngle) * d.orbitRadius;
      
      // Satellite can separate when core health is below 50%
      if (d.coreRef.health < d.coreRef.maxHealth * 0.5 && d.canSeparate) {
        d.separated = true;
        d.vx = Math.cos(d.orbitAngle) * 2;
        d.vy = Math.sin(d.orbitAngle) * 2;
      }
    } else if (d.separated) {
      // Move independently when separated
      d.x += d.vx || 0;
      d.y += d.vy || 0;
      d.vx *= 0.98;
      d.vy *= 0.98;
      
      // Slowly move toward player
      const dx = state.player.x - d.x;
      const dy = state.player.y - d.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        d.x += (dx / dist) * 0.5;
        d.y += (dy / dist) * 0.5;
      }
      
      // Satellites shoot when separated
      d.shootTimer = (d.shootTimer || 0) + 1;
      if (d.shootTimer > 100) {
        d.shootTimer = 0;
        const angleToPlayer = Math.atan2(state.player.y - d.y, state.player.x - d.x);
        state.pushLightning({
          x: d.x,
          y: d.y,
          dx: Math.cos(angleToPlayer) * 6,
          dy: Math.sin(angleToPlayer) * 6,
          size: 8,
          damage: 20,
          color: "rgba(255, 100, 0, 0.9)"
        });
      }
    }
    return; // Skip the rest for satellite parts
  }
  
  // Core part behavior - shared diamond behavior (graviton, spawning)
  updateDiamond(d);
  
  // Boss-specific timers
  d.heatWaveTimer = (d.heatWaveTimer || 0) + 1;
  d.crystalTimer = (d.crystalTimer || 0) + 1;
  d.lavaPoolTimer = (d.lavaPoolTimer || 0) + 1;
  d.phaseTimer = (d.phaseTimer || 0) + 1;
  d.megaCannonTimer = (d.megaCannonTimer || 0) + 1;
  d.reflectorSpawnTimer = (d.reflectorSpawnTimer || 0) + 1;
  
  // Phase progression based on health
  const healthPercent = d.health / d.maxHealth;
  if (healthPercent > 0.66) {
    d.currentPhase = 1;
  } else if (healthPercent > 0.33) {
    d.currentPhase = 2;
  } else {
    d.currentPhase = 3;
  }
  
  // Heat Wave attack - circular expanding waves of fire
  if (d.heatWaveTimer > (d.currentPhase === 3 ? 180 : 240)) {
    d.heatWaveTimer = 0;
    const waveCount = d.currentPhase + 2; // 3, 4, or 5 waves
    for (let i = 0; i < waveCount; i++) {
      const angle = (i / waveCount) * Math.PI * 2;
      state.pushLightning({
        x: d.x,
        y: d.y,
        dx: Math.cos(angle) * 5,
        dy: Math.sin(angle) * 5,
        size: 12,
        damage: 30 + (d.currentPhase * 5),
        color: "rgba(255, 100, 0, 0.9)"
      });
    }
  }
  
  // Crystal Projectile attack - homing crystals
  if (d.crystalTimer > (d.currentPhase === 3 ? 120 : 180)) {
    d.crystalTimer = 0;
    const crystalCount = d.currentPhase;
    for (let i = 0; i < crystalCount; i++) {
      const angle = Math.atan2(state.player.y - d.y, state.player.x - d.x) + (Math.random() - 0.5) * 0.5;
      state.pushLightning({
        x: d.x,
        y: d.y,
        dx: Math.cos(angle) * 7,
        dy: Math.sin(angle) * 7,
        size: 10,
        damage: 25,
        color: "rgba(255, 50, 200, 0.9)"
      });
    }
  }
  
  // Lava Pool attack (Phase 2+) - area denial
  if (d.currentPhase >= 2 && d.lavaPoolTimer > 300) {
    d.lavaPoolTimer = 0;
    // Spawn lava pool near player
    const offsetAngle = Math.random() * Math.PI * 2;
    const offsetDist = 100 + Math.random() * 50;
    state.pushExplosion({
      x: state.player.x + Math.cos(offsetAngle) * offsetDist,
      y: state.player.y + Math.sin(offsetAngle) * offsetDist,
      dx: 0,
      dy: 0,
      radius: 60,
      color: "rgba(255, 80, 0, 0.8)",
      life: 180, // Lasts 3 seconds
      damage: 10 // Continuous damage
    });
  }
  
  // NEW: Mega Assault Cannon - fires projectiles in all directions
  if (d.megaCannonTimer > (d.currentPhase === 3 ? 300 : 400)) {
    d.megaCannonTimer = 0;
    const projectileCount = 16 + (d.currentPhase * 4); // 20-28 projectiles
    for (let i = 0; i < projectileCount; i++) {
      const angle = (i / projectileCount) * Math.PI * 2;
      state.pushLightning({
        x: d.x,
        y: d.y,
        dx: Math.cos(angle) * 8,
        dy: Math.sin(angle) * 8,
        size: 14,
        damage: 35,
        color: "rgba(255, 0, 0, 0.95)"
      });
    }
    // Visual effect for mega cannon
    for (let i = 0; i < 30; i++) {
      state.pushExplosion({
        x: d.x,
        y: d.y,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.5) * 8,
        radius: 8 + Math.random() * 4,
        color: "rgba(255, 100, 0, 0.9)",
        life: 25
      });
    }
  }
  
  // NEW: Spawn mini reflector units during the fight
  if (d.reflectorSpawnTimer > 450) {
    d.reflectorSpawnTimer = 0;
    const angle = Math.random() * Math.PI * 2;
    const dist = 120;
    state.pushEnemy({
      x: d.x + Math.cos(angle) * dist,
      y: d.y + Math.sin(angle) * dist,
      size: 35,
      speed: 2.5,
      health: 40,
      type: "reflector",
      fromBoss: true,
      reflectCooldown: 0,
      reflectActive: false
    });
  }
  
  // Spawn minions more aggressively in Phase 3
  if (d.currentPhase === 3 && d.spawnTimer > 250) {
    d.spawnTimer = 0;
    // Spawn worms or dinosaurs
    const enemyType = Math.random() < 0.5 ? "worm" : "dinosaur";
    const angle = Math.random() * Math.PI * 2;
    const dist = 100;
    
    if (enemyType === "worm") {
      state.pushEnemy({
        x: d.x + Math.cos(angle) * dist,
        y: d.y + Math.sin(angle) * dist,
        size: 35,
        speed: 2.0,
        health: 60,
        type: "worm",
        shootTimer: 0,
        fromBoss: true,
        segmentCount: 4,
        segments: []
      });
    } else {
      state.pushEnemy({
        x: d.x + Math.cos(angle) * dist,
        y: d.y + Math.sin(angle) * dist,
        size: 45,
        speed: 1.6,
        health: 120,
        type: "dinosaur",
        shootTimer: 0,
        fromBoss: true
      });
    }
  }
}

// NEW: Worm enemy - underground creature with tunneling behavior
export function updateWorm(worm) {
  // Initialize segments if not present
  if (!worm.segments || worm.segments.length === 0) {
    worm.segments = [];
    for (let i = 0; i < worm.segmentCount; i++) {
      worm.segments.push({ x: worm.x, y: worm.y });
    }
  }
  
  // Tunneling behavior - periodically go underground and reappear
  worm.tunnelCooldown = (worm.tunnelCooldown || 0) - 1;
  worm.underwaterTimer = (worm.underwaterTimer || 0) - 1;
  
  if (!worm.underground && worm.tunnelCooldown <= 0) {
    // Go underground
    worm.underground = true;
    worm.underwaterTimer = 90; // 1.5 seconds underground
    worm.tunnelCooldown = 300; // 5 seconds before next tunnel
  }
  
  if (worm.underground && worm.underwaterTimer <= 0) {
    // Resurface near player
    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 100;
    worm.x = state.player.x + Math.cos(angle) * dist;
    worm.y = state.player.y + Math.sin(angle) * dist;
    worm.underground = false;
  }
  
  if (!worm.underground) {
    // Serpentine movement toward player
    const dx = state.player.x - worm.x;
    const dy = state.player.y - worm.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > 0) {
      const speed = worm.speed;
      // Add sinusoidal movement for snake-like motion
      const time = Date.now() * 0.005;
      const perpX = -dy / dist;
      const perpY = dx / dist;
      const wiggle = Math.sin(time + worm.x * 0.01) * 30;
      
      worm.x += (dx / dist) * speed + perpX * wiggle * 0.05;
      worm.y += (dy / dist) * speed + perpY * wiggle * 0.05;
    }
    
    // Update segment positions (follow the head)
    for (let i = worm.segments.length - 1; i > 0; i--) {
      worm.segments[i].x = worm.segments[i - 1].x;
      worm.segments[i].y = worm.segments[i - 1].y;
    }
    if (worm.segments.length > 0) {
      worm.segments[0].x = worm.x;
      worm.segments[0].y = worm.y;
    }
  }
}

// NEW: Dinosaur enemy - prehistoric beast with charge attacks
export function updateDinosaur(dino) {
  dino.chargeTimer = (dino.chargeTimer || 0) - 1;
  dino.roarTimer = (dino.roarTimer || 0) - 1;
  
  // Roar attack - stuns player briefly (visual effect only for now)
  if (dino.roarTimer <= 0) {
    dino.roarTimer = 360; // Roar every 6 seconds
    // Visual effect added in drawing
  }
  
  if (!dino.isCharging) {
    // Normal movement - slow approach
    const dx = state.player.x - dino.x;
    const dy = state.player.y - dino.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > 0) {
      const speed = dino.speed * 0.6; // Slower when not charging
      dino.x += (dx / dist) * speed;
      dino.y += (dy / dist) * speed;
    }
    
    // Start charge when close enough
    if (dist < 300 && dino.chargeTimer <= 0) {
      dino.isCharging = true;
      dino.chargeDuration = 60; // 1 second charge
      dino.chargeTimer = 240; // 4 seconds cooldown
      dino.chargeDx = dx / dist;
      dino.chargeDy = dy / dist;
    }
  } else {
    // Charging attack - fast linear movement
    const chargeSpeed = dino.speed * 3;
    dino.x += dino.chargeDx * chargeSpeed;
    dino.y += dino.chargeDy * chargeSpeed;
    
    dino.chargeDuration--;
    if (dino.chargeDuration <= 0) {
      dino.isCharging = false;
    }
  }
}

export function updateEnemies() {
  if (state.player.invulnerable) { 
    state.player.invulnerableTimer--; 
    if (state.player.invulnerableTimer <= 0) state.player.invulnerable = false; 
  }

  // Decrement reattach cooldowns for enemies so detached units can't reattach for 10s (600 frames)
  for (let ei = state.enemies.length - 1; ei >= 0; ei--) {
    const en = state.enemies[ei];
    if (!en) continue;
    if (en.reattachCooldown && en.reattachCooldown > 0) {
      en.reattachCooldown--;
      if (en.reattachCooldown <= 0) {
        en.canReattach = true;
        delete en.reattachCooldown;
      }
    }
  }

  for (let di = state.diamonds.length-1; di >= 0; di--) {
    const d = state.diamonds[di];
    
    // Use special boss update for molten-diamond
    if (d.type === "molten-diamond") {
      updateMoltenDiamond(d);
    } else {
      updateDiamond(d);
    }
    
    if (d.health <= 0) {
      createExplosion(d.x, d.y, d.type === "molten-diamond" ? "orange" : "white");
      // When diamond dies, detach attachments but give them a reattach cooldown so they can't immediately reattach to any diamond.
      d.attachments.forEach(a => {
        a.attachedTo = null;
        a.canReattach = false;
        // 10 seconds cooldown at ~60 FPS = 600 frames
        a.reattachCooldown = 600;
        state.pushEnemy(a);
      });
      state.diamonds.splice(di,1);
      state.addScore(d.type === "molten-diamond" ? 500 : 200); // Higher score for boss
    }
  }

  state.filterEnemies(e => {
    if (!e) return false;
    
    if (e.type === "boss") { updateBoss(e); return e.health > 0; }
    if (e.type === "mini-boss") { updateMiniBoss(e); return e.health > 0; }
    if (e.type === "mother-core") { updateMotherCore(e); return e.health > 0; }
    
    // NEW: Centre of the Earth enemies
    if (e.type === "worm") { updateWorm(e); return e.health > 0; }
    if (e.type === "dinosaur") { updateDinosaur(e); return e.health > 0; }

    if (e.vx !== undefined || e.vy !== undefined) {
      e.x += (e.vx || 0);
      e.y += (e.vy || 0);
      e.vx *= 0.94;
      e.vy *= 0.94;
      if (Math.abs(e.vx) + Math.abs(e.vy) < 0.2) {
        delete e.vx; delete e.vy;
        e.state = 'normal';
      } else {
        const offscreenMargin = 1000;
        if (e.x < -offscreenMargin || e.x > state.canvas.width + offscreenMargin || e.y < -offscreenMargin || e.y > state.canvas.height + offscreenMargin) {
          return false;
        }
      }
    }

    if (e.type === "triangle" || e.type === "red-square") {
      const dx = state.player.x - e.x, dy = state.player.y - e.y, dist = Math.hypot(dx,dy)||1;
      
      // Handle slow effect from EMP
      let slowMultiplier = 1.0;
      if (e.slowTimer && e.slowTimer > 0) {
        e.slowTimer--;
        slowMultiplier = 1.0 - (e.slowedBy || 0);
      }
      
      if (e.type === "triangle") {
        // Blue triangles: Support units using gold star dodge logic but slower
        if (e.vx === undefined && e.vy === undefined) {
          // Gold star-style danger avoidance (slower than gold star)
          let dangerX = 0, dangerY = 0, dangerCount = 0;
          const DANGER_RADIUS = 120;
          
          // Avoid player bullets
          for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
            const b = state.bullets[bi];
            if (b.owner === "player") {
              const bulletDist = Math.hypot(b.x - e.x, b.y - e.y);
              if (bulletDist < DANGER_RADIUS && bulletDist > 0) {
                const weight = (DANGER_RADIUS - bulletDist) / DANGER_RADIUS;
                dangerX += (e.x - b.x) / bulletDist * weight;
                dangerY += (e.y - b.y) / bulletDist * weight;
                dangerCount++;
              }
            }
          }
          
          // Avoid getting too close to player
          if (dist < 150) {
            const weight = (150 - dist) / 150;
            dangerX += (e.x - state.player.x) / dist * weight * 0.5;
            dangerY += (e.y - state.player.y) / dist * weight * 0.5;
            dangerCount++;
          }
          
          let moveX = 0, moveY = 0;
          
          if (dangerCount > 0) {
            // Dodge away from danger (like gold star)
            moveX = dangerX;
            moveY = dangerY;
          } else {
            // Maintain optimal distance from player (200 units)
            const optimalDistance = 200;
            if (dist > optimalDistance + 50) {
              // Too far - move closer
              moveX = dx / dist * 0.5;
              moveY = dy / dist * 0.5;
            } else if (dist < optimalDistance - 50) {
              // Too close - back away
              moveX = -dx / dist * 0.5;
              moveY = -dy / dist * 0.5;
            } else {
              // At optimal range - strafe perpendicular to player
              const perpX = -dy/dist;
              const perpY = dx/dist;
              e.strafeDirection = e.strafeDirection || (Math.random() < 0.5 ? 1 : -1);
              if (Math.random() < 0.02) e.strafeDirection *= -1;
              moveX = perpX * 0.4 * e.strafeDirection;
              moveY = perpY * 0.4 * e.strafeDirection;
            }
          }
          
          // Apply movement (60% slower than gold star speed of 2)
          const triangleSpeed = 0.8; // Slower than gold star's 2.0
          const moveMag = Math.hypot(moveX, moveY);
          if (moveMag > 0) {
            e.x += (moveX / moveMag) * triangleSpeed * slowMultiplier;
            e.y += (moveY / moveMag) * triangleSpeed * slowMultiplier;
          }
        }
        
        // Fire at player more frequently with slight spread
        e.shootTimer = (e.shootTimer||0) + 1;
        if (e.shootTimer > 80) { // Faster fire rate (was 100)
          e.shootTimer = 0;
          const spread = (Math.random() - 0.5) * 0.2;
          const angle = Math.atan2(dy, dx) + spread;
          state.pushLightning({
            x: e.x, 
            y: e.y, 
            dx: Math.cos(angle) * 5, 
            dy: Math.sin(angle) * 5, 
            size: 6, 
            damage: 15
          });
        }
      } else if (e.type === "red-square") {
        // Red squares: Aggressive melee units that rush the player
        if (e.vx === undefined && e.vy === undefined) {
          e.x += (dx/dist)*e.speed*slowMultiplier;
          e.y += (dy/dist)*e.speed*slowMultiplier;
        }
      }

      for (let ti = 0; ti < state.tunnels.length; ti++) {
        const t = state.tunnels[ti];
        if (t.active) handleTunnelCollisionForEntity(e, t);
      }

      // Boundary constraints - keep enemies on screen (especially important for side-view after wave 11)
      const margin = e.size || 30;
      e.x = Math.max(margin, Math.min(state.canvas.width - margin, e.x));
      e.y = Math.max(margin, Math.min(state.canvas.height - margin, e.y));

      const distToPlayer = Math.hypot(e.x-state.player.x, e.y-state.player.y);
      if (distToPlayer < (e.size/2 + state.player.size/2)) {
        if (state.player.ramMode) {
          // Ram Mode: Player damages enemy instead of taking damage
          e.health -= 60; // Ram damage
          createExplosion(e.x, e.y, "yellow");
          // Add smoke particles on ram
          for (let i = 0; i < 4; i++) {
            state.pushExplosion({
              x: e.x + (Math.random() - 0.5) * 20,
              y: e.y + (Math.random() - 0.5) * 20,
              dx: (Math.random() - 0.5) * 3,
              dy: (Math.random() - 0.5) * 3,
              radius: 7 + Math.random() * 5,
              color: "rgba(255, 150, 50, 0.8)",
              life: 20 + Math.random() * 15
            });
          }
        } else {
          applyPlayerDamage(e.type === "triangle" ? 25 : 15);
          createExplosion(e.x, e.y, "red");
          e.health -= 100;
        }
      }
      const distToGoldStar = Math.hypot(e.x-state.goldStar.x, e.y-state.goldStar.y);
      if (state.goldStar.alive && distToGoldStar < (e.size/2 + state.goldStar.size/2)) {
        state.goldStar.health -= (e.type === "triangle" ? 20 : 12);
        createExplosion(e.x, e.y, "orange");
        if (state.goldStar.health <= 0) { state.goldStar.alive = false; state.goldStar.respawnTimer = 0; state.player.reflectorLevel = 0; createExplosion(state.goldStar.x, state.goldStar.y, "gold"); }
      }
      if (e.health <= 0) {
        if (!e.fromBoss) {
          if (e.type === "triangle") { state.addScore(10); spawnRandomPowerUp(e.x, e.y); }
          else if (e.type === "red-square") { state.addScore(10); spawnRandomPowerUp(e.x, e.y); }
        }
        return false;
      }
      return true;
    }

    if (e.type === "reflector") {
      for (let ti = 0; ti < state.tunnels.length; ti++) {
        const t = state.tunnels[ti];
        if (t.active) handleTunnelCollisionForEntity(e, t);
      }

      // find nearest non-reflector ally within 150
      let nearestAlly = null, minDist = Infinity;
      state.enemies.forEach(ally => {
        if (ally !== e && ally.type !== "reflector") {
          const dist = Math.hypot(ally.x - e.x, ally.y - e.y);
          if (dist < minDist && dist < 150) { minDist = dist; nearestAlly = ally; }
        }
      });

      if (nearestAlly) {
        const dx = nearestAlly.x - e.x, dy = nearestAlly.y - e.y, dist = Math.hypot(dx,dy)||1;
        // standard follow speed when shielding
        e.x += (dx/dist) * e.speed;
        e.y += (dy/dist) * e.speed;
        e.shieldActive = true;
        e.crashMode = false;
      } else {
        // If no nearby ally, decide whether there are any other enemies in the scene.
        const otherEnemiesExist = state.enemies.some(al => al !== e && al.type !== 'reflector');
        if (!otherEnemiesExist) {
          // No other enemies present -> enter crash mode: move faster toward player to try to ram.
          const dx = state.player.x - e.x, dy = state.player.y - e.y, dist = Math.hypot(dx,dy)||1;
          const crashSpeedMultiplier = 1.8; // increased speed when trying to crash
          e.x += (dx/dist) * e.speed * crashSpeedMultiplier;
          e.y += (dy/dist) * e.speed * crashSpeedMultiplier;
          e.shieldActive = false;
          e.crashMode = true;
        } else {
          // No nearby ally but other enemies exist: return to a cautious approach (slower)
          const dx = state.player.x - e.x, dy = state.player.y - e.y, dist = Math.hypot(dx,dy)||1;
          e.x += (dx/dist) * e.speed * 0.5;
          e.y += (dy/dist) * e.speed * 0.5;
          e.shieldActive = false;
          e.crashMode = false;
        }
      }

      e.angle = (e.angle||0)+0.1;

      for (let bi = state.bullets.length-1; bi >= 0; bi--) {
        const b = state.bullets[bi];
        const dist = Math.hypot(b.x - e.x, b.y - e.y);
        if (dist < 50) {
          state.pushLightning({x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, size: 6, damage: 15});
          state.pushReflectionEffect({x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, life: 24, maxLife: 24});
          state.bullets.splice(bi,1);
          e.health -= 5;
        }
      }

      if (e.health <= 0) {
        createExplosion(e.x, e.y, "purple");
        if (!e.fromBoss) { state.addScore(20); spawnPowerUp(e.x, e.y, "health"); spawnPowerUp(e.x, e.y, "reflect"); }
        return false;
      }

      const distToPlayer = Math.hypot(e.x-state.player.x, e.y-state.player.y);
      if (distToPlayer < 30) { applyPlayerDamage(15); createExplosion(e.x, e.y, "magenta"); e.health -= 50; }
      const distToGoldStar = Math.hypot(e.x-state.goldStar.x, e.y-state.goldStar.y);
      if (state.goldStar.alive && distToGoldStar < 30) {
        state.goldStar.health -= 15; createExplosion(e.x, e.y, "magenta");
        if (state.goldStar.health <= 0) { state.goldStar.alive = false; state.goldStar.respawnTimer = 0; state.player.reflectorLevel = 0; createExplosion(state.goldStar.x, state.goldStar.y, "gold"); }
      }

      return true;
    }

    return true;
  });

  updateTanks();
  updateWalkers();
  updateMechs();
  updateDropships();

  if (state.minionsToAdd.length > 0) { state.flushMinions(); }
}

export function updateDropships() {
  const topThirdY = state.canvas.height / 3;
  
  for (let i = state.dropships.length - 1; i >= 0; i--) {
    const dropship = state.dropships[i];
    
    // Handle slow effect from EMP
    let slowMultiplier = 1.0;
    if (dropship.slowTimer && dropship.slowTimer > 0) {
      dropship.slowTimer--;
      slowMultiplier = 1.0 - (dropship.slowedBy || 0);
    }
    
    // Fly to patrol position in top 1/3 of screen
    const targetY = Math.min(topThirdY, 80 + Math.random() * 40);
    dropship.y += (targetY - dropship.y) * 0.03;
    
    // Horizontal patrol movement
    if (!dropship.patrolX || Math.abs(dropship.x - dropship.patrolX) < 20) {
      dropship.patrolX = Math.random() * state.canvas.width;
    }
    
    const dx = dropship.patrolX - dropship.x;
    const distX = Math.abs(dx) || 1;
    dropship.x += Math.sign(dx) * Math.min(2.5 * slowMultiplier, distX);
    
    // Shooting behavior - burst fire every 120-150 frames
    dropship.shootTimer = (dropship.shootTimer || 0) + 1;
    const shootInterval = 120 + Math.random() * 30; // 120-150 frames
    
    if (dropship.shootTimer > shootInterval) {
      // Fire burst of 3-5 projectiles
      const burstSize = 3 + Math.floor(Math.random() * 3);
      dropship.burstCount = 0;
      dropship.burstSize = burstSize;
      dropship.burstTimer = 0;
      dropship.shootTimer = 0;
    }
    
    // Handle burst firing
    if (dropship.burstCount !== undefined && dropship.burstCount < dropship.burstSize) {
      dropship.burstTimer = (dropship.burstTimer || 0) + 1;
      if (dropship.burstTimer >= 10) { // 10 frames between each projectile in burst
        dropship.burstTimer = 0;
        dropship.burstCount++;
        
        // Fire at player with slight spread
        const angle = Math.atan2(state.player.y - dropship.y, state.player.x - dropship.x);
        const spread = (Math.random() - 0.5) * 0.3;
        state.pushLightning({
          x: dropship.x,
          y: dropship.y + dropship.size/2,
          dx: Math.cos(angle + spread) * 5,
          dy: Math.sin(angle + spread) * 5,
          size: 7,
          damage: 18
        });
      }
    }
    
    // Collision with player bullets
    for (let bi = state.bullets.length - 1; bi >= 0; bi--) {
      const b = state.bullets[bi];
      const dist = Math.hypot(b.x - dropship.x, b.y - dropship.y);
      if (dist < dropship.size / 2) {
        state.bullets.splice(bi, 1);
        dropship.health -= b.damage || 10;
        state.pushExplosion({ x: b.x, y: b.y, dx: 0, dy: 0, radius: 3, color: "yellow", life: 12 });
      }
    }
    
    // Death handling
    if (dropship.health <= 0) {
      createExplosion(dropship.x, dropship.y, "orange");
      spawnDebris(dropship.x, dropship.y, 12);
      state.dropships.splice(i, 1);
      state.addScore(50);
      spawnRandomPowerUp(dropship.x, dropship.y);
    }
  }
}
