'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  const bg = useColorModeValue('#FFFFFF', '#1A1A1A')
  const borderColor = useColorModeValue('#E5E7EB', '#2D2D2D')
  const titleColor = useColorModeValue('#1A1A1A', '#F5F5F5')
  const descColor = useColorModeValue('#6B7280', '#9CA3AF')

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Frosted backdrop */}
          <motion.div
            key="backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Dialog */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-desc' : undefined}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              zIndex: 50,
              width: '100%',
              maxWidth: '28rem',
              transform: 'translate(-50%, -50%)',
              backgroundColor: bg,
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              padding: '24px',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {title && (
              <Text id="modal-title" fontSize="h3" color={titleColor} mb={1} fontWeight="600">
                {title}
              </Text>
            )}
            {description && (
              <Text id="modal-desc" fontSize="sm" color={descColor} mb={4}>
                {description}
              </Text>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
