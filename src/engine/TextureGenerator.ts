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
    texture.userData = { artworkIndex: artIndex % ONLINE_MASTERPIECES.length };
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
  public static createAdvertisingScreenTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#F0EEE7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#171A17';
    ctx.fillRect(34, 34, 956, 508);
    ctx.fillStyle = '#D9FF43';
    ctx.fillRect(72, 72, 184, 34);
    ctx.fillStyle = '#171A17';
    ctx.font = '700 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Any30 PARTNERS', 164, 95);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#F4F5F1';
    ctx.font = '700 74px Inter, sans-serif';
    ctx.fillText('Advertise here.', 72, 254);
    ctx.fillStyle = '#ADB4AA';
    ctx.font = '400 28px Inter, sans-serif';
    ctx.fillText('Put your brand inside the museum experience.', 72, 318);
    ctx.strokeStyle = '#454A43';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(72, 382);
    ctx.lineTo(952, 382);
    ctx.stroke();
    ctx.fillStyle = '#D9FF43';
    ctx.font = '600 24px Inter, sans-serif';
    ctx.fillText('WhatsApp  +1 409 422 9714', 72, 452);
    ctx.fillStyle = '#25D366';
    ctx.beginPath();
    ctx.arc(912, 444, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#171A17';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(912, 444, 15, .45, 4.75);
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  public static createReceptionDemoAdTexture(brand: 'clayrent' | 'filedcrews'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d')!;

    const isClayRent = brand === 'clayrent';
    const accent = isClayRent ? '#E06D53' : '#A855F7';
    const header = isClayRent ? 'FEATURED PARTNER AD · CLAYRENT' : 'FEATURED PARTNER AD · FILEDCREWS';
    const title = isClayRent ? 'Modern Habitat Rentals' : 'Field Operations Fleet';
    const subtitle = isClayRent ? 'Curated Luxury Living & Smart Asset Booking' : 'Real-Time Crew Route & Task Dispatch Platform';
    const perk = isClayRent ? '$100 Booking Voucher inside Museum' : '30% Off Operations Pass inside Museum';

    ctx.fillStyle = '#0F121A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.strokeRect(18, 18, 988, 540);

    // Pill badge
    ctx.fillStyle = accent;
    ctx.fillRect(50, 50, 360, 38);
    ctx.fillStyle = '#0F121A';
    ctx.font = '800 16px Inter, sans-serif';
    ctx.fillText(header, 65, 75);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 58px Inter, sans-serif';
    ctx.fillText(title, 50, 180);

    // Subtitle
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillText(subtitle, 50, 235);

    // Perk Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(50, 280, 924, 100);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 280, 924, 100);

    ctx.fillStyle = accent;
    ctx.font = '700 16px "DM Mono", monospace';
    ctx.fillText('DISCOVERABLE VOUCHER IN EXHIBIT', 75, 315);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px Inter, sans-serif';
    ctx.fillText(perk, 75, 355);

    // Footer note
    ctx.fillStyle = '#64748B';
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillText('Demo Signage Ad Slot · Book your brand placement at /partners', 50, 480);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  public static createWelcomeWallTexture(brandName: string, tagline: string, color: string, statsBadgeText?: string): THREE.CanvasTexture {
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
    ctx.fillText(brandName.toUpperCase(), 512, 215);

    ctx.fillStyle = color;
    ctx.font = '22px Inter, sans-serif';
    ctx.fillText(tagline, 512, 275);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 310);
    ctx.lineTo(724, 310);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('CURATED PERMANENT COLLECTION', 512, 350);

    if (statsBadgeText) {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(312, 385, 400, 48, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(`● ${statsBadgeText.toUpperCase()}`, 512, 416);
    }

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('EXPLORE THE GALLERY ROOMS →', 512, statsBadgeText ? 485 : 460);
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
    ctx.fillText('Any30 Virtual Pavilion • Curated Fine Art Collection', 22, 104);

    ctx.textAlign = 'left';
    return new THREE.CanvasTexture(canvas);
  }

  // ─── DIGITAL SIGNAGE SCREEN TEXTURES (Real Art Exhibition Mode) ──

  /** RipplePOS Digital Screen — Master Point of Sale & Art Exhibition */
  public static createRipplePOSScreenTexture(variant: 'master' | 'menu' = 'master'): THREE.CanvasTexture {
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
      ctx.fillText('RIPPLEPOS', 30, 36);

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText('● LIVE POS & MENU BROADCAST #RP-884', 680, 36);

      // LEFT: Fine Art Frame (Vincent van Gogh - Starry Night)
      const artX = 30, artY = 70, artW = 540, artH = 430;

      // Draw initial fine art frame background
      ctx.fillStyle = '#0F1A2E';
      ctx.beginPath();
      ctx.roundRect(artX, artY, artW, artH, 16);
      ctx.fill();

      // RIGHT: Interactive Display & Promo Widget
      const r2X = 600, r2Y = 80, r2W = 390, r2H = 220;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(r2X, r2Y, r2W, r2H, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.font = '900 15px Inter, sans-serif';
      ctx.fillText('🔍 QUEST VOUCHER UNLOCK', r2X + 20, r2Y + 38);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('RIPPLEPOS30', r2X + 20, r2Y + 76);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('30% Off All Annual POS Hardware', r2X + 20, r2Y + 108);
      ctx.fillText('+ 3 Months Free Cloud POS on Any Screen', r2X + 20, r2Y + 130);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText('Press [E] or Click Exhibit to Claim to Passport →', r2X + 20, r2Y + 175);

      // BOTTOM TICKER BAR
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 520, 1024, 56);

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('RIPPLEPOS.COM ── SMART POINT OF SALE, DIGITAL MENUS & CHECKOUT REGISTERS ──', 30, 554);

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
      ctx.fillText('POWERED BY RIPPLEPOS CLOUD REGISTER & DIGITAL MENUS', 510, 48);

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
      ctx.fillText('🔑 SCAVENGER CODE: RIPPLEPOS30', 560, 390);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Claim 30% discount on RipplePOS annual hardware & plans.', 560, 420);
      ctx.fillText('Inspect exhibit to save voucher.', 560, 445);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 520, 1024, 56);
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('RIPPLEPOS DIGITAL MENUS ── UPDATE PRICES & DISHES INSTANTLY ACROSS ALL BRANCHES ──', 30, 554);

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

  /** FiledCrews Field Operations & Workforce Management */
  public static createFiledCrewsTexture(): THREE.CanvasTexture {
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
    ctx.fillText('FILEDCREWS', 60, 90);

    ctx.fillStyle = '#A855F7';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('FIELD OPERATIONS & WORKFORCE DISPATCH', 60, 130);

    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.roundRect(60, 170, 420, 80, 12); ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('Real-Time Dispatch', 80, 215);

    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.roundRect(520, 170, 440, 80, 12); ctx.fill();
    ctx.fillStyle = '#F472B6';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('10x Crew Efficiency', 540, 215);

    ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 3;
    ctx.roundRect(200, 840, 624, 120, 16); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#E9D5FF';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('⚡ FILEDCREWS PROMO UNLOCKED', 320, 880);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('CODE: FILEDCREWS30', 360, 925);

    return new THREE.CanvasTexture(canvas);
  }

  public static createLeadMagicTexture(): THREE.CanvasTexture {
    return TextureGenerator.createFiledCrewsTexture();
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

  /** Centerpiece Any30 Emblem */
  public static createAny30LogoTexture(): THREE.CanvasTexture {
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
    ctx.font = '900 120px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Any30', 256, 290);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('VIRTUAL INNOVATION PAVILION', 256, 360);

    ctx.textAlign = 'left';
    return new THREE.CanvasTexture(canvas);
  }

  // ─── PROCEDURAL REALISTIC HUMAN & WARDROBE TEXTURES ──────────

  /** Fine woven fabric normal map for wool business suit and dress trousers */
  public static createFabricNormalMap(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // High-frequency twill / diagonal weave pattern
        const freq = 0.35;
        const dx = Math.cos(x * freq + y * freq * 0.5) * freq * 0.4;
        const dy = -Math.sin(y * freq - x * freq * 0.5) * freq * 0.4;

        // Convert gradient to normal map (Tangent Space: X=R, Y=G, Z=B)
        const nx = -dx * 2.0;
        const ny = -dy * 2.0;
        const nz = 1.0;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

        const idx = (y * size + x) * 4;
        data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  /** Organic micro-pore normal map for realistic human skin */
  public static createSkinNormalMap(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    // Pseudo-random cellular pore distribution
    const seedPoints: [number, number][] = [];
    for (let i = 0; i < 90; i++) {
      seedPoints.push([Math.random() * size, Math.random() * size]);
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let minDist = 999;
        for (let i = 0; i < seedPoints.length; i++) {
          const dx = x - seedPoints[i][0];
          const dy = y - seedPoints[i][1];
          const d = dx * dx + dy * dy;
          if (d < minDist) minDist = d;
        }
        const dist = Math.sqrt(minDist);
        const pore = Math.sin(dist * 0.6) * Math.exp(-dist * 0.08);

        const nx = (Math.random() - 0.5) * 0.15 + pore * 0.2;
        const ny = (Math.random() - 0.5) * 0.15 + pore * 0.2;
        const nz = 1.0;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

        const idx = (y * size + x) * 4;
        data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  /** Leather crease normal map for dress shoes */
  public static createLeatherNormalMap(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const crease = Math.sin(x * 0.4 + Math.sin(y * 0.3) * 2) * 0.12;
        const nx = crease;
        const ny = Math.cos(y * 0.4) * 0.08;
        const nz = 1.0;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

        const idx = (y * size + x) * 4;
        data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  /**
   * Anatomical face diffuse texture matching Curator Vance
   * Includes defined eyes, irises, specular highlights, eyebrows, nose bridge shading,
   * natural lips, cheekbone warmth, and subtle 5 o'clock jaw shadow.
   */
  public static createCuratorFaceTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base Caucasian / Mediterranean warm skin tone
    const skinGrad = ctx.createRadialGradient(256, 256, 60, 256, 256, 260);
    skinGrad.addColorStop(0, '#E8B99D');
    skinGrad.addColorStop(0.65, '#DC9E7F');
    skinGrad.addColorStop(1, '#C88566');
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle forehead light & cheekbone blush
    ctx.fillStyle = 'rgba(255, 230, 210, 0.22)';
    ctx.beginPath();
    ctx.ellipse(256, 120, 110, 55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks warmth
    ctx.fillStyle = 'rgba(220, 100, 80, 0.12)';
    ctx.beginPath();
    ctx.ellipse(170, 275, 45, 30, 0, 0, Math.PI * 2);
    ctx.ellipse(342, 275, 45, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle masculine jawline shadow (clean trimmed 5 o'clock shadow)
    const jawGrad = ctx.createLinearGradient(0, 310, 0, 480);
    jawGrad.addColorStop(0, 'rgba(60, 50, 45, 0.0)');
    jawGrad.addColorStop(0.5, 'rgba(70, 60, 55, 0.18)');
    jawGrad.addColorStop(1, 'rgba(50, 40, 35, 0.28)');
    ctx.fillStyle = jawGrad;
    ctx.beginPath();
    ctx.moveTo(110, 330);
    ctx.quadraticCurveTo(256, 470, 402, 330);
    ctx.lineTo(402, 512);
    ctx.lineTo(110, 512);
    ctx.closePath();
    ctx.fill();

    // Nose bridge and nostrils
    ctx.fillStyle = 'rgba(160, 95, 70, 0.22)';
    ctx.beginPath();
    ctx.moveTo(246, 210);
    ctx.lineTo(266, 210);
    ctx.lineTo(276, 298);
    ctx.lineTo(236, 298);
    ctx.closePath();
    ctx.fill();

    // Nostril wings & shadows
    ctx.fillStyle = 'rgba(120, 60, 40, 0.45)';
    ctx.beginPath();
    ctx.ellipse(244, 304, 7, 4, 0.2, 0, Math.PI * 2);
    ctx.ellipse(268, 304, 7, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Nose tip soft highlight
    ctx.fillStyle = 'rgba(255, 245, 235, 0.35)';
    ctx.beginPath();
    ctx.ellipse(256, 292, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes rendering helper
    const drawEye = (cx: number, cy: number, isLeft: boolean) => {
      // Eye socket depth
      ctx.fillStyle = 'rgba(140, 85, 65, 0.2)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyeballs (sclera with subtle warm ambient tint)
      ctx.fillStyle = '#F4EFEB';
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy);
      ctx.quadraticCurveTo(cx, cy - 17, cx + 30, cy);
      ctx.quadraticCurveTo(cx, cy + 15, cx - 30, cy);
      ctx.closePath();
      ctx.fill();

      // Iris (warm deep hazel/amber brown matching Vance)
      const irisGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
      irisGrad.addColorStop(0, '#5C381E');
      irisGrad.addColorStop(0.7, '#3A200E');
      irisGrad.addColorStop(1, '#201006');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 13, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#080604';
      ctx.beginPath();
      ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Specular light reflection (gives life to the eyes!)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - 3.5, cy - 3.5, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Eyelids & eyelash border
      ctx.strokeStyle = '#2B170B';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 31, cy);
      ctx.quadraticCurveTo(cx, cy - 18, cx + 31, cy);
      ctx.stroke();

      // Eyebrows (masculine groomed arch with individual strand texture)
      ctx.fillStyle = '#2C221C';
      ctx.beginPath();
      const browY = cy - 26;
      if (isLeft) {
        ctx.moveTo(cx - 34, browY + 6);
        ctx.quadraticCurveTo(cx, browY - 6, cx + 32, browY + 2);
        ctx.quadraticCurveTo(cx + 4, browY - 14, cx - 34, browY + 6);
      } else {
        ctx.moveTo(cx - 32, browY + 2);
        ctx.quadraticCurveTo(cx, browY - 6, cx + 34, browY + 6);
        ctx.quadraticCurveTo(cx - 4, browY - 14, cx - 32, browY + 2);
      }
      ctx.fill();
    };

    drawEye(182, 218, true);
    drawEye(330, 218, false);

    // Natural smile lines (nasolabial folds)
    ctx.strokeStyle = 'rgba(150, 90, 65, 0.18)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(234, 290);
    ctx.quadraticCurveTo(210, 335, 216, 368);
    ctx.moveTo(278, 290);
    ctx.quadraticCurveTo(302, 335, 296, 368);
    ctx.stroke();

    // Lips (natural healthy tone with subtle cupid's bow and lower lip fullness)
    const lipGrad = ctx.createLinearGradient(0, 350, 0, 385);
    lipGrad.addColorStop(0, '#B86A5E');
    lipGrad.addColorStop(0.5, '#A85A4E');
    lipGrad.addColorStop(1, '#8C4339');
    ctx.fillStyle = lipGrad;

    // Upper lip
    ctx.beginPath();
    ctx.moveTo(226, 362);
    ctx.quadraticCurveTo(244, 356, 256, 359);
    ctx.quadraticCurveTo(268, 356, 286, 362);
    ctx.quadraticCurveTo(256, 367, 226, 362);
    ctx.fill();

    // Lower lip
    ctx.beginPath();
    ctx.moveTo(228, 364);
    ctx.quadraticCurveTo(256, 367, 284, 364);
    ctx.quadraticCurveTo(256, 384, 228, 364);
    ctx.fill();

    // Center mouth seam line
    ctx.strokeStyle = '#4A1D16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(224, 363);
    ctx.lineTo(288, 363);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * High-definition "Any30 / Curator Vance" metallic pocket name badge
   * Features brushed titanium background, Any30 logo glyph, and executive typography.
   */
  public static createCuratorBadgeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    // Brushed metal finish
    const metalGrad = ctx.createLinearGradient(0, 0, 256, 96);
    metalGrad.addColorStop(0, '#D1D5DB');
    metalGrad.addColorStop(0.3, '#E5E7EB');
    metalGrad.addColorStop(0.7, '#9CA3AF');
    metalGrad.addColorStop(1, '#6B7280');
    ctx.fillStyle = metalGrad;
    ctx.roundRect(4, 4, 248, 88, 10);
    ctx.fill();

    // Metal chamfer border
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dark inset inner plate
    ctx.fillStyle = '#111827';
    ctx.roundRect(10, 10, 236, 76, 6);
    ctx.fill();

    // Any30 Cyan Logo Icon
    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('Any30', 22, 42);

    // Curator Vance text
    ctx.fillStyle = '#F9FAFB';
    ctx.font = 'bold 19px Inter, sans-serif';
    ctx.fillText('CURATOR VANCE', 88, 40);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.fillText('MUSEUM DIRECTOR', 88, 62);

    // Cyan status indicator dot
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(224, 36, 5, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }
}

