import React from 'react'
import { connect } from 'react-redux'
import { parse, stringify } from 'query-string'
import { removeCustomers, removeCustomer } from '../../api/customers'
import { setCustomer, toggleCustomerModal } from '../../state/actions'
import { getCustomers } from '../../api/customers'
import { defaultCustomer } from '../../config/data'
import Filters from '../../components/Filters'
import Modal from '../../components/Modal'
import Pagination from "react-js-pagination"
import EditCustomer from './edit'
import CustomerFilters from './Filters'
import Checkbox from '../../components/Checkbox'
import { NotificationManager } from 'react-notifications'
import { hasAccess, hasPrivilege } from '../../extensions'

class Customers extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      total: 0,
      page: 1,
      customers: [],
      filters: {},
      hasSelection: false,
      selected: '',
      headers: {
        name: 'Customer',
        created_at: 'Created',
        updated_at: 'Updated',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.onCreateCustomer = this.onCreateCustomer.bind(this)
    this.onSelectCustomer = this.onSelectCustomer.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.onMassSelect = this.onMassSelect.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.optionsRender = this.optionsRender.bind(this)
    this.onMassDelete = this.onMassDelete.bind(this)
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
    getCustomers(this.state.filters)
      .then(data => {
        this.setState({
          total: data.meta.total,
          page: data.meta.current_page,
          customers: data.data
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
    this.props.toggleCustomerModal(false)
    this.loadData()
  }

  onSelectCustomer(id) {
    this.props.history.push(`/dashboard/customers/${id}`)
  }

  onCreateCustomer() {
    this.props.setCustomer(defaultCustomer)
    this.props.toggleCustomerModal(true)
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
    const { selected, customers } = this.state
    let ids = selected
    const promises = []

    if (ids == 'all') {
      ids = customers.map(customer => customer.id).join(',')
    }

    ids.split(',').map(id => promises.push(removeCustomer(id)))
    Promise.all(promises)
      .then(response => {
        NotificationManager.success('The customers were removed succesfully')
        this.setState({ hasSelection: false, selected: '' }, this.loadData)
      })
      .catch(error => {
        NotificationManager.error(error.message || 'There was an error removing the customers.')
      })
  }

  optionsRender() {
    return (
      <th colSpan={3}>
        <span className="btn btn-link" onClick={this.onMassDelete}>Delete</span>
      </th>
    )
  }

  renderHeader() {
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

  renderRow(customer, rowIndex) {
    const { selected } = this.state
    const list = selected.split(',')

    return (
      <tr key={`row-${rowIndex}`}>
        <td key="massive-selection" width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={list.includes(customer.id.toString()) || selected == 'all'}
            name="massive-selection"
            option={{ id: rowIndex, label: '' }}
            onChange={(target) => { this.onMassSelect(customer.id, target.checked) }}
          />
        </td>
        <td className="clickable" onClick={() => this.onSelectCustomer(customer.id)}>
          {
            !customer.icon &&
            <span className="initials">{customer.initials}</span>
          }
          {
            customer.icon &&
            <img className="customer-icon" src={customer.icon} />
          }
          <span className="name">{customer.name}</span>
        </td>
        <td className="clickable" onClick={() => this.onSelectCustomer(customer.id)}>{customer.created_at}</td>
        <td className="clickable" onClick={() => this.onSelectCustomer(customer.id)}>{customer.updated_at}</td>
      </tr>
    )
  }

  render() {
    const { customers, filters } = this.state
    const { customer, showCustomerModal } = this.props

    const tbodyMarkup = customers.map(this.renderRow)

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Customers</h1>
          </div>
          {
            (hasAccess('customers') || hasAccess('everything') && hasPrivilege('edit')) &&
            <div className="col-2 d-flex justify-content-end">
              <a href="javascript:void(0)" className="btn btn-block btn-primary" onClick={this.onCreateCustomer} >New</a>
            </div>
          }
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
              <CustomerFilters onChangeFilter={this.applyFilters} filters={filters} />
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>{this.renderHeader()}</thead>
                <tbody>{tbodyMarkup}</tbody>
              </table>
            </div>
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
          showCustomerModal &&
          <Modal title={!customer.id ? 'Create Customer' : 'Edit Customer'} show={showCustomerModal} onClose={this.closeModal}>
            <EditCustomer onStore={this.closeModal} />
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
    ...props
  }
}

const mapDispatchToProps = {
  setCustomer,
  toggleCustomerModal,
}

export default connect(mapStateToProps, mapDispatchToProps)(Customers)
