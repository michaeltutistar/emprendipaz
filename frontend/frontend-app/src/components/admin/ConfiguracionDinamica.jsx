import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save, X, Settings } from 'lucide-react';
import API_BASE_URL from '@/config/api'
const ConfiguracionDinamica = () => {
  const [campos, setCampos] = useState([]);
  const [criterios, setCriterios] = useState([]);
  const [cupos, setCupos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [showForm, setShowForm] = useState({ type: null, visible: false });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Formulario para nuevo campo
  const [newField, setNewField] = useState({
    nombre_campo: '',
    etiqueta: '',
    tipo_campo: 'text',
    es_obligatorio: false,
    es_subsanable: true,
    orden: 0,
    seccion: 'general',
    opciones: [],
    validaciones: {},
    descripcion: ''
  });

  // Formulario para nuevo criterio
  const [newCriterio, setNewCriterio] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: 'vulnerabilidad',
    puntaje_maximo: 0,
    campo_formulario: '',
    criterios_puntuacion: {},
    orden: 0
  });

  // Formulario para nuevo cupo
  const [newCupo, setNewCupo] = useState({
    municipio: '',
    subregion: '',
    cupo_total: 0
  });

  // Formulario para nuevo documento
  const [newDocumento, setNewDocumento] = useState({
    nombre_campo: '',
    nombre_documento: '',
    descripcion: '',
    es_obligatorio: false,
    es_subsanable: true,
    formatos_permitidos: ['pdf'],
    tamano_maximo_mb: 10,
    orden: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [camposRes, criteriosRes, cuposRes, documentosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/config/formulario-campos`, { headers }),
        fetch(`${API_BASE_URL}/config/criterios-evaluacion`, { headers }),
        fetch(`${API_BASE_URL}/config/cupos-municipio`, { headers }),
        fetch(`${API_BASE_URL}/config/documentos-config`, { headers })
      ]);

      if (camposRes.ok) setCampos(await camposRes.json());
      if (criteriosRes.ok) setCriterios(await criteriosRes.json());
      if (cuposRes.ok) setCupos(await cuposRes.json());
      if (documentosRes.ok) setDocumentos(await documentosRes.json());

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSaveField = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/config/formulario-campos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newField)
      });

      if (response.ok) {
        showAlert('Campo creado exitosamente');
        loadData();
        setShowForm({ type: null, visible: false });
        setNewField({
          nombre_campo: '',
          etiqueta: '',
          tipo_campo: 'text',
          es_obligatorio: false,
          es_subsanable: true,
          orden: 0,
          seccion: 'general',
          opciones: [],
          validaciones: {},
          descripcion: ''
        });
      } else {
        const error = await response.json();
        showAlert(error.error || 'Error al crear campo', 'error');
      }
    } catch (error) {
      showAlert('Error de conexión', 'error');
    }
  };

  const handleSaveCriterio = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/config/criterios-evaluacion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCriterio)
      });

      if (response.ok) {
        showAlert('Criterio creado exitosamente');
        loadData();
        setShowForm({ type: null, visible: false });
        setNewCriterio({
          codigo: '',
          nombre: '',
          descripcion: '',
          categoria: 'vulnerabilidad',
          puntaje_maximo: 0,
          campo_formulario: '',
          criterios_puntuacion: {},
          orden: 0
        });
      } else {
        const error = await response.json();
        showAlert(error.error || 'Error al crear criterio', 'error');
      }
    } catch (error) {
      showAlert('Error de conexión', 'error');
    }
  };

  const handleSaveCupo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/config/cupos-municipio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCupo)
      });

      if (response.ok) {
        showAlert('Cupo creado exitosamente');
        loadData();
        setShowForm({ type: null, visible: false });
        setNewCupo({
          municipio: '',
          subregion: '',
          cupo_total: 0
        });
      } else {
        const error = await response.json();
        showAlert(error.error || 'Error al crear cupo', 'error');
      }
    } catch (error) {
      showAlert('Error de conexión', 'error');
    }
  };

  const handleSaveDocumento = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/config/documentos-config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDocumento)
      });

      if (response.ok) {
        showAlert('Documento creado exitosamente');
        loadData();
        setShowForm({ type: null, visible: false });
        setNewDocumento({
          nombre_campo: '',
          nombre_documento: '',
          descripcion: '',
          es_obligatorio: false,
          es_subsanable: true,
          formatos_permitidos: ['pdf'],
          tamano_maximo_mb: 10,
          orden: 0
        });
      } else {
        const error = await response.json();
        showAlert(error.error || 'Error al crear documento', 'error');
      }
    } catch (error) {
      showAlert('Error de conexión', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Configuración Dinámica del Sistema</h1>
      </div>

      {/* Alert */}
      {alert.show && (
        <Alert className={alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="campos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campos">Campos del Formulario</TabsTrigger>
          <TabsTrigger value="criterios">Criterios de Evaluación</TabsTrigger>
          <TabsTrigger value="cupos">Cupos por Municipio</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        {/* CAMPOS DEL FORMULARIO */}
        <TabsContent value="campos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Campos del Formulario de Registro</CardTitle>
                  <CardDescription>
                    Configura los campos que aparecerán en el formulario de registro
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowForm({ type: 'campo', visible: true })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Campo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campos.map((campo) => (
                  <div key={campo.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{campo.etiqueta}</h3>
                        <p className="text-sm text-gray-600">
                          Campo: {campo.nombre_campo} | Tipo: {campo.tipo_campo} | 
                          Sección: {campo.seccion}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {campo.es_obligatorio && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              Obligatorio
                            </span>
                          )}
                          {campo.es_subsanable && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Subsanable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formulario para nuevo campo */}
          {showForm.type === 'campo' && showForm.visible && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Nuevo Campo del Formulario</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowForm({ type: null, visible: false })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre_campo">Nombre del Campo</Label>
                    <Input
                      id="nombre_campo"
                      value={newField.nombre_campo}
                      onChange={(e) => setNewField({...newField, nombre_campo: e.target.value})}
                      placeholder="ej: mujer_cabeza_familia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="etiqueta">Etiqueta Visible</Label>
                    <Input
                      id="etiqueta"
                      value={newField.etiqueta}
                      onChange={(e) => setNewField({...newField, etiqueta: e.target.value})}
                      placeholder="ej: ¿Es mujer cabeza de familia?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo_campo">Tipo de Campo</Label>
                    <Select 
                      value={newField.tipo_campo} 
                      onValueChange={(value) => setNewField({...newField, tipo_campo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="file">Archivo</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="textarea">Área de Texto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="seccion">Sección</Label>
                    <Select 
                      value={newField.seccion} 
                      onValueChange={(value) => setNewField({...newField, seccion: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Datos Personales</SelectItem>
                        <SelectItem value="emprendimiento">Emprendimiento</SelectItem>
                        <SelectItem value="vulnerabilidad">Vulnerabilidad</SelectItem>
                        <SelectItem value="documentos">Documentos</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="orden">Orden</Label>
                    <Input
                      id="orden"
                      type="number"
                      value={newField.orden}
                      onChange={(e) => setNewField({...newField, orden: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newField.es_obligatorio}
                      onCheckedChange={(checked) => setNewField({...newField, es_obligatorio: checked})}
                    />
                    <Label>Campo Obligatorio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newField.es_subsanable}
                      onCheckedChange={(checked) => setNewField({...newField, es_subsanable: checked})}
                    />
                    <Label>Es Subsanable</Label>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newField.descripcion}
                      onChange={(e) => setNewField({...newField, descripcion: e.target.value})}
                      placeholder="Descripción del campo..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSaveField} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Campo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowForm({ type: null, visible: false })}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CRITERIOS DE EVALUACIÓN */}
        <TabsContent value="criterios">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Criterios de Evaluación</CardTitle>
                  <CardDescription>
                    Configura los criterios y puntuaciones para evaluar postulantes
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowForm({ type: 'criterio', visible: true })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Criterio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criterios.map((criterio) => (
                  <div key={criterio.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{criterio.nombre}</h3>
                        <p className="text-sm text-gray-600">
                          Código: {criterio.codigo} | Categoría: {criterio.categoria} | 
                          Puntaje Máximo: {criterio.puntaje_maximo}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{criterio.descripcion}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUPOS POR MUNICIPIO */}
        <TabsContent value="cupos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cupos por Municipio</CardTitle>
                  <CardDescription>
                    Configura la distribución de cupos por municipio y subregión
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowForm({ type: 'cupo', visible: true })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cupo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cupos.map((cupo) => (
                  <div key={cupo.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{cupo.municipio}</h3>
                        <p className="text-sm text-gray-600">
                          Subregión: {cupo.subregion} | Total: {cupo.cupo_total} | 
                          Utilizados: {cupo.cupo_utilizado} | Disponibles: {cupo.cupo_disponible}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${(cupo.cupo_utilizado / cupo.cupo_total) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTOS */}
        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Configuración de Documentos</CardTitle>
                  <CardDescription>
                    Configura los documentos requeridos y sus especificaciones
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowForm({ type: 'documento', visible: true })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentos.map((documento) => (
                  <div key={documento.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{documento.nombre_documento}</h3>
                        <p className="text-sm text-gray-600">
                          Campo: {documento.nombre_campo} | 
                          Tamaño máx: {documento.tamano_maximo_mb}MB
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{documento.descripcion}</p>
                        <div className="flex gap-2 mt-2">
                          {documento.es_obligatorio && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              Obligatorio
                            </span>
                          )}
                          {documento.es_subsanable && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Subsanable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracionDinamica;
