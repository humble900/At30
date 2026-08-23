-- ================================================================
-- AT30 METAVERSE MUSEUM: SEED DATA
-- Migration: 002_seed_data.sql
-- ================================================================

-- 1. SEED DEFAULT ADMIN USER
insert into admin_users (email, full_name, role)
values ('admin@at30.io', 'Master Curator', 'superadmin')
on conflict (email) do nothing;

-- 2. SEED BRANDS
insert into brands (key, name, tagline, wing_name, theme_color, banner_gradient, website_url, sort_order)
values
(
  'posterbooking',
  'PosterBooking',
  'Transform any TV or screen into a dynamic digital sign',
  'Digital Canvas Wing',
  '#0066FF',
  'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
  'https://posterbooking.com/?utm_source=at30_metaverse&utm_campaign=quest',
  1
),
(
  'clayrent',
  'ClayRent',
  'Next-Generation Modern Rental & Asset Ecosystem',
  'Modern Habitat Pavilion',
  '#E06D53',
  'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)',
  'https://clayrent.com/?utm_source=at30_metaverse&utm_campaign=quest',
  2
),
(
  'leadmagic',
  'LeadMagic',
  'B2B Lead Intelligence, IP Reveal & Contact Enrichment',
  'AI Intelligence Vault',
  '#6366F1',
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #C026D3 100%)',
  'https://leadmagic.io/?utm_source=at30_metaverse&utm_campaign=quest',
  3
)
on conflict (key) do nothing;

