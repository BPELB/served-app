# served-app — brand theming rules

This repo hosts four brand variants of the same demo app, each on its own
independent git branch (no shared history): `v2.0` (greenchek, green),
`franklyy` (red), `trufaro` (blue), `trufilo` (orange). All theming lives in
`src/App.jsx` via CSS variables (`--accent`, `--bg`, `--bg2`, `--bg3`, `--bdr`,
`--text`, `--muted`, `--hover`) applied through `applyTheme()`, with JS
constants `O`, `N`, `BG`, `BG2`, `BG3`, `BDR`, `MUT`, `HOV` referencing them.

## No foreign colors in interactive states

Every hover/focus/active effect must use the brand's own theme variables —
never a hardcoded hex/rgb color. If a component needs a hover highlight, reuse
`O` (accent) or `HOV` (hover background), the same way `BusinessCard`,
`RateView`'s plan cards, etc. already do it. A hardcoded color like `#555`
introduces a shade that doesn't belong to any brand's palette and looks
wrong the moment you switch brands or themes.

This was a real bug: the feedback-chip buttons in `RateView` (`bt.chips.map`)
had `onMouseEnter` set `borderColor` to a hardcoded `#555` instead of `O`.
Fixed on `v2.0` in commit `63b459e`. When porting any change to another
brand branch, grep for `onMouseEnter`/`onMouseLeave`/`onFocus` and check every
color referenced inside is one of the theme constants above, not a literal
hex/rgb value (excluding intentional fixed values like `"#fff"` used for text
on top of the accent-colored background, which is correct as-is).

## Standing workflow for porting a change across brands

- Implement and verify on greenchek (`v2.0`) first, in both dark and light
  mode, before touching the other three.
- Port to the others only when explicitly asked ("apply to franklyy next",
  "same for trufaro and trufilo") — do not fan a change out to all brands
  unprompted.
- Never introduce one brand's color or literal name into another brand's
  file. Reuse each single-branch equivalent color already established for
  that specific brand (see `DARK_VARS`/`LIGHT_VARS` in `App.jsx`).
- After every push, verify the Vercel deploy via GitHub's `pull_request_read`
  (`get_status`) — don't assume success.

## Pending ports: greenchek fixes not yet applied to franklyy/trufaro/trufilo

Everything below was implemented and verified on `v2.0` (greenchek) but has
**not** been ported to the other three brands yet. Port only when explicitly
asked, one brand at a time, per the workflow above. Each item lists the
greenchek commit(s) to use as the reference diff.

