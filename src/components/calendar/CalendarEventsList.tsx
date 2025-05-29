
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, MapPin, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  event_title: string;
  event_description?: string;
  event_date?: string;
  event_time?: string;
  event_datetime?: string;
  duration_minutes?: number;
  location?: string;
  confidence_score?: number;
  status: string;
  created_at: string;
}

const CalendarEventsList = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('detected_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('detected_events')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.map(event => 
        event.id === eventId ? { ...event, status } : event
      ));

      toast({
        title: "Event Updated",
        description: `Event ${status === 'added' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error updating event status:', error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('detected_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "Event has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'added': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (event: CalendarEvent) => {
    if (event.event_datetime) {
      return format(new Date(event.event_datetime), 'PPP p');
    }
    if (event.event_date && event.event_time) {
      return `${event.event_date} at ${event.event_time}`;
    }
    if (event.event_date) {
      return event.event_date;
    }
    if (event.event_time) {
      return event.event_time;
    }
    return 'Time not specified';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading calendar events...</div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detected Calendar Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p className="mb-2">No calendar events detected yet</p>
            <p className="text-sm">Start writing journal entries with events to see them here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Detected Calendar Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{event.event_title}</h3>
                {event.event_description && (
                  <p className="text-sm text-gray-600 mt-1">{event.event_description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
                {event.confidence_score && (
                  <Badge variant="outline">
                    {Math.round(event.confidence_score * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(event)}</span>
              </div>
              {event.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{event.duration_minutes} minutes</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {event.status === 'pending' && (
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => updateEventStatus(event.id, 'added')}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Add to Calendar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateEventStatus(event.id, 'rejected')}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteEvent(event.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CalendarEventsList;
