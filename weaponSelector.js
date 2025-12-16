/**
 * weaponSelector.js
 * Handles weapon selection for the Gold Star character
 * Key Bindings: 1 = Red Punch, 2 = Blue Cannon, 3 = Rail Gun
 */

class WeaponSelector {
  constructor() {
    this.weapons = {
      1: {
        name: 'Red Punch',
        key: '1',
        damage: 15,
        cooldown: 0.5,
        range: 'melee',
        color: 'red'
      },
      2: {
        name: 'Blue Cannon',
        key: '2',
        damage: 25,
        cooldown: 1.5,
        range: 'medium',
        color: 'blue'
      },
      3: {
        name: 'Rail Gun',
        key: '3',
        damage: 40,
        cooldown: 3.0,
        range: 'long',
        color: 'cyan'
      }
    };

    this.currentWeapon = 1; // Default to Red Punch
    this.lastSwitchTime = 0;
    this.switchCooldown = 0.2; // Cooldown between weapon switches

    this.initializeKeyBindings();
  }

  /**
   * Initialize keyboard event listeners for weapon switching
   */
  initializeKeyBindings() {
    document.addEventListener('keydown', (event) => {
      const key = event.key;

      // Check if the key is 1, 2, or 3
      if (['1', '2', '3'].includes(key)) {
        event.preventDefault();
        this.switchWeapon(parseInt(key));
      }
    });
  }

  /**
   * Switch to a specific weapon
   * @param {number} weaponNumber - The weapon slot number (1, 2, or 3)
   */
  switchWeapon(weaponNumber) {
    const now = Date.now();

    // Check if weapon switch is on cooldown
    if (now - this.lastSwitchTime < this.switchCooldown * 1000) {
      return;
    }

    // Validate weapon number
    if (!this.weapons[weaponNumber]) {
      console.warn(`Invalid weapon number: ${weaponNumber}`);
      return;
    }

    // Avoid switching to the same weapon
    if (this.currentWeapon === weaponNumber) {
      return;
    }

    this.currentWeapon = weaponNumber;
    this.lastSwitchTime = now;

    this.onWeaponChanged();
  }

  /**
   * Get the current active weapon
   * @returns {Object} The current weapon object
   */
  getCurrentWeapon() {
    return this.weapons[this.currentWeapon];
  }

  /**
   * Get weapon information by number
   * @param {number} weaponNumber - The weapon slot number
   * @returns {Object} The weapon object or null if invalid
   */
  getWeapon(weaponNumber) {
    return this.weapons[weaponNumber] || null;
  }

  /**
   * Get all available weapons
   * @returns {Object} All weapons object
   */
  getAllWeapons() {
    return this.weapons;
  }

  /**
   * Callback when weapon is changed
   * Override this method or attach listeners for custom behavior
   */
  onWeaponChanged() {
    const weapon = this.getCurrentWeapon();
    console.log(`Weapon switched to: ${weapon.name}`);
    this.displayWeaponUI(weapon);
  }

  /**
   * Display weapon UI update (update HUD/UI elements)
   * @param {Object} weapon - The current weapon object
   */
  displayWeaponUI(weapon) {
    // This method can be overridden to update the game UI
    // Example: Update HUD to show current weapon
    const weaponDisplay = document.getElementById('weapon-display');
    if (weaponDisplay) {
      weaponDisplay.textContent = weapon.name;
      weaponDisplay.style.color = weapon.color;
    }
  }

  /**
   * Execute the current weapon attack
   * @param {Object} target - The target object or coordinates
   * @returns {Object} Attack result information
   */
  executeAttack(target) {
    const weapon = this.getCurrentWeapon();
    const attackResult = {
      weapon: weapon.name,
      damage: weapon.damage,
      target: target,
      timestamp: Date.now()
    };

    console.log(`${weapon.name} attack executed with ${weapon.damage} damage`);
    return attackResult;
  }

  /**
   * Get weapon switch cooldown remaining
   * @returns {number} Milliseconds remaining until next weapon switch is allowed
   */
  getSwitchCooldownRemaining() {
    const now = Date.now();
    const timeSinceLastSwitch = now - this.lastSwitchTime;
    const cooldownMs = this.switchCooldown * 1000;

    return Math.max(0, cooldownMs - timeSinceLastSwitch);
  }

  /**
   * Print available weapons and current selection
   */
  displayWeaponStatus() {
    console.log('=== Weapon Selector Status ===');
    console.log(`Current Weapon: ${this.getCurrentWeapon().name}`);
    console.log('\nAvailable Weapons:');
    for (const [key, weapon] of Object.entries(this.weapons)) {
      const marker = key === String(this.currentWeapon) ? '> ' : '  ';
      console.log(`${marker}[${key}] ${weapon.name} - Damage: ${weapon.damage}, Cooldown: ${weapon.cooldown}s, Range: ${weapon.range}`);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeaponSelector;
}
