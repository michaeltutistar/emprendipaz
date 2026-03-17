import React from 'react';

import { X, BookOpen, ExternalLink } from 'lucide-react';

import { Button } from '../ui/button';



const referencias = [

  {

    id: 1,

    tipo: 'Artículo Web',

    cita: 'Leal Pupo, A. (s.f.). Importancia del diagnóstico estratégico en el emprendimiento. LinkedIn Pulse.',

    descripcion: 'Artículo sobre la relevancia del diagnóstico estratégico para emprendedores.',

    url: 'https://es.linkedin.com/pulse/importancia-del-diagn%C3%B3stico-estrat%C3%A9gico-en-el-alejandro-leal-pupo-pouxe'

  },

  {

    id: 2,

    tipo: 'Presentación',

    cita: 'Diagnóstico estratégico. (s.f.). SlideShare.',

    descripcion: 'Presentación sobre diagnóstico estratégico empresarial.',

    url: 'https://es.slideshare.net/slideshow/diagnstico-estratgico-38385291/38385291'

  },

  {

    id: 3,

    tipo: 'Libro PDF',

    cita: 'Libro Diagnóstico Estratégico. (s.f.). Scalahed.',

    descripcion: 'Recurso educativo sobre diagnóstico estratégico en formato PDF.',

    url: 'https://gc.scalahed.com/recursos/files/r161r/w25735w/LIBRODiagnosticoEstrategico.pdf'

  },

  {

    id: 4,

    tipo: 'Artículo Web',

    cita: 'El diamante de Porter: Componentes, usos y beneficios. (s.f.). OBS Business School.',

    descripcion: 'Explicación del modelo del diamante de Porter y sus aplicaciones.',

    url: 'https://www.obsbusiness.school/blog/diamante-de-porter-componentes-usos-y-beneficios'

  },

  {

    id: 5,

    tipo: 'Video',

    cita: 'El diamante de Porter. (s.f.). YouTube.',

    descripcion: 'Video educativo sobre el modelo del diamante de Porter.',

    url: 'https://www.youtube.com/watch?v=PysCtqu1V5g'

  },

  {

    id: 6,

    tipo: 'Artículo Web',

    cita: 'El diamante de Porter: ¿Qué es y para qué se utiliza? (s.f.). IMF Business School.',

    descripcion: 'Artículo sobre el diamante de Porter y su utilidad en análisis empresarial.',

    url: 'https://blogs.imf-formacion.com/blog/mba/el-diamante-de-porter-que-es-y-para-que-se-utiliza/'

  },

  {

    id: 7,

    tipo: 'Artículo Académico',

    cita: 'El diamante de Porter en los convenios bilaterales en Colombia. (s.f.). Dialnet.',

    descripcion: 'Ejemplo de aplicación del diamante de Porter en acuerdos bilaterales en Colombia.',

    url: 'file:///C:/Users/spuntoventa/Downloads/Dialnet-ElDiamanteDePorterEnLosConveniosBilaterales-10195319.pdf'

  },

  {

    id: 8,

    tipo: 'Artículo Web',

    cita: 'Ciclo de vida del producto. (s.f.). Munich Business School.',

    descripcion: 'Diccionario de estudios empresariales sobre el ciclo de vida del producto.',

    url: 'https://www.munich-business-school.de/es/l/diccionario-de-estudios-empresariales/ciclo-de-vida-del-producto'

  },

  {

    id: 9,

    tipo: 'Libro PDF',

    cita: 'HubSpot. (s.f.). Guía para elaborar un plan de marketing digital (2ª ed.). HubSpot.',

    descripcion: 'Guía completa para la elaboración de planes de marketing digital.',

    url: 'https://cdn2.hubspot.net/hub/251261/file-470957483-pdf/Ebooks/PLAN_DE_MARKETING_DIGITAL_22_ENERO/Plan_de_Marketing_Digital.pdf'

  },

  {

    id: 10,

    tipo: 'Artículo Web',

    cita: 'Ciclo de vida del producto. (s.f.). Tienda Nube.',

    descripcion: 'Artículo sobre el ciclo de vida del producto y sus etapas.',

    url: 'https://www.tiendanube.com/blog/ciclo-de-vida-del-producto/'

  },

  {

    id: 11,

    tipo: 'Artículo Web',

    cita: 'Ciclo de vida del producto. (s.f.). UNIR.',

    descripcion: 'Artículo sobre marketing y comunicación: ciclo de vida del producto.',

    url: 'https://www.unir.net/revista/marketing-comunicacion/ciclo-vida-producto/'

  }

];



