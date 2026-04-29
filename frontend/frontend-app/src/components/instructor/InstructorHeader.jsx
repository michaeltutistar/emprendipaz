import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';

import { Badge } from '../ui/badge';

import { LogOut, User, ArrowLeft } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';
import ProgramLogosBanner from '../ProgramLogosBanner';
import API_BASE_URL from '@/config/api'
import { clearAuthToken, clearPwaCachedUser } from '@/utils/auth-storage';

const InstructorHeader = ({ title, subtitle, showBackButton = false, backUrl = '/instructor/dashboard' }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error('Error al cargar perfil:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // Limpiar datos locales
        localStorage.removeItem('userEmail');
        sessionStorage.clear();
        clearAuthToken();
        clearPwaCachedUser();
        
        // Redirigir al login
        navigate('/login');
        toast.success('Sesión cerrada exitosamente');
      } else {
        toast.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div>
      <ProgramLogosBanner />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(backUrl)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-gray-600 text-sm">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              {user && (
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.nombre} {user.apellido}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {user.rol}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorHeader; 