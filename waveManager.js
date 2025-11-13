import * as state from './state.js';
import { waves } from './waves.js';
import * as spawns from './utils.js';

const spawnHandlers = {
  "red-square": (g) => spawns.spawnRedSquares(g.count || 1),
  "triangle": (g) => spawns.spawnTriangles(g.count || 1),
  "reflector": (g) => spawns.spawnReflectors(g.count || 1),
  "tank": (g) => spawns.spawnTank(g.count || 1),
  "walker": (g) => spawns.spawnWalker(g.count || 1),
  "mech": (g) => spawns.spawnMech(g.count || 1),
  "boss": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnBoss();
  },
  "mini-boss": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnMiniBoss();
  },
  "diamond": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnDiamondEnemy();
  },
  "mother-core": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnMotherCore();
  }
};

export function spawnWave(waveIndex) {
  console.log('[spawnWave] called with waveIndex:', waveIndex);
  if (waveIndex < 0 || waveIndex >= waves.length) {
    console.warn('[spawnWave] invalid waveIndex:', waveIndex, 'waves.length:', waves.length);
    return;
  }

  const waveData = waves[waveIndex];
  console.log('[spawnWave] spawning wave', waveIndex, waveData);

  if (waveData.theme === "cloud-combat" || waveData.clouds) {
    spawns.spawnCloudParticles(50);
  }

  if (waveData.tunnel) spawns.spawnTunnel();
  
  // Ground object spawning removed - city themes no longer used

  if (waveData.enemies && Array.isArray(waveData.enemies)) {
    waveData.enemies.forEach(group => {
      if (!group || !group.type) {
        console.warn('[spawnWave] skipping invalid group:', group);
        return;
      }

      const handler = spawnHandlers[group.type];

      if (handler) {
        try {
          handler(group);
          console.log('[spawnWave] spawned', group.type, 'count:', group.count);
        } catch (err) {
          console.error('[spawnWave] error while spawning group', group, err);
        }
      } else {
        console.warn('[spawnWave] no spawn handler for type:', group.type);
      }
    });
  }
}

// Cinematic state tracking
let cinematicState = {
  active: false,
  type: null,
  frame: 0,
  totalFrames: 0
};

// Death Star explosion cinematic (post Wave 11)
function playDeathStarExplosionCinematic() {
  cinematicState.active = true;
  cinematicState.type = 'deathStarExplosion';
  cinematicState.frame = 0;
  cinematicState.totalFrames = 240; // 4 seconds at 60fps
  state.cinematic.playing = true;
}

// Planetfall cinematic (end of Wave 13)
function playPlanetfallCinematic() {
  cinematicState.active = true;
  cinematicState.type = 'planetfall';
  cinematicState.frame = 0;
  cinematicState.totalFrames = 180; // 3 seconds at 60fps
  state.cinematic.playing = true;
}

// Render cinematic based on type
export function renderCinematic(ctx, width, height) {
  if (!cinematicState.active) return false;
  
  cinematicState.frame++;
  
  if (cinematicState.type === 'deathStarExplosion') {
    renderDeathStarExplosion(ctx, width, height);
  } else if (cinematicState.type === 'planetfall') {
    renderPlanetfall(ctx, width, height);
  }
  
  // Check if cinematic is complete
  if (cinematicState.frame >= cinematicState.totalFrames) {
    // Clean up cinematic-specific data
    if (cinematicState.explosions) {
      cinematicState.explosions = [];
    }
    if (cinematicState.enemies) {
      cinematicState.enemies = [];
    }
    
    cinematicState.active = false;
    cinematicState.type = null;
    cinematicState.frame = 0;
    state.cinematic.playing = false;
    
    // Advance to next wave immediately after cinematic completes
    state.incrementWave();
    if (state.wave < waves.length) {
      spawnWave(state.wave);
    }
    
    return false;
  }
  
  return true; // Still playing
}

