import React from 'react'
import { Link } from 'react-router-dom'

class NotAllowed extends React.Component {
  render() {
    return (
      <div className="page-404">
        <h1>403</h1>
        <h2>Page not allowed</h2>
        <p>Looks like you cannot access to this page.</p>
        <Link className="btn btn-primary" to="/dashboard">Go to Dashboard</Link>
      </div>
    )
  }
}

export default NotAllowed
