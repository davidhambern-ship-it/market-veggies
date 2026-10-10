# Market Veggies Auto-Publisher — Phase 1

**Free, self-hosted video maker and scheduled YouTube publisher.** Built for Book 1 (*Gary Saves the Market*). Runs locally on Windows; no paid automation, video-generation, or hosting subscription is required.

## What works now

- Creates **both** 10-second HD MP4s from an approved illustration + campaign text:
  - Landscape: 1920×1080, headline left and artwork right.
  - Portrait: 1080×1920, headline above and artwork centered.
- Matches the approved deep blue / yellow / orange / white **unboxed serif** design.
- **Uses the actual APPROVED transparent Market Veggies brand and CTA overlays** when the standard text is unchanged; preserves the exact approved theme-song segment.
- Reads campaigns from JSON; keeps YouTube title, description, link and hashtags with each campaign.
- Stores scheduled jobs in local SQLite; blocks duplicate IDs and never blindly retries an uncertain upload.
- OAuth connection and resumable uploads via the **official YouTube Data API**.
- Can run every 15 minutes using Windows Task Scheduler.

The phase 1 video renderer uses **still-image scenes with timed transitions** to keep render time practical on an ordinary PC. It is template-aligned, but not a frame-for-frame clone of the original animated MP4. Character lip-sync or generative character motion is *not* implemented. The two approved reference videos remain unchanged.

## Recommended: Use the visual Promo Studio (no commands for normal use)

The starter package now includes **OPEN_PROMO_STUDIO.bat** and **dashboard.py**. After the one-time free setup below, **double-click OPEN_PROMO_STUDIO.bat**. Your browser opens **http://127.0.0.1:8765**. In the Studio you can:

- Choose new original Market Veggies artwork from your computer.
- Set the landscape and vertical headlines, title, YouTube description, date and privacy.
- Click **Generate both videos** to watch and download two 10-second MP4s.
- Click **Add to scheduled queue** to store an approved campaign.
- Review queue status in the same screen.

The desktop command window must remain open while the local dashboard is running. This dashboard is private to your machine and **does not publish a video just by opening it**. Scheduled uploading requires the separate OAuth and Windows Task Scheduler steps below. **Do not enter Google account passwords in the dashboard.**

## One-time local setup (Windows)

1. Extract this ZIP into a permanent directory such as `C:\MarketVeggiesAutoPublisher`. Do not run from a temporary downloads location.
2. Install Python 3.11+ and [FFmpeg](https://ffmpeg.org/download.html) for Windows. Ensure `python` and `ffmpeg` work in Command Prompt/PowerShell.
3. In PowerShell, change to the extracted directory and install the free Python packages:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python mvbot.py render campaigns\demo_book1.json
   ```

4. Once installed, **double-click `OPEN_PROMO_STUDIO.bat`** for the browser dashboard. Confirm BOTH outputs in `outputs\` look right **before** authorizing uploads.
5. Edit `campaigns\demo_book1.json` or copy it to a new uniquely named file with your new artwork path and copy. You can use the sample as a model.

## YouTube connection (one-time browser authorization)

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project, enable **YouTube Data API v3**, configure OAuth consent, and create a **Desktop application OAuth client**. Download its JSON.
2. Place the JSON at `private\google_oauth_client.json`. Keep it PRIVATE. Never add it to GitHub or share access tokens/passwords in chat.
3. Run `python mvbot.py connect-youtube`; sign in and select the **Book 1 YouTube channel** in the Google authorization flow. Check the channel carefully before granting permission.
4. Note: A Google external OAuth app in **Testing** mode may issue refresh tokens that expire after **7 days** for the YouTube scope. Persistent unattended uploads require an appropriately configured production OAuth consent screen and any applicable platform review. See Google's OAuth rules.
5. Review the **audience classification** for the specific Book 1 video and set `youtube.made_for_kids` to `true` or `false` as appropriate. Do not infer this purely from the book's subject. The sample intentionally has `null` to prevent publishing until you decide.
6. Keep `youtube.privacy` as `private` for your first upload. Once you've confirmed correct channel, titles, quality, and audience designation, change new campaigns to `public` or `unlisted` when intended.

## Enqueue and schedule

In the chosen campaign JSON, set these fields:

- `id`: Unique campaign ID (`monster_reader_03`, etc.); **never reuse** for a different promo.
- `artwork`: Local file path to an actual Market Veggies illustration you own. The demo uses the bundled image.
- `headlines.landscape` and `.portrait`: 1–3 lines in **locked yellow → orange → white order**.
- `publish_at`: An absolute ISO 8601 local date **with timezone offset**, e.g. `2026-10-20T16:00:00-04:00`.
- `approved_for_posting`: Must be explicitly `true` to allow publishing.
- `youtube.title`, `shorts_title`, `description`, `privacy`, and `made_for_kids`: Platform metadata.

```powershell
python mvbot.py enqueue campaigns\my_campaign.json
python mvbot.py queue-status
python mvbot.py run-due --dry-run
python mvbot.py run-due
```

`run-due` processes *approved*, due campaigns only. Run `install_windows_task.ps1` in PowerShell to register a local Windows Task Scheduler task that invokes `run-due` about every 15 minutes. It works while the PC is running and has internet. If offline or shut down, missed jobs will be processed the next time it runs (not necessarily at the original clock time). You can also leave scheduling OFF and invoke manually while testing.

For the first real publishing test, **keep `privacy=private`** and choose a future schedule; use your own account credentials. There are no API credentials in this ZIP, and no video has been uploaded by this system yet.

### Duplicate safety

SQLite statuses: `queued` → `rendered` → `uploading` → `posted`. On upload error, status becomes `needs_review` and **won't retry automatically**. If YouTube accepted the upload but the network dropped before receiving the video ID, check your channel manually before considering another upload. Do not edit the database to retry without checking. If you need a truly new promo, assign a new campaign ID.

## Phase 2 connections (not live yet)

- Facebook Pages / Instagram Reels via official Meta permissions and eligible professional account setup. Instagram Reels usually need publicly fetchable hosted video media for API container processing.
- TikTok via its official Content Posting API, subject to developer app approval, audit, privacy restrictions, creator consent and branding/content-sharing policies. **Do not** use browser bot workarounds or claim unaudited apps can directly publish public videos.
- A local dashboard (preview, edit copy, queue, approve, calendar, results) and analytics once channel publishing is proven.

## Branding rules: do not alter

The exact canonical references are the *approved* landscape video provided by the project owner, and `MarketVeggies_MonsterPromo_v2_9x16.mp4` for vertical. The program **reuses transparent overlay images extracted from the approved source pack** and the exact 10-second approved audio segment. All new characters must come from the existing source artwork; no substitute generative character assets. No boxes behind text; headline areas must not overlap the book or faces. The original reference masters were not modified.

## Requirements and privacy

- Python, Pillow, Google API client libraries, FFmpeg (all available without subscription; Google API use is subject to quota and platform policies).
- All OAuth token files are stored under `private/` and ignored by Git.
- `outputs/` and queue DB are local, not automatically uploaded to GitHub.
- No posting without `approved_for_posting=true`, an explicit target privacy setting and YouTube audience designation.

## What is on GitHub versus what you launch

The GitHub page at `market-veggies/media/auto-publisher/README.md` is **documentation, not the running application**. Opening GitHub does **not** launch a Windows desktop app. The *complete runnable project with its audio, original art, and master assets* is in the companion ZIP. Keep the extracted folder on your PC; GitHub can track the source code and changes, but the user interface runs locally until a separate, securely designed hosted dashboard is deployed.