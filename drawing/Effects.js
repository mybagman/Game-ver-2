import * as state from '../state.js';

let tunnelCollisions = [];

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

export function drawTunnels() { 
  state.tunnels.forEach(t => { 
    if (t.active) { 
      state.ctx.fillStyle = "rgba(0,255,255,0.5)"; 
      state.ctx.fillRect(t.x, t.y, t.width, t.height); 
    }
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

export function drawReentryEffects() {
  const ctx = state.ctx;
  const { width, height, wave, frameCount } = state;
  if (wave < 12) return;

  const intensity = Math.min((wave - 11) / 2, 1);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgba(255, 100, 0, ${0.1 * intensity})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, 0.7)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Reduced from 40*intensity to 15*intensity particles
  const particleCount = Math.floor(15 * intensity);
  for (let i = 0; i < particleCount; i++) {
    // Use deterministic positions based on particle index and frameCount
    const x = ((i * 127 + frameCount * 2) % width);
    const y = ((i * 83 + frameCount * 3) % height);
    const colorVar = ((i * 53) % 80);
    const alphaVar = ((i * 17) % 60) / 100;
    ctx.strokeStyle = `rgba(255,${120 + colorVar},0,${alphaVar})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const endX = x + ((i % 2 === 0 ? 1 : -1) * 3);
    const endY = y + 20 + ((i * 7) % 30);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

export function drawExplosions(){ 
  state.explosions.forEach(ex => { 
    state.ctx.fillStyle = ex.color; 
    state.ctx.beginPath(); 
    state.ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI*2); 
    state.ctx.fill();
  }); 
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

export function triggerTunnelCollision(x, y) {
  // push a new collision with full life
  tunnelCollisions.push({ x, y, life: 20, maxLife: 20 });
}

export function drawTunnelCollisions() {
  const ctx = state.ctx;

  // iterate backwards to handle splice safely
  for (let i = tunnelCollisions.length - 1; i >= 0; i--) {
    const c = tunnelCollisions[i];
    // draw using current life
    const alpha = (c.life / c.maxLife);
    ctx.strokeStyle = `rgba(255,255,200,${alpha})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10 + (c.maxLife - c.life), 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,100,0,${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // decrement life and remove if expired
    c.life--;
    if (c.life <= 0) tunnelCollisions.splice(i, 1);
  }
}
