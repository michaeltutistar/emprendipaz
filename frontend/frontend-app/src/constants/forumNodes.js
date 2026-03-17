const FORUM_NODES = [
  {
    slug: 'centro',
    name: 'Centro',
    central: 'Pasto',
    municipios: ['Pasto', 'Chachagüí', 'La Florida', 'Nariño', 'Tangua', 'Yacuanquer'],
  },
  {
    slug: 'abades',
    name: 'Abades',
    central: 'Samaniego',
    municipios: ['Providencia', 'Samaniego', 'Santacruz'],
  },
  {
    slug: 'cordillera',
    name: 'Cordillera',
    central: 'Taminango',
    municipios: ['Cumbitara', 'El Rosario', 'Leiva', 'Policarpa', 'Taminango'],
  },
  {
    slug: 'exprovincia-obando',
    name: 'Exprovincia de Obando',
    central: 'Ipiales',
    municipios: ['Aldana', 'Contadero', 'Córdoba', 'Cuaspud', 'Cumbal', 'Funes', 'Guachucal', 'Gualmatán', 'Iles', 'Ipiales', 'Potosí', 'Puerres', 'Pupiales'],
  },
  {
    slug: 'guambuyaco',
    name: 'Guambuyaco',
    central: 'El Tambo',
    municipios: ['El Peñol', 'El Tambo', 'La Llanada', 'Los Andes'],
  },
  {
    slug: 'juanambu',
    name: 'Juanambú',
    central: 'La Unión',
    municipios: ['Arboleda', 'Buesaco', 'La Unión', 'San Lorenzo', 'San Pedro de Cartago'],
  },
  {
    slug: 'occidente',
    name: 'Occidente',
    central: 'Sandoná',
    municipios: ['Ancuya', 'Consacá', 'Linares', 'Sandoná'],
  },
  {
    slug: 'rio-mayo',
    name: 'Río Mayo',
    central: 'La Cruz',
    municipios: ['Albán', 'Belén', 'Colón', 'El Tablón de Gómez', 'La Cruz', 'San Bernardo', 'San Pablo'],
  },
  {
    slug: 'costa-pacifica',
    name: 'Costa Pacífica',
    central: 'Tumaco',
    municipios: ['Francisco Pizarro', 'Tumaco', 'El Charco', 'La Tola', 'Mosquera', 'Olaya Herrera', 'Santa Bárbara'],
  },
  {
    slug: 'sabana',
    name: 'Sabana',
    central: 'Túquerres',
    municipios: ['Guaitarilla', 'Imués', 'Ospina', 'Sapuyes', 'Túquerres', 'Ricaurte', 'Mallama'],
  },
  {
    slug: 'telembi',
    name: 'Telembí',
    central: 'Barbacoas',
    municipios: ['Barbacoas', 'Magüí', 'Roberto Payán'],
  },
]

const MUNICIPIO_ALIASES = {
  chachagui: 'Chachagüí',
  cordoba: 'Córdoba',
  gualmatan: 'Gualmatán',
  potosi: 'Potosí',
  sandona: 'Sandoná',
  alban: 'Albán',
  belen: 'Belén',
  'el tablon de gomez': 'El Tablón de Gómez',
  tuquerres: 'Túquerres',
  imues: 'Imués',
  'santa barbara': 'Santa Bárbara',
  'santa barbara de iscuande': 'Santa Bárbara',
  magui: 'Magüí',
  'magui payan': 'Magüí',
  'roberto payan': 'Roberto Payán',
  'san andres de tumaco': 'Tumaco',
  yaquanquer: 'Yacuanquer',
}

export function normalizeForumLocation(value) {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getForumNodes() {
  return FORUM_NODES.map((node) => ({ ...node, municipios: [...node.municipios] }))
}

export function resolveForumNodeByMunicipio(municipio) {
  const normalized = normalizeForumLocation(municipio)
  const normalizedWithAlias = normalizeForumLocation(MUNICIPIO_ALIASES[normalized] || normalized)

  return (
    FORUM_NODES.find((node) =>
      node.municipios.some((candidate) => normalizeForumLocation(candidate) === normalizedWithAlias)
    ) || null
  )
}
