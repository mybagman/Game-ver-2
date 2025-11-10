import * as state from '../state.js';

// New 8-bit style player sprite drawing
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
    "010010010"  // exhaust glow for l
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

  // Patch: ensure pixel scale is at least 1 so tiny players still draw
  // Replace the px/remainder/offset section inside drawPlayer8Bit with the following:

  const size = player.size || 24;
  const pixels = grid.length;
  // ensure we always have at least 1 device pixel per 'logical pixel'
  const px = Math.max(1, Math.floor(size / pixels)); // integer pixel scale, never 0
  const totalPixelSize = px * pixels;
  const remainder = Math.max(0, size - totalPixelSize);
  // center offset so sprite matches player.x,y center
  const offsetX = Math.round(player.x - (totalPixelSize + remainder) / 2);
  const offsetY = Math.round(player.y - (totalPixelSize + remainder) / 2);

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
