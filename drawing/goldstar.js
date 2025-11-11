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
  
  // === RED PUNCH POWER-UP VISUAL EFFECTS ===
  if (gs.redPunchLevel > 0) {
    gs.redPunchAnimation.active = true;
    gs.redPunchAnimation.frame++;
    
    // Level 1: Red glowing aura particles orbiting Gold Star (8 particles, radius 50px)
    if (gs.redPunchLevel >= 1) {
      const particleCount = gs.redPunchLevel === 1 ? 8 : gs.redPunchLevel === 2 ? 12 : 16;
      const orbitRadius = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + gs.redPunchAnimation.frame * 0.03;
        const px = gs.x + Math.cos(angle) * orbitRadius;
        const py = gs.y + Math.sin(angle) * orbitRadius;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 100, 100, 0.8)';
        ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    // Level 2: Add red trailing effect behind Gold Star movement
    if (gs.redPunchLevel >= 2) {
      const trailLength = 3;
      for (let i = 0; i < trailLength; i++) {
        const opacity = 0.3 * (1 - i / trailLength);
        ctx.fillStyle = `rgba(255, 100, 100, ${opacity})`;
        ctx.beginPath();
        ctx.arc(gs.x - (i * 8), gs.y, (gs.size * 1.1) / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Level 3: Pulsing red energy waves emanating every 30 frames, red afterimage trail
    if (gs.redPunchLevel >= 3) {
      if (gs.redPunchAnimation.frame % 30 === 0) {
        // Create pulsing wave
        ctx.save();
        for (let wave = 0; wave < 3; wave++) {
          const waveRadius = 60 + wave * 20;
          const waveOpacity = 0.5 * (1 - wave / 3);
          ctx.strokeStyle = `rgba(255, 50, 50, ${waveOpacity})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(gs.x, gs.y, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
      
      // Afterimage trail
      const afterimageCount = 5;
      for (let i = 1; i < afterimageCount; i++) {
        const opacity = 0.2 * (1 - i / afterimageCount);
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(gs.x - i * 10, gs.y);
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j * Math.PI / 3) - Math.PI / 2;
          const radius = (gs.size * 1.2) / 2.5;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  } else {
    gs.redPunchAnimation.active = false;
    gs.redPunchAnimation.frame = 0;
  }
  
  // === BLUE CANNON POWER-UP VISUAL EFFECTS ===
  if (gs.blueCannonLevel > 0) {
    gs.blueCannonAnimation.active = true;
    gs.blueCannonAnimation.frame++;
    
    // Level 1: Cyan/blue energy lines connecting from center to 4 cardinal points, rotating slowly
    if (gs.blueCannonLevel >= 1) {
      const lineCount = gs.blueCannonLevel === 1 ? 4 : gs.blueCannonLevel === 2 ? 8 : 12;
      const rotationSpeed = gs.blueCannonLevel >= 2 ? 0.02 : 0.01;
      const lineLength = 40;
      
      ctx.save();
      ctx.translate(gs.x, gs.y);
      ctx.rotate(gs.blueCannonAnimation.frame * rotationSpeed);
      
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const x1 = Math.cos(angle) * (gs.size / 2);
        const y1 = Math.sin(angle) * (gs.size / 2);
        const x2 = Math.cos(angle) * lineLength;
        const y2 = Math.sin(angle) * lineLength;
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Level 2: Blue particle stream from wing tips
    if (gs.blueCannonLevel >= 2) {
      for (let side = -1; side <= 1; side += 2) {
        const wingX = gs.x + side * (gs.size / 2);
        const wingY = gs.y;
        
        if (gs.blueCannonAnimation.frame % 3 === 0) {
          ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(wingX, wingY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // Level 3: Blue electric arcs jumping between points, cyan glow aura
    if (gs.blueCannonLevel >= 3) {
      // Cyan glow aura
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(gs.x, gs.y, gs.size / 2 + 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      
      // Electric arcs
      if (gs.blueCannonAnimation.frame % 10 < 5) {
        const arcCount = 3;
        ctx.strokeStyle = 'rgba(150, 220, 255, 0.9)';
        ctx.lineWidth = 2;
        for (let i = 0; i < arcCount; i++) {
          const angle1 = (i / arcCount) * Math.PI * 2 + gs.blueCannonAnimation.frame * 0.05;
          const angle2 = ((i + 1) / arcCount) * Math.PI * 2 + gs.blueCannonAnimation.frame * 0.05;
          const radius = 45;
          const x1 = gs.x + Math.cos(angle1) * radius;
          const y1 = gs.y + Math.sin(angle1) * radius;
          const x2 = gs.x + Math.cos(angle2) * radius;
          const y2 = gs.y + Math.sin(angle2) * radius;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
  } else {
    gs.blueCannonAnimation.active = false;
    gs.blueCannonAnimation.frame = 0;
  }
  
  // === HOMING MISSILE VISUAL EFFECTS ===
  if (gs.homingMissileLevel > 0) {
    gs.homingMissileAnimation.active = true;
    gs.homingMissileAnimation.frame++;
    
    // Level 1: 2 small orange missile pods on sides
    const podCount = gs.homingMissileLevel === 1 ? 2 : gs.homingMissileLevel === 2 ? 4 : 6;
    
    for (let i = 0; i < podCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const layer = Math.floor(i / 2);
      const podX = gs.x + side * (gs.size / 2 + 8);
      const podY = gs.y + layer * 10 - 10;
      
      ctx.fillStyle = 'rgba(255, 150, 50, 0.9)';
      ctx.fillRect(podX - 3, podY - 4, 6, 8);
      
      // Pod glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 150, 50, 0.8)';
      ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
      ctx.fillRect(podX - 2, podY - 3, 4, 6);
      ctx.shadowBlur = 0;
    }
    
    // Level 2: Orange targeting reticles that briefly flash
    if (gs.homingMissileLevel >= 2 && gs.homingMissileAnimation.frame % 60 < 20) {
      const reticleCount = 3;
      for (let i = 0; i < reticleCount; i++) {
        const angle = (i / reticleCount) * Math.PI * 2 + gs.homingMissileAnimation.frame * 0.05;
        const distance = 70;
        const rx = gs.x + Math.cos(angle) * distance;
        const ry = gs.y + Math.sin(angle) * distance;
        
        ctx.strokeStyle = 'rgba(255, 150, 50, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rx, ry, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(rx - 12, ry);
        ctx.lineTo(rx - 8, ry);
        ctx.moveTo(rx + 8, ry);
        ctx.lineTo(rx + 12, ry);
        ctx.moveTo(rx, ry - 12);
        ctx.lineTo(rx, ry - 8);
        ctx.moveTo(rx, ry + 8);
        ctx.lineTo(rx, ry + 12);
        ctx.stroke();
      }
    }
    
    // Level 3: Continuous orange targeting laser effects, missile trail particles
    if (gs.homingMissileLevel >= 3) {
      // Targeting lasers
      const laserCount = 4;
      ctx.strokeStyle = 'rgba(255, 150, 50, 0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < laserCount; i++) {
        const angle = (i / laserCount) * Math.PI * 2 + gs.homingMissileAnimation.frame * 0.03;
        const x1 = gs.x;
        const y1 = gs.y;
        const x2 = gs.x + Math.cos(angle) * 100;
        const y2 = gs.y + Math.sin(angle) * 100;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      // Trail particles
      if (gs.homingMissileAnimation.frame % 5 === 0) {
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = gs.size / 2 + Math.random() * 20;
          const px = gs.x + Math.cos(angle) * distance;
          const py = gs.y + Math.sin(angle) * distance;
          
          ctx.fillStyle = 'rgba(255, 150, 50, 0.6)';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else {
    gs.homingMissileAnimation.active = false;
    gs.homingMissileAnimation.frame = 0;
  }
  
  // === COMBINED POWER-UPS: Prismatic aura at maximum power ===
  if (gs.redPunchLevel >= 3 && gs.blueCannonLevel >= 3 && gs.homingMissileLevel >= 3) {
    // Rainbow prismatic aura effect
    const prismaticPulse = Math.sin(state.frameCount * 0.1);
    const hue = (state.frameCount * 2) % 360;
    
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.6)`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(gs.x, gs.y, gs.size / 2 + 35 + prismaticPulse * 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner prismatic circle
    ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 100%, 60%, 0.4)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gs.x, gs.y, gs.size / 2 + 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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
  
  // === HOMING MISSILE SUPPORT DRONES ===
  if (gs.homingMissileLevel > 0) {
    // Draw support drones orbiting around the Gold Star
    const droneCount = gs.homingMissileLevel; // 1-3 drones based on level
    const orbitRadius = gs.size/2 + 28;
    const droneRotation = state.frameCount * 0.04;
    
    for (let i = 0; i < droneCount; i++) {
      const angle = (i / droneCount) * Math.PI * 2 + droneRotation;
      const droneX = Math.cos(angle) * orbitRadius;
      const droneY = Math.sin(angle) * orbitRadius;
      
      // Drone body (small hexagon)
      ctx.save();
      ctx.translate(droneX, droneY);
      ctx.rotate(angle + Math.PI / 2);
      
      // Drone hull
      ctx.fillStyle = "rgba(255, 150, 50, 0.9)";
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI / 3);
        const r = 5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Drone core
      ctx.fillStyle = "rgba(255, 200, 100, 0.9)";
      ctx.fillRect(-2, -2, 4, 4);
      
      // Missile launchers
      ctx.fillStyle = "rgba(180, 100, 50, 0.9)";
      ctx.fillRect(-6, -1, 3, 2);
      ctx.fillRect(3, -1, 3, 2);
      
      ctx.restore();
      
      // Connection beam to main body
      ctx.strokeStyle = "rgba(255, 150, 50, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(droneX, droneY);
      ctx.stroke();
    }
  }
  
  // === BASE GOLD STAR (Gundam-style futuristic drone) ===
  
  // Calculate size multiplier based on power-up levels (moved earlier for visual additions)
  let sizeMultiplier = 1.0;
  if (gs.redPunchLevel === 2) sizeMultiplier = 1.1; // 10% larger at level 2
  else if (gs.redPunchLevel >= 3) sizeMultiplier = 1.2; // 20% larger at level 3+
  
  const effectiveSize = gs.size * sizeMultiplier;
  
  // === BLUE CANNON TURRET VISUAL ===
  if (gs.blueCannonLevel > 0) {
    // Draw a turret mounted on top of the Gold Star
    const turretY = -effectiveSize/2 - 8;
    
    // Turret base
    ctx.fillStyle = "rgba(100, 150, 200, 0.9)";
    ctx.fillRect(-6, turretY, 12, 8);
    
    // Turret barrel
    ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
    ctx.fillRect(-3, turretY - 8, 6, 8);
    
    // Turret tip with energy glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
    ctx.fillStyle = "rgba(150, 220, 255, 0.9)";
    ctx.fillRect(-2, turretY - 10, 4, 2);
    ctx.shadowBlur = 0;
    
    // Level indicators
    for (let i = 0; i < gs.blueCannonLevel; i++) {
      ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
      ctx.fillRect(-5 + i * 3, turretY + 6, 2, 2);
    }
  }
  
  // === SHIELD GENERATOR VISUAL ===
  if (state.player.shieldActive && state.player.shieldHealth > 0) {
    // Draw shield generator pods on sides
    const podOffsetX = effectiveSize/2 + 8;
    const podOffsetY = 0;
    
    // Left pod
    ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
    ctx.fillRect(-podOffsetX - 4, podOffsetY - 6, 4, 12);
    ctx.fillStyle = "rgba(150, 220, 255, 0.9)";
    ctx.fillRect(-podOffsetX - 3, podOffsetY - 4, 2, 8);
    
    // Right pod
    ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
    ctx.fillRect(podOffsetX, podOffsetY - 6, 4, 12);
    ctx.fillStyle = "rgba(150, 220, 255, 0.9)";
    ctx.fillRect(podOffsetX + 1, podOffsetY - 4, 2, 8);
    
    // Shield energy indicators
    const shieldHealthRatio = state.player.shieldHealth / state.player.maxShieldHealth;
    const pulseIntensity = 0.5 + Math.sin(state.frameCount * 0.15) * 0.3;
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(100, 200, 255, ${pulseIntensity * shieldHealthRatio})`;
    ctx.fillStyle = `rgba(150, 220, 255, ${0.8 * shieldHealthRatio})`;
    ctx.beginPath();
    ctx.arc(-podOffsetX - 2, podOffsetY, 3, 0, Math.PI * 2);
    ctx.arc(podOffsetX + 2, podOffsetY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  // Rotating outer ring (mechanical) - Only show when upgraded
  const hasUpgrades = gs.redPunchLevel > 0 || gs.blueCannonLevel > 0 || gs.homingMissileLevel > 0;
  if (hasUpgrades) {
    const ringRotation = state.frameCount * 0.02;
    ctx.rotate(ringRotation);
    
    // Outer mechanical ring with energy glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
    ctx.strokeStyle = "rgba(218, 165, 32, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, effectiveSize/2 + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Mechanical segments on ring (4 parts)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI / 2);
      const x = Math.cos(angle) * (effectiveSize/2 + 2);
      const y = Math.sin(angle) * (effectiveSize/2 + 2);
      
      ctx.fillStyle = "rgba(255, 215, 0, 1)";
      ctx.fillRect(x - 3, y - 3, 6, 6);
      
      // Energy nodes
      ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    
    ctx.rotate(-ringRotation); // Reset rotation for core
  }
  
  // Main drone core (metallic hexagon)
  ctx.fillStyle = "rgba(218, 165, 32, 1)";
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 2;
    const radius = effectiveSize / 2.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  
  // Metallic sheen on core
  const shineGradient = ctx.createLinearGradient(-effectiveSize/4, -effectiveSize/4, effectiveSize/4, effectiveSize/4);
  shineGradient.addColorStop(0, "rgba(255, 245, 150, 0.6)");
  shineGradient.addColorStop(0.5, "rgba(218, 165, 32, 0.3)");
  shineGradient.addColorStop(1, "rgba(184, 134, 11, 0.6)");
  ctx.fillStyle = shineGradient;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI / 3) - Math.PI / 2;
    const radius = effectiveSize / 2.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  
  // Central energy core (pulsing)
  const glowIntensity = gs.redPunchCharging ? 0.8 + 0.2 * Math.sin(state.frameCount * 0.3) : 0.6;
  const glowSize = gs.redPunchCharging ? 10 : 8;
  const pulseSize = glowSize + Math.sin(state.frameCount * 0.1) * 2;
  
  // Outer glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity})`);
  coreGradient.addColorStop(0.3, `rgba(100, 200, 255, ${glowIntensity})`);
  coreGradient.addColorStop(0.7, `rgba(255, 215, 0, ${glowIntensity * 0.5})`);
  coreGradient.addColorStop(1, "rgba(255, 200, 50, 0)");
  
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Energy trails (4 directional trails)
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 2) + state.frameCount * 0.05;
    const trailLength = 8 + Math.sin(state.frameCount * 0.15 + i) * 3;
    const x1 = Math.cos(angle) * (effectiveSize/2.5);
    const y1 = Math.sin(angle) * (effectiveSize/2.5);
    const x2 = Math.cos(angle) * (effectiveSize/2.5 + trailLength);
    const y2 = Math.sin(angle) * (effectiveSize/2.5 + trailLength);
    
    const trailGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    trailGradient.addColorStop(0, "rgba(100, 200, 255, 0.8)");
    trailGradient.addColorStop(1, "rgba(100, 200, 255, 0)");
    
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  ctx.restore();
  
  // === HEALTH BAR ===
  const barWidth = 50; 
  ctx.fillStyle = "gray"; 
  ctx.fillRect(gs.x - barWidth/2, gs.y - effectiveSize - 10, barWidth, 5);
  ctx.fillStyle = "gold"; 
  ctx.fillRect(gs.x - barWidth/2, gs.y - effectiveSize - 10, barWidth * (gs.health / gs.maxHealth), 5);

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
      const x1 = Math.cos(angle) * (effectiveSize/2 + 10);
      const y1 = Math.sin(angle) * (effectiveSize/2 + 10);
      const x2 = Math.cos(angle) * (effectiveSize/2 + 16);
      const y2 = Math.sin(angle) * (effectiveSize/2 + 16);
      
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
