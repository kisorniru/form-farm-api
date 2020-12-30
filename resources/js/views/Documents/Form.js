import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
// import { Editor } from 'react-draft-wysiwyg'
// import { EditorState, convertToRaw, ContentState } from 'draft-js'
// import { editorSettings } from '../../config/editor'
import { defaultDocument } from '../../config/data'
import { setDocument, cleanDocument } from '../../state/actions'
import { addDocument, updateDocument } from '../../api/documents'
import { getCustomers } from '../../api/customers'
// import draftToHtml from 'draftjs-to-html'
// import htmlToDraft from 'html-to-draftjs'
import Field from '../../components/Field'
import RadioButtons from '../../components/RadioButton'
import Dropdown from '../../components/Dropdown'

class DocumentForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      document: defaultDocument.info,
      // editorState: EditorState.createEmpty(),
      error: null,
      errors: {},
      customers: [],
      customer: null
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.getCustomerName = this.getCustomerName.bind(this)
    // this.onChangeContent = this.onChangeContent.bind(this)
    this.onChangeCustomer = this.onChangeCustomer.bind(this)
    this.onChangeProperty = this.onChangeProperty.bind(this)
  }

  componentDidMount() {
    getCustomers({ limit: 1000 })
      .then(response => {
        const { data } = response
        const customers = data.map(customer => ({ key: customer.id, value: customer.name }))
        this.setState({ customers })
      })
      .catch(error => console.log(error))
  }

  static getDerivedStateFromProps(props, state) {
    if (props.document.id !== state.document.id) {
      // const blocksFromHtml = htmlToDraft(props.document.content || '')
      // const { contentBlocks, entityMap } = blocksFromHtml
      // const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
      // const editorState = EditorState.createWithContent(contentState)
      return {
        document: props.document,
        customer: props.document.customer,
        // editorState
      }
    }

    return null
  }

  getCustomerName() {
    const { customer, customers } = this.state
    const data = customers.find(cus => cus.key === customer)
    return data ? data.value : ''
  }

  // onChangeContent(editorState) {
  //   const content = draftToHtml(convertToRaw(editorState.getCurrentContent()))
  //   const document = {
  //     ...this.state.document,
  //     content
  //   }
  //   this.setState({ document, editorState })
  // }

  onChangeProperty(event) {
    const { name, value } = event.target
    const document = {
      ...this.state.document,
      [name]: value
    }

    this.setState({ document })
  }

  onChangeCustomer(customer) {
    const document = {
      ...this.state.document,
      customer: customer.key
    }

    this.setState({ document, customer: customer.key })
  }

  onSubmit(event) {
    event.preventDefault()
    const { document } = this.state
    const promise = document.id ? updateDocument(document.id, document) : addDocument(document)

    promise
    .then(response => {
      if (document.id) {
        NotificationManager.success('The document was updated succesfully')
        this.props.setDocument(response)
      } else {
        NotificationManager.success('The document was added succesfully')
        this.props.onSave(`/dashboard/documents/${response.id}/edit`)
      }
    })
    .catch(error => {
      this.setState({ error: error.message, errors: error.errors })
    })
  }

  render() {
    const {
      errors,
      // editorState,
      customers,
      customer,
      document
    } = this.state

    return (
      <form className="container-fluid" onSubmit={this.onSubmit} autoComplete="off">
        <div className="row mb-4">
          <div className="col">
            <Field
              showLabel={true}
              name="name"
              label="Name"
              placeholder="Document Name"
              error={errors.name}
              value={document ? document.name : ''}
              onChange={this.onChangeProperty}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <RadioButtons
              vertical={true}
              showLabel={true}
              name="use_template"
              label="Template Origin"
              selected={document.use_template ? 'true' : 'false'}
              options={defaultDocument.options}
              onChange={(value) => this.onChangeProperty({ target: { name: 'use_template', value: (value == 'true') } })}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Dropdown
              showLabel={true}
              name="customer"
              label="Customer"
              options={customers}
              selected={customer}
              selectedValue={this.getCustomerName()}
              onChange={this.onChangeCustomer}
            />
          </div>
        </div>

        {
          (!document.use_template) &&
          <div className="row">
            <div className="col">
              <RadioButtons
                vertical={true}
                showLabel={true}
                name="type"
                label="PDF Document Origin"
                selected={document.type || 'content'}
                options={defaultDocument.types}
                onChange={(value) => this.onChangeProperty({ target: { name: 'type', value } })}
              />
            </div>
          </div>
        }

        {
          /*
          (document.id && !document.use_template && document.type == 'content') &&
          <div className="row">
            <div className="col">
              <label>Content</label>
              <small className="form-text text-muted">
                Type here the text that you want to show in the PDF. If you want to attach a field inside the content, you can add the field slug using square brackets ("[", "]").
              </small>
              <small className="form-text text-muted">
                <strong>ie.</strong> Dear [name]:
                below you will find the information about.....
              </small>
              <Editor
                editorState={editorState}
                wrapperClassName="wysiwyg-wrapper"
                editorClassName="wysiwyg-editor"
                onEditorStateChange={this.onChangeContent}
                toolbar={editorSettings} />
            </div>
          </div>
          */
        }

        <div className="row justify-content-end mb-4">
          {
            document.id &&
            <div className="col-md-3">
              <a className="btn btn-block btn-link" href={document.qr_app} download>Download QR Code</a>
            </div>
          }
          <div className="col-4">
            <button type="submit" className="btn btn-block btn-primary">Save</button>
          </div>
        </div>
      </form>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { document: doc, auth } = state
  return {
    ...auth,
    ...doc,
    ...props
  }
}

const mapDispatchToProps = {
  setDocument,
  cleanDocument,
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentForm)
