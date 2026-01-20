import { Heart } from 'lucide-react';
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}
export function Logo({
  size = 'md'
}: LogoProps) {
  const sizes = {
    sm: {
      icon: 24,
      text: 'text-xl'
    },
    md: {
      icon: 36,
      text: 'text-3xl'
    },
    lg: {
      icon: 48,
      text: 'text-5xl'
    }
  };
  return <div className="gap-3 flex items-center justify-center">
      <Heart size={sizes[size].icon} className="text-primary fill-primary animate-heart-beat" />
      <h1 className={`font-display font-bold ${sizes[size].text} text-gradient-romantic`}>
        Jeu des Couples
      </h1>
      <Heart size={sizes[size].icon} className="text-primary fill-primary animate-heart-beat" style={{
      animationDelay: '0.5s'
    }} />
    </div>;
}