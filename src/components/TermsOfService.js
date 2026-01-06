import React from 'react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-semibold text-stone-800">Terms of Service</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-stone-700">
          <p className="text-sm text-stone-500 italic">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
            <p>By using our booking system, you agree to these terms of service.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Booking and Appointments</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Appointments must be booked through our online system</li>
              <li>Confirmation is required via phone verification</li>
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>No-shows may result in booking restrictions</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Payment and Pricing</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Service prices are displayed at time of booking</li>
              <li>Payment is due at time of service</li>
              <li>Prices may change without notice</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">4. User Conduct</h3>
            <p className="mb-2">Users must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate information when booking</li>
              <li>Arrive on time for appointments</li>
              <li>Treat staff and facilities with respect</li>
              <li>Follow salon policies and procedures</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Testimonials and Feedback</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Feedback submission is voluntary</li>
              <li>We may display approved testimonials publicly</li>
              <li>You retain rights to your submitted content</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">6. Limitation of Liability</h3>
            <p>Our liability is limited to the cost of services provided. We are not responsible for indirect or consequential damages.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">7. Changes to Terms</h3>
            <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of changes.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">8. Contact Information</h3>
            <p>For questions about these terms, contact us at: info@lavishsalon.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;