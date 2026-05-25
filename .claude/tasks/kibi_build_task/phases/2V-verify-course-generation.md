# Phase 2V: Verify Course Generation

## Scope

Verify Phase 2 (Course Generation Pipeline) output.

## Agent

`tester`

## Files to Review

- `src/lib/ai/minimax.ts` - MiniMax API client
- `src/lib/ai/agents/` - All agent modules
- `src/app/api/courses/generate/route.ts` - Generation endpoint
- `src/components/course/generation-progress.tsx` - Streaming UI

## Checklist

- [ ] MiniMax API client handles streaming responses
- [ ] Intent Analyzer extracts topic, level, goal, timeframe
- [ ] Curriculum Architect generates course structure
- [ ] Lesson Generator creates lesson content with examples
- [ ] Assessment Generator creates quiz questions with answer keys
- [ ] Flashcard Generator creates flashcards with concept tags
- [ ] Generation API streams progress to client
- [ ] Course shell appears before all units generated
- [ ] Generated course saves to database correctly
- [ ] Retry logic handles API failures gracefully

## Against References

- SPEC.md Section 14 (AI Architecture) for agent pipeline
- SPEC.md Section 21 (Generation Output Format) for course structure

## Verdict

> Write PASS or FAIL with justification.

### If FAIL -- Issues Format

| # | Severity | File | Line | Issue | Suggested Fix |
|---|----------|------|------|-------|---------------|

## Artifacts

- Report: `artifacts/2-1v/tester_output.md`

## Exit Criteria

- All checklist items verified
- Verdict: PASS or FAIL with justification
- If FAIL: issues table populated with actionable items