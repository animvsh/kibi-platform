# Phase 6F3: Fix Remaining TypeScript Errors (Final)

## Agent

`developer`

## Original Phase

`phases/6-gamification.md`

## Issues to Fix

> From verification report: `artifacts/6V-3v/tester_output.md`

| # | Severity | Issue | Suggested Fix |
|---|----------|-------|---------------|
| 1 | Critical | route.ts still uses invalid `"mastery_achieved"` | Change to `"concept_mastered"` or `"unit_mastered"` |
| 2 | Critical | route.ts still uses invalid `"course_complete"` | Change to `"course_completed"` |
| 3 | Medium | knowledge-map.tsx `asChild` prop not supported on TooltipTrigger with SVG | Remove `asChild` prop from TooltipTrigger in SVG context |

## Files to Fix

- `src/app/api/xp/award/route.ts` - Fix XpEventType values
- `src/components/gamification/knowledge-map.tsx` - Remove asChild prop

## Constraints

- Fix ONLY the listed issues
- Do not change gamification logic
- Verify TypeScript compiles after fix

## Exit Criteria

- TypeScript build passes without errors
- All 3 remaining issues resolved