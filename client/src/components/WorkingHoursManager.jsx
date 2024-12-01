import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkingHoursManager = () => {
  const [workingHours, setWorkingHours] = useState([]);
  const [newWorkingHours, setNewWorkingHours] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

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

  const handleChange = (e) => {
    setNewWorkingHours({
      ...newWorkingHours,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/admin/working-hours', newWorkingHours);
      fetchWorkingHours(); // Ververs de lijst
      setNewWorkingHours({ // Reset het formulier
        date: '',
        startTime: '',
        endTime: ''
      });
    } catch (error) {
      console.error('Error saving working hours:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/working-hours/${id}`);
      fetchWorkingHours(); // Ververs de lijst na verwijderen
    } catch (error) {
      console.error('Error deleting working hours:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Werktijden beheren</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Datum</label>
            <input
              type="date"
              name="date"
              value={newWorkingHours.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Begintijd</label>
            <input
              type="time"
              name="startTime"
              value={newWorkingHours.startTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Eindtijd</label>
            <input
              type="time"
              name="endTime"
              value={newWorkingHours.endTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Werktijden toevoegen
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Ingeplande werktijden</h3>
        <div className="space-y-2">
          {workingHours.map((hours) => (
            <div 
              key={hours.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <span className="font-medium">{new Date(hours.date).toLocaleDateString()}</span>
                <span className="mx-2">|</span>
                <span>{hours.startTime} - {hours.endTime}</span>
              </div>
              <button
                onClick={() => handleDelete(hours.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Verwijderen
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursManager;