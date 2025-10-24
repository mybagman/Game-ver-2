// enemy.js
import { Explosion } from "./explosion.js";

export class Enemy {
  constructor(x, y, type = "square") {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 2;
    this.health = 30;
    this.type = type;
    this.angle = Math.random() * Math.PI * 2;
    this.orbitAngle = Math.random() * Math.PI * 2; // used by diamond orbit
    this.orbitRadius = 150 + Math.random() * 50;
    this.target = null;
  }

  // Movement logic per type
  update(player) {
    switch (this.type) {
      case "square":
        this.moveToward(player, 2.5);
        break;
      case "triangle":
        this.moveToward(player, 3.2);
        break;
      case "reflector":
        this.orbit(player, 4);
        break;
      case "boss":
        this.moveToward(player, 1.2);
        break;
      case "mini-boss":
        this.moveToward(player, 2);
        break;
      case "diamond":
        this.diamondBehavior(player);
        break;
    }
  }

  moveToward(target, speed) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
    }
  }

  orbit(target, speed) {
    this.orbitAngle += 0.02;
    this.x = target.x + Math.cos(this.orbitAngle) * this.orbitRadius;
    this.y = target.y + Math.sin(this.orbitAngle) * this.orbitRadius;
  }

  diamondBehavior(player) {
    // diamond freely moves and seeks enemies
    this.angle += 0.03;
    this.x += Math.cos(this.angle) * 3;
    this.y += Math.sin(this.angle) * 3;

    // slight homing pull toward player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 400) {
      this.x += (dx / dist) * 1.5;
      this.y += (dy / dist) * 1.5;
    }
  }

  draw(ctx) {
    ctx.save();
    switch (this.type) {
      case "square":
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        break;
      case "triangle":
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size / 1.2);
        ctx.lineTo(this.x - this.size / 1.2, this.y + this.size / 1.2);
        ctx.lineTo(this.x + this.size / 1.2, this.y + this.size / 1.2);
        ctx.closePath();
        ctx.fill();
        break;
      case "reflector":
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 1.5, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "boss":
        ctx.fillStyle = "purple";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "mini-boss":
        ctx.fillStyle = "magenta";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "diamond":
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x + this.size, this.y);
        ctx.lineTo(this.x, this.y + this.size);
        ctx.lineTo(this.x - this.size, this.y);
        ctx.closePath();
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  hit(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      return new Explosion(this.x, this.y);
    }
    return null;
  }

  isDead() {
    return this.health <= 0;
  }
}
