import React from 'react'
import { parse, stringify } from 'query-string'
import { NotificationManager } from 'react-notifications'
import { getCategories } from '../../api/categories'
import { defaultCategory } from '../../config/data'
import { hasAccess, hasPrivilege } from '../../extensions'
import Filters from '../../components/Filters'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Pagination from "react-js-pagination"
import EditCategory from './edit'


class Categories extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      category: defaultCategory,
      showModal: false,
      total: 0,
      page: 1,
      categories: [],
      filters: {},
      headers: {
        name: 'Name',
        created_at: 'Created',
        updated_at: 'Updated',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.onSelectCategory = this.onSelectCategory.bind(this)
    this.onCreateCategory = this.onCreateCategory.bind(this)
  }

  componentWillMount () {
    if (this.props.location.search.length > 0) {
      const filters = parse(this.props.location.search)
      this.setState({ filters }, this.loadData)
    } else {
      this.loadData()
    }
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

  loadData () {
    getCategories(this.state.filters)
      .then(data => {
        this.setState({
          total: data.meta.total,
          page: data.meta.current_page,
          categories: data.data
        })
      })
      .catch(console.error)
  }

  toggleModal() {
    const { showModal } = this.state
    this.setState({ showModal: !showModal }, () => {
      if (showModal) {
        this.loadData()
      }
    })
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

  onCreateCategory () {
    this.setState({ category: defaultCategory }, this.toggleModal)
  }

  onSelectCategory (id) {
    if (!hasPrivilege('edit')) {
      NotificationManager.error('You are not allowed to do this action')
      return
    }
    const category = this.state.categories.find(category => category.id === id)
    this.setState({ category }, this.toggleModal)
  }

  render () {
    const { categories, category, headers, filters, showModal } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Categories</h1>
          </div>
          {
            ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) &&
            <div className="col-2 d-flex justify-content-end">
              <a href="javascript:void(0)" className="btn btn-block btn-primary" onClick={this.onCreateCategory} >New</a>
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
            <Table headers={headers} data={categories} onRowClick={this.onSelectCategory}/>
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
          <Modal title={category.id ? 'Edit Category' : 'Create Category'} show={showModal} onClose={this.toggleModal}>
            <EditCategory category={category} onStore={this.toggleModal} onCancel={this.toggleModal} />
          </Modal>
        }
      </div>
    )
  }
}
export default Categories
