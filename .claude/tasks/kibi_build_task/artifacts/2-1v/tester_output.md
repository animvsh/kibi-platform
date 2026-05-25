# Phase 2V: Course Generation Verification Report

## Verdict: FAIL

The course generation pipeline has significant issues preventing it from functioning correctly in production.

---

## Checklist Results

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | MiniMax API client handles streaming responses | PASS | `chatCompletionStream` (minimax.ts:186-308) properly handles SSE with async generator pattern |
| 2 | Intent Analyzer extracts topic, level, goal, timeframe | PASS | All fields extracted and validated in intent-analyzer.ts |
| 3 | Curriculum Architect generates course structure | PASS | Generates title, units, modules, concepts, prerequisites |
| 4 | Lesson Generator creates lesson content with examples | PASS | Generates title, markdown content, keyTakeaways, miniCheckQuestions, examples |
| 5 | Assessment Generator creates quiz questions with answer keys | PASS | Creates quiz with options, correctAnswer, explanation, conceptTags |
| 6 | Flashcard Generator creates flashcards with concept tags | PASS | Creates flashcards with front, back, conceptName, difficulty |
| 7 | Generation API streams progress to client via SSE | PASS | Uses ReadableStream with proper SSE formatting |
| 8 | Course shell appears before all units generated | FAIL | No early streaming of course shell or units |
| 9 | Generated course saves to database correctly | FAIL | Course is never persisted |
| 10 | Retry logic handles API failures gracefully | PASS | Exponential backoff with 3 retries implemented |

---

## Issues Found

### Issue 1: Course Shell Not Streamed Early

**Severity:** High  
**File:** `src/app/api/courses/generate/route.ts` (lines 44-86)  
**Issue:** The course shell (with initial title "Generating...") is never sent to the client. All course data is only sent at the end in the "completed" event (lines 56-71). The client receives no course metadata until all generation is complete.

**Suggested Fix:** Send a `course_created` SSE event after the course object is initialized (after line 81 in course-generator.ts), containing:
```typescript
controller.enqueue(
  encoder.encode(
    `data: ${JSON.stringify({
      type: "course_created",
      data: { courseId: course.id, title: course.title },
    })}\n\n`
  )
);
```

---

### Issue 2: Generated Course Not Saved to Database

**Severity:** Critical  
**File:** `src/app/api/courses/generate/route.ts` (line 53-54)  
**Issue:** The code explicitly states `// Store the generated course (in production, save to database)` but never actually saves to any database. The course and all related entities (units, modules, lessons, quizzes, flashcards, concepts) exist only in memory and are lost after the SSE stream completes.

**Suggested Fix:** Implement database persistence using Prisma or similar ORM:
```typescript
// After generateCourse completes successfully:
await prisma.course.create({
  data: {
    id: result.course.id,
    ownerId: user.userId,
    title: result.course.title,
    // ... other fields
    units: {
      create: result.units.map(unit => ({ ...unit }))
    },
    modules: {
      create: result.modules.map(mod => ({ ...mod }))
    },
    lessons: {
      create: result.lessons.map(lesson => ({ ...lesson }))
    },
    quizzes: {
      create: result.quizzes.map(quiz => ({
        ...quiz,
        questions: {
          create: result.quizQuestions
            .filter(q => q.quizId === quiz.id)
            .map(q => ({ ...q }))
        }
      }))
    },
    flashcards: {
      create: result.flashcards.map(fc => ({ ...fc }))
    },
    concepts: {
      create: result.concepts.map(c => ({ ...c }))
    },
  },
});
```

---

### Issue 3: No Individual Unit/Lesson Streaming

**Severity:** Medium  
**File:** `src/lib/ai/course-generator.ts`  
**Issue:** Units and lessons are created in the `generateCourse` function but no SSE events are emitted for individual units or lessons. Only progress percentage updates are sent.

**Suggested Fix:** Emit `unit_created` and `lesson_created` SSE events as each unit/lesson is generated (after lines 137 and 231 respectively).

---

## Summary

**PASS:** 7/10 items  
**FAIL:** 3/10 items

The pipeline correctly implements the multi-agent architecture for generating course content, but fails on critical production requirements:
- Course is never persisted to a database
- No early streaming of course shell or individual entities

**Recommendation:** Developer must fix issues #1 and #2 before this feature can be considered production-ready. Issue #3 is a enhancement but not blocking.
