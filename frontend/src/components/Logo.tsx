import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-full h-full" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 400 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background/Base to ensure clean scaling */}
      <rect width="400" height="120" fill="transparent" />

      {/* --- GRAPHIC ELEMENT --- */}
      <g transform="translate(10, 10)">
        {/* Buildings in background (Charcoal) */}
        <rect x="50" y="10" width="15" height="60" fill="#2a323c" />
        <rect x="70" y="0" width="20" height="70" fill="#1b2027" />
        <rect x="95" y="20" width="15" height="50" fill="#43586f" />
        
        {/* Crane in background (Orange) */}
        <path d="M 35 15 L 60 15 L 60 18 L 38 18 L 38 70 L 35 70 Z" fill="#f96b07" />
        <path d="M 40 18 L 55 30 L 58 28 L 40 15 Z" fill="#f96b07" />

        {/* The First 'B' (Orange) */}
        <path d="M 15 25 L 35 25 C 45 25 50 30 50 40 C 50 47 45 50 40 50 C 50 50 55 55 55 65 C 55 75 45 80 35 80 L 15 80 Z" fill="#f96b07" />
        <path d="M 25 35 L 35 35 C 40 35 40 40 40 42 C 40 45 40 50 35 50 L 25 50 Z" fill="#ffffff" />
        <path d="M 25 60 L 35 60 C 40 60 42 62 42 65 C 42 70 40 70 35 70 L 25 70 Z" fill="#ffffff" />

        {/* The Second 'B' (Charcoal) */}
        <path d="M 50 35 L 75 35 C 85 35 90 40 90 50 C 90 57 85 60 80 60 C 90 60 95 65 95 75 C 95 85 85 90 75 90 L 50 90 Z" fill="#2a323c" />
        <path d="M 60 45 L 75 45 C 80 45 80 50 80 52 C 80 55 80 60 75 60 L 60 60 Z" fill="#ffffff" />
        <path d="M 60 70 L 75 70 C 80 70 82 72 82 75 C 82 80 80 80 75 80 L 60 80 Z" fill="#ffffff" />

        {/* Roof Base Element (Charcoal & Orange) */}
        <path d="M 0 95 L 60 70 L 120 95 L 110 98 L 60 78 L 10 98 Z" fill="#2a323c" />
        <rect x="52" y="80" width="16" height="15" fill="#f96b07" />
        <rect x="56" y="84" width="3" height="11" fill="#ffffff" />
        <rect x="52" y="88" width="16" height="3" fill="#ffffff" />
      </g>

      {/* --- TEXT ELEMENT --- */}
      {/* BB BUILDERS */}
      <g transform="translate(150, 60)">
        <text x="0" y="0" fontFamily="Impact, sans-serif, Arial Black" fontSize="48" fontWeight="900" fill="#f96b07">BB</text>
        <text x="75" y="0" fontFamily="Impact, sans-serif, Arial Black" fontSize="48" fontWeight="900" fill="#2a323c">BUILDERS</text>
      </g>

      {/* Tagline */}
      <g transform="translate(152, 85)">
        <rect x="0" y="0" width="12" height="2" fill="#f96b07" />
        <text x="20" y="5" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" letterSpacing="2" fill="#2a323c">TRUTH</text>
        
        <circle cx="70" cy="1" r="2" fill="#f96b07" />
        
        <text x="82" y="5" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" letterSpacing="2" fill="#2a323c">HARDWORK</text>

        <circle cx="168" cy="1" r="2" fill="#f96b07" />

        <text x="180" y="5" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" letterSpacing="2" fill="#2a323c">GREATNESS</text>
      </g>

      {/* Divider line between graphic and text */}
      <line x1="135" y1="20" x2="135" y2="100" stroke="#ccd3dc" strokeWidth="2" />
    </svg>
  );
}
