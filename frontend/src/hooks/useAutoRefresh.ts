import { useEffect, useRef } from 'react'

type AutoRefreshOptions = {
  enabled?: boolean
  intervalMs?: number
}

export function useAutoRefresh(callback: () => void | Promise<void>, options: AutoRefreshOptions = {}) {
  const { enabled = true, intervalMs = 30_000 } = options
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'hidden') {
        return
      }

      void callbackRef.current()
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [enabled, intervalMs])
}
