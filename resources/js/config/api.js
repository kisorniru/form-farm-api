import Axios from 'axios'


/**
 * Axios available methods
 *
 */
export const GET = 'GET'
export const POST = 'POST'
export const PUT = 'PUT'
export const DELETE = 'DELETE'


/**
 * token string
 * @var token
 */
const token = localStorage.getItem('token')

/**
 * String with the environment API URL
 * @var baseURL
 */
export const baseURL = 'http://form-builder.localdev' // Development
// export const baseURL = 'https://formfarmapi.amp.build' // Production

/**
 * String with the environment NODE API URL
 * @var baseNodeURL
 */
// export const baseNodeURL = `https://formfarmpdf.amp.build`
export const baseNodeURL = `http://localhost:3000`

/**
 * default header settings
 * @var headers
 */
const headers = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  ["authorization"]: `Bearer ${token}`
}

/**
 * Axios instance with default Attributes
 * @var axios
 */
export const axios = Axios.create({
  headers,
  baseURL: `${baseURL}/api`
})

/**
 * Axios Node API instance with default Attributes
 * @var axiosNode
 */
export const axiosNode = Axios.create({
  headers,
  baseURL: `${baseNodeURL}/api`
})
