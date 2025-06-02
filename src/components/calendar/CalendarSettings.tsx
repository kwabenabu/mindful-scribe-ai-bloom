
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
import { Calendar, Clock } from 'lucide-react';

interface CalendarSettings {
  default_meeting_duration: number;
  auto_add_events: boolean;
  timezone: string;
}

const CalendarSettings = () => {
  const [settings, setSettings] = useState<CalendarSettings>({
    default_meeting_duration: 30,
    auto_add_events: false, // Disabled by default
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
          default_meeting_duration: data.default_meeting_duration || 30,
          auto_add_events: false, // Force disabled
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
          google_calendar_enabled: false,
          outlook_calendar_enabled: false,
          default_meeting_duration: settings.default_meeting_duration,
          auto_add_events: false, // Always save as false
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
    const initializeSettings = async () => {
      setIsLoading(true);
      await fetchSettings();
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
          Calendar Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between opacity-50">
              <div className="space-y-0.5">
                <Label htmlFor="auto-add" className="text-gray-400">Auto-add Events</Label>
                <p className="text-sm text-gray-400">
                  Automatically add detected events without confirmation (disabled)
                </p>
              </div>
              <Switch
                id="auto-add"
                checked={false}
                disabled={true}
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
              onClick={fetchSettings}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarSettings;
