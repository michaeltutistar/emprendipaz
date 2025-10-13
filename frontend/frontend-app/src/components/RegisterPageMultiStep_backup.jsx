import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff, ArrowLeft, Upload, FileText, X, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import logoGobernacion from '../assets/logo-gobernacion.png'
import { MUNICIPIOS_POR_SUBREGION } from '@/constants/municipios'

const RegisterPageMultiStep = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const [currentStep, setCurrentStep] = useState(1)
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Estados del formulario (igual que el original)
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
    convocatoria: '', // Convocatoria a seleccionar
    
    // Campos de poblaciÃ³n diferencial (TDR)
    mujer_cabeza_familia: false,
    victima_conflicto: false,
    persona_discapacidad: false,
    pertenencia_etnica: false,
    sisben_grupo: '',
    persona_reincorporacion: false,
    
    // Campos de emprendimiento (TDR)
    tiempo_funcionamiento: '',
    empleos_generados: '',
    acceso_mercados: '',
    
    // Video de presentaciÃ³n
    video_presentacion: null
  })

  // Estados de documentos (igual que el original)
  const [docTerminosPdf, setDocTerminosPdf] = useState(null)
  const [docUsoImagenPdf, setDocUsoImagenPdf] = useState(null)
  const [docPlanNegocioXls, setDocPlanNegocioXls] = useState(null)
  const [docVecindadPdf, setDocVecindadPdf] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [rutPdf, setRutPdf] = useState(null)
  const [cedulaPdf, setCedulaPdf] = useState(null)
  const [cedulaRepresentantePdf, setCedulaRepresentantePdf] = useState(null)
  const [certExistenciaPdf, setCertExistenciaPdf] = useState(null)
  const [ruvPdf, setRuvPdf] = useState(null)
  const [sisbenPdf, setSisbenPdf] = useState(null)
  const [grupoEtnicoPdf, setGrupoEtnicoPdf] = useState(null)
  const [arnPdf, setArnPdf] = useState(null)
  const [discapacidadPdf, setDiscapacidadPdf] = useState(null)
  const [antecedentesFiscalesPdf, setAntecedentesFiscalesPdf] = useState(null)
  const [antecedentesDisciplinariosPdf, setAntecedentesDisciplinariosPdf] = useState(null)
  const [antecedentesJudicialesPdf, setAntecedentesJudicialesPdf] = useState(null)
  const [antecedentesContraloriaPdf, setAntecedentesContraloriaPdf] = useState(null)
  const [antecedentesProcuraduriaPdf, setAntecedentesProcuraduriaPdf] = useState(null)
  const [redamPdf, setRedamPdf] = useState(null)
  const [inhabSexualesPdf, setInhabSexualesPdf] = useState(null)
  const [declaracionCapacidadPdf, setDeclaracionCapacidadPdf] = useState(null)
  const [matriculaMercantilPdf, setMatriculaMercantilPdf] = useState(null)
  const [facturas6mesesPdf, setFacturas6mesesPdf] = useState(null)
  const [facturasVentaPdf, setFacturasVentaPdf] = useState(null)
  const [publicacionesRedesPdf, setPublicacionesRedesPdf] = useState(null)
  const [redesSocialesPdf, setRedesSocialesPdf] = useState(null)
  const [registroVentasPdf, setRegistroVentasPdf] = useState(null)
  const [comprobantesVentasPdf, setComprobantesVentasPdf] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Estado para video de presentaciÃ³n
  const [videoPresentacion, setVideoPresentacion] = useState(null)

  // DefiniciÃ³n de pasos
  const steps = [
    { number: 1, title: 'Datos Generales', description: 'InformaciÃ³n personal y del emprendimiento' },
    { number: 2, title: 'PoblaciÃ³n Diferencial', description: 'Condiciones especiales y vulnerabilidad' },
    { number: 3, title: 'Emprendimiento', description: 'Tiempo funcionamiento, empleos y mercados' },
    { number: 4, title: 'Video PresentaciÃ³n', description: 'Video de presentaciÃ³n del emprendimiento' },
    { number: 5, title: 'Documentos Obligatorios', description: 'TDR, Uso de imagen, Plan de negocio, Vecindad' },
    { number: 6, title: 'Documentos por Tipo', description: 'SegÃºn persona natural o jurÃ­dica' },
    { number: 7, title: 'Documentos Diferenciales', description: 'RUV, SISBEN, Grupo Ã©tnico (opcionales)' },
    { number: 8, title: 'Documentos de Control', description: 'Antecedentes y certificados obligatorios' },
    { number: 9, title: 'Funcionamiento', description: 'CertificaciÃ³n de funcionamiento del emprendimiento' },
    { number: 10, title: 'FinanciaciÃ³n', description: 'FinanciaciÃ³n de otras fuentes estatales' },
    { number: 11, title: 'Declaraciones', description: 'Declaraciones y aceptaciÃ³n de tÃ©rminos' }
  ]

  const progressPercentage = (currentStep / steps.length) * 100

  // Funciones de utilidad (copiadas del original)
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
      const monthDiff = today.getMonth() - dob.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--
      }
      return age
    } catch (error) {
      return null
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (file, setter, fieldName, allowedTypes = ['application/pdf'], maxSize = 20 * 1024 * 1024) => {
    if (!file) return
    
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [fieldName]: `Tipo de archivo no vÃ¡lido. Se requiere: ${allowedTypes.join(', ')}` }))
      return
    }
    
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [fieldName]: `El archivo no puede superar ${Math.round(maxSize / (1024 * 1024))}MB` }))
      return
    }
    
    setter(file)
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const renderDocumentUpload = (fieldName, label, file, setter, validationName, isOptional = false, allowedTypes = ['application/pdf']) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label} {!isOptional && '*'}</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {file ? (
            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">âœ”ï¸ {file.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setter(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label
                  htmlFor={fieldName}
                  className="cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
                >
                  <span>Subir archivo</span>
                  <input
                    id={fieldName}
                    name={fieldName}
                    type="file"
                    className="sr-only"
                    accept={allowedTypes.join(',')}
                    onChange={(e) => handleFileChange(e.target.files[0], setter, validationName, allowedTypes)}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {allowedTypes.includes('application/pdf') && 'PDF'} 
                {allowedTypes.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && ' Excel'} 
                (mÃ¡x. 20MB)
              </p>
              {!file && !isOptional && (
                <p className="text-sm text-red-600 mt-1">âŒ Falta documento obligatorio</p>
              )}
              {!file && isOptional && (
                <p className="text-sm text-yellow-600 mt-1">âš ï¸ Documento no cargado (subsanable)</p>
              )}
            </div>
          )}
        </div>
        {errors[validationName] && (
          <p className="text-sm text-red-600">{errors[validationName]}</p>
        )}
      </div>
    )
  }

  // ValidaciÃ³n por pasos
  const validateCurrentStep = () => {
    const newErrors = {}

    // En modo demo, ser mÃ¡s permisivo con las validaciones
    if (isDemoMode) {
      // Solo validar campos bÃ¡sicos en modo demo
      if (currentStep === 1) {
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
        if (!formData.email.trim()) {
          newErrors.email = 'El correo electrÃ³nico es obligatorio'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'El formato del correo electrÃ³nico no es vÃ¡lido'
        }
        if (!formData.password) {
          newErrors.password = 'La contraseÃ±a es obligatoria'
        }
      }
      // Para los demÃ¡s pasos en demo, no validar documentos
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    switch (currentStep) {
      case 1: // Datos Generales
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
        if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio'
        if (!formData.email.trim()) {
          newErrors.email = 'El correo electrÃ³nico es obligatorio'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'El formato del correo electrÃ³nico no es vÃ¡lido'
        }
        if (!formData.tipo_documento.trim()) newErrors.tipo_documento = 'El tipo de documento es obligatorio'
        if (!formData.numero_documento.trim()) newErrors.numero_documento = 'El nÃºmero de documento es obligatorio'
        if (!formData.fecha_nacimiento) {
          newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
        } else {
          const age = calcAge(formData.fecha_nacimiento)
          if (age === null) {
            newErrors.fecha_nacimiento = 'Fecha de nacimiento invÃ¡lida'
          } else if (age < 18 || age > 32) {
            newErrors.fecha_nacimiento = 'Debe tener entre 18 y 32 aÃ±os para participar'
          }
        }
        if (!formData.sexo) newErrors.sexo = 'El sexo es obligatorio'
        if (!formData.estado_civil) newErrors.estado_civil = 'El estado civil es obligatorio'
        if (!formData.telefono.trim()) newErrors.telefono = 'El telÃ©fono es obligatorio'
        if (!formData.direccion.trim()) newErrors.direccion = 'La direcciÃ³n es obligatoria'
        if (!formData.municipio) newErrors.municipio = 'El municipio es obligatorio'
        if (!formData.emprendimiento_nombre.trim()) newErrors.emprendimiento_nombre = 'El nombre del emprendimiento es obligatorio'
        if (!formData.emprendimiento_sector) newErrors.emprendimiento_sector = 'El sector econÃ³mico es obligatorio'
        if (!formData.tipo_persona) newErrors.tipo_persona = 'El tipo de persona es obligatorio'
        if (!formData.convocatoria) newErrors.convocatoria = 'La convocatoria es obligatoria'
        if (!formData.password) {
          newErrors.password = 'La contraseÃ±a es obligatoria'
        } else if (!validatePassword(formData.password)) {
          newErrors.password = 'La contraseÃ±a debe tener al menos 8 caracteres, incluir letras y nÃºmeros'
        }
        if (!formData.confirm_password) {
          newErrors.confirm_password = 'Confirmar contraseÃ±a es obligatorio'
        } else if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = 'Las contraseÃ±as no coinciden'
        }
        break

      case 2: // PoblaciÃ³n Diferencial
        // No hay validaciones obligatorias - todos los campos son opcionales
        break

      case 3: // Emprendimiento
        if (!formData.tiempo_funcionamiento) newErrors.tiempo_funcionamiento = 'El tiempo de funcionamiento es obligatorio'
        if (!formData.empleos_generados) newErrors.empleos_generados = 'El nÃºmero de empleos generados es obligatorio'
        if (!formData.acceso_mercados) newErrors.acceso_mercados = 'El nivel de acceso a mercados es obligatorio'
        break

      case 4: // Video PresentaciÃ³n
        if (!videoPresentacion) newErrors.video_presentacion = 'El video de presentaciÃ³n es obligatorio'
        break

      case 5: // Documentos Obligatorios
        if (!docTerminosPdf) newErrors.doc_terminos_pdf = 'El documento TDR es obligatorio'
        if (!docUsoImagenPdf) newErrors.doc_uso_imagen_pdf = 'La autorizaciÃ³n de uso de imagen es obligatoria'
        if (!docPlanNegocioXls) newErrors.doc_plan_negocio_xls = 'El plan de negocio es obligatorio'
        if (!docVecindadPdf) newErrors.doc_vecindad_pdf = 'El certificado de vecindad es obligatorio'
        break

      case 6: // Documentos por Tipo
        if (!rutPdf) newErrors.rut_pdf = 'El RUT es obligatorio'
        if (formData.tipo_persona === 'natural') {
          if (!cedulaPdf) newErrors.cedula_pdf = 'La cÃ©dula es obligatoria para Persona Natural'
        } else if (formData.tipo_persona === 'juridica') {
          if (!cedulaRepresentantePdf) newErrors.cedula_representante_pdf = 'La cÃ©dula del representante legal es obligatoria para Persona JurÃ­dica'
          if (!certExistenciaPdf) newErrors.cert_existencia_pdf = 'El certificado de existencia y representaciÃ³n legal es obligatorio para Persona JurÃ­dica'
        }
        break

      case 7: // Documentos Diferenciales (opcionales, no bloquean)
        // No hay validaciones obligatorias en este paso
        break

      case 8: // Documentos de Control
        if (!antecedentesFiscalesPdf) newErrors.antecedentes_fiscales_pdf = 'Los antecedentes fiscales son obligatorios'
        if (!antecedentesJudicialesPdf) newErrors.antecedentes_judiciales_pdf = 'Los antecedentes judiciales son obligatorios'
        if (!antecedentesContraloriaPdf) newErrors.antecedentes_contraloria_pdf = 'Los antecedentes de Contraloría son obligatorios'
        if (!antecedentesProcuraduriaPdf) newErrors.antecedentes_procuraduria_pdf = 'Los antecedentes de Procuraduría son obligatorios'
        break

      case 9: // Funcionamiento
        if (!matriculaMercantilPdf) newErrors.matricula_mercantil_pdf = 'La matrícula mercantil o certificado de existencia es obligatorio'
        if (!facturasVentaPdf) newErrors.facturas_venta_pdf = 'Las facturas de venta son obligatorias'
        if (!redesSocialesPdf) newErrors.redes_sociales_pdf = 'Las publicaciones de redes sociales son obligatorias'
        if (!comprobantesVentasPdf) newErrors.comprobantes_ventas_pdf = 'Los comprobantes de ventas son obligatorios'
        break

      case 10: // FinanciaciÃ³n
        if (!formData.financiado_estado && formData.financiado_estado !== false) {
          newErrors.financiado_estado = 'Debe especificar si el emprendimiento ha sido financiado por otros programas del Estado'
        }
        if (formData.financiado_estado === true) {
          if (!formData.financiado_regalias && !formData.financiado_camara_comercio && 
              !formData.financiado_incubadoras && !formData.financiado_otro) {
            newErrors.financiado_fuentes = 'Si el emprendimiento ha sido financiado, debe especificar al menos una fuente de financiaciÃ³n'
          }
          if (formData.financiado_otro && !formData.financiado_otro_texto.trim()) {
            newErrors.financiado_otro_texto = 'Si selecciona "Otro" como fuente de financiaciÃ³n, debe especificar cuÃ¡l'
          }
        }
        break

      case 11: // Declaraciones
        if (!formData.declara_veraz) newErrors.declara_veraz = 'Debe declarar que la informaciÃ³n suministrada es veraz'
        if (!formData.declara_no_beneficiario) newErrors.declara_no_beneficiario = 'Debe declarar que no ha sido beneficiario de recursos pÃºblicos para este emprendimiento'
        if (!formData.acepta_terminos) newErrors.acepta_terminos = 'Debe aceptar los tÃ©rminos y condiciones de la convocatoria'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Guardado parcial
  const savePartialProgress = async () => {
    if (!userId) return false

    try {
      setIsSaving(true)
      
      // Modo demo: simular guardado de progreso
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simular delay
        setSuccessMessage('âœ… Progreso guardado exitosamente')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      }
      
      const response = await fetch('/api/save-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          paso: currentStep,
          ...formData
        }),
        credentials: 'include'
      })

      const result = await response.json()
      if (response.ok) {
        setSuccessMessage('âœ… Progreso guardado exitosamente')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      } else {
        setErrors({ general: result.error || 'Error al guardar progreso' })
        return false
      }
    } catch (err) {
      setErrors({ general: 'Error de conexiÃ³n al guardar progreso' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // NavegaciÃ³n entre pasos
  const nextStep = async () => {
    if (!validateCurrentStep()) {
      return
    }

    // En modo demo, no guardar progreso
    if (!isDemoMode && userId) {
      const saved = await savePartialProgress()
      if (!saved) return
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  // NavegaciÃ³n directa a cualquier paso
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber)
      setErrors({})
    }
  }

  // Registro inicial (crear usuario)
  const createInitialUser = async () => {
    if (!validateCurrentStep()) return

    try {
      setIsLoading(true)
      
      // Modo demo: simular creaciÃ³n de usuario
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
        setUserId('demo-user-123')
        setSuccessMessage('âœ… Usuario creado. Puede continuar completando el formulario.')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      }
      
      const response = await fetch('/api/register-initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          demo_mode: isDemoMode
        }),
        credentials: 'include'
      })

      const result = await response.json()
      if (response.ok) {
        setUserId(result.user_id)
        setSuccessMessage('âœ… Usuario creado. Puede continuar completando el formulario.')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      } else {
        setErrors({ general: result.error || 'Error al crear usuario' })
        return false
      }
    } catch (err) {
      setErrors({ general: 'Error de conexiÃ³n' })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // EnvÃ­o final del formulario
  const submitCompleteForm = async () => {
    if (!validateCurrentStep()) return

    try {
      setIsLoading(true)
      
      // Preparar todos los documentos
      const submitData = { ...formData }
      
      // Convertir documentos a base64
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
      
      // Agregar mÃ¡s documentos...
      if (rutPdf) {
        submitData.rut_pdf = await convertFileToBase64(rutPdf)
        submitData.rut_pdf_nombre = rutPdf.name
      }
      if (cedulaPdf) {
        submitData.cedula_pdf = await convertFileToBase64(cedulaPdf)
        submitData.cedula_pdf_nombre = cedulaPdf.name
      }
      // ... etc para todos los documentos

      submitData.video_url = videoUrl

      // Modo demo: simular envÃ­o exitoso
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simular delay
        // Mostrar mensaje de Ã©xito y luego redirigir a una pÃ¡gina de Ã©xito
        setSuccessMessage('ðŸŽ‰ Â¡FELICITACIONES! Su inscripciÃ³n ha sido completada exitosamente. Â¡Bienvenido al programa EmprendiPaz!')
        setTimeout(() => {
          // Crear una pÃ¡gina de Ã©xito temporal
          const successPage = `
            <div style="
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #10b981, #059669);
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 9999;
              color: white;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              <div style="text-align: center; max-width: 600px; padding: 40px;">
                <div style="font-size: 80px; margin-bottom: 20px;">ðŸŽ‰</div>
                <h1 style="font-size: 48px; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                  Â¡FELICITACIONES!
                </h1>
                <h2 style="font-size: 24px; margin-bottom: 30px; opacity: 0.9;">
                  Su inscripciÃ³n ha sido completada exitosamente
                </h2>
                <p style="font-size: 18px; margin-bottom: 40px; opacity: 0.8;">
                  Â¡Bienvenido al programa EmprendiPaz!<br>
                  Su solicitud ha sido recibida y serÃ¡ procesada.
                </p>
                <div style="
                  background: rgba(255,255,255,0.2);
                  padding: 20px;
                  border-radius: 10px;
                  margin-bottom: 30px;
                ">
                  <p style="font-size: 16px; margin: 0;">
                    <strong>Modo Demo:</strong> Esta es una simulaciÃ³n del proceso de registro.
                  </p>
                </div>
                <button onclick="window.location.href='/login'" style="
                  background: white;
                  color: #059669;
                  border: none;
                  padding: 15px 30px;
                  font-size: 18px;
                  font-weight: bold;
                  border-radius: 8px;
                  cursor: pointer;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                ">
                  Continuar al Login
                </button>
              </div>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', successPage);
        }, 2000) // Mostrar mensaje por 2 segundos, luego pÃ¡gina de Ã©xito
        return
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submitData,
          demo_mode: isDemoMode
        }),
        credentials: 'include'
      })

      const result = await response.json()
      if (response.ok) {
        setSuccessMessage('âœ… Â¡InscripciÃ³n completada exitosamente!')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setErrors({ general: result.error || 'Error al completar inscripciÃ³n' })
      }
    } catch (err) {
      setErrors({ general: 'Error de conexiÃ³n' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 1 && !userId) {
      // Primer paso: crear usuario inicial
      const created = await createInitialUser()
      if (created) {
        setCurrentStep(2)
      }
    } else if (currentStep === steps.length) {
      // Ãšltimo paso: envÃ­o final
      await submitCompleteForm()
    } else {
      // Pasos intermedios: validar y avanzar
      await nextStep()
    }
  }

  // Renderizado de contenido por paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 1: Datos Generales</h2>
              <p className="text-gray-600">InformaciÃ³n personal y del emprendimiento</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  autoComplete="given-name"
                />
                {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
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
                  autoComplete="family-name"
                />
                {errors.apellido && <p className="text-sm text-red-600">{errors.apellido}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo ElectrÃ³nico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Tipo de documento */}
              <div className="space-y-2">
                <Label>Tipo de Documento *</Label>
                <Select
                  value={formData.tipo_documento}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_documento: value }))
                    if (errors.tipo_documento) setErrors(prev => ({ ...prev, tipo_documento: '' }))
                  }}
                >
                  <SelectTrigger className={errors.tipo_documento ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedula">CÃ©dula de CiudadanÃ­a</SelectItem>
                    <SelectItem value="cedula_extranjeria">CÃ©dula de ExtranjerÃ­a</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_documento && <p className="text-sm text-red-600">{errors.tipo_documento}</p>}
              </div>

              {/* NÃºmero de documento */}
              <div className="space-y-2">
                <Label htmlFor="numero_documento">NÃºmero de Documento *</Label>
                <Input
                  id="numero_documento"
                  name="numero_documento"
                  type="text"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  className={errors.numero_documento ? 'border-red-500' : ''}
                  placeholder="12345678"
                  autoComplete="off"
                />
                {errors.numero_documento && <p className="text-sm text-red-600">{errors.numero_documento}</p>}
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  className={errors.fecha_nacimiento ? 'border-red-500' : ''}
                  autoComplete="bday"
                />
                {errors.fecha_nacimiento && <p className="text-sm text-red-600">{errors.fecha_nacimiento}</p>}
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label>Sexo *</Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, sexo: value }))
                    if (errors.sexo) setErrors(prev => ({ ...prev, sexo: '' }))
                  }}
                >
                  <SelectTrigger className={errors.sexo ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexo && <p className="text-sm text-red-600">{errors.sexo}</p>}
              </div>

              {/* Estado civil */}
              <div className="space-y-2">
                <Label>Estado Civil *</Label>
                <Select
                  value={formData.estado_civil}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, estado_civil: value }))
                    if (errors.estado_civil) setErrors(prev => ({ ...prev, estado_civil: '' }))
                  }}
                >
                  <SelectTrigger className={errors.estado_civil ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soltero">Soltero(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="union_libre">UniÃ³n Libre</SelectItem>
                    <SelectItem value="separado">Separado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viudo">Viudo(a)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado_civil && <p className="text-sm text-red-600">{errors.estado_civil}</p>}
              </div>

              {/* TelÃ©fono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">TelÃ©fono Celular *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={errors.telefono ? 'border-red-500' : ''}
                  placeholder="3001234567"
                  autoComplete="tel"
                />
                {errors.telefono && <p className="text-sm text-red-600">{errors.telefono}</p>}
              </div>

              {/* DirecciÃ³n */}
              <div className="space-y-2">
                <Label htmlFor="direccion">DirecciÃ³n de Residencia *</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={errors.direccion ? 'border-red-500' : ''}
                  placeholder="Calle 123 # 45-67"
                  autoComplete="street-address"
                />
                {errors.direccion && <p className="text-sm text-red-600">{errors.direccion}</p>}
              </div>

              {/* Municipio */}
              <div className="space-y-2">
                <Label>Municipio de Residencia *</Label>
                <Select
                  value={formData.municipio}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, municipio: value }))
                    if (errors.municipio) setErrors(prev => ({ ...prev, municipio: '' }))
                  }}
                >
                  <SelectTrigger className={errors.municipio ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MUNICIPIOS_POR_SUBREGION).map(([subregion, municipios]) => [
                      <div key={`${subregion}-header`} className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                        {subregion}
                      </div>,
                      ...municipios.map(municipio => (
                        <SelectItem key={municipio.nombre} value={municipio.nombre}>{municipio.nombre}</SelectItem>
                      ))
                    ]).flat()}
                  </SelectContent>
                </Select>
                {errors.municipio && <p className="text-sm text-red-600">{errors.municipio}</p>}
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
                  autoComplete="organization"
                />
                {errors.emprendimiento_nombre && <p className="text-sm text-red-600">{errors.emprendimiento_nombre}</p>}
              </div>

              {/* Emprendimiento: Sector EconÃ³mico */}
              <div className="space-y-2">
                <Label>Sector EconÃ³mico *</Label>
                <Select
                  value={formData.emprendimiento_sector}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, emprendimiento_sector: value }))
                    if (errors.emprendimiento_sector) setErrors(prev => ({ ...prev, emprendimiento_sector: '' }))
                  }}
                >
                  <SelectTrigger className={errors.emprendimiento_sector ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agroindustria">Agroindustria</SelectItem>
                    <SelectItem value="industria_comercio">Industria y Comercio</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                    <SelectItem value="turismo">Turismo</SelectItem>
                  </SelectContent>
                </Select>
                {errors.emprendimiento_sector && <p className="text-sm text-red-600">{errors.emprendimiento_sector}</p>}
              </div>

              {/* Tipo de Persona */}
              <div className="space-y-2">
                <Label>Tipo de Persona *</Label>
                <Select
                  value={formData.tipo_persona}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_persona: value }))
                    if (errors.tipo_persona) setErrors(prev => ({ ...prev, tipo_persona: '' }))
                  }}
                >
                  <SelectTrigger className={errors.tipo_persona ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el tipo de persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="juridica">JurÃ­dica</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_persona && <p className="text-sm text-red-600">{errors.tipo_persona}</p>}
              </div>

              {/* Convocatoria */}
              <div className="space-y-2">
                <Label htmlFor="convocatoria">Convocatoria *</Label>
                <select
                  id="convocatoria"
                  name="convocatoria"
                  value={formData.convocatoria}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.convocatoria ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una convocatoria</option>
                  <option value="1">Convocatoria 1 - Proceso Principal</option>
                  <option value="2">Convocatoria 2 - Segundo Proceso</option>
                  <option value="2025">Convocatoria 2025 - Referencia</option>
                </select>
                {errors.convocatoria && <p className="text-sm text-red-600">{errors.convocatoria}</p>}
              </div>

              {/* ContraseÃ±a */}
              <div className="space-y-2">
                <Label htmlFor="password">ContraseÃ±a *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="MÃ­nimo 8 caracteres, letras y nÃºmeros"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmar ContraseÃ±a */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar ContraseÃ±a *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                    placeholder="Repite tu contraseÃ±a"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-sm text-red-600">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 2: PoblaciÃ³n Diferencial</h2>
              <p className="text-gray-600">Condiciones especiales y vulnerabilidad (opcional)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                â„¹ï¸ <strong>InformaciÃ³n opcional:</strong> Estos campos son opcionales pero pueden otorgar puntos adicionales en la evaluaciÃ³n.
              </p>
            </div>

            <div className="space-y-6">
              {/* Mujer cabeza de familia */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="mujer_cabeza_familia"
                    checked={formData.mujer_cabeza_familia}
                    onChange={(e) => setFormData({ ...formData, mujer_cabeza_familia: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <div>
                    <label htmlFor="mujer_cabeza_familia" className="text-sm font-medium text-gray-700">
                      Mujer cabeza de familia o cuidadora
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Puntos:</strong> 9 puntos | <strong>Documento:</strong> Certificado de autoridad local, departamental o declaración juramentada
                    </p>
                  </div>
                </div>
              </div>

              {/* Persona en reincorporación */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="persona_reincorporacion"
                    checked={formData.persona_reincorporacion}
                    onChange={(e) => setFormData({ ...formData, persona_reincorporacion: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <div>
                    <label htmlFor="persona_reincorporacion" className="text-sm font-medium text-gray-700">
                      Persona en proceso de reincorporación
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Puntos:</strong> 6 puntos | <strong>Documento:</strong> Certificado de la ARN (Agencia para la Reincorporación y Normalización)
                    </p>
                  </div>
                </div>
              </div>

              {/* Víctima del conflicto */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="victima_conflicto"
                    checked={formData.victima_conflicto}
                    onChange={(e) => setFormData({ ...formData, victima_conflicto: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <div>
                    <label htmlFor="victima_conflicto" className="text-sm font-medium text-gray-700">
                      Víctima del conflicto armado
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Puntos:</strong> 6 puntos | <strong>Documento:</strong> Registro Único de Víctimas (RUV)
                    </p>
                  </div>
                </div>
              </div>

              {/* Persona con discapacidad */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="persona_discapacidad"
                    checked={formData.persona_discapacidad}
                    onChange={(e) => setFormData({ ...formData, persona_discapacidad: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <div>
                    <label htmlFor="persona_discapacidad" className="text-sm font-medium text-gray-700">
                      Persona en situación de discapacidad
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Puntos:</strong> 6 puntos | <strong>Documento:</strong> Certificado médico o del Registro de Localización y Caracterización
                    </p>
                  </div>
                </div>
              </div>

              {/* Pertenencia étnica */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="pertenencia_etnica"
                    checked={formData.pertenencia_etnica}
                    onChange={(e) => setFormData({ ...formData, pertenencia_etnica: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <div>
                    <label htmlFor="pertenencia_etnica" className="text-sm font-medium text-gray-700">
                      Pertenencia a comunidad étnica
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Puntos:</strong> 6 puntos | <strong>Documento:</strong> Certificado de autoridad étnica reconocida por el ministerio del interior
                    </p>
                  </div>
                </div>
              </div>

              {/* SISBEN */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="sisben_check"
                      checked={formData.sisben_grupo !== ''}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setFormData({ ...formData, sisben_grupo: '' })
                        }
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                    />
                    <div>
                      <label htmlFor="sisben_check" className="text-sm font-medium text-gray-700">
                        Pertenece a SISBEN Grupo A, B o C
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Puntos:</strong> 2 puntos | <strong>Documento:</strong> Documento del sistema de focalización del DNP
                      </p>
                    </div>
                  </div>
                  
                  {formData.sisben_grupo !== '' && (
                    <div className="ml-7">
                      <label htmlFor="sisben_grupo" className="block text-sm font-medium text-gray-700 mb-2">
                        Grupo SISBEN:
                      </label>
                      <select
                        id="sisben_grupo"
                        value={formData.sisben_grupo}
                        onChange={(e) => setFormData({ ...formData, sisben_grupo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Selecciona el grupo</option>
                        <option value="A">Grupo A</option>
                        <option value="B">Grupo B</option>
                        <option value="C">Grupo C</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📊 Sistema de Puntuación</h3>
              <p className="text-xs text-gray-600">
                <strong>Total máximo de puntos por población diferencial:</strong> 38 puntos<br/>
                • Mujer cabeza de familia: 9 puntos<br/>
                • Persona en reincorporación: 6 puntos<br/>
                • Víctima del conflicto: 6 puntos<br/>
                • Persona con discapacidad: 6 puntos<br/>
                • Pertenencia étnica: 6 puntos<br/>
                • SISBEN A, B o C: 2 puntos
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 3: Emprendimiento</h2>
              <p className="text-gray-600">Información sobre el funcionamiento y características del emprendimiento</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                📊 <strong>Nivel de Madurez del Emprendimiento:</strong> Esta información es obligatoria y determina puntos adicionales en la evaluación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tiempo de funcionamiento */}
              <div className="space-y-2">
                <Label htmlFor="tiempo_funcionamiento" className="text-sm font-medium">Tiempo de funcionamiento *</Label>
                <select
                  id="tiempo_funcionamiento"
                  name="tiempo_funcionamiento"
                  value={formData.tiempo_funcionamiento}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.tiempo_funcionamiento ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona el tiempo de funcionamiento</option>
                  <option value="6-12">6 - 12 meses de operación</option>
                  <option value="13-24">13 - 24 meses de operación</option>
                  <option value="24+">Más de 24 meses de operación</option>
                </select>
                {errors.tiempo_funcionamiento && <p className="text-sm text-red-600">{errors.tiempo_funcionamiento}</p>}
                <p className="text-xs text-gray-500">Mínimo 6 meses de funcionamiento requerido</p>
              </div>

              {/* Empleos generados */}
              <div className="space-y-2">
                <Label htmlFor="empleos_generados" className="text-sm font-medium">Empleos generados *</Label>
                <select
                  id="empleos_generados"
                  name="empleos_generados"
                  value={formData.empleos_generados}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.empleos_generados ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona el número de empleos</option>
                  <option value="0">No genera empleos (solo autoempleo)</option>
                  <option value="1-2">1 - 2 empleos directos o indirectos</option>
                  <option value="3-5">3 - 5 empleos directos o indirectos</option>
                  <option value="5+">Más de 5 empleos</option>
                </select>
                {errors.empleos_generados && <p className="text-sm text-red-600">{errors.empleos_generados}</p>}
              </div>

              {/* Acceso a mercados */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="acceso_mercados" className="text-sm font-medium">Acceso a mercados *</Label>
                <select
                  id="acceso_mercados"
                  name="acceso_mercados"
                  value={formData.acceso_mercados}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.acceso_mercados ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona el nivel de acceso a mercados</option>
                  <option value="informales">Solo ventas informales y ocasionales</option>
                  <option value="locales">Ventas en mercados locales</option>
                  <option value="departamentales">Acceso a mercados departamentales</option>
                  <option value="nacionales">Acceso a mercados nacionales e internacionales</option>
                </select>
                {errors.acceso_mercados && <p className="text-sm text-red-600">{errors.acceso_mercados}</p>}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">📊 Sistema de Puntuación - Nivel de Madurez</h3>
              <p className="text-xs text-gray-600">
                <strong>Total máximo de puntos por nivel de madurez:</strong> 18 puntos<br/>
                • 6-12 meses: 5 puntos<br/>
                • 13-24 meses: 10 puntos<br/>
                • Más de 24 meses: 18 puntos<br/>
                <br/>
                <strong>Documentos requeridos:</strong><br/>
                • Emprendimientos recientes: Publicaciones de redes sociales + comprobantes de ventas<br/>
                • Emprendimientos consolidados: Registro de ventas, facturas o certificación de Cámara de Comercio
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 4: Video Presentación</h2>
              <p className="text-gray-600">Video de presentación del emprendimiento</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                📹 <strong>Requisitos del video:</strong> Máximo 5 minutos, orientación horizontal, formato MP4, MOV o AVI.
              </p>
            </div>

            <div className="space-y-4">
              {/* Subida de video */}
              <div className="space-y-2">
                <Label htmlFor="video_presentacion" className="text-sm font-medium">Video de presentación *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    id="video_presentacion"
                    accept="video/mp4,video/mov,video/avi"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        // Validar tamaño (100MB máximo)
                        if (file.size > 100 * 1024 * 1024) {
                          alert('El archivo es demasiado grande. Máximo 100MB.')
                          return
                        }
                        setVideoPresentacion(file)
                        if (errors.video_presentacion) setErrors(prev => ({ ...prev, video_presentacion: '' }))
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="video_presentacion" className="cursor-pointer">
                    <div className="text-gray-600">
                      {videoPresentacion ? (
                        <div>
                          <p className="text-green-600 font-medium">✓ Video seleccionado</p>
                          <p className="text-sm">{videoPresentacion.name}</p>
                          <p className="text-xs text-gray-500">
                            Tamaño: {(videoPresentacion.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg">📹</p>
                          <p className="font-medium">Haz clic para subir tu video</p>
                          <p className="text-sm text-gray-500">MP4, MOV o AVI - Máximo 100MB</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                {errors.video_presentacion && <p className="text-sm text-red-600">{errors.video_presentacion}</p>}
                <p className="text-xs text-gray-500">
                  El video debe incluir: presentación personal, descripción del emprendimiento, 
                  motivación para participar y proyección a futuro.
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 5: Documentos Obligatorios</h2>
              <p className="text-gray-600">Documentos requeridos para todos los participantes</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ <strong>Documentos obligatorios:</strong> Estos documentos son requeridos para todos los participantes y bloquean el envío si no se suben.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TDR */}
              {renderDocumentUpload(
                'doc_terminos_pdf',
                'Formato de aceptación de términos de referencia (TDR)',
                docTerminosPdf,
                setDocTerminosPdf,
                'doc_terminos_pdf'
              )}

              {/* Uso de Imagen */}
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
                'Formato de Plan de Negocio (Excel)',
                docPlanNegocioXls,
                setDocPlanNegocioXls,
                'doc_plan_negocio_xls',
                false,
                ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
              )}

              {/* Certificado de Vecindad */}
              {renderDocumentUpload(
                'doc_vecindad_pdf',
                'Certificado de vecindad con anexos',
                docVecindadPdf,
                setDocVecindadPdf,
                'doc_vecindad_pdf'
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 6: Documentos por Tipo</h2>
              <p className="text-gray-600">Documentos según persona natural o jurídica</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700 font-medium">
                📋 <strong>Documentos condicionales:</strong> Los documentos requeridos dependen del tipo de persona seleccionado en el Paso 1.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RUT (siempre obligatorio) */}
              {renderDocumentUpload(
                'rut_pdf',
                'RUT actualizado 2025',
                rutPdf,
                setRutPdf,
                'rut_pdf'
              )}

              {/* Documentos condicionales según tipo de persona */}
              {formData.tipo_persona === 'natural' && (
                <>
                  {renderDocumentUpload(
                    'cedula_pdf',
                    'Cédula de ciudadanía (o denuncia de pérdida)',
                    cedulaPdf,
                    setCedulaPdf,
                    'cedula_pdf'
                  )}
                </>
              )}

              {formData.tipo_persona === 'juridica' && (
                <>
                  {renderDocumentUpload(
                    'cedula_representante_pdf',
                    'Cédula del representante legal (o denuncia de pérdida)',
                    cedulaRepresentantePdf,
                    setCedulaRepresentantePdf,
                    'cedula_representante_pdf'
                  )}

                  {renderDocumentUpload(
                    'cert_existencia_pdf',
                    'Certificado de existencia y representación legal (no mayor a 30 días)',
                    certExistenciaPdf,
                    setCertExistenciaPdf,
                    'cert_existencia_pdf'
                  )}
                </>
              )}

              {!formData.tipo_persona && (
                <div className="md:col-span-2 text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    Seleccione el tipo de persona en el paso anterior para ver los documentos requeridos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 7: Documentos Diferenciales</h2>
              <p className="text-gray-600">Documentos opcionales que son subsanables (no bloquean el envÃ­o)</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                â„¹ï¸ <strong>Estos documentos son opcionales.</strong> Si no los tiene ahora, puede subirlos despuÃ©s (subsanables).
                No bloquean el envÃ­o de su inscripciÃ³n.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RUV */}
              {renderDocumentUpload(
                'ruv_pdf',
                'Certificado del Registro Ãšnico de VÃ­ctimas (RUV)',
                ruvPdf,
                setRuvPdf,
                'ruv_pdf'
              )}

              {/* SISBEN */}
              {renderDocumentUpload(
                'sisben_pdf',
                'Certificado SISBEN',
                sisbenPdf,
                setSisbenPdf,
                'sisben_pdf'
              )}

              {/* Grupo Ã‰tnico */}
              {renderDocumentUpload(
                'grupo_etnico_pdf',
                'Certificado de pertenencia a grupo Ã©tnico',
                grupoEtnicoPdf,
                setGrupoEtnicoPdf,
                'grupo_etnico_pdf'
              )}

              {/* ARN */}
              {renderDocumentUpload(
                'arn_pdf',
                'Certificado de proceso de reincorporaciÃ³n (ARN)',
                arnPdf,
                setArnPdf,
                'arn_pdf'
              )}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 8: Documentos de Control</h2>
              <p className="text-gray-600">Documentos obligatorios de control y verificaciÃ³n</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Antecedentes Fiscales */}
              {renderDocumentUpload(
                'antecedentes_fiscales_pdf',
                'Antecedentes Fiscales',
                antecedentesFiscalesPdf,
                setAntecedentesFiscalesPdf,
                'antecedentes_fiscales_pdf'
              )}

              {/* Antecedentes Judiciales */}
              {renderDocumentUpload(
                'antecedentes_judiciales_pdf',
                'Antecedentes Judiciales',
                antecedentesJudicialesPdf,
                setAntecedentesJudicialesPdf,
                'antecedentes_judiciales_pdf'
              )}

              {/* Antecedentes ContralorÃ­a */}
              {renderDocumentUpload(
                'antecedentes_contraloria_pdf',
                'Antecedentes ContralorÃ­a General de la RepÃºblica',
                antecedentesContraloriaPdf,
                setAntecedentesContraloriaPdf,
                'antecedentes_contraloria_pdf'
              )}

              {/* Antecedentes ProcuradurÃ­a */}
              {renderDocumentUpload(
                'antecedentes_procuraduria_pdf',
                'Antecedentes ProcuradurÃ­a General de la NaciÃ³n',
                antecedentesProcuraduriaPdf,
                setAntecedentesProcuraduriaPdf,
                'antecedentes_procuraduria_pdf'
              )}
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 9: Funcionamiento del Emprendimiento</h2>
              <p className="text-gray-600">Documentos que demuestran el funcionamiento del emprendimiento</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MatrÃ­cula Mercantil */}
              {renderDocumentUpload(
                'matricula_mercantil_pdf',
                'MatrÃ­cula Mercantil o Certificado de Existencia y RepresentaciÃ³n Legal',
                matriculaMercantilPdf,
                setMatriculaMercantilPdf,
                'matricula_mercantil_pdf'
              )}

              {/* Facturas de Venta */}
              {renderDocumentUpload(
                'facturas_venta_pdf',
                'Facturas de Venta (6+ meses de funcionamiento)',
                facturasVentaPdf,
                setFacturasVentaPdf,
                'facturas_venta_pdf'
              )}

              {/* Redes Sociales */}
              {renderDocumentUpload(
                'redes_sociales_pdf',
                'Publicaciones de Redes Sociales (6+ meses)',
                redesSocialesPdf,
                setRedesSocialesPdf,
                'redes_sociales_pdf'
              )}

              {/* Comprobantes de Ventas */}
              {renderDocumentUpload(
                'comprobantes_ventas_pdf',
                'Comprobantes de Ventas',
                comprobantesVentasPdf,
                setComprobantesVentasPdf,
                'comprobantes_ventas_pdf'
              )}
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 10: FinanciaciÃ³n de Otras Fuentes</h2>
              <p className="text-gray-600">Declarar si ha recibido financiaciÃ³n estatal previa</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700 font-medium">
                âš ï¸ <strong>Importante:</strong> Debe declarar si ha recibido recursos del Fondo Emprender SENA o de otras fuentes estatales.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="financiado_estado"
                  checked={formData.financiado_estado === true}
                  onChange={(e) => setFormData({ ...formData, financiado_estado: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="financiado_estado" className="text-sm font-medium text-gray-700">
                  He recibido financiaciÃ³n del Fondo Emprender SENA
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="financiado_regalias"
                  checked={formData.financiado_regalias}
                  onChange={(e) => setFormData({ ...formData, financiado_regalias: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="financiado_regalias" className="text-sm font-medium text-gray-700">
                  He recibido financiaciÃ³n de regalÃ­as
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="financiado_camara_comercio"
                  checked={formData.financiado_camara_comercio}
                  onChange={(e) => setFormData({ ...formData, financiado_camara_comercio: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="financiado_camara_comercio" className="text-sm font-medium text-gray-700">
                  He recibido financiaciÃ³n de CÃ¡mara de Comercio
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="financiado_incubadoras"
                  checked={formData.financiado_incubadoras}
                  onChange={(e) => setFormData({ ...formData, financiado_incubadoras: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="financiado_incubadoras" className="text-sm font-medium text-gray-700">
                  He recibido financiaciÃ³n de incubadoras
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="financiado_otro"
                  checked={formData.financiado_otro}
                  onChange={(e) => setFormData({ ...formData, financiado_otro: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="financiado_otro" className="text-sm font-medium text-gray-700">
                  He recibido financiaciÃ³n de otra fuente estatal
                </label>
              </div>

              {formData.financiado_otro && (
                <div className="mt-4">
                  <label htmlFor="financiado_otro_texto" className="block text-sm font-medium text-gray-700 mb-2">
                    Especifique la fuente:
                  </label>
                  <input
                    type="text"
                    id="financiado_otro_texto"
                    value={formData.financiado_otro_texto}
                    onChange={(e) => setFormData({ ...formData, financiado_otro_texto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Fondo de Ciencia, TecnologÃ­a e InnovaciÃ³n"
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 11:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 11: Declaraciones y TÃ©rminos</h2>
              <p className="text-gray-600">Declaraciones finales y aceptaciÃ³n de tÃ©rminos</p>
            </div>

            <div className="space-y-6">
              {/* DeclaraciÃ³n de Veracidad */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="declara_veraz"
                    checked={formData.declara_veraz}
                    onChange={(e) => setFormData({ ...formData, declara_veraz: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div>
                    <label htmlFor="declara_veraz" className="text-sm font-medium text-gray-700">
                      Declaro bajo la gravedad del juramento que la informaciÃ³n suministrada es veraz y completa
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Esta declaraciÃ³n es obligatoria para continuar con el proceso
                    </p>
                  </div>
                </div>
              </div>

              {/* DeclaraciÃ³n de No Beneficiario */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="declara_no_beneficiario"
                    checked={formData.declara_no_beneficiario}
                    onChange={(e) => setFormData({ ...formData, declara_no_beneficiario: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div>
                    <label htmlFor="declara_no_beneficiario" className="text-sm font-medium text-gray-700">
                      Declaro que no soy beneficiario de otros programas de financiaciÃ³n estatal
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Excepto los que haya declarado en el paso anterior
                    </p>
                  </div>
                </div>
              </div>

              {/* AceptaciÃ³n de TÃ©rminos */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acepta_terminos"
                    checked={formData.acepta_terminos}
                    onChange={(e) => setFormData({ ...formData, acepta_terminos: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div>
                    <label htmlFor="acepta_terminos" className="text-sm font-medium text-gray-700">
                      Acepto los tÃ©rminos y condiciones de la convocatoria
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      He leÃ­do y acepto los tÃ©rminos de referencia de la convocatoria
                    </p>
                  </div>
                </div>
              </div>

              {/* InformaciÃ³n de Contacto */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">InformaciÃ³n de Contacto</h3>
                <p className="text-xs text-gray-500">
                  Una vez enviada su inscripciÃ³n, recibirÃ¡ un correo de confirmaciÃ³n. 
                  Mantenga su informaciÃ³n de contacto actualizada para recibir notificaciones sobre el proceso.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header del formulario */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Formulario de Registro - Emprendimiento Nariño
          </h1>
          <p className="text-center text-gray-600">
            Complete todos los pasos para enviar su inscripción
          </p>
        </div>

        {/* Indicador de progreso */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep} de {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Completado
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-11 gap-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`text-center p-2 rounded cursor-pointer transition-colors ${
                  step.number === currentStep
                    ? 'bg-green-600 text-white'
                    : step.number < currentStep
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => setCurrentStep(step.number)}
              >
                <div className="text-xs font-medium">{step.number}</div>
                <div className="text-xs">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md font-medium ${
                currentStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
          >
            Anterior
          </button>

          {currentStep === steps.length ? (
            <button
              type="button"
              onClick={submitCompleteForm}
              disabled={isSubmitting}
              className="px-8 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Inscripción'}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Siguiente'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPageMultiStep
