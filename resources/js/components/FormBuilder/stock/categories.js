import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import ChevronUpIcon from '../../../Icons/ChevronUpIcon'
import CategoryField from './field'

class CategoriesOptions extends React.Component {
  render() {
    const { categories = [] } = this.props

    return (
      <div className="accordion categories-accordion" id="categories-accordion">
        {categories.map((category, index) => (
          <div className="card" key={index}>
            <div className="card-header" id={`category-heading-${category.id}`}>
              <h2 className="mb-0">
                <button className={`btn btn-link ${index > 0 ? 'collapsed' : ''}`} type="button" data-toggle="collapse" data-target={`#collapse-category-${category.id}`} aria-expanded={index == 0 ? 'true' : 'false'} aria-controls={`#collapse-category-${category.id}`}>
                  <span className="icon"><ChevronUpIcon /></span>
                  {category.name}
                </button>
              </h2>
            </div>

            <div id={`collapse-category-${category.id}`} className={`collapse ${index == 0 ? 'show' : ''}`} aria-labelledby={`category-heading-${category.id}`} data-parent="#categories-accordion">
              <Droppable droppableId={`category-${index}`} isDropDisabled={true}>
                {provided => (
                  <div className="card-body">
                    <div className="fields-group-categories" id={`fields-row-${index}`} ref={provided.innerRef}>
                      {category.fields.map((field, findex) => (
                        <CategoryField key={findex} index={findex} field={field} category={category} />
                      ))}

                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default CategoriesOptions
