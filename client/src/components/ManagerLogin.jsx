// components/ManagerLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { config } from '../config';

const ManagerLogin = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({ 
    username: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', loginData); // Debug log
      const response = await axios.post(
        `${config.apiUrl}/api/manager/login`,
        loginData
      );
      
      console.log('Login response:', response.data); // Debug log

      if (response.data.success) {
        onLoginSuccess();
      } else {
        setError('Inloggen mislukt. Controleer je gegevens.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Inloggen mislukt. Controleer je gegevens.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/[0.06] shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Beheerder Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
             <FiUser size={18} /> 
            </div>
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08]
                rounded-xl text-white placeholder-white/40"
              placeholder="Gebruikersnaam"
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <FiLock size={18} />
            </div>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08]
                rounded-xl text-white placeholder-white/40"
              placeholder="Wachtwoord"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 
            rounded-xl transition-all duration-300 disabled:opacity-50 hover:from-blue-600 
            hover:to-blue-700 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-center">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiLogIn className="w-5 h-5 mr-2" />
                <span>Inloggen</span>
              </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
};

export default ManagerLogin;