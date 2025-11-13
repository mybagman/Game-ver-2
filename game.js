import * as state from './state.js';
import {
  updatePlayerMovement,
  handleShooting,
  updateBullets,
  updateEmpProjectiles,
  updateMegatonneBombs,
  updatePowerUps,
  updateTunnels,
  updateExplosions,
  updateRedPunchEffects,
  updateDebris,
  updateCloudParticles
} from './updates.js';
import { updateEnemies } from './enemies.js';
import { updateLightning, checkBulletCollisions } from './collisions.js';
import { updateGoldStar } from './goldstar.js';
import { updateGoldStarAura, resetAuraOnDeath } from './aura.js';
import { tryAdvanceWave, spawnWave, renderCinematic } from './waveManager.js';
import { updateReflectorSystem, updateHomingMissiles, drawHomingMissiles } from './homingMissiles.js';
import { renderOpeningCinematic, isOpeningCinematicComplete } from './openingCinematic.js';
/* patched imports: consolidated drawing helpers from drawing.js */
// Replace the single `from './drawing.js'` import with these direct imports:
import { drawBackground, drawPlanetBackground, drawClouds, drawGroundObjects } from './drawing/background.js';
import { drawBullets, drawEmpProjectiles, drawMegatonneBombs } from './drawing/bullets.js';
import { drawDiamonds, drawEnemies, drawDropship, drawDropships, drawTanks, drawWalkers, drawMechs } from './drawing/Enemies.js';
import { drawGoldStarAura, drawGoldStar } from './drawing/goldstar.js';
import { drawUI } from './drawing/UI.js';
import { drawPlayer } from './drawing/player.js';
import { drawPowerUps } from './drawing/powerups.js';

// Consolidated single import from Effects.js to avoid duplicate identifier declarations
import {
  drawReentryEffects,
  drawDebris,
  drawLightning,
  drawExplosions,
  updateAndDrawReflectionEffects,
  drawRedPunchEffects,
  drawTunnels,
  drawTunnelCollisions,
  triggerTunnelCollision
} from './drawing/Effects.js';

// import { drawDiamonds } from './drawing/Enemies.js';
// import { drawDiamonds } from './drawing/diamonds.js';

import { respawnPlayer, respawnGoldStar, resetGoldStar } from './utils.js';

// --- Game loop and integration with high-score UI ---

