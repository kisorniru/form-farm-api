import React, { Component } from 'react'

class FileUploader extends Component {
  constructor (props) {
    super(props)

    this.state = {
      type: null,
      filename: null,
    }

    this.onChangeFile = this.onChangeFile.bind(this)
    this.onFileSelect = this.onFileSelect.bind(this)
  }

  onFileSelect() {
    const { name } = this.props
    const { filename } = this.state

    if (filename) {
      document.getElementById(name).value = ''
      this.setState({ type: null, filename: null })
      this.props.onChange(null)
    } else {
      document.getElementById(name).click()
    }
  }

  onChangeFile(event) {
    const { target } = event
    const files = target.files
    const file = files[0]

    this.setState({ filename: file.name, type: file.type })

    const reader = new FileReader()
    reader.onloadend = () => {
      this.props.onChange(reader.result)
    }

    reader.readAsDataURL(file)
  }

  render () {
    const {
      addKey,
      parentClass,
      showLabel,
      inputClass,
      name,
      label,
      placeholder,
      error,
      valid,
    } = this.props

    const {
      filename,
      extension
    } = this.state

    const labelClasses = showLabel ? '' : 'sr-only'
    const customPlaceholder = filename ? filename : placeholder
    const customButtonLabel = filename ? 'Remove' : 'Select'

    return (
      <div className={parentClass}>
        <label className={labelClasses} htmlFor={name}>{label || name}</label>
        <div className={`input-group mb-2 ${error ? 'is-invalid' : ''}`}>
          <div className="input-file">
            <input
              key={addKey && `${Math.floor((Math.random() * 1000))}-min`} // forcing re rendering of this field
              className={ `form-control d-none ${inputClass ? inputClass : ''} ${error ? 'is-invalid' : ''}` }
              id={ name }
              name={ name }
              type="file"
              onChange={this.onChangeFile} />
              <span className='placeholder'>{customPlaceholder}</span>
              <button type="button" className="btn btn-link btn-uploader" onClick={this.onFileSelect}>{customButtonLabel}</button>
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
      </div>
    )
  }
}

export default FileUploader
