import React, { useEffect, useState } from 'react';

const ShiningButton = () => {
  const [position, setPosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPosition((prev) => (prev >= 200 ? -100 : prev + 0.5)); // Slower, smoother movement
    }, 10); // Faster updates for smoother animation
    return () => clearInterval(intervalId);
  }, []);

  return (
    <button 
      className="relative px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-300 overflow-hidden"
      style={{ 
        backgroundColor: isHovered ? "#57321A" : "#EFC815",
        color: isHovered ? "#EFC815" : "#57321A"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Text container for shine effect */}
      <div className="relative">
        {/* Shine overlay */}
        <div
          className="absolute inset-0 w-full"
          style={{
            background: isHovered
              ? "linear-gradient(90deg, transparent, #57321A, transparent)"
              : "linear-gradient(90deg, transparent, #EFC815, transparent)",
            transform: `translateX(${position}%)`,
            width: '100%',
          }}
        />

        {/* Text content */}
        <div
          style={{
            backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            animationDuration: '3s',
          }}
        >
          Join Now
        </div>
      </div>
    </button>
  );
};

export default ShiningButton;
