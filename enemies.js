// waveManager.js
import { Enemy } from "./enemy.js";

export class WaveManager {
  constructor(enemiesArray, diamondsArray) {
    this.wave = 0;
    this.enemies = enemiesArray;
    this.diamonds = diamondsArray;
    this.waveActive = false;
  }

  startNextWave() {
    this.waveActive = true;
    this.spawnWave(this.wave);
  }

  spawnWave(waveNumber) {
    this.enemies.length = 0;
    this.diamonds.length = 0;

    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;

    switch (waveNumber) {
      case 0:
        this.spawnEnemies("square", 2);
        break;
      case 1:
        this.spawnEnemies("square", 3);
        this.spawnEnemies("triangle", 2);
        break;
      case 2:
        this.spawnEnemies("square", 5);
        this.spawnEnemies("triangle", 4);
        break;
      case 3:
        this.spawnEnemies("square", 3);
        this.spawnEnemies("triangle", 2);
        this.spawnEnemies("reflector", 1);
        break;
      case 4:
        this.spawnEnemies("square", 5);
        this.spawnEnemies("triangle", 4);
        this.spawnEnemies("reflector", 1);
        break;
      case 5:
        this.spawnEnemies("boss", 1);
        this.spawnEnemies("triangle", 3);
        break;
      case 6:
        this.spawnEnemies("reflector", 2);
        this.spawnEnemies("triangle", 5);
        break;
      case 7:
        this.spawnEnemies("square", 5);
        this.spawnEnemies("triangle", 5);
        this.spawnEnemies("reflector", 1);
        this.spawnEnemies("mini-boss", 1);
        break;
      case 8:
        this.spawnEnemies("mini-boss", 3);
        this.spawnEnemies("boss", 1);
        this.spawnEnemies("triangle", 5);
        this.spawnEnemies("reflector", 1);
        break;
      case 9:
        this.spawnEnemies("triangle", 8);
        this.spawnEnemies("reflector", 3);
        break;
      case 10:
        this.spawnEnemies("square", 5);
        this.spawnEnemies("triangle", 5);
        this.spawnEnemies("reflector", 3);
        this.spawnDiamond(centerX, centerY);
        break;
      default:
        console.log("All waves completed!");
        this.waveActive = false;
        break;
    }
  }

  spawnEnemies(type, count) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * innerWidth;
      const y = Math.random() * innerHeight;
      this.enemies.push(new Enemy(x, y, type));
    }
  }

  spawnDiamond(x, y) {
    const diamond = new Enemy(x, y, "diamond");
    this.diamonds.push(diamond);
    this.enemies.push(diamond);
  }

  updateWave() {
    // remove dead enemies
    this.enemies = this.enemies.filter(e => !e.isDead());

    if (this.enemies.length === 0 && this.waveActive) {
      this.wave++;
      this.waveActive = false;
      setTimeout(() => this.startNextWave(), 2000);
    }
  }

  drawWaveInfo(ctx, score) {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Wave: ${this.wave + 1}`, 20, 60);
    ctx.fillText(`Score: ${score}`, 20, 90);
  }
}
