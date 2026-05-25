# Phase 4: Mastery Engine

## Role

`developer` -- Backend logic and algorithms

## Objective

Implement the mastery-based learning system: concept graph, mastery score calculation, unit locking rules, next best action system, and weak concept detection with adaptive remediation.

## Context Files

| # | File | Why |
|---|------|-----|
| 1 | SPEC.md | Mastery system requirements, unlock rules |
| 2 | src/lib/stores/progress-store.ts | Progress state management |
| 3 | src/app/api/courses/[id]/mastery/route.ts | Mastery API |

## References

| # | Type | File | Description |
|---|------|------|-------------|
| R1 | Spaced Repetition | sm2-algorithm | Spaced repetition algorithm for mastery decay |
| R2 | Mastery Systems | duolingo-mastery | Mastery-based progression reference |

## Tasks

1. **Create concept graph system**
   - Define concepts per course with prerequisites
   - Track concept relationships (prerequisite, related, core)
   - Create `src/lib/mastery/concept-graph.ts`
   - Store concept data in `concepts` and `lesson_concepts` tables

2. **Implement mastery score calculation**
   - Factors: quiz scores, attempts, time per question, confidence, flashcard performance
   - Calculate per-concept mastery: 0-100 scale
   - Status levels: Not Learned (0-29), Familiar (30-49), Developing (50-69), Proficient (70-84), Strong (85-94), Mastered (95-100)
   - Create `src/lib/mastery/calculator.ts`

3. **Implement unit unlock rules**
   - Check: average required concept mastery >= 85
   - Check: no critical concept below 75
   - Check: mastery check score >= 80
   - Check: required activities completed
   - If locked: generate remediation path
   - Create `src/lib/mastery/unlock-rules.ts`

4. **Implement mastery decay (spaced repetition)**
   - Concepts decay over time without review
   - Schedule review based on SM-2 algorithm
   - Update `next_review_at` after each practice
   - Create `src/lib/mastery/spaced-repetition.ts`

5. **Create next best action system**
   - After each activity, compute optimal next action
   - Actions: continue lesson, take quiz, review weak concept, practice more, ask tutor, regenerate simpler version
   - Based on: current mastery, weak concepts, learning speed, user preferences
   - Create `src/lib/mastery/next-action.ts`
   - API: GET `/api/courses/[id]/next-best-action`

6. **Create adaptive remediation generation**
   - When user fails or struggles, generate:
     - Simpler explanation
     - Additional flashcards
     - More practice questions
     - Review lesson
   - Integrate with MiniMax for content generation
   - Create `src/lib/mastery/remediation.ts`

7. **Create mastery API routes**
   - GET `/api/courses/[id]/mastery` - Get overall mastery scores
   - GET `/api/courses/[id]/knowledge-map` - Get visual knowledge map data
   - POST `/api/courses/[id]/recalculate-mastery` - Recalculate after activity
   - GET `/api/concepts/[id]/mastery` - Get specific concept mastery

8. **Update quiz attempt flow**
   - On quiz completion, calculate concept mastery impact
   - Update `user_concept_mastery` table
   - Check unlock conditions
   - Award XP with bonus for high scores

## Constraints

- Mastery calculation must be deterministic (same input = same output)
- Unlock checks must be atomic (no race conditions)
- Decay calculation runs on read or background job
- API responses include mastery delta (before/after)

## Exit Criteria

- [ ] Concept mastery scores calculate correctly from quiz performance
- [ ] Unit locking enforced - cannot access next unit without mastery
- [ ] Weak concepts identified and surfaced to user
- [ ] Next best action returns appropriate recommendation
- [ ] Remediation generated when user fails单元
- [ ] Mastery decay works over time without review

## Artifacts

- Report: `artifacts/4-1e/developer_output.md`
- Additional: Mastery library, unlock system, remediation logic

## Knowledge Guidelines

- Extract 3-10 entries per phase
- Priority: `❌` (errors/anti-patterns) > `✅` (confirmed patterns) > `ℹ️` (context)
- Format: `{"ts":"...","t":"❌|✅|ℹ️","txt":"...","src":"developer"}`