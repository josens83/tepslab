-- =====================================================
-- TEPS Lab Row Level Security (RLS) Policies
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teps_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teps_exam_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teps_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES
-- =====================================================
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- =====================================================
-- COURSES
-- =====================================================
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Instructors can manage their own courses"
  ON courses FOR ALL
  USING (auth.uid() = instructor_id);

CREATE POLICY "Admins can manage all courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ENROLLMENTS
-- =====================================================
CREATE POLICY "Users can view their own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
  ON enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- PAYMENTS
-- =====================================================
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TEPS QUESTIONS
-- =====================================================
CREATE POLICY "Approved questions are viewable by everyone"
  ON teps_questions FOR SELECT
  USING (review_status = 'approved');

CREATE POLICY "Admins can manage all questions"
  ON teps_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TEPS EXAM CONFIGS
-- =====================================================
CREATE POLICY "Active configs are viewable by everyone"
  ON teps_exam_configs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage exam configs"
  ON teps_exam_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- TEPS EXAM ATTEMPTS
-- =====================================================
CREATE POLICY "Users can view their own exam attempts"
  ON teps_exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam attempts"
  ON teps_exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam attempts"
  ON teps_exam_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FORUM POSTS
-- =====================================================
CREATE POLICY "Forum posts are viewable by everyone"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON forum_posts FOR DELETE
  USING (auth.uid() = author_id);

-- =====================================================
-- FORUM COMMENTS
-- =====================================================
CREATE POLICY "Forum comments are viewable by everyone"
  ON forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON forum_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
  ON forum_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
  ON forum_comments FOR DELETE
  USING (auth.uid() = author_id);

-- =====================================================
-- MESSAGES & CONVERSATIONS
-- =====================================================
CREATE POLICY "Users can view conversations they're part of"
  ON conversations FOR SELECT
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND auth.uid() = ANY(participants)
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND auth.uid() = ANY(participants)
    )
  );

-- =====================================================
-- USER LEVELS (Gamification)
-- =====================================================
CREATE POLICY "Users can view their own level data"
  ON user_levels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all level data for leaderboard"
  ON user_levels FOR SELECT
  USING (true);

CREATE POLICY "System can update user levels"
  ON user_levels FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- STUDY GROUPS
-- =====================================================
CREATE POLICY "Public study groups are viewable by everyone"
  ON study_groups FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create study groups"
  ON study_groups FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their study groups"
  ON study_groups FOR UPDATE
  USING (auth.uid() = owner_id);

-- =====================================================
-- AI TUTOR SESSIONS
-- =====================================================
CREATE POLICY "Users can view their own AI sessions"
  ON ai_tutor_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI sessions"
  ON ai_tutor_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI sessions"
  ON ai_tutor_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- REVIEWS
-- =====================================================
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Enrolled users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE user_id = auth.uid()
      AND course_id = reviews.course_id
      AND status IN ('active', 'completed')
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- BOOKMARKS
-- =====================================================
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER LEARNING PROFILES
-- =====================================================
CREATE POLICY "Users can view their own learning profile"
  ON user_learning_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning profile"
  ON user_learning_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment course enrollment count
CREATE OR REPLACE FUNCTION increment_enrolled_count(course_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE courses
  SET enrolled_count = enrolled_count + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO user_levels (user_id)
  VALUES (NEW.id);

  INSERT INTO user_learning_profiles (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
