import React, { useState, useEffect } from 'react'
import API_BASE_URL from '@/config/api'

const ESTUDIANTES_OPERATIVOS = 761
const MODULOS_ACTIVOS = 10

const MetricsPanel = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        setError('Error al cargar métricas')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando métricas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!metrics) return null

  const generalMetrics = [
    {
      label: 'Estudiantes',
      value: ESTUDIANTES_OPERATIVOS.toLocaleString(),
      helper: 'base operativa actual',
      icon: '🎓',
      accent: 'blue',
    },
    {
      label: 'Módulos activos',
      value: MODULOS_ACTIVOS,
      helper: 'ruta formativa vigente',
      icon: '📚',
      accent: 'green',
    },
    {
      label: 'Instructores',
      value: metrics.roles.instructores,
      helper: 'acompañamiento disponible',
      icon: '🧑‍🏫',
      accent: 'purple',
    },
    {
      label: 'Usuarios activos',
      value: metrics.usuarios.activos.toLocaleString(),
      helper: 'cuentas activas',
      icon: '✅',
      accent: 'emerald',
    },
  ]

  const accentClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Métricas Generales
        </h2>
        <p className="text-gray-600">
          Vista ejecutiva de la plataforma E-Learning
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {generalMetrics.map((item) => (
          <div key={item.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentClasses[item.accent]}`}>
                  <span className="text-lg">{item.icon}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {item.helper}
            </div>
          </div>
        ))}
      </div>

      {/* Métricas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estados de Usuario */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estados de Usuario
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Activos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {metrics.usuarios.activos}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Inactivos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {metrics.usuarios.inactivos}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Suspendidos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {metrics.usuarios.suspendidos}
              </span>
            </div>
          </div>
        </div>

        {/* Roles de Usuario */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Roles
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Estudiantes</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {ESTUDIANTES_OPERATIVOS}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Instructores</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {metrics.roles.instructores}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Administradores</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {metrics.roles.administradores}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 via-blue-50 to-yellow-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Resumen por municipio
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total estudiantes, intentos totales, % finalizacion de modulos y % asistencia.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Municipio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Total estudiantes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Intentos totales</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">% finalizacion modulos</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">% asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {(metrics.municipios_resumen || []).map((row) => (
                <tr key={row.municipio} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.municipio}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{row.total_estudiantes}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{row.intentos_totales}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                      {row.pct_finalizacion_modulos}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                      {row.pct_asistencia}%
                    </span>
                  </td>
                </tr>
              ))}
              {(!metrics.municipios_resumen || metrics.municipios_resumen.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No hay datos disponibles para el resumen por municipio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón de Actualizar */}
      <div className="text-center">
        <button
          onClick={fetchMetrics}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          🔄 Actualizar Métricas
        </button>
      </div>
    </div>
  )
}

export default MetricsPanel 