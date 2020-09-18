import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { getSetupIntent, getSubscriptionInfo, addPaymentMethod, removePaymentMethod, subscribeToPlan } from '../../api/customers'
import { getPlans } from '../../api/plans'
import dateFormat from 'dateFormat'
import CardIcon from '../../Icons/CardIcon'

class Billing extends React.Component {
  stripe = null
  cardElement = undefined

  constructor(props) {
    super(props)

    this.state = {
      cardName: '',
      hasSubscription: false,
      paymentMethods: [],
      subscription: [],
      plans: [],
      selectedInterval: 'month',
      selectedPlan: null,
      managePlans: false,
      managePaymentMethods: false,
      choosingPlan: false,
      intent: {}
    }

    this.renderSubscriptionForm = this.renderSubscriptionForm.bind(this)
    this.onRemovePaymentMethod = this.onRemovePaymentMethod.bind(this)
    this.renderPaymentMethods = this.renderPaymentMethods.bind(this)
    this.loadSubscription = this.loadSubscription.bind(this)
    this.onChangePlan = this.onChangePlan.bind(this)
    this.onChoosePlan = this.onChoosePlan.bind(this)
    this.loadIntent = this.loadIntent.bind(this)
    this.changeName = this.changeName.bind(this)
    this.submit = this.submit.bind(this)
  }

  componentDidMount() {
    this.loadSubscription()
    this.loadPlans()
  }

  loadIntent() {
    const { customer } = this.props
    getSetupIntent(customer.id)
      .then(intent => {
        this.stripe = Stripe(intent.st_key)
        const elements = this.stripe.elements()
        this.cardElement = elements.create('card')
        this.cardElement.mount('#card-element')
        this.setState({ intent })
      })
      .catch(error => console.log(error))
  }

  loadSubscription() {
    const { customer } = this.props

    getSubscriptionInfo(customer.id)
      .then(response => this.setState({ ...response }))
      .catch(error => console.log(error))
  }

  loadPlans() {
    getPlans({ limit: 1000 })
      .then(response => this.setState({ plans: response.data }))
      .catch(error => console.log(error))
  }

  onTogglePaymentMethods(value = null) {
    if (!value) {
      value = !this.state.managePaymentMethods
    }

    this.setState({ managePaymentMethods: value }, () => {
      if (value) {
        this.loadIntent()
      }
    })
  }

  onRemovePaymentMethod(id) {
    const { customer } = this.props
    removePaymentMethod(customer.id, { payment_method: id })
      .then(response => NotificationManager.success(response.message) || this.loadSubscription())
      .catch(error => NotificationManager.error(error.message) || console.log(error.error))
  }

  onChangePlan(value) {
    this.setState({ managePlans: value, manangePaymentMethods: false })
  }

  onChoosePlan() {
    const { selectedPlan, paymentMethods, choosingPlan } = this.state
    const { customer } = this.props

    if (paymentMethods.length > 0 || choosingPlan) {
      subscribeToPlan(customer.id, { planId: selectedPlan })
        .then(response => {
          NotificationManager.success(response.message)
          this.setState({ choosingPlan: false, managePlans: false, managePaymentMethods: false }, this.loadSubscription)
        })
        .catch(error => NotificationManager.error(error.message) || console.log(error.error))
    } else {
      this.setState({ choosingPlan: true, managePlans: false, managePaymentMethods: true })
      this.loadIntent()
      console.log('doesn\'t have a payment method')
    }
  }

  changeName({ target }) {
    const { value } = target
    this.setState({ cardName: value })
  }

  async submit() {
    const { customer } = this.props
    const { cardName, intent, choosingPlan } = this.state
    const { client_secret } = intent

    const { setupIntent, error } = await this.stripe.handleCardSetup(
      client_secret, this.cardElement, {
      payment_method_data: {
        billing_details: { name: cardName }
      }
    }
    );

    if (error) {
      NotificationManager.error(error.message)
    } else {
      addPaymentMethod(customer.id, { paymentMethod: setupIntent.payment_method })
        .then(response => {
          NotificationManager.success(response.message)
          if (choosingPlan) {
            this.onChoosePlan()
          } else {
            this.loadSubscription()
            this.setState({ managePaymentMethods: false })
          }
        })
        .catch(error => {
          NotificationManager.error(error.message)
        })
    }
  }

