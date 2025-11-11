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

// NEW: Desert landscape that persists across all waves
export function drawDesertGround() {
  const groundHeight = state.canvas.height * 0.25; // Bottom 25% of screen
  const groundY = state.canvas.height - groundHeight;
  
  // Desert sand gradient (warm yellows and browns)
  const desertGradient = state.ctx.createLinearGradient(0, groundY, 0, state.canvas.height);
  desertGradient.addColorStop(0, "#d4a574"); // Light sand
  desertGradient.addColorStop(0.4, "#c9984a"); // Medium sand
  desertGradient.addColorStop(1, "#a87d3a"); // Darker sand
  
  state.ctx.fillStyle = desertGradient;
  state.ctx.fillRect(0, groundY, state.canvas.width, groundHeight);
  
  // Sand dunes (rolling hills using sine waves)
  state.ctx.fillStyle = "rgba(180, 140, 90, 0.3)";
  state.ctx.beginPath();
  state.ctx.moveTo(0, groundY);
  
  for (let x = 0; x <= state.canvas.width; x += 20) {
    const duneHeight = Math.sin(x * 0.01 + state.frameCount * 0.002) * 30 + 
                       Math.sin(x * 0.005) * 20;
    state.ctx.lineTo(x, groundY + duneHeight);
  }
  
  state.ctx.lineTo(state.canvas.width, groundY);
  state.ctx.closePath();
  state.ctx.fill();
  
  // Sand texture (small dots for detail)
  state.ctx.fillStyle = "rgba(200, 160, 110, 0.2)";
  for (let i = 0; i < 100; i++) {
    const x = (i * 137.5 + i * i * 73) % state.canvas.width;
    const y = groundY + ((i * 89) % groundHeight);
    state.ctx.fillRect(x, y, 2, 2);
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
  // REDESIGNED: Desert sky background (warm desert atmosphere)
  const skyGradient = state.ctx.createLinearGradient(0, 0, 0, state.canvas.height * 0.7);
  skyGradient.addColorStop(0, "#87ceeb"); // Sky blue at top
  skyGradient.addColorStop(0.6, "#e8d4a0"); // Hazy horizon
  skyGradient.addColorStop(1, "#d4a574"); // Sandy horizon
  
  state.ctx.fillStyle = skyGradient;
  state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height * 0.75);
  
  // Draw a few small stationary clouds (requirement: only a few small clouds, stationary)
  drawStaticDesertClouds();
  
  // PERSISTENT desert ground across ALL waves (requirement: desert ground persists)
  drawDesertGround();

  state.incrementBackgroundOffset(0.5);
}

// NEW: Static desert clouds (stationary, not moving)
function drawStaticDesertClouds() {
  const clouds = [
    { x: 150, y: 80, size: 30 },
    { x: 400, y: 120, size: 25 },
    { x: 800, y: 60, size: 35 },
    { x: 1100, y: 100, size: 28 }
  ];
  
  clouds.forEach(cloud => {
    // Only draw if within canvas bounds
    if (cloud.x < state.canvas.width) {
      state.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      state.ctx.beginPath();
      state.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Add fluffy bumps
      state.ctx.beginPath();
      state.ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
      state.ctx.fill();
      state.ctx.beginPath();
      state.ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
      state.ctx.fill();
    }
  });
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
