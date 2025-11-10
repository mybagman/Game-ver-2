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

