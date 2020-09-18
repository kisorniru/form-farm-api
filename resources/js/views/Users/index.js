import React from 'react'
import { parse, stringify } from 'query-string'
import { NotificationManager } from 'react-notifications'
import { hasAccess, hasPrivilege } from '../../extensions'
import { defaultUser } from '../../config/data'
import { getUsers } from '../../api/users'
import Filters from '../../components/Filters'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Pagination from 'react-js-pagination'
import EditUser from './edit'
import UserFilters from './Filters'


class Users extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showModal: false,
      user: defaultUser,
      total: 0,
      page: 1,
      users: [],
      filters: {},
      headers: {
        first_name: 'First Name',
        last_name: 'Last Name',
        email: 'Email',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.onCreateUser = this.onCreateUser.bind(this)
    this.onSelectUser = this.onSelectUser.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
  }

  onCreateUser() {
    if (hasAccess('everything') && hasPrivilege('edit')) {
      this.setState({ user: defaultUser }, this.openModal)
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onSelectUser (id) {
    if (hasAccess('everything') && hasPrivilege('edit')) {
      const user = this.state.users.find(user => user.id === id)
      console.log(user)
      this.setState({ user }, this.openModal)
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  componentWillMount () {
    if (this.props.location.search.length > 0) {
      const filters = parse(this.props.location.search)
      this.setState({ filters }, this.loadData)
    } else {
      this.loadData()
    }
  }

  applyFilters (name, value) {
    const filters = {
      ...this.state.filters,
      [name]: value
    }

    if (name !== 'page') {
      filters.page = 1
    }

    if (value.length == 0) {
      delete filters[name]
    }

    this.setState({ filters }, () => {
      this.props.history.push({
        pathname: this.props.history.location.pathname,
        search: `?${stringify(this.state.filters)}`
      })

      this.loadData()
    })
  }

  loadData () {
    getUsers(this.state.filters)
      .then(data => {
        this.setState({
          total: data.meta.total,
          page: data.meta.current_page,
          users: data.data
        })
      })
      .catch(console.error)
  }

  reset () {
    this.setState({ page: 1, total: 1, filters: {} }, () => {
      this.props.history.push({
        pathname: this.props.history.location.pathname,
        search: '',
      })

      this.loadData()
    })
  }

  openModal() {
    this.setState({ showModal: true })
  }

  closeModal() {
    this.setState({ showModal: false, user: defaultUser }, this.loadData)
  }

  render () {
    const { users, user, headers, filters, showModal } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Users</h1>
          </div>
          {
            hasAccess('everything') && hasPrivilege('edit') &&
            <div className="col-2 d-flex justify-content-end">
              <a href="javascript:void(0)" className="btn btn-block btn-primary" onClick={this.onCreateUser}>New</a>
            </div>
          }
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
              <UserFilters onChangeFilter={this.applyFilters} filters={filters} />
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <Table headers={headers} data={users} onRowClick={this.onSelectUser}/>
          </div>
        </div>
        {
          this.state.total > 0 &&
          <div className="row mt-4">
            <div className="col">
              <Pagination
                hideFirstLastPages
                prevPageText='⟨'
                nextPageText='⟩'
                itemClass="page-item"
                linkClass="page-link"
                activePage={this.state.page}
                itemsCountPerPage={10}
                totalItemsCount={this.state.total}
                pageRangeDisplayed={5}
                onChange={(page) => this.applyFilters('page', page)}
              />
            </div>
          </div>
        }

        {
          showModal &&
          <Modal title={!user.id ? 'Create User' : 'Edit User'} show={showModal} onClose={this.closeModal}>
            <EditUser user={user} onStore={this.closeModal} onCancel={this.closeModal} />
          </Modal>
        }
      </div>
    )
  }
}

export default Users
