import field_types from './field_types.json'
import templates_data from './templates_data.json'
import documents_data from './documents_data.json'

/**
 * Default Category object
 */
export const defaultCategory = {
  name: ''
}

/**
 * Default Group object
 */
export const defaultGroup = {
  name: '',
  description: ''
}

/**
 * Default plan object
 */
export const defaultPlan = {
  name: '',
  description: '',
  amount: 0,
  interval: 'day'
}

/**
 * Default Role object
 */
export const defaultRole = {
  name: '',
  description: '',
  access: 'edit',
  privileges: 'everything'
}

/**
 * Default User object
 */
export const defaultUser = {
  name: '',
  image: '',
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  password: '',
  company: ''
}

/**
 * Default Field object
 */
export const defaultField = {
  name: '',
  slug: '',
  type: 'text_field',
  details: '',
  placeholder: '',
  metadata: '',
  categories: [],
  required: false
}

/**
 * Default Customer object
 */
export const defaultCustomer = {
  initials: '',
  name: '',
  email: '',
  header: '',
  footer: '',
  icon: ''
}

/**
 * Default Field Types
 */
export const fieldTypes = field_types

/**
 * Default Template Data
 */
export const defaultTemplate = templates_data

/**
 * Default Document Data
 */
export const defaultDocument = documents_data
