import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { setCustomer } from '../../state/actions'
import { addCustomer, updateCustomer } from '../../api/customers'
import { defaultCustomer } from '../../config/data'
import Field from '../../components/Field'

class EditCustomer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDerived: false,
      customer: defaultCustomer,
      error: null,
      errors: {}
    }

    this.reset = this.reset.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.changeField = this.changeField.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.isDerived) {
      return { customer: props.customer, isDerived: true }
    }

    return null
  }

  reset() {
    const { customer = defaultCustomer } = this.props
    this.setState({ customer, error: null, errors: {} })
  }

  onSubmit(event) {
    event.preventDefault()
    const { customer } = this.state
    const promise = customer.id ? updateCustomer(customer.id, customer) : addCustomer(customer)
    promise
      .then(response => {
        NotificationManager.success(`The customer was ${customer.id ? 'updated' : 'created'} succesfully`)
        this.props.setCustomer(response)
        this.props.onStore()
      })
      .catch(error => {
        NotificationManager.error(error.message)
        this.setState({ error: error.message, errors: error.errors })
      })
  }

  changeField(event) {
    const { name, value } = event.target
    const state = {
      ...this.state.customer,
      [name]: value
    }

    this.setState({ customer: state })
  }

  render() {
    const { customer, errors } = this.state

    return (
      <form className="container" onSubmit={this.onSubmit} autoComplete="off">
        <div className="row">
          <div className="col">
            <Field
              showLabel={true}
              name="name"
              label="Name"
              placeholder="Name"
              error={errors ? errors.name : ''}
              value={customer.name}
              onChange={this.changeField}
            />

            <Field
              showLabel={true}
              name="email"
              label="Email"
              placeholder="comany@example.com"
              error={errors ? errors.email : ''}
              value={customer.email}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row justify-content-end footer-modal">
          <div className="col-5">
            <button type="reset" onClick={this.reset} className="btn btn-block btn-link">Reset</button>
          </div>
          <div className="col-5">
            <button type="submit" className="btn btn-block btn-primary">Save</button>
          </div>
        </div>
      </form>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { customer } = state
  return {
    ...customer,
    ...props
  }
}

const mapDispatchToProps = {
  setCustomer,
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCustomer)
