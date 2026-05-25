# Phase 7: Sharing & Remixing

## Role

`developer` -- Backend + frontend sharing features

## Objective

Implement course sharing (public/private/unlisted), share links, remixing with personalization, and public course exploration pages.

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | Sharing and remixing requirements |
| 2 | src/app/course/[slug]/page.tsx | Public course page |
| 3 | src/app/share/[token]/page.tsx | Shared course view |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | Sharing | notion-share | Share link patterns |
| R2 | Remixing | github-fork | Fork/remix pattern reference |

## Tasks

1. **Implement share link generation**
   - Generate unique share tokens
   - Visibility modes: private, unlisted, public, invite-only, collaborative
   - Create `src/lib/sharing/share-service.ts`
   - API: POST `/api/courses/[id]/share`

2. **Create share API routes**
   - GET `/api/share/[token]` - Get shared course data
   - POST `/api/courses/[id]/invite` - Generate invite link
   - POST `/api/courses/[id]/duplicate` - Duplicate for self

3. **Create public course page**
   - Display: title, description, creator, difficulty, estimated time
   - Show: module list, preview lessons
   - Show: learner count, start button, remix button
   - Create `src/app/course/[slug]/page.tsx`
   - SEO: proper meta tags, Open Graph

4. **Create shared course view**
   - View course without account (limited)
   - "Start this course" → redirect to signup/login
   - Create `src/app/share/[token]/page.tsx`

5. **Implement course remixing**
   - When user remixes, ask personalization questions:
     - What is your level?
     - What is your goal?
     - How much time do you have?
     - Easier or harder?
     - More quizzes or projects?
   - Create personalized copy of course
   - Track remix count
   - API: POST `/api/courses/[id]/remix`

6. **Create course exploration page**
   - Browse public courses
   - Filter by: category, difficulty, duration, popularity
   - Search functionality
   - Create `src/app/explore/page.tsx`

7. **Implement collaboration features**
   - Invite collaborators to course
   - Permission levels: edit, add_modules, review, view_analytics, manage_publishing
   - API: POST `/api/courses/[id]/invite-collaborator`

## Constraints

- Share tokens must be unguessable (UUID v4)
- Private courses only accessible to owner
- Remix creates independent course (no live sync)
- Public course pages must be SEO-friendly

## Exit Criteria

- [ ] Share links generate and work correctly
- [ ] Public course page displays with all info
- [ ] Remixing personalizes course copy
- [ ] Explore page shows public courses
- [ ] Collaboration invites work

## Artifacts

- Report: `artifacts/7-1e/developer_output.md`
- Additional: Sharing service, public pages, remixing flow

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`