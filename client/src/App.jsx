import { useState } from 'react'
import BookingForm from './components/BookingForm'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Kapper Online Boeken</h1>
          {!isAdmin && (
            <button
              onClick={() => setIsAdmin(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Admin Login
            </button>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-12 px-4">
        {!isAdmin ? (
          <BookingForm />
        ) : !isAdminLoggedIn ? (
          <div>
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
            <button
              onClick={() => setIsAdmin(false)}
              className="mt-4 text-blue-600 hover:text-blue-800 block mx-auto"
            >
              Terug naar boekingen
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
              className="mt-4 text-blue-600 hover:text-blue-800 block mx-auto"
            >
              Uitloggen
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;