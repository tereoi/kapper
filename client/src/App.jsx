import { useState } from 'react';
import BookingForm from './components/BookingForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Scissors, User } from 'lucide-react';
import './App.css';

const ColorfulBackground = () => (
  <>
    <div className="fixed inset-0 bg-[#000000] overflow-hidden">
      {/* Hoofdgradiënt linksboven */}
      <div className="absolute top-[5%] left-[15%] w-[800px] h-[800px] rounded-full
        opacity-30 blur-[120px] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 animate-slow-spin" />
      
      {/* Contrasterende gradiënt rechtsonder */}
      <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] rounded-full
        opacity-25 blur-[100px] bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 animate-slow-spin-reverse" />
      
      {/* Extra accent gradiënt voor meer diepte */}
      <div className="absolute top-[40%] right-[30%] w-[500px] h-[500px] rounded-full
        opacity-20 blur-[90px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 animate-float" />
    </div>
  </>
);

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  return (
    <div className="min-h-screen relative font-[-apple-system] text-white">
      <ColorfulBackground />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed w-full z-50 backdrop-blur-xl bg-black/40
          border-b border-white/[0.06] supports-[backdrop-filter]:bg-black/40">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500
                  flex items-center justify-center shadow-lg transform-gpu transition-all 
                  duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-medium">Kapper Online Boeken</h1>
              </div>
              {!isAdmin && (
                <button
                  onClick={() => setIsAdmin(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full
                    bg-white/[0.08] hover:bg-white/[0.12] transition-all duration-300
                    border border-white/[0.05] hover:border-white/[0.1]
                    shadow-lg shadow-black/20"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
          <div className="space-y-6">
            {!isAdmin ? (
              <div className="transform-gpu transition-all duration-500">
                <BookingForm />
              </div>
            ) : !isAdminLoggedIn ? (
              <div>
                <AdminLogin onLoginSuccess={handleLoginSuccess} />
                <button
                  onClick={() => setIsAdmin(false)}
                  className="mt-6 flex items-center space-x-2 px-5 py-2.5 rounded-full
                    bg-gradient-to-r from-white/[0.08] to-white/[0.06] hover:from-white/[0.12] hover:to-white/[0.08]
                    transition-all duration-300 text-sm font-medium mx-auto group
                    border border-white/[0.05] hover:border-white/[0.1]
                    shadow-lg shadow-black/20"
                >
                  <svg 
                    className="w-4 h-4 transform transition-transform duration-300 group-hover:-translate-x-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M15 19l-7-7 7-7" />
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
                  className="mt-6 flex items-center space-x-2 px-5 py-2.5 rounded-full
                    bg-gradient-to-r from-white/[0.08] to-white/[0.06] hover:from-white/[0.12] hover:to-white/[0.08]
                    transition-all duration-300 text-sm font-medium mx-auto group
                    border border-white/[0.05] hover:border-white/[0.1]
                    shadow-lg shadow-black/20"
                >
                  <svg 
                    className="w-4 h-4 transform transition-transform duration-300 group-hover:-translate-x-0.5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Uitloggen</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;