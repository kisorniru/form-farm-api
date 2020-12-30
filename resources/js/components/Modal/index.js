import React from 'react'
import CloseIcon from '../../Icons/CloseIcon'

class Modal extends React.Component {
  constructor (props) {
    super(props)
    this.close = this.close.bind(this)
  }

  componentDidMount() {
    if (this.props.show) {
      document.body.style = 'overflow: hidden'
    }
  }

  componentWillUnmount() {
    document.body.removeAttribute('style')
  }

  close (event) {
    const { target } = event
    if (target.id == 'custom-modal' || target.id == 'custom-modal-close') {
      this.props.onClose()
    }
  }

  render () {
    const { title, show, children, center } = this.props

    return (
      <div className={`custom-modal ${center && 'center'} ${show ? 'show' : ''}`} id="custom-modal" onClick={this.close}>
        <div className="custom-modal-content">
          <div className="custom-modal-header">
            <h3>{title}</h3>
            <a href="javascript:void(0)" className="btn btn-link" id="custom-modal-close" onClick={this.props.onClose}>{ !center ? 'close' : <CloseIcon /> }</a>
          </div>
          <div className="custom-modal-body">
            {children}
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
