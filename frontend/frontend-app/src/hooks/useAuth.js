import { useState, useEffect } from 'react';
import API_BASE_URL from '@/config/api'
import { isInstalledPwa } from '@/utils/pwa';
import {
  clearAuthToken,
  getAuthToken,
  getPwaCachedUser,
  setPwaCachedUser,
  canRestorePwaSession,
  isForceLoggedOut,
  clearLocalSession
} from '@/utils/auth-storage';
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const pwaInstalled = isInstalledPwa();
    const cached = getPwaCachedUser();

    try {
      // Si el usuario hizo "logout local", no auto-restaurar sesión con refresh token.
      if (isForceLoggedOut()) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const token = getAuthToken();

      if (pwaInstalled && canRestorePwaSession() && !token) {
        setUser(cached);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // PWA instalada: permitir sesión "local" cuando no hay conexión
      if (pwaInstalled && typeof navigator !== 'undefined' && navigator.onLine === false) {
        if (cached) {
          setUser(cached);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        setPwaCachedUser(userData);
      } else {
        // Token inválido o sesión no válida
        if (pwaInstalled && cached) {
          // En PWA instalada, NO borramos la sesión automáticamente:
          // mantenemos al usuario "logueado" localmente si hay perfil cacheado.
          setUser(cached);
          setIsAuthenticated(true);
        } else {
          clearAuthToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      if (canRestorePwaSession()) {
        setUser(cached);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearLocalSession();
    localStorage.removeItem('userEmail');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.rol === 'admin',
    isInstructor: user?.rol === 'instructor',
    isStudent: user?.rol === 'estudiante',
    logout
  };
};
