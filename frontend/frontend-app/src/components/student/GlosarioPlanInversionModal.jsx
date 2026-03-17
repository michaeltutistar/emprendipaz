import React, { useState } from 'react';
import { X, BookMarked, Search } from 'lucide-react';
import { Button } from '../ui/button';

const glosario = [
  {
    termino: 'Activo fijo',
    definicion: 'Bien tangible que permanece en la empresa a largo plazo, como maquinaria, equipos o infraestructura.',
    categoria: 'Activos'
  },
  {
    termino: 'Ahorros',
    definicion: 'Recursos propios destinados a financiar inversiones sin recurrir a crédito externo.',
    categoria: 'Financiamiento'
  },
  {
    termino: 'Análisis financiero',
    definicion: 'Proceso que traduce ideas de inversión en cifras verificables para evaluar viabilidad.',
    categoria: 'Análisis'
  },
  {
    termino: 'Capital de trabajo',
    definicion: 'Recursos financieros necesarios para operaciones diarias, como nómina o inventarios.',
    categoria: 'Financiamiento'
  },
  {
    termino: 'Cronograma de ejecución',
    definicion: 'Plan temporal que organiza fases y fechas de adquisición, instalación o implementación.',
    categoria: 'Planificación'
  },
  {
    termino: 'Decisión de inversión',
    definicion: 'Selección de la alternativa más viable tras comparar costos, riesgos y beneficios.',
    categoria: 'Planificación'
  },
  {
    termino: 'Diagnóstico de necesidades',
    definicion: 'Identificación de limitantes que afectan el crecimiento y requieren inversión.',
    categoria: 'Análisis'
  },
  {
    termino: 'Flujo de caja',
    definicion: 'Registro de entradas y salidas de dinero en un periodo determinado.',
    categoria: 'Análisis'
  },
  {
    termino: 'Formalización empresarial',
    definicion: 'Proceso de estructurar un negocio con requisitos legales y financieros para operar formalmente.',
    categoria: 'Planificación'
  },
  {
    termino: 'Fuente de financiamiento',
    definicion: 'Origen de los recursos para la inversión, como crédito, ahorros o subsidios.',
    categoria: 'Financiamiento'
  },
  {
    termino: 'Indicadores financieros',
    definicion: 'Herramientas que resumen la viabilidad de una inversión (ej. VAN, TIR, Payback).',
    categoria: 'Indicadores'
  },
  {
    termino: 'Inversión intangible',
    definicion: 'Recursos destinados a capacidades no físicas, como capacitación, software o marca.',
    categoria: 'Activos'
  },
  {
    termino: 'Microcrédito',
    definicion: 'Préstamo de bajo monto, accesible pero con tasas de interés más altas.',
    categoria: 'Financiamiento'
  },
  {
    termino: 'Payback (Período de retorno)',
    definicion: 'Tiempo necesario para recuperar la inversión inicial.',
    categoria: 'Indicadores'
  },
  {
    termino: 'Plan de inversión',
    definicion: 'Documento técnico que organiza decisiones sobre activos, costos, financiamiento y beneficios esperados.',
    categoria: 'Planificación'
  },
  {
    termino: 'Plan de negocios',
    definicion: 'Documento que describe la estrategia comercial, mercado y propuesta de valor.',
    categoria: 'Planificación'
  },
  {
    termino: 'Presupuesto',
    definicion: 'Estimación de costos unitarios, totales e impuestos asociados a una inversión.',
    categoria: 'Análisis'
  },
  {
    termino: 'Proyección financiera',
    definicion: 'Estimación futura de ingresos, costos y ganancias derivadas de una inversión.',
    categoria: 'Análisis'
  },
  {
    termino: 'Rentabilidad',
    definicion: 'Capacidad de una inversión para generar beneficios superiores a los costos.',
    categoria: 'Indicadores'
  },
  {
    termino: 'Riesgo de inversión',
    definicion: 'Probabilidad de que los resultados difieran de lo esperado, afectando la viabilidad.',
    categoria: 'Análisis'
  },
  {
    termino: 'Sensibilidad financiera',
    definicion: 'Análisis de cómo cambian los resultados de una inversión bajo distintos escenarios.',
    categoria: 'Análisis'
  },
  {
    termino: 'TIR (Tasa Interna de Retorno)',
    definicion: 'Indicador que mide la rentabilidad porcentual anual de una inversión.',
    categoria: 'Indicadores'
  },
  {
    termino: 'VAN (Valor Actual Neto)',
    definicion: 'Indicador que mide la riqueza adicional generada por una inversión descontando flujos futuros.',
    categoria: 'Indicadores'
  },
];

const GlosarioPlanInversionModal = ({ onClose }) => {
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
              <p className="text-sm text-green-100">Plan de Inversión</p>
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

export default GlosarioPlanInversionModal;
