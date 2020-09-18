import React from 'react'
import { NotificationManager } from 'react-notifications'
import { addCategory, updateCategory } from '../../api/categories'
import { defaultCategory } from '../../config/data'
import Field from '../../components/Field'

class EditCategory extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isDerived: false,
      category: defaultCategory,
      error: null,
      errors: {}
    }

    this.reset = this.reset.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.changeField = this.changeField.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.category !== state.category && !state.isDerived) {
      return { isDerived: true, category: props.category }
    }

    return null
  }

  reset () {
    const { category = defaultCategory } = this.props
    this.setState({ category, error: null, errors: {} })
  }

  onSubmit (event) {
    event.preventDefault()
    const { category } = this.state

    const promise = category.id ? updateCategory(category.id, category) : addCategory(category)

    promise
      .then(response => {
        NotificationManager.success(`The category was ${category.id ? 'updated' : 'created'} successfully`)
        this.props.onStore()
      })
      .catch(error => {
        NotificationManager.error(error.message)
        this.setState({ ...error })
      })
  }

  changeField(event) {
    const { category } = this.state
    const { name, value } = event.target
    const updated = {
      ...category,
      [name]: value
    }

    this.setState({ category: updated })
  }

  render () {
    let { category } = this.state

    return (
      <form className="container" onSubmit={this.onSubmit} autoComplete="off">
        <div className="row">
          <div className="col">
            <Field
              parentClass=""
              showLabel={true}
              name="name"
              label="Name"
              placeholder="Name"
              error={this.state.errors.name}
              value={category.name || ''}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row justify-content-end">
          <div className="col-md-4">
            <button type="reset" onClick={this.reset} className="btn btn-block btn-link">Reset</button>
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-block btn-primary">Save</button>
          </div>
        </div>
      </form>
    )
  }
}

export default EditCategory
