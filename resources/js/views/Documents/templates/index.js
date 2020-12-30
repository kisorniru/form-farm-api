import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { setDocument } from '../../../state/actions'
import { updateDocument, insertFieldToDocument } from '../../../api/documents'
import DocumentBuilder from '../Builder'
import TemplateSelector from './selector'
import TemplatePreviewFields from './preview'

class DocumentTemplate extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      template: {}
    }

    this.previewTemplate = this.previewTemplate.bind(this)
    this.onChooseTemplate = this.onChooseTemplate.bind(this)
    this.updateDocumentOrigin = this.updateDocumentOrigin.bind(this)
  }

  previewTemplate(template) {
    this.setState({ template })
  }

  updateDocumentOrigin(event) {
    event.preventDefault()

    updateDocument(this.props.document.id, { ...this.props.document, use_template: false })
      .then(document => {
        this.props.setDocument(document)
      })
      .catch(error => NotificationManager.error(error.message || 'There waas an error updating the document'))
  }

  onChooseTemplate(template_id, fields) {
    const { document } = this.props

    const promises = [
      updateDocument(document.id, { ...document, template: template_id })
    ]

    fields.map(field => promises.push( insertFieldToDocument(document.id, { ...field, field: field.id }) ))

    Promise.all(promises)
      .then(response => {
        this.props.setDocument(response[0]) // document
      })
      .catch(error => NotificationManager.error(error.message || 'There was an error updating the document'))
  }

  render() {
    const { template } = this.state
    const { document } = this.props

    return (
      <div className="templates-selector">
        <div className="row">
          <div className="col-md-4">
            <TemplateSelector
              selected={template}
              disableSelection={document.template ? true : false}
              onSelectTemplate={this.previewTemplate}
              toggleOrigin={this.updateDocumentOrigin} />
          </div>

          <div className="col-md-8">
            {
              document.template &&
              <DocumentBuilder hideDocumentOptions={true} />
            }

            {
              (!document.template && template.id) &&
              <TemplatePreviewFields template={template} onChooseTemplate={this.onChooseTemplate} />
            }
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { document } = state
  return {
    ...document,
    ...props,
  }
}

const mapDispatchToProps = {
  setDocument,
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentTemplate)
