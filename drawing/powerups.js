import * as state from '../state.js';

export function drawPowerUps() {
  state.powerUps.forEach(p => {
    state.ctx.save();
    // reset potential weird state from previous draws
    state.ctx.globalAlpha = 1;
    state.ctx.filter = 'none';
    state.ctx.globalCompositeOperation = 'source-over';

    // center transform for easier drawing
    state.ctx.translate(p.x, p.y);

    const pulse = Math.sin(state.frameCount * 0.15 + (p._seed || 0)) * 0.15 + 0.85;
    const shadowStrength = 12 * pulse;
    state.ctx.shadowBlur = shadowStrength;
    
    // Magnetic pull glow effect
    if (p.magneticPull) {
      state.ctx.save();
      state.ctx.globalCompositeOperation = 'lighter';
      const pullAlpha = p.magneticPullAlpha || 0.5;
      const glowGradient = state.ctx.createRadialGradient(0, 0, 0, 0, 0, (p.size || 18));
      glowGradient.addColorStop(0, `rgba(255, 220, 100, ${pullAlpha * 0.8})`);
      glowGradient.addColorStop(0.5, `rgba(255, 200, 80, ${pullAlpha * 0.4})`);
      glowGradient.addColorStop(1, 'rgba(255, 180, 60, 0)');
      state.ctx.fillStyle = glowGradient;
      state.ctx.beginPath();
      state.ctx.arc(0, 0, (p.size || 18), 0, Math.PI * 2);
      state.ctx.fill();
      state.ctx.restore();
    }
    
    // type specific visuals
    if (p.type === "red-punch") {
      state.ctx.fillStyle = "rgba(220,40,40,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      // fist icon - simple rectangle + notch
      // shadowBlur removed for performance
      state.ctx.fillStyle = "white";
      state.ctx.fillRect(-4, -4, 8, 8);
      state.ctx.clearRect(-1, -6, 2, 2); // thumb notch (works with some canvases)
    }
    else if (p.type === "blue-cannon") {
      state.ctx.fillStyle = "rgba(0,180,220,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      // shadowBlur removed for performance
      state.ctx.fillStyle = "white";
      // small triangle cannon
      state.ctx.beginPath();
      state.ctx.moveTo(0, -6);
      state.ctx.lineTo(-6, 6);
      state.ctx.lineTo(6, 6);
      state.ctx.closePath();
      state.ctx.fill();
    }
    else if (p.type === "health") {
      state.ctx.fillStyle = "rgba(220,50,150,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      // shadowBlur removed for performance
      state.ctx.fillStyle = "white";
      // plus sign
      state.ctx.fillRect(-2, -6, 4, 12);
      state.ctx.fillRect(-6, -2, 12, 4);
    }
    else if (p.type === "reflect") {
      state.ctx.fillStyle = "rgba(140,80,220,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      // shadowBlur removed for performance
      state.ctx.strokeStyle = "cyan";
      state.ctx.lineWidth = 2;
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2 + 4, 0, Math.PI*2); 
      state.ctx.stroke();

      // small reflect icon
      state.ctx.fillStyle = "rgba(220,240,255,0.95)";
      state.ctx.fillRect(-2, -6, 4, 12);
    }
    else if (p.type === "homing-missile") {
      state.ctx.fillStyle = "rgba(255,120,40,0.95)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      // shadowBlur removed for performance
      state.ctx.fillStyle = "white";
      // Missile shape icon
      state.ctx.beginPath();
      state.ctx.moveTo(6, 0);
      state.ctx.lineTo(-4, 3);
      state.ctx.lineTo(-4, -3);
      state.ctx.closePath();
      state.ctx.fill();
      
      // Fins
      state.ctx.fillStyle = "rgba(100,200,255,0.9)";
      state.ctx.fillRect(-4, -2, 2, 4);
    }
    else {
      // fallback visible placeholder when unknown type
      state.ctx.fillStyle = "rgba(255,255,255,0.12)";
      state.ctx.beginPath(); 
      state.ctx.arc(0, 0, (p.size||18)/2, 0, Math.PI*2); 
      state.ctx.fill();

      // shadowBlur removed for performance
      state.ctx.fillStyle = "rgba(255,255,255,0.9)";
      state.ctx.font = "10px 'Orbitron', monospace";
      state.ctx.textAlign = "center";
      state.ctx.textBaseline = "middle";
      state.ctx.fillText("?", 0, 0);
    }

    // small floating label (count) if applicable
    if (typeof p.count === 'number' && p.count > 1) {
      // shadowBlur removed for performance
      state.ctx.fillStyle = "rgba(20,20,30,0.9)";
      state.ctx.fillRect(8, -10, 16, 12);
      // shadowBlur removed for performance
      state.ctx.fillStyle = "white";
      state.ctx.font = "10px 'Orbitron', monospace";
      state.ctx.fillText(String(p.count), 16, -4);
    }

    // restore to avoid leaking visual state
    // shadowBlur removed for performance
    state.ctx.globalAlpha = 1;
    state.ctx.restore();
  });
}
