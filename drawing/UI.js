import * as state from '../state.js';

function roundRect(ctx, x, y, w, h, r) {
  const radius = r || 6;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// Helper function to draw corner brackets (Gundam-style HUD element)
function drawCornerBrackets(ctx, x, y, width, height, size) {
  const color = 'rgba(0, 255, 136, 0.8)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();
  
  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + width - size, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + size);
  ctx.stroke();
  
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x, y + height - size);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + size, y + height);
  ctx.stroke();
  
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + width - size, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height - size);
  ctx.stroke();
}

// Helper function to check if a game object overlaps with a UI region
function checkOverlap(objX, objY, objSize, regionX, regionY, regionW, regionH) {
  const objRadius = objSize / 2;
  // Check if object's bounding box overlaps with region
  return (
    objX + objRadius > regionX &&
    objX - objRadius < regionX + regionW &&
    objY + objRadius > regionY &&
    objY - objRadius < regionY + regionH
  );
}

// Helper function to calculate transparency for a UI region
function calculateRegionTransparency(regionX, regionY, regionW, regionH) {
  let hasOverlap = false;
  
  // Check player overlap
  if (checkOverlap(state.player.x, state.player.y, state.player.size, regionX, regionY, regionW, regionH)) {
    hasOverlap = true;
  }
  
  // Check gold star overlap
  if (!hasOverlap && state.goldStar.alive && checkOverlap(state.goldStar.x, state.goldStar.y, state.goldStar.size, regionX, regionY, regionW, regionH)) {
    hasOverlap = true;
  }
  
  // Check enemy overlaps
  if (!hasOverlap) {
    for (const e of state.enemies) {
      if (e && checkOverlap(e.x, e.y, e.size || 30, regionX, regionY, regionW, regionH)) {
        hasOverlap = true;
        break;
      }
    }
  }
  
  // Check tank overlaps
  if (!hasOverlap) {
    for (const tank of state.tanks) {
      if (tank && checkOverlap(tank.x, tank.y, 30, regionX, regionY, regionW, regionH)) {
        hasOverlap = true;
        break;
      }
    }
  }
  
  // Check walker overlaps
  if (!hasOverlap) {
    for (const walker of state.walkers) {
      if (walker && checkOverlap(walker.x, walker.y, 30, regionX, regionY, regionW, regionH)) {
        hasOverlap = true;
        break;
      }
    }
  }
  
  // Check mech overlaps
  if (!hasOverlap) {
    for (const mech of state.mechs) {
      if (mech && checkOverlap(mech.x, mech.y, mech.size || 40, regionX, regionY, regionW, regionH)) {
        hasOverlap = true;
        break;
      }
    }
  }
  
  // Check dropship overlaps
  if (!hasOverlap) {
    for (const dropship of state.dropships) {
      if (dropship && checkOverlap(dropship.x, dropship.y, dropship.size || 40, regionX, regionY, regionW, regionH)) {
        hasOverlap = true;
        break;
      }
    }
  }
  
  // Check diamond boss overlaps
  if (!hasOverlap) {
    for (const diamond of state.diamonds) {
      if (diamond && checkOverlap(diamond.x, diamond.y, diamond.size || 50, regionX, regionY, regionW, regionH)) {
        hasOverlap = true;
        break;
      }
    }
  }
  
  // Return transparency value (0.3 when overlap, 1.0 when no overlap)
  return hasOverlap ? 0.3 : 1.0;
}

