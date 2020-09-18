import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { getCategories, getCategoryFields } from '../../api/categories'
import { getTemplateFields, getTemplateField, updateTemplateField } from '../../api/templates'
import { getField } from '../../api/fields'
import { fieldTypes, defaultField } from '../../config/data'
import { asyncForEach } from '../../extensions'
import FormBuilder from '../../components/FormBuilder'
import Modal from '../../components/Modal'
import TemplateFieldForm from './fields/form'

class TemplateBuilder extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showFieldModal: false,
      shouldReorder: false,
      field: defaultField,
      template: {},
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
    this.loadCategories()
  }

  componentDidUpdate(props, state) {
    if (state.template.id !== this.state.template.id && this.state.template.id) {
      this.loadTemplateFields()
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.template.id !== state.template.id) {
      return { template: props.template }
    }

    return null
  }

  loadCategories() {
    const { categories } = this.state
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

  loadTemplateFields() {
    const { template } = this.state
    getTemplateFields(template.id)
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
    const { template } = this.props

    if (shouldReorder) {
      const promises = []
      fields.map(field => {
        if (field.reordered) {
          promises.push(updateTemplateField(template.id, field.id, field))
        }
      })

      Promise.all(promises)
        .then(response => {
          this.setState({ showFieldModal: false, shouldReorder: false }, this.loadTemplateFields)
        })
        .catch(error => {
          this.setState({ showFieldModal: false, shouldReorder: false }, this.loadTemplateFields)
        })
    }
  }

  openModal() {
    this.setState({ showFieldModal: true })
  }

  closeModal() {
    this.setState({ showFieldModal: false }, this.loadTemplateFields)
  }

  onSelectField(index, id) {
    const { template } = this.props
    getTemplateField(template.id, id)
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
            this.loadTemplateFields()
          })
      } else {
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
      field,
      categories,
      fields,
    } = this.state

    return (
      <div>
        <FormBuilder
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
            <TemplateFieldForm field={field} closeModal={this.closeModal} onStore={this.reorderFields} onCancel={this.closeModal} />
          </Modal>
        }
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

export default connect(mapStateToProps)(TemplateBuilder)
