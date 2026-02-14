import { useState, useRef, useEffect } from "react";
import { HeartBackground } from "@/components/HeartBackground";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame, useActiveGame, useQuestions, useLeaderboard } from "@/hooks/useGame";
import { createGame, startGame, nextQuestion, resetGame, deleteGame, resetLeaderboard } from "@/lib/gameActions";
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
  Pencil,
  RotateCcw,
  Image,
  Upload,
  Loader2,
  GripVertical,
  Filter,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { usePartnerLogosAdmin, PartnerLogo } from "@/hooks/usePartnerLogos";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLightingControl } from "@/hooks/useLightingControl";

interface SortableLogoItemProps {
  logo: PartnerLogo;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

function SortableLogoItem({ logo, onToggleActive, onDelete }: SortableLogoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: logo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-lg ${
        logo.is_active ? "bg-card border border-border" : "bg-muted opacity-60"
      }`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      <img src={logo.image_url} alt={logo.name} className="h-12 w-24 object-contain bg-white rounded" />
      <span className="flex-1 font-body">{logo.name}</span>
      <div className="flex items-center gap-2">
        <Switch checked={logo.is_active} onCheckedChange={(checked) => onToggleActive(logo.id, checked)} />
        <Button size="sm" variant="ghost" onClick={() => onDelete(logo.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("Général");
  const [editingQuestion, setEditingQuestion] = useState<{ id: string; text: string; category: string } | null>(null);
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>("all");
  const [newPartnerName, setNewPartnerName] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeGame, loading: loadingActive } = useActiveGame();
  const { game, currentQuestion, gameQuestions, loading } = useGame(activeGame?.id);
  const { questions, addQuestion, updateQuestion, deleteQuestion: removeQuestion } = useQuestions();
  const { leaderboard } = useLeaderboard();
  const { logos: partnerLogos, addLogo, deleteLogo, toggleActive, reorderLogos } = usePartnerLogosAdmin();
  const { sendSignal, isConnected: isLightingConnected } = useLightingControl();
  
  // Track previous is_correct value and question index to detect changes
  const prevIsCorrectRef = useRef<boolean | null | undefined>(undefined);
  const prevQuestionIndexRef = useRef<number | undefined>(undefined);
  
  // Send lighting signal when result is revealed
  useEffect(() => {
    // Detect question change and reset tracking
    if (game && prevQuestionIndexRef.current !== undefined && prevQuestionIndexRef.current !== game.current_question_index) {
      prevIsCorrectRef.current = undefined;
      prevQuestionIndexRef.current = game.current_question_index;
      return;
    }
    if (game) {
      prevQuestionIndexRef.current = game.current_question_index;
    }

    if (currentQuestion?.is_correct !== null && 
        currentQuestion?.is_correct !== undefined &&
        prevIsCorrectRef.current === null) {
      // Result just changed from null to a value - always send GREEN or RED
      if (currentQuestion.is_correct === true) {
        sendSignal('GREEN');
      } else {
        sendSignal('RED');
      }
    }
    prevIsCorrectRef.current = currentQuestion?.is_correct;
  }, [currentQuestion?.is_correct, sendSignal, game]);

  // Auto-finish game 5 seconds after last question result is revealed
  const autoFinishTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (
      game?.status === 'playing' &&
      game.current_question_index + 1 >= game.total_questions &&
      currentQuestion?.is_correct !== null &&
      currentQuestion?.is_correct !== undefined
    ) {
      console.log('🎭 Last question answered - auto-finishing in 2.5 seconds');
      autoFinishTimerRef.current = setTimeout(() => {
        // Send FINISH signal with score before transitioning
        const finalScore = game.score + (currentQuestion.is_correct ? 1 : 0);
        sendSignal('FINISH', { score: finalScore, total: game.total_questions });
        handleNextQuestion();
      }, 2500);
      return () => {
        if (autoFinishTimerRef.current) {
          clearTimeout(autoFinishTimerRef.current);
          autoFinishTimerRef.current = null;
        }
      };
    }
  }, [game?.status, game?.current_question_index, game?.total_questions, currentQuestion?.is_correct]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = partnerLogos.findIndex((logo) => logo.id === active.id);
      const newIndex = partnerLogos.findIndex((logo) => logo.id === over.id);
      const newOrder = arrayMove(partnerLogos, oldIndex, newIndex);
      reorderLogos(newOrder);
    }
  };

  const handleDeleteLogo = async (id: string) => {
    const { error } = await deleteLogo(id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    } else {
      toast({ title: "Supprimé", description: "Logo supprimé" });
    }
  };

  const handleCreateGame = async () => {
    if (!player1Name || !player2Name) {
      toast({ title: "Erreur", description: "Veuillez entrer les deux prénoms", variant: "destructive" });
      return;
    }

    const { error, data } = await createGame(player1Name, player2Name, totalQuestions, selectedCategories.length > 0 ? selectedCategories : undefined);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de créer la partie", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Partie créée !" });
      setPlayer1Name("");
      setPlayer2Name("");
    }
  };

  const handleStartGame = async () => {
    if (!game) return;
    const { error } = await startGame(game.id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de démarrer", variant: "destructive" });
    } else {
      toast({ title: "C'est parti !", description: "La partie a commencé" });
    }
  };

  const handleNextQuestion = async () => {
    if (!game) return;
    
    const isLastQuestion = game.current_question_index + 1 >= game.total_questions;
    
    console.log('🎭 handleNextQuestion called', {
      currentIndex: game.current_question_index,
      totalQuestions: game.total_questions,
      isLastQuestion,
      wsConnected: isLightingConnected
    });
    
    const { error, finished } = await nextQuestion(game.id, game.current_question_index, game.total_questions);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de passer à la question suivante", variant: "destructive" });
    } else if (finished) {
      toast({ title: "Terminé !", description: "La partie est terminée" });
    }
  };

  const handleResetGame = async () => {
    if (!game) return;
    const { error } = await resetGame(game.id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de réinitialiser", variant: "destructive" });
    } else {
      toast({ title: "Réinitialisé", description: "La partie a été réinitialisée" });
    }
  };

  const handleDeleteGame = async () => {
    if (!game) return;
    const { error } = await deleteGame(game.id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    } else {
      toast({ title: "Supprimé", description: "La partie a été supprimée" });
    }
  };

  const handleResetLeaderboard = async () => {
    const { error } = await resetLeaderboard();
    if (error) {
      toast({ title: "Erreur", description: "Impossible de réinitialiser le classement", variant: "destructive" });
    } else {
      toast({ title: "Classement réinitialisé", description: "Nouvelle soirée ! Le classement a été vidé." });
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    const { error } = await addQuestion(newQuestion, newQuestionCategory);
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'ajouter la question", variant: "destructive" });
    } else {
      setNewQuestion("");
      toast({ title: "Ajouté", description: "Question ajoutée" });
    }
  };

  // Get unique categories from questions
  const categories = [...new Set(questions.map(q => q.category))].sort();

  const handleUpdateQuestion = async (id: string, text: string, isActive: boolean) => {
    const { error } = await updateQuestion(id, text, isActive);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de modifier la question", variant: "destructive" });
    } else {
      setEditingQuestion(null);
      toast({ title: "Modifié", description: "Question modifiée" });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const { error } = await removeQuestion(id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer la question", variant: "destructive" });
    } else {
      toast({ title: "Supprimé", description: "Question supprimée" });
    }
  };

  return (
    <div className="min-h-screen bg-blush">
      <HeartBackground />

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            {/* Lighting Control */}
            <div className="flex items-center gap-2" title={isLightingConnected ? "Companion lumières connecté" : "Companion lumières déconnecté"}>
              <span className={`w-2 h-2 rounded-full ${isLightingConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-xs text-muted-foreground">Lumières</span>
              {isLightingConnected && (
                <div className="flex items-center gap-1 ml-2">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => sendSignal('GREEN')}>V</Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => sendSignal('RED')}>R</Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => sendSignal('FINISH')}>F</Button>
                </div>
              )}
            </div>
            <p className="font-body text-muted-foreground">Interface Admin</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <Tabs defaultValue="game" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="game" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Partie
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> Questions
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Classement
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Image className="w-4 h-4" /> Partenaires
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
                      <label className="text-sm font-body text-muted-foreground mb-2 block">Prénom Joueur 1</label>
                      <Input
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        placeholder="Ex: David"
                        className="text-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-body text-muted-foreground mb-2 block">Prénom Joueur 2</label>
                      <Input
                        value={player2Name}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        placeholder="Ex: Julie"
                        className="text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body text-muted-foreground mb-2 block">Catégories (optionnel)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button
                        onClick={() => {
                          if (selectedCategories.length === categories.length) {
                            setSelectedCategories([]);
                          } else {
                            setSelectedCategories([...categories]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors font-medium ${
                          selectedCategories.length === categories.length
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        }`}
                      >
                        {selectedCategories.length === categories.length ? "Tout désélectionner" : "Tout sélectionner"}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            if (selectedCategories.includes(cat)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat));
                            } else {
                              setSelectedCategories([...selectedCategories, cat]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedCategories.includes(cat)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedCategories.length === 0 ? "Toutes les catégories" : `${selectedCategories.length} catégorie(s) sélectionnée(s)`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-body text-muted-foreground mb-2 block">Nombre de questions</label>
                    <Input
                      type="number"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      min={1}
                      max={
                        selectedCategories.length > 0
                          ? questions.filter((q) => q.is_active && selectedCategories.includes(q.category)).length
                          : questions.filter((q) => q.is_active).length
                      }
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedCategories.length > 0
                        ? questions.filter((q) => q.is_active && selectedCategories.includes(q.category)).length
                        : questions.filter((q) => q.is_active).length} questions actives disponibles
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
                      <span>
                        {game?.player1_name} & {game?.player2_name}
                      </span>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          game?.status === "waiting"
                            ? "bg-yellow-100 text-yellow-700"
                            : game?.status === "playing"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {game?.status === "waiting"
                          ? "En attente"
                          : game?.status === "playing"
                            ? "En cours"
                            : "Terminé"}
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
                          <span
                            className={`px-2 py-1 rounded text-sm ${currentQuestion?.player1_answer ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {game?.player1_name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-sm ${currentQuestion?.player2_answer ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {game?.player2_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Current Question */}
                    {currentQuestion && (
                      <div className="p-4 bg-card border border-border rounded-lg mb-6">
                        <p className="text-sm text-muted-foreground font-body mb-2">Question actuelle :</p>
                        <p className="text-xl font-display text-foreground">{currentQuestion.questions?.text}</p>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-wrap gap-3">
                      {game?.status === "waiting" && (
                        <Button onClick={handleStartGame} className="romantic-button">
                          <Play className="w-4 h-4 mr-2" /> Démarrer
                        </Button>
                      )}

                      {game?.status === "playing" && (
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
                              ? "bg-primary/10 border-2 border-primary"
                              : gq.is_correct !== null
                                ? gq.is_correct
                                  ? "bg-green-50"
                                  : "bg-red-50"
                                : "bg-muted"
                          }`}
                        >
                          <span className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="flex-1 font-body">{gq.questions?.text}</span>
                          {gq.is_correct !== null &&
                            (gq.is_correct ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            ))}
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
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ex: Qui ronfle le plus fort ?"
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
                  />
                  <select
                    value={newQuestionCategory}
                    onChange={(e) => setNewQuestionCategory(e.target.value)}
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    ) : (
                      <option value="Général">Général</option>
                    )}
                  </select>
                  <Button onClick={handleAddQuestion} className="romantic-button">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="romantic-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-2xl">Toutes les questions ({questions.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={questionCategoryFilter}
                    onChange={(e) => setQuestionCategoryFilter(e.target.value)}
                    className="px-3 py-1 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions
                    .filter(q => questionCategoryFilter === "all" || q.category === questionCategoryFilter)
                    .map((q) => (
                    <div
                      key={q.id}
                      className={`p-4 rounded-lg flex items-center gap-4 ${
                        q.is_active ? "bg-card border border-border" : "bg-muted opacity-60"
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
                          <Button size="sm" variant="ghost" onClick={() => setEditingQuestion(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium">{q.category}</span>
                          <span className="flex-1 font-body">{q.text}</span>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={q.is_active}
                              onCheckedChange={(checked) => handleUpdateQuestion(q.id, q.text, checked)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingQuestion({ id: q.id, text: q.text, category: q.category })}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(q.id)}>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-2xl flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-gold" />
                    Classement des couples
                  </CardTitle>
                  <Button onClick={handleResetLeaderboard} variant="destructive" className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Nouvelle session
                  </Button>
                </div>
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
                          index === 0
                            ? "bg-gold/20"
                            : index === 1
                              ? "bg-muted"
                              : index === 2
                                ? "bg-orange-100"
                                : "bg-card border border-border"
                        }`}
                      >
                        <div className="w-10 text-center font-bold text-lg">{index + 1}</div>
                        <div className="flex-1">
                          <p className="font-display text-lg text-foreground">
                            {g.player1_name} & {g.player2_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(g.created_at).toLocaleDateString("fr-FR")}
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

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6">
            <Card className="romantic-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                  <Image className="w-6 h-6 text-primary" />
                  Ajouter un logo partenaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    placeholder="Nom du partenaire"
                    className="flex-1"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !newPartnerName.trim()) {
                        toast({
                          title: "Erreur",
                          description: "Veuillez entrer un nom et sélectionner une image",
                          variant: "destructive",
                        });
                        return;
                      }

                      setUploadingLogo(true);
                      try {
                        const fileName = `${Date.now()}-${file.name}`;
                        const { error: uploadError } = await supabase.storage
                          .from("partner-logos")
                          .upload(fileName, file);

                        if (uploadError) throw uploadError;

                        const {
                          data: { publicUrl },
                        } = supabase.storage.from("partner-logos").getPublicUrl(fileName);

                        const { error } = await addLogo(newPartnerName, publicUrl);
                        if (error) throw error;

                        setNewPartnerName("");
                        toast({ title: "Succès", description: "Logo ajouté !" });
                      } catch (error) {
                        toast({ title: "Erreur", description: "Impossible d'ajouter le logo", variant: "destructive" });
                      } finally {
                        setUploadingLogo(false);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }
                    }}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!newPartnerName.trim() || uploadingLogo}
                    className="romantic-button"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {uploadingLogo ? "Envoi..." : "Choisir image"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="romantic-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Logos partenaires ({partnerLogos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {partnerLogos.length === 0 ? (
                  <p className="text-center text-muted-foreground font-body py-8">
                    Aucun logo partenaire pour le moment
                  </p>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={partnerLogos.map((logo) => logo.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {partnerLogos.map((logo) => (
                          <SortableLogoItem
                            key={logo.id}
                            logo={logo}
                            onToggleActive={toggleActive}
                            onDelete={handleDeleteLogo}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
