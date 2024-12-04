import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Mail, Phone, User, Scissors, Star, Sparkles } from 'lucide-react';

// BookingConfirmation Component
const BookingConfirmation = ({ bookingDetails }) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className={`relative min-h-[500px] w-full max-w-lg mx-auto bg-gradient-to-b from-indigo-900 to-purple-900 
      rounded-2xl shadow-2xl p-8 overflow-hidden
      transition-all duration-[2000ms] ease-out transform origin-center
      ${animate 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-50 translate-y-24'
      }`}
    >
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-[2000ms] delay-1000"
           style={{ opacity: animate ? 1 : 0 }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`star absolute w-1 h-1 bg-white rounded-full opacity-70`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Success icon */}
      <div className={`relative flex justify-center mb-8 transition-all duration-[2000ms] delay-[1500ms]
        transform ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-full scale-50'}`}>
        <div className="relative">
          <div className="absolute inset-0 animate-[ping_2s_ease-in-out_infinite]">
            <Sparkles className="w-16 h-16 text-purple-400 opacity-50" />
          </div>
          <Sparkles className="w-16 h-16 text-purple-300" />
        </div>
      </div>

      {/* Confirmation text */}
      <div className={`text-center mb-8 transition-all duration-[2000ms] delay-[2000ms]
        transform ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <h2 className="text-2xl font-bold text-white mb-2">
          Je afspraak is bevestigd!
        </h2>
        <p className="text-purple-200">
          Bereid je voor op een knipbeurt die out of this world is
        </p>
      </div>

      {/* Booking details */}
      <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 space-y-4 
        transition-all duration-[2000ms] delay-[2500ms]
        transform ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'}`}>
        <div className="flex items-center space-x-4 text-white">
          <Calendar className="w-5 h-5 text-purple-300" />
          <span>{bookingDetails.date}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-white">
          <Clock className="w-5 h-5 text-purple-300" />
          <span>{bookingDetails.time}</span>
        </div>

        <div className="flex items-center space-x-4 text-white">
          <Star className="w-5 h-5 text-purple-300" />
          <span>{bookingDetails.service}</span>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500
        transition-transform duration-[3000ms] delay-[3000ms] ${animate ? 'scale-x-100' : 'scale-x-0'}`} />
    </div>
  );
};

// Main BookingForm Component
const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: ''
  });
  const [workingDates, setWorkingDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    fetchWorkingDates();
  }, []);

  const fetchWorkingDates = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/working-hours');
      setWorkingDates(response.data.map(day => day.date));
    } catch (error) {
      console.error('Error fetching working dates:', error);
    }
  };

  const isDateAvailable = (date) => workingDates.includes(date);

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setFormData({ ...formData, date: selectedDate, time: '' });

    if (isDateAvailable(selectedDate)) {
      try {
        const response = await axios.get(`http://localhost:3001/api/appointments/available-times/${selectedDate}`);
        setAvailableTimes(response.data.times || []);
      } catch (error) {
        console.error('Error fetching available times:', error);
        setAvailableTimes([]);
      }
    } else {
      setAvailableTimes([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/appointments', formData);
      setIsFormVisible(false);
      setTimeout(() => {
        setIsBooked(true);
      }, 500);
    } catch (error) {
      alert('Er ging iets mis bij het maken van de afspraak');
    }
  };

  const formFields = [
    // Stap 1: Persoonlijke gegevens
    [
      {
        label: 'Naam',
        name: 'name',
        type: 'text',
        icon: <User className="w-5 h-5 text-purple-300" />,
        required: true
      },
      {
        label: 'Email',
        name: 'email',
        type: 'email',
        icon: <Mail className="w-5 h-5 text-purple-300" />,
        required: true
      },
      {
        label: 'Telefoon',
        name: 'phone',
        type: 'tel',
        icon: <Phone className="w-5 h-5 text-purple-300" />,
        required: true
      }
    ],
    // Stap 2: Service, datum en tijd
    [
      {
        label: 'Datum',
        name: 'date',
        type: 'date',
        icon: <Calendar className="w-5 h-5 text-purple-300" />,
        required: true
      },
      {
        label: 'Tijd',
        name: 'time',
        type: 'select',
        icon: <Clock className="w-5 h-5 text-purple-300" />,
        options: availableTimes,
        required: true,
        disabled: !formData.date || !isDateAvailable(formData.date)
      },
      {
        label: 'Service',
        name: 'service',
        type: 'select',
        icon: <Scissors className="w-5 h-5 text-purple-300" />,
        options: ['Knippen', 'Knippen en baard'],
        required: true
      }
    ]
  ];

  const nextStep = () => {
    const currentFields = formFields[currentStep];
    const isStepValid = currentFields.every(field => 
      formData[field.name] && (!field.validation || field.validation(formData[field.name]))
    );
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, formFields.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  if (isBooked) {
    return <BookingConfirmation bookingDetails={formData} />;
  }

  return (
    <div className={`max-w-md mx-auto transition-all duration-500 ${isFormVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}>
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-purple-500/20">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-4 px-6">
          <h2 className="text-xl font-semibold text-white">Maak een afspraak</h2>
        </div>
        
        {/* Progress steps */}
        <div className="px-6 pt-4">
          <div className="flex justify-center gap-4 mb-4"> {/* Veranderd van justify-between naar justify-center en gap-4 toegevoegd */}
            {formFields.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-purple-500 scale-125' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {formFields[currentStep].map((field) => (
              <div
                key={field.name}
                className="transform transition-all duration-500 hover:translate-x-1"
              >
                <label className="block text-sm font-medium text-purple-300 mb-1">{field.label}</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {field.icon}
                  </div>
                  
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      disabled={field.disabled}
                      className="w-full pl-10 pr-3 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg 
                        focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300
                        disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                      required={field.required}
                    >
                      <option value="">Selecteer een {field.label.toLowerCase()}</option>
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={field.name === 'date' ? handleDateChange : handleChange}
                      min={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                      className={`w-full pl-10 pr-3 py-2 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg 
                        focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300
                        ${field.name === 'date' && formData.date && !isDateAvailable(formData.date) 
                          ? 'border-red-500/50 bg-red-900/20' 
                          : ''}`}
                      required={field.required}
                    />
                  )}
                </div>
                {field.name === 'date' && formData.date && !isDateAvailable(formData.date) && (
                  <p className="text-red-400 text-sm mt-1 animate-pulse">De kapper werkt niet op deze datum</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between space-x-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-slate-700/50 text-white py-2 px-4 rounded-lg hover:bg-slate-600/50 
                  transition-all duration-300 border border-purple-500/30 hover:border-purple-500/50"
              >
                Vorige
              </button>
            )}
            
            {currentStep < formFields.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg
                  hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!formFields[currentStep].every(field => formData[field.name])}
              >
                Volgende
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg
                  hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!formData.time || !isDateAvailable(formData.date)}
              >
                Afspraak maken
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;