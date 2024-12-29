import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Trash2, Clock, Mail, Phone, User, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import WorkingHoursManager from './WorkingHoursManager';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import RescheduleDialog from './RescheduleDialog';
import { config } from '../config';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' of 'list'

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(config.endpoints.appointments);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await axios.delete(`${config.endpoints.appointments}/${id}`);
      setAppointments(appointments.filter((appointment) => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleRescheduleComplete = async (updatedAppointment) => {
    try {
      const response = await axios.put(
        `${config.endpoints.appointments}/${selectedAppointment.id}`,
        updatedAppointment
      );
      
      if (response.data) {
        setAppointments(appointments.map(apt => 
          apt.id === selectedAppointment.id ? response.data : apt
        ));
        setIsRescheduleDialogOpen(false);
        setSelectedAppointment(null);
      }
    } catch (error) {
      console.error('Error rescheduling:', error);
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

  const getAllAppointments = () => {
    return appointments.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      
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

  const AppointmentCard = ({ appointment, showDate = false }) => (
    <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]
      hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">{appointment.time}</span>
          </div>
          {showDate && (
            <div className="text-white/60 text-sm mt-1">
              {formatDate(appointment.date)}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedAppointment(appointment);
              setIsRescheduleDialogOpen(true);
            }}
            className="text-blue-400 p-2 hover:bg-blue-500/10 rounded-xl 
              transition-all duration-300 hover:text-blue-300"
          >
            <CalendarIcon size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedAppointment(appointment);
              setIsDeleteDialogOpen(true);
            }}
            className="text-red-400 p-2 hover:bg-red-500/10 rounded-xl
              transition-all duration-300 hover:text-red-300"
          >
            <Trash2 size={18} />
          </button>
        </div>
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
  );

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h2>
        
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-white/[0.05] rounded-xl p-1 border border-white/[0.08]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'calendar'
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Dagweergave
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Lijstweergave
            </button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <>
            {/* Date Navigation */}
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
              <WorkingHoursManager selectedDate={selectedDate} />
            </div>

            {/* Day Appointments */}
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
                        <AppointmentCard 
                          key={appointment.id} 
                          appointment={appointment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-6">Alle Afspraken</h3>
            {getAllAppointments().map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
                showDate={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAppointment(null);
        }}
        appointmentId={selectedAppointment?.id}
        onDelete={() => {
          if (selectedAppointment) {
            deleteAppointment(selectedAppointment.id);
          }
        }}
      />

      <RescheduleDialog
        isOpen={isRescheduleDialogOpen}
        onClose={() => {
          setIsRescheduleDialogOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onReschedule={handleRescheduleComplete}
      />
    </div>
  );
};

export default AdminDashboard;