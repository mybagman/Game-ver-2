// waves.js
// This module exports the array of waves for use in waveManager.js

export const waves = [
  { enemies: [{ type: "red-square", count: 2 }] },
  { enemies: [{ type: "red-square", count: 3 }, { type: "triangle", count: 2 }] },
  { enemies: [{ type: "red-square", count: 5 }, { type: "triangle", count: 4 }] },
  { enemies: [{ type: "red-square", count: 3 }, { type: "triangle", count: 2 }, { type: "reflector", count: 1 }] },
  { tunnel: true, enemies: [{ type: "red-square", count: 5 }, { type: "triangle", count: 4 }, { type: "reflector", count: 1 }] },
  { enemies: [{ type: "boss", count: 1 }, { type: "triangle", count: 3 }] },
  { enemies: [{ type: "reflector", count: 2 }, { type: "triangle", count: 5 }] },
  { tunnel: true, enemies: [{ type: "red-square", count: 5 }, { type: "triangle", count: 5 }, { type: "reflector", count: 1 }, { type: "mini-boss", count: 1 }] },
  { enemies: [{ type: "mini-boss", count: 3 }, { type: "boss", count: 1 }, { type: "triangle", count: 5 }, { type: "reflector", count: 1 }] },
  { tunnel: true, enemies: [{ type: "triangle", count: 8 }, { type: "reflector", count: 3 }] },
  { enemies: [{ type: "red-square", count: 5 }, { type: "triangle", count: 5 }, { type: "reflector", count: 3 }, { type: "diamond", count: 1 }] },
  { theme: "atmospheric-entry", enemies: [{ type: "red-square", count: 8 }, { type: "triangle", count: 6 }] },
  { theme: "cloud-combat", clouds: true, enemies: [{ type: "triangle", count: 10 }, { type: "reflector", count: 2 }] },
  { theme: "city-descent", enemies: [{ type: "red-square", count: 6 }, { type: "triangle", count: 6 }, { type: "tank", count: 2 }] },
  { theme: "ruined-city", enemies: [{ type: "tank", count: 4 }, { type: "walker", count: 3 }, { type: "mech", count: 1 }] },
  { theme: "siege-defense", enemies: [{ type: "tank", count: 3 }, { type: "walker", count: 4 }, { type: "mech", count: 2 }, { type: "triangle", count: 5 }] },
  { theme: "calm", enemies: [{ type: "reflector", count: 3 }, { type: "triangle", count: 4 }] },
  { theme: "counter-offensive", enemies: [{ type: "red-square", count: 10 }, { type: "triangle", count: 10 }, { type: "tank", count: 5 }, { type: "walker", count: 3 }] },
  { theme: "full-assault", enemies: [{ type: "tank", count: 6 }, { type: "walker", count: 6 }, { type: "mech", count: 3 }, { type: "mini-boss", count: 2 }] },
  { theme: "last-stand", enemies: [{ type: "red-square", count: 15 }, { type: "triangle", count: 15 }, { type: "tank", count: 5 }, { type: "walker", count: 5 }, { type: "mech", count: 4 }, { type: "diamond", count: 3 }] },
  { theme: "mother-core", enemies: [{ type: "mother-core", count: 1 }, { type: "triangle", count: 8 }, { type: "reflector", count: 4 }] }
];
