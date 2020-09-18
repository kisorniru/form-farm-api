import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { setAuth, toggleProfileModal } from '../../state/actions'
import { updateUser } from '../../api/users'
import Field from '../../components/Field'
import FileUploader from '../../components/FileUploader'

class Profile extends React.Component {
  constructor(props) {
    super(props)


    this.state = {
      isDerived: false,
      user: {},
      error: null,
      errors: {}
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.changeField = this.changeField.bind(this)
    this.changePicture = this.changePicture.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.authUser !== state.user && !state.isDerived) {
      return { user: props.authUser, isDerived: true }
    }

    return null
  }

  onSubmit(event) {
    event.preventDefault()
    const { user } = this.state

    if (user.group) {
      delete user.group
    }

    updateUser(user.id, user)
      .then(user => {
        this.props.setAuth(user)
        this.props.toggleProfileModal(false)
        NotificationManager.success(`the user ${user.name} was updated successfully`)
      })
      .catch(response => this.setState({ ...response }))
  }

  changeField(event) {
    const { name, value } = event.target
    const user = {
      ...this.state.user,
      [name]: value
    }

    this.setState({ user })
  }

  changePicture(base64) {
    const user = {
      ...this.state.user,
      new_image: base64,
      image: base64,
    }

    this.setState({ user })
  }

  render() {
    const { key, user, errors } = this.state

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="py-4">
              <form className="container-fluid" onSubmit={this.onSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-md-12">
                    <FileUploader
                      addKey={key}
                      parentClass="file-uploader"
                      showLabel={true}
                      name="new_image"
                      label="Photo"
                      placeholder="...Select File"
                      error={errors.new_image}
                      onChange={this.changePicture}
                    />
                  </div>

                  <div className="col-md-12">
                    <img className="img-fluid" src={user.image} />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      parentClass="input-user"
                      showLabel={true}
                      name="first_name"
                      label="First Name"
                      placeholder="First Name"
                      error={errors.first_name}
                      defaultValue={user.first_name}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      parentClass="input-user"
                      showLabel={true}
                      name="last_name"
                      label="Last Name"
                      placeholder="Last Name"
                      error={errors.last_name}
                      defaultValue={user.last_name}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      parentClass="input-user"
                      showLabel={true}
                      name="email"
                      label="Email"
                      placeholder="Email"
                      error={errors.email}
                      readOnly={true}
                      defaultValue={user.email}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      parentClass="input-user"
                      showLabel={true}
                      name="phone_number"
                      label="Phone Number"
                      placeholder="(433) 234-2342"
                      error={errors.phone_number}
                      defaultValue={user.phone_number}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      parentClass="input-user"
                      showLabel={true}
                      name="company"
                      label="Company"
                      placeholder="Company"
                      error={errors.company}
                      defaultValue={user.company}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      type="password"
                      parentClass="input-user"
                      showLabel={true}
                      name="old_password"
                      label="Old Password"
                      placeholder="Password"
                      error={errors.old_password}
                      defaultValue={null}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      type="password"
                      parentClass="input-user"
                      showLabel={true}
                      name="new_password"
                      label="New Password"
                      placeholder="Password"
                      error={errors.new_password}
                      defaultValue={null}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <Field
                      addKey={key}
                      type="password"
                      parentClass="input-user"
                      showLabel={true}
                      name="password_repeat"
                      label="Repeat Password"
                      placeholder="Password"
                      error={errors.password_repeat}
                      defaultValue={null}
                      onChange={this.changeField}
                    />
                  </div>
                </div>

                <div className="row justify-content-end footer-modal">
                  <div className="col-md-3">
                    <button type="reset" onClick={this.reset} className="btn btn-block btn-link">Reset</button>
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-block btn-primary">Save</button>
                  </div>

                  <div className="col-md-12"></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
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

const mapDispatchToProps = {
  setAuth,
  toggleProfileModal,
}


export default connect(mapStateToProps, mapDispatchToProps)(Profile)
