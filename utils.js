import * as state from './state.js';

// Explosion effect
export function createExplosion(x, y, color = "red") { 
  for (let i = 0; i < 20; i++) {
    state.pushExplosion({
      x, y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      radius: Math.random() * 4 + 2,
      color,
      life: 30
    });
  }
}

// Spawn a power-up
export function spawnPowerUp(x, y, type) {
  state.pushPowerUp({
    x, y,
    type,
    size: 18,
    lifetime: 600,
    active: true
  });
}

// Spawn tunnel obstacles
export function spawnTunnel() {
  const h = state.canvas.height / 3, w = 600;
  state.pushTunnel({ x: state.canvas.width, y: 0, width: w, height: h, speed: 2, active: true });
  state.pushTunnel({ x: state.canvas.width, y: state.canvas.height - h, width: w, height: h, speed: 2, active: true });
}

// Spawn cloud particles for effects
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

// Spawn debris pieces
export function spawnDebris(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    state.pushDebris({
      x,
      y,
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

// Find a safe spawn position far from player and gold star
export function getSafeSpawnPosition(minDist = state.MIN_SPAWN_DIST) {
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * state.canvas.width;
    const y = Math.random() * state.canvas.height;

    const dxP = x - state.player.x;
    const dyP = y - state.player.y;
    const dxG = x - state.goldStar.x;
    const dyG = y - state.goldStar.y;

    const distPlayer = Math.sqrt(dxP * dxP + dyP * dyP);
    const distGold = Math.sqrt(dxG * dxG + dyG * dyG);

    if (distPlayer >= minDist && distGold >= minDist) {
      return { x, y };
    }
  }
  // fallback if a safe position wasn't found
  return { x: Math.random() * state.canvas.width, y: Math.random() * state.canvas.height };
}

// Spawn red square enemies
export function spawnRedSquares(count) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({ x: pos.x, y: pos.y, type: "red-square" });
  }
}

// Spawn triangle enemies
export function spawnTriangles(count) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({ x: pos.x, y: pos.y, type: "triangle" });
  }
}

// Spawn reflectors
export function spawnReflectors(count) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({ x: pos.x, y: pos.y, type: "reflector" });
  }
}

// Spawn boss
export function spawnBoss() {
  const pos = getSafeSpawnPosition();
  state.pushEnemy({ x: pos.x, y: pos.y, type: "boss" });
}

// Spawn mini-boss
export function spawnMiniBoss() {
  const pos = getSafeSpawnPosition();
  state.pushEnemy({ x: pos.x, y: pos.y, type: "mini-boss" });
}

// Spawn diamond enemy
export function spawnDiamondEnemy() {
  const pos = getSafeSpawnPosition();
  state.pushDiamond({ x: pos.x, y: pos.y });
}

// Spawn tank
export function spawnTank(count) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushTank({ x: pos.x, y: pos.y });
  }
}

// Spawn walker
export function spawnWalker(count) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushWalker({ x: pos.x, y: pos.y });
  }
}

// Spawn mech
export function spawnMech(count) {
  for (let i = 0; i < count; i++) {
    const pos = getSafeSpawnPosition();
    state.pushMech({ x: pos.x, y: pos.y });
  }
}

// Spawn mother-core
export function spawnMotherCore() {
  const pos = getSafeSpawnPosition();
  state.pushMotherCore({ x: pos.x, y: pos.y });
}

// Respawn player
export function respawnPlayer() {
  state.player.x = state.canvas.width / 2;
  state.player.y = state.canvas.height / 2;
  state.player.health = state.player.maxHealth;
  state.player.invulnerable = true;
  state.player.invulnerableTimer = 0;
}

// Respawn gold star
export function respawnGoldStar() {
  const pos = getSafeSpawnPosition();
  state.goldStar.x = pos.x;
  state.goldStar.y = pos.y;
}