import React from 'react'
import { parse, stringify } from 'query-string'
import { getGroups } from '../../api/groups'
import { defaultGroup } from '../../config/data'
import Filters from '../../components/Filters'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Pagination from "react-js-pagination"
import EditGroup from './edit'


class Groups extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      group: {},
      showModal: false,
      total: 0,
      page: 1,
      filters: {},
      groups: [],
      headers: {
        name: 'Name',
        created_at: 'Created',
        updated_at: 'Updated',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.onSelectGroup = this.onSelectGroup.bind(this)
    this.onCreateGroup = this.onCreateGroup.bind(this)
  }

  componentWillMount () {
    if (this.props.location.search.length > 0) {
      const filters = parse(this.props.location.search)
      this.setState({ filters }, this.loadData)
    } else {
      this.loadData()
    }
  }

  onCreateGroup() {
    this.setState({ group: defaultGroup }, this.openModal)
  }

  onSelectGroup (id) {
    const group = this.state.groups.find(group => group.id === id)
    this.setState({ group }, this.openModal)
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

  openModal() {
    this.setState({ showModal: true })
  }

  closeModal () {
    this.setState({ group: {}, showModal: false })
    this.loadData()
  }

  loadData () {
    getGroups(this.state.filters)
      .then(response => {
        this.setState({
          total: response.meta.total,
          page: response.meta.current_page,
          groups: response.data
        })
      })
      .catch(console.error)
  }

  render () {
    const { group, groups, headers, filters, showModal } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Groups</h1>
          </div>
          <div className="col-2 d-flex justify-content-end">
            <a href="javascript:void(0)" className="btn btn-block btn-primary" onClick={this.onCreateGroup} >New</a>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <Table headers={headers} data={groups} onRowClick={this.onSelectGroup}/>
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
          <Modal title={!group.id ? 'Create Group' : 'Edit Group'} show={showModal} onClose={this.closeModal}>
            <EditGroup group={group} onStore={this.closeModal} onCancel={this.closeModal} />
          </Modal>
        }
      </div>
    )
  }
}

export default Groups
