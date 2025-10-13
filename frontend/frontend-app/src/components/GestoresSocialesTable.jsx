import React, { useState } from 'react'
import { Search } from 'lucide-react'

const GestoresSocialesTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const gestoresData = [
    { nombre: "ANGELLY YURLEDY CABRERA GUERRERO", celular: "3225269083", subregion: "EX PROVINCIA" },
    { nombre: "ANGIE YISELT LANDAZURY MOSQUERA", celular: "3103634868", subregion: "PACIFICO SUR" },
    { nombre: "CARLOS DANIEL GUSTIN BARCO", celular: "3156975261", subregion: "CENTRO" },
    { nombre: "LUIS MANUEL VELASCO MORAN", celular: "3204180199", subregion: "EX PROVINCIA" },
    { nombre: "ANDRES FELIPE ORDOÑEZ ORDOÑEZ", celular: "3155581385", subregion: "CORDILERRA" },
    { nombre: "YORLAN ROSELBER MORALES JANAMEJOY", celular: "3226419705", subregion: "RIO MAYO" },
    { nombre: "LISSA MARIA CHAVEZ MARTINEZ", celular: "3116770837", subregion: "JUANAMBU" },
    { nombre: "HERNAN ELOY CARTILLO ORTIZ", celular: "3175968490", subregion: "TELEMBI" },
    { nombre: "LUISA DANIELA MAYORGA IBARRA", celular: "3122013468", subregion: "SABANA" },
    { nombre: "CARLOS EDUARDO ORTEGA GOMEZ", celular: "3122938081", subregion: "RIO MAYO" },
    { nombre: "SUSANA DEL MAR MOSQUERA", celular: "3172605732", subregion: "PASTO" },
    { nombre: "EDISON MIGUEL MONTECE LINARES", celular: "3114239907", subregion: "ABADES" },
    { nombre: "CRISTIAN DAVID PINEDA ESMERALDA", celular: "3154307430", subregion: "SANQUIANGA" },
    { nombre: "DIEGO FERNANDO BOLAÑOS BASANTE", celular: "3127544165", subregion: "OCCIDENTE" },
    { nombre: "WEIMAR FERNANDO ARIAS FIGUEROA", celular: "3234849953", subregion: "EX PROVINCIA" },
    { nombre: "JULIETHA BEATRIZ PERAFAN MORA", celular: "3174926019", subregion: "GUAMBUYACO" },
    { nombre: "DAVID CAMILO ORTIZ JURADO", celular: "3187802761", subregion: "PIE DE MONTE COSTERO" },
    { nombre: "CARLOS ADOLFO VALENCIA ESTACIO", celular: "3043387051", subregion: "PACIFICO SUR" },
    { nombre: "DARLY ELINABETH VILLOTA CHAVES", celular: "3136476615", subregion: "CENTRO" }
  ]

  // Función para normalizar texto (quitar acentos y convertir a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[ñ]/g, 'n') // Reemplazar ñ por n para búsqueda más flexible
  }

  const filteredGestores = gestoresData.filter(gestor => {
    const searchNormalized = normalizeText(searchTerm)
    
    return normalizeText(gestor.nombre).includes(searchNormalized) ||
           normalizeText(gestor.subregion).includes(searchNormalized) ||
           gestor.celular.includes(searchTerm)
  })

  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Gestores Sociales por Nodo</h3>
              <p className="text-slate-300 text-sm">Información de contacto de los gestores sociales</p>
            </div>
            <div className="text-white text-right">
              <div className="text-3xl font-bold">{gestoresData.length}</div>
              <div className="text-xs text-slate-300 uppercase tracking-wide">Gestores</div>
            </div>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, subregión o celular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Celular
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subregión
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGestores.length > 0 ? (
                filteredGestores.map((gestor, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {gestor.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <a 
                          href={`tel:${gestor.celular}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {gestor.celular}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {gestor.subregion}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 mb-4">
                      No hay gestores que coincidan con "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver todos los gestores
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con estadísticas */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Mostrando {filteredGestores.length} de {gestoresData.length} gestores</span>
              </div>
            </div>
            {searchTerm && (
              <div className="text-blue-600 font-medium">
                Búsqueda activa: "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GestoresSocialesTable

