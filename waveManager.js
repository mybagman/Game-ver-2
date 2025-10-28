import * as state from './state.js';
import { waves } from './waves.js';
import { 
  spawnRedSquares, 
  spawnTriangles, 
  spawnReflectors, 
  spawnBoss, 
  spawnMiniBoss, 
  spawnDiamondEnemy,
  spawnTank,
  spawnWalker,
  spawnMech,
  spawnMotherCore,
  spawnTunnel,
  spawnCloudParticles
} from './utils.js';

export function spawnWave(waveIndex) {
  if (waveIndex < 0 || waveIndex >= waves.length) return;
  const waveData = waves[waveIndex];

  if (waveData.theme === "cloud-combat" || waveData.clouds) {
    spawnCloudParticles(50);
  }

  if (waveData.tunnel) spawnTunnel();
  if (waveData.enemies) {
    waveData.enemies.forEach(group => {
      if (group.type === "red-square") spawnRedSquares(group.count);
      else if (group.type === "triangle") spawnTriangles(group.count);
      else if (group.type === "reflector") spawnReflectors(group.count);
      else if (group.type === "boss") for (let i = 0; i < group.count; i++) spawnBoss();
      else if (group.type === "mini-boss") for (let i = 0; i < group.count; i++) spawnMiniBoss();
      else if (group.type === "diamond") for (let i = 0; i < group.count; i++) spawnDiamondEnemy();
      else if (group.type === "tank") spawnTank(group.count);
      else if (group.type === "walker") spawnWalker(group.count);
      else if (group.type === "mech") spawnMech(group.count);
      else if (group.type === "mother-core") spawnMotherCore();
    });
  }
}

export function tryAdvanceWave() {
  const allEnemiesClear = state.enemies.length === 0 && state.diamonds.length === 0 && state.tunnels.length === 0 && 
                          state.tanks.length === 0 && state.walkers.length === 0 && state.mechs.length === 0;

  if (allEnemiesClear && !state.waveTransition) {
    state.clearBullets();
    state.clearLightning();

    if (state.wave >= waves.length-1) { 
      state.setWaveTransition(true);
      state.setWaveTransitionTimer(0);
      return; 
    }
    state.setWaveTransition(true);
    state.setWaveTransitionTimer(0);
  }

  if (state.waveTransition) {
    state.incrementWaveTransitionTimer();
    if (state.waveTransitionTimer >= state.WAVE_BREAK_MS / (1000/60)) {
      state.incrementWave();
      if (state.wave < waves.length) {
        spawnWave(state.wave);

        if (state.wave <= 10) {
          const earthY = state.canvas.height * 0.85;
          state.player.y += (earthY - state.player.y) * 0.15;
          state.player.x += (state.canvas.width/2 - state.player.x) * 0.06;
        }
      }
      state.setWaveTransition(false);
      state.setWaveTransitionTimer(0);
    }
  }
}
