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

// City background removed - no longer used in game
// export function drawCityBackground() {
//   state.ctx.fillStyle = "rgba(20,20,30,0.8)";
//   // Reduced from 20 to 10 buildings for better performance
//   for (let i = 0; i < 10; i++) {
//     const x = i * (state.canvas.width / 10);
//     const height = 100 + Math.sin(i) * 50;
//     state.ctx.fillRect(x, state.canvas.height - height, state.canvas.width / 10 - 5, height);
//   }
// }

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
  // Added defensive check for empty arrays
  if (!state.groundObjects || state.groundObjects.length === 0) {
    return; // Safely handle empty arrays
  }
  
  state.groundObjects.forEach(ground => {
    if (!ground) return; // Skip null/undefined objects
    
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
    const y = ((i * 73.3) % (height * 0.85)); // Keep stars in upper 85% to leave room for ocean
    const sizeVariation = ((i * 7) % 4);
    const alpha = (((i * 23) % 70) + 30) / 100 * brightness;
    
    // Different star sizes and shapes for variety
    if (sizeVariation === 0) {
      // Small dot stars
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    } else if (sizeVariation === 1) {
      // Medium dot stars
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.fillRect(x, y, 2, 2);
    } else if (sizeVariation === 2) {
      // Cross-shaped stars (larger, brighter)
      const crossAlpha = alpha * 1.2;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(crossAlpha, 1.0)})`;
      // Draw cross shape
      ctx.fillRect(x, y - 1, 1, 3);  // Vertical line
      ctx.fillRect(x - 1, y, 3, 1);  // Horizontal line
      ctx.fillRect(x, y, 1, 1);      // Center pixel
    } else {
      // Larger bright stars
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.1})`;
      ctx.fillRect(x, y, 3, 3);
    }
    
    // Add blue and white colored stars scattered throughout
    if (i % 5 === 0) {
      ctx.fillStyle = `rgba(100, 150, 255, ${alpha * 0.8})`;
      ctx.fillRect(x, y, 2, 2);
    } else if (i % 7 === 0) {
      ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.7})`;
      ctx.fillRect(x + 1, y, 1, 1);
    }
  }
  
  // Add ocean/water at the bottom
  drawSpaceOcean();
}

// Draw ocean/water at bottom for space backgrounds
function drawSpaceOcean() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  const oceanHeight = height * 0.15; // Bottom 15% of screen
  const oceanY = height - oceanHeight;
  
  // Ocean gradient transitioning from space
  const oceanGradient = ctx.createLinearGradient(0, oceanY, 0, height);
  oceanGradient.addColorStop(0, "rgba(0, 10, 30, 0.3)"); // Transparent dark blue at top
  oceanGradient.addColorStop(0.3, "rgba(0, 20, 50, 0.6)");
  oceanGradient.addColorStop(0.6, "rgba(0, 30, 70, 0.8)");
  oceanGradient.addColorStop(1, "rgba(0, 40, 90, 1.0)"); // Solid darker blue at bottom
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, oceanY, width, oceanHeight);
  
  // Add subtle wave reflections
  ctx.fillStyle = "rgba(100, 150, 200, 0.1)";
  for (let i = 0; i < 5; i++) {
    const waveY = oceanY + (i * oceanHeight / 5) + Math.sin(state.frameCount * 0.02 + i) * 3;
    ctx.fillRect(0, waveY, width, 1);
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

// =====================================================
// ARC TWO: DEATH STAR BACKGROUNDS FOR WAVES 7-11 (indices 6-10)
// =====================================================

// Wave 7 (index 6): Death Star Orbit
function drawDeathStarOrbit() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Deep space with Death Star dominating the view
  const spaceGradient = ctx.createLinearGradient(0, 0, 0, height);
  spaceGradient.addColorStop(0, "#000814");
  spaceGradient.addColorStop(0.5, "#001a2e");
  spaceGradient.addColorStop(1, "#000814");
  ctx.fillStyle = spaceGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Starfield for space atmosphere
  drawStarfield(65, 0.7);
  
  // Massive Death Star taking up significant screen space
  drawDeathStar(0.85, width * 0.6, height * 0.45);
  
  // Add some orbital debris and fighters for battle atmosphere
  drawOrbitalDebris();
}

// Wave 8 (index 7): Death Star Approach - Animated progression
function drawDeathStarApproach() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Calculate progress through the wave based on enemy count
  // Start at 0.85 scale, end at filling entire background (scale 3.5+)
  const enemyCount = state.enemies.length + state.diamonds.length + state.tanks.length + 
                     state.walkers.length + state.mechs.length;
  const initialEnemyCount = 20; // Approximate starting count for wave 8
  const progress = 1 - Math.min(enemyCount / initialEnemyCount, 1);
  
  // Scale from 0.85 to 3.5 (fills entire screen)
  const deathStarScale = 0.85 + (progress * 2.65);
  
  // Dark space - gets darker as Death Star gets closer
  const darknessLevel = 0.15 + (progress * 0.1);
  const spaceGradient = ctx.createLinearGradient(0, 0, 0, height);
  spaceGradient.addColorStop(0, `rgba(0, 8, 20, ${darknessLevel})`);
  spaceGradient.addColorStop(0.5, `rgba(0, 26, 46, ${darknessLevel + 0.05})`);
  spaceGradient.addColorStop(1, `rgba(0, 8, 20, ${darknessLevel})`);
  ctx.fillStyle = spaceGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Starfield fades as Death Star approaches
  drawStarfield(65, 0.7 - (progress * 0.5));
  
  // Death Star progressively gets closer and larger
  drawDeathStar(deathStarScale, width * 0.5, height * 0.5);
  
  // More intense orbital debris as we get closer
  drawOrbitalDebris();
  if (progress > 0.5) {
    // Additional debris layer for intensity
    drawOrbitalDebris();
  }
}

// Wave 9 (index 8): Entrance to the Core
function drawDeathStarEntrance() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Darker space with focus on the entrance
  const spaceGradient = ctx.createLinearGradient(0, 0, 0, height);
  spaceGradient.addColorStop(0, "#000510");
  spaceGradient.addColorStop(0.5, "#001520");
  spaceGradient.addColorStop(1, "#000510");
  ctx.fillStyle = spaceGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Sparse starfield (entering the station)
  drawStarfield(40, 0.5);
  
  // Draw the entrance gateway/tunnel mouth
  drawEntranceGateway();
}

// Wave 10 (index 9): Journey to the Core
function drawCoreJourney() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Dark interior with tech lighting
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0a0a15");
  gradient.addColorStop(0.5, "#15151f");
  gradient.addColorStop(1, "#0a0a15");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Interior corridor/tunnel walls
  drawInteriorCorridor();
  
  // Tech panel lighting
  drawTechPanels();
}

// Wave 11 (index 10): The Core - Diamond Boss Chamber
function drawCoreChamber() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Epic core chamber with energy glow
  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.7);
  gradient.addColorStop(0, "#1a0f2e");
  gradient.addColorStop(0.3, "#0f0820");
  gradient.addColorStop(0.7, "#050510");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Core reactor glow
  drawReactorCore();
  
  // Energy conduits and panels
  drawEnergyConduits();
  
  // Dramatic lighting effects
  drawCoreLighting();
}

// Helper: Draw orbital debris for battle atmosphere
function drawOrbitalDebris() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Small debris and wreckage pieces
  const debrisCount = 12;
  for (let i = 0; i < debrisCount; i++) {
    const x = ((i * 211.7) % width);
    const y = ((i * 97.3) % height);
    const size = ((i * 7) % 8) + 3;
    const alpha = ((i * 13) % 30) + 20;
    
    ctx.fillStyle = `rgba(120, 120, 140, ${alpha / 100})`;
    ctx.fillRect(x, y, size, size);
    
    // Some glowing pieces (damaged fighters)
    if (i % 3 === 0) {
      ctx.fillStyle = `rgba(255, 100, 50, ${alpha / 150})`;
      ctx.fillRect(x + size * 0.3, y + size * 0.3, size * 0.4, size * 0.4);
    }
  }
}

// Helper: Draw entrance gateway/tunnel mouth
function drawEntranceGateway() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Large circular entrance in center
  const entranceX = width * 0.5;
  const entranceY = height * 0.5;
  const entranceRadius = Math.min(width, height) * 0.35;
  
  // Entrance glow (energy shield effect)
  const glowGradient = ctx.createRadialGradient(entranceX, entranceY, entranceRadius * 0.5, entranceX, entranceY, entranceRadius * 1.2);
  glowGradient.addColorStop(0, "rgba(50, 100, 200, 0.3)");
  glowGradient.addColorStop(0.7, "rgba(30, 60, 150, 0.15)");
  glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Entrance ring structure (16-bit metallic)
  ctx.strokeStyle = "#4a5563";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(entranceX, entranceY, entranceRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner ring detail
  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(entranceX, entranceY, entranceRadius * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  
  // Structural supports (8 radial lines)
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(entranceX + Math.cos(angle) * entranceRadius * 0.8, entranceY + Math.sin(angle) * entranceRadius * 0.8);
    ctx.lineTo(entranceX + Math.cos(angle) * entranceRadius * 1.1, entranceY + Math.sin(angle) * entranceRadius * 1.1);
    ctx.stroke();
  }
  
  // Panel lights around entrance
  ctx.fillStyle = "rgba(100, 150, 255, 0.6)";
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const px = entranceX + Math.cos(angle) * entranceRadius * 1.05;
    const py = entranceY + Math.sin(angle) * entranceRadius * 1.05;
    ctx.fillRect(px - 3, py - 3, 6, 6);
  }
}

// Helper: Draw interior corridor walls
function drawInteriorCorridor() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Perspective corridor walls (left and right)
  const vanishingPointX = width * 0.5;
  const vanishingPointY = height * 0.4;
  
  // Left wall
  ctx.fillStyle = "#1a1a25";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(vanishingPointX - 150, vanishingPointY);
  ctx.lineTo(vanishingPointX - 150, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  
  // Right wall
  ctx.fillStyle = "#1a1a25";
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(vanishingPointX + 150, vanishingPointY);
  ctx.lineTo(vanishingPointX + 150, height);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  
  // Wall panel lines (left)
  ctx.strokeStyle = "#2a2a35";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const y = (i / 8) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(vanishingPointX - 150, vanishingPointY + (y - vanishingPointY) * 0.5);
    ctx.stroke();
  }
  
  // Wall panel lines (right)
  for (let i = 0; i < 8; i++) {
    const y = (i / 8) * height;
    ctx.beginPath();
    ctx.moveTo(width, y);
    ctx.lineTo(vanishingPointX + 150, vanishingPointY + (y - vanishingPointY) * 0.5);
    ctx.stroke();
  }
}

// Helper: Draw tech panels with lights
function drawTechPanels() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Panel lights on left wall
  for (let i = 0; i < 10; i++) {
    const x = 30 + (i * 5);
    const y = 50 + i * 60;
    const size = 8;
    
    // Alternating colors
    const color = (i % 2 === 0) ? "rgba(50, 150, 255, 0.7)" : "rgba(255, 50, 50, 0.6)";
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    
    // Glow effect
    ctx.fillStyle = color.replace(/0\.\d/, "0.2");
    ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
  }
  
  // Panel lights on right wall
  for (let i = 0; i < 10; i++) {
    const x = width - 50 - (i * 5);
    const y = 50 + i * 60;
    const size = 8;
    
    const color = (i % 2 === 0) ? "rgba(50, 255, 150, 0.7)" : "rgba(255, 150, 50, 0.6)";
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    
    ctx.fillStyle = color.replace(/0\.\d/, "0.2");
    ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
  }
}

// Helper: Draw reactor core for boss chamber
function drawReactorCore() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  const coreX = width * 0.5;
  const coreY = height * 0.5;
  const coreSize = Math.min(width, height) * 0.15;
  
  // Pulsing energy core (center)
  const pulse = Math.sin(state.frameCount * 0.05) * 0.2 + 0.8;
  
  // Outer glow
  const glowGradient = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreSize * 3);
  glowGradient.addColorStop(0, `rgba(150, 50, 255, ${0.4 * pulse})`);
  glowGradient.addColorStop(0.5, `rgba(100, 30, 200, ${0.2 * pulse})`);
  glowGradient.addColorStop(1, "rgba(50, 0, 100, 0)");
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Core sphere
  const coreGradient = ctx.createRadialGradient(coreX - coreSize * 0.2, coreY - coreSize * 0.2, 0, coreX, coreY, coreSize);
  coreGradient.addColorStop(0, `rgba(255, 200, 255, ${pulse})`);
  coreGradient.addColorStop(0.5, `rgba(200, 100, 255, ${pulse * 0.9})`);
  coreGradient.addColorStop(1, `rgba(150, 50, 200, ${pulse * 0.7})`);
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(coreX, coreY, coreSize * pulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Energy ring
  ctx.strokeStyle = `rgba(200, 100, 255, ${0.8 * pulse})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(coreX, coreY, coreSize * 1.5 * pulse, 0, Math.PI * 2);
  ctx.stroke();
}

