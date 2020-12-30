import {
  SET_CUSTOMER,
  EDIT_CUSTOMER,
  CLEAN_CUSTOMER_INFO,
  TOGGLE_CUSTOMER_MODAL
} from '../types'

const initialState = {
  showCustomerModal: false,
  customer: {}
}
export default function (state = initialState, { type, payload }) {
  switch (type) {
    case SET_CUSTOMER:
      const { customer } = payload
      return {
        ...state,
        ...(customer.id ? { original: customer } : {}),
        customer
      }
    case EDIT_CUSTOMER:
      const { data } = payload
      return { ...state,
        customer: { ...state.customer, ...data }
      }
    case CLEAN_CUSTOMER_INFO:
      return initialState
    case TOGGLE_CUSTOMER_MODAL:
      const { show } = payload
      return {
        ...state,
        showCustomerModal: show
      }
    default:
      return state
  }
}
