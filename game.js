import * as state from './state.js';
import { updatePlayerMovement, handleShooting, updateBullets, updatePowerUps, updateTunnels, updateExplosions, updateRedPunchEffects, updateDebris, updateCloudParticles } from './updates.js';
import { updateEnemies } from './enemies.js';
import { updateLightning, checkBulletCollisions } from './collisions.js';
import { updateGoldStar } from './goldstar.js';
import { updateGoldStarAura } from './aura.js';
import { tryAdvanceWave, spawnWave } from './waveManager.js';
/* patched imports: consolidated drawing helpers from drawing.js */
import {
  drawBackground,
  drawPlanetBackground,
  drawReentryEffects,
  drawClouds,
  drawBullets,
  drawEnemies,
  drawTunnels,
  drawTunnelCollisions,
  drawGoldStarAura,
  drawGoldStar,
  drawUI,
  drawDropship,
  drawTanks,
  drawWalkers,
  drawMechs,
  drawDebris,
  drawDiamonds,
  drawLightning,
  drawExplosions,
  updateAndDrawReflectionEffects,
  // newly added to match drawing.js exports used by game.js:
  drawPowerUps,
  drawRedPunchEffects,
  drawPlayer,
  // drawAll could be used instead of calling all draws individually if desired:
  drawAll
} from './drawing.js';

import { respawnPlayer, respawnGoldStar } from './utils.js';
import { resetAuraOnDeath } from './aura.js';

// --- Game loop and integration with high-score UI ---

