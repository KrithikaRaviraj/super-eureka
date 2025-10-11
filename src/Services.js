import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Add inline CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
`;
document.head.appendChild(style);

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
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  useEffect(() => {
    const savedFavorites = localStorage.getItem('serviceFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  
  const toggleFavorite = (serviceId) => {
    const newFavorites = favorites.includes(serviceId)
      ? favorites.filter(id => id !== serviceId)
      : [...favorites, serviceId];
    setFavorites(newFavorites);
    localStorage.setItem('serviceFavorites', JSON.stringify(newFavorites));
  };
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'budget' && parseInt(service.price.split(' - ')[0].replace('₹', '')) < 1000) ||
      (priceFilter === 'premium' && parseInt(service.price.split(' - ')[0].replace('₹', '')) >= 1000);
    
    return matchesSearch && matchesPrice;
  });
  
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
            <p className="font-sans text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Discover our comprehensive range of premium beauty and wellness services designed to make you look and feel your absolute best.
            </p>
            
            {/* Search and Filter Controls */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:border-rose-400 focus:outline-none bg-white/80 backdrop-blur-sm font-sans text-stone-700 placeholder-stone-400"
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`px-6 py-2 rounded-full font-sans text-sm transition-all duration-200 ${
                    priceFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-white/80 text-stone-600 hover:bg-rose-100'
                  }`}
                >
                  All Services
                </button>
                <button
                  onClick={() => setPriceFilter('budget')}
                  className={`px-6 py-2 rounded-full font-sans text-sm transition-all duration-200 ${
                    priceFilter === 'budget' ? 'bg-rose-600 text-white' : 'bg-white/80 text-stone-600 hover:bg-rose-100'
                  }`}
                >
                  Budget Friendly
                </button>
                <button
                  onClick={() => setPriceFilter('premium')}
                  className={`px-6 py-2 rounded-full font-sans text-sm transition-all duration-200 ${
                    priceFilter === 'premium' ? 'bg-rose-600 text-white' : 'bg-white/80 text-stone-600 hover:bg-rose-100'
                  }`}
                >
                  Premium
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <div 
                key={service.id} 
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-stone-200/50 hover:border-rose-200 group cursor-pointer transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedService(service)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d={service.icon}/>
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(service.id);
                    }}
                    className="p-2 rounded-full hover:bg-rose-100 transition-colors duration-200"
                  >
                    <svg className={`w-6 h-6 transition-colors duration-200 ${
                      favorites.includes(service.id) ? 'text-rose-600 fill-current' : 'text-stone-400'
                    }`} fill={favorites.includes(service.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
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
                
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookNow(service);
                    }}
                    className="flex-1 bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Book Now
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(service);
                    }}
                    className="px-4 py-3 border-2 border-stone-300 hover:border-rose-400 text-stone-700 hover:text-rose-600 rounded-xl transition-all duration-300 font-sans font-medium text-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d={selectedService.icon}/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-medium text-stone-800">{selectedService.name}</h3>
                  <p className="text-rose-600 font-semibold text-lg">{selectedService.price}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-sans font-semibold text-stone-800 mb-2">Description</h4>
                <p className="font-sans text-stone-600 leading-relaxed">{selectedService.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-4 rounded-xl">
                  <h4 className="font-sans font-semibold text-stone-800 mb-1">Duration</h4>
                  <p className="font-sans text-stone-600">{selectedService.duration}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-xl">
                  <h4 className="font-sans font-semibold text-stone-800 mb-1">Price Range</h4>
                  <p className="font-sans text-rose-600 font-semibold">{selectedService.price}</p>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => {
                    handleBookNow(selectedService);
                    setSelectedService(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl"
                >
                  Book This Service
                </button>
                <button
                  onClick={() => toggleFavorite(selectedService.id)}
                  className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 font-sans font-medium text-sm ${
                    favorites.includes(selectedService.id)
                      ? 'border-rose-400 text-rose-600 bg-rose-50'
                      : 'border-stone-300 text-stone-700 hover:border-rose-400 hover:text-rose-600'
                  }`}
                >
                  {favorites.includes(selectedService.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}