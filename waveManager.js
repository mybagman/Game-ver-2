import * as state from './state.js';
import { waves } from './waves.js';
import * as spawns from './utils.js';

const spawnHandlers = {
  "red-square": (g) => spawns.spawnRedSquares(g.count || 1),
  "triangle": (g) => spawns.spawnTriangles(g.count || 1),
  "reflector": (g) => spawns.spawnReflectors(g.count || 1),
  "tank": (g) => spawns.spawnTank(g.count || 1),
  "walker": (g) => spawns.spawnWalker(g.count || 1),
  "mech": (g) => spawns.spawnMech(g.count || 1),
  "boss": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnBoss();
  },
  "mini-boss": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnMiniBoss();
  },
  "diamond": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnDiamondEnemy();
  },
  "mother-core": (g) => {
    const c = g.count || 1;
    for (let i = 0; i < c; i++) spawns.spawnMotherCore();
  }
};

export function spawnWave(waveIndex) {
  console.log('[spawnWave] called with waveIndex:', waveIndex);
  if (waveIndex < 0 || waveIndex >= waves.length) {
    console.warn('[spawnWave] invalid waveIndex:', waveIndex, 'waves.length:', waves.length);
    return;
  }

  const waveData = waves[waveIndex];
  console.log('[spawnWave] spawning wave', waveIndex, waveData);

  if (waveData.theme === "cloud-combat" || waveData.clouds) {
    spawns.spawnCloudParticles(50);
  }

  if (waveData.tunnel) spawns.spawnTunnel();

  if (waveData.enemies && Array.isArray(waveData.enemies)) {
    waveData.enemies.forEach(group => {
      if (!group || !group.type) {
        console.warn('[spawnWave] skipping invalid group:', group);
        return;
      }

      const handler = spawnHandlers[group.type];

      if (handler) {
        try {
          handler(group);
          console.log('[spawnWave] spawned', group.type, 'count:', group.count);
        } catch (err) {
          console.error('[spawnWave] error while spawning group', group, err);
        }
      } else {
        console.warn('[spawnWave] no spawn handler for type:', group.type);
      }
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