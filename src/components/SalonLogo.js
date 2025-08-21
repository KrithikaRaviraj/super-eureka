import React from 'react';

export default function SalonLogo() {
  return (
    <div className="relative h-14 w-14 sm:h-16 sm:w-16">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" stroke="#fff" strokeWidth="2"/>
        <path d="M35 25c0-8 6-12 15-12s15 4 15 12c0 6-4 10-8 12l2 8c2 1 4 2 4 4v3c0 2-1 3-3 3h-20c-2 0-3-1-3-3v-3c0-2 2-3 4-4l2-8c-4-2-8-6-8-12z" fill="#fff" opacity="0.9"/>
        <path d="M32 20c2-6 8-10 18-10s16 4 18 10c2 4 0 8-2 10-1-2-3-4-6-4s-5 2-6 4h-8c-1-2-3-4-6-4s-5 2-6 4c-2-2-4-6-2-10z" fill="#8B4513" opacity="0.8"/>
        <g transform="translate(65,65) rotate(45)">
          <ellipse cx="0" cy="-8" rx="3" ry="8" fill="#C0C0C0"/>
          <ellipse cx="0" cy="8" rx="3" ry="8" fill="#C0C0C0"/>
          <circle cx="0" cy="0" r="2" fill="#666"/>
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#333" strokeWidth="1"/>
        </g>
        <circle cx="20" cy="75" r="2" fill="#FFB6C1" opacity="0.6"/>
        <circle cx="80" cy="30" r="1.5" fill="#FFB6C1" opacity="0.6"/>
        <circle cx="25" cy="35" r="1" fill="#DDA0DD" opacity="0.6"/>
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1"/>
            <stop offset="50%" stopColor="#DDA0DD"/>
            <stop offset="100%" stopColor="#F8BBD9"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute -inset-2 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-full blur-lg"></div>
    </div>
  );
}