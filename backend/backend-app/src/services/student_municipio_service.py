from __future__ import annotations

import csv
from functools import lru_cache
from pathlib import Path
from typing import Dict, Optional, Tuple


def _normalize_text(value: Optional[str]) -> str:
    if not value:
        return ''

    normalized = str(value).strip().lower()
    replacements = (
        ('á', 'a'),
        ('é', 'e'),
        ('í', 'i'),
        ('ó', 'o'),
        ('ú', 'u'),
        ('ü', 'u'),
        ('ñ', 'n'),
    )
    for source, target in replacements:
        normalized = normalized.replace(source, target)

    return ' '.join(normalized.split())


def _candidate_csv_paths() -> list[Path]:
    current = Path(__file__).resolve()
    return [
        current.parents[1] / 'data' / 'municipios.csv',
        current.parents[4] / 'frontend' / 'frontend-app' / 'public' / 'municipios.csv',
    ]


@lru_cache(maxsize=1)
def _load_operational_municipio_maps() -> Tuple[Dict[int, str], Dict[str, str]]:
    by_id: Dict[int, str] = {}
    by_name: Dict[str, str] = {}

    for candidate in _candidate_csv_paths():
        if not candidate.exists():
            continue

        try:
            with candidate.open('r', encoding='latin-1', newline='') as handle:
                reader = csv.DictReader(handle, delimiter=';')
                for row in reader:
                    raw_id = (row.get('ID') or '').strip()
                    nombre = (row.get('Nombre ') or row.get('Nombre') or '').strip()
                    apellido = (row.get('Apellido') or '').strip()
                    municipio = (row.get('Municipio') or '').strip()

                    if not municipio:
                        continue

                    try:
                        if raw_id:
                            by_id[int(raw_id)] = municipio
                    except ValueError:
                        pass

                    full_name = _normalize_text(f'{nombre} {apellido}')
                    if full_name:
                        by_name[full_name] = municipio

            if by_id or by_name:
                break
        except Exception:
            continue

    return by_id, by_name


def get_preferred_municipio(user_id: Optional[int], nombre_completo: Optional[str] = None, fallback_municipio: Optional[str] = None) -> Optional[str]:
    by_id, by_name = _load_operational_municipio_maps()

    if user_id is not None:
        try:
            municipio = by_id.get(int(user_id))
            if municipio:
                return municipio
        except Exception:
            pass

    normalized_name = _normalize_text(nombre_completo)
    if normalized_name and normalized_name in by_name:
        return by_name[normalized_name]

    return fallback_municipio
