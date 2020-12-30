import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { parse, stringify } from 'query-string'
import { NotificationManager } from 'react-notifications'
import { hasAccess, hasPrivilege } from '../../extensions'
import { baseURL } from '../../config/api'
import { getTemplates, duplicateTemplate, removeTemplate } from '../../api/templates'
import Filters from '../../components/Filters'
import Pagination from "react-js-pagination"
import Table from '../../components/Table'
import TemplateFilters from './Filters'
import Cell from '../../components/Table/Cell'

class Templates extends Component {
  constructor(props) {
    super(props)

    this.state = {
      total: 0,
      page: 1,
      filters: {},
      templates: [],
      hasSelection: false,
      selected: '',
      headers: {
        name: 'name',
        created_at: 'created',
        updated_at: 'updated'
      }
    }

    this.reset = this.reset.bind(this)
    this.loadData = this.loadData.bind(this)
    this.onSelect = this.onSelect.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.onMassSelect = this.onMassSelect.bind(this)
    this.onMassDelete = this.onMassDelete.bind(this)
    this.onMassDuplicate = this.onMassDuplicate.bind(this)
    this.optionsRender = this.optionsRender.bind(this)
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
    getTemplates(this.state.filters)
      .then(response => {
        this.setState({
          total: response.meta.total,
          page: response.meta.current_page,
          templates: response.data
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

  onSelect(id) {
    if ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.props.history.push(`/dashboard/settings/templates/${id}/edit`)
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
    const { selected, templates } = this.state
    let ids = selected
    const promises = []

    if (ids == 'all') {
      ids = templates.map(template => template.id).join(',')
    }

    ids.split(',').map(id => promises.push(removeTemplate(id)))

    Promise.all(promises)
      .then(response => {
        NotificationManager.success(`The templates were removed succesfully`)
        this.setState({ hasSelection: false, selected: '' }, () => this.loadData)
      })
      .catch(error => {
        NotificationManager.error(error.message)
      })
  }

  onMassDuplicate() {
    const { selected, templates } = this.state
    let ids = selected
    const promises = []

    if (ids == 'all') {
      ids = templates.map(template => template.id).join(',')
    }

    ids.split(',').map(id => promises.push(duplicateTemplate(id)))

    Promise.all(promises)
      .then(response => {
        this.props.history.push(`/dashboard/settings/templates/${response[0].id}/edit`)
      })
      .catch(error => {
        NotificationManager.error(error.message)
      })
  }

  optionsRender() {
    const { selected } = this.state
    let selectedCount = selected.length > 0 ? selected.split(',').length - 1 : 0
    const templates = selected ? selected.split(',').splice(0, 1).join(',') : ''
    let template = undefined

    if (selectedCount == 1) {
      template = selected.split(',')[1]
    }

    return (
      <Cell colspan={3} header={true}>
        <span className="btn btn-link" onClick={this.onMassDelete}>Delete</span>
        {/*
          selectedCount == 1 &&
          <span className="btn btn-link" onClick={this.props.onMassDuplicate}>Duplicate</span>
        */}
        <a href={`${baseURL}/templates/print?templates=${templates}`} target="_blank" className="btn btn-link">Print</a>
        <a href={`${baseURL}/templates/csv?templates=${templates}`} target="_blank" className="btn btn-link">CSV</a>
        <a href={`${baseURL}/templates/xml?templates=${templates}`} download className="btn btn-link">XML</a>
        <a href={`${baseURL}/templates/json?templates=${templates}`} download className="btn btn-link">JSON</a>
        {
          selectedCount == 1 &&
          <a href={`${baseURL}/templates/${template}/qr-code`} target="_blank" className="btn btn-link">Qr Code</a>
        }
      </Cell>
    )
  }

  render() {
    const { templates, headers, filters, selected, hasSelection } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Templates</h1>
          </div>
          {
            ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) &&
            <div className="col-2 d-flex justify-content-end">
              <Link className="btn btn-block btn-primary" to="/dashboard/settings/templates/new">New</Link>
            </div>
          }
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
              <TemplateFilters onChangeFilter={this.applyFilters} filters={filters} />
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <Table
              headers={headers}
              data={templates}
              onRowClick={this.onSelect}
              massiveSelection={true}
              hasSelection={hasSelection}
              selected={selected}
              onMassSelect={this.onMassSelect}
              optionsRender={this.optionsRender}
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
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    ...state,
    ...props,
  }
}

export default connect(mapStateToProps)(Templates)