// Helper function to draw angular panel (Gundam-style) with dynamic transparency
function drawAngularPanel(ctx, x, y, width, height, color = 'rgba(0, 255, 136, 0.15)') {
  ctx.save();
  
  // Calculate transparency based on overlaps
  const transparency = calculateRegionTransparency(x, y, width, height);
  
  // Adjust colors for transparency
  const baseAlpha = 0.85 * transparency;
  ctx.fillStyle = `rgba(5, 15, 10, ${baseAlpha})`;
  ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${0.15 * transparency})`);
  ctx.lineWidth = 1;
  
  // Angular panel shape
  const bevel = 8;
  ctx.beginPath();
  ctx.moveTo(x + bevel, y);
  ctx.lineTo(x + width - bevel, y);
  ctx.lineTo(x + width, y + bevel);
  ctx.lineTo(x + width, y + height - bevel);
  ctx.lineTo(x + width - bevel, y + height);
  ctx.lineTo(x + bevel, y + height);
  ctx.lineTo(x, y + height - bevel);
  ctx.lineTo(x, y + bevel);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

// Helper function to draw targeting reticle
function drawTargetingReticle(ctx, x, y, radius) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
  ctx.lineWidth = 1;
  
  // Center crosshair
  const crossSize = radius * 0.7;
  ctx.beginPath();
  ctx.moveTo(x - crossSize, y);
  ctx.lineTo(x - radius * 0.3, y);
  ctx.moveTo(x + radius * 0.3, y);
  ctx.lineTo(x + crossSize, y);
  ctx.moveTo(x, y - crossSize);
  ctx.lineTo(x, y - radius * 0.3);
  ctx.moveTo(x, y + radius * 0.3);
  ctx.lineTo(x, y + crossSize);
  ctx.stroke();
  
  // Rotating outer ring
  const rotation = (state.frameCount * 0.02) % (Math.PI * 2);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + rotation;
    const startAngle = angle - 0.2;
    const endAngle = angle + 0.2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Helper function to draw radar mini-map
function drawRadar(ctx, x, y, radius, transparency = 1.0) {
  ctx.save();
  
  // Radar background
  ctx.fillStyle = `rgba(5, 15, 10, ${0.9 * transparency})`;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Radar border
  ctx.strokeStyle = `rgba(0, 255, 136, ${0.8 * transparency})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Range rings
  ctx.strokeStyle = `rgba(0, 255, 136, ${0.2 * transparency})`;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y, radius * (i / 3), 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Center (player)
  ctx.fillStyle = `rgba(0, 255, 255, ${0.9 * transparency})`;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Enemy blips (red dots)
  const radarScale = radius / 400; // Map 400px game distance to radar radius
  state.enemies.forEach(e => {
    if (!e) return;
    const dx = (e.x - state.player.x) * radarScale;
    const dy = (e.y - state.player.y) * radarScale;
    const dist = Math.hypot(dx, dy);
    
    if (dist < radius) {
      ctx.fillStyle = `rgba(255, 50, 50, ${0.8 * transparency})`;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  // Rotating scan line
  const scanAngle = (state.frameCount * 0.05) % (Math.PI * 2);
  ctx.strokeStyle = `rgba(0, 255, 136, ${0.6 * transparency})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(scanAngle) * radius, y + Math.sin(scanAngle) * radius);
  ctx.stroke();
  
  ctx.restore();
}

// Helper function to draw scanline overlay
function drawScanlines(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.03)';
  ctx.lineWidth = 1;
  
  const lineSpacing = 4;
  for (let y = 0; y < height; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Modified drawUI: Gundam cockpit style
export function drawUI() {
  const ctx = state.ctx;
  const width = state.canvas.width;
  const height = state.canvas.height;
  
  // === CORNER BRACKETS (Cockpit frame) - Made smaller ===
  drawCornerBrackets(ctx, 20, 20, width - 40, height - 40, 30);
  
  // === CENTER TARGETING RETICLE REMOVED ===
  
  // === SCANLINE OVERLAY ===
  drawScanlines(ctx, width, height);
  
  // === LEFT SIDE: STATUS PANEL (MOBILE SUIT text removed) ===
  const leftPanelX = 30;
  const leftPanelY = 80;
  const leftPanelW = 160;  // Reduced from 200
  const leftPanelH = 150;  // Reduced from 180
  
  // Calculate transparency for left panel
  const leftPanelTransparency = calculateRegionTransparency(leftPanelX, leftPanelY, leftPanelW, leftPanelH);
  
  drawAngularPanel(ctx, leftPanelX, leftPanelY, leftPanelW, leftPanelH);
  
  // Panel title (removed "MOBILE SUIT" text)
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * leftPanelTransparency})`;
  ctx.font = '11px Orbitron, monospace';  // Slightly smaller font
  ctx.fillText('STATUS', leftPanelX + 10, leftPanelY + 20);
  
  // Health bar (vertical) - Made smaller
  const hbX = leftPanelX + 15;
  const hbY = leftPanelY + 35;
  const hbW = 32;  // Reduced from 40
  const hbH = 85;  // Reduced from 100
  
  // Health bar background
  ctx.fillStyle = `rgba(0, 50, 30, ${0.6 * leftPanelTransparency})`;
  ctx.fillRect(hbX, hbY, hbW, hbH);
  
  // Health bar border
  ctx.strokeStyle = `rgba(0, 255, 136, ${0.6 * leftPanelTransparency})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(hbX, hbY, hbW, hbH);
  
  // Health fill
  const healthRatio = Math.max(0, state.player.health / state.player.maxHealth);
  const healthHeight = hbH * healthRatio;
  
  // Gradient based on health level (with transparency)
  const healthGrad = ctx.createLinearGradient(hbX, hbY + hbH - healthHeight, hbX, hbY + hbH);
  if (healthRatio > 0.5) {
    healthGrad.addColorStop(0, `rgba(0, 255, 136, ${0.9 * leftPanelTransparency})`);
    healthGrad.addColorStop(1, `rgba(0, 200, 100, ${0.9 * leftPanelTransparency})`);
  } else if (healthRatio > 0.3) {
    healthGrad.addColorStop(0, `rgba(255, 200, 0, ${0.9 * leftPanelTransparency})`);
    healthGrad.addColorStop(1, `rgba(255, 150, 0, ${0.9 * leftPanelTransparency})`);
  } else {
    healthGrad.addColorStop(0, `rgba(255, 50, 50, ${0.9 * leftPanelTransparency})`);
    healthGrad.addColorStop(1, `rgba(200, 0, 0, ${0.9 * leftPanelTransparency})`);
  }
  
  ctx.fillStyle = healthGrad;
  ctx.fillRect(hbX + 2, hbY + hbH - healthHeight + 2, hbW - 4, healthHeight - 4);
  
  // Warning light (red when health < 30%)
  if (healthRatio < 0.3) {
    const flashIntensity = Math.sin(state.frameCount * 0.2) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 50, 50, ${flashIntensity * leftPanelTransparency})`;
    ctx.beginPath();
    ctx.arc(hbX + hbW + 15, hbY + 10, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = `rgba(255, 50, 50, ${0.9 * leftPanelTransparency})`;
    ctx.font = '10px Orbitron, monospace';
    ctx.fillText('WARN', hbX + hbW + 30, hbY + 15);
  }
  
  // Technical readout lines
  ctx.strokeStyle = `rgba(0, 255, 136, ${0.3 * leftPanelTransparency})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(hbX, hbY + (hbH / 5) * i);
    ctx.lineTo(hbX + hbW, hbY + (hbH / 5) * i);
    ctx.stroke();
  }

  // Shield bar (vertical, below health) - Made smaller
  if (state.player.shieldActive && state.player.maxShieldHealth > 0) {
    const shbX = leftPanelX + 60;
    const shbY = leftPanelY + 35;
    const shbW = 32;  // Reduced from 40
    const shbH = 85;  // Reduced from 100
    
    // Shield bar background
    ctx.fillStyle = `rgba(0, 30, 50, ${0.6 * leftPanelTransparency})`;
    ctx.fillRect(shbX, shbY, shbW, shbH);
    
    // Shield bar border
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 * leftPanelTransparency})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(shbX, shbY, shbW, shbH);
    
    // Shield fill
    const shieldRatio = Math.max(0, state.player.shieldHealth / state.player.maxShieldHealth);
    const shieldHeight = shbH * shieldRatio;
    
    const shieldGrad = ctx.createLinearGradient(shbX, shbY + shbH - shieldHeight, shbX, shbY + shbH);
    shieldGrad.addColorStop(0, `rgba(100, 200, 255, ${0.9 * leftPanelTransparency})`);
    shieldGrad.addColorStop(1, `rgba(100, 150, 255, ${0.9 * leftPanelTransparency})`);
    
    ctx.fillStyle = shieldGrad;
    ctx.fillRect(shbX + 2, shbY + shbH - shieldHeight + 2, shbW - 4, shieldHeight - 4);
    
    // Technical readout lines
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 * leftPanelTransparency})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(shbX, shbY + (shbH / 5) * i);
      ctx.lineTo(shbX + shbW, shbY + (shbH / 5) * i);
      ctx.stroke();
    }
    
    // Shield label
    ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * leftPanelTransparency})`;
    ctx.font = '10px Orbitron, monospace';
    ctx.fillText('SHIELD', shbX + 3, shbY - 8);
  }
  
  // Boost meter (horizontal, below health) - 3-level system
  const boostX = leftPanelX + 15;
  const boostY = leftPanelY + 130;
  const boostW = leftPanelW - 30;
  const boostH = 12;
  
  // Boost bar background
  ctx.fillStyle = `rgba(0, 30, 50, ${0.6 * leftPanelTransparency})`;
  ctx.fillRect(boostX, boostY, boostW, boostH);
  
  // Boost bar border
  ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 * leftPanelTransparency})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(boostX, boostY, boostW, boostH);
  
  // 3-level divisions (33%, 66%, 100%)
  ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 * leftPanelTransparency})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boostX + boostW / 3, boostY);
  ctx.lineTo(boostX + boostW / 3, boostY + boostH);
  ctx.moveTo(boostX + boostW * 2 / 3, boostY);
  ctx.lineTo(boostX + boostW * 2 / 3, boostY + boostH);
  ctx.stroke();
  
  // Boost fill with level-based color
  const boostRatio = Math.max(0, state.player.boostMeter / state.player.maxBoostMeter);
  const boostWidth = boostW * boostRatio;
  
  // Determine current boost level (1-3) based on meter
  let boostLevel = 1;
  if (boostRatio >= 0.66) boostLevel = 3;
  else if (boostRatio >= 0.33) boostLevel = 2;
  
  // Gradient based on boost level (with transparency)
  const boostGrad = ctx.createLinearGradient(boostX, boostY, boostX + boostW, boostY);
  if (state.player.boosting) {
    // Pulsing effect when boosting
    const pulseIntensity = Math.sin(state.frameCount * 0.3) * 0.2 + 0.8;
    boostGrad.addColorStop(0, `rgba(255, 200, 50, ${pulseIntensity * leftPanelTransparency})`);
    boostGrad.addColorStop(1, `rgba(255, 150, 0, ${pulseIntensity * leftPanelTransparency})`);
  } else {
    // Color changes based on level
    if (boostLevel === 3) {
      boostGrad.addColorStop(0, `rgba(50, 255, 150, ${0.9 * leftPanelTransparency})`);
      boostGrad.addColorStop(1, `rgba(50, 200, 255, ${0.9 * leftPanelTransparency})`);
    } else if (boostLevel === 2) {
      boostGrad.addColorStop(0, `rgba(100, 200, 255, ${0.9 * leftPanelTransparency})`);
      boostGrad.addColorStop(1, `rgba(50, 150, 255, ${0.9 * leftPanelTransparency})`);
    } else {
      boostGrad.addColorStop(0, `rgba(150, 150, 200, ${0.9 * leftPanelTransparency})`);
      boostGrad.addColorStop(1, `rgba(100, 100, 180, ${0.9 * leftPanelTransparency})`);
    }
  }
  
  ctx.fillStyle = boostGrad;
  ctx.fillRect(boostX + 2, boostY + 2, boostWidth - 4, boostH - 4);
  
  // Boost label with level indicator
  ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * leftPanelTransparency})`;
  ctx.font = '9px Orbitron, monospace';
  ctx.fillText(`BOOST LV${boostLevel}`, boostX, boostY - 4);
  
  // Lives indicator - Made smaller
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * leftPanelTransparency})`;
  ctx.font = '9px Orbitron, monospace';
  ctx.fillText('LIVES', leftPanelX + 105, leftPanelY + 40);
  
  for (let i = 0; i < 5; i++) {
    const lifeY = leftPanelY + 55 + i * 15;  // Reduced spacing
    ctx.strokeStyle = i < state.player.lives ? `rgba(0, 255, 136, ${0.8 * leftPanelTransparency})` : `rgba(100, 100, 100, ${0.3 * leftPanelTransparency})`;
    ctx.fillStyle = i < state.player.lives ? `rgba(0, 255, 136, ${0.3 * leftPanelTransparency})` : `rgba(50, 50, 50, ${0.2 * leftPanelTransparency})`;
    ctx.lineWidth = 1.5;  // Slightly thinner
    
    ctx.beginPath();
    ctx.moveTo(leftPanelX + 110, lifeY);
    ctx.lineTo(leftPanelX + 115, lifeY - 4);  // Smaller ship icons
    ctx.lineTo(leftPanelX + 123, lifeY - 4);
    ctx.lineTo(leftPanelX + 128, lifeY);
    ctx.lineTo(leftPanelX + 123, lifeY + 4);
    ctx.lineTo(leftPanelX + 115, lifeY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // === BOTTOM-LEFT: RADAR - Made smaller ===
  const radarX = 70;
  const radarY = height - 85;
  const radarRadius = 50;  // Reduced from 60
  const radarRegionSize = radarRadius * 2 + 30;
  const radarTransparency = calculateRegionTransparency(radarX - radarRadius - 10, radarY - radarRadius - 10, radarRegionSize, radarRegionSize);
  
  drawRadar(ctx, radarX, radarY, radarRadius, radarTransparency);
  
  // Radar label
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * radarTransparency})`;
  ctx.font = '9px Orbitron, monospace';
  ctx.fillText('RADAR', radarX - 18, radarY + radarRadius + 13);
  
  // === TOP-RIGHT: WEAPONS SYSTEM PANEL - Made smaller ===
  const weaponPanelX = width - 190;
  const weaponPanelY = 30;
  const weaponPanelW = 160;  // Reduced from 200
  const weaponPanelH = 130;  // Reduced from 150
  const weaponPanelTransparency = calculateRegionTransparency(weaponPanelX, weaponPanelY, weaponPanelW, weaponPanelH);
  
  drawAngularPanel(ctx, weaponPanelX, weaponPanelY, weaponPanelW, weaponPanelH);
  
  // Panel title
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * weaponPanelTransparency})`;
  ctx.font = '11px Orbitron, monospace';  // Slightly smaller
  ctx.fillText('WEAPONS', weaponPanelX + 10, weaponPanelY + 18);
  
  // Gold Star status
  ctx.fillStyle = state.goldStar.alive ? `rgba(255, 200, 50, ${0.9 * weaponPanelTransparency})` : `rgba(255, 50, 50, ${0.9 * weaponPanelTransparency})`;
  ctx.font = '9px Orbitron, monospace';
  ctx.fillText(state.goldStar.alive ? 'GOLD STAR: ACTIVE' : 'GOLD STAR: DOWN', weaponPanelX + 10, weaponPanelY + 40);
  
  // Weapon readouts
  let weaponY = weaponPanelY + 58;
  const weaponSpacing = 20;  // Reduced from 25
  
  // Red Punch
  if (state.goldStar.redPunchLevel > 0) {
    ctx.fillStyle = `rgba(255, 100, 100, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`RED PUNCH`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`LV ${state.goldStar.redPunchLevel}`, weaponPanelX + 140, weaponY);
    weaponY += weaponSpacing;
  }
  
  // Blue Cannon
  if (state.goldStar.blueCannonLevel > 0) {
    ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`BLUE CANNON`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`LV ${state.goldStar.blueCannonLevel}`, weaponPanelX + 140, weaponY);
    weaponY += weaponSpacing;
  }
  
  // Homing Missiles
  if (state.goldStar.homingMissileLevel > 0) {
    ctx.fillStyle = `rgba(255, 150, 50, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`HOMING MSL`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`LV ${state.goldStar.homingMissileLevel}`, weaponPanelX + 140, weaponY);
    weaponY += weaponSpacing;
  }
  
  // EMP system (formerly Reflector)
  if (state.player.reflectorLevel > 0) {
    ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`EMP`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * weaponPanelTransparency})`;
    ctx.fillText(`LV ${state.player.reflectorLevel}`, weaponPanelX + 140, weaponY);
  }
  
  // === BOTTOM-RIGHT: PLAYER ABILITIES PANEL ===
  const abilitiesPanelX = width - 190;
  const abilitiesPanelY = height - 130;
  const abilitiesPanelW = 160;
  const abilitiesPanelH = 100;
  const abilitiesPanelTransparency = calculateRegionTransparency(abilitiesPanelX, abilitiesPanelY, abilitiesPanelW, abilitiesPanelH);
  
  drawAngularPanel(ctx, abilitiesPanelX, abilitiesPanelY, abilitiesPanelW, abilitiesPanelH);
  
  // Panel title
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * abilitiesPanelTransparency})`;
  ctx.font = '11px Orbitron, monospace';
  ctx.fillText('ABILITIES', abilitiesPanelX + 10, abilitiesPanelY + 18);
  
  // Ability readouts
  let abilityY = abilitiesPanelY + 38;
  const abilitySpacing = 18;
  
  // Dash
  ctx.fillStyle = `rgba(100, 255, 200, ${0.9 * abilitiesPanelTransparency})`;
  ctx.font = '9px Orbitron, monospace';
  ctx.fillText('DASH', abilitiesPanelX + 10, abilityY);
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * abilitiesPanelTransparency})`;
  ctx.fillText(`LV ${state.player.dashLevel}`, abilitiesPanelX + 130, abilityY);
  abilityY += abilitySpacing;
  
  // Ram Attack
  ctx.fillStyle = `rgba(255, 150, 100, ${0.9 * abilitiesPanelTransparency})`;
  ctx.fillText('RAM', abilitiesPanelX + 10, abilityY);
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * abilitiesPanelTransparency})`;
  ctx.fillText(`LV ${state.player.ramLevel}`, abilitiesPanelX + 130, abilityY);
  abilityY += abilitySpacing;
  
  // Mega Cannon
  ctx.fillStyle = `rgba(255, 200, 50, ${0.9 * abilitiesPanelTransparency})`;
  ctx.fillText('M.CANNON', abilitiesPanelX + 10, abilityY);
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * abilitiesPanelTransparency})`;
  ctx.fillText(`LV ${state.player.megaCannonLevel}`, abilitiesPanelX + 130, abilityY);
  
  // Charging indicator for mega cannon
  if (state.player.megaCannonCharging) {
    const chargeRatio = state.player.megaCannonChargeTime / state.player.megaCannonMaxCharge;
    const chargeBarW = 100;
    const chargeBarH = 4;
    const chargeBarX = abilitiesPanelX + 30;
    const chargeBarY = abilityY + 5;
    
    // Charge bar background
    ctx.fillStyle = `rgba(100, 100, 50, ${0.5 * abilitiesPanelTransparency})`;
    ctx.fillRect(chargeBarX, chargeBarY, chargeBarW, chargeBarH);
    
    // Charge fill
    const chargePulse = Math.sin(state.frameCount * 0.5) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 200, 50, ${chargePulse * abilitiesPanelTransparency})`;
    ctx.fillRect(chargeBarX, chargeBarY, chargeBarW * chargeRatio, chargeBarH);
  }
  
  // === TOP-CENTER: SCORE/WAVE DISPLAY - Made smaller ===
  const scorePanelX = width / 2 - 125;
  const scorePanelY = 20;
  const scorePanelW = 250;  // Reduced from 300
  const scorePanelH = 42;  // Reduced from 50
  const scorePanelTransparency = calculateRegionTransparency(scorePanelX, scorePanelY, scorePanelW, scorePanelH);
  
  drawAngularPanel(ctx, scorePanelX, scorePanelY, scorePanelW, scorePanelH, 'rgba(0, 255, 136, 0.2)');
  
  // Score
  ctx.fillStyle = `rgba(0, 255, 136, ${0.9 * scorePanelTransparency})`;
  ctx.font = '12px Orbitron, monospace';  // Slightly smaller
  ctx.fillText(`SCORE: ${state.score}`, scorePanelX + 18, scorePanelY + 18);
  
  // Wave
  ctx.fillText(`WAVE: ${state.wave + 1}`, scorePanelX + 150, scorePanelY + 18);
  
  // Aura level indicator
  if (state.goldStarAura.level > 0) {
    ctx.fillStyle = `rgba(255, 200, 50, ${0.9 * scorePanelTransparency})`;
    ctx.font = '9px Orbitron, monospace';
    ctx.fillText(`AURA LV ${state.goldStarAura.level}`, scorePanelX + 95, scorePanelY + 34);
  }

  // === WAVE TRANSITION BANNER ===
  if (state.waveTransition) {
    const bannerW = 400;
    const bannerH = 80;
    const bx = (width - bannerW) / 2;
    const by = height / 2 - 40;
    
    // Angular banner panel
    drawAngularPanel(ctx, bx, by, bannerW, bannerH, 'rgba(0, 255, 136, 0.8)');
    
    // Flashing border effect
    const flashIntensity = Math.sin(state.frameCount * 0.15) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(0, 255, 136, ${flashIntensity})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bannerW, bannerH);
    
    // Title
    ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
    ctx.font = '20px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE CLEARED', bx + bannerW / 2, by + 30);
    
    // Timer
    const timeRemaining = Math.ceil((state.WAVE_BREAK_MS - state.waveTransitionTimer * (1000/60)) / 1000);
    ctx.fillStyle = 'rgba(255, 200, 50, 0.9)';
    ctx.font = '16px Orbitron, monospace';
    ctx.fillText(`NEXT WAVE IN: ${timeRemaining}s`, bx + bannerW / 2, by + 55);
    
    ctx.textAlign = 'left';
  }
  
  // === FLICKER EFFECT ON LOW HEALTH ===
  if (healthRatio < 0.2) {
    const flickerIntensity = Math.sin(state.frameCount * 0.3) * 0.1 + 0.1;
    ctx.fillStyle = `rgba(255, 50, 50, ${flickerIntensity})`;
    ctx.fillRect(0, 0, width, height);
  }
}

