// Player.js
export class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = 30;
    this.speed = 5;
    this.health = 100;
    this.maxHealth = 100;
    this.lastDir = { x: 1, y: 0 };
    this.shootCooldown = 0;
  }

  move(keys, tunnels, createExplosion) {
    let newX = this.x, newY = this.y;
    if (keys["w"]) { newY -= this.speed; this.lastDir = { x: 0, y: -1 }; }
    if (keys["s"]) { newY += this.speed; this.lastDir = { x: 0, y: 1 }; }
    if (keys["a"]) { newX -= this.speed; this.lastDir = { x: -1, y: 0 }; }
    if (keys["d"]) { newX += this.speed; this.lastDir = { x: 1, y: 0 }; }

    let blocked = false;
    for (const t of tunnels) {
      if (newX + this.size / 2 > t.x && newX - this.size / 2 < t.x + t.width &&
          newY + this.size / 2 > t.y && newY - this.size / 2 < t.y + t.height) {
        blocked = true;
        this.health -= 1;
        createExplosion(this.x, this.y, "cyan");
        break;
      }
    }
    if (!blocked) { this.x = newX; this.y = newY; }
  }

  shoot(keys, bullets) {
    if (this.shootCooldown > 0) this.shootCooldown--;
    let dirX = 0, dirY = 0;
    if (keys["arrowup"]) dirY = -1;
    if (keys["arrowdown"]) dirY = 1;
    if (keys["arrowleft"]) dirX = -1;
    if (keys["arrowright"]) dirX = 1;

    if ((dirX !== 0 || dirY !== 0) && this.shootCooldown === 0) {
      const mag = Math.hypot(dirX, dirY) || 1;
      bullets.push({
        x: this.x,
        y: this.y,
        dx: (dirX / mag) * 10,
        dy: (dirY / mag) * 10,
        size: 6
      });
      this.shootCooldown = 10;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "lime";
    ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
  }
}
