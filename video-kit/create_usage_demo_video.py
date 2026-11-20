from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
GENERATED = ROOT / "generated"
OUTPUT = GENERATED / "cityreserve-demo-utilisation.mp4"
WIDTH, HEIGHT = 1366, 768
FPS = 24
SECONDS_PER_SCENE = 5

SCENES = [
    ("01-home.png", "1. Accueil", "L'utilisateur decouvre CityReserve et les categories disponibles."),
    ("02-services.png", "2. Exploration", "Il consulte les etablissements disponibles dans toute la Tunisie."),
    ("03-restaurant.png", "3. Recherche par categorie", "Il filtre les restaurants et compare les informations utiles."),
    ("04-details.png", "4. Fiche etablissement", "Il consulte la description, les horaires, les avis, la galerie et les services."),
    ("05-sport.png", "5. Reservation", "Il choisit un etablissement et prepare sa demande de reservation."),
]


def load_font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


TITLE_FONT = load_font(44, bold=True)
BODY_FONT = load_font(24)
SMALL_FONT = load_font(18)


def fit_image(path):
    image = Image.open(path).convert("RGB")
    image.thumbnail((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (WIDTH, HEIGHT), (15, 23, 42))
    x = (WIDTH - image.width) // 2
    y = (HEIGHT - image.height) // 2
    canvas.paste(image, (x, y))
    return canvas


def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def add_overlay(image, title, subtitle, progress):
    frame = image.copy()
    overlay = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=(2, 6, 23, 35))
    panel = (48, HEIGHT - 155, WIDTH - 48, HEIGHT - 38)
    draw_rounded_rect(draw, panel, 24, fill=(15, 23, 42, 220), outline=(96, 165, 250, 135), width=2)

    draw.text((78, HEIGHT - 132), title, font=TITLE_FONT, fill=(248, 250, 252, 255))
    draw.text((80, HEIGHT - 75), subtitle, font=BODY_FONT, fill=(203, 213, 225, 255))

    bar_x, bar_y, bar_w, bar_h = 80, HEIGHT - 30, WIDTH - 160, 7
    draw_rounded_rect(draw, (bar_x, bar_y, bar_x + bar_w, bar_y + bar_h), 4, fill=(51, 65, 85, 255))
    draw_rounded_rect(draw, (bar_x, bar_y, bar_x + int(bar_w * progress), bar_y + bar_h), 4, fill=(96, 165, 250, 255))

    draw.text((WIDTH - 240, 34), "CityReserve", font=SMALL_FONT, fill=(147, 197, 253, 255))
    return Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")


def make_outro(progress):
    image = Image.new("RGB", (WIDTH, HEIGHT), (15, 23, 42))
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse((-140, -120, 430, 420), fill=(59, 130, 246, 62))
    draw.ellipse((940, 80, 1460, 600), fill=(124, 58, 237, 58))
    draw.text((WIDTH // 2 - 180, HEIGHT // 2 - 90), "CityReserve", font=load_font(58, bold=True), fill=(248, 250, 252, 255))
    draw.text((WIDTH // 2 - 330, HEIGHT // 2 - 16), "Rechercher, comparer et reserver partout en Tunisie.", font=BODY_FONT, fill=(203, 213, 225, 255))
    draw.text((WIDTH // 2 - 175, HEIGHT // 2 + 42), "Une plateforme simple pour clients et etablissements.", font=SMALL_FONT, fill=(147, 197, 253, 255))
    return add_overlay(Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB"), "6. Conclusion", "CityReserve facilite la reservation et la gestion des etablissements.", progress)


def write_video():
    GENERATED.mkdir(parents=True, exist_ok=True)
    writer = cv2.VideoWriter(str(OUTPUT), cv2.VideoWriter_fourcc(*"mp4v"), FPS, (WIDTH, HEIGHT))
    total_frames = (len(SCENES) + 1) * SECONDS_PER_SCENE * FPS
    frame_index = 0

    for image_name, title, subtitle in SCENES:
        base = fit_image(GENERATED / image_name)
        frames = SECONDS_PER_SCENE * FPS
        for i in range(frames):
            zoom = 1 + (i / frames) * 0.025
            resized = base.resize((int(WIDTH * zoom), int(HEIGHT * zoom)), Image.Resampling.BICUBIC)
            left = (resized.width - WIDTH) // 2
            top = (resized.height - HEIGHT) // 2
            cropped = resized.crop((left, top, left + WIDTH, top + HEIGHT))
            progress = (frame_index + 1) / total_frames
            frame = add_overlay(cropped, title, subtitle, progress)
            writer.write(cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR))
            frame_index += 1

    frames = SECONDS_PER_SCENE * FPS
    for _ in range(frames):
        progress = (frame_index + 1) / total_frames
        frame = make_outro(progress)
        writer.write(cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR))
        frame_index += 1

    writer.release()
    print(OUTPUT)


if __name__ == "__main__":
    write_video()
