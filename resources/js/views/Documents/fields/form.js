import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { insertFieldToDocument, updateDocumentField, removeDocumentField } from '../../../api/documents'
import { addField } from '../../../api/fields'
import FieldForm from '../../Fields/form'
import Checkbox from '../../../components/Checkbox'
import Field from '../../../components/Field'
import { defaultField } from '../../../config/data'

class DocumentFieldForm extends React.Component {
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
    const { document } = this.props
    const { field } = this.state
    if (field.id) {
      removeDocumentField(document.id, field.id)
        .then(response => {
          NotificationManager.success(response.message)
          this.props.closeModal()
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
    const { document } = this.props
    const { field } = this.state

    delete field.categories

    if (typeof field.metadata == 'object') {
      field.metadata = JSON.stringify(field.metadata)
    }

    if (field.id) {
      const promise = field.isNew ? insertFieldToDocument(document.id, { ...field, field: field.id }) : updateDocumentField(document.id, field.id, field)
      promise
        .then(resField => {
          this.props.onStore()
          this.props.closeModal()
          NotificationManager.success('The field was updated succesfully')
        })
        .catch(error => {
          this.setState({ error: error.message, errors: error.errors })
          NotificationManager.error(error.message)
        })
    } else {
      addField(field)
        .then(resField => {
          insertFieldToDocument(document.id, { ...field, field: resField.id })
            .then(response => {
              this.props.onStore()
              this.props.closeModal()
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

        <div className="row mb-4">
          <div className="col">
            <div className="container-fluid">
              <div className="row">
                <div className="col d-flex">
                  <Checkbox
                    parentClass="input-group"
                    showLabel={true}
                    name="is_exportable"
                    label="Is Exportable?"
                    option={{ id: 'is_exportable', label: 'Is exportable?'}}
                    selected={field.is_exportable}
                    onChange={(target) => this.onChangeProperty({ target: { name: 'is_exportable', value: target.checked } })}
                  />
                </div>
              </div>

              {
                field.is_exportable &&
                <div className="row">
                  <div className="col">
                    <Field
                      parentClass="input-group"
                      showLabel={true}
                      name="exportable_name"
                      label="Exportable name"
                      placeholder="The exportable name in CSV & XLS files"
                      value={field.exportable_name || ''}
                      onChange={this.onChangeProperty}
                    />
                  </div>
                </div>
              }
            </div>
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
  const { document } = state
  return {
    ...document,
    ...props
  }
}

export default connect(mapStateToProps)(DocumentFieldForm)
