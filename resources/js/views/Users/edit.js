import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { addUser, updateUser } from '../../api/users'
import { getGroups } from '../../api/groups'
import { getRoles } from '../../api/roles'
import { defaultUser } from '../../config/data'
import Field from '../../components/Field'
import Dropdown from '../../components/Dropdown'
import Radiobuttons from '../../components/RadioButton'

class EditUser extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDerived: false,
      user: defaultUser,
      roles: [],
      groups: [],
      error: null,
      errors: {}
    }

    this.reset = this.reset.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.changeField = this.changeField.bind(this)
    this.onChangeGroup = this.onChangeGroup.bind(this)
    this.getGroupName = this.getGroupName.bind(this)
  }

  componentDidMount() {
    getGroups({ limit: 1000 })
      .then(response => {
        const groups = response.data.map(group => {
          return {
            ...group,
            key: group.id,
            value: group.name
          }
        })

        this.setState({ groups })
      })
      .catch(console.error)

    getRoles({ limit: 1000 })
      .then(response => {
        const { data } = response
        this.setState({ roles: data.map(role => ({ id: role.id, label: role.name })) })
      })
      .catch(error => console.log(error))
  }

  static getDerivedStateFromProps(props, state) {
    if (props.user !== state.user && !state.isDerived) {
      const user = {
        ...props.user,
        ...(typeof props.user.group == 'object' ? { group: props.user.group.id } : {})
      }
      return { user, isDerived: true }
    }

    return null
  }

  reset() {
    const { user = defaultUser } = this.props
    this.setState({ user, error: null, errors: {} })
  }

  onSubmit(event) {
    event.preventDefault()
    const { user } = this.state
    const { customer, authUser } = this.props

    if (customer) {
      user.customer = customer.id
    } else if (authUser && authUser.customer) {
      user.customer = authUser.customer.id
    }

    let promise = user.id ? updateUser(user.id, user) : addUser(user)
    promise
      .then(response => {
        NotificationManager.success(`The user ${user.name} was ${user.id ? 'updated' : 'created'} successfully`)
        this.props.onStore()
      })
      .catch(response => {
        NotificationManager.error(response.message)
        this.setState({ error: response.message, errors: response.errors })
      })
  }

  changeField(event) {
    const { name, value } = event.target
    const { user } = this.state
    const updated = {
      ...user,
      [name]: value
    }

    this.setState({ user: updated })
  }

  onChangeGroup(value) {
    const { groups, user } = this.state
    const group = groups.find(group => group.key === value)
    const updated = {
      ...user,
      group: group.key
    }

    this.setState({ user: updated })
  }

  getGroupName() {
    const { user, groups } = this.state
    const group = groups.find(group => group.id === user.group)
    return group ? group.name : ''
  }

  render() {
    const { user, groups, roles, errors } = this.state

    return (
      <form className="container" onSubmit={this.onSubmit} autoComplete="off">
        <div className="row">
          <div className="col">
            <Field
              parentClass="input-user"
              showLabel={true}
              name="first_name"
              label="First Name"
              placeholder="First Name"
              error={errors.first_name}
              value={user.first_name}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Field
              parentClass="input-user"
              showLabel={true}
              name="last_name"
              label="Last Name"
              placeholder="Last Name"
              error={errors.last_name}
              value={user.last_name}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Field
              parentClass="input-user"
              showLabel={true}
              name="email"
              label="Email"
              placeholder="Email"
              error={errors.email}
              value={user.email}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Field
              parentClass="input-user"
              showLabel={true}
              name="company"
              label="Company"
              placeholder="Company"
              error={errors.company}
              value={user.company}
              onChange={this.changeField}
            />
          </div>
        </div>

        {
          !user.id &&
          <div className="row">
            <div className="col">
              <Field
                type="password"
                parentClass="input-user"
                showLabel={true}
                name="password"
                label="Password"
                placeholder="Password"
                error={errors.password}
                value={user.password}
                onChange={this.changeField}
              />
            </div>
          </div>
        }

        <div className="row">
          <div className="col">
            <Dropdown
              showLabel={true}
              name="group"
              label="Group"
              placeholder="Group"
              options={groups}
              error={errors.group}
              selectedKey={user.group}
              selectedValue={this.getGroupName()}
              onChange={(selected) => { this.onChangeGroup(selected.key) }}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Radiobuttons
              name="role"
              label="Role"
              options={roles}
              selected={user.role || ''}
              error={errors.role}
              onChange={(value) => this.changeField({ target: { name: 'role', value } })}
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
  const { auth, customer } = state
  const authUser = auth.user
  return {
    authUser,
    ...customer,
    ...props
  }
}

export default connect(mapStateToProps)(EditUser)
