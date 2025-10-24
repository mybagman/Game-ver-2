// bullet.js
export class Bullet {
  constructor(x, y, dirX, dirY) {
    this.x = x;
    this.y = y;
    this.size = 6;
    this.speed = 12;
    this.dirX = dirX;
    this.dirY = dirY;
  }

  update() {
    this.x += this.dirX * this.speed;
    this.y += this.dirY * this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }

  offscreen(width, height) {
    return (
      this.x < -this.size ||
      this.x > width + this.size ||
      this.y < -this.size ||
      this.y > height + this.size
    );
  }
}
