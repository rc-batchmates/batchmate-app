# Generating App Store Screenshots

Screenshots are exported from `batchmate.pen` using the Pencil MCP server via Claude Code.

## Prompt

Paste this into Claude Code to regenerate all screenshots:

---

Open `docs/design/batchmate.pen` in pencil and export all screens at 3x scale:

**Mobile screens** (to `docs/design/screenshots/mobile/`):
- `cm1CF` → login.png
- `RratE` → home.png
- `yOFTB` → profile.png
- `wT0JO` → hub.png
- `V5WLG` → hub-checked-in.png
- `Is6mJ` → member-profile.png

**Desktop screens** (to `docs/design/screenshots/desktop/`):
- `R9Kug` → login.png
- `ywKKu` → home.png
- `MkP51` → profile.png
- `MTu7x` → hub.png
- `qnO11` → hub-checked-in.png
- `MyiUP` → member-profile.png

After exporting, resize and strip alpha:
- Mobile: 1284x2778px
- Desktop: 2688x1242px

```bash
# Resize mobile
for f in docs/design/screenshots/mobile/*.png; do
  sips -z 2778 1284 "$f" --out "$f"
done

# Resize desktop
for f in docs/design/screenshots/desktop/*.png; do
  sips -z 1242 2688 "$f" --out "$f"
done

# Strip alpha (requires ImageMagick)
for f in docs/design/screenshots/mobile/*.png docs/design/screenshots/desktop/*.png; do
  magick "$f" -alpha off "$f"
done
```

---

## Required Dimensions

App Store Connect accepts these sizes:
- **iPhone 6.7"**: 1284 x 2778px (portrait) or 2778 x 1284px (landscape)
- **iPhone 6.5"**: 1242 x 2688px (portrait) or 2688 x 1242px (landscape)
