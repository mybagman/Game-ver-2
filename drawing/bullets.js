import * as state from '../state.js';

// Helper: draw a soft glowing trail for a bullet (if bullet has trail[]), otherwise just a subtle glow behind it.
function drawBulletTrail(ctx, b) {
  if (!b) return;
  const trail = b.trail || [];
  // draw older trail particles first (more transparent)
  for (let i = trail.length - 1; i >= 0; i--) {
    const t = trail[i];
    const alpha = (i + 1) / (trail.length + 1) * 0.35;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = (b.color || 'white');
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(t.x, t.y, Math.max(1, (b.size || 6) * (i+1) / (trail.length + 1)), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Draw boss-style bullet (big, glowing, possibly with an aura and pulse)
function drawBossBullet(ctx, b) {
  const x = b.x, y = b.y;
  const size = b.size || 10;
  const t = state.frameCount;
  // Outer glow
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pulse = (Math.sin(t * 0.12 + (b.seed || 0)) * 0.15 + 0.85);
  const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
  grad.addColorStop(0, `rgba(255,200,80,${0.6 * pulse})`);
  grad.addColorStop(0.5, `rgba(255,120,20,${0.25 * pulse})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, size * 3, 0, Math.PI * 2);
  ctx.fill();

  // core
  // shadowBlur removed for performance
  ctx.fillStyle = b.color || "orange";
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  // shadowBlur removed for performance

  // rotating spikes to emphasize menace
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((t * 0.04) + (b.spin || 0));
  ctx.fillStyle = `rgba(255,160,60,${0.9 * pulse})`;
  for (let s = 0; s < 4; s++) {
    const angle = (s / 4) * Math.PI * 2;
    ctx.beginPath();
    const sx = Math.cos(angle) * (size + 6);
    const sy = Math.sin(angle) * (size + 6);
    ctx.moveTo(sx, sy);
    ctx.lineTo(Math.cos(angle) * (size + 14), Math.sin(angle) * (size + 14));
    ctx.lineTo(Math.cos(angle + 0.3) * (size + 6), Math.sin(angle + 0.3) * (size + 6));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();

  // subtle inner ring stroke
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `rgba(255,220,150,${0.5 * pulse})`;
  ctx.arc(x, y, size + 6, 0, Math.PI * 2);
  ctx.stroke();
}

// Draw mini-boss-style bullet: sharper, cyan/blue, with electric accents
function drawMiniBossBullet(ctx, b) {
  const x = b.x, y = b.y;
  const size = b.size || 7;
  const t = state.frameCount;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // halo
  // shadowBlur removed for performance
  ctx.fillStyle = b.color || "cyan";
  ctx.beginPath();
  ctx.arc(x, y, size + 4 + Math.sin(t * 0.2) * 1.5, 0, Math.PI * 2);
  ctx.fill();
  // shadowBlur removed for performance

  // core diamond shape
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((t * 0.08 + (b.seed || 0)) % (Math.PI * 2));
  ctx.fillStyle = "#aaffff";
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // small electric sparks
  ctx.strokeStyle = `rgba(180,255,255,${0.6 + Math.sin(t * 0.3) * 0.2})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + (t * 0.05);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (size + 6), y + Math.sin(a) * (size + 6));
    ctx.lineTo(x + Math.cos(a) * (size + 10 + Math.sin(t * 0.2 + i) * 2), y + Math.sin(a) * (size + 10 + Math.cos(t * 0.2 + i) * 2));
    ctx.stroke();
  }

  ctx.restore();
}

// NEW: drawBullets — support boss and mini-boss bullets with special effects/trails
export function drawBullets() {
  for (let i = 0; i < state.bullets.length; i++) {
    const b = state.bullets[i];
    if (!b) continue;

    // Determine origin/type with multiple fallbacks to be robust
    const owner = b.ownerType || b.sourceType || b.owner || (b.from && b.from.type) || (b.team && b.team) || "";
    const isBoss = b.bossBullet || owner === 'boss' || owner === 'Boss' || owner === 'mother-core' || (b.from && b.from.type === 'boss');
    const isMiniBoss = b.miniBossBullet || owner === 'mini-boss' || owner === 'miniBoss' || (b.from && b.from.type === 'mini-boss');

    // Draw trails if present
    if (b.trail && b.trail.length) {
      drawBulletTrail(state.ctx, b);
    }

    if (b.kamehameha) {
      // Kamehameha beam style (Dragon Ball Z energy wave)
      state.ctx.save();
      state.ctx.globalCompositeOperation = 'lighter';
      
      const beamPulse = Math.sin(state.frameCount * 0.15) * 0.3 + 0.7;
      const beamSize = (b.size || 12) * beamPulse;
      
      // Outer energy glow (cyan/blue)
      const outerGrad = state.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, beamSize * 2);
      outerGrad.addColorStop(0, `rgba(100, 200, 255, ${0.8 * beamPulse})`);
      outerGrad.addColorStop(0.5, `rgba(50, 150, 255, ${0.4 * beamPulse})`);
      outerGrad.addColorStop(1, 'rgba(0, 100, 200, 0)');
      state.ctx.fillStyle = outerGrad;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, beamSize * 2, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Middle energy layer (bright cyan)
      const midGrad = state.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, beamSize * 1.2);
      midGrad.addColorStop(0, `rgba(150, 220, 255, ${0.9 * beamPulse})`);
      midGrad.addColorStop(0.7, `rgba(100, 180, 255, ${0.5 * beamPulse})`);
      midGrad.addColorStop(1, 'rgba(50, 140, 255, 0)');
      state.ctx.fillStyle = midGrad;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, beamSize * 1.2, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Core (bright white)
      state.ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * beamPulse})`;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, beamSize * 0.6, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Energy sparks around the beam
      if (state.frameCount % 3 === 0) {
        for (let s = 0; s < 3; s++) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkDist = beamSize * (1 + Math.random() * 0.5);
          const sparkX = b.x + Math.cos(sparkAngle) * sparkDist;
          const sparkY = b.y + Math.sin(sparkAngle) * sparkDist;
          state.ctx.fillStyle = `rgba(200, 240, 255, ${0.6 * beamPulse})`;
          state.ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
        }
      }
      
      state.ctx.restore();
    } else if (b.plasma) {
      // Plasma Cannon bullets - bright, glowing plasma projectiles
      state.ctx.save();
      state.ctx.globalCompositeOperation = 'lighter';
      
      const plasmaPulse = Math.sin(state.frameCount * 0.2) * 0.3 + 0.7;
      const plasmaSize = b.size || 10;
      
      // Outer plasma glow (purple/pink)
      const plasmaGrad = state.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, plasmaSize * 2);
      plasmaGrad.addColorStop(0, `rgba(255, 100, 255, ${0.9 * plasmaPulse})`);
      plasmaGrad.addColorStop(0.5, `rgba(200, 50, 255, ${0.5 * plasmaPulse})`);
      plasmaGrad.addColorStop(1, 'rgba(150, 0, 200, 0)');
      state.ctx.fillStyle = plasmaGrad;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, plasmaSize * 2, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Core (bright white/pink)
      state.ctx.fillStyle = `rgba(255, 200, 255, ${plasmaPulse})`;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, plasmaSize * 0.6, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Energy sparks
      if (state.frameCount % 2 === 0) {
        for (let s = 0; s < 3; s++) {
          const sparkAngle = Math.random() * Math.PI * 2;
          const sparkDist = plasmaSize * (1 + Math.random());
          const sparkX = b.x + Math.cos(sparkAngle) * sparkDist;
          const sparkY = b.y + Math.sin(sparkAngle) * sparkDist;
          state.ctx.fillStyle = `rgba(255, 150, 255, ${0.8 * plasmaPulse})`;
          state.ctx.fillRect(sparkX - 1.5, sparkY - 1.5, 3, 3);
        }
      }
      
      state.ctx.restore();
    } else if (b.repulsor) {
      // Repulsor Fire bullets - blue energy with knockback effect
      state.ctx.save();
      state.ctx.globalCompositeOperation = 'lighter';
      
      const repulsorPulse = Math.sin(state.frameCount * 0.18) * 0.3 + 0.7;
      const repulsorSize = b.size || 8;
      
      // Outer repulsor field (blue/cyan)
      const repulsorGrad = state.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, repulsorSize * 1.8);
      repulsorGrad.addColorStop(0, `rgba(100, 200, 255, ${0.8 * repulsorPulse})`);
      repulsorGrad.addColorStop(0.5, `rgba(50, 150, 255, ${0.4 * repulsorPulse})`);
      repulsorGrad.addColorStop(1, 'rgba(0, 100, 200, 0)');
      state.ctx.fillStyle = repulsorGrad;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, repulsorSize * 1.8, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Core (bright cyan)
      state.ctx.fillStyle = `rgba(150, 220, 255, ${repulsorPulse})`;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, repulsorSize * 0.7, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Repulsion rings
      state.ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 * repulsorPulse})`;
      state.ctx.lineWidth = 2;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, repulsorSize + 2 + Math.sin(state.frameCount * 0.15) * 2, 0, Math.PI * 2);
      state.ctx.stroke();
      
      state.ctx.restore();
    } else if (b.wave) {
      // Wave Fire bullets - oscillating wave pattern
      state.ctx.save();
      state.ctx.globalCompositeOperation = 'lighter';
      
      const wavePulse = Math.sin(state.frameCount * 0.15) * 0.3 + 0.7;
      const waveSize = b.size || 7;
      
      // Outer wave glow (orange/yellow)
      const waveGrad = state.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, waveSize * 1.6);
      waveGrad.addColorStop(0, `rgba(255, 200, 100, ${0.8 * wavePulse})`);
      waveGrad.addColorStop(0.5, `rgba(255, 150, 50, ${0.4 * wavePulse})`);
      waveGrad.addColorStop(1, 'rgba(200, 100, 0, 0)');
      state.ctx.fillStyle = waveGrad;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, waveSize * 1.6, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Core (bright yellow)
      state.ctx.fillStyle = `rgba(255, 220, 150, ${wavePulse})`;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, waveSize * 0.6, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Wave oscillation rings
      for (let w = 0; w < 2; w++) {
        state.ctx.strokeStyle = `rgba(255, 180, 100, ${(0.4 - w * 0.15) * wavePulse})`;
        state.ctx.lineWidth = 1.5;
        state.ctx.beginPath();
        state.ctx.arc(b.x, b.y, waveSize + 3 + w * 4 + Math.sin(state.frameCount * 0.12 + w) * 2, 0, Math.PI * 2);
        state.ctx.stroke();
      }
      
      state.ctx.restore();
    } else if (isBoss) {
      drawBossBullet(state.ctx, b);
    } else if (isMiniBoss) {
      drawMiniBossBullet(state.ctx, b);
    } else {
      // Default regular bullet (backwards-compatible)
      state.ctx.save();
      state.ctx.fillStyle = b.color || "yellow";
      // small rotation/flash for variety
      if (b.shape === 'circle') {
        state.ctx.beginPath();
        state.ctx.arc(b.x, b.y, (b.size || 6) / 2, 0, Math.PI * 2);
        state.ctx.fill();
      } else {
        state.ctx.fillRect(b.x - (b.size || 6) / 2, b.y - (b.size || 6) / 2, b.size || 6, b.size || 6);
      }
      state.ctx.restore();
    }

    // Optional hit indicator (if bullet stores hitPulse)
    if (b.hitPulse && b.hitPulse > 0) {
      state.ctx.save();
      state.ctx.globalCompositeOperation = 'lighter';
      state.ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, b.hitPulse)})`;
      state.ctx.lineWidth = 2;
      state.ctx.beginPath();
      state.ctx.arc(b.x, b.y, (b.size || 6) + 6 * b.hitPulse, 0, Math.PI * 2);
      state.ctx.stroke();
      state.ctx.restore();
    }
  }
}

// Draw EMP projectiles
export function drawEmpProjectiles() {
  for (let i = 0; i < state.empProjectiles.length; i++) {
    const emp = state.empProjectiles[i];
    if (!emp) continue;
    
    const x = emp.x, y = emp.y;
    const size = emp.size || 12;
    const t = state.frameCount;
    
    // Color scheme based on owner (player = green, gold = blue)
    const isPlayerEMP = emp.owner === "player";
    const color1 = isPlayerEMP ? [150, 255, 100] : [100, 200, 255]; // RGB
    const color2 = isPlayerEMP ? [100, 200, 50] : [50, 150, 255];
    const color3 = isPlayerEMP ? [50, 150, 0] : [0, 100, 200];
    const color4 = isPlayerEMP ? [180, 255, 120] : [150, 220, 255];
    const color5 = isPlayerEMP ? [220, 255, 180] : [200, 240, 255];
    const color6 = isPlayerEMP ? [200, 255, 150] : [180, 230, 255];
    const trailColor = isPlayerEMP ? "rgba(150, 255, 100, 0.6)" : "rgba(100, 200, 255, 0.6)";
    
    // EMP outer glow
    state.ctx.save();
    state.ctx.globalCompositeOperation = 'lighter';
    const pulse = Math.sin(t * 0.2) * 0.3 + 0.7;
    
    // Outer electric aura
    const grad = state.ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
    grad.addColorStop(0, `rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, ${0.8 * pulse})`);
    grad.addColorStop(0.5, `rgba(${color2[0]}, ${color2[1]}, ${color2[2]}, ${0.4 * pulse})`);
    grad.addColorStop(1, `rgba(${color3[0]}, ${color3[1]}, ${color3[2]}, 0)`);
    state.ctx.fillStyle = grad;
    state.ctx.beginPath();
    state.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
    state.ctx.fill();
    
    // Core sphere
    state.ctx.fillStyle = `rgba(${color4[0]}, ${color4[1]}, ${color4[2]}, ${pulse})`;
    state.ctx.beginPath();
    state.ctx.arc(x, y, size, 0, Math.PI * 2);
    state.ctx.fill();
    
    // Electric arcs rotating around core
    state.ctx.save();
    state.ctx.translate(x, y);
    state.ctx.rotate(t * 0.05);
    state.ctx.strokeStyle = `rgba(${color5[0]}, ${color5[1]}, ${color5[2]}, ${0.8 * pulse})`;
    state.ctx.lineWidth = 2;
    
    for (let a = 0; a < 4; a++) {
      const angle = (a / 4) * Math.PI * 2;
      const arcSize = size + 5;
      state.ctx.beginPath();
      state.ctx.moveTo(Math.cos(angle) * arcSize, Math.sin(angle) * arcSize);
      state.ctx.lineTo(
        Math.cos(angle + 0.5) * (arcSize + 4 + Math.sin(t * 0.3 + a) * 3),
        Math.sin(angle + 0.5) * (arcSize + 4 + Math.cos(t * 0.3 + a) * 3)
      );
      state.ctx.stroke();
    }
    state.ctx.restore();
    
    // Inner ring pulse
    state.ctx.beginPath();
    state.ctx.strokeStyle = `rgba(${color6[0]}, ${color6[1]}, ${color6[2]}, ${0.6 * pulse})`;
    state.ctx.lineWidth = 1.5;
    state.ctx.arc(x, y, size + 3 + Math.sin(t * 0.15) * 2, 0, Math.PI * 2);
    state.ctx.stroke();
    
    state.ctx.restore();
    
    // Trail particles
    if (Math.random() > 0.5) {
      state.pushExplosion({
        x: x - emp.dx * 0.5,
        y: y - emp.dy * 0.5,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        radius: 3,
        color: trailColor,
        life: 10
      });
    }
  }
}

// Draw Megatonne Bombs
export function drawMegatonneBombs() {
  for (let i = 0; i < state.megatonneBombs.length; i++) {
    const bomb = state.megatonneBombs[i];
    if (!bomb) continue;
    
    const x = bomb.x, y = bomb.y;
    const size = (bomb.size || 20) * 1.5; // Increased size by 50% (from 20 to 30)
    const t = bomb.frame || 0;
    
    // Massive outer glow (orange/red) - MORE INTENSE
    state.ctx.save();
    state.ctx.globalCompositeOperation = 'lighter';
    const pulse = Math.sin(t * 0.15) * 0.3 + 0.7;
    
    // Outer explosive aura - LARGER RADIUS
    const outerGrad = state.ctx.createRadialGradient(x, y, 0, x, y, size * 4.5); // Increased from 3 to 4.5
    outerGrad.addColorStop(0, `rgba(255, 180, 0, ${1.0 * pulse})`); // Brighter
    outerGrad.addColorStop(0.4, `rgba(255, 130, 0, ${0.7 * pulse})`);
    outerGrad.addColorStop(1, 'rgba(200, 50, 0, 0)');
    state.ctx.fillStyle = outerGrad;
    state.ctx.beginPath();
    state.ctx.arc(x, y, size * 4.5, 0, Math.PI * 2);
    state.ctx.fill();
    
    // Middle layer (bright orange) - ENHANCED
    const midGrad = state.ctx.createRadialGradient(x, y, 0, x, y, size * 2.5); // Increased from 1.8 to 2.5
    midGrad.addColorStop(0, `rgba(255, 220, 80, ${1.0 * pulse})`); // Brighter
    midGrad.addColorStop(0.5, `rgba(255, 180, 0, ${0.8 * pulse})`);
    midGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    state.ctx.fillStyle = midGrad;
    state.ctx.beginPath();
    state.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
    state.ctx.fill();
    
    // Core (bright yellow-white) - LARGER
    state.ctx.fillStyle = `rgba(255, 255, 220, ${1.0 * pulse})`;
    state.ctx.beginPath();
    state.ctx.arc(x, y, size * 1.2, 0, Math.PI * 2); // Slightly larger core
    state.ctx.fill();
    
    // Rotating danger symbol
    state.ctx.save();
    state.ctx.translate(x, y);
    state.ctx.rotate(t * 0.08);
    
    // Draw radiation/hazard symbol
    state.ctx.fillStyle = `rgba(50, 50, 50, ${0.8 * pulse})`;
    for (let s = 0; s < 3; s++) {
      const angle = (s / 3) * Math.PI * 2;
      state.ctx.beginPath();
      state.ctx.moveTo(0, 0);
      state.ctx.arc(0, 0, size * 0.7, angle - 0.3, angle + 0.3);
      state.ctx.closePath();
      state.ctx.fill();
    }
    state.ctx.restore();
    
    // Energy sparks - MORE FREQUENT AND LARGER
    if (t % 2 === 0) { // More frequent (changed from % 3 to % 2)
      for (let s = 0; s < 10; s++) { // More sparks (increased from 5 to 10)
        const sparkAngle = (Math.random() * Math.PI * 2);
        const sparkDist = size * (1.5 + Math.random() * 1.2); // Further out
        const sparkX = x + Math.cos(sparkAngle) * sparkDist;
        const sparkY = y + Math.sin(sparkAngle) * sparkDist;
        state.ctx.fillStyle = `rgba(255, 220, 120, ${0.9 * pulse})`;
        state.ctx.fillRect(sparkX - 3, sparkY - 3, 6, 6); // Larger sparks
      }
    }
    
    // Outer ring pulse - MORE PROMINENT
    state.ctx.beginPath();
    state.ctx.strokeStyle = `rgba(255, 180, 0, ${1.0 * pulse})`;
    state.ctx.lineWidth = 4; // Thicker (increased from 3)
    state.ctx.arc(x, y, size + 12 + Math.sin(t * 0.2) * 5, 0, Math.PI * 2); // Larger pulse
    state.ctx.stroke();
    
    // Additional outer ring for more intensity
    state.ctx.beginPath();
    state.ctx.strokeStyle = `rgba(255, 150, 0, ${0.6 * pulse})`;
    state.ctx.lineWidth = 2;
    state.ctx.arc(x, y, size + 20 + Math.sin(t * 0.15) * 7, 0, Math.PI * 2);
    state.ctx.stroke();
    
    state.ctx.restore();
    
    // Trail particles (fire trail) - MORE PROMINENT
    if (Math.random() > 0.2) { // More frequent trails (changed from 0.3 to 0.2)
      state.pushExplosion({
        x: x - bomb.dx * 0.8,
        y: y - bomb.dy * 0.8,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        radius: 12, // Larger trail particles (increased from 8)
        color: "rgba(255, 180, 80, 0.85)", // Brighter trails
        life: 25 // Longer lasting (increased from 15)
      });
    }
  }
}
