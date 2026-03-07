import React from 'react'
import styles from './Input.module.css'

export default function Input({
  label,
  value,
  onChange,
  placeholder = '',
  error,
  type = 'text',
  disabled = false,
  id,
  autoFocus = false,
  onKeyDown,
  className = '',
}) {
  const inputId = id || `input-${label?.replace(/\s/g, '-').toLowerCase()}`
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        className={`${styles.input} ${error ? styles.hasError : ''}`}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
