/**
 * Default editor settings
 */
export const editorSettings = {
  options: [
    'inline',
    'blockType',
    'fontSize',
    'fontFamily',
    'list',
    'textAlign',
    'link',
    'image',
    'remove',
    'history'
  ]
}

/**
 * Custom settings for Information fields
 */
export const infoSettings = {
  options: [
    'inline',
    'list'
  ],
  inline: {
    inDropdown: false,
    options: ['bold', 'italic', 'underline'],
  },
  list: {
    inDropdown: false,
    options: ['unordered', 'ordered'],
  }
}
