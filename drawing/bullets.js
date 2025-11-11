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

    if (isBoss) {
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
    
    // EMP outer glow (electric blue)
    state.ctx.save();
    state.ctx.globalCompositeOperation = 'lighter';
    const pulse = Math.sin(t * 0.2) * 0.3 + 0.7;
    
    // Outer electric aura
    const grad = state.ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
    grad.addColorStop(0, `rgba(100, 200, 255, ${0.8 * pulse})`);
    grad.addColorStop(0.5, `rgba(50, 150, 255, ${0.4 * pulse})`);
    grad.addColorStop(1, 'rgba(0, 100, 200, 0)');
    state.ctx.fillStyle = grad;
    state.ctx.beginPath();
    state.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
    state.ctx.fill();
    
    // Core sphere
    state.// shadowBlur removed for performance
    state.ctx.fillStyle = `rgba(150, 220, 255, ${pulse})`;
    state.ctx.beginPath();
    state.ctx.arc(x, y, size, 0, Math.PI * 2);
    state.ctx.fill();
    state.// shadowBlur removed for performance
    
    // Electric arcs rotating around core
    state.ctx.save();
    state.ctx.translate(x, y);
    state.ctx.rotate(t * 0.05);
    state.ctx.strokeStyle = `rgba(200, 240, 255, ${0.8 * pulse})`;
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
    state.ctx.strokeStyle = `rgba(180, 230, 255, ${0.6 * pulse})`;
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
        color: "rgba(100, 200, 255, 0.6)",
        life: 10
      });
    }
  }
}
