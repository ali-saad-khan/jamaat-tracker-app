"""Regenerates the app icons: a crescent over five dots (one per daily prayer).

Run from the repo root:  python3 scripts/generate-icons.py   (needs Pillow)
"""

from PIL import Image, ImageChops, ImageDraw

DEEP = (12, 84, 56, 255)
WHITE = (255, 255, 255, 255)


def glyph(size, fg, scale):
    """Crescent over five dots, drawn at 4x and reduced for smooth edges. `scale` is the share of the canvas used."""
    s = size * 4
    layer = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(layer)
    box = s * scale
    top = (s - box) / 2
    r = box * 0.27
    # The crescent's visual centre sits left of its disc centre, so nudge it right to look centred.
    cx, cy = s / 2 + r * 0.2, top + box * 0.30
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    cut = Image.new("L", (s, s), 0)
    ImageDraw.Draw(cut).ellipse(
        [cx - r + r * 0.55, cy - r - r * 0.12, cx + r + r * 0.55, cy + r - r * 0.12], fill=255
    )
    layer = ImageChops.subtract(layer, cut)
    d = ImageDraw.Draw(layer)
    dr, gap, y = box * 0.055, box * 0.17, top + box * 0.82
    for i in range(5):
        x = s / 2 + (i - 2) * gap
        d.ellipse([x - dr, y - dr, x + dr, y + dr], fill=255)
    layer = layer.resize((size, size), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(Image.new("RGBA", (size, size), fg), (0, 0), layer)
    return out


def main():
    out = "assets/images/"
    icon = Image.new("RGBA", (1024, 1024), DEEP)
    icon.alpha_composite(glyph(1024, WHITE, 0.62))
    icon.convert("RGB").save(out + "icon.png")  # no alpha channel, for iOS
    glyph(1024, WHITE, 0.50).save(out + "android-icon-foreground.png")  # stays inside the safe zone
    Image.new("RGBA", (1024, 1024), DEEP).save(out + "android-icon-background.png")
    glyph(432, WHITE, 0.62).save(out + "android-icon-monochrome.png")
    glyph(512, WHITE, 0.9).save(out + "splash-icon.png")  # background colour comes from app.json
    glyph(96, WHITE, 0.85).save(out + "notification-icon.png")  # Android status-bar icon: white on transparent
    fav = Image.new("RGBA", (48, 48), DEEP)
    fav.alpha_composite(glyph(48, WHITE, 0.85))
    fav.save(out + "favicon.png")


if __name__ == "__main__":
    main()
