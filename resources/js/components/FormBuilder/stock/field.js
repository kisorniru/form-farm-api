import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

class CategoryField extends React.Component {
  render() {
    const {
      index,
      category,
      field
    } = this.props

    return (
      <Draggable key={index} draggableId={`category-${category.id}-field-${field.id}`} index={index} isDraggable={false}>
        {(provided, snapshot) => (
          <div className="field-category-box">
            <div className="box" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>{field.name}</span>
            </div>
            {
              snapshot.isDragging &&
              <div className="box">
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>{field.name}</span>
              </div>
            }

            {/*provided.placeholder*/}
          </div>
        )}
      </Draggable>
    )
  }
}

export default CategoryField
