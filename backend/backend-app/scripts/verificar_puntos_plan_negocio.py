"""
Verificar en la BD los registros de puntos_plan_negocio para usuarios 10 (Elena) y 1883 (Nicolás).
Uso (con DATABASE_URL en el entorno o en .env):
  cd backend/backend-app
  python scripts/verificar_puntos_plan_negocio.py

O con variable de entorno:
  set DATABASE_URL=postgresql+psycopg://user:pass@host:5432/db
  python scripts/verificar_puntos_plan_negocio.py
"""
import os
import sys

def main():
    url = os.environ.get('DATABASE_URL')
    if not url:
        print('No hay DATABASE_URL. Exporta la variable o crea .env con DATABASE_URL.')
        print('Ejemplo: postgresql+psycopg://user:pass@host:5432/elearning_narino')
        sys.exit(1)

    try:
        import psycopg
    except ImportError:
        print('Instala psycopg: pip install psycopg[binary]')
        sys.exit(1)

    # Ajustar URL si viene en formato sqlalchemy (postgresql+psycopg://)
    conn_str = url.replace('postgresql+psycopg://', 'postgresql://') if 'postgresql+psycopg' in url else url

    ids = [10, 1883]
    with psycopg.connect(conn_str) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id, nombre, apellido FROM "user" WHERE id = ANY(%s)', (ids,))
            users = {r[0]: (r[1] or '', r[2] or '') for r in cur.fetchall()}
            cur.execute("""
                SELECT usuario_id, modulo_nombre, puntos, fecha_registro
                FROM puntos_plan_negocio
                WHERE usuario_id = ANY(%s)
                ORDER BY usuario_id, modulo_nombre
            """, (ids,))
            rows = cur.fetchall()

    by_user = {uid: [] for uid in ids}
    for uid, mod, puntos, fecha in rows:
        by_user[uid].append((mod, puntos, fecha))

    for uid in ids:
        nombre, apellido = users.get(uid, ('', ''))
        registros = by_user.get(uid, [])
        full = f"{nombre} {apellido}".strip() or f"ID {uid}"
        print(f"\n--- Usuario {uid}: {full} ---")
        if uid not in users:
            print("  (usuario no encontrado en BD)")
            continue
        if not registros:
            print("  Sin registros en puntos_plan_negocio.")
            continue
        total = 0
        for mod, puntos, fecha in registros:
            total += puntos or 0
            print(f"  {mod}: {puntos} pts  ({fecha})")
        print(f"  Total puntos: {total}")

if __name__ == '__main__':
    main()
