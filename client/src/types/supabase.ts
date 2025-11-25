export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          birth_date: string | null
          target_score: number | null
          current_level: 'beginner' | 'intermediate' | 'advanced' | null
          provider: 'local' | 'kakao' | 'naver' | 'google' | 'facebook' | 'github' | 'apple'
          provider_id: string | null
          role: 'student' | 'instructor' | 'admin'
          is_email_verified: boolean
          two_factor_enabled: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          birth_date?: string | null
          target_score?: number | null
          current_level?: 'beginner' | 'intermediate' | 'advanced' | null
          provider?: 'local' | 'kakao' | 'naver' | 'google' | 'facebook' | 'github' | 'apple'
          provider_id?: string | null
          role?: 'student' | 'instructor' | 'admin'
          is_email_verified?: boolean
          two_factor_enabled?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          birth_date?: string | null
          target_score?: number | null
          current_level?: 'beginner' | 'intermediate' | 'advanced' | null
          provider?: 'local' | 'kakao' | 'naver' | 'google' | 'facebook' | 'github' | 'apple'
          provider_id?: string | null
          role?: 'student' | 'instructor' | 'admin'
          is_email_verified?: boolean
          two_factor_enabled?: boolean
          avatar_url?: string | null
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          instructor_id: string | null
          instructor_name: string
          thumbnail_url: string | null
          target_score: number
          level: 'beginner' | 'intermediate' | 'advanced'
          category: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive'
          price: number
          discount_price: number | null
          duration: number
          lessons: Json
          lessons_count: number
          features: string[]
          curriculum: string[]
          requirements: string[]
          is_published: boolean
          is_featured: boolean
          enrolled_count: number
          rating: number
          reviews_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          instructor_id?: string | null
          instructor_name: string
          thumbnail_url?: string | null
          target_score: number
          level: 'beginner' | 'intermediate' | 'advanced'
          category: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive'
          price: number
          discount_price?: number | null
          duration: number
          lessons?: Json
          lessons_count?: number
          features?: string[]
          curriculum?: string[]
          requirements?: string[]
          is_published?: boolean
          is_featured?: boolean
          enrolled_count?: number
          rating?: number
          reviews_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          instructor_id?: string | null
          instructor_name?: string
          thumbnail_url?: string | null
          target_score?: number
          level?: 'beginner' | 'intermediate' | 'advanced'
          category?: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive'
          price?: number
          discount_price?: number | null
          duration?: number
          lessons?: Json
          lessons_count?: number
          features?: string[]
          curriculum?: string[]
          requirements?: string[]
          is_published?: boolean
          is_featured?: boolean
          enrolled_count?: number
          rating?: number
          reviews_count?: number
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          expires_at: string | null
          status: 'active' | 'completed' | 'expired' | 'cancelled'
          progress: Json
          completion_percentage: number
          last_accessed_at: string
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          expires_at?: string | null
          status?: 'active' | 'completed' | 'expired' | 'cancelled'
          progress?: Json
          completion_percentage?: number
          last_accessed_at?: string
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          course_id?: string
          enrolled_at?: string
          expires_at?: string | null
          status?: 'active' | 'completed' | 'expired' | 'cancelled'
          progress?: Json
          completion_percentage?: number
          last_accessed_at?: string
          payment_id?: string | null
          updated_at?: string
        }
      }
      teps_questions: {
        Row: {
          id: string
          question_type: string
          section: 'listening' | 'vocabulary' | 'grammar' | 'reading'
          difficulty_level: number
          question_text: string
          options: Json
          correct_answer: string
          audio_resource: Json | null
          reading_passage: Json | null
          image_url: string | null
          explanation: string
          key_points: string[]
          related_concepts: string[]
          tips: string[]
          topic: string
          subtopic: string | null
          tags: string[]
          keywords: string[]
          is_official_question: boolean
          exam_year: number | null
          exam_month: number | null
          statistics: Json
          review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
          quality_score: number
          is_ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_type: string
          section: 'listening' | 'vocabulary' | 'grammar' | 'reading'
          difficulty_level: number
          question_text: string
          options: Json
          correct_answer: string
          audio_resource?: Json | null
          reading_passage?: Json | null
          image_url?: string | null
          explanation: string
          key_points?: string[]
          related_concepts?: string[]
          tips?: string[]
          topic: string
          subtopic?: string | null
          tags?: string[]
          keywords?: string[]
          is_official_question?: boolean
          exam_year?: number | null
          exam_month?: number | null
          statistics?: Json
          review_status?: 'pending' | 'approved' | 'rejected' | 'needs_revision'
          quality_score?: number
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          question_type?: string
          section?: 'listening' | 'vocabulary' | 'grammar' | 'reading'
          difficulty_level?: number
          question_text?: string
          options?: Json
          correct_answer?: string
          audio_resource?: Json | null
          reading_passage?: Json | null
          image_url?: string | null
          explanation?: string
          key_points?: string[]
          related_concepts?: string[]
          tips?: string[]
          topic?: string
          subtopic?: string | null
          tags?: string[]
          keywords?: string[]
          is_official_question?: boolean
          statistics?: Json
          review_status?: 'pending' | 'approved' | 'rejected' | 'needs_revision'
          quality_score?: number
          updated_at?: string
        }
      }
      teps_exam_attempts: {
        Row: {
          id: string
          user_id: string
          exam_config_id: string
          exam_type: 'official_simulation' | 'section_practice' | 'micro_learning' | 'adaptive_test' | 'mock_test'
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'adaptive'
          status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned' | 'expired'
          started_at: string | null
          completed_at: string | null
          paused_at: string | null
          total_paused_time: number
          expires_at: string | null
          answers: Json
          current_question_index: number
          current_section: 'listening' | 'vocabulary' | 'grammar' | 'reading' | null
          result: Json | null
          device_type: string
          tab_switches: number
          fullscreen_exits: number
          suspicious_activity: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exam_config_id: string
          exam_type: 'official_simulation' | 'section_practice' | 'micro_learning' | 'adaptive_test' | 'mock_test'
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'adaptive'
          status?: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned' | 'expired'
          started_at?: string | null
          completed_at?: string | null
          answers?: Json
          current_question_index?: number
          current_section?: 'listening' | 'vocabulary' | 'grammar' | 'reading' | null
          result?: Json | null
          device_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned' | 'expired'
          started_at?: string | null
          completed_at?: string | null
          paused_at?: string | null
          total_paused_time?: number
          answers?: Json
          current_question_index?: number
          current_section?: 'listening' | 'vocabulary' | 'grammar' | 'reading' | null
          result?: Json | null
          tab_switches?: number
          fullscreen_exits?: number
          suspicious_activity?: boolean
          updated_at?: string
        }
      }
      user_levels: {
        Row: {
          id: string
          user_id: string
          level: number
          current_xp: number
          total_xp: number
          coins: number
          streak_days: number
          last_activity_date: string | null
          achievements: Json
          badges: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level?: number
          current_xp?: number
          total_xp?: number
          coins?: number
          streak_days?: number
          last_activity_date?: string | null
          achievements?: Json
          badges?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          level?: number
          current_xp?: number
          total_xp?: number
          coins?: number
          streak_days?: number
          last_activity_date?: string | null
          achievements?: Json
          badges?: Json
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          author_id: string
          title: string
          content: string
          category: string
          tags: string[]
          views_count: number
          upvotes: string[]
          downvotes: string[]
          is_pinned: boolean
          is_locked: boolean
          is_answered: boolean
          accepted_answer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          content: string
          category: string
          tags?: string[]
          views_count?: number
          upvotes?: string[]
          downvotes?: string[]
          is_pinned?: boolean
          is_locked?: boolean
          is_answered?: boolean
          accepted_answer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          category?: string
          tags?: string[]
          views_count?: number
          upvotes?: string[]
          downvotes?: string[]
          is_pinned?: boolean
          is_locked?: boolean
          is_answered?: boolean
          accepted_answer_id?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'instructor' | 'admin'
      user_level: 'beginner' | 'intermediate' | 'advanced'
      auth_provider: 'local' | 'kakao' | 'naver' | 'google' | 'facebook' | 'github' | 'apple'
      course_level: 'beginner' | 'intermediate' | 'advanced'
      course_category: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'comprehensive'
      enrollment_status: 'active' | 'completed' | 'expired' | 'cancelled'
      teps_section: 'listening' | 'vocabulary' | 'grammar' | 'reading'
      exam_type: 'official_simulation' | 'section_practice' | 'micro_learning' | 'adaptive_test' | 'mock_test'
      exam_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'adaptive'
      exam_status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned' | 'expired'
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenience types
export type Profile = Tables<'profiles'>
export type Course = Tables<'courses'>
export type Enrollment = Tables<'enrollments'>
export type TepsQuestion = Tables<'teps_questions'>
export type TepsExamAttempt = Tables<'teps_exam_attempts'>
export type UserLevel = Tables<'user_levels'>
export type ForumPost = Tables<'forum_posts'>
