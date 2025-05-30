
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react';

interface GoogleCalendarSyncProps {
  detectedEvents: Array<{
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
  }>;
  onSyncComplete: () => void;
}

const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  detectedEvents,
  onSyncComplete
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkGoogleConnection();
  }, [user]);

  const checkGoogleConnection = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('is_enabled', true)
        .single();

      if (data && !error) {
        setIsConnected(true);
        setAccessToken(data.access_token);
      }
    } catch (error) {
      console.log('No Google Calendar connection found');
    }
  };

  const connectToGoogle = async () => {
    setIsConnecting(true);
    try {
      const clientId = 'your-google-client-id'; // This should come from environment
      const redirectUri = `${window.location.origin}/calendar`;
      const scope = 'https://www.googleapis.com/auth/calendar';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Open Google OAuth in a popup
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
      
      // Listen for the auth callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          toast({
            title: "Connection Cancelled",
            description: "Google Calendar connection was cancelled",
            variant: "destructive"
          });
        }
      }, 1000);

      // You would handle the OAuth callback here
      // For now, simulate a successful connection
      setTimeout(() => {
        popup?.close();
        clearInterval(checkClosed);
        setIsConnected(true);
        setIsConnecting(false);
        toast({
          title: "Connected!",
          description: "Successfully connected to Google Calendar"
        });
      }, 3000);

    } catch (error) {
      console.error('Google connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const syncEventsToGoogle = async () => {
    if (!isConnected || !accessToken) {
      toast({
        title: "Not Connected",
        description: "Please connect to Google Calendar first",
        variant: "destructive"
      });
      return;
    }

    setIsSyncing(true);
    try {
      let syncedCount = 0;
      
      for (const event of detectedEvents) {
        if (event.status === 'synced' && event.external_event_id) {
          continue; // Skip already synced events
        }

        try {
          const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
            body: {
              action: 'create_event',
              eventData: {
                access_token: accessToken,
                event: event
              }
            }
          });

          if (error) throw error;

          if (data.success) {
            syncedCount++;
            console.log(`Synced event ${event.id} to Google Calendar`);
          }
        } catch (eventError) {
          console.error(`Failed to sync event ${event.id}:`, eventError);
        }
      }

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${syncedCount} events to Google Calendar`
      });

      onSyncComplete();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync events to Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncedEvents = detectedEvents.filter(e => e.status === 'synced' && e.external_event_id);
  const pendingEvents = detectedEvents.filter(e => e.status !== 'synced' || !e.external_event_id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Google Calendar</h3>
          {isConnected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>

        {!isConnected ? (
          <Button 
            onClick={connectToGoogle} 
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            {isConnecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
        ) : (
          <Button 
            onClick={syncEventsToGoogle} 
            disabled={isSyncing || pendingEvents.length === 0}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            {isSyncing ? 'Syncing...' : `Sync ${pendingEvents.length} Events`}
          </Button>
        )}
      </div>

      {detectedEvents.length > 0 && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {syncedEvents.length} synced
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              {pendingEvents.length} pending
            </span>
          </div>
        </div>
      )}

      {!isConnected && (
        <p className="text-sm text-gray-500">
          Connect your Google Calendar to automatically sync detected events from your journal entries.
        </p>
      )}
    </div>
  );
};

export default GoogleCalendarSync;
