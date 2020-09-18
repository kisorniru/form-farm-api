/**
 * async foreach
 *
 * @param {array} array
 * @param {function} callback
 */
export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/**
 * get a list of ids
 *
 * @param {array} data
 * @return {string}
 */
export const obtainIds = data => {
  let ids = []
  data.forEach(item => ids.push(item.id))
  return ids
}

/**
 * Parse & group fields that comes from pdf file
 *
 * @param {any} fields
 */
export const parsePdfFields = fields => {
  const options = [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]
  const data = []

  fields.map((field, index) => {
    if (field.type == 'box') field.metadata = JSON.stringify({ options })
    data.push({ ...field, position: index + 1 })
  })

  return data
}
