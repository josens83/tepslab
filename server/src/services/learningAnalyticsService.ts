import { getOpenAIClient } from '../config/openai';

interface LearningSession {
  userId: string;
  courseId: string;
  lessonId: string;
  duration: number; // in seconds
  completedAt: Date;
  score?: number;
}

interface StudyPattern {
  preferredTimeOfDay: string;
  averageSessionDuration: number;
  mostActiveDay: string;
  studyStreak: number;
  totalStudyTime: number;
}

interface RecommendedCourse {
  courseId: string;
  title: string;
  reason: string;
  matchScore: number;
}

/**
 * Learning Analytics Service
 * Analyzes student learning patterns and provides personalized recommendations
 */
export class LearningAnalyticsService {
  /**
   * Analyze study patterns
   */
  async analyzeStudyPatterns(sessions: LearningSession[]): Promise<StudyPattern> {
    if (sessions.length === 0) {
      return {
        preferredTimeOfDay: 'unknown',
        averageSessionDuration: 0,
        mostActiveDay: 'unknown',
        studyStreak: 0,
        totalStudyTime: 0,
      };
    }

    // Calculate total study time
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0);

    // Calculate average session duration
    const averageSessionDuration = totalStudyTime / sessions.length;

    // Find preferred time of day
    const timeDistribution = sessions.reduce((acc, session) => {
      const hour = new Date(session.completedAt).getHours();
      let timeOfDay: string;

      if (hour >= 5 && hour < 12) timeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredTimeOfDay = Object.entries(timeDistribution).sort((a, b) => b[1] - a[1])[0][0];

    // Find most active day
    const dayDistribution = sessions.reduce((acc, session) => {
      const day = new Date(session.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveDay = Object.entries(dayDistribution).sort((a, b) => b[1] - a[1])[0][0];

    // Calculate study streak
    const sortedSessions = sessions
      .map((s) => new Date(s.completedAt))
      .sort((a, b) => b.getTime() - a.getTime());

    let studyStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const sessionDate of sortedSessions) {
      const sessionDay = new Date(sessionDate);
      sessionDay.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === studyStreak || dayDiff === studyStreak + 1) {
        studyStreak = dayDiff + 1;
      } else {
        break;
      }
    }

    return {
      preferredTimeOfDay,
      averageSessionDuration,
      mostActiveDay,
      studyStreak,
      totalStudyTime,
    };
  }

  /**
   * Generate personalized study recommendations
   */
  async generateRecommendations(
    userId: string,
    studyPattern: StudyPattern,
    recentScores: Array<{ category: string; score: number }>,
    completedCourses: string[]
  ): Promise<string> {
    const openai = getOpenAIClient();

    if (!openai) {
      return 'AI recommendations are not available at the moment.';
    }

    const prompt = `Analyze this student's learning data and provide personalized recommendations:

Study Pattern:
- Preferred study time: ${studyPattern.preferredTimeOfDay}
- Average session: ${Math.round(studyPattern.averageSessionDuration / 60)} minutes
- Most active day: ${studyPattern.mostActiveDay}
- Current streak: ${studyPattern.studyStreak} days
- Total study time: ${Math.round(studyPattern.totalStudyTime / 3600)} hours

Recent Performance:
${recentScores.map((s) => `- ${s.category}: ${s.score}%`).join('\n')}

Completed Courses: ${completedCourses.length}

Provide:
1. Study habit assessment
2. Optimal study schedule recommendation
3. Focus areas for improvement
4. Motivation tips to maintain streak
5. Next steps for TEPS preparation

Answer in Korean with actionable advice.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a TEPS learning analytics expert who provides personalized study recommendations.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return response.choices[0]?.message?.content || 'No recommendations available.';
    } catch (error) {
      console.error('Generate recommendations error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Recommend courses based on learning history
   */
  async recommendCourses(
    weakCategories: string[],
    targetScore: number,
    completedCourses: string[],
    availableCourses: Array<{
      id: string;
      title: string;
      category: string;
      level: string;
      targetScore: number;
    }>
  ): Promise<RecommendedCourse[]> {
    const openai = getOpenAIClient();

    if (!openai) {
      // Fallback to simple rule-based recommendation
      return availableCourses
        .filter(
          (course) =>
            !completedCourses.includes(course.id) &&
            weakCategories.includes(course.category) &&
            course.targetScore <= targetScore + 50
        )
        .slice(0, 5)
        .map((course) => ({
          courseId: course.id,
          title: course.title,
          reason: `Recommended based on weak area: ${course.category}`,
          matchScore: 0.8,
        }));
    }

    const prompt = `Recommend TEPS courses for a student with:
- Weak categories: ${weakCategories.join(', ')}
- Target score: ${targetScore}
- Already completed: ${completedCourses.length} courses

Available courses:
${availableCourses
  .filter((c) => !completedCourses.includes(c.id))
  .map((c) => `- ${c.title} (${c.category}, Level: ${c.level}, Target: ${c.targetScore})`)
  .join('\n')}

Recommend top 5 courses with reasons. Format as JSON:
{
  "recommendations": [
    {
      "courseId": "...",
      "reason": "...",
      "matchScore": 0.95
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a TEPS course recommendation expert.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{"recommendations": []}';
      const parsed = JSON.parse(content);

      return parsed.recommendations.map((rec: any) => ({
        courseId: rec.courseId,
        title:
          availableCourses.find((c) => c.id === rec.courseId)?.title ||
          'Course title not found',
        reason: rec.reason,
        matchScore: rec.matchScore,
      }));
    } catch (error) {
      console.error('Course recommendation error:', error);
      throw new Error('Failed to recommend courses');
    }
  }

  /**
   * Predict time to reach target score
   */
  async predictTimeToTarget(
    currentScore: number,
    targetScore: number,
    studyPattern: StudyPattern,
    recentProgress: Array<{ date: Date; score: number }>
  ): Promise<{
    estimatedDays: number;
    confidence: number;
    recommendation: string;
  }> {
    // Calculate average progress rate
    if (recentProgress.length < 2) {
      return {
        estimatedDays: -1,
        confidence: 0,
        recommendation: 'Need more data to make prediction. Keep studying!',
      };
    }

    const sortedProgress = recentProgress.sort((a, b) => a.date.getTime() - b.date.getTime());

    const firstScore = sortedProgress[0].score;
    const lastScore = sortedProgress[sortedProgress.length - 1].score;
    const daysPassed = Math.ceil(
      (sortedProgress[sortedProgress.length - 1].date.getTime() -
        sortedProgress[0].date.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const progressRate = (lastScore - firstScore) / daysPassed; // points per day

    if (progressRate <= 0) {
      return {
        estimatedDays: -1,
        confidence: 0.3,
        recommendation: 'Your scores have not been improving. Consider changing study methods.',
      };
    }

    const pointsNeeded = targetScore - currentScore;
    const estimatedDays = Math.ceil(pointsNeeded / progressRate);

    // Calculate confidence based on consistency
    const variance =
      recentProgress.reduce((sum, p, i) => {
        if (i === 0) return 0;
        const expectedScore = firstScore + progressRate * (i + 1);
        return sum + Math.pow(p.score - expectedScore, 2);
      }, 0) / recentProgress.length;

    const confidence = Math.max(0.3, Math.min(0.95, 1 / (1 + variance / 100)));

    let recommendation = '';
    if (estimatedDays < 30) {
      recommendation = 'Great progress! Keep up the good work.';
    } else if (estimatedDays < 90) {
      recommendation = 'Steady progress. Consider increasing study time or intensity.';
    } else {
      recommendation =
        'This will take some time. Focus on your weak areas and consider getting personalized tutoring.';
    }

    return {
      estimatedDays,
      confidence,
      recommendation,
    };
  }
}

export const learningAnalyticsService = new LearningAnalyticsService();
