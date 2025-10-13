import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Shuffle, Download, Users, Trophy, Calendar, FileText } from 'lucide-react';

const SorteoPanel = () => {
  const [empates, setEmpates] = useState({});
  const [sorteos, setSorteos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ejecutandoSorteo, setEjecutandoSorteo] = useState(false);
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [empatesRes, sorteosRes] = await Promise.all([
        fetch('/api/admin/evaluaciones/empates', { credentials: 'include' }),
        fetch('/api/admin/evaluaciones/sorteos', { credentials: 'include' })
      ]);

      if (empatesRes.ok && sorteosRes.ok) {
        const empatesData = await empatesRes.json();
        const sorteosData = await sorteosRes.json();
        
        setEmpates(empatesData.empates);
        setSorteos(sorteosData.sorteos);
      } else {
        toast.error('Error al cargar datos');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const ejecutarSorteo = async (participantes) => {
    if (!descripcion.trim()) {
      toast.error('Debe ingresar una descripción del sorteo');
      return;
    }

    try {
      setEjecutandoSorteo(true);
      const response = await fetch('/api/admin/evaluaciones/sorteo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          participantes: participantes,
          descripcion: descripcion,
          observaciones: observaciones
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSorteoSeleccionado(data.sorteo);
        toast.success('Sorteo ejecutado exitosamente');
        cargarDatos(); // Recargar datos
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al ejecutar sorteo');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setEjecutandoSorteo(false);
    }
  };

  const descargarActa = async (sorteoId) => {
    try {
      const response = await fetch(`/api/admin/evaluaciones/sorteos/${sorteoId}/acta`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `acta_sorteo_${sorteoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Acta descargada exitosamente');
      } else {
        toast.error('Error al descargar acta');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando datos de sorteos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Desempate</h2>
          <p className="text-gray-600">Sorteos públicos para resolver empates en puntajes</p>
        </div>
      </div>

      {/* Estadísticas de Empates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Empates Detectados</p>
                <p className="text-2xl font-bold">{Object.keys(empates).length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sorteos Realizados</p>
                <p className="text-2xl font-bold">{sorteos.length}</p>
              </div>
              <Shuffle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Participantes</p>
                <p className="text-2xl font-bold">
                  {Object.values(empates).reduce((sum, participantes) => sum + participantes.length, 0)}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empates Detectados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Empates Detectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(empates).length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No hay empates detectados</p>
              <p className="text-sm text-gray-500">Todos los puntajes son únicos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(empates).map(([puntaje, participantes]) => (
                <div key={puntaje} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold">Empate en {puntaje} puntos</h3>
                      <p className="text-sm text-gray-600">{participantes.length} participantes</p>
                    </div>
                    <Button 
                      onClick={() => ejecutarSorteo(participantes)}
                      disabled={ejecutandoSorteo}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      {ejecutandoSorteo ? 'Ejecutando...' : 'Ejecutar Sorteo'}
                    </Button>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participante</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Municipio</TableHead>
                        <TableHead>Emprendimiento</TableHead>
                        <TableHead>Fecha Inscripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participantes.map((participante) => (
                        <TableRow key={participante.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{participante.nombre} {participante.apellido}</p>
                            </div>
                          </TableCell>
                          <TableCell>{participante.email}</TableCell>
                          <TableCell>{participante.municipio}</TableCell>
                          <TableCell>{participante.emprendimiento_nombre || 'Sin nombre'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(participante.fecha_inscripcion).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de Sorteo */}
      {Object.keys(empates).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              Configuración del Sorteo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="descripcion">Descripción del Sorteo *</Label>
                <Input
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Sorteo para desempate en 85 puntos"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones adicionales sobre el sorteo..."
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado del Sorteo */}
      {sorteoSeleccionado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Resultado del Sorteo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">¡Ganador del Sorteo!</h3>
              </div>
              <p className="text-green-700">
                <strong>{sorteoSeleccionado.ganador.nombre} {sorteoSeleccionado.ganador.apellido}</strong>
              </p>
              <p className="text-sm text-green-600">{sorteoSeleccionado.ganador.email}</p>
              <p className="text-sm text-gray-600 mt-2">
                Sorteo ejecutado el {new Date(sorteoSeleccionado.fecha_sorteo).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Sorteos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Historial de Sorteos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sorteos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No hay sorteos realizados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorteos.map((sorteo) => (
                <div key={sorteo.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{sorteo.descripcion}</h3>
                      <p className="text-sm text-gray-600">
                        {sorteo.participantes.length} participantes
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(sorteo.fecha_sorteo).toLocaleString()}
                      </p>
                      {sorteo.ganador && (
                        <p className="text-sm text-green-600 mt-1">
                          Ganador: {sorteo.ganador.nombre} {sorteo.ganador.apellido}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => descargarActa(sorteo.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Acta
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SorteoPanel;
