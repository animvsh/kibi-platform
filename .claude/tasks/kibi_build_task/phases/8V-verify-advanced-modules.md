# Phase 8V: Verify Advanced Modules

## Scope

Verify Phase 8 (Advanced Modules & File Processing) output.

## Agent

`tester`

## Files to Review

- `src/app/(dashboard)/courses/[id]/flashcards/page.tsx` - Flashcard study
- `src/app/(dashboard)/courses/[id]/project/[projectId]/page.tsx` - Project module
- `src/lib/files/file-processor.ts` - File processing
- `src/lib/video/youtube-extractor.ts` - YouTube integration
- `src/app/api/courses/generate/route.ts` - Extended generation

## Checklist

- [ ] Flashcard study displays cards correctly
- [ ] Flashcard rating updates spaced repetition schedule
- [ ] Project submission accepts text/file upload
- [ ] AI feedback generated for project submissions
- [ ] PDF upload extracts text content
- [ ] DOCX/PPTX processing extracts content
- [ ] YouTube video generates transcript-based lessons
- [ ] YouTube generates timestamped quizzes
- [ ] Creator dashboard displays analytics
- [ ] File upload supports drag-and-drop

## Against References

- SPEC.md Section 9 (Course Module Types) for module requirements
- SPEC.md Section 11 (Course Creation Sources) for file/URL support

## Verdict

> Write PASS or FAIL with justification.

### If FAIL -- Issues Format

| # | Severity | File | Line | Issue | Suggested Fix |
|---|----------|------|------|-------|---------------|

## Artifacts

- Report: `artifacts/8-1v/tester_output.md`

## Exit Criteria

- All checklist items verified
- Verdict: PASS or FAIL with justification
- If FAIL: issues table populated with actionable items