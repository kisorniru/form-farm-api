import React from 'react'
import { NotificationManager } from 'react-notifications'
import { addPlan, updatePlan } from '../../api/plans'
import { defaultPlan } from '../../config/data'
import Field from '../../components/Field'
import RadioButtons from '../../components/RadioButton'
import Textarea from '../../components/Textarea'

class EditPlan extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isDerived: false,
      plan: defaultPlan,
      error: null,
      errors: {}
    }

    this.reset = this.reset.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.changeField = this.changeField.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.plan !== state.plan && !state.isDerived) {
      return { isDerived: true, plan: props.plan }
    }
    else return null
  }

  reset () {
    const { plan = defaultPlan } = this.props
    this.setState({
      plan,
      error: null,
      errors: {}
    })
  }

  onSubmit (event) {
    event.preventDefault()
    const { plan } = this.state

    const promise = plan.id ? updatePlan(plan.id, plan) : addPlan(plan)
    promise
      .then(response => {
        NotificationManager.success(`The plan was ${plan.id ? 'updated' : 'created'} succesfully`)
        this.props.onStore()
      })
      .catch(response => {
        this.setState({ error: response.message, errors: response.errors })
        NotificationManager.error(response.message)
      })
  }

  changeField(event) {
    const { plan } = this.state
    const { name, value } = event.target
    const updated = {
      ...plan,
      [name]: value
    }

    this.setState({ plan: updated })
  }

  render () {
    const { plan } = this.state

    return (
      <form className="container" onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col">
            <Field
              parentClass="input-group"
              showLabel={true}
              name="name"
              label="Name"
              placeholder="Name"
              error={this.state.errors.name}
              value={plan.name}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Textarea
              parentClass="input-group"
              showLabel={true}
              name="description"
              label="Description"
              placeholder="Description"
              value={plan.description}
              error={this.state.errors.description}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Field
              type="number"
              parentClass="input-group"
              showLabel={true}
              name="amount"
              label="Amount"
              placeholder="999.99"
              step={.01}
              error={this.state.errors.amount}
              required={true}
              value={plan.amount}
              disabled={plan.id ? true : false}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <RadioButtons
              disabled={plan.id ? true : false}
              name="interval"
              label="Interval"
              selected={plan.interval ? plan.interval.toLowerCase().replace(/\s/g, '_') : ''}
              options={[{id: 'day', label: 'Day'}, {id: 'week', label: 'Week'}, {id: 'month', label: 'Month'}, {id: 'year', label: 'Year'}]}
              error={this.state.errors.interval}
              required={true}
              onChange={ (value) => this.changeField({target: {name: 'interval', value}}) }
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

export default EditPlan
