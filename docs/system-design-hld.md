## Sentri System Design HLD

### Goal

Sentri serves AIT students with a single cross-platform mobile app and a lightweight backend. The architecture is designed for:

- low operational cost
- mobile-first responsiveness on average student phones
- local-first persistence for common flows
- simple horizontal growth as usage expands

### Product Domains

Sentri is split into five functional domains:

1. Authentication and session restore
2. Timetable ingestion and weekly refresh
3. Myspace capture and retrieval
4. Calorie planning and daily tracking
5. Hangout room creation and meeting workflow

### High-Level Architecture

```mermaid
flowchart LR
    A["Expo React Native App"] --> B["Client State + Local Persistence"]
    A --> C["Spring Boot API"]
    A --> D["Native OS Features"]
    D --> D1["Share Sheet"]
    D --> D2["Deep Links"]
    D --> D3["Local Storage"]
    C --> E["PostgreSQL"]
    C --> F["OCR / ML Worker"]
    C --> G["Realtime / RTC Layer (future)"]
```

### Responsibilities By Layer

#### Mobile App

- renders the student experience
- restores last signed-in session and last active page
- keeps lightweight feature state available offline
- defers expensive work until the user opens the feature
- sends only required network requests

#### Spring Boot Backend

- owns user, session, timetable batch, and hangout room records
- validates and normalizes client input
- exposes domain APIs for auth, timetable, and hangout
- handles read-heavy endpoints with cache-friendly patterns

#### PostgreSQL

- stores authoritative user, session, timetable, and hangout data
- uses indexed lookup keys for phone, email, room code, and recent records

#### OCR / ML Worker

- extracts structured timetable data from screenshots
- returns normalized JSON back to the backend

### Runtime Principles

#### Mobile Performance

- mount screens on demand instead of rendering all tabs eagerly
- persist only feature-specific slices of state
- reuse a shared storage layer with memory caching
- keep large screens split into smaller render boundaries
- defer expensive filtering and non-urgent UI work

#### Backend Performance

- separate read and write transaction intent
- cache read-mostly lists such as active rooms and timetable summaries
- index fields used in login, lookup, and sorting
- keep payloads DTO-based and avoid over-fetching

### Primary Data Flows

#### Auth

```mermaid
sequenceDiagram
    participant App
    participant API
    participant DB

    App->>API: signup / login
    API->>DB: create user or validate credentials
    API->>DB: create session
    API-->>App: user profile + session token
    App->>App: persist session token locally
```

#### Weekly Timetable Refresh

```mermaid
sequenceDiagram
    participant App
    participant API
    participant Worker
    participant DB

    App->>API: create timetable batch
    API->>DB: store placeholder batch
    API->>Worker: parse uploaded screenshot
    Worker-->>API: parsed timetable JSON
    API->>DB: save parsed batch + entries
    API-->>App: updated timetable detail
```

#### Hangout Room Link

```mermaid
sequenceDiagram
    participant HostApp
    participant API
    participant DB
    participant GuestApp

    HostApp->>API: create room
    API->>DB: save room record
    API-->>HostApp: room code + deep link
    HostApp->>GuestApp: share link
    GuestApp->>API: join room by code
    API->>DB: update room participant count
    API-->>GuestApp: room details
```

### Scale Strategy

For the current stage, Sentri is optimized for low-cost operation.

- local persistence reduces repeated network calls
- cacheable read endpoints protect the database from hot list traffic
- room, session, and user lookups use indexed fields
- future RTC should be separated from the Spring Boot core so heavy live media does not compete with auth and timetable APIs

### Future Evolution

- replace demo OCR handoff with a real async upload-processing queue
- move Hangout media into a dedicated RTC service such as LiveKit or self-hosted WebRTC SFU
- introduce background sync for timetable freshness reminders
- add search indexing for Myspace OCR text and semantic retrieval
