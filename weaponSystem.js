/**
 * Weapon System Module
 * Manages weapon switching and active weapon state for the Gold Star
 */

class WeaponSystem {
  constructor() {
    this.weapons = new Map();
    this.activeWeapon = null;
    this.weaponSlots = [];
  }

  /**
   * Register a weapon in the system
   * @param {string} weaponId - Unique identifier for the weapon
   * @param {Object} weaponData - Weapon configuration object
   */
  registerWeapon(weaponId, weaponData) {
    if (!weaponId || !weaponData) {
      console.error('Invalid weapon registration: missing weaponId or weaponData');
      return false;
    }
    
    this.weapons.set(weaponId, {
      id: weaponId,
      name: weaponData.name,
      damage: weaponData.damage || 0,
      fireRate: weaponData.fireRate || 1,
      ammo: weaponData.ammo || Infinity,
      type: weaponData.type || 'default',
      ...weaponData
    });
    
    console.log(`Weapon registered: ${weaponId}`);
    return true;
  }

  /**
   * Switch to a different active weapon
   * @param {string} weaponId - ID of the weapon to switch to
   * @returns {boolean} - Success status of the switch
   */
  switchWeapon(weaponId) {
    if (!this.weapons.has(weaponId)) {
      console.error(`Weapon not found: ${weaponId}`);
      return false;
    }

    const previousWeapon = this.activeWeapon;
    this.activeWeapon = weaponId;

    console.log(`Switched weapon from ${previousWeapon} to ${weaponId}`);
    return true;
  }

  /**
   * Switch to the next weapon in the slot order
   * @returns {boolean} - Success status of the switch
   */
  switchToNextWeapon() {
    if (this.weaponSlots.length === 0) {
      console.warn('No weapon slots available');
      return false;
    }

    const currentIndex = this.weaponSlots.indexOf(this.activeWeapon);
    const nextIndex = (currentIndex + 1) % this.weaponSlots.length;
    const nextWeaponId = this.weaponSlots[nextIndex];

    return this.switchWeapon(nextWeaponId);
  }

  /**
   * Switch to the previous weapon in the slot order
   * @returns {boolean} - Success status of the switch
   */
  switchToPreviousWeapon() {
    if (this.weaponSlots.length === 0) {
      console.warn('No weapon slots available');
      return false;
    }

    const currentIndex = this.weaponSlots.indexOf(this.activeWeapon);
    const previousIndex = (currentIndex - 1 + this.weaponSlots.length) % this.weaponSlots.length;
    const previousWeaponId = this.weaponSlots[previousIndex];

    return this.switchWeapon(previousWeaponId);
  }

  /**
   * Get the currently active weapon
   * @returns {Object|null} - Active weapon data or null
   */
  getActiveWeapon() {
    return this.activeWeapon ? this.weapons.get(this.activeWeapon) : null;
  }

  /**
   * Get all registered weapons
   * @returns {Array} - Array of all weapon objects
   */
  getAllWeapons() {
    return Array.from(this.weapons.values());
  }

  /**
   * Add a weapon to the active slot order
   * @param {string} weaponId - ID of the weapon to add
   * @returns {boolean} - Success status
   */
  addWeaponSlot(weaponId) {
    if (!this.weapons.has(weaponId)) {
      console.error(`Weapon not found: ${weaponId}`);
      return false;
    }

    if (!this.weaponSlots.includes(weaponId)) {
      this.weaponSlots.push(weaponId);
      
      // Set as active if this is the first weapon
      if (!this.activeWeapon) {
        this.activeWeapon = weaponId;
      }
      
      console.log(`Added ${weaponId} to weapon slots`);
      return true;
    }

    return false;
  }

  /**
   * Remove a weapon from the active slot order
   * @param {string} weaponId - ID of the weapon to remove
   * @returns {boolean} - Success status
   */
  removeWeaponSlot(weaponId) {
    const index = this.weaponSlots.indexOf(weaponId);
    
    if (index > -1) {
      this.weaponSlots.splice(index, 1);

      // Switch to another weapon if the removed weapon was active
      if (this.activeWeapon === weaponId) {
        this.activeWeapon = this.weaponSlots.length > 0 ? this.weaponSlots[0] : null;
      }

      console.log(`Removed ${weaponId} from weapon slots`);
      return true;
    }

    return false;
  }

  /**
   * Use the currently active weapon
   * @returns {Object|null} - Result of weapon usage or null
   */
  useActiveWeapon() {
    const weapon = this.getActiveWeapon();
    
    if (!weapon) {
      console.warn('No active weapon selected');
      return null;
    }

    if (weapon.ammo <= 0 && weapon.ammo !== Infinity) {
      console.warn(`No ammo left for ${weapon.name}`);
      return null;
    }

    if (weapon.ammo !== Infinity) {
      weapon.ammo--;
    }

    console.log(`Used weapon: ${weapon.name} (Ammo: ${weapon.ammo})`);
    
    return {
      weaponId: weapon.id,
      damage: weapon.damage,
      fireRate: weapon.fireRate,
      ammoRemaining: weapon.ammo
    };
  }

  /**
   * Refill ammo for a specific weapon
   * @param {string} weaponId - ID of the weapon
   * @param {number} amount - Amount of ammo to add
   * @returns {boolean} - Success status
   */
  refillWeaponAmmo(weaponId, amount) {
    if (!this.weapons.has(weaponId)) {
      console.error(`Weapon not found: ${weaponId}`);
      return false;
    }

    const weapon = this.weapons.get(weaponId);
    weapon.ammo += amount;
    
    console.log(`Refilled ${weaponId} with ${amount} ammo. New total: ${weapon.ammo}`);
    return true;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeaponSystem;
}
