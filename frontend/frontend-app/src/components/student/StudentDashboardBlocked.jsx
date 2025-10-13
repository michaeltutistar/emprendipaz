import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Info, Lock, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoGobernacion from '../../assets/logo-gobernacion.png';

const StudentDashboardBlocked = ({ customMessage }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Plataforma Emprendipaz</h1>
          <p className="text-gray-600">Gobernación de Nariño</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Acceso Temporalmente Restringido
            </CardTitle>
            <CardDescription className="text-gray-600">
              {customMessage || "El dashboard de estudiante no está disponible en este momento"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Mensaje principal */}
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-semibold">Dashboard temporalmente bloqueado</p>
                  <p className="text-sm">
                    {customMessage || "El acceso al dashboard de estudiante está temporalmente restringido para todos los usuarios hasta que finalice la fase de inscripción y selección del programa."}
                  </p>
                  {!customMessage && (
                    <p className="text-sm">
                      Te notificaremos cuando el acceso esté disponible nuevamente.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">¿Qué puedes hacer mientras tanto?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Revisar los términos de referencia del programa</li>
                <li>• Contactar al equipo de soporte si tienes dudas</li>
                <li>• Mantenerte informado sobre las actualizaciones</li>
                <li>• Preparar la documentación necesaria</li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGoHome}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver Atrás
              </Button>
            </div>

            {/* Enlaces útiles */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Enlaces útiles:</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/terminos-referencia')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Términos de Referencia
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboardBlocked;

