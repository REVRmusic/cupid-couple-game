import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  'hsl(350, 80%, 55%)', // Rose-burgundy
  'hsl(340, 80%, 60%)', // Pink
  'hsl(45, 90%, 55%)',  // Gold
  'hsl(0, 0%, 100%)',   // White
  'hsl(350, 70%, 40%)', // Burgundy
  'hsl(320, 70%, 65%)', // Light pink
];

export function ConfettiCelebration() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate confetti pieces
    const pieces: ConfettiPiece[] = [];
    const numPieces = 80;

    for (let i = 0; i < numPieces; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100, // Random position across width
        delay: Math.random() * 0.5, // Staggered start
        duration: 2.5 + Math.random() * 1.5, // Varied duration
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 8 + Math.random() * 12, // Varied sizes
        rotation: Math.random() * 360, // Random initial rotation
      });
    }

    setConfetti(pieces);

    // Hide confetti after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size * 0.6}px`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
