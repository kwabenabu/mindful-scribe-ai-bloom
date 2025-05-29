
import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Journal App!
            </h1>
            <p className="text-gray-600 mb-4">
              You are logged in as: {user?.email}
            </p>
            <p className="text-gray-500">
              This is where your journal features will be implemented.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
