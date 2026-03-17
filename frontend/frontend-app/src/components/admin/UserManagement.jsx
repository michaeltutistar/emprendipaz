import React, { useState, useEffect } from 'react'
import SearchInput from '../common/SearchInput'
import * as XLSX from 'xlsx'
import emailjs from '@emailjs/browser'
import { MUNICIPIOS_POR_SUBREGION } from '@/constants/municipios'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import API_BASE_URL from '@/config/api'
const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    estado: '',
    rol: '',
    search: '',
    solo_finalizados: '',
    municipio: '',
    fecha_inicio: '',
    fecha_fin: ''
  })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedUserForMessage, setSelectedUserForMessage] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageStatus, setMessageStatus] = useState(null) // 'success', 'error', null
  const [successMessage, setSuccessMessage] = useState('')
  const [editableEmail, setEditableEmail] = useState('')

  // Edición manual de nombre/apellido (corrección de datos)
  const [showEditNameModal, setShowEditNameModal] = useState(false)
  const [selectedUserForEditName, setSelectedUserForEditName] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editApellido, setEditApellido] = useState('')
  const [isSavingEditName, setIsSavingEditName] = useState(false)
  
  // Estados para descarga de archivos
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedUserForDownload, setSelectedUserForDownload] = useState(null)
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0, status: '' })
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [filters])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        setError('Error al cargar usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
    setSelectedUsers([]) // Clear selection when filtering
  }

  const handleSearchChange = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }))
    setSelectedUsers([]) // Clear selection when filtering
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleUserUpdate = async (userId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        fetchUsers() // Refresh the list
      } else {
        setError('Error al actualizar usuario')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkAction || selectedUsers.length === 0) return

    try {
      const updates = {}
      if (bulkAction === 'marcar_activa') updates.estado_cuenta = 'activa'
      if (bulkAction === 'marcar_inactiva') updates.estado_cuenta = 'inactiva'
      if (bulkAction === 'marcar_inscrito') updates.estado_cuenta = 'inscrito'
      if (bulkAction === 'marcar_pendiente') updates.estado_cuenta = 'pendiente'
      if (bulkAction === 'marcar_seleccionado') updates.estado_cuenta = 'seleccionado'
      if (bulkAction === 'marcar_rechazado') updates.estado_cuenta = 'rechazado'
      if (bulkAction === 'make_admin') updates.rol = 'admin'
      if (bulkAction === 'make_instructor') updates.rol = 'instructor'
      if (bulkAction === 'make_student') updates.rol = 'estudiante'
      if (bulkAction === 'make_evaluador') updates.rol = 'evaluador'

      const response = await fetch(`${API_BASE_URL}/admin/users/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_ids: selectedUsers,
          updates
        })
      })
      
      if (response.ok) {
        setSelectedUsers([])
        setBulkAction('')
        setShowBulkModal(false)
        fetchUsers()
      } else {
        setError('Error en actualización masiva')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleDownloadExcel = async () => {
    try {
      setError(null)
      
      // mostrar indicador de carga
      const btnExcel = document.getElementById('btn-download-excel')
      if (btnExcel) {
        btnExcel.disabled = true
        btnExcel.textContent = '⏳ Generando Excel...'
      }
      
      // Crear datos para Excel con TODOS los campos del Paso 1 del formulario
      const excelData = users.map(user => ({
        'Usuario': `${user.nombre} ${user.apellido}`,
        'Email': user.email,
        'Tipo Documento': user.tipo_documento || '-',
        'Número Documento': user.numero_documento || '-',
        'Fecha Nacimiento': user.fecha_nacimiento ? formatColombianDateTime(user.fecha_nacimiento).fecha : '-',
        'Sexo': user.sexo || '-',
        'Estado Civil': user.estado_civil || '-',
        'Teléfono': user.telefono || '-',
        'Dirección': user.direccion || '-',
        'Municipio': user.municipio || '-',
        'Corregimiento/Vereda': user.corregimiento_vereda || '-',
        'Nombre Emprendimiento': user.emprendimiento_nombre || '-',
        'Sector Económico': user.emprendimiento_sector || '-',
        'Tipo Persona': user.tipo_persona || '-',
        'Convocatoria': user.convocatoria ? `Conv. ${user.convocatoria}` : '-',
        'Rol': user.rol,
        'Estado': user.estado_cuenta,
        'Documentos Subidos': user.documentos_subidos || 0,
        'Fecha Registro': formatColombianDateTime(user.fecha_creacion).fecha + ' ' + formatColombianDateTime(user.fecha_creacion).hora,
        'Fecha Finalización': user.fecha_finalizacion ? 
          formatColombianDateTime(user.fecha_finalizacion).fecha + ' ' + formatColombianDateTime(user.fecha_finalizacion).hora : '-'
      }))
      
      // Crear el archivo Excel usando la librería XLSX
      
      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)
      
      // Ajustar ancho de columnas para todos los campos del Paso 1
      const colWidths = [
        { wch: 25 }, // Usuario
        { wch: 30 }, // Email
        { wch: 15 }, // Tipo Documento
        { wch: 18 }, // Número Documento
        { wch: 15 }, // Fecha Nacimiento
        { wch: 10 }, // Sexo
        { wch: 15 }, // Estado Civil
        { wch: 15 }, // Teléfono
        { wch: 30 }, // Dirección
        { wch: 25 }, // Municipio
        { wch: 20 }, // Corregimiento/Vereda
        { wch: 30 }, // Nombre Emprendimiento
        { wch: 20 }, // Sector Económico
        { wch: 15 }, // Tipo Persona
        { wch: 15 }, // Convocatoria
        { wch: 12 }, // Rol
        { wch: 12 }, // Estado
        { wch: 18 }, // Documentos Subidos
        { wch: 20 }, // Fecha Registro
        { wch: 20 }  // Fecha Finalización
      ]
      ws['!cols'] = colWidths
      
      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
      
      // Generar archivo y descargar
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
      const fileName = `usuarios_emprendimiento_${dateStr}.xlsx`
      
      XLSX.writeFile(wb, fileName)
      
      // mostrar mensaje de éxito
      setSuccessMessage('✅ Excel descargado exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (error) {
      console.error('Error al descargar Excel:', error)
      setError('Error al generar el archivo Excel. Intente de nuevo.')
    } finally {
      // Restaurar botón
      const btnExcel = document.getElementById('btn-download-excel')
      if (btnExcel) {
        btnExcel.disabled = false
        btnExcel.textContent = '📥 Descargar Excel'
      }
    }
  }

  const handleDownloadAllUsersExcel = async () => {
    try {
      setError(null)
      
      // mostrar indicador de carga
      const btnExcelAll = document.getElementById('btn-download-excel-all')
      if (btnExcelAll) {
        btnExcelAll.disabled = true
        btnExcelAll.textContent = '⏳ Obteniendo usuarios...'
      }
      
      // Obtener TODOS los usuarios usando paginación
      const allUsers = []
      let page = 1
      let hasMore = true
      const perPage = 2000  // 2000 usuarios por request
      
      while (hasMore) {
        // Actualizar mensaje de progreso
        if (btnExcelAll) {
          btnExcelAll.textContent = `⏳ Descargando página ${page}...`
        }
        
        const response = await fetch(`${API_BASE_URL}/admin/users/all?page=${page}&per_page=${perPage}`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Error al obtener usuarios')
        }
        
        const data = await response.json()
        const users = data.users || []
        const pagination = data.pagination || {}
        
        // Agregar usuarios de esta página al array total
        allUsers.push(...users)
        
        // Verificar si hay más páginas
        hasMore = pagination.has_next || false
        page++
        
        // Prevenir bucles infinitos
        if (page > 50) {  // Máximo 50 páginas = 100,000 usuarios
          console.warn('Límite de páginas alcanzado')
          break
        }
      }
      
      // Actualizar mensaje
      if (btnExcelAll) {
        btnExcelAll.textContent = '⏳ Generando Excel...'
      }
      
      // Crear datos para Excel con TODOS los campos disponibles en el orden especificado
      const excelData = allUsers.map(user => ({
        'ID': user.id || '-',
        'Nombre': user.nombre || '-',
        'Apellido': user.apellido || '-',
        'Email': user.email || '-',
        'Teléfono': user.telefono || '-',
        'Municipio': user.municipio || '-',
        'Tipo Documento': user.tipo_documento || '-',
        'Número Documento': user.numero_documento || '-',
        'Fecha Nacimiento': user.fecha_nacimiento ? formatColombianDateTime(user.fecha_nacimiento).fecha : '-',
        'Edad': calcularEdad(user.fecha_nacimiento),
        'Género': user.sexo || '-',
        'Tipo Persona': user.tipo_persona || '-',
        'Emprendimiento': user.emprendimiento_nombre || '-',
        'Sector': user.emprendimiento_sector || '-',
        'Tiempo Funcionamiento': user.tiempo_funcionamiento || '-',
        'Empleos Generados': user.empleos_generados || '-',
        'Acceso a Mercados': user.acceso_mercados || '-',
        'Estado Cuenta': user.estado_cuenta || '-',
        'Fecha Creación': user.fecha_creacion ? formatColombianDateTime(user.fecha_creacion).fecha + ' ' + formatColombianDateTime(user.fecha_creacion).hora : '-',
        'TDR': user.doc_terminos_pdf_nombre ? 'Sí' : 'No',
        'Uso Imagen': user.doc_uso_imagen_pdf_nombre ? 'Sí' : 'No',
        'Plan Negocio': user.doc_plan_negocio_nombre ? 'Sí' : 'No',
        'Vecindad': user.doc_vecindad_pdf_nombre ? 'Sí' : 'No',
        'Video': user.video_url ? 'Sí' : 'No',
        'RUT': user.rut_pdf_nombre ? 'Sí' : 'No',
        'Cédula': user.cedula_pdf_nombre ? 'Sí' : 'No',
        'Cédula Representante': user.cedula_representante_pdf_nombre ? 'Sí' : 'No',
        'Cert. Existencia': user.cert_existencia_pdf_nombre ? 'Sí' : 'No',
        'RUV': user.ruv_pdf_nombre ? 'Sí' : 'No',
        'SISBEN': user.sisben_pdf_nombre ? 'Sí' : 'No',
        'Grupo Étnico': user.grupo_etnico_pdf_nombre ? 'Sí' : 'No',
        'ARN': user.arn_pdf_nombre ? 'Sí' : 'No',
        'Discapacidad': user.discapacidad_pdf_nombre ? 'Sí' : 'No',
        'Fiscales': user.antecedentes_fiscales_pdf_nombre ? 'Sí' : 'No',
        'Disciplinarios': user.antecedentes_disciplinarios_pdf_nombre ? 'Sí' : 'No',
        'Judiciales': user.antecedentes_judiciales_pdf_nombre ? 'Sí' : 'No',
        'REDAM': user.redam_pdf_nombre ? 'Sí' : 'No',
        'Inhab. Sexuales': user.inhabilidades_sexuales_pdf_nombre ? 'Sí' : 'No',
        'Capacidad Legal': user.declaracion_capacidad_legal_pdf_nombre ? 'Sí' : 'No',
        'Estado Control': user.estado_control || '-',
        'Resultado Certificados': user.resultado_certificados || '-',
        'Formalizado': user.emprendimiento_formalizado ? 'Sí' : 'No',
        'Matrícula Mercantil': user.matricula_mercantil_pdf_nombre ? 'Sí' : 'No',
        'Facturas 6M': user.facturas_6meses_pdf_nombre ? 'Sí' : 'No',
        'Publicaciones Redes': user.publicaciones_redes_pdf_nombre ? 'Sí' : 'No',
        'Registro Ventas': user.registro_ventas_pdf_nombre ? 'Sí' : 'No',
        'Financiado Estado': user.financiado_estado ? 'Sí' : 'No',
        'Regalías': user.financiado_regalias ? 'Sí' : 'No',
        'Cámara Comercio': user.financiado_camara_comercio ? 'Sí' : 'No',
        'Incubadoras': user.financiado_incubadoras ? 'Sí' : 'No',
        'Otro Financ.': user.financiado_otro ? 'Sí' : 'No',
        'Declara Veraz': user.declara_veraz ? 'Sí' : 'No',
        'Declara No Beneficiario': user.declara_no_beneficiario ? 'Sí' : 'No',
        'Acepta Términos': user.acepta_terminos ? 'Sí' : 'No',
        'Paso Actual': user.paso_actual || '-',
        'Formulario Enviado': user.formulario_enviado ? 'Sí' : 'No',
        'Estado Inscripción': user.estado_inscripcion || '-',
        'Fase Actual': user.fase_actual || '-'
      }))
      
      // Crear el archivo Excel usando la librería XLSX
      
      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)
      
      // Ajustar ancho de columnas para todos los campos disponibles
      const colWidths = [
        { wch: 8 },  // ID
        { wch: 15 }, // Nombre
        { wch: 15 }, // Apellido
        { wch: 30 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 20 }, // Municipio
        { wch: 15 }, // Tipo Documento
        { wch: 18 }, // Número Documento
        { wch: 18 }, // Fecha Nacimiento
        { wch: 8 },  // Edad
        { wch: 12 }, // Género
        { wch: 15 }, // Tipo Persona
        { wch: 25 }, // Emprendimiento
        { wch: 20 }, // Sector
        { wch: 20 }, // Tiempo Funcionamiento
        { wch: 18 }, // Empleos Generados
        { wch: 18 }, // Acceso a Mercados
        { wch: 15 }, // Estado Cuenta
        { wch: 20 }, // Fecha Creación
        { wch: 8 },  // TDR
        { wch: 12 }, // Uso Imagen
        { wch: 12 }, // Plan Negocio
        { wch: 10 }, // Vecindad
        { wch: 8 },  // Video
        { wch: 8 },  // RUT
        { wch: 10 }, // Cédula
        { wch: 18 }, // Cédula Representante
        { wch: 15 }, // Cert. Existencia
        { wch: 8 },  // RUV
        { wch: 10 }, // SISBEN
        { wch: 12 }, // Grupo Étnico
        { wch: 8 },  // ARN
        { wch: 12 }, // Discapacidad
        { wch: 10 }, // Fiscales
        { wch: 12 }, // Disciplinarios
        { wch: 12 }, // Judiciales
        { wch: 8 },  // REDAM
        { wch: 15 }, // Inhab. Sexuales
        { wch: 15 }, // Capacidad Legal
        { wch: 15 }, // Estado Control
        { wch: 18 }, // Resultado Certificados
        { wch: 12 }, // Formalizado
        { wch: 18 }, // Matrícula Mercantil
        { wch: 12 }, // Facturas 6M
        { wch: 18 }, // Publicaciones Redes
        { wch: 15 }, // Registro Ventas
        { wch: 15 }, // Financiado Estado
        { wch: 10 }, // Regalías
        { wch: 15 }, // Cámara Comercio
        { wch: 12 }, // Incubadoras
        { wch: 12 }, // Otro Financ.
        { wch: 12 }, // Declara Veraz
        { wch: 20 }, // Declara No Beneficiario
        { wch: 15 }, // Acepta Términos
        { wch: 12 }, // Paso Actual
        { wch: 18 }, // Formulario Enviado
        { wch: 18 }, // Estado Inscripción
        { wch: 12 }  // Fase Actual
      ]
      ws['!cols'] = colWidths
      
      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
      
      // Generar archivo y descargar
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
      const fileName = `usuarios_emprendimiento_todos_${dateStr}.xlsx`
      
      XLSX.writeFile(wb, fileName)
      
      // mostrar mensaje de éxito
      setSuccessMessage(`✅ Excel con todos los usuarios descargado exitosamente (${allUsers.length} usuarios)`)
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (error) {
      console.error('Error al descargar Excel de todos los usuarios:', error)
      setError('Error al generar el archivo Excel. Intente de nuevo.')
    } finally {
      // Restaurar botón
      const btnExcelAll = document.getElementById('btn-download-excel-all')
      if (btnExcelAll) {
        btnExcelAll.disabled = false
        btnExcelAll.textContent = '📥 Descargar Excel (Todos)'
      }
    }
  }

  const handleViewUserDetails = async (userId) => {
    try {
      setLoadingUserDetails(true)
      setShowUserDetailsModal(true)
      
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/detailed-info`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedUserDetails(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al obtener detalles del usuario')
        setShowUserDetailsModal(false)
      }
    } catch (error) {
      setError('Error de conexión')
      setShowUserDetailsModal(false)
    } finally {
      setLoadingUserDetails(false)
    }
  }

  const handleOpenMessageModal = (user) => {
    setSelectedUserForMessage(user)
    setEditableEmail(user.email) // Inicializar con el email del usuario
    setMessageText('')
    setMessageStatus(null)
    setShowMessageModal(true)
  }

  const handleCloseMessageModal = () => {
    setShowMessageModal(false)
    setSelectedUserForMessage(null)
    setEditableEmail('')
    setMessageText('')
    setIsSendingMessage(false)
    setMessageStatus(null)
  }

  // Edición manual de nombre/apellido
  const handleOpenEditNameModal = (user) => {
    setError(null)
    setSuccessMessage('')
    setSelectedUserForEditName(user)
    setEditNombre((user?.nombre || '').toString())
    setEditApellido((user?.apellido || '').toString())
    setShowEditNameModal(true)
  }

  const handleCloseEditNameModal = () => {
    if (isSavingEditName) return
    setShowEditNameModal(false)
    setSelectedUserForEditName(null)
    setEditNombre('')
    setEditApellido('')
    setIsSavingEditName(false)
  }

  const handleSaveEditName = async () => {
    if (!selectedUserForEditName) return

    const nombre = (editNombre || '').trim()
    const apellido = (editApellido || '').trim()
    if (!nombre || !apellido) {
      setError('Nombre y apellido son obligatorios')
      return
    }

    try {
      setIsSavingEditName(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUserForEditName.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ nombre, apellido })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data?.error || 'Error al actualizar usuario')
        return
      }

      setSuccessMessage('✅ Nombre/apellido actualizado(s) exitosamente')
      setTimeout(() => setSuccessMessage(''), 3000)
      handleCloseEditNameModal()
      fetchUsers()
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setIsSavingEditName(false)
    }
  }

  // Funciones para descarga de archivos
  const handleOpenDownloadModal = (user) => {
    setSelectedUserForDownload(user)
    setDownloadProgress({ current: 0, total: 0, status: '' })
    setShowDownloadModal(true)
  }

  const handleCloseDownloadModal = () => {
    if (!isDownloading) {
      setShowDownloadModal(false)
      setSelectedUserForDownload(null)
      setDownloadProgress({ current: 0, total: 0, status: '' })
    }
  }

  const handleDownloadUserFiles = async () => {
    if (!selectedUserForDownload) return

    try {
      setIsDownloading(true)
      setDownloadProgress({ current: 0, total: 0, status: 'Obteniendo lista de archivos...' })

      // 1. Obtener URLs de archivos del usuario
      const response = await fetch(`${API_BASE_URL}/admin/user/${selectedUserForDownload.id}/files`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al obtener archivos del usuario')
      }

      const data = await response.json()
      const files = data.files || []

      if (files.length === 0) {
        setDownloadProgress({ current: 0, total: 0, status: 'No se encontraron archivos para este usuario' })
        setTimeout(() => {
          setIsDownloading(false)
          setShowDownloadModal(false)
        }, 2000)
        return
      }

      setDownloadProgress({ current: 0, total: files.length, status: `Descargando 0 de ${files.length} archivos...` })

      // 2. Crear ZIP
      const zip = new JSZip()
      let successCount = 0
      let errorCount = 0

      // 3. Descargar cada archivo y agregarlo al ZIP
      for (let i = 0;
 i < files.length; i++) {
        const file = files[i]
        setDownloadProgress({
          current: i + 1,
          total: files.length,
          status: `Descargando: ${file.display_name} (${i + 1}/${files.length})`
        })

        try {
          // Descargar archivo desde S3 usando la URL pre-firmada
          const fileResponse = await fetch(file.url)
          
          if (fileResponse.ok) {
            const blob = await fileResponse.blob()
            
            // Agregar archivo al ZIP con nombre descriptivo
            const safeFilename = `${file.display_name}_${file.filename}`.replace(/[^a-z0-9._-]/gi, '_')
            zip.file(safeFilename, blob)
            successCount++
          } else {
            console.error(`Error descargando ${file.filename}:`, fileResponse.statusText)
            errorCount++
          }
        } catch (error) {
          console.error(`Error descargando ${file.filename}:`, error)
          errorCount++
        }
      }

      // 4. Generar y descargar el ZIP
      setDownloadProgress({
        current: files.length,
        total: files.length,
        status: 'Generando archivo ZIP...'
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Nombre del archivo ZIP
      const userName = `${selectedUserForDownload.nombre}_${selectedUserForDownload.apellido}`.replace(/\s+/g, '_')
      const zipFilename = `archivos_${userName}_${selectedUserForDownload.numero_documento}.zip`
      
      // Descargar el ZIP
      saveAs(zipBlob, zipFilename)

      // mostrar resumen
      setDownloadProgress({
        current: files.length,
        total: files.length,
        status: `✅ Descarga completada! ${successCount} archivos descargados${errorCount > 0 ? `, ${errorCount} errores` : ''}`
      })

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        setIsDownloading(false)
        setShowDownloadModal(false)
        setSuccessMessage(`✅ Archivos de ${selectedUserForDownload.nombre} ${selectedUserForDownload.apellido} descargados exitosamente`)
        setTimeout(() => setSuccessMessage(''), 3000)
      }, 3000)

    } catch (error) {
      console.error('Error descargando archivos:', error)
      setDownloadProgress({
        current: 0,
        total: 0,
        status: `❌ Error: ${error.message}`
      })
      setTimeout(() => {
        setIsDownloading(false)
      }, 3000)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUserForMessage) return

    try {
      setIsSendingMessage(true)
      setMessageStatus(null)

      // Inicializar EmailJS con la misma configuración del proyecto
      emailjs.init('L-mZkum1V3UydsMN0')

      // Preparar parámetros para el template "Auto-Reply"
      const templateParams = {
        to_email: editableEmail, // Usar el email editable
        to_name: `${selectedUserForMessage.nombre} ${selectedUserForMessage.apellido}`,
        message: messageText,
        from_name: 'Administración - Emprendimiento Nariño',
        reply_to: 'consorcioprimeronarino@gmail.com',
        // Campos adicionales que puede esperar el template
        user_email: editableEmail, // Usar el email editable
        user_name: `${selectedUserForMessage.nombre} ${selectedUserForMessage.apellido}`,
        admin_message: messageText
      }

      // Debug: Verificar que el email no esté vacío
      console.log('Parámetros del template:', templateParams)
      console.log('Email editable:', editableEmail)
      
      if (!editableEmail || editableEmail.trim() === '') {
        throw new Error('El email de destino está vacío')
      }

      // Enviar email usando EmailJS con el template "Auto-Reply"
      const response = await emailjs.send(
        'service_8383n0g',
        'template_5clzaei', // Template "Auto-Reply"
        templateParams
      )

      console.log('Email enviado exitosamente:', response)
      setMessageStatus('success')
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        handleCloseMessageModal()
      }, 2000)

    } catch (error) {
      console.error('Error al enviar el mensaje:', error)
      setMessageStatus('error')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      inscrito: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      seleccionado: 'bg-blue-100 text-blue-800',
      rechazado: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      instructor: 'bg-blue-100 text-blue-800',
      estudiante: 'bg-green-100 text-green-800',
      evaluador: 'bg-orange-100 text-orange-800'
    }
    return badges[role] || 'bg-gray-100 text-gray-800'
  }

  const formatColombianDateTime = (isoString) => {
    if (!isoString) return '-'
    
    // Crear fecha desde UTC y convertir a Colombia (UTC-5)
    const utcDate = new Date(isoString)
    const colombiaOffset = -5 * 60 // UTC-5 en minutos
    const colombiaDate = new Date(utcDate.getTime() + (colombiaOffset * 60 * 1000))
    
    const fecha = colombiaDate.toLocaleDateString('es-CO')
    const hora = colombiaDate.toLocaleTimeString('es-CO', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    return { fecha, hora }
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '-'
    
    try {
      const fechaNac = new Date(fechaNacimiento)
      const hoy = new Date()
      
      // Validar que la fecha sea válida
      if (isNaN(fechaNac.getTime())) return '-'
      
      let edad = hoy.getFullYear() - fechaNac.getFullYear()
      const mes = hoy.getMonth() - fechaNac.getMonth()
      
      // Si aún no ha cumplido años este año, restar 1
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--
      }
      
      // Validar que la edad sea razonable (entre 0 y 150 años)
      if (edad < 0 || edad > 150) return '-'
      
      return edad
    } catch (error) {
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              👥 Gestión de Usuarios
            </h2>
            <p className="text-gray-600">
              Administración completa de usuarios del sistema
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              id="btn-download-excel"
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 Descargar Excel
            </button>
            <button
              id="btn-download-excel-all"
              onClick={handleDownloadAllUsersExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 Descargar Excel (Todos)
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SearchInput
            placeholder="Nombre, email, documento..."
            onSearch={handleSearchChange}
            defaultValue={filters.search}
            label="Buscar"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="inscrito">Inscrito</option>
              <option value="pendiente">Pendiente</option>
              <option value="seleccionado">Seleccionado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          {currentUser?.rol !== 'evaluador' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={filters.rol}
                onChange={(e) => handleFilterChange('rol', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="estudiante">Estudiante</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
                <option value="evaluador">Evaluador</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Por página
            </label>
            <select
              value={filters.per_page}
              onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Finalización
            </label>
            <select
              value={filters.solo_finalizados}
              onChange={(e) => handleFilterChange('solo_finalizados', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="finalizados">Solo finalizados</option>
              <option value="no_finalizados">Solo no finalizados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipio
            </label>
            <select
              value={filters.municipio}
              onChange={(e) => handleFilterChange('municipio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {Object.entries(MUNICIPIOS_POR_SUBREGION).map(([subregion, municipios]) => [
                <optgroup key={`${subregion}-header`} label={subregion}>
                  {municipios.map(municipio => (
                    <option key={municipio.nombre} value={municipio.nombre}>{municipio.nombre}</option>
                  ))}
                </optgroup>
              ]).flat()}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="datetime-local"
              value={filters.fecha_inicio}
              onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="datetime-local"
              value={filters.fecha_fin}
              onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        {/* Botón para limpiar filtros */}
        {(filters.fecha_inicio || filters.fecha_fin || filters.solo_finalizados || filters.municipio) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                handleFilterChange('fecha_inicio', '')
                handleFilterChange('fecha_fin', '')
                handleFilterChange('solo_finalizados', '')
                handleFilterChange('municipio', '')
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Acciones Masivas */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-800">
              {selectedUsers.length} usuario(s) seleccionado(s)
            </p>
            <div className="flex space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleccionar acción...</option>
                <option value="marcar_activa">Marcar como Activa</option>
                <option value="marcar_inactiva">Marcar como Inactiva</option>
                <option value="marcar_inscrito">Marcar como Inscrito</option>
                <option value="marcar_pendiente">Marcar como Pendiente</option>
                <option value="marcar_seleccionado">Marcar como Seleccionado</option>
                <option value="marcar_rechazado">Marcar como Rechazado</option>
                {currentUser?.rol !== 'evaluador' && (
                  <>
                    <option value="make_admin">Hacer Admin</option>
                    <option value="make_instructor">Hacer Instructor</option>
                    <option value="make_student">Hacer Estudiante</option>
                    <option value="make_evaluador">Hacer Evaluador</option>
                  </>
                )}
              </select>
              <button
                onClick={() => setShowBulkModal(true)}
                disabled={!bulkAction}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Aplicar
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sexo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Municipio de Residencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Convocatoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos Subidos
                </th>
                {currentUser?.rol !== 'evaluador' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Finalización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewUserDetails(user.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                        title="Ver información completa"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => handleOpenMessageModal(user)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                        title="Enviar mensaje al usuario"
                      >
                        Enviar Mensaje
                      </button>
                      <button
                        onClick={() => handleOpenDownloadModal(user)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium"
                        title="Descargar archivos del usuario"
                      >
                        📥 Descargar Archivos
                      </button>
                      <button
                        onClick={() => handleOpenEditNameModal(user)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium"
                        title="Editar nombre y apellido"
                      >
                        ✏️ Editar Nombre
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.tipo_documento} - {user.numero_documento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.sexo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.municipio || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.convocatoria ? `Conv. ${user.convocatoria}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📄 {user.documentos_subidos || 0}
                      </span>
                    </div>
                  </td>
                  {currentUser?.rol !== 'evaluador' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.rol}
                        onChange={(e) => handleUserUpdate(user.id, { rol: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="estudiante">Estudiante</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                        <option value="evaluador">Evaluador</option>
                      </select>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.estado_cuenta)}`}>
                      {user.estado_cuenta}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{formatColombianDateTime(user.fecha_creacion).fecha}</div>
                      <div className="text-xs text-gray-400">
                        {formatColombianDateTime(user.fecha_creacion).hora}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.fecha_finalizacion ? (
                      <div>
                        <div>{formatColombianDateTime(user.fecha_finalizacion).fecha}</div>
                        <div className="text-xs text-gray-400">
                          {formatColombianDateTime(user.fecha_finalizacion).hora}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <select
                        value={user.estado_cuenta}
                        onChange={(e) => handleUserUpdate(user.id, { estado_cuenta: e.target.value })}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                        <option value="inscrito">Inscrito</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="seleccionado">Seleccionado</option>
                        <option value="rechazado">Rechazado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.per_page) + 1} a{' '}
              {Math.min(pagination.page * pagination.per_page, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Página {pagination.page} de {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Masiva */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Acción Masiva
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que quieres aplicar esta acción a {selectedUsers.length} usuario(s)?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleBulkUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Modal de Edición de Nombre/Apellido */}
      {showEditNameModal && selectedUserForEditName && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Editar Nombre / Apellido
              </h3>
              <button
                onClick={handleCloseEditNameModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSavingEditName}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">ID:</span> {selectedUserForEditName.id}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Email:</span> {selectedUserForEditName.email}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    disabled={isSavingEditName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ej: María Luna Paula"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={editApellido}
                    onChange={(e) => setEditApellido(e.target.value)}
                    disabled={isSavingEditName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Ej: González Quiñones"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={handleCloseEditNameModal}
                  disabled={isSavingEditName}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditName}
                  disabled={isSavingEditName || !editNombre.trim() || !editApellido.trim()}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingEditName ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Usuario */}
      {showUserDetailsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Información Completa del Usuario
              </h3>
              <button
                onClick={() => {
                  setShowUserDetailsModal(false)
                  setSelectedUserDetails(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingUserDetails ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando información del usuario...</p>
              </div>
            ) : selectedUserDetails ? (
              <div className="max-h-96 overflow-y-auto">
                {/* Información Personal */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    📋 Información Personal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div><strong>Nombre:</strong> {selectedUserDetails.user.nombre} {selectedUserDetails.user.apellido}</div>
                    <div><strong>Email:</strong> {selectedUserDetails.user.email}</div>
                    <div><strong>Documento:</strong> {selectedUserDetails.user.tipo_documento} - {selectedUserDetails.user.numero_documento}</div>
                    <div><strong>Fecha Nacimiento:</strong> {selectedUserDetails.user.fecha_nacimiento}</div>
                    <div><strong>Sexo:</strong> {selectedUserDetails.user.sexo}</div>
                    <div><strong>Estado Civil:</strong> {selectedUserDetails.user.estado_civil}</div>
                    <div><strong>Teléfono:</strong> {selectedUserDetails.user.telefono}</div>
                    <div><strong>Dirección:</strong> {selectedUserDetails.user.direccion}</div>
                    <div><strong>Municipio:</strong> {selectedUserDetails.user.municipio}</div>
                    <div><strong>Corregimiento/Vereda:</strong> {selectedUserDetails.user.corregimiento_vereda || 'No especificado'}</div>
                  </div>
                </div>

                {/* Información del Emprendimiento */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    🚀 Información del Emprendimiento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Nombre:</strong> {selectedUserDetails.user.emprendimiento_nombre}</div>
                    <div><strong>Sector:</strong> {selectedUserDetails.user.emprendimiento_sector}</div>
                    <div><strong>Tipo Persona:</strong> {selectedUserDetails.user.tipo_persona}</div>
                    <div><strong>Convocatoria:</strong> {selectedUserDetails.user.convocatoria}</div>
                    {selectedUserDetails.additional_info.emprendimiento_formalizado !== undefined && (
                      <div><strong>Formalizado:</strong> {selectedUserDetails.additional_info.emprendimiento_formalizado ? 'Sí' : 'No'}</div>
                    )}
                    {selectedUserDetails.additional_info.tiempo_funcionamiento && (
                      <div><strong>Tiempo Funcionamiento:</strong> {selectedUserDetails.additional_info.tiempo_funcionamiento}</div>
                    )}
                    {selectedUserDetails.additional_info.empleos_generados && (
                      <div><strong>Empleos Generados:</strong> {selectedUserDetails.additional_info.empleos_generados}</div>
                    )}
                    {selectedUserDetails.additional_info.acceso_mercados && (
                      <div><strong>Acceso a Mercados:</strong> {selectedUserDetails.additional_info.acceso_mercados}</div>
                    )}
                  </div>
                </div>

                {/* Población Diferencial (Paso 2) */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    👥 Población Diferencial
                  </h4>
                  <div className="space-y-3">
                    {selectedUserDetails.additional_info.mujer_cabeza_familia && (
                      <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        </div>
                        <div>
                          <div className="font-medium text-green-800">Mujer cabeza de familia o cuidadora</div>
                          <div className="text-sm text-green-600">Puntos: 9 puntos | Documento: Certificado de autoridad local, departamental o declaración juramentada</div>
                        </div>
                      </div>
                    )}
                    {selectedUserDetails.additional_info.persona_reincorporacion && (
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        </div>
                        <div>
                          <div className="font-medium text-blue-800">Persona en proceso de reincorporación</div>
                          <div className="text-sm text-blue-600">Puntos: 8 puntos | Documento: Certificado de autoridad competente</div>
                        </div>
                      </div>
                    )}
                    {selectedUserDetails.additional_info.victima_conflicto && (
                      <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        </div>
                        <div>
                          <div className="font-medium text-purple-800">Víctima del conflicto armado</div>
                          <div className="text-sm text-purple-600">Puntos: 7 puntos | Documento: RUV - Registro Único de Víctimas</div>
                        </div>
                      </div>
                    )}
                    {selectedUserDetails.additional_info.persona_discapacidad && (
                      <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        </div>
                        <div>
                          <div className="font-medium text-orange-800">Persona en situación de discapacidad</div>
                          <div className="text-sm text-orange-600">Puntos: 6 puntos | Documento: Certificado médico o carné de discapacidad</div>
                        </div>
                      </div>
                    )}
                    {selectedUserDetails.additional_info.pertenencia_etnica && (
                      <div className="flex items-start space-x-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                        </div>
                        <div>
                          <div className="font-medium text-indigo-800">Pertenencia a comunidad étnica</div>
                          <div className="text-sm text-indigo-600">Puntos: 5 puntos | Documento: Certificado de autoridad étnica</div>
                        </div>
                      </div>
                    )}
                    {selectedUserDetails.additional_info.sisben_grupo && (
                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        </div>
                        <div>
                          <div className="font-medium text-yellow-800">Grupo SISBEN: {selectedUserDetails.additional_info.sisben_grupo}</div>
                          <div className="text-sm text-yellow-600">Puntos: 4 puntos | Documento: Certificado SISBEN</div>
                        </div>
                      </div>
                    )}
                    {!selectedUserDetails.additional_info.mujer_cabeza_familia && 
                     !selectedUserDetails.additional_info.persona_reincorporacion && 
                     !selectedUserDetails.additional_info.victima_conflicto && 
                     !selectedUserDetails.additional_info.persona_discapacidad && 
                     !selectedUserDetails.additional_info.pertenencia_etnica && 
                     !selectedUserDetails.additional_info.sisben_grupo && (
                      <div className="text-gray-500 text-sm italic">No se seleccionó ninguna población diferencial</div>
                    )}
                  </div>
                </div>

                {/* Financiación Estatal (Paso 10) */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    💰 Financiación Estatal
                  </h4>
                  <div className="space-y-3">
                    {/* Verificar si tiene al menos una fuente de financiación marcada */}
                    {(selectedUserDetails.additional_info.financiado_regalias || 
                      selectedUserDetails.additional_info.financiado_camara_comercio || 
                      selectedUserDetails.additional_info.financiado_incubadoras || 
                      selectedUserDetails.additional_info.financiado_otro) ? (
                      <div className="space-y-2">
                        <div className="text-sm mb-2">
                          <strong>Ha recibido financiación estatal:</strong> <span className="text-green-600">Sí</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700">Fuentes de financiación:</div>
                        <div className="space-y-1">
                          {selectedUserDetails.additional_info.financiado_regalias && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">He recibido financiación de regalías</span>
                            </div>
                          )}
                          {selectedUserDetails.additional_info.financiado_camara_comercio && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">He recibido financiación de Cámara de Comercio</span>
                            </div>
                          )}
                          {selectedUserDetails.additional_info.financiado_incubadoras && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">He recibido financiación de incubadoras</span>
                            </div>
                          )}
                          {selectedUserDetails.additional_info.financiado_otro && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">He recibido financiación de otra fuente estatal</span>
                              {selectedUserDetails.additional_info.financiado_otro_texto && (
                                <span className="text-sm text-gray-600">: {selectedUserDetails.additional_info.financiado_otro_texto}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No ha recibido financiación estatal previa
                      </div>
                    )}
                  </div>
                </div>

                {/* Declaraciones y Términos (Paso 11) */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    📋 Declaraciones y Términos
                  </h4>
                  <div className="space-y-3">
                    {selectedUserDetails.additional_info.declara_veraz && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Declaro bajo la gravedad del juramento que la información suministrada es veraz y completa</span>
                      </div>
                    )}
                    {selectedUserDetails.additional_info.declara_no_beneficiario && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Declara que la información sobre financiación estatal es correcta y completa</span>
                      </div>
                    )}
                    {selectedUserDetails.additional_info.acepta_terminos && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Acepto los términos y condiciones de la convocatoria</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    ℹ️ Información Adicional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Estado Inscripción:</strong> {selectedUserDetails.additional_info.estado_inscripcion}</div>
                    <div><strong>Paso Actual:</strong> {selectedUserDetails.additional_info.paso_actual}</div>
                    <div><strong>Formulario Enviado:</strong> {selectedUserDetails.additional_info.formulario_enviado ? 'Sí' : 'No'}</div>
                    {selectedUserDetails.additional_info.mujer_cabeza_familia && (
                      <div><strong>Mujer Cabeza de Familia:</strong> Sí</div>
                    )}
                    {selectedUserDetails.additional_info.victima_conflicto && (
                      <div><strong>Víctima del Conflicto:</strong> Sí</div>
                    )}
                    {selectedUserDetails.additional_info.persona_discapacidad && (
                      <div><strong>Persona con Discapacidad:</strong> Sí</div>
                    )}
                    {selectedUserDetails.additional_info.pertenencia_etnica && (
                      <div><strong>Pertenencia Étnica:</strong> Sí</div>
                    )}
                    {selectedUserDetails.additional_info.sisben_grupo && (
                      <div><strong>Grupo SISBEN:</strong> {selectedUserDetails.additional_info.sisben_grupo}</div>
                    )}
                  </div>
                </div>

                {/* Archivos Subidos por Secciones */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    📁 Documentos Subidos ({selectedUserDetails.total_files})
                  </h4>
                  {selectedUserDetails.files_by_section && Object.keys(selectedUserDetails.files_by_section).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(selectedUserDetails.files_by_section).map(([sectionKey, section]) => (
                        <div key={sectionKey} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                            {section.section_name}
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {section.files.length}
                            </span>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {section.files.map((file, index) => (
                              <div key={index} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                <div className="text-sm font-medium text-gray-900 mb-2">
                                  {file.document_name}
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  <div><strong>Archivo:</strong> {file.filename}</div>
                                  <div><strong>Tamaño:</strong> {(file.size / 1024).toFixed(1)} KB</div>
                                  <div><strong>Subido:</strong> {new Date(file.last_modified).toLocaleDateString()}</div>
                                </div>
                                {file.download_url && (
                                  <a
                                    href={file.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                                  >
                                    Descargar
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No se han subido documentos</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No se pudo cargar la información del usuario</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Envío de Mensaje */}
      {showMessageModal && selectedUserForMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Enviar Mensaje
              </h3>
              <button
                onClick={handleCloseMessageModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del Usuario */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Usuario</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nombre:</label>
                    <input
                      type="text"
                      value={`${selectedUserForMessage.nombre} ${selectedUserForMessage.apellido}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email destino:</label>
                    <input
                      type="email"
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                      placeholder="Ingresa el email de destino"
                      disabled={isSendingMessage}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Puedes corregir el email si está incorrecto
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo de Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={6}
                  disabled={isSendingMessage}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Mensajes de Feedback */}
              {messageStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-800">
                      ✅ Mensaje enviado exitosamente a {editableEmail}
                    </p>
                  </div>
                </div>
              )}

              {messageStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-800">
                      ❌ Error al enviar el mensaje. Inténtalo de nuevo.
                    </p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseMessageModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSendingMessage}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingMessage ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Descarga de Archivos */}
      {showDownloadModal && selectedUserForDownload && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Descargar Archivos
              </h3>
              {!isDownloading && (
                <button
                  onClick={handleCloseDownloadModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Información del usuario */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Usuario:</span> {selectedUserForDownload.nombre} {selectedUserForDownload.apellido}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Cédula:</span> {selectedUserForDownload.numero_documento}
                </p>
              </div>

              {/* Barra de progreso */}
              {downloadProgress.total > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-purple-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    {downloadProgress.current} de {downloadProgress.total} archivos
                  </p>
                </div>
              )}

              {/* Estado de la descarga */}
              {downloadProgress.status && (
                <div className={`p-3 rounded-md ${
                  downloadProgress.status.includes('✅') 
                    ? 'bg-green-50 border border-green-200' 
                    : downloadProgress.status.includes('❌')
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className="text-sm text-gray-700">
                    {downloadProgress.status}
                  </p>
                </div>
              )}

              {/* Botones */}
              {!isDownloading && downloadProgress.current === 0 && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleCloseDownloadModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDownloadUserFiles}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    📥 Iniciar Descarga
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement 