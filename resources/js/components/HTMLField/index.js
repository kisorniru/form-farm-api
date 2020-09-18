import React from 'react'
import ReactHtmlParser from 'react-html-parser'

class HTMLField extends React.Component {
  render() {
    const {
      parentClass,
      showLabel,
      name,
      description,
    } = this.props

    return (
      <div className={parentClass}>
        {
          showLabel &&
          <label className={labelClasses} htmlFor={name}>{label || name}</label>
        }
        <div>
          {
            ReactHtmlParser(description)
          }
        </div>
      </div>
    )
  }
}

export default HTMLField
