export interface MasterpieceArt {
  id: string;
  title: string;
  artist: string;
  year: string;
  medium: string;
  location: string;
  imageUrl: string;
  description: string;
}

export const ONLINE_MASTERPIECES: MasterpieceArt[] = [
  {
    id: 'great-wave',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: 'c. 1831',
    medium: 'Woodblock print; ink and color on paper',
    location: 'Tokyo National Museum / Met Museum',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=640&q=70',
    description: 'An iconic Japanese ukiyo-e woodblock print depicting towering waves framing Mount Fuji in the background.'
  },
  {
    id: 'starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    medium: 'Oil on canvas',
    location: 'Museum of Modern Art (MoMA), New York',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=640&q=70',
    description: 'Vibrant, swirling post-impressionist masterpiece capturing the nocturnal sky over Saint-Rémy-de-Provence.'
  },
  {
    id: 'water-lilies',
    title: 'Water Lilies (Nymphéas)',
    artist: 'Claude Monet',
    year: '1906',
    medium: 'Oil on canvas',
    location: 'Musée de l’Orangerie, Paris',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=640&q=70',
    description: 'Monet’s luminous impressionist exploration of light, reflections, and flora in his Giverny water garden.'
  },
  {
    id: 'girl-pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: 'c. 1665',
    medium: 'Oil on canvas',
    location: 'Mauritshuis, The Hague',
    imageUrl: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=640&q=70',
    description: 'Dutch Golden Age tronie painting celebrated for Vermeer’s delicate treatment of chiaroscuro and gaze.'
  },
  {
    id: 'wanderer-fog',
    title: 'Wanderer above the Sea of Fog',
    artist: 'Caspar David Friedrich',
    year: '1818',
    medium: 'Oil on canvas',
    location: 'Hamburger Kunsthalle, Hamburg',
    imageUrl: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=640&q=70',
    description: 'A cornerstone of Romanticism depicting an introspective traveler atop a rocky precipice overlooking a misty expanse.'
  },
  {
    id: 'grande-jatte',
    title: 'A Sunday on La Grande Jatte',
    artist: 'Georges Seurat',
    year: '1884–1886',
    medium: 'Oil on canvas',
    location: 'Art Institute of Chicago',
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=640&q=70',
    description: 'The monumental pointillist canvas depicting Parisians relaxing in a park along the River Seine.'
  },
  {
    id: 'mona-lisa',
    title: 'Mona Lisa (La Gioconda)',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503–1519',
    medium: 'Oil on poplar panel',
    location: 'Musée du Louvre, Paris',
    imageUrl: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=640&q=70',
    description: 'The most renowned Renaissance portrait, distinguished by Leonardo’s masterly sfumato technique and enigmatic expression.'
  },
  {
    id: 'classical-sculpture',
    title: 'Classical Hellenistic & Roman Study',
    artist: 'Antiquity Masters',
    year: 'c. 2nd Century BCE',
    medium: 'Carved Parian Marble',
    location: 'Capitoline Museums, Rome',
    imageUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=640&q=70',
    description: 'Classical marble sculpture celebrated for anatomical naturalism, dynamic drapery, and heroic poise.'
  },
  {
    id: 'impressionist-sunflowers',
    title: 'Sunflowers in Golden Amber',
    artist: 'Vincent van Gogh',
    year: '1888',
    medium: 'Oil on canvas',
    location: 'National Gallery, London',
    imageUrl: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?auto=format&fit=crop&w=640&q=70',
    description: 'Exuberant study of yellow chromatic harmonies demonstrating Van Gogh’s expressive impasto brushwork.'
  },
  {
    id: 'modernist-composition',
    title: 'Abstract Harmonic Form',
    artist: 'Wassily Kandinsky',
    year: '1923',
    medium: 'Oil and watercolor on canvas',
    location: 'Guggenheim Museum, New York',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=640&q=70',
    description: 'Lyrical abstraction exploring the synesthetic relationship between geometric form, motion, and acoustic resonance.'
  },
  {
    id: 'still-life-canvas',
    title: 'Still Life with Quince and Pomegranates',
    artist: 'Paul Cézanne',
    year: '1899',
    medium: 'Oil on canvas',
    location: 'Musée d’Orsay, Paris',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=640&q=70',
    description: 'Pre-cubist still life study pioneering spatial planes and sculptural brushwork.'
  },
  {
    id: 'renaissance-vault',
    title: 'Sistine Chapel Vault Fresco Study',
    artist: 'Michelangelo Buonarroti',
    year: '1508–1512',
    medium: 'Buon fresco',
    location: 'Vatican Museums, Rome',
    imageUrl: 'https://images.unsplash.com/photo-1579783929437-0cf7f98e7fc1?auto=format&fit=crop&w=640&q=70',
    description: 'Monumental High Renaissance fresco illustrating biblical narratives with peerless anatomical mastery.'
  }
];
