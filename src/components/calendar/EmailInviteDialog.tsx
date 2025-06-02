
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Send, User, Calendar } from 'lucide-react';

interface EmailInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  detectedEvents: Array<{
    id: string;
    event_title: string;
    event_description?: string;
    event_date?: string;
    event_time?: string;
    event_datetime?: string;
    duration_minutes?: number;
    location?: string;
  }>;
}

const EmailInviteDialog: React.FC<EmailInviteDialogProps> = ({
  isOpen,
  onClose,
  detectedEvents
}) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set(detectedEvents.map(e => e.id))
  );
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

  const constructDateTime = (event: any): { startDate: Date; endDate: Date } => {
    let startDate: Date;
    
    if (event.event_datetime) {
      startDate = new Date(event.event_datetime);
    } else if (event.event_date && event.event_time) {
      startDate = new Date(`${event.event_date}T${event.event_time}`);
    } else if (event.event_date) {
      startDate = new Date(`${event.event_date}T09:00:00`);
    } else {
      // Fallback to tomorrow at 9 AM
      startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(9, 0, 0, 0);
    }

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + (event.duration_minutes || 60));

    return { startDate, endDate };
  };

  const handleSendInvites = async () => {
    if (!emailAddress.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    if (selectedEvents.size === 0) {
      toast({
        title: "No Events Selected",
        description: "Please select at least one event to send",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const eventsToSend = detectedEvents.filter(event => selectedEvents.has(event.id));
      
      // Get user profile for organizer info
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('user_id', user?.id)
        .single();

      const organizerName = profile?.display_name || user?.email?.split('@')[0] || 'Journal App User';
      const organizerEmail = user?.email || 'noreply@journalapp.com';

      let successCount = 0;
      let errorCount = 0;

      for (const event of eventsToSend) {
        try {
          const { startDate, endDate } = constructDateTime(event);

          const { data, error } = await supabase.functions.invoke('send-calendar-invite', {
            body: {
              to: emailAddress.trim(),
              toName: recipientName.trim() || undefined,
              event: {
                title: event.event_title,
                description: event.event_description || undefined,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                location: event.location || undefined,
              },
              organizerName,
              organizerEmail,
            },
          });

          if (error) {
            console.error('Error sending invite for event:', event.event_title, error);
            errorCount++;
          } else {
            console.log('Successfully sent invite for event:', event.event_title);
            successCount++;
          }
        } catch (eventError) {
          console.error('Error processing event:', event.event_title, eventError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Invites Sent!",
          description: `Successfully sent ${successCount} calendar invite(s) to ${emailAddress}`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Some Invites Failed",
          description: `${errorCount} invite(s) could not be sent. Please try again.`,
          variant: "destructive"
        });
      }

      if (successCount > 0) {
        onClose();
        setEmailAddress('');
        setRecipientName('');
      }
    } catch (error) {
      console.error('Error sending calendar invites:', error);
      toast({
        title: "Error",
        description: "Failed to send calendar invites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Calendar Invites via Email
          </DialogTitle>
          <DialogDescription>
            Send calendar invites that can be opened in any calendar app (Google Calendar, Outlook, Apple Calendar, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Recipient Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name">Recipient Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>

          {/* Event Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Events to Send ({selectedEvents.size} of {detectedEvents.length})
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {detectedEvents.map((event) => {
                const { startDate } = constructDateTime(event);
                const isSelected = selectedEvents.has(event.id);
                
                return (
                  <div
                    key={event.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleEventToggle(event.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.event_title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                        )}
                        {event.event_description && (
                          <p className="text-sm text-gray-500 mt-1">{event.event_description}</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedEvents.size} event(s) selected
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvites} 
                disabled={isLoading || selectedEvents.size === 0 || !emailAddress.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isLoading ? 'Sending...' : `Send ${selectedEvents.size} Invite(s)`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailInviteDialog;