// Helper: Draw energy conduits
function drawEnergyConduits() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  const coreX = width * 0.5;
  const coreY = height * 0.5;
  
  // 4 main conduits extending from core
  const conduits = [
    { angle: 0, color: "rgba(100, 200, 255, 0.4)" },
    { angle: Math.PI / 2, color: "rgba(255, 100, 200, 0.4)" },
    { angle: Math.PI, color: "rgba(100, 255, 200, 0.4)" },
    { angle: (Math.PI * 3) / 2, color: "rgba(255, 200, 100, 0.4)" }
  ];
  
  conduits.forEach(conduit => {
    const length = Math.min(width, height) * 0.4;
    const endX = coreX + Math.cos(conduit.angle) * length;
    const endY = coreY + Math.sin(conduit.angle) * length;
    
    // Main conduit line
    ctx.strokeStyle = conduit.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(coreX, coreY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Glow effect
    ctx.strokeStyle = conduit.color.replace(/0\.\d/, "0.2");
    ctx.lineWidth = 16;
    ctx.stroke();
    
    // Terminal nodes
    ctx.fillStyle = conduit.color;
    ctx.fillRect(endX - 6, endY - 6, 12, 12);
  });
}

// Helper: Draw dramatic core lighting
function drawCoreLighting() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Scattered light panels around the chamber
  const panelCount = 20;
  for (let i = 0; i < panelCount; i++) {
    const x = ((i * 137.5) % width);
    const y = ((i * 73.3) % height);
    const size = ((i * 5) % 8) + 4;
    const alpha = ((i * 17) % 40) + 30;
    
    // Different colored lights
    let color;
    if (i % 3 === 0) {
      color = `rgba(100, 150, 255, ${alpha / 100})`;
    } else if (i % 3 === 1) {
      color = `rgba(255, 100, 150, ${alpha / 100})`;
    } else {
      color = `rgba(150, 255, 100, ${alpha / 100})`;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    
    // Light rays
    if (i % 5 === 0) {
      ctx.fillStyle = color.replace(/0\.\d+\)/, "0.1)");
      ctx.fillRect(x - size, y, size * 3, 2);
    }
  }
}

