import React from 'react'
import { NotificationManager } from 'react-notifications'
import { createRole, updateRole } from '../../api/roles'
import { defaultRole } from '../../config/data'
import Field from '../../components/Field'
import Textarea from '../../components/Textarea'
import RadioButtons from '../../components/RadioButton'
import Checkboxes from '../../components/Checkboxes'

class EditRole extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isDerived: false,
      role: defaultRole,
      error: null,
      privileges: [
        {
          id: 'view',
          label: 'View'
        },
        {
          id: 'edit',
          label: 'View & Edit'
        }
      ],
      access: [
        {
          id: 'everything',
          label: 'Everything'
        },
        {
          id: 'customers',
          label: 'Customers'
        },
        {
          id: 'dashboard',
          label: 'Dashboard'
        },
        {
          id: 'settings',
          label: 'Settings'
        },
        {
          id: 'documents',
          label: 'Documents'
        }
      ],
      errors: {}
    }

    this.reset = this.reset.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.changeField = this.changeField.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.role !== state.role && !state.isDerived) {
      return { role: props.role, isDerived: true }
    }
    return null
  }

  reset () {
    const { role: defaultRole } = this.state
    this.setState({ role: defaultRole, error: null, errors: {} })
  }

  onSubmit (event) {
    event.preventDefault()
    const { role } = this.state
    const promise = role.id ? updateRole(role.id, role) : createRole(role)

    promise
      .then(response => {
        NotificationManager.success(`The role was ${role.id ? 'updated' : 'created'} successfully`)
        this.props.onStore()
      })
      .catch(response => {
        NotificationManager.error(response.message)
        this.setState({ error: response.message, errors: response.errors })
      })
  }

  changeField({ target }) {
    const { name, value } = target
    const { role } = this.state
    const updated = {
      ...role,
      [name]: value
    }

    this.setState({ role: updated })
  }

  render () {
    const { role, access, errors, privileges } = this.state

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
              error={errors.name}
              value={role.name}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <RadioButtons
              name="privileges"
              label="Privileges"
              selected={role.privileges || ''}
              options={privileges}
              error={errors.privileges}
              onChange={(value) => this.changeField({ target: { name: 'privileges', value } })}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Textarea
              parentClass=""
              showLabel={true}
              name="description"
              label="Description"
              value={role.description}
              error={this.state.errors.description}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Checkboxes
              name="access"
              label="System Access"
              selected={role.access || ''}
              options={access}
              error={errors.access}
              onChange={(value) => this.changeField({ target: { name: 'access', value } })}
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

export default EditRole
