import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Game {
  id: string;
  player1_name: string;
  player2_name: string;
  status: 'waiting' | 'playing' | 'finished';
  current_question_index: number;
  total_questions: number;
  score: number;
  created_at: string;
  finished_at: string | null;
}

export interface GameQuestion {
  id: string;
  game_id: string;
  question_id: string;
  question_order: number;
  player1_answer: 'player1' | 'player2' | null;
  player2_answer: 'player1' | 'player2' | null;
  is_correct: boolean | null;
  answered_at: string | null;
  questions?: {
    text: string;
  };
}

export interface Question {
  id: string;
  text: string;
  is_active: boolean;
  created_at: string;
}

export function useGame(gameId?: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    fetchGame();
    fetchGameQuestions();

    // Subscribe to realtime updates
    const gameChannel = supabase
      .channel('game-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          setGame(payload.new as Game);
        }
      )
      .subscribe();

    const questionsChannel = supabase
      .channel('game-questions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_questions', filter: `game_id=eq.${gameId}` },
        () => {
          fetchGameQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(questionsChannel);
    };
  }, [gameId]);

  async function fetchGame() {
    if (!gameId) return;
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!error && data) {
      setGame(data as Game);
    }
    setLoading(false);
  }

  async function fetchGameQuestions() {
    if (!gameId) return;

    const { data, error } = await supabase
      .from('game_questions')
      .select('*, questions(text)')
      .eq('game_id', gameId)
      .order('question_order');

    if (!error && data) {
      setGameQuestions(data as GameQuestion[]);
    }
  }

  useEffect(() => {
    if (game && gameQuestions.length > 0) {
      const current = gameQuestions[game.current_question_index];
      setCurrentQuestion(current || null);
    }
  }, [game, gameQuestions]);

  return { game, gameQuestions, currentQuestion, loading, refetch: fetchGame };
}

export function useActiveGame() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveGame();

    const channel = supabase
      .channel('active-game-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        () => {
          fetchActiveGame();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchActiveGame() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setActiveGame(data as Game);
    } else {
      setActiveGame(null);
    }
    setLoading(false);
  }

  return { activeGame, loading, refetch: fetchActiveGame };
}

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at');

    if (!error && data) {
      setQuestions(data as Question[]);
    }
    setLoading(false);
  }

  async function addQuestion(text: string) {
    const { error } = await supabase
      .from('questions')
      .insert({ text });

    if (!error) {
      fetchQuestions();
    }
    return { error };
  }

  async function updateQuestion(id: string, text: string, is_active: boolean) {
    const { error } = await supabase
      .from('questions')
      .update({ text, is_active })
      .eq('id', id);

    if (!error) {
      fetchQuestions();
    }
    return { error };
  }

  async function deleteQuestion(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchQuestions();
    }
    return { error };
  }

  return { questions, loading, addQuestion, updateQuestion, deleteQuestion, refetch: fetchQuestions };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'finished')
      .eq('hidden_from_leaderboard', false)
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setLeaderboard(data as Game[]);
    }
    setLoading(false);
  }

  return { leaderboard, loading, refetch: fetchLeaderboard };
}
