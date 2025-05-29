
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Star, Check, X } from 'lucide-react';
import type { DetectedEvent } from '@/utils/eventDetection';

interface EventDetectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  detectedEvents: DetectedEvent[];
  journalEntryId?: number;
  onEventsConfirmed: () => void;
}

const EventDetectionDialog: React.FC<EventDetectionDialogProps> = ({
  isOpen,
  onClose,
  detectedEvents,
  journalEntryId,
  onEventsConfirmed
}) => {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set(detectedEvents.filter(e => e.confidence >= 0.85).map(e => e.id))
  );
  const [editingEvents, setEditingEvents] = useState<{ [key: string]: DetectedEvent }>({});
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleEventToggle = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleEventEdit = (eventId: string, field: string, value: string) => {
    setEditingEvents(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId] || detectedEvents.find(e => e.id === eventId)!,
        [field]: value
      }
    }));
  };

  const getEventData = (eventId: string): DetectedEvent => {
    return editingEvents[eventId] || detectedEvents.find(e => e.id === eventId)!;
  };

  const handleConfirmEvents = async () => {
    if (!user || selectedEvents.size === 0) return;

    setIsSaving(true);
    try {
      const eventsToSave = Array.from(selectedEvents).map(eventId => {
        const event = getEventData(eventId);
        return {
          user_id: user.id,
          journal_entry_id: journalEntryId,
          event_title: event.title,
          event_description: event.description,
          event_date: event.date || null,
          event_time: event.time || null,
          event_datetime: event.datetime || null,
          duration_minutes: event.duration || 30,
          location: event.location || null,
          confidence_score: event.confidence,
          status: 'pending'
        };
      });

      const { error } = await supabase
        .from('detected_events')
        .insert(eventsToSave);

      if (error) throw error;

      toast({
        title: "Events Detected",
        description: `${selectedEvents.size} events have been saved for calendar integration`,
      });

      onEventsConfirmed();
      onClose();
    } catch (error) {
      console.error('Error saving detected events:', error);
      toast({
        title: "Error",
        description: "Failed to save detected events",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events Detected in Your Journal Entry
          </DialogTitle>
          <DialogDescription>
            We found {detectedEvents.length} potential events in your journal entry. 
            Review and select which events you'd like to add to your calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {detectedEvents.map((event) => {
            const eventData = getEventData(event.id);
            const isSelected = selectedEvents.has(event.id);

            return (
              <Card key={event.id} className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleEventToggle(event.id)}
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
                        onChange={(e) => handleEventEdit(event.id, 'title', e.target.value)}
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
                        onChange={(e) => handleEventEdit(event.id, 'duration', e.target.value)}
                        placeholder="30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`date-${event.id}`}>Date</Label>
                      <Input
                        id={`date-${event.id}`}
                        value={eventData.date || ''}
                        onChange={(e) => handleEventEdit(event.id, 'date', e.target.value)}
                        placeholder="e.g., Monday, tomorrow"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`time-${event.id}`}>Time</Label>
                      <Input
                        id={`time-${event.id}`}
                        value={eventData.time || ''}
                        onChange={(e) => handleEventEdit(event.id, 'time', e.target.value)}
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
                        onChange={(e) => handleEventEdit(event.id, 'location', e.target.value)}
                        placeholder="Event location"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`description-${event.id}`}>Description</Label>
                      <Textarea
                        id={`description-${event.id}`}
                        value={eventData.description || ''}
                        onChange={(e) => handleEventEdit(event.id, 'description', e.target.value)}
                        placeholder="Event description"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedEvents.size} of {detectedEvents.length} events selected
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmEvents} 
              disabled={selectedEvents.size === 0 || isSaving}
            >
              {isSaving ? 'Saving...' : `Confirm ${selectedEvents.size} Events`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetectionDialog;
