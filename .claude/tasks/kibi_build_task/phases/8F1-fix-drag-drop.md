# Phase 8F1: Fix Drag-Drop and File Upload (Iteration 1)

## Agent

`developer`

## Original Phase

`phases/8-advanced-modules.md`

## Issues to Fix

> From verification report: `artifacts/8-1v/tester_output.md`

| # | Severity | Issue | Suggested Fix |
|---|----------|-------|---------------|
| 1 | High | Project submission lacks file upload - only Textarea exists | Add file upload capability to project submission page with supported types (PDF, DOCX, TXT, ZIP) |
| 2 | Medium | Drag-and-drop UI has no drag event handlers - says "drag and drop" but only click works | Add onDragEnter, onDragOver, onDrop handlers to the drop zone in create/page.tsx |

## Files to Fix

- `src/app/(dashboard)/courses/[id]/project/[projectId]/page.tsx` - Add file upload component
- `src/app/(dashboard)/create/page.tsx` - Implement drag event handlers

## Constraints

- Fix ONLY the listed issues
- Use existing shadcn/ui components where possible
- Keep drag-drop consistent with existing upload UX

## Exit Criteria

- Project submission page supports file upload
- Drag-and-drop actually works on file upload zones