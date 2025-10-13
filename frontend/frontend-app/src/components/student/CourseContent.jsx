import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Play, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  Eye,
  Video,
  File,
  BookOpen,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import StudentHeader from './StudentHeader';

const CourseContent = () => {
  const { cursoId } = useParams();
  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [leccionActual, setLeccionActual] = useState(null);
  const [progreso, setProgreso] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (cursoId) {
      cargarContenidoCurso();
    }
  }, [cursoId]);

  const cargarContenidoCurso = async () => {
    try {
      setLoading(true);
      
      // Cargar información del curso
      const cursoResponse = await fetch(`/api/student/curso/${cursoId}`, {
        credentials: 'include'
      });
      
      if (cursoResponse.ok) {
        const cursoData = await cursoResponse.json();
        if (cursoData.success) {
          setCurso(cursoData.data);
        }
      }
      
      // Cargar módulos del curso
      const modulosResponse = await fetch(`/api/student/curso/${cursoId}/modulos`, {
        credentials: 'include'
      });
      
      if (modulosResponse.ok) {
        const modulosData = await modulosResponse.json();
        if (modulosData.success) {
          setModulos(modulosData.data);
        }
      }
      
      // Cargar progreso del estudiante
      const progresoResponse = await fetch(`/api/student/curso/${cursoId}/progreso`, {
        credentials: 'include'
      });
      
      if (progresoResponse.ok) {
        const progresoData = await progresoResponse.json();
        if (progresoData.success) {
          setProgreso(progresoData.data);
        }
      }
      
    } catch (error) {
      console.error('Error al cargar contenido del curso:', error);
      toast.error('Error al cargar el contenido del curso');
    } finally {
      setLoading(false);
    }
  };

  const marcarLeccionCompletada = async (leccionId) => {
    try {
      const response = await fetch(`/api/student/leccion/${leccionId}/completar`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Lección marcada como completada');
          cargarContenidoCurso(); // Recargar progreso
        } else {
          toast.error(data.error || 'Error al marcar lección como completada');
        }
      } else {
        toast.error('Error al conectar con el servidor');
      }
    } catch (error) {
      console.error('Error al marcar lección como completada:', error);
      toast.error('Error al marcar lección como completada');
    }
  };

  const obtenerIconoTipo = (tipo) => {
    switch (tipo) {
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'documento':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const obtenerEstadoLeccion = (leccionId) => {
    return progreso.leccionesCompletadas?.includes(leccionId) ? 'completada' : 'pendiente';
  };

  const formatearDuracion = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  const obtenerSiguienteLeccion = (moduloActual, leccionActual) => {
    const lecciones = modulos.flatMap(mod => mod.lecciones);
    const indiceActual = lecciones.findIndex(l => l.id === leccionActual?.id);
    return indiceActual < lecciones.length - 1 ? lecciones[indiceActual + 1] : null;
  };

  const obtenerLeccionAnterior = (moduloActual, leccionActual) => {
    const lecciones = modulos.flatMap(mod => mod.lecciones);
    const indiceActual = lecciones.findIndex(l => l.id === leccionActual?.id);
    return indiceActual > 0 ? lecciones[indiceActual - 1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h2>
          <Button onClick={() => navigate('/student/cursos')}>
            Volver a Mis Cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader 
        title={curso.titulo}
        subtitle="Contenido del curso"
        showBackButton={true}
        backUrl="/student/cursos"
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar con módulos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Módulos del Curso</CardTitle>
                <CardDescription>
                  {modulos.length} módulos • {modulos.reduce((total, mod) => total + mod.lecciones.length, 0)} lecciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modulos.map((modulo, moduloIndex) => (
                    <div key={modulo.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{modulo.titulo}</h4>
                        <Badge variant="outline" className="text-xs">
                          {modulo.lecciones.filter(l => progreso.leccionesCompletadas?.includes(l.id)).length}/{modulo.lecciones.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {modulo.lecciones.map((leccion, leccionIndex) => (
                          <button
                            key={leccion.id}
                            onClick={() => setLeccionActual(leccion)}
                            className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                              leccionActual?.id === leccion.id
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {obtenerIconoTipo(leccion.tipo)}
                              <span className="flex-1 truncate">{leccion.titulo}</span>
                              {obtenerEstadoLeccion(leccion.id) === 'completada' && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            {leccion.duracion && (
                              <div className="text-xs text-gray-500 mt-1">
                                {formatearDuracion(leccion.duracion)}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {leccionActual ? (
              <div className="space-y-6">
                {/* Información de la lección */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{leccionActual.titulo}</CardTitle>
                        <CardDescription className="mt-2">
                          {leccionActual.descripcion}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {obtenerIconoTipo(leccionActual.tipo)}
                        <Badge variant="outline">{leccionActual.tipo}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Contenido multimedia */}
                <Card>
                  <CardContent className="p-6">
                    {leccionActual.tipo === 'video' && (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-full"
                          src={leccionActual.url}
                          poster={leccionActual.thumbnail}
                        >
                          Tu navegador no soporta el elemento de video.
                        </video>
                      </div>
                    )}

                    {leccionActual.tipo === 'documento' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                              <h4 className="font-medium">{leccionActual.titulo}</h4>
                              <p className="text-sm text-gray-500">
                                Documento • {leccionActual.tamanio || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(leccionActual.url, '_blank')}
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                        
                        {leccionActual.contenido && (
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: leccionActual.contenido }} />
                          </div>
                        )}
                      </div>
                    )}

                    {leccionActual.tipo === 'pdf' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <File className="h-8 w-8 text-red-500" />
                            <div>
                              <h4 className="font-medium">{leccionActual.titulo}</h4>
                              <p className="text-sm text-gray-500">
                                PDF • {leccionActual.tamanio || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => window.open(leccionActual.url, '_blank')}
                              variant="outline"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = leccionActual.url;
                                link.download = leccionActual.titulo;
                                link.click();
                              }}
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Navegación y acciones */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const anterior = obtenerLeccionAnterior(null, leccionActual);
                          if (anterior) setLeccionActual(anterior);
                        }}
                        disabled={!obtenerLeccionAnterior(null, leccionActual)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>

                      <div className="flex items-center space-x-4">
                        {obtenerEstadoLeccion(leccionActual.id) === 'completada' ? (
                          <Badge variant="default" className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completada
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => marcarLeccionCompletada(leccionActual.id)}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Completada
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          const siguiente = obtenerSiguienteLeccion(null, leccionActual);
                          if (siguiente) setLeccionActual(siguiente);
                        }}
                        disabled={!obtenerSiguienteLeccion(null, leccionActual)}
                      >
                        Siguiente
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Selecciona una lección
                  </h3>
                  <p className="text-gray-600">
                    Elige una lección del menú lateral para comenzar a aprender.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent; 