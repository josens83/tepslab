import { supabase } from '../lib/supabase';
import type { TepsQuestion, TepsExamAttempt } from '../types/supabase';

export interface ExamFilters {
  section?: 'listening' | 'vocabulary' | 'grammar' | 'reading';
  difficulty?: number;
  limit?: number;
}

export interface UserAnswer {
  questionId: string;
  section: 'listening' | 'vocabulary' | 'grammar' | 'reading';
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  timeSpent: number;
  isCorrect?: boolean;
  markedForReview: boolean;
  answeredAt: string;
}

export const examService = {
  // Get questions for practice
  async getQuestions(filters: ExamFilters = {}) {
    const { section, difficulty, limit = 20 } = filters;

    let query = supabase
      .from('teps_questions')
      .select('*')
      .eq('review_status', 'approved')
      .limit(limit);

    if (section) {
      query = query.eq('section', section);
    }
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as TepsQuestion[];
  },

  // Get a specific question
  async getQuestionById(id: string) {
    const { data, error } = await supabase
      .from('teps_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as TepsQuestion;
  },

  // Create a new exam attempt
  async createExamAttempt(
    userId: string,
    examConfigId: string,
    examType: TepsExamAttempt['exam_type'],
    difficulty: TepsExamAttempt['difficulty']
  ) {
    const { data, error } = await supabase
      .from('teps_exam_attempts')
      .insert({
        user_id: userId,
        exam_config_id: examConfigId,
        exam_type: examType,
        difficulty,
        status: 'not_started',
        device_type: 'desktop',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as TepsExamAttempt;
  },

  // Start an exam
  async startExam(attemptId: string) {
    const { data, error } = await supabase
      .from('teps_exam_attempts')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_section: 'listening',
        current_question_index: 0,
      } as never)
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return data as TepsExamAttempt;
  },

  // Submit an answer
  async submitAnswer(
    attemptId: string,
    answer: Omit<UserAnswer, 'isCorrect' | 'answeredAt'>
  ) {
    // Get question to check answer
    const { data: question, error: questionError } = await supabase
      .from('teps_questions')
      .select('correct_answer')
      .eq('id', answer.questionId)
      .single();

    if (questionError) throw questionError;
    if (!question) throw new Error('Question not found');

    const isCorrect = answer.selectedAnswer === question.correct_answer;

    // Get current attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('teps_exam_attempts')
      .select('answers')
      .eq('id', attemptId)
      .single();

    if (attemptError) throw attemptError;
    if (!attempt) throw new Error('Attempt not found');

    const answers = (attempt.answers as UserAnswer[]) || [];
    const userAnswer: UserAnswer = {
      ...answer,
      isCorrect,
      answeredAt: new Date().toISOString(),
    };

    const existingIndex = answers.findIndex((a) => a.questionId === answer.questionId);
    if (existingIndex >= 0) {
      answers[existingIndex] = userAnswer;
    } else {
      answers.push(userAnswer);
    }

    const { data, error } = await supabase
      .from('teps_exam_attempts')
      .update({
        answers,
        current_question_index: answers.length,
      } as never)
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return { attempt: data as TepsExamAttempt, isCorrect };
  },

  // Complete exam and calculate result
  async completeExam(attemptId: string) {
    const { data: attempt, error: fetchError } = await supabase
      .from('teps_exam_attempts')
      .select('*, exam_config:teps_exam_configs(*)')
      .eq('id', attemptId)
      .single();

    if (fetchError) throw fetchError;
    if (!attempt) throw new Error('Attempt not found');

    const answers = (attempt.answers as UserAnswer[]) || [];
    const sections = ['listening', 'vocabulary', 'grammar', 'reading'];

    const sectionResults = sections.map((section) => {
      const sectionAnswers = answers.filter((a) => a.section === section);
      const correctAnswers = sectionAnswers.filter((a) => a.isCorrect).length;
      const totalQuestions = sectionAnswers.length || 1;
      const accuracy = (correctAnswers / totalQuestions) * 100;
      const timeSpent = sectionAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
      const score = Math.round((correctAnswers / totalQuestions) * 150);

      return {
        section,
        correctAnswers,
        totalQuestions,
        accuracy,
        timeSpent,
        score,
      };
    });

    const totalScore = sectionResults.reduce((sum, sr) => sum + sr.score, 0);
    const totalTimeSpent = answers.reduce((sum, a) => sum + a.timeSpent, 0);

    let estimatedLevel = '';
    if (totalScore < 200) estimatedLevel = 'A1-A2 (Elementary)';
    else if (totalScore < 300) estimatedLevel = 'A2-B1 (Pre-Intermediate)';
    else if (totalScore < 400) estimatedLevel = 'B1-B2 (Intermediate)';
    else if (totalScore < 500) estimatedLevel = 'B2-C1 (Upper Intermediate)';
    else estimatedLevel = 'C1-C2 (Advanced)';

    const result = {
      totalScore,
      percentile: 50,
      estimatedLevel,
      sectionResults,
      totalTimeSpent,
      averageTimePerQuestion: answers.length > 0 ? totalTimeSpent / answers.length : 0,
      strengths: sectionResults
        .filter((sr) => sr.accuracy >= 80)
        .map((sr) => `Strong in ${sr.section} (${sr.accuracy.toFixed(1)}%)`),
      weaknesses: sectionResults
        .filter((sr) => sr.accuracy < 60)
        .map((sr) => `Needs improvement in ${sr.section} (${sr.accuracy.toFixed(1)}%)`),
    };

    const { data, error } = await supabase
      .from('teps_exam_attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        result,
      } as never)
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return data as TepsExamAttempt;
  },

  // Get user's exam history
  async getExamHistory(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('teps_exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as TepsExamAttempt[];
  },

  // Get user's best score
  async getBestScore(userId: string) {
    const { data, error } = await supabase
      .from('teps_exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return null;

    let bestScore = 0;
    let bestAttempt = null;

    for (const attempt of data) {
      const result = attempt.result as any;
      if (result?.totalScore > bestScore) {
        bestScore = result.totalScore;
        bestAttempt = attempt;
      }
    }

    return bestAttempt as TepsExamAttempt | null;
  },
};

export default examService;
