import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { getCustomers } from '../../../api/customers'
import { attachCustomer, detachCustomer } from '../../../api/templates'
import Filters from '../../../components/Filters'
import Pagination from "react-js-pagination"
import CustomerFilters from '../../Customers/Filters'
import Checkbox from '../../../components/Checkbox'

class TemplateCustomers extends React.Component {
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
        templates: 'Can access',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.renderTemplates = this.renderTemplates.bind(this)
    this.onSelectCustomer = this.onSelectCustomer.bind(this)
    this.hasCustomerSelected = this.hasCustomerSelected.bind(this)
  }

  componentDidMount() {
    this.loadData()
  }

  onSelectCustomer(id, checked) {
    const { template } = this.props
    const { customers } = this.state
    const customer = customers.find(customer => customer.id === id)
    const cIndex = customers.map(c => c.id).indexOf(id)

    if (checked) {
      attachCustomer(template.id, id)
      .then(response => {
        customer.templates.push(template)
        customers.splice(cIndex, 1, customer)
        this.setState({ customers }, () => NotificationManager.success(response.message))
      })
      .catch(error => NotificationManager.error('There was an error attaching the customer'))
    } else {
      detachCustomer(template.id, id)
      .then(response => {
        const index = customer.templates.map(t => t.id).indexOf(template.id)
        customer.templates.splice(index, 1)
        customers.splice(cIndex, 1, customer)
        this.setState({ customers }, () => NotificationManager.success(response.message))
      })
      .catch(error => NotificationManager.error('There was an error detaching the customer'))
    }
  }

  hasCustomerSelected(id) {
    const { template } = this.props
    const { customers } = this.state
    const customer = customers.find(customer => customer.id === id)
    let hasTemplate = false

    if (customer.templates) {
      const t = customer.templates.find(t => t.id === template.id)
      if (t) {
        hasTemplate = true
      }
    }

    return hasTemplate
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
      this.loadData()
    })
  }

  loadData () {
    getCustomers({...this.state.filters, with: 'templates'})
      .then(data => {
        this.setState({
          total: data.meta.total,
          page: data.meta.current_page,
          customers: data.data
        })
      })
      .catch(console.error)
  }

  reset () {
    this.setState({ page: 1, total: 1, filters: {} }, () => {
      this.loadData()
    })
  }

  renderHeader () {
    const { headers } = this.state

    return (
      <tr key="heading">
        <td></td>
        {Object.keys(headers).map((item, index) => (<th key={index}>{headers[item]}</th>))}
      </tr>
    )
  }

  renderTemplates(id) {
    const { template } = this.props
    const { customers } = this.state
    const customer = customers.find(customer => customer.id === id)
    return customer.templates.map(t => (<li key={t.id} className={`${t.id === template.id ? 'active' : 'simple'}`}>{t.name}</li>))
  }

  renderRow (customer, rowIndex) {
    return (
      <tr key={`row-${rowIndex}`}>
        <td key="massive-selection" width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={this.hasCustomerSelected(customer.id)}
            name="massive-selection"
            option={{ id: rowIndex, label: '' }}
            onChange={(target) => this.onSelectCustomer(customer.id, target.checked)}
          />
        </td>
        <td>
          <span className="initials">{customer.initials}</span>
          <span className="name">{customer.name}</span>
        </td>
        <td><ul className="templates-list">{this.renderTemplates(customer.id)}</ul></td>
      </tr>
    )
  }

  render () {
    const { customers, filters, page, total } = this.state
    const tbodyMarkup = customers.map(this.renderRow)

    return (
      <div className="row mt-4">
        <div className="col-md-12 mt-2">
          <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
            <CustomerFilters onChangeFilter={this.applyFilters} filters={filters} />
          </Filters>
        </div>
        <div className="col-md-12 mt-2">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>{this.renderHeader()}</thead>
              <tbody>{tbodyMarkup}</tbody>
            </table>
          </div>
        </div>
        {
          total > 0 &&
          <div className="col-md-12">
            <Pagination
              hideFirstLastPages
              prevPageText='⟨'
              nextPageText='⟩'
              itemClass="page-item"
              linkClass="page-link"
              activePage={page}
              itemsCountPerPage={10}
              totalItemsCount={total}
              pageRangeDisplayed={5}
              onChange={(page) => this.applyFilters('page', page)}
            />
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { template } = state
  return {
    ...template,
    ...props
  }
}

export default connect(mapStateToProps)(TemplateCustomers)
