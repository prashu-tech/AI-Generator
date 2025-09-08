// components/background/StarfieldBackground.jsx
'use client';
import { useEffect, useRef } from 'react';

const StarfieldBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Star class
    class Star {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // Start at random position initially
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -10;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkle = Math.random() * 0.02 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        
        // Different star colors
        const colors = [
          { r: 255, g: 255, b: 255 }, // White
          { r: 200, g: 150, b: 255 }, // Purple
          { r: 255, g: 150, b: 200 }, // Pink
          { r: 150, g: 200, b: 255 }, // Blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(time) {
        this.y += this.speed;
        
        // Reset star when it goes off screen
        if (this.y > height + 10) {
          this.reset();
        }
        
        // Twinkling effect
        this.currentOpacity = this.opacity + Math.sin(time * this.twinkle + this.twinkleOffset) * 0.3;
        this.currentOpacity = Math.max(0.1, Math.min(1, this.currentOpacity));
      }

      draw(ctx) {
        ctx.save();
        
        // Create glowing effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bright center
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Shooting star class
    class ShootingStar {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width + width;
        this.y = Math.random() * height * 0.5;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 5;
        this.size = Math.random() * 2 + 1;
        this.opacity = 1;
        this.decay = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x -= this.speed;
        this.y += this.speed * 0.5;
        this.opacity -= this.decay;

        if (this.opacity <= 0 || this.x < -this.length) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.save();
        
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.length, this.y + this.length * 0.5);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(200, 150, 255, ${this.opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y + this.length * 0.5);
        ctx.stroke();
        
        ctx.restore();
      }
    }

    // Create stars
    const stars = [];
    const shootingStars = [];
    
    for (let i = 0; i < 200; i++) {
      stars.push(new Star());
    }
    
    for (let i = 0; i < 3; i++) {
      shootingStars.push(new ShootingStar());
    }
    
    starsRef.current = stars;

    let time = 0;
    
    const animate = () => {
      time += 0.016; // ~60fps
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw stars
      stars.forEach(star => {
        star.update(time);
        star.draw(ctx);
      });
      
      // Update and draw shooting stars (less frequent)
      if (Math.random() < 0.002) {
        shootingStars.forEach(shootingStar => {
          shootingStar.update();
          shootingStar.draw(ctx);
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: 'transparent',
      }}
    />
  );
};

export default StarfieldBackground;
