import React, { Component } from 'react'

class Textarea extends Component {
  render () {
    const {
      addKey,
      parentClass,
      showLabel,
      inputClass,
      icon,
      name,
      description,
      type,
      label,
      placeholder,
      defaultValue,
      value,
      disabled,
      required,
      readOnly,
      autoComplete,
      error,
      valid,
      onChange,
      onFocus,
      onBlur
    } = this.props

    const labelClasses = showLabel ? '' : 'sr-only'

    const groupClass = parentClass + (disabled ? " input-group-disabled  " : "")

    return (
      <div className={groupClass}>
        <label className={labelClasses} htmlFor={name}>{label || name}</label>
        <div className={`input-group mb-2 ${error ? 'is-invalid' : ''}`}>
          {
            icon &&
            <div className="input-group-prepend"><div className="input-group-text"><span className={icon}></span></div></div>
          }
          <textarea
            disabled={disabled}
            key={addKey && `${Math.floor((Math.random() * 1000))}-min`} // forcing re rendering of this field
            className={ `form-control ${inputClass ? inputClass : ''} ${error ? 'is-invalid' : ''}` }
            name={ name }
            type={ type || 'text' }
            placeholder={ placeholder || label }
            required={ !!required }
            readOnly={ !!readOnly }
            autoComplete={ autoComplete }
            defaultValue={defaultValue}
            value={value}
            onFocus={ (event) => { onFocus && onFocus(event) } }
            onBlur={ (event) => { onBlur && onBlur(event) } }
            onChange={ (event) => { onChange && onChange(event) } }></textarea>
          {
            description &&
            <small className="form-text text-muted">{description}</small>
          }
          {
            error &&
            <p className="invalid-feedback">{error}</p>
          }
          {
            valid &&
            <p className="valid-feedback">{valid}</p>
          }
        </div>
      </div>
    )
  }
}

export default Textarea
