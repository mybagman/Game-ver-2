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

// Helper function to draw angular panel (Gundam-style)
function drawAngularPanel(ctx, x, y, width, height, color = 'rgba(0, 255, 136, 0.15)') {
  ctx.save();
  ctx.fillStyle = 'rgba(5, 15, 10, 0.85)';
  ctx.strokeStyle = color;
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
function drawRadar(ctx, x, y, radius) {
  ctx.save();
  
  // Radar background
  ctx.fillStyle = 'rgba(5, 15, 10, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Radar border
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Range rings
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y, radius * (i / 3), 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Center (player)
  ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
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
      ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  // Rotating scan line
  const scanAngle = (state.frameCount * 0.05) % (Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
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
  
  // === CORNER BRACKETS (Cockpit frame) ===
  drawCornerBrackets(ctx, 20, 20, width - 40, height - 40, 40);
  
  // === TARGETING RETICLE (Center screen) ===
  drawTargetingReticle(ctx, width / 2, height / 2, 50);
  
  // === SCANLINE OVERLAY ===
  drawScanlines(ctx, width, height);
  
  // === LEFT SIDE: MOBILE SUIT STATUS PANEL ===
  const leftPanelX = 30;
  const leftPanelY = 80;
  const leftPanelW = 200;
  const leftPanelH = 180;
  
  drawAngularPanel(ctx, leftPanelX, leftPanelY, leftPanelW, leftPanelH);
  
  // Panel title
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
  ctx.font = '12px Orbitron, monospace';
  ctx.fillText('MOBILE SUIT', leftPanelX + 10, leftPanelY + 18);
  ctx.fillText('STATUS', leftPanelX + 10, leftPanelY + 32);
  
  // Health bar (vertical)
  const hbX = leftPanelX + 20;
  const hbY = leftPanelY + 50;
  const hbW = 40;
  const hbH = 100;
  
  // Health bar background
  ctx.fillStyle = 'rgba(0, 50, 30, 0.6)';
  ctx.fillRect(hbX, hbY, hbW, hbH);
  
  // Health bar border
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(hbX, hbY, hbW, hbH);
  
  // Health fill
  const healthRatio = Math.max(0, state.player.health / state.player.maxHealth);
  const healthHeight = hbH * healthRatio;
  
  // Gradient based on health level
  const healthGrad = ctx.createLinearGradient(hbX, hbY + hbH - healthHeight, hbX, hbY + hbH);
  if (healthRatio > 0.5) {
    healthGrad.addColorStop(0, 'rgba(0, 255, 136, 0.9)');
    healthGrad.addColorStop(1, 'rgba(0, 200, 100, 0.9)');
  } else if (healthRatio > 0.3) {
    healthGrad.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
    healthGrad.addColorStop(1, 'rgba(255, 150, 0, 0.9)');
  } else {
    healthGrad.addColorStop(0, 'rgba(255, 50, 50, 0.9)');
    healthGrad.addColorStop(1, 'rgba(200, 0, 0, 0.9)');
  }
  
  ctx.fillStyle = healthGrad;
  ctx.fillRect(hbX + 2, hbY + hbH - healthHeight + 2, hbW - 4, healthHeight - 4);
  
  // Warning light (red when health < 30%)
  if (healthRatio < 0.3) {
    const flashIntensity = Math.sin(state.frameCount * 0.2) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 50, 50, ${flashIntensity})`;
    ctx.beginPath();
    ctx.arc(hbX + hbW + 15, hbY + 10, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
    ctx.font = '10px Orbitron, monospace';
    ctx.fillText('WARN', hbX + hbW + 30, hbY + 15);
  }
  
  // Technical readout lines
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(hbX, hbY + (hbH / 5) * i);
    ctx.lineTo(hbX + hbW, hbY + (hbH / 5) * i);
    ctx.stroke();
  }

  // Shield bar (vertical, below health)
  if (state.player.shieldActive && state.player.maxShieldHealth > 0) {
    const shbX = leftPanelX + 80;
    const shbY = leftPanelY + 50;
    const shbW = 40;
    const shbH = 100;
    
    // Shield bar background
    ctx.fillStyle = 'rgba(0, 30, 50, 0.6)';
    ctx.fillRect(shbX, shbY, shbW, shbH);
    
    // Shield bar border
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(shbX, shbY, shbW, shbH);
    
    // Shield fill
    const shieldRatio = Math.max(0, state.player.shieldHealth / state.player.maxShieldHealth);
    const shieldHeight = shbH * shieldRatio;
    
    const shieldGrad = ctx.createLinearGradient(shbX, shbY + shbH - shieldHeight, shbX, shbY + shbH);
    shieldGrad.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
    shieldGrad.addColorStop(1, 'rgba(100, 150, 255, 0.9)');
    
    ctx.fillStyle = shieldGrad;
    ctx.fillRect(shbX + 2, shbY + shbH - shieldHeight + 2, shbW - 4, shieldHeight - 4);
    
    // Technical readout lines
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(shbX, shbY + (shbH / 5) * i);
      ctx.lineTo(shbX + shbW, shbY + (shbH / 5) * i);
      ctx.stroke();
    }
    
    // Shield label
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.font = '10px Orbitron, monospace';
    ctx.fillText('SHIELD', shbX + 3, shbY - 8);
  }
  
  // Lives indicator
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
  ctx.font = '10px Orbitron, monospace';
  ctx.fillText('LIVES', leftPanelX + 140, leftPanelY + 55);
  
  for (let i = 0; i < 5; i++) {
    const lifeY = leftPanelY + 70 + i * 18;
    ctx.strokeStyle = i < state.player.lives ? 'rgba(0, 255, 136, 0.8)' : 'rgba(100, 100, 100, 0.3)';
    ctx.fillStyle = i < state.player.lives ? 'rgba(0, 255, 136, 0.3)' : 'rgba(50, 50, 50, 0.2)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(leftPanelX + 145, lifeY);
    ctx.lineTo(leftPanelX + 150, lifeY - 5);
    ctx.lineTo(leftPanelX + 160, lifeY - 5);
    ctx.lineTo(leftPanelX + 165, lifeY);
    ctx.lineTo(leftPanelX + 160, lifeY + 5);
    ctx.lineTo(leftPanelX + 150, lifeY + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // === BOTTOM-LEFT: RADAR ===
  const radarX = 80;
  const radarY = height - 100;
  const radarRadius = 60;
  
  drawRadar(ctx, radarX, radarY, radarRadius);
  
  // Radar label
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
  ctx.font = '10px Orbitron, monospace';
  ctx.fillText('RADAR', radarX - 20, radarY + radarRadius + 15);
  
  // === TOP-RIGHT: WEAPONS SYSTEM PANEL ===
  const weaponPanelX = width - 230;
  const weaponPanelY = 30;
  const weaponPanelW = 200;
  const weaponPanelH = 150;
  
  drawAngularPanel(ctx, weaponPanelX, weaponPanelY, weaponPanelW, weaponPanelH);
  
  // Panel title
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
  ctx.font = '12px Orbitron, monospace';
  ctx.fillText('WEAPONS', weaponPanelX + 10, weaponPanelY + 18);
  ctx.fillText('SYSTEM', weaponPanelX + 10, weaponPanelY + 32);
  
  // Gold Star status
  ctx.fillStyle = state.goldStar.alive ? 'rgba(255, 200, 50, 0.9)' : 'rgba(255, 50, 50, 0.9)';
  ctx.font = '10px Orbitron, monospace';
  ctx.fillText(state.goldStar.alive ? 'GOLD STAR: ACTIVE' : 'GOLD STAR: DOWN', weaponPanelX + 10, weaponPanelY + 50);
  
  // Weapon readouts
  let weaponY = weaponPanelY + 70;
  const weaponSpacing = 25;
  
  // Red Punch
  if (state.goldStar.redPunchLevel > 0) {
    ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
    ctx.fillText(`RED PUNCH`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
    ctx.fillText(`LV ${state.goldStar.redPunchLevel}`, weaponPanelX + 140, weaponY);
    weaponY += weaponSpacing;
  }
  
  // Blue Cannon
  if (state.goldStar.blueCannonLevel > 0) {
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.fillText(`BLUE CANNON`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
    ctx.fillText(`LV ${state.goldStar.blueCannonLevel}`, weaponPanelX + 140, weaponY);
    weaponY += weaponSpacing;
  }
  
  // Homing Missiles
  if (state.goldStar.homingMissileLevel > 0) {
    ctx.fillStyle = 'rgba(255, 150, 50, 0.9)';
    ctx.fillText(`HOMING MSL`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
    ctx.fillText(`LV ${state.goldStar.homingMissileLevel}`, weaponPanelX + 140, weaponY);
    weaponY += weaponSpacing;
  }
  
  // Reflector system
  if (state.player.reflectorLevel > 0) {
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.fillText(`REFLECTOR`, weaponPanelX + 10, weaponY);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
    ctx.fillText(`LV ${state.player.reflectorLevel}`, weaponPanelX + 140, weaponY);
  }
  
  // === TOP-CENTER: SCORE/WAVE DISPLAY ===
  const scorePanelX = width / 2 - 150;
  const scorePanelY = 20;
  const scorePanelW = 300;
  const scorePanelH = 50;
  
  drawAngularPanel(ctx, scorePanelX, scorePanelY, scorePanelW, scorePanelH, 'rgba(0, 255, 136, 0.2)');
  
  // Score
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
  ctx.font = '14px Orbitron, monospace';
  ctx.fillText(`SCORE: ${state.score}`, scorePanelX + 20, scorePanelY + 20);
  
  // Wave
  ctx.fillText(`WAVE: ${state.wave + 1}`, scorePanelX + 180, scorePanelY + 20);
  
  // Aura level indicator
  if (state.goldStarAura.level > 0) {
    ctx.fillStyle = 'rgba(255, 200, 50, 0.9)';
    ctx.font = '10px Orbitron, monospace';
    ctx.fillText(`AURA LV ${state.goldStarAura.level}`, scorePanelX + 110, scorePanelY + 38);
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