-- 3. SEED EXHIBITS
insert into exhibits (
  id, brand_key, brand_name, brand_tagline, title, wing,
  position_x, position_y, position_z, rotation_y,
  type, description, detailed_story, clue_hint, puzzle_type,
  coupon_code, coupon_discount, redeem_url, features, banner_gradient, theme_color, sort_order
) values
(
  'posterbooking-master',
  'posterbooking',
  'PosterBooking',
  'Transform any TV or screen into a dynamic digital sign',
  'The Master 8K Digital Canvas',
  'Digital Canvas Wing',
  62, 2.5, 0, -1.5707963267948966,
  'screen',
  'An interactive high-resolution digital billboard showing real-time menu scheduling, motion art, and live web widgets.',
  'PosterBooking allows businesses and creators to turn any Smart TV, Firestick, Raspberry Pi, or Android screen into a professional digital signage display in under 60 seconds with unlimited cloud management.',
  'Interact with the screen test pattern to decode the hidden broadcast frequencies.',
  'interactive_screen',
  'POSTERBOOKING30',
  '30% Off All Annual Pro Screens + 3 Free Screens Forever',
  'https://posterbooking.com/?utm_source=at30_metaverse&utm_campaign=quest',
  array['Cloud-Based Content Scheduling', 'Supports Firestick, Android, Windows & Pi', 'Live Weather, RSS, YouTube & Webpage Widgets', 'Multi-Zone Split Screen Layouts'],
  'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)',
  '#0066FF',
  1
),
(
  'posterbooking-menu',
  'posterbooking',
  'PosterBooking',
  'Dynamic Restaurant & Retail Menu Displays',
  'Smart Digital Menu Wall',
  'Digital Canvas Wing',
  62, 2.5, 4, -1.5707963267948966,
  'screen',
  'A dynamic split-screen display showcasing automated lunch/dinner menu rotation and promotion banners.',
  'Automate content changes instantly across thousands of locations. Upload images, 4K videos, and interactive web playlists directly from your browser.',
  'Inspect the bottom ticker to see the special secret promotional voucher.',
  'inspect_uv',
  'POSTERBOOKING30',
  '30% Off All Annual Pro Screens + 3 Free Screens Forever',
  'https://posterbooking.com/?utm_source=at30_metaverse&utm_campaign=quest',
  array['Instant Remote Content Updates', 'Offline Caching & Auto-Sync', 'Free 10 Screens Tier For Everyone'],
  'linear-gradient(135deg, #1E3C72 0%, #2A5298 100%)',
  '#2A5298',
  2
),
(
  'clayrent-master',
  'clayrent',
  'ClayRent',
  'Next-Generation Modern Rental & Asset Ecosystem',
  'The Architectural Villa & Asset Blueprints',
  'Modern Habitat Pavilion',
  0, 2.5, -59, 0,
  'pedestal',
  'An illuminated 3D architectural model of luxury modern rental habitats with smart lease verification.',
  'ClayRent revolutionizes high-end property and asset rentals by providing friction-free booking, transparent contracts, real-time availability, and curated modern living spaces.',
  'Inspect the blueprint foundation plaque to reveal the master architectural access code.',
  'golden_key',
  'CLAYRENT2026',
  '$100 Credit Towards Your First Luxury Rental Booking',
  'https://clayrent.com/?utm_source=at30_metaverse&utm_campaign=quest',
  array['Curated Luxury & Modern Spaces', 'Smart Digital Lease Agreements', 'Zero Hidden Booking Fees', '24/7 Concierge Support'],
  'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)',
  '#E06D53',
  3
),
(
  'clayrent-mobility',
  'clayrent',
  'ClayRent',
  'Premium Fleet & Lifestyle Equipment Rentals',
  'The Modern Mobility Showcase',
  'Modern Habitat Pavilion',
  -3, 2.5, -62, 0,
  'painting',
  'Gallery print celebrating electric performance vehicles and premium lifestyle equipment available on ClayRent.',
  'From electric supercars to designer living spaces, ClayRent delivers an elevated rental standard for modern professionals and travelers.',
  'Examine the vehicle dashboard reflection for the VIP discount key.',
  'inspect_uv',
  'CLAYRENT2026',
  '$100 Credit Towards Your First Luxury Rental Booking',
  'https://clayrent.com/?utm_source=at30_metaverse&utm_campaign=quest',
  array['Instant Identity Verification', 'Flexible Daily, Weekly & Monthly Terms', 'Full Comprehensive Insurance Included'],
  'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
  '#D97706',
  4
),
(
  'leadmagic-master',
  'leadmagic',
  'LeadMagic',
  'B2B Lead Intelligence, IP Reveal & Contact Enrichment',
  'The AI Data Intelligence Crystal',
  'AI Intelligence Vault',
  -59, 2.5, 0, 1.5707963267948966,
  'crystal',
  'A floating holographic AI core mapping billions of verified B2B profiles, verified work emails, and real-time website visitor signals.',
  'LeadMagic empowers modern revenue and sales teams to uncover anonymous website visitors, enrich contacts with 98%+ email deliverability, and automate high-converting B2B outreach pipeline.',
  'Decode the pulsing AI neural network node to extract the growth coupon sequence.',
  'data_decode',
  'LEADMAGICVIP',
  '5,000 Free B2B Lead Enrichment Credits + 20% Off Growth Plan',
  'https://leadmagic.io/?utm_source=at30_metaverse&utm_campaign=quest',
  array['Website Visitor De-anonymization', 'Real-Time B2B Contact Enrichment', 'Mobile Phone & Verified Email Lookup', 'Native CRM Sync (HubSpot, Salesforce, Pipedrive)'],
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #C026D3 100%)',
  '#6366F1',
  5
),
(
  'leadmagic-pipeline',
  'leadmagic',
  'LeadMagic',
  'Automated Sales Pipeline Accelerator',
  'The B2B Growth Matrix',
  'AI Intelligence Vault',
  -62, 2.5, -3, 1.5707963267948966,
  'screen',
  'Interactive live glass display illustrating how anonymous web traffic converts into verified sales meetings in minutes.',
  'Stop losing 97% of your website visitors. LeadMagic identifies the exact companies browsing your pricing page and gives you decision-maker contact info instantly.',
  'Tap into the conversion rate graph peak to reveal the promotional passkey.',
  'inspect_uv',
  'LEADMAGICVIP',
  '5,000 Free B2B Lead Enrichment Credits + 20% Off Growth Plan',
  'https://leadmagic.io/?utm_source=at30_metaverse&utm_campaign=quest',
  array['Intent Signals & Buying Triggers', 'Waterfall Email Verification', 'Zero False Positives Guarantee'],
  'linear-gradient(135deg, #3730A3 0%, #581C87 100%)',
  '#7C3AED',
  6
)
on conflict (id) do nothing;

