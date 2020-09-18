import React from 'react'

class Cell extends React.Component {
  render () {
    const { children, header, width, colspan, className } = this.props
    return header
      ? (<th className={className} colSpan={colspan && colspan} width={width && width} scope="col" onClick={this.props.onClick}>{children}</th>)
      : (<td className={className} colSpan={colspan && colspan} width={width && width} onClick={this.props.onClick}>{children}</td>)
  }
}

export default Cell
