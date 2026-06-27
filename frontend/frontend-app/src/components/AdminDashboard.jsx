import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetricsPanel from './admin/MetricsPanel'
import CuposConfig from './admin/CuposConfig'
import UserManagement from './admin/UserManagement'
import BulkUserImport from './admin/BulkUserImport'
import ActivityLogs from './admin/ActivityLogs'
import ContentManagement from './admin/ContentManagement'
import ResourceManagement from './admin/ResourceManagement'
import CertificadosControl from './admin/CertificadosControl'
import PhaseManagement from './admin/PhaseManagement'
import CourseManagement from './admin/CourseManagement'
import AssetsManagement from './admin/AssetsManagement'
import EvidenceManagementFixed from './admin/EvidenceManagementFixed'
import CriteriosEvaluacion from './admin/CriteriosEvaluacion'
import EvaluacionPanel from './admin/EvaluacionPanel'
import RankingsPanel from './admin/RankingsPanel'
import SorteoPanel from './admin/SorteoPanel'
import BannerManagement from './admin/BannerManagement'
import ModuleManagementMockup from './admin/ModuleManagementMockup'
import InstructorDashboard from './InstructorDashboard'
import RegisterPageMultiStep from './RegisterPageMultiStep'
import ProgramLogosBanner from './ProgramLogosBanner'
import API_BASE_URL from '@/config/api'
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        if (userData.rol === 'admin' || userData.rol === 'evaluador') {
          setUser(userData)
        } else {
          navigate('/login')
        }
      } else {
        navigate('/login')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Función para determinar qué pestañas mostrar según el rol
  const getVisibleTabs = () => {
    if (user?.rol === 'evaluador') {
      return ['users'] // Solo Gestión de Usuarios para evaluadores
    }
    return ['dashboard', 'users', 'banners', 'module-management', 'tutor-dashboard', 'registration-form']
  }

  const visibleTabs = getVisibleTabs()

  // Establecer pestaña activa por defecto según el rol
  useEffect(() => {
    if (user?.rol === 'evaluador' && activeTab === 'dashboard') {
      setActiveTab('users')
    }
  }, [user, activeTab])

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] || 'dashboard')
    }
  }, [activeTab, visibleTabs])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
      <ProgramLogosBanner />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <img src="/logo-gobernacion.png" alt="gobernacion" className="h-12 w-auto shrink-0 sm:h-14" />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
                  Dashboard Administrativo
                </h1>
                <p className="text-xs text-gray-600 sm:text-sm">
                  Plataforma E-Learning - Gobernación de Nariño
                </p>
              </div>
            </div>
            
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
              <div className="min-w-0 sm:text-right">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.rol === 'evaluador' ? 'Evaluador' : 'Administrador'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:w-auto"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-6 whitespace-nowrap">
            {visibleTabs.includes('dashboard') && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Dashboard
              </button>
            )}
            {visibleTabs.includes('users') && (
              <button
                onClick={() => setActiveTab('users')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Gestión de Usuarios
              </button>
            )}
            {visibleTabs.includes('banners') && (
              <button
                onClick={() => setActiveTab('banners')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'banners'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🖼️ Gestión de Banners
              </button>
            )}
            {visibleTabs.includes('module-management') && (
              <button
                onClick={() => setActiveTab('module-management')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'module-management'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🧩 Gestión de módulos
              </button>
            )}
            {visibleTabs.includes('tutor-dashboard') && (
              <button
                onClick={() => setActiveTab('tutor-dashboard')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'tutor-dashboard'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👨‍🏫 Dashboard tutor
              </button>
            )}
            {visibleTabs.includes('registration-form') && (
              <button
                onClick={() => setActiveTab('registration-form')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'registration-form'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 Formulario de inscripción
              </button>
            )}
            {visibleTabs.includes('bulk-import') && (
              <button
                onClick={() => setActiveTab('bulk-import')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'bulk-import'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📥 Registro Masivo
              </button>
            )}
            {visibleTabs.includes('content') && (
              <button
                onClick={() => setActiveTab('content')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'content'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Gestión de Contenido
              </button>
            )}
            {visibleTabs.includes('resources') && (
              <button
                onClick={() => setActiveTab('resources')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'resources'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📁 Gestión de Recursos
              </button>
            )}
            {visibleTabs.includes('logs') && (
              <button
                onClick={() => setActiveTab('logs')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'logs'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Logs de Actividad
              </button>
            )}
            {visibleTabs.includes('cupos') && (
              <button
                onClick={() => setActiveTab('cupos')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'cupos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🧮 Configurar Cupos
              </button>
            )}
            {visibleTabs.includes('certificados') && (
              <button
                onClick={() => setActiveTab('certificados')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'certificados'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🛡️ Certificados Control
              </button>
            )}
            {visibleTabs.includes('fases') && (
              <button
                onClick={() => setActiveTab('fases')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'fases'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🚀 Gestión de Fases
              </button>
            )}
            {visibleTabs.includes('cursos') && (
              <button
                onClick={() => setActiveTab('cursos')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'cursos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Gestión de Cursos
              </button>
            )}
            {visibleTabs.includes('activos') && (
              <button
                onClick={() => setActiveTab('activos')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'activos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📦 Entrega de Activos
              </button>
            )}
            {visibleTabs.includes('evidencias') && (
              <button
                onClick={() => setActiveTab('evidencias')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'evidencias'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Evidencias de Funcionamiento
              </button>
            )}
            {visibleTabs.includes('criterios') && (
              <button
                onClick={() => setActiveTab('criterios')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'criterios'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚖️ Criterios de Evaluación
              </button>
            )}
            {visibleTabs.includes('evaluacion') && (
              <button
                onClick={() => setActiveTab('evaluacion')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'evaluacion'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Panel de Evaluación
              </button>
            )}
            {visibleTabs.includes('rankings') && (
              <button
                onClick={() => setActiveTab('rankings')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'rankings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏆 Rankings y Exportación
              </button>
            )}
            {visibleTabs.includes('sorteos') && (
              <button
                onClick={() => setActiveTab('sorteos')}
                className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'sorteos'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎲 Sistema de Desempate
              </button>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <MetricsPanel />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'banners' && <BannerManagement />}
        {activeTab === 'module-management' && <ModuleManagementMockup />}
        {activeTab === 'tutor-dashboard' && <InstructorDashboard embedded />}
        {activeTab === 'registration-form' && <RegisterPageMultiStep embedded forceAdminMode />}
        {activeTab === 'bulk-import' && <BulkUserImport />}
        {activeTab === 'content' && <ContentManagement />}
        {activeTab === 'resources' && <ResourceManagement />}
        {activeTab === 'logs' && <ActivityLogs />}
        {activeTab === 'cupos' && <CuposConfig />}
        {activeTab === 'certificados' && <CertificadosControl />}
        {activeTab === 'fases' && <PhaseManagement />}
        {activeTab === 'cursos' && <CourseManagement />}
        {activeTab === 'activos' && <AssetsManagement />}
        {activeTab === 'evidencias' && <EvidenceManagementFixed />}
        {activeTab === 'criterios' && <CriteriosEvaluacion />}
        {activeTab === 'evaluacion' && <EvaluacionPanel />}
        {activeTab === 'rankings' && <RankingsPanel />}
        {activeTab === 'sorteos' && <SorteoPanel />}
      </main>
    </div>
  )
}

export default AdminDashboard 