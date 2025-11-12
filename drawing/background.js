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

// =====================================================
// SPACE BACKGROUNDS FOR WAVES 1-6: "Approaching Death Star Arc"
// =====================================================

function drawSpaceBackground(waveNum) {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Base space gradient - deep space black with subtle blue/purple tones
  const spaceGradient = ctx.createLinearGradient(0, 0, 0, height);
  
  switch(waveNum) {
    case 0: // Wave 1: Deep space - beginning of journey
      spaceGradient.addColorStop(0, "#000814");
      spaceGradient.addColorStop(0.5, "#001d3d");
      spaceGradient.addColorStop(1, "#000814");
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, width, height);
      drawStarfield(60, 1.0); // Sparse star field
      break;
      
    case 1: // Wave 2: Asteroid field approach
      spaceGradient.addColorStop(0, "#000814");
      spaceGradient.addColorStop(0.5, "#001d3d");
      spaceGradient.addColorStop(1, "#000814");
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, width, height);
      drawStarfield(70, 1.0);
      drawAsteroidField(); // More dense space objects
      break;
      
    case 2: // Wave 3: Nebula passage - colorful space clouds
      spaceGradient.addColorStop(0, "#1a0033");
      spaceGradient.addColorStop(0.3, "#330066");
      spaceGradient.addColorStop(0.6, "#1a0040");
      spaceGradient.addColorStop(1, "#000814");
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, width, height);
      drawNebula(); // Colorful gas clouds
      drawStarfield(80, 1.0);
      break;
      
    case 3: // Wave 4: Death Star becomes visible in distance
      spaceGradient.addColorStop(0, "#000814");
      spaceGradient.addColorStop(0.5, "#001d3d");
      spaceGradient.addColorStop(1, "#001a2e");
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, width, height);
      drawStarfield(75, 0.9);
      drawDeathStar(0.15, width * 0.75, height * 0.3); // Small in distance
      break;
      
    case 4: // Wave 5: Approaching the Death Star - much closer
      spaceGradient.addColorStop(0, "#000814");
      spaceGradient.addColorStop(0.5, "#001d3d");
      spaceGradient.addColorStop(1, "#001a2e");
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, width, height);
      drawStarfield(70, 0.8);
      drawDeathStar(0.35, width * 0.7, height * 0.35); // Larger and closer
      break;
      
    case 5: // Wave 6: At the Death Star - boss battle
      spaceGradient.addColorStop(0, "#001a2e");
      spaceGradient.addColorStop(0.5, "#002a4a");
      spaceGradient.addColorStop(1, "#001a2e");
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, width, height);
      drawStarfield(60, 0.7);
      drawDeathStar(0.7, width * 0.65, height * 0.4); // Dominates background
      break;
  }
}

// Draw starfield with deterministic positions for consistent look
function drawStarfield(count, brightness) {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random positions based on index
    const x = ((i * 137.5) % width);
    const y = ((i * 73.3) % height);
    const size = ((i * 7) % 3) + 1;
    const alpha = (((i * 23) % 70) + 30) / 100 * brightness;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, size, size);
    
    // Add some colored stars for variety (16-bit style)
    if (i % 7 === 0) {
      ctx.fillStyle = `rgba(100, 150, 255, ${alpha * 0.6})`;
      ctx.fillRect(x, y, size, size);
    } else if (i % 11 === 0) {
      ctx.fillStyle = `rgba(255, 200, 100, ${alpha * 0.6})`;
      ctx.fillRect(x, y, size, size);
    }
  }
}

// Draw asteroid field for wave 2
function drawAsteroidField() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Draw simple hand-drawn style asteroids
  const asteroidCount = 15;
  for (let i = 0; i < asteroidCount; i++) {
    const x = ((i * 197.3) % width);
    const y = ((i * 83.7) % height);
    const size = ((i * 13) % 15) + 8;
    
    // Darker asteroids in background for depth
    const alpha = ((i * 17) % 40) + 20;
    ctx.fillStyle = `rgba(100, 100, 120, ${alpha / 100})`;
    
    // Draw irregular asteroid shape (16-bit pixel style)
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      const wobble = ((i + j) * 0.3) % 0.4 + 0.7;
      const px = x + Math.cos(angle) * size * wobble;
      const py = y + Math.sin(angle) * size * wobble;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    // Add some detail highlights
    ctx.fillStyle = `rgba(150, 150, 170, ${alpha / 200})`;
    ctx.fillRect(x - size * 0.3, y - size * 0.3, size * 0.3, size * 0.3);
  }
}

// Draw colorful nebula for wave 3
function drawNebula() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Create multiple layered nebula clouds
  const nebulaClouds = [
    { x: width * 0.2, y: height * 0.3, size: 200, color: 'rgba(138, 43, 226, 0.15)' },
    { x: width * 0.7, y: height * 0.5, size: 250, color: 'rgba(255, 20, 147, 0.12)' },
    { x: width * 0.4, y: height * 0.7, size: 180, color: 'rgba(30, 144, 255, 0.1)' },
    { x: width * 0.6, y: height * 0.2, size: 220, color: 'rgba(138, 43, 226, 0.08)' },
  ];
  
  nebulaClouds.forEach(cloud => {
    // Create radial gradient for each nebula cloud
    const gradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.size);
    gradient.addColorStop(0, cloud.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
}

// Draw Death Star with 16-bit pixel art style
function drawDeathStar(scale, x, y) {
  const ctx = state.ctx;
  const baseSize = 150;
  const size = baseSize * scale;
  
  // Main Death Star sphere (gray with slight gradient)
  const gradient = ctx.createRadialGradient(x - size * 0.2, y - size * 0.2, 0, x, y, size);
  gradient.addColorStop(0, '#9ca3af');
  gradient.addColorStop(0.7, '#6b7280');
  gradient.addColorStop(1, '#374151');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Characteristic superlaser dish (indented circle)
  const dishSize = size * 0.3;
  const dishX = x + size * 0.5;
  const dishY = y - size * 0.2;
  
  ctx.fillStyle = '#4b5563';
  ctx.beginPath();
  ctx.arc(dishX, dishY, dishSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Dish detail (inner circle)
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.arc(dishX, dishY, dishSize * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Add equatorial trench (horizontal line across middle)
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = Math.max(2, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(x - size, y + size * 0.1);
  ctx.lineTo(x + size, y + size * 0.1);
  ctx.stroke();
  
  // Add surface panels (16-bit pixel detail)
  ctx.fillStyle = 'rgba(75, 85, 99, 0.3)';
  const panelCount = Math.floor(scale * 30);
  for (let i = 0; i < panelCount; i++) {
    const angle = ((i * 137.5) % 360) * Math.PI / 180;
    const radius = ((i * 73) % (size * 0.8)) + size * 0.1;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    const panelSize = ((i * 5) % 3) + 2;
    
    ctx.fillRect(px, py, panelSize, panelSize);
  }
  
  // Add subtle glow for larger Death Star (waves 5-6)
  if (scale > 0.3) {
    ctx.fillStyle = 'rgba(200, 200, 220, 0.05)';
    ctx.beginPath();
    ctx.arc(x, y, size * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawBackground(waveNum) {
  // NEW: Space backgrounds for waves 1-6 (Approaching Death Star Arc)
  if (waveNum >= 0 && waveNum <= 5) {
    drawSpaceBackground(waveNum);
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  // ORIGINAL: Desert sky background for waves 7+ (warm desert atmosphere)
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
