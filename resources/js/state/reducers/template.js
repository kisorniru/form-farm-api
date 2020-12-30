import {
  SET_TEMPLATE,
  EDIT_TEMPLATE,
  CLEAN_TEMPLATE_INFO,
} from '../types'

const initialState = {
  template: {},
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case SET_TEMPLATE:
      const { template } = payload
      return {
        ...state,
        ...(template.id ? { original: template } : {}),
        template
      }
    case EDIT_TEMPLATE:
      const { data } = payload
      return {
        ...state,
        template: { ...state.template, ...data }
      }
    case CLEAN_TEMPLATE_INFO:
      return initialState
    default:
      return state
  }
}
