
import React, { useState } from 'react';
import Header from '@/components/Header';
import JournalEntryForm from '@/components/JournalEntryForm';
import JournalEntryList from '@/components/JournalEntryList';
import TaskCompletionDialog from '@/components/TaskCompletionDialog';
import { Button } from '@/components/ui/button';
import { CheckSquare, Target } from 'lucide-react';

const Journal = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const handleEntryCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Journal
            </h1>
            <p className="text-gray-600">
              Capture your thoughts, track your goals, and reflect on your journey
            </p>
          </div>

          {/* Task Completion Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowTaskDialog(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <CheckSquare className="h-4 w-4" />
              <span>View Tasks & Goals</span>
              <Target className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <JournalEntryForm onEntryCreated={handleEntryCreated} />
            </div>
            
            <div className="space-y-6">
              <JournalEntryList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </main>

      <TaskCompletionDialog
        isOpen={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
      />
    </div>
  );
};

export default Journal;
