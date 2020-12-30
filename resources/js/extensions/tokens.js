import store from '../state/store'

/**
 * check if the token is a valid token
 *
 * @param {string} token
 * @return {boolean}
 */
export const checkToken = (token = null) => {
  token = token ? token : store.getState().auth.token
  return validateToken(token)
}

/**
 * Validate if a token is expired or not
 *
 * @param {string} token
 * @return {boolean}
 */
const validateToken = (token) => {
  if (token) {
    const info = parseToken(token)
    const today = Math.floor(new Date().valueOf() / 1000)
    if (info.exp > today && today >= info.nbf ) {
      return true;
    } else {
      return false;
    }
  }
  return false
}

/**
 * Convert a jwt token to json object
 *
 * @param {string} token
 * @return {json}
 */
const parseToken = (token) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g,  '/')
  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
  return JSON.parse(jsonPayload);
}
