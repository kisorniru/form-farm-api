/**
 * Get the initials
 *
 * @param {string} text
 * @return {string}
 */
export const initials = (text, max = null) => {
  const initials = text
    .replace(/[^a-zA-Z0-9]/g,'')
    .split(' ')
    .map(word => word.substr(0, 1))
    .join('')

  return max
    ? initials.slice(0, max)
    : initials
}

/**
 * Truncate a text
 *
 * @param {string} text
 * @param {int} length
 */
export const truncateString = (text, length, suffix = '...') => {
  return text.length > length
    ? `${text.substring(0, length)}${suffix}`
    : text
}

/**
 * Generate random String
 * @param {int} length
 */
export const randomString = (length = 12) => {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for ( var i = 0; i < length; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  }
  return result
}

/**
 * Remove white spaces at the beginning of a text
 *
 * @param {string} text
 * @return {string}
 */
export const trimStart = text => {
  return text.replace(/^\s+/g, '');
}
