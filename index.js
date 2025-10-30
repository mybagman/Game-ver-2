/* ---------------------------
   Window load initialization
   --------------------------- */

window.addEventListener('load', () => {
  // initialize game data - keep compatibility if game.js provides loadHighScores()
  typeof loadHighScores === 'function' && loadHighScores();
  typeof ensureCanvas === 'function' && ensureCanvas();
  respawnPlayer();
  respawnGoldStar();
  currentWave = 0;
  spawnWave(0);

  // setup input handlers if provided by game.js
  typeof setupInputHandlers === 'function' && setupInputHandlers();

  // inject overlay into DOM so the single page can show it when needed
  injectOverlay();
  wireOverlayButtons();

  // Ensure the overlay is hidden at startup so it doesn't flash/appear before a game-over event.
  // Some environments or markup may render the overlay visible by default; explicitly hide it here.
  // Prefer the hideOverlay helper from this module if present, otherwise do a DOM toggle.
  if (typeof hideOverlay === 'function') {
    try { hideOverlay(); } catch (e) { /* ignore */ }
  } else {
    const el = document.getElementById('overlay');
    if (el && !el.classList.contains('hidden')) el.classList.add('hidden');
  }

  // start render loop
  requestAnimationFrame(gameLoop);
});
