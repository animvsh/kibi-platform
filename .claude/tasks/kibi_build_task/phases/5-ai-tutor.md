# Phase 5: AI Tutor System

## Role

`developer` -- AI integration specialist

## Objective

Build the course-aware, progress-aware AI tutor that understands current lesson, user progress, weak concepts, and can explain, quiz, generate practice, and update learning state.

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | AI Tutor requirements |
| 2 | src/app/api/tutor/chat/route.ts | Tutor API |
| 3 | src/components/tutor/tutor-sidebar.tsx | Tutor UI |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | Tutor Context | adaptive-tutor-rag | RAG-based tutor context retrieval |
| R2 | Socratic | socratic-tutor | Socratic questioning pattern for AI tutors |

## Tasks

1. **Create tutor context builder**
   - Build context from: current course, current lesson, user progress, quiz scores, weak concepts, strong concepts, user goals
   - Retrieve relevant lesson content for RAG
   - Create `src/lib/tutor/context-builder.ts`

2. **Implement tutor API**
   - POST `/api/courses/[id]/tutor/chat`
   - Accept: message, current_context
   - Return: AI response with context awareness
   - Create `src/app/api/courses/[id]/tutor/chat/route.ts`

3. **Create tutor actions**
   - Explain this simpler
   - Give me an example
   - Quiz me on this
   - Create more practice
   - Make flashcards from this
   - What should I study next?
   - Am I ready for the next unit?
   - Create a cram plan
   - Implement in `src/lib/tutor/actions.ts`

4. **Create tutor UI**
   - Chat interface sidebar
   - Quick action buttons
   - Current lesson context display
   - Typing indicator
   - Create `src/components/tutor/tutor-sidebar.tsx`
   - Create `src/app/(dashboard)/courses/[id]/tutor/page.tsx`

5. **Implement tutor-triggered updates**
   - When user asks many questions on one concept → mark unstable
   - Generate additional practice for weak concepts
   - Update learning state based on tutor interactions
   - Create `src/lib/tutor/learning-updater.ts`

6. **Create tutor generation endpoints**
   - POST `/api/courses/[id]/tutor/generate-practice`
   - POST `/api/courses/[id]/tutor/explain`
   - POST `/api/courses/[id]/tutor/quiz-me`

## Constraints

- Tutor must have full course and progress context
- Responses should be accurate to lesson content
- Tutor should not give direct answers to quiz questions
- Integration with mastery system for learning updates

## Exit Criteria

- [ ] Tutor knows current lesson and course context
- [ ] Tutor can explain concepts at different difficulty levels
- [ ] Tutor can generate practice questions
- [ ] Tutor updates learning state based on conversation
- [ ] Tutor recommendations align with mastery system

## Artifacts

- Report: `artifacts/5-1e/developer_output.md`
- Additional: Tutor system, context builder, tutor UI

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`