import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  checkToken,
  checkRole,
} from '../../extensions'
import {
  toggleProfileModal,
} from '../../state/actions'
import Logout from '../../components/Logout'
import UserIcon from '../../Icons/UserIcon'

class Header extends React.Component {
  constructor (props) {
    super(props)

    this.renderLinks = this.renderLinks.bind(this)
  }

  renderLinks () {
    return (
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
        </li>
        {
          checkRole('/dashboard/documents') &&
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard/documents">Documents</Link>
          </li>
        }
        {
          checkRole('/dashboard/customers') &&
          <li className="nav-item"><Link className="nav-link" to="/dashboard/customers">Customers</Link></li>
        }
        {
          checkRole('/settings') &&
          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="settings-dropdown-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Settings
            </a>
              <ul className="dropdown-menu" aria-labelledby="settings-dropdown-menu">
                <li className="nav-item"><Link className="nav-link" to="/dashboard/settings/fields">Fields</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/dashboard/settings/templates">Templates</Link></li>
                {
                  checkRole('/admin') &&
                  <li className="nav-item"><Link className="nav-link" to="/admin/settings/categories">Field Category</Link></li>
                }
                <div className="dropdown-divider"></div>
                {
                  checkRole('/admin') &&
                  <li className="nav-item"><Link className="nav-link" to="/admin/plans">Billing Plans</Link></li>
                }
                {
                  checkRole('/admin') &&
                  <li className="nav-item"><Link className="nav-link" to="/admin/settings/roles">Roles</Link></li>
                }
              </ul>
          </li>
        }
      </ul>
    )
  }

  render () {
    const { user } = this.props
    return (
      <nav className={`navbar fixed-top navbar-expand-lg ${typeof user.id !== 'undefined' ? 'active' : '' }`}>
        <Link className="navbar-brand" to="/">FormFarm</Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#user-dropdown" aria-controls="user-dropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        {
        (checkToken() === true) &&
        <div className="collapse navbar-collapse" id="user-dropdown">
          {
            this.renderLinks()
          }
          <ul className="navbar-nav ml-auto">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="user-dropdown-menu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span className="icon-user"><UserIcon /></span>
                {user.email}
              </a>
              <div className="dropdown-menu" aria-labelledby="user-dropdown-menu">
                <button className="dropdown-item" onClick={() => this.props.toggleProfileModal(true)}>My Profile</button>
                <Logout className="dropdown-item" />
              </div>
            </li>
          </ul>
        </div>
        }


      </nav>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { auth } = state
  return {
    ...auth,
    ...props,
  }
}

const mapDispatchToProps = {
  toggleProfileModal,
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
