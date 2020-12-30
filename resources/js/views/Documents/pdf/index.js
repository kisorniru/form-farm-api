import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { pdfFieldsToJson } from '../../../api/templates'
import { updateDocument, attachJsonFields, getDocumentField, getDocumentFields } from '../../../api/documents'
import { setDocument } from '../../../state/actions'
import PDFLinking from '../../../components/PDFLinking'
import Modal from '../../../components/Modal'
import DocumentFieldForm from '../fields/form'

class DocumentPDFLinking extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      reloadFields: false,
      showFieldModal: false,
      document: {},
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
    if (props.document !== state.document) {
      return { document: props.document, reloadFields: true }
    }

    return null
  }

  onUploadFile(base64, fields) {
    const { document } = this.props

    attachJsonFields(document.id, { fields })
      .then(response => {
        NotificationManager.success("The fields were synced successfully")
        this.setState({ fields: response.data })
      })
      .catch(error => console.log(error))

    updateDocument(document.id, { ...document, pdf_data: base64 })
      .then(document => {
        this.props.setDocument(document)
        NotificationManager.success('The file was uploaded successfully')
      })
      .catch(error => {
        NotificationManager.error('Error uploading the file')
      })
  }

  onChooseField(index, id) {
    const { document } = this.props

    getDocumentField(document.id, id)
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
    const { document } = this.state

    getDocumentFields(document.id)
      .then(fields => this.setState({ fields, reloadFields: false }))
      .catch(error => this.setState({ reloadFields: false }))
  }
  render() {
    const { fields, showFieldModal, field } = this.state
    const { document } = this.props
    return (
      <div className="container-fluid">
        <PDFLinking preview={document.preview_url} fields={fields} onUploadFile={this.onUploadFile} onChooseField={this.onChooseField} />

        {
          showFieldModal &&
          <Modal title="Edit Field" show={showFieldModal} onClose={this.closeModal}>
            <DocumentFieldForm field={field} closeModal={this.closeModal} onStore={this.closeModal} onCancel={this.closeModal} />
          </Modal>
        }
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

export default connect(mapStateToProps, mapDispatchToProps)(DocumentPDFLinking)
