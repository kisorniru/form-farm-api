import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'

/**
 * Get the list of groups
 *
 * @param {object} params
 */
export const getGroups = params => new Promise ((resolve, reject) => {
  axios({
    method: GET,
    url: '/groups',
    params,
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error))
})

/**
 * Get specific group
 *
 * @param {int} id
 */
export const getGroup = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/groups/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Store a group
 *
 * @param {object} data
 */
export const addGroup = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/groups',
    data,
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update a group
 *
 * @param {int} id
 * @param {object} data
 */
export const updateGroup = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/groups/${id}`,
    data,
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove group
 *
 * @param {int} id
 */
export const removeGroup = id => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/groups/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})
