import React, { Component } from 'react'
import { connect } from 'react-redux'
import { logout } from '../../state/actions'
import { baseURL } from '../../config/api'

class Logout extends Component {
  constructor (props) {
    super(props)

    this.logout = this.logout.bind(this)
  }

  logout () {
    this.props.logout()
    window.location.href = baseURL
  }

  render () {
    return (
      <a className={this.props.className} href="javascript:void(0)" onClick={this.logout}>Logout</a>
    )
  }
}

const mapDispatchToProps = {
  logout,
}

export default connect(null, mapDispatchToProps)(Logout)
