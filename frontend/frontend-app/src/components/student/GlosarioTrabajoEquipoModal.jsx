import React, { useState } from 'react';

import { X, BookMarked, Search } from 'lucide-react';

import { Button } from '../ui/button';



const glosarioTrabajoEquipo = [

  {

    termino: 'Cultura individualista',

    definicion:

      'Modelo cultural en el que prevalecen los intereses y derechos del individuo sobre los del grupo.',

    categoria: 'Cultura'

  },

  {

    termino: 'Cultura organizacional',

    definicion:

      'Conjunto de valores, creencias, normás y prácticas compartidas que definen la identidad y funcionamiento de una organización.',

    categoria: 'Cultura'

  },

  {

    termino: 'Estructura del equipo de trabajo',

    definicion:

      'Organización interna de un grupo de personas que colaboran hacia objetivos comunes, definiendo roles, relaciones y dinámicas.',

    categoria: 'Equipo'

  },

  {

    termino: 'Metodología',

    definicion:

      'Conjunto de métodos y procedimientos sistemáticos que guían un proceso de investigación, enseñanza o gestión.',

    categoria: 'Metodología'

  },

  {

    termino: 'Objetivos de negocio',

    definicion:

      'Metas estratégicas que una empresa establece para guiar sus acciones hacia el crecimiento y la sostenibilidad.',

    categoria: 'Gestión'

  },

  {

    termino: 'Organigrama',

    definicion:

      'Representación gráfica de la estructura de una organización, mástrando jerarquías, áreas y relaciones entre funciones.',

    categoria: 'Organización'

  },

  {

    termino: 'Plan de incentivos',

    definicion:

      'Estrategia empresarial para motivar y recompensar a los empleados mediante beneficios económicos o no económicos.',

    categoria: 'Gestión'

  },

  {

    termino: 'Planificación de actividades',

    definicion:

      'Proceso de organizar tareas, recursos y tiempos para alcanzar objetivos de manera eficiente y colaborativa.',

    categoria: 'Gestión'

  },

  {

    termino: 'Rol',

    definicion:

      'Función o papel que una persona desempeña dentro de un equipo, definida por responsabilidades y expectativas que permiten la coordinación y productividad grupal.',

    categoria: 'Equipo'

  },

  {

    termino: 'Trabajo en equipo',

    definicion:

      'Forma de organización en la que varias personas colaboran de manera articulada para alcanzar un objetivo común.',

    categoria: 'Equipo'

  }

];



const GlosarioTrabajoEquipoModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [expandedTerms, setExpandedTerms] = useState(new Set());



  const categorias = ['Todas', ...Array.from(new Set(glosarioTrabajoEquipo.map((item) => item.categoria)))];



  const filteredGlosario = glosarioTrabajoEquipo.filter((item) => {

    const matchesSearch =

      item.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||

      item.definicion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =

      !selectedCategory || selectedCategory === 'Todas' || item.categoria === selectedCategory;

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

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">

          <div className="flex items-center gap-3">

            <BookMarked className="w-7 h-7" />

            <div>

              <h2 className="text-2xl md:text-[24px] font-bold">Glosario de Términos</h2>

              <p className="text-sm text-blue-100">Modulo 7 · Trabajo en Equipo</p>

            </div>

          </div>

          <button

            onClick={onClose}

            className="hover:bg-white/10 rounded-full p-2 transition-colors"

          >

            <X className="w-6 h-6" />

          </button>

        </div>



        {/* Buscador y Filtros */}

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-blue-200 p-6 flex-shrink-0">

          <div className="relative mb-4">

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input

              type="text"

              placeholder="Buscar término o concepto..."

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="w-full pl-10 pr-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-800 transition-colors"

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

                    ? 'bg-blue-800 text-white'

                    : 'bg-white text-gray-700 border border-blue-300 hover:border-blue-800'

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

                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200 hover:border-blue-600 transition-all cursor-pointer group"

                >

                  <div className="flex items-start justify-between mb-2">

                    <h4 className="text-gray-900 font-bold text-base group-hover:text-blue-800">

                      {item.termino}

                    </h4>

                    <span className="bg-blue-800 text-white text-xs px-3 py-1 rounded-full">

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

                    <button className="text-blue-800 text-sm font-bold mt-2 hover:underline">

                      Ver más

                    </button>

                  )}

                </div>

              ))}

            </div>

          )}

        </div>



        {/* Footer */}

        <div className="border-t border-blue-200 p-6 bg-gradient-to-br from-blue-50 to-purple-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {filteredGlosario.length}{' '}

            {filteredGlosario.length === 1 ? 'término encontrado' : 'términos encontrados'}

          </p>

          <Button

            onClick={onClose}

            className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 rounded-lg"

          >

            Cerrar

          </Button>

        </div>

      </div>

    </div>

  );

};



export default GlosarioTrabajoEquipoModal;

















