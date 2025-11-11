import * as state from '../state.js';

export function drawEnemies() {
  // Cache pulse value - calculated once per frame and reused for all red squares
  const redSquarePulse = Math.sin(state.frameCount * 0.1) * 0.3 + 0.7;
  
  state.enemies.forEach(e => {
    if (!e) return;

    if (e.type === "red-square") { 
      // 8-bit Kamikaze Fighter Craft (Futuristic Japanese Zero)
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      // Calculate angle toward player for orientation
      const dx = state.player.x - e.x;
      const dy = state.player.y - e.y;
      const angle = Math.atan2(dy, dx);
      state.ctx.rotate(angle);
      
      // Removed expensive shadowBlur for performance - visual style remains clear without it
      
      const size = e.size;
      const pulse = redSquarePulse;
      
      // Main fuselage (angular, aggressive design)
      state.ctx.fillStyle = "#8B0000"; // Dark red
      state.ctx.beginPath();
      state.ctx.moveTo(size/2, 0); // Nose (pointed right)
      state.ctx.lineTo(size/6, -size/6);
      state.ctx.lineTo(-size/3, -size/6);
      state.ctx.lineTo(-size/2.5, -size/8);
      state.ctx.lineTo(-size/2.5, size/8);
      state.ctx.lineTo(-size/3, size/6);
      state.ctx.lineTo(size/6, size/6);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Wings (swept back, Zero-style)
      state.ctx.fillStyle = "#A00000"; // Slightly lighter red
      
      // Top wing
      state.ctx.beginPath();
      state.ctx.moveTo(size/8, -size/6);
      state.ctx.lineTo(size/5, -size/2.5);
      state.ctx.lineTo(-size/8, -size/3);
      state.ctx.lineTo(-size/6, -size/6);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Bottom wing
      state.ctx.beginPath();
      state.ctx.moveTo(size/8, size/6);
      state.ctx.lineTo(size/5, size/2.5);
      state.ctx.lineTo(-size/8, size/3);
      state.ctx.lineTo(-size/6, size/6);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Cockpit (glowing red)
      state.ctx.fillStyle = `rgba(255, 50, 50, ${pulse})`;
      state.ctx.fillRect(size/8, -size/12, size/6, size/6);
      
      // Cockpit canopy detail
      state.ctx.strokeStyle = `rgba(255, 100, 100, ${pulse})`;
      state.ctx.lineWidth = 1;
      state.ctx.strokeRect(size/8, -size/12, size/6, size/6);
      
      // Engine exhausts (back of craft)
      const engineGlow = `rgba(255, 100, 0, ${pulse * 0.8})`;
      state.ctx.fillStyle = engineGlow;
      state.ctx.fillRect(-size/2.5, -size/16, size/12, size/8);
      
      // Engine flame trail
      if (Math.random() > 0.5) {
        state.ctx.fillStyle = `rgba(255, 150, 0, ${pulse * 0.6})`;
        state.ctx.fillRect(-size/2.5 - size/8, -size/24, size/8, size/12);
      }
      
      // Panel lines (8-bit detailing)
      state.ctx.strokeStyle = "#600000";
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(size/6, -size/8);
      state.ctx.lineTo(-size/4, -size/8);
      state.ctx.moveTo(size/6, size/8);
      state.ctx.lineTo(-size/4, size/8);
      state.ctx.stroke();
      
      // Rising sun emblem on fuselage (Japanese Zero homage)
      const emblemRadius = size/8;
      state.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
      state.ctx.beginPath();
      state.ctx.arc(-size/12, 0, emblemRadius, 0, Math.PI * 2);
      state.ctx.fill();
      
      state.ctx.fillStyle = `rgba(255, 0, 0, 0.5)`;
      state.ctx.beginPath();
      state.ctx.arc(-size/12, 0, emblemRadius * 0.6, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Outline glow
      state.ctx.strokeStyle = `rgba(255, 100, 100, ${pulse})`;
      state.ctx.lineWidth = 1.5;
      state.ctx.beginPath();
      state.ctx.moveTo(size/2, 0);
      state.ctx.lineTo(size/6, -size/6);
      state.ctx.lineTo(-size/3, -size/6);
      state.ctx.lineTo(-size/2.5, -size/8);
      state.ctx.lineTo(-size/2.5, size/8);
      state.ctx.lineTo(-size/3, size/6);
      state.ctx.lineTo(size/6, size/6);
      state.ctx.closePath();
      state.ctx.stroke();
      
      state.ctx.restore();
    }
    else if (e.type === "triangle") { 
      // 8-bit TIE Fighter design - Optimized for performance
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      // Removed expensive shadowBlur for performance
      
      const wingWidth = e.size / 2;
      const wingHeight = e.size * 0.8;
      const cockpitSize = e.size / 3;
      const pulse = Math.sin(state.frameCount * 0.08 + e.x) * 0.4 + 0.6;
      
      // Batch wing fills and strokes together to reduce draw calls
      state.ctx.fillStyle = "#333";
      state.ctx.fillRect(-wingWidth - cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      state.ctx.fillRect(cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      
      // Draw all wing grid lines in one path
      state.ctx.strokeStyle = "#555";
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      for (let i = 1; i < 3; i++) {
        // Left wing lines
        state.ctx.moveTo(-wingWidth - cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
        state.ctx.lineTo(-cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
        // Right wing lines
        state.ctx.moveTo(cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
        state.ctx.lineTo(wingWidth + cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
      }
      state.ctx.stroke();
      
      // Central cockpit pod (hexagonal) - cached calculation
      state.ctx.fillStyle = "#555";
      state.ctx.beginPath();
      // Hexagon points pre-calculated for efficiency
      const r = cockpitSize/2;
      state.ctx.moveTo(r, 0);
      state.ctx.lineTo(r * 0.5, r * 0.866);
      state.ctx.lineTo(-r * 0.5, r * 0.866);
      state.ctx.lineTo(-r, 0);
      state.ctx.lineTo(-r * 0.5, -r * 0.866);
      state.ctx.lineTo(r * 0.5, -r * 0.866);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Cockpit window and engine in one fill operation
      state.ctx.fillStyle = `rgba(0,255,255,${pulse})`;
      state.ctx.fillRect(-cockpitSize/4, -cockpitSize/8, cockpitSize/2, cockpitSize/4);
      
      // Engine glow
      state.ctx.fillStyle = `rgba(100,200,255,${pulse * 0.8})`;
      state.ctx.beginPath();
      state.ctx.arc(0, cockpitSize/3, cockpitSize/6, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Outline glow - batch all outline strokes together
      state.ctx.strokeStyle = `rgba(100,255,255,${pulse})`;
      state.ctx.lineWidth = 2;
      state.ctx.beginPath();
      // Left wing outline
      state.ctx.rect(-wingWidth - cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      // Right wing outline
      state.ctx.rect(cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      // Cockpit outline (hexagon)
      state.ctx.moveTo(r, 0);
      state.ctx.lineTo(r * 0.5, r * 0.866);
      state.ctx.lineTo(-r * 0.5, r * 0.866);
      state.ctx.lineTo(-r, 0);
      state.ctx.lineTo(-r * 0.5, -r * 0.866);
      state.ctx.lineTo(r * 0.5, -r * 0.866);
      state.ctx.closePath();
      state.ctx.stroke();
      
      state.ctx.restore();

      try {
        const fireRate = 100;
        const chargeTime = 30;
        const chargeStart = Math.max(0, fireRate - chargeTime);
        const st = e.shootTimer || 0;
        if (st > chargeStart) {
          const progress = Math.min(1, (st - chargeStart) / chargeTime);
          const cx = e.x, cy = e.y;
          const tx = e.x, ty = e.y - e.size/2;
          const dotX = cx + (tx - cx) * progress;
          const dotY = cy + (ty - cy) * progress;
          state.ctx.beginPath();
          state.ctx.fillStyle = `rgba(255,50,50,${0.4 + progress*0.6})`;
          const r = 3 + progress * 4;
          state.ctx.arc(dotX, dotY, r, 0, Math.PI*2);
          state.ctx.fill();
          if (progress >= 1) {
            state.ctx.beginPath();
            state.ctx.fillStyle = "rgba(255,80,80,0.6)";
            state.ctx.arc(tx, ty, 6, 0, Math.PI*2);
            state.ctx.fill();
          }
        }
      } catch (err) {}
    }
    else if (e.type === "boss") { 
      const pulse = Math.sin(state.frameCount * 0.05) * 10 + e.size/2;
      state.ctx.fillStyle = "yellow"; 
      state.ctx.beginPath(); 
      state.ctx.arc(e.x, e.y, pulse, 0, Math.PI*2); 
      state.ctx.fill();

      state.ctx.strokeStyle = "rgba(255,255,0,0.5)";
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      state.ctx.arc(e.x, e.y, pulse + 10, 0, Math.PI*2);
      state.ctx.stroke();
    }
    else if (e.type === "mini-boss") { 
      const pulse = Math.sin(state.frameCount * 0.07) * 5 + e.size/2;
      state.ctx.fillStyle = "orange"; 
      state.ctx.beginPath(); 
      state.ctx.arc(e.x, e.y, pulse, 0, Math.PI * 2); 
      state.ctx.fill();
    }
    else if (e.type === "reflector") {
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      state.ctx.rotate(e.angle||0);

      state.ctx.fillStyle = e.shieldActive ? "rgba(138,43,226,0.8)" : "purple";
      state.ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);

      if (e.shieldActive) {
        const shieldPulse = Math.sin(state.frameCount * 0.1) * 5 + 60;
        state.ctx.strokeStyle = `rgba(138,43,226,${0.5 + Math.sin(state.frameCount * 0.1) * 0.3})`;
        state.ctx.lineWidth = 2;
        state.ctx.beginPath();
        state.ctx.arc(0, 0, shieldPulse, 0, Math.PI*2);
        state.ctx.stroke();
      }
      state.ctx.restore();
    }
    else if (e.type === "mother-core") {
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      state.ctx.rotate(e.angle);

      const glowIntensity = Math.sin(state.frameCount * 0.05) * 0.3 + 0.7;
      state.ctx.strokeStyle = `rgba(0,150,255,${glowIntensity})`;
      state.ctx.lineWidth = 8;
      state.ctx.beginPath();
      state.ctx.moveTo(0, -e.size/2);
      state.ctx.lineTo(e.size/2, 0);
      state.ctx.lineTo(0, e.size/2);
      state.ctx.lineTo(-e.size/2, 0);
      state.ctx.closePath();
      state.ctx.fillStyle = "rgba(20,40,80,0.9)";
      state.ctx.fill();
      state.ctx.stroke();
      state.ctx.restore();

      e.cores.forEach(core => {
        state.ctx.save();
        state.ctx.fillStyle = "cyan";
        state.ctx.beginPath();
        state.ctx.arc(core.x, core.y, 20, 0, Math.PI * 2);
        state.ctx.fill();
        state.ctx.restore();
      });

      const barWidth = e.size;
      const barHeight = 10;
      state.ctx.fillStyle = "rgba(50,50,50,0.8)";
      state.ctx.fillRect(e.x - barWidth/2, e.y - e.size/2 - 30, barWidth, barHeight);
      state.ctx.fillStyle = "red";
      state.ctx.fillRect(e.x - barWidth/2, e.y - e.size/2 - 30, barWidth * (e.health / e.maxHealth), barHeight);
    }
  });
}

export function drawTanks() {
  state.tanks.forEach(tank => {
    state.ctx.save();
    state.ctx.translate(tank.x, tank.y);

    state.ctx.fillStyle = "rgba(100,100,100,0.9)";
    state.ctx.fillRect(-tank.width/2, -tank.height/2, tank.width, tank.height);

    state.ctx.rotate(tank.turretAngle);
    state.ctx.fillStyle = "rgba(80,80,80,0.9)";
    state.ctx.fillRect(0, -5, 25, 10);

    state.ctx.restore();
  });
}

export function drawWalkers() {
  state.walkers.forEach(walker => {
    state.ctx.save();
    state.ctx.translate(walker.x, walker.y);

    state.ctx.fillStyle = "rgba(120,120,150,0.9)";
    state.ctx.fillRect(-walker.width/2, -walker.height/2, walker.width, walker.height/2);

    const legOffset = Math.sin(walker.legPhase) * 10;
    state.ctx.strokeStyle = "rgba(100,100,130,0.9)";
    state.ctx.lineWidth = 3;
    state.ctx.beginPath();
    state.ctx.moveTo(-10, walker.height/4);
    state.ctx.lineTo(-10 + legOffset, walker.height/2 + 10);
    state.ctx.stroke();

    state.ctx.beginPath();
    state.ctx.moveTo(10, walker.height/4);
    state.ctx.lineTo(10 - legOffset, walker.height/2 + 10);
    state.ctx.stroke();

    state.ctx.restore();
  });
}

export function drawMechs() {
  state.mechs.forEach(mech => {
    // Draw dropship if visible (Gundam-style military transport)
    if (mech.dropshipVisible) {
      state.ctx.save();
      state.ctx.translate(mech.x, mech.y - mech.size/2);
      
      const size = mech.size;
      
      // Main hull (angular military design)
      state.ctx.fillStyle = '#2a2a2a';
      state.ctx.strokeStyle = '#444';
      state.ctx.lineWidth = 2;
      
      // Top angular hull
      state.ctx.beginPath();
      state.ctx.moveTo(-size/2, -size/3);
      state.ctx.lineTo(-size/3, -size/2);
      state.ctx.lineTo(size/3, -size/2);
      state.ctx.lineTo(size/2, -size/3);
      state.ctx.lineTo(size/2, size/4);
      state.ctx.lineTo(-size/2, size/4);
      state.ctx.closePath();
      state.ctx.fill();
      state.ctx.stroke();
      
      // Cockpit/bridge section (angular)
      state.ctx.fillStyle = '#3a3a3a';
      state.ctx.beginPath();
      state.ctx.moveTo(-size/4, -size/2.2);
      state.ctx.lineTo(-size/5, -size/1.7);
      state.ctx.lineTo(size/5, -size/1.7);
      state.ctx.lineTo(size/4, -size/2.2);
      state.ctx.closePath();
      state.ctx.fill();
      state.ctx.stroke();
      
      // Cockpit windows (glowing cyan) - no blur for performance
      state.ctx.fillStyle = '#00ccff';
      state.ctx.fillRect(-size/6, -size/2, size/3, size/8);
      
      // Side thrusters
      state.ctx.fillStyle = '#555';
      state.ctx.fillRect(-size/2 - 4, -size/6, 4, size/3);
      state.ctx.fillStyle = '#666';
      state.ctx.fillRect(-size/2 - 3, -size/6 + 2, 2, size/3 - 4);
      
      state.ctx.fillStyle = '#555';
      state.ctx.fillRect(size/2, -size/6, 4, size/3);
      state.ctx.fillStyle = '#666';
      state.ctx.fillRect(size/2 + 1, -size/6 + 2, 2, size/3 - 4);
      
      // Main engine exhaust
      const engineFlicker = 0.5 + Math.random() * 0.5;
      const enginePulse = Math.sin(state.frameCount * 0.2) * 0.2 + 0.8;
      
      state.ctx.fillStyle = '#333';
      state.ctx.fillRect(-size/3, size/4, size/1.5, size/6);
      
      // Engine glow (no blur for performance)
      state.ctx.fillStyle = `rgba(100, 200, 255, ${engineFlicker * enginePulse})`;
      state.ctx.beginPath();
      state.ctx.moveTo(-size/4, size/4 + size/6);
      state.ctx.lineTo(-size/5, size/4 + size/4);
      state.ctx.lineTo(size/5, size/4 + size/4);
      state.ctx.lineTo(size/4, size/4 + size/6);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Deployment bay door (opening during deploy)
      if (mech.deploying) {
        const doorOpen = Math.min(1, (mech.deployProgress || 0) / 60);
        
        state.ctx.fillStyle = '#555';
        state.ctx.fillRect(-size/4, size/6, (size/4) * (1 - doorOpen), size/8);
        state.ctx.fillRect(0 + (size/4) * doorOpen, size/6, (size/4) * (1 - doorOpen), size/8);
        
        if (doorOpen > 0.3) {
          // Deployment light (no blur for performance)
          state.ctx.fillStyle = `rgba(255, 100, 100, ${doorOpen})`;
          state.ctx.beginPath();
          state.ctx.arc(0, size/5, 3, 0, Math.PI * 2);
          state.ctx.fill();
        }
      }
      
      // Panel lines
      state.ctx.strokeStyle = '#1a1a1a';
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(-size/3, -size/4);
      state.ctx.lineTo(-size/3, size/4);
      state.ctx.moveTo(size/3, -size/4);
      state.ctx.lineTo(size/3, size/4);
      state.ctx.stroke();
      
      state.ctx.restore();
    }
    
    state.ctx.save();
    state.ctx.translate(mech.x, mech.y);

    if (mech.shieldActive) {
      const shieldHealthRatio = (mech.shieldHealth || 150) / 150;
      const pulse = Math.sin(state.frameCount * 0.1) * 5;
      const shieldRadius = mech.size/2 + 15 + pulse;
      const shieldRotation = state.frameCount * 0.02;
      
      state.ctx.save();
      state.ctx.rotate(shieldRotation);
      
      // Hexagonal shield outline (matching player shield)
      state.ctx.strokeStyle = `rgba(100, 200, 255, ${0.6 * shieldHealthRatio})`;
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * shieldRadius;
        const y = Math.sin(angle) * shieldRadius;
        if (i === 0) state.ctx.moveTo(x, y);
        else state.ctx.lineTo(x, y);
      }
      state.ctx.closePath();
      state.ctx.stroke();
      
      // Shield glow fill
      state.ctx.fillStyle = `rgba(100, 200, 255, ${0.1 * shieldHealthRatio})`;
      state.ctx.fill();
      
      // Decorative lines from center to vertices
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x1 = Math.cos(angle) * shieldRadius;
        const y1 = Math.sin(angle) * shieldRadius;
        
        state.ctx.strokeStyle = `rgba(150, 220, 255, ${0.3 * shieldHealthRatio})`;
        state.ctx.lineWidth = 1;
        state.ctx.beginPath();
        state.ctx.moveTo(0, 0);
        state.ctx.lineTo(x1, y1);
        state.ctx.stroke();
      }
      
      state.ctx.restore();
    }

    // 8-bit Spider Bot with Howitzer
    const legPhase = (mech.legPhase || 0);
    
    // Draw 4 mechanical legs (animated)
    for (let i = 0; i < 4; i++) {
      const baseAngle = (i / 4) * Math.PI * 2;
      const legOffset = Math.sin(legPhase + i * Math.PI / 2) * 8;
      
      // Leg segments
      const legBaseX = Math.cos(baseAngle) * (mech.size/3);
      const legBaseY = Math.sin(baseAngle) * (mech.size/3);
      const legMidX = Math.cos(baseAngle) * (mech.size/2 + 8) + legOffset * Math.sin(baseAngle);
      const legMidY = Math.sin(baseAngle) * (mech.size/2 + 8) - legOffset * Math.cos(baseAngle);
      const legEndX = Math.cos(baseAngle) * (mech.size/2 + 16) + legOffset * 1.5 * Math.sin(baseAngle);
      const legEndY = Math.sin(baseAngle) * (mech.size/2 + 16) - legOffset * 1.5 * Math.cos(baseAngle);
      
      // Draw leg segments
      state.ctx.strokeStyle = "rgba(100, 100, 100, 0.9)";
      state.ctx.lineWidth = 3;
      state.ctx.lineCap = "round";
      
      // Upper leg segment
      state.ctx.beginPath();
      state.ctx.moveTo(legBaseX, legBaseY);
      state.ctx.lineTo(legMidX, legMidY);
      state.ctx.stroke();
      
      // Lower leg segment
      state.ctx.strokeStyle = "rgba(80, 80, 80, 0.9)";
      state.ctx.lineWidth = 2;
      state.ctx.beginPath();
      state.ctx.moveTo(legMidX, legMidY);
      state.ctx.lineTo(legEndX, legEndY);
      state.ctx.stroke();
      
      // Leg joints
      state.ctx.fillStyle = "rgba(120, 120, 120, 0.9)";
      state.ctx.beginPath();
      state.ctx.arc(legBaseX, legBaseY, 3, 0, Math.PI * 2);
      state.ctx.fill();
      
      state.ctx.beginPath();
      state.ctx.arc(legMidX, legMidY, 2.5, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Foot
      state.ctx.fillStyle = "rgba(60, 60, 60, 0.9)";
      state.ctx.fillRect(legEndX - 2, legEndY - 1, 4, 2);
    }
    
    // Central torso/body (octagonal)
    state.ctx.fillStyle = "rgba(150, 50, 50, 0.9)";
    state.ctx.strokeStyle = "rgba(200, 100, 100, 0.9)";
    state.ctx.lineWidth = 2;
    
    state.ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * mech.size/2.5;
      const y = Math.sin(angle) * mech.size/2.5;
      if (i === 0) state.ctx.moveTo(x, y);
      else state.ctx.lineTo(x, y);
    }
    state.ctx.closePath();
    state.ctx.fill();
    state.ctx.stroke();
    
    // Torso details (panel lines)
    state.ctx.strokeStyle = "rgba(100, 30, 30, 0.7)";
    state.ctx.lineWidth = 1;
    state.ctx.beginPath();
    state.ctx.moveTo(-mech.size/4, -mech.size/4);
    state.ctx.lineTo(mech.size/4, mech.size/4);
    state.ctx.moveTo(mech.size/4, -mech.size/4);
    state.ctx.lineTo(-mech.size/4, mech.size/4);
    state.ctx.stroke();
    
    // Howitzer cannon mounted on torso
    const cannonAngle = Math.atan2(state.player.y - mech.y, state.player.x - mech.x);
    state.ctx.rotate(cannonAngle);
    
    // Cannon base turret
    state.ctx.fillStyle = "rgba(100, 100, 100, 0.95)";
    state.ctx.fillRect(-6, -6, 12, 12);
    
    // Cannon barrel (howitzer style - thick and short)
    state.ctx.fillStyle = "rgba(80, 80, 80, 0.95)";
    state.ctx.fillRect(0, -4, 20, 8);
    
    // Cannon muzzle
    state.ctx.fillStyle = "rgba(60, 60, 60, 0.95)";
    state.ctx.fillRect(18, -5, 4, 10);
    
    // Muzzle glow when about to shoot
    if (mech.shootTimer && mech.shootTimer > 50) {
      const chargeIntensity = (mech.shootTimer - 50) / 10;
      state.ctx.fillStyle = `rgba(255, 100, 0, ${chargeIntensity * 0.8})`;
      state.ctx.beginPath();
      state.ctx.arc(22, 0, 3, 0, Math.PI * 2);
      state.ctx.fill();
    }
    
    // Cannon detail lines
    state.ctx.strokeStyle = "rgba(60, 60, 60, 0.9)";
    state.ctx.lineWidth = 1;
    state.ctx.beginPath();
    state.ctx.moveTo(4, -3);
    state.ctx.lineTo(16, -3);
    state.ctx.moveTo(4, 3);
    state.ctx.lineTo(16, 3);
    state.ctx.stroke();

    state.ctx.restore();
  });
}



export function drawDiamonds() {
  state.diamonds.forEach(d => {
    state.ctx.save(); 
    state.ctx.translate(d.x, d.y); 
    state.ctx.rotate(d.angle||0);
    
    // === BOSS AURA - Multi-layered energy field ===
    const bossAuraPulse = Math.sin(state.frameCount * 0.08) * 0.3 + 0.7;
    const bossAuraSize = d.size * 2.5;
    
    // Outer boss aura ring (rotating slowly)
    state.ctx.save();
    state.ctx.rotate(-state.frameCount * 0.01);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * bossAuraSize;
      const y = Math.sin(angle) * bossAuraSize;
      
      const gradient = state.ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, `rgba(255, 100, 255, ${0.4 * bossAuraPulse})`);
      gradient.addColorStop(1, `rgba(255, 100, 255, 0)`);
      
      state.ctx.fillStyle = gradient;
      state.ctx.beginPath();
      state.ctx.arc(x, y, 15, 0, Math.PI * 2);
      state.ctx.fill();
    }
    state.ctx.restore();
    
    // Mid-layer boss aura (pulsing energy ring)
    state.ctx.strokeStyle = `rgba(255, 150, 255, ${0.6 * bossAuraPulse})`;
    state.ctx.lineWidth = 3;
    state.ctx.beginPath();
    state.ctx.arc(0, 0, bossAuraSize * 0.7, 0, Math.PI * 2);
    state.ctx.stroke();
    
    // Inner boss energy field
    const innerAuraGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, bossAuraSize * 0.5);
    innerAuraGradient.addColorStop(0, `rgba(255, 200, 255, 0)`);
    innerAuraGradient.addColorStop(0.7, `rgba(255, 150, 255, ${0.15 * bossAuraPulse})`);
    innerAuraGradient.addColorStop(1, `rgba(255, 100, 255, 0)`);
    
    state.ctx.fillStyle = innerAuraGradient;
    state.ctx.beginPath();
    state.ctx.arc(0, 0, bossAuraSize * 0.5, 0, Math.PI * 2);
    state.ctx.fill();

    if (d.gravitonActive && d.gravitonCharge < 600) {
      const pullIntensity = d.gravitonCharge / 600;
      state.ctx.strokeStyle = `rgba(100,200,255,${pullIntensity * 0.7})`;
      state.ctx.lineWidth = 5;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, d.size/2 + 80 + Math.sin(state.frameCount * 0.1) * 25, 0, Math.PI * 2);
      state.ctx.stroke();

      state.ctx.strokeStyle = `rgba(150,220,255,${pullIntensity * 0.5})`;
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, d.size/2 + 40, 0, Math.PI * 2);
      state.ctx.stroke();
    }

    // Power-up charge animation: particles drawn into diamond before release
    if (d.releaseTimer > 0 && d.releaseTimer < d.releaseChargeNeeded && d.attachments && d.attachments.length > 0) {
      const chargeProgress = d.releaseTimer / d.releaseChargeNeeded;
      const particleCount = Math.floor(chargeProgress * 15) + 3;
      
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2 + state.frameCount * 0.05;
        const distance = 150 * (1 - chargeProgress) + 20;
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;
        
        const particleSize = 2 + chargeProgress * 3;
        const opacity = 0.4 + chargeProgress * 0.6;
        
        state.ctx.beginPath();
        state.ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
        state.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
        state.ctx.fill();
        
        // Particle center glow (no blur for performance)
        state.ctx.fillStyle = `rgba(255, 255, 150, ${opacity * 1.2})`;
        state.ctx.beginPath();
        state.ctx.arc(px, py, particleSize * 0.5, 0, Math.PI * 2);
        state.ctx.fill();
      }
      
      // Add energy lines from particles to center
      if (chargeProgress > 0.3) {
        for (let l = 0; l < 8; l++) {
          const angle = (l / 8) * Math.PI * 2 + state.frameCount * 0.03;
          const startDist = 120 * (1 - chargeProgress) + 30;
          const startX = Math.cos(angle) * startDist;
          const startY = Math.sin(angle) * startDist;
          
          state.ctx.beginPath();
          state.ctx.strokeStyle = `rgba(255, 200, 100, ${chargeProgress * 0.6})`;
          state.ctx.lineWidth = 1 + chargeProgress * 2;
          state.ctx.moveTo(startX, startY);
          state.ctx.lineTo(0, 0);
          state.ctx.stroke();
        }
      }
    }

    // Vulnerable state indicated by color only (no blur for performance)

    // === ENHANCED DIAMOND BOSS BODY ===
    const glowIntensity = Math.sin(state.frameCount * 0.05) * 0.3 + 0.7;
    const bossScale = 1.5; // Make boss 50% larger
    const enhancedSize = d.size * bossScale;
    const enhancedPulse = d.pulse * bossScale;
    
    // Multi-layer boss body for depth
    // Outer dark layer (shadow effect)
    state.ctx.fillStyle = d.vulnerable ? "rgba(50, 0, 0, 0.6)" : "rgba(0, 0, 50, 0.6)";
    state.ctx.beginPath();
    state.ctx.moveTo(0, -enhancedSize/2 - enhancedPulse - 4);
    state.ctx.lineTo(enhancedSize/2 + enhancedPulse + 4, 0);
    state.ctx.lineTo(0, enhancedSize/2 + enhancedPulse + 4);
    state.ctx.lineTo(-enhancedSize/2 - enhancedPulse - 4, 0);
    state.ctx.closePath();
    state.ctx.fill();
    
    // Main boss body (no blur for performance)
    
    // Fill with gradient for depth
    const bodyGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, enhancedSize/2);
    if (d.vulnerable) {
      bodyGradient.addColorStop(0, `rgba(255, 100, 100, ${glowIntensity})`);
      bodyGradient.addColorStop(0.7, `rgba(200, 50, 50, ${glowIntensity * 0.8})`);
      bodyGradient.addColorStop(1, `rgba(150, 0, 0, ${glowIntensity * 0.6})`);
    } else if (d.canReflect) {
      bodyGradient.addColorStop(0, `rgba(150, 255, 255, ${glowIntensity})`);
      bodyGradient.addColorStop(0.7, `rgba(0, 200, 255, ${glowIntensity * 0.8})`);
      bodyGradient.addColorStop(1, `rgba(0, 150, 200, ${glowIntensity * 0.6})`);
    } else {
      bodyGradient.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity})`);
      bodyGradient.addColorStop(0.7, `rgba(200, 200, 255, ${glowIntensity * 0.8})`);
      bodyGradient.addColorStop(1, `rgba(150, 150, 200, ${glowIntensity * 0.6})`);
    }
    
    state.ctx.fillStyle = bodyGradient;
    state.ctx.beginPath();
    state.ctx.moveTo(0, -enhancedSize/2 - enhancedPulse);
    state.ctx.lineTo(enhancedSize/2 + enhancedPulse, 0);
    state.ctx.lineTo(0, enhancedSize/2 + enhancedPulse);
    state.ctx.lineTo(-enhancedSize/2 - enhancedPulse, 0);
    state.ctx.closePath();
    state.ctx.fill();
    
    // Boss outline with extra thickness
    state.ctx.strokeStyle = d.canReflect ? `rgba(0,255,255,${glowIntensity})` : (d.vulnerable ? `rgba(255,100,100,${glowIntensity})` : `rgba(255,255,255,${glowIntensity})`);
    state.ctx.lineWidth = 5;
    state.ctx.beginPath();
    state.ctx.moveTo(0, -enhancedSize/2 - enhancedPulse);
    state.ctx.lineTo(enhancedSize/2 + enhancedPulse, 0);
    state.ctx.lineTo(0, enhancedSize/2 + enhancedPulse);
    state.ctx.lineTo(-enhancedSize/2 - enhancedPulse, 0);
    state.ctx.closePath();
    state.ctx.stroke();
    
    // Inner crystalline structure lines
    state.ctx.strokeStyle = d.vulnerable ? `rgba(255,150,150,${glowIntensity * 0.6})` : `rgba(255,255,255,${glowIntensity * 0.6})`;
    state.ctx.lineWidth = 2;
    state.ctx.beginPath();
    state.ctx.moveTo(0, -enhancedSize/4);
    state.ctx.lineTo(0, enhancedSize/4);
    state.ctx.moveTo(-enhancedSize/4, 0);
    state.ctx.lineTo(enhancedSize/4, 0);
    state.ctx.stroke();
    
    // Central boss core
    const coreSize = 12 + Math.sin(state.frameCount * 0.1) * 3;
    const coreGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
    coreGradient.addColorStop(0, d.vulnerable ? "rgba(255, 50, 50, 1)" : "rgba(255, 255, 255, 1)");
    coreGradient.addColorStop(0.5, d.vulnerable ? "rgba(255, 100, 100, 0.8)" : "rgba(200, 200, 255, 0.8)");
    coreGradient.addColorStop(1, d.vulnerable ? "rgba(200, 50, 50, 0)" : "rgba(150, 150, 255, 0)");
    
    state.ctx.fillStyle = coreGradient;
    state.ctx.beginPath();
    state.ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    state.ctx.fill();
    
    state.ctx.restore();
    
    // === BOSS HEALTH BAR (Enhanced) ===
    const barWidth = 200;
    const barHeight = 15;
    const barX = d.x - barWidth/2;
    const barY = d.y - enhancedSize - 40;
    
    // Health bar background (dark with border)
    state.ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
    state.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Health bar border (glowing)
    state.ctx.strokeStyle = d.vulnerable ? "rgba(255, 100, 100, 0.8)" : "rgba(255, 255, 255, 0.8)";
    state.ctx.lineWidth = 2;
    state.ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    // Health bar fill (gradient)
    const healthPercent = d.health / (d.maxHealth || 200);
    const healthBarGradient = state.ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
    if (healthPercent > 0.5) {
      healthBarGradient.addColorStop(0, "rgba(100, 255, 100, 0.9)");
      healthBarGradient.addColorStop(1, "rgba(50, 200, 50, 0.9)");
    } else if (healthPercent > 0.25) {
      healthBarGradient.addColorStop(0, "rgba(255, 200, 50, 0.9)");
      healthBarGradient.addColorStop(1, "rgba(200, 150, 0, 0.9)");
    } else {
      healthBarGradient.addColorStop(0, "rgba(255, 100, 100, 0.9)");
      healthBarGradient.addColorStop(1, "rgba(200, 50, 50, 0.9)");
    }
    
    state.ctx.fillStyle = healthBarGradient;
    state.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Health bar segments (visual markers every 25%)
    state.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    state.ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const segmentX = barX + (barWidth * i / 4);
      state.ctx.beginPath();
      state.ctx.moveTo(segmentX, barY);
      state.ctx.lineTo(segmentX, barY + barHeight);
      state.ctx.stroke();
    }
    
    // Boss title text
    state.ctx.font = "bold 14px Orbitron, monospace";
    state.ctx.textAlign = "center";
    state.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    state.ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    state.ctx.lineWidth = 3;
    state.ctx.strokeText("◆ DIAMOND BOSS ◆", d.x, barY - 8);
    state.ctx.fillText("◆ DIAMOND BOSS ◆", d.x, barY - 8);

    // Draw visual formation lines connecting attached enemies to diamond
    d.attachments.forEach(a => {
      if (a.visualOrbitX && a.visualOrbitY) {
        state.ctx.save();
        state.ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
        state.ctx.lineWidth = 1;
        state.ctx.beginPath();
        state.ctx.moveTo(d.x, d.y);
        state.ctx.lineTo(a.visualOrbitX, a.visualOrbitY);
        state.ctx.stroke();
        state.ctx.restore();
      }
    });

    // Draw turrets
    if (d.turrets) {
      for (let i = 0; i < d.turrets.length; i++) {
        const turret = d.turrets[i];
        const turretDist = enhancedSize/2 + 15;
        const turretX = d.x + Math.cos(turret.angle) * turretDist;
        const turretY = d.y + Math.sin(turret.angle) * turretDist;
        
        state.ctx.save();
        state.ctx.translate(turretX, turretY);
        
        // Turret base
        state.ctx.fillStyle = "rgba(80, 80, 120, 0.9)";
        state.ctx.beginPath();
        state.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        state.ctx.fill();
        
        // Turret barrel (aimed at player)
        const dx = state.player.x - turretX;
        const dy = state.player.y - turretY;
        const barrelAngle = Math.atan2(dy, dx);
        state.ctx.rotate(barrelAngle);
        state.ctx.fillStyle = "rgba(100, 100, 140, 0.9)";
        state.ctx.fillRect(0, -3, 15, 6);
        
        // Turret glow when charging (no blur for performance)
        if (turret.shootTimer > turret.fireRate - 20) {
          const chargePulse = (turret.shootTimer - (turret.fireRate - 20)) / 20;
          state.ctx.fillStyle = `rgba(255, 100, 100, ${chargePulse * 0.8})`;
          state.ctx.beginPath();
          state.ctx.arc(12, 0, 4, 0, Math.PI * 2);
          state.ctx.fill();
        }
        
        state.ctx.restore();
      }
    }

    // Draw laser charging effect
    if (d.laserCharging && d.laserChargeTimer > 0) {
      const chargeProgress = d.laserChargeTimer / 60;
      
      // Laser charge core
      state.ctx.save();
      state.ctx.translate(d.x, d.y);
      
      // Pulsing core
      const coreSize = 20 + chargeProgress * 30;
      const coreGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
      coreGradient.addColorStop(0, `rgba(255, 100, 255, ${chargeProgress})`);
      coreGradient.addColorStop(0.5, `rgba(200, 50, 200, ${chargeProgress * 0.6})`);
      coreGradient.addColorStop(1, "rgba(150, 0, 150, 0)");
      
      state.ctx.fillStyle = coreGradient;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Energy rings converging
      for (let r = 0; r < 4; r++) {
        const ringPhase = (state.frameCount * 0.1 + r * 0.5) % 1;
        const ringRadius = 60 * (1 - ringPhase * chargeProgress);
        const ringAlpha = (1 - ringPhase) * chargeProgress;
        
        state.ctx.strokeStyle = `rgba(255, 150, 255, ${ringAlpha * 0.6})`;
        state.ctx.lineWidth = 2;
        state.ctx.beginPath();
        state.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        state.ctx.stroke();
      }
      
      // Laser aim line to player
      if (chargeProgress > 0.3) {
        const dx = state.player.x - d.x;
        const dy = state.player.y - d.y;
        const dist = Math.hypot(dx, dy);
        
        state.ctx.strokeStyle = `rgba(255, 100, 255, ${chargeProgress * 0.4})`;
        state.ctx.lineWidth = 3;
        state.ctx.setLineDash([10, 5]);
        state.ctx.beginPath();
        state.ctx.moveTo(0, 0);
        state.ctx.lineTo(dx, dy);
        state.ctx.stroke();
        state.ctx.setLineDash([]);
      }
      
      state.ctx.restore();
    }
  });
}

export function drawDropships() {
  state.dropships.forEach(dropship => {
    const ctx = state.ctx;
    const size = dropship.size;
    const x = dropship.x;
    const y = dropship.y;

    ctx.save();
    ctx.translate(x, y);
    
    // Main hull (angular military design)
    ctx.fillStyle = '#2a2a2a';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    
    // Top angular hull
    ctx.beginPath();
    ctx.moveTo(-size/2, -size/3);
    ctx.lineTo(-size/3, -size/2);
    ctx.lineTo(size/3, -size/2);
    ctx.lineTo(size/2, -size/3);
    ctx.lineTo(size/2, size/4);
    ctx.lineTo(-size/2, size/4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Cockpit/bridge section (angular)
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(-size/4, -size/2.2);
    ctx.lineTo(-size/5, -size/1.7);
    ctx.lineTo(size/5, -size/1.7);
    ctx.lineTo(size/4, -size/2.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Cockpit windows (glowing cyan) - no blur for performance
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(-size/6, -size/2, size/3, size/8);
    
    // Side thrusters
    ctx.fillStyle = '#555';
    ctx.fillRect(-size/2 - 4, -size/6, 4, size/3);
    ctx.fillStyle = '#666';
    ctx.fillRect(-size/2 - 3, -size/6 + 2, 2, size/3 - 4);
    
    ctx.fillStyle = '#555';
    ctx.fillRect(size/2, -size/6, 4, size/3);
    ctx.fillStyle = '#666';
    ctx.fillRect(size/2 + 1, -size/6 + 2, 2, size/3 - 4);
    
    // Main engine exhaust
    const engineFlicker = 0.5 + Math.random() * 0.5;
    const enginePulse = Math.sin(state.frameCount * 0.2) * 0.2 + 0.8;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(-size/3, size/4, size/1.5, size/6);
    
    // Engine glow (no blur for performance)
    ctx.fillStyle = `rgba(100, 200, 255, ${engineFlicker * enginePulse})`;
    ctx.beginPath();
    ctx.moveTo(-size/4, size/4 + size/6);
    ctx.lineTo(-size/5, size/4 + size/4);
    ctx.lineTo(size/5, size/4 + size/4);
    ctx.lineTo(size/4, size/4 + size/6);
    ctx.closePath();
    ctx.fill();
    
    // Panel lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size/3, -size/4);
    ctx.lineTo(-size/3, size/4);
    ctx.moveTo(size/3, -size/4);
    ctx.lineTo(size/3, size/4);
    ctx.stroke();
    
    // Weapon indicators (red when about to fire)
    if (dropship.burstCount !== undefined && dropship.burstCount < dropship.burstSize) {
      ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
      ctx.beginPath();
      ctx.arc(-size/3, size/5, 3, 0, Math.PI * 2);
      ctx.arc(size/3, size/5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Health bar
    const barWidth = size;
    const barHeight = 4;
    const barX = x - barWidth/2;
    const barY = y - size/2 - 12;
    
    ctx.fillStyle = "rgba(50, 50, 50, 0.8)";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "rgba(255, 100, 50, 0.9)";
    ctx.fillRect(barX, barY, barWidth * (dropship.health / 300), barHeight);
  });
}

export function drawDropship(mech) {
  const ctx = state.ctx;
  const size = (mech && mech.size) || 40;
  const x = (mech && mech.x) || state.canvas.width / 2;
  const y = (mech && mech.y) || state.canvas.height / 2;

  ctx.save();
  ctx.translate(x, y);
  
  // Main hull (angular military design)
  ctx.fillStyle = '#2a2a2a';
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  
  // Top angular hull
  ctx.beginPath();
  ctx.moveTo(-size/2, -size/3);
  ctx.lineTo(-size/3, -size/2);
  ctx.lineTo(size/3, -size/2);
  ctx.lineTo(size/2, -size/3);
  ctx.lineTo(size/2, size/4);
  ctx.lineTo(-size/2, size/4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Cockpit/bridge section (angular)
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.moveTo(-size/4, -size/2.2);
  ctx.lineTo(-size/5, -size/1.7);
  ctx.lineTo(size/5, -size/1.7);
  ctx.lineTo(size/4, -size/2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Cockpit windows (glowing cyan) - no blur for performance
  ctx.fillStyle = '#00ccff';
  ctx.fillRect(-size/6, -size/2, size/3, size/8);
  
  // Side thrusters (mechanical details)
  ctx.fillStyle = '#555';
  // Left thruster
  ctx.fillRect(-size/2 - 4, -size/6, 4, size/3);
  ctx.fillStyle = '#666';
  ctx.fillRect(-size/2 - 3, -size/6 + 2, 2, size/3 - 4);
  
  // Right thruster
  ctx.fillStyle = '#555';
  ctx.fillRect(size/2, -size/6, 4, size/3);
  ctx.fillStyle = '#666';
  ctx.fillRect(size/2 + 1, -size/6 + 2, 2, size/3 - 4);
  
  // Main engine exhaust (bottom)
  const engineFlicker = 0.5 + Math.random() * 0.5;
  const enginePulse = Math.sin(state.frameCount * 0.2) * 0.2 + 0.8;
  
  // Engine housing
  ctx.fillStyle = '#333';
  ctx.fillRect(-size/3, size/4, size/1.5, size/6);
  
  // Engine glow (blue thrust) - no blur for performance
  ctx.fillStyle = `rgba(100, 200, 255, ${engineFlicker * enginePulse})`;
  ctx.beginPath();
  ctx.moveTo(-size/4, size/4 + size/6);
  ctx.lineTo(-size/5, size/4 + size/4);
  ctx.lineTo(size/5, size/4 + size/4);
  ctx.lineTo(size/4, size/4 + size/6);
  ctx.closePath();
  ctx.fill();
  
  // Side engine particles
  for (let side = -1; side <= 1; side += 2) {
    const particleX = side * (size/2 + 2);
    const particleY = 0;
    ctx.fillStyle = `rgba(255, 150, 50, ${engineFlicker * 0.6})`;
    ctx.beginPath();
    ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Deployment bay door (opening during deploy)
  if (mech && mech.deploying) {
    const doorOpen = Math.min(1, (mech.deployProgress || 0) / 60);
    
    // Bay door panels
    ctx.fillStyle = '#555';
    ctx.fillRect(-size/4, size/6, (size/4) * (1 - doorOpen), size/8);
    ctx.fillRect(0 + (size/4) * doorOpen, size/6, (size/4) * (1 - doorOpen), size/8);
    
    // Deployment light (no blur for performance)
    if (doorOpen > 0.3) {
      ctx.fillStyle = `rgba(255, 100, 100, ${doorOpen})`;
      ctx.beginPath();
      ctx.arc(0, size/5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Panel lines (industrial detail)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size/3, -size/4);
  ctx.lineTo(-size/3, size/4);
  ctx.moveTo(size/3, -size/4);
  ctx.lineTo(size/3, size/4);
  ctx.moveTo(-size/2, 0);
  ctx.lineTo(size/2, 0);
  ctx.stroke();
  
  // Gundam-style markings (hazard stripes)
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size/2.5, size/5);
  ctx.lineTo(-size/3.5, size/5);
  ctx.moveTo(size/3.5, size/5);
  ctx.lineTo(size/2.5, size/5);
  ctx.stroke();
  
  ctx.restore();
}
