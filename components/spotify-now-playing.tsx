'use client';

import useSWR from 'swr';
import { SiSpotify as SpotifyIcon } from 'react-icons/si';
import { Card, CardContent } from '@/components/ui/card';

type Track = {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumArt: string;
  url: string;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Spotify API error');
    return res.json();
  });

export default function SpotifyNowPlaying() {
  const { data, error } = useSWR<Track>('/api/spotify/now-playing', fetcher, {
    refreshInterval: 10000,
  });

  if (error) {
    return (
      <Card className="block w-full border-red-200 bg-red-50">
        <CardContent className="text-red-700">Error loading Spotify</CardContent>
      </Card>
    );
  }
  if (!data) {
    return (
      <Card className="block w-full animate-pulse">
        <CardContent>Loading…</CardContent>
      </Card>
    );
  }

  const { isPlaying, title, artist, albumArt, url } = data;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full">
      <div className="flex items-center rounded-lg shadow p-4 hover:shadow-lg transition-shadow bg-card text-card-foreground">
        {/* Album Art */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
          <img src={albumArt} alt={`${title} album art`} className="w-full h-full object-cover" />
        </div>

        {/* Track Info */}
        <div className="flex-1 ml-4 overflow-hidden">
          <h3 className="text-base font-semibold truncate">{title}</h3>
          <p className="text-sm text-muted-foreground truncate mt-1">{artist}</p>
        </div>

        {/* Badge + Spotify Icon */}
        <div className="flex flex-col items-end ml-4 space-y-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium ${
              isPlaying ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {isPlaying ? 'Now Playing' : 'Last Played'}
          </span>
          <SpotifyIcon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </a>
  );
}
