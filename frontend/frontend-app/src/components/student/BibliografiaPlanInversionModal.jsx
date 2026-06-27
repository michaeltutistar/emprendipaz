import React, { useState } from 'react';

import { X, BookOpen, ExternalLink, Search } from 'lucide-react';

import { Button } from '../ui/button';



const referenciasPlanInversion = [

  // Unidad 1

  {

    id: 1,

    tipo: 'unidad1',

    cita: 'Brealey, R. A., Myers, S. C., & Allen, F. (2020). Principios de finanzas corporativas (12ª ed.). McGraw-Hill.',

    seccion: 'Unidad 1'

  },

  {

    id: 2,

    tipo: 'unidad1',

    cita: 'Sapag, N. (2011). Proyectos de inversión: Formulación y evaluación (2ª ed.). Pearson.',

    seccion: 'Unidad 1'

  },

  {

    id: 3,

    tipo: 'unidad1',

    cita: 'Secretaría de Hacienda y Crédito Público (SHCP). (2018). Manual de formulación de proyectos de inversión pública. SHCP.',

    seccion: 'Unidad 1'

  },

  {

    id: 4,

    tipo: 'unidad1',

    cita: 'Banco Interamericano de Desarrollo (BID). (2019). Guía de financiamiento para PyMEs en América Latina. BID.',

    seccion: 'Unidad 1'

  },

  {

    id: 5,

    tipo: 'unidad1',

    cita: 'Miranda, J. J. (2005). Gestión de proyectos: Identificación, formulación, evaluación (5ª ed.). MM Editores.',

    seccion: 'Unidad 1'

  },



  // Unidad 2

  {

    id: 6,

    tipo: 'unidad2',

    cita: 'Brealey, R. A., Myers, S. C., & Allen, F. (2020). Principios de finanzas corporativas (12ª ed.). McGraw-Hill.',

    seccion: 'Unidad 2'

  },

  {

    id: 7,

    tipo: 'unidad2',

    cita: 'Gitman, L. J., & Zutter, C. J. (2021). Principios de administración financiera (14ª ed.). Pearson.',

    seccion: 'Unidad 2'

  },

  {

    id: 8,

    tipo: 'unidad2',

    cita: 'Sapag, N. (2011). Proyectos de inversión: Formulación y evaluación (2ª ed.). Pearson.',

    seccion: 'Unidad 2'

  },

  {

    id: 9,

    tipo: 'unidad2',

    cita: 'Ross, S. A., Westerfield, R. W., & Jordan, B. D. (2019). Fundamentos de finanzas corporativas (11ª ed.). McGraw-Hill.',

    seccion: 'Unidad 2'

  },

  {

    id: 10,

    tipo: 'unidad2',

    cita: 'Damodaran, A. (2018). Evaluación de empresas: Hacia una valuación más acertada (3ª ed.). LID Editorial.',

    seccion: 'Unidad 2'

  },

  {

    id: 11,

    tipo: 'unidad2',

    cita: 'Mascareñas, J. (2015). Análisis moderno de inversiones (2ª ed.). Editorial de la Universidad Complutense.',

    seccion: 'Unidad 2'

  },

  {

    id: 12,

    tipo: 'unidad2',

    cita: 'Banco Interamericano de Desarrollo (BID). (2019). Guía de financiamiento para PyMEs en América Latina. BID.',

    seccion: 'Unidad 2'

  },

  {

    id: 13,

    tipo: 'unidad2',

    cita: 'Banco Mundial. (2017). Small and Medium Enterprise Finance in Latin America. World Bank Publications.',

    seccion: 'Unidad 2'

  },



  // Unidad 3

  {

    id: 14,

    tipo: 'unidad3',

    cita: 'Kerzner, H. (2019). Project management: A systems approach to planning, scheduling, and controlling projects (12ª ed.). Wiley.',

    seccion: 'Unidad 3'

  },

  {

    id: 15,

    tipo: 'unidad3',

    cita: 'Project Management Institute (PMI). (2021). Guía del PMBOK (6ª ed.). PMI.',

    seccion: 'Unidad 3'

  },

  {

    id: 16,

    tipo: 'unidad3',

    cita: 'Cleland, D. I., & Gareis, R. (2017). Global project management handbook: Planning, organizing, and controlling projects (3ª ed.). McGraw-Hill.',

    seccion: 'Unidad 3'

  },

  {

    id: 17,

    tipo: 'unidad3',

    cita: 'CEPAL. (2018). Metodología de evaluación de proyectos sociales. Naciones Unidas.',

    seccion: 'Unidad 3'

  },

  {

    id: 18,

    tipo: 'unidad3',

    cita: 'Corporación Financiera Internacional (IFC). (2019). SME Investment Handbook for Development Practitioners. IFC Publications.',

    seccion: 'Unidad 3'

  },

  {

    id: 19,

    tipo: 'unidad3',

    cita: 'Miranda, J. J. (2005). Gestión de proyectos: Identificación, formulación, evaluación (5ª ed.). MM Editores.',

    seccion: 'Unidad 3'

  },

  {

    id: 20,

    tipo: 'unidad3',

    cita: 'Sapag, N. (2011). Proyectos de inversión: Formulación y evaluación (2ª ed.). Pearson.',

    seccion: 'Unidad 3'

  },

  {

    id: 21,

    tipo: 'unidad3',

    cita: 'Banco Interamericano de Desarrollo (BID). (2019). Guía de financiamiento para PyMEs en América Latina. BID.',

    seccion: 'Unidad 3'

  }

];



const BibliografiaPlanInversionModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');



  // Obtener secciones únicas

  const secciones = [

    'Unidad 1',

    'Unidad 2',

    'Unidad 3'

  ];



  // Filtrar referencias

  const filteredReferencias = referenciasPlanInversion.filter((ref) =>

    ref.cita.toLowerCase().includes(searchTerm.toLowerCase()) ||

    ref.seccion.toLowerCase().includes(searchTerm.toLowerCase())

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

                <h2 className="text-2xl font-bold">Bibliografía: Plan de Inversión</h2>

                <p className="text-green-100 text-sm mt-1">Modulo 9 - Plan de Inversión</p>

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

            {filteredReferencias.length} de {referenciasPlanInversion.length} referencias

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



export default BibliografiaPlanInversionModal;









