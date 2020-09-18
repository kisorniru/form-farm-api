import React from 'react'
import CloseIcon from '../../Icons/CloseIcon'

class CalculationFieldItem extends React.Component {
  constructor(props) {
    super(props)

    this.onChangeProperty = this.onChangeProperty.bind(this)
  }

  onChangeProperty(event) {
    const { target } = event
    const { name, value } = target

    this.props.onChangeProperty(name, value, this.props.index)
  }

  render() {
    const {
      disabled,
      item
    } = this.props

    return (
      <tr className="calculation-item">
        <td>{ !disabled && <button type="button" onClick={this.props.onRemoveItem}><CloseIcon /></button> }</td>
        <td><textarea className="form-control" rows="1" name="description" onChange={this.onChangeProperty} readOnly={disabled} value={item.description} /></td>
        <td><input className="form-control" type="number" name="quantity" onChange={this.onChangeProperty} value={item.quantity} readOnly={disabled} /></td>
        <td><input className="form-control" type="number" name="price" onChange={this.onChangeProperty} value={item.price}  readOnly={disabled} /></td>
        <td><input className="form-control" type="number" name="total" value={item.total} readOnly /></td>
      </tr>
    )
  }
}

export default CalculationFieldItem
