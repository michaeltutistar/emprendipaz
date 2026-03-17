import React, { useState } from 'react';

import { X, BookOpen, ExternalLink } from 'lucide-react';

import { Button } from '../ui/button';



const referenciasTrabajoEquipo = [

  // Bibliografía general del modulo

  {

    id: 1,

    tipo: 'general',

    cita:

      'Asana. (2025, 28 de febrero). Establecer los objetivos de negocios: el primer paso para el éxito. Asana. https://asana.com/es/resources/business-goals-examples',

    seccion: 'Bibliografía general'

  },

  {

    id: 2,

    tipo: 'general',

    cita:

      'Asana. (2025, 9 de febrero). Estructura organizativa: 10 formas de organizar el equipo. Asana. https://asana.com/es/resources/team-structure',

    seccion: 'Bibliografía general'

  },

  {

    id: 3,

    tipo: 'general',

    cita:

      'Asana. (2025, 11 de febrero). Roles del equipo: 9 tipos de roles para crear un equipo bien equilibrado. Asana. https://asana.com/es/resources/team-roles',

    seccion: 'Bibliografía general'

  },

  {

    id: 4,

    tipo: 'general',

    cita:

      'Concepto.de. (2024, 15 de marzo). Cultura organizacional: qué es, importancia, elementos y ejemplos. Concepto.de. https://concepto.de/cultura-organizacional/',

    seccion: 'Bibliografía general'

  },

  {

    id: 5,

    tipo: 'general',

    cita:

      'Estudyando. (2025, 22 de octubre). Organigrama circular: qué es, características y ejemplos. Estudyando. https://estudyando.com/organigrama-circular-que-es-caracteristicas-y-ejemplos/',

    seccion: 'Bibliografía general'

  },

  {

    id: 6,

    tipo: 'general',

    cita:

      'Estudyando. (2025, 31 de agosto). Plan de incentivos: qué es, características y ejemplos. Estudyando. https://estudyando.com/plan-de-incentivos-que-es-caracteristicas-y-ejemplos/',

    seccion: 'Bibliografía general'

  },

  {

    id: 7,

    tipo: 'general',

    cita:

      'Hotmart. (2023, 14 de septiembre). Planificación de actividades: qué es y cómo aplicarla. Hotmart. https://hotmart.com/es/blog/planificacion',

    seccion: 'Bibliografía general'

  },

  {

    id: 8,

    tipo: 'general',

    cita:

      'Humanidades.com. (2024, 12 de junio). Metodología: qué es, tipos y ejemplos históricos. Humanidades.com. https://humanidades.com/metodologia/',

    seccion: 'Bibliografía general'

  },

  {

    id: 9,

    tipo: 'general',

    cita:

      'Parc. (2025, 28 de abril). Ejemplos clave de cultura individualista: entendiendo su impacto en la sociedad. Parc. https://parc.com.pe/ejemplos/cultura-individualista-ejemplos/',

    seccion: 'Bibliografía general'

  },

  {

    id: 10,

    tipo: 'general',

    cita:

      'Psicología Online. (2025, 4 de noviembre). Trabajo en equipo: qué es, importancia, características y ventajas. Psicología Online. https://www.psicologia-online.com/trabajo-en-equipo-que-es-importancia-caracteristicas-y-ventajas-5210.html',

    seccion: 'Bibliografía general'

  },



  // Unidad 1

  {

    id: 11,

    tipo: 'unidad1',

    cita:

      'Belbin, R. M. (2010). Team roles at work (2nd ed.). Routledge. https://doi.org/10.4324/9780080963242',

    seccion: 'Unidad 1. Conformación del equipo de trabajo'

  },

  {

    id: 12,

    tipo: 'unidad1',

    cita:

      'Economipedia. (2020, 1 de junio). Organigrama circular. Economipedia. https://economipedia.com/definiciones/organigrama-circular.html',

    seccion: 'Unidad 1. Conformación del equipo de trabajo'

  },

  {

    id: 13,

    tipo: 'unidad1',

    cita:

      'Katzenbach, J. R., & Smith, D. K. (2015). The wisdom of teams: Creating the high-performance organization. Harvard Business School Press.',

    seccion: 'Unidad 1. Conformación del equipo de trabajo'

  },



  // Unidad 2

  {

    id: 14,

    tipo: 'unidad2',

    cita:

      'Appvizer. (2024). 5W: definición, ejemplos concretos y ventajas del método 5W. Appvizer. https://www.appvizer.es/revista/organizacion-planificacion/gestion-proyectos/5w-definicion-ejemplos-concretos-y-ventajas-metodo-5-w',

    seccion: 'Unidad 2. Planificación de actividades'

  },

  {

    id: 15,

    tipo: 'unidad2',

    cita:

      'Slack, N., Brandon-Jones, A., & Burgess, N. (2022). Operations management (10th ed.). Pearson.',

    seccion: 'Unidad 2. Planificación de actividades'

  },



  // Unidad 3

  {

    id: 16,

    tipo: 'unidad3',

    cita:

      'Asana. (2025, 11 de febrero). La mejor estrategia para resolución de conflictos que deberías usar. Asana. https://asana.com/es/resources/conflict-resolution-strategies',

    seccion: 'Unidad 3. Dificultades en el equipo de trabajo'

  },

  {

    id: 17,

    tipo: 'unidad3',

    cita:

      'Coyle, D. (2018). The culture code: The secrets of highly successful groups. Bantam Books.',

    seccion: 'Unidad 3. Dificultades en el equipo de trabajo'

  },

  {

    id: 18,

    tipo: 'unidad3',

    cita:

      'Lencioni, P. (2002). The five dysfunctions of a team: A leadership fable. Jossey-Bass.',

    seccion: 'Unidad 3. Dificultades en el equipo de trabajo'

  }

];



