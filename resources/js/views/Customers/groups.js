import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { getGroups, removeGroup } from '../../api/groups'
import Checkbox from '../../components/Checkbox'
import Filters from '../../components/Filters'
import Modal from '../../components/Modal'
import Pagination from 'react-js-pagination'
import EditGroup from '../Groups/edit'
import { hasPrivilege } from '../../extensions'
import { defaultGroup } from '../../config/data'

class CustomerGroups extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showGroupModal: false,
      selectedGroup: defaultGroup,
      total: 0,
      page: 1,
      groups: [],
      hasGroupSelection: false,
      selectedGroups: '',
      filters: {
        limit: 5,
        page: 1,
        customer: 0,
        search: null,
      },
      headers: {
        name: 'Name',
        template: 'Template Assignments',
        created_at: 'Created',
        updated_at: 'Updated'
      }
    }

    this.onCreateGroup = this.onCreateGroup.bind(this)
    this.onSelectGroup = this.onSelectGroup.bind(this)
    this.loadGroups = this.loadGroups.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.changePage = this.changePage.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.onMassGroupSelect = this.onMassGroupSelect.bind(this)
    this.onMassGroupDelete = this.onMassGroupDelete.bind(this)
    this.renderTableHeader = this.renderTableHeader.bind(this)
    this.renderTableBody = this.renderTableBody.bind(this)
    this.renderTableRow = this.renderTableRow.bind(this)
  }

  static getDerivedStateFromProps(nextProps, state) {
    if (nextProps.customer) {
      let additinalInfo = {
        selectedGroup: {
          ...defaultGroup,
          customer: nextProps.customer.id,
        },
        showGroupModal: nextProps.toggleModal
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
      this.loadGroups()
    }
  }

  loadGroups() {
    getGroups(this.state.filters)
      .then(response => {
        const { meta, data: groups } = response
        const { total, current_page: page } = meta
        this.setState({
          total,
          page,
          groups
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

    this.setState({ filters }, this.loadGroups)
  }

  changePage(page) {
    this.applyFilters('page', page)
  }

  onCreateGroup() {
    if (!hasPrivilege('edit')) {
      NotificationManager.error('You are not allowed to do this action')
      return
    }

    const { customer, authUser } = this.props
    let { group = defaultGroup } = this.state
    group.customer = customer.id ? customer.id : authUser.customer.id
    this.setState({ selectedGroup: group }, this.openModal)
  }

  onSelectGroup(id) {
    const group = this.state.groups.find(group => group.id === id)

    if (!hasPrivilege('edit')) {
      NotificationManager.error('You are not allowed to do this action')
      return
    }

    this.setState({ selectedGroup: group }, this.openModal)
  }

  openModal(event) {
    if (event) event.preventDefault()
    this.setState({ showGroupModal: true })
  }

  closeModal() {
    this.props.closeModal()
    this.setState({ selectedGroup: defaultGroup, showGroupModal: false }, this.loadGroups)
  }

  onMassGroupSelect(id, checked) {
    let { selectedGroups } = this.state
    let hasGroupSelection = false
    if (id === 'all') {
      selectedGroups = checked ? 'all' : ''
    } else {
      selectedGroups = selectedGroups.split(',')
      let position = selectedGroups.indexOf(id.toString())

      if (position >= 0) {
        selectedGroups.splice(position, 1)
      } else {
        selectedGroups.push(id)
      }

      selectedGroups = selectedGroups.join(',')
    }

    if (selectedGroups.length > 0) {
      hasGroupSelection = true
    }
    this.setState({ selectedGroups, hasGroupSelection })
  }

  onMassGroupDelete() {
    const { selectedGroups, groups } = this.state
    let ids = selectedGroups
    const promises = []
    if (selectedGroups == 'all') {
      ids = groups.map(group => group.id).join(',')
    }

    ids.split(',').map(id => promises.push(removeGroup(id)))
    Promise.all(promises)
      .then(response => {
        NotificationManager.success('The groups were removed successfully')
        this.setState({ hasGroupSelection: false, selectedGroups: '' }, this.loadGroups)
      })
      .catch(error => {
        NotificationManager.error(error.message)
        this.setState({ hasGroupSelection: false, selectedGroups: '' }, this.loadGroups)
      })
  }

  optionsRender() {
    return (
      <th colSpan={5}>
        <span className="btn btn-link" onClick={this.onMassGroupDelete}>Delete</span>
      </th>
    )
  }

  renderTableHeader() {
    const { selectedGroups, hasGroupSelection, headers } = this.state
    return (
      <tr key="heading">
        <td width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={selectedGroups == 'all'}
            name="massive-group-selection"
            option={{ id: 'all', label: '' }}
            onChange={(target) => { this.onMassGroupSelect('all', target.checked) }}
          />
        </td>
        {
          !hasGroupSelection &&
          Object.keys(headers).map((item, index) => (<th key={index}>{headers[item]}</th>))
        }
        {
          hasGroupSelection &&
          this.optionsRender()
        }
      </tr>
    )
  }

  renderTableBody() {
    const { groups } = this.state
    return groups.map(this.renderTableRow)
  }

  renderTableRow(group, index) {
    const { selectedGroups } = this.state
    const list = selectedGroups.split(',')

    return (
      <tr key={`group-row-${index}`}>
        <td key={`massive-group-selection-${index}`} width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={list.includes(group.id.toString()) || selectedGroups == 'all'}
            name="massive-group-selection"
            option={{ id: index, label: '' }}
            onChange={(target) => { this.onMassGroupSelect(group.id, target.checked) }}
          />
        </td>
        <td onClick={() => this.onSelectGroup(group.id)}>
          <span className="name">{group.name}</span>
        </td>
        <td></td>
        <td>{group.created_at}</td>
        <td>{group.updated_at}</td>
      </tr>
    )
  }

  render() {
    const { selectedGroup, showGroupModal, groups, filters, page, total } = this.state

    return (
      <div className="row my-4">
        <div className="col-md-12"><h4>GROUPS</h4></div>
        <div className="col-md-12">
          <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}
            buttons={() => {
              if (hasPrivilege('edit')) {
                return (<button className="btn btn-primary mr-4" onClick={this.onCreateGroup}>New Group</button>)
              } else {
                return (<div></div>);
              }
            }}>
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
          groups.length > 0 &&
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
          showGroupModal &&
          <Modal title={!selectedGroup.id ? 'Create Group' : 'Edit Group'} show={showGroupModal} onClose={this.closeModal}>
            <EditGroup group={selectedGroup} onStore={this.closeModal} />
          </Modal>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { customer, auth } = state
  const { user } = auth
  return {
    authUser: user,
    ...customer,
    ...props,
  }
}

export default connect(mapStateToProps)(CustomerGroups)
