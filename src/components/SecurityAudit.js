import React, { useState, useEffect, useCallback } from 'react';

const SecurityAudit = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suspiciousActivity, setSuspiciousActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [page, setPage] = useState(1);

  const limit = 50;

  const fetchSecurityData = useCallback(async () => {
    try {
      const [summaryRes, suspiciousRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/security/summary`),
        fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/security/suspicious`)
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (suspiciousRes.ok) {
        const suspiciousData = await suspiciousRes.json();
        setSuspiciousActivity(suspiciousData);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/security/events?limit=${limit}&skip=${(page - 1) * limit}`;

      if (filter !== 'all') url += `&event=${filter}`;
      if (severity !== 'all') url += `&severity=${severity}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, severity, page, limit]);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchSecurityData]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getEventColor = (event) => {
    const colors = {
      otp_sent: 'bg-blue-50 text-blue-700 border-blue-200',
      otp_verified: 'bg-green-50 text-green-700 border-green-200',
      otp_failed: 'bg-red-50 text-red-700 border-red-200',
      staff_login: 'bg-purple-50 text-purple-700 border-purple-200',
      staff_logout: 'bg-gray-50 text-gray-700 border-gray-200',
      invalid_otp_attempt: 'bg-orange-50 text-orange-700 border-orange-200',
      rate_limit_exceeded: 'bg-red-50 text-red-700 border-red-200',
      suspicious_activity: 'bg-red-50 text-red-700 border-red-200',
      contact_form_submitted: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      appointment_created: 'bg-green-50 text-green-700 border-green-200',
      appointment_modified: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      appointment_cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
      cookie_consent_updated: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colors[event] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return badges[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return '✓';
    if (status === 'failed') return '✕';
    return '→';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-semibold text-stone-900 mb-2">Security Audit Dashboard</h2>
        <p className="text-stone-600">Monitor all security events and suspicious activities</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Events (24h)</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{summary.summary?.events24h || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">EV</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Successful</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{(summary.summary?.events24h - summary.summary?.failedAttempts) || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl">✓</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Failed Attempts</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">{summary.summary?.failedAttempts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-700">!</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{summary.summary?.criticalAlerts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center text-sm font-bold text-red-700">!</div>
            </div>
          </div>
        </div>
      )}

      {/* Suspicious Activity Alert */}
      {suspiciousActivity && (suspiciousActivity.suspiciousIPs?.length > 0 || suspiciousActivity.suspiciousEmails?.length > 0) && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">ALERT: Suspicious Activity Detected</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {suspiciousActivity.suspiciousIPs?.length > 0 && (
              <div>
                <p className="font-semibold text-red-800 mb-2">Suspicious IPs (7 days):</p>
                <div className="space-y-2">
                  {suspiciousActivity.suspiciousIPs.slice(0, 5).map((ip, idx) => (
                    <div key={idx} className="bg-white rounded p-3 border border-red-200">
                      <p className="font-mono text-sm text-red-700">{ip._id || 'Unknown'}</p>
                      <p className="text-xs text-red-600">Failed attempts: {ip.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suspiciousActivity.suspiciousEmails?.length > 0 && (
              <div>
                <p className="font-semibold text-red-800 mb-2">Suspicious Emails (7 days):</p>
                <div className="space-y-2">
                  {suspiciousActivity.suspiciousEmails.slice(0, 5).map((email, idx) => (
                    <div key={idx} className="bg-white rounded p-3 border border-red-200">
                      <p className="font-mono text-sm text-red-700">{email._id || 'Unknown'}</p>
                      <p className="text-xs text-red-600">Failed attempts: {email.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-stone-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Event Type</label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Events</option>
            <option value="otp_sent">OTP Sent</option>
            <option value="otp_verified">OTP Verified</option>
            <option value="otp_failed">OTP Failed</option>
            <option value="invalid_otp_attempt">Invalid OTP Attempt</option>
            <option value="staff_login">Staff Login</option>
            <option value="staff_logout">Staff Logout</option>
            <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
            <option value="suspicious_activity">Suspicious Activity</option>
            <option value="cookie_consent_updated">Cookie Consent Updated</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Severity</label>
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Recent Security Events</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-stone-600">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-stone-600">No events found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-100 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Event</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Severity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-stone-700">IP Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEventColor(event.event)}`}>
                        {event.event.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBadge(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg ${event.status === 'success' ? 'text-green-600' : event.status === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                        {getStatusIcon(event.status)} {event.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {event.duration ? `${event.duration}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-stone-600">
                      {event.ipHash ? event.ipHash.slice(0, 8) + '...' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {events.length > 0 && (
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
            <p className="text-sm text-stone-600">Page {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-stone-300 hover:bg-stone-400 disabled:bg-stone-200 text-stone-800 rounded-lg transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAudit;
