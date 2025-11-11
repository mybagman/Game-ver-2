import * as state from '../state.js';

export function drawEnemies() {
  state.enemies.forEach(e => {
    if (!e) return;

    if (e.type === "red-square") { 
      state.ctx.shadowBlur = 15;
      state.ctx.shadowColor = "red";
      state.ctx.fillStyle = "red"; 
      state.ctx.fillRect(e.x-e.size/2, e.y-e.size/2, e.size, e.size);
      state.ctx.shadowBlur = 0;

      const pulse = Math.sin(state.frameCount * 0.1) * 0.3 + 0.7;
      state.ctx.strokeStyle = `rgba(255,100,100,${pulse})`;
      state.ctx.lineWidth = 2;
      state.ctx.strokeRect(e.x-e.size/2, e.y-e.size/2, e.size, e.size);

      try {
        const eyeTriggerDist = 140;
        const dxP = state.player.x - e.x, dyP = state.player.y - e.y, dP = Math.hypot(dxP, dyP);
        const dxG = state.goldStar.x - e.x, dyG = state.goldStar.y - e.y, dG = Math.hypot(dxG, dyG);
        let target = null, td = Infinity;
        if (dP < eyeTriggerDist) { target = {x: state.player.x, y: state.player.y}; td = dP; }
        if (dG < eyeTriggerDist && dG < td) { target = {x: state.goldStar.x, y: state.goldStar.y}; td = dG; }
        if (target) {
          const insideRadius = Math.min(6, e.size/4);
          const dirX = target.x - e.x, dirY = target.y - e.y;
          const mag = Math.hypot(dirX, dirY) || 1;
          const eyeOffset = Math.min(insideRadius, Math.max(2, insideRadius * 0.8));
          const eyeX = e.x + (dirX / mag) * eyeOffset;
          const eyeY = e.y + (dirY / mag) * eyeOffset;
          state.ctx.beginPath();
          state.ctx.fillStyle = "rgba(160,200,255,0.95)";
          state.ctx.arc(eyeX, eyeY, 5, 0, Math.PI*2);
          state.ctx.fill();
        }
      } catch (err) {}
    }
    else if (e.type === "triangle") { 
      // 8-bit TIE Fighter design
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      
      state.ctx.shadowBlur = 15;
      state.ctx.shadowColor = "cyan";
      
      const wingWidth = e.size / 2;
      const wingHeight = e.size * 0.8;
      const cockpitSize = e.size / 3;
      const pulse = Math.sin(state.frameCount * 0.08 + e.x) * 0.4 + 0.6;
      
      // Left solar panel wing
      state.ctx.fillStyle = "#333";
      state.ctx.fillRect(-wingWidth - cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      
      // Left wing grid lines
      state.ctx.strokeStyle = "#555";
      state.ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        state.ctx.beginPath();
        state.ctx.moveTo(-wingWidth - cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
        state.ctx.lineTo(-cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
        state.ctx.stroke();
      }
      
      // Right solar panel wing
      state.ctx.fillStyle = "#333";
      state.ctx.fillRect(cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      
      // Right wing grid lines
      state.ctx.strokeStyle = "#555";
      state.ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        state.ctx.beginPath();
        state.ctx.moveTo(cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
        state.ctx.lineTo(wingWidth + cockpitSize/2, -wingHeight/2 + (wingHeight * i / 3));
        state.ctx.stroke();
      }
      
      // Central cockpit pod (hexagonal)
      state.ctx.fillStyle = "#555";
      state.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const px = Math.cos(angle) * cockpitSize/2;
        const py = Math.sin(angle) * cockpitSize/2;
        if (i === 0) state.ctx.moveTo(px, py);
        else state.ctx.lineTo(px, py);
      }
      state.ctx.closePath();
      state.ctx.fill();
      
      // Cockpit window (cyan glow)
      state.ctx.fillStyle = `rgba(0,255,255,${pulse})`;
      state.ctx.fillRect(-cockpitSize/4, -cockpitSize/8, cockpitSize/2, cockpitSize/4);
      
      // Engine glow at back
      state.ctx.fillStyle = `rgba(100,200,255,${pulse * 0.8})`;
      state.ctx.beginPath();
      state.ctx.arc(0, cockpitSize/3, cockpitSize/6, 0, Math.PI * 2);
      state.ctx.fill();
      
      state.ctx.shadowBlur = 0;
      
      // Outline glow
      state.ctx.strokeStyle = `rgba(100,255,255,${pulse})`;
      state.ctx.lineWidth = 2;
      
      // Left wing outline
      state.ctx.strokeRect(-wingWidth - cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      
      // Right wing outline
      state.ctx.strokeRect(cockpitSize/2, -wingHeight/2, wingWidth, wingHeight);
      
      // Cockpit outline
      state.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const px = Math.cos(angle) * cockpitSize/2;
        const py = Math.sin(angle) * cockpitSize/2;
        if (i === 0) state.ctx.moveTo(px, py);
        else state.ctx.lineTo(px, py);
      }
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
      state.ctx.shadowBlur = 30;
      state.ctx.shadowColor = "yellow";
      state.ctx.fillStyle = "yellow"; 
      state.ctx.beginPath(); 
      state.ctx.arc(e.x, e.y, pulse, 0, Math.PI*2); 
      state.ctx.fill();
      state.ctx.shadowBlur = 0;

      state.ctx.strokeStyle = "rgba(255,255,0,0.5)";
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      state.ctx.arc(e.x, e.y, pulse + 10, 0, Math.PI*2);
      state.ctx.stroke();
    }
    else if (e.type === "mini-boss") { 
      const pulse = Math.sin(state.frameCount * 0.07) * 5 + e.size/2;
      state.ctx.shadowBlur = 25;
      state.ctx.shadowColor = "orange";
      state.ctx.fillStyle = "orange"; 
      state.ctx.beginPath(); 
      state.ctx.arc(e.x, e.y, pulse, 0, Math.PI * 2); 
      state.ctx.fill();
      state.ctx.shadowBlur = 0;
    }
    else if (e.type === "reflector") {
      state.ctx.save();
      state.ctx.translate(e.x, e.y);
      state.ctx.rotate(e.angle||0);

      if (e.shieldActive) {
        state.ctx.shadowBlur = 20;
        state.ctx.shadowColor = "purple";
      }
      state.ctx.fillStyle = e.shieldActive ? "rgba(138,43,226,0.8)" : "purple";
      state.ctx.fillRect(-e.width/2, -e.height/2, e.width, e.height);
      state.ctx.shadowBlur = 0;

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
      state.ctx.shadowBlur = 50;
      state.ctx.shadowColor = "rgba(0,200,255,0.8)";
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
      state.ctx.shadowBlur = 0;
      state.ctx.restore();

      e.cores.forEach(core => {
        state.ctx.save();
        state.ctx.shadowBlur = 20;
        state.ctx.shadowColor = "cyan";
        state.ctx.fillStyle = "cyan";
        state.ctx.beginPath();
        state.ctx.arc(core.x, core.y, 20, 0, Math.PI * 2);
        state.ctx.fill();
        state.ctx.shadowBlur = 0;
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
      
      // Cockpit windows (glowing cyan)
      state.ctx.fillStyle = '#00ccff';
      state.ctx.shadowBlur = 8;
      state.ctx.shadowColor = '#00ccff';
      state.ctx.fillRect(-size/6, -size/2, size/3, size/8);
      state.ctx.shadowBlur = 0;
      
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
      
      state.ctx.shadowBlur = 15;
      state.ctx.shadowColor = `rgba(100, 200, 255, ${engineFlicker})`;
      state.ctx.fillStyle = `rgba(100, 200, 255, ${engineFlicker * enginePulse})`;
      state.ctx.beginPath();
      state.ctx.moveTo(-size/4, size/4 + size/6);
      state.ctx.lineTo(-size/5, size/4 + size/4);
      state.ctx.lineTo(size/5, size/4 + size/4);
      state.ctx.lineTo(size/4, size/4 + size/6);
      state.ctx.closePath();
      state.ctx.fill();
      state.ctx.shadowBlur = 0;
      
      // Deployment bay door (opening during deploy)
      if (mech.deploying) {
        const doorOpen = Math.min(1, (mech.deployProgress || 0) / 60);
        
        state.ctx.fillStyle = '#555';
        state.ctx.fillRect(-size/4, size/6, (size/4) * (1 - doorOpen), size/8);
        state.ctx.fillRect(0 + (size/4) * doorOpen, size/6, (size/4) * (1 - doorOpen), size/8);
        
        if (doorOpen > 0.3) {
          state.ctx.shadowBlur = 10;
          state.ctx.shadowColor = 'rgba(255, 50, 50, 0.8)';
          state.ctx.fillStyle = `rgba(255, 100, 100, ${doorOpen})`;
          state.ctx.beginPath();
          state.ctx.arc(0, size/5, 3, 0, Math.PI * 2);
          state.ctx.fill();
          state.ctx.shadowBlur = 0;
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

    state.ctx.fillStyle = "rgba(150,50,50,0.9)";
    state.ctx.beginPath();
    state.ctx.arc(0, 0, mech.size/2, 0, Math.PI * 2);
    state.ctx.fill();

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + state.frameCount * 0.02;
      state.ctx.fillStyle = "rgba(200,100,100,0.9)";
      state.ctx.fillRect(Math.cos(angle) * 30 - 3, Math.sin(angle) * 30 - 3, 6, 6);
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
    state.ctx.shadowBlur = 20;
    state.ctx.shadowColor = `rgba(255, 150, 255, ${bossAuraPulse})`;
    state.ctx.beginPath();
    state.ctx.arc(0, 0, bossAuraSize * 0.7, 0, Math.PI * 2);
    state.ctx.stroke();
    state.ctx.shadowBlur = 0;
    
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
      state.ctx.shadowBlur = 25;
      state.ctx.shadowColor = `rgba(100,200,255,${pullIntensity})`;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, d.size/2 + 80 + Math.sin(state.frameCount * 0.1) * 25, 0, Math.PI * 2);
      state.ctx.stroke();
      state.ctx.shadowBlur = 0;

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
        
        // Add glow effect to particles
        state.ctx.shadowBlur = 10 + chargeProgress * 20;
        state.ctx.shadowColor = "rgba(255, 255, 100, 0.8)";
        state.ctx.beginPath();
        state.ctx.arc(px, py, particleSize * 0.5, 0, Math.PI * 2);
        state.ctx.fill();
        state.ctx.shadowBlur = 0;
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

    if (d.vulnerable) {
      const vulnPulse = Math.sin(state.frameCount * 0.2) * 0.3 + 0.7;
      state.ctx.shadowBlur = 50;
      state.ctx.shadowColor = `rgba(255,100,100,${vulnPulse})`;
    }

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
    
    // Main boss body with enhanced glow
    state.ctx.shadowBlur = d.vulnerable ? 50 : 40;
    state.ctx.shadowColor = d.canReflect ? "cyan" : (d.vulnerable ? "red" : "white");
    
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
    
    state.ctx.shadowBlur = 0;
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
    
    // Cockpit windows (glowing cyan)
    ctx.fillStyle = '#00ccff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ccff';
    ctx.fillRect(-size/6, -size/2, size/3, size/8);
    ctx.shadowBlur = 0;
    
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
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(100, 200, 255, ${engineFlicker})`;
    ctx.fillStyle = `rgba(100, 200, 255, ${engineFlicker * enginePulse})`;
    ctx.beginPath();
    ctx.moveTo(-size/4, size/4 + size/6);
    ctx.lineTo(-size/5, size/4 + size/4);
    ctx.lineTo(size/5, size/4 + size/4);
    ctx.lineTo(size/4, size/4 + size/6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
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
  
  // Cockpit windows (glowing cyan)
  ctx.fillStyle = '#00ccff';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#00ccff';
  ctx.fillRect(-size/6, -size/2, size/3, size/8);
  ctx.shadowBlur = 0;
  
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
  
  // Engine glow (blue thrust)
  ctx.shadowBlur = 15;
  ctx.shadowColor = `rgba(100, 200, 255, ${engineFlicker})`;
  ctx.fillStyle = `rgba(100, 200, 255, ${engineFlicker * enginePulse})`;
  ctx.beginPath();
  ctx.moveTo(-size/4, size/4 + size/6);
  ctx.lineTo(-size/5, size/4 + size/4);
  ctx.lineTo(size/5, size/4 + size/4);
  ctx.lineTo(size/4, size/4 + size/6);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  
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
    
    // Deployment light
    if (doorOpen > 0.3) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 50, 50, 0.8)';
      ctx.fillStyle = `rgba(255, 100, 100, ${doorOpen})`;
      ctx.beginPath();
      ctx.arc(0, size/5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
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
