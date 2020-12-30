import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { removeField, insertField } from '../../../api/fields'
import { detachField, getTemplateFields } from '../../../api/templates'
import { deleteTemplateField, setTemplateFields } from '../../../state/actions'
import CircleIcon from '../../../Icons/CircleIcon'

class TemplatePDFFields extends Component {
  constructor(props) {
    super(props)

    this.state = {
      field: null,
    }

    this.onRemoveField = this.onRemoveField.bind(this)
    this.reloadFields = this.reloadFields.bind(this)
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

  onRemoveField(id) {
    const { template, fields } = this.props

    detachField(template.id, id)
      .then(response => {
        removeField(id)
          .then(response => {
            const field = fields.find(f => f.id === id)
            if (field) {
              document.querySelectorAll(`[name*="${slug}"]`).forEach(field => field.removeAttribute('style'))
            }
            this.reloadFields()
            NotificationManager.success('The field was removed')
          })
          .catch(error => console.log(error) || NotificationManager.error('There was an error removing the field'))
      })
      .catch(error => console.log(error) || NotificationManager.error('There was an error detaching the field'))
  }

  reloadFields() {
    const { template } = this.props

    getTemplateFields(template.id)
    .then(fields => this.props.setTemplateFields(fields))
    .catch(error => console.log(error))
  }

  render() {
    const { fields } = this.props

    return (
      <div className="available-fields">
        <h2 className="fields-group-title">Available Form Fields</h2>
        <div className="fields-pdf">
          {fields.map((field, index) => (
            <div
              className="field-pdf"
              key={`field-pdf-${index}-${field.id}`}
              id={`field-pdf-${index}-${field.id}`}
              data-slug={field.slug}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
            >
              <h4 className='field-name' onClick={() => this.props.onChooseField(index, field.id)}>{field.name}</h4>
              <span><CircleIcon /></span>
              <span className="remove-field" onClick={() => this.onRemoveField(field.id)}>remove</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { template } = state
  return {
    ...template,
    ...props
  }
}

const mapDispatchToProps = {
  deleteTemplateField,
  setTemplateFields,
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplatePDFFields)
