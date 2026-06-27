import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { ChevronRight, Home, ArrowLeft, CheckCircle, XCircle, RotateCcw, ClipboardList, ChevronDown, LogOut } from 'lucide-react';

import { motion } from 'framer-motion';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'

// Funci�n para aleatorizar array

const shuffleArray = (array) => {

  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

  }

  return shuffled;

};

// Orden correcto de los pasos

const ordenCorrecto = [

  'detectar-problema',

  'pensar-opciones',

  'comparar-elegir',

  'actuar-revisar'

];

// Tarjetas con im�genes (orden aleatorio inicial)

const tarjetasIniciales = [

  {

    id: 't1',

    pasoId: 'detectar-problema',

    nombre: 'Detectar el problema',

    imagen: '/Modulo10/tarjetas modulo 10/detectar el problema.jpeg',

    texto: 'El l�der observa que las ventas han bajado y que el contenido en redes sociales no est� generando interacci�n. El equipo est� desmotivado.'

  },

  {

    id: 't2',

    pasoId: 'pensar-opciones',

    nombre: 'Pensar opciones',

    imagen: '/Modulo10/tarjetas modulo 10/pensar opciones.jpeg',

    texto: '� Redise�ar la imagen de marca\n� Contratar un influencer local o mejorar la narrativa de los productos.\n� Capacitar al equipo en marketing digital.'

  },

  {

    id: 't3',

    pasoId: 'comparar-elegir',

    nombre: 'Comparar y elegir',

    imagen: '/Modulo10/tarjetas modulo 10/comparar y elegir.jpeg',

    texto: 'Se elige capacitar al equipo y mejorar la narrativa de los productos, por ser opciones de bajo costo, sostenibles y alineadas con los valores del emprendimiento.'

  },

  {

    id: 't4',

    pasoId: 'actuar-revisar',

    nombre: 'Actuar y revisar',

    imagen: '/Modulo10/tarjetas modulo 10/actuar y revisar.jpeg',

    texto: 'Tras aplicar las mejoras, se incrementa la interacci�n en redes y el equipo se muestra m�s comprometido. El l�der concluye que empoderar al equipo fue clave para recuperar la conexi�n con el cliente.'

  }

];

const preguntas = [

  {

    id: 1,

    texto: 'El mejor estilo de liderazgo para abordar la problem�tica ser� el liderazgo autoritario.',

    opciones: [

      { id: 'a', texto: 'Verdadero' },

      { id: 'b', texto: 'Falso' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: 'Recuerda que el liderazgo visionario inspira, moviliza y conecta al equipo con una visi�n clara; es ideal para una situaci�n que requiere reactivar la marca.'

  },

  {

    id: 2,

    texto: '�Qu� decisi�n estrat�gica deber�a tomar el l�der para mejorar el marketing digital?',

    opciones: [

      { id: 'a', texto: 'Cambiar el logo sin consultar al equipo' },

      { id: 'b', texto: 'Crear una visi�n compartida y alinear las acciones de marketing' },

      { id: 'c', texto: 'Delegar todo el contenido a un consultor externo' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: 'Recuerda que una visi�n compartida permite que el equipo se alinee, se motive y comunique con coherencia en los canales digitales.'

  },

  {

    id: 3,

    texto: 'La falta de visi�n en la estrategia de marketing digital genera acciones dispersas e incoherentes.',

    opciones: [

      { id: 'a', texto: 'Falso' },

      { id: 'b', texto: 'Verdadero' }

    ],

    respuestaCorrecta: 'b',

    retroalimentacion: 'Recuerda que, sin una visi�n clara, las acciones de marketing no lograr�n posicionar la marca de forma efectiva.'

  },

  {

    id: 4,

    texto: '�Qu� acci�n del l�der puede fortalecer la motivaci�n del equipo en medio de la crisis de marketing digital?',

    opciones: [

      { id: 'a', texto: 'Reconocer los logros individuales y fomentar la participaci�n en las decisiones.' },

      { id: 'b', texto: 'Aumentar la carga de trabajo para acelerar resultados.' }

    ],

    respuestaCorrecta: 'a',

    retroalimentacion: 'Recuerda que reconocer los logros individuales y fomentar la participaci�n en las decisiones fortalece la motivaci�n del equipo, genera compromiso y permite que cada integrante se sienta parte activa de la estrategia de marketing digital.'

  }

];

const PlanNegocioLiderazgoPage = () => {

  const navigate = useNavigate();

  const [ordenTarjetas, setOrdenTarjetas] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_orden_tarjetas');

    if (saved) {

      return JSON.parse(saved);

    }

    return shuffleArray(tarjetasIniciales.map(t => t.id));

  });

  const [validadoDragDrop, setValidadoDragDrop] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_validado_dd');

    return saved === 'true';

  });

  const [respuestasPreguntas, setRespuestasPreguntas] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_respuestas_preguntas');

    return saved ? JSON.parse(saved) : {};

  });

  const [mostrarRetroalimentacion, setmostrarRetroalimentacion] = useState(() => {

    const saved = localStorage.getItem('pn_liderazgo_retroalimentacion');

    return saved ? JSON.parse(saved) : {};

  });

  const [draggedTarjeta, setDraggedTarjeta] = useState(null); // �ndice de la tarjeta siendo arrastrada

  const [dragOver, setDragOver] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('');

  const [userName, setUserName] = useState('');

  const [mostrarReflexionFinal, setmostrarReflexionFinal] = useState(false);

  const isScrolledRef = useRef(false);

useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

useEffect(() => {

    const cargarFotoPerfil = async () => {

      try {

        const token = localStorage.getItem('authToken');

        if (!token) return;

const response = await fetch(`${API_BASE_URL}/student/perfil`, {

          credentials: 'include',

          headers: {

            'Authorization': `Bearer ${token}`

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

  }, []);

useEffect(() => {

    const handleScroll = () => {

      setIsScrolled(window.scrollY > 100);

    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_orden_tarjetas', JSON.stringify(ordenTarjetas));

  }, [ordenTarjetas]);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_validado_dd', validadoDragDrop.toString());

  }, [validadoDragDrop]);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_respuestas_preguntas', JSON.stringify(respuestasPreguntas));

  }, [respuestasPreguntas]);

useEffect(() => {

    localStorage.setItem('pn_liderazgo_retroalimentacion', JSON.stringify(mostrarRetroalimentacion));

  }, [mostrarRetroalimentacion]);

const handleDragStart = (e, index) => {

    setDraggedTarjeta(index);

    e.dataTransfer.effectAllowed = 'move';

  };

const handleContextMenu = (e) => {

    e.preventDefault();

    return false;

  };

const handleDragOver = (e, index) => {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    setDragOver(index);

  };

const handleDragLeave = () => {

    setDragOver(null);

  };

const handleDrop = (e, dropIndex) => {

    e.preventDefault();

    setDragOver(null);

if (draggedTarjeta === null || draggedTarjeta === dropIndex) {

      setDraggedTarjeta(null);

      return;

    }

if (validadoDragDrop) {

      setValidadoDragDrop(false);

      setmostrarReflexionFinal(false);

    }

const newOrden = [...ordenTarjetas];

    const [removed] = newOrden.splice(draggedTarjeta, 1);

    newOrden.splice(dropIndex, 0, removed);

    setOrdenTarjetas(newOrden);

    setDraggedTarjeta(null);

  };

const handleValidateDragDrop = async () => {

    setValidadoDragDrop(true);

    setmostrarReflexionFinal(true);

// Verificar si el orden es correcto

    const isCorrect = ordenTarjetas.every((tarjetaId, index) => {

      const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

      return tarjeta && tarjeta.pasoId === ordenCorrecto[index];

    });

if (isCorrect) {

      try {

        const token = localStorage.getItem('authToken');

// Registrar progreso para completar el m�dulo (100%)

        const apiUrl = import.meta.env.MODE === 'production'

          ? `${API_BASE_URL}/registrar-progreso-modulo`

          : `${API_BASE_URL}/registrar-progreso-modulo`;

await fetch(apiUrl, {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

            'Authorization': `Bearer ${token}`

          },

          body: JSON.stringify({

            modulo_nombre: 'Liderazgo',

            paso_nombre: 'Plan de Negocio',

            curso_nombre: 'Liderazgo'

          })

        });

console.log('Progreso de Liderazgo registrado (Plan de Negocio completado)');

        window.dispatchEvent(new Event('progreso-actualizado'));

} catch (error) {

        console.error("Error al registrar progreso de Liderazgo:", error);

      }

    }

  };

const handleResetDragDrop = () => {

    setOrdenTarjetas(shuffleArray(tarjetasIniciales.map(t => t.id)));

    setValidadoDragDrop(false);

    setmostrarReflexionFinal(false);

    localStorage.removeItem('pn_liderazgo_orden_tarjetas');

    localStorage.removeItem('pn_liderazgo_validado_dd');

  };

const handlePreguntaChange = (preguntaId, opcionId) => {

    setRespuestasPreguntas(prev => ({

      ...prev,

      [preguntaId]: opcionId

    }));

    setmostrarRetroalimentacion(prev => ({

      ...prev,

      [preguntaId]: true

    }));

  };

const esOrdenCorrecto = () => {

    if (!validadoDragDrop) return false;

    return ordenTarjetas.every((tarjetaId, index) => {

      const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

      return tarjeta && tarjeta.pasoId === ordenCorrecto[index];

    });

  };

const esTarjetaCorrecta = (index) => {

    if (!validadoDragDrop) return false;

    const tarjetaId = ordenTarjetas[index];

    const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

    return tarjeta && tarjeta.pasoId === ordenCorrecto[index];

  };

const esTarjetaIncorrecta = (index) => {

    if (!validadoDragDrop) return false;

    const tarjetaId = ordenTarjetas[index];

    const tarjeta = tarjetasIniciales.find(t => t.id === tarjetaId);

    return tarjeta && tarjeta.pasoId !== ordenCorrecto[index];

  };