const BibliografiaDescubrimientoModal = ({ onClose }) => {

  const articulos = referencias.filter(ref => ref.tipo === 'Artículo Web' || ref.tipo === 'Artículo Académico');

  const videos = referencias.filter(ref => ref.tipo === 'Video');

  const libros = referencias.filter(ref => ref.tipo === 'Libro PDF');

  const presentaciones = referencias.filter(ref => ref.tipo === 'Presentación');



  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}

        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">

          <div className="flex items-center gap-3">

            <BookOpen className="w-7 h-7" />

            <div>

              <h2 className="text-2xl md:text-[24px] font-bold">Bibliografía</h2>

              <p className="text-sm text-green-100">Modulo 2: Descubrimiento de Oportunidades</p>

            </div>

          </div>

          <button

            onClick={onClose}

            className="hover:bg-white/10 rounded-full p-2 transition-colors"

          >

            <X className="w-6 h-6" />

          </button>

        </div>



        {/* Contenido */}

        <div className="flex-1 overflow-y-auto p-8">

          {/* Libros */}

          {libros.length > 0 && (

            <div className="mb-8">

              <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">

                <h3 className="text-lg font-bold">Libros y Guías</h3>

              </div>

              <div className="space-y-4">

                {libros.map((ref) => (

                  <div

                    key={ref.id}

                    className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-4 border-green-800 rounded-lg p-5 hover:shadow-md transition-shadow"

                  >

                    <p className="text-gray-900 leading-relaxed mb-2 text-sm md:text-base">

                      {ref.cita}

                    </p>

                    <p className="text-gray-600 text-sm italic mb-2">

                      {ref.descripcion}

                    </p>

                    {ref.url && (

                      <a

                        href={ref.url}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-1"

                      >

                        <ExternalLink className="w-4 h-4" />

                        Ver recurso

                      </a>

                    )}

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* Artículos */}

          {articulos.length > 0 && (

            <div className="mb-8">

              <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">

                <h3 className="text-lg font-bold">Artículos Web y Académicos</h3>

              </div>

              <div className="space-y-4">

                {articulos.map((ref) => (

                  <div

                    key={ref.id}

                    className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-4 border-green-800 rounded-lg p-5 hover:shadow-md transition-shadow"

                  >

                    <p className="text-gray-900 leading-relaxed mb-2 text-sm md:text-base">

                      {ref.cita}

                    </p>

                    <p className="text-gray-600 text-sm italic mb-2">

                      {ref.descripcion}

                    </p>

                    {ref.url && (

                      <a

                        href={ref.url}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-1"

                      >

                        <ExternalLink className="w-4 h-4" />

                        Ver recurso

                      </a>

                    )}

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* Videos */}

          {videos.length > 0 && (

            <div className="mb-8">

              <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">

                <h3 className="text-lg font-bold">Videos Educativos</h3>

              </div>

              <div className="space-y-4">

                {videos.map((ref) => (

                  <div

                    key={ref.id}

                    className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-4 border-green-800 rounded-lg p-5 hover:shadow-md transition-shadow"

                  >

                    <p className="text-gray-900 leading-relaxed mb-2 text-sm md:text-base">

                      {ref.cita}

                    </p>

                    <p className="text-gray-600 text-sm italic mb-2">

                      {ref.descripcion}

                    </p>

                    {ref.url && (

                      <a

                        href={ref.url}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-1"

                      >

                        <ExternalLink className="w-4 h-4" />

                        Ver video

                      </a>

                    )}

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* Presentaciónes */}

          {presentaciones.length > 0 && (

            <div className="mb-8">

              <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">

                <h3 className="text-lg font-bold">Presentaciónes</h3>

              </div>

              <div className="space-y-4">

                {presentaciones.map((ref) => (

                  <div

                    key={ref.id}

                    className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-4 border-green-800 rounded-lg p-5 hover:shadow-md transition-shadow"

                  >

                    <p className="text-gray-900 leading-relaxed mb-2 text-sm md:text-base">

                      {ref.cita}

                    </p>

                    <p className="text-gray-600 text-sm italic mb-2">

                      {ref.descripcion}

                    </p>

                    {ref.url && (

                      <a

                        href={ref.url}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-1"

                      >

                        <ExternalLink className="w-4 h-4" />

                        Ver presentación

                      </a>

                    )}

                  </div>

                ))}

              </div>

            </div>

          )}



          {/* Nota informativa */}

          <div className="bg-gradient-to-br from-yellow-50 to-green-50 border border-green-300 rounded-lg p-5 mt-8">

            <div className="flex items-start gap-3">

              <ExternalLink className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />

              <div>

                <p className="text-gray-900 font-bold mb-2 text-sm">Nota sobre referencias</p>

                <p className="text-gray-700 text-sm leading-relaxed">

                  Todas las referencias están organizadas por tipo de recurso. 

                  Se recomienda consultar las fuentes originales para profundizar en cada tema relacionado con el descubrimiento de oportunidades.

                </p>

              </div>

            </div>

          </div>

        </div>



        {/* Footer */}

        <div className="border-t border-green-200 p-6 bg-gradient-to-br from-yellow-50 to-green-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {referencias.length} referencias bibliográficas

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



export default BibliografiaDescubrimientoModal;





















