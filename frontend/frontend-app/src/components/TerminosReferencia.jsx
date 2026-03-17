import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Download, FileText, Users, Target, Calendar, MapPin, FileSpreadsheet, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logoGobernacion from '../assets/logo-gobernacion.png'
import logoGov from '../assets/logo-gov.png'
import emailjs from '@emailjs/browser'

const TerminosReferencia = () => {
  const { isAdmin } = useAuth()
  // Estado para el acordeón del formulario
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // Estado para el acordeón de información importante
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    celular: '',
    correo: '',
    municipio: '',
    duda: ''
  })

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Función para enviar el formulario con EmailJS
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // mostrar mensaje de carga
      alert('Enviando consulta...')
      
      // Configurar EmailJS con credenciales directas
      emailjs.init('L-mZkum1V3UydsMN0')
      
      // Preparar los parámetros del template
      const templateParams = {
        from_name: formData.nombre,
        from_email: formData.correo,
        cedula: formData.cedula,
        celular: formData.celular,
        municipio: formData.municipio,
        message: formData.duda,
        to_email: 'consorcioprimeronarino@gmail.com',
        reply_to: formData.correo
      }
      
      // Enviar email usando EmailJS
      const response = await emailjs.send(
        'service_8383n0g',
        'template_j0f8bn4',
        templateParams
      )
      
      console.log('Email enviado exitosamente:', response)
      alert('¡Gracias por tu consulta! Tu mensaje ha sido enviado correctamente.')
      
      // Limpiar el formulario
      setFormData({
        nombre: '',
        cedula: '',
        celular: '',
        correo: '',
        municipio: '',
        duda: ''
      })
      setIsFormOpen(false)
      
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      alert('Hubo un error al enviar tu consulta. Por favor, inténtalo de nuevo o contacta directamente a consorcioprimeronarino@gmail.com')
    }
  }

  // Lista de documentos disponibles
  const documentos = [
    {
      id: 1,
      nombre: "Modificatorio 2",
      archivo: "Terminos_Subsanacion.pdf",
      tipo: "pdf",
      descripcion: "Modificatorio 2 a los términos de referencia del programa"
    },
    {
      id: 2,
      nombre: "TDR Ajustados",
      archivo: "0. TDR Ajustados.pdf",
      tipo: "pdf",
      descripcion: "Términos de Referencia Ajustados del programa"
    },
    {
      id: 3,
      nombre: "MODIFICACIÓN No.1 A LOS TÉRMINOS DE REFERENCIA",
      archivo: "MODIFICACIÓN No.1 A LOS TÉRMINOS DE REFERENCIA.pdf",
      tipo: "pdf",
      descripcion: "Modificación a los términos de referencia del programa"
    },
    {
      id: 4,
      nombre: "Certificado de Vecindad",
      archivo: "5.Certificado de Vecindad.pdf",
      tipo: "pdf",
      descripcion: "Formato de certificación de residencia"
    },
    {
      id: 5,
      nombre: "Documento Instructivo",
      archivo: "8. Documento_instructivo_video.pdf",
      tipo: "pdf",
      descripcion: "para el video de presentación"
    },
    {
      id: 6,
      nombre: "Certificado de Compromiso",
      archivo: "3. Certificado de Compromiso.pdf",
      tipo: "pdf",
      descripcion: "Formato de certificación de compromiso del participante"
    },
    {
      id: 7,
      nombre: "Autorización de Datos",
      archivo: "4. Autorización.pdf",
      tipo: "pdf",
      descripcion: "Autorización para el uso de datos personales e imagen"
    },
    {
      id: 8,
      nombre: "Plan de Negocio",
      archivo: "6. FORMATO PLAN DE NEGOCIO INSCRIPCIÓN.xlsx",
      tipo: "excel",
      descripcion: "Formato para el plan de negocio del emprendimiento"
    },
    {
      id: 9,
      nombre: "Declaración Jurada",
      archivo: "7. DECLARACIÓN JURAMENTADA DE CAPACIDAD LEGAL.pdf",
      tipo: "pdf",
      descripcion: "Declaración jurada de capacidad legal"
    },
    {
      id: 10,
      nombre: "Lista de Chequeo",
      archivo: "2. Lista de chequeo.pdf",
      tipo: "pdf",
      descripcion: "Lista de verificación para el proceso de inscripción"
    }
  ];

  // Función para descargar documentos
  const handleDownloadDocument = (archivo, nombre) => {
    const link = document.createElement('a');
    // Codificar la URL correctamente para manejar caracteres especiales
    link.href = `/Terminos/${encodeURIComponent(archivo)}`;
    
    // Agregar extensión correcta según el tipo de archivo
    const extension = archivo.includes('.xlsx') ? '.xlsx' : 
                     archivo.includes('.pdf') ? '.pdf' : '';
    link.download = `${nombre}${extension}`;
    
    // Forzar el tipo MIME correcto
    if (archivo.includes('.xlsx')) {
      link.setAttribute('type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else if (archivo.includes('.pdf')) {
      link.setAttribute('type', 'application/pdf');
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center py-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center lg:justify-start">
              <img src="/emprendipaz.png" alt="EmprendiPaz" className="h-10 sm:h-12" />
              <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-10 sm:h-12" />
              <img src="/fundacion.png" alt="Fundación" className="h-10 sm:h-12" />
              <img src="/consorcio.png" alt="Consorcio" className="h-10 sm:h-12" />
            </div>
            <div className="flex items-center space-x-3">
              {/* Botón de Subsanación deshabilitado por solicitud del usuario */}
              {/* <Link to="/register">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 text-sm sm:text-base"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Subsanación</span>
                  <span className="sm:hidden">Subsanación</span>
                </Button>
              </Link> */}
              <Link to="/">
                <Button variant="outline" className="flex items-center space-x-2 text-sm sm:text-base">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Volver al Inicio</span>
                  <span className="sm:hidden">Inicio</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="hero-diagonals bg-gradient-to-br from-yellow-400 via-yellow-300 to-green-500 py-8">
        <div className="diag"></div>
        <div className="diag diag2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-4">
              Términos de Referencia
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              <span className="text-white font-semibold drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                Programa EmprendiPaz - Jóvenes Emprendedores de Nariño
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Principal */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Video Informativo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <video
                    className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                    controls
                    preload="metadata"
                    poster="/video-poster.jpg"
                  >
                    <source src="/Terminos/Video_instructivo.mp4" type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </CardContent>
            </Card>

            {/* Botón de contacto y formulario */}
            <Card className="shadow-lg mt-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg flex items-center space-x-2 mx-auto"
                    size="lg"
                  >
                    <Mail className="h-5 w-5" />
                    <span>¿Tienes dudas? Escríbenos</span>
                    {isFormOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* Formulario en acordeón */}
                {isFormOpen && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre completo *
                          </label>
                          <Input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu nombre completo"
                          />
                        </div>
                        <div>
                          <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-1">
                            Cédula *
                          </label>
                          <Input
                            id="cedula"
                            name="cedula"
                            type="text"
                            required
                            value={formData.cedula}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu número de cédula"
                          />
                        </div>
                        <div>
                          <label htmlFor="celular" className="block text-sm font-medium text-gray-700 mb-1">
                            Celular *
                          </label>
                          <Input
                            id="celular"
                            name="celular"
                            type="tel"
                            required
                            value={formData.celular}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu número de celular"
                          />
                        </div>
                        <div>
                          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo electrónico *
                          </label>
                          <Input
                            id="correo"
                            name="correo"
                            type="email"
                            required
                            value={formData.correo}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu correo electrónico"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-1">
                            Municipio *
                          </label>
                          <Input
                            id="municipio"
                            name="municipio"
                            type="text"
                            required
                            value={formData.municipio}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu municipio"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="duda" className="block text-sm font-medium text-gray-700 mb-1">
                            Tu duda o consulta *
                          </label>
                          <textarea
                            id="duda"
                            name="duda"
                            required
                            rows={4}
                            value={formData.duda}
                            onChange={handleInputChange}
                            placeholder="Describe tu duda o consulta aquí..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-center pt-4">
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                        >
                          Enviar Consulta
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card className="shadow-lg bg-gradient-to-br from-green-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="text-xl text-center">Documentos del Programa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-center text-sm">
                  Descarga todos los documentos necesarios para participar en el Programa EmprendiPaz
                </p>
                <div className="space-y-3">
                  {documentos.map((doc) => (
                    <div key={doc.id}>
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 mt-1">
                              {doc.tipo === 'excel' ? (
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <h4 className="font-semibold text-sm text-gray-900 leading-tight break-words">
                                {doc.nombre}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {doc.descripcion}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownloadDocument(doc.archivo, doc.nombre)}
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 h-8 w-8 p-0 min-w-8"
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Acordeón de información importante solo para la Modificación 1 */}
                      {doc.id === 3 && (
                        <div className="mt-3">
                          <Button
                            onClick={() => setIsInfoOpen(!isInfoOpen)}
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-left bg-blue-50 border-blue-200 hover:bg-blue-100"
                          >
                            <span className="text-sm font-medium text-blue-800">
                              ℹ️ Información Importante sobre la Modificación
                            </span>
                            {isInfoOpen ? (
                              <ChevronUp className="h-4 w-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-blue-600" />
                            )}
                          </Button>
                          
                          {isInfoOpen && (
                            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm text-gray-800 space-y-3">
                                <h5 className="font-semibold text-blue-900 mb-2">
                                  Información Importante Modificación 1 a los términos de referencia
                                </h5>
                                <p>
                                  En los términos de referencia publicados por el Consorcio Primero Nariño en el marco del proyecto <strong>FORTALECIMIENTO DE LA COMPETITIVIDAD DE JÓVENES EMPRENDEDORES EN EL PROCESO DE CONSOLIDACIÓN DE LA PAZ EN EL DEPARTAMENTO DE NARIÑO</strong>, se estableció dentro de los documentos no subsanables, la obligación de presentar el <strong>"Certificado de vecindad diligenciado y sus anexos requeridos (copia de recibo del último mes de un servicio y certificado de vecindad expedido por la JAC o la Secretaría de Gobierno Municipal)"</strong>.
                                </p>
                                <p>
                                  Durante el desarrollo del proceso se evidenció que, este requisito ha generado dificultades significativas para los jóvenes emprendedores, debido a que la obtención del certificado expedido por la JAC o la Secretaría de Gobierno Municipal depende de tiempos de respuesta y trámites ajenos a los beneficiarios, lo que restringe la participación de los emprendedores que quieran postularse.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
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
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Inicio</Link></li>
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
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2026 Gobernación de Nariño. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TerminosReferencia