import React, { useState } from 'react';
import axios from 'axios';

const AdminLogin = ({ onLoginSuccess }) => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/admin/login', loginData);
      if (response.data.success) {
        onLoginSuccess();
        alert('Succesvol ingelogd!');
      }
    } catch (error) {
      alert('Inloggen mislukt. Controleer je gegevens.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Gebruikersnaam</label>
          <input
            type="text"
            name="username"
            value={loginData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Wachtwoord</label>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Inloggen
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;