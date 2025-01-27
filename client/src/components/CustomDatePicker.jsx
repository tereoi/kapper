import React, { useState, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { config } from '../config';

const CustomDatePicker = ({ 
  value, 
  onChange, 
  min, 
  max,
  label = "Selecteer datum",
  workingDates = [], 
  className = "" 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [availabilityCache, setAvailabilityCache] = useState(new Map());

  // Fetch beschikbaarheid voor de huidige maand
  useEffect(() => {
    const fetchAvailabilityForMonth = async () => {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        const formattedDate = formatDate(date);
        if (!availabilityCache.has(formattedDate)) {
          try {
            const response = await axios.get(`${config.endpoints.appointments}/available-times/${formattedDate}`);
            const hasAvailableTimes = response.data.times && response.data.times.length > 0;
            setAvailabilityCache(prev => new Map(prev).set(formattedDate, hasAvailableTimes));
          } catch (error) {
            console.error('Error fetching availability:', error);
            setAvailabilityCache(prev => new Map(prev).set(formattedDate, false));
          }
        }
      }
    };

    fetchAvailabilityForMonth();
  }, [currentMonth]);

  const formatDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().split('T')[0];
  };

  const getDateStatus = (date) => {
    const formattedDate = formatDate(date);
    const workingDate = workingDates.find(wd => wd.date === formattedDate);
    
    // Als het geen werkdag is of een feestdag, dan is het dicht
    if (!workingDate || workingDate.isHoliday) return 'dicht';
    
    // Check beschikbare tijden
    const hasAvailableTimes = availabilityCache.get(formattedDate);
    if (hasAvailableTimes === false) return 'vol';
    
    return 'open';
  };

  const getDateClasses = (date, isSelected) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const status = getDateStatus(date);
    const isPast = date < today;
    
    const baseClasses = "h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 relative ";
    
    if (isPast) {
      return baseClasses + "text-white/20 cursor-not-allowed";
    }
    
    if (isSelected) {
      return baseClasses + "bg-blue-500 text-white hover:bg-blue-600";
    }
    
    switch (status) {
      case 'open':
        return baseClasses + "bg-green-500/10 text-green-400 hover:bg-green-500/20 cursor-pointer";
      case 'vol':
        return baseClasses + "bg-yellow-500/10 text-yellow-400 cursor-pointer";
      case 'dicht':
        return baseClasses + "bg-red-500/10 text-red-400 cursor-pointer";
      default:
        return baseClasses + "text-white hover:bg-white/10";
    }
  };

  const handleDateClick = (date) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );
    newDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) return;

    setSelectedDate(newDate);
    const formattedDate = formatDate(newDate);
    onChange({ target: { value: formattedDate, name: 'date' } });
    setShowCalendar(false);
  };

  const handleMonthChange = (increment) => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + increment,
      1
    );
    setCurrentMonth(newMonth);
  };

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const startDay = startDayOfMonth(currentMonth);

    // Add empty cells for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      date.setHours(0, 0, 0, 0);
      
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = date < today;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isPast}
          className={getDateClasses(date, isSelected)}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "Januari", "Februari", "Maart", "April", "Mei", "Juni",
    "Juli", "Augustus", "September", "Oktober", "November", "December"
  ];

  return (
    <div className={`relative ${className}`}>
      <label className="block text-white/80 text-sm font-medium mb-1.5">
        {label}
      </label>
      
      <div className="relative">
        <div 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          aria-hidden="true"
        >
          <FiCalendar className="w-5 h-5" />
        </div>
        
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          onClick={() => setShowCalendar(true)}
          readOnly
          className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08]
            rounded-xl text-white placeholder-white/40 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
            transition-all duration-300"
          placeholder="Selecteer een datum"
        />
      </div>

      {showCalendar && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowCalendar(false)} 
          />
          
          <div className="absolute left-0 right-0 mt-2 p-4 bg-black/90 backdrop-blur-xl
            border border-white/[0.08] rounded-2xl shadow-xl z-50">
            
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => handleMonthChange(-1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
              >
                <FiChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-white font-medium">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              
              <button
                type="button"
                onClick={() => handleMonthChange(1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
              >
                <FiChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(day => (
                <div key={day} className="text-sm text-white/60 font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500/10" />
                <span className="text-green-400">Open</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500/10" />
                <span className="text-yellow-400">Vol</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/10" />
                <span className="text-red-400">Dicht</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDatePicker;