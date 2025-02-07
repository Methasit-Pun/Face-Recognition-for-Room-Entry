import React, { useState } from 'react';
import AdminInterface from './components/AdminInterface';
import UserInterface from './components/UserInterface';
import { Camera, Users } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            Face Recognition System
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('user')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentView === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              User Registration
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentView === 'admin'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Admin Panel
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {currentView === 'user' ? <UserInterface /> : <AdminInterface />}
        </div>
      </main>
    </div>
  );
}

export default App;