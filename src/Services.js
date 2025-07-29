import React from 'react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 1,
    name: "Hair Styling & Cuts",
    description: "Professional haircuts, styling, and treatments for all hair types. From classic cuts to modern trends.",
    price: "₹500 - ₹2000",
    duration: "45-90 mins",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
  },
  {
    id: 2,
    name: "Facial Treatments",
    description: "Rejuvenating facials, deep cleansing, and anti-aging treatments for glowing, healthy skin.",
    price: "₹800 - ₹3000",
    duration: "60-90 mins",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  },
  {
    id: 3,
    name: "Spa & Massage",
    description: "Relaxing massages and spa treatments to rejuvenate your body and mind.",
    price: "₹1200 - ₹4000",
    duration: "60-120 mins",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
  },
  {
    id: 4,
    name: "Manicure & Pedicure",
    description: "Complete nail care services including manicures, pedicures, and nail art.",
    price: "₹600 - ₹1500",
    duration: "45-75 mins",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
  },
  {
    id: 5,
    name: "Hair Coloring",
    description: "Professional hair coloring, highlights, and color correction services.",
    price: "₹1500 - ₹5000",
    duration: "90-180 mins",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  },
  {
    id: 6,
    name: "Bridal Packages",
    description: "Complete bridal makeover packages for your special day.",
    price: "₹5000 - ₹15000",
    duration: "3-5 hours",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
  },
  {
    id: 7,
    name: "Threading & Waxing",
    description: "Professional threading and waxing services for smooth, hair-free skin.",
    price: "₹200 - ₹1000",
    duration: "15-60 mins",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
  },
  {
    id: 8,
    name: "Hair Treatments",
    description: "Deep conditioning, keratin treatments, and hair repair services.",
    price: "₹1000 - ₹3500",
    duration: "60-120 mins",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  },
  {
    id: 9,
    name: "Makeup Services",
    description: "Professional makeup for parties, events, and special occasions.",
    price: "₹1500 - ₹4000",
    duration: "60-90 mins",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
  }
];

export default function Services() {
  const navigate = useNavigate();
  
  const handleBookNow = (service) => {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      alert('Please login to book an appointment');
      return;
    }
    navigate('/book-appointment', { state: { service } });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(219, 39, 119, 0.08) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-stone-800 mb-6">Our Services</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-8"></div>
            <p className="font-sans text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of premium beauty and wellness services designed to make you look and feel your absolute best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-stone-200/50 hover:border-rose-200 group">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d={service.icon}/>
                  </svg>
                </div>
                
                <h3 className="font-serif text-2xl font-medium text-stone-800 mb-4">{service.name}</h3>
                <p className="font-sans text-stone-600 leading-relaxed mb-6">{service.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm font-medium text-stone-700">Price Range:</span>
                    <span className="font-sans text-lg font-semibold text-rose-600">{service.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm font-medium text-stone-700">Duration:</span>
                    <span className="font-sans text-sm text-stone-600">{service.duration}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleBookNow(service)}
                  className="w-full mt-6 bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-stone-200/50">
              <h2 className="font-serif text-3xl font-light text-stone-800 mb-6">Ready to Book?</h2>
              <p className="font-sans text-lg text-stone-600 mb-8 max-w-2xl mx-auto">
                Contact us today to schedule your appointment and experience the luxury of personalized beauty care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105">
                  Call +91 81476 27651
                </button>
                <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105">
                  WhatsApp Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}