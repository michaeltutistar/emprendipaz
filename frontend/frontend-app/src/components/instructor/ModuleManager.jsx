import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen, 
  FileText, 
  Video, 
  Calendar,
  ArrowUp,
  ArrowDown,
  GripVertical,
  FolderOpen,
  Clock,
  Users,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import InstructorHeader from './InstructorHeader';

const ModuleManager = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  
  // Estados para formularios
  const [moduleForm, setModuleForm] = useState({
    titulo: '',
    descripcion: '',
    estado: 'activo'
  });
  
  const [lessonForm, setLessonForm] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    tipo: 'texto',
    duracion_minutos: 0,
    url_video: '',
    archivo_url: '',
    estado: 'activo'
  });

  const navigate = useNavigate();

  useEffect(() => {
    cargarCursosInstructor();
  }, []);

  const cargarCursosInstructor = async () => {
    try {
      setLoading(true);
      
      // Cargar cursos del instructor
      const response = await fetch('/api/instructor/cursos', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCursos(data.data || []);
        } else {
          setError('Error al cargar cursos');
        }
      } else {
        setError('Error al conectar con el servidor');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarModulosCurso = async (cursoId) => {
    try {
      const response = await fetch(`/api/instructor/content/courses/${cursoId}/modules`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setModulos(data.modules || []);
        } else {
          console.error('Error al cargar módulos:', data.error);
        }
      } else {
        console.error('Error al cargar módulos');
      }
    } catch (error) {
      console.error('Error al cargar módulos:', error);
    }
  };

  const cargarLeccionesModulo = async (moduleId) => {
    try {
      const response = await fetch(`/api/instructor/content/modules/${moduleId}/lessons`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLecciones(data.lessons || []);
        } else {
          console.error('Error al cargar lecciones:', data.error);
        }
      } else {
        console.error('Error al cargar lecciones');
      }
    } catch (error) {
      console.error('Error al cargar lecciones:', error);
    }
  };

  const handleCursoSelect = (curso) => {
    setCursoSeleccionado(curso);
    setModuloSeleccionado(null);
    setLecciones([]);
    cargarModulosCurso(curso.id);
  };

  const handleModuleSelect = (module) => {
    setModuloSeleccionado(module);
    cargarLeccionesModulo(module.id);
  };

  const handleCreateModule = async () => {
    if (!cursoSeleccionado) {
      toast.error('Por favor selecciona un curso primero');
      return;
    }

    try {
      const response = await fetch(`/api/instructor/content/courses/${cursoSeleccionado.id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(moduleForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowModuleModal(false);
          setModuleForm({ titulo: '', descripcion: '', estado: 'activo' });
          cargarModulosCurso(cursoSeleccionado.id);
          toast.success('Módulo creado exitosamente');
        } else {
          setError(data.error || 'Error al crear módulo');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear módulo');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleUpdateModule = async () => {
    try {
      const response = await fetch(`/api/instructor/content/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(moduleForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowModuleModal(false);
          setEditingModule(null);
          setModuleForm({ titulo: '', descripcion: '', estado: 'activo' });
          cargarModulosCurso(cursoSeleccionado.id);
          toast.success('Módulo actualizado exitosamente');
        } else {
          setError(data.error || 'Error al actualizar módulo');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error al actualizar módulo');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este módulo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/instructor/content/modules/${moduleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          cargarModulosCurso(cursoSeleccionado.id);
          if (moduloSeleccionado && moduloSeleccionado.id === moduleId) {
            setModuloSeleccionado(null);
            setLecciones([]);
          }
          toast.success('Módulo eliminado exitosamente');
        } else {
          setError(data.error || 'Error al eliminar módulo');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error al eliminar módulo');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleCreateLesson = async () => {
    if (!moduloSeleccionado) {
      toast.error('Por favor selecciona un módulo primero');
      return;
    }

    try {
      const response = await fetch(`/api/instructor/content/modules/${moduloSeleccionado.id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(lessonForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowLessonModal(false);
          setLessonForm({
            titulo: '',
            descripcion: '',
            contenido: '',
            tipo: 'texto',
            duracion_minutos: 0,
            url_video: '',
            archivo_url: '',
            estado: 'activo'
          });
          cargarLeccionesModulo(moduloSeleccionado.id);
          toast.success('Lección creada exitosamente');
        } else {
          setError(data.error || 'Error al crear lección');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error al crear lección');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleUpdateLesson = async () => {
    try {
      const response = await fetch(`/api/instructor/content/lessons/${editingLesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(lessonForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setShowLessonModal(false);
          setEditingLesson(null);
          setLessonForm({
            titulo: '',
            descripcion: '',
            contenido: '',
            tipo: 'texto',
            duracion_minutos: 0,
            url_video: '',
            archivo_url: '',
            estado: 'activo'
          });
          cargarLeccionesModulo(moduloSeleccionado.id);
          toast.success('Lección actualizada exitosamente');
        } else {
          setError(data.error || 'Error al actualizar lección');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error al actualizar lección');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta lección?')) {
      return;
    }

    try {
      const response = await fetch(`/api/instructor/content/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          cargarLeccionesModulo(moduloSeleccionado.id);
          toast.success('Lección eliminada exitosamente');
        } else {
          setError(data.error || 'Error al eliminar lección');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error al eliminar lección');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const openModuleModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        titulo: module.titulo,
        descripcion: module.descripcion || '',
        estado: module.estado
      });
    } else {
      setEditingModule(null);
      setModuleForm({ titulo: '', descripcion: '', estado: 'activo' });
    }
    setShowModuleModal(true);
  };

  const openLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        titulo: lesson.titulo,
        descripcion: lesson.descripcion || '',
        contenido: lesson.contenido || '',
        tipo: lesson.tipo,
        duracion_minutos: lesson.duracion_minutos || 0,
        url_video: lesson.url_video || '',
        archivo_url: lesson.archivo_url || '',
        estado: lesson.estado
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        titulo: '',
        descripcion: '',
        contenido: '',
        tipo: 'texto',
        duracion_minutos: 0,
        url_video: '',
        archivo_url: '',
        estado: 'activo'
      });
    }
    setShowLessonModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      activo: 'bg-green-100 text-green-800',
      inactivo: 'bg-yellow-100 text-yellow-800',
      borrador: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const badges = {
      texto: 'bg-blue-100 text-blue-800',
      video: 'bg-red-100 text-red-800',
      pdf: 'bg-purple-100 text-purple-800',
      quiz: 'bg-orange-100 text-orange-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader 
        title="Gestión de Contenido"
        subtitle="Administra módulos y lecciones de tus cursos"
        showBackButton={true}
        backUrl="/instructor/dashboard"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📚 Gestión de Contenido: {cursoSeleccionado?.titulo || 'Selecciona un curso'}
              </h2>
              <p className="text-gray-600">
                Administra módulos y lecciones del curso
              </p>
            </div>
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <X className="h-4 w-4 mr-2 inline" />
              Cerrar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Cursos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>📚 Mis Cursos</CardTitle>
                <CardDescription>
                  Selecciona un curso para gestionar su contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cursos.map((curso) => (
                    <div
                      key={curso.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        cursoSeleccionado?.id === curso.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCursoSelect(curso)}
                    >
                      <h3 className="font-medium text-gray-900">{curso.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1">{curso.descripcion}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {curso.totalModulos || 0} módulos
                        </span>
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {curso.totalLecciones || 0} lecciones
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {curso.totalEstudiantes || 0} estudiantes
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {cursos.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No tienes cursos asignados</p>
                      <p className="text-sm">Contacta al administrador</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Módulos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>📦 Módulos</CardTitle>
                  <Button
                    onClick={() => openModuleModal()}
                    disabled={!cursoSeleccionado}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {cursoSeleccionado ? (
                  <div className="space-y-2">
                    {modulos.map((module) => (
                      <div
                        key={module.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          moduloSeleccionado?.id === module.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleModuleSelect(module)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{module.titulo}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {module.total_lecciones || 0} lecciones
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusBadge(module.estado)}`}>
                              {module.estado}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModuleModal(module);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule(module.id);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {modulos.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hay módulos creados</p>
                        <p className="text-sm">Crea el primer módulo para comenzar</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Selecciona un curso</p>
                    <p className="text-sm">para ver sus módulos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de Lecciones */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      📖 Lecciones: {moduloSeleccionado?.titulo || 'Selecciona un módulo'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {lecciones.length} lecciones en este módulo
                    </p>
                  </div>
                  <Button
                    onClick={() => openLessonModal()}
                    disabled={!moduloSeleccionado}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva Lección
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {moduloSeleccionado ? (
                  <div className="space-y-3">
                    {lecciones.map((lesson) => (
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
                    
                    {lecciones.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hay lecciones en este módulo</p>
                        <p className="text-sm">Crea la primera lección para comenzar</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Selecciona un módulo</p>
                    <p className="text-sm">para ver sus lecciones</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
              setShowModuleModal(false);
              setEditingModule(null);
              setModuleForm({ titulo: '', descripcion: '', estado: 'activo' });
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
              setShowLessonModal(false);
              setEditingLesson(null);
              setLessonForm({
                titulo: '',
                descripcion: '',
                contenido: '',
                tipo: 'texto',
                duracion_minutos: 0,
                url_video: '',
                archivo_url: '',
                estado: 'activo'
              });
            }}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Modal para Módulos
const ModuleModal = ({ title, formData, setFormData, onSubmit, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={3}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="borrador">Borrador</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {title.includes('Editar') ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente Modal para Lecciones
const LessonModal = ({ title, formData, setFormData, onSubmit, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="texto">Texto</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="duracion">Duración (minutos)</Label>
                <Input
                  id="duracion"
                  type="number"
                  min="0"
                  value={formData.duracion_minutos}
                  onChange={(e) => setFormData({...formData, duracion_minutos: parseInt(e.target.value) || 0})}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="borrador">Borrador</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={2}
                className="w-full"
              />
            </div>
            
            {formData.tipo === 'video' && (
              <div>
                <Label htmlFor="url_video">URL del Video</Label>
                <Input
                  id="url_video"
                  type="url"
                  value={formData.url_video}
                  onChange={(e) => setFormData({...formData, url_video: e.target.value})}
                  className="w-full"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}
            
            {(formData.tipo === 'pdf' || formData.tipo === 'quiz') && (
              <div>
                <Label htmlFor="archivo_url">URL del Archivo</Label>
                <Input
                  id="archivo_url"
                  type="url"
                  value={formData.archivo_url}
                  onChange={(e) => setFormData({...formData, archivo_url: e.target.value})}
                  className="w-full"
                  placeholder="https://ejemplo.com/archivo.pdf"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="contenido">Contenido</Label>
              <Textarea
                id="contenido"
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                rows={8}
                className="w-full"
                placeholder="Escribe el contenido de la lección aquí..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {title.includes('Editar') ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModuleManager; 