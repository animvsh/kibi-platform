# Phase 2: Course Generation Pipeline

## Role

`developer` -- Full-stack implementation with AI integration

## Objective

Implement the multi-agent course generation pipeline: Intent Analyzer, Curriculum Architect, Lesson Generator, Assessment Generator, Flashcard Generator, and streaming generation UI with real-time progress updates.

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | Course generation requirements, agent pipeline |
| 2 | src/app/(dashboard)/create/page.tsx | Course creation page |
| 3 | src/app/api/courses/generate/route.ts | Generation API endpoint |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | AI Integration | minimax-api-example | MiniMax API integration pattern |
| R2 | Streaming | sse-nextjs-example | Server-Sent Events in Next.js |

## Tasks

1. **Create MiniMax API integration**
   - Install MiniMax SDK or create HTTP client in `src/lib/ai/minimax.ts`
   - Create chat completion function with system prompt support
   - Handle streaming responses
   - Implement retry logic with exponential backoff
   - Set up error handling for rate limits

2. **Implement Intent Analyzer Agent**
   - Input: prompt, files, URL, user preferences
   - Output: topic, level, goal, timeframe, course style, required skills
   - Create `src/lib/ai/agents/intent-analyzer.ts`
   - System prompt that extracts learning context from user input

3. **Implement Curriculum Architect Agent**
   - Input: intent analysis result
   - Output: course title, outline, units, modules, lessons, prerequisites, concept graph
   - Create `src/lib/ai/agents/curriculum-architect.ts`
   - Generate structured course JSON matching database schema

4. **Implement Lesson Generator Agent**
   - Input: curriculum outline, lesson topic
   - Output: lesson content, examples, key takeaways, mini-check questions
   - Create `src/lib/ai/agents/lesson-generator.ts`
   - Generate rich markdown/JSON content for lessons

5. **Implement Assessment Generator Agent**
   - Input: lesson content, concepts covered
   - Output: quizzes, answer keys, explanations, difficulty levels
   - Create `src/lib/ai/agents/assessment-generator.ts`
   - Generate multiple question types (multiple choice, true/false, fill-in-blank)

6. **Implement Flashcard Generator Agent**
   - Input: lesson content, key concepts
   - Output: flashcards with front/back, concept tags, review metadata
   - Create `src/lib/ai/agents/flashcard-generator.ts`

7. **Create generation API route**
   - POST `/api/courses/generate`
   - Accept: prompt, source_type, source_metadata, preferences
   - Return: SSE stream with generation progress
   - Orchestrate all agents sequentially
   - Store generated course in database
   - Return course_id when complete

8. **Create streaming generation UI**
   - In course creation page, show real-time steps:
     ```
     Understanding your goal...
     Finding the core concepts...
     Building your learning path...
     Creating Unit 1...
     Writing lessons...
     Generating quizzes...
     Creating flashcards...
     Building mastery checks...
     Setting up your AI tutor...
     Publishing your course...
     ```
   - Show course shell appearing progressively
   - Allow user to start Unit 1 while later units generating
   - Create `src/components/course/generation-progress.tsx`

9. **Create course generation types**
   - `src/types/course.ts` - Course, Unit, Module, Lesson types
   - `src/types/generation.ts` - Generation request/response types

## Constraints

- All AI calls go through MiniMax API
- Generation must support streaming for UX
- Course structure must match database schema exactly
- Agent prompts must be well-structured for consistent output
- Handle partial failures gracefully (save what's generated)

## Exit Criteria

- [ ] MiniMax API integration works end-to-end
- [ ] Course generation from prompt produces complete course structure
- [ ] Generation progress streams to UI in real-time
- [ ] Course appears progressively (not all at once)
- [ ] Generated course is stored in database correctly
- [ ] Quiz questions have correct answer keys

## Artifacts

- Report: `artifacts/2-1e/developer_output.md`
- Additional: AI agent modules, generation API, streaming UI

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`