import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Calendar,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Eye,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Repeat,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import InstructorHeader from './InstructorHeader';

const ContentScheduler = () => {
  const [contenidoProgramado, setContenidoProgramado] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_contenido: 'documento',
    curso_id: '',
    modulo_id: '',
    fecha_publicacion: '',
    hora_publicacion: '',
    estado: 'programado',
    repeticion: 'una_vez',
    recordatorio: false,
    recordatorio_horas: 24
  });
  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarContenidoProgramado();
    cargarDatosInstructor();
  }, []);

  const cargarDatosInstructor = async () => {
    try {
      // Cargar cursos del instructor
      const cursosResponse = await fetch('/api/instructor/cursos', {
        credentials: 'include'
      });
      
      if (cursosResponse.ok) {
        const cursosData = await cursosResponse.json();
        if (cursosData.success) {
          setCursos(cursosData.data);
        }
      }
      
      // Cargar módulos del instructor
      const modulosResponse = await fetch('/api/instructor/modulos', {
        credentials: 'include'
      });
      
      if (modulosResponse.ok) {
        const modulosData = await modulosResponse.json();
        if (modulosData.success) {
          setModulos(modulosData.data);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del instructor:", error);
    }
  };

  const cargarContenidoProgramado = async () => {
    // Simular carga de datos
    const mockContenido = [
      {
        id: 1,
        titulo: "Video: Introducción a React Hooks",
        descripcion: "Explicación detallada de los hooks más importantes",
        tipo_contenido: "video",
        curso_id: 1,
        modulo_id: 3,
        fecha_publicacion: "2024-01-25T10:00:00",
        estado: "programado",
        repeticion: "una_vez",
        recordatorio: true,
        recordatorio_horas: 24,
        fecha_creacion: "2024-01-20T09:00:00"
      },
      {
        id: 2,
        titulo: "PDF: Guía de Ejercicios - Módulo 2",
        descripcion: "Ejercicios prácticos para reforzar conceptos",
        tipo_contenido: "documento",
        curso_id: 1,
        modulo_id: 2,
        fecha_publicacion: "2024-01-26T14:30:00",
        estado: "programado",
        repeticion: "semanal",
        recordatorio: false,
        recordatorio_horas: 0,
        fecha_creacion: "2024-01-19T15:30:00"
      },
      {
        id: 3,
        titulo: "Presentación: Patrones de Diseño",
        descripcion: "Slides sobre patrones de diseño en React",
        tipo_contenido: "documento",
        curso_id: 2,
        modulo_id: 4,
        fecha_publicacion: "2024-01-24T16:00:00",
        estado: "publicado",
        repeticion: "una_vez",
        recordatorio: true,
        recordatorio_horas: 12,
        fecha_creacion: "2024-01-18T11:00:00"
      },
      {
        id: 4,
        titulo: "Video: Optimización de Rendimiento",
        descripcion: "Técnicas para mejorar el rendimiento de aplicaciones",
        tipo_contenido: "video",
        curso_id: 2,
        modulo_id: 4,
        fecha_publicacion: "2024-01-27T09:00:00",
        estado: "pausado",
        repeticion: "una_vez",
        recordatorio: true,
        recordatorio_horas: 48,
        fecha_creacion: "2024-01-21T13:00:00"
      }
    ];

    setContenidoProgramado(mockContenido);
  };

  const obtenerModulosPorCurso = (cursoId) => {
    return modulos.filter(modulo => modulo.curso_id === parseInt(cursoId));
  };

  const obtenerCursoPorId = (cursoId) => {
    return cursos.find(curso => curso.id === cursoId);
  };

  const obtenerModuloPorId = (moduloId) => {
    return modulos.find(modulo => modulo.id === moduloId);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaRelativa = (fecha) => {
    const ahora = new Date();
    const fechaPub = new Date(fecha);
    const diffMs = fechaPub - ahora;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHoras = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffMs < 0) {
      return 'Publicado';
    } else if (diffDias === 0) {
      return `En ${diffHoras} horas`;
    } else if (diffDias === 1) {
      return 'Mañana';
    } else {
      return `En ${diffDias} días`;
    }
  };

  const obtenerIconoTipo = (tipo) => {
    return tipo === 'video' ? (
      <Video className="h-4 w-4 text-blue-500" />
    ) : (
      <FileText className="h-4 w-4 text-green-500" />
    );
  };

  const obtenerBadgeEstado = (estado) => {
    const config = {
      programado: { variant: 'default', icon: Clock, text: 'Programado' },
      publicado: { variant: 'secondary', icon: CheckCircle, text: 'Publicado' },
      pausado: { variant: 'outline', icon: Pause, text: 'Pausado' },
      cancelado: { variant: 'destructive', icon: AlertCircle, text: 'Cancelado' }
    };

    const configItem = config[estado] || config.programado;
    const IconComponent = configItem.icon;

    return (
      <Badge variant={configItem.variant}>
        <IconComponent className="h-3 w-3 mr-1" />
        {configItem.text}
      </Badge>
    );
  };

  const handleNuevoProgramacion = () => {
    setItemEditando(null);
    setFormData({
      titulo: '',
      descripcion: '',
      tipo_contenido: 'documento',
      curso_id: '',
      modulo_id: '',
      fecha_publicacion: '',
      hora_publicacion: '',
      estado: 'programado',
      repeticion: 'una_vez',
      recordatorio: false,
      recordatorio_horas: 24
    });
    setMostrarFormulario(true);
  };

  const handleEditarProgramacion = (item) => {
    setItemEditando(item);
    setFormData({
      titulo: item.titulo,
      descripcion: item.descripcion,
      tipo_contenido: item.tipo_contenido,
      curso_id: item.curso_id.toString(),
      modulo_id: item.modulo_id.toString(),
      fecha_publicacion: item.fecha_publicacion.split('T')[0],
      hora_publicacion: item.fecha_publicacion.split('T')[1].substring(0, 5),
      estado: item.estado,
      repeticion: item.repeticion,
      recordatorio: item.recordatorio,
      recordatorio_horas: item.recordatorio_horas
    });
    setMostrarFormulario(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error("Por favor ingresa un título");
      return;
    }

    if (!formData.fecha_publicacion || !formData.hora_publicacion) {
      toast.error("Por favor selecciona fecha y hora de publicación");
      return;
    }

    try {
      const fechaCompleta = `${formData.fecha_publicacion}T${formData.hora_publicacion}:00`;
      
      if (itemEditando) {
        // Actualizar programación existente
        const contenidoActualizado = contenidoProgramado.map(item =>
          item.id === itemEditando.id
            ? { ...item, ...formData, fecha_publicacion: fechaCompleta }
            : item
        );
        setContenidoProgramado(contenidoActualizado);
        toast.success("Programación actualizada exitosamente");
      } else {
        // Crear nueva programación
        const nuevaProgramacion = {
          id: Date.now(),
          ...formData,
          fecha_publicacion: fechaCompleta,
          fecha_creacion: new Date().toISOString()
        };
        setContenidoProgramado(prev => [...prev, nuevaProgramacion]);
        toast.success("Contenido programado exitosamente");
      }
      
      setMostrarFormulario(false);
      setItemEditando(null);
      setFormData({
        titulo: '',
        descripcion: '',
        tipo_contenido: 'documento',
        curso_id: '',
        modulo_id: '',
        fecha_publicacion: '',
        hora_publicacion: '',
        estado: 'programado',
        repeticion: 'una_vez',
        recordatorio: false,
        recordatorio_horas: 24
      });
    } catch (error) {
      toast.error("Error al guardar la programación");
    }
  };

  const handleEliminarProgramacion = (item) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la programación "${item.titulo}"?`)) {
      setContenidoProgramado(prev => prev.filter(i => i.id !== item.id));
      toast.success("Programación eliminada exitosamente");
    }
  };

  const cambiarEstado = (item, nuevoEstado) => {
    const contenidoActualizado = contenidoProgramado.map(i =>
      i.id === item.id ? { ...i, estado: nuevoEstado } : i
    );
    setContenidoProgramado(contenidoActualizado);
    toast.success(`Estado cambiado a ${nuevoEstado}`);
  };

  const contenidoFiltrado = contenidoProgramado.filter(item => {
    if (filtroEstado === 'todos') return true;
    return item.estado === filtroEstado;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <InstructorHeader 
          title="Programación de Contenido"
          subtitle="Programa cuándo se publicará tu contenido automáticamente"
          showBackButton={true}
          backUrl="/instructor/dashboard"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panel lateral */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total programado:</span>
                  <span className="font-medium">{contenidoProgramado.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pendientes:</span>
                  <span className="font-medium">
                    {contenidoProgramado.filter(item => item.estado === 'programado').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Publicados:</span>
                  <span className="font-medium">
                    {contenidoProgramado.filter(item => item.estado === 'publicado').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pausados:</span>
                  <span className="font-medium">
                    {contenidoProgramado.filter(item => item.estado === 'pausado').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    >
                      <option value="todos">Todos</option>
                      <option value="programado">Programado</option>
                      <option value="publicado">Publicado</option>
                      <option value="pausado">Pausado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Botón nuevo */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Contenido Programado</h2>
              <Button onClick={handleNuevoProgramacion}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Programación
              </Button>
            </div>

            {/* Formulario */}
            {mostrarFormulario && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {itemEditando ? 'Editar Programación' : 'Nueva Programación'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                          id="titulo"
                          value={formData.titulo}
                          onChange={(e) => handleInputChange('titulo', e.target.value)}
                          placeholder="Título del contenido"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo_contenido">Tipo de Contenido</Label>
                        <select
                          id="tipo_contenido"
                          value={formData.tipo_contenido}
                          onChange={(e) => handleInputChange('tipo_contenido', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="documento">Documento</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        placeholder="Describe el contenido..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="curso">Curso</Label>
                        <select
                          id="curso"
                          value={formData.curso_id}
                          onChange={(e) => {
                            handleInputChange('curso_id', e.target.value);
                            handleInputChange('modulo_id', ''); // Reset módulo
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Selecciona un curso</option>
                          {cursos.map((curso) => (
                            <option key={curso.id} value={curso.id}>
                              {curso.titulo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="modulo">Módulo</Label>
                        <select
                          id="modulo"
                          value={formData.modulo_id}
                          onChange={(e) => handleInputChange('modulo_id', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          disabled={!formData.curso_id}
                        >
                          <option value="">Selecciona un módulo</option>
                          {formData.curso_id && obtenerModulosPorCurso(formData.curso_id).map((modulo) => (
                            <option key={modulo.id} value={modulo.id}>
                              {modulo.titulo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <select
                          id="estado"
                          value={formData.estado}
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="programado">Programado</option>
                          <option value="pausado">Pausado</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="fecha">Fecha de Publicación *</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={formData.fecha_publicacion}
                          onChange={(e) => handleInputChange('fecha_publicacion', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <Label htmlFor="hora">Hora de Publicación *</Label>
                        <Input
                          id="hora"
                          type="time"
                          value={formData.hora_publicacion}
                          onChange={(e) => handleInputChange('hora_publicacion', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="repeticion">Repetición</Label>
                        <select
                          id="repeticion"
                          value={formData.repeticion}
                          onChange={(e) => handleInputChange('repeticion', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="una_vez">Una vez</option>
                          <option value="diario">Diario</option>
                          <option value="semanal">Semanal</option>
                          <option value="mensual">Mensual</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="recordatorio"
                          checked={formData.recordatorio}
                          onChange={(e) => handleInputChange('recordatorio', e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="recordatorio">Enviar recordatorio</Label>
                      </div>
                      
                      {formData.recordatorio && (
                        <div>
                          <Label htmlFor="recordatorio_horas">Horas antes de la publicación</Label>
                          <Input
                            id="recordatorio_horas"
                            type="number"
                            value={formData.recordatorio_horas}
                            onChange={(e) => handleInputChange('recordatorio_horas', parseInt(e.target.value))}
                            min="1"
                            max="168"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit">
                        {itemEditando ? 'Actualizar' : 'Programar'} Contenido
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setMostrarFormulario(false);
                          setItemEditando(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de contenido programado */}
            <div className="space-y-4">
              {contenidoFiltrado.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {obtenerIconoTipo(item.tipo_contenido)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium">{item.titulo}</h3>
                            {obtenerBadgeEstado(item.estado)}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{item.descripcion}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{formatearFecha(item.fecha_publicacion)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{formatearFechaRelativa(item.fecha_publicacion)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Repeat className="h-4 w-4 text-gray-400" />
                              <span className="capitalize">{item.repeticion.replace('_', ' ')}</span>
                            </div>
                            {item.recordatorio && (
                              <div className="flex items-center space-x-1">
                                <Bell className="h-4 w-4 text-gray-400" />
                                <span>{item.recordatorio_horas}h antes</span>
                              </div>
                            )}
                          </div>

                          {item.curso_id && (
                            <div className="mt-2 text-sm text-gray-500">
                              <span>Curso: {obtenerCursoPorId(item.curso_id)?.titulo}</span>
                              {item.modulo_id && (
                                <span> • Módulo: {obtenerModuloPorId(item.modulo_id)?.titulo}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {item.estado === 'programado' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cambiarEstado(item, 'pausado')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cambiarEstado(item, 'publicado')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {item.estado === 'pausado' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cambiarEstado(item, 'programado')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarProgramacion(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarProgramacion(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {contenidoFiltrado.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay contenido programado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza programando la publicación de tu contenido.
                  </p>
                  <Button onClick={handleNuevoProgramacion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Programar Contenido
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentScheduler; 