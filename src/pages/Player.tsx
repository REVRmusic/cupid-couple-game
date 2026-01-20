import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HeartBackground } from '@/components/HeartBackground';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useGame, useActiveGame } from '@/hooks/useGame';
import { submitAnswer } from '@/lib/gameActions';
import { Heart, Clock, Check } from 'lucide-react';

export default function Player() {
  const [searchParams] = useSearchParams();
  const playerParam = searchParams.get('player');
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(
    playerParam === '1' ? 1 : playerParam === '2' ? 2 : null
  );
  const [playerName, setPlayerName] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);

  const { activeGame, loading: loadingActive } = useActiveGame();
  const { game, currentQuestion, loading } = useGame(activeGame?.id);

  useEffect(() => {
    if (currentQuestion) {
      // Reset answer state when question changes
      const myAnswer = playerNumber === 1 
        ? currentQuestion.player1_answer 
        : currentQuestion.player2_answer;
      setHasAnswered(!!myAnswer);
    }
  }, [currentQuestion, playerNumber]);

  // Set player name from game
  useEffect(() => {
    if (game && playerNumber) {
      setPlayerName(playerNumber === 1 ? game.player1_name : game.player2_name);
    }
  }, [game, playerNumber]);

  if (loadingActive || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blush">
        <HeartBackground />
        <div className="animate-pulse">
          <Heart className="w-16 h-16 text-primary animate-heart-beat" />
        </div>
      </div>
    );
  }

  if (!activeGame) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blush p-8">
        <HeartBackground />
        <div className="relative z-10 text-center">
          <Logo size="lg" />
          <p className="mt-8 text-2xl font-body text-muted-foreground">
            En attente d'une nouvelle partie...
          </p>
          <Clock className="w-12 h-12 text-primary/50 mx-auto mt-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!playerNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blush p-8">
        <HeartBackground />
        <div className="relative z-10 text-center max-w-md w-full">
          <Logo size="lg" />
          <p className="mt-8 mb-6 text-xl font-body text-muted-foreground">
            Qui êtes-vous ?
          </p>
          <div className="space-y-4">
            <Button
              onClick={() => setPlayerNumber(1)}
              className="w-full py-8 text-2xl romantic-button"
            >
              {activeGame.player1_name}
            </Button>
            <Button
              onClick={() => setPlayerNumber(2)}
              className="w-full py-8 text-2xl romantic-button"
            >
              {activeGame.player2_name}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (game?.status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blush p-8">
        <HeartBackground />
        <div className="relative z-10 text-center">
          <Logo />
          <Card className="mt-8 romantic-card">
            <CardContent className="p-8 text-center">
              <p className="text-2xl font-display text-foreground mb-4">
                Bonjour {playerName} !
              </p>
              <p className="text-lg font-body text-muted-foreground">
                La partie va bientôt commencer...
              </p>
              <Heart className="w-12 h-12 text-primary mx-auto mt-6 animate-heart-beat" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (game?.status === 'finished') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blush p-8">
        <HeartBackground />
        <div className="relative z-10 text-center">
          <Logo />
          <Card className="mt-8 romantic-card">
            <CardContent className="p-8 text-center">
              <p className="text-3xl font-display text-foreground mb-4">
                🎉 Partie terminée ! 🎉
              </p>
              <p className="text-5xl font-bold text-primary mb-4">
                {game.score} / {game.total_questions}
              </p>
              <p className="text-lg font-body text-muted-foreground">
                Merci d'avoir joué !
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blush">
        <HeartBackground />
        <div className="animate-pulse">
          <Heart className="w-16 h-16 text-primary animate-heart-beat" />
        </div>
      </div>
    );
  }

  const handleAnswer = async (answer: 'player1' | 'player2') => {
    if (hasAnswered) return;
    
    setHasAnswered(true);
    await submitAnswer(currentQuestion.id, playerNumber, answer);
  };

  const otherPlayerAnswered = playerNumber === 1 
    ? !!currentQuestion.player2_answer 
    : !!currentQuestion.player1_answer;

  return (
    <div className="min-h-screen flex flex-col bg-blush">
      <HeartBackground />
      
      {/* Header */}
      <div className="relative z-10 p-4 text-center border-b border-border bg-card/80 backdrop-blur-sm">
        <p className="text-sm font-body text-muted-foreground">
          Question {(game?.current_question_index || 0) + 1} / {game?.total_questions}
        </p>
        <p className="font-display text-lg text-primary">{playerName}</p>
      </div>

      {/* Question */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md romantic-card mb-8">
          <CardContent className="p-8 text-center">
            <p className="text-2xl md:text-3xl font-display text-foreground leading-relaxed">
              {currentQuestion.questions?.text}
            </p>
          </CardContent>
        </Card>

        {/* Answer Buttons */}
        {!hasAnswered ? (
          <div className="w-full max-w-md space-y-4">
            <Button
              onClick={() => handleAnswer('player1')}
              className="w-full py-8 text-2xl romantic-button"
            >
              {game?.player1_name}
            </Button>
            <Button
              onClick={() => handleAnswer('player2')}
              className="w-full py-8 text-2xl romantic-button"
            >
              {game?.player2_name}
            </Button>
          </div>
        ) : (
          <Card className="w-full max-w-md romantic-card">
            <CardContent className="p-8 text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-display text-foreground mb-2">
                Réponse enregistrée !
              </p>
              <p className="text-muted-foreground font-body">
                {otherPlayerAnswered 
                  ? "En attente de la prochaine question..."
                  : `En attente de ${playerNumber === 1 ? game?.player2_name : game?.player1_name}...`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
