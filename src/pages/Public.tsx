import { useEffect, useState } from 'react';
import { HeartBackground } from '@/components/HeartBackground';
import { Logo } from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { useGame, useActiveGame, useLeaderboard } from '@/hooks/useGame';
import { Heart } from 'lucide-react';
import { PartnerLogos } from '@/components/PartnerLogos';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';

// Function to get humorous comment based on score percentage
function getScoreComment(score: number, total: number): { emoji: string; comment: string } {
  const percentage = total > 0 ? (score / total) * 100 : 0;

  if (percentage === 100) {
    return {
      emoji: '🏆',
      comment: "Incroyable ! Vous lisez dans les pensées de l'autre... C'est presque flippant !"
    };
  } else if (percentage >= 90) {
    return {
      emoji: '💑',
      comment: "Quasi parfait ! Vous êtes connectés comme le WiFi et le téléphone !"
    };
  } else if (percentage >= 70) {
    return {
      emoji: '💕',
      comment: "Très belle complicité ! Quelques mystères gardent la flamme vivante..."
    };
  } else if (percentage >= 50) {
    return {
      emoji: '💝',
      comment: "Pas mal ! Il reste des surprises à découvrir au coin du feu..."
    };
  } else if (percentage >= 30) {
    return {
      emoji: '🤔',
      comment: "Hmm... Vous vous êtes bien rencontrés ou c'était un date Tinder rapide ?"
    };
  } else if (percentage >= 10) {
    return {
      emoji: '😅',
      comment: "Oups ! Peut-être essayer de parler un peu plus au dîner ?"
    };
  } else if (score === 0) {
    return {
      emoji: '💔',
      comment: "Zéro point... C'est peut-être le moment de refaire connaissance !"
    };
  } else {
    return {
      emoji: '🙈',
      comment: "Euh... Vous êtes sûrs d'être ensemble ? On vérifie !"
    };
  }
}
export default function Public() {
  const { activeGame, loading: loadingActive } = useActiveGame();
  const { game, currentQuestion, gameQuestions, loading } = useGame(activeGame?.id);
  const { leaderboard } = useLeaderboard();
  const [showResult, setShowResult] = useState(false);
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);

  // Check if we need to show result
  useEffect(() => {
    if (currentQuestion && currentQuestion.is_correct !== null) {
      if (lastQuestionId !== currentQuestion.id) {
        setShowResult(true);
        setLastQuestionId(currentQuestion.id);
      }
    } else {
      setShowResult(false);
    }
  }, [currentQuestion, lastQuestionId]);

  if (loadingActive || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blush">
        <HeartBackground />
        <Heart className="w-24 h-24 text-primary animate-heart-beat" />
      </div>
    );
  }

  // No active game - show leaderboard
  if (!activeGame || game?.status === 'finished') {
    return (
      <div className="min-h-screen bg-blush p-8">
        <HeartBackground />
      <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Logo size="lg" />
          </div>

          {game?.status === 'finished' && (() => {
            const { emoji, comment } = getScoreComment(game.score, game.total_questions);
            const isPerfectScore = game.score === game.total_questions;
            
            return (
              <>
                {isPerfectScore && <ConfettiCelebration />}
                <Card className="romantic-card animate-scale-in">
                  <CardContent className="p-20 text-center">
                    <div className="text-9xl mb-8">{emoji}</div>
                    <h2 className="text-6xl font-display text-foreground mb-6">
                      Bravo {game.player1_name} & {game.player2_name} !
                    </h2>
                    <p className="text-9xl font-bold text-primary mb-6">
                      {game.score} / {game.total_questions}
                    </p>
                    <p className="text-4xl font-body text-muted-foreground">
                      {comment}
                    </p>
                  </CardContent>
                </Card>
              </>
            );
          })()}
          
          <PartnerLogos />
        </div>
      </div>
    );
  }

  // Waiting for game to start
  if (game?.status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blush p-8">
        <HeartBackground />
        <div className="relative z-10 text-center">
          <Logo size="lg" />
          <Card className="mt-12 romantic-card animate-fade-in">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-display text-foreground mb-6">
                {game.player1_name} & {game.player2_name}
              </h2>
              <p className="text-2xl font-body text-muted-foreground mb-8">
                Préparez-vous à jouer !
              </p>
              <p className="text-lg font-body text-muted-foreground">
                {game.total_questions} questions vous attendent
              </p>
              <Heart className="w-16 h-16 text-primary mx-auto mt-8 animate-heart-beat" />
            </CardContent>
          </Card>
          
          <PartnerLogos />
        </div>
      </div>
    );
  }

  // Show result
  if (showResult && currentQuestion) {
    const isCorrect = currentQuestion.is_correct;
    const player1Choice = currentQuestion.player1_answer === 'player1' 
      ? game?.player1_name 
      : game?.player2_name;
    const player2Choice = currentQuestion.player2_answer === 'player1' 
      ? game?.player1_name 
      : game?.player2_name;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blush p-8">
        <HeartBackground />
        <div className="relative z-10 max-w-4xl w-full">
          {/* Score */}
          <div className="text-center mb-8">
            <p className="text-xl font-body text-muted-foreground">
              Question {(game?.current_question_index || 0) + 1} / {game?.total_questions}
            </p>
            <p className="text-3xl font-display text-primary">
              Score : {game?.score}
            </p>
          </div>

          {/* Question */}
          <Card className="romantic-card mb-8">
            <CardContent className="p-12 text-center">
              <p className="text-4xl md:text-5xl font-display text-foreground leading-relaxed">
                {currentQuestion.questions?.text}
              </p>
            </CardContent>
          </Card>

          {/* Result Card */}
          <Card className={`romantic-card animate-scale-in ${isCorrect ? 'ring-4 ring-green-400' : 'ring-4 ring-red-400'}`}>
            <CardContent className="p-12 text-center">
              <div className="text-8xl mb-6">
                {isCorrect ? '❤️' : '💔'}
              </div>
              <h2 className={`text-5xl font-display mb-8 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? 'Gagné !' : 'Perdu !'}
              </h2>
              
              <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
                <div className="text-center">
                  <p className="text-lg font-body text-muted-foreground mb-2">
                    {game?.player1_name}
                  </p>
                  <p className="text-2xl font-display text-foreground">
                    → {player1Choice}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-body text-muted-foreground mb-2">
                    {game?.player2_name}
                  </p>
                  <p className="text-2xl font-display text-foreground">
                    → {player2Choice}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <PartnerLogos />
        </div>
      </div>
    );
  }

  // Show question
  if (currentQuestion) {
    const player1Answered = !!currentQuestion.player1_answer;
    const player2Answered = !!currentQuestion.player2_answer;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blush p-8">
        <HeartBackground />
        <div className="relative z-10 max-w-4xl w-full">
          {/* Score */}
          <div className="text-center mb-8">
            <p className="text-xl font-body text-muted-foreground">
              Question {(game?.current_question_index || 0) + 1} / {game?.total_questions}
            </p>
            <p className="text-3xl font-display text-primary">
              Score : {game?.score}
            </p>
          </div>

          {/* Question */}
          <Card className="romantic-card mb-8 animate-fade-in">
            <CardContent className="p-12 text-center">
              <p className="text-4xl md:text-5xl font-display text-foreground leading-relaxed">
                {currentQuestion.questions?.text}
              </p>
            </CardContent>
          </Card>

          {/* Players Status */}
          <div className="grid grid-cols-2 gap-8">
            <Card className={`romantic-card transition-all duration-300 ${player1Answered ? 'ring-4 ring-green-400' : ''}`}>
              <CardContent className="p-8 text-center">
                <p className="text-2xl font-display text-foreground mb-4">
                  {game?.player1_name}
                </p>
                {player1Answered ? (
                  <div className="text-green-500">
                    <div className="text-4xl mb-2">✓</div>
                    <p className="font-body">A répondu</p>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Heart className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p className="font-body">En attente...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={`romantic-card transition-all duration-300 ${player2Answered ? 'ring-4 ring-green-400' : ''}`}>
              <CardContent className="p-8 text-center">
                <p className="text-2xl font-display text-foreground mb-4">
                  {game?.player2_name}
                </p>
                {player2Answered ? (
                  <div className="text-green-500">
                    <div className="text-4xl mb-2">✓</div>
                    <p className="font-body">A répondu</p>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Heart className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p className="font-body">En attente...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <PartnerLogos />
        </div>
      </div>
    );
  }

  return (
    <>
      <PartnerLogos />
    </>
  );
}
