export const ALL_GENRES = [
  'Acid', 'Adult Contemporary', 'Afro', 'Afro House', 'Afrobeats', 'Alternative', 'Ambient',
  'Bachata', 'Balearic', 'Bass', 'Bass House', 'Bassline', 'Big Room', 'Brazilian', 'Breaks',
  'Broken Beat', 'Calypso', 'Chill Out', 'Cinematic', 'Classic House', 'Classics', 'Coldwave',
  'Country', 'Cumbia', 'Dance', 'Dancehall', 'Dark Disco', 'Deep House', 'Deep Tech', 'Dirty Dubstep',
  'Disco', 'DJ Tools', 'Downtempo', 'Drum and Bass', 'Dub', 'Dubstep', 'EDM', 'Electro',
  'Electro House', 'Electronic', 'Electronica', 'Euro', 'Euro Dance', 'Experimental', 'Freestyle',
  'Funk', 'Funky House', 'Future Bass', 'Future House', 'G-House', 'Garage', 'Groovy House',
  'Grime', 'Hard Dance', 'Hardcore', 'Hardstyle', 'Hip Hop', 'Holiday', 'House', 'Indie',
  'Indie Dance', "Jackin' House", 'Jungle', 'Latin', 'Leftfield', 'Leftfield Bass', 'Lo-Fi',
  'Lounge', 'Lovers Rock', 'Melbourne Bounce', 'Melodic House & Techno', 'Merengue', 'Minimal',
  'Miscellaneous', 'Moombahton', 'Nu Disco', 'Nu-Jazz', 'Old School', 'Organic House', 'Pop',
  'Pop Dance', 'Progressive', 'Progressive House', 'Psy-Trance', 'R&B', 'Rap', 'Reggae',
  'Reggaeton', 'Rock', 'Roots', 'Salsa', 'Soca', 'Soul', 'Soulful', 'Soulful House', 'Synth',
  'Tech', 'Tech House', 'Techno', 'Top 40', 'Trance', 'Trap', 'Tropical House', 'Twerk',
  'Uplifting', 'Urban', 'Urban DJ Tools', 'Vocal', 'Vocal House'
] as const;

export type Genre = typeof ALL_GENRES[number] | string;

export const POPULAR_GENRES = [
  'Drum and Bass',
  'Trap',
  'House',
  'Techno',
  'Lo-Fi',
  'Hip Hop',
  'Ambient',
  'Dubstep',
  'Garage',
  'R&B',
  'Synth',
  'Afrobeats'
] as const;

export const ALL_INSTRUMENTS = [
  'Drums', 'Kicks', 'Snares', 'Hats', 'Percussion', 'Vocals', 'Synth', 'Piano', 'Keys',
  '808', 'Guitar', 'Bass', 'Strings', 'Brass', 'FX', 'Pads', 'Leads'
] as const;

export type Instrument = typeof ALL_INSTRUMENTS[number];

export const ALL_TYPES = ['One-shot', 'Loop', 'MIDI', 'Preset'] as const;
export type SoundType = typeof ALL_TYPES[number];

export const MUSICAL_KEYS = [
  'C maj', 'C min', 'C# maj', 'C# min',
  'D maj', 'D min', 'D# maj', 'D# min',
  'E maj', 'E min',
  'F maj', 'F min', 'F# maj', 'F# min',
  'G maj', 'G min', 'G# maj', 'G# min',
  'A maj', 'A min', 'A# maj', 'A# min',
  'B maj', 'B min'
];

export interface Sound {
  id: string;
  title: string;
  audio: string; // URL or generated blob URL
  genre: string[];
  instrument: string;
  type: SoundType;
  key: string;
  bpm: number;
  tags: string[];
  duration: number; // in seconds (can be 10 - 60s)
  downloads: number;
  pack_id?: string;
  source: 'admin' | 'user';
  uploaded_by?: string;
  uploaded_by_email?: string;
  status: 'pending' | 'approved' | 'rejected';
  feature_vector: number[]; // spectral centroid, rolloff, zcr, rms, bpm, etc.
  created_at: string;
}

export interface Pack {
  id: string;
  title: string;
  genre: string;
  description: string;
  coverImage: string;
  soundCount: number;
  tags: string[];
  downloadCount: number;
  featured?: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
}

export type SortOption = 'newest' | 'popular' | 'downloads';
