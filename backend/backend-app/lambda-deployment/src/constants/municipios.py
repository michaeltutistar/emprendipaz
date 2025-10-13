MUNICIPIOS_POR_SUBREGION = {
    "Abades": ["Providencia", "Samaniego", "Santacruz"],
    "Centro": ["Chachagüí", "La Florida", "Nariño", "Pasto", "Tangua", "Yacuanquer"],
    "Cordillera": ["Cumbitara", "El Rosario", "Leiva", "Policarpa", "Taminango"],
    "Exprovincia de Obando": [
        "Aldana", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Funes", "Guachucal",
        "Gualmatán", "Iles", "Ipiales", "Potosí", "Puerres", "Pupiales"
    ],
    "Guambuyaco": ["El Peñol", "El Tambo", "La Llanada", "Los Andes"],
    "Juanambú": ["Arboleda", "Buesaco", "La Unión", "San Lorenzo", "San Pedro de Cartago"],
    "Occidente": ["Ancuya", "Consacá", "Linares", "Sandoná"],
    "Pacífico Sur": ["Francisco Pizarro", "San Andrés de Tumaco"],
    "Pie de Monte Costero": ["Mallama", "Ricaurte"],
    "Río Mayo": ["Albán", "Belén", "Colón", "El Tablón de Gómez", "La Cruz", "San Bernardo", "San Pablo"],
    "Sabana": ["Guaitarilla", "Imués", "Ospina", "Sapuyes", "Túquerres"],
    "Sanquianga": ["El Charco", "La Tola", "Mosquera", "Olaya Herrera", "Santa Bárbara"],
    "Telembí": ["Barbacoas", "Magüí", "Roberto Payán"],
}

LISTA_MUNICIPIOS = sorted({m for lista in MUNICIPIOS_POR_SUBREGION.values() for m in lista})

# Cupos por municipio (valores de los TDR)
MUNICIPIO_A_CUPO = {
    'Providencia': 3, 'Samaniego': 12, 'Santacruz': 5,
    'Chachagüí': 7, 'La Florida': 4, 'Nariño': 3, 'Pasto': 175, 'Tangua': 6, 'Yacuanquer': 5,
    'Cumbitara': 4, 'El Rosario': 5, 'Leiva': 4, 'Policarpa': 4, 'Taminango': 8,
    'Aldana': 3, 'Contadero': 3, 'Córdoba': 7, 'Cuaspud': 4, 'Cumbal': 17, 'Funes': 3, 'Guachucal': 9,
    'Gualmatán': 3, 'Iles': 3, 'Ipiales': 52, 'Potosí': 4, 'Puerres': 4, 'Pupiales': 8,
    'El Peñol': 4, 'El Tambo': 6, 'La Llanada': 3, 'Los Andes': 4,
    'Arboleda': 4, 'Buesaco': 11, 'La Unión': 14, 'San Lorenzo': 8, 'San Pedro de Cartago': 3,
    'Ancuya': 4, 'Consacá': 6, 'Linares': 4, 'Sandoná': 9,
    'Francisco Pizarro': 6, 'San Andrés de Tumaco': 115,
    'Mallama': 4, 'Ricaurte': 9,
    'Albán': 4, 'Belén': 3, 'Colón': 4, 'El Tablón de Gómez': 6, 'La Cruz': 8, 'San Bernardo': 4, 'San Pablo': 7,
    'Guaitarilla': 6, 'Imués': 4, 'Ospina': 4, 'Sapuyes': 6, 'Túquerres': 15,
    'El Charco': 10, 'La Tola': 3, 'Mosquera': 6, 'Olaya Herrera': 11, 'Santa Bárbara': 6,
    'Barbacoas': 25, 'Magüí': 11, 'Roberto Payán': 6,
}


