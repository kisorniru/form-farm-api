import React from 'react'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import { addTemplate, updateTemplate } from '../../api/templates'
import { setTemplate } from '../../state/actions'
import { editorSettings } from '../../config/editor'
import { defaultTemplate } from '../../config/data'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import Field from '../../components/Field'
import Textarea from '../../components/Textarea'
import RadioButtons from '../../components/RadioButton'

class TemplateForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      template: defaultTemplate.info,
      editorState: EditorState.createEmpty(),
      error: null,
      errors: {}
    }

    this.reset = this.reset.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onChangeField = this.onChangeField.bind(this)
    this.onChangeContent = this.onChangeContent.bind(this)
  }

  componentDidUpdate(props, state) {
    const { template } = this.state
    if (state.template.id !== template.id) {
      const blocksFromHtml = htmlToDraft(template.content || '')
      const { contentBlocks, entityMap } = blocksFromHtml
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
      const editorState = EditorState.createWithContent(contentState)
      this.setState({ editorState })
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.template.id !== state.template.id) {
      return { template: props.template }
    }

    return null
  }

  onChangeContent(editorState) {
    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const template = {
      ...this.state.template,
      content
    }
    this.setState({ template, editorState })
  }

  onChangeField(event) {
    const { name, value } = event.target
    const template = {
      ...this.state.template,
      [name]: value
    }

    this.setState({ template })
  }

  onSubmit(event) {
    event.preventDefault()
    const { template } = this.state
    const promise = template.id ? updateTemplate(template.id, template) : addTemplate(template)

    promise
      .then(response => {
        NotificationManager.success(`The template was ${template.id ? 'updated' : 'created'} succesfully`)
        if (template.id) {
          this.props.setTemplate(response)
        } else {
          this.props.onSave(`/dashboard/settings/templates/${response.id}/edit`)
        }
      })
      .catch(response => {
        this.setState({ error: response.message, errors: response.errors })
      })

  }

  reset() {
    const { template } =  this.props
    this.setState({
      template: template ? template : defaultTemplate.info,
      editorState: EditorState.createEmpty(),
      error: null,
      errors: {}
    })
  }

  render() {
    const { editorState, template, errors } = this.state

    return (
      <form className="container py-4" onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col">
            <Field
              parentClass="input-group"
              showLabel={true}
              name="name"
              label="Name"
              placeholder="Name"
              error={errors ? errors.name : ''}
              value={template.name}
              onChange={this.onChangeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Textarea
              parentClass="input-group"
              showLabel={true}
              name="description"
              label="Description"
              placeholder="Description"
              value={template.description}
              error={errors ? errors.description : ''}
              onChange={this.onChangeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Textarea
              parentClass="input-group"
              showLabel={true}
              name="message"
              label="Confirmation message"
              placeholder="Thanks for submitting your form!"
              value={template.message}
              error={errors ? errors.message : ''}
              onChange={this.onChangeField}
            />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <RadioButtons
              vertical={true}
              name="type"
              label="Template origin"
              selected={template.type}
              options={defaultTemplate.types}
              error={errors ? errors.type : ''}
              onChange={(value) => this.onChangeField({ target: { name: 'type', value } })}
            />
          </div>
        </div>

        {
          (template.id && template.type == 'content') &&
          <div className="row">
            <div className="col">
              <label>Content</label>
              <Editor
                editorState={editorState}
                wrapperClassName="wysiwyg-wrapper"
                editorClassName="wysiwyg-editor"
                onEditorStateChange={this.onChangeContent}
                toolbar={editorSettings} />
            </div>
          </div>
        }

        {
          !template.id &&
          <div className="row">
            <div className="col" style={{ marginTop: 24, marginBottom: 24 }}>
              <strong style={{ color: '#000' }}>TIPS</strong>
              <p style={{ color: '#7b7b7b' }}><strong style={{ color: '#000' }}>Confirmation Message</strong> is what the user will see after they submit their information via the iPad app.</p>
              <p style={{ color: '#7b7b7b' }}><strong style={{ color: '#000' }}>Template Origin</strong> tells the system if you intend to create the new template from an existing PDF, or something new - from scratch. If you select “existing PDF” you are first asked to import the PDF and map fields.</p>
            </div>
          </div>
        }

        <div className="row justify-content-end footer-modal">
          {
            template.id &&
            <div className="col-md-3">
              <a className="btn btn-block btn-link" href={template.qr_app} download>Download QR Code</a>
            </div>
          }
          <div className="col-md-3">
            <button type="reset" onClick={this.reset} className="btn btn-block btn-link">Reset</button>
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-block btn-primary">Save</button>
          </div>
        </div>
      </form>
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
  setTemplate,
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplateForm)
