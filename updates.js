import * as state from './state.js';
import { DASH_SPEED_MULTIPLIER, BOOST_SPEED_MULTIPLIER, BOOST_DEPLETION_RATE, BOOST_REGENERATION_RATE } from './input.js';
import { triggerTunnelCollision } from './drawing/Effects.js';

export function updatePlayerMovement() {
  // Update dash timers
  if (state.player.dashing) {
    state.player.dashTimer--;
    if (state.player.dashTimer <= 0) {
      state.player.dashing = false;
    }
  }
  if (state.player.dashCooldown > 0) {
    state.player.dashCooldown--;
  }

  // Update boost meter
  if (state.player.boosting) {
    // Deplete boost meter while boosting
    state.player.boostMeter -= BOOST_DEPLETION_RATE;
    if (state.player.boostMeter <= 0) {
      state.player.boostMeter = 0;
      state.player.boosting = false;
      state.player.boostKey = null;
    }
  } else {
    // Regenerate boost meter when not boosting
    if (state.player.boostMeter < state.player.maxBoostMeter) {
      state.player.boostMeter = Math.min(state.player.maxBoostMeter, state.player.boostMeter + BOOST_REGENERATION_RATE);
    }
  }

  // Handle slow effect from EMP
  let slowMultiplier = 1.0;
  if (state.player.slowTimer && state.player.slowTimer > 0) {
    state.player.slowTimer--;
    slowMultiplier = 1.0 - (state.player.slowedBy || 0);
  }

  // Read input and apply movement.
  // NOTE: Movement is restricted to WASD to avoid arrow-key shooting also moving the player.
  let dirX = 0, dirY = 0;
  // use only WASD for movement so arrow keys can be reserved for shooting
  if (state.keys["w"]) dirY = -1;
  if (state.keys["s"]) dirY = 1;
  if (state.keys["a"]) dirX = -1;
  if (state.keys["d"]) dirX = 1;

  // If boosting, override movement to continue in boost direction
  if (state.player.boosting) {
    // Force movement in the boost direction
    if (state.player.boostKey === 'w' || state.player.boostKey === 'arrowup') dirY = -1;
    else if (state.player.boostKey === 's' || state.player.boostKey === 'arrowdown') dirY = 1;
    else if (state.player.boostKey === 'a' || state.player.boostKey === 'arrowleft') dirX = -1;
    else if (state.player.boostKey === 'd' || state.player.boostKey === 'arrowright') dirX = 1;
  }

  // Track if player is moving
  const isMoving = dirX !== 0 || dirY !== 0;
  
  if (isMoving) {
    const mag = Math.hypot(dirX, dirY) || 1;
    // Normalize so diagonal movement isn't faster, then scale by player speed.
    const normalizedDirX = dirX / mag;
    const normalizedDirY = dirY / mag;
    
    // Apply dash/boost speed multiplier, and slow multiplier from EMP
    let speedMultiplier = 1;
    if (state.player.dashing) {
      speedMultiplier = DASH_SPEED_MULTIPLIER;
    } else if (state.player.boosting) {
      speedMultiplier = BOOST_SPEED_MULTIPLIER;
    }
    speedMultiplier *= slowMultiplier;
    
    const effectiveSpeed = state.player.speed * speedMultiplier;
    
    state.player.x += normalizedDirX * effectiveSpeed;
    state.player.y += normalizedDirY * effectiveSpeed;
    
    // Update velocity for effects
    state.player.vx = normalizedDirX * effectiveSpeed;
    state.player.vy = normalizedDirY * effectiveSpeed;
    
    // Calculate target rotation based on movement direction
    state.player.targetRotation = Math.atan2(normalizedDirY, normalizedDirX);
    
    // Add thruster particles when moving (more when boosting)
    addThrusterParticles();
    if (state.player.boosting) {
      // Add extra thruster particles when boosting
      addThrusterParticles();
    }
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

  // GROUND COLLISION: Disabled - city themes removed from game
  // Ground collision logic commented out to prevent issues with removed city waves
  // for (let gi = 0; gi < state.groundObjects.length; gi++) {
  //   const ground = state.groundObjects[gi];
  //   if (!ground) continue;
  //
  //   // Check overlap between the player's circle and the ground rectangle
  //   const radius = state.player.size / 2;
  //   const nearestX = Math.max(ground.x, Math.min(state.player.x, ground.x + ground.width));
  //   const nearestY = Math.max(ground.y, Math.min(state.player.y, ground.y + ground.height));
  //   const dx = state.player.x - nearestX;
  //   const dy = state.player.y - nearestY;
  //   const distSq = dx * dx + dy * dy;
  //
  //   if (distSq < radius * radius) {
  //     // Player is overlapping the ground - make it impassable by pushing player out
  //     const dist = Math.sqrt(distSq);
  //     const pushDist = radius - dist;
  //     
  //     if (dist > 0) {
  //       // Push player away from nearest point on ground
  //       const pushX = (dx / dist) * pushDist;
  //       const pushY = (dy / dist) * pushDist;
  //       state.player.x += pushX;
  //       state.player.y += pushY;
  //     }
  //     
  //     // Apply damage unless invulnerable
  //     if (!state.player.invulnerable) {
  //       const damagePerFrame = (ground.damage || 15) / 60; // damage per second / 60fps
  //       state.player.health -= damagePerFrame;
  //     }
  //   }
  // }

  // TUNNEL COLLISION: Make tunnels impassable and damaging
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
      // Player is overlapping the tunnel - make it impassable by pushing player out
      const dist = Math.sqrt(distSq);
      const pushDist = radius - dist;
      
      if (dist > 0) {
        // Push player away from nearest point on tunnel
        const pushX = (dx / dist) * pushDist;
        const pushY = (dy / dist) * pushDist;
        state.player.x += pushX;
        state.player.y += pushY;
      }
      
      // Apply damage unless invulnerable
      if (!state.player.invulnerable) {
        state.player.health -= damagePerFrame;
        
        // Trigger visual damage effect every 10 frames
        if (state.frameCount % 10 === 0) {
          triggerTunnelCollision(nearestX, nearestY);
        }
      }
    }
  }

  // any other player movement end-of-frame logic...
}

