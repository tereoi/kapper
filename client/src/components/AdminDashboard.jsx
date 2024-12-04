import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Trash2, Clock, Mail, Phone, User, ChevronLeft, ChevronRight } from 'lucide-react';
import WorkingHoursManager from './WorkingHoursManager';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/appointments/${id}`);
      setAppointments(appointments.filter((appointment) => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const navigateDay = (direction) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const getDayAppointments = () => {
    return appointments
      .filter(apt => apt.date === selectedDate)
      .sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
  };

  const formatDate = (dateString) => {
    const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    const date = new Date(dateString);
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h2>
        <div className="mb-8">
          <WorkingHoursManager />
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Dagplanning</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDay(-1)}
                className="p-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 
                  transition-all duration-300 border border-purple-500/30"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-white font-medium min-w-[200px] text-center">
                {formatDate(selectedDate)}
              </span>
              <button
                onClick={() => navigateDay(1)}
                className="p-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 
                  transition-all duration-300 border border-purple-500/30"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="bg-slate-700/30 rounded-xl p-6 border border-purple-500/20">
              {getDayAppointments().length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  Geen afspraken voor deze dag
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getDayAppointments().map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20
                        hover:border-purple-500/40 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-medium">{appointment.time}</span>
                        </div>
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transform translate-x-2 
                            group-hover:translate-x-0 transition-all duration-300 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-gray-300">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-purple-400" />
                          <span>{appointment.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-purple-400" />
                          <span>{appointment.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-purple-400" />
                          <span>{appointment.phone}</span>
                        </div>
                        <div className="mt-2 px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm inline-block">
                          {appointment.service}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;