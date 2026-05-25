# SPEC.md - Kibi: AI-Powered Text-to-Course Learning Platform

## 1. Goal

Build Kibi, a web-based AI-powered learning platform that turns any prompt, file, topic, or link into a fully personalized interactive course with mastery-based locked progression, adaptive learning, gamification (XP, streaks, levels), AI tutor support, and shareable/remixable courses.

**Core Product Promise:** "Describe what you want to learn. Kibi builds a course for you, teaches you step by step, tracks what you know, and only moves you forward when you are ready."

**Key Differentiator:** Kibi does not let users passively click through content. Users must prove they understand each concept before moving forward.

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **State:** Zustand or Redux
- **Real-time:** SSE/WebSockets for generation logs
- **PWA:** Mobile-friendly with installability

### Backend
- **Platform:** Self-hosted on Railway with InsForge
- **Database:** PostgreSQL through InsForge
- **Auth:** Through InsForge
- **Storage:** Through InsForge
- **Functions:** Serverless/functions through InsForge

### AI
- **Provider:** MiniMax (primary intelligence for all generation and tutoring)
- **Capabilities:** Course planning, lesson writing, quiz generation, flashcard generation, tutor chat, answer grading, rubric feedback, course remixing, adaptive recommendations

### Deployment
- **Backend:** Railway (InsForge self-hosted)
- **Frontend:** Railway, Vercel, or Cloudflare Pages

---

## 3. Core Features

### 3.1 Course Generation
- Prompt-to-course ("Teach me React in 14 days")
- File upload: PDF, DOCX, PPTX, TXT, Markdown, CSV
- URL ingestion: documentation, articles, webpages
- YouTube link with transcript extraction
- Syllabus to course conversion
- Real-time generation progress with streaming

### 3.2 Course Structure
- **Hierarchy:** Course → Unit → Module → Lesson/Practice/Quiz/Flashcards/Mastery Check
- **Module Types:** Article, Video, Quiz, Flashcard, Practice, Project, Case Study, AI Tutor, Mastery Check, Final Assessment

### 3.3 Mastery-Based Learning System
- **Core Rule:** Users cannot move to next unit until they prove mastery of current unit
- **Concept Mastery Score:** 0-100 scale (Not Learned → Familiar → Developing → Proficient → Strong → Mastered)
- **Unit Unlock Rules:**
  - Average required concept mastery >= 85
  - No critical concept below 75
  - Mastery check score >= 80
  - Required activities completed
- **Mastery Decay:** Spaced repetition with decay over time

### 3.4 Dynamic Learning Engine
- Learning state tracking per user per course
- Next Best Action system
- Adaptive course modifications based on performance
- Weakness detection and targeted review generation
- Learning speed tracking per concept

### 3.5 Gamification
- **XP System:** Earn XP for lessons, quizzes, flashcards, projects, mastery
- **Levels:** Global XP-based leveling across Kibi
- **Streaks:** Daily streak tracking with meaningful activity requirement
- **Badges:** Achievement system (First Course, Quiz Master, etc.)
- **Knowledge Map:** Visual representation of mastered/weak concepts

### 3.6 AI Tutor
- Course-aware, lesson-aware, progress-aware
- Actions: Explain simpler, give examples, quiz user, create practice, make flashcards
- Updates learning state based on conversation

### 3.7 Sharing & Remixing
- Visibility modes: Private, Unlisted, Public, Invite-only, Collaborative
- Public course pages with learner count, remix button
- Remixing with personalization questions
- Course collaboration features

### 3.8 Creator Features
- Creator dashboard with analytics
- Course management (create, edit, publish, delete)
- Remix tracking
- Completion rates and struggle point analytics

---

## 4. Database Schema (Key Tables)

```
users, courses, course_units, course_modules, lessons, concepts, lesson_concepts,
quizzes, quiz_questions, quiz_attempts, flashcards, flashcard_reviews,
assignments, assignment_submissions, user_course_progress, user_concept_mastery,
xp_events, course_shares, course_remixes
```

---

## 5. API Requirements

### Auth APIs
- POST /auth/signup, /auth/login, /auth/logout, /auth/reset-password, GET /auth/me

### Course APIs
- POST /courses/generate, GET /courses, GET/PATCH/DELETE /courses/:id, POST /courses/:id/publish, /remix, /share

### Lesson APIs
- GET /courses/:courseId/lessons/:lessonId, PATCH /lessons/:id, POST /lessons/:id/complete, /regenerate

