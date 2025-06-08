'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function QRTipComponent({
  repName = 'Aaliyah Johnson',
  repId = 'OTW2847',
  repPhoto = '/assets/volunteers/aaliyah.jpg',
}) {
  const [tipAmount, setTipAmount] = useState(5);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipSent, setTipSent] = useState(false);

  const predefinedAmounts = [2, 5, 10, 15, 20];

  const handleTipClick = () => {
    setShowTipModal(true);
  };

  const handleCloseModal = () => {
    setShowTipModal(false);
    setTipSent(false);
  };

  const handleSendTip = () => {
    // In a real app, this would process the payment
    setTipSent(true);
  };

  return (
    <div className="bg-otw-black-900 rounded-lg p-6">
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-2/3 mb-6 md:mb-0 md:pr-6">
          <h3 className="text-xl font-bold mb-2">Tip {repName} Directly</h3>
          <p className="text-white/70 mb-4">
            Scan the QR code to tip your representative directly and view their community story. 100% of tips go to your
            rep.
          </p>
          <button className="btn-primary" onClick={handleTipClick}>
            Send Tip Now
          </button>
        </div>
        <div className="md:w-1/3 flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            <div className="bg-black h-32 w-32 flex items-center justify-center">
              <p className="text-white text-xs text-center">QR Code for Rep #{repId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rep Storyline */}
      <div className="mt-6 pt-6 border-t border-otw-black-700">
        <h3 className="text-xl font-bold mb-4">Rep Storyline</h3>
        <div className="flex items-start">
          <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
            <Image src={repPhoto || '/assets/users/default-avatar.jpg'} alt={repName} fill style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <h4 className="font-bold">{repName}</h4>
            <p className="text-white/70 mb-2">
              {repName} has been with OTW for over a year, serving the community with dedication and excellence. Your
              tips help support their commitment to our mission.
            </p>
            <Link href={`/src/app/hall-of-hustle?rep=${repId}`} className="text-accent-gold hover:underline">
              View Full Profile →
            </Link>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-otw-black-900 rounded-lg max-w-md w-full p-6">
            {tipSent ? (
              <div className="text-center">
                <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                <p className="text-white/70 mb-6">
                  Your ${tipAmount} tip has been sent to {repName}. 100% of your tip goes directly to your rep.
                </p>
                <button className="btn-primary w-full" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">Tip {repName}</h3>
                  <button className="text-white/60 hover:text-white" onClick={handleCloseModal}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center mb-6">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                    <Image src={repPhoto || '/assets/users/default-avatar.jpg'} alt={repName} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p className="font-bold">{repName}</p>
                    <p className="text-sm text-white/60">Rep #{repId}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-white/70 mb-2">Tip Amount</label>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        className={`py-2 rounded-lg font-bold ${
                          tipAmount === amount
                            ? 'bg-accent-gold text-black'
                            : 'bg-otw-black-800 text-white hover:bg-otw-black-700'
                        }`}
                        onClick={() => setTipAmount(amount)}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <span className="text-white/60 mr-2">Custom:</span>
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-2 text-white/60">$</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-otw-red"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(Number(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-black p-4 rounded-lg mb-6">
                  <p className="text-sm text-white/60">
                    <span className="text-accent-gold font-bold">100% to Your Rep:</span> All tips go directly to your
                    representative to support their work in the community.
                  </p>
                </div>

                <button className="btn-primary w-full" onClick={handleSendTip}>
                  Send ${tipAmount} Tip
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Emergency Mode Button Component
export function EmergencyModeButton({ onActivate }) {
  return (
    <div className="bg-red-900 p-4 rounded-lg border-2 border-red-600 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">Emergency Mode</h3>
          <p className="text-sm text-white/80">
            Activates highest priority matching for urgent needs like formula, medications, or roadside assistance.
          </p>
        </div>
        <Link
          href="/src/app/emergency"
          className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-all"
          onClick={onActivate}
        >
          Activate
        </Link>
      </div>
    </div>
  );
}

// Role Application Component
export function RoleApplicationComponent() {
  const [role, setRole] = useState('volunteer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    reason: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const roles = [
    { id: 'volunteer', name: 'Volunteer', description: 'Help with community events and services' },
    { id: 'community_leader', name: 'Community Leader', description: 'Organize and lead community initiatives' },
    { id: 'vip', name: 'VIP Member', description: 'Exclusive access to special events and services' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the application to the backend for AI verification
    setIsSubmitted(true);
  };

  return (
    <div className="bg-otw-black-900 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4">Role Application</h3>

      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-xl font-bold mb-2">Application Submitted!</h4>
          <p className="text-white/70 mb-6">
            Your application for the {roles.find((r) => r.id === role)?.name} role has been submitted for review. We&apos;ll
            notify you once it&apos;s been processed.
          </p>
          <div className="bg-black p-4 rounded-lg mb-6 text-left">
            <h5 className="font-bold mb-2">What happens next?</h5>
            <ol className="space-y-2 text-gray-400 list-decimal list-inside">
              <li>Our AI system will review your application</li>
              <li>You may be contacted for additional information</li>
              <li>Once approved, you&apos;ll receive role access</li>
              <li>You can check your application status in your account</li>
            </ol>
          </div>
          <button className="btn-primary" onClick={() => setIsSubmitted(false)}>
            Submit Another Application
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white/70 mb-2">Select Role</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`p-4 rounded-lg text-center transition-all ${
                    role === r.id ? 'bg-otw-red text-white' : 'bg-otw-black-800 text-white/80 hover:bg-otw-black-700'
                  }`}
                  onClick={() => setRole(r.id)}
                >
                  <div className="font-bold mb-1">{r.name}</div>
                  <div className="text-sm">{r.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/70 mb-2" htmlFor="name">
                Full Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-otw-red"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 mb-2" htmlFor="email">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-otw-red"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white/70 mb-2" htmlFor="phone">
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-otw-red"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white/70 mb-2" htmlFor="experience">
              Relevant Experience*
            </label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-otw-red h-24"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-white/70 mb-2" htmlFor="reason">
              Why do you want this role?*
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-otw-red h-24"
              required
            ></textarea>
          </div>

          <div className="bg-black p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-accent-gold mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-accent-gold">
                <strong>AI Verification:</strong> Your application will be reviewed by our AI system for faster
                processing.
              </p>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Submit Application
          </button>
        </form>
      )}
    </div>
  );
}

// Age Verification Component for Cannabis-Infused Menu
export function AgeVerificationComponent({ onVerified }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate date of birth
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 21) {
        newErrors.dob = 'You must be 21 or older';
      }
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If validation passes, call the onVerified callback
    if (onVerified) {
      onVerified();
    }
  };

  return (
    <div className="bg-otw-black-900 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4">Age Verification Required</h3>
      <p className="text-white/70 mb-6">
        You must be 21 years or older to access the cannabis-infused menu. Please verify your age below.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white/70 mb-2" htmlFor="name">
            Full Name (as it appears on ID)*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 ${errors.name ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-otw-red'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-white/70 mb-2" htmlFor="dob">
            Date of Birth*
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-otw-black-800 text-white rounded focus:outline-none focus:ring-2 ${errors.dob ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-otw-red'}`}
          />
          {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
        </div>

        <div className="mb-6">
          <label className={`flex items-start ${errors.agreeToTerms ? 'text-red-500' : 'text-white/70'}`}>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 mr-2"
            />
            <span>
              I confirm that I am 21 years of age or older and that the information provided matches my
              government-issued ID. I understand that providing false information may be a violation of law.
            </span>
          </label>
          {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
        </div>

        <div className="bg-black p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-accent-gold mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-accent-gold">
              <strong>Privacy Notice:</strong> Your information is used solely for age verification and will not be
              stored or shared.
            </p>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          Verify Age & Continue
        </button>
      </form>
    </div>
  );
}

// Export all components
export { AgeVerificationComponent, RoleApplicationComponent, EmergencyModeButton, QRTipComponent as default };
