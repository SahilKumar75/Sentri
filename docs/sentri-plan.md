# Sentri Zero-Budget Product And Technical Plan

## 1. Ground Reality

`Sentri` is for Army Institute of Technology students.

The hard constraints are:

- `0 budget`
- one mobile codebase for both `iPhone` and `Android`
- backend should be in `Java` or `Go`
- no dependency on college admin approvals
- target can grow up to roughly `500 students`

Because of that, Sentri must be designed as:

- `screenshot first`
- `offline friendly`
- `low infra`
- `open source only`
- `campus specific before generic`

## 2. Most Important Product Decision

Do not build Sentri as a general super app first.

Build it first as:

- `AIT timetable companion`
- `student memory vault`
- `simple Indian fitness tracker`

That is the realistic path.

## 3. What Not To Depend On

Do not depend on:

- Microsoft Graph
- Outlook admin consent
- paid OCR APIs
- paid vector databases
- paid calorie APIs
- heavy GPU inference
- watch-party infrastructure in V1

Those things either cost money, add risk, or both.

## 4. Recommended Stack Under Your Constraints

## Mobile

- `React Native + Expo + JavaScript`
- one app for iOS and Android
- `expo-sqlite` for local cache and offline data
- `Expo Router` for navigation

Why this still fits:

- one codebase
- fast to ship
- good sharing support from screenshots/files
- local storage support is strong

## Backend

Recommended choice:

- `Go` for the backend API and processing workers

Second choice:

- `Java` if you strongly prefer it and will move faster in it

My honest recommendation:

- if you care most about lowest RAM and easiest self-hosting, use `Go`
- if you care most about your own speed and confidence, use `Java`

For zero budget, developer speed matters more than theory.
So if Java is where you are strongest, choosing Java is valid.

## Backend Framework Choice

If `Go`:

- `Gin` or `Fiber`

If `Java`:

- `Spring Boot` if you already know it
- `Javalin` if you want something lighter and simpler

For Sentri, `Javalin + PostgreSQL` is actually a very good zero-budget choice if you want Java without too much framework weight.

## Database

- `PostgreSQL`

Why:

- fully open source
- great for relational data like timetable rows
- can support full-text search
- reliable and proven

## File Storage

- local filesystem first
- `MinIO` later if needed

Why:

- zero money means avoid fancy object storage early
- timetable screenshots and saved notes can be stored on disk initially

## Search

Start with:

- `PostgreSQL full-text search`

Do not start with:

- vector DB
- RAG pipelines
- semantic embeddings

Why:

- your first search problem is mostly OCR text retrieval, not advanced AI reasoning
- keyword search is enough for V1
- RAG is useful later, but it is not the first thing that makes Sentri valuable

## OCR

Recommended:

- `Tesseract` first
- `PaddleOCR` only if Tesseract is not good enough

Why:

- Tesseract is simpler to start with
- no paid API
- enough for printed timetable screenshots like the sample you shared

Important principle:

- use `OCR + deterministic parsing` first
- do not jump to LLM extraction first

For your timetable screenshot, structured parsing will likely work better and cheaper than "ML or RAG" wording suggests.

## Notifications

- local notifications first
- push notifications later

Why:

- for timetable reminders, local scheduled notifications may already solve the main problem
- push infra can wait

## 5. Realistic Capacity Planning

One important truth:

`500 students total` is realistic on zero budget.

`500 students active at the exact same time` with strong reliability is not truly zero-cost unless you already have free hardware or institutional hosting.

So Sentri should be designed for:

- `500 registered users`
- `light to moderate concurrent usage`
- `very low server load` because the app caches data locally

That is possible.

The way to make zero budget work is:

- keep timetable data small
- keep search local when possible
- precompute extracted data once
- avoid continuous real-time features
- avoid large media streaming

## 6. Best Zero-Budget Deployment Strategy

### Stage 1: local/private beta

Run on:

- your own laptop
- an old desktop
- a spare mini PC

Use this for:

- 10 to 30 testers
- parser improvement
- schema validation

### Stage 2: wider campus beta

Move to:

- one cheap self-hosted machine if available
- or any free compute you already personally have access to

Important:

- do not design around free-tier promises
- design around software that can move anywhere

## 7. Best MVP Now

Build only these:

1. `Share timetable screenshot to Sentri`
2. `Parse it into clean schedule`
3. `Show now/next/today/weekly view`
4. `Set reminders`
5. `Save screenshots/notes/links and search them`

Do not build calorie tracker first if timetable parser is not working.

Reason:

- timetable is the strongest campus painkiller
- if that works well, students will trust the app

## 8. Why Screenshot Sharing Is The Right Decision

Your new idea is correct.

Instead of waiting for Outlook or Graph access, do this:

1. student opens mail
2. student takes screenshot
3. student taps `Share`
4. student sends image to `Sentri`
5. Sentri extracts timetable details
6. Sentri converts it into structured classes

This is better because:

- no admin dependency
- works immediately
- matches current student behavior
- keeps the product under your control

This is exactly the type of flow strong student products use:
meet people where they already are.

## 9. AIT Timetable Structure You Need To Support

From your description, timetable parsing must understand these dimensions:

- `year`: first, second, third, fourth
- `branch`: CS, IT, ENTC, Mechanical, ARE
- `pattern`: autonomous, NEP 2024, 2019 credit pattern
- `semester`
- `division`: for example `SE IT-B`
- `effective from`: for example `23 March 2026`
- `venue`

