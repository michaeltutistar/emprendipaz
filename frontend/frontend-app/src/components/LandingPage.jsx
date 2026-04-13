import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Award, Clock, CheckCircle, Star, Search, MapPin, Target, TrendingUp, ChevronDown, Trophy } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import logoGov from '../assets/logo-gov.png'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { Input } from '@/components/ui/input'
import { useAuth } from '../hooks/useAuth'
import API_BASE_URL from '@/config/api'

// Componente de contador regresivo para cierre de inscripciones
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Fecha objetivo: 15 de octubre a las 11:59 PM
    const targetDate = new Date('2025-10-15T23:59:00')
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = targetDate.getTime() - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // Calcular inmediatamente
    calculateTimeLeft()
    
    // Actualizar cada segundo
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-red-200 p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          ⏰ Inscripciones se cierran en
        </h3>
        <p className="text-sm text-gray-600">
          15 de octubre a las 11:59 PM
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="bg-red-600 text-white rounded-lg p-3 shadow-lg">
            <div className="text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-xs">Días</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-red-600 text-white rounded-lg p-3 shadow-lg">
            <div className="text-2xl font-bold">{timeLeft.hours}</div>
            <div className="text-xs">Horas</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-red-600 text-white rounded-lg p-3 shadow-lg">
            <div className="text-2xl font-bold">{timeLeft.minutes}</div>
            <div className="text-xs">Min</div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-red-600 text-white rounded-lg p-3 shadow-lg">
            <div className="text-2xl font-bold">{timeLeft.seconds}</div>
            <div className="text-xs">Seg</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const HorizontalTimeline = () => {
  const [activePhase, setActivePhase] = useState(0)
  
  const phases = [
    {
      id: 0,
      title: "Fase 1: Inscripción y Selección",
      icon: <CheckCircle className="h-8 w-8" />,
      color: "green",
      description: "Convocatoria pública, inscripción en línea y revisión de requisitos para seleccionar los emprendimientos participantes.",
      details: ["Convocatoria con TDR", "Evaluación de postulaciones", "Lista de elegibles", "Proceso de selección"]
    },
    {
      id: 1,
      title: "Fase 2: Formación",
      icon: <BookOpen className="h-8 w-8" />,
      color: "yellow",
      description: "Formación virtual y presencial en modelo de negocio, gestión financiera, marketing, innovación, legalidad y formalización.",
      details: ["Campus itinerante", "Plataforma Emprendipaz", "80 horas de formación", "Acompañamiento técnico"]
    },
    {
      id: 2,
      title: "Fase 3: Entrega de Activos Productivos",
      icon: <Award className="h-8 w-8" />,
      color: "blue",
      description: "Entrega de bienes e insumos para fortalecer los emprendimientos seleccionados y potenciar sus ideas de negocio.",
      details: ["Asistencia técnica", "Dotación de activos", "11 eventos de entrega", "Seguimiento post-entrega"]
    }
  ]

  const colorClasses = {
    green: {
      bg: "bg-green-600",
      border: "border-green-600",
      text: "text-green-600",
      hover: "hover:bg-green-50",
      active: "bg-green-50 border-green-600"
    },
    yellow: {
      bg: "bg-yellow-500",
      border: "border-yellow-500", 
      text: "text-yellow-600",
      hover: "hover:bg-yellow-50",
      active: "bg-yellow-50 border-yellow-500"
    },
    blue: {
      bg: "bg-blue-600",
      border: "border-blue-600",
      text: "text-blue-600", 
      hover: "hover:bg-blue-50",
      active: "bg-blue-50 border-blue-600"
    }
  }

  return (
    <div className="max-w-6xl mx-auto mb-12">
      {/* Timeline Horizontal */}
      <div className="relative mb-8">
        {/* Línea de conexión */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 rounded-full"></div>
        
        {/* Puntos de las fases */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => {
            const colors = colorClasses[phase.color]
            const isActive = activePhase === index
            
            return (
              <div
                key={phase.id}
                onMouseEnter={() => setActivePhase(index)}
                className={`relative z-10 flex flex-col items-center group transition-all duration-300 cursor-pointer ${
                  isActive ? 'transform scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Círculo del punto */}
                <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-colors duration-300 ${
                  isActive ? colors.bg : `${colors.bg} opacity-80`
                } ${colors.hover}`}>
                  <div className="text-white">
                    {phase.icon}
                  </div>
                </div>
                
                {/* Número de fase */}
                <div className={`mt-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                  isActive ? `${colors.bg} text-white` : `${colors.text} bg-white border-2 ${colors.border}`
                }`}>
                  {index + 1}
                </div>
                
                {/* Título compacto */}
                <div className={`mt-2 text-sm font-medium text-center transition-colors duration-300 ${
                  isActive ? colors.text : 'text-gray-500'
                }`}>
                  Fase {index + 1}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contenido de la fase activa */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-100 overflow-hidden transition-all duration-500">
        <div className={`h-2 ${colorClasses[phases[activePhase].color].bg}`}></div>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${colorClasses[phases[activePhase].color].active}`}>
              <div className={colorClasses[phases[activePhase].color].text}>
                {phases[activePhase].icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {phases[activePhase].title}
              </h3>
              <p className="text-gray-600 mb-4">
                {phases[activePhase].description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {phases[activePhase].details.map((detail, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className={`h-4 w-4 ${colorClasses[phases[activePhase].color].text}`} />
                    <span className="text-sm text-gray-700">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FormationTabs = () => {
  const [activeTab, setActiveTab] = useState('empresarial')
  
  const tabs = {
    empresarial: {
      title: 'Formación Empresarial',
      icon: <Users className="h-5 w-5" />,
      modules: [
        'Modelo de Negocio',
        'Gestión Financiera', 
        'Marketing y Comercialización',
        'Plan de Negocio',
        'Plan de Inversión',
        'Análisis Financiero'
      ]
    },
    digital: {
      title: 'Transformación Digital',
      icon: <BookOpen className="h-5 w-5" />,
      modules: [
        'Marketing Digital',
        'Estrategias Comerciales Online',
        'Descubrimiento de Oportunidades',
        'Innovación Digital',
        'E-commerce Básico',
        'Redes Sociales para Negocios'
      ]
    },
    liderazgo: {
      title: 'Liderazgo y Habilidades',
      icon: <Star className="h-5 w-5" />,
      modules: [
        'Liderazgo Emprendedor',
        'Proyecto de Vida',
        'Resolución de Conflictos',
        'Trabajo en Equipo',
        'Asociatividad',
        'Comunicación Efectiva'
      ]
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
      {/* Tab Headers */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {Object.entries(tabs).map(([key, tab]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {tabs[activeTab].title}
          </h3>
          <p className="text-gray-600">
            Módulos especializados para el desarrollo integral de emprendedores
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tabs[activeTab].modules.map((module, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{module}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Modalidad:</strong> Campus itinerante (10 días presenciales) + E-learning (plataforma virtual)
          </p>
          <p className="text-sm text-green-800 mt-1">
            <strong>Duración:</strong> 80 horas de formación integral por participante
          </p>
        </div>
      </div>
    </div>
  )
}

const NodesTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedNode, setExpandedNode] = useState(null)
  
  const nodesData = [
    {
      nodo: "Centro",
      central: "Pasto",
      municipios: ["Pasto", "Chachagüí", "La Florida", "Nariño", "Tangua", "Yacuanquer"]
    },
    {
      nodo: "Abades",
      central: "Samaniego", 
      municipios: ["Providencia", "Samaniego", "Santacruz"]
    },
    {
      nodo: "Cordillera",
      central: "Taminango",
      municipios: ["Cumbitara", "El Rosario", "Leiva", "Policarpa", "Taminango"]
    },
    {
      nodo: "Exprovincia de Obando",
      central: "Ipiales",
      municipios: ["Aldana", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Funes", "Guachucal", "Gualmatán", "Iles", "Ipiales", "Potosí", "Puerres", "Pupiales"]
    },
    {
      nodo: "Guambuyaco",
      central: "El Tambo",
      municipios: ["El Peñol", "El Tambo", "La Llanada", "Los Andes"]
    },
    {
      nodo: "Juanambú",
      central: "La Unión",
      municipios: ["Arboleda", "Buesaco", "La Unión", "San Lorenzo", "San Pedro de Cartago"]
    },
    {
      nodo: "Occidente",
      central: "Sandoná",
      municipios: ["Ancuya", "Consacá", "Linares", "Sandoná"]
    },
    {
      nodo: "Río Mayo",
      central: "La Cruz",
      municipios: ["Albán", "Belén", "Colón", "El Tablón de Gómez", "La Cruz", "San Bernardo", "San Pablo"]
    },
    {
      nodo: "Costa Pacífica",
      central: "Tumaco",
      municipios: ["Francisco Pizarro", "Tumaco", "El Charco", "La Tola", "Mosquera", "Olaya Herrera", "Santa Bárbara"]
    },
    {
      nodo: "Sabana",
      central: "Túquerres",
      municipios: ["Guaitarilla", "Imués", "Ospina", "Sapuyes", "Túquerres", "Ricaurte", "Mallama"]
    },
    {
      nodo: "Telembí",
      central: "Barbacoas",
      municipios: ["Barbacoas", "Magüí", "Roberto Payán"]
    }
  ]

  // Función para normalizar texto (quitar acentos y convertir a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[ñ]/g, 'n') // Reemplazar ñ por n para búsqueda más flexible
  }

  const filteredNodes = nodesData.filter(node => {
    const searchNormalized = normalizeText(searchTerm)
    
    return normalizeText(node.nodo).includes(searchNormalized) ||
           normalizeText(node.central).includes(searchNormalized) ||
           node.municipios.some(municipio => 
             normalizeText(municipio).includes(searchNormalized)
           )
  })

  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Distribución por Nodos</h3>
              <p className="text-slate-300 text-sm">Busca cualquier municipio o nodo de coordinación</p>
            </div>
            <div className="text-white text-right">
              <div className="text-3xl font-bold">11</div>
              <div className="text-xs text-slate-300 uppercase tracking-wide">Nodos</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Busca sin acentos: tumaco, ipiales, pasto, cordoba..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-0 shadow-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Acordeón de Nodos */}
        <div className="p-6 bg-gray-50">
          {filteredNodes.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-2">
              {filteredNodes.map((node, index) => {
                const isExpanded = expandedNode === index
                const hasSearchMatch = searchTerm && filteredNodes.includes(node)
                
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Header del acordeón */}
                    <button
                      onClick={() => setExpandedNode(isExpanded ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <span className="font-semibold text-gray-800">
                            {node.nodo}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          ({node.central}) – {node.municipios.length} municipios
                        </div>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {/* Contenido expandible */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      isExpanded || hasSearchMatch ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-6 pb-4 border-t border-gray-100">
                        <div className="pt-4">
                          <div className="flex flex-wrap gap-2">
                            {node.municipios.map((municipio, idx) => {
                              const isHighlighted = searchTerm && 
                                normalizeText(municipio).includes(normalizeText(searchTerm))
                              const isCentral = municipio === node.central
                              
                              return (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                                    isHighlighted 
                                      ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300 font-medium' 
                                      : isCentral
                                        ? 'bg-green-100 text-green-800 font-medium border border-green-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {isCentral && <Star className="h-3 w-3 mr-1" />}
                                  {municipio}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-500 mb-4">
                No hay nodos o municipios que coincidan con "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos los nodos
              </button>
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Mostrando {filteredNodes.length} de 11 nodos</span>
              </div>
              
            </div>
            {searchTerm && (
              <div className="text-blue-600 font-medium">
                Búsqueda activa: "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Iconos de redes (SVG inline, sin dependencias extra) */
const SocialIconYouTube = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)
const SocialIconInstagram = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)
const SocialIconX = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const SocialIconFacebook = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const LANDING_SOCIAL_LINKS = [
  { href: 'https://www.youtube.com/@Gobnarino', label: 'YouTube — Gobernación de Nariño', Icon: SocialIconYouTube },
  { href: 'https://www.instagram.com/GobNarino/', label: 'Instagram — Gobernación de Nariño', Icon: SocialIconInstagram },
  { href: 'https://x.com/gobnarino', label: 'X (Twitter) — Gobernación de Nariño', Icon: SocialIconX },
  { href: 'https://www.facebook.com/GobNarino/?locale=es_LA', label: 'Facebook — Gobernación de Nariño', Icon: SocialIconFacebook },
]

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [customBanners, setCustomBanners] = useState([]);
  
  // Estado para el botón secreto
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [secretAccess, setSecretAccess] = useState(false);
  
  // Posiciones fijas para las partículas decorativas (generadas una vez)
  const [particlePositions] = useState(() => {
    const positions = [];
    for (let i = 0; i < 19; i++) {
      positions.push({
        left: Math.random() * 120 - 10,
        top: Math.random() * 120 - 10,
        rotation: Math.random() * 360,
        delay: Math.random() * 2,
        duration: 1 + Math.random()
      });
    }
    return positions;
  });

  // Posiciones fijas para las estrellas de fondo (generadas una vez)
  const [starPositions] = useState(() => {
    const positions = [];
    for (let i = 0; i < 20; i++) {
      positions.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 1 + Math.random() * 2
      });
    }
    return positions;
  });
  
  // Función para navegar a términos de referencia en la misma pestaña
  const handleOpenTDR = () => {
    navigate('/terminos-referencia');
  };

  // Función para descargar el PDF de ganadores
  const handleDownloadGanadores = async () => {
    try {
      // URL del PDF
      const pdfUrl = '/Terminos/RESULTADOS DEFINITIVOS.pdf';
      
      // Crear un elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'RESULTADOS DEFINITIVOS.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('Error al descargar el PDF. Por favor, inténtalo más tarde.');
    }
  };

  // Función para verificar si el registro está habilitado
  const isRegistrationEnabled = () => {
    // Permitir registro para cualquier persona
    return true;
  };

  // Función para manejar el triple clic/tap secreto
  const handleSecretClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSecretClickCount(prev => {
      const newCount = prev + 1;
      
      // Si alcanza 3 clicks, redirigir a registro con modo admin
      if (newCount >= 3) {
        navigate('/register?admin=true');
        return 0; // Resetear contador
      }
      
      // Resetear contador después de 1 segundo si no se completan los 3 clicks
      setTimeout(() => {
        setSecretClickCount(0);
      }, 1000);
      
      return newCount;
    });
  };

  // Función específica para eventos táctiles en móvil
  const handleSecretTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSecretClick(e);
  };

  useEffect(() => {
    const fetchLandingBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/landing-banners/public`);
        const data = await response.json();
        if (response.ok && data?.success) {
          setCustomBanners(Array.isArray(data.banners) ? data.banners : []);
        }
      } catch (error) {
        console.error('Error loading landing banners:', error);
      }
    };

    fetchLandingBanners();
  }, []);

  useEffect(() => {
    // Agregar estilos CSS para la animación de borde luminoso
    const style = document.createElement('style');
    style.textContent = `
      /* Forzar alineación vertical de logos en header */
      .header-logos img {
        vertical-align: middle !important;
        display: inline-block !important;
        line-height: 1 !important;
        align-self: center !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Asegurar que todos los logos tengan la misma altura base */
      .header-logos {
        align-items: center !important;
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 1rem !important;
        justify-content: center !important;
      }
      
      @keyframes border-glow {
        0% { 
          top: 0; 
          left: 0; 
          width: 150px; 
          height: 3px; 
          opacity: 1;
        }
        25% { 
          top: 0; 
          left: calc(100% - 150px); 
          width: 150px; 
          height: 3px; 
        }
        25.01% { 
          top: 0; 
          left: calc(100% - 3px); 
          width: 3px; 
          height: 150px; 
        }
        50% { 
          top: calc(100% - 150px); 
          left: calc(100% - 3px); 
          width: 3px; 
          height: 150px; 
        }
        50.01% { 
          top: calc(100% - 3px); 
          left: calc(100% - 150px); 
          width: 150px; 
          height: 3px; 
        }
        75% { 
          top: calc(100% - 3px); 
          left: 0; 
          width: 150px; 
          height: 3px; 
        }
        75.01% { 
          top: calc(100% - 150px); 
          left: 0; 
          width: 3px; 
          height: 150px; 
        }
        100% { 
          top: 0; 
          left: 0; 
          width: 3px; 
          height: 150px; 
        }
      }
      .animate-border-glow {
        animation: border-glow 6s linear infinite;
        animation-play-state: paused;
      }
      .animate-border-glow.running {
        animation-play-state: running;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Animación de contadores
    const animateCounter = (element, target, duration = 2000) => {
      const start = performance.now()
      const startValue = 0
      
      const tick = (now) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // Easing function
        const current = Math.floor(easeProgress * target)
        
        element.textContent = current
        
        if (progress < 1) {
          requestAnimationFrame(tick)
        }
      }
      
      requestAnimationFrame(tick)
    }

    // Intersection Observer para activar animaciones
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.counter')
          counters.forEach(counter => {
            const target = parseInt(counter.dataset.target)
            animateCounter(counter, target)
          })
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.3 })

    // Observar la sección de indicadores
    const indicatorsSection = document.querySelector('.counter')?.closest('.bg-gradient-to-br')
    if (indicatorsSection) {
      observer.observe(indicatorsSection)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row justify-between items-center py-4 space-y-4 xl:space-y-0 xl:space-x-6">
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-nowrap justify-center lg:justify-start min-h-[3rem] header-logos">
              <img src="/emprendipaz.png" alt="EmprendiPaz" className="h-9 sm:h-10 lg:h-11 object-contain" />
              <img src="/logo-gobernacion.png" alt="Gobernación de Nariño" className="h-9 sm:h-10 lg:h-11 object-contain" />
              <img src="/fundacion.png" alt="Fundación" className="h-9 sm:h-10 lg:h-11 object-contain" />
              <img src="/consorcio.png" alt="Consorcio" className="h-8 sm:h-9 lg:h-10 object-contain" />
              <img src="/sgr.png" alt="SGR" className="h-9 sm:h-10 lg:h-11 object-contain" />
            </div>
            <nav className="hidden md:flex space-x-4 lg:space-x-6 items-center">
              <a href="#inicio" className="nav-3d text-sm lg:text-base" data-label="Inicio">
                <span>Inicio</span><span>Inicio</span><span>Inicio</span><span>Inicio</span>
              </a>
              <a href="#caracteristicas" className="nav-3d text-sm lg:text-base" data-label="Fases">
                <span>Fases</span><span>Fases</span><span>Fases</span><span>Fases</span>
              </a>
              <a href="#beneficios" className="nav-3d text-sm lg:text-base" data-label="Cobertura">
                <span>Cobertura</span><span>Cobertura</span><span>Cobertura</span><span>Cobertura</span>
              </a>
              <Link to="/participacion-ciudadana" className="nav-3d text-sm lg:text-base" data-label="Contacto">
                <span>Contacto</span><span>Contacto</span><span>Contacto</span><span>Contacto</span>
              </Link>
            </nav>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3 w-full sm:w-auto md:ml-4">
              <a href="#contacto" className="w-full sm:w-auto">
                <Button className="border border-yellow-500 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold w-full sm:w-auto text-sm px-4">
                  Participación ciudadana
                </Button>
              </a>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto text-sm">
                  Iniciar Sesión
                </Button>
              </Link>
              {/* Botón de Subsanación deshabilitado por solicitud del usuario */}
              {/* <Link to="/register" className="w-full sm:w-auto">
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-sm">
                  Subsanación
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="hero-diagonals bg-gradient-to-br from-yellow-400 via-yellow-300 to-green-500 py-8">
        <div className="diag"></div>
        <div className="diag diag2"></div>
        <div className="diag diag3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10">
          {/* Anuncio de Resultados */}
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              {/* Estrellas de fondo */}
              <div className="absolute inset-0 opacity-30">
                {starPositions.map((star, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${star.left}%`,
                      top: `${star.top}%`,
                      animationDelay: `${star.delay}s`,
                      animationDuration: `${star.duration}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Contenido */}
              <div className="relative z-10 text-center">
                <div className="space-y-4 text-white text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                  <p>
                    Gracias a todos los emprendedores por su postulación para hacer parte de <strong>EMPRENDIPAZ</strong>. 
                    Ha finalizado el proceso de evaluación de las <strong>1166 inscripciones</strong>.
                  </p>
                  <p>
                    Si quieres conocer si has sido <strong>seleccionado para la siguiente fase</strong>, da click en el siguiente botón 
                    y busca el <strong>ID que fue enviado a través del correo electrónico</strong>.
                  </p>
                  <p className="text-sm md:text-base text-white/90 bg-white/10 rounded-lg p-4 border border-white/20">
                    <strong>¿No sabes cuál es tu ID?</strong> Puedes solicitarlo a través del correo electrónico{' '}
                    <a 
                      href="mailto:consorcioprimeronarino@gmail.com" 
                      className="text-yellow-300 hover:text-yellow-200 underline font-semibold"
                    >
                      consorcioprimeronarino@gmail.com
                    </a>
                    {' '}adjuntando copia de tu cédula.
                  </p>
                </div>
                
                {/* Botón de Descubrir Ganadores */}
                <div className="relative inline-block mt-8">
                  {/* Partículas decorativas alrededor del botón */}
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {/* Confeti amarillo */}
                    {particlePositions.slice(0, 8).map((pos, i) => (
                      <div
                        key={`yellow-${i}`}
                        className="absolute w-3 h-3 bg-yellow-400 rounded-sm opacity-60 animate-pulse"
                        style={{
                          left: `${pos.left}%`,
                          top: `${pos.top}%`,
                          transform: `rotate(${pos.rotation}deg)`,
                          animationDelay: `${pos.delay}s`,
                          animationDuration: `${pos.duration}s`
                        }}
                      />
                    ))}
                    {/* Confeti morado */}
                    {particlePositions.slice(8, 13).map((pos, i) => (
                      <div
                        key={`purple-${i}`}
                        className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-pulse"
                        style={{
                          left: `${pos.left}%`,
                          top: `${pos.top}%`,
                          animationDelay: `${pos.delay}s`,
                          animationDuration: `${pos.duration}s`
                        }}
                      />
                    ))}
                    {/* Estrellas */}
                    {particlePositions.slice(13, 19).map((pos, i) => (
                      <div
                        key={`star-${i}`}
                        className="absolute text-yellow-300 opacity-50 animate-pulse"
                        style={{
                          left: `${pos.left}%`,
                          top: `${pos.top}%`,
                          fontSize: `${8 + (i * 1.2)}px`,
                          animationDelay: `${pos.delay}s`,
                          animationDuration: `${pos.duration}s`
                        }}
                      >
                        ✨
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleDownloadGanadores}
                    className="relative inline-flex flex-col items-center justify-center px-10 py-5 bg-[#7CFC00] text-gray-900 font-bold rounded-full shadow-xl transform transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 overflow-visible border-2 border-yellow-300 hover:border-yellow-200"
                    style={{
                      boxShadow: '0 10px 40px rgba(124, 252, 0, 0.4), 0 0 30px rgba(124, 252, 0, 0.2), inset 0 2px 10px rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {/* Contenido del botón */}
                    <span className="relative z-10 flex flex-col items-center gap-1">
                      <span className="text-lg md:text-xl leading-tight">DESCUBRE LOS</span>
                      <span className="flex items-center gap-2 text-xl md:text-2xl leading-tight">
                        <span>GANADORES</span>
                        <Trophy className="h-7 w-7 md:h-9 md:w-9 text-yellow-200 drop-shadow-lg transition-transform duration-300 hover:rotate-12" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <Carousel className="max-w-4xl mx-auto" autoPlay={true} autoPlayInterval={6000}>
            <CarouselContent>
              <CarouselItem>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                      Proyecto de Emprendimiento para Jóvenes en Nariño
                      <span className="block text-white">Gobernación de Nariño</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
                      Una estrategia de fortalecimiento y apoyo para 728 emprendimientos en 64 municipios de Nariño, 
                      con acompañamiento en formación y entrega de activos productivos.
                    </p>
                  </div>
                  <div className="w-full max-w-6xl">
                    <img src="/Banner2.png" alt="EmprendiPaz - Jóvenes emprendedores" className="rounded-lg shadow w-full h-auto" />
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                      EmprendiPaz
                      <span className="block text-white">Para jóvenes que transforman territorios</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl">
                      Únete a la iniciativa que impulsa el emprendimiento juvenil en Nariño. 
                      Formación, acompañamiento y activos productivos para tu proyecto.
                    </p>
                  </div>
                  <div className="w-full max-w-6xl">
                    <img src="/Banner1.png" alt="EmprendiPaz - Jóvenes emprendedores" className="rounded-lg shadow w-full h-auto" />
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                      EmprendiPaz
                      <span className="block text-white">Para jóvenes que transforman territorios</span>
                    </h2>
                  </div>
                  <div className="w-full max-w-6xl">
                    <img src="/Banner3.png" alt="EmprendiPaz - Jóvenes emprendedores" className="rounded-lg shadow w-full h-auto" />
                  </div>
                </div>
              </CarouselItem>
              {customBanners.map((banner) => (
                <CarouselItem key={`custom-banner-${banner.id}`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 max-w-5xl">
                      <h2 className="whitespace-pre-line text-4xl md:text-6xl font-bold text-gray-900 mb-5">
                        {banner.title}
                      </h2>
                      <p className="whitespace-pre-line text-lg md:text-2xl text-gray-900 mb-6 max-w-4xl mx-auto">
                        {banner.body}
                      </p>
                    </div>
                    <div className="w-full max-w-6xl">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="rounded-lg shadow w-full h-auto"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section id="caracteristicas" className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Fases del Proyecto
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              El proyecto está estructurado en 3 fases para garantizar un acompañamiento 
              integral a los emprendimientos juveniles de Nariño.
            </p>
          </div>
          
          {/* Timeline Horizontal Interactivo */}
          <HorizontalTimeline />

          {/* Módulos de Formación Interactivos */}
          <FormationTabs />
        </div>
      </section>

      {/* Cobertura Territorial */}
      <section 
        id="beneficios" 
        className="py-20 bg-gradient-to-br from-green-800 to-yellow-400 relative overflow-hidden group"
        onMouseEnter={(e) => {
          const glowElement = e.currentTarget.querySelector('.animate-border-glow');
          if (glowElement) glowElement.classList.add('running');
        }}
        onMouseLeave={(e) => {
          const glowElement = e.currentTarget.querySelector('.animate-border-glow');
          if (glowElement) glowElement.classList.remove('running');
        }}
      >
        {/* Línea luminosa que recorre el perímetro */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[150px] h-[3px] bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-lg shadow-yellow-300/50 animate-border-glow"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cobertura Territorial
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              El proyecto tiene alcance departamental, cubriendo las 13 subregiones 
              de Nariño con participación en 64 municipios. Incluye acompañamiento integral 
              con sesiones virtuales y presenciales en nodos estratégicos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="group-hover:text-white transition-colors duration-300">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-100">13 Subregiones</h3>
                  <p className="text-white/80">
                    Cobertura integral en todas las subregiones del departamento de Nariño, 
                    garantizando equidad territorial en el acceso al programa.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300 delay-100">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="group-hover:text-white transition-colors duration-300">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-100">64 Municipios</h3>
                  <p className="text-white/80">
                    Participación activa en 64 municipios del departamento, 
                    garantizando cobertura territorial completa y equitativa.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300 delay-200">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="group-hover:text-white transition-colors duration-300">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-100">Asistencia Técnica</h3>
                  <p className="text-white/80">
                    Acompañamiento técnico especializado a emprendedores durante 
                    todo el proceso del programa para garantizar el éxito.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300 delay-300">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="group-hover:text-white transition-colors duration-300">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-100">11 Nodos Estratégicos</h3>
                  <p className="text-white/80">
                    Cobertura integral en todo el territorio, con seguimiento e impacto continuo 
                    para medir el desarrollo territorial.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Indicadores y Metas del Proyecto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-3 shadow-sm border text-center min-h-[100px] flex flex-col justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="text-3xl font-bold text-green-600 mb-1 counter group-hover:scale-110 transition-transform duration-300" data-target="728">0</div>
                  <p className="text-gray-600 text-[10px] leading-tight px-2 group-hover:text-green-700 transition-colors duration-300">Emprendedores formados</p>
                  <small className="text-gray-500 text-[9px]">(Meta principal)</small>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border text-center min-h-[100px] flex flex-col justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group delay-75">
                  <div className="text-3xl font-bold text-yellow-600 mb-1 counter group-hover:scale-110 transition-transform duration-300" data-target="436">0</div>
                  <p className="text-gray-600 text-[10px] leading-tight px-2 group-hover:text-yellow-700 transition-colors duration-300">Emprendedores con activos productivos</p>
                  <small className="text-gray-500 text-[9px]">(Fortalecidos)</small>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border text-center min-h-[100px] flex flex-col justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group delay-150">
                  <div className="text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300">64</div>
                  <p className="text-gray-600 text-[10px] leading-tight px-2 group-hover:text-blue-700 transition-colors duration-300">Municipios participantes</p>
                  <small className="text-gray-500 text-[9px]">(Cobertura total)</small>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border text-center min-h-[100px] flex flex-col justify-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group delay-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform duration-300">13</div>
                  <p className="text-gray-600 text-[10px] leading-tight px-2 group-hover:text-purple-700 transition-colors duration-300">Subregiones cubiertas</p>
                  <small className="text-gray-500 text-[9px]">(Alcance departamental)</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nodos y Municipios */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nodos Estratégicos y Municipios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora la distribución territorial del proyecto por nodos de coordinación 
              y municipios participantes en cada subregión.
            </p>
          </div>
          
          <NodesTable />
        </div>
      </section>

      {/* Imagen adicional */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <a href="https://fundacionunivalle.com/" target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
              <img 
                src="/2.png" 
                alt="Fundación Universidad del Valle" 
                className="w-full h-auto rounded-lg shadow-md object-contain"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <img src="/emprendipaz.png" alt="EmprendiPaz" className="h-12" />
              </div>
              <p className="text-gray-300 mb-4">
                Este proyecto lo desarrolla la Gobernacion de nariño, con principios
                de transparencia, equidad y acompañamiento a los jóvenes emprendedores del departamento.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#inicio" className="text-gray-300 hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#caracteristicas" className="text-gray-300 hover:text-white transition-colors">Fases</a></li>
                <li><a href="#beneficios" className="text-gray-300 hover:text-white transition-colors">Cobertura</a></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Iniciar Sesión</Link></li>
                {/* Link de Subsanación deshabilitado por solicitud del usuario */}
                {/* <li>
                  <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                    Subsanación
                  </Link>
                </li> */}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-300">
                <p>📧 consorcioprimeronarino@gmail.com </p>
                <p>📍 Pasto, Nariño, Colombia</p>
                <p>🌐 www.narino.gov.co</p>
              </div>
              <p className="text-sm font-medium text-gray-200 mt-5 mb-3">Redes sociales</p>
              <div className="flex flex-wrap items-center gap-5">
                {LANDING_SOCIAL_LINKS.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded"
                  >
                    <Icon className="h-7 w-7" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © <span 
                onClick={handleSecretClick}
                onTouchEnd={handleSecretTouch}
                className="select-none"
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                title=""
              >
                2026
              </span> Gobernación de Nariño. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

