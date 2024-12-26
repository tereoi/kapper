import React, { useState } from 'react';
import config from '../config';
import axios from 'axios';

const DeleteConfirmationDialog = ({ isOpen, onClose, appointmentId, onDelete }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // First verify password
      const verifyResponse = await axios.post(config.endpoints.admin.verifyPassword, {
        password
      });
      
      if (verifyResponse.data.success) {
        await onDelete();
        onClose();
      } else {
        setError('Incorrect wachtwoord');
      }
    } catch (error) {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-purple-500/20">
        <h3 className="text-xl font-semibold text-white mb-4">
          Weet je het zeker?
        </h3>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Admin wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 
              rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700/50 text-white rounded-lg 
                hover:bg-slate-600/50 transition-all duration-300"
            >
              Annuleren
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading || !password}
              className="px-4 py-2 bg-red-500/80 text-white rounded-lg 
                hover:bg-red-600/80 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Bezig...' : 'Verwijderen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;