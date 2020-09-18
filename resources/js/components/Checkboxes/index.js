import React, { Component } from 'react'
import Checkbox from '../Checkbox'

class Checkboxes extends Component {
  constructor (props) {
    super(props)

    this.isSelected = this.isSelected.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  isSelected (option) {
    let { selected } = this.props
    if (!selected) {
      return false
    }
    if (typeof selected == 'string') {
      selected = selected.split(',')
    }

    return selected.indexOf(option.id.toString()) >= 0
  }

  onChange (target) {
    let { selected } = this.props
    const { value, checked } = target

    if (typeof selected == 'string') {
      selected = selected.split(',')
    }

    if (checked) {
      selected.push(value)
    } else {
      selected.splice(selected.indexOf(value), 1)
    }

    selected = selected.filter(sel => sel.length > 0)
    this.props.onChange(selected.join(','))
  }

  render () {
    const {
      name,
      label,
      options,
      error,
      valid,
      required,
      disabled
    } = this.props

    const groupClass = "checkbox-buttons" + (disabled ? " input-group-disabled  " : "")

    return (
      <div className={groupClass}>
        <label className="checkbox-buttons-label">{label}</label>

        <div className="checkbox-buttons-options">
          {options.map((option,index) => (
            <Checkbox disabled={disabled} key={index} selected={this.isSelected(option)} name={name} option={option} onChange={this.onChange} required={index == 0 && required} />
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

export default Checkboxes
