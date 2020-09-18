import React from 'react'
import store from '../../state/store'
import { Route, Redirect } from 'react-router-dom'
import { checkToken, checkRole } from '../../extensions'
import { logout } from '../../state/actions'

const renderComponent = ({component: Component, props}) => {
  if (checkToken()) {
    const hasAccesss = checkRole(props.location.pathname)
    if (hasAccesss) {
      return ( <Component {...props} /> )
    } else {
      return ( <Redirect to={{ pathname: '/dashboard' }} /> )
    }
  } else {
    store.dispatch(logout())
    return ( <Redirect to={{ pathname: '/login' }} /> )
  }
}

const ProtectedRoute = ({ component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => renderComponent({ component, props })}
    />
  )
}

export default ProtectedRoute
