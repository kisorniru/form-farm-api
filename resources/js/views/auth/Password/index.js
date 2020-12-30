import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../../../api/auth'
import Field from '../../../components/Field'


class Password extends Component {
  constructor(props) {
    super(props)

    this.state = {
      email: null,
      error: null,
      errors: {},
      message: null,
    }

    this.sendLink = this.sendLink.bind(this)
    this.validate = this.validate.bind(this)
    this.changeField = this.changeField.bind(this)
  }

  sendLink (event) {
    event.preventDefault()
    if (!this.validate()) {
      const { email } = this.state
      resetPassword(email)
        .then(message => {
          this.setState({ message })
        })
        .catch(response => {
          const { error } = response
          this.setState({ error })
        })
    }
  }

  validate () {
    const { email } = this.state
    let errors = {}
    if (!email) {
      errors['email'] = 'The email is required'
    }

    this.setState({ errors })

    return errors.email
  }

  changeField(event) {
    const { name, value } = event.target
    const state = {
      [name]: value
    }
    this.setState(state)
  }

  render () {
    return (
    <div className="auth">
      <div className="container">
        <div className="row">
          <div className="col-6 offset-3">
            <div className="card">
              <div className="card-header">Reset Password</div>

              <div className="card-body">
                <form className="container-fluid" onSubmit={this.sendLink} autoComplete="off">
                  {
                    this.state.error &&
                    <div className="row">
                      <div className="col">
                        <div className="alert alert-danger" role="alert">{this.state.error}</div>
                      </div>
                    </div>
                  }
                  <div className="row">
                    <div className="col">
                      <Field
                        parentClass="input-group"
                        showLabel={true}
                        name="email"
                        placeholder="Email"
                        error={this.state.errors.email}
                        onChange={this.changeField}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <Link className="btn btn-link px-0 mb-3" to="login">Remember now?</Link>
                    </div>
                  </div>

                  {
                    !this.state.message &&
                    <div className="row">
                      <div className="col">
                        <button type="submit" className="btn btn-block btn-primary">Send Reset Link</button>
                      </div>
                    </div>
                  }

                  {
                    this.state.message &&
                    <div className="row">
                      <div className="col">
                        <div className="alert alert-success" role="alert">{this.state.message}</div>
                      </div>
                    </div>
                  }
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default Password
