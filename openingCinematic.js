/**
 * openingCinematic.js
 * Opening cinematic sequence for the game featuring:
 * - Scene 1: Earth 1970 (peaceful)
 * - Scene 2: Earth 2025 (dystopian)
 * - Scene 3: Present Day - Resistance Asteroid
 * - Matrix-style typing effects
 * - Character dialog pop-ups
 * - Fade transitions
 */

// Scene definitions
const SCENES = [
  {
    id: 'earth1970',
    duration: 480, // 8 seconds at 60fps
    locationText: 'EARTH 1970',
    typeStartFrame: 30,
    dialogStartFrame: 90,
    dialogs: [
      {
        character: 'leader',
        text: "That's when it all started, the downfall of free society.",
        startFrame: 90,
        duration: 240
      }
    ],
    fadeOutStart: 420,
    fadeOutDuration: 60
  },
  {
    id: 'earth2025_part1',
    duration: 420, // 7 seconds at 60fps
    locationText: '2025',
    typeStartFrame: 30,
    dialogStartFrame: 90,
    dialogs: [
      {
        character: 'leader',
        text: "With the rise of AI, Everyone became distracted.",
        startFrame: 90,
        duration: 210
      }
    ],
    fadeOutStart: 360,
    fadeOutDuration: 60
  },
  {
    id: 'earth2025_part2',
    duration: 480, // 8 seconds at 60fps
    locationText: '',  // No location text for part 2
    typeStartFrame: 0,
    dialogStartFrame: 30,
    dialogs: [
      {
        character: 'leader',
        text: "Even the few that had escaped slavery couldnt control what came next.",
        startFrame: 30,
        duration: 240
      }
    ],
    fadeOutStart: 420,
    fadeOutDuration: 60
  },
  {
    id: 'asteroid',
    duration: 840, // 14 seconds at 60fps
    locationText: 'PRESENT DAY',
    typeStartFrame: 30,
    dialogStartFrame: 90,
    dialogs: [
      {
        character: 'leader',
        text: "The machine has taken over, we escaped, you are our last hope!",
        startFrame: 90,
        duration: 150
      },
      {
        character: 'player',
        text: "Roger That",
        startFrame: 270,
        duration: 90
      },
      {
        character: 'leader',
        text: "You grew up with the AI companion, Use it to your advantage",
        startFrame: 390,
        duration: 150
      },
      {
        character: 'player',
        text: "I'm going",
        startFrame: 570,
        duration: 90
      },
      {
        character: 'leader',
        text: "Good luck Ghost",
        startFrame: 690,
        duration: 90
      }
    ],
    launchStartFrame: 780,
    fadeOutStart: 780,
    fadeOutDuration: 60
  }
];

// Cinematic state
export const openingCinematicState = {
  active: false,
  frame: 0,
  sceneIndex: 0,
  sceneFrame: 0,
  typingText: '',
  typingIndex: 0,
  skipRequested: false
};

// Start the opening cinematic
export function startOpeningCinematic() {
  console.log('[openingCinematic] Starting opening cinematic');
  openingCinematicState.active = true;
  openingCinematicState.frame = 0;
  openingCinematicState.sceneIndex = 0;
  openingCinematicState.sceneFrame = 0;
  openingCinematicState.typingText = '';
  openingCinematicState.typingIndex = 0;
  openingCinematicState.skipRequested = false;
  console.log('[openingCinematic] State initialized:', openingCinematicState);
}

// Stop/skip the cinematic
export function skipOpeningCinematic() {
  console.log('[openingCinematic] Skip requested');
  openingCinematicState.skipRequested = true;
  openingCinematicState.active = false;
}

// Check if cinematic is complete
export function isOpeningCinematicComplete() {
  return openingCinematicState.skipRequested || 
         openingCinematicState.sceneIndex >= SCENES.length;
}

