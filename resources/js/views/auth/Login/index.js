import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import Field from '../../../components/Field'
import Checkbox from '../../../components/Checkbox'
import { setAuthUser } from '../../../state/actions'
import { login, setTokenInHeaders } from '../../../api/auth'
import { checkToken } from '../../../extensions'

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      email: null,
      password: null,
      keep30days: false,
      error: null,
      errors: {},
    }

    this.login = this.login.bind(this)
    this.validate = this.validate.bind(this)
    this.changeField = this.changeField.bind(this)
  }

  componentWillMount () {
    if (checkToken()) {
      this.props.history.push('/dashboard')
    }
  }

  login (event) {
    event.preventDefault()
    if (!this.validate()) {
      const { email, password, keep30days } = this.state
      login({email, password, keep30days})
        .then(token => {
          this.props.setAuthUser(token.access_token)
          setTokenInHeaders(token.access_token)
          .then(a => this.props.history.push('/dashboard'))
          .catch(error => console.log(error))
        })
        .catch(response => {
          const { error } = response
          this.setState({ error })
        })
    }
  }

  validate () {
    const { email, password } = this.state
    let errors = {}
    if (!email) {
      errors['email'] = 'The email is required'
    }

    if (!password) {
      errors['password'] = 'The password is Required'
    }

    this.setState({ errors })

    return errors.email || errors.password
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
              <div className="card-header">
                <h1>Sign In</h1>
              </div>

              <div className="card-body">
                <form className="container-fluid" onSubmit={this.login} autoComplete="off">
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
                        showLabel={false}
                        name="email"
                        placeholder="Email"
                        error={this.state.errors.email}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChange={this.changeField}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <Field
                        parentClass="input-group"
                        showLabel={false}
                        type="password"
                        name="password"
                        placeholder="Password"
                        error={this.state.errors.password}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onChange={this.changeField}
                      />
                    </div>
                  </div>

                  <div className="row">
                  <Checkbox
                    parentClass="input-group"
                    showLabel={true}
                    name="keep30days"
                    label="Remember me"
                    option={{ id: 'keep30days', label: 'Remember me'}}
                    selected={this.state.keep30days}
                    onChange={(target) => this.changeField({ target: { name: 'keep30days', value: target.checked }})}
                  />
                  </div>

                  <div className="row">
                    <div className="col d-flex justify-content-end">
                      <Link className="btn btn-link px-0 text-right mb-3" to="password">Forgot Password?</Link>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <button type="submit" className="btn btn-block btn-primary">Sign In</button>
                    </div>
                  </div>
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

const mapStateToProps = (state) => {
  const { user, token } = state.auth
  return {
    user,
    token,
  }
}

const mapDispatchToProps = {
  setAuthUser
}
export default connect(mapStateToProps, mapDispatchToProps)(Login)
