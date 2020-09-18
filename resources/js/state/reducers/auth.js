import {
  SET_TOKEN,
  SET_AUTH,
  SET_AUTH_ROLE,
  TOGGLE_PROFILE_MODAL,
  LOGOUT
} from '../types'

const initialState = {
  showProfileModal: false,
  token: null,
  role: {},
  user: {}
}

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case SET_AUTH_ROLE:
      return {
        ...state,
        role: payload.role
      }
    case SET_TOKEN:
      return {
        ...state,
        token: payload.token
      }
    case SET_AUTH:
      return {
        ...state,
        user: payload.user,
      }
    case TOGGLE_PROFILE_MODAL:
      return {
        ...state,
        showProfileModal: payload.show
      }
    case LOGOUT:
      localStorage.removeItem('token')
      return {
        token: null,
        role: {},
        user: {}
      }
    default:
      return state
  }
}
