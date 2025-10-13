import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

const MultiStepRegister = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState({})
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const steps = [
    { number: 1, title: 'Datos Generales', description: 'Información personal y del emprendimiento' },
    { number: 2, title: 'Documentos Obligatorios', description: 'TDR, Uso de imagen, Plan de negocio, Vecindad' },
    { number: 3, title: 'Documentos por Tipo', description: 'Según persona natural o jurídica' },
    { number: 4, title: 'Documentos Diferenciales', description: 'RUV, SISBEN, Grupo étnico (opcionales)' },
    { number: 5, title: 'Documentos de Control', description: 'Antecedentes y certificados obligatorios' },
    { number: 6, title: 'Funcionamiento', description: 'Certificación de funcionamiento del emprendimiento' },
    { number: 7, title: 'Financiación', description: 'Financiación de otras fuentes estatales' },
    { number: 8, title: 'Declaraciones', description: 'Declaraciones y aceptación de términos' }
  ]

  const progressPercentage = (currentStep / steps.length) * 100

  const savePartialProgress = async (step, data) => {
    if (!userId) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/save-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          paso: step,
          ...data
        }),
        credentials: 'include'
      })
      
      const result = await response.json()
      if (response.ok) {
        setSuccess('Progreso guardado exitosamente')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Error al guardar progreso')
      }
    } catch (err) {
      setError('Error de conexión al guardar progreso')
    } finally {
      setLoading(false)
    }
  }

  const loadUserProgress = async (userId) => {
    try {
      const response = await fetch(`/api/get-partial/${userId}`, {
        credentials: 'include'
      })
      
      const result = await response.json()
      if (response.ok) {
        setUserData(result.user_data)
        setCurrentStep(result.paso_actual || 1)
        
        if (result.formulario_enviado) {
          setError('Este formulario ya ha sido enviado y no se puede modificar')
        }
      }
    } catch (err) {
      setError('Error al cargar progreso anterior')
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveAndNext = async (stepData) => {
    await savePartialProgress(currentStep, stepData)
    nextStep()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 1: Datos Generales</h3>
            <p className="text-sm text-gray-600">
              Información personal y del emprendimiento. Esta información se guardará automáticamente.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                📝 Aquí irían los campos de: nombre, apellido, cédula, teléfono, municipio, 
                nombre del emprendimiento, sector económico, tipo de persona, etc.
              </p>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 2: Documentos Obligatorios</h3>
            <p className="text-sm text-gray-600">
              Documentos que no son subsanables y son obligatorios para todos.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">
                📄 TDR, Autorización uso de imagen, Plan de negocio (Excel), Certificado de vecindad.
                Video (opcional por ahora).
              </p>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 3: Documentos según Tipo de Persona</h3>
            <p className="text-sm text-gray-600">
              Documentos que dependen de si es persona natural o jurídica.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-700">
                🔄 Natural: RUT + Cédula. Jurídica: RUT + Cédula representante + Certificado existencia.
              </p>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 4: Documentos Diferenciales</h3>
            <p className="text-sm text-gray-600">
              Documentos opcionales que son subsanables (no bloquean el envío).
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                ⚠️ RUV, SISBEN, Grupo étnico, ARN, Discapacidad. 
                Estado: "pendiente/subsanable" si no se cargan.
              </p>
            </div>
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 5: Documentos de Control</h3>
            <p className="text-sm text-gray-600">
              Certificados obligatorios que determinan la elegibilidad.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">
                🛡️ Antecedentes fiscales, disciplinarios, judiciales, REDAM, inhabilidades sexuales, 
                declaración capacidad legal. Si hay antecedentes → rechazo automático.
              </p>
            </div>
          </div>
        )
      
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 6: Funcionamiento del Emprendimiento</h3>
            <p className="text-sm text-gray-600">
              Certificación de funcionamiento según si está formalizado o no.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                🏢 Formalizado: Matrícula mercantil + facturas 6 meses. 
                Informal: Publicaciones redes + registro ventas 6 meses.
              </p>
            </div>
          </div>
        )
      
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 7: Financiación de Otras Fuentes</h3>
            <p className="text-sm text-gray-600">
              Declarar si ha recibido financiación estatal previa.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-700">
                💰 ¿Financiado por el Estado? Si sí → marcar fuentes: Regalías, Cámara de Comercio, 
                Incubadoras, Otro.
              </p>
            </div>
          </div>
        )
      
      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 8: Declaraciones y Aceptaciones</h3>
            <p className="text-sm text-gray-600">
              Declaraciones obligatorias para cumplimiento legal.
            </p>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">
                📋 Declaro información veraz + No beneficiario previo + Acepto términos. 
                Las 3 son obligatorias con trazabilidad legal.
              </p>
            </div>
          </div>
        )
      
      default:
        return <div>Paso no encontrado</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Formulario de Inscripción - Multistep</span>
            <span className="text-sm font-normal text-gray-500">
              Paso {currentStep} de {steps.length}
            </span>
          </CardTitle>
          <CardDescription>
            Formulario dividido en pasos para mejor usabilidad. Su progreso se guarda automáticamente.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Lista de pasos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`p-2 rounded text-center ${
                  step.number === currentStep
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : step.number < currentStep
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <div className="font-semibold">{step.number}. {step.title}</div>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Contenido del paso actual */}
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
            >
              ← Anterior
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => savePartialProgress(currentStep, {})}
                disabled={loading}
              >
                {loading ? 'Guardando...' : '💾 Guardar'}
              </Button>

              <Button
                onClick={nextStep}
                disabled={currentStep === steps.length || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {currentStep === steps.length ? '✅ Finalizar' : 'Siguiente →'}
              </Button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>💡 Su progreso se guarda automáticamente. Puede cerrar y volver después.</p>
            <p>🔒 Una vez enviado el formulario completo, no podrá modificarlo.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MultiStepRegister
