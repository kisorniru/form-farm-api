import React from 'react'
import { Link } from 'react-router-dom'
import { getCustomer } from '../../api/customers'
import { getDocument, getDocumentFields } from '../../api/documents'
import { baseURL } from '../../config/api'
import SubmissionsBySubmitter from './bySubmitter'
import { truncateString } from '../../extensions'
import FormField from '../../components/FormBuilder/form/field'

class SubmissionPreview extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      customer: {},
      document: {},
      fields: [],
    }

    this.loadCustomer = this.loadCustomer.bind(this)
    this.loadDocument = this.loadDocument.bind(this)
    this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this)
  }

  componentDidMount() {
    this.loadCustomer()
    this.loadDocument()
  }

  componentDidUpdate(nextProps) {
    const { match: { params: oldParams } } = this.props
    const { match: { params: newParams } } = nextProps

    if (this.state.document.id !== newParams.document) {
      if (oldParams.document !== newParams.document) {
        this.loadCustomer()
        this.loadDocument()
      }
    }
  }

  loadCustomer() {
    const { match: { params } } = this.props

    getCustomer(params.customer)
      .then(customer => {
        this.setState({ customer })
      })
      .catch(error => console.log(error))
  }

  loadDocument() {
    const { match: { params } } = this.props

    getDocument(params.document)
      .then(document => {
        this.setState({ document })
      })
      .catch(error => console.log(error))

    getDocumentFields(params.document)
      .then(fields => this.setState({ fields }))
      .catch(error => console.log(error))
  }

  onDocumentLoadSuccess({ numPages }) {
    this.setState({ numPages, pageNumber: 1 })
  }

  render() {
    const { customer, document, fields } = this.state

    return (
      <div className="container-fluid mb-4">
        <div className="row">
          <div className="col-md-9">
            {/* BREADCRUMB */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/dashboard/customers">Customers</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={`/dashboard/customers/${customer.id}`}>
                    {
                      !customer.icon &&
                      <span className="initials">{customer.initials}</span>
                    }
                    {
                      customer.icon &&
                      <img className="customer-icon" src={customer.icon} />
                    }
                    <span>{customer.name}</span>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <span>Submissions</span>
                </li>
                <li className="breadcrumb-item active">
                  {
                    document.name &&
                    <span>{truncateString(document.name, 35)}</span>
                  }
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row my-4">
          <div className="col-md-9 d-flex align-items-center">
            <h5>{document.name}</h5>
          </div>
          <div className="col-md-3 d-flex align-items-center justify-content-end">
            <div className="dropdown-button dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                id="dropdownSettings"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                Settings
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownSettings">
                <a href={`${baseURL}/documents/${document.id}/download`} className="dropdown-item" download={document.name}>Download</a>
                <a href={`${baseURL}/documents/${document.id}/print`} className="dropdown-item" target="_blank">Print</a>
                <a href={`${baseURL}/documents/${document.id}/csv`} className="dropdown-item" download={document.name}>CSV</a>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="customer-header-preview">
            {
              customer.header &&
              <img width="240" src={customer.header} alt={`${customer.name} header`} />
            }
            {
              !customer.header &&
              <span>Customer Header</span>
            }
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-10 offset-md-1">
            {
              fields.map((field, index) => (
                <div key={index}>
                  <FormField field={{ ...field, isRemoved: true, disabled: true }} index={index} onChangeField={() => console.log('changed')} />
                </div>
              ))
            }
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="customer-header-preview">
            {
              customer.footer &&
              <img width="240" src={customer.footer} alt={`${customer.name} footer`} />
            }
            {
              !customer.footer &&
              <span>Customer Footer</span>
            }
            </div>
          </div>
      </div>

        <SubmissionsBySubmitter customer={customer} submitter={ document.submitter } />
      </div>
    )
  }
}

export default SubmissionPreview

