
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from 'lucide-react';
import GoogleCalendarSync from './GoogleCalendarSync';
import EventReviewTab from './EventReviewTab';
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
  const [savedEvents, setSavedEvents] = useState<Array<{
    id: string;
    event_title: string;
    event_description?: string;
    event_date?: string;
    event_time?: string;
    event_datetime?: string;
    duration_minutes?: number;
    location?: string;
    status?: string;
    external_event_id?: string;
  }>>([]);
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
    if (!user || selectedEvents.size === 0) {
      toast({
        title: "No Events Selected",
        description: "Please select at least one event to save",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving events with user_id:', user.id);
      console.log('Journal entry ID:', journalEntryId);
      
      const eventsToSave = Array.from(selectedEvents).map(eventId => {
        const event = getEventData(eventId);
        return {
          user_id: user.id,
          journal_entry_id: journalEntryId || null,
          event_title: event.title,
          event_description: event.description || null,
          event_date: event.date || null,
          event_time: event.time || null,
          event_datetime: event.datetime || null,
          duration_minutes: event.duration || 30,
          location: event.location || null,
          confidence_score: event.confidence,
          status: 'pending'
        };
      });

      console.log('Events to save:', eventsToSave);

      const { data, error } = await supabase
        .from('detected_events')
        .insert(eventsToSave)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Successfully saved events:', data);

      // Transform the data to match GoogleCalendarSync expected format
      setSavedEvents(data.map(event => ({
        id: event.id,
        event_title: event.event_title,
        event_description: event.event_description,
        event_date: event.event_date,
        event_time: event.event_time,
        event_datetime: event.event_datetime,
        duration_minutes: event.duration_minutes,
        location: event.location,
        status: event.status,
        external_event_id: event.external_event_id
      })));

      toast({
        title: "Events Saved",
        description: `${selectedEvents.size} events have been saved for calendar integration`,
      });

    } catch (error) {
      console.error('Error saving detected events:', error);
      toast({
        title: "Error",
        description: `Failed to save detected events: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncComplete = () => {
    onEventsConfirmed();
    onClose();
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

        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review">Review Events</TabsTrigger>
            <TabsTrigger value="sync" disabled={savedEvents.length === 0}>
              Calendar Sync
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4">
            <EventReviewTab
              detectedEvents={detectedEvents}
              selectedEvents={selectedEvents}
              editingEvents={editingEvents}
              isSaving={isSaving}
              onEventToggle={handleEventToggle}
              onEventEdit={handleEventEdit}
              onConfirmEvents={handleConfirmEvents}
              onClose={onClose}
              getEventData={getEventData}
            />
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <GoogleCalendarSync 
              detectedEvents={savedEvents}
              onSyncComplete={handleSyncComplete}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetectionDialog;
