import React from 'react'
import ReactSVG from 'react-svg'

class CardIcon extends React.Component {
  render() {
    const { style = "flat", brand = 'default' } = this.props
    return (<ReactSVG className={`payment-card payment-card-${brand}`} src={`images/icons/cards/${style}/${brand}.svg`} />)
  }
}

export default CardIcon
