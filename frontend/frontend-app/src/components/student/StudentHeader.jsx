import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  BookOpen, 
  User, 
  Settings, 
  LogOut
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import { toast } from 'sonner';
import API_BASE_URL from '@/config/api'
import { clearLocalSession } from '@/utils/auth-storage';

const StudentHeader = ({
  title,
  subtitle,
  showBackButton = false,
  backUrl = '/student/dashboard',
  showUserMenu = true,
  showFullNameButton = false,
  userMenuMode = 'full',
  hideNavigation = false,
  navigationItemsOverride = null,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showUserMenu) {
      setLoading(false);
      return;
    }

    cargarInformacionUsuario();
  }, [showUserMenu]);

  const cargarInformacionUsuario = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/perfil`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const nombre = data.data.nombre || '';
          const apellido = data.data.apellido || '';
          setUserName(nombre);
          setUserFullName(`${nombre} ${apellido}`.replace(/\s+/g, ' ').trim() || nombre || 'Usuario');
        }
      }
    } catch (error) {
      console.error('Error al cargar información del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Sesión cerrada exitosamente');
      } else {
        toast.error('No se pudo cerrar sesión en el servidor. Se cerrará localmente.');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Sin conexión. Se cerrará la sesión localmente.');
    } finally {
      // Siempre permitir "cambiar usuario" sin reinstalar, incluso offline/401.
      clearLocalSession();
      navigate('/login');
    }
  };

  const defaultNavigationItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: BookOpen },
    { name: 'Mis Cursos', href: '/student/cursos', icon: BookOpen },
    { name: 'Mi Perfil', href: '/student/perfil', icon: User },
    { name: 'Configuración', href: '/student/configuracion', icon: Settings },
  ];
  const navigationItems = navigationItemsOverride || defaultNavigationItems;

  const displayUserName = showFullNameButton ? userFullName : userName;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título - Estructura fija */}
          <div className="flex items-center flex-1 min-w-0 max-w-md">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backUrl)}
                className="mr-4 flex-shrink-0"
              >
                ← Volver
              </Button>
            )}
            
            <div className="flex-shrink-0">
              <Link to="/student/dashboard" className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  E-Learning
                </span>
              </Link>
            </div>

            {title && (
              <div className="ml-8 min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 truncate">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Navegación desktop - Estructura fija */}
          {!hideNavigation && (
            <nav className="hidden lg:flex items-center space-x-6 flex-shrink-0">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const classes = 'flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors whitespace-nowrap';

              if (item.action === 'logout') {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={handleLogout}
                    className={classes}
                  >
                    {Icon ? <Icon className="h-4 w-4 mr-2" /> : null}
                    {item.name}
                  </button>
                );
              }

              if (item.onClick) {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={item.onClick}
                    className={classes}
                  >
                    {Icon ? <Icon className="h-4 w-4 mr-2" /> : null}
                    {item.name}
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classes}
                >
                  {Icon ? <Icon className="h-4 w-4 mr-2" /> : null}
                  {item.name}
                </Link>
              );
            })}
            </nav>
          )}

          {/* Acciones del usuario - Estructura fija */}
          {showUserMenu && (
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Menú de usuario */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block max-w-32 truncate">
                    {loading ? 'Cargando...' : displayUserName || 'Usuario'}
                  </span>
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    {userMenuMode !== 'logout-only' && (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {displayUserName || 'Usuario'}
                        </div>
                        <Link
                          to="/student/perfil"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Mi Perfil
                        </Link>
                        <Link
                          to="/student/configuracion"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configuración
                        </Link>
                        <hr className="my-1" />
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentHeader; 