import * as state from './state.js';

export function updatePlayerMovement() {
  // existing movement handling expected to be above this (input handling etc.)
  // this function should be called every frame after player position updates

  // keep player within canvas
  state.player.x = Math.max(state.player.size/2, Math.min(state.canvas.width - state.player.size/2, state.player.x));
  state.player.y = Math.max(state.player.size/2, Math.min(state.canvas.height - state.player.size/2, state.player.y));

  // TUNNEL DAMAGE: damage player while overlapping an active tunnel
  // configurable damage per second
  const TUNNEL_DAMAGE_PER_SECOND = 20; // adjust this value to tune how harmful tunnels are
  const damagePerFrame = TUNNEL_DAMAGE_PER_SECOND / 60; // assuming ~60 FPS

  for (let ti = 0; ti < state.tunnels.length; ti++) {
    const t = state.tunnels[ti];
    if (!t || !t.active) continue;

    // Check overlap between the player's circle and the tunnel rectangle.
    // We'll treat the player's hit area as a circle with radius = player.size/2.
    const radius = state.player.size / 2;
    const nearestX = Math.max(t.x, Math.min(state.player.x, t.x + t.width));
    const nearestY = Math.max(t.y, Math.min(state.player.y, t.y + t.height));
    const dx = state.player.x - nearestX;
    const dy = state.player.y - nearestY;
    const distSq = dx*dx + dy*dy;

    if (distSq < radius * radius) {
      // Player is overlapping the tunnel. Apply damage unless invulnerable.
      if (!state.player.invulnerable) {
        state.player.health -= damagePerFrame;
        // Optional: small visual effect or hurt sound can be triggered here.
      }
    }
  }

  // any other player movement end-of-frame logic...
}

export function handleShooting() {
  if (state.shootCooldown > 0) state.decrementShootCooldown();
  let dirX = 0, dirY = 0;
  if (state.keys["arrowup"]) dirY = -1; 
  if (state.keys["arrowdown"]) dirY = 1;
  if (state.keys["arrowleft"]) dirX = -1; 
  if (state.keys["arrowright"]) dirX = 1;
  if ((dirX !== 0 || dirY !== 0) && state.shootCooldown === 0) {
    const mag = Math.hypot(dirX, dirY) || 1;
    state.pushBullet({x: state.player.x, y: state.player.y, dx: (dirX/mag)*10, dy: (dirY/mag)*10, size: 6, owner: "player"});
    state.setShootCooldown(Math.max(5, Math.floor(10 / state.player.fireRateBoost)));

    state.setFireIndicatorAngle(state.firingIndicatorAngle + Math.PI / 2);
  }
}

export function updateBullets() {
  state.filterBullets(b => {
    b.x += b.dx; b.y += b.dy;
    return b.x >= -40 && b.x <= state.canvas.width+40 && b.y >= -40 && b.y <= state.canvas.height+40;
  });
}

export function updatePowerUps() {
  state.filterPowerUps(p => { p.lifetime--; return p.lifetime > 0; });
}

export function updateTunnels() { 
  for (let i = state.tunnels.length-1; i >= 0; i--) { 
    const t = state.tunnels[i]; 
    if (!t.active) continue; 
    t.x -= t.speed; 
    if (t.x+t.width < 0) state.tunnels.splice(i,1); 
  }
}

export function updateExplosions(){ 
  state.filterExplosions(ex => { 
    ex.x += ex.dx; 
    ex.y += ex.dy; 
    ex.life--; 
    return ex.life>0; 
  }); 
}

export function updateRedPunchEffects() {
  for (let i = state.redPunchEffects.length-1; i >= 0; i--) {
    const e = state.redPunchEffects[i];
    e.life--;
    e.r = e.maxR * (1 - e.life / e.maxLife);
    if (e.life <= 0) state.redPunchEffects.splice(i,1);
  }
}

export function updateDebris() {
  for (let i = state.debris.length - 1; i >= 0; i--) {
    const d = state.debris[i];
    d.x += d.dx;
    d.y += d.dy;
    d.rotation += d.rotationSpeed;
    d.life--;
    if (d.life <= 0) {
      state.debris.splice(i, 1);
    }
  }
}

export function updateCloudParticles() {
  state.cloudParticles.forEach(c => {
    c.x -= c.speed;
    if (c.x + c.size < 0) {
      c.x = state.canvas.width + c.size;
    }
  });
}
