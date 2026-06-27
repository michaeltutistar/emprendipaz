import React from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '../ui/button';

const DiagnosticoModal = ({ respuesta1, respuesta2, onClose }) => {
  // Generar diagnóstico basado en las respuestas
  const getDiagnostico = () => {
    const nivel1 = respuesta1 === 'opcion1' || respuesta1 === 'opcion4' ? 'inicial' : 
                   respuesta1 === 'opcion2' ? 'intermedio' : 'avanzado';
    const nivel2 = respuesta2 === 'opcion1' ? 'inicial' :
                   respuesta2 === 'opcion2' ? 'intermedio' : 'avanzado';

    if (nivel1 === 'inicial' && nivel2 === 'inicial') {
      return {
        titulo: 'Fase de Exploración',
        mensaje: 'Te encuentras en una etapa inicial de tu emprendimiento. Es fundamental que dediques tiempo a definir claramente tu producto y a identificar quiénes son tus clientes potenciales.',
        recomendaciones: [
          'Realiza entrevistas con clientes potenciales para entender sus necesidades',
          'Define claramente qué problema resuelve tu producto o servicio',
          'Investiga a la competencia en tu territorio',
          'Comienza con un prototipo o versión mínima viable'
        ]
      };
    } else if (nivel1 === 'avanzado' && nivel2 === 'avanzado') {
      return {
        titulo: 'Fase de Consolidación',
        mensaje: 'Tu emprendimiento está en una etapa avanzada. Es momento de optimizar tus estrategias y escalar tu negocio.',
        recomendaciones: [
          'Implementa estrategias de fidelización de clientes',
          'Explora nuevos canales de distribución',
          'Considera diversificar tu oferta de productos',
          'Desarrolla alianzas estratégicas con otros emprendedores'
        ]
      };
    } else {
      return {
        titulo: 'Fase de Desarrollo',
        mensaje: 'Has avanzado en tu emprendimiento pero aún hay áreas por fortalecer. Es importante equilibrar el desarrollo de producto con el conocimiento del mercado.',
        recomendaciones: [
          'Profundiza en el análisis de tu público objetivo',
          'Perfecciona tu propuestá de valor',
          'Desarrolla un plan de marketing básico',
          'Establece métricas para medir el éxito de tus acciones'
        ]
      };
    }
  };

  const diagnostico = getDiagnostico();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-neutral-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6" />
            <h2>Su diagnóstico es...</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-neutral-800 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-neutral-900 mb-3 text-xl font-bold">{diagnostico.titulo}</h3>
            <p className="text-neutral-600">{diagnostico.mensaje}</p>
          </div>

          <div className="mb-8">
            <h4 className="text-neutral-800 mb-3 font-semibold">Recomendaciones</h4>
            <ul className="space-y-2">
              {diagnostico.recomendaciones.map((recomendacion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-neutral-900 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                    {index + 1}
                  </span>
                  <span className="text-neutral-600">{recomendacion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-neutral-100 p-4 rounded-lg mb-6">
            <p className="text-neutral-700 text-sm">
              <strong>Nota:</strong> Este diagnóstico es una guía inicial. En las próximás unidades profundizaremás 
              en cada uno de estos aspectos y desarrollarás herramientas concretas para tu emprendimiento.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoModal;





