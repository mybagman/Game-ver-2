import * as state from '../state.js';

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
export function drawPlanetBackground(wave) {
  // Accept wave argument (from drawAll) or fallback to state.wave
  const currentWave = (typeof wave === 'number') ? wave : state.wave;

  // don't draw planet until a later wave
  if (currentWave < 5) return;

  const ctx = state.ctx;
  const { width, height } = state;

  // prefer state.time, but fall back to frameCount-based time (millis approx)
  const time = (typeof state.time === 'number') ? state.time : (state.frameCount * (1000/60));

  const planetSize = Math.min(width, height) * (0.5 + Math.min((currentWave - 5) * 0.1, 1.5));
  const planetX = width / 2;
  const planetY = height * (0.7 + Math.sin(time / 5000) * 0.01);

  planetLayers.forEach((layer) => {
    const offset = Math.sin(time * layer.speed * 0.001) * 10;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.arc(planetX + offset, planetY, planetSize * layer.scale, 0, Math.PI * 2);
    ctx.fill();
  });

  const pixelCount = 60 + currentWave * 2;
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
