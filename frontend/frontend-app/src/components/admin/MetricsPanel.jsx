import React, { useState, useEffect } from 'react'

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
      const response = await fetch('/api/admin/dashboard/metrics', {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Usuarios */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.usuarios.total.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">+{metrics.usuarios.nuevos_30_dias}</span>
              <span className="text-gray-500">últimos 30 días</span>
            </div>
          </div>
        </div>

        {/* Cursos Activos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cursos Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.cursos.activos}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{metrics.cursos.total}</span>
              <span className="text-gray-500">total cursos</span>
            </div>
          </div>
        </div>

        {/* Inscripciones */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">🎓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inscripciones</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.usuarios.total.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">+{metrics.usuarios.nuevos_30_dias}</span>
              <span className="text-gray-500">últimos 30 días</span>
            </div>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actividad</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.actividad.ultimos_7_dias}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">últimos 7 días</span>
            </div>
          </div>
        </div>
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
                {metrics.roles.estudiantes}
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