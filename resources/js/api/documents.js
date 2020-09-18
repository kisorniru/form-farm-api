import {
  axios,
  GET,
  POST,
  PUT,
  DELETE,
} from '../config/api'

/**
 * Get the list of documents
 *
 * @param {object} params
 * @return {Promise}
 */
export const getDocuments = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/documents',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get the list of submissions
 *
 * @param {object} params
 * @return {Promise}
 */
export const getSubmissions = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/submissions',
    params
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get document
 *
 * @param {int} id
 * @return {Promise}
 */
export const getDocument = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/documents/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get document fields
 *
 * @param {int} id
 */
export const getDocumentFields = id => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/documents/${id}/fields`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Get document fields
 *
 * @param {int} document_id
 * @param {int} field_id
 */
export const getDocumentField = (document_id, field_id) => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: `/documents/${document_id}/fields/${field_id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Duplicate a document
 *
 * @param {int} id
 */
export const duplicateDocument = id => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/documents/${id}/duplicate`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Store new document
 *
 * @param {object} data
 * @return {Promise}
 */
export const addDocument = data => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: '/documents',
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * update document
 *
 * @param {int} id
 * @param {object} data
 * @return {Promise}
 */
export const updateDocument = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: PUT,
    url: `/documents/${id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove a document
 *
 * @param {int} id
 */
export const removeDocument = id => new Promise ((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/documents/${id}`
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Insert field to document
 *
 * @param {int} id
 * @param {object} field
 * @return {Promise}
 */
export const insertFieldToDocument = (id, data) => new Promise ((resolve, reject) => {
  axios({
    method: POST,
    url: `/documents/${id}/fields`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Sync fields to document
 *
 * @param {int} id
 * @param {object} data
 * @return {Promise}
 */
export const syncFieldsToDocument = (id, data) => new Promise ((resolve, reject) => {
  axios({
    method: POST,
    url: `/documents/${id}/fields/sync`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * update field in document
 *
 * @param {int} document_id
 * @param {int} field_id
 * @param {object} data
 * @return {Promise}
 */
export const updateDocumentField = (document_id, field_id, data) => new Promise ((resolve, reject) => {
  axios({
    method: PUT,
    url: `/documents/${document_id}/fields/${field_id}`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * update multiple fields
 *
 * @param {int} id
 * @param {any} data
 */
export const updateMultipleFields = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/documents/${id}/fields/updates`,
    data
  })
  .then(response => response.data)
  .then(data => resolve(data.data))
  .catch(error => reject(error.response.data))
})

/**
 * Remove Document Field
 *
 * @param {int} document_id
 * @param {int} field_id
 */
export const removeDocumentField = (document_id, field_id) => new Promise((resolve, reject) => {
  axios({
    method: DELETE,
    url: `/documents/${document_id}/fields/${field_id}`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Restore disabled field
 *
 * @param {int} document_id
 * @param {int} field_id
 */
export const restoreDocumentField = (document_id, field_id) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/documents/${document_id}/fields/${field_id}/restore`
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})

/**
 * Attach PDF Json Fields to Document
 *
 * @param {int} document_id
 * @param {objec} data
 */
export const attachJsonFields = (document_id, data) => new Promise((resolve, reject) => {
  axios({
    method: POST,
    url: `/documents/${document_id}/attach-pdf-json-fields`,
    data
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
export const reOrderFieldsInDocument = (id, data) => new Promise((resolve, reject) => {
  axios({
    method: methods.post,
    url: `/documents/${id}/reorder_fields`,
    data
  })
  .then(response => resolve(response.data))
  .catch(error => reject(error.response.data))
})
