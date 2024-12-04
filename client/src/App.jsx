import { useState } from 'react';
import BookingForm from './components/BookingForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Scissors, User } from 'lucide-react';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg rotate-12 transform hover:rotate-0 transition-transform duration-300">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Kapper Online Boeken</h1>
              </div>
              {!isAdmin && (
                <button
                  onClick={() => setIsAdmin(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                    transition-all duration-300 text-white border border-white/20 hover:border-white/40"
                >
                  <User className="w-5 h-5" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-20 max-w-7xl mx-auto py-12 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-transparent blur-3xl transform -translate-y-1/2 rounded-full" />
          
          {!isAdmin ? (
            <div className="transform transition-all duration-500">
              <BookingForm />
            </div>
          ) : !isAdminLoggedIn ? (
            <div>
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
              <button
                onClick={() => setIsAdmin(false)}
                className="mt-6 mx-auto flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-800/50 backdrop-blur-lg
                  border border-purple-500/20 text-purple-300 hover:text-white transition-all duration-300
                  hover:border-purple-500/40 hover:bg-slate-700/50 transform hover:-translate-y-1 group"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Terug naar boekingen</span>
              </button>
            </div>
          ) : (
            <div>
              <AdminDashboard />
              <button
                onClick={() => {
                  setIsAdmin(false);
                  setIsAdminLoggedIn(false);
                }}
                className="mt-6 mx-auto flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-800/50 backdrop-blur-lg
                  border border-purple-500/20 text-purple-300 hover:text-white transition-all duration-300
                  hover:border-purple-500/40 hover:bg-slate-700/50 transform hover:-translate-y-1 group"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Uitloggen</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;