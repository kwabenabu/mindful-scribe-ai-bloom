
import React from 'react';
import { Button } from '@/components/ui/button';
import EventCard from './EventCard';
import type { DetectedEvent } from '@/utils/eventDetection';

interface EventReviewTabProps {
  detectedEvents: DetectedEvent[];
  selectedEvents: Set<string>;
  editingEvents: { [key: string]: DetectedEvent };
  isSaving: boolean;
  onEventToggle: (callback: (prev: Set<string>) => Set<string>) => void;
  onEventEdit: (eventId: string, field: string, value: string) => void;
  onConfirmEvents: () => void;
  onClose: () => void;
  getEventData: (eventId: string) => DetectedEvent;
}

const EventReviewTab: React.FC<EventReviewTabProps> = ({
  detectedEvents,
  selectedEvents,
  editingEvents,
  isSaving,
  onEventToggle,
  onEventEdit,
  onConfirmEvents,
  onClose,
  getEventData
}) => {
  const handleEventToggle = (eventId: string) => {
    onEventToggle((prev: Set<string>) => {
      const newSelected = new Set(prev);
      if (newSelected.has(eventId)) {
        newSelected.delete(eventId);
      } else {
        newSelected.add(eventId);
      }
      return newSelected;
    });
  };

  return (
    <div className="space-y-4">
      {detectedEvents.map((event) => {
        const eventData = getEventData(event.id);
        const isSelected = selectedEvents.has(event.id);

        return (
          <EventCard
            key={event.id}
            event={event}
            isSelected={isSelected}
            eventData={eventData}
            onToggle={handleEventToggle}
            onEdit={onEventEdit}
          />
        );
      })}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          {selectedEvents.size} of {detectedEvents.length} events selected
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirmEvents} 
            disabled={selectedEvents.size === 0 || isSaving}
          >
            {isSaving ? 'Saving...' : `Confirm ${selectedEvents.size} Events`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventReviewTab;
