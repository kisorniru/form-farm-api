import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { setCustomer } from '../../state/actions'
import { updateCustomer } from '../../api/customers'
import { defaultCustomer } from '../../config/data'
import FileUploader from '../../components/FileUploader'

class CustomerBranding extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDerived: false,
      customer: defaultCustomer
    }

    this.onChangeField = this.onChangeField.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.isDerived) {
      return { customer: props.customer, isDerived: true }
    }

    return null
  }

  onChangeField(property, b64) {
    const customer = {
      ...this.state.customer,
      [property]: b64
    }
    this.setState({ customer })
  }

  onSubmit(event) {
    event.preventDefault()
    const { customer } = this.state

    updateCustomer(customer.id, customer)
      .then(response => {
        this.props.setCustomer(response)
        this.props.onStore()
        NotificationManager.success('The customer was updated succesfully')
      })
      .catch(error => {
        NotificationManager.error('There was an error updating the customer')
      })
  }

  render() {
    return (
      <div className="d-flex flex-column justify-content-between">
        <form className="container" onSubmit={this.onSubmit} autoComplete="off">
          <FileUploader
            parentClass="file-uploader"
            showLabel={true}
            name="header"
            label="Header Art"
            placeholder="...Select File"
            error={''}
            onChange={(b64) => this.onChangeField('new_header', b64)}
          />

          <FileUploader
            parentClass="file-uploader"
            showLabel={true}
            name="footer"
            label="Footer Art"
            placeholder="...Select File"
            error={''}
            onChange={(b64) => this.onChangeField('new_footer', b64)}
          />
          <FileUploader
            parentClass="file-uploader"
            showLabel={true}
            name="icon"
            label="Icon"
            placeholder="...Select File"
            error={''}
            onChange={(b64) => this.onChangeField('new_icon', b64)}
          />

          <div className="row justify-content-end">
            <div className="col-md-5">
              <button type="submit" className="btn btn-block btn-primary">Save</button>
            </div>
          </div>
        </form>
        <div className="instructions" style={{ marginTop: 80 }}>
          <strong style={{ color: '#000' }}>TIPS</strong>
          <p style={{ color: '#7b7b7b' }}><strong style={{ color: '#000' }}>Header and Footer Art</strong> is applied to the client’s forms and will show up in all printed and electronic versions of their documents (in the header and footer areas).</p>
          <p style={{ color: '#7b7b7b' }}><strong style={{ color: '#000' }}>Icon</strong> is displayed next to the company name in this app.</p>
        </div>
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
  setCustomer,
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerBranding)
