import React, { useEffect, useState } from 'react';

export default function SnowEffect() {
  const [flakes, setFlakes] = useState([]);

  useEffect(() => {
    // Generate 32 pleasant snowflake positions
    const items = Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 98}%`,
      animationDuration: `${4 + Math.random() * 6}s`,
      animationDelay: `${Math.random() * 5}s`,
      fontSize: `${10 + Math.random() * 16}px`,
      opacity: 0.3 + Math.random() * 0.7,
      char: ['❄', '❅', '❆', '•', '✨'][Math.floor(Math.random() * 5)]
    }));
    setFlakes(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake select-none"
          style={{
            left: flake.left,
            animation: `fall ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay,
            fontSize: flake.fontSize,
            opacity: flake.opacity,
          }}
        >
          {flake.char}
        </span>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) translateX(15px) rotate(180deg);
          }
          100% {
            transform: translateY(105vh) translateX(-15px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

