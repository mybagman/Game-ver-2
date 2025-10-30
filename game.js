// drawing.js

// Draw a three-layer parallax cloud field (existing function)
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
    });
  });
}

// New: high-level background drawing function expected by game.js
// It clears or fills the canvas with a sky gradient and then draws clouds.
export function drawBackground() {
  const ctx = state.ctx;
  const w = state.canvas.width;
  const h = state.canvas.height;
  
  // Sky gradient (top to horizon)
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#87CEFA'); // light sky blue
  g.addColorStop(0.6, '#BFE9FF'); // lighter near horizon
  g.addColorStop(1, '#F6FDFF'); // very light at bottom
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  
  // Draw clouds on top
  if (Array.isArray(state.cloudParticles) && state.cloudParticles.length > 0) {
    drawClouds();
  }
}
