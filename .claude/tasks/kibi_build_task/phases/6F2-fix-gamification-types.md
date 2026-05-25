# Phase 6F2: Fix Gamification Type Errors (Iteration 2)

## Agent

`developer`

## Original Phase

`phases/6-gamification.md`

## Issues to Fix

> From verification report: `artifacts/6V-2v/tester_output.md`

| # | Severity | Issue | Suggested Fix |
|---|----------|-------|---------------|
| 1 | Critical | TypeScript type mismatch - `XpEventType` uses `"concept_mastered"`, `"unit_mastered"`, `"course_completed"` but `xp.ts` uses invalid `"mastery_achieved"` and `"course_complete"` | Update xp.ts to use correct type values: `concept_mastered`, `unit_mastered`, `course_completed` |
| 2 | Critical | `checkAndAwardBadges` expects `BadgeCriteria["type"]` but route passes `XpEventType` | Create unified `BadgeCheckEvent` type or separate `checkBadge` function that accepts `XpEventType` |
| 3 | High | `checkBadgeCriteria` parameter type lacks `courseId` property | Add optional `courseId` to `BadgeCriteria` type |
| 4 | Medium | Duplicate exports `getLevelProgress` and `getXpForLevel` | Remove duplicate export from xp.ts |

## Files to Fix

- `src/lib/gamification/xp.ts` - Fix XpEventType values
- `src/lib/gamification/badges.ts` - Fix type mismatch for badge checks
- `src/types/index.ts` - Ensure BadgeCriteria has courseId

## Constraints

- Fix ONLY the type errors
- Do not change gamification logic
- Ensure TypeScript compiles without errors

## Exit Criteria

- TypeScript build passes without errors
- All type mismatches resolved
- No duplicate exports