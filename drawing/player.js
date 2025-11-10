import * as state from '../state.js';

// New 8-bit style player sprite drawing with rotation
function drawPlayer8Bit(ctx, player) {
  // Pixel-art 'canvas' is 9 x 9 logical pixels; scale with player.size
  const grid = [
    "001010100", // nose tip
    "011111110", // upper angled wings
    "111111111", // full hull
    "111121111", // cockpit center
    "011131110", // lower angled wings with accents
    "001111100", // fuselage taper
    "001101100", // tail stabilizers
    "010000010", // dual thruster base
    "010010010"  // exhaust glow
  ];
  
  const hullColor = player.hullColor || "#88ff88";
  const accentColor = player.accentColor || "#00e0ff";
  const cockpitColor = player.cockpitColor || "#ffffff";
  const exhaustColor = player.exhaustColor || "rgba(255,120,40,0.9)";

  const size = player.size || 24;
  const pixels = grid.length;
  const px = Math.max(1, Math.floor(size / pixels));
  const totalPixelSize = px * pixels;
  const remainder = Math.max(0, size - totalPixelSize);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  
  // Apply rotation transformation
  ctx.translate(player.x, player.y);
  ctx.rotate(player.rotation + Math.PI / 2); // +90 degrees because sprite points up by default
  ctx.translate(-player.x, -player.y);
  
  // Center offset so sprite matches player.x,y center
  const offsetX = Math.round(player.x - (totalPixelSize + remainder) / 2);
  const offsetY = Math.round(player.y - (totalPixelSize + remainder) / 2);

  ctx.fillStyle = hullColor;

  for (let gy = 0; gy < pixels; gy++) {
    const row = grid[gy];
    for (let gx = 0; gx < row.length; gx++) {
      const v = row[gx];
      if (v === "0") continue;
      
      let color = hullColor;
      // cockpit center
      if (gy >= 2 && gy <= 3 && gx >= 3 && gx <= 5) color = cockpitColor;
      // accent on wing tips
      if (gx === 0 || gx === row.length - 1) color = accentColor;
      // tail/exhaust rows
      if (gy === 8) color = exhaustColor;
      
      ctx.fillStyle = color;
      const drawX = offsetX + gx * px + Math.floor(remainder / 2);
      const drawY = offsetY + gy * px + Math.floor(remainder / 2);
      ctx.fillRect(Math.round(drawX), Math.round(drawY), px, px);
    }
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

  // Draw thruster particles BEFORE the ship so they appear behind
  drawThrusterParticles(state.ctx, state.player);

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
