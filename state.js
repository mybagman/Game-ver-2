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
export let debris = [];
export let explosions = [];
export let lightning = [];
export let powerUps = [];
export let reflectionEffects = [];
export let redPunchEffects = [];
export let minionsToAdd = [];

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
  healAccumulator: 0
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
  speed: 2,
  reflectAvailable: false,
  redPunchLevel: 0,
  blueCannonnLevel: 0,
  redKills: 0,
  blueKills: 0,
  punchCooldown: 0,
  cannonCooldown: 0,
  respawnTimer: 0,
  healAccumulator: 0,
  targetPowerUp: null
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
export function addScore(val) { score += val; }
export function setHighScore(val) { highScore = val; }
export function addHighScore(entry) { highScores.push(entry); }
export function setAuraSparks(val) { auraSparks = val; }
export function setAuraShockwaves(val) { auraShockwaves = val; }
export function incrementAuraPulseTimer() { auraPulseTimer++; }

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
  console.log('[pushEnemy] adding enemy:', e.type, 'at', e.x, e.y);
  enemies.push(e); 
  console.log('[pushEnemy] enemies.length is now:', enemies.length);
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
export function pushDebris(d) { debris.push(d); }
export function pushCloudParticle(c) { cloudParticles.push(c); }
export function pushReflectionEffect(r) { reflectionEffects.push(r); }
export function pushRedPunchEffect(e) { redPunchEffects.push(e); }
export function pushAuraSpark(s) { auraSparks.push(s); }
export function pushAuraShockwave(s) { auraShockwaves.push(s); }
export function filterAuraSparks(fn) { 
  for (let i = auraSparks.length - 1; i >= 0; i--) {
    if (!fn(auraSparks[i])) auraSparks.splice(i, 1);
  }
}
export function filterAuraShockwaves(fn) { 
  for (let i = auraShockwaves.length - 1; i >= 0; i--) {
    if (!fn(auraShockwaves[i])) auraShockwaves.splice(i, 1);
  }
}
export function pushMinion(m) { minionsToAdd.push(m); }
export function flushMinions() { 
  enemies.push(...minionsToAdd); 
  minionsToAdd.length = 0;
}(l); }
export function pushExplosion(e) { explosions.push(e); }
export function pushPowerUp(p) { powerUps.push(p); }
export function pushTunnel(t) { tunnels.push(t); }
export function pushDiamond(d) { diamonds.push(d); }
export function pushTank(t) { tanks.push(t); }
export function pushWalker(w) { walkers.push(w); }
export function pushMech(m) { mechs.push(m); }
export function pushDebris(d) { debris.push(d); }
export function pushCloudParticle(c) { cloudParticles.push(c); }
export function pushReflectionEffect(r) { reflectionEffects.push(r); }
export function pushRedPunchEffect(e) { redPunchEffects.push(e); }
export function pushAuraSpark(s) { auraSparks.push(s); }
export function pushAuraShockwave(s) { auraShockwaves.push(s); }
export function filterAuraSparks(fn) { auraSparks = auraSparks.filter(fn); }
export function filterAuraShockwaves(fn) { auraShockwaves = auraShockwaves.filter(fn); }
export function pushMinion(m) { minionsToAdd.push(m); }
export function flushMinions() { 
  enemies.push(...minionsToAdd); 
  minionsToAdd = []; 
}