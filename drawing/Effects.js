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