export function gameLoop(now) {
  if (state.cinematic.playing) return;

  state.incrementFrameCount();

  updatePlayerMovement();
  handleShooting();
  updateBullets();
  updateLightning();
  updateExplosions();
  updatePowerUps();
  updateTunnels();
  updateRedPunchEffects();
  updateGoldStarAura();
  updateGoldStar();
  updateEnemies();
  updateDebris();
  updateCloudParticles();
  checkBulletCollisions();
  tryAdvanceWave();

  // Player death handling
  if (state.player.health <= 0) {
    state.player.lives--;
    if (state.player.lives > 0) {
      respawnPlayer();
    } else {
      // set game over via setter if available
      if (typeof state.setGameOver === 'function') {
        state.setGameOver(true);
      } else {
        state.gameOver = true;
      }

      // Save/record high scores
      saveHighScoresOnGameOver();
      // Show the game over UI overlay
      showGameOverUI();
    }
  }

  if (!ensureCanvas()) return;
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

  // Use the new renderFrame sequence (order matters)
  renderFrame();

  // Some effects / overlays that were previously drawn after main scene:
  // draw any red punch effects (screen flash / hit indicators)
  if (typeof drawRedPunchEffects === 'function') {
    drawRedPunchEffects();
  } else {
    // fallback to existing update-based draw if drawing function isn't provided
    // (original code used drawRedPunchEffects(); here we attempt to call it if available)
    try {
      // no-op if not present
    } catch (e) {}
  }

  // draw player on top of many world objects (keep original drawPlayer if present)
  if (typeof drawPlayer === 'function') {
    drawPlayer();
  } else if (state.player && state.ctx) {
    // fallback: simple player representation if drawPlayer helper isn't available.
    const p = state.player;
    const ctx = state.ctx;
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(p.x || state.canvas.width/2, p.y || state.canvas.height/2, p.size || 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // If gameOver, draw overlay on canvas and ensure DOM overlay is shown
  const isGameOver = (typeof state.getGameOver === 'function') ? state.getGameOver() : state.gameOver;
  if (isGameOver) {
    // We still draw the fullscreen dark overlay + GAME OVER text on the canvas as a fallback.
    state.ctx.save();
    state.ctx.fillStyle = "rgba(0,0,0,0.6)";
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.fillStyle = "white";
    state.ctx.font = "48px Arial";
    state.ctx.textAlign = "center";
    state.ctx.fillText("GAME OVER", state.canvas.width / 2, state.canvas.height / 2 - 20);
    state.ctx.font = "20px Arial";
    state.ctx.fillText("Press R to restart", state.canvas.width / 2, state.canvas.height / 2 + 30);
    state.ctx.restore();
    // Ensure the DOM overlay (panel with Continue / Restart / Highscores) is shown when gameOver is true.
    // showGameOverUI() is a safe no-op if the overlay DOM isn't present.
    try {
      showGameOverUI();
    } catch (e) {
      // If the function isn't available in this context (shouldn't happen in normal app),
      // ignore and rely on the canvas fallback overlay.
      // console.warn('showGameOverUI not available:', e);
    }
    return;
  }

  requestAnimationFrame(gameLoop);
}

/* New renderFrame() added per patch — this centralizes draw order */
export function renderFrame() {
  // 1) Background (base)
  drawBackground(state.wave);

  // 2) Special planet / re-entry layers (if applicable)
  if (typeof drawPlanetBackground === 'function') drawPlanetBackground();
  if (typeof drawReentryEffects === 'function') drawReentryEffects();

  // 3) Environment/clouds/city
  if (typeof drawClouds === 'function') drawClouds();

  // 4) World objects: tunnels, planet colliders
  if (typeof drawTunnels === 'function') drawTunnels();
  if (typeof drawTunnelCollisions === 'function') drawTunnelCollisions();

  // 5) Enemies / bullets / dropships / mechs / tanks / walkers
  if (typeof drawEnemies === 'function') drawEnemies();
  if (typeof drawDropship === 'function') {
    // if drawDropship exists, draw for mechs that are deploying or dropshipVisible
    state.mechs.forEach(m => { if (m.deploying || m.dropshipVisible) drawDropship(m); });
  }
  if (typeof drawTanks === 'function') drawTanks();
  if (typeof drawWalkers === 'function') drawWalkers();
  if (typeof drawMechs === 'function') drawMechs();

  // 6) Bullets and related effects
  if (typeof drawBullets === 'function') drawBullets();
  if (typeof updateAndDrawReflectionEffects === 'function') updateAndDrawReflectionEffects();

  // 7) Items / diamonds / lightning / debris / explosions
  if (typeof drawDiamonds === 'function') drawDiamonds();
  if (typeof drawPowerUps === 'function') drawPowerUps();
  if (typeof drawLightning === 'function') drawLightning();
  if (typeof drawExplosions === 'function') drawExplosions();
  if (typeof drawDebris === 'function') drawDebris();

  // 8) Gold star aura & star itself (before UI so aura sits behind UI)
  if (typeof drawGoldStarAura === 'function') drawGoldStarAura(state.ctx);
  if (typeof drawGoldStar === 'function') drawGoldStar();

  // 9) UI last (HUD)
  if (typeof drawUI === 'function') drawUI();
}

export function ensureCanvas() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    return false;
  }
  state.setCanvas(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  state.setCtx(ctx);

  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  if (!state.player.x || !state.player.y) {
    state.player.x = canvas.width / 2;
    state.player.y = canvas.height / 2;
  }
  if (!state.goldStar.x || !state.goldStar.y) {
    respawnGoldStar();
  }

  return true;
}

export function saveHighScoresOnGameOver() {
  if (state.recordedScoreThisRun) return;
  state.setHighScore(Math.max(state.highScore, state.score));
  state.addHighScore({ name: state.cinematic.playerName || "Player", score: state.score });
  try {
    localStorage.setItem("mybagman_highscores", JSON.stringify(state.highScores));
    localStorage.setItem("mybagman_best", String(state.highScore));
  } catch (e) {}
  state.setRecordedScoreThisRun(true);
}

export function loadHighScores() {
  try {
    const raw = localStorage.getItem("mybagman_highscores");
    const best = localStorage.getItem("mybagman_best");
    if (raw) {
      const scores = JSON.parse(raw);
      scores.forEach(s => state.addHighScore(s));
    }
    if (best) state.setHighScore(Number(best) || state.highScore);
  } catch (e) {}
}

export function resetGame() {
  state.cloudParticles.length = 0;
  state.bullets.length = 0;
  state.enemies.length = 0;
  state.diamonds.length = 0;
  state.tunnels.length = 0;
  state.tanks.length = 0;
  state.walkers.length = 0;
  state.mechs.length = 0;
  state.debris.length = 0;
  state.explosions.length = 0;
  state.lightning.length = 0;
  state.powerUps.length = 0;
  state.reflectionEffects.length = 0;
  state.redPunchEffects.length = 0;
  state.minionsToAdd.length = 0;

  // state.score = 0;
  state.setScore(0);
  // state.wave = 0;
  state.setWave(0);
  state.setWaveTransition(false);
  state.setWaveTransitionTimer(0);
  if (typeof state.setGameOver === 'function') {
    state.setGameOver(false);
  } else {
    state.gameOver = false;
  }
  state.setRecordedScoreThisRun(false);

  if (state.canvas) {
    state.player.x = state.canvas.width/2;
    state.player.y = state.canvas.height/2;
  } else {
    state.player.x = 0;
    state.player.y = 0;
  }
  state.player.size = 28;
  state.player.speed = 4;
  state.player.health = 100;
  state.player.maxHealth = 100;
  state.player.lives = 3;
  state.player.invulnerable = false;
  state.player.invulnerableTimer = 0;
  state.player.reflectAvailable = false;
  state.player.fireRateBoost = 1;
  state.player.healAccumulator = 0;

  respawnGoldStar();
  resetAuraOnDeath();
  state.wave = 1;
  spawnWave(state.wave);
  requestAnimationFrame(gameLoop);
}

/* ---- Integration with simple high-score DOM overlay and UI from example ----
   This integrates the overlay/highscore UI into the existing game file.
   The project already persists highscores via localStorage in saveHighScoresOnGameOver/loadHighScores.
   Below are helper functions and event handlers that use state.* functions and state.highScores.
*/

// NOTE: DOM elements are queried lazily inside helpers so this file works whether the script
// runs before or after DOMContentLoaded. Querying once at module load time could capture null
// while the element later exists in the DOM, causing the overlay to remain visible because it
// was never hidden. This change fixes the "overlay visible at start" issue.

function getOverlayElements() {
  return {
    overlayEl: document.getElementById('overlay'),
    finalScoreEl: document.getElementById('final-score'),
    continueBtn: document.getElementById('continue-btn'),
    restartBtn: document.getElementById('restart-btn'),
    highscoreList: document.getElementById('highscore-list'),
    newHighscorePanel: document.getElementById('new-highscore'),
    newHighscoreInput: document.getElementById('new-highscore-name'),
    saveHighscoreBtn: document.getElementById('save-highscore-btn'),
  };
}

// Utility: check whether a score would qualify as a high score (top 5)
function isHighScore(score) {
  const scores = state.highScores || [];
  if (!Array.isArray(scores) || scores.length < 5) return true;
  // assume scores sorted desc; if not, compute lowest of top 5
  const lowest = scores.slice(0,5).reduce((min, s) => Math.min(min, s.score), Infinity);
  return score > lowest;
}

// Render the high score list into the DOM if element exists
function renderHighScoreList() {
  const { highscoreList } = getOverlayElements();
  if (!highscoreList) return;
  const scores = state.highScores || [];
  highscoreList.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const li = document.createElement('li');
    if (scores[i]) {
      li.textContent = `${scores[i].name} — ${scores[i].score}`;
    } else {
      li.textContent = `--- — 0`;
    }
    highscoreList.appendChild(li);
  }
}

