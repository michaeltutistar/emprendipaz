import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import {
  Home,
  ChevronRight,
  Lock,
  LockOpen,
  ChevronDown,
  ChevronUp,
  Activity,
  Clock,
  Target,
  Sparkles,
  LogOut
} from 'lucide-react';
import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { clearLocalSession, getAuthToken } from '@/utils/auth-storage';

const modulosData = [
  {
    id: 1,
    titulo: 'Proyecto de vida',
    descripcion:
      'Desarrolla tu proyecto de vida identificando tus valores, intereses y fortalezas personales para orientar tu emprendimiento hacia el éxito.',
    disponible: true,
    estado: 'En curso',
    duracion: '8 horas',
    ruta: '/student/proyecto-vida',
    imagen: '/images/modulos/proyecto-de-vida.jpeg',
    enfoques: [
      'Identifica tus valores y propósitos para alinear el emprendimiento con tu vida.',
      'Define metas claras que se conecten con tu territorio y comunidad.'
    ]
  },
  {
    id: 2,
    titulo: 'Descubrimiento de Oportunidades',
    descripcion: 'Aprende a identificar y evaluar oportunidades de negocio en tu territorio.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/descubrimiento-oportunidades',
    imagen: '/images/modulos/descubrimiento-de-oportunidades.jpeg',
    enfoques: [
      'Reconoce necesidades del entorno para diseñar soluciones de valor.',
      'Utiliza herramientas sencillas de observación y validación temprana.'
    ]
  },
  {
    id: 3,
    titulo: 'Modelo de Negocios',
    descripcion: 'Diseña y valida tu modelo de negocio para crear valor sostenible.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/modelo-negocios',
    imagen: '/images/modulos/modelo-de-negocios.jpeg',
    enfoques: [
      'Construye propuestas de valor centradas en el usuario.',
      'Estructura los componentes clave de tu modelo para asegurar sostenibilidad.'
    ]
  },
  {
    id: 4,
    titulo: 'Marketing y Comercialización',
    descripcion:
      'Domina las estrategias fundamentales para posicionar tu producto o servicio en el mercado.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/presentacion-modulo',
    imagen: '/images/modulos/marketing-y-comercializacion.jpeg',
    enfoques: [
      'Define tu público objetivo y mensajes clave.',
      'Construye planes de comercialización que respondan al contexto local.'
    ]
  },
  {
    id: 5,
    titulo: 'Marketing Digital',
    descripcion:
      'Aprende a desarrollar estrategias de marketing digital y presencia online para tu emprendimiento.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/marketing-digital',
    imagen: '/images/modulos/marketing-digital.jpeg',
    enfoques: [
      'Crea una presencia coherente en redes.',
      'Diseña campañas digitales medibles y de bajo costo.'
    ]
  },
  {
    id: 6,
    titulo: 'Atención al Cliente y Resolución de Conflictos',
    descripcion: 'Desarrolla habilidades para atender clientes y resolver conflictos de manera efectiva.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/atencion-cliente',
    imagen: '/images/modulos/atencion-cliente-resolucion-conflictos.jpeg',
    enfoques: [
      'Fortalece la escucha activa y la empatía.',
      'Aplica protocolos simples para gestionar reclamaciones.'
    ]
  },
  {
    id: 7,
    titulo: 'Trabajo en Equipo',
    descripcion: 'Fomenta el trabajo colaborativo y efectivo en tu emprendimiento.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/trabajo-equipo',
    imagen: '/images/modulos/trabajo-en-equipo.jpeg',
    enfoques: [
      'Organiza roles y responsabilidades claras.',
      'Aplica dinámicas que fortalezcan la confianza del equipo.'
    ]
  },
  {
    id: 8,
    titulo: 'Finanzas y Gestión Empresarial',
    descripcion:
      'Aprende a gestionar las finanzas y administración de tu emprendimiento de manera efectiva.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/finanzas',
    imagen: '/images/modulos/finanzas-gestion-empresarial.jpeg',
    enfoques: [
      'Controla ingresos y egresos con herramientas básicas.',
      'Define indicadores financieros para tomar decisiones.'
    ]
  },
  {
    id: 9,
    titulo: 'Plan de Inversión',
    descripcion: 'Planifica y gestiona las inversiones necesarias para tu emprendimiento.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/plan-inversion',
    imagen: '/images/modulos/plan-de-inversion.jpeg',
    enfoques: [
      'Prioriza gastos clave para crecer de forma sostenible.',
      'Evalúa fuentes de financiamiento y su impacto.'
    ]
  },
  {
    id: 10,
    titulo: 'Liderazgo',
    descripcion: 'Desarrolla habilidades de liderazgo para dirigir tu emprendimiento.',
    disponible: true,
    estado: 'Disponible',
    duracion: '8 horas',
    ruta: '/student/liderazgo',
    imagen: '/images/modulos/liderazgo.jpeg',
    enfoques: [
      'Identifica tu estilo de liderazgo y cómo mejorarlo.',
      'Aplica herramientas para la toma de decisiones y motivación del equipo.'
    ]
  }
];

