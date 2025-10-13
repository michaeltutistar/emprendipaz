import { useCallback, useRef } from 'react'

export const useSmartDebounce = (callback, delay = 1000) => {
  const timeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  return useCallback(
    (value) => {
      // Marcar que el usuario está escribiendo
      isTypingRef.current = true
      
      // Limpiar el timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Configurar nuevo timeout
      timeoutRef.current = setTimeout(() => {
        // Solo ejecutar la búsqueda si el usuario ha dejado de escribir
        if (isTypingRef.current) {
          isTypingRef.current = false
          callback(value)
        }
      }, delay)
    },
    [callback, delay]
  )
} 