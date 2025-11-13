import { loadHighScores, ensureCanvas, gameLoop } from './game.js';
import { respawnPlayer, respawnGoldStar } from './utils.js';
import { spawnWave } from './waveManager.js';
import { setupInputHandlers } from './input.js';
import * as state from './state.js';

/**
 * index.js
 * - Initializes the game on window load (as before)
 * - Injects the overlay / HUD HTML into the page so the single-page app
 *   doesn't require a separate index.html file
 * - Merges highscores.js functionality directly so no separate file is required
 * - Wires the overlay buttons (continue, restart, save highscore)
 *
 * Notes:
 * - This merged high score module uses the original highscores.js behavior:
 *   - Storage key: "mybagman_highscores_v1"
 *   - Top 5 entries kept
 *   - addScore(score, name) expects a numeric score and a 3-letter uppercase name
 */

/* ---------------------------
   Highscores (merged from highscores.js)
   --------------------------- */

const HS_STORAGE_KEY = 'mybagman_highscores_v1';
const HS_MAX_ENTRIES = 5;

function hs_loadScores() {
  try {
    const raw = localStorage.getItem(HS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, HS_MAX_ENTRIES);
  } catch (e) {
    console.error('Failed to load highscores', e);
    return [];
  }
}

function hs_saveScores(scores) {
  try {
    localStorage.setItem(HS_STORAGE_KEY, JSON.stringify(scores.slice(0, HS_MAX_ENTRIES)));
  } catch (e) {
    console.error('Failed to save highscores', e);
  }
}

function hs_addScore(score, name) {
  const scores = hs_loadScores();
  scores.push({ score: Number(score) || 0, name: (name || '---').toUpperCase().slice(0, 3) });
  scores.sort((a, b) => b.score - a.score);
  const result = scores.slice(0, HS_MAX_ENTRIES);
  hs_saveScores(result);
  return result;
}

function hs_isHighScore(score) {
  const scores = hs_loadScores();
  if (scores.length < HS_MAX_ENTRIES) return true;
  return Number(score) > scores[scores.length - 1].score;
}

function hs_clearScores() {
  localStorage.removeItem(HS_STORAGE_KEY);
}

/* ---------------------------
   Inject overlay HTML
   --------------------------- */

const overlayHTML = `
  <style>
    .hidden { display: none !important; }
  </style>
  <div id="overlay" class="hidden" style="position:fixed;inset:0;display:none;align-items:center;justify-content:center;pointer-events:none;">
    <div id="gameover-screen" class="panel" style="pointer-events:auto;background:rgba(20,20,20,0.95);color:#fff;padding:24px;border-radius:8px;min-width:320px;max-width:90%;">
      <h1 style="margin-top:0">Game Over</h1>
      <p id="final-score">Score: 0</p>

      <button id="continue-btn">Continue (3 lives)</button>

      <div id="highscore-panel" style="margin-top:16px;">
        <h2>High Scores</h2>
        <ol id="highscore-list" style="padding-left:1.2em;">
        </ol>

        <div id="new-highscore" class="hidden" style="margin-top:12px;">
          <p>New High Score! Enter your 3-letter name:</p>
          <input id="new-highscore-name" maxlength="3" placeholder="AAA" style="text-transform:uppercase" />
          <button id="save-highscore-btn">Save</button>
        </div>
      </div>

      <div style="margin-top:12px;">
        <button id="restart-btn">Restart Game</button>
      </div>
    </div>
  </div>
`;

// Append the overlay to the document body so the game can run in a single JS-driven page.
function injectOverlay() {
  if (document.getElementById('overlay')) return;
  const container = document.createElement('div');
  container.innerHTML = overlayHTML;
  while (container.firstChild) {
    document.body.appendChild(container.firstChild);
  }
}

/* ---------------------------
   Overlay control functions
   --------------------------- */

function showOverlay() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.style.pointerEvents = 'auto';
  overlay.style.display = 'flex';
}

function hideOverlay() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'none';
}

function updateFinalScoreText(score) {
  const el = document.getElementById('final-score');
  if (el) el.textContent = `Score: ${score}`;
}

function populateHighScoreList() {
  const listEl = document.getElementById('highscore-list');
  if (!listEl) return;
  const scores = hs_loadScores();
  listEl.innerHTML = '';
  if (scores.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No high scores yet';
    listEl.appendChild(li);
    return;
  }
  for (const entry of scores) {
    const li = document.createElement('li');
    li.textContent = `${entry.name} — ${entry.score}`;
    listEl.appendChild(li);
  }
}

