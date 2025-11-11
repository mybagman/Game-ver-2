// == Globals and initial state ==
export let canvas, ctx;

export function setCanvas(c) { canvas = c; }
export function setCtx(c) { ctx = c; }

export let cloudParticles = [];
export let bullets = [];
export let enemies = [];
export let diamonds = [];
export let tunnels = [];
export let tanks = [];
export let walkers = [];
export let mechs = [];
export let dropships = [];
export let debris = [];
export let explosions = [];
export let lightning = [];
export let powerUps = [];
export let reflectionEffects = [];
export let redPunchEffects = [];
export let minionsToAdd = [];
export let homingMissiles = [];
export let empProjectiles = [];

export let keys = {};
export let shootCooldown = 0;
export let frameCount = 0;
export let firingIndicatorAngle = 0;

export let score = 0;
export let wave = 0;
export let waveTransition = false;
export let waveTransitionTimer = 0;
export const WAVE_BREAK_MS = 3000;

export let highScore = 0;
export let highScores = [];

export let gameOver = false;
export let recordedScoreThisRun = false;
export let lastDeathWave = 0;

export let cinematic = {
  playing: false,
  playerName: "Pilot"
};

export let player = {
  x: 0,
  y: 0,
  size: 28,
  speed: 4,
  health: 100,
  maxHealth: 100,
  lives: 3,
  invulnerable: false,
  invulnerableTimer: 0,
  reflectAvailable: false,
  fireRateBoost: 1,
  healAccumulator: 0,
  rotation: -Math.PI / 2, // Start pointing up (0 degrees in game coordinates)
  targetRotation: -Math.PI / 2,
  vx: 0, // velocity x
  vy: 0, // velocity y
  thrusterParticles: [], // engine particles
  // Dash system properties
  dashing: false,
  dashTimer: 0,
  dashCooldown: 0,
  lastKeyPress: { key: null, time: 0 },
  // Reflector power-up system (now creates shield instead of missiles)
  reflectorLevel: 0,
  reflectorCooldown: 0,
  // Shield system
  shieldHealth: 0,
  maxShieldHealth: 0,
  shieldActive: false
};

export let goldStar = {
  x: 0,
  y: 0,
  size: 36,
  health: 200,
  maxHealth: 200,
  alive: true,
  collecting: false,
  collectTimer: 0,
  speed: 3.5,  // Increased from 2 to 3.5 (1.75x faster)
  reflectAvailable: false,
  redPunchLevel: 0,
  blueCannonLevel: 0,
  redKills: 0,
  blueKills: 0,
  punchCooldown: 0,
  cannonCooldown: 0,
  respawnTimer: 0,
  healAccumulator: 0,
  targetPowerUp: null,
  // New homing missile system (moved from player)
  homingMissileLevel: 0,
  homingMissileCooldown: 0,
  // Animation states for visual upgrades
  redPunchCharging: false,
  redPunchChargeTimer: 0,
  blueCannonTurretDeployed: false,
  blueCannonTurretDeployTimer: 0,
  dronePodDetached: false,
  dronePodReturnTimer: 0,
  // Power-up visual effect animations
  redPunchAnimation: { active: false, frame: 0, particles: [] },
  blueCannonAnimation: { active: false, frame: 0, energyLines: [] },
  homingMissileAnimation: { active: false, frame: 0, pods: [] }
};

export const GOLD_STAR_PICKUP_FRAMES = 30;
export const PICKUP_RADIUS = 60;
export const MIN_SPAWN_DIST = 220;

export const goldStarAura = {
  baseRadius: 50,
  radius: 50,
  pulse: 0,
  level: 0,
  active: false
};

export let auraSparks = [];
export let auraShockwaves = [];
export let auraPulseTimer = 0;

export let backgroundOffset = 0;

// Mutation functions
export function incrementFrameCount() { frameCount++; }
export function decrementShootCooldown() { if (shootCooldown > 0) shootCooldown--; }
export function setShootCooldown(val) { shootCooldown = val; }
export function setFireIndicatorAngle(val) { firingIndicatorAngle = val; }
export function incrementBackgroundOffset(val) { backgroundOffset += val; }
export function setWaveTransition(val) { waveTransition = val; }
export function setWaveTransitionTimer(val) { waveTransitionTimer = val; }
export function incrementWaveTransitionTimer() { waveTransitionTimer++; }
export function incrementWave() { wave++; }
export function setGameOver(val) { gameOver = val; }
export function setRecordedScoreThisRun(val) { recordedScoreThisRun = val; }
export function setLastDeathWave(val) { lastDeathWave = val; }
export function addScore(val) { score += val; }
export function setHighScore(val) { highScore = val; }
export function addHighScore(entry) { highScores.push(entry); }
export function setAuraSparks(val) { auraSparks = val; }
export function setAuraShockwaves(val) { auraShockwaves = val; }
export function incrementAuraPulseTimer() { auraPulseTimer++; }

