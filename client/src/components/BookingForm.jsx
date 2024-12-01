import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  // Haal werkdagen op wanneer component laadt
  useEffect(() => {
    fetchWorkingDates();
  }, []);

  // Haal werkdagen op
  const fetchWorkingDates = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/working-hours');
      setWorkingDates(response.data.map(day => day.date));
    } catch (error) {
      console.error('Error fetching working dates:', error);
    }
  };

  // Controleer of een datum beschikbaar is
  const isDateAvailable = (date) => workingDates.includes(date);

  // Handle date change en haal beschikbare tijden op
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
      alert('Afspraak succesvol gemaakt!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        service: ''
      });
      setAvailableTimes([]);
    } catch (error) {
      alert('Er ging iets mis bij het maken van de afspraak');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-blue-600 py-4 px-6">
        <h2 className="text-xl font-semibold text-white">Maak een afspraak</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
                ${formData.date && !isDateAvailable(formData.date) ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              required
            />
            {formData.date && !isDateAvailable(formData.date) && (
              <p className="text-red-500 text-sm mt-1">De kapper werkt niet op deze datum</p>
            )}
          </div>

          {availableTimes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tijd</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecteer een tijd</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecteer een service</option>
              <option value="Knippen">Knippen</option>
              <option value="Knippen en föhnen">Knippen en föhnen</option>
              <option value="Kleuren">Kleuren</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
          disabled={!formData.time || !isDateAvailable(formData.date)}
        >
          Afspraak maken
        </button>
      </form>
    </div>
  );
};

export default BookingForm;