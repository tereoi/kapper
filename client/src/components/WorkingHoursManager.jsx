import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Plus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const WorkingHoursManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [workingHours, setWorkingHours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        );
      }
    }
    return times;
  };

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
        const existingDay = workingHours.find(day => day.date === selectedDate);
        
        if (existingDay) {
            // Generate new time slots
            const newTimeSlots = generateTimeSlots(startTime, endTime);
            
            // Combine with existing slots and sort
            const allSlots = [...existingDay.availableTimeSlots, ...newTimeSlots]
                .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
                .sort((a, b) => {
                    const [aHours, aMinutes] = a.split(':').map(Number);
                    const [bHours, bMinutes] = b.split(':').map(Number);
                    return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
                });

            // Update the working hours
            await axios.put(`http://localhost:3001/api/admin/working-hours/${selectedDate}`, {
                date: selectedDate,
                startTime: allSlots[0],
                endTime: allSlots[allSlots.length - 1],
                availableTimeSlots: allSlots
            });
        } else {
            // Create new working hours
            await axios.post('http://localhost:3001/api/admin/working-hours', {
                date: selectedDate,
                startTime,
                endTime,
                availableTimeSlots: generateTimeSlots(startTime, endTime)
            });
        }

        await fetchWorkingHours(); // Fetch updated data
        setStartTime('');
        setEndTime('');
    } catch (error) {
        console.error('Error adding working hours:', error);
    } finally {
        setIsLoading(false);
    }
};

  const navigateDay = (direction) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    const date = new Date(dateString);
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
      
      if (updatedTimeSlots.length > 0) {
        await axios.put(`http://localhost:3001/api/admin/working-hours/${date}`, {
          ...workingDay,
          startTime: updatedTimeSlots[0], // Update start time to first remaining slot
          endTime: updatedTimeSlots[updatedTimeSlots.length - 1], // Update end time to last remaining slot
          availableTimeSlots: updatedTimeSlots
        });
      } else {
        // If no slots remain, remove the entire working day
        await removeWorkingHours(date);
      }
      
      fetchWorkingHours();
    } catch (error) {
      console.error('Error removing time slot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timeOptions = generateTimeOptions();
  const selectedDayHours = workingHours.find(day => day.date === selectedDate);

  // Filter available time options based on existing times
  const getFilteredTimeOptions = () => {
    if (!selectedDayHours) return timeOptions;
    
    const existingStart = selectedDayHours.startTime;
    const existingEnd = selectedDayHours.endTime;
    
    return timeOptions.filter(time => 
      time < existingStart || time > existingEnd
    );
  };

  const filteredTimeOptions = getFilteredTimeOptions();

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-purple-500/20">
      <h3 className="text-xl font-semibold text-white mb-4">Werkdagen & Tijden Beheer</h3>
      
      <div className="flex items-center justify-between mb-6">
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
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setEndTime(''); // Reset end time when start time changes
            }}
            className="px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg 
              focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">Start tijd</option>
            {filteredTimeOptions.map((time) => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg 
              focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">Eind tijd</option>
            {filteredTimeOptions
              .filter(time => time > startTime)
              .map((time) => (
                <option key={`end-${time}`} value={time}>
                  {time}
                </option>
              ))}
          </select>
          <button
            onClick={addWorkingHours}
            disabled={isLoading || !startTime || !endTime}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg
              hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50
              disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            Tijden toevoegen
          </button>
        </div>
      </div>

      <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
        {selectedDayHours ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <span className="text-purple-300">
                  {selectedDayHours.startTime} - {selectedDayHours.endTime}
                </span>
                <button
                  onClick={() => removeWorkingHours(selectedDate)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedDayHours.availableTimeSlots?.sort().map((time) => (
                <div
                  key={time}
                  className="group flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full"
                >
                  <span className="text-purple-300">{time}</span>
                  <button
                    onClick={() => removeTimeSlot(selectedDate, time)}
                    className="text-purple-400 hover:text-red-300 transition-colors duration-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-4">
            Geen werktijden ingesteld voor deze dag
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkingHoursManager;