import React, { useState, useEffect } from 'react'

const ActivityLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 50,
    usuario_id: '',
    accion: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/admin/logs?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      } else {
        setError('Error al cargar logs')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const getActionIcon = (action) => {
    const icons = {
      'login': '🔐',
      'logout': '🚪',
      'register': '📝',
      'actualizar_usuario': '✏️',
      'actualizacion_masiva_usuarios': '📊',
      'importar_usuarios': '📥',
      'exportar_usuarios': '📤',
      'forgot_password': '🔑',
      'reset_password': '🔒'
    }
    return icons[action] || '📋'
  }

  const getActionColor = (action) => {
    const colors = {
      'login': 'bg-green-100 text-green-800',
      'logout': 'bg-gray-100 text-gray-800',
      'register': 'bg-blue-100 text-blue-800',
      'actualizar_usuario': 'bg-yellow-100 text-yellow-800',
      'actualizacion_masiva_usuarios': 'bg-purple-100 text-purple-800',
      'importar_usuarios': 'bg-indigo-100 text-indigo-800',
      'exportar_usuarios': 'bg-pink-100 text-pink-800',
      'forgot_password': 'bg-orange-100 text-orange-800',
      'reset_password': 'bg-teal-100 text-teal-800'
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📋 Logs de Actividad
        </h2>
        <p className="text-gray-600">
          Monitoreo de actividades del sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción
            </label>
            <select
              value={filters.accion}
              onChange={(e) => handleFilterChange('accion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas las acciones</option>
              <option value="login">Inicio de sesión</option>
              <option value="logout">Cierre de sesión</option>
              <option value="register">Registro</option>
              <option value="actualizar_usuario">Actualizar usuario</option>
              <option value="actualizacion_masiva_usuarios">Actualización masiva</option>
              <option value="importar_usuarios">Importar usuarios</option>
              <option value="exportar_usuarios">Exportar usuarios</option>
              <option value="forgot_password">Recuperar contraseña</option>
              <option value="reset_password">Restablecer contraseña</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario ID
            </label>
            <input
              type="number"
              placeholder="Filtrar por ID de usuario"
              value={filters.usuario_id}
              onChange={(e) => handleFilterChange('usuario_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Por página
            </label>
            <select
              value={filters.per_page}
              onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.usuario_nombre || `Usuario ${log.usuario_id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {log.usuario_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {getActionIcon(log.accion)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.accion)}`}>
                        {log.accion.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={log.detalles}>
                      {log.detalles || 'Sin detalles'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.per_page) + 1} a{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Página {pagination.page} de {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Estadísticas de Actividad
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de logs</span>
              <span className="text-sm font-medium text-gray-900">
                {pagination.total?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Página actual</span>
              <span className="text-sm font-medium text-gray-900">
                {pagination.page} de {pagination.pages}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Logs por página</span>
              <span className="text-sm font-medium text-gray-900">
                {filters.per_page}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔍 Filtros Activos
          </h3>
          <div className="space-y-2 text-sm">
            {filters.accion && (
              <div className="flex justify-between">
                <span className="text-gray-600">Acción:</span>
                <span className="text-gray-900">{filters.accion}</span>
              </div>
            )}
            {filters.usuario_id && (
              <div className="flex justify-between">
                <span className="text-gray-600">Usuario ID:</span>
                <span className="text-gray-900">{filters.usuario_id}</span>
              </div>
            )}
            {!filters.accion && !filters.usuario_id && (
              <p className="text-gray-500">Sin filtros aplicados</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Acciones Rápidas
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setFilters({ page: 1, per_page: 50, usuario_id: '', accion: '' })}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              🔄 Limpiar Filtros
            </button>
            <button
              onClick={fetchLogs}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
            >
              📊 Actualizar Logs
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default ActivityLogs 