export function gameLoop(now) {
  // If cinematic is playing, render it instead of game
  if (state.cinematic && state.cinematic.playing) {
    if (!ensureCanvas()) return;
    if (state.ctx && state.canvas) {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
      
      // Check if this is the opening cinematic (not yet played)
      if (!state.cinematic.openingPlayed) {
        const stillPlaying = renderOpeningCinematic(state.ctx, state.canvas.width, state.canvas.height);
        
        // If opening cinematic is complete, transition to Wave 1 (index 0, displayed as WAVE: 1)
        if (!stillPlaying || isOpeningCinematicComplete()) {
          console.log('[gameLoop] Opening cinematic complete, starting Wave 1');
          state.cinematic.playing = false;
          state.cinematic.openingPlayed = true;
          // Start at Wave index 0 (displays as "WAVE: 1" in UI)
          if (typeof state.setWave === 'function') {
            state.setWave(0);
          } else {
            state.wave = 0;
          }
          spawnWave(0);
        }
      } else {
        // Render other cinematics (Death Star, Planetfall, etc.)
        renderCinematic(state.ctx, state.canvas.width, state.canvas.height);
      }
    }
    requestAnimationFrame(gameLoop);
    return;
  }

  // Increment frame count if available
  if (typeof state.incrementFrameCount === 'function') {
    state.incrementFrameCount();
  } else if (typeof state.frameCount === 'number') {
    state.frameCount++;
  }

  // Updates (order preserved)
  try { updatePlayerMovement(); } catch (e) {}
  try { handleShooting(); } catch (e) {}
  try { updateBullets(); } catch (e) {}
  try { updateEmpProjectiles(); } catch (e) {}
  try { updateMegatonneBombs(); } catch (e) {}
  try { updateLightning(); } catch (e) {}
  try { updateExplosions(); } catch (e) {}
  try { updatePowerUps(); } catch (e) {}
  try { updateTunnels(); } catch (e) {}
  try { updateRedPunchEffects(); } catch (e) {}
  try { updateGoldStarAura(); } catch (e) {}
  try { updateGoldStar(); } catch (e) {}
  try { updateEnemies(); } catch (e) {}
  try { updateDebris(); } catch (e) {}
  try { updateCloudParticles(); } catch (e) {}
  try { updateReflectorSystem(); } catch (e) {}
  try { updateHomingMissiles(); } catch (e) {}
  try { checkBulletCollisions(); } catch (e) {}
  try { tryAdvanceWave(); } catch (e) {}

  // Player death handling
  if (state.player && typeof state.player.health === 'number' && state.player.health <= 0) {
    if (typeof state.player.lives === 'number') {
      state.player.lives--;
    } else {
      state.player.lives = (state.player.lives || 1) - 1;
    }

    if (state.player.lives > 0) {
      try { respawnPlayer(); } catch (e) {}
    } else {
      // Store the current wave before game over
      if (typeof state.setLastDeathWave === 'function') {
        try { state.setLastDeathWave(state.wave); } catch (e) { state.lastDeathWave = state.wave; }
      } else {
        state.lastDeathWave = state.wave;
      }

      // set game over via setter if available
      if (typeof state.setGameOver === 'function') {
        try { state.setGameOver(true); } catch (e) {}
      } else {
        state.gameOver = true;
      }

      // Save/record high scores
      try { saveHighScoresOnGameOver(); } catch (e) {}
      // Show the game over UI overlay
      try { showGameOverUI(); } catch (e) {}
    }
  }

  if (!ensureCanvas()) return;
  if (state.ctx && state.canvas) {
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
  }

  // Use the new renderFrame sequence (order matters)
  try { renderFrame(); } catch (e) {}

  // Some effects / overlays that were previously drawn after main scene:
  // draw any red punch effects (screen flash / hit indicators)
  if (typeof drawRedPunchEffects === 'function') {
    try { drawRedPunchEffects(); } catch (e) {}
  }

  // draw player on top of many world objects (keep original drawPlayer if present)
  if (typeof drawPlayer === 'function') {
    try { drawPlayer(); } catch (e) {}
  } else if (state.player && state.ctx) {
    // fallback: simple player representation if drawPlayer helper isn't available.
    try {
      const p = state.player;
      const ctx = state.ctx;
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(p.x || state.canvas.width / 2, p.y || state.canvas.height / 2, p.size || 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } catch (e) {}
  }

  // If gameOver, draw overlay on canvas
  const isGameOver = (typeof state.getGameOver === 'function') ? state.getGameOver() : Boolean(state.gameOver);
  if (isGameOver) {
    try {
      if (state.ctx && state.canvas) {
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
      }
    } catch (e) {}
    // Note: DOM overlay is already shown by showGameOverUI() call above when lives run out
    return;
  }

  requestAnimationFrame(gameLoop);
}

/* New renderFrame() added per patch — this centralizes draw order */
export function renderFrame() {
  // Defensive no-op if ctx or canvas missing
  if (!state.ctx || !state.canvas) return;

  // 1) Background (base)
  if (typeof drawBackground === 'function') {
    try { drawBackground(state.wave); } catch (e) {}
  }

  // 2) Special planet / re-entry layers (if applicable)
  if (typeof drawPlanetBackground === 'function') {
    try { drawPlanetBackground(); } catch (e) {}
  }
  if (typeof drawReentryEffects === 'function') {
    try { drawReentryEffects(); } catch (e) {}
  }

  // 3) Environment/clouds/city
  if (typeof drawClouds === 'function') {
    try { drawClouds(); } catch (e) {}
  }

  // 4) World objects: tunnels, ground, planet colliders
  if (typeof drawTunnels === 'function') {
    try { drawTunnels(); } catch (e) {}
  }
  if (typeof drawTunnelCollisions === 'function') {
    try { drawTunnelCollisions(); } catch (e) {}
  }
  if (typeof drawGroundObjects === 'function') {
    try { drawGroundObjects(); } catch (e) {}
  }

  // 5) Enemies / bullets / dropships / mechs / tanks / walkers
  if (typeof drawEnemies === 'function') {
    try { drawEnemies(); } catch (e) {}
  }
  if (typeof drawDropship === 'function' && Array.isArray(state.mechs)) {
    try {
      state.mechs.forEach(m => { if (m.deploying || m.dropshipVisible) drawDropship(m); });
    } catch (e) {}
  }
  if (typeof drawDropships === 'function') {
    try { drawDropships(); } catch (e) {}
  }
  if (typeof drawTanks === 'function') {
    try { drawTanks(); } catch (e) {}
  }
  if (typeof drawWalkers === 'function') {
    try { drawWalkers(); } catch (e) {}
  }
  if (typeof drawMechs === 'function') {
    try { drawMechs(); } catch (e) {}
  }

  // 6) Bullets and related effects
  if (typeof drawBullets === 'function') {
    try { drawBullets(); } catch (e) {}
  }
  if (typeof drawEmpProjectiles === 'function') {
    try { drawEmpProjectiles(); } catch (e) {}
  }
  if (typeof drawMegatonneBombs === 'function') {
    try { drawMegatonneBombs(); } catch (e) {}
  }
  if (typeof updateAndDrawReflectionEffects === 'function') {
    try { updateAndDrawReflectionEffects(); } catch (e) {}
  }

  // 7) Items / diamonds / lightning / debris / explosions / homing missiles
  if (typeof drawDiamonds === 'function') {
    try { drawDiamonds(); } catch (e) {}
  }
  if (typeof drawPowerUps === 'function') {
    try { drawPowerUps(); } catch (e) {}
  }
  if (typeof drawLightning === 'function') {
    try { drawLightning(); } catch (e) {}
  }
  if (typeof drawHomingMissiles === 'function') {
    try { drawHomingMissiles(state.ctx); } catch (e) {}
  }
  if (typeof drawExplosions === 'function') {
    try { drawExplosions(); } catch (e) {}
  }
  if (typeof drawDebris === 'function') {
    try { drawDebris(); } catch (e) {}
  }

  // 8) Gold star aura & star itself (before UI so aura sits behind UI)
  if (typeof drawGoldStarAura === 'function') {
    try { drawGoldStarAura(state.ctx); } catch (e) {}
  }
  if (typeof drawGoldStar === 'function') {
    try { drawGoldStar(); } catch (e) {}
  }

  // 9) UI last (HUD)
  if (typeof drawUI === 'function') {
    try { drawUI(); } catch (e) {}
  }
}

export function ensureCanvas() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    return false;
  }
  // set canvas in state using setter if available, otherwise assign
  if (typeof state.setCanvas === 'function') {
    try { state.setCanvas(canvas); } catch (e) { state.canvas = canvas; }
  } else {
    state.canvas = canvas;
  }

  const ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return false;

  if (typeof state.setCtx === 'function') {
    try { state.setCtx(ctx); } catch (e) { state.ctx = ctx; }
  } else {
    state.ctx = ctx;
  }

  // Match canvas to window size
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Initialize player/goldStar positions if missing
  if (!state.player) state.player = {};
  if (typeof state.player.x !== 'number' || typeof state.player.y !== 'number') {
    state.player.x = canvas.width / 2;
    state.player.y = canvas.height / 2;
  }
  if (!state.goldStar) state.goldStar = {};
  if (typeof state.goldStar.x !== 'number' || typeof state.goldStar.y !== 'number') {
    try { respawnGoldStar(); } catch (e) {}
  }

  return true;
}

