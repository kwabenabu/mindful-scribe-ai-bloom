
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Star, Check, X } from 'lucide-react';
import type { DetectedEvent } from '@/utils/eventDetection';

interface EventCardProps {
  event: DetectedEvent;
  isSelected: boolean;
  eventData: DetectedEvent;
  onToggle: (eventId: string) => void;
  onEdit: (eventId: string, field: string, value: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isSelected,
  eventData,
  onToggle,
  onEdit
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggle(event.id)}
              className="flex items-center gap-2"
            >
              {isSelected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {isSelected ? 'Selected' : 'Select'}
            </Button>
            <Badge className={getConfidenceColor(event.confidence)}>
              <Star className="h-3 w-3 mr-1" />
              {formatConfidence(event.confidence)} confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`title-${event.id}`}>Event Title</Label>
            <Input
              id={`title-${event.id}`}
              value={eventData.title}
              onChange={(e) => onEdit(event.id, 'title', e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`duration-${event.id}`} className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration (minutes)
            </Label>
            <Input
              id={`duration-${event.id}`}
              type="number"
              value={eventData.duration || 30}
              onChange={(e) => onEdit(event.id, 'duration', e.target.value)}
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`date-${event.id}`}>Date</Label>
            <Input
              id={`date-${event.id}`}
              value={eventData.date || ''}
              onChange={(e) => onEdit(event.id, 'date', e.target.value)}
              placeholder="e.g., Monday, tomorrow"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`time-${event.id}`}>Time</Label>
            <Input
              id={`time-${event.id}`}
              value={eventData.time || ''}
              onChange={(e) => onEdit(event.id, 'time', e.target.value)}
              placeholder="e.g., 6:00 PM"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`location-${event.id}`} className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id={`location-${event.id}`}
              value={eventData.location || ''}
              onChange={(e) => onEdit(event.id, 'location', e.target.value)}
              placeholder="Event location"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`description-${event.id}`}>Description</Label>
            <Textarea
              id={`description-${event.id}`}
              value={eventData.description || ''}
              onChange={(e) => onEdit(event.id, 'description', e.target.value)}
              placeholder="Event description"
              rows={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
