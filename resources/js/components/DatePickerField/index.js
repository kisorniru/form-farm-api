import React, { Component } from 'react'
import DatePicker from 'react-datepicker'

class DatePickerField extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (name, date = new Date()) {
    const state = {
      [name]: date
    }
    const value = (date.getTime()/1000|0)
    this.props.onChange(value)
  }

  render () {
    const {
      name,
      label,
      error,
      valid,
      disabled,
      parentClass,
      placeholder,
      defaultValue
    } = this.props
    let date = null
    if (isNaN(defaultValue)) {
      date = new Date(defaultValue)
    } else {
      date = new Date(defaultValue*1000)
    }

    const groupClass = parentClass + (disabled ? " input-group-disabled  " : "")

    return (
      <div className={groupClass}>
        <label>{label}</label>

        <DatePicker
          disabled={disabled}
          strictParsing
          dateFormat="MM/dd/yyyy"
          placeholderText={placeholder}
          {...(defaultValue ? {selected: date} : {})}
          onChange={(date) => this.handleChange(name, date)}
        />
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

export default DatePickerField
