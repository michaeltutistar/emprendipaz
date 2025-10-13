import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const RegisterPageMultiStep = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    convocatoria: '1'
  })

  const steps = [
    { number: 1, title: 'Datos Generales', description: 'Información personal' },
    { number: 2, title: 'Convocatoria', description: 'Selección de convocatoria' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ingresa tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  placeholder="Ingresa tu apellido"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="convocatoria">Convocatoria *</Label>
              <Select value={formData.convocatoria} onValueChange={(value) => handleInputChange('convocatoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la convocatoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Convocatoria 1</SelectItem>
                  <SelectItem value="2">Convocatoria 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      default:
        return <div>Paso no encontrado</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Paso {currentStep}: {steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              <Button
                onClick={nextStep}
                disabled={currentStep === steps.length}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPageMultiStep
