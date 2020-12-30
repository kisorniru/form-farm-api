import store from '../state/store'

/**
 * Check if the user can access to the route
 *
 * @param {string} pathname
 */
export const checkRole = (pathname = '') => {
  const { user, role } = store.getState().auth
  if (!user || !role) { // loading
    return true
  }

  const path = pathname.split('/')
  const method = path.includes('edit') || path.includes('new') ? 'edit' : 'view'

  if (path.includes('admin')) {
    return hasPrivilege('edit') && (hasAccess('everything'))
  }
  if (path.includes('settings')) {
    return hasPrivilege(method) && (hasAccess('everything') || hasAccess('settings'))
  }

  if (path.includes('documents')) {
    return hasPrivilege(method) && (hasAccess('everything') || hasAccess('documents'))
  }

  if (path.includes('customers')) {
    return hasPrivilege(method) && (hasAccess('everything') || hasAccess('customers'))
  }

  return true
}

/**
 * Validate if the user has Privilege
 *
 * @param {string} privilege
 * @return boolean
 */
export const hasPrivilege = privilege => {
  const role = store.getState().auth.role
  const privileges = role.privileges == 'edit' ? 'view, edit' : role.privileges
  return privileges ? privileges.includes(privilege) : false
}

/**
 * Validate if the user has Access
 *
 * @param {string} privilege
 * @return boolean
 */
export const hasAccess = access => {
  const role = store.getState().auth.role
  return role.access ? role.access.includes(access) : false
}
