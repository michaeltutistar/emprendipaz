import React, { useState, useEffect } from 'react'

const SearchInput = ({ 
  placeholder = "Buscar...", 
  onSearch, 
  defaultValue = "", 
  className = "",
  label = "Buscar"
}) => {
  const [localValue, setLocalValue] = useState(defaultValue)

  // Actualizar valor local cuando cambie el defaultValue
  useEffect(() => {
    setLocalValue(defaultValue)
  }, [defaultValue])

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== defaultValue) {
        onSearch(localValue)
      }
    }, 1000) // 1 segundo de delay

    return () => clearTimeout(timeoutId)
  }, [localValue, onSearch, defaultValue])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`}
      />
    </div>
  )
}

export default SearchInput 