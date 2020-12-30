import React from 'react'
import { connect } from 'react-redux'
import Document from 'react-pdf/dist/Document'
import Page from 'react-pdf/dist/Page'
import Pagination from 'react-js-pagination'
import * as Worker from 'react-pdf/src/pdf.worker.entry'

class DocumentPreview extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      numPages: false,
      pageNumber: 1,
    }

    this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this)
  }

  onDocumentLoadSuccess({ numPages }) {
    this.setState({ numPages, pageNumber: 1 })
  }

  render() {
    const { pageNumber, numPages } = this.state
    const { document: doc } = this.props
    const documentWrapperWidth = ((window.innerWidth * 8) / 12) - 24 // calculating the col-md-8 size

    return (
      <div className="row">
        <div className="col-md-4"></div>
        <div className="col-md-8">
          <Document width={documentWrapperWidth} file={doc.preview_url} onLoadSuccess={this.onDocumentLoadSuccess}>
            <Page width={documentWrapperWidth} pageNumber={pageNumber} />
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
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { document: doc } = state
  return {
    ...doc,
    ...props,
  }
}

export default connect(mapStateToProps)(DocumentPreview)
