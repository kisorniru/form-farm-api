import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { addGroup, updateGroup } from '../../api/groups'
import { getRoles } from '../../api/roles'
import { defaultGroup } from '../../config/data'
import Field from '../../components/Field'
import Radiobuttons from '../../components/RadioButton'
import Textarea from '../../components/Textarea'

class EditGroup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDerived: false,
      group: defaultGroup,
      roles: [],
      error: null,
      errors: {}
    }

    this.reset = this.reset.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.changeField = this.changeField.bind(this)
  }

  componentDidMount() {
    getRoles({ limit: 1000 })
      .then(response => {
        const { data } = response
        const roles = data.map(role => ({ id: role.id, label: role.name }))
        this.setState({ roles })
      })
      .catch(error => console.log(error))
  }

  static getDerivedStateFromProps(props, state) {
    if (props.group !== state.group && !state.isDerived) {
      return { group: props.group, isDerived: true }
    }

    return null
  }

  reset() {
    const { group = defaultGroup } = this.props
    this.setState({ group, error: null, errors: {} })
  }

  onSubmit(event) {
    event.preventDefault()
    const { group } = this.state
    const { authUser } = this.props

    if (!group.customer && authUser.customer) {
      group.customer = authUser.customer.id
    }

    const promise = group.id ? updateGroup(group.id, group) : addGroup(group)
    promise
      .then(group => {
        NotificationManager.success('The group was created')
        this.props.onStore()
      })
      .catch(response => {
        this.setState({ error: response.message, errors: response.errors })
        NotificationManager.error(response.message)
      })
  }

  changeField(event) {
    const { group } = this.state
    const { name, value } = event.target
    const update = {
      ...group,
      [name]: value
    }

    this.setState({ group: update })
  }

  render() {
    const { group, roles, errors } = this.state

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
              error={errors.name}
              value={group.name || ''}
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
              value={group.description  || ''}
              error={errors.description}
              onChange={this.changeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Radiobuttons
              name="role"
              label="Role"
              options={roles}
              selected={group.role || ''}
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
  const { auth } = state
  const authUser = auth.user
  return {
    authUser,
    ...props
  }
}


export default connect(mapStateToProps)(EditGroup)
