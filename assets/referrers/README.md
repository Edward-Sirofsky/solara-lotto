# Referrer profile pictures

Self-hosted on purpose. The registry stores a **path**, never an external URL — an
off-site image would let any approved referrer read the IP of every visitor to the
referral leaderboard via a tracking pixel.

## Adding one

1. Drop the image in this folder. Square, ideally 128x128 or larger; it renders at 36px.
2. Name it with letters, digits, `_` or `-` only, e.g. `frankie.png`.
   No spaces, no extra dots — the validator rejects anything else.
3. Commit and deploy the site so the file is live.
4. In the admin page, set the referrer's picture to `/assets/referrers/frankie.png`.

Accepted: `.png` `.jpg` `.jpeg` `.webp` `.gif`
Not accepted: `.svg` (the one image type with an active-content history), and any
external URL.

A referrer with no picture renders a neutral circle, which is fine — nothing breaks.
