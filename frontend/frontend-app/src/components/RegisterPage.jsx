import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, ArrowLeft, Upload, FileText, X } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import { MUNICIPIOS_POR_SUBREGION } from '@/constants/municipios'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    sexo: '',
    estado_civil: '',
    telefono: '',
    direccion: '',
    municipio: '',
    emprendimiento_nombre: '',
    emprendimiento_sector: '',
    tipo_persona: '',
    emprendimiento_formalizado: null,
    financiado_estado: null,
    financiado_regalias: false,
    financiado_camara_comercio: false,
    financiado_incubadoras: false,
    financiado_otro: false,
    financiado_otro_texto: '',
    declara_veraz: false,
    declara_no_beneficiario: false,
    acepta_terminos: false,
    password: '',
    confirm_password: '',
    convocatoria: ''
  })
  // Documentos específicos obligatorios
  const [docTerminosPdf, setDocTerminosPdf] = useState(null)
  const [docUsoImagenPdf, setDocUsoImagenPdf] = useState(null)
  const [docPlanNegocioXls, setDocPlanNegocioXls] = useState(null)
  const [docVecindadPdf, setDocVecindadPdf] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  // Documentos condicionales según tipo de persona
  const [rutPdf, setRutPdf] = useState(null)
  const [cedulaPdf, setCedulaPdf] = useState(null)  // Para Persona Natural
  const [cedulaRepresentantePdf, setCedulaRepresentantePdf] = useState(null)  // Para Persona Jurídica
  const [certExistenciaPdf, setCertExistenciaPdf] = useState(null)  // Solo Persona Jurídica
  // Documentos diferenciales (opcionales/subsanables)
  const [ruvPdf, setRuvPdf] = useState(null)
  const [sisbenPdf, setSisbenPdf] = useState(null)
  const [grupoEtnicoPdf, setGrupoEtnicoPdf] = useState(null)
  const [arnPdf, setArnPdf] = useState(null)
  const [discapacidadPdf, setDiscapacidadPdf] = useState(null)
  // Documentos de control (obligatorios)
  const [antecedentesFiscalesPdf, setAntecedentesFiscalesPdf] = useState(null)
  const [antecedentesDisciplinariosPdf, setAntecedentesDisciplinariosPdf] = useState(null)
  const [antecedentesJudicialesPdf, setAntecedentesJudicialesPdf] = useState(null)
  const [redamPdf, setRedamPdf] = useState(null)
  const [inhabSexualesPdf, setInhabSexualesPdf] = useState(null)
  const [declaracionCapacidadPdf, setDeclaracionCapacidadPdf] = useState(null)
  // Documentos de funcionamiento (condicionales según formalización)
  const [matriculaMercantilPdf, setMatriculaMercantilPdf] = useState(null)
  const [facturas6mesesPdf, setFacturas6mesesPdf] = useState(null)
  const [publicacionesRedesPdf, setPublicacionesRedesPdf] = useState(null)
  const [registroVentasPdf, setRegistroVentasPdf] = useState(null)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return pattern.test(email)
  }

  const validatePassword = (password) => {
    if (password.length < 8) return false
    if (!/[a-zA-Z]/.test(password)) return false
    if (!/[0-9]/.test(password)) return false
    return true
  }

  const calcAge = (isoDate) => {
    try {
      const dob = new Date(isoDate)
      if (Number.isNaN(dob.getTime())) return null
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
      return age
    } catch {
      return null
    }
  }

  const MUNICIPIOS_FLAT = useMemo(() => {
    return Object.entries(MUNICIPIOS_POR_SUBREGION).flatMap(([subregion, arr]) =>
      arr.map((m) => ({ nombre: m.nombre, subregion }))
    )
  }, [])

  const handleFileChange = (e, setFile, fileType, allowedTypes = ['application/pdf']) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!allowedTypes.includes(file.type)) {
        const typeNames = allowedTypes.includes('application/pdf') && allowedTypes.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') 
          ? 'PDF o Excel' 
          : allowedTypes.includes('application/pdf') ? 'PDF' : 'Excel'
        setErrors(prev => ({ ...prev, [fileType]: `Solo se permiten archivos ${typeNames}` }))
        return
      }
      
      // Validar tamaño (máximo 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fileType]: 'El archivo no puede ser mayor a 20MB' }))
        return
      }
      
      setFile(file)
      setErrors(prev => ({ ...prev, [fileType]: '' }))
    }
  }

  const removeFile = (setFile, fileType) => {
    setFile(null)
    setErrors(prev => ({ ...prev, [fileType]: '' }))
  }

  const renderDocumentUpload = (id, label, file, setFile, fileType, acceptTypes = '.pdf', allowedMimeTypes = ['application/pdf'], isOptional = false) => {
    const hasFile = !!file
    const isSubmitted = !!successMessage
    const statusColor = hasFile ? 'text-green-600' : isOptional ? 'text-yellow-600' : 'text-red-600'
    const statusText = hasFile ? '📂 Archivo cargado correctamente' : 
                       isOptional ? '⚠️ Documento no cargado (subsanable)' : 
                       '❌ Falta documento obligatorio'
    
    return (
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={id}>
          {label} {!isOptional && '*'}
          <span className={`ml-2 text-sm font-medium ${statusColor}`}>
            {statusText}
          </span>
        </Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
          {!hasFile ? (
            <div>
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Haz clic para seleccionar o arrastra tu archivo
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Máximo 20MB • {acceptTypes.includes('.xlsx') ? 'Solo archivos Excel' : 'Solo archivos PDF'}
              </p>
              <input
                id={id}
                type="file"
                accept={acceptTypes}
                onChange={(e) => handleFileChange(e, setFile, fileType, allowedMimeTypes)}
                className="hidden"
                disabled={isSubmitted}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(id).click()}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                disabled={isSubmitted}
              >
                Seleccionar Archivo
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!isSubmitted && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(setFile, fileType)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        {errors[fileType] && (
          <p className="text-sm text-red-600">{errors[fileType]}</p>
        )}
      </div>
    )
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result.split(',')[1] // Remover el prefijo data:application/pdf;base64,
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar campos obligatorios
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido'
    }

    if (!formData.tipo_documento.trim()) {
      newErrors.tipo_documento = 'El tipo de documento es obligatorio'
    }

    if (!formData.numero_documento.trim()) {
      newErrors.numero_documento = 'El número de documento es obligatorio'
    }

    // Fecha de nacimiento (18–32)
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
    } else {
      const age = calcAge(formData.fecha_nacimiento)
      if (age === null) {
        newErrors.fecha_nacimiento = 'Fecha inválida'
      } else if (age < 18 || age > 32) {
        newErrors.fecha_nacimiento = 'La edad debe estar entre 18 y 32 años'
      }
    }

    if (!formData.sexo) {
      newErrors.sexo = 'El sexo es obligatorio'
    }

    if (!formData.estado_civil) {
      newErrors.estado_civil = 'El estado civil es obligatorio'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono celular es obligatorio'
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección de residencia es obligatoria'
    }

    if (!formData.municipio) {
      newErrors.municipio = 'El municipio es obligatorio'
    }

    // Emprendimiento
    if (!formData.emprendimiento_nombre.trim()) {
      newErrors.emprendimiento_nombre = 'El nombre del emprendimiento es obligatorio'
    }
    if (!formData.emprendimiento_sector) {
      newErrors.emprendimiento_sector = 'El sector económico es obligatorio'
    }
    if (!formData.tipo_persona) {
      newErrors.tipo_persona = 'El tipo de persona es obligatorio'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirmar contraseña es obligatorio'
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden'
    }

    if (!formData.convocatoria) {
      newErrors.convocatoria = 'La convocatoria es obligatoria'
    }

    // Validar documentos obligatorios
    if (!docTerminosPdf) {
      newErrors.doc_terminos_pdf = 'El formato de términos de referencia es obligatorio'
    }

    if (!docUsoImagenPdf) {
      newErrors.doc_uso_imagen_pdf = 'El formato de autorización de uso de imagen es obligatorio'
    }

    if (!docPlanNegocioXls) {
      newErrors.doc_plan_negocio_xls = 'El plan de negocio es obligatorio'
    }

    if (!docVecindadPdf) {
      newErrors.doc_vecindad_pdf = 'El certificado de vecindad es obligatorio'
    }

    // Validar documentos condicionales según tipo de persona
    if (formData.tipo_persona === 'natural') {
      if (!rutPdf) {
        newErrors.rut_pdf = 'El RUT actualizado 2025 es obligatorio para Persona Natural'
      }
      if (!cedulaPdf) {
        newErrors.cedula_pdf = 'La cédula de ciudadanía es obligatoria para Persona Natural'
      }
    } else if (formData.tipo_persona === 'juridica') {
      if (!rutPdf) {
        newErrors.rut_pdf = 'El RUT actualizado 2025 es obligatorio para Persona Jurídica'
      }
      if (!cedulaRepresentantePdf) {
        newErrors.cedula_representante_pdf = 'La cédula del representante legal es obligatoria para Persona Jurídica'
      }
      if (!certExistenciaPdf) {
        newErrors.cert_existencia_pdf = 'El certificado de existencia y representación legal es obligatorio para Persona Jurídica'
      }
    }

    // Validar documentos de control (OBLIGATORIOS - bloquean envío)
    if (!antecedentesFiscalesPdf) {
      newErrors.antecedentes_fiscales_pdf = 'Los antecedentes fiscales (Contraloría) son obligatorios'
    }

    if (!antecedentesDisciplinariosPdf) {
      newErrors.antecedentes_disciplinarios_pdf = 'Los antecedentes disciplinarios (Procuraduría) son obligatorios'
    }

    if (!antecedentesJudicialesPdf) {
      newErrors.antecedentes_judiciales_pdf = 'Los antecedentes judiciales (Policía Nacional) son obligatorios'
    }

    if (!redamPdf) {
      newErrors.redam_pdf = 'El certificado REDAM es obligatorio'
    }

    if (!inhabSexualesPdf) {
      newErrors.inhabilidades_sexuales_pdf = 'La consulta de inhabilidades por delitos sexuales es obligatoria'
    }

    if (!declaracionCapacidadPdf) {
      newErrors.declaracion_capacidad_legal_pdf = 'La declaración juramentada de capacidad legal es obligatoria'
    }

    // Validar certificación de funcionamiento (condicional)
    if (!formData.emprendimiento_formalizado && formData.emprendimiento_formalizado !== false) {
      newErrors.emprendimiento_formalizado = 'Debe especificar si el emprendimiento está formalizado'
    }

    if (formData.emprendimiento_formalizado === true) {
      // Emprendimiento formalizado - requiere matrícula y facturas
      if (!matriculaMercantilPdf) {
        newErrors.matricula_mercantil_pdf = 'La matrícula mercantil es obligatoria para emprendimientos formalizados'
      }
      if (!facturas6mesesPdf) {
        newErrors.facturas_6meses_pdf = 'Las facturas de los últimos 6 meses son obligatorias para emprendimientos formalizados'
      }
    } else if (formData.emprendimiento_formalizado === false) {
      // Emprendimiento informal - requiere publicaciones y registro de ventas
      if (!publicacionesRedesPdf) {
        newErrors.publicaciones_redes_pdf = 'Las publicaciones de redes sociales son obligatorias para emprendimientos informales'
      }
      if (!registroVentasPdf) {
        newErrors.registro_ventas_pdf = 'El registro de ventas es obligatorio para emprendimientos informales'
      }
    }

    // Validar financiación de otras fuentes (obligatoria)
    if (!formData.financiado_estado && formData.financiado_estado !== false) {
      newErrors.financiado_estado = 'Debe especificar si el emprendimiento ha sido financiado por otros programas del Estado'
    }

    if (formData.financiado_estado === true) {
      // Si ha sido financiado, debe especificar al menos una fuente
      if (!formData.financiado_regalias && !formData.financiado_camara_comercio && 
          !formData.financiado_incubadoras && !formData.financiado_otro) {
        newErrors.financiado_fuentes = 'Si el emprendimiento ha sido financiado, debe especificar al menos una fuente de financiación'
      }
      
      // Si marcó "otro", debe proporcionar el texto
      if (formData.financiado_otro && !formData.financiado_otro_texto.trim()) {
        newErrors.financiado_otro_texto = 'Si selecciona "Otro" como fuente de financiación, debe especificar cuál'
      }
    }

    // Validar declaraciones y aceptaciones (obligatorias)
    if (!formData.declara_veraz) {
      newErrors.declara_veraz = 'Debe declarar que la información suministrada es veraz'
    }

    if (!formData.declara_no_beneficiario) {
      newErrors.declara_no_beneficiario = 'Debe declarar que no ha sido beneficiario de recursos públicos para este emprendimiento'
    }

    if (!formData.acepta_terminos) {
      newErrors.acepta_terminos = 'Debe aceptar los términos y condiciones de la convocatoria'
    }

    // Mensaje general si faltan declaraciones
    if (!formData.declara_veraz || !formData.declara_no_beneficiario || !formData.acepta_terminos) {
      newErrors.declaraciones_general = 'Debe aceptar todas las declaraciones para continuar con la inscripción'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      // Preparar datos del formulario con archivos
      const submitData = { ...formData }
      
      // Convertir documentos específicos a base64
      if (docTerminosPdf) {
        submitData.doc_terminos_pdf = await convertFileToBase64(docTerminosPdf)
        submitData.doc_terminos_pdf_nombre = docTerminosPdf.name
      }
      
      if (docUsoImagenPdf) {
        submitData.doc_uso_imagen_pdf = await convertFileToBase64(docUsoImagenPdf)
        submitData.doc_uso_imagen_pdf_nombre = docUsoImagenPdf.name
      }
      
      if (docPlanNegocioXls) {
        submitData.doc_plan_negocio_xls = await convertFileToBase64(docPlanNegocioXls)
        submitData.doc_plan_negocio_nombre = docPlanNegocioXls.name
      }
      
      if (docVecindadPdf) {
        submitData.doc_vecindad_pdf = await convertFileToBase64(docVecindadPdf)
        submitData.doc_vecindad_pdf_nombre = docVecindadPdf.name
      }
      
      if (videoUrl.trim()) {
        submitData.video_url = videoUrl.trim()
      }
      
      // Documentos condicionales según tipo de persona
      if (rutPdf) {
        submitData.rut_pdf = await convertFileToBase64(rutPdf)
        submitData.rut_pdf_nombre = rutPdf.name
      }
      
      if (formData.tipo_persona === 'natural' && cedulaPdf) {
        submitData.cedula_pdf = await convertFileToBase64(cedulaPdf)
        submitData.cedula_pdf_nombre = cedulaPdf.name
      }
      
      if (formData.tipo_persona === 'juridica') {
        if (cedulaRepresentantePdf) {
          submitData.cedula_representante_pdf = await convertFileToBase64(cedulaRepresentantePdf)
          submitData.cedula_representante_pdf_nombre = cedulaRepresentantePdf.name
        }
        if (certExistenciaPdf) {
          submitData.cert_existencia_pdf = await convertFileToBase64(certExistenciaPdf)
          submitData.cert_existencia_pdf_nombre = certExistenciaPdf.name
        }
      }
      
      // Documentos diferenciales (opcionales)
      if (ruvPdf) {
        submitData.ruv_pdf = await convertFileToBase64(ruvPdf)
        submitData.ruv_pdf_nombre = ruvPdf.name
      }
      
      if (sisbenPdf) {
        submitData.sisben_pdf = await convertFileToBase64(sisbenPdf)
        submitData.sisben_pdf_nombre = sisbenPdf.name
      }
      
      if (grupoEtnicoPdf) {
        submitData.grupo_etnico_pdf = await convertFileToBase64(grupoEtnicoPdf)
        submitData.grupo_etnico_pdf_nombre = grupoEtnicoPdf.name
      }
      
      if (arnPdf) {
        submitData.arn_pdf = await convertFileToBase64(arnPdf)
        submitData.arn_pdf_nombre = arnPdf.name
      }
      
      if (discapacidadPdf) {
        submitData.discapacidad_pdf = await convertFileToBase64(discapacidadPdf)
        submitData.discapacidad_pdf_nombre = discapacidadPdf.name
      }
      
      // Documentos de control (obligatorios)
      if (antecedentesFiscalesPdf) {
        submitData.antecedentes_fiscales_pdf = await convertFileToBase64(antecedentesFiscalesPdf)
        submitData.antecedentes_fiscales_pdf_nombre = antecedentesFiscalesPdf.name
      }
      
      if (antecedentesDisciplinariosPdf) {
        submitData.antecedentes_disciplinarios_pdf = await convertFileToBase64(antecedentesDisciplinariosPdf)
        submitData.antecedentes_disciplinarios_pdf_nombre = antecedentesDisciplinariosPdf.name
      }
      
      if (antecedentesJudicialesPdf) {
        submitData.antecedentes_judiciales_pdf = await convertFileToBase64(antecedentesJudicialesPdf)
        submitData.antecedentes_judiciales_pdf_nombre = antecedentesJudicialesPdf.name
      }
      
      if (redamPdf) {
        submitData.redam_pdf = await convertFileToBase64(redamPdf)
        submitData.redam_pdf_nombre = redamPdf.name
      }
      
      if (inhabSexualesPdf) {
        submitData.inhabilidades_sexuales_pdf = await convertFileToBase64(inhabSexualesPdf)
        submitData.inhabilidades_sexuales_pdf_nombre = inhabSexualesPdf.name
      }
      
      if (declaracionCapacidadPdf) {
        submitData.declaracion_capacidad_legal_pdf = await convertFileToBase64(declaracionCapacidadPdf)
        submitData.declaracion_capacidad_legal_pdf_nombre = declaracionCapacidadPdf.name
      }
      
      // Documentos de funcionamiento (condicionales)
      if (matriculaMercantilPdf) {
        submitData.matricula_mercantil_pdf = await convertFileToBase64(matriculaMercantilPdf)
        submitData.matricula_mercantil_pdf_nombre = matriculaMercantilPdf.name
      }
      
      if (facturas6mesesPdf) {
        submitData.facturas_6meses_pdf = await convertFileToBase64(facturas6mesesPdf)
        submitData.facturas_6meses_pdf_nombre = facturas6mesesPdf.name
      }
      
      if (publicacionesRedesPdf) {
        submitData.publicaciones_redes_pdf = await convertFileToBase64(publicacionesRedesPdf)
        submitData.publicaciones_redes_pdf_nombre = publicacionesRedesPdf.name
      }
      
      if (registroVentasPdf) {
        submitData.registro_ventas_pdf = await convertFileToBase64(registroVentasPdf)
        submitData.registro_ventas_pdf_nombre = registroVentasPdf.name
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('¡Registro exitoso! Tu cuenta ha sido creada y está pendiente de activación por el administrador. Una vez activada, podrás iniciar sesión.')
        // Limpiar el formulario después del registro exitoso
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          tipo_documento: '',
          numero_documento: '',
          fecha_nacimiento: '',
          sexo: '',
          estado_civil: '',
          telefono: '',
          direccion: '',
          municipio: '',
          emprendimiento_nombre: '',
          emprendimiento_sector: '',
          tipo_persona: '',
          password: '',
          confirm_password: '',
          convocatoria: ''
        })
        setDocumentoPdf(null)
        setRequisitosPdf(null)
      } else {
        if (data.error) {
          setErrors({ general: data.error })
        }
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión. Por favor, intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img src={logoGobernacion} alt="Gobernación de Nariño" className="h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Plataforma E-Learning</h1>
          <p className="text-gray-600">Gobernación de Nariño</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <CardTitle className="text-2xl font-bold text-gray-800">Crear Cuenta</CardTitle>
            </div>
            <CardDescription>
              Completa el formulario para registrarte en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mensaje de éxito */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800 font-medium">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error general */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={errors.nombre ? 'border-red-500' : ''}
                  placeholder="Ingresa tu nombre"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className={errors.apellido ? 'border-red-500' : ''}
                  placeholder="Ingresa tu apellido"
                />
                {errors.apellido && (
                  <p className="text-sm text-red-600">{errors.apellido}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                <Select
                  value={formData.tipo_documento}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_documento: value }))
                    if (errors.tipo_documento) {
                      setErrors(prev => ({ ...prev, tipo_documento: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={(errors.tipo_documento ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedula_ciudadania">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="tarjeta_identidad">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="cedula_extranjeria">Cédula de Extranjería</SelectItem>
                    <SelectItem value="dni">DNI</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_documento && (
                  <p className="text-sm text-red-600">{errors.tipo_documento}</p>
                )}
              </div>

              {/* Número de Documento */}
              <div className="space-y-2">
                <Label htmlFor="numero_documento">Número de Documento *</Label>
                <Input
                  id="numero_documento"
                  name="numero_documento"
                  type="text"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  className={errors.numero_documento ? 'border-red-500' : ''}
                  placeholder="Ingresa tu número de documento"
                />
                {errors.numero_documento && (
                  <p className="text-sm text-red-600">{errors.numero_documento}</p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className={errors.fecha_nacimiento ? 'border-red-500' : ''}
                />
                {errors.fecha_nacimiento && (
                  <p className="text-sm text-red-600">{errors.fecha_nacimiento}</p>
                )}
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo *</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, sexo: value }))
                    if (errors.sexo) setErrors(prev => ({ ...prev, sexo: '' }))
                  }}
                >
                  <SelectTrigger className={(errors.sexo ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona tu sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexo && (
                  <p className="text-sm text-red-600">{errors.sexo}</p>
                )}
              </div>

              {/* Estado Civil */}
              <div className="space-y-2">
                <Label htmlFor="estado_civil">Estado Civil *</Label>
                <Select
                  value={formData.estado_civil}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, estado_civil: value }))
                    if (errors.estado_civil) setErrors(prev => ({ ...prev, estado_civil: '' }))
                  }}
                >
                  <SelectTrigger className={(errors.estado_civil ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona tu estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soltero">Soltero(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="union_libre">Unión libre</SelectItem>
                    <SelectItem value="separado">Separado(a)</SelectItem>
                    <SelectItem value="viudo">Viudo(a)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado_civil && (
                  <p className="text-sm text-red-600">{errors.estado_civil}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono Celular *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={errors.telefono ? 'border-red-500' : ''}
                  placeholder="Ingresa tu número de celular"
                />
                {errors.telefono && (
                  <p className="text-sm text-red-600">{errors.telefono}</p>
                )}
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de Residencia *</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={errors.direccion ? 'border-red-500' : ''}
                  placeholder="Ingresa tu dirección"
                />
                {errors.direccion && (
                  <p className="text-sm text-red-600">{errors.direccion}</p>
                )}
              </div>

              {/* Municipio */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="municipio">Municipio de Residencia *</Label>
                <Select
                  value={formData.municipio}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, municipio: value }))
                    if (errors.municipio) setErrors(prev => ({ ...prev, municipio: '' }))
                  }}
                >
                  <SelectTrigger className={(errors.municipio ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona tu municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MUNICIPIOS_POR_SUBREGION).map(([subregion, items]) => (
                      <div key={subregion} className="px-2 py-1 text-xs text-gray-500">
                        {subregion}
                        {items.map((m) => (
                          <SelectItem key={m.nombre} value={m.nombre}>{m.nombre}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                {errors.municipio && (
                  <p className="text-sm text-red-600">{errors.municipio}</p>
                )}
              </div>

              {/* Emprendimiento: Nombre */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emprendimiento_nombre">Nombre del Emprendimiento *</Label>
                <Input
                  id="emprendimiento_nombre"
                  name="emprendimiento_nombre"
                  type="text"
                  value={formData.emprendimiento_nombre}
                  onChange={handleInputChange}
                  className={errors.emprendimiento_nombre ? 'border-red-500' : ''}
                  placeholder="Ingresa el nombre del emprendimiento"
                />
                {errors.emprendimiento_nombre && (
                  <p className="text-sm text-red-600">{errors.emprendimiento_nombre}</p>
                )}
              </div>

              {/* Emprendimiento: Sector Económico */}
              <div className="space-y-2">
                <Label htmlFor="emprendimiento_sector">Sector Económico *</Label>
                <Select
                  value={formData.emprendimiento_sector}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, emprendimiento_sector: value }))
                    if (errors.emprendimiento_sector) setErrors(prev => ({ ...prev, emprendimiento_sector: '' }))
                  }}
                >
                  <SelectTrigger className={(errors.emprendimiento_sector ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona el sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agroindustria">Agroindustria</SelectItem>
                    <SelectItem value="industria_comercio">Industria y Comercio</SelectItem>
                    <SelectItem value="turismo_servicios">Turismo / Servicios</SelectItem>
                  </SelectContent>
                </Select>
                {errors.emprendimiento_sector && (
                  <p className="text-sm text-red-600">{errors.emprendimiento_sector}</p>
                )}
              </div>

              {/* Tipo de Persona */}
              <div className="space-y-2">
                <Label htmlFor="tipo_persona">Tipo de Persona *</Label>
                <Select
                  value={formData.tipo_persona}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_persona: value }))
                    if (errors.tipo_persona) setErrors(prev => ({ ...prev, tipo_persona: '' }))
                  }}
                >
                  <SelectTrigger className={(errors.tipo_persona ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona el tipo de persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="juridica">Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_persona && (
                  <p className="text-sm text-red-600">{errors.tipo_persona}</p>
                )}
              </div>

              {/* Formalización del Emprendimiento */}
              <div className="space-y-2">
                <Label htmlFor="emprendimiento_formalizado">¿El emprendimiento está formalizado? *</Label>
                <Select
                  value={formData.emprendimiento_formalizado === true ? 'true' : formData.emprendimiento_formalizado === false ? 'false' : ''}
                  onValueChange={(value) => {
                    const boolValue = value === 'true' ? true : value === 'false' ? false : null
                    setFormData(prev => ({ ...prev, emprendimiento_formalizado: boolValue }))
                    if (errors.emprendimiento_formalizado) setErrors(prev => ({ ...prev, emprendimiento_formalizado: '' }))
                  }}
                >
                  <SelectTrigger className={(errors.emprendimiento_formalizado ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí (Formalizado)</SelectItem>
                    <SelectItem value="false">No (Informal)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.emprendimiento_formalizado && (
                  <p className="text-sm text-red-600">{errors.emprendimiento_formalizado}</p>
                )}
              </div>

              {/* Documentación Obligatoria */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Documentación Obligatoria</h3>
              </div>

              {/* Términos de Referencia */}
              {renderDocumentUpload(
                'doc_terminos_pdf',
                'Formato de aceptación de términos de referencia',
                docTerminosPdf,
                setDocTerminosPdf,
                'doc_terminos_pdf'
              )}

              {/* Autorización de Uso de Imagen */}
              {renderDocumentUpload(
                'doc_uso_imagen_pdf',
                'Formato de autorización de uso de imagen',
                docUsoImagenPdf,
                setDocUsoImagenPdf,
                'doc_uso_imagen_pdf'
              )}

              {/* Plan de Negocio */}
              {renderDocumentUpload(
                'doc_plan_negocio_xls',
                'Plan de Negocio (formato Excel)',
                docPlanNegocioXls,
                setDocPlanNegocioXls,
                'doc_plan_negocio_xls',
                '.xlsx,.xls',
                ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
              )}

              {/* Certificado de Vecindad */}
              {renderDocumentUpload(
                'doc_vecindad_pdf',
                'Certificado de vecindad y sus anexos',
                docVecindadPdf,
                setDocVecindadPdf,
                'doc_vecindad_pdf'
              )}

              {/* Video de Presentación (Opcional) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="video_url">
                  Video de presentación del emprendimiento (opcional)
                  <span className="ml-2 text-sm font-medium text-blue-600">
                    📹 Campo opcional por ahora
                  </span>
                </Label>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=... o enlace de video"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full"
                  disabled={!!successMessage}
                />
                <p className="text-xs text-gray-500">
                  Puedes subir tu video a YouTube, Google Drive, etc. y pegar aquí el enlace. Máximo 5 minutos.
                </p>
              </div>


              {/* Documentación Diferencial (Subsanable/Opcional) */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Documentación Diferencial (Opcional - Subsanable)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Estos documentos son opcionales y pueden ser subsanados posteriormente si aplican a tu situación.
                </p>
              </div>

              {/* RUV */}
              {renderDocumentUpload(
                'ruv_pdf',
                'Certificado del Registro Único de Víctimas (RUV)',
                ruvPdf,
                setRuvPdf,
                'ruv_pdf',
                '.pdf',
                ['application/pdf'],
                true // Es opcional
              )}

              {/* SISBEN */}
              {renderDocumentUpload(
                'sisben_pdf',
                'Copia del SISBEN (grupos A, B o C)',
                sisbenPdf,
                setSisbenPdf,
                'sisben_pdf',
                '.pdf',
                ['application/pdf'],
                true // Es opcional
              )}

              {/* Grupo Étnico */}
              {renderDocumentUpload(
                'grupo_etnico_pdf',
                'Certificado de pertenencia a grupo étnico',
                grupoEtnicoPdf,
                setGrupoEtnicoPdf,
                'grupo_etnico_pdf',
                '.pdf',
                ['application/pdf'],
                true // Es opcional
              )}

              {/* ARN */}
              {renderDocumentUpload(
                'arn_pdf',
                'Certificado de proceso de reincorporación (ARN)',
                arnPdf,
                setArnPdf,
                'arn_pdf',
                '.pdf',
                ['application/pdf'],
                true // Es opcional
              )}

              {/* Discapacidad */}
              {renderDocumentUpload(
                'discapacidad_pdf',
                'Certificado de discapacidad',
                discapacidadPdf,
                setDiscapacidadPdf,
                'discapacidad_pdf',
                '.pdf',
                ['application/pdf'],
                true // Es opcional
              )}

              {/* Documentación de Control (Obligatoria) */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🛡️ Documentación de Control (Obligatoria)
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ <strong>Debe adjuntar todos los certificados de control. Sin ellos, la inscripción no será válida.</strong>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Si se evidencian antecedentes, registros en REDAM o inhabilidades, la solicitud será automáticamente rechazada.
                  </p>
                </div>
              </div>

              {/* Antecedentes Fiscales */}
              {renderDocumentUpload(
                'antecedentes_fiscales_pdf',
                'Antecedentes fiscales (Contraloría)',
                antecedentesFiscalesPdf,
                setAntecedentesFiscalesPdf,
                'antecedentes_fiscales_pdf'
              )}

              {/* Antecedentes Disciplinarios */}
              {renderDocumentUpload(
                'antecedentes_disciplinarios_pdf',
                'Antecedentes disciplinarios (Procuraduría)',
                antecedentesDisciplinariosPdf,
                setAntecedentesDisciplinariosPdf,
                'antecedentes_disciplinarios_pdf'
              )}

              {/* Antecedentes Judiciales */}
              {renderDocumentUpload(
                'antecedentes_judiciales_pdf',
                'Antecedentes judiciales (Policía Nacional)',
                antecedentesJudicialesPdf,
                setAntecedentesJudicialesPdf,
                'antecedentes_judiciales_pdf'
              )}

              {/* REDAM */}
              {renderDocumentUpload(
                'redam_pdf',
                'Certificado REDAM (Registro de Deudores Alimentarios Morosos)',
                redamPdf,
                setRedamPdf,
                'redam_pdf'
              )}

              {/* Inhabilidades Sexuales */}
              {renderDocumentUpload(
                'inhabilidades_sexuales_pdf',
                'Consulta de inhabilidades por delitos sexuales contra menores',
                inhabSexualesPdf,
                setInhabSexualesPdf,
                'inhabilidades_sexuales_pdf'
              )}

              {/* Declaración Capacidad Legal */}
              {renderDocumentUpload(
                'declaracion_capacidad_legal_pdf',
                'Declaración juramentada de capacidad legal',
                declaracionCapacidadPdf,
                setDeclaracionCapacidadPdf,
                'declaracion_capacidad_legal_pdf'
              )}

              {/* Certificación de Funcionamiento del Emprendimiento */}
              {formData.emprendimiento_formalizado !== null && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🏢 Certificación de Funcionamiento del Emprendimiento
                    </h3>
                    <div className={`border rounded-lg p-4 mb-4 ${
                      formData.emprendimiento_formalizado ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        formData.emprendimiento_formalizado ? 'text-blue-700' : 'text-yellow-700'
                      }`}>
                        {formData.emprendimiento_formalizado 
                          ? '📊 Emprendimiento Formalizado: Debe adjuntar matrícula mercantil y facturas de los últimos 6 meses.'
                          : '📱 Emprendimiento Informal: Debe adjuntar publicaciones de redes sociales y registro de ventas de los últimos 6 meses.'
                        }
                      </p>
                    </div>
                  </div>

                  {formData.emprendimiento_formalizado ? (
                    <>
                      {/* Matrícula Mercantil */}
                      {renderDocumentUpload(
                        'matricula_mercantil_pdf',
                        'Matrícula mercantil',
                        matriculaMercantilPdf,
                        setMatriculaMercantilPdf,
                        'matricula_mercantil_pdf'
                      )}

                      {/* Facturas 6 Meses */}
                      {renderDocumentUpload(
                        'facturas_6meses_pdf',
                        'Facturas de los últimos 6 meses',
                        facturas6mesesPdf,
                        setFacturas6mesesPdf,
                        'facturas_6meses_pdf'
                      )}
                    </>
                  ) : (
                    <>
                      {/* Publicaciones Redes */}
                      {renderDocumentUpload(
                        'publicaciones_redes_pdf',
                        'Publicaciones de redes sociales de los últimos 6 meses',
                        publicacionesRedesPdf,
                        setPublicacionesRedesPdf,
                        'publicaciones_redes_pdf'
                      )}

                      {/* Registro Ventas */}
                      {renderDocumentUpload(
                        'registro_ventas_pdf',
                        'Registro de ventas de los últimos 6 meses',
                        registroVentasPdf,
                        setRegistroVentasPdf,
                        'registro_ventas_pdf'
                      )}
                    </>
                  )}
                </>
              )}

              {/* Financiación de Otras Fuentes */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financiación de Otras Fuentes</h3>
              </div>

              {/* Pregunta obligatoria sobre financiación */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="financiado_estado">¿Su emprendimiento ha sido financiado por otros programas del Estado? *</Label>
                <Select
                  value={formData.financiado_estado === true ? 'true' : formData.financiado_estado === false ? 'false' : ''}
                  onValueChange={(value) => {
                    const boolValue = value === 'true' ? true : value === 'false' ? false : null
                    setFormData(prev => ({ 
                      ...prev, 
                      financiado_estado: boolValue,
                      // Resetear fuentes si cambia a "No"
                      financiado_regalias: boolValue ? prev.financiado_regalias : false,
                      financiado_camara_comercio: boolValue ? prev.financiado_camara_comercio : false,
                      financiado_incubadoras: boolValue ? prev.financiado_incubadoras : false,
                      financiado_otro: boolValue ? prev.financiado_otro : false,
                      financiado_otro_texto: boolValue ? prev.financiado_otro_texto : ''
                    }))
                    if (errors.financiado_estado) setErrors(prev => ({ ...prev, financiado_estado: '' }))
                  }}
                >
                  <SelectTrigger className={(errors.financiado_estado ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Sí</SelectItem>
                  </SelectContent>
                </Select>
                {errors.financiado_estado && (
                  <p className="text-sm text-red-600">{errors.financiado_estado}</p>
                )}
              </div>

              {/* Fuentes de financiación (solo si respondió "Sí") */}
              {formData.financiado_estado === true && (
                <>
                  <div className="md:col-span-2">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-orange-700 font-medium">
                        📋 Debe marcar al menos una fuente de financiación:
                      </p>
                    </div>
                  </div>

                  {/* Checkboxes de fuentes */}
                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="financiado_regalias"
                        checked={formData.financiado_regalias}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, financiado_regalias: e.target.checked }))
                          if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                        }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="financiado_regalias" className="text-sm text-gray-700">
                        Regalías
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="financiado_camara_comercio"
                        checked={formData.financiado_camara_comercio}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, financiado_camara_comercio: e.target.checked }))
                          if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                        }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="financiado_camara_comercio" className="text-sm text-gray-700">
                        Cámaras de comercio
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="financiado_incubadoras"
                        checked={formData.financiado_incubadoras}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, financiado_incubadoras: e.target.checked }))
                          if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                        }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="financiado_incubadoras" className="text-sm text-gray-700">
                        Incubadoras de empresas
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="financiado_otro"
                        checked={formData.financiado_otro}
                        onChange={(e) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            financiado_otro: e.target.checked,
                            financiado_otro_texto: e.target.checked ? prev.financiado_otro_texto : ''
                          }))
                          if (errors.financiado_fuentes) setErrors(prev => ({ ...prev, financiado_fuentes: '' }))
                        }}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="financiado_otro" className="text-sm text-gray-700">
                        Otro
                      </label>
                    </div>

                    {/* Campo de texto para "Otro" */}
                    {formData.financiado_otro && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="financiado_otro_texto">Especifique la fuente:</Label>
                        <Input
                          id="financiado_otro_texto"
                          name="financiado_otro_texto"
                          type="text"
                          value={formData.financiado_otro_texto}
                          onChange={handleInputChange}
                          className={errors.financiado_otro_texto ? 'border-red-500' : ''}
                          placeholder="Ingrese la fuente de financiación"
                        />
                        {errors.financiado_otro_texto && (
                          <p className="text-sm text-red-600">{errors.financiado_otro_texto}</p>
                        )}
                      </div>
                    )}

                    {errors.financiado_fuentes && (
                      <p className="text-sm text-red-600">{errors.financiado_fuentes}</p>
                    )}
                  </div>
                </>
              )}

              {/* Declaraciones y Aceptaciones */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Declaraciones y Aceptaciones</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ <strong>Debe aceptar todas las declaraciones para continuar con la inscripción.</strong>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Estas declaraciones son obligatorias por ley y quedan registradas para trazabilidad legal.
                  </p>
                </div>
              </div>

              {/* Checkboxes de declaraciones obligatorias */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="declara_veraz"
                    checked={formData.declara_veraz}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, declara_veraz: e.target.checked }))
                      if (errors.declara_veraz || errors.declaraciones_general) {
                        setErrors(prev => ({ ...prev, declara_veraz: '', declaraciones_general: '' }))
                      }
                    }}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="declara_veraz" className="text-sm text-gray-700 leading-relaxed">
                    <strong>Declaro bajo juramento que la información suministrada es veraz.</strong>
                  </label>
                </div>
                {errors.declara_veraz && (
                  <p className="text-sm text-red-600 ml-7">{errors.declara_veraz}</p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="declara_no_beneficiario"
                    checked={formData.declara_no_beneficiario}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, declara_no_beneficiario: e.target.checked }))
                      if (errors.declara_no_beneficiario || errors.declaraciones_general) {
                        setErrors(prev => ({ ...prev, declara_no_beneficiario: '', declaraciones_general: '' }))
                      }
                    }}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="declara_no_beneficiario" className="text-sm text-gray-700 leading-relaxed">
                    <strong>Declaro que no he sido beneficiario de recursos públicos para el fortalecimiento de este emprendimiento.</strong>
                  </label>
                </div>
                {errors.declara_no_beneficiario && (
                  <p className="text-sm text-red-600 ml-7">{errors.declara_no_beneficiario}</p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acepta_terminos"
                    checked={formData.acepta_terminos}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, acepta_terminos: e.target.checked }))
                      if (errors.acepta_terminos || errors.declaraciones_general) {
                        setErrors(prev => ({ ...prev, acepta_terminos: '', declaraciones_general: '' }))
                      }
                    }}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acepta_terminos" className="text-sm text-gray-700 leading-relaxed">
                    <strong>Acepto los términos y condiciones de la convocatoria.</strong>
                  </label>
                </div>
                {errors.acepta_terminos && (
                  <p className="text-sm text-red-600 ml-7">{errors.acepta_terminos}</p>
                )}

                {errors.declaraciones_general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-medium">{errors.declaraciones_general}</p>
                  </div>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="Mínimo 8 caracteres, letras y números"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>

              {/* Convocatoria */}
              <div className="space-y-2">
                <Label htmlFor="convocatoria">Convocatoria *</Label>
                <Select
                  value={formData.convocatoria}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, convocatoria: value }))
                    if (errors.convocatoria) {
                      setErrors(prev => ({ ...prev, convocatoria: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={(errors.convocatoria ? 'border-red-500 ' : '') + 'w-full'}>
                    <SelectValue placeholder="Selecciona la convocatoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Convocatoria 1</SelectItem>
                    <SelectItem value="2">Convocatoria 2</SelectItem>
                  </SelectContent>
                </Select>
                {errors.convocatoria && (
                  <p className="text-sm text-red-600">{errors.convocatoria}</p>
                )}
              </div>
              </div>

              {/* Botón de registro */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading || !docTerminosPdf || !docUsoImagenPdf || !docPlanNegocioXls || !docVecindadPdf || 
                         !rutPdf || 
                         (formData.tipo_persona === 'natural' && !cedulaPdf) ||
                         (formData.tipo_persona === 'juridica' && (!cedulaRepresentantePdf || !certExistenciaPdf)) ||
                         !antecedentesFiscalesPdf || !antecedentesDisciplinariosPdf || !antecedentesJudicialesPdf || 
                         !redamPdf || !inhabSexualesPdf || !declaracionCapacidadPdf ||
                         (!formData.emprendimiento_formalizado && formData.emprendimiento_formalizado !== false) ||
                         (formData.emprendimiento_formalizado === true && (!matriculaMercantilPdf || !facturas6mesesPdf)) ||
                         (formData.emprendimiento_formalizado === false && (!publicacionesRedesPdf || !registroVentasPdf)) ||
                         (!formData.financiado_estado && formData.financiado_estado !== false) ||
                         (formData.financiado_estado === true && !formData.financiado_regalias && !formData.financiado_camara_comercio && !formData.financiado_incubadoras && !formData.financiado_otro) ||
                         (formData.financiado_otro && !formData.financiado_otro_texto.trim()) ||
                         !formData.declara_veraz || !formData.declara_no_beneficiario || !formData.acepta_terminos}
              >
                {isLoading ? 'Registrando...' : 
                 (!docTerminosPdf || !docUsoImagenPdf || !docPlanNegocioXls || !docVecindadPdf || 
                  !rutPdf || 
                  (formData.tipo_persona === 'natural' && !cedulaPdf) ||
                  (formData.tipo_persona === 'juridica' && (!cedulaRepresentantePdf || !certExistenciaPdf)) ||
                  !antecedentesFiscalesPdf || !antecedentesDisciplinariosPdf || !antecedentesJudicialesPdf || 
                  !redamPdf || !inhabSexualesPdf || !declaracionCapacidadPdf ||
                  (!formData.emprendimiento_formalizado && formData.emprendimiento_formalizado !== false) ||
                  (formData.emprendimiento_formalizado === true && (!matriculaMercantilPdf || !facturas6mesesPdf)) ||
                  (formData.emprendimiento_formalizado === false && (!publicacionesRedesPdf || !registroVentasPdf)) ||
                  (!formData.financiado_estado && formData.financiado_estado !== false) ||
                  (formData.financiado_estado === true && !formData.financiado_regalias && !formData.financiado_camara_comercio && !formData.financiado_incubadoras && !formData.financiado_otro) ||
                  (formData.financiado_otro && !formData.financiado_otro_texto.trim()) ||
                  !formData.declara_veraz || !formData.declara_no_beneficiario || !formData.acepta_terminos) ? 
                 'Faltan documentos obligatorios' : 'Crear Cuenta'}
              </Button>

              {/* Link a login */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>

              {/* Botón adicional para ir al login después del registro exitoso */}
              {successMessage && (
                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => navigate('/login')}
                  >
                    Ir al Inicio de Sesión
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage

