import React, { useState } from 'react';

import { X, BookMarked, Search } from 'lucide-react';

import { Button } from '../ui/button';



const glosario = [

  {

    termino: 'Marketing Mix',

    definicion: 'Conjunto de herramientas tácticas de marketing que la empresa combina para producir la respuestá deseada en el mercado objetivo. Se compone de las 4 P\'s: Producto, Precio, Plaza y Promoción.',

    categoria: 'Estrategia'

  },

  {

    termino: 'Propuesta de Valor',

    definicion: 'Promása de valor que se entrega a los clientes. Es la razón principal por la cual un cliente debe comprar tu producto o servicio en lugar del de la competencia.',

    categoria: 'Estrategia'

  },

  {

    termino: 'Segmentación de Mercado',

    definicion: 'Proceso de dividir el mercado en grupos distintos de compradores con diferentes necesidades, características o comportamientos, que podrían requerir productos o programás de marketing separados.',

    categoria: 'Análisis'

  },

  {

    termino: 'Público Objetivo',

    definicion: 'Grupo específico de consumidores al que una empresa dirige sus esfuerzos de marketing. Se define por características demográficas, psicográficas y de comportamiento.',

    categoria: 'Análisis'

  },

  {

    termino: 'Posicionamiento',

    definicion: 'Lugar que ocupa un producto o marca en la mente del consumidor en relación con los productos de la competencia. Define cómo quieres que tus clientes perciban tu oferta.',

    categoria: 'Estrategia'

  },

  {

    termino: 'Canal de Distribución',

    definicion: 'Conjunto de intermediarios a través de los cuales el producto pasa desde el fabricante hasta el consumidor final. Puede ser directo o indirecto.',

    categoria: 'Comercialización'

  },

  {

    termino: 'ROI (Retorno de Inversión)',

    definicion: 'Métrica que mide la rentabilidad de una inversión. Se calcula dividiendo la ganancia neta entre el costo de la inversión, expresado en porcentaje.',

    categoria: 'Análisis'

  },

  {

    termino: 'Branding',

    definicion: 'Proceso de crear y gestionar una marca. Incluye el desarrollo de la identidad visual, valores, personalidad y comunicación que distinguen a una empresa o producto.',

    categoria: 'Estrategia'

  },

  {

    termino: 'Ventaja Competitiva',

    definicion: 'Característica única o conjunto de características que permiten a una empresa ofrecer un valor superior a sus clientes en comparación con la competencia.',

    categoria: 'Estrategia'

  },

  {

    termino: 'Canvas de Modelo de Negocio',

    definicion: 'Herramienta estratégica que permite visualizar y diseñar modelos de negocio de forma estructurada. Incluye 9 bloques clave: propuestá de valor, segmentos de clientes, canales, relaciones, fuentes de ingresos, recursos, actividades, socios y estructura de costos.',

    categoria: 'Herramienta'

  },

  {

    termino: 'Buyer Persona',

    definicion: 'Representación semificticia del cliente ideal basada en datos reales y algunas especulaciones fundamentadas sobre demografía, comportamiento, motivaciones y objetivos.',

    categoria: 'Análisis'

  },

  {

    termino: 'CTA (Call to Action)',

    definicion: 'Llamado a la acción que invita al usuario a realizar una acción específica, como "Comprar ahora", "Registrarse", "Descargar", etc.',

    categoria: 'Comercialización'

  },

];



const GlosarioModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [expandedTerms, setExpandedTerms] = useState(new Set());



  const categorias = ['Todas', ...Array.from(new Set(glosario.map(item => item.categoria)))];



  const filteredGlosario = glosario.filter(item => {

    const matchesSearch = item.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||

                         item.definicion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || selectedCategory === 'Todas' || item.categoria === selectedCategory;

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

        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">

          <div className="flex items-center gap-3">

            <BookMarked className="w-7 h-7" />

            <div>

              <h2 className="text-2xl md:text-[24px] font-bold">Glosario de Términos</h2>

              <p className="text-sm text-green-100">Marketing y Comercialización</p>

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

        <div className="bg-gradient-to-br from-yellow-50 to-green-50 border-b border-green-200 p-6 flex-shrink-0">

          <div className="relative mb-4">

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input

              type="text"

              placeholder="Buscar término o concepto..."

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-800 transition-colors"

            />

          </div>



          {/* Categorías */}

          <div className="flex gap-2 flex-wrap">

            {categorias.map(categoria => (

              <button

                key={categoria}

                onClick={() => setSelectedCategory(categoria === 'Todas' ? null : categoria)}

                className={`px-4 py-2 rounded-full text-sm transition-all ${

                  (selectedCategory === categoria || (categoria === 'Todas' && !selectedCategory))

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

                  className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl p-5 border-2 border-green-200 hover:border-green-600 transition-all cursor-pointer group"

                >

                  <div className="flex items-start justify-between mb-2">

                    <h4 className="text-gray-900 font-bold text-base group-hover:text-green-800">{item.termino}</h4>

                    <span className="bg-green-800 text-white text-xs px-3 py-1 rounded-full">

                      {item.categoria}

                    </span>

                  </div>

                  <p className={`text-gray-700 leading-relaxed text-sm ${

                    expandedTerms.has(item.termino) ? '' : 'line-clamp-2'

                  }`}>

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

        <div className="border-t border-green-200 p-6 bg-gradient-to-br from-yellow-50 to-green-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {filteredGlosario.length} {filteredGlosario.length === 1 ? 'término encontrado' : 'términos encontrados'}

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



export default GlosarioModal;











