export type SeedBookStatus = 'published' | 'draft' | 'hidden' | 'archived'

export type SeedBook = {
  slug: string
  title: string
  author: string
  genre: string
  coverImageUrl: string
  description: string
  longDescription: string
  rating: number
  pages: number
  year: number
  tags: string[]
  chapters: string[]
  status: SeedBookStatus
  accessType: 'free' | 'registered' | 'premium'
  featured?: boolean
  isNew?: boolean
}

export const SEED_BOOKS: SeedBook[] = [
  {
    slug: 'the-enchanted-garden',
    title: 'The Enchanted Garden',
    author: 'Eleanor Whitmore',
    genre: 'Fantasy',
    coverImageUrl:
      'https://images.unsplash.com/photo-1762119594563-fc90dabb6161?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'A young girl discovers a hidden garden behind a crumbling stone wall, where flowers whisper ancient secrets and time flows differently.',
    longDescription:
      'When twelve-year-old Mira stumbles upon a hidden garden behind a crumbling stone wall, she enters a world where flowers speak in hushed voices and time moves like honey.',
    rating: 4.8,
    pages: 264,
    year: 2023,
    tags: ['Magic', 'Nature', 'Mystery', 'Coming of age'],
    chapters: [
      'The Stone Wall',
      'First Bloom',
      'The Whispering Rose',
      'Roots & Secrets',
      'The Old Oak',
      'Rain & Remembrance',
      'A Century Asleep',
      'The Garden Awakens',
    ],
    status: 'published',
    accessType: 'free',
    featured: true,
  },
  {
    slug: 'sailing-to-tomorrow',
    title: 'Sailing to Tomorrow',
    author: 'James R. Caldwell',
    genre: 'Adventure',
    coverImageUrl:
      'https://images.unsplash.com/photo-1583502071282-169ac4fead6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'A brave captain and her motley crew chart a course through uncharted waters to find the legendary island at the edge of the world.',
    longDescription:
      'Captain Lena Marsh has sailed every charted sea, but one map still eludes her — the one that leads to the Isle of Endings.',
    rating: 4.6,
    pages: 312,
    year: 2023,
    tags: ['Ocean', 'Adventure', 'Illustrated', 'Epic Journey'],
    chapters: [
      'The Last Known Port',
      'Winds of Chance',
      'The Crew of Misfits',
      'Uncharted Waters',
      'Storm at the Meridian',
      'The Singing Depths',
      'Isle of Endings',
      'The Map Redrawn',
    ],
    status: 'published',
    accessType: 'free',
    featured: true,
  },
  {
    slug: 'the-whispering-woods',
    title: 'The Whispering Woods',
    author: 'Clara Song',
    genre: 'Mystery',
    coverImageUrl:
      'https://images.unsplash.com/photo-1669580141374-24ec0a4184b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'Deep in an ancient forest, trees remember every secret ever spoken beneath their boughs — and one detective must listen.',
    longDescription:
      'Detective Sora Kian has solved murders, thefts, and disappearances — but never anything like this.',
    rating: 4.7,
    pages: 288,
    year: 2024,
    tags: ['Forest', 'Mystery', 'Detective', 'Nature Magic'],
    chapters: [
      'The First Creak',
      'Missing in Aldenmere',
      'Root Languages',
      'The Listening Detective',
      'Bark and Memory',
      'What the Oldest Elm Knows',
      'The Silent Clearing',
      'Canopy of Truth',
    ],
    status: 'published',
    accessType: 'registered',
    featured: true,
    isNew: true,
  },
  {
    slug: 'castle-of-starlight',
    title: 'Castle of Starlight',
    author: 'Theo Brightman',
    genre: 'Fantasy',
    coverImageUrl:
      'https://images.unsplash.com/photo-1562576650-27130b06c0ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'High above the clouds, a castle built from captured starlight holds the most dangerous library in the known world.',
    longDescription:
      'The Castle of Starlight was built from stars that fell willing from the sky.',
    rating: 4.5,
    pages: 340,
    year: 2022,
    tags: ['Castle', 'Fantasy', 'Library', 'Stars'],
    chapters: [
      'The Cloud Gate',
      'Forbidden Shelves',
      'Star-Bound Pages',
      'The Expanding Void',
      "Archivist's Oath",
      'Books That Breathe',
      'The Empty Shelf',
      'Starfall',
    ],
    status: 'published',
    accessType: 'premium',
  },
  {
    slug: 'cherry-blossom-letters',
    title: 'Cherry Blossom Letters',
    author: 'Yuki Tanaka',
    genre: 'Romance',
    coverImageUrl:
      'https://images.unsplash.com/photo-1606337740587-3aee763fec8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'Two strangers exchange handwritten letters folded into paper cranes, falling in love through words alone across an ocean of distance.',
    longDescription:
      'Every spring when the cherry trees bloom, Hana folds her letters into paper cranes and releases them to the wind.',
    rating: 4.9,
    pages: 220,
    year: 2024,
    tags: ['Romance', 'Letters', 'Spring', 'Watercolor'],
    chapters: [
      'The First Crane',
      'Paper and Distance',
      'Petals in an Envelope',
      'A Voice in Ink',
      'The Second Spring',
      'Between the Lines',
      'Unfolded',
      'When the Blossoms Return',
    ],
    status: 'published',
    accessType: 'free',
    isNew: true,
  },
  {
    slug: 'the-little-lighthouse',
    title: 'The Little Lighthouse',
    author: 'Anne Marsh',
    genre: "Children's",
    coverImageUrl:
      'https://images.unsplash.com/photo-1761143975038-60d58e429841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'A tiny lighthouse on a rocky island wonders if its small light can still guide great ships home on the stormiest nights.',
    longDescription:
      'The Little Lighthouse stands alone on a rocky island at the edge of the sea.',
    rating: 4.9,
    pages: 48,
    year: 2023,
    tags: ["Children's", 'Illustrated', 'Sea', 'Courage'],
    chapters: ['The Rocky Island', 'The Big Storm', 'A Small Light Shines', 'Home'],
    status: 'draft',
    accessType: 'free',
  },
  {
    slug: 'a-dragons-diary',
    title: "A Dragon's Diary",
    author: 'Felix Dorn',
    genre: 'Humor',
    coverImageUrl:
      'https://images.unsplash.com/photo-1710974269629-bcbbdcf43245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'The secret journal of Ember the dragon, who is absolutely terrible at being terrifying and rather too fond of baking.',
    longDescription:
      'Dear Diary, today I tried to breathe fire at the village and accidentally made crème brûlée.',
    rating: 4.7,
    pages: 196,
    year: 2024,
    tags: ['Humor', 'Dragon', 'Illustrated', 'Cozy'],
    chapters: [
      'Monday: Terrible at Terror',
      'The Crème Brûlée Incident',
      'Fan Mail from the Village',
      "A Dragon's Kitchen",
      'The Bake-Off of Doom',
      'Too Many Friends',
      'The Legend of Ember',
    ],
    status: 'hidden',
    accessType: 'registered',
    isNew: true,
  },
  {
    slug: 'midnight-in-the-museum',
    title: 'Midnight in the Museum',
    author: 'Isabelle Dumont',
    genre: 'Mystery',
    coverImageUrl:
      'https://images.unsplash.com/photo-1761990386557-fde67968209c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    description:
      'After the museum closes, the paintings come alive — but someone is stealing the stories from inside the frames.',
    longDescription:
      'Every night at midnight, the paintings in the Grand Museum stir to life.',
    rating: 4.6,
    pages: 276,
    year: 2022,
    tags: ['Museum', 'Art', 'Mystery', 'Night'],
    chapters: [
      'The Midnight Bell',
      'Waking Canvases',
      'The Empty Frame',
      "A Portrait's Testimony",
      'The Thief of Stories',
      "Clio's Watch",
      'Paint and Truth',
      "Dawn's Stillness",
    ],
    status: 'archived',
    accessType: 'premium',
  },
]

/** Pages per chapter in local seed assets (fewer = faster testing). */
export const READER_PAGES_PER_CHAPTER = 4

/** Distinct chapter page sets when seeding (2 chapters for read/finished testing). */
export const SEED_READER_CHAPTER_COUNT = 2
