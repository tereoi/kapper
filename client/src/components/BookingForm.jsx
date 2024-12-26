import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Mail, Phone, User, Scissors, ChevronRight } from 'lucide-react';
import { config } from '../config';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: ''
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [workingDates, setWorkingDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkingHours();
    fetchAppointments();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/working-hours');
      setWorkingDates(response.data.map(day => ({
        date: day.date,
        isHoliday: day.isHoliday,
        maxAppointments: day.maxAppointments
      })));
    } catch (error) {
      console.error('Error fetching working dates:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const isDateFullyBooked = (date) => {
    const workingDate = workingDates.find(day => day.date === date);
    if (!workingDate) return 'closed';
  
    if (workingDate.isHoliday) return 'closed';
  
    // Check of er beschikbare tijden zijn voor deze datum
    const hasAvailableTimes = availableTimes && availableTimes.length > 0;
    return hasAvailableTimes ? 'available' : 'full';
  };

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setFormData({ ...formData, date: selectedDate, time: '' });

    try {
      const response = await axios.get(`${config.endpoints.appointments}/available-times/${selectedDate}`);
      setAvailableTimes(response.data.times || []);
    } catch (error) {
      console.error('Error fetching available times:', error);
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
    setIsLoading(true);
    try {
      await axios.post(config.endpoints.appointments, formData);
      setIsFormVisible(false);
      setTimeout(() => {
        setIsBooked(true);
      }, 500);
    } catch (error) {
      alert('Er ging iets mis bij het maken van de afspraak');
    } finally {
      setIsLoading(false);
    }
  };

  const formSteps = [
    // Personal Info
    {
      title: "Jouw gegevens",
      fields: [
        {
          name: "name",
          label: "Naam",
          type: "text",
          icon: <User className="w-5 h-5" />,
          placeholder: "Voer je naam in"
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          icon: <Mail className="w-5 h-5" />,
          placeholder: "naam@voorbeeld.nl"
        },
        {
          name: "phone",
          label: "Telefoon",
          type: "tel",
          icon: <Phone className="w-5 h-5" />,
          placeholder: "06 12345678"
        }
      ]
    },
    // Date & Service
    {
      title: "Kies een datum en service",
      fields: [
        {
          name: "service",
          type: "service-select",
          options: [
            { value: "Knippen" },
            { value: "Knippen en baard" }
          ]
        },
        {
          name: "date",
          label: "Datum",
          type: "date",
          icon: <Calendar className="w-5 h-5" />
        },
        {
          name: "time",
          label: "Tijd",
          type: "time-select",
          icon: <Clock className="w-5 h-5" />
        }
      ]
    }
  ];

  const renderField = (field) => {
    if (field.type === "service-select") {
      return (
        <div className="space-y-3 mb-6">
          <label className="text-sm text-white/80 font-medium">
            Service
          </label>
          {field.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, service: option.value })}
              className={`w-full p-4 rounded-2xl border transition-all duration-300
                ${formData.service === option.value
                  ? 'border-blue-500/30 bg-blue-500/10 text-white'
                  : 'border-white/[0.08] bg-white/[0.05] text-white/80 hover:bg-white/[0.08]'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Scissors className="w-5 h-5" />
                <span className="font-medium">{option.value}</span>
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (field.type === "time-select") {
      return (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {availableTimes.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setFormData({ ...formData, time })}
              className={`p-3 rounded-xl text-center transition-all duration-300
                ${formData.time === time
                  ? 'bg-blue-500/10 border-blue-500/30 text-white'
                  : 'bg-white/[0.05] border-white/[0.08] text-white/80 hover:bg-white/[0.08]'
                } border`}
            >
              {time}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <label className="text-sm text-white/80 font-medium">
          {field.label}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {field.icon}
          </div>
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={field.name === 'date' ? handleDateChange : handleChange}
            min={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
            className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08]
              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30
              text-white placeholder-white/40 transition-all duration-300"
            placeholder={field.placeholder}
            required
          />
        </div>
      </div>
    );
  };

  const isStepComplete = (stepIndex) => {
    const fields = formSteps[stepIndex].fields;
    return fields.every(field => formData[field.name]);
  };

  const isFormComplete = () => {
    return Object.values(formData).every(value => value);
  };

  if (isBooked) {
    return (
      <div className="relative z-20 max-w-md mx-auto">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06]
          shadow-xl animate-fade-in text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Afspraak bevestigd!</h3>
          <p className="text-white/80 mb-6">
            We hebben je afspraak ingepland voor {formData.date} om {formData.time}
          </p>
          <div className="space-y-4 text-left bg-white/[0.03] rounded-2xl p-4">
            <div className="flex justify-between">
              <span className="text-white/60">Service</span>
              <span className="text-white">{formData.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Datum</span>
              <span className="text-white">{formData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Tijd</span>
              <span className="text-white">{formData.time}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/[0.06] shadow-xl">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {formSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index !== formSteps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-500
                    ${index === currentStep
                      ? 'bg-blue-500 scale-125'
                      : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-white/20'
                    }`}
                />
                {index !== formSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all duration-500
                      ${index < currentStep ? 'bg-green-500' : 'bg-white/20'}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {formSteps[currentStep].title}
            </h2>
            
            <div className="space-y-4">
              {formSteps[currentStep].fields.map((field, index) => (
                <div key={index}>{renderField(field)}</div>
              ))}
            </div>

            {/* Booking Availability Message */}
            {formData.date && (
              <div className="mt-4">
                {(() => {
                  const dateStatus = isDateFullyBooked(formData.date);
                  switch (dateStatus) {
                    case 'closed':
                      return (
                        <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg">
                          Helaas zijn we gesloten op deze datum.
                        </div>
                      );
                    case 'full':
                      return (
                        <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg">
                          Sorry, we zitten helemaal vol op deze datum.
                        </div>
                      );
                    case 'available':
                      return (
                        <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-lg">
                          Er zijn nog plekken beschikbaar op deze datum.
                        </div>
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.08]">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(curr => curr - 1)}
                className="text-white/80 hover:text-white transition-colors duration-300"
              >
                Vorige
              </button>
            )}
            
            {currentStep < formSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(curr => curr + 1)}
                disabled={!isStepComplete(currentStep)}
                className="ml-auto flex items-center space-x-2 px-5 py-2.5 rounded-xl
                  bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Volgende</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  !isFormComplete() || 
                  isLoading || 
                  !availableTimes || 
                  availableTimes.length === 0
                }
                className="ml-auto flex items-center space-x-2 px-5 py-2.5 rounded-xl
                  bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Afspraak maken</span>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;