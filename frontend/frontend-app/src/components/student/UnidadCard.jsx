import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Lock, LockOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente estandarizado para tarjetas de unidades
 * 
 * @param {Object} props
 * @param {number} props.unidadNumero - Número de la unidad (1, 2, 3, etc.)
 * @param {string} props.titulo - Título de la unidad
 * @param {string} props.descripcion - Descripción de la unidad
 * @param {boolean} props.estaCompletada - Si la unidad está al 100%
 * @param {boolean} props.estaDisponible - Si la unidad está desbloqueada (puede accederse)
 * @param {boolean} props.unidadAnteriorCompletada - Si la unidad anterior está completada (para desbloquear)
 * @param {number} props.progreso - Porcentaje de progreso de la unidad (0-100). Si no se proporciona, se calcula automáticamente
 * @param {string} props.ruta - Ruta de navegación al hacer clic
 * @param {number} props.delay - Delay para animación de entrada (default: 0.1)
 * @param {string} props.textoBotonCompletada - Texto del botón cuando está completada (default: "Revisar Unidad")
 * @param {string} props.textoBotonActiva - Texto del botón cuando está activa (default: "Continuar")
 */
const UnidadCard = ({
  unidadNumero,
  titulo,
  descripcion,
  estaCompletada = false,
  estaDisponible = true,
  unidadAnteriorCompletada = true,
  progreso = null,
  ruta,
  delay = 0.1,
  textoBotonCompletada = "Revisar Unidad",
  textoBotonActiva = "Continuar"
}) => {
  const navigate = useNavigate();
  
  // Determinar el estado de la unidad
  const esActiva = estaDisponible && unidadAnteriorCompletada && !estaCompletada;
  const esCompletada = estaCompletada;
  const estaBloqueada = !estaDisponible || !unidadAnteriorCompletada;
  
  // Calcular el porcentaje de progreso: usar el prop si está disponible, sino calcular basado en estaCompletada
  const porcentajeProgreso = progreso !== null ? Math.min(100, Math.max(0, progreso)) : (estaCompletada ? 100 : 0);

  // Estilos y clases según el estado
  const getCardClasses = () => {
    if (esActiva) {
      return "bg-white rounded-3xl border-2 border-[#59D22E] p-8 relative";
    } else if (esCompletada) {
      return "bg-white rounded-3xl border-2 border-[#59D22E] p-8 relative shadow-lg";
    } else {
      return "bg-gray-50 rounded-3xl shadow-lg border border-gray-200 p-8 opacity-60 relative group";
    }
  };

  const getBadgeClasses = () => {
    if (estaBloqueada) {
      return "text-gray-600 font-bold text-sm px-3 py-1 bg-gray-200 rounded-full";
    } else {
      return "text-[#006837] font-bold text-sm px-3 py-1 bg-[#59D22E]/20 rounded-full";
    }
  };

  const getTituloClasses = () => {
    if (estaBloqueada) {
      return "text-gray-700 mb-3";
    } else {
      return "text-[#006837] mb-3";
    }
  };

  const getDescripcionClasses = () => {
    if (estaBloqueada) {
      return "text-gray-500 mb-6 leading-relaxed";
    } else {
      return "text-gray-600 mb-6 leading-relaxed";
    }
  };

  const getProgresoTextClasses = () => {
    if (estaBloqueada) {
      return "text-sm text-gray-500";
    } else {
      return "text-sm text-gray-600";
    }
  };

  const getProgresoValueClasses = () => {
    if (estaBloqueada) {
      return "text-sm font-bold text-gray-600";
    } else {
      return "text-sm font-bold text-[#006837]";
    }
  };

  const getButtonClasses = () => {
    if (estaBloqueada) {
      return "w-full bg-gray-300 text-gray-500 rounded-xl py-4 font-bold cursor-not-allowed";
    } else if (esCompletada) {
      return "w-full bg-gradient-to-r from-[#59D22E] to-[#A5E811] hover:from-[#A5E811] hover:to-[#59D22E] text-white rounded-xl py-4 font-bold shadow-lg transition-all transform hover:scale-105";
    } else {
      return "w-full bg-gradient-to-r from-[#59D22E] to-[#A5E811] hover:from-[#A5E811] hover:to-[#59D22E] text-white rounded-xl py-4 font-bold shadow-lg transition-all transform hover:scale-105";
    }
  };

  const getButtonText = () => {
    if (estaBloqueada) {
      return "Bloqueado";
    } else if (esCompletada) {
      return textoBotonCompletada;
    } else {
      return textoBotonActiva;
    }
  };

  // Animaciones para unidad activa
  const activeAnimations = esActiva ? {
    y: [0, -8, 0],
    boxShadow: [
      '0 10px 40px rgba(89, 210, 46, 0.3)',
      '0 20px 60px rgba(89, 210, 46, 0.5)',
      '0 10px 40px rgba(89, 210, 46, 0.3)'
    ]
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={activeAnimations}
      transition={esActiva ? {
        opacity: { duration: 0.5, delay },
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      } : { duration: 0.5, delay }}
      className={getCardClasses()}
    >
      {/* Badge "¡En Curso!" solo para unidades activas */}
      {esActiva && (
        <motion.div
          className="absolute -top-3 -right-3 bg-gradient-to-r from-[#59D22E] to-[#A5E811] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ¡En Curso!
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className={getBadgeClasses()}>
          UNIDAD {unidadNumero}
        </span>
        {estaBloqueada ? (
          <Lock className="w-5 h-5 text-gray-400" />
        ) : (
          <LockOpen className="w-5 h-5 text-[#59D22E]" />
        )}
      </div>

      <h3 
        className={getTituloClasses()}
        style={{ 
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 700,
        }}
      >
        {titulo}
      </h3>
      
      <p className={getDescripcionClasses()}>
        {descripcion}
      </p>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={getProgresoTextClasses()}>Progreso</span>
          <span className={getProgresoValueClasses()}>
            {porcentajeProgreso}%
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${estaBloqueada ? 'bg-gray-200' : 'bg-gray-100'}`}>
          {!estaBloqueada && (
            <motion.div
              className="h-full bg-gradient-to-r from-[#59D22E] to-[#A5E811] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${porcentajeProgreso}%` }}
              transition={{ duration: 1 }}
            />
          )}
        </div>
      </div>

      <Button
        onClick={() => !estaBloqueada && ruta && navigate(ruta)}
        disabled={estaBloqueada}
        className={getButtonClasses()}
      >
        {getButtonText()}
      </Button>

      {/* Tooltip para unidades bloqueadas */}
      {estaBloqueada && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-[#006837] text-white px-4 py-2 rounded-lg text-smáshadow-xl">
            {unidadNumero === 1 
              ? "Esta unidad está disponible" 
              : `Culmina la Unidad ${unidadNumero - 1}`
            }
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UnidadCard;

