# Phase 2F1: Fix Course Generation (Iteration 1)

## Agent

`developer`

## Original Phase

`phases/2-course-generation.md`

## Issues to Fix

> From verification report: `artifacts/2-1v/tester_output.md`

| # | Severity | Issue | Suggested Fix |
|---|----------|-------|---------------|
| 1 | Critical | Course not saved to database - exists only in memory during SSE stream and is lost when stream completes | Save course to database immediately after Intent Analyzer completes. Store courseId and stream it to client early. |
| 2 | High | No early course shell streaming - client receives no course metadata until all generation is complete | Stream course_created event with courseId/title immediately after course is created in DB. Allow client to show course dashboard while generation continues. |
| 3 | Medium | No individual unit/lesson streaming - only progress percentages sent | Stream unit_created, lesson_created events as each unit/lesson is generated. Let client progressively show units/lessons. |

## Files to Fix

- `src/lib/ai/course-generator.ts` - Add database persistence, emit entity events
- `src/app/api/courses/generate/route.ts` - Emit early course_created event, stream entity events

## Constraints

- Fix ONLY the listed issues
- Do NOT refactor unrelated code
- Preserve existing AI agent logic
- Keep SSE streaming format compatible with existing client

## Exit Criteria

- Course saved to database after Intent Analyzer completes
- Course shell (courseId, title) streamed to client immediately
- Units and lessons streamed as they are generated
- No existing functionality broken