import { loadHighScores, ensureCanvas, gameLoop } from './game.js';
import { respawnPlayer, respawnGoldStar } from './utils.js';
import { spawnWave } from './waveManager.js';
import { setupInputHandlers } from './input.js';

window.addEventListener("load", () => {
  loadHighScores();
  ensureCanvas();
  respawnPlayer();
  respawnGoldStar();
  spawnWave(0);
  setupInputHandlers();
  requestAnimationFrame(gameLoop);
});
