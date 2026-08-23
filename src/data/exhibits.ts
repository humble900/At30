import type { ExhibitItem } from '../types';

// ─── EXHIBIT POSITION CALCULATIONS ──────────────────────────
// Layout: Atrium (20×20 at origin) → Corridor (8m) → Lobby (10m) → Hallway (8m) → Gallery (12m) → Hallway (6m) → Sanctum (10m)
//
// East Wing (PosterBooking, +X axis):
//   Sanctum center X = 10 (atrium half) + 8 (corridor) + 10 (lobby) + 8 (hall1) + 12 (gallery) + 6 (hall2) + 5 (sanctum half) = 59
//
// North Wing (ClayRent, -Z axis):
//   Sanctum center Z = -(10 + 8 + 10 + 8 + 12 + 6 + 5) = -59
//
// West Wing (LeadMagic, -X axis):
//   Sanctum center X = -(10 + 8 + 10 + 8 + 12 + 6 + 5) = -59

export const EXHIBITS: ExhibitItem[] = [
  // ==========================================
  // WING 1: POSTERBOOKING (EAST WING)
  // Code exhibits are in Room 3 (Inner Sanctum)
  // ==========================================
  {
    id: 'posterbooking-master',
    brandKey: 'posterbooking',
    brandName: 'PosterBooking',
    brandTagline: 'Transform any TV or screen into a dynamic digital sign',
    title: 'The Master 8K Digital Canvas',
    wing: 'Digital Canvas Wing',
    position: [62, 2.5, 0], // East Sanctum — far wall
    rotationY: -Math.PI / 2,
    type: 'screen',
    description: 'An interactive high-resolution digital billboard showing real-time menu scheduling, motion art, and live web widgets.',
    detailedStory: 'PosterBooking allows businesses and creators to turn any Smart TV, Firestick, Raspberry Pi, or Android screen into a professional digital signage display in under 60 seconds with unlimited cloud management.',
    clueHint: 'Interact with the screen test pattern to decode the hidden broadcast frequencies.',
    puzzleType: 'interactive_screen',
    couponCode: 'POSTERBOOKING30',
    couponDiscount: '30% Off All Annual Pro Screens + 3 Free Screens Forever',
    redeemUrl: 'https://posterbooking.com/?utm_source=at30_metaverse&utm_campaign=quest',
    features: [
      'Cloud-Based Content Scheduling',
      'Supports Firestick, Android, Windows & Pi',
      'Live Weather, RSS, YouTube & Webpage Widgets',
      'Multi-Zone Split Screen Layouts'
    ],
    bannerGradient: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
    themeColor: '#0066FF'
  },
  {
    id: 'posterbooking-menu',
    brandKey: 'posterbooking',
    brandName: 'PosterBooking',
    brandTagline: 'Dynamic Restaurant & Retail Menu Displays',
    title: 'Smart Digital Menu Wall',
    wing: 'Digital Canvas Wing',
    position: [62, 2.5, 4], // East Sanctum — side wall
    rotationY: -Math.PI / 2,
    type: 'screen',
    description: 'A dynamic split-screen display showcasing automated lunch/dinner menu rotation and promotion banners.',
    detailedStory: 'Automate content changes instantly across thousands of locations. Upload images, 4K videos, and interactive web playlists directly from your browser.',
    clueHint: 'Inspect the bottom ticker to see the special secret promotional voucher.',
    puzzleType: 'inspect_uv',
    couponCode: 'POSTERBOOKING30',
    couponDiscount: '30% Off All Annual Pro Screens + 3 Free Screens Forever',
    redeemUrl: 'https://posterbooking.com/?utm_source=at30_metaverse&utm_campaign=quest',
    features: [
      'Instant Remote Content Updates',
      'Offline Caching & Auto-Sync',
      'Free 10 Screens Tier For Everyone'
    ],
    bannerGradient: 'linear-gradient(135deg, #1E3C72 0%, #2A5298 100%)',
    themeColor: '#2A5298'
  },

  // ==========================================
  // WING 2: CLAYRENT (NORTH WING)
  // Code exhibits are in Room 3 (Inner Sanctum)
  // ==========================================
  {
    id: 'clayrent-master',
    brandKey: 'clayrent',
    brandName: 'ClayRent',
    brandTagline: 'Next-Generation Modern Rental & Asset Ecosystem',
    title: 'The Architectural Villa & Asset Blueprints',
    wing: 'Modern Habitat Pavilion',
    position: [0, 2.5, -59], // North Sanctum — center
    rotationY: 0,
    type: 'pedestal',
    description: 'An illuminated 3D architectural model of luxury modern rental habitats with smart lease verification.',
    detailedStory: 'ClayRent revolutionizes high-end property and asset rentals by providing friction-free booking, transparent contracts, real-time availability, and curated modern living spaces.',
    clueHint: 'Inspect the blueprint foundation plaque to reveal the master architectural access code.',
    puzzleType: 'golden_key',
    couponCode: 'CLAYRENT2026',
    couponDiscount: '$100 Credit Towards Your First Luxury Rental Booking',
    redeemUrl: 'https://clayrent.com/?utm_source=at30_metaverse&utm_campaign=quest',
    features: [
      'Curated Luxury & Modern Spaces',
      'Smart Digital Lease Agreements',
      'Zero Hidden Booking Fees',
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
    description: 'Gallery print celebrating electric performance vehicles and premium lifestyle equipment available on ClayRent.',
    detailedStory: 'From electric supercars to designer living spaces, ClayRent delivers an elevated rental standard for modern professionals and travelers.',
    clueHint: 'Examine the vehicle dashboard reflection for the VIP discount key.',
    puzzleType: 'inspect_uv',
    couponCode: 'CLAYRENT2026',
    couponDiscount: '$100 Credit Towards Your First Luxury Rental Booking',
    redeemUrl: 'https://clayrent.com/?utm_source=at30_metaverse&utm_campaign=quest',
    features: [
      'Instant Identity Verification',
      'Flexible Daily, Weekly & Monthly Terms',
      'Full Comprehensive Insurance Included'
    ],
    bannerGradient: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
    themeColor: '#D97706'
  },

  // ==========================================
  // WING 3: LEADMAGIC (WEST WING)
  // Code exhibits are in Room 3 (Inner Sanctum)
  // ==========================================
  {
    id: 'leadmagic-master',
    brandKey: 'leadmagic',
    brandName: 'LeadMagic',
    brandTagline: 'B2B Lead Intelligence, IP Reveal & Contact Enrichment',
    title: 'The AI Data Intelligence Crystal',
    wing: 'AI Intelligence Vault',
    position: [-59, 2.5, 0], // West Sanctum — center
    rotationY: Math.PI / 2,
    type: 'crystal',
    description: 'A floating holographic AI core mapping billions of verified B2B profiles, verified work emails, and real-time website visitor signals.',
    detailedStory: 'LeadMagic empowers modern revenue and sales teams to uncover anonymous website visitors, enrich contacts with 98%+ email deliverability, and automate high-converting B2B outreach pipeline.',
    clueHint: 'Decode the pulsing AI neural network node to extract the growth coupon sequence.',
    puzzleType: 'data_decode',
    couponCode: 'LEADMAGICVIP',
    couponDiscount: '5,000 Free B2B Lead Enrichment Credits + 20% Off Growth Plan',
    redeemUrl: 'https://leadmagic.io/?utm_source=at30_metaverse&utm_campaign=quest',
    features: [
      'Website Visitor De-anonymization',
      'Real-Time B2B Contact Enrichment',
      'Mobile Phone & Verified Email Lookup',
      'Native CRM Sync (HubSpot, Salesforce, Pipedrive)'
    ],
    bannerGradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #C026D3 100%)',
    themeColor: '#6366F1'
  },
  {
    id: 'leadmagic-pipeline',
    brandKey: 'leadmagic',
    brandName: 'LeadMagic',
    brandTagline: 'Automated Sales Pipeline Accelerator',
    title: 'The B2B Growth Matrix',
    wing: 'AI Intelligence Vault',
    position: [-62, 2.5, -3], // West Sanctum — side
    rotationY: Math.PI / 2,
    type: 'screen',
    description: 'Interactive live glass display illustrating how anonymous web traffic converts into verified sales meetings in minutes.',
    detailedStory: 'Stop losing 97% of your website visitors. LeadMagic identifies the exact companies browsing your pricing page and gives you decision-maker contact info instantly.',
    clueHint: 'Tap into the conversion rate graph peak to reveal the promotional passkey.',
    puzzleType: 'inspect_uv',
    couponCode: 'LEADMAGICVIP',
    couponDiscount: '5,000 Free B2B Lead Enrichment Credits + 20% Off Growth Plan',
    redeemUrl: 'https://leadmagic.io/?utm_source=at30_metaverse&utm_campaign=quest',
    features: [
      'Intent Signals & Buying Triggers',
      'Waterfall Email Verification',
      'Zero False Positives Guarantee'
    ],
    bannerGradient: 'linear-gradient(135deg, #3730A3 0%, #581C87 100%)',
    themeColor: '#7C3AED'
  }
];
