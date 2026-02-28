import React from 'react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-semibold text-stone-800">Terms of Service</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-stone-700 text-sm leading-relaxed">
          <p className="text-xs text-stone-500 italic">Last Updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">1. Acceptance of Terms</h3>
            <p className="mb-4">By accessing and using the services of Lavish Ladies Beauty Salon ("we," "our," or "us"), you ("user," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">2. Description of Services</h3>
            <p className="mb-2">We provide beauty and wellness services including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Hair styling, cutting, and coloring services</li>
              <li>Facial treatments and skincare services</li>
              <li>Manicure and pedicure services</li>
              <li>Bridal and special occasion packages</li>
              <li>Online appointment booking system</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">3. Appointment Booking and Policies</h3>
            
            <h4 className="font-semibold mb-2">3.1 Booking Requirements</h4>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Appointments must be booked through our online system or by phone</li>
              <li>Phone verification may be required for certain bookings</li>
              <li>Accurate personal information must be provided</li>
              <li>Appointment confirmation is recommended within 24 hours</li>
            </ul>
            
            <h4 className="font-semibold mb-2">3.2 Cancellation and Rescheduling</h4>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>Late cancellations (less than 24 hours) may incur a fee</li>
              <li>No-shows may result in booking restrictions or fees</li>
              <li>Rescheduling is subject to availability</li>
            </ul>
            
            <h4 className="font-semibold mb-2">3.3 Punctuality</h4>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Please arrive 10 minutes before your scheduled appointment</li>
              <li>Late arrivals may result in shortened service time or rescheduling</li>
              <li>Appointments running more than 15 minutes late may be cancelled</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">4. Payment Terms</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Payment is due at the time of service</li>
              <li>We accept cash, credit cards, and digital payments</li>
              <li>Service prices are subject to change without notice</li>
              <li>Additional charges may apply for premium products or extended services</li>
              <li>Gratuities are appreciated but not mandatory</li>
              <li>Refunds are provided for service failure, cancellation by the salon, or as required under the Consumer Protection Act, 2019</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">5. Client Responsibilities and Conduct</h3>
            
            <h4 className="font-semibold mb-2">5.1 Client Obligations</h4>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Provide accurate health and allergy information</li>
              <li>Inform us of any medical conditions that may affect services</li>
              <li>Follow pre-service preparation instructions</li>
              <li>Treat staff and other clients with respect and courtesy</li>
              <li>Comply with salon policies and safety guidelines</li>
            </ul>
            
            <h4 className="font-semibold mb-2">5.2 Prohibited Conduct</h4>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Disruptive, abusive, or inappropriate behavior</li>
              <li>Use of alcohol or illegal substances on premises</li>
              <li>Photography or recording without consent</li>
              <li>Bringing outside food or beverages</li>
              <li>Smoking or vaping on the premises</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">6. Health and Safety</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>We maintain strict hygiene and sanitation standards</li>
              <li>All equipment is properly sterilized between uses</li>
              <li>Clients with contagious conditions will be rescheduled</li>
              <li>Patch tests may be required for certain treatments</li>
              <li>We reserve the right to refuse service for health and safety reasons</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">7. Limitation of Liability</h3>
            <p className="mb-4">To the fullest extent permitted by Indian law, Lavish Ladies Beauty Salon shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or in connection with our services. Our total liability shall not exceed the amount paid for the specific service in question. These limitations apply only to the extent permitted under applicable Indian consumer protection and other laws.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">8. Service Disclaimers</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Results may vary based on individual hair/skin type and condition</li>
              <li>We cannot guarantee specific outcomes or timeframes</li>
              <li>Allergic reactions, though rare, are possible despite precautions</li>
              <li>Color services may require multiple sessions for desired results</li>
              <li>We are not responsible for damage to personal items</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">9. Intellectual Property</h3>
            <p className="mb-4">All content on our website, including text, graphics, logos, and images, is the property of Lavish Ladies Beauty Salon and is protected by copyright and trademark laws. You may not use, reproduce, or distribute our content without written permission.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">10. Privacy and Data Protection</h3>
            <p className="mb-4">Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using our services, you consent to our privacy practices.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">11. Testimonials and Reviews</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Feedback submission is voluntary</li>
              <li>We may display approved testimonials publicly</li>
              <li>You retain rights to your submitted content</li>
              <li>We reserve the right to edit or remove inappropriate content</li>
              <li>False or misleading reviews are prohibited</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">12. Force Majeure</h3>
            <p className="mb-4">We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable control, including but not limited to natural disasters, government actions, pandemics, or other emergencies.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">13. Dispute Resolution</h3>
            <p className="mb-4">We encourage amicable resolution of any disputes through direct communication with our management. If a dispute cannot be resolved amicably within 30 days, either party may pursue legal remedies under applicable Indian law.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">14. Governing Law and Jurisdiction</h3>
            <p className="mb-4">These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts in Udupi, Karnataka.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">15. Severability</h3>
            <p className="mb-4">If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions shall continue in full force and effect.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">16. Modifications to Terms</h3>
            <p className="mb-4">We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of the modified Terms.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">17. Contact Information</h3>
            <p className="mb-2">For questions about these Terms of Service, please contact us:</p>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p><strong>Lavish Ladies Beauty Salon</strong></p>
              <p>Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=lavishladiessalonuchila@gmail.com&su=Inquiry%20from%20Website&body=Hello%2C%0A%0AI%20would%20like%20to%20know%20more%20about%20your%20services." className="text-stone-700 hover:text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500">lavishladiessalonuchila@gmail.com</a></p>
              <p>Phone: <a href="tel:+918147627651" className="text-rose-600 hover:text-rose-700">+91 8147627651</a></p>
              <p>Address: Uchila, Udupi District, Karnataka, India</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">18. Acknowledgment</h3>
            <p className="mb-4">By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