export function handleShooting() {
  if (state.shootCooldown > 0) state.decrementShootCooldown();
  
  // Handle Megatonne Bomb cooldown
  if (state.player.megatonneBombCooldown > 0) {
    state.player.megatonneBombCooldown--;
  }
  
  // Handle Player EMP cooldown
  if (state.player.empCooldown > 0) {
    state.player.empCooldown--;
  }
  
  // Check if Megatonne Bomb should be fired (Space bar pressed)
  if (state.player.fireMegatonneBomb && state.player.megatonneBombCooldown === 0) {
    // Calculate direction to screen center
    const centerX = state.canvas.width / 2;
    const centerY = state.canvas.height / 2;
    let dirX = centerX - state.player.x;
    let dirY = centerY - state.player.y;
    
    const mag = Math.hypot(dirX, dirY) || 1;
    state.pushMegatonneBomb({
      x: state.player.x,
      y: state.player.y,
      dx: (dirX / mag) * 6, // Slower than regular bullets
      dy: (dirY / mag) * 6,
      size: 20, // Larger than regular bullets
      owner: "player",
      frame: 0
    });
    
    // Deplete boost meter and shields completely
    state.player.boostMeter = 0;
    state.player.shieldHealth = 0;
    state.player.shieldActive = false;
    
    // Set cooldown (5 seconds at 60fps)
    state.player.megatonneBombCooldown = 300;
    
    // Reset flag
    state.player.fireMegatonneBomb = false;
  }
  
  // Check if Player EMP should be fired (double-tap arrow key)
  if (state.player.firePlayerEMP && state.player.empCooldown === 0 && state.player.boostMeter >= 30) {
    // Find nearest enemy for homing
    const allTargets = [
      ...state.enemies,
      ...state.diamonds,
      ...state.tanks,
      ...state.walkers,
      ...state.mechs,
      ...state.dropships
    ];
    
    if (allTargets.length > 0) {
      // Find closest enemy
      let closestTarget = null;
      let closestDist = Infinity;
      
      for (const target of allTargets) {
        if (!target || target.health <= 0) continue;
        const dist = Math.hypot(target.x - state.player.x, target.y - state.player.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestTarget = target;
        }
      }
      
      if (closestTarget) {
        // Calculate direction to target
        const dx = closestTarget.x - state.player.x;
        const dy = closestTarget.y - state.player.y;
        const mag = Math.hypot(dx, dy) || 1;
        
        // Create player EMP projectile (player-themed, weaker than Gold Star's)
        const empAOE = 80; // Fixed radius
        const slowDuration = 120; // 2 seconds at 60fps
        const slowStrength = 0.4; // 40% slow
        
        state.pushEmpProjectile({
          x: state.player.x,
          y: state.player.y,
          dx: (dx / mag) * 6,
          dy: (dy / mag) * 6,
          targetX: closestTarget.x,
          targetY: closestTarget.y,
          size: 10,
          owner: "player",
          aoe: empAOE,
          slowDuration: slowDuration,
          slowStrength: slowStrength,
          level: 0
        });
        
        // Drain boost meter by 30
        state.player.boostMeter = Math.max(0, state.player.boostMeter - 30);
        
        // Set cooldown (3 seconds at 60fps)
        state.player.empCooldown = state.player.empCooldownMax;
      }
    }
    
    // Reset flag
    state.player.firePlayerEMP = false;
  }
  
  let dirX = 0, dirY = 0;
  // arrows control shooting (no change here)
  if (state.keys["arrowup"]) dirY = -1; 
  if (state.keys["arrowdown"]) dirY = 1;
  if (state.keys["arrowleft"]) dirX = -1; 
  if (state.keys["arrowright"]) dirX = 1;
  if ((dirX !== 0 || dirY !== 0) && state.shootCooldown === 0) {
    const mag = Math.hypot(dirX, dirY) || 1;
    const baseAngle = Math.atan2(dirY, dirX);
    
    // Multi-shot based on aura level and active state
    const auraActive = state.goldStarAura && state.goldStarAura.active;
    const auraLevel = state.goldStarAura ? state.goldStarAura.level : 0;
    
    // Initialize wave rotation angle if not present
    if (state.waveFireRotation === undefined) {
      state.waveFireRotation = 0;
    }
    
    if (auraActive && auraLevel >= 11) {
      // Level 11+: Repulsor Fire + Lightning Strike
      // Keep repulsor, add lightning (replaces plasma)
      
      // Repulsor blasts (short range knockback)
      const repulsorSpread = 0.25;
      for (let i = -1; i <= 1; i++) {
        state.pushBullet({
          x: state.player.x, 
          y: state.player.y, 
          dx: Math.cos(baseAngle + i * repulsorSpread) * 9, 
          dy: Math.sin(baseAngle + i * repulsorSpread) * 9, 
          size: 7, 
          owner: "player",
          damage: 15,
          color: "repulsor",
          repulsor: true,
          range: 180  // Short range
        });
      }
      
      // Lightning strikes (continuous arcs that chain between enemies)
      // Create lightning strike targeting system
      state.lightningStrikeCooldown = (state.lightningStrikeCooldown || 0) + 1;
      if (state.lightningStrikeCooldown >= 15) { // Fire lightning every 15 frames
        state.lightningStrikeCooldown = 0;
        // Flag to create lightning in collision detection
        state.fireLightningStrike = true;
        state.lightningStrikeLevel = auraLevel;
      }
      
    } else if (auraActive && auraLevel >= 10) {
      // Level 10: Repulsor Fire + Plasma Cannons
      // Remove wave, keep repulsor, add plasma with AOE
      
      // Repulsor blasts (short range knockback)
      const repulsorSpread = 0.25;
      for (let i = -1; i <= 1; i++) {
        state.pushBullet({
          x: state.player.x, 
          y: state.player.y, 
          dx: Math.cos(baseAngle + i * repulsorSpread) * 9, 
          dy: Math.sin(baseAngle + i * repulsorSpread) * 9, 
          size: 7, 
          owner: "player",
          damage: 15,
          color: "repulsor",
          repulsor: true,
          range: 180  // Short range
        });
      }
      
      // Plasma cannons (large AOE projectiles)
      const plasmaSpread = 0.3;
      for (let i = -1; i <= 1; i++) {
        state.pushBullet({
          x: state.player.x, 
          y: state.player.y, 
          dx: Math.cos(baseAngle + i * plasmaSpread) * 7, 
          dy: Math.sin(baseAngle + i * plasmaSpread) * 7, 
          size: 12, 
          owner: "player",
          damage: 25,
          color: "plasma",
          plasma: true,
          aoeRadius: 120  // AOE explosion on impact
        });
      }
      
    } else if (auraActive && auraLevel >= 8) {
      // Level 8: Spiral Fire + Repulsor Fire
      
      // Spiral Fire (SINGLE rotating stream)
      state.pushBullet({
        x: state.player.x, 
        y: state.player.y, 
        dx: Math.cos(state.waveFireRotation) * 10, 
        dy: Math.sin(state.waveFireRotation) * 10, 
        size: 6, 
        owner: "player",
        damage: 12
      });
      state.waveFireRotation += 0.15; // Rotate for next shot
      
      // Repulsor blasts (short range knockback)
      const repulsorSpread = 0.25;
      for (let i = -1; i <= 1; i++) {
        state.pushBullet({
          x: state.player.x, 
          y: state.player.y, 
          dx: Math.cos(baseAngle + i * repulsorSpread) * 9, 
          dy: Math.sin(baseAngle + i * repulsorSpread) * 9, 
          size: 7, 
          owner: "player",
          damage: 15,
          color: "repulsor",
          repulsor: true,
          range: 180  // Short range
        });
      }
      
    } else if (auraActive && auraLevel >= 6) {
      // Level 6: Spiral Fire (SINGLE rotating stream)
      state.pushBullet({
        x: state.player.x, 
        y: state.player.y, 
        dx: Math.cos(state.waveFireRotation) * 10, 
        dy: Math.sin(state.waveFireRotation) * 10, 
        size: 6, 
        owner: "player",
        damage: 12
      });
      state.waveFireRotation += 0.15; // Increment rotation
      
    } else if (auraActive && auraLevel >= 4) {
      // Quad shot at level 4+
      const spreadAngle = 0.15;
      for (let i = -1.5; i <= 1.5; i++) {
        state.pushBullet({
          x: state.player.x, 
          y: state.player.y, 
          dx: Math.cos(baseAngle + i * spreadAngle) * 10, 
          dy: Math.sin(baseAngle + i * spreadAngle) * 10, 
          size: 6, 
          owner: "player"
        });
      }
    } else if (auraActive && auraLevel >= 2) {
      // Triple shot at level 2+
      const spreadAngle = 0.2;
      for (let i = -1; i <= 1; i++) {
        state.pushBullet({
          x: state.player.x, 
          y: state.player.y, 
          dx: Math.cos(baseAngle + i * spreadAngle) * 10, 
          dy: Math.sin(baseAngle + i * spreadAngle) * 10, 
          size: 6, 
          owner: "player"
        });
      }
    } else {
      // Single shot (normal or when aura not active)
      state.pushBullet({x: state.player.x, y: state.player.y, dx: (dirX/mag)*10, dy: (dirY/mag)*10, size: 6, owner: "player"});
    }
    
    state.setShootCooldown(Math.max(5, Math.floor(10 / state.player.fireRateBoost)));

    state.setFireIndicatorAngle(state.firingIndicatorAngle + Math.PI / 2);
  }
}

