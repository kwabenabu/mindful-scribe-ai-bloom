
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Camera } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  description?: string;
  journaling_purpose?: string;
  profile_picture_url?: string;
  is_first_time?: boolean;
}

interface UserProfileFormProps {
  onProfileUpdated?: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onProfileUpdated }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    journaling_purpose: '',
    profile_picture_url: ''
  });

  const journalingPurposes = [
    'Personal Growth',
    'Mental Health',
    'Creative Writing',
    'Goal Tracking',
    'Daily Reflection',
    'Therapy Support',
    'Memory Keeping',
    'Habit Tracking'
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          description: data.description || '',
          journaling_purpose: data.journaling_purpose || '',
          profile_picture_url: data.profile_picture_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: formData.display_name,
          description: formData.description,
          journaling_purpose: formData.journaling_purpose,
          profile_picture_url: formData.profile_picture_url,
          is_first_time: false,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {formData.profile_picture_url ? (
              <img
                src={formData.profile_picture_url}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
            <Input
              id="profile_picture_url"
              value={formData.profile_picture_url}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, profile_picture_url: e.target.value }))
              }
              placeholder="https://example.com/your-photo.jpg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, display_name: e.target.value }))
            }
            placeholder="How would you like to be called?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="journaling_purpose">Journaling Purpose</Label>
          <Select
            value={formData.journaling_purpose}
            onValueChange={(value) =>
              setFormData(prev => ({ ...prev, journaling_purpose: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="What's your main purpose for journaling?" />
            </SelectTrigger>
            <SelectContent>
              {journalingPurposes.map((purpose) => (
                <SelectItem key={purpose} value={purpose}>
                  {purpose}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">About You</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            placeholder="Tell us a bit about yourself and your journaling journey..."
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={fetchProfile} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
