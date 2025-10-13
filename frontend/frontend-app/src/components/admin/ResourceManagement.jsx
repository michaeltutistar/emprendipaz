import React, { useState, useEffect } from 'react'
import SearchInput from '../common/SearchInput'

const ResourceManagement = () => {
  const [resources, setResources] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    tipo: '',
    categoria: '',
    curso_id: '',
    search: ''
  })
  
  // Estados para modales
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Estados para formularios
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'general',
    curso_id: '',
    acceso_publico: true,
    requiere_autenticacion: false
  })
  
  const [editForm, setEditForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    estado: 'activo',
    acceso_publico: true,
    requiere_autenticacion: false
  })

  useEffect(() => {
    fetchResources()
    fetchCourses()
    fetchStats()
  }, [filters])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/resources/resources?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources)
        setPagination(data.pagination)
      } else {
        setError('Error al cargar recursos')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/resources/resources/stats', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handleSearchChange = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tamaño del archivo (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 100MB')
      return
    }

    // Actualizar formulario con el nombre del archivo
    setUploadForm(prev => ({
      ...prev,
      titulo: file.name
    }))
  }

  const handleUpload = async () => {
    try {
      const fileInput = document.getElementById('file-upload')
      const file = fileInput.files[0]
      
      if (!file) {
        setError('Por favor selecciona un archivo')
        return
      }

      setUploadProgress(0)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('titulo', uploadForm.titulo)
      formData.append('descripcion', uploadForm.descripcion)
      formData.append('categoria', uploadForm.categoria)
      formData.append('curso_id', uploadForm.curso_id)
      formData.append('acceso_publico', uploadForm.acceso_publico)
      formData.append('requiere_autenticacion', uploadForm.requiere_autenticacion)

      const response = await fetch('/api/resources/resources', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        setShowUploadModal(false)
        setUploadForm({
          titulo: '',
          descripcion: '',
          categoria: 'general',
          curso_id: '',
          acceso_publico: true,
          requiere_autenticacion: false
        })
        fileInput.value = ''
        fetchResources()
        fetchStats()
        setUploadProgress(100)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al subir archivo')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleUpdateResource = async () => {
    try {
      const response = await fetch(`/api/resources/resources/${selectedResource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      })
      
      if (response.ok) {
        setShowEditModal(false)
        setSelectedResource(null)
        fetchResources()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar recurso')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este recurso?')) {
      return
    }

    try {
      const response = await fetch(`/api/resources/resources/${resourceId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchResources()
        fetchStats()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar recurso')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const openEditModal = (resource) => {
    setSelectedResource(resource)
    setEditForm({
      titulo: resource.titulo,
      descripcion: resource.descripcion || '',
      categoria: resource.categoria || '',
      estado: resource.estado,
      acceso_publico: resource.acceso_publico,
      requiere_autenticacion: resource.requiere_autenticacion
    })
    setShowEditModal(true)
  }

  const getTypeBadge = (type) => {
    const badges = {
      pdf: 'bg-red-100 text-red-800',
      documento: 'bg-blue-100 text-blue-800',
      video: 'bg-purple-100 text-purple-800',
      audio: 'bg-green-100 text-green-800',
      imagen: 'bg-yellow-100 text-yellow-800',
      presentacion: 'bg-indigo-100 text-indigo-800',
      hoja_calculo: 'bg-pink-100 text-pink-800',
      archivo: 'bg-gray-100 text-gray-800',
      zip: 'bg-orange-100 text-orange-800'
    }
    return badges[type] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status) => {
    const badges = {
      activo: 'bg-green-100 text-green-800',
      inactivo: 'bg-yellow-100 text-yellow-800',
      eliminado: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📕',
      documento: '📄',
      video: '🎥',
      audio: '🎵',
      imagen: '🖼️',
      presentacion: '📊',
      hoja_calculo: '📈',
      archivo: '📁',
      zip: '📦'
    }
    return icons[type] || '📄'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando recursos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📚 Gestión de Recursos
            </h2>
            <p className="text-gray-600">
              Administración de recursos multimedia para estudiantes
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            📤 Subir Recurso
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recursos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_recursos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💾</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tamaño Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tamano_total_formateado}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">☁️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">S3 Bucket</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tamano_bucket_s3_formateado}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📁</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tipos</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.recursos_por_tipo).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SearchInput
            placeholder="Título, descripción..."
            onSearch={handleSearchChange}
            defaultValue={filters.search}
            label="Buscar"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="pdf">PDF</option>
              <option value="documento">Documento</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="imagen">Imagen</option>
              <option value="presentacion">Presentación</option>
              <option value="hoja_calculo">Hoja de Cálculo</option>
              <option value="archivo">Archivo</option>
              <option value="zip">Comprimido</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="academico">Académico</option>
              <option value="tutorial">Tutorial</option>
              <option value="documentacion">Documentación</option>
              <option value="administrativo">Administrativo</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <select
              value={filters.curso_id}
              onChange={(e) => handleFilterChange('curso_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.titulo}
                </option>
              ))}
            </select>
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
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Recursos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamaño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                        <span className="text-2xl">{getFileIcon(resource.tipo)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {resource.titulo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {resource.descripcion}
                        </div>
                        <div className="text-xs text-gray-400">
                          Subido por: {resource.subido_por_nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(resource.tipo)}`}>
                      {resource.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resource.tamano_formateado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resource.curso_titulo || 'Sin curso'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(resource.estado)}`}>
                      {resource.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(resource.fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a
                        href={resource.s3_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        👁️ Ver
                      </a>
                      <button
                        onClick={() => openEditModal(resource)}
                        className="text-green-600 hover:text-green-900"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
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

      {/* Modal de Subida */}
      {showUploadModal && (
        <UploadModal
          formData={uploadForm}
          setFormData={setUploadForm}
          courses={courses}
          onSubmit={handleUpload}
          onClose={() => setShowUploadModal(false)}
          progress={uploadProgress}
        />
      )}

      {/* Modal de Edición */}
      {showEditModal && (
        <EditModal
          formData={editForm}
          setFormData={setEditForm}
          courses={courses}
          onSubmit={handleUpdateResource}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

// Componente Modal para Subir Recurso
const UploadModal = ({ formData, setFormData, courses, onSubmit, onClose, progress }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📤 Subir Nuevo Recurso</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivo *
              </label>
              <input
                id="file-upload"
                type="file"
                required
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                accept="*/*"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 100MB</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="academico">Académico</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="documentacion">Documentación</option>
                  <option value="administrativo">Administrativo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso (opcional)
                </label>
                <select
                  value={formData.curso_id}
                  onChange={(e) => setFormData({...formData, curso_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sin curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="acceso_publico"
                  checked={formData.acceso_publico}
                  onChange={(e) => setFormData({...formData, acceso_publico: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="acceso_publico" className="ml-2 block text-sm text-gray-900">
                  Acceso público
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiere_autenticacion"
                  checked={formData.requiere_autenticacion}
                  onChange={(e) => setFormData({...formData, requiere_autenticacion: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="requiere_autenticacion" className="ml-2 block text-sm text-gray-900">
                  Requiere autenticación
                </label>
              </div>
            </div>
            
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Subir Recurso
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Componente Modal para Editar Recurso
const EditModal = ({ formData, setFormData, courses, onSubmit, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">✏️ Editar Recurso</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sin categoría</option>
                  <option value="general">General</option>
                  <option value="academico">Académico</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="documentacion">Documentación</option>
                  <option value="administrativo">Administrativo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_acceso_publico"
                  checked={formData.acceso_publico}
                  onChange={(e) => setFormData({...formData, acceso_publico: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="edit_acceso_publico" className="ml-2 block text-sm text-gray-900">
                  Acceso público
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_requiere_autenticacion"
                  checked={formData.requiere_autenticacion}
                  onChange={(e) => setFormData({...formData, requiere_autenticacion: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="edit_requiere_autenticacion" className="ml-2 block text-sm text-gray-900">
                  Requiere autenticación
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResourceManagement 