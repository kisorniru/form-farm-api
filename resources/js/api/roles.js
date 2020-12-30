import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'

/**
 * Get the list of roles
 *
 * @param {object} params
 */
export const getRoles = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/roles',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get specific role
 *
 * @param {int} id
 */
export const getRole = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/roles/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Create role
 *
 * @param {object} data
 */
export const createRole = data => new Promise((resolve,reject) => {
  axios({
    method: POST,
    url: '/roles',
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update role
 *
 * @param {int} id
 * @param {object} data
 */
export const updateRole = (id, data) => new Promise((resolve,reject) => {
  axios({
    method: PUT,
    url: `/roles/${id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove role
 *
 * @param {int} id
 */
export const removeRole = id => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/roles/${id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})