export function saveHighScoresOnGameOver() {
  if (state.recordedScoreThisRun) return;
  // ensure we have setter fallbacks
  const high = Math.max(Number(state.highScore || 0), Number(state.score || 0));
  if (typeof state.setHighScore === 'function') {
    try { state.setHighScore(high); } catch (e) { state.highScore = high; }
  } else {
    state.highScore = high;
  }

  try {
    state.addHighScore && state.addHighScore({ name: (state.cinematic && state.cinematic.playerName) || "Player", score: Number(state.score || 0) });
  } catch (e) {}

  try {
    localStorage.setItem("mybagman_highscores", JSON.stringify(state.highScores || []));
    localStorage.setItem("mybagman_best", String(state.highScore || high));
  } catch (e) {}

  if (typeof state.setRecordedScoreThisRun === 'function') {
    try { state.setRecordedScoreThisRun(true); } catch (e) { state.recordedScoreThisRun = true; }
  } else {
    state.recordedScoreThisRun = true;
  }
}

export function loadHighScores() {
  try {
    const raw = localStorage.getItem("mybagman_highscores");
    const best = localStorage.getItem("mybagman_best");
    if (raw) {
      const scores = JSON.parse(raw);
      if (Array.isArray(scores)) {
        scores.forEach(s => {
          try {
            state.addHighScore && state.addHighScore(s);
          } catch (e) {}
        });
      }
    }
    if (best) {
      const num = Number(best);
      if (!Number.isNaN(num)) {
        if (typeof state.setHighScore === 'function') {
          try { state.setHighScore(num); } catch (e) { state.highScore = num; }
        } else {
          state.highScore = num;
        }
      }
    }
  } catch (e) {}
}

