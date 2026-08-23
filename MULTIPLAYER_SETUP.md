# AT30 multiplayer setup

The client now supports remote visitors, synchronized movement, online counts, and temporary avatar speech bubbles. Without Supabase environment variables it automatically remains in offline single-player mode.

## Connect a Supabase project

1. Create a dedicated AT30 Supabase project.
2. Enable Anonymous Sign-Ins in Auth settings.
3. Confirm Realtime is enabled and public channels are allowed for development.
4. Copy `.env.example` to `.env.local`.
5. Add the project URL and publishable key from the project's Connect dialog.
6. Restart the Vite development server.

Never add a secret or service-role key to a `VITE_` variable.

## Current multiplayer behavior

- All visitors join the development topic `museum:public:lobby`.
- Presence carries only the visitor ID, session ID, display name, and avatar color.
- Movement is broadcast at no more than 10 updates per second.
- Remote movement is interpolated locally.
- Avatar speech is limited to 100 characters, rate-limited to one message every two seconds, sanitized, and disappears after six seconds.
- Speech is never written to the database and there is no chat room or history.
- Coupon and passport data never leave the visitor's browser.

## Production hardening before launch

Replace the public development topic with private museum-instance topics. Add room membership tables with Row Level Security and Realtime Authorization policies that require `auth.uid()` to match a membership record for the requested topic. Limit each instance to 20–30 sessions, add server-enforced rate limits, and run Supabase security and performance advisors after applying the schema.
