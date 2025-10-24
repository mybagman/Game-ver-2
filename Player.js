// player.js
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 5;
    this.health = 100;
    this.maxHealth = 100;
    this.lives = 3;
    this.invulnerable = false;
    this.respawning = false;
    this.glowTime = 0;
    this.lastDir = { x: 1, y: 0 };
    this.shootCooldown = 0;
  }

  update(keys, canvasWidth, canvasHeight) {
    let moveX = 0, moveY = 0;
    if (keys["w"]) moveY -= 1;
    if (keys["s"]) moveY += 1;
    if (keys["a"]) moveX -= 1;
    if (keys["d"]) moveX += 1;

    const length = Math.hypot(moveX, moveY);
    if (length > 0) {
      moveX /= length;
      moveY /= length;
      this.lastDir = { x: moveX, y: moveY };
      this.x += moveX * this.speed;
      this.y += moveY * this.speed;
    }

    // Keep player on screen
    this.x = Math.max(this.size / 2, Math.min(canvasWidth - this.size / 2, this.x));
    this.y = Math.max(this.size / 2, Math.min(canvasHeight - this.size / 2, this.y));
  }

  draw(ctx) {
    ctx.save();
    if (this.invulnerable && Date.now() < this.glowTime) {
      ctx.shadowColor = "rgba(255, 255, 0, 0.7)";
      ctx.shadowBlur = 15;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  takeDamage(amount) {
    if (this.invulnerable || this.respawning) return;

    this.health -= amount;
    if (this.health <= 0) {
      this.lives--;
      this.respawn();
      return true; // player "died"
    }
    return false;
  }

  respawn() {
    if (this.lives > 0) {
      this.respawning = true;
      this.invulnerable = true;
      this.health = this.maxHealth;
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight / 2;
      this.glowTime = Date.now() + 2000;
      setTimeout(() => {
        this.invulnerable = false;
        this.respawning = false;
      }, 2000);
    }
  }
}
