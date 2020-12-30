import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { getDocuments, duplicateDocument, removeDocument } from '../../api/documents'
import { baseURL } from '../../config/api'
import { hasAccess, hasPrivilege } from '../../extensions'
import Filters from '../../components/Filters'
import Cell from '../../components/Table/Cell'
import Checkbox from '../../components/Checkbox'
import Pagination from 'react-js-pagination'
import TemplateIcon from '../../Icons/TemplateIcon'
// import DocumentFilters from '../Documents/Filters'


class CustomerDocuments extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      total: 0,
      page: 1,
      documents: [],
      customer: null,
      hasDocumentSelected: false,
      selectedDocuments: '',
      filters: {
        limit: 5,
        page: 1,
        customer: 0,
        search: null,
      },
      headers: {
        name: 'Document Name',
        customer: 'Customer',
        user: 'User',
        created_at: 'Created',
        updated_at: 'Updated'
      }
    }

    this.reset = this.reset.bind(this)
    this.onCreateDocument = this.onCreateDocument.bind(this)
    this.loadDocuments = this.loadDocuments.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.changePage = this.changePage.bind(this)
    this.onSelectDocument = this.onSelectDocument.bind(this)
    this.onMassSelect = this.onMassSelect.bind(this)
    this.onMassDocumentDelete = this.onMassDocumentDelete.bind(this)
    this.onMassDuplicate = this.onMassDuplicate.bind(this)
    this.optionsRender = this.optionsRender.bind(this)
    this.renderTableHeader = this.renderTableHeader.bind(this)
    this.renderTableBody = this.renderTableBody.bind(this)
    this.renderTableRow = this.renderTableRow.bind(this)
  }

  static getDerivedStateFromProps(nextProps, state) {
    if (nextProps.customer) {
      return {
        customer: nextProps.customer,
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
      this.loadDocuments()
    }
  }

  loadDocuments() {
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
    this.setState({page: 1, total: 1, filters: {
      limit: 5,
      page: 1,
      customer: 0,
      search: null,
    }}, () => {
      this.loadDocuments()
    })
  }

  applyFilters(name, value) {
    const filters = {
      ...this.state.filters,
      [name]: value
    }

    if (name !== 'page') {
      filters.page = 1
    }

    // if (value.length == 0) {
    //   delete filters[name]
    // }

    this.setState({ filters }, this.loadDocuments)
  }

  changePage (page) {
    this.applyFilters('page', page)
  }

  onCreateDocument (event) {
    event.preventDefault()
    if ((hasAccess('documents') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.props.history.push('/dashboard/documents/new')
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onSelectDocument (id) {
    if ((hasAccess('documents') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.props.history.push(`/dashboard/documents/${id}/edit`)
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onMassSelect (id, checked) {
    let { selectedDocuments } = this.state
    let hasDocumentSelected = false
    if (id === 'all') {
      selectedDocuments = checked ? 'all' : ''
    } else {
      selectedDocuments = selectedDocuments.split(',')
      let position = selectedDocuments.indexOf(id.toString())

      if (position >= 0) {
        selectedDocuments.splice(position, 1)
      } else {
        selectedDocuments.push(id)
      }

      selectedDocuments = selectedDocuments.join(',')
    }

    if (selectedDocuments.length > 0) {
      hasDocumentSelected = true
    }
    this.setState({ selectedDocuments, hasDocumentSelected })
  }

  onMassDocumentDelete () {
    const { selectedDocuments, documents } = this.state
    const promises = []
    let ids = selectedDocuments
    if (selectedDocuments == 'all') ids = documents.map(doc => doc.id).join(',')
    ids.split(',').map(id => promises.push(removeDocument(id)))

    Promise.all(promises)
    .then(response => {
      NotificationManager.success(response.message)
      this.setState({ hasDocumentSelected: false, selectedDocuments: '' }, () => {
        this.loadDocuments()
      })
    })
    .catch(error => {
      this.setState({ hasDocumentSelected: false, selectedDocuments: '' }, () => {
        this.loadDocuments()
      })
      NotificationManager.error(error.message)
    })
  }

  onMassDuplicate () {
    const { selectedDocuments, documents } = this.state
    const promises = []
    let ids = selectedDocuments
    if (selectedDocuments == 'all') ids = documents.map(doc => doc.id).join(',')
    ids.split(',').map(id => promises.push(duplicateDocument(id)))

    Promise.all(promises)
      .then(response => {
        const duplicate = response[0]
        this.props.history.push(`/dashboard/documents/${duplicate.id}/edit`)
      })
      .catch(error => {
        NotificationManager.error(error.message)
      })
  }

  optionsRender () {
    const { selectedDocuments } = this.state
    let selectedDocumentsCount = selectedDocuments.length > 0 ? selectedDocuments.split(',').length - 1 : 0
    let doc = undefined

    if (selectedDocumentsCount == 1) {
      doc = selectedDocuments.split(',')[1]
    }

    return (
      <Cell colspan={5} header={true}>
        <span className="btn btn-link" onClick={this.onMassDocumentDelete}>Delete</span>
        {
          selectedDocumentsCount == 1 &&
          <div style={{display:'inline-block'}}>
            <span className="btn btn-link" onClick={this.onMassDuplicate}>Duplicate</span>
            <a href={`${baseURL}/documents/${doc}/print`} target="_blank" className="btn btn-link">Print</a>
            <a href={`${baseURL}/documents/${doc}/csv`} target="_blank" className="btn btn-link">CSV</a>
            <a href={`${baseURL}/documents/${doc}/xml`} download className="btn btn-link">XML</a>
            <a href={`${baseURL}/documents/${doc}/json`} download className="btn btn-link">JSON</a>
          </div>
        }
      </Cell>
    )
  }

  renderTableHeader() {
    const { selectedDocuments, hasDocumentSelected, headers } = this.state
    return (
      <tr key="heading">
        <td width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={selectedDocuments == 'all'}
            name="massive-document-selection"
            option={{ id: 'all', label: '' }}
            onChange={(target) => { this.onMassSelect('all', target.checked) }}
          />
        </td>
        {
          !hasDocumentSelected &&
          Object.keys(headers).map((item, index) => (<th key={index}>{headers[item]}</th>))
        }
        {
          hasDocumentSelected &&
          this.optionsRender()
        }
      </tr>
    )
  }

  renderTableRow(doc, index) {
    const { selectedDocuments } = this.state
    const list = selectedDocuments.split(',')

    return (
      <tr key={`document-row-${index}`}>
        <td key={`massive-document-selection-${index}`} width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={list.includes(doc.id.toString()) || selectedDocuments == 'all'}
            name="massive-document-selection"
            option={{ id: index, label: '' }}
            onChange={(target) => { this.onMassSelect(doc.id, target.checked) }}
          />
        </td>
        <td onClick={() => this.onSelectDocument(doc.id)}>
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
    const { documents, filters, headers, page, total } = this.state
    return (
      <div className="row my-4">
        <div className="col-md-12"><h4>DOCUMENTS</h4></div>
        <div className="col-md-12">
          <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}
            buttons={() => {
              if (hasPrivilege('edit')) {
                return (<a className="btn btn-primary mr-4" href="" onClick={this.onCreateDocument}>New Document</a>)
              } else {
                return (<div></div>)
              }
            }}>
            {/* <DocumentFilters onChangeFilter={this.applyFilters} filters={filters} /> */}
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
          documents.length > 0 &&
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
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { customer, document } = state
  return {
    ...document,
    ...customer,
    ...props,
  }
}

export default withRouter(connect(mapStateToProps)(CustomerDocuments))