export function updateBullets() {
  state.filterBullets(b => {
    b.x += b.dx; b.y += b.dy;
    
    // Track distance traveled for range-limited bullets
    if (b.repulsor && b.range) {
      if (!b.startX) {
        b.startX = b.x;
        b.startY = b.y;
      }
      const distTraveled = Math.hypot(b.x - b.startX, b.y - b.startY);
      if (distTraveled > b.range) {
        return false; // Remove bullet if beyond range
      }
    }
    
    return b.x >= -40 && b.x <= state.canvas.width+40 && b.y >= -40 && b.y <= state.canvas.height+40;
  });
}

export function updateEmpProjectiles() {
  state.filterEmpProjectiles(emp => {
    // Apply homing behavior - redirect toward target
    if (emp.targetX !== undefined && emp.targetY !== undefined) {
      const dx = emp.targetX - emp.x;
      const dy = emp.targetY - emp.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 0) {
        // Gradually turn toward target (homing strength)
        const homingStrength = 0.15; // How aggressively it homes
        const speed = Math.hypot(emp.dx, emp.dy);
        const targetDx = (dx / dist) * speed;
        const targetDy = (dy / dist) * speed;
        
        emp.dx += (targetDx - emp.dx) * homingStrength;
        emp.dy += (targetDy - emp.dy) * homingStrength;
        
        // Normalize speed to maintain consistent velocity
        const currentSpeed = Math.hypot(emp.dx, emp.dy);
        if (currentSpeed > 0) {
          emp.dx = (emp.dx / currentSpeed) * speed;
          emp.dy = (emp.dy / currentSpeed) * speed;
        }
      }
    }
    
    emp.x += emp.dx;
    emp.y += emp.dy;
    
    // Check if EMP reached target location
    const distToTarget = Math.hypot(emp.x - emp.targetX, emp.y - emp.targetY);
    if (distToTarget < 30 || emp.x < -40 || emp.x > state.canvas.width + 40 || emp.y < -40 || emp.y > state.canvas.height + 40) {
      // EMP explodes - create shockwave effect
      state.pushExplosion({
        x: emp.x,
        y: emp.y,
        dx: 0,
        dy: 0,
        radius: 20,
        color: "rgba(100, 200, 255, 0.9)",
        life: 20
      });
      
      // Create expanding shockwave rings
      for (let ring = 0; ring < 3; ring++) {
        state.pushRedPunchEffect({
          x: emp.x,
          y: emp.y,
          maxR: emp.aoe,
          r: ring * 20,
          life: 30 - ring * 5,
          maxLife: 30 - ring * 5,
          color: `rgba(100, 200, 255, ${0.7 - ring * 0.2})`,
          fill: false,
          ring: true
        });
      }
      
      // Apply slow effect based on EMP owner
      if (emp.owner === "gold" || emp.owner === "player") {
        // Gold star or player EMP affects enemies
        const allTargets = [
          ...state.enemies,
          ...state.mechs,
          ...state.tanks,
          ...state.dropships,
          ...state.walkers,
          ...state.diamonds
        ];
        
        // Use different visual color for player EMP
        const empColor = emp.owner === "player" ? "rgba(200, 255, 150, 0.8)" : "rgba(150, 220, 255, 0.8)";
        
        for (const target of allTargets) {
          const dist = Math.hypot((target.x || 0) - emp.x, (target.y || 0) - emp.y);
          if (dist < emp.aoe) {
            // Apply slow effect
            target.slowedBy = emp.slowStrength;
            target.slowDuration = emp.slowDuration;
            target.slowTimer = emp.slowDuration;
            
            // Visual feedback
            state.pushExplosion({
              x: target.x,
              y: target.y,
              dx: 0,
              dy: 0,
              radius: 8,
              color: empColor,
              life: 15
            });
          }
        }
      } else if (emp.owner === "diamond") {
        // Diamond EMP affects player
        const distToPlayer = Math.hypot(state.player.x - emp.x, state.player.y - emp.y);
        if (distToPlayer < emp.aoe) {
          // Apply slow effect to player
          state.player.slowedBy = emp.slowStrength;
          state.player.slowDuration = emp.slowDuration;
          state.player.slowTimer = emp.slowDuration;
          
          // Visual feedback
          state.pushExplosion({
            x: state.player.x,
            y: state.player.y,
            dx: 0,
            dy: 0,
            radius: 12,
            color: "rgba(255, 100, 100, 0.8)",
            life: 20
          });
        }
      }
      
      return false; // Remove EMP projectile
    }
    
    return true; // Keep EMP projectile
  });
}

