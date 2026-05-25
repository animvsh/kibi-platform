# Phase 3F1: Fix YouTube Embed (Iteration 1)

## Agent

`developer`

## Original Phase

`phases/3-course-dashboard.md`

## Issues to Fix

> From verification report: `artifacts/3-1v/tester_output.md`

| # | Severity | Issue | Suggested Fix |
|---|----------|-------|---------------|
| 1 | Medium | YouTube embed not implemented - videoUrl field exists but only shows placeholder | Implement YouTube iframe embed using react-youtube or simple iframe. Extract video ID from URL (supports youtube.com/watch?v=... and youtu.be/... formats). |

## Files to Fix

- `src/app/(dashboard)/courses/[id]/lesson/[lessonId]/page.tsx` - Add YouTube iframe rendering when videoUrl exists

## Constraints

- Fix ONLY the listed issue
- Use simple iframe approach (no external dependencies) or install react-youtube if needed
- Handle invalid video URLs gracefully

## Exit Criteria

- YouTube videos render in lesson viewer when videoUrl is present
- Invalid URLs show fallback gracefully
- No existing functionality broken