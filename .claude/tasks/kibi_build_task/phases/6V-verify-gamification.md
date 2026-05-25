# Phase 6V: Verify Gamification

## Scope

Verify Phase 6 (Gamification) output.

## Agent

`tester`

## Files to Review

- `src/lib/gamification/xp.ts` - XP system
- `src/lib/gamification/levels.ts` - Level progression
- `src/lib/gamification/badges.ts` - Badge system
- `src/components/gamification/knowledge-map.tsx` - Knowledge map
- `src/app/(dashboard)/courses/[id]/mastery/page.tsx` - Mastery dashboard

## Checklist

- [ ] XP awards correctly for all activities
- [ ] Level increases at correct XP thresholds
- [ ] Streak tracks daily meaningful activity
- [ ] Badge unlocks immediately when criteria met
- [ ] Knowledge map visualizes concept mastery
- [ ] Mastery dashboard shows strong/weak areas
- [ ] XP events stored in database
- [ ] Level progress bar displays correctly

## Against References

- SPEC.md Section 8 (Points, XP, and Knowledge System) for XP values
- SPEC.md Section 8.7 (Badges) for badge list
- SPEC.md Section 8.4 (Knowledge Map) for visualization

## Verdict

> Write PASS or FAIL with justification.

### If FAIL -- Issues Format

| # | Severity | File | Line | Issue | Suggested Fix |
|---|----------|------|------|-------|---------------|

## Artifacts

- Report: `artifacts/6-1v/tester_output.md`

## Exit Criteria

- All checklist items verified
- Verdict: PASS or FAIL with justification
- If FAIL: issues table populated with actionable items