import * as state from './state.js';

export function createExplosion(x,y,color="red"){ 
  for (let i=0;i<20;i++) state.pushExplosion({x, y, dx:(Math.random()-0.5)*6, dy:(Math.random()-0.5)*6, radius:Math.random()*4+2, color, life:30}); 
}

export function spawnPowerUp(x, y, type) {
  state.pushPowerUp({x, y, type, size: 18, lifetime: 600, active: true});
}

export function spawnTunnel() {
  const h = state.canvas.height/3, w = 600;
  state.pushTunnel({x: state.canvas.width, y: 0, width: w, height: h, speed: 2, active: true});
  state.pushTunnel({x: state.canvas.width, y: state.canvas.height-h, width: w, height: h, speed: 2, active: true});
}

export function spawnCloudParticles(count = 50) {
  for (let i = 0; i < count; i++) {
    state.pushCloudParticle({
      x: Math.random() * state.canvas.width,
      y: Math.random() * state.canvas.height,
      size: Math.random() * 60 + 20,
      opacity: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.2
    });
  }
}

export function spawnDebris(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    state.pushDebris({
      x: x,
      y: y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      size: Math.random() * 8 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      life: 60 + Math.random() * 40,
      maxLife: 60 + Math.random() * 40
    });
  }
}

export function getSafeSpawnPosition(minDist = state.MIN_SPAWN_DIST) {
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * state.canvas.width;
    const y = Math.random() * state.canvas.height;
    const dxP = x - state.player.x, dyP = y - state.player.y;
    const dxG = x - state.goldStar.x, dyG = y - state.goldStar.y;
    const dP = Math.hypot(dxP, dyP);
    const dG = Math.hypot(dxG, dyG);
    if (dP >= minDist && dG >= minDist) return { x, y };
  }
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { x: 10, y: Math.random() * state.canvas.height };
  if (edge === 1) return { x: state.canvas.width - 10, y: Math.random() * state.canvas.height };
  if (edge === 2) return { x: Math.random() * state.canvas.width, y: 10 };
  return { x: Math.random() * state.canvas.width, y: state.canvas.height - 10 };
}

export function spawnRedSquares(c, fromBoss = false) {
  console.log('[spawnRedSquares] called with count:', c);
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    console.log('[spawnRedSquares] spawning at position:', pos);
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      size: 30, speed: 1.8, health: 30, type: "red-square", shootTimer: 0, fromBoss
    });
  }
  console.log('[spawnRedSquares] enemies.length after spawn:', state.enemies.length);
}

export function spawnTriangles(c, fromBoss = false) {
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      size: 30, speed: 1.5, health: 40, type: "triangle", shootTimer: 0, fromBoss
    });
  }
}

export function spawnReflectors(c) {
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      width: 40, height: 20, angle: 0, speed: 1.2, health: 200, type: "reflector", shieldActive: false, fromBoss: false
    });
  }
}

export function spawnBoss() {
  let pos = { x: state.canvas.width/2, y: 100 };
  const dP = Math.hypot(pos.x - state.player.x, pos.y - state.player.y);
  const dG = Math.hypot(pos.x - state.goldStar.x, pos.y - state.goldStar.y);
  if (dP < state.MIN_SPAWN_DIST || dG < state.MIN_SPAWN_DIST) {
    pos = getSafeSpawnPosition(state.MIN_SPAWN_DIST + 50);
  }
  state.pushEnemy({x: pos.x, y: pos.y, size: 150, health: 1000, type: "boss", spawnTimer: 0, shootTimer: 0, angle: 0});
}

export function spawnMiniBoss() {
  const pos = getSafeSpawnPosition();
  state.pushEnemy({x: pos.x, y: pos.y, size: 80, health: 500, type: "mini-boss", spawnTimer: 0, shootTimer: 0, angle: Math.random()*Math.PI*2});
}

export function spawnDiamondEnemy() {
  const pos = getSafeSpawnPosition();
  state.pushDiamond({
    x: pos.x, 
    y: pos.y, 
    size: 40, 
    health: 200, 
    type: "diamond", 
    attachments: [], 
    canReflect: false, 
    angle: Math.random()*Math.PI*2, 
    shootTimer: 0, 
    pulse: 0,
    gravitonTimer: 0,
    gravitonActive: false,
    gravitonCharge: 0,
    vulnerable: false,
    vulnerableTimer: 0,
    pulledEnemies: [],
    releaseTimer: 0,
    releaseChargeNeeded: 600,
    releaseCooldown: 0,
    releaseCooldownMax: 900
  });
}

export function spawnTank(count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * state.canvas.width;
    const y = state.canvas.height - (30 + Math.random() * 60);
    state.pushTank({
      x: x,
      y: y,
      width: 50,
      height: 35,
      health: 150,
      speed: 0.8,
      shootTimer: 0,
      turretAngle: 0
    });
  }
}

export function spawnWalker(count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * state.canvas.width;
    const y = state.canvas.height - (40 + Math.random() * 80);
    state.pushWalker({
      x: x,
      y: y,
      width: 40,
      height: 60,
      health: 200,
      speed: 1.2,
      shootTimer: 0,
      legPhase: 0
    });
  }
}

export function spawnMech(count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * state.canvas.width;
    const y = state.canvas.height - (50 + Math.random() * 100);
    state.pushMech({
      x: x,
      y: y,
      size: 80,
      health: 400,
      speed: 1.5,
      shootTimer: 0,
      shieldActive: true,
      shieldHealth: 150
    });
  }
}

