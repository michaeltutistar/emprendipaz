import { getAuthToken } from '@/utils/auth-storage';
import React, { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ArrowLeft, Home, ChevronRight, Upload, Image as ImageIcon } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';



const PlanNegocioModeloNegociosPage = () => {

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const isScrolledRef = useRef(false);

  const [formData, setFormData] = useState(() => {

    let saved = null;
    try {
      saved = localStorage.getItem('plan_negocio_modelo_negocios');
    } catch (e) {
      // Si localStorage no está disponible o falla, continuamos sin persistencia.
      saved = null;
    }

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Si el JSON quedó corrupto/recortado, ignorarlo.
      }
    }

    return {

      pregunta1: '',

      pregunta2: '',

      pregunta3: '',

      pregunta4: '',

      pregunta5: '',

      pregunta6: '',

      pregunta7: '',

      imagenUrl: '',

      imagenFile: null

    };

  });

  const [imagenPreview, setImagenPreview] = useState(formData.imagenUrl || null);

  const [mostrarResultado, setmostrarResultado] = useState(false);



  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);



  useEffect(() => {

    // Persistir sin romper la página si excede cuota (imagenes grandes en base64).
    try {
      localStorage.setItem('plan_negocio_modelo_negocios', JSON.stringify({
        ...formData,
        imagenFile: null // No guardar el archivo en localStorage
      }));
    } catch (e) {
      // Evitar pantalla blanca por QuotaExceededError.
      try {
        localStorage.setItem('plan_negocio_modelo_negocios', JSON.stringify({
          ...formData,
          imagenFile: null,
          imagenUrl: '' // si no cabe, persistimos sin la imagen
        }));
      } catch (_) {
        // Si sigue fallando, no persistimos.
      }
      console.warn('No se pudo persistir plan de negocio en localStorage (posible cuota excedida).', e);
    }

  }, [formData]);

  const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h });
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  const resizeImageFileToDataUrl = async (file, { maxSide = 1600, quality = 0.82 } = {}) => {
    // Redimensiona y comprime para que sea apto para localStorage.
    const { width, height } = await getImageDimensions(file);
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const url = URL.createObjectURL(file);
    try {
      let bitmap = null;
      if ('createImageBitmap' in window) {
        bitmap = await createImageBitmap(file);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener contexto 2D para redimensionar la imagen');

      if (bitmap) {
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        try { bitmap.close?.(); } catch (_) { /* noop */ }
      } else {
        const img = new Image();
        img.src = url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }

      // JPEG suele reducir muchísimo tamaño vs PNG.
      const mime = 'image/jpeg';
      return canvas.toDataURL(mime, quality);
    } finally {
      URL.revokeObjectURL(url);
    }
  };



  // Sincronizar el ref con el estado

  useEffect(() => {

    isScrolledRef.current = isScrolled;

  }, [isScrolled]);



  // Detectar scroll para animar el header

  useEffect(() => {

    let ticking = false;



    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(() => {

          const scrollPosition = window.scrollY;



          if (isScrolledRef.current) {

            if (scrollPosition < 30) {

              isScrolledRef.current = false;

              setIsScrolled(false);

            }

          } else {

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

  }, []);



  const handleInputChange = (field, value) => {

    setFormData(prev => ({

      ...prev,

      [field]: value

    }));

  };



  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      if (file.type.startsWith('image/')) {

        (async () => {
          try {
            // Si la imagen es grande, redimensionar/comprimir antes de guardarla (evita QuotaExceededError).
            // Hacemos un ajuste progresivo hasta que el DataURL quede razonable.
            let dataUrl = null;
            const dims = await getImageDimensions(file).catch(() => null);

            if (dims && (Math.max(dims.width, dims.height) > 1800 || file.size > 1_200_000)) {
              const attempts = [
                { maxSide: 1600, quality: 0.82 },
                { maxSide: 1400, quality: 0.78 },
                { maxSide: 1200, quality: 0.74 },
                { maxSide: 1024, quality: 0.7 },
              ];
              for (const a of attempts) {
                dataUrl = await resizeImageFileToDataUrl(file, a);
                // ~1.6MB en string suele entrar sin problemas en localStorage con el resto del JSON.
                if (dataUrl && dataUrl.length <= 1_600_000) break;
              }
            }

            if (!dataUrl) {
              // Fallback: si no es grande o falla el resize, usamos FileReader normal.
              dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            }

            setImagenPreview(dataUrl);
            setFormData(prev => ({
              ...prev,
              imagenFile: file,
              imagenUrl: dataUrl
            }));
          } catch (error) {
            console.error('Error al procesar imagen:', error);
            alert('No se pudo procesar la imagen. Intenta con otra imagen o una de menor tamaño.');
          }
        })();

      } else {

        alert('Por favor selecciona un archivo de imagen válido');

      }

    }

  };



  // Función para calcular puntos según las respuestas

  const calcularPuntos = () => {

    let puntosTotales = 0;



    // Pregunta 1: cualquier respuesta = 1 punto

    if (formData.pregunta1 && formData.pregunta1.trim() !== '') {

      puntosTotales += 1;

    }



    // Pregunta 2: a) 5 puntos, b) 3 puntos, c) 4 puntos

    if (formData.pregunta2) {

      if (formData.pregunta2.startsWith('a)')) {

        puntosTotales += 5;

      } else if (formData.pregunta2.startsWith('b)')) {

        puntosTotales += 3;

      } else if (formData.pregunta2.startsWith('c)')) {

        puntosTotales += 4;

      }

    }



    // Pregunta 3: a) 4 puntos, b) 3 puntos, c) 5 puntos

    if (formData.pregunta3) {

      if (formData.pregunta3.startsWith('a)')) {

        puntosTotales += 4;

      } else if (formData.pregunta3.startsWith('b)')) {

        puntosTotales += 3;

      } else if (formData.pregunta3.startsWith('c)')) {

        puntosTotales += 5;

      }

    }



    // Pregunta 4: a) 4 puntos, b) 3 puntos, c) 5 puntos

    if (formData.pregunta4) {

      if (formData.pregunta4.startsWith('a)')) {

        puntosTotales += 4;

      } else if (formData.pregunta4.startsWith('b)')) {

        puntosTotales += 3;

      } else if (formData.pregunta4.startsWith('c)')) {

        puntosTotales += 5;

      }

    }



    // Pregunta 5: a) 4 puntos, b) 5 puntos, c) 3 puntos

    if (formData.pregunta5) {

      if (formData.pregunta5.startsWith('a)')) {

        puntosTotales += 4;

      } else if (formData.pregunta5.startsWith('b)')) {

        puntosTotales += 5;

      } else if (formData.pregunta5.startsWith('c)')) {

        puntosTotales += 3;

      }

    }



    // Pregunta 6: a) 4 puntos, b) 5 puntos, c) 3 puntos

    if (formData.pregunta6) {

      if (formData.pregunta6.startsWith('a)')) {

        puntosTotales += 4;

      } else if (formData.pregunta6.startsWith('b)')) {

        puntosTotales += 5;

      } else if (formData.pregunta6.startsWith('c)')) {

        puntosTotales += 3;

      }

    }



    // Pregunta 7: a) 5 puntos, b) 4 puntos, c) 3 puntos

    if (formData.pregunta7) {

      if (formData.pregunta7.startsWith('a)')) {

        puntosTotales += 5;

      } else if (formData.pregunta7.startsWith('b)')) {

        puntosTotales += 4;

      } else if (formData.pregunta7.startsWith('c)')) {

        puntosTotales += 3;

      }

    }



    return puntosTotales;

  };



  const handleGenerar = () => {

    // Validar que todas las preguntas estén respondidas

    const preguntas = ['pregunta1', 'pregunta2', 'pregunta3', 'pregunta4', 'pregunta5', 'pregunta6', 'pregunta7'];

    const faltanRespuestas = preguntas.some(p => !formData[p] || formData[p].trim() === '');



    if (faltanRespuestas) {

      alert('Por favor responde todas las preguntas antes de generar el resultado');

      return;

    }



    if (!imagenPreview) {

      alert('Por favor sube una imagen de tu producto antes de generar el resultado');

      return;

    }



    setmostrarResultado(true);

  };



  const preguntas = [

    {

      id: 'pregunta1',

      texto: '¿A qué sector pertenece tu emprendimiento?',

      opciones: [

        'a) Agricultura, ganadería y alimentos (por ejemplo: cultivo de café, panadería, producción de lácteos).',

        'b) Industria y manufactura (por ejemplo: confección de ropa, carpintería, fabricación de muebles).',

        'c) Comercio y ventas (por ejemplo: tienda de barrio, venta por catálogo, ferretería).',

        'd) Turismo y hospitalidad (por ejemplo: hotel familiar, agencia de viajes, restaurante típico).',

        'e) Educación y formación (por ejemplo: cursos virtuales, academia de idiomas, talleres de oficios).',

        'f) Salud y bienestar (por ejemplo: consultorio odontológico, gimnasio, spa).',

        'g) Tecnología y servicios digitales (por ejemplo: diseño web, venta online, desarrollo de apps).',

        'h) Cultura, arte y entretenimiento (por ejemplo: grupo musical, artesanías, organización de eventos).'

      ]

    },

    {

      id: 'pregunta2',

      texto: '¿Qué diferencia principal tiene mi producto frente a la competencia?',

      opciones: [

        'a) Su innovación y originalidad.',

        'b) Su precio accesible.',

        'c) Su durabilidad y calidad superior.'

      ]

    },

    {

      id: 'pregunta3',

      texto: '¿Qué necesidad o problema resuelve mi producto en el cliente?',

      opciones: [

        'a) Ahorra tiempo o esfuerzo.',

        'b) Mejora la experiencia o comodidad.',

        'c) Reduce costos o gastos.'

      ]

    },

    {

      id: 'pregunta4',

      texto: '¿Qué aspecto genera mayor confianza en mi producto?',

      opciones: [

        'a) La calidad comprobada de los materiales.',

        'b) La recomendación de otros clientes.',

        'c) La garantía o respaldo ofrecido.'

      ]

    },

    {

      id: 'pregunta5',

      texto: '¿Qué valor emocional aporta mi producto al cliente?',

      opciones: [

        'a) Orgullo de consumir algo único/local.',

        'b) Seguridad y tranquilidad en su uso.',

        'c) Alegría y satisfacción personal.'

      ]

    },

    {

      id: 'pregunta6',

      texto: '¿Qué característica hace que mi producto sea más atractivo en el mercado?',

      opciones: [

        'a) Su diseño innovador o estético.',

        'b) Su funcionalidad práctica.',

        'c) Su relación costo-beneficio.'

      ]

    },

    {

      id: 'pregunta7',

      texto: '¿Qué compromiso adicional refuerza mi propuesta de valor?',

      opciones: [

        'a) Sostenibilidad y cuidado del medio ambiente.',

        'b) Atención personalizada al cliente.',

        'c) Rapidez en la entrega o disponibilidad.'

      ]

    }

  ];



  // Mapeo de respuestas a cuadros alrededor de la imagen

  const cuadrosPosiciones = [

    { posicion: 'top', pregunta: 'pregunta1', label: 'Sector' },

    { posicion: 'right', pregunta: 'pregunta2', label: 'Diferencia' },

    { posicion: 'bottom', pregunta: 'pregunta3', label: 'Necesidad' },

    { posicion: 'left', pregunta: 'pregunta4', label: 'Confianza' },

    { posicion: 'top-right', pregunta: 'pregunta5', label: 'Valor Emocional' },

    { posicion: 'bottom-right', pregunta: 'pregunta6', label: 'Atractivo' },

    { posicion: 'bottom-left', pregunta: 'pregunta7', label: 'Compromiso' }

  ];



  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* Header con scroll dinámico */}

      <div className="sticky top-0 z-50">

        <motion.header

          className="relative text-white py-2 px-8 overflow-hidden min-h-[60px]"

          animate={{

            minHeight: isScrolled ? '60px' : '60px',

            paddingTop: isScrolled ? '0.5rem' : '0.5rem',

            paddingBottom: isScrolled ? '0.5rem' : '0.5rem',

          }}

          transition={{ duration: 0.3 }}

        >

          {/* CAPA FONDO 1: Degradado animado */}

          <motion.div

            className="absolute inset-0"

            style={{

              background: 'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

            }}

            animate={{

              background: [

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 30% 70%, #59D22E 0%, #006837 100%)',

                'radial-gradient(ellipse at 70% 30%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #006837 0%, #59D22E 100%)',

                'radial-gradient(ellipse at 50% 50%, #59D22E 0%, #006837 100%)',

              ],

            }}

            transition={{

              duration: 15,

              ease: "easeInOut",

              repeat: Infinity,

            }}

          />



          {/* CAPA FONDO 2: Patrón de hojas verdes */}

          <div

            className="absolute inset-0 flex items-center justify-center"

            style={{

              mixBlendMode: 'overlay',

              opacity: 0.4,

            }}

          >

            <img

              src="https://i.ibb.co/bjnFfp1v/ELEMENTOS-FONDO-01.png"

              alt=""

              className="w-[160%] h-auto object-cover"

            />

          </div>



          {/* Hojas animadas */}

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[8%] w-12 h-12"

            animate={{

              x: [0, 140],

              y: [80, -36],

              opacity: [0, 0.9, 0.9, 0],

            }}

            transition={{

              duration: 3.5,

              repeat: Infinity,

              ease: "linear",

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/Y7SYnvCB/Asset-5-4x-8.png"

            alt=""

            className="absolute right-[28%] w-10 h-10"

            animate={{

              x: [0, 133],

              y: [80, -30],

              opacity: [0, 0.7, 0.7, 0],

            }}

            transition={{

              duration: 4.5,

              repeat: Infinity,

              ease: "linear",

              delay: 1,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[10%] w-11 h-11"

            animate={{

              x: [0, 137],

              y: [80, -33],

              opacity: [0, 0.85, 0.85, 0],

            }}

            transition={{

              duration: 4,

              repeat: Infinity,

              ease: "linear",

              delay: 0.5,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/BH43Yvxc/Asset-4-4x-8.png"

            alt=""

            className="absolute left-[5%] w-13 h-13"

            animate={{

              x: [0, 146],

              y: [80, -42],

              opacity: [0, 0.6, 0.6, 0],

            }}

            transition={{

              duration: 5,

              repeat: Infinity,

              ease: "linear",

              delay: 1.5,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute left-[15%] w-8 h-8"

            animate={{

              x: [0, 127],

              y: [80, -27],

              opacity: [0, 0.75, 0.75, 0],

            }}

            transition={{

              duration: 3,

              repeat: Infinity,

              ease: "linear",

              delay: 2,

              times: [0, 0.1, 0.85, 1],

            }}

          />

          <motion.img

            src="https://i.ibb.co/Q3KdHVTX/Asset-3-4x-8.png"

            alt=""

            className="absolute right-[40%] w-7 h-7"

            animate={{

              x: [0, 120],

              y: [80, -24],

              opacity: [0, 0.8, 0.8, 0],

            }}

            transition={{

              duration: 3.8,

              repeat: Infinity,

              ease: "linear",

              delay: 0.8,

              times: [0, 0.1, 0.85, 1],

            }}

          />



          {/* CAPA FRONTAL: Contenido */}

          <div className="max-w-7xl mx-auto relative z-20">

            <div className="flex items-center justify-between">

              {/* Logo */}

              <div>

                <motion.div

                  className="flex items-center justify-start"

                  initial={{ opacity: 0, x: -20 }}

                  animate={{ opacity: 1, x: 0 }}

                  transition={{ duration: 0.8, ease: "easeOut" }}

                >

                  <img

                    src="/formacion.png"

                    alt="Formación Logo"

                    onClick={() => navigate('/student/dashboard')}

                    className="h-10 w-auto object-contain drop-shadow-2xl cursor-pointer hover:opacity-80"

                    style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}

                  />

                </motion.div>

              </div>



              {/* Título del Modulo - Centro (solo visible cuando hay scroll) */}

              {isScrolled && (

                <motion.div

                  className="absolute left-1/2 transform -translate-x-1/2"

                  initial={{ opacity: 0, y: -10 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.3 }}

                >

                  <div className="text-center">

                    <h1

                      className="text-white whitespace-nowrap"

                      style={{

                        fontFamily: 'var(--font-heading)',

                        fontSize: '1.25rem',

                        fontWeight: 700,

                        letterSpacing: '-0.01em',

                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',

                      }}

                    >

                      Modelo de Negocios

                    </h1>

                    <p className="text-white/70 text-xs mt-0.5 uppercase tracking-wide">

                      Plan de Negocio

                    </p>

                  </div>

                </motion.div>

              )}



              {/* Menú de usuario - Derecha */}

              <div className="flex justify-end">

                <button

                  onClick={() => navigate('/student/perfil')}

                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"

                >

                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">

                    <span className="text-white font-semibold text-sm">U</span>

                  </div>

                </button>

              </div>

            </div>

          </div>

        </motion.header>

      </div>



      {/* Breadcrumb sticky cuando hay scroll */}

      {isScrolled && (

        <motion.div

          className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"

          initial={{ opacity: 0, y: -10 }}

          animate={{ opacity: 1, y: 0 }}

        >

          <div className="max-w-7xl mx-auto px-8 py-3">

            <div className="flex items-center gap-2 text-sm">

              <button onClick={() => navigate('/student/dashboard')} className="text-gray-600 hover:text-[#AA27B9] transition-colors flex items-center gap-1">

                <Home className="w-3.5 h-3.5" />

                Inicio

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/modulos')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Modulos

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <button onClick={() => navigate('/student/modelo-negocios')} className="text-gray-600 hover:text-[#AA27B9] transition-colors">

                Modelo de Negocios

              </button>

              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <span className="text-[#AA27B9] font-bold text-base">

                Plan de Negocio

              </span>

            </div>

          </div>

        </motion.div>

      )}



      {/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#AA27B9] via-[#9d24ab] to-[#8E1FA3] py-8 px-8">

        {/* Blobs */}

        <div className="absolute inset-0 overflow-hidden">

          <motion.div

            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"

            style={{ background: 'radial-gradient(circle, #FFEB3B 0%, transparent 70%)' }}

            animate={{ scale: [1, 1.2, 1] }}

            transition={{ duration: 15, repeat: Infinity }}

          />

        </div>



        <div className="max-w-7xl mx-auto relative z-10">

          {/* Breadcrumbs - Solo visible cuando NO hay scroll */}

          {!isScrolled && (

            <motion.div

              initial={{ opacity: 0, y: -10 }}

              animate={{ opacity: 1, y: 0 }}

              className="flex items-center gap-2 text-white/80 mb-6"

            >

              <button onClick={() => navigate('/student/dashboard')} className="hover:text-white transition-colors flex items-center gap-1">

                <Home className="w-4 h-4" />

                Inicio

              </button>

              <ChevronRight className="w-4 h-4" />

              <button onClick={() => navigate('/student/modulos')} className="hover:text-white transition-colors">

                Modulos

              </button>

              <ChevronRight className="w-4 h-4" />

              <button onClick={() => navigate('/student/modelo-negocios')} className="hover:text-white transition-colors">

                Modelo de Negocios

              </button>

              <ChevronRight className="w-4 h-4" />

              <span className="text-white font-semibold">Plan de Negocio</span>

            </motion.div>

          )}



          {/* Title */}

          <motion.div

            initial={{ opacity: 0, x: -20 }}

            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.6 }}

          >

            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">

              <span className="text-white text-sm font-medium">MÓDULO 3</span>

            </div>



            <h1

              className="text-white"

              style={{

                fontFamily: 'var(--font-heading)',

                fontSize: 'clamp(2rem, 4vw, 3rem)',

                fontWeight: 800,

                letterSpacing: '-0.02em',

              }}

            >

              Plan de Negocio - Modelo de Negocios

            </h1>

          </motion.div>

        </div>



        {/* Wave */}

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">

            <path d="M0 0L60 5C120 10 240 20 360 23.3C480 26.5 600 23.5 720 21.7C840 20 960 20 1080 23.3C1200 26.5 1320 33.5 1380 36.7L1440 40V60H0V0Z" fill="white" />

          </svg>

        </div>

      </section>



      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-8">

          {/* Contenido Introductorio */}

          <div className="space-y-6">

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">

              Modelo de negocio: "Propuesta de valor"

            </h2>



            <div className="prose max-w-none space-y-4">

              <p className="text-gray-700 text-base leading-relaxed">

                Ahora que ya has culminado exitosamente el desarrollo de las 3 unidades del modulo de Modelos de Negocios, es momento de elaborar el aporte de este modulo a tu plan de negocios.

              </p>

              <p className="text-gray-700 text-base leading-relaxed">

                Recuerda que La propuesta de valor es la razón por la cual un cliente elige tu producto o servicio y no otro. Es aquello que lo hace especial, diferente y útil para las personas.

              </p>

              <p className="text-gray-700 text-base leading-relaxed">

                Vamos a identificar que atributos caracterizan a tu producto a través del siguiente cuestionario, deberás seleccionar una opción de respuesta para cada pregunta, no hay respuestas correctas o incorrectas, simplemente elige la que mejor describa a tu producto.

              </p>

            </div>

          </div>



          {/* Carga de Imagen */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Imagen de tu Producto</h3>



            <div className="space-y-4 mb-6">

              <p className="text-gray-700 text-base leading-relaxed">

                Sube una imagen de tu producto desde tu dispositivo. Esta imagen aparecerá en el centro del resultado esperado.

              </p>



              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">

                <input

                  ref={fileInputRef}

                  type="file"

                  accept="image/*"

                  onChange={handleFileChange}

                  className="hidden"

                />



                {imagenPreview ? (

                  <div className="space-y-4">

                    <div className="flex justify-center">

                      <img

                        src={imagenPreview}

                        alt="Preview del producto"

                        className="max-w-full max-h-64 rounded-lg shadow-md"

                      />

                    </div>

                    <Button

                      onClick={() => {

                        fileInputRef.current?.click();

                      }}

                      className="bg-green-600 hover:bg-green-700 text-white"

                    >

                      <Upload className="w-4 h-4 mr-2" />

                      Cambiar Imagen

                    </Button>

                  </div>

                ) : (

                  <div className="space-y-4">

                    <ImageIcon className="w-16 h-16 mx-auto text-gray-400" />

                    <p className="text-gray-600">No hay imagen seleccionada</p>

                    <Button

                      onClick={() => {

                        fileInputRef.current?.click();

                      }}

                      className="bg-green-600 hover:bg-green-700 text-white"

                    >

                      <Upload className="w-4 h-4 mr-2" />

                      Subir Imagen

                    </Button>

                  </div>

                )}

              </div>

            </div>

          </div>



          {/* Cuestionario */}

          <div className="border-t pt-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Cuestionario</h3>



            <div className="space-y-6 mb-6">

              {preguntas.map((pregunta, index) => (

                <div key={pregunta.id} className="border border-gray-300 rounded-lg p-4">

                  <label className="block text-sm font-semibold text-gray-900 mb-3">

                    {index + 1}. {pregunta.texto}

                  </label>

                  <div className="space-y-2">

                    {pregunta.opciones.map((opcion, idx) => (

                      <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">

                        <input

                          type="radio"

                          name={pregunta.id}

                          value={opcion}

                          checked={formData[pregunta.id] === opcion}

                          onChange={(e) => handleInputChange(pregunta.id, e.target.value)}

                          className="mt-1"

                        />

                        <span className="text-sm text-gray-700">{opcion}</span>

                      </label>

                    ))}

                  </div>

                </div>

              ))}

            </div>

          </div>



          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">

            <p className="text-green-900 font-semibold mb-2">RESULTADO ESPERADO</p>

            <p className="text-green-800 text-sm">Diagrama con tu imagen de producto en el centro y los atributos de tu propuesta de valor alrededor</p>

          </div>



          <Button

            onClick={handleGenerar}

            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"

          >

            Generar Resultado

          </Button>

        </div>



        {/* Resultado Esperado */}

        {mostrarResultado && imagenPreview && (

          <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Resultado Esperado</h3>



            <div className="relative flex items-center justify-center min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-12 overflow-hidden">

              {/* Imagen central */}

              <div className="relative z-10">

                <div className="bg-white rounded-lg p-4 shadow-xl">

                  <img

                    src={imagenPreview}

                    alt="Producto"

                    className="w-72 h-72 object-contain rounded-lg"

                  />

                </div>

              </div>



              {/* Cuadros alrededor de la imagen */}

              {cuadrosPosiciones.map((cuadro, index) => {

                const respuesta = formData[cuadro.pregunta];

                if (!respuesta) return null;



                // Extraer solo la respuesta sin la letra (a), b), etc.)

                const respuestaLimpia = respuesta.replace(/^[a-h]\)\s*/, '');



                // Calcular posición basada en la posición especificada

                let positionClasses = '';

                let transform = '';



                switch (cuadro.posicion) {

                  case 'top':

                    positionClasses = 'top-8 left-1/2';

                    transform = 'translate(-50%, 0)';

                    break;

                  case 'right':

                    positionClasses = 'right-8 top-1/2';

                    transform = 'translate(0, -50%)';

                    break;

                  case 'bottom':

                    positionClasses = 'bottom-8 left-1/2';

                    transform = 'translate(-50%, 0)';

                    break;

                  case 'left':

                    positionClasses = 'left-8 top-1/2';

                    transform = 'translate(0, -50%)';

                    break;

                  case 'top-right':

                    positionClasses = 'top-8 right-8';

                    transform = 'translate(0, 0)';

                    break;

                  case 'bottom-right':

                    positionClasses = 'bottom-8 right-8';

                    transform = 'translate(0, 0)';

                    break;

                  case 'bottom-left':

                    positionClasses = 'bottom-8 left-8';

                    transform = 'translate(0, 0)';

                    break;

                  default:

                    positionClasses = 'top-8 left-8';

                }



                return (

                  <div

                    key={index}

                    className={`absolute ${positionClasses}`}

                    style={{ transform }}

                  >

                    <div className="bg-white border-2 border-green-600 rounded-lg p-4 shadow-xl max-w-[220px] hover:shadow-2xl transition-shadow">

                      <div className="text-sm font-bold text-green-800 mb-2 border-b border-green-200 pb-1">

                        {cuadro.label}

                      </div>

                      <div className="text-xs text-gray-700 leading-relaxed">

                        {respuestaLimpia}

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          </div>

        )}



        {/* Botón para finalizar plan de negocio */}

        {mostrarResultado && (

          <div className="mt-8 text-center">

            <Button

              onClick={async () => {

                try {

                  const token = getAuthToken();



                  // Calcular puntos totales

                  const puntosTotales = calcularPuntos();



                  // Preparar respuestas con puntos para enviar al backend

                  const respuestasConPuntos = [];



                  // Pregunta 1: cualquier respuesta = 1 punto

                  if (formData.pregunta1) {

                    respuestasConPuntos.push({

                      pregunta: 'pregunta1',

                      respuesta: formData.pregunta1,

                      puntos: 1

                    });

                  }



                  // Pregunta 2: a) 5, b) 3, c) 4

                  if (formData.pregunta2) {

                    let puntos = 0;

                    if (formData.pregunta2.startsWith('a)')) puntos = 5;

                    else if (formData.pregunta2.startsWith('b)')) puntos = 3;

                    else if (formData.pregunta2.startsWith('c)')) puntos = 4;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta2',

                      respuesta: formData.pregunta2,

                      puntos: puntos

                    });

                  }



                  // Pregunta 3: a) 4, b) 3, c) 5

                  if (formData.pregunta3) {

                    let puntos = 0;

                    if (formData.pregunta3.startsWith('a)')) puntos = 4;

                    else if (formData.pregunta3.startsWith('b)')) puntos = 3;

                    else if (formData.pregunta3.startsWith('c)')) puntos = 5;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta3',

                      respuesta: formData.pregunta3,

                      puntos: puntos

                    });

                  }



                  // Pregunta 4: a) 4, b) 3, c) 5

                  if (formData.pregunta4) {

                    let puntos = 0;

                    if (formData.pregunta4.startsWith('a)')) puntos = 4;

                    else if (formData.pregunta4.startsWith('b)')) puntos = 3;

                    else if (formData.pregunta4.startsWith('c)')) puntos = 5;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta4',

                      respuesta: formData.pregunta4,

                      puntos: puntos

                    });

                  }



                  // Pregunta 5: a) 4, b) 5, c) 3

                  if (formData.pregunta5) {

                    let puntos = 0;

                    if (formData.pregunta5.startsWith('a)')) puntos = 4;

                    else if (formData.pregunta5.startsWith('b)')) puntos = 5;

                    else if (formData.pregunta5.startsWith('c)')) puntos = 3;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta5',

                      respuesta: formData.pregunta5,

                      puntos: puntos

                    });

                  }



                  // Pregunta 6: a) 4, b) 5, c) 3

                  if (formData.pregunta6) {

                    let puntos = 0;

                    if (formData.pregunta6.startsWith('a)')) puntos = 4;

                    else if (formData.pregunta6.startsWith('b)')) puntos = 5;

                    else if (formData.pregunta6.startsWith('c)')) puntos = 3;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta6',

                      respuesta: formData.pregunta6,

                      puntos: puntos

                    });

                  }



                  // Pregunta 7: a) 5, b) 4, c) 3

                  if (formData.pregunta7) {

                    let puntos = 0;

                    if (formData.pregunta7.startsWith('a)')) puntos = 5;

                    else if (formData.pregunta7.startsWith('b)')) puntos = 4;

                    else if (formData.pregunta7.startsWith('c)')) puntos = 3;

                    respuestasConPuntos.push({

                      pregunta: 'pregunta7',

                      respuesta: formData.pregunta7,

                      puntos: puntos

                    });

                  }



                  // 1. Guardar respuestas de forma persistente en el backend

                  const dataToSave = {

                    modulo_nombre: 'Modelo de Negocios',

                    respuestas: {

                      ...formData,

                      imagenFile: null // No enviar el archivo binario

                    }

                  };



                  await fetch('https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api/save-respuestas-plan', {

                    method: 'POST',

                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },

                    body: JSON.stringify(dataToSave)

                  });



                  // 2. Registrar puntos del plan de negocio (mantiene compatibilidad con sistema de puntos actual)
                  if (respuestasConPuntos.length > 0) {
                    const puntosRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api'}/registrar-puntos-plan-negocio`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                      body: JSON.stringify({
                        modulo_nombre: 'Modelo de Negocios',
                        estrategias: respuestasConPuntos.map(r => ({
                          etapa: r.pregunta,
                          estrategia: r.respuesta,
                          puntos: r.puntos
                        }))
                      })
                    });
                    const puntosData = await puntosRes.json().catch(() => ({}));
                    if (!puntosRes.ok || !puntosData.success) {
                      console.error('Error registrando puntos plan negocio:', puntosRes.status, puntosData);
                      alert('No se pudieron guardar los puntos. Revisa tu conexión e intenta de nuevo.');
                      return;
                    }
                  }



                  // Registrar progreso del modulo
                  const progRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api'}/registrar-progreso-modulo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                    body: JSON.stringify({
                      modulo_nombre: 'Modelo de Negocios',
                      paso_nombre: 'Plan de Negocio',
                      curso_nombre: 'Modelo de Negocios'
                    })
                  });

                  localStorage.setItem('modelo_negocios_plan_negocio_completado', 'true');
                  window.dispatchEvent(new Event('progreso-actualizado'));
                  alert('¡Plan de Negocio completado! El siguiente modulo ha sido desbloqueado.');
                  navigate('/student/modulos');
                } catch (error) {
                  console.error('Error al registrar progreso:', error);
                  alert('Error al guardar. Revisa la consola e intenta de nuevo.');
                }

              }}

              className="bg-gradient-to-r from-[#AA27B9] to-[#FFEB3B] hover:from-[#FFEB3B] hover:to-[#AA27B9] text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105"

            >

              Finalizar Plan de Negocio

            </Button>

          </div>

        )}

      </div>



      <motion.div

        initial={{ opacity: 0, x: -20 }}

        animate={{ opacity: 1, x: 0 }}

        className="fixed bottom-8 left-8 z-40"

      >

        <Button

          onClick={() => {

            window.scrollTo(0, 0);

            navigate('/student/modelo-negocios');

          }}

          className="bg-white hover:bg-gray-100 text-[#AA27B9] border-2 border-[#AA27B9] rounded-full px-6 py-3 flex items-center gap-2 shadow-2xl font-bold transition-all transform hover:scale-105"

        >

          <ArrowLeft className="w-5 h-5" />

          Atrás

        </Button>

      </motion.div>



      <Footer />

    </div>

  );

};



export default PlanNegocioModeloNegociosPage;



