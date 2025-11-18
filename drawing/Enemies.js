import * as state from '../state.js';

export function drawEnemies() {
  // Cache pulse value - calculated once per frame and reused for all red squares
  const redSquarePulse = Math.sin(state.frameCount * 0.1) * 0.3 + 0.7;
  const isSideView = state.wave >= 11;
  
  state.enemies.forEach(e => {
    if (!e) return;

    if (e.type === "red-square") { 
      // After wave 11: WW2 Zero fighter style (side-view, larger)
      // Before wave 11: Raiden-style enemy fighter (top-down)
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      // Size increase for ALL waves (requirement: increase unit size while keeping design)
      const sizeMultiplier = isSideView ? 2.0 : 1.8;
      const size = e.size * sizeMultiplier;
      const pulse = redSquarePulse;
      
      if (isSideView) {
        // WW2 Zero fighter - side view profile
        // Orient horizontally (side-on view)
        state.ctx.rotate(0); // Fixed horizontal orientation
        
        // Main fuselage (red, cylindrical body)
        state.ctx.fillStyle = "#8B0000";
        state.ctx.fillRect(-size/2, -size/6, size*0.8, size/3);
        
        // Nose cone (pointed)
        state.ctx.fillStyle = "#A00000";
        state.ctx.beginPath();
        state.ctx.moveTo(size*0.3, 0);
        state.ctx.lineTo(size*0.15, -size/6);
        state.ctx.lineTo(size*0.15, size/6);
        state.ctx.closePath();
        state.ctx.fill();
        
        // Propeller spinner
        state.ctx.fillStyle = "#600000";
        state.ctx.beginPath();
        state.ctx.arc(size*0.3, 0, size/12, 0, Math.PI * 2);
        state.ctx.fill();
        
        // Wings (distinctive rising sun markings area)
        state.ctx.fillStyle = "#700000";
        state.ctx.fillRect(-size/4, -size/2.5, size/3, size/16);
        state.ctx.fillRect(-size/4, size/2.5 - size/16, size/3, size/16);
        
        // Cockpit canopy
        state.ctx.fillStyle = `rgba(100, 100, 150, ${pulse * 0.8})`;
        state.ctx.fillRect(-size/8, -size/8, size/6, size/4);
        
        // Tail section
        state.ctx.fillStyle = "#700000";
        state.ctx.fillRect(-size/2, -size/8, size/8, size/4);
        
        // Vertical stabilizer
        state.ctx.fillStyle = "#600000";
        state.ctx.fillRect(-size/2.2, -size/3, size/12, size/3);
        
        // Engine exhaust glow
        state.ctx.fillStyle = `rgba(255, 120, 0, ${pulse * 0.6})`;
        state.ctx.beginPath();
        state.ctx.arc(-size/2, 0, size/10, 0, Math.PI * 2);
        state.ctx.fill();
      } else {
        // Original top-down Raiden-style fighter
        // Calculate angle toward player for orientation
        const dx = state.player.x - e.x;
        const dy = state.player.y - e.y;
        const angle = Math.atan2(dy, dx);
        state.ctx.rotate(angle);
        
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
      }
      
      state.ctx.restore();
    }
    else if (e.type === "triangle") { 
      // After wave 11: Larger blue triangle (side-view, enhanced visuals)
      // Before wave 11: Raiden-style blue support bomber (top-down)
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      // Size increase for ALL waves (requirement: increase unit size while keeping design)
      const sizeMultiplier = isSideView ? 2.0 : 1.8;
      const size = e.size * sizeMultiplier;
      const pulse = Math.sin(state.frameCount * 0.08 + e.x) * 0.4 + 0.6;
      
      if (isSideView) {
        // Enhanced blue triangle - side view, larger with more details
        // Triangle profile shape
        state.ctx.fillStyle = "#2a4a6a";
        state.ctx.beginPath();
        state.ctx.moveTo(size*0.4, 0); // Nose
        state.ctx.lineTo(-size*0.4, -size*0.5); // Top rear
        state.ctx.lineTo(-size*0.4, size*0.5); // Bottom rear
        state.ctx.closePath();
        state.ctx.fill();
        
        // Enhanced outline for definition
        state.ctx.strokeStyle = "#3a5a8a";
        state.ctx.lineWidth = 2;
        state.ctx.stroke();
        
        // Cockpit area (glowing)
        state.ctx.fillStyle = `rgba(50, 150, 255, ${pulse})`;
        state.ctx.beginPath();
        state.ctx.arc(size*0.1, 0, size/6, 0, Math.PI * 2);
        state.ctx.fill();
        
        // Engine ports on wings
        state.ctx.fillStyle = `rgba(100, 180, 255, ${pulse * 0.9})`;
        state.ctx.fillRect(-size*0.35, -size*0.45, size/8, size/6);
        state.ctx.fillRect(-size*0.35, size*0.3, size/8, size/6);
        
        // Panel details
        state.ctx.strokeStyle = "#1a3a5a";
        state.ctx.lineWidth = 1;
        state.ctx.beginPath();
        state.ctx.moveTo(0, -size*0.3);
        state.ctx.lineTo(-size*0.2, -size*0.3);
        state.ctx.moveTo(0, size*0.3);
        state.ctx.lineTo(-size*0.2, size*0.3);
        state.ctx.stroke();
        
        // Weapon hardpoint markers
        state.ctx.fillStyle = "#0a2a4a";
        state.ctx.fillRect(size*0.15, -size*0.1, size/10, size/5);
      } else {
        // Original top-down blue bomber
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
      }
      
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
      // REDESIGNED: Giant planet killer (Death Star/UNICRON style) - ALL WAVES
      // Massive spherical mechanical appearance with planet-destroying aesthetic
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      const size = e.size * 1.5; // Make boss even larger
      const pulse = Math.sin(state.frameCount * 0.05) * 0.2 + 0.8;
      
      // Main spherical body (dark metallic)
      const bodyGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
      bodyGradient.addColorStop(0, "#3a3a3a");
      bodyGradient.addColorStop(0.6, "#2a2a2a");
      bodyGradient.addColorStop(1, "#1a1a1a");
      state.ctx.fillStyle = bodyGradient;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Mechanical segments (Death Star panels)
      const segmentSize = size / 12;
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const dist = Math.sqrt(i*i + j*j);
          if (dist < 5.5) {
            const shade = Math.floor((dist / 5.5) * 4);
            const colors = ["#4a4a4a", "#3a3a3a", "#2a2a2a", "#1a1a1a"];
            state.ctx.fillStyle = colors[shade] || "#1a1a1a";
            state.ctx.fillRect(i * segmentSize - segmentSize/2, j * segmentSize - segmentSize/2, segmentSize * 0.9, segmentSize * 0.9);
            
            // Panel lines
            state.ctx.strokeStyle = "#0a0a0a";
            state.ctx.lineWidth = 1;
            state.ctx.strokeRect(i * segmentSize - segmentSize/2, j * segmentSize - segmentSize/2, segmentSize * 0.9, segmentSize * 0.9);
          }
        }
      }
      
      // Death Star superlaser dish (glowing red weapon)
      const dishSize = size / 4;
      state.ctx.save();
      state.ctx.translate(size * 0.2, -size * 0.1);
      
      // Outer dish
      state.ctx.fillStyle = "#2a2a2a";
      state.ctx.beginPath();
      state.ctx.arc(0, 0, dishSize, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Inner rings (concentric)
      for (let r = 3; r >= 1; r--) {
        const ringRadius = (dishSize * r) / 4;
        state.ctx.strokeStyle = r === 1 ? `rgba(255, 50, 50, ${pulse})` : "#1a1a1a";
        state.ctx.lineWidth = r === 1 ? 3 : 2;
        state.ctx.beginPath();
        state.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        state.ctx.stroke();
      }
      
      // Central weapon core (glowing red)
      const coreGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, dishSize / 6);
      coreGradient.addColorStop(0, `rgba(255, 100, 100, ${pulse})`);
      coreGradient.addColorStop(0.7, `rgba(255, 50, 50, ${pulse * 0.7})`);
      coreGradient.addColorStop(1, "rgba(200, 0, 0, 0)");
      state.ctx.fillStyle = coreGradient;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, dishSize / 4, 0, Math.PI * 2);
      state.ctx.fill();
      
      state.ctx.restore();
      
      // Equatorial trench (like Death Star)
      state.ctx.strokeStyle = "#0a0a0a";
      state.ctx.lineWidth = size / 20;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
      state.ctx.stroke();
      
      state.ctx.strokeStyle = "#2a2a2a";
      state.ctx.lineWidth = size / 25;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, size / 2.5, 0, Math.PI * 2);
      state.ctx.stroke();
      
      // Surface details (antenna, turrets scattered across surface)
      const detailPositions = [
        [size * 0.3, size * 0.3], [-size * 0.25, size * 0.35],
        [size * 0.35, -size * 0.2], [-size * 0.3, -size * 0.3],
        [0, size * 0.4], [size * 0.4, 0]
      ];
      
      detailPositions.forEach(([dx, dy]) => {
        if (Math.sqrt(dx*dx + dy*dy) < size/2) {
          state.ctx.fillStyle = "#4a4a4a";
          state.ctx.fillRect(dx - 3, dy - 3, 6, 6);
          state.ctx.fillStyle = "#3a3a3a";
          state.ctx.fillRect(dx - 2, dy - 2, 4, 4);
        }
      });
      
      // Warning lights (pulsing red around the sphere)
      if (state.frameCount % 30 < 15) {
        const lightPositions = [[0, -size/2.2], [size/2.2, 0], [0, size/2.2], [-size/2.2, 0]];
        state.ctx.fillStyle = "#ff3333";
        lightPositions.forEach(([lx, ly]) => {
          state.ctx.fillRect(lx - 3, ly - 3, 6, 6);
        });
      }
      
      // Metallic highlight
      state.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      state.ctx.beginPath();
      state.ctx.arc(-size * 0.15, -size * 0.15, size / 4, 0, Math.PI * 2);
      state.ctx.fill();
      
      state.ctx.restore();
    }
    else if (e.type === "mini-boss") { 
      // After wave 11: 8-bit space battleship
      // Before wave 11: Raiden-style heavy cruiser mini-boss
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      const size = e.size;
      const pulse = Math.sin(state.frameCount * 0.07) * 0.2 + 0.8;
      
      if (isSideView) {
        // 8-bit space battleship - blocky retro design
        // Main hull (pixelated blocks)
        const blockSize = size / 12;
        state.ctx.fillStyle = "#4a4a5a";
        state.ctx.fillRect(-size/2, -size/5, size, size*0.4);
        
        // Superstructure tower (8-bit style)
        state.ctx.fillStyle = "#5a5a6a";
        state.ctx.fillRect(-size/6, -size/2, blockSize * 4, size/3);
        
        // Bridge windows (pixelated glow)
        state.ctx.fillStyle = `rgba(100, 200, 255, ${pulse})`;
        for (let i = 0; i < 3; i++) {
          state.ctx.fillRect(-size/8 + i * blockSize, -size/2.5, blockSize * 0.8, blockSize * 0.8);
        }
        
        // Main gun turrets (8-bit blocks)
        state.ctx.fillStyle = "#3a3a4a";
        // Forward turret
        state.ctx.fillRect(size/4, -size/3, blockSize * 3, blockSize * 2);
        state.ctx.fillRect(size/3, -size/4, blockSize * 4, blockSize);
        // Aft turret
        state.ctx.fillRect(-size/2.5, -size/4, blockSize * 3, blockSize * 2);
        
        // Hull plating (pixelated panels)
        state.ctx.fillStyle = "#6a6a7a";
        for (let i = -5; i < 5; i++) {
          if (i % 2 === 0) {
            state.ctx.fillRect(i * blockSize, -size/6, blockSize * 0.9, blockSize * 0.9);
          }
        }
        
        // Engine exhausts (glowing blocks)
        state.ctx.fillStyle = `rgba(255, 150, 50, ${pulse * 0.9})`;
        state.ctx.fillRect(-size/2, -size/8, blockSize * 2, blockSize);
        state.ctx.fillRect(-size/2, size/8 - blockSize, blockSize * 2, blockSize);
        
        // Radar/antenna array (8-bit style)
        state.ctx.fillStyle = "#7a7a8a";
        state.ctx.fillRect(-size/12, -size/1.8, blockSize, size/6);
      } else {
        // Original Raiden-style cruiser
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
      }
      
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
    // NEW: Draw worm enemies
    else if (e.type === "worm") {
      if (e.underground) {
        // Draw underground indicator (shadow with pulsing effect)
        const pulse = Math.sin(state.frameCount * 0.15) * 0.3 + 0.5;
        state.ctx.save();
        state.ctx.globalAlpha = pulse * 0.4;
        state.ctx.fillStyle = "#8B4513";
        state.ctx.beginPath();
        state.ctx.arc(e.x, e.y, e.size/2 + 10, 0, Math.PI * 2);
        state.ctx.fill();
        state.ctx.restore();
      } else {
        // Draw segmented worm body
        state.ctx.save();
        
        // Draw segments (body parts following the head)
        for (let i = e.segments.length - 1; i >= 0; i--) {
          const seg = e.segments[i];
          const segSize = e.size * (0.5 + (i / e.segments.length) * 0.5);
          
          // Worm segment body (brown/earthy color)
          state.ctx.fillStyle = i === 0 ? "#A0522D" : "#8B4513";
          state.ctx.beginPath();
          state.ctx.arc(seg.x, seg.y, segSize/2, 0, Math.PI * 2);
          state.ctx.fill();
          
          // Segment detail (rings)
          state.ctx.strokeStyle = "#654321";
          state.ctx.lineWidth = 2;
          state.ctx.beginPath();
          state.ctx.arc(seg.x, seg.y, segSize/2, 0, Math.PI * 2);
          state.ctx.stroke();
          
          // Head features (only on first segment)
          if (i === 0) {
            // Eyes
            state.ctx.fillStyle = "rgba(255, 50, 50, 0.9)";
            state.ctx.beginPath();
            state.ctx.arc(seg.x - segSize/6, seg.y - segSize/6, 3, 0, Math.PI * 2);
            state.ctx.arc(seg.x + segSize/6, seg.y - segSize/6, 3, 0, Math.PI * 2);
            state.ctx.fill();
            
            // Mouth
            state.ctx.strokeStyle = "#3a1a0a";
            state.ctx.lineWidth = 2;
            state.ctx.beginPath();
            state.ctx.arc(seg.x, seg.y + segSize/6, segSize/4, 0, Math.PI);
            state.ctx.stroke();
          }
        }
        
        // Outline for visibility
        state.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        state.ctx.lineWidth = 2;
        state.ctx.beginPath();
        state.ctx.arc(e.x, e.y, e.size/2 + 2, 0, Math.PI * 2);
        state.ctx.stroke();
        
        state.ctx.restore();
        
        // Health bar
        const barWidth = e.size;
        const barHeight = 8;
        state.ctx.fillStyle = "rgba(50,50,50,0.8)";
        state.ctx.fillRect(e.x - barWidth/2, e.y - e.size/2 - 20, barWidth, barHeight);
        state.ctx.fillStyle = "#A0522D";
        state.ctx.fillRect(e.x - barWidth/2, e.y - e.size/2 - 20, barWidth * (e.health / 80), barHeight);
      }
    }
    // NEW: Draw dinosaur enemies
    else if (e.type === "dinosaur") {
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      const size = e.size;
      const pulse = Math.sin(state.frameCount * 0.08) * 0.2 + 0.8;
      
      // Charge effect
      if (e.isCharging) {
        state.ctx.fillStyle = "rgba(255, 150, 50, 0.4)";
        state.ctx.beginPath();
        state.ctx.arc(0, 0, size/2 + 15, 0, Math.PI * 2);
        state.ctx.fill();
      }
      
      // Body (prehistoric green/brown)
      state.ctx.fillStyle = "#4a7c4a";
      state.ctx.beginPath();
      state.ctx.ellipse(0, 0, size/2, size/2.5, 0, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Head
      state.ctx.fillStyle = "#3a6c3a";
      state.ctx.beginPath();
      state.ctx.ellipse(size/3, -size/6, size/4, size/3.5, 0, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Eye
      state.ctx.fillStyle = e.isCharging ? "rgba(255, 0, 0, 0.9)" : "rgba(255, 200, 50, 0.9)";
      state.ctx.beginPath();
      state.ctx.arc(size/2.5, -size/5, 4, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Spikes/scales on back
      for (let i = 0; i < 5; i++) {
        const spikeX = -size/3 + i * (size/6);
        const spikeY = -size/3;
        
        state.ctx.fillStyle = "#2a5c2a";
        state.ctx.beginPath();
        state.ctx.moveTo(spikeX, spikeY);
        state.ctx.lineTo(spikeX - size/15, spikeY - size/8);
        state.ctx.lineTo(spikeX + size/15, spikeY - size/8);
        state.ctx.closePath();
        state.ctx.fill();
      }
      
      // Tail
      state.ctx.fillStyle = "#3a6c3a";
      state.ctx.beginPath();
      state.ctx.ellipse(-size/2.5, size/8, size/3, size/6, 0, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Legs (simple rectangles)
      state.ctx.fillStyle = "#3a6c3a";
      state.ctx.fillRect(-size/8, size/3, size/10, size/5);
      state.ctx.fillRect(size/12, size/3, size/10, size/5);
      
      // Roar effect
      if (e.roarTimer > 300 && e.roarTimer < 320) {
        const roarPulse = (320 - e.roarTimer) / 20;
        state.ctx.strokeStyle = `rgba(255, 200, 100, ${1 - roarPulse})`;
        state.ctx.lineWidth = 3;
        for (let r = 0; r < 3; r++) {
          state.ctx.beginPath();
          state.ctx.arc(size/2, -size/5, size/2 + r * 15 * roarPulse, 0, Math.PI * 2);
          state.ctx.stroke();
        }
      }
      
      // Outline for visibility
      state.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      state.ctx.lineWidth = 2;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, size/2 + 4, 0, Math.PI * 2);
      state.ctx.stroke();
      
      state.ctx.restore();
      
      // Health bar
      const barWidth = size;
      const barHeight = 10;
      state.ctx.fillStyle = "rgba(50,50,50,0.8)";
      state.ctx.fillRect(e.x - barWidth/2, e.y - size/2 - 25, barWidth, barHeight);
      state.ctx.fillStyle = "#4a7c4a";
      state.ctx.fillRect(e.x - barWidth/2, e.y - size/2 - 25, barWidth * (e.health / 150), barHeight);
    }
  });
}

export function drawTanks() {
  // Redesigned as HOVER TANKS - floating anti-gravity vehicles
  const isSideView = state.wave >= 11;
  
  state.tanks.forEach(tank => {
    state.ctx.save();
    state.ctx.translate(tank.x, tank.y);
    
    // Hover effect animation
    const hoverOffset = Math.sin(state.frameCount * 0.05 + tank.x * 0.01) * 3;
    state.ctx.translate(0, hoverOffset);

    if (isSideView) {
      // Side-view hover tank with anti-gravity repulsors
      const blockSize = tank.height / 6;
      
      // Main hull (sleek, elevated design)
      state.ctx.fillStyle = "#5a6a7a";
      state.ctx.fillRect(-tank.width/2, -blockSize * 2, tank.width, blockSize * 3);
      
      // Upper armor plating (angular sci-fi design)
      state.ctx.fillStyle = "#6a7a8a";
      state.ctx.fillRect(-tank.width/3, -blockSize * 3, tank.width * 0.6, blockSize);
      state.ctx.fillRect(-tank.width/4, -blockSize * 4, tank.width * 0.4, blockSize);
      
      // Turret (futuristic dome)
      state.ctx.fillStyle = "#5a6a8a";
      state.ctx.fillRect(-blockSize * 2, -blockSize * 5, blockSize * 4, blockSize * 2);
      
      // Main plasma cannon barrel
      state.ctx.fillStyle = "#4a5a6a";
      state.ctx.fillRect(blockSize * 2, -blockSize * 4.5, blockSize * 4, blockSize);
      
      // Barrel energy glow
      const energyPulse = 0.5 + Math.sin(state.frameCount * 0.1) * 0.3;
      state.ctx.fillStyle = `rgba(100, 200, 255, ${energyPulse})`;
      state.ctx.fillRect(blockSize * 5, -blockSize * 4.2, blockSize * 1.5, blockSize * 0.6);
      
      // Anti-gravity repulsor pods (underneath)
      state.ctx.fillStyle = "#3a4a5a";
      state.ctx.fillRect(-tank.width/3, blockSize, blockSize * 2, blockSize * 1.5);
      state.ctx.fillRect(tank.width/6, blockSize, blockSize * 2, blockSize * 1.5);
      
      // Repulsor field glow (blue energy field)
      state.ctx.fillStyle = `rgba(100, 200, 255, ${energyPulse * 0.6})`;
      for (let i = 0; i < 3; i++) {
        const fieldY = blockSize * 2.5 + i * 2;
        state.ctx.fillRect(-tank.width/3, fieldY, blockSize * 2, 1);
        state.ctx.fillRect(tank.width/6, fieldY, blockSize * 2, 1);
      }
      
      // Energy cores (glowing)
      state.ctx.fillStyle = `rgba(0, 150, 255, ${energyPulse})`;
      state.ctx.fillRect(-blockSize, -blockSize * 2, blockSize * 0.5, blockSize * 0.5);
      state.ctx.fillRect(blockSize * 0.5, -blockSize * 2, blockSize * 0.5, blockSize * 0.5);
    } else {
      // Top-down hover tank
      // Main chassis (sleek hovering design)
      state.ctx.fillStyle = "#5a6a7a";
      state.ctx.fillRect(-tank.width/2, -tank.height/2, tank.width, tank.height);
      
      // Hover repulsor indicators (corners)
      state.ctx.fillStyle = "#3a4a5a";
      const repulsorSize = 8;
      state.ctx.fillRect(-tank.width/2 + 2, -tank.height/2 + 2, repulsorSize, repulsorSize);
      state.ctx.fillRect(tank.width/2 - repulsorSize - 2, -tank.height/2 + 2, repulsorSize, repulsorSize);
      state.ctx.fillRect(-tank.width/2 + 2, tank.height/2 - repulsorSize - 2, repulsorSize, repulsorSize);
      state.ctx.fillRect(tank.width/2 - repulsorSize - 2, tank.height/2 - repulsorSize - 2, repulsorSize, repulsorSize);
      
      // Repulsor field glow
      const energyPulse = 0.5 + Math.sin(state.frameCount * 0.1) * 0.3;
      state.ctx.fillStyle = `rgba(100, 200, 255, ${energyPulse * 0.4})`;
      state.ctx.fillRect(-tank.width/2 + 4, -tank.height/2 + 4, repulsorSize - 4, repulsorSize - 4);
      state.ctx.fillRect(tank.width/2 - repulsorSize + 2, -tank.height/2 + 4, repulsorSize - 4, repulsorSize - 4);
      state.ctx.fillRect(-tank.width/2 + 4, tank.height/2 - repulsorSize + 2, repulsorSize - 4, repulsorSize - 4);
      state.ctx.fillRect(tank.width/2 - repulsorSize + 2, tank.height/2 - repulsorSize + 2, repulsorSize - 4, repulsorSize - 4);
      
      // Central armor panels
      state.ctx.fillStyle = "#6a7a8a";
      state.ctx.fillRect(-tank.width/3, -tank.height/3, tank.width*0.66, tank.height*0.4);
      
      // Turret base (energy dome)
      state.ctx.fillStyle = "#5a6a8a";
      state.ctx.fillRect(-12, -12, 24, 24);

      // Turret plasma cannon (rotates toward player)
      state.ctx.rotate(tank.turretAngle);
      state.ctx.fillStyle = "#4a5a6a";
      state.ctx.fillRect(0, -6, 28, 12);
      
      // Cannon energy tip
      state.ctx.fillStyle = `rgba(100, 200, 255, ${energyPulse})`;
      state.ctx.fillRect(24, -5, 6, 10);
      
      // Energy lines
      state.ctx.strokeStyle = `rgba(100, 200, 255, ${energyPulse * 0.6})`;
      state.ctx.lineWidth = 1;
      state.ctx.beginPath();
      state.ctx.moveTo(4, -4);
      state.ctx.lineTo(22, -4);
      state.ctx.moveTo(4, 4);
      state.ctx.lineTo(22, 4);
      state.ctx.stroke();
    }

    state.ctx.restore();
  });
}

export function drawWalkers() {
  // Redesigned as AT-AT style walkers - large quadruped assault vehicles
  const isSideView = state.wave >= 11;
  
  state.walkers.forEach(walker => {
    state.ctx.save();
    state.ctx.translate(walker.x, walker.y);

    const pulse = 0.6 + Math.sin(state.frameCount * 0.1) * 0.4;
    
    if (isSideView) {
      // AT-AT style - side view with 4 legs
      const blockSize = walker.height / 12;
      
      // Legs (animated walking motion) - 4 legs total
      const legOffset = Math.sin(walker.legPhase || 0) * blockSize * 1.5;
      state.ctx.fillStyle = "#3a4a5a";
      
      // Front-front leg (most forward)
      state.ctx.fillRect(-blockSize * 3, blockSize * 3 + legOffset, blockSize * 2.5, blockSize * 8);
      state.ctx.fillRect(-blockSize * 3.5, blockSize * 11 + legOffset, blockSize * 4, blockSize * 1.5);
      
      // Front-rear leg
      state.ctx.fillRect(-blockSize, blockSize * 3 - legOffset, blockSize * 2.5, blockSize * 8);
      state.ctx.fillRect(-blockSize * 1.5, blockSize * 11 - legOffset, blockSize * 4, blockSize * 1.5);
      
      // Back-front leg
      state.ctx.fillRect(blockSize * 1.5, blockSize * 3 - legOffset * 0.8, blockSize * 2.5, blockSize * 8);
      state.ctx.fillRect(blockSize, blockSize * 11 - legOffset * 0.8, blockSize * 4, blockSize * 1.5);
      
      // Back-rear leg (most rearward)
      state.ctx.fillRect(blockSize * 3.5, blockSize * 3 + legOffset * 0.8, blockSize * 2.5, blockSize * 8);
      state.ctx.fillRect(blockSize * 3, blockSize * 11 + legOffset * 0.8, blockSize * 4, blockSize * 1.5);
      
      // Leg joints (knees)
      state.ctx.fillStyle = "#4a5a6a";
      state.ctx.fillRect(-blockSize * 2.5, blockSize * 6 + legOffset, blockSize, blockSize);
      state.ctx.fillRect(-blockSize * 0.5, blockSize * 6 - legOffset, blockSize, blockSize);
      state.ctx.fillRect(blockSize * 2, blockSize * 6 - legOffset * 0.8, blockSize, blockSize);
      state.ctx.fillRect(blockSize * 4, blockSize * 6 + legOffset * 0.8, blockSize, blockSize);
      
      // Main body (elongated command section - AT-AT style)
      state.ctx.fillStyle = "#4a5a6a";
      state.ctx.fillRect(-blockSize * 6, -blockSize * 3, blockSize * 12, blockSize * 5);
      
      // Armored plating
      state.ctx.fillStyle = "#5a6a7a";
      state.ctx.fillRect(-blockSize * 5.5, -blockSize * 2.5, blockSize * 11, blockSize * 4);
      
      // Head/command cockpit (forward section)
      state.ctx.fillStyle = "#5a6a7a";
      state.ctx.fillRect(-blockSize * 7, -blockSize * 5, blockSize * 6, blockSize * 3);
      
      // Viewport (glowing red - menacing)
      state.ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
      state.ctx.fillRect(-blockSize * 6, -blockSize * 4.5, blockSize * 4, blockSize * 1.5);
      
      // Heavy chin weapons (dual cannons)
      state.ctx.fillStyle = "#2a3a4a";
      state.ctx.fillRect(-blockSize * 8, -blockSize * 2, blockSize * 3, blockSize);
      state.ctx.fillRect(-blockSize * 8, 0, blockSize * 3, blockSize);
      
      // Cannon barrels extending forward
      state.ctx.fillStyle = "#3a4a5a";
      state.ctx.fillRect(-blockSize * 9.5, -blockSize * 1.5, blockSize * 2, blockSize * 0.8);
      state.ctx.fillRect(-blockSize * 9.5, blockSize * 0.5, blockSize * 2, blockSize * 0.8);
      
      // Side panel details
      state.ctx.strokeStyle = "#2a3a4a";
      state.ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        state.ctx.beginPath();
        state.ctx.moveTo(-blockSize * 5 + i * blockSize * 2.5, -blockSize * 2);
        state.ctx.lineTo(-blockSize * 5 + i * blockSize * 2.5, blockSize * 1.5);
        state.ctx.stroke();
      }
      
      // Engine/exhaust ports on rear
      state.ctx.fillStyle = `rgba(255, 120, 50, ${pulse * 0.7})`;
      state.ctx.fillRect(blockSize * 5.5, -blockSize * 1.5, blockSize * 0.5, blockSize);
      state.ctx.fillRect(blockSize * 5.5, blockSize * 0.5, blockSize * 0.5, blockSize);
    } else {
      // Top-down AT-AT view (quadruped)
      // Main body (larger, more imposing)
      state.ctx.fillStyle = "#4a5a6a";
      state.ctx.fillRect(-walker.width/2, -walker.height/2, walker.width, walker.height/2);
      
      // Command module on top
      state.ctx.fillStyle = "#5a6a7a";
      state.ctx.fillRect(-walker.width/2.5, -walker.height/1.5, walker.width*0.8, walker.height/3);
      
      // Viewport array (red glow - menacing)
      state.ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
      state.ctx.fillRect(-walker.width/6, -walker.height/1.3, walker.width/3, walker.height/10);
      
      // Heavy weapons pods on sides
      state.ctx.fillStyle = "#3a4a5a";
      state.ctx.fillRect(-walker.width/2 - 6, -walker.height/5, 8, walker.height/3);
      state.ctx.fillRect(walker.width/2 - 2, -walker.height/5, 8, walker.height/3);

      // Animated legs (quadruped - 4 legs)
      const legOffset = Math.sin(walker.legPhase || 0) * 14;
      state.ctx.strokeStyle = "#5a6a7a";
      state.ctx.lineWidth = 5;
      state.ctx.lineCap = "round";
      
      // Front-left leg
      state.ctx.beginPath();
      state.ctx.moveTo(-walker.width/3, walker.height/5);
      state.ctx.lineTo(-walker.width/3 + legOffset, walker.height/2 + 14);
      state.ctx.stroke();
      
      // Front-right leg
      state.ctx.beginPath();
      state.ctx.moveTo(walker.width/3, walker.height/5);
      state.ctx.lineTo(walker.width/3 - legOffset, walker.height/2 + 14);
      state.ctx.stroke();
      
      // Rear-left leg
      state.ctx.beginPath();
      state.ctx.moveTo(-walker.width/3, walker.height/3);
      state.ctx.lineTo(-walker.width/3 - legOffset * 0.7, walker.height/2 + 14);
      state.ctx.stroke();
      
      // Rear-right leg
      state.ctx.beginPath();
      state.ctx.moveTo(walker.width/3, walker.height/3);
      state.ctx.lineTo(walker.width/3 + legOffset * 0.7, walker.height/2 + 14);
      state.ctx.stroke();
    }
    
    // Leg joints (4 legs)
    state.ctx.fillStyle = "#6a7a8a";
    state.ctx.fillRect(-walker.width/3 - 3, walker.height/5 - 3, 6, 6);
    state.ctx.fillRect(walker.width/3 - 3, walker.height/5 - 3, 6, 6);
    state.ctx.fillRect(-walker.width/3 - 3, walker.height/3 - 3, 6, 6);
    state.ctx.fillRect(walker.width/3 - 3, walker.height/3 - 3, 6, 6);
    
    // Foot pads (4 legs)
    const legOffset = Math.sin(walker.legPhase || 0) * 14;
    state.ctx.fillStyle = "#4a5a6a";
    state.ctx.fillRect(-walker.width/3 + legOffset - 5, walker.height/2 + 12, 10, 5);
    state.ctx.fillRect(walker.width/3 - legOffset - 5, walker.height/2 + 12, 10, 5);
    state.ctx.fillRect(-walker.width/3 - legOffset * 0.7 - 5, walker.height/2 + 12, 10, 5);
    state.ctx.fillRect(walker.width/3 + legOffset * 0.7 - 5, walker.height/2 + 12, 10, 5);

    state.ctx.restore();
  });
}