// Render a single frame of the opening cinematic
export function renderOpeningCinematic(ctx, width, height) {
  if (!openingCinematicState.active) return false;
  
  // Check for skip
  if (openingCinematicState.skipRequested) {
    openingCinematicState.active = false;
    return false;
  }
  
  // Get current scene
  if (openingCinematicState.sceneIndex >= SCENES.length) {
    openingCinematicState.active = false;
    return false;
  }
  
  const scene = SCENES[openingCinematicState.sceneIndex];
  const sceneFrame = openingCinematicState.sceneFrame;
  
  // Render scene background
  renderSceneBackground(ctx, width, height, scene, sceneFrame);
  
  // Render fade in (first 60 frames)
  if (sceneFrame < 60) {
    const fadeInAlpha = 1 - (sceneFrame / 60);
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeInAlpha})`;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Render location text with typing effect
  if (sceneFrame >= scene.typeStartFrame) {
    renderLocationText(ctx, width, height, scene, sceneFrame);
  }
  
  // Render dialog boxes
  renderDialogs(ctx, width, height, scene, sceneFrame);
  
  // Render fade out
  if (scene.fadeOutStart && sceneFrame >= scene.fadeOutStart) {
    const fadeProgress = (sceneFrame - scene.fadeOutStart) / scene.fadeOutDuration;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeProgress})`;
    ctx.fillRect(0, 0, width, height);
  }
  
  // Render skip prompt
  renderSkipPrompt(ctx, width, height);
  
  // Update frame counters
  openingCinematicState.frame++;
  openingCinematicState.sceneFrame++;
  
  // Check if scene is complete
  if (sceneFrame >= scene.duration) {
    openingCinematicState.sceneIndex++;
    openingCinematicState.sceneFrame = 0;
    openingCinematicState.typingText = '';
    openingCinematicState.typingIndex = 0;
  }
  
  return true; // Still playing
}

