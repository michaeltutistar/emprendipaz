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
    return ['dashboard', 'users']
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
            <img src="/logo-gobernacion.png" alt="gobernacion" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Administrativo
                </h1>
                <p className="text-sm text-gray-600">
                  Plataforma E-Learning - Gobernación de Nariño
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.rol === 'evaluador' ? 'Evaluador' : 'Administrador'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
          <div className="flex space-x-8">
            {visibleTabs.includes('dashboard') && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Gestión de Usuarios
              </button>
            )}
            {visibleTabs.includes('bulk-import') && (
              <button
                onClick={() => setActiveTab('bulk-import')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <MetricsPanel />}
        {activeTab === 'users' && <UserManagement />}
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