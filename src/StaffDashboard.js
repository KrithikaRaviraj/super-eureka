import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const staffSession = localStorage.getItem('staffSession');
    if (!staffSession) {
      navigate('/staff-login');
      return;
    }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments/all');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    setLoading(false);
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffSession');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-stone-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200/50 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="font-serif text-2xl font-light text-stone-800">Staff Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg font-sans text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-light text-stone-800 mb-2">All Appointments</h2>
            <p className="font-sans text-stone-600">Manage customer appointments</p>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <h3 className="font-serif text-xl text-stone-800 mb-2">No Appointments</h3>
              <p className="font-sans text-stone-600">No appointments have been booked yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-stone-200/50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-serif text-xl font-medium text-stone-800">{appointment.service}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-sans text-stone-600 mb-1">
                            <span className="font-semibold">Customer:</span> {appointment.userName}
                          </p>
                          <p className="font-sans text-stone-600 mb-1">
                            <span className="font-semibold">Email:</span> {appointment.userEmail}
                          </p>
                        </div>
                        <div>
                          <p className="font-sans text-stone-600 mb-1">
                            <span className="font-semibold">Date:</span> {new Date(appointment.date).toLocaleDateString()}
                          </p>
                          <p className="font-sans text-stone-600 mb-1">
                            <span className="font-semibold">Time:</span> {appointment.time}
                          </p>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-stone-50 rounded-lg">
                          <p className="font-sans text-sm text-stone-600">
                            <span className="font-semibold">Notes:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-sans text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-sans text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-sans text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}