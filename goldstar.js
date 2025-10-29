// goldstar.js
// Responsible for Gold Star power-up handling and related logic.
//
// Note: This file exposes a single helper `processPickedPowerUps(state, picked)`
// which applies the effects of picked power-ups to the provided `state` object.
// It intentionally uses `state.filterPowerUps(...)` instead of reassigning
// `state.powerUps` to avoid reassigning an imported binding.

function safeCall(fn, ...args) {
  if (typeof fn === "function") return fn(...args);
  // fallback: silently ignore if not provided
  return undefined;
}

// Called whenever GoldStar levels up. Prefer to use a function supplied on state,
// otherwise this is a no-op. This keeps this module self-contained while allowing
// the rest of the engine to provide the real implementation.
function levelUpGoldStar(state) {
  // prefer state's implementation if available
  return safeCall(state && state.levelUpGoldStar, state);
}

// Create an explosion visual at x,y with color. Prefer state's implementation.
function createExplosion(state, x, y, color) {
  return safeCall(state && state.createExplosion, x, y, color);
}

// Apply effects for each picked power-up and update state accordingly.
// - state: game state object (expected to contain goldStar, player, addScore, filterPowerUps, etc.)
// - picked: array of power-up objects that were picked (each has at least { type, x, y })
function processPickedPowerUps(state, picked = []) {
  if (!state || !Array.isArray(picked) || picked.length === 0) return;

  for (const pu of picked) {
    if (!pu || !pu.type) continue;

    if (pu.type === "red-punch") {
      state.goldStar = state.goldStar || {};
      state.goldStar.redKills = (state.goldStar.redKills || 0) + 1;

      if (state.goldStar.redKills % 5 === 0 && (state.goldStar.redPunchLevel || 0) < 5) {
        state.goldStar.redPunchLevel = (state.goldStar.redPunchLevel || 0) + 1;
        levelUpGoldStar(state);
      }

      createExplosion(state, pu.x, pu.y, "orange");
      safeCall(state && state.addScore, 8);
    }
    else if (pu.type === "blue-cannon") {
      // Note: corrected property name to `blueCannonLevel` (single 'n').
      state.goldStar = state.goldStar || {};
      state.goldStar.blueKills = (state.goldStar.blueKills || 0) + 1;

      if (state.goldStar.blueKills % 5 === 0 && (state.goldStar.blueCannonLevel || 0) < 5) {
        state.goldStar.blueCannonLevel = (state.goldStar.blueCannonLevel || 0) + 1;
        levelUpGoldStar(state);
      }

      createExplosion(state, pu.x, pu.y, "cyan");
      safeCall(state && state.addScore, 8);
    }
    else if (pu.type === "health") {
      state.goldStar = state.goldStar || {};
      state.player = state.player || {};

      const gMax = state.goldStar.maxHealth || 100;
      const pMax = state.player.maxHealth || 100;
      const gHealth = state.goldStar.health || 0;
      const pHealth = state.player.health || 0;

      state.goldStar.health = Math.min(gMax, gHealth + 30);
      state.player.health = Math.min(pMax, pHealth + 30);

      createExplosion(state, pu.x, pu.y, "magenta");
      safeCall(state && state.addScore, 5);
    }
    else if (pu.type === "reflect") {
      state.goldStar = state.goldStar || {};
      state.player = state.player || {};

      state.goldStar.reflectAvailable = true;
      state.player.reflectAvailable = true;

      createExplosion(state, pu.x, pu.y, "magenta");
      safeCall(state && state.addScore, 12);
    }
    else {
      // Unknown power-up types can be handled here if needed
      // create a small neutral effect to signal pickup
      createExplosion(state, pu.x, pu.y, "white");
      safeCall(state && state.addScore, 1);
    }
  }

  // Remove picked power-ups from the active list using the state's mutator.
  // This avoids reassigning `state.powerUps` (which may be an imported/immutable binding).
  if (typeof state.filterPowerUps === "function") {
    state.filterPowerUps(p => !picked.includes(p));
  } else if (Array.isArray(state.powerUps)) {
    // Fallback: if no mutator is provided, mutate the array in-place.
    // Keep only those not in picked.
    const remaining = state.powerUps.filter(p => !picked.includes(p));
    state.powerUps.length = 0;
    state.powerUps.push(...remaining);
  }
}

module.exports = {
  processPickedPowerUps,
};
