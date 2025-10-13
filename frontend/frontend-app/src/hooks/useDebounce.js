import { useCallback } from 'react'

export const useDebounce = (callback, delay = 1000) => {
  return useCallback(
    (() => {
      let timeoutId
      return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          callback(...args)
        }, delay)
      }
    })(),
    [callback, delay]
  )
} 