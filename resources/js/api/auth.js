import {
  axios,
  GET,
  POST,
} from '../config/api'

/**
 * Do the registration for the users
 * @param {object} data
 */
export const register = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/auth/regiter',
    data,
  })
    .then(response => response.data)
    .then(data => resolve(data))
    .catch(error => reject(error.response.data))
})

/**
 * Do the login for the given User
 *
 * @param {object} data
 * @return {Promise}
 */
export const login = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/auth/login',
    data,
  })
    .then(response => resolve(response.data))
    .catch(error => reject(error.response.data))
})

/**
 * Do the Logout for the given User
 *
 * @param {string} token
 * @return {Promise}
 */
export const logout = token => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/auth/logout',
    headers: {
      authorization: `Bearer ${token}`
    }
  })
    .then(response => response.data)
    .then(data => resolve(data.data))
    .catch(error => reject(error.response.data))
})

/**
 * Refresh expired token
 *
 * @param {string} token
 * @return {Promise}
 */
export const refreshToken = token => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/auth/refresh',
    headers: {
      authorization: `Bearer ${token}`
    }
  })
    .then(response => response.data)
    .then(data => resolve(data.data))
    .catch(error => reject(error.response.data))
})

/**
 * Reset User Password
 *
 * @param {string} email
 * @return {Promise}
 */
export const resetPassword = email => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/auth/password',
    data: {
      email,
    }
  })
    .then(response => response.data)
    .then(data => resolve(data.message))
    .catch(error => reject(error.response.data))
})

/**
 * Get the current user
 *
 * @param {string} token
 * @return {Promise}
 */
export const getAuthUser = token => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/auth/me',
    headers: {
      authorization: `Bearer ${token}`
    }
  })
    .then(response => resolve(response.data))
    .catch(error => reject(error.response.data))
})

/**
 * Set Api token to Local Storage & headers
 *
 * @param {string} token
 * @return
 */
export const setTokenInHeaders = (token) => new Promise((resolve, reject) => {
  try {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('token', token)
    resolve(true)
  } catch (error) {
    reject(error)
  }
})

/**
 * Remove token from localstorage & headers
 *
 */
export const removeTokenFromHeaders = () => {
  delete axios.defaults.headers.common.authorization
  localStorage.removeItem('token')
}