export function drawMechs() {
  const isSideView = state.wave >= 11;
  
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

    if (isSideView) {
      // 8-bit Army mech - side view Gundam-style
      const blockSize = mech.size / 12;
      
      // Legs (bipedal, side profile)
      const legPhase = mech.legPhase || 0;
      const legOffset = Math.sin(legPhase) * blockSize * 2;
      
      state.ctx.fillStyle = "#5a5a6a";
      // Front leg
      state.ctx.fillRect(-blockSize * 2, blockSize * 2 + legOffset, blockSize * 2.5, blockSize * 6);
      // Back leg  
      state.ctx.fillRect(blockSize, blockSize * 2 - legOffset, blockSize * 2.5, blockSize * 6);
      
      // Feet (8-bit blocks)
      state.ctx.fillStyle = "#4a4a5a";
      state.ctx.fillRect(-blockSize * 2.5, blockSize * 8 + legOffset, blockSize * 3.5, blockSize * 1.5);
      state.ctx.fillRect(blockSize * 0.5, blockSize * 8 - legOffset, blockSize * 3.5, blockSize * 1.5);
      
      // Torso (main body, blocky 8-bit)
      state.ctx.fillStyle = "#6a6a7a";
      state.ctx.fillRect(-blockSize * 3, -blockSize * 2, blockSize * 6, blockSize * 4);
      
      // Chest armor plate
      state.ctx.fillStyle = "#7a7a8a";
      state.ctx.fillRect(-blockSize * 2.5, -blockSize * 1.5, blockSize * 5, blockSize * 2);
      
      // Head/cockpit (small blocky head)
      state.ctx.fillStyle = "#5a6a7a";
      state.ctx.fillRect(-blockSize * 1.5, -blockSize * 4.5, blockSize * 3, blockSize * 2.5);
      
      // Sensor eye (glowing)
      const sensorPulse = 0.6 + Math.sin(state.frameCount * 0.1) * 0.4;
      state.ctx.fillStyle = `rgba(255, 80, 80, ${sensorPulse})`;
      state.ctx.fillRect(-blockSize * 0.5, -blockSize * 3.5, blockSize, blockSize * 0.8);
      
      // Arms (side view - one arm visible)
      state.ctx.fillStyle = "#5a5a6a";
      // Shoulder
      state.ctx.fillRect(-blockSize * 4, -blockSize, blockSize * 1.5, blockSize * 2);
      // Upper arm
      state.ctx.fillRect(-blockSize * 5, 0, blockSize * 1.5, blockSize * 4);
      // Forearm
      state.ctx.fillRect(-blockSize * 5.5, blockSize * 3.5, blockSize * 2, blockSize * 3);
      
      // Weapon in hand (8-bit gun)
      state.ctx.fillStyle = "#3a3a4a";
      state.ctx.fillRect(-blockSize * 7, blockSize * 5, blockSize * 4, blockSize * 1.5);
      
      // Back-mounted equipment (8-bit jetpack/thrusters)
      state.ctx.fillStyle = "#4a4a5a";
      state.ctx.fillRect(blockSize * 2.5, -blockSize, blockSize * 2, blockSize * 3);
      
      // Thruster glow
      const thrusterPulse = 0.5 + Math.sin(state.frameCount * 0.15) * 0.5;
      state.ctx.fillStyle = `rgba(100, 200, 255, ${thrusterPulse * 0.7})`;
      state.ctx.fillRect(blockSize * 2.5, blockSize * 2, blockSize * 2, blockSize);
    }
    
    // Draw shield if active (works for both side and top-down views)
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

    if (!isSideView) {
      // Raiden-style heavy ground mech/tank with 4 legs (top-down only)
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
    }

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
    
    // === BOSS HEALTH BAR (Enhanced) - Show for Wave 11 (Death Star Core) ===
    if (state.wave === 10) {
      const barWidth = 250;
      const barHeight = 18;
      const barX = d.x - barWidth/2;
      const barY = d.y - enhancedSize - 50;
      
      // Health bar background (dark with border)
      state.ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
      state.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
      
      // Health bar border (glowing, pulsing)
      const borderPulse = Math.sin(state.frameCount * 0.1) * 0.2 + 0.8;
      state.ctx.strokeStyle = d.vulnerable ? `rgba(255, 100, 100, ${borderPulse})` : `rgba(200, 100, 255, ${borderPulse})`;
      state.ctx.lineWidth = 3;
      state.ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
      
      // Health bar fill (gradient)
      const healthPercent = d.health / (d.maxHealth || 200);
      const healthBarGradient = state.ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
      if (healthPercent > 0.5) {
        healthBarGradient.addColorStop(0, "rgba(150, 100, 255, 0.9)");
        healthBarGradient.addColorStop(1, "rgba(100, 50, 200, 0.9)");
      } else if (healthPercent > 0.25) {
        healthBarGradient.addColorStop(0, "rgba(255, 150, 200, 0.9)");
        healthBarGradient.addColorStop(1, "rgba(200, 100, 150, 0.9)");
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
      
      // Energy indicators at health bar edges (pulsing)
      const indicatorPulse = Math.sin(state.frameCount * 0.15) * 0.5 + 0.5;
      state.ctx.fillStyle = `rgba(200, 100, 255, ${indicatorPulse})`;
      state.ctx.beginPath();
      state.ctx.arc(barX - 8, barY + barHeight/2, 4, 0, Math.PI * 2);
      state.ctx.fill();
      state.ctx.beginPath();
      state.ctx.arc(barX + barWidth + 8, barY + barHeight/2, 4, 0, Math.PI * 2);
      state.ctx.fill();
      
      // Boss title text
      state.ctx.font = "bold 16px Orbitron, monospace";
      state.ctx.textAlign = "center";
      state.ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      state.ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
      state.ctx.lineWidth = 4;
      state.ctx.strokeText("⬥ DEATH STAR CORE ⬥", d.x, barY - 10);
      state.ctx.fillText("⬥ DEATH STAR CORE ⬥", d.x, barY - 10);
    }

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
    
    // NEW: Molten Diamond Boss - special rendering overlay
    if (d.type === "molten-diamond") {
      // Add molten lava effects on top of standard diamond
      state.ctx.save();
      state.ctx.translate(d.x, d.y);
      
      // Molten lava glow effect
      const lavaGlow = Math.sin(state.frameCount * 0.12) * 0.4 + 0.6;
      const glowRadius = (d.size * 1.5) * 1.3;
      const lavaGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
      lavaGradient.addColorStop(0, `rgba(255, 150, 0, ${0.6 * lavaGlow})`);
      lavaGradient.addColorStop(0.5, `rgba(255, 80, 0, ${0.3 * lavaGlow})`);
      lavaGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      state.ctx.globalCompositeOperation = 'lighter';
      state.ctx.fillStyle = lavaGradient;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      state.ctx.fill();
      state.ctx.globalCompositeOperation = 'source-over';
      
      state.ctx.restore();
      
      // Boss health bar (molten variant)
      const barWidth = 300;
      const barHeight = 20;
      const barX = d.x - barWidth/2;
      const barY = d.y - (d.size * 1.5) - 60;
      
      // Background
      state.ctx.fillStyle = "rgba(20, 10, 0, 0.95)";
      state.ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
      
      // Border with lava glow
      state.ctx.strokeStyle = `rgba(255, 100, 0, ${lavaGlow})`;
      state.ctx.lineWidth = 3;
      state.ctx.strokeRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
      
      // Health fill
      const healthPercent = d.health / (d.maxHealth || 800);
      const phase = d.currentPhase || 1;
      const healthGrad = state.ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
      
      if (phase === 1) {
        healthGrad.addColorStop(0, "rgba(255, 150, 0, 0.95)");
        healthGrad.addColorStop(1, "rgba(200, 100, 0, 0.95)");
      } else if (phase === 2) {
        healthGrad.addColorStop(0, "rgba(255, 100, 0, 0.95)");
        healthGrad.addColorStop(1, "rgba(200, 50, 0, 0.95)");
      } else {
        healthGrad.addColorStop(0, "rgba(255, 50, 0, 0.95)");
        healthGrad.addColorStop(1, "rgba(150, 20, 0, 0.95)");
      }
      
      state.ctx.fillStyle = healthGrad;
      state.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
      
      // Phase markers
      for (let i = 1; i < 3; i++) {
        const phaseX = barX + (barWidth * i / 3);
        state.ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
        state.ctx.lineWidth = 2;
        state.ctx.beginPath();
        state.ctx.moveTo(phaseX, barY);
        state.ctx.lineTo(phaseX, barY + barHeight);
        state.ctx.stroke();
      }
      
      // Boss title
      state.ctx.font = "bold 18px Orbitron, monospace";
      state.ctx.textAlign = "center";
      state.ctx.fillStyle = "rgba(255, 200, 100, 0.98)";
      state.ctx.strokeStyle = "rgba(100, 20, 0, 0.95)";
      state.ctx.lineWidth = 5;
      state.ctx.strokeText("◆ MOLTEN DIAMOND ◆", d.x, barY - 12);
      state.ctx.fillText("◆ MOLTEN DIAMOND ◆", d.x, barY - 12);
      
      // Phase text
      state.ctx.font = "12px Orbitron, monospace";
      state.ctx.fillStyle = "rgba(255, 150, 50, 0.9)";
      state.ctx.fillText(`PHASE ${phase}/3`, d.x, barY + barHeight + 18);
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
