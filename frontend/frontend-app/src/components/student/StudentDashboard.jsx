import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Button } from '../ui/button';

import { Progress } from '../ui/progress';

import { Play, LogOut, FileText, Edit, ChevronDown, Briefcase, Rocket, ArrowRight, Sparkles, BookOpen, Lock, Video, Pencil, MessageSquareMore } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import StudentHeader from './StudentHeader';
import SupportCenterWidget from './SupportCenterWidget';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { isInstalledPwa } from '@/utils/pwa';
import { clearLocalSession, getAuthToken } from '@/utils/auth-storage';
import { resolveForumNodeByMunicipio } from '@/constants/forumNodes';

const StudentDashboard = () => {
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    emprendimiento_nombre: '',
    municipio: '',
    foto_perfil_url: '',
    foto_emprendimiento_url: '',
    nodo: '', // Se calculará o vendrá del backend
  });
  const [progreso, setProgreso] = useState({
    asistenciaPresencial: 0,
    progresoCurso: 0
  });
  const [estadisticas, setEstadisticas] = useState({
    cursosActivos: 0,
    cursosCompletados: 0,
    progresoGeneral: 0,
  });
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoStarted, setVideoStarted] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const satisfactionSurveyUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSftQCIEHzHaStExEiNjTEzONeLwwkz97X6ydv9f4Oa2Qu8mIA/viewform?usp=publish-editor';

  useEffect(() => {
    cargarDashboard();
    // Activar animación de barras de progreso después de un pequeño delay
    const timer = setTimeout(() => {
      setAnimateProgress(true);
    }, 300);

    // Refrescar stats (incluye asistencia) periódicamente para reflejar marcaciones del instructor
    const statsInterval = setInterval(() => {
      refrescarStatsSilencioso();
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearInterval(statsInterval);
    };
  }, []);

  const refrescarStatsSilencioso = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const statsResponse = await fetch(`${API_BASE_URL}/student/dashboard`, {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setEstadisticas(statsData.data);
          setProgreso(prev => ({
            ...prev,
            asistenciaPresencial: typeof statsData.data.asistenciaPresencial === 'number'
              ? statsData.data.asistenciaPresencial
              : prev.asistenciaPresencial
          }));
        }
      }

      // Progreso del curso (sincronizado con módulos): 10% por módulo completado
      const progresoModulosResponse = await fetch(import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/student/mi-progreso`
        : `${API_BASE_URL}/student/mi-progreso`, {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (progresoModulosResponse.ok) {
        const data = await progresoModulosResponse.json();
        if (data.success && data.modulos && Array.isArray(data.modulos)) {
          const completedModulesCount = data.modulos.filter(mod => mod.porcentaje === 100).length;
          const calculatedProgress = Math.min(completedModulesCount * 10, 100);

          setProgreso(prev => ({
            ...prev,
            progresoCurso: calculatedProgress
          }));
        }
      }
    } catch (_) {
      // Silencioso: no interrumpir al usuario por problemas temporales de red
    }
  };

const cargarDashboard = async () => {
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

      // Cargar datos completos del usuario (incluyendo emprendimiento y municipio)
      const userResponse = await fetch(`${API_BASE_URL}/profile`, {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.status === 401) {
        if (isInstalledPwa()) {
          toast.error('No se pudo validar tu sesión con el servidor. Puedes continuar en modo offline.');
        } else {
          clearLocalSession();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
        }
        return;
      }

      if (userResponse.ok) {
        const userDataResponse = await userResponse.json();
        // El endpoint /api/profile devuelve directamente el objeto, no envuelto en success/data
        if (userDataResponse) {
          setUserData({
            nombre: userDataResponse.nombre || '',
            apellido: userDataResponse.apellido || '',
            emprendimiento_nombre: userDataResponse.emprendimiento_nombre || 'Sin emprendimiento',
            municipio: userDataResponse.municipio || 'No especificado',
            foto_perfil_url: userDataResponse.foto_perfil_url || '',
            foto_emprendimiento_url: userDataResponse.foto_emprendimiento_url || '',
            nodo: calcularNodo(userDataResponse.municipio || '')
          });
        }
      } else {
        console.error('Error al cargar perfil:', userResponse.status);
      }

      // Cargar estadísticas del dashboard
      const statsResponse = await fetch(`${API_BASE_URL}/student/dashboard`, {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.status === 401) {
        if (isInstalledPwa()) {
          toast.error('No se pudo validar tu sesión con el servidor. Puedes continuar en modo offline.');
        } else {
          clearLocalSession();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
        }
        return;
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setEstadisticas(statsData.data);
          setProgreso(prev => ({
            ...prev,
            asistenciaPresencial: typeof statsData.data.asistenciaPresencial === 'number'
              ? statsData.data.asistenciaPresencial
              : prev.asistenciaPresencial
          }));
        }
      } else {
        console.error('Error al cargar estadísticas:', statsResponse.status);
      }

      // Progreso del curso: Se calcula dinámicamente basado en los módulos completados (10% por cada uno)
      // Esta lógica reemplaza el endpoint estático para asegurar consistencia con las barras de módulos
      const progresoModulosResponse = await fetch(import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/student/mi-progreso`
        : `${API_BASE_URL}/student/mi-progreso`, {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (progresoModulosResponse.ok) {
        const data = await progresoModulosResponse.json();
        let calculatedProgress = 0;

        if (data.success && data.modulos && Array.isArray(data.modulos)) {
          // Contar módulos al 100%
          const completedModulesCount = data.modulos.filter(mod => mod.porcentaje === 100).length;
          // Cada módulo completado suma 10%
          calculatedProgress = completedModulesCount * 10;

          // Asegurar que no exceda 100% (aunque con 10 módulos debería ser exacto)
          calculatedProgress = Math.min(calculatedProgress, 100);
        }

        setProgreso(prev => ({
          ...prev,
          progresoCurso: calculatedProgress
        }));
      } else {
        console.error('Error al cargar progreso detallado de módulos:', progresoModulosResponse.status);
      }

      // Cargar cursos del estudiante
      const cursosResponse = await fetch(`${API_BASE_URL}/student/cursos`, {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (cursosResponse.status === 401) {
        if (isInstalledPwa()) {
          toast.error('No se pudo validar tu sesión con el servidor. Puedes continuar en modo offline.');
        } else {
          clearLocalSession();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          navigate('/login');
        }
        return;
      }

      if (cursosResponse.ok) {
        const cursosData = await cursosResponse.json();
        if (cursosData.success) {
          setCursos(cursosData.data);
        }
      } else {
        console.error('Error al cargar cursos:', cursosResponse.status);
      }

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar el dashboard. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular el nodo basado en el municipio
  const calcularNodo = (municipio) => {
    const nodosMap = {
      'Pasto': 'Centro',
      'Chachagüí': 'Centro',
      'La Florida': 'Centro',
      'Nariño': 'Centro',
      'Tangua': 'Centro',
      'Yacuanquer': 'Centro',
      'Providencia': 'Abades',
      'Samaniego': 'Abades',
      'Santacruz': 'Abades',
      'Cumbitara': 'Cordillera',
      'El Rosario': 'Cordillera',
      'Leiva': 'Cordillera',
      'Policarpa': 'Cordillera',
      'Taminango': 'Cordillera',
      'Ipiales': 'Exprovincia de Obando',
      'Tumaco': 'Costa Pacífica',
      'Túquerres': 'Sabana',
      'Barbacoas': 'Telembí',
      // Agregar más mapeos según sea necesario
    };

    return nodosMap[municipio] || 'No especificado';
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Sesión cerrada exitosamente');
      } else {
        toast.error('No se pudo cerrar sesión en el servidor. Se cerrará localmente.');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Sin conexión. Se cerrará la sesión localmente.');
    } finally {
      clearLocalSession();
      navigate('/login');
    }
  };

  const handlePlanNegocio = () => {
    navigate('/student/plan-negocio');
  };

  const handleEditarPerfil = () => {
    navigate('/student/perfil');
  };

  const handleIrAlForo = () => {
    navigate('/student/foro');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#59D22E]"></div>
      </div>
    );
  }

  const nombreCompleto = `${userData.nombre} ${userData.apellido}`.trim() || 'Usuario';
  const forumNode = resolveForumNodeByMunicipio(userData.municipio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section - Estilo del Prototipo */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#006837] via-[#00844a] to-[#59D22E] min-h-[75vh]">
        {/* Formas orgánicas de fondo (blobs) */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #A5E811 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #FFEB3B 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, #AA27B9 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Patrón de fondo sutil */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url(https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Navbar - Con logos a la izquierda */}
        <nav className="relative z-20 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logos a la izquierda */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <img
                src="/formacion.png"
                alt="Formación"
                className="h-16 w-auto drop-shadow-lg"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  e.target.style.display = 'none';
                }}
              />
              <img
                src="/logos.png"
                alt="Logos"
                className="h-16 w-auto drop-shadow-lg"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  e.target.style.display = 'none';
                }}
              />
              <img
                src="/sgr.png"
                alt="SGR"
                className="h-16 w-auto drop-shadow-lg"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>

            {/* User Menu - Posición absoluta derecha */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute right-8"
            >
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden">
                    {userData.foto_perfil_url ? (
                      <img
                        src={userData.foto_perfil_url}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      className="text-white font-semibold text-sm"
                      style={{ display: userData.foto_perfil_url ? 'none' : 'flex' }}
                    >
                      {userData.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] border">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_BASE_URL}/logout`, {
                            method: 'POST',
                            credentials: 'include'
                          });
                          if (response.ok) {
                            toast.success('Sesión cerrada exitosamente');
                            navigate('/login');
                          } else {
                            toast.error('Error al cerrar sesión');
                          }
                        } catch (error) {
                          console.error('Error al cerrar sesión:', error);
                          toast.error('Error al cerrar sesión');
                        }
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-[#FFEB3B]" />
                <span className="text-white text-sm font-medium">Tu camino al éxito</span>
              </motion.div>

              <h1
                className="text-white mb-6 leading-[1.1]"
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                Bienvenido(a),<br />
                <span className="text-[#FFEB3B]">{nombreCompleto}</span>
              </h1>

              <p
                className="text-white/90 text-xl mb-8 max-w-xl leading-relaxed"
                style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}
              >
                Construye el futuro de tu emprendimiento con herramientas prácticas,
                contenido de calidad y acompañamiento personalizado.
              </p>

              <div className="flex flex-col gap-4 items-start">
                <Button
                  onClick={() => navigate('/student/modulos')}
                  className="bg-[#FFEB3B] hover:bg-[#FFD700] text-[#006837] px-8 py-7 rounded-full border-0 font-bold shadow-2xl transition-all transform hover:scale-105 hover:shadow-[#FFEB3B]/50"
                  style={{ fontSize: '1.125rem' }}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Comenzar ahora
                </Button>

                <Button
                  onClick={() => {
                    if (!satisfactionSurveyUrl) {
                      toast.info('Encuesta de satisfacción pendiente: comparte el link para activarla.');
                      return;
                    }
                    window.open(satisfactionSurveyUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-7 rounded-full border border-white/30 font-semibold shadow-xl transition-all"
                  style={{ fontSize: '1.05rem' }}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Encuesta de satisfacción
                </Button>

                <Button
                  onClick={handleIrAlForo}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-7 rounded-full border border-white/30 font-semibold shadow-xl transition-all"
                  style={{ fontSize: '1.05rem' }}
                >
                  <MessageSquareMore className="w-5 h-5 mr-2" />
                  {forumNode ? `Ir al foro ${forumNode.name}` : 'Ir al foro de mi nodo'}
                </Button>
              </div>
            </motion.div>

            {/* Right Column - User Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
                {/* Profile */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg ring-4 ring-white/30">
                    {userData.foto_perfil_url ? (
                      <img
                        src={userData.foto_perfil_url}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback a inicial si falla la URL (expira o no existe)
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#59D22E] to-[#006837] flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {userData.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <p className="text-sm opacity-80 mb-1">Emprendedor</p>
                    <h3 className="font-bold text-xl">{nombreCompleto}</h3>
                  </div>
                </div>

                {/* Emprendimiento */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center">
                      {userData.foto_emprendimiento_url ? (
                        <img
                          src={userData.foto_emprendimiento_url}
                          alt="Foto del emprendimiento"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Briefcase className="w-8 h-8 text-[#006837]" />
                      )}
                    </div>
                    <div className="text-white">
                      <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Mi emprendimiento</p>
                      <h4 className="font-bold text-lg">{userData.emprendimiento_nombre || 'Sin emprendimiento'}</h4>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm">{userData.municipio || 'No especificado'}</p>
                </div>

                {/* Progress */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/90 text-sm font-medium">Progreso del curso</span>
                      <span className="text-[#FFEB3B] font-bold">{progreso.progresoCurso}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#A5E811] to-[#FFEB3B] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progreso.progresoCurso}%` }}
                        transition={{ duration: 1.5, delay: 0.8 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/90 text-sm font-medium">Asistencia</span>
                      <span className="text-[#AA27B9] font-bold">{progreso.asistenciaPresencial}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#AA27B9] to-[#d946ef] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progreso.asistenciaPresencial}%` }}
                        transition={{ duration: 1.5, delay: 1 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handlePlanNegocio}
                    className="w-full bg-gradient-to-r from-[#59D22E] to-[#A5E811] hover:from-[#A5E811] hover:to-[#59D22E] text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg"
                  >
                    Plan de Negocio
                  </button>
                  <button
                    onClick={handleEditarPerfil}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium transition-all border border-white/20"
                  >
                    Editar mi perfil
                  </button>
                  <button
                    onClick={handleIrAlForo}
                    className="w-full bg-white text-[#006837] hover:bg-gray-100 px-6 py-3 rounded-xl font-medium transition-all border border-white/20"
                  >
                    Foro de mi nodo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" />
          </svg>
        </div>
      </header>

{/* Cómo funciona - Estilo del Prototipo */}
      <section className="py-16 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Section: Title and Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-[#006837] mb-6"
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                ¿Cómo funciona?
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                  Bienvenido(a) a tu espacio de aprendizaje. EmprendePaz es una plataforma educativa diseñada para acompañarte en tu camino emprendedor, donde aprenderás de forma práctica, dinámica y a tu propio ritmo.
                </p>
                <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                  La plataforma está organizada en módulos temáticos, cada uno abordando un área clave para el emprendimiento (marketing, finanzas, innovación, liderazgo, etc.). Dentro de cada módulo encontrarás varias unidades de aprendizaje, y cada unidad está compuesta de 3 pasos fundamentales.
                </p>
              </div>
            </motion.div>

            {/* Right Section: Feature cards - 4 cards en grid 2x2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    icon: <FileText className="w-8 h-8" />,
                    title: "Presentación",
                    description: "Conoce los conceptos y objetivos de cada unidad de aprendizaje",
                    color: "#A5E811",
                    delay: 0.1,
                  },
                  {
                    icon: <Briefcase className="w-8 h-8" />,
                    title: "Fundamentación",
                    description: "Profundiza en contenidos teóricos y casos prácticos reales",
                    color: "#006837",
                    delay: 0.2,
                  },
                  {
                    icon: <Rocket className="w-8 h-8" />,
                    title: "Taller",
                    description: "Aplica lo aprendido con actividades prácticas en tu proyecto",
                    color: "#AA27B9",
                    delay: 0.3,
                  },
                  {
                    icon: <Edit className="w-8 h-8" />,
                    title: "Evaluación",
                    description: "Demuestra tu aprendizaje y recibe retroalimentación",
                    color: "#FFEB3B",
                    delay: 0.4,
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: feature.delay }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 group"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <div style={{ color: feature.color }}>
                        {feature.icon}
                      </div>
                    </div>
                    <h3
                      className="text-gray-900 mb-2"
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ten en cuenta - Hero morado con 4 cajas en grid 2x2 */}
      <section className="py-16 px-8 bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] relative overflow-hidden">
        {/* Blobs decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFEB3B]/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2
              className="text-[#FFEB3B] mb-2"
              style={{
                fontFamily: 'Yellowtail, cursive',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              }}
            >
              ¡Ten en cuenta!
            </h2>
          </motion.div>

          {/* Grid 2x2 con 4 cajas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top-Left: Libros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex flex-col gap-1">
                    <BookOpen className="w-6 h-6 text-[#A5E811]" />
                    <BookOpen className="w-6 h-6 text-blue-500" />
                    <BookOpen className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white text-base leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                    Los módulos se activan progresivamente. Primero debes completar el Módulo 1 para desbloquear el Módulo 2, y así sucesivamente. Este diseño te ayuda a construir aprendizajes de forma ordenada y coherente.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Top-Right: Candado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Lock className="w-8 h-8 text-[#FFEB3B]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-base leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                    Dentro de cada módulo, las unidades también se activan en orden. Completa la Unidad 1 antes de avanzar a la Unidad 2. Recuerda: no se trata de correr, sino de aprender bien.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bottom-Left: Cámara */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Video className="w-8 h-8 text-gray-300" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-base leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                    Cada módulo incluye un video de experto que complementa todo lo aprendido en las 3 unidades. Aprovecha esta oportunidad para profundizar y obtener consejos prácticos de profesionales con experiencia real.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bottom-Right: Lápiz */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Pencil className="w-8 h-8 text-[#FFEB3B]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-base leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                    ¡No olvides completar las actividades del Plan de Negocio! Cada módulo tiene actividades específicas que te ayudarán a construir tu proyecto paso a paso. Es aquí donde transformas el conocimiento en acción.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final - Estilo del Prototipo con imagen del emprendedor */}
      <section className="relative py-20 px-8 overflow-hidden bg-gradient-to-br from-[#A5E811] via-[#59D22E] to-[#00b359]">
        {/* Patrón decorativo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Imagen - Emprendedor con sombrero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex justify-center"
            >
              <img
                src="https://i.ibb.co/zW8bDCmY/CAMPESINO.png"
                alt="Emprendedor"
                className="w-full max-w-lg h-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* CTA Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h2
                className="text-[#006837] mb-4"
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                Cada paso que das aquí es un paso hacia el futuro que estás construyendo
              </h2>

              <p
                className="text-white mb-10"
                style={{
                  fontFamily: 'Yellowtail, cursive',
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  lineHeight: 1.3,
                }}
              >
                ¡Confía en tu proceso, confía en ti!
              </p>

              <Button
                onClick={() => navigate('/student/modulos')}
                className="bg-[#006837] hover:bg-[#004d26] text-white px-16 py-8 rounded-full border-0 shadow-2xl transition-all transform hover:scale-110 hover:shadow-[#006837]/50 relative overflow-hidden group"
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '2rem',
                  fontWeight: 800,
                }}
              >
                {/* Efecto de brillo animado */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                <span className="relative flex items-center gap-3">
                  Comencemos
                  <ArrowRight className="w-8 h-8" />
                </span>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Botón flotante de Cerrar Sesión */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 left-8 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full shadow-2xl border-0 transition-all transform hover:scale-105 flex items-center gap-3 z-50"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-bold">Cerrar sesión</span>
      </button>

      {/* Footer */}
      <Footer />
      <SupportCenterWidget screenLabel="student-dashboard" />
    </div>
  );
};

export default StudentDashboard;
