# Phase 1: Project Foundation

## Role

`developer` -- Full-stack implementation

## Objective

Set up the Next.js project with TypeScript, Tailwind, shadcn/ui, folder structure, connect to InsForge backend, create PostgreSQL database schema, and implement authentication (signup/login/logout).

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | Full requirements reference |
| 2 | .claude/tasks/templates/SPEC.md | Tech stack and architecture |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | Boilerplate | nextjs-default | Next.js 14 with App Router boilerplate |
| R2 | shadcn/ui | shadcn-ui-setup | shadcn/ui component library setup |

## Tasks

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest kibi --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
   ```
   - Set up in /Users/animesh/.superset/projects/kibi/

2. **Install dependencies**
   - Install shadcn/ui: `npx shadcn@latest init`
   - Install Framer Motion: `npm install framer-motion`
   - Install Zustand: `npm install zustand`
   - Install Tailwind config viewer (dev): `npm install -D tailwind-config-viewer`

3. **Set up shadcn/ui components**
   - Initialize shadcn with default style
   - Add components: button, input, card, badge, progress, dialog, dropdown-menu, tabs, avatar, tooltip, toast

4. **Create folder structure**
   ```
   src/
   ├── app/                    # Next.js App Router
   │   ├── (auth)/            # Auth routes (login, signup)
   │   ├── (dashboard)/       # Protected routes
   │   │   ├── dashboard/
   │   │   ├── create/
   │   │   └── courses/
   │   ├── api/               # API routes
   │   │   ├── auth/
   │   │   ├── courses/
   │   │   └── tutor/
   │   └── page.tsx           # Landing page
   ├── components/
   │   ├── ui/                # shadcn components
   │   ├── layout/            # Layout components
   │   ├── course/            # Course-related components
   │   ├── quiz/              # Quiz components
   │   └── tutor/             # AI Tutor components
   ├── lib/
   │   ├── api/               # API client functions
   │   ├── auth/              # Auth utilities
   │   ├── stores/            # Zustand stores
   │   └── utils.ts           # Utility functions
   └── types/                  # TypeScript types
   ```

5. **Create InsForge backend integration**
   - Create `src/lib/api/client.ts` - API client configured for InsForge backend URL
   - Create `src/lib/api/endpoints.ts` - API endpoint constants
   - Set up environment variables: `NEXT_PUBLIC_API_URL`, `INSFORGE_API_KEY`

6. **Create PostgreSQL schema**
   - Create SQL migration for core tables:
     - `users` (id, email, name, avatar_url, created_at, updated_at, preferred_learning_style, default_difficulty, total_xp, level, current_streak, longest_streak)
     - `courses` (id, owner_id, title, slug, description, source_type, source_metadata, difficulty, estimated_duration_minutes, visibility, remixable, status, thumbnail_url, generation_prompt, created_at, updated_at)
     - `course_units` (id, course_id, title, description, order_index, unlock_rule, required_mastery_score, status, created_at)
     - `course_modules` (id, course_id, unit_id, title, description, module_type, order_index, estimated_minutes, created_at)
     - `lessons` (id, course_id, unit_id, module_id, title, lesson_type, content_json, plain_text, order_index, estimated_minutes, status, created_at, updated_at)
     - `concepts` (id, course_id, name, description, prerequisite_concepts, difficulty, created_at)
     - `lesson_concepts` (lesson_id, concept_id, importance)
     - `quizzes` (id, course_id, unit_id, lesson_id, title, description, passing_score, created_at)
     - `quiz_questions` (id, quiz_id, question_type, question, options_json, correct_answer_json, explanation, difficulty, concept_tags, created_at)
     - `quiz_attempts` (id, user_id, course_id, quiz_id, score, answers_json, feedback_json, completed_at)
     - `flashcards` (id, course_id, unit_id, concept_id, front, back, difficulty, created_at)
     - `flashcard_reviews` (id, user_id, flashcard_id, rating, next_review_at, reviewed_at)
     - `user_course_progress` (id, user_id, course_id, current_unit_id, current_lesson_id, overall_progress, overall_mastery, status, started_at, last_active_at, completed_at)
     - `user_concept_mastery` (id, user_id, course_id, concept_id, mastery_score, confidence_score, last_practiced_at, next_review_at, learning_speed, status)
     - `xp_events` (id, user_id, course_id, event_type, xp_amount, metadata_json, created_at)
     - `course_shares` (id, course_id, share_token, visibility, created_by, expires_at, created_at)
   - Save SQL to `db/migrations/001_initial_schema.sql`

7. **Implement authentication**
   - Create auth API routes: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
   - Implement JWT-based auth with HttpOnly cookies
   - Create signup/login pages in `src/app/(auth)/`
   - Create protected route wrapper component
   - Create Zustand auth store: `src/lib/stores/auth-store.ts`

8. **Create landing page**
   - Hero section with "What do you want to learn?" prompt input
   - Example prompts display
   - Feature highlights
   - Footer with links

## Constraints

- Use App Router (not Pages Router)
- All API routes go through InsForge backend
- Auth tokens stored in HttpOnly cookies
- TypeScript strict mode enabled
- ESLint and Prettier configured

## Exit Criteria

- [ ] Next.js project builds without errors (`npm run build`)
- [ ] shadcn/ui components render correctly
- [ ] Auth signup/login flow works end-to-end
- [ ] Database migrations can be applied to PostgreSQL
- [ ] Landing page displays at `/`
- [ ] Protected routes redirect to login when unauthenticated

## Artifacts

- Report: `artifacts/1-1e/developer_output.md`
- Additional: Project structure, database migrations, auth system

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`