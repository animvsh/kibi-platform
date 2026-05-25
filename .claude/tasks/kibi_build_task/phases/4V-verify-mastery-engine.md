# Phase 4V: Verify Mastery Engine

## Scope

Verify Phase 4 (Mastery Engine) output.

## Agent

`tester`

## Files to Review

- `src/lib/mastery/calculator.ts` - Mastery calculation
- `src/lib/mastery/unlock-rules.ts` - Unit locking logic
- `src/lib/mastery/spaced-repetition.ts` - Decay algorithm
- `src/lib/mastery/next-action.ts` - Next best action
- `src/app/api/courses/[id]/mastery/route.ts` - Mastery API

## Checklist

- [ ] Concept mastery calculates correctly from quiz scores
- [ ] Mastery status maps to correct 0-100 range
- [ ] Unit lock enforced - blocked without required mastery
- [ ] Unit unlocks when all conditions met
- [ ] Weak concepts identified from quiz mistakes
- [ ] Next best action returns appropriate recommendation
- [ ] Remediation generated when user fails unit
- [ ] Mastery decays over time without review
- [ ] Spaced repetition schedules review correctly

## Against References

- SPEC.md Section 6.3 (Concept Mastery Score) for ranges
- SPEC.md Section 6.4 (Unit Unlock Rules) for conditions
- SPEC.md Section 6.6 (Mastery Decay) for decay rules

## Verdict

> Write PASS or FAIL with justification.

### If FAIL -- Issues Format

| # | Severity | File | Line | Issue | Suggested Fix |
|---|----------|------|------|-------|---------------|

## Artifacts

- Report: `artifacts/4-1v/tester_output.md`

## Exit Criteria

- All checklist items verified
- Verdict: PASS or FAIL with justification
- If FAIL: issues table populated with actionable items