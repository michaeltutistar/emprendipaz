import React from 'react';
import { Button } from '../ui/button';

import { useNavigate } from 'react-router-dom';

import StudentHeader from './StudentHeader';

import Footer from '../Footer';
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage';

import { 

  ArrowLeft,

  BookOpen,

  Target,

  CheckCircle

} from 'lucide-react';

const ProgramacionModuloPage = () => {

  const navigate = useNavigate();

return (

    <div className="min-h-screen bg-white">

      {/* Header inspirado en el diseño */}

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

{/* Hero Section inspirado en el diseño */}

      <section className="relative bg-gradient-to-r from-green-500 via-green-400 to-blue-600 py-20 overflow-hidden">

        {/* Efectos diagonales de fondo */}

        <div className="absolute inset-0">

          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>

          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>

          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>

        </div>

<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">

            PROGRAMACIÓN DEL MÓDULO

          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">

            Estructura detallada del curso de Marketing Digital con metodología de aprendizaje diseñada para jóvenes emprendedores.

          </p>

        </div>

      </section>

{/* Content Section - Mantener la lógica original pero con nuevo diseño */}

      <section className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">

            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">

              Estructura del Curso

            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">

              Conoce la metodología y estructura completa del módulo de Marketing Digital

            </p>

          </div>

{/* Grid de secciones con nuevo diseño visual */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

            {/* Sección 1: Programa del Curso */}

            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">

              <div className="p-8">

                {/* Icon */}

                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">

                  <BookOpen className="w-8 h-8" />

                </div>

{/* Content */}

                <h3 className="text-2xl font-bold text-blue-900 text-center mb-6 group-hover:text-green-600 transition-colors duration-300">

                  Programa del Curso

                </h3>

{/* Espacio para infografía - Mantener la lógica original */}

                <div className="mb-6">

                  <div className="w-full h-64 rounded-2xl border-2 border-dashed border-green-300 flex items-center justify-center bg-green-50 hover:bg-green-100 transition-colors duration-300">

                    <div className="text-center">

                      <div className="text-4xl mb-2">📊</div>

                      <p className="text-gray-500 font-medium">Espacio para infografía</p>

                      <p className="text-sm text-gray-400">Programa del curso</p>

                    </div>

                  </div>

                </div>

<p className="text-gray-600 text-center mb-6 leading-relaxed">

                  Aquí se mostrará la estructura completa del curso de Marketing Digital, incluyendo temás, 

                  duración, objetivos de aprendizaje y metodología de enseñanza.

                </p>

              </div>

            </div>

{/* Sección 2: Estrategia de Aprendizaje */}

            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">

              <div className="p-8">

                {/* Icon */}

                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">

                  <Target className="w-8 h-8" />

                </div>

{/* Content */}

                <h3 className="text-2xl font-bold text-blue-900 text-center mb-6 group-hover:text-green-600 transition-colors duration-300">

                  Estrategia de Aprendizaje

                </h3>

{/* Espacio para infografía - Mantener la lógica original */}

                <div className="mb-6">

                  <div className="w-full h-64 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors duration-300">

                    <div className="text-center">

                      <div className="text-4xl mb-2">📈</div>

                      <p className="text-gray-500 font-medium">Espacio para infografía</p>

                      <p className="text-sm text-gray-400">Estrategia de aprendizaje</p>

                    </div>

                  </div>

                </div>

<p className="text-gray-600 text-center mb-6 leading-relaxed">

                  Aquí se presentará la metodología de aprendizaje, recursos disponibles, 

                  actividades prácticas y herramientas de evaluación del curso.

                </p>

              </div>

            </div>

          </div>

{/* Botones de acción con nuevo diseño visual */}

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">

            {/* Botón Regresar */}

            <button

              onClick={() => navigate('/student/marketing-digital')}

              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 border-2 border-gray-200 hover:border-gray-300"

            >

              <div className="flex items-center space-x-3">

                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />

                <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Regresar</span>

              </div>

            </button>

{/* Botón Completado - Mantener toda la lógica original */}

            <button

              onClick={async () => {

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

                      paso_nombre: 'Programación del Modulo',

                      curso_nombre: 'Marketing Digital'

                    })

                  });

if (response.ok) {

                    alert('¡Modulo completado! Tu progreso ha sido registrado.');

                    navigate('/student/marketing-digital');

                  } else {

                    alert('Modulo completado, pero hubo un problema al registrar el progreso.');

                    navigate('/student/marketing-digital');

                  }

                } catch (error) {

                  console.error('Error al registrar progreso:', error);

                  alert('¡Modulo completado!');

                  navigate('/student/marketing-digital');

                }

              }}

              className="group bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4"

            >

              <div className="flex items-center space-x-3">

                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />

                <span className="font-semibold">Completado</span>

              </div>

            </button>

          </div>

        </div>

      </section>

{/* Footer */}

      <Footer />

    </div>

  );

};

export default ProgramacionModuloPage;

