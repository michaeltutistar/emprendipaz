import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Clock,
  Users,
  Award,
  Play,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StudentHeader from './StudentHeader';

const CourseManager = () => {
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [misCursos, setMisCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedLevel, setSelectedLevel] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      
      // Cargar cursos disponibles (activos)
      const disponiblesResponse = await fetch('/api/student/cursos/disponibles', {
        credentials: 'include'
      });
      
      if (disponiblesResponse.ok) {
        const disponiblesData = await disponiblesResponse.json();
        if (disponiblesData.success) {
          setCursosDisponibles(disponiblesData.data);
        }
      }
      
      // Cargar cursos del estudiante
      const misCursosResponse = await fetch('/api/student/cursos', {
        credentials: 'include'
      });
      
      if (misCursosResponse.ok) {
        const misCursosData = await misCursosResponse.json();
        if (misCursosData.success) {
          setMisCursos(misCursosData.data);
        }
      }
      
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleInscribirse = async (cursoId) => {
    try {
      const response = await fetch('/api/student/inscribirse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ curso_id: cursoId })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Te has inscrito exitosamente al curso');
          cargarCursos(); // Recargar para actualizar la lista
        } else {
          toast.error(data.error || 'Error al inscribirse al curso');
        }
      } else {
        toast.error('Error al conectar con el servidor');
      }
    } catch (error) {
      console.error('Error al inscribirse:', error);
      toast.error('Error al inscribirse al curso');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filtrarCursos = (cursos) => {
    return cursos.filter(curso => {
      const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'todas' || curso.categoria === selectedCategory;
      const matchesLevel = selectedLevel === 'todos' || curso.nivel === selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  };

  const obtenerCategorias = () => {
    const categorias = [...new Set(cursosDisponibles.map(curso => curso.categoria))];
    return categorias.filter(cat => cat && cat.trim() !== '');
  };

  const cursosDisponiblesFiltrados = filtrarCursos(cursosDisponibles);
  const cursosEnProgreso = misCursos.filter(curso => curso.estado === 'en_progreso');
  const cursosCompletados = misCursos.filter(curso => curso.estado === 'completado');

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
        title="Mis Cursos"
        subtitle="Gestiona tus cursos de aprendizaje"
        showBackButton={true}
        backUrl="/student/dashboard"
      />

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="disponibles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="disponibles">Cursos Disponibles</TabsTrigger>
            <TabsTrigger value="en_progreso">En Progreso</TabsTrigger>
            <TabsTrigger value="completados">Completados</TabsTrigger>
          </TabsList>

          <TabsContent value="disponibles" className="space-y-6">
            {/* Filtros y búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar cursos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todas">Todas las categorías</option>
                    {obtenerCategorias().map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos los niveles</option>
                    <option value="básico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de cursos disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosDisponiblesFiltrados.map((curso) => (
                <Card key={curso.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{curso.titulo}</CardTitle>
                        <CardDescription className="mt-2">{curso.descripcion}</CardDescription>
                      </div>
                      <Badge variant="outline">{curso.nivel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {curso.duracion_horas}h
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {curso.totalEstudiantes} estudiantes
                        </div>
                      </div>

                      {curso.categoria && (
                        <Badge variant="secondary">{curso.categoria}</Badge>
                      )}

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Instructor: {curso.instructor}</span>
                        <span>Creado: {formatearFecha(curso.fechaCreacion)}</span>
                      </div>

                      <Button 
                        onClick={() => handleInscribirse(curso.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Inscribirse
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {cursosDisponiblesFiltrados.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {searchTerm || selectedCategory !== 'todas' || selectedLevel !== 'todos' 
                          ? "No se encontraron cursos" 
                          : "No hay cursos disponibles"}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || selectedCategory !== 'todas' || selectedLevel !== 'todos'
                          ? "Intenta con otros filtros de búsqueda"
                          : "Pronto habrá nuevos cursos disponibles."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="en_progreso" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosEnProgreso.map((curso) => (
                <Card key={curso.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{curso.titulo}</CardTitle>
                        <CardDescription className="mt-2">{curso.descripcion}</CardDescription>
                      </div>
                      <Badge variant="secondary">En Progreso</Badge>
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
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Progreso
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {cursosEnProgreso.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Play className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No tienes cursos en progreso
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Inscríbete a un curso para comenzar tu aprendizaje.
                      </p>
                      <Button onClick={() => navigate('/student/cursos')}>
                        Explorar Cursos
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completados" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosCompletados.map((curso) => (
                <Card key={curso.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{curso.titulo}</CardTitle>
                        <CardDescription className="mt-2">{curso.descripcion}</CardDescription>
                      </div>
                      <Badge variant="default">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium">¡Felicidades! Curso completado</span>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Completado: {formatearFecha(curso.fechaCompletado)}</span>
                        <span>Calificación: {curso.calificacion || 'N/A'}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/student/curso/${curso.id}/certificado`)}
                          className="flex-1"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Ver Certificado
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/student/curso/${curso.id}`)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Repasar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {cursosCompletados.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No tienes cursos completados
                      </h3>
                      <p className="text-gray-600">
                        Completa tus cursos para obtener certificados y ver tu historial aquí.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseManager; 