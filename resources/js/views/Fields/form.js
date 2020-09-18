import React from 'react'
import { infoSettings } from '../../config/editor'
import { fieldTypes, defaultField } from '../../config/data'
import { randomString, trimStart } from '../../extensions'
import Checkbox from '../../components/Checkbox'
import Field from '../../components/Field'
import Dropdown from '../../components/Dropdown'
import Textarea from '../../components/Textarea'
import WYSIWYG from '../../components/WYSIWYG'

class FieldForm extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isDerived: false,
      field: defaultField
    }

    this.getFieldType = this.getFieldType.bind(this)
    this.changeMetadata = this.changeMetadata.bind(this)
    this.convertMetadata = this.convertMetadata.bind(this)
    this.onChangeProperty = this.onChangeProperty.bind(this)
    this.onChangePrefix = this.onChangePrefix.bind(this)
    this.convertPrefix = this.convertPrefix.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.isDerived) {
      return { field: props.field, isDerived: true }
    }

    return false
  }

  onChangeProperty(event) {
    const { field } = this.state
    const { name, value } = event.target
    const updated = {
      ...field,
      [name]: value
    }

    if (name === 'name' && !field.id) {
      if (value.length > 0) {
        updated.slug = value.toLowerCase().replace(/ /g, "_")
      }
    }

    if (name === 'type' && value === 'info') {
      const id = randomString(12)
      updated.name = `Info ${id}`
      updated.slug = `info_${id}`
    }

    this.setState({ field: updated }, () => {
      this.props.changeProperty({ target: { name, value } })
    })
  }

  getFieldType (type) {
    const found = fieldTypes.find(t => t.key === type)
    return found ? found.value : ''
  }

  changeMetadata (event) {
    const { name, value } = event.target
    const values = value.split(',')
    let options = []
    values.forEach(value => {
      let slug = ''
      slug = value.trim().toLowerCase().replace(/ /g,"_")
      options.push({ id: slug, label: trimStart(value) })
    })

    const metadata = JSON.stringify({ options })
    console.log(`metadata ${metadata}`)

    this.onChangeProperty({ target: { name: 'metadata', value: metadata}})
  }

  convertMetadata (metadata) {
    if (metadata) {
      if (typeof metadata !== 'object') {
        metadata = JSON.parse(metadata)
      }
      const { options } = metadata
      let data = ''
      options.map(option => {
        data += data.length ? `, ${option.label}` : option.label
      })
      return data
    }

    return ''
  }

  onChangePrefix() {
    const { name, value } = event.target
    const metadata = {
      [name]: value
    }

    this.onChangeProperty({ target: { name: 'metadata', value: JSON.stringify(metadata) }})
  }

  convertPrefix(metadata) {
    if (metadata) {
      if (typeof metadata !== 'object') {
        metadata = JSON.parse(metadata)
      }
      const { prefix = '' } = metadata
      return prefix
    }

    return ''
  }

  render () {
    const { errors } = this.props
    const { field } = this.state

    return (
      <div className="container-fluid">
        {
          field.type != 'info' &&
          <div className="row">
            <div className="col">
              <Field
                parentClass="input-group"
                showLabel={true}
                name="name"
                label="Field name"
                placeholder="The name of the field"
                value={field.name || ''}
                error={errors ? errors.name : ''}
                onChange={this.onChangeProperty}
              />
            </div>
          </div>
        }
        {
          field.type != 'info' &&
          <div className="row">
            <div className="col">
              <p><strong>Field slug:&nbsp;</strong>{field.slug}</p>
            </div>
          </div>
        }

        {
          field.type != 'info' &&
          <div className="row">
            <div className="col">
              <Field
                parentClass="input-group"
                showLabel={true}
                name="placeholder"
                label="Field placeholder"
                placeholder="Type here a placeholder for this field"
                value={field.placeholder || ''}
                error={errors ? errors.placeholder : ''}
                onChange={this.onChangeProperty}
              />
            </div>
          </div>
        }

        {
          field.type != 'info' &&
          <div className="row">
            <div className="col">
              <Dropdown
                showLabel={true}
                name="type"
                label="Field Type"
                placeholder="Type a valid Field Type"
                options={fieldTypes}
                selectedKey={field.type}
                selectedValue={this.getFieldType(field.type)}
                error={errors ? errors.type : ''}
                onChange={(selected) => this.onChangeProperty({ target: { name: 'type', value: selected.key } })}
              />
            </div>
          </div>
        }

        {
          field.type != 'info' &&
          <div className="row">
            <div className="col d-flex">
              <Checkbox
                parentClass="input-group"
                showLabel={true}
                name="is_required"
                label="Required"
                option={{ id: 'is_required', label: 'Required'}}
                selected={field.required}
                onChange={(target) => this.onChangeProperty({ target: { name: 'required', value: target.checked } })}
              />
            </div>
          </div>
        }

        {
          field.type != 'info' &&
          <div className="row">
            <div className="col">
              <Textarea
                parentClass="input-group"
                showLabel={true}
                name="details"
                label="Details"
                placeholder="Details"
                value={field.details || ''}
                error={errors ? errors.details : ''}
                onChange={this.onChangeProperty}
              />
            </div>
          </div>
        }

        {
          (field.type == 'radio' ||
          field.type == 'dropdown' ||
          field.type == 'multiple_select') &&
          <div className="row">
            <div className="col">
              <Textarea
                parentClass="input-group"
                showLabel={true}
                name="metadata"
                label="Options"
                placeholder="Option 1, Option 2, Option 3"
                description="Separate the options with commas"
                value={this.convertMetadata(field.metadata)}
                error={errors ? errors.metadata : ''}
                onChange={this.changeMetadata}
              />
            </div>
          </div>
        }

        {
          field.type == 'ticket_id' &&
          <div className="row">
            <div className="col">
              <Field
                parentClass="input-group"
                showLabel={true}
                name="prefix"
                label="Ticket prefix"
                description="The ticket prefix will be applied like this {prefix}_#####"
                placeholder="WL"
                value={this.convertPrefix(field.metadata)}
                error={errors ? errors.metadata : ''}
                onChange={this.onChangePrefix}
              />
            </div>
          </div>
        }

        {
          field.type == 'info' &&
          <WYSIWYG
            settings={infoSettings}
            label="Content"
            info={field.details || ''}
            onChangeInfo={value => this.onChangeProperty({ target: {name: 'details', value } })}
          />
        }
      </div>
    )
  }
}

export default FieldForm
