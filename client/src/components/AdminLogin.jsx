import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, LogIn } from 'lucide-react';

const AdminLogin = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  // Start animation when component mounts
  React.useEffect(() => {
    setAnimate(true);
  }, []);

  const handleChange = (e) => {
    setError('');
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3001/api/admin/login', loginData);
      if (response.data.success) {
        // Animatie voor succesvolle login
        const element = document.querySelector('.login-form');
        element.classList.add('scale-0', 'opacity-0');
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      }
    } catch (error) {
      setError('Inloggen mislukt. Controleer je gegevens.');
      // Schud animatie bij error
      const form = document.querySelector('.login-form');
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`
      transition-all duration-1000 transform
      ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
    `}>
      <div className="login-form max-w-md mx-auto p-8 bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-2xl 
        border border-purple-500/20 transition-all duration-500">
        {/* Header met glow effect */}
        <div className="relative mb-8 text-center">
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
          <h2 className="relative text-2xl font-bold text-white mb-2">Admin Login</h2>
          <div className="relative text-purple-200 text-sm">Beheer je afspraken</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gebruikersnaam veld met animatie */}
          <div className="transform transition-all duration-300 hover:translate-x-1">
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Gebruikersnaam
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                <User size={18} />
              </div>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 
                  rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                  transition-all duration-300 placeholder-purple-300/50"
                placeholder="Voer je gebruikersnaam in"
                required
              />
            </div>
          </div>

          {/* Wachtwoord veld met animatie */}
          <div className="transform transition-all duration-300 hover:translate-x-1">
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Wachtwoord
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 
                  rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                  transition-all duration-300 placeholder-purple-300/50"
                placeholder="Voer je wachtwoord in"
                required
              />
            </div>
          </div>

          {/* Error message met fade animatie */}
          {error && (
            <div className="text-red-400 text-sm animate-fade-in text-center">
              {error}
            </div>
          )}

          {/* Login button met loading state en hover effect */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 
              rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:from-purple-500 
              hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
              focus:ring-offset-slate-800 relative overflow-hidden group"
          >
            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2 transform group-hover:rotate-12 transition-transform duration-300" />
                  <span>Inloggen</span>
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;