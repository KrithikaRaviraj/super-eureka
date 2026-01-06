import React from 'react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-semibold text-stone-800">Privacy Policy</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-stone-700 text-sm leading-relaxed">
          <p className="text-xs text-stone-500 italic">Effective Date: January 1, 2024</p>
          <p className="text-xs text-stone-500 italic">Last Updated: {new Date().toLocaleDateString()}</p>

          <section>
            <p className="mb-4">Lavish Ladies Beauty Salon ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">1. Information We Collect</h3>
            
            <h4 className="font-semibold mb-2">1.1 Personal Information</h4>
            <p className="mb-2">We may collect personal information that you voluntarily provide to us, including:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Appointment preferences and service history</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Feedback, reviews, and testimonials</li>
              <li>Communication preferences</li>
            </ul>
            
            <h4 className="font-semibold mb-2">1.2 Automatically Collected Information</h4>
            <p className="mb-2">When you visit our website, we may automatically collect:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website information</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">2. How We Use Your Information</h3>
            <p className="mb-2">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Provide and maintain our services</li>
              <li>Process appointments and payments</li>
              <li>Send appointment confirmations, reminders, and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our services and website functionality</li>
              <li>Send promotional materials (with your consent)</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">3. Information Sharing and Disclosure</h3>
            <p className="mb-2">We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in our operations</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
              <li><strong>Consent:</strong> With your explicit permission</li>
              <li><strong>Emergency Situations:</strong> To protect health, safety, or prevent harm</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">4. Data Security</h3>
            <p className="mb-4">We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">5. Data Retention</h3>
            <p className="mb-4">We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">6. Your Rights and Choices</h3>
            <p className="mb-2">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">7. Cookies and Tracking Technologies</h3>
            <p className="mb-4">We use cookies and similar technologies to enhance your experience, analyze website traffic, and personalize content. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">8. Third-Party Links</h3>
            <p className="mb-4">Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">9. Children's Privacy</h3>
            <p className="mb-4">Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">10. International Data Transfers</h3>
            <p className="mb-4">Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">11. Changes to This Privacy Policy</h3>
            <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last Updated" date.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">12. Contact Information</h3>
            <p className="mb-2">If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p><strong>Lavish Ladies Beauty Salon</strong></p>
              <p>Email: [redacted-email]</p>
              <p>Phone: +91 8147627651</p>
              <p>Address: Uchila, Udupi District, Karnataka, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;