export function updateMegatonneBombs() {
  state.filterMegatonneBombs(bomb => {
    bomb.x += bomb.dx;
    bomb.y += bomb.dy;
    bomb.frame = (bomb.frame || 0) + 1;
    
    // Check if bomb reached the screen center
    const centerX = state.canvas.width / 2;
    const centerY = state.canvas.height / 2;
    const distToCenter = Math.hypot(bomb.x - centerX, bomb.y - centerY);
    
    // Explode when within 30 pixels of screen center
    if (distToCenter < 30) {
      createMegatonneExplosion(centerX, centerY);
      return false; // Remove bomb
    }
    
    // Remove if off screen (safety check)
    if (bomb.x < -40 || bomb.x > state.canvas.width + 40 || 
        bomb.y < -40 || bomb.y > state.canvas.height + 40) {
      return false;
    }
    
    return true; // Keep bomb
  });
}

function createMegatonneExplosion(x, y) {
  const AOE_RADIUS = 450; // MASSIVE area of effect radius (increased from 150)
  
  // Create multiple large main explosion visuals
  state.pushExplosion({
    x: x,
    y: y,
    dx: 0,
    dy: 0,
    radius: 100, // Much larger main explosion (increased from 40)
    color: "rgba(255, 200, 50, 1)",
    life: 60 // Longer lasting (increased from 30)
  });
  
  // Additional explosion layers for depth
  state.pushExplosion({
    x: x,
    y: y,
    dx: 0,
    dy: 0,
    radius: 80,
    color: "rgba(255, 150, 0, 0.9)",
    life: 50
  });
  
  // Create MANY expanding shockwave rings (increased from 5 to 15)
  for (let ring = 0; ring < 15; ring++) {
    state.pushRedPunchEffect({
      x: x,
      y: y,
      maxR: AOE_RADIUS,
      r: ring * 30,
      life: 70 - ring * 3, // Longer lasting effects
      maxLife: 70 - ring * 3,
      color: `rgba(255, ${100 + ring * 5}, 0, ${0.9 - ring * 0.05})`,
      fill: false,
      ring: true
    });
  }
  
  // Add intense particle effects
  for (let i = 0; i < 80; i++) {
    const angle = (Math.PI * 2 * i) / 80;
    const dist = Math.random() * AOE_RADIUS * 0.8;
    state.pushExplosion({
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      dx: Math.cos(angle) * 3,
      dy: Math.sin(angle) * 3,
      radius: 10 + Math.random() * 15,
      color: `rgba(255, ${150 + Math.random() * 50}, 0, ${0.8 + Math.random() * 0.2})`,
      life: 40 + Math.random() * 20
    });
  }
  
  // Damage all enemies in MASSIVE AOE
  const allTargets = [
    ...state.enemies,
    ...state.mechs,
    ...state.tanks,
    ...state.dropships,
    ...state.walkers,
    ...state.diamonds
  ];
  
  for (const target of allTargets) {
    if (!target || target.health === undefined) continue;
    const dist = Math.hypot((target.x || 0) - x, (target.y || 0) - y);
    if (dist < AOE_RADIUS) {
      // DEVASTATING damage scales with distance (increased from 50 to 200)
      const damageFactor = 1 - (dist / AOE_RADIUS);
      const damage = 200 * damageFactor; // Up to 200 damage at center
      target.health -= damage;
      
      // Enhanced visual feedback
      state.pushExplosion({
        x: target.x,
        y: target.y,
        dx: 0,
        dy: 0,
        radius: 25, // Larger hit feedback (increased from 15)
        color: "rgba(255, 200, 0, 0.95)",
        life: 35 // Longer lasting (increased from 20)
      });
    }
  }
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
  // Clouds move from bottom to top (creating descending effect like Dragon Ball Z Nimbus)
  state.cloudParticles.forEach(c => {
    c.y -= c.speed * 0.5; // Move upward (bottom to top)
    // Wrap around when cloud goes off top
    if (c.y + c.size < 0) {
      c.y = state.canvas.height + c.size;
      // Randomize x position when wrapping for variety
      c.x = Math.random() * state.canvas.width;
    }
  });
}

