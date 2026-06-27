import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

import { Button } from '../ui/button';

import { Badge } from '../ui/badge';

import { Progress } from '../ui/progress';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { 
  User, 
  Award, 
  Edit, 
  Save, 
  Download,
  Eye,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowLeft,
  MessageSquareMore
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import StudentHeader from './StudentHeader';
import SupportCenterWidget from './SupportCenterWidget';
import API_BASE_URL from '@/config/api'
import { isInstalledPwa } from '@/utils/pwa';
import { clearAuthToken, getAuthToken } from '@/utils/auth-storage';
import { resolveForumNodeByMunicipio } from '@/constants/forumNodes';

const StudentProfile = () => {
  const [perfil, setPerfil] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    // Se mantienen por compatibilidad con datos antiguos, pero en UI mostramos:
    // - ciudad => municipio del usuario
    // - pais => nombre del emprendimiento
    pais: '',
    ciudad: '',
    municipio: '',
    emprendimiento_nombre: '',
    foto_perfil_url: '',
    foto_emprendimiento_url: '',
    bio: ''
  });
  const [fotoPerfilFile, setFotoPerfilFile] = useState(null);
  const [fotoEmprendimientoFile, setFotoEmprendimientoFile] = useState(null);
  const [uploadingFotos, setUploadingFotos] = useState({ perfil: false, emprendimiento: false });
  const fotoPerfilInputRef = useRef(null);
  const fotoEmprendimientoInputRef = useRef(null);
  const [certificados, setCertificados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);

      const token = getAuthToken();
      if (!token) {
        toast.error('No hay sesión activa. Por favor, inicia sesión.');
        if (!isInstalledPwa()) {
          navigate('/login');
        }
        return;
      }

      const authHeaders = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      // Cargar información del perfil
      const perfilResponse = await fetch(`${API_BASE_URL}/student/perfil`, {
        credentials: 'include',
        headers: authHeaders
      });

      if (perfilResponse.status === 401) {
        if (isInstalledPwa()) {
          toast.error('No se pudo validar tu sesión con el servidor. Puedes continuar en modo offline.');
        } else {
          clearAuthToken();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
        }
        return;
      }
      
      if (perfilResponse.ok) {
        const perfilData = await perfilResponse.json();
        if (perfilData.success) {
          setPerfil(perfilData.data);
        }
      }
      
      // Cargar certificados
      const certificadosResponse = await fetch(`${API_BASE_URL}/student/certificados`, {
        credentials: 'include',
        headers: authHeaders
      });
      
      if (certificadosResponse.ok) {
        const certificadosData = await certificadosResponse.json();
        if (certificadosData.success) {
          setCertificados(certificadosData.data);
        }
      }
      
      // Cargar estadísticas
      const statsResponse = await fetch(`${API_BASE_URL}/student/estadisticas`, {
        credentials: 'include',
        headers: authHeaders
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setEstadisticas(statsData.data);
        }
      }
      
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPerfil = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('No hay sesión activa. Por favor, inicia sesión.');
        if (!isInstalledPwa()) {
          navigate('/login');
        }
        return;
      }
      const response = await fetch(`${API_BASE_URL}/student/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(perfil)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Perfil actualizado exitosamente');
          setEditando(false);
        } else {
          toast.error(data.error || 'Error al actualizar perfil');
        }
      } else {
        toast.error('Error al conectar con el servidor');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error('Error al guardar el perfil');
    }
  };

  const subirFoto = async (tipo) => {
    try {
      const file = tipo === 'perfil' ? fotoPerfilFile : fotoEmprendimientoFile;
      if (!file) {
        toast.error('Selecciona una imagen primero');
        return;
      }

      // Validación/normalización: el backend acepta JPG/PNG/WEBP y máx 5MB.
      // Si el archivo supera el límite, intentamos comprimir/redimensionar a JPG para evitar 400.
      const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
      const isHeic =
        (file.type || '').toLowerCase().includes('heic') ||
        (file.type || '').toLowerCase().includes('heif') ||
        /\.heic$/i.test(file.name || '') ||
        /\.heif$/i.test(file.name || '');

      const readAsDataURL = (f) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
          reader.readAsDataURL(f);
        });

      const compressToJpegDataUrl = async (inputFile) => {
        // Cargar imagen en un <img> vía objectURL para poder dibujar en canvas
        const objectUrl = URL.createObjectURL(inputFile);
        try {
          const img = await new Promise((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error('No se pudo cargar la imagen'));
            el.src = objectUrl;
          });

          const maxDim = 1024; // suficiente para perfil/logo
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('No se pudo procesar la imagen');
          ctx.drawImage(img, 0, 0, width, height);

          // Intentar varias calidades hasta quedar <= 5MB
          const qualities = [0.85, 0.75, 0.65, 0.55];
          for (const q of qualities) {
            // eslint-disable-next-line no-await-in-loop
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', q));
            if (!blob) continue;
            if (blob.size <= MAX_IMAGE_BYTES) {
              const filenameBase = (inputFile.name || 'imagen').replace(/\.[^.]+$/, '');
              const jpegFile = new File([blob], `${filenameBase}.jpg`, { type: 'image/jpeg' });
              // eslint-disable-next-line no-await-in-loop
              const dataUrl = await readAsDataURL(jpegFile);
              return { dataUrl, filename: jpegFile.name, contentType: jpegFile.type };
            }
          }

          throw new Error('La imagen es demasiado grande. Máximo 5MB.');
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      };

      const token = getAuthToken();
      if (!token) {
        toast.error('No hay sesión activa. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      setUploadingFotos((prev) => ({ ...prev, [tipo]: true }));

      const endpoint = tipo === 'perfil'
        ? `${API_BASE_URL}/student/perfil/foto-perfil`
        : `${API_BASE_URL}/student/perfil/foto-emprendimiento`;

      // En AWS API Gateway, multipart/form-data puede no llegar como request.files.
      // Usamos dataUrl (base64) para que funcione consistente en PWA/desktop/tablet.
      // Además, comprimimos/redimensionamos si hace falta para cumplir el límite del backend.
      let payloadImagen;
      if (isHeic) {
        toast.error('La imagen está en formato HEIC/HEIF. Por favor conviértela a JPG/PNG y vuelve a intentar.');
        return;
      }

      const tipoOk = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes((file.type || '').toLowerCase());
      if (!tipoOk) {
        toast.error('Tipo de archivo no permitido. Usa JPG, PNG o WEBP.');
        return;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        payloadImagen = await compressToJpegDataUrl(file);
      } else {
        const dataUrl = await readAsDataURL(file);
        payloadImagen = { dataUrl, filename: file.name, contentType: file.type };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dataUrl: payloadImagen.dataUrl,
          filename: payloadImagen.filename,
          content_type: payloadImagen.contentType
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        toast.error(data?.error || 'Error al subir la imagen');
        return;
      }

      if (tipo === 'perfil') {
        setPerfil((prev) => ({ ...prev, foto_perfil_url: data.url }));
        setFotoPerfilFile(null);
      } else {
        setPerfil((prev) => ({ ...prev, foto_emprendimiento_url: data.url }));
        setFotoEmprendimientoFile(null);
      }

      toast.success('Imagen actualizada');
    } catch (e) {
      console.error('Error subiendo imagen:', e);
      toast.error('Error al subir la imagen');
    } finally {
      setUploadingFotos((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const handleDescargarCertificado = async (certificadoId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/student/certificado/${certificadoId}/descargar`, {
        credentials: 'include',
        headers: token ? { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } : undefined
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${certificadoId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Certificado descargado exitosamente');
      } else {
        toast.error('Error al descargar el certificado');
      }
    } catch (error) {
      console.error('Error al descargar certificado:', error);
      toast.error('Error al descargar el certificado');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const forumNode = resolveForumNodeByMunicipio(perfil.municipio || perfil.ciudad || '')

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader 
        title="Mi Perfil"
        showBackButton={true}
        backUrl="/student/dashboard"
        showUserMenu={false}
        navigationItemsOverride={[
          { name: 'Dashboard', href: '/student/dashboard', icon: BookOpen },
          { name: 'Mis Cursos', href: '/student/modulos', icon: BookOpen },
          { name: 'Cerrar Sesión', action: 'logout' },
        ]}
      />

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="perfil">Información Personal</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Gestiona tus datos personales y preferencias
                    </CardDescription>
                  </div>
                  <Button
                    variant={editando ? "default" : "outline"}
                    onClick={() => editando ? handleGuardarPerfil() : setEditando(true)}
                  >
                    {editando ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Fotos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Foto de perfil */}
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">Foto de perfil</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0" style={{ minWidth: '80px', minHeight: '80px' }}>
                        {perfil.foto_perfil_url ? (
                          <img
                            src={perfil.foto_perfil_url}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover"
                            style={{ 
                              display: 'block',
                              minWidth: '80px',
                              minHeight: '80px',
                              width: '100%',
                              height: '100%'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{ minWidth: '80px', minHeight: '80px' }}>
                            Sin foto
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          ref={fotoPerfilInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingFotos.perfil}
                          onChange={(e) => setFotoPerfilFile(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingFotos.perfil}
                            onClick={() => fotoPerfilInputRef.current?.click()}
                          >
                            Elegir foto
                          </Button>
                          <span className="text-sm text-gray-600 truncate">
                            {fotoPerfilFile?.name || 'Ningún archivo seleccionado'}
                          </span>
                        </div>
                        <Button
                          type="button"
                          disabled={uploadingFotos.perfil}
                          onClick={() => subirFoto('perfil')}
                        >
                          {uploadingFotos.perfil ? 'Subiendo...' : 'Subir foto de perfil'}
                        </Button>
                        <p className="text-xs text-gray-500">Formatos: JPG/PNG/WEBP. Máx: 5MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* Foto del emprendimiento */}
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">Foto del emprendimiento</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border flex-shrink-0" style={{ minWidth: '80px', minHeight: '80px' }}>
                        {perfil.foto_emprendimiento_url ? (
                          <img
                            src={perfil.foto_emprendimiento_url}
                            alt="Foto del emprendimiento"
                            className="w-full h-full object-cover"
                            style={{ 
                              display: 'block',
                              minWidth: '80px',
                              minHeight: '80px',
                              width: '100%',
                              height: '100%'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm" style={{ minWidth: '80px', minHeight: '80px' }}>
                            Sin foto
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          ref={fotoEmprendimientoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingFotos.emprendimiento}
                          onChange={(e) => setFotoEmprendimientoFile(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingFotos.emprendimiento}
                            onClick={() => fotoEmprendimientoInputRef.current?.click()}
                          >
                            Elegir foto
                          </Button>
                          <span className="text-sm text-gray-600 truncate">
                            {fotoEmprendimientoFile?.name || 'Ningún archivo seleccionado'}
                          </span>
                        </div>
                        <Button
                          type="button"
                          disabled={uploadingFotos.emprendimiento}
                          onClick={() => subirFoto('emprendimiento')}
                        >
                          {uploadingFotos.emprendimiento ? 'Subiendo...' : 'Subir foto del emprendimiento'}
                        </Button>
                        <p className="text-xs text-gray-500">Formatos: JPG/PNG/WEBP. Máx: 5MB.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={perfil.nombre}
                      onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={perfil.email}
                      onChange={(e) => setPerfil({...perfil, email: e.target.value})}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={perfil.telefono}
                      onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={perfil.fechaNacimiento}
                      onChange={(e) => setPerfil({...perfil, fechaNacimiento: e.target.value})}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del emprendimiento
                    </label>
                    <input
                      type="text"
                      value={perfil.emprendimiento_nombre || ''}
                      onChange={(e) => setPerfil({...perfil, emprendimiento_nombre: e.target.value})}
                      disabled={!editando}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={perfil.municipio || perfil.ciudad || ''}
                      onChange={(e) => setPerfil({...perfil, municipio: e.target.value})}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografía
                    </label>
                    <textarea
                      value={perfil.bio}
                      onChange={(e) => setPerfil({...perfil, bio: e.target.value})}
                      disabled={!editando}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Cuéntanos un poco sobre ti..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareMore className="h-5 w-5 text-blue-600" />
                  Foro del nodo
                </CardTitle>
                <CardDescription>
                  {forumNode
                    ? `Tu municipio participa en el foro ${forumNode.name}.`
                    : 'Accede al foro asincrónico de tu nodo para conversar con estudiantes e instructores.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {forumNode
                    ? `Municipio registrado: ${perfil.municipio || perfil.ciudad || 'No especificado'}`
                    : 'Si no se identifica el nodo, revisa que tu municipio esté correctamente registrado.'}
                </div>
                <Button type="button" onClick={() => navigate('/student/foro')}>
                  Ir al foro de mi nodo
                </Button>
              </CardContent>
            </Card>

            {/* Botones en la parte inferior */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => navigate('/student/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                variant={editando ? "outline" : "outline"}
                onClick={() => !editando && setEditando(true)}
                disabled={editando}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              {editando && (
                <Button
                  variant="default"
                  onClick={handleGuardarPerfil}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="certificados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Mis Certificados
                </CardTitle>
                <CardDescription>
                  Descarga tus certificados de cursos completados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificados.length > 0 ? (
                    certificados.map((certificado) => (
                      <div key={certificado.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Award className="h-8 w-8 text-yellow-500" />
                          <div>
                            <h4 className="font-medium">{certificado.curso}</h4>
                            <p className="text-sm text-gray-500">
                              Completado el {formatearFecha(certificado.fechaCompletado)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Calificación: {certificado.calificacion}%
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/certificado/${certificado.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDescargarCertificado(certificado.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        No tienes certificados aún
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Completa cursos para obtener certificados y verlos aquí.
                      </p>
                      <Button onClick={() => navigate('/student/cursos')}>
                        Explorar Cursos
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <SupportCenterWidget screenLabel="student-profile" />
    </div>
  );
};

export default StudentProfile; 