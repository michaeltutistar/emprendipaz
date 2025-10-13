import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const RegisterPageMultiStepSimple = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-700">
            Formulario Multistep - Paso {currentStep} de 8
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">🎉 ¡Sistema Multistep Funcionando!</h3>
              <p className="text-blue-700 mt-2">
                Esta es una versión de prueba para verificar que el componente se renderiza correctamente.
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">Paso actual: <strong>{currentStep}</strong></p>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                
                <Button 
                  onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
                  disabled={currentStep === 8}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Siguiente
                </Button>
              </div>

              <Button 
                onClick={() => navigate('/login')}
                variant="ghost"
                className="text-gray-600"
              >
                Volver al Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPageMultiStepSimple
