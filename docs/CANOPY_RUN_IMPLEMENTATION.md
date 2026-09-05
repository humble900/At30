# Touch Grass: Canopy Run

## Build specification

Status: approved product direction, ready for implementation planning  
Experience: AT30 Experience 002  
Mode: browser-based 3D forest obstacle course with a limited prize season and permanent free play  
Prize partner: FiledCrews  

## 1. Product definition

Touch Grass: Canopy Run is a short, skill-based outdoor obstacle course. Players run through a natural forest park, jump, balance, climb, choose shortcuts, and ring the finish bell.

It must feel like a premium animated adventure for adults, rather than a block game, a museum reskin, or a hidden-object hunt.

### Player promise

> Run the forest. Take the shortcut. Beat the clock.

### Session length

- First visit and tutorial: 3 to 5 minutes
- Standard run: 2 to 4 minutes
- Restart time: under 5 seconds
- Daily repeat session: under 10 minutes

### V1 game modes

| Mode | Who can enter | Purpose | Prize |
|---|---|---|---|
| Practice | Everyone | Learn controls and course | No |
| Prize Race | Everyone | Compete during an active prize season | First three eligible, reviewed claims only |
| Free Play | Everyone | Race, improve a time, challenge friends | No |

Everyone can enter every mode. A FiledCrews account is not required to race or appear on a leaderboard. It is only required for a submitted prize claim to be approved offline by FiledCrews.

## 2. Prize season rules

### Prize ladder

| Provisional place | FiledCrews credit |
|---|---:|
| First | $1,000 |
| Second | $700 |
| Third | $300 |

Total prize value: $2,000 FiledCrews credit.

### Prize allocation model

Prize slots are assigned to valid finishers in chronological finish order. A result is **not a final prize win** until its email is reviewed offline by FiledCrews and approved by an AT30 administrator.

1. A player crosses the finish line.
2. The competition service validates the run.
3. The player taps **Open your finish card**.
4. If a prize slot remains, the player sees the current provisional prize amount.
5. The player enters the email used with FiledCrews and submits the claim.
6. The slot becomes `pending FiledCrews review` and the next available finish card advances to the next prize tier.
7. AT30 sends the pending-claim report to FiledCrews offline.
8. FiledCrews confirms whether each email belongs to an eligible FiledCrews user.
9. AT30 approves or rejects the claim in the admin portal.

### Finish card copy

Before email submission:

> You reached a prize position.  
> **$1,000 FiledCrews credit**  
> Enter the email you use with FiledCrews to submit your prize claim.

After submission:

> Your $1,000 credit claim is reserved for review.  
> FiledCrews will verify your account offline. We will contact you with the result.

For players after all three provisional claims have been submitted:

> Prize claims are currently under review.  
> Your time is now on the leaderboard. Beat your best.

Never show “You won” or “Credit delivered” before the offline review has been approved.

### Rejections and replacement winners

If a claim is rejected, expired, disqualified, or fraudulent:

1. The administrator rejects the claim and records a reason.
2. The system promotes the earliest eligible queued claim to that reward amount.
3. Lower pending claims shift upward if needed. Example: a rejected first-place claim promotes second place from $700 to $1,000, third place from $300 to $700, and the earliest waitlisted claim receives $300.
4. The promoted player receives an in-product notice on their next visit. If an email was submitted, AT30 may contact them only for competition administration.

### Required official rules inputs

These must be confirmed before prize mode goes live:

- Season start and end timestamp, including time zone
- Age requirement
- Eligible countries or regions
- One prize per person and FiledCrews account
- Whether FiledCrews accounts must exist before the season begins
- Credit expiry, transferability, and product restrictions
- Claim-submission deadline, recommended: 15 minutes after finish
- FiledCrews review service-level target
- Tie-break method for identical server timestamps
- Disqualification and replacement-winner process
- Sponsor and administrator names
- Contact and winner-list process

The public competition must be hosted on AT30, with its own rules page. LinkedIn should only promote the experience, not run the contest inside posts. [LinkedIn Professional Community Policies](https://www.linkedin.com/legal/professional-community-policies)

## 3. Gameplay design

### Course layout

The first course is a compact forest park with five named checkpoints.

| Checkpoint | Environment | Skill |
|---|---|---|
| Trailhead | Park entrance and warm-up trail | Learn movement |
| Creek Crossing | Stepping stones and low fallen tree | Jump timing |
| Fern Rise | Uphill path and rock ledges | Sprint and climb |
| Canopy Bridge | Narrow bridge and wind movement | Balance |
| Bell Clearing | Open final descent | Route choice and finish |

### Core mechanics

- Walk and run
- Sprint with a short stamina burst
- Jump with forgiving coyote time and input buffering
- Balance on logs and narrow bridges
- Climb only clearly marked low rock ledges
- Recoverable falls from narrow paths, logs, bridges, and cliff edges
- Automatic soft reset when a player falls into water, reaches a danger volume, or leaves the route
- Checkpoint restart, never full-course restart by default
- Safe path and faster, riskier shortcuts

### Falling and recovery

Falling is part of the game’s skill and comedy. It must look physical and natural, but should not turn a short race into a frustrating punishment.

| Fall type | Trigger | Result |
|---|---|---|
| Minor stumble | Poor landing, low edge, light player contact | Avatar recovers in place with a short time loss |
| Ledge fall | Missed jump from a narrow trail, log, bridge, or shortcut | Avatar drops to a lower safe route or reset point |
| Water fall | Missed stepping stone, log, or bridge | Splash, brief swim/recover animation, then nearest checkpoint reset |
| Cliff fall | Missed jump or strong contact near a marked high-risk edge | Camera follows a short, safe fall, then checkpoint reset |
| Out-of-bounds | Leaving the playable route | Fade and checkpoint reset without a dramatic fall |

#### Fall rules

- No gore, injury, death state, or frightening failure sequence.
- A fall uses one short reaction animation, then returns control quickly.
- Standard reset delay target: 1.5 to 3 seconds.
- A player may always choose the safe route. High-risk shortcuts make falls more likely but are never mandatory.
- Water, cliff, and danger volumes reset players to the last completed checkpoint, not the beginning of the course.
- The result screen records total falls, but the primary leaderboard remains fastest verified finish time.
- Practice mode may offer an optional no-fall-assist setting for accessibility and learning.

### Player contact and collision

Player contact is enabled only as a light, readable interaction. It should add surprise and natural reaction, not become a way to block or harass competitors.

| Context | Contact behaviour |
|---|---|
| Wide path | Players lightly shoulder past each other, with a glance or balance reaction |
| Moderate obstacle | Brief physical nudge; the affected player stumbles but retains control |
| Narrow log, bridge, ledge, or cliff edge | A stronger side contact can make a player lose balance and fall if they fail to recover |
| Start gate | Collision disabled until the opening countdown ends |
| Checkpoint, finish area, respawn point | Collision disabled and players phase through each other |
| Repeated contact from the same player | Contact is temporarily disabled for that pair and an abuse event is recorded |

#### Fair-contact rules

- Contacts use capped impulses. A player cannot launch another player, pin them, or push them through scenery.
- A player who has just fallen, spawned, reset, or reached a checkpoint receives a short contact-immunity window.
- Give the contacted player a brief balance-recovery input window before a fall is committed.
- Collision has lower strength in Prize Race than in Free Play.
- If server telemetry identifies repeated targeted bumps or impossible contact force, invalidate the abusive player’s prize run and allow administrators to suspend them.
- During V1 testing, collisions must be feature-flagged. AT30 can disable them instantly if they create unfairness or performance issues.

### Explicit non-goals for V1

- No combat
- No pay-to-win movement or cosmetics
- No random prize selection
- No open text chat room
- No forced social sharing
- No collectible hunt as the primary mechanic

### Camera

- Third-person, 4 to 6 metres behind the avatar
- Gentle camera look-ahead in the direction of travel
- Camera collision against scenery
- Reduced movement and camera shake setting
- A fixed-camera accessibility option
- No dramatic motion blur on mobile

## 4. Avatar and movement specification

### Art direction

Use an original realistic-stylized adult explorer. The target is believable, warm, and expressive, with animated-feature craft rather than photorealism.

- Adult body proportions and natural facial structure
- Outdoor jacket, trail trousers, trainers, and small backpack
- Six starting palette options
- Clear silhouette against green environments
- Natural fabric, leather, rubber, and metal materials
- LOD models for low-powered mobile devices

### Glasses

Glasses are an optional avatar accessory, not a visual afterthought.

- Frame arms visible above ears
- Subtle lens reflections and refraction approximation
- No opaque black lenses unless a sunglasses option is selected
- Slight bounce only during strong landings
- Separate low-detail mobile material without expensive real-time reflections

### Required animation states

| State | Behaviour |
|---|---|
| Idle | Breathing, weight shift, glance, occasional glasses adjustment |
| Walk | Relaxed arm swing, heel-to-toe steps |
| Run | Forward lean, responsive arms, backpack movement |
| Sprint | Stronger forward lean and visible effort |
| Jump | Anticipation, push-off, airborne pose, landing compression |
| Balance | Arms react to narrow surfaces and near-falls |
| Climb | Hand placement and weight transfer on low ledges |
| Stumble | Quick recovery, never a long penalty animation |
| Contacted | Shoulder shift, look toward the other player, regain balance or fall |
| Falling | Arms reach naturally, brief camera follow, then safe reset |
| Finish | Heavy breath, smile, arm raise, then return to idle |

### Controls

Desktop:

- `WASD` or arrow keys: move
- Mouse: camera
- `Space`: jump
- `Shift`: sprint
- `E`: interact
- `Esc`: pause

Mobile:

- Left thumb: movement stick
- Right side drag: camera
- Right thumb buttons: jump and sprint
- One contextual interact button only when needed
- Controls must remain inside `env(safe-area-inset-*)`

## 5. UI and player journey

### Entry flow

1. Landing-page card: `Experience 002 · Prize Season Live`
2. Experience page with short trailer, rules summary, prize ladder, and `Play` button
3. Avatar set-up or saved profile confirmation
4. Mode choice: Practice, Prize Race, or Free Play
5. One-screen controls tutorial
6. Spawn in Trailhead
7. Start gate countdown

### In-game HUD

The screen must favour the forest and the avatar, not large panels.

Top left:

```text
CANOPY RUN
02:14.62
Checkpoint 3 / 5
```

Top right:

```text
Best today  02:09.80
```

Bottom centre:

- Thin route progress line
- Checkpoint markers only
- No permanent oversized mini-map

Context prompts appear only when relevant:

```text
Jump
Balance
Climb
Open your finish card
```

### Finish sequence

1. Bell rings and avatar completes a short finish reaction.
2. Timer freezes.
3. The validation spinner appears for no more than a few seconds.
4. Player sees `Tap to open your finish card`.
5. Result card shows time, personal-best state, and the prize state if relevant.
6. Player can race again, view leaderboard, or return to AT30.

### Accessibility

- Captions and text equivalents for all sound cues
- High-contrast UI mode
- Reduced motion
- Rebindable desktop keys
- Large control option for mobile
- No colour-only route instructions
- Clear pause and exit controls
- No timed requirement in Practice or Free Play

## 6. Technical architecture

### Existing AT30 foundation

The project already uses React, Vite, Three.js, Supabase anonymous identity, temporary proximity speech, visitor telemetry, and a secured admin role migration. Canopy Run should reuse the profile and anonymous authentication foundation, but not reuse the public museum Realtime channel for prize-critical data.

### Service boundaries

```text
Browser game client
  ├─ renders forest, avatar, HUD, controls, presence
  ├─ requests a run token
  ├─ sends checkpoint and finish intents
  └─ never writes times, rankings, or prizes directly

Competition service
  ├─ creates run sessions
  ├─ issues signed run tokens
  ├─ validates checkpoints and finish requests
  ├─ assigns provisional prize positions atomically
  └─ returns result-card state

Supabase/Postgres
  ├─ authenticated player records and run data
  ├─ prize state and audit records
  ├─ leaderboard read model
  └─ administrator-only claim workflow

FiledCrews offline process
  ├─ receives a restricted winner report from AT30
  ├─ verifies submitted emails manually
  └─ reports approve or reject decisions to AT30
```

### Authoritative principles

- Client device time is never trusted.
- Client score, rank, prize value, or completion state is never trusted.
- The browser cannot insert directly into prize, claim, or leaderboard tables.
- Prize allocation runs only in a server-side function or database RPC with a service role.
- Presence makes the world social but does not determine results.
- All prize results remain provisional until manual review.

### Run validation strategy

For V1, use time trials with visible nearby players and ghost replays. Do not launch collision-based live races until a dedicated authoritative game server is available.

V1 validation checks:

- Authenticated anonymous user owns the run session
- Server-issued start time and expiring run token
- Checkpoint order is correct
- Server receives each checkpoint in a plausible minimum and maximum time range
- Player position fits the checkpoint’s allowed area
- Maximum displacement and velocity thresholds are not exceeded
- Only one active run per user
- Only one finalisation request per run
- Repeated improbable runs are sent to manual review

This reduces common browser cheating. A $2,000 promotion must still keep every prize claim provisional until a human review is complete.

## 7. Database design

Create a new migration, for example `004_canopy_run_competition.sql`.

### Tables

| Table | Purpose | Client access |
|---|---|---|
| `experiences` | AT30 catalogue records | Public read |
| `competition_seasons` | Prize season schedule and state | Public read of active fields |
| `competition_prize_tiers` | $1,000, $700, $300 allocation state | Public read of redacted state |
| `competition_profiles` | Per-user Canopy Run profile | Owner read and update |
| `run_sessions` | Server-created active runs | Owner read only |
| `run_checkpoints` | Validated checkpoint events | Owner read only |
| `competition_runs` | Finalised run result | Owner read; public redacted leaderboard read |
| `prize_claims` | Submitted FiledCrews email and review status | No direct client read or write |
| `prize_waitlist` | Ordered replacement candidates | No direct client access |
| `competition_audit_log` | Security and admin audit trail | Admin only |

### Essential fields

```sql
competition_seasons
  id uuid primary key
  experience_key text unique
  status text check (status in ('draft','scheduled','live','review','complete','archived'))
  starts_at timestamptz
  ends_at timestamptz
  rules_version text
  claim_window_minutes integer default 15

competition_prize_tiers
  id uuid primary key
  season_id uuid references competition_seasons(id)
  position smallint check (position between 1 and 3)
  amount_cents integer check (amount_cents > 0)
  currency text default 'USD'
  state text check (state in ('available','held','pending_review','approved','rejected','delivered'))
  claim_id uuid null

competition_runs
  id uuid primary key
  season_id uuid references competition_seasons(id)
  user_id uuid references auth.users(id)
  started_at timestamptz
  finished_at timestamptz
  duration_ms integer
  status text check (status in ('active','finished','validated','rejected','disqualified'))
  display_name text
  avatar_config jsonb
  validation_summary jsonb

prize_claims
  id uuid primary key
  season_id uuid references competition_seasons(id)
  run_id uuid unique references competition_runs(id)
  user_id uuid references auth.users(id)
  prize_position smallint
  email_ciphertext bytea
  email_lookup_hash text
  consented_at timestamptz
  submitted_at timestamptz
  claim_deadline_at timestamptz
  status text check (status in ('held','pending_review','approved','rejected','expired','disqualified','delivered'))
  review_reason text null
  reviewed_by uuid null references auth.users(id)
  reviewed_at timestamptz null
```

### Email handling

- The prize email is submitted only to a server-side claim endpoint.
- Store a keyed lookup hash for duplicate detection.
- Store encrypted email data only in the private `prize_claims` table.
- Never expose the email through a public view, the client Data API, logs, or a leaderboard.
- Restrict email export and claim review to superadmins or a dedicated `competition_manager` role.
- Log every export and review action.
- The submission UI must include explicit consent to share the email and finishing position with FiledCrews for prize administration.

### RLS rules

- Enable RLS on every new table.
- Users may read only their own profile, session, checkpoint, and run records.
- Users may not insert or update prize tiers, claims, leaderboard results, or review records directly.
- Public leaderboard access must use a view that exposes display name, time, place, and avatar colour only.
- Administrative access must use `is_museum_admin(...)` or a successor role function.
- No `using (true)` policy is acceptable for prize tables.

### Atomic prize allocation

Use one transaction in `finalize-run`:

1. Lock the run row.
2. Confirm it has not already been finalised.
3. Run validation checks.
4. Finalise the result timestamp.
5. Lock the next available prize tier with `FOR UPDATE SKIP LOCKED`.
6. Create a provisional claim hold only when the player opens the finish card and submits an email within the claim window.
7. Update the tier to `pending_review`.
8. Write the audit event.
9. Return the exact display state for the finish card.

Every endpoint needs an idempotency key. A reload, double tap, or dropped network request must return the existing result, never create another prize or run.

## 8. API contracts

Implement as protected Supabase Edge Functions or an equivalent private backend.

### `start-run`

Input:

```json
{ "seasonId": "uuid", "mode": "practice|prize|free_play" }
```

Output:

```json
{
  "runId": "uuid",
  "runToken": "short-lived-signed-token",
  "serverStartedAt": "ISO-8601",
  "courseVersion": "canopy-run-v1"
}
```

### `record-checkpoint`

Input:

```json
{
  "runId": "uuid",
  "runToken": "token",
  "checkpoint": "creek_crossing",
  "position": { "x": 0, "y": 0, "z": 0 },
  "clientSequence": 12
}
```

Output: accepted checkpoint, next expected checkpoint, server elapsed time.

### `finalize-run`

Input:

```json
{
  "runId": "uuid",
  "runToken": "token",
  "finishPosition": { "x": 0, "y": 0, "z": 0 },
  "idempotencyKey": "uuid"
}
```

Output:

```json
{
  "runStatus": "validated",
  "durationMs": 134620,
  "personalBest": true,
  "dailyRank": 12,
  "finishCard": "eligible_to_reveal|leaderboard_only|review_in_progress"
}
```

### `submit-prize-claim`

Input:

```json
{
  "runId": "uuid",
  "email": "player@example.com",
  "consent": true,
  "rulesVersion": "2026-01"
}
```

Output:

```json
{
  "claimStatus": "pending_review",
  "prizePosition": 1,
  "amountCents": 100000,
  "message": "Your prize claim has been reserved for FiledCrews review."
}
```

### `get-leaderboard`

Parameters: season, scope (`daily`, `season`, `all_time`), limit, cursor.

Output only contains safe display fields.

## 9. Admin portal

Add a Competition section to the existing secure admin portal.

### Required pages

- Season overview
- Prize tier state
- Live run and validation monitor
- Leaderboards
- Pending FiledCrews claims
- Offline export history
- Claim review and promotion queue
- Rules version and announcement controls
- Audit log

### Required actions

- Create, schedule, start, pause, and close a season
- Configure the three prize tiers
- Set prize card copy and claim deadline
- View a run’s validation trace
- Export pending claims in a restricted report
- Mark claim approved, rejected, disqualified, or delivered
- Promote the next queued claim after a rejection
- Publish a non-sensitive winner announcement
- Suspend a player or invalidate a run with a required reason

### Offline FiledCrews export

The report should include only:

- Prize position and amount
- AT30 claim ID
- Submitted FiledCrews email
- Finish timestamp
- Public display name
- Rules version accepted

It must not include browser telemetry, location samples, device fingerprinting, unrelated museum data, or other player data.

## 10. Analytics

Track event names, not raw sensitive data.

### Funnel

```text
canopy_viewed
mode_selected
avatar_confirmed
tutorial_started
tutorial_completed
run_started
checkpoint_reached
run_finished
finish_card_opened
prize_claim_started
prize_claim_submitted
claim_approved_or_rejected
race_restarted
leaderboard_opened
share_prompt_opened
```

### Product metrics

- First-run completion rate
- Median completion time
- Restart rate
- Checkpoint drop-off rate
- Mobile versus desktop completion rate
- Daily active players
- Return rate after a personal best
- Prize-card reveal rate
- Claim-submission rate
- Rejection rate
- Course performance by device class
- Social-share click-through and referral completion

Do not send prize emails, full IP addresses, or detailed device fingerprint data into general analytics events.

## 11. Build phases and acceptance criteria

### Phase A: product, legal, and content lock

Deliver:

- Approved official-rules inputs
- Course map and obstacle list
- Avatar reference board and animation list
- FiledCrews offline review workflow
- Prize-card copy

Acceptance:

- No missing prize eligibility decision
- No claim language promises delivery before review
- One owner for FiledCrews review and player support

### Phase B: playable vertical slice

Deliver:

- Trailhead to Creek Crossing playable in browser
- Third-person movement, jump, sprint, reset, checkpoint
- One realistic-stylized avatar with glasses option
- Desktop and mobile controls
- Basic HUD

Acceptance:

- First-time player understands movement in under 60 seconds
- Runs at a stable 30 FPS on target mid-range mobile hardware
- No black viewport bands or clipped controls

### Phase C: full course and social presence

Deliver:

- All five checkpoints
- Safe and shortcut routes
- Finish bell and result screen
- Nearby-player presence and temporary speech bubbles
- Ghost replay

Acceptance:

- Typical run is 2 to 4 minutes
- Course is finishable without shortcuts
- Social players cannot collide, block, or interrupt a run

### Phase D: secure competition backend

Deliver:

- Migration, RLS, restricted views, and protected functions
- Server-issued run tokens
- Checkpoint and finish validation
- Atomic tier allocation
- Admin audit logs

Acceptance:

- Client cannot insert a result, alter a time, or reserve a prize directly
- Duplicate submissions produce one run and one result
- Concurrent finish tests never allocate the same prize tier twice

### Phase E: prize claims and offline review

Deliver:

- Finish-card reveal
- Email consent and submission
- Pending-review state
- Claim export
- Admin approval, rejection, and promotion tools

Acceptance:

- No email appears in the browser after submission
- Export access is audited
- Rejected prize claims promote the correct queued candidate
- Prize card amount changes correctly from $1,000 to $700 to $300

### Phase F: polish, test, and launch

Deliver:

- Sound, ambience, haptics where supported, and finish reactions
- Accessibility pass
- Load test and abuse test
- Prize season landing-page state
- Monitoring and incident runbook

Acceptance:

- No critical security issue in RLS or prize workflow
- Full mobile device matrix passes
- Operations can pause prize mode without taking Free Play offline

### Phase G: post-prize free play

Deliver:

- Automatic switch to Free Play messaging
- Daily and all-time leaderboards
- Winner approval and optional announcement
- Retention analysis and next-season report

Acceptance:

- The course remains useful after all credit is allocated
- No stale prize messaging remains anywhere in the product

## 12. Test plan

### Functional

- Start, checkpoint, reset, finish, retry, exit, and reconnect flows
- Practice, Prize Race, and Free Play behavior
- Saved avatar and glasses customization
- Safe-route, shortcut, water, ledge, cliff, and out-of-bounds fall recovery
- Contact reactions on wide paths, narrow logs, bridges, and cliff edges
- Contact immunity at spawn points, checkpoints, the finish, and immediately after recovery
- Finish-card reveal and submission
- Correct prize-card progression
- Prize season start, end, pause, and completion

### Security and integrity

- Replayed requests
- Double finish tap
- Browser refresh during claim
- Simultaneous finishes
- Repeated player-contact, blocking, launch-force, and targeted-bump abuse attempts
- Client clock changes
- Teleport and skipped-checkpoint attempts
- Anonymous-account reset
- Duplicate FiledCrews email submission
- Unauthorized read of another player’s run or claim
- Unauthorized admin function call

### Performance and device

- iPhone Safari and Android Chrome
- Small phone, large phone, tablet, laptop, and desktop
- Portrait and landscape controls
- Weak network reconnect
- Low battery and reduced graphics mode
- 20 to 30 nearby visible players per private instance

## 13. Definition of done

Canopy Run is ready to launch only when:

- A new player can complete a run without instruction outside the game.
- The avatar feels expressive and natural on desktop and mobile.
- All players can compete without a FiledCrews account.
- Prize claims collect a FiledCrews email only after a qualifying finish card.
- Prize claims are presented as pending review, never instant delivery.
- The $1,000, $700, and $300 tiers cannot be double allocated.
- Admins can export and review claims offline with FiledCrews.
- Rejected claims can be replaced fairly from the queue.
- The game remains enjoyable as Free Play once rewards are no longer available.
- The landing page can list Canopy Run as a distinct AT30 experience with its own entry point.
