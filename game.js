import * as state from './state.js';
import { updatePlayerMovement, handleShooting, updateBullets, updatePowerUps, updateTunnels, updateExplosions, updateRedPunchEffects, updateDebris, updateCloudParticles } from './updates.js';
import { updateEnemies } from './enemies.js';
import { updateLightning, checkBulletCollisions } from './collisions.js';
import { updateGoldStar } from './goldstar.js';
import { updateGoldStarAura } from './aura.js';
import { tryAdvanceWave, spawnWave } from './waveManager.js';
import { drawBackground, drawTunnels, drawDiamonds, drawEnemies, drawTanks, drawWalkers, drawMechs, drawDebris, drawBullets, drawLightning, drawExplosions, drawPowerUps, drawGoldStar, drawGoldStarAura, drawRedPunchEffects, drawPlayer, updateAndDrawReflectionEffects, drawUI } from './drawing.js';
import { respawnPlayer, respawnGoldStar } from './utils.js';
import { resetAuraOnDeath } from './aura.js';

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

  if (state.player.health <= 0) {
    state.player.lives--;
    if (state.player.lives > 0) {
      respawnPlayer();
  if (state.player.health <= 0) {
    state.player.lives--;
    if (state.player.lives > 0) {
      respawnPlayer();
    } else {
      state.setGameOver(true);
      saveHighScoresOnGameOver();
    }
  }

  if (!ensureCanvas()) return;
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

  drawBackground(state.wave);
  drawTunnels();
  drawDiamonds();
  drawEnemies();
  drawTanks();
  drawWalkers();
  drawMechs();
  drawDebris();
  drawBullets();
  drawLightning();
  drawExplosions();
  drawPowerUps();
  drawGoldStar();
  drawGoldStarAura(state.ctx);
  drawRedPunchEffects();
  drawPlayer();
  updateAndDrawReflectionEffects();
  drawUI();

  if (state.gameOver) {
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
    return;
  }

  requestAnimationFrame(gameLoop);
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

  state.score = 0;
  state.wave = 0;
  state.setWaveTransition(false);
  state.setWaveTransitionTimer(0);
  state.setGameOver(false);
  state.setRecordedScoreThisRun(false);

  state.player.x = state.canvas.width/2;
  state.player.y = state.canvas.height/2;
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
  spawnWave(0);
  requestAnimationFrame(gameLoop);
}
