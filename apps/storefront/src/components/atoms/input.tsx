import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  helperText,
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const input = (
    <input
      id={inputId}
      className={`input w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    />
  )

  if (label || helperText) {
    return (
      <div className="block">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 mb-1 block">
            {label}
          </label>
        )}
        {input}
        {helperText && (
          <p className="mt-1 text-sm text-gray-500" id={`${inputId}-helper`}>
            {helperText}
          </p>
        )}
      </div>
    )
  }

  return input
}