// Explicit setters/getters for primitives so callers don't accidentally capture import-time snapshots
export function setScore(value) { score = value; }
export function getScore() { return score; }
export function setWave(value) { wave = value; }
export function getWave() { return wave; }

// Array mutators
export function clearBullets() { bullets.length = 0; }
export function clearLightning() { lightning.length = 0; }

export function filterBullets(fn) { 
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (!fn(bullets[i])) bullets.splice(i, 1);
  }
}
export function filterPowerUps(fn) { 
  for (let i = powerUps.length - 1; i >= 0; i--) {
    if (!fn(powerUps[i])) powerUps.splice(i, 1);
  }
}
export function filterLightning(fn) { 
  for (let i = lightning.length - 1; i >= 0; i--) {
    if (!fn(lightning[i])) lightning.splice(i, 1);
  }
}
export function filterExplosions(fn) { 
  for (let i = explosions.length - 1; i >= 0; i--) {
    if (!fn(explosions[i])) explosions.splice(i, 1);
  }
}
export function filterEnemies(fn) { 
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (!fn(enemies[i])) enemies.splice(i, 1);
  }
}

export function pushEnemy(e) { 
  // keep minimal logging; useful during debugging
  console.log('[pushEnemy] adding enemy:', e && e.type, 'at', e && e.x, e && e.y);
  enemies.push(e); 
}
export function pushBullet(b) { bullets.push(b); }
export function pushLightning(l) { lightning.push(l); }
export function pushExplosion(e) { explosions.push(e); }
export function pushPowerUp(p) { powerUps.push(p); }
export function pushTunnel(t) { tunnels.push(t); }
export function pushDiamond(d) { diamonds.push(d); }
export function pushTank(t) { tanks.push(t); }
export function pushWalker(w) { walkers.push(w); }
export function pushMech(m) { mechs.push(m); }
export function pushDropship(d) { dropships.push(d); }
export function pushDebris(d) { debris.push(d); }
export function pushCloudParticle(c) { cloudParticles.push(c); }
export function pushReflectionEffect(r) { reflectionEffects.push(r); }
export function pushRedPunchEffect(e) { redPunchEffects.push(e); }
export function pushAuraSpark(s) { auraSparks.push(s); }
export function pushAuraShockwave(s) { auraShockwaves.push(s); }
export function pushHomingMissile(m) { homingMissiles.push(m); }
export function pushEmpProjectile(e) { empProjectiles.push(e); }

export function filterAuraSparks(fn) { auraSparks = auraSparks.filter(fn); }
export function filterAuraShockwaves(fn) { auraShockwaves = auraShockwaves.filter(fn); }
export function filterHomingMissiles(fn) { 
  for (let i = homingMissiles.length - 1; i >= 0; i--) {
    if (!fn(homingMissiles[i])) homingMissiles.splice(i, 1);
  }
}
export function filterEmpProjectiles(fn) { 
  for (let i = empProjectiles.length - 1; i >= 0; i--) {
    if (!fn(empProjectiles[i])) empProjectiles.splice(i, 1);
  }
}

export function pushMinion(m) { minionsToAdd.push(m); }
export function flushMinions() { 
  if (minionsToAdd.length) {
    enemies.push(...minionsToAdd); 
    minionsToAdd.length = 0;
  }
}