  renderSubscriptionForm() {
    const { subscription, plans, selectedInterval, selectedPlan } = this.state
    let currentPlan = { id: 0 }
    if (subscription) {
      currentPlan = subscription.plan
    }
    const intervals = [...(new Set(plans.map(plan => plan.interval)))].sort((p1, p2) => p1 < p2 ? -1 : 1)

    let groups = []
    intervals.forEach((interval) => {
      groups[interval] = plans.filter(plan => plan.interval === interval).sort((p1, p2) => parseInt(p1.amount * 100) < parseInt(p2.amount * 100) ? -1 : 1)
    })

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="toggle-intervals">
            {intervals.map(interval => (
              <span key={interval} className={`interval-option ${selectedInterval == interval ? 'active' : ''}`} onClick={() => this.setState({ selectedInterval: interval })}>{`${interval}ly`}</span>
            ))}
          </div>

          <div className="plans">
            {groups[selectedInterval].map(plan => (
              <div className={`plan ${plan.id == selectedPlan ? 'active' : ''} ${currentPlan && !selectedPlan ? (currentPlan.id == plan.stripe_id ? 'active' : '') : ''}`} key={plan.id} onClick={() => this.setState({ selectedPlan: plan.id })}>
                <div className="plan-name">
                  <h3>{plan.name} {currentPlan.id == plan.stripe_id && <span>(Current Plan)</span>} </h3>
                  <p>{plan.description}</p>
                </div>
                <div className="plan-amount">
                  <span>${plan.amount}</span><small>/ {plan.interval}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )

  }

  renderSubscription() {
    const { hasSubscription, subscription, managePlans } = this.state

    return (
      <div className="row border-bottom">
        <div className="col-md-12">
          <h3>Subscription</h3>
        </div>
        <div className="col-md-12">
          {
            (!hasSubscription && !managePlans) &&
            <div className="alert alert-danger" role="alert">The customer doesn't have a Current Subscription</div>
          }

          {
            (hasSubscription && !managePlans) &&
            <div className="current-plan-section">
              <div className="plan-info">
                <h3>{subscription.plan.name} <span>/ {subscription.plan.interval}</span></h3>
                <p>{subscription.plan.description}</p>
                <p>Your subscription will renew on {dateFormat(new Date(subscription.period_end * 1000), 'mmmm d, yyyy')}</p>
              </div>
              <div className="plan-amount">
                <span>${subscription.plan.amount}</span><small>/ {subscription.plan.interval}</small>
              </div>
            </div>
          }

          {
            (!hasSubscription && !managePlans) &&
            <button type="button" className="btn btn-block btn-primary my-4" onClick={() => this.onChangePlan(true)}>Choose a plan</button>
          }

          {
            (hasSubscription && !managePlans) &&
            <button type="button" className="btn btn-block btn-primary my-4" onClick={() => this.onChangePlan(true)}>Change Plan</button>
          }

          {
            managePlans &&
            <div className="subscription-form">
              {this.renderSubscriptionForm()}
            </div>
          }

          {
            managePlans &&
            <div className="buttons-group d-flex justify-content-between my-4">
              <button type="button" className="btn btn-link" onClick={() => this.onChangePlan(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={this.onChoosePlan}>Choose plan</button>
            </div>
          }
        </div>
      </div>
    )
  }

  renderPaymentMethod() {
    const { managePaymentMethods } = this.state

    return (
      <div className="row">
        {
          !managePaymentMethods &&
          <div className="col-md-12">
            <h3 className="mt-4">Payment Method</h3>
            {this.renderPaymentMethods()}
            <button type="button" className="btn btn-block btn-primary mt-4" onClick={() => this.onTogglePaymentMethods(true)}>Add Payment Method</button>
          </div>
        }

        {
          managePaymentMethods &&
          <div className="col-md-12">
            <h3>Add Payment Method</h3>
            <div className="input-group mb-4">
              <label>Card Name</label>
              <input className="form-control" id="card-holder-name" type="text" onChange={this.changeName} />
            </div>
            <div id="card-element"></div>
            <div className="buttons-group d-flex justify-content-between my-4">
              <button type="button" className="btn btn-link mt-4" onClick={() => this.onTogglePaymentMethods(false)}>Cancel</button>
              <button type="button" className="btn btn-primary mt-4" onClick={this.submit}>Add Payment Method</button>
            </div>
          </div>
        }
      </div>
    )
  }

  renderPaymentMethods() {
    const { paymentMethods } = this.state

    return (
      <ul className="list-group list-group-flush w-100">
        {
          paymentMethods.map((paymentMethod, index) => (
            <li className="list-group-item payment-card-item" key={index}>
              <CardIcon brand={paymentMethod.card.brand} />
              <div className="card-info">
                <span className="card-info-number"> <span>●●●● ●●●● ●●●●</span> <span>{paymentMethod.card.last4}</span></span>
                <span className="card-info-expiration">Expires in {paymentMethod.card.exp_month}/{paymentMethod.card.exp_year}</span>
              </div>
              <span className="btn btn-link" onClick={() => this.onRemovePaymentMethod(paymentMethod.id)}>Remove</span>
            </li>
          ))
        }
      </ul>
    )
  }

  render() {
    const { managePlans, managePaymentMethods } = this.state

    return (
      <div className="container">
        {
          !managePaymentMethods &&
          this.renderSubscription()
        }

        {
          !managePlans &&
          this.renderPaymentMethod()
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { customer } = state
  return {
    ...customer,
    ...props,
  }
}

export default connect(mapStateToProps)(Billing)
