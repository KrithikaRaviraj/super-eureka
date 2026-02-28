import React from 'react';

const Navigation = ({ scrollY, setSidebarOpen }) => {
  return (
    <nav className={`relative z-10 flex items-center px-4 sm:px-8 py-4 transition-all duration-300 font-sans ${
      scrollY > 100 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/60 backdrop-blur-sm'
    } border-b border-stone-200/30`}>
      <button
        className="mr-6 focus:outline-none lg:hidden transform hover:scale-110 transition-transform duration-200"
        onClick={() => setSidebarOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSidebarOpen(true);
          }
        }}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden lg:flex flex-1 justify-center space-x-12 max-w-4xl mx-auto">
        <a 
          href="/" 
          className="text-stone-700 hover:text-rose-600 transition-all duration-200 font-medium text-sm uppercase tracking-wider hover:scale-105 transform"
        >
          Home
        </a>
        <button 
          onClick={() => window.location.href = '/about'} 
          className="text-stone-700 hover:text-rose-600 transition-all duration-200 font-medium text-sm uppercase tracking-wider hover:scale-105 transform"
        >
          About
        </button>
        <button 
          onClick={() => window.location.href = '/services'} 
          className="text-stone-700 hover:text-rose-600 transition-all duration-200 font-medium text-sm uppercase tracking-wider hover:scale-105 transform"
        >
          Our Services
        </button>
        <a href="/contact" className="text-stone-700 hover:text-rose-600 transition-all duration-200 font-medium text-sm uppercase tracking-wider hover:scale-105 transform">Contact</a>
      </div>
    </nav>
  );
};

export default Navigation;
