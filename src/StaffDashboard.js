import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [filterDate, setFilterDate] = useState(new Date().toISOString().spli('T')[0]);

  const services = [
    "Hair Styling & Cuts",
    "Facial Treatments", 
    "Spa & Massage",
    "Manicure & Pedicure",
    "Hair Coloring",
    "Bridal Packages",
    "Threading & Waxing",
    "Hair Treatments",
    "Makeup Services"
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
  ];

  useEffect(() => {
    const staffSession = localStorage.getItem('staffSession');
    if (!staffSession) {
      navigate('/staff-login');
      return;
    }
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/all`);
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/${id}`, {
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

  const updateAppointment = async (id, data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        fetchAppointments();
        setEditingAppointment(null);
        setEditForm({});
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const addAppointment = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        fetchAppointments();
        setShowAddForm(false);
        setEditForm({});
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const startEdit = (appointment) => {
    setEditingAppointment(appointment._id);
    setEditForm({
      service: appointment.service,
      date: new Date(appointment.date).toISOString().spli('T')[0],
      time: appointment.time,
      userName: appointment.userName,
      userEmail: appointment.userEmail,
      userPhone: appointment.userPhone,
      notes: appointment.notes || '',
      status: appointment.status,
      price: appointment.price || 0
    });
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditForm({
      service: '',
      date: '',
      time: '',
      userName: '',
      userEmail: '',
      userPhone: '',
      notes: '',
      status: 'pending',
      price: 0
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAppointment) {
      updateAppointment(editingAppointment, editForm);
    } else {
      addAppointment(editForm);
    }
  };

  const cancelEdit = () => {
    setEditingAppointment(null);
    setShowAddForm(false);
    setEditForm({});
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/revenue-analytics')}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-sans text-sm"
            >
              Revenue Analytics
            </button>
            <button
              onClick={handleLogout}
              className="bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-lg font-sans text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="font-serif text-3xl font-light text-stone-800 mb-2">All Appointments</h2>
              <p className="font-sans text-stone-600">Manage customer appointments</p>
            </div>
            <button
              onClick={startAdd}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-sans font-semibold"
            >
              Add Appointment
            </button>
          </div>

          {/* Date Filter */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-stone-200/50 mb-6 flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <label className="block font-sans text-xs font-semibold text-stone-500 mb-1 uppercase">Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none text-sm"
              />
            </div>
            <button 
              onClick={() => setFilterDate('')}
              className="mt-5 text-sm text-rose-600 hover:text-rose-700 font-medium underline"
            >
              Show All
            </button>
          </div>

          {(showAddForm || editingAppointment) && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-stone-200/50 mb-6">
              <h3 className="font-serif text-xl font-medium text-stone-800 mb-4">
                {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
              </h3>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Service</label>
                  <select
                    value={editForm.service || ''}
                    onChange={(e) => setEditForm({...editForm, service: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editForm.date || ''}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Time</label>
                  <select
                    value={editForm.time || ''}
                    onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    required
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={editForm.userName || ''}
                    onChange={(e) => setEditForm({...editForm, userName: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.userEmail || ''}
                    onChange={(e) => setEditForm({...editForm, userEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.userPhone || ''}
                    onChange={(e) => setEditForm({...editForm, userPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Status</label>
                  <select
                    value={editForm.status || 'pending'}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.price || 0}
                    onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-sans text-sm font-semibold text-stone-700 mb-2">Notes</label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:border-rose-400 focus:outline-none"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-sans font-semibold"
                  >
                    {editingAppointment ? 'Update' : 'Add'} Appointment
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-stone-600 hover:bg-stone-700 text-white px-6 py-2 rounded-lg font-sans font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

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
              {appointments
                .filter(app => {
                  if (!filterDate) return true;
                  const appDate = new Date(app.date).toISOString().spli('T')[0];
                  return appDate === filterDate;
                })
                .map((appointment) => (
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
                      <button
                        onClick={() => startEdit(appointment)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-sans text-sm"
                      >
                        Edit
                      </button>
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