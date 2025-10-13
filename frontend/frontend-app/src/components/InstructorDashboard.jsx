import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  FileText, 
  Video, 
  Plus,
  Calendar,
  BarChart3,
  Activity,
  Eye,
  Download,
  Upload,
  FolderOpen,
  LogOut,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import InstructorHeader from './instructor/InstructorHeader';

const InstructorDashboard = () => {
  const [cursos, setCursos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalCursos: 0,
    totalEstudiantes: 0,
    promedioProgreso: 0,
    actividadReciente: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatosInstructor();
  }, []);

  const cargarDatosInstructor = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del dashboard del instructor
      const dashboardResponse = await fetch('/api/instructor/dashboard', {
        credentials: 'include'
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success) {
          setEstadisticas({
            totalCursos: dashboardData.data.totalCursos,
            totalEstudiantes: dashboardData.data.totalEstudiantes,
            promedioProgreso: dashboardData.data.promedioProgreso,
            actividadReciente: dashboardData.data.actividadReciente || []
          });
          setCursos(dashboardData.data.cursos || []);
        } else {
          toast.error("Error al cargar datos del dashboard");
        }
      } else {
        toast.error("Error al conectar con el servidor");
      }
    } catch (error) {
      toast.error("Error al cargar los datos del instructor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerIconoActividad = (tipo) => {
    switch (tipo) {
      case 'nuevo_estudiante':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'completado_modulo':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'nuevo_recurso':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
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
        title="Dashboard del Instructor"
        subtitle="Gestiona tus cursos y contenido educativo"
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Contenido principal */}

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.totalCursos}</div>
              <p className="text-xs text-muted-foreground">Cursos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.totalEstudiantes}</div>
              <p className="text-xs text-muted-foreground">Estudiantes inscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.promedioProgreso}%</div>
              <p className="text-xs text-muted-foreground">Promedio general</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.actividadReciente.length}</div>
              <p className="text-xs text-muted-foreground">Eventos hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Tabs defaultValue="cursos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cursos">Mis Cursos</TabsTrigger>
            <TabsTrigger value="actividad">Actividad Reciente</TabsTrigger>
            <TabsTrigger value="recursos">Gestión de Contenido</TabsTrigger>
          </TabsList>

          <TabsContent value="cursos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Resumen de Cursos</h2>
              <Button onClick={() => navigate('/instructor/curso/nuevo')}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
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
                        <span>Última actividad: {formatearFecha(curso.ultimaActividad)}</span>
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
                          onClick={() => navigate('/instructor/modulos')}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="actividad" className="space-y-6">
            <h2 className="text-xl font-semibold">Actividad Reciente</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {estadisticas.actividadReciente.map((actividad) => (
                    <div key={actividad.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 mt-1">
                        {obtenerIconoActividad(actividad.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{actividad.mensaje}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatearFecha(actividad.fecha)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recursos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestión de Contenido</h2>
              <Button onClick={() => navigate('/instructor/contenido/nuevo')}>
                <Plus className="h-4 w-4 mr-2" />
                Subir Contenido
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Video className="h-6 w-6 text-blue-500" />
                    <CardTitle>Subir Videos</CardTitle>
                  </div>
                  <CardDescription>
                    Sube videos educativos a Amazon S3
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/instructor/contenido/video')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Video
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-green-500" />
                    <CardTitle>Subir Documentos</CardTitle>
                  </div>
                  <CardDescription>
                    Sube documentos PDF, presentaciones y más
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/instructor/contenido/documento')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documento
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-purple-500" />
                    <CardTitle>Gestión de Contenido</CardTitle>
                  </div>
                  <CardDescription>
                    Administra módulos y lecciones de tus cursos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/instructor/modulos')}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Gestionar Contenido
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-orange-500" />
                    <CardTitle>Programar Publicaciones</CardTitle>
                  </div>
                  <CardDescription>
                    Programa cuándo se publicará el contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/instructor/programacion')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Programar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorDashboard; 