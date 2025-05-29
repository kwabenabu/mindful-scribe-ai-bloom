
import React, { useState } from 'react';
import Header from '@/components/Header';
import SimplifiedJournalForm from '@/components/SimplifiedJournalForm';

const Journal = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEntryCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Journal
            </h1>
            <p className="text-gray-600">
              Capture your thoughts, experiences, and reflections
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <SimplifiedJournalForm onEntryCreated={handleEntryCreated} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journal;
