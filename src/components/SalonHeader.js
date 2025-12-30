import React from 'react';
import SalonLogo from './SalonLogo';

export default function SalonHeader() {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-3 h-16 w-16 sm:h-20 sm:w-20">
        <SalonLogo />
      </div>
      <span className="font-serif text-xl sm:text-2xl font-light text-stone-800 text-center tracking-wide">
        Lavish Ladies Beauty Salon
      </span>
      <div className="flex items-center justify-center mt-2">
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
        <div className="mx-2 w-1 h-1 bg-rose-400 rounded-full"></div>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
      </div>
    </div>
  );
}