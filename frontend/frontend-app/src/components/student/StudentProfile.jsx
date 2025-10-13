import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  User, 
  Award, 
  Edit, 
  Save, 
  Download,
  Eye,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StudentHeader from './StudentHeader';

const StudentProfile = () => {
  const [perfil, setPerfil] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    pais: '',
    ciudad: '',
    bio: ''
  });
  const [certificados, setCertificados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      
      // Cargar información del perfil
      const perfilResponse = await fetch('/api/student/perfil', {
        credentials: 'include'
      });
      
      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        if (perfilData.success) {
          setPerfil(perfilData.data);
        }
      }
      
      // Cargar certificados
      const certificadosResponse = await fetch('/api/student/certificados', {
        credentials: 'include'
      });
      
      if (certificadosResponse.ok) {
        const certificadosData = await certificadosResponse.json();
        if (certificadosData.success) {
          setCertificados(certificadosData.data);
        }
      }
      
      // Cargar estadísticas
      const statsResponse = await fetch('/api/student/estadisticas', {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setEstadisticas(statsData.data);
        }
      }
      
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPerfil = async () => {
    try {
      const response = await fetch('/api/student/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(perfil)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Perfil actualizado exitosamente');
          setEditando(false);
        } else {
          toast.error(data.error || 'Error al actualizar perfil');
        }
      } else {
        toast.error('Error al conectar con el servidor');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error('Error al guardar el perfil');
    }
  };

  const handleDescargarCertificado = async (certificadoId) => {
    try {
      const response = await fetch(`/api/student/certificado/${certificadoId}/descargar`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${certificadoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Certificado descargado exitosamente');
      } else {
        toast.error('Error al descargar el certificado');
      }
    } catch (error) {
      console.error('Error al descargar certificado:', error);
      toast.error('Error al descargar el certificado');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <StudentHeader 
        title="Mi Perfil"
        subtitle="Gestiona tu información personal"
        showBackButton={true}
        backUrl="/student/dashboard"
      />

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfil">Información Personal</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Gestiona tus datos personales y preferencias
                    </CardDescription>
                  </div>
                  <Button
                    variant={editando ? "default" : "outline"}
                    onClick={() => editando ? handleGuardarPerfil() : setEditando(true)}
                  >
                    {editando ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={perfil.nombre}
                      onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={perfil.email}
                      onChange={(e) => setPerfil({...perfil, email: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={perfil.telefono}
                      onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={perfil.fechaNacimiento}
                      onChange={(e) => setPerfil({...perfil, fechaNacimiento: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      value={perfil.pais}
                      onChange={(e) => setPerfil({...perfil, pais: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={perfil.ciudad}
                      onChange={(e) => setPerfil({...perfil, ciudad: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografía
                    </label>
                    <textarea
                      value={perfil.bio}
                      onChange={(e) => setPerfil({...perfil, bio: e.target.value})}
                      disabled={!editando}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Cuéntanos un poco sobre ti..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Mis Certificados
                </CardTitle>
                <CardDescription>
                  Descarga tus certificados de cursos completados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificados.length > 0 ? (
                    certificados.map((certificado) => (
                      <div key={certificado.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Award className="h-8 w-8 text-yellow-500" />
                          <div>
                            <h4 className="font-medium">{certificado.curso}</h4>
                            <p className="text-sm text-gray-500">
                              Completado el {formatearFecha(certificado.fechaCompletado)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Calificación: {certificado.calificacion}%
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/certificado/${certificado.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDescargarCertificado(certificado.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No tienes certificados aún
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Completa cursos para obtener certificados y verlos aquí.
                      </p>
                      <Button onClick={() => navigate('/student/cursos')}>
                        Explorar Cursos
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estadisticas.cursosCompletados || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de cursos finalizados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Horas de Estudio</CardTitle>
                  <Clock className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estadisticas.horasEstudio || 0}h</div>
                  <p className="text-xs text-muted-foreground">
                    Tiempo total invertido
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Promedio Calificación</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estadisticas.promedioCalificacion || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Calificación promedio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Días Activo</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estadisticas.diasActivo || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Días de actividad
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Progreso por Categoría</CardTitle>
                <CardDescription>
                  Tu rendimiento en diferentes áreas de conocimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estadisticas.progresoPorCategoria?.map((categoria, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{categoria.nombre}</span>
                        <span className="text-sm text-gray-500">{categoria.progreso}%</span>
                      </div>
                      <Progress value={categoria.progreso} className="h-2" />
                    </div>
                  ))}
                  {(!estadisticas.progresoPorCategoria || estadisticas.progresoPorCategoria.length === 0) && (
                    <p className="text-center text-gray-500 py-4">
                      No hay datos de progreso por categoría disponibles
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

export default StudentProfile; 