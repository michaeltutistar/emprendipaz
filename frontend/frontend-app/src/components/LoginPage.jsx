import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, ArrowLeft, Info } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import { useAuth } from '../hooks/useAuth'
import API_BASE_URL from '@/config/api'
import { isInstalledPwa } from '@/utils/pwa'
import { setAuthToken, setPwaCachedUser, getAuthToken, getPwaCachedUser, isForceLoggedOut } from '@/utils/auth-storage'

const LoginPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, isAdmin } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showStudentMessage, setShowStudentMessage] = useState(false)

  // Si la app está instalada como PWA y ya hay sesión, evitar mostrar login.
  useEffect(() => {
    if (!isInstalledPwa()) return;
    if (loading) return;
    if (isForceLoggedOut()) return;
    const token = getAuthToken();
    const cached = getPwaCachedUser();
    if (!token && !cached) return;
    if (!isAuthenticated && !cached) return;

    const rol = (user?.rol || cached?.rol || '').toLowerCase();
    if (rol === 'admin' || rol === 'evaluador') {
      navigate('/admin');
    } else if (rol === 'instructor') {
      navigate('/instructor/dashboard');
    } else if (rol === 'estudiante' || rol === 'usuario') {
      navigate('/student/dashboard');
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Función para verificar si el registro está habilitado
  const isRegistrationEnabled = () => {
    // Solo permitir registro para administradores
    return isAdmin;
  };

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar token JWT
        if (data.token) {
          setAuthToken(data.token)
        }

        if (data.user) {
          setPwaCachedUser(data.user);
        }
        
        // Guardar información de sesión si "Recordarme" está marcado
        if (formData.remember) {
          localStorage.setItem('userEmail', formData.email)
        }
        
        // Redirigir según el rol del usuario
        if (data.user && data.user.rol === 'admin') {
          navigate('/admin')
        } else if (data.user && data.user.rol === 'evaluador') {
          navigate('/admin')
        } else if (data.user && data.user.rol === 'instructor') {
          navigate('/instructor/dashboard')
        } else if (data.user && data.user.rol === 'estudiante' || data.user && data.user.rol === 'usuario') {
          // Verificar si el estudiante tiene estado activa
          if (data.user.estado_cuenta === 'activa') {
            // Redirigir al dashboard del estudiante
            navigate('/student/dashboard')
          } else {
            // mostrar mensaje informativo para estudiantes sin estado activa
            setShowStudentMessage(true)
            // Limpiar el formulario
            setFormData({
              email: '',
              password: '',
              remember: false
            })
          }
        } else {
          // mostrar mensaje informativo para usuarios sin rol específico
          setShowStudentMessage(true)
          setFormData({
            email: '',
            password: '',
            remember: false
          })
        }
      } else {
        if (data.error) {
          setErrors({ general: data.error })
        }
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión. Por favor, intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Plataforma Emprendipaz</h1>
          <p className="text-gray-600">Gobernación de Nariño</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-800">Iniciar Sesión</CardTitle>
            </div>
            <CardDescription>
              Ingresa tus credenciales para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mensaje informativo para estudiantes */}
              {showStudentMessage && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">Acceso temporalmente restringido</p>
                          <p className="text-sm">
                            El acceso al dashboard de estudiante está temporalmente restringido hasta que finalice la fase de inscripción y selección.
                          </p>
                          <p className="text-sm">
                            Te notificaremos cuando el acceso esté disponible.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowStudentMessage(false)}
                          className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error general */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Recordarme y Olvidé contraseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    name="remember"
                    checked={formData.remember}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, remember: checked }))
                    }
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Recordarme
                  </Label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de login */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              {/* Link a registro - Deshabilitado por solicitud del usuario */}
              {/* <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                    Subsanación aquí
                  </Link>
                </p>
              </div> */}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage

