import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RevenueAnalytics() {
  const navigate = useNavigate();
  const [revenueData, setRevenueData] = useState({
    daily: { cash: 0, online: 0, total: 0 },
    weekly: { cash: 0, online: 0, total: 0 },
    monthly: { cash: 0, online: 0, total: 0 }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [cashAmount, setCashAmount] = useState('');
  const [onlineAmount, setOnlineAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const authResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
          credentials: 'include'
        });
        const authData = await authResponse.json();
        if (!authData?.authenticated || authData?.user?.role !== 'staff') {
          navigate('/staff-login');
          return;
        }
        fetchRevenueData();
      } catch (error) {
        navigate('/staff-login');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/revenue/analytics`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setRevenueData(data.analytics);
        setCashAmount(data.analytics.daily.cash.toString());
        setOnlineAmount(data.analytics.daily.online.toString());
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRevenue = async () => {
    setSaving(true);
    try {
      const authResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
        credentials: 'include'
      });
      const authData = await authResponse.json();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/revenue/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cashRevenue: parseFloat(cashAmount) || 0,
          onlineRevenue: parseFloat(onlineAmount) || 0,
          enteredBy: authData?.user?.email || 'staff'
        })
      });
      
      if (response.ok) {
        fetchRevenueData();
        alert('Revenue saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save revenue:', error);
      alert('Failed to save revenue');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
  const currentData = revenueData[selectedPeriod];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50">
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl font-light text-stone-800">Revenue Analytics</h1>
            <button onClick={() => navigate('/staff-dashboard')} className="px-4 py-2 text-stone-600 hover:text-stone-800">← Back</button>
          </div>

          {/* Daily Revenue Entry */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="font-medium text-stone-800 mb-4">Today's Revenue Entry</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Cash Revenue</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rose-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Online Revenue</label>
                <input
                  type="number"
                  value={onlineAmount}
                  onChange={(e) => setOnlineAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rose-500"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              onClick={saveRevenue}
              disabled={saving}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Revenue'}
            </button>
          </div>

          {/* Period Selector */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex space-x-4 mb-6">
              {['daily', 'weekly', 'monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-rose-600 text-white shadow-lg'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* Revenue Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <h3 className="font-medium text-green-800 mb-2">Cash Revenue</h3>
                <p className="text-3xl font-bold text-green-800">{formatCurrency(currentData.cash)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Online Revenue</h3>
                <p className="text-3xl font-bold text-blue-800">{formatCurrency(currentData.online)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h3 className="font-medium text-purple-800 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-purple-800">{formatCurrency(currentData.total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