// Suggested change inside showGameOverUI:
// Only show overlay when game actually ended according to state.shouldShowGameOver()
export function showGameOverUI() {
  if (!state.shouldShowGameOver()) {
    // don't show the overlay if the game hasn't actually ended
    return;
  }
  const { overlayEl, finalScoreEl } = getOverlayElements();
  if (!overlayEl) return;
  overlayEl.classList.remove('hidden');
  if (finalScoreEl) finalScoreEl.textContent = String(state.score || 0);
  // ensure we mark gameOver in state for other systems that check it
  if (typeof state.setGameOver === 'function') {
    state.setGameOver(true);
  } else {
    state.gameOver = true;
  }
}

 // Hide overlay and resume/continue (used by continue button)
function hideGameOverUI() {
  const { overlayEl, newHighscorePanel } = getOverlayElements();
  if (!overlayEl) return;
  overlayEl.classList.add('hidden');
  if (newHighscorePanel) newHighscorePanel.classList.add('hidden');
}

// Continue from current wave with new lives (maps to example continueFromCurrentWave)
function continueFromCurrentWave() {
  // give player 3 lives, keep score and wave, resume
  state.player.lives = 3;
  // respawn player so they don't immediately die on continue, and grant short invulnerability
  respawnPlayer();
  state.player.invulnerable = true;
  state.player.invulnerableTimer = 180; // e.g., 3 seconds at 60fps; adjust as needed

  // clear gameOver flag via setter if present
  if (typeof state.setGameOver === 'function') {
    state.setGameOver(false);
  } else {
    state.gameOver = false;
  }

  hideGameOverUI();

  // ensure current wave is active / re-spawn wave if needed
  spawnWave(state.wave || 1);

  // resume game loop
  requestAnimationFrame(gameLoop);
}

