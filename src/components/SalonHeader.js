import React from 'react';
import SalonLogo from './SalonLogo';

export default function SalonHeader() {
  return (
    <div className="flex flex-col items-center mb-2">
      <div className="relative mb-2 h-12 w-12 sm:h-14 sm:w-14">
        <SalonLogo />
      </div>
      <span className="font-serif text-lg sm:text-xl font-light text-stone-800 text-center tracking-wide">
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
