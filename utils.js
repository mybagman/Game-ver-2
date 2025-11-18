import * as state from './state.js';

export function createExplosion(x,y,color="red"){ 
  for (let i=0;i<20;i++) state.pushExplosion({x, y, dx:(Math.random()-0.5)*6, dy:(Math.random()-0.5)*6, radius:Math.random()*4+2, color, life:30}); 
}

export function spawnPowerUp(x, y, type) {
  state.pushPowerUp({x, y, type, size: 18, lifetime: 600, active: true});
}

export function spawnRandomPowerUp(x, y) {
  // Spawn random power-up from available types
  const powerUpTypes = ["health", "reflect", "red-punch", "blue-cannon", "reflector-level", "rail-gun"];
  const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  spawnPowerUp(x, y, randomType);
}

export function spawnTunnel() {
  const h = state.canvas.height/3, w = 600;
  state.pushTunnel({x: state.canvas.width, y: 0, width: w, height: h, speed: 2, active: true});
  state.pushTunnel({x: state.canvas.width, y: state.canvas.height-h, width: w, height: h, speed: 2, active: true});
}

export function spawnCloudParticles(count = 50) {
  // Create lofi-style fluffy clouds inspired by Dragon Ball Z Nimbus
  for (let i = 0; i < count; i++) {
    state.pushCloudParticle({
      x: Math.random() * state.canvas.width,
      y: Math.random() * state.canvas.height,
      size: Math.random() * 80 + 30, // Larger, fluffier clouds
      opacity: Math.random() * 0.4 + 0.2, // More visible
      speed: Math.random() * 0.8 + 0.3, // Varied speeds for depth
      layer: Math.floor(Math.random() * 3) // 0=background, 1=mid, 2=foreground
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
      size: 30, speed: 1.8, health: 30, type: "red-square", shootTimer: 0, fromBoss,
      attachImmunityTimer: 120  // Short immunity period on spawn
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
      size: 30, speed: 1.5, health: 40, type: "triangle", shootTimer: 0, fromBoss,
      attachImmunityTimer: 120  // Short immunity period on spawn
    });
  }
}

export function spawnReflectors(c) {
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      width: 40, height: 20, angle: 0, speed: 1.2, health: 120, type: "reflector", shieldActive: false, fromBoss: false,
      attachImmunityTimer: 120  // Short immunity period on spawn
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
    releaseCooldownMax: 1800
  });
}

export function spawnTank(count) {
  console.log('[spawnTank] called with count:', count);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * state.canvas.width;
    const y = state.canvas.height - (30 + Math.random() * 60);
    state.pushTank({
      x: x,
      y: y,
      width: 50,
      height: 35,
      health: 90,
      speed: 0.8,
      shootTimer: 0,
      turretAngle: 0
    });
  }
  console.log('[spawnTank] tanks.length after spawn:', state.tanks.length);
}

export function spawnWalker(count) {
  console.log('[spawnWalker] called with count:', count);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * state.canvas.width;
    const y = state.canvas.height - (40 + Math.random() * 80);
    state.pushWalker({
      x: x,
      y: y,
      width: 40,
      height: 60,
      health: 120,
      speed: 1.2,
      shootTimer: 0,
      legPhase: 0
    });
  }
  console.log('[spawnWalker] walkers.length after spawn:', state.walkers.length);
}

export function spawnMech(count) {
  console.log('[spawnMech] called with count:', count);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * state.canvas.width;
    // Start high up for dropship deployment animation
    const y = -50;
    state.pushMech({
      x: x,
      y: y,
      size: 80,
      health: 400,
      speed: 1.5,
      shootTimer: 0,
      shieldActive: true,
      shieldHealth: 150,
      deploying: true,
      dropshipVisible: true,
      deployProgress: 0 // Track deployment animation progress
    });
  }
  console.log('[spawnMech] mechs.length after spawn:', state.mechs.length);
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

export function spawnGroundObjects() {
  // Create ground collision objects for city/building waves
  // These act as impassable, damaging terrain at the bottom of the screen
  const groundHeight = 80;
  const groundY = state.canvas.height - groundHeight;
  
  // Create a series of building/ground blocks
  const blockCount = 8;
  const blockWidth = state.canvas.width / blockCount;
  
  for (let i = 0; i < blockCount; i++) {
    const x = i * blockWidth;
    const heightVariation = Math.random() * 30 - 15; // Vary building heights
    const h = groundHeight + heightVariation;
    
    state.pushGroundObject({
      x: x,
      y: state.canvas.height - h,
      width: blockWidth - 10, // Small gap between buildings
      height: h,
      damage: 15, // Damage per second
      type: 'building'
    });
  }
}

