// App.jsx
import { useState } from 'react';
import BookingForm from './components/BookingForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ManagerLogin from './components/ManagerLogin';
import ManagerDashboard from './components/ManagerDashboard';
import { Scissors, User, ChartBar } from 'lucide-react';

const ColorfulBackground = () => (
  <div className="fixed inset-0 bg-[#000000] overflow-hidden">
    <div className="absolute top-[5%] left-[15%] w-[800px] h-[800px] rounded-full
      opacity-30 blur-[120px] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 
      animate-slow-spin" />
    <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] rounded-full
      opacity-25 blur-[100px] bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 
      animate-slow-spin-reverse" />
    <div className="absolute top-[40%] right-[30%] w-[500px] h-[500px] rounded-full
      opacity-20 blur-[90px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 
      animate-float" />
  </div>
);

function App() {
  const [view, setView] = useState('booking');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen relative font-[-apple-system] text-white">
      <ColorfulBackground />

      {/* Header */}
      <header className="fixed w-full z-50 backdrop-blur-xl bg-black/40 
        border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500
                flex items-center justify-center shadow-lg transform-gpu transition-all 
                duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-medium">ezcuts</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {view === 'booking' && (
                <>
                  <button
                    onClick={() => setView('admin')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full
                      bg-white/[0.08] hover:bg-white/[0.12] transition-all duration-300
                      border border-white/[0.05] hover:border-white/[0.1]
                      shadow-lg shadow-black/20"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Admin</span>
                  </button>
                  <button
                    onClick={() => setView('manager')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full
                      bg-white/[0.08] hover:bg-white/[0.12] transition-all duration-300
                      border border-white/[0.05] hover:border-white/[0.1]
                      shadow-lg shadow-black/20"
                  >
                    <ChartBar className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Beheerder</span>
                  </button>
                </>
              )}
              {(view === 'admin' || view === 'manager') && (
                <button
                  onClick={() => {
                    setView('booking');
                    setIsLoggedIn(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full
                    bg-white/[0.08] hover:bg-white/[0.12] transition-all duration-300
                    border border-white/[0.05] hover:border-white/[0.1]
                    shadow-lg shadow-black/20"
                >
                  <span className="text-sm font-medium">Terug</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <div className="space-y-6">
          {view === 'booking' && <BookingForm />}
          {view === 'admin' && !isLoggedIn && <AdminLogin onLoginSuccess={handleLoginSuccess} />}
          {view === 'admin' && isLoggedIn && <AdminDashboard />}
          {view === 'manager' && !isLoggedIn && <ManagerLogin onLoginSuccess={handleLoginSuccess} />}
          {view === 'manager' && isLoggedIn && <ManagerDashboard />}
        </div>
      </main>
    </div>
  );
}

export default App;