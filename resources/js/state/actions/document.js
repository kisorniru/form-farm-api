import {
  SET_DOCUMENT,
  EDIT_DOCUMENT,
  CLEAN_DOCUMENT_INFO,
} from '../types'
/**
 * Set document to state
 *
 * @param {object} document
 */
export const setDocument = document => ({ type: SET_DOCUMENT, payload: { document }})

/**
 * Update document in state
 *
 * @param {object} data
 */
export const editDocument = data => ({ type: EDIT_DOCUMENT, payload: { data }})

/**
 * Clean document in state
 *
 * @param {object} data
 */
export const cleanDocument = data => ({ type: CLEAN_DOCUMENT_INFO, payload: null })
