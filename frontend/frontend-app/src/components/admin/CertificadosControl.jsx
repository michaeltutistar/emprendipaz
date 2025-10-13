import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const CertificadosControl = () => {
  const [usuarios, setUsuarios] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Cargar usuarios con control completo
      const responseUsers = await fetch('/api/admin/users?estado_control=completo', {
        credentials: 'include'
      })
      const dataUsers = await responseUsers.json()
      
      // Cargar estadísticas
      const responseStats = await fetch('/api/admin/certificados/estadisticas', {
        credentials: 'include'
      })
      const dataStats = await responseStats.json()
      
      if (responseUsers.ok && responseStats.ok) {
        setUsuarios(dataUsers.users || [])
        setEstadisticas(dataStats)
      } else {
        setError('Error al cargar datos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const actualizarResultado = async (userId, resultado) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/certificados`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resultado_certificados: resultado }),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(data.message + (data.rechazo_automatico_aplicado ? ' - RECHAZO AUTOMÁTICO APLICADO' : ''))
        cargarDatos() // Recargar datos
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(data.error || 'Error al actualizar')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const getEstadoBadge = (resultado, estadoCuenta) => {
    if (resultado === 'inhabilidad_detectada' && estadoCuenta === 'rechazada') {
      return <Badge variant="destructive">RECHAZADO AUTOMÁTICAMENTE</Badge>
    } else if (resultado === 'limpio') {
      return <Badge variant="success" className="bg-green-100 text-green-800">Limpio</Badge>
    } else if (resultado === 'inhabilidad_detectada') {
      return <Badge variant="destructive">Inhabilidad Detectada</Badge>
    } else {
      return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  const usuariosFiltrados = usuarios.filter(user => {
    if (filtro === 'todos') return true
    if (filtro === 'pendiente') return user.resultado_certificados === 'pendiente'
    if (filtro === 'limpio') return user.resultado_certificados === 'limpio'
    if (filtro === 'rechazado') return user.resultado_certificados === 'inhabilidad_detectada'
    return true
  })

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🛡️ Gestión de Certificados de Control</h2>
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

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Control Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.estadisticas_generales.control_completo}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Certificados Limpios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {estadisticas.resultados_certificados.limpio}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rechazos Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {estadisticas.rechazos_automaticos.total}
              </div>
              <div className="text-xs text-gray-500">
                {estadisticas.rechazos_automaticos.porcentaje}% del total
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {estadisticas.resultados_certificados.pendiente}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filtrar por:</label>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="limpio">Limpios</SelectItem>
            <SelectItem value="rechazado">Con Inhabilidades</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios con Certificados de Control Completos</CardTitle>
          <CardDescription>
            Gestiona los resultados de los certificados de control. 
            <strong className="text-red-600"> Al marcar "Inhabilidad Detectada", el sistema automáticamente rechazará la inscripción.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usuariosFiltrados.map(user => (
              <div key={user.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {user.nombre} {user.apellido}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">
                      {user.municipio} - {user.tipo_persona} - Conv. {user.convocatoria}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estado cuenta: <span className={`font-medium ${
                        user.estado_cuenta === 'rechazada' ? 'text-red-600' :
                        user.estado_cuenta === 'activa' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {user.estado_cuenta}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getEstadoBadge(user.resultado_certificados, user.estado_cuenta)}
                    
                    <Select 
                      value={user.resultado_certificados || 'pendiente'} 
                      onValueChange={(value) => actualizarResultado(user.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente de revisión</SelectItem>
                        <SelectItem value="limpio">Certificados limpios</SelectItem>
                        <SelectItem value="inhabilidad_detectada" className="text-red-600 font-medium">
                          ⚠️ Inhabilidad detectada (RECHAZA AUTOMÁTICAMENTE)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            
            {usuariosFiltrados.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No hay usuarios que coincidan con el filtro seleccionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CertificadosControl
