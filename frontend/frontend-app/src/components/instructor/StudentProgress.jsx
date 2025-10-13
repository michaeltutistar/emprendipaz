import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InstructorHeader from './InstructorHeader';

const StudentProgress = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <InstructorHeader 
          title="Progreso de Estudiantes"
          subtitle="Monitorea el avance de tus estudiantes en tiempo real"
          showBackButton={true}
          backUrl="/instructor/dashboard"
        />

        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Seguimiento de Progreso
            </h3>
            <p className="text-gray-600 mb-6">
              Esta funcionalidad estará disponible próximamente. Aquí podrás ver el progreso detallado de cada estudiante, 
              estadísticas de participación y métricas de rendimiento.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/instructor/dashboard')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/instructor/modulos')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Gestionar Módulos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProgress; 