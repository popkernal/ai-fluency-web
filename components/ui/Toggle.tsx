'use client'

import { Switch, FormControl, FormLabel, Text, Box } from '@chakra-ui/react'
import { useId } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  id?: string
}

export function Toggle({ checked, onChange, label, description, disabled = false, id }: ToggleProps) {
  const generatedId = useId()
  const toggleId = id ?? generatedId

  return (
    <Box display="flex" alignItems="flex-start" gap={3}>
      <Switch
        id={toggleId}
        isChecked={checked}
        onChange={e => onChange(e.target.checked)}
        isDisabled={disabled}
        size="sm"
        mt={0.5}
      />
      {(label || description) && (
        <FormLabel htmlFor={toggleId} cursor="pointer" userSelect="none" m={0}>
          {label && (
            <Text fontSize="body" color="text.primary">{label}</Text>
          )}
          {description && (
            <Text fontSize="sm" color="text.secondary" mt={0.5}>{description}</Text>
          )}
        </FormLabel>
      )}
    </Box>
  )
}
