import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import logoGov from '../assets/logo-gov.png'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [resetToken, setResetToken] = useState('')

  const validateEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return pattern.test(email)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!validateEmail(email)) {
      newErrors.email = 'El formato del correo electrónico no es válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        // En desarrollo, mostramos el token. En producción, esto se enviaría por email
        if (data.token) {
          setResetToken(data.token)
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
              <CardTitle className="text-2xl font-bold text-gray-800">Recuperar Contraseña</CardTitle>
            </div>
            <CardDescription>
              Ingresa tu correo electrónico para recibir instrucciones de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!successMessage ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: '' }))
                        }
                      }}
                      className={errors.email ? 'border-red-500 pl-10' : 'pl-10'}
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Botón de envío */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                </Button>

                {/* Link de regreso */}
                <div className="text-center">
                  <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
                    ← Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Mensaje de éxito */}
                <Alert className="border-green-200 bg-green-50">
                  <Mail className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>

                {/* Token de desarrollo */}
                {resetToken && (
                  <div className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-800">
                        <strong>Token de recuperación (solo para desarrollo):</strong>
                        <br />
                        <code className="bg-blue-100 px-2 py-1 rounded text-sm">{resetToken}</code>
                      </AlertDescription>
                    </Alert>
                    
                    <Link to={`/reset-password?token=${resetToken}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Usar Token para Restablecer Contraseña
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Instrucciones */}
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Si el correo electrónico existe en nuestro sistema, recibirás un enlace 
                    para restablecer tu contraseña en los próximos minutos.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">¿No recibiste el correo?</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSuccessMessage('')
                        setResetToken('')
                        setEmail('')
                      }}
                      className="w-full"
                    >
                      Intentar de Nuevo
                    </Button>
                  </div>

                  <Link to="/login" className="block text-sm text-green-600 hover:text-green-700 font-medium">
                    ← Volver al inicio de sesión
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

export default ForgotPasswordPage

