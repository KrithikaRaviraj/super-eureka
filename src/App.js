import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Welcome from "./Welcome";
import Services from "./Services";
import BookAppointment from "./BookAppointment";
import StaffLogin from "./StaffLogin";
import StaffDashboard from "./StaffDashboard";
import FeedbackForm from "./FeedbackForm";
import TestimonialApproval from "./TestimonialApproval";
import RevenueAnalytics from "./RevenueAnalytics";
import SignIn from "./components/SignIn";
import Testimonials from "./components/Testimonials";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import NotFound from "./components/NotFound";
import ContactForm from "./components/ContactForm";
import AboutPage from "./components/AboutPage";
import CookieConsent from "./components/CookieConsent";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import { useAuth } from "./hooks/useAuth";
import React, { useState } from "react";
import './styles.css';

const fallbackHomepageServices = [
  { name: "Hair Styling & Cuts", description: "Professional haircuts, styling, and treatments for all hair types. From classic cuts to modern trends.", icon: "M9.64 7.64a2.5 2.5 0 1 1-3.54 3.54 2.5 2.5 0 0 1 3.54-3.54zm0 5.72L12 15.72l2.36-2.36a2.5 2.5 0 1 1 1.41 1.41L13.41 17.13l2.36 2.36a1 1 0 0 1-1.41 1.41L12 18.54l-2.36 2.36a1 1 0 0 1-1.41-1.41l2.36-2.36-2.36-2.36a2.5 2.5 0 1 1 1.41-1.41zM7.87 9.41a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm8.26 4.18a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" },
  { name: "Facial Treatments", description: "Rejuvenating facials, deep cleansing, and anti-aging treatments for glowing, healthy skin.", icon: "M12 2C8.14 2 5 5.14 5 9v2c0 2.97 1.61 5.57 4 6.96V21h6v-3.04c2.39-1.39 4-3.99 4-6.96V9c0-3.86-3.14-7-7-7zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-6.5 3h7a3.5 3.5 0 0 1-7 0z" },
  { name: "Manicure & Pedicure", description: "Complete nail care services including manicures and pedicures.", icon: "M8 2c.6 0 1 .4 1 1v6a1 1 0 1 1-2 0V3c0-.6.4-1 1-1zm4 0c.6 0 1 .4 1 1v7a1 1 0 1 1-2 0V3c0-.6.4-1 1-1zm4 1c.6 0 1 .4 1 1v6a1 1 0 1 1-2 0V4c0-.6.4-1 1-1zM6 12h12l-1.2 7.1A3 3 0 0 1 13.8 22h-3.6a3 3 0 0 1-3-2.9L6 12zm3 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9z" },
  { name: "Hair Coloring", description: "Professional hair coloring, highlights, and color correction services.", icon: "M12 2c2.4 3.6 5 7.2 5 10.3A5 5 0 0 1 12 17a5 5 0 0 1-5-4.7C7 9.2 9.6 5.6 12 2zm0 17c3.9 0 7 1.6 7 3H5c0-1.4 3.1-3 7-3zm-2-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  { name: "Bridal Packages", description: "Complete bridal makeover packages for your special day.", icon: "M12 2l2.3 4.7 5.2.8-3.8 3.7.9 5.3L12 14.8 7.4 16.5l.9-5.3L4.5 7.5l5.2-.8L12 2zm-6 18a6 6 0 0 1 12 0H6z" },
  { name: "Threading & Waxing", description: "Professional threading and waxing services for smooth, hair-free skin.", icon: "M4 6h16l-3 5v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7L4 6zm5 7a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9zm-2-9h10l1.5 2h-13L7 4z" }
];

function App() {
  const [modal, setModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    document.title = "Lavish Ladies Beauty Salon";
    
    // Update favicon to remove React logo
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    // Use a stylized 'L' as favicon to match the salon's branding
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="20" fill="#fff1f2"/>
        <text x="50" y="75" font-family="serif" font-size="70" fill="#e11d48" text-anchor="middle" font-weight="bold">L</text>
      </svg>
    `;
    link.href = `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
  }, []);

  return (
    <Router>
      <AppContent modal={modal} setModal={setModal} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </Router>
  );
}

