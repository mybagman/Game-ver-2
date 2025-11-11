import * as state from '../state.js';

export function drawEnemies() {
  // Cache pulse value - calculated once per frame and reused for all red squares
  const redSquarePulse = Math.sin(state.frameCount * 0.1) * 0.3 + 0.7;
  
  state.enemies.forEach(e => {
    if (!e) return;

    if (e.type === "red-square") { 
      // Raiden-style enemy fighter (aggressive red variant)
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      // Calculate angle toward player for orientation
      const dx = state.player.x - e.x;
      const dy = state.player.y - e.y;
      const angle = Math.atan2(dy, dx);
      state.ctx.rotate(angle);
      
      const size = e.size;
      const pulse = redSquarePulse;
      
      // Main fuselage (dark red military)
      state.ctx.fillStyle = "#8B0000";
      state.ctx.fillRect(-size/3, -size/8, size*0.66, size/4);
      
      // Nose cone
      state.ctx.fillStyle = "#A00000";
      state.ctx.beginPath();
      state.ctx.moveTo(size/3, 0);
      state.ctx.lineTo(size/6, -size/8);
      state.ctx.lineTo(size/6, size/8);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Delta wings (Raiden enemy style)
      state.ctx.fillStyle = "#700000";
      state.ctx.beginPath();
      state.ctx.moveTo(-size/6, -size/8);
      state.ctx.lineTo(-size/4, -size/3);
      state.ctx.lineTo(size/12, -size/6);
      state.ctx.closePath();
      state.ctx.fill();
      state.ctx.beginPath();
      state.ctx.moveTo(-size/6, size/8);
      state.ctx.lineTo(-size/4, size/3);
      state.ctx.lineTo(size/12, size/6);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Cockpit window (glowing)
      state.ctx.fillStyle = `rgba(255, 80, 80, ${pulse})`;
      state.ctx.fillRect(size/12, -size/16, size/8, size/8);
      
      // Twin engines at rear
      state.ctx.fillStyle = `rgba(255, 100, 0, ${pulse * 0.8})`;
      state.ctx.fillRect(-size/3, -size/12, size/12, size/6);
      
      // Engine glow effect
      if (state.frameCount % 3 === 0) {
        state.ctx.fillStyle = `rgba(255, 150, 50, ${pulse * 0.6})`;
        state.ctx.fillRect(-size/2.5, -size/16, size/8, size/8);
      }
      
      // Panel lines
      state.ctx.strokeStyle = "#500000";
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(0, -size/10);
      state.ctx.lineTo(-size/4, -size/10);
      state.ctx.moveTo(0, size/10);
      state.ctx.lineTo(-size/4, size/10);
      state.ctx.stroke();
      
      // Weapons hardpoints
      state.ctx.fillStyle = "#600000";
      state.ctx.fillRect(-size/5, -size/4, size/20, size/12);
      state.ctx.fillRect(-size/5, size/4 - size/12, size/20, size/12);
      
      state.ctx.restore();
    }
    else if (e.type === "triangle") { 
      // Raiden-style blue support bomber (heavier enemy aircraft)
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      const size = e.size;
      const pulse = Math.sin(state.frameCount * 0.08 + e.x) * 0.4 + 0.6;
      
      // Main body (blue-gray military bomber)
      state.ctx.fillStyle = "#2a4a6a";
      state.ctx.fillRect(-size/3, -size/6, size*0.75, size/3);
      
      // Nose section
      state.ctx.fillStyle = "#3a5a7a";
      state.ctx.beginPath();
      state.ctx.moveTo(size*0.42, 0);
      state.ctx.lineTo(size/4, -size/6);
      state.ctx.lineTo(size/4, size/6);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Wide bomber wings
      state.ctx.fillStyle = "#1a3a5a";
      state.ctx.fillRect(-size/4, -size/2.5, size/2, size/12);
      state.ctx.fillRect(-size/4, size/2.5 - size/12, size/2, size/12);
      
      // Wing-mounted weapons pods
      state.ctx.fillStyle = "#0a2a4a";
      state.ctx.fillRect(-size/6, -size/2.2, size/12, size/8);
      state.ctx.fillRect(-size/6, size/2.2 - size/8, size/12, size/8);
      
      // Cockpit (glowing cyan)
      state.ctx.fillStyle = `rgba(0,200,255,${pulse})`;
      state.ctx.fillRect(size/8, -size/12, size/6, size/6);
      
      // Twin engines with glow
      state.ctx.fillStyle = "#1a2a3a";
      state.ctx.fillRect(-size/3, -size/10, size/10, size/5);
      state.ctx.fillStyle = `rgba(100,180,255,${pulse * 0.8})`;
      state.ctx.fillRect(-size/2.8, -size/14, size/12, size/7);
      
      // Panel lines
      state.ctx.strokeStyle = "#0a2a4a";
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(0, -size/8);
      state.ctx.lineTo(-size/3, -size/8);
      state.ctx.moveTo(0, size/8);
      state.ctx.lineTo(-size/3, size/8);
      state.ctx.stroke();
      
      // Vertical stabilizer
      state.ctx.fillStyle = "#2a4a6a";
      state.ctx.fillRect(-size/4, -size/3, size/20, size/8);
      
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
      // Raiden-style massive battleship/mothership boss
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      const size = e.size;
      const pulse = Math.sin(state.frameCount * 0.05) * 0.2 + 0.8;
      
      // Main hull (massive fortress-like structure)
      state.ctx.fillStyle = "#4a4a3a";
      state.ctx.fillRect(-size/2, -size/3, size, size*0.66);
      
      // Bridge tower
      state.ctx.fillStyle = "#5a5a4a";
      state.ctx.fillRect(-size/6, -size/2, size/3, size/4);
      
      // Command deck windows (glowing yellow)
      state.ctx.fillStyle = `rgba(255, 220, 100, ${pulse})`;
      state.ctx.fillRect(-size/8, -size/2.2, size/4, size/12);
      
      // Multiple turret emplacements
      const turretPositions = [
        [-size/3, -size/4], [size/3, -size/4],
        [-size/3, size/4], [size/3, size/4],
        [-size/6, 0], [size/6, 0]
      ];
      
      turretPositions.forEach(([tx, ty]) => {
        state.ctx.fillStyle = "#3a3a2a";
        state.ctx.fillRect(tx - size/12, ty - size/12, size/6, size/6);
        state.ctx.fillStyle = "#5a5a4a";
        state.ctx.fillRect(tx - size/16, ty - size/16, size/8, size/8);
      });
      
      // Engine banks (glowing)
      state.ctx.fillStyle = `rgba(255, 150, 50, ${pulse * 0.9})`;
      state.ctx.fillRect(-size/2.5, size/3, size/8, size/4);
      state.ctx.fillRect(size/2.5 - size/8, size/3, size/8, size/4);
      
      // Armor plating detail
      state.ctx.strokeStyle = "#2a2a1a";
      state.ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        state.ctx.beginPath();
        state.ctx.moveTo(-size/2, i * size/10);
        state.ctx.lineTo(size/2, i * size/10);
        state.ctx.stroke();
      }
      
      // Warning lights
      if (state.frameCount % 30 < 15) {
        state.ctx.fillStyle = "#ff3333";
        state.ctx.fillRect(-size/2.2, -size/3, size/20, size/20);
        state.ctx.fillRect(size/2.2 - size/20, -size/3, size/20, size/20);
      }
      
      state.ctx.restore();
    }
    else if (e.type === "mini-boss") { 
      // Raiden-style heavy cruiser mini-boss
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      const size = e.size;
      const pulse = Math.sin(state.frameCount * 0.07) * 0.2 + 0.8;
      
      // Main hull (military gray)
      state.ctx.fillStyle = "#5a5a5a";
      state.ctx.fillRect(-size/2.5, -size/4, size*0.9, size/2);
      
      // Command bridge
      state.ctx.fillStyle = "#6a6a6a";
      state.ctx.fillRect(-size/8, -size/3, size/4, size/6);
      
      // Bridge windows (orange glow)
      state.ctx.fillStyle = `rgba(255, 160, 80, ${pulse})`;
      state.ctx.fillRect(-size/12, -size/3.5, size/6, size/12);
      
      // Wing cannons
      state.ctx.fillStyle = "#4a4a4a";
      state.ctx.fillRect(-size/2, -size/3.5, size/6, size/8);
      state.ctx.fillRect(size/2 - size/6, -size/3.5, size/6, size/8);
      
      // Main guns
      state.ctx.fillStyle = "#3a3a3a";
      state.ctx.fillRect(-size/4, -size/8, size/2, size/12);
      state.ctx.fillRect(-size/4, size/8 - size/12, size/2, size/12);
      
      // Engine cluster (glowing)
      state.ctx.fillStyle = `rgba(255, 120, 50, ${pulse * 0.9})`;
      state.ctx.fillRect(-size/2.2, size/4 - size/12, size/6, size/6);
      
      // Armor panels
      state.ctx.strokeStyle = "#3a3a3a";
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(-size/3, -size/6);
      state.ctx.lineTo(size/3, -size/6);
      state.ctx.moveTo(-size/3, size/6);
      state.ctx.lineTo(size/3, size/6);
      state.ctx.stroke();
      
      state.ctx.restore();
    }
    else if (e.type === "reflector") {
      // 8-bit Gundam-style support ship with shield generator
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      state.ctx.rotate(e.angle||0);

      // Main hull (angular military design)
      state.ctx.fillStyle = "#3a3a50";
      state.ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
      
      // Cockpit section (front)
      state.ctx.fillStyle = "#4a4a60";
      state.ctx.fillRect(e.width/4, -e.height/3, e.width/4, e.height * 0.66);
      
      // Cockpit window (cyan glow)
      state.ctx.fillStyle = "#00ccff";
      state.ctx.fillRect(e.width/3, -e.height/6, e.width/8, e.height/3);
      
      // Shield generator pods on sides
      const podWidth = 8;
      const podHeight = 12;
      state.ctx.fillStyle = e.shieldActive ? "#8844ff" : "#6633cc";
      // Left pod
      state.ctx.fillRect(-e.width/2 - podWidth, -podHeight/2, podWidth, podHeight);
      // Right pod
      state.ctx.fillRect(e.width/2, -podHeight/2, podWidth, podHeight);
      
      // Shield generator energy cores (pulsing)
      const pulse = e.shieldActive ? (0.6 + Math.sin(state.frameCount * 0.15) * 0.4) : 0.3;
      state.ctx.fillStyle = `rgba(138, 100, 255, ${pulse})`;
      state.ctx.beginPath();
      state.ctx.arc(-e.width/2 - podWidth/2, 0, 3, 0, Math.PI * 2);
      state.ctx.arc(e.width/2 + podWidth/2, 0, 3, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Panel lines (8-bit detailing)
      state.ctx.strokeStyle = "#2a2a40";
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(-e.width/4, -e.height/2);
      state.ctx.lineTo(-e.width/4, e.height/2);
      state.ctx.moveTo(e.width/8, -e.height/2);
      state.ctx.lineTo(e.width/8, e.height/2);
      state.ctx.stroke();

      // Active shield field
      if (e.shieldActive) {
        const shieldPulse = Math.sin(state.frameCount * 0.1) * 5 + 60;
        state.ctx.strokeStyle = `rgba(138,100,255,${0.5 + Math.sin(state.frameCount * 0.1) * 0.3})`;
        state.ctx.lineWidth = 2;
        state.ctx.beginPath();
        state.ctx.arc(0, 0, shieldPulse, 0, Math.PI*2);
        state.ctx.stroke();
        
        // Shield energy beams connecting to nearby allies
        state.ctx.strokeStyle = `rgba(138,100,255,0.4)`;
        state.ctx.lineWidth = 1;
        // Visual only - actual shield logic in enemies.js
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
  // Raiden-style ground tanks
  state.tanks.forEach(tank => {
    state.ctx.save();
    state.ctx.translate(tank.x, tank.y);

    // Tank chassis (military olive/gray)
    state.ctx.fillStyle = "#5a5a4a";
    state.ctx.fillRect(-tank.width/2, -tank.height/2, tank.width, tank.height);
    
    // Treads/tracks
    state.ctx.fillStyle = "#3a3a2a";
    state.ctx.fillRect(-tank.width/2, -tank.height/2 + 2, tank.width, 4);
    state.ctx.fillRect(-tank.width/2, tank.height/2 - 6, tank.width, 4);
    
    // Armor panels
    state.ctx.fillStyle = "#6a6a5a";
    state.ctx.fillRect(-tank.width/3, -tank.height/3, tank.width*0.66, tank.height*0.4);
    
    // Turret base
    state.ctx.fillStyle = "#5a5a5a";
    state.ctx.fillRect(-12, -12, 24, 24);

    // Turret barrel (rotates toward player)
    state.ctx.rotate(tank.turretAngle);
    state.ctx.fillStyle = "#4a4a4a";
    state.ctx.fillRect(0, -6, 28, 12);
    
    // Barrel tip
    state.ctx.fillStyle = "#3a3a3a";
    state.ctx.fillRect(26, -7, 4, 14);
    
    // Muzzle brake details
    state.ctx.strokeStyle = "#2a2a2a";
    state.ctx.lineWidth = 1;
    state.ctx.beginPath();
    state.ctx.moveTo(4, -5);
    state.ctx.lineTo(24, -5);
    state.ctx.moveTo(4, 5);
    state.ctx.lineTo(24, 5);
    state.ctx.stroke();

    state.ctx.restore();
  });
}

export function drawWalkers() {
  // Raiden-style bipedal walkers
  state.walkers.forEach(walker => {
    state.ctx.save();
    state.ctx.translate(walker.x, walker.y);

    // Main body (military blue-gray)
    state.ctx.fillStyle = "#4a5a6a";
    state.ctx.fillRect(-walker.width/2, -walker.height/2, walker.width, walker.height/2);
    
    // Command module on top
    state.ctx.fillStyle = "#5a6a7a";
    state.ctx.fillRect(-walker.width/3, -walker.height/1.8, walker.width*0.66, walker.height/4);
    
    // Sensor array (glowing)
    const pulse = 0.6 + Math.sin(state.frameCount * 0.1) * 0.4;
    state.ctx.fillStyle = `rgba(100, 200, 255, ${pulse})`;
    state.ctx.fillRect(-walker.width/6, -walker.height/1.6, walker.width/3, walker.height/12);
    
    // Weapons pods on sides
    state.ctx.fillStyle = "#3a4a5a";
    state.ctx.fillRect(-walker.width/2 - 4, -walker.height/6, 6, walker.height/4);
    state.ctx.fillRect(walker.width/2 - 2, -walker.height/6, 6, walker.height/4);

    // Animated legs (bipedal walker)
    const legOffset = Math.sin(walker.legPhase) * 12;
    state.ctx.strokeStyle = "#5a6a7a";
    state.ctx.lineWidth = 4;
    state.ctx.lineCap = "round";
    
    // Left leg
    state.ctx.beginPath();
    state.ctx.moveTo(-walker.width/4, walker.height/4);
    state.ctx.lineTo(-walker.width/4 + legOffset, walker.height/2 + 12);
    state.ctx.stroke();
    
    // Right leg
    state.ctx.beginPath();
    state.ctx.moveTo(walker.width/4, walker.height/4);
    state.ctx.lineTo(walker.width/4 - legOffset, walker.height/2 + 12);
    state.ctx.stroke();
    
    // Leg joints
    state.ctx.fillStyle = "#6a7a8a";
    state.ctx.fillRect(-walker.width/4 - 3, walker.height/4 - 3, 6, 6);
    state.ctx.fillRect(walker.width/4 - 3, walker.height/4 - 3, 6, 6);
    
    // Foot pads
    state.ctx.fillStyle = "#4a5a6a";
    state.ctx.fillRect(-walker.width/4 + legOffset - 4, walker.height/2 + 10, 8, 4);
    state.ctx.fillRect(walker.width/4 - legOffset - 4, walker.height/2 + 10, 8, 4);

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

    // Raiden-style heavy ground mech/tank with 4 legs
    const legPhase = (mech.legPhase || 0);
    
    // Draw 4 mechanical legs (animated, Raiden military style)
    for (let i = 0; i < 4; i++) {
      const baseAngle = (i / 4) * Math.PI * 2;
      const legOffset = Math.sin(legPhase + i * Math.PI / 2) * 6;
      
      // Leg positions
      const legBaseX = Math.cos(baseAngle) * (mech.size/3.5);
      const legBaseY = Math.sin(baseAngle) * (mech.size/3.5);
      const legMidX = Math.cos(baseAngle) * (mech.size/2 + 6) + legOffset * Math.sin(baseAngle);
      const legMidY = Math.sin(baseAngle) * (mech.size/2 + 6) - legOffset * Math.cos(baseAngle);
      const legEndX = Math.cos(baseAngle) * (mech.size/2 + 12) + legOffset * 1.2 * Math.sin(baseAngle);
      const legEndY = Math.sin(baseAngle) * (mech.size/2 + 12) - legOffset * 1.2 * Math.cos(baseAngle);
      
      // Hydraulic leg segments (military mech style)
      state.ctx.strokeStyle = "#5a5a5a";
      state.ctx.lineWidth = 4;
      state.ctx.lineCap = "round";
      
      state.ctx.beginPath();
      state.ctx.moveTo(legBaseX, legBaseY);
      state.ctx.lineTo(legMidX, legMidY);
      state.ctx.stroke();
      
      state.ctx.strokeStyle = "#4a4a4a";
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      state.ctx.moveTo(legMidX, legMidY);
      state.ctx.lineTo(legEndX, legEndY);
      state.ctx.stroke();
      
      // Joints (bolted connections)
      state.ctx.fillStyle = "#6a6a6a";
      state.ctx.fillRect(legBaseX - 3, legBaseY - 3, 6, 6);
      state.ctx.fillRect(legMidX - 2, legMidY - 2, 4, 4);
      
      // Foot pads
      state.ctx.fillStyle = "#3a3a3a";
      state.ctx.fillRect(legEndX - 3, legEndY - 2, 6, 4);
    }
    
    // Main body (heavy tank chassis)
    state.ctx.fillStyle = "#4a5a4a";
    state.ctx.fillRect(-mech.size/2.5, -mech.size/4, mech.size*0.8, mech.size/2);
    
    // Armor plating
    state.ctx.fillStyle = "#5a6a5a";
    state.ctx.fillRect(-mech.size/3, -mech.size/3.5, mech.size*0.66, mech.size/7);
    state.ctx.fillRect(-mech.size/3, mech.size/3.5 - mech.size/7, mech.size*0.66, mech.size/7);
    
    // Command module
    state.ctx.fillStyle = "#6a7a6a";
    state.ctx.fillRect(-mech.size/8, -mech.size/3, mech.size/4, mech.size/6);
    
    // Sensor array (glowing red)
    const sensorPulse = 0.6 + Math.sin(state.frameCount * 0.1) * 0.4;
    state.ctx.fillStyle = `rgba(255, 80, 80, ${sensorPulse})`;
    state.ctx.fillRect(-mech.size/16, -mech.size/3.2, mech.size/8, mech.size/16);
    
    // Panel lines and rivets
    state.ctx.strokeStyle = "#3a4a3a";
    state.ctx.lineWidth = 1;
    state.ctx.beginPath();
    state.ctx.moveTo(-mech.size/3, -mech.size/8);
    state.ctx.lineTo(mech.size/2, -mech.size/8);
    state.ctx.moveTo(-mech.size/3, mech.size/8);
    state.ctx.lineTo(mech.size/2, mech.size/8);
    state.ctx.stroke();
    
    // Heavy cannon turret (aims at player)
    const cannonAngle = Math.atan2(state.player.y - mech.y, state.player.x - mech.x);
    state.ctx.rotate(cannonAngle);
    
    // Turret base
    state.ctx.fillStyle = "#5a5a5a";
    state.ctx.fillRect(-8, -8, 16, 16);
    
    // Main gun barrel (Raiden-style heavy cannon)
    state.ctx.fillStyle = "#4a4a4a";
    state.ctx.fillRect(0, -5, 24, 10);
    
    // Barrel tip
    state.ctx.fillStyle = "#3a3a3a";
    state.ctx.fillRect(22, -6, 4, 12);
    
    // Muzzle flash when charging
    if (mech.shootTimer && mech.shootTimer > 50) {
      const chargeIntensity = (mech.shootTimer - 50) / 10;
      state.ctx.fillStyle = `rgba(255, 150, 50, ${chargeIntensity * 0.9})`;
      state.ctx.fillRect(24, -4, 6, 8);
    }
    
    // Barrel details
    state.ctx.strokeStyle = "#2a2a2a";
    state.ctx.lineWidth = 1;
    state.ctx.beginPath();
    state.ctx.moveTo(2, -4);
    state.ctx.lineTo(20, -4);
    state.ctx.moveTo(2, 4);
    state.ctx.lineTo(20, 4);
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

    // Draw enhanced barrier/shield formation with attached enemies
    if (d.attachments && d.attachments.length > 0) {
      // Draw shield energy field connecting all attached enemies
      const shieldAlpha = Math.min(0.3 + d.attachments.length * 0.05, 0.6);
      const shieldPulse = Math.sin(state.frameCount * 0.08) * 0.15 + 0.85;
      
      // Draw shield polygon connecting all attached enemy positions
      if (d.attachments.length >= 3) {
        state.ctx.save();
        state.ctx.fillStyle = `rgba(100, 200, 255, ${shieldAlpha * 0.3 * shieldPulse})`;
        state.ctx.strokeStyle = `rgba(100, 200, 255, ${shieldAlpha * shieldPulse})`;
        state.ctx.lineWidth = 2;
        
        state.ctx.beginPath();
        d.attachments.forEach((a, i) => {
          if (a.visualOrbitX && a.visualOrbitY) {
            if (i === 0) {
              state.ctx.moveTo(a.visualOrbitX, a.visualOrbitY);
            } else {
              state.ctx.lineTo(a.visualOrbitX, a.visualOrbitY);
            }
          }
        });
        state.ctx.closePath();
        state.ctx.fill();
        state.ctx.stroke();
        state.ctx.restore();
      }
      
      // Draw energy beams from diamond core to each attached enemy
      d.attachments.forEach(a => {
        if (a.visualOrbitX && a.visualOrbitY) {
          state.ctx.save();
          
          // Pulsing energy beam
          const beamAlpha = 0.4 + Math.sin(state.frameCount * 0.1 + a.orbitAngle) * 0.2;
          state.ctx.strokeStyle = `rgba(150, 220, 255, ${beamAlpha * shieldPulse})`;
          state.ctx.lineWidth = 2;
          state.ctx.beginPath();
          state.ctx.moveTo(d.x, d.y);
          state.ctx.lineTo(a.visualOrbitX, a.visualOrbitY);
          state.ctx.stroke();
          
          // Energy nodes at attachment points
          state.ctx.fillStyle = `rgba(100, 200, 255, ${beamAlpha * 1.2})`;
          state.ctx.beginPath();
          state.ctx.arc(a.visualOrbitX, a.visualOrbitY, 4, 0, Math.PI * 2);
          state.ctx.fill();
          
          state.ctx.restore();
        }
      });
      
      // Barrier strength indicator text
      if (d.attachments.length >= 5) {
        state.ctx.save();
        state.ctx.font = "bold 12px Orbitron, monospace";
        state.ctx.textAlign = "center";
        state.ctx.fillStyle = `rgba(100, 255, 255, ${shieldPulse})`;
        state.ctx.fillText(`⬢ BARRIER ACTIVE ⬢`, d.x, d.y + enhancedSize/2 + 60);
        state.ctx.restore();
      }
    }

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
