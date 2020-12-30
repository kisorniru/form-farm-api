import React from 'react'
import Field from '../Field'

class Dropdown extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      options: [],
      selectedKey: null,
      selectedValue: null,
      showOptions: false
    }

    this.onBlur = this.onBlur.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeOption = this.onChangeOption.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.selectedKey !== state.selectedKey) {
      return { selectedKey: props.selectedKey, selectedValue: props.selectedValue }
    }

    if (props.selectedValue !== state.selectedValue) {
      return { selectedValue: props.selectedValue }
    }

    return null
  }

  onChange (event) {
    let {options} = this.props
    const value = event.target.value
    options = options.filter(option => option.value.toLowerCase().startsWith(value.toLowerCase()))
    this.setState({ options, selectedValue: value,  showOptions: options.length > 0 })
  }

  onBlur () {
    setTimeout(() => {
      this.setState({ showOptions: false })
    }, 200)
  }

  onFocus () {
    if (!this.props.readOnly) {
      this.setState({ showOptions: true })
    }
  }

  onChangeOption (index) {
    const option = this.props.options[index]
    this.props.onChange(option)
    this.setState({selectedKey: option.key, selectedValue: option.value, showOptions: false })
  }

  render () {
    const { showOptions, selectedValue, selectedKey } = this.state
    const { options,disabled, showLabel, label, name } = this.props

    const labelClasses = showLabel ? '' : 'sr-only'
    const groupClass = "custom-dropdown" + (disabled ? " input-group-disabled  " : "")

    return (
      <div className={groupClass}>
        <label className={labelClasses} htmlFor={name}>{label || name}</label>
        <Field
          {...this.props}
          showLabel={false}
          value={selectedValue || ''}
          name="select"
          type='text'
          error={this.props.error}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
        />
        <Field
          {...this.props}
          error=""
          showLabel={false}
          type='hidden'
          onChange={() => true}
          value={selectedKey || 0}
        />
        {
          showOptions && !disabled &&
          <div className="dropdown-options">
            {
              options.map((option, _index) => {
                return (
                  <span key={`option-${_index}`} onClick={() => { this.onChangeOption(_index) }}>{option.value}</span>
                )
              })
            }
          </div>
        }
      </div>
    )
  }
}

export default Dropdown
