import React, { Component } from 'react'

class Checkbox extends Component {

  render () {
    const {
      disabled,
      selected,
      name,
      className,
      required,
      option
    } = this.props

    return (
      <div className={className ? className : 'checkbox'} key={`${name}-${option.id}`}>
        <input
          disabled={disabled}
          type="checkbox"
          id={`${name}-${option.id}`}
          name={name}
          value={option.id}
          checked={selected}
          required={required}
          onChange={(event) => this.props.onChange(event.target)}
        />
        <label htmlFor={`${name}-${option.id}`}>
          <div className="checker"></div>
          {option.label}
        </label>
      </div>
    )
  }
}

export default Checkbox