// =====================================================
// ARC THREE: ESCAPE TO EARTH BACKGROUNDS FOR WAVES 12-14 (indices 11-13)
// =====================================================

// Wave 12 (index 11): Death Star Debris Field
function drawDebrisField() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Deep space with debris field
  const spaceGradient = ctx.createLinearGradient(0, 0, 0, height);
  spaceGradient.addColorStop(0, "#0a0a15");
  spaceGradient.addColorStop(0.5, "#050510");
  spaceGradient.addColorStop(1, "#000000");
  ctx.fillStyle = spaceGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Starfield backdrop
  drawStarfield(80, 0.8);
  
  // Floating Death Star debris (16-bit pixel art style)
  const debrisCount = 25;
  for (let i = 0; i < debrisCount; i++) {
    const x = ((i * 211.7 + state.frameCount * 0.5) % (width + 200)) - 100;
    const y = ((i * 97.3) % height);
    const size = ((i * 11) % 30) + 15;
    const rotation = ((i * 0.3 + state.frameCount * 0.01) % (Math.PI * 2));
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Metallic debris chunks (gray with damage)
    const alpha = ((i * 17) % 40) + 40;
    ctx.fillStyle = `rgba(120, 120, 140, ${alpha / 100})`;
    
    // Irregular polygon shape (16-bit pixel style)
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const angle = (j / 5) * Math.PI * 2;
      const wobble = ((i + j) * 0.4) % 0.5 + 0.6;
      const px = Math.cos(angle) * size * wobble;
      const py = Math.sin(angle) * size * wobble;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    // Damage marks (darker spots)
    ctx.fillStyle = `rgba(60, 60, 80, ${alpha / 150})`;
    ctx.fillRect(-size * 0.2, -size * 0.2, size * 0.3, size * 0.3);
    
    // Some pieces still glowing from explosions
    if (i % 4 === 0) {
      ctx.fillStyle = `rgba(255, 100, 50, ${alpha / 200})`;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Floating particles (smaller debris)
  ctx.fillStyle = "rgba(150, 150, 170, 0.4)";
  for (let i = 0; i < 100; i++) {
    const x = ((i * 137.5 + state.frameCount * 0.3) % (width + 50)) - 25;
    const y = ((i * 73.3) % height);
    const size = ((i * 3) % 3) + 1;
    ctx.fillRect(x, y, size, size);
  }
}

// Wave 13 (index 12): Descent to Desert Planet
function drawDescentToDesert() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Atmospheric gradient - transition from space to atmosphere
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, "#1a0f2e"); // Dark purple-black (space)
  skyGradient.addColorStop(0.3, "#3a2050"); // Purple atmosphere
  skyGradient.addColorStop(0.6, "#d4a574"); // Sandy atmosphere
  skyGradient.addColorStop(1, "#c9984a"); // Desert horizon
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Sparse stars fading (upper atmosphere)
  drawStarfield(40, 0.3);
  
  // Desert planet visible below (getting larger as we descend)
  const planetY = height * 0.6;
  const planetSize = width * 0.8;
  
  // Planet surface gradient
  const planetGradient = ctx.createRadialGradient(width / 2, planetY, 0, width / 2, planetY, planetSize);
  planetGradient.addColorStop(0, "#e8d4a0");
  planetGradient.addColorStop(0.5, "#d4a574");
  planetGradient.addColorStop(0.8, "#c9984a");
  planetGradient.addColorStop(1, "#a87d3a");
  
  ctx.fillStyle = planetGradient;
  ctx.beginPath();
  ctx.arc(width / 2, planetY, planetSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Dune patterns on planet (16-bit pixel style)
  ctx.fillStyle = "rgba(180, 140, 90, 0.3)";
  for (let i = 0; i < 50; i++) {
    const x = ((i * 157.3) % width);
    const y = planetY - planetSize + ((i * 89.7) % (planetSize * 2));
    const duneWidth = ((i * 43) % 60) + 20;
    const duneHeight = 4;
    ctx.fillRect(x, y, duneWidth, duneHeight);
  }
  
  // Atmospheric haze/clouds
  for (let i = 0; i < 8; i++) {
    const x = ((i * 211.7 + state.frameCount * 0.8) % (width + 100)) - 50;
    const y = height * 0.3 + ((i * 47) % (height * 0.3));
    const size = ((i * 29) % 80) + 40;
    
    const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    cloudGradient.addColorStop(0, "rgba(255, 240, 220, 0.2)");
    cloudGradient.addColorStop(1, "rgba(255, 240, 220, 0)");
    
    ctx.fillStyle = cloudGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Re-entry effect particles (heat/plasma trails)
  ctx.fillStyle = "rgba(255, 150, 50, 0.4)";
  for (let i = 0; i < 20; i++) {
    const x = ((i * 107.3 + state.frameCount * 2) % (width + 20)) - 10;
    const y = ((i * 61.7) % (height * 0.5));
    const size = ((i * 5) % 4) + 2;
    
    // Trailing particle effect
    ctx.fillRect(x, y, size, size);
    ctx.fillRect(x - 5, y + 2, size * 0.6, size * 0.6);
    ctx.fillRect(x - 9, y + 4, size * 0.4, size * 0.4);
  }
}

// Wave 14 (index 13): Desert Planet Surface (Dune-like)
function drawDesertPlanetSurface() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Desert sky gradient (warm, hazy atmosphere)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  skyGradient.addColorStop(0, "#d4a574"); // Dusty sky
  skyGradient.addColorStop(0.4, "#e8d4a0"); // Light sandy haze
  skyGradient.addColorStop(1, "#f5e6d3"); // Bright sandy horizon
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.6);
  
  // Distant sand dunes (background layer - 16-bit pixel art)
  ctx.fillStyle = "rgba(180, 140, 90, 0.4)";
  for (let i = 0; i < 8; i++) {
    const x = (i * width / 8);
    const duneHeight = 60 + Math.sin(i * 0.7) * 30;
    const duneY = height * 0.45;
    
    // Dune shape (simple triangular)
    ctx.beginPath();
    ctx.moveTo(x, duneY);
    ctx.lineTo(x + width / 16, duneY - duneHeight);
    ctx.lineTo(x + width / 8, duneY);
    ctx.closePath();
    ctx.fill();
  }
  
  // Mid-ground dunes (16-bit style)
  ctx.fillStyle = "rgba(200, 160, 110, 0.6)";
  for (let i = 0; i < 12; i++) {
    const x = (i * width / 12);
    const duneHeight = 40 + Math.sin(i * 1.2) * 20;
    const duneY = height * 0.55;
    
    ctx.beginPath();
    ctx.moveTo(x, duneY);
    ctx.lineTo(x + width / 24, duneY - duneHeight);
    ctx.lineTo(x + width / 12, duneY);
    ctx.closePath();
    ctx.fill();
  }
  
  // Desert floor (main ground)
  const groundY = height * 0.6;
  const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
  groundGradient.addColorStop(0, "#d4a574");
  groundGradient.addColorStop(0.5, "#c9984a");
  groundGradient.addColorStop(1, "#b8873a");
  
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundY, width, height - groundY);
  
  // Sand ripples and texture (16-bit pixel detail)
  ctx.fillStyle = "rgba(200, 160, 110, 0.3)";
  for (let i = 0; i < 15; i++) {
    const x = ((i * 173.5) % width);
    const y = groundY + ((i * 67) % (height - groundY));
    const rippleWidth = ((i * 31) % 80) + 40;
    ctx.fillRect(x, y, rippleWidth, 2);
  }
  
  // Sand particles/dust (pixel detail)
  ctx.fillStyle = "rgba(220, 180, 130, 0.2)";
  for (let i = 0; i < 80; i++) {
    const x = ((i * 137.5) % width);
    const y = groundY + ((i * 89) % (height - groundY));
    ctx.fillRect(x, y, 2, 2);
  }
  
  // Floating dust particles in air (animated)
  ctx.fillStyle = "rgba(240, 200, 150, 0.4)";
  for (let i = 0; i < 30; i++) {
    const x = ((i * 127.5 + state.frameCount * 0.5) % (width + 50)) - 25;
    const y = ((i * 73.3) % (height * 0.5)) + height * 0.2;
    const size = ((i * 3) % 3) + 1;
    ctx.fillRect(x, y, size, size);
  }
  
  // Heat shimmer effect (horizontal lines with alpha variation)
  for (let i = 0; i < 5; i++) {
    const y = groundY + (i * 20);
    const shimmer = Math.sin(state.frameCount * 0.1 + i) * 0.1 + 0.1;
    ctx.fillStyle = `rgba(255, 220, 180, ${shimmer})`;
    ctx.fillRect(0, y, width, 1);
  }
}

