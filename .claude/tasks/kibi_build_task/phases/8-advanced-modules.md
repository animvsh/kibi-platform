# Phase 8: Advanced Modules & File Processing

## Role

`developer` -- Full-stack feature implementation

## Objective

Implement advanced module types (flashcards, projects, case studies), file upload processing (PDF, DOCX, PPTX), YouTube transcript extraction, and creator dashboard with analytics.

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | Advanced module and file processing requirements |
| 2 | src/app/api/courses/generate/route.ts | Generation endpoint to extend |
| 3 | src/app/(dashboard)/courses/[id]/flashcards/page.tsx | Flashcard study page |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | File Upload | upload-s3-presigned | File upload with presigned URLs |
| R2 | PDF Parsing | pdf-parse-node | PDF text extraction |

## Tasks

1. **Implement flashcard system**
   - Flashcard types: Term→definition, Concept→example, Formula→usage, Question→answer, Code→explanation, Scenario→solution
   - Spaced repetition review (SM-2)
   - Rating: Again, Hard, Good, Easy
   - Create `src/app/(dashboard)/courses/[id]/flashcards/page.tsx`
   - Create `src/components/flashcards/flashcard-study.tsx`
   - API: GET `/api/courses/[id]/flashcards`, POST `/api/flashcards/[id]/review`

2. **Implement project module**
   - Project brief, goals, steps, deliverables, rubric
   - AI feedback on submissions
   - Retry option
   - Create `src/app/(dashboard)/courses/[id]/project/[projectId]/page.tsx`
   - API: POST `/api/assignments/[id]/submit`

3. **Implement case study module**
   - Scenario, background, questions, analysis
   - Model answer reveal after submission
   - Reflection prompts
   - Create `src/app/(dashboard)/courses/[id]/case-study/[id]/page.tsx`

4. **Implement file upload processing**
   - PDF: Extract text, create lessons, generate quizzes
   - DOCX: Parse content, extract structure
   - PPTX: Extract slides as content
   - TXT/Markdown: Direct content processing
   - CSV: Structured data to flashcards
   - Create `src/lib/files/file-processor.ts`
   - Upload flow: presigned URL → process → generate course

5. **Implement YouTube integration**
   - Extract transcript via YouTube API
   - Generate lessons from transcript
   - Create timestamped quizzes
   - Generate flashcards from key concepts
   - Create `src/lib/video/youtube-extractor.ts`
   - API: POST `/api/courses/generate` with youtube_url

6. **Create creator dashboard**
   - Total courses created
   - Total learners
   - Average completion rate
   - Most difficult concepts
   - Most popular courses
   - Public/private status
   - Remix count
   - Create `src/app/(dashboard)/creator/page.tsx`
   - API: GET `/api/creator/analytics`

7. **Add file-to-course generation**
   - Extend generation pipeline to accept file upload
   - Process and extract content
   - Generate course from extracted content
   - Create `src/app/(dashboard)/create/page.tsx` with file upload

## Constraints

- File uploads limited to 50MB
- YouTube transcripts require valid video ID
- Processing should be async (not blocking)
- Store original files for reference

## Exit Criteria

- [ ] Flashcard study with spaced repetition works
- [ ] Project submission and AI feedback works
- [ ] PDF/DOCX/PPTX upload extracts content correctly
- [ ] YouTube video generates course with transcript lessons
- [ ] Creator dashboard shows analytics

## Artifacts

- Report: `artifacts/8-1e/developer_output.md`
- Additional: File processor, flashcard system, YouTube extractor, creator dashboard

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`