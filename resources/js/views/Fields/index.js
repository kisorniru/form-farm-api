import React from 'react'
import { parse, stringify } from 'query-string'
import { getFields } from '../../api/fields'
import { defaultField } from '../../config/data'
import Filters from '../../components/Filters'
import Pagination from "react-js-pagination"
import Table from '../../components/Table'
import FieldFilters from './Filters'
import Modal from '../../components/Modal'
import EditField from './Edit'

class Fields extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      total: 0,
      page: 1,
      filters: {},
      fields: [],
      field: defaultField,
      showModal: false,
      headers: {
        name: 'Name',
        slug: 'Slug',
        type: 'Type',
        created_at: 'Created',
        updated_at: 'Updated',
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.onCreateField = this.onCreateField.bind(this)
    this.onSelectField = this.onSelectField.bind(this)
  }

  componentWillMount() {
    if (this.props.location.search.length > 0) {
      const filters = parse(this.props.location.search)
      this.setState({ filters }, this.loadData)
    } else {
      this.loadData()
    }
  }

  onCreateField() {
    this.setState({ field: defaultField }, this.openModal)
  }

  onSelectField(id) {
    const field = this.state.fields.find(field => field.id === id)
    this.setState({ field }, this.openModal)
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

  openModal() {
    this.setState({ showModal: true })
  }

  closeModal() {
    this.setState({ field: defaultField, showModal: false }, this.loadData)
  }

  loadData() {
    getFields(this.state.filters)
      .then(response => {
        this.setState({
          total: response.meta.total,
          page: response.meta.current_page,
          fields: response.data
        })
      })
      .catch(error => console.log(error))
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

  render() {
    const { fields, field, headers, filters, showModal } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Fields</h1>
          </div>
          <div className="col-2 d-flex justify-content-end">
            <button className="btn btn-block btn-primary" onClick={this.onCreateField}>New</button>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
              <FieldFilters onChangeFilter={this.applyFilters} filters={filters} />
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <Table
              headers={headers}
              data={fields}
              onRowClick={this.onSelectField}
            />
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
          <Modal title={!field.id ? 'Create Field' : 'Edit Field'} show={showModal} onClose={this.closeModal}>
            <EditField field={field} onStore={this.closeModal} onCancel={this.closeModal} />
          </Modal>
        }
      </div>
    )
  }
}

export default Fields
