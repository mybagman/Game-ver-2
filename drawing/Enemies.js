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
      state.ctx.shadowBlur = 15;
      state.ctx.shadowColor = "cyan";
      state.ctx.fillStyle = "cyan"; 
      state.ctx.beginPath(); 
      state.ctx.moveTo(e.x, e.y-e.size/2); 
      state.ctx.lineTo(e.x-e.size/2, e.y+e.size/2); 
      state.ctx.lineTo(e.x+e.size/2, e.y+e.size/2); 
      state.ctx.closePath(); 
      state.ctx.fill();
      state.ctx.shadowBlur = 0;

      const pulse = Math.sin(state.frameCount * 0.08 + e.x) * 0.4 + 0.6;
      state.ctx.strokeStyle = `rgba(100,255,255,${pulse})`;
      state.ctx.lineWidth = 2;
      state.ctx.beginPath(); 
      state.ctx.moveTo(e.x, e.y-e.size/2); 
      state.ctx.lineTo(e.x-e.size/2, e.y+e.size/2); 
      state.ctx.lineTo(e.x+e.size/2, e.y+e.size/2); 
      state.ctx.closePath(); 
      state.ctx.stroke();

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
    // Draw dropship if visible
    if (mech.dropshipVisible) {
      state.ctx.save();
      state.ctx.translate(mech.x, mech.y - mech.size);
      
      // Dropship body
      state.ctx.fillStyle = '#333';
      state.ctx.fillRect(-mech.size/1.5, -mech.size/2, mech.size*1.3, mech.size/1.5);
      
      // Dropship cockpit
      state.ctx.fillStyle = '#555';
      state.ctx.fillRect(-mech.size/2.5, -mech.size/1.8, mech.size/1.2, mech.size/2.5);
      
      // Cockpit windows
      state.ctx.fillStyle = '#00aaff';
      state.ctx.fillRect(-mech.size/3.5, -mech.size/2, mech.size/1.8, mech.size/4);
      
      // Engine glow
      const flicker = 0.4 + Math.random() * 0.4;
      state.ctx.fillStyle = `rgba(255,120,0,${flicker})`;
      state.ctx.beginPath();
      state.ctx.arc(0, mech.size/2, mech.size/3, 0, Math.PI);
      state.ctx.fill();
      
      // Deployment bay door (opening during deploy)
      if (mech.deploying) {
        const doorOpen = Math.min(1, (mech.deployProgress || 0) / 60);
        state.ctx.fillStyle = '#666';
        state.ctx.fillRect(-mech.size/4, mech.size/3, mech.size/2 * (1 - doorOpen), mech.size/6);
      }
      
      state.ctx.restore();
    }
    
    state.ctx.save();
    state.ctx.translate(mech.x, mech.y);

    if (mech.shieldActive) {
      const pulse = Math.sin(state.frameCount * 0.1) * 5;
      state.ctx.strokeStyle = "rgba(100,200,255,0.6)";
      state.ctx.lineWidth = 3;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, mech.size/2 + 15 + pulse, 0, Math.PI * 2);
      state.ctx.stroke();
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

    if (d.gravitonActive && d.gravitonCharge < 600) {
      const pullIntensity = d.gravitonCharge / 600;
      state.ctx.strokeStyle = `rgba(100,200,255,${pullIntensity * 0.5})`;
      state.ctx.lineWidth = 4;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, d.size/2 + 60 + Math.sin(state.frameCount * 0.1) * 20, 0, Math.PI * 2);
      state.ctx.stroke();

      state.ctx.strokeStyle = `rgba(150,220,255,${pullIntensity * 0.3})`;
      state.ctx.lineWidth = 2;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, d.size/2 + 30, 0, Math.PI * 2);
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
      state.ctx.shadowBlur = 40;
      state.ctx.shadowColor = `rgba(255,100,100,${vulnPulse})`;
    }

    const glowIntensity = Math.sin(state.frameCount * 0.05) * 0.3 + 0.7;
    state.ctx.shadowBlur = d.vulnerable ? 40 : 30;
    state.ctx.shadowColor = d.canReflect ? "cyan" : (d.vulnerable ? "red" : "white");
    state.ctx.strokeStyle = d.canReflect ? `rgba(0,255,255,${glowIntensity})` : (d.vulnerable ? `rgba(255,100,100,${glowIntensity})` : `rgba(255,255,255,${glowIntensity})`);
    state.ctx.lineWidth = 3;
    state.ctx.beginPath(); 
    state.ctx.moveTo(0, -d.size/2 - d.pulse); 
    state.ctx.lineTo(d.size/2 + d.pulse, 0); 
    state.ctx.lineTo(0, d.size/2 + d.pulse); 
    state.ctx.lineTo(-d.size/2 - d.pulse, 0); 
    state.ctx.closePath(); 
    state.ctx.stroke();
    state.ctx.shadowBlur = 0;
    state.ctx.restore();

    d.attachments.forEach(a => {
      if (a.type === "triangle") {
        state.ctx.fillStyle = "cyan";
        state.ctx.beginPath(); 
        state.ctx.moveTo(a.x, a.y-(a.size||20)/2); 
        state.ctx.lineTo(a.x-(a.size||20)/2, a.y+(a.size||20)/2); 
        state.ctx.lineTo(a.x+(a.size||20)/2, a.y+(a.size||20)/2); 
        state.ctx.closePath(); 
        state.ctx.fill();
      }
      else if (a.type === "reflector") {
        state.ctx.save(); 
        state.ctx.translate(a.x, a.y); 
        state.ctx.rotate(a.orbitAngle||0); 
        state.ctx.fillStyle = "magenta"; 
        state.ctx.fillRect(-(a.width||20)/2, -(a.height||10)/2, a.width||20, a.height||10); 
        state.ctx.restore();
      }
      else {
        state.ctx.fillStyle = "lime"; 
        state.ctx.fillRect(a.x-(a.size||20)/2, a.y-(a.size||20)/2, a.size||20, a.size||20);
      }
    });
  });
}

export function drawDropship(mech) {
  const ctx = state.ctx;
  const size = (mech && mech.size) || 40;
  const x = (mech && mech.x) || state.canvas.width / 2;
  const y = (mech && mech.y) || state.canvas.height / 2;

  ctx.fillStyle = '#222';
  ctx.fillRect(x - size/2, y - size/3, size, size/2);

  ctx.fillStyle = '#555';
  ctx.fillRect(x - size/3, y - size/2, size/1.5, size/3);

  ctx.fillStyle = '#00aaff';
  ctx.fillRect(x - size/4, y - size/2.2, size/2, size/5);

  ctx.fillStyle = `rgba(255,120,0,${0.3 + Math.random() * 0.5})`;
  ctx.beginPath();
  ctx.arc(x, y + size/2, size/4, 0, Math.PI);
  ctx.fill();

  if (mech && mech.deploying) {
    ctx.fillStyle = '#888';
    ctx.fillRect(x - 10, y + size/2, 20, 10);
  }
}