Also, each timetable image may contain:

- fixed time slots
- weekdays
- lecture blocks
- lab blocks
- tutorial blocks
- holiday cells
- break columns
- faculty initials in brackets
- room/library/lab references
- merged cells across multiple time slots
- multilingual text, including Marathi/Hindi content in some cells

This means the parser should not think only in terms of plain text.
It must think in terms of `grid + OCR + rules`.

## 10. How To Parse The Timetable Screenshot

Use a 3-step pipeline:

### Step 1: OCR text extraction

Extract:

- heading text
- class/division text
- semester/year text
- venue
- dates
- cell contents

### Step 2: timetable grid parsing

Detect:

- horizontal and vertical lines
- day rows
- time columns
- break columns
- merged cells

### Step 3: rule-based normalization

Convert OCR text into structured fields:

- subject code or short name
- faculty initials
- room/lab/library
- assignment/tutorial note
- day of week
- start time
- end time

For the sample image, a robust parser should identify these kinds of values:

- `Class: SE IT-B`
- `Academic Year: 2025-26`
- `Semester: SEM II`
- `Week Effective From: 23 March 2026`
- day columns such as `MON`, `TUES`, `WED`, `THU`, `FRI`
- time slots such as `8.45-9.45`, `9.45-10.45`, `11.00-12.00`
- special columns such as `BREAK`
- cells containing one or more of subject, faculty, room, note

## 11. Why RAG Is Not The First Answer Here

RAG is useful when:

- you have lots of text documents
- you want question answering over that data

Your timetable problem is different.

This is mainly:

- OCR
- layout parsing
- structured extraction

So the right order is:

1. `OCR + parser`
2. `manual correction UI`
3. optional AI help later

If you skip directly to LLM extraction, you may spend more money and get less reliable output.

## 12. The Secret To Making OCR Reliable

Do not try to make extraction 100 percent automatic in V1.

Instead:

- prefill all detected classes
- let the user edit wrong cells quickly
- let the user save the corrected version

That is the winning move.

Students will accept:

- 80 to 90 percent automatic extraction

They will hate:

- 100 percent automatic claim with silent mistakes

## 13. Suggested Data Model For Timetable

Core entities:

- `student_profile`
- `timetable_batch`
- `timetable_entry`
- `branch`
- `academic_pattern`
- `semester`
- `division`

Suggested `timetable_batch` fields:

- `id`
- `owner_user_id`
- `year_label`
- `branch_label`
- `division_label`
- `semester_label`
- `academic_pattern_label`
- `effective_from`
- `venue`
- `source_image_path`
- `ocr_status`
- `is_verified`
- `created_at`

Suggested `timetable_entry` fields:

- `id`
- `batch_id`
- `day_of_week`
- `start_time`
- `end_time`
- `subject_name`
- `faculty_code`
- `room_label`
- `entry_type`
- `note_text`
- `raw_cell_text`
- `is_break`
- `is_holiday`

## 14. Search For Memory Vault Without Expensive AI

For screenshots, notes, and links:

1. extract text
2. store original file path
3. store extracted text in Postgres
4. use full-text search
5. allow tags and filters

This gives you useful search without vector embeddings.

Later, if you want semantic search, you can add it.
Do not start there.

## 15. Calorie Tracking Under Zero Budget

This should be simple, not research-heavy.

Use:

- your own curated Indian student food list
- reusable meal templates
- user-created custom foods

Optional later:

- barcode lookup using open food databases

Do not try to solve all Indian nutrition accuracy at launch.
Start with:

- useful estimates
- common hostel meals
- gym staples like eggs, paneer, oats, milk, rice, dal, chicken, whey

## 16. Features To Explicitly Delay

Delay these:

- teleparty style watch rooms
- real-time face and voice chat
- sync video playback
- advanced RAG
- campus-wide live presence

Why:

- these are infra heavy
- they are harder to operate on zero money
- they do not solve the core academic pain first

## 17. Actual MVP Architecture

### On the phone

- Expo app
- local SQLite cache
- share target for screenshots/files
- reminder scheduling

### On the server

- Java or Go API
- PostgreSQL
- local file storage
- OCR worker

### Processing flow

1. image uploaded from phone
2. server stores image
3. OCR worker extracts text
4. parser converts cells into structured class entries
5. app fetches normalized timetable
6. app stores it locally for offline use

## 18. A Strong Engineering Principle For Sentri

Sentri should prefer:

- `rules before AI`
- `local before cloud`
- `cache before refetch`
- `manual correction before perfect automation`
- `campus utility before social extras`

That is how you make this possible with almost no money.

## 19. Final Recommendation

If I were building this under your constraints, I would choose:

- mobile: `Expo React Native`
- backend: `Go` or `Java with Javalin`
- database: `PostgreSQL`
- OCR: `Tesseract` first
- search: `Postgres full-text search`
- storage: local disk first

And the very first release would do only this:

- accept a timetable screenshot via share sheet
- extract and clean the weekly schedule
- show now/next/today
- remind before class
- let students save and search screenshots/notes

## 20. Immediate Next Steps

Do these next:

1. collect `15 to 20` real timetable screenshots from different years and branches
2. list all branch/year/division naming variations used by AIT
3. decide `Go` or `Java`
4. define the timetable parser output JSON format
5. build only the timetable ingestion flow first
