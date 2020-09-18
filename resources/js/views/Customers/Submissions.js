import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { getSubmissions } from '../../api/documents'
import { baseURL } from '../../config/api'
import { hasAccess } from '../../extensions'
import Filters from '../../components/Filters'
import Cell from '../../components/Table/Cell'
import Checkbox from '../../components/Checkbox'
import Pagination from 'react-js-pagination'
import TemplateIcon from '../../Icons/TemplateIcon'
// import DocumentFilters from '../Documents/Filters'


class CustomerSubmissions extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      total: 0,
      page: 1,
      documents: [],
      customer: null,
      hasSubmissionSelected: false,
      selectedSubmissions: '',
      filters: {
        limit: 5,
        page: 1,
        customer: 0,
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
    this.loadSubmissions = this.loadSubmissions.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.changePage = this.changePage.bind(this)
    this.onSelectSubmission = this.onSelectSubmission.bind(this)
    this.onMassSubmissionSelect = this.onMassSubmissionSelect.bind(this)
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
      this.loadSubmissions()
    }
  }

  loadSubmissions() {
    getSubmissions({ ...this.state.filters })
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
      this.loadSubmissions()
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

    this.setState({ filters }, this.loadSubmissions)
  }

  changePage (page) {
    this.applyFilters('page', page)
  }

  onSelectSubmission (id) {
    if (hasAccess('documents') || hasAccess('everything')) {
      this.props.history.push(`/dashboard/customers/${this.props.customer.id}/submissions/${id}`)
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onMassSubmissionSelect (id, checked) {
    let { selectedSubmissions } = this.state
    let hasSubmissionSelected = false
    if (id === 'all') {
      selectedSubmissions = checked ? 'all' : ''
    } else {
      selectedSubmissions = selectedSubmissions.split(',')
      let position = selectedSubmissions.indexOf(id.toString())

      if (position >= 0) {
        selectedSubmissions.splice(position, 1)
      } else {
        selectedSubmissions.push(id)
      }

      selectedSubmissions = selectedSubmissions.join(',')
    }

    if (selectedSubmissions.length > 0) {
      hasSubmissionSelected = true
    }
    this.setState({ selectedSubmissions, hasSubmissionSelected })
  }

  optionsRender () {
    const { selectedSubmissions } = this.state
    let selectedSubmissionsCount = selectedSubmissions.length > 0 ? selectedSubmissions.split(',').length - 1 : 0
    let doc = undefined

    if (selectedSubmissionsCount == 1) {
      doc = selectedSubmissions.split(',')[1]
    }

    return (
      <Cell colspan={5} header={true}>
        {
          selectedSubmissionsCount == 1 &&
          <div style={{display:'inline-block'}}>
            <a href={`${baseURL}/documents/${doc}/download`} download className="btn btn-link">Download</a>
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
    const { selectedSubmissions, hasSubmissionSelected, headers } = this.state
    return (
      <tr key="heading">
        <td width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={selectedSubmissions == 'all'}
            name="massive-document-selection"
            option={{ id: 'all', label: '' }}
            onChange={(target) => { this.onMassSubmissionSelect('all', target.checked) }}
          />
        </td>
        {
          !hasSubmissionSelected &&
          Object.keys(headers).map((item, index) => (<th key={index}>{headers[item]}</th>))
        }
        {
          hasSubmissionSelected &&
          this.optionsRender()
        }
      </tr>
    )
  }

  renderTableRow(doc, index) {
    const { selectedSubmissions } = this.state
    const list = selectedSubmissions.split(',')

    return (
      <tr key={`submission-row-${index}`}>
        <td key={`massive-submission-selection-${index}`} width={20}>
          <Checkbox
            className="checkbox checkbox-gray"
            selected={list.includes(doc.id.toString()) || selectedSubmissions == 'all'}
            name="massive-submission-selection"
            option={{ id: index, label: '' }}
            onChange={(target) => { this.onMassSubmissionSelect(doc.id, target.checked) }}
          />
        </td>
        <td onClick={() => this.onSelectSubmission(doc.id)}>
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
    const { documents, filters, headers, page, total } = this.state
    return (
      <div className="row my-4">
        <div className="col-md-12"><h4>SUBMISSIONS</h4></div>
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

const mapStateToProps = (state, props) => {
  const { customer, document } = state
  return {
    ...document,
    ...customer,
    ...props,
  }
}

export default withRouter(connect(mapStateToProps)(CustomerSubmissions))
