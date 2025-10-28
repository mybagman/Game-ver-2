// main.js
import { Player } from "./Player.js";
import { Enemy } from "./Enemy.js";
import { WaveManager } from "./WaveManager.js";
import { Bullet } from "./Bullet.js";
import { Explosion } from "./Explosion.js";
import { Tunnel } from "./Tunnel.js";
import { Diamond } from "./Diamond.js";
import { Utils } from "./Utils.js"; // optional helper functions

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state variables
let keys = {};
let bullets = [];
let enemies = [];
let diamonds = [];
let explosions = [];
let score = 0;

// Initialize main objects
const player = new Player(innerWidth / 2, innerHeight / 2);
const waveManager = new WaveManager(enemies, diamonds);

// Input handling
window.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " ") {
    bullets.push(player.shoot());
  }
});

window.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update player
  player.update(keys);
  player.draw(ctx);

  // Update enemies
  enemies.forEach(enemy => {
    enemy.update(player);
    enemy.draw(ctx);
  });

  // Update bullets
  bullets.forEach((bullet, index) => {
    bullet.update();
    bullet.draw(ctx);

    enemies.forEach(enemy => {
      if (bullet.hits(enemy)) {
        enemy.takeDamage(bullet.damage);
        bullets.splice(index, 1);
        score += 10;

        if (enemy.isDead()) {
          explosions.push(new Explosion(enemy.x, enemy.y));
        }
      }
    });
  });

  // Update explosions
  explosions.forEach((explosion, i) => {
    explosion.update();
    explosion.draw(ctx);
    if (explosion.done) explosions.splice(i, 1);
  });

  // Update wave system
  waveManager.updateWave();
  waveManager.drawWaveInfo(ctx, score);

  requestAnimationFrame(gameLoop);
}

// Start the first wave and loop
waveManager.startNextWave();
gameLoop();
