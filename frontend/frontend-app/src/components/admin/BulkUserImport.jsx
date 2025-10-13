import React, { useState } from 'react'

const BulkUserImport = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

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
      const response = await fetch('/api/admin/users/import', {
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
            📊 Resultados de la Importación
          </h3>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-green-800 font-medium">
                  {result.imported_count} usuarios importados exitosamente
                </span>
              </div>
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