// Call this to reset everything for a new run
export function resetGame() {
  console.log('[resetGame] resetting game state for a new run');

  // clear collections
  cloudParticles.length = 0;
  bullets.length = 0;
  enemies.length = 0;
  diamonds.length = 0;
  tunnels.length = 0;
  tanks.length = 0;
  walkers.length = 0;
  mechs.length = 0;
  dropships.length = 0;
  debris.length = 0;
  explosions.length = 0;
  lightning.length = 0;
  powerUps.length = 0;
  reflectionEffects.length = 0;
  redPunchEffects.length = 0;
  minionsToAdd.length = 0;
  auraSparks.length = 0;
  auraShockwaves.length = 0;
  homingMissiles.length = 0;
  empProjectiles.length = 0;

  // reset simple state
  keys = {};
  shootCooldown = 0;
  frameCount = 0;
  firingIndicatorAngle = 0;
  score = 0;
  wave = 0;
  waveTransition = false;
  waveTransitionTimer = 0;
  gameOver = false;
  recordedScoreThisRun = false;
  lastDeathWave = 0;
  auraPulseTimer = 0;
  backgroundOffset = 0;

  // reset player
  player.x = 0;
  player.y = 0;
  player.size = 28;
  player.speed = 4;
  player.health = player.maxHealth = 100;
  player.lives = 3;
  player.invulnerable = false;
  player.invulnerableTimer = 0;
  player.reflectAvailable = false;
  player.fireRateBoost = 1;
  player.healAccumulator = 0;
  player.rotation = -Math.PI / 2;
  player.targetRotation = -Math.PI / 2;
  player.vx = 0;
  player.vy = 0;
  player.thrusterParticles = [];
  player.dashing = false;
  player.dashTimer = 0;
  player.dashCooldown = 0;
  player.lastKeyPress = { key: null, time: 0 };
  player.reflectorLevel = 0;
  player.reflectorCooldown = 0;
  player.shieldHealth = 0;
  player.maxShieldHealth = 0;
  player.shieldActive = false;

  // reset gold star
  goldStar.x = 0;
  goldStar.y = 0;
  goldStar.size = 36;
  goldStar.health = goldStar.maxHealth = 200;
  goldStar.alive = true;
  goldStar.collecting = false;
  goldStar.collectTimer = 0;
  goldStar.speed = 3.5;  // Increased from 2 to 3.5 (1.75x faster)
  goldStar.reflectAvailable = false;
  goldStar.redPunchLevel = 0;
  goldStar.blueCannonLevel = 0;
  goldStar.redKills = 0;
  goldStar.blueKills = 0;
  goldStar.punchCooldown = 0;
  goldStar.cannonCooldown = 0;
  goldStar.respawnTimer = 0;
  goldStar.healAccumulator = 0;
  goldStar.targetPowerUp = null;
  goldStar.homingMissileLevel = 0;
  goldStar.homingMissileCooldown = 0;
  goldStar.redPunchCharging = false;
  goldStar.redPunchChargeTimer = 0;
  goldStar.blueCannonTurretDeployed = false;
  goldStar.blueCannonTurretDeployTimer = 0;
  goldStar.dronePodDetached = false;
  goldStar.dronePodReturnTimer = 0;
  goldStar.redPunchAnimation = { active: false, frame: 0, particles: [] };
  goldStar.blueCannonAnimation = { active: false, frame: 0, energyLines: [] };
  goldStar.homingMissileAnimation = { active: false, frame: 0, pods: [] };

  // aura
  goldStarAura.radius = goldStarAura.baseRadius = 50;
  goldStarAura.pulse = 0;
  goldStarAura.level = 0;
  goldStarAura.active = false;

  console.log('[resetGame] state after reset:', {
    gameOver, score, wave, playerLives: player.lives, playerHealth: player.health, goldStarAlive: goldStar.alive
  });
}

// Optional: defensive check you can call before rendering the game over screen to avoid false positives
export function shouldShowGameOver() {
  // adjust conditions to match your intended rules
  return gameOver || (player.lives <= 0) || (!goldStar.alive && wave > 0);
}

// Getters for live access to objects/primitives
export function getGameOver() { return gameOver; }
export function getPlayer() { return player; }
export function getPlayerLives() { return player.lives; }
export function getPlayerHealth() { return player.health; }

// Add helper to reset animation state for live objects
export function resetAllAnimationTimers() {
  function resetList(list) {
    if (!Array.isArray(list)) return;
    list.forEach(obj => {
      if (!obj) return;
      if (typeof obj.animFrame !== 'undefined') obj.animFrame = 0;
      if (typeof obj.animTimer !== 'undefined') obj.animTimer = 0;
      if (obj.animation && typeof obj.animation.reset === 'function') {
        try { obj.animation.reset(); } catch (e) { /* ignore animation reset errors */ }
      }
    });
  }

  resetList(enemies);
  resetList(mechs);
  resetList(tanks);
  resetList(bullets);
  resetList(walkers);
  resetList(minionsToAdd);
  // extend with other live lists as needed...
}
