import * as THREE from 'three';

/**
 * NatureTextureGenerator
 * High-vibrancy stylized PBR texture generation matching the
 * animated feature film art direction (Pixar/Disney / Kena: Bridge of Spirits style).
 */
export class NatureTextureGenerator {
  /** Layered forest-floor albedo: moss, needles, soil and fallen leaves. */
  public static createForestFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 768;
    const ctx = canvas.getContext('2d')!;
    const base = ctx.createLinearGradient(0, 0, 768, 768);
    base.addColorStop(0, '#315737'); base.addColorStop(.48, '#426a38'); base.addColorStop(1, '#253f2d'); ctx.fillStyle = base; ctx.fillRect(0,0,768,768);
    for(let i=0;i<1300;i++){ const x=Math.random()*768,y=Math.random()*768,r=1+Math.random()*5; ctx.globalAlpha=.12+Math.random()*.28; ctx.fillStyle=Math.random()>.48?'#7d8d3d':'#172d20'; ctx.beginPath();ctx.ellipse(x,y,r,r*.45,Math.random()*Math.PI,0,Math.PI*2);ctx.fill(); }
    for(let i=0;i<260;i++){ const x=Math.random()*768,y=Math.random()*768;ctx.globalAlpha=.28;ctx.strokeStyle=Math.random()>.5?'#a27642':'#6d472b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+5+Math.random()*12,y-3+Math.random()*8);ctx.stroke(); }
    ctx.globalAlpha=1; const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,19);t.colorSpace=THREE.SRGBColorSpace;return t;
  }

  public static createForestFloorNormalMap(): THREE.CanvasTexture {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#8080ff';ctx.fillRect(0,0,512,512);
    for(let i=0;i<2400;i++){const x=Math.random()*512,y=Math.random()*512;ctx.fillStyle=`rgba(${110+Math.random()*35},${110+Math.random()*35},255,.35)`;ctx.fillRect(x,y,1+Math.random()*3,1+Math.random()*3);}
    const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,19);return t;
  }
  // ─── 1. SUNLIT FOREST TRAIL PBR ──────────────────────────────

  public static createDirtTrailTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Warm sunlit golden-brown packed earth gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    bgGrad.addColorStop(0, '#8A6844');
    bgGrad.addColorStop(0.5, '#765535');
    bgGrad.addColorStop(1, '#5C4026');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Dappled soil noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.7));
    }
    ctx.putImageData(imgData, 0, 0);

    // Warm rounded pebble scatter
    for (let p = 0; p < 280; p++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      const r = 3 + Math.random() * 8;
      const stoneGrad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
      const isWarm = Math.random() > 0.35;
      stoneGrad.addColorStop(0, isWarm ? '#D4A373' : '#9CA3AF');
      stoneGrad.addColorStop(0.8, isWarm ? '#A97142' : '#6B7280');
      stoneGrad.addColorStop(1, isWarm ? '#6F4518' : '#374151');

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, r, r * (0.65 + Math.random() * 0.35), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm pine needles & twigs
    ctx.lineWidth = 2.0;
    for (let i = 0; i < 300; i++) {
      ctx.strokeStyle = Math.random() > 0.5 ? '#A05A2C' : '#6E3816';
      ctx.globalAlpha = 0.5 + Math.random() * 0.35;
      ctx.beginPath();
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const angle = Math.random() * Math.PI * 2;
      const len = 10 + Math.random() * 18;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }

    // Lush green moss fringe spots
    ctx.fillStyle = '#65A30D';
    for (let m = 0; m < 25; m++) {
      ctx.globalAlpha = 0.15 + Math.random() * 0.15;
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 1024, 30 + Math.random() * 50, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 16);
    return texture;
  }

  public static createDirtTrailNormalMap(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgb(128, 128, 255)';
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const nx = (Math.random() - 0.5) * 30;
      const ny = (Math.random() - 0.5) * 30;
      data[i] = Math.min(255, Math.max(0, 128 + nx));
      data[i + 1] = Math.min(255, Math.max(0, 128 + ny));
      data[i + 2] = 245;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 16);
    return texture;
  }

  // ─── 2. WEATHERED CEDAR SLATS & HEMP ROPE ─────────────────────

  public static createWeatheredPlankTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm honey-cedar wood
    ctx.fillStyle = '#9C6644';
    ctx.fillRect(0, 0, 1024, 512);

    // Warm wood grain striations
    for (let y = 0; y < 512; y += 4) {
      const isDark = Math.random() > 0.45;
      ctx.strokeStyle = isDark ? 'rgba(78, 42, 22, 0.4)' : 'rgba(184, 137, 98, 0.3)';
      ctx.lineWidth = 1.5 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 64) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 3);
      }
      ctx.stroke();
    }

    // Wood knot rings
    for (let k = 0; k < 5; k++) {
      const kx = 120 + Math.random() * 780;
      const ky = 60 + Math.random() * 390;
      const knotR = 15 + Math.random() * 18;

      for (let r = knotR; r > 3; r -= 3) {
        ctx.strokeStyle = 'rgba(60, 32, 16, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(kx, ky, r, r * 0.65, Math.random() * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Rope notch indentations on edges
    ctx.fillStyle = '#5A3319';
    ctx.fillRect(0, 0, 40, 512);
    ctx.fillRect(984, 0, 40, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // ─── 3. REDWOOD LOG & TREE BARK ───────────────────────────────

  public static createTreeBarkTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Deep, irregular redwood bark. Avoid bright regular bands that read as a painted prop.
    ctx.fillStyle = '#4C2A1B';
    ctx.fillRect(0, 0, 512, 512);

    for (let x = -12; x < 524; x += 5 + Math.random() * 8) {
      ctx.strokeStyle = Math.random() > .56 ? '#2C170F' : '#75422A';
      ctx.globalAlpha = .42 + Math.random() * .34;
      ctx.lineWidth = 1.5 + Math.random() * 3.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y=0;y<=512;y+=28) ctx.lineTo(x + Math.sin(y*.035 + x)*5 + (Math.random()-.5)*4, y);
      ctx.stroke();
    }

    // Low-contrast moss only at the damp base; it should never become a polka-dot pattern.
    ctx.fillStyle = 'rgba(61, 92, 42, 0.16)';
    for (let m = 0; m < 8; m++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, 350 + Math.random() * 160, 14 + Math.random() * 28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }

  // ─── 4. SMOOTH RIVER STONE / COBBLESTONE ──────────────────────

  public static createRiverStoneTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(256, 200, 30, 256, 256, 260);
    grad.addColorStop(0, '#9CA3AF'); // smooth top highlight
    grad.addColorStop(0.6, '#6B7280');
    grad.addColorStop(0.9, '#4B5563');
    grad.addColorStop(1, '#374151'); // dark wet base
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Warm moss accent on stone sides
    ctx.fillStyle = 'rgba(101, 163, 13, 0.35)';
    ctx.beginPath();
    ctx.arc(200, 320, 140, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // ─── 5. HEMP ROPE TEXTURE ─────────────────────────────────────

  public static createRopeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#CA8A04'; // golden straw hemp
    ctx.fillRect(0, 0, 256, 256);

    // Diagonal braided twisted strands
    ctx.strokeStyle = '#854D0E';
    ctx.lineWidth = 6;
    for (let x = -256; x < 512; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 256, 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 8);
    return texture;
  }

  // ─── 6. WATER NORMAL RIPPLE MAP ───────────────────────────────

  public static createWaterNormalMap(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgb(128, 128, 255)';
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;

        const wave1 = Math.sin(x * 0.09 + y * 0.05) * 30;
        const wave2 = Math.cos(x * 0.05 - y * 0.1) * 24;
        const wave3 = Math.sin((x + y) * 0.16) * 16;
        const totalNx = wave1 + wave2 + wave3;

        const waveY1 = Math.cos(y * 0.08 + x * 0.06) * 28;
        const waveY2 = Math.sin(y * 0.14 - x * 0.04) * 20;
        const totalNy = waveY1 + waveY2;

        data[idx] = Math.min(255, Math.max(0, 128 + totalNx));
        data[idx + 1] = Math.min(255, Math.max(0, 128 + totalNy));
        data[idx + 2] = 235;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  // ─── 7. GRANITE CLIFF TEXTURE ────────────────────────────────

  public static createGraniteCliffTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#52525B';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 24) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(39, 39, 42, 0.45)' : 'rgba(113, 113, 122, 0.35)';
      ctx.fillRect(0, y, 512, 12 + Math.random() * 16);
    }

    // Lichen moss
    ctx.fillStyle = 'rgba(101, 163, 13, 0.25)';
    for (let l = 0; l < 20; l++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 15 + Math.random() * 30, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  // ─── 8. SUBMERGED RIVERBED TEXTURE ───────────────────────────

  public static createRiverBedTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Wet riverbed sand and silt base
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#2C3E38');
    grad.addColorStop(0.5, '#354E44');
    grad.addColorStop(1, '#23332B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Hundreds of submerged rounded river stones and pebbles
    for (let i = 0; i < 450; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      const r = 6 + Math.random() * 18;
      const stoneGrad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
      const isWarm = Math.random() > 0.4;
      stoneGrad.addColorStop(0, isWarm ? '#A89F91' : '#64748B');
      stoneGrad.addColorStop(0.7, isWarm ? '#786F62' : '#475569');
      stoneGrad.addColorStop(1, isWarm ? '#3E372E' : '#1E293B');

      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, r, r * (0.6 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Aquatic green moss patches on stones
    ctx.fillStyle = 'rgba(74, 124, 89, 0.4)';
    for (let m = 0; m < 40; m++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 1024, 20 + Math.random() * 45, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 3);
    return texture;
  }

  // ─── 9. FERN & FOREST FOLIAGE TEXTURE ─────────────────────────

  public static createFernLeafTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, 256, 512);

    // Central stem
    ctx.strokeStyle = '#4D7C0F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(128, 500);
    ctx.quadraticCurveTo(132, 250, 128, 20);
    ctx.stroke();

    // Symmetrical pinnate fern leaflets
    for (let y = 60; y < 480; y += 22) {
      const t = 1.0 - y / 500;
      const leafLen = 30 + t * 85;

      // Left leaflet
      ctx.fillStyle = '#65A30D';
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.quadraticCurveTo(128 - leafLen * 0.6, y - 18, 128 - leafLen, y - 8);
      ctx.quadraticCurveTo(128 - leafLen * 0.5, y + 8, 128, y + 6);
      ctx.fill();

      // Right leaflet
      ctx.fillStyle = '#84CC16';
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.quadraticCurveTo(128 + leafLen * 0.6, y - 18, 128 + leafLen, y - 8);
      ctx.quadraticCurveTo(128 + leafLen * 0.5, y + 8, 128, y + 6);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}

