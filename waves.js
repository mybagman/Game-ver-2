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
  { theme: "desert-combat", enemies: [{ type: "red-square", count: 6 }, { type: "triangle", count: 6 }, { type: "mech", count: 1 }] },
  { theme: "desert-battle", enemies: [{ type: "tank", count: 4 }, { type: "walker", count: 3 }, { type: "mech", count: 1 }] },
  { theme: "siege-defense", enemies: [] },
  // Taking Back Earth Arc - Waves 15-21
  { theme: "reclamation-begins", enemies: [{ type: "red-square", count: 8 }, { type: "triangle", count: 6 }, { type: "reflector", count: 2 }] },
  { theme: "forward-push", enemies: [{ type: "tank", count: 5 }, { type: "walker", count: 4 }, { type: "triangle", count: 8 }, { type: "reflector", count: 1 }] },
  { theme: "enemy-stronghold", enemies: [{ type: "mech", count: 2 }, { type: "tank", count: 4 }, { type: "mini-boss", count: 1 }, { type: "triangle", count: 6 }] },
  { theme: "breakthrough", enemies: [{ type: "red-square", count: 10 }, { type: "triangle", count: 10 }, { type: "reflector", count: 3 }, { type: "walker", count: 2 }] },
  { theme: "reinforcements", enemies: [{ type: "tank", count: 6 }, { type: "walker", count: 5 }, { type: "mech", count: 2 }, { type: "triangle", count: 5 }] },
  { theme: "final-assault", enemies: [{ type: "mech", count: 3 }, { type: "mini-boss", count: 2 }, { type: "tank", count: 4 }, { type: "walker", count: 4 }, { type: "reflector", count: 2 }] },
  { theme: "earth-liberation", enemies: [
      { type: "boss", count: 1 },
      { type: "mini-boss", count: 2 },
      { type: "mech", count: 2 },
      { type: "tank", count: 5 },
      { type: "walker", count: 4 },
      { type: "triangle", count: 8 },
      { type: "reflector", count: 3 },
      { type: "diamond", count: 1 }
    ]
  },
  { theme: "mother-core", enemies: [{ type: "mother-core", count: 1 }, { type: "triangle", count: 8 }, { type: "reflector", count: 2 }] },
  
  // NEW ARC: Journey to the Centre of the Earth (Waves 23-32)
  // Wave 23: Entry into the cave system
  { theme: "cave-entry", enemies: [{ type: "worm", count: 2 }, { type: "red-square", count: 4 }, { type: "triangle", count: 3 }] },
  
  // Wave 24: Deeper into the earth
  { theme: "cave-depth-1", enemies: [{ type: "worm", count: 3 }, { type: "triangle", count: 5 }, { type: "reflector", count: 1 }] },
  
  // Wave 25: First dinosaurs appear
  { theme: "cave-depth-2", enemies: [{ type: "dinosaur", count: 1 }, { type: "worm", count: 2 }, { type: "red-square", count: 5 }] },
  
  // Wave 26: Underground ecosystem
  { theme: "underground-cavern", enemies: [{ type: "dinosaur", count: 2 }, { type: "worm", count: 3 }, { type: "triangle", count: 4 }] },
  
  // Wave 27: Prehistoric battle
  { theme: "prehistoric-zone", enemies: [{ type: "dinosaur", count: 3 }, { type: "worm", count: 2 }, { type: "reflector", count: 2 }] },
  
  // Wave 28: Deep caverns
  { theme: "deep-cavern", enemies: [{ type: "dinosaur", count: 2 }, { type: "worm", count: 4 }, { type: "mini-boss", count: 1 }, { type: "triangle", count: 5 }] },
  
  // Wave 29: Approaching the core
  { theme: "near-core", enemies: [{ type: "dinosaur", count: 3 }, { type: "worm", count: 3 }, { type: "red-square", count: 6 }, { type: "reflector", count: 2 }] },
  
  // Wave 30: Molten depths
  { theme: "molten-depths", enemies: [{ type: "dinosaur", count: 4 }, { type: "worm", count: 2 }, { type: "tank", count: 2 }, { type: "triangle", count: 6 }] },
  
  // Wave 31: Final descent
  { theme: "final-descent", enemies: [{ type: "dinosaur", count: 3 }, { type: "worm", count: 4 }, { type: "mini-boss", count: 2 }, { type: "reflector", count: 3 }] },
  
  // Wave 32: Molten Diamond Boss
  { theme: "molten-core", enemies: [{ type: "molten-diamond", count: 1 }, { type: "dinosaur", count: 2 }, { type: "worm", count: 3 }] }
];
