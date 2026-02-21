import React, { useState } from 'react';import Toast from './Toast';

const ContactForm = () => {  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setToast({
        type: 'error',
        message: "Please fill all required fields"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          type: 'success',
          message: 'Thank you! We\'ll get back to you soon.'
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setToast({
          type: 'error',
          message: data.message || "Server error. Please try again later."
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setToast({
        type: 'error',
        message: "Network error. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-stone-900 mb-4">
            Get In Touch
          </h1>
          <p className="font-sans text-lg text-stone-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and our team will respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Phone */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 7.985a1 1 0 00.502.756l4.038 2.19a1 1 0 00.956-1.748L15.5 13.5m-5 5l-5-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">Phone</h3>
                  <p className="font-sans text-stone-600">+91-XXXX-XXXX-XX</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">Email</h3>
                  <p className="font-sans text-stone-600 break-all">info@lavishladies.com</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">Location</h3>
                  <p className="font-sans text-stone-600">Uchila, Udupi District</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-lg shadow-md p-8">
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block font-sans font-medium text-stone-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-sans"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-sans font-medium text-stone-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-sans"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-sans font-medium text-stone-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-sans"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block font-sans font-medium text-stone-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-sans"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-sans font-medium text-stone-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows="5"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all font-sans resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 text-white py-2.5 rounded-lg hover:bg-rose-700 disabled:bg-stone-400 transition-colors duration-200 font-sans font-semibold"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ContactForm;
