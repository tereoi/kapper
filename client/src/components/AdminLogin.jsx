import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, LogIn } from 'lucide-react';
import { config } from '../config';

const AdminLogin = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
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
      const response = await axios.post(config.endpoints.admin.login, loginData);
      if (response.data.success) {
        const element = document.querySelector('.login-form');
        element.classList.add('scale-0', 'opacity-0');
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      }
    } catch (error) {
      setError('Inloggen mislukt. Controleer je gegevens.');
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
      <div className="login-form max-w-md mx-auto p-8 bg-black/40 backdrop-blur-xl rounded-3xl 
        shadow-2xl border border-white/[0.06] transition-all duration-500">
        <div className="relative mb-8 text-center">
          <h2 className="relative text-2xl font-bold text-white mb-2">Admin Login</h2>
          <div className="relative text-white/60 text-sm">Beheer je afspraken</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-white/80 text-sm font-medium">
              Gebruikersnaam
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <User size={18} />
              </div>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08]
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  text-white placeholder-white/40 transition-all duration-300"
                placeholder="Voer je gebruikersnaam in"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-white/80 text-sm font-medium">
              Wachtwoord
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Lock size={18} />
              </div>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08]
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  text-white placeholder-white/40 transition-all duration-300"
                placeholder="Voer je wachtwoord in"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm animate-fade-in text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 
              rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:from-blue-600 
              hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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