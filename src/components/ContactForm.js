import React, { useState } from 'react';
import Toast from './Toast';

const ContactForm = () => {
  const [formData, setFormData] = useState({
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
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setToast({
        type: 'error',
        message: 'Please fill all required fields'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setToast({
          type: 'success',
          message: "Thank you! We'll get back to you soon."
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
          message: data.message || 'Server error. Please try again later.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setToast({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-stone-50 to-rose-100 px-4 py-12 md:px-6">
      <div className="pointer-events-none absolute -left-16 top-20 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-10 rounded-2xl border border-rose-200/60 bg-white/85 p-8 text-center shadow-lg backdrop-blur-sm md:p-10">
          <p className="mb-3 inline-block rounded-full bg-rose-100 px-4 py-1 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            We Are Here To Help
          </p>
          <h1 className="mb-4 font-serif text-4xl font-semibold text-stone-900 md:text-5xl">Get In Touch</h1>
          <p className="mx-auto max-w-2xl font-sans text-base text-stone-600 md:text-lg">
            Have questions about services, pricing, appointments, or your visit? Share a few details and our team will get back to you shortly.
          </p>
        </div>

        <div className="mb-12 grid gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="font-sans text-sm font-medium text-stone-700">Typical response time</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-stone-900">Under 24 hours</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100">
                  <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 7.985a1 1 0 00.502.756l4.038 2.19a1 1 0 00.956-1.748L15.5 13.5m-5 5l-5-5" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 font-serif text-lg font-semibold text-stone-900">Phone</h3>
                  <p className="font-sans text-stone-600">+91-XXXX-XXXX-XX</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100">
                  <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 font-serif text-lg font-semibold text-stone-900">Email</h3>
                  <p className="break-all font-sans text-stone-600">info@lavishladies.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100">
                  <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 font-serif text-lg font-semibold text-stone-900">Location</h3>
                  <p className="font-sans text-stone-600">Uchila, Udupi District</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl md:col-span-2 md:p-8">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">Send a Message</h2>
              <p className="mt-1 font-sans text-sm text-stone-600">
                Fields marked with <span className="font-semibold text-rose-600">*</span> are required.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="mb-2 block font-sans font-medium text-stone-700">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-lg border border-stone-300 px-4 py-2.5 font-sans transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="mb-2 block font-sans font-medium text-stone-700">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-stone-300 px-4 py-2.5 font-sans transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className="mb-2 block font-sans font-medium text-stone-700">
                  Phone Number *
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  className="w-full rounded-lg border border-stone-300 px-4 py-2.5 font-sans transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="mb-2 block font-sans font-medium text-stone-700">
                  Subject *
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="w-full rounded-lg border border-stone-300 px-4 py-2.5 font-sans transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block font-sans font-medium text-stone-700">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows="5"
                  className="w-full resize-none rounded-lg border border-stone-300 px-4 py-2.5 font-sans transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-stone-900 py-3 font-sans font-semibold text-white transition-all duration-200 hover:bg-black disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default ContactForm;
