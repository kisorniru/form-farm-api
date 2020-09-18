import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import DragIcon from '../../../Icons/DragIcon'
import EditIcon from '../../../Icons/EditIcon'
import FormField from './field'

class DroppableFieldsForm extends React.Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(event) {
    event.preventDefault()
    this.props.onSubmit()
  }

  render() {
    const { hideDocumentOptions, fields = [] } = this.props

    return (
      <form className={`col-md-${ hideDocumentOptions ? '12' : '8' } tabs-container container`} onSubmit={this.onSubmit} autoComplete="off">
        <div className="row mb-4">
          <div className="col">
            <div className="bg-ipad">
              <div className="ipad-content">
                <Droppable droppableId="form-fields">
                  {provided => (
                    <div className="fields-droppable" id="form-fields-row" ref={provided.innerRef} {...provided.droppableProps}>
                      {fields.map((field, index) => (
                        <Draggable key={index} index={index} draggableId={`form-field-${index}-${field.id ? field.id : 'new'}`}>
                          {provided => (
                            <div className="field-preview-box" key={index} ref={provided.innerRef} {...provided.draggableProps}>
                              <span className="drag-icon" {...provided.dragHandleProps}><DragIcon /></span>
                              <span className="edit-icon" onClick={() => this.props.onSelectField(index, field.id)}><EditIcon /></span>
                              <FormField field={field} index={index} onChangeField={this.props.onChangeField} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {
                        !hideDocumentOptions &&
                        <div className="empty-fields">
                          <span className="drop-here">Drop Form Elements Here</span>
                        </div>
                      }
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }
}

export default DroppableFieldsForm
