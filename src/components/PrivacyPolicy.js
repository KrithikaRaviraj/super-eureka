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
            <p className="mb-4">This Privacy Policy ("Policy") describes how Lavish Ladies Beauty Salon, a proprietorship business located at Uchila, Udupi District, Karnataka, India ("we," "our," "us," or "Company") collects, uses, stores, processes, and discloses your personal information in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, the Digital Personal Data Protection Act, 2023 (when notified), and other applicable Indian laws.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">1. Data Controller and Contact Information</h3>
            <div className="bg-stone-50 p-4 rounded-lg mb-4">
              <p><strong>Data Controller:</strong> Lavish Ladies Beauty Salon</p>
              <p><strong>Business Type:</strong> Proprietorship</p>
              <p><strong>Address:</strong> Uchila, Udupi District, Karnataka 576101, India</p>
              <p><strong>Email:</strong> [redacted-email]</p>
              <p><strong>Phone:</strong> +91 8147627651</p>
              <p><strong>Privacy Officer:</strong> Available upon request (as per DPDP Act, 2023)</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">2. Legal Basis for Processing (Indian IT Act Compliance)</h3>
            <p className="mb-2">We process your personal information under the following legal bases as per Indian law:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Consent:</strong> You have given clear consent for processing (Section 43A, IT Act 2000)</li>
              <li><strong>Contract Performance:</strong> Processing necessary for service delivery</li>
              <li><strong>Legal Obligation:</strong> Compliance with tax, accounting, and regulatory requirements</li>
              <li><strong>Permitted lawful use:</strong> For business purposes permitted under applicable Indian law and that do not override your fundamental rights</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">3. Categories of Personal Information Collected</h3>
            
            <h4 className="font-semibold mb-2">3.1 Sensitive Personal Data or Information (SPDI) as per IT Rules 2011:</h4>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Financial information (payment details - processed via secure third-party gateways)</li>
              <li>Health information (allergies, skin conditions, medical history relevant to services)</li>
              <li>Biometric information (only if collected for specific advanced treatments with explicit consent)</li>
            </ul>
            
            <h4 className="font-semibold mb-2">3.2 Personal Information:</h4>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Name, age, gender, contact details (phone, email, address)</li>
              <li>Appointment history and service preferences</li>
              <li>Photographs (before/after treatment photos with explicit consent)</li>
              <li>Communication records and feedback</li>
              <li>Device information, IP address, browser data (website usage)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">4. Purpose and Lawful Use of Information</h3>
            <p className="mb-2">We collect and process your information for the following purposes under Section 43A of IT Act 2000:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Service delivery and appointment management</li>
              <li>Payment processing and billing (GST compliance)</li>
              <li>Health and safety assessments for treatments</li>
              <li>Customer support and communication</li>
              <li>Legal compliance (tax records, consumer protection)</li>
              <li>Marketing communications (with explicit consent only)</li>
              <li>Service improvement and quality assurance</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">5. Data Sharing and Disclosure (IT Rules 2011 Compliance)</h3>
            <p className="mb-2">We may share your information only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Service Providers:</strong> Payment processors, appointment systems (with data processing agreements)</li>
              <li><strong>Legal Requirements:</strong> Government authorities, tax departments, courts as required by Indian law</li>
              <li><strong>Medical Emergencies:</strong> Healthcare providers if necessary for your safety</li>
              <li><strong>Consent-based:</strong> Third parties only with your explicit written consent</li>
              <li><strong>Business Transfer:</strong> In case of business sale/merger (with notice to affected individuals)</li>
            </ul>
            <p className="text-xs text-stone-600 italic">Note: We do not transfer SPDI outside India without explicit consent and adequate safeguards as per IT Rules 2011.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">6. Data Security Measures (Section 43A Compliance)</h3>
            <p className="mb-2">We implement reasonable security practices and procedures including:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Physical security of premises and records</li>
              <li>Access controls and employee training</li>
              <li>Secure data transmission (SSL/TLS encryption)</li>
              <li>Regular security audits and updates</li>
              <li>Incident response procedures</li>
              <li>Data backup and recovery systems</li>
            </ul>
            <p className="text-xs text-stone-600 italic">In case of personal data breach, we will notify the Data Protection Board of India and affected individuals as per timelines specified in DPDP Act, 2023 (currently within reasonable time, subject to final rules).</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">7. Data Retention Policy</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Service Records:</strong> 3 years from last service (for health/safety tracking)</li>
              <li><strong>Financial Records:</strong> 7 years (as per Income Tax Act, 1961)</li>
              <li><strong>Marketing Data:</strong> Until consent withdrawal</li>
              <li><strong>Website Analytics:</strong> 2 years maximum</li>
              <li><strong>CCTV Footage:</strong> 30 days (if applicable)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">8. Your Rights Under Indian Law</h3>
            <p className="mb-2">You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Access:</strong> Request copies of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent for processing SPDI</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Request transfer of your data</li>
              <li><strong>Grievance Redressal:</strong> File complaints regarding data handling</li>
            </ul>
            <p className="text-xs text-stone-600 italic">To exercise these rights, contact us at [redacted-email] with proper identification.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">9. Grievance Redressal Mechanism</h3>
            <div className="bg-stone-50 p-4 rounded-lg mb-4">
              <p><strong>Grievance Officer:</strong> [To be appointed as per IT Rules 2011 and DPDP Act, 2023]</p>
              <p><strong>Response Time:</strong> Within 30 days of complaint receipt</p>
              <p><strong>Contact:</strong> [redacted-email]</p>
              <p><strong>Escalation:</strong> Data Protection Board of India (under DPDP Act, 2023) or Cyber Crime Cell, Karnataka Police</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">10. Cookies and Tracking Technologies</h3>
            <p className="mb-2">Our website uses:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Essential Cookies:</strong> For website functionality</li>
              <li><strong>Analytics Cookies:</strong> To understand website usage (anonymized)</li>
              <li><strong>Preference Cookies:</strong> To remember your settings</li>
            </ul>
            <p className="text-xs text-stone-600 italic">You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">11. International Data Transfers</h3>
            <p className="mb-4">We primarily store and process data within India. Any international transfers of SPDI will be conducted only with your explicit consent and with adequate safeguards including Standard Contractual Clauses or adequacy decisions.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">12. Children's Privacy (Under 18)</h3>
            <p className="mb-4">Services for individuals under 18 require parental/guardian consent. We do not knowingly collect personal information from children under 13 without verifiable parental consent.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">13. Governing Law and Jurisdiction</h3>
            <p className="mb-4">This Privacy Policy is governed by Indian law, including the Information Technology Act, 2000, Digital Personal Data Protection Act, 2023 (when notified), Consumer Protection Act, 2019, and other applicable regulations. Any disputes shall be subject to the jurisdiction of courts in Udupi, Karnataka, India.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">14. Updates to Privacy Policy</h3>
            <p className="mb-4">We may update this Policy to reflect changes in law or business practices. Material changes will be notified via email or website notice 30 days before implementation. Continued use of services constitutes acceptance of updated terms.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-stone-800">15. Consent and Acknowledgment</h3>
            <p className="mb-4">By using our services, you acknowledge that you have read, understood, and consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy in accordance with Indian data protection laws.</p>
          </section>

          <section className="border-t pt-4">
            <p className="text-xs text-stone-600 italic">This Privacy Policy complies with the Information Technology Act, 2000, IT Rules 2011, Digital Personal Data Protection Act, 2023 (when notified), and other applicable Indian laws. For legal advice regarding your specific situation, please consult with a qualified attorney.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;