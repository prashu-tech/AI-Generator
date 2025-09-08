// Create this as a separate component or include in dashboard.jsx
import React, { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

const Interactive3DRotatingLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const logoRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!logoRef.current) return;

    const rect = logoRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse position relative to center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Convert to rotation angles (adjust divisor for sensitivity)
    const rotateY = (mouseX / rect.width) * 30; // Max 30 degrees
    const rotateX = -(mouseY / rect.height) * 30; // Max 30 degrees (negative for natural feel)

    setTransform({
      rotateX,
      rotateY,
      scale: 1.1
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return (
    <div className="relative inline-block mb-6 cursor-pointer">
      {/* Outer Glow Ring */}
      <div 
        className={`absolute inset-0 w-28 h-28 border-purple-300/20 rounded-full transition-all duration-700 ${
          isHovered ? 'border-purple-400/40 animate-spin' : ''
        }`}
        style={{
          animation: isHovered ? 'spin 8s linear infinite reverse' : 'none'
        }}
      ></div>

      {/* Main 3D Logo Container */}
      <div
        ref={logoRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out, box-shadow 0.3s ease-out',
          boxShadow: isHovered 
            ? `0 20px 40px rgba(168, 85, 247, 0.4), 0 0 60px rgba(236, 72, 153, 0.3)` 
            : '0 10px 25px rgba(168, 85, 247, 0.2)'
        }}
      >
        {/* Inner Shadow for Depth */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
        
        {/* Main Sparkles Icon */}
        <Sparkles 
          className="w-10 h-10 text-white relative z-10" 
          style={{
            transform: `translateZ(20px)`,
            filter: isHovered ? 'brightness(1.2)' : 'brightness(1)'
          }}
        />

        {/* 3D Side Faces for More Depth */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-60"
          style={{
            transform: 'translateZ(-10px)',
            transformStyle: 'preserve-3d'
          }}
        ></div>
      </div>

      {/* Dynamic Sparkle Effects */}
      {isHovered && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
              style={{
                top: `${20 + Math.sin(i * 0.8) * 40}%`,
                left: `${20 + Math.cos(i * 0.8) * 40}%`,
                animation: `sparkle-float-${i} 2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        ${[...Array(8)].map((_, i) => `
          @keyframes sparkle-float-${i} {
            0%, 100% {
              opacity: 0;
              transform: scale(0) translateY(0px);
            }
            50% {
              opacity: 1;
              transform: scale(1) translateY(-${10 + i * 2}px);
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default Interactive3DRotatingLogo;
