import { supabase } from '../lib/supabase';
import type { Course, Enrollment, InsertTables, UpdateTables } from '../types/supabase';

export interface CourseFilters {
  targetScore?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive';
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const courseService = {
  // Get all published courses with filters
  async getCourses(filters: CourseFilters = {}) {
    const { page = 1, limit = 12 } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.targetScore) {
      query = query.eq('target_score', filters.targetScore);
    }
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      courses: data as Course[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // Get featured courses
  async getFeaturedCourses(limit = 6) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Course[];
  },

  // Get course by ID
  async getCourseById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Course;
  },

  // Check if user is enrolled
  async isEnrolled(courseId: string, userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.status === 'active' || data?.status === 'completed';
  },

  // Get user's enrollments
  async getMyEnrollments(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Enroll in a course
  async enroll(courseId: string, userId: string, paymentId?: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        payment_id: paymentId,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment enrolled count
    await supabase.rpc('increment_enrolled_count', { course_id: courseId });

    return data as Enrollment;
  },

  // Update lesson progress
  async updateProgress(
    enrollmentId: string,
    lessonId: string,
    completed: boolean,
    watchDuration: number
  ) {
    // Get current enrollment
    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('progress, course:courses(lessons_count)')
      .eq('id', enrollmentId)
      .single();

    if (fetchError) throw fetchError;

    const progress = (enrollment.progress as any[]) || [];
    const existingIndex = progress.findIndex((p) => p.lessonId === lessonId);

    const lessonProgress = {
      lessonId,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      lastWatchedAt: new Date().toISOString(),
      watchDuration,
    };

    if (existingIndex >= 0) {
      progress[existingIndex] = {
        ...progress[existingIndex],
        ...lessonProgress,
        watchDuration: (progress[existingIndex].watchDuration || 0) + watchDuration,
      };
    } else {
      progress.push(lessonProgress);
    }

    const totalLessons = (enrollment.course as any)?.lessons_count || 1;
    const completedLessons = progress.filter((p) => p.completed).length;
    const completionPercentage = Math.round((completedLessons / totalLessons) * 100);

    const { data, error } = await supabase
      .from('enrollments')
      .update({
        progress,
        completion_percentage: completionPercentage,
        last_accessed_at: new Date().toISOString(),
        status: completionPercentage === 100 ? 'completed' : 'active',
      })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) throw error;
    return data as Enrollment;
  },
};

export default courseService;
