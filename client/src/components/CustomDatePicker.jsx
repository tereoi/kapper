import React, { useState, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CustomDatePicker = ({ 
  value, 
  onChange, 
  min, 
  max,
  label = "Selecteer datum",
  workingDates = [], // Optional array of available dates
  className = "" 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateDisabled = (date) => {
    const formattedDate = formatDate(date);
    
    // Check minimum date
    if (min && formattedDate < min) return true;
    
    // Check maximum date
    if (max && formattedDate > max) return true;
    
    // If workingDates is provided, check if the date is available
    if (workingDates.length > 0) {
      return !workingDates.some(workingDate => 
        workingDate.date === formattedDate && !workingDate.isHoliday
      );
    }
    
    return false;
  };

  const handleDateClick = (date) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );
    
    if (!isDateDisabled(newDate)) {
      setSelectedDate(newDate);
      onChange({ target: { value: formatDate(newDate) } });
      setShowCalendar(false);
    }
  };

  const handleMonthChange = (increment) => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + increment,
      1
    ));
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
      const isDisabled = isDateDisabled(date);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`h-10 w-10 rounded-lg flex items-center justify-center
            transition-all duration-300 relative
            ${isDisabled 
              ? 'text-white/20 cursor-not-allowed' 
              : 'hover:bg-white/10'
            }
            ${isSelected 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'text-white'
            }`}
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
            
            {/* Calendar Header */}
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

            {/* Calendar Grid */}
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
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDatePicker;