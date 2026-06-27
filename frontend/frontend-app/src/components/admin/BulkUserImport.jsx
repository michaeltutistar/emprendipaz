import React, { useState } from 'react'
import API_BASE_URL from '@/config/api'
const BulkUserImport = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [generatingPasswords, setGeneratingPasswords] = useState(false)
  const [activatingUsers, setActivatingUsers] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.type === 'application/vnd.ms-excel')) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Por favor selecciona un archivo Excel válido')
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/import`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Error al importar usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `nombre,apellido,email,password,tipo_documento,numero_documento,rol,estado_cuenta
Juan,Pérez,juan.perez@example.com,Password123,cedula_ciudadania,1234567890,estudiante,inactiva
María,García,maria.garcia@example.com,Password123,cedula_ciudadania,0987654321,instructor,activa
Carlos,Rodríguez,carlos.rodriguez@example.com,Password123,cedula_ciudadania,1122334455,estudiante,inactiva`
    
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_usuarios.xlsx'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleGeneratePasswords = async () => {
    setGeneratingPasswords(true)
    setError(null)
    setResult(null)
    
    try {
      // Leer el archivo IDs.csv desde /public
      const response = await fetch('/IDs.csv')
      if (!response.ok) {
        throw new Error('No se pudo leer el archivo IDs.csv')
      }
      
      const text = await response.text()
      // Parsear los IDs (uno por línea)
      const allIds = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !isNaN(parseInt(line)))
        .map(line => parseInt(line))
      
      if (allIds.length === 0) {
        throw new Error('No se encontraron IDs válidos en el archivo')
      }
      
      // Dividir en lotes pequeños para evitar timeout (30 IDs por lote)
      const batchSize = 30
      const batches = []
      for (let i = 0;
 i < allIds.length; i += batchSize) {
        batches.push(allIds.slice(i, i + batchSize))
      }
      
      // Acumular resultados
      const csvRows = [['ID', 'Nombre', 'Apellido', 'Email', 'Cédula', 'Contraseña']]
      let totalSuccess = 0
      let totalErrors = 0
      const allErrors = []
      
      // Procesar cada lote secuencialmente
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        
        try {
          const apiResponse = await fetch(`${API_BASE_URL}/admin/users/generate-passwords`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ user_ids: batch })
          })
          
          if (!apiResponse.ok) {
            // Si es un error, intentar obtener el mensaje
            try {
              const errorData = await apiResponse.json()
              throw new Error(errorData.error || `Error en lote ${i + 1}/${batches.length}`)
            } catch {
              throw new Error(`Error HTTP ${apiResponse.status} en lote ${i + 1}/${batches.length}`)
            }
          }
          
          // Leer el CSV del lote
          const csvText = await apiResponse.text()
          const lines = csvText.split('\n').filter(line => line.trim())
          
          // Agregar todas las filas excepto el encabezado (ya lo tenemos)
          for (let j = 1; j < lines.length; j++) {
            const row = lines[j].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
            if (row.length >= 6) {
              csvRows.push(row)
              totalSuccess++
            }
          }
          
          // Actualizar resultado parcial
          setResult({
            message: `Procesando... Lote ${i + 1} de ${batches.length} completado`,
            count: totalSuccess,
            total: allIds.length,
            current: (i + 1) * batchSize
          })
          
        } catch (err) {
          // Si falla un lote, agregar los IDs al error pero continuar
          allErrors.push(`Lote ${i + 1}: ${err.message}`)
          totalErrors += batch.length
        }
      }
      
      // Generar CSV final
      const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      
      // Descargar el CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `passwords_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // mostrar resultado final
      setResult({
        message: `Proceso completado: ${totalSuccess} contraseñas generadas exitosamente${totalErrors > 0 ? `, ${totalErrors} errores` : ''}`,
        count: totalSuccess,
        total: allIds.length,
        errors: allErrors.length > 0 ? allErrors : null
      })
      
    } catch (err) {
      setError(err.message || 'Error al generar contraseñas')
    } finally {
      setGeneratingPasswords(false)
    }
  }

  const handleActivateUsers = async () => {
    setActivatingUsers(true)
    setError(null)
    setResult(null)
    
    try {
      // Leer el archivo IDs.csv desde /public
      const response = await fetch('/IDs.csv')
      if (!response.ok) {
        throw new Error('No se pudo leer el archivo IDs.csv')
      }
      
      const text = await response.text()
      // Parsear los IDs (uno por línea)
      const allIds = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !isNaN(parseInt(line)))
        .map(line => parseInt(line))
      
      if (allIds.length === 0) {
        throw new Error('No se encontraron IDs válidos en el archivo')
      }
      
      // Dividir en lotes para evitar timeout (100 usuarios por lote)
      const batchSize = 100
      const batches = []
      for (let i = 0; i < allIds.length; i += batchSize) {
        batches.push(allIds.slice(i, i + batchSize))
      }
      
      let totalActivated = 0
      let totalErrors = 0
      const allErrors = []
      
      // Procesar cada lote secuencialmente
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        
        try {
          const apiResponse = await fetch(`${API_BASE_URL}/admin/users/activate-from-ids-file`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ user_ids: batch })
          })
          
          if (!apiResponse.ok) {
            try {
              const errorData = await apiResponse.json()
              throw new Error(errorData.error || `Error en lote ${i + 1}/${batches.length}`)
            } catch {
              throw new Error(`Error HTTP ${apiResponse.status} en lote ${i + 1}/${batches.length}`)
            }
          }
          
          const data = await apiResponse.json()
          totalActivated += data.total_updated || batch.length
          
          if (data.errors && data.errors.length > 0) {
            allErrors.push(...data.errors)
            totalErrors += data.total_errors || 0
          }
          
          // Actualizar resultado parcial
          setResult({
            message: `Procesando... Lote ${i + 1} de ${batches.length} completado`,
            count: totalActivated,
            total: allIds.length,
            current: (i + 1) * batchSize
          })
          
        } catch (err) {
          allErrors.push(`Lote ${i + 1}: ${err.message}`)
          totalErrors += batch.length
        }
      }
      
      // mostrar resultado final
      setResult({
        message: `Proceso completado: ${totalActivated} usuarios activados exitosamente${totalErrors > 0 ? `, ${totalErrors} errores` : ''}`,
        count: totalActivated,
        total: allIds.length,
        errors: allErrors.length > 0 ? allErrors : null
      })
      
    } catch (err) {
      setError(err.message || 'Error al activar usuarios')
    } finally {
      setActivatingUsers(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📥 Registro Masivo de Usuarios
        </h2>
        <p className="text-gray-600">
          Importa múltiples usuarios desde un archivo Excel
        </p>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          📋 Instrucciones para la Importación
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <p>• El archivo debe estar en formato Excel con las siguientes columnas:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>nombre</strong> - Nombre del usuario (requerido)</li>
            <li><strong>apellido</strong> - Apellido del usuario (requerido)</li>
            <li><strong>email</strong> - Correo electrónico único (requerido)</li>
            <li><strong>password</strong> - Contraseña del usuario (requerido)</li>
            <li><strong>tipo_documento</strong> - Tipo de documento (requerido)</li>
            <li><strong>numero_documento</strong> - Número de documento (requerido)</li>
            <li><strong>rol</strong> - Rol del usuario (opcional, por defecto: estudiante)</li>
            <li><strong>estado_cuenta</strong> - Estado de la cuenta (opcional, por defecto: inactiva)</li>
          </ul>
          <p>• Los valores válidos para tipo_documento son: cedula_ciudadania, cedula_extranjeria, pasaporte, tarjeta_identidad</p>
          <p>• Los valores válidos para rol son: estudiante, instructor, admin</p>
          <p>• Los valores válidos para estado_cuenta son: activa, inactiva, suspendida</p>
        </div>
      </div>

      {/* Generar Contraseñas Masivas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔐 Generar Contraseñas Masivas
        </h3>
        <p className="text-gray-600 mb-4">
          Genera nuevas contraseñas para los usuarios listados en el archivo IDs.csv y descarga un archivo CSV con las contraseñas generadas.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Importante:</strong> Esta acción cambiará las contraseñas de los usuarios listados en el archivo IDs.csv. 
            Las contraseñas originales NO se pueden recuperar. Se generará un archivo CSV con las nuevas contraseñas.
          </p>
        </div>
        <button
          onClick={handleGeneratePasswords}
          disabled={generatingPasswords}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {generatingPasswords ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generando contraseñas...
            </div>
          ) : (
            '🔐 Generar y Descargar Contraseñas'
          )}
        </button>
      </div>

      {/* Activar Usuarios del Listado */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ✅ Activar Usuarios del Listado
        </h3>
        <p className="text-gray-600 mb-4">
          Actualiza el estado de los usuarios del archivo IDs.csv a "activa" para permitirles el acceso al login.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Información:</strong> Esta acción actualizará el estado de todos los usuarios del archivo IDs.csv a "activa". 
            Esto permitirá que puedan iniciar sesión con sus nuevas contraseñas.
          </p>
        </div>
        <button
          onClick={handleActivateUsers}
          disabled={activatingUsers}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {activatingUsers ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Activando usuarios...
            </div>
          ) : (
            '✅ Activar Usuarios del Listado'
          )}
        </button>
      </div>

      {/* Descargar Template */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📄 Descargar Plantilla
        </h3>
        <p className="text-gray-600 mb-4">
          Descarga la plantilla Excel con el formato correcto para importar usuarios
        </p>
        <button
          onClick={downloadTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          📥 Descargar Template Excel
        </button>
      </div>

      {/* Subir Archivo */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📤 Subir Archivo Excel
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-green-800">
                  Archivo seleccionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Importando usuarios...
              </div>
            ) : (
              '🚀 Iniciar Importación'
            )}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Resultados
          </h3>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-green-800 font-medium">
                  {result.message}
                </span>
              </div>
              {result.total && (
                <div className="mt-2 text-sm text-green-700">
                  Progreso: {result.count || 0} de {result.total} usuarios procesados
                  {result.current && ` (${Math.min(result.current, result.total)} procesados)`}
                </div>
              )}
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-yellow-800 font-medium mb-2">
                  ⚠️ Errores encontrados ({result.errors.length}):
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-yellow-700 text-sm mb-1">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">✗</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ℹ️ Información Importante
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Los usuarios importados tendrán estado "inactiva" por defecto y deberán ser activados manualmente</p>
          <p>• Las contraseñas se almacenan de forma segura usando hash</p>
          <p>• Si un email ya existe en el sistema, ese registro será omitido</p>
          <p>• Se recomienda revisar los errores antes de proceder con la activación de usuarios</p>
          <p>• El proceso de importación es irreversible, asegúrate de que los datos sean correctos</p>
        </div>
      </div>
    </div>
  )
}

export default BulkUserImport 