import {
  SET_TOKEN,
  SET_AUTH,
  SET_AUTH_ROLE,
  TOGGLE_PROFILE_MODAL,
  LOGOUT
} from '../types'
import {
  checkToken
} from '../../extensions'
import {
  getAuthUser
} from '../../api/auth'

/**
 * Set Bearer Token
 *
 * @param {string} token
 */
export const setToken = token => ({ type: SET_TOKEN, payload: { token }})

/**
 * Set the authenticated user
 *
 * @param {object} user
 */
export const setAuth = user => ({ type: SET_AUTH, payload: { user }})

/**
 * Remove authenticated user
 *
 */
export const logout = ()  => ({ type: LOGOUT, payload: {} })

/**
 * Get & Set the authenticated user
 *
 * @param {string} token
 */
export const setAuthUser = (token) => {
  return dispatch => {
    if (checkToken(token)) {
      dispatch(setToken(token))
      return getAuthUser(token)
      .then(data => {
        const { user, role } = data
        dispatch(setAuth(user))
        dispatch(setUserRole(role))
      })
      .catch(error => console.log(error))
    } else {
      return Promise.resolve()
    }
  }
}

/**
 * Set the Authenticated User Role
 *
 * @param {object} role
 */
export const setUserRole = role => ({ type: SET_AUTH_ROLE, payload: { role }})

/**
 * Show the Profile Modal
 *
 * @param {boolean} show
 */
export const toggleProfileModal = show => ({ type: TOGGLE_PROFILE_MODAL, payload: { show } })
