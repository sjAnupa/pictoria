export type BookStatus = "Published" | "Draft" | "Hidden" | "Archived";

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
  description: string;
  longDescription: string;
  rating: number;
  pages: number;
  year: number;
  tags: string[];
  chapters: string[];
  status: BookStatus;
  accessType: "free" | "registered" | "premium";
  featured?: boolean;
  isNew?: boolean;
}

export const books: Book[] = [
  {
    id: "1",
    slug: "the-enchanted-garden",
    title: "The Enchanted Garden",
    author: "Eleanor Whitmore",
    genre: "Fantasy",
    coverImage:
      "https://images.unsplash.com/photo-1762119594563-fc90dabb6161?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmNvbG9yJTIwY296eSUyMGNvdHRhZ2UlMjBnYXJkZW4lMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzc1MDI4NTIxfDA&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "A young girl discovers a hidden garden behind a crumbling stone wall, where flowers whisper ancient secrets and time flows differently.",
    longDescription:
      "When twelve-year-old Mira stumbles upon a hidden garden behind a crumbling stone wall, she enters a world where flowers speak in hushed voices and time moves like honey. Each bloom holds a memory, each petal a story waiting to be heard. As Mira tends to the forgotten garden, she unravels a century-old mystery woven into the roots of the oldest oak. A magical journey about finding beauty in forgotten places and courage in quiet moments.",
    rating: 4.8,
    pages: 264,
    year: 2023,
    tags: ["Magic", "Nature", "Mystery", "Coming of Age"],
    chapters: [
      "The Stone Wall",
      "First Bloom",
      "The Whispering Rose",
      "Roots & Secrets",
      "The Old Oak",
      "Rain & Remembrance",
      "A Century Asleep",
      "The Garden Awakens",
    ],
    status: "Published",
    accessType: "free",
    featured: true,
  },
  {
    id: "2",
    slug: "sailing-to-tomorrow",
    title: "Sailing to Tomorrow",
    author: "James R. Caldwell",
    genre: "Adventure",
    coverImage:
      "https://images.unsplash.com/photo-1583502071282-169ac4fead6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwb2NlYW4lMjBzYWlsaW5nJTIwYWR2ZW50dXJlJTIwaWxsdXN0cmF0aW9uJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzc1MDI4NTIxfDA&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "A brave captain and her motley crew chart a course through uncharted waters to find the legendary island at the edge of the world.",
    longDescription:
      "Captain Lena Marsh has sailed every charted sea, but one map still eludes her — the one that leads to the Isle of Endings. With a crew of misfits and dreamers, she sets sail into waters no compass can read. Illustrated with golden-ink charts and tempest-tossed paintings, this adventure is a love letter to the horizon and everyone who dares to chase it.",
    rating: 4.6,
    pages: 312,
    year: 2023,
    tags: ["Ocean", "Adventure", "Illustrated", "Epic Journey"],
    chapters: [
      "The Last Known Port",
      "Winds of Chance",
      "The Crew of Misfits",
      "Uncharted Waters",
      "Storm at the Meridian",
      "The Singing Depths",
      "Isle of Endings",
      "The Map Redrawn",
    ],
    status: "Published",
    accessType: "free",
    featured: true,
  },
  {
    id: "3",
    slug: "the-whispering-woods",
    title: "The Whispering Woods",
    author: "Clara Song",
    genre: "Mystery",
    coverImage:
      "https://images.unsplash.com/photo-1669580141374-24ec0a4184b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwZm9yZXN0JTIwZW5jaGFudGVkJTIwaWxsdXN0cmF0aW9uJTIwYXJ0d29ya3xlbnwxfHx8fDE3NzUwMjg1MTd8MA&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "Deep in an ancient forest, trees remember every secret ever spoken beneath their boughs — and one detective must listen.",
    longDescription:
      "Detective Sora Kian has solved murders, thefts, and disappearances — but never anything like this. The trees in Aldenmere Forest are speaking. Not in words exactly, but in creaks and rustles that only she can decode. When the village's oldest elder vanishes without a trace, Sora must learn the language of bark and root before the forest closes its canopy for good.",
    rating: 4.7,
    pages: 288,
    year: 2024,
    tags: ["Forest", "Mystery", "Detective", "Nature Magic"],
    chapters: [
      "The First Creak",
      "Missing in Aldenmere",
      "Root Languages",
      "The Listening Detective",
      "Bark and Memory",
      "What the Oldest Elm Knows",
      "The Silent Clearing",
      "Canopy of Truth",
    ],
    status: "Published",
    accessType: "registered",
    featured: true,
    isNew: true,
  },
  {
    id: "4",
    slug: "castle-of-starlight",
    title: "Castle of Starlight",
    author: "Theo Brightman",
    genre: "Fantasy",
    coverImage:
      "https://images.unsplash.com/photo-1562576650-27130b06c0ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbGx1c3RyYXRlZCUyMGNhc3RsZSUyMGtpbmdkb20lMjBmYW50YXN5JTIwYXJ0JTIwbWVkaWV2YWx8ZW58MXx8fHwxNzc1MDI4NTIyfDA&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "High above the clouds, a castle built from captured starlight holds the most dangerous library in the known world.",
    longDescription:
      "The Castle of Starlight was built from stars that fell willing from the sky. Its library contains books that should never be opened, histories that rewrite themselves, and one empty shelf that grows larger each day. Young archivist Pip must protect the castle's most forbidden secret before the shelf swallows everything ever written.",
    rating: 4.5,
    pages: 340,
    year: 2022,
    tags: ["Castle", "Fantasy", "Library", "Stars"],
    chapters: [
      "The Cloud Gate",
      "Forbidden Shelves",
      "Star-Bound Pages",
      "The Expanding Void",
      "Archivist's Oath",
      "Books That Breathe",
      "The Empty Shelf",
      "Starfall",
    ],
    status: "Published",
    accessType: "premium",
    featured: false,
    isNew: false,
  },
  {
    id: "5",
    slug: "cherry-blossom-letters",
    title: "Cherry Blossom Letters",
    author: "Yuki Tanaka",
    genre: "Romance",
    coverImage:
      "https://images.unsplash.com/photo-1606337740587-3aee763fec8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGltc2ljYWwlMjBmYWlyeSUyMHRhbGUlMjBpbGx1c3RyYXRlZCUyMGJvb2slMjBhcnR8ZW58MXx8fHwxNzc1MDI4NTE2fDA&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "Two strangers exchange handwritten letters folded into paper cranes, falling in love through words alone across an ocean of distance.",
    longDescription:
      "Every spring when the cherry trees bloom, Hana folds her letters into paper cranes and releases them to the wind. She never expects a reply — until one lands on her balcony, carrying words from someone who signs only as 'K.' Beautifully illustrated with watercolor blossoms and hand-lettered text, this is a quiet love story about patience, distance, and the extraordinary courage of writing honestly.",
    rating: 4.9,
    pages: 220,
    year: 2024,
    tags: ["Romance", "Letters", "Spring", "Watercolor"],
    chapters: [
      "The First Crane",
      "Paper and Distance",
      "Petals in an Envelope",
      "A Voice in Ink",
      "The Second Spring",
      "Between the Lines",
      "Unfolded",
      "When the Blossoms Return",
    ],
    status: "Published",
    accessType: "free",
    featured: false,
    isNew: true,
  },
  {
    id: "6",
    slug: "the-little-lighthouse",
    title: "The Little Lighthouse",
    author: "Anne Marsh",
    genre: "Children's",
    coverImage:
      "https://images.unsplash.com/photo-1761143975038-60d58e429841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbGx1c3RyYXRlZCUyMGNoaWxkcmVuJTIwc3Rvcnlib29rJTIwZmFudGFzeSUyMGNvdmVyJTIwYXJ0fGVufDF8fHx8MTc3NTAyODUxNnww&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "A tiny lighthouse on a rocky island wonders if its small light can still guide great ships home on the stormiest nights.",
    longDescription:
      "The Little Lighthouse stands alone on a rocky island at the edge of the sea. The great lighthouses on the mainland shine brighter and taller. But when a storm rolls in and every light on the coast goes dark, it is the small, steady glow of the little lighthouse that guides the fishing fleet safely home. A tender story about believing in your own quiet importance.",
    rating: 4.9,
    pages: 48,
    year: 2023,
    tags: ["Children's", "Illustrated", "Sea", "Courage"],
    chapters: [
      "The Rocky Island",
      "The Big Storm",
      "A Small Light Shines",
      "Home",
    ],
    status: "Draft",
    accessType: "free",
    featured: false,
    isNew: false,
  },
  {
    id: "7",
    slug: "a-dragons-diary",
    title: "A Dragon's Diary",
    author: "Felix Dorn",
    genre: "Humor",
    coverImage:
      "https://images.unsplash.com/photo-1710974269629-bcbbdcf43245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwaWxsdXN0cmF0ZWQlMjBhZHZlbnR1cmUlMjBib29rJTIwY292ZXIlMjBwYWludGluZ3xlbnwxfHx8fDE3NzUwMjg1MTZ8MA&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "The secret journal of Ember the dragon, who is absolutely terrible at being terrifying and rather too fond of baking.",
    longDescription:
      "Dear Diary, today I tried to breathe fire at the village and accidentally made crème brûlée. The villagers gave me a standing ovation. This is not going well. Ember the dragon wanted to be fearsome and legendary, but somehow ended up becoming the most beloved creature in three kingdoms — mostly because his scones are extraordinary. A gloriously funny illustrated diary of accidental kindness.",
    rating: 4.7,
    pages: 196,
    year: 2024,
    tags: ["Humor", "Dragon", "Illustrated", "Cozy"],
    chapters: [
      "Monday: Terrible at Terror",
      "The Crème Brûlée Incident",
      "Fan Mail from the Village",
      "A Dragon's Kitchen",
      "The Bake-Off of Doom",
      "Too Many Friends",
      "The Legend of Ember",
    ],
    status: "Hidden",
    accessType: "registered",
    featured: false,
    isNew: true,
  },
  {
    id: "8",
    slug: "midnight-in-the-museum",
    title: "Midnight in the Museum",
    author: "Isabelle Dumont",
    genre: "Mystery",
    coverImage:
      "https://images.unsplash.com/photo-1761990386557-fde67968209c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwcmVhZGluZyUyMG5vb2slMjB3YXJtJTIwbGlicmFyeSUyMGludGVyaW9yfGVufDF8fHx8MTc3NTAyODUyMnww&ixlib=rb-4.1.0&q=80&w=800",
    description:
      "After the museum closes, the paintings come alive — but someone is stealing the stories from inside the frames.",
    longDescription:
      "Every night at midnight, the paintings in the Grand Museum stir to life. Landscapes breathe, portraits gossip, and historical scenes replay themselves in whispers. But lately, something is wrong. The characters inside the paintings are vanishing, leaving empty canvases behind. Young night-guard apprentice Clio must solve the mystery before art itself disappears.",
    rating: 4.6,
    pages: 276,
    year: 2022,
    tags: ["Museum", "Art", "Mystery", "Night"],
    chapters: [
      "The Midnight Bell",
      "Waking Canvases",
      "The Empty Frame",
      "A Portrait's Testimony",
      "The Thief of Stories",
      "Clio's Watch",
      "Paint and Truth",
      "Dawn's Stillness",
    ],
    status: "Archived",
    accessType: "premium",
    featured: false,
    isNew: false,
  },
];

export function getBookById(id: string): Book | undefined {
  return books.find((b) => b.id === id);
}

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export const featuredBooks = books.filter((b) => b.featured);
export const newBooks = books.filter((b) => b.isNew);
