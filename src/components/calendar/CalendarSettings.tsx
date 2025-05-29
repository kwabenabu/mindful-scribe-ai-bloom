
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Settings, Clock } from 'lucide-react';

interface CalendarSettings {
  google_calendar_enabled: boolean;
  outlook_calendar_enabled: boolean;
  default_meeting_duration: number;
  auto_add_events: boolean;
  timezone: string;
}

const CalendarSettings = () => {
  const [settings, setSettings] = useState<CalendarSettings>({
    google_calendar_enabled: false,
    outlook_calendar_enabled: false,
    default_meeting_duration: 30,
    auto_add_events: true,
    timezone: 'UTC'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        setSettings({
          google_calendar_enabled: data.google_calendar_enabled || false,
          outlook_calendar_enabled: data.outlook_calendar_enabled || false,
          default_meeting_duration: data.default_meeting_duration || 30,
          auto_add_events: data.auto_add_events !== false,
          timezone: data.timezone || 'UTC'
        });
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    fetchSettings();
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
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="google-calendar">Google Calendar</Label>
              <p className="text-sm text-gray-500">
                Enable automatic event creation in Google Calendar
              </p>
            </div>
            <Switch
              id="google-calendar"
              checked={settings.google_calendar_enabled}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, google_calendar_enabled: checked }))
              }
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
          <Button variant="outline" onClick={fetchSettings} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSettings;
