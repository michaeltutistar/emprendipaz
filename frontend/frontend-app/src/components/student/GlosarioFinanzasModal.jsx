import React, { useState } from 'react';

import { X, BookMarked, Search } from 'lucide-react';

import { Button } from '../ui/button';



const glosarioFinanzas = [

  {

    termino: 'Activo',

    definicion:

      'Recurso económico controlado por la entidad como resultado de eventos pasados y del cual se espera obtener beneficios económicos futuros.',

    categoria: 'Contabilidad Básica'

  },

  {

    termino: 'Pasivo',

    definicion:

      'Obligación presente de la entidad, surgida de sucesos pasados, cuya liquidación se espera que produzca una salida de recursos.',

    categoria: 'Contabilidad Básica'

  },

  {

    termino: 'Patrimonio',

    definicion:

      'Interés residual de los propietarios en los activos de la entidad una vez deducidos todos los pasivos.',

    categoria: 'Contabilidad Básica'

  },

  {

    termino: 'Ingresos',

    definicion:

      'Incrementos en beneficios económicos durante un período contable que producen aumentos en el patrimonio, distintos a los aportes de los propietarios.',

    categoria: 'Contabilidad Básica'

  },

  {

    termino: 'Gastos',

    definicion:

      'Decrementos en beneficios económicos durante un período contable que reducen el patrimonio, distintos a distribuciones a los propietarios.',

    categoria: 'Contabilidad Básica'

  },

  {

    termino: 'Ecuación contable',

    definicion:

      'Relación fundamental: Activos = Pasivos + Patrimonio.',

    categoria: 'Contabilidad Básica'

  },

  {

    termino: 'Partida doble',

    definicion:

      'Método universal de registro contable donde toda transacción afecta al menos dos cuentas, manteniendo el equilibrio contable.',

    categoria: 'Registros Contables'

  },

  {

    termino: 'Registro contable',

    definicion:

      'Proceso de identificar, medir y registrar transacciones en libros contables.',

    categoria: 'Registros Contables'

  },

  {

    termino: 'Libro Diario',

    definicion:

      'Documento contable donde se registran cronológicamente todas las operaciones mediante asientos o partidas.',

    categoria: 'Registros Contables'

  },

  {

    termino: 'Libro Mayor',

    definicion:

      'Registro que agrupa los movimientos y saldos de cada cuenta contable.',

    categoria: 'Registros Contables'

  },

  {

    termino: 'Estados financieros',

    definicion:

      'Informás que presentan la situación financiera y desempeño: estado de situación financiera, estado de resultados, estado de cambios en el patrimonio, estado de flujos de efectivo y notas.',

    categoria: 'Estados Financieros'

  },

  {

    termino: 'Estado de situación financiera',

    definicion:

      'Muestra activos, pasivos y patrimonio en una fecha determinada.',

    categoria: 'Estados Financieros'

  },

  {

    termino: 'Estado de resultados',

    definicion:

      'Presenta ingresos, costos y gastos, mástrando la utilidad o pérdida del período.',

    categoria: 'Estados Financieros'

  },

  {

    termino: 'Estado de flujos de efectivo',

    definicion:

      'Informe que muestra entradas y salidas de efectivo clasificadas en actividades operativas, de inversión y financiación.',

    categoria: 'Estados Financieros'

  },

  {

    termino: 'NIIF (IFRS)',

    definicion:

      'Normás internacionales que regulan la preparación de estados financieros con propósito general.',

    categoria: 'Normás y Principios'

  },

  {

    termino: 'Materialidad',

    definicion:

      'Umbral a partir del cual la omásión o error de información puede influir en las decisiones de los usuarios.',

    categoria: 'Normás y Principios'

  },

  {

    termino: 'Devengo',

    definicion:

      'Los efectos de las transacciones se reconocen cuando ocurren, no cuando se cobran o pagan.',

    categoria: 'Normás y Principios'

  },

  {

    termino: 'Valor razonable',

    definicion:

      'Precio que se recibiría por vender un activo o que se pagaría por transferir un pasivo en una transacción ordenada entre participantes del mercado.',

    categoria: 'Normás y Principios'

  },

  {

    termino: 'Depreciación',

    definicion:

      'Distribución sistemática del valor depreciable de un activo durante su vida útil.',

    categoria: 'Activos y Pasivos'

  },

  {

    termino: 'Amortización',

    definicion:

      'Distribución del costo de un activo intangible a lo largo de su vida útil.',

    categoria: 'Activos y Pasivos'

  },

  {

    termino: 'Provisión',

    definicion:

      'Pasivo de cuantía o fecha incierta, pero estimable.',

    categoria: 'Activos y Pasivos'

  },

  {

    termino: 'Inventarios',

    definicion:

      'Activos destinados a la venta, en proceso de producción o consumidos en la prestación de servicios.',

    categoria: 'Activos y Pasivos'

  },

  {

    termino: 'Conciliación bancaria',

    definicion:

      'Procedimiento para comparar el saldo de la cuenta bancaria en libros con el saldo informado por el banco.',

    categoria: 'Registros Contables'

  }

];



const GlosarioFinanzasModal = ({ onClose }) => {

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [expandedTerms, setExpandedTerms] = useState(new Set());



  const categorias = ['Todas', ...Array.from(new Set(glosarioFinanzas.map((item) => item.categoria)))];



  const filteredGlosario = glosarioFinanzas.filter((item) => {

    const matchesSearch =

      item.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||

      item.definicion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =

      !selectedCategory || selectedCategory === 'Todas' || item.categoria === selectedCategory;

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

        <div className="bg-gradient-to-r from-green-800 to-blue-700 text-white py-6 px-8 flex items-center justify-between flex-shrink-0 rounded-t-2xl">

          <div className="flex items-center gap-3">

            <BookMarked className="w-7 h-7" />

            <div>

              <h2 className="text-2xl md:text-[24px] font-bold">Glosario de Términos</h2>

              <p className="text-sm text-green-100">Modulo 8 · Finanzas y Gestión Empresarial</p>

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

        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-b border-green-200 p-6 flex-shrink-0">

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

            {categorias.map((categoria) => (

              <button

                key={categoria}

                onClick={() => setSelectedCategory(categoria === 'Todas' ? null : categoria)}

                className={`px-4 py-2 rounded-full text-sm transition-all ${

                  selectedCategory === categoria || (categoria === 'Todas' && !selectedCategory)

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

                  className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 border-2 border-green-200 hover:border-green-600 transition-all cursor-pointer group"

                >

                  <div className="flex items-start justify-between mb-2">

                    <h4 className="text-gray-900 font-bold text-base group-hover:text-green-800">

                      {item.termino}

                    </h4>

                    <span className="bg-green-800 text-white text-xs px-3 py-1 rounded-full">

                      {item.categoria}

                    </span>

                  </div>

                  <p

                    className={`text-gray-700 leading-relaxed text-sm ${

                      expandedTerms.has(item.termino) ? '' : 'line-clamp-2'

                    }`}

                  >

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

        <div className="border-t border-green-200 p-6 bg-gradient-to-br from-green-50 to-blue-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">

          <p className="text-sm text-gray-600">

            {filteredGlosario.length}{' '}

            {filteredGlosario.length === 1 ? 'término encontrado' : 'términos encontrados'}

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



export default GlosarioFinanzasModal;



