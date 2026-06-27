from __future__ import annotations

import re
from typing import Dict, List, Optional


FORUM_NODES: List[dict] = [
    {
        'slug': 'centro',
        'name': 'Centro',
        'central': 'Pasto',
        'municipios': ['Pasto', 'Chachagüí', 'La Florida', 'Nariño', 'Tangua', 'Yacuanquer'],
    },
    {
        'slug': 'abades',
        'name': 'Abades',
        'central': 'Samaniego',
        'municipios': ['Providencia', 'Samaniego', 'Santacruz'],
    },
    {
        'slug': 'cordillera',
        'name': 'Cordillera',
        'central': 'Taminango',
        'municipios': ['Cumbitara', 'El Rosario', 'Leiva', 'Policarpa', 'Taminango'],
    },
    {
        'slug': 'exprovincia-obando',
        'name': 'Exprovincia de Obando',
        'central': 'Ipiales',
        'municipios': ['Aldana', 'Contadero', 'Córdoba', 'Cuaspud', 'Cumbal', 'Funes', 'Guachucal', 'Gualmatán', 'Iles', 'Ipiales', 'Potosí', 'Puerres', 'Pupiales'],
    },
    {
        'slug': 'guambuyaco',
        'name': 'Guambuyaco',
        'central': 'El Tambo',
        'municipios': ['El Peñol', 'El Tambo', 'La Llanada', 'Los Andes'],
    },
    {
        'slug': 'juanambu',
        'name': 'Juanambú',
        'central': 'La Unión',
        'municipios': ['Arboleda', 'Buesaco', 'La Unión', 'San Lorenzo', 'San Pedro de Cartago'],
    },
    {
        'slug': 'occidente',
        'name': 'Occidente',
        'central': 'Sandoná',
        'municipios': ['Ancuya', 'Consacá', 'Linares', 'Sandoná'],
    },
    {
        'slug': 'rio-mayo',
        'name': 'Río Mayo',
        'central': 'La Cruz',
        'municipios': ['Albán', 'Belén', 'Colón', 'El Tablón de Gómez', 'La Cruz', 'San Bernardo', 'San Pablo'],
    },
    {
        'slug': 'costa-pacifica',
        'name': 'Costa Pacífica',
        'central': 'Tumaco',
        'municipios': ['Francisco Pizarro', 'Tumaco', 'El Charco', 'La Tola', 'Mosquera', 'Olaya Herrera', 'Santa Bárbara'],
    },
    {
        'slug': 'sabana',
        'name': 'Sabana',
        'central': 'Túquerres',
        'municipios': ['Guaitarilla', 'Imués', 'Ospina', 'Sapuyes', 'Túquerres', 'Ricaurte', 'Mallama'],
    },
    {
        'slug': 'telembi',
        'name': 'Telembí',
        'central': 'Barbacoas',
        'municipios': ['Barbacoas', 'Magüí', 'Roberto Payán'],
    },
]


MUNICIPIO_ALIASES: Dict[str, str] = {
    'chachagui': 'Chachagüí',
    'la florida': 'La Florida',
    'cordoba': 'Córdoba',
    'gualmatan': 'Gualmatán',
    'potosi': 'Potosí',
    'juanambu': 'Juanambú',
    'rio mayo': 'Río Mayo',
    'riomayo': 'Río Mayo',
    'tuquerres': 'Túquerres',
    'imués': 'Imués',
    'imues': 'Imués',
    'sandona': 'Sandoná',
    'alban': 'Albán',
    'belen': 'Belén',
    'el tablon de gomez': 'El Tablón de Gómez',
    'santa barbara': 'Santa Bárbara',
    'santa barbara de iscuande': 'Santa Bárbara',
    'magui': 'Magüí',
    'magui payan': 'Magüí',
    'roberto payan': 'Roberto Payán',
    'san andres de tumaco': 'Tumaco',
    'yaquanquer': 'Yacuanquer',
}


def normalize_forum_location(value: Optional[str]) -> str:
    if not value:
        return ''

    normalized = value.strip().lower()
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

    normalized = re.sub(r'[^a-z0-9\s]', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    return normalized


def get_forum_nodes() -> List[dict]:
    return [
        {
            'slug': node['slug'],
            'name': node['name'],
            'central': node['central'],
            'municipios': list(node['municipios']),
        }
        for node in FORUM_NODES
    ]


def get_forum_node_by_slug(node_slug: Optional[str]) -> Optional[dict]:
    if not node_slug:
        return None

    slug = normalize_forum_location(node_slug).replace(' ', '-')
    for node in FORUM_NODES:
        if node['slug'] == slug:
            return {
                'slug': node['slug'],
                'name': node['name'],
                'central': node['central'],
                'municipios': list(node['municipios']),
            }
    return None


def resolve_forum_node(municipio: Optional[str]) -> Optional[dict]:
    normalized = normalize_forum_location(municipio)
    if not normalized:
        return None

    normalized = normalize_forum_location(MUNICIPIO_ALIASES.get(normalized, normalized))

    for node in FORUM_NODES:
        for candidate in node['municipios']:
            if normalize_forum_location(candidate) == normalized:
                return {
                    'slug': node['slug'],
                    'name': node['name'],
                    'central': node['central'],
                    'municipios': list(node['municipios']),
                }
    return None
