import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HeartBackground } from "@/components/HeartBackground";
import { Logo } from "@/components/Logo";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-romantic flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <HeartBackground />
      
      <div className="z-10 text-center space-y-8 max-w-2xl">
        <Logo size="lg" />
        
        <p className="text-xl text-foreground/80 font-light">
          Le jeu qui teste la complicité des couples !
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link to="/player">
            <Button size="lg" className="romantic-button text-lg px-8 py-6 w-full sm:w-auto">
              <Heart className="mr-2 h-5 w-5" />
              Jouer
            </Button>
          </Link>
          
          <Link to="/public">
            <Button size="lg" variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10 text-lg px-8 py-6 w-full sm:w-auto">
              Écran Public
            </Button>
          </Link>
          
          <Link to="/admin">
            <Button size="lg" variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-primary/10 text-lg px-8 py-6 w-full sm:w-auto">
              Administration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
