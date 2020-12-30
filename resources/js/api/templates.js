import {
  axiosNode,
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'


/**
 * Get the list of templates
 *
 * @param {object} params
 */
export const getTemplates = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/templates',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get specific template
 *
 * @param {int} id
 */
export const getTemplate = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/templates/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Store a Template
 *
 * @param {object} data
 */
export const addTemplate = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/templates',
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Store a template
 *
 * @param {int} id
 * @param {object} data
 */
export const updateTemplate = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/templates/${id}`,
    data,
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove a Template
 *
 * @param {int} id
 */
export const removeTemplate = id => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/templates/${id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.error))
})

/**
 * Duplicate a template
 *
 * @param {int} id
 * @return {Object}
 */
export const duplicateTemplate = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/templates/${id}/duplicate`,
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get the list of fields of the template
 *
 * @param {int} id
 */
export const getTemplateFields = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/templates/${id}/fields`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get specific field from template
 *
 * @param {int} template_id
 * @param {int} field_id
 */
export const getTemplateField = (template_id, field_id) => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/templates/${template_id}/fields/${field_id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Attach a field to the template
 * @param {int} id
 * @param {object} data
 */
export const attachField = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/templates/${id}/fields`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Attach the template to a customer
 *
 * @param {int} template_id
 * @param {int} customer_id
 */
export const attachCustomer = (template_id, customer_id) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/templates/${template_id}/customers/${customer_id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Detach the customer from a template
 *
 * @param {int} template_id
 * @param {int} customer_id
 */
export const detachCustomer = (template_id, customer_id) => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/templates/${template_id}/customers/${customer_id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Attach a group to a template
 *
 * @param {int} template_id
 * @param {int} group_id
 */
export const attachGroup = (template_id, group_id) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/templates/${template_id}/groups/${group_id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Detach a group from the template
 *
 * @param {int} template_id
 * @param {int} group_id
 */
export const detachGroup = (template_id, group_id) => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/templates/${template_id}/groups/${group_id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Update the template field
 *
 * @param {int} template_id
 * @param {int} field_id
 * @param {object} data
 */
export const updateTemplateField = (template_id, field_id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/templates/${template_id}/fields/${field_id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Detach a field to the template
 * @param {int} id
 * @param {int} field
 */
export const detachField = (id, field) => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/templates/${id}/fields`,
    data: {
      field
    }
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Reorder fields
 *
 * @param {int} id
 * @param {object} data
 */
export const reOrderFields = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/templates/${id}/reorder_fields`,
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Parse from PDF fields to json
 *
 * @param {*} data
 */
export const pdfFieldsToJson = data => new Promise((resolve, reject) => {
  axiosNode({
    method: POST,
    url: `/templates/pdf-to-json/fields`,
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Attach fields that were retrieved from the pdf and save directly to the database
 *
 * @param {int} id
 * @param {object} data
 */
export const attachJsonFields = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/templates/${id}/attach-pdf-json-fields`,
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})
