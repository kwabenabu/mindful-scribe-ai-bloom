
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Settings, Clock, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import GoogleCalendarSync from './GoogleCalendarSync';

interface CalendarSettings {
  google_calendar_enabled: boolean;
  outlook_calendar_enabled: boolean;
  default_meeting_duration: number;
  auto_add_events: boolean;
  timezone: string;
}

interface GoogleCalendarConnection {
  isConnected: boolean;
  accessToken: string | null;
  expiresAt: string | null;
}

const CalendarSettings = () => {
  const [settings, setSettings] = useState<CalendarSettings>({
    google_calendar_enabled: false,
    outlook_calendar_enabled: false,
    default_meeting_duration: 30,
    auto_add_events: true,
    timezone: 'UTC'
  });
  const [googleConnection, setGoogleConnection] = useState<GoogleCalendarConnection>({
    isConnected: false,
    accessToken: null,
    expiresAt: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

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
        setGoogleConnection({
          isConnected: true,
          accessToken: data.access_token,
          expiresAt: data.expires_at
        });
        
        // Update the settings to reflect actual connection status
        setSettings(prev => ({ 
          ...prev, 
          google_calendar_enabled: true 
        }));
      } else {
        setGoogleConnection({
          isConnected: false,
          accessToken: null,
          expiresAt: null
        });
        
        // Update the settings to reflect disconnected status
        setSettings(prev => ({ 
          ...prev, 
          google_calendar_enabled: false 
        }));
      }
    } catch (error) {
      console.log('No Google Calendar connection found');
      setGoogleConnection({
        isConnected: false,
        accessToken: null,
        expiresAt: null
      });
      setSettings(prev => ({ 
        ...prev, 
        google_calendar_enabled: false 
      }));
    }
  };

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_calendar_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(prev => ({
          ...prev,
          outlook_calendar_enabled: data.outlook_calendar_enabled || false,
          default_meeting_duration: data.default_meeting_duration || 30,
          auto_add_events: data.auto_add_events !== false,
          timezone: data.timezone || 'UTC'
          // Don't override google_calendar_enabled here as it's set by checkGoogleConnection
        }));
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar settings",
        variant: "destructive"
      });
    }
  };

  const initiateGoogleAuth = async () => {
    if (!googleClientId) {
      toast({
        title: "Configuration Error",
        description: "Google Client ID not configured",
        variant: "destructive"
      });
      return;
    }

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

      setGoogleConnection({
        isConnected: false,
        accessToken: null,
        expiresAt: null
      });
      
      setSettings(prev => ({ 
        ...prev, 
        google_calendar_enabled: false 
      }));
      
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

  const handleGoogleToggle = async (checked: boolean) => {
    if (checked && !googleConnection.isConnected) {
      // User wants to enable Google Calendar but it's not connected
      await initiateGoogleAuth();
    } else if (!checked && googleConnection.isConnected) {
      // User wants to disable Google Calendar and it's currently connected
      await disconnectGoogle();
    }
    // If it's already in the desired state, do nothing
  };

  const saveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_calendar_settings')
        .upsert({
          user_id: user.id,
          google_calendar_enabled: settings.google_calendar_enabled,
          outlook_calendar_enabled: settings.outlook_calendar_enabled,
          default_meeting_duration: settings.default_meeting_duration,
          auto_add_events: settings.auto_add_events,
          timezone: settings.timezone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Calendar settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      toast({
        title: "Error",
        description: "Failed to save calendar settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !googleConnection.isConnected) {
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

        setGoogleConnection({
          isConnected: true,
          accessToken: data.accessToken,
          expiresAt: new Date(Date.now() + data.expiresIn * 1000).toISOString()
        });
        
        setSettings(prev => ({ 
          ...prev, 
          google_calendar_enabled: true 
        }));
        
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
    }
  };

  useEffect(() => {
    const initializeSettings = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchGoogleClientId(),
        checkGoogleConnection(),
        fetchSettings()
      ]);
      handleOAuthCallback();
      setIsLoading(false);
    };

    if (user) {
      initializeSettings();
    }
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading calendar settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integration Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="sync">Calendar Sync</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="google-calendar" className="flex items-center gap-2">
                    Google Calendar
                    {googleConnection.isConnected ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {googleConnection.isConnected 
                      ? "Connected and enabled for automatic event creation"
                      : "Enable automatic event creation in Google Calendar"
                    }
                  </p>
                </div>
                <Switch
                  id="google-calendar"
                  checked={settings.google_calendar_enabled && googleConnection.isConnected}
                  onCheckedChange={handleGoogleToggle}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="outlook-calendar">Outlook Calendar</Label>
                  <p className="text-sm text-gray-500">
                    Enable automatic event creation in Outlook Calendar
                  </p>
                </div>
                <Switch
                  id="outlook-calendar"
                  checked={settings.outlook_calendar_enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, outlook_calendar_enabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-add">Auto-add Events</Label>
                  <p className="text-sm text-gray-500">
                    Automatically add detected events without confirmation
                  </p>
                </div>
                <Switch
                  id="auto-add"
                  checked={settings.auto_add_events}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, auto_add_events: checked }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Default Meeting Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={settings.default_meeting_duration}
                  onChange={(e) =>
                    setSettings(prev => ({ 
                      ...prev, 
                      default_meeting_duration: parseInt(e.target.value) || 30 
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings(prev => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  checkGoogleConnection();
                  fetchSettings();
                }} 
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="sync" className="space-y-6">
            <GoogleCalendarSync 
              detectedEvents={[]}
              onSyncComplete={() => {}}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendarSettings;
