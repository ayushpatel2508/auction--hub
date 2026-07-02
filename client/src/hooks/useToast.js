import { useState, useEffect, useCallback } from 'react'

let memoryState = []
let listeners = []

const notify = () => {
  listeners.forEach(listener => listener(memoryState))
}

const addToast = (toast) => {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast = { id, ...toast }
  
  memoryState = [...memoryState, newToast]
  notify()
  
  setTimeout(() => {
    memoryState = memoryState.filter(t => t.id !== id)
    notify()
  }, toast.duration || 10000)
  
  return id
}

const removeToast = (id) => {
  memoryState = memoryState.filter(t => t.id !== id)
  notify()
}

const toast = (options) => {
  if (typeof options === 'string') {
    return addToast({ title: options, variant: 'default' })
  }
  return addToast(options)
}

toast.success = (title, description) => addToast({ title, description, variant: 'success' })
toast.error = (title, description) => addToast({ title, description, variant: 'destructive' })
toast.warning = (title, description) => addToast({ title, description, variant: 'warning' })
toast.info = (title, description) => addToast({ title, description, variant: 'default' })

export const useToast = () => {
  const [toasts, setToasts] = useState(memoryState)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter(l => l !== setToasts)
    }
  }, [])

  return {
    toasts,
    toast,
    removeToast
  }
}