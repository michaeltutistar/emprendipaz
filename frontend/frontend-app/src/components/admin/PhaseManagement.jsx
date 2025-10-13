import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Users, CheckCircle, Clock, AlertCircle, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

const PhaseManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats/phases', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const updateUserPhase = async (userId, newPhase) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/phase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ nueva_fase: newPhase })
      })

      if (response.ok) {
        await fetchUsers() // Recargar datos
        await fetchStats() // Recargar estadísticas
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al actualizar fase')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const exportPhaseReport = async () => {
    try {
      const response = await fetch('/api/admin/export/phases', {
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_fases_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      alert('Error al exportar reporte')
    }
  }

  const getPhaseInfo = (phase) => {
    const phases = {
      inscripcion: { title: 'Inscripción', color: 'bg-blue-500', icon: '📝' },
      formacion: { title: 'Formación', color: 'bg-green-500', icon: '🎓' },
      entrega_activos: { title: 'Entrega Activos', color: 'bg-purple-500', icon: '🎁' }
    }
    return phases[phase] || phases.inscripcion
  }

  const getPhaseStatus = (user) => {
    if (user.fase_completada) {
      return { status: 'completed', text: 'Completada', color: 'text-green-600' }
    } else {
      return { status: 'in_progress', text: 'En progreso', color: 'text-yellow-600' }
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.emprendimiento_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPhase = phaseFilter === 'all' || user.fase_actual === phaseFilter
    
    return matchesSearch && matchesPhase
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Cargando usuarios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{stats.total_users || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Inscripción</p>
                <p className="text-2xl font-bold">{stats.inscripcion || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Formación</p>
                <p className="text-2xl font-bold">{stats.formacion || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ArrowRight className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Entrega Activos</p>
                <p className="text-2xl font-bold">{stats.entrega_activos || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Fases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, email o emprendimiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fases</SelectItem>
                <SelectItem value="inscripcion">Inscripción</SelectItem>
                <SelectItem value="formacion">Formación</SelectItem>
                <SelectItem value="entrega_activos">Entrega Activos</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportPhaseReport} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Emprendimiento</TableHead>
                  <TableHead>Fase Actual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Entrada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const phaseInfo = getPhaseInfo(user.fase_actual)
                  const statusInfo = getPhaseStatus(user)
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.nombre} {user.apellido}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.emprendimiento_nombre || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{user.municipio}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-2">{phaseInfo.icon}</span>
                          <span className="text-sm">{phaseInfo.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.status === 'completed' ? 'default' : 'secondary'}>
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.fecha_entrada_fase ? 
                            new Date(user.fecha_entrada_fase).toLocaleDateString('es-ES') : 
                            'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select onValueChange={(value) => updateUserPhase(user.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Cambiar fase" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inscripcion">Inscripción</SelectItem>
                              <SelectItem value="formacion">Formación</SelectItem>
                              <SelectItem value="entrega_activos">Entrega Activos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron usuarios con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PhaseManagement
