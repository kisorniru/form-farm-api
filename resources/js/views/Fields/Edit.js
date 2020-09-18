import React, { Component } from 'react'
import { NotificationManager } from 'react-notifications'
import { addField, updateField } from '../../api/fields'
import { getCategories } from '../../api/categories'
import { defaultField } from '../../config/data'
import RadioButtons from '../../components/RadioButton'
import FieldForm from './form'

class EditField extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isDerived: false,
      field: defaultField,
      categories: [],
      error: null,
      errors: {},
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.onChangeProperty = this.onChangeProperty.bind(this)
  }

  componentDidMount() {
    getCategories({ limit: 1000 })
      .then(data => {
        const categories = data.data.map(category => ({ id: category.id, label: category.name }))
        this.setState({ categories })
      })
      .catch(error => console.log(error))
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.isDerived) {
      return { field: props.field, isDerived: true }
    }

    return null
  }

  onChangeProperty(event) {
    const { field } = this.state
    const { name, value } = event.target
    let data = { ...field, [name]: value }

    if (name === 'name' && !field.id) {
      if (value.length > 0) {
        data.slug = value.toLowerCase().replace(/ /g, "_")
      }
    }

    this.setState({ field: data })
  }

  onSubmit(event) {
    event.preventDefault()
    const { field } = this.state
    const promise = field.id ? updateField(field.id, field) : addField(field)
    promise
      .then(storedField => {
        NotificationManager.success(`The field was ${field.id ? 'updated' : 'created'} successfully`)
        this.props.onStore()
      })
      .catch(response => {
        this.setState({ error: response.message, errors: response.errors })
        NotificationManager.error(response.message)
      })
  }

  render() {
    const { categories, field, errors } = this.state

    return (
      <form className="container-fluid" onSubmit={this.onSubmit} autoComplete="off">
        <div className="row mb-4">
          <div className="col">
            <FieldForm
              field={field}
              errors={errors}
              changeProperty={this.onChangeProperty} />
          </div>
        </div>

        {
          field.type != 'info' &&
          <div className="row mb-4">
            <div className="col">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <RadioButtons
                      vertical={true}
                      name="categories"
                      label="Categories"
                      selected={field.categories ? field.categories : ''}
                      options={categories}
                      onChange={(value) => this.onChangeProperty({ target: { name: 'categories', value } })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <div className="row justify-content-end footer-modal">
          <div className="col-md-4">
            <button type="submit" className="btn btn-block btn-primary">Save</button>
          </div>
        </div>
      </form>
    )
  }
}

export default EditField
