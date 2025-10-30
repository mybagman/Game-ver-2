import * as state from './state.js';

export function drawClouds() {
  // Three-layer parallax clouds with depth
  const layers = [
    { speed: 0.3, scale: 0.6, alpha: 0.3, blur: 8 },
    { speed: 0.6, scale: 0.8, alpha: 0.5, blur: 4 },
    { speed: 1.0, scale: 1.0, alpha: 0.7, blur: 0 }
  ];
  
  layers.forEach((layer, layerIdx) => {
    state.cloudParticles.forEach((c, idx) => {
      if (idx % 3 !== layerIdx) return; // distribute clouds across layers
      
      const layerOffset = (state.frameCount * layer.speed * 0.5) % state.canvas.width;
      const x = (c.x + layerOffset) % state.canvas.width;
      
      state.ctx.save();
      if (layer.blur > 0) {
        state.ctx.filter = `blur(${layer.blur}px)`;
      } else {
        // ensure filter is cleared when blur is 0
        state.ctx.filter = 'none';
      }
      
      state.ctx.globalAlpha = c.opacity * layer.alpha;
      state.ctx.fillStyle = `rgba(220,230,240,1)`;
      state.ctx.beginPath();
      state.ctx.arc(x, c.y, c.size * layer.scale, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Add wispy edges
      state.ctx.globalAlpha = c.opacity * layer.alpha * 0.4;
      state.ctx.beginPath();
      state.ctx.arc(x + c.size * 0.3, c.y, c.size * layer.scale * 0.7, 0, Math.PI * 2);
      state.ctx.fill();
      
      state.ctx.restore();
      // very important: reset filter after restore in case some browsers keep it
      state.ctx.filter = 'none';
      state.ctx.globalAlpha = 1;
    });
  });
}

export function drawCityBackground() {
  state.ctx.fillStyle = "rgba(20,20,30,0.8)";
  for (let i = 0; i < 20; i++) {
    const x = i * (state.canvas.width / 20);
    const height = 100 + Math.sin(i) * 50;
    state.ctx.fillRect(x, state.canvas.height - height, state.canvas.width / 20 - 5, height);
  }
}

// New 8-bit style player sprite drawing
function drawPlayer8Bit(ctx, player) {
  // Pixel-art 'canvas' is 9 x 9 logical pixels; scale with player.size
  const grid = [
    "001000100", // 0
    "011011110", // 1
    "111111111", // 2
    "111111111", // 3
    "011111110", // 4
    "001111100", // 5
    "001111100", // 6
    "010000010", // 7 - tail / thruster base
    "001000100"  // 8 - exhaust glow
  ];
  // Colors for different pixel values:
  // 0 -> transparent
  // 1 -> hull color
  // 2 -> cockpit (we'll mark cockpit with '2' in grid if needed)
  // For simplicity use hull and accent mapped from player state (atmospheric/space)
  const hullColor = player.hullColor || "#88ff88"; // default lime-ish
  const accentColor = player.accentColor || "#00e0ff";
  const cockpitColor = player.cockpitColor || "#ffffff";
  const exhaustColor = player.exhaustColor || "rgba(255,120,40,0.9)";

  const size = player.size || 24;
  const pixels = grid.length;
  const px = Math.floor(size / pixels); // integer pixel scale
  const remainder = size - px * pixels;
  // center offset so sprite matches player.x,y center
  const offsetX = player.x - (px * pixels + remainder) / 2;
  const offsetY = player.y - (px * pixels + remainder) / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = hullColor;

  for (let gy = 0; gy < pixels; gy++) {
    const row = grid[gy];
    for (let gx = 0; gx < row.length; gx++) {
      const v = row[gx];
      if (v === "0") continue;
      // choose color by row/col to add detail
      let color = hullColor;
      // cockpit center approx
      if (gy >= 2 && gy <= 3 && gx >= 3 && gx <= 5) color = cockpitColor;
      // accent on wing tips
      if (gx === 0 || gx === row.length - 1) color = accentColor;
      // tail/exhaust rows: make exhaust glow
      if (gy === 8) color = exhaustColor;
      ctx.fillStyle = color;
      const drawX = offsetX + gx * px + Math.floor(remainder / 2);
      const drawY = offsetY + gy * px + Math.floor(remainder / 2);
      // draw sharp rectangle pixel
      ctx.fillRect(Math.round(drawX), Math.round(drawY), px, px);
    }
  }

  // Thruster glow / movement indication
  if (player.thrusting) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = "rgba(255,140,60,0.6)";
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + size / 2.6, size / 4, size / 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // invulnerability flicker overlay
  if (player.invulnerable) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(offsetX, offsetY, px * pixels + remainder, px * pixels + remainder);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// replace drawPlayer rectangle with an 8-bit craft
export function drawPlayer() {
  // ensure any lingering canvas state is reset before drawing player
  state.ctx.save();
  state.ctx.filter = 'none';
  state.ctx.shadowBlur = 0;
  state.ctx.globalAlpha = 1;
  state.ctx.globalCompositeOperation = 'source-over';

  // determine some colors from player / environment for a more interesting craft
  state.player.hullColor = state.player.hullColor || (state.inAtmosphere ? "#c0e0ff" : "#88ff88");
  state.player.accentColor = state.player.accentColor || (state.inAtmosphere ? "#ffcc66" : "#00e0ff");
  state.player.cockpitColor = state.player.cockpitColor || "#222222";
  state.player.exhaustColor = state.player.exhaustColor || (state.inAtmosphere ? "rgba(255,200,100,0.85)" : "rgba(255,90,90,0.9)");

  // draw 8-bit sprite centered on player.x, player.y
  drawPlayer8Bit(state.ctx, state.player);

  // firing indicator (small dot) when gold star aura active and either shooting or moving
  if (state.goldStarAura.active && (state.shootCooldown > 0 || (state.keys["arrowup"] || state.keys["arrowdown"] || state.keys["arrowleft"] || state.keys["arrowright"]))) {
    const indicatorDistance = state.player.size / 2 + 8;
    const dotX = state.player.x + Math.cos(state.firingIndicatorAngle) * indicatorDistance;
    const dotY = state.player.y + Math.sin(state.firingIndicatorAngle) * indicatorDistance;

    state.ctx.save();
    state.ctx.shadowBlur = 10;
    state.ctx.shadowColor = "yellow";
    state.ctx.fillStyle = "yellow";
    state.ctx.beginPath();
    state.ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    state.ctx.fill();
    state.ctx.restore();

    state.setFireIndicatorAngle(state.firingIndicatorAngle + 0.15);
  }

  // reflect aura ring
  if (state.player.reflectAvailable) {
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
  ctx.shadowBlur = 20;
  ctx.shadowColor = "orange";
  ctx.fillStyle = b.color || "orange";
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

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
  ctx.shadowBlur = 14;
  ctx.shadowColor = "cyan";
  ctx.fillStyle = b.color || "cyan";
  ctx.beginPath();
  ctx.arc(x, y, size + 4 + Math.sin(t * 0.2) * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

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

export function drawEnemies() {
  state.enemies.forEach(e => {
    if (!e) return;

    if (e.type === "red-square") { 
      state.ctx.shadowBlur = 15;
      state.ctx.shadowColor = "red";
      state.ctx.fillStyle = "red"; 
      state.ctx.fillRect(e.x-e.size/2, e.y-e.size/2, e.size, e.size);
      state.ctx.shadowBlur = 0;

      const pulse = Math.sin(state.frameCount * 0.1) * 0.3 + 0.7;
      state.ctx.strokeStyle = `rgba(255,100,100,${pulse})`;
      state.ctx.lineWidth = 2;
      state.ctx.strokeRect(e.x-e.size/2, e.y-e.size/2, e.size, e.size);

      try {
        const eyeTriggerDist = 140;
        const dxP = state.player.x - e.x, dyP = state.player.y - e.y, dP = Math.hypot(dxP, dyP);
        const dxG = state.goldStar.x - e.x, dyG = state.goldStar.y - e.y, dG = Math.hypot(dxG, dyG);
        let target = null, td = Infinity;
        if (dP < eyeTriggerDist) { target = {x: state.player.x, y: state.player.y}; td = dP; }
        if (dG < eyeTriggerDist && dG < td) { target = {x: state.goldStar.x, y: state.goldStar.y}; td = dG; }
        if (target) {
          const insideRadius = Math.min(6, e.size/4);
          const dirX = target.x - e.x, dirY = target.y - e.y;
          const mag = Math.hypot(dirX, dirY) || 1;
          const eyeOffset = Math.min(insideRadius, Math.max(2, insideRadius * 0.8));
          const eyeX = e.x + (dirX / mag) * eyeOffset;
          const eyeY = e.y + (dirY / mag) * eyeOffset;
          state.ctx.beginPath();
          state.ctx.fillStyle = "rgba(160,200,255,0.95)";
          state.ctx.arc(eyeX, eyeY, 5, 0, Math.PI*2);
          state.ctx.fill();
        }
      } catch (err) {}
    }
    else if (e.type === "triangle") { 
      state.ctx.shadowBlur = 15;
      state.ctx.shadowColor = "cyan";
      state.ctx.fillStyle = "cyan"; 
      state.ctx.beginPath(); 
      state.ctx.moveTo(e.x, e.y-e.size/2); 
      state.ctx.lineTo(e.x-e.size/2, e.y+e.size/2); 
      state.ctx.lineTo(e.x+e.size/2, e.y+e.size/2); 
      state.ctx.closePath(); 
      state.ctx.fill();
      state.ctx.shadowBlur = 0;

      const pulse = Math.sin(state.frameCount * 0.08 + e.x) * 0.4 + 0.6;
      state.ctx.strokeStyle = `rgba(100,255,255,${pulse})`;
      state.ctx.lineWidth = 2;
      state.ctx.beginPath(); 
      state.ctx.moveTo(e.x, e.y-e.size/2); 
      state.ctx.lineTo(e.x-e.size/2, e.y+e.size/2); 
      state.ctx.lineTo(e.x+e.size/2, e.y+e.size/2); 
      state.ctx.closePath(); 
      state.ctx.stroke();

      try {
        const fireRate = 100;
        const chargeTime = 30;
        const chargeStart = Math.max(0, fireRate - chargeTime);
        const st = e.shootTimer || 0;
        if (st > chargeStart) {
          const progress = Math.min(1, (st - chargeStart) / chargeTime);
          const cx = e.x, cy = e.y;
          const tx = e.x, ty = e.y - e.size/2;
          const dotX = cx + (tx - cx) * progress;
          const dotY = cy + (ty - cy) * progress;
          state.ctx.beginPath();
          state.ctx.fillStyle = `rgba(255,50,50,${0.4 + progress*0.6})`;
          const r = 3 + progress * 4;
          state.ctx.arc(dotX, dotY, r, 0, Math.PI*2);
          state.ctx.fill();
          if (progress >= 1) {
            state.ctx.beginPath();
            state.ctx.fillStyle = "rgba(255,80,80,0.6)";
            state.ctx.arc(tx, ty, 6, 0, Math.PI*2);
            state.ctx.fill();
          }
        }
      } catch (err) {}
    }
    else if (e.type === "boss") { 
      const pulse = Math.sin(state.frameCount * 0.05) * 10 + e.size/2;
      state.ctx.shadowBlur = 30;
      state.ctx.shadowColor = "yellow";
      state.ctx.fillStyle = "yellow"; 
      state.ctx.beginPath(); 
      state.ctx.arc(e.x, e.y, pulse, 0, Math.PI*2); 
      state.ctx.fill();
      state.ctx.shadowBlur = 0;

      state.ctx.strokeStyle = "rgba(255,255,0,0.5)";
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      state.ctx.arc(e.x, e.y, pulse + 10, 0, Math.PI*2);
      state.ctx.stroke();
    }
    else if (e.type === "mini-boss") { 
      const pulse = Math.sin(state.frameCount * 0.07) * 5 + e.size/2;
      state.ctx.shadowBlur = 25;
      state.ctx.shadowColor = "orange";
      state.ctx.fillStyle = "orange"; 
      state.ctx.beginPath(); 
      state.ctx.arc(e.x, e.y, pulse, 0, Math.PI * 2); 
      state.ctx.fill();
      state.ctx.shadowBlur = 0;
    }
    else if (e.type === "reflector") {
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      state.ctx.rotate(e.angle||0);

      if (e.shieldActive) {
        state.ctx.shadowBlur = 20;
        state.ctx.shadowColor = "purple";
      }
      state.ctx.fillStyle = e.shieldActive ? "rgba(138,43,226,0.8)" : "purple";
      state.ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
      state.ctx.shadowBlur = 0;

      if (e.shieldActive) {
        const shieldPulse = Math.sin(state.frameCount * 0.1) * 5 + 60;
        state.ctx.strokeStyle = `rgba(138,43,226,${0.5 + Math.sin(state.frameCount * 0.1) * 0.3})`;
        state.ctx.lineWidth = 2;
        state.ctx.beginPath();
        state.ctx.arc(0, 0, shieldPulse, 0, Math.PI*2);
        state.ctx.stroke();
      }
      state.ctx.restore();
    }
    else if (e.type === "mother-core") {
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      state.ctx.rotate(e.angle);

      const glowIntensity = Math.sin(state.frameCount * 0.05) * 0.3 + 0.7;
      state.ctx.shadowBlur = 50;
      state.ctx.shadowColor = "rgba(0,200,255,0.8)";
      state.ctx.strokeStyle = `rgba(0,150,255,${glowIntensity})`;
      state.ctx.lineWidth = 8;
      state.ctx.beginPath();
      state.ctx.moveTo(0, -e.size/2);
      state.ctx.lineTo(e.size/2, 0);
      state.ctx.lineTo(0, e.size/2);
      state.ctx.lineTo(-e.size/2, 0);
      state.ctx.closePath();
      state.ctx.fillStyle = "rgba(20,40,80,0.9)";
      state.ctx.fill();
      state.ctx.stroke();
      state.ctx.shadowBlur = 0;
      state.ctx.restore();

      e.cores.forEach(core => {
        state.ctx.save();
        state.ctx.shadowBlur = 20;
        state.ctx.shadowColor = "cyan";
        state.ctx.fillStyle = "cyan";
        state.ctx.beginPath();
        state.ctx.arc(core.x, core.y, 20, 0, Math.PI * 2);
        state.ctx.fill();
        state.ctx.shadowBlur = 0;
        state.ctx.restore();
      });

      const barWidth = e.size;
      const barHeight = 10;
      state.ctx.fillStyle = "rgba(50,50,50,0.8)";
      state.ctx.fillRect(e.x - barWidth/2, e.y - e.size/2 - 30, barWidth, barHeight);
      state.ctx.fillStyle = "red";
      state.ctx.fillRect(e.x - barWidth/2, e.y - e.size/2 - 30, barWidth * (e.health / e.maxHealth), barHeight);
    }
  });
}

export function drawTanks() {
  state.tanks.forEach(tank => {
    state.ctx.save();
    state.ctx.translate(tank.x, tank.y);

    state.ctx.fillStyle = "rgba(100,100,100,0.9)";
    state.ctx.fillRect(-tank.width/2, -tank.height/2, tank.width, tank.height);

    state.ctx.rotate(tank.turretAngle);
    state.ctx.fillStyle = "rgba(80,80,80,0.9)";
    state.ctx.fillRect(0, -5, 25, 10);

    state.ctx.restore();
  });
}

export function drawWalkers() {
  state.walkers.forEach(walker => {
    state.ctx.save();
    state.ctx.translate(walker.x, walker.y);

    state.ctx.fillStyle = "rgba(120,120,150,0.9)";
    state.ctx.fillRect(-walker.width/2, -walker.height/2, walker.width, walker.height/2);

    const legOffset = Math.sin(walker.legPhase) * 10;
    state.ctx.strokeStyle = "rgba(100,100,130,0.9)";
    state.ctx.lineWidth = 3;
    state.ctx.beginPath();
    state.ctx.moveTo(-10, walker.height/4);
    state.ctx.lineTo(-10 + legOffset, walker.height/2 + 10);
    state.ctx.stroke();

    state.ctx.beginPath();
    state.ctx.moveTo(10, walker.height/4);
    state.ctx.lineTo(10 - legOffset, walker.height/2 + 10);
    state.ctx.stroke();

    state.ctx.restore();
  });
}

export function drawMechs() {
  state.mechs.forEach(mech => {
    state.ctx.save();
    state.ctx.translate(mech.x, mech.y);

    if (mech.shieldActive) {
      const pulse = Math.sin(state.frameCount * 0.1) * 5;
      state.ctx.strokeStyle = "rgba(100,200,255,0.6)";
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, mech.size/2 + 15 + pulse, 0, Math.PI * 2);
      state.ctx.stroke();
    }

    state.ctx.fillStyle = "rgba(150,50,50,0.9)";
    state.ctx.beginPath();
    state.ctx.arc(0, 0, mech.size/2, 0, Math.PI * 2);
    state.ctx.fill();

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + state.frameCount * 0.02;
      state.ctx.fillStyle = "rgba(200,100,100,0.9)";
      state.ctx.fillRect(Math.cos(angle) * 30 - 3, Math.sin(angle) * 30 - 3, 6, 6);
    }

    state.ctx.restore();
  });
}

export function drawDebris() {
  state.debris.forEach(d => {
    const alpha = d.life / d.maxLife;
    state.ctx.save();
    state.ctx.translate(d.x, d.y);
    state.ctx.rotate(d.rotation);
    state.ctx.fillStyle = `rgba(150,150,150,${alpha})`;
    state.ctx.fillRect(-d.size/2, -d.size/2, d.size, d.size);
    state.ctx.restore();
  });
}

export function drawDiamonds() {
  state.diamonds.forEach(d => {
    state.ctx.save(); 
    state.ctx.translate(d.x, d.y); 
    state.ctx.rotate(d.angle||0);

    if (d.gravitonActive && d.gravitonCharge < 600) {
      const pullIntensity = d.gravitonCharge / 600;
      state.ctx.strokeStyle = `rgba(100,200,255,${pullIntensity * 0.5})`;
      state.ctx.lineWidth = 4;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, d.size/2 + 60 + Math.sin(state.frameCount * 0.1) * 20, 0, Math.PI * 2);
      state.ctx.stroke();

      state.ctx.strokeStyle = `rgba(150,220,255,${pullIntensity * 0.3})`;
      state.ctx.lineWidth = 2;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, d.size/2 + 30, 0, Math.PI * 2);
      state.ctx.stroke();
    }

    if (d.vulnerable) {
      const vulnPulse = Math.sin(state.frameCount * 0.2) * 0.3 + 0.7;
      state.ctx.shadowBlur = 40;
      state.ctx.shadowColor = `rgba(255,100,100,${vulnPulse})`;
    }

    const glowIntensity = Math.sin(state.frameCount * 0.05) * 0.3 + 0.7;
    state.ctx.shadowBlur = d.vulnerable ? 40 : 30;
    state.ctx.shadowColor = d.canReflect ? "cyan" : (d.vulnerable ? "red" : "white");
    state.ctx.strokeStyle = d.canReflect ? `rgba(0,255,255,${glowIntensity})` : (d.vulnerable ? `rgba(255,100,100,${glowIntensity})` : `rgba(255,255,255,${glowIntensity})`);
    state.ctx.lineWidth = 3;
    state.ctx.beginPath(); 
    state.ctx.moveTo(0, -d.size/2 - d.pulse); 
    state.ctx.lineTo(d.size/2 + d.pulse, 0); 
    state.ctx.lineTo(0, d.size/2 + d.pulse); 
    state.ctx.lineTo(-d.size/2 - d.pulse, 0); 
    state.ctx.closePath(); 
    state.ctx.stroke();
    state.ctx.shadowBlur = 0;
    state.ctx.restore();

    d.attachments.forEach(a => {
      if (a.type === "triangle") {
        state.ctx.fillStyle = "cyan";
        state.ctx.beginPath(); 
        state.ctx.moveTo(a.x, a.y-(a.size||20)/2); 
        state.ctx.lineTo(a.x-(a.size||20)/2, a.y+(a.size||20)/2); 
        state.ctx.lineTo(a.x+(a.size||20)/2, a.y+(a.size||20)/2); 
        state.ctx.closePath(); 
        state.ctx.fill();
      }
      else if (a.type === "reflector") {
        state.ctx.save(); 
        state.ctx.translate(a.x, a.y); 
        state.ctx.rotate(a.orbitAngle||0); 
        state.ctx.fillStyle = "magenta"; 
        state.ctx.fillRect(-(a.width||20)/2, -(a.height||10)/2, a.width||20, a.height||10); 
        state.ctx.restore();
      }
      else {
        state.ctx.fillStyle = "lime"; 
        state.ctx.fillRect(a.x-(a.size||20)/2, a.y-(a.size||20)/2, a.size||20, a.size||20);
      }
    });
  });
}

export function drawLightning() { 
  state.lightning.forEach(l => {
    state.ctx.shadowBlur = 8;
    state.ctx.shadowColor = "cyan";
    state.ctx.fillStyle = "cyan"; 
    state.ctx.fillRect(l.x-(l.size||6)/2, l.y-(l.size||6)/2, l.size||6, l.size||6);
    state.ctx.shadowBlur = 0;
  });
}

export function drawExplosions(){ 
  state.explosions.forEach(ex => { 
    state.ctx.fillStyle = ex.color; 
    state.ctx.beginPath(); 
    state.ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI*2); 
    state.ctx.fill();
  }); 
}

