
// Mock music search utility - replace with actual API integration later
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  previewUrl?: string;
  coverArtUrl?: string;
  duration?: number;
}

// Mock data for demonstration - replace with actual Spotify/Apple Music API calls
const mockTracks: MusicTrack[] = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    spotifyUrl: "https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv",
    appleMusicUrl: "https://music.apple.com/us/album/bohemian-rhapsody/1440806041?i=1440806049",
    previewUrl: "https://p.scdn.co/mp3-preview/4u7EnebtmKWzUH433cf5Qv",
    coverArtUrl: "https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a",
    duration: 355
  },
  {
    id: "2",
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    spotifyUrl: "https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9",
    appleMusicUrl: "https://music.apple.com/us/album/imagine/1440650428?i=1440650512",
    previewUrl: "https://p.scdn.co/mp3-preview/7pKfPomDEeI4TPT6EOYjn9",
    coverArtUrl: "https://i.scdn.co/image/ab67616d0000b273d03ab10c4f8e115496abdfab",
    duration: 183
  },
  {
    id: "3",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    spotifyUrl: "https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv",
    appleMusicUrl: "https://music.apple.com/us/album/hotel-california/1454269663?i=1454269678",
    previewUrl: "https://p.scdn.co/mp3-preview/40riOy7x9W7GXjyGp4pjAv",
    coverArtUrl: "https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69",
    duration: 391
  },
  {
    id: "4",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    spotifyUrl: "https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5",
    appleMusicUrl: "https://music.apple.com/us/album/billie-jean/1440892582?i=1440892608",
    previewUrl: "https://p.scdn.co/mp3-preview/5ChkMS8OtdzJeqyybCc9R5",
    coverArtUrl: "https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586b97",
    duration: 294
  },
  {
    id: "5",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    spotifyUrl: "https://open.spotify.com/track/7o2CTH4ctstm8TNelqjb51",
    appleMusicUrl: "https://music.apple.com/us/album/sweet-child-o-mine/1440879061?i=1440879104",
    previewUrl: "https://p.scdn.co/mp3-preview/7o2CTH4ctstm8TNelqjb51",
    coverArtUrl: "https://i.scdn.co/image/ab67616d0000b273a1c6018ded35ded5e8adee0a",
    duration: 356
  }
];

export const searchMusic = async (query: string): Promise<MusicTrack[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!query.trim()) {
    return [];
  }
  
  // Mock search - filter tracks based on query
  const searchTerm = query.toLowerCase();
  return mockTracks.filter(track => 
    track.title.toLowerCase().includes(searchTerm) ||
    track.artist.toLowerCase().includes(searchTerm) ||
    track.album.toLowerCase().includes(searchTerm)
  );
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
