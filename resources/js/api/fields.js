import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'

/**
 * Get a list of fields
 *
 * @param {object} params
 */
export const getFields = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/fields',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get specific Field
 * @param {int} id
 */
export const getField = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/fields/${id}`,
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Insert a Field
 *
 * @param {object} data
 */
export const addField = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/fields',
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update a Field
 *
 * @param {int} id
 * @param {object} data
 */
export const updateField = (id, data) => new Promise ((resolve, reject) => {
  axios({
    method: PUT,
    url: `/fields/${id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove a Field
 *
 * @param {int} id
 */
export const removeField = id => new Promise ((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/fields/${id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})
