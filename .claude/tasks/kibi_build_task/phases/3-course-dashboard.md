# Phase 3: Course Dashboard & Lesson Viewer

## Role

`developer` -- Frontend-focused with API integration

## Objective

Build the course dashboard showing progress, current unit/lesson, mastery score, XP, streak, and weak/strong areas. Implement the lesson viewer with article content, video embed support, and lesson completion tracking.

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | Dashboard and lesson viewer requirements |
| 2 | src/app/(dashboard)/courses/[id]/page.tsx | Course dashboard page |
| 3 | src/app/(dashboard)/courses/[id]/learn/page.tsx | Lesson viewer page |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | Dashboard UI | khan-academy-dashboard | Course progress dashboard reference |
| R2 | Lesson Viewer | duolingo-lesson | Lesson completion flow reference |

## Tasks

1. **Create course dashboard page**
   - Display: course title, description, progress, current unit, current lesson
   - Show: mastery score, XP, streak, weak areas, strong areas
   - Show: "Recommended next activity" card
   - Show: AI tutor access button
   - Show: Share button
   - Create `src/app/(dashboard)/courses/[id]/page.tsx`

2. **Create course path map component**
   - Visual representation of units with locked/unlocked states
   - Show completion percentage per unit
   - Click to navigate to unit
   - Create `src/components/course/course-path-map.tsx`

3. **Create unit view page**
   - List all modules in the unit
   - Show module type icons (lesson, quiz, flashcard, project)
   - Show completion status and mastery for each
   - Lock indicator for next unit if prerequisites not met
   - Create `src/app/(dashboard)/courses/[id]/unit/[unitId]/page.tsx`

4. **Create lesson viewer**
   - Render article content with markdown support
   - Support YouTube embed via iframe
   - Display key takeaways section
   - Display mini-check questions at end
   - "Mark as Complete" button
   - Create `src/app/(dashboard)/courses/[id]/lesson/[lessonId]/page.tsx`

5. **Create lesson completion flow**
   - After marking complete, trigger mastery calculation
   - Award XP for lesson completion
   - Update course progress
   - Show next activity recommendation
   - Create `src/lib/api/lesson-service.ts`

6. **Create basic quiz system**
   - Quiz taking interface with question display
   - Multiple choice, true/false, fill-in-blank support
   - Submit and score functionality
   - Show correct/incorrect with explanations
   - Save quiz attempt to database
   - Create `src/app/(dashboard)/courses/[id]/quiz/[quizId]/page.tsx`
   - Create `src/components/quiz/quiz-player.tsx`

7. **Create progress tracking API**
   - GET `/api/courses/[id]/progress` - Get user's progress for a course
   - POST `/api/lessons/[id]/complete` - Mark lesson complete
   - GET `/api/courses/[id]/knowledge-map` - Get concept mastery map

8. **Create XP and progress store**
   - Zustand store for XP, level, streak state
   - `src/lib/stores/progress-store.ts`

## Constraints

- All pages require authentication
- Use shadcn/ui components for consistency
- Responsive design (mobile-friendly)
- Streaming generation status if course still generating

## Exit Criteria

- [ ] Course dashboard displays all required information
- [ ] Course path map shows locked/unlocked units correctly
- [ ] Lesson viewer renders article content and videos
- [ ] Lesson completion updates progress and awards XP
- [ ] Quiz system can display questions and save attempts
- [ ] Progress persists across page refreshes

## Artifacts

- Report: `artifacts/3-1e/developer_output.md`
- Additional: Dashboard components, lesson viewer, quiz player

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`