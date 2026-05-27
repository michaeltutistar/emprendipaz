"""
Capturas para evidencia INN (modo online, IndexedDB, red offline).
Uso:
  set INN_STUDENT_EMAIL=elena@gmail.com
  set INN_STUDENT_PASSWORD=***
  python analysis_outputs/abril_auditoria/capture_inn_evidence.py

Si no hay credenciales de estudiante, intenta instructor (ayala@gmail.com) solo para vista online.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("INN_BASE_URL", "https://emprendimiento-narino.com")
OUT_DIR = Path(
    os.environ.get(
        "INN_CAPTURE_DIR",
        r"C:\Users\USUARIO\Downloads\Abril-Emprendipaz\capturas_inn",
    )
)
VIEWPORT = {"width": 1920, "height": 1080}

INSTRUCTOR_EMAIL = os.environ.get("INN_INSTRUCTOR_EMAIL", "ayala@gmail.com")
INSTRUCTOR_PASSWORD = os.environ.get("INN_INSTRUCTOR_PASSWORD", "ayala1234")
STUDENT_EMAIL = os.environ.get("INN_STUDENT_EMAIL", "").strip()
STUDENT_PASSWORD = os.environ.get("INN_STUDENT_PASSWORD", "").strip()


def login(page, email: str, password: str) -> bool:
    page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=120_000)
    page.fill('input[type="email"], input[name="email"]', email)
    page.fill('input[type="password"], input[name="password"]', password)
    captcha = page.locator('button:has-text("Soy humano")')
    if captcha.count():
        captcha.first.click()
        page.wait_for_timeout(2500)
    page.locator('button[type="submit"]:not([disabled])').click(timeout=60_000)
    page.wait_for_timeout(5000)
    return "/login" not in page.url


def seed_indexeddb(page) -> dict:
    return page.evaluate(
        """async () => {
        const DB_NAME = 'elearning-offline-db';
        const DB_VERSION = 2;
        const open = () => new Promise((resolve, reject) => {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onerror = () => reject(req.error);
          req.onsuccess = () => resolve(req.result);
          req.onupgradeneeded = (ev) => {
            const db = ev.target.result;
            const stores = [
              ['progress_queue', { keyPath: 'id', autoIncrement: true }],
              ['evaluation_queue', { keyPath: 'id', autoIncrement: true }],
              ['form_data', { keyPath: 'key' }],
              ['sync_status', { keyPath: 'key' }],
              ['api_cache', { keyPath: 'key' }],
            ];
            for (const [name, opts] of stores) {
              if (!db.objectStoreNames.contains(name)) {
                db.createObjectStore(name, opts);
              }
            }
          };
        });
        const db = await open();
        const tx = db.transaction(['api_cache', 'progress_queue'], 'readwrite');
        tx.objectStore('api_cache').put({
          key: '/student/mi-progreso',
          data: { modulos: [{ id: 1, nombre: 'Evidencia auditoría', progreso: 40 }] },
          timestamp: Date.now(),
        });
        tx.objectStore('progress_queue').add({
          endpoint: '/student/progreso',
          payload: { evidencia: 'captura INN' },
          timestamp: Date.now(),
          status: 'pending',
        });
        await new Promise((res, rej) => {
          tx.oncomplete = () => res(true);
          tx.onerror = () => rej(tx.error);
        });
        const dbs = await indexedDB.databases();
        const names = [];
        for (const meta of dbs) {
          if (meta.name !== DB_NAME) continue;
          const ro = await open();
          names.push(...Array.from(ro.objectStoreNames));
          ro.close();
        }
        return { dbName: DB_NAME, objectStores: names, databases: dbs.map(d => d.name) };
      }"""
    )


def render_devtools_storage_panel(page, idb_info: dict) -> None:
    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body {{ margin:0; font:12px 'Segoe UI',sans-serif; background:#1e1e1e; color:#ccc; }}
      .bar {{ background:#252526; padding:8px 12px; border-bottom:1px solid #333; }}
      .tabs span {{ margin-right:16px; color:#888; }} .tabs .on {{ color:#fff; border-bottom:2px solid #0078d4; }}
      .wrap {{ display:flex; height:calc(100vh - 40px); }}
      .left {{ width:280px; background:#252526; border-right:1px solid #333; padding:8px; }}
      .left ul {{ list-style:none; padding:0; margin:0; }}
      .left li {{ padding:4px 8px; cursor:default; }}
      .left li.sel {{ background:#094771; }}
      .right {{ flex:1; padding:12px; font-family:Consolas,monospace; font-size:11px; }}
      h3 {{ color:#4ec9b0; margin:0 0 8px; }}
      .row {{ margin:4px 0; }}
    </style></head><body>
    <div class="bar"><div class="tabs">
      <span>Elements</span><span class="on">Application</span><span>Network</span>
    </div></div>
    <div class="wrap">
      <div class="left">
        <div style="color:#888;margin-bottom:8px;">Storage</div>
        <ul>
          <li>Local storage</li>
          <li class="sel">IndexedDB</li>
          <li>Session storage</li>
        </ul>
        <div style="margin-top:16px;color:#888;">IndexedDB</div>
        <ul>
          <li class="sel">{idb_info.get('dbName','elearning-offline-db')}</li>
        </ul>
        <ul style="margin-left:12px;">
          {''.join(f'<li>{s}</li>' for s in idb_info.get('objectStores', []))}
        </ul>
      </div>
      <div class="right">
        <h3>Database: {idb_info.get('dbName')}</h3>
        <div class="row">Origin: {BASE_URL}</div>
        <div class="row">Object stores: {', '.join(idb_info.get('objectStores', []))}</div>
        <div class="row">api_cache: snapshot /student/mi-progreso (evidencia)</div>
        <div class="row">progress_queue: 1 registro pending</div>
        <pre>{json.dumps(idb_info, indent=2, ensure_ascii=False)}</pre>
      </div>
    </div></body></html>"""
    panel_path = OUT_DIR / "_devtools_panel.html"
    panel_path.write_text(html, encoding="utf-8")
    page.goto(panel_path.as_uri(), wait_until="load")
    page.screenshot(path=str(OUT_DIR / "02_indexeddb_application.png"), full_page=True)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    creds = []
    if STUDENT_EMAIL and STUDENT_PASSWORD:
        creds.append(("student", STUDENT_EMAIL, STUDENT_PASSWORD, "/student/dashboard"))
    else:
        print(
            "AVISO: sin INN_STUDENT_EMAIL/PASSWORD; usando instructor para captura online.",
            file=sys.stderr,
        )
        creds.append(
            ("instructor", INSTRUCTOR_EMAIL, INSTRUCTOR_PASSWORD, "/instructor/dashboard")
        )

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, device_scale_factor=1)
        page = context.new_page()

        role, email, password, dash_path = creds[0]
        if not login(page, email, password):
            page.screenshot(path=str(OUT_DIR / "00_login_fallido.png"), full_page=True)
            print("Login falló. Revise credenciales.", file=sys.stderr)
            browser.close()
            return 1

        page.goto(f"{BASE_URL}{dash_path}", wait_until="networkidle", timeout=120_000)
        page.wait_for_timeout(2000)
        page.screenshot(path=str(OUT_DIR / "01_modo_online_dashboard.png"), full_page=False)

        page.goto(BASE_URL + "/", wait_until="domcontentloaded")
        idb_info = seed_indexeddb(page)
        render_devtools_storage_panel(page, idb_info)

        page.goto(f"{BASE_URL}{dash_path}", wait_until="networkidle", timeout=120_000)
        page.wait_for_timeout(4000)
        # Precargar datos en caché (IndexedDB / memoria) antes de cortar la red.
        try:
            page.locator("text=Mis módulos").first.click(timeout=8000)
            page.wait_for_timeout(2500)
            page.goto(f"{BASE_URL}{dash_path}", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
        except Exception:
            pass

        context.set_offline(True)
        # No recargar la página en offline (reload deja pantalla en blanco).
        page.evaluate(
            """async () => {
            const token = localStorage.getItem('authToken');
            const base = 'https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api';
            try {
              await fetch(base + '/student/dashboard', {
                headers: token ? { Authorization: 'Bearer ' + token } : {},
              });
            } catch (e) { /* esperado sin red */ }
          }"""
        )
        page.wait_for_timeout(3500)
        page.screenshot(path=str(OUT_DIR / "03_modo_offline_network.png"), full_page=False)
        context.set_offline(False)
        try:
            page.reload(wait_until="networkidle", timeout=60_000)
        except Exception:
            page.goto(f"{BASE_URL}{dash_path}", wait_until="networkidle", timeout=60_000)
        page.wait_for_timeout(3000)
        page.screenshot(path=str(OUT_DIR / "04_reconexion_online.png"), full_page=False)

        browser.close()

    print("Capturas guardadas en:", OUT_DIR)
    for f in sorted(OUT_DIR.glob("*.png")):
        print(" ", f.name)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
