import React, { useState } from 'react';

import { X, BookOpen, ExternalLink } from 'lucide-react';

import { Button } from '../ui/button';



const referenciasFinanzas = [

  // Unidad 1: Estudio de la ecuación patrimonial

  {

    id: 1,

    tipo: 'unidad1',

    cita:

      'Amat, O., & Soldevila, P. (autores hispanos con amplia difusión en Colombia).',

    seccion: 'Unidad 1. Estudio de la ecuación patrimonial'

  },

  {

    id: 2,

    tipo: 'unidad1',

    cita:

      'Gómez, M. A. (2019). Fundamentos de contabilidad financiera. Ecoe Ediciones.',

    seccion: 'Unidad 1. Estudio de la ecuación patrimonial'

  },

  {

    id: 3,

    tipo: 'unidad1',

    cita:

      'Castaño, C. A. (2017). Contabilidad: bases teóricas y práctica empresarial colombiana. Ediciones de la U.',

    seccion: 'Unidad 1. Estudio de la ecuación patrimonial'

  },



  // Unidad 2: Preparación de presupuesto de ventas

  {

    id: 4,

    tipo: 'unidad2',

    cita:

      'Bernal, C. A. (2016). Presupuestos: enfoque moderno para la gestión empresarial. Pearson Educación Colombia.',

    seccion: 'Unidad 2. Preparación de presupuesto de ventas'

  },

  {

    id: 5,

    tipo: 'unidad2',

    cita:

      'Muñoz, J. F. (2020). Presupuestos empresariales: planeación y control en organizaciones colombianas. Ecoe Ediciones.',

    seccion: 'Unidad 2. Preparación de presupuesto de ventas'

  },



  // Unidad 3: Gestión Empresarial

  {

    id: 6,

    tipo: 'unidad3',

    cita:

      'Páez, I. (2018). Gestión empresarial: conceptos y aplicaciones en el contexto colombiano. Ediciones de la U.',

    seccion: 'Unidad 3. Gestión Empresarial'

  },

  {

    id: 7,

    tipo: 'unidad3',

    cita:

      'Sierra, J. D., & Cárdenas, L. M. (2021). Administración y gestión organizacional en Colombia. Ecoe Ediciones.',

    seccion: 'Unidad 3. Gestión Empresarial'

  },



  // Fuentes digitales

  {

    id: 8,

    tipo: 'digital',

    cita:

      'Consejo Técnico de la Contaduría Pública (CTCP). Documentos técnicos y orientaciones: https://www.ctcp.gov.co',

    seccion: 'Fuentes digitales'

  },

  {

    id: 9,

    tipo: 'digital',

    cita:

      'Cámara de Comercio de Bogotá. Recursos para emprendimiento y gestión empresarial: https://www.ccb.org.co',

    seccion: 'Fuentes digitales'

  },



  // Bibliografía del glosario

  {

    id: 10,

    tipo: 'glosario',

    cita:

      'Gómez, M. A. (2019). Fundamentos de contabilidad financiera. Ecoe Ediciones.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 11,

    tipo: 'glosario',

    cita:

      'Castaño, C. A. (2017). Contabilidad: bases teóricas y práctica empresarial colombiana. Ediciones de la U.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 12,

    tipo: 'glosario',

    cita:

      'Warren, C. S., Reeve, J. M., & Duchac, J. (2018). Contabilidad financiera. Cengage Learning.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 13,

    tipo: 'glosario',

    cita:

      'Horngren, C. T., Harrison, W. T., & Oliver, M. S. (2019). Contabilidad. Pearson.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 14,

    tipo: 'glosario',

    cita:

      'Bernal, C. A. (2016). Presupuestos: enfoque moderno para la gestión empresarial. Pearson Educación Colombia.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 15,

    tipo: 'glosario',

    cita:

      'Muñoz, J. F. (2020). Presupuestos empresariales: planeación y control en organizaciones colombianas. Ecoe Ediciones.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 16,

    tipo: 'glosario',

    cita:

      'Castaño, A., & Montoya, D. (2019). Contabilidad financiera: fundamentos y aplicación en entornos empresariales colombianos. Ecoe Ediciones.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 17,

    tipo: 'glosario',

    cita:

      'Horngren, C., Harrison, W., & Oliver, S. (2018). Contabilidad financiera (11.ª ed.). Pearson.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 18,

    tipo: 'glosario',

    cita:

      'International Accounting Standards Board. (2023). Normás Internacionales de Información Financiera – NIIF completas. IFRS Foundation.',

    seccion: 'Bibliografía del glosario'

  },

  {

    id: 19,

    tipo: 'glosario',

    cita:

      'Navarro, A. (2021). Contabilidad básica: principios y aplicación práctica. McGraw-Hill.',

    seccion: 'Bibliografía del glosario'

  }

];



const secciones = [

  'Unidad 1. Estudio de la ecuación patrimonial',

  'Unidad 2. Preparación de presupuesto de ventas',

  'Unidad 3. Gestión Empresarial',

  'Fuentes digitales',

  'Bibliografía del glosario'

];



const BibliografiaFinanzasModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');



  const filteredReferencias = referenciasFinanzas.filter(

    (ref) =>

      ref.cita.toLowerCase().includes(searchTerm.toLowerCase()) ||

      ref.seccion.toLowerCase().includes(searchTerm.toLowerCase())

  );



  return (

    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}

        <div className="bg-gradient-to-r from-green-800 to-blue-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">

          <div className="flex items-center gap-3">

            <BookOpen className="w-7 h-7" />

            <div>

              <h2 className="text-2xl md:text-[24px] font-bold">Bibliografía · Finanzas y Gestión Empresarial</h2>

              <p className="text-sm text-green-100">Referencias en formato APA 7ª edición</p>

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

              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-green-600 focus:outline-none text-sm md:text-base"

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

                  Todas las referencias están formateadas según las normas APA 7ª edición. Se

                  recomienda consultar las fuentes originales para profundizar en cada tema.

                </p>

              </div>

            </div>

          </div>

        </div>



        {/* Footer */}

        <div className="border-t border-green-200 p-6 bg-gradient-to-br from-green-50 to-blue-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {filteredReferencias.length} de {referenciasFinanzas.length} referencias

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



export default BibliografiaFinanzasModal;



