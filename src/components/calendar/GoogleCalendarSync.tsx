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
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGoogleClientId();
    checkGoogleConnection();
    handleOAuthCallback();
  }, [user]);

  const fetchGoogleClientId = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action: 'get_client_id' }
      });

      if (error) throw error;
      if (data.success) {
        setGoogleClientId(data.clientId);
      }
    } catch (error) {
      console.error('Failed to fetch Google Client ID:', error);
    }
  };

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
        
        // Check if token needs refresh
        if (data.expires_at && new Date(data.expires_at) <= new Date()) {
          await refreshAccessToken(data.refresh_token);
        }
      }
    } catch (error) {
      console.log('No Google Calendar connection found');
    }
  };

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isConnected) {
      exchangeCodeForTokens(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const exchangeCodeForTokens = async (authCode: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'auth',
          authCode: authCode
        }
      });

      if (error) throw error;

      if (data.success) {
        // Store tokens in calendar_integrations table
        const { error: insertError } = await supabase
          .from('calendar_integrations')
          .upsert({
            user_id: user?.id,
            provider: 'google',
            access_token: data.accessToken,
            refresh_token: data.refreshToken,
            expires_at: new Date(Date.now() + data.expiresIn * 1000).toISOString(),
            is_enabled: true
          });

        if (insertError) throw insertError;

        setIsConnected(true);
        setAccessToken(data.accessToken);
        setIsConnecting(false);
        
        toast({
          title: "Connected!",
          description: "Successfully connected to Google Calendar"
        });
      }
    } catch (error) {
      console.error('OAuth exchange error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'refresh_token',
          refreshToken: refreshToken
        }
      });

      if (error) throw error;

      if (data.success) {
        // Update tokens in database
        const { error: updateError } = await supabase
          .from('calendar_integrations')
          .update({
            access_token: data.accessToken,
            expires_at: new Date(Date.now() + data.expiresIn * 1000).toISOString()
          })
          .eq('user_id', user?.id)
          .eq('provider', 'google');

        if (updateError) throw updateError;

        setAccessToken(data.accessToken);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, user needs to reconnect
      setIsConnected(false);
      setAccessToken(null);
    }
  };

  const connectToGoogle = async () => {
    if (!googleClientId) {
      toast({
        title: "Configuration Error",
        description: "Google Client ID not configured",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const scope = 'https://www.googleapis.com/auth/calendar';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `scope=${encodeURIComponent(scope)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_id=${encodeURIComponent(googleClientId)}`;

      // Redirect to Google OAuth
      window.location.href = authUrl;

    } catch (error) {
      console.error('Google connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Google Calendar connection",
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

  const disconnectGoogle = async () => {
    try {
      const { error } = await supabase
        .from('calendar_integrations')
        .update({ is_enabled: false })
        .eq('user_id', user?.id)
        .eq('provider', 'google');

      if (error) throw error;

      setIsConnected(false);
      setAccessToken(null);
      
      toast({
        title: "Disconnected",
        description: "Google Calendar has been disconnected"
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive"
      });
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
          <div className="flex items-center gap-2">
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnectGoogle}
            >
              Disconnect
            </Button>
          </div>
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
