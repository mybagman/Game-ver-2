// Game State Management
const gameState = {
  player: {
    x: 100,
    y: 100,
    width: 40,
    height: 40,
    speed: 5,
    health: 100,
    maxHealth: 100,
    score: 0,
    activeWeapon: null, // Track currently active weapon (gold star)
    weapons: {
      goldStar: {
        active: false,
        damage: 25,
        fireRate: 100,
        range: 300,
        lastFired: 0
      }
    }
  },
  
  enemies: [],
  
  projectiles: [],
  
  powerUps: [],
  
  ui: {
    score: 0,
    health: 100,
    weaponStatus: {
      goldStar: {
        available: false,
        ammo: 0,
        cooldown: 0
      }
    }
  },
  
  game: {
    paused: false,
    gameOver: false,
    wave: 1,
    enemySpawnRate: 1000,
    lastEnemySpawn: 0
  }
};

// Helper functions to manage state
function updatePlayerPosition(x, y) {
  gameState.player.x = x;
  gameState.player.y = y;
}

function updatePlayerHealth(amount) {
  gameState.player.health = Math.max(0, Math.min(gameState.player.maxHealth, gameState.player.health + amount));
  gameState.ui.health = gameState.player.health;
}

function setActiveWeapon(weaponName) {
  gameState.player.activeWeapon = weaponName;
  if (weaponName === 'goldStar') {
    gameState.player.weapons.goldStar.active = true;
  }
}

function deactivateWeapon(weaponName) {
  if (gameState.player.activeWeapon === weaponName) {
    gameState.player.activeWeapon = null;
  }
  if (weaponName === 'goldStar') {
    gameState.player.weapons.goldStar.active = false;
  }
}

function addEnemy(enemy) {
  gameState.enemies.push(enemy);
}

function removeEnemy(index) {
  gameState.enemies.splice(index, 1);
}

function addProjectile(projectile) {
  gameState.projectiles.push(projectile);
}

function removeProjectile(index) {
  gameState.projectiles.splice(index, 1);
}

function addScore(points) {
  gameState.player.score += points;
  gameState.ui.score = gameState.player.score;
}

function updateWeaponCooldown(weaponName, cooldown) {
  if (weaponName === 'goldStar') {
    gameState.ui.weaponStatus.goldStar.cooldown = cooldown;
  }
}

function resetGameState() {
  gameState.player.health = gameState.player.maxHealth;
  gameState.player.score = 0;
  gameState.player.activeWeapon = null;
  gameState.enemies = [];
  gameState.projectiles = [];
  gameState.powerUps = [];
  gameState.game.paused = false;
  gameState.game.gameOver = false;
  gameState.game.wave = 1;
  gameState.ui.score = 0;
  gameState.ui.health = gameState.player.maxHealth;
}

export default gameState;
export { updatePlayerPosition, updatePlayerHealth, setActiveWeapon, deactivateWeapon, addEnemy, removeEnemy, addProjectile, removeProjectile, addScore, updateWeaponCooldown, resetGameState };