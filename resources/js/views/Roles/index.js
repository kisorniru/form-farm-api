import React from 'react'
import { parse, stringify } from 'query-string'
import { NotificationManager } from 'react-notifications'
import { hasAccess, hasPrivilege } from '../../extensions'
import { getRoles, removeRole } from '../../api/roles'
import { defaultRole } from '../../config/data'
import Cell from '../../components/Table/Cell'
import Checkbox from '../../components/Checkbox'
import EditRole from './edit'
import Filters from '../../components/Filters'
import Modal from '../../components/Modal'
import Pagination from 'react-js-pagination'


class Roles extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      role: defaultRole,
      showModal: false,
      total: 0,
      page: 1,
      roles: [],
      filters: {},
      hasSelection: false,
      selected: '',
      headers: {
        name: 'Name',
        access: 'Access',
        privileges: 'Privilege',
        created_at: 'Created',
        updated_at: 'Updated'
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.onCreateRole = this.onCreateRole.bind(this)
    this.onSelectRole = this.onSelectRole.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.onMassSelect = this.onMassSelect.bind(this)
    this.onMassDelete = this.onMassDelete.bind(this)
    this.optionsRender = this.optionsRender.bind(this)
    this.renderTableHeader = this.renderTableHeader.bind(this)
    this.renderTableBody = this.renderTableBody.bind(this)
    this.renderTableRow = this.renderTableRow.bind(this)
  }

  componentWillMount() {
    if (this.props.location.search.length > 0) {
      const filters = parse(this.props.location.search)
      this.setState({ filters }, this.loadData)
    } else {
      this.loadData()
    }
  }

  applyFilters(name, value) {
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

  loadData() {
    getRoles(this.state.filters)
      .then(data => {
        this.setState({
          total: data.meta.total,
          page: data.meta.current_page,
          roles: data.data
        })
      })
      .catch(console.error)
  }

  reset() {
    this.setState({ page: 1, total: 1, filters: {} }, () => {
      this.props.history.push({
        pathname: this.props.history.location.pathname,
        search: '',
      })

      this.loadData()
    })
  }

  closeModal() {
    this.setState({ showModal: false }, this.loadData)
  }

  onCreateRole() {
    if ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.setState({ role: defaultRole, showModal: true })
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onSelectRole(id) {
    if ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) {
      const role = this.state.roles.find(role => role.id === id)
      this.setState({ role, showModal: true })
    } else {
    NotificationManager.error('You are not allowed to do this action')
    }
  }

  onMassSelect(id, checked) {
    let { selected } = this.state
    let hasSelection = false
    if (id === 'all') {
      selected = checked ? 'all' : ''
    } else {
      selected = selected.split(',')
      let position = selected.indexOf(id.toString())

      if (position >= 0) {
        selected.splice(position, 1)
      } else {
        selected.push(id)
      }

      selected = selected.join(',')
    }

    if (selected.length > 0) {
      hasSelection = true
    }
    this.setState({ selected, hasSelection })
  }

  onMassDelete() {
    const { selected, roles } = this.state
    let ids = selected
    if (selected == 'all') {
      ids = roles.map(role => role.id).join(',')
    }

    const queue = []
    ids.split(',').map(id => queue.push(removeRole(id)))

    Promise.all(queue)
      .then(response => {
        NotificationManager.success('The Roles were removed succesfully')
        this.setState({ hasSelection: false, selected: '' }, this.loadData)
      })
      .catch(error => {
        NotificationManager.error(error.message)
      })
  }

  optionsRender() {
    return (
      <Cell colspan={5} header={true}>
        <span className="btn btn-link" onClick={this.onMassDelete}>Delete</span>
      </Cell>
    )
  }

  renderTableHeader() {
    const { selected, hasSelection, headers } = this.state
    return (
      <tr key="heading">
        <td width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={selected == 'all'}
            name="massive-selection"
            option={{ id: 'all', label: '' }}
            onChange={(target) => { this.onMassSelect('all', target.checked) }}
          />
        </td>
        {
          !hasSelection &&
          Object.keys(headers).map((item, index) => (<th key={index}>{headers[item]}</th>))
        }
        {
          hasSelection &&
          this.optionsRender()
        }
      </tr>
    )
  }

  renderTableRow(role, index) {
    const { selected } = this.state
    const list = selected.split(',')

    return (
      <tr key={`document-row-${index}`}>
        <td key={`massive-selection-${index}`} width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={list.includes(role.id.toString()) || selected == 'all'}
            name="massive-selection"
            option={{ id: index, label: '' }}
            onChange={(target) => { this.onMassSelect(role.id, target.checked) }}
          />
        </td>
        <td className="clickable" onClick={() => this.onSelectRole(role.id)}>
          <span className="name">{role.name}</span>
        </td>
        <td>
          <span>{role.access.split(',').join(', ')}</span>
        </td>
        <td>
          <span>{role.privileges == 'view' ? 'View' : 'View, Edit'}</span>
        </td>
        <td>{role.created_at}</td>
        <td>{role.updated_at}</td>
      </tr>
    )
  }

  renderTableBody() {
    const { roles } = this.state
    return roles.map(this.renderTableRow)
  }

  render() {
    const { filters, role, showModal } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Roles</h1>
          </div>
          {
            ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) &&
            <div className="col-2 d-flex justify-content-end">
              <button className="btn btn-block btn-primary" onClick={this.onCreateRole} >New</button>
            </div>
          }
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <table className="table table-striped table-hover">
              <thead>{this.renderTableHeader()}</thead>
              <tbody>{this.renderTableBody()}</tbody>
            </table>
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
          <Modal title={!role.id ? 'Create Role' : 'Edit Role'} show={showModal} onClose={this.closeModal}>
            <EditRole role={role} onStore={this.closeModal} onCancel={this.closeModal} />
          </Modal>
        }
      </div>
    )
  }
}

export default Roles
