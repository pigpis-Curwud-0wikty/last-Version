import React from 'react';
import { assets } from '../assets/frontend_assets/assets';

const HeroBanner = () => {
  return (
    <div
      className="relative w-full h-[400px] md:h-[520px] flex items-center justify-center"
      style={{
        backgroundImage: `url(${assets.hero_banner_img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Optional: Overlay for better text contrast */}
      <div className="absolute inset-0 bg-opacity-30"></div>
      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <span className="tracking-widest text-sm mb-2">FW24</span>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Faith Jersey in Berlin</h1>
        <button className="bg-white text-black px-6 py-2 font-semibold hover:bg-gray-200 transition">
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

export default HeroBanner; 