const truncateDescription = (text, limit = 40) => {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= limit) return text;
  return `${words.slice(0, limit).join(' ')}...`;
};

const ModulosPage = () => {
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState({});
  const [progresoModulos, setProgresoModulos] = useState({});
  const [modulosDisponibles, setModulosDisponibles] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [loadingProgreso, setLoadingProgreso] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false); // Ref para evitar dependencia circular en el scroll handler

  // Mapeo de nombres de modulos entre frontend y backend
  const mapeoModulos = {
    'Proyecto de vida': 'Proyecto de vida',
    'Descubrimiento de Oportunidades': 'Descubrimiento de Oportunidades',
    'Modelo de Negocios': 'Modelo de Negocios',
    'Marketing y Comercialización': 'Marketing y Comercialización',
    'Marketing Digital': 'Marketing Digital',
    'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
    'Trabajo en Equipo': 'Trabajo en Equipo',
    'Finanzas y Gestión Empresarial': 'Finanzas',
    'Plan de Inversión': 'Plan de Inversión',
    'Liderazgo': 'Liderazgo',
    'Plan de Negocios': 'Plan de Negocios'
  };

  useEffect(() => {
    // Cargar foto de perfil
    const cargarFotoPerfil = async () => {
      try {
        const token = getAuthToken();

        const response = await fetch(`${API_BASE_URL}/student/perfil`, {
          credentials: 'include',
          headers: {
            ...(token ? { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } : {})
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFotoPerfilUrl(data.data.foto_perfil_url || '');
            setUserName(data.data.nombre || '');
          }
        }
      } catch (error) {
        console.error('Error al cargar foto de perfil:', error);
      }
    };

    cargarFotoPerfil();
    cargarProgreso();
    cargarModulosDisponibles();
    window.scrollTo(0, 0);

    // Recargar progreso cuando la página vuelva a estar visible (pestaña activa)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cargarProgreso();
        cargarModulosDisponibles();
      }
    };

    // Escuchar cambios en el localStorage para actualizar progreso en tiempo real
    const handleStorageChange = () => {
      cargarProgreso();
      cargarModulosDisponibles();
    };

    // Escuchar evento personalizado de progreso actualizado
    const handleProgresoActualizado = () => {
      cargarProgreso();
      cargarModulosDisponibles();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('progreso-actualizado', handleProgresoActualizado);

    // Recargar progreso periódicamente (cada 30 segundos)
    const interval = setInterval(() => {
      cargarProgreso();
      cargarModulosDisponibles();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('progreso-actualizado', handleProgresoActualizado);
      clearInterval(interval);
    };
  }, []);

  // Sincronizar el ref con el estado
  useEffect(() => {
    isScrolledRef.current = isScrolled;
  }, [isScrolled]);

  // Detectar scroll para animar el header - Optimizado para evitar parpadeo
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;

          // Zona muerta (hysteresis) para evitar oscilación: 
          // Si está scrolleado, necesita bajar a 30px para desactivar
          // Si no está scrolleado, necesita subir a 70px para activar
          if (isScrolledRef.current) {
            // Si ya está scrolleado, solo cambia si baja mucho (evita parpadeo al borde)
            if (scrollPosition < 30) {
              isScrolledRef.current = false;
              setIsScrolled(false);
            }
          } else {
            // Si no está scrolleado, solo cambia si sube mucho (evita parpadeo al borde)
            if (scrollPosition > 70) {
              isScrolledRef.current = true;
              setIsScrolled(true);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Sin dependencias para evitar recrear el listener

  const cargarProgreso = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/student/mi-progreso`, {
        method: 'GET',
        headers: {
          ...(token ? { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.modulos) {
          // Crear un objeto con el nombre del modulo como clave y el porcentaje como valor
          const progresoMap = {};
          data.modulos.forEach((mod) => {
            progresoMap[mod.modulo] = mod.porcentaje;
          });
          setProgresoModulos(progresoMap);
          console.log('Progreso cargado:', progresoMap);
        } else {
          console.warn('No se recibieron modulos en la respuesta:', data);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error en la respuesta del servidor:', errorData);
      }
    } catch (error) {
      console.error('Error cargando progreso:', error);
    } finally {
      setLoadingProgreso(false);
    }
  };

  const cargarModulosDisponibles = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/student/modulos-disponibles`, {
        method: 'GET',
        headers: {
          ...(token ? { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } : {}),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.modulos) {
          setModulosDisponibles(data.modulos);
          console.log('Modulos disponibles cargados:', data.modulos);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error cargando modulos disponibles:', errorData);
      }
    } catch (error) {
      console.error('Error cargando modulos disponibles:', error);
    }
  };

  const isModuloDisponible = (tituloModulo) => {
    // El primer módulo siempre está disponible
    if (tituloModulo === 'Proyecto de vida') return true;

    const nombreBackend = mapeoModulos[tituloModulo] || tituloModulo;

    // Si tenemos datos del backend, usarlos
    if (modulosDisponibles && modulosDisponibles[nombreBackend]) {
      const backendDisponible = modulosDisponibles[nombreBackend].disponible === true;

      // Failsafe: Aunque el backend diga que está disponible, verificar que el anterior esté completo
      // si es que tenemos información de progreso cargada.
      if (backendDisponible && !loadingProgreso) {
        const moduloActual = modulosData.find(m => m.titulo === tituloModulo);
        if (moduloActual && moduloActual.id > 1) {
          const moduloAnterior = modulosData.find(m => m.id === moduloActual.id - 1);
          if (moduloAnterior) {
            const progresoAnterior = getProgresoModulo(moduloAnterior.titulo);
            // Si el anterior no está completo (100%), forzar bloqueo
            if (progresoAnterior < 100) return false;
          }
        }
      }

      return backendDisponible;
    }

    // OFFLINE (PWA): fallback simple y seguro
    // Si no tenemos modulos-disponibles del backend, habilitar secuencialmente según el último progreso conocido.
    // Esto evita que “empiece desde cero” cuando no hay conexión.
    if (!navigator.onLine) {
      const moduloActual = modulosData.find(m => m.titulo === tituloModulo);
      if (!moduloActual) return false;
      if (moduloActual.id <= 1) return true;
      const moduloAnterior = modulosData.find(m => m.id === moduloActual.id - 1);
      if (!moduloAnterior) return false;
      const progresoAnterior = getProgresoModulo(moduloAnterior.titulo);
      return progresoAnterior >= 100;
    }

    // Si no hay datos del backend aún o el módulo no existe en ellos, bloqueamos por defecto.
    return false;
  };

  const getProgresoModulo = (tituloModulo) => {
    const nombreBackend = mapeoModulos[tituloModulo] || tituloModulo;
    return progresoModulos[nombreBackend] || 0;
  };

  const handleComenzar = (modulo, estaDisponible) => {
    if (estaDisponible && modulo.ruta) {
      navigate(modulo.ruta);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header estilo prototipo con degradado verde y patrón */}
      <motion.header
        className="sticky top-0 z-40 text-white px-4 sm:px-8 overflow-hidden relative shadow-md"
        animate={{
          minHeight: isScrolled ? '70px' : '140px',
          paddingTop: isScrolled ? '0.5rem' : '1rem',
          paddingBottom: isScrolled ? '0.5rem' : '1rem',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Fondo degradado + patrón hojas */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: 'url(https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Hojas animadas del prototipo */}
        {/* Hoja Morada 1 */}
        <motion.img
          src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"
          alt=""
          className="absolute right-[8%] w-14 h-14 sm:w-20 sm:h-20"
          animate={{
            x: [0, 233],
            y: [100, -40],
            opacity: [0, 0.9, 0.9, 0]
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.1, 0.85, 1]
          }}
        />
        {/* Hoja Morada 2 */}
        <motion.img
          src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"
          alt=""
          className="absolute right-[28%] w-12 h-12 sm:w-16 sm:h-16"
          animate={{
            x: [0, 222],
            y: [110, -30],
            opacity: [0, 0.7, 0.7, 0]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 1,
            times: [0, 0.1, 0.85, 1]
          }}
        />
        {/* Hoja Azul 1 */}
        <motion.img
          src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"
          alt=""
          className="absolute left-[10%] w-14 h-14 sm:w-18 sm:h-18"
          animate={{
            x: [0, 228],
            y: [110, -35],
            opacity: [0, 0.85, 0.85, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.5,
            times: [0, 0.1, 0.85, 1]
          }}
        />
        {/* Hoja Azul 2 */}
        <motion.img
          src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"
          alt=""
          className="absolute left-[5%] w-16 h-16 sm:w-22 sm:h-22"
          animate={{
            x: [0, 244],
            y: [110, -45],
            opacity: [0, 0.6, 0.6, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
            delay: 1.5,
            times: [0, 0.1, 0.85, 1]
          }}
        />
        {/* Hoja Amarilla 1 */}
        <motion.img
          src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"
          alt=""
          className="absolute left-[15%] w-10 h-10 sm:w-14 sm:h-14"
          animate={{
            x: [0, 211],
            y: [110, -25],
            opacity: [0, 0.75, 0.75, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
            times: [0, 0.1, 0.85, 1]
          }}
        />
        {/* Hoja Amarilla 2 */}
        <motion.img
          src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"
          alt=""
          className="absolute right-[40%] w-10 h-10 sm:w-12 sm:h-12"
          animate={{
            x: [0, 200],
            y: [110, -20],
            opacity: [0, 0.8, 0.8, 0]
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.8,
            times: [0, 0.1, 0.85, 1]
          }}
        />

        {/* Contenido header */}
        <div className="relative max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo - Izquierda */}
          <motion.div
            className="flex items-center gap-3"
            animate={{
              scale: isScrolled ? 0.6 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-start">
              <img
                src="/formacion.png"
                alt="Formación Logo"
                onClick={() => navigate('/student/dashboard')}
                className={`w-auto object-contain drop-shadow-2xl transition-all cursor-pointer hover:opacity-80 ${isScrolled ? 'h-8' : 'h-14'}`}
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
              />
            </div>
          </motion.div>

          {/* Título - Centro */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            animate={{
              scale: isScrolled ? 0.65 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <h1
              className="text-white text-center whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: isScrolled ? '1.25rem' : 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0,0,0,0.4), 0 2px 10px rgba(0,0,0,0.3)',
                transition: 'font-size 0.3s',
              }}
            >
              Modulos de Aprendizaje
            </h1>
          </motion.div>

          {/* Avatar usuario → dashboard - Derecha */}
          <div className="flex justify-end">
            <motion.div
              animate={{
                scale: isScrolled ? 0.7 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 overflow-hidden">
                    {fotoPerfilUrl ? (
                      <img
                        src={fotoPerfilUrl}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span
                      className="text-white font-semibold text-sm"
                      style={{ display: fotoPerfilUrl ? 'none' : 'flex' }}
                    >
                      {userName.charAt(0).toUpperCase() || 'U'}
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
                          } else {
                            console.error('Error al cerrar sesión');
                          }
                        } catch (error) {
                          console.error('Error al cerrar sesión:', error);
                        }
                        clearLocalSession();
                        navigate('/login');
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
        </div>
      </motion.header>

      {/* Breadcrumb con fondo blanco - Animado según scroll */}
      <motion.div
        className="bg-white border-b border-gray-200 sticky z-40 shadow-sm"
        animate={{
          top: isScrolled ? '70px' : '140px',
          paddingTop: isScrolled ? '0.5rem' : '0.75rem',
          paddingBottom: isScrolled ? '0.5rem' : '0.75rem',
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            className="flex items-center gap-2 text-gray-600"
            animate={{
              fontSize: isScrolled ? '0.75rem' : '0.875rem',
            }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => navigate('/student/dashboard')}
              className="hover:text-[#006837] transition-colors flex items-center gap-1"
            >
              <Home className={isScrolled ? 'w-3 h-3' : 'w-4 h-4'} />
            </button>
            <ChevronRight className={isScrolled ? 'w-3 h-3' : 'w-4 h-4'} />
            <span className="text-[#006837] font-semibold">Modulos</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* Info Alert estilo prototipo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#59D22E]/10 to-[#A5E811]/10 border-l-4 border-[#59D22E] rounded-2xl p-6 mb-10"
        >
          <div className="flex items-start gap-4">
            <Target className="w-6 h-6 text-[#006837] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-[#006837] mb-2">Progreso secuencial</h3>
              <p className="text-gray-700 leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                Completa todas las unidades de cada modulo para desbloquear el siguiente. Usa el botón{' '}
                <span className="font-semibold">Comenzar</span> para retomar tu avance.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {modulosData.map((modulo) => {
            const isExpanded = expandedModules[modulo.id];
            const moduloEstaDisponible = isModuloDisponible(modulo.titulo);

            return (
              <motion.div
                key={modulo.id}
                data-modulo-id={modulo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`rounded-3xl shadow-lg hover:shadow-2xl transition-all border overflow-hidden group ${moduloEstaDisponible
                  ? 'bg-white border-gray-100'
                  : 'bg-gray-100 border-gray-200 grayscale hover:grayscale-0'
                  }`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Imagen del modulo */}
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 260 }}
                      className="flex-shrink-0"
                    >
                      <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-lg bg-neutral-100">
                        <img
                          src={modulo.imagen}
                          alt={modulo.titulo}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-3 uppercase tracking-wide">
                        Modulo {modulo.id}
                      </p>
                    </motion.div>

                    {/* Contenido */}
                    <div className="flex-1 flex flex-col">
                      {/* Encabezado */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                            Formación estratégica
                          </p>
                          <h3
                            className={`mt-1 mb-2 transition-colors ${moduloEstaDisponible
                              ? 'text-[#006837]'
                              : 'text-gray-500 group-hover:text-[#006837]'
                              }`}
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: '1.6rem',
                              fontWeight: 700,
                              lineHeight: 1.3
                            }}
                          >
                            {modulo.titulo}
                          </h3>
                        </div>

                        <div className="flex gap-6 text-sm">
                          {modulo.estado && (
                            <div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Activity className="w-4 h-4" />
                                <span>Estado</span>
                              </div>
                              <p className="font-semibold text-gray-900">{modulo.estado}</p>
                            </div>
                          )}
                          {modulo.duracion && (
                            <div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Duración</span>
                              </div>
                              <p className="font-semibold text-gray-900">{modulo.duracion}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className="text-gray-700 mt-4 leading-relaxed" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                        {isExpanded ? modulo.descripcion : truncateDescription(modulo.descripcion)}
                      </p>

                      {/* Mensaje si el modulo está bloqueado */}
                      {!moduloEstaDisponible && (
                        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                          <p className="text-sm text-yellow-800" style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>
                            <strong>🔒 Modulo bloqueado:</strong> Debes completar el modulo anterior para desbloquear este modulo.
                          </p>
                        </div>
                      )}

                      {/* Enfoques */}
                      {isExpanded && modulo.enfoques?.length > 0 && (
                        <div className="mt-5 space-y-3">
                          {modulo.enfoques.map((enfoque, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 text-gray-700 leading-relaxed"
                            >
                              <span className="text-[#59D22E] font-bold">•</span>
                              <span style={{ fontFamily: "'Ample Soft Pro', sans-serif", fontWeight: 300 }}>{enfoque}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Barra de progreso - Siempre visible en todas las tarjetas */}
                      {(() => {
                        const progreso = getProgresoModulo(modulo.titulo);
                        // Asegurarse de que el progreso sea un número válido entre 0 y 100
                        const progresoNumerico = typeof progreso === 'number' && !isNaN(progreso)
                          ? Math.max(0, Math.min(100, progreso))
                          : 0;

                        return (
                          <div className="mt-6 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Progreso del modulo</span>
                              <span className="text-sm font-bold text-[#006837]">
                                {loadingProgreso ? '...' : `${Math.round(progresoNumerico)}%`}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              {loadingProgreso ? (
                                <div className="h-full bg-gray-200 animate-pulse rounded-full" />
                              ) : (
                                <motion.div
                                  className="h-full bg-gradient-to-r from-[#59D22E] to-[#A5E811] rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progresoNumerico}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Botones */}
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <Button
                          onClick={() => handleComenzar(modulo, moduloEstaDisponible)}
                          disabled={!moduloEstaDisponible}
                          className={`w-full sm:w-auto rounded-full px-8 py-5 text-base ${moduloEstaDisponible
                            ? 'bg-gradient-to-r from-[#59D22E] to-[#A5E811] hover:from-[#A5E811] hover:to-[#59D22E] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          {moduloEstaDisponible ? (
                            <>
                              <LockOpen className="w-4 h-4 mr-2" />
                              Comenzar
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Bloqueado
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          onClick={() => toggleExpanded(modulo.id)}
                          variant="outline"
                          className="w-full sm:w-auto rounded-full border-gray-200 text-gray-900 hover:bg-gray-50 px-8 py-5 text-base flex items-center justify-center gap-2"
                        >
                          {isExpanded ? (
                            <>
                              Ver menos
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Ver más
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ModulosPage;
