import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Plus, X, Trash2 } from 'lucide-react';

const WorkingHoursManager = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [workingHours, setWorkingHours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/working-hours');
      setWorkingHours(response.data);
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let current = start;
    while (current <= end) {
      slots.push(current);
      // Add 30 minutes
      const [hours, minutes] = current.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + 30;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      if (current > end) break;
    }
    return slots;
  };

  const addWorkingHours = async () => {
    if (!selectedDate || !startTime || !endTime) return;
    setIsLoading(true);
    try {
      const timeSlots = generateTimeSlots(startTime, endTime);
      await axios.post('http://localhost:3001/api/admin/working-hours', {
        date: selectedDate,
        startTime,
        endTime,
        availableTimeSlots: timeSlots
      });
      fetchWorkingHours();
      setSelectedDate('');
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error adding working hours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeWorkingHours = async (date) => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/admin/working-hours/${date}`);
      fetchWorkingHours();
    } catch (error) {
      console.error('Error removing working hours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTimeSlot = async (date, timeToRemove) => {
    setIsLoading(true);
    try {
      const workingDay = workingHours.find(day => day.date === date);
      if (!workingDay) return;

      const updatedTimeSlots = workingDay.availableTimeSlots.filter(time => time !== timeToRemove);
      
      await axios.put(`http://localhost:3001/api/admin/working-hours/${date}`, {
        ...workingDay,
        availableTimeSlots: updatedTimeSlots
      });
      
      fetchWorkingHours();
    } catch (error) {
      console.error('Error removing time slot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-purple-500/20">
      <h3 className="text-xl font-semibold text-white mb-4">Werkdagen & Tijden Beheer</h3>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg 
              focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg 
              focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Start tijd"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg 
              focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Eind tijd"
          />
          <button
            onClick={addWorkingHours}
            disabled={isLoading || !selectedDate || !startTime || !endTime}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg
              hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50
              disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            Toevoegen
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {workingHours
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((workingDay) => (
          <div
            key={workingDay.date}
            className="p-4 bg-slate-700/30 rounded-lg border border-purple-500/20 
              hover:border-purple-500/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">{workingDay.date}</span>
              <div className="flex items-center space-x-4">
                <span className="text-purple-300">
                  {workingDay.startTime} - {workingDay.endTime}
                </span>
                <button
                  onClick={() => removeWorkingHours(workingDay.date)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {workingDay.availableTimeSlots?.sort().map((time) => (
                <div
                  key={time}
                  className="group flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full"
                >
                  <span className="text-purple-300">{time}</span>
                  <button
                    onClick={() => removeTimeSlot(workingDay.date, time)}
                    className="text-purple-400 hover:text-red-300 transition-colors duration-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkingHoursManager;