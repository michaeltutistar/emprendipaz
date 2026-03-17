import React, { useState } from 'react';

import { X, BookMarked, Search } from 'lucide-react';

import { Button } from '../ui/button';



const glosarioLiderazgo = [

  {

    termino: 'Clima laboral',

    definicion:

      'Ambiente psicológico y social que se percibe en un lugar de trabajo, influido por relaciones, motivación y condiciones organizacionales.',

    categoria: 'Ambiente Organizacional'

  },

  {

    termino: 'Competitividad en el mercado',

    definicion:

      'Capacidad de una empresa para mantener o mejorar su posición frente a competidores, ofreciendo productos o servicios con mayor valor, calidad o innovación.',

    categoria: 'Estrategia Empresarial'

  },

  {

    termino: 'Comunicación efectiva',

    definicion:

      'Proceso de transmitir mensajes de manera clara, precisa y comprensible, asegurando que el receptor entienda la intención y el contenido.',

    categoria: 'Habilidades de Liderazgo'

  },

  {

    termino: 'Cultura organizacional',

    definicion:

      'Conjunto de valores, creencias, normás y prácticas compartidas que definen la identidad y funcionamiento de una organización.',

    categoria: 'Ambiente Organizacional'

  },

  {

    termino: 'Estilos de liderazgo',

    definicion:

      'Diferentes formás de ejercer la dirección de un equipo, que varían en el grado de autoridad, participación, cercanía emocional y orientación a resultados.',

    categoria: 'Habilidades de Liderazgo'

  },

  {

    termino: 'Gestión de equipos',

    definicion:

      'Conjunto de prácticas para organizar, coordinar y motivar a un grupo de personas hacia objetivos comunes.',

    categoria: 'Habilidades de Liderazgo'

  },

  {

    termino: 'Inspiración emocional',

    definicion:

      'Energía positiva que un líder transmite para despertar entusiasmo, compromiso y sentido de propósito en su equipo.',

    categoria: 'Habilidades de Liderazgo'

  },

  {

    termino: 'Reputación de marca',

    definicion:

      'Percepción que tienen los consumidores y el público sobre una empresa, basada en experiencias, comunicación y valores asociados a la marca.',

    categoria: 'Estrategia Empresarial'

  },

  {

    termino: 'Trilogía de la comunicación efectiva',

    definicion:

      'Modelo que plantea tres dimensiones esenciales de la comunicación de un líder: claridad en el mensaje, empatía con el receptor y coherencia entre lo que se dice y lo que se hace.',

    categoria: 'Habilidades de Liderazgo'

  },

  {

    termino: 'Visión',

    definicion:

      'Imagen clara y motivadora del futuro que orienta las acciones de un equipo o empresa hacia objetivos estratégicos.',

    categoria: 'Habilidades de Liderazgo'

  }

];



const GlosarioLiderazgoModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [expandedTerms, setExpandedTerms] = useState(new Set());



  // Obtener categorías únicas

  const categorias = ['Todas', ...new Set(glosarioLiderazgo.map((item) => item.categoria))];



  // Filtrar glosario

  const filteredGlosario = glosarioLiderazgo.filter((item) => {

    const matchesSearch =

      item.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||

      item.definicion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || item.categoria === selectedCategory;

    return matchesSearch && matchesCategory;

  });



  const toggleTerm = (termino) => {

    const newExpanded = new Set(expandedTerms);

    if (newExpanded.has(termino)) {

      newExpanded.delete(termino);

    } else {

      newExpanded.add(termino);

    }

    setExpandedTerms(newExpanded);

  };



  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">

        {/* Header */}

        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white p-6 rounded-t-2xl flex-shrink-0">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <BookMarked className="w-8 h-8" />

              <div>

                <h2 className="text-2xl font-bold">Glosario: Liderazgo</h2>

                <p className="text-green-100 text-sm mt-1">Modulo 10 - Liderazgo</p>

              </div>

            </div>

            <button

              onClick={onClose}

              className="text-white hover:bg-green-900 rounded-full p-2 transition-colors"

            >

              <X className="w-6 h-6" />

            </button>

          </div>

        </div>



        {/* Filtros */}

        <div className="border-b border-green-200 p-6 bg-gradient-to-br from-green-50 to-blue-50 flex-shrink-0">

          {/* Búsqueda */}

          <div className="relative mb-4">

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input

              type="text"

              placeholder="Buscar término..."

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-800 transition-colors"

            />

          </div>



          {/* Categorías */}

          <div className="flex gap-2 flex-wrap">

            {categorias.map((categoria) => (

              <button

                key={categoria}

                onClick={() => setSelectedCategory(categoria === 'Todas' ? null : categoria)}

                className={`px-4 py-2 rounded-full text-sm transition-all ${

                  selectedCategory === categoria || (categoria === 'Todas' && !selectedCategory)

                    ? 'bg-green-800 text-white'

                    : 'bg-white text-gray-700 border border-green-300 hover:border-green-800'

                }`}

              >

                {categoria}

              </button>

            ))}

          </div>

        </div>



        {/* Lista de Términos */}

        <div className="flex-1 overflow-y-auto p-6">

          {filteredGlosario.length === 0 ? (

            <div className="text-center py-12 text-gray-500">

              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />

              <p>No se encontraron términos que coincidan con tu búsqueda</p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {filteredGlosario.map((item, index) => (

                <div

                  key={index}

                  onClick={() => toggleTerm(item.termino)}

                  className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 border-2 border-green-200 hover:border-green-600 transition-all cursor-pointer group"

                >

                  <div className="flex items-start justify-between mb-2">

                    <h4 className="text-gray-900 font-bold text-base group-hover:text-green-800">

                      {item.termino}

                    </h4>

                    <span className="bg-green-800 text-white text-xs px-3 py-1 rounded-full">

                      {item.categoria}

                    </span>

                  </div>

                  <p

                    className={`text-gray-700 leading-relaxed text-sm ${

                      expandedTerms.has(item.termino) ? '' : 'line-clamp-2'

                    }`}

                  >

                    {item.definicion}

                  </p>

                  {!expandedTerms.has(item.termino) && item.definicion.length > 100 && (

                    <button className="text-green-800 text-sm font-bold mt-2 hover:underline">

                      Ver más

                    </button>

                  )}

                </div>

              ))}

            </div>

          )}

        </div>



        {/* Footer */}

        <div className="border-t border-green-200 p-6 bg-gradient-to-br from-green-50 to-blue-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {filteredGlosario.length}{' '}

            {filteredGlosario.length === 1 ? 'término encontrado' : 'términos encontrados'}

          </p>

          <Button

            onClick={onClose}

            className="bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-lg"

          >

            Cerrar

          </Button>

        </div>

      </div>

    </div>

  );

};



export default GlosarioLiderazgoModal;















