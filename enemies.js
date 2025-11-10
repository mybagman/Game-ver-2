import * as state from './state.js';
import { createExplosion, spawnPowerUp, spawnDebris, handleTunnelCollisionForEntity, diamondReleaseAttachedEnemies } from './utils.js';

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
  } else {
    d.releaseTimer = 0;
    d.releaseCooldown = d.releaseCooldown || 0;
  }
  if (d.releaseCooldown > 0) d.releaseCooldown--;

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

    const dx = d.x - e.x, dy = d.y - e.y, dist = Math.hypot(dx,dy);
    if (dist < 260 && d.attachments.length < 15) {
      const pull = 0.04 + (1 - Math.min(dist/260,1)) * 0.06;
      e.x += dx * pull; e.y += dy * pull;
      if (dist < 28) {
        state.enemies.splice(i,1);
        e.attachedTo = d;
        e.orbitAngle = Math.random()*Math.PI*2;
        if (e.type === "triangle") e.fireRateBoost = true;
        if (e.type === "red-square") e.spawnMini = true;
        if (e.type === "reflector") d.canReflect = true;
        e.speed = 0;
        d.attachments.push(e);
      }
    }
  }

  for (let i = 0; i < d.attachments.length; i++) {
    const a = d.attachments[i];
    a.orbitAngle = (a.orbitAngle||0) + 0.06 + (a.type === "reflector" ? 0.02 : 0);
    const orbitRadius = d.size/2 + 28 + (a.type === "reflector" ? 14 : 0);
    a.x = d.x + Math.cos(a.orbitAngle) * orbitRadius;
    a.y = d.y + Math.sin(a.orbitAngle) * orbitRadius;

    a.shootTimer = (a.shootTimer||0) + 1;
    const fireRate = a.type === "triangle" ? (a.fireRateBoost ? 40 : 100) : 120;
    if (a.shootTimer > fireRate) {
      a.shootTimer = 0;
      const dxp = state.player.x - a.x, dyp = state.player.y - a.y, mag = Math.hypot(dxp,dyp)||1;
      state.pushLightning({x: a.x, y: a.y, dx: (dxp/mag)*5, dy: (dyp/mag)*5, size: 6, damage: 15});
    }

    if (a.type === "reflector") {
      for (let bi = state.bullets.length-1; bi >= 0; bi--) {
        const b = state.bullets[bi], distB = Math.hypot(b.x-a.x, b.y-a.y);
        if (distB < 40) {
          state.pushLightning({x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, size: 6, damage: 15});
          state.pushReflectionEffect({x: b.x, y: b.y, dx: -b.dx, dy: -b.dy, life: 22, maxLife: 22});
          state.bullets.splice(bi,1);
        }
      }
    }
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
  if (d.attachments.length >= 3 && d.shootTimer % 180 === 0) {
    [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}].forEach(dv => state.pushLightning({x: d.x, y: d.y, dx: dv.x*6, dy: dv.y*6, size: 8, damage: 20}));
  }

  const distToPlayer = Math.hypot(d.x-state.player.x, d.y-state.player.y);
  if (distToPlayer < (d.size/2 + state.player.size/2)) {
    if (!state.player.invulnerable) state.player.health -= 30;
    createExplosion(d.x, d.y, "white");
    // Diamond itself doesn't take damage from player collision
  }

  const distToGoldStar = Math.hypot(d.x-state.goldStar.x, d.y-state.goldStar.y);
  if (state.goldStar.alive && distToGoldStar < (d.size/2 + state.goldStar.size/2)) {
    state.goldStar.health -= 25;
    createExplosion(d.x, d.y, "white");
    if (state.goldStar.health <= 0) { state.goldStar.alive = false; state.goldStar.respawnTimer = 0; createExplosion(state.goldStar.x, state.goldStar.y, "gold"); }
  }
}

export function updateTanks() {
  const groundY = state.canvas.height - 30;
  for (let i = state.tanks.length - 1; i >= 0; i--) {
    const tank = state.tanks[i];

    const targetX = state.player.x;
    const dx = targetX - tank.x;
    const distX = Math.abs(dx) || 1;
    const moveX = Math.sign(dx) * Math.min(tank.speed * 1.2, distX);
    tank.x += moveX;

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

    if (tank.health <= 0) {
      createExplosion(tank.x, tank.y, "orange");
      spawnDebris(tank.x, tank.y, 8);
      state.tanks.splice(i, 1);
      state.addScore(30);
      spawnPowerUp(tank.x, tank.y, Math.random() > 0.5 ? "red-punch" : "blue-cannon");
    }
  }
}

