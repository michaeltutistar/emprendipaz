import React from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

const referencias = [
  {
    id: 1,
    tipo: 'Libro',
    cita: 'Kotler, P., & Keller, K. L. (2022). Dirección de Marketing (16ª ed.). Pearson Educación.',
    descripcion: 'Texto fundamental sobre estrategias de marketing y gestión de marca.',
  },
  {
    id: 2,
    tipo: 'Libro',
    cita: 'Osterwalder, A., & Pigneur, Y. (2021). Generación de Modelos de Negocio: Un manual para visionarios, revolucionarios y retadores. Deusto.',
    descripcion: 'Guía práctica para el desarrollo de modelos de negocio innovadores.',
  },
  {
    id: 3,
    tipo: 'Artículo',
    cita: 'Porter, M. E. (2008). Las cinco fuerzas competitivas que le dan forma a la estrategia. Harvard Business Review, 86(1), 58-77.',
    descripcion: 'Análisis clásico sobre ventaja competitiva y estrategia empresarial.',
  },
  {
    id: 4,
    tipo: 'Libro',
    cita: 'Ries, E. (2019). El método Lean Startup: Cómo crear empresas de éxito utilizando la innovación continua. Deusto.',
    descripcion: 'Metodología para validar ideas de negocio con recursos limitados.',
  },
  {
    id: 5,
    tipo: 'Artículo',
    cita: 'Kim, W. C., & Mauborgne, R. (2015). La estrategia del océano azul: Cómo desarrollar un nuevo mercado donde la competencia no tiene ninguna importancia. Harvard Business Review, 82(10), 76-85.',
    descripcion: 'Estrategias para crear espacios de mercado no disputados.',
  },
  {
    id: 6,
    tipo: 'Libro',
    cita: 'Blank, S., & Dorf, B. (2020). El manual del emprendedor: La guía paso a paso para crear una gran empresa. Gestión 2000.',
    descripcion: 'Guía completa para el desarrollo de startups y emprendimientos.',
  },
  {
    id: 7,
    tipo: 'Revista',
    cita: 'Harvard Business Review. (2023). Marketing en la era digital. Harvard Business Publishing.',
    descripcion: 'Compilación de artículos sobre transformación digital del marketing.',
  },
  {
    id: 8,
    tipo: 'Libro',
    cita: 'Trout, J., & Ries, A. (2021). Posicionamiento: La batalla por su mente (20ª ed.). McGraw-Hill.',
    descripcion: 'Fundamentos sobre estrategias de posicionamiento de marca.',
  },
  {
    id: 9,
    tipo: 'Artículo',
    cita: 'Christensen, C. M., Hall, T., Dillon, K., & Duncan, D. S. (2016). Know Your Customers\' "Jobs to Be Done". Harvard Business Review, 94(9), 54-62.',
    descripcion: 'Marco conceptual para entender las necesidades del cliente.',
  },
  {
    id: 10,
    tipo: 'Libro',
    cita: 'Godin, S. (2018). Esta es la mercadotecnia: No puedes ser visto hasta que aprendas a ver. Paidós.',
    descripcion: 'Visión contemporánea del marketing centrado en el valor y la conexión.',
  },
];

const BibliografiaModal = ({ onClose }) => {
  const libros = referencias.filter(ref => ref.tipo === 'Libro');
  const articulos = referencias.filter(ref => ref.tipo === 'Artículo');
  const revistas = referencias.filter(ref => ref.tipo === 'Revista');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            <div>
              <h2 className="text-2xl md:text-[24px] font-bold">Bibliografía</h2>
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Libros */}
          {libros.length > 0 && (
            <div className="mb-8">
              <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">
                <h3 className="text-lg font-bold">Libros</h3>
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
                    <p className="text-gray-600 text-sm italic">
                      {ref.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artículos */}
          {articulos.length > 0 && (
            <div className="mb-8">
              <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">
                <h3 className="text-lg font-bold">Artículos de Revista</h3>
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
                    <p className="text-gray-600 text-sm italic">
                      {ref.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revistas */}
          {revistas.length > 0 && (
            <div className="mb-8">
              <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4 inline-block">
                <h3 className="text-lg font-bold">Revistas Especializadas</h3>
              </div>
              <div className="space-y-4">
                {revistas.map((ref) => (
                  <div
                    key={ref.id}
                    className="bg-gradient-to-br from-yellow-50 to-green-50 border-l-4 border-green-800 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <p className="text-gray-900 leading-relaxed mb-2 text-sm md:text-base">
                      {ref.cita}
                    </p>
                    <p className="text-gray-600 text-sm italic">
                      {ref.descripcion}
                    </p>
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
                  Todas las referencias están formateadas según las normás APA 7ª edición. 
                  Se recomienda consultar las fuentes originales para profundizar en cada tema.
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

export default BibliografiaModal;





