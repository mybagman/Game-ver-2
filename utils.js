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
export function spawnRedSquares(c, fromBoss = false) {
  console.log('[spawnRedSquares] spawning', c, 'red squares');
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    console.log('[spawnRedSquares] enemy position:', pos);
    state.pushEnemy({
      x: pos.x,
      y: pos.y,
      size: 30, speed: 1.8, health: 30, type: "red-square", shootTimer: 0, fromBoss
    });
  }
  console.log('[spawnRedSquares] enemies array length:', state.enemies.length);
}

// Spawn triangle enemies
export function spawnTriangles(count = 1) {
  const c = Math.max(0, Math.floor(count));
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    state.pushEnemy({ x: pos.x, y: pos.y, type: "triangle" });
  }
}

// Spawn reflectors
export function spawnReflectors(count = 1) {
  const c = Math.max(0, Math.floor(count));
  for (let i = 0; i < c; i++) {
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
export function spawnTank(count = 1) {
  const c = Math.max(0, Math.floor(count));
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    state.pushTank({ x: pos.x, y: pos.y });
  }
}

// Spawn walker
export function spawnWalker(count = 1) {
  const c = Math.max(0, Math.floor(count));
  for (let i = 0; i < c; i++) {
    const pos = getSafeSpawnPosition();
    state.pushWalker({ x: pos.x, y: pos.y });
  }
}

// Spawn mech
export function spawnMech(count = 1) {
  const c = Math.max(0, Math.floor(count));
  for (let i = 0; i < c; i++) {
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

// Release attached enemies from a diamond: detach and launch them outward.
export function diamondReleaseAttachedEnemies(diamond) {
  if (!diamond || !Array.isArray(diamond.attachments) || diamond.attachments.length === 0) return;

  for (let i = 0; i < diamond.attachments.length; i++) {
    const a = diamond.attachments[i];
    if (!a) continue;
    // detach
    a.attachedTo = null;
    a.canReattach = false;

    // defensive: ensure a position exists
    a.x = a.x ?? diamond.x;
    a.y = a.y ?? diamond.y;

    // compute outward launch vector
    const dx = a.x - diamond.x;
    const dy = a.y - diamond.y;
    const dist = Math.hypot(dx, dy) || 1;
    const force = 6 + Math.random() * 4;
    a.vx = (dx / dist) * force;
    a.vy = (dy / dist) * force;

    a.state = 'launched';

    // re-add to enemies processing (use pushEnemy if available)
    if (state && typeof state.pushEnemy === 'function') {
      state.pushEnemy(a);
    } else {
      // fallback: push directly into enemies array if it exists
      if (Array.isArray(state.enemies)) state.enemies.push(a);
    }

    // small visual effect
    if (state && typeof state.pushExplosion === 'function') {
      state.pushExplosion({
        x: a.x,
        y: a.y,
        dx: (dx / dist) * 2,
        dy: (dy / dist) * 2,
        radius: 3,
        color: "rgba(255,180,120,0.9)",
        life: 20
      });
    }
  }

  diamond.attachments = [];
  createExplosion(diamond.x, diamond.y, "white");
}

// Handle collision/interaction between a moving entity and a tunnel.
// This is intentionally conservative: it nudges intersecting entities out and applies a small tunnel-driven force.
export function handleTunnelCollisionForEntity(e, t) {
  if (!e || !t || !t.active) return;

  // approximate entity radius
  const r = (e.size || 20) / 2;

  const left = t.x;
  const right = t.x + t.width;
  const top = t.y;
  const bottom = t.y + t.height;

  // quick AABB circle overlap test
  const nearestX = Math.max(left, Math.min(e.x, right));
  const nearestY = Math.max(top, Math.min(e.y, bottom));
  const dx = e.x - nearestX;
  const dy = e.y - nearestY;
  const distSq = dx * dx + dy * dy;
  if (distSq > r * r) return; // no collision

  // if inside tunnel bounds, nudge entity out away from tunnel centerline and apply tunnel motion
  const tunnelCenterY = top + (t.height / 2);
  // push horizontally away from tunnel (tunnels generally move left, so nudge left)
  const tunnelMotion = (typeof t.speed === 'number') ? t.speed : 2;
  // Determine a primary push axis: if tunnel is top/bottom it's vertical span; nudge vertically to avoid sticking
  const verticalGap = Math.abs(e.y - tunnelCenterY);

  // small outward nudge
  const nudgeStrength = 4;
  if (e.y < tunnelCenterY) {
    e.y -= nudgeStrength;
  } else {
    e.y += nudgeStrength;
  }

  // apply horizontal motion of the tunnel to the entity (help carry it)
  e.vx = (e.vx || 0) - tunnelMotion * 0.6;
  // slight downward/upward pull toward center to simulate tunnel flow
  e.vy = (e.vy || 0) + (tunnelCenterY - e.y) * 0.02;

  // safety clamp so velocities don't become NaN or huge
  if (!isFinite(e.vx)) e.vx = 0;
  if (!isFinite(e.vy)) e.vy = 0;

  // Mark state so other logic can respond
  e.state = e.state || 'tunnel-affected';
}
