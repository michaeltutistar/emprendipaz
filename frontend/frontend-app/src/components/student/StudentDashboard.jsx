import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award, 
  Calendar, 
  Play, 
  CheckCircle, 
  AlertCircle,
  User,
  Settings,
  Download,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StudentHeader from './StudentHeader';
import PhaseProgress from '../PhaseProgress';
import Notifications from '../Notifications';
import MyCourses from '../MyCourses';
import MyAssets from '../MyAssets'
import EvidenceUploadFixed from '../EvidenceUploadFixed'

const StudentDashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    cursosActivos: 0,
    cursosCompletados: 0,
    progresoGeneral: 0,
    proximasFechas: [],
    actividadReciente: []
  });
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas del dashboard
      const statsResponse = await fetch('/api/student/dashboard', {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setEstadisticas(statsData.data);
        }
      }
      
      // Cargar cursos del estudiante
      const cursosResponse = await fetch('/api/student/cursos', {
        credentials: 'include'
      });
      
      if (cursosResponse.ok) {
        const cursosData = await cursosResponse.json();
        if (cursosData.success) {
          setCursos(cursosData.data);
        }
      }
      
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar el dashboard');
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

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'en_progreso':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const cursosActivos = cursos.filter(curso => curso.estado === 'en_progreso');
  const cursosCompletados = cursos.filter(curso => curso.estado === 'completado');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader 
        title="Panel del Estudiante"
        subtitle="Bienvenido a tu espacio de aprendizaje"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.cursosActivos}</div>
              <p className="text-xs text-muted-foreground">
                En progreso actualmente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.cursosCompletados}</div>
              <p className="text-xs text-muted-foreground">
                Finalizados exitosamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.progresoGeneral}%</div>
              <p className="text-xs text-muted-foreground">
                Promedio de todos los cursos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Fechas</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.proximasFechas.length}</div>
              <p className="text-xs text-muted-foreground">
                Fechas límite próximas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="progreso" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="progreso">Mi Progreso</TabsTrigger>
            <TabsTrigger value="fases">Fases del Proyecto</TabsTrigger>
            <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
            <TabsTrigger value="cursos">Mis Cursos</TabsTrigger>
            <TabsTrigger value="activos">Mis Activos</TabsTrigger>
            <TabsTrigger value="evidencias">Evidencias</TabsTrigger>
            <TabsTrigger value="cursos_old">Mis Cursos (Old)</TabsTrigger>
            <TabsTrigger value="fechas">Próximas Fechas</TabsTrigger>
            <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
          </TabsList>

          <TabsContent value="progreso" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progreso por curso */}
              <Card>
                <CardHeader>
                  <CardTitle>Progreso por Curso</CardTitle>
                  <CardDescription>
                    Tu avance en cada curso inscrito
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cursosActivos.map((curso) => (
                    <div key={curso.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{curso.titulo}</span>
                        <span className="text-sm text-gray-500">{curso.progreso}%</span>
                      </div>
                      <Progress value={curso.progreso} className="h-2" />
                    </div>
                  ))}
                  {cursosActivos.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No tienes cursos activos
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resumen de módulos */}
              <Card>
                <CardHeader>
                  <CardTitle>Módulos Completados</CardTitle>
                  <CardDescription>
                    Progreso por módulos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cursosActivos.slice(0, 3).map((curso) => (
                      <div key={curso.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{curso.titulo}</span>
                          <Badge variant="outline">
                            {curso.modulosCompletados}/{curso.totalModulos} módulos
                          </Badge>
                        </div>
                        <Progress 
                          value={(curso.modulosCompletados / curso.totalModulos) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fases" className="space-y-6">
            <PhaseProgress />
          </TabsContent>

          <TabsContent value="notificaciones" className="space-y-6">
            <Notifications />
          </TabsContent>

          <TabsContent value="cursos" className="space-y-6">
            <MyCourses />
          </TabsContent>

          <TabsContent value="activos" className="space-y-6">
            <MyAssets />
          </TabsContent>

          <TabsContent value="evidencias" className="space-y-6">
            <EvidenceUploadFixed />
          </TabsContent>

          <TabsContent value="cursos_old" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mis Cursos</h2>
              <Button onClick={() => navigate('/student/cursos')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Explorar Cursos
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((curso) => (
                <Card key={curso.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{curso.titulo}</CardTitle>
                        <CardDescription className="mt-2">{curso.descripcion}</CardDescription>
                      </div>
                      <Badge variant={curso.estado === 'completado' ? 'default' : 'secondary'}>
                        {curso.estado === 'completado' ? 'Completado' : 
                         curso.estado === 'en_progreso' ? 'En Progreso' : 'Pendiente'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso:</span>
                          <span className="font-medium">{curso.progreso}%</span>
                        </div>
                        <Progress value={curso.progreso} className="h-2" />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Inscrito: {formatearFecha(curso.fechaInscripcion)}</span>
                        <span>Última actividad: {formatearFecha(curso.ultimaActividad)}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/student/curso/${curso.id}`)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Continuar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/student/curso/${curso.id}/progreso`)}
                          className="flex-1"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Progreso
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fechas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Fechas Límite</CardTitle>
                <CardDescription>
                  Actividades y tareas pendientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas.proximasFechas.length > 0 ? (
                    estadisticas.proximasFechas.map((fecha, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <Calendar className="h-5 w-5 text-orange-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{fecha.titulo}</p>
                          <p className="text-xs text-gray-500">{fecha.curso}</p>
                        </div>
                        <Badge variant="outline">
                          {formatearFecha(fecha.fechaLimite)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No hay fechas límite próximas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actividad" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Tu actividad de aprendizaje reciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas.actividadReciente.length > 0 ? (
                    estadisticas.actividadReciente.map((actividad, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        {obtenerIconoEstado(actividad.tipo)}
                        <div className="flex-1">
                          <p className="text-sm">{actividad.descripcion}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatearFecha(actividad.fecha)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No hay actividad reciente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard; 