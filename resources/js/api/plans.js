import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'

/**
 * Get the list of Plans
 *
 * @param {object} params
 */
export const getPlans = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/plans',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get specific plan
 *
 * @param {int} id
 */
export const getPlan = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/plans/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Store a plan
 *
 * @param {object} data
 */
export const addPlan = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/plans',
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update a plan
 *
 * @param {int} id
 * @param {object} data
 */
export const updatePlan = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/plans/${id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * remove a plan
 *
 * @param {int} id
 */
export const removePlan = id => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/plans/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})
