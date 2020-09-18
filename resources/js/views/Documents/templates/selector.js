import React from 'react'
import { Link } from 'react-router-dom'
import { getTemplates } from '../../../api/templates'
import { initials } from '../../../extensions'

class TemplateSelector extends React.Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      templates: []
    }

    this.loadTemplates = this.loadTemplates.bind(this)
    this.renderTemplate = this.renderTemplate.bind(this)
  }

  componentDidMount() {
    this._isMounted = true
    this.loadTemplates()
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  loadTemplates() {
    getTemplates({ limit: 10000 })
      .then(response => {
        if (this._isMounted) {
          this.setState({ templates: response.data })
        }
      })
      .catch(error => console.log('Error getting Templates'))
  }

  renderTemplate(template, index) {
    const { selected, disableSelection } = this.props
    const classes = [
      'template',
      (selected == template.id) && 'active',
      (disableSelection) && 'inactive'
    ].filter(e => !!e).join(' ')

    return (
      <div className={classes} key={index} onClick={() => this.props.onSelectTemplate(template)}>
        <span className="circle">{initials(template.name, 2)}</span>
        <div className="content">
          <span>{template.name}</span>
          <p>{template.description}</p>
        </div>
      </div>
    )
  }

  render() {
    const { templates } = this.state

    return (
      <div className="templates-selector">
        <h2>Templates</h2>

        <div className="row">
          <div className="col">
            <p>Don't want to use a template? <a href="" onClick={this.props.toggleOrigin}>Add Fields</a></p>
          </div>
        </div>

        <div className="list">
          {templates.map((template, index) => this.renderTemplate(template, index))}
        </div>

        <div className="d-block text-center">
          <Link className="btn btn-link my-2" to={`/dashboard/settings/templates/new`}>New Template</Link>
        </div>
      </div>
    )
  }

}

export default TemplateSelector
