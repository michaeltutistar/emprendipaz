"""Capturas reales del foro (dashboard instructor) para Rio Mayo y Juanambu."""
from __future__ import annotations

import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("FORO_BASE_URL", "https://emprendimiento-narino.com")
EMAIL = os.environ.get("FORO_TUTOR_EMAIL", "ayala@gmail.com")
PASSWORD = os.environ.get("FORO_TUTOR_PASSWORD", "ayala1234")
OUT_BASE = Path(r"C:\Users\USUARIO\Documents\e-learning-platform\analysis_outputs\foro_nodos\capturas")
LAMBDA = Path(r"C:\Users\USUARIO\Documents\e-learning-platform\_lambda_patch")

NODES = [
    ("rio_mayo", "Río Mayo", "foro_rio_mayo_clean.json"),
    ("juanambu", "Juanambú", "foro_juanambu_clean.json"),
]


def top_student_snippet(json_name: str) -> str:
    data = json.loads((LAMBDA / json_name).read_text(encoding="utf-8"))
    student_threads = []
    for t in data["threads"]:
        author = t.get("author") or {}
        if (author.get("rol") or "").lower() == "instructor":
            continue
        q = " ".join((t.get("question") or "").split())
        student_threads.append((len(t.get("replies") or []), q))
    student_threads.sort(key=lambda x: -x[0])
    q = student_threads[0][1]
    # fragmento corto y unico para localizar el hilo en la UI
    for size in (60, 45, 30):
        snippet = q[:size].strip()
        if snippet:
            return snippet
    return q[:30]


def login(page) -> bool:
    page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=120_000)
    page.fill('input[type="email"], input[name="email"]', EMAIL)
    page.fill('input[type="password"], input[name="password"]', PASSWORD)
    captcha = page.locator('button:has-text("Soy humano")')
    if captcha.count():
        captcha.first.click()
        page.wait_for_timeout(2500)
    page.locator('button[type="submit"]:not([disabled])').click(timeout=60_000)
    page.wait_for_timeout(6000)
    print("URL tras login:", page.url)
    return "/login" not in page.url


def capture_node(page, slug: str, label: str, student_snippet: str, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    page.goto(f"{BASE_URL}/instructor/foro", wait_until="networkidle", timeout=120_000)
    page.wait_for_timeout(2500)
    try:
        page.locator(f"button:has-text('{label}')").first.click(timeout=30_000)
    except Exception as e:
        print(f"  [WARN] no encontre boton de nodo '{label}': {e}")
    page.wait_for_timeout(3500)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    page.screenshot(path=str(out_dir / "01_lista_hilos_nodo.png"), full_page=False)
    print("  guardada lista hilos")

    opened = False
    try:
        page.get_by_text("Describe una acción concreta", exact=False).first.click(timeout=15_000)
        opened = True
    except Exception as e:
        print(f"  [WARN] no pude abrir hilo principal: {e}")
    # esperar a que cargue el panel de detalle con las respuestas
    try:
        page.wait_for_selector("text=Detalle del hilo", timeout=15_000)
    except Exception:
        pass
    page.wait_for_timeout(3500)
    try:
        page.get_by_text("Detalle del hilo", exact=False).first.scroll_into_view_if_needed(timeout=8_000)
    except Exception:
        page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(800)
    page.screenshot(path=str(out_dir / "02_hilo_principal_respuestas.png"), full_page=False)
    print("  guardada hilo principal")

    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(800)
    try:
        target = page.get_by_text(student_snippet, exact=False).first
        target.scroll_into_view_if_needed(timeout=12_000)
        target.click(timeout=15_000)
    except Exception as e:
        print(f"  [WARN] no pude abrir hilo de estudiante: {e}")
    try:
        page.wait_for_selector('button:has-text("Dar retroalimentación")', timeout=15_000)
    except Exception:
        pass
    page.wait_for_timeout(2000)
    try:
        detail = page.get_by_text("Detalle del hilo", exact=False).first
        detail.scroll_into_view_if_needed(timeout=8_000)
        page.wait_for_timeout(500)
        page.evaluate("window.scrollBy(0, 280)")
    except Exception:
        page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.55)")
    page.wait_for_timeout(800)
    page.screenshot(path=str(out_dir / "03_hilo_estudiante_respuestas.png"), full_page=False)
    print("  guardada hilo estudiante")


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()
        if not login(page):
            browser.close()
            raise SystemExit("Login tutor fallo")
        for slug, label, json_name in NODES:
            print("Nodo:", label)
            snippet = top_student_snippet(json_name)
            print("  hilo estudiante:", snippet[:70], "...")
            capture_node(page, slug, label, snippet, OUT_BASE / slug)
        browser.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
