// src/components/TermsAndConditions.jsx
import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8 border-b-2 pb-4">
          Terms and Conditions & Privacy Policy
        </h1>

        <p className="text-sm text-gray-600 text-center mb-6">
          Last updated: June 8, 2025
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Section 1: Introduction (Terms and Conditions) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Introduction (Terms and Conditions)</h2>
            <p>
              Welcome to Ladli Laxmi (referred to as "the Website," "we," "us," or "our"). These Terms and Conditions ("Terms") govern your use of our website and services. By accessing or using our Website, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Website.
            </p>
          </section>

          {/* Section 2: User Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">2. User Eligibility</h2>
            <p>
              You must be at least 18 years old to use this Website. By using the Website, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
          </section>

          {/* Section 3: Account Registration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">3. Account Registration</h2>
            <p>
              To access certain features of the Website, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          {/* Section 4: Use of the Website */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Use of the Website</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You agree to use the Website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Website.</li>
              <li>Prohibited behavior includes harassing or causing distress or inconvenience to any person, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within our Website.</li>
              <li>You must not misuse our Website by knowingly introducing viruses, Trojans, worms, logic bombs, or other material that is malicious or technologically harmful.</li>
            </ul>
          </section>

          {/* Section 5: Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Intellectual Property</h2>
            <p>
              All content on this Website, including text, graphics, logos, images, as well as the compilation thereof, and any software used on the Website, is the property of Ladli Laxmi or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights.
            </p>
          </section>

          {/* Section 6: Disclaimers and Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Disclaimers and Limitation of Liability</h2>
            <p>
              The Website is provided on an "as is" and "as available" basis without any warranties of any kind. We do not warrant that the Website will be uninterrupted, error-free, or free of viruses or other harmful components. To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Website; (b) any conduct or content of any third party on the Website; (c) any content obtained from the Website; and (d) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
            </p>
          </section>

          {/* Section 7: Governing Law and Jurisdiction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">7. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India/Uttar Pradesh, without regard to its conflict of law provisions. Any dispute arising from or relating to the subject matter of these Terms shall be subject to the exclusive jurisdiction of the courts of Ghaziabad, Uttar Pradesh, India.
            </p>
          </section>

          {/* Section 8: Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 7 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Website after any revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          {/* ----- PRIVACY POLICY SECTION START ----- */}
          <div className="border-t-2 border-gray-200 pt-8 mt-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8 pb-4">
              Privacy Policy
            </h1>

            <p className="text-sm text-gray-600 text-center mb-6">
              Last updated: June 8, 2025
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">1. Introduction (Privacy Policy)</h2>
              <p>
                Ladli Laxmi is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ladlilaxmi.vercel.app, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">2. Information We Collect</h2>
              <p>We may collect information about you in a variety of ways. The information we may collect on the Site depends on the content and materials you use, and includes:</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Personal Data</h3>
              <p>
                Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Derivative Data</h3>
              <p>
                Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Financial Data</h3>
              <p>
                Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you [specify action, e.g., purchase, subscribe, withdraw funds] from the Site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, [Name of Payment Processor, e.g., Stripe, Razorpay], and you are encouraged to review their privacy policy.
              </p>
              {/* Add more types of data if applicable: e.g., Device Data, Location Data, etc. */}
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">3. How We Use Your Information</h2>
              <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Create and manage your account.</li>
                <li>Process your transactions and payments.</li>
                <li>Send you emails regarding your account or order.</li>
                <li>Enable user-to-user communications.</li>
                <li>Generate a personal profile about you to make your visit to the Site more personalized.</li>
                <li>Improve the efficiency and operation of the Site.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                <li>Notify you of updates to the Site.</li>
                <li>Resolve disputes and troubleshoot problems.</li>
                <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                {/* Add other uses relevant to your site */}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">4. Disclosure of Your Information</h2>
              <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">By Law or to Protect Rights</h3>
              <p>
                If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Third-Party Service Providers</h3>
              <p>
                We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
              </p>
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Business Transfers</h3>
              <p>
                If we reorganize or sell all or a portion of our assets, undergo a merger, or are acquired by another entity, we may transfer your information to the successor entity.
              </p>
              {/* Add other disclosure scenarios, e.g., Affiliates, Business Partners, Other Users */}
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">5. Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">6. Policy for Children</h2>
              <p>
                We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">7. Contact Us (Privacy Policy)</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at: ladlilaxmi22@gmail.com
              </p>
            </section>
          </div>
          {/* ----- PRIVACY POLICY SECTION END ----- */}

          {/* Section 9: Contact Us (Terms and Conditions) - This was already here */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">9. Contact Us (Terms and Conditions)</h2>
            <p>
              If you have any questions about these Terms, please contact us at: ladlilaxmi22@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
