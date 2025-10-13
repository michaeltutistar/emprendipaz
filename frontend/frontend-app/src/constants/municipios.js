export const MUNICIPIOS_POR_SUBREGION = {
  Abades: [
    { nombre: 'Providencia', cupo: 3 },
    { nombre: 'Samaniego', cupo: 12 },
    { nombre: 'Santacruz', cupo: 5 },
  ],
  Centro: [
    { nombre: 'Chachagüí', cupo: 7 },
    { nombre: 'La Florida', cupo: 4 },
    { nombre: 'Nariño', cupo: 3 },
    { nombre: 'Pasto', cupo: 175 },
    { nombre: 'Tangua', cupo: 6 },
    { nombre: 'Yacuanquer', cupo: 5 },
  ],
  Cordillera: [
    { nombre: 'Cumbitara', cupo: 4 },
    { nombre: 'El Rosario', cupo: 5 },
    { nombre: 'Leiva', cupo: 4 },
    { nombre: 'Policarpa', cupo: 4 },
    { nombre: 'Taminango', cupo: 8 },
  ],
  'Exprovincia de Obando': [
    { nombre: 'Aldana', cupo: 3 },
    { nombre: 'Contadero', cupo: 3 },
    { nombre: 'Córdoba', cupo: 7 },
    { nombre: 'Cuaspud', cupo: 4 },
    { nombre: 'Cumbal', cupo: 17 },
    { nombre: 'Funes', cupo: 3 },
    { nombre: 'Guachucal', cupo: 9 },
    { nombre: 'Gualmatán', cupo: 3 },
    { nombre: 'Iles', cupo: 3 },
    { nombre: 'Ipiales', cupo: 52 },
    { nombre: 'Potosí', cupo: 4 },
    { nombre: 'Puerres', cupo: 4 },
    { nombre: 'Pupiales', cupo: 8 },
  ],
  Guambuyaco: [
    { nombre: 'El Peñol', cupo: 4 },
    { nombre: 'El Tambo', cupo: 6 },
    { nombre: 'La Llanada', cupo: 3 },
    { nombre: 'Los Andes', cupo: 4 },
  ],
  Juanambú: [
    { nombre: 'Arboleda', cupo: 4 },
    { nombre: 'Buesaco', cupo: 11 },
    { nombre: 'La Unión', cupo: 14 },
    { nombre: 'San Lorenzo', cupo: 8 },
    { nombre: 'San Pedro de Cartago', cupo: 3 },
  ],
  Occidente: [
    { nombre: 'Ancuya', cupo: 4 },
    { nombre: 'Consacá', cupo: 6 },
    { nombre: 'Linares', cupo: 4 },
    { nombre: 'Sandoná', cupo: 9 },
  ],
  'Pacífico Sur': [
    { nombre: 'Francisco Pizarro', cupo: 6 },
    { nombre: 'San Andrés de Tumaco', cupo: 115 },
  ],
  'Pie de Monte Costero': [
    { nombre: 'Mallama', cupo: 4 },
    { nombre: 'Ricaurte', cupo: 9 },
  ],
  'Río Mayo': [
    { nombre: 'Albán', cupo: 4 },
    { nombre: 'Belén', cupo: 3 },
    { nombre: 'Colón', cupo: 4 },
    { nombre: 'El Tablón de Gómez', cupo: 6 },
    { nombre: 'La Cruz', cupo: 8 },
    { nombre: 'San Bernardo', cupo: 4 },
    { nombre: 'San Pablo', cupo: 7 },
  ],
  Sabana: [
    { nombre: 'Guaitarilla', cupo: 6 },
    { nombre: 'Imués', cupo: 4 },
    { nombre: 'Ospina', cupo: 4 },
    { nombre: 'Sapuyes', cupo: 6 },
    { nombre: 'Túquerres', cupo: 15 },
  ],
  Sanquianga: [
    { nombre: 'El Charco', cupo: 10 },
    { nombre: 'La Tola', cupo: 3 },
    { nombre: 'Mosquera', cupo: 6 },
    { nombre: 'Olaya Herrera', cupo: 11 },
    { nombre: 'Santa Bárbara', cupo: 6 },
  ],
  Telembí: [
    { nombre: 'Barbacoas', cupo: 25 },
    { nombre: 'Magüí', cupo: 11 },
    { nombre: 'Roberto Payán', cupo: 6 },
  ],
};

export const LISTA_MUNICIPIOS = Object.values(MUNICIPIOS_POR_SUBREGION).flat().map(m => m.nombre);


