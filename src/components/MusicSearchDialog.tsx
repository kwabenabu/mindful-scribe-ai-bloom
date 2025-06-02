
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchMusic, formatDuration, type MusicTrack } from '@/utils/musicSearch';
import { Search, Music, Play, ExternalLink, Clock } from 'lucide-react';

interface MusicSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: MusicTrack) => void;
}

const MusicSearchDialog: React.FC<MusicSearchDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSelectTrack 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMusic(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching music:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrack(track);
    onSelectTrack(track);
    onClose();
  };

  const handlePlayPreview = (previewUrl: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // For now, just open the preview URL in a new tab
    // In a real implementation, you'd use an audio player
    window.open(previewUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Search Music
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearching && (
              <div className="text-center py-8 text-gray-500">
                Searching for music...
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No music found for "{searchQuery}"
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-8 text-gray-500">
                <Music className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Start typing to search for music</p>
                <p className="text-sm">Find songs to associate with your journal entry</p>
              </div>
            )}

            <div className="space-y-3">
              {searchResults.map((track) => (
                <Card 
                  key={track.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectTrack(track)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {track.coverArtUrl && (
                        <img 
                          src={track.coverArtUrl} 
                          alt={`${track.album} cover`}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
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
                            onClick={(e) => handlePlayPreview(track.previewUrl!, e)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            Preview
                          </Button>
                        )}
                        
                        <div className="flex gap-1">
                          {track.spotifyUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(track.spotifyUrl, '_blank');
                              }}
                              className="p-1 h-8 w-8"
                              title="Open in Spotify"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          {track.appleMusicUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(track.appleMusicUrl, '_blank');
                              }}
                              className="p-1 h-8 w-8"
                              title="Open in Apple Music"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MusicSearchDialog;
