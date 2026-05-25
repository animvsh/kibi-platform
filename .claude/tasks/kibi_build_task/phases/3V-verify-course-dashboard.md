# Phase 3V: Verify Course Dashboard

## Scope

Verify Phase 3 (Course Dashboard & Lesson Viewer) output.

## Agent

`tester`

## Files to Review

- `src/app/(dashboard)/courses/[id]/page.tsx` - Course dashboard
- `src/app/(dashboard)/courses/[id]/learn/page.tsx` - Lesson viewer
- `src/app/(dashboard)/courses/[id]/quiz/[quizId]/page.tsx` - Quiz page
- `src/components/course/course-path-map.tsx` - Path visualization
- `src/lib/stores/progress-store.ts` - Progress store

## Checklist

- [ ] Course dashboard displays title, description, progress
- [ ] Course dashboard shows mastery score and XP
- [ ] Course path map shows locked/unlocked units
- [ ] Unit view lists all modules with status
- [ ] Lesson viewer renders markdown content
- [ ] Lesson viewer supports YouTube embeds
- [ ] Lesson completion awards XP and updates progress
- [ ] Quiz player displays questions and accepts answers
- [ ] Quiz submission saves attempt and shows results
- [ ] Progress persists across page refreshes

## Against References

- SPEC.md Section 6 (Frontend Pages) for page structure
- SPEC.md Section 5 (Core User Experience) for UX requirements

## Verdict

> Write PASS or FAIL with justification.

### If FAIL -- Issues Format

| # | Severity | File | Line | Issue | Suggested Fix |
|---|----------|------|------|-------|---------------|

## Artifacts

- Report: `artifacts/3-1v/tester_output.md`

## Exit Criteria

- All checklist items verified
- Verdict: PASS or FAIL with justification
- If FAIL: issues table populated with actionable items