- [ ] **Review pill style: final version** — pills use `flex:1` with
  centered content (fills row width, no clustering left); `flexWrap:nowrap`
  with shrunk-but-then-rebalanced padding/font/star size so all three fit
  one row down to 320px; background is `BG3` (theme-adaptive) with `N`
  text color and `O` border — NOT a hardcoded dark-navy background with
  white text, that combo was tried and disliked. Bigger sizing: pill
  padding `5px 8px`, label `fontSize:11`, star `size:10`, gap `4`, row
  gap `4`, `marginTop:6`. (`d396378` → `17b5e5e` → `5a60218` → `e875d51`
  → superseded by `eb92c80`; use `eb92c80`'s version as source of truth)
- [ ] **ScoreBadge border always accent-colored + bigger** — no more green/
  orange/yellow color-coding by score value; removed unused `SH`/`SM`/
  `SL`/`scC`. Size bumped from 50 to 58 in `ReviewCard`. (`e875d51`, part
  of `6128e7a`; size bump in `eb92c80`)
- [ ] **BusinessCard row uses `alignItems:"center"`, not `"flex-start"`** —
  an earlier title-wrap fix (see below) set the main row to
  `alignItems:"flex-start"`, which threw off vertical centering of the
  icon/Feedback button for the common single-line-title case. Reverted to
  `"center"` — still looks correct when a title wraps to two lines.
  (`eb92c80`)
- [ ] **StarCard (feedback page) always accent-colored** — border and score
  badge on the star-rating boxes use `O` regardless of rating, not
  score-dependent color. (`6128e7a`)
- [ ] **Image slider redesign** — photos sized to show exactly two full
  images with no partial third; arrows are bare (no circle), sized 16px,
  colored `MUT` (matches Hours/Location links), positioned just outside the
  slider so they never overlap a photo, image width stays full (matching
  other content boxes). This went through several iterations — use the
  *final* state only. (`0483e44` → `77f5150` → `6edb39a` → `10aee80` →
  `368ab01`; skip `600bde9`/`2a21301`/`96cfcaf`, superseded)
- [ ] **Business titles no longer truncated** — `BusinessCard` and
  `SponsoredCard` titles wrap to multiple lines instead of single-line
  ellipsis; card grows to fit. (`a1620b3`)
- [ ] **"+ More feedback" button** — renamed from "+ More to rate
  (optional)"; "(optional)" is now a small second line inside the button.
  (`8dc90e2`, `9c00706`)
- [ ] **Feedback chip hover uses accent color** — was hardcoded `#555`, now
  `O`. See "No foreign colors" rule above. (`63b459e`)
- [ ] **DoneScreen restyle** — icon box is flat `O` (no gradient); "green
  chek approved!" uses the two-tone logo treatment (brand-name colored
  `O`, rest `N`); "Rate another business" is now the solid accent-filled
  button, "Share your review" is the transparent outlined one. Adapt the
  wordmark split per brand's own name. (`f153cbd`)
- [ ] **ShareCard replaced with a real share sheet** — deleted the fake
  in-app-preview mockup card entirely. New version is a bottom sheet
  (slides up from the screen edge) with real icons/links for Facebook, X,
  WhatsApp, Message (SMS), Email, and Copy Link, each using that platform's
  actual share-intent URL. Also fixes a "?/5" placeholder bug when a review
  had no star ratings. Removed the now-unused `PrimaryBtn` component and
  its `G` gradient constant — check they're truly unused before deleting
  on another brand (they may still be referenced elsewhere on that branch).
  Update the brand name/domain in the share text per brand. (`e81d79d`)
- [ ] **"Claim for free" button: no box shadow** — also had a hardcoded
  foreign orange shadow color; removed. (`553c905`)
- [ ] **All star ratings theme-aware, darker gold in light mode** — added a
  `--star` CSS var (JS constant `ST`) alongside the other theme vars:
  dark mode keeps `#FBBF24`, light mode uses a darker gold for contrast
  against the white background. Every hardcoded `#FBBF24` usage
  (`ScoreBadge`, `PartialStars` default, BusinessPage header rating,
  feedback-button star icon) now references `ST`, and every "⭐" emoji
  star rating (`BusinessCard`, `SponsoredCard`, `OwnerDashboard` header)
  was converted to a solid `★` character colored `ST`, so all stars are
  visually consistent instead of a mix of emoji glyphs and a fixed hex.
  Add `--star` to both `DARK_VARS`/`LIGHT_VARS` and to the `:root` default
  in `index.html` (matches dark mode, since dark is the default theme).
  Pick each brand's own darker light-mode gold rather than reusing
  greenchek's hex verbatim — keep it in the same amber family, just
  legible on that brand's white background. Note the light-mode value
  went through two rounds: `#B45309` (`57b628c`→`c7dab78`) was reported
  too dark against white and was lightened to `#CA8A04` (`98c7753`) — use
  `98c7753`'s value as source of truth, not `c7dab78`'s.