// NEW: Journey to the Centre of the Earth Arc - Enemy spawners
export function spawnWorm(count = 1) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      size: 40,
      speed: 2.2,
      health: 80,
      type: "worm",
      shootTimer: 0,
      // Worm-specific properties
      segmentCount: 5,
      segments: [], // Will be populated in updateEnemies
      tunnelCooldown: 0,
      underground: false,
      underwaterTimer: 0
    });
  }
}

export function spawnDinosaur(count = 1) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      size: 50,
      speed: 1.8,
      health: 150,
      type: "dinosaur",
      shootTimer: 0,
      // Dinosaur-specific properties
      chargeTimer: 0,
      isCharging: false,
      roarTimer: 0
    });
  }
}

export function spawnDragon(count = 1) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      size: 60,
      speed: 2.5,
      health: 200,
      type: "dragon",
      shootTimer: 0,
      // Dragon-specific properties
      flyingHeight: 0, // Oscillates for flying effect
      fireBreathTimer: 0,
      fireBreathCooldown: 0,
      swoopTimer: 0,
      swooping: false,
      swoopTargetX: 0,
      swoopTargetY: 0
    });
  }
}

export function spawnDrill(count = 1) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      size: 45,
      speed: 1.5,
      health: 120,
      type: "drill",
      shootTimer: 0,
      // Drill-specific properties
      drillRotation: 0,
      drilling: false,
      drillTimer: 0,
      burrowTimer: 0,
      burrowed: false,
      debrisTimer: 0
    });
  }
}

export function spawnMoltenDiamond() {
  // Multi-part boss at centre of the earth
  const centerX = state.canvas.width / 2;
  const centerY = state.canvas.height / 3;
  
  // Main core (center part)
  const core = {
    x: centerX,
    y: centerY,
    size: 100,
    speed: 1.0,
    health: 1600, // Doubled from 800
    maxHealth: 1600, // Doubled total health
    damageReduction: 0.5, // Takes 50% less damage
    type: "molten-diamond",
    partType: "core", // Core part
    // Boss-specific properties
    phaseTimer: 0,
    currentPhase: 1,
    heatWaveTimer: 0,
    crystalTimer: 0,
    lavaPoolTimer: 0,
    megaCannonTimer: 0,
    megaCannonCooldown: 0,
    reflectorSpawnTimer: 0,
    attachments: [], // Can spawn minions
    gravitonTimer: 0,
    parts: [] // Will store references to other parts
  };
  
  // Create 4 satellite parts that orbit around the core
  const partCount = 4;
  for (let i = 0; i < partCount; i++) {
    const angle = (i / partCount) * Math.PI * 2;
    const orbitRadius = 120;
    
    const part = {
      x: centerX + Math.cos(angle) * orbitRadius,
      y: centerY + Math.sin(angle) * orbitRadius,
      size: 60,
      speed: 1.0,
      health: 400, // 400 each, total 1600 for parts + 1600 core = 3200 total
      maxHealth: 400,
      damageReduction: 0.5, // Takes 50% less damage
      type: "molten-diamond",
      partType: "satellite", // Satellite part
      partIndex: i,
      orbitAngle: angle,
      orbitRadius: orbitRadius,
      coreRef: core, // Reference to main core
      canSeparate: true,
      separated: false,
      separateTimer: 0
    };
    
    core.parts.push(part);
    state.pushDiamond(part);
  }
  
  state.pushDiamond(core);
}

// Respawn Gold Star while preserving levels/upgrades (used for continue after death)
export function respawnGoldStar() {
  state.goldStar.x = state.canvas.width/4; 
  state.goldStar.y = state.canvas.height/2;
  state.goldStar.health = state.goldStar.maxHealth;
  state.goldStar.alive = true;
  state.goldStar.collecting = false;
  state.goldStar.collectTimer = 0;
  state.goldStar.targetPowerUp = null;
  state.goldStar.respawnTimer = 0;
  state.goldStar.punchCooldown = 0;
  state.goldStar.cannonCooldown = 0;
  state.goldStar.reflectAvailable = false;
  state.goldStar.healAccumulator = 0;
  state.goldStar.railGunCooldown = 0;
  // NOTE: Preserve redPunchLevel, blueCannonLevel, railGunLevel, redKills, blueKills, railGunPowerUpCount
}

