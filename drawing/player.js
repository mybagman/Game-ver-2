import * as state from '../state.js';

// Raiden-style military fighter jet sprite drawing with rotation
function drawPlayer8Bit(ctx, player) {
  // Raiden-inspired sleek military fighter with detailed pixel art
  const size = player.size || 28;
  
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  
  // Apply rotation transformation
  ctx.translate(player.x, player.y);
  ctx.rotate(player.rotation + Math.PI / 2);
  
  // Main fuselage (metallic blue-gray)
  ctx.fillStyle = "#4a6e8a";
  ctx.fillRect(-size/6, -size/2, size/3, size*0.8);
  
  // Nose cone (pointed)
  ctx.fillStyle = "#5a7e9a";
  ctx.beginPath();
  ctx.moveTo(0, -size/2);
  ctx.lineTo(-size/6, -size/2 + size/8);
  ctx.lineTo(size/6, -size/2 + size/8);
  ctx.closePath();
  ctx.fill();
  
  // Main wings (swept back, Raiden style)
  ctx.fillStyle = "#3a5e7a";
  // Left wing
  ctx.beginPath();
  ctx.moveTo(-size/6, -size/6);
  ctx.lineTo(-size/2, 0);
  ctx.lineTo(-size/2.5, size/8);
  ctx.lineTo(-size/6, 0);
  ctx.closePath();
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(size/6, -size/6);
  ctx.lineTo(size/2, 0);
  ctx.lineTo(size/2.5, size/8);
  ctx.lineTo(size/6, 0);
  ctx.closePath();
  ctx.fill();
  
  // Wing weapons pods
  ctx.fillStyle = "#2a4e6a";
  ctx.fillRect(-size/2.2, -size/12, size/12, size/4);
  ctx.fillRect(size/2.2 - size/12, -size/12, size/12, size/4);
  
  // Cockpit canopy (glowing cyan)
  ctx.fillStyle = "#00ccff";
  ctx.fillRect(-size/8, -size/3, size/4, size/5);
  ctx.strokeStyle = "#008899";
  ctx.lineWidth = 1;
  ctx.strokeRect(-size/8, -size/3, size/4, size/5);
  
  // Tail stabilizers
  ctx.fillStyle = "#3a5e7a";
  ctx.fillRect(-size/10, size/4, size/5, size/6);
  
  // Twin engine exhausts (glowing)
  const exhaustGlow = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
  ctx.fillStyle = `rgba(255, 150, 50, ${exhaustGlow})`;
  ctx.fillRect(-size/8, size/2.5, size/16, size/8);
  ctx.fillRect(size/8 - size/16, size/2.5, size/16, size/8);
  
  // Panel lines (Raiden detailing)
  ctx.strokeStyle = "#2a4e6a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size/12, -size/4);
  ctx.lineTo(-size/12, size/3);
  ctx.moveTo(size/12, -size/4);
  ctx.lineTo(size/12, size/3);
  ctx.stroke();
  
  // Nose sensor array (red dot)
  ctx.fillStyle = "#ff3333";
  ctx.fillRect(-size/20, -size/2.5, size/10, size/20);

  // Add bright outline for visibility against all backgrounds
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.rect(-size/2, -size/2, size, size);
  ctx.stroke();

  // invulnerability flicker overlay
  if (player.invulnerable) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(-size/2, -size/2, size, size);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// Draw thruster particles
function drawThrusterParticles(ctx, player) {
  if (!player.thrusterParticles || player.thrusterParticles.length === 0) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow effect
  
  for (const p of player.thrusterParticles) {
    const alpha = p.life / p.maxLife;
    const size = p.size * (0.5 + alpha * 0.5); // Shrink as they fade
    
    // Draw particle with gradient for better effect
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
    gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha * 0.9})`);
    gradient.addColorStop(0.5, `hsla(${p.hue}, 100%, 50%, ${alpha * 0.6})`);
    gradient.addColorStop(1, `hsla(${p.hue}, 100%, 30%, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// replace drawPlayer rectangle with an 8-bit craft
export function drawPlayer() {
  console.log('[drawPlayer] called at wave', state.wave, 'player pos:', state.player.x, state.player.y);
  // ensure any lingering canvas state is reset before drawing player
  state.ctx.save();
  state.ctx.filter = 'none';
  state.ctx.globalAlpha = 1;
  state.ctx.globalCompositeOperation = 'source-over';

  // determine some colors from player / environment for a more interesting craft
  state.player.hullColor = state.player.hullColor || (state.inAtmosphere ? "#c0e0ff" : "#88ff88");
  state.player.accentColor = state.player.accentColor || (state.inAtmosphere ? "#ffcc66" : "#00e0ff");
  state.player.cockpitColor = state.player.cockpitColor || "#222222";
  state.player.exhaustColor = state.player.exhaustColor || (state.inAtmosphere ? "rgba(255,200,100,0.85)" : "rgba(255,90,90,0.9)");

  // Draw thruster particles BEFORE the ship so they appear behind
  drawThrusterParticles(state.ctx, state.player);

  // draw 8-bit sprite centered on player.x, player.y
  drawPlayer8Bit(state.ctx, state.player);
  
  // Ram Mode visual effect - energy aura around player
  if (state.player.ramMode) {
    const ramPulse = Math.sin(state.frameCount * 0.3) * 0.3 + 0.7;
    const ramRadius = state.player.size + 10;
    
    state.ctx.save();
    state.ctx.globalCompositeOperation = 'lighter';
    state.ctx.translate(state.player.x, state.player.y);
    
    // Outer energy ring (yellow/orange)
    const ramGrad = state.ctx.createRadialGradient(0, 0, 0, 0, 0, ramRadius);
    ramGrad.addColorStop(0, 'rgba(255, 200, 0, 0)');
    ramGrad.addColorStop(0.7, `rgba(255, 150, 0, ${0.4 * ramPulse})`);
    ramGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    state.ctx.fillStyle = ramGrad;
    state.ctx.beginPath();
    state.ctx.arc(0, 0, ramRadius, 0, Math.PI * 2);
    state.ctx.fill();
    
    // Energy sparks around player
    for (let i = 0; i < 8; i++) {
      const sparkAngle = (i / 8) * Math.PI * 2 + state.frameCount * 0.1;
      const sparkDist = ramRadius * 0.8;
      const sparkX = Math.cos(sparkAngle) * sparkDist;
      const sparkY = Math.sin(sparkAngle) * sparkDist;
      state.ctx.fillStyle = `rgba(255, 200, 50, ${0.8 * ramPulse})`;
      state.ctx.beginPath();
      state.ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
      state.ctx.fill();
    }
    
    state.ctx.restore();
  }

  // firing indicator (small dot) when gold star aura active and either shooting or moving
  if (state.goldStarAura.active && (state.shootCooldown > 0 || (state.keys["arrowup"] || state.keys["arrowdown"] || state.keys["arrowleft"] || state.keys["arrowright"]))) {
    const indicatorDistance = state.player.size / 2 + 8;
    const dotX = state.player.x + Math.cos(state.firingIndicatorAngle) * indicatorDistance;
    const dotY = state.player.y + Math.sin(state.firingIndicatorAngle) * indicatorDistance;

    state.ctx.save();
    // No blur for performance
    state.ctx.fillStyle = "yellow";
    state.ctx.beginPath();
    state.ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    state.ctx.fill();
    state.ctx.restore();

    state.setFireIndicatorAngle(state.firingIndicatorAngle + 0.15);
  }

  // Shield system rendering
  if (state.player.shieldActive && state.player.shieldHealth > 0) {
    const shieldRotation = state.frameCount * 0.03;
    const shieldHealthRatio = state.player.shieldHealth / state.player.maxShieldHealth;
    const shieldRadius = state.player.size/2 + 18;
    
    state.ctx.save();
    state.ctx.translate(state.player.x, state.player.y);
    state.ctx.rotate(shieldRotation);
    
    // Hexagonal shield pattern (8-bit style)
    state.ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 + shieldHealthRatio * 0.4})`;
    state.ctx.lineWidth = 2;
    
    // Draw hexagon shield
    state.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * shieldRadius;
      const y = Math.sin(angle) * shieldRadius;
      if (i === 0) state.ctx.moveTo(x, y);
      else state.ctx.lineTo(x, y);
    }
    state.ctx.closePath();
    state.ctx.stroke();
    
    // Shield glow
    state.ctx.fillStyle = `rgba(100, 200, 255, ${0.1 * shieldHealthRatio})`;
    state.ctx.fill();
    
    // Shield segments (decorative)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x1 = Math.cos(angle) * shieldRadius;
      const y1 = Math.sin(angle) * shieldRadius;
      
      state.ctx.strokeStyle = `rgba(150, 220, 255, ${0.3 * shieldHealthRatio})`;
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(0, 0);
      state.ctx.lineTo(x1, y1);
      state.ctx.stroke();
    }
    
    state.ctx.restore();
  }

  // reflect aura ring (now deprecated, using shield system instead)
  if (state.player.reflectAvailable && !state.player.shieldActive) {
    state.ctx.save();
    state.ctx.strokeStyle = "cyan";
    state.ctx.lineWidth = 2;
    state.ctx.beginPath(); 
    state.ctx.arc(state.player.x, state.player.y, state.player.size/2 + 14, 0, Math.PI*2); 
    state.ctx.stroke();
    state.ctx.restore();
  }

  state.ctx.restore();
}