function AppContent({ modal, setModal, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userInfo, logout, setIsLoggedIn, setUserInfo } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [homepageServices, setHomepageServices] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  
  React.useEffect(() => {
    fetchTestimonials();
    fetchHomepageServices();
    
    // Force scroll to top on mount
    window.scrollTo(0, 0);
    
    // Refresh content when navigating back to home
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTestimonials();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Scroll animations
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/appointments/testimonials`);
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchHomepageServices = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/services`);
      const data = await response.json();
      if (data?.success && Array.isArray(data.services) && data.services.length > 0) {
        setHomepageServices(data.services.slice(0, 6));
      } else {
        setHomepageServices(fallbackHomepageServices);
      }
    } catch (error) {
      console.error('Failed to fetch homepage services:', error);
      setHomepageServices(fallbackHomepageServices);
    }
  };

  return (
    <>
      <Routes>
        <Route
        path="/"
        key={window.location.pathname}
        element={
          <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 relative">
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(219, 39, 119, 0.08) 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)`
              }}></div>
            </div>
            
            <Header 
              isLoggedIn={isLoggedIn} 
              userInfo={userInfo} 
              onLogin={() => {
                const returnPath = `${location.pathname}${location.search}${location.hash}`;
                sessionStorage.setItem('postLoginReturnPath', returnPath);
                sessionStorage.setItem('postLoginScrollY', String(window.scrollY));
                setModal("signin");
              }} 
              onLogout={handleLogout}
            />

            <Navigation 
              scrollY={scrollY} 
              setSidebarOpen={setSidebarOpen} 
            />

            <main className="relative z-10">
              {/* About Us Section */}
              <section id="about" className="py-16 px-4">
                <div className="max-w-7xl mx-auto opacity-100 translate-y-0">
                  <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">About Us</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto"></div>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                          <span className="font-serif text-xl font-bold text-stone-800">7+</span>
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl font-medium text-stone-800">Years in Business</h3>
                          <p className="text-stone-600">Since March 2018</p>
                        </div>
                      </div>
                      
                      <p className="font-sans text-lg text-stone-600 leading-relaxed">
                        Lavish Ladies Beauty Salon in Uchila has been dedicated to personalized beauty care in a warm and inviting atmosphere. We offer a variety of services, including stylish haircuts, vibrant hair coloring, rejuvenating facials, and beautiful manicures and pedicures.
                      </p>

                      <p className="font-sans text-lg text-stone-600 leading-relaxed">
                        Visit us and experience tailored care that makes you look and feel your best. Book your appointment today!
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                          <h4 className="font-serif text-lg font-medium text-stone-800">Expert Stylists</h4>
                        </div>
                        
                        <div className="text-center p-4 bg-white/80 rounded-xl shadow-sm">
                          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <h4 className="font-serif text-lg font-medium text-stone-800">Premium Care</h4>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl overflow-hidden shadow-2xl">
                        <img 
                          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                          alt="Lavish Ladies Beauty Salon Uchila - Professional Hair Styling" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                        <svg className="w-8 h-8 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.5 16.5c0 2-2.5 3.5-2.5 3.5s-2.5-1.5-2.5-3.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5z"/>
                          <path d="M19.5 16.5c0 2-2.5 3.5-2.5 3.5s-2.5-1.5-2.5-3.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5z"/>
                          <path d="M3 2h2l.4 2M7 13h10l4-8H5.4"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Services Section */}
              <section id="services" className="py-16 px-4 bg-white/50">
                <div className="max-w-7xl mx-auto opacity-100 translate-y-0">
                  <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">Our Services</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-6"></div>
                    <p className="font-sans text-lg text-stone-600 max-w-2xl mx-auto">Discover our range of premium beauty and wellness services designed to make you look and feel your best.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {(homepageServices.length ? homepageServices : fallbackHomepageServices).map((service, index) => (
                      <button type="button"
                        key={index}
                        className="w-full text-left bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-200/50 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group"
                        style={{ animationDelay: `${index * 150}ms` }}
                        onClick={() => navigate('/services')}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d={service.icon}/>
                          </svg>
                        </div>
                        <h3 className="font-serif text-xl font-medium text-stone-800 mb-3 group-hover:text-rose-600 transition-colors duration-300">{service.name}</h3>
                        <p className="font-sans text-stone-600 text-sm leading-relaxed mb-4">{service.description}</p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-rose-600 font-semibold text-sm">Click to explore -></span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => navigate('/services')}
                      className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
                    >
                      <span className="relative z-10">View All Services</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                  </div>
                </div>
              </section>
              
              <Testimonials testimonials={testimonials} />
              
              {/* FAQ Section */}
              <section className="py-16 px-4 bg-white/50">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">Frequently Asked Questions</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-6"></div>
                  </div>
                  
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* FAQ Questions - Left side */}
                    <div className="lg:col-span-2 space-y-6">
                      {[
                        {
                          question: "What services do you offer?",
                          answer: "We offer a full range of beauty services, including haircuts, hair coloring, facials, manicures, pedicures, and bridal packages."
                        },
                        {
                          question: "Do I need to book an appointment?",
                          answer: "We recommend booking an appointment in advance to ensure availability. You can book online through our website or call us directly."
                        },
                        {
                          question: "What are your operating hours?",
                          answer: "Our hours are Monday to Saturday, 8:15 AM to 7:30 PM. On Sunday, we are open from 9:00 AM to 1:00 PM by appointment only."
                        },
                        {
                          question: "Do you offer bridal packages?",
                          answer: "Yes, we offer comprehensive bridal packages that include hair styling, makeup, and facials for your special day."
                        },
                        {
                          question: "What safety measures do you follow?",
                          answer: "We maintain high hygiene standards by sanitizing tools, keeping workstations clean, and following all health and safety protocols."
                        }
                      ].map((faq, index) => (
                        <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                          <h3 className="font-serif text-lg font-medium text-stone-800 mb-3">{faq.question}</h3>
                          <p className="font-sans text-stone-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Contact Card - Right side */}
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl p-6 shadow-md border-2 border-rose-200 sticky top-8">
                        <h3 className="font-serif text-xl font-medium text-rose-700 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                          Have more questions?
                        </h3>
                        <p className="font-sans text-stone-700 leading-relaxed mb-6">
                          For any additional questions or specific inquiries, feel free to contact us directly.
                        </p>
                        
                        {/* Contact Options */}
                        <div className="space-y-4">
                          <a 
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=lavishladiessalonuchila@gmail.com&su=Inquiry%20from%20Website&body=Hello%2C%0A%0AI%20would%20like%20to%20know%20more%20about%20your%20services."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-rose-100 transition-all duration-300 group transform hover:-translate-y-1 text-stone-700 hover:text-stone-900"
                          >
                            <div className="w-9 h-9 bg-rose-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-rose-700 transition-colors">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-stone-800 text-sm">Email Us</p>
                              <p className="text-stone-700 text-xs underline decoration-stone-300 underline-offset-2 group-hover:decoration-stone-500">lavishladiessalonuchila@gmail.com</p>
                            </div>
                          </a>
                          
                          <a 
                            href="https://www.instagram.com/lavish_ladies_salon_n_spa/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-rose-100 transition-all duration-300 group transform hover:-translate-y-1"
                          >
                            <div className="w-9 h-9 bg-rose-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-rose-700 transition-colors">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-stone-800 text-sm">Follow Us</p>
                              <p className="text-stone-600 text-xs">@lavish_ladies_salon_n_spa</p>
                            </div>
                          </a>
                          
                          <a
                            href="tel:+918147627651"
                            className="flex items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md border border-rose-100 transition-all duration-300 group w-full text-left transform hover:-translate-y-1"
                          >
                            <div className="w-9 h-9 bg-rose-600 rounded-full flex items-center justify-center mr-3 group-hover:bg-rose-700 transition-colors">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-stone-800 text-sm">Call Us</p>
                              <p className="text-stone-600 text-xs">+91 8147627651</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Contact Section */}
              <section id="contact" className="py-16 px-4 bg-gradient-to-br from-stone-100 to-rose-100">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">Get In Touch</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-8"></div>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <h3 className="font-serif text-xl font-medium text-stone-800 mb-2">Call Us</h3>
                      <a href="tel:+918147627651" className="font-sans text-stone-600 mb-2 block hover:text-rose-700 transition-colors">+91 8147627651</a>
                      <a href="tel:+918147627651" className="text-rose-600 hover:text-rose-700 font-sans text-sm">Call Now</a>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="font-serif text-xl font-medium text-stone-800 mb-2">Visit Us</h3>
                      <p className="font-sans text-stone-600 mb-2">Uchila, Udupi District</p>
                      <a 
                        href="https://www.google.com/maps/dir/?api=1&destination=13.188771,74.7537917&destination_place_id=ChIJt6eKQkJxrjsRfpf4C9oZqZc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose-600 hover:text-rose-700 font-sans text-sm"
                      >
                        Get Directions
                      </a>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-serif text-xl font-medium text-stone-800 mb-2">Hours</h3>
                      <div className="font-sans text-stone-600 text-sm space-y-1">
                        <p>Mon-Sat: 8:15AM-7:30PM</p>
                        <p>Sun: 9AM-1PM (Appointment Required)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
            
            {/* Professional Footer */}
            <footer className="bg-stone-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900"></div>
              <div className="relative z-10">
                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-xl font-medium text-white mb-4">Lavish Ladies Beauty Salon</h3>
                      <p className="font-sans text-stone-300 text-sm leading-relaxed">
                        Your premier destination for beauty and wellness in Uchila. Experience personalized care that makes you look and feel your best.
                      </p>
                      <div className="flex space-x-3">
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=lavishladiessalonuchila@gmail.com&su=Inquiry%20from%20Website&body=Hello%2C%0A%0AI%20would%20like%20to%20know%20more%20about%20your%20services." target="_blank" rel="noopener noreferrer" className="w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </a>
                        <a href="https://www.instagram.com/lavish_ladies_salon_n_spa/" target="_blank" rel="noopener noreferrer" className="w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                    
                    {/* Services */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-medium text-white mb-4">Our Services</h3>
                      <ul className="space-y-2 font-sans text-sm">
                        <li><span className="text-stone-300 hover:text-rose-400 transition-colors cursor-pointer">Hair Styling & Cuts</span></li>
                        <li><span className="text-stone-300 hover:text-rose-400 transition-colors cursor-pointer">Hair Coloring</span></li>
                        <li><span className="text-stone-300 hover:text-rose-400 transition-colors cursor-pointer">Facial Treatments</span></li>
                        <li><span className="text-stone-300 hover:text-rose-400 transition-colors cursor-pointer">Manicure & Pedicure</span></li>
                        <li><span className="text-stone-300 hover:text-rose-400 transition-colors cursor-pointer">Bridal Packages</span></li>
                      </ul>
                    </div>
                    
                    {/* Quick Links */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-medium text-white mb-4">Quick Links</h3>
                      <ul className="space-y-2 font-sans text-sm">
                        <li><a href="/" className="text-stone-300 hover:text-rose-400 transition-colors text-left">Home</a></li>
                        <li><a href="/services" className="text-stone-300 hover:text-rose-400 transition-colors text-left">Services</a></li>
                        <li><a href="/about" className="text-stone-300 hover:text-rose-400 transition-colors text-left">About Us</a></li>
                        <li><a href="#contact" className="text-stone-300 hover:text-rose-400 transition-colors">Contact</a></li>
                        <li>
                          <button
                            type="button"
                            onClick={() => navigate('/staff-login')}
                            className="text-stone-300 hover:text-rose-400 transition-colors text-left"
                          >
                            Staff Login
                          </button>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-medium text-white mb-4">Contact Info</h3>
                      <div className="space-y-3 font-sans text-sm">
                        <div className="flex items-center space-x-3">
                          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-stone-300">Uchila, Udupi District</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <a href="tel:+918147627651" className="text-stone-300 hover:text-rose-400 transition-colors">+91 8147627651</a>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-stone-300">Mon-Sat: 8:15AM-7:30PM<br/>Sun: 9AM-1PM (Appointment Required)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Google Maps Section */}
                  <div className="mt-12 pt-8 border-t border-stone-700">
                    <div className="text-center mb-6">
                      <h3 className="font-serif text-xl font-medium text-white mb-2">Find Us</h3>
                      <p className="font-sans text-stone-300 text-sm">Visit our salon in Uchila, Udupi District</p>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-lg">
                        <iframe 
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3884.581424501807!2d74.75121677484537!3d13.18877098714698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbcb1e842429ab7%3A0x972b259d0ba8f97e!2sLavish%20Ladies%20Beauty%20Salon!5e0!3m2!1sen!2sin!4v1771523318807!5m2!1sen!2sin" 
                          width="100%" 
                          height="300" 
                          style={{border: 0}} 
                          allowFullScreen="" 
                          loading="lazy" 
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Lavish Ladies Beauty Salon Location"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom Footer */}
                <div className="border-t border-stone-700">
                  <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                      <div className="font-sans text-sm text-stone-400">
                        © 2026 Lavish Ladies Beauty Salon. All rights reserved.
                      </div>
                      <div className="flex space-x-6 font-sans text-sm">
                        <button onClick={() => setModal("privacy")} className="text-stone-400 hover:text-rose-400 transition-colors cursor-pointer">Privacy Policy</button>
                        <button onClick={() => setModal("terms")} className="text-stone-400 hover:text-rose-400 transition-colors cursor-pointer">Terms of Service</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
            

            {sidebarOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                  onClick={() => setSidebarOpen(false)}
                />
                <nav className="relative z-50 w-80 bg-white/95 backdrop-blur-sm shadow-2xl h-full flex flex-col pt-20 border-r border-stone-200 transform transition-transform duration-300">
                  <button
                    className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-800 transition-all duration-200 hover:scale-110 transform"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="px-8 py-6 border-b border-stone-200">
                    <h3 className="font-serif text-xl font-light text-stone-800">Navigation</h3>
                  </div>
                  <div className="flex-1 py-6">
                    <a href="/" className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700 transform hover:translate-x-2 block">Home</a>
                    <a href="/about" className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700 transform hover:translate-x-2 block">About</a>
                    <a href="/services" className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700 transform hover:translate-x-2 block">Our Services</a>
                    <a href="#contact" onClick={() => setSidebarOpen(false)} className="w-full text-left hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 px-8 py-4 font-sans text-sm font-medium uppercase tracking-wider text-stone-700 transform hover:translate-x-2 block">Contact</a>
                  </div>
                </nav>
              </div>
            )}

            {modal === "signin" && (
              <SignIn onSuccess={async () => {
                setModal(null);
                try {
                  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
                    credentials: 'include'
                  });
                  const data = await response.json();
                  if (data?.authenticated && data?.user) {
                    setIsLoggedIn(true);
                    setUserInfo(data.user);
                  }
                } catch (error) {
                  console.error('Failed to refresh auth state:', error);
                }
              }} onClose={() => setModal(null)} />
            )}
            
            {modal === "privacy" && (
              <PrivacyPolicy onClose={() => setModal(null)} />
            )}
            
            {modal === "terms" && (
              <TermsOfService onClose={() => setModal(null)} />
            )}
            
          </div>
        }
      />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/revenue-analytics" element={<RevenueAnalytics />} />
        <Route path="/feedback/:token" element={<FeedbackForm />} />
        <Route path="/approve-testimonial/:token" element={<TestimonialApproval />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/privacy" element={<PrivacyPolicy onClose={() => navigate('/')} />} />
        <Route path="/terms" element={<TermsOfService onClose={() => navigate('/')} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieConsent onPrivacyClick={() => navigate('/privacy')} />
    </>
  );
}

export default App;

