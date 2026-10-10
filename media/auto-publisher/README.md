# Market Veggies Auto-Publisher — Phase 1

**Status:** local MVP built and rendered successfully; live YouTube authorization/publishing not yet connected.  
**Date:** October 10, 2026  
**Purpose:** create repeatable promo videos for *Book 1 — Gary Saves the Market* and schedule authorized YouTube uploads. Zero paid subscriptions required for the local rendering/scheduler.

## Locked creative master

Use the owner's **approved corrected 16:9 landscape master** and **approved v2 9:16 vertical master**, not later improvised versions. The master reference videos, source imagery, original 10-second theme mix and approved brand/CTA transparent overlays are bundled in the downloadable **MarketVeggies_AutoPublisher_Starter_v1.zip** delivered in the project chat.

For each campaign: render **both** 1920×1080 and 1080×1920, 10-second H.264 MP4s. Landscape left-aligned colorful serif headlines, artwork right; vertical top headlines, centered art, final CTA near bottom. Keep blue gradient, yellow/orange/white direct-on-screen text, exact approved music. Never redraw original Market Veggies characters. Use Book 1 landing URL: https://marketveggies.hireberna.app/book1.

## Starter system delivered

The downloadable local Windows starter contains:
- `mv_auto/renderer.py` — template-based rendering with Pillow and FFmpeg, reuses approved overlays and song.
- `mv_auto/queue.py` — SQLite scheduled queue with unique campaign+destination key and duplicate safety.
- `mv_auto/youtube.py` — official YouTube Data API resumable upload, with desktop OAuth.
- `mvbot.py` CLI for render, enqueue, status, run-due, OAuth connection.
- `install_windows_task.ps1` — local Task Scheduler every 15 minutes (when PC is available).
- `campaigns/demo_book1.json` — sample post, **posting disabled**.
- Original assets, approved reference MP4s and a pair of actual demo renders.

**Testing completed:** both MP4 formats generated at exact 10-second length; four local unit tests passing. First phase stills/text use timed scene transitions, not advanced character AI animation.

**Not completed:** account authorization, live uploads, Meta publishing, TikTok public publishing, live analytics/dashboard. No videos have been posted by this tool.

## Publishing safety and account access

The user must authorize their own Book 1 YouTube account via Google OAuth and explicitly set the audience classification (`made_for_kids` true/false), privacy, unique campaign ID, scheduled ISO time, and `approved_for_posting=true`. First real upload should be private. Tokens and SQLite queue are **local and gitignored**, never add them to this repo or paste them in chat. Upload errors become `needs_review`, not an automatic repeat upload. External Google OAuth apps in Testing mode may lose refresh tokens after seven days.

## Expansion

- Phase 2: local browser dashboard for artwork, copy, calendar, preview, approval and results.
- Phase 3: Meta Pages/Instagram Reels official publishing after account/permissions verification.
- Phase 4: TikTok official API only if appropriate developer approvals and branding/sharing requirements can be satisfied; unaudited applications have privacy restrictions.

**The current full working starter exists as a delivered ZIP in the conversation, not as files in this GitHub folder.** The official visual style spec in `media/video-templates/README.md` remains authoritative.
