import * as state from '../state.js';

export function drawClouds() {
  // Hand-drawn anime-style clouds for wave 11+, Lofi-style fluffy clouds before
  // Layered for depth (background, mid, foreground)
  
  const isAnimeStyle = state.wave >= 11;
  
  state.cloudParticles.forEach(c => {
    const layer = c.layer || 0;
    // Layer-based scale and alpha
    const scales = [0.7, 0.9, 1.1]; // background smaller, foreground larger
    const alphas = [0.35, 0.5, 0.65]; // background fainter, foreground brighter
    
    const scale = scales[layer] || 1.0;
    const alpha = alphas[layer] || 0.5;
    
    state.ctx.save();
    state.ctx.globalAlpha = c.opacity * alpha;
    
    if (isAnimeStyle) {
      // Hand-drawn anime style with more irregular edges
      state.ctx.fillStyle = `rgba(250, 252, 255, 1)`;
      
      // Create more organic, hand-drawn bumpy outline
      const bumps = 6;
      state.ctx.beginPath();
      for (let i = 0; i <= bumps; i++) {
        const angle = (i / bumps) * Math.PI * 2;
        // Add randomness based on cloud index for consistent hand-drawn look
        const wobble = Math.sin((c.x * 0.1 + i * 2.3)) * 0.2 + 0.9;
        const radius = c.size * scale * wobble;
        const px = c.x + Math.cos(angle) * radius * 0.8;
        const py = c.y + Math.sin(angle) * radius * 0.6;
        if (i === 0) {
          state.ctx.moveTo(px, py);
        } else {
          state.ctx.lineTo(px, py);
        }
      }
      state.ctx.closePath();
      state.ctx.fill();
      
      // Add hand-drawn outline
      state.ctx.strokeStyle = `rgba(200, 210, 230, ${alpha * 0.4})`;
      state.ctx.lineWidth = 1.5;
      state.ctx.stroke();
      
      // Soft shading in anime style
      state.ctx.globalAlpha = c.opacity * alpha * 0.25;
      state.ctx.fillStyle = `rgba(180, 200, 230, 1)`;
      state.ctx.beginPath();
      state.ctx.arc(c.x + c.size * scale * 0.2, c.y + c.size * scale * 0.3, c.size * scale * 0.5, 0, Math.PI * 2);
      state.ctx.fill();
    } else {
      // Original Lofi-style fluffy clouds (pre-wave 11)
      // Main fluffy cloud body (white/off-white)
      state.ctx.fillStyle = `rgba(240, 245, 250, 1)`;
      state.ctx.beginPath();
      state.ctx.arc(c.x, c.y, c.size * scale, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Add 3-4 fluffy bumps for Nimbus-style puffiness
      const bumps = 4;
      for (let i = 0; i < bumps; i++) {
        const angle = (i / bumps) * Math.PI * 2;
        const offsetX = Math.cos(angle) * c.size * scale * 0.5;
        const offsetY = Math.sin(angle) * c.size * scale * 0.4;
        
        state.ctx.globalAlpha = c.opacity * alpha * 0.7;
        state.ctx.beginPath();
        state.ctx.arc(c.x + offsetX, c.y + offsetY, c.size * scale * 0.6, 0, Math.PI * 2);
        state.ctx.fill();
      }
      
      // Soft highlight on top (lofi shading)
      state.ctx.globalAlpha = c.opacity * alpha * 0.3;
      state.ctx.fillStyle = `rgba(255, 255, 255, 1)`;
      state.ctx.beginPath();
      state.ctx.arc(c.x - c.size * scale * 0.15, c.y - c.size * scale * 0.2, c.size * scale * 0.5, 0, Math.PI * 2);
      state.ctx.fill();
    }
    
    state.ctx.restore();
    state.ctx.globalAlpha = 1;
  });
}

export function drawCityBackground() {
  state.ctx.fillStyle = "rgba(20,20,30,0.8)";
  // Reduced from 20 to 10 buildings for better performance
  for (let i = 0; i < 10; i++) {
    const x = i * (state.canvas.width / 10);
    const height = 100 + Math.sin(i) * 50;
    state.ctx.fillRect(x, state.canvas.height - height, state.canvas.width / 10 - 5, height);
  }
}

export function drawGroundObjects() {
  // Draw ground collision objects (buildings/terrain)
  state.groundObjects.forEach(ground => {
    state.ctx.save();
    
    // Building with 8-bit aesthetic
    state.ctx.fillStyle = "#3a3a4a";
    state.ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
    
    // Building windows (8-bit style)
    const windowSize = 8;
    const windowSpacing = 16;
    state.ctx.fillStyle = "#6a6a8a";
    
    for (let wx = ground.x + 10; wx < ground.x + ground.width - 10; wx += windowSpacing) {
      for (let wy = ground.y + 10; wy < ground.y + ground.height - 10; wy += windowSpacing) {
        state.ctx.fillRect(wx, wy, windowSize, windowSize);
      }
    }
    
    // Building outline
    state.ctx.strokeStyle = "#2a2a3a";
    state.ctx.lineWidth = 2;
    state.ctx.strokeRect(ground.x, ground.y, ground.width, ground.height);
    
    // Danger indicator (red glow at top)
    state.ctx.fillStyle = "rgba(255, 50, 50, 0.3)";
    state.ctx.fillRect(ground.x, ground.y, ground.width, 5);
    
    state.ctx.restore();
  });
}

export function drawBackground(waveNum) {
  if (waveNum >= 12 && waveNum <= 21) {
    if (waveNum === 12) {
      const grad = state.ctx.createLinearGradient(0, 0, 0, state.canvas.height);
      grad.addColorStop(0, "#1a0a0a");
      grad.addColorStop(0.5, "#4a1a0a");
      grad.addColorStop(1, "#8a3a1a");
      state.ctx.fillStyle = grad;
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

      // Reduced from 30 to 15 particles, use deterministic positions
      for (let i = 0; i < 15; i++) {
        const x = (i * 73 + i * i * 17) % state.canvas.width; // deterministic x position
        const y = (state.frameCount * 3 + i * 50) % state.canvas.height;
        const colorVariation = ((i * 37) % 100);
        const alphaVariation = ((i * 13) % 50) / 100;
        state.ctx.fillStyle = `rgba(255,${100 + colorVariation},0,${alphaVariation})`;
        state.ctx.fillRect(x, y, 3, 10);
      }
    } else if (waveNum === 13) {
      state.ctx.fillStyle = "#6a8a9a";
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      drawClouds();
    } else if (waveNum >= 14 && waveNum <= 19) {
      const grad = state.ctx.createLinearGradient(0, 0, 0, state.canvas.height);
      grad.addColorStop(0, "#2a2a3a");
      grad.addColorStop(1, "#4a3a2a");
      state.ctx.fillStyle = grad;
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      drawCityBackground();
    } else if (waveNum >= 20) {
      state.ctx.fillStyle = "#0a0a1a";
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      if (state.frameCount % 60 < 3) {
        state.ctx.fillStyle = `rgba(255,255,255,${(3 - state.frameCount % 60) / 3 * 0.3})`;
        state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      }
    }
  } else {
    state.ctx.fillStyle = "#00142b";
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

    for (let i = 0; i < 80; i++) {
      const seed = (i * 97 + (i % 7) * 13);
      const x = (seed + state.backgroundOffset * (0.2 + (i % 5) * 0.02)) % state.canvas.width;
      const y = (i * 89 + Math.sin(state.frameCount * 0.01 + i) * 20) % state.canvas.height;
      const alpha = 0.3 + (i % 3) * 0.15;
      state.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      state.ctx.fillRect(x, y, 2, 2);
    }

    state.ctx.strokeStyle = "rgba(200,240,255,0.03)";
    state.ctx.lineWidth = 1;
    for (let r = 1; r <= 3; r++) {
      state.ctx.beginPath();
      const radius = (Math.min(state.canvas.width, state.canvas.height) / 2) * (0.5 + r * 0.12 + Math.sin(state.frameCount * 0.005 + r) * 0.01);
      state.ctx.arc(state.canvas.width / 2, state.canvas.height * 0.25, radius, 0, Math.PI * 2);
      state.ctx.stroke();
    }

    const earthBaseY = state.canvas.height * 0.9;
    const progressFactor = Math.min(1, Math.max(0, state.wave / 10));
    const earthRadius = 120 + progressFactor * 90;
    const earthX = state.canvas.width / 2;
    const earthY = earthBaseY;
    const eg = state.ctx.createRadialGradient(earthX, earthY, earthRadius * 0.1, earthX, earthY, earthRadius);
    eg.addColorStop(0, "#2b6f2b");
    eg.addColorStop(0.6, "#144f8a");
    eg.addColorStop(1, "#071325");
    state.ctx.fillStyle = eg;
    state.ctx.beginPath();
    state.ctx.arc(earthX, earthY, earthRadius, Math.PI, 2 * Math.PI);
    state.ctx.lineTo(state.canvas.width, state.canvas.height);
    state.ctx.lineTo(0, state.canvas.height);
    state.ctx.closePath();
    state.ctx.fill();

    state.ctx.globalAlpha = 0.08 + progressFactor * 0.12;
    state.ctx.fillStyle = "rgba(100,180,255,0.6)";
    state.ctx.beginPath();
    state.ctx.arc(earthX, earthY - 10, earthRadius + 30, Math.PI, 2 * Math.PI);
    state.ctx.fill();
    state.ctx.globalAlpha = 1;
  }

  state.incrementBackgroundOffset(0.5);
}

// ----------------------
// New additions: planetary parallax, re-entry, dropship, tunnel collisions
// These are appended here so game.js can import them alongside existing exports.
// ----------------------

// ----------------------
// Layered parallax setup
// ----------------------
const planetLayers = [
  { y: 0.2, scale: 0.3, speed: 0.1, color: '#2b2b2b' },
  { y: 0.3, scale: 0.5, speed: 0.2, color: '#3d3d3d' },
  { y: 0.4, scale: 0.8, speed: 0.3, color: '#4d4d4d' }
];

let tunnelCollisions = [];

// ----------------------
// Parallax Planet Render
// ----------------------
export function drawPlanetBackground(wave) {
  // Accept wave argument (from drawAll) or fallback to state.wave
  const currentWave = (typeof wave === 'number') ? wave : state.wave;

  // don't draw planet until a later wave
  if (currentWave < 5) return;

  const ctx = state.ctx;
  const { width, height } = state;

  // prefer state.time, but fall back to frameCount-based time (millis approx)
  const time = (typeof state.time === 'number') ? state.time : (state.frameCount * (1000/60));

  const planetSize = Math.min(width, height) * (0.5 + Math.min((currentWave - 5) * 0.1, 1.5));
  const planetX = width / 2;
  const planetY = height * (0.7 + Math.sin(time / 5000) * 0.01);

  planetLayers.forEach((layer) => {
    const offset = Math.sin(time * layer.speed * 0.001) * 10;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.arc(planetX + offset, planetY, planetSize * layer.scale, 0, Math.PI * 2);
    ctx.fill();
  });

  // Reduced from 60+wave*2 to 30+wave (max capped) with deterministic positions
  const pixelCount = Math.min(30 + currentWave, 50);
  for (let i = 0; i < pixelCount; i++) {
    // Use deterministic positions based on index
    const angleBase = (i * 137.5) % 360; // golden angle for even distribution
    const radiusFactor = ((i * 73) % 100) / 100;
    const px = planetX + Math.cos(angleBase) * planetSize * radiusFactor * 0.5;
    const py = planetY + Math.sin(angleBase) * planetSize * radiusFactor * 0.25;
    const r = 80 + ((i * 37) % 50);
    const g = 80 + ((i * 53) % 50);
    const b = 80 + ((i * 71) % 50);
    ctx.fillStyle = `rgba(${r},${g},${b},0.3)`;
    ctx.fillRect(px, py, 2, 2);
  }
}

// ----------------------
// Re-entry visual effects have been moved to Effects.js
// ----------------------
