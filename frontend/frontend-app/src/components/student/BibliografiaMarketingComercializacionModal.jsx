import React, { useState } from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

const BibliografiaMarketingComercializaciónModal = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const referencias = [
    // Unidad 1
    {
      id: 1,
      tipo: 'libro',
      cita: 'Chiavenato, I. (2010). Planeación estratégica: fundamentos y aplicaciones (2.ª ed.). Ciudad de México: McGraw-Hill.',
      descripcion: 'Fundamentos y aplicaciones de la planeación estratégica',
      unidad: 'Unidad 1'
    },
    {
      id: 2,
      tipo: 'libro',
      cita: 'Rojas López, M. D. (2012). Planeación estratégica. Bogotá, Colombia: Ediciones de la U Ltda.',
      descripcion: 'Planeación estratégica aplicada',
      unidad: 'Unidad 1'
    },
    {
      id: 3,
      tipo: 'libro',
      cita: 'Moreno, J. O. (2017). Planeación estratégica. Bogotá, Colombia: Fundación Universitaria del Área Andina.',
      descripcion: 'Planeación estratégica para emprendimientos',
      unidad: 'Unidad 1'
    },
    // Unidad 2
    {
      id: 4,
      tipo: 'libro',
      cita: 'Chiavenato, I. (2023). Planeación estratégica (5.ª ed.): De la intención a los resultados en la administración estratégica. Madrid: McGraw-Hill Interamericana. Cap. 2: "Análisis del entorno y diagnóstico organizacional".',
      descripcion: 'Análisis del entorno y diagnóstico organizacional',
      unidad: 'Unidad 2'
    },
    {
      id: 5,
      tipo: 'libro',
      cita: 'David, F. R., & David, F. R. (2017). Conceptos de administración estratégica (16.ª ed.). México: Pearson.',
      descripcion: 'Metodologías para diagnóstico estratégico (Matriz DOFA- EFI-EFE, FODA)',
      unidad: 'Unidad 2'
    },
    // Unidad 3
    {
      id: 6,
      tipo: 'libro',
      cita: 'Kotler, P., & Armstrong, G. (2023). Fundamentos de marketing (14.ª ed.). Pearson Educación.',
      descripcion: 'Obra esencial para comprender los principios del marketing y la relación entre producto, precio, plaza y promoción, con énfasis en estrategias comerciales.',
      unidad: 'Unidad 3'
    },
    {
      id: 7,
      tipo: 'libro',
      cita: 'Lamb, C. W., Hair, J. F., & McDaniel, C. (2021). Marketing (14.ª ed.). Cengage Learning.',
      descripcion: 'Aporta un enfoque claro sobre la aplicación de estrategias de comercialización y análisis de mercados.',
      unidad: 'Unidad 3'
    },
    {
      id: 8,
      tipo: 'libro',
      cita: 'Stanton, W. J., Etzel, M. J., & Walker, B. J. (2020). Fundamentos de marketing. McGraw-Hill Interamericana.',
      descripcion: 'Clásico que desarrolla las variables del marketing mix y la planificación de la comercialización.',
      unidad: 'Unidad 3'
    }
  ];

  const filteredReferencias = referencias.filter(ref =>
    ref.cita.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.unidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unidades = ['Unidad 1', 'Unidad 2', 'Unidad 3'];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            <div>
              <h2 className="text-2xl md:text-[24px] font-bold">Bibliografía - Marketing y Comercialización</h2>
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
          {unidades.map((unidad) => {
            const refsUnidad = filteredReferencias.filter(ref => ref.unidad === unidad);
            if (refsUnidad.length === 0) return null;

            return (
              <div key={unidad} className="mb-8">
                <div className="bg-green-800 text-white py-3 px-5 rounded-lg mb-4">
                  <h3 className="text-lg font-bold">{unidad}</h3>
                </div>
                <div className="space-y-4">
                  {refsUnidad.map((ref) => (
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
            );
          })}

          {filteredReferencias.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron referencias</p>
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
            {filteredReferencias.length} de {referencias.length} referencias bibliográficas
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

export default BibliografiaMarketingComercializaciónModal;









