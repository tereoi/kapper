import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, min, label }) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-white/80 text-sm font-medium">
          {label}
        </label>
      )}
      <div 
        onClick={handleClick}
        className="w-full flex items-center space-x-3 px-4 py-3 bg-white/[0.05] 
          border border-white/[0.08] rounded-xl text-white hover:bg-white/[0.08] 
          transition-all duration-300 focus:outline-none focus:ring-2 
          focus:ring-blue-500/30 cursor-pointer"
      >
        <Calendar className="w-5 h-5 text-white/40" />
        <span className="flex-grow text-left">
          {value ? new Date(value).toLocaleDateString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Selecteer datum'}
        </span>
        <input
          ref={inputRef}
          type="date"
          value={value || ''}
          onChange={onChange}
          min={min}
          className="absolute opacity-0 -z-10"
          required
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;