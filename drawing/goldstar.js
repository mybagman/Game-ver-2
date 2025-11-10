import * as state from '../state.js';

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
