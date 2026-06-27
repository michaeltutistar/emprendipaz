import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff, ArrowLeft, Upload, FileText, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import logoGobernacion from '../assets/logo-gobernacion.png'
import { MUNICIPIOS_POR_SUBREGION } from '@/constants/municipios'
import API_BASE_URL from '@/config/api'
const RegisterPageMultiStep = ({ embedded = false, forceAdminMode = false }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const isAdminMode = forceAdminMode || searchParams.get('admin') === 'true' // Modo admin para habilitar edici?n
  const [currentStep, setCurrentStep] = useState(1)
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [resumeDocument, setResumeDocument] = useState('')
  const [isExistingUser, setIsExistingUser] = useState(false) // Nuevo estado para rastrear usuarios existentes
  const [showFinalizeConfirmation, setShowFinalizeConfirmation] = useState(false) // Modal de confirmaci?n final
  const [showValidationError, setShowValidationError] = useState(false) // Modal de error de validaci?n
  const [validationErrorMessage, setValidationErrorMessage] = useState('') // Mensaje de error de validaci?n
  const [isStep1Complete, setIsStep1Complete] = useState(false) // Control para habilitar navegaci?n libre despu?s del Paso 1
  // Rastrear archivos ya subidos usando sessionStorage para persistencia
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    try {
      const stored = sessionStorage.getItem('uploadedFiles')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })
  const [uploadingStatuses, setUploadingStatuses] = useState({})
  const [pendingUploads, setPendingUploads] = useState({})

  // Funci?n para limpiar archivos subidos
  const clearUploadedFiles = () => {
    setUploadedFiles(new Set())
    setUploadingStatuses({})
    setPendingUploads({})
    try {
      sessionStorage.removeItem('uploadedFiles')
    } catch (e) {
      console.warn('No se pudo limpiar sessionStorage:', e)
    }
  }

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
    corregimiento_vereda: '',
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

    // Campos de poblaci?n diferencial (TDR)
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

    // Video de presentaci?n
    video_presentacion: null
  })

  // Estados de documentos (igual que el original)
  const [docTerminosPdf, setDocTerminosPdf] = useState(null)
  const [docUsoImagenPdf, setDocUsoImagenPdf] = useState(null)
  const [docPlanNegocioXls, setDocPlanNegocioXls] = useState(null)
  const [docVecindadPdf, setDocVecindadPdf] = useState(null)
  const [declaracionJuramentadaPdf, setDeclaracionJuramentadaPdf] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [rutPdf, setRutPdf] = useState(null)
  const [cedulaPdf, setCedulaPdf] = useState(null)
  const [cedulaRepresentantePdf, setCedulaRepresentantePdf] = useState(null)
  const [certExistenciaPdf, setCertExistenciaPdf] = useState(null)
  const [camaraComercio, setCamaraComercio] = useState(null)
  const [ruvPdf, setRuvPdf] = useState(null)
  const [sisbenPdf, setSisbenPdf] = useState(null)
  const [grupoEtnicoPdf, setGrupoEtnicoPdf] = useState(null)
  const [arnPdf, setArnPdf] = useState(null)
  const [discapacidadPdf, setDiscapacidadPdf] = useState(null)
  const [mujerCabezaFamiliaPdf, setMujerCabezaFamiliaPdf] = useState(null)
  const [personaDiscapacidadPdf, setPersonaDiscapacidadPdf] = useState(null)
  const [antecedentesFiscalesPdf, setAntecedentesFiscalesPdf] = useState(null)
  const [antecedentesDisciplinariosPdf, setAntecedentesDisciplinariosPdf] = useState(null)
  const [antecedentesJudicialesPdf, setAntecedentesJudicialesPdf] = useState(null)
  const [antecedentesContraloriaPdf, setAntecedentesContraloriaPdf] = useState(null)
  const [antecedentesProcuraduriaPdf, setAntecedentesProcuraduriaPdf] = useState(null)
  const [rnmcPdf, setRnmcPdf] = useState(null)
  const [redamPdf, setRedamPdf] = useState(null)
  const [inhabSexualesPdf, setInhabSexualesPdf] = useState(null)
  const [declaracionCapacidadPdf, setDeclaracionCapacidadPdf] = useState(null)
  const [facturas6mesesPdf, setFacturas6mesesPdf] = useState(null)
  const [facturasVentaPdf, setFacturasVentaPdf] = useState(null)
  const [publicacionesRedesPdf, setPublicacionesRedesPdf] = useState(null)
  const [redesSocialesPdf, setRedesSocialesPdf] = useState(null)
  const [registroVentasPdf, setRegistroVentasPdf] = useState(null)
  const [comprobantesVentasPdf, setComprobantesVentasPdf] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado para video de presentacion
  const [videoPresentacion, setVideoPresentacion] = useState(null)

  // Definicion de pasos
  const steps = [
    { number: 1, title: 'Datos Generales', description: 'Informacion personal y del emprendimiento' },
    { number: 2, title: 'Población Diferencial', description: 'Condiciones especiales y vulnerabilidad' },
    { number: 3, title: 'Emprendimiento', description: 'Tiempo funcionamiento, empleos y mercados' },
    { number: 4, title: 'Video Presentacion', description: 'Video de presentacion del emprendimiento' },
    { number: 5, title: 'Documentos Obligatorios', description: 'TDR, Uso de imagen, Plan de negocio, Vecindad' },
    { number: 6, title: 'Documentos por Tipo', description: 'Según persona natural o jurídica' },
    { number: 7, title: 'Documentos Diferenciales', description: 'RUV, SISBEN, Grupo etnico (opcionales)' },
    { number: 8, title: 'Documentos de Control', description: 'Antecedentes y certificados subsanables' },
    { number: 9, title: 'Funcionamiento', description: 'Certificacion de funcionamiento del emprendimiento' },
    { number: 10, title: 'Financiación', description: 'Financiación de otras fuentes estatales' },
    { number: 11, title: 'Declaraciones', description: 'Declaraciones y aceptación de términos' }
  ]

  const progressPercentage = (currentStep / steps.length) * 100
  const hasUploadedVideo = Boolean(
    videoPresentacion ||
    videoUrl ||
    formData.video_url ||
    formData.video_presentacion ||
    uploadedFiles.has('video_presentacion') ||
    uploadedFiles.has('video_url')
  )

  const hasUploadedDocument = (fileState, fieldName) => {
    return Boolean(fileState || uploadedFiles.has(fieldName) || formData[fieldName])
  }

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

  // Funci?n para retomar proceso existente
  const handleResumeProcess = async () => {
    if (!resumeDocument.trim()) return

    try {
      setIsLoading(true)
      setErrors({})

      const apiUrl = import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/resume-process`
        : `${API_BASE_URL}/resume-process`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_documento: resumeDocument.trim(),
          admin_mode: isAdminMode // Enviar flag de modo admin
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        // Cargar datos existentes
        setFormData({
          ...result.formData,
          password: '**********', // mostrar asteriscos en lugar de la contrase?a real
          confirm_password: '**********'
        })
        setCurrentStep(result.currentStep || 1)
        setUserId(result.user_id)
        setIsExistingUser(true) // Marcar como usuario existente

        // Cargar archivos ya subidos
        const uploadedFilesSet = new Set()
        const fileFields = [
          'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 'doc_vecindad_pdf', 'declaracion_juramentada_pdf',
          'rut_pdf', 'cedula_pdf', 'cedula_representante_pdf', 'cert_existencia_pdf',
          'ruv_pdf', 'sisben_pdf', 'grupo_etnico_pdf', 'arn_pdf', 'discapacidad_pdf',
          'mujer_cabeza_familia_pdf', 'persona_discapacidad_pdf',
          'antecedentes_fiscales_pdf', 'antecedentes_disciplinarios_pdf', 'antecedentes_judiciales_pdf',
          'antecedentes_contraloria_pdf', 'antecedentes_procuraduria_pdf', 'rnmc_pdf', 'redam_pdf',
          'inhabilidades_sexuales_pdf', 'declaracion_capacidad_legal_pdf',
          'facturas_6meses_pdf', 'facturas_venta_pdf',
          'publicaciones_redes_pdf', 'redes_sociales_pdf', 'registro_ventas_pdf',
          'comprobantes_ventas_pdf', 'video_presentacion'
        ]

        // Mapeo inverso: nombres de BD -> nombres de frontend
        const dbToFrontendMapping = {
          'publicaciones_redes_pdf': 'redes_sociales_pdf',
          'registro_ventas_pdf': 'comprobantes_ventas_pdf'
        }

        fileFields.forEach(field => {
          if (result.formData[field]) {
            // Usar el nombre mapeado si existe, de lo contrario usar el campo original
            const frontendField = dbToFrontendMapping[field] || field
            uploadedFilesSet.add(frontendField)
          }
        })

        // Tambi?n verificar campos que el backend puede devolver directamente
        const directFields = ['comprobantes_ventas_pdf', 'redes_sociales_pdf']
        directFields.forEach(field => {
          if (result.formData[field]) {
            uploadedFilesSet.add(field)
          }
        })

        setUploadedFiles(uploadedFilesSet)
        // Guardar en sessionStorage para persistencia
        try {
          sessionStorage.setItem('uploadedFiles', JSON.stringify([...uploadedFilesSet]))
        } catch (e) {
          console.warn('No se pudo guardar en sessionStorage:', e)
        }

        // Cargar video_url si existe
        if (result.formData.video_url || result.formData.video_presentacion) {
          const videoUrlValue = result.formData.video_url || result.formData.video_presentacion
          setVideoUrl(videoUrlValue)
        }

        setIsStep1Complete(true) // ? Habilitar navegaci?n libre al retomar proceso
        setSuccessMessage('✓ Proceso cargado exitosamente. Puede continuar donde lo dejó.')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrors({ resume: result.error || 'No se encontró un proceso iniciado con este documento' })
      }
    } catch (err) {
      setErrors({ resume: 'Error de conexión al cargar el proceso' })
    } finally {
      setIsLoading(false)
    }
  }

  // Flujo específico para comprobantes de ventas usando el mismo endpoint estable del resto de documentos.
  const handleComprobantesVentasChange = async (file, setter, fieldName) => {
    try {
      if (!file) return

      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, [fieldName]: 'Solo se permiten archivos PDF' }))
        setter(null)
        return
      }

      // L?mite de 10MB para comprobantes de ventas (l?mite de API Gateway)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [fieldName]: `El archivo no puede superar 10MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB` }))
        setter(null)
        return
      }

      // Limpiar errores previos
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }))
      }

      setter(file)

      // Reusar el flujo estándar evita depender de endpoints no disponibles para este campo.
      if (!formData.numero_documento || !userId) {
        setPendingUploads(prev => ({ ...prev, [fieldName]: file }))
        return
      }

      await uploadSingleFileInternal(file, fieldName, setter)

    } catch (error) {
      console.error(`Error subiendo archivo ${fieldName}:`, error)
      setErrors(prev => ({ ...prev, [fieldName]: `Error al subir archivo: ${error.message}` }))
      setter(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (file, setter, fieldName, allowedTypes = ['application/pdf'], maxSize = 10 * 1024 * 1024) => {
    try {
      if (!file) return

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [fieldName]: `Tipo de archivo no válido. Se requiere: ${allowedTypes.join(', ')}` }))
        setter(null)
        return
      }

      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [fieldName]: `El archivo no puede superar ${Math.round(maxSize / (1024 * 1024))}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB` }))
        setter(null)
        return
      }

      // Limpiar errores previos
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }))
      }

      setter(file)

      // Subir archivo inmediatamente s?lo si ya tenemos usuario creado
      if (!formData.numero_documento || !userId) {
        setPendingUploads(prev => ({ ...prev, [fieldName]: file }))
        return
      }

      await uploadSingleFileInternal(file, fieldName, setter)
    } catch (error) {
      console.error(`Error manejando archivo ${fieldName}:`, error)
      setErrors(prev => ({ ...prev, [fieldName]: 'Error al procesar el archivo. Intente de nuevo.' }))
      setter(null)
    }
  }

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = error => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const uploadSingleFileInternal = async (file, fieldName, setter, options = {}) => {
    const apiUrl = import.meta.env.MODE === 'production'
      ? `${API_BASE_URL}/upload-file`
      : `${API_BASE_URL}/upload-file`

    setUploadingStatuses(prev => ({
      ...prev,
      [fieldName]: { status: 'uploading', message: 'Subiendo documento...' }
    }))

    try {
      if (!formData.numero_documento) {
        throw new Error('Falta número de documento para cargar el archivo')
      }

      const base64Data = await convertFileToBase64(file)

      const payload = {
        numero_documento: formData.numero_documento,
        campo: fieldName,
        archivo: base64Data,
        nombre_archivo: file.name
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el archivo')
      }

      setUploadingStatuses(prev => ({
        ...prev,
        [fieldName]: {
          status: 'success',
          message: result.already_exists ? 'Documento ya estaba cargado' : 'Documento subido correctamente'
        }
      }))

      // Marcar el archivo como subido en sessionStorage
      try {
        const currentUploaded = JSON.parse(sessionStorage.getItem('uploadedFiles') || '[]')
        if (!currentUploaded.includes(fieldName)) {
          currentUploaded.push(fieldName)
          sessionStorage.setItem('uploadedFiles', JSON.stringify(currentUploaded))
        }
        setUploadedFiles(new Set(currentUploaded))
      } catch (storageError) {
        console.warn('No se pudo actualizar sessionStorage:', storageError)
      }

    } catch (error) {
      console.error(`Error subiendo archivo ${fieldName}:`, error)
      setUploadingStatuses(prev => ({
        ...prev,
        [fieldName]: {
          status: 'error',
          message: 'No se pudo subir el documento',
          error: error.message || 'Error desconocido'
        }
      }))
    }
  }

  // Funci?n especial para subir videos usando Pre-signed URLs (solo para Paso 4)
  const uploadVideoDirectToS3 = async (file) => {
    try {
      // Actualizar estado de subida
      setUploadingStatuses(prev => ({
        ...prev,
        video_presentacion: { status: 'uploading', message: 'Preparando subida...' }
      }))

      const apiUrl = import.meta.env.MODE === 'production'
        ? '/api'
        : '/api'

      // Paso 1: Solicitar URL pre-firmada
      const urlResponse = await fetch(`${apiUrl}/get-video-upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_documento: formData.numero_documento,
          filename: file.name,
          content_type: file.type,
          file_size: file.size,
          admin_mode: isAdminMode // Enviar flag de modo admin
        }),
        credentials: 'include'
      })

      if (!urlResponse.ok) {
        const error = await urlResponse.json()
        throw new Error(error.error || 'Error obteniendo URL de subida')
      }

      const { upload_url, file_key } = await urlResponse.json()

      // ?? DEBUG: Verificar content-type
      console.log('?? DEBUG - File type del frontend:', file.type)
      console.log('?? DEBUG - URL pre-firmada:', upload_url)

      // Verificar si la URL contiene content-type como query parameter
      const urlObj = new URL(upload_url)
      const contentTypeParam = urlObj.searchParams.get('content-type')
      console.log('?? DEBUG - Content-Type en URL:', contentTypeParam)
      console.log('?? DEBUG - Content-Type que enviaremos:', file.type)
      console.log('?? DEBUG - ?Coinciden?', file.type === contentTypeParam)

      // Paso 2: Subir archivo directo a S3 usando PUT
      setUploadingStatuses(prev => ({
        ...prev,
        video_presentacion: { status: 'uploading', message: 'Subiendo video a S3...' }
      }))

      // ?? DEBUG: Log de la petici?n que vamos a enviar
      console.log('?? DEBUG - Enviando PUT a S3 con:')
      console.log('  - URL:', upload_url.substring(0, 100) + '...')
      console.log('  - Method: PUT')
      console.log('  - Content-Type:', file.type)
      console.log('  - File size:', file.size, 'bytes')
      console.log('  - File name:', file.name)

      // ?? SOLUCI?N DEFINITIVA: Usar XMLHttpRequest para evitar interceptor de fetch
      const uploadResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve({ ok: true, status: 200 });
          } else {
            reject(new Error(`Error ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));

        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      })

      console.log('?? DEBUG - Respuesta de S3:')
      console.log('  - Status:', uploadResponse.status)
      console.log('  - Status Text:', uploadResponse.statusText || 'OK')
      console.log('  - Headers:', 'XMLHttpRequest no expone headers de respuesta')

      if (!uploadResponse.ok) {
        // ?? DEBUG: Obtener el cuerpo de la respuesta XML para ver el error espec?fico
        try {
          const errorText = await uploadResponse.text()
          console.log('?? DEBUG - Error XML de S3:')
          console.log(errorText)
        } catch (e) {
          console.log('?? DEBUG - No se pudo leer el error XML:', e)
        }
        throw new Error('Error subiendo archivo a S3')
      }

      // Paso 3: Confirmar subida al backend
      setUploadingStatuses(prev => ({
        ...prev,
        video_presentacion: { status: 'uploading', message: 'Confirmando subida...' }
      }))

      const confirmResponse = await fetch(`${apiUrl}/confirm-video-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_documento: formData.numero_documento,
          file_key
        }),
        credentials: 'include'
      })

      if (!confirmResponse.ok) {
        const error = await confirmResponse.json()
        throw new Error(error.error || 'Error confirmando subida')
      }

      const result = await confirmResponse.json()

      // Actualizar estados
      setVideoPresentacion(file)
      setVideoUrl(result.video_url)
      setUploadingStatuses(prev => ({
        ...prev,
        video_presentacion: {
          status: 'success',
          message: `Video subido correctamente (${result.size_mb} MB)`
        }
      }))

      // Limpiar errores
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.video_presentacion
        return newErrors
      })

      console.log('? Video subido exitosamente:', result.video_url)

    } catch (error) {
      console.error('? Error subiendo video:', error)
      setUploadingStatuses(prev => ({
        ...prev,
        video_presentacion: {
          status: 'error',
          message: error.message || 'Error al subir el video'
        }
      }))
      setErrors(prev => ({ ...prev, video_presentacion: error.message }))
    }
  }

  // Función para descargar documentos desde la página de términos
  const handleDownloadFormat = (documentName) => {
    const documentMappings = {
      'Certificado de Compromiso': '3. Certificado de Compromiso.pdf',
      'Formato de autorización de datos': '4. Autorización.pdf',
      'Formato de Plan de Negocio (Excel)': '6. FORMATO PLAN DE NEGOCIO INSCRIPCIÓN.xlsx',
      'Certificado de vecindad con anexos': '5.Certificado de Vecindad.pdf',
      'Declaración Juramentada de Capacidad Legal': '7. DECLARACIÓN JURAMENTADA DE CAPACIDAD LEGAL.pdf'
    }

    const fileName = documentMappings[documentName]
    if (fileName) {
      const link = document.createElement('a')
      link.href = `/Terminos/${fileName}`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderDocumentUpload = (fieldName, label, file, setter, validationName, isOptional = false, allowedTypes = ['application/pdf'], showDownloadButton = false, helpLink = null) => {
    const uploadStatus = uploadingStatuses[fieldName]
    const isUploading = uploadStatus?.status === 'uploading'
    const hasError = uploadStatus?.status === 'error'
    const isSuccess = uploadStatus?.status === 'success'
    const statusMessage = uploadStatus?.message
    const alreadyUploaded = uploadedFiles.has(validationName)
    // Obtener el nombre del archivo desde formData si existe
    const existingFilePath = formData[validationName]
    const existingFileName = existingFilePath ? existingFilePath.split('/').pop() : null

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label} {!isOptional && '*'}</Label>

        {/* Botón de descarga del formato - solo para Paso 5 */}
        {showDownloadButton && (
          <div className="mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadFormat(label)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Descárgalo aquí</span>
            </Button>
          </div>
        )}

        {/* Enlace de ayuda - para Paso 6 */}
        {helpLink && (
          <div className="mb-3">
            <a
              href={helpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center space-x-1"
            >
              <span>Obtener documento aquí</span>
            </a>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {file ? (
            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">
                  {isUploading ? 'Subiendo...' : file.name}
                </span>
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
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (validationName === 'comprobantes_ventas_pdf') {
                        handleComprobantesVentasChange(file, setter, validationName)
                      } else {
                        handleFileChange(file, setter, validationName, allowedTypes)
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {allowedTypes.includes('application/pdf') && 'PDF'}
                {allowedTypes.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && ' Excel'}
                (máx. 10MB)
              </p>
              {isUploading && (
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Subiendo documento...
                </p>
              )}
              {isSuccess && (
                <p className="text-sm text-green-600 mt-1">Documento subido correctamente</p>
              )}
              {alreadyUploaded && !isUploading && !isSuccess && (
                <div className="mt-1">
                  <p className="text-sm text-green-600 font-medium">Documento ya cargado anteriormente</p>
                  {existingFileName && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-200">
                      {existingFileName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Puedes subir un nuevo archivo para reemplazarlo</p>
                </div>
              )}
              {hasError && (
                <p className="text-sm text-red-600 mt-1">{uploadStatus?.error || 'Error al subir el documento'}</p>
              )}
              {!file && !isOptional && !alreadyUploaded && !isUploading && errors[validationName] && (
                <p className="text-sm text-red-600 mt-1">Falta documento obligatorio</p>
              )}
              {!file && isOptional && !alreadyUploaded && !isUploading && (
                <p className="text-sm text-yellow-600 mt-1">Documento no cargado (subsanable)</p>
              )}
            </div>
          )}
        </div>
        {errors[validationName] && (
          <p className="text-sm text-red-600">{errors[validationName]}</p>
        )}
        {statusMessage && (
          <p className={`text-sm ${hasError ? 'text-red-600' : 'text-green-600'}`}>{statusMessage}</p>
        )}
      </div>
    )
  }

  // Validaci?n por pasos
  const validateCurrentStep = () => {
    const newErrors = {}

    // En modo demo, ser m?s permisivo con las validaciones
    if (isDemoMode) {
      // Solo validar campos b?sicos en modo demo
      if (currentStep === 1) {
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
        if (!formData.email.trim()) {
          newErrors.email = 'El correo electrónico es obligatorio'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'El formato del correo electrónico no es válido'
        }
        // Solo validar contrase?a si NO es un usuario existente
        if (!isExistingUser && !formData.password) {
          newErrors.password = 'La contraseña es obligatoria'
        }
      }
      // Para los dem?s pasos en demo, no validar documentos
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    switch (currentStep) {
      case 1: // Datos Generales
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
        if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio'
        if (!formData.email.trim()) {
          newErrors.email = 'El correo electrónico es obligatorio'
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'El formato del correo electrónico no es válido'
        }
        if (!formData.tipo_documento.trim()) newErrors.tipo_documento = 'El tipo de documento es obligatorio'
        if (!formData.numero_documento.trim()) newErrors.numero_documento = 'El número de documento es obligatorio'
        if (!formData.fecha_nacimiento) {
          newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
        } else {
          const age = calcAge(formData.fecha_nacimiento)
          if (age === null) {
            newErrors.fecha_nacimiento = 'Fecha de nacimiento inválida'
          } else if (age < 18 || age > 32) {
            newErrors.fecha_nacimiento = 'Debe tener entre 18 y 32 años para participar'
          }
        }
        if (!formData.sexo) newErrors.sexo = 'El sexo es obligatorio'
        if (!formData.estado_civil) newErrors.estado_civil = 'El estado civil es obligatorio'
        if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio'
        if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria'
        if (!formData.municipio) newErrors.municipio = 'El municipio es obligatorio'
        if (!formData.emprendimiento_nombre.trim()) newErrors.emprendimiento_nombre = 'El nombre del emprendimiento es obligatorio'
        if (!formData.emprendimiento_sector) newErrors.emprendimiento_sector = 'El sector económico es obligatorio'
        if (!formData.tipo_persona) newErrors.tipo_persona = 'El tipo de persona es obligatorio'
        if (!formData.convocatoria) newErrors.convocatoria = 'La convocatoria es obligatoria'
        // Solo validar contrase?a si NO es un usuario existente
        if (!isExistingUser) {
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
        }
        break

      case 2: // Población Diferencial
        // No hay validaciones obligatorias - todos los campos son opcionales
        break

      case 3: // Emprendimiento
        if (!formData.tiempo_funcionamiento) newErrors.tiempo_funcionamiento = 'El tiempo de funcionamiento es obligatorio'
        if (!formData.empleos_generados) newErrors.empleos_generados = 'El número de empleos generados es obligatorio'
        if (!formData.acceso_mercados) newErrors.acceso_mercados = 'El nivel de acceso a mercados es obligatorio'
        break

      case 4: // Video Presentación
        if (!hasUploadedVideo) newErrors.video_presentacion = 'El video de presentación es obligatorio'
        break

      case 5: // Documentos Obligatorios
        if (!hasUploadedDocument(docTerminosPdf, 'doc_terminos_pdf')) newErrors.doc_terminos_pdf = 'El documento TDR es obligatorio'
        if (!hasUploadedDocument(docUsoImagenPdf, 'doc_uso_imagen_pdf')) newErrors.doc_uso_imagen_pdf = 'La autorización de uso de imagen es obligatoria'
        if (!hasUploadedDocument(docPlanNegocioXls, 'doc_plan_negocio_xls')) newErrors.doc_plan_negocio_xls = 'El plan de negocio es obligatorio'
        if (!hasUploadedDocument(docVecindadPdf, 'doc_vecindad_pdf')) newErrors.doc_vecindad_pdf = 'El certificado de vecindad es obligatorio'
        if (!hasUploadedDocument(declaracionCapacidadPdf, 'declaracion_capacidad_legal_pdf')) newErrors.declaracion_capacidad_legal_pdf = 'La declaración juramentada de capacidad legal es obligatoria'
        break

      case 6: // Documentos por Tipo
        if (!rutPdf) newErrors.rut_pdf = 'El RUT es obligatorio'
        if (formData.tipo_persona === 'natural') {
          if (!cedulaPdf) newErrors.cedula_pdf = 'La cédula es obligatoria para Persona Natural'
        } else if (formData.tipo_persona === 'juridica') {
          if (!cedulaRepresentantePdf) newErrors.cedula_representante_pdf = 'La cédula del representante legal es obligatoria para Persona Jurídica'
          if (!certExistenciaPdf) newErrors.cert_existencia_pdf = 'El certificado de existencia o matrícula mercantil es obligatorio para Persona Jurídica'
        }
        break

      case 7: // Documentos Diferenciales (opcionales, no bloquean)
        // No hay validaciones obligatorias en este paso
        break

      case 8: // Documentos de Control
        // Estos documentos son subsanables (opcionales), no bloquean el avance
        // No hay validaciones obligatorias en este paso
        break

      case 9: // Funcionamiento
        // Todos los documentos de funcionamiento son subsanables (opcionales)
        // No hay validaciones obligatorias en este paso
        break

      case 10: // Financiación
        // Solo validar el texto de "otro" si est? marcado
        if (formData.financiado_otro && !formData.financiado_otro_texto.trim()) {
          newErrors.financiado_otro_texto = 'Si selecciona "Otro" como fuente de financiación, debe especificar cuál'
        }
        break

      case 11: // Declaraciones
        if (!formData.declara_veraz) newErrors.declara_veraz = 'Debe declarar que la información suministrada es veraz'
        if (!formData.declara_no_beneficiario) newErrors.declara_no_beneficiario = 'Debe confirmar que la información sobre financiación declarada es correcta y completa'
        if (!formData.acepta_terminos) newErrors.acepta_terminos = 'Debe aceptar los términos y condiciones de la convocatoria'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Guardado parcial - SOLO datos del formulario (textos, checkboxes, selects)
  const savePartialProgress = async () => {
    if (!formData.numero_documento) {
      setErrors({ general: 'El número de documento es requerido para guardar el progreso' })
      return false
    }

    try {
      setIsSaving(true)

      // Modo demo: simular guardado de progreso
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Simular delay
        return true
      }

      const apiUrl = import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/save-partial`
        : `${API_BASE_URL}/save-partial`

      // Preparar datos SIN archivos (solo datos del formulario)
      const submitData = {
        numero_documento: formData.numero_documento,
        paso: currentStep,
        admin_mode: isAdminMode, // Enviar flag de modo admin
        ...formData
      }

      // Remover campos de archivos del submitData para evitar payload grande
      const fileFields = [
        'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 'doc_vecindad_pdf', 'declaracion_juramentada_pdf',
        'rut_pdf', 'cedula_pdf', 'cedula_representante_pdf', 'cert_existencia_pdf',
        'ruv_pdf', 'sisben_pdf', 'grupo_etnico_pdf', 'arn_pdf', 'discapacidad_pdf',
        'antecedentes_fiscales_pdf', 'antecedentes_disciplinarios_pdf', 'antecedentes_judiciales_pdf',
        'antecedentes_contraloria_pdf', 'antecedentes_procuraduria_pdf', 'redam_pdf',
        'inhabilidades_sexuales_pdf', 'declaracion_capacidad_legal_pdf',
        'facturas_6meses_pdf', 'facturas_venta_pdf',
        'publicaciones_redes_pdf', 'redes_sociales_pdf', 'registro_ventas_pdf',
        'comprobantes_ventas_pdf', 'video_presentacion'
      ]

      // Limpiar campos de archivos del submitData
      fileFields.forEach(field => {
        delete submitData[field]
        delete submitData[`${field}_nombre`]
      })

      console.log('Guardando datos del formulario:', submitData)

      // Guardar los datos del formulario (sin archivos)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error del servidor:', result)
        throw new Error(result.error || 'Error al guardar el progreso')
      }

      console.log('Datos guardados exitosamente:', result)

      // Actualizar userId si es un nuevo usuario
      if (result.user_id && !userId) {
        setUserId(result.user_id)
      }

      // Si es el paso 1 y hay archivos pendientes, subirlos ahora que ya existe el usuario
      if (currentStep === 1 && Object.keys(pendingUploads).length > 0) {
        console.log('Subiendo archivos pendientes del paso 1:', Object.keys(pendingUploads))
        const uploads = Object.entries(pendingUploads).map(async ([field, pendingFile]) => {
          const setter = getSetterByField(field)
          if (setter) {
            await uploadSingleFileInternal(pendingFile, field, setter)
          }
        })
        await Promise.all(uploads)
        setPendingUploads({})
      }

      return true
    } catch (err) {
      console.error('Error en savePartialProgress:', err)
      setErrors({ general: 'Error de conexión al guardar progreso' })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Navegaci?n entre pasos
  const nextStep = async () => {
    if (!validateCurrentStep()) {
      return
    }

    // En modo demo, no guardar progreso
    if (!isDemoMode) {
      // Guardar datos del formulario (sin archivos)
      const saved = await savePartialProgress()
      if (!saved) return

      // mostrar mensaje de ?xito solo si se guard? correctamente
      setSuccessMessage('✓ Progreso guardado exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
    }

    // ? CR?TICO: Si estamos en el Paso 1, habilitar navegaci?n libre
    if (currentStep === 1) {
      setIsStep1Complete(true)
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

  // Navegaci?n directa a cualquier paso
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      // Validar que pasos previos est?n completos si se navega hacia adelante manualmente
      if (stepNumber > currentStep) {
        for (let i = currentStep; i < stepNumber; i++) {
          if (!validateStep(i)) {
            setErrors(prev => ({
              ...prev,
              general: 'Complete los requisitos del paso actual antes de avanzar'
            }))
            return
          }
        }
      }

      setCurrentStep(stepNumber)
      setErrors({})
    }
  }

  // Registro inicial (crear usuario)
  const createInitialUser = async () => {
    if (!validateCurrentStep()) return

    try {
      setIsLoading(true)

      // Modo demo: simular creaci?n de usuario
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
        setUserId('demo-user-123')
        setSuccessMessage('✓ Usuario creado. Puede continuar completando el formulario.')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      }

      const apiUrl = import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/register-initial`
        : `${API_BASE_URL}/register-initial`

      const response = await fetch(apiUrl, {
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
        setSuccessMessage('✓ Usuario creado. Puede continuar completando el formulario.')
        setTimeout(() => setSuccessMessage(''), 3000)
        return true
      } else {
        setErrors({ general: result.error || 'Error al crear usuario' })
        return false
      }
    } catch (err) {
      setErrors({ general: 'Error de conexión' })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Funci?n para confirmar y enviar el formulario
  const handleFinalize = () => {
    setShowFinalizeConfirmation(true)
  }

  // Funci?n para guardar avance sin finalizar
  const handleSaveProgress = async () => {
    setShowFinalizeConfirmation(false)
    await savePartialProgress()
  }

  // Env?o final del formulario - Solo finalizar proceso
  const submitCompleteForm = async () => {
    // ?? DEBUG: Ver estado de documentos antes de validar
    console.log('=== DEBUG VALIDACIÓN DE DOCUMENTOS ===')
    console.log('videoUrl:', videoUrl)
    console.log('uploadedFiles tiene video_presentacion:', uploadedFiles.has('video_presentacion'))
    console.log('uploadedFiles tiene video_url:', uploadedFiles.has('video_url'))
    console.log('formData.video_url:', formData.video_url)
    console.log('docTerminosPdf:', docTerminosPdf)
    console.log('uploadedFiles tiene doc_terminos_pdf:', uploadedFiles.has('doc_terminos_pdf'))
    console.log('formData.doc_terminos_pdf:', formData.doc_terminos_pdf)
    console.log('docVecindadPdf:', docVecindadPdf)
    console.log('uploadedFiles tiene doc_vecindad_pdf:', uploadedFiles.has('doc_vecindad_pdf'))
    console.log('formData.doc_vecindad_pdf:', formData.doc_vecindad_pdf)
    console.log('docPlanNegocioXls:', docPlanNegocioXls)
    console.log('uploadedFiles tiene doc_plan_negocio_xls:', uploadedFiles.has('doc_plan_negocio_xls'))
    console.log('formData.doc_plan_negocio_xls:', formData.doc_plan_negocio_xls)
    console.log('docUsoImagenPdf:', docUsoImagenPdf)
    console.log('uploadedFiles tiene doc_uso_imagen_pdf:', uploadedFiles.has('doc_uso_imagen_pdf'))
    console.log('formData.doc_uso_imagen_pdf:', formData.doc_uso_imagen_pdf)
    console.log('uploadedFiles completo:', [...uploadedFiles])
    console.log('======================================')

    // Validaci?n de documentos obligatorios de Pasos 4 y 5 (para todos los tipos de persona)
    const mandatoryErrors = {}

    // Paso 4: Video de presentaci?n (obligatorio para todos)
    // Verificar tanto el estado como si est? en uploadedFiles o formData (con OR para aceptar cualquiera)
    if (!hasUploadedVideo) {
      mandatoryErrors.video_presentacion = 'El video de presentación es obligatorio'
    }

    // Paso 5: Documentos obligatorios (para todos los tipos de persona)
    // Verificar tanto el estado como si est? en uploadedFiles o formData (con OR para aceptar cualquiera)
    if (!hasUploadedDocument(docVecindadPdf, 'doc_vecindad_pdf')) {
      mandatoryErrors.doc_vecindad_pdf = 'El certificado de vecindad con anexos es obligatorio'
    }
    if (!hasUploadedDocument(docTerminosPdf, 'doc_terminos_pdf')) {
      mandatoryErrors.doc_terminos_pdf = 'El certificado de compromiso es obligatorio'
    }
    if (!hasUploadedDocument(docPlanNegocioXls, 'doc_plan_negocio_xls')) {
      mandatoryErrors.doc_plan_negocio_xls = 'El formato de plan de negocio (Excel) es obligatorio'
    }
    if (!hasUploadedDocument(docUsoImagenPdf, 'doc_uso_imagen_pdf')) {
      mandatoryErrors.doc_uso_imagen_pdf = 'El formato de autorización de datos es obligatorio'
    }
    if (!hasUploadedDocument(declaracionCapacidadPdf, 'declaracion_capacidad_legal_pdf')) {
      mandatoryErrors.declaracion_capacidad_legal_pdf = 'La declaración juramentada de capacidad legal es obligatoria'
    }

    if (Object.keys(mandatoryErrors).length > 0) {
      setErrors(mandatoryErrors)
      setShowFinalizeConfirmation(false)
      setValidationErrorMessage('Debe completar todos los documentos obligatorios en los Pasos 4 y 5')
      setShowValidationError(true)
      return
    }

    // Validaci?n espec?fica para Persona Jur?dica - documentos obligatorios del paso 6
    if (formData.tipo_persona === 'juridica') {
      const juridicaErrors = {}

      // Verificar tanto el estado como si est? en uploadedFiles o formData
      if (!rutPdf && !uploadedFiles.has('rut_pdf') && !formData.rut_pdf) {
        juridicaErrors.rut_pdf = 'El RUT actualizado 2025 es obligatorio para Persona Jurídica'
      }
      if (!cedulaRepresentantePdf && !uploadedFiles.has('cedula_representante_pdf') && !formData.cedula_representante_pdf) {
        juridicaErrors.cedula_representante_pdf = 'La cédula del representante legal es obligatoria para Persona Jurídica'
      }
      if (!certExistenciaPdf && !uploadedFiles.has('cert_existencia_pdf') && !formData.cert_existencia_pdf) {
        juridicaErrors.cert_existencia_pdf = 'El certificado de existencia o matrícula mercantil es obligatorio para Persona Jurídica'
      }

      if (Object.keys(juridicaErrors).length > 0) {
        setErrors(juridicaErrors)
        setShowFinalizeConfirmation(false)
        setValidationErrorMessage('Debe completar todos los documentos obligatorios para Persona Jurídica en el Paso 6')
        setShowValidationError(true)
        return
      }
    }

    // Validaci?n espec?fica para Persona Natural - documentos obligatorios del paso 6
    if (formData.tipo_persona === 'natural') {
      const naturalErrors = {}

      // Verificar tanto el estado como si est? en uploadedFiles o formData
      if (!rutPdf && !uploadedFiles.has('rut_pdf') && !formData.rut_pdf) {
        naturalErrors.rut_pdf = 'El RUT actualizado 2025 es obligatorio para Persona Natural'
      }
      if (!cedulaPdf && !uploadedFiles.has('cedula_pdf') && !formData.cedula_pdf) {
        naturalErrors.cedula_pdf = 'La cédula de ciudadanía es obligatoria para Persona Natural'
      }

      if (Object.keys(naturalErrors).length > 0) {
        setErrors(naturalErrors)
        setShowFinalizeConfirmation(false)
        setValidationErrorMessage('Debe completar todos los documentos obligatorios para Persona Natural en el Paso 6')
        setShowValidationError(true)
        return
      }
    }

    // Si es un usuario existente que est? retomando, NO validar (los archivos ya est?n en S3)
    if (!isExistingUser) {
      if (!validateCurrentStep()) return
    }

    // Cerrar el modal de confirmaci?n
    setShowFinalizeConfirmation(false)

    try {
      setIsLoading(true)

      // Preparar SOLO datos del formulario (sin archivos - ya est?n en S3)
      const submitData = {
        numero_documento: formData.numero_documento,
        paso: currentStep,
        ...formData
      }

      // Si es un usuario existente (tiene userId), no enviar contrase?a
      if (userId) {
        delete submitData.password
        delete submitData.confirm_password
      }

      // Remover campos de archivos del submitData (los archivos ya est?n en S3)
      const fileFields = [
        'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 'doc_vecindad_pdf', 'declaracion_juramentada_pdf',
        'rut_pdf', 'cedula_pdf', 'cedula_representante_pdf', 'cert_existencia_pdf',
        'ruv_pdf', 'sisben_pdf', 'grupo_etnico_pdf', 'arn_pdf', 'discapacidad_pdf',
        'antecedentes_fiscales_pdf', 'antecedentes_disciplinarios_pdf', 'antecedentes_judiciales_pdf',
        'antecedentes_contraloria_pdf', 'antecedentes_procuraduria_pdf', 'rnmc_pdf', 'redam_pdf',
        'inhabilidades_sexuales_pdf', 'declaracion_capacidad_legal_pdf',
        'facturas_6meses_pdf', 'facturas_venta_pdf',
        'publicaciones_redes_pdf', 'redes_sociales_pdf', 'registro_ventas_pdf',
        'comprobantes_ventas_pdf', 'video_presentacion'
      ]

      // Limpiar campos de archivos del submitData
      fileFields.forEach(field => {
        delete submitData[field]
        delete submitData[`${field}_nombre`]
      })

      submitData.video_url = videoUrl

      // DEBUG: Ver qu? datos se est?n enviando
      console.log('=== DATOS ENVIADOS AL FINALIZAR ===')
      console.log('Paso 10 - financiado_regalias:', submitData.financiado_regalias)
      console.log('Paso 10 - financiado_camara_comercio:', submitData.financiado_camara_comercio)
      console.log('Paso 10 - financiado_incubadoras:', submitData.financiado_incubadoras)
      console.log('Paso 10 - financiado_otro:', submitData.financiado_otro)
      console.log('Paso 11 - declara_no_beneficiario:', submitData.declara_no_beneficiario)
      console.log('submitData completo:', submitData)

      // Modo demo: simular env?o exitoso
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simular delay
        // mostrar mensaje de éxito y luego redirigir a una página de éxito
        setSuccessMessage('¡FELICITACIONES! Su inscripción ha sido completada exitosamente. ¡Bienvenido al programa EmprendiPaz!')
        setTimeout(() => {
          // Crear una página de éxito temporal
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
                <div style="font-size: 80px; margin-bottom: 20px;">✓</div>
                <h1 style="font-size: 48px; font-weight: bold; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                  ¡FELICITACIONES!
                </h1>
                <h2 style="font-size: 24px; margin-bottom: 30px; opacity: 0.9;">
                  Su inscripción ha sido completada exitosamente
                </h2>
                <p style="font-size: 18px; margin-bottom: 40px; opacity: 0.8;">
                  ¡Bienvenido al programa EmprendiPaz!<br>
                  Su solicitud ha sido recibida y será procesada.
                </p>
                <div style="
                  background: rgba(255,255,255,0.2);
                  padding: 20px;
                  border-radius: 10px;
                  margin-bottom: 30px;
                ">
                  <p style="font-size: 16px; margin: 0;">
                    <strong>Modo Demo:</strong> Esta es una simulación del proceso de registro.
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
        }, 2000) // mostrar mensaje por 2 segundos, luego página de éxito
        return
      }

      const apiUrl = import.meta.env.MODE === 'production'
        ? `${API_BASE_URL}/register`
        : `${API_BASE_URL}/register`

      const response = await fetch(apiUrl, {
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
        // mostrar popup de ?xito
        const successPopup = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <div style="
              background: linear-gradient(135deg, #059669, #10b981);
              color: white;
              padding: 40px;
              border-radius: 20px;
              text-align: center;
              max-width: 500px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
              animation: fadeInScale 0.5s ease-out;
            ">
              <div style="font-size: 60px; margin-bottom: 20px;">✓</div>
              <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; margin-top: 0;">
                ¡Inscripción Exitosa!
              </h2>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px; opacity: 0.95;">
                ${result.message || 'La inscripción se ha registrado con éxito. Espere a la aprobación del administrador. Le informaremos al correo registrado.'}
              </p>
              <button onclick="this.parentElement.parentElement.remove(); window.location.href='/login'" style="
                background: white;
                color: #059669;
                border: none;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                transition: transform 0.2s;
              " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                Continuar al Login
              </button>
            </div>
          </div>
          <style>
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.8);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          </style>
        `;
        document.body.insertAdjacentHTML('beforeend', successPopup);
      } else {
        setErrors({ general: result.error || 'Error al completar inscripción' })
      }
    } catch (err) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Paso 1: Si no hay userId, crear usuario inicial. Si ya existe, solo validar.
      if (!userId) {
        const created = await createInitialUser()
        if (!created) return // Si falla la creaci?n, no avanzar
      } else {
        // Usuario ya existe, solo validar y guardar
        if (!validateCurrentStep()) return
        await savePartialProgress()
      }

      // ? IMPORTANTE: Habilitar navegaci?n libre despu?s de completar Paso 1
      setIsStep1Complete(true)
      setCurrentStep(2)

    } else if (currentStep === steps.length) {
      // �ltimo paso: env?o final
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
              <p className="text-gray-600">Informacion personal y del emprendimiento</p>
            </div>

            {/* Campo para retomar proceso existente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Ya iniciaste tu proceso de registro?
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Si ya comenzaste a llenar el formulario anteriormente, ingresa tu numero de documento y contraseña para continuar donde lo dejaste.
                  </p>
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <Input
                        type="text"
                        placeholder="Numero de documento"
                        className="flex-1"
                        value={resumeDocument}
                        onChange={(e) => setResumeDocument(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResumeProcess}
                      disabled={!resumeDocument.trim() || isLoading}
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      {isLoading ? 'Validando...' : 'Continuar Proceso'}
                    </Button>
                  </div>
                  {errors.resume && (
                    <p className="text-sm text-red-600 mt-2">{errors.resume}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Mensaje informativo sobre el cierre de registros - solo si NO es modo admin */}
            {!isAdminMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                      Periodo de inscripcion cerrado
                    </h3>
                    <p className="text-sm text-yellow-700">
                      El periodo de inscripcion ha finalizado. Solo puedes acceder para subsanar documentos si ya iniciaste tu proceso de registro.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                  disabled={!isAdminMode}
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
                  disabled={!isAdminMode}
                />
                {errors.apellido && <p className="text-sm text-red-600">{errors.apellido}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electronico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={!isAdminMode}
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
                  disabled={!isAdminMode}
                >
                  <SelectTrigger className={errors.tipo_documento ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cedula">Cedula de Ciudadania</SelectItem>
                    <SelectItem value="cedula_extranjeria">Cedula de Extranjeria</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_documento && <p className="text-sm text-red-600">{errors.tipo_documento}</p>}
              </div>

              {/* Numero de documento */}
              <div className="space-y-2">
                <Label htmlFor="numero_documento">Numero de Documento *</Label>
                <Input
                  id="numero_documento"
                  name="numero_documento"
                  type="text"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  className={errors.numero_documento ? 'border-red-500' : ''}
                  placeholder="12345678"
                  autoComplete="off"
                  disabled={!isAdminMode}
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
                  disabled={!isAdminMode}
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
                  disabled={!isAdminMode}
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
                  disabled={!isAdminMode}
                >
                  <SelectTrigger className={errors.estado_civil ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soltero">Soltero(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="union_libre">Unión Libre</SelectItem>
                    <SelectItem value="separado">Separado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viudo">Viudo(a)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado_civil && <p className="text-sm text-red-600">{errors.estado_civil}</p>}
              </div>

              {/* Telefono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono Celular *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={errors.telefono ? 'border-red-500' : ''}
                  placeholder="3001234567"
                  autoComplete="tel"
                  disabled={!isAdminMode}
                />
                {errors.telefono && <p className="text-sm text-red-600">{errors.telefono}</p>}
              </div>

              {/* Direccion */}
              <div className="space-y-2">
                <Label htmlFor="direccion">Direccion de Residencia *</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className={errors.direccion ? 'border-red-500' : ''}
                  placeholder="Calle 123 # 45-67"
                  autoComplete="street-address"
                  disabled={!isAdminMode}
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
                  disabled={!isAdminMode}
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

              {/* Corregimiento o Vereda */}
              <div className="space-y-2">
                <Label htmlFor="corregimiento_vereda">Corregimiento o Vereda (Si aplica)</Label>
                <Input
                  id="corregimiento_vereda"
                  name="corregimiento_vereda"
                  type="text"
                  value={formData.corregimiento_vereda}
                  onChange={handleInputChange}
                  className={errors.corregimiento_vereda ? 'border-red-500' : ''}
                  placeholder="Ej: Vereda La Esperanza"
                  disabled={!isAdminMode}
                />
                {errors.corregimiento_vereda && <p className="text-sm text-red-600">{errors.corregimiento_vereda}</p>}
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
                  disabled={!isAdminMode}
                />
                {errors.emprendimiento_nombre && <p className="text-sm text-red-600">{errors.emprendimiento_nombre}</p>}
              </div>

              {/* Emprendimiento: Sector Economico */}
              <div className="space-y-2">
                <Label>Sector Economico *</Label>
                <Select
                  value={formData.emprendimiento_sector}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, emprendimiento_sector: value }))
                    if (errors.emprendimiento_sector) setErrors(prev => ({ ...prev, emprendimiento_sector: '' }))
                  }}
                  disabled={!isAdminMode}
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
                  disabled={!isAdminMode}
                >
                  <SelectTrigger className={errors.tipo_persona ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona el tipo de persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="juridica">Juridica</SelectItem>
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
                  disabled={!isAdminMode}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.convocatoria ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Selecciona una convocatoria</option>
                  <option value="1">Convocatoria 1 - Proceso Principal</option>
                </select>
                {errors.convocatoria && <p className="text-sm text-red-600">{errors.convocatoria}</p>}
              </div>

              {/* Contrasena */}
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${errors.password ? 'border-red-500 pr-10' : 'pr-10'} ${isExistingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Minimo 8 caracteres, letras y numeros"
                    autoComplete="new-password"
                    disabled={isExistingUser}
                    readOnly={isExistingUser}
                  />
                  {!isExistingUser && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  )}
                </div>
                {isExistingUser && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    La contraseña no se puede modificar durante el proceso de inscripcion. Guardela en un lugar seguro.
                  </p>
                )}
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`${errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'} ${isExistingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    disabled={isExistingUser}
                    readOnly={isExistingUser}
                  />
                  {!isExistingUser && (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  )}
                </div>
                {isExistingUser && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    La contraseña no se puede modificar durante el proceso de inscripcion. Guardela en un lugar seguro.
                  </p>
                )}
                {errors.confirm_password && <p className="text-sm text-red-600">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 2: Población Diferencial</h2>
              <p className="text-gray-600">Condiciones especiales y vulnerabilidad (opcional)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Información opcional:</strong> Estos campos son opcionales pero pueden otorgar puntos adicionales en la evaluación.
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
                        if (e.target.checked) {
                          // Si se marca, establecer un valor por defecto
                          setFormData({ ...formData, sisben_grupo: 'A' })
                        } else {
                          // Si se desmarca, limpiar el valor
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
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sistema de Puntuación</h3>
              <p className="text-xs text-gray-600">
                <strong>Total máximo de puntos por población diferencial:</strong> 38 puntos<br />
                Mujer cabeza de familia: 9 puntos<br />
                Persona en reincorporación: 6 puntos<br />
                Víctima del conflicto: 6 puntos<br />
                Persona con discapacidad: 6 puntos<br />
                Pertenencia étnica: 6 puntos<br />
                SISBEN A, B o C: 2 puntos
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
                <strong>Nivel de Madurez del Emprendimiento:</strong> Esta información es obligatoria y determina puntos adicionales en la evaluación.
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.tiempo_funcionamiento ? 'border-red-500' : 'border-gray-300'
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.empleos_generados ? 'border-red-500' : 'border-gray-300'
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.acceso_mercados ? 'border-red-500' : 'border-gray-300'
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
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sistema de Puntuación - Nivel de Madurez</h3>
              <p className="text-xs text-gray-600">
                <strong>Total máximo de puntos por nivel de madurez:</strong> 18 puntos<br />
                6-12 meses: 5 puntos<br />
                13-24 meses: 10 puntos<br />
                Más de 24 meses: 18 puntos<br />
                <br />
                <strong>Documentos requeridos:</strong><br />
                Emprendimientos recientes: Publicaciones de redes sociales + comprobantes de ventas<br />
                Emprendimientos consolidados: Registro de ventas, facturas o certificación de Cámara de Comercio
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
                <strong>Requisitos del video:</strong> Máximo 5 minutos, orientación horizontal, formato MP4, MOV o AVI.
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
                          setErrors(prev => ({ ...prev, video_presentacion: 'El archivo es demasiado grande. Máximo 100MB.' }))
                          return
                        }
                        // Usar nueva funci?n para subir video con pre-signed URL
                        uploadVideoDirectToS3(file)
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="video_presentacion" className="cursor-pointer">
                    <div className="text-gray-600">
                      {uploadingStatuses.video_presentacion?.status === 'uploading' ? (
                        <div>
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="text-blue-600 font-medium">Subiendo video...</p>
                          </div>
                        </div>
                      ) : uploadingStatuses.video_presentacion?.status === 'success' ? (
                        <div>
                          <p className="text-green-600 font-medium">Video subido correctamente</p>
                          <p className="text-sm">{videoPresentacion?.name}</p>
                          <p className="text-xs text-gray-500">
                            Tamaño: {videoPresentacion ? (videoPresentacion.size / (1024 * 1024)).toFixed(2) : '0'} MB
                          </p>
                        </div>
                      ) : uploadingStatuses.video_presentacion?.status === 'error' ? (
                        <div>
                          <p className="text-red-600 font-medium">Error al subir video</p>
                          <p className="text-xs text-red-500">{uploadingStatuses.video_presentacion.message}</p>
                        </div>
                      ) : videoUrl ? (
                        <div>
                          <p className="text-green-600 font-medium">Video ya cargado anteriormente</p>
                          <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-200">
                            {videoUrl.split('/').pop()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Puedes subir un nuevo video para reemplazarlo</p>
                        </div>
                      ) : videoPresentacion ? (
                        <div>
                          <p className="text-green-600 font-medium">Video seleccionado</p>
                          <p className="text-sm">{videoPresentacion.name}</p>
                          <p className="text-xs text-gray-500">
                            Tamaño: {(videoPresentacion.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
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
                <strong>Documentos obligatorios:</strong> Estos documentos son requeridos para todos los participantes y bloquean el envío si no se suben.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certificado de Compromiso */}
              {renderDocumentUpload(
                'doc_terminos_pdf',
                'Certificado de Compromiso',
                docTerminosPdf,
                setDocTerminosPdf,
                'doc_terminos_pdf',
                false,
                ['application/pdf'],
                true
              )}

              {/* Formato de autorización de datos */}
              {renderDocumentUpload(
                'doc_uso_imagen_pdf',
                'Formato de autorización de datos',
                docUsoImagenPdf,
                setDocUsoImagenPdf,
                'doc_uso_imagen_pdf',
                false,
                ['application/pdf'],
                true
              )}

              {/* Plan de Negocio */}
              {renderDocumentUpload(
                'doc_plan_negocio_xls',
                'Formato de Plan de Negocio (Excel)',
                docPlanNegocioXls,
                setDocPlanNegocioXls,
                'doc_plan_negocio_xls',
                false,
                ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
                true
              )}

              {/* Certificado de Vecindad */}
              {renderDocumentUpload(
                'doc_vecindad_pdf',
                'Certificado de vecindad con anexos',
                docVecindadPdf,
                setDocVecindadPdf,
                'doc_vecindad_pdf',
                false,
                ['application/pdf'],
                true
              )}

              {/* Declaración Juramentada de Capacidad Legal */}
              {renderDocumentUpload(
                'declaracion_capacidad_legal_pdf',
                'Declaración Juramentada de Capacidad Legal',
                declaracionCapacidadPdf,
                setDeclaracionCapacidadPdf,
                'declaracion_capacidad_legal_pdf',
                false,
                ['application/pdf'],
                true
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
                <strong>Documentos condicionales:</strong> Los documentos requeridos dependen del tipo de persona seleccionado en el Paso 1.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RUT (siempre obligatorio) */}
              {renderDocumentUpload(
                'rut_pdf',
                'RUT actualizado 2025',
                rutPdf,
                setRutPdf,
                'rut_pdf',
                false,
                ['application/pdf'],
                false,
                'https://www.dian.gov.co/impuestos/RUT/Paginas/Consultas-RUT.aspx'
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
                    'Certificado de existencia o matrícula mercantil (no mayor a 30 días)',
                    certExistenciaPdf,
                    setCertExistenciaPdf,
                    'cert_existencia_pdf',
                    false,
                    ['application/pdf'],
                    false,
                    'https://ccpasto.org.co/2024/servicios-virtuales/'
                  )}

                  {/* TEMPORAL: Comentado hasta resolver migraci?n de BD
                  {renderDocumentUpload(
                    'camara_comercio_pdf',
                    'Certificado de Cámara de Comercio (no mayor a 30 días)',
                    camaraComercio,
                    setCamaraComercio,
                    'camara_comercio_pdf'
                  )}
                  */}
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
              <p className="text-gray-600">Documentos opcionales que son subsanables (no bloquean el envío)</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                <strong>📌 Estos documentos son opcionales.</strong> Si no los tiene ahora, puede subirlos después (subsanables).
                No bloquean el envío de su inscripción.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RUV */}
              {renderDocumentUpload(
                'ruv_pdf',
                'Certificado del Registro Único de Víctimas (RUV)',
                ruvPdf,
                setRuvPdf,
                'ruv_pdf',
                true,
                ['application/pdf'],
                false,
                'https://unidadenlinea.unidadvictimas.gov.co/'
              )}

              {/* SISBEN */}
              {renderDocumentUpload(
                'sisben_pdf',
                'Certificado SISBEN',
                sisbenPdf,
                setSisbenPdf,
                'sisben_pdf',
                true,
                ['application/pdf'],
                false,
                'https://www.sisben.gov.co/paginas/consulta-tu-grupo.html'
              )}

              {/* Grupo �tnico */}
              {renderDocumentUpload(
                'grupo_etnico_pdf',
                'Certificado de pertenencia a grupo étnico',
                grupoEtnicoPdf,
                setGrupoEtnicoPdf,
                'grupo_etnico_pdf',
                true
              )}

              {/* ARN */}
              {renderDocumentUpload(
                'arn_pdf',
                'Certificado de proceso de reincorporación (ARN)',
                arnPdf,
                setArnPdf,
                'arn_pdf',
                true,
                ['application/pdf'],
                false,
                'https://sara.reincorporacion.gov.co/es/OtherServices/CertificadoOACP'
              )}

              {/* Mujer Cabeza de Familia */}
              {renderDocumentUpload(
                'mujer_cabeza_familia_pdf',
                'Mujer cabeza de familia - Certificado de autoridad local, departamental o declaración juramentada',
                mujerCabezaFamiliaPdf,
                setMujerCabezaFamiliaPdf,
                'mujer_cabeza_familia_pdf',
                true,
                ['application/pdf'],
                false
              )}

              {/* Persona en Situaci?n de Discapacidad */}
              {renderDocumentUpload(
                'persona_discapacidad_pdf',
                'Persona en situación de discapacidad - Certificado médico o del Registro de Localización y Caracterización',
                personaDiscapacidadPdf,
                setPersonaDiscapacidadPdf,
                'persona_discapacidad_pdf',
                true,
                ['application/pdf'],
                false
              )}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Paso 8: Documentos de Control</h2>
              <p className="text-gray-600">Documentos subsanables de control y verificación</p>
            </div>

            {/* Aviso importante sobre rechazo automático */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    INFORMACIÓN IMPORTANTE
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      <strong>Si se evidencian antecedentes disciplinarios, judiciales, REDAM o inhabilidades por delitos sexuales, la solicitud será rechazada automáticamente.</strong>
                    </p>
                    <p className="mt-2">
                      Asegúrese de que todos los certificados estén limpios antes de continuar con el proceso.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Antecedentes Judiciales */}
              {renderDocumentUpload(
                'antecedentes_judiciales_pdf',
                <>
                  Antecedentes Judiciales
                  <div className="text-blue-600 text-xs mt-1">
                    Descárgalo desde: <a href="https://antecedentes.policia.gov.co:7005/WebJudicial/" target="_blank" rel="noopener noreferrer" className="underline break-all">https://antecedentes.policia.gov.co:7005/WebJudicial/</a>
                  </div>
                </>,
                antecedentesJudicialesPdf,
                setAntecedentesJudicialesPdf,
                'antecedentes_judiciales_pdf'
              )}

              {/* Antecedentes Contraloría */}
              {renderDocumentUpload(
                'antecedentes_contraloria_pdf',
                <>
                  Antecedentes Contraloría General de la República
                  <div className="text-blue-600 text-xs mt-1">
                    Descárgalo desde: <a href="https://www.contraloria.gov.co/es/web/guest/control-fiscal/responsabilidad-fiscal/certificado-de-antecedentes-fiscales" target="_blank" rel="noopener noreferrer" className="underline break-all">https://www.contraloria.gov.co/es/web/guest/control-fiscal/responsabilidad-fiscal/certificado-de-antecedentes-fiscales</a>
                  </div>
                </>,
                antecedentesContraloriaPdf,
                setAntecedentesContraloriaPdf,
                'antecedentes_contraloria_pdf'
              )}

              {/* Antecedentes Procuraduría */}
              {renderDocumentUpload(
                'antecedentes_procuraduria_pdf',
                <>
                  Antecedentes Procuraduría General de la Nación
                  <div className="text-blue-600 text-xs mt-1">
                    Descárgalo desde: <a href="https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx" target="_blank" rel="noopener noreferrer" className="underline break-all">https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx</a>
                  </div>
                </>,
                antecedentesProcuraduriaPdf,
                setAntecedentesProcuraduriaPdf,
                'antecedentes_procuraduria_pdf'
              )}

              {/* Registro Nacional de Medidas Correctivas (RNMC) */}
              {renderDocumentUpload(
                'rnmc_pdf',
                <>
                  Registro Nacional de Medidas Correctivas (RNMC)
                  <div className="text-blue-600 text-xs mt-1">
                    Descárgalo desde: <a href="https://srvcnpc.policia.gov.co/PSC/frm_cnp_consulta.aspx" target="_blank" rel="noopener noreferrer" className="underline break-all">https://srvcnpc.policia.gov.co/PSC/frm_cnp_consulta.aspx</a>
                  </div>
                </>,
                rnmcPdf,
                setRnmcPdf,
                'rnmc_pdf'
              )}

              {/* REDAM */}
              {renderDocumentUpload(
                'redam_pdf',
                <>
                  Certificado del Registro de Deudores Alimentarios Morosos (REDAM)
                  <div className="text-blue-600 text-xs mt-1">
                    Descárgalo desde: <a href="https://www.redam.gov.co/" target="_blank" rel="noopener noreferrer" className="underline break-all">https://www.redam.gov.co/</a>
                  </div>
                </>,
                redamPdf,
                setRedamPdf,
                'redam_pdf'
              )}

              {/* Inhabilidades por delitos sexuales */}
              <div>
                {renderDocumentUpload(
                  'inhabilidades_sexuales_pdf',

                  <>
                    Consulta de Inhabilidades por Delitos Sexuales
                    <div className="text-blue-600 text-xs mt-1">
                      Descárgalo desde: <a href="https://inhabilidades.policia.gov.co:8080/" target="_blank" rel="noopener noreferrer" className="underline break-all">https://inhabilidades.policia.gov.co:8080/</a>
                    </div>
                  </>,
                  inhabSexualesPdf,
                  setInhabSexualesPdf,
                  'inhabilidades_sexuales_pdf'
                )}

              </div>
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

            {/* Nota informativa sobre documentos subsanables */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Todos los documentos de funcionamiento son <strong>subsanables</strong> (opcionales).
                Puede avanzar sin subirlos y completarlos posteriormente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Redes Sociales */}
              {renderDocumentUpload(
                'redes_sociales_pdf',
                'Publicaciones de Redes Sociales (Subsanable)',
                redesSocialesPdf,
                setRedesSocialesPdf,
                'redes_sociales_pdf'
              )}

              {/* Comprobantes de Ventas */}
              {renderDocumentUpload(
                'comprobantes_ventas_pdf',
                'Comprobantes de Ventas (Subsanable)',
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
              <h2 className="text-2xl font-bold text-gray-900">Paso 10: Financiación de Otras Fuentes</h2>
              <p className="text-gray-600">Declarar si ha recibido financiación estatal previa</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700 font-medium">
                <strong>Importante:</strong> Debe declarar si ha recibido recursos del Fondo Emprender SENA o de otras fuentes estatales.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Marque las fuentes de financiación estatal que ha recibido (opcional):
              </p>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="financiado_regalias"
                  checked={formData.financiado_regalias}
                  onChange={(e) => setFormData({ ...formData, financiado_regalias: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="financiado_regalias" className="text-sm font-medium text-gray-700">
                  He recibido financiación de regalías
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
                  He recibido financiación de Cámara de Comercio
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
                  He recibido financiación de incubadoras
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
                  He recibido financiación de otra fuente estatal
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
                    placeholder="Ej: Fondo de Ciencia, Tecnología e Innovación"
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
              <h2 className="text-2xl font-bold text-gray-900">Paso 11: Declaraciones y Términos</h2>
              <p className="text-gray-600">Declaraciones finales y aceptación de términos</p>
            </div>

            <div className="space-y-6">
              {/* Declaración de Veracidad */}
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
                      Declaro bajo la gravedad del juramento que la información suministrada es veraz y completa
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Esta declaración es obligatoria para continuar con el proceso
                    </p>
                  </div>
                </div>
              </div>

              {/* Declaración de Financiación */}
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
                      Declaro que la información sobre financiación estatal declarada en el paso anterior es correcta y completa
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Si no he recibido financiación estatal, confirmo que no he sido beneficiario de otros programas de financiación estatal para este emprendimiento
                    </p>
                  </div>
                </div>
              </div>

              {/* Aceptación de Términos */}
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
                      Acepto los términos y condiciones de la convocatoria
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      He leído y acepto los términos de referencia de la convocatoria
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Información de Contacto</h3>
                <p className="text-xs text-gray-500">
                  Una vez enviada su inscripción, recibirá un correo de confirmación.
                  Mantenga su información de contacto actualizada para recibir notificaciones sobre el proceso.
                </p>
              </div>

              {/* Mensaje de Felicitaciones */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-3">
                    ¡Felicidades, Joven Emprendedor!
                  </h3>
                  <div className="text-green-700 space-y-2">
                    <p className="text-lg font-medium">
                      Has subsanado con éxito todos los documentos necesarios.
                    </p>
                    <p className="text-base">
                      Tu proceso de registro ha finalizado y tus documentos han sido cargados correctamente.
                    </p>
                    <p className="text-base font-semibold">
                      No necesitas realizar ninguna acción adicional. Tu postulación está completa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getSetterByField = (field) => {
    const setterMap = {
      doc_terminos_pdf: setDocTerminosPdf,
      doc_uso_imagen_pdf: setDocUsoImagenPdf,
      doc_plan_negocio_xls: setDocPlanNegocioXls,
      doc_vecindad_pdf: setDocVecindadPdf,
      rut_pdf: setRutPdf,
      cedula_pdf: setCedulaPdf,
      cedula_representante_pdf: setCedulaRepresentantePdf,
      cert_existencia_pdf: setCertExistenciaPdf,
      // camara_comercio_pdf: setCamaraComercio,  // TEMPORAL: Comentado
      ruv_pdf: setRuvPdf,
      sisben_pdf: setSisbenPdf,
      grupo_etnico_pdf: setGrupoEtnicoPdf,
      arn_pdf: setArnPdf,
      discapacidad_pdf: setDiscapacidadPdf,
      antecedentes_fiscales_pdf: setAntecedentesFiscalesPdf,
      antecedentes_disciplinarios_pdf: setAntecedentesDisciplinariosPdf,
      antecedentes_judiciales_pdf: setAntecedentesJudicialesPdf,
      antecedentes_contraloria_pdf: setAntecedentesContraloriaPdf,
      antecedentes_procuraduria_pdf: setAntecedentesProcuraduriaPdf,
      rnmc_pdf: setRnmcPdf,
      redam_pdf: setRedamPdf,
      inhababilidades_sexuales_pdf: setInhabSexualesPdf,
      declaracion_capacidad_legal_pdf: setDeclaracionCapacidadPdf,
      facturas_6meses_pdf: setFacturas6mesesPdf,
      facturas_venta_pdf: setFacturasVentaPdf,
      publicaciones_redes_pdf: setPublicacionesRedesPdf,
      redes_sociales_pdf: setRedesSocialesPdf,
      registro_ventas_pdf: setRegistroVentasPdf,
      comprobantes_ventas_pdf: setComprobantesVentasPdf,
      video_presentacion: setVideoPresentacion
    }
    return setterMap[field] || null
  }

  useEffect(() => {
    if (!formData.numero_documento || !userId) return
    const pendingFields = Object.entries(pendingUploads)
    if (pendingFields.length === 0) return

    const uploadPendingFiles = async () => {
      const uploads = pendingFields.map(async ([field, file]) => {
        const setter = getSetterByField(field)
        if (setter) {
          await uploadSingleFileInternal(file, field, setter)
        }
      })
      await Promise.all(uploads)
      setPendingUploads({})
    }

    uploadPendingFiles()
  }, [pendingUploads, formData.numero_documento, userId])

  useEffect(() => {
    if (!hasUploadedVideo || !errors.video_presentacion) return

    setErrors(prev => {
      if (!prev.video_presentacion) return prev
      const nextErrors = { ...prev }
      delete nextErrors.video_presentacion
      return nextErrors
    })
  }, [hasUploadedVideo, errors.video_presentacion])

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
      {!embedded && (
        <>
          {/* Header de la Landing Page */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row justify-between items-center py-4 space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center lg:justify-start min-h-[3rem] header-logos">
                  <img src="/emprendipaz.png" alt="EmprendiPaz" className="h-10 sm:h-12 object-contain" />
                  <img src="/logo-gobernacion.png" alt="Gobernación de Nariño" className="h-10 sm:h-12 object-contain" />
                  <img src="/fundacion.png" alt="Fundación" className="h-10 sm:h-12 object-contain" />
                  <img src="/consorcio.png" alt="Consorcio" className="h-10 sm:h-12 object-contain" />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4 w-full sm:w-auto">
                  <Button
                    onClick={() => navigate('/')}
                    className="bg-gray-600 hover:bg-gray-700 text-white w-full sm:w-auto text-sm"
                  >
                    Volver al Inicio
                  </Button>
                </div>
              </div>
            </div>
          </header>
        </>
      )}

      <div className={embedded ? '' : 'py-8'}>
        <div className={embedded ? '' : 'max-w-4xl mx-auto px-4'}>
          {/* Header del formulario */}
          <div className="bg-white rounded-lg shadow-md mb-6 p-6">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Formulario de Registro - EmprendiPaz
            </h1>
            <p className="text-center text-gray-600">
              Complete todos los pasos para enviar su inscripcion
            </p>
          </div>

          {/* Mensaje de Advertencia Legal */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-green-800 mb-3">
                  IMPORTANTE - PROCESO DE VERIFICACIÓN
                </h3>
                <div className="text-sm text-green-900 space-y-2">
                  <p>
                    <strong>Su inscripción será sometida a reserva y verificación exhaustiva.</strong>
                    Se validará toda la información y documentación proporcionada.
                  </p>
                  <p>
                    <strong>Si se encuentra cualquier inconsistencia o falsedad</strong> en los datos
                    o documentos presentados, <strong>quedará automáticamente excluido del programa
                      sin derecho a apelación.</strong>
                  </p>
                  <p className="font-medium">
                    Las declaraciones legales correspondientes se encuentran en el paso final del formulario.
                  </p>
                </div>
              </div>
            </div>
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

            <div className="-mx-1 overflow-x-auto pb-2">
              <div className="grid min-w-[44rem] grid-cols-11 gap-1 px-1">
              {steps.map((step) => {
                // Deshabilitar pasos 2-11 si no se ha completado el Paso 1
                const isStepDisabled = step.number > 1 && !isStep1Complete

                return (
                  <div
                    key={step.number}
                    className={`text-center p-2 rounded transition-all duration-200 relative group ${step.number === currentStep
                        ? 'bg-green-600 text-white shadow-lg'
                        : step.number < currentStep
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                          : isStepDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-300 cursor-pointer'
                      }`}
                    onClick={() => !isStepDisabled && setCurrentStep(step.number)}
                    title={isStepDisabled ? 'Complete el Paso 1 primero para navegar libremente' : step.title}
                  >
                    <div className="text-lg font-bold">{step.number}</div>

                    {/* Tooltip que aparece al hacer hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {step.title}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* Contenido del paso actual */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {renderStepContent()}
          </div>

          {/* Botones de navegaci?n */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md font-medium ${currentStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={isLoading || isSaving}
              className="px-8 py-3 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : currentStep === steps.length ? (
                'Finalizar Inscripción'
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Mensajes de ?xito y error generales */}
          {successMessage && (
            <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg z-50 flex items-center space-x-2">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-green-700 hover:text-green-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {errors.general && (
            <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg z-50 flex items-center space-x-2">
              <span>{errors.general}</span>
              <button
                onClick={() => setErrors(prev => ({ ...prev, general: '' }))}
                className="text-red-700 hover:text-red-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Modal de confirmaci?n antes de finalizar */}
          {showFinalizeConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      ¿Estás seguro de finalizar el proceso de inscripción?
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Recuerde que <strong>si finaliza la inscripción, ya no podrá subir documentos ni modificar la información ingresada.</strong>
                    </p>
                    <p className="text-xs text-gray-600">
                      Si aún necesita revisar o subir algún documento, seleccione "No, guardar avance".
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 mt-6">
                  <button
                    type="button"
                    onClick={submitCompleteForm}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Enviando...' : 'Sí, finalizar inscripción'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProgress}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Guardando...' : 'No, guardar avance'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFinalizeConfirmation(false)}
                    disabled={isLoading || isSaving}
                    className="w-full px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-md font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de error de validaci?n */}
          {showValidationError && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Documentos Obligatorios Faltantes
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      {validationErrorMessage}
                    </p>
                    <p className="text-xs text-gray-600">
                      Por favor, complete todos los documentos requeridos antes de finalizar la inscripción.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowValidationError(false)}
                    className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPageMultiStep
