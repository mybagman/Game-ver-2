// ======== player.js ========

// Canvas reference (set from main game)
export let canvas;
export let ctx;

// ======== Player setup ========
export let player = {
  x: 0,
  y: 0,
  size: 30,
  speed: 5,
  health: 100,
  maxHealth: 100
};

export let keys = {};
export let bullets = [];
let shootCooldown = 0;

// ======== Initialize player position ========
export function initPlayer(canvasRef, ctxRef) {
  canvas = canvasRef;
  ctx = ctxRef;
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  // Event listeners for movement & shooting
  document.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; });
  document.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
}

// ======== Handle player movement ========
export function updatePlayer() {
  let newX = player.x;
  let newY = player.y;

  if (keys["w"]) newY -= player.speed;
  if (keys["s"]) newY += player.speed;
  if (keys["a"]) newX -= player.speed;
  if (keys["d"]) newX += player.speed;

  // Prevent moving outside canvas
  player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, newX));
  player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, newY));
}

// ======== Handle Shooting ========
export function handleShooting() {
  if (shootCooldown > 0) shootCooldown--;

  let dirX = 0, dirY = 0;
  if (keys["arrowup"]) dirY = -1;
  if (keys["arrowdown"]) dirY = 1;
  if (keys["arrowleft"]) dirX = -1;
  if (keys["arrowright"]) dirX = 1;

  if ((dirX !== 0 || dirY !== 0) && shootCooldown === 0) {
    const mag = Math.hypot(dirX, dirY) || 1;
    bullets.push({
      x: player.x,
      y: player.y,
      dx: (dirX / mag) * 10,
      dy: (dirY / mag) * 10,
      size: 6
    });
    shootCooldown = 10;
  }
}

// ======== Update Bullets ========
export function updateBullets() {
  bullets = bullets.filter(b => {
    b.x += b.dx;
    b.y += b.dy;
    return b.x >= -20 && b.x <= canvas.width + 20 && b.y >= -20 && b.y <= canvas.height + 20;
  });
}

// ======== Draw Player & Bullets ========
export function drawPlayer() {
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

export function drawBullets() {
  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size));
}
