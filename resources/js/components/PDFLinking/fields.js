import React from 'react'
import CircleIcon from '../../Icons/CircleIcon'

class PDFLinkingFields extends React.Component {
  constructor(props) {
    super(props)

    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
  }

  onMouseEnter(event) {
    const { slug } = event.target.dataset
    document.querySelectorAll(`[name*="${slug}"]`).forEach(field => field.style.background = '#c7d775')
  }

  onMouseLeave(event) {
    const { slug } = event.target.dataset
    document.querySelectorAll(`[name*="${slug}"]`).forEach(field => field.removeAttribute('style'))
  }

  render() {
    const { fields } = this.props

    return (
      <div className="available-fields">
        <h2 className="fields-group-title">Available Form Fields</h2>
        <div className="fields-pdf">
          {fields.map((field, index) => (
            <div className="field-pdf" key={`field-pdf-${index}-${field.id}`} id={`field-pdf-${index}-${field.id}`} data-slug={field.slug}
              onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
              <h4 className='field-name' onClick={() => this.props.onChooseField(index, field.id)}>{field.name}</h4>
              <span><CircleIcon /></span>
              <span className="remove-field" onClick={() => this.props.onDisableField(field.id)}>Disable</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default PDFLinkingFields
