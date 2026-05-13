'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Text, IconButton, useColorModeValue } from '@chakra-ui/react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  toast: (message: string, options?: { variant?: ToastVariant; duration?: number }) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, options?: { variant?: ToastVariant; duration?: number }) => {
      const id = Math.random().toString(36).slice(2)
      const item: ToastItem = {
        id,
        message,
        variant: options?.variant ?? 'default',
        duration: options?.duration ?? 3000,
      }
      setToasts(prev => [...prev, item])
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─── Container ───────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  return (
    <Box
      aria-live="polite"
      aria-label="Notifications"
      position="fixed"
      top={4}
      right={4}
      zIndex={50}
      display="flex"
      flexDirection="column"
      gap={2}
      maxW="sm"
      w="full"
      pointerEvents="none"
    >
      <AnimatePresence>
        {toasts.map(t => (
          <ToastItemComponent key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </Box>
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function ToastItemComponent({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const bg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const textColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const mutedColor = useColorModeValue('#6B7280', '#9CA3AF')

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const borderLeftColor =
    toast.variant === 'success' ? '#059669' :
    toast.variant === 'error' ? '#DC2626' :
    toast.variant === 'info' ? '#2563EB' :
    undefined

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: 'auto' }}
    >
      <Box
        display="flex"
        alignItems="flex-start"
        gap={3}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        borderLeft={borderLeftColor ? `4px solid ${borderLeftColor}` : undefined}
        px={4}
        py={3}
        shadow="md"
        bg={bg}
        role="status"
      >
        {toast.variant === 'success' && (
          <Text mt={0.5} color="#059669" aria-hidden="true">✓</Text>
        )}
        {toast.variant === 'error' && (
          <Text mt={0.5} color="#DC2626" aria-hidden="true">✕</Text>
        )}
        <Text flex={1} fontSize="sm" color={textColor}>{toast.message}</Text>
        <Box
          as="button"
          ml={1}
          color={mutedColor}
          _hover={{ color: textColor }}
          transition="colors 0.15s"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Box>
      </Box>
    </motion.div>
  )
}
