# Sentri Design Guideline

## 1. Product Intent

Sentri should feel like a calm student operating system for AIT, not a startup dashboard.

The app must balance:

- `iOS-native structure`
- `Notion-like calm palette`
- `Google Keep style capture grid in Myspace`
- `Apple Health style summary + trends in Calorie`
- `Google Meet style room creation and link sharing in Hangout`

The product should prioritize fast student utility over decorative UI.

## 2. Official Reference Principles

Based on Apple Human Interface Guidelines:

- build clear `hierarchy`
- keep visual and behavioral `consistency`
- reduce onscreen clutter so people can focus on primary tasks
- use familiar navigation patterns and discoverable secondary actions
- support quick, high-frequency interactions on iPhone

Implications for Sentri:

- top-level screens should answer one main question quickly
- the first screen state must be useful without scrolling
- large decorative hero cards should be avoided
- lists, grouped sections, sheets, and simple controls should do most of the work

## 3. Visual Language

### Tone

- calm
- practical
- modern
- slightly warm
- private

### Palette

Primary direction:

- mostly light iOS-neutral backgrounds
- soft warm paper tint for larger surfaces
- Sentri orange only as an accent
- subtle greens/blues only for data state, never as competing themes

### Typography

- default to iOS-like hierarchy
- large title for top-level screens
- bold but not shouty section headers
- body copy should be compact and low-noise
- avoid excessive all-caps labels

### Surfaces

- fewer card styles
- reduced shadow use
- grouped list sections over oversized dashboard blocks
- timeline rows and document-style cells should be the default

## 4. Navigation Model

Top-level tabs:

- `Home`
- `Myspace`
- `Calorie`
- `Hangout`

Special action:

- middle `Sentri` button stays in the bottom bar for now
- tapping it currently does nothing

Profile/settings:

- circular profile picture at top left
- tap opens side drawer
- drawer items:
  - account
  - settings
  - logout

Bottom bar:

- capsule-shaped
- visually inspired by polished iOS floating tab bars
- must still clearly communicate the four real destinations

## 5. Screen-by-Screen Rules

## Home

Purpose:

- daily academic command center

Above the fold:

1. profile avatar
2. `Current + Next` class card
3. view mode switch:
   - `Today`
   - `Week`
   - `Month`

Current + Next card requirements:

- show current class if active
- show next class clearly
- example structure:
  - `Next class`
  - `Starts in 5 min`
  - `DBMS`
  - `LH 19`
  - `Prof. X`

Timeline area:

- should feel like a mix of order-tracking progression and calendar structure
- compact, readable, vertical
- each row shows:
  - subject
  - time
  - room
  - teacher
  - type when relevant

Interaction:

- tap a class row opens a pressed-state detail card
- long press can reveal richer actions/details later

Week mode:

- schedule overview across the week
- compact enough to scan patterns quickly

Month mode:

- full calendar month grid
- each day cell can show small text items like:
  - exam
  - deadline
  - interview
  - hackathon registration
- tapping a date opens that chosen date in the same day-view/today-style mode

Weekly timetable freshness:

- must support visible states:
  - no timetable
  - current week valid
  - Saturday refresh due
  - uploaded
  - parsing
  - needs correction
  - ready

## Myspace

Purpose:

- personal capture + retrieval workspace

Top area:

- full-width search bar

Primary action:

- floating `+` button near the bottom

Add options:

- image
- file
- link
- note
- screenshot

Layout:

- Google Keep style grid of saved items
- lightweight cards
- mixed content types
- visual but still metadata-aware

Search behavior:

- dynamic and associative
- not just exact text match
- should surface items by:
  - OCR text
  - subject relation
  - object/context like `blackboard`
  - upload date
  - meaning and related concept like `math`

What to borrow from mymind:

- frictionless capture
- calm tone
- automatic enrichment
- associative retrieval

What not to copy from mymind:

- zero structure
- hidden metadata
- purely visual browsing

Required default organization:

- recents
- pinned
- subjects
- suggested resurfacing

Default subject chips unless user customizes later:

- `DBMS`
- `OS`
- `CG`
- `P&S`
- `PM`
- `Placement`
- `Personal`
- `Fitness`

## Calorie

Purpose:

- Apple Health style health and nutrition tracker with student fitness needs

First-run onboarding:

- age
- height
- weight
- optional body measurements:
  - waist
  - thigh
  - neck
- current body type
- goal:
  - lose weight
  - maintain
  - bulk
- ideal body type
- goal weight
- journey duration

System behavior:

- calculate daily calorie target from the chosen journey
- allow manual calories burned from:
  - gym
  - running
  - walking
- support cheat day planning:
  - 1 day a week
  - 2 days a week
  - choose exact day like Friday or Sunday

Visual direction:

- Apple Health inspired
- cleaner summaries
- trends and pinned metrics
- not a loud gym app

Main sections:

1. today summary
2. remaining target
3. macros
4. meals
5. calories burned
6. trends
7. cheat-day planning

## Hangout

Purpose:

- room-based student coordination with a Meet-like feel

Top actions:

- `Join room`
- `Create room`

Create-room behavior:

- generate a shareable link
- expose share action clearly

Friends area:

- added friends list at the bottom
- online/offline dot status
- allow inviting friends into room

Visual direction:

- cleaner, Meet-like utility
- not a social feed
- not media-heavy on the main screen

Main sections:

1. join/create actions
2. active room summary if any
3. shareable room link card
4. friends list

## Sentri Button

- keep the button in the middle nav bar
- tapping currently does nothing
- design should leave room for a future assistant surface

## 6. Interaction Rules

- one primary job per screen
- one obvious primary CTA per screen
- secondary actions should stay visually quieter
- tap should reveal more detail in-place where useful
- empty states must be first-class, not afterthoughts

Every major screen needs:

- `empty`
- `loading`
- `error`
- `success`

## 7. What To Avoid

- oversized marketing hero cards
- too much explanatory copy
- multiple competing color stories
- decorative widgets with no immediate utility
- equal visual weight for all sections
- noisy shadows and gradients everywhere

## 8. Implementation Guidance

The redesign should be split into disjoint ownership areas:

- shell and shared design system
- Home
- Myspace
- Calorie
- Hangout
- review

Every page must follow the same:

- spacing rhythm
- typography scale
- component language
- accent usage
- bottom bar treatment

## 9. Source References

- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Designing for iOS: https://developer.apple.com/design/human-interface-guidelines/designing-for-ios
- Apple search interface guidance: https://developer.apple.com/documentation/SwiftUI/Adding-a-search-interface-to-your-app
- Apple Health support: https://support.apple.com/guide/iphone/get-started-with-health-iphcae7451f3/ios
- Apple Health overview: https://support.apple.com/en-afri/104997
- Google Keep organize notes: https://support.google.com/keep/answer/6191044?hl=en
- Google Keep search: https://support.google.com/keep/answer/2888263?co=GENIE.Platform%3DiOS&hl=
- Google Calendar views: https://support.google.com/calendar/answer/6110849?co=GENIE.Platform%3DAndroid&hl=en
- Google Calendar events: https://support.google.com/calendar/answer/72143?co=GENIE.Platform%3DAndroid&hl=en
- Google Meet start/schedule: https://support.google.com/meet/answer/9302870
- Google Meet join: https://support.google.com/meet/answer/9303069
- mymind official: https://mymind.com/what
- mymind onboarding: https://access.mymind.com/
- mymind App Store: https://apps.apple.com/us/app/mymind-extend-your-mind/id1520332347
