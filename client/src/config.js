// src/config.js
const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://kapper.onrender.com';
    }
    return 'http://localhost:3001';
  };
  
  export const config = {
    apiUrl: getBaseUrl(),
    endpoints: {
      appointments: `${getBaseUrl()}/api/appointments`,
      admin: {
        login: `${getBaseUrl()}/api/admin/login`,
        workingHours: `${getBaseUrl()}/api/admin/working-hours`,
        verifyPassword: `${getBaseUrl()}/api/admin/verify-password`
      },
      auth: {
        google: `${getBaseUrl()}/auth/google`,
        callback: `${getBaseUrl()}/auth/google/callback`
      }
    }
  };
  
  export default config;