const secciones = [

  'Bibliografía general',

  'Unidad 1. Conformación del equipo de trabajo',

  'Unidad 2. Planificación de actividades',

  'Unidad 3. Dificultades en el equipo de trabajo'

];



const BibliografiaTrabajoEquipoModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');



  const filteredReferencias = referenciasTrabajoEquipo.filter(

    (ref) =>

      ref.cita.toLowerCase().includes(searchTerm.toLowerCase()) ||

      ref.seccion.toLowerCase().includes(searchTerm.toLowerCase())

  );



  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}

        <div className="bg-gradient-to-r from-blue-800 to-purple-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">

          <div className="flex items-center gap-3">

            <BookOpen className="w-7 h-7" />

            <div>

              <h2 className="text-2xl md:text-[24px] font-bold">Bibliografía · Trabajo en Equipo</h2>

              <p className="text-sm text-blue-100">Referencias en formato APA 7ª edición</p>

            </div>

          </div>

          <button

            onClick={onClose}

            className="hover:bg-white/10 rounded-full p-2 transition-colors"

          >

            <X className="w-6 h-6" />

          </button>

        </div>



        {/* Search Bar */}

        <div className="px-8 pt-6 pb-4 flex-shrink-0">

          <div className="relative">

            <input

              type="text"

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm md:text-base"

              placeholder="Buscar en bibliografía..."

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

                <div className="bg-blue-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">

                  <h3 className="text-lg font-bold">{seccion}</h3>

                </div>

                <div className="space-y-4">

                  {refsSeccion.map((ref) => (

                    <div

                      key={ref.id}

                      className="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-800 rounded-lg p-5 hover:shadow-md transition-shadow"

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

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-300 rounded-lg p-5 mt-8">

            <div className="flex items-start gap-3">

              <ExternalLink className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />

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

        <div className="border-t border-blue-200 p-6 bg-gradient-to-br from-blue-50 to-purple-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {filteredReferencias.length} de {referenciasTrabajoEquipo.length} referencias

            bibliográficas

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



export default BibliografiaTrabajoEquipoModal;

















