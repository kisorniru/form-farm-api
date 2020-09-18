import React from 'react'
import { parse, stringify } from 'query-string'
import { NotificationManager } from 'react-notifications'
import { hasAccess, hasPrivilege } from '../../extensions'
import { getPlans } from '../../api/plans'
import { defaultPlan } from '../../config/data'
import Filters from '../../components/Filters'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Pagination from 'react-js-pagination'
import PlanFilters from './Filters'
import EditPlan from './Edit'


class Plans extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      plan: defaultPlan,
      showModal: false,
      total: 0,
      page: 1,
      filters: {},
      plans: [],
      headers: {
        name: 'Name',
        interval: 'Interval',
        amount_value: 'Amount',
        created_at: 'Created',
        updated_at: 'Updated',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.onSelectPlan = this.onSelectPlan.bind(this)
    this.onCreatePlan = this.onCreatePlan.bind(this)
  }

  componentWillMount () {
    if (this.props.location.search.length > 0) {
      const filters = parse(this.props.location.search)
      this.setState({ filters }, this.loadData)
    } else {
      this.loadData()
    }
  }

  onSelectPlan (id) {
    const plan = this.state.plans.find(plan => plan.id === id)
    if (hasAccess('everything') && hasPrivilege('edit')) {
      this.setState({ plan })
      this.openModal()
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onCreatePlan() {
    this.setState({ plan: defaultPlan })
    this.openModal()
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

  reset () {
    this.setState({ page: 1, total: 1, filters: {} }, () => {
      this.props.history.push({
        pathname: this.props.history.location.pathname,
        search: '',
      })

      this.loadData()
    })
  }

  closeModal () {
    this.setState({ plan: defaultPlan, showModal: false })
    this.loadData()
  }

  openModal() {
    this.setState({ showModal: true })
  }

  loadData () {
    getPlans(this.state.filters)
      .then(response => {
        this.setState({
          total: response.meta.total,
          page: response.meta.current_page,
          plans: response.data
        })
      })
      .catch(console.error)
  }

  render () {
    const { plans, plan, headers, filters, showModal } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Plans</h1>
          </div>
          {
            (hasAccess('everything') && hasPrivilege('edit')) &&
            <div className="col-2 d-flex justify-content-end">
              <a href="javascript:void(0)" className="btn btn-block btn-primary" onClick={this.onCreatePlan} >New</a>
            </div>
          }
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
              <PlanFilters filters={filters} onChangeFilter={this.applyFilters} />
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <Table headers={headers} data={plans} onRowClick={this.onSelectPlan}/>
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
          <Modal title={!plan.id ? 'Create Plan' : 'Edit Plan'} show={showModal} onClose={this.closeModal}>
            <EditPlan plan={plan} onStore={this.closeModal} onCancel={this.closeModal} />
          </Modal>
        }
      </div>
    )
  }
}

export default Plans
