import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Trash2, Clock, Mail, Phone, User } from 'lucide-react';
import WorkingHoursManager from './WorkingHoursManager';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getWeekDates());

  function getWeekDates(date = new Date()) {
    const curr = date;
    const week = [];
    
    for (let i = 1; i <= 7; i++) {
      const first = curr.getDate() - curr.getDay() + i;
      const day = new Date(curr.setDate(first));
      week.push(day.toISOString().split('T')[0]);
    }
    
    return week;
  }

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

  const navigateWeek = (direction) => {
    const firstDay = new Date(selectedWeek[0]);
    firstDay.setDate(firstDay.getDate() + (direction * 7));
    setSelectedWeek(getWeekDates(firstDay));
  };

  // Groepeer afspraken per datum
  const appointmentsByDate = selectedWeek.reduce((acc, date) => {
    acc[date] = appointments
      .filter(apt => apt.date === date)
      .sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
    return acc;
  }, {});

  const getDayName = (dateString) => {
    const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const date = new Date(dateString);
    return days[date.getDay()];
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
            <h3 className="text-xl font-semibold text-white">Weekagenda</h3>
            <div className="flex gap-4">
              <button
                onClick={() => navigateWeek(-1)}
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 
                  transition-all duration-300 border border-purple-500/30"
              >
                Vorige week
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 
                  transition-all duration-300 border border-purple-500/30"
              >
                Volgende week
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {selectedWeek.map(date => (
                <div key={date} className="bg-slate-700/30 rounded-xl p-6 border border-purple-500/20">
                  <h4 className="text-lg font-medium text-white mb-4">
                    {getDayName(date)} - {date}
                  </h4>
                  {appointmentsByDate[date].length === 0 ? (
                    <div className="text-gray-400 text-center py-4">
                      Geen afspraken
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {appointmentsByDate[date].map((appointment) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;