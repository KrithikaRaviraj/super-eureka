import React from 'react';
import logoImage from '../assets/lavish-logo.jpeg';

export default function SalonLogo() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg">
        <img 
          src={logoImage} 
          alt="Lavish Ladies Beauty Salon Logo" 
          className="w-full h-full object-cover scale-110"
        />
      </div>
    </div>
  );
}