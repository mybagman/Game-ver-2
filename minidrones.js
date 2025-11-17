// minidrones.js - Mini-drones spawned by gold star level ups
import * as state from './state.js';
import { createExplosion } from './utils.js';

// Mini-drones follow gold star and shoot at enemies
export function spawnMiniDrone(goldStarX, goldStarY) {
  const angle = Math.random() * Math.PI * 2;
  const dist = 50;
  
  const drone = {
    x: goldStarX + Math.cos(angle) * dist,
    y: goldStarY + Math.sin(angle) * dist,
    size: 18, // Smaller than gold star (36)
    health: 80, // Less health than gold star
    maxHealth: 80,
    speed: 2.5, // Slightly slower than gold star
    shootCooldown: 0,
    alive: true,
    // Orbit parameters
    orbitAngle: angle,
    orbitSpeed: 0.02,
    orbitRadius: 60
  };
  
  if (!state.miniDrones) {
    state.miniDrones = [];
  }
  
  state.miniDrones.push(drone);
  
  // Visual spawn effect
  for (let i = 0; i < 12; i++) {
    const spawnAngle = (i / 12) * Math.PI * 2;
    state.pushExplosion({
      x: drone.x,
      y: drone.y,
      dx: Math.cos(spawnAngle) * 4,
      dy: Math.sin(spawnAngle) * 4,
      radius: 4,
      color: "rgba(255, 220, 100, 0.8)",
      life: 20
    });
  }
}

export function updateMiniDrones() {
  if (!state.miniDrones) {
    state.miniDrones = [];
    return;
  }
  
  // Remove drones if gold star is dead
  if (!state.goldStar.alive) {
    state.miniDrones.forEach(drone => {
      if (drone.alive) {
        createExplosion(drone.x, drone.y, "gold");
        drone.alive = false;
      }
    });
    state.miniDrones = state.miniDrones.filter(d => false); // Clear all
    return;
  }
  
  state.miniDrones = state.miniDrones.filter(drone => {
    if (!drone.alive) return false;
    
    // Find nearest enemy for autonomous behavior
    let closestEnemy = null;
    let closestDist = Infinity;
    
    // Search all enemy types
    for (const enemy of state.enemies) {
      if (!enemy || enemy.type === "reflector") continue;
      const enemyDist = Math.hypot(enemy.x - drone.x, enemy.y - drone.y);
      if (enemyDist < closestDist) {
        closestDist = enemyDist;
        closestEnemy = enemy;
      }
    }
    
    for (const tank of state.tanks) {
      const tankDist = Math.hypot(tank.x - drone.x, tank.y - drone.y);
      if (tankDist < closestDist) {
        closestDist = tankDist;
        closestEnemy = tank;
      }
    }
    
    for (const walker of state.walkers) {
      const walkerDist = Math.hypot(walker.x - drone.x, walker.y - drone.y);
      if (walkerDist < closestDist) {
        closestDist = walkerDist;
        closestEnemy = walker;
      }
    }
    
    for (const mech of state.mechs) {
      const mechDist = Math.hypot(mech.x - drone.x, mech.y - drone.y);
      if (mechDist < closestDist) {
        closestDist = mechDist;
        closestEnemy = mech;
      }
    }
    
    // AI Enhancement: Independent behavior based on enemy presence
    let targetX, targetY;
    const detectionRange = 500; // Range for enemy detection
    
    if (closestEnemy && closestDist < detectionRange) {
      // ENGAGE MODE: Move independently toward enemy to attack
      drone.mode = "engage";
      
      // Move toward enemy (intercept position)
      targetX = closestEnemy.x;
      targetY = closestEnemy.y;
      
      // Maintain combat distance (not too close, not too far)
      const combatDistance = 150;
      const dx = targetX - drone.x;
      const dy = targetY - drone.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > combatDistance + 20) {
        // Move closer
        const moveSpeed = drone.speed;
        drone.x += (dx / dist) * moveSpeed;
        drone.y += (dy / dist) * moveSpeed;
      } else if (dist < combatDistance - 20) {
        // Move away (maintain distance)
        const moveSpeed = drone.speed * 0.8;
        drone.x -= (dx / dist) * moveSpeed;
        drone.y -= (dy / dist) * moveSpeed;
      }
      // else: maintain current position (in optimal range)
    } else {
      // RETURN MODE: No enemies detected, return to gold star orbit
      drone.mode = "return";
      
      // Update orbit position around gold star
      drone.orbitAngle += drone.orbitSpeed;
      targetX = state.goldStar.x + Math.cos(drone.orbitAngle) * drone.orbitRadius;
      targetY = state.goldStar.y + Math.sin(drone.orbitAngle) * drone.orbitRadius;
      
      // Move toward orbit position
      const dx = targetX - drone.x;
      const dy = targetY - drone.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 5) {
        const moveSpeed = Math.min(drone.speed, dist);
        drone.x += (dx / dist) * moveSpeed;
        drone.y += (dy / dist) * moveSpeed;
      }
    }
    
    // Shooting logic - fire at closest enemy in range
    if (drone.shootCooldown > 0) {
      drone.shootCooldown--;
    } else {
      // Shoot at nearest enemy if in range (increased range when in engage mode)
      const shootRange = drone.mode === "engage" ? 500 : 400;
      if (closestEnemy && closestDist < shootRange) {
        const shootDx = closestEnemy.x - drone.x;
        const shootDy = closestEnemy.y - drone.y;
        const shootMag = Math.hypot(shootDx, shootDy) || 1;
        
        // Fire a small bullet (weaker than player)
        state.pushBullet({
          x: drone.x,
          y: drone.y,
          dx: (shootDx / shootMag) * 8,
          dy: (shootDy / shootMag) * 8,
          size: 5,
          owner: "player", // Counts as player damage
          damage: 8, // Less than player's base damage
          color: "rgba(255, 220, 100, 0.9)",
          drone: true
        });
        
        drone.shootCooldown = 40; // Slower fire rate than player
      }
    }
    
    // Check if drone is hit by enemy bullets
    for (let li = state.lightning.length - 1; li >= 0; li--) {
      const l = state.lightning[li];
      if (Math.hypot(l.x - drone.x, l.y - drone.y) < drone.size / 2) {
        drone.health -= l.damage;
        state.lightning.splice(li, 1);
        createExplosion(drone.x, drone.y, "orange");
        
        if (drone.health <= 0) {
          createExplosion(drone.x, drone.y, "gold");
          drone.alive = false;
          return false;
        }
      }
    }
    
    return drone.alive;
  });
}

