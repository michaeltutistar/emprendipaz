import React from 'react';
import { useNavigate } from 'react-router-dom';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

import {

  ArrowLeft,

  CheckCircle,

  ClipboardList,

  ListChecks,

  ArrowRight

} from 'lucide-react';

const EvaluaciónMarketingDigitalPage = () => {

  const navigate = useNavigate();

const handleCompleteStep = async () => {

    try {

      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/registrar-progreso-modulo`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          ...(token ? { 'Authorization': `Bearer ${token}` } : {})

        },

        body: JSON.stringify({

          modulo_nombre: 'Marketing Digital',

          paso_nombre: 'Evaluación',

          curso_nombre: 'Marketing Digital'

        })

      });

if (response.ok) {

        alert('¡Paso completado! Tu progreso ha sido registrado.');

        navigate('/student/marketing-digital');

      } else {

        alert('Paso completado, pero hubo un problema al registrar el progreso.');

        navigate('/student/marketing-digital');

      }

    } catch (error) {

      console.error('Error al registrar progreso:', error);

      alert('¡Paso completado!');

      navigate('/student/marketing-digital');

    }

  };

return (

    <div className="min-h-screen bg-white">

      {/* Header simple con volver */}

      <div className="bg-white shadow-sm border-b">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center py-4">

            <div className="flex items-center space-x-4">

              <button

                onClick={() => navigate('/student/marketing-digital')}

                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"

              >

                <ArrowLeft className="w-5 h-5" />

                <span>Volver</span>

              </button>

            </div>

            <div className="text-right">

              <h1 className="text-2xl font-bold text-blue-900">EmprendiPaz</h1>

              <p className="text-sm text-blue-700">Para jóvenes que transforman territorios</p>

            </div>

          </div>

        </div>

      </div>

{/* Hero */}

      <section className="relative bg-gradient-to-r from-green-500 via-green-400 to-blue-600 py-16 overflow-hidden">

        <div className="absolute inset-0">

          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>

          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>

          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>

        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="inline-block px-6 py-3 rounded-xl bg-white/90 backdrop-blur-sm text-3xl md:text-4xl font-extrabold text-green-700 shadow-xl border border-white/30">

            Evaluación

          </h1>

        </div>

      </section>

{/* Contenido principal */}

      <section className="py-16 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

            {/* Encuestá de satisfacción */}

            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">

              <div className="p-8">

                <div className="text-center mb-6">

                  <p className="text-sm font-semibold text-gray-700 mb-3">Encuestá de satisfacción.</p>

                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">

                    <ClipboardList className="w-12 h-12 text-white" />

                  </div>

                </div>

                <div className="flex justify-center">

                  <button

                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"

                    onClick={() => window.open('#', '_blank')}

                  >

                    Abrir encuesta

                  </button>

                </div>

              </div>

            </div>

{/* Evaluación del docente */}

            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">

              <div className="p-8">

                <div className="text-center mb-6">

                  <p className="text-sm font-semibold text-gray-700 mb-3">Evaluación de la jornada por parte del docente</p>

                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">

                    <ListChecks className="w-12 h-12 text-white" />

                  </div>

                </div>

                <div className="flex justify-center">

                  <button

                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"

                    onClick={() => window.open('#', '_blank')}

                  >

                    Abrir evaluación

                  </button>

                </div>

              </div>

            </div>

          </div>

{/* Botones inferiores */}

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">

            <button

              onClick={() => navigate(-1)}

              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 border-2 border-gray-200 hover:border-gray-300"

            >

              Regresar

            </button>

            <button

              onClick={() => navigate('/student/marketing-digital')}

              className="group bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"

            >

              <ArrowLeft className="w-5 h-5 mr-2" />

              Volver al inicio

            </button>

            <button

              onClick={handleCompleteStep}

              className="group bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"

            >

              <CheckCircle className="w-5 h-5 mr-2" />

              Completado

            </button>

          </div>

        </div>

      </section>

<Footer />

    </div>

  );

};

export default EvaluaciónMarketingDigitalPage;

