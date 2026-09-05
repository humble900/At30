import { supabase } from '../lib/supabase';

export type PartnerType = 'sponsor_gift' | 'digital_signage' | 'both';

export interface PartnerInquiry {
  id: string;
  brandName: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl: string;
  logoUrl?: string;
  partnerType: PartnerType;
  offerDescription: string;
  estimatedValue?: string;
  clueIdea?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
}

export interface PublicPartner {
  id: string;
  name: string;
  tagline: string;
  badge: 'Sponsor' | 'Signage Partner' | 'Founding Partner';
  websiteUrl: string;
  logoText: string;
  accentColor: string;
  giftOffer: string;
  locationInMuseum: string;
  isAvailableSlot?: boolean;
}

const STORAGE_KEY = 'at30_partner_inquiries_v1';

// Seeded directory of live partners and available slots (outbid.lol style)
export const INITIAL_PUBLIC_PARTNERS: PublicPartner[] = [
  {
    id: 'ripplepos',
    name: 'RipplePOS',
    tagline: 'Next-gen cloud point of sale and dynamic digital menus',
    badge: 'Founding Partner',
    websiteUrl: 'https://ripplepos.com',
    logoText: 'RP',
    accentColor: '#0066FF',
    giftOffer: '30% Off Terminals + 3 Months Free Cloud POS Voucher',
    locationInMuseum: 'East Wing · 8K Digital Canvas'
  },
  {
    id: 'clayrent',
    name: 'ClayRent',
    tagline: 'Curated modern habitat and luxury equipment rentals',
    badge: 'Signage Partner',
    websiteUrl: 'https://clayrent.com',
    logoText: 'CR',
    accentColor: '#E06D53',
    giftOffer: '$100 Booking Credit (Demo Ad at Reception)',
    locationInMuseum: 'Reception Hall · East Totem'
  },
  {
    id: 'filedcrews',
    name: 'FiledCrews',
    tagline: 'Real-time mobile field workforce & crew dispatch',
    badge: 'Signage Partner',
    websiteUrl: 'https://filedcrews.com',
    logoText: 'FC',
    accentColor: '#A855F7',
    giftOffer: '30% Off Annual Plan (Demo Ad at Reception)',
    locationInMuseum: 'Reception Hall · West Totem'
  },
  {
    id: 'slot-gallery-north',
    name: 'Available Sponsor Slot',
    tagline: 'Display your digital product, game key, or SaaS perk here',
    badge: 'Sponsor',
    websiteUrl: '#apply',
    logoText: 'SLOT',
    accentColor: '#10B981',
    giftOffer: 'Your gift could be discovered by thousands of explorers this week!',
    locationInMuseum: 'North Wing Pavilion · Architectural Showcase',
    isAvailableSlot: true
  },
  {
    id: 'slot-vault-west',
    name: 'Available Signage Billboard',
    tagline: 'Prime digital ad space seen by every visitor solving the West Vault',
    badge: 'Signage Partner',
    websiteUrl: '#apply',
    logoText: 'AD',
    accentColor: '#F59E0B',
    giftOffer: 'High-visibility 3D interactive screen with direct click-through',
    locationInMuseum: 'West Wing Vault · Command Matrix Screen',
    isAvailableSlot: true
  }
];

class PartnerInquiryService {
  private static instance: PartnerInquiryService | null = null;

  public static getInstance(): PartnerInquiryService {
    if (!PartnerInquiryService.instance) {
      PartnerInquiryService.instance = new PartnerInquiryService();
    }
    return PartnerInquiryService.instance;
  }

  public getInquiries(): PartnerInquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async submitInquiry(inquiry: Omit<PartnerInquiry, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    const newEntry: PartnerInquiry = {
      ...inquiry,
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save locally
    try {
      const existing = this.getInquiries();
      existing.unshift(newEntry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn('Failed to save inquiry locally', err);
    }

    // Attempt Supabase insert if table exists
    if (supabase) {
      try {
        await supabase.from('partner_inquiries').insert([{
          brand_name: inquiry.brandName,
          contact_email: inquiry.contactEmail,
          contact_phone: inquiry.contactPhone || null,
          website_url: inquiry.websiteUrl,
          logo_url: inquiry.logoUrl || null,
          partner_type: inquiry.partnerType,
          offer_description: inquiry.offerDescription,
          estimated_value: inquiry.estimatedValue || null,
          clue_idea: inquiry.clueIdea || null,
          created_at: newEntry.createdAt
        }]);
      } catch (e) {
        // Fallback gracefully to local storage
        console.info('Supabase partner_inquiries fallback to local storage');
      }
    }

    return {
      success: true,
      message: 'Your submission was received! Our team reviews every gift and ad placement within 24 hours.'
    };
  }
}

export const partnerInquiries = PartnerInquiryService.getInstance();
