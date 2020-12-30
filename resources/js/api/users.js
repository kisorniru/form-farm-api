import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'


/**
 * Get the list of users
 *
 * @param {object} params
 */
export const getUsers = params => new Promise ((resolve, reject) => {
  axios({
    method: GET,
    url: '/users',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error))
})

/**
 * Get specific user
 *
 * @param {int} id
 */
export const getUser = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/users/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Store a user
 *
 * @param {object} data
 */
export const addUser = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/users',
    data,
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update a user
 *
 * @param {int} id
 * @param {object} data
 */
export const updateUser = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/users/${id}`,
    data,
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove a user
 *
 * @param {object} id
 */
export const removeUser = id => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/users/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})
