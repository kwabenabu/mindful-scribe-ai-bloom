
import React from 'react';
import Header from '@/components/Header';
import CalendarSettings from '@/components/calendar/CalendarSettings';
import UserProfileForm from '@/components/UserProfileForm';
import ThemeSelector from '@/components/ThemeSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Brain } from 'lucide-react';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-gray-600">
              Manage your preferences and integrations
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <UserProfileForm />
              <ThemeSelector />
            </div>
            
            <div className="space-y-8">
              <CalendarSettings />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Behavior Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">AI customization options coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
