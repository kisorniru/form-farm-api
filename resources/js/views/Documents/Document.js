import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocument } from '../../api/documents'
import { cleanDocument, setDocument } from '../../state/actions'
import { defaultDocument } from '../../config/data'
import Breadcrumbs from '../../components/Breadcrumbs'
import Modal from '../../components/Modal'
import DocumentForm from './Form'
import DocumentPreview from './DocumentPreview'
import DocumentPDFLinking from './pdf'
import DocumentBuilder from './Builder'
import DocumentTemplate from './templates'

class Document extends Component {
  loading = false

  constructor(props) {
    super(props)

    this.state = {
      breadcrumbs: defaultDocument.breadcrumbs
    }

    this.loadDocument = this.loadDocument.bind(this)
  }

  componentDidMount() {
    const { match: { params } } = this.props

    if (params.document) {
      this.loadDocument()
    } else {
      this.props.setDocument(defaultDocument.info)
    }
  }

  componentDidUpdate() {
    const { match: { params }, document } = this.props

    if (document && !this.loading) {
      if (document.id !== parseInt(params.document)) {
        this.loadDocument()
      }
    }
  }

  loadDocument() {
    const { match: { params } } = this.props
    const { breadcrumbs } = this.state


    if (params.document) {
      this.loading = true

      getDocument(params.document)
        .then(document => {
          this.props.setDocument(document)

          breadcrumbs[1] = {
            url: `/dashboard/documents/${document.id}/edit`,
            name: document.name,
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
    this.props.cleanDocument()
  }

  render() {
    const { breadcrumbs } = this.state
    const { document } = this.props

    return (
      <div className="container-fluid mb-4 document-container">
        <div className="row">
          <div className="col d-flex align-items-center">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <ul className="nav nav-tabs template-tabs" id="document-tabs" role="tablist">
              <li className="nav-item">
                <a className="nav-link active" id="fields-tab" data-toggle="tab" href="#fields" role="tab" aria-controls="fields" aria-selected="false">Fields</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" id="document-tab" data-toggle="tab" href="#document" role="tab" aria-controls="document" aria-selected="true">Document</a>
              </li>
              {
                document.id &&
                <li className="nav-item">
                  <a className="nav-link" id="preview-tab" data-toggle="tab" href="#preview" role="tab" aria-controls="preview" aria-selected="false">Preview</a>
                </li>
              }
              {
                (document.type == 'pdf' && document.id) &&
                <li className="nav-item">
                  <a className="nav-link" id="pdf-tab" data-toggle="tab" href="#pdf" role="tab" aria-controls="pdf" aria-selected="false">PDF Linking</a>
                </li>
              }
            </ul>
            <div className="row">
              <div className="col">
                <div className="tab-content" id="document-content">
                  <div className="tab-pane fade show active" id="fields" role="tabpanel" arial-labelledby="fields-tab">
                    {
                      (!document.use_template && document.id) &&
                      <DocumentBuilder />
                    }

                    {
                      (document.use_template && document.id) &&
                      <DocumentTemplate />
                    }
                  </div>
                  <div className="tab-pane fade" id="document" role="tabpanel" arial-labelledby="form-tab">
                  {
                    document.id &&
                    <div className="row">
                      <div className="col-md-4"></div>
                      <div className="col-md-8 pt-4">
                        <DocumentForm onSave={path => console.log(path)} />
                      </div>
                    </div>
                  }
                  </div>
                  <div className="tab-pane fade" id="preview" role="tabpanel" arial-labelledby="preview-tab">
                    <DocumentPreview />
                  </div>
                  {
                    (document.type == 'pdf' && document.id) &&
                    <div className="tab-pane fade" id="pdf" role="tabpanel" aria-labelledby="pdf-tab">
                      <div className="container-fluid">
                        <DocumentPDFLinking />
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {
          !document.id &&
          <Modal title="Create Document" show={true} onClose={() => this.props.history.push(`/dashboard/settings/documents`)}>
            <DocumentForm onSave={path => this.props.history.push(path)} />
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
    ...props
  }
}

const mapDispatchToProps = {
  cleanDocument,
  setDocument,
}

export default connect(mapStateToProps, mapDispatchToProps)(Document)
