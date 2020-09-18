import React from 'react'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { editorSettings } from '../../config/editor'


class WYSIWYG extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      editorState: EditorState.createEmpty(),
      editorChanged: false
    }

    this.onChangeContent = this.onChangeContent.bind(this)
  }

  componentWillReceiveProps(props) {
    if (!this.state.editorChanged && props.info.length > 0) {
      const blocksFromHtml = htmlToDraft(props.info)
      const { contentBlocks, entityMap } = blocksFromHtml
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
      const editorState = EditorState.createWithContent(contentState)
      this.setState({ editorState, editorChanged: true })
    }
  }

  onChangeContent(editorState) {
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    this.setState({ editorState, editorChanged: true }, () => {
      this.props.onChangeInfo(content)
    })
  }

  render() {
    const {
      label,
      settings
    } = this.props

    const {
      editorState,
    } = this.state

    return (
      <div className="row">
        <div className="col">
          <label>{label}</label>
          <Editor
            editorState={editorState}
            wrapperClassName="wysiwyg-wrapper"
            editorClassName="wysiwyg-editor"
            onEditorStateChange={this.onChangeContent}
            toolbar={settings || editorSettings} />
        </div>
      </div>
    )
  }
}

export default WYSIWYG
