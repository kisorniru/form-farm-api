import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { parse, stringify } from 'query-string'
import { NotificationManager } from 'react-notifications'
import {
  getDocuments,
  duplicateDocument,
  removeDocument,
} from '../../api/documents'
import { baseURL } from '../../config/api'
import { hasAccess, hasPrivilege } from '../../extensions'
import Filters from '../../components/Filters'
import Pagination from 'react-js-pagination'
import Cell from '../../components/Table/Cell'
import DocumentFilters from './Filters'
import Checkbox from '../../components/Checkbox'
import TemplateIcon from '../../Icons/TemplateIcon'

class Documents extends Component {
  constructor(props) {
    super(props)

    this.state = {
      total: 0,
      page: 1,
      filters: {},
      documents: [],
      hasSelection: false,
      selected: '',
      headers: {
        name: 'Document Name',
        customer: 'Customer',
        user: 'User',
        created_at: 'Created',
        updated_at: 'Updated'
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
    getDocuments(this.state.filters)
      .then(response => {
        const { meta, data: documents } = response
        const { total, current_page: page } = meta
        this.setState({
          total,
          page,
          documents
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
    if ((hasAccess('documents') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.props.history.push(`/dashboard/documents/${id}/edit`)
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
    const { selected, documents } = this.state
    let ids = selected
    const promises = []

    if (selected == 'all') {
      ids = documents.map(doc => doc.id).join(',')
    }

    ids.split(',').map(id => {
      if (id.length > 0) {
        promises.push(removeDocument(id))
      }
    })

    Promise.all(promises)
      .then(response => {
        NotificationManager.success('The documents were removed succesfully')
        this.setState({ hasSelection: false, selected: '' }, this.loadData)
      })
      .catch(error => {
        NotificationManager.error(error.message)
      })
  }

  onMassDuplicate() {
    const { selected } = this.state
    let ids = selected
    const promises = []

    if (selected == 'all') {
      ids = documents.map(doc => doc.id).join(',')
    }

    ids.split(',').map(id => {
      if (id.length > 0) {
        promises.push(duplicateDocument(id))
      }
    })

    Promise.all(promises)
      .then(response => {
        this.props.history.push(`/dashboard/documents/${response[0].id}/edit`)
      })
      .catch(error => {
        NotificationManager.error(error.message || 'There was an error duplicating the document')
      })
  }

  optionsRender() {
    const { selected } = this.state
    let selectedCount = selected.length > 0 ? selected.split(',').length - 1 : 0
    const documents = selected ? selected.split(',').splice(0, 1).join(',') : ''
    let doc = undefined

    if (selectedCount == 1) {
      doc = selected.split(',')[1]
    }

    return (
      <Cell colspan={5} header={true}>
        <span className="btn btn-link" onClick={this.onMassDelete}>Delete</span>
        {
          selectedCount == 1 &&
          <div style={{ display: 'inline-block' }}>
            <span className="btn btn-link" onClick={this.onMassDuplicate}>Duplicate</span>
            <a href={`${baseURL}/documents/${doc}/print`} target="_blank" className="btn btn-link">Print</a>
            <a href={`${baseURL}/documents/${doc}/csv`} target="_blank" className="btn btn-link">CSV</a>
            <a href={`${baseURL}/documents/${doc}/xml`} download className="btn btn-link">XML</a>
            <a href={`${baseURL}/documents/${doc}/json`} download className="btn btn-link">JSON</a>
            <a href={`${baseURL}/documents/${doc}/qr-code`} target="_blank" className="btn btn-link">Qr Code</a>
          </div>
        }
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

  renderTableRow(doc, index) {
    const { selected } = this.state
    const list = selected.split(',')

    return (
      <tr key={`document-row-${index}`}>
        <td key={`massive-selection-${index}`} width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={list.includes(doc.id.toString()) || selected == 'all'}
            name="massive-selection"
            option={{ id: index, label: '' }}
            onChange={(target) => { this.onMassSelect(doc.id, target.checked) }}
          />
        </td>
        <td className="clickable" onClick={() => this.onSelect(doc.id)}>
          {
            doc.template &&
            <span className="template-icon"><TemplateIcon /></span>
          }
          <span className="name">{doc.name}</span>
        </td>
        <td>{doc.customer_name}</td>
        <td>{doc.user_name}</td>
        <td>{doc.created_at}</td>
        <td>{doc.updated_at}</td>
      </tr>
    )
  }

  renderTableBody() {
    const { documents } = this.state
    return documents.map(this.renderTableRow)
  }

  render() {
    const { filters } = this.state

    return (
      <div className="container-fluid">
        <div className="row justify-content-between">
          <div className="col-2">
            <h1>Documents</h1>
          </div>
          {
            ((hasAccess('documents') || hasAccess('everything')) && hasPrivilege('edit')) &&
            <div className="col-2 d-flex justify-content-end">
              <Link className="btn btn-block btn-primary" to="/dashboard/documents/new">New</Link>
            </div>
          }
        </div>
        <div className="row mt-4">
          <div className="col">
            <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
              <DocumentFilters onChangeFilter={this.applyFilters} filters={filters} />
            </Filters>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>{this.renderTableHeader()}</thead>
                <tbody>{this.renderTableBody()}</tbody>
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
      </div>
    )
  }
}

export default Documents
