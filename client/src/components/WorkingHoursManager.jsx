import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Plus, X, Trash2 } from 'lucide-react';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { config } from '../config';

const WorkingHoursManager = ({ selectedDate }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');
  const [workingHours, setWorkingHours] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);

  useEffect(() => {
    fetchWorkingHours();
  }, [selectedDate]);

  const fetchWorkingHours = async () => {
    try {
      const response = await axios.get(config.endpoints.admin.workingHours);
      setWorkingHours(response.data);
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const addWorkingHours = async () => {
    if (!selectedDate || !startTime || !endTime) return;
    setIsLoading(true);
    try {
      const existingDay = workingHours.find(day => day.date === selectedDate);
      
      if (existingDay) {
        // Generate time slots
        const slots = [];
        let current = startTime;
        
        while (current <= endTime) {
          slots.push(current);
          const [hours, minutes] = current.split(':').map(Number);
          let totalMinutes = hours * 60 + minutes + 30;
          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;
          current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
          if (current > endTime) break;
        }

        // Filter out break times
        const breakTimeSlots = existingDay.breaks?.flatMap(breakTime => {
          return slots.filter(slot => {
            const slotParts = slot.split(':').map(Number);
            const slotMinutes = slotParts[0] * 60 + slotParts[1];
            
            const startParts = breakTime.startTime.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            
            const endParts = breakTime.endTime.split(':').map(Number);
            const endMinutes = endParts[0] * 60 + endParts[1];
            
            return slotMinutes >= startMinutes && slotMinutes < endMinutes;
          });
        }) || [];

        // Combine with existing slots
        const allSlots = [...existingDay.availableTimeSlots, ...slots]
          .filter(time => !breakTimeSlots.includes(time))
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort((a, b) => {
            const [aHours, aMinutes] = a.split(':').map(Number);
            const [bHours, bMinutes] = b.split(':').map(Number);
            return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
          });

        await axios.put(`${config.endpoints.admin.workingHours}/${selectedDate}`, {
          date: selectedDate,
          startTime: allSlots[0],
          endTime: allSlots[allSlots.length - 1],
          availableTimeSlots: allSlots,
          breaks: existingDay.breaks || []
        });
      } else {
        // Create new working hours
        let slots = [];
        let current = startTime;
        
        while (current <= endTime) {
          slots.push(current);
          const [hours, minutes] = current.split(':').map(Number);
          let totalMinutes = hours * 60 + minutes + 30;
          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;
          current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
          if (current > endTime) break;
        }

        await axios.post(config.endpoints.admin.workingHours, {
          date: selectedDate,
          startTime,
          endTime,
          availableTimeSlots: slots,
          breaks: []
        });
      }

      await fetchWorkingHours();
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error adding working hours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBreak = async () => {
    if (!breakStart || !breakEnd || !selectedDate) return;
    
    try {
      const workingDay = workingHours.find(day => day.date === selectedDate);
      if (!workingDay) return;

      const updatedBreaks = [...(workingDay.breaks || []), { startTime: breakStart, endTime: breakEnd }];
      
      // Filter out break times
      const slots = workingDay.availableTimeSlots;
      const breakTimeSlots = updatedBreaks.flatMap(breakTime => {
        return slots.filter(slot => {
          const slotParts = slot.split(':').map(Number);
          const slotMinutes = slotParts[0] * 60 + slotParts[1];
          
          const startParts = breakTime.startTime.split(':').map(Number);
          const startMinutes = startParts[0] * 60 + startParts[1];
          
          const endParts = breakTime.endTime.split(':').map(Number);
          const endMinutes = endParts[0] * 60 + endParts[1];
          
          return slotMinutes >= startMinutes && slotMinutes < endMinutes;
        });
      });

      const updatedTimeSlots = slots.filter(time => !breakTimeSlots.includes(time));

      await axios.put(`${config.endpoints.admin.workingHours}/${selectedDate}`, {
        ...workingDay,
        breaks: updatedBreaks,
        availableTimeSlots: updatedTimeSlots
      });

      fetchWorkingHours();
      setBreakStart('');
      setBreakEnd('');
    } catch (error) {
      console.error('Error adding break:', error);
    }
  };

  const handleDeleteBreak = async (breakIndex) => {
    setDeleteAction(() => async () => {
      try {
        const workingDay = workingHours.find(day => day.date === selectedDate);
        if (!workingDay) return;

        const updatedBreaks = workingDay.breaks.filter((_, index) => index !== breakIndex);
        
        // Regenerate all time slots
        let slots = [];
        let current = workingDay.startTime;
        while (current <= workingDay.endTime) {
          slots.push(current);
          const [hours, minutes] = current.split(':').map(Number);
          let totalMinutes = hours * 60 + minutes + 30;
          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;
          current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
          if (current > workingDay.endTime) break;
        }

        // Filter out remaining break times
        const breakTimeSlots = updatedBreaks.flatMap(breakTime => {
          return slots.filter(slot => {
            const slotParts = slot.split(':').map(Number);
            const slotMinutes = slotParts[0] * 60 + slotParts[1];
            
            const startParts = breakTime.startTime.split(':').map(Number);
            const startMinutes = startParts[0] * 60 + startParts[1];
            
            const endParts = breakTime.endTime.split(':').map(Number);
            const endMinutes = endParts[0] * 60 + endParts[1];
            
            return slotMinutes >= startMinutes && slotMinutes < endMinutes;
          });
        });

        const updatedTimeSlots = slots.filter(time => !breakTimeSlots.includes(time));

        await axios.put(`${config.endpoints.admin.workingHours}/${selectedDate}`, {
          ...workingDay,
          breaks: updatedBreaks,
          availableTimeSlots: updatedTimeSlots
        });

        fetchWorkingHours();
      } catch (error) {
        console.error('Error removing break:', error);
      }
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTimeSlot = async (date, time) => {
    setDeleteAction(() => async () => {
      setIsLoading(true);
      try {
        const workingDay = workingHours.find(day => day.date === date);
        if (!workingDay) return;

        const updatedTimeSlots = workingDay.availableTimeSlots.filter(t => t !== time);
        
        if (updatedTimeSlots.length > 0) {
          await axios.put(`${config.endpoints.admin.workingHours}/${date}`, {
            ...workingDay,
            startTime: updatedTimeSlots[0],
            endTime: updatedTimeSlots[updatedTimeSlots.length - 1],
            availableTimeSlots: updatedTimeSlots
          });
        } else {
          await handleDeleteWorkingHours(date);
        }
        
        fetchWorkingHours();
      } catch (error) {
        console.error('Error removing time slot:', error);
      } finally {
        setIsLoading(false);
      }
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteWorkingHours = async (date) => {
    setDeleteAction(() => async () => {
      setIsLoading(true);
      try {
        await axios.delete(`${config.endpoints.admin.workingHours}/${date}`);
        fetchWorkingHours();
      } catch (error) {
        console.error('Error removing working hours:', error);
      } finally {
        setIsLoading(false);
      }
    });
    setIsDeleteDialogOpen(true);
  };

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

  const timeOptions = generateTimeOptions();
  const selectedDayHours = workingHours.find(day => day.date === selectedDate);

  const getFilteredTimeOptions = () => {
    if (!selectedDayHours) return timeOptions;
    
    const existingStart = selectedDayHours.startTime;
    const existingEnd = selectedDayHours.endTime;
    
    return timeOptions.filter(time => 
      time < existingStart || time > existingEnd
    );
  };
  return (
    <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08]">
      <h3 className="text-xl font-semibold text-white mb-6">Werkdagen & Tijden Beheer</h3>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setEndTime('');
            }}
            className="px-4 py-2 bg-white/[0.05] text-white border border-white/[0.08] rounded-xl 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">Start tijd</option>
            {getFilteredTimeOptions().map((time) => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="px-4 py-2 bg-white/[0.05] text-white border border-white/[0.08] rounded-xl 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">Eind tijd</option>
            {getFilteredTimeOptions()
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
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl
              hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50
              disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            Tijden toevoegen
          </button>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <h4 className="text-lg font-medium text-white">Pauzes Beheren</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={breakStart}
            onChange={(e) => setBreakStart(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg"
          >
            <option value="">Start pauze</option>
            {timeOptions.map((time) => (
              <option key={`break-start-${time}`} value={time}>{time}</option>
            ))}
          </select>
          <select
            value={breakEnd}
            onChange={(e) => setBreakEnd(e.target.value)}
            className="px-4 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg"
          >
            <option value="">Eind pauze</option>
            {timeOptions
              .filter(time => time > breakStart)
              .map((time) => (
                <option key={`break-end-${time}`} value={time}>{time}</option>
            ))}
          </select>
          <button
            onClick={addBreak}
            disabled={!breakStart || !breakEnd}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl
              hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50
              disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            Pauze toevoegen
          </button>
        </div>

        {selectedDayHours?.breaks?.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {selectedDayHours.breaks.map((breakTime, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full"
                >
                  <span className="text-red-300">
                    {breakTime.startTime} - {breakTime.endTime}
                  </span>
                  <button
                    onClick={() => handleDeleteBreak(index)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20 mt-6">
        {selectedDayHours ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <span className="text-purple-300">
                  {selectedDayHours.startTime} - {selectedDayHours.endTime}
                </span>
                <button
                  onClick={() => handleDeleteWorkingHours(selectedDate)}
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
                    onClick={() => handleDeleteTimeSlot(selectedDate, time)}
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

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteAction(null);
        }}
        onDelete={async () => {
          await deleteAction();
          setIsDeleteDialogOpen(false);
          setDeleteAction(null);
        }}
      />
    </div>
  );
};

export default WorkingHoursManager;