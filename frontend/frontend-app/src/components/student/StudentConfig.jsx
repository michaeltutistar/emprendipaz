import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Settings, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StudentHeader from './StudentHeader';

const StudentConfig = () => {
  const [configuracion, setConfiguracion] = useState({
    notificacionesEmail: true,
    notificacionesPush: true,
    idioma: 'es',
    tema: 'claro',
    privacidad: 'publico'
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/student/configuracion', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfiguracion(data.data);
        }
      }
      
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      
      const response = await fetch('/api/student/configuracion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(configuracion)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Configuración guardada exitosamente');
        } else {
          toast.error(data.error || 'Error al guardar configuración');
        }
      } else {
        toast.error('Error al conectar con el servidor');
      }
      
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader 
          title="Configuración"
          subtitle="Gestiona tus preferencias"
          showBackButton={true}
          backUrl="/student/dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando configuración...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader 
        title="Configuración"
        subtitle="Gestiona tus preferencias"
        showBackButton={true}
        backUrl="/student/dashboard"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Botón de guardar */}
        <div className="flex justify-end mb-8">
          <Button 
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription>
                Configura cómo recibir notificaciones sobre tu progreso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificaciones por Email</h3>
                  <p className="text-sm text-gray-600">
                    Recibe actualizaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={configuracion.notificacionesEmail}
                  onCheckedChange={(checked) => handleInputChange('notificacionesEmail', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificaciones Push</h3>
                  <p className="text-sm text-gray-600">
                    Recibe notificaciones en tiempo real en tu navegador
                  </p>
                </div>
                <Switch
                  checked={configuracion.notificacionesPush}
                  onCheckedChange={(checked) => handleInputChange('notificacionesPush', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-600" />
                <span>Preferencias</span>
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma</label>
                <Select
                  value={configuracion.idioma}
                  onValueChange={(value) => handleInputChange('idioma', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tema</label>
                <Select
                  value={configuracion.tema}
                  onValueChange={(value) => handleInputChange('tema', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claro">Claro</SelectItem>
                    <SelectItem value="oscuro">Oscuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>Privacidad</span>
              </CardTitle>
              <CardDescription>
                Controla la visibilidad de tu perfil y actividad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibilidad del Perfil</label>
                <Select
                  value={configuracion.privacidad}
                  onValueChange={(value) => handleInputChange('privacidad', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publico">Público</SelectItem>
                    <SelectItem value="amigos">Solo Amigos</SelectItem>
                    <SelectItem value="privado">Privado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600">
                  Controla quién puede ver tu perfil y progreso
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-orange-600" />
                <span>Información del Sistema</span>
              </CardTitle>
              <CardDescription>
                Detalles sobre tu cuenta y la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Versión de la Plataforma</span>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Última Actualización</span>
                <span className="text-sm">Hoy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estado de la Cuenta</span>
                <Badge variant="success">Activa</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentConfig; 