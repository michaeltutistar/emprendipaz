import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { CheckCircle, Clock, User, Target } from 'lucide-react';

const EvaluacionPanel = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [criterios, setCriterios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState({});
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [usuariosRes, criteriosRes] = await Promise.all([
        fetch('/api/admin/evaluaciones/usuarios', { credentials: 'include' }),
        fetch('/api/admin/evaluaciones/criterios', { credentials: 'include' })
      ]);

      if (usuariosRes.ok && criteriosRes.ok) {
        const usuariosData = await usuariosRes.json();
        const criteriosData = await criteriosRes.json();
        
        setUsuarios(usuariosData.usuarios);
        setCriterios(criteriosData.criterios);
      } else {
        toast.error('Error al cargar datos');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarUsuario = async (usuario) => {
    setUsuarioSeleccionado(usuario);
    setEvaluaciones(usuario.evaluaciones || {});
    setPuntajeTotal(usuario.puntaje_total || 0);
    
    // Recargar evaluaciones del usuario desde el servidor
    try {
      const response = await fetch(`/api/admin/evaluaciones/${usuario.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvaluaciones(data.evaluaciones.reduce((acc, evaluacion) => {
          acc[evaluacion.criterio_id] = evaluacion;
          return acc;
        }, {}));
        setPuntajeTotal(data.puntaje_total);
      }
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
    }
  };

  const guardarEvaluacion = async (criterioId, puntaje, observaciones) => {
    try {
      const response = await fetch('/api/admin/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          usuario_id: usuarioSeleccionado.id,
          criterio_id: criterioId,
          puntaje: parseInt(puntaje),
          observaciones: observaciones
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPuntajeTotal(data.puntaje_total);
        
        // Actualizar evaluaciones locales
        setEvaluaciones(prev => ({
          ...prev,
          [criterioId]: data.evaluacion
        }));
        
        toast.success('Evaluación guardada');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar evaluación');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Panel de Evaluación</h2>
          <p className="text-gray-600">Evalúa las postulaciones según los criterios establecidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Usuarios */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Usuarios para Evaluar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    onClick={() => seleccionarUsuario(usuario)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      usuarioSeleccionado?.id === usuario.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                        <p className="text-sm text-gray-500">{usuario.municipio}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={usuario.evaluacion_completa ? "default" : "secondary"}>
                          {usuario.evaluacion_completa ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {usuario.evaluacion_completa ? 'Completa' : 'Pendiente'}
                        </Badge>
                        <p className="text-sm font-medium mt-1">{usuario.puntaje_total} pts</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Evaluación */}
        <div className="lg:col-span-2">
          {usuarioSeleccionado ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Evaluación: {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{puntajeTotal} pts</p>
                    <p className="text-sm text-gray-500">Puntaje Total</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {criterios.map((criterio) => {
                    const evaluacion = evaluaciones[criterio.id];
                    const puntajeActual = evaluacion?.puntaje || 0;
                    const observacionesActual = evaluacion?.observaciones || '';

                    return (
                      <div key={criterio.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{criterio.codigo}: {criterio.descripcion}</h3>
                            <p className="text-sm text-gray-600">Peso: {criterio.peso}% | Máximo: {criterio.max_puntaje} pts</p>
                          </div>
                          <Badge variant="outline">
                            {criterio.peso}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`puntaje-${criterio.id}`}>Puntaje (0 - {criterio.max_puntaje})</Label>
                            <Input
                              id={`puntaje-${criterio.id}`}
                              type="number"
                              min="0"
                              max={criterio.max_puntaje}
                              value={puntajeActual}
                              onChange={(e) => {
                                const nuevoPuntaje = e.target.value;
                                guardarEvaluacion(criterio.id, nuevoPuntaje, observacionesActual);
                              }}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`observaciones-${criterio.id}`}>Observaciones</Label>
                            <Textarea
                              id={`observaciones-${criterio.id}`}
                              value={observacionesActual}
                              onChange={(e) => {
                                const nuevasObservaciones = e.target.value;
                                guardarEvaluacion(criterio.id, puntajeActual, nuevasObservaciones);
                              }}
                              placeholder="Observaciones sobre la evaluación..."
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Barra de progreso del criterio */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progreso del criterio</span>
                            <span>{puntajeActual}/{criterio.max_puntaje} pts</span>
                          </div>
                          <Progress 
                            value={(puntajeActual / criterio.max_puntaje) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">Selecciona un usuario para evaluar</p>
                  <p className="text-sm text-gray-500">Elige un usuario de la lista para comenzar la evaluación</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluacionPanel;
