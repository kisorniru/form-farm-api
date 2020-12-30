import {
  SET_DOCUMENT,
  EDIT_DOCUMENT,
  CLEAN_DOCUMENT_INFO,
} from '../types'

const initialState = {
  document: {},
}

export default  function (state = initialState, { type, payload }) {
  switch (type) {
    case SET_DOCUMENT:
      const { document } = payload
      return {
        ...state,
        ...(document.id ? { original: document } : {}),
        document
      }
    case EDIT_DOCUMENT:
      const { data } = payload
      return {
        ...state,
        document: { ...state.document, ...data }
      }
    case CLEAN_DOCUMENT_INFO:
      return initialState
    default:
      return state
  }
}
