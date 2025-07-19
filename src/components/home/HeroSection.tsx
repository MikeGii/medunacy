// src/components/home/HeroSection.tsx
'use client';

import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Full cover image */}
      <div className="relative h-[40vh] sm:h-[45vh] lg:h-[50vh]">
        <Image
          src="/images/doctor_image_hero.png"
          alt="Medical Professional"
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient overlays for seamless blending */}
        {/* Top blend with header */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#FBF6E9] via-[#FBF6E9]/80 to-transparent"></div>
        
        {/* Bottom blend with next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
        
        {/* Left and right subtle fades */}
        <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-[#FBF6E9]/40 to-transparent"></div>
        <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#FBF6E9]/40 to-transparent"></div>
        
        {/* Subtle color overlay for medical theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#118B50]/10 via-transparent to-[#E3F0AF]/15"></div>
        
        {/* Corner fades for smooth edges */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-radial from-[#FBF6E9]/60 to-transparent"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-[#FBF6E9]/60 to-transparent"></div>
      </div>

      {/* Smooth wave transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0,32L48,37.3C96,43,192,53,288,53.3C384,53,480,43,576,37.3C672,32,768,32,864,37.3C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}