// components/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    daily: { count: 0, revenue: 0 },
    weekly: { count: 0, revenue: 0 },
    monthly: { count: 0, revenue: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${window.location.protocol}//${window.location.hostname}:3001/api/manager/statistics`);
        console.log('Stats received:', response.data);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="relative z-20 max-w-6xl mx-auto">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06] shadow-xl">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 max-w-6xl mx-auto">
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06] shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Manager Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vandaag */}
          <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center space-x-3 mb-4">
              <FiCalendar className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Vandaag</h2>
            </div>
            <p className="text-3xl font-bold text-white">{stats.daily.count}</p>
            <p className="text-white/60">afspraken</p>
          </div>

          {/* Deze Week */}
          <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center space-x-3 mb-4">
              <FiUsers className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Deze Week</h2>
            </div>
            <p className="text-3xl font-bold text-white">{stats.weekly.count}</p>
            <p className="text-white/60">afspraken</p>
          </div>

          {/* Deze Maand */}
          <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex items-center space-x-3 mb-4">
              <FiTrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Deze Maand</h2>
            </div>
            <p className="text-3xl font-bold text-white">{stats.monthly.count}</p>
            <p className="text-white/60">afspraken</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;