export function spawnMotherCore() {
  const pos = { x: state.canvas.width / 2, y: state.canvas.height / 2 };
  state.pushEnemy({
    x: pos.x,
    y: pos.y,
    size: 250,
    health: 3000,
    maxHealth: 3000,
    type: "mother-core",
    phase: 1,
    shootTimer: 0,
    phaseTimer: 0,
    angle: 0,
    cores: [
      { angle: 0, distance: 120, health: 200, shootTimer: 0, x: pos.x + Math.cos(0) * 120, y: pos.y + Math.sin(0) * 120 },
      { angle: Math.PI * 2/3, distance: 120, health: 200, shootTimer: 0, x: pos.x + Math.cos(Math.PI * 2/3) * 120, y: pos.y + Math.sin(Math.PI * 2/3) * 120 },
      { angle: Math.PI * 4/3, distance: 120, health: 200, shootTimer: 0, x: pos.x + Math.cos(Math.PI * 4/3) * 120, y: pos.y + Math.sin(Math.PI * 4/3) * 120 }
    ]
  });
}

export function respawnGoldStar() {
  state.goldStar.x = state.canvas.width/4; 
  state.goldStar.y = state.canvas.height/2;
  state.goldStar.health = state.goldStar.maxHealth;
  state.goldStar.alive = true;
  state.goldStar.redPunchLevel = 0;
  state.goldStar.blueCannonnLevel = 0;
  state.goldStar.redKills = 0;
  state.goldStar.blueKills = 0;
  state.goldStar.collecting = false;
  state.goldStar.collectTimer = 0;
  state.goldStar.targetPowerUp = null;
  state.goldStar.respawnTimer = 0;
  state.goldStar.punchCooldown = 0;
  state.goldStar.cannonCooldown = 0;
  state.goldStar.reflectAvailable = false;
  state.goldStar.healAccumulator = 0;
}

export function respawnPlayer() {
  state.player.health = state.player.maxHealth;
  state.player.x = state.canvas.width/2;
  state.player.y = state.canvas.height/2;
  state.player.invulnerable = true;
  state.player.invulnerableTimer = 120;
  state.player.healAccumulator = 0;
}

export function isAABBColliding(ax, ay, aw, ah, bx, by, bw, bh) {
  return !(ax + aw < bx || ax > bx + bw || ay + ah < by || ay > by + bh);
}

export function handleTunnelCollisionForEntity(entity, tunnel) {
  const ew = entity.width || entity.size || 20;
  const eh = entity.height || entity.size || 20;
  const ex = entity.x - (entity.width ? entity.width/2 : (entity.size ? entity.size/2 : 10));
  const ey = entity.y - (entity.height ? entity.height/2 : (entity.size ? entity.size/2 : 10));

  if (!isAABBColliding(ex, ey, ew, eh, tunnel.x, tunnel.y, tunnel.width, tunnel.height)) return false;

  const leftOverlap = (ex + ew) - tunnel.x;
  const rightOverlap = (tunnel.x + tunnel.width) - ex;
  const topOverlap = (ey + eh) - tunnel.y;
  const bottomOverlap = (tunnel.y + tunnel.height) - ey;

  const minOverlap = Math.min(leftOverlap, rightOverlap, topOverlap, bottomOverlap);

  if (minOverlap === leftOverlap) {
    entity.x = tunnel.x - ew/2 - 1;
  } else if (minOverlap === rightOverlap) {
    entity.x = tunnel.x + tunnel.width + ew/2 + 1;
  } else if (minOverlap === topOverlap) {
    entity.y = tunnel.y - eh/2 - 1;
  } else {
    entity.y = tunnel.y + tunnel.height + eh/2 + 1;
  }

  if (entity.vx !== undefined) {
    entity.vx *= 0.4;
    entity.vy *= 0.4;
  } else {
    entity.vx = 0;
    entity.vy = 0;
  }

  return true;
}

export function attachEnemyToDiamond(diamond, enemy) {
  enemy.attached = true;
  enemy.attachedTo = diamond;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.canReattach = false;
  enemy.attachOffset = { x: enemy.x - diamond.x, y: enemy.y - diamond.y };
  diamond.attachments.push(enemy);
}

export function detachAndLaunchEnemy(diamond, enemy, launchSpeed = 12) {
  enemy.attached = false;
  enemy.attachedTo = null;
  const dx = (enemy.x) - (diamond.x);
  const dy = (enemy.y) - (diamond.y);
  const mag = Math.hypot(dx, dy) || 1;
  enemy.vx = (dx / mag) * launchSpeed;
  enemy.vy = (dy / mag) * launchSpeed;
  enemy.canReattach = false;
  setTimeout(() => { enemy.canReattach = true; }, 1200);
  state.pushEnemy(enemy);
}

export function diamondReleaseAttachedEnemies(diamond) {
  if (!diamond || !diamond.attachments || diamond.attachments.length === 0) return;

  diamond.vulnerable = true;
  diamond.vulnerableTimer = 360;

  const attachedCopy = diamond.attachments.slice();
  attachedCopy.forEach(a => {
    const idx = diamond.attachments.indexOf(a);
    if (idx >= 0) diamond.attachments.splice(idx, 1);
    a.x = diamond.x + (Math.cos(a.orbitAngle || 0) * (diamond.size/2 + 20));
    a.y = diamond.y + (Math.sin(a.orbitAngle || 0) * (diamond.size/2 + 20));
    detachAndLaunchEnemy(diamond, a, 12);
    delete a.orbitAngle;
    a.speed = a.speed || 1.5;
    a.state = 'launched';
  });

  diamond.pulledEnemies = [];
  createExplosion(diamond.x, diamond.y, "white");
}