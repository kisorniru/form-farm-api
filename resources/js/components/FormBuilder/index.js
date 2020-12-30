import React from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { NotificationManager } from 'react-notifications'
import { defaultField } from '../../config/data'
import DroppableFieldsForm from './form'
import DroppableFieldsStock from './stock'

class FormBuilder extends React.Component {
  constructor(props) {
    super(props)

    this.onDragEnd = this.onDragEnd.bind(this)
    this.onChooseField = this.onChooseField.bind(this) // on Field selected to edit
    this.onInsertField = this.onInsertField.bind(this) // insert new field
    this.onAttachField = this.onAttachField.bind(this) // attach existing field
    this.onChangeOrder = this.onChangeOrder.bind(this) // change order of fields
    this.changeFieldsPosition = this.changeFieldsPosition.bind(this) // update position property in fields
  }

  onDragEnd({ source, destination, draggableId }) {
    if (!destination) return
    if (!destination.droppableId.includes('form')) return // cancel drop field if the field is not dropped in the form
    if (!destination.droppableId === source.droppableId &&
      destionation.index === source.index) return // cancel if the field is dropped in the same position

    // changing order
    if (source.droppableId.includes('form')) {
      this.onChangeOrder(source.index, destination.index)
    }

    // Inserting new field from scratch
    if (source.droppableId.includes('stock')) {
      this.onInsertField({ ...defaultField, type: draggableId, index: destination.index, position: destination.index + 1, isNew: true })
    }

    // Attaching existing field to Form
    if (source.droppableId.includes('category')) {
      this.onAttachField(destination.index, draggableId)
    }
  }

  onChooseField(index, id) {
    this.props.onSelectField(index, id)
  }

  onInsertField(data) {
    const { fields } = this.props
    fields.splice(data.index, 0, data) // adding the field in the dropped index
    this.props.insertfield(data) // field to be stored
    this.changeFieldsPosition(fields, true) // updating fields Position to be updated in the DB
  }

  onAttachField(index, draggableId) {
    // the field id is located at the end of the draggable id
    const draggableDecompose = draggableId.split('-')
    let fieldId = draggableDecompose[draggableDecompose.length - 1]
    if (isNaN(fieldId)) return
    fieldId = parseInt(fieldId)

    // checking if field does not already exists
    const { fields } = this.props
    const found = fields.find(field => field.id === fieldId)
    if (found) {
      NotificationManager.error(`The field "${found.name}" already exists`)
      return
    }

    fields.splice(index, 0, { id: fieldId, index: index, position: index + 1, isNew: true })
    this.props.insertfield({ id: fieldId, index: index, position: index + 1, isNew: true })
    this.changeFieldsPosition(fields, true) // updating fields Position to be updated in the DB
  }

  onChangeOrder(lastPosition, newPosition) {
    let { fields } = this.props
    const field = fields[lastPosition]
    fields.splice(lastPosition, 1)
    fields.splice(newPosition, 0, field)
    this.changeFieldsPosition(fields)
  }

  changeFieldsPosition(fields, isAdding = false) {
    const updated = fields.map((field, index) => {
      return {
        ...field,
        position: index + 1,
        ...(field.position !== index + 1 ? { reordered: true } : {})
      }
    })

    this.props.updateFields(updated, isAdding)
  }

  render() {
    const { hideDocumentOptions = false, fields, categories, fieldTypes } = this.props

    return (
      <div className="container-fluid">
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="row template-container">
            {
              !hideDocumentOptions &&
              <DroppableFieldsStock categories={categories} fieldTypes={fieldTypes} />
            }

            <DroppableFieldsForm hideDocumentOptions={hideDocumentOptions} fields={fields} onSubmit={this.onSubmit} onSelectField={this.onChooseField} onChangeField={this.props.onChangeField} />
          </div>
        </DragDropContext>
      </div>
    )
  }
}

export default FormBuilder
