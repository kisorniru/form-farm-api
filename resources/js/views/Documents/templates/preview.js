import React from 'react'
import { getTemplateFields }  from '../../../api/templates'
import FormField from '../../../components/FormBuilder/form/field'

class TemplatePreviewFields extends React.Component {
  _isMounted = false
  constructor(props) {
    super(props)

    this.state = {
      fields: []
    }

    this.loadTemplateFields()
  }

  componentDidMount() {
    this._isMounted = true
    this.loadTemplateFields()
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  loadTemplateFields() {
    const { template } = this.props

    getTemplateFields(template.id)
      .then(fields => {
        if (this._isMounted) {
          this.setState({ fields })
        }
      })
      .catch(error => console.log(error))
  }

  render() {
    const { fields } = this.state
    const { template } = this.props

    return (
      <div className="fields-container mt-4">
        <div className="row">
          <div className="col-md-8 offset-md-1 mt-4">
            {fields.map((field, index) => (
              <FormField field={{ ...field, isRemoved: true }} key={index} index={index} onChangeField={(target) => target} />
            ))}
          </div>
        </div>

        <div className="row">
          <div className="col-md-8 pl-2 offset-md-1">
              <button className="btn btn-primary" onClick={() => this.props.onChooseTemplate(template.id, fields)}>Choose Template</button>
          </div>
        </div>

      </div>
    )
  }
}

export default TemplatePreviewFields
