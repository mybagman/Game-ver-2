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
  
  // Spawn ground objects for city/building waves
  if (waveData.theme === "city-descent" || waveData.theme === "ruined-city") {
    spawns.spawnGroundObjects();
  }

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
    cinematicState.active = false;
    cinematicState.type = null;
    cinematicState.frame = 0;
    state.cinematic.playing = false;
    return false;
  }
  
  return true; // Still playing
}

// Death Star explosion sequence
function renderDeathStarExplosion(ctx, width, height) {
  const progress = cinematicState.frame / cinematicState.totalFrames;
  
  // Dark space background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  
  // Death Star in center (first half of animation)
  if (progress < 0.5) {
    const deathStarProgress = progress * 2;
    const deathStarSize = 200 - (deathStarProgress * 50);
    const deathStarX = width / 2;
    const deathStarY = height / 2;
    
    // Flash effect as it starts exploding
    if (progress > 0.3) {
      const flashIntensity = Math.sin((progress - 0.3) * 40) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.3})`;
      ctx.beginPath();
      ctx.arc(deathStarX, deathStarY, deathStarSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Death Star body (cracking)
    const gradient = ctx.createRadialGradient(deathStarX, deathStarY, 0, deathStarX, deathStarY, deathStarSize);
    gradient.addColorStop(0, '#9ca3af');
    gradient.addColorStop(0.7, '#6b7280');
    gradient.addColorStop(1, '#374151');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(deathStarX, deathStarY, deathStarSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Cracks appearing
    if (progress > 0.2) {
      ctx.strokeStyle = `rgba(255, 150, 50, ${(progress - 0.2) * 3})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(deathStarX, deathStarY);
        ctx.lineTo(deathStarX + Math.cos(angle) * deathStarSize * 1.2, deathStarY + Math.sin(angle) * deathStarSize * 1.2);
        ctx.stroke();
      }
    }
  }
  
  // Explosion particles (second half)
  if (progress > 0.4) {
    const explosionProgress = (progress - 0.4) / 0.6;
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (i * 0.3);
      const speed = 2 + (i % 5) * 0.5;
      const distance = explosionProgress * speed * 300;
      const x = width / 2 + Math.cos(angle) * distance;
      const y = height / 2 + Math.sin(angle) * distance;
      const size = 8 - (explosionProgress * 6);
      
      const alpha = 1 - explosionProgress;
      ctx.fillStyle = `rgba(255, ${150 - explosionProgress * 100}, 50, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Player and gold star escaping (visible throughout)
  const playerX = width / 2 - 100 + (progress * 50);
  const playerY = height / 2 + 80 - (progress * 150);
  
  const goldStarX = width / 2 + 100 - (progress * 50);
  const goldStarY = height / 2 + 100 - (progress * 150);
  
  // Draw player (simple representation)
  ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
  ctx.beginPath();
  ctx.moveTo(playerX, playerY - 8);
  ctx.lineTo(playerX - 6, playerY + 6);
  ctx.lineTo(playerX + 6, playerY + 6);
  ctx.closePath();
  ctx.fill();
  
  // Draw gold star
  ctx.fillStyle = "rgba(255, 200, 50, 0.9)";
  ctx.save();
  ctx.translate(goldStarX, goldStarY);
  ctx.rotate(cinematicState.frame * 0.1);
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const outerRadius = 12;
    const innerRadius = 6;
    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    ctx.lineTo(Math.cos(angle + Math.PI / 5) * innerRadius, Math.sin(angle + Math.PI / 5) * innerRadius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // Text overlay
  if (progress > 0.7) {
    const textAlpha = (progress - 0.7) / 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
    ctx.font = "bold 32px Orbitron, monospace";
    ctx.textAlign = "center";
    ctx.fillText("DEATH STAR DESTROYED", width / 2, height / 2 - 100);
    ctx.font = "20px Orbitron, monospace";
    ctx.fillText("Escaping to safety...", width / 2, height / 2 - 60);
  }
}

// Planetfall landing sequence
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
  const groundY = height * (1 - progress * 0.4);
  ctx.fillStyle = "#c9984a";
  ctx.fillRect(0, groundY, width, height - groundY);
  
  // Dust clouds from landing
  if (progress > 0.6) {
    const dustProgress = (progress - 0.6) / 0.4;
    for (let i = 0; i < 10; i++) {
      const x = width / 2 + (i - 5) * 60;
      const y = groundY + 20;
      const size = 40 + dustProgress * 30;
      const alpha = 0.4 - (dustProgress * 0.3);
      
      ctx.fillStyle = `rgba(220, 180, 130, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Player and gold star descending
  const descentY = height * 0.3 + (progress * height * 0.4);
  
  // Draw player
  ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
  ctx.beginPath();
  ctx.moveTo(width / 2 - 60, descentY - 8);
  ctx.lineTo(width / 2 - 66, descentY + 6);
  ctx.lineTo(width / 2 - 54, descentY + 6);
  ctx.closePath();
  ctx.fill();
  
  // Draw gold star
  ctx.fillStyle = "rgba(255, 200, 50, 0.9)";
  ctx.save();
  ctx.translate(width / 2 + 60, descentY);
  ctx.rotate(cinematicState.frame * 0.1);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const outerRadius = 12;
    const innerRadius = 6;
    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    ctx.lineTo(Math.cos(angle + Math.PI / 5) * innerRadius, Math.sin(angle + Math.PI / 5) * innerRadius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // Impact effect when landing
  if (progress > 0.8) {
    const impactProgress = (progress - 0.8) / 0.2;
    const shakeAmount = (1 - impactProgress) * 10;
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - impactProgress) * 0.5})`;
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
  const allEnemiesClear = state.enemies.length === 0 && state.diamonds.length === 0 && state.tunnels.length === 0 && 
                          state.tanks.length === 0 && state.walkers.length === 0 && state.mechs.length === 0;

  if (allEnemiesClear && !state.waveTransition && !cinematicState.active) {
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
      }
      state.setWaveTransition(false);
      state.setWaveTransitionTimer(0);
    }
  }
  
  // Handle cinematic completion - advance wave after cinematic
  if (cinematicState.active && !state.cinematic.playing) {
    state.incrementWave();
    if (state.wave < waves.length) {
      spawnWave(state.wave);
    }
  }
}