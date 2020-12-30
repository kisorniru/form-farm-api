import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'

/**
 * Get list of Customers
 *
 * @param {object} params
 */
export const getCustomers = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/customers',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get specific customer
 *
 * @param {int} id
 */
export const getCustomer = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/customers/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Insert new Customer
 *
 * @param {object} data
 */
export const addCustomer = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/customers`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update customer
 *
 * @param {int} id
 * @param {object} data
 */
export const updateCustomer = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/customers/${id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove Customer
 *
 * @param {int} id
 */
export const removeCustomer = id => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/customers/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove many Customers
 *
 * @param {object} data
 */
export const removeCustomers = data => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: '/customers',
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get customer intent
 *
 * @param {int} id
 */
export const getSetupIntent = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/customers/${id}/intent`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Add a payment method
 *
 * @param {int} id
 * @param {object} data
 */
export const addPaymentMethod = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/customers/${id}/payment-method`,
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove a payment method
 *
 * @param {int} id
 * @param {object} data
 */
export const removePaymentMethod = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/customers/${id}/payment-method`,
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get the subscription info
 *
 * @param {int} id
 */
export const getSubscriptionInfo = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/customers/${id}/subscriptions`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Add a subscription
 *
 * @param {int} id
 * @param {object} data
 */
export const subscribeToPlan = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/customers/${id}/subscribe`,
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})
