import { Response } from 'express';
import { Test, IQuestion } from '../models/Test';
import { TestResult, IAnswerDetail, IScoreBreakdown } from '../models/TestResult';
import { AuthRequest } from '../types';

/**
 * 진단 테스트 목록 조회
 * GET /api/tests
 */
export const getTests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { testType, targetScore } = req.query;

    const query: Record<string, unknown> = { isActive: true };
    if (testType) query.testType = testType;
    if (targetScore) query.targetScore = Number(targetScore);

    const tests = await Test.find(query)
      .select('title description testType targetScore duration totalQuestions passingScore')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: { tests },
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: '테스트 목록 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 테스트 상세 조회 (문제 포함)
 * GET /api/tests/:id
 */
export const getTestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id);

    if (!test) {
      res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
      return;
    }

    // Remove correct answers and explanations for test-taking
    const sanitizedQuestions = test.questions.map((q) => ({
      _id: q._id,
      questionNumber: q.questionNumber,
      questionType: q.questionType,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
      audioUrl: q.audioUrl,
      imageUrl: q.imageUrl,
    }));

    res.status(200).json({
      success: true,
      data: {
        test: {
          _id: test._id,
          title: test.title,
          description: test.description,
          testType: test.testType,
          targetScore: test.targetScore,
          duration: test.duration,
          totalQuestions: test.totalQuestions,
          passingScore: test.passingScore,
          questions: sanitizedQuestions,
        },
      },
    });
  } catch (error) {
    console.error('Get test by ID error:', error);
    res.status(500).json({ error: '테스트 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 테스트 제출 및 채점
 * POST /api/tests/:id/submit
 */
export const submitTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { answers, timeSpent } = req.body;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: '답안을 제출해주세요.' });
      return;
    }

    const test = await Test.findById(id);

    if (!test) {
      res.status(404).json({ error: '테스트를 찾을 수 없습니다.' });
      return;
    }

    // Grade the test
    const answerDetails: IAnswerDetail[] = [];
    const scoreBreakdown: IScoreBreakdown = {
      grammar: { correct: 0, total: 0 },
      vocabulary: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
    };

    let correctAnswers = 0;

    test.questions.forEach((question: IQuestion) => {
      const userAnswer = answers.find(
        (a: { questionId: string; answer: number }) =>
          a.questionId === question._id.toString()
      );

      const selectedAnswer = userAnswer?.answer ?? -1;
      const isCorrect = selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        correctAnswers++;
      }

      // Update score breakdown
      const qType = question.questionType as keyof IScoreBreakdown;
      scoreBreakdown[qType].total++;
      if (isCorrect) {
        scoreBreakdown[qType].correct++;
      }

      answerDetails.push({
        questionId: question._id,
        questionNumber: question.questionNumber,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeSpent: userAnswer?.timeSpent,
      });
    });

    const totalQuestions = test.totalQuestions;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const score = correctAnswers;

    // Calculate estimated TEPS score (simplified formula)
    const estimatedScore = calculateEstimatedScore(percentage, test.targetScore);

    const isPassed = score >= test.passingScore;

    // Save result
    const testResult = await TestResult.create({
      userId,
      testId: id,
      answers: answerDetails,
      score,
      totalQuestions,
      correctAnswers,
      percentage,
      scoreBreakdown,
      estimatedScore,
      timeSpent: timeSpent || 0,
      isPassed,
      completedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        result: {
          _id: testResult._id,
          score,
          totalQuestions,
          correctAnswers,
          percentage,
          scoreBreakdown,
          estimatedScore,
          isPassed,
          timeSpent: testResult.timeSpent,
        },
      },
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: '테스트 제출 중 오류가 발생했습니다.' });
  }
};

/**
 * 테스트 결과 상세 조회
 * GET /api/test-results/:id
 */
export const getTestResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    const result = await TestResult.findById(id).populate('testId', 'title description targetScore');

    if (!result) {
      res.status(404).json({ error: '결과를 찾을 수 없습니다.' });
      return;
    }

    // Check ownership
    if (result.userId.toString() !== userId.toString()) {
      res.status(403).json({ error: '접근 권한이 없습니다.' });
      return;
    }

    // Get test with questions for detailed review
    const test = await Test.findById(result.testId);

    // Build detailed result with explanations
    const detailedAnswers = result.answers.map((answer) => {
      const question = test?.questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );

      return {
        questionId: answer.questionId,
        questionNumber: answer.questionNumber,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        questionText: question?.questionText,
        options: question?.options,
        explanation: question?.explanation,
        questionType: question?.questionType,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        result: {
          ...result.toObject(),
          answers: detailedAnswers,
        },
      },
    });
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({ error: '결과 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 내 테스트 결과 목록 조회
 * GET /api/test-results
 */
export const getMyTestResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: '인증이 필요합니다.' });
      return;
    }

    const results = await TestResult.find({ userId })
      .populate('testId', 'title testType targetScore')
      .sort('-completedAt')
      .select('score totalQuestions percentage estimatedScore isPassed completedAt timeSpent');

    res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error('Get my test results error:', error);
    res.status(500).json({ error: '결과 목록 조회 중 오류가 발생했습니다.' });
  }
};

/**
 * 추정 TEPS 점수 계산 (간소화된 공식)
 */
function calculateEstimatedScore(percentage: number, targetScore: number): number {
  // Simple estimation based on percentage and target score
  // This is a simplified formula - real TEPS scoring is more complex
  const baseScore = 200;
  const maxScore = 600;
  const range = maxScore - baseScore;

  // Weight the percentage based on target score level
  const weightedPercentage = percentage / 100;
  const estimatedScore = Math.round(baseScore + range * weightedPercentage * (targetScore / maxScore));

  return Math.min(Math.max(estimatedScore, 0), maxScore);
}

/**
 * 관리자: 테스트 생성
 * POST /api/tests
 */
export const createTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      testType,
      targetScore,
      duration,
      questions,
      passingScore,
    } = req.body;

    if (!title || !description || !questions || questions.length === 0) {
      res.status(400).json({ error: '필수 항목을 입력해주세요.' });
      return;
    }

    const test = await Test.create({
      title,
      description,
      testType: testType || 'diagnostic',
      targetScore,
      duration: duration || 30,
      questions,
      totalQuestions: questions.length,
      passingScore: passingScore || Math.ceil(questions.length * 0.6),
    });

    res.status(201).json({
      success: true,
      data: { test },
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: '테스트 생성 중 오류가 발생했습니다.' });
  }
};
