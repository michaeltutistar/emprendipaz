import React, { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

const Notifications = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotificaciones()
  }, [])

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotificaciones(data.notificaciones || [])
      } else {
        setError('Error al cargar notificaciones')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeida = async (notificacionId) => {
    try {
      const response = await fetch(`/api/notificaciones/${notificacionId}/marcar-leida`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // Actualizar estado local
        setNotificaciones(prev => 
          prev.map(notif => 
            notif.id === notificacionId 
              ? { ...notif, leida: true }
              : notif
          )
        )
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al marcar notificación')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      const response = await fetch('/api/notificaciones/marcar-todas-leidas', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        // Actualizar estado local
        setNotificaciones(prev => 
          prev.map(notif => ({ ...notif, leida: true }))
        )
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al marcar notificaciones')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFaseIcon = (fase) => {
    const iconos = {
      'inscripcion': '📝',
      'formacion': '🎓',
      'entrega_activos': '🎁'
    }
    return iconos[fase] || '📋'
  }

  const getFaseColor = (fase) => {
    const colores = {
      'inscripcion': 'bg-blue-100 text-blue-800',
      'formacion': 'bg-green-100 text-green-800',
      'entrega_activos': 'bg-purple-100 text-purple-800'
    }
    return colores[fase] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando notificaciones...</span>
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

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida)
  const notificacionesLeidas = notificaciones.filter(n => n.leida)

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones
            </CardTitle>
            {notificacionesNoLeidas.length > 0 && (
              <Button 
                onClick={marcarTodasComoLeidas}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Bell className="h-4 w-4 mr-1" />
              <span>Total: {notificaciones.length}</span>
            </div>
            {notificacionesNoLeidas.length > 0 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                <span className="text-red-600 font-medium">
                  {notificacionesNoLeidas.length} sin leer
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones no leídas */}
      {notificacionesNoLeidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notificaciones Nuevas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificacionesNoLeidas.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getFaseIcon(notif.fase_nueva)}</span>
                        <Badge className={getFaseColor(notif.fase_nueva)}>
                          {notif.fase_nueva.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <p className="text-gray-800 font-medium">{notif.mensaje}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatearFecha(notif.fecha)}
                      </p>
                    </div>
                    <Button
                      onClick={() => marcarComoLeida(notif.id)}
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Marcar como leída
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notificaciones leídas */}
      {notificacionesLeidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notificaciones Leídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificacionesLeidas.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-4 border border-gray-200 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getFaseIcon(notif.fase_nueva)}</span>
                        <Badge className={getFaseColor(notif.fase_nueva)}>
                          {notif.fase_nueva.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-gray-600">{notif.mensaje}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatearFecha(notif.fecha)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {notificaciones.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-500">
              Cuando cambies de fase, aparecerán notificaciones aquí
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Notifications
