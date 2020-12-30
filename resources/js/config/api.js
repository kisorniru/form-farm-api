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
// export const baseURL = 'http://form-builder.localdev' // Development
// export const baseURL = 'https://formfarmapi.amp.build' // Production
export const baseURL = 'http://127.0.0.1:8000' // Local
// export const baseURL = 'https://form-farm-api.local' // Local

/**
 * String with the environment NODE API URL
 * @var baseNodeURL
 */
// export const baseNodeURL = `https://formfarmpdf.amp.build`
// export const baseNodeURL = `http://localhost:3000`
// export const baseNodeURL = `https://form-farm-api.local`
export const baseNodeURL = `http://127.0.0.1:8000`

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
