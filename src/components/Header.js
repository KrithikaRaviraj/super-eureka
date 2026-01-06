import React from 'react';
import { useNavigate } from 'react-router-dom';
import SalonHeader from './SalonHeader';

const Header = ({ isLoggedIn, userInfo, onLogin, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 bg-white/80 backdrop-blur-sm border-b border-stone-200/50 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
      <SalonHeader />
      {!isLoggedIn ? (
        <button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white font-sans font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm uppercase tracking-wider transform hover:scale-105"
          onClick={onLogin}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onLogin();
            }
          }}
        >
          Login
        </button>
      ) : (
        <div className="flex items-center space-x-4">
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-sans font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm uppercase tracking-wider transform hover:scale-105"
            onClick={() => navigate('/welcome', { state: userInfo })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/welcome', { state: userInfo });
              }
            }}
          >
            {userInfo?.name ? `Welcome, ${userInfo.name.split(' ')[0]}` : 'Welcome User'}
          </button>
          <button
            className="px-4 py-3 rounded-xl border-2 border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-800 font-sans font-medium transition-all duration-300 text-sm uppercase tracking-wider"
            onClick={() => {
              onLogout();
              navigate('/');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onLogout();
                navigate('/');
              }
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;