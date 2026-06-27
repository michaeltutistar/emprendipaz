"""Capturas del foro en dashboard instructor (/instructor/foro)."""
from __future__ import annotations

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("FORO_BASE_URL", "https://emprendimiento-narino.com")
EMAIL = os.environ.get("FORO_TUTOR_EMAIL", "ayala@gmail.com")
PASSWORD = os.environ.get("FORO_TUTOR_PASSWORD", "ayala1234")
OUT_BASE = Path(
    os.environ.get(
        "FORO_CAPTURE_DIR",
        r"C:\Users\USUARIO\Downloads\Abril-Emprendipaz\capturas_foro",
    )
)

NODES = [
    ("guambuyaco", "Guambuyaco"),
    ("sabana", "Sabana"),
]


def login(page) -> bool:
    page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=120_000)
    page.fill('input[type="email"], input[name="email"]', EMAIL)
    page.fill('input[type="password"], input[name="password"]', PASSWORD)
    captcha = page.locator('button:has-text("Soy humano")')
    if captcha.count():
        captcha.first.click()
        page.wait_for_timeout(2500)
    page.locator('button[type="submit"]:not([disabled])').click(timeout=60_000)
    page.wait_for_timeout(5000)
    return "/login" not in page.url


def capture_node(page, slug: str, label: str, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    page.goto(f"{BASE_URL}/instructor/foro", wait_until="networkidle", timeout=120_000)
    page.wait_for_timeout(2000)
    page.locator(f"button:has-text('{label}')").first.click(timeout=30_000)
    page.wait_for_timeout(3000)
    page.screenshot(path=str(out_dir / "01_lista_hilos_nodo.png"), full_page=False)

    # Abrir el hilo con más respuestas (primero de la lista tras cargar nodo).
    thread_buttons = page.locator("button").filter(has_text="respuesta")
    if thread_buttons.count() == 0:
        thread_buttons = page.locator("[class*='rounded-lg'][class*='border']").locator("button")
    if thread_buttons.count():
        thread_buttons.first.click(timeout=20_000)
        page.wait_for_timeout(2500)
    page.screenshot(path=str(out_dir / "02_hilo_principal_respuestas.png"), full_page=False)


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        if not login(page):
            browser.close()
            raise SystemExit("Login tutor falló")
        for slug, label in NODES:
            capture_node(page, slug, label, OUT_BASE / slug)
            print("Capturas:", OUT_BASE / slug)
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
