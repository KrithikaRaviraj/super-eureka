import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from './config';

const REJECTION_REASONS = [
  'Not available at the requested time',
  'Staff is busy at the requested time',
  'Requested time is already occupied',
  'Service is unavailable at the requested time',
  'Salon is unavailable at the requested time',
  'Other'
];

export default function AppointmentDecision() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialAction = searchParams.get('action'); // 'accept' or 'reject'

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [actionResult, setActionResult] = useState(null);

  const [currentAction, setCurrentAction] = useState(initialAction === 'reject' ? 'reject' : 'accept');
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`${API_URL}/api/appointments/decision/${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setAppointment(data.appointment);
          if (data.appointment.status !== 'pending') {
            setActionResult({
              alreadyProcessed: true,
              status: data.appointment.status,
              message: data.appointment.status === 'confirmed'
                ? 'This appointment has already been confirmed.'
                : `This appointment has already been rejected${data.appointment.rejectionReason ? `: "${data.appointment.rejectionReason}"` : '.'}`
            });
          }
        } else {
          setError(data.message || 'Invalid or expired appointment link');
        }
      } catch (err) {
        setError('Failed to load appointment details. Please check your network connection.');
      }
      setLoading(false);
    };

    if (token) {
      fetchAppointment();
    } else {
      setError('Missing appointment token');
      setLoading(false);
    }
  }, [token]);

  const handleDecision = async (actionType) => {
    setSubmitting(true);
    setError('');

    let reasonToSend = '';
    if (actionType === 'reject') {
      if (selectedReason === 'Other') {
        if (!customReason.trim()) {
          setError('Please provide a specific reason when selecting "Other".');
          setSubmitting(false);
          return;
        }
        reasonToSend = customReason.trim();
      } else {
        reasonToSend = selectedReason;
      }
    }

    try {
      const response = await fetch(`${API_URL}/api/appointments/decision/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          ...(actionType === 'reject' && { reason: reasonToSend })
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setActionResult({
          alreadyProcessed: !!data.alreadyProcessed,
          status: data.appointment?.status || (actionType === 'accept' ? 'confirmed' : 'cancelled'),
          message: data.message || (actionType === 'accept' ? 'Appointment confirmed successfully' : 'Appointment rejected successfully')
        });
        if (data.appointment) {
          setAppointment(prev => ({ ...prev, ...data.appointment }));
        }
      } else {
        setError(data.message || 'Failed to process decision');
      }
    } catch (err) {
      setError('Network error while processing decision. Please try again.');
    }

    setSubmitting(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-sans text-stone-600 text-base">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-200/60 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-medium text-stone-800 mb-3">Appointment Error</h2>
          <p className="font-sans text-stone-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 rounded-xl font-sans font-medium transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Result state (Already processed or just submitted)
  if (actionResult) {
    const isConfirmed = actionResult.status === 'confirmed';
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-200/60 text-center max-w-lg w-full">
          <div className={`w-20 h-20 ${isConfirmed ? 'bg-emerald-100' : 'bg-rose-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {isConfirmed ? (
              <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <svg className="w-10 h-10 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            )}
          </div>

          <h2 className="font-serif text-3xl font-medium text-stone-800 mb-2">
            {isConfirmed ? 'Appointment Confirmed' : 'Appointment Declined'}
          </h2>

          <p className="font-sans text-stone-600 mb-6 text-base">
            {actionResult.message}
          </p>

          {appointment && (
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Customer:</span>
                <span className="text-stone-800 font-semibold">{appointment.userName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Service:</span>
                <span className="text-stone-800 font-semibold">{appointment.service}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Date & Time:</span>
                <span className="text-stone-800">{formatDate(appointment.date)} at {appointment.time}</span>
              </div>
              {appointment.rejectionReason && (
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500 font-medium">Reason:</span>
                  <span className="text-rose-700 font-medium">{appointment.rejectionReason}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate('/staff-dashboard')}
              className="flex-1 bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 rounded-xl font-sans font-medium transition-colors"
            >
              Staff Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-6 py-3 rounded-xl font-sans font-medium transition-colors"
            >
              Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 py-12 px-4 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200/60 max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            Staff Appointment Review
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-800 mb-2">
            Review Appointment Request
          </h1>
          <p className="font-sans text-stone-600 text-sm">
            Review booking details and confirm or decline the appointment.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Appointment Details Box */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 mb-8 space-y-3">
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500 text-sm font-medium">Customer</span>
            <span className="text-stone-800 text-sm font-semibold">{appointment.userName}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500 text-sm font-medium">Email</span>
            <span className="text-stone-800 text-sm break-all">{appointment.userEmail}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500 text-sm font-medium">Phone</span>
            <span className="text-stone-800 text-sm">{appointment.userPhone || 'Not provided'}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500 text-sm font-medium">Service</span>
            <span className="text-rose-600 text-sm font-bold">{appointment.service}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500 text-sm font-medium">Date</span>
            <span className="text-stone-800 text-sm">{formatDate(appointment.date)}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500 text-sm font-medium">Time Slot</span>
            <span className="text-stone-800 text-sm font-semibold">{appointment.time}</span>
          </div>
          {appointment.price > 0 && (
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500 text-sm font-medium">Price</span>
              <span className="text-stone-800 text-sm font-semibold">Rs. {appointment.price}</span>
            </div>
          )}
          {appointment.notes && (
            <div className="pt-1">
              <span className="text-stone-500 text-xs font-medium uppercase tracking-wider block mb-1">Customer Notes:</span>
              <p className="text-stone-700 text-sm bg-white p-3 rounded-lg border border-stone-200 italic">
                "{appointment.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Action Toggle Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setCurrentAction('accept'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              currentAction === 'accept'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Accept & Confirm
          </button>
          <button
            type="button"
            onClick={() => { setCurrentAction('reject'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              currentAction === 'reject'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Decline with Reason
          </button>
        </div>

        {/* Action Views */}
        {currentAction === 'accept' ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
              <p className="font-medium mb-1">Confirming this appointment will:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-emerald-700">
                <li>Change status to <strong>Confirmed</strong></li>
                <li>Send a <strong>Confirmation Email</strong> to {appointment.userEmail}</li>
                <li>Reserve the slot in the salon calendar</li>
              </ul>
            </div>

            <button
              onClick={() => handleDecision('accept')}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-sans font-semibold text-base transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Confirming...
                </>
              ) : (
                'Confirm & Accept Appointment'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Select Reason for Rejection:
              </label>
              <div className="space-y-2">
                {REJECTION_REASONS.map(reason => (
                  <label
                    key={reason}
                    className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-rose-500 bg-rose-50/50 text-stone-900'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500 h-4 w-4"
                    />
                    <span className="ml-3 text-sm font-medium">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Custom Reason (will be sent to customer):
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Explain why the requested slot cannot be accommodated..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm resize-none"
                />
              </div>
            )}

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              The customer will receive an update email containing the selected reason and an invitation to choose another slot.
            </div>

            <button
              onClick={() => handleDecision('reject')}
              disabled={submitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 px-6 rounded-xl font-sans font-semibold text-base transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Rejection...
                </>
              ) : (
                'Submit Rejection & Notify Customer'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

