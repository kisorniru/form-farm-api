import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getTemplate } from '../../api/templates'
import { cleanTemplate, setTemplate } from '../../state/actions'
import { defaultTemplate } from '../../config/data'
import Breadcrumbs from '../../components/Breadcrumbs'
import Modal from '../../components/Modal'
import TemplateForm from './form'
import TemplateAccess from './access'
import TemplatePDFLinking from './pdf'
import TemplateBuilder from './Builder'

class Template extends Component {
  loading = false

  constructor(props) {
    super(props)

    this.state = {
      breadcrumbs: defaultTemplate.breadcrumbs
    }

    this.loadTemplate = this.loadTemplate.bind(this)
  }

  componentDidMount() {
    const { match: { params } } = this.props

    if (params.template) {
      this.loadTemplate()
    } else {
      this.props.setTemplate(defaultTemplate.info)
    }
  }

  componentDidUpdate() {
    const { match: { params }, template } = this.props

    if (template && !this.loading) {
      if (template.id !== parseInt(params.template)) {
        this.loadTemplate()
      }
    }
  }

  loadTemplate() {
    const { match: { params } } = this.props
    const { breadcrumbs } = this.state


    if (params.template) {
      this.loading = true

      getTemplate(params.template)
        .then(template => {
          this.props.setTemplate(template)

          breadcrumbs[1] = {
            url: `/dashboard/settings/templates/${template.id}/edit`,
            name: template.name,
            active: true
          }

          this.setState({ breadcrumbs }, () => this.loading = false)
        })
        .catch(error => {
          this.loading = false
          console.log(error)
        })
    }
  }

  componentWillUnmount() {
    this.props.cleanTemplate()
  }

  render() {
    const { breadcrumbs } = this.state
    const { template } = this.props

    return (
      <div className="container-fluid mb-4">
        <div className="row">
          <div className="col">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <ul className="nav nav-tabs template-tabs" id="template-tabs" role="tablist">
              <li className="nav-item">
                <a className="nav-link active" id="form-tab" data-toggle="tab" href="#form" role="tab" aria-controls="form" aria-selected="true">Form</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" id="options-tab" data-toggle="tab" href="#options" role="tab" aria-controls="options" aria-selected="false">Options</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" id="access-tab" data-toggle="tab" href="#access" role="tab" aria-controls="access" aria-selected="false">Customer & group access</a>
              </li>
              {
                (template.type == 'pdf' && template.id) &&
                <li className="nav-item">
                  <a className="nav-link" id="pdf-tab" data-toggle="tab" href="#pdf" role="tab" aria-controls="pdf" aria-selected="false">PDF Linking</a>
                </li>
              }
            </ul>
            <div className="row">
              <div className="col">
                <div className="tab-content" id="template-content">
                  <div className="tab-pane fade show active" id="form" role="tabpanel" arial-labelledby="form-tab">
                    <TemplateBuilder />
                  </div>
                  <div className="tab-pane fade" id="options" role="tabpanel" aria-labelledby="options-tab">
                    <div className="container-fluid">
                      <div className="row template-container">
                        <div className="col-md-4 fields-container"></div>
                        <div className="col-md-8 tabs-container">
                          <TemplateForm />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tab-pane fade" id="access" role="tabpanel" aria-labelledby="access-tab">
                    <div className="container-fluid">
                      <div className="row template-container">
                        <div className="col-md-4 fields-container"></div>
                        <TemplateAccess />
                      </div>
                    </div>
                  </div>
                  {
                    (template.type == 'pdf' && template.id) &&
                    <div className="tab-pane fade" id="pdf" role="tabpanel" aria-labelledby="pdf-tab">
                      <TemplatePDFLinking />
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {
          !template.id &&
          <Modal title="Create Template" show={true} onClose={() => this.props.history.push(`/dashboard/settings/templates`)}>
            <TemplateForm onSave={path => this.props.history.push(path)} />
          </Modal>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { template } = state
  return {
    ...template,
    ...props
  }
}

const mapDispatchToProps = {
  cleanTemplate,
  setTemplate,
}

export default connect(mapStateToProps, mapDispatchToProps)(Template)
