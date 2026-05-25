status: finished
current_phase: FR
total_phases: 18

# Plan: Kibi - AI-Powered Text-to-Course Learning Platform

> Work ONLY through Task API (TaskCreate/TaskUpdate/TaskList). NEVER read phases/ files.
> After compact: TaskList() -> Read PLAN.md -> continue.

## Meta
| Field | Value |
|-------|-------|
| Created | 2026-05-24 |
| Spec | SPEC.md |
| Knowledge | KNOWLEDGE.jsonl |
| Task Dir | .claude/tasks/kibi_build_task |
| Phases | phases/ |

## KNOWLEDGE Protocol
> Format: `{"ts":"ISO","t":"❌|✅|ℹ️","txt":"...","src":"agent"}`
> Priority: ❌ > ✅ > ℹ️. Only unique, reusable discoveries.

## Completion Criteria
- [ ] User can sign up, generate course from prompt, see dashboard, complete lessons, take quizzes, get mastery scores, be blocked until mastery, receive AI review on failure, earn XP, track progress, ask AI tutor, share course, remix course, resume later
- [ ] Full stack: Next.js + TypeScript + Tailwind + shadcn/ui frontend; InsForge backend on Railway; PostgreSQL database; MiniMax AI
- [ ] Core features: Auth, Course generation, Lesson viewer, Quiz system, Mastery locking, AI Tutor, XP/Streaks/Badges, Sharing, Remixing, File upload, YouTube integration, Creator dashboard

## Agents
### Project Agents
| Agent | Purpose | Model |
|-------|---------|-------|

### Core Agents
| Agent | Purpose |
|-------|---------|
| developer | Implementation, fixes |
| tester | Tests, verification |
| reviewer | Code review, architecture |
| architect | Architecture decisions |
| Explore | Code search, research |
| bc-coordinator | Knowledge extraction, report verification |

## Technology Choices
| Choice | Decision | Rationale | Alternatives |
|--------|----------|-----------|--------------|
| Frontend Framework | Next.js (App Router) | Server components, streaming, API routes built-in | Remix, Astro |
| Language | TypeScript (strict mode) | Type safety critical for complex data models | JavaScript |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development, consistent design | CSS Modules, Styled Components |
| State Management | Zustand | Lightweight, simple store pattern | Redux Toolkit |
| AI Provider | MiniMax | Primary intelligence for all generation/tutoring | OpenAI, Anthropic |
| Backend Platform | InsForge on Railway | Self-hosted, integrated auth/db/storage | Separate Railway + Supabase |
| Database | PostgreSQL (via InsForge) | Relational data, complex queries | MySQL, PlanetScale |
| Real-time | SSE for generation streaming | Simple, built-in to Next.js API routes | WebSocket |
| Auth | JWT in HttpOnly cookies | Secure, stateless | Session-based |

## Role Constraints
<!-- ALL -->
All phases must use TypeScript strict mode
All API routes must validate input and return proper error codes
All AI prompts must be structured for consistent output parsing
<!-- /ALL -->
<!-- DEV -->
Use App Router (not Pages Router)
Use shadcn/ui components (not raw HTML)
Use Zustand for client state
Use SSE for streaming responses
<!-- /DEV -->
<!-- TEST -->
Verify all API endpoints return proper status codes
Verify all auth-protected routes redirect correctly
Verify mastery calculations are deterministic
<!-- /TEST -->
<!-- REVIEW -->
Check for SQL injection in all database queries
Check for prompt injection in AI agent prompts
Check that streaming doesn't leak sensitive data
<!-- /REVIEW -->

## Phase Registry
> Manager: TaskCreate for each row. Description = summary + "Full instructions: phases/{file}"
> Parallel group: tasks in same group can run simultaneously.

| # | Phase File | Agent | Subject | Summary | Artifact Dir | Blocked By | Parallel |
|---|------------|-------|---------|---------|--------------|------------|----------|
| 1 | phases/1-foundation.md | developer | Project Foundation | Set up Next.js, TypeScript, Tailwind, shadcn/ui, InsForge connection, PostgreSQL schema, authentication | 1-1e | - | A |
| 1V | phases/1V-verify-foundation.md | tester | Verify Foundation | Verify project builds, auth works, DB schema correct | 1-1v | 1 | - |
| 2 | phases/2-course-generation.md | developer | Course Generation | Multi-agent pipeline: Intent Analyzer, Curriculum Architect, Lesson/Assessment/Flashcard Generators, streaming UI | 2-1e | 1V | A |
| 2V | phases/2V-verify-course-generation.md | tester | Verify Course Generation | Verify AI agents work, generation streams, course saves | 2-1v | 2 | - |
| 3 | phases/3-course-dashboard.md | developer | Course Dashboard | Course dashboard, path map, lesson viewer, quiz player, progress tracking | 3-1e | 2V | A |
| 3V | phases/3V-verify-course-dashboard.md | tester | Verify Course Dashboard | Verify dashboard displays info, lessons work, quizzes save | 3-1v | 3 | - |
| 4 | phases/4-mastery-engine.md | developer | Mastery Engine | Concept graph, mastery calculation, unit locking, spaced repetition, next best action | 4-1e | 3V | A |
| 4V | phases/4V-verify-mastery-engine.md | tester | Verify Mastery Engine | Verify mastery calc, locking, decay, next action | 4-1v | 4 | - |
| 5 | phases/5-ai-tutor.md | developer | AI Tutor | Context-aware tutor, chat UI, tutor actions, learning state updates | 5-1e | 4V | A |
| 5V | phases/5V-verify-ai-tutor.md | tester | Verify AI Tutor | Verify tutor context, responses, actions | 5-1v | 5 | - |
| 6 | phases/6-gamification.md | developer | Gamification | XP system, levels, streaks, badges, knowledge map, mastery dashboard | 6-1e | 5V | A |
| 6V | phases/6V-verify-gamification.md | tester | Verify Gamification | Verify XP awards, levels, streaks, badges, map | 6-1v | 6 | - |
| 7 | phases/7-sharing-remix.md | developer | Sharing & Remixing | Share links, public pages, remixing, explore, collaboration | 7-1e | 6V | A |
| 7V | phases/7V-verify-sharing-remix.md | tester | Verify Sharing | Verify sharing, public pages, remixing | 7-1v | 7 | - |
| 8 | phases/8-advanced-modules.md | developer | Advanced Modules | Flashcards, projects, file processing, YouTube, creator dashboard | 8-1e | 7V | A |
| 8V | phases/8V-verify-advanced-modules.md | tester | Verify Advanced Modules | Verify flashcards, projects, file upload, YouTube | 8-1v | 8 | - |
| FR | phases/FR-final-review.md | reviewer+tester+architect | Final Review | Final verification against completion criteria | FR-1e | 8V | - |

