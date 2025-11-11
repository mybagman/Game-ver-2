import * as state from '../state.js';

export function drawGoldStar() {
  if (!state.goldStar.alive) return;
  
  const gs = state.goldStar;
  const ctx = state.ctx;
  
  // Draw collecting indicator
  if (gs.collecting) {
    const progress = 1 - (gs.collectTimer / state.GOLD_STAR_PICKUP_FRAMES);
    const currentRadius = gs.size/2 + 10 + (progress * 8);
    ctx.strokeStyle = `rgba(255, 255, 0, ${progress})`;
    ctx.lineWidth = 3 * progress;
    ctx.beginPath(); 
    ctx.arc(gs.x, gs.y, currentRadius, 0, Math.PI*2); 
    ctx.stroke();
  }
  
  ctx.save(); 
  ctx.translate(gs.x, gs.y);
  
  // === RED PUNCH CHARGING ANIMATION ===
  if (gs.redPunchCharging && gs.redPunchLevel > 0) {
    const chargeProgress = gs.redPunchChargeTimer / 30;
    // Energy rings forming around the drone
    for (let i = 0; i < 3; i++) {
      const ringRadius = gs.size/2 + 10 + i * 8;
      const opacity = 0.5 * chargeProgress * (1 - i * 0.3);
      ctx.strokeStyle = `rgba(255, 100, 100, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius * chargeProgress, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  // === BLUE CANNON TURRET ANIMATION ===
  if (gs.blueCannonTurretDeployed && gs.blueCannonLevel > 0) {
    const deployProgress = Math.min(1, gs.blueCannonTurretDeployTimer / 5);
    // Draw mechanical turret extending from drone
    ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * deployProgress})`;
    ctx.fillRect(-4, -gs.size/2 - 6 * deployProgress, 8, 6 * deployProgress);
    
    // Turret tip
    ctx.fillStyle = `rgba(200, 230, 255, ${0.9 * deployProgress})`;
    ctx.fillRect(-2, -gs.size/2 - 8 * deployProgress, 4, 2 * deployProgress);
    
    // Brighter thrusters
    const thrusterGlow = 0.7 * deployProgress;
    ctx.shadowBlur = 15 * deployProgress;
    ctx.shadowColor = `rgba(100, 200, 255, ${thrusterGlow})`;
    ctx.fillStyle = `rgba(150, 220, 255, ${thrusterGlow})`;
    ctx.beginPath();
    ctx.arc(-8, 8, 3, 0, Math.PI * 2);
    ctx.arc(8, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  // === HOMING MISSILE DRONE POD ===
  if (gs.homingMissileLevel > 0) {
    const podOffsetX = 12;
    const podOffsetY = 0;
    
    ctx.fillStyle = "rgba(180, 180, 200, 0.9)";
    ctx.fillRect(podOffsetX - 3, podOffsetY - 4, 6, 8);
    
    // Pod details (8-bit style)
    ctx.fillStyle = "rgba(100, 150, 200, 0.9)";
    ctx.fillRect(podOffsetX - 2, podOffsetY - 3, 4, 2);
    ctx.fillRect(podOffsetX - 2, podOffsetY + 1, 4, 2);
  }
  
  // === BASE GOLD STAR (8-bit metallic style) ===
  // Outer metallic gold star shape
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gs.size/2);
  gradient.addColorStop(0, "rgba(255, 230, 100, 1)");
  gradient.addColorStop(0.7, "rgba(218, 165, 32, 1)");
  gradient.addColorStop(1, "rgba(184, 134, 11, 1)");
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? gs.size / 2 : gs.size / 4;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  
  // Central glow (enhanced when red punch active)
  const glowIntensity = gs.redPunchCharging ? 0.8 + 0.2 * Math.sin(state.frameCount * 0.3) : 0.4;
  const glowSize = gs.redPunchCharging ? 8 : 6;
  const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
  glowGradient.addColorStop(0, `rgba(255, 255, 200, ${glowIntensity})`);
  glowGradient.addColorStop(0.5, `rgba(255, 220, 100, ${glowIntensity * 0.5})`);
  glowGradient.addColorStop(1, "rgba(255, 200, 50, 0)");
  
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  
  // === HEALTH BAR ===
  const barWidth = 50; 
  ctx.fillStyle = "gray"; 
  ctx.fillRect(gs.x - barWidth/2, gs.y - gs.size - 10, barWidth, 5);
  ctx.fillStyle = "gold"; 
  ctx.fillRect(gs.x - barWidth/2, gs.y - gs.size - 10, barWidth * (gs.health / gs.maxHealth), 5);

  // === REFLECTOR SHIELD INDICATOR ===
  if (gs.reflectAvailable || state.player.shieldActive) {
    const shieldRotation = state.frameCount * 0.02;
    ctx.save();
    ctx.translate(gs.x, gs.y);
    ctx.rotate(shieldRotation);
    
    // Rotating shield pattern
    ctx.strokeStyle = "rgba(100, 200, 255, 0.6)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x1 = Math.cos(angle) * (gs.size/2 + 10);
      const y1 = Math.sin(angle) * (gs.size/2 + 10);
      const x2 = Math.cos(angle) * (gs.size/2 + 16);
      const y2 = Math.sin(angle) * (gs.size/2 + 16);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// NEW: drawGoldStarAura — export a named function so game.js can import it
export function drawGoldStarAura() {
  if (!state.goldStar.alive) return;
  if (!state.goldStarAura || !state.goldStarAura.active) return;

  const aura = state.goldStarAura;
  const pulse = Math.sin(state.frameCount * 0.15) * 0.3 + 0.7;
  const levelFactor = Math.max(0, aura.level || 0);
  const radius = (aura.radius || (state.goldStar.size / 2 + 20)) + levelFactor * 4 + pulse * 8;

  state.ctx.save();
  state.ctx.globalCompositeOperation = 'lighter';

  const grad = state.ctx.createRadialGradient(state.goldStar.x, state.goldStar.y, 0, state.goldStar.x, state.goldStar.y, radius);
  grad.addColorStop(0, `rgba(255,220,80,${0.6 * pulse})`);
  grad.addColorStop(0.5, `rgba(255,180,40,${0.35 * pulse})`);
  grad.addColorStop(1, `rgba(255,120,0,0)`);

  state.ctx.fillStyle = grad;
  state.ctx.beginPath();
  state.ctx.arc(state.goldStar.x, state.goldStar.y, radius, 0, Math.PI*2);
  state.ctx.fill();

  // subtle outer ring
  state.ctx.strokeStyle = `rgba(255,220,80,${0.15 * pulse})`;
  state.ctx.lineWidth = 2;
  state.ctx.beginPath();
  state.ctx.arc(state.goldStar.x, state.goldStar.y, radius + 6, 0, Math.PI*2);
  state.ctx.stroke();

  state.ctx.restore();
}
