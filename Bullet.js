// Bullet.js
export class BulletManager {
  constructor() {
    this.bullets = [];
  }

  update(canvas) {
    this.bullets = this.bullets.filter(b => {
      b.x += b.dx;
      b.y += b.dy;
      return b.x >= -20 && b.x <= canvas.width + 20 && b.y >= -20 && b.y <= canvas.height + 20;
    });
  }

  draw(ctx) {
    ctx.fillStyle = "yellow";
    this.bullets.forEach(b => ctx.fillRect(b.x - b.size/2, b.y - b.size/2, b.size, b.size));
  }
}
