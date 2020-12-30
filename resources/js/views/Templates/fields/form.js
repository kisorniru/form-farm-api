import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { attachField, updateTemplateField, detachField } from '../../../api/templates'
import { addField } from '../../../api/fields'
import FieldForm from '../../Fields/form'
import { defaultField } from '../../../config/data'

class TemplateFieldForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDerived: false,
      field: defaultField,
      error: null,
      errors: {}
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.onRemoveField = this.onRemoveField.bind(this)
    this.onChangeProperty = this.onChangeProperty.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.field !== state.field && !state.isDerived) {
      return { field: props.field, isDerived: true }
    }

    return null
  }

  onChangeProperty({ target }) {
    const { name, value } = target
    const { field } = this.state
    let data = {
      ...field,
      [name]: value
    }

    if (name === 'name' && value.length > 0 && !field.id) {
      data.slug = value.toLowerCase().replace(/ /g, '_')
    }

    this.setState({ field: data })
  }

  onRemoveField() {
    const { template } = this.props
    const { field } = this.state
    if (field.id) {
      detachField(template.id, field.id)
        .then(response => {
          NotificationManager.success(response.message)
          this.closeModal()
        })
        .catch(error => {
          NotificationManager.error(error.message)
          console.log(error)
        })
    } else {
      this.props.onCancel()
    }
  }

  onSubmit(event) {
    event.preventDefault()
    const { template } = this.props
    const { field } = this.state

    delete field.categories

    if (typeof field.metadata == 'object') {
      field.metadata = JSON.stringify(field.metadata)
    }

    if (field.id) {
      const promise = field.isNew ? attachField(template.id, { ...field, field: field.id }) : updateTemplateField(template.id, field.id, field)
      promise
        .then(resField => {
          this.props.onStore()
          NotificationManager.success('The field was updated succesfully')
        })
        .catch(error => {
          this.setState({ error: error.message, errors: error.errors })
          NotificationManager.error(error.message)
        })
    } else {
      addField(field)
        .then(resField => {
          attachField(template.id, { ...field, field: resField.id })
            .then(response => {
              this.props.onStore()
              NotificationManager.success('The field was added succesfully')
            })
            .catch(error => this.setState({ error: error.message }))
        })
        .catch(error => {
          NotificationManager.error(error.message)
          this.setState({ error: error.message, errors: error.errors })
        })
    }
  }

  render() {
    const { field } = this.state

    return (
      <form className="container-fluid" onSubmit={this.onSubmit} autoComplete="off">
        <div className="row mb-4">
          <div className="col">
            <FieldForm field={field} changeProperty={(event) => this.onChangeProperty(event)} />
          </div>
        </div>

        <div className="row justify-content-between mb-4">
          <div className="col-md-4">
            <button type="button" className="btn btn-block btn-link" onClick={this.onRemoveField}>Remove</button>
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-block btn-primary">Save</button>
          </div>
        </div>
      </form>
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

export default connect(mapStateToProps)(TemplateFieldForm)