// Render scene background
function renderSceneBackground(ctx, width, height, scene, frame) {
  if (scene.id === 'earth1970') {
    // Happy 1970s Earth scene - blue skies, green grass, sun
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.6, '#B0E0E6'); // Powder blue
    gradient.addColorStop(1, '#90EE90'); // Light green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Sun
    const sunX = width * 0.8;
    const sunY = height * 0.2;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rays
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(sunX + Math.cos(angle) * 120, sunY + Math.sin(angle) * 120);
      ctx.stroke();
    }
    
    // Grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
    
    // Simple trees
    for (let i = 0; i < 5; i++) {
      const x = (i + 1) * (width / 6);
      const y = height * 0.7;
      // Trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 10, y - 60, 20, 60);
      // Foliage
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(x, y - 60, 40, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Happy birds
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const birdX = 100 + i * 150 + Math.sin(frame * 0.05 + i) * 20;
      const birdY = 100 + Math.cos(frame * 0.03 + i) * 30;
      ctx.beginPath();
      ctx.arc(birdX - 8, birdY, 4, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(birdX + 8, birdY, 4, Math.PI, 0);
      ctx.stroke();
    }
    
  } else if (scene.id === 'earth2025_part1') {
    // Scene 2 Part 1: People distracted by phones, AI diamond core eye blinks
    // Dark urban environment
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#2a2a3e'); // Dark gray-blue
    gradient.addColorStop(0.5, '#1a1a2e'); // Darker
    gradient.addColorStop(1, '#0f0f1e'); // Very dark
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Ground/street
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
    
    // Street lines
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, height * 0.85);
    ctx.lineTo(width, height * 0.85);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Groups of people walking left to right, heads down, looking at phones
    const walkCycle = (frame * 0.02) % 1; // Walking animation
    for (let i = 0; i < 6; i++) {
      const personX = ((frame * 2 + i * 150) % (width + 200)) - 100;
      const personY = height * 0.7;
      
      // Person body (simple silhouette)
      ctx.fillStyle = '#333344';
      // Head (looking down)
      ctx.beginPath();
      ctx.arc(personX, personY - 40, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.fillRect(personX - 8, personY - 28, 16, 30);
      
      // Phone glow in hands (blue glow)
      ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
      ctx.fillRect(personX - 5, personY - 15, 10, 15);
      
      // Phone glow effect
      ctx.save();
      ctx.shadowColor = 'rgba(100, 150, 255, 0.6)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(150, 180, 255, 0.4)';
      ctx.fillRect(personX - 6, personY - 16, 12, 17);
      ctx.restore();
      
      // Legs (simple)
      const legOffset = Math.sin(walkCycle * Math.PI * 2 + i) * 5;
      ctx.fillStyle = '#333344';
      ctx.fillRect(personX - 7, personY - 2, 5, 15 + legOffset);
      ctx.fillRect(personX + 2, personY - 2, 5, 15 - legOffset);
    }
    
    // AI Diamond Core in the distance (top center)
    const coreX = width / 2;
    const coreY = height * 0.15;
    
    // Diamond shape
    ctx.fillStyle = '#1a1a2e';
    ctx.save();
    ctx.translate(coreX, coreY);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-30, -30, 60, 60);
    ctx.restore();
    
    // Red eye that blinks
    const blinkCycle = frame % 120;
    const eyeOpen = blinkCycle < 100 || blinkCycle > 110;
    if (eyeOpen) {
      const eyeIntensity = Math.sin(frame * 0.05) * 0.3 + 0.7;
      ctx.save();
      ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = `rgba(255, 0, 0, ${eyeIntensity})`;
      ctx.beginPath();
      ctx.arc(coreX, coreY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Inner eye detail
      ctx.fillStyle = `rgba(255, 100, 100, ${eyeIntensity})`;
      ctx.beginPath();
      ctx.arc(coreX, coreY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
  } else if (scene.id === 'earth2025_part2') {
    // Scene 2 Part 2: Rise of machines, AI takeover, gold star as last hope
    // Dark night sky
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Stars in the sky
    for (let i = 0; i < 100; i++) {
      const sx = (i * 137.5) % width;
      const sy = (i * 217.3) % (height * 0.6);
      const ssize = 1 + (i % 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 5) * 0.1})`;
      ctx.fillRect(sx, sy, ssize, ssize);
    }
    
    // Earth/ground at bottom (being taken over)
    const groundGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
    groundGradient.addColorStop(0, '#0f0f1e');
    groundGradient.addColorStop(0.5, '#1a1a2e');
    groundGradient.addColorStop(1, '#2a2a3e');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);
    
    // Machine structures rising from the ground
    for (let i = 0; i < 6; i++) {
      const mx = (i / 6) * width + width / 12;
      const mheight = 80 + Math.sin(frame * 0.02 + i) * 20 + i * 20;
      const my = height * 0.8 - mheight;
      
      // Machine tower
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(mx - 20, my, 40, mheight);
      
      // Red glowing parts (AI control)
      ctx.fillStyle = (frame + i * 15) % 40 < 20 ? '#ff0000' : '#880000';
      ctx.fillRect(mx - 15, my + 10, 30, 5);
      ctx.fillRect(mx - 15, my + mheight / 2, 30, 5);
      ctx.fillRect(mx - 15, my + mheight - 15, 30, 5);
      
      // Red eye/scanner
      ctx.save();
      ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = (frame + i * 10) % 30 < 15 ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(mx, my + 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Gold Star in the night sky - representing the last hope of humankind
    const starX = width * 0.75;
    const starY = height * 0.25;
    const starRotation = frame * 0.03;
    const starPulse = Math.sin(frame * 0.08) * 0.2 + 1;
    
    // Glow around the star
    ctx.save();
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(starX, starY, 30 * starPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Draw gold star (5-pointed)
    ctx.save();
    ctx.translate(starX, starY);
    ctx.rotate(starRotation);
    ctx.fillStyle = 'rgba(255, 215, 0, 1)';
    ctx.shadowColor = 'rgba(255, 215, 0, 1)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const outerRadius = 18 * starPulse;
      const innerRadius = 9 * starPulse;
      ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
      ctx.lineTo(Math.cos(angle + Math.PI / 5) * innerRadius, Math.sin(angle + Math.PI / 5) * innerRadius);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Light rays from the star
    ctx.save();
    ctx.translate(starX, starY);
    ctx.rotate(starRotation * 0.5);
    for (let i = 0; i < 8; i++) {
      const rayAngle = (i / 8) * Math.PI * 2;
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 - (i % 2) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rayAngle) * 50, Math.sin(rayAngle) * 50);
      ctx.stroke();
    }
    ctx.restore();
    
  } else if (scene.id === 'asteroid') {
    // Space scene with asteroid base
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Stars
    for (let i = 0; i < 200; i++) {
      const x = (i * 137.5) % width;
      const y = (i * 217.3) % height;
      const size = 1 + (i % 3);
      const twinkle = Math.sin(frame * 0.05 + i) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (i % 5) * 0.1 * twinkle})`;
      ctx.fillRect(x, y, size, size);
    }
    
    // Distant nebula
    const nebulaGradient = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, 300);
    nebulaGradient.addColorStop(0, 'rgba(100, 50, 150, 0.3)');
    nebulaGradient.addColorStop(0.5, 'rgba(150, 50, 100, 0.2)');
    nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Asteroid base
    const asteroidX = width * 0.3;
    const asteroidY = height * 0.6;
    
    // Asteroid body
    ctx.fillStyle = '#4a4a5a';
    ctx.beginPath();
    ctx.ellipse(asteroidX, asteroidY, 180, 140, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Craters
    ctx.fillStyle = '#3a3a4a';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 80 + Math.random() * 60;
      const cx = asteroidX + Math.cos(angle) * dist;
      const cy = asteroidY + Math.sin(angle) * dist * 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, 15 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Base structures
    ctx.fillStyle = '#5a6a7a';
    ctx.fillRect(asteroidX - 40, asteroidY - 80, 80, 50);
    ctx.fillStyle = '#6a7a8a';
    ctx.fillRect(asteroidX - 30, asteroidY - 100, 60, 20);
    
    // Communication dish
    ctx.strokeStyle = '#7a8a9a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(asteroidX + 60, asteroidY - 70, 25, 0, Math.PI, true);
    ctx.stroke();
    
    // Lights on base
    const lightOn = frame % 60 < 30;
    ctx.fillStyle = lightOn ? '#00ff88' : '#008844';
    ctx.fillRect(asteroidX - 35, asteroidY - 75, 10, 10);
    ctx.fillRect(asteroidX + 25, asteroidY - 75, 10, 10);
    
    // Player ship and Gold Star (if past dialog start)
    if (frame >= scene.dialogStartFrame) {
      const shipOffset = scene.launchStartFrame && frame >= scene.launchStartFrame 
        ? (frame - scene.launchStartFrame) * 8 
        : 0;
      
      // Player ship (blue)
      const playerX = asteroidX + 100 + shipOffset;
      const playerY = asteroidY - 20;
      ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      // Engine trail if launching
      if (shipOffset > 0) {
        for (let t = 0; t < 5; t++) {
          const trailX = playerX - t * 15 - shipOffset * 0.3;
          const trailY = playerY + (Math.random() - 0.5) * 8;
          const trailSize = 5 - t;
          ctx.fillStyle = `rgba(100, 200, 255, ${0.8 - t * 0.15})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Gold Star (yellow)
      const goldStarX = asteroidX + 130 + shipOffset;
      const goldStarY = asteroidY + 20;
      ctx.fillStyle = 'rgba(255, 200, 50, 0.9)';
      ctx.save();
      ctx.translate(goldStarX, goldStarY);
      ctx.rotate(frame * 0.05);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const outerRadius = 14;
        const innerRadius = 7;
        ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
        ctx.lineTo(Math.cos(angle + Math.PI / 5) * innerRadius, Math.sin(angle + Math.PI / 5) * innerRadius);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      // Gold Star engine trail if launching
      if (shipOffset > 0) {
        for (let t = 0; t < 5; t++) {
          const trailX = goldStarX - t * 15 - shipOffset * 0.3;
          const trailY = goldStarY + (Math.random() - 0.5) * 8;
          const trailSize = 5 - t;
          ctx.fillStyle = `rgba(255, 200, 50, ${0.8 - t * 0.15})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

// Render location text with Matrix-style typing effect
function renderLocationText(ctx, width, height, scene, sceneFrame) {
  const typingFrameOffset = sceneFrame - scene.typeStartFrame;
  const charsToShow = Math.floor(typingFrameOffset / 3); // Type one character every 3 frames
  const displayText = scene.locationText.substring(0, charsToShow);
  
  if (displayText.length > 0) {
    ctx.save();
    ctx.font = 'bold 32px "Share Tech Mono", monospace';
    ctx.fillStyle = '#00ff88'; // Matrix green
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'left';
    ctx.fillText(displayText, 40, 60);
    
    // Cursor blink
    if (displayText.length < scene.locationText.length && typingFrameOffset % 20 < 10) {
      ctx.fillRect(40 + ctx.measureText(displayText).width + 5, 45, 15, 3);
    }
    ctx.restore();
  }
}

// Render dialog boxes with character portraits
function renderDialogs(ctx, width, height, scene, sceneFrame) {
  scene.dialogs.forEach(dialog => {
    if (sceneFrame >= dialog.startFrame && sceneFrame < dialog.startFrame + dialog.duration) {
      const dialogProgress = (sceneFrame - dialog.startFrame) / dialog.duration;
      const fadeInFrames = 20;
      const fadeOutFrames = 20;
      let alpha = 1;
      
      if (sceneFrame - dialog.startFrame < fadeInFrames) {
        alpha = (sceneFrame - dialog.startFrame) / fadeInFrames;
      } else if (sceneFrame >= dialog.startFrame + dialog.duration - fadeOutFrames) {
        alpha = (dialog.startFrame + dialog.duration - sceneFrame) / fadeOutFrames;
      }
      
      // Dialog box position
      const boxWidth = Math.min(600, width - 100);
      const boxHeight = 120;
      const boxX = (width - boxWidth) / 2;
      const boxY = height - boxHeight - 40;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      // Dialog box background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Character portrait
      const portraitSize = 80;
      const portraitX = boxX + 20;
      const portraitY = boxY + 20;
      
      drawCharacterPortrait(ctx, dialog.character, portraitX, portraitY, portraitSize, sceneFrame);
      
      // Character name
      ctx.font = 'bold 16px "Share Tech Mono", monospace';
      ctx.fillStyle = '#00ff88';
      ctx.textAlign = 'left';
      const characterName = dialog.character === 'leader' ? 'RESISTANCE LEADER' : 'GHOST';
      ctx.fillText(characterName, portraitX + portraitSize + 20, boxY + 30);
      
      // Dialog text with typing effect
      const typingSpeed = 2; // characters per frame
      const typingFrames = sceneFrame - dialog.startFrame;
      const charsToShow = Math.min(dialog.text.length, Math.floor(typingFrames * typingSpeed));
      const displayText = dialog.text.substring(0, charsToShow);
      
      ctx.font = '18px "Share Tech Mono", monospace';
      ctx.fillStyle = '#ffffff';
      
      // Word wrap
      const maxWidth = boxWidth - portraitSize - 60;
      const words = displayText.split(' ');
      let line = '';
      let y = boxY + 55;
      const lineHeight = 24;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, portraitX + portraitSize + 20, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, portraitX + portraitSize + 20, y);
      
      ctx.restore();
    }
  });
}

// Draw character portrait
function drawCharacterPortrait(ctx, character, x, y, size, frame) {
  if (character === 'leader') {
    // Resistance Leader - older, battle-hardened, with mechanical eye
    // Face
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
    
    // Hair (graying)
    ctx.fillStyle = '#777777';
    ctx.fillRect(x + 10, y + 10, size - 20, 15);
    
    // Scar across face
    ctx.strokeStyle = '#a08060';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 25);
    ctx.lineTo(x + size - 15, y + 35);
    ctx.stroke();
    
    // Normal eye (left)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 20, y + 30, 10, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 23, y + 32, 4, 4);
    
    // Mechanical eye (right) - glowing red
    const eyeGlow = Math.sin(frame * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
    ctx.beginPath();
    ctx.arc(x + size - 30, y + 34, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Mouth (grim)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 55);
    ctx.lineTo(x + size - 25, y + 55);
    ctx.stroke();
    
    // Battle gear collar
    ctx.fillStyle = '#444444';
    ctx.fillRect(x + 15, y + size - 25, size - 30, 15);
    
  } else if (character === 'player') {
    // Player "Ghost" - young, determined, pilot gear
    // Face
    ctx.fillStyle = '#e5c4a4';
    ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
    
    // Hair (dark)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 10, y + 10, size - 20, 18);
    
    // Eyes (both normal, alert)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 20, y + 32, 10, 8);
    ctx.fillRect(x + size - 30, y + 32, 10, 8);
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(x + 23, y + 34, 4, 4);
    ctx.fillRect(x + size - 27, y + 34, 4, 4);
    
    // Mouth (confident)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 55);
    ctx.lineTo(x + 35, y + 52);
    ctx.lineTo(x + size - 25, y + 55);
    ctx.stroke();
    
    // Pilot helmet/gear
    ctx.fillStyle = '#64c8ff';
    ctx.fillRect(x + 15, y + size - 25, size - 30, 15);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 15, y + size - 25, size - 30, 15);
  }
  
  // Portrait border
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, size, size);
}

// Render skip prompt
function renderSkipPrompt(ctx, width, height) {
  ctx.save();
  ctx.font = '14px "Share Tech Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'right';
  ctx.fillText('Press ESC to skip', width - 20, height - 20);
  ctx.restore();
}
