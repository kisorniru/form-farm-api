import {
  SET_TEMPLATE,
  EDIT_TEMPLATE,
  CLEAN_TEMPLATE_INFO,
} from '../types'

/**
 * Set template to state
 *
 * @param {object} template
 */
export const setTemplate = template => ({ type: SET_TEMPLATE, payload: { template }})

/**
 * Update template in state
 *
 * @param {object} data
 */
export const editTemplate = data => ({ type: EDIT_TEMPLATE, payload: { data }})

/**
 * Clean Template in state
 */
export const cleanTemplate = () => ({ type: CLEAN_TEMPLATE_INFO, payload: null })
