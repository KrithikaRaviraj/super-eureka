import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './styles.css';

const staticServices = [
  {
    id: 1,
    name: "Hair Styling & Cuts",
    description: "Professional haircuts, styling, and treatments for all hair types. From classic cuts to modern trends.",
    duration: "45-90 mins",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
  },
  {
    id: 2,
    name: "Facial Treatments",
    description: "Rejuvenating facials, deep cleansing, and anti-aging treatments for glowing, healthy skin.",
    duration: "60-90 mins",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  },
  {
    id: 3,
    name: "Spa & Massage",
    description: "Relaxing massages and spa treatments to rejuvenate your body and mind.",
    duration: "60-120 mins",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
  },
  {
    id: 4,
    name: "Manicure & Pedicure",
    description: "Complete nail care services including manicures, pedicures, and nail art.",
    duration: "45-75 mins",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
  },
  {
    id: 5,
    name: "Hair Coloring",
    description: "Professional hair coloring, highlights, and color correction services.",
    duration: "90-180 mins",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  },
  {
    id: 6,
    name: "Bridal Packages",
    description: "Complete bridal makeover packages for your special day.",
    duration: "3-5 hours",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
  },
  {
    id: 7,
    name: "Threading & Waxing",
    description: "Professional threading and waxing services for smooth, hair-free skin.",
    duration: "15-60 mins",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
  },
  {
    id: 8,
    name: "Hair Treatments",
    description: "Deep conditioning, keratin treatments, and hair repair services.",
    duration: "60-120 mins",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  },
  {
    id: 9,
    name: "Makeup Services",
    description: "Professional makeup for parties, events, and special occasions.",
    duration: "60-90 mins",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
  }
];

export default function Services() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [favorites, setFavorites] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  useEffect(() => {
    // Fetch services from API
    const fetchServices = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/services');
        // const data = await response.json();
        // setServices(data);
        
        // Temporary: use static data
        setServices(staticServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices(staticServices); // Fallback to static data
      }
    };
    
    fetchServices();
    
    // Load user-scoped favorites (TODO: move to user profile API)
    try {
      const savedFavorites = localStorage.getItem('serviceFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  }, []);
  
  // Focus trapping for modal
  useEffect(() => {
    if (selectedService && closeButtonRef.current) {
      closeButtonRef.current.focus();
      
      const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements?.[0];
          const lastElement = focusableElements?.[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedService]);
  
  const toggleFavorite = (serviceId) => {
    const newFavorites = favorites.includes(serviceId)
      ? favorites.filter(id => id !== serviceId)
      : [...favorites, serviceId];
    setFavorites(newFavorites);
    try {
      localStorage.setItem('serviceFavorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };
  
  const filteredAndSortedServices = [...services].filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (sortBy === 'name') {
    filteredAndSortedServices.sort((a, b) => a.name.localeCompare(b.name));
  }

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('default');
  };
  const handleDetailsClick = (e, service) => {
    e.stopPropagation();
    setSelectedService(service);
  };
  
  const [authMessage, setAuthMessage] = useState('');
  
  const handleBookNow = (service) => {
    if (!isLoggedIn) {
      setAuthMessage('Please login to book an appointment');
      setTimeout(() => setAuthMessage(''), 3000);
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
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-stone-200 focus:border-rose-400 focus:outline-none bg-white/80 backdrop-blur-sm font-sans text-stone-700 placeholder-stone-400"
                  aria-label="Search services"
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none w-full sm:w-auto bg-white/80 border-2 border-stone-200 text-stone-600 py-2 pl-4 pr-10 rounded-full focus:outline-none focus:border-rose-400 font-sans text-sm"
                  >
                    <option value="default">Sort by Default</option>
                    <option value="name">Sort by Name</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {(searchTerm || sortBy !== 'default') && (
                  <button
                    onClick={clearFilters}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        clearFilters();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-800 font-sans text-sm font-semibold transition-colors"
                    aria-label="Clear search and filters"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {authMessage && (
            <div className="fixed top-4 right-4 bg-rose-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
              {authMessage}
            </div>
          )}
          
          {filteredAndSortedServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedServices.map((service, index) => (
              <div 
                key={service.id} 
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-stone-200/50 hover:border-rose-200 group cursor-pointer transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedService(service)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedService(service);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${service.name}`}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(service.id);
                      }
                    }}
                    className="p-2 rounded-full hover:bg-rose-100 transition-colors duration-200"
                    aria-label={favorites.includes(service.id) ? `Remove ${service.name} from favorites` : `Add ${service.name} to favorites`}
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
                    onClick={(e) => handleDetailsClick(e, service)}
                    className="px-4 py-3 border-2 border-stone-300 hover:border-rose-400 text-stone-700 hover:text-rose-600 rounded-xl transition-all duration-300 font-sans font-medium text-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-stone-700 mb-2">No Services Found</h3>
              <p className="font-sans text-stone-500 mb-6">Try adjusting your search or filter settings.</p>
              <button
                onClick={clearFilters}
                className="bg-rose-600 hover:bg-rose-700 text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
             onClick={() => setSelectedService(null)}
             onKeyDown={(e) => {
               if (e.key === 'Escape') {
                 setSelectedService(null);
               }
             }}
             tabIndex={-1}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d={selectedService.icon}/>
                  </svg>
                </div>
                <div>
                  <h3 id="modal-title" className="font-serif text-3xl font-medium text-stone-800">{selectedService.name}</h3>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={() => setSelectedService(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedService(null);
                  }
                }}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors duration-200"
                aria-label="Close service details"
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
              
              <div className="bg-stone-50 p-4 rounded-xl">
                <h4 className="font-sans font-semibold text-stone-800 mb-1">Duration</h4>
                <p className="font-sans text-stone-600">{selectedService.duration}</p>
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