import React from 'react'
import CalculationFieldItem from './CalculationFieldItem'

class CalculationField extends React.Component {
  constructor(props) {
    super(props)

    this.defaultItem = {
      description: null,
      quantity: 0,
      price: 0,
      total: 0, // quantity * price
    }

    this.state = {
      value: null,
      total: 0,
      subtotal: 0,
      items: []
    }

    this.onInsertItem = this.onInsertItem.bind(this)
    this.onRemoveItem = this.onRemoveItem.bind(this)
    this.onChangeItem = this.onChangeItem.bind(this)
    this.calculateTotal = this.calculateTotal.bind(this)
  }

  static getDerivedStateFromProps( props, state ) {
    if (props.value !== state.value) {
      try {
        const value = JSON.parse(props.value)
        return { value: props.value, ...value }
      } catch (error) {
        return { value: props.value }
      }
    }

    return null
  }

  onInsertItem() {
    const { items } = this.state

    this.setState({
      items: [ ...items, this.defaultItem ]
    }, this.calculateTotal)
  }

  onRemoveItem(id) {
    let { items } = this.state
    const removed = items.splice(id, 1)

    this.setState({ items }, this.calculateTotal)
  }

  onChangeItem(property, value, index) {
    let { items } = this.state
    let item = {
      ...items[index],
      [property]: value
    }

    item.total = item.quantity * item.price

    items.splice(index, 1, item)

    this.setState({ items }, this.calculateTotal)
  }

  calculateTotal() {
    const { items } = this.state
    let total = 0
    items.map(item => total += item.total)
    this.setState({ subtotal: total, total }, () => {
      // pushing to parent
      const value = JSON.stringify(this.state)
      this.props.onChange(value)
    })
  }

  render() {
    const {
      items,
      subtotal,
      total,
    } = this.state

    const {
      disabled,
    } = this.props

    return (
      <div className="calculation-field">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <CalculationFieldItem item={item} key={index} index={index} disabled={disabled}
                onChangeProperty={this.onChangeItem}
                onRemoveItem={this.onRemoveItem} />
            ))}
          </tbody>
        </table>

        <div className="calculation-field-footer">
          <span></span>

          <div className="total">
            <div><span>Subtotal:</span><span>{subtotal}</span></div>
            <div><b>Amount due:</b><span>{total}</span></div>
          </div>
        </div>
      </div>
    )
  }
}

export default CalculationField
