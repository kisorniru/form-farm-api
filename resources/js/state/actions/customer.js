import {
  SET_CUSTOMER,
  EDIT_CUSTOMER,
  CLEAN_CUSTOMER_INFO,
  TOGGLE_CUSTOMER_MODAL
} from '../types'

/**
 * Set customer to state
 *
 * @param {object} customer
 */
export const setCustomer = customer => ({ type: SET_CUSTOMER, payload: { customer }})

/**
 * Update customer in state
 *
 * @param {object} data
 */
export const editCustomer = (data) => ({ type: EDIT_CUSTOMER, payload: { data }})

/**
 * Toggle Customer modal
 *
 * @param {boolean} show
 */
export const toggleCustomerModal = show => ({ type: TOGGLE_CUSTOMER_MODAL, payload: { show } })

/**
 * Clean Customer in state
 *
 */
export const cleanCustomer = () => ({ type: CLEAN_CUSTOMER_INFO, payload: null })
