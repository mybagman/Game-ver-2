import * as state from './state.js';
import { resetGame } from './game.js';

export function setupInputHandlers() {
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "r") {
      if (state.gameOver) {
        resetGame();
      }
    }
    if (e.key === "ArrowUp") state.keys["arrowup"] = true;
    if (e.key === "ArrowDown") state.keys["arrowdown"] = true;
    if (e.key === "ArrowLeft") state.keys["arrowleft"] = true;
    if (e.key === "ArrowRight") state.keys["arrowright"] = true;

    state.keys[key] = true;
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (e.key === "ArrowUp") state.keys["arrowup"] = false;
    if (e.key === "ArrowDown") state.keys["arrowdown"] = false;
    if (e.key === "ArrowLeft") state.keys["arrowleft"] = false;
    if (e.key === "ArrowRight") state.keys["arrowright"] = false;

    state.keys[key] = false;
  });

  window.addEventListener("resize", () => {
    if (!state.canvas) return;
    state.canvas.width = window.innerWidth;
    state.canvas.height = window.innerHeight;
  });
}
