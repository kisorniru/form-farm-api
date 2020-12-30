import React from 'react'
import CategoriesOptions from './categories'
import DefaultOptions from './default'

class DroppableFieldsOptions extends React.Component {
  render() {
    return (
      <div className="col-md-4 fields-container">
        <h2 className="fields-group-title">Add form field</h2>
        <CategoriesOptions categories={this.props.categories} />

        <h2 className="fields-group-title">Other Form fields</h2>
        <DefaultOptions options={this.props.fieldTypes} />
      </div>
    )
  }
}

export default DroppableFieldsOptions