export function drawTunnels() { 
  state.tunnels.forEach(t => { 
    if (t.active) { 
      state.ctx.fillStyle = "rgba(0,255,255,0.5)"; 
      state.ctx.fillRect(t.x, t.y, t.width, t.height); 
    }
  }); 
}

// Improved drawPowerUps: ensure alpha / shadow / composite are reset and draw clearer icons.
// This change addresses "powerups are present but not visible" by forcing full opacity,
// resetting canvas state, and drawing distinct shapes per powerup type.
export function drawPowerUps() {
  state.powerUps.forEach(p => {
    state.ctx.save();
    // reset potential weird state from previous draws
    state.ctx.globalAlpha = 1;
    state.ctx.filter = 'none';
    state.ctx.globalCompositeOperation = 'source-over';

    // center transform for easier drawing
    state.ctx.translate(p.x, p.y);

    const pulse = Math.sin(state.frameCount * 0.15 + (p._seed || 0)) * 0.15 + 0.85;
    const shadowStrength = 12 * pulse;
    state.ctx.shadowBlur = shadowStrength;
    // type specific visuals
    if (p.type === "red-punch") {
      state.ctx.shadowColor = "rgba(255,80,80,0.8)";
      state.ctx.fillStyle = "rgba(220,40,40,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      // fist icon - simple rectangle + notch
      state.ctx.shadowBlur = 0;
      state.ctx.fillStyle = "white";
      state.ctx.fillRect(-4, -4, 8, 8);
      state.ctx.clearRect(-1, -6, 2, 2); // thumb notch (works with some canvases)
    }
    else if (p.type === "blue-cannon") {
      state.ctx.shadowColor = "rgba(0,200,255,0.8)";
      state.ctx.fillStyle = "rgba(0,180,220,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      state.ctx.shadowBlur = 0;
      state.ctx.fillStyle = "white";
      // small triangle cannon
      state.ctx.beginPath();
      state.ctx.moveTo(0, -6);
      state.ctx.lineTo(-6, 6);
      state.ctx.lineTo(6, 6);
      state.ctx.closePath();
      state.ctx.fill();
    }
    else if (p.type === "health") {
      state.ctx.shadowColor = "rgba(255,100,200,0.9)";
      state.ctx.fillStyle = "rgba(220,50,150,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      state.ctx.shadowBlur = 0;
      state.ctx.fillStyle = "white";
      // plus sign
      state.ctx.fillRect(-2, -6, 4, 12);
      state.ctx.fillRect(-6, -2, 12, 4);
    }
    else if (p.type === "reflect") {
      state.ctx.shadowColor = "rgba(160,100,255,0.9)";
      state.ctx.fillStyle = "rgba(140,80,220,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      state.ctx.shadowBlur = 0;
      state.ctx.strokeStyle = "cyan";
      state.ctx.lineWidth = 2;
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2 + 4, 0, Math.PI*2); 
      state.ctx.stroke();

      // small reflect icon
      state.ctx.fillStyle = "rgba(220,240,255,0.95)";
      state.ctx.fillRect(-2, -6, 4, 12);
    }
    else {
      // fallback visible placeholder when unknown type
      state.ctx.shadowColor = "rgba(255,255,255,0.8)";
      state.ctx.fillStyle = "rgba(255,255,255,0.12)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      state.ctx.shadowBlur = 0;
      state.ctx.fillStyle = "rgba(255,255,255,0.9)";
      state.ctx.font = "10px 'Orbitron', monospace";
      state.ctx.textAlign = "center";
      state.ctx.textBaseline = "middle";
      state.ctx.fillText("?", 0, 0);
    }

    // small floating label (count) if applicable
    if (typeof p.count === 'number' && p.count > 1) {
      state.ctx.shadowBlur = 6;
      state.ctx.shadowColor = "rgba(0,0,0,0.6)";
      state.ctx.fillStyle = "rgba(20,20,30,0.9)";
      state.ctx.fillRect(8, -10, 16, 12);
      state.ctx.shadowBlur = 0;
      state.ctx.fillStyle = "white";
      state.ctx.font = "10px 'Orbitron', monospace";
      state.ctx.fillText(String(p.count), 16, -4);
    }

    // restore to avoid leaking visual state
    state.ctx.shadowBlur = 0;
    state.ctx.globalAlpha = 1;
    state.ctx.restore();
  });
}

