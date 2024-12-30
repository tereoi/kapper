import React, { useState, useEffect } from 'react';
import { FiClock, FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { config } from '../config';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

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

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let current = start;
    
    while (current <= end) {
      slots.push(current);
      const [hours, minutes] = current.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + 40;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      if (current > end) break;
    }
    return slots;
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

  const generateEndTimeOptions = (startTime) => {
    if (!startTime) return [];
    const times = [];
    let current = startTime;
    
    while (true) {
      const [hours, minutes] = current.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + 40;
      if (totalMinutes >= 24 * 60) break;
      
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      times.push(current);
    }
    return times;
  };

  const generateBreakOptions = (startTime, endTime) => {
    if (!startTime || !endTime) return [];
    const times = [];
    let current = startTime;
    
    while (current < endTime) {
      times.push(current);
      const [hours, minutes] = current.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + 40;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }
    return times;
  };

  const addWorkingHours = async () => {
    if (!selectedDate || !startTime || !endTime) return;
    setIsLoading(true);
    try {
      const existingDay = workingHours.find(day => day.date === selectedDate);
      
      if (existingDay) {
        // Genereer nieuwe slots voor dit tijdsblok
        const newSlots = generateTimeSlots(startTime, endTime);
        
        // Combineer met bestaande slots
        let allTimeSlots = [...existingDay.availableTimeSlots, ...newSlots];
        
        // Sorteer alle slots
        allTimeSlots = allTimeSlots
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort((a, b) => {
            const [aHours, aMinutes] = a.split(':').map(Number);
            const [bHours, bMinutes] = b.split(':').map(Number);
            return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
          });
  
        // Groepeer aansluitende tijdsblokken
        const timeBlocks = [];
        let currentBlock = {
          startTime: allTimeSlots[0],
          slots: [allTimeSlots[0]]
        };
  
        for (let i = 1; i < allTimeSlots.length; i++) {
          const currentTime = allTimeSlots[i];
          const prevTime = allTimeSlots[i - 1];
          
          // Check of tijden aansluiten (40 minuten verschil)
          const [prevHours, prevMinutes] = prevTime.split(':').map(Number);
          const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
          const prevTotalMinutes = prevHours * 60 + prevMinutes;
          const currentTotalMinutes = currentHours * 60 + currentMinutes;
          
          if (currentTotalMinutes - prevTotalMinutes === 40) {
            currentBlock.slots.push(currentTime);
          } else {
            // Sluit huidige blok af en start nieuwe
            timeBlocks.push({
              ...currentBlock,
              endTime: prevTime
            });
            currentBlock = {
              startTime: currentTime,
              slots: [currentTime]
            };
          }
        }
        
        // Voeg laatste blok toe
        timeBlocks.push({
          ...currentBlock,
          endTime: currentBlock.slots[currentBlock.slots.length - 1]
        });
  
        // Update working hours met alle blokken
        await Promise.all(timeBlocks.map(async (block) => {
          await axios.put(`${config.endpoints.admin.workingHours}/${selectedDate}`, {
            date: selectedDate,
            startTime: block.startTime,
            endTime: block.endTime,
            availableTimeSlots: block.slots,
            breaks: existingDay.breaks || []
          });
        }));
      } else {
        // Voor een nieuwe dag, maak gewoon één blok aan
        const slots = generateTimeSlots(startTime, endTime);
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
      const slots = workingDay.availableTimeSlots;
      const breakTimeSlots = updatedBreaks.flatMap(breakTime => 
        generateTimeSlots(breakTime.startTime, breakTime.endTime)
      );

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
        const slots = generateTimeSlots(workingDay.startTime, workingDay.endTime);
        const breakTimeSlots = updatedBreaks.flatMap(breakTime => 
          generateTimeSlots(breakTime.startTime, breakTime.endTime)
        );

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

  const timeOptions = generateTimeOptions();
  const selectedDayHours = workingHours.find(day => day.date === selectedDate);

  const getFilteredTimeOptions = () => {
    if (!selectedDayHours) return timeOptions;
    const existingStart = selectedDayHours.startTime;
    const existingEnd = selectedDayHours.endTime;
    return timeOptions.filter(time => time < existingStart || time > existingEnd);
  };

  return (
    <div className="bg-white/[0.03] rounded-2xl p-4 sm:p-6 border border-white/[0.08]">
      <h3 className="text-xl font-semibold text-white mb-6">Werkdagen & Tijden Beheer</h3>
      
      <div className="space-y-6">
        {/* Werktijden toevoegen */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Werktijden toevoegen</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setEndTime('');
              }}
              className="w-full px-4 py-3 bg-black/40 text-white border border-white/[0.08] 
                rounded-xl focus:ring-2 focus:ring-blue-500/30 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <option value="">Start tijd</option>
              {getFilteredTimeOptions().map((time) => (
                <option key={`start-${time}`} value={time}>{time}</option>
              ))}
            </select>

            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 text-white border border-white/[0.08] 
                rounded-xl focus:ring-2 focus:ring-blue-500/30 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <option value="">Eind tijd</option>
              {generateEndTimeOptions(startTime).map((time) => (
                <option key={`end-${time}`} value={time}>{time}</option>
              ))}
            </select>

            <button
              onClick={addWorkingHours}
              disabled={isLoading || !startTime || !endTime}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white rounded-xl transition-all duration-300 disabled:opacity-50 
                active:scale-[0.98] disabled:active:scale-100 flex items-center 
                justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiPlus size={18} />
                  <span>Tijden toevoegen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pauzes */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Pauzes beheren</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={breakStart}
              onChange={(e) => setBreakStart(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 text-white border border-white/[0.08] 
                rounded-xl focus:ring-2 focus:ring-blue-500/30 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <option value="">Start pauze</option>
              {generateBreakOptions(selectedDayHours?.startTime, selectedDayHours?.endTime)
                .map((time) => (
                  <option key={`break-start-${time}`} value={time}>{time}</option>
              ))}
            </select>

            <select
              value={breakEnd}
              onChange={(e) => setBreakEnd(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 text-white border border-white/[0.08] 
                rounded-xl focus:ring-2 focus:ring-blue-500/30 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <option value="">Eind pauze</option>
              {generateBreakOptions(breakStart, selectedDayHours?.endTime)
                .filter(time => time > breakStart)
                .map((time) => (
                  <option key={`break-end-${time}`} value={time}>{time}</option>
              ))}
            </select>

            <button
              onClick={addBreak}
              disabled={!breakStart || !breakEnd}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white rounded-xl transition-all duration-300 disabled:opacity-50 
                active:scale-[0.98] disabled:active:scale-100 flex items-center 
                justify-center space-x-2"
            >
              <FiPlus size={18} />
              <span>Pauze toevoegen</span>
            </button>
          </div>

          {selectedDayHours?.breaks?.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {selectedDayHours.breaks.map((breakTime, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 
                      rounded-xl border border-red-500/30"
                  >
                    <span className="text-red-300">
                      {breakTime.startTime} - {breakTime.endTime}
                    </span>
                    <button
                      onClick={() => handleDeleteBreak(index)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-300
                        p-1 rounded-lg active:scale-[0.98]"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Huidige werktijden */}
        <div className="bg-black/40 rounded-xl p-4 border border-white/[0.08]">
          {selectedDayHours ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-blue-400 font-medium">
                    {selectedDayHours.startTime} - {selectedDayHours.endTime}
                  </span>
                  <button
                    onClick={() => handleDeleteWorkingHours(selectedDate)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-300
                      p-2 rounded-lg active:scale-[0.98]"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedDayHours.availableTimeSlots?.sort().map((time) => (
                  <div
                    key={time}
                    className="group flex items-center gap-2 px-3 py-2 bg-blue-500/10 
                      rounded-xl border border-blue-500/30"
                  >
                    <span className="text-blue-300">{time}</span>
                    <button
                      onClick={() => handleDeleteTimeSlot(selectedDate, time)}
                      className="text-blue-400 hover:text-red-300 transition-colors duration-300
                        p-1 rounded-lg active:scale-[0.98]"
                    >
                      {/* <X size={14} /> */}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-center py-4">
              Geen werktijden ingesteld voor deze dag
            </div>
          )}
        </div>
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