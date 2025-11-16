// homingMissiles.js - Homing missile system for reflector power-up
import * as state from './state.js';
import { createExplosion } from './utils.js';

const MISSILE_FIRE_INTERVAL = 180; // frames (~3 seconds at 60fps) - Reduced fire rate
const MISSILE_SPEED = 6;
const MISSILE_TURN_RATE = 0.08;
const MISSILE_LIFETIME = 180; // frames (~3 seconds)
const AOE_RADIUS = 50;  // Reduced from 70 for better balance
const AOE_DAMAGE = 12;  // Reduced to 60% of original (20 -> 12) for better balance

export function updateReflectorSystem() {
  // Update cooldowns for both player and gold star
  if (state.player.reflectorCooldown > 0) {
    state.player.reflectorCooldown--;
  }
  if (state.goldStar.homingMissileCooldown > 0) {
    state.goldStar.homingMissileCooldown--;
  }
  
  // Fire homing missiles from gold star based on homingMissileLevel
  if (state.goldStar.alive && state.goldStar.homingMissileLevel > 0 && state.goldStar.homingMissileCooldown === 0) {
    // Find non-reflector enemies
    const validTargets = state.enemies.filter(e => e.type !== "reflector");
    
    if (validTargets.length > 0) {
      // Fire single homing missile (like normal fire pattern)
      const target = findNearestEnemy(state.goldStar.x, state.goldStar.y, validTargets);
      
      if (target) {
        // Calculate initial direction towards target
        const dx = target.x - state.goldStar.x;
        const dy = target.y - state.goldStar.y;
        const angle = Math.atan2(dy, dx);
        
        state.pushHomingMissile({
          x: state.goldStar.x,
          y: state.goldStar.y,
          vx: Math.cos(angle) * MISSILE_SPEED,
          vy: Math.sin(angle) * MISSILE_SPEED,
          targetId: target,
          life: MISSILE_LIFETIME,
          size: 8,
          trail: [],
          podDetached: false,  // For drone pod animation
          podReturnTimer: 0
        });
      }
      
      state.goldStar.homingMissileCooldown = MISSILE_FIRE_INTERVAL;
    }
  }
}

export function updateHomingMissiles() {
  state.filterHomingMissiles(missile => {
    // Update lifetime
    missile.life--;
    if (missile.life <= 0) {
      createExplosion(missile.x, missile.y, "cyan");
      return false;
    }
    
    // Find target (nearest non-reflector enemy)
    const validEnemies = state.enemies.filter(e => e.type !== "reflector");
    let target = missile.targetId;
    
    // If original target is dead/invalid, find new target
    if (!target || !state.enemies.includes(target) || target.type === "reflector") {
      target = findNearestEnemy(missile.x, missile.y, validEnemies);
      missile.targetId = target;
    }
    
    // Homing behavior
    if (target) {
      const dx = target.x - missile.x;
      const dy = target.y - missile.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist > 0) {
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(missile.vy, missile.vx);
        
        // Calculate angle difference
        let angleDiff = targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Turn towards target
        const newAngle = currentAngle + angleDiff * MISSILE_TURN_RATE;
        missile.vx = Math.cos(newAngle) * MISSILE_SPEED;
        missile.vy = Math.sin(newAngle) * MISSILE_SPEED;
      }
    }
    
    // Update position
    missile.x += missile.vx;
    missile.y += missile.vy;
    
    // Add trail point
    if (!missile.trail) missile.trail = [];
    missile.trail.push({ x: missile.x, y: missile.y, life: 10 });
    missile.trail = missile.trail.filter(p => {
      p.life--;
      return p.life > 0;
    });
    
    // Check bounds
    if (missile.x < -50 || missile.x > state.canvas.width + 50 ||
        missile.y < -50 || missile.y > state.canvas.height + 50) {
      return false;
    }
    
    // Check collision with enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      const enemySize = enemy.size || 30;
      const dist = Math.hypot(enemy.x - missile.x, enemy.y - missile.y);
      
      if (dist < enemySize / 2 + missile.size / 2) {
        // Hit! Apply AOE damage
        applyAOEDamage(missile.x, missile.y, AOE_RADIUS, AOE_DAMAGE);
        createExplosion(missile.x, missile.y, "orange");
        
        // Create shockwave effect
        for (let j = 0; j < 20; j++) {
          const angle = (j / 20) * Math.PI * 2;
          state.pushExplosion({
            x: missile.x,
            y: missile.y,
            dx: Math.cos(angle) * 4,
            dy: Math.sin(angle) * 4,
            radius: 6 + Math.random() * 4,
            color: "rgba(255, 100, 50, 0.8)",
            life: 20
          });
        }
        
        return false; // Remove missile
      }
    }
    
    return true;
  });
}

function findNearestEnemy(x, y, enemies) {
  let nearest = null;
  let minDist = Infinity;
  
  for (const enemy of enemies) {
    const dist = Math.hypot(enemy.x - x, enemy.y - y);
    if (dist < minDist) {
      minDist = dist;
      nearest = enemy;
    }
  }
  
  return nearest;
}

function applyAOEDamage(x, y, radius, damage) {
  for (const enemy of state.enemies) {
    const dist = Math.hypot(enemy.x - x, enemy.y - y);
    if (dist <= radius) {
      enemy.health -= damage;
      createExplosion(enemy.x, enemy.y, "red");
    }
  }
}

export function drawHomingMissiles(ctx) {
  for (const missile of state.homingMissiles) {
    // Draw trail
    ctx.save();
    ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (missile.trail && missile.trail.length > 1) {
      ctx.moveTo(missile.trail[0].x, missile.trail[0].y);
      for (let i = 1; i < missile.trail.length; i++) {
        ctx.lineTo(missile.trail[i].x, missile.trail[i].y);
      }
    }
    ctx.stroke();
    ctx.restore();
    
    // Draw missile body
    ctx.save();
    const angle = Math.atan2(missile.vy, missile.vx);
    ctx.translate(missile.x, missile.y);
    ctx.rotate(angle);
    
    // Missile shape (elongated with fins)
    ctx.fillStyle = "rgb(100, 200, 255)";
    ctx.beginPath();
    ctx.moveTo(missile.size, 0);
    ctx.lineTo(-missile.size * 0.8, missile.size * 0.4);
    ctx.lineTo(-missile.size * 0.8, -missile.size * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = "cyan";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(missile.size * 0.3, 0, missile.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}