export function drawGoldStar() {
  if (!state.goldStar.alive) return;
  if (state.goldStar.collecting) {
    const progress = 1 - (state.goldStar.collectTimer / state.GOLD_STAR_PICKUP_FRAMES);
    const maxRadius = state.goldStar.size/2 + 18;
    const currentRadius = state.goldStar.size/2 + 10 + (progress * 8);
    state.ctx.strokeStyle = `rgba(255, 255, 0, ${progress})`;
    state.ctx.lineWidth = 3 * progress;
    state.ctx.beginPath(); 
    state.ctx.arc(state.goldStar.x, state.goldStar.y, currentRadius, 0, Math.PI*2); 
    state.ctx.stroke();
  }
  state.ctx.save(); 
  state.ctx.translate(state.goldStar.x, state.goldStar.y); 
  state.ctx.fillStyle = "gold";
  state.ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i*4*Math.PI)/5 - Math.PI/2;
    const radius = i%2===0 ? state.goldStar.size/2 : state.goldStar.size/4;
    const x = Math.cos(angle)*radius, y = Math.sin(angle)*radius;
    if (i === 0) state.ctx.moveTo(x,y); 
    else state.ctx.lineTo(x,y);
  }
  state.ctx.closePath(); 
  state.ctx.fill();
  state.ctx.restore();

  const barWidth = 50; 
  state.ctx.fillStyle = "gray"; 
  state.ctx.fillRect(state.goldStar.x-barWidth/2, state.goldStar.y-state.goldStar.size-10, barWidth, 5);
  state.ctx.fillStyle = "gold"; 
  state.ctx.fillRect(state.goldStar.x-barWidth/2, state.goldStar.y-state.goldStar.size-10, barWidth*(state.goldStar.health/state.goldStar.maxHealth), 5);

  if (state.goldStar.reflectAvailable) {
    state.ctx.strokeStyle = "cyan";
    state.ctx.lineWidth = 2;
    state.ctx.beginPath(); 
    state.ctx.arc(state.goldStar.x, state.goldStar.y, state.goldStar.size/2 + 14, 0, Math.PI*2); 
    state.ctx.stroke();
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

export function drawRedPunchEffects() {
  state.ctx.save();
  state.ctx.globalCompositeOperation = 'lighter';
  state.redPunchEffects.forEach(e => {
    const lifeFactor = Math.max(0, e.life / e.maxLife);
    if (e.fill) {
      state.ctx.beginPath();
      state.ctx.fillStyle = e.color;
      state.ctx.globalAlpha = lifeFactor * 0.9;
      state.ctx.arc(e.x, e.y, Math.max(2, e.r), 0, Math.PI*2);
      state.ctx.fill();
      state.ctx.globalAlpha = 1;
    } else {
      state.ctx.beginPath();
      state.ctx.strokeStyle = e.color;
      state.ctx.lineWidth = 6 * lifeFactor;
      state.ctx.arc(e.x, e.y, Math.max(2, e.r), 0, Math.PI*2);
      state.ctx.stroke();
    }
  });
  state.ctx.restore();
}

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

// Modified drawUI: removed high score, and spread out Gold Star UI content inside same-sized box
export function drawUI() {
  const pad = 12;
  const hudW = 260;
  const hudH = 84;
  const x = pad;
  const y = pad;

  state.ctx.save();
  state.ctx.globalCompositeOperation = 'source-over';
  state.ctx.shadowColor = "rgba(0,255,255,0.08)";
  state.ctx.shadowBlur = 18;
  state.ctx.fillStyle = "rgba(10,14,20,0.6)";
  roundRect(state.ctx, x, y, hudW, hudH, 10);
  state.ctx.fill();
  state.ctx.restore();

  state.ctx.save();
  state.ctx.strokeStyle = "rgba(0,255,255,0.12)";
  state.ctx.lineWidth = 1;
  roundRect(state.ctx, x+0.5, y+0.5, hudW-1, hudH-1, 10);
  state.ctx.stroke();
  state.ctx.restore();

  state.ctx.font = "12px 'Orbitron', monospace";
  state.ctx.textBaseline = "top";

  const hbX = x + 12, hbY = y + 10, hbW = hudW - 24, hbH = 10;
  state.ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(state.ctx, hbX, hbY, hbW, hbH, 6);
  state.ctx.fill();

  const healthRatio = Math.max(0, state.player.health / state.player.maxHealth);
  const grad = state.ctx.createLinearGradient(hbX, hbY, hbX+hbW, hbY);
  grad.addColorStop(0, "rgba(0,255,180,0.95)");
  grad.addColorStop(0.5, "rgba(0,200,255,0.95)");
  grad.addColorStop(1, "rgba(100,50,255,0.95)");

  state.ctx.save();
  state.ctx.shadowColor = "rgba(0,200,255,0.15)";
  state.ctx.shadowBlur = 8;
  state.ctx.fillStyle = grad;
  roundRect(state.ctx, hbX+1, hbY+1, (hbW-2) * healthRatio, hbH-2, 6);
  state.ctx.fill();
  state.ctx.restore();

  state.ctx.fillStyle = "rgba(220,230,255,0.95)";
  state.ctx.font = "11px 'Orbitron', monospace";
  state.ctx.fillText(`HP ${Math.floor(state.player.health)}/${state.player.maxHealth}`, hbX + 6, hbY - 14);

  state.ctx.fillStyle = "rgba(200,220,255,0.95)";
  state.ctx.font = "12px 'Orbitron', monospace";
  state.ctx.fillText(`SCORE: ${state.score}`, hbX, hbY + hbH + 10);
  // Removed high score from UI per request:
  // state.ctx.fillText(`BEST: ${state.highScore}`, hbX + 100, hbY + hbH + 10);
  state.ctx.fillText(`WAVE: ${state.wave+1}`, hbX + 180, hbY + hbH + 10);

  const livesX = x + hudW - 12 - 18;
  const livesY = y + 12;
  for (let i = 0; i < 5; i++) {
    const cx = livesX - i * 14;
    state.ctx.beginPath();
    state.ctx.arc(cx, livesY, 5, 0, Math.PI*2);
    if (i < state.player.lives) {
      state.ctx.fillStyle = "rgba(255,120,80,0.98)";
      state.ctx.shadowColor = "rgba(255,80,40,0.35)";
      state.ctx.shadowBlur = 6;
      state.ctx.fill();
      state.ctx.shadowBlur = 0;
    } else {
      state.ctx.fillStyle = "rgba(255,255,255,0.06)";
      state.ctx.fill();
    }
    state.ctx.closePath();
  }
  state.ctx.fillStyle = "rgba(180,200,255,0.8)";
  state.ctx.font = "10px 'Orbitron', monospace";
  state.ctx.fillText("LIVES", livesX - 3*14, livesY + 10);

  const badgeX = x + hudW - 62, badgeY = y + hudH - 26;
  roundRect(state.ctx, badgeX, badgeY, 50, 16, 6);
  state.ctx.fillStyle = state.player.reflectAvailable ? "rgba(0,220,255,0.08)" : "rgba(255,255,255,0.03)";
  state.ctx.fill();
  state.ctx.strokeStyle = state.player.reflectAvailable ? "rgba(0,220,255,0.35)" : "rgba(255,255,255,0.04)";
  state.ctx.lineWidth = 1;
  roundRect(state.ctx, badgeX + 0.5, badgeY + 0.5, 49, 15, 6);
  state.ctx.stroke();

  state.ctx.fillStyle = state.player.reflectAvailable ? "rgba(0,220,255,0.95)" : "rgba(180,200,255,0.35)";
  state.ctx.font = "11px 'Orbitron', monospace";
  state.ctx.fillText("REFLECT", badgeX + 6, badgeY + 2);

  // Gold Star panel (same sized box, but reflowed content)
  const gsX = x + hudW + 12;
  const gsY = y + 8;
  const gsW = 150;
  const gsH = 56;

  state.ctx.save();
  state.ctx.fillStyle = "rgba(10,14,20,0.5)";
  roundRect(state.ctx, gsX, gsY, gsW, gsH, 8);
  state.ctx.fill();
  state.ctx.strokeStyle = "rgba(100,120,255,0.06)";
  state.ctx.stroke();
  state.ctx.restore();

  // Row 1: Title (left) and Aura level (right)
  state.ctx.fillStyle = state.goldStar.alive ? "rgba(255,210,90,0.98)" : "rgba(255,100,100,0.9)";
  state.ctx.font = "12px 'Orbitron', monospace";
  state.ctx.fillText("GOLD STAR", gsX + 10, gsY + 6);

  state.ctx.font = "10px 'Orbitron', monospace";
  state.ctx.fillStyle = "rgba(190,210,255,0.9)";
  const auraLabel = `Aura Lv ${state.goldStarAura.level}`;
  // right-align the aura label in the panel
  const auraLabelX = gsX + gsW - 10 - (state.ctx.measureText ? state.ctx.measureText(auraLabel).width : 40);
  state.ctx.fillText(auraLabel, auraLabelX, gsY + 6);

  // Row 2: Aura bar (centered across)
  const alX = gsX + 10;
  const alY = gsY + 22;
  const barW = gsW - 20;
  const barH = 8;
  state.ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(state.ctx, alX, alY, barW, barH, 6);
  state.ctx.fill();

  const fillRatio = Math.min(1, state.goldStarAura.level / 5);
  const auraGrad = state.ctx.createLinearGradient(alX, alY, alX + barW, alY);
  auraGrad.addColorStop(0, "rgba(255,220,100,0.9)");
  auraGrad.addColorStop(1, "rgba(255,100,40,0.9)");

  state.ctx.fillStyle = auraGrad;
  roundRect(state.ctx, alX + 1, alY + 1, (barW - 2) * fillRatio, barH - 2, 5);
  state.ctx.fill();

  // R: radius label to the right of the bar
  state.ctx.fillStyle = "rgba(180,200,255,0.75)";
  state.ctx.font = "10px 'Orbitron', monospace";
  state.ctx.fillText(`R: ${Math.floor(state.goldStarAura.radius)}`, alX + barW - 38, alY - 12);

  // Row 3: Power-up icons + counts (spaced across)
  const iconsY = gsY + 36;
  let iconX = gsX + 10;
  const iconSpacing = 44;

  // Red punch
  if (state.goldStar.redPunchLevel > 0) {
    state.ctx.fillStyle = "red";
    state.ctx.fillRect(iconX, iconsY, 12, 12);
    state.ctx.fillStyle = "rgba(220,230,255,0.95)";
    state.ctx.font = "10px 'Orbitron', monospace";
    state.ctx.fillText(state.goldStar.redPunchLevel.toString(), iconX + 16, iconsY + 0);
    iconX += iconSpacing;
  }

  // Blue cannon
  if (state.goldStar.blueCannonLevel > 0) {
    state.ctx.fillStyle = "cyan";
    state.ctx.beginPath();
    // draw a small triangle cannon icon
    state.ctx.moveTo(iconX + 6, iconsY);
    state.ctx.lineTo(iconX, iconsY + 12);
    state.ctx.lineTo(iconX + 12, iconsY + 12);
    state.ctx.closePath();
    state.ctx.fill();
    state.ctx.fillStyle = "rgba(220,230,255,0.95)";
    state.ctx.font = "10px 'Orbitron', monospace";
    state.ctx.fillText(state.goldStar.blueCannonLevel.toString(), iconX + 16, iconsY + 0);
    iconX += iconSpacing;
  }
  // If no powerups present, show a dim placeholder
  if (state.goldStar.redPunchLevel === 0 && state.goldStar.blueCannonLevel === 0) {
    state.ctx.fillStyle = "rgba(255,255,255,0.06)";
    state.ctx.font = "10px 'Orbitron', monospace";
    state.ctx.fillText("No power-ups", gsX + 10, iconsY + 0);
  }

  if (state.waveTransition) {
    const bannerW = 320, bannerH = 48;
    const bx = (state.canvas.width - bannerW) / 2;
    const by = 22;
    state.ctx.save();
    state.ctx.fillStyle = "rgba(5,6,10,0.75)";
    roundRect(state.ctx, bx, by, bannerW, bannerH, 10);
    state.ctx.fill();

    state.ctx.strokeStyle = "rgba(0,200,255,0.14)";
    state.ctx.lineWidth = 1;
    roundRect(state.ctx, bx + 0.5, by + 0.5, bannerW - 1, bannerH - 1, 10);
    state.ctx.stroke();

    state.ctx.fillStyle = "rgba(200,230,255,0.96)";
    state.ctx.font = "14px 'Orbitron', monospace";
    state.ctx.fillText("WAVE CLEARED", bx + 18, by + 8);
    const timeRemaining = Math.ceil((state.WAVE_BREAK_MS - state.waveTransitionTimer * (1000/60)) / 1000);
    state.ctx.fillStyle = "rgba(160,200,255,0.86)";
    state.ctx.font = "12px 'Orbitron', monospace";
    state.ctx.fillText(`Next in ${timeRemaining}s`, bx + 18, by + 28);
    state.ctx.restore();
  }
}

export function updateAndDrawReflectionEffects() {
  for (let i = state.reflectionEffects.length - 1; i >= 0; i--) {
    const r = state.reflectionEffects[i];
    r.life--;
    state.ctx.save();
    state.ctx.globalCompositeOperation = 'lighter';
    state.ctx.fillStyle = "rgba(180,240,255," + (r.life / (r.maxLife || 20)) + ")";
    state.ctx.beginPath();
    state.ctx.arc(r.x, r.y, Math.max(1, r.life / 3), 0, Math.PI*2);
    state.ctx.fill();
    state.ctx.restore();
    if (r.life <= 0) state.reflectionEffects.splice(i, 1);
  }
}

export function drawBackground(waveNum) {
  if (waveNum >= 12 && waveNum <= 21) {
    if (waveNum === 12) {
      const grad = state.ctx.createLinearGradient(0, 0, 0, state.canvas.height);
      grad.addColorStop(0, "#1a0a0a");
      grad.addColorStop(0.5, "#4a1a0a");
      grad.addColorStop(1, "#8a3a1a");
      state.ctx.fillStyle = grad;
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

      for (let i = 0; i < 30; i++) {
        const x = Math.random() * state.canvas.width;
        const y = (state.frameCount * 3 + i * 50) % state.canvas.height;
        state.ctx.fillStyle = `rgba(255,${100 + Math.random() * 100},0,${Math.random() * 0.5})`;
        state.ctx.fillRect(x, y, 3, 10);
      }
    } else if (waveNum === 13) {
      state.ctx.fillStyle = "#6a8a9a";
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      drawClouds();
    } else if (waveNum >= 14 && waveNum <= 19) {
      const grad = state.ctx.createLinearGradient(0, 0, 0, state.canvas.height);
      grad.addColorStop(0, "#2a2a3a");
      grad.addColorStop(1, "#4a3a2a");
      state.ctx.fillStyle = grad;
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      drawCityBackground();
    } else if (waveNum >= 20) {
      state.ctx.fillStyle = "#0a0a1a";
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      if (state.frameCount % 60 < 3) {
        state.ctx.fillStyle = `rgba(255,255,255,${(3 - state.frameCount % 60) / 3 * 0.3})`;
        state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
      }
    }
  } else {
    state.ctx.fillStyle = "#00142b";
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

    for (let i = 0; i < 80; i++) {
      const seed = (i * 97 + (i % 7) * 13);
      const x = (seed + state.backgroundOffset * (0.2 + (i % 5) * 0.02)) % state.canvas.width;
      const y = (i * 89 + Math.sin(state.frameCount * 0.01 + i) * 20) % state.canvas.height;
      const alpha = 0.3 + (i % 3) * 0.15;
      state.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      state.ctx.fillRect(x, y, 2, 2);
    }

    state.ctx.strokeStyle = "rgba(200,240,255,0.03)";
    state.ctx.lineWidth = 1;
    for (let r = 1; r <= 3; r++) {
      state.ctx.beginPath();
      const radius = (Math.min(state.canvas.width, state.canvas.height) / 2) * (0.5 + r * 0.12 + Math.sin(state.frameCount * 0.005 + r) * 0.01);
      state.ctx.arc(state.canvas.width / 2, state.canvas.height * 0.25, radius, 0, Math.PI * 2);
      state.ctx.stroke();
    }

    const earthBaseY = state.canvas.height * 0.9;
    const progressFactor = Math.min(1, Math.max(0, state.wave / 10));
    const earthRadius = 120 + progressFactor * 90;
    const earthX = state.canvas.width / 2;
    const earthY = earthBaseY;
    const eg = state.ctx.createRadialGradient(earthX, earthY, earthRadius * 0.1, earthX, earthY, earthRadius);
    eg.addColorStop(0, "#2b6f2b");
    eg.addColorStop(0.6, "#144f8a");
    eg.addColorStop(1, "#071325");
    state.ctx.fillStyle = eg;
    state.ctx.beginPath();
    state.ctx.arc(earthX, earthY, earthRadius, Math.PI, 2 * Math.PI);
    state.ctx.lineTo(state.canvas.width, state.canvas.height);
    state.ctx.lineTo(0, state.canvas.height);
    state.ctx.closePath();
    state.ctx.fill();

    state.ctx.globalAlpha = 0.08 + progressFactor * 0.12;
    state.ctx.fillStyle = "rgba(100,180,255,0.6)";
    state.ctx.beginPath();
    state.ctx.arc(earthX, earthY - 10, earthRadius + 30, Math.PI, 2 * Math.PI);
    state.ctx.fill();
    state.ctx.globalAlpha = 1;
  }

  state.incrementBackgroundOffset(0.5);
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
export function drawPlanetBackground() {
  const ctx = state.ctx;
  const { width, height, wave } = state;
  if (wave < 5) return;

  const planetSize = Math.min(width, height) * (0.5 + Math.min((wave - 5) * 0.1, 1.5));
  const planetX = width / 2;
  const planetY = height * (0.7 + Math.sin(state.time / 5000) * 0.01);

  planetLayers.forEach((layer) => {
    const offset = Math.sin(state.time * layer.speed * 0.001) * 10;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.arc(planetX + offset, planetY, planetSize * layer.scale, 0, Math.PI * 2);
    ctx.fill();
  });

  const pixelCount = 60 + wave * 2;
  for (let i = 0; i < pixelCount; i++) {
    const px = planetX + (Math.random() - 0.5) * planetSize;
    const py = planetY + (Math.random() - 0.5) * planetSize * 0.5;
    ctx.fillStyle = `rgba(${80 + Math.random() * 50},${80 + Math.random() * 50},${80 + Math.random() * 50},0.3)`;
    ctx.fillRect(px, py, 2, 2);
  }
}

// ----------------------
// Re-entry visual effects
// ----------------------
export function drawReentryEffects() {
  const ctx = state.ctx;
  const { width, height, wave } = state;
  if (wave < 12) return;

  const intensity = Math.min((wave - 11) / 2, 1);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgba(255, 100, 0, ${0.1 * intensity})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, 0.7)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 40 * intensity; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.strokeStyle = `rgba(255,${120 + Math.random() * 80},0,${Math.random() * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, y + 20 + Math.random() * 30);
    ctx.stroke();
  }
}

// ----------------------
// Mech → Dropship visuals
// ----------------------
export function drawDropship(mech) {
  const ctx = state.ctx;
  const size = mech.size || 40;
  const x = mech.x, y = mech.y;

  ctx.fillStyle = '#222';
  ctx.fillRect(x - size/2, y - size/3, size, size/2);

  ctx.fillStyle = '#555';
  ctx.fillRect(x - size/3, y - size/2, size/1.5, size/3);

  ctx.fillStyle = '#00aaff';
  ctx.fillRect(x - size/4, y - size/2.2, size/2, size/5);

  ctx.fillStyle = `rgba(255,120,0,${0.3 + Math.random() * 0.5})`;
  ctx.beginPath();
  ctx.arc(x, y + size/2, size/4, 0, Math.PI);
  ctx.fill();

  if (mech.deploying) {
    ctx.fillStyle = '#888';
    ctx.fillRect(x - 10, y + size/2, 20, 10);
  }
}

// ----------------------
// Tunnel collision effects
// ----------------------
export function triggerTunnelCollision(x, y) {
  tunnelCollisions.push({ x, y, life: 20 });
}

export function drawTunnelCollisions() {
  const ctx = state.ctx;
  tunnelCollisions = tunnelCollisions.filter(c => c.life-- > 0);

  tunnelCollisions.forEach(c => {
    const alpha = c.life / 20;
    ctx.strokeStyle = `rgba(255,255,200,${alpha})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10 + (20 - c.life), 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,100,0,${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}
