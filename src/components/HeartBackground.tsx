import { useEffect, useState } from 'react';

interface FloatingHeart {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function HeartBackground() {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    const newHearts: FloatingHeart[] = [];
    for (let i = 0; i < 15; i++) {
      newHearts.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        size: 12 + Math.random() * 20,
      });
    }
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-primary/20"
          style={{
            left: `${heart.x}%`,
            fontSize: `${heart.size}px`,
            animation: `floatUp ${heart.duration}s ease-in-out ${heart.delay}s infinite`,
          }}
        >
          ❤
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
