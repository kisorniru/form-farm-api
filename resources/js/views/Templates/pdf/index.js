import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { updateTemplate, pdfFieldsToJson, attachJsonFields, getTemplateField, getTemplateFields } from '../../../api/templates'
import { setTemplate } from '../../../state/actions'
import PDFLinking from '../../../components/PDFLinking'
import Modal from '../../../components/Modal'
// import TemplateFieldForm from '../fields/form'
// import TemplatePDFFields from './fields'
import Loader from '../../../components/Loader'

class TemplatePDFLinking extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      reloadFields: false,
      showFieldModal: false,
      template: {},
      fields: [],
      field: null,
    }

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.reloadFields = this.reloadFields.bind(this)
    this.onUploadFile = this.onUploadFile.bind(this)
    this.onChooseField = this.onChooseField.bind(this)
  }

  componentDidMount() {
    this.reloadFields()
  }

  componentDidUpdate(props, state) {
    if (state.reloadFields) {
      this.reloadFields()
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.template !== state.template) {
      return { template: props.template, reloadFields: true }
    }

    return null
  }

  onUploadFile(base64, fields) {
    const { template } = this.props

    attachJsonFields(template.id, { fields })
      .then(response => {
        NotificationManager.success("The fields were synced successfully")
        this.setState({ fields: response.data })
      })
      .catch(error => console.log(error))

    updateTemplate(template.id, { ...template, pdf_data: base64 })
      .then(template => {
        this.props.setTemplate(template)
        NotificationManager.success('The file was uploaded successfully')
      })
      .catch(error => {
        NotificationManager.error('Error uploading the file')
      })
  }

  onChooseField(index, id) {
    const { template } = this.props

    getTemplateField(template.id, id)
      .then(field => {
        if (typeof field.metadata == 'string') {
          field.metadata = JSON.parse(field.metadata)
        }

        this.setState({ field }, this.openModal)
      })
  }

  openModal() {
    this.setState({ showFieldModal: true })
  }

  closeModal() {
    this.setState({ field: null, showFieldModal: false })
  }

  reloadFields() {
    const { template } = this.state

    getTemplateFields(template.id)
      .then(fields => this.setState({ fields, reloadFields: false }))
      .catch(error => this.setState({ reloadFields: false }))
  }
  render() {
    const { fields, showFieldModal, field } = this.state
    const { template } = this.props
    return (
      <div className="container-fluid">
        <PDFLinking preview={template.preview_url} fields={fields} onUploadFile={this.onUploadFile} onChooseField={this.onChooseField} />

        <Modal title="Edit Field" show={showFieldModal} onClose={this.closeModal}>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { template } = state
  return {
    ...template,
    ...props,
  }
}

const mapDispatchToProps = {
  setTemplate,
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplatePDFLinking)
