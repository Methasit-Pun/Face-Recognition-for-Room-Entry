import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminInterface from './components/AdminInterface';
import UserInterface from './components/UserInterface';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Face Recognition System
            </Link>
            <div className="space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800">
                User Registration
              </Link>
              <Link to="/admin" className="text-gray-600 hover:text-gray-800">
                Admin Panel
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto py-8">
          <Routes>
            <Route path="/" element={<UserInterface />} />
            <Route path="/admin" element={<AdminInterface />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;