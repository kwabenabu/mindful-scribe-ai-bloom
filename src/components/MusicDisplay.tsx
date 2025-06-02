
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Play, ExternalLink, Clock, X } from 'lucide-react';
import { formatDuration, type MusicTrack } from '@/utils/musicSearch';

interface MusicDisplayProps {
  track: MusicTrack;
  onRemove?: () => void;
  compact?: boolean;
}

const MusicDisplay: React.FC<MusicDisplayProps> = ({ 
  track, 
  onRemove, 
  compact = false 
}) => {
  const handlePlayPreview = () => {
    if (track.previewUrl) {
      // For now, just open the preview URL in a new tab
      // In a real implementation, you'd use an audio player
      window.open(track.previewUrl, '_blank');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        {track.coverArtUrl && (
          <img 
            src={track.coverArtUrl} 
            alt={`${track.album} cover`}
            className="w-12 h-12 rounded object-cover"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">
            {track.title}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {track.artist} • {track.album}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {track.previewUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPreview}
              className="h-8 w-8 p-0"
              title="Play preview"
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
          
          {(track.spotifyUrl || track.appleMusicUrl) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = track.spotifyUrl || track.appleMusicUrl;
                if (url) window.open(url, '_blank');
              }}
              className="h-8 w-8 p-0"
              title="Open in music app"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}

          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="Remove music"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {track.coverArtUrl ? (
            <img 
              src={track.coverArtUrl} 
              alt={`${track.album} cover`}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
              <Music className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {track.title}
            </h3>
            <p className="text-gray-600 truncate">{track.artist}</p>
            <p className="text-sm text-gray-500 truncate">{track.album}</p>
            
            <div className="flex items-center gap-2 mt-2">
              {track.duration && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(track.duration)}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {track.previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPreview}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Preview
              </Button>
            )}
            
            <div className="flex gap-2">
              {track.spotifyUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(track.spotifyUrl, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Spotify
                </Button>
              )}
              {track.appleMusicUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(track.appleMusicUrl, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Apple
                </Button>
              )}
            </div>

            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicDisplay;
