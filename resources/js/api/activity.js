import {
  axios,
  GET,
} from '../config/api'

/**
 * Get the list of latest activity
 *
 * @param {object} params
 */
export const getActivity = params => new Promise((resolve, reject) => {
  axios({
    method: GET,
    url: '/activity',
    params
  })
    .then(response => resolve(response.data))
    .catch(error => reject(error.response.data))
})
