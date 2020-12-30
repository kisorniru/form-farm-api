import React from 'react'
import Field from '../../Field'
import Textarea from '../../Textarea'
import RadioButtons from '../../RadioButton'
import Checkboxes from '../../Checkboxes'
import DatePickerField from '../../DatePickerField'
import Dropdown from '../../Dropdown'
import FileUploader from '../../FileUploader'
import CalculationField from '../../CalculationField'
import HTMLField from '../../HTMLField'

class FormField extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: '',
    }

    this.onChangeField = this.onChangeField.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.field.value) {
      return { value: props.field.value }
    }

    return null
  }

  onChangeField({ target }) {
    this.setState({ value: target.value }, () => {
      this.props.onChangeField({ target })
    })
  }

  render() {
    let { value } = this.state
    const { field, index } = this.props
    let options = []

    if (field.metadata) {
      if (typeof field.metadata == 'string' && field.metadata != 'null') {
        const metadata = JSON.parse(field.metadata)
        options = metadata.options ? metadata.options : []
      } else {
        options = field.metadata.options
      }
    }

    if (field.type == 'dropdown') {
      options = options.map(option => ({ key: option.id, value: option.label }))
    }

    return (
      <div>
        <div className="row mb-4" key={index}>
          <div className="col-md-12">
            {
              (field.type == 'date') &&
              <DatePickerField
                disabled={field.isRemoved}
                parentClass="input-group"
                name={field.slug}
                label={field.name}
                description={field.details}
                placeholder={field.placeholder}
                defaultValue={value}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                onChange={(value) => this.onChangeField({ target: { value } })}
              />
            }
            {
              (field.type == 'text_area') &&
              <Textarea
                disabled={field.isRemoved}
                showLabel={true}
                parentClass="input-group"
                name={field.slug}
                label={field.name}
                description={field.details}
                placeholder={field.placeholder}
                value={value}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                onChange={(event) => this.onChangeField(event)}
              />
            }
            {
              (field.type == 'text_field' ||
                field.type == 'location') &&
              <Field
                disabled={field.isRemoved}
                showLabel={true}
                parentClass="input-group"
                name={field.slug}
                label={field.name}
                description={field.details}
                placeholder={field.placeholder}
                value={value}
                error={field.error ? field.error : null}
                onChange={(event) => this.onChangeField(event)}
              />
            }
            {
              (field.type == 'ticket_id') &&
              <Field
                readOnly={true}
                showLabel={true}
                parentClass="input-group"
                name={field.slug}
                label={field.name}
                description="The ticket Id is autoincrement, so you cannot update this field"
                placeholder={field.placeholder}
                value={value}
                error={field.error ? field.error : null}
                onChange={(event) => this.onChangeField(event)}
              />
            }
            {
              (field.type == 'signature') &&
                <div className="row align-items-center">
                  <div className="col">
                    <FileUploader
                      parentClass="file-uploader"
                      showLabel={true}
                      name={field.slug}
                      label={field.name}
                      description={field.details}
                      placeholder={field.placeholder}
                      error={field.error ? field.error : null}
                      onChange={(b64) => this.onChangeField({ target: { name: field.name, value: b64 } }, index)}
                    />
                  </div>
                  <div className="col-md-2">
                    <img className="img-fluid" src={value} />
                  </div>
                </div>
            }

            {
              (field.type == 'text_password') &&
              <Field
                disabled={field.isRemoved}
                showLabel={true}
                parentClass="input-group"
                type="password"
                name={field.slug}
                label={field.name}
                description={field.details}
                placeholder={field.placeholder}
                value={value}
                error={field.error ? field.error : null}
                onChange={(event) => this.onChangeField(event)}
              />
            }
            {
              (field.type == 'text_number') &&
              <Field
                disabled={field.isRemoved}
                showLabel={true}
                parentClass="input-group"
                type="number"
                name={field.slug}
                label={field.name}
                description={field.details}
                placeholder={field.placeholder}
                value={value}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                onChange={(event) => this.onChangeField(event)}
              />
            }
            {
              (field.type == 'text_email') &&
              <Field
                disabled={field.isRemoved}
                showLabel={true}
                parentClass="input-group"
                type="email"
                name={field.slug}
                label={field.name}
                description={field.details}
                placeholder={field.placeholder}
                value={value}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                onChange={(event) => this.onChangeField(event)}
              />
            }
            {
              (field.type == 'text_tel') &&
              <Field
                disabled={field.isRemoved}
                showLabel={true}
                parentClass="input-group"
                type="tel"
                name={field.slug}
                label={field.name}
                description={field.details}
                placeholder={field.placeholder}
                value={value}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                onChange={(event) => this.onChangeField(event)}
              />
            }
            {
              (field.type == 'radio') &&
              <RadioButtons
                disabled={field.isRemoved}
                name={field.slug}
                label={field.name}
                description={field.details}
                selected={value.toLowerCase().replace(/\s/g, '_')}
                options={options ? options : []}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                onChange={(value) => this.onChangeField({ target: { value } })}
              />
            }
            {
              (field.type == 'multiple_select') &&
              <Checkboxes
                disabled={field.isRemoved}
                name={field.slug}
                label={field.name}
                description={field.details}
                selected={value.toLowerCase().replace(/\s/g, '_')}
                options={options ? options : []}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                onChange={(value) => this.onChangeField({ target: { value } })}
              />
            }
            {
              (field.type == 'dropdown') &&
              <Dropdown
                disabled={field.isRemoved}
                showLabel={true}
                name={field.slug}
                label={field.name}
                description={field.details}
                options={options ? options : []}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                selected={value.toLowerCase().replace(/\s/g, '_')}
                selectedValue={value}
                onChange={(selected) => this.onChangeField({ target: { value: selected.value } })}
              />
            }

            {
              (field.type == 'calculation') &&
              <CalculationField
                disabled={field.isRemoved}
                name={field.slug}
                label={field.name}
                description={field.details}
                options={options ? options : []}
                error={field.error ? field.error : null}
                required={field.required ? field.required : false}
                value={field.value}
                onChange={(value) => this.onChangeField({ target: { value } })}
              />
            }
            {
              field.type == 'info' &&
              <HTMLField
                parentClass="field-html"
                name={field.slug}
                label={field.name}
                description={field.details}
              />
            }
          </div>
        </div>
      </div>
    )
  }
}

export default FormField
