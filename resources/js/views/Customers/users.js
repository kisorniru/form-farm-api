import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { getUsers, removeUser } from '../../api/users'
import { hasPrivilege } from '../../extensions'
import Checkbox from '../../components/Checkbox'
import Filters from '../../components/Filters'
import Modal from '../../components/Modal'
import Pagination from 'react-js-pagination'
import UserFilters from '../Users/Filters'
import EditUser from '../Users/edit'
import { defaultUser } from '../../config/data'

class CustomerUsers extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showUserModal: false,
      selectedUser: defaultUser,
      total: 0,
      page: 1,
      users: [],
      hasUserSelection: false,
      selectedUsers: '',
      filters: {
        limit: 5,
        page: 1,
        customer: 0,
        search: null,
      },
      headers: {
        name: 'Name',
        email: 'Email',
        group: 'Group',
        created_at: 'Created',
        updated_at: 'Updated'
      }
    }

    this.onCreateUser = this.onCreateUser.bind(this)
    this.loadUsers = this.loadUsers.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.changePage = this.changePage.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.onSelectUser = this.onSelectUser.bind(this)
    this.onMassUserSelect = this.onMassUserSelect.bind(this)
    this.onMassUserDelete = this.onMassUserDelete.bind(this)
    this.renderTableHeader = this.renderTableHeader.bind(this)
    this.renderTableBody = this.renderTableBody.bind(this)
    this.renderTableRow = this.renderTableRow.bind(this)
  }

  static getDerivedStateFromProps(nextProps, state) {
    if (nextProps.customer) {
      let additinalInfo = {
        selectedUser: {
          ...defaultUser,
          customer: nextProps.customer.id,
        },
        showUserModal: nextProps.toggleModal
      }
      return {
        ...(nextProps.toggleModal ? additinalInfo : {}),
        filters: {
          ...state.filters,
          customer: nextProps.customer.id,
        }
      }
    }

    return null
  }

  componentDidUpdate(nextProps) {
    if (this.props.customer.id !== nextProps.customer.id) {
      this.loadUsers()
    }
  }

  loadUsers() {
    getUsers(this.state.filters)
      .then(response => {
        const { meta, data: users } = response
        const { total, current_page: page } = meta
        this.setState({
          total,
          page,
          users
        })
      })
      .catch(error => console.log(error))
  }

  applyFilters(name, value) {
    const filters = {
      ...this.state.filters,
      [name]: value
    }

    if (name !== 'page') {
      filters.page = 1
    }

    this.setState({ filters }, this.loadUsers)
  }

  changePage(page) {
    this.applyFilters('page', page)
  }

  onSelectUser(id) {
    if (!hasPrivilege('edit')) {
      NotificationManager.error('You are not allowed to do this action')
      return
    }
    const user = this.state.users.find(user => user.id == id)
    this.setState({ selectedUser: user }, this.openModal)
  }

  onCreateUser(event) {
    event.preventDefault()
    if (!hasPrivilege('edit')) {
      NotificationManager.error('You are not allowed to do this action')
      return
    }

    const { customer } = this.props
    this.setState({ selectedUser: { ...defaultUser, customer: customer.id } }, this.openModal)
  }

  openModal() {
    this.setState({ showUserModal: true })
  }

  closeModal() {
    this.props.closeModal()
    this.setState({ selectedUser: defaultUser, showUserModal: false }, this.loadUsers)
  }

  onMassUserSelect(id, checked) {
    let { selectedUsers } = this.state
    let hasUserSelection = false
    if (id === 'all') {
      selectedUsers = checked ? 'all' : ''
    } else {
      selectedUsers = selectedUsers.split(',')
      let position = selectedUsers.indexOf(id.toString())

      if (position >= 0) {
        selectedUsers.splice(position, 1)
      } else {
        selectedUsers.push(id)
      }

      selectedUsers = selectedUsers.join(',')
    }

    if (selectedUsers.length > 0) {
      hasUserSelection = true
    }
    this.setState({ selectedUsers, hasUserSelection })
  }

  onMassUserDelete() {
    const { selectedUsers, users } = this.state
    const promises = []
    let ids = selectedUsers

    if (selectedUsers == 'all') ids = users.map(user => user.id).join(',')
    ids.split(',').map(id => promises.push(removeUser(id)))

    Promise.all(promises)
      .then(response => {
        NotificationManager.success(response.message)
        this.setState({ hasUserSelection: false, selectedUsers: '' }, () => {
          this.loadUsers()
        })
      })
      .catch(error => {
        console.log(error)
        NotificationManager.error(error.message)
        this.setState({ hasUserSelection: false, selectedUsers: '' }, () => {
          this.loadUsers()
        })
      })
  }

  optionsRender() {
    return (
      <th colSpan={5}>
        <span className="btn btn-link" onClick={this.onMassUserDelete}>Delete</span>
      </th>
    )
  }

  renderTableHeader() {
    const { selectedUsers, hasUserSelection, headers } = this.state
    return (
      <tr key="heading">
        <td width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={selectedUsers == 'all'}
            name="massive-user-selection"
            option={{ id: 'all', label: '' }}
            onChange={(target) => { this.onMassUserSelect('all', target.checked) }}
          />
        </td>
        {
          !hasUserSelection &&
          Object.keys(headers).map((item, index) => (<th key={index}>{headers[item]}</th>))
        }
        {
          hasUserSelection &&
          this.optionsRender()
        }
      </tr>
    )
  }

  renderTableBody() {
    const { users } = this.state
    return users.map(this.renderTableRow)
  }

  renderTableRow(user, index) {
    const { selectedUsers } = this.state
    const list = selectedUsers.split(',')

    return (
      <tr key={`user-row-${index}`}>
        <td key={`massive-user-selection-${index}`} width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={list.includes(user.id.toString()) || selectedUsers == 'all'}
            name="massive-user-selection"
            option={{ id: index, label: '' }}
            onChange={(target) => { this.onMassUserSelect(user.id, target.checked) }}
          />
        </td>
        <td onClick={() => this.onSelectUser(user.id)}>
          <span className="name">{user.name}</span>
        </td>
        <td>{user.email}</td>
        <td>{user.group ? user.group.name : ''}</td>
        <td>{user.created_at}</td>
        <td>{user.updated_at}</td>
      </tr>
    )
  }

  render() {
    const { users, selectedUser, showUserModal, filters, page, total } = this.state

    return (
      <div className="row my-4">
        <div className="col-md-12"><h4>USERS</h4></div>
        <div className="col-md-12">
          <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}
            buttons={() => {
              if (hasPrivilege('edit')) {
                return (<button className="btn btn-primary mr-4" onClick={this.onCreateUser}>New User</button>)
              } else {
                return (<div></div>)
              }
            }}>
            <UserFilters onChangeFilter={this.applyFilters} filters={filters} />
          </Filters>
        </div>
        <div className="col-md-12 mt-4">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>{this.renderTableHeader()}</thead>
              <tbody>{this.renderTableBody()}</tbody>
            </table>
          </div>
        </div>
        {
          users.length > 0 &&
          <div className="col-md-12">
            <Pagination
              hideFirstLastPages
              prevPageText='⟨'
              nextPageText='⟩'
              itemClass="page-item"
              linkClass="page-link"
              activePage={page}
              itemsCountPerPage={5}
              totalItemsCount={total}
              pageRangeDisplayed={5}
              onChange={(page) => this.applyFilters('page', page)}
            />
          </div>
        }

        {
          showUserModal &&
          <Modal title={!selectedUser.id ? 'Create User' : 'Edit User'} show={showUserModal} onClose={this.closeModal}>
            <EditUser user={selectedUser} onStore={this.closeModal} />
          </Modal>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { customer } = state
  return {
    ...customer,
    ...props,
  }
}

export default connect(mapStateToProps)(CustomerUsers)