-- 4. SEED COUPONS
insert into coupons (brand_key, code, discount_text, redeem_url, max_claims)
values
('posterbooking', 'POSTERBOOKING30', '30% Off All Annual Pro Screens + 3 Free Screens Forever', 'https://posterbooking.com/?utm_source=at30_metaverse&utm_campaign=quest', 5000),
('clayrent', 'CLAYRENT2026', '$100 Credit Towards Your First Luxury Rental Booking', 'https://clayrent.com/?utm_source=at30_metaverse&utm_campaign=quest', 2500),
('leadmagic', 'LEADMAGICVIP', '5,000 Free B2B Lead Enrichment Credits + 20% Off Growth Plan', 'https://leadmagic.io/?utm_source=at30_metaverse&utm_campaign=quest', 10000);

-- 5. SEED MASTERPIECE ARTWORKS
insert into artworks (id, title, artist, year, medium, location, image_url, description, position_index)
values
('great-wave', 'The Great Wave off Kanagawa', 'Katsushika Hokusai', 'c. 1831', 'Woodblock print; ink and color on paper', 'Tokyo National Museum / Met Museum', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80', 'An iconic Japanese ukiyo-e woodblock print depicting towering waves framing Mount Fuji in the background.', 1),
('starry-night', 'The Starry Night', 'Vincent van Gogh', '1889', 'Oil on canvas', 'Museum of Modern Art (MoMA), New York', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80', 'Vibrant, swirling post-impressionist masterpiece capturing the nocturnal sky over Saint-Rémy-de-Provence.', 2),
('water-lilies', 'Water Lilies (Nymphéas)', 'Claude Monet', '1906', 'Oil on canvas', 'Musée de l’Orangerie, Paris', 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=80', 'Monet’s luminous impressionist exploration of light, reflections, and flora in his Giverny water garden.', 3),
('girl-pearl-earring', 'Girl with a Pearl Earring', 'Johannes Vermeer', 'c. 1665', 'Oil on canvas', 'Mauritshuis, The Hague', 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=80', 'Dutch Golden Age tronie painting celebrated for Vermeer’s delicate treatment of chiaroscuro and gaze.', 4),
('wanderer-fog', 'Wanderer above the Sea of Fog', 'Caspar David Friedrich', '1818', 'Oil on canvas', 'Hamburger Kunsthalle, Hamburg', 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1200&q=80', 'A cornerstone of Romanticism depicting an introspective traveler atop a rocky precipice overlooking a misty expanse.', 5),
('grande-jatte', 'A Sunday on La Grande Jatte', 'Georges Seurat', '1884–1886', 'Oil on canvas', 'Art Institute of Chicago', 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80', 'The monumental pointillist canvas depicting Parisians relaxing in a park along the River Seine.', 6),
('mona-lisa', 'Mona Lisa (La Gioconda)', 'Leonardo da Vinci', 'c. 1503–1519', 'Oil on poplar panel', 'Musée du Louvre, Paris', 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=1200&q=80', 'The most renowned Renaissance portrait, distinguished by Leonardo’s masterly sfumato technique and enigmatic expression.', 7),
('classical-sculpture', 'Classical Hellenistic & Roman Study', 'Antiquity Masters', 'c. 2nd Century BCE', 'Carved Parian Marble', 'Capitoline Museums, Rome', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80', 'Classical marble sculpture celebrated for anatomical naturalism, dynamic drapery, and heroic poise.', 8)
on conflict (id) do nothing;

-- 6. SEED MUSEUM CONFIG
insert into museum_config (id, museum_name, tagline, spawn_x, spawn_y, spawn_z, spawn_rotation, fog_color, fog_density, ambient_light_intensity)
values (1, 'AT30 Digital Museum', 'The Future, Curated.', 0, 0, 8.5, 3.14159, '#0C0E14', 0.012, 0.45)
on conflict (id) do update set
  museum_name = excluded.museum_name,
  tagline = excluded.tagline,
  spawn_x = excluded.spawn_x,
  spawn_y = excluded.spawn_y,
  spawn_z = excluded.spawn_z,
  spawn_rotation = excluded.spawn_rotation,
  fog_color = excluded.fog_color,
  fog_density = excluded.fog_density,
  ambient_light_intensity = excluded.ambient_light_intensity;
