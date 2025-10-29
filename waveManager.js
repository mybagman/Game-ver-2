import * as state from './state.js';
import { waves } from './waves.js';
import * as spawns from './utils.js';

/*
  Rewritten spawnWave to map wave group types -> spawn handlers.
  This centralizes spawn logic and makes it easy to add new spawn types
  in waves.js without expanding a big if/else chain.
*/

const spawnHandlers = {
  // plural spawns that accept a count
  "red-square": (g) => spawns.spawnRedSquares(g.count || 1),
  "triangle": (g) => spawns.spawnTriangles(g.count || 1),
  "reflector": (g) => spawns.spawnReflectors(g.count || 1),
  "tank": (g) => spawns.spawnTank(g.count || 1),
  "walker": (g) => spawns.spawnWalker(g.count || 1),
  "mech": (g) => spawns.spawnMech(g.count || 1),

  // singular spawns (support count to spawn multiple)
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

/*
  spawnWave(waveIndex)
  - validates wave index
  - creates cloud particles / tunnels when requested
  - iterates groups and dispatches to handlers (or warns when unknown)
*/
export function spawnWave(waveIndex) {
  console.log('[spawnWave] called with waveIndex:', waveIndex);
  if (waveIndex < 0 || waveIndex >= waves.length) {
    console.warn('[spawnWave] invalid waveIndex:', waveIndex, 'waves.length:', waves.length);
    return;
  }

  const waveData = waves[waveIndex];
  console.log('[spawnWave] spawning wave', waveIndex, waveData);

  // optional visual / environmental effects
  if (waveData.theme === "cloud-combat" || waveData.clouds) {
    // default particle amount; waves can override by setting clouds: false/true
    spawns.spawnCloudParticles(50);
  }

  if (waveData.tunnel) spawns.spawnTunnel();

  // spawn enemy groups (if any)
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
        } catch (err) {
          console.error('[spawnWave] error while spawning group', group, err);
        }
      } else {
        // Unknown spawn type: allow waves to specify custom spawn function name
        // e.g. group.type === 'spawnCustomThing' and utils exports spawnCustomThing
        const dynamicName = 'spawn' + group.type.split('-').map((s, i) => {
          if (i === 0) return s;
          return s.charAt(0).toUpperCase() + s.slice(1);
        }).join('');
        if (typeof spawns[dynamicName] === 'function') {
          try {
            // call with count if present, else pass group
            if (group.count !== undefined) spawns[dynamicName](group.count);
            else spawns[dynamicName](group);
          } catch (err) {
            console.error('[spawnWave] dynamic spawn function threw for', dynamicName, group, err);
          }
        } else {
          console.warn('[spawnWave] no spawn handler for type:', group.type, 'expected handler or utils.' + dynamicName);
        }
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
        // spawnWave expects the next wave index stored in state.wave
        spawnWave(state.wave);

        // small cinematic repositioning for early waves
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
