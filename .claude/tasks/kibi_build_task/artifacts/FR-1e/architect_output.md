# Architecture Review: Kibi

## Context
**Scope:** Full-stack Next.js learning platform with AI-powered course generation
**Constraints:** PostgreSQL backend, MiniMax AI, InsForge backend, JWT auth

## Component Analysis

| Component | Pattern | Quality | Issues |
|-----------|---------|---------|--------|
| Next.js App Router | Route Groups | ✅ Good | - |
| TypeScript | Strict Mode | ✅ Good | - |
| shadcn/ui | Component Library | ✅ Good | - |
| Zustand | State Management | ✅ Good | - |
| MiniMax Integration | AI Abstraction | ✅ Good | - |
| InsForge Client | Backend Proxy | ⚠️ Needs Review | API key exposed client-side |
| PostgreSQL Schema | Database Design | ✅ Good | In-memory repos not connected |
| SSE Streaming | Real-time | ✅ Good | - |
| JWT Auth | Cookie-based | ⚠️ Needs Review | Hardcoded dev secret |

## Findings

| # | Finding | Severity | Impact |
|---|---------|----------|--------|
| 1 | In-memory repositories not connected to PostgreSQL | H | Data not persisted |
| 2 | JWT_SECRET defaults to hardcoded string | H | Security vulnerability |
| 3 | InsForge API key in client-side code | M | Key exposure risk |
| 4 | Level thresholds have inconsistencies (25:25000, 50:100000) | M | Incorrect XP progression |
| 5 | Mock data stores scattered in services | M | Incomplete database integration |

## Detailed Analysis

### 1. Next.js App Router Architecture - ✅ PASS
Route groups `(auth)` and `(dashboard)` properly separate concerns. Layout hierarchy is sound with providers at root level. Dynamic routes follow Next.js conventions.

### 2. TypeScript Strict Mode - ✅ PASS
`tsconfig.json` has `"strict": true` enabled. No implicit any, proper null checks, etc.

### 3. shadcn/ui Components - ✅ PASS
17 UI components properly installed in `@/components/ui`. `components.json` correctly configured with proper aliases. Style is "base-nova".

### 4. Zustand State Management - ✅ PASS
- `useAuthStore`: Auth state with persistence
- `useProgressStore`: XP, level, streak tracking
Both follow proper Zustand patterns with middleware.

### 5. MiniMax Integration - ✅ PASS
`src/lib/ai/minimax.ts` provides clean abstraction:
- Streaming via `chatCompletionStream()` generator
- Retry with exponential backoff
- Proper error types (`MiniMaxError`)
- SSE parsing for MiniMax-specific format

### 6. InsForge Backend Connection - ⚠️ NEEDS IMPROVEMENT
`src/lib/api/client.ts` properly abstracts InsForge, but:
- API key passed to client constructor (exposed in browser bundles)
- Auth token extraction from cookies uses `document.cookie` (should use HttpOnly from server)

### 7. PostgreSQL Schema - ✅ PASS (Design)
`db/migrations/001_initial_schema.sql` is comprehensive:
- 17 tables covering all entities
- Proper indexes on foreign keys and lookups
- Triggers for `updated_at`
- Covers: users, courses, units, modules, lessons, concepts, quizzes, flashcards, progress, mastery, XP, shares, remixes

**Issue:** Schema exists but `src/lib/db/index.ts` uses in-memory Maps, not actual PostgreSQL connection.

### 8. SSE for Streaming - ✅ PASS
Course generation route (`src/app/api/courses/generate/route.ts`) properly implements SSE:
- `ReadableStream` with proper encoding
- SSE format: `data: ${JSON.stringify(...)}\n\n`
- Progress callbacks for real-time updates
- Entity events for early dashboard loading

### 9. JWT Auth with HttpOnly Cookies - ⚠️ NEEDS IMPROVEMENT
`src/lib/auth/jwt.ts` and login route implement correctly:
- HttpOnly, secure, sameSite=lax cookies
- 7-day expiration
- Server-side token verification via `cookies()`

**Issue:** `JWT_SECRET` defaults to `"development-secret-change-me"` if not set.

## Additional Concerns

### Level System Inconsistency
In `src/lib/gamification/levels.ts`:
```
25: 25000  // From spec
50: 100000 // From spec
```
But level 25 should be 25000 (per spec) and level 50 should be 100000 (per spec). However, looking at the progression 1→5→25→50:
- 1: 0
- 5: 1000
- 25: 25000 (5x jump from level 5)
- 50: 100000 (4x jump from level 25)

The interpolation between 5 and 25 (levels 6-24) works, but the jump from 25 to 50 seems inconsistent with earlier progression.

### Incomplete Database Integration
Multiple services use mock in-memory stores:
- `src/lib/mastery/concept-graph.ts` - mock conceptGraph
- `src/lib/tutor/context-builder.ts` - mock stores for mastery/attempts
- `src/lib/db/index.ts` - all in-memory Maps

These should be replaced with actual PostgreSQL queries.

## Recommendations

| # | Recommendation | Effort | Benefit | Trade-off |
|---|----------------|--------|---------|-----------|
| 1 | Replace in-memory repos with Prisma/DB client | M | Data persistence | Migration complexity |
| 2 | Move InsForge API key to server-side only | S | Security | API call restructuring |
| 3 | Move JWT_SECRET to required env var | S | Security | Dev setup documentation |
| 4 | Review level threshold consistency | S | Correct gamification | May affect existing users |
| 5 | Add database connection verification | S | Reliability | Startup check |

## Verdict

**VERDICT: FAIL**

**Justification:**
While the architecture is well-designed and follows best practices, there are critical issues that prevent production readiness:

1. **Data not persisted** - In-memory repositories mean all course data, progress, and user data is lost on restart
2. **Security vulnerabilities** - Hardcoded JWT secret and client-side API key exposure
3. **Inconsistent gamification** - Level/XP system has calculation inconsistencies

The build succeeds and the code structure is sound, but the system cannot function as a real application without database persistence and secure credential management.

**Severity Summary:**
- Critical (H): 2
- Medium (M): 3

The project needs these issues addressed before it can be considered production-ready.
