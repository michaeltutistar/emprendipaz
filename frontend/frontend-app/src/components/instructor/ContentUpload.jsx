import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  Video, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Cloud,
  Calendar,
  BookOpen,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import InstructorHeader from './InstructorHeader';

const ContentUpload = () => {
  const [tipoContenido, setTipoContenido] = useState('video');
  const [archivo, setArchivo] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [metadatos, setMetadatos] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    curso_id: '',
    modulo_id: '',
    fecha_publicacion: '',
    acceso_publico: true,
    requiere_autenticacion: false
  });
  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatosInstructor();
  }, []);

  const cargarDatosInstructor = async () => {
    try {
      setCargando(true);
      
      // Cargar cursos del instructor
      const cursosResponse = await fetch('/api/instructor/cursos', {
        credentials: 'include'
      });
      
      if (cursosResponse.ok) {
        const cursosData = await cursosResponse.json();
        if (cursosData.success) {
          setCursos(cursosData.data);
        }
      }
      
      // Cargar módulos del instructor
      const modulosResponse = await fetch('/api/instructor/modulos', {
        credentials: 'include'
      });
      
      if (modulosResponse.ok) {
        const modulosData = await modulosResponse.json();
        if (modulosData.success) {
          setModulos(modulosData.data);
        }
      }
    } catch (error) {
      toast.error("Error al cargar datos del instructor");
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const tiposPermitidos = {
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    documento: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain']
  };

  const categorias = {
    video: ['Tutorial', 'Conferencia', 'Demostración', 'Entrevista', 'Presentación'],
    documento: ['Apuntes', 'Ejercicios', 'Evaluación', 'Recursos', 'Guía', 'Plantilla']
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const tiposValidos = tiposPermitidos[tipoContenido];
    if (!tiposValidos.includes(file.type)) {
      toast.error(`Tipo de archivo no válido. Tipos permitidos: ${tiposValidos.join(', ')}`);
      return;
    }

    // Validar tamaño (máximo 500MB para videos, 50MB para documentos)
    const maxSize = tipoContenido === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`El archivo es demasiado grande. Máximo: ${tipoContenido === 'video' ? '500MB' : '50MB'}`);
      return;
    }

    setArchivo(file);
    setMetadatos(prev => ({
      ...prev,
      titulo: file.name.replace(/\.[^/.]+$/, '') // Remover extensión
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  const removeFile = () => {
    setArchivo(null);
    setProgreso(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field, value) => {
    setMetadatos(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const obtenerModulosPorCurso = (cursoId) => {
    return modulos.filter(modulo => modulo.curso_id === parseInt(cursoId));
  };

  const formatearTamaño = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simularSubida = async () => {
    setSubiendo(true);
    setProgreso(0);

    // Simular progreso de subida
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgreso(i);
    }

    // Simular subida a S3
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubiendo(false);
    toast.success('Contenido subido exitosamente a Amazon S3');
    
    // Limpiar formulario
    setArchivo(null);
    setProgreso(0);
    setMetadatos({
      titulo: '',
      descripcion: '',
      categoria: '',
      curso_id: '',
      modulo_id: '',
      fecha_publicacion: '',
      acceso_publico: true,
      requiere_autenticacion: false
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!archivo) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    if (!metadatos.titulo.trim()) {
      toast.error('Por favor ingresa un título');
      return;
    }

    await simularSubida();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <InstructorHeader 
          title="Subir Contenido a Amazon S3"
          subtitle="Sube videos y documentos que se almacenarán de forma segura en la nube"
          showBackButton={true}
          backUrl="/instructor/dashboard"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selector de tipo de contenido */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Contenido</CardTitle>
                <CardDescription>
                  Selecciona el tipo de contenido que vas a subir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={tipoContenido === 'video' ? 'default' : 'outline'}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setTipoContenido('video')}
                  >
                    <Video className="h-6 w-6" />
                    <span>Video</span>
                  </Button>
                  <Button
                    variant={tipoContenido === 'documento' ? 'default' : 'outline'}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => setTipoContenido('documento')}
                  >
                    <FileText className="h-6 w-6" />
                    <span>Documento</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Área de subida */}
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Archivo</CardTitle>
                <CardDescription>
                  Arrastra y suelta tu archivo o haz clic para seleccionarlo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    archivo ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {!archivo ? (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Arrastra tu archivo aquí
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          o haz clic para seleccionar
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Seleccionar Archivo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        {tipoContenido === 'video' ? (
                          <Video className="h-8 w-8 text-blue-500" />
                        ) : (
                          <FileText className="h-8 w-8 text-green-500" />
                        )}
                        <span className="text-lg font-medium">{archivo.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatearTamaño(archivo.size)} • {archivo.type}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={tiposPermitidos[tipoContenido].join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Progreso de subida */}
            {subiendo && (
              <Card>
                <CardHeader>
                  <CardTitle>Subiendo a Amazon S3</CardTitle>
                  <CardDescription>
                    Tu archivo se está subiendo de forma segura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={progreso} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{progreso}%</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Cloud className="h-4 w-4" />
                      <span>Subiendo a Amazon S3...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadatos del contenido */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Contenido</CardTitle>
                <CardDescription>
                  Completa los detalles de tu contenido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={metadatos.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Ingresa el título del contenido"
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={metadatos.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Describe el contenido..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={metadatos.categoria}
                      onValueChange={(value) => handleInputChange('categoria', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias[tipoContenido].map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="curso">Curso (Opcional)</Label>
                    <Select
                      value={metadatos.curso_id}
                      onValueChange={(value) => {
                        handleInputChange('curso_id', value);
                        handleInputChange('modulo_id', ''); // Reset módulo
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {cursos.map((curso) => (
                          <SelectItem key={curso.id} value={curso.id.toString()}>
                            {curso.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {metadatos.curso_id && (
                  <div>
                    <Label htmlFor="modulo">Módulo (Opcional)</Label>
                    <Select
                      value={metadatos.modulo_id}
                      onValueChange={(value) => handleInputChange('modulo_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un módulo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {obtenerModulosPorCurso(metadatos.curso_id).map((modulo) => (
                          <SelectItem key={modulo.id} value={modulo.id.toString()}>
                            {modulo.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="fecha_publicacion">Fecha de Publicación (Opcional)</Label>
                  <Input
                    id="fecha_publicacion"
                    type="datetime-local"
                    value={metadatos.fecha_publicacion}
                    onChange={(e) => handleInputChange('fecha_publicacion', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="acceso_publico"
                      checked={metadatos.acceso_publico}
                      onChange={(e) => handleInputChange('acceso_publico', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="acceso_publico">Acceso público</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiere_autenticacion"
                      checked={metadatos.requiere_autenticacion}
                      onChange={(e) => handleInputChange('requiere_autenticacion', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="requiere_autenticacion">Requiere autenticación</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón de subida */}
            <Button
              onClick={handleSubmit}
              disabled={!archivo || subiendo}
              className="w-full h-12 text-lg"
            >
              {subiendo ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Subir a Amazon S3
                </>
              )}
            </Button>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información de S3 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5" />
                  <span>Amazon S3</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Almacenamiento seguro</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Alta disponibilidad</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>CDN global</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Encriptación automática</span>
                </div>
              </CardContent>
            </Card>

            {/* Tipos de archivo permitidos */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos Permitidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tipoContenido === 'video' ? (
                    <div>
                      <h4 className="font-medium mb-2">Videos:</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>• MP4, WebM, OGG</div>
                        <div>• AVI, MOV</div>
                        <div>• Máximo: 500MB</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium mb-2">Documentos:</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>• PDF, DOC, DOCX</div>
                        <div>• PPT, PPTX, TXT</div>
                        <div>• Máximo: 50MB</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de uso */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Almacenamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Usado:</span>
                    <span className="font-medium">2.4 GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Disponible:</span>
                    <span className="font-medium">97.6 GB</span>
                  </div>
                  <Progress value={2.4} className="h-2" />
                  <div className="text-xs text-gray-500">
                    Plan: 100 GB
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentUpload; 