// Full reset of Gold Star (used for new game start)
export function resetGoldStar() {
  state.goldStar.x = state.canvas.width/4; 
  state.goldStar.y = state.canvas.height/2;
  state.goldStar.health = state.goldStar.maxHealth;
  state.goldStar.alive = true;
  state.goldStar.redPunchLevel = 0;
  state.goldStar.blueCannonLevel = 0;
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
  state.goldStar.railGunLevel = 0;
  state.goldStar.railGunCooldown = 0;
  state.goldStar.railGunPowerUpCount = 0;
  // Reset player reflector level when gold star is fully reset
  state.player.reflectorLevel = 0;
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

  // If a drawing module exposes a tunnel collision trigger, call it so visuals play.
  // We try multiple safe fallbacks and do not throw if absent.
  try {
    if (typeof state.triggerTunnelCollision === 'function') {
      state.triggerTunnelCollision(entity.x, entity.y);
    } else if (typeof globalThis !== 'undefined' && typeof globalThis.triggerTunnelCollision === 'function') {
      globalThis.triggerTunnelCollision(entity.x, entity.y);
    }
  } catch (err) {
    // swallow - visual trigger is optional
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

export function detachAndLaunchEnemy(diamond, enemy, launchSpeed = 20) {
  enemy.attached = false;
  enemy.attachedTo = null;
  const dx = (enemy.x) - (diamond.x);
  const dy = (enemy.y) - (diamond.y);
  const mag = Math.hypot(dx, dy) || 1;
  enemy.vx = (dx / mag) * launchSpeed;
  enemy.vy = (dy / mag) * launchSpeed;
  // Restore original speed
  enemy.speed = enemy.originalSpeed || 1.5;
  enemy.canReattach = false;
  
  // Clean up diamond-specific properties that shouldn't persist
  delete enemy.attachOffset;
  delete enemy.orbitAngle;
  delete enemy.orbitSpeed;
  delete enemy.state;
  
  setTimeout(() => { enemy.canReattach = true; }, 1200);
  
  // Don't re-add to state.enemies - the enemy should already be there
  // state.pushEnemy(enemy);  // REMOVED - causes duplication
}

export function diamondReleaseAttachedEnemies(diamond) {
  if (!diamond || !diamond.attachments || diamond.attachments.length === 0) return;

  diamond.vulnerable = true;
  diamond.vulnerableTimer = 360;

  // Fire massive beam cannon at player's current position
  // Lock the beam direction at fire time
  const dx = state.player.x - diamond.x;
  const dy = state.player.y - diamond.y;
  const dist = Math.hypot(dx, dy) || 1;
  const beamSpeed = 8;
  
  // Store locked direction in closure
  const lockedDx = (dx / dist) * beamSpeed;
  const lockedDy = (dy / dist) * beamSpeed;
  
  // Create multiple large lightning projectiles for a "beam" effect - quick succession
  for (let i = 0; i < 35; i++) {
    setTimeout(() => {
      state.pushLightning({
        x: diamond.x,
        y: diamond.y,
        dx: lockedDx,
        dy: lockedDy,
        size: 20 + i * 2, // Increasing size for wave effect
        damage: 40
      });
    }, i * 15); // Reduced delay for more cohesive beam (total ~0.5 seconds)
  }
  
  // Create visual beam effect with particles
  for (let j = 0; j < 30; j++) {
    const progress = j / 30;
    const beamX = diamond.x + (dx * progress);
    const beamY = diamond.y + (dy * progress);
    const spreadX = (Math.random() - 0.5) * 15;
    const spreadY = (Math.random() - 0.5) * 15;
    
    state.pushExplosion({
      x: beamX + spreadX,
      y: beamY + spreadY,
      dx: (dx / dist) * 2,
      dy: (dy / dist) * 2,
      radius: 8 + Math.random() * 6,
      color: `rgba(255, ${200 + Math.random() * 55}, 100, 0.9)`,
      life: 40
    });
  }

  const attachedCopy = diamond.attachments.slice();
  attachedCopy.forEach(a => {
    const idx = diamond.attachments.indexOf(a);
    if (idx >= 0) diamond.attachments.splice(idx, 1);
    a.x = diamond.x + (Math.cos(a.orbitAngle || 0) * (diamond.size/2 + 20));
    a.y = diamond.y + (Math.sin(a.orbitAngle || 0) * (diamond.size/2 + 20));
    detachAndLaunchEnemy(diamond, a, 20);
    delete a.orbitAngle;
    a.state = 'launched';
  });

  diamond.pulledEnemies = [];
  createExplosion(diamond.x, diamond.y, "white");
}
