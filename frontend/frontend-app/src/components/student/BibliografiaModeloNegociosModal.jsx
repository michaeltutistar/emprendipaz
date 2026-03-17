import React, { useState } from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

const BibliografiaModeloNegociosModal = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const referencias = [
    // Libros y Guías
    {
      id: 1,
      tipo: 'libro',
      cita: 'Albrecht, K. (2014). La revolución del servicio: Cómo revolucionar la forma en que su empresa enfrenta la competencia. Grupo Editorial Norma.',
      descripcion: 'Enfatiza importancia de servicio en diferenciación de modelo',
      unidad: 'Unidad 1 y 2'
    },
    {
      id: 2,
      tipo: 'libro',
      cita: 'Blank, S. (2013). Why the Lean Start-Up Changes Everything. Harvard Business Review, 91(5), 63-72.',
      descripcion: 'Introduce concepto de validación de modelo',
      unidad: 'Unidad 1, 2 y 3'
    },
    {
      id: 3,
      tipo: 'libro',
      cita: 'Kotler, P. & Armstrong, G. (2021). Fundamentos de marketing (14ª ed.). Pearson.',
      descripcion: 'Conceptos de segmentación y propuestá de valor',
      unidad: 'Unidad 1 y 2'
    },
    {
      id: 4,
      tipo: 'libro',
      cita: 'Kotler, P. & Armstrong, G. (2021). Principios de marketing. Pearson.',
      descripcion: 'Conceptos fundamentales de marketing',
      unidad: 'Unidad 2'
    },
    {
      id: 5,
      tipo: 'libro',
      cita: 'Kotler, P., Kartajaya, H., & Setiawan, I. (2021). Marketing 5.0: Technology for Humanity. Wiley.',
      descripcion: 'Evolución de modelos hacia digital y sostenible',
      unidad: 'Unidad 1, 2 y 3'
    },
    {
      id: 6,
      tipo: 'libro',
      cita: 'Osterwalder, A. & Pigneur, Y. (2010). Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers. Wiley.',
      descripcion: 'Referencia principal para Business Model Canvas',
      unidad: 'Unidad 1 y 3'
    },
    {
      id: 7,
      tipo: 'libro',
      cita: 'Osterwalder, A., Pigneur, Y., Bernarda, G., & Smith, A. (2014). Value Proposition Design: How to Create Products and Services Customers Want. Wiley.',
      descripcion: 'Profundización en propuestá de valor',
      unidad: 'Unidad 1 y 2'
    },
    {
      id: 8,
      tipo: 'libro',
      cita: 'Carvell, S. & Moulton, B. (2015). Value Proposition Design Workbook. Wiley.',
      descripcion: 'Guía práctica para diseño de propuestá de valor',
      unidad: 'Unidad 2'
    },
    {
      id: 9,
      tipo: 'libro',
      cita: 'Ries, E. (2012). The Lean Startup: How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses. Crown Business.',
      descripcion: 'Metodología de validación e iteración',
      unidad: 'Unidad 1, 2 y 3'
    },
    {
      id: 10,
      tipo: 'libro',
      cita: 'Blank, S. & Dorf, B. (2012). The Startup Owner\'s Manual: The Step-by-Step Guide for Building a Great Company. K&S Ranch.',
      descripcion: 'Guía paso a paso para construir una gran empresa',
      unidad: 'Unidad 2 y 3'
    },
    {
      id: 11,
      tipo: 'libro',
      cita: 'Aaker, D. (2014). Aaker on Branding. Morgan Jamás Publishing.',
      descripcion: 'Conceptos sobre construcción de marca',
      unidad: 'Unidad 2'
    },
    {
      id: 12,
      tipo: 'libro',
      cita: 'Porter, M. (2008). Competitive Advantage: Creating and Sustaining Superior Performance. Free Press.',
      descripcion: 'Ventaja competitiva y sostenibilidad',
      unidad: 'Unidad 2 y 3'
    },
    {
      id: 13,
      tipo: 'articulo',
      cita: 'Chesbrough, H. (2010). Business Model Innovation: Opportunities and Barriers. Long Range Planning, 43(2-3), 354-363.',
      descripcion: 'Innovación en modelos de negocio: oportunidades y barreras',
      unidad: 'Unidad 3'
    }
  ];

  const filteredReferencias = referencias.filter(ref =>
    ref.cita.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.unidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const libros = filteredReferencias.filter(ref => ref.tipo === 'libro');
  const articulos = filteredReferencias.filter(ref => ref.tipo === 'articulo');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Bibliografía - Modelo de Negocios</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-neutral-200">
          <input
            type="text"
            placeholder="Buscar en bibliografía..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-green-600 focus:outline-none"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Libros y Guías */}
          {libros.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-700" />
                Libros y Guías
              </h3>
              <div className="space-y-4">
                {libros.map((ref) => (
                  <div
                    key={ref.id}
                    className="bg-neutral-50 border-l-4 border-green-600 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <p className="text-neutral-900 font-semibold mb-2">{ref.cita}</p>
                    <p className="text-neutral-700 text-sm mb-2">{ref.descripcion}</p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      {ref.unidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artículos Académicos */}
          {articulos.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-700" />
                Artículos Académicos
              </h3>
              <div className="space-y-4">
                {articulos.map((ref) => (
                  <div
                    key={ref.id}
                    className="bg-neutral-50 border-l-4 border-green-600 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <p className="text-neutral-900 font-semibold mb-2">{ref.cita}</p>
                    <p className="text-neutral-700 text-sm mb-2">{ref.descripcion}</p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                      {ref.unidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredReferencias.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-lg">No se encontraron referencias que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-green-800 hover:bg-green-900 text-white px-6 py-2"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BibliografiaModeloNegociosModal;










