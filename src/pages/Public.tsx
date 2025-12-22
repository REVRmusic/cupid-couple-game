import { useEffect, useState } from 'react';
import { HeartBackground } from '@/components/HeartBackground';
import { Logo } from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { useGame, useActiveGame, useLeaderboard } from '@/hooks/useGame';
import { Heart, Trophy, Crown, Medal } from 'lucide-react';

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
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Logo size="lg" />
          </div>

          {game?.status === 'finished' && (
            <Card className="romantic-card mb-12 animate-scale-in">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-display text-foreground mb-4">
                  Bravo {game.player1_name} & {game.player2_name} !
                </h2>
                <p className="text-6xl font-bold text-primary mb-4">
                  {game.score} / {game.total_questions}
                </p>
                <p className="text-2xl font-body text-muted-foreground">
                  {game.score === game.total_questions 
                    ? "Score parfait ! Vous êtes faits l'un pour l'autre ❤️"
                    : game.score >= game.total_questions / 2 
                    ? "Beau score ! Vous vous connaissez bien 💕"
                    : "Il y a encore des choses à découvrir ! 💝"
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card className="romantic-card">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Trophy className="w-8 h-8 text-gold" />
                <h2 className="text-3xl font-display text-foreground">Classement</h2>
              </div>
              
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground font-body text-lg">
                  Aucune partie terminée pour le moment
                </p>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((g, index) => (
                    <div
                      key={g.id}
                      className={`flex items-center p-4 rounded-xl ${
                        index === 0 ? 'bg-gold/20' : 
                        index === 1 ? 'bg-muted' : 
                        index === 2 ? 'bg-orange-100' : 'bg-card'
                      }`}
                    >
                      <div className="w-12 text-center">
                        {index === 0 ? (
                          <Crown className="w-8 h-8 text-gold mx-auto" />
                        ) : index === 1 ? (
                          <Medal className="w-7 h-7 text-gray-400 mx-auto" />
                        ) : index === 2 ? (
                          <Medal className="w-6 h-6 text-orange-400 mx-auto" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 ml-4">
                        <p className="font-display text-xl text-foreground">
                          {g.player1_name} & {g.player2_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {g.score}/{g.total_questions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
        </div>
      </div>
    );
  }

  return null;
}