### Quiz APIs
- GET /quizzes/:id, POST /quizzes/:id/attempt, GET /quizzes/:id/results

### Mastery APIs
- GET /courses/:id/mastery, /knowledge-map, POST /courses/:id/recalculate-mastery, GET /next-best-action

### Tutor APIs
- POST /courses/:id/tutor/chat, /generate-practice, /explain, /quiz-me

### Sharing APIs
- GET /share/:shareToken, POST /courses/:id/invite, /duplicate

---

## 6. Frontend Pages

**Public:** /, /explore, /course/:slug, /share/:token, /pricing, /login, /signup

**Authenticated:** /dashboard, /create, /courses/:id, /learn, /unit/:unitId, /lesson/:lessonId, /quiz/:quizId, /flashcards, /project/:projectId, /mastery, /settings, /profile

---

## 7. Multi-Agent Pipeline

1. **Intent Analyzer** - Parse prompt/files/URL into topic, level, goal, timeframe
2. **Curriculum Architect** - Create course title, outline, units, modules, concept graph
3. **Lesson Generator** - Write lesson content, examples, key takeaways, mini-checks
4. **Assessment Generator** - Create quizzes, answer keys, explanations, rubrics
5. **Flashcard Generator** - Create flashcards with concept tags and review metadata
6. **Practice Generator** - Create exercises, projects, case studies, coding tasks
7. **Mastery Evaluator** - Evaluate quiz answers, practice, flashcards, concept mastery
8. **Adaptive Path Planner** - Decide next activity, review, unlock status, difficulty
9. **AI Tutor** - Handle user questions, explanations, extra practice
10. **Quality Checker** - Check for repetition, incorrect answers, bad sequencing

---

## 8. MVP Definition

First fully functional version must allow a user to:
1. Sign up
2. Generate a course from a prompt
3. See generated units, lessons, quizzes, and flashcards
4. Start the course
5. Complete lessons
6. Take quizzes
7. Get mastery scores
8. Be blocked from moving forward until mastery is achieved
9. Receive AI-generated review when they fail
10. Earn XP
11. Track progress
12. Ask an AI tutor questions
13. Share the course
14. Remix another course
15. Resume learning later

---

## 9. Phase Plan (from PRD Section 23)

1. **Phase 1: Core Platform** - Auth, Dashboard, Prompt-to-course generation, Course dashboard, Lesson viewer, Basic quiz system, Progress tracking, Course sharing
2. **Phase 2: Mastery Engine** - Concept graph, Mastery scores, Unit locking, Quiz-based mastery updates, Next best action, Weak concept detection
3. **Phase 3: Dynamic AI Tutor** - Course-aware tutor, Lesson-aware tutor, Tutor-triggered practice generation, Tutor-triggered review generation, AI answer grading
4. **Phase 4: Points and Gamification** - XP, Levels, Streaks, Badges, Knowledge map, Mastery dashboard
5. **Phase 5: Advanced Modules** - Flashcards, Projects, Case studies, Coding challenges, Video lessons, File-to-course, YouTube-to-course
6. **Phase 6: Creator and Sharing** - Public course pages, Remixing, Creator dashboard, Course analytics, Collaboration

---

## 10. Acceptance Criteria

### Course Creation
- [ ] User can enter a prompt and generate a course
- [ ] User sees course dashboard with units, lessons, quizzes, flashcards
- [ ] User can start and complete lessons
- [ ] User can take quizzes and see progress update
- [ ] User can share the course

### Mastery Locking
- [ ] System tracks concept mastery
- [ ] Future units are locked until mastery threshold met
- [ ] System generates remediation when user fails
- [ ] Mastery updates after every quiz/practice/flashcard

### Dynamic Learning
- [ ] System recommends next best action
- [ ] System detects weak/strong concepts
- [ ] System adjusts difficulty
- [ ] System generates review content adaptively

### Points System
- [ ] System awards XP
- [ ] System tracks streaks
- [ ] System tracks course and concept mastery
- [ ] System shows user level and knowledge map

### Sharing
- [ ] System generates public/private share links
- [ ] System allows course duplication
- [ ] System allows remixing
- [ ] System respects visibility settings

### AI Tutor
- [ ] Tutor knows current course and lesson context
- [ ] Tutor knows user progress
- [ ] Tutor can explain concepts and generate examples/quizzes
