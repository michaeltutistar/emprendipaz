import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, ArrowRight, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'

const PhaseProgress = () => {
  const [phaseData, setPhaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPhaseStatus()
  }, [])

  const fetchPhaseStatus = async () => {
    try {
      const response = await fetch('/api/user/fases/estado', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPhaseData(data)
      } else {
        setError('Error al cargar el estado de fases')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const advancePhase = async () => {
    try {
      const currentPhase = phaseData.fase_actual
      const nextPhase = getNextPhase(currentPhase)
      
      const response = await fetch('/api/user/fases/avanzar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ nueva_fase: nextPhase })
      })

      if (response.ok) {
        await fetchPhaseStatus() // Recargar datos
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al avanzar fase')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const completePhase = async () => {
    try {
      const response = await fetch('/api/user/fases/completar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        await fetchPhaseStatus() // Recargar datos
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al completar fase')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const getNextPhase = (currentPhase) => {
    const phases = ['inscripcion', 'formacion', 'entrega_activos']
    const currentIndex = phases.indexOf(currentPhase)
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null
  }

  const getPhaseInfo = (phase) => {
    const phases = {
      inscripcion: {
        title: 'Fase 1: Inscripción y Selección',
        description: 'Completar formulario de inscripción y documentación',
        color: 'bg-blue-500',
        icon: '📝'
      },
      formacion: {
        title: 'Fase 2: Formación',
        description: 'Participar en módulos de formación empresarial',
        color: 'bg-green-500',
        icon: '🎓'
      },
      entrega_activos: {
        title: 'Fase 3: Entrega de Activos',
        description: 'Recibir activos productivos y acompañamiento',
        color: 'bg-purple-500',
        icon: '🎁'
      }
    }
    return phases[phase] || phases.inscripcion
  }

  const getPhaseProgress = () => {
    if (!phaseData) return 0
    
    const phases = ['inscripcion', 'formacion', 'entrega_activos']
    const currentIndex = phases.indexOf(phaseData.fase_actual)
    const baseProgress = (currentIndex / phases.length) * 100
    
    if (phaseData.fase_completada) {
      return Math.min(baseProgress + (100 / phases.length), 100)
    }
    
    return baseProgress
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando progreso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!phaseData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No se pudo cargar la información de fases
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentPhaseInfo = getPhaseInfo(phaseData.fase_actual)
  const nextPhase = getNextPhase(phaseData.fase_actual)
  const progress = getPhaseProgress()

  return (
    <div className="space-y-6">
      {/* Progreso General */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Progreso del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso General</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Fase actual: <strong>{currentPhaseInfo.title}</strong>
              </span>
              <Badge variant={phaseData.fase_completada ? "default" : "secondary"}>
                {phaseData.fase_completada ? "Completada" : "En progreso"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fase Actual */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="text-2xl mr-2">{currentPhaseInfo.icon}</span>
            Fase Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${currentPhaseInfo.color} text-white`}>
              <h3 className="font-semibold text-lg">{currentPhaseInfo.title}</h3>
              <p className="text-sm opacity-90">{currentPhaseInfo.description}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  Iniciada: {new Date(phaseData.fecha_entrada_fase).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex items-center">
                {phaseData.fase_completada ? (
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 mr-1 text-yellow-500" />
                )}
                <span>
                  {phaseData.fase_completada ? "Completada" : "En progreso"}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              {!phaseData.fase_completada && (
                <Button 
                  onClick={completePhase}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Fase
                </Button>
              )}
              
              {nextPhase && phaseData.fase_completada && (
                <Button 
                  onClick={advancePhase}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Avanzar a Siguiente Fase
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximas Fases */}
      {nextPhase && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Próxima Fase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-gray-100">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getPhaseInfo(nextPhase).icon}</span>
                <div>
                  <h3 className="font-semibold">{getPhaseInfo(nextPhase).title}</h3>
                  <p className="text-sm text-gray-600">{getPhaseInfo(nextPhase).description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PhaseProgress
