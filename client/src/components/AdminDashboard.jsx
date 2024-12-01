import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkingHoursManager from './WorkingHoursManager';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/appointments');
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  const deleteAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/appointments/${id}`);
      setAppointments(appointments.filter((appointment) => appointment.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h2>

      <div className="mb-8">
        <WorkingHoursManager />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border text-left">Naam</th>
            <th className="p-2 border text-left">Email</th>
            <th className="p-2 border text-left">Telefoon</th>
            <th className="p-2 border text-left">Datum</th>
            <th className="p-2 border text-left">Tijd</th>
            <th className="p-2 border text-left">Service</th>
            <th className="p-2 border text-left">Acties</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="p-2 border">{appointment.name}</td>
              <td className="p-2 border">{appointment.email}</td>
              <td className="p-2 border">{appointment.phone}</td>
              <td className="p-2 border">{appointment.date}</td>
              <td className="p-2 border">{appointment.time}</td>
              <td className="p-2 border">{appointment.service}</td>
              <td className="p-2 border">
                <button
                  onClick={() => deleteAppointment(appointment.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Verwijderen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;