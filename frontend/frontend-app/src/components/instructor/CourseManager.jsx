import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { BookOpen, Plus, Edit, Eye, Users, TrendingUp, Calendar, Search, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import InstructorHeader from './InstructorHeader';

const CourseManager = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    nivel: 'básico',
    duracion_horas: 0,
    estado: 'activo',
    convocatoria: ''
  });
  const navigate = useNavigate();
  const { cursoId } = useParams();
  const location = window.location.pathname;
  const isNewCourse = location.includes('/curso/nuevo');

  useEffect(() => {
    if (isNewCourse) {
      // Si estamos en modo nuevo curso, no cargar nada
      setLoading(false);
    } else if (cursoId) {
      // Si hay un cursoId en la URL, mostrar detalles del curso
      cargarDetalleCurso(cursoId);
    } else {
      // Si no hay cursoId, cargar lista de cursos
      cargarCursos();
    }
  }, [cursoId, isNewCourse]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instructor/cursos', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCursos(data.data);
        } else {
          toast.error("Error al cargar cursos");
        }
      } else {
        toast.error("Error al conectar con el servidor");
      }
    } catch (error) {
      toast.error("Error al cargar los cursos");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleCurso = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/curso/${id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCursos([data.data]); // Mostrar solo este curso
        } else {
          toast.error("Error al cargar detalles del curso");
        }
      } else {
        toast.error("Error al conectar con el servidor");
      }
    } catch (error) {
      toast.error("Error al cargar detalles del curso");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filtrarCursos = () => {
    if (!searchTerm) return cursos;
    return cursos.filter(curso => 
      curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error("Por favor ingresa un título para el curso");
      return;
    }
    if (!formData.convocatoria) {
      toast.error("Selecciona la convocatoria (1 o 2)");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/instructor/curso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("Curso creado exitosamente");
          navigate('/instructor/dashboard');
        } else {
          toast.error(data.error || "Error al crear el curso");
        }
      } else {
        toast.error("Error al conectar con el servidor");
      }
    } catch (error) {
      toast.error("Error al crear el curso");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id, titulo) => {
    const confirmado = window.confirm(`¿Estás seguro de eliminar el curso "${titulo}"? Esta acción no se puede deshacer.`)
    if (!confirmado) return

    try {
      setLoading(true)
      const response = await fetch(`/api/instructor/curso/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok && data.success) {
        toast.success('Curso eliminado exitosamente')
        if (cursoId) {
          navigate('/instructor/dashboard')
        } else {
          // Refrescar lista
          cargarCursos()
        }
      } else {
        toast.error(data.error || 'No se pudo eliminar el curso')
      }
    } catch (error) {
      toast.error('Error de conexión al eliminar el curso')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cursosFiltrados = filtrarCursos();

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader 
        title={isNewCourse ? "Crear Nuevo Curso" : cursoId ? "Detalle del Curso" : "Mis Cursos"}
        subtitle={isNewCourse ? "Crea un nuevo curso para tus estudiantes" : cursoId ? "Información detallada del curso" : "Gestiona tus cursos asignados"}
        showBackButton={true}
        backUrl="/instructor/dashboard"
      />

      <div className="max-w-7xl mx-auto p-6">
        {isNewCourse ? (
          // Formulario de creación de curso
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
                <CardDescription>
                  Completa la información básica del nuevo curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Curso *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Introducción a React"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={formData.categoria}
                        onChange={(e) => handleInputChange('categoria', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Desarrollo Web"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel
                      </label>
                      <select
                        value={formData.nivel}
                        onChange={(e) => handleInputChange('nivel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="básico">Básico</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración (horas)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.duracion_horas}
                        onChange={(e) => handleInputChange('duracion_horas', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={formData.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="borrador">Borrador</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Convocatoria *
                      </label>
                      <select
                        value={formData.convocatoria}
                        onChange={(e) => handleInputChange('convocatoria', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecciona...</option>
                        <option value="1">Convocatoria 1</option>
                        <option value="2">Convocatoria 2</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe el contenido y objetivos del curso..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/instructor/dashboard')}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creando..." : "Crear Curso"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : !cursoId && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {cursosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {searchTerm ? "No se encontraron cursos" : "No tienes cursos asignados"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? "Intenta con otros términos de búsqueda"
                      : "Contacta al administrador para que te asigne cursos."
                    }
                  </p>
                  <Button onClick={() => navigate('/instructor/dashboard')}>
                    Volver al Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursosFiltrados.map((curso) => (
                  <Card key={curso.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{curso.titulo}</CardTitle>
                          <CardDescription className="mt-2">{curso.descripcion}</CardDescription>
                        </div>
                        <Badge variant={curso.estado === 'activo' ? 'default' : 'secondary'}>
                          {curso.estado}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Estudiantes:</span>
                          <span className="font-medium">{curso.totalEstudiantes}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progreso promedio:</span>
                            <span className="font-medium">{curso.promedioProgreso}%</span>
                          </div>
                          <Progress value={curso.promedioProgreso} className="h-2" />
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Creado: {formatearFecha(curso.fechaCreacion)}</span>
                          <span>Actualizado: {formatearFecha(curso.fechaActualizacion)}</span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/instructor/curso/${curso.id}`)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/instructor/estudiantes/${curso.id}`)}
                            className="flex-1"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Estudiantes
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteCourse(curso.id, curso.titulo)}
                            className="flex-1"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {cursoId && cursos.length > 0 && (
          <div className="space-y-6">
            {cursos.map((curso) => (
              <Card key={curso.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{curso.titulo}</CardTitle>
                      <CardDescription className="mt-2 text-lg">{curso.descripcion}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={curso.estado === 'activo' ? 'default' : 'secondary'} className="text-sm">
                        {curso.estado}
                      </Badge>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCourse(curso.id, curso.titulo)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">{curso.totalEstudiantes}</div>
                      <div className="text-sm text-gray-600">Estudiantes</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <div className="text-2xl font-bold">{curso.promedioProgreso}%</div>
                      <div className="text-sm text-gray-600">Progreso Promedio</div>
                    </div>
                    <div className="text-center">
                      <Calendar className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <div className="text-sm font-medium">{formatearFecha(curso.fechaCreacion)}</div>
                      <div className="text-sm text-gray-600">Fecha de Creación</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso promedio del curso:</span>
                        <span className="font-medium">{curso.promedioProgreso}%</span>
                      </div>
                      <Progress value={curso.promedioProgreso} className="h-3" />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={() => navigate(`/instructor/estudiantes/${curso.id}`)}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ver Estudiantes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/instructor/modulos')}
                      className="flex-1"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Gestionar Módulos
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/instructor/contenido')}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Subir Contenido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManager; 