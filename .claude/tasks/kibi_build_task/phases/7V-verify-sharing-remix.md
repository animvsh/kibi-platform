# Phase 7V: Verify Sharing & Remixing

## Scope

Verify Phase 7 (Sharing & Remixing) output.

## Agent

`tester`

## Files to Review

- `src/lib/sharing/share-service.ts` - Share logic
- `src/app/course/[slug]/page.tsx` - Public course page
- `src/app/share/[token]/page.tsx` - Shared course view
- `src/app/explore/page.tsx` - Course exploration
- `src/app/(dashboard)/creator/page.tsx` - Creator dashboard

## Checklist

- [ ] Share links generate unique tokens
- [ ] Private courses not accessible without auth
- [ ] Public course page displays correct information
- [ ] Remixing prompts for personalization
- [ ] Remixed course creates independent copy
- [ ] Explore page shows public courses
- [ ] Explore page supports filtering
- [ ] Creator dashboard shows analytics
- [ ] Collaboration invites work

## Against References

- SPEC.md Section 12 (Course Sharing and Remixing) for requirements
- SPEC.md Section 13 (Creator Features) for creator dashboard

## Verdict

> Write PASS or FAIL with justification.

### If FAIL -- Issues Format

| # | Severity | File | Line | Issue | Suggested Fix |
|---|----------|------|------|-------|---------------|

## Artifacts

- Report: `artifacts/7-1v/tester_output.md`

## Exit Criteria

- All checklist items verified
- Verdict: PASS or FAIL with justification
- If FAIL: issues table populated with actionable items