import React, { useState, useEffect } from 'react'

const CourseContentManager = ({ courseId, onClose }) => {
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Estados para modales
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  
  // Estados para formularios
  const [moduleForm, setModuleForm] = useState({
    titulo: '',
    descripcion: '',
    estado: 'activo'
  })
  
  const [lessonForm, setLessonForm] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    tipo: 'texto',
    duracion_minutos: 0,
    url_video: '',
    archivo_url: '',
    estado: 'activo'
  })

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      
      // Obtener información del curso
      const courseResponse = await fetch(`/api/admin/courses/${courseId}`, {
        credentials: 'include'
      })
      
      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        setCourse(courseData)
      }
      
      // Obtener módulos del curso
      const modulesResponse = await fetch(`/api/content/courses/${courseId}/modules`, {
        credentials: 'include'
      })
      
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json()
        setModules(modulesData.modules)
      }
      
    } catch (error) {
      setError('Error al cargar datos del curso')
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async (moduleId) => {
    try {
      const response = await fetch(`/api/content/modules/${moduleId}/lessons`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setLessons(data.lessons)
      }
    } catch (error) {
      console.error('Error al cargar lecciones:', error)
    }
  }

  const handleModuleSelect = (module) => {
    setSelectedModule(module)
    fetchLessons(module.id)
  }

  const handleCreateModule = async () => {
    try {
      const response = await fetch(`/api/content/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(moduleForm)
      })
      
      if (response.ok) {
        setShowModuleModal(false)
        setModuleForm({ titulo: '', descripcion: '', estado: 'activo' })
        fetchCourseData()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear módulo')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleUpdateModule = async () => {
    try {
      const response = await fetch(`/api/content/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(moduleForm)
      })
      
      if (response.ok) {
        setShowModuleModal(false)
        setEditingModule(null)
        setModuleForm({ titulo: '', descripcion: '', estado: 'activo' })
        fetchCourseData()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar módulo')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este módulo?')) {
      return
    }

    try {
      const response = await fetch(`/api/content/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchCourseData()
        if (selectedModule && selectedModule.id === moduleId) {
          setSelectedModule(null)
          setLessons([])
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar módulo')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleCreateLesson = async () => {
    if (!selectedModule) return

    try {
      const response = await fetch(`/api/content/modules/${selectedModule.id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(lessonForm)
      })
      
      if (response.ok) {
        setShowLessonModal(false)
        setLessonForm({
          titulo: '',
          descripcion: '',
          contenido: '',
          tipo: 'texto',
          duracion_minutos: 0,
          url_video: '',
          archivo_url: '',
          estado: 'activo'
        })
        fetchLessons(selectedModule.id)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear lección')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleUpdateLesson = async () => {
    try {
      const response = await fetch(`/api/content/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(lessonForm)
      })
      
      if (response.ok) {
        setShowLessonModal(false)
        setEditingLesson(null)
        setLessonForm({
          titulo: '',
          descripcion: '',
          contenido: '',
          tipo: 'texto',
          duracion_minutos: 0,
          url_video: '',
          archivo_url: '',
          estado: 'activo'
        })
        fetchLessons(selectedModule.id)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al actualizar lección')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta lección?')) {
      return
    }

    try {
      const response = await fetch(`/api/content/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchLessons(selectedModule.id)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al eliminar lección')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const openModuleModal = (module = null) => {
    if (module) {
      setEditingModule(module)
      setModuleForm({
        titulo: module.titulo,
        descripcion: module.descripcion || '',
        estado: module.estado
      })
    } else {
      setEditingModule(null)
      setModuleForm({ titulo: '', descripcion: '', estado: 'activo' })
    }
    setShowModuleModal(true)
  }

  const openLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson)
      setLessonForm({
        titulo: lesson.titulo,
        descripcion: lesson.descripcion || '',
        contenido: lesson.contenido || '',
        tipo: lesson.tipo,
        duracion_minutos: lesson.duracion_minutos || 0,
        url_video: lesson.url_video || '',
        archivo_url: lesson.archivo_url || '',
        estado: lesson.estado
      })
    } else {
      setEditingLesson(null)
      setLessonForm({
        titulo: '',
        descripcion: '',
        contenido: '',
        tipo: 'texto',
        duracion_minutos: 0,
        url_video: '',
        archivo_url: '',
        estado: 'activo'
      })
    }
    setShowLessonModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      activo: 'bg-green-100 text-green-800',
      inactivo: 'bg-yellow-100 text-yellow-800',
      borrador: 'bg-gray-100 text-gray-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type) => {
    const badges = {
      texto: 'bg-blue-100 text-blue-800',
      video: 'bg-red-100 text-red-800',
      pdf: 'bg-purple-100 text-purple-800',
      quiz: 'bg-orange-100 text-orange-800'
    }
    return badges[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando contenido del curso...</p>
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
              📚 Gestión de Contenido: {course?.titulo}
            </h2>
            <p className="text-gray-600">
              Administra módulos y lecciones del curso
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Módulos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📦 Módulos</h3>
              <button
                onClick={() => openModuleModal()}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
              >
                ➕ Nuevo
              </button>
            </div>
            
            <div className="space-y-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModule?.id === module.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModuleSelect(module)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{module.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.total_lecciones} lecciones
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusBadge(module.estado)}`}>
                        {module.estado}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openModuleModal(module)
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteModule(module.id)
                        }}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {modules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay módulos creados</p>
                  <p className="text-sm">Crea el primer módulo para comenzar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Lecciones */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {selectedModule ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      📖 Lecciones: {selectedModule.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lessons.length} lecciones en este módulo
                    </p>
                  </div>
                  <button
                    onClick={() => openLessonModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    ➕ Nueva Lección
                  </button>
                </div>
                
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{lesson.titulo}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(lesson.tipo)}`}>
                              {lesson.tipo}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(lesson.estado)}`}>
                              {lesson.estado}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {lesson.descripcion}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏱️ {lesson.duracion_minutos} min</span>
                            <span>📅 {new Date(lesson.fecha_creacion).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openLessonModal(lesson)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {lessons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay lecciones en este módulo</p>
                      <p className="text-sm">Crea la primera lección para comenzar</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Selecciona un módulo para ver sus lecciones</p>
                <p className="text-sm">O crea un nuevo módulo si no hay ninguno</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Módulos */}
      {showModuleModal && (
        <ModuleModal
          title={editingModule ? 'Editar Módulo' : 'Crear Nuevo Módulo'}
          formData={moduleForm}
          setFormData={setModuleForm}
          onSubmit={editingModule ? handleUpdateModule : handleCreateModule}
          onClose={() => {
            setShowModuleModal(false)
            setEditingModule(null)
            setModuleForm({ titulo: '', descripcion: '', estado: 'activo' })
          }}
        />
      )}

      {/* Modal para Lecciones */}
      {showLessonModal && (
        <LessonModal
          title={editingLesson ? 'Editar Lección' : 'Crear Nueva Lección'}
          formData={lessonForm}
          setFormData={setLessonForm}
          onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}
          onClose={() => {
            setShowLessonModal(false)
            setEditingLesson(null)
            setLessonForm({
              titulo: '',
              descripcion: '',
              contenido: '',
              tipo: 'texto',
              duracion_minutos: 0,
              url_video: '',
              archivo_url: '',
              estado: 'activo'
            })
          }}
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

// Componente Modal para Módulos
const ModuleModal = ({ title, formData, setFormData, onSubmit, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          
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
                <option value="borrador">Borrador</option>
              </select>
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
                {title.includes('Editar') ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Componente Modal para Lecciones
const LessonModal = ({ title, formData, setFormData, onSubmit, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="texto">Texto</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.duracion_minutos}
                  onChange={(e) => setFormData({...formData, duracion_minutos: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                  <option value="borrador">Borrador</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            {formData.tipo === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Video
                </label>
                <input
                  type="url"
                  value={formData.url_video}
                  onChange={(e) => setFormData({...formData, url_video: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}
            
            {(formData.tipo === 'pdf' || formData.tipo === 'quiz') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Archivo
                </label>
                <input
                  type="url"
                  value={formData.archivo_url}
                  onChange={(e) => setFormData({...formData, archivo_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/archivo.pdf"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido
              </label>
              <textarea
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Escribe el contenido de la lección aquí..."
              />
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
                {title.includes('Editar') ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CourseContentManager 