- [ ] **Light-mode muted text contrast darkened** — brand's `LIGHT_VARS
  --muted` opacity bumped from `0.5` to `0.65` for better readability
  against the white background. Apply the equivalent bump to each other
  brand's own `LIGHT_VARS --muted` value — keep each brand's own base RGB,
  only adjust opacity by the same +0.15 amount. (`57b628c`)
- [ ] **No more per-business emoji icons, replaced with per-business Lucide
  icons; icon color is theme-aware (white in dark mode)** — three-step
  change, use the *third* step as source of truth:
  1. `3785b41` first removed per-business `emoji` rendering entirely —
     `IconBox` and `SponsoredCard` fell back to one shared `CAT_ICONS[type]`
     icon per category (e.g. every "food" business showed the same
     fork/knife icon). Superseded almost immediately.
  2. `98c7753` (+ `d10e415` fixup) added a hand-drawn `SUBTYPE_ICONS` map
     keyed by `[type][subtype]`. User feedback: the hand-drawn icons
     looked low quality, and businesses sharing a subtype (e.g. two
     Italian restaurants) still looked identical. Superseded.
  3. `bcd33c8` replaced hand-drawn `SUBTYPE_ICONS` entirely with the
     `lucide-react` npm package (ISC license — permissive/commercial-
     friendly, confirmed no copyright issue) and a `BIZ_ICONS` map keyed
     by **individual business id** (e.g. `d1: Pizza, d5: Hamburger,
     b1: Scissors, pr1: Gavel` — see the map in `App.jsx` for the full
     ~56-entry list), so every business gets its own specific,
     professionally-designed icon rather than one shared per category or
     subtype. `IconBox({id, type, size})` looks up `BIZ_ICONS[id]` and
     renders it as `<BizIcon size={s} color={IC} strokeWidth={2}/>`,
     falling back to the old raw-SVG `CAT_ICONS[type]` only when an id
     has no entry (this is the path the category-strip pills use, since
     those represent a category, not a specific business — pass `type`
     only, no `id`, to keep that fallback). `SponsoredCard` does the same
     lookup via `ad.bizId`.
     Also added a theme var `--iconfg` (JS constant `IC`): white in dark
     mode, accent green in light mode — replaces the old hardcoded
     `color:O`. Add `--iconfg` to `DARK_VARS`/`LIGHT_VARS` and to the
     `:root` default in `index.html`. Each brand should reuse its own
     light-mode accent value for `--iconfg` (not greenchek's `#115D3C`),
     same pattern as `--accent`.
     When porting: add `lucide-react` as a dependency (`npm install
     lucide-react`, already in greenchek's `package.json`/
     `package-lock.json`), copy the `BIZ_ICONS` map and its Lucide
     imports verbatim (business ids are shared across brands via `DEMOS`,
     and the icon choices are brand-neutral — only `IC` determines
     color), and re-map any businesses that differ from greenchek's
     `DEMOS` on that brand.
- [ ] **OwnerDashboard "Start Advertising" buttons: solid, not outlined** —
  both CTA buttons (Overview tab top button, and the Profile tab's Account
  section button) switched from `background:"transparent",color:O` to
  `background:O,color:"#fff"`, matching the app's other solid-accent CTA
  buttons. The overview button's decorative glow `boxShadow` was removed
  too (not needed on a solid-fill button). (`3785b41`)
- [ ] **Ad-builder live-preview CTA pill: fix truncation** — the pill's
  `maxWidth:80` was narrower than what its own 20-character custom-text
  limit needs, so valid input (e.g. "Reservation Here") got ellipsis-cut
  well before the character cap. Bumped `maxWidth` to `140`. (`171522a`)

Note: as of `eb92c80` the session workflow changed — the user asked to stop
porting to other brands mid-session and instead do one big batch port at
the end. Keep implementing/verifying on greenchek only and keep this list
updated; hold off pushing `CLAUDE.md` updates to the other three branches
until that batch port happens (don't touch franklyy/trufaro/trufilo at all
until told to start the batch).

An icon-style experiment (solid accent-colored `IconBox` background, white
icon) was tried and **reverted** on trufaro — do not carry that over to any
brand. `IconBox` should stay a neutral bordered box with an accent-colored
line icon, matching `CatPill`'s existing treatment. A further icon-polish
pass (same box/color treatment, more detailed icon artwork) is still under
discussion and not yet started on any brand.