// Death Star explosion sequence - horizontal escape with explosions behind
function renderDeathStarExplosion(ctx, width, height) {
  const progress = cinematicState.frame / cinematicState.totalFrames;
  
  // Dark space background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  
  // Draw starfield for depth
  for (let i = 0; i < 100; i++) {
    const x = (i * 137.5) % width;
    const y = (i * 217.3) % height;
    const size = 1 + (i % 3);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 5) * 0.1})`;
    ctx.fillRect(x, y, size, size);
  }
  
  // Player and gold star moving horizontally from left to right
  const startX = -50;
  const endX = width + 50;
  const travelDistance = endX - startX;
  const currentX = startX + (progress * travelDistance);
  
  const playerY = height / 2 - 30;
  const goldStarY = height / 2 + 30;
  
  // Draw explosion effects behind them at intervals
  const explosionInterval = 15; // frames between explosions
  if (cinematicState.frame % explosionInterval === 0 && progress < 0.9) {
    // Store explosion data in cinematicState if not exists
    if (!cinematicState.explosions) {
      cinematicState.explosions = [];
    }
    
    // Add new explosion at current position
    cinematicState.explosions.push({
      x: currentX - 40,
      y: height / 2 + (Math.random() - 0.5) * 100,
      frame: 0,
      maxFrames: 40
    });
  }
  
  // Update and draw all explosions
  if (cinematicState.explosions) {
    for (let i = cinematicState.explosions.length - 1; i >= 0; i--) {
      const explosion = cinematicState.explosions[i];
      explosion.frame++;
      
      const expProgress = explosion.frame / explosion.maxFrames;
      const radius = 20 + (expProgress * 60);
      const alpha = 1 - expProgress;
      
      // Outer explosion ring
      ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner bright core
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Explosion particles
      const particleCount = 8;
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2;
        const dist = expProgress * 80;
        const px = explosion.x + Math.cos(angle) * dist;
        const py = explosion.y + Math.sin(angle) * dist;
        const pSize = 3 * (1 - expProgress);
        
        ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Remove completed explosions
      if (explosion.frame >= explosion.maxFrames) {
        cinematicState.explosions.splice(i, 1);
      }
    }
  }
  
  // Draw player ship (simple representation)
  ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
  ctx.save();
  ctx.translate(currentX - 40, playerY);
  ctx.rotate(-Math.PI / 2); // Point to the right
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-8, 8);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // Engine trail for player
  if (cinematicState.frame % 2 === 0) {
    for (let t = 0; t < 3; t++) {
      const trailX = currentX - 40 - (t * 15);
      const trailY = playerY + (Math.random() - 0.5) * 8;
      const trailSize = 4 - t;
      const trailAlpha = 0.6 - (t * 0.2);
      ctx.fillStyle = `rgba(100, 200, 255, ${trailAlpha})`;
      ctx.beginPath();
      ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw gold star
  ctx.fillStyle = "rgba(255, 200, 50, 0.9)";
  ctx.save();
  ctx.translate(currentX + 40, goldStarY);
  ctx.rotate(cinematicState.frame * 0.1);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const outerRadius = 14;
    const innerRadius = 7;
    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    ctx.lineTo(Math.cos(angle + Math.PI / 5) * innerRadius, Math.sin(angle + Math.PI / 5) * innerRadius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // Engine trail for gold star
  if (cinematicState.frame % 2 === 0) {
    for (let t = 0; t < 3; t++) {
      const trailX = currentX + 40 - (t * 15);
      const trailY = goldStarY + (Math.random() - 0.5) * 8;
      const trailSize = 4 - t;
      const trailAlpha = 0.6 - (t * 0.2);
      ctx.fillStyle = `rgba(255, 200, 50, ${trailAlpha})`;
      ctx.beginPath();
      ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Text overlay
  if (progress > 0.7) {
    const textAlpha = (progress - 0.7) / 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
    ctx.font = "bold 32px Orbitron, monospace";
    ctx.textAlign = "center";
    ctx.fillText("DEATH STAR DESTROYED", width / 2, 60);
    ctx.font = "20px Orbitron, monospace";
    ctx.fillText("Escaping to safety...", width / 2, 100);
  }
}

// Planetfall landing sequence - diagonal descent from top-left to bottom-right
function renderPlanetfall(ctx, width, height) {
  const progress = cinematicState.frame / cinematicState.totalFrames;
  
  // Desert sky gradient (getting closer to ground)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, "#d4a574");
  skyGradient.addColorStop(0.5, "#e8d4a0");
  skyGradient.addColorStop(1, "#f5e6d3");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Ground approaching (rises up as we descend)
  const groundY = height * (0.7 + progress * 0.3);
  ctx.fillStyle = "#c9984a";
  ctx.fillRect(0, groundY, width, height - groundY);
  
  // Player and gold star moving diagonally from top-left to bottom-right
  const startX = width * 0.1;
  const startY = height * 0.1;
  const endX = width * 0.9;
  const endY = height * 0.9;
  
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress;
  
  const playerX = currentX - 50;
  const playerY = currentY - 30;
  const goldStarX = currentX + 50;
  const goldStarY = currentY + 30;
  
  // Spawn enemies along the path
  if (cinematicState.frame % 20 === 0 && progress < 0.8) {
    if (!cinematicState.enemies) {
      cinematicState.enemies = [];
    }
    
    // Add enemy ahead on the path
    const enemyProgress = progress + 0.15;
    if (enemyProgress < 1) {
      cinematicState.enemies.push({
        x: startX + (endX - startX) * enemyProgress,
        y: startY + (endY - startY) * enemyProgress + (Math.random() - 0.5) * 100,
        frame: 0,
        destroyed: false
      });
    }
  }
  
  // Update and draw enemies
  if (cinematicState.enemies) {
    for (let i = cinematicState.enemies.length - 1; i >= 0; i--) {
      const enemy = cinematicState.enemies[i];
      
      // Check if player/goldstar have reached enemy (shooting range)
      const distToPlayer = Math.hypot(playerX - enemy.x, playerY - enemy.y);
      const distToGoldStar = Math.hypot(goldStarX - enemy.x, goldStarY - enemy.y);
      
      if (!enemy.destroyed && (distToPlayer < 100 || distToGoldStar < 100)) {
        enemy.destroyed = true;
        enemy.destroyFrame = 0;
      }
      
      if (!enemy.destroyed) {
        // Draw enemy
        ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Enemy triangle shape
        ctx.fillStyle = "rgba(200, 0, 0, 0.9)";
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-8, 8);
        ctx.lineTo(8, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Draw destruction effect
        enemy.destroyFrame++;
        const destroyProgress = enemy.destroyFrame / 20;
        const radius = 10 + destroyProgress * 30;
        const alpha = 1 - destroyProgress;
        
        // Explosion
        ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Remove completed explosions
        if (enemy.destroyFrame >= 20) {
          cinematicState.enemies.splice(i, 1);
        }
      }
    }
  }
  
  // Draw gun fire effects
  if (cinematicState.frame % 8 < 4 && progress < 0.85) {
    // Player shooting
    const shootAngle = Math.atan2(endY - startY, endX - startX);
    for (let b = 0; b < 3; b++) {
      const bulletDist = b * 20 + 20;
      const bulletX = playerX + Math.cos(shootAngle) * bulletDist;
      const bulletY = playerY + Math.sin(shootAngle) * bulletDist;
      
      ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(bulletX, bulletY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Gold star shooting
    for (let b = 0; b < 3; b++) {
      const bulletDist = b * 20 + 20;
      const bulletX = goldStarX + Math.cos(shootAngle) * bulletDist;
      const bulletY = goldStarY + Math.sin(shootAngle) * bulletDist;
      
      ctx.fillStyle = "rgba(255, 200, 50, 0.9)";
      ctx.beginPath();
      ctx.arc(bulletX, bulletY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw player ship
  ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
  ctx.save();
  ctx.translate(playerX, playerY);
  const angle = Math.atan2(endY - startY, endX - startX);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // Draw gold star
  ctx.fillStyle = "rgba(255, 200, 50, 0.9)";
  ctx.save();
  ctx.translate(goldStarX, goldStarY);
  ctx.rotate(cinematicState.frame * 0.1);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const starAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const outerRadius = 14;
    const innerRadius = 7;
    ctx.lineTo(Math.cos(starAngle) * outerRadius, Math.sin(starAngle) * outerRadius);
    ctx.lineTo(Math.cos(starAngle + Math.PI / 5) * innerRadius, Math.sin(starAngle + Math.PI / 5) * innerRadius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // Dust clouds from landing
  if (progress > 0.7) {
    const dustProgress = (progress - 0.7) / 0.3;
    for (let i = 0; i < 10; i++) {
      const x = endX + (i - 5) * 40;
      const y = endY + 30;
      const size = 30 + dustProgress * 40;
      const alpha = 0.3 - (dustProgress * 0.2);
      
      ctx.fillStyle = `rgba(220, 180, 130, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Impact effect when landing
  if (progress > 0.85) {
    const impactProgress = (progress - 0.85) / 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - impactProgress) * 0.3})`;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Text overlay
  if (progress > 0.85) {
    const textAlpha = (progress - 0.85) / 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
    ctx.font = "bold 28px Orbitron, monospace";
    ctx.textAlign = "center";
    ctx.fillText("PLANETFALL COMPLETE", width / 2, height / 2);
    ctx.font = "18px Orbitron, monospace";
    ctx.fillText("Welcome to the desert world", width / 2, height / 2 + 35);
  }
}

export function tryAdvanceWave() {
  // Don't advance if a cinematic is playing
  if (cinematicState.active || state.cinematic.playing) {
    return;
  }
  
  const allEnemiesClear = state.enemies.length === 0 && state.diamonds.length === 0 && state.tunnels.length === 0 && 
                          state.tanks.length === 0 && state.walkers.length === 0 && state.mechs.length === 0;

  if (allEnemiesClear && !state.waveTransition) {
    state.clearBullets();
    state.clearLightning();
    // Clear ground objects from previous wave
    state.groundObjects.length = 0;

    // Check for special cinematic triggers
    if (state.wave === 10) {
      // Post Wave 11 (index 10): Death Star destruction
      playDeathStarExplosionCinematic();
      return;
    } else if (state.wave === 12) {
      // End of Wave 13 (index 12): Planetfall
      playPlanetfallCinematic();
      return;
    }

    if (state.wave >= waves.length-1) { 
      state.setWaveTransition(true);
      state.setWaveTransitionTimer(0);
      return; 
    }
    state.setWaveTransition(true);
    state.setWaveTransitionTimer(0);
  }

  if (state.waveTransition) {
    state.incrementWaveTransitionTimer();
    if (state.waveTransitionTimer >= state.WAVE_BREAK_MS / (1000/60)) {
      state.incrementWave();
      if (state.wave < waves.length) {
        spawnWave(state.wave);

        if (state.wave <= 10) {
          const earthY = state.canvas.height * 0.85;
          state.player.y += (earthY - state.player.y) * 0.15;
          state.player.x += (state.canvas.width/2 - state.player.x) * 0.06;
        }
        
        // Spawn power-ups every 2 levels (wave+1 to match displayed wave number)
        const displayedWave = state.wave + 1;
        if (displayedWave % 2 === 0) {
          // Spawn power-ups for the gold star to collect
          const centerX = state.canvas.width / 2;
          const centerY = state.canvas.height / 2;
          const spreadRadius = 80;
          
          // Spawn 3 power-ups in a cluster
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * spreadRadius;
            const y = centerY + Math.sin(angle) * spreadRadius;
            spawns.spawnRandomPowerUp(x, y);
          }
        }
      }
      state.setWaveTransition(false);
      state.setWaveTransitionTimer(0);
    }
  }
}