export function drawBackground(waveNum) {
  // Arc One: Space backgrounds for waves 1-6 (Approaching Death Star)
  if (waveNum >= 0 && waveNum <= 5) {
    drawSpaceBackground(waveNum);
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  // Arc Two: Death Star backgrounds for waves 7-11 (Battle for the Death Star)
  if (waveNum === 6) {
    // Wave 7: Death Star Orbit
    drawDeathStarOrbit();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  if (waveNum === 7) {
    // Wave 8: Death Star Approach - Animated closer approach
    drawDeathStarApproach();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  if (waveNum === 8) {
    // Wave 9: Entrance to the Core
    drawDeathStarEntrance();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  if (waveNum === 9) {
    // Wave 10: Journey to the Core
    drawCoreJourney();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  if (waveNum === 10) {
    // Wave 11: The Core - Diamond Boss Battle
    drawCoreChamber();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  // Arc Three: Escape to Earth backgrounds for waves 12-14+
  if (waveNum === 11) {
    // Wave 12: Death Star Debris Field
    drawDebrisField();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  if (waveNum === 12) {
    // Wave 13: Descent to Desert Planet
    drawDescentToDesert();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  if (waveNum === 13) {
    // Wave 14: Desert Planet Surface (Dune-like)
    drawDesertPlanetSurface();
    state.incrementBackgroundOffset(0.5);
    return;
  }
  
  // Waves 14+ (waveNum >= 13): Pixel art cloud backgrounds with light blue sky and ocean
  // Light blue/cyan sky background
  const skyGradient = state.ctx.createLinearGradient(0, 0, 0, state.canvas.height * 0.75);
  skyGradient.addColorStop(0, "#87CEEB"); // Light blue at top
  skyGradient.addColorStop(0.5, "#B0E0E6"); // Powder blue
  skyGradient.addColorStop(1, "#E0F6FF"); // Very light blue near horizon
  
  state.ctx.fillStyle = skyGradient;
  state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height * 0.75);
  
  // Draw fluffy pixel art clouds
  drawPixelArtClouds();
  
  // Draw ocean at the bottom
  drawCloudBackgroundOcean();

  state.incrementBackgroundOffset(0.5);
}

// Draw fluffy, volumetric pixel art clouds for waves 13+
function drawPixelArtClouds() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // Cloud definitions with layering for depth
  const clouds = [
    // Background layer (smaller, more transparent)
    { x: width * 0.15, y: height * 0.15, baseSize: 60, layer: 0 },
    { x: width * 0.65, y: height * 0.12, baseSize: 70, layer: 0 },
    // Mid layer
    { x: width * 0.35, y: height * 0.25, baseSize: 80, layer: 1 },
    { x: width * 0.75, y: height * 0.30, baseSize: 75, layer: 1 },
    { x: width * 0.50, y: height * 0.20, baseSize: 85, layer: 1 },
    // Foreground layer (larger, more opaque)
    { x: width * 0.10, y: height * 0.40, baseSize: 90, layer: 2 },
    { x: width * 0.85, y: height * 0.45, baseSize: 95, layer: 2 },
    { x: width * 0.45, y: height * 0.50, baseSize: 100, layer: 2 }
  ];
  
  clouds.forEach(cloud => {
    const layerScales = [0.7, 0.85, 1.0];
    const layerAlphas = [0.6, 0.75, 0.9];
    const scale = layerScales[cloud.layer];
    const alpha = layerAlphas[cloud.layer];
    const size = cloud.baseSize * scale;
    
    ctx.save();
    
    // Main cloud body (white/off-white) with pixel art style
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    
    // Draw cloud as collection of overlapping circles for fluffy look
    const puffCount = 5;
    for (let i = 0; i < puffCount; i++) {
      const angle = (i / puffCount) * Math.PI * 2;
      const puffX = cloud.x + Math.cos(angle) * size * 0.4;
      const puffY = cloud.y + Math.sin(angle) * size * 0.3;
      const puffSize = size * (0.5 + Math.sin(i * 1.7) * 0.2);
      
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center puff (largest)
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Add light gray shading for depth (bottom of cloud)
    ctx.fillStyle = `rgba(200, 210, 220, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y + size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight on top (bright white)
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(cloud.x - size * 0.2, cloud.y - size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
}

// Draw ocean/water at bottom for cloud backgrounds
function drawCloudBackgroundOcean() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  const oceanHeight = height * 0.25; // Bottom 25% of screen
  const oceanY = height - oceanHeight;
  
  // Ocean gradient
  const oceanGradient = ctx.createLinearGradient(0, oceanY, 0, height);
  oceanGradient.addColorStop(0, "#4682B4"); // Steel blue at top
  oceanGradient.addColorStop(0.3, "#4169E1"); // Royal blue
  oceanGradient.addColorStop(0.7, "#1E90FF"); // Dodger blue
  oceanGradient.addColorStop(1, "#0047AB"); // Cobalt blue at bottom
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, oceanY, width, oceanHeight);
  
  // Wave highlights (lighter blue)
  ctx.fillStyle = "rgba(135, 206, 250, 0.4)";
  for (let i = 0; i < 8; i++) {
    const waveY = oceanY + (i * oceanHeight / 8) + Math.sin(state.frameCount * 0.015 + i * 0.5) * 5;
    const waveHeight = 2;
    ctx.fillRect(0, waveY, width, waveHeight);
  }
  
  // Add foam/whitecaps
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  for (let i = 0; i < 15; i++) {
    const foamX = ((i * 127.3 + state.frameCount * 0.3) % (width + 100)) - 50;
    const foamY = oceanY + ((i * 53.7) % oceanHeight);
    const foamSize = 3 + (i % 3);
    ctx.fillRect(foamX, foamY, foamSize, 2);
  }
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