// Start a fresh new game (maps to example startNewGame)
function startNewGame() {
  resetGame();
  hideGameOverUI();
}

// Hook up DOM buttons if they exist - this runs once but queries elements lazily
// Only run if we're in a browser environment with document available
(function hookUpButtons() {
  if (typeof document === 'undefined') return;
  const { continueBtn, restartBtn, saveHighscoreBtn, newHighscoreInput } = getOverlayElements();

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      continueFromCurrentWave();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      startNewGame();
    });
  }

  if (saveHighscoreBtn && newHighscoreInput) {
    saveHighscoreBtn.addEventListener('click', () => {
      const raw = newHighscoreInput.value || '---';
      const name = raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, '-');
      // Add to state.highScores and persist
      state.addHighScore({ name, score: state.score || 0 });
      try {
        localStorage.setItem("mybagman_highscores", JSON.stringify(state.highScores));
        localStorage.setItem("mybagman_best", String(state.highScore));
      } catch (e) {}
      const { newHighscorePanel } = getOverlayElements();
      if (newHighscorePanel) newHighscorePanel.classList.add('hidden');
      renderHighScoreList();
    });

    // allow Enter to submit
    newHighscoreInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveHighscoreBtn.click();
      }
    });

    // optional: enforce only letters, up to 3 chars
    newHighscoreInput.addEventListener('input', (e) => {
      const filtered = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
      e.target.value = filtered.slice(0, 3);
    });
  }
})();

// Expose some helpers for debugging in console (as in example)
if (typeof window !== 'undefined') {
  window.__gameState = state;
  window.startNewGame = startNewGame;
  window.continueFromCurrentWave = continueFromCurrentWave;
  window.showGameOverUI = showGameOverUI;
}

// Ensure highscores are loaded at startup
loadHighScores();

// Ensure overlay is hidden at startup so it doesn't flash/appear before a game-over event.
// Query elements lazily and hide them if present. This avoids the previous problem where the
// overlay element was looked up too early (when DOM not yet ready) and never hidden.
if (typeof document !== 'undefined') {
  try {
    hideGameOverUI();
  } catch (e) {
    // ignore if hideGameOverUI not available for some reason
  }
}

