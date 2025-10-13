import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User,
  Loader2
} from 'lucide-react';
import StudentDashboard from './StudentDashboard';
import StudentDashboardBlocked from './StudentDashboardBlocked';

const StudentDashboardAccess = () => {
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserStatus(userData);
      } else {
        setError('Error al verificar el estado del usuario');
      }
    } catch (err) {
      console.error('Error al verificar estado del usuario:', err);
      setError('Error de conexión al verificar el estado');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'activa':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactiva':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'suspendida':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'rechazada':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'activa':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activa</Badge>;
      case 'inactiva':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Inactiva</Badge>;
      case 'suspendida':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspendida</Badge>;
      case 'rechazada':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rechazada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{estado || 'Desconocido'}</Badge>;
    }
  };

  const getStatusMessage = (estado) => {
    switch (estado) {
      case 'activa':
        return {
          title: '¡Acceso Autorizado!',
          description: 'Tu cuenta está activa y puedes acceder al dashboard de estudiante.',
          type: 'success'
        };
      case 'inactiva':
        return {
          title: 'Cuenta Inactiva',
          description: 'Tu cuenta está inactiva. Contacta al administrador para activarla.',
          type: 'warning'
        };
      case 'suspendida':
        return {
          title: 'Cuenta Suspendida',
          description: 'Tu cuenta ha sido suspendida temporalmente. Contacta al administrador.',
          type: 'error'
        };
      case 'rechazada':
        return {
          title: 'Cuenta Rechazada',
          description: 'Tu solicitud ha sido rechazada. Contacta al administrador para más información.',
          type: 'error'
        };
      default:
        return {
          title: 'Estado Desconocido',
          description: 'No se pudo determinar el estado de tu cuenta. Contacta al administrador.',
          type: 'warning'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verificando estado de la cuenta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Error de Verificación</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={checkUserStatus} 
              className="w-full mt-4"
              variant="outline"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si el usuario tiene estado "activa", mostrar el dashboard completo
  if (userStatus?.estado_cuenta === 'activa') {
    return <StudentDashboard />;
  }

  // Para cualquier otro estado, mostrar el dashboard bloqueado con información específica
  const statusInfo = getStatusMessage(userStatus?.estado_cuenta);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header con información del usuario */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(userStatus?.estado_cuenta)}
                  <span>Estado de la Cuenta</span>
                </CardTitle>
                <CardDescription>
                  Hola, {userStatus?.nombre} {userStatus?.apellido}
                </CardDescription>
              </div>
              {getStatusBadge(userStatus?.estado_cuenta)}
            </div>
          </CardHeader>
        </Card>

        {/* Mensaje de estado específico */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${
              statusInfo.type === 'success' ? 'text-green-600' :
              statusInfo.type === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {getStatusIcon(userStatus?.estado_cuenta)}
              <span>{statusInfo.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={`border-${
              statusInfo.type === 'success' ? 'green' :
              statusInfo.type === 'warning' ? 'yellow' :
              'red'
            }-200 bg-${
              statusInfo.type === 'success' ? 'green' :
              statusInfo.type === 'warning' ? 'yellow' :
              'red'
            }-50`}>
              <AlertCircle className={`h-4 w-4 text-${
                statusInfo.type === 'success' ? 'green' :
                statusInfo.type === 'warning' ? 'yellow' :
                'red'
              }-600`} />
              <AlertDescription className={`text-${
                statusInfo.type === 'success' ? 'green' :
                statusInfo.type === 'warning' ? 'yellow' :
                'red'
              }-800`}>
                {statusInfo.description}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Dashboard bloqueado con información específica */}
        <StudentDashboardBlocked customMessage={statusInfo.description} />
      </div>
    </div>
  );
};

export default StudentDashboardAccess;
