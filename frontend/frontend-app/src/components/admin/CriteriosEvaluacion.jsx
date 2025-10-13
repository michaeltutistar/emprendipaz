import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';

const CriteriosEvaluacion = () => {
  const [criterios, setCriterios] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCriterio, setEditingCriterio] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    peso: '',
    max_puntaje: '',
    orden: '',
    observaciones: ''
  });

  // Cargar criterios
  const cargarCriterios = async () => {
    try {
      const response = await fetch('/api/admin/criterios', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCriterios(data.criterios);
        setEstadisticas(data.estadisticas);
      } else {
        toast.error('Error al cargar criterios');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCriterios();
  }, []);

  // Crear/Actualizar criterio
  const guardarCriterio = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCriterio 
        ? `/api/admin/criterios/${editingCriterio.id}`
        : '/api/admin/criterios';
      
      const method = editingCriterio ? 'PUT' : 'POST';
      
      // Preparar datos para envío
      const datosEnvio = {
        codigo: formData.codigo,
        descripcion: formData.descripcion,
        peso: parseFloat(formData.peso) || 0,
        max_puntaje: parseInt(formData.max_puntaje) || 0,
        orden: parseInt(formData.orden) || 0,
        observaciones: formData.observaciones
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(datosEnvio)
      });
      
      if (response.ok) {
        toast.success(editingCriterio ? 'Criterio actualizado' : 'Criterio creado');
        setShowForm(false);
        setEditingCriterio(null);
        setFormData({
          codigo: '',
          descripcion: '',
          peso: '',
          max_puntaje: '',
          orden: '',
          observaciones: ''
        });
        cargarCriterios();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar criterio');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  // Eliminar criterio
  const eliminarCriterio = async (id) => {
    try {
      const response = await fetch(`/api/admin/criterios/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Criterio eliminado');
        cargarCriterios();
      } else {
        toast.error('Error al eliminar criterio');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  // Importar desde Excel
  const importarExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/admin/criterios/importar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        cargarCriterios();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al importar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  // Validar pesos
  const validarPesos = async () => {
    try {
      const response = await fetch('/api/admin/criterios/validar-pesos', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.es_valido) {
          toast.success('Pesos válidos');
        } else {
          toast.error(data.mensaje);
        }
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  // Editar criterio
  const editarCriterio = (criterio) => {
    setEditingCriterio(criterio);
    setFormData({
      codigo: criterio.codigo,
      descripcion: criterio.descripcion,
      peso: criterio.peso.toString(),
      max_puntaje: criterio.max_puntaje.toString(),
      orden: criterio.orden.toString(),
      observaciones: criterio.observaciones || ''
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando criterios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Criterios de Evaluación</h2>
          <p className="text-gray-600">Gestiona los criterios de evaluación del proyecto</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={validarPesos} variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Validar Pesos
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Criterio
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Criterios</p>
                <p className="text-2xl font-bold">{estadisticas.total_criterios || 0}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Peso</p>
                <p className="text-2xl font-bold">{estadisticas.total_peso || 0}%</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Progress value={estadisticas.total_peso || 0} className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <Badge variant={estadisticas.peso_valido ? "default" : "destructive"}>
                  {estadisticas.peso_valido ? "Válido" : "Inválido"}
                </Badge>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                {estadisticas.peso_valido ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCriterio ? 'Editar Criterio' : 'Nuevo Criterio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={guardarCriterio} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    placeholder="Ej: CRIT001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orden">Orden *</Label>
                  <Input
                    id="orden"
                    type="number"
                    value={formData.orden}
                    onChange={(e) => setFormData({...formData, orden: e.target.value})}
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción detallada del criterio"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="peso">Peso (%) *</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={(e) => setFormData({...formData, peso: e.target.value})}
                    placeholder="25.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_puntaje">Puntaje Máximo *</Label>
                  <Input
                    id="max_puntaje"
                    type="number"
                    value={formData.max_puntaje}
                    onChange={(e) => setFormData({...formData, max_puntaje: e.target.value})}
                    placeholder="100"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Observaciones adicionales"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingCriterio(null);
                  setFormData({
                    codigo: '',
                    descripcion: '',
                    peso: '',
                    max_puntaje: '',
                    orden: '',
                    observaciones: ''
                  });
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCriterio ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabla de criterios */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Criterios</CardTitle>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={importarExcel}
                className="hidden"
                id="importar-excel"
              />
              <Button variant="outline" onClick={() => document.getElementById('importar-excel').click()}>
                <Upload className="w-4 h-4 mr-2" />
                Importar Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Puntaje Máx</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criterios.map((criterio) => (
                <TableRow key={criterio.id}>
                  <TableCell>{criterio.orden}</TableCell>
                  <TableCell className="font-mono">{criterio.codigo}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm font-medium">{criterio.descripcion}</p>
                      {criterio.observaciones && (
                        <p className="text-xs text-gray-500 mt-1">{criterio.observaciones}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{criterio.peso}%</TableCell>
                  <TableCell>{criterio.max_puntaje}</TableCell>
                  <TableCell>
                    <Badge variant={criterio.activo ? "default" : "secondary"}>
                      {criterio.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editarCriterio(criterio)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar criterio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el criterio "{criterio.codigo}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => eliminarCriterio(criterio.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CriteriosEvaluacion;
