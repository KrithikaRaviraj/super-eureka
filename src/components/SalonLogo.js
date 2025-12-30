import React from 'react';

export default function SalonLogo() {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
        <span className="text-5xl font-bold text-rose-700 italic" style={{fontFamily: 'cursive'}}>
          ℒ
        </span>
      </div>
    </div>
  );
}