import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocuments } from '../../api/documents'
import { getActivity } from '../../api/activity'
import Table from '../../components/Table'

class Dashboard extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      documents: [],
      activity: []
    }
  }

  componentDidMount () {
    this._isMounted = true

    getActivity({ 'sort-by': 'created_at', sort: 'DESC', limit: 10 })
    .then(response => {
      if (this._isMounted) {
        this.setState({ activity: response })
      }
    })
    .catch(error => console.log(error))

    getDocuments({ 'sort-by': 'updated_at', sort: 'DESC', limit: 10 })
    .then(response => {
      if (this._isMounted) {
        this.setState({ documents: response.data })
      }
    })
    .catch(error => console.log(error))
  }

  render () {
    const { user } = this.props
    const { documents, activity } = this.state

    return (
      <div>
        {
          user &&
          <h1 className="text-center">Welcome, {user.name}</h1>
        }

        <div className="container-fluid mt-4 pt-4">
          <div className="row">
            <div className="col-md-6">
              <h3 className="block-title">Latest Activity</h3>
              <Table
                headers={{ subject: 'Name', description: 'Action', user: 'User' }}
                data={activity}
                onRowClick={(id) => console.log(id) }
              />
            </div>
            <div className="col-md-6">
              <h3 className="block-title">Latest Documents</h3>
              <Table
                headers={{ name: 'Name', created_at: 'Created', updated_at: 'Updated' }}
                data={documents}
                onRowClick={(id) => this.props.history.push(`/dashboard/documents/${id}/edit`) }
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { token, user } = state.auth
  return {
    token,
    user,
  }
}

export default connect(mapStateToProps)(Dashboard)
