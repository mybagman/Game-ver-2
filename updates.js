import * as state from './state.js';

export function updatePlayerMovement() {
  // Read input and apply movement.
  // NOTE: Movement is restricted to WASD to avoid arrow-key shooting also moving the player.
  let dirX = 0, dirY = 0;
  // use only WASD for movement so arrow keys can be reserved for shooting
  if (state.keys["w"]) dirY = -1;
  if (state.keys["s"]) dirY = 1;
  if (state.keys["a"]) dirX = -1;
  if (state.keys["d"]) dirX = 1;

  // Track if player is moving
  const isMoving = dirX !== 0 || dirY !== 0;
  
  if (isMoving) {
    const mag = Math.hypot(dirX, dirY) || 1;
    // Normalize so diagonal movement isn't faster, then scale by player speed.
    const normalizedDirX = dirX / mag;
    const normalizedDirY = dirY / mag;
    
    state.player.x += normalizedDirX * state.player.speed;
    state.player.y += normalizedDirY * state.player.speed;
    
    // Update velocity for effects
    state.player.vx = normalizedDirX * state.player.speed;
    state.player.vy = normalizedDirY * state.player.speed;
    
    // Calculate target rotation based on movement direction
    state.player.targetRotation = Math.atan2(normalizedDirY, normalizedDirX);
    
    // Add thruster particles when moving
    addThrusterParticles();
  } else {
    state.player.vx = 0;
    state.player.vy = 0;
  }
  
  // Smoothly interpolate rotation towards target
  const rotationSpeed = 0.15; // How fast the ship rotates
  let rotationDiff = state.player.targetRotation - state.player.rotation;
  
  // Normalize rotation difference to [-PI, PI] for shortest path
  while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
  while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;
  
  state.player.rotation += rotationDiff * rotationSpeed;
  
  // Update thruster particles
  updateThrusterParticles();

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
  // arrows control shooting (no change here)
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

// Thruster particle system for engine effects
function addThrusterParticles() {
  if (!state.player.thrusterParticles) state.player.thrusterParticles = [];
  
  // Add particles less frequently for better performance
  if (state.frameCount % 2 !== 0) return;
  
  // Calculate the back of the ship (opposite to movement direction)
  const rotation = state.player.rotation;
  const thrusterOffset = state.player.size * 0.4; // Position behind the ship
  
  // Create 1-2 particles per frame when moving
  const particleCount = Math.random() > 0.5 ? 2 : 1;
  
  for (let i = 0; i < particleCount; i++) {
    // Position particles at the back of the ship
    const offsetX = -Math.cos(rotation) * thrusterOffset;
    const offsetY = -Math.sin(rotation) * thrusterOffset;
    
    // Add some randomness to particle spawn position
    const spread = state.player.size * 0.15;
    const perpX = -Math.sin(rotation) * (Math.random() - 0.5) * spread;
    const perpY = Math.cos(rotation) * (Math.random() - 0.5) * spread;
    
    state.player.thrusterParticles.push({
      x: state.player.x + offsetX + perpX,
      y: state.player.y + offsetY + perpY,
      vx: -Math.cos(rotation) * (2 + Math.random() * 2) - state.player.vx * 0.3,
      vy: -Math.sin(rotation) * (2 + Math.random() * 2) - state.player.vy * 0.3,
      life: 15 + Math.random() * 10,
      maxLife: 25,
      size: 2 + Math.random() * 3,
      hue: 20 + Math.random() * 40 // Orange to yellow
    });
  }
}

function updateThrusterParticles() {
  if (!state.player.thrusterParticles) state.player.thrusterParticles = [];
  
  for (let i = state.player.thrusterParticles.length - 1; i >= 0; i--) {
    const p = state.player.thrusterParticles[i];
    
    // Update position
    p.x += p.vx;
    p.y += p.vy;
    
    // Reduce velocity (friction)
    p.vx *= 0.95;
    p.vy *= 0.95;
    
    // Decrease life
    p.life--;
    
    // Remove dead particles
    if (p.life <= 0) {
      state.player.thrusterParticles.splice(i, 1);
    }
  }
}