export function resetGame() {
  // clear arrays defensively
  const arrays = [
    'cloudParticles', 'bullets', 'enemies', 'diamonds', 'tunnels',
    'tanks', 'walkers', 'mechs', 'dropships', 'debris', 'explosions', 'lightning',
    'powerUps', 'reflectionEffects', 'redPunchEffects', 'minionsToAdd'
  ];
  arrays.forEach(name => {
    if (Array.isArray(state[name])) state[name].length = 0;
    else state[name] = [];
  });

  // reset scores/wave via setters if present
  if (typeof state.setScore === 'function') {
    try { state.setScore(0); } catch (e) { state.score = 0; }
  } else {
    state.score = 0;
  }

  if (typeof state.setWave === 'function') {
    try { state.setWave(0); } catch (e) { state.wave = 0; }
  } else {
    state.wave = 0;
  }

  if (typeof state.setWaveTransition === 'function') {
    try { state.setWaveTransition(false); } catch (e) { state.waveTransition = false; }
  } else {
    state.waveTransition = false;
  }

  if (typeof state.setWaveTransitionTimer === 'function') {
    try { state.setWaveTransitionTimer(0); } catch (e) { state.waveTransitionTimer = 0; }
  } else {
    state.waveTransitionTimer = 0;
  }

  if (typeof state.setGameOver === 'function') {
    try { state.setGameOver(false); } catch (e) { state.gameOver = false; }
  } else {
    state.gameOver = false;
  }

  if (typeof state.setRecordedScoreThisRun === 'function') {
    try { state.setRecordedScoreThisRun(false); } catch (e) { state.recordedScoreThisRun = false; }
  } else {
    state.recordedScoreThisRun = false;
  }

  // Reset player defaults
  if (!state.player) state.player = {};
  if (state.canvas) {
    state.player.x = state.canvas.width / 2;
    state.player.y = state.canvas.height / 2;
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
  state.player.rotation = -Math.PI / 2;
  state.player.targetRotation = -Math.PI / 2;
  state.player.vx = 0;
  state.player.vy = 0;
  if (!state.player.thrusterParticles) state.player.thrusterParticles = [];

  try { resetGoldStar(); } catch (e) {} // Full reset for new game
  try { resetAuraOnDeath(); } catch (e) {}

  // Start wave 1
  state.wave = 1;
  try { spawnWave(state.wave); } catch (e) {}
  requestAnimationFrame(gameLoop);
}

/* ---- Integration with simple high-score DOM overlay and UI from example ----
   Helper functions for overlay UI. Query elements lazily so this module can run
   before or after DOMContentLoaded.
*/

function getOverlayElements() {
  return {
    overlayEl: typeof document !== 'undefined' ? document.getElementById('overlay') : null,
    finalScoreEl: typeof document !== 'undefined' ? document.getElementById('final-score') : null,
    continueBtn: typeof document !== 'undefined' ? document.getElementById('continue-btn') : null,
    restartBtn: typeof document !== 'undefined' ? document.getElementById('restart-btn') : null,
    highscoreList: typeof document !== 'undefined' ? document.getElementById('highscore-list') : null,
    newHighscorePanel: typeof document !== 'undefined' ? document.getElementById('new-highscore') : null,
    newHighscoreInput: typeof document !== 'undefined' ? document.getElementById('new-highscore-name') : null,
    saveHighscoreBtn: typeof document !== 'undefined' ? document.getElementById('save-highscore-btn') : null
  };
}

// Utility: check whether a score would qualify as a high score (top 5)
function isHighScore(score) {
  const scores = state.highScores || [];
  if (!Array.isArray(scores) || scores.length < 5) return true;
  const lowest = scores.slice(0, 5).reduce((min, s) => Math.min(min, s.score), Infinity);
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

// Only show overlay when game actually ended - called ONLY from gameLoop when player dies
export function showGameOverUI() {
  // Critical fix: Only check if game is actually over, don't call shouldShowGameOver
  const isGameOver = (typeof state.getGameOver === 'function') ? state.getGameOver() : Boolean(state.gameOver);
  if (!isGameOver) return;

  const { overlayEl, finalScoreEl } = getOverlayElements();
  if (!overlayEl) return;

  // Properly set display properties
  overlayEl.classList.remove('hidden');
  overlayEl.style.display = 'flex';
  overlayEl.style.pointerEvents = 'auto';
  
  if (finalScoreEl) finalScoreEl.textContent = String(state.score || 0);

  // If new high score, show the panel
  if (isHighScore(state.score || 0)) {
    const { newHighscorePanel, newHighscoreInput } = getOverlayElements();
    if (newHighscorePanel) newHighscorePanel.classList.remove('hidden');
    if (newHighscoreInput) {
      newHighscoreInput.value = ((state.cinematic && state.cinematic.playerName) || '').slice(0, 3).toUpperCase();
    }
  }

  // render list
  try { renderHighScoreList(); } catch (e) {}
}

function hideGameOverUI() {
  const { overlayEl, newHighscorePanel } = getOverlayElements();
  if (!overlayEl) return;
  overlayEl.classList.add('hidden');
  overlayEl.style.display = 'none';
  overlayEl.style.pointerEvents = 'none';
  if (newHighscorePanel) newHighscorePanel.classList.add('hidden');
}

// Continue from current wave with new lives (maps to example continueFromCurrentWave)
function continueFromCurrentWave() {
  if (!state.player) state.player = {};
  state.player.lives = 3;
  state.player.health = state.player.maxHealth || 100;
  try { respawnPlayer(); } catch (e) {}
  state.player.invulnerable = true;
  state.player.invulnerableTimer = 180; // e.g., 3 seconds at 60fps

  if (typeof state.setGameOver === 'function') {
    try { state.setGameOver(false); } catch (e) { state.gameOver = false; }
  } else {
    state.gameOver = false;
  }

  hideGameOverUI();

  // Don't respawn enemies - keep existing ones alive
  // This makes continuing feel like gaining an extra life
  requestAnimationFrame(gameLoop);
}

// Start a fresh new game (maps to example startNewGame)
function startNewGame() {
  try { resetGame(); } catch (e) { }
  
  // Clear enemies that were spawned by resetGame (which spawns wave 1)
  if (Array.isArray(state.enemies)) state.enemies.length = 0;
  
  // Set wave to 0 (displays as WAVE: 1) since opening cinematic was already shown
  if (typeof state.setWave === 'function') {
    try { state.setWave(0); } catch (e) { state.wave = 0; }
  } else {
    state.wave = 0;
  }
  
  try { spawnWave(0); } catch (e) {}
  hideGameOverUI();
  requestAnimationFrame(gameLoop);
}

// Hook up DOM buttons if they exist - queries elements lazily
// NOTE: Continue and Restart buttons are now handled in index.js to avoid conflicts
(function hookUpButtons() {
  if (typeof document === 'undefined') return;
  
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    const { saveHighscoreBtn, newHighscoreInput } = getOverlayElements();

    // Only handle save highscore button here - continue/restart handled in index.js
    if (saveHighscoreBtn && newHighscoreInput) {
      saveHighscoreBtn.addEventListener('click', () => {
        const raw = newHighscoreInput.value || '---';
        const name = raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, '-');
        try {
          state.addHighScore && state.addHighScore({ name, score: state.score || 0 });
          localStorage.setItem("mybagman_highscores", JSON.stringify(state.highScores || []));
          localStorage.setItem("mybagman_best", String(state.highScore || 0));
        } catch (e) {}
        const { newHighscorePanel } = getOverlayElements();
        if (newHighscorePanel) newHighscorePanel.classList.add('hidden');
        try { renderHighScoreList(); } catch (e) {}
      });

      // allow Enter to submit
      newHighscoreInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          try { saveHighscoreBtn.click(); } catch (err) {}
        }
      });

      // optional: enforce only letters, up to 3 chars
      newHighscoreInput.addEventListener('input', (e) => {
        try {
          const filtered = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
          e.target.value = filtered.slice(0, 3);
        } catch (err) {}
      });
    }
  }, 0);
})();

// Expose some helpers for debugging in console (as in example)
try {
  if (typeof window !== 'undefined') {
    window.__gameState = state;
    window.startNewGame = startNewGame;
    window.continueFromCurrentWave = continueFromCurrentWave;
    window.showGameOverUI = showGameOverUI;
  }
} catch (e) {}

// Ensure highscores are loaded at startup
try { loadHighScores(); } catch (e) {}

// CRITICAL FIX: Ensure overlay is hidden at startup and gameOver is false
try { 
  hideGameOverUI(); 
  if (typeof state.setGameOver === 'function') {
    state.setGameOver(false);
  } else {
    state.gameOver = false;
  }
} catch (e) {}

export default {
  gameLoop,
  renderFrame,
  ensureCanvas,
  saveHighScoresOnGameOver,
  loadHighScores,
  resetGame,
  showGameOverUI,
  hideGameOverUI,
  continueFromCurrentWave,
  startNewGame
};
