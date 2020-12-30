import React from 'react'
import { parsePdfFields, addInputHoverFeature } from '../../extensions'
import { NotificationManager } from 'react-notifications'
import * as Worker from 'react-pdf/src/pdf.worker.entry'
import Document from 'react-pdf/dist/Document'
import Page from 'react-pdf/dist/Page'
import { pdfFieldsToJson } from '../../api/templates'
import Pagination from 'react-js-pagination'
import Loader from '../Loader'
import PDFLinkingFields from './fields'

class PDFLinkingComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      fields: [],
      uploading: false,
      pdf_url: null,
      numPages: 0,
      pageNumber: 1
    }

    window.addEventListener('scroll', function (e) {
      if (window.scrollY > 130) {
        document.querySelector('.available-fields').style = 'position: fixed; top: 68px'
      } else {
        document.querySelector('.available-fields').removeAttribute('style')
      }
    });

    this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this)
    this.onUploadFile = this.onUploadFile.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.preview !== state.pdf_url || props.fields !== state.fields) {
      return { pdf_url: props.preview, fields: props.fields, uploading: false }
    }

    return null
  }

  onDocumentLoadSuccess({ numPages }) {
    this.setState({ numPages, pageNumber: 1 }, addInputHoverFeature)
  }

  onUploadFile({ target }) {
    const { files } = target
    this.setState({ uploading: true })

    if (files.length == 1) {
      const file = files[0]
      const fileReader = new FileReader()

      fileReader.onload = (loaded) => {
        const { target: { result } } = loaded
        const base64 = result.replace('data:application/pdf;base64,', '')

        pdfFieldsToJson({ pdf: base64 })
          .then(fields => {
            this.props.onUploadFile(base64, parsePdfFields(fields))
          })
          .catch(error => {
            this.setState({ uploading: false }, () => NotificationManager.error('There was an error reading your PDF file'))
          })
      }

      fileReader.readAsDataURL(file)
    }
  }

  render() {
    const { pageNumber, numPages, uploading, fields, pdf_url } = this.state
    const documentWrapperWidth = ((window.innerWidth * 8) / 12) - 24 // calculating the col-md-8 size

    return (
      <div className="row template-container">
        {
          pdf_url &&
          <div className="col-md-4 fields-container">
            <PDFLinkingFields fields={fields} onChooseField={this.props.onChooseField} />
          </div>
        }
        {
          pdf_url &&
          <div className="col-md-8" id="document-wrapper">
            <Document width={documentWrapperWidth} file={pdf_url} onLoadSuccess={this.onDocumentLoadSuccess}>
              <Page width={documentWrapperWidth} pageNumber={pageNumber} renderAnnotationLayer={true} renderInteractiveForms={true} />
            </Document>

            <Pagination
              hideFirstLastPages
              prevPageText='⟨'
              nextPageText='⟩'
              itemClass="page-item"
              linkClass="page-link"
              activePage={pageNumber}
              itemsCountPerPage={1}
              totalItemsCount={numPages}
              pageRangeDisplayed={10}
              onChange={(pageNumber) => this.setState({ pageNumber })}
            />
          </div>
        }
        {
          !pdf_url &&
          <div className="col-md-12">
            {
              !uploading &&
              <div className="uploader mt-4">
                <input className="input-form form-upload" type="file" name="pdf_file" id="pdf_file" accept="application/pdf" onChange={this.onUploadFile} />
                <button className="btn btn-primary" onClick={() => document.getElementById('pdf_file').click()}>Upload PDF</button>
                <span className="uploader-or">or</span>
                <span>Drop your PDF File here</span>
              </div>
            }

            {
              uploading &&
              <div className="uploading mt-4">
                <Loader />
              </div>
            }
          </div>
        }
      </div>
    )
  }
}

export default PDFLinkingComponent
