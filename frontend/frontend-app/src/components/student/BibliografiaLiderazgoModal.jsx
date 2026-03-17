import React, { useState } from 'react';

import { X, BookOpen, ExternalLink, Search } from 'lucide-react';

import { Button } from '../ui/button';



const referenciasLiderazgo = [

  // Referencias Generales

  {

    id: 1,

    tipo: 'general',

    cita: 'Asana. (2025, 10 de enero). 11 estilos de liderazgo y cómo encontrar el tuyo. https://asana.com/es/resources/leadership-styles',

    seccion: 'Referencias Generales'

  },

  {

    id: 2,

    tipo: 'general',

    cita: 'Comunica y Dirige. (2025, 22 de noviembre). Comunicación efectiva en el liderazgo: entrada 2. https://comunicaydirige.blogspot.com/2025/11/entrada-2-comunicacion-efectiva-en-el.html',

    seccion: 'Referencias Generales'

  },

  {

    id: 3,

    tipo: 'general',

    cita: 'Concepto.de. (s.f.). Cultura organizacional: qué es, importancia, elementos y ejemplos. https://concepto.de/cultura-organizacional/',

    seccion: 'Referencias Generales'

  },

  {

    id: 4,

    tipo: 'general',

    cita: 'Contabilidad Finanzas. (2024, 12 de junio). Competitividad en el mercado: qué es y cómo lograr ventaja. https://contabilidadfinanzas.com/blog/competitividad-en-el-mercado/',

    seccion: 'Referencias Generales'

  },

  {

    id: 5,

    tipo: 'general',

    cita: 'Economipedia. (2020, 1 de agosto). Reputación de marca: definición, qué es y concepto. https://economipedia.com/definiciones/reputacion-de-marca.html',

    seccion: 'Referencias Generales'

  },

  {

    id: 6,

    tipo: 'general',

    cita: 'Estilos de Liderazgo. (2018, 18 de octubre). Visión en el liderazgo, ¡desarróllalo! https://estilosdeliderazgo.org/blog/cualidades-de-un-lider/vision/',

    seccion: 'Referencias Generales'

  },

  {

    id: 7,

    tipo: 'general',

    cita: 'Estudyando. (2023, 6 de noviembre). Gestión de equipos: definición, habilidades e importancia. https://estudyando.com/gestion-de-equipos-definicion-habilidades-e-importancia/',

    seccion: 'Referencias Generales'

  },

  {

    id: 8,

    tipo: 'general',

    cita: 'Liderazgo Empresarial. (s.f.). Comunicación efectiva y liderazgo: claves para potenciar el éxito profesional. https://liderazgoempresarial.info/comunicacion-efectiva-y-liderazgo/',

    seccion: 'Referencias Generales'

  },

  {

    id: 9,

    tipo: 'general',

    cita: 'Liderazgo Empresarial. (s.f.). Inspirar en el liderazgo: la capacidad de motivar y guiar equipos. https://liderazgoempresarial.info/que-es-inspirar-en-el-liderazgo/',

    seccion: 'Referencias Generales'

  },

  {

    id: 10,

    tipo: 'general',

    cita: 'OpenHR. (2024, 18 de noviembre). Clima laboral: definición, importancia y consejos. https://www.openhr.cloud/blog/clima-laboral',

    seccion: 'Referencias Generales'

  },



  // Unidad 1: Identificando mi estilo de liderazgo

  {

    id: 11,

    tipo: 'unidad1',

    cita: 'Costa Marcé, A. (2015). Liderazgo y dirección de empresas en el siglo XXI PDF. Liderazgo y dirección de empresas en el s. XXI',

    seccion: 'Unidad 1. Identificando mi estilo de liderazgo'

  },

  {

    id: 12,

    tipo: 'unidad1',

    cita: 'Covey, S. R. (2004). Los 7 hábitos de la gente altamente efectiva. Paidós.',

    seccion: 'Unidad 1. Identificando mi estilo de liderazgo'

  },

  {

    id: 13,

    tipo: 'unidad1',

    cita: 'Piqueras, C. (2016). Manual para líderes de equipos. Vicion Group.',

    seccion: 'Unidad 1. Identificando mi estilo de liderazgo'

  },

  {

    id: 14,

    tipo: 'unidad1',

    cita: 'Uzurriaga Balanta, M. F., Osorio Quintana, C. A., & Arias Erazo, O. F. (2020). Liderazgo: definiciones y estilos [Artículo de revisión]. Universidad Santiago de Cali. Recuperado de https://uniclanet.unicla.edu.mx/assets/contenidos/152520231108220010.pdf',

    seccion: 'Unidad 1. Identificando mi estilo de liderazgo'

  },



  // Unidad 2: Liderazgo visionario

  {

    id: 15,

    tipo: 'unidad2',

    cita: 'Estilos de Liderazgo. (2017, 3 de noviembre). Liderazgo visionario: conoce sus características y cuándo aplicarlo. https://estilosdeliderazgo.org/blog/estilos-de-liderazgo-segun-goleman/liderazgo-visionario/',

    seccion: 'Unidad 2. Liderazgo visionario'

  },

  {

    id: 16,

    tipo: 'unidad2',

    cita: 'Goleman, D., Boyatzis, R., & McKee, A. (2013). Primal leadership: Unleashing the power of emotional intelligence. Harvard Business Review Press.',

    seccion: 'Unidad 2. Liderazgo visionario'

  },

  {

    id: 17,

    tipo: 'unidad2',

    cita: 'National Minority AIDS Council. (2002). Desarrollo de liderazgo (Serie de Efectividad Organizacional). National Minority AIDS Council.',

    seccion: 'Unidad 2. Liderazgo visionario'

  },

  {

    id: 18,

    tipo: 'unidad2',

    cita: 'Negocios y Empresa. (2024, 25 de octubre). Liderazgo visionario: características y aportes. https://negociosyempresa.com/liderazgo-visionario/',

    seccion: 'Unidad 2. Liderazgo visionario'

  },



  // Unidad 3: Toma de decisiones

  {

    id: 19,

    tipo: 'unidad3',

    cita: 'Piqueras, C. (2016). Manual para líderes de equipos. Vicion Group.',

    seccion: 'Unidad 3. Toma de decisiones'

  },

  {

    id: 20,

    tipo: 'unidad3',

    cita: 'Senge, P. M. (2006). La quinta disciplina: El arte y la práctica de la organización abierta al aprendizaje. Granica.',

    seccion: 'Unidad 3. Toma de decisiones'

  }

];



const BibliografiaLiderazgoModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');



  // Obtener secciones únicas

  const secciones = [

    'Referencias Generales',

    'Unidad 1. Identificando mi estilo de liderazgo',

    'Unidad 2. Liderazgo visionario',

    'Unidad 3. Toma de decisiones'

  ];



  // Filtrar referencias

  const filteredReferencias = referenciasLiderazgo.filter((ref) =>

    ref.cita.toLowerCase().includes(searchTerm.toLowerCase())

  );



  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">

        {/* Header */}

        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white p-6 rounded-t-2xl flex-shrink-0">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <BookOpen className="w-8 h-8" />

              <div>

                <h2 className="text-2xl font-bold">Bibliografía: Liderazgo</h2>

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



        {/* Búsqueda */}

        <div className="border-b border-green-200 p-6 bg-gradient-to-br from-green-50 to-blue-50 flex-shrink-0">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input

              type="text"

              placeholder="Buscar en bibliografía..."

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-800 transition-colors"

            />

          </div>

        </div>



        {/* Contenido */}

        <div className="flex-1 overflow-y-auto px-8 pb-6">

          {secciones.map((seccion) => {

            const refsSeccion = filteredReferencias.filter((ref) => ref.seccion === seccion);

            if (refsSeccion.length === 0) return null;



            return (

              <div key={seccion} className="mb-8">

                <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">

                  <h3 className="text-lg font-bold">{seccion}</h3>

                </div>

                <div className="space-y-4">

                  {refsSeccion.map((ref) => (

                    <div

                      key={ref.id}

                      className="bg-gradient-to-br from-green-50 to-blue-50 border-l-4 border-green-800 rounded-lg p-5 hover:shadow-md transition-shadow"

                    >

                      <p className="text-gray-900 leading-relaxed mb-2 text-sm md:text-base">

                        {ref.cita}

                      </p>

                    </div>

                  ))}

                </div>

              </div>

            );

          })}



          {filteredReferencias.length === 0 && (

            <div className="text-center py-12">

              <p className="text-gray-500 text-lg">No se encontraron referencias</p>

            </div>

          )}



          {/* Nota informativa */}

          <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-300 rounded-lg p-5 mt-8">

            <div className="flex items-start gap-3">

              <ExternalLink className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />

              <div>

                <p className="text-gray-900 font-bold mb-2 text-sm">Nota sobre referencias</p>

                <p className="text-gray-700 text-sm leading-relaxed">

                  Todas las referencias están formateadas según las normás APA 7ª edición. Se

                  recomienda consultar las fuentes originales para profundizar en cada tema.

                </p>

              </div>

            </div>

          </div>

        </div>



        {/* Footer */}

        <div className="border-t border-green-200 p-6 bg-gradient-to-br from-green-50 to-blue-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {filteredReferencias.length} de {referenciasLiderazgo.length} referencias

            bibliográficas

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



export default BibliografiaLiderazgoModal;















