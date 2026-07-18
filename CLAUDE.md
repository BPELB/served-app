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
