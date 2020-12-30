import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Breadcrumbs extends Component {
  render () {
    const { items } = this.props

    return (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          {items.map((item, index) => (
            <li className={`breadcrumb-item ${item.active ? 'active' : ''}`} key={index}>
              {
                !item.active &&
                <Link to={item.url}>{item.name}</Link>
              }
              {
                item.active &&
                <span>{item.name}</span>
              }
            </li>
          ))}
        </ol>
      </nav>
    )
  }
}

export default Breadcrumbs
