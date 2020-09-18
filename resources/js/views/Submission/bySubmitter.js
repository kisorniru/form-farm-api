import React from 'react'
import { withRouter } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { getSubmissions } from '../../api/documents'
import { hasAccess } from '../../extensions'
import { baseURL } from '../../config/api'
import Filters from '../../components/Filters'
import Cell from '../../components/Table/Cell'
import Checkbox from '../../components/Checkbox'
import Pagination from 'react-js-pagination'
import TemplateIcon from '../../Icons/TemplateIcon'
// import DocumentFilters from '../Documents/Filters'


class SubmissionsBySubmitter extends React.Component {
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
        search: null,
      },
      headers: {
        name: 'Document Name',
        submitter: 'Submitter',
        created_at: 'Created',
        updated_at: 'Updated'
      }
    }

    this.reset = this.reset.bind(this)
    this.loadDocuments = this.loadDocuments.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.changePage = this.changePage.bind(this)
    this.onSelectDocument = this.onSelectDocument.bind(this)
    this.onMassSelect = this.onMassSelect.bind(this)
    this.optionsRender = this.optionsRender.bind(this)
    this.renderTableHeader = this.renderTableHeader.bind(this)
    this.renderTableBody = this.renderTableBody.bind(this)
    this.renderTableRow = this.renderTableRow.bind(this)
  }

  componentDidUpdate(nextProps) {
    if (this.props.submitter !== nextProps.submitter) {
      this.loadDocuments()
    }
  }

  loadDocuments() {
    getSubmissions({ ...this.state.filters, submitter: this.props.submitter, status: 'submitted'})
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

    if (value.length == 0) {
      delete filters[name]
    }

    this.setState({ filters }, this.loadDocuments)
  }

  changePage (page) {
    this.applyFilters('page', page)
  }

  onSelectDocument (id) {
    if (hasAccess('documents') || hasAccess('everything')) {
      this.props.history.push(`/dashboard/customers/${this.props.customer.id}/submissions/${id}`)
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

  optionsRender () {
    const { selectedDocuments } = this.state
    let selectedDocumentsCount = selectedDocuments.length > 0 ? selectedDocuments.split(',').length - 1 : 0
    let doc = undefined

    if (selectedDocumentsCount == 1) {
      doc = selectedDocuments.split(',')[1]
    }

    return (
      <Cell colspan={5} header={true}>
        {
          selectedDocumentsCount == 1 &&
          <div style={{display:'inline-block'}}>
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
        <td>{doc.submitter_name}</td>
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
    const { documents, filters, page, total } = this.state
    return (
      <div className="row my-4">
        <div className="col-md-12"><h4>MORE FROM THIS SUBMITTER</h4></div>
        <div className="col-md-12">
          <Filters onChangeSearch={this.applyFilters} search={filters.search && filters.search} reset={this.reset}>
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

export default withRouter(SubmissionsBySubmitter)
