import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import {
  connect,
} from 'react-redux'
import {
  toggleProfileModal,
} from './state/actions'
import Header from './components/Header'
import Modal from './components/Modal'
import Login from './views/auth/Login'
import Password from './views/auth/Password'
import Profile from './views/Users/Profile'
import Dashboard from './views/Dashboard'
import Categories from './views/Categories'
import Fields from './views/Fields'
import Documents from './views/Documents'
import Document from './views/Documents/Document'
import Templates from './views/Templates'
import Template from './views/Templates/Template'
import Customers from './views/Customers'
import Customer from './views/Customers/Customer'
import SubmissionPreview from './views/Submission/preview'
import Plans from './views/Plans'
import Roles from './views/Roles'
import ProtectedRoute from './components/ProtectedRoute'
import NoMatchRoute from './views/NoMatchRoute'
import NotAllowed from './views/NotAllowed'

const Routing = props => {
  const { auth } = props

  return (
    <Router>
      <Header />

      <div id="content">
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/password" component={Password} />

          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <ProtectedRoute exact path="/dashboard/settings/fields" component={Fields} />

          <ProtectedRoute exact path="/dashboard/settings/templates" component={Templates} />
          <ProtectedRoute exact path="/dashboard/settings/templates/new" component={Template} />
          <ProtectedRoute exact path="/dashboard/settings/templates/:template/edit" component={Template} />

          <ProtectedRoute exact path="/dashboard/documents" component={Documents} />
          <ProtectedRoute exact path="/dashboard/documents/new" component={Document} />
        <ProtectedRoute exact path="/dashboard/documents/:document/edit" component={Document} />

          <ProtectedRoute exact path="/dashboard/customers" component={Customers} />
          <ProtectedRoute exact path="/dashboard/customers/:customer" component={Customer} />
          <ProtectedRoute exact path="/dashboard/customers/:customer/submissions/:document" component={SubmissionPreview} />

          <ProtectedRoute exact path="/admin/plans" component={Plans} />
          <ProtectedRoute exact path="/admin/settings/categories" component={Categories} />
          <ProtectedRoute exact path="/admin/settings/roles" component={Roles} />

          <Route exact path="/not-allowed" component={NotAllowed} />
          <Route component={NoMatchRoute} />
        </Switch>
      </div>

      {
        auth.showProfileModal &&
        <Modal title={`Edit Profile`} show={auth.showProfileModal} onClose={() => props.toggleProfileModal(false)}>
          <Profile />
        </Modal>
      }
    </Router>
  )
}

const mapStateToProps = (state, props) => {
  return {
    ...state,
    ...props
  }
}

const mapDispatchToProps = {
  toggleProfileModal,
}


export default connect(mapStateToProps, mapDispatchToProps)(Routing)
