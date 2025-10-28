import * as state from './state.js';

export function createExplosion(x,y,color="red"){ 
  for (let i=0;i<20;i++) state.pushExplosion({x, y, dx:(Math.random()-0.5)*6, dy:(Math.random()-0.5)*6, radius:Math.random()*4+2, color, life:30}); 
}

export function spawnPowerUp(x, y, type) {
  state.pushPowerUp({x, y, type, size: 18, lifetime: 600, active: true});
}

export function spawnTunnel() {
  const h = state.canvas.height/3, w = 600;
  state.pushTunnel({x: state.canvas.width, y: 0, width: w, height: h, speed: 2, active: true});
  state.pushTunnel({x: state.canvas.width, y: state.canvas.height-h, width: w, height: h, speed: 2, active: true});
}

export function spawnCloudParticles(count = 50) {
  for (let i = 0; i < count; i++) {
    state.pushCloudParticle({
      x: Math.random() * state.canvas.width,
      y: Math.random() * state.canvas.height,
      size: Math.random() * 60 + 20,
      opacity: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.2
    });
  }
}

export function spawnDebris(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    state.pushDebris({
      x: x,
      y: y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      size: Math.random() * 8 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      life: 60 + Math.random() * 40,
      maxLife: 60 + Math.random() * 40
    });
  }
}

export function getSafeSpawnPosition(minDist = state.MIN_SPAWN_DIST) {
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * state.canvas.width;
    const y = Math.random() * state.canvas.height;
    const dxP = x - state.player.x, dyP = y - state.player.y;
    const dxG = x - state.goldStar.x, dyG = y - state.
