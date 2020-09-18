/**
 * Add hover feature to react pdf fields
 *
 * @param {string} color
 */
export const addInputHoverFeature = (bgColor = '#c7d775') => {
  const pdfFieldSelectors = '.react-pdf__Page__annotations input, .react-pdf__Page__annotations textarea'

  // waiting until the pdf has been loaded
  setTimeout(() => {
    document.querySelectorAll(pdfFieldSelectors).forEach(input => {
      input.addEventListener('mouseenter', ({ target }) => {
        const field = document.querySelector(`[data-slug="${target.name}"]`)
        if (field) field.style.background = bgColor
      })

      input.addEventListener('mouseleave', ({ target }) => {
        const field = document.querySelector(`[data-slug="${target.name}"]`)
        if (field) field.removeAttribute('style')
      })
    })
  }, 4000);
}
