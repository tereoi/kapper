import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { config } from '../config';
import CustomDatePicker from './CustomDatePicker';


const RescheduleDialog = ({ isOpen, onClose, appointment, onReschedule }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setNewDate(appointment.date);
      setNewTime(appointment.time);
      fetchAvailableTimes(appointment.date);
    }
  }, [appointment]);

  const fetchAvailableTimes = async (date) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${config.endpoints.appointments}/available-times/${date}`
      );
      
      if (response.data.times) {
        // Als het dezelfde dag is, voeg de huidige tijd ook toe aan de beschikbare tijden
        if (date === appointment?.date) {
          const times = [...new Set([...response.data.times, appointment.time])].sort();
          setAvailableTimes(times);
        } else {
          setAvailableTimes(response.data.times);
        }
      }
    } catch (error) {
      console.error('Error fetching times:', error);
      setError('Fout bij ophalen beschikbare tijden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setNewDate(selectedDate);
    setNewTime(''); // Reset time when date changes
    await fetchAvailableTimes(selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if the time slot is available (if it's different from current time)
      if (newDate !== appointment.date || newTime !== appointment.time) {
        const availabilityCheck = await axios.post(
          `${config.endpoints.appointments}/check-availability`,
          { date: newDate, time: newTime }
        );

        if (!availabilityCheck.data.available) {
          setError('Dit tijdslot is niet meer beschikbaar');
          setIsLoading(false);
          return;
        }
      }

      // Call the onReschedule callback with the new date and time
      await onReschedule({
        date: newDate,
        time: newTime
      });

      onClose();
    } catch (error) {
      console.error('Error rescheduling:', error);
      setError(error.response?.data?.message || 'Er ging iets mis bij het verzetten van de afspraak');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06] w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-6">
          Afspraak verzetten
        </h3>
  
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Huidige afspraak info */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.08]">
            <p className="text-white/60 text-sm mb-2">Huidige afspraak:</p>
            <p className="text-white">
              {appointment.name} - {appointment.date} om {appointment.time}
            </p>
          </div>
  
          {/* Nieuwe datum */}
          <CustomDatePicker
            value={newDate}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            label="Nieuwe datum"
          />
  
          {/* Nieuwe tijd */}
          {availableTimes.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-white/80 text-sm font-medium">
                Nieuwe tijd
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <Clock size={18} />
                </div>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08]
                    rounded-xl text-white placeholder-white/40 transition-all duration-300"
                  required
                >
                  <option value="">Selecteer tijd</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
  
          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}
  
          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.05] text-white rounded-xl 
                hover:bg-white/[0.08] transition-all duration-300"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isLoading || !newDate || !newTime || (newDate === appointment.date && newTime === appointment.time)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white rounded-xl hover:from-blue-600 hover:to-blue-700 
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Afspraak verzetten'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleDialog;