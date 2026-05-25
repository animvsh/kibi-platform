# Phase 6F1: Fix Gamification (Iteration 1)

## Agent

`developer`

## Original Phase

`phases/6-gamification.md`

## Issues to Fix

> From verification report: `artifacts/6-1v/tester_output.md`

| # | Severity | Issue | Suggested Fix |
|---|----------|-------|---------------|
| 1 | Critical | Level calculation broken - variable shadowing causes `xp <= xp` to always be true | In xp.ts:217, rename destructured variable to avoid shadowing the `xp` parameter |
| 2 | High | Badge criteria not fully implemented - streak/learning_speed/focus_time badges cannot be earned | Implement checkStreakBadge, checkLearningSpeedBadge, checkFocusTimeBadge and call them in checkAndAwardBadges |
| 3 | High | Streak system not implemented - UI shows hardcoded placeholder | Implement actual streak calculation with timezone-aware daily tracking |
| 4 | Medium | XP events use in-memory Map, not database | Connect xpEvents to actual database schema via InsForge |
| 5 | Medium | Level progress bar shows mastery % instead of XP progress | Fix mastery page to show XP progress bar with current level and next level threshold |

## Files to Fix

- `src/lib/gamification/xp.ts` - Fix level calculation, connect to DB
- `src/lib/gamification/badges.ts` - Implement all badge checks
- `src/lib/gamification/streaks.ts` - Implement streak calculation
- `src/app/(dashboard)/profile/page.tsx` - Show actual streak
- `src/app/(dashboard)/courses/[id]/mastery/page.tsx` - Show XP progress bar

## Constraints

- Fix ONLY the listed issues
- Keep XP award values as specified in SPEC
- Maintain badge rarity tiers
- Keep timezone-aware streak calculation

## Exit Criteria

- Level calculation returns correct level for any XP value
- All 11 badges can be earned
- Streak displays actual count from calculation
- XP events persist to database
- Level progress bar shows XP progress