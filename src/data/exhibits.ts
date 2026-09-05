import type { ExhibitItem } from '../types';

// ─── EXHIBIT POSITION CALCULATIONS ──────────────────────────
// Layout: Atrium (20×20 at origin) → Corridor (8m) → Lobby (10m) → Hallway (8m) → Gallery (12m) → Hallway (6m) → Sanctum (10m)
//
// East Wing (RipplePOS, +X axis):
//   Sanctum center X = 10 (atrium half) + 8 (corridor) + 10 (lobby) + 8 (hall1) + 12 (gallery) + 6 (hall2) + 5 (sanctum half) = 59
//
// North Wing (ClayRent, -Z axis):
//   Sanctum center Z = -(10 + 8 + 10 + 8 + 12 + 6 + 5) = -59
//
// West Wing (FiledCrews, -X axis):
//   Sanctum center X = -(10 + 8 + 10 + 8 + 12 + 6 + 5) = -59

export const EXHIBITS: ExhibitItem[] = [
  // ==========================================
  // WING 1: RIPPLEPOS (EAST WING)
  // Code exhibits are in Room 3 (Inner Sanctum)
  // ==========================================
  {
    id: 'ripplepos-master',
    brandKey: 'ripplepos',
    brandName: 'RipplePOS',
    brandTagline: 'Next-Generation Point of Sale, Smart Menus & Digital Register Cloud',
    title: 'The Master 8K Digital Canvas',
    wing: 'Digital Canvas Wing',
    position: [62, 2.5, 0], // East Sanctum — far wall
    rotationY: -Math.PI / 2,
    type: 'screen',
    description: 'An interactive high-resolution digital billboard showing real-time menu scheduling, motion art, and live web widgets powered by RipplePOS.',
    detailedStory: 'RipplePOS allows businesses and restaurants to turn any screen or terminal into a professional point of sale display, dynamic digital menu, and customer register in under 60 seconds with unlimited cloud management.',
    clueHint: 'Interact with the screen test pattern to decode the hidden broadcast frequencies.',
    puzzleType: 'interactive_screen',
    couponCode: 'RIPPLEPOS30',
    couponDiscount: '30% Off All Hardware Terminals + 3 Months Free Cloud POS',
    redeemUrl: 'https://ripplepos.com/?utm_source=any30_metaverse&utm_campaign=quest',
    features: [
      'Cloud-Based Point of Sale & Content Scheduling',
      'Supports Tablets, Terminals, Android & iOS',
      'Live Menu Rotation, Inventory & Checkout Widgets',
      'Multi-Zone Split Screen Register Layouts'
    ],
    bannerGradient: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
    themeColor: '#0066FF'
  },
  {
    id: 'ripplepos-menu',
    brandKey: 'ripplepos',
    brandName: 'RipplePOS',
    brandTagline: 'Dynamic Restaurant & Retail Menu Displays',
    title: 'Smart Digital Menu Wall',
    wing: 'Digital Canvas Wing',
    position: [62, 2.5, 4], // East Sanctum — side wall
    rotationY: -Math.PI / 2,
    type: 'screen',
    description: 'A dynamic split-screen display showcasing automated lunch/dinner menu rotation and promotion banners powered by RipplePOS.',
    detailedStory: 'Automate content and pricing changes instantly across thousands of locations. Upload images, 4K videos, and interactive checkout playlists directly from RipplePOS cloud.',
    clueHint: 'Inspect the bottom ticker to see the special secret promotional voucher.',
    puzzleType: 'inspect_uv',
    couponCode: 'RIPPLEPOS30',
    couponDiscount: '30% Off All Hardware Terminals + 3 Months Free Cloud POS',
    redeemUrl: 'https://ripplepos.com/?utm_source=any30_metaverse&utm_campaign=quest',
    features: [
      'Instant Remote Content & Menu Updates',
      'Offline Caching & Auto-Sync Terminals',
      'Unified POS, Kiosk & Menu Integration'
    ],
    bannerGradient: 'linear-gradient(135deg, #1E3C72 0%, #2A5298 100%)',
    themeColor: '#2A5298'
  },

  // ==========================================
  // WING 2: MODERN HABITAT (NORTH WING)
  // Digital Signage Ad Space & Sponsor Showcase
  // ==========================================
  {
    id: 'clayrent-master',
    brandKey: 'clayrent',
    brandName: 'ClayRent',
    brandTagline: 'Modern Habitat Showcase (Digital Signage & Sponsor Space Available)',
    title: 'The Architectural Villa & Asset Blueprints',
    wing: 'Modern Habitat Pavilion',
    position: [0, 2.5, -59], // North Sanctum — center
    rotationY: 0,
    type: 'pedestal',
    description: 'An illuminated 3D architectural model of luxury modern rental habitats with smart lease verification. This exhibit wing is open for brand sponsorship.',
    detailedStory: 'ClayRent revolutionizes high-end property and asset rentals by providing friction-free booking, transparent contracts, real-time availability, and curated modern living spaces. This wing is available for sponsor placement.',
    clueHint: 'Inspect the blueprint foundation plaque to reveal the master architectural access code.',
    puzzleType: 'golden_key',
    couponCode: 'CLAYRENT2026',
    couponDiscount: '$100 Credit Towards Your First Luxury Rental Booking',
    redeemUrl: 'https://clayrent.com/?utm_source=any30_metaverse&utm_campaign=quest',
    features: [
      'Curated Luxury & Modern Spaces',
      'Smart Digital Lease Agreements',
      'Available Digital Signage Slot — Inquire at /partners',
      '24/7 Concierge Support'
    ],
    bannerGradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)',
    themeColor: '#E06D53'
  },
  {
    id: 'clayrent-mobility',
    brandKey: 'clayrent',
    brandName: 'ClayRent',
    brandTagline: 'Premium Fleet & Lifestyle Equipment Rentals',
    title: 'The Modern Mobility Showcase',
    wing: 'Modern Habitat Pavilion',
    position: [-3, 2.5, -62], // North Sanctum — side
    rotationY: 0,
    type: 'painting',
    description: 'Gallery print celebrating electric performance vehicles and premium lifestyle equipment. Available for brand signage placement.',
    detailedStory: 'From electric supercars to designer living spaces, ClayRent delivers an elevated rental standard for modern professionals and travelers.',
    clueHint: 'Examine the vehicle dashboard reflection for the VIP discount key.',
    puzzleType: 'inspect_uv',
    couponCode: 'CLAYRENT2026',
    couponDiscount: '$100 Credit Towards Your First Luxury Rental Booking',
    redeemUrl: 'https://clayrent.com/?utm_source=any30_metaverse&utm_campaign=quest',
    features: [
      'Instant Identity Verification',
      'Flexible Daily, Weekly & Monthly Terms',
      'Digital Ad Space Booking Available at /partners'
    ],
    bannerGradient: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
    themeColor: '#D97706'
  },

  // ==========================================
  // WING 3: FIELD OPERATIONS (WEST WING)
  // Digital Signage Ad Space & Sponsor Showcase
  // ==========================================
  {
    id: 'filedcrews-master',
    brandKey: 'filedcrews',
    brandName: 'FiledCrews',
    brandTagline: 'Field Operations Vault (Digital Signage & Sponsor Space Available)',
    title: 'The Field Operations Command Crystal',
    wing: 'Field Operations Vault',
    position: [-59, 2.5, 0], // West Sanctum — center
    rotationY: Math.PI / 2,
    type: 'crystal',
    description: 'A floating holographic operations core mapping real-time field crew dispatches, live job status tracking, and automated workforce routes.',
    detailedStory: 'FiledCrews empowers modern companies and field service teams to coordinate mobile crews, track job execution in real-time, dispatch tasks with route optimization, and eliminate paper timesheets.',
    clueHint: 'Decode the pulsing dispatch network node to extract the field operations passkey.',
    puzzleType: 'data_decode',
    couponCode: 'FILEDCREWS30',
    couponDiscount: '30% Off Annual Crew Management Plan + 30 Days Free Trial',
    redeemUrl: 'https://filedcrews.com/?utm_source=any30_metaverse&utm_campaign=quest',
    features: [
      'Real-Time Field Crew Dispatch & Scheduling',
      'Live GPS & Job Route Optimization',
      'Available Digital Signage Slot — Inquire at /partners',
      'Automated Timesheets & Invoicing'
    ],
    bannerGradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #C026D3 100%)',
    themeColor: '#6366F1'
  },
  {
    id: 'filedcrews-dispatch',
    brandKey: 'filedcrews',
    brandName: 'FiledCrews',
    brandTagline: 'Automated Field Workforce Accelerator',
    title: 'The Workforce Dispatch Matrix',
    wing: 'Field Operations Vault',
    position: [-62, 2.5, -3], // West Sanctum — side
    rotationY: Math.PI / 2,
    type: 'screen',
    description: 'Interactive live glass display illustrating how dispatched field crews receive jobs, update statuses, and submit proof of work in minutes.',
    detailedStory: 'Coordinate teams across cities seamlessly. FiledCrews provides real-time job routing, client notifications, photo verification, and instantaneous dispatch updates.',
    clueHint: 'Tap into the crew efficiency peak to reveal the promotional passkey.',
    puzzleType: 'inspect_uv',
    couponCode: 'FILEDCREWS30',
    couponDiscount: '30% Off Annual Crew Management Plan + 30 Days Free Trial',
    redeemUrl: 'https://filedcrews.com/?utm_source=any30_metaverse&utm_campaign=quest',
    features: [
      'Live Dispatch Signals & Route Optimization',
      'Proof of Work & Signature Verification',
      'Digital Ad Space Booking Available at /partners'
    ],
    bannerGradient: 'linear-gradient(135deg, #3730A3 0%, #581C87 100%)',
    themeColor: '#7C3AED'
  }
];