/* ---------------------------
   Game state stored in index.js
   --------------------------- */

let currentWave = 0;
let lastFinalScore = 0;

/* ---------------------------
   Button wiring
   --------------------------- */

function wireOverlayButtons() {
  const continueBtn = document.getElementById('continue-btn');
  const restartBtn = document.getElementById('restart-btn');
  const saveBtn = document.getElementById('save-highscore-btn');
  const newHighscoreDiv = document.getElementById('new-highscore');
  const newHighscoreInput = document.getElementById('new-highscore-name');

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      hideOverlay();
      // Reset game over state
      if (typeof state.setGameOver === 'function') {
        state.setGameOver(false);
      } else {
        state.gameOver = false;
      }
      // Reset player lives and health
      state.player.lives = 3;
      state.player.health = state.player.maxHealth || 100;
      state.player.invulnerable = true;
      state.player.invulnerableTimer = 180; // 3 seconds at 60fps
      respawnPlayer();
      respawnGoldStar();
      spawnWave(currentWave);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      hideOverlay();
      // Reset game over state
      if (typeof state.setGameOver === 'function') {
        state.setGameOver(false);
      } else {
        state.gameOver = false;
      }
      // Use the state's resetGame function for proper full reset
      if (typeof state.resetGame === 'function') {
        state.resetGame();
      } else {
        // Fallback manual reset
        state.player.lives = 3;
        state.player.health = state.player.maxHealth || 100;
        if (typeof state.setScore === 'function') {
          state.setScore(0);
        } else {
          state.score = 0;
        }
      }
      currentWave = 0;
      respawnPlayer();
      respawnGoldStar();
      spawnWave(0);
    });
  }

  if (saveBtn && newHighscoreInput) {
    saveBtn.addEventListener('click', () => {
      const name = newHighscoreInput.value.trim().slice(0, 3).toUpperCase() || '---';
      hs_addScore(lastFinalScore, name);
      populateHighScoreList();
      if (newHighscoreDiv) newHighscoreDiv.classList.add('hidden');
    });
  }
}

/* ---------------------------
   Public helper API for game to call on game-over
   --------------------------- */

/**
 * Call this when the game is over and you want to show the overlay.
 * @param {number} finalScore
 * @param {number} wave - the wave on which the game ended (so Continue can restart it)
 */
export function showGameOverOverlay(finalScore, wave = 0) {
  currentWave = wave;
  lastFinalScore = finalScore;
  injectOverlay();
  updateFinalScoreText(finalScore);
  populateHighScoreList();

  // Show new highscore input if this is a high score
  const newHS = hs_isHighScore(finalScore);
  const newHighscoreDiv = document.getElementById('new-highscore');
  if (newHighscoreDiv) {
    if (newHS) newHighscoreDiv.classList.remove('hidden');
    else newHighscoreDiv.classList.add('hidden');
  }

  wireOverlayButtons();
  showOverlay();
}

/* ---------------------------
   Window load initialization
   --------------------------- */

window.addEventListener('load', () => {
  // initialize game data - keep compatibility if game.js provides loadHighScores()
  typeof loadHighScores === 'function' && loadHighScores();
  typeof ensureCanvas === 'function' && ensureCanvas();
  
  // Import state and cinematic modules
  import('./state.js').then(stateModule => {
    import('./openingCinematic.js').then(cinematicModule => {
      // Check if opening cinematic has been played
      if (!stateModule.cinematic.openingPlayed) {
        // Start with opening cinematic
        stateModule.cinematic.playing = true;
        cinematicModule.startOpeningCinematic();
        
        // Set player name from cinematic
        stateModule.cinematic.playerName = "Ghost";
        
        // Initialize player and gold star but don't spawn wave yet
        respawnPlayer();
        respawnGoldStar();
        currentWave = 0;
      } else {
        // If already played (e.g., on restart), start at Wave 0
        respawnPlayer();
        respawnGoldStar();
        currentWave = 0;
        spawnWave(0);
      }
      
      typeof setupInputHandlers === 'function' && setupInputHandlers();
      
      // inject overlay into DOM so the single page can show it when needed
      injectOverlay();
      wireOverlayButtons();
      
      // start render loop
      requestAnimationFrame(gameLoop);
    });
  });
});

/* ---------------------------
   Expose helpers to window
   --------------------------- */

window.MyBagman = window.MyBagman || {};
window.MyBagman.showGameOverOverlay = showGameOverOverlay;
window.MyBagman.getHighScores = hs_loadScores;
window.MyBagman.addHighScore = hs_addScore;
window.MyBagman.clearHighScores = hs_clearScores;
