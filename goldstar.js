// goldstar.js
// Responsible for Gold Star power-up handling and related logic.
//
// Exports:
// - processPickedPowerUps(state, picked)
// - updateGoldStar(state, ...args)  // safe delegator; calls state.updateGoldStar if provided

function safeCall(fn, ...args) {
  if (typeof fn === "function") return fn(...args);
  // fallback: silently ignore if not provided
  return undefined;
}

// Called whenever GoldStar levels up. Prefer to use a function supplied on state,
// otherwise this is a no-op.
function levelUpGoldStar(state) {
  return safeCall(state && state.levelUpGoldStar, state);
}

// Create an explosion visual at x,y with color. Prefer state's implementation.
function createExplosion(state, x, y, color) {
  return safeCall(state && state.createExplosion, x, y, color);
}

// Apply effects for each picked power-up and update state accordingly.
// - state: game state object (expected to contain goldStar, player, addScore, filterPowerUps, etc.)
// - picked: array of power-up objects that were picked (each has at least { type, x, y })
export function processPickedPowerUps(state, picked = []) {
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
  if (typeof state.filterPowerUps === "function") {
    state.filterPowerUps(p => !picked.includes(p));
  } else if (Array.isArray(state.powerUps)) {
    const remaining = state.powerUps.filter(p => !picked.includes(p));
    state.powerUps.length = 0;
    state.powerUps.push(...remaining);
  }
}

// Provide a named export updateGoldStar so game.js can import it.
// Default implementation delegates to state's updateGoldStar if present.
// Keep arguments flexible (e.g., dt) so callers can pass frame delta or other params.
export function updateGoldStar(state, ...args) {
  // If the engine provides an implementation on state, call it.
  // Otherwise do nothing (safe no-op).
  return safeCall(state && state.updateGoldStar, state, ...args);
}
