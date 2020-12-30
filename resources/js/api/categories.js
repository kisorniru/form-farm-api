import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'

/**
 * Get list of Categories
 *
 * @param {object} params
 */
export const getCategories = (params) => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/categories',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get specific category
 *
 * @param {int} id
 */
export const getCategory = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/categories/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get Category fields
 *
 * @param {int} id
 */
export const getCategoryFields = id => new Promise ((resolve, reject) => {
  axios({
    method: GET,
    url: `/categories/${id}/fields`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Insert new Category
 *
 * @param {object} data
 */
export const addCategory = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/categories`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update category
 *
 * @param {int} id
 * @param {object} data
 */
export const updateCategory = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/categories/${id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove Category
 *
 * @param {int} id
 */
export const removeCategory = id => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    put: `/categories/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})
