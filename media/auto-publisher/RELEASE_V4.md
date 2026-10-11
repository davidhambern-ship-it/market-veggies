# Promo Studio V4 — implementation status

V4 changes the weekly workflow to six cartoon images and **twelve YouTube uploads**: landscape and portrait together at **10 AM and 8 PM America/New_York** on Monday, Wednesday, and Friday.

The revised application was implemented and locally tested (10 passing automated tests):
- 12 unapproved jobs at batch creation; rendering generates both formats per image
- review of both formats for each of the 6 images; single explicit approval for all 12
- identical upload time for both formats of the same image
- atomic claims per format and no automatic retry for uncertain uploads
- original YouTube channel lock remains intact
- an opt-in updater checks file checksums and backs up code without changing OAuth credentials or media

**Deployment status:** the local V4 application package has been built and verified. The complete application source files have not yet been installed on the user's Windows PC or mirrored into this repository. The current installed V3 version will continue its old six-upload behavior until V4 is installed. Do not assume the user has 12-upload scheduling active.

Do not modify existing approved campaigns or enable automatic upload as part of the update.

The approved Market Veggies video format and Book 1 URL remain fixed; see ../video-templates/README.md.
