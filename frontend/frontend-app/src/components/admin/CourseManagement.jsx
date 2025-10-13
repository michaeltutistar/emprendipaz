import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, BookOpen, Play, CheckCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Progress } from '../ui/progress'

const CourseManagement = () => {
  const [cursos, setCursos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCurso, setEditingCurso] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('all')

  useEffect(() => {
    fetchCursos()
    fetchUsuarios()
  }, [])

  const fetchCursos = async () => {
    try {
      const response = await fetch('/api/cursos', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCursos(data.cursos || [])
      }
    } catch (error) {
      console.error('Error fetching cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error)
    }
  }

  const createCurso = async (cursoData) => {
    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(cursoData)
      })

      if (response.ok) {
        await fetchCursos()
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al crear curso')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const updateCurso = async (cursoId, cursoData) => {
    try {
      const response = await fetch(`/api/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(cursoData)
      })

      if (response.ok) {
        await fetchCursos()
        setEditingCurso(null)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al actualizar curso')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const asignarCurso = async (cursoId, userId) => {
    try {
      const response = await fetch(`/api/cursos/${cursoId}/asignar/${userId}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        alert('Curso asignado exitosamente')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al asignar curso')
      }
    } catch (error) {
      alert('Error de conexión')
    }
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

  const getTipoColor = (tipo) => {
    const colores = {
      'video': 'bg-red-100 text-red-800',
      'pdf': 'bg-blue-100 text-blue-800',
      'quiz': 'bg-green-100 text-green-800',
      'otro': 'bg-gray-100 text-gray-800'
    }
    return colores[tipo] || 'bg-gray-100 text-gray-800'
  }

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = filterTipo === 'all' || curso.tipo === filterTipo
    return matchesSearch && matchesTipo
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Cargando cursos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Cursos</p>
                <p className="text-2xl font-bold">{cursos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Cursos Activos</p>
                <p className="text-2xl font-bold">{cursos.filter(c => c.activo).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{usuarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Cursos Completados</p>
                <p className="text-2xl font-bold">
                  {cursos.reduce((total, curso) => total + curso.usuarios_completados, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Cursos</CardTitle>
            <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear Curso
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de cursos */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCursos.map((curso) => (
                  <TableRow key={curso.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{curso.titulo}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {curso.descripcion}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{getTipoIcon(curso.tipo)}</span>
                        <Badge className={getTipoColor(curso.tipo)}>
                          {curso.tipo.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={curso.activo ? "default" : "secondary"}>
                        {curso.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{curso.total_usuarios} asignados</div>
                        <div className="text-green-600">{curso.usuarios_completados} completados</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Progress 
                          value={curso.total_usuarios > 0 ? (curso.usuarios_completados / curso.total_usuarios * 100) : 0} 
                          className="h-2" 
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {curso.total_usuarios > 0 ? 
                            Math.round(curso.usuarios_completados / curso.total_usuarios * 100) : 0}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCurso(curso)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* TODO: Implementar asignación */}}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCursos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron cursos con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de creación/edición */}
      {showCreateForm && (
        <CourseForm
          curso={null}
          onSubmit={createCurso}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingCurso && (
        <CourseForm
          curso={editingCurso}
          onSubmit={(data) => updateCurso(editingCurso.id, data)}
          onCancel={() => setEditingCurso(null)}
        />
      )}
    </div>
  )
}

// Componente para formulario de curso
const CourseForm = ({ curso, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: curso?.titulo || '',
    descripcion: curso?.descripcion || '',
    tipo: curso?.tipo || 'video',
    url: curso?.url || '',
    activo: curso?.activo ?? true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{curso ? 'Editar Curso' : 'Crear Nuevo Curso'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título *</label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Título del curso"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Descripción del curso"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo *</label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <Select value={formData.activo.toString()} onValueChange={(value) => setFormData({...formData, activo: value === 'true'})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              placeholder="https://ejemplo.com/curso"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {curso ? 'Actualizar' : 'Crear'} Curso
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default CourseManagement