export function drawMiniDrones(ctx) {
  if (!state.miniDrones) return;
  
  state.miniDrones.forEach(drone => {
    if (!drone.alive) return;
    
    ctx.save();
    ctx.translate(drone.x, drone.y);
    
    // Mini gold star appearance (smaller, less detailed)
    const size = drone.size;
    const pulse = Math.sin(state.frameCount * 0.1 + drone.orbitAngle) * 0.2 + 0.8;
    
    // Outer glow
    ctx.shadowBlur = 12 * pulse;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
    
    // Core star body
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
    ctx.beginPath();
    
    // 4-pointed star (simpler than gold star's 5 points)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const radius = (i % 2 === 0) ? size / 2 : size / 4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    // Inner glow
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 200, ${pulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(0, 0, size / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Mode indicator - visual cue for engage vs return
    if (drone.mode === "engage") {
      // Red targeting reticle when engaging enemies
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();
      
      // Targeting lines
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + state.frameCount * 0.05;
        const x1 = Math.cos(angle) * (size / 2 + 2);
        const y1 = Math.sin(angle) * (size / 2 + 2);
        const x2 = Math.cos(angle) * (size / 2 + 8);
        const y2 = Math.sin(angle) * (size / 2 + 8);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    
    // Health bar (mini)
    const healthRatio = drone.health / drone.maxHealth;
    const barWidth = size * 1.2;
    const barHeight = 3;
    const barY = size / 2 + 6;
    
    // Background
    ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
    
    // Health fill
    const healthColor = healthRatio > 0.5 ? 'rgba(100, 255, 100, 0.8)' : 
                       healthRatio > 0.25 ? 'rgba(255, 200, 100, 0.8)' : 
                       'rgba(255, 100, 100, 0.8)';
    ctx.fillStyle = healthColor;
    ctx.fillRect(-barWidth / 2, barY, barWidth * healthRatio, barHeight);
    
    ctx.restore();
  });
}
