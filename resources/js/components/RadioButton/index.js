import React, { Component } from 'react'

class RadioButtons extends Component {
  render () {
    const {
      vertical,
      required,
      selected,
      disabled,
      name,
      label,
      error,
      valid,
      options
    } = this.props

    const groupClass = "radio-buttons" + (disabled ? " input-group-disabled  " : "")

    return (
      <div className={groupClass}>
        <label className="radio-buttons-label">{label}</label>

        <div className={`radio-buttons-options ${vertical ? 'vertical' : 'horizontal'}`}>
          {options && options.map((option,index) => (
            <div className="radio" key={`${name}-${index}`}>
              <input disabled={disabled} type="radio" id={`${name}-${option.id}`} name={name} value={option.id} checked={selected == option.id ? true : false } onChange={(event) => this.props.onChange(event.target.value)} required={required} />
              <label htmlFor={`${name}-${option.id}`}>
                <div className="checker"></div>
                {option.label}
              </label>
            </div>
          ))}
        </div>
        {
          error &&
          <p className="invalid-feedback">{error}</p>
        }
        {
          valid &&
          <p className="valid-feedback">{valid}</p>
        }
      </div>
    )
  }
}

export default RadioButtons
