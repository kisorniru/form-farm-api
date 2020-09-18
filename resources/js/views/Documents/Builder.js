import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { getCategories, getCategoryFields } from '../../api/categories'
import { getDocumentFields, getDocumentField, updateDocumentField } from '../../api/documents'
import { getField } from '../../api/fields'
import { fieldTypes, defaultField } from '../../config/data'
import { asyncForEach, randomString } from '../../extensions'
import FormBuilder from '../../components/FormBuilder'
import Modal from '../../components/Modal'
import DocumentFieldForm from './fields/form'

class DocumentBuilder extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showFieldModal: false,
      shouldReorder: false,
      field: defaultField,
      document: {},
      fields: [],
      categories: [],
    }

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.reorderFields = this.reorderFields.bind(this)
    this.onChangeField = this.onChangeField.bind(this)
    this.onInsertfield = this.onInsertfield.bind(this)
    this.onSelectField = this.onSelectField.bind(this)
    this.onChangeFieldsOrder = this.onChangeFieldsOrder.bind(this)
    this.pushCategoryInformation = this.pushCategoryInformation.bind(this)
  }

  componentDidMount() {
    if (!this.props.hideDocumentOptions) {
      this.loadCategories()
    }
    this.loadDocumentFields()
  }

  componentDidUpdate(props, prevState) {
    if (prevState.document.id !== this.state.document.id && this.state.document.id) {
      this.loadDocumentFields()
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.document.id !== state.document.id) {
      return { document: props.document }
    }

    return null
  }

  loadCategories() {
    getCategories({ limit: 10000 })
      .then(response => {
        asyncForEach(response.data, (category) => {
          getCategoryFields(category.id)
            .then(fields => {
              if (fields.length > 0) {
                category.fields = fields
                this.pushCategoryInformation(category)
              }
            })
            .catch(error => console.log('error getting fields by category', error))
        })
      })
      .catch(error => console.log('Error getting categories', error))
  }

  loadDocumentFields() {
    const { document } = this.state
    getDocumentFields(document.id)
      .then(fields => {
        this.setState({ fields: fields })
      })
      .catch(error => console.log(error))
  }

  pushCategoryInformation(category) {
    let { categories } = this.state
    if (category.fields.length > 0) {
      categories.push(category)
      this.setState({ categories })
    }
  }

  reorderFields() {
    const { fields, shouldReorder } = this.state
    const { document } = this.props

    if (shouldReorder) {
      const promises = []
      fields.map(field => {
        field.metadata = typeof field.metadata == 'object' ? JSON.stringify(field.metadata) : field.metadata
        if (field.reordered) {
          promises.push(updateDocumentField(document.id, field.id, field))
        }
      })

      Promise.all(promises)
        .then(response => {
          this.setState({ shouldReorder: false }, this.loadDocumentFields)
        })
        .catch(error => {
          this.setState({ shouldReorder: false }, this.loadDocumentFields)
        })
    }
  }

  openModal() {
    this.setState({ showFieldModal: true })
  }

  closeModal() {
    this.setState({ showFieldModal: false }, this.loadDocumentFields)
  }

  onSelectField(index, id) {
    const { document } = this.props
    getDocumentField(document.id, id)
      .then(field => {
        this.setState({ field: field }, this.openModal)
      })
      .catch(error => console.log(error))
  }

  onChangeField({ target }) {
    console.log(`changed field ${target.name} to value ${target.value}`)
  }

  onInsertfield(data) {
    if (data.isNew) {
      if (data.id) {
        getField(data.id)
        .then(field => {
            this.setState({ field: { ...data, ...field } }, this.openModal)
          })
          .catch(error => {
            NotificationManager.error("The field is invalid")
            this.loadDocumentFields()
          })
      } else {
        if (data.type == 'info') {
          const id = randomString(12)
          data.name = `Info ${id}`
          data.slug = `info_${id}`
        }
        this.setState({ field: { ...data } }, this.openModal)
      }
    }
  }

  onChangeFieldsOrder(fields, isAdding) {
    this.setState({ fields, shouldReorder: true }, () => {
      if (!isAdding) {
        this.reorderFields()
      }
    })
  }

  render() {
    const {
      showFieldModal,
      categories,
      fields,
      field,
    } = this.state

    const {
      hideDocumentOptions,
    } = this.props

    return (
      <div>
        <FormBuilder
          hideDocumentOptions={hideDocumentOptions}
          fields={fields}
          categories={categories}
          fieldTypes={fieldTypes}
          insertfield={this.onInsertfield}
          updateFields={this.onChangeFieldsOrder}
          onChangeField={this.onChangeField}
          onSelectField={this.onSelectField} />

        {
          showFieldModal &&
          <Modal title={field.id ? 'Edit field' : 'Create field'} show={showFieldModal} onClose={this.closeModal}>
            <DocumentFieldForm field={field} closeModal={this.closeModal} onStore={this.reorderFields} onCancel={this.closeModal} />
          </Modal>
        }
      </div>
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

export default connect(mapStateToProps)(DocumentBuilder)
