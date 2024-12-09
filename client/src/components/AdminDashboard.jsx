import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Trash2, Clock, Mail, Phone, User, ChevronLeft, ChevronRight } from 'lucide-react';
import WorkingHoursManager from './WorkingHoursManager';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

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
    <div className="relative z-20 max-w-4xl mx-auto">
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06] shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h2>
        
        {/* Combined Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateDay(-1)}
            className="p-2 bg-white/[0.05] text-white rounded-xl hover:bg-white/[0.08] 
              transition-all duration-300 border border-white/[0.08]"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">
              {formatDate(selectedDate)}
            </span>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-1.5 bg-white/[0.05] text-white rounded-xl hover:bg-white/[0.08] 
                transition-all duration-300 border border-white/[0.08] text-sm"
            >
              Vandaag
            </button>
          </div>
          <button
            onClick={() => navigateDay(1)}
            className="p-2 bg-white/[0.05] text-white rounded-xl hover:bg-white/[0.08] 
              transition-all duration-300 border border-white/[0.08]"
          >
            <ChevronRight size={24} />
          </button>
        </div>
  
        {/* Working Hours Manager */}
        <div className="mb-8">
          <WorkingHoursManager 
            selectedDate={selectedDate} 
          />
        </div>
  
        {/* Appointments Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-6">Dagplanning</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {getDayAppointments().length === 0 ? (
                <div className="text-white/60 text-center py-8 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                  Geen afspraken voor deze dag
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {getDayAppointments().map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]
                        hover:bg-white/[0.05] transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-medium">{appointment.time}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAppointmentId(appointment.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transform translate-x-2 
                            group-hover:translate-x-0 transition-all duration-300 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-white/80">
                          <User className="w-4 h-4 text-blue-400" />
                          <span>{appointment.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/80">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <span>{appointment.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/80">
                          <Phone className="w-4 h-4 text-blue-400" />
                          <span>{appointment.phone}</span>
                        </div>
                        <div className="mt-3 px-3 py-1 bg-blue-500/10 rounded-full text-blue-400 text-sm inline-block">
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
  
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAppointmentId(null);
        }}
        appointmentId={selectedAppointmentId}
        onDelete={() => deleteAppointment(selectedAppointmentId)}
      />
    </div>
  );
};

export default AdminDashboard;