import { supabase } from '@/integrations/supabase/client';

// Fisher-Yates shuffle algorithm for truly uniform random distribution
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function createGame(player1Name: string, player2Name: string, totalQuestions: number) {
  // First, get random active questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id')
    .eq('is_active', true);

  if (questionsError || !questions) {
    return { error: questionsError };
  }

  // Shuffle using Fisher-Yates for truly random distribution
  const shuffled = shuffleArray(questions);
  const selectedQuestions = shuffled.slice(0, Math.min(totalQuestions, questions.length));

  // Create the game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({
      player1_name: player1Name,
      player2_name: player2Name,
      total_questions: selectedQuestions.length,
      status: 'waiting',
    })
    .select()
    .single();

  if (gameError || !game) {
    return { error: gameError };
  }

  // Create game questions
  const gameQuestions = selectedQuestions.map((q, index) => ({
    game_id: game.id,
    question_id: q.id,
    question_order: index,
  }));

  const { error: insertError } = await supabase
    .from('game_questions')
    .insert(gameQuestions);

  if (insertError) {
    return { error: insertError };
  }

  return { data: game, error: null };
}

export async function startGame(gameId: string) {
  const { error } = await supabase
    .from('games')
    .update({ status: 'playing' })
    .eq('id', gameId);

  return { error };
}

export async function submitAnswer(
  gameQuestionId: string,
  playerNumber: 1 | 2,
  answer: 'player1' | 'player2'
) {
  const column = playerNumber === 1 ? 'player1_answer' : 'player2_answer';
  
  const { error } = await supabase
    .from('game_questions')
    .update({ [column]: answer })
    .eq('id', gameQuestionId);

  if (error) {
    return { error };
  }

  // Check if both players have answered
  const { data: question, error: fetchError } = await supabase
    .from('game_questions')
    .select('*, games(*)')
    .eq('id', gameQuestionId)
    .single();

  if (fetchError || !question) {
    return { error: fetchError };
  }

  // If both answered, calculate if correct and update score
  if (question.player1_answer && question.player2_answer) {
    const isCorrect = question.player1_answer === question.player2_answer;
    
    await supabase
      .from('game_questions')
      .update({ 
        is_correct: isCorrect,
        answered_at: new Date().toISOString()
      })
      .eq('id', gameQuestionId);

    if (isCorrect) {
      const game = question.games as { id: string; score: number };
      await supabase
        .from('games')
        .update({ score: game.score + 1 })
        .eq('id', game.id);
    }
  }

  return { error: null };
}

export async function nextQuestion(gameId: string, currentIndex: number, totalQuestions: number) {
  const nextIndex = currentIndex + 1;
  
  if (nextIndex >= totalQuestions) {
    // Game finished
    const { error } = await supabase
      .from('games')
      .update({ 
        status: 'finished',
        finished_at: new Date().toISOString()
      })
      .eq('id', gameId);
    
    return { error, finished: true };
  }

  const { error } = await supabase
    .from('games')
    .update({ current_question_index: nextIndex })
    .eq('id', gameId);

  return { error, finished: false };
}

export async function resetGame(gameId: string) {
  // Reset all game questions
  await supabase
    .from('game_questions')
    .update({ 
      player1_answer: null, 
      player2_answer: null, 
      is_correct: null,
      answered_at: null
    })
    .eq('game_id', gameId);

  // Reset game
  const { error } = await supabase
    .from('games')
    .update({ 
      status: 'waiting',
      current_question_index: 0,
      score: 0,
      finished_at: null
    })
    .eq('id', gameId);

  return { error };
}

export async function deleteGame(gameId: string) {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId);

  return { error };
}

export async function resetLeaderboard() {
  const { error } = await supabase
    .from('games')
    .update({ hidden_from_leaderboard: true })
    .eq('status', 'finished');

  return { error };
}
