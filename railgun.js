// railgun.js - Rail gun weapon system for Gold Star (replaces homing missiles)
import * as state from './state.js';
import { createExplosion } from './utils.js';

const RAILGUN_FIRE_INTERVAL = 60; // frames (~1 second at 60fps)
const RAILGUN_PROJECTILE_SPEED = 25; // Very fast projectile
const RAILGUN_LIFETIME = 30; // frames (~0.5 seconds)
const RAILGUN_DAMAGE_BASE = 80; // High base damage
const RAILGUN_PIERCE_COUNT_BASE = 3; // Number of enemies it can pierce through

export function updateRailGunSystem() {
  // Update cooldown for gold star rail gun
  if (state.goldStar.railGunCooldown > 0) {
    state.goldStar.railGunCooldown--;
  }
  
  // Fire rail gun from gold star based on railGunLevel
  if (state.goldStar.alive && state.goldStar.railGunLevel > 0 && state.goldStar.railGunCooldown === 0) {
    // Find valid targets (non-reflector enemies)
    const validTargets = state.enemies.filter(e => e.type !== "reflector");
    
    if (validTargets.length > 0) {
      // Find nearest enemy to aim at
      const target = findNearestEnemy(state.goldStar.x, state.goldStar.y, validTargets);
      
      if (target) {
        // Calculate direction towards target
        const dx = target.x - state.goldStar.x;
        const dy = target.y - state.goldStar.y;
        const angle = Math.atan2(dy, dx);
        
        // Rail gun damage and pierce count scale with level
        const damage = RAILGUN_DAMAGE_BASE + (state.goldStar.railGunLevel - 1) * 40;
        const pierceCount = RAILGUN_PIERCE_COUNT_BASE + (state.goldStar.railGunLevel - 1) * 2;
        
        state.pushRailGunShot({
          x: state.goldStar.x,
          y: state.goldStar.y,
          vx: Math.cos(angle) * RAILGUN_PROJECTILE_SPEED,
          vy: Math.sin(angle) * RAILGUN_PROJECTILE_SPEED,
          angle: angle,
          life: RAILGUN_LIFETIME,
          damage: damage,
          pierceCount: pierceCount,
          hitEnemies: [], // Track which enemies have been hit to prevent multi-hits
          size: 8,
          charging: false, // Visual effect for charging animation
          chargeTime: 0
        });
      }
      
      state.goldStar.railGunCooldown = RAILGUN_FIRE_INTERVAL;
    }
  }
}

export function updateRailGunShots() {
  state.filterRailGunShots(shot => {
    // Update lifetime
    shot.life--;
    if (shot.life <= 0) {
      createExplosion(shot.x, shot.y, "cyan");
      return false;
    }
    
    // Update position
    shot.x += shot.vx;
    shot.y += shot.vy;
    
    // Check bounds
    if (shot.x < -50 || shot.x > state.canvas.width + 50 ||
        shot.y < -50 || shot.y > state.canvas.height + 50) {
      return false;
    }
    
    // Check collision with enemies (piercing damage)
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      
      // Skip if already hit this enemy
      if (shot.hitEnemies.includes(enemy)) continue;
      
      const enemySize = enemy.size || 30;
      const dist = Math.hypot(enemy.x - shot.x, enemy.y - shot.y);
      
      if (dist < enemySize / 2 + shot.size / 2) {
        // Hit! Apply damage
        enemy.health -= shot.damage;
        shot.hitEnemies.push(enemy);
        
        // Create impact effect
        createExplosion(enemy.x, enemy.y, "yellow");
        
        // Create electric sparks
        for (let j = 0; j < 8; j++) {
          const sparkAngle = Math.random() * Math.PI * 2;
          state.pushExplosion({
            x: enemy.x,
            y: enemy.y,
            dx: Math.cos(sparkAngle) * 3,
            dy: Math.sin(sparkAngle) * 3,
            radius: 3 + Math.random() * 2,
            color: "rgba(100, 200, 255, 0.9)",
            life: 15
          });
        }
        
        // Check if piercing is exhausted
        shot.pierceCount--;
        if (shot.pierceCount <= 0) {
          // Create final explosion
          createExplosion(shot.x, shot.y, "orange");
          return false; // Remove shot
        }
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

export function drawRailGunShots(ctx) {
  for (const shot of state.railGunShots) {
    ctx.save();
    
    // Draw energy trail behind the shot
    const trailLength = 40;
    const trailX = shot.x - Math.cos(shot.angle) * trailLength;
    const trailY = shot.y - Math.sin(shot.angle) * trailLength;
    
    const gradient = ctx.createLinearGradient(trailX, trailY, shot.x, shot.y);
    gradient.addColorStop(0, "rgba(100, 200, 255, 0)");
    gradient.addColorStop(0.5, "rgba(100, 200, 255, 0.4)");
    gradient.addColorStop(1, "rgba(100, 200, 255, 0.8)");
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(shot.x, shot.y);
    ctx.stroke();
    
    // Draw projectile core (bright elongated shape)
    ctx.translate(shot.x, shot.y);
    ctx.rotate(shot.angle);
    
    // Outer glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = "cyan";
    
    // Main projectile body (elongated rectangle)
    ctx.fillStyle = "rgba(150, 220, 255, 0.9)";
    ctx.fillRect(-shot.size * 1.5, -shot.size / 3, shot.size * 3, shot.size * 2 / 3);
    
    // Inner bright core
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.fillRect(-shot.size, -shot.size / 4, shot.size * 2, shot.size / 2);
    
    // Electric arcs around the shot
    const arcCount = 4;
    for (let i = 0; i < arcCount; i++) {
      const arcAngle = (i / arcCount) * Math.PI * 2 + (state.frameCount * 0.1);
      const arcRadius = shot.size * 1.2;
      const arcX = Math.cos(arcAngle) * arcRadius;
      const arcY = Math.sin(arcAngle) * arcRadius;
      
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 + Math.sin(state.frameCount * 0.2 + i) * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(arcX, arcY);
      ctx.stroke();
    }
    
    ctx.restore();
  }
}
