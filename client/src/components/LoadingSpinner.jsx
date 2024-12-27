// components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-white/30 border-t-blue-500 rounded-full animate-spin" />
  </div>
);

export default LoadingSpinner;