// Thruster particle system for engine effects
function addThrusterParticles() {
  if (!state.player.thrusterParticles) state.player.thrusterParticles = [];
  
  // Add particles more frequently during dash
  const frameSkip = state.player.dashing ? 1 : 2;
  if (state.frameCount % frameSkip !== 0) return;
  
  // Calculate the back of the ship (opposite to movement direction)
  const rotation = state.player.rotation;
  const thrusterOffset = state.player.size * 0.4; // Position behind the ship
  
  // Create more particles during dash for intense visual feedback
  const baseParticleCount = Math.random() > 0.5 ? 2 : 1;
  const particleCount = state.player.dashing ? baseParticleCount * 3 : baseParticleCount;
  
  for (let i = 0; i < particleCount; i++) {
    // Position particles at the back of the ship
    const offsetX = -Math.cos(rotation) * thrusterOffset;
    const offsetY = -Math.sin(rotation) * thrusterOffset;
    
    // Add some randomness to particle spawn position
    const spread = state.player.size * (state.player.dashing ? 0.3 : 0.15);
    const perpX = -Math.sin(rotation) * (Math.random() - 0.5) * spread;
    const perpY = Math.cos(rotation) * (Math.random() - 0.5) * spread;
    
    // Dash particles are more intense - brighter and faster
    const dashBoost = state.player.dashing ? 2 : 1;
    const hueShift = state.player.dashing ? 40 : 0; // More cyan/white during dash
    
    state.player.thrusterParticles.push({
      x: state.player.x + offsetX + perpX,
      y: state.player.y + offsetY + perpY,
      vx: -Math.cos(rotation) * (2 + Math.random() * 2) * dashBoost - state.player.vx * 0.3,
      vy: -Math.sin(rotation) * (2 + Math.random() * 2) * dashBoost - state.player.vy * 0.3,
      life: 15 + Math.random() * 10,
      maxLife: 25,
      size: (2 + Math.random() * 3) * (state.player.dashing ? 1.5 : 1),
      hue: 20 + Math.random() * 40 + hueShift // Orange to yellow, or cyan/white during dash
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
