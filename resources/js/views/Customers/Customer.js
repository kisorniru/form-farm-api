import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { setCustomer, toggleCustomerModal, cleanCustomer } from '../../state/actions'
import { hasAccess, hasPrivilege } from '../../extensions'
import { getCustomer } from '../../api/customers'
import Modal from '../../components/Modal'
import CustomerSubmissions from './Submissions'
import CustomerDocuments from './documents'
import CustomerBranding from './Branding'
import CustomerReports from './Reports'
import CustomerGroups from './groups'
import CustomerUsers from './users'
import EditCustomer from './edit'
import Billing from './Billing'

class Customer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      createGroup: false,
      createUser: false,
      billingModal: false,
      brandingModal: false,
      reportsModal: false,
    }

    this.onCreateDocument = this.onCreateDocument.bind(this)
    this.onCreateGroup = this.onCreateGroup.bind(this)
    this.onCreateUser = this.onCreateUser.bind(this)
    this.loadCustomer = this.loadCustomer.bind(this)
    this.toggleBillingModal = this.toggleBillingModal.bind(this)
    this.toggleBrandingModal = this.toggleBrandingModal.bind(this)
    this.toggleCustomerModal = this.toggleCustomerModal.bind(this)
    this.toggleReportsModal = this.toggleReportsModal.bind(this)
  }

  componentDidMount() {
    this.loadCustomer()
  }

  componentWillUnmount() {
    this.props.cleanCustomer()
  }

  loadCustomer() {
    const { match: { params } } = this.props

    getCustomer(params.customer)
      .then(customer => {
        this.props.setCustomer(customer)
      })
      .catch(error => console.log(error))
  }

  onCreateDocument(event) {
    event.preventDefault()
    if ((hasAccess('documents') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.props.setDocumentCustomer(this.props.customer)
      this.props.history.push('/dashboard/documents/new')
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onCreateGroup(event) {
    event.preventDefault()
    if ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.setState({ createGroup: true })
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  onCreateUser(event) {
    event.preventDefault()
    if ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) {
      this.setState({ createUser: true })
    } else {
      NotificationManager.error('You are not allowed to do this action')
    }
  }

  toggleCustomerModal(event) {
    if (event) event.preventDefault()
    const { showCustomerModal } = this.props
    this.props.toggleCustomerModal(!showCustomerModal)
  }

  toggleBillingModal(event) {
    if (event) event.preventDefault()
    this.setState({ billingModal: !this.state.billingModal })
  }

  toggleBrandingModal(event) {
    if (event) event.preventDefault()
    this.setState({ brandingModal: !this.state.brandingModal })
  }

  toggleReportsModal() {
    this.setState({ reportsModal: !this.state.reportsModal })
  }

  render() {
    const { createGroup, createUser, billingModal, brandingModal, reportsModal } = this.state
    const { customer, showCustomerModal } = this.props

    return (
      <div className="container-fluid mb-4">
        <div className="row">
          <div className="col-md-10">
            {/* BREADCRUMB */}
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/dashboard/customers">Customers</Link>
                </li>
                <li className="breadcrumb-item active">
                  {
                    !customer.icon &&
                    <span className="initials">{customer.initials}</span>
                  }
                  {
                    customer.icon &&
                    <img className="customer-icon" src={customer.icon} />
                  }
                  <span>{customer.name}</span>
                </li>
              </ol>
            </nav>
          </div>
          <div className="col-md-1 d-flex justify-content-end">
            <button className="btn btn-link" onClick={this.toggleReportsModal}>Reports</button>
          </div>
          <div className="col-md-1">
            {/* OPTIONS */}
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
                {
                  ((hasAccess('documents') || hasAccess('everything')) && hasPrivilege('edit')) &&
                  <a href="" className="dropdown-item" onClick={this.onCreateDocument}>New Document</a>
                }

                {
                  (hasAccess('everything') && hasPrivilege('edit')) &&
                  <a href="" className="dropdown-item" onClick={this.onCreateUser}>New User</a>
                }
                {
                  ((hasAccess('settings') || hasAccess('everything')) && hasPrivilege('edit')) &&
                  <a href="" className="dropdown-item" onClick={this.onCreateGroup}>New Group</a>
                }
                <a href="" className="dropdown-item" onClick={this.toggleBrandingModal}>Branding</a>
                <a href="" onClick={this.toggleCustomerModal} className="dropdown-item">Customer Settings</a>
                <a href="" onClick={this.toggleBillingModal} className="dropdown-item">Billing</a>
              </div>
            </div>
          </div>
        </div>

        <CustomerSubmissions />

        <CustomerDocuments />

        <CustomerUsers toggleModal={createUser} closeModal={() => this.setState({ createUser: false })} />

        <CustomerGroups toggleModal={createGroup} closeModal={() => this.setState({ createGroup: false })} />

        {
          showCustomerModal &&
          <Modal title={'Edit Customer'} show={showCustomerModal} onClose={this.toggleCustomerModal}>
            <EditCustomer onStore={this.toggleCustomerModal} />
          </Modal>
        }

        {
          billingModal &&
          <Modal title="Billing" show={billingModal} onClose={this.toggleBillingModal}>
            <Billing />
          </Modal>
        }

        {
          reportsModal &&
          <Modal center title="Reports" show={reportsModal} onClose={this.toggleReportsModal}>
            <CustomerReports customerId={customer.id} />
          </Modal>
        }

        {
          brandingModal &&
          <Modal title="Branding" show={brandingModal} onClose={this.toggleBrandingModal}>
            <CustomerBranding onStore={this.toggleBrandingModal} />
          </Modal>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { customer } = state
  return {
    ...customer,
    ...props
  }
}

const mapDispatchToProps = {
  toggleCustomerModal,
  cleanCustomer,
  setCustomer,
}

export default connect(mapStateToProps, mapDispatchToProps)(Customer)
