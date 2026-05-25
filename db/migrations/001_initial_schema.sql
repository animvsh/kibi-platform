-- Kibi Initial Schema Migration
-- PostgreSQL database schema for Kibi learning platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    password_hash VARCHAR(255) NOT NULL,
    preferred_learning_style VARCHAR(50),
    default_difficulty VARCHAR(50),
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    source_type VARCHAR(50) NOT NULL, -- prompt, file, url, youtube, syllabus
    source_metadata JSONB,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    estimated_duration_minutes INTEGER,
    visibility VARCHAR(50) DEFAULT 'private', -- private, unlisted, public, invite, collaborative
    remixable BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'draft', -- draft, generating, ready, published, archived
    thumbnail_url VARCHAR(500),
    generation_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_owner_id ON courses(owner_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_visibility ON courses(visibility);

-- ============================================
-- COURSE UNITS TABLE
-- ============================================
CREATE TABLE course_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    unlock_rule JSONB,
    required_mastery_score INTEGER DEFAULT 85,
    status VARCHAR(50) DEFAULT 'locked', -- locked, available, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_units_course_id ON course_units(course_id);
CREATE INDEX idx_course_units_order ON course_units(course_id, order_index);

-- ============================================
-- COURSE MODULES TABLE
-- ============================================
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    module_type VARCHAR(50) NOT NULL, -- article, video, quiz, flashcard, practice, project, case_study, ai_tutor, mastery_check, final_assessment
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_modules_unit_id ON course_modules(unit_id);
CREATE INDEX idx_course_modules_order ON course_modules(unit_id, order_index);

-- ============================================
-- LESSONS TABLE
-- ============================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
    module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    lesson_type VARCHAR(50) NOT NULL,
    content_json JSONB,
    plain_text TEXT,
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(unit_id, order_index);

-- ============================================
-- CONCEPTS TABLE
-- ============================================
CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prerequisite_concepts UUID[],
    difficulty VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_concepts_course_id ON concepts(course_id);

-- ============================================
-- LESSON_CONCEPTS TABLE (Junction)
-- ============================================
CREATE TABLE lesson_concepts (
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    importance VARCHAR(50) DEFAULT 'supporting', -- core, supporting, optional
    PRIMARY KEY (lesson_id, concept_id)
);

CREATE INDEX idx_lesson_concepts_concept_id ON lesson_concepts(concept_id);

-- ============================================
-- QUIZZES TABLE
-- ============================================
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES course_units(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_quizzes_unit_id ON quizzes(unit_id);
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);

-- ============================================
-- QUIZ_QUESTIONS TABLE
-- ============================================
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL, -- multiple_choice, true_false, short_answer, essay
    question TEXT NOT NULL,
    options_json JSONB,
    correct_answer_json JSONB NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(50) DEFAULT 'intermediate',
    concept_tags VARCHAR(100)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- ============================================
-- QUIZ_ATTEMPTS TABLE
-- ============================================
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    answers_json JSONB NOT NULL,
    feedback_json JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_course_id ON quiz_attempts(course_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- ============================================
-- FLASHCARDS TABLE
-- ============================================
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES course_units(id) ON DELETE SET NULL,
    concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flashcards_course_id ON flashcards(course_id);
CREATE INDEX idx_flashcards_unit_id ON flashcards(unit_id);
CREATE INDEX idx_flashcards_concept_id ON flashcards(concept_id);

-- ============================================
-- FLASHCARD_REVIEWS TABLE
-- ============================================
CREATE TABLE flashcard_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL, -- 1-5 (spaced repetition rating)
    next_review_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flashcard_reviews_user_id ON flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_flashcard_id ON flashcard_reviews(flashcard_id);
CREATE INDEX idx_flashcard_reviews_next_review ON flashcard_reviews(next_review_at);

-- ============================================
-- USER_COURSE_PROGRESS TABLE
-- ============================================
CREATE TABLE user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    current_unit_id UUID REFERENCES course_units(id) ON DELETE SET NULL,
    current_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    overall_progress INTEGER DEFAULT 0, -- 0-100
    overall_mastery INTEGER DEFAULT 0, -- 0-100
    status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed, abandoned
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course_id ON user_course_progress(course_id);

-- ============================================
-- USER_CONCEPT_MASTERY TABLE
-- ============================================
CREATE TABLE user_concept_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_score INTEGER DEFAULT 0, -- 0-100
    confidence_score INTEGER DEFAULT 0, -- 0-100
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    next_review_at TIMESTAMP WITH TIME ZONE,
    learning_speed DECIMAL(5,2) DEFAULT 1.0,
    status VARCHAR(50) DEFAULT 'not_learned', -- not_learned, familiar, developing, proficient, strong, mastered
    UNIQUE(user_id, course_id, concept_id)
);

CREATE INDEX idx_user_concept_mastery_user_id ON user_concept_mastery(user_id);
CREATE INDEX idx_user_concept_mastery_course_id ON user_concept_mastery(course_id);
CREATE INDEX idx_user_concept_mastery_concept_id ON user_concept_mastery(concept_id);

-- ============================================
-- XP_EVENTS TABLE
-- ============================================
CREATE TABLE xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- lesson_complete, quiz_complete, flashcard_review, mastery_achieved, streak_milestone, course_complete, daily_login
    xp_amount INTEGER NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX idx_xp_events_course_id ON xp_events(course_id);
CREATE INDEX idx_xp_events_event_type ON xp_events(event_type);
CREATE INDEX idx_xp_events_created_at ON xp_events(created_at);

-- ============================================
-- COURSE_SHARES TABLE
-- ============================================
CREATE TABLE course_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    share_token VARCHAR(100) UNIQUE NOT NULL,
    visibility VARCHAR(50) DEFAULT 'unlisted',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_shares_token ON course_shares(share_token);
CREATE INDEX idx_course_shares_course_id ON course_shares(course_id);

-- ============================================
-- COURSE REMIXES TABLE
-- ============================================
CREATE TABLE course_remixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    remixed_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    remixed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    remix_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(original_course_id, remixed_course_id)
);

CREATE INDEX idx_course_remixes_original ON course_remixes(original_course_id);
CREATE INDEX idx_course_remixes_remixed ON course_remixes(remixed_course_id);
CREATE INDEX idx_course_remixes_user ON course_remixes(remixed_by);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
