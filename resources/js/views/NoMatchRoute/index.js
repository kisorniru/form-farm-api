import React from 'react'
import { Link } from 'react-router-dom'

class NoMatchRoute extends React.Component {
  render() {
    return (
      <div className="page-404">
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>Looks like the page you were looking for doesn't exist.</p>
        <Link className="btn btn-primary" to="/dashboard">Go to Dashboard</Link>
      </div>
    )
  }
}

export default NoMatchRoute
