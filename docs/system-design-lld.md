## Sentri System Design LLD

### Scope

This document translates the high-level architecture into concrete modules, responsibilities, and performance-sensitive decisions in the current codebase.

### Mobile LLD

#### App Shell

- `App.tsx`
  - restores session token
  - restores last active tab
  - resolves deep links
  - owns drawer, account sheet, and Sentri sheet visibility

Target design:

- app shell should mount only the active tab at startup
- additional tabs should mount on first visit and stay warm after that
- global overlays should stay outside page trees so screen rerenders do not repaint the entire shell

#### Shared Storage Layer

- `src/lib/auth-storage.ts`
- `src/lib/device-store.ts`

Target design:

- one thin storage abstraction
- memory cache in front of AsyncStorage
- shared persistent key registry
- reusable hook for hydrated feature state

#### Feature Screens

- `HomeScreen`
  - timetable view mode
  - refresh prompt
  - staged upload metadata

- `MyspaceScreen`
  - search query
  - saved board items
  - staged capture flow

- `CalorieScreen`
  - setup profile
  - meals and burns
  - computed calorie totals

- `HangoutScreen`
  - room list
  - active room
  - meeting shell state

Optimization rule:

- each screen should persist only the state that matters after app restart
- derived values should stay computed, not stored

### Backend LLD

#### Controllers

- `AuthController`
- `TimetableBatchController`
- `HangoutRoomController`

Controller rule:

- controllers stay thin
- validation and domain rules remain in services
- DTOs isolate transport shape from entities

#### Services

- `AuthServiceImpl`
- `TimetableBatchServiceImpl`
- `HangoutRoomServiceImpl`

Performance rule:

- reads use `readOnly` transactions
- mutations explicitly evict stale caches
- repeated lookup paths normalize input before touching the database

#### Repositories

- `UserAccountRepository`
- `AuthSessionRepository`
- `TimetableBatchRepository`
- `TimetableEntryRepository`
- `HangoutRoomRepository`

Performance rule:

- repository methods should reflect indexed access paths
- fetch joins are used only when the response truly needs nested collections

### Domain Model Notes

#### User and Session

- `user_accounts`
  - lookup by normalized phone or normalized email
- `auth_sessions`
  - lookup by session token
  - join to user for session restore

#### Timetable

- `timetable_batches`
  - ordered by recent creation or current effective week
- `timetable_entries`
  - ordered by `sortOrder`, then start time

#### Hangout

- `hangout_rooms`
  - lookup by `roomCode`
  - read-mostly list of active rooms

### Current Hot Paths

#### Mobile Hot Paths

1. app boot
2. tab switching
3. Myspace search typing
4. Hangout screen updates during meeting mode
5. repeated AsyncStorage reads and writes

#### Backend Hot Paths

1. login by email or phone
2. session restore
3. active hangout room list
4. room lookup by code
5. timetable batch list and batch detail

### Optimization Decisions

#### Why local persistence is important

Student workflows are bursty and intermittent. Local persistence reduces:

- repeated login friction
- repeated refetch of unchanged local-only UI state
- recomputing feature state after every Expo reload during development

#### Why cacheable list endpoints matter

Room lists and timetable summaries are read far more often than they are written. Caching these lists:

- reduces repeated database sorting work
- protects the database when many students open the same screen
- gives consistent response times on smaller hardware

#### Why on-demand screen mounting matters

The current app has a few large screens with substantial local state. Mounting all pages immediately:

- increases startup work
- allocates unnecessary memory
- makes app shell rerenders more expensive

### Target Request Contracts

#### Auth Session Restore

- request header: `Authorization: Bearer <token>`
- response: lightweight user profile and session token echo

#### Hangout Room List

- request: unauthenticated `GET`
- response: compact room summary list
- cache strategy: cache active list, evict on create or join

#### Timetable Batch Summary

- request: authenticated or open `GET` depending product policy
- response: metadata and entry count, not full OCR text
- cache strategy: cache summaries, evict on create/import

### Observability Hooks To Add Later

- API timing logs by controller path
- screen mount timing in development
- storage hit and miss metrics in debug builds
- room join/create counters

### Near-Term Engineering Priorities

1. centralize storage persistence and reduce duplicate AsyncStorage code
2. mount tabs lazily and preserve them after first access
3. use deferred search rendering for Myspace
4. add backend cache boundaries and eviction rules
5. add indexes for normalized identifiers and active room lookups
