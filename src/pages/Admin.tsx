import { useState } from 'react';
import { HeartBackground } from '@/components/HeartBackground';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame, useActiveGame, useQuestions, useLeaderboard } from '@/hooks/useGame';
import { createGame, startGame, nextQuestion, resetGame, deleteGame } from '@/lib/gameActions';
import { 
  Play, 
  SkipForward, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Settings, 
  Trophy,
  Users,
  HelpCircle,
  Check,
  X,
  Pencil
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export default function Admin() {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<{ id: string; text: string } | null>(null);

  const { activeGame, loading: loadingActive } = useActiveGame();
  const { game, currentQuestion, gameQuestions, loading } = useGame(activeGame?.id);
  const { questions, addQuestion, updateQuestion, deleteQuestion: removeQuestion } = useQuestions();
  const { leaderboard } = useLeaderboard();

  const handleCreateGame = async () => {
    if (!player1Name || !player2Name) {
      toast({ title: 'Erreur', description: 'Veuillez entrer les deux prénoms', variant: 'destructive' });
      return;
    }
    
    const { error, data } = await createGame(player1Name, player2Name, totalQuestions);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer la partie', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Partie créée !' });
      setPlayer1Name('');
      setPlayer2Name('');
    }
  };

  const handleStartGame = async () => {
    if (!game) return;
    const { error } = await startGame(game.id);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de démarrer', variant: 'destructive' });
    } else {
      toast({ title: 'C\'est parti !', description: 'La partie a commencé' });
    }
  };

  const handleNextQuestion = async () => {
    if (!game) return;
    const { error, finished } = await nextQuestion(game.id, game.current_question_index, game.total_questions);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de passer à la question suivante', variant: 'destructive' });
    } else if (finished) {
      toast({ title: 'Terminé !', description: 'La partie est terminée' });
    }
  };

  const handleResetGame = async () => {
    if (!game) return;
    const { error } = await resetGame(game.id);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de réinitialiser', variant: 'destructive' });
    } else {
      toast({ title: 'Réinitialisé', description: 'La partie a été réinitialisée' });
    }
  };

  const handleDeleteGame = async () => {
    if (!game) return;
    const { error } = await deleteGame(game.id);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    } else {
      toast({ title: 'Supprimé', description: 'La partie a été supprimée' });
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    const { error } = await addQuestion(newQuestion);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter la question', variant: 'destructive' });
    } else {
      setNewQuestion('');
      toast({ title: 'Ajouté', description: 'Question ajoutée' });
    }
  };

  const handleUpdateQuestion = async (id: string, text: string, isActive: boolean) => {
    const { error } = await updateQuestion(id, text, isActive);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de modifier la question', variant: 'destructive' });
    } else {
      setEditingQuestion(null);
      toast({ title: 'Modifié', description: 'Question modifiée' });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const { error } = await removeQuestion(id);
    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer la question', variant: 'destructive' });
    } else {
      toast({ title: 'Supprimé', description: 'Question supprimée' });
    }
  };

  return (
    <div className="min-h-screen bg-blush">
      <HeartBackground />
      
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <p className="font-body text-muted-foreground">Interface Admin</p>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <Tabs defaultValue="game" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="game" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Partie
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Questions
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Classement
            </TabsTrigger>
          </TabsList>

          {/* Game Tab */}
          <TabsContent value="game" className="space-y-6">
            {!activeGame ? (
              <Card className="romantic-card">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Nouvelle Partie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-body text-muted-foreground mb-2 block">
                        Prénom Joueur 1
                      </label>
                      <Input
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        placeholder="Ex: David"
                        className="text-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-body text-muted-foreground mb-2 block">
                        Prénom Joueur 2
                      </label>
                      <Input
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        placeholder="Ex: Julie"
                        className="text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body text-muted-foreground mb-2 block">
                      Nombre de questions
                    </label>
                    <Input
                      type="number"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      min={1}
                      max={questions.filter(q => q.is_active).length}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {questions.filter(q => q.is_active).length} questions actives disponibles
                    </p>
                  </div>
                  <Button onClick={handleCreateGame} className="romantic-button">
                    <Plus className="w-4 h-4 mr-2" /> Créer la partie
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Current Game Info */}
                <Card className="romantic-card">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl flex items-center justify-between">
                      <span>{game?.player1_name} & {game?.player2_name}</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        game?.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                        game?.status === 'playing' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {game?.status === 'waiting' ? 'En attente' :
                         game?.status === 'playing' ? 'En cours' : 'Terminé'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground font-body">Question</p>
                        <p className="text-3xl font-bold text-foreground">
                          {(game?.current_question_index || 0) + 1} / {game?.total_questions}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground font-body">Score</p>
                        <p className="text-3xl font-bold text-primary">{game?.score}</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground font-body">Réponses</p>
                        <div className="flex justify-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-sm ${currentQuestion?.player1_answer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {game?.player1_name}
                          </span>
                          <span className={`px-2 py-1 rounded text-sm ${currentQuestion?.player2_answer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {game?.player2_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Current Question */}
                    {currentQuestion && (
                      <div className="p-4 bg-card border border-border rounded-lg mb-6">
                        <p className="text-sm text-muted-foreground font-body mb-2">Question actuelle :</p>
                        <p className="text-xl font-display text-foreground">
                          {currentQuestion.questions?.text}
                        </p>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-wrap gap-3">
                      {game?.status === 'waiting' && (
                        <Button onClick={handleStartGame} className="romantic-button">
                          <Play className="w-4 h-4 mr-2" /> Démarrer
                        </Button>
                      )}
                      
                      {game?.status === 'playing' && (
                        <Button 
                          onClick={handleNextQuestion}
                          disabled={!currentQuestion?.player1_answer || !currentQuestion?.player2_answer}
                          className="romantic-button"
                        >
                          <SkipForward className="w-4 h-4 mr-2" /> Question suivante
                        </Button>
                      )}
                      
                      <Button onClick={handleResetGame} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" /> Réinitialiser
                      </Button>
                      
                      <Button onClick={handleDeleteGame} variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions List */}
                <Card className="romantic-card">
                  <CardHeader>
                    <CardTitle className="font-display">Questions de la partie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {gameQuestions.map((gq, index) => (
                        <div
                          key={gq.id}
                          className={`p-3 rounded-lg flex items-center gap-3 ${
                            index === game?.current_question_index 
                              ? 'bg-primary/10 border-2 border-primary' 
                              : gq.is_correct !== null
                              ? gq.is_correct ? 'bg-green-50' : 'bg-red-50'
                              : 'bg-muted'
                          }`}
                        >
                          <span className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="flex-1 font-body">{gq.questions?.text}</span>
                          {gq.is_correct !== null && (
                            gq.is_correct 
                              ? <Check className="w-5 h-5 text-green-500" />
                              : <X className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="romantic-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Ajouter une question</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ex: Qui ronfle le plus fort ?"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                  />
                  <Button onClick={handleAddQuestion} className="romantic-button">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="romantic-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl">
                  Toutes les questions ({questions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-4 rounded-lg flex items-center gap-4 ${
                        q.is_active ? 'bg-card border border-border' : 'bg-muted opacity-60'
                      }`}
                    >
                      {editingQuestion?.id === q.id ? (
                        <>
                          <Input
                            value={editingQuestion.text}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateQuestion(q.id, editingQuestion.text, q.is_active)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setEditingQuestion(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 font-body">{q.text}</span>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={q.is_active}
                              onCheckedChange={(checked) => handleUpdateQuestion(q.id, q.text, checked)}
                            />
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingQuestion({ id: q.id, text: q.text })}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card className="romantic-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-gold" />
                  Classement des couples
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground font-body py-8">
                    Aucune partie terminée pour le moment
                  </p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((g, index) => (
                      <div
                        key={g.id}
                        className={`flex items-center p-4 rounded-xl ${
                          index === 0 ? 'bg-gold/20' : 
                          index === 1 ? 'bg-muted' : 
                          index === 2 ? 'bg-orange-100' : 'bg-card border border-border'
                        }`}
                      >
                        <div className="w-10 text-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-lg text-foreground">
                            {g.player1_name} & {g.player2_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(g.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {g.score}/{g.total_questions}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((g.score / g.total_questions) * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