export function updateWalkers() {
  const groundY = state.canvas.height - 40;
  for (let i = state.walkers.length - 1; i >= 0; i--) {
    const walker = state.walkers[i];

    const dx = state.player.x - walker.x;
    const distX = Math.abs(dx) || 1;

    walker.x += Math.sign(dx) * Math.min(walker.speed * 1.0, distX);

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
      // flying mechs move a bit faster horizontally
      mech.x += Math.sign(dx) * Math.min(mech.speed * 1.4, distX);

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
      // Grounded mech (legacy behavior)
      const dx = state.player.x - mech.x;
      const distX = Math.abs(dx) || 1;
      mech.x += Math.sign(dx) * Math.min(mech.speed, distX);

      mech.y += (groundY - mech.y) * 0.15;

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
    updateDiamond(d);
    if (d.health <= 0) {
      createExplosion(d.x, d.y, "white");
      // When diamond dies, detach attachments but give them a reattach cooldown so they can't immediately reattach to any diamond.
      d.attachments.forEach(a => {
        a.attachedTo = null;
        a.canReattach = false;
        // 10 seconds cooldown at ~60 FPS = 600 frames
        a.reattachCooldown = 600;
        state.pushEnemy(a);
      });
      state.diamonds.splice(di,1);
      state.addScore(200);
    }
  }

  state.filterEnemies(e => {
    if (!e) return false;
    if (e.type === "boss") { updateBoss(e); return e.health > 0; }
    if (e.type === "mini-boss") { updateMiniBoss(e); return e.health > 0; }
    if (e.type === "mother-core") { updateMotherCore(e); return e.health > 0; }

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
      if (e.vx === undefined && e.vy === undefined) {
        e.x += (dx/dist)*e.speed; e.y += (dy/dist)*e.speed;
      }

      if (e.type === "triangle") {
        e.shootTimer = (e.shootTimer||0) + 1;
        if (e.shootTimer > 100) { e.shootTimer = 0; state.pushLightning({x: e.x, y: e.y, dx: (dx/dist)*5, dy: (dy/dist)*5, size:6, damage:15}); }
      }

      for (let ti = 0; ti < state.tunnels.length; ti++) {
        const t = state.tunnels[ti];
        if (t.active) handleTunnelCollisionForEntity(e, t);
      }

      const distToPlayer = Math.hypot(e.x-state.player.x, e.y-state.player.y);
      if (distToPlayer < (e.size/2 + state.player.size/2)) {
        if (!state.player.invulnerable) state.player.health -= (e.type === "triangle" ? 25 : 15);
        createExplosion(e.x, e.y, "red");
        e.health -= 100;
      }
      const distToGoldStar = Math.hypot(e.x-state.goldStar.x, e.y-state.goldStar.y);
      if (state.goldStar.alive && distToGoldStar < (e.size/2 + state.goldStar.size/2)) {
        state.goldStar.health -= (e.type === "triangle" ? 20 : 12);
        createExplosion(e.x, e.y, "orange");
        if (state.goldStar.health <= 0) { state.goldStar.alive = false; state.goldStar.respawnTimer = 0; createExplosion(state.goldStar.x, state.goldStar.y, "gold"); }
      }
      if (e.health <= 0) {
        if (!e.fromBoss) {
          if (e.type === "triangle") { state.addScore(10); spawnPowerUp(e.x, e.y, "blue-cannon"); }
          else if (e.type === "red-square") { state.addScore(10); spawnPowerUp(e.x, e.y, "red-punch"); }
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
      if (distToPlayer < 30) { if (!state.player.invulnerable) state.player.health -= 15; createExplosion(e.x, e.y, "magenta"); e.health -= 50; }
      const distToGoldStar = Math.hypot(e.x-state.goldStar.x, e.y-state.goldStar.y);
      if (state.goldStar.alive && distToGoldStar < 30) {
        state.goldStar.health -= 15; createExplosion(e.x, e.y, "magenta");
        if (state.goldStar.health <= 0) { state.goldStar.alive = false; state.goldStar.respawnTimer = 0; createExplosion(state.goldStar.x, state.goldStar.y, "gold"); }
      }

      return true;
    }

    return true;
  });

  updateTanks();
  updateWalkers();
  updateMechs();

  if (state.minionsToAdd.length > 0) { state.flushMinions(); }
}
