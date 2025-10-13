import React, { useState, useEffect } from 'react'
import { BookOpen, Play, CheckCircle, Clock, AlertCircle, ExternalLink, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'

const MyCourses = () => {
  const [cursos, setCursos] = useState([])
  const [estadisticas, setEstadisticas] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    try {
      const response = await fetch('/api/usuarios/me/cursos', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCursos(data.cursos || [])
        setEstadisticas(data.estadisticas || {})
      } else {
        setError('Error al cargar cursos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const updateCursoEstado = async (asignacionId, nuevoEstado) => {
    try {
      const response = await fetch(`/api/usuarios_cursos/${asignacionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (response.ok) {
        await fetchMyCourses() // Recargar datos
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar curso')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const updateProgreso = async (asignacionId, progreso) => {
    try {
      const response = await fetch(`/api/usuarios_cursos/${asignacionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ progreso: progreso })
      })

      if (response.ok) {
        await fetchMyCourses() // Recargar datos
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al actualizar progreso')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const getEstadoIcon = (estado) => {
    const iconos = {
      'pendiente': <Clock className="h-4 w-4 text-yellow-500" />,
      'en_progreso': <Play className="h-4 w-4 text-blue-500" />,
      'completado': <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return iconos[estado] || <AlertCircle className="h-4 w-4 text-gray-500" />
  }

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'en_progreso': 'bg-blue-100 text-blue-800',
      'completado': 'bg-green-100 text-green-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  const getTipoIcon = (tipo) => {
    const iconos = {
      'video': '🎥',
      'pdf': '📄',
      'quiz': '❓',
      'otro': '📚'
    }
    return iconos[tipo] || '📚'
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando cursos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Cursos</p>
                <p className="text-2xl font-bold">{estadisticas.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold">{estadisticas.completados || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold">{estadisticas.en_progreso || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Progreso General</p>
                <p className="text-2xl font-bold">{estadisticas.progreso_general || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso General */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso de todos los cursos</span>
              <span>{estadisticas.progreso_general || 0}%</span>
            </div>
            <Progress value={estadisticas.progreso_general || 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de cursos */}
      <div className="space-y-4">
        {cursos.length > 0 ? (
          cursos.map((curso) => (
            <Card key={curso.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getTipoIcon(curso.curso.tipo)}</span>
                      <CardTitle className="text-lg">{curso.curso.titulo}</CardTitle>
                      <Badge className={getEstadoColor(curso.estado)}>
                        {getEstadoIcon(curso.estado)}
                        <span className="ml-1">{curso.estado.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                    </div>
                    <p className="text-gray-600">{curso.curso.descripcion}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progreso del curso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso del curso</span>
                      <span>{curso.progreso}%</span>
                    </div>
                    <Progress value={curso.progreso} className="h-2" />
                  </div>

                  {/* Información del curso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Asignado:</strong> {formatearFecha(curso.fecha_asignacion)}
                    </div>
                    {curso.fecha_inicio && (
                      <div>
                        <strong>Iniciado:</strong> {formatearFecha(curso.fecha_inicio)}
                      </div>
                    )}
                    {curso.fecha_completado && (
                      <div>
                        <strong>Completado:</strong> {formatearFecha(curso.fecha_completado)}
                      </div>
                    )}
                    {curso.fecha_ultima_actividad && (
                      <div>
                        <strong>Última actividad:</strong> {formatearFecha(curso.fecha_ultima_actividad)}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-4">
                    {curso.estado === 'pendiente' && (
                      <Button
                        onClick={() => updateCursoEstado(curso.id, 'en_progreso')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Curso
                      </Button>
                    )}

                    {curso.estado === 'en_progreso' && (
                      <>
                        <Button
                          onClick={() => updateCursoEstado(curso.id, 'completado')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como Completado
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const nuevoProgreso = prompt('Ingresa el progreso (0-100):', curso.progreso)
                            if (nuevoProgreso && !isNaN(nuevoProgreso) && nuevoProgreso >= 0 && nuevoProgreso <= 100) {
                              updateProgreso(curso.id, parseInt(nuevoProgreso))
                            }
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Actualizar Progreso
                        </Button>
                      </>
                    )}

                    {curso.curso.url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(curso.curso.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Curso
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos asignados</h3>
              <p className="text-gray-500">
                Los cursos se asignarán automáticamente según tu fase en el proyecto
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default MyCourses
