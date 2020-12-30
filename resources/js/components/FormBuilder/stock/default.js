import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import IconRenderer from '../../../Icons/IconRenderer'
import DragPadIcon from '../../../Icons/DragPadIcon'

class DefaultOptions extends React.Component {
  render() {
    const { options = [] } = this.props

    return (
      <Droppable droppableId="fields-stock" isDropDisabled={true}>
        {provided => (
          <div className="row" id="fields-row" ref={provided.innerRef}>
            {options.map((option, index) => (
              <Draggable key={index} draggableId={`${option.key}`} index={index}>
                {(provided, snapshot) => (
                  <div className="col-md-4 field-box-info">
                    <div className="box" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={provided.draggableProps.style}>
                      <DragPadIcon />
                      <div className="image">
                        <IconRenderer type={option.key} />
                      </div>
                      <span className="name">{option.value}</span>
                    </div>
                    {
                      snapshot.isDragging &&
                      <div className="box">
                        <DragPadIcon />
                        <div className="image">
                          <IconRenderer type={option.key} />
                        </div>
                        <span className="name">{option.value}</span>
                      </div>
                    }
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    )
  }
}

export default DefaultOptions
