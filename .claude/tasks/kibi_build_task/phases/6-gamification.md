# Phase 6: Gamification (XP, Streaks, Badges)

## Role

`developer` -- Frontend + backend gamification

## Objective

Implement the full gamification system: XP awards, levels, streaks, badges, knowledge map visualization, and mastery dashboard.

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | Gamification requirements |
| 2 | src/lib/stores/progress-store.ts | Progress state |
| 3 | src/app/(dashboard)/profile/page.tsx | Profile with XP display |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | Gamification | duolingo-xp-streak | XP and streak system reference |
| R2 | Badge System | badge-ui-patterns | Badge display and unlock patterns |

## Tasks

1. **Implement XP system**
   - XP awards table:
     - Complete lesson: 10 XP
     - Pass quiz: 25 XP
     - Score above 90%: +15 bonus
     - Complete flashcard review: 10 XP
     - Submit project: 50 XP
     - Master a concept: 30 XP
     - Master a unit: 100 XP
     - Complete course: 500 XP
     - Maintain daily streak: 20 XP
   - Create `src/lib/gamification/xp.ts`
   - API: POST `/api/xp/award` (internal)

2. **Implement leveling system**
   - Level thresholds: 1 (0), 2 (100), 3 (250), 4 (500), 5 (1000), 10 (5000), 25 (25000), 50 (100000)
   - Global XP across all courses
   - Create `src/lib/gamification/levels.ts`
   - Display level progress bar

3. **Implement streak system**
   - Track daily meaningful activity
   - Streak freeze/protection (future)
   - Current streak and longest streak
   - API: GET `/api/users/[id]/streak`

4. **Implement badge system**
   - Badges: First Course Created, First Unit Mastered, 7-Day Streak, Quiz Master, Flashcard Beast, Project Finisher, Fast Learner, Comeback Learner, Deep Focus, Course Creator, Public Course Published
   - Create `src/lib/gamification/badges.ts`
   - Badge unlock logic per activity
   - API: GET `/api/users/[id]/badges`

5. **Create knowledge map visualization**
   - Visual node graph of concepts
   - Color coding by mastery level
   - Show prerequisites and relationships
   - Interactive: click to see concept details
   - Create `src/components/gamification/knowledge-map.tsx`
   - Page: `/courses/[id]/mastery`

6. **Create mastery dashboard**
   - Overall mastery score
   - Concept breakdown
   - Strong vs weak areas
   - Learning speed per concept
   - Recommended review plan
   - Page: `/courses/[id]/mastery`

7. **Update XP events tracking**
   - Store all XP events in `xp_events` table
   - Event types: lesson_complete, quiz_pass, flashcard_review, concept_mastered, unit_mastered, course_completed, streak_bonus
   - Metadata: course_id, lesson_id, quiz_id, concept_id, score, bonus

## Constraints

- XP must be tracked persistently
- Streak calculation must be accurate (timezone-aware)
- Badges unlock immediately when criteria met
- Knowledge map must render efficiently for large concept graphs

## Exit Criteria

- [ ] XP awards correctly on all activities
- [ ] Level progresses with XP accumulation
- [ ] Streak tracks daily meaningful activity
- [ ] Badges unlock and display correctly
- [ ] Knowledge map visualizes concept mastery
- [ ] Mastery dashboard shows all required information

## Artifacts

- Report: `artifacts/6-1e/developer_output.md`
- Additional: Gamification library, XP/streak/badge systems, knowledge map

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`