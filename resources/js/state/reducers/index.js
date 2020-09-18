import { combineReducers } from 'redux'
import auth from './auth'
import document from './document'
import customer from './customer'
import template from './template'

const rootReducer = combineReducers({
  auth,
  document,
  customer,
  template,
})

export default rootReducer