## Execution Protocol
> After EACH agent: WRITE report -> CALL bc-coordinator (ALWAYS)
> Task API (TaskCreate/TaskUpdate/TaskList) is source of truth. Phase Status table is observability only.

### Task Creation
FOR each row in Phase Registry:
  TaskCreate(subject="Phase {#}: {Subject}", description="Phase {#}: {Summary}\n\nFull instructions: phases/{Phase File}\nTask dir: .claude/tasks/kibi_build_task\nArtifacts: artifacts/{Artifact Dir from Phase Registry}/\nKNOWLEDGE: KNOWLEDGE.jsonl", activeForm="{Present continuous of Subject}")
THEN set dependencies per Blocked By column.

### Execution Loop
1. TaskList() -> find tasks: status=pending, blockedBy=[]
2. Same Parallel group -> spawn in ONE message
3. Per task: TaskUpdate(in_progress) -> Task(agent) -> WRITE report to artifacts/{Artifact Dir from Phase Registry}/ -> CALL bc-coordinator -> TaskUpdate(completed)
4. Repeat while pending tasks remain
5. All completed -> bc-coordinator mode:finalize

### Coordinator Protocol
| Phase | Coordinator Does | Does NOT Do (Task API) |
|-------|-----------------|----------------------|
| Execution (N) | Knowledge extraction, report verification | Status update |
| Verification (NV) | Knowledge extraction, report verification, phase validation | Status update |
| Final Review (FR) | FINAL.md generation, knowledge extraction | Status update |
| Finalize | status -> {finished|failed} (line 1 PLAN.md), FINAL.md generation | - |

### Failure Protocol
When NV finds issues:
1. Write phases/{N}F{I}-fix-{name}.md with issues from verification report
2. TaskCreate(subject="Fix phase {N} issues (iter {I})")
3. TaskCreate(subject="Re-verify phase {N} (iter {I+1})", blockedBy=[fix task])
4. Max 3 iterations -> Escalation

### Escalation
| After | Action |
|-------|--------|
| 1 fail | R&D task: explore root cause |
| 2 fails | Split phase into sub-phases |
| 3 fails | Upgrade model (sonnet->opus), reassign, AskUserQuestion |

### Failure Cascade & Deadlock Recovery
When escalation exhausted (task permanently failed):
1. TaskUpdate(failedTaskId, status="failed")
2. Persist to KNOWLEDGE.jsonl: {"ts":"...","t":"❌","txt":"Phase {N} permanently failed: {reason}","src":"manager"}
3. Cascade failure to ALL transitive dependents: TaskList() -> TaskUpdate(T.id, status="failed") for each blocked task
4. Independent tasks (no dependency on failed task) continue normally
5. Deadlock check: pending+unblocked=0 AND in_progress=0 AND blocked>0 -> abort all blocked, Finalize(status="failed")
6. bc-coordinator mode:finalize with status="failed" generates failure summary in FINAL.md

## Handoff
After compact:
1. TaskList() - current task state
2. Read PLAN.md - protocol and Phase Registry
3. DO NOT read phases/ - they are for agents
4. Continue with current in_progress or next pending task
5. WRITE report -> CALL coordinator after EVERY agent (ALWAYS)

## Reports
| Field | Path |
|-------|------|
| Artifacts | artifacts/ |
| Final | artifacts/FINAL.md |
| Report | artifacts/{P}-{N}{T}/{AGENT}_output.md |

## Phase Status
| # | Status | Started | Completed | Iterations |
|---|--------|---------|-----------|------------|
| 1 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 1V | completed | - | 2026-05-24 | 1 |
| 2 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 2V | completed | - | 2026-05-24 | 2 |
| 2F1 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 3 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 3F1 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 3V | completed | - | 2026-05-24 | 2 |
| 4 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 4V | completed | - | 2026-05-24 | 1 |
| 5 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 5V | completed | - | 2026-05-24 | 1 |
| 6 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 6V | completed | - | 2026-05-25 | 4 |
| 6F1 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 6F2 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 6F3 | completed | 2026-05-24 | 2026-05-24 | 1 |
| 7 | completed | 2026-05-25 | 2026-05-25 | 1 |
| 7V | completed | - | 2026-05-25 | 2 |
| 7F1 | completed | 2026-05-25 | 2026-05-25 | 1 |
| 8 | completed | 2026-05-25 | 2026-05-25 | 1 |
| 8V | completed | - | 2026-05-25 | 2 |
| 8F1 | completed | 2026-05-25 | 2026-05-25 | 1 |
| FR | completed | - | 2026-05-25 | 1 |