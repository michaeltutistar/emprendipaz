import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import logoGov from '../assets/logo-gov.png'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    token: '',
    new_password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Obtener token de la URL
    const token = searchParams.get('token')
    if (token) {
      setFormData(prev => ({ ...prev, token }))
    }
  }, [searchParams])

  const validatePassword = (password) => {
    if (password.length < 8) return false
    if (!/[a-zA-Z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    return true
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.token.trim()) {
      newErrors.token = 'El token de recuperación es obligatorio'
    }

    if (!formData.new_password) {
      newErrors.new_password = 'La nueva contraseña es obligatoria'
    } else if (!validatePassword(formData.new_password)) {
      newErrors.new_password = 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirmar contraseña es obligatorio'
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setSuccessMessage('')

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
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
        {/* Header con logos */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-16" />
            <img src={logoGov} alt="GOV.CO" className="h-12" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Plataforma E-Learning</h1>
          <p className="text-gray-600">Gobernación de Nariño</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link to="/login" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-800">Nueva Contraseña</CardTitle>
            </div>
            <CardDescription>
              Ingresa tu nueva contraseña para completar la recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!successMessage ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mensaje de éxito */}
                {successMessage && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      {successMessage}
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

                {/* Token */}
                <div className="space-y-2">
                  <Label htmlFor="token">Token de Recuperación</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="token"
                      name="token"
                      type="text"
                      value={formData.token}
                      onChange={handleInputChange}
                      className={errors.token ? 'border-red-500 pl-10' : 'pl-10'}
                      placeholder="Ingresa el token recibido"
                    />
                  </div>
                  {errors.token && (
                    <p className="text-sm text-red-600">{errors.token}</p>
                  )}
                </div>

                {/* Nueva Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      name="new_password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className={errors.new_password ? 'border-red-500 pr-10' : 'pr-10'}
                      placeholder="Mínimo 8 caracteres, letras y números"
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
                  {errors.new_password && (
                    <p className="text-sm text-red-600">{errors.new_password}</p>
                  )}
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                      placeholder="Repite tu nueva contraseña"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-red-600">{errors.confirm_password}</p>
                  )}
                </div>

                {/* Botón de actualización */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>

                {/* Link de regreso */}
                <div className="text-center">
                  <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
                    ← Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                {/* Mensaje de éxito */}
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Tu contraseña ha sido actualizada exitosamente. 
                    Serás redirigido al inicio de sesión automáticamente.
                  </p>
                  
                  <Link to="/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Ir al Inicio de Sesión
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordPage

