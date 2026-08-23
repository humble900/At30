export type BrandKey = 'posterbooking' | 'clayrent' | 'leadmagic';

export interface ExhibitItem {
  id: string;
  brandKey: BrandKey;
  brandName: string;
  brandTagline: string;
  title: string;
  wing: 'Digital Canvas Wing' | 'Modern Habitat Pavilion' | 'AI Intelligence Vault';
  position: [number, number, number]; // x, y, z
  rotationY: number; // in radians
  type: 'screen' | 'painting' | 'pedestal' | 'kiosk' | 'crystal';
  description: string;
  detailedStory: string;
  clueHint: string;
  puzzleType: 'inspect_uv' | 'interactive_screen' | 'golden_key' | 'data_decode';
  couponCode: string;
  couponDiscount: string;
  redeemUrl: string;
  features: string[];
  bannerGradient: string;
  themeColor: string;
}

export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

export interface DiscoveredCoupon {
  brandKey: BrandKey;
  brandName: string;
  title: string;
  code: string;
  discount: string;
  redeemUrl: string;
  discoveredAt: string;
}

export interface QuestState {
  discoveredCodes: Record<BrandKey, DiscoveredCoupon | null>;
  hasUnlockedMasterVault: boolean;
  activeNearbyExhibit: ExhibitItem | null;
  selectedExhibit: ExhibitItem | null;
  isPassportOpen: boolean;
  isAudioMuted: boolean;
  playerName: string;
  avatarColor: string;
  cameraMode: 'third_person' | 'first_person';
}
