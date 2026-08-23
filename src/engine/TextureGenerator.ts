import * as THREE from 'three';
import { ONLINE_MASTERPIECES } from '../data/artworks';

export class TextureGenerator {
  // ─── ONLINE ARTWORK TEXTURE LOADER ───────────────────────────

  /**
   * Loads an online fine art image into a CanvasTexture with immediate canvas painting fallback,
   * updating dynamically as soon as the image downloads.
   */
  public static createMasterpieceTexture(artIndex: number): THREE.CanvasTexture {
    const art = ONLINE_MASTERPIECES[artIndex % ONLINE_MASTERPIECES.length];
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    // 1. Render immediate rich oil-canvas fallback while image downloads
    this.drawArtworkFallback(ctx, art, 1024, 768);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    // 2. Asynchronously load high-res real fine art image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, 1024, 768);
      // Cover fit image
      const hRatio = 1024 / img.width;
      const vRatio = 768 / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (1024 - img.width * ratio) / 2;
      const centerShiftY = (768 - img.height * ratio) / 2;

      ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);

      // Subtle fine art canvas grain overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, 1024, 768);

      texture.needsUpdate = true;
    };
    img.src = art.imageUrl;

    return texture;
  }

  /** Paints an oil canvas fallback */
  private static drawArtworkFallback(ctx: CanvasRenderingContext2D, art: typeof ONLINE_MASTERPIECES[0], w: number, h: number) {
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#1E2530');
    bgGrad.addColorStop(0.5, '#2D3748');
    bgGrad.addColorStop(1, '#1A202C');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Warm painterly strokes
    ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 80 + Math.random() * 120, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title & Artist on placeholder
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(art.title, w / 2, h / 2 - 30);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '22px Inter, sans-serif';
    ctx.fillText(`${art.artist} • ${art.year}`, w / 2, h / 2 + 20);

    ctx.fillStyle = '#A0AEC0';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(art.location, w / 2, h / 2 + 60);

    ctx.textAlign = 'left';
  }

  // ─── FLOOR TEXTURES ──────────────────────────────────────────

  /** Dark polished marble with brass grid inlays */
  public static createMarbleFloorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#12151C';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      let x = Math.random() * 1024;
      let y = Math.random() * 1024;
      ctx.moveTo(x, y);
      for (let j = 0; j < 6; j++) {
        x += (Math.random() - 0.5) * 160;
        y += (Math.random() - 0.5) * 160;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    const tileSize = 256;
    for (let x = 0; x <= 1024; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    ctx.fillStyle = '#D4AF37';
    for (let x = 0; x <= 1024; x += tileSize) {
      for (let y = 0; y <= 1024; y += tileSize) {
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }

  /** Lighter marble runner strip for corridor centers */
  public static createFloorRunnerTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1E2230';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.04)';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 472, 472);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - 0.5) * 120;
        y += (Math.random() - 0.5) * 120;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }

  /** Colored floor border accent for gallery rooms */
  public static createFloorAccentTexture(color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#14171F';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(0, 0, 256, 256);
    ctx.globalAlpha = 1.0;

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 240, 240);
    ctx.globalAlpha = 1.0;

    return new THREE.CanvasTexture(canvas);
  }

  // ─── WALL TEXTURES ──────────────────────────────────────────

  /** Gallery wall — dark fluted architectural panels */
  public static createWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1C2029';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#212634';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, 0, 16, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  }

  /** Gallery wall — smooth warm matte texture */
  public static createGalleryWallTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#222630';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 2);
    return texture;
  }

  // ─── CEILING TEXTURE ────────────────────────────────────────

  /** Ceiling panels with recessed light trough channels */
  public static createCeilingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#181C26';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    const panelSize = 128;
    for (let x = 0; x <= 512; x += panelSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += panelSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }

    for (let px = 0; px < 512; px += panelSize) {
      for (let py = 0; py < 512; py += panelSize) {
        const cx = px + panelSize / 2;
        const cy = py + panelSize / 2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, panelSize, panelSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  /** Welcome wall canvas for wing lobby rooms */
  public static createWelcomeWallTexture(brandName: string, tagline: string, color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0C0E14';
    ctx.fillRect(0, 0, 1024, 576);

    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 984, 536);

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 952, 504);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(brandName.toUpperCase(), 512, 230);

    ctx.fillStyle = color;
    ctx.font = '22px Inter, sans-serif';
    ctx.fillText(tagline, 512, 290);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 330);
    ctx.lineTo(724, 330);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('CURATED PERMANENT COLLECTION', 512, 380);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('EXPLORE THE GALLERY ROOMS →', 512, 480);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    return new THREE.CanvasTexture(canvas);
  }

  /** Small info plaque beneath paintings — Enterprise Titanium & Gold Finish */
  public static createGalleryLabelTexture(title: string, artistAndYear: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Enterprise Dark Titanium Plaque (No jarring white background)
    ctx.fillStyle = '#0E121C';
    ctx.fillRect(0, 0, 512, 128);

    // Refined Brass / Brushed Gold Border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, 506, 122);

    // Subtle inner bezel line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, 498, 114);

    // Crisp title in bright white
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, 22, 44);

    // Artist & Year in elegant amber gold
    ctx.fillStyle = '#D4AF37';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(artistAndYear, 22, 75);

    // Museum provenance line in refined slate
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('At30 Virtual Pavilion • Curated Fine Art Collection', 22, 104);

    ctx.textAlign = 'left';
    return new THREE.CanvasTexture(canvas);
  }

  // ─── DIGITAL SIGNAGE SCREEN TEXTURES (Real Art Exhibition Mode) ──

  /** PosterBooking Digital Screen — Master Digital Art Exhibition */
  public static createPosterBookingScreenTexture(variant: 'master' | 'menu' = 'master'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d')!;

    if (variant === 'master') {
      // ──────────────────────────────────────────────────────────
      // MASTER 8K DIGITAL CANVAS: Real Fine Art Broadcasting Screen
      // ──────────────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 1024, 576);
      bg.addColorStop(0, '#060B14');
      bg.addColorStop(1, '#0C1628');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1024, 576);

      // Top Status Bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, 1024, 56);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillText('POSTERBOOKING', 30, 36);

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText('● LIVE 8K ART BROADCAST #PB-884', 680, 36);

      // LEFT: Fine Art Frame (Vincent van Gogh - Starry Night)
      const artX = 30, artY = 70, artW = 540, artH = 430;

      // Draw initial fine art frame background
      ctx.fillStyle = '#0F1A2E';
      ctx.beginPath();
      ctx.roundRect(artX, artY, artW, artH, 16);
      ctx.fill();

      // Art info badge on screen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.roundRect(artX + 20, artY + artH - 70, artW - 40, 50, 10);
      ctx.fill();

      ctx.fillStyle = '#FFD166';
      ctx.font = 'bold 14px "Playfair Display", Georgia, serif';
      ctx.fillText('The Starry Night (1889)', artX + 35, artY + artH - 42);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Vincent van Gogh • MoMA Collection', artX + 35, artY + artH - 24);

      // RIGHT TOP: Live Widget Schedule
      const r1X = 590, r1Y = 70, r1W = 404, r1H = 200;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.roundRect(r1X, r1Y, r1W, r1H, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.font = '900 16px Inter, sans-serif';
      ctx.fillText('SMART DISPLAY ORCHESTRATION', r1X + 20, r1Y + 36);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('• 09:00 AM — Louvre Masterpieces Exhibition', r1X + 20, r1Y + 70);
      ctx.fillText('• 01:00 PM — Impressionist Garden Rotations', r1X + 20, r1Y + 100);
      ctx.fillText('• 05:00 PM — Gourmet Bistro Dinner Menu', r1X + 20, r1Y + 130);
      ctx.fillText('• 08:00 PM — Modernist Abstract Visuals', r1X + 20, r1Y + 160);

      // RIGHT BOTTOM: Scavenger Clue Box
      const r2X = 590, r2Y = 290, r2W = 404, r2H = 210;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.roundRect(r2X, r2Y, r2W, r2H, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.font = '900 15px Inter, sans-serif';
      ctx.fillText('🔍 QUEST VOUCHER UNLOCK', r2X + 20, r2Y + 38);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('POSTERBOOKING30', r2X + 20, r2Y + 76);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('30% Off All Annual Pro Screens', r2X + 20, r2Y + 108);
      ctx.fillText('+ 3 Free Screens Forever on Any TV / Device', r2X + 20, r2Y + 130);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('Press [E] or Click Exhibit to Claim to Passport →', r2X + 20, r2Y + 175);

      // BOTTOM TICKER BAR
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 520, 1024, 56);

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('POSTERBOOKING.COM ── TURN ANY FIRESTICK, RASPBERRY PI OR TV INTO A SMART DIGITAL SIGN IN 60 SECONDS ──', 30, 554);

      const texture = new THREE.CanvasTexture(canvas);

      // Load Starry Night image onto screen
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(artX, artY, artW, artH - 80, 16);
        ctx.clip();
        ctx.drawImage(img, artX, artY, artW, artH - 80);
        ctx.restore();
        texture.needsUpdate = true;
      };
      img.src = ONLINE_MASTERPIECES[1].imageUrl;

      return texture;

    } else {
      // ──────────────────────────────────────────────────────────
      // MENU VARIANT: Fine Dining & Art Exhibition Menu
      // ──────────────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 1024, 576);
      bg.addColorStop(0, '#100B08');
      bg.addColorStop(1, '#23150D');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1024, 576);

      ctx.fillStyle = '#D4AF37';
      ctx.font = '900 28px "Playfair Display", Georgia, serif';
      ctx.fillText('L’ATELIER GOURMET BISTRO', 40, 50);

      ctx.fillStyle = '#E06D53';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('POWERED BY POSTERBOOKING DIGITAL SIGNAGE CLOUD', 550, 48);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.roundRect(40, 80, 450, 420, 16); ctx.fill();
      ctx.roundRect(520, 80, 460, 420, 16); ctx.fill();

      ctx.fillStyle = '#FFD166';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('✦ SIGNATURE ARTISAN ENTREES', 60, 125);

      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('Truffle Wagyu Slider Trio ...................... $24', 60, 175);
      ctx.fillStyle = '#A0AEC0'; ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Aged Gruyere, caramelized shallots, brioche', 60, 198);

      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('Wild Caught Salmon Tartare ..................... $21', 60, 245);
      ctx.fillStyle = '#A0AEC0'; ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Avocado mousse, yuzu pearls, crisp lotus', 60, 268);

      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('Handmade Lobster Ravioli ....................... $28', 60, 315);
      ctx.fillStyle = '#A0AEC0'; ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Saffron bisque, fresh tarragon butter', 60, 338);

      ctx.fillStyle = '#FFD166';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('✦ CRAFT COCKTAILS & DESSERTS', 540, 125);

      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('Smoked Rosemary Old Fashioned ................... $16', 540, 175);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('Yuzu Lychee Sparkling Spritz ................... $14', 540, 230);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('Valrhona Molten Lava Souffle ................... $15', 540, 285);

      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.roundRect(540, 350, 420, 125, 12);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('🔑 SCAVENGER CODE: POSTERBOOKING30', 560, 390);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Claim 30% discount on PosterBooking annual plans.', 560, 420);
      ctx.fillText('Inspect exhibit to save voucher.', 560, 445);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 520, 1024, 56);
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('POSTERBOOKING DIGITAL MENUS ── UPDATE PRICES & DISHES INSTANTLY ACROSS ALL BRANCHES ──', 30, 554);

      return new THREE.CanvasTexture(canvas);
    }
  }

  /** ClayRent Architectural Blueprint */
  public static createClayRentTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1A1412';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(224, 109, 83, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 1024; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
    }

    ctx.fillStyle = '#E06D53';
    ctx.font = 'bold 42px Inter, sans-serif';
    ctx.fillText('CLAYRENT', 60, 90);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText('MODERN ASSET & HABITAT RENTAL ECOSYSTEM', 60, 130);

    ctx.strokeStyle = '#E06D53';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(512, 260); ctx.lineTo(820, 420); ctx.lineTo(512, 580); ctx.lineTo(204, 420);
    ctx.closePath(); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(512, 580); ctx.lineTo(512, 800); ctx.lineTo(820, 640); ctx.lineTo(820, 420); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(512, 800); ctx.lineTo(204, 640); ctx.lineTo(204, 420); ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('✦ LUXURY VILLA RESIDENCES', 100, 300);
    ctx.fillText('✦ FLEET & EQUIPMENT LEASING', 100, 340);
    ctx.fillText('✦ ZERO HIDDEN BOOKING FEES', 100, 380);

    ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.roundRect(260, 840, 504, 120, 16); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('🔑 SCAVENGER HUNT VOUCHER', 320, 880);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('CODE: CLAYRENT2026', 360, 925);

    return new THREE.CanvasTexture(canvas);
  }

  /** LeadMagic AI Data Intelligence */
  public static createLeadMagicTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0B0914';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    const nodes = [
      { x: 200, y: 300 }, { x: 450, y: 220 }, { x: 750, y: 280 },
      { x: 300, y: 550 }, { x: 600, y: 500 }, { x: 800, y: 650 }, { x: 450, y: 750 }
    ];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
      }
    }
    nodes.forEach(n => {
      ctx.fillStyle = '#A855F7';
      ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6366F1';
      ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI * 2); ctx.fill();
    });

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.fillText('LEADMAGIC', 60, 90);

    ctx.fillStyle = '#A855F7';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('B2B IP REVEAL & AI CONTACT ENRICHMENT', 60, 130);

    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.roundRect(60, 170, 420, 80, 12); ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('98.4% Deliverability', 80, 215);

    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.roundRect(520, 170, 440, 80, 12); ctx.fill();
    ctx.fillStyle = '#F472B6';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('10x Pipeline Velocity', 540, 215);

    ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 3;
    ctx.roundRect(200, 840, 624, 120, 16); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#E9D5FF';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('🔮 AI VAULT PROMO UNLOCKED', 340, 880);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('CODE: LEADMAGICVIP', 360, 925);

    return new THREE.CanvasTexture(canvas);
  }

  // ─── SIGNAGE TEXTURES ───────────────────────────────────────

  /** Atrium Wing Archway Banner */
  public static createArchBannerTexture(title: string, subtitle: string, color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0F1117';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.fillStyle = color;
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title.toUpperCase(), 512, 110);

    ctx.fillStyle = '#E5E7EB';
    ctx.font = '22px Inter, sans-serif';
    ctx.fillText(subtitle, 512, 170);

    ctx.textAlign = 'left';
    return new THREE.CanvasTexture(canvas);
  }

  /** Centerpiece At30 Emblem */
  public static createAt30LogoTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0B0D13';
    ctx.fillRect(0, 0, 512, 512);

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#00F0FF');
    grad.addColorStop(0.5, '#E06D53');
    grad.addColorStop(1, '#A855F7');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 130px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('At30', 256, 290);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('VIRTUAL INNOVATION PAVILION', 256, 360);

    ctx.textAlign = 'left';
    return new THREE.CanvasTexture(canvas);
  }
}
