import React, { useRef } from 'react';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';

const CustomDatePicker = ({ value, onChange, min, label }) => {
  const dateInputRef = useRef(null);

  const openPicker = () => {
    if (dateInputRef.current) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        dateInputRef.current.click();
      } else {
        dateInputRef.current.showPicker();
      }
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-white/80 text-sm font-medium">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={openPicker}
        className="w-full group relative hover:scale-[1.02] active:scale-[0.98] 
          transition-all duration-200"
      >
        <div className="w-full flex items-center justify-between px-4 py-3 
          bg-white/[0.05] border-2 border-blue-500/30 rounded-xl text-white 
          hover:bg-white/[0.08] transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <FiCalendar className="w-5 h-5 text-blue-400" />
            <span className="text-left">
              {value ? new Date(value).toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Selecteer datum'}
            </span>
          </div>
          <FiChevronRight className="w-5 h-5 text-blue-400 
            group-hover:translate-x-1 transition-transform duration-200" />
        </div>
        
        {!value && (
          <div className="absolute -right-2 -top-2 w-4 h-4 bg-blue-500 
            rounded-full animate-pulse" />
        )}
        
        <input
          ref={dateInputRef}
          type="date"
          value={value || ''}
          onChange={onChange}
          min={min}
          className="sr-only"
          required
        />
      </button>
    </div>
  );
};